// =================================
// THE LANDSCAPE
// PUBLIC DATA CONTROLLER
// =================================


(() => {


    "use strict";


    const els = {


        currentPeriod:

            document.getElementById(
                "landscape-current-period"
            ),


        dataStatus:

            document.getElementById(
                "landscape-data-status"
            ),


        companyCount:

            document.getElementById(
                "landscape-company-count"
            ),


        showCount:

            document.getElementById(
                "landscape-show-count"
            ),


        eventCount:

            document.getElementById(
                "landscape-event-count"
            ),


        leaderPromotion:

            document.getElementById(
                "landscape-leader-promotion"
            ),


        leaderShow:

            document.getElementById(
                "landscape-leader-show"
            ),


        topMatchRating:

            document.getElementById(
                "landscape-top-match-rating"
            ),


        promotionRankings:

            document.getElementById(
                "landscape-promotion-rankings"
            ),


        movementGrid:

            document.getElementById(
                "landscape-movement-grid"
            ),


        showRankings:

            document.getElementById(
                "landscape-show-rankings"
            ),


        eventGrid:

            document.getElementById(
                "landscape-event-grid"
            ),


        topMatches:

            document.getElementById(
                "landscape-top-matches"
            ),


        majorEvents:

            document.getElementById(
                "landscape-major-event-list"
            ),


        champions:

            document.getElementById(
                "landscape-champion-grid"
            ),


        history:

            document.getElementById(
                "landscape-history-grid"
            )

    };


    const state = {


        companies:
            [],


        shows:
            [],


        events:
            [],


        calendar:
            null,


        archive:
            null,


        rankings:
            null,


        champions:
            null

    };



    // =================================
    // HELPERS
    // =================================


    function escapeHtml(
        value
    ) {


        return String(
            value ?? ""
        )

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }



    async function loadJson(
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

                `Could not load ${path}`

            );

        }


        return response.json();

    }



    function periodLabel(
        periodId
    ) {


        const match =

            String(
                periodId || ""
            )
                .match(
                    /^(\d{4})-(\d{2})$/
                );


        if (
            !match
        ) {


            return periodId || "—";

        }


        const year =
            match[1];


        const monthId =
            match[2];


        const month =

            state.calendar
                ?.months
                ?.find(

                    item =>

                        item.id ===
                        monthId

                );


        return month

            ? `${month.name} ${year}`

            : periodId;

    }



    function stageLabel(
        stageId
    ) {


        const stages = [

            ...(
                state.calendar
                    ?.weeklyStages

                ||

                []
            ),

            state.calendar
                ?.monthlyFinale

        ]

            .filter(
                Boolean
            );


        return (

            stages.find(

                stage =>

                    stage.id ===
                    stageId

            )

            ?.label

            ||

            stageId

            ||

            ""

        );

    }



    function companyForId(
        companyId
    ) {


        return (

            state.companies.find(

                company =>

                    company.id ===
                    companyId

            )

            ||

            null

        );

    }



    function showForId(
        showId
    ) {


        return (

            state.shows.find(

                show =>

                    show.id ===
                    showId

            )

            ||

            null

        );

    }



    function formatScore(
        value
    ) {


        const number =

            Number(
                value
            );


        return Number.isFinite(
            number
        )

            ? number.toFixed(
                1
            )

            : "—";

    }



    function formatLocation(
        location
    ) {


        if (
            !location
        ) {


            return "Location unavailable";

        }


        return [

            location.venue,
            location.city,
            location.region

        ]

            .filter(
                Boolean
            )

            .join(
                " · "
            );

    }



    function periodIds() {


        return [

            ...new Set(

                state.events

                    .map(

                        event =>

                            event.periodId

                    )

                    .filter(
                        Boolean
                    )

            )

        ]

            .sort();

    }



    function latestPeriodId() {


        return (

            state.archive
                ?.latestPeriodId

            ||

            periodIds()
                .at(
                    -1
                )

            ||

            ""

        );

    }



    function rankingResultForPeriod(
        periodId
    ) {


        const frozen =

            state.rankings
                ?.periods
                ?.find(

                    period =>

                        period.periodId ===
                        periodId

                );


        if (
            frozen?.monthly
        ) {


            return frozen.monthly;

        }


        return window
            .LandscapeScoreEngine
            .calculateMonthlyRankings({


                events:
                    state.events,


                shows:
                    state.shows,


                companies:
                    state.companies,


                periodId:
                    periodId

            });

    }



    function previousPeriodId(
        currentPeriodId
    ) {


        const periods =
            periodIds();


        const index =

            periods.indexOf(
                currentPeriodId
            );


        if (
            index <= 0
        ) {


            return "";

        }


        return periods[
            index - 1
        ];

    }    // =================================
    // MOVEMENT
    // =================================


    function movementForItem(
        itemId,
        currentRank,
        previousRankings,
        idField
    ) {


        if (
            !previousRankings
        ) {


            return {


                type:
                    "new",


                delta:
                    null,


                label:
                    "NEW"

            };

        }


        const previous =

            previousRankings.find(

                item =>

                    item[
                        idField
                    ]

                    ===

                    itemId

            );


        if (
            !previous
        ) {


            return {


                type:
                    "new",


                delta:
                    null,


                label:
                    "NEW"

            };

        }


        const delta =

            previous.rank

            -

            currentRank;


        if (
            delta > 0
        ) {


            return {


                type:
                    "rise",


                delta:
                    delta,


                label:
                    `▲ ${delta}`

            };

        }


        if (
            delta < 0
        ) {


            return {


                type:
                    "fall",


                delta:
                    delta,


                label:
                    `▼ ${Math.abs(
                        delta
                    )}`

            };

        }


        return {


            type:
                "steady",


            delta:
                0,


            label:
                "—"

        };

    }



    function movementBadge(
        movement
    ) {


        return `

            <span class="landscape-movement-badge ${

                movement.type

            }">

                ${escapeHtml(
                    movement.label
                )}

            </span>

        `;

    }



    // =================================
    // PROMOTION POWER
    // =================================


    function renderPromotionRankings(
        currentResult,
        previousResult
    ) {


        const rankings =

            currentResult
                ?.companyRankings
                ?.filter(

                    item =>

                        item.landscapeScore
                        !==
                        null

                )

            ||

            [];


        if (
            rankings.length === 0
        ) {


            els.promotionRankings
                .innerHTML = `

                    <p class="landscape-empty">

                        NO PROMOTION SCORES AVAILABLE

                    </p>

                `;


            return;

        }


        const leader =
            rankings[0];


        const leaderMovement =

            movementForItem(

                leader.companyId,
                leader.rank,
                previousResult
                    ?.companyRankings,
                "companyId"

            );


        const throneHtml = `

            <article class="landscape-throne-card">


                <div class="landscape-throne-identity">


                    <div>


                        <span class="landscape-throne-label">

                            THE THRONE
                            ·
                            ${escapeHtml(
                                leaderMovement.label
                            )}

                        </span>


                        <h3 class="landscape-throne-name">

                            ${escapeHtml(
                                leader.companyName
                            )}

                        </h3>


                    </div>



                    <div class="landscape-throne-score">


                        <strong>

                            ${formatScore(
                                leader.landscapeScore
                            )}

                        </strong>


                        <span>
                            LANDSCAPE SCORE
                        </span>


                    </div>


                </div>



                <div class="landscape-throne-metrics">


                    <div class="landscape-throne-metric">


                        <span>
                            WEEKLY PRODUCT
                        </span>


                        <strong>

                            ${formatScore(
                                leader.components
                                    ?.weeklyProduct
                            )}

                        </strong>


                    </div>



                    <div class="landscape-throne-metric">


                        <span>
                            MAJOR EVENT
                        </span>


                        <strong>

                            ${formatScore(
                                leader.components
                                    ?.majorEventPerformance
                            )}

                        </strong>


                    </div>



                    <div class="landscape-throne-metric">


                        <span>
                            MATCH QUALITY
                        </span>


                        <strong>

                            ${formatScore(
                                leader.components
                                    ?.matchQuality
                            )}

                        </strong>


                    </div>



                    <div class="landscape-throne-metric">


                        <span>
                            CONSISTENCY
                        </span>


                        <strong>

                            ${formatScore(
                                leader.components
                                    ?.consistency
                            )}

                        </strong>


                    </div>


                </div>


            </article>

        `;


        const ladderHtml = `

            <div class="landscape-ranking-ladder">

                ${rankings

                    .slice(
                        1
                    )

                    .map(

                        item => {


                            const movement =

                                movementForItem(

                                    item.companyId,
                                    item.rank,
                                    previousResult
                                        ?.companyRankings,
                                    "companyId"

                                );


                            const zoneClass =

                                item.rank >= 7

                                    ? "rank-freeze"

                                    : item.rank <= 3

                                        ? "rank-chase"

                                        : "";


                            return `

                                <article class="landscape-power-row ${zoneClass}">


                                    <strong class="landscape-rank-number">

                                        ${item.rank}

                                    </strong>



                                    <div class="landscape-power-name">


                                        <strong>

                                            ${escapeHtml(
                                                item.companyName
                                            )}

                                        </strong>


                                        <small>

                                            ${item.weeklyEventsRecorded}
                                            weekly records

                                        </small>


                                    </div>



                                    ${movementBadge(
                                        movement
                                    )}



                                    <div class="landscape-component-bars">


                                        <div class="landscape-mini-component">


                                            <span>
                                                WEEKLY
                                            </span>


                                            <strong>

                                                ${formatScore(
                                                    item.components
                                                        ?.weeklyProduct
                                                )}

                                            </strong>


                                        </div>



                                        <div class="landscape-mini-component">


                                            <span>
                                                MAJOR
                                            </span>


                                            <strong>

                                                ${formatScore(
                                                    item.components
                                                        ?.majorEventPerformance
                                                )}

                                            </strong>


                                        </div>



                                        <div class="landscape-mini-component">


                                            <span>
                                                MATCH
                                            </span>


                                            <strong>

                                                ${formatScore(
                                                    item.components
                                                        ?.matchQuality
                                                )}

                                            </strong>


                                        </div>


                                    </div>



                                    <strong class="landscape-power-score">

                                        ${formatScore(
                                            item.landscapeScore
                                        )}

                                    </strong>


                                </article>

                            `;

                        }

                    )

                    .join(
                        ""
                    )}

            </div>

        `;


        els.promotionRankings
            .innerHTML =

                throneHtml

                +

                ladderHtml;


        els.leaderPromotion
            .textContent =

                leader.companyName;

    }



    // =================================
    // MOVEMENT WATCH
    // =================================


    function renderMovement(
        currentResult,
        previousResult
    ) {


        if (
            !previousResult
        ) {


            els.movementGrid
                .innerHTML = `

                    <article class="landscape-movement-empty">

                        MOVEMENT DATA REQUIRES A SECOND LANDSCAPE PERIOD

                    </article>

                `;


            return;

        }


        const movements =

            currentResult
                .companyRankings

                .map(

                    item => {


                        const movement =

                            movementForItem(

                                item.companyId,
                                item.rank,
                                previousResult
                                    .companyRankings,
                                "companyId"

                            );


                        return {


                            name:
                                item.companyName,


                            ...movement

                        };

                    }

                );


        const riser =

            movements

                .filter(

                    item =>

                        item.delta > 0

                )

                .sort(

                    (
                        a,
                        b
                    ) =>

                        b.delta
                        -
                        a.delta

                )[0]

            ||

            null;


        const faller =

            movements

                .filter(

                    item =>

                        item.delta < 0

                )

                .sort(

                    (
                        a,
                        b
                    ) =>

                        a.delta
                        -
                        b.delta

                )[0]

            ||

            null;


        els.movementGrid
            .innerHTML = `


                <article class="landscape-movement-card rising">


                    <span>
                        BIGGEST CLIMBER
                    </span>


                    <h3>

                        ${escapeHtml(
                            riser?.name || "NO MOVEMENT"
                        )}

                    </h3>


                    <strong>

                        ${

                            riser

                                ? `▲ ${riser.delta} POSITIONS`

                                : "—"

                        }

                    </strong>


                </article>



                <article class="landscape-movement-card falling">


                    <span>
                        BIGGEST FALL
                    </span>


                    <h3>

                        ${escapeHtml(
                            faller?.name || "NO MOVEMENT"
                        )}

                    </h3>


                    <strong>

                        ${

                            faller

                                ? `▼ ${Math.abs(
                                    faller.delta
                                )} POSITIONS`

                                : "—"

                        }

                    </strong>


                </article>


            `;

    }    // =================================
    // SHOW RANKINGS
    // =================================


    function renderShowRankings(
        currentResult,
        previousResult
    ) {


        const rankings =

            currentResult
                ?.showRankings
                ?.filter(

                    item =>

                        item.landscapeScore
                        !==
                        null

                )

            ||

            [];


        if (
            rankings.length === 0
        ) {


            els.showRankings
                .innerHTML = `

                    <p class="landscape-empty">

                        NO WEEKLY SHOW SCORES AVAILABLE

                    </p>

                `;


            return;

        }


        els.leaderShow
            .textContent =

                rankings[0]
                    .showName;


        els.showRankings
            .innerHTML =

                rankings

                    .map(

                        item => {


                            const movement =

                                movementForItem(

                                    item.showId,
                                    item.rank,
                                    previousResult
                                        ?.showRankings,
                                    "showId"

                                );


                            const rowClass =

                                item.rank === 1

                                    ? "show-leader"

                                    : item.rank >= 9

                                        ? "show-freeze"

                                        : "";


                            return `

                                <article class="landscape-show-row ${rowClass}">


                                    <strong class="landscape-rank-number">

                                        ${item.rank}

                                    </strong>



                                    <div class="landscape-show-info">


                                        <strong>

                                            ${escapeHtml(
                                                item.showName
                                            )}

                                        </strong>


                                        <small>

                                            OVERALL
                                            ${item.overallAverage ?? "—"}

                                            ·

                                            IN-RING
                                            ${item.matchAverage ?? "—"}

                                        </small>


                                    </div>



                                    ${movementBadge(
                                        movement
                                    )}



                                    <strong class="landscape-show-score">

                                        ${formatScore(
                                            item.landscapeScore
                                        )}

                                    </strong>


                                </article>

                            `;

                        }

                    )

                    .join(
                        ""
                    );

    }



    // =================================
    // EVENTS
    // =================================


    function renderEvents(
        periodId
    ) {


        const events =

            state.events

                .filter(

                    event =>

                        event.periodId ===
                        periodId

                );


        if (
            events.length === 0
        ) {


            els.eventGrid
                .innerHTML = `

                    <p class="landscape-empty">

                        NO EVENTS RECORDED FOR THIS PERIOD

                    </p>

                `;


            return;

        }


        els.eventGrid
            .innerHTML =

                events

                    .map(

                        event => {


                            const company =

                                companyForId(
                                    event.companyId
                                );


                            const show =

                                showForId(
                                    event.showId
                                );


                            const title =

                                event.eventName

                                ||

                                show?.name

                                ||

                                "Untitled Event";


                            return `

                                <article class="landscape-event-card">


                                    <div class="landscape-event-topline">


                                        <span>

                                            ${escapeHtml(
                                                company?.name || event.companyId
                                            )}

                                            ·

                                            ${escapeHtml(
                                                stageLabel(
                                                    event.stage
                                                )
                                            )}

                                        </span>


                                        <strong class="landscape-event-rating">

                                            ${event.overallRating ?? "—"}

                                        </strong>


                                    </div>



                                    <h3>

                                        ${escapeHtml(
                                            title
                                        )}

                                    </h3>



                                    <div class="landscape-event-meta">


                                        <small>

                                            ${escapeHtml(
                                                formatLocation(
                                                    event.location
                                                )
                                            )}

                                        </small>



                                        <div class="landscape-event-tags">


                                            <span>

                                                ${event.matches?.length || 0}
                                                MATCHES

                                            </span>


                                            <span>

                                                ${event.segments?.length || 0}
                                                SEGMENTS

                                            </span>


                                            <span>

                                                ${

                                                    event.eventType ===
                                                    "major-event"

                                                        ? "MAJOR EVENT"

                                                        : "WEEKLY"

                                                }

                                            </span>


                                        </div>


                                    </div>


                                </article>

                            `;

                        }

                    )

                    .join(
                        ""
                    );

    }



    // =================================
    // TOP MATCHES
    // =================================


    function currentPeriodMatches(
        periodId
    ) {


        const matches =
            [];


        state.events

            .filter(

                event =>

                    event.periodId ===
                    periodId

            )

            .forEach(

                event => {


                    const company =

                        companyForId(
                            event.companyId
                        );


                    const show =

                        showForId(
                            event.showId
                        );


                    (
                        event.matches

                        ||

                        []
                    )

                        .forEach(

                            match => {


                                const rating =

                                    Number(
                                        match.rating
                                    );


                                if (
                                    !Number.isFinite(
                                        rating
                                    )
                                ) {


                                    return;

                                }


                                matches.push({


                                    text:

                                        match.resultText

                                        ||

                                        "Untitled Match",


                                    rating:
                                        rating,


                                    company:

                                        company?.name

                                        ||

                                        event.companyId,


                                    event:

                                        event.eventName

                                        ||

                                        show?.name

                                        ||

                                        "Event"

                                });

                            }

                        );

                }

            );


        matches.sort(

            (
                a,
                b
            ) =>

                b.rating
                -
                a.rating

        );


        return matches;

    }



    function renderTopMatches(
        periodId
    ) {


        const matches =

            currentPeriodMatches(
                periodId
            )

                .slice(
                    0,
                    10
                );


        if (
            matches.length === 0
        ) {


            els.topMatches
                .innerHTML = `

                    <p class="landscape-empty">

                        NO RATED MATCHES AVAILABLE

                    </p>

                `;


            return;

        }


        els.topMatchRating
            .textContent =

                `${matches[0].rating.toFixed(
                    2
                )} ★`;


        els.topMatches
            .innerHTML =

                matches

                    .map(

                        (
                            match,
                            index
                        ) => `

                            <article class="landscape-match-row">


                                <strong class="landscape-match-rank">

                                    ${index + 1}

                                </strong>



                                <strong class="landscape-match-name">

                                    ${escapeHtml(
                                        match.text
                                    )}

                                </strong>



                                <span class="landscape-match-origin">

                                    ${escapeHtml(
                                        match.company
                                    )}

                                    ·

                                    ${escapeHtml(
                                        match.event
                                    )}

                                </span>



                                <strong class="landscape-match-rating">

                                    ${match.rating.toFixed(
                                        2
                                    )}

                                </strong>


                            </article>

                        `

                    )

                    .join(
                        ""
                    );

    }



    // =================================
    // MAJOR EVENTS
    // =================================


    function renderMajorEvents(
        periodId
    ) {


        const events =

            state.events

                .filter(

                    event =>

                        event.periodId ===
                        periodId

                        &&

                        event.eventType ===
                        "major-event"

                )

                .sort(

                    (
                        a,
                        b
                    ) =>

                        Number(
                            b.overallRating || 0
                        )

                        -

                        Number(
                            a.overallRating || 0
                        )

                );


        if (
            events.length === 0
        ) {


            els.majorEvents
                .innerHTML = `

                    <p class="landscape-empty">

                        NO MAJOR EVENTS RECORDED FOR THIS PERIOD

                    </p>

                `;


            return;

        }


        els.majorEvents
            .innerHTML =

                events

                    .map(

                        (
                            event,
                            index
                        ) => {


                            const company =

                                companyForId(
                                    event.companyId
                                );


                            return `

                                <article class="landscape-major-card">


                                    <span class="landscape-major-rank">

                                        #${index + 1}
                                        ·
                                        ${escapeHtml(
                                            company?.name || event.companyId
                                        )}

                                    </span>


                                    <h3>

                                        ${escapeHtml(
                                            event.eventName || "Major Event"
                                        )}

                                    </h3>


                                    <strong class="landscape-major-score">

                                        ${event.overallRating ?? "—"}

                                    </strong>


                                    <span class="landscape-major-location">

                                        ${escapeHtml(
                                            formatLocation(
                                                event.location
                                            )
                                        )}

                                    </span>


                                </article>

                            `;

                        }

                    )

                    .join(
                        ""
                    );

    }    // =================================
    // CHAMPIONS
    // =================================


    function championCompanyRecord(
        companyId
    ) {


        const companiesData =

            state.champions
                ?.companies;


        if (
            Array.isArray(
                companiesData
            )
        ) {


            return companiesData.find(

                company =>

                    company.companyId ===
                    companyId

                    ||

                    company.id ===
                    companyId

            )

            ||

            null;

        }


        if (
            companiesData

            &&

            typeof companiesData ===
            "object"
        ) {


            return (

                companiesData[
                    companyId
                ]

                ||

                null

            );

        }


        return null;

    }



    function renderChampions() {


        const cards =
            [];


        state.companies

            .filter(

                company =>

                    company.id !==
                    "owl"

            )

            .forEach(

                company => {


                    const record =

                        championCompanyRecord(
                            company.id
                        );


                    const titles =

                        Array.isArray(
                            record?.titles
                        )

                            ? record.titles

                            : [];


                    if (
                        titles.length === 0
                    ) {


                        return;

                    }


                    cards.push(`

                        <article class="landscape-champion-company">


                            <span>

                                ${escapeHtml(
                                    company.name
                                )}

                            </span>


                            ${titles

                                .map(

                                    title => `

                                        <div class="landscape-title-holder">


                                            <span>

                                                ${escapeHtml(
                                                    title.name || title.titleName || "CHAMPIONSHIP"
                                                )}

                                            </span>


                                            <strong>

                                                ${escapeHtml(
                                                    title.champion || title.currentChampion || "VACANT"
                                                )}

                                            </strong>


                                        </div>

                                    `

                                )

                                .join(
                                    ""
                                )}


                        </article>

                    `);

                }

            );


        els.champions
            .innerHTML =

                cards.length

                    ? cards.join(
                        ""
                    )

                    : `

                        <p class="landscape-empty">

                            NO EXTERNAL CHAMPIONS RECORDED YET

                        </p>

                    `;

    }



    // =================================
    // HISTORY
    // =================================


    function renderHistory() {


        const periods =

            Array.isArray(
                state.archive
                    ?.periods
            )

                ? [

                    ...state.archive.periods

                ]

                : [];


        periods.sort(

            (
                a,
                b
            ) =>

                String(
                    b.id || ""
                )

                    .localeCompare(

                        String(
                            a.id || ""
                        )

                    )

        );


        if (
            periods.length === 0
        ) {


            els.history
                .innerHTML = `

                    <p class="landscape-empty">

                        LANDSCAPE HISTORY HAS NOT BEGUN

                    </p>

                `;


            return;

        }


        els.history
            .innerHTML =

                periods

                    .map(

                        period => `

                            <article class="landscape-history-card ${

                                period.rankingsFinalized

                                    ? "frozen"

                                    : ""

                            }">


                                <span>
                                    LANDSCAPE PERIOD
                                </span>


                                <h3>

                                    ${escapeHtml(
                                        period.label || periodLabel(period.id)
                                    )}

                                </h3>


                                <div class="landscape-history-stats">


                                    <span>

                                        ${Number(
                                            period.weeklyShowsRecorded || 0
                                        )}
                                        / 44 WEEKLY

                                    </span>


                                    <span>

                                        ${Number(
                                            period.majorEventsRecorded || 0
                                        )}
                                        / 8 MAJOR

                                    </span>


                                </div>


                                <span class="landscape-history-state">

                                    ${

                                        period.rankingsFinalized

                                            ? "OFFICIAL POWER ORDER FROZEN"

                                            : "LIVE PERIOD"

                                    }

                                </span>


                            </article>

                        `

                    )

                    .join(
                        ""
                    );

    }



    // =================================
    // PAGE RENDER
    // =================================


    function renderPage() {


        const periodId =

            latestPeriodId();


        const previousId =

            previousPeriodId(
                periodId
            );


        els.currentPeriod
            .textContent =

                periodId

                    ? periodLabel(
                        periodId
                    )

                    : "NO ACTIVE PERIOD";


        els.companyCount
            .textContent =

                String(
                    state.companies.length
                );


        els.showCount
            .textContent =

                String(
                    state.shows.length
                );


        els.eventCount
            .textContent =

                String(
                    state.events.length
                );


        if (
            !periodId
        ) {


            els.dataStatus
                .textContent =

                    "READY";


            renderChampions();

            renderHistory();


            return;

        }


        const currentResult =

            rankingResultForPeriod(
                periodId
            );


        const previousResult =

            previousId

                ? rankingResultForPeriod(
                    previousId
                )

                : null;


        renderPromotionRankings(

            currentResult,
            previousResult

        );


        renderMovement(

            currentResult,
            previousResult

        );


        renderShowRankings(

            currentResult,
            previousResult

        );


        renderEvents(
            periodId
        );


        renderTopMatches(
            periodId
        );


        renderMajorEvents(
            periodId
        );


        renderChampions();

        renderHistory();


        const frozen =

            state.rankings
                ?.periods
                ?.some(

                    period =>

                        period.periodId ===
                        periodId

                );


        els.dataStatus
            .textContent =

                frozen

                    ? "OFFICIAL"

                    : "LIVE";

    }



    // =================================
    // LOAD
    // =================================


    async function loadLandscape() {


        try {


            els.dataStatus
                .textContent =

                    "LOADING";


            const [

                companiesData,
                showsData,
                eventsData,
                calendarData,
                archiveData,
                rankingsData,
                championsData

            ] =

                await Promise.all([


                    loadJson(
                        "data/landscape/companies.json"
                    ),


                    loadJson(
                        "data/landscape/shows.json"
                    ),


                    loadJson(
                        "data/landscape/events.json"
                    ),


                    loadJson(
                        "data/landscape/calendar-config.json"
                    ),


                    loadJson(
                        "data/landscape/archive-index.json"
                    ),


                    loadJson(
                        "data/landscape/rankings.json"
                    ),


                    loadJson(
                        "data/landscape/champions.json"
                    )


                ]);


            state.companies =

                Array.isArray(
                    companiesData.companies
                )

                    ? companiesData.companies

                    : [];


            state.shows =

                Array.isArray(
                    showsData.shows
                )

                    ? showsData.shows

                    : [];


            state.events =

                Array.isArray(
                    eventsData.events
                )

                    ? eventsData.events

                    : [];


            state.calendar =
                calendarData;


            state.archive =
                archiveData;


            state.rankings =
                rankingsData;


            state.champions =
                championsData;


            renderPage();

        }


        catch (
            error
        ) {


            console.error(

                "Landscape public page load failed:",

                error

            );


            els.dataStatus
                .textContent =

                    "LOAD FAILED";


            els.currentPeriod
                .textContent =

                    "DATA UNAVAILABLE";

        }

    }



    loadLandscape();


})();
