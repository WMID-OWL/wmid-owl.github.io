import fs from "node:fs/promises";
import path from "node:path";

import {
    loadWorldHistoryMemory
} from "./world-history-memory.mjs";

const ROOT =
    process.cwd();


const TARGET_MONTH =
    String(
        process.env.TARGET_MONTH || ""
    ).trim();



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



function monthId(
    dateString
) {

    return String(
        dateString || ""
    ).slice(
        0,
        7
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



function signature(
    ids = []
) {

    return [...ids]

        .sort()

        .join("|");

}



function createRecord() {

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
    record,
    result
) {

    if (
        result === "win"
    ) {

        record.wins +=
            1;

    }


    if (
        result === "loss"
    ) {

        record.losses +=
            1;

    }


    if (
        result === "draw"
    ) {

        record.draws +=
            1;

    }

}



function recordText(
    record
) {

    return (

        `${record.wins}-${record.losses}-${record.draws}`

    );

}



// =================================
// EVENT HELPERS
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



function winnerSideIndex(
    match
) {

    return Number.isInteger(
        match.winnerSide
    )

        ? match.winnerSide

        : -1;

}



// =================================
// RESULT HELPERS
// =================================


function resultForWrestler(
    match,
    wrestlerId
) {

    const sideIndex =

        (
            match.sides || []
        )

            .findIndex(

                side =>

                    (
                        side.wrestlers || []
                    )

                        .includes(
                            wrestlerId
                        )

            );


    if (
        sideIndex < 0
    ) {

        return null;

    }


    const resultType =
        normalize(
            match.resultType
        );


    if (
        resultType === "draw"
    ) {

        return "draw";

    }


    if (
        [
            "no-contest",
            "no contest",
            "nc"
        ].includes(
            resultType
        )
    ) {

        return "no-contest";

    }


    return sideIndex ===
        winnerSideIndex(
            match
        )

        ? "win"

        : "loss";

}



// =================================
// STREAKS
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


    const finalResult =
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
            finalResult
        ) {

            break;

        }


        count +=
            1;

    }


    return {

        type:

            finalResult === "win"

                ? "winning"

                : "losing",

        count,

        label:

            `${count}-match ${

                finalResult === "win"

                    ? "winning"

                    : "losing"

            } streak`

    };

}



// =================================
// MATCH PRESENTATION
// =================================


function formatSide(
    side,
    wrestlerMap,
    teamBySignature
) {

    const ids =
        side?.wrestlers || [];


    const team =
        teamBySignature.get(

            signature(
                ids
            )

        );


    if (
        team
    ) {

        return team.name;

    }


    return ids

        .map(

            id =>

                wrestlerMap[
                    id
                ]?.name

                ||

                id

        )

        .join(
            " & "
        );

}



function formatMatch(
    match,
    wrestlerMap,
    teamBySignature
) {

    return (

        match.sides || []

    )

        .map(

            side =>

                formatSide(

                    side,

                    wrestlerMap,

                    teamBySignature

                )

        )

        .join(
            " vs. "
        );

}



// =================================
// LOAD DATA
// =================================


const [

    events,

    matches,

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


const championshipMap =
    Object.fromEntries(

        championships.map(

            championship => [

                championship.id,

                championship

            ]

        )

    );


const teamBySignature =
    new Map(

        teams

            .filter(

                team =>

                    Array.isArray(
                        team.members
                    )

                    &&

                    team.members.length === 2

            )

            .map(

                team => [

                    signature(
                        team.members
                    ),

                    team

                ]

            )

    );



// =================================
// COMPLETED MATCHES WITH EVENTS
// =================================


const completedMatches =

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
// DETERMINE MONTH
// =================================


const availableMonths = [

    ...new Set(

        completedMatches.map(

            item =>
                monthId(
                    item.event.date
                )

        )

    )

]

    .sort();



const selectedMonth =

    TARGET_MONTH

    ||

    availableMonths.at(-1)

    ||

    "";



if (
    !selectedMonth
) {

    throw new Error(

        "No completed match month is available."

    );

}



const selectedLabel =
    monthLabel(
        selectedMonth
    );



// =================================
// MONTH MATCHES
// =================================


const monthMatches =

    completedMatches.filter(

        item =>

            monthId(
                item.event.date
            )

            ===

            selectedMonth

    );



if (
    !monthMatches.length
) {

    throw new Error(

        `No completed matches found for ${selectedMonth}.`

    );

}



// =================================
// MONTH EVENTS
// =================================


const eventGroups =
    new Map();


monthMatches.forEach(

    item => {

        if (
            !eventGroups.has(
                item.event.id
            )
        ) {

            eventGroups.set(

                item.event.id,

                {

                    event:
                        item.event,

                    matches:
                        []

                }

            );

        }


        eventGroups
            .get(
                item.event.id
            )
            .matches
            .push(
                item.match
            );

    }

);



const monthEvents = [

    ...eventGroups.values()

]

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

    );



