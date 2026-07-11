import fs from "node:fs/promises";
import path from "node:path";



const ROOT =
    process.cwd();



const INDUSTRY_ACCOUNT_IDS =

    new Set([

        "wrestlingwire",
        "wrestlingenjoyer",
        "complaintdepartment",
        "landscapenumbers",
        "workratewonk",
        "grapevine"

    ]);



// =================================
// FILE HELPERS
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


        const text =

            await fs.readFile(
                fullPath,
                "utf8"
            );


        return JSON.parse(
            text
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
// BASIC HELPERS
// =================================


function normalize(
    value
) {


    return String(
        value || ""
    )
        .trim()
        .toLowerCase();

}



function numberOrNull(
    value
) {


    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )

        ? number

        : null;

}



function monthLabel(
    periodId
) {


    const match =

        String(
            periodId || ""
        )
            .match(
                /^(\d{4})-(\d{2})$/
            );


    if (
        !match
    ) {


        return periodId || "";

    }


    const year =
        Number(
            match[1]
        );


    const month =
        Number(
            match[2]
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

}



function average(
    values
) {


    const usable =

        values

            .map(
                numberOrNull
            )

            .filter(

                value =>

                    value !== null

            );


    if (
        usable.length === 0
    ) {


        return null;

    }


    return (

        usable.reduce(

            (
                total,
                value
            ) =>

                total + value,

            0

        )

        /

        usable.length

    );

}



function round(
    value,
    decimals = 2
) {


    const number =

        numberOrNull(
            value
        );


    if (
        number === null
    ) {


        return null;

    }


    return Number(

        number.toFixed(
            decimals
        )

    );

}// =================================
// ARCHIVE MEMORY
// =================================


async function loadInnanetArchives(
    archiveIndex
) {


    const months =

        Array.isArray(
            archiveIndex?.months
        )

            ? archiveIndex.months

            : [];


    const archives =
        [];


    for (
        const item of months
    ) {


        if (
            !item?.file
        ) {


            continue;

        }


        try {


            const data =

                await readJson(
                    item.file
                );


            archives.push({
                meta:
                    item,

                data:
                    data
            });

        }


        catch (
            error
        ) {


            console.warn(

                `Skipping Innanet archive ${item.file}: ${error.message}`

            );

        }

    }


    return archives;

}



function archivedPulseIds(
    archives
) {


    const ids =
        new Set();


    archives.forEach(

        archive => {


            (

                archive.data
                    ?.events

                ||

                []

            )

                .forEach(

                    event => {


                        const id =

                            event.eventId

                            ||

                            event.pulseId

                            ||

                            "";


                        if (
                            id
                        ) {


                            ids.add(
                                id
                            );

                        }

                    }

                );

        }

    );


    return ids;

}



// =================================
// DIRECTORY HELPERS
// =================================


function companyMap(
    companies
) {


    return Object.fromEntries(

        companies.map(

            company => [

                company.id,
                company

            ]

        )

    );

}



function showMap(
    shows
) {


    return Object.fromEntries(

        shows.map(

            show => [

                show.id,
                show

            ]

        )

    );

}



function companyName(
    companyId,
    companiesById
) {


    return (

        companiesById[
            companyId
        ]
            ?.name

        ||

        companyId

        ||

        "Unknown Company"

    );

}



function showName(
    showId,
    showsById
) {


    return (

        showsById[
            showId
        ]
            ?.name

        ||

        showId

        ||

        "Unknown Show"

    );

}



// =================================
// MATCH FACTS
// =================================


function collectMatches(
    events,
    companiesById,
    showsById
) {


    const matches =
        [];


    events.forEach(

        event => {


            (

                event.matches

                ||

                []

            )

                .forEach(

                    match => {


                        const rating =

                            numberOrNull(
                                match.rating
                            );


                        if (
                            rating === null
                        ) {


                            return;

                        }


                        matches.push({


                            eventId:
                                event.id,


                            eventName:

                                event.eventName

                                ||

                                showName(
                                    event.showId,
                                    showsById
                                ),


                            eventType:
                                event.eventType,


                            companyId:
                                event.companyId || "",


                            companyName:

                                event.companyId

                                    ? companyName(
                                        event.companyId,
                                        companiesById
                                    )

                                    : "Landscape Special Event",


                            resultText:

                                match.resultText

                                ||

                                "Untitled Match",


                            rating:
                                rating,


                            storyContext:

                                match.storyContext

                                ||

                                "",


                            division:

                                match.division

                                ||

                                "",


                            tournamentRound:

                                match.tournamentRound

                                ||

                                ""

                        });

                    }

                );

        }

    );


    matches.sort(

        (
            a,
            b
        ) =>

            b.rating
            -
            a.rating

    );


    return matches;

}



// =================================
// EVENT FACTS
// =================================


function eventFacts(
    events,
    companiesById,
    showsById
) {


    return events.map(

        event => ({


            eventId:
                event.id,


            eventType:
                event.eventType,


            stage:
                event.stage,


            companyId:
                event.companyId || "",


            companyName:

                event.companyId

                    ? companyName(
                        event.companyId,
                        companiesById
                    )

                    : "Landscape Special Event",


            showId:
                event.showId || "",


            eventName:

                event.eventName

                ||

                showName(
                    event.showId,
                    showsById
                ),


            overallRating:

                numberOrNull(
                    event.overallRating
                ),


            matchAverage:

                round(

                    average(

                        (

                            event.matches

                            ||

                            []

                        )

                            .map(

                                match =>

                                    match.rating

                            )

                    )

                ),


            matchCount:

                event.matches
                    ?.length

                ||

                0,


            segmentCount:

                event.segments
                    ?.length

                ||

                0,


            location:
                event.location || null,


            universeNotes:

                String(
                    event.universeNotes || ""
                )
                    .trim()

        })

    );

}// =================================
// MOVEMENT
// =================================


function calculateMovement(
    currentItems,
    previousItems,
    idField
) {


    if (
        !Array.isArray(
            previousItems
        )
    ) {


        return [];

    }


    const previousRanks =

        new Map(

            previousItems.map(

                item => [

                    item[
                        idField
                    ],

                    Number(
                        item.rank
                    )

                ]

            )

        );


    return currentItems

        .map(

            item => {


                const previousRank =

                    previousRanks.get(

                        item[
                            idField
                        ]

                    );


                if (
                    !Number.isFinite(
                        previousRank
                    )
                ) {


                    return {


                        id:
                            item[
                                idField
                            ],


                        name:

                            item.companyName

                            ||

                            item.showName

                            ||

                            item[
                                idField
                            ],


                        previousRank:
                            null,


                        currentRank:

                            Number(
                                item.rank
                            ),


                        movement:
                            null,


                        label:
                            "NEW"

                    };

                }


                const movement =

                    previousRank

                    -

                    Number(
                        item.rank
                    );


                return {


                    id:
                        item[
                            idField
                        ],


                    name:

                        item.companyName

                        ||

                        item.showName

                        ||

                        item[
                            idField
                        ],


                    previousRank:
                        previousRank,


                    currentRank:

                        Number(
                            item.rank
                        ),


                    movement:
                        movement,


                    label:

                        movement > 0

                            ? `UP ${movement}`

                            : movement < 0

                                ? `DOWN ${Math.abs(
                                    movement
                                )}`

                                : "UNCHANGED"

                };

            }

        )

        .sort(

            (
                a,
                b
            ) =>

                Math.abs(
                    b.movement || 0
                )

                -

                Math.abs(
                    a.movement || 0
                )

        );

}



// =================================
// CHAMPIONSHIP CANON
// =================================


function simplifyChampions(
    championshipsData,
    companiesById
) {


    const titles =

        Array.isArray(
            championshipsData?.titles
        )

            ? championshipsData.titles

            : [];


    const companyIds =

        [

            ...new Set([

                ...Object.keys(
                    companiesById
                )

                    .filter(

                        companyId =>

                            companyId !==
                            "owl"

                    ),

                ...titles

                    .map(

                        title =>

                            title.companyId

                    )

                    .filter(
                        Boolean
                    )

            ])

        ]

            .sort(

                (
                    a,
                    b
                ) =>

                    companyName(
                        a,
                        companiesById
                    )

                        .localeCompare(

                            companyName(
                                b,
                                companiesById
                            )

                        )

            );


    return companyIds.map(

        companyId => ({


            companyId:
                companyId,


            companyName:

                companyName(
                    companyId,
                    companiesById
                ),


            titles:

                titles

                    .filter(

                        title =>

                            title.companyId ===
                            companyId

                    )

                    .sort(

                        (
                            a,
                            b
                        ) =>

                            String(
                                a.name || ""
                            )

                                .localeCompare(

                                    String(
                                        b.name || ""
                                    )

                                )

                    )

                    .map(

                        title => ({


                            id:
                                title.id || "",


                            titleName:

                                title.name

                                ||

                                "Championship",


                            championName:
                                title.championName || "",


                            status:

                                title.status ===
                                "vacant"

                                ||

                                !title.championName

                                    ? "vacant"

                                    : "active",


                            wonPeriodId:
                                title.wonPeriodId || "",


                            wonEventId:
                                title.wonEventId || "",


                            wonEventName:
                                title.wonEventName || "",


                            wonDate:
                                title.wonDate || ""

                        })

                    )

        })

    );

}



function championshipChangePeriod(
    change
) {


    return (

        String(
            change.periodId || ""
        )
            .trim()

        ||

        String(
            change.wonDate || ""
        )
            .slice(
                0,
                7
            )

    );

}



function simplifyChampionshipHistory(
    championshipHistoryData,
    companiesById
) {


    return (

        Array.isArray(
            championshipHistoryData?.changes
        )

            ? championshipHistoryData.changes

            : []

    )

        .map(

            change => {


                const companyId =
                    change.companyId || "";


                return {


                    id:
                        change.id || "",


                    titleId:
                        change.titleId || "",


                    companyId:
                        companyId,


                    companyName:

                        companyName(
                            companyId,
                            companiesById
                        ),


                    titleName:
                        change.titleName || "",


                    previousChampionName:
                        change.previousChampionName || "",


                    newChampionName:
                        change.newChampionName || "",


                    changeType:
                        change.changeType || "",


                    periodId:

                        championshipChangePeriod(
                            change
                        ),


                    eventId:
                        change.eventId || "",


                    eventName:
                        change.eventName || "",


                    wonDate:
                        change.wonDate || "",


                    recordedAt:
                        change.recordedAt || ""

                };

            }

        )

        .sort(

            (
                a,
                b
            ) =>

                String(
                    b.periodId ||
                    b.wonDate ||
                    b.recordedAt ||
                    ""
                )

                    .localeCompare(

                        String(
                            a.periodId ||
                            a.wonDate ||
                            a.recordedAt ||
                            ""
                        )

                    )

        );

}


// =================================
// MONTHLY PULSE
// =================================


function buildMonthlyPulse({

    rankingPeriod,
    previousRankingPeriod,
    periodEvents,
    companiesById,
    showsById,
    honors,
    champions,
    championshipHistory,
    availableAccounts

}) {

    const periodId =
        rankingPeriod.periodId;


    const monthly =

        rankingPeriod.monthly

        ||

        {};


    const previousMonthly =

        previousRankingPeriod
            ?.monthly

        ||

        null;


    const companyRankings =

        monthly.companyRankings

        ||

        [];


    const showRankings =

        monthly.showRankings

        ||

        [];


    const majorEvents =

        periodEvents

            .filter(

                event =>

                    event.eventType ===
                    "major-event"

            )

            .sort(

                (
                    a,
                    b
                ) =>

                    Number(
                        b.overallRating || 0
                    )

                    -

                    Number(
                        a.overallRating || 0
                    )

            );


    const topMatches =

        collectMatches(

            periodEvents,
            companiesById,
            showsById

        )
            .slice(
                0,
                12
            );


    const developments =

        periodEvents

            .filter(

                event =>

                    String(
                        event.universeNotes || ""
                    )
                        .trim()

            )

            .map(

                event => ({


                    eventId:
                        event.id,


                    companyName:

                        event.companyId

                            ? companyName(
                                event.companyId,
                                companiesById
                            )

                            : "Landscape Special Event",


                    eventName:

                        event.eventName

                        ||

                        showName(
                            event.showId,
                            showsById
                        ),


                    notes:

                        String(
                            event.universeNotes
                        )
                            .trim()

                })

            );

const currentPeriodChampionshipChanges =

    championshipHistory.filter(

        change =>

            change.periodId ===
            periodId

    );


const recentChampionshipChanges =

    championshipHistory

        .filter(

            change =>

                !change.periodId

                ||

                change.periodId <=
                periodId

        )

        .slice(
            0,
            20
        );


const currentTitles =

    champions.flatMap(

        company =>

            company.titles

    );
    return {


        pulseId:

            `landscape-monthly-${periodId}`,


        pulseType:
            "monthly-industry-report",


        periodId:
            periodId,


        label:

            `${monthLabel(
                periodId
            )} Landscape Report`,


        rules: {


            canonBoundary:

                "Only supplied structured Landscape facts are canon. Opinions, criticism, jokes, comparisons, and clearly labeled speculation are allowed. Do not invent matches, results, ratings, title changes, contracts, signings, firings, injuries, retirements, backstage incidents, relationships, or future booking as fact.",


            rankingMeaning:

                "Landscape Score is the official derived competition metric. Rankings and movement values may be discussed exactly as supplied.",


            rumorBoundary:

                "Rumor-style accounts may speculate only from supplied developments and must clearly frame speculation as rumor, possibility, or a question."

        },


        companyRankings:
            companyRankings,


        showRankings:
            showRankings,


        companyMovement:

            calculateMovement(

                companyRankings,

                previousMonthly
                    ?.companyRankings,

                "companyId"

            ),


        showMovement:

            calculateMovement(

                showRankings,

                previousMonthly
                    ?.showRankings,

                "showId"

            ),


        eventFacts:

            eventFacts(

                periodEvents,
                companiesById,
                showsById

            ),


        majorEventBattle:

            majorEvents.map(

                (
                    event,
                    index
                ) => ({


                    rank:
                        index + 1,


                    companyId:
                        event.companyId,


                    companyName:

                        companyName(
                            event.companyId,
                            companiesById
                        ),


                    eventName:
                        event.eventName,


                    overallRating:
                        event.overallRating,


                    location:
                        event.location || null

                })

            ),


        topMatches:
            topMatches,


        honors:

            honors
                ?.awards

            ||

            {},


       championshipSummary: {


    currentTitleCount:
        currentTitles.length,


    activeChampionCount:

        currentTitles.filter(

            title =>

                title.status ===
                "active"

        )
            .length,


    vacantTitleCount:

        currentTitles.filter(

            title =>

                title.status ===
                "vacant"

        )
            .length,


    currentPeriodChangeCount:
        currentPeriodChampionshipChanges.length

},


championLedger:
    champions,


championshipHistory: {


    currentPeriodChanges:
        currentPeriodChampionshipChanges,


    recentChanges:
        recentChampionshipChanges

},


        universeDevelopments:
            developments,


        availableAccounts:
            availableAccounts

    };

}// =================================
// BRAGGING RIGHTS PULSE
// =================================


function buildBraggingRightsPulse(
    edition,
    availableAccounts
) {


    return {


        pulseId:

            `bragging-rights-${edition.year}`,


        pulseType:
            "bragging-rights-special",


        periodId:
            edition.eventPeriodId,


        label:

            `${edition.year} Bragging Rights`,


        rules: {


            canonBoundary:

                "The tournament field, bracket results, ratings, champions, finalists, qualification order, and company affiliations supplied here are canon. Do not invent matches or tournament events.",


            companyPride:

                "Bragging Rights is a company-pride competition. No championships are at stake.",


            affiliationRule:

                "Each entrant's tournament affiliation is frozen to the company recorded for that edition."

        },


        qualification:

            edition
                .qualificationSnapshot

            ||

            null,


        men: {


            champion:

                edition.men
                    ?.champion

                ||

                edition.men
                    ?.bracket
                    ?.winner

                ||

                null,


            finalist:

                edition.men
                    ?.finalist

                ||

                edition.men
                    ?.bracket
                    ?.finalist

                ||

                null,


            bracket:

                edition.men
                    ?.bracket

                ||

                null

        },


        women: {


            champion:

                edition.women
                    ?.champion

                ||

                edition.women
                    ?.bracket
                    ?.winner

                ||

                null,


            finalist:

                edition.women
                    ?.finalist

                ||

                edition.women
                    ?.bracket
                    ?.finalist

                ||

                null,


            bracket:

                edition.women
                    ?.bracket

                ||

                null

        },


        trophies:

            edition.trophies

            ||

            {},


        availableAccounts:
            availableAccounts

    };

}



// =================================
// LOAD DATA
// =================================


const [

    companiesData,
    showsData,
    eventsData,
    rankingsData,
    championshipsData,
    championshipHistoryData,
    awardsData,
    braggingRightsData,
    accounts,
    innanetArchiveIndex

] =

    await Promise.all([


        readJson(
            "data/landscape/companies.json",
            {
                companies:
                    []
            }
        ),


        readJson(
            "data/landscape/shows.json",
            {
                shows:
                    []
            }
        ),


        readJson(
            "data/landscape/events.json",
            {
                events:
                    []
            }
        ),


        readJson(
            "data/landscape/rankings.json",
            {
                periods:
                    []
            }
        ),


        readJson(
    "data/landscape/championships.json",
    {
        version:
            1,

        titles:
            []
    }
),


readJson(
    "data/landscape/championship-history.json",
    {
        version:
            1,

        changes:
            []
    }
),


        readJson(
            "data/landscape/awards.json",
            {
                monthly:
                    []
            }
        ),


        readJson(
            "data/landscape/bragging-rights.json",
            {
                editions:
                    []
            }
        ),


        readJson(
            "data/innanet/accounts.json",
            []
        ),


        readJson(
            "data/innanet/archive-index.json",
            {
                months:
                    []
            }
        )


    ]);



const companies =

    Array.isArray(
        companiesData.companies
    )

        ? companiesData.companies

        : [];



const shows =

    Array.isArray(
        showsData.shows
    )

        ? showsData.shows

        : [];



const events =

    Array.isArray(
        eventsData.events
    )

        ? eventsData.events

        : [];



const rankingPeriods =

    Array.isArray(
        rankingsData.periods
    )

        ? [

            ...rankingsData.periods

        ]

        : [];



const monthlyHonors =

    Array.isArray(
        awardsData.monthly
    )

        ? awardsData.monthly

        : [];



const braggingEditions =

    Array.isArray(
        braggingRightsData.editions
    )

        ? braggingRightsData.editions

        : [];



const companiesById =

    companyMap(
        companies
    );



const showsById =

    showMap(
        shows
    );



const industryAccounts =

    accounts

        .filter(

            account =>

                INDUSTRY_ACCOUNT_IDS.has(
                    account.id
                )

                &&

                normalize(
                    account.status || "active"
                )
                !==
                "retired"

        );



const champions =

    simplifyChampions(

        championshipsData,
        companiesById

    );



const championshipHistory =

    simplifyChampionshipHistory(

        championshipHistoryData,
        companiesById

    );


const archives =

    await loadInnanetArchives(
        innanetArchiveIndex
    );



const alreadyPublished =

    archivedPulseIds(
        archives
    );



// =================================
// BUILD PULSE QUEUE
// =================================


const pulses =
    [];



rankingPeriods

    .sort(

        (
            a,
            b
        ) =>

            String(
                a.periodId || ""
            )

                .localeCompare(

                    String(
                        b.periodId || ""
                    )

                )

    )

    .forEach(

        (
            rankingPeriod,
            index
        ) => {


            if (
                !rankingPeriod?.monthly
            ) {


                return;

            }


            const periodId =

                rankingPeriod.periodId;


            const pulseId =

                `landscape-monthly-${periodId}`;


            if (
                alreadyPublished.has(
                    pulseId
                )
            ) {


                return;

            }


            const previousRankingPeriod =

                index > 0

                    ? rankingPeriods[
                        index - 1
                    ]

                    : null;


            const periodEvents =

                events.filter(

                    event =>

                        event.periodId ===
                        periodId

                );


            const honors =

                monthlyHonors.find(

                    item =>

                        item.periodId ===
                        periodId

                )

                ||

                null;


            pulses.push(

                buildMonthlyPulse({


                    rankingPeriod:
                        rankingPeriod,


                    previousRankingPeriod:
                        previousRankingPeriod,


                    periodEvents:
                        periodEvents,


                    companiesById:
                        companiesById,


                    showsById:
                        showsById,


                    honors:
                        honors,


                    champions:
    champions,


championshipHistory:
    championshipHistory,


availableAccounts:
    industryAccounts

                })

            );

        }

    );



braggingEditions

    .filter(

        edition =>

            normalize(
                edition.status
            )
            ===
            "complete"

    )

    .forEach(

        edition => {


            const pulseId =

                `bragging-rights-${edition.year}`;


            if (
                alreadyPublished.has(
                    pulseId
                )
            ) {


                return;

            }


            pulses.push(

                buildBraggingRightsPulse(

                    edition,
                    industryAccounts

                )

            );

        }

    );



pulses.sort(

    (
        a,
        b
    ) => {


        const periodCompare =

            String(
                a.periodId || ""
            )

                .localeCompare(

                    String(
                        b.periodId || ""
                    )

                );


        if (
            periodCompare !== 0
        ) {


            return periodCompare;

        }


        return String(
            a.pulseType || ""
        )

            .localeCompare(

                String(
                    b.pulseType || ""
                )

            );

    }

);



const output = {


    version:
        1,


    generatedAt:

        new Date()
            .toISOString(),


    pendingPulseCount:
        pulses.length,


    pendingPulses:
        pulses

};



await writeJson(

    "data/innanet/landscape-pulse-queue.json",

    output

);



console.log(

    `Built Landscape Industry Pulse context for ${pulses.length} pending pulse(s).`

);
