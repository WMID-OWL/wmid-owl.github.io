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


const ENDPOINT =

    "https://models.github.ai/inference/chat/completions";


const REQUIRED_SECTION_IDS = [

    "cover-story",
    "month-review",
    "power-shift",
    "match-month",
    "performers-month",
    "title-picture",
    "rumors-whispers",
    "editorial"

];


const COMPANY_ALIASES = {


    OWL: [

        "owl",
        "ascension",
        "revolt"

    ],


    AEW: [

        "aew",
        "dynamite",
        "collision"

    ],


    WWE: [

        "wwe",
        "raw",
        "smackdown"

    ],


    TNA: [

        "tna",
        "impact"

    ],


    CMLL: [

        "cmll",
        "super viernes"

    ],


    AAA: [

        "aaa",
        "lucha libre"

    ],


    NXT: [

        "nxt"

    ],


    ROH: [

        "roh",
        "honorclub"

    ]

};



if (
    !TOKEN
) {


    throw new Error(

        "GITHUB_TOKEN is missing."

    );

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
    relativePath
) {


    return JSON.parse(

        await readText(
            relativePath
        )

    );

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
// EXTRACT REAL EDITORIAL PROMPT
// =================================


async function loadEditorialPrompt() {


    const source =

        await readText(

            "scripts/write-wwow-issue.mjs"

        );


    const match =

        source.match(

            /const editorialSystemPrompt = `([\s\S]*?)`;\s*\/\/ =================================\s*\/\/ WRITING PROMPT/

        );


    if (
        !match
    ) {


        throw new Error(

            "Could not extract editorialSystemPrompt from the production WWoW writer."

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
                            0.7,


                        max_tokens:
                            2800

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

            "GitHub Models returned no editorial plan."

        );

    }


    return JSON.parse(

        String(
            content
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

            .trim()

    );

}



// =================================
// PLAN VALIDATION
// =================================


function validatePlan(
    plan
) {


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

            "Editorial test did not return a valid 8-section plan."

        );

    }


    const sectionIds =

        plan.sections.map(

            section =>

                section.sectionId

        );


    const missing =

        REQUIRED_SECTION_IDS.filter(

            sectionId =>

                !sectionIds.includes(
                    sectionId
                )

        );


    const duplicates =

        sectionIds.filter(

            (
                sectionId,
                index
            ) =>

                sectionIds.indexOf(
                    sectionId
                )

                !==

                index

        );


    if (

        missing.length > 0

        ||

        duplicates.length > 0

    ) {


        throw new Error(

            `Invalid editorial section structure. Missing: ${missing.join(
                ", "
            ) || "none"}. Duplicates: ${[

                ...new Set(
                    duplicates
                )

            ].join(
                ", "
            ) || "none"}.`

        );

    }

}



// =================================
// COVERAGE AUDIT
// =================================


function coverageAudit(
    plan
) {


    const text =

        [


            plan.coverTitle,


            plan.coverDeck,


            ...plan.sections.flatMap(

                section => [

                    section.title,
                    section.focus

                ]

            )


        ]

            .join(
                " "
            )

            .toLowerCase();


    const companiesMentioned =

        Object.entries(
            COMPANY_ALIASES
        )

            .filter(

                (
                    [
                        ,
                        aliases
                    ]
                ) =>

                    aliases.some(

                        alias =>

                            text.includes(
                                alias
                            )

                    )

            )

            .map(

                (
                    [
                        companyName
                    ]
                ) =>

                    companyName

            );


    const nonOwlCompanies =

        companiesMentioned.filter(

            companyName =>

                companyName !==
                "OWL"

        );


    return {


        companiesMentioned:
            companiesMentioned,


        companyCount:
            companiesMentioned.length,


        nonOwlCompanies:
            nonOwlCompanies,


        nonOwlCompanyCount:
            nonOwlCompanies.length,


        broadCoverageSignal:

            companiesMentioned.length >= 4

            &&

            nonOwlCompanies.length >= 3

    };

}



// =================================
// RUN TEST
// =================================


const [

    context,
    editorialPrompt

] =

    await Promise.all([


        readJson(

            "data/wwow/editorial-test-context.json"

        ),


        loadEditorialPrompt()


    ]);



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



const plan =

    await callModel(

        editorialPrompt,

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



validatePlan(
    plan
);



const audit =

    coverageAudit(
        plan
    );



const output = {


    version:
        1,


    generatedAt:

        new Date()
            .toISOString(),


    model:
        MODEL,


    coverageMode:
        coverageMode,


    audit:
        audit,


    plan:
        plan

};



await writeJson(

    "data/wwow/editorial-test-plan.json",

    output

);



console.log(
    ""
);


console.log(

    "WWoW editorial test passed structural validation."

);


console.log(

    `Coverage mode: ${coverageMode}`

);


console.log(

    `Companies detected in plan: ${audit.companiesMentioned.join(
        ", "
    ) || "none"}`

);


console.log(

    `Non-OWL companies detected: ${audit.nonOwlCompanies.join(
        ", "
    ) || "none"}`

);


console.log(

    `Broad coverage signal: ${audit.broadCoverageSignal}`

);
