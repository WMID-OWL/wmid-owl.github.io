import fs from "node:fs/promises";
import path from "node:path";

import {
    loadWorldHistoryMemory
} from "./world-history-memory.mjs";


const ROOT =
    process.cwd();


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


function array(
    value
) {


    return Array.isArray(
        value
    )

        ? value

        : [];

}


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


function formatDate(
    dateString
) {


    if (
        !dateString
    ) {


        return "";

    }


    return asDate(
        dateString
    ).toLocaleDateString(

        "en-US",

        {
            month:
                "long",

            day:
                "numeric",

            year:
                "numeric",

            timeZone:
                "UTC"
        }

    );

}


function isoDate(
    date
) {


    return [

        date.getUTCFullYear(),

        String(
            date.getUTCMonth() + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getUTCDate()
        ).padStart(
            2,
            "0"
        )

    ].join(
        "-"
    );

}


function weekStartId(
    dateString
) {


    const date =

        asDate(
            dateString
        );


    const day =

        date.getUTCDay();


    const mondayOffset =

        day === 0

            ? -6

            : 1 - day;


    date.setUTCDate(

        date.getUTCDate()

        +

        mondayOffset

    );


    return isoDate(
        date
    );

}


function weekEndId(
    startDate
) {


    const date =

        asDate(
            startDate
        );


    date.setUTCDate(

        date.getUTCDate() + 6

    );


    return isoDate(
        date
    );

}


function isCompleted(
    item
) {


    return normalize(
        item?.status
    ) === "completed";

}


function isWeeklyEvent(
    event
) {


    return [

        "weekly",
        "weekly-show",
        "weekly show"

    ].includes(

        normalize(
            event?.eventType
        )

    );

}


function signature(
    ids = []
) {


    return [...ids]

        .sort()

        .join(
            "|"
        );

}


// =================================
// LOAD CORE DATA
// =================================


const [

    events,
    matches,
    segments,
    wrestlers,
    teams,
    championships,
    titleReigns,
    innanetIndex,
    afterDarkIndex

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
        "data/after-dark/archive-index.json",
        {
            version:
                1,

            episodes:
                []
        }
    )

]);


// =================================
// MAPS
// =================================


const eventMap =

    Object.fromEntries(

        array(
            events
        ).map(

            event => [

                event.id,
                event

            ]

        )

    );


const wrestlerMap =

    Object.fromEntries(

        array(
            wrestlers
        ).map(

            wrestler => [

                wrestler.id,
                wrestler

            ]

        )

    );


const championshipMap =

    Object.fromEntries(

        array(
            championships
        ).map(

            championship => [

                championship.id,
                championship

            ]

        )

    );


