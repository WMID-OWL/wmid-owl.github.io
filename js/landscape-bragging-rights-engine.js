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


        bracketProgress

    };


})();
