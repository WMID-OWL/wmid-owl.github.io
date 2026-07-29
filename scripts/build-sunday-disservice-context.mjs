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

    return (

        !item?.status

        ||

        normalize(
            item.status
        ) === "completed"

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


function dateFallsWithin(
    dateString,
    startDate,
    endDate
) {

    return (

        String(
            dateString || ""
        ) >= startDate

        &&

        String(
            dateString || ""
        ) <= endDate

    );

}


// =================================
// LOAD DATA
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
    afterDarkIndex,
    sundayIndex,
    treyProfile

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
    ),


    readJson(
        "data/sunday-disservice/archive-index.json",
        {
            version:
                1,

            sermons:
                []
        }
    ),


    readJson(
        "data/sunday-disservice/trey-wise-profile.json"
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


function wrestlerName(
    wrestlerId
) {

    return (

        wrestlerMap[
            wrestlerId
        ]?.name

        ||

        wrestlerId

        ||

        "Unknown"

    );

}


function teamNameFromSide(
    side
) {

    const wrestlerIds =
        array(
            side?.wrestlers
        );


    const officialTeam =

        teamBySignature.get(

            signature(
                wrestlerIds
            )

        );


    if (
        officialTeam
    ) {

        return officialTeam.name;

    }


    if (
        side?.teamId
    ) {

        const directTeam =

            array(
                teams
            ).find(

                team =>
                    team.id === side.teamId

            );


        if (
            directTeam
        ) {

            return directTeam.name;

        }

    }


    if (
        wrestlerIds.length
    ) {

        return wrestlerIds

            .map(
                wrestlerName
            )

            .join(
                " & "
            );

    }


    return side?.name || "Unknown";

}


function matchName(
    match
) {

    const sides =
        array(
            match?.sides
        );


    if (
        sides.length
    ) {

        return sides

            .map(
                teamNameFromSide
            )

            .join(
                " vs. "
            );

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


function winnerName(
    match
) {

    if (
        Number.isInteger(
            match?.winnerSide
        )
    ) {

        const winningSide =

            array(
                match.sides
            )[
                match.winnerSide
            ];


        if (
            winningSide
        ) {

            return teamNameFromSide(
                winningSide
            );

        }

    }


    return (

        match?.winner

        ||

        (
            normalize(
                match?.resultType
            ) === "draw"

                ? "Draw"

                : "—"
        )

    );

}


// =================================
// EVENT CONTENT
// =================================


function completedEventMatches(
    eventId
) {

    return array(
        matches
    )

        .filter(

            match =>

                match.eventId === eventId

                &&

                isCompleted(
                    match
                )

        )

        .sort(

            (
                a,
                b
            ) =>

                Number(
                    a.order || 0
                )

                -

                Number(
                    b.order || 0
                )

        );

}


function eventSegments(
    eventId
) {

    return array(
        segments
    )

        .filter(

            segment =>
                segment.eventId === eventId

        )

        .sort(

            (
                a,
                b
            ) =>

                Number(
                    a.order || 0
                )

                -

                Number(
                    b.order || 0
                )

                ||

                String(
                    a.createdAt || ""
                ).localeCompare(

                    String(
                        b.createdAt || ""
                    )

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
                    array(
                        segment.participantIds
                    ),

                participantNames:

                    array(
                        segment.participantIds
                    ).map(
                        wrestlerName
                    )

            })

        );

}


function matchFact(
    match
) {

    const championship =

        match?.championshipId

            ? championshipMap[
                match.championshipId
            ]

            : null;


    const rating =
        Number(
            match?.rating
        );


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
            Number(
                match.order || 0
            ),

        matchType:

            match.matchType

            ||

            match.stipulation

            ||

            "MATCH",

        match:
            matchName(
                match
            ),

        winner:
            winnerName(
                match
            ),

        resultType:
            match.resultType || "",

        finish:
            match.finish || null,

        rating:

            Number.isFinite(
                rating
            )

                ? rating

                : null,

        stars:

            Number.isFinite(
                stars
            )

                ? stars

                : null,

        championshipId:
            match.championshipId || "",

        championship:
            championship?.name || "",

        titleOutcome:
            match.titleOutcome || "",

        participantIds:

            array(
                match.sides
            ).flatMap(

                side =>
                    array(
                        side.wrestlers
                    )

            )

    };

}


function buildEventPackage(
    event
) {

    return {

        id:
            event.id,

        name:
            event.name || event.id,

        brand:
            event.brand || "OWL",

        eventType:
            event.eventType || "event",

        date:
            event.date,

        label:
            formatDate(
                event.date
            ),

        location:
            event.location || "",

        tagline:
            event.tagline || "",

        matches:

            completedEventMatches(
                event.id
            ).map(
                matchFact
            ),

        segments:
            eventSegments(
                event.id
            )

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
        asDate(
            dateString
        );


    return array(
        titleReigns
    )

        .filter(

            reign =>

                reign.holderType === "wrestler"

                &&

                reign.holderId === wrestlerId

                &&

                reign.wonDate

                &&

                asDate(
                    reign.wonDate
                ) <= cutoff

                &&

                (
                    !reign.lostDate

                    ||

                    asDate(
                        reign.lostDate
                    ) > cutoff
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
                            array(
                                match.participantIds
                            )

                    ),

                    ...eventPackage.segments.flatMap(

                        segment =>
                            array(
                                segment.participantIds
                            )

                    )

                ]

            )

        );


    return [...participantIds]

        .map(

            wrestlerId => {

                const wrestler =
                    wrestlerMap[
                        wrestlerId
                    ];


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

            (
                a,
                b
            ) =>

                a.name.localeCompare(
                    b.name
                )

        );

}


// =================================
// INNANET MEMORY
// =================================


async function loadInnanetMonth(
    monthEntry
) {

    if (
        !monthEntry?.file
    ) {

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
                    String(
                        event.date || ""
                    ).slice(
                        0,
                        7
                    )

            )

        )

    ];


    const monthEntries =

        array(
            innanetIndex.months
        ).filter(

            month =>
                monthIds.includes(
                    month.id
                )

        );


    const monthFiles =

        await Promise.all(

            monthEntries.map(
                loadInnanetMonth
            )

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
                    normalize(
                        event.name
                    )

            )

        );


    const eventDates =

        new Set(

            selectedEvents.map(
                event => event.date
            )

        );


    return monthFiles

        .filter(
            Boolean
        )

        .flatMap(

            monthData =>
                array(
                    monthData.events
                )

        )

        .filter(

            event =>

                eventIds.has(
                    event.eventId
                )

                ||

                eventIds.has(
                    event.id
                )

                ||

                (
                    eventDates.has(
                        event.date
                    )

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

                array(
                    event.posts
                ).map(

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

        .sort(

            (
                a,
                b
            ) =>

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

        .slice(
            0,
            30
        );

}


// =================================
// AFTER DARK MEMORY
// =================================


function compactAfterDarkEpisode(
    episode
) {

    return {

        id:
            episode.id,

        episode:
            episode.episode,

        airDate:
            episode.airDate,

        headline:
            episode.headline || "",

        deck:
            episode.deck || "",

        ascension:

            episode.ascension

                ? {

                    eventId:
                        episode.ascension.eventId || "",

                    name:
                        episode.ascension.name || "Ascension",

                    summary:
                        episode.ascension.summary || ""

                }

                : null,

        revolt:

            episode.revolt

                ? {

                    eventId:
                        episode.revolt.eventId || "",

                    name:
                        episode.revolt.name || "Revolt",

                    summary:
                        episode.revolt.summary || ""

                }

                : null,

        matchOfWeek:
            episode.matchOfWeek || null,

        titleChanges:
            array(
                episode.titleChanges
            ),

        storyFallout:
            array(
                episode.storyFallout
            ),

        powerShifts:
            array(
                episode.powerShifts
            ),

        closingNote:
            episode.closingNote || ""

    };

}


async function loadAfterDarkEpisode(
    entry
) {

    if (
        !entry?.file
    ) {

        return null;

    }


    const episode =

        await readJson(
            entry.file,
            null
        );


    return episode

        ? compactAfterDarkEpisode(
            episode
        )

        : null;

}


// =================================
// PRIOR SERMON MEMORY
// =================================


function compactSermon(
    sermon
) {

    return {

        id:
            sermon.id,

        sermon:
            sermon.sermon,

        deliveryDate:
            sermon.deliveryDate,

        headline:
            sermon.headline || "",

        deck:
            sermon.deck || "",

        argument:

            sermon.argument

                ? {

                    title:
                        sermon.argument.title || "",

                    body:
                        array(
                            sermon.argument.body
                        ).slice(
                            0,
                            4
                        )

                }

                : {

                    title:
                        "",

                    body:
                        []

                },

        praise:
            array(
                sermon.praise
            ),

        condemnation:
            array(
                sermon.condemnation
            ),

        favorites:
            array(
                sermon.favorites
            ),

        blindSpots:
            array(
                sermon.blindSpots
            ),

        closingWord:
            sermon.closingWord || ""

    };

}


async function loadPriorSermons(
    deliveryDate
) {

    const entries =

        array(
            sundayIndex.sermons
        )

            .filter(

                entry =>

                    entry.deliveryDate

                    &&

                    entry.deliveryDate < deliveryDate

                    &&

                    entry.file

            )

            .sort(

                (
                    a,
                    b
                ) =>

                    String(
                        b.deliveryDate
                    ).localeCompare(

                        String(
                            a.deliveryDate
                        )

                    )

            )

            .slice(
                0,
                8
            );


    const sermons =

        await Promise.all(

            entries.map(

                entry =>
                    readJson(
                        entry.file,
                        null
                    )

            )

        );


    return sermons

        .filter(
            Boolean
        )

        .map(
            compactSermon
        );

}


function buildTreyEditorialMemory(
    priorSermons
) {

    const favoritesEvidence =

        priorSermons.flatMap(

            sermon =>

                array(
                    sermon.favorites
                ).map(

                    entry => ({

                        sermon:
                            sermon.sermon,

                        deliveryDate:
                            sermon.deliveryDate,

                        title:
                            entry.title || "",

                        body:
                            entry.body || ""

                    })

                )

        );


    const blindSpotEvidence =

        priorSermons.flatMap(

            sermon =>

                array(
                    sermon.blindSpots
                ).map(

                    entry => ({

                        sermon:
                            sermon.sermon,

                        deliveryDate:
                            sermon.deliveryDate,

                        title:
                            entry.title || "",

                        body:
                            entry.body || ""

                    })

                )

        );


    const previousClaims =

        priorSermons.map(

            sermon => ({

                sermon:
                    sermon.sermon,

                deliveryDate:
                    sermon.deliveryDate,

                headline:
                    sermon.headline,

                argumentTitle:
                    sermon.argument?.title || "",

                closingWord:
                    sermon.closingWord

            })

        );


    return {

        sermonCount:
            priorSermons.length,

        previousClaims,

        favoritesEvidence:
            favoritesEvidence.slice(
                0,
                24
            ),

        blindSpotEvidence:
            blindSpotEvidence.slice(
                0,
                24
            ),

        rule:
            "Favorites and blind spots must emerge from repeated published behavior. A single prior mention does not automatically establish a permanent bias."

    };

}


// =================================
// VERIFIED WEEK SUMMARY
// =================================


function buildWeekSummary(
    eventPackages,
    deliveryDate
) {

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

                        eventType:
                            eventPackage.eventType,

                        eventDate:
                            eventPackage.date

                    })

                )

        );


    const ratedMatches =

        allMatches

            .filter(

                match =>
                    Number.isFinite(
                        match.rating
                    )

            )

            .sort(

                (
                    a,
                    b
                ) =>

                    b.rating

                    -

                    a.rating

                    ||

                    Number(
                        b.stars || 0
                    )

                    -

                    Number(
                        a.stars || 0
                    )

            );


    const titleChanges =

        allMatches

            .filter(

                match =>

                    normalize(
                        match.titleOutcome
                    ) === "changed"

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


    return {

        eventCount:
            eventPackages.length,

        matchCount:
            allMatches.length,

        segmentCount:

            eventPackages.reduce(

                (
                    total,
                    eventPackage
                ) =>

                    total

                    +

                    eventPackage.segments.length,

                0

            ),

        highestRatedMatches:
            ratedMatches.slice(
                0,
                8
            ),

        titleChanges,

        participantDirectory:

            participantDirectory(
                eventPackages,
                deliveryDate
            )

    };

}