const teamBySignature =

    new Map(

        array(
            teams
        )

            .filter(

                team =>

                    array(
                        team.members
                    ).length === 2

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
// NAME HELPERS
// =================================

function wrestlerName(wrestlerId) {
    return wrestlerMap[wrestlerId]?.name || wrestlerId || "Unknown";
}

function sideName(side) {
    const wrestlerIds = array(side?.wrestlers);
    const officialTeam = teamBySignature.get(signature(wrestlerIds));

    if (officialTeam) {
        return officialTeam.name;
    }

    if (side?.teamId) {
        const directTeam = array(teams).find(
            team => team.id === side.teamId
        );

        if (directTeam) {
            return directTeam.name;
        }
    }

    if (wrestlerIds.length) {
        return wrestlerIds
            .map(wrestlerName)
            .join(" & ");
    }

    return side?.name || "Unknown";
}

function matchName(match) {
    const sides = array(match?.sides);

    if (sides.length) {
        return sides
            .map(sideName)
            .join(" vs. ");
    }

    return (
        match?.match
        ||
        match?.resultText
        ||
        match?.matchType
        ||
        "Untitled Match"
    );
}

function winnerName(match) {
    if (Number.isInteger(match?.winnerSide)) {
        const winningSide =
            array(match.sides)[match.winnerSide];

        if (winningSide) {
            return sideName(winningSide);
        }
    }

    return (
        match?.winner
        ||
        (
            normalize(match?.resultType) === "draw"
                ? "Draw"
                : "—"
        )
    );
}


// =================================
// EVENT CONTENT
// =================================

function completedEventMatches(eventId) {
    return array(matches)
        .filter(
            match =>
                match.eventId === eventId

                &&

                (
                    !match.status
                    ||
                    isCompleted(match)
                )
        )
        .sort(
            (a, b) =>
                Number(a.order || 0)
                -
                Number(b.order || 0)
        );
}

function eventSegments(eventId) {
    return array(segments)
        .filter(
            segment =>
                segment.eventId === eventId
        )
        .sort(
            (a, b) =>
                Number(a.order || 0)
                -
                Number(b.order || 0)

                ||

                String(a.createdAt || "")
                    .localeCompare(
                        String(b.createdAt || "")
                    )
        )
        .map(
            segment => ({
                id:
                    segment.id,

                type:
                    segment.type || "segment",

                title:
                    segment.title || "",

                summary:
                    segment.summary
                    ||
                    segment.description
                    ||
                    segment.body
                    ||
                    "",

                participantIds:
                    array(segment.participantIds),

                participantNames:
                    array(segment.participantIds)
                        .map(wrestlerName)
            })
        );
}

function matchFact(match) {
    const championship =
        match?.championshipId
            ? championshipMap[match.championshipId]
            : null;

    const rating =
        Number(match?.rating);

    const stars =
        Number(
            match?.starRating
            ??
            match?.stars
        );

    return {
        id:
            match.id || "",

        order:
            Number(match.order || 0),

        matchType:
            match.matchType
            ||
            match.stipulation
            ||
            "MATCH",

        match:
            matchName(match),

        winner:
            winnerName(match),

        resultType:
            match.resultType || "",

        finish:
            match.finish || null,

        rating:
            Number.isFinite(rating)
                ? rating
                : null,

        stars:
            Number.isFinite(stars)
                ? stars
                : null,

        championshipId:
            match.championshipId || "",

        championship:
            championship?.name || "",

        titleOutcome:
            match.titleOutcome || "",

        participantIds:
            array(match.sides)
                .flatMap(
                    side =>
                        array(side.wrestlers)
                )
    };
}

function buildEventPackage(event) {
    return {
        id:
            event.id,

        name:
            event.name || event.id,

        brand:
            event.brand || "OWL",

        eventType:
            event.eventType || "weekly",

        date:
            event.date,

        label:
            formatDate(event.date),

        location:
            event.location || "",

        tagline:
            event.tagline || "",

        matches:
            completedEventMatches(event.id)
                .map(matchFact),

        segments:
            eventSegments(event.id)
    };
}


// =================================
// CURRENT TITLE CONTEXT
// =================================

function activeTitlesAsOf(
    wrestlerId,
    dateString
) {
    const cutoff =
        asDate(dateString);

    return array(titleReigns)
        .filter(
            reign =>
                reign.holderType === "wrestler"

                &&

                reign.holderId === wrestlerId

                &&

                reign.wonDate

                &&

                asDate(reign.wonDate) <= cutoff

                &&

                (
                    !reign.lostDate
                    ||
                    asDate(reign.lostDate) > cutoff
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

function participantDirectory(
    eventPackages,
    asOfDate
) {
    const participantIds =
        new Set(
            eventPackages.flatMap(
                eventPackage => [
                    ...eventPackage.matches.flatMap(
                        match =>
                            array(match.participantIds)
                    ),

                    ...eventPackage.segments.flatMap(
                        segment =>
                            array(segment.participantIds)
                    )
                ]
            )
        );

    return [...participantIds]
        .map(
            wrestlerId => {
                const wrestler =
                    wrestlerMap[wrestlerId];

                return {
                    id:
                        wrestlerId,

                    name:
                        wrestler?.name || wrestlerId,

                    nickname:
                        wrestler?.nickname || "",

                    brand:
                        wrestler?.brand || "OWL",

                    division:
                        wrestler?.division || "",

                    team:
                        wrestler?.team || "",

                    faction:
                        wrestler?.faction || "",

                    currentTitles:
                        activeTitlesAsOf(
                            wrestlerId,
                            asOfDate
                        )
                };
            }
        )
        .sort(
            (a, b) =>
                a.name.localeCompare(b.name)
        );
}


// =================================
// INNANET MEMORY
// =================================

async function loadInnanetMonth(
    monthEntry
) {
    if (!monthEntry?.file) {
        return null;
    }

    return readJson(
        monthEntry.file,
        null
    );
}

async function loadInnanetReaction(
    selectedEvents
) {
    const monthIds = [
        ...new Set(
            selectedEvents.map(
                event =>
                    String(event.date || "")
                        .slice(0, 7)
            )
        )
    ];

    const monthEntries =
        array(innanetIndex.months)
            .filter(
                month =>
                    monthIds.includes(month.id)
            );

    const monthFiles =
        await Promise.all(
            monthEntries.map(loadInnanetMonth)
        );

    const eventIds =
        new Set(
            selectedEvents.map(
                event => event.id
            )
        );

    const eventNames =
        new Set(
            selectedEvents.map(
                event =>
                    normalize(event.name)
            )
        );

    const eventDates =
        new Set(
            selectedEvents.map(
                event => event.date
            )
        );

    return monthFiles
        .filter(Boolean)
        .flatMap(
            monthData =>
                array(monthData.events)
        )
        .filter(
            event =>
                eventIds.has(event.eventId)

                ||

                eventIds.has(event.id)

                ||

                (
                    eventDates.has(event.date)

                    &&

                    eventNames.has(
                        normalize(
                            event.eventName
                            ||
                            event.name
                        )
                    )
                )
        )
        .flatMap(
            event =>
                array(event.posts)
                    .map(
                        post => ({
                            eventId:
                                event.eventId
                                ||
                                event.id
                                ||
                                "",

                            eventName:
                                event.eventName
                                ||
                                event.name
                                ||
                                "OWL Event",

                            date:
                                event.date || "",

                            accountName:
                                post.accountName
                                ||
                                post.name
                                ||
                                "Innanet User",

                            handle:
                                post.handle || "",

                            type:
                                post.type || "fan-post",

                            body:
                                post.body || "",

                            likes:
                                Number(post.likes || 0),

                            reposts:
                                Number(post.reposts || 0),

                            replies:
                                Number(post.replies || 0)
                        })
                    )
        )
        .sort(
            (a, b) =>
                (
                    b.likes
                    +
                    b.reposts
                    +
                    b.replies
                )

                -

                (
                    a.likes
                    +
                    a.reposts
                    +
                    a.replies
                )
        )
        .slice(0, 24);
}


// =================================
// PRIOR AFTER DARK MEMORY
// =================================

async function loadPriorEpisodes() {
    const entries =
        array(afterDarkIndex.episodes)
            .slice()
            .sort(
                (a, b) =>
                    String(
                        b.airDate
                        ||
                        b.id
                        ||
                        ""
                    ).localeCompare(
                        String(
                            a.airDate
                            ||
                            a.id
                            ||
                            ""
                        )
                    )
            )
            .slice(0, 4);

    const episodes =
        await Promise.all(
            entries.map(
                entry =>
                    entry.file
                        ? readJson(
                            entry.file,
                            null
                        )
                        : null
            )
        );

    return episodes
        .filter(Boolean)
        .map(
            episode => ({
                id:
                    episode.id,

                episode:
                    episode.episode,

                airDate:
                    episode.airDate,

                headline:
                    episode.headline || "",

                closingNote:
                    episode.closingNote || "",

                storyFallout:
                    array(episode.storyFallout),

                powerShifts:
                    array(episode.powerShifts)
            })
        );
}


// =================================
// WEEK GROUPING
// =================================

const completedWeeklyEvents =
    array(events)
        .filter(
            event =>
                event.date

                &&

                isCompleted(event)

                &&

                isWeeklyEvent(event)

                &&

                [
                    "ascension",
                    "revolt"
                ].includes(
                    normalize(event.brand)
                )
        )
        .sort(
            (a, b) =>
                String(a.date)
                    .localeCompare(
                        String(b.date)
                    )
        );

const weeks =
    new Map();

completedWeeklyEvents.forEach(
    event => {
        const weekId =
            weekStartId(event.date);

        if (!weeks.has(weekId)) {
            weeks.set(
                weekId,
                {
                    weekId,
                    events:
                        []
                }
            );
        }

        weeks.get(weekId)
            .events
            .push(event);
    }
);

const publishedEpisodeIds =
    new Set(
        array(afterDarkIndex.episodes)
            .map(
                episode =>
                    episode.id
            )
    );

const publishedAirDates =
    new Set(
        array(afterDarkIndex.episodes)
            .map(
                episode =>
                    episode.airDate
            )
    );

const existingEpisodeNumbers =
    array(afterDarkIndex.episodes)
        .map(
            episode =>
                Number(episode.episode)
        )
        .filter(Number.isFinite);

const firstPendingEpisodeNumber =
    existingEpisodeNumbers.length
        ? Math.max(
            ...existingEpisodeNumbers
        ) + 1
        : 1;

const priorEpisodes =
    await loadPriorEpisodes();

const candidateWeeks =
    [...weeks.values()]
        .map(
            week => {
                const ascension =
                    week.events
                        .filter(
                            event =>
                                normalize(event.brand)
                                ===
                                "ascension"
                        )
                        .at(-1);

                const revolt =
                    week.events
                        .filter(
                            event =>
                                normalize(event.brand)
                                ===
                                "revolt"
                        )
                        .at(-1);

                return {
                    ...week,
                    ascension,
                    revolt
                };
            }
        )
        .filter(
            week =>
                week.ascension

                &&

                week.revolt

                &&

                completedEventMatches(
                    week.ascension.id
                ).length > 0

                &&

                completedEventMatches(
                    week.revolt.id
                ).length > 0
        )
        .filter(
            week => {
                const episodeId =
                    `after-dark-${week.revolt.date}`;

                return (
                    !publishedEpisodeIds.has(
                        episodeId
                    )

                    &&

                    !publishedAirDates.has(
                        week.revolt.date
                    )
                );
            }
        )
        .sort(
            (a, b) =>
                String(a.revolt.date)
                    .localeCompare(
                        String(b.revolt.date)
                    )
        );


// =================================
// BUILD PENDING PACKAGES
// =================================

const pendingWeeks =
    [];

for (
    let index = 0;
    index < candidateWeeks.length;
    index += 1
) {
    const week =
        candidateWeeks[index];

    const ascension =
        buildEventPackage(
            week.ascension
        );

    const revolt =
        buildEventPackage(
            week.revolt
        );

    const eventPackages = [
        ascension,
        revolt
    ];

    const allMatches =
        eventPackages.flatMap(
            eventPackage =>
                eventPackage.matches.map(
                    match => ({
                        ...match,

                        eventId:
                            eventPackage.id,

                        eventName:
                            eventPackage.name,

                        eventBrand:
                            eventPackage.brand,

                        eventDate:
                            eventPackage.date
                    })
                )
        );

    const matchOfWeekCandidates =
        allMatches
            .filter(
                match =>
                    Number.isFinite(match.rating)
            )
            .sort(
                (a, b) =>
                    b.rating
                    -
                    a.rating

                    ||

                    Number(b.stars || 0)
                    -
                    Number(a.stars || 0)
            )
            .slice(0, 5);

    const titleChanges =
        allMatches
            .filter(
                match =>
                    normalize(match.titleOutcome)
                    ===
                    "changed"

                    &&

                    match.championship
            )
            .map(
                match => ({
                    championshipId:
                        match.championshipId,

                    championship:
                        match.championship,

                    winner:
                        match.winner,

                    eventId:
                        match.eventId,

                    eventName:
                        match.eventName,

                    eventDate:
                        match.eventDate
                })
            );

    const worldHistoryMemory =
        await loadWorldHistoryMemory({
            root:
                ROOT,

            beforeMonth:
                String(week.revolt.date)
                    .slice(0, 7),

            maxMonths:
                4,

            maxEntities:
                12,

            includeCompanyHistory:
                false
        });

    pendingWeeks.push({
        id:
            `after-dark-${week.revolt.date}`,

        episode:
            firstPendingEpisodeNumber + index,

        airDate:
            week.revolt.date,

        label:
            formatDate(week.revolt.date),

        coverageLabel:
            "ASCENSION + REVOLT",

        week: {
            id:
                week.weekId,

            startDate:
                week.weekId,

            endDate:
                weekEndId(week.weekId)
        },

        rules: {
            canonBoundary:
                "Only structured database facts and recorded OWL segment summaries are canon. Analysis and opinion are allowed. Never invent moves, dialogue, crowd behavior, backstage information, injuries, contracts, motivations, future booking, title changes, or consequences that are not explicitly supplied.",

            matchAnalysis:
                "A result, rating, and star rating may support analysis of importance or comparative quality. They do not prove specific moves, pacing, psychology, near falls, crowd reactions, or in-ring sequences.",

            segmentCanon:
                "Recorded segment summaries may be paraphrased and analyzed. Do not invent exact dialogue, additional physical actions, attacks, alliances, challenges, promises, or motivations.",

            mediaReaction:
                "Innanet posts are public reaction and opinion, not objective proof. They may be described as reaction only when the supplied posts support the statement.",

            continuity:
                "Prior After Dark episodes are editorial memory. Never turn an earlier opinion or prediction into a new fact."
        },

        ascension,
        revolt,

        combined: {
            matchCount:
                allMatches.length,

            segmentCount:
                ascension.segments.length
                +
                revolt.segments.length,

            matchOfWeekCandidates,

            titleChanges,

            participantDirectory:
                participantDirectory(
                    eventPackages,
                    week.revolt.date
                )
        },

        mediaMemory: {
            innanetReaction:
                await loadInnanetReaction([
                    week.ascension,
                    week.revolt
                ]),

            priorAfterDarkEpisodes:
                priorEpisodes
        },

        worldHistoryMemory
    });
}


// =================================
// WRITE QUEUE
// =================================

const output = {
    generatedAt:
        new Date().toISOString(),

    pendingWeekCount:
        pendingWeeks.length,

    pendingWeeks
};

await writeJson(
    "data/after-dark/generation-queue.json",
    output
);

console.log(
    `Built OWL After Dark generation context for ${pendingWeeks.length} pending week(s).`
);
