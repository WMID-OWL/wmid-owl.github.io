import fs from "node:fs/promises";
import path from "node:path";

import {
    loadWorldHistoryMemory
} from "./world-history-memory.mjs";

const ROOT = process.cwd();
const EVENT_ID = String(process.env.EVENT_ID || "").trim();

async function readJson(relativePath, fallback = undefined) {
    const fullPath = path.join(ROOT, relativePath);

    try {
        const text = await fs.readFile(fullPath, "utf8");
        return JSON.parse(text);
    }
    catch (error) {
        if (fallback !== undefined && error.code === "ENOENT") {
            return fallback;
        }

        throw new Error(`Could not read ${relativePath}: ${error.message}`);
    }
}

async function writeJson(relativePath, value) {
    const fullPath = path.join(ROOT, relativePath);

    await fs.mkdir(
        path.dirname(fullPath),
        {
            recursive: true
        }
    );

    await fs.writeFile(
        fullPath,
        `${JSON.stringify(value, null, 2)}\n`,
        "utf8"
    );
}

function normalize(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

function asDate(dateString) {
    return new Date(
        `${dateString}T00:00:00Z`
    );
}

function monthId(dateString) {
    return String(dateString || "")
        .slice(0, 7);
}

function monthLabel(id) {
    const [year, month] =
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
            month: "long",
            year: "numeric",
            timeZone: "UTC"
        }
    );
}

function signature(ids = []) {
    return [...ids]
        .sort()
        .join("|");
}

function getEventForMatch(
    match,
    eventMap,
    events
) {
    if (
        match.eventId
        &&
        eventMap[match.eventId]
    ) {
        return eventMap[
            match.eventId
        ];
    }

    return events.find(
        event =>
            match.date === event.date
            &&
            normalize(match.event)
            ===
            normalize(event.name)
    ) || null;
}

function winnerSideIndex(match) {
    return Number.isInteger(
        match.winnerSide
    )
        ? match.winnerSide
        : -1;
}

function resultForWrestler(
    match,
    wrestlerId
) {
    const participantSide =
        (match.sides || [])
            .findIndex(
                side =>
                    (
                        side.wrestlers || []
                    ).includes(
                        wrestlerId
                    )
            );

    if (
        participantSide < 0
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

    return participantSide
        ===
        winnerSideIndex(match)

        ? "win"

        : "loss";
}

function resultForTeam(
    match,
    team,
    officialTeamBySignature
) {
    const sideIndex =
        (match.sides || [])
            .findIndex(
                side => {
                    const members =
                        side.wrestlers || [];

                    const official =
                        officialTeamBySignature.get(
                            signature(members)
                        );

                    return (
                        official?.id === team.id
                        ||
                        (
                            team.members || []
                        ).every(
                            memberId =>
                                members.includes(
                                    memberId
                                )
                        )
                    );
                }
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

    return sideIndex
        ===
        winnerSideIndex(match)

        ? "win"

        : "loss";
}

function addRecord(
    record,
    result
) {
    if (
        result === "win"
    ) {
        record.wins += 1;
    }

    if (
        result === "loss"
    ) {
        record.losses += 1;
    }

    if (
        result === "draw"
    ) {
        record.draws += 1;
    }
}

function createRecord() {
    return {
        wins: 0,
        losses: 0,
        draws: 0
    };
}

function recordText(record) {
    return `${record.wins}-${record.losses}-${record.draws}`;
}

function currentStreak(results) {
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
            type: "none",
            count: 0,
            label: "No active streak"
        };
    }

    const last =
        decisions.at(-1);

    let count = 0;

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

        count += 1;
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

function lastFiveRecord(results) {
    const recent =
        results
            .filter(
                result =>
                    result !== "no-contest"
            )
            .slice(-5);

    const record =
        createRecord();

    recent.forEach(
        result =>
            addRecord(
                record,
                result
            )
    );

    return record;
}

function previousMonthIds(
    eventDate,
    count = 4
) {
    const date =
        asDate(eventDate);

    const ids = [];

    for (
        let offset =
            count - 1;

        offset >= 0;

        offset -= 1
    ) {
        const item =
            new Date(
                Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth() - offset,
                    1
                )
            );

        ids.push(
            `${
                item.getUTCFullYear()
            }-${
                String(
                    item.getUTCMonth() + 1
                ).padStart(
                    2,
                    "0"
                )
            }`
        );
    }

    return ids;
}

