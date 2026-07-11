import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {

    buildWwowLandscapeContext

} from "./wwow-landscape-context.mjs";

const execFileAsync =
    promisify(
        execFile
    );


const ROOT =
    process.cwd();


const PERIOD_ID =
    "2099-10";


const TEST_YEAR =
    "2099";


const WEEKLY_STAGES = [

    "week-1",
    "week-2",
    "week-3",
    "week-4"

];



// =================================
// FILE HELPERS
// =================================


async function readJson(
    relativePath
) {


    return JSON.parse(

        await fs.readFile(

            path.join(
                ROOT,
                relativePath
            ),

            "utf8"

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
// ASSERTION
// =================================


function assert(
    condition,
    message
) {


    if (
        !condition
    ) {


        throw new Error(
            message
        );

    }

}



// =================================
// BROWSER ENGINE LOADER
// =================================


async function loadBrowserEngine(
    relativePath,
    globalName
) {


    const source =

        await fs.readFile(

            path.join(
                ROOT,
                relativePath
            ),

            "utf8"

        );


    const sandbox = {


        window:
            {},


        console:
            console,


        Date:
            Date,


        Math:
            Math,


        JSON:
            JSON,


        Number:
            Number,


        String:
            String,


        Boolean:
            Boolean,


        Array:
            Array,


        Object:
            Object,


        Map:
            Map,


        Set:
            Set,


        Error:
            Error

    };


    vm.createContext(
        sandbox
    );


    vm.runInContext(

        source,
        sandbox,

        {
            filename:
                relativePath
        }

    );


    const engine =

        sandbox.window[
            globalName
        ];


    if (
        !engine
    ) {


        throw new Error(

            `Could not load ${globalName} from ${relativePath}.`

        );

    }


    return engine;

}



// =================================
// BASIC HELPERS
// =================================


function round(
    value,
    decimals = 2
) {


    return Number(

        Number(
            value
        )
            .toFixed(
                decimals
            )

    );

}



function clamp(
    value,
    minimum,
    maximum
) {


    return Math.min(

        maximum,

        Math.max(
            minimum,
            value
        )

    );

}



// =================================
// TEST RATINGS
// =================================


const COMPANY_STRENGTH = {


    aew:
        0.62,


    owl:
        0.54,


    tna:
        0.43,


    wwe:
        0.36,


    cmll:
        0.30,


    aaa:
        0.22,


    nxt:
        0.15,


    roh:
        0.08

};



function companyStrength(
    companyId
) {


    return (

        COMPANY_STRENGTH[
            companyId
        ]

        ??

        0

    );

}



function weeklyOverallRating({

    companyId,
    showIndex,
    weekIndex

}) {


    const base =
        3.25;


    const companyBonus =

        companyStrength(
            companyId
        );


    const showVariation =

        (
            showIndex % 3
        )

        *

        0.04;


    const weeklyTrend =

        weekIndex

        *

        0.06;


    return round(

        clamp(

            base

            +

            companyBonus

            +

            showVariation

            +

            weeklyTrend,

            0,

            5

        )

    );

}



function majorEventRating(
    companyId,
    companyIndex
) {


    return round(

        clamp(

            3.45

            +

            companyStrength(
                companyId
            )

            +

            (
                companyIndex
                *
                0.015
            ),

            0,

            5

        )

    );

}



// =================================
// EVENT FIXTURE GENERATION
// =================================


function makeWeeklyEvent({

    show,
    showIndex,
    weekIndex

}) {


    const overallRating =

        weeklyOverallRating({

            companyId:
                show.companyId,

            showIndex:
                showIndex,

            weekIndex:
                weekIndex

        });


    const stage =

        WEEKLY_STAGES[
            weekIndex
        ];


    return {


        id:

            `${PERIOD_ID}-${stage}-${show.id}`,


        periodId:
            PERIOD_ID,


        stage:
            stage,


        eventType:
            "weekly",


        companyId:
            show.companyId,


        showId:
            show.id,


        eventName:
            show.name,


        bookingStyle:
            "Standard",


        overallRating:
            overallRating,


        location: {


            venue:

                `Test Venue ${showIndex + 1}`,


            city:

                `Test City ${showIndex + 1}`,


            region:
                "Test Region",


            country:
                "Test Country"

        },


        matches: [


            {


                id:

                    `${PERIOD_ID}-${stage}-${show.id}-match-1`,


                matchType:
                    "singles",


                resultText:

                    `Test ${show.shortName || show.name} Alpha defeated Test ${show.shortName || show.name} Beta.`,


                rating:

                    round(

                        clamp(

                            overallRating
                            +
                            0.12,

                            0,
                            5

                        )

                    ),


                storyContext:
                    ""

            },


            {


                id:

                    `${PERIOD_ID}-${stage}-${show.id}-match-2`,


                matchType:
                    "singles",


                resultText:

                    `Test ${show.shortName || show.name} Gamma defeated Test ${show.shortName || show.name} Delta.`,


                rating:

                    round(

                        clamp(

                            overallRating
                            -
                            0.08,

                            0,
                            5

                        )

                    ),


                storyContext:
                    ""

            }


        ],


        segments: [


            {


                segmentType:
                    "story-segment",


                summary:

                    `Test story context for ${show.name}.`,


                rating:
                    null

            }


        ],


        universeNotes:

            (
                show.id ===
                "aaa-lucha-libre"

                &&

                weekIndex ===
                3
            )

                ? "JoW canon test: Test Wrestler Nova signed with AAA."

                : ""

    };

}



function makeMajorEvent({

    company,
    companyIndex

}) {


    const overallRating =

        majorEventRating(

            company.id,
            companyIndex

        );


    return {


        id:

            `${PERIOD_ID}-major-${company.id}`,


        periodId:
            PERIOD_ID,


        stage:
            "showdown-saturday",


        eventType:
            "major-event",


        companyId:
            company.id,


        showId:
            "",


        eventName:

            `${company.name} October Test Event`,


        bookingStyle:
            "Standard",


        overallRating:
            overallRating,


        location: {


            venue:

                `${company.name} Test Arena`,


            city:

                `Showdown City ${companyIndex + 1}`,


            region:
                "Test Region",


            country:
                "Test Country"

        },


        matches: [


            {


                id:

                    `${PERIOD_ID}-major-${company.id}-match-1`,


                matchType:
                    "singles",


                resultText:

                    `Test ${company.name} Major Alpha defeated Test ${company.name} Major Beta.`,


                rating:

                    round(

                        clamp(

                            overallRating
                            +
                            0.16,

                            0,
                            5

                        )

                    )

            },


            {


                id:

                    `${PERIOD_ID}-major-${company.id}-match-2`,


                matchType:
                    "singles",


                resultText:

                    `Test ${company.name} Major Gamma defeated Test ${company.name} Major Delta.`,


                rating:

                    round(

                        clamp(

                            overallRating
                            -
                            0.04,

                            0,
                            5

                        )

                    )

            }


        ],


        segments:
            [],


        universeNotes:

            company.id ===
            "roh"

                ? "JoW canon test: Test Wrestler Orion officially retired."

                : ""

    };

}



// =================================
// LOAD DIRECTORY
// =================================


const [

    companiesData,
    showsData

] =

    await Promise.all([


        readJson(
            "data/landscape/companies.json"
        ),


        readJson(
            "data/landscape/shows.json"
        )


    ]);



const companies =

    companiesData.companies

    ||

    [];



const shows =

    showsData.shows

    ||

    [];



assert(

    companies.length === 8,

    `Expected 8 Landscape companies, found ${companies.length}.`

);



assert(

    shows.length === 11,

    `Expected 11 Landscape weekly shows, found ${shows.length}.`

);



// =================================
// BUILD 52-EVENT TEST CYCLE
// =================================


const weeklyEvents =
    [];



WEEKLY_STAGES.forEach(

    (
        stage,
        weekIndex
    ) => {


        shows.forEach(

            (
                show,
                showIndex
            ) => {


                weeklyEvents.push(

                    makeWeeklyEvent({

                        show:
                            show,

                        showIndex:
                            showIndex,

                        weekIndex:
                            weekIndex

                    })

                );

            }

        );

    }

);



const majorEvents =

    companies.map(

        (
            company,
            companyIndex
        ) =>

            makeMajorEvent({

                company:
                    company,

                companyIndex:
                    companyIndex

            })

    );



const events = [

    ...weeklyEvents,
    ...majorEvents

];



assert(

    weeklyEvents.length === 44,

    `Expected 44 weekly events, found ${weeklyEvents.length}.`

);



assert(

    majorEvents.length === 8,

    `Expected 8 major events, found ${majorEvents.length}.`

);



assert(

    events.length === 52,

    `Expected 52 total events, found ${events.length}.`

);



// =================================
// LOAD LANDSCAPE ENGINES
// =================================


const [

    scoreEngine,
    awardsEngine,
    braggingRightsEngine

] =

    await Promise.all([


        loadBrowserEngine(

            "js/landscape-score-engine.js",

            "LandscapeScoreEngine"

        ),


        loadBrowserEngine(

            "js/landscape-awards-engine.js",

            "LandscapeAwardsEngine"

        ),


        loadBrowserEngine(

            "js/landscape-bragging-rights-engine.js",

            "LandscapeBraggingRightsEngine"

        )


    ]);



// =================================
// CALCULATE RANKINGS
// =================================


const monthly =

    scoreEngine
        .calculateMonthlyRankings({


            events:
                events,


            shows:
                shows,


            companies:
                companies,


            periodId:
                PERIOD_ID


        });



const ytd =

    scoreEngine
        .calculateYtdRankings({


            events:
                events,


            shows:
                shows,


            companies:
                companies,


            periodId:
                PERIOD_ID


        });



assert(

    monthly.companyRankings.length === 8,

    `Expected 8 company rankings, found ${monthly.companyRankings.length}.`

);



assert(

    monthly.showRankings.length === 11,

    `Expected 11 show rankings, found ${monthly.showRankings.length}.`

);



assert(

    monthly.companyRankings.every(

        item =>

            Number.isFinite(
                Number(
                    item.landscapeScore
                )
            )

    ),

    "One or more company rankings are missing a Landscape Score."

);



assert(

    monthly.showRankings.every(

        item =>

            Number.isFinite(
                Number(
                    item.landscapeScore
                )
            )

    ),

    "One or more show rankings are missing a Landscape Score."

);



const rankingPeriod = {


    periodId:
        PERIOD_ID,


    frozenAt:
        "2099-10-31T23:59:59.000Z",


    monthly:
        monthly,


    ytd:
        ytd

};



const rankingsData = {


    version:
        1,


    scoreVersion:

        scoreEngine.SCORE_VERSION

        ||

        1,


    latestPeriodId:
        PERIOD_ID,


    periods: [

        rankingPeriod

    ]

};



// =================================
// MONTHLY HONORS
// =================================


const monthlyHonors =

    awardsEngine
        .calculateMonthlyHonors({


            periodId:
                PERIOD_ID,


            events:
                events,


            monthlyRankings:
                monthly,


            previousMonthlyRankings:
                null


        });



assert(

    monthlyHonors
        ?.awards
        ?.companyOfTheMonth,

    "Company of the Month was not generated."

);



assert(

    monthlyHonors
        ?.awards
        ?.showOfTheMonth,

    "Show of the Month was not generated."

);



assert(

    monthlyHonors
        ?.awards
        ?.majorEventOfTheMonth,

    "Major Event of the Month was not generated."

);



assert(

    monthlyHonors
        ?.awards
        ?.matchOfTheMonth,

    "Match of the Month was not generated."

);



const awardsData = {


    version:
        1,


    awardVersion:

        awardsEngine.AWARD_VERSION

        ||

        1,


    latestPeriodId:
        PERIOD_ID,


    monthly: [

        monthlyHonors

    ],


    yearly:
        []

};



// =================================
// BRAGGING RIGHTS QUALIFICATION
// =================================


const qualificationSnapshot =

    braggingRightsEngine
        .createQualificationSnapshot({


            year:
                TEST_YEAR,


            rankingsData:
                rankingsData,


            cutoffMonth:
                "10"


        });



assert(

    qualificationSnapshot
        .companyOrder
        .length ===
        8,

    "Bragging Rights qualification did not include all 8 companies."

);



const qualificationSlots =

    qualificationSnapshot
        .companyOrder
        .reduce(

            (
                total,
                company
            ) =>

                total

                +

                Number(
                    company.allocation || 0
                ),

            0

        );



assert(

    qualificationSlots === 11,

    `Expected 11 core Bragging Rights slots, found ${qualificationSlots}.`

);



// =================================
// WRITE RUNNER-ONLY FIXTURE
// =================================


await Promise.all([


    writeJson(

        "data/landscape/events.json",

        {
            version:
                1,

            events:
                events
        }

    ),


    writeJson(

        "data/landscape/rankings.json",

        rankingsData

    ),


    writeJson(

        "data/landscape/awards.json",

        awardsData

    ),


    writeJson(

        "data/landscape/archive-index.json",

        {


            version:
                1,


            latestPeriodId:
                PERIOD_ID,


            periods: [


                {


                    id:
                        PERIOD_ID,


                    label:
                        "October 2099",


                    weeklyShowsRecorded:
                        44,


                    weeklyShowsComplete:
                        true,


                    majorEventsRecorded:
                        8,


                    showdownSaturdayComplete:
                        true,


                    rankingsFinalized:
                        true

                }


            ]

        }

    )


]);



// =================================
// BUILD INDUSTRY PULSE
// =================================


await execFileAsync(

    process.execPath,

    [
        "scripts/build-landscape-pulse-context.mjs"
    ],

    {
        cwd:
            ROOT
    }

);



const pulseQueue =

    await readJson(

        "data/innanet/landscape-pulse-queue.json"

    );



const testPulse =

    pulseQueue
        .pendingPulses
        ?.find(

            pulse =>

                pulse.pulseId ===
                `landscape-monthly-${PERIOD_ID}`

        );



assert(

    testPulse,

    "Landscape Industry Pulse was not created."

);



assert(

    testPulse.companyRankings.length === 8,

    "Industry Pulse is missing company rankings."

);



assert(

    testPulse.showRankings.length === 11,

    "Industry Pulse is missing show rankings."

);



assert(

    testPulse.majorEventBattle.length === 8,

    `Expected 8 events in Major Event Battle, found ${testPulse.majorEventBattle.length}.`

);



assert(

    testPulse.topMatches.length > 0,

    "Industry Pulse contains no Top Matches."

);



assert(

    testPulse.honors
        ?.companyOfTheMonth,

    "Industry Pulse is missing monthly Honors."

);



// =================================
// BUILD WWOW LANDSCAPE CONTEXT
// =================================


const wwowLandscapeContext =

    await buildWwowLandscapeContext({


        root:
            ROOT,


        periodId:
            PERIOD_ID


    });



assert(

    wwowLandscapeContext,

    "WWoW Landscape context was not created."

);



assert(

    wwowLandscapeContext
        .summary
        .landscapeEventCount ===
        52,

    `WWoW expected 52 Landscape events, found ${wwowLandscapeContext.summary.landscapeEventCount}.`

);



assert(

    wwowLandscapeContext
        .summary
        .majorEventCount ===
        8,

    `WWoW expected 8 major events, found ${wwowLandscapeContext.summary.majorEventCount}.`

);



assert(

    wwowLandscapeContext
        .summary
        .rankingFrozen ===
        true,

    "WWoW did not recognize the frozen ranking period."

);



assert(

    wwowLandscapeContext
        .summary
        .honorsAvailable ===
        true,

    "WWoW did not receive monthly Honors."

);



assert(

    wwowLandscapeContext
        .currentCompetition
        .rankingPeriod,

    "WWoW Landscape context is missing the frozen ranking period."

);



assert(

    wwowLandscapeContext
        .currentCompetition
        .majorEventBattle
        .length ===
        8,

    `WWoW expected 8 Major Event Battle entries, found ${wwowLandscapeContext.currentCompetition.majorEventBattle.length}.`

);



assert(

    wwowLandscapeContext
        .monthlyWorld
        .topMatches
        .length > 0,

    "WWoW Landscape context contains no Top Matches."

);



// =================================
// FINAL REPORT
// =================================


console.log(
    ""
);


console.log(
    "========================================"
);


console.log(
    "LANDSCAPE END-TO-END CORE TEST PASSED"
);


console.log(
    "========================================"
);


console.log(

    `Events: ${events.length}`

);


console.log(

    `Weekly events: ${weeklyEvents.length}`

);


console.log(

    `Major events: ${majorEvents.length}`

);


console.log(

    `Company rankings: ${monthly.companyRankings.length}`

);


console.log(

    `Show rankings: ${monthly.showRankings.length}`

);


console.log(

    `Bragging Rights core slots: ${qualificationSlots}`

);


console.log(

    `Industry Pulse: ${testPulse.pulseId}`

);


console.log(

    `WWoW Landscape events: ${wwowLandscapeContext.summary.landscapeEventCount}`

);


console.log(
    ""
);


console.log(
    "Top company:"
);


console.log(

    `${monthly.companyRankings[0].companyName} — ${monthly.companyRankings[0].landscapeScore}`

);


console.log(
    ""
);


console.log(
    "Top show:"
);


console.log(

    `${monthly.showRankings[0].showName} — ${monthly.showRankings[0].landscapeScore}`

);
