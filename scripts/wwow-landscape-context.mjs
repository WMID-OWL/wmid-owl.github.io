import fs from "node:fs/promises";
import path from "node:path";



// =================================
// JSON HELPER
// =================================


async function readJson(
    root,
    relativePath,
    fallback
) {


    const fullPath =

        path.join(
            root,
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



// =================================
// BASIC HELPERS
// =================================


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



function cleanText(
    value
) {


    return String(
        value || ""
    )
        .trim();

}



function companyDirectoryMap(
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



function showDirectoryMap(
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
// RANKING PERIOD HELPERS
// =================================


function rankingPeriods(
    rankingsData
) {


    return (

        Array.isArray(
            rankingsData?.periods
        )

            ? [

                ...rankingsData.periods

            ]

            : []

    )

        .filter(

            period =>

                period?.periodId

        )

        .sort(

            (
                a,
                b
            ) =>

                String(
                    a.periodId
                )

                    .localeCompare(

                        String(
                            b.periodId
                        )

                    )

        );

}



function currentRankingPeriod(
    periods,
    periodId
) {


    return (

        periods.find(

            period =>

                period.periodId ===
                periodId

        )

        ||

        null

    );

}



function previousRankingPeriod(
    periods,
    periodId
) {


    return (

        periods

            .filter(

                period =>

                    period.periodId <
                    periodId

            )

            .at(
                -1
            )

        ||

        null

    );

}



// =================================
// MATCH FACTS
// =================================


function simplifyMatch(
    match
) {


    return {


        id:
            match.id || "",


        matchType:

            match.matchType

            ||

            match.type

            ||

            "",


        division:
            match.division || "",


        tournamentRound:
            match.tournamentRound || "",


        resultText:

            cleanText(
                match.resultText
            ),


        rating:

            numberOrNull(
                match.rating
            ),


        titleName:

            match.titleName

            ||

            match.championship

            ||

            "",


        titleChange:

            Boolean(
                match.titleChange
            ),


        titleRetention:

            Boolean(
                match.titleRetention
            )

    };

}



// =================================
// SEGMENT FACTS
// =================================


function simplifySegment(
    segment
) {


    return {


        title:

            segment.title

            ||

            segment.name

            ||

            "",


        type:

            segment.type

            ||

            segment.segmentType

            ||

            "",


        summary:

            cleanText(

                segment.summary

                ||

                segment.resultText

                ||

                segment.notes

            ),


        rating:

            numberOrNull(
                segment.rating
            ),


        participants:

            Array.isArray(
                segment.participants
            )

                ? segment.participants

                : []

    };

}



// =================================
// EVENT FACTS
// =================================


function simplifyEvent(
    event,
    companiesById,
    showsById
) {


    const matches =

        (

            Array.isArray(
                event.matches
            )

                ? event.matches

                : []

        )

            .map(
                simplifyMatch
            );


    const segments =

        (

            Array.isArray(
                event.segments
            )

                ? event.segments

                : []

        )

            .map(
                simplifySegment
            );


    return {


        id:
            event.id || "",


        periodId:
            event.periodId || "",


        stage:
            event.stage || "",


        cycleStage:

            event.cycleStage

            ||

            event.week

            ||

            "",


        eventType:
            event.eventType || "",


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


        showName:

            event.showId

                ? showName(
                    event.showId,
                    showsById
                )

                : "",


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


        location:
            event.location || null,


        universeNotes:

            cleanText(
                event.universeNotes
            ),


        matchCount:
            matches.length,


        segmentCount:
            segments.length,


        matches:
            matches,


        segments:
            segments

    };

}



// =================================
// TOP MATCHES
// =================================


function collectTopMatches(
    events
) {


    const matches =
        [];


    events.forEach(

        event => {


            event.matches.forEach(

                match => {


                    if (
                        match.rating ===
                        null
                    ) {


                        return;

                    }


                    matches.push({


                        eventId:
                            event.id,


                        eventName:
                            event.eventName,


                        eventType:
                            event.eventType,


                        companyId:
                            event.companyId,


                        companyName:
                            event.companyName,


                        showName:
                            event.showName,


                        division:
                            match.division,


                        tournamentRound:
                            match.tournamentRound,


                        resultText:
                            match.resultText,


                        rating:
                            match.rating

                    });

                }

            );

        }

    );


    return matches

        .sort(

            (
                a,
                b
            ) =>

                b.rating
                -
                a.rating

        )

        .slice(
            0,
            20
        );

}



// =================================
// MAJOR EVENT BATTLE
// =================================


function majorEventBattle(
    events
) {


    return events

        .filter(

            event =>

                event.eventType ===
                "major-event"

        )

        .filter(

            event =>

                event.overallRating !==
                null

        )

        .sort(

            (
                a,
                b
            ) =>

                b.overallRating
                -
                a.overallRating

        )

        .map(

            (
                event,
                index
            ) => ({


                rank:
                    index + 1,


                companyId:
                    event.companyId,


                companyName:
                    event.companyName,


                eventName:
                    event.eventName,


                overallRating:
                    event.overallRating,


                location:
                    event.location

            })

        );

}



// =================================
// EXPLICIT UNIVERSE DEVELOPMENTS
// =================================


function universeDevelopments(
    events
) {


    return events

        .filter(

            event =>

                cleanText(
                    event.universeNotes
                )

        )

        .map(

            event => ({


                eventId:
                    event.id,


                companyId:
                    event.companyId,


                companyName:
                    event.companyName,


                eventName:
                    event.eventName,


                notes:
                    event.universeNotes

            })

        );

}



// =================================
// CHAMPIONSHIP CANON
// =================================


function championLedger(
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


                            name:
                                title.name || "",


                            championName:
                                title.championName || "",


                            status:

                                title.status ===
                                "vacant"

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

        cleanText(
            change.periodId
        )

        ||

        cleanText(
            change.wonDate
        )
            .slice(
                0,
                7
            )

    );

}



function simplifyChampionshipChange(
    change,
    companiesById
) {


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



function championshipHistoryContext(
    championshipHistoryData,
    periodId,
    companiesById
) {


    const changes =

        (

            Array.isArray(
                championshipHistoryData?.changes
            )

                ? championshipHistoryData.changes

                : []

        )

            .map(

                change =>

                    simplifyChampionshipChange(

                        change,
                        companiesById

                    )

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


    return {


        currentPeriodChanges:

            changes.filter(

                change =>

                    change.periodId ===
                    periodId

            ),


        recentChanges:

            changes.slice(
                0,
                20
            )

    };

}



// =================================
// BRAGGING RIGHTS
// =================================


function braggingRightsEdition(
    braggingData,
    periodId
) {


    const editions =

        Array.isArray(
            braggingData?.editions
        )

            ? braggingData.editions

            : [];


    const edition =

        editions.find(

            item =>

                item.eventPeriodId ===
                periodId

        );


    if (
        !edition
    ) {


        return null;

    }


    return {


        year:
            edition.year,


        status:
            edition.status,


        qualificationPeriodId:
            edition.qualificationPeriodId,


        qualificationSnapshot:

            edition.qualificationSnapshot

            ||

            null,


        menChampion:

            edition.men
                ?.champion

            ||

            edition.men
                ?.bracket
                ?.winner

            ||

            null,


        menFinalist:

            edition.men
                ?.finalist

            ||

            edition.men
                ?.bracket
                ?.finalist

            ||

            null,


        womenChampion:

            edition.women
                ?.champion

            ||

            edition.women
                ?.bracket
                ?.winner

            ||

            null,


        womenFinalist:

            edition.women
                ?.finalist

            ||

            edition.women
                ?.bracket
                ?.finalist

            ||

            null,


        trophies:

            edition.trophies

            ||

            {}

    };

}



// =================================
// COMPANY DIRECTORY
// =================================


function simplifyCompanies(
    companies
) {


    return companies.map(

        company => ({


            id:
                company.id,


            name:
                company.name,


            shortName:
                company.shortName,


            type:
                company.type,


            rankingEligible:

                Boolean(
                    company.rankingEligible
                ),


            braggingRightsEligible:

                Boolean(
                    company.braggingRightsEligible
                ),


            shows:

                Array.isArray(
                    company.shows
                )

                    ? company.shows

                    : []

        })

    );

}



// =================================
// SHOW DIRECTORY
// =================================


function simplifyShows(
    shows,
    companiesById
) {


    return shows.map(

        show => ({


            id:
                show.id,


            name:
                show.name,


            shortName:
                show.shortName,


            companyId:
                show.companyId,


            companyName:

                companyName(
                    show.companyId,
                    companiesById
                ),


            day:
                show.day,


            dayOrder:
                show.dayOrder,


            showOrder:
                show.showOrder

        })

    );

}



// =================================
// MAIN BUILDER
// =================================


export async function buildWwowLandscapeContext({

    root,
    periodId

}) {


    const [

    companiesData,
    showsData,
    eventsData,
    rankingsData,
    championshipsData,
    championshipHistoryData,
    awardsData,
    braggingRightsData

] =

        await Promise.all([


            readJson(

                root,

                "data/landscape/companies.json",

                {
                    companies:
                        []
                }

            ),


            readJson(

                root,

                "data/landscape/shows.json",

                {
                    shows:
                        []
                }

            ),


            readJson(

                root,

                "data/landscape/events.json",

                {
                    events:
                        []
                }

            ),


            readJson(

                root,

                "data/landscape/rankings.json",

                {
                    periods:
                        []
                }

            ),


           readJson(

    root,

    "data/landscape/championships.json",

    {
        version:
            1,

        titles:
            []
    }

),


readJson(

    root,

    "data/landscape/championship-history.json",

    {
        version:
            1,

        changes:
            []
    }

),

            readJson(

                root,

                "data/landscape/awards.json",

                {
                    monthly:
                        [],
                    yearly:
                        []
                }

            ),


            readJson(

                root,

                "data/landscape/bragging-rights.json",

                {
                    editions:
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


    const companiesById =

        companyDirectoryMap(
            companies
        );


    const showsById =

        showDirectoryMap(
            shows
        );


    const periods =

        rankingPeriods(
            rankingsData
        );


    const currentPeriod =

        currentRankingPeriod(

            periods,
            periodId

        );


    const previousPeriod =

        previousRankingPeriod(

            periods,
            periodId

        );


    const periodEvents =

        (

            Array.isArray(
                eventsData.events
            )

                ? eventsData.events

                : []

        )

            .filter(

                event =>

                    event.periodId ===
                    periodId

            )

            .map(

                event =>

                    simplifyEvent(

                        event,
                        companiesById,
                        showsById

                    )

            );


    const monthlyHonor =

        (

            Array.isArray(
                awardsData.monthly
            )

                ? awardsData.monthly

                : []

        )

            .find(

                award =>

                    award.periodId ===
                    periodId

            )

        ||

        null;


    const recentRankingHistory =

        periods

            .filter(

                period =>

                    period.periodId <
                    periodId

            )

            .slice(
                -6
            )

            .map(

                period => ({


                    periodId:
                        period.periodId,


                    monthly:

                        period.monthly

                        ||

                        null,


                    ytd:

                        period.ytd

                        ||

                        null

                })

            );
const currentChampionLedger =

    championLedger(

        championshipsData,
        companiesById

    );


const championshipHistory =

    championshipHistoryContext(

        championshipHistoryData,
        periodId,
        companiesById

    );


const currentTitles =

    currentChampionLedger

        .flatMap(

            company =>

                company.titles

        );

    return {


        periodId:
            periodId,


        rules: {


            canonBoundary:

                "Landscape events, rankings, awards, champion changes, explicit universe notes, and Bragging Rights results supplied here are canon.",


            competitionLayers:

                [
                    "Promotion Power Rankings",
                    "Show Power Rankings",
                    "Monthly Major Event Battle",
                    "Performance Leaderboards and Records"
                ],


            scoreMeaning:

                "Landscape Score is the official derived performance metric used to compare companies and weekly shows.",


            segmentRule:

                "Segments are story context. Segment ratings do not enter Top Matches or direct in-ring match quality scoring.",


            prestigeRule:

                "Event prestige is historical and editorial context. Prestige does not automatically add rating points.",


            speculationRule:

                "WWoW may analyze, criticize, praise, joke, and clearly speculate. It may not invent matches, results, title changes, contracts, firings, injuries, retirements, signings, backstage incidents, relationships, or quotes."

        },


        summary: {


            companyCount:
                companies.length,


            weeklyShowCount:
                shows.length,


            landscapeEventCount:
                periodEvents.length,


            majorEventCount:

                periodEvents.filter(

                    event =>

                        event.eventType ===
                        "major-event"

                )
                    .length,


            specialEventCount:

                periodEvents.filter(

                    event =>

                        event.eventType ===
                        "special-event"

                )
                    .length,


            rankingFrozen:

                Boolean(
                    currentPeriod
                ),


            honorsAvailable:

    Boolean(
        monthlyHonor
    ),


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


currentPeriodChampionshipChangeCount:

    championshipHistory
        .currentPeriodChanges
        .length

        },


        directory: {


            companies:

                simplifyCompanies(
                    companies
                ),


            shows:

                simplifyShows(

                    shows,
                    companiesById

                )

        },


        currentCompetition: {


            rankingPeriod:

                currentPeriod

                ||

                null,


            previousRankingPeriod:

                previousPeriod

                ||

                null,


            monthlyHonors:
                monthlyHonor,


            majorEventBattle:

                majorEventBattle(
                    periodEvents
                )

        },


        monthlyWorld: {


            events:
                periodEvents,


            topMatches:

                collectTopMatches(
                    periodEvents
                ),


            universeDevelopments:

                universeDevelopments(
                    periodEvents
                )

        },


        championLedger:
    currentChampionLedger,


championshipHistory:
    championshipHistory,


        braggingRights:

            braggingRightsEdition(

                braggingRightsData,
                periodId

            ),


        recentRankingHistory:
            recentRankingHistory

    };

}
