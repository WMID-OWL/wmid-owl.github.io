// =================================
// OWL POWER RANKINGS
// =================================


const powerEls = {

    updatedEvent:
        document.getElementById(
            "power-updated-event"
        ),

    updatedDate:
        document.getElementById(
            "power-updated-date"
        ),

    scopeCopy:
        document.getElementById(
            "power-scope-copy"
        ),

    loading:
        document.getElementById(
            "power-loading"
        ),

    empty:
        document.getElementById(
            "power-empty-state"
        ),

    error:
        document.getElementById(
            "power-error-state"
        ),

    errorCopy:
        document.getElementById(
            "power-error-copy"
        ),

    content:
        document.getElementById(
            "power-content"
        ),

    topList:
        document.getElementById(
            "power-top-list"
        ),

    bottomList:
        document.getElementById(
            "power-bottom-list"
        )

};



// =================================
// STATE
// =================================


const powerState = {

    scope:
        "month",

    division:
        "men-singles",

    data:
        null,

    calculations:
        {}

};



// =================================
// POWER SCORE RULES
// =================================


const POWER_RULES = {


    result: {

        win:
            10,

        draw:
            2,

        loss:
            -4

    },


    finish: {

        Pinfall:
            1,

        Submission:
            1,

        KO:
            6,

        "Count Out":
            0,

        Disqualification:
            0,

        Other:
            1,

        "Ironman Score":
            0

    },


    ple: {

        win:
            4,

        loss:
            -1

    },


    title: {

        win:
            8,

        defense:
            4,

        currentChampion:
            5

    },


    specialty: {

        battleRoyalWinner:
            5,

        battleRoyalMostEliminations:
            3,


        overthrowWinner:
            10,

        overthrowRunnerUp:
            6,

        overthrowThird:
            4,

        overthrowFourth:
            3,

        overthrowMostEliminations:
            4,

        overthrowIron:
            3,


        hexWinner:
            6,

        hexElimination:
            1,

        hexEliminationCap:
            4,


        fateWinner:
            5,

        fateFinalFive:
            2,


        loveAndWarWin:
            6,

        loveAndWarLoss:
            -2

    }

};



// =================================
// BASIC HELPERS
// =================================


function pNormalize(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();

}



function pDate(
    dateString
) {

    return new Date(

        `${dateString}T00:00:00`

    );

}



function pFormatDate(
    dateString
) {

    return dateString

        ? pDate(
            dateString
        ).toLocaleDateString(

            "en-US",

            {

                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric"

            }

        )

        : "—";

}



function pSignature(
    ids
) {

    return [...ids]

        .sort()

        .join("|");

}



function pMap(
    records
) {

    return Object.fromEntries(

        records.map(

            record => [

                record.id,

                record

            ]

        )

    );

}



function pDaysBetween(
    start,
    end
) {

    if (
        !start ||
        !end
    ) {

        return null;

    }


    return Math.floor(

        (
            pDate(
                end
            )

            -

            pDate(
                start
            )
        )

        /

        86400000

    );

}



// =================================
// SCORING HELPERS
// =================================


function pFinishBonus(
    method
) {

    return (

        POWER_RULES
            .finish[
                method
            ]

        ??

        0

    );

}



function pQualityBonus(
    rating
) {

    const value =
        Number(
            rating
        );


    if (
        !Number.isFinite(
            value
        )
    ) {

        return 0;

    }


    if (
        value >= 95
    ) {

        return 3;

    }


    if (
        value >= 90
    ) {

        return 2;

    }


    if (
        value >= 80
    ) {

        return 1;

    }


    return 0;

}



function pStreakBonus(
    streak
) {

    if (
        streak >= 5
    ) {

        return 8;

    }


    if (
        streak === 4
    ) {

        return 6;

    }


    if (
        streak === 3
    ) {

        return 4;

    }


    if (
        streak === 2
    ) {

        return 2;

    }


    return 0;

}



function pInactivityPenalty(
    candidate,
    asOfDate,
    scope
) {

    if (
        scope !== "ytd"

        ||

        !candidate.lastMatchDate
    ) {

        return 0;

    }


    const days =
        pDaysBetween(

            candidate.lastMatchDate,

            asOfDate

        );


    if (
        days >= 90
    ) {

        return -8;

    }


    if (
        days >= 60
    ) {

        return -5;

    }


    if (
        days >= 30
    ) {

        return -2;

    }


    return 0;

}



function pIsPLE(
    event
) {

    const type =
        pNormalize(
            event?.eventType
        );


    return (

        type === "ppv"

        ||

        type === "ple"

    );

}



// =================================
// MATCH RESULT HELPERS
// =================================


function pResultType(
    match
) {

    const resultType =
        pNormalize(
            match.resultType
        );


    if (
        resultType === "draw"
    ) {

        return "draw";

    }


    if (
        resultType === "no-contest"

        ||

        resultType === "no contest"

        ||

        resultType === "nc"
    ) {

        return "no-contest";

    }


    if (
        match.winnerSide === null

        ||

        match.winnerSide === undefined
    ) {

        return match.finish?.winner

            ? "win"

            : "draw";

    }


    return "win";

}



function pGetEventForMatch(
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

            pNormalize(
                match.event
            )

            ===

            pNormalize(
                event.name
            )

    ) || null;

}



// =================================
// TEAM HELPERS
// =================================


