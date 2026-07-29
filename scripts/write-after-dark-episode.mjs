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
        process.env.AFTER_DARK_MODEL
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
            process.env.AFTER_DARK_REQUEST_GAP_MS
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

    const elapsed =
        Date.now()
        -
        lastModelRequestAt;


    const remaining =
        REQUEST_GAP_MS
        -
        elapsed;


    if (
        remaining > 0
    ) {

        console.log(
            `Waiting ${Math.ceil(
                remaining / 1000
            )}s before the next After Dark model request...`
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
            "GitHub Models returned no After Dark content."
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
            `After Dark model returned malformed JSON: ${error.message}`
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
    maxTokens = 2600
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
                0.72,


            frequency_penalty:
                0.2,


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
                `After Dark network error. Waiting ${Math.ceil(
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
                `After Dark rate limit hit. Waiting ${Math.ceil(
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
                `After Dark model server error ${response.status}. Waiting ${Math.ceil(
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
    maxTokens = 2600
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
                error instanceof ModelJsonError
            )
        ) {

            throw error;

        }


        console.log(
            "After Dark model returned malformed JSON. Waiting before one clean retry..."
        );


        await sleep(
            15000
        );


        return await callModel(
            systemPrompt,
            `${userPrompt}

RETRY CORRECTION:

Return one valid JSON object only.

Do not use markdown fences.

Do not include explanations outside the JSON.

Complete every required field.`,
            maxTokens
        );

    }

}


// =================================
// WRITING PROMPT
// =================================


const writingSystemPrompt = `

You are the writing team for OWL AFTER DARK, the weekly post-show programme covering OWL Ascension and OWL Revolt together.

VOICE:

- Fast, polished, intelligent wrestling television analysis.
- Confident without pretending to possess backstage information.
- Energetic, sharp, and concise.
- Treat Ascension and Revolt as equal halves of one OWL week.
- Do not sound like corporate advertising.
- Do not write dialogue between hosts.
- Do not mention being an AI.

FACT DISCIPLINE:

- The supplied structured package is canon.
- Recorded segment summaries are canon and may be paraphrased.
- Never invent exact dialogue, physical actions, moves, near falls, crowd behaviour, motivations, alliances, injuries, contracts, backstage events, future booking, or consequences.
- Match results, ratings, and star ratings may support comparison and analysis of importance.
- Ratings do not prove specific match pacing, psychology, chemistry, sequences, atmosphere, or audience reaction.
- Innanet posts are public reactions and opinions, not objective fact.
- Historical memory may support real comparisons but does not prove why something happened.
- Prior After Dark episodes are editorial memory, not new factual evidence.
- Do not create title changes. The system adds verified title changes separately.

EDITORIAL REQUIREMENTS:

- The headline should capture the strongest verified theme connecting the week.
- The deck should introduce the full episode in 2 or 3 sentences.
- Write one substantial paragraph for Ascension and one for Revolt.
- Match of the Week is selected by the system from the supplied verified candidates.
- Analyze Match of the Week's importance without inventing what happened move-by-move.
- Story Fallout should contain zero to four supported developments.
- Power Shifts should contain zero to four supported changes in standing, momentum, title position, streak, or public perception.
- A quiet week may use empty arrays rather than manufacturing developments.
- The closing note should be a strong final paragraph looking back at the verified week.
- Do not invent next week's booking.

RETURN JSON ONLY:

{
  "headline": "",
  "deck": "",
  "ascensionSummary": "",
  "revoltSummary": "",
  "matchOfWeekSummary": "",
  "storyFallout": [
    {
      "title": "",
      "body": ""
    }
  ],
  "powerShifts": [
    {
      "title": "",
      "body": ""
    }
  ],
  "closingNote": ""
}

`;


// =================================
// FACTUAL AUDIT PROMPT
// =================================


const auditSystemPrompt = `

You are the factual editor for OWL AFTER DARK.

Rewrite the supplied draft only where necessary so every factual claim is supported by the supplied structured package.

RULES:

- Preserve strong style and analysis.
- Remove invented moves, sequences, dialogue, crowd behaviour, backstage information, motives, causes, injuries, contracts, future matches, and future consequences.
- Do not describe Innanet opinion as objective fact.
- Do not claim a rating proves specific in-ring details.
- Do not add title changes.
- Verified title changes are inserted separately by the system.
- Keep Story Fallout and Power Shifts at zero to four entries each.
- Keep every required top-level field.

RETURN JSON ONLY with exactly this shape:

{
  "headline": "",
  "deck": "",
  "ascensionSummary": "",
  "revoltSummary": "",
  "matchOfWeekSummary": "",
  "storyFallout": [
    {
      "title": "",
      "body": ""
    }
  ],
  "powerShifts": [
    {
      "title": "",
      "body": ""
    }
  ],
  "closingNote": ""
}

`;


// =================================
// PROMPT PACKAGE
// =================================


function buildPromptPackage(
    weekPackage
) {

    return {

        identity: {

            id:
                weekPackage.id,

            episode:
                weekPackage.episode,

            airDate:
                weekPackage.airDate,

            week:
                weekPackage.week

        },


        rules:
            weekPackage.rules,


        ascension:
            weekPackage.ascension,


        revolt:
            weekPackage.revolt,


        combined:
            weekPackage.combined,


        mediaMemory: {

            innanetReaction:

                array(
                    weekPackage
                        ?.mediaMemory
                        ?.innanetReaction
                ).slice(
                    0,
                    18
                ),


            priorAfterDarkEpisodes:

                array(
                    weekPackage
                        ?.mediaMemory
                        ?.priorAfterDarkEpisodes
                ).slice(
                    0,
                    4
                )

        },


        worldHistoryMemory:

            weekPackage.worldHistoryMemory

            ||

            {

                months:
                    [],

                entityHistories:
                    [],

                companyHistory:
                    []

            },


        selectedMatchOfWeek:

            array(
                weekPackage
                    ?.combined
                    ?.matchOfWeekCandidates
            )[0]

            ||

            null

    };

}


// =================================
// GENERATED COPY CLEANUP
// =================================


function cleanEntries(
    entries
) {

    return array(
        entries
    )
        .slice(
            0,
            4
        )
        .map(
            entry => ({

                title:

                    cleanText(
                        entry?.title,
                        140
                    ),


                body:

                    cleanText(
                        entry?.body,
                        900
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
                180
            ),


        deck:

            cleanText(
                value?.deck,
                900
            ),


        ascensionSummary:

            cleanText(
                value?.ascensionSummary,
                1600
            ),


        revoltSummary:

            cleanText(
                value?.revoltSummary,
                1600
            ),


        matchOfWeekSummary:

            cleanText(
                value?.matchOfWeekSummary,
                1400
            ),


        storyFallout:

            cleanEntries(
                value?.storyFallout
            ),


        powerShifts:

            cleanEntries(
                value?.powerShifts
            ),


        closingNote:

            cleanText(
                value?.closingNote,
                1200
            )

    };

}


// =================================
// GENERATED COPY VALIDATION
// =================================


function validateGeneratedCopy(
    copy,
    hasMatchOfWeek
) {

    const required = [

        [
            "headline",
            copy.headline
        ],


        [
            "deck",
            copy.deck
        ],


        [
            "ascensionSummary",
            copy.ascensionSummary
        ],


        [
            "revoltSummary",
            copy.revoltSummary
        ],


        [
            "closingNote",
            copy.closingNote
        ]

    ];


    if (
        hasMatchOfWeek
    ) {

        required.push([

            "matchOfWeekSummary",

            copy.matchOfWeekSummary

        ]);

    }


    const missing =

        required
            .filter(
                (
                    [
                        ,
                        value
                    ]
                ) =>

                    !value
            )
            .map(
                (
                    [
                        field
                    ]
                ) =>

                    field
            );


    if (
        missing.length
    ) {

        throw new Error(
            `After Dark generated copy is missing: ${missing.join(", ")}.`
        );

    }

}


// =================================
// SAVED MATCH RESULT
// =================================


function savedResult(
    match
) {

    return {

        matchType:

            match?.matchType

            ||

            "MATCH",


        match:

            match?.match

            ||

            "Untitled Match",


        winner:

            match?.winner

            ||

            "—",


        rating:

            Number.isFinite(
                Number(
                    match?.rating
                )
            )

                ? Number(
                    match.rating
                )

                : null,


        stars:

            Number.isFinite(
                Number(
                    match?.stars
                )
            )

                ? Number(
                    match.stars
                )

                : null

    };

}


// =================================
// SAVED WEEKLY SHOW
// =================================


function savedShow(
    show,
    summary
) {

    return {

        eventId:

            show?.id

            ||

            "",


        name:

            show?.name

            ||

            "OWL Weekly Event",


        date:

            show?.date

            ||

            "",


        dateLabel:

            show?.label

            ||

            "",


        summary,


        results:

            array(
                show?.matches
            ).map(
                savedResult
            )

    };

}


// =================================
// VERIFIED TITLE CHANGES
// =================================


function savedTitleChanges(
    weekPackage
) {

    return array(
        weekPackage
            ?.combined
            ?.titleChanges
    ).map(
        change => ({

            title:

                change.championship

                ||

                "Championship Change",


            body:

                `${change.winner || "A new champion"} won the ${change.championship || "championship"} at ${change.eventName || "an OWL event"}.`

        })
    );

}


// =================================
// EPISODE RECORD
// =================================


function createEpisodeRecord(
    weekPackage,
    copy
) {

    const featuredMatch =

        array(
            weekPackage
                ?.combined
                ?.matchOfWeekCandidates
        )[0]

        ||

        null;


    return {

        id:
            weekPackage.id,


        episode:

            Number(
                weekPackage.episode
            ),


        airDate:
            weekPackage.airDate,


        label:
            weekPackage.label,


        coverageLabel:

            weekPackage.coverageLabel

            ||

            "ASCENSION + REVOLT",


        headline:
            copy.headline,


        deck:
            copy.deck,


        ascension:

            savedShow(
                weekPackage.ascension,
                copy.ascensionSummary
            ),


        revolt:

            savedShow(
                weekPackage.revolt,
                copy.revoltSummary
            ),


        matchOfWeek:

            featuredMatch

                ? {

                    eventId:

                        featuredMatch.eventId

                        ||

                        "",


                    eventName:

                        featuredMatch.eventName

                        ||

                        "OWL Event",


                    match:

                        featuredMatch.match

                        ||

                        "Untitled Match",


                    summary:

                        copy.matchOfWeekSummary,


                    rating:

                        Number.isFinite(
                            Number(
                                featuredMatch.rating
                            )
                        )

                            ? Number(
                                featuredMatch.rating
                            )

                            : null,


                    stars:

                        Number.isFinite(
                            Number(
                                featuredMatch.stars
                            )
                        )

                            ? Number(
                                featuredMatch.stars
                            )

                            : null

                }

                : null,


        titleChanges:

            savedTitleChanges(
                weekPackage
            ),


        storyFallout: [

            ...copy.storyFallout

        ],


        powerShifts: [

            ...copy.powerShifts

        ],


        closingNote:
            copy.closingNote

    };

}


// =================================
// ARCHIVE ENTRY
// =================================


function createArchiveEntry(
    episodeRecord
) {

    return {

        id:
            episodeRecord.id,


        episode:
            episodeRecord.episode,


        airDate:
            episodeRecord.airDate,


        label:
            episodeRecord.label,


        headline:
            episodeRecord.headline,


        file:

            `data/after-dark/${episodeRecord.id}.json`

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

        "data/after-dark/generation-queue.json",

        {

            pendingWeekCount:
                0,

            pendingWeeks:
                []

        }

    ),


    readJson(

        "data/after-dark/archive-index.json",

        {

            version:
                1,

            episodes:
                []

        }

    )

]);


const existingEpisodes =

    array(
        archiveIndex.episodes
    );


const existingIds =

    new Set(

        existingEpisodes.map(

            episode =>
                episode.id

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

                !existingIds.has(
                    weekPackage.id
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
        "No unpublished After Dark weeks are available."
    );


    process.exit(
        0
    );

}


// =================================
// GENERATE EPISODES
// =================================


const newArchiveEntries =
    [];


for (
    const weekPackage of pendingWeeks
) {

    console.log(
        `Generating After Dark Episode ${weekPackage.episode} for ${weekPackage.airDate}...`
    );


    const promptPackage =

        buildPromptPackage(
            weekPackage
        );


    const draft =

        await callModelSafely(

            writingSystemPrompt,

            `Write the complete OWL After Dark episode copy from this verified weekly package.

${JSON.stringify(
    promptPackage,
    null,
    2
)}`

        );


    const cleanedDraft =

        cleanGeneratedCopy(
            draft
        );


    validateGeneratedCopy(

        cleanedDraft,

        Boolean(
            promptPackage.selectedMatchOfWeek
        )

    );


    const audited =

        await callModelSafely(

            auditSystemPrompt,

            `Audit and, where needed, rewrite this OWL After Dark draft against the verified weekly package.

VERIFIED PACKAGE:

${JSON.stringify(
    promptPackage,
    null,
    2
)}

DRAFT TO AUDIT:

${JSON.stringify(
    cleanedDraft,
    null,
    2
)}`

        );


    const finalCopy =

        cleanGeneratedCopy(
            audited
        );


    validateGeneratedCopy(

        finalCopy,

        Boolean(
            promptPackage.selectedMatchOfWeek
        )

    );


    const episodeRecord =

        createEpisodeRecord(
            weekPackage,
            finalCopy
        );


    const archiveEntry =

        createArchiveEntry(
            episodeRecord
        );


    await writeJson(

        archiveEntry.file,

        episodeRecord

    );


    newArchiveEntries.push(
        archiveEntry
    );


    existingIds.add(
        archiveEntry.id
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


    episodes: [

        ...existingEpisodes,

        ...newArchiveEntries

    ]
        .filter(
            (
                episode,
                index,
                entries
            ) =>

                entries.findIndex(
                    candidate =>

                        candidate.id ===
                        episode.id
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
                    b.id || ""
                )
                    .localeCompare(
                        String(
                            a.id || ""
                        )
                    )
        )

};


await writeJson(

    "data/after-dark/archive-index.json",

    updatedArchive

);


console.log(
    `Published ${newArchiveEntries.length} OWL After Dark episode(s).`
);
