import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const PATHS = {
    events: "data/events.json",
    matches: "data/matches.json",
    segments: "data/segments.json",
    wrestlers: "data/wrestlers.json",
    teams: "data/teams.json",
    landscapeEvents: "data/landscape/events.json",
    landscapeShows: "data/landscape/shows.json",
    locationPools: "data/landscape/location-pools.json"
};

const WEEKLY_SHOW_IDS = {
    ascension: "owl-ascension",
    revolt: "owl-revolt"
};

async function readJson(relativePath, fallback = null) {
    try {
        return JSON.parse(
            await fs.readFile(
                path.join(ROOT, relativePath),
                "utf8"
            )
        );
    }
    catch (error) {
        if (fallback !== null && error?.code === "ENOENT") {
            return fallback;
        }

        throw error;
    }
}

async function writeJson(relativePath, value) {
    await fs.writeFile(
        path.join(ROOT, relativePath),
        `${JSON.stringify(value, null, 2)}\n`,
        "utf8"
    );
}

function normalize(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

function round(value, decimals = 2) {
    return Number(Number(value).toFixed(decimals));
}

function numberOrNull(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}

function signature(ids) {
    return [...ids]
        .filter(Boolean)
        .sort()
        .join("|");
}

function buildNameHelpers(wrestlers, teams) {
    const wrestlerNames = new Map(
        wrestlers.map(wrestler => [
            wrestler.id,
            wrestler.name || wrestler.id
        ])
    );

    const teamNames = new Map();

    teams.forEach(team => {
        if (
            Array.isArray(team.members)
            && team.members.length === 2
        ) {
            teamNames.set(
                signature(team.members),
                team.name || team.id
            );
        }
    });

    function wrestlerName(id) {
        return wrestlerNames.get(id) || id || "Unknown";
    }

    function sideName(side) {
        const ids = Array.isArray(side?.wrestlers)
            ? side.wrestlers.filter(Boolean)
            : [];

        if (ids.length === 2) {
            const teamName = teamNames.get(signature(ids));

            if (teamName) {
                return teamName;
            }
        }

        return ids.length
            ? ids.map(wrestlerName).join(" & ")
            : "Unknown Side";
    }

    return {
        wrestlerName,
        sideName
    };
}

function formatMatchResult(match, helpers) {
    const sides = Array.isArray(match.sides)
        ? match.sides
        : [];

    const sideNames = sides.map(helpers.sideName);
    const resultType = normalize(match.resultType);

    if (resultType === "draw") {
        return `${sideNames.join(" vs. ")} ended in a draw.`;
    }

    if (
        resultType === "no-contest"
        || resultType === "no contest"
        || resultType === "nocontest"
    ) {
        return `${sideNames.join(" vs. ")} ended in a no contest.`;
    }

    const winnerSide = Number(match.winnerSide);

    if (
        Number.isInteger(winnerSide)
        && winnerSide >= 0
        && winnerSide < sideNames.length
    ) {
        const winner = sideNames[winnerSide];
        const losers = sideNames
            .filter((_, index) => index !== winnerSide)
            .join(" & ");
        const method = String(match.finish?.method || "").trim();

        return `${winner} defeated ${losers}${method ? ` by ${method}` : ""}.`;
    }

    if (match.finish?.winner) {
        const winner = helpers.wrestlerName(match.finish.winner);
        const loser = match.finish?.loser
            ? helpers.wrestlerName(match.finish.loser)
            : "the opposition";
        const method = String(match.finish?.method || "").trim();

        return `${winner} defeated ${loser}${method ? ` by ${method}` : ""}.`;
    }

    const matchLabel = sideNames.length
        ? sideNames.join(" vs. ")
        : (match.matchType || match.stipulation || "Match");

    return `Result recorded for ${matchLabel}.`;
}

function landscapeMatch(match, helpers) {
    return {
        id: match.id,
        matchType: match.matchType || "",
        resultText: formatMatchResult(match, helpers),
        rating: numberOrNull(match.starRating),
        storyContext: [
            match.stipulation || "",
            match.championshipId
                ? `Championship: ${match.championshipId}`
                : ""
        ]
            .filter(Boolean)
            .join(" • ")
    };
}

function landscapeSegment(segment) {
    return {
        id: segment.id || "",
        segmentType: segment.segmentType || segment.type || "story-segment",
        summary: segment.summary || segment.description || segment.title || "",
        rating: numberOrNull(
            segment.starRating
            ?? segment.rating
        )
    };
}

function averageRating(matches, segments) {
    const ratings = [
        ...matches.map(match => numberOrNull(match.rating)),
        ...segments.map(segment => numberOrNull(segment.rating))
    ]
        .filter(value => value !== null && value >= 0 && value <= 5);

    if (!ratings.length) {
        return null;
    }

    return round(
        ratings.reduce((sum, value) => sum + value, 0)
        / ratings.length,
        2
    );
}

function getWeeklyShowId(event) {
    if (normalize(event.eventType) !== "weekly") {
        return null;
    }

    return WEEKLY_SHOW_IDS[
        normalize(event.brand)
    ] || null;
}

function getLocation(showId, event, locationPools) {
    const rule = locationPools?.showRules?.[showId] || {};

    return {
        venue: rule.venue || event.location || "",
        city: rule.city || "",
        region: rule.region || "",
        country: rule.country || ""
    };
}

function sortEvents(events, shows) {
    const showOrder = new Map(
        shows.map(show => [
            show.id,
            {
                dayOrder: Number(show.dayOrder || 99),
                showOrder: Number(show.showOrder || 99)
            }
        ])
    );

    return [...events].sort((a, b) => {
        const periodCompare = String(a.periodId || "")
            .localeCompare(String(b.periodId || ""));

        if (periodCompare !== 0) {
            return periodCompare;
        }

        const stageCompare = String(a.stage || "")
            .localeCompare(String(b.stage || ""), undefined, {
                numeric: true
            });

        if (stageCompare !== 0) {
            return stageCompare;
        }

        const aOrder = showOrder.get(a.showId) || {
            dayOrder: 99,
            showOrder: 99
        };
        const bOrder = showOrder.get(b.showId) || {
            dayOrder: 99,
            showOrder: 99
        };

        return (
            aOrder.dayOrder - bOrder.dayOrder
            || aOrder.showOrder - bOrder.showOrder
            || String(a.id || "").localeCompare(String(b.id || ""))
        );
    });
}

const [
    owlEvents,
    owlMatches,
    owlSegments,
    wrestlers,
    teams,
    landscapeDatabase,
    showsDatabase,
    locationPools
] = await Promise.all([
    readJson(PATHS.events, []),
    readJson(PATHS.matches, []),
    readJson(PATHS.segments, []),
    readJson(PATHS.wrestlers, []),
    readJson(PATHS.teams, []),
    readJson(PATHS.landscapeEvents, { version: 1, events: [] }),
    readJson(PATHS.landscapeShows, { version: 1, shows: [] }),
    readJson(PATHS.locationPools, { version: 1, showRules: {} })
]);

const landscapeShows = Array.isArray(showsDatabase?.shows)
    ? showsDatabase.shows
    : [];

const validShowIds = new Set(
    landscapeShows.map(show => show.id)
);

const helpers = buildNameHelpers(
    Array.isArray(wrestlers) ? wrestlers : [],
    Array.isArray(teams) ? teams : []
);

const completedWeeklyEvents = (
    Array.isArray(owlEvents)
        ? owlEvents
        : []
)
    .filter(event => normalize(event.status) === "completed")
    .map(event => ({
        event,
        showId: getWeeklyShowId(event)
    }))
    .filter(item => item.showId && validShowIds.has(item.showId));

const autoEvents = completedWeeklyEvents.map(({ event, showId }) => {
    const completedMatches = (
        Array.isArray(owlMatches)
            ? owlMatches
            : []
    )
        .filter(match => (
            match.eventId === event.id
            && normalize(match.status) === "completed"
        ))
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
        .map(match => landscapeMatch(match, helpers));

    const completedSegments = (
        Array.isArray(owlSegments)
            ? owlSegments
            : []
    )
        .filter(segment => segment.eventId === event.id)
        .map(landscapeSegment);

    if (!completedMatches.length) {
        throw new Error(
            `Completed OWL event ${event.id} has no completed matches to sync.`
        );
    }

    const overallRating = averageRating(
        completedMatches,
        completedSegments
    );

    if (overallRating === null) {
        throw new Error(
            `Completed OWL event ${event.id} has no valid 0-5 ratings to sync.`
        );
    }

    return {
        id: event.id,
        periodId: event.periodId || "",
        stage: event.stage || "",
        eventType: "weekly",
        companyId: "owl",
        showId,
        eventName: event.name || event.id,
        bookingStyle: "OWL Canon",
        overallRating,
        location: getLocation(showId, event, locationPools),
        matches: completedMatches,
        segments: completedSegments,
        universeNotes: "",
        source: "owl-auto-sync",
        sourceEventId: event.id
    };
});

const existingLandscapeEvents = Array.isArray(landscapeDatabase?.events)
    ? landscapeDatabase.events
    : [];

const autoIds = new Set(autoEvents.map(event => event.id));

const preservedEvents = existingLandscapeEvents.filter(event => (
    event?.source !== "owl-auto-sync"
    && !(
        event?.companyId === "owl"
        && autoIds.has(event.id)
    )
));

const nextDatabase = {
    ...landscapeDatabase,
    version: landscapeDatabase?.version || 1,
    events: sortEvents(
        [
            ...preservedEvents,
            ...autoEvents
        ],
        landscapeShows
    )
};

await writeJson(
    PATHS.landscapeEvents,
    nextDatabase
);

console.log(
    `OWL Landscape sync complete: ${autoEvents.length} completed weekly OWL event(s) synced; ${preservedEvents.length} existing non-auto event(s) preserved.`
);
