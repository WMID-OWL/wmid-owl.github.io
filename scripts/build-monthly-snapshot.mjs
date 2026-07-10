import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";


const ROOT =
    process.cwd();


const TARGET_MONTH =
    String(
        process.env.TARGET_MONTH || ""
    ).trim();


const ALLOW_REBUILD =

    String(
        process.env.ALLOW_REBUILD || ""
    )
        .trim()
        .toLowerCase()

    ===

    "true";



if (
    !/^\d{4}-\d{2}$/.test(
        TARGET_MONTH
    )
) {

    throw new Error(

        "TARGET_MONTH must use YYYY-MM format."

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



function asDate(
    dateString
) {

    return new Date(

        `${dateString}T00:00:00Z`

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



function monthEnd(
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
            month,
            0
        )

    )
        .toISOString()
        .slice(
            0,
            10
        );

}



// =================================
// RECORD HELPERS
// =================================


function record() {

    return {

        wins:
            0,

        losses:
            0,

        draws:
            0

    };

}



function addResult(
    target,
    result
) {

    if (
        result === "win"
    ) {

        target.wins +=
            1;

    }


    if (
        result === "loss"
    ) {

        target.losses +=
            1;

    }


    if (
        result === "draw"
    ) {

        target.draws +=
            1;

    }

}



function recordText(
    value
) {

    return (

        `${value.wins}-${value.losses}-${value.draws}`

    );

}



// =================================
// STREAK HELPERS
// =================================


function currentStreak(
    results
) {

    const decisions =

        results.filter(

            result =>

                result === "win"

                ||

                result === "loss"

        );


    if (
        !decisions.length
    ) {

        return {

            type:
                "none",

            count:
                0,

            label:
                "No active streak"

        };

    }


    const last =
        decisions.at(-1);


    let count =
        0;


    for (

        let index =
            decisions.length - 1;

        index >= 0;

        index -= 1

    ) {

        if (
            decisions[index]
            !==
            last
        ) {

            break;

        }


        count +=
            1;

    }


    return {

        type:

            last === "win"

                ? "winning"

                : "losing",

        count,

        label:

            `${count}-match ${

                last === "win"

                    ? "winning"

                    : "losing"

            } streak`

    };

}



function lastFiveRecord(
    results
) {

    const recent =

        results

            .filter(

                result =>

                    result !==
                    "no-contest"

            )

            .slice(
                -5
            );


    const value =
        record();


    recent.forEach(

        result =>

            addResult(
                value,
                result
            )

    );


    return {

        ...value,

        text:
            recordText(
                value
            )

    };

}



// =================================
// EVENT LOOKUP
// =================================


function getEventForMatch(
    match,
    eventMap,
    events
) {

    if (
        match.eventId

        &&

        eventMap[
            match.eventId
        ]
    ) {

        return eventMap[
            match.eventId
        ];

    }


    return events.find(

        event =>

            match.date ===
                event.date

            &&

            normalize(
                match.event
            )

            ===

            normalize(
                event.name
            )

    ) || null;

}



// =================================
// RANKING OUTPUT HELPERS
// =================================


function compactRanking(
    calculation
) {

    if (
        !calculation
    ) {

        return [];

    }


    return calculation
        .ranking
        .map(

            candidate => ({

                rank:
                    candidate.rank,

                id:
                    candidate.id,

                name:
                    candidate.name,

                brand:
                    candidate.brand,

                type:
                    candidate.type,

                powerScore:
                    candidate.powerScore,

                wins:
                    candidate.wins,

                losses:
                    candidate.losses,

                draws:
                    candidate.draws,

                matches:
                    candidate.matches,

                winStreak:
                    candidate.streak,

                currentChampion:

                    candidate.championBonus
                    >
                    0

            })

        );

}



function rankingMap(
    ranking
) {

    return Object.fromEntries(

        ranking.map(

            candidate => [

                candidate.id,

                candidate

            ]

        )

    );

}



// =================================
// ACTIVE TITLES
// =================================


function activeTitlesFor(

    holderType,

    holderId,

    asOfDate,

    reigns,

    championshipMap

) {

    const date =
        asDate(
            asOfDate
        );


    return reigns

        .filter(

            reign =>

                reign.holderType ===
                    holderType

                &&

                reign.holderId ===
                    holderId

                &&

                reign.wonDate

                &&

                asDate(
                    reign.wonDate
                )

                <=

                date

                &&

                (

                    !reign.lostDate

                    ||

                    asDate(
                        reign.lostDate
                    )

                    >

                    date

                )

        )

        .map(

            reign => ({

                championshipId:
                    reign.championshipId,

                championship:

                    championshipMap[
                        reign.championshipId
                    ]?.name

                    ||

                    reign.championshipId,

                wonDate:
                    reign.wonDate,

                defenses:

                    Number(
                        reign.defenses || 0
                    )

            })

        );

}



// =================================
// INNANET SENTIMENT
// =================================


function sentimentForPosts(
    posts
) {

    if (
        !posts.length
    ) {

        return {

            label:
                "not discussed",

            positiveSignals:
                0,

            negativeSignals:
                0,

            method:
                "keyword-heuristic"

        };

    }


    const positiveWords = [

        "great",

        "amazing",

        "excellent",

        "love",

        "star",

        "elite",

        "fire",

        "incredible",

        "impressive",

        "respect",

        "momentum",

        "dominant",

        "best",

        "clutch",

        "underrated",

        "deserved",

        "winner",

        "winning streak"

    ];


    const negativeWords = [

        "washed",

        "bum",

        "trash",

        "terrible",

        "awful",

        "fraud",

        "choke",

        "overrated",

        "boring",

        "sucks",

        "fell off",

        "collapse",

        "loser",

        "embarrassing",

        "mid",

        "jobber",

        "dead",

        "hate"

    ];


    let positiveSignals =
        0;


    let negativeSignals =
        0;


    posts.forEach(

        post => {

            const body =

                normalize(
                    post.body
                );


            positiveWords.forEach(

                word => {

                    if (
                        body.includes(
                            word
                        )
                    ) {

                        positiveSignals +=
                            1;

                    }

                }

            );


            negativeWords.forEach(

                word => {

                    if (
                        body.includes(
                            word
                        )
                    ) {

                        negativeSignals +=
                            1;

                    }

                }

            );

        }

    );


    let label =
        "neutral or unclear";


    if (
        positiveSignals
        >
        negativeSignals * 1.5

        &&

        positiveSignals >= 2
    ) {

        label =
            "mostly positive";

    }


    else if (
        negativeSignals
        >
        positiveSignals * 1.5

        &&

        negativeSignals >= 2
    ) {

        label =
            "mostly negative";

    }


    else if (
        positiveSignals > 0

        &&

        negativeSignals > 0
    ) {

        label =
            "mixed";

    }


    return {

        label,

        positiveSignals,

        negativeSignals,

        method:
            "keyword-heuristic"

    };

}



// =================================
// MEDIA SUMMARY
// =================================


function mediaSummaryFor(

    name,

    innanetPosts,

    wwowSections

) {

    const needle =
        normalize(
            name
        );


    if (
        !needle
    ) {

        return {

            innanet: {

                mentionCount:
                    0,

                sentiment:
                    sentimentForPosts(
                        []
                    ),

                topPosts:
                    []

            },

            wwow: {

                mentionCount:
                    0,

                articles:
                    []

            }

        };

    }


    const posts =

        innanetPosts

            .filter(

                post =>

                    normalize(
                        post.body
                    )

                        .includes(
                            needle
                        )

            )

            .sort(

                (
                    a,
                    b
                ) =>

                    b.engagement

                    -

                    a.engagement

            );


    const articles =

        wwowSections

            .filter(

                section =>

                    normalize(

                        `${section.title} ${section.body}`

                    )
                        .includes(
                            needle
                        )

            );


    return {

        innanet: {

            mentionCount:
                posts.length,

            sentiment:
                sentimentForPosts(
                    posts
                ),

            topPosts:

                posts

                    .slice(
                        0,
                        5
                    )

                    .map(

                        post => ({

                            date:
                                post.date,

                            eventName:
                                post.eventName,

                            handle:
                                post.handle,

                            type:
                                post.type,

                            body:
                                post.body,

                            engagement:
                                post.engagement

                        })

                    )

        },


        wwow: {

            mentionCount:
                articles.length,

            articles:

                articles

                    .slice(
                        0,
                        5
                    )

                    .map(

                        section => ({

                            kicker:
                                section.kicker,

                            title:
                                section.title,

                            excerpt:

                                section.body
                                    .slice(
                                        0,
                                        500
                                    )

                        })

                    )

        }

    };

}



// =================================
// LOAD EXISTING POWER ENGINE
// =================================


async function loadPowerRankingEngine() {

    const enginePath =

        path.join(

            ROOT,

            "js/power-rankings.js"

        );


    const source =

        await fs.readFile(

            enginePath,

            "utf8"

        );


    const safeSource =

        source.replace(

            /pLoadRankings\(\);\s*$/,

            ""

        );


    const elementStub =
        () => ({

            hidden:
                false,

            textContent:
                "",

            innerHTML:
                "",

            className:
                "",

            dataset:
                {},

            classList: {

                toggle() {}

            },

            addEventListener() {},

            appendChild() {}

        });


    const context =

        vm.createContext({

            console,

            document: {

                getElementById:
                    elementStub,

                querySelectorAll:
                    () => [],

                createElement:
                    elementStub

            },

            encodeURIComponent,

            setTimeout,

            clearTimeout

        });


    vm.runInContext(

        safeSource,

        context,

        {

            filename:
                "js/power-rankings.js"

        }

    );


    return {

        calculateScope:

            vm.runInContext(

                "(scope, divisionKey, data) => pCalculateScope(scope, divisionKey, data)",

                context

            ),


        matchMode:

            vm.runInContext(

                "match => pMatchMode(match)",

                context

            ),


        singlesParticipants:

            vm.runInContext(

                "match => pSinglesParticipants(match)",

                context

            ),


        singlesWinners:

            vm.runInContext(

                "match => pSinglesWinners(match)",

                context

            ),


        teamSignatureMap:

            vm.runInContext(

                "teams => pTeamSignatureMap(teams)",

                context

            ),


        teamIdsBySide:

            vm.runInContext(

                "(match, data, map) => pTeamIdsBySide(match, data, map)",

                context

            ),


        teamWinners:

            vm.runInContext(

                "(match, idsBySide) => pTeamWinners(match, idsBySide)",

                context

            ),


        resultType:

            vm.runInContext(

                "match => pResultType(match)",

                context

            )

    };

}



// =================================
// FREEZE PROTECTION
// =================================


const snapshotPath =

    `data/history/${TARGET_MONTH}.json`;


const existingSnapshot =

    await readJson(

        snapshotPath,

        null

    );


if (
    existingSnapshot

    &&

    !ALLOW_REBUILD
) {

    console.log(

        `${TARGET_MONTH} already has a frozen world snapshot. No changes made.`

    );


    process.exit(
        0
    );

}



// =================================
// LOAD DATABASES
// =================================


const [

    events,
    matches,
    segments,
    wrestlers,
    teams,
    championships,
    reigns,
    innanetIndex,
    wwowIndex

] = await Promise.all([


    readJson(
        "data/events.json",
        []
    ),


    readJson(
        "data/matches.json",
        []
    ),


    readJson(
        "data/segments.json",
        []
    ),


    readJson(
        "data/wrestlers.json",
        []
    ),


    readJson(
        "data/teams.json",
        []
    ),


    readJson(
        "data/championships.json",
        []
    ),


    readJson(
        "data/title-reigns.json",
        []
    ),


    readJson(
        "data/innanet/archive-index.json",
        {
            months:
                []
        }
    ),


    readJson(
        "data/wwow/archive-index.json",
        {
            issues:
                []
        }
    )


]);



// =================================
// MAPS
// =================================


const engine =
    await loadPowerRankingEngine();


const eventMap =

    Object.fromEntries(

        events.map(

            event => [

                event.id,

                event

            ]

        )

    );


const wrestlerMap =

    Object.fromEntries(

        wrestlers.map(

            wrestler => [

                wrestler.id,

                wrestler

            ]

        )

    );


const teamMap =

    Object.fromEntries(

        teams.map(

            team => [

                team.id,

                team

            ]

        )

    );


const championshipMap =

    Object.fromEntries(

        championships.map(

            title => [

                title.id,

                title

            ]

        )

    );


const teamSignatureMap =

    engine.teamSignatureMap(
        teams
    );



// =================================
// COMPLETED MATCHES
// =================================


const completedItems =

    matches

        .filter(

            match =>

                !match.status

                ||

                normalize(
                    match.status
                )

                ===

                "completed"

        )

        .map(

            match => ({

                match,

                event:

                    getEventForMatch(

                        match,

                        eventMap,

                        events

                    )

            })

        )

        .filter(

            item =>
                item.event?.date

        )

        .sort(

            (
                a,
                b
            ) =>

                asDate(
                    a.event.date
                )

                -

                asDate(
                    b.event.date
                )

                ||

                Number(
                    a.match.order || 0
                )

                -

                Number(
                    b.match.order || 0
                )

        );



// =================================
// TARGET MONTH
// =================================


const monthItems =

    completedItems.filter(

        item =>

            String(
                item.event.date
            )

                .startsWith(
                    TARGET_MONTH
                )

    );


if (
    !monthItems.length
) {

    throw new Error(

        `No completed matches exist for ${TARGET_MONTH}.`

    );

}



const monthEvents = [

    ...new Map(

        monthItems.map(

            item => [

                item.event.id,

                item.event

            ]

        )

    ).values()

]

    .sort(

        (
            a,
            b
        ) =>

            asDate(
                a.date
            )

            -

            asDate(
                b.date
            )

    );



const closingDate =
    monthEvents.at(-1).date;


const startDate =
    `${TARGET_MONTH}-01`;


const endDate =
    monthEnd(
        TARGET_MONTH
    );


const targetYear =
    TARGET_MONTH.slice(
        0,
        4
    );
// =================================
// MONTH SEGMENT CANON
// =================================


const monthSegmentFacts =

    segments

        .filter(

            segment => {


                const event =

                    eventMap[
                        segment.eventId
                    ];


                return (

                    event?.date

                    &&

                    String(
                        event.date
                    )
                        .startsWith(
                            TARGET_MONTH
                        )

                );

            }

        )

        .sort(

            (
                a,
                b
            ) => {


                const eventA =

                    eventMap[
                        a.eventId
                    ];


                const eventB =

                    eventMap[
                        b.eventId
                    ];


                return String(
                    eventA?.date || ""
                )

                    .localeCompare(

                        String(
                            eventB?.date || ""
                        )

                    )

                    ||

                    String(
                        a.createdAt || ""
                    )

                        .localeCompare(

                            String(
                                b.createdAt || ""
                            )

                        );

            }

        )

        .map(

            segment => {


                const event =

                    eventMap[
                        segment.eventId
                    ];


                const participantIds =

                    Array.isArray(
                        segment.participantIds
                    )

                        ? segment.participantIds

                        : [];


                return {


                    id:
                        segment.id,


                    eventId:
                        segment.eventId,


                    eventName:
                        event?.name || segment.eventId,


                    date:
                        event?.date || "",


                    brand:
                        event?.brand || "OWL",


                    title:
                        segment.title || "",


                    importance:

                        segment.importance

                        ||

                        "regular",


                    participantIds:
                        participantIds,


                    participants:

                        participantIds.map(

                            wrestlerId =>

                                wrestlerMap[
                                    wrestlerId
                                ]
                                    ?.name

                                ||

                                wrestlerId

                        ),


                    summary:

                        String(
                            segment.summary || ""
                        )
                            .trim()

                };

            }

        );


// =================================
// DATA THROUGH DATE
// =================================


function dataThrough(
    cutoffDate
) {

    const allowedMatches =

        completedItems

            .filter(

                item =>

                    item.event.date
                    <=
                    cutoffDate

            )

            .map(

                item =>
                    item.match

            );


    return {

        wrestlers,

        teams,

        events,

        matches:
            allowedMatches,

        reigns

    };

}



const closingData =

    dataThrough(
        closingDate
    );



const hasOpeningYtdData =

    completedItems.some(

        item =>

            item.event.date
            <
            startDate

            &&

            String(
                item.event.date
            )

                .startsWith(
                    targetYear
                )

    );



const openingData =

    hasOpeningYtdData

        ? {

            wrestlers,

            teams,

            events,

            matches:

                completedItems

                    .filter(

                        item =>

                            item.event.date
                            <
                            startDate

                    )

                    .map(

                        item =>
                            item.match

                    ),

            reigns

        }

        : null;



// =================================
// CALCULATE RANKINGS
// =================================


const divisions = [

    "men-singles",

    "women-singles",

    "men-tags",

    "women-tags"

];



const rankings = {

    month:
        {},

    ytd:
        {},

    openingYtd:
        {}

};



for (
    const division
    of divisions
) {

    rankings.month[
        division
    ] =

        compactRanking(

            engine.calculateScope(

                "month",

                division,

                closingData

            )

        );


    rankings.ytd[
        division
    ] =

        compactRanking(

            engine.calculateScope(

                "ytd",

                division,

                closingData

            )

        );


    rankings.openingYtd[
        division
    ] =

        openingData

            ? compactRanking(

                engine.calculateScope(

                    "ytd",

                    division,

                    openingData

                )

            )

            : [];

}



// =================================
// RANKING MAPS
// =================================


const monthRankingMaps =

    Object.fromEntries(

        divisions.map(

            division => [

                division,

                rankingMap(

                    rankings.month[
                        division
                    ]

                )

            ]

        )

    );


const ytdRankingMaps =

    Object.fromEntries(

        divisions.map(

            division => [

                division,

                rankingMap(

                    rankings.ytd[
                        division
                    ]

                )

            ]

        )

    );


const openingRankingMaps =

    Object.fromEntries(

        divisions.map(

            division => [

                division,

                rankingMap(

                    rankings.openingYtd[
                        division
                    ]

                )

            ]

        )

    );



// =================================
// RESULT TIMELINES
// =================================


const timelines = {

    wrestler:
        new Map(),

    team:
        new Map()

};



function pushTimeline(
    type,
    id,
    entry
) {

    if (
        !timelines[type].has(
            id
        )
    ) {

        timelines[type].set(

            id,

            []

        );

    }


    timelines[type]
        .get(
            id
        )
        .push(
            entry
        );

}



for (
    const item
    of completedItems.filter(

        item =>

            item.event.date
            <=
            closingDate

    )
) {

    const {
        match,
        event
    } = item;


    const mode =
        engine.matchMode(
            match
        );


    const resultType =
        engine.resultType(
            match
        );


    // =================================
    // WRESTLER MODE
    // =================================


    if (
        mode === "wrestler"
    ) {

        const participants = [

            ...new Set(

                engine.singlesParticipants(
                    match
                )

            )

        ];


        const winners =

            new Set(

                engine.singlesWinners(
                    match
                )

            );


        participants.forEach(

            id => {

                const result =

                    resultType === "draw"

                        ? "draw"

                        : resultType ===
                            "no-contest"

                            ? "no-contest"

                            : winners.has(
                                id
                            )

                                ? "win"

                                : "loss";


                pushTimeline(

                    "wrestler",

                    id,

                    {

                        date:
                            event.date,

                        eventId:
                            event.id,

                        eventName:
                            event.name,

                        matchOrder:

                            Number(
                                match.order || 0
                            ),

                        result

                    }

                );

            }

        );

    }


    // =================================
    // TEAM MODE
    // =================================


    else {

        const idsBySide =

            engine.teamIdsBySide(

                match,

                closingData,

                teamSignatureMap

            );


        const participants = [

            ...new Set(

                idsBySide.flat()

            )

        ];


        const winners =

            new Set(

                engine.teamWinners(

                    match,

                    idsBySide

                )

            );


        participants.forEach(

            id => {

                const result =

                    resultType === "draw"

                        ? "draw"

                        : resultType ===
                            "no-contest"

                            ? "no-contest"

                            : winners.has(
                                id
                            )

                                ? "win"

                                : "loss";


                pushTimeline(

                    "team",

                    id,

                    {

                        date:
                            event.date,

                        eventId:
                            event.id,

                        eventName:
                            event.name,

                        matchOrder:

                            Number(
                                match.order || 0
                            ),

                        result

                    }

                );

            }

        );

    }

}



// =================================
// SORT TIMELINES
// =================================


for (
    const map
    of Object.values(
        timelines
    )
) {

    for (
        const entries
        of map.values()
    ) {

        entries.sort(

            (
                a,
                b
            ) =>

                asDate(
                    a.date
                )

                -

                asDate(
                    b.date
                )

                ||

                a.matchOrder

                -

                b.matchOrder

        );

    }

}



// =================================
// KO RECORDS
// =================================


const koRecord =

    Object.fromEntries(

        wrestlers.map(

            wrestler => [

                wrestler.id,

                {

                    wins:
                        0,

                    losses:
                        0

                }

            ]

        )

    );



function applyKo(
    winnerId,
    loserId
) {

    if (
        koRecord[
            winnerId
        ]
    ) {

        koRecord[
            winnerId
        ].wins +=
            1;

    }


    if (
        koRecord[
            loserId
        ]
    ) {

        koRecord[
            loserId
        ].losses +=
            1;

    }

}



completedItems

    .filter(

        item =>

            item.event.date
            <=
            closingDate

    )

    .forEach(

        ({
            match
        }) => {


            if (
                normalize(
                    match.finish?.method
                )

                ===

                "ko"
            ) {

                applyKo(

                    match.finish?.winner,

                    match.finish?.loser

                );

            }


            const specialtyEliminations = [

                ...(

                    match.specialtyResult
                        ?.eliminations

                    ||

                    []

                ),

                ...(

                    match.specialtyResult
                        ?.finalEliminations

                    ||

                    []

                )

            ];


            specialtyEliminations.forEach(

                elimination => {

                    if (
                        normalize(
                            elimination.method
                        )

                        ===

                        "ko"
                    ) {

                        applyKo(

                            elimination.eliminatedBy,

                            elimination.wrestlerId

                            ||

                            elimination.eliminated

                        );

                    }

                }

            );

        }

    );



// =================================
// LOAD INNANET MONTH
// =================================


let innanetMonth =
    null;


const innanetMeta =

    (
        innanetIndex.months || []
    )

        .find(

            month =>

                month.id ===
                TARGET_MONTH

        );


if (
    innanetMeta?.file
) {

    innanetMonth =

        await readJson(

            innanetMeta.file,

            null

        );

}



const innanetPosts =

    innanetMonth

        ? (
            innanetMonth.events || []
        )

            .flatMap(

                event =>

                    (
                        event.posts || []
                    )

                        .map(

                            post => ({

                                date:
                                    event.date || "",

                                eventName:
                                    event.eventName || "",

                                handle:
                                    post.handle || "",

                                type:
                                    post.type || "fan-post",

                                body:
                                    post.body || "",

                                engagement:

                                    Number(
                                        post.likes || 0
                                    )

                                    +

                                    (
                                        Number(
                                            post.reposts || 0
                                        )

                                        *

                                        2
                                    )

                                    +

                                    (
                                        Number(
                                            post.replies || 0
                                        )

                                        *

                                        2
                                    )

                            })

                        )

            )

        : [];



// =================================
// LOAD WWOW ISSUE
// =================================


let wwowIssue =
    null;


const wwowMeta =

    (
        wwowIndex.issues || []
    )

        .find(

            issue =>

                issue.id ===
                TARGET_MONTH

        );


if (
    wwowMeta?.file
) {

    wwowIssue =

        await readJson(

            wwowMeta.file,

            null

        );

}



const wwowSections =

    wwowIssue

        ? (
            wwowIssue.sections || []
        )

            .map(

                section => ({

                    kicker:
                        section.kicker || "",

                    title:
                        section.title || "",

                    body:

                        Array.isArray(
                            section.body
                        )

                            ? section.body.join(
                                " "
                            )

                            : String(
                                section.body || ""
                            )

                })

            )

        : [];



// =================================
// ENTITY DIVISION
// =================================


function divisionForEntity(
    id,
    type
) {

    for (
        const division
        of divisions
    ) {

        if (
            ytdRankingMaps[
                division
            ][id]

            ||

            monthRankingMaps[
                division
            ][id]
        ) {

            if (
                type === "wrestler"

                &&

                division.endsWith(
                    "singles"
                )
            ) {

                return division;

            }


            if (
                type === "team"

                &&

                division.endsWith(
                    "tags"
                )
            ) {

                return division;

            }

        }

    }


    return "";

}



// =================================
// ENTITY RECORD
// =================================


function recordFromTimeline(
    entries,
    predicate
) {

    const value =
        record();


    entries

        .filter(
            predicate
        )

        .forEach(

            entry =>

                addResult(

                    value,

                    entry.result

                )

        );


    return {

        ...value,

        text:
            recordText(
                value
            )

    };

}



// =================================
// ENTITY RANKING SUMMARY
// =================================


function rankingSummary(
    id,
    division
) {

    const monthly =

        monthRankingMaps[
            division
        ]?.[id]

        ||

        null;


    const closing =

        ytdRankingMaps[
            division
        ]?.[id]

        ||

        null;


    const opening =

        openingRankingMaps[
            division
        ]?.[id]

        ||

        null;


    let movement =
        null;


    if (
        opening?.rank

        &&

        closing?.rank
    ) {

        movement =

            opening.rank

            -

            closing.rank;

    }


    return {

        monthlyRank:
            monthly?.rank || null,

        monthlyPowerScore:

            monthly?.powerScore
            ??
            null,

        openingYtdRank:
            opening?.rank || null,

        closingYtdRank:
            closing?.rank || null,

        closingYtdPowerScore:

            closing?.powerScore
            ??
            null,

        ytdRankMovement:
            movement,

        ytdRankMovementLabel:

            movement === null

                ? "NEW"

                : movement > 0

                    ? `UP ${movement}`

                    : movement < 0

                        ? `DOWN ${Math.abs(
                            movement
                        )}`

                        : "EVEN"

    };

}



// =================================
// BUILD ENTITY SNAPSHOT
// =================================


function buildEntitySnapshot(
    entity,
    type
) {

    const division =

        divisionForEntity(

            entity.id,

            type

        );


    const entries =

        timelines[type].get(
            entity.id
        )

        ||

        [];


    const results =

        entries.map(

            entry =>
                entry.result

        );


    const monthRecord =

        recordFromTimeline(

            entries,

            entry =>

                String(
                    entry.date
                )

                    .startsWith(
                        TARGET_MONTH
                    )

        );


    const ytdRecord =

        recordFromTimeline(

            entries,

            entry =>

                String(
                    entry.date
                )

                    .startsWith(
                        targetYear
                    )

        );


    return {

        id:
            entity.id,

        name:
            entity.name || entity.id,

        brand:
            entity.brand || "OWL",

        division,

        members:

            type === "team"

                ? entity.members || []

                : undefined,

        monthRecord,

        ytdRecord,

        lastFive:
            lastFiveRecord(
                results
            ),

        streak:
            currentStreak(
                results
            ),

        rankings:

            division

                ? rankingSummary(

                    entity.id,

                    division

                )

                : {

                    monthlyRank:
                        null,

                    monthlyPowerScore:
                        null,

                    openingYtdRank:
                        null,

                    closingYtdRank:
                        null,

                    closingYtdPowerScore:
                        null,

                    ytdRankMovement:
                        null,

                    ytdRankMovementLabel:
                        "UNRANKED"

                },

        currentTitles:

            activeTitlesFor(

                type,

                entity.id,

                closingDate,

                reigns,

                championshipMap

            ),

        koRecord:

            type === "wrestler"

                ? koRecord[
                    entity.id
                ]

                    ||

                    {
                        wins:
                            0,

                        losses:
                            0
                    }

                : undefined,

        media:

            mediaSummaryFor(

                entity.name
                ||
                entity.id,

                innanetPosts,

                wwowSections

            )

    };

}



// =================================
// ENTITY SNAPSHOTS
// =================================


const wrestlerSnapshots =

    wrestlers.map(

        wrestler =>

            buildEntitySnapshot(

                wrestler,

                "wrestler"

            )

    );


const teamSnapshots =

    teams.map(

        team =>

            buildEntitySnapshot(

                team,

                "team"

            )

    );



// =================================
// CHAMPIONSHIP PICTURE
// =================================


const championshipPicture =

    championships.map(

        championship => {


            const activeReign =

                reigns.find(

                    reign =>

                        reign.championshipId ===
                            championship.id

                        &&

                        reign.wonDate

                        &&

                        asDate(
                            reign.wonDate
                        )

                        <=

                        asDate(
                            closingDate
                        )

                        &&

                        (

                            !reign.lostDate

                            ||

                            asDate(
                                reign.lostDate
                            )

                            >

                            asDate(
                                closingDate
                            )

                        )

                );


            const holderName =

                activeReign

                    ? activeReign.holderType ===
                        "team"

                        ? teamMap[
                            activeReign.holderId
                        ]?.name

                            ||

                            activeReign.holderId

                        : wrestlerMap[
                            activeReign.holderId
                        ]?.name

                            ||

                            activeReign.holderId

                    : "";


            return {

                championshipId:
                    championship.id,

                championship:
                    championship.name
                    ||
                    championship.id,

                brand:
                    championship.brand
                    ||
                    "OWL",

                holderType:
                    activeReign?.holderType
                    ||
                    "",

                holderId:
                    activeReign?.holderId
                    ||
                    "",

                holderName,

                wonDate:
                    activeReign?.wonDate
                    ||
                    "",

                defenses:

                    Number(
                        activeReign?.defenses || 0
                    )

            };

        }

    );



// =================================
// TITLE CHANGES
// =================================


const titleChanges =

    reigns

        .filter(

            reign =>

                String(
                    reign.wonDate || ""
                )

                    .startsWith(
                        TARGET_MONTH
                    )

        )

        .map(

            reign => ({

                championshipId:
                    reign.championshipId,

                championship:

                    championshipMap[
                        reign.championshipId
                    ]?.name

                    ||

                    reign.championshipId,

                holderType:
                    reign.holderType,

                holderId:
                    reign.holderId,

                holderName:

                    reign.holderType ===
                        "team"

                        ? teamMap[
                            reign.holderId
                        ]?.name

                            ||

                            reign.holderId

                        : wrestlerMap[
                            reign.holderId
                        ]?.name

                            ||

                            reign.holderId,

                wonDate:
                    reign.wonDate,

                wonAt:
                    reign.wonAt
                    ||
                    "",

                wonEventId:
                    reign.wonEventId
                    ||
                    ""

            })

        );



// =================================
// BUILD SNAPSHOT
// =================================


const snapshot = {

    id:
        TARGET_MONTH,

    label:
        monthLabel(
            TARGET_MONTH
        ),

    generatedAt:

        new Date()
            .toISOString(),

    frozen:
        true,


    period: {

        monthStart:
            startDate,

        calendarMonthEnd:
            endDate,

        asOfDate:
            closingDate

    },


    source: {

        powerRankingsEngine:
            "js/power-rankings.js",

        innanetArchive:
            innanetMeta?.file
            ||
            "",

        wwowIssue:
            wwowMeta?.file
            ||
            ""

    },


        summary: {

        eventCount:
            monthEvents.length,

        matchCount:
            monthItems.length,

        segmentCount:
            monthSegmentFacts.length,

        titleChangeCount:
            titleChanges.length,

        innanetPostCount:
            innanetPosts.length,

        wwowSectionCount:
            wwowSections.length

    },


        events:

        monthEvents.map(

            event => ({


                id:
                    event.id,


                name:
                    event.name,


                brand:
                    event.brand || "OWL",


                eventType:
                    event.eventType || "",


                date:
                    event.date,


                matchCount:

                    monthItems.filter(

                        item =>

                            item.event.id ===
                            event.id

                    )
                        .length,


                segmentCount:

                    monthSegmentFacts.filter(

                        segment =>

                            segment.eventId ===
                            event.id

                    )
                        .length


            })

        ),


    segments:
        monthSegmentFacts,


    rankings,


    wrestlers:
        wrestlerSnapshots,


    teams:
        teamSnapshots,


    championships:
        championshipPicture,


    titleChanges

};



// =================================
// SAVE SNAPSHOT
// =================================


await writeJson(

    snapshotPath,

    snapshot

);



// =================================
// UPDATE HISTORY INDEX
// =================================


const historyIndexPath =

    "data/history/archive-index.json";


const historyIndex =

    await readJson(

        historyIndexPath,

        {
            months:
                []
        }

    );


const byId =

    new Map(

        (
            historyIndex.months || []
        )

            .map(

                month => [

                    month.id,

                    month

                ]

            )

    );


byId.set(

    TARGET_MONTH,

    {

        id:
            TARGET_MONTH,

        label:
            snapshot.label,

        file:
            snapshotPath,

        asOfDate:
            closingDate,

                eventCount:
            snapshot.summary.eventCount,


        matchCount:
            snapshot.summary.matchCount,


        segmentCount:
            snapshot.summary.segmentCount

    }

);


historyIndex.months = [

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

    historyIndexPath,

    historyIndex

);


console.log(

    `Built frozen OWL world snapshot for ${snapshot.label} through ${closingDate}.`

);
