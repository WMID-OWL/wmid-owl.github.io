// =================================
// THE LANDSCAPE
// SCORE ENGINE
// =================================


(function () {


    const SCORE_VERSION =
        1;



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



    function clamp(
        value,
        minimum = 0,
        maximum = 100
    ) {


        return Math.min(

            maximum,

            Math.max(
                minimum,
                value
            )

        );

    }



    function roundScore(
        value,
        decimals = 1
    ) {


        const factor =
            10 ** decimals;


        return Math.round(

            Number(
                value
            )
            *
            factor

        )
        /
        factor;

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



    // =================================
    // STAR RATING → SCORE
    // =================================


    function ratingToScore(
        rating
    ) {


        const value =

            numberOrNull(
                rating
            );


        if (
            value === null
        ) {


            return null;

        }


        return roundScore(

            clamp(
                value * 20
            )

        );

    }



    // =================================
    // STANDARD DEVIATION
    // =================================


    function standardDeviation(
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
            usable.length < 2
        ) {


            return null;

        }


        const mean =

            average(
                usable
            );


        const variance =

            usable.reduce(

                (
                    total,
                    value
                ) => {


                    return (

                        total

                        +

                        (
                            value - mean
                        )
                        **
                        2

                    );

                },

                0

            )

            /

            usable.length;


        return Math.sqrt(
            variance
        );

    }



    // =================================
    // CONSISTENCY SCORE
    // =================================


    function consistencyScore(
        ratings
    ) {


        const deviation =

            standardDeviation(
                ratings
            );


        if (
            deviation === null
        ) {


            return 50;

        }


        return roundScore(

            clamp(

                100

                -

                (
                    deviation * 30
                )

            )

        );

    }



    // =================================
    // MOMENTUM SCORE
    // =================================


    function momentumScore(
        ratings
    ) {


        const usable =

            ratings

                .map(
                    numberOrNull
                )

                .filter(

                    value =>

                        value !== null

                );


        if (
            usable.length < 4
        ) {


            return 50;

        }


        const recentTwo =

            usable.slice(
                -2
            );


        const previousTwo =

            usable.slice(
                -4,
                -2
            );


        const difference =

            average(
                recentTwo
            )

            -

            average(
                previousTwo
            );


        return roundScore(

            clamp(

                50

                +

                (
                    difference * 30
                )

            )

        );

    }



    // =================================
    // MATCH RATINGS
    // =================================


    function collectMatchRatings(
        events
    ) {


        const ratings =
            [];


        events.forEach(

            event => {


                const matches =

                    Array.isArray(
                        event.matches
                    )

                        ? event.matches

                        : [];


                matches.forEach(

                    match => {


                        const rating =

                            numberOrNull(
                                match.rating
                            );


                        if (
                            rating !== null
                        ) {


                            ratings.push(
                                rating
                            );

                        }

                    }

                );

            }

        );


        return ratings;

    }



    // =================================
    // EVENT ORDERING
    // =================================


    function stageOrder(
        stageId
    ) {


        const stageMap = {


            "week-1":
                1,


            "week-2":
                2,


            "week-3":
                3,


            "week-4":
                4,


            "showdown-saturday":
                5

        };


        return (

            stageMap[
                stageId
            ]

            ||

            99

        );

    }



    function eventOrder(
        event,
        shows
    ) {


        const show =

            shows.find(

                item =>

                    item.id ===
                    event.showId

            );


        return {


            periodId:

                String(
                    event.periodId || ""
                ),


            stageOrder:

                stageOrder(
                    event.stage
                ),


            dayOrder:

                Number(
                    show?.dayOrder || 99
                ),


            showOrder:

                Number(
                    show?.showOrder || 99
                ),


            id:

                String(
                    event.id || ""
                )

        };

    }



    function sortEvents(
        events,
        shows
    ) {


        return [

            ...events

        ]

            .sort(

                (
                    a,
                    b
                ) => {


                    const aOrder =

                        eventOrder(
                            a,
                            shows
                        );


                    const bOrder =

                        eventOrder(
                            b,
                            shows
                        );


                    const periodDifference =

                        aOrder
                            .periodId

                            .localeCompare(

                                bOrder
                                    .periodId

                            );


                    if (
                        periodDifference !== 0
                    ) {


                        return periodDifference;

                    }


                    if (

                        aOrder.stageOrder

                        !==

                        bOrder.stageOrder

                    ) {


                        return (

                            aOrder.stageOrder

                            -

                            bOrder.stageOrder

                        );

                    }


                    if (

                        aOrder.dayOrder

                        !==

                        bOrder.dayOrder

                    ) {


                        return (

                            aOrder.dayOrder

                            -

                            bOrder.dayOrder

                        );

                    }


                    if (

                        aOrder.showOrder

                        !==

                        bOrder.showOrder

                    ) {


                        return (

                            aOrder.showOrder

                            -

                            bOrder.showOrder

                        );

                    }


                    return (

                        aOrder.id
                            .localeCompare(
                                bOrder.id
                            )

                    );

                }

            );

    }



    // =================================
    // WEIGHTED SCORE
    // =================================


    function weightedScore(
        components
    ) {


        let totalWeight =
            0;


        let weightedTotal =
            0;


        components.forEach(

            component => {


                const score =

                    numberOrNull(
                        component.score
                    );


                const weight =

                    numberOrNull(
                        component.weight
                    );


                if (

                    score === null

                    ||

                    weight === null

                    ||

                    weight <= 0

                ) {


                    return;

                }


                weightedTotal +=

                    score
                    *
                    weight;


                totalWeight +=
                    weight;

            }

        );


        if (
            totalWeight === 0
        ) {


            return null;

        }


        return roundScore(

            weightedTotal
            /
            totalWeight

        );

    }



    // =================================
    // SHOW SCORE
    // =================================


    function calculateShowScore(
        show,
        events,
        shows
    ) {


        const showEvents =

            sortEvents(

                events.filter(

                    event =>

                        event.eventType ===
                        "weekly"

                        &&

                        event.showId ===
                        show.id

                ),

                shows

            );


        const overallRatings =

            showEvents

                .map(

                    event =>

                        numberOrNull(
                            event.overallRating
                        )

                )

                .filter(

                    value =>

                        value !== null

                );


        const matchRatings =

            collectMatchRatings(
                showEvents
            );


        const overallAverage =

            average(
                overallRatings
            );


        const matchAverage =

            average(
                matchRatings
            );


        const overallScore =

            overallAverage === null

                ? null

                : ratingToScore(
                    overallAverage
                );


        const matchScore =

            matchAverage === null

                ? null

                : ratingToScore(
                    matchAverage
                );


        const consistency =

            consistencyScore(
                overallRatings
            );


        const momentum =

            momentumScore(
                overallRatings
            );


        const landscapeScore =

            weightedScore([

                {
                    score:
                        overallScore,

                    weight:
                        50
                },

                {
                    score:
                        matchScore,

                    weight:
                        25
                },

                {
                    score:
                        consistency,

                    weight:
                        15
                },

                {
                    score:
                        momentum,

                    weight:
                        10
                }

            ]);


        return {


            showId:
                show.id,


            companyId:
                show.companyId,


            showName:
                show.name,


            eventsRecorded:
                showEvents.length,


            matchesRecorded:
                matchRatings.length,


            overallAverage:

                overallAverage === null

                    ? null

                    : roundScore(
                        overallAverage,
                        2
                    ),


            matchAverage:

                matchAverage === null

                    ? null

                    : roundScore(
                        matchAverage,
                        2
                    ),


            components: {


                overallShowRating:
                    overallScore,


                matchQuality:
                    matchScore,


                consistency:
                    consistency,


                momentum:
                    momentum

            },


            landscapeScore:
                landscapeScore

        };

    }



    // =================================
    // SHOW RANKINGS
    // =================================


    function calculateShowRankings(
        events,
        shows
    ) {


        const scores =

            shows

                .map(

                    show =>

                        calculateShowScore(

                            show,
                            events,
                            shows

                        )

                );


        scores.sort(

            (
                a,
                b
            ) => {


                const aScore =

                    a.landscapeScore

                    ??

                    -1;


                const bScore =

                    b.landscapeScore

                    ??

                    -1;


                if (
                    bScore !== aScore
                ) {


                    return bScore - aScore;

                }


                return a.showName

                    .localeCompare(
                        b.showName
                    );

            }

        );


        return scores.map(

            (
                score,
                index
            ) => ({


                rank:
                    index + 1,


                ...score

            })

        );

    }



    // =================================
    // COMPANY WEEKLY PRODUCT
    // =================================


    function companyWeeklyProductScore(
        companyId,
        showRankings
    ) {


        const companyShows =

            showRankings.filter(

                show =>

                    show.companyId ===
                    companyId

            );


        return average(

            companyShows

                .map(

                    show =>

                        show.landscapeScore

                )

                .filter(

                    score =>

                        score !== null

                )

        );

    }



    // =================================
    // COMPANY MAJOR EVENT PERFORMANCE
    // =================================


    function companyMajorEventScore(
        companyId,
        events,
        mode
    ) {


        const majorEvents =

            events

                .filter(

                    event =>

                        event.companyId ===
                        companyId

                        &&

                        event.eventType ===
                        "major-event"

                );


        if (
            majorEvents.length === 0
        ) {


            return null;

        }


        const selectedEvents =

            mode === "ytd"

                ? majorEvents.slice(
                    -3
                )

                : majorEvents;


        const averageRating =

            average(

                selectedEvents.map(

                    event =>

                        event.overallRating

                )

            );


        return averageRating === null

            ? null

            : ratingToScore(
                averageRating
            );

    }



    // =================================
    // COMPANY SCORE
    // =================================


    function calculateCompanyScore(
        company,
        events,
        shows,
        showRankings,
        mode = "monthly"
    ) {


        const companyWeeklyEvents =

            sortEvents(

                events.filter(

                    event =>

                        event.companyId ===
                        company.id

                        &&

                        event.eventType ===
                        "weekly"

                ),

                shows

            );


        const companyAllEvents =

            events.filter(

                event =>

                    event.companyId ===
                    company.id

            );


        const weeklyProduct =

            companyWeeklyProductScore(

                company.id,
                showRankings

            );


        const majorEventPerformance =

            companyMajorEventScore(

                company.id,
                companyAllEvents,
                mode

            );


        const matchRatings =

            collectMatchRatings(
                companyAllEvents
            );


        const matchAverage =

            average(
                matchRatings
            );


        const matchQuality =

            matchAverage === null

                ? null

                : ratingToScore(
                    matchAverage
                );


        const weeklyOverallRatings =

            companyWeeklyEvents

                .map(

                    event =>

                        event.overallRating

                );


        const consistency =

            consistencyScore(
                weeklyOverallRatings
            );


        const momentum =

            momentumScore(
                weeklyOverallRatings
            );


        const landscapeScore =

            weightedScore([

                {
                    score:
                        weeklyProduct,

                    weight:
                        45
                },

                {
                    score:
                        majorEventPerformance,

                    weight:
                        25
                },

                {
                    score:
                        matchQuality,

                    weight:
                        15
                },

                {
                    score:
                        consistency,

                    weight:
                        10
                },

                {
                    score:
                        momentum,

                    weight:
                        5
                }

            ]);


        return {


            companyId:
                company.id,


            companyName:
                company.name,


            weeklyEventsRecorded:
                companyWeeklyEvents.length,


            allMatchesRecorded:
                matchRatings.length,


            matchAverage:

                matchAverage === null

                    ? null

                    : roundScore(
                        matchAverage,
                        2
                    ),


            components: {


                weeklyProduct:

                    weeklyProduct === null

                        ? null

                        : roundScore(
                            weeklyProduct
                        ),


                majorEventPerformance:
                    majorEventPerformance,


                matchQuality:
                    matchQuality,


                consistency:
                    consistency,


                momentum:
                    momentum

            },


            landscapeScore:
                landscapeScore

        };

    }



    // =================================
    // COMPANY RANKINGS
    // =================================


    function calculateCompanyRankings(
        events,
        shows,
        companies,
        mode = "monthly"
    ) {


        const showRankings =

            calculateShowRankings(

                events,
                shows

            );


        const scores =

            companies

                .filter(

                    company =>

                        company.rankingEligible
                        !==
                        false

                )

                .map(

                    company =>

                        calculateCompanyScore(

                            company,
                            events,
                            shows,
                            showRankings,
                            mode

                        )

                );


        scores.sort(

            (
                a,
                b
            ) => {


                const aScore =

                    a.landscapeScore

                    ??

                    -1;


                const bScore =

                    b.landscapeScore

                    ??

                    -1;


                if (
                    bScore !== aScore
                ) {


                    return bScore - aScore;

                }


                return a.companyName

                    .localeCompare(
                        b.companyName
                    );

            }

        );


        return scores.map(

            (
                score,
                index
            ) => ({


                rank:
                    index + 1,


                ...score

            })

        );

    }



    // =================================
    // FILTER MONTH
    // =================================


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



    // =================================
    // FILTER YTD
    // =================================


    function eventsThroughPeriod(
        events,
        periodId
    ) {


        return events.filter(

            event =>

                String(
                    event.periodId || ""
                )

                <=

                String(
                    periodId || ""
                )

        );

    }



    // =================================
    // MONTHLY RANKINGS
    // =================================


    function calculateMonthlyRankings({
        events,
        shows,
        companies,
        periodId
    }) {


        const monthEvents =

            eventsForPeriod(

                events,
                periodId

            );


        return {


            scoreVersion:
                SCORE_VERSION,


            periodId:
                periodId,


            mode:
                "monthly",


            showRankings:

                calculateShowRankings(

                    monthEvents,
                    shows

                ),


            companyRankings:

                calculateCompanyRankings(

                    monthEvents,
                    shows,
                    companies,
                    "monthly"

                )

        };

    }



    // =================================
    // YTD RANKINGS
    // =================================


    function calculateYtdRankings({
        events,
        shows,
        companies,
        periodId
    }) {


        const ytdEvents =

            eventsThroughPeriod(

                events,
                periodId

            );


        return {


            scoreVersion:
                SCORE_VERSION,


            periodId:
                periodId,


            mode:
                "ytd",


            showRankings:

                calculateShowRankings(

                    ytdEvents,
                    shows

                ),


            companyRankings:

                calculateCompanyRankings(

                    ytdEvents,
                    shows,
                    companies,
                    "ytd"

                )

        };

    }



    // =================================
    // PUBLIC API
    // =================================


    window.LandscapeScoreEngine = {


        SCORE_VERSION,


        average,


        clamp,


        ratingToScore,


        standardDeviation,


        consistencyScore,


        momentumScore,


        collectMatchRatings,


        calculateShowScore,


        calculateShowRankings,


        calculateCompanyScore,


        calculateCompanyRankings,


        calculateMonthlyRankings,


        calculateYtdRankings

    };


})();
