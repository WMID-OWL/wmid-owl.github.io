import fs from "node:fs/promises";
import path from "node:path";


const ROOT =
    process.cwd();


const TOKEN =

    String(
        process.env.GITHUB_TOKEN || ""
    )
        .trim();


const MAX_PULSES =

    Math.max(

        1,

        Number(
            process.env.MAX_PULSES || 1
        )

    );


const MODEL =

    String(

        process.env.LANDSCAPE_PULSE_MODEL

        ||

        "openai/gpt-4o-mini"

    )
        .trim();


const REQUEST_GAP_MS =

    Math.max(

        5000,

        Number(

            process.env
                .LANDSCAPE_PULSE_REQUEST_GAP_MS

            ||

            15000

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
// MODEL JSON ERROR
// =================================


class ModelJsonError
    extends Error {


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



// =================================
// WAIT HELPERS
// =================================


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
            )}s before the next model request...`

        );


        await sleep(
            remaining
        );

    }

}



// =================================
// RATE LIMIT DELAY
// =================================


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


        const dateValue =

            Date.parse(
                retryAfter
            );


        if (
            Number.isFinite(
                dateValue
            )
        ) {


            return Math.max(

                1000,

                dateValue

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

            error.code ===
            "ENOENT"

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
// CLEANUP HELPERS
// =================================


function clampInteger(
    value,
    min,
    max
) {


    const number =

        Number(
            value
        );


    if (
        !Number.isFinite(
            number
        )
    ) {


        return min;

    }


    return Math.max(

        min,

        Math.min(

            max,

            Math.round(
                number
            )

        )

    );

}



function cleanText(
    value,
    maxLength = 600
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



function normalizeAccountId(
    value
) {


    return cleanText(
        value,
        80
    )
        .replace(
            /^@+/,
            ""
        )
        .toLowerCase();

}



function monthLabel(
    id
) {


    const [

        year,
        month

    ] =

        String(
            id
        )
            .split(
                "-"
            )
            .map(
                Number
            );


    return new Date(

        Date.UTC(

            year,
            month - 1,
            1

        )

    )
        .toLocaleDateString(

            "en-US",

            {
                month:
                    "long",

                year:
                    "numeric",

                timeZone:
                    "UTC"
            }

        );

}// =================================
// PROMPT PACKAGE
// =================================


function compactAccount(
    account
) {


    return {


        id:
            account.id,


        accountName:
            account.accountName,


        handle:
            account.handle,


        archetype:
            account.archetype,


        tone:
            account.tone,


        focus:
            account.focus,


        profanityLevel:
            account.profanityLevel,


        factDiscipline:
            account.factDiscipline,


        replyStyle:
            account.replyStyle

    };

}



function compactBraggingMatch(
    match
) {


    return {


        entrantA:

            match.entrantA

                ? {

                    wrestlerName:

                        match.entrantA
                            .wrestlerName,

                    companyName:

                        match.entrantA
                            .companyName

                }

                : null,


        entrantB:

            match.entrantB

                ? {

                    wrestlerName:

                        match.entrantB
                            .wrestlerName,

                    companyName:

                        match.entrantB
                            .companyName

                }

                : null,


        winnerEntrantId:
            match.winnerEntrantId,


        resultText:
            match.resultText,


        rating:
            match.rating

    };

}



function compactBraggingDivision(
    division
) {


    const bracket =
        division?.bracket;


    if (
        !bracket
    ) {


        return {


            champion:
                division?.champion || null,


            finalist:
                division?.finalist || null,


            rounds:
                {}

        };

    }


    const roundKeys = [

        "roundOf16",
        "quarterfinals",
        "semifinals",
        "final"

    ];


    const rounds =
        {};


    roundKeys.forEach(

        roundKey => {


            rounds[
                roundKey
            ] =

                (

                    bracket
                        ?.rounds
                        ?.[roundKey]

                    ||

                    []

                )

                    .map(
                        compactBraggingMatch
                    );

        }

    );


    return {


        champion:

            division?.champion

            ||

            bracket.winner

            ||

            null,


        finalist:

            division?.finalist

            ||

            bracket.finalist

            ||

            null,


        rounds:
            rounds

    };

}



function buildPromptPackage(
    pulse
) {


    const base = {


        pulseId:
            pulse.pulseId,


        pulseType:
            pulse.pulseType,


        periodId:
            pulse.periodId,


        label:
            pulse.label,


        rules:
            pulse.rules,


        availableAccounts:

            (

                pulse.availableAccounts

                ||

                []

            )
                .map(
                    compactAccount
                )

    };


    if (
        pulse.pulseType ===
        "bragging-rights-special"
    ) {


        return {


            ...base,


            qualification:

                pulse.qualification
                    ?.companyOrder

                ||

                pulse.qualification

                ||

                null,


            men:

                compactBraggingDivision(
                    pulse.men
                ),


            women:

                compactBraggingDivision(
                    pulse.women
                ),


            trophies:
                pulse.trophies || {}

        };

    }


    return {


        ...base,


        companyRankings:
            pulse.companyRankings || [],


        showRankings:
            pulse.showRankings || [],


        companyMovement:
            pulse.companyMovement || [],


        showMovement:
            pulse.showMovement || [],


        majorEventBattle:
            pulse.majorEventBattle || [],


        topMatches:
            pulse.topMatches || [],


        honors:
            pulse.honors || {},


        championLedger:
            pulse.championLedger || [],


        universeDevelopments:
            pulse.universeDevelopments || []

    };

}



// =================================
// POST TARGETS
// =================================


function targetPostCount(
    pulse
) {


    return (

        pulse.pulseType ===
        "bragging-rights-special"

            ? 16

            : 12

    );

}



function batchCountForPulse(
    pulse
) {


    return (

        targetPostCount(
            pulse
        )

        /

        4

    );

}



// =================================
// SYSTEM PROMPT
// =================================


function buildSystemPrompt() {


    return `

You are the editorial engine for THE INNANET, a fictional wrestling social network.

Your job is to turn one wrestling-industry Landscape Pulse fact package into a believable social-media conversation.

VOICE:
- Write like genuinely different people.
- The six recurring industry accounts must sound distinct.
- Some accounts can be positive, negative, smug, excited, statistical, skeptical, or careful.
- Natural profanity is allowed only when the account profile permits it.
- Never use slurs or attack protected traits.
- Do not make threats.

CANON:
- Only facts supplied in the pulse package are canon.
- Never invent matches, results, ratings, rankings, movement values, title changes, signings, firings, contracts, injuries, retirements, backstage incidents, relationships, or quotes.
- Opinions, jokes, criticism, comparisons, and clearly labeled speculation are allowed.
- Rumor or speculation must use language such as "could", "might", "wondering", "speculation", or a question.
- Never turn speculation into fact.
- Never invent exact numbers.

LANDSCAPE:
- Landscape Score is the official competition metric.
- Company rankings and show rankings are separate layers.
- Major Event Battle is separate from weekly Show Power Rankings.
- Bragging Rights is a company-pride tournament with no championships at stake.

OUTPUT:
- Return EXACTLY 4 complete posts for each batch.
- Use only recurring accounts from availableAccounts.
- accountId must exactly match an availableAccounts id and must never include an @ symbol.
- Do not create wrestler posts.
- Include different viewpoints.
- Avoid repeating the same fact, joke, or wording.
- Replies are allowed when natural.
- Use stats and news accounts for factual framing when supported.
- Do not force every account into every batch.

RETURN JSON ONLY:

{
  "posts": [
    {
      "postId": "p01",
      "accountId": "wrestlingwire",
      "type": "news-report",
      "body": "post text",
      "replyTo": "",
      "likes": 0,
      "reposts": 0,
      "replies": 0
    }
  ]
}

Allowed type values:
fan-post
stats-post
news-report
opinion
rumor
satire

replyTo must be empty or match another postId created in the same batch.

`;

}



// =================================
// USER PROMPT
// =================================


function buildUserPrompt(
    pulse,
    batchNumber,
    totalBatches,
    previousPosts = [],
    retryInstruction = ""
) {


    return `

Generate batch ${batchNumber} of ${totalBatches} for this Innanet Landscape Industry Pulse.

Return EXACTLY 4 complete posts.

Do not summarize the package.
Create a believable wrestling conversation.
Do not repeat ideas or wording from previous posts.

${retryInstruction}

PREVIOUS POSTS:
${JSON.stringify(

    previousPosts

        .slice(
            -8
        )

        .map(

            post => ({

                accountId:
                    post.accountId,

                type:
                    post.type,

                body:

                    cleanText(
                        post.body,
                        220
                    )

            })

        )

)}

LANDSCAPE PULSE PACKAGE:
${JSON.stringify(
    buildPromptPackage(
        pulse
    )
)}

`;

}// =================================
// MODEL RESPONSE PARSER
// =================================


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

            "GitHub Models returned no message content."

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

            `Model returned malformed JSON: ${error.message}`

        );

    }

}



// =================================
// CALL MODEL
// =================================


async function callModel(

    pulse,
    batchNumber,
    totalBatches,
    previousPosts = [],
    retryInstruction = ""

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

                        buildSystemPrompt()
                },


                {
                    role:
                        "user",

                    content:

                        buildUserPrompt(

                            pulse,
                            batchNumber,
                            totalBatches,
                            previousPosts,
                            retryInstruction

                        )
                }


            ],


            response_format: {

                type:
                    "json_object"

            },


            temperature:
                0.9,


            frequency_penalty:
                0.4,


            max_tokens:
                1800

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


                throw new Error(

                    `GitHub Models network request failed: ${error.message}`

                );

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


            let envelope;


            try {


                envelope =

                    JSON.parse(
                        raw
                    );

            }


            catch (
                error
            ) {


                throw new Error(

                    `GitHub Models returned an invalid response envelope: ${error.message}`

                );

            }


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

            response.status ===
            429

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

                `Rate limit hit. Waiting ${Math.ceil(
                    delay / 1000
                )}s before retry...`

            );


            await sleep(
                delay
            );


            continue;

        }



        if (

            response.status >=
            500

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


// =================================
// BATCH VALIDATION
// =================================


function batchValidationIssues(
    posts,
    pulse
) {


    const allowedAccountIds =

        new Set(

            (

                pulse.availableAccounts

                ||

                []

            )

                .map(

                    account =>

                        account.id

                )

        );


    const issues =
        [];


    posts.forEach(

        (
            post,
            index
        ) => {


            const accountId =

    normalizeAccountId(
        post?.accountId
    );


            const body =

                cleanText(

                    post?.body,

                    600

                );


            if (
                !allowedAccountIds.has(
                    accountId
                )
            ) {


                issues.push(

                    `Post ${index + 1} used invalid accountId "${accountId}".`

                );

            }


            if (
                !body
            ) {


                issues.push(

                    `Post ${index + 1} has an empty body.`

                );

            }

        }

    );


    return issues;

}

// =================================
// GENERATE BATCH
// =================================


async function generateBatch(

    pulse,
    batchNumber,
    totalBatches,
    previousPosts

) {


    let result;


    try {


        result =

            await callModel(

                pulse,
                batchNumber,
                totalBatches,
                previousPosts

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


        await sleep(
            15000
        );


        result =

            await callModel(

                pulse,
                batchNumber,
                totalBatches,
                previousPosts.slice(
                    -4
                ),

                "RETRY: Return valid JSON with exactly 4 complete posts. No markdown or explanation."

            );

    }



    let batchPosts =

        Array.isArray(
            result?.posts
        )

            ? result.posts

            : [];



    if (
        batchPosts.length < 4
    ) {


        await sleep(
            15000
        );


        result =

            await callModel(

                pulse,
                batchNumber,
                totalBatches,
                previousPosts.slice(
                    -4
                ),

                `RETRY: Previous response had ${batchPosts.length} posts. Return exactly 4 complete posts.`

            );


        batchPosts =

            Array.isArray(
                result?.posts
            )

                ? result.posts

                : [];

    }



    if (
        batchPosts.length < 4
    ) {


        throw new Error(

            `Batch ${batchNumber} returned only ${batchPosts.length} posts after retry.`

        );

    }



        let selectedPosts =

        batchPosts.slice(
            0,
            4
        );


    let validationIssues =

        batchValidationIssues(

            selectedPosts,
            pulse

        );


    if (
        validationIssues.length > 0
    ) {


        const allowedAccountIds =

            (

                pulse.availableAccounts

                ||

                []

            )

                .map(

                    account =>

                        account.id

                )

                .join(
                    ", "
                );


        console.log(

            `Batch ${batchNumber} needs repair: ${validationIssues.join(
                " "
            )}`

        );


        await sleep(
            15000
        );


        result =

            await callModel(

                pulse,
                batchNumber,
                totalBatches,
                previousPosts.slice(
                    -4
                ),

                `RETRY: The previous batch contained invalid posts. Return exactly 4 complete posts. Every accountId MUST be one of these exact IDs: ${allowedAccountIds}. Every post must have a non-empty body. Problems found: ${validationIssues.join(
                    " "
                )}`

            );


        batchPosts =

            Array.isArray(
                result?.posts
            )

                ? result.posts

                : [];


        if (
            batchPosts.length < 4
        ) {


            throw new Error(

                `Batch ${batchNumber} repair returned only ${batchPosts.length} posts.`

            );

        }


        selectedPosts =

            batchPosts.slice(
                0,
                4
            );


        validationIssues =

            batchValidationIssues(

                selectedPosts,
                pulse

            );


        if (
            validationIssues.length > 0
        ) {


            throw new Error(

                `Batch ${batchNumber} remained invalid after repair: ${validationIssues.join(
                    " "
                )}`

            );

        }

    }


    const idMap =
        new Map();



    selectedPosts.forEach(

        (
            post,
            index
        ) => {


            const originalId =

                cleanText(
                    post.postId,
                    40
                )

                ||

                `p${String(
                    index + 1
                ).padStart(
                    2,
                    "0"
                )}`;


            const globalId =

                `p${String(

                    (
                        (
                            batchNumber - 1
                        )

                        *

                        4
                    )

                    +

                    index

                    +

                    1

                ).padStart(
                    2,
                    "0"
                )}`;


            idMap.set(

                originalId,
                globalId

            );

        }

    );



    return selectedPosts.map(

        (
            post,
            index
        ) => {


            const globalId =

                `p${String(

                    (
                        (
                            batchNumber - 1
                        )

                        *

                        4
                    )

                    +

                    index

                    +

                    1

                ).padStart(
                    2,
                    "0"
                )}`;


            const originalReplyTo =

                cleanText(
                    post.replyTo,
                    40
                );


            return {


    ...post,


    accountId:

        normalizeAccountId(
            post.accountId
        ),


    postId:
        globalId,


                replyTo:

                    idMap.get(
                        originalReplyTo
                    )

                    ||

                    originalReplyTo

            };

        }

    );

}// =================================
// VALIDATION
// =================================


function validatePosts(
    rawPosts,
    pulse
) {


    const target =

        targetPostCount(
            pulse
        );


    if (
        rawPosts.length !== target
    ) {


        throw new Error(

            `Writer assembled ${rawPosts.length} posts instead of ${target}; refusing to publish.`

        );

    }



    const accountMap =

        Object.fromEntries(

            (

                pulse.availableAccounts

                ||

                []

            )

                .map(

                    account => [

                        account.id,
                        account

                    ]

                )

        );



    const allowedTypes =

        new Set([

            "fan-post",
            "stats-post",
            "news-report",
            "opinion",
            "rumor",
            "satire"

        ]);


    const usedIds =
        new Set();


    const normalized =
        [];



    rawPosts.forEach(

        (
            post,
            index
        ) => {


            let postId =

                cleanText(
                    post.postId,
                    40
                )

                ||

                `p${String(
                    index + 1
                ).padStart(
                    2,
                    "0"
                )}`;


            if (
                usedIds.has(
                    postId
                )
            ) {


                postId =

                    `p${String(
                        index + 1
                    ).padStart(
                        2,
                        "0"
                    )}`;

            }


            usedIds.add(
                postId
            );


            const account =

    accountMap[

        normalizeAccountId(
            post.accountId
        )

    ];


            if (
                !account
            ) {


                return;

            }


            const body =

                cleanText(
                    post.body,
                    600
                );


            if (
                !body
            ) {


                return;

            }


            const type =

                allowedTypes.has(
                    post.type
                )

                    ? post.type

                    : "fan-post";


            normalized.push({


                postId:
                    postId,


                accountName:
                    account.accountName,


                handle:
                    account.handle,


                accountId:
                    account.id,


                wrestlerId:
                    "",


                type:
                    type,


                body:
                    body,


                replyTo:

                    cleanText(
                        post.replyTo,
                        40
                    ),


                likes:

                    clampInteger(

                        post.likes,
                        0,
                        50000

                    ),


                reposts:

                    clampInteger(

                        post.reposts,
                        0,
                        20000

                    ),


                replies:

                    clampInteger(

                        post.replies,
                        0,
                        10000

                    )

            });

        }

    );



    if (
        normalized.length !== target
    ) {


        throw new Error(

            `Only ${normalized.length} valid industry posts remained; expected ${target}.`

        );

    }



    const finalIds =

        new Set(

            normalized.map(

                post =>

                    post.postId

            )

        );



    normalized.forEach(

        post => {


            if (

                post.replyTo ===
                post.postId

                ||

                !finalIds.has(
                    post.replyTo
                )

            ) {


                post.replyTo =
                    "";

            }

        }

    );


    return normalized;

}



// =================================
// SAVE PULSE TO MONTH
// =================================


async function savePulseToMonth(
    pulse,
    posts
) {


    const id =
        pulse.periodId;


    const relativePath =

        `data/innanet/${id}.json`;


    const month =

        await readJson(

            relativePath,

            {
                id:
                    id,

                label:

                    monthLabel(
                        id
                    ),

                events:
                    []
            }

        );


    month.events =

        Array.isArray(
            month.events
        )

            ? month.events

            : [];


    const pulseEntry = {


        eventId:
            pulse.pulseId,


        pulseId:
            pulse.pulseId,


        eventName:
            pulse.label,


        brand:
            "The Landscape",


        eventType:
            pulse.pulseType,


        periodId:
            pulse.periodId,


        date:
            "",


        sequenceLabel:

            pulse.pulseType ===
            "bragging-rights-special"

                ? "BRAGGING RIGHTS SPECIAL"

                : "MONTH-END INDUSTRY REPORT",


        generatedAt:

            new Date()
                .toISOString(),


        model:
            MODEL,


        posts:
            posts

    };


    const existingIndex =

        month.events.findIndex(

            event =>

                event.eventId ===
                pulseEntry.eventId

        );


    if (
        existingIndex >= 0
    ) {


        month.events[
            existingIndex
        ] = pulseEntry;

    }


    else {


        month.events.push(
            pulseEntry
        );

    }



    await writeJson(

        relativePath,
        month

    );


    const showCount =

        month.events

            .filter(

                event =>

                    !String(
                        event.eventType || ""
                    )
                        .includes(
                            "industry-report"
                        )

                    &&

                    event.eventType !==
                    "bragging-rights-special"

            )

            .length;


    const pulseCount =

        month.events.length

        -

        showCount;


    return {


        id:
            id,


        label:
            month.label,


        file:
            relativePath,


        showCount:
            showCount,


        pulseCount:
            pulseCount,


        postCount:

            month.events.reduce(

                (
                    total,
                    event
                ) =>

                    total

                    +

                    (

                        Array.isArray(
                            event.posts
                        )

                            ? event.posts.length

                            : 0

                    ),

                0

            )

    };

}



// =================================
// UPDATE ARCHIVE INDEX
// =================================


async function updateArchiveIndex(
    summaries
) {


    const relativePath =

        "data/innanet/archive-index.json";


    const index =

        await readJson(

            relativePath,

            {
                months:
                    []
            }

        );


    const byId =

        new Map(

            (

                Array.isArray(
                    index.months
                )

                    ? index.months

                    : []

            )

                .map(

                    month => [

                        month.id,
                        month

                    ]

                )

        );


    summaries.forEach(

        summary => {


            byId.set(

                summary.id,
                summary

            );

        }

    );


    index.months =

        [

            ...byId.values()

        ]

            .sort(

                (
                    a,
                    b
                ) =>

                    String(
                        b.id
                    )

                        .localeCompare(

                            String(
                                a.id
                            )

                        )

            );


    await writeJson(

        relativePath,
        index

    );

}



// =================================
// LOAD QUEUE
// =================================


const queue =

    await readJson(

        "data/innanet/landscape-pulse-queue.json",

        {
            pendingPulseCount:
                0,

            pendingPulses:
                []
        }

    );


const pending =

    Array.isArray(
        queue.pendingPulses
    )

        ? queue.pendingPulses.slice(
            0,
            MAX_PULSES
        )

        : [];



if (
    !pending.length
) {


    console.log(

        "No pending Landscape Industry Pulses to generate."

    );


    process.exit(
        0
    );

}



// =================================
// GENERATE PULSES
// =================================


const failures =
    [];


let successCount =
    0;



for (
    const pulse
    of pending
) {


    console.log(

        `Generating Innanet Industry Pulse for ${pulse.label}...`

    );


    try {


        const posts =
            [];


        const totalBatches =

            batchCountForPulse(
                pulse
            );



        for (

            let batchNumber = 1;

            batchNumber <= totalBatches;

            batchNumber += 1

        ) {


            console.log(

                `Generating batch ${batchNumber} of ${totalBatches}...`

            );


            const batchPosts =

                await generateBatch(

                    pulse,
                    batchNumber,
                    totalBatches,
                    posts

                );


            posts.push(
                ...batchPosts
            );

        }



        const validatedPosts =

            validatePosts(

                posts,
                pulse

            );


        const summary =

            await savePulseToMonth(

                pulse,
                validatedPosts

            );


        await updateArchiveIndex([

            summary

        ]);


        successCount +=
            1;


        console.log(

            `Saved ${validatedPosts.length} industry posts for ${pulse.label}.`

        );

    }


    catch (
        error
    ) {


        failures.push({


            pulseId:
                pulse.pulseId,


            label:
                pulse.label,


            message:
                error.message

        });


        console.error(

            `Could not publish ${pulse.label}: ${error.message}`

        );

    }

}



console.log(

    `Published ${successCount} Landscape Industry Pulse(s).`

);



if (
    failures.length > 0
) {


    console.error(

        `Failed pulses: ${JSON.stringify(
            failures
        )}`

    );


    process.exitCode =
        1;

}
