import fs from "node:fs/promises";
import path from "node:path";



async function readJson(
    root,
    relativePath,
    fallback = undefined
) {


    const fullPath =

        path.join(
            root,
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



function recordActivity(
    record
) {


    return (

        Number(
            record?.wins || 0
        )

        +

        Number(
            record?.losses || 0
        )

        +

        Number(
            record?.draws || 0
        )

    );

}



function titleNames(
    entity
) {


    return (

        entity.currentTitles || []

    )

        .map(

            title =>

                title.championship

                ||

                title.name

                ||

                title.championshipId

                ||

                ""

        )

        .filter(
            Boolean
        )

        .slice(
            0,
            4
        );

}



// =================================
// COMPACT ONE ENTITY MONTH
// =================================


function compactEntityMonth(
    entity,
    snapshot
) {


    return {


        month:
            snapshot.id,


        label:
            snapshot.label,


        record:

            entity.monthRecord?.text

            ||

            "0-0-0",


        ytdRecord:

            entity.ytdRecord?.text

            ||

            "0-0-0",


        monthlyRank:

            numberOrNull(

                entity.rankings
                    ?.monthlyRank

            ),


        ytdRank:

            numberOrNull(

                entity.rankings
                    ?.closingYtdRank

            ),


        powerScore:

            numberOrNull(

                entity.rankings
                    ?.closingYtdPowerScore

            ),


        rankMovement:

            entity.rankings
                ?.ytdRankMovementLabel

            ||

            "",


        streak:

            entity.streak?.label

            ||

            "No active streak",


        titles:
            titleNames(
                entity
            ),


        sentiment:

            entity.media
                ?.innanet
                ?.sentiment
                ?.label

            ||

            "not discussed",


        innanetMentions:

            Number(

                entity.media
                    ?.innanet
                    ?.mentionCount

                ||

                0

            ),


        wwowMentions:

            Number(

                entity.media
                    ?.wwow
                    ?.mentionCount

                ||

                0

            )

    };

}



// =================================
// MEANINGFUL HISTORY FILTER
// =================================


function meaningfulMonth(
    entity,
    month
) {


    return (

        recordActivity(
            entity.monthRecord
        )

        >

        0

        ||

        month.titles.length > 0

        ||

        month.innanetMentions > 0

        ||

        month.wwowMentions > 0

        ||

        (

            month.rankMovement

            &&

            ![
                "EVEN",
                "NEW",
                "UNRANKED"
            ].includes(
                month.rankMovement
            )

        )

    );

}



// =================================
// ARC SUMMARY
// =================================


function buildArcSummary(
    history
) {


    if (
        !history.length
    ) {


        return {

            span:
                "",

            firstRank:
                null,

            latestRank:
                null,

            rankChange:
                null,

            rankTrend:
                "insufficient history",

            titleTransitions:
                [],

            sentimentShift:
                "insufficient history",

            recentRecords:
                []

        };

    }



    const rankedMonths =

        history.filter(

            month =>

                Number.isFinite(
                    month.ytdRank
                )

        );



    const firstRank =

        rankedMonths.at(0)
            ?.ytdRank

        ??

        null;



    const latestRank =

        rankedMonths.at(-1)
            ?.ytdRank

        ??

        null;



    const rankChange =

        firstRank !== null

        &&

        latestRank !== null

            ? firstRank - latestRank

            : null;



    let rankTrend =
        "insufficient history";



    if (
        rankChange !== null
    ) {


        if (
            rankChange > 0
        ) {


            rankTrend =

                `climbed ${rankChange} place${

                    rankChange === 1

                        ? ""

                        : "s"

                }`;

        }


        else if (
            rankChange < 0
        ) {


            rankTrend =

                `fell ${Math.abs(

                    rankChange

                )} place${

                    Math.abs(
                        rankChange
                    ) === 1

                        ? ""

                        : "s"

                }`;

        }


        else {


            rankTrend =
                "held the same rank";

        }

    }



    const titleTransitions =
        [];



    for (

        let index = 1;

        index < history.length;

        index += 1

    ) {


        const previous =

            history[
                index - 1
            ].titles;


        const current =

            history[
                index
            ].titles;



        const gained =

            current.filter(

                title =>

                    !previous.includes(
                        title
                    )

            );



        const lost =

            previous.filter(

                title =>

                    !current.includes(
                        title
                    )

            );



        if (
            gained.length

            ||

            lost.length
        ) {


            titleTransitions.push({


                month:

                    history[
                        index
                    ].month,


                gained,


                lost

            });

        }

    }



    const discussedMonths =

        history.filter(

            month =>

                month.sentiment

                &&

                month.sentiment !==
                    "not discussed"

        );



    let sentimentShift =
        "not enough discussion history";



    if (
        discussedMonths.length === 1
    ) {


        sentimentShift =

            `only recorded sentiment: ${

                discussedMonths[0]
                    .sentiment

            }`;

    }


    else if (
        discussedMonths.length > 1
    ) {


        const firstSentiment =

            discussedMonths.at(0)
                .sentiment;


        const latestSentiment =

            discussedMonths.at(-1)
                .sentiment;



        sentimentShift =

            firstSentiment ===
                latestSentiment

                ? `remained ${latestSentiment}`

                : `${firstSentiment} → ${latestSentiment}`;

    }



    return {


        span:

            `${history.at(0).month} through ${history.at(-1).month}`,


        firstRank,


        latestRank,


        rankChange,


        rankTrend,


        titleTransitions:

            titleTransitions.slice(
                -4
            ),


        sentimentShift,


        recentRecords:

            history

                .slice(
                    -3
                )

                .map(

                    month => ({


                        month:
                            month.month,


                        record:
                            month.record,


                        rank:
                            month.ytdRank,


                        streak:
                            month.streak

                    })

                )

    };

}



// =================================
// HISTORY IMPORTANCE SCORE
// =================================


function historyScore(
    entityHistory
) {


    let score =
        0;



    entityHistory.history.forEach(

        month => {


            const [

                wins,
                losses,
                draws

            ] =

                String(
                    month.record || "0-0-0"
                )

                    .split("-")

                    .map(Number);



            score +=

                (
                    wins

                    +

                    losses

                    +

                    draws

                )

                *

                4;



            score +=

                month.titles.length

                *

                12;



            score +=

                Math.min(

                    12,

                    month.innanetMentions

                );



            score +=

                Math.min(

                    8,

                    month.wwowMentions

                    *

                    2

                );



            if (
                month.ytdRank !== null
            ) {


                score +=

                    Math.max(

                        0,

                        20

                        -

                        month.ytdRank

                    );

            }

        }

    );



    const rankChange =

        Math.abs(

            entityHistory
                .arcSummary
                .rankChange

            ||

            0

        );



    score +=
        rankChange;



    return score;

}



// =================================
// COMPANY HISTORY
// =================================


function compactCompanyMonth(
    snapshot
) {


    const ytdRankings =

        snapshot.rankings?.ytd

        ||

        {};



    const rankingLeaders =

        Object.fromEntries(

            Object.entries(
                ytdRankings
            )

                .map(

                    (
                        [
                            division,
                            ranking
                        ]
                    ) => [


                        division,


                        (
                            ranking || []
                        )

                            .slice(
                                0,
                                3
                            )

                            .map(

                                entry => ({


                                    rank:
                                        entry.rank,


                                    id:
                                        entry.id,


                                    name:
                                        entry.name,


                                    powerScore:
                                        entry.powerScore

                                })

                            )

                    ]

                )

        );



    const champions =

        (
            snapshot.championships || []
        )

            .filter(

                championship =>

                    championship.holderId

            )

            .map(

                championship => ({


                    championship:
                        championship.championship,


                    holderId:
                        championship.holderId,


                    holderName:
                        championship.holderName

                })

            );



    const titleChanges =

        (
            snapshot.titleChanges || []
        )

            .map(

                change => ({


                    championship:
                        change.championship,


                    holderId:
                        change.holderId,


                    holderName:
                        change.holderName,


                    wonDate:
                        change.wonDate

                })

            );



    return {


        month:
            snapshot.id,


        label:
            snapshot.label,


        asOfDate:

            snapshot.period
                ?.asOfDate

            ||

            "",


        eventCount:

            Number(

                snapshot.summary
                    ?.eventCount

                ||

                0

            ),


        matchCount:

            Number(

                snapshot.summary
                    ?.matchCount

                ||

                0

            ),


        rankingLeaders,


        champions,


        titleChanges

    };

}



// =================================
// PUBLIC LOADER
// =================================


export async function loadWorldHistoryMemory({

    root =
        process.cwd(),

    beforeMonth =
        "",

    entityIds =
        [],

    maxMonths =
        6,

    maxEntities =
        12,

    includeCompanyHistory =
        false

} = {}) {


    const historyIndex =

        await readJson(

            root,

            "data/history/archive-index.json",

            {

                months:
                    []

            }

        );



    const selectedMetadata =

        (
            historyIndex.months || []
        )

            .filter(

                month =>

                    month?.id

                    &&

                    (

                        !beforeMonth

                        ||

                        month.id <
                            beforeMonth

                    )

            )

            .sort(

                (
                    a,
                    b
                ) =>

                    String(
                        a.id
                    )

                        .localeCompare(

                            String(
                                b.id
                            )

                        )

            )

            .slice(
                -maxMonths
            );



    const snapshots =
        [];



    for (
        const metadata
        of selectedMetadata
    ) {


        if (
            !metadata.file
        ) {


            continue;

        }



        try {


            const snapshot =

                await readJson(

                    root,

                    metadata.file

                );



            snapshots.push(
                snapshot
            );

        }


        catch (
            error
        ) {


            console.warn(

                `Skipping world snapshot ${metadata.file}: ${error.message}`

            );

        }

    }



    const requestedIds =

        new Set(

            entityIds.filter(
                Boolean
            )

        );



    const byEntity =
        new Map();



    for (
        const snapshot
        of snapshots
    ) {


        const collections = [


            {
                type:
                    "wrestler",

                entities:
                    snapshot.wrestlers || []
            },


            {
                type:
                    "team",

                entities:
                    snapshot.teams || []
            }

        ];



        for (
            const collection
            of collections
        ) {


            for (
                const entity
                of collection.entities
            ) {


                if (
                    requestedIds.size > 0

                    &&

                    !requestedIds.has(
                        entity.id
                    )
                ) {


                    continue;

                }



                const compactMonth =

                    compactEntityMonth(

                        entity,

                        snapshot

                    );



                if (
                    requestedIds.size === 0

                    &&

                    !meaningfulMonth(

                        entity,

                        compactMonth

                    )
                ) {


                    continue;

                }



                const key =

                    `${collection.type}:${entity.id}`;



                if (
                    !byEntity.has(
                        key
                    )
                ) {


                    byEntity.set(

                        key,

                        {


                            entityType:
                                collection.type,


                            id:
                                entity.id,


                            name:
                                entity.name
                                ||
                                entity.id,


                            brand:
                                entity.brand
                                ||
                                "OWL",


                            division:
                                entity.division
                                ||
                                "",


                            history:
                                []

                        }

                    );

                }



                byEntity
                    .get(
                        key
                    )
                    .history
                    .push(
                        compactMonth
                    );

            }

        }

    }



    let entityHistories =

        [
            ...byEntity.values()
        ]

            .map(

                entity => ({


                    ...entity,


                    arcSummary:

                        buildArcSummary(

                            entity.history

                        )

                })

            );



    entityHistories =

        entityHistories

            .map(

                entity => ({


                    ...entity,


                    importanceScore:

                        historyScore(
                            entity
                        )

                })

            )

            .sort(

                (
                    a,
                    b
                ) =>

                    b.importanceScore

                    -

                    a.importanceScore

                    ||

                    a.name.localeCompare(
                        b.name
                    )

            )

            .slice(
                0,
                maxEntities
            )

            .map(

                ({
                    importanceScore,
                    ...entity
                }) =>

                    entity

            );



    return {


        source:
            "frozen-monthly-world-snapshots",


        cutoffBeforeMonth:
            beforeMonth,


        months:

            snapshots.map(

                snapshot => ({


                    id:
                        snapshot.id,


                    label:
                        snapshot.label,


                    asOfDate:

                        snapshot.period
                            ?.asOfDate

                        ||

                        ""

                })

            ),


        entityHistories,


        companyHistory:

            includeCompanyHistory

                ? snapshots.map(
                    compactCompanyMonth
                )

                : [],


        usageRules: {


            facts:

                "Frozen snapshot records, ranks, championships, and title changes are historical facts.",


            sentiment:

                "Snapshot sentiment summarizes archived Innanet reaction and should be described as public reaction, not objective fact.",


            causes:

                "History can prove that a rise, fall, streak, title transition, or perception shift happened. Never invent an unrecorded cause for it."

        }

    };

}