// =================================
// EVENT SUMMARIES
// =================================


const eventSummaries =

    monthEvents.map(

        group => {


            const matchFacts =

                group.matches.map(

                    match => {


                        const winningSide =
                            winnerSideIndex(
                                match
                            );


                        return {

                            order:
                                Number(
                                    match.order || 0
                                ),

                            matchType:
                                match.matchType
                                ||
                                "",

                            stipulation:
                                match.stipulation
                                ||
                                "",

                            match:
                                formatMatch(

                                    match,

                                    wrestlerMap,

                                    teamBySignature

                                ),

                            winner:

                                winningSide >= 0

                                    ? formatSide(

                                        match.sides?.[
                                            winningSide
                                        ],

                                        wrestlerMap,

                                        teamBySignature

                                    )

                                    : "",

                            finishWinner:

                                wrestlerMap[
                                    match.finish?.winner
                                ]?.name

                                ||

                                match.finish?.winner

                                ||

                                "",

                            finishLoser:

                                wrestlerMap[
                                    match.finish?.loser
                                ]?.name

                                ||

                                match.finish?.loser

                                ||

                                "",

                            finishMethod:

                                match.finish?.method

                                ||

                                "",

                            championship:

                                championshipMap[
                                    match.championshipId
                                ]?.name

                                ||

                                "",

                            rating:

                                Number(
                                    match.rating || 0
                                ),

                            stars:

                                Number(
                                    match.starRating || 0
                                ),

                            matchTime:

                                match.matchTime

                                ||

                                "",

                            specialtyResult:

                                match.specialtyResult

                                ||

                                null

                        };

                    }

                );


            const rated =

                matchFacts.filter(

                    match =>
                        match.rating > 0

                );


            const bestMatch =

                [...rated]

                    .sort(

                        (
                            a,
                            b
                        ) =>

                            b.rating

                            -

                            a.rating

                    )[0]

                ||

                null;


            return {

                id:
                    group.event.id,

                name:
                    group.event.name,

                brand:
                    group.event.brand
                    ||
                    "OWL",

                eventType:
                    group.event.eventType
                    ||
                    "",

                date:
                    group.event.date,

                location:
                    group.event.location
                    ||
                    "",

                matchCount:
                    matchFacts.length,

                bestMatch,

                matches:
                    matchFacts

            };

        }

    );



// =================================
// WRESTLER MONTHLY RECORDS
// =================================


const wrestlerSummaries =
    [];


wrestlers.forEach(

    wrestler => {


        const historicalItems =

            completedMatches

                .filter(

                    item =>

                        item.event.date

                        <=

                        monthEvents.at(-1)
                            .event
                            .date

                )

                .map(

                    item => ({

                        ...item,

                        result:

                            resultForWrestler(

                                item.match,

                                wrestler.id

                            )

                    })

                )

                .filter(

                    item =>
                        item.result

                );


        if (
            !historicalItems.length
        ) {

            return;

        }


        const monthRecord =
            createRecord();


        const ytdRecord =
            createRecord();


        const selectedYear =
            selectedMonth.slice(
                0,
                4
            );


        historicalItems.forEach(

            item => {


                if (
                    monthId(
                        item.event.date
                    )

                    ===

                    selectedMonth
                ) {

                    addResult(

                        monthRecord,

                        item.result

                    );

                }


                if (
                    String(
                        item.event.date
                    ).slice(
                        0,
                        4
                    )

                    ===

                    selectedYear
                ) {

                    addResult(

                        ytdRecord,

                        item.result

                    );

                }

            }

        );


        const monthMatchesForWrestler =

            historicalItems.filter(

                item =>

                    monthId(
                        item.event.date
                    )

                    ===

                    selectedMonth

            );


        if (
            !monthMatchesForWrestler.length
        ) {

            return;

        }


        const results =

            historicalItems.map(

                item =>
                    item.result

            );


        const koWins =

            historicalItems.filter(

                item =>

                    normalize(
                        item.match.finish?.method
                    )

                    ===

                    "ko"

                    &&

                    item.match.finish?.winner
                    ===
                    wrestler.id

            ).length;


        const koLosses =

            historicalItems.filter(

                item =>

                    normalize(
                        item.match.finish?.method
                    )

                    ===

                    "ko"

                    &&

                    item.match.finish?.loser
                    ===
                    wrestler.id

            ).length;


        wrestlerSummaries.push({

            id:
                wrestler.id,

            name:
                wrestler.name
                ||
                wrestler.id,

            brand:
                wrestler.brand
                ||
                "OWL",

            division:
                wrestler.division
                ||
                "",

            monthRecord: {

                ...monthRecord,

                text:
                    recordText(
                        monthRecord
                    )

            },

            ytdRecord: {

                ...ytdRecord,

                text:
                    recordText(
                        ytdRecord
                    )

            },

            streak:
                currentStreak(
                    results
                ),

            koRecord: {

                wins:
                    koWins,

                losses:
                    koLosses

            }

        });

    }

);