function pTeamSignatureMap(
    teams
) {

    const map =
        new Map();


    teams.forEach(

        team => {

            if (
                Array.isArray(
                    team.members
                )

                &&

                team.members.length === 2
            ) {

                map.set(

                    pSignature(
                        team.members
                    ),

                    team

                );

            }

        }

    );


    return map;

}



function pOfficialTeam(
    memberIds,
    teamSignatureMap
) {

    if (
        !Array.isArray(
            memberIds
        )

        ||

        memberIds.length !== 2
    ) {

        return null;

    }


    return (

        teamSignatureMap.get(

            pSignature(
                memberIds
            )

        )

        ||

        null

    );

}



function pTeamsContainedInSide(
    side,
    teams
) {

    const sideMembers =
        new Set(

            side?.wrestlers || []

        );


    return teams.filter(

        team =>

            Array.isArray(
                team.members
            )

            &&

            team.members.length === 2

            &&

            team.members.every(

                id =>
                    sideMembers.has(
                        id
                    )

            )

    );

}



function pTeamDivision(
    team,
    wrestlerMap
) {

    if (
        team.division
    ) {

        return team.division;

    }


    const divisions =

        (
            team.members || []
        )

            .map(

                id =>

                    wrestlerMap[
                        id
                    ]?.division || ""

            )

            .filter(
                Boolean
            );


    return (

        divisions.length === 2

        &&

        divisions[0] ===
            divisions[1]
    )

        ? divisions[0]

        : "";

}



// =================================
// CANDIDATES
// =================================


function pCreateCandidate(
    entity,
    type
) {

    return {

        id:
            entity.id,

        name:
            entity.name || entity.id,

        brand:
            entity.brand || "OWL",

        type,

        score:
            0,

        wins:
            0,

        losses:
            0,

        draws:
            0,

        matches:
            0,

        streak:
            0,

        ratingTotal:
            0,

        ratingCount:
            0,

        lastWinDate:
            "",

        lastMatchDate:
            "",

        h2h:
            {}

    };

}



function pBuildCandidates(
    divisionKey,
    data
) {

    const wrestlerMap =
        pMap(
            data.wrestlers
        );


    if (
        divisionKey === "men-singles"

        ||

        divisionKey === "women-singles"
    ) {

        const target =

            divisionKey === "men-singles"

                ? "men"

                : "women";


        return data.wrestlers

            .filter(

                wrestler =>

                    pNormalize(
                        wrestler.division
                    )

                    ===

                    target

            )

            .map(

                wrestler =>

                    pCreateCandidate(

                        wrestler,

                        "wrestler"

                    )

            );

    }


    const target =

        divisionKey === "men-tags"

            ? "men"

            : "women";


    return data.teams

        .filter(

            team =>

                pNormalize(

                    pTeamDivision(

                        team,

                        wrestlerMap

                    )

                )

                ===

                target

        )

        .map(

            team =>

                pCreateCandidate(

                    team,

                    "team"

                )

        );

}



// =================================
// MATCH CLASSIFICATION
// =================================


function pMatchMode(
    match
) {

    if (

        match.stipulation ===
            "Love and War"

        ||

        match.matchType ===
            "Tag Team"

        ||

        match.structure?.mode ===
            "teamBattle"

    ) {

        return "team";

    }


    return "wrestler";

}



function pSinglesParticipants(
    match
) {

    if (

        match.stipulation ===
            "Overthrow Rumble"

        &&

        Array.isArray(
            match.specialtyResult?.entries
        )

    ) {

        return match
            .specialtyResult
            .entries

            .map(

                entry =>
                    entry.wrestlerId

            )

            .filter(
                Boolean
            );

    }


    return (

        match.sides || []

    )

        .flatMap(

            side =>
                side.wrestlers || []

        );

}



function pTeamIdsBySide(
    match,
    data,
    teamSignatureMap
) {

    return (

        match.sides || []

    )

        .map(

            side => {

                const exact =
                    pOfficialTeam(

                        side.wrestlers || [],

                        teamSignatureMap

                    );


                if (
                    exact
                ) {

                    return [
                        exact.id
                    ];

                }


                return pTeamsContainedInSide(

                    side,

                    data.teams

                )

                    .map(

                        team =>
                            team.id

                    );

            }

        );

}



function pWinnerSide(
    match
) {

    if (
        Number.isInteger(
            match.winnerSide
        )
    ) {

        return match.winnerSide;

    }


    if (
        !match.finish?.winner
    ) {

        return -1;

    }


    return (

        match.sides || []

    )

        .findIndex(

            side =>

                (
                    side.wrestlers || []
                )

                    .includes(
                        match.finish.winner
                    )

        );

}



function pSinglesWinners(
    match
) {

    if (
        pResultType(
            match
        )

        !==

        "win"
    ) {

        return [];

    }


    if (
        match.stipulation ===
            "Overthrow Rumble"
    ) {

        return [

            match.specialtyResult
                ?.winner

        ]

            .filter(
                Boolean
            );

    }


    const sideIndex =
        pWinnerSide(
            match
        );


    return sideIndex >= 0

        ? match.sides
            ?.[
                sideIndex
            ]
            ?.wrestlers || []

        : [];

}



function pTeamWinners(
    match,
    teamIdsBySide
) {

    if (
        pResultType(
            match
        )

        !==

        "win"
    ) {

        return [];

    }


    const sideIndex =
        pWinnerSide(
            match
        );


    return sideIndex >= 0

        ? teamIdsBySide[
            sideIndex
        ] || []

        : [];

}



