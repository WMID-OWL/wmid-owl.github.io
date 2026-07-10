import fs from "node:fs/promises";
import path from "node:path";


const ROOT =
    process.cwd();


const TOKEN =

    String(
        process.env.GITHUB_TOKEN || ""
    )
        .trim();


const MODEL =

    String(

        process.env.WWOW_TEST_MODEL

        ||

        "openai/gpt-4o-mini"

    )
        .trim();


const REQUEST_GAP_MS =

    Math.max(

        5000,

        Number(

            process.env
                .WWOW_TEST_REQUEST_GAP_MS

            ||

            15000

        )

    );


const ENDPOINT =

    "https://models.github.ai/inference/chat/completions";


const TEST_ISSUE_ID =
    "2099-09";


let lastRequestAt =
    0;



if (
    !TOKEN
) {


    throw new Error(

        "GITHUB_TOKEN is missing."

    );

}



// =================================
// WAIT
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

        lastRequestAt;


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
            )}s before next WWoW test request...`

        );


        await sleep(
            remaining
        );

    }

}



// =================================
// FILE HELPERS
// =================================


async function readText(
    relativePath
) {


    return fs.readFile(

        path.join(
            ROOT,
            relativePath
        ),

        "utf8"

    );

}



async function readJson(
    relativePath,
    fallback = undefined
) {


    try {


        return JSON.parse(

            await readText(
                relativePath
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
// MODEL JSON
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


        throw new Error(

            "WWoW test model returned no content."

        );

    }


    return JSON.parse(
        cleaned
    );

}// =================================
// EXTRACT PRODUCTION WRITING PROMPT
// =================================


async function loadWritingPrompt() {


    const source =

        await readText(

            "scripts/write-wwow-issue.mjs"

        );


    const match =

        source.match(

            /const writingSystemPrompt = `([\s\S]*?)`;\s*\/\/ =================================\s*\/\/ LOAD CONTEXT/

        );


    if (
        !match
    ) {


        throw new Error(

            "Could not extract writingSystemPrompt from production WWoW writer."

        );

    }


    return match[1];

}


// =================================
// FACTUAL AUDIT PROMPT
// =================================


const factualAuditSystemPrompt = `

You are the factual editor for THE WONDERFUL WORLD OF WRESTLING.

You are reviewing finished magazine copy against a supplied structured fact package.

Your job is to REWRITE the supplied sections so every factual claim remains supported by the supplied data.

THIS IS NOT A STYLE REVIEW.
Preserve strong magazine writing, analysis, criticism, and personality wherever possible.

STRICT FACT RULES:

1. Do not invent audience reaction.
Do not claim fans were excited, captivated, disappointed, on the edge of their seats, changing preferences, losing interest, or reacting in any specific way unless supplied public-reaction data explicitly supports it.

2. Do not invent match details.
A match result and star rating do not prove specific moves, technique, pacing, crowd behavior, chemistry, drama, storytelling, athletic sequences, willpower, near falls, or atmosphere.

You may analyze the importance of a verified result or rating.
You may say a highly rated match ranked among the best supplied matches.
You may not invent what physically happened inside the match.

3. Do not invent causes.
A company ranking rise does not automatically prove that a specific champion, wrestler, storyline, signing, match, or event caused the rise.

A show ranking decline does not prove bad booking, bad roster management, fan rejection, weak storylines, or internal problems.

You may describe verified movement.
You may compare supplied metrics.
You may discuss possible competitive implications as analysis without claiming an unsupported cause.

4. Do not invent performer evidence.
Current championship status alone does not prove a wrestler had a great month.

Only describe someone as a standout performer when the fact package contains direct current-month evidence such as:
- a verified match result
- a verified match rating
- a title win
- a successful defense
- tournament performance
- a streak
- another explicit current-month achievement

5. Do not invent backstage information.
Never invent:
- sources
- insiders
- backstage heat
- discontent
- morale problems
- contract negotiations
- contract terms
- talent considering departure
- releases
- surprise debuts
- future signings
- roster instability
- internal strategy
- relationships

6. Do not invent future booking.
Never invent:
- announced matches
- future challengers
- cross-promotional matches
- dream matches as likely events
- tournament entries
- debuts
- releases
- title plans

