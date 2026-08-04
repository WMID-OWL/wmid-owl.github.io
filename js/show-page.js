(() => {

    "use strict";


    const brand =
        String(
            document.body.dataset.showBrand || ""
        ).trim();


    const nextEventCard =
        document.getElementById(
            "show-next-event"
        );


    const recentEventsGrid =
        document.getElementById(
            "show-recent-events"
        );


    const recentCount =
        document.getElementById(
            "show-recent-count"
        );


    if (
        !brand
        ||
        !nextEventCard
        ||
        !recentEventsGrid
        ||
        !recentCount
    ) {

        return;

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



    function getCalendar() {

        return window.OWLCalendar || null;

    }



    function formatEventSchedule(
        event
    ) {

        const calendar =
            getCalendar();


        if (
            calendar

            &&

            typeof calendar.formatEventSlot ===
                "function"
        ) {

            return calendar.formatEventSlot(
                event
            );

        }


        return "Schedule Not Set";

    }



    function compareEvents(
        eventA,
        eventB
    ) {

        const calendar =
            getCalendar();


        if (
            calendar

            &&

            typeof calendar.compareEvents ===
                "function"
        ) {

            return calendar.compareEvents(
                eventA,
                eventB
            );

        }


        return String(
            eventA?.name || ""
        ).localeCompare(
            String(
                eventB?.name || ""
            )
        );

    }



    function sameEventSlot(
        sourceA,
        sourceB
    ) {

        const calendar =
            getCalendar();


        if (
            calendar

            &&

            typeof calendar.sameEventSlot ===
                "function"
        ) {

            return calendar.sameEventSlot(
                sourceA,
                sourceB
            );

        }


        return false;

    }



    function formatCount(
        count
    ) {

        return `${count} ${
            count === 1
                ? "Episode"
                : "Episodes"
        }`;

    }



    function sideLabel(
        side,
        wrestlerMap
    ) {

        const wrestlerIds =
            Array.isArray(
                side?.wrestlers
            )

                ? side.wrestlers

                : [];


        return wrestlerIds
            .map(
                wrestlerId =>

                    wrestlerMap[
                        wrestlerId
                    ]?.name

                    ||

                    wrestlerId
            )
            .join(
                " & "
            );

    }



    function matchLabel(
        match,
        wrestlerMap
    ) {

        const sides =
            Array.isArray(
                match?.sides
            )

                ? match.sides

                : [];


        const labels =
            sides
                .map(
                    side =>

                        sideLabel(
                            side,
                            wrestlerMap
                        )
                )
                .filter(
                    Boolean
                );


        return labels.length > 0

            ? labels.join(
                " vs "
            )

            : match?.matchType || "Match";

    }



    function getEventMatches(
        event,
        matches
    ) {

        return matches.filter(
            match => {


                if (
                    match.eventId

                    &&

                    event.id
                ) {

                    return match.eventId ===
                        event.id;

                }


                return (

                    sameEventSlot(
                        match,
                        event
                    )

                    &&

                    normalize(
                        match.event
                    ) ===
                        normalize(
                            event.name
                        )

                );

            }
        );

    }



    function getAverageRating(
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
                    Number.isFinite
                );


        if (
            ratings.length === 0
        ) {

            return "";

        }


        const total =
            ratings.reduce(
                (
                    sum,
                    rating
                ) =>

                    sum + rating,

                0
            );


        return Math.round(
            total / ratings.length
        );

    }



    function getTopMatch(
        matches
    ) {

        return [...matches]
            .sort(
                (
                    matchA,
                    matchB
                ) =>

                    Number(
                        matchB.starRating || 0
                    )

                    -

                    Number(
                        matchA.starRating || 0
                    )

                    ||

                    Number(
                        matchB.rating || 0
                    )

                    -

                    Number(
                        matchA.rating || 0
                    )
            )[0]

            ||

            null;

    }



    function renderNextEvent(
        event
    ) {

        if (!event) {

            nextEventCard.innerHTML = `

                <div class="show-next-empty">

                    <span>
                        COMING NEXT
                    </span>

                    <h3>
                        Nothing announced yet
                    </h3>

                    <p>

                        The next ${escapeHtml(
                            brand
                        )} event has not been
                        added to the calendar.

                    </p>

                    <a href="events.html">
                        View Parliament Schedule →
                    </a>

                </div>

            `;


            return;

        }


        const isPpv =
            normalize(
                event.eventType
            ) === "ppv";


        const fallbackLogo =
            `assets/images/shows/${normalize(
                brand
            )}-logo.png`;


        nextEventCard.innerHTML = `

            <a
                class="show-next-link"
                href="event.html?id=${encodeURIComponent(
                    event.id
                )}"
            >

                <div class="show-next-art">

                    <img
                        src="${escapeHtml(
                            event.image || fallbackLogo
                        )}"
                        alt="${escapeHtml(
                            event.name || brand
                        )}"
                    >

                    <span>

                        ${
                            isPpv
                                ? "NEXT OWL PPV"
                                : "NEXT EPISODE"
                        }

                    </span>

                </div>


                <div class="show-next-copy">

                    <small>
                        ${escapeHtml(
                            formatEventSchedule(
                                event
                            )
                        )}
                    </small>

                    <h3>
                        ${escapeHtml(
                            event.name || brand
                        )}
                    </h3>

                    <p>

                        ${escapeHtml(
                            event.location
                            ||
                            "OWL Parliament Hall"
                        )}

                    </p>

                    <strong>
                        View Event →
                    </strong>

                </div>

            </a>

        `;

    }



    function renderRecentEvents(
        events,
        matches,
        wrestlerMap
    ) {

        recentCount.textContent =
            formatCount(
                events.length
            );


        if (
            events.length === 0
        ) {

            recentEventsGrid.innerHTML = `

                <div class="show-recent-empty">

                    No completed ${escapeHtml(
                        brand
                    )} episodes are currently archived.

                </div>

            `;


            return;

        }


        recentEventsGrid.innerHTML =
            events
                .map(
                    event => {


                        const matchesForEvent =
                            getEventMatches(
                                event,
                                matches
                            );


                        const rating =
                            getAverageRating(
                                matchesForEvent
                            );


                        const topMatch =
                            getTopMatch(
                                matchesForEvent
                            );


                        return `

                            <a
                                class="show-recent-card"
                                href="event.html?id=${encodeURIComponent(
                                    event.id
                                )}"
                            >

                                <div class="show-recent-topline">

                                    <span>
                                        ${escapeHtml(
                                            formatEventSchedule(
                                                event
                                            )
                                        )}
                                    </span>

                                    <strong>

                                        ${matchesForEvent.length}

                                        ${
                                            matchesForEvent.length === 1
                                                ? "MATCH"
                                                : "MATCHES"
                                        }

                                    </strong>

                                </div>


                                <h3>
                                    ${escapeHtml(
                                        event.name || brand
                                    )}
                                </h3>


                                <p>

                                    ${
                                        rating

                                            ? `Average show rating: ${rating}`

                                            : "No match ratings recorded."
                                    }

                                </p>


                                ${
                                    topMatch

                                        ? `

                                            <small>

                                                Top match:
                                                ${escapeHtml(
                                                    matchLabel(
                                                        topMatch,
                                                        wrestlerMap
                                                    )
                                                )}

                                            </small>

                                        `

                                        : ""
                                }


                                <span class="show-recent-link">
                                    View Results →
                                </span>

                            </a>

                        `;

                    }
                )
                .join(
                    ""
                );

    }



    async function loadShowPage() {

        try {


            const [
                eventsResponse,
                matchesResponse,
                wrestlersResponse
            ] = await Promise.all([

                fetch(
                    "data/events.json",
                    {
                        cache:
                            "no-store"
                    }
                ),

                fetch(
                    "data/matches.json",
                    {
                        cache:
                            "no-store"
                    }
                ),

                fetch(
                    "data/wrestlers.json",
                    {
                        cache:
                            "no-store"
                    }
                )

            ]);


            if (
                !eventsResponse.ok
                ||
                !matchesResponse.ok
                ||
                !wrestlersResponse.ok
            ) {

                throw new Error(
                    "Could not load show databases."
                );

            }


            const [
                eventData,
                matchData,
                wrestlerData
            ] = await Promise.all([

                eventsResponse.json(),
                matchesResponse.json(),
                wrestlersResponse.json()

            ]);


            const events =
                Array.isArray(
                    eventData
                )

                    ? eventData

                    : [];


            const matches =
                Array.isArray(
                    matchData
                )

                    ? matchData

                    : [];


            const wrestlers =
                Array.isArray(
                    wrestlerData
                )

                    ? wrestlerData

                    : [];


            const wrestlerMap =
                {};


            wrestlers.forEach(
                wrestler => {

                    wrestlerMap[
                        wrestler.id
                    ] = wrestler;

                }
            );


            const brandWeeklyEvents =
                events.filter(
                    event =>

                        normalize(
                            event.brand
                        ) ===
                            normalize(
                                brand
                            )

                        &&

                        normalize(
                            event.eventType
                        ) ===
                            "weekly"
                );


            const upcomingBrandEvent =
                brandWeeklyEvents

                    .filter(
                        event =>

                            normalize(
                                event.status
                            ) ===
                                "upcoming"
                    )

                    .sort(
                        compareEvents
                    )[0]

                ||

                null;


            const upcomingPpv =
                events

                    .filter(
                        event =>

                            normalize(
                                event.status
                            ) ===
                                "upcoming"

                            &&

                            normalize(
                                event.eventType
                            ) ===
                                "ppv"
                    )

                    .sort(
                        compareEvents
                    )[0]

                ||

                null;


            const recentBrandEvents =
                brandWeeklyEvents

                    .filter(
                        event =>

                            normalize(
                                event.status
                            ) ===
                                "completed"
                    )

                    .sort(
                        (
                            eventA,
                            eventB
                        ) =>

                            compareEvents(
                                eventB,
                                eventA
                            )
                    )

                    .slice(
                        0,
                        4
                    );


            renderNextEvent(
                upcomingBrandEvent
                ||
                upcomingPpv
            );


            renderRecentEvents(
                recentBrandEvents,
                matches,
                wrestlerMap
            );

        }


        catch (
            error
        ) {

            console.error(
                `Could not load ${brand} show page:`,
                error
            );


            nextEventCard.innerHTML = `

                <div class="show-next-empty">

                    <h3>
                        Schedule unavailable
                    </h3>

                    <p>
                        The next event could not be loaded.
                    </p>

                </div>

            `;


            recentEventsGrid.innerHTML = `

                <div class="show-recent-empty">
                    Recent results could not be loaded.
                </div>

            `;


            recentCount.textContent =
                "Unavailable";

        }

    }



    loadShowPage();

})();