// =================================
// CHAMPION STATUS
// =================================


function pChampionBonus(
    candidate,
    asOfDate,
    reigns
) {

    const asOf =
        pDate(
            asOfDate
        );


    const active =
        reigns.some(

            reign =>

                reign.holderType ===
                    candidate.type

                &&

                reign.holderId ===
                    candidate.id

                &&

                reign.wonDate

                &&

                pDate(
                    reign.wonDate
                )

                <=

                asOf

                &&

                (
                    !reign.lostDate

                    ||

                    pDate(
                        reign.lostDate
                    )

                    >

                    asOf
                )

        );


    return active

        ? POWER_RULES
            .title
            .currentChampion

        : 0;

}



// =================================
// RANKING HELPERS
// =================================


function pWinPct(
    candidate
) {

    const decisions =

        candidate.wins

        +

        candidate.losses;


    return decisions

        ? candidate.wins
            /
            decisions

        : 0;

}



function pAverageRating(
    candidate
) {

    return candidate.ratingCount

        ? candidate.ratingTotal
            /
            candidate.ratingCount

        : 0;

}



function pRankCandidates(
    candidates,
    asOfDate,
    scope,
    reigns
) {

    const ranked =
        candidates.map(

            candidate => {


                const championBonus =
                    pChampionBonus(

                        candidate,

                        asOfDate,

                        reigns

                    );


                const streakBonus =
                    pStreakBonus(
                        candidate.streak
                    );


                const inactivityPenalty =
                    pInactivityPenalty(

                        candidate,

                        asOfDate,

                        scope

                    );


                return {

                    ...candidate,

                    championBonus,

                    streakBonus,

                    inactivityPenalty,

                    powerScore:

                        candidate.score

                        +

                        championBonus

                        +

                        streakBonus

                        +

                        inactivityPenalty

                };

            }

        );


    ranked.sort(

        (
            a,
            b
        ) => {


            if (
                b.powerScore !==
                    a.powerScore
            ) {

                return (

                    b.powerScore

                    -

                    a.powerScore

                );

            }


            if (
                pWinPct(
                    b
                )

                !==

                pWinPct(
                    a
                )
            ) {

                return (

                    pWinPct(
                        b
                    )

                    -

                    pWinPct(
                        a
                    )

                );

            }


            if (
                b.wins !==
                    a.wins
            ) {

                return (

                    b.wins

                    -

                    a.wins

                );

            }


            const aVsB =
                a.h2h[
                    b.id
                ] || 0;


            const bVsA =
                b.h2h[
                    a.id
                ] || 0;


            if (
                aVsB !==
                    bVsA
            ) {

                return (

                    bVsA

                    -

                    aVsB

                );

            }


            const aWinDate =

                a.lastWinDate

                    ? pDate(
                        a.lastWinDate
                    ).getTime()

                    : 0;


            const bWinDate =

                b.lastWinDate

                    ? pDate(
                        b.lastWinDate
                    ).getTime()

                    : 0;


            if (
                aWinDate !==
                    bWinDate
            ) {

                return (

                    bWinDate

                    -

                    aWinDate

                );

            }


            if (
                pAverageRating(
                    b
                )

                !==

                pAverageRating(
                    a
                )
            ) {

                return (

                    pAverageRating(
                        b
                    )

                    -

                    pAverageRating(
                        a
                    )

                );

            }


            return a.name
                .localeCompare(
                    b.name
                );

        }

    );


    return ranked.map(

        (
            candidate,
            index
        ) => ({

            ...candidate,

            rank:
                index + 1

        })

    );

}



function pRankMap(
    ranking
) {

    return Object.fromEntries(

        ranking.map(

            candidate => [

                candidate.id,

                candidate.rank

            ]

        )

    );

}



// =================================
// OPPONENT STRENGTH
// =================================


function pOpponentStrengthBonus(
    rank,
    candidateCount
) {

    if (
        !rank
    ) {

        return 0;

    }


    if (
        rank === 1
    ) {

        return 8;

    }


    if (
        rank <= 5
    ) {

        return 6;

    }


    if (
        rank <= 10
    ) {

        return 4;

    }


    if (
        rank <=
            Math.ceil(
                candidateCount / 2
            )
    ) {

        return 2;

    }


    return 0;

}



function pAddH2H(
    candidate,
    opponentId
) {

    candidate.h2h[
        opponentId
    ] =

        (
            candidate.h2h[
                opponentId
            ] || 0
        )

        + 1;

}



// =================================
// TITLE MATCH BONUS
// =================================


function pTitleWinnerHolder(
    match,
    mode,
    winners,
    teamIdsBySide
) {

    if (
        mode === "wrestler"
    ) {

        const id =

            match.stipulation ===
                "Overthrow Rumble"

                ? match.specialtyResult
                    ?.winner

                : match.finish?.winner
                    || winners[0];


        return id

            ? {

                holderType:
                    "wrestler",

                holderId:
                    id

            }

            : null;

    }


    const sideIndex =
        pWinnerSide(
            match
        );


    const teamId =
        teamIdsBySide
            ?.[
                sideIndex
            ]
            ?.[0];


    return teamId

        ? {

            holderType:
                "team",

            holderId:
                teamId

        }

        : null;

}



