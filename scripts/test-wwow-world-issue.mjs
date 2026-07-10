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


    requestedSections.forEach(

        requested => {


            const returned =

                returnedSections.find(

                    section =>

                        section.sectionId ===
                        requested.sectionId

                );


            writtenSections.push(

                validateWrittenSection(

                    returned,
                    requested

                )

            );

        }

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