7. Rumors & Whispers rules:
This section may speculate only about the possible competitive or storyline implications of verified developments.

Example allowed:
"Nova's confirmed AAA signing could affect AAA's competitive direction."

Example not allowed:
"Other wrestlers may now be negotiating with AAA."

Example allowed:
"OWL falling from first to second raises the question of whether it can respond next month."

Example not allowed:
"OWL wrestlers may be considering leaving."

Do not invent hidden events merely because the section is called Rumors & Whispers.

8. Editorial rules:
Opinion is allowed.
Unsupported factual claims are not.

An editorial may argue that competition is becoming tighter when rankings support that claim.

It may not claim:
- fan loyalty changed
- popularity increased
- creative problems exist
- roster problems exist
- audience preferences changed

unless those facts are supplied.

9. Analysis versus fact:
You may explain why a verified result is significant.
You may compare supplied rankings, ratings, scores, titles, results, and movement.

Do not manufacture an explanation for why something happened.

OUTPUT RULES:

Return JSON only.

Return exactly the same two sectionIds supplied.

Return exactly 3 substantial paragraphs for each section.

Preserve:
- sectionId
- kicker
- title

Rewrite the body wherever necessary to remove unsupported claims.

Return:

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

`;

// =================================
// MODEL CALL
// =================================


async function callModel(
    systemPrompt,
    userPrompt
) {


    await waitForRequestSlot();


    lastRequestAt =
        Date.now();


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


    return parseModelJson(
        content
    );

}



// =================================
// SAFE MODEL CALL
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
            !String(
                error.message || ""
            )
                .toLowerCase()
                .includes(
                    "json"
                )
        ) {


            throw error;

        }


        console.log(

            "Malformed WWoW test JSON. Waiting before clean retry..."

        );


        await sleep(
            15000
        );


        return callModel(

            systemPrompt,

            `${userPrompt}

IMPORTANT RETRY:
Return one valid JSON object only.
No markdown fences.
No explanation outside JSON.
Return both requested sections completely.`

        );

    }

}


// =================================
// FACTUAL AUDIT
// =================================


async function auditWrittenBatch({

    context,
    requestedSections,
    writtenSections

}) {


    console.log(

        `Fact-checking ${requestedSections

            .map(
                section => section.sectionId
            )

            .join(
                " + "
            )}...`

    );


    const result =

        await callModelSafely(

            factualAuditSystemPrompt,

            `Fact-check and repair these finished WWoW sections.

APPROVED SECTION PLANS:

${JSON.stringify(
    requestedSections
)}

FINISHED ARTICLE COPY:

${JSON.stringify(
    writtenSections
)}

FACT PACKAGE:

${JSON.stringify(
    context
)}

IMPORTANT:

Rewrite any unsupported claim.

Do not merely describe the problems.

Return the corrected finished sections.

Preserve each approved:
- sectionId
- kicker
- title