function pApplyTitleBonus(
    match,
    event,
    candidateMap,
    mode,
    winners,
    teamIdsBySide,
    reigns
) {

    if (
        !match.championshipId

        ||

        pResultType(
            match
        )

        !==

        "win"
    ) {

        return;

    }


    const holder =
        pTitleWinnerHolder(

            match,

            mode,

            winners,

            teamIdsBySide

        );


    if (
        !holder

        ||

        !candidateMap[
            holder.holderId
        ]
    ) {

        return;

    }


    const wonReign =
        reigns.find(

            reign =>

                reign.championshipId ===
                    match.championshipId

                &&

                reign.holderType ===
                    holder.holderType

                &&

                reign.holderId ===
                    holder.holderId

                &&

                (
                    reign.wonEventId ===
                        event.id

                    ||

                    (
                        !reign.wonEventId

                        &&

                        reign.wonDate ===
                            event.date
                    )
                )

        );


    candidateMap[
        holder.holderId
    ].score +=

        wonReign

            ? POWER_RULES
                .title
                .win

            : POWER_RULES
                .title
                .defense;

}



// =================================
// BATTLE ROYAL BONUS
// =================================


function pApplyBattleRoyal(
    match,
    candidateMap
) {

    const winnerId =

        match.finish?.winner

        ||

        pSinglesWinners(
            match
        )[0];


    if (
        candidateMap[
            winnerId
        ]
    ) {

        candidateMap[
            winnerId
        ].score +=

            POWER_RULES
                .specialty
                .battleRoyalWinner;

    }


    const counts =
        {};


    (
        match.specialtyResult
            ?.participants || []
    )

        .forEach(

            participant => {

                if (
                    participant.eliminatedBy
                ) {

                    counts[
                        participant.eliminatedBy
                    ] =

                        (
                            counts[
                                participant.eliminatedBy
                            ] || 0
                        )

                        + 1;

                }

            }

        );


    const highest =
        Math.max(

            0,

            ...Object.values(
                counts
            )

        );


    Object.entries(
        counts
    )

        .forEach(

            (
                [
                    id,
                    count
                ]
            ) => {

                if (

                    highest > 0

                    &&

                    count === highest

                    &&

                    candidateMap[
                        id
                    ]

                ) {

                    candidateMap[
                        id
                    ].score +=

                        POWER_RULES
                            .specialty
                            .battleRoyalMostEliminations;

                }

            }

        );

}



// =================================
// OVERTHROW BONUS
// =================================


function pApplyOverthrow(
    match,
    candidateMap
) {

    const result =
        match.specialtyResult;


    if (
        !result
    ) {

        return;

    }


    const placementPoints = {

        1:
            POWER_RULES
                .specialty
                .overthrowWinner,

        2:
            POWER_RULES
                .specialty
                .overthrowRunnerUp,

        3:
            POWER_RULES
                .specialty
                .overthrowThird,

        4:
            POWER_RULES
                .specialty
                .overthrowFourth

    };


    (
        result.finalFour || []
    )

        .forEach(

            finalist => {

                if (
                    candidateMap[
                        finalist.wrestlerId
                    ]
                ) {

                    candidateMap[
                        finalist.wrestlerId
                    ].score +=

                        placementPoints[
                            finalist.place
                        ] || 0;

                }

            }

        );


    (
        result.stats
            ?.mostEliminations || []
    )

        .forEach(

            id => {

                if (
                    candidateMap[
                        id
                    ]
                ) {

                    candidateMap[
                        id
                    ].score +=

                        POWER_RULES
                            .specialty
                            .overthrowMostEliminations;

                }

            }

        );


    (
        result.stats
            ?.ironman || []
    )

        .forEach(

            id => {

                if (
                    candidateMap[
                        id
                    ]
                ) {

                    candidateMap[
                        id
                    ].score +=

                        POWER_RULES
                            .specialty
                            .overthrowIron;

                }

            }

        );


    (
        result.finalEliminations || []
    )

        .forEach(

            elimination => {

                const candidate =
                    candidateMap[
                        elimination.eliminatedBy
                    ];


                if (
                    candidate
                ) {

                    candidate.score +=

                        pFinishBonus(
                            elimination.method
                        );

                }

            }

        );

}



// =================================
// HEX-CELL BONUS
// =================================


function pApplyHex(
    match,
    candidateMap
) {

    const winnerId =

        match.finish?.winner

        ||

        pSinglesWinners(
            match
        )[0];


    if (
        candidateMap[
            winnerId
        ]
    ) {

        candidateMap[
            winnerId
        ].score +=

            POWER_RULES
                .specialty
                .hexWinner;

    }


    const counts =
        {};


    (
        match.specialtyResult
            ?.eliminations || []
    )

        .forEach(

            elimination => {

                const id =
                    elimination.eliminatedBy;


                if (
                    !candidateMap[
                        id
                    ]
                ) {

                    return;

                }


                counts[
                    id
                ] =

                    (
                        counts[
                            id
                        ] || 0
                    )

                    + 1;


                candidateMap[
                    id
                ].score +=

                    pFinishBonus(
                        elimination.method
                    );

            }

        );


    Object.entries(
        counts
    )

        .forEach(

            (
                [
                    id,
                    count
                ]
            ) => {

                candidateMap[
                    id
                ].score +=

                    Math.min(

                        count,

                        POWER_RULES
                            .specialty
                            .hexEliminationCap

                    )

                    *

                    POWER_RULES
                        .specialty
                        .hexElimination;

            }

        );

}



// =================================
// FATE'S WHEEL BONUS
// =================================