// =================================
// MONTH STANDOUTS
// =================================


const bestRatedMatches =

    eventSummaries

        .flatMap(

            event =>

                event.matches.map(

                    match => ({

                        eventName:
                            event.name,

                        eventDate:
                            event.date,

                        ...match

                    })

                )

        )

        .filter(

            match =>
                match.rating > 0

        )

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
            10
        );



const bestRecords =

    [...wrestlerSummaries]

        .sort(

            (
                a,
                b
            ) => {


                if (
                    b.monthRecord.wins
                    !==
                    a.monthRecord.wins
                ) {

                    return (

                        b.monthRecord.wins

                        -

                        a.monthRecord.wins

                    );

                }


                return (

                    a.monthRecord.losses

                    -

                    b.monthRecord.losses

                );

            }

        )

        .slice(
            0,
            12
        );



const worstRecords =

    [...wrestlerSummaries]

        .sort(

            (
                a,
                b
            ) => {


                if (
                    b.monthRecord.losses
                    !==
                    a.monthRecord.losses
                ) {

                    return (

                        b.monthRecord.losses

                        -

                        a.monthRecord.losses

                    );

                }


                return (

                    a.monthRecord.wins

                    -

                    b.monthRecord.wins

                );

            }

        )

        .slice(
            0,
            12
        );



// =================================
// TITLE HISTORY FOR MONTH
// =================================


const titleChanges =

    reigns

        .filter(

            reign =>

                monthId(
                    reign.wonDate
                )

                ===

                selectedMonth

        )

        .map(

            reign => ({

                championship:

                    championshipMap[
                        reign.championshipId
                    ]?.name

                    ||

                    reign.championshipId,

                holder:

                    wrestlerMap[
                        reign.holderId
                    ]?.name

                    ||

                    teams.find(

                        team =>
                            team.id ===
                            reign.holderId

                    )?.name

                    ||

                    reign.holderId,

                wonDate:
                    reign.wonDate
                    ||
                    "",

                wonAt:
                    reign.wonAt
                    ||
                    "",

                defenses:

                    Number(
                        reign.defenses || 0
                    )

            })

        );



// =================================
// INNANET MEMORY FOR MONTH
// =================================


let innanetMonth =
    null;


const innanetMonthMeta =

    (
        innanetIndex.months || []
    )

        .find(

            month =>
                month.id ===
                selectedMonth

        );


if (
    innanetMonthMeta?.file
) {

    innanetMonth =
        await readJson(

            innanetMonthMeta.file,

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

                                eventName:
                                    event.eventName,

                                date:
                                    event.date,

                                accountName:
                                    post.accountName,

                                handle:
                                    post.handle,

                                type:
                                    post.type,

                                body:
                                    post.body,

                                likes:
                                    Number(
                                        post.likes || 0
                                    ),

                                reposts:
                                    Number(
                                        post.reposts || 0
                                    ),

                                replies:
                                    Number(
                                        post.replies || 0
                                    )

                            })

                        )

            )

        : [];