// =================================
// PUBLISHED STATE
// =================================


const publishedSermonIds =

    new Set(

        array(
            sundayIndex.sermons
        ).map(

            sermon =>
                sermon.id

        )

    );


const publishedDeliveryDates =

    new Set(

        array(
            sundayIndex.sermons
        ).map(

            sermon =>
                sermon.deliveryDate

        )

    );


const existingSermonNumbers =

    array(
        sundayIndex.sermons
    )

        .map(

            sermon =>
                Number(
                    sermon.sermon
                )

        )

        .filter(
            Number.isFinite
        );


const firstPendingSermonNumber =

    existingSermonNumbers.length

        ? Math.max(
            ...existingSermonNumbers
        ) + 1

        : 1;


// =================================
// CANDIDATE AFTER DARK EPISODES
// =================================


const afterDarkEntries =

    array(
        afterDarkIndex.episodes
    )

        .filter(

            entry =>

                entry.airDate

                &&

                entry.file

        )

        .sort(

            (
                a,
                b
            ) =>

                String(
                    a.airDate
                ).localeCompare(

                    String(
                        b.airDate
                    )

                )

        );


const candidateWeeks =
    [];


for (
    const afterDarkEntry of afterDarkEntries
) {

    const startDate =
        weekStartId(
            afterDarkEntry.airDate
        );


    const deliveryDate =
        weekEndId(
            startDate
        );


    const sermonId =
        `sunday-disservice-${deliveryDate}`;


    if (
        publishedSermonIds.has(
            sermonId
        )

        ||

        publishedDeliveryDates.has(
            deliveryDate
        )
    ) {

        continue;

    }


    const afterDarkEpisode =

        await loadAfterDarkEpisode(
            afterDarkEntry
        );


    if (
        !afterDarkEpisode
    ) {

        continue;

    }


    const weekEvents =

        array(
            events
        )

            .filter(

                event =>

                    event.date

                    &&

                    isCompleted(
                        event
                    )

                    &&

                    dateFallsWithin(
                        event.date,
                        startDate,
                        deliveryDate
                    )

            )

            .sort(

                (
                    a,
                    b
                ) =>

                    String(
                        a.date
                    ).localeCompare(

                        String(
                            b.date
                        )

                    )

            );


    const ascensionEventId =
        afterDarkEpisode.ascension?.eventId;


    const revoltEventId =
        afterDarkEpisode.revolt?.eventId;


    const includesAscension =

        weekEvents.some(

            event =>
                event.id === ascensionEventId

        );


    const includesRevolt =

        weekEvents.some(

            event =>
                event.id === revoltEventId

        );


    if (
        !includesAscension

        ||

        !includesRevolt
    ) {

        continue;

    }


    candidateWeeks.push({

        afterDarkEntry,
        afterDarkEpisode,
        startDate,
        deliveryDate,
        sermonId,
        weekEvents

    });

}