function pApplyFate(
    match,
    candidateMap
) {

    const winnerId =

        match.finish?.winner

        ||

        pSinglesWinners(
            match
        )[0];


    if (
        candidateMap[
            winnerId
        ]
    ) {

        candidateMap[
            winnerId
        ].score +=

            POWER_RULES
                .specialty
                .fateWinner;

    }


    (
        match.specialtyResult
            ?.finalists || []
    )

        .forEach(

            finalist => {

                if (
                    candidateMap[
                        finalist.wrestlerId
                    ]
                ) {

                    candidateMap[
                        finalist.wrestlerId
                    ].score +=

                        POWER_RULES
                            .specialty
                            .fateFinalFive;

                }

            }

        );

}



// =================================
// LOVE AND WAR BONUS
// =================================


function pApplyLoveAndWar(
    match,
    candidateMap,
    teamIdsBySide
) {

    const winnerSide =
        pWinnerSide(
            match
        );


    teamIdsBySide.forEach(

        (
            teamIds,
            sideIndex
        ) => {

            teamIds.forEach(

                teamId => {

                    if (
                        !candidateMap[
                            teamId
                        ]
                    ) {

                        return;

                    }


                    candidateMap[
                        teamId
                    ].score +=

                        sideIndex ===
                            winnerSide

                            ? POWER_RULES
                                .specialty
                                .loveAndWarWin

                            : POWER_RULES
                                .specialty
                                .loveAndWarLoss;

                }

            );

        }

    );

}



// =================================
// SPECIALTY ROUTER
// =================================


function pApplySpecialty(
    match,
    mode,
    candidateMap,
    teamIdsBySide
) {

    if (
        mode === "wrestler"
    ) {

        if (
            match.stipulation ===
                "Battle Royal"
        ) {

            pApplyBattleRoyal(

                match,

                candidateMap

            );

        }


        if (
            match.stipulation ===
                "Overthrow Rumble"
        ) {

            pApplyOverthrow(

                match,

                candidateMap

            );

        }


        if (
            match.stipulation ===
                "Hex-Cell Eliminator"
        ) {

            pApplyHex(

                match,

                candidateMap

            );

        }


        if (
            match.stipulation ===
                "Fate's Wheel"
        ) {

            pApplyFate(

                match,

                candidateMap

            );

        }

    }


    if (

        mode === "team"

        &&

        match.stipulation ===
            "Love and War"

    ) {

        pApplyLoveAndWar(

            match,

            candidateMap,

            teamIdsBySide

        );

    }

}



// =================================
// APPLY MATCH TO RANKINGS
// =================================


function pApplyMatch(
    match,
    event,
    candidates,
    priorRankMap,
    data,
    teamSignatureMap
) {

    const candidateMap =
        Object.fromEntries(

            candidates.map(

                candidate => [

                    candidate.id,

                    candidate

                ]

            )

        );


    const mode =
        pMatchMode(
            match
        );


    const teamIdsBySide =

        mode === "team"

            ? pTeamIdsBySide(

                match,

                data,

                teamSignatureMap

            )

            : [];


    const participantIds =

        mode === "team"

            ? [

                ...new Set(

                    teamIdsBySide.flat()

                )

            ]

            : [

                ...new Set(

                    pSinglesParticipants(
                        match
                    )

                )

            ];


    const winnerIds =

        mode === "team"

            ? pTeamWinners(

                match,

                teamIdsBySide

            )

            : pSinglesWinners(
                match
            );


    const eligible =
        participantIds.filter(

            id =>
                candidateMap[
                    id
                ]

        );


    if (
        !eligible.length
    ) {

        return;

    }


    const resultType =
        pResultType(
            match
        );


    const qualityBonus =
        pQualityBonus(
            match.rating
        );


    eligible.forEach(

        id => {

            const candidate =
                candidateMap[
                    id
                ];


            candidate.matches +=
                1;


            candidate.lastMatchDate =
                event.date;


            candidate.score +=
                qualityBonus;


            if (
                Number.isFinite(

                    Number(
                        match.rating
                    )

                )
            ) {

                candidate.ratingTotal +=

                    Number(
                        match.rating
                    );


                candidate.ratingCount +=
                    1;

            }


            if (
                resultType === "draw"
            ) {

                candidate.draws +=
                    1;


                candidate.streak =
                    0;


                candidate.score +=

                    POWER_RULES
                        .result
                        .draw;


                return;

            }


            if (
                resultType === "no-contest"

                ||

                resultType === "noContest"
            ) {

                candidate.streak =
                    0;


                return;

            }


            if (
                winnerIds.includes(
                    id
                )
            ) {

                candidate.wins +=
                    1;


                candidate.streak +=
                    1;


                candidate.lastWinDate =
                    event.date;


                candidate.score +=

                    POWER_RULES
                        .result
                        .win;


                if (
                    pIsPLE(
                        event
                    )
                ) {

                    candidate.score +=

                        POWER_RULES
                            .ple
                            .win;

                }


                const opponents =
                    eligible.filter(

                        opponentId =>

                            !winnerIds.includes(
                                opponentId
                            )

                    );


                const bestOpponentRank =
                    Math.min(

                        Infinity,

                        ...opponents.map(

                            opponentId =>

                                priorRankMap[
                                    opponentId
                                ]

                                ||

                                Infinity

                        )

                    );


                candidate.score +=

                    pOpponentStrengthBonus(

                        Number.isFinite(
                            bestOpponentRank
                        )

                            ? bestOpponentRank

                            : null,

                        candidates.length

                    );


                opponents.forEach(

                    opponentId =>

                        pAddH2H(

                            candidate,

                            opponentId

                        )

                );

            }


            else {

                candidate.losses +=
                    1;


                candidate.streak =
                    0;


                candidate.score +=

                    POWER_RULES
                        .result
                        .loss;


                if (
                    pIsPLE(
                        event
                    )
                ) {

                    candidate.score +=

                        POWER_RULES
                            .ple
                            .loss;

                }

            }

        }

    );



    // =================================
    // STANDARD FINISH BONUS
    // =================================


    if (
        resultType === "win"
    ) {

        if (
            mode === "wrestler"
        ) {

            const finishWinner =
                match.finish?.winner;


            const methodTrackedBySpecialty =

                match.stipulation ===
                    "Hex-Cell Eliminator";


            if (

                finishWinner

                &&

                candidateMap[
                    finishWinner
                ]

                &&

                !methodTrackedBySpecialty

            ) {

                candidateMap[
                    finishWinner
                ].score +=

                    pFinishBonus(
                        match.finish?.method
                    );

            }

        }


        else {

            winnerIds.forEach(

                teamId => {

                    if (
                        candidateMap[
                            teamId
                        ]
                    ) {

                        candidateMap[
                            teamId
                        ].score +=

                            pFinishBonus(
                                match.finish?.method
                            );

                    }

                }

            );

        }

    }



    // =================================
    // TITLE BONUS
    // =================================


    pApplyTitleBonus(

        match,

        event,

        candidateMap,

        mode,

        winnerIds,

        teamIdsBySide,

        data.reigns

    );



    // =================================
    // SPECIALTY BONUS
    // =================================


    pApplySpecialty(

        match,

        mode,

        candidateMap,

        teamIdsBySide

    );

}



