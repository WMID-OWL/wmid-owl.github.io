import fs from "node:fs/promises";
import path from "node:path";


const ROOT =
    process.cwd();


const TOKEN =
    String(
        process.env.GITHUB_TOKEN || ""
    ).trim();


const MODEL =
    String(

        process.env.SUNDAY_DISSERVICE_MODEL

        ||

        "openai/gpt-4o-mini"

    ).trim();


const MAX_WEEKS =

    Math.max(

        1,

        Number(
            process.env.MAX_WEEKS || 1
        )

    );


const REQUEST_GAP_MS =

    Math.max(

        5000,

        Number(

            process.env
                .SUNDAY_DISSERVICE_REQUEST_GAP_MS

            ||

            20000

        )

    );


const ENDPOINT =

    "https://models.github.ai/inference/chat/completions";


const MAX_RATE_LIMIT_RETRIES =
    4;


const MAX_SERVER_RETRIES =
    3;


let lastModelRequestAt =
    0;



if (
    !TOKEN
) {


    throw new Error(

        "GITHUB_TOKEN is missing."

    );

}



// =================================
// BASIC HELPERS
// =================================


function array(
    value
) {


    return Array.isArray(
        value
    )

        ? value

        : [];

}



function cleanText(
    value,
    maxLength = 4000
) {


    return String(
        value || ""
    )
        .trim()
        .slice(
            0,
            maxLength
        );

}



function sleep(
    milliseconds
) {


    return new Promise(

        resolve =>

            setTimeout(
                resolve,
                milliseconds
            )

    );

}



async function waitForRequestSlot() {


    const remaining =

        REQUEST_GAP_MS

        -

        (
            Date.now()

            -

            lastModelRequestAt
        );


    if (
        remaining > 0
    ) {


        console.log(

            `Waiting ${Math.ceil(

                remaining / 1000

            )}s before the next Sunday Disservice model request...`

        );


        await sleep(
            remaining
        );

    }

}



// =================================
// JSON HELPERS
// =================================


async function readJson(
    relativePath,
    fallback = undefined
) {


    const fullPath =

        path.join(
            ROOT,
            relativePath
        );


    try {


        return JSON.parse(

            await fs.readFile(
                fullPath,
                "utf8"
            )

        );

    }


    catch (
        error
    ) {


        if (
            fallback !== undefined

            &&

            error.code === "ENOENT"
        ) {


            return fallback;

        }


        throw new Error(

            `Could not read ${relativePath}: ${error.message}`

        );

    }

}



async function writeJson(
    relativePath,
    value
) {


    const fullPath =

        path.join(
            ROOT,
            relativePath
        );


    await fs.mkdir(

        path.dirname(
            fullPath
        ),

        {
            recursive:
                true
        }

    );


    await fs.writeFile(

        fullPath,

        `${JSON.stringify(

            value,

            null,

            2

        )}\n`,

        "utf8"

    );

}



// =================================
// MODEL RESPONSE
// =================================


class ModelJsonError extends Error {


    constructor(
        message
    ) {


        super(
            message
        );


        this.name =
            "ModelJsonError";

    }

}