Return exactly 3 paragraphs per section.`

        );


    const auditedSections =

        Array.isArray(
            result?.sections
        )

            ? result.sections

            : [];


    if (
        auditedSections.length !==
        requestedSections.length
    ) {


        throw new Error(

            `WWoW factual audit returned ${auditedSections.length} sections instead of ${requestedSections.length}.`

        );

    }


    return requestedSections.map(

        requested => {


            const audited =

                auditedSections.find(

                    section =>

                        section.sectionId ===
                        requested.sectionId

                );


            return validateWrittenSection(

                audited,
                requested

            );

        }

    );

}

// =================================
// SECTION VALIDATION
// =================================


function validateWrittenSection(
    section,
    requested
) {


    if (
        !section
    ) {


        throw new Error(

            `Missing section ${requested.sectionId}.`

        );

    }


    if (
        !Array.isArray(
            section.body
        )
    ) {


        throw new Error(

            `Section ${requested.sectionId} has no body array.`

        );

    }


    if (
        section.body.length !==
        3
    ) {


        throw new Error(

            `Section ${requested.sectionId} returned ${section.body.length} paragraphs instead of 3.`

        );

    }


    const paragraphs =

        section.body

            .map(

                paragraph =>

                    String(
                        paragraph || ""
                    )
                        .trim()

            );


    if (
        paragraphs.some(

            paragraph =>

                !paragraph

        )
    ) {


        throw new Error(

            `Section ${requested.sectionId} contains an empty paragraph.`

        );

    }


    return {


        sectionId:
            requested.sectionId,


        kicker:
            requested.kicker,


        title:
            requested.title,


        body:
            paragraphs

    };

}// =================================
// LOAD TEST MATERIAL
// =================================


const [

    context,
    planOutput,
    writingPrompt

] =

    await Promise.all([


        readJson(

            "data/wwow/editorial-test-context.json"

        ),


        readJson(

            "data/wwow/editorial-test-plan.json"

        ),


        loadWritingPrompt()


    ]);



const plan =

    planOutput.plan

    ||

    planOutput;



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
    8

) {


    throw new Error(

        "The approved WWoW test editorial plan is invalid."

    );

}



// =================================
// WRITE FOUR BATCHES
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

        `Writing WWoW world test batch ${batchIndex + 1} of 4...`

    );


    const result =

        await callModelSafely(

            writingPrompt,

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

)}

IMPORTANT TEST RULE:
This is a controlled fictional world-month test.
Use only supplied facts.
Do not invent additional events, matches, champions, signings, retirements, negotiations, contracts, injuries, or backstage information.`

        );


    const returnedSections =

        Array.isArray(
            result?.sections
        )

            ? result.sections

            : [];


    if (
        returnedSections.length !==
        2
    ) {


        throw new Error(

            `WWoW test batch ${batchIndex + 1} returned ${returnedSections.length} sections instead of 2.`

        );

    }


        const validatedDraftSections =

        requestedSections.map(

            requested => {


                const returned =

                    returnedSections.find(

                        section =>

                            section.sectionId ===
                            requested.sectionId

                    );


                return validateWrittenSection(

                    returned,
                    requested

                );

            }

        );



    const auditedSections =

        await auditWrittenBatch({


            context:
                context,


            requestedSections:
                requestedSections,


            writtenSections:
                validatedDraftSections


        });



    writtenSections.push(

        ...auditedSections

    );

}



// =================================
// FINAL VALIDATION
// =================================


if (
    writtenSections.length !==
    8
) {


    throw new Error(

        `WWoW test assembled ${writtenSections.length} sections instead of 8.`

    );

}// =================================
// BUILD TEMPORARY TEST ISSUE
// =================================


const issue = {


    id:
        TEST_ISSUE_ID,


    label:
        "September 2099",


    volume:
        99,


    issue:
        99,


    testMode:
        true,


    testPurpose:

        "Controlled full-world WWoW writing and public presentation test",


    generatedAt:

        new Date()
            .toISOString(),


    model:
        MODEL,


    coverTitle:

        String(
            plan.coverTitle
        )
            .trim(),


    coverDeck:

        String(
            plan.coverDeck
        )
            .trim(),


    sections:
        writtenSections

};



const issuePath =

    `data/wwow/${TEST_ISSUE_ID}.json`;



await writeJson(

    issuePath,
    issue

);



// =================================
// ADD TEST ISSUE TO ARCHIVE
// =================================


const archiveIndex =

    await readJson(

        "data/wwow/archive-index.json",

        {
            issues:
                []
        }

    );



const issues =

    Array.isArray(
        archiveIndex.issues
    )

        ? archiveIndex.issues

        : [];



const filtered =

    issues.filter(

        item =>

            item.id !==
            TEST_ISSUE_ID

    );



filtered.push({


    id:
        TEST_ISSUE_ID,


    label:
        "September 2099",


    coverTitle:
        issue.coverTitle,


    issue:
        99,


    testMode:
        true,


    file:
        issuePath

});



archiveIndex.issues =

    filtered.sort(

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
    ""
);


console.log(

    "WWoW full world test issue generated successfully."

);


console.log(

    `Cover: ${issue.coverTitle}`

);


console.log(

    `Sections: ${issue.sections.length}`

);


console.log(

    `Paragraphs: ${issue.sections.reduce(

        (
            total,
            section
        ) =>

            total

            +

            section.body.length,

        0

    )}`

);


console.log(

    `Test issue file: ${issuePath}`

);