// =================================
// COMPLETED EVENT GROUPS
// =================================


function pCompletedEventGroups(
    data
) {

    const eventMap =
        pMap(
            data.events
        );


    const groups =
        new Map();


    data.matches.forEach(

        match => {

            if (

                match.status

                &&

                pNormalize(
                    match.status
                )

                !==

                "completed"

            ) {

                return;

            }


            const event =
                pGetEventForMatch(

                    match,

                    eventMap,

                    data.events

                );


            if (
                !event?.date
            ) {

                return;

            }


            if (
                !groups.has(
                    event.id
                )
            ) {

                groups.set(

                    event.id,

                    {

                        event,

                        matches:
                            []

                    }

                );

            }


            groups.get(
                event.id
            )
                .matches
                .push(
                    match
                );

        }

    );


    return [

        ...groups.values()

    ]

        .sort(

            (
                a,
                b
            ) => {


                const dateDifference =

                    pDate(
                        a.event.date
                    )

                    -

                    pDate(
                        b.event.date
                    );


                return (

                    dateDifference

                    ||

                    a.event.name
                        .localeCompare(
                            b.event.name
                        )

                );

            }

        );

}



// =================================
// PRIOR ACTIVITY SEED
// =================================


function pSeedPriorActivity(
    candidates,
    priorGroups,
    desiredMode,
    data,
    teamSignatureMap
) {

    const candidateMap =
        Object.fromEntries(

            candidates.map(

                candidate => [

                    candidate.id,

                    candidate

                ]

            )

        );


    priorGroups.forEach(

        group => {

            group.matches.forEach(

                match => {

                    if (
                        pMatchMode(
                            match
                        )

                        !==

                        desiredMode
                    ) {

                        return;

                    }


                    const participantIds =

                        desiredMode === "team"

                            ? [

                                ...new Set(

                                    pTeamIdsBySide(

                                        match,

                                        data,

                                        teamSignatureMap

                                    ).flat()

                                )

                            ]

                            : [

                                ...new Set(

                                    pSinglesParticipants(
                                        match
                                    )

                                )

                            ];


                    participantIds.forEach(

                        id => {

                            if (
                                candidateMap[
                                    id
                                ]
                            ) {

                                candidateMap[
                                    id
                                ].lastMatchDate =

                                    group.event.date;

                            }

                        }

                    );

                }

            );

        }

    );

}



// =================================
// CALCULATE ONE SCOPE + DIVISION
// =================================