const topInnanetPosts =

    [...innanetPosts]

        .sort(

            (
                a,
                b
            ) => {


                const aScore =

                    a.likes

                    +

                    (
                        a.reposts * 2
                    )

                    +

                    (
                        a.replies * 2
                    );


                const bScore =

                    b.likes

                    +

                    (
                        b.reposts * 2
                    )

                    +

                    (
                        b.replies * 2
                    );


                return (

                    bScore

                    -

                    aScore

                );

            }

        )

        .slice(
            0,
            25
        );



// =================================
// PREVIOUS WWOW MEMORY
// =================================


const previousIssues =
    [];


for (
    const issueMeta
    of (
        wwowIndex.issues || []
    )
) {

    if (
        issueMeta.id >=
            selectedMonth

        ||

        !issueMeta.file
    ) {

        continue;

    }


    try {

        const issue =
            await readJson(
                issueMeta.file
            );


        previousIssues.push({

            id:
                issueMeta.id,

            label:
                issue.label
                ||
                issueMeta.label,

            coverTitle:
                issue.coverTitle
                ||
                issueMeta.coverTitle,

            sectionTitles:

                (
                    issue.sections || []
                )

                    .map(

                        section =>
                            section.title

                    )

                    .filter(
                        Boolean
                    )

        });

    }


    catch (
        error
    ) {

        console.warn(

            `Skipping prior WWoW issue ${issueMeta.file}: ${error.message}`

        );

    }

}



previousIssues.sort(

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



const priorMonths =

    availableMonths

        .filter(

            id =>
                id <
                selectedMonth

        )

        .slice(
            -4
        );



const historicalRecords =

    wrestlerSummaries.map(

        wrestler => {


            const months =

                priorMonths.map(

                    id => {


                        const record =
                            createRecord();


                        completedMatches

                            .filter(

                                item =>

                                    monthId(
                                        item.event.date
                                    )

                                    ===

                                    id

                            )

                            .forEach(

                                item => {


                                    const result =

                                        resultForWrestler(

                                            item.match,

                                            wrestler.id

                                        );


                                    if (
                                        result
                                    ) {

                                        addResult(

                                            record,

                                            result

                                        );

                                    }

                                }

                            );


                        return {

                            month:
                                id,

                            label:
                                monthLabel(
                                    id
                                ),

                            ...record,

                            text:
                                recordText(
                                    record
                                )

                        };

                    }

                );


            return {

                wrestlerId:
                    wrestler.id,

                wrestlerName:
                    wrestler.name,

                months: [

                    ...months,

                    {

                        month:
                            selectedMonth,

                        label:
                            selectedLabel,

                        ...wrestler.monthRecord,

                        text:
                            wrestler.monthRecord.text

                    }

                ]

            };

        }

    );



// =================================
// OUTPUT CONTEXT
// =================================


const context = {

    generatedAt:

        new Date()
            .toISOString(),


    month: {

        id:
            selectedMonth,

        label:
            selectedLabel

    },


    rules: {

        canonBoundary:

            "Structured database facts are canon. Analysis and opinion are allowed. Clearly labeled speculation is allowed. Never invent matches, title changes, contracts, backstage incidents, injuries, firings, signings, or future booking as fact.",


        historicalPerspective:

            "Use previous months and archived media to identify real arcs such as rises, collapses, streaks, recoveries, championship changes, and changing public perception.",


        innanetUse:

            "Innanet posts represent public reaction and opinion. They may be quoted or summarized as public sentiment but must never be treated as proof of factual backstage events.",


        koMeaning:

            "A recorded KO is rare and symbolically represents injury-level damage in OWL. Treat it as major without inventing medical details or recovery time."

    },


    monthSummary: {

        eventCount:
            eventSummaries.length,

        matchCount:
            monthMatches.length,

        titleChangeCount:
            titleChanges.length,

        innanetPostCount:
            innanetPosts.length

    },


    events:
        eventSummaries,


    wrestlerContext:
        wrestlerSummaries,


    standouts: {

        highestRatedMatches:
            bestRatedMatches,

        strongestMonthlyRecords:
            bestRecords,

        weakestMonthlyRecords:
            worstRecords,

        titleChanges

    },


    historicalRecords,


    innanetMemory: {

        totalPosts:
            innanetPosts.length,

        highestEngagementPosts:
            topInnanetPosts

    },


    previousWwowIssues:

        previousIssues.slice(
            0,
            6
        )

};


await writeJson(

    "data/wwow/generation-context.json",

    context

);


console.log(

    `Built WWoW context for ${selectedLabel}.`

);
