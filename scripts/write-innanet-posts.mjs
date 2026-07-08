import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const TOKEN =
    String(
        process.env.GITHUB_TOKEN || ""
    ).trim();

const MAX_EVENTS =
    Math.max(
        1,
        Number(
            process.env.MAX_EVENTS || 1
        )
    );

const MODEL =
    String(
        process.env.INNANET_MODEL
        ||
        "openai/gpt-4o-mini"
    ).trim();

const ENDPOINT =
    "https://models.github.ai/inference/chat/completions";



if (
    !TOKEN
) {

    throw new Error(
        "GITHUB_TOKEN is missing."
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
// DATE HELPERS
// =================================


function monthId(
    dateString
) {

    return String(
        dateString || ""
    ).slice(
        0,
        7
    );

}



function monthLabel(
    id
) {

    const [
        year,
        month
    ] =

        id
            .split("-")
            .map(Number);


    return new Date(

        Date.UTC(
            year,
            month - 1,
            1
        )

    ).toLocaleDateString(

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



function stableWrestlerHandle(
    wrestlerId
) {

    const slug =
        String(
            wrestlerId || "wrestler"
        )

            .replace(
                /[^a-zA-Z0-9]/g,
                ""
            )

            .slice(
                0,
                24
            );


    return `@${slug || "wrestler"}`;

}



// =================================
// SYSTEM PROMPT
// =================================


function buildSystemPrompt() {

    return `

You are the editorial engine for THE INNANET, a fictional wrestling social network inside the OWL wrestling universe.

Your job is to transform one completed event fact package into a believable social-media conversation.

VOICE:
- Write like many different people, not one AI wearing different usernames.
- Some accounts love the show. Some hate it. Some are funny, annoying, biased, smart, tribal, petty, or wrong in their opinions.
- Natural profanity is allowed when the account profile allows it.
- Never use slurs or attack protected traits.
- Do not make threats.
- Criticism can be harsh, but keep it about wrestling performance, booking, results, rankings, championships, and fan arguments.

CANON RULES:
- Database facts in the supplied package are canon.
- Never invent a match, result, rating, title change, contract, signing, firing, suspension, crime, backstage fight, relationship, injury diagnosis, or recovery timetable.
- A recorded KO is a major injury-level story signal, but never invent a medical diagnosis or exact recovery time.
- Opinion, jokes, exaggeration, criticism, and clearly framed speculation are allowed.
- Dirtsheet-style speculation must use language like "hearing", "wondering", "could", "might", "speculation", or a question.
- Never turn an old opinion from media memory into a new fact.

OUTPUT MIX:
- Produce EXACTLY 5 posts for this batch.
- Complete all 5 post objects before ending the JSON response.
- Use recurring accounts from availableAccounts for most posts.
- Make the 5 posts meaningfully different from one another.
- Include at least 2 factual posts from stats/news-style accounts when the facts support them.
- Include multiple viewpoints. Do not make everyone agree.
- Include 3 to 6 replies by setting replyTo to another postId.
- Use wrestler-posts sparingly: zero to three per event.
- A wrestler-post must use a wrestlerId from wrestlerContext and must fit actual results.
- Do not force every account to post.
- Avoid repeating the same fact or joke.
- Historical memory may be used to notice streaks, collapses, comebacks, prior fan takes, and changing perception.

METRICS:
- Create plausible fake social metrics.
- Big shocking moments can have high engagement.
- Dry stats posts can still perform well but should not all be viral.
- Tiny troll posts may flop.

RETURN JSON ONLY with this exact top-level shape:

{
  "posts": [
    {
      "postId": "p01",
      "accountId": "assholefan32",
      "wrestlerId": "",
      "type": "fan-post",
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
wrestler-post

For recurring accounts:
- provide accountId
- leave wrestlerId empty

For wrestler-post:
- leave accountId empty
- provide a valid wrestlerId from wrestlerContext

replyTo must be empty or match another postId in the same response.

`;

}



// =================================
// USER PROMPT
// =================================


function buildUserPrompt(
    eventPackage,
    batchNumber,
    previousPosts = [],
    retryInstruction = ""
) {

    return `Generate batch ${batchNumber} of 4 for The Innanet conversation about this completed OWL event.

You must return EXACTLY 5 complete posts.

This is one part of a larger 20-post feed.

Do not summarize the event.

Do not repeat jokes, opinions, facts, or wording already used in PREVIOUS POSTS.

Different batches should explore different parts of the show and different account personalities.

${retryInstruction}

PREVIOUS POSTS:

${JSON.stringify(
    previousPosts.map(
        post => ({
            accountId:
                post.accountId,

            wrestlerId:
                post.wrestlerId,

            type:
                post.type,

            body:
                post.body
        })
    )
)}

EVENT FACT PACKAGE:

${JSON.stringify(
    eventPackage
)}`;

}



// =================================
// CALL GITHUB MODEL
// =================================


async function callModel(
    eventPackage,
    batchNumber,
    previousPosts = [],
    retryInstruction = ""
) {

    const response =
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
        eventPackage,
        batchNumber,
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
                            0.35,


                        max_tokens:
                            5000

                    })

            }

        );


    const raw =
        await response.text();


    if (
        !response.ok
    ) {

        throw new Error(

            `GitHub Models request failed (${response.status}): ${raw}`

        );

    }


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


    if (
        !content
    ) {

        throw new Error(

            "GitHub Models returned no message content."

        );

    }


    try {

        return JSON.parse(
            content
        );

    }


    catch {

        const cleaned =

            content

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


        return JSON.parse(
            cleaned
        );

    }

}



// =================================
// VALIDATE POSTS
// =================================


