// =================================
// THE LANDSCAPE
// BRAGGING RIGHTS ENGINE
// =================================


(() => {


    "use strict";



    const BRAGGING_RIGHTS_VERSION =
        1;



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



    // =================================
    // ALLOCATION RULE
    // =================================


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



    // =================================
    // VALIDATE QUALIFICATION RANKINGS
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
    // BUILD CORE QUALIFICATION SLOTS
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
    // BUILD GUEST SLOTS
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

    }



    // =================================
    // CREATE QUALIFICATION SNAPSHOT
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
    // CREATE NEW EDITION
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
    // SLOT COMPLETION
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
    // BUILD ENTRANT LIST
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

    }



    // =================================
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


        const shuffled =

            shuffle(
                entrants
            );


        const matches =
            [];


        while (
            shuffled.length
        ) {


            const entrantA =

                shuffled.shift();


            let opponentIndex =

                shuffled.findIndex(

                    entrantB =>

                        !sameCompany(

                            entrantA,
                            entrantB

                        )

                );


            if (
                opponentIndex === -1
            ) {


                opponentIndex =
                    0;

            }


            const entrantB =

                shuffled.splice(

                    opponentIndex,
                    1

                )[0];


            matches.push({


                matchId:

                    `round-1-match-${matches.length + 1}`,


                round:
                    1,


                entrantA:
                    entrantA,


                entrantB:
                    entrantB,


                winnerEntrantId:
                    "",


                rating:
                    null,


                resultText:
                    ""

            });

        }


        return matches;

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
                null

        };

    }



    // =================================
    // PUBLIC API
    // =================================


    window.LandscapeBraggingRightsEngine = {


        BRAGGING_RIGHTS_VERSION,


        allocationForRank,


        qualificationPeriodId,


        eventPeriodId,


        createQualificationSnapshot,


        createEdition,


        slotsComplete,


        buildEntrants,


        createRoundOneMatches,


        createBracket

    };


})();