function activeTitlesFor(
    holderType,
    holderId,
    asOfDate,
    reigns,
    championshipMap
) {
    const date =
        asDate(asOfDate);

    return reigns
        .filter(
            reign =>
                reign.holderType
                ===
                holderType

                &&

                reign.holderId
                ===
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
            reign =>
                championshipMap[
                    reign.championshipId
                ]?.name

                ||

                reign.championshipId
        );
}

function titleHistoryFor(
    holderType,
    holderId,
    asOfDate,
    reigns,
    championshipMap
) {
    const cutoff =
        new Date(
            asDate(asOfDate)
        );

    cutoff.setUTCDate(
        cutoff.getUTCDate() - 120
    );

    return reigns
        .filter(
            reign =>
                reign.holderType
                ===
                holderType

                &&

                reign.holderId
                ===
                holderId

                &&

                (
                    (
                        reign.wonDate

                        &&

                        asDate(
                            reign.wonDate
                        )
                        >=
                        cutoff

                        &&

                        asDate(
                            reign.wonDate
                        )
                        <=
                        asDate(asOfDate)
                    )

                    ||

                    (
                        reign.lostDate

                        &&

                        asDate(
                            reign.lostDate
                        )
                        >=
                        cutoff

                        &&

                        asDate(
                            reign.lostDate
                        )
                        <=
                        asDate(asOfDate)
                    )
                )
        )
        .map(
            reign => ({
                championship:
                    championshipMap[
                        reign.championshipId
                    ]?.name

                    ||

                    reign.championshipId,

                wonDate:
                    reign.wonDate || "",

                lostDate:
                    reign.lostDate || "",

                defenses:
                    Number(
                        reign.defenses || 0
                    )
            })
        );
}

