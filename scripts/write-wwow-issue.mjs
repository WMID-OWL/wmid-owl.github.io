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
// MODEL CALL
// =================================


async function callModel(
    systemPrompt,
    userPrompt
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

            "GitHub Models returned no content."

        );

    }


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
- Not a result-dump.
- Not fake insider fanfiction.

FACT RULES:
- Structured data is canon.
- Never invent matches, injuries, contracts, backstage incidents, firings, signings, suspensions, title changes, or future booking as fact.
- Public Innanet posts are public reaction, not factual proof.
- Speculation must be clearly framed as speculation.
- Archived WWoW history may be used to compare how expectations changed.

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
// SECTION WRITING PROMPT
// =================================


const writingSystemPrompt = `

You are a veteran wrestling sportswriter for THE WONDERFUL WORLD OF WRESTLING.

Write polished magazine journalism from the supplied verified fact package and approved editorial plan.

RULES:
- Do not invent canon.
- Do not fabricate quotes.
- Do not fabricate backstage sources.
- Innanet posts may be described as fan reaction.
- Rumor/speculation sections must remain clearly speculative.
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
- preserve the supplied kicker and title exactly

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
// PLAN ISSUE
// =================================


console.log(

    `Planning WWoW issue for ${context.month.label}...`

);


const plan =
    await callModel(

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
// WRITE IN FOUR SMALL BATCHES
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
        await callModel(

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


    const sections =

        Array.isArray(
            result?.sections
        )

            ? result.sections

            : [];


    if (
        sections.length !== 2
    ) {

        throw new Error(

            `WWoW batch ${batchIndex + 1} returned ${sections.length} sections instead of 2.`

        );

    }


    sections.forEach(

        section => {


            if (
                !Array.isArray(
                    section.body
                )

                ||

                section.body.length !== 3
            ) {

                throw new Error(

                    `Section ${section.sectionId || "unknown"} did not return exactly 3 paragraphs.`

                );

            }

        }

    );


    writtenSections.push(
        ...sections
    );

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
// ISSUE NUMBER
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


const issueNumber =

    existingIssues.find(

        issue =>
            issue.id ===
            context.month.id

    )?.issue

    ||

    (
        existingIssues.length + 1
    );



// =================================
// BUILD ISSUE
// =================================


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


archiveIndex.issues = [

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
