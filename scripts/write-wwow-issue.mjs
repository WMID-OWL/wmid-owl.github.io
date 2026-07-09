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

        process.env.WWOW_MODEL

        ||

        "openai/gpt-4o-mini"

    ).trim();


const ENDPOINT =
    "https://models.github.ai/inference/chat/completions";


const REQUEST_GAP_MS =

    Math.max(

        5000,

        Number(

            process.env.WWOW_REQUEST_GAP_MS

            ||

            20000

        )

    );


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

            )}s before the next WWoW model request...`

        );


        await sleep(
            remaining
        );

    }

}



// =================================
// RETRY DELAY
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

            "GitHub Models returned no content."

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

            `WWoW model returned malformed JSON: ${error.message}`

        );

    }

}



// =================================
// MODEL CALL
// =================================


async function callModel(
    systemPrompt,
    userPrompt
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
                0.75,


            frequency_penalty:
                0.25,


            max_tokens:
                3200

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

                `WWoW network error. Waiting ${Math.ceil(

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

                `WWoW rate limit hit. Waiting ${Math.ceil(

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

                `WWoW model server error ${response.status}. Waiting ${Math.ceil(

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



// =================================
// MALFORMED JSON RETRY
// =================================


async function callModelSafely(
    systemPrompt,
    userPrompt
) {


    try {

        return await callModel(

            systemPrompt,

            userPrompt

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

            "WWoW model returned malformed JSON. Waiting before one clean retry..."

        );


        await sleep(
            15000
        );


        return await callModel(

            systemPrompt,

            `${userPrompt}

IMPORTANT RETRY CORRECTION:

Return one valid JSON object only.

Do not use markdown fences.
Do not include explanations outside the JSON.
Complete every required object, array, and string.`

        );

    }

}



// =================================
// EDITORIAL PROMPT
// =================================


const editorialSystemPrompt = `

You are the senior editor of THE WONDERFUL WORLD OF WRESTLING, an independent fictional wrestling publication.

The publication covers the wrestling world as serious sports journalism mixed with wrestling culture.

VOICE:
- Intelligent but readable.
- Confident.
- Observant.
- Willing to praise or criticize.
- Not corporate PR.
- Not a result dump.
- Not fake insider fanfiction.

FACT RULES:
- Structured data is canon.
- Never invent matches, injuries, contracts, backstage incidents, firings, signings, suspensions, title changes, or future booking as fact.
- Public Innanet posts are public reaction, not factual proof.
- Speculation must be clearly framed as speculation.
- Archived WWoW history may be used to compare how expectations changed.
- worldHistoryMemory contains frozen month-end OWL history from prior months.
- Use real rankings movement, monthly records, streak changes, title transitions, and public sentiment shifts when they strengthen a story.
- Do not force a historical comparison into every section.
- Never invent an unrecorded explanation for why an athlete or team rose or declined.

Your job in this call is editorial planning only.

Return JSON only:

{
  "coverTitle": "",
  "coverDeck": "",
  "sections": [
    {
      "sectionId": "cover-story",
      "kicker": "COVER STORY",
      "title": "",
      "focus": ""
    }
  ]
}

Create exactly 8 sections using these sectionIds:

cover-story
month-review
power-shift
match-month
performers-month
title-picture
rumors-whispers
editorial

The section titles should feel like actual magazine headlines.

`;



// =================================
// WRITING PROMPT
// =================================


const writingSystemPrompt = `

You are a veteran wrestling sportswriter for THE WONDERFUL WORLD OF WRESTLING.

Write polished magazine journalism from the supplied verified fact package and approved editorial plan.

RULES:
- Do not invent canon.
- Do not fabricate quotes.
- Do not fabricate backstage sources.
- Innanet posts may be described as fan reaction.
- Frozen world-history snapshots may be used for factual multi-month comparisons.
- Rankings movement, records, streaks, title changes, and championship status from those snapshots are historical fact.
- Sentiment history represents public reaction and should be framed that way.
- Never invent the cause of a rise, fall, collapse, or comeback when the data only proves that the trend occurred.
- Rumor and speculation sections must remain clearly speculative.
- Write with personality, analysis, and point of view.
- Avoid repetitive phrases.
- Avoid generic filler.
- Mention specific factual examples when relevant.
- Do not simply list results.

Return JSON only:

{
  "sections": [
    {
      "sectionId": "",
      "kicker": "",
      "title": "",
      "body": [
        "paragraph one",
        "paragraph two",
        "paragraph three"
      ]
    }
  ]
}

For every requested section:
- write exactly 3 substantial paragraphs
- keep each paragraph focused and readable
- preserve the supplied sectionId

`;



// =================================
// LOAD CONTEXT
// =================================


const context =

    await readJson(

        "data/wwow/generation-context.json"

    );



if (
    !context?.month?.id
) {

    throw new Error(

        "WWoW generation context has no month."

    );

}



// =================================
// FREEZE PUBLISHED ISSUES
// =================================


const archiveIndex =

    await readJson(

        "data/wwow/archive-index.json",

        {
            issues:
                []
        }

    );



const existingIssues =

    Array.isArray(
        archiveIndex.issues
    )

        ? archiveIndex.issues

        : [];



const existingIssue =

    existingIssues.find(

        issue =>
            issue.id ===
            context.month.id

    );



if (
    existingIssue
) {

    console.log(

        `${context.month.label} already has a published WWoW issue. The frozen issue will not be regenerated.`

    );


    process.exit(
        0
    );

}



// =================================
// PLAN ISSUE
// =================================


console.log(

    `Planning WWoW issue for ${context.month.label}...`

);


const plan =

    await callModelSafely(

        editorialSystemPrompt,

        `Create the editorial plan for this month's issue.

FACT PACKAGE:

${JSON.stringify(
    context
)}`

    );



if (
    !plan.coverTitle

    ||

    !plan.coverDeck

    ||

    !Array.isArray(
        plan.sections
    )

    ||

    plan.sections.length !== 8
) {

    throw new Error(

        "Editorial planner did not return a valid 8-section issue plan."

    );

}



// =================================
// WRITE FOUR SMALL BATCHES
// =================================


const writtenSections =
    [];



for (
    let batchIndex = 0;

    batchIndex < 4;

    batchIndex += 1
) {


    const requestedSections =

        plan.sections.slice(

            batchIndex * 2,

            (
                batchIndex * 2
            )

            +

            2

        );


    console.log(

        `Writing WWoW section batch ${batchIndex + 1} of 4...`

    );


    const result =

        await callModelSafely(

            writingSystemPrompt,

            `Write these two approved sections:

${JSON.stringify(
    requestedSections
)}

FACT PACKAGE:

${JSON.stringify(
    context
)}

ALREADY WRITTEN SECTION TITLES:

${JSON.stringify(

    writtenSections.map(

        section =>
            section.title

    )

)}`

        );


    const returnedSections =

        Array.isArray(
            result?.sections
        )

            ? result.sections

            : [];


    if (
        returnedSections.length !== 2
    ) {

        throw new Error(

            `WWoW batch ${batchIndex + 1} returned ${returnedSections.length} sections instead of 2.`

        );

    }



    for (
        const requested
        of requestedSections
    ) {


        const returned =

            returnedSections.find(

                section =>

                    section.sectionId ===
                    requested.sectionId

            );


        if (
            !returned
        ) {

            throw new Error(

                `WWoW batch did not return section ${requested.sectionId}.`

            );

        }


        if (
            !Array.isArray(
                returned.body
            )

            ||

            returned.body.length !== 3
        ) {

            throw new Error(

                `Section ${requested.sectionId} did not return exactly 3 paragraphs.`

            );

        }


        writtenSections.push({

            sectionId:
                requested.sectionId,

            kicker:
                requested.kicker,

            title:
                requested.title,

            body:

                returned.body.map(

                    paragraph =>

                        String(
                            paragraph || ""
                        ).trim()

                )

        });

    }

}



// =================================
// FINAL VALIDATION
// =================================


if (
    writtenSections.length !== 8
) {

    throw new Error(

        `Writer assembled ${writtenSections.length} sections instead of 8.`

    );

}



// =================================
// BUILD ISSUE
// =================================


const issueNumber =

    existingIssues.length + 1;



const issue = {

    id:
        context.month.id,

    label:
        context.month.label,

    volume:
        1,

    issue:
        issueNumber,

    generatedAt:

        new Date()
            .toISOString(),

    model:
        MODEL,

    coverTitle:
        String(
            plan.coverTitle
        ).trim(),

    coverDeck:
        String(
            plan.coverDeck
        ).trim(),

    sections:
        writtenSections

};



// =================================
// SAVE ISSUE
// =================================


const issuePath =

    `data/wwow/${context.month.id}.json`;



await writeJson(

    issuePath,

    issue

);



// =================================
// UPDATE ARCHIVE INDEX
// =================================


const byId =

    new Map(

        existingIssues.map(

            issueEntry => [

                issueEntry.id,

                issueEntry

            ]

        )

    );



byId.set(

    context.month.id,

    {

        id:
            context.month.id,

        label:
            context.month.label,

        coverTitle:
            issue.coverTitle,

        issue:
            issue.issue,

        file:
            issuePath

    }

);



archiveIndex.issues =

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

    "data/wwow/archive-index.json",

    archiveIndex

);



console.log(

    `Published WWoW issue: ${context.month.label} — ${issue.coverTitle}`

);
