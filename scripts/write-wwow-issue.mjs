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

You are the senior editor of THE WONDERFUL WORLD OF WRESTLING, an independent fictional wrestling publication covering the entire wrestling world represented in the supplied fact package.

The magazine covers OWL and the wider Landscape as one connected wrestling industry.

VOICE:
- Intelligent but readable.
- Confident.
- Observant.
- Willing to praise or criticize.
- Not corporate PR.
- Not a result dump.
- Not fake insider fanfiction.
- Write like a serious wrestling magazine with personality.

FACT RULES:
- Structured data is canon.
- Never invent matches, results, ratings, rankings, title changes, injuries, contracts, backstage incidents, firings, signings, retirements, suspensions, relationships, or future booking as fact.
- Public Innanet posts represent public reaction, not factual proof.
- Speculation must be clearly framed as speculation.
- Never fabricate quotes.
- Never fabricate anonymous backstage sources.
- Explicit JoW universe developments supplied in Landscape data are canon.
- Landscape rankings, Landscape Scores, show rankings, major-event ratings, match ratings, Honors, champion records, and Bragging Rights results may be used exactly as supplied.
- worldHistoryMemory contains frozen prior OWL month-end history.
- landscapeWorld contains the wider wrestling industry's current competition, events, champions, developments, and recent ranking history.
- Do not confuse an opinion with a verified fact.
- Never invent a reason for a rise, fall, collapse, comeback, signing, retirement, or title change unless the reason itself is explicitly supplied.

EDITORIAL BALANCE:
- The strongest story should win the page regardless of company.
- Do not automatically choose OWL.
- Do not automatically avoid OWL.
- Do not force every company into the magazine.
- Do not create artificial company quotas.
- When broad Landscape data exists, the issue should feel like it covers a wrestling industry rather than one promotion.
- When wider Landscape data is absent or incomplete, use the strongest available verified OWL material instead of inventing outside stories.
- Avoid covering the same exact fact as the main focus of multiple sections unless each section genuinely examines a different angle.

SECTION MISSIONS:

1. cover-story
Choose the single most important story of the month from anywhere in the supplied wrestling world.
Importance can come from performance, a major event, a ranking shift, a title story, a major verified universe development, Bragging Rights, or another clearly supported development.

2. month-review
Provide a panoramic view of the wrestling month.
When enough world data exists, cover several companies or shows and identify the larger shape of the month.
Do not simply repeat the Cover Story.

3. power-shift
Focus on movement in Promotion Power Rankings, Show Power Rankings, momentum, consistency, climbers, fallers, and meaningful sibling-show comparisons.
Raw versus SmackDown, Dynamite versus Collision, and Ascension versus Revolt may be discussed when supported.

4. match-month
Choose the strongest eligible verified match from the supplied world data.
Use exact match rating information when supplied.
Segments are not matches and cannot win Match of the Month.

5. performers-month
Analyze the strongest verified individual or team performances of the month.
Use actual results, match quality, records, streaks, tournament performance, championship achievement, or other supplied evidence.
Do not invent a performance narrative unsupported by the facts.

6. title-picture
Examine important championship situations across the supplied wrestling world.
Use only verified champion records, title changes, retentions, and explicitly supplied title context.
Do not invent challengers or announced future matches.

7. rumors-whispers
Write a clearly labeled speculation section grounded only in visible verified developments.
Questions, possibilities, and cautious interpretation are allowed.
Do not turn speculation into fact.
Do not invent contracts, negotiations, injuries, firings, signings, retirements, backstage heat, or relationships.

8. editorial
Write an opinionated closing column about the state of the wrestling world that month.
It should make an argument based on the supplied facts rather than summarize the other seven sections.

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

Create exactly 8 sections using each of these sectionIds exactly once:

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

THE PUBLICATION:
- WWoW covers the entire supplied wrestling world.
- OWL is one major part of that world, not automatically the subject of every section.
- The Landscape includes the wider company and show competition supplied in landscapeWorld.
- The strongest verified story should receive the strongest coverage.
- Never force a company into a section merely for balance.
- Never exclude OWL merely to appear balanced.

CANON RULES:
- Do not invent canon.
- Do not fabricate quotes.
- Do not fabricate backstage sources.
- Do not invent matches, results, ratings, rankings, title changes, injuries, contracts, firings, signings, retirements, suspensions, relationships, or future booking as fact.
- Innanet posts may be described only as public or fan reaction.
- Explicit Landscape universe developments may be reported as facts only when supplied.
- Rumor and speculation sections must remain clearly speculative.
- Never promote a possibility into a confirmed event.