// =================================
// BUILD GENERATION PACKAGES
// =================================


const pendingWeeks =
    [];


for (
    let index = 0;
    index < candidateWeeks.length;
    index += 1
) {

    const candidate =
        candidateWeeks[
            index
        ];


    const eventPackages =

        candidate.weekEvents.map(
            buildEventPackage
        );


    const priorSermons =

        await loadPriorSermons(
            candidate.deliveryDate
        );


    const worldHistoryMemory =

        await loadWorldHistoryMemory({

            root:
                ROOT,

            beforeMonth:
                String(
                    candidate.deliveryDate
                ).slice(
                    0,
                    7
                ),

            maxMonths:
                6,

            maxEntities:
                16,

            includeCompanyHistory:
                false

        });


    pendingWeeks.push({

        id:
            candidate.sermonId,

        sermon:
            firstPendingSermonNumber + index,

        deliveryDate:
            candidate.deliveryDate,

        label:
            formatDate(
                candidate.deliveryDate
            ),

        host:
            "Trey Wise",

        week: {

            id:
                candidate.startDate,

            startDate:
                candidate.startDate,

            endDate:
                candidate.deliveryDate

        },

        hostProfile:
            treyProfile,

        rules: {

            canonBoundary:
                "Only supplied structured OWL facts and recorded segment summaries are wrestling canon. Trey may argue, praise, criticize, speculate, and be biased, but he may not invent events or convert opinion into fact.",

            afterDarkBoundary:
                "OWL After Dark is verified editorial commentary built from the week's canon. Trey may agree, disagree, or revisit its conclusions. After Dark analysis is not additional wrestling canon.",

            innanetBoundary:
                "Innanet posts are public reaction and opinion. Trey may cite the existence or direction of supplied reaction, but he may not treat fan opinion as objective proof.",

            memoryBoundary:
                "Prior sermons establish Trey's published opinions, predictions, favorites, blind spots, contradictions, and rhetorical habits. They do not establish new wrestling facts.",

            futureBoundary:
                "Predictions must be clearly framed as predictions, expectations, questions, or personal judgments. Never invent announced matches, challengers, injuries, returns, signings, releases, contracts, or title plans.",

            ppvCoverage:
                "Any completed OWL PPV or special event inside the supplied Monday-through-Sunday window is part of this sermon's verified week and may outweigh the weekly shows when the evidence supports it."

        },

        weeklyCanon: {

            events:
                eventPackages,

            summary:

                buildWeekSummary(
                    eventPackages,
                    candidate.deliveryDate
                )

        },

        mediaMemory: {

            afterDarkEpisode:
                candidate.afterDarkEpisode,

            innanetReaction:

                await loadInnanetReaction(
                    candidate.weekEvents
                ),

            priorSermons,

            treyEditorialMemory:

                buildTreyEditorialMemory(
                    priorSermons
                )

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

    "data/sunday-disservice/generation-queue.json",

    output

);


console.log(

    `Built Sunday Disservice generation context for ${pendingWeeks.length} pending week(s).`

);
