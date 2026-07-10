// =================================
// THE LANDSCAPE
// HONORS & AWARDS ENGINE
// =================================


(() => {


    "use strict";



    const AWARD_VERSION =
        1;



    // =================================
    // HELPERS
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



    function average(
        values
    ) {


        const usable =

            values

                .map(
                    numberOrNull
                )

                .filter(

                    value =>

                        value !== null

                );


        if (
            usable.length === 0
        ) {


            return null;

        }


        return (

            usable.reduce(

                (
                    total,
                    value
                ) =>

                    total + value,

                0

            )

            /

            usable.length

        );

    }



    function eventsForPeriod(
        events,
        periodId
    ) {


        return events.filter(

            event =>

                event.periodId ===
                periodId

        );

    }



    function eventsForYear(
        events,
        year
    ) {


        const prefix =
            `${year}-`;


        return events.filter(

            event =>

                String(
                    event.periodId || ""
                )

                    .startsWith(
                        prefix
                    )

        );

    }



    function companyNameFromRanking(
        item
    ) {


        return (

            item?.companyName

            ||

            item?.companyId

            ||

            ""

        );

    }



    function showNameFromRanking(
        item
    ) {


        return (

            item?.showName

            ||

            item?.showId

            ||

            ""

        );

    }



    // =================================
    // COMPANY AWARD
    // =================================


    function topCompany(
        rankings
    ) {


        const winner =

            rankings

                ?.companyRankings

                ?.find(

                    item =>

                        item.landscapeScore
                        !==
                        null

                );


        if (
            !winner
        ) {


            return null;

        }


        return {


            companyId:
                winner.companyId,


            name:

                companyNameFromRanking(
                    winner
                ),


            score:
                winner.landscapeScore

        };

    }



    // =================================
    // SHOW AWARD
    // =================================


    function topShow(
        rankings
    ) {


        const winner =

            rankings

                ?.showRankings

                ?.find(

                    item =>

                        item.landscapeScore
                        !==
                        null

                );


        if (
            !winner
        ) {


            return null;

        }


        return {


            showId:
                winner.showId,


            companyId:
                winner.companyId,


            name:

                showNameFromRanking(
                    winner
                ),


            score:
                winner.landscapeScore

        };

    }



    // =================================
    // MAJOR EVENT AWARD
    // =================================


    function highestRatedMajorEvent(
        events
    ) {


        const majorEvents =

            events

                .filter(

                    event =>

                        event.eventType ===
                        "major-event"

                        &&

                        numberOrNull(
                            event.overallRating
                        )
                        !==
                        null

                )

                .map(

                    event => {


                        const matchAverage =

                            average(

                                (
                                    event.matches

                                    ||

                                    []
                                )

                                    .map(

                                        match =>

                                            match.rating

                                    )

                            );


                        return {


                            event,


                            rating:

                                Number(
                                    event.overallRating
                                ),


                            matchAverage:

                                matchAverage

                                ??

                                -1

                        };

                    }

                );


        majorEvents.sort(

            (
                a,
                b
            ) => {


                if (
                    b.rating
                    !==
                    a.rating
                ) {


                    return (

                        b.rating

                        -

                        a.rating

                    );

                }


                if (
                    b.matchAverage
                    !==
                    a.matchAverage
                ) {


                    return (

                        b.matchAverage

                        -

                        a.matchAverage

                    );

                }


                return String(
                    a.event.id || ""
                )

                    .localeCompare(

                        String(
                            b.event.id || ""
                        )

                    );

            }

        );


        const winner =
            majorEvents[0];


        if (
            !winner
        ) {


            return null;

        }


        return {


            eventId:
                winner.event.id,


            companyId:
                winner.event.companyId,


            name:

                winner.event.eventName

                ||

                "Major Event",


            rating:
                winner.rating,


            matchAverage:

                winner.matchAverage >= 0

                    ? winner.matchAverage

                    : null

        };

    }



    // =================================
    // MATCH AWARD
    // =================================


    function highestRatedMatch(
        events
    ) {


        const matches =
            [];


        events.forEach(

            event => {


                (
                    event.matches

                    ||

                    []
                )

                    .forEach(

                        (
                            match,
                            index
                        ) => {


                            const rating =

                                numberOrNull(
                                    match.rating
                                );


                            if (
                                rating ===
                                null
                            ) {


                                return;

                            }


                            matches.push({


                                matchId:

                                    match.id

                                    ||

                                    `match-${index + 1}`,


                                eventId:
                                    event.id,


                                companyId:
                                    event.companyId,


                                eventName:

                                    event.eventName

                                    ||

                                    event.showId

                                    ||

                                    "Event",


                                text:

                                    match.resultText

                                    ||

                                    "Untitled Match",


                                rating:
                                    rating,


                                eventRating:

                                    numberOrNull(
                                        event.overallRating
                                    )

                                    ??

                                    -1

                            });

                        }

                    );

            }

        );


        matches.sort(

            (
                a,
                b
            ) => {


                if (
                    b.rating
                    !==
                    a.rating
                ) {


                    return (

                        b.rating

                        -

                        a.rating

                    );

                }


                if (
                    b.eventRating
                    !==
                    a.eventRating
                ) {


                    return (

                        b.eventRating

                        -

                        a.eventRating

                    );

                }


                return String(
                    a.eventId
                )

                    .localeCompare(

                        String(
                            b.eventId
                        )

                    );

            }

        );


        const winner =
            matches[0];


        if (
            !winner
        ) {


            return null;

        }


        return {


            matchId:
                winner.matchId,


            eventId:
                winner.eventId,


            companyId:
                winner.companyId,


            eventName:
                winner.eventName,


            name:
                winner.text,


            rating:
                winner.rating

        };

    }



    // =================================
    // CONSISTENCY AWARD
    // =================================


    function mostConsistentShow(
        rankings
    ) {


        const shows =

            (

                rankings
                    ?.showRankings

                ||

                []

            )

                .filter(

                    item =>

                        numberOrNull(

                            item.components
                                ?.consistency

                        )
                        !==
                        null

                )

                .sort(

                    (
                        a,
                        b
                    ) => {


                        const consistencyDifference =

                            Number(

                                b.components
                                    .consistency

                            )

                            -

                            Number(

                                a.components
                                    .consistency

                            );


                        if (
                            consistencyDifference
                            !==
                            0
                        ) {


                            return consistencyDifference;

                        }


                        return (

                            Number(
                                b.landscapeScore || 0
                            )

                            -

                            Number(
                                a.landscapeScore || 0
                            )

                        );

                    }

                );


        const winner =
            shows[0];


        if (
            !winner
        ) {


            return null;

        }


        return {


            showId:
                winner.showId,


            companyId:
                winner.companyId,


            name:

                showNameFromRanking(
                    winner
                ),


            consistencyScore:

                winner.components
                    .consistency,


            landscapeScore:
                winner.landscapeScore

        };

    }



    // =================================
    // BIGGEST CLIMBER
    // =================================


    function biggestClimber(
        currentRankings,
        previousRankings
    ) {


        if (
            !previousRankings
        ) {


            return null;

        }


        const previous =

            new Map(

                (

                    previousRankings
                        .companyRankings

                    ||

                    []

                )

                    .map(

                        item => [

                            item.companyId,
                            item.rank

                        ]

                    )

            );


        const movements =

            (

                currentRankings
                    ?.companyRankings

                ||

                []

            )

                .map(

                    item => {


                        const oldRank =

                            previous.get(
                                item.companyId
                            );


                        if (
                            !oldRank
                        ) {


                            return null;

                        }


                        return {


                            companyId:
                                item.companyId,


                            name:

                                companyNameFromRanking(
                                    item
                                ),


                            previousRank:
                                oldRank,


                            currentRank:
                                item.rank,


                            positionsGained:

                                oldRank

                                -

                                item.rank

                        };

                    }

                )

                .filter(

                    item =>

                        item

                        &&

                        item.positionsGained
                        >
                        0

                );


        movements.sort(

            (
                a,
                b
            ) => {


                if (
                    b.positionsGained
                    !==
                    a.positionsGained
                ) {


                    return (

                        b.positionsGained

                        -

                        a.positionsGained

                    );

                }


                return (

                    a.currentRank

                    -

                    b.currentRank

                );

            }

        );


        return movements[0]

            ||

            null;

    }



    // =================================
    // MONTHLY HONORS
    // =================================


    function calculateMonthlyHonors({

        periodId,
        events,
        monthlyRankings,
        previousMonthlyRankings

    }) {


        const periodEvents =

            eventsForPeriod(

                events,
                periodId

            );


        return {


            periodId:
                periodId,


            awardVersion:
                AWARD_VERSION,


            generatedAt:

                new Date()
                    .toISOString(),


            awards: {


                companyOfTheMonth:

                    topCompany(
                        monthlyRankings
                    ),


                showOfTheMonth:

                    topShow(
                        monthlyRankings
                    ),


                majorEventOfTheMonth:

                    highestRatedMajorEvent(
                        periodEvents
                    ),


                matchOfTheMonth:

                    highestRatedMatch(
                        periodEvents
                    ),


                mostConsistentShow:

                    mostConsistentShow(
                        monthlyRankings
                    ),


                biggestClimber:

                    biggestClimber(

                        monthlyRankings,
                        previousMonthlyRankings

                    )

            }

        };

    }



    // =================================
    // YEARLY HONORS
    // =================================


    function calculateYearlyHonors({

        year,
        events,
        finalYtdRankings,
        firstMonthlyRankings,
        finalMonthlyRankings

    }) {


        const yearEvents =

            eventsForYear(

                events,
                year

            );


        return {


            year:
                String(
                    year
                ),


            awardVersion:
                AWARD_VERSION,


            generatedAt:

                new Date()
                    .toISOString(),


            awards: {


                companyOfTheYear:

                    topCompany(
                        finalYtdRankings
                    ),


                showOfTheYear:

                    topShow(
                        finalYtdRankings
                    ),


                majorEventOfTheYear:

                    highestRatedMajorEvent(
                        yearEvents
                    ),


                matchOfTheYear:

                    highestRatedMatch(
                        yearEvents
                    ),


                mostConsistentShow:

                    mostConsistentShow(
                        finalYtdRankings
                    ),


                biggestClimber:

                    biggestClimber(

                        finalMonthlyRankings,
                        firstMonthlyRankings

                    )

            }

        };

    }



    // =================================
    // PUBLIC API
    // =================================


    window.LandscapeAwardsEngine = {


        AWARD_VERSION,


        calculateMonthlyHonors,


        calculateYearlyHonors,


        highestRatedMajorEvent,


        highestRatedMatch,


        mostConsistentShow,


        biggestClimber

    };


})();