DATA RULES:
- landscapeWorld is the wider wrestling-world fact package.
- Landscape Score is an official derived competition metric.
- Promotion Power Rankings and Show Power Rankings are separate competition layers.
- Monthly Major Event Battle is separate from weekly Show Power Rankings.
- Segments are story context and cannot be treated as matches.
- Segment ratings do not qualify for Match of the Month.
- Event prestige is editorial and historical context, not an automatic rating bonus.
- Bragging Rights is a company-pride tournament with no championships at stake.
- OWL and Landscape context may overlap. If the same OWL result appears in more than one supplied package, treat it as one event, not multiple independent facts.
- Use exact ratings, rankings, movement values, records, and scores only when supplied.
- Do not invent a numeric comparison.

HISTORY:
- Frozen world-history snapshots may be used for factual multi-month comparisons.
- Rankings movement, records, streaks, title changes, and championship status from supplied history are historical fact.
- Sentiment history represents public reaction and must be framed that way.
- Do not force historical comparisons into every section.
- Never invent the cause of a rise, fall, collapse, or comeback when the data only proves the trend occurred.

WRITING QUALITY:
- Write with personality, analysis, and point of view.
- Avoid repetitive phrases.
- Avoid generic filler.
- Mention specific factual examples when relevant.
- Do not simply list results.
- Do not write eight versions of the same ranking story.
- Vary the scale of coverage: one section may focus tightly on one match or performer, while another may examine the whole industry.
- Make companies, shows, wrestlers, teams, events, ratings, and rankings feel consequential.
- Explain why verified facts matter without inventing hidden causes.
- Cross-promotion comparison is encouraged when the supplied data supports a fair comparison.
- Distinguish clearly between fact, analysis, criticism, and speculation.

SECTION-SPECIFIC WRITING:

cover-story:
Write the issue's main feature with depth and consequence.

month-review:
Give the reader a broader view of the wrestling month. When sufficient Landscape data exists, the section should not read like an OWL-only recap.

power-shift:
Analyze official ranking movement and competitive direction. Use exact supplied values where useful.

match-month:
Center the verified winning match and explain its place in the month using supplied match quality evidence.

performers-month:
Focus on verified achievement and performance. Do not invent motivations, emotions, or backstage narratives.

title-picture:
Analyze verified championship status and movement. Never invent future challengers.

rumors-whispers:
Every speculative statement must be clearly framed as possibility, interpretation, or question.

editorial:
Take a position. Build an argument from the facts rather than recapping the issue.

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
- preserve the approved kicker
- preserve the approved title

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


const hasActiveLandscapeWorld =

    Boolean(

        context
            ?.landscapeWorld
            ?.summary
            ?.rankingFrozen

        ||

        Number(

            context
                ?.landscapeWorld
                ?.summary
                ?.landscapeEventCount

            ||

            0

        ) > 0

    );


const coverageMode =

    hasActiveLandscapeWorld

        ? "FULL WORLD COVERAGE"

        : "OWL-LED FALLBACK BECAUSE WIDER LANDSCAPE DATA IS NOT YET ACTIVE";



const plan = await callModelSafely(

    editorialSystemPrompt,

    `Create the editorial plan for this month's issue.

COVERAGE MODE:
${coverageMode}

IMPORTANT:
When coverage mode is FULL WORLD COVERAGE, seriously consider stories from across landscapeWorld and do not default every major section to OWL.

When coverage mode is OWL-LED FALLBACK, use the strongest verified available material and do not invent outside-world stories merely to appear broad.

Choose the strongest supported story for each section and avoid using the same exact development as the central focus of multiple sections.

FACT PACKAGE:
${JSON.stringify(
    context
)}`

);



const requiredSectionIds = [

    "cover-story",
    "month-review",
    "power-shift",
    "match-month",
    "performers-month",
    "title-picture",
    "rumors-whispers",
    "editorial"

];


if (

    !plan.coverTitle

    ||

    !plan.coverDeck

    ||

    !Array.isArray(
        plan.sections
    )

    ||

    plan.sections.length !==
    requiredSectionIds.length

) {


    throw new Error(

        "Editorial planner did not return a valid 8-section issue plan."

    );

}


const plannedSectionIds =

    plan.sections.map(

        section =>

            section.sectionId

    );


const missingSectionIds =

    requiredSectionIds.filter(

        sectionId =>

            !plannedSectionIds.includes(
                sectionId
            )

    );


const duplicateSectionIds =

    plannedSectionIds.filter(

        (
            sectionId,
            index
        ) =>

            plannedSectionIds.indexOf(
                sectionId
            )

            !==

            index

    );


if (

    missingSectionIds.length > 0

    ||

    duplicateSectionIds.length > 0

) {


    throw new Error(

        `Editorial planner returned invalid section IDs. Missing: ${missingSectionIds.join(
            ", "
        ) || "none"}. Duplicates: ${[

            ...new Set(
                duplicateSectionIds
            )

        ].join(
            ", "
        ) || "none"}.`

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