function pCalculateScope(
    scope,
    divisionKey,
    data
) {

    const allGroups =
        pCompletedEventGroups(
            data
        );


    if (
        !allGroups.length
    ) {

        return null;

    }


    const latestGroup =
        allGroups[
            allGroups.length - 1
        ];


    const latestDate =
        pDate(
            latestGroup.event.date
        );


    const startDate =

        scope === "month"

            ? new Date(

                latestDate.getFullYear(),

                latestDate.getMonth(),

                1

            )

            : new Date(

                latestDate.getFullYear(),

                0,

                1

            );


    const groups =
        allGroups.filter(

            group => {

                const date =
                    pDate(
                        group.event.date
                    );


                return (

                    date >=
                        startDate

                    &&

                    date <=
                        latestDate

                );

            }

        );


    const candidates =
        pBuildCandidates(

            divisionKey,

            data

        );


    const teamSignatureMap =
        pTeamSignatureMap(
            data.teams
        );


    const snapshots =
        [];


    const desiredMode =

        divisionKey.endsWith(
            "tags"
        )

            ? "team"

            : "wrestler";



    // =================================
    // YTD INACTIVITY HISTORY
    // =================================


    if (
        scope === "ytd"
    ) {

        const priorGroups =
            allGroups.filter(

                group =>

                    pDate(
                        group.event.date
                    )

                    <

                    startDate

            );


        pSeedPriorActivity(

            candidates,

            priorGroups,

            desiredMode,

            data,

            teamSignatureMap

        );

    }



    // =================================
    // PROCESS EVENTS
    // =================================


    groups.forEach(

        group => {

            const priorRanking =
                pRankCandidates(

                    candidates,

                    group.event.date,

                    scope,

                    data.reigns

                );


            const priorRankMap =
                pRankMap(
                    priorRanking
                );


            [
                ...group.matches
            ]

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

                )

                .forEach(

                    match => {

                        if (
                            pMatchMode(
                                match
                            )

                            !==

                            desiredMode
                        ) {

                            return;

                        }


                        pApplyMatch(

                            match,

                            group.event,

                            candidates,

                            priorRankMap,

                            data,

                            teamSignatureMap

                        );

                    }

                );


            snapshots.push({

                event:
                    group.event,

                ranking:
                    pRankCandidates(

                        candidates,

                        group.event.date,

                        scope,

                        data.reigns

                    )

            });

        }

    );


    const current =
        snapshots[
            snapshots.length - 1
        ];


    const previous =

        snapshots.length >= 2

            ? snapshots[
                snapshots.length - 2
            ]

            : null;


    return {

        latestEvent:
            current.event,

        ranking:
            current.ranking,

        previousRanking:
            previous?.ranking || []

    };

}



// =================================
// MOVEMENT
// =================================


function pMovement(
    candidate,
    previousRankMap
) {

    const previous =
        previousRankMap[
            candidate.id
        ];


    if (
        !previous
    ) {

        return {

            type:
                "new",

            label:
                "NEW"

        };

    }


    const difference =

        previous

        -

        candidate.rank;


    if (
        difference > 0
    ) {

        return {

            type:
                "up",

            label:
                `▲ ${difference}`

        };

    }


    if (
        difference < 0
    ) {

        return {

            type:
                "down",

            label:
                `▼ ${Math.abs(
                    difference
                )}`

        };

    }


    return {

        type:
            "same",

        label:
            "—"

    };

}



function pMovementClass(
    type
) {

    return {

        up:
            "movement-up",

        down:
            "movement-down",

        same:
            "movement-same",

        new:
            "movement-new"

    }[
        type
    ]

    ||

    "movement-same";

}



// =================================
// DISPLAY HELPERS
// =================================


function pCandidateUrl(
    candidate
) {

    const page =

        candidate.type === "team"

            ? "team.html"

            : "wrestler.html";


    return (

        `${page}?id=${encodeURIComponent(
            candidate.id
        )}`

    );

}



function pRecordText(
    candidate,
    scope
) {

    const drawPart =

        candidate.draws

            ? `-${candidate.draws}`

            : "";


    const period =

        scope === "month"

            ? "this month"

            : "YTD";


    const parts = [

        `${candidate.wins}-${candidate.losses}${drawPart} ${period}`

    ];


    if (
        candidate.streak >= 2
    ) {

        parts.push(

            `🔥 ${candidate.streak}-match win streak`

        );

    }


    if (
        candidate.championBonus > 0
    ) {

        parts.push(

            "🏆 Current champion"

        );

    }


    return parts.join(
        " • "
    );

}



// =================================
// CREATE RANKING ROW
// =================================


function pCreateRow(
    candidate,
    previousRankMap,
    scope
) {

    const movement =
        pMovement(

            candidate,

            previousRankMap

        );


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "power-ranking-row";


    row.innerHTML = `

        <div class="power-rank-number">

            #${candidate.rank}

        </div>


        <div
            class="
                power-rank-movement
                ${pMovementClass(
                    movement.type
                )}
            "
        >

            ${movement.label}

        </div>


        <div class="power-rank-identity">


            <a
                class="power-rank-name"
                href="${pCandidateUrl(
                    candidate
                )}"
            >

                ${candidate.name}

            </a>


            <div class="power-rank-meta">


                <span class="power-brand-badge">

                    ${candidate.brand || "OWL"}

                </span>


            </div>


            <p>

                ${pRecordText(
                    candidate,
                    scope
                )}

            </p>


        </div>


        <div class="power-score-box">


            <span>

                POWER SCORE

            </span>


            <strong>

                ${candidate.powerScore}

            </strong>


        </div>

    `;


    return row;

}



// =================================
// RENDER LIST
// =================================


function pRenderList(
    container,
    candidates,
    previousRankMap,
    scope
) {

    container.innerHTML =
        "";


    if (
        !candidates.length
    ) {

        container.innerHTML = `

            <p class="power-empty-message">

                No eligible competitors in this division.

            </p>

        `;


        return;

    }


    candidates.forEach(

        candidate => {

            container.appendChild(

                pCreateRow(

                    candidate,

                    previousRankMap,

                    scope

                )

            );

        }

    );

}



// =================================
// SCOPE COPY
// =================================


function pUpdateScopeCopy(
    calculation,
    scope
) {

    const latestDate =
        calculation.latestEvent.date;


    if (
        scope === "month"
    ) {

        const monthName =

            pDate(
                latestDate
            )

                .toLocaleDateString(

                    "en-US",

                    {

                        month:
                            "long",

                        year:
                            "numeric"

                    }

                );


        powerEls.scopeCopy.textContent =

            `${monthName} • Company-wide rankings through ${pFormatDate(
                latestDate
            )}`;


        return;

    }


    powerEls.scopeCopy.textContent =

        `${pDate(
            latestDate
        ).getFullYear()} YEAR-TO-DATE • Company-wide rankings through ${pFormatDate(
            latestDate
        )}`;

}