function summarizeWrestler(
    wrestler,
    matchesThroughDate,
    eventMap,
    events,
    reigns,
    championshipMap,
    eventDate
) {
    const relevant =
        matchesThroughDate
            .map(
                match => ({
                    match,

                    event:
                        getEventForMatch(
                            match,
                            eventMap,
                            events
                        ),

                    result:
                        resultForWrestler(
                            match,
                            wrestler.id
                        )
                })
            )
            .filter(
                item =>
                    item.result
                    &&
                    item.event?.date
            )
            .sort(
                (a, b) =>
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

    const results =
        relevant.map(
            item =>
                item.result
        );

    const ytd =
        createRecord();

    const currentMonth =
        createRecord();

    const months =
        Object.fromEntries(
            previousMonthIds(
                eventDate
            ).map(
                id => [
                    id,
                    createRecord()
                ]
            )
        );

    const eventYear =
        String(eventDate)
            .slice(0, 4);

    const currentMonthId =
        monthId(eventDate);

    relevant.forEach(
        item => {
            const itemMonth =
                monthId(
                    item.event.date
                );

            const itemYear =
                String(
                    item.event.date
                ).slice(0, 4);

            if (
                itemYear === eventYear
            ) {
                addRecord(
                    ytd,
                    item.result
                );
            }

            if (
                itemMonth
                ===
                currentMonthId
            ) {
                addRecord(
                    currentMonth,
                    item.result
                );
            }

            if (
                months[itemMonth]
            ) {
                addRecord(
                    months[itemMonth],
                    item.result
                );
            }
        }
    );

    const koWins =
        relevant.filter(
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
        relevant.filter(
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

    return {
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

        ytdRecord: {
            ...ytd,
            text:
                recordText(ytd)
        },

        currentMonthRecord: {
            ...currentMonth,
            text:
                recordText(
                    currentMonth
                )
        },

        lastFive: {
            ...lastFiveRecord(
                results
            ),

            text:
                recordText(
                    lastFiveRecord(
                        results
                    )
                )
        },

        streak:
            currentStreak(
                results
            ),

        currentTitles:
            activeTitlesFor(
                "wrestler",
                wrestler.id,
                eventDate,
                reigns,
                championshipMap
            ),

        recentTitleHistory:
            titleHistoryFor(
                "wrestler",
                wrestler.id,
                eventDate,
                reigns,
                championshipMap
            ),

        koRecord: {
            wins:
                koWins,

            losses:
                koLosses
        },

        monthlyHistory:
            Object.entries(
                months
            ).map(
                (
                    [
                        id,
                        record
                    ]
                ) => ({
                    month:
                        id,

                    label:
                        monthLabel(id),

                    ...record,

                    text:
                        recordText(
                            record
                        )
                })
            )
    };
}

function summarizeTeam(
    team,
    matchesThroughDate,
    eventMap,
    events,
    reigns,
    championshipMap,
    eventDate,
    officialTeamBySignature
) {
    const relevant =
        matchesThroughDate
            .map(
                match => ({
                    match,

                    event:
                        getEventForMatch(
                            match,
                            eventMap,
                            events
                        ),

                    result:
                        resultForTeam(
                            match,
                            team,
                            officialTeamBySignature
                        )
                })
            )
            .filter(
                item =>
                    item.result
                    &&
                    item.event?.date
            )
            .sort(
                (a, b) =>
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

    const results =
        relevant.map(
            item =>
                item.result
        );

    const ytd =
        createRecord();

    const currentMonth =
        createRecord();

    const months =
        Object.fromEntries(
            previousMonthIds(
                eventDate
            ).map(
                id => [
                    id,
                    createRecord()
                ]
            )
        );

    const eventYear =
        String(eventDate)
            .slice(0, 4);

    const currentMonthId =
        monthId(eventDate);

    relevant.forEach(
        item => {
            const itemMonth =
                monthId(
                    item.event.date
                );

            const itemYear =
                String(
                    item.event.date
                ).slice(0, 4);

            if (
                itemYear === eventYear
            ) {
                addRecord(
                    ytd,
                    item.result
                );
            }

            if (
                itemMonth
                ===
                currentMonthId
            ) {
                addRecord(
                    currentMonth,
                    item.result
                );
            }

            if (
                months[itemMonth]
            ) {
                addRecord(
                    months[itemMonth],
                    item.result
                );
            }
        }
    );

    return {
        id:
            team.id,

        name:
            team.name
            ||
            team.id,

        brand:
            team.brand
            ||
            "OWL",

        members:
            team.members
            ||
            [],

        ytdRecord: {
            ...ytd,
            text:
                recordText(ytd)
        },

        currentMonthRecord: {
            ...currentMonth,
            text:
                recordText(
                    currentMonth
                )
        },

        lastFive: {
            ...lastFiveRecord(
                results
            ),

            text:
                recordText(
                    lastFiveRecord(
                        results
                    )
                )
        },

        streak:
            currentStreak(
                results
            ),

        currentTitles:
            activeTitlesFor(
                "team",
                team.id,
                eventDate,
                reigns,
                championshipMap
            ),

        recentTitleHistory:
            titleHistoryFor(
                "team",
                team.id,
                eventDate,
                reigns,
                championshipMap
            ),

        monthlyHistory:
            Object.entries(
                months
            ).map(
                (
                    [
                        id,
                        record
                    ]
                ) => ({
                    month:
                        id,

                    label:
                        monthLabel(id),

                    ...record,

                    text:
                        recordText(
                            record
                        )
                })
            )
    };
}

function formatSide(
    side,
    wrestlerMap,
    officialTeamBySignature
) {
    const ids =
        side?.wrestlers
        ||
        [];

    const officialTeam =
        officialTeamBySignature.get(
            signature(ids)
        );

    if (
        officialTeam
    ) {
        return officialTeam.name;
    }

    return ids
        .map(
            id =>
                wrestlerMap[id]?.name
                ||
                id
        )
        .join(" & ");
}

function formatMatch(
    match,
    wrestlerMap,
    officialTeamBySignature
) {
    return (
        match.sides || []
    )
        .map(
            side =>
                formatSide(
                    side,
                    wrestlerMap,
                    officialTeamBySignature
                )
        )
        .join(" vs. ");
}

function namedSpecialtyResult(
    value,
    key,
    directories
) {
    if (
        Array.isArray(value)
    ) {
        return value.map(
            item =>
                namedSpecialtyResult(
                    item,
                    key,
                    directories
                )
        );
    }

    if (
        value
        &&
        typeof value === "object"
    ) {
        return Object.fromEntries(
            Object.entries(
                value
            ).map(
                (
                    [
                        childKey,
                        childValue
                    ]
                ) => [
                    childKey,

                    namedSpecialtyResult(
                        childValue,
                        childKey,
                        directories
                    )
                ]
            )
        );
    }

    if (
        typeof value === "string"
    ) {
        const lowerKey =
            String(
                key || ""
            ).toLowerCase();

        if (
            lowerKey.includes(
                "wrestler"
            )

            ||

            lowerKey === "winner"

            ||

            lowerKey.includes(
                "eliminatedby"
            )
        ) {
            return (
                directories.wrestlers[
                    value
                ]

                ||

                value
            );
        }

        if (
            lowerKey.includes(
                "team"
            )
        ) {
            return (
                directories.teams[
                    value
                ]

                ||

                value
            );
        }
    }

    return value;
}

function buildMatchFact(
    match,
    wrestlerMap,
    championshipMap,
    officialTeamBySignature,
    directories,
    reigns,
    event
) {
    const winningIndex =
        winnerSideIndex(
            match
        );

    const titleReignWon =
        match.championshipId

            ? reigns.find(
                reign =>
                    reign.championshipId
                    ===
                    match.championshipId

                    &&

                    reign.wonEventId
                    ===
                    event.id
            )

            : null;

    return {
        order:
            Number(
                match.order || 0
            ),

        matchType:
            match.matchType || "",

        stipulation:
            match.stipulation || "",

        match:
            formatMatch(
                match,
                wrestlerMap,
                officialTeamBySignature
            ),

        sides:
            (
                match.sides || []
            ).map(
                side => ({
                    label:
                        formatSide(
                            side,
                            wrestlerMap,
                            officialTeamBySignature
                        ),

                    wrestlers:
                        (
                            side.wrestlers || []
                        ).map(
                            id =>
                                wrestlerMap[id]?.name
                                ||
                                id
                        )
                })
            ),

        championship:
            championshipMap[
                match.championshipId
            ]?.name

            ||

            "",

        resultType:
            match.resultType || "",

        winnerSide:
            winningIndex >= 0

                ? formatSide(
                    match.sides?.[
                        winningIndex
                    ],
                    wrestlerMap,
                    officialTeamBySignature
                )

                : "",

        finish:
            match.finish

                ? {
                    winner:
                        wrestlerMap[
                            match.finish.winner
                        ]?.name

                        ||

                        match.finish.winner

                        ||

                        "",

                    loser:
                        wrestlerMap[
                            match.finish.loser
                        ]?.name

                        ||

                        match.finish.loser

                        ||

                        "",

                    method:
                        match.finish.method
                        ||
                        ""
                }

                : null,

        rating:
            Number(
                match.rating || 0
            ),

        starRating:
            Number(
                match.starRating || 0
            ),

        matchTime:
            match.matchTime || "",

        titleConsequence:
            match.championshipId

                ? normalize(
                    match.resultType
                ) === "win"

                    ? titleReignWon

                        ? `New champion: ${
                            directories.wrestlers[
                                titleReignWon.holderId
                            ]

                            ||

                            directories.teams[
                                titleReignWon.holderId
                            ]

                            ||

                            titleReignWon.holderId
                        }`

                        : "Successful title defense"

                    : "No title change"

                : "",

        specialtyResult:
            match.specialtyResult

                ? namedSpecialtyResult(
                    match.specialtyResult,
                    "specialtyResult",
                    directories
                )

                : null
    };
}

async function loadArchiveFiles(
    index,
    collectionKey
) {
    const items =
        Array.isArray(
            index?.[
                collectionKey
            ]
        )

            ? index[
                collectionKey
            ]

            : [];

    const loaded = [];

    for (
        const item of items
    ) {
        if (
            !item.file
        ) {
            continue;
        }

        try {
            const data =
                await readJson(
                    item.file
                );

            loaded.push({
                meta:
                    item,

                data
            });
        }
        catch (
            error
        ) {
            console.warn(
                `Skipping archive file ${item.file}: ${error.message}`
            );
        }
    }

    return loaded;
}

function relevantMediaMemory(
    innanetArchives,
    wwowArchives,
    participantNames,
    eventDate
) {
    const needles =
        participantNames
            .map(
                name =>
                    normalize(name)
            )
            .filter(Boolean);

    const beforeOrSame =
        dateString =>
            !dateString

            ||

            asDate(dateString)
            <=
            asDate(eventDate);

    const mentionsAny =
        text =>
            needles.some(
                name =>
                    normalize(text)
                        .includes(name)
            );

    const posts = [];

    innanetArchives.forEach(
        ({ data }) => {
            (
                data.events || []
            ).forEach(
                event => {
                    if (
                        !beforeOrSame(
                            event.date
                        )
                    ) {
                        return;
                    }

                    (
                        event.posts || []
                    ).forEach(
                        post => {
                            if (
                                mentionsAny(
                                    post.body || ""
                                )
                            ) {
                                posts.push({
                                    eventName:
                                        event.eventName
                                        ||
                                        "",

                                    date:
                                        event.date
                                        ||
                                        "",

                                    handle:
                                        post.handle
                                        ||
                                        "",

                                    type:
                                        post.type
                                        ||
                                        post.role
                                        ||
                                        "fan-post",

                                    body:
                                        post.body
                                        ||
                                        ""
                                });
                            }
                        }
                    );
                }
            );
        }
    );

    posts.sort(
        (a, b) =>
            String(
                b.date
            ).localeCompare(
                String(
                    a.date
                )
            )
    );

    const articles = [];

    wwowArchives.forEach(
        (
            {
                meta,
                data
            }
        ) => {
            const issueTextDate =
                data.month
                ||
                data.id
                ||
                meta?.id
                ||
                "";

            if (
                issueTextDate

                &&

                String(
                    issueTextDate
                ).slice(0, 7)
                >
                monthId(eventDate)
            ) {
                return;
            }

            (
                data.sections || []
            ).forEach(
                section => {
                    const body =
                        Array.isArray(
                            section.body
                        )

                            ? section.body.join(
                                " "
                            )

                            : String(
                                section.body
                                ||
                                ""
                            );

                    const combined =
                        `${
                            section.title || ""
                        } ${body}`;

                    if (
                        mentionsAny(
                            combined
                        )
                    ) {
                        articles.push({
                            issue:
                                data.label
                                ||
                                issueTextDate,

                            kicker:
                                section.kicker
                                ||
                                "",

                            title:
                                section.title
                                ||
                                "",

                            excerpt:
                                body.slice(
                                    0,
                                    600
                                )
                        });
                    }
                }
            );
        }
    );

    return {
        priorInnanetPosts:
            posts.slice(
                0,
                30
            ),

        priorWwowArticles:
            articles.slice(
                0,
                12
            )
    };
}

// =================================
// SEGMENT HELPERS
// =================================


function segmentRevisionForEvent(
    eventId,
    segments
) {


    const eventSegments =

        segments

            .filter(

                segment =>

                    segment.eventId ===
                    eventId

            )

            .sort(

                (
                    a,
                    b
                ) =>

                    String(
                        a.id || ""
                    )

                        .localeCompare(

                            String(
                                b.id || ""
                            )

                        )

            )

            .map(

                segment => ({


                    id:
                        segment.id,


                    title:
                        segment.title,


                    importance:
                        segment.importance,


                    participantIds:

                        Array.isArray(
                            segment.participantIds
                        )

                            ? segment.participantIds

                            : [],


                    summary:
                        segment.summary,


                    revisionTime:

                        segment.updatedAt

                        ||

                        segment.createdAt

                        ||

                        ""

                })

            );


    return JSON.stringify(
        eventSegments
    );

}



function segmentFactsForEvent(
    eventId,
    segments,
    wrestlerMap
) {


    return segments

        .filter(

            segment =>

                segment.eventId ===
                eventId

        )

        .sort(

            (
                a,
                b
            ) =>

                String(
                    a.createdAt || ""
                )

                    .localeCompare(

                        String(
                            b.createdAt || ""
                        )

                    )

        )

        .map(

            segment => {


                const participantIds =

                    Array.isArray(
                        segment.participantIds
                    )

                        ? segment.participantIds

                        : [];


                return {


                    id:
                        segment.id,


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

}



function archivedEventRevisions(
    innanetArchives
) {


    const revisions =
        new Map();


    innanetArchives.forEach(

        ({ data }) => {


            (

                data.events

                ||

                []

            )

                .forEach(

                    event => {


                        if (
                            !event.eventId
                        ) {


                            return;

                        }


                        revisions.set(

                            event.eventId,

                            Object.prototype
                                .hasOwnProperty
                                .call(

                                    event,
                                    "segmentRevision"

                                )

                                ? event.segmentRevision

                                : null

                        );

                    }

                );

        }

    );


    return revisions;

}

function involvedOfficialTeams(
    eventMatches,
    teams,
    officialTeamBySignature
) {
    const ids =
        new Set();

    eventMatches.forEach(
        match => {
            (
                match.sides || []
            ).forEach(
                side => {
                    const members =
                        side.wrestlers || [];

                    const official =
                        officialTeamBySignature.get(
                            signature(
                                members
                            )
                        );

                    if (
                        official
                    ) {
                        ids.add(
                            official.id
                        );
                    }

                    teams.forEach(
                        team => {
                            if (
                                Array.isArray(
                                    team.members
                                )

                                &&

                                team.members.length
                                ===
                                2

                                &&

                                team.members.every(
                                    memberId =>
                                        members.includes(
                                            memberId
                                        )
                                )
                            ) {
                                ids.add(
                                    team.id
                                );
                            }
                        }
                    );
                }
            );
        }
    );

    return teams.filter(
        team =>
            ids.has(
                team.id
            )
    );
}
function standoutFacts(
    matchFacts
) {
    const rated =
        matchFacts.filter(
            match =>
                Number.isFinite(
                    match.rating
                )

                &&

                match.rating > 0
        );

    const highestRated =
        [...rated]
            .sort(
                (a, b) =>
                    b.rating
                    -
                    a.rating
            )[0]

        ||

        null;

    const koFinishes =
        matchFacts.filter(
            match =>
                normalize(
                    match.finish?.method
                )
                ===
                "ko"
        );

    const titleMatches =
        matchFacts.filter(
            match =>
                match.championship
        );

    return {
        highestRatedMatch:
            highestRated

                ? {
                    match:
                        highestRated.match,

                    rating:
                        highestRated.rating,

                    stars:
                        highestRated.starRating,

                    winner:
                        highestRated.winnerSide
                }

                : null,

        koFinishes:
            koFinishes.map(
                match => ({
                    match:
                        match.match,

                    winner:
                        match.finish?.winner
                        ||
                        match.winnerSide,

                    loser:
                        match.finish?.loser
                        ||
                        "",

                    method:
                        "KO"
                })
            ),

        championshipMatches:
            titleMatches.map(
                match => ({
                    championship:
                        match.championship,

                    match:
                        match.match,

                    winner:
                        match.winnerSide,

                    consequence:
                        match.titleConsequence
                })
            )
    };
}


const [
    events,
    matches,
    announcedMatches,
    wrestlers,
    teams,
    championships,
    reigns,
    accounts,
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
        "data/announced-matches.json",
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
        "data/innanet/accounts.json",
        []
    ),

    readJson(
        "data/innanet/archive-index.json",
        {
            months: []
        }
    ),

    readJson(
        "data/wwow/archive-index.json",
        {
            issues: []
        }
    )
]);


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


const teamMap =
    Object.fromEntries(
        teams.map(
            team => [
                team.id,
                team
            ]
        )
    );


const officialTeamBySignature =
    new Map(
        teams
            .filter(
                team =>
                    Array.isArray(
                        team.members
                    )

                    &&

                    team.members.length
                    ===
                    2
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

const activeAccounts =

    accounts.filter(

        account =>

            normalize(

                account.status

                ||

                "active"

            )

            !==

            "retired"

    );
const directories = {
    wrestlers:
        Object.fromEntries(
            wrestlers.map(
                wrestler => [
                    wrestler.id,

                    wrestler.name
                    ||
                    wrestler.id
                ]
            )
        ),

    teams:
        Object.fromEntries(
            teams.map(
                team => [
                    team.id,

                    team.name
                    ||
                    team.id
                ]
            )
        ),

    championships:
        Object.fromEntries(
            championships.map(
                championship => [
                    championship.id,

                    championship.name
                    ||
                    championship.id
                ]
            )
        )
};


const innanetArchives =
    await loadArchiveFiles(
        innanetIndex,
        "months"
    );


const wwowArchives =
    await loadArchiveFiles(
        wwowIndex,
        "issues"
    );


const alreadyArchived =
    archivedEventIds(
        innanetArchives
    );


const completedMatchesByEvent =
    new Map();


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
    .forEach(
        match => {
            const event =
                getEventForMatch(
                    match,
                    eventMap,
                    events
                );

            if (
                !event?.id
            ) {
                return;
            }

            if (
                !completedMatchesByEvent.has(
                    event.id
                )
            ) {
                completedMatchesByEvent.set(
                    event.id,
                    []
                );
            }

            completedMatchesByEvent
                .get(
                    event.id
                )
                .push(
                    match
                );
        }
    );


const announcedEventIds =
    new Set(
        announcedMatches
            .map(
                match =>
                    match.eventId
            )
            .filter(Boolean)
    );


let eligibleEvents =
    events
        .filter(
            event =>
                completedMatchesByEvent.has(
                    event.id
                )
        )
        .filter(
            event =>
                !announcedEventIds.has(
                    event.id
                )
        )
        .filter(
            event =>
                !alreadyArchived.has(
                    event.id
                )
        )
        .sort(
            (a, b) =>
                asDate(
                    a.date
                )
                -
                asDate(
                    b.date
                )
        );


if (
    EVENT_ID
) {
    eligibleEvents =
        eligibleEvents.filter(
            event =>
                event.id
                ===
                EVENT_ID
        );

    if (
        !eligibleEvents.length
    ) {
        throw new Error(
            `Event ${EVENT_ID} is not eligible. It may still have announced matches, have no completed matches, already be archived, or not exist.`
        );
    }
}


const queue = [];


for (
    const event of eligibleEvents
) {
    const eventMatches =
        [
            ...(
                completedMatchesByEvent.get(
                    event.id
                )
                ||
                []
            )
        ]
            .sort(
                (a, b) =>
                    Number(
                        a.order || 0
                    )
                    -
                    Number(
                        b.order || 0
                    )
            );


    const matchesThroughDate =
        matches.filter(
            match => {
                const matchEvent =
                    getEventForMatch(
                        match,
                        eventMap,
                        events
                    );

                return (
                    matchEvent?.date

                    &&

                    asDate(
                        matchEvent.date
                    )
                    <=
                    asDate(
                        event.date
                    )
                );
            }
        );


    const participantIds =
        new Set(
            eventMatches.flatMap(
                match =>
                    (
                        match.sides || []
                    ).flatMap(
                        side =>
                            side.wrestlers
                            ||
                            []
                    )
            )
        );


    const participantWrestlers =
        wrestlers.filter(
            wrestler =>
                participantIds.has(
                    wrestler.id
                )
        );


    const participantTeams =
        involvedOfficialTeams(
            eventMatches,
            teams,
            officialTeamBySignature
        );


    const participantNames = [
        ...participantWrestlers.map(
            wrestler =>
                wrestler.name
                ||
                wrestler.id
        ),

        ...participantTeams.map(
            team =>
                team.name
                ||
                team.id
        )
    ];
const worldHistoryMemory =

    await loadWorldHistoryMemory({


        root:
            ROOT,


        beforeMonth:

            monthId(
                event.date
            ),


        entityIds: [


            ...participantWrestlers.map(

                wrestler =>
                    wrestler.id

            ),


            ...participantTeams.map(

                team =>
                    team.id

            )

        ],


        maxMonths:
            4,


        maxEntities:
            12,


        includeCompanyHistory:
            false

    });

    const matchFacts =
        eventMatches.map(
            match =>
                buildMatchFact(
                    match,
                    wrestlerMap,
                    championshipMap,
                    officialTeamBySignature,
                    directories,
                    reigns,
                    event
                )
        );


    queue.push({
        event: {
            id:
                event.id,

            name:
                event.name,

            brand:
                event.brand
                ||
                "OWL",

            eventType:
                event.eventType
                ||
                "",

            date:
                event.date,

            location:
                event.location
                ||
                "",

            tagline:
                event.tagline
                ||
                ""
        },


        rules: {
            canonBoundary:
                "Only structured database facts are canon. Analysis, opinion, jokes, criticism, and clearly labeled rumor are allowed. Do not invent matches, injuries, contracts, backstage incidents, title changes, alignments, or future booking as fact.",

            koMeaning:
                "In OWL, a recorded KO is rare and symbolically represents injury-level damage. Treat it as a major event without inventing a medical diagnosis or recovery timetable.",

            wrestlerPosting:
                "Wrestler posts should be occasional, not automatic. Use roster identity and actual results only. Do not make a wrestler announce unrecorded matches or storylines."
        },


        matches:
            matchFacts,


        standoutFacts:
            standoutFacts(
                matchFacts
            ),


        wrestlerContext:
            participantWrestlers.map(
                wrestler =>
                    summarizeWrestler(
                        wrestler,
                        matchesThroughDate,
                        eventMap,
                        events,
                        reigns,
                        championshipMap,
                        event.date
                    )
            ),


        teamContext:
            participantTeams.map(
                team =>
                    summarizeTeam(
                        team,
                        matchesThroughDate,
                        eventMap,
                        events,
                        reigns,
                        championshipMap,
                        event.date,
                        officialTeamBySignature
                    )
            ),


        mediaMemory:

    relevantMediaMemory(

        innanetArchives,

        wwowArchives,

        participantNames,

        event.date

    ),


worldHistoryMemory,


availableAccounts: activeAccounts,


        entityDirectory:
            directories
    });
}


const output = {
    generatedAt:
        new Date()
            .toISOString(),

    pendingEventCount:
        queue.length,

    pendingEvents:
        queue
};


await writeJson(
    "data/innanet/generation-queue.json",
    output
);


console.log(
    `Built Innanet generation context for ${queue.length} pending event(s).`
);
