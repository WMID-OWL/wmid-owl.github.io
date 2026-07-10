// =================================
// THE LANDSCAPE
// BRAGGING RIGHTS ENGINE
// =================================


(() => {


    "use strict";



    const BRAGGING_RIGHTS_VERSION =
        2;



    const ROUND_ORDER = [

        "roundOf16",
        "quarterfinals",
        "semifinals",
        "final"

    ];



    const ROUND_LABELS = {


        roundOf16:
            "Round of 16",


        quarterfinals:
            "Quarterfinals",


        semifinals:
            "Semifinals",


        final:
            "Final"

    };



    // =================================
    // BASIC HELPERS
    // =================================


    function clone(
        value
    ) {


        return JSON.parse(

            JSON.stringify(
                value
            )

        );

    }



    function padMonth(
        value
    ) {


        return String(
            value
        )
            .padStart(
                2,
                "0"
            );

    }



    function qualificationPeriodId(
        year,
        cutoffMonth = "10"
    ) {


        return `${year}-${padMonth(
            cutoffMonth
        )}`;

    }



    function eventPeriodId(
        year,
        eventMonth = "11"
    ) {


        return `${year}-${padMonth(
            eventMonth
        )}`;

    }



    function allocationForRank(
        rank
    ) {


        const number =
            Number(
                rank
            );


        if (
            number === 1
        ) {


            return 3;

        }


        if (
            number === 2
        ) {


            return 2;

        }


        if (
            number >= 3

            &&

            number <= 8
        ) {


            return 1;

        }


        return 0;

    }



    function nextRoundKey(
        roundKey
    ) {


        const index =

            ROUND_ORDER.indexOf(
                roundKey
            );


        if (
            index === -1

            ||

            index ===
            ROUND_ORDER.length - 1
        ) {


            return "";

        }


        return ROUND_ORDER[
            index + 1
        ];

    }



    function roundNumber(
        roundKey
    ) {


        return (

            ROUND_ORDER.indexOf(
                roundKey
            )

            +

            1

        );

    }



    function roundLabel(
        roundKey
    ) {


        return (

            ROUND_LABELS[
                roundKey
            ]

            ||

            roundKey

        );

    }



    // =================================
    // QUALIFICATION VALIDATION
    // =================================


    function validateQualificationRankings(
        rankingPeriod
    ) {


        if (
            !rankingPeriod
        ) {


            throw new Error(

                "No frozen qualification ranking period was found."

            );

        }


        const companyRankings =

            rankingPeriod
                ?.monthly
                ?.companyRankings;


        if (
            !Array.isArray(
                companyRankings
            )
        ) {


            throw new Error(

                "Qualification period does not contain monthly company rankings."

            );

        }


        const eligible =

            companyRankings.filter(

                item =>

                    Number(
                        item.rank
                    )
                    >=
                    1

                    &&

                    Number(
                        item.rank
                    )
                    <=
                    8

                    &&

                    item.companyId

            );


        if (
            eligible.length !== 8
        ) {


            throw new Error(

                "Bragging Rights qualification requires all 8 core companies to have official rankings."

            );

        }


        return eligible

            .sort(

                (
                    a,
                    b
                ) =>

                    Number(
                        a.rank
                    )

                    -

                    Number(
                        b.rank
                    )

            );

    }



    // =================================
    // CORE QUALIFICATION SLOTS
    // =================================


    function buildCoreSlots(
        companyRankings,
        division
    ) {


        const slots =
            [];


        companyRankings.forEach(

            company => {


                const allocation =

                    allocationForRank(
                        company.rank
                    );


                for (
                    let slotNumber = 1;

                    slotNumber <= allocation;

                    slotNumber += 1
                ) {


                    slots.push({


                        slotId:

                            `${division.toLowerCase()}-core-${slots.length + 1}`,


                        source:
                            "core",


                        division:
                            division,


                        companyId:
                            company.companyId,


                        companyName:

                            company.companyName

                            ||

                            company.companyId,


                        qualificationRank:
                            Number(
                                company.rank
                            ),


                        allocationSlot:
                            slotNumber,


                        wrestlerName:
                            "",


                        affiliationFrozen:
                            false

                    });

                }

            }

        );


        if (
            slots.length !== 11
        ) {


            throw new Error(

                `Expected 11 ${division} core qualification slots but created ${slots.length}.`

            );

        }


        return slots;

    }



    // =================================
    // GUEST SLOTS
    // =================================


    function buildGuestSlots(
        division
    ) {


        return Array.from(

            {
                length:
                    5
            },

            (
                _,
                index
            ) => ({


                slotId:

                    `${division.toLowerCase()}-guest-${index + 1}`,


                source:
                    "guest",


                division:
                    division,


                guestCompanyId:
                    "",


                guestCompanyName:
                    "",


                wrestlerName:
                    "",


                affiliationFrozen:
                    false

            })

        );

    }    // =================================
    // QUALIFICATION SNAPSHOT
    // =================================


    function createQualificationSnapshot({

        year,
        rankingsData,
        cutoffMonth = "10"

    }) {


        const periodId =

            qualificationPeriodId(

                year,
                cutoffMonth

            );


        const rankingPeriod =

            rankingsData
                ?.periods
                ?.find(

                    period =>

                        period.periodId ===
                        periodId

                );


        const companyRankings =

            validateQualificationRankings(
                rankingPeriod
            );


        return {


            qualificationPeriodId:
                periodId,


            frozenAt:

                rankingPeriod.frozenAt

                ||

                null,


            companyOrder:

                companyRankings.map(

                    company => ({


                        rank:
                            Number(
                                company.rank
                            ),


                        companyId:
                            company.companyId,


                        companyName:

                            company.companyName

                            ||

                            company.companyId,


                        landscapeScore:
                            company.landscapeScore,


                        allocation:

                            allocationForRank(
                                company.rank
                            )

                    })

                )

        };

    }



    // =================================
    // CREATE EDITION
    // =================================


    function createEdition({

        year,
        rankingsData,
        eventMonth = "11",
        cutoffMonth = "10"

    }) {


        const snapshot =

            createQualificationSnapshot({

                year,
                rankingsData,
                cutoffMonth

            });


        return {


            year:
                String(
                    year
                ),


            eventPeriodId:

                eventPeriodId(

                    year,
                    eventMonth

                ),


            qualificationPeriodId:

                snapshot
                    .qualificationPeriodId,


            status:
                "qualification-locked",


            qualificationSnapshot:
                snapshot,


            men: {


                coreSlots:

                    buildCoreSlots(

                        snapshot.companyOrder,
                        "Men"

                    ),


                guestSlots:

                    buildGuestSlots(
                        "Men"
                    ),


                entrants:
                    [],


                bracket:
                    null,


                champion:
                    null,


                finalist:
                    null

            },


            women: {


                coreSlots:

                    buildCoreSlots(

                        snapshot.companyOrder,
                        "Women"

                    ),


                guestSlots:

                    buildGuestSlots(
                        "Women"
                    ),


                entrants:
                    [],


                bracket:
                    null,


                champion:
                    null,


                finalist:
                    null

            },


            trophies: {


                menCompanyId:
                    "",


                womenCompanyId:
                    ""

            },


            createdAt:

                new Date()
                    .toISOString(),


            completedAt:
                null

        };

    }



    // =================================
    // FIELD COMPLETION
    // =================================


    function slotsComplete(
        divisionData
    ) {


        const coreComplete =

            (

                divisionData
                    ?.coreSlots

                ||

                []

            )

                .every(

                    slot =>

                        Boolean(
                            String(
                                slot.wrestlerName || ""
                            )
                                .trim()
                        )

                );


        const guestsComplete =

            (

                divisionData
                    ?.guestSlots

                ||

                []

            )

                .every(

                    slot =>

                        Boolean(
                            String(
                                slot.guestCompanyName || ""
                            )
                                .trim()
                        )

                        &&

                        Boolean(
                            String(
                                slot.wrestlerName || ""
                            )
                                .trim()
                        )

                );


        return (

            coreComplete

            &&

            guestsComplete

        );

    }



    // =================================
    // ENTRANTS
    // =================================


    function buildEntrants(
        divisionData
    ) {


        if (
            !slotsComplete(
                divisionData
            )
        ) {


            throw new Error(

                "All 11 core representatives and 5 guest representatives must be entered first."

            );

        }


        const coreEntrants =

            divisionData
                .coreSlots

                .map(

                    slot => ({


                        entrantId:
                            slot.slotId,


                        source:
                            "core",


                        division:
                            slot.division,


                        wrestlerName:
                            slot.wrestlerName,


                        companyId:
                            slot.companyId,


                        companyName:
                            slot.companyName,


                        qualificationRank:
                            slot.qualificationRank,


                        affiliationFrozen:
                            true

                    })

                );


        const guestEntrants =

            divisionData
                .guestSlots

                .map(

                    slot => ({


                        entrantId:
                            slot.slotId,


                        source:
                            "guest",


                        division:
                            slot.division,


                        wrestlerName:
                            slot.wrestlerName,


                        companyId:

                            slot.guestCompanyId

                            ||

                            `guest-${slot.slotId}`,


                        companyName:
                            slot.guestCompanyName,


                        qualificationRank:
                            null,


                        affiliationFrozen:
                            true

                    })

                );


        return [

            ...coreEntrants,
            ...guestEntrants

        ];

    }



    // =================================
    // RANDOM HELPERS
    // =================================


    function shuffle(
        values
    ) {


        const output =
            clone(
                values
            );


        for (

            let index =
                output.length - 1;

            index > 0;

            index -= 1

        ) {


            const randomIndex =

                Math.floor(

                    Math.random()

                    *

                    (
                        index + 1
                    )

                );


            [

                output[index],
                output[randomIndex]

            ] = [

                output[randomIndex],
                output[index]

            ];

        }


        return output;

    }



    function sameCompany(
        entrantA,
        entrantB
    ) {


        return Boolean(

            entrantA?.companyId

            &&

            entrantB?.companyId

            &&

            entrantA.companyId ===
            entrantB.companyId

        );

    }    // =================================
    // ROUND ONE DRAW
    // =================================


    function createRoundOneMatches(
        entrants
    ) {


        if (
            entrants.length !== 16
        ) {


            throw new Error(

                "A Bragging Rights bracket requires exactly 16 entrants."

            );

        }



        function findValidPairs(
            remaining
        ) {


            if (
                remaining.length === 0
            ) {


                return [];

            }


            const entrantA =
                remaining[0];


            const opponentCandidates =

                shuffle(

                    remaining
                        .slice(
                            1
                        )

                )

                    .filter(

                        entrantB =>

                            !sameCompany(

                                entrantA,
                                entrantB

                            )

                    );


            for (
                const entrantB
                of opponentCandidates
            ) {


                const nextRemaining =

                    remaining.filter(

                        entrant =>

                            entrant.entrantId !==
                            entrantA.entrantId

                            &&

                            entrant.entrantId !==
                            entrantB.entrantId

                    );


                const laterPairs =

                    findValidPairs(
                        nextRemaining
                    );


                if (
                    laterPairs
                ) {


                    return [


                        [
                            entrantA,
                            entrantB
                        ],


                        ...laterPairs


                    ];

                }

            }


            return null;

        }



        const validPairs =

            findValidPairs(

                shuffle(
                    entrants
                )

            );


        if (
            !validPairs
        ) {


            throw new Error(

                "A clean Round 1 draw could not be created without same-company matches."

            );

        }


        return validPairs.map(

            (
                pair,
                index
            ) => ({


                matchId:

                    `round-1-match-${index + 1}`,


                round:
                    1,


                entrantA:
                    pair[0],


                entrantB:
                    pair[1],


                winnerEntrantId:
                    "",


                rating:
                    null,


                resultText:
                    ""

            })

        );

    }



    // =================================
    // CREATE BRACKET
    // =================================


    function createBracket(
        divisionData
    ) {


        const entrants =

            buildEntrants(
                divisionData
            );


        return {


            entrants:
                entrants,


            rounds: {


                roundOf16:

                    createRoundOneMatches(
                        entrants
                    ),


                quarterfinals:
                    [],


                semifinals:
                    [],


                final:
                    []

            },


            winner:
                null,


            finalist:
                null,


            completedAt:
                null

        };

    }



    // =================================
    // RESULT HELPERS
    // =================================


    function winnerFromMatch(
        match
    ) {


        if (
            !match?.winnerEntrantId
        ) {


            return null;

        }


        if (
            match.entrantA
                ?.entrantId
            ===
            match.winnerEntrantId
        ) {


            return match.entrantA;

        }


        if (
            match.entrantB
                ?.entrantId
            ===
            match.winnerEntrantId
        ) {


            return match.entrantB;

        }


        return null;

    }



    function loserFromMatch(
        match
    ) {


        const winner =

            winnerFromMatch(
                match
            );


        if (
            !winner
        ) {


            return null;

        }


        return (

            match.entrantA
                .entrantId
            ===
            winner.entrantId

        )

            ? match.entrantB

            : match.entrantA;

    }



    function roundComplete(
        bracket,
        roundKey
    ) {


        const matches =

            bracket
                ?.rounds
                ?.[roundKey]

            ||

            [];


        return (

            matches.length > 0

            &&

            matches.every(

                match =>

                    Boolean(
                        winnerFromMatch(
                            match
                        )
                    )

            )

        );

    }



    function roundIsLocked(
        bracket,
        roundKey
    ) {


        const nextKey =

            nextRoundKey(
                roundKey
            );


        if (
            !nextKey
        ) {


            return Boolean(
                bracket?.winner
            );

        }


        return (

            bracket
                ?.rounds
                ?.[nextKey]
                ?.length

            >

            0

        );

    }



    function createNextRound(
        bracket,
        completedRoundKey
    ) {


        const nextKey =

            nextRoundKey(
                completedRoundKey
            );


        if (
            !nextKey
        ) {


            return;

        }


        if (
            bracket.rounds[
                nextKey
            ].length > 0
        ) {


            return;

        }


        const winners =

            bracket.rounds[
                completedRoundKey
            ]

                .map(
                    winnerFromMatch
                );


        if (
            winners.some(

                winner =>

                    !winner

            )
        ) {


            return;

        }


        const nextMatches =
            [];


        for (

            let index = 0;

            index < winners.length;

            index += 2

        ) {


            nextMatches.push({


                matchId:

                    `${nextKey}-match-${nextMatches.length + 1}`,


                round:

                    roundNumber(
                        nextKey
                    ),


                entrantA:

                    clone(
                        winners[index]
                    ),


                entrantB:

                    clone(
                        winners[
                            index + 1
                        ]
                    ),


                winnerEntrantId:
                    "",


                rating:
                    null,


                resultText:
                    ""

            });

        }


        bracket.rounds[
            nextKey
        ] = nextMatches;

    }    // =================================
    // RECORD MATCH RESULT
    // =================================


    function recordMatchResult({

        bracket,
        roundKey,
        matchId,
        winnerEntrantId,
        rating,
        resultText

    }) {


        if (
            !ROUND_ORDER.includes(
                roundKey
            )
        ) {


            throw new Error(

                "Unknown Bragging Rights tournament round."

            );

        }


        const matches =

            bracket
                ?.rounds
                ?.[roundKey];


        if (
            !Array.isArray(
                matches
            )
        ) {


            throw new Error(

                "Tournament round could not be found."

            );

        }


        const match =

            matches.find(

                item =>

                    item.matchId ===
                    matchId

            );


        if (
            !match
        ) {


            throw new Error(

                "Tournament match could not be found."

            );

        }


        if (
            roundIsLocked(
                bracket,
                roundKey
            )
        ) {


            throw new Error(

                `${roundLabel(
                    roundKey
                )} is locked because the tournament has already advanced.`

            );

        }


        const validWinner =

            [

                match.entrantA
                    ?.entrantId,

                match.entrantB
                    ?.entrantId

            ]

                .includes(
                    winnerEntrantId
                );


        if (
            !validWinner
        ) {


            throw new Error(

                "Select the winner of this match."

            );

        }


        const numericRating =

            Number(
                rating
            );


        if (

            !Number.isFinite(
                numericRating
            )

            ||

            numericRating < 0

            ||

            numericRating > 5

        ) {


            throw new Error(

                "Enter a match rating from 0 to 5."

            );

        }


        const cleanResultText =

            String(
                resultText || ""
            )
                .trim();


        if (
            !cleanResultText
        ) {


            throw new Error(

                "Enter the canonical match result text."

            );

        }


        match.winnerEntrantId =
            winnerEntrantId;


        match.rating =
            numericRating;


        match.resultText =
            cleanResultText;



        if (
            roundComplete(
                bracket,
                roundKey
            )
        ) {


            if (
                roundKey ===
                "final"
            ) {


                const finalMatch =
                    matches[0];


                bracket.winner =

                    clone(

                        winnerFromMatch(
                            finalMatch
                        )

                    );


                bracket.finalist =

                    clone(

                        loserFromMatch(
                            finalMatch
                        )

                    );


                bracket.completedAt =

                    new Date()
                        .toISOString();

            }


            else {


                createNextRound(

                    bracket,
                    roundKey

                );

            }

        }


        return bracket;

    }



    // =================================
    // BRACKET SUMMARY
    // =================================


    function bracketProgress(
        bracket
    ) {


        if (
            !bracket
        ) {


            return {


                status:
                    "not-drawn",


                completedMatches:
                    0,


                totalMatches:
                    15

            };

        }


        let completedMatches =
            0;


        ROUND_ORDER.forEach(

            roundKey => {


                completedMatches +=

                    (

                        bracket.rounds[
                            roundKey
                        ]

                        ||

                        []

                    )

                        .filter(

                            match =>

                                Boolean(
                                    winnerFromMatch(
                                        match
                                    )
                                )

                        )

                        .length;

            }

        );


        return {


            status:

                bracket.winner

                    ? "complete"

                    : completedMatches > 0

                        ? "in-progress"

                        : "drawn",


            completedMatches:
                completedMatches,


            totalMatches:
                15

        };

    }


    // =================================
    // TOURNAMENT MATCH COLLECTION
    // =================================


    function tournamentMatchesForDivision(
        division,
        bracket
    ) {


        const matches =
            [];


        if (
            !bracket
        ) {


            return matches;

        }


        ROUND_ORDER.forEach(

            roundKey => {


                const roundMatches =

                    bracket
                        ?.rounds
                        ?.[roundKey]

                    ||

                    [];


                roundMatches.forEach(

                    (
                        match,
                        index
                    ) => {


                        const winner =

                            winnerFromMatch(
                                match
                            );


                        const loser =

                            loserFromMatch(
                                match
                            );


                        matches.push({


                            division:
                                division,


                            roundKey:
                                roundKey,


                            roundLabel:

                                roundLabel(
                                    roundKey
                                ),


                            matchNumber:
                                index + 1,


                            matchId:
                                match.matchId,


                            entrantA:
                                match.entrantA,


                            entrantB:
                                match.entrantB,


                            winnerEntrantId:
                                match.winnerEntrantId,


                            winner:
                                winner,


                            loser:
                                loser,


                            rating:
                                match.rating,


                            resultText:
                                match.resultText

                        });

                    }

                );

            }

        );


        return matches;

    }



    function allTournamentMatches(
        edition
    ) {


        return [


            ...tournamentMatchesForDivision(

                "Men",

                edition
                    ?.men
                    ?.bracket

            ),


            ...tournamentMatchesForDivision(

                "Women",

                edition
                    ?.women
                    ?.bracket

            )


        ];

    }



    function averageMatchRating(
        matches
    ) {


        const ratings =

            matches

                .map(

                    match =>

                        Number(
                            match.rating
                        )

                )

                .filter(

                    rating =>

                        Number.isFinite(
                            rating
                        )

                );


        if (
            ratings.length === 0
        ) {


            return null;

        }


        return (

            ratings.reduce(

                (
                    total,
                    rating
                ) =>

                    total + rating,

                0

            )

            /

            ratings.length

        );

    }



    // =================================
    // LANDSCAPE SPECIAL EVENT RECORD
    // =================================


    function buildSpecialEventRecord(
        edition
    ) {


        if (

            !edition
                ?.men
                ?.bracket
                ?.winner

            ||

            !edition
                ?.women
                ?.bracket
                ?.winner
        ) {


            throw new Error(

                "Both Bragging Rights tournaments must be complete before the special event can be created."

            );

        }


        const matches =

            allTournamentMatches(
                edition
            );


        const completedMatches =

            matches.filter(

                match =>

                    match.winner

                    &&

                    Number.isFinite(
                        Number(
                            match.rating
                        )
                    )

                    &&

                    String(
                        match.resultText || ""
                    )
                        .trim()

            );


        if (
            completedMatches.length !== 30
        ) {


            throw new Error(

                `Bragging Rights requires 30 completed tournament matches. Found ${completedMatches.length}.`

            );

        }


        const overallRating =

            averageMatchRating(
                completedMatches
            );


        return {


            id:

                `bragging-rights-${edition.year}`,


            periodId:
                edition.eventPeriodId,


            stage:
                "special-event",


            eventType:
                "special-event",


            companyId:
                "",


            showId:
                "",


            eventName:
                "BRAGGING RIGHTS",


            overallRating:

                overallRating === null

                    ? null

                    : Number(
                        overallRating.toFixed(
                            2
                        )
                    ),


            ratingSource:
                "tournament-match-average",


            location:
                null,


            matches:

                completedMatches.map(

                    match => ({


                        id:

                            `bragging-rights-${edition.year}-${match.division.toLowerCase()}-${match.roundKey}-${match.matchId}`,


                        matchType:
                            "tournament-match",


                        division:
                            match.division,


                        tournamentRound:
                            match.roundLabel,


                        resultText:
                            match.resultText,


                        rating:

                            Number(
                                match.rating
                            )

                    })

                ),


            segments:
                [],


            universeNotes:

                `Men's Champion: ${edition.men.bracket.winner.wrestlerName} (${edition.men.bracket.winner.companyName}). Women's Champion: ${edition.women.bracket.winner.wrestlerName} (${edition.women.bracket.winner.companyName}).`,


            generatedFrom:
                "bragging-rights",


            generatedAt:

                new Date()
                    .toISOString()

        };

    }



    // =================================
    // HISTORY STAT HELPERS
    // =================================


    function getOrCreateWrestlerStat(
        map,
        entrant
    ) {


        const key =

            `${entrant.companyId}::${entrant.wrestlerName}`;


        if (
            !map.has(
                key
            )
        ) {


            map.set(

                key,

                {


                    wrestlerName:
                        entrant.wrestlerName,


                    companyId:
                        entrant.companyId,


                    companyName:
                        entrant.companyName,


                    source:
                        entrant.source,


                    appearances:
                        0,


                    tournamentWins:
                        0,


                    finalAppearances:
                        0,


                    semifinalAppearances:
                        0,


                    matchWins:
                        0,


                    matchLosses:
                        0,


                    currentWinStreak:
                        0,


                    longestWinStreak:
                        0

                }

            );

        }


        return map.get(
            key
        );

    }



    function getOrCreateCompanyStat(
        map,
        entrant
    ) {


        const key =
            entrant.companyId;


        if (
            !map.has(
                key
            )
        ) {


            map.set(

                key,

                {


                    companyId:
                        entrant.companyId,


                    companyName:
                        entrant.companyName,


                    entries:
                        0,


                    tournamentWins:
                        0,


                    finalAppearances:
                        0,


                    semifinalAppearances:
                        0,


                    matchWins:
                        0

                }

            );

        }


        return map.get(
            key
        );

    }



    // =================================
    // DIVISION HISTORY
    // =================================


    function buildDivisionHistory(
        editions,
        divisionKey
    ) {


        const wrestlerMap =
            new Map();


        const companyMap =
            new Map();


        const yearly =
            [];


        const bestRatedMatches =
            [];


        const guestPerformances =
            [];



        editions

            .filter(

                edition =>

                    edition
                        ?.[divisionKey]
                        ?.bracket

            )

            .sort(

                (
                    a,
                    b
                ) =>

                    String(
                        a.year
                    )

                        .localeCompare(

                            String(
                                b.year
                            )

                        )

            )

            .forEach(

                edition => {


                    const divisionData =

                        edition[
                            divisionKey
                        ];


                    const bracket =

                        divisionData
                            .bracket;


                    const divisionName =

                        divisionKey ===
                        "men"

                            ? "Men"

                            : "Women";


                    const entrants =

                        bracket.entrants

                        ||

                        divisionData.entrants

                        ||

                        [];


                    entrants.forEach(

                        entrant => {


                            const wrestlerStat =

                                getOrCreateWrestlerStat(

                                    wrestlerMap,
                                    entrant

                                );


                            wrestlerStat.appearances +=
                                1;


                            const companyStat =

                                getOrCreateCompanyStat(

                                    companyMap,
                                    entrant

                                );


                            companyStat.entries +=
                                1;

                        }

                    );



                    const semifinalEntrants =

                        (

                            bracket
                                ?.rounds
                                ?.semifinals

                            ||

                            []

                        )

                            .flatMap(

                                match => [

                                    match.entrantA,
                                    match.entrantB

                                ]

                            );


                    semifinalEntrants.forEach(

                        entrant => {


                            getOrCreateWrestlerStat(

                                wrestlerMap,
                                entrant

                            )
                                .semifinalAppearances +=
                                1;


                            getOrCreateCompanyStat(

                                companyMap,
                                entrant

                            )
                                .semifinalAppearances +=
                                1;

                        }

                    );



                    const finalMatch =

                        bracket
                            ?.rounds
                            ?.final
                            ?.[0]

                        ||

                        null;


                    if (
                        finalMatch
                    ) {


                        [

                            finalMatch.entrantA,
                            finalMatch.entrantB

                        ]

                            .forEach(

                                entrant => {


                                    getOrCreateWrestlerStat(

                                        wrestlerMap,
                                        entrant

                                    )
                                        .finalAppearances +=
                                        1;


                                    getOrCreateCompanyStat(

                                        companyMap,
                                        entrant

                                    )
                                        .finalAppearances +=
                                        1;

                                }

                            );

                    }



                    const matches =

                        tournamentMatchesForDivision(

                            divisionName,
                            bracket

                        );


                    matches.forEach(

                        match => {


                            if (
                                !match.winner

                                ||

                                !match.loser
                            ) {


                                return;

                            }


                            const winnerStat =

                                getOrCreateWrestlerStat(

                                    wrestlerMap,
                                    match.winner

                                );


                            const loserStat =

                                getOrCreateWrestlerStat(

                                    wrestlerMap,
                                    match.loser

                                );


                            winnerStat.matchWins +=
                                1;


                            winnerStat.currentWinStreak +=
                                1;


                            winnerStat.longestWinStreak =

                                Math.max(

                                    winnerStat.longestWinStreak,

                                    winnerStat.currentWinStreak

                                );


                            loserStat.matchLosses +=
                                1;


                            loserStat.currentWinStreak =
                                0;


                            getOrCreateCompanyStat(

                                companyMap,
                                match.winner

                            )
                                .matchWins +=
                                1;



                            const rating =

                                Number(
                                    match.rating
                                );


                            if (
                                Number.isFinite(
                                    rating
                                )
                            ) {


                                bestRatedMatches.push({


                                    year:
                                        String(
                                            edition.year
                                        ),


                                    division:
                                        divisionName,


                                    round:
                                        match.roundLabel,


                                    resultText:
                                        match.resultText,


                                    rating:
                                        rating

                                });

                            }

                        }

                    );



                    if (
                        bracket.winner
                    ) {


                        getOrCreateWrestlerStat(

                            wrestlerMap,
                            bracket.winner

                        )
                            .tournamentWins +=
                            1;


                        getOrCreateCompanyStat(

                            companyMap,
                            bracket.winner

                        )
                            .tournamentWins +=
                            1;

                    }



                    yearly.push({


                        year:
                            String(
                                edition.year
                            ),


                        winner:
                            bracket.winner,


                        finalist:
                            bracket.finalist,


                        bestRatedMatch:

                            matches

                                .filter(

                                    match =>

                                        Number.isFinite(

                                            Number(
                                                match.rating
                                            )

                                        )

                                )

                                .sort(

                                    (
                                        a,
                                        b
                                    ) =>

                                        Number(
                                            b.rating
                                        )

                                        -

                                        Number(
                                            a.rating
                                        )

                                )[0]

                            ||

                            null

                    });



                    entrants

                        .filter(

                            entrant =>

                                entrant.source ===
                                "guest"

                        )

                        .forEach(

                            entrant => {


                                let deepestRound =
                                    "Round of 16";


                                let depth =
                                    1;


                                if (

                                    (

                                        bracket
                                            ?.rounds
                                            ?.quarterfinals

                                        ||

                                        []

                                    )

                                        .some(

                                            match =>

                                                match.entrantA.entrantId ===
                                                entrant.entrantId

                                                ||

                                                match.entrantB.entrantId ===
                                                entrant.entrantId

                                        )
                                ) {


                                    deepestRound =
                                        "Quarterfinals";


                                    depth =
                                        2;

                                }


                                if (

                                    (

                                        bracket
                                            ?.rounds
                                            ?.semifinals

                                        ||

                                        []

                                    )

                                        .some(

                                            match =>

                                                match.entrantA.entrantId ===
                                                entrant.entrantId

                                                ||

                                                match.entrantB.entrantId ===
                                                entrant.entrantId

                                        )
                                ) {


                                    deepestRound =
                                        "Semifinals";


                                    depth =
                                        3;

                                }


                                if (

                                    finalMatch

                                    &&

                                    (

                                        finalMatch.entrantA.entrantId ===
                                        entrant.entrantId

                                        ||

                                        finalMatch.entrantB.entrantId ===
                                        entrant.entrantId

                                    )
                                ) {


                                    deepestRound =
                                        "Final";


                                    depth =
                                        4;

                                }


                                if (

                                    bracket.winner
                                        ?.entrantId

                                    ===

                                    entrant.entrantId
                                ) {


                                    deepestRound =
                                        "Champion";


                                    depth =
                                        5;

                                }


                                guestPerformances.push({


                                    year:
                                        String(
                                            edition.year
                                        ),


                                    wrestlerName:
                                        entrant.wrestlerName,


                                    companyId:
                                        entrant.companyId,


                                    companyName:
                                        entrant.companyName,


                                    deepestRound:
                                        deepestRound,


                                    depth:
                                        depth

                                });

                            }

                        );

                }

            );



        const wrestlerStats =

            [

                ...wrestlerMap.values()

            ]

                .sort(

                    (
                        a,
                        b
                    ) =>

                        b.tournamentWins
                        -
                        a.tournamentWins

                        ||

                        b.matchWins
                        -
                        a.matchWins

                        ||

                        b.longestWinStreak
                        -
                        a.longestWinStreak

                );


        const companyStats =

            [

                ...companyMap.values()

            ]

                .sort(

                    (
                        a,
                        b
                    ) =>

                        b.tournamentWins
                        -
                        a.tournamentWins

                        ||

                        b.matchWins
                        -
                        a.matchWins

                );


        bestRatedMatches.sort(

            (
                a,
                b
            ) =>

                b.rating
                -
                a.rating

        );


        guestPerformances.sort(

            (
                a,
                b
            ) =>

                b.depth
                -
                a.depth

        );


        return {


            yearly:
                yearly,


            wrestlerStats:
                wrestlerStats,


            companyStats:
                companyStats,


            bestRatedMatches:

                bestRatedMatches.slice(
                    0,
                    25
                ),


            notableGuestPerformances:

                guestPerformances.slice(
                    0,
                    25
                )

        };

    }



    // =================================
    // FULL HISTORY SUMMARY
    // =================================


    function buildHistory(
        editions
    ) {


        const completedEditions =

            (

                editions

                ||

                []

            )

                .filter(

                    edition =>

                        edition
                            ?.men
                            ?.bracket
                            ?.winner

                        &&

                        edition
                            ?.women
                            ?.bracket
                            ?.winner

                );


        return {


            updatedAt:

                new Date()
                    .toISOString(),


            editionsCompleted:
                completedEditions.length,


            men:

                buildDivisionHistory(

                    completedEditions,
                    "men"

                ),


            women:

                buildDivisionHistory(

                    completedEditions,
                    "women"

                )

        };

    }
    
    // =================================
    // PUBLIC API
    // =================================


    window.LandscapeBraggingRightsEngine = {


        BRAGGING_RIGHTS_VERSION,


        ROUND_ORDER,


        ROUND_LABELS,


        allocationForRank,


        qualificationPeriodId,


        eventPeriodId,


        createQualificationSnapshot,


        createEdition,


        slotsComplete,


        buildEntrants,


        createRoundOneMatches,


        createBracket,


        winnerFromMatch,


        loserFromMatch,


        roundComplete,


        roundIsLocked,


        recordMatchResult,


                bracketProgress,


        tournamentMatchesForDivision,


        allTournamentMatches,


        averageMatchRating,


        buildSpecialEventRecord,


        buildDivisionHistory,


        buildHistory

    };


})();