function validatePosts(
    result,
    eventPackage
) {

    const rawPosts =

        Array.isArray(
            result?.posts
        )

            ? result.posts

            : [];


    if (
    rawPosts.length < 18
) {

    throw new Error(

        `Model returned only ${rawPosts.length} posts after retry; refusing to publish.`

    );

}



    const accountMap =
        Object.fromEntries(

            (
                eventPackage.availableAccounts
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



    const wrestlerMap =
        Object.fromEntries(

            (
                eventPackage.wrestlerContext
                ||
                []
            )

                .map(

                    wrestler => [

                        wrestler.id,

                        wrestler

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

            "satire",

            "wrestler-post"

        ]);



    const usedIds =
        new Set();


    const normalized =
        [];


    rawPosts

        .slice(
            0,
            30
        )

        .forEach(

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


                const type =

                    allowedTypes.has(
                        post.type
                    )

                        ? post.type

                        : "fan-post";


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
                // =================================
                // WRESTLER POST
                // =================================


                if (
                    type === "wrestler-post"
                ) {

                    const wrestler =

                        wrestlerMap[
                            post.wrestlerId
                        ];


                    if (
                        !wrestler
                    ) {

                        return;

                    }


                    normalized.push({

                        postId,

                        accountName:
                            wrestler.name,

                        handle:
                            stableWrestlerHandle(
                                wrestler.id
                            ),

                        accountId:
                            "",

                        wrestlerId:
                            wrestler.id,

                        type,

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


                    return;

                }



                // =================================
                // RECURRING ACCOUNT POST
                // =================================


                const account =

                    accountMap[
                        post.accountId
                    ];


                if (
                    !account
                ) {

                    return;

                }


                normalized.push({

                    postId,

                    accountName:
                        account.accountName,

                    handle:
                        account.handle,

                    accountId:
                        account.id,

                    wrestlerId:
                        "",

                    type,

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



    // =================================
    // CLEAN INVALID REPLIES
    // =================================


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



    if (
        normalized.length < 10
    ) {

        throw new Error(

            `Only ${normalized.length} valid posts remained after validation; refusing to publish.`

        );

    }


    return normalized;

}



// =================================
// SAVE EVENT TO MONTH
// =================================


async function saveEventToMonth(
    eventPackage,
    posts
) {

    const id =
        monthId(
            eventPackage.event.date
        );


    const relativePath =

        `data/innanet/${id}.json`;


    const month =
        await readJson(

            relativePath,

            {

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



    const eventEntry = {

        eventId:
            eventPackage.event.id,

        eventName:
            eventPackage.event.name,

        brand:
            eventPackage.event.brand
            ||
            "OWL",

        eventType:
            eventPackage.event.eventType
            ||
            "",

        date:
            eventPackage.event.date,

        generatedAt:
            new Date()
                .toISOString(),

        model:
            MODEL,

        posts

    };



    const existingIndex =

        month.events.findIndex(

            event =>

                event.eventId ===
                    eventEntry.eventId

        );



    if (
        existingIndex >= 0
    ) {

        month.events[
            existingIndex
        ] =

            eventEntry;

    }


    else {

        month.events.push(
            eventEntry
        );

    }



    month.events.sort(

        (
            a,
            b
        ) =>

            String(
                a.date
            )

                .localeCompare(

                    String(
                        b.date
                    )

                )

    );



    await writeJson(

        relativePath,

        month

    );



    return {

        id,

        label:
            month.label,

        file:
            relativePath,

        showCount:
            month.events.length,

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
    monthSummaries
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



    monthSummaries.forEach(

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

        "data/innanet/generation-queue.json",

        {

            pendingEventCount:
                0,

            pendingEvents:
                []

        }

    );



const pending =

    Array.isArray(
        queue.pendingEvents
    )

        ? queue.pendingEvents.slice(

            0,

            MAX_EVENTS

        )

        : [];



if (
    !pending.length
) {

    console.log(

        "No pending Innanet events to generate."

    );


    process.exit(
        0
    );

}



// =================================
// GENERATE EVENTS
// =================================


const monthSummaries =
    [];


for (
    const eventPackage
    of pending
) {


    console.log(

        `Generating Innanet posts for ${eventPackage.event.name} (${eventPackage.event.date})...`

    );


    let result =
    await callModel(
        eventPackage
    );


let returnedPostCount =

    Array.isArray(
        result?.posts
    )

        ? result.posts.length

        : 0;



// =================================
// RETRY INCOMPLETE BATCH
// =================================


if (
    returnedPostCount < 18
) {

    console.log(

        `Model returned only ${returnedPostCount} posts. Retrying with corrective instructions...`

    );


    result =
        await callModel(

            eventPackage,

            `IMPORTANT CORRECTION:

Your previous attempt returned only ${returnedPostCount} posts.

That response was rejected.

Generate a completely new response containing EXACTLY 20 complete posts.

Do not abbreviate the array.
Do not stop early.
Do not explain anything outside the JSON.`

        );


    returnedPostCount =

        Array.isArray(
            result?.posts
        )

            ? result.posts.length

            : 0;


    console.log(

        `Retry returned ${returnedPostCount} posts.`

    );

}



const posts =
    validatePosts(

        result,

        eventPackage

    );


    const summary =
        await saveEventToMonth(

            eventPackage,

            posts

        );


    monthSummaries.push(
        summary
    );


    console.log(

        `Saved ${posts.length} posts for ${eventPackage.event.name}.`

    );

}



await updateArchiveIndex(
    monthSummaries
);


console.log(

    `Published Innanet content for ${pending.length} event(s).`

);