// =================================
// RENDER CURRENT VIEW
// =================================


function pRenderCurrentView() {

    const calculation =

        powerState.calculations[

            `${powerState.scope}:${powerState.division}`

        ];


    if (
        !calculation
    ) {

        powerEls.content.hidden =
            true;


        powerEls.empty.hidden =
            false;


        return;

    }


    powerEls.empty.hidden =
        true;


    powerEls.error.hidden =
        true;


    powerEls.content.hidden =
        false;


    powerEls.updatedEvent.textContent =
        calculation.latestEvent.name;


    powerEls.updatedDate.textContent =
        pFormatDate(
            calculation.latestEvent.date
        );


    pUpdateScopeCopy(

        calculation,

        powerState.scope

    );


    const previousRankMap =
        pRankMap(
            calculation.previousRanking
        );


    const ranking =
        calculation.ranking;


    const topTen =
        ranking.slice(
            0,
            10
        );


    const bottomTen =
        ranking.slice(

            Math.max(

                0,

                ranking.length - 10

            )

        );


    pRenderList(

        powerEls.topList,

        topTen,

        previousRankMap,

        powerState.scope

    );


    pRenderList(

        powerEls.bottomList,

        bottomTen,

        previousRankMap,

        powerState.scope

    );

}



// =================================
// ACTIVE FILTER BUTTONS
// =================================


function pSetActiveButtons(
    selector,
    dataKey,
    value
) {

    document

        .querySelectorAll(
            selector
        )

        .forEach(

            button => {

                button.classList.toggle(

                    "active",

                    button.dataset[
                        dataKey
                    ]

                    ===

                    value

                );

            }

        );

}



// =================================
// TIMEFRAME BUTTONS
// =================================


document

    .querySelectorAll(
        "[data-power-scope]"
    )

    .forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    powerState.scope =
                        button.dataset
                            .powerScope;


                    pSetActiveButtons(

                        "[data-power-scope]",

                        "powerScope",

                        powerState.scope

                    );


                    pRenderCurrentView();

                }

            );

        }

    );



// =================================
// DIVISION BUTTONS
// =================================


document

    .querySelectorAll(
        "[data-power-division]"
    )

    .forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    powerState.division =
                        button.dataset
                            .powerDivision;


                    pSetActiveButtons(

                        "[data-power-division]",

                        "powerDivision",

                        powerState.division

                    );


                    pRenderCurrentView();

                }

            );

        }

    );



// =================================
// LOAD JSON
// =================================


async function pFetchJson(
    path
) {

    const response =
        await fetch(

            path,

            {

                cache:
                    "no-store"

            }

        );


    if (
        !response.ok
    ) {

        throw new Error(

            `Could not load ${path}.`

        );

    }


    return response.json();

}



// =================================
// LOAD POWER RANKINGS
// =================================


async function pLoadRankings() {

    try {


        powerEls.loading.hidden =
            false;


        powerEls.empty.hidden =
            true;


        powerEls.error.hidden =
            true;


        powerEls.content.hidden =
            true;



        // =================================
        // DATABASES
        // =================================


        const [

            wrestlers,

            teams,

            events,

            matches,

            reigns

        ] = await Promise.all([

            pFetchJson(
                "data/wrestlers.json"
            ),

            pFetchJson(
                "data/teams.json"
            ),

            pFetchJson(
                "data/events.json"
            ),

            pFetchJson(
                "data/matches.json"
            ),

            pFetchJson(
                "data/title-reigns.json"
            )

        ]);


        powerState.data = {

            wrestlers,

            teams,

            events,

            matches,

            reigns

        };


        const completedGroups =
            pCompletedEventGroups(
                powerState.data
            );


        powerEls.loading.hidden =
            true;



        // =================================
        // NO RESULTS
        // =================================


        if (
            !completedGroups.length
        ) {

            powerEls.empty.hidden =
                false;


            powerEls.updatedEvent.textContent =
                "—";


            powerEls.updatedDate.textContent =
                "—";


            powerEls.scopeCopy.textContent =

                "Rankings begin after the first completed event.";


            return;

        }



        // =================================
        // CALCULATE ALL VIEWS
        // =================================


        const scopes = [

            "month",

            "ytd"

        ];


        const divisions = [

            "men-singles",

            "women-singles",

            "men-tags",

            "women-tags"

        ];


        scopes.forEach(

            scope => {

                divisions.forEach(

                    division => {

                        powerState.calculations[

                            `${scope}:${division}`

                        ] =

                            pCalculateScope(

                                scope,

                                division,

                                powerState.data

                            );

                    }

                );

            }

        );



        // =================================
        // INITIAL DISPLAY
        // =================================


        pRenderCurrentView();

    }


    catch (
        error
    ) {


        console.error(

            "Could not load Power Rankings:",

            error

        );


        powerEls.loading.hidden =
            true;


        powerEls.content.hidden =
            true;


        powerEls.empty.hidden =
            true;


        powerEls.error.hidden =
            false;


        powerEls.errorCopy.textContent =

            error.message

            ||

            "The rankings could not be calculated.";

    }

}



// =================================
// START
// =================================


pLoadRankings();