function parseModelJson(
    content
) {


    const cleaned =

        String(
            content || ""
        )

            .replace(
                /^```json\s*/i,
                ""
            )

            .replace(
                /^```\s*/i,
                ""
            )

            .replace(
                /```\s*$/i,
                ""
            )

            .trim();


    if (
        !cleaned
    ) {


        throw new ModelJsonError(

            "GitHub Models returned no Sunday Disservice content."

        );

    }


    try {


        return JSON.parse(
            cleaned
        );

    }


    catch (
        error
    ) {


        throw new ModelJsonError(

            `Sunday Disservice model returned malformed JSON: ${error.message}`

        );

    }

}



function retryDelayFromHeaders(
    response,
    attempt
) {


    const retryAfter =

        response.headers.get(
            "retry-after"
        );


    if (
        retryAfter
    ) {


        const seconds =

            Number(
                retryAfter
            );


        if (
            Number.isFinite(
                seconds
            )
        ) {


            return Math.max(

                1000,

                seconds * 1000

            );

        }


        const retryDate =

            Date.parse(
                retryAfter
            );


        if (
            Number.isFinite(
                retryDate
            )
        ) {


            return Math.max(

                1000,

                retryDate

                -

                Date.now()

            );

        }

    }


    const reset =

        Number(

            response.headers.get(
                "x-ratelimit-reset"
            )

            ||

            0

        );


    if (
        Number.isFinite(
            reset
        )

        &&

        reset > 0
    ) {


        return Math.max(

            1000,

            (
                reset * 1000
            )

            -

            Date.now()

            +

            2000

        );

    }


    return Math.min(

        180000,

        30000

        *

        (
            2 ** attempt
        )

    );

}



async function callModel(
    systemPrompt,
    userPrompt,
    maxTokens = 1800
) {


    const requestBody =

        JSON.stringify({


            model:
                MODEL,


            messages: [


                {
                    role:
                        "system",

                    content:
                        systemPrompt
                },


                {
                    role:
                        "user",

                    content:
                        userPrompt
                }


            ],


            response_format: {

                type:
                    "json_object"

            },


            temperature:
                0.76,


            frequency_penalty:
                0.25,


            max_tokens:
                maxTokens


        });


    let rateLimitAttempt =
        0;


    let serverAttempt =
        0;


    while (
        true
    ) {


        await waitForRequestSlot();


        lastModelRequestAt =
            Date.now();


        let response;


        try {


            response =

                await fetch(

                    ENDPOINT,

                    {

                        method:
                            "POST",


                        headers: {

                            Accept:
                                "application/vnd.github+json",

                            Authorization:
                                `Bearer ${TOKEN}`,

                            "X-GitHub-Api-Version":
                                "2022-11-28",

                            "Content-Type":
                                "application/json"

                        },


                        body:
                            requestBody

                    }

                );

        }


        catch (
            error
        ) {


            if (
                serverAttempt >=
                    MAX_SERVER_RETRIES
            ) {


                throw error;

            }


            const delay =

                Math.min(

                    120000,

                    15000

                    *

                    (
                        2 ** serverAttempt
                    )

                );


            serverAttempt +=
                1;


            console.log(

                `Sunday Disservice network error. Waiting ${Math.ceil(

                    delay / 1000

                )}s before retry...`

            );


            await sleep(
                delay
            );


            continue;

        }


        const raw =

            await response.text();


        if (
            response.ok
        ) {


            const envelope =

                JSON.parse(
                    raw
                );


            const content =

                envelope
                    ?.choices
                    ?.[0]
                    ?.message
                    ?.content;


            return parseModelJson(
                content
            );

        }


        if (
            response.status === 429

            &&

            rateLimitAttempt <
                MAX_RATE_LIMIT_RETRIES
        ) {


            const delay =

                retryDelayFromHeaders(

                    response,

                    rateLimitAttempt

                );


            rateLimitAttempt +=
                1;


            console.log(

                `Sunday Disservice rate limit hit. Waiting ${Math.ceil(

                    delay / 1000

                )}s before retry ${rateLimitAttempt} of ${MAX_RATE_LIMIT_RETRIES}...`

            );


            await sleep(
                delay
            );


            continue;

        }


        if (
            response.status >= 500

            &&

            serverAttempt <
                MAX_SERVER_RETRIES
        ) {


            const delay =

                Math.min(

                    120000,

                    15000

                    *

                    (
                        2 ** serverAttempt
                    )

                );


            serverAttempt +=
                1;


            console.log(

                `Sunday Disservice model server error ${response.status}. Waiting ${Math.ceil(

                    delay / 1000

                )}s before retry...`

            );


            await sleep(
                delay
            );


            continue;

        }


        throw new Error(

            `GitHub Models request failed (${response.status}): ${raw}`

        );

    }

}



async function callModelSafely(
    systemPrompt,
    userPrompt,
    maxTokens = 1800
) {


    try {


        return await callModel(

            systemPrompt,

            userPrompt,

            maxTokens

        );

    }


    catch (
        error
    ) {


        if (
            !(
                error instanceof
                    ModelJsonError
            )
        ) {


            throw error;

        }


        console.log(

            "Sunday Disservice model returned malformed JSON. Waiting before one clean retry..."

        );


        await sleep(
            15000
        );


        return callModel(

            systemPrompt,

            `${userPrompt}

RETRY CORRECTION:

Return one valid JSON object only.
Do not use markdown fences.
Do not include explanations outside the JSON.
Complete every required field and close every object and array.`,

            maxTokens

        );

    }

}



// =================================
// WRITING PROMPT
// =================================


const writingSystemPrompt = `

You are Trey Wise, host of SUNDAY DISSERVICE: THE GOSPEL ACCORDING TO TREY WISE.

The supplied host profile defines your permanent personality, voice, habits, boundaries, and sermon identity. Follow it closely.

VOICE:

- Write in Trey's first-person voice.
- The supplied host profile is the source of truth for Trey's personality, speech patterns, tone, and verbal habits. Do not override it with a more formal or polished presentation.
- Trey is a young Black wrestling analyst who speaks naturally, casually, and confidently. His intelligence should come through in the strength of his argument rather than formal vocabulary.
- Trey may naturally use AAVE, conversational grammar, contractions, sentence fragments, dropped final g sounds such as thinkin', talkin', and sayin', and expressions such as ain't, y'all, nah, tryna, gotta, finna, and similar language when they fit his delivery.
- Do not force AAVE, slang, or dropped endings into every sentence. Trey should sound like one consistent person, not somebody performing a dialect.
- Never use exaggerated phonetic spelling or racial caricature.
- Trey may swear occasionally when the reaction genuinely calls for it. Profanity should feel conversational rather than inserted for shock value.
- Trey can be funny, sarcastic, irritated, dismissive, excited, incredulous, stubborn, or smug while still making a coherent argument.
- Treat conclusions like settled doctrine, but support them with verified evidence.
- Challenge popular readings when a defensible alternative exists.
- Trey may directly address the congregation or challenge what the audience thinks it saw.
- Use church and sermon language selectively. It frames Trey's ego and certainty; it is not a preacher gimmick.
- Do not sound like corporate promotion, a generic recap, a formal cable-news analyst, a parody preacher, or an AI.
- Do not write dialogue for another host.

FACT DISCIPLINE:

- The supplied structured weekly package is wrestling canon.
- Recorded segment summaries may be paraphrased and analyzed.
- Never invent exact dialogue, physical actions, attacks, moves, near falls, crowd behavior, backstage information, motivations, alliances, injuries, contracts, future matches, title plans, signings, releases, returns, or consequences.
- A result, rating, star rating, finish, or match type does not prove specific pacing, psychology, chemistry, atmosphere, sequences, or crowd reaction.
- Innanet posts are public reaction and opinion, not objective fact.
- OWL After Dark is editorial analysis, not additional wrestling canon.
- Prior sermons establish Trey's previous opinions, predictions, favorites, blind spots, contradictions, and rhetorical habits. They do not establish new wrestling facts.
- Historical memory may support real comparisons. Never invent the cause of a rise, fall, streak, title change, or public reaction.
- Never fabricate quotes or anonymous sources.

EDITORIAL REQUIREMENTS:

- Choose one central argument that gives the sermon a purpose.
- The headline should be sharp and memorable.
- The deck should be a forceful opening declaration in 2 or 3 sentences.
- The main argument must contain 3 to 6 substantial paragraphs.
- Cover the strongest verified developments from the full Monday-through-Sunday week, including any PPV or special event when present.
- Praise may contain zero to four supported entries.
- Condemnation may contain zero to four supported entries.
- Favorites may contain zero to three entries, but only when prior published behavior or repeated evidence supports a genuine recurring preference. Do not manufacture a favorite from one isolated week.
- Blind spots may contain zero to three entries, but only when prior sermons establish a recurring contradiction, weak prediction, unfair standard, or bias. Do not invent a blind spot for the first sermon.
- Trey may reluctantly concede that he underestimated someone while preserving as much of his earlier argument as the verified record allows.
- Predictions must be clearly framed as predictions, expectations, questions, or personal judgments.
- A quiet category should use an empty array instead of manufactured controversy.
- The closing word should finish the central argument without inventing future canon.

RETURN JSON ONLY:

{
  "headline": "",
  "deck": "",
  "argument": {
    "title": "",
    "body": [
      "paragraph one",
      "paragraph two",
      "paragraph three"
    ]
  },
  "praise": [
    {
      "title": "",
      "body": ""
    }
  ],
  "condemnation": [
    {
      "title": "",
      "body": ""
    }
  ],
  "favorites": [
    {
      "title": "",
      "body": ""
    }
  ],
  "blindSpots": [
    {
      "title": "",
      "body": ""
    }
  ],
  "closingWord": ""
}

`;



// =================================
// FACTUAL AUDIT PROMPT
// =================================


const auditSystemPrompt = `

You are the factual and continuity editor for SUNDAY DISSERVICE.

Audit the supplied Trey Wise sermon against the verified weekly package, host profile, and prior-sermon memory.

Preserve Trey's strong voice, ego, arguments, humor, bias, selective sermon language, and editorial personality wherever the facts allow.

CORRECTION RULES:

- Remove or rewrite unsupported match details, dialogue, physical actions, crowd behavior, backstage claims, motivations, causes, injuries, contracts, future booking, signings, releases, returns, title plans, and fabricated quotations.
- Do not treat Innanet opinion as objective fact.
- Do not treat OWL After Dark analysis as additional wrestling canon.
- Do not claim that ratings prove specific in-ring details.
- Keep predictions clearly framed as opinion or expectation.
- Remove any favorite that is not supported by repeated published behavior or prior evidence.
- Remove any blind spot that is not supported by prior sermons or a clearly documented contradiction.
- Do not make Trey randomly humble. A concession may remain reluctant and self-protective.
- Keep the main argument at 3 to 6 substantial paragraphs.
- Keep praise and condemnation at zero to four entries each.
- Keep favorites and blind spots at zero to three entries each.
- Preserve every required top-level field.

RETURN JSON ONLY with exactly this shape:

{
  "headline": "",
  "deck": "",
  "argument": {
    "title": "",
    "body": [
      "paragraph one",
      "paragraph two",
      "paragraph three"
    ]
  },
  "praise": [
    {
      "title": "",
      "body": ""
    }
  ],
  "condemnation": [
    {
      "title": "",
      "body": ""
    }
  ],
  "favorites": [
    {
      "title": "",
      "body": ""
    }
  ],
  "blindSpots": [
    {
      "title": "",
      "body": ""
    }
  ],
  "closingWord": ""
}

`;



// =================================
// PROMPT PACKAGE
// =================================


function compactPromptJson(
    value
) {


    return JSON.stringify(
        value
    );

}



function buildPromptPackage(
    weekPackage
) {


    const editorialMemory =

        weekPackage
            ?.mediaMemory
            ?.treyEditorialMemory

        ||

        {};


    const worldHistory =

        weekPackage.worldHistoryMemory

        ||

        {};


    return {


        identity: {

            id:
                weekPackage.id,

            sermon:
                weekPackage.sermon,

            deliveryDate:
                weekPackage.deliveryDate,

            label:
                weekPackage.label,

            host:
                weekPackage.host,

            week:
                weekPackage.week

        },


        hostProfile:
            weekPackage.hostProfile,


        rules:
            weekPackage.rules,


        weeklyCanon:
            weekPackage.weeklyCanon,


        mediaMemory: {

            afterDarkEpisode:

                weekPackage
                    ?.mediaMemory
                    ?.afterDarkEpisode

                ||

                null,


            innanetReaction:

                array(

                    weekPackage
                        ?.mediaMemory
                        ?.innanetReaction

                ).slice(
                    0,
                    12
                ),


            priorSermons:

                array(

                    weekPackage
                        ?.mediaMemory
                        ?.priorSermons

                ).slice(
                    0,
                    3
                ),


            treyEditorialMemory: {

                sermonCount:

                    Number(
                        editorialMemory.sermonCount || 0
                    ),

                previousClaims:

                    array(
                        editorialMemory.previousClaims
                    ).slice(
                        0,
                        4
                    ),

                favoritesEvidence:

                    array(
                        editorialMemory.favoritesEvidence
                    ).slice(
                        0,
                        8
                    ),

                blindSpotEvidence:

                    array(
                        editorialMemory.blindSpotEvidence
                    ).slice(
                        0,
                        8
                    ),

                rule:
                    editorialMemory.rule || ""

            }

        },


        worldHistoryMemory: {

            months:

                array(
                    worldHistory.months
                ).slice(
                    0,
                    3
                ),

            entityHistories:

                array(
                    worldHistory.entityHistories
                ).slice(
                    0,
                    8
                ),

            companyHistory:

                array(
                    worldHistory.companyHistory
                ).slice(
                    0,
                    4
                )

        }

    };

}



function buildAuditPackage(
    promptPackage
) {


    const editorialMemory =

        promptPackage
            ?.mediaMemory
            ?.treyEditorialMemory

        ||

        {};


    return {


                identity:
            promptPackage.identity,


        hostProfile:
            promptPackage.hostProfile,


        rules:
            promptPackage.rules,

        weeklyCanon:
            promptPackage.weeklyCanon,


        mediaMemory: {

            afterDarkEpisode:

                promptPackage
                    ?.mediaMemory
                    ?.afterDarkEpisode

                ||

                null,


            innanetReaction:

                array(

                    promptPackage
                        ?.mediaMemory
                        ?.innanetReaction

                ).slice(
                    0,
                    8
                ),


            priorSermons:

                array(

                    promptPackage
                        ?.mediaMemory
                        ?.priorSermons

                ).slice(
                    0,
                    2
                ),


            treyEditorialMemory: {

                sermonCount:

                    Number(
                        editorialMemory.sermonCount || 0
                    ),

                previousClaims:

                    array(
                        editorialMemory.previousClaims
                    ).slice(
                        0,
                        3
                    ),

                favoritesEvidence:

                    array(
                        editorialMemory.favoritesEvidence
                    ).slice(
                        0,
                        6
                    ),

                blindSpotEvidence:

                    array(
                        editorialMemory.blindSpotEvidence
                    ).slice(
                        0,
                        6
                    ),

                rule:
                    editorialMemory.rule || ""

            }

        }

    };

}



// =================================
// GENERATED COPY CLEANUP
// =================================


function cleanParagraphs(
    paragraphs
) {


    return array(
        paragraphs
    )

        .slice(
            0,
            6
        )

        .map(

            paragraph =>

                cleanText(
                    paragraph,
                    1800
                )

        )

        .filter(
            Boolean
        );

}



function cleanEntries(
    entries,
    maximum
) {


    return array(
        entries
    )

        .slice(
            0,
            maximum
        )

        .map(

            entry => ({

                title:

                    cleanText(
                        entry?.title,
                        160
                    ),

                body:

                    cleanText(
                        entry?.body,
                        1000
                    )

            })

        )

        .filter(

            entry =>

                entry.title

                &&

                entry.body

        );

}



function cleanGeneratedCopy(
    value
) {


    return {


        headline:

            cleanText(
                value?.headline,
                190
            ),


        deck:

            cleanText(
                value?.deck,
                1000
            ),


        argument: {

            title:

                cleanText(
                    value?.argument?.title,
                    190
                ),

            body:

                cleanParagraphs(
                    value?.argument?.body
                )

        },


        praise:

            cleanEntries(
                value?.praise,
                4
            ),


        condemnation:

            cleanEntries(
                value?.condemnation,
                4
            ),


        favorites:

            cleanEntries(
                value?.favorites,
                3
            ),


        blindSpots:

            cleanEntries(
                value?.blindSpots,
                3
            ),


        closingWord:

            cleanText(
                value?.closingWord,
                1400
            )

    };

}



// =================================
// GENERATED COPY VALIDATION
// =================================


function validateGeneratedCopy(
    copy
) {


    const missing =
        [];


    if (
        !copy.headline
    ) {


        missing.push(
            "headline"
        );

    }


    if (
        !copy.deck
    ) {


        missing.push(
            "deck"
        );

    }


    if (
        !copy.argument.title
    ) {


        missing.push(
            "argument.title"
        );

    }


    if (
        copy.argument.body.length < 3
    ) {


        missing.push(
            "at least three argument paragraphs"
        );

    }


    if (
        !copy.closingWord
    ) {


        missing.push(
            "closingWord"
        );

    }


    if (
        missing.length
    ) {


        throw new Error(

            `Sunday Disservice generated copy is missing: ${missing.join(
                ", "
            )}.`

        );

    }

}



// =================================
// VERIFIED REFERENCES
// =================================


function createReferences(
    weekPackage,
    copy
) {


    const references =
        [];


    const seen =
        new Set();


    function addReference(
        reference
    ) {


        const key =

            `${reference.type}|${reference.label}`;


        if (
            seen.has(
                key
            )
        ) {


            return;

        }


        seen.add(
            key
        );


        references.push(
            reference
        );

    }


    array(

        weekPackage
            ?.weeklyCanon
            ?.events

    )

        .slice(
            0,
            4
        )

        .forEach(

            event => {


                if (
                    !event?.id

                    ||

                    !event?.name
                ) {


                    return;

                }


                addReference({

                    type:
                        "EVENT",

                    label:
                        event.name,

                    href:

                        `event.html?id=${encodeURIComponent(

                            event.id

                        )}`

                });

            }

        );


    const searchable =

        JSON.stringify(
            copy
        )
            .toLowerCase();


    array(

        weekPackage
            ?.weeklyCanon
            ?.summary
            ?.participantDirectory

    )

        .filter(

            participant => {


                const name =

                    String(
                        participant?.name || ""
                    )
                        .trim();


                return (

                    participant?.id

                    &&

                    name.length >= 3

                    &&

                    searchable.includes(
                        name.toLowerCase()
                    )

                );

            }

        )

        .slice(
            0,
            8
        )

        .forEach(

            participant => {


                addReference({

                    type:
                        "WRESTLER",

                    label:
                        participant.name,

                    href:

                        `wrestler.html?id=${encodeURIComponent(

                            participant.id

                        )}`

                });

            }

        );


    return references.slice(
        0,
        12
    );

}



// =================================
// SERMON AND ARCHIVE RECORDS
// =================================


function createSermonRecord(
    weekPackage,
    copy
) {


    return {


        id:
            weekPackage.id,


        sermon:

            Number(
                weekPackage.sermon
            ),


        deliveryDate:
            weekPackage.deliveryDate,


        label:
            weekPackage.label,


        host:

            weekPackage.host

            ||

            "Trey Wise",


        headline:
            copy.headline,


        deck:
            copy.deck,


        argument: {

            title:
                copy.argument.title,

            body: [
                ...copy.argument.body
            ]

        },


        praise: [
            ...copy.praise
        ],


        condemnation: [
            ...copy.condemnation
        ],


        favorites: [
            ...copy.favorites
        ],


        blindSpots: [
            ...copy.blindSpots
        ],


        references:

            createReferences(
                weekPackage,
                copy
            ),


        closingWord:
            copy.closingWord

    };

}



function createArchiveEntry(
    sermonRecord
) {


    return {


        id:
            sermonRecord.id,


        sermon:
            sermonRecord.sermon,


        deliveryDate:
            sermonRecord.deliveryDate,


        label:
            sermonRecord.label,


        headline:
            sermonRecord.headline,


        file:

            `data/sunday-disservice/${sermonRecord.id}.json`

    };

}



// =================================
// LOAD QUEUE AND ARCHIVE
// =================================


const [

    queue,

    archiveIndex

] = await Promise.all([


    readJson(

        "data/sunday-disservice/generation-queue.json",

        {

            pendingWeekCount:
                0,

            pendingWeeks:
                []

        }

    ),


    readJson(

        "data/sunday-disservice/archive-index.json",

        {

            version:
                1,

            sermons:
                []

        }

    )

]);


const existingSermons =

    array(
        archiveIndex.sermons
    );


const existingIds =

    new Set(

        existingSermons.map(

            sermon =>
                sermon.id

        )

    );


const existingNumbers =

    new Set(

        existingSermons

            .map(

                sermon =>

                    Number(
                        sermon.sermon
                    )

            )

            .filter(
                Number.isFinite
            )

    );


const pendingWeeks =

    array(
        queue.pendingWeeks
    )

        .filter(

            weekPackage =>

                weekPackage?.id

                &&

                Number.isInteger(

                    Number(
                        weekPackage.sermon
                    )

                )

                &&

                !existingIds.has(
                    weekPackage.id
                )

                &&

                !existingNumbers.has(

                    Number(
                        weekPackage.sermon
                    )

                )

        )

        .slice(
            0,
            MAX_WEEKS
        );


if (
    !pendingWeeks.length
) {


    console.log(

        "No unpublished Sunday Disservice weeks are available."

    );


    process.exit(
        0
    );

}



// =================================
// GENERATE SERMONS
// =================================


const newArchiveEntries =
    [];


for (
    const weekPackage of pendingWeeks
) {


    console.log(

        `Generating Sunday Disservice Sermon ${weekPackage.sermon} for ${weekPackage.deliveryDate}...`

    );


    const promptPackage =

        buildPromptPackage(
            weekPackage
        );


    const auditPackage =

        buildAuditPackage(
            promptPackage
        );


    const draft =

        await callModelSafely(

            writingSystemPrompt,

            `Write the complete Sunday Disservice sermon from this verified weekly package.

${compactPromptJson(
    promptPackage
)}`,

            1800

        );


    const cleanedDraft =

        cleanGeneratedCopy(
            draft
        );


    validateGeneratedCopy(
        cleanedDraft
    );


    const audited =

        await callModelSafely(

            auditSystemPrompt,

            `Audit and, where needed, rewrite this Sunday Disservice sermon against the verified package and Trey Wise continuity.

VERIFIED PACKAGE:

${compactPromptJson(
    auditPackage
)}

SERMON TO AUDIT:

${compactPromptJson(
    cleanedDraft
)}`,

            1600

        );


    const finalCopy =

        cleanGeneratedCopy(
            audited
        );


    validateGeneratedCopy(
        finalCopy
    );


    const sermonRecord =

        createSermonRecord(

            weekPackage,

            finalCopy

        );


    const archiveEntry =

        createArchiveEntry(
            sermonRecord
        );


    await writeJson(

        archiveEntry.file,

        sermonRecord

    );


    newArchiveEntries.push(
        archiveEntry
    );


    existingIds.add(
        archiveEntry.id
    );


    existingNumbers.add(
        archiveEntry.sermon
    );


    console.log(

        `Published ${archiveEntry.file}.`

    );

}



// =================================
// UPDATE ARCHIVE INDEX
// =================================


const updatedArchive = {


    version:

        Number(
            archiveIndex.version || 1
        ),


    sermons: [

        ...existingSermons,

        ...newArchiveEntries

    ]

        .filter(

            (
                sermon,
                index,
                entries
            ) =>

                entries.findIndex(

                    candidate =>

                        candidate.id ===
                        sermon.id

                )

                ===

                index

        )

        .sort(

            (
                a,
                b
            ) =>

                String(

                    b.deliveryDate

                    ||

                    b.id

                    ||

                    ""

                )

                    .localeCompare(

                        String(

                            a.deliveryDate

                            ||

                            a.id

                            ||

                            ""

                        )

                    )

        )

};


await writeJson(

    "data/sunday-disservice/archive-index.json",

    updatedArchive

);


console.log(

    `Published ${newArchiveEntries.length} Sunday Disservice sermon(s).`

);
