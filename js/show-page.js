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
        !brand ||
        !nextEventCard ||
        !recentEventsGrid ||
        !recentCount
    ) {

        return;

    }


    const normalize =
        value =>
            String(
                value || ""
            )
                .trim()
                .toLowerCase();


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


    function getDateValue(
        dateString
    ) {

        const value =
            new Date(
                `${dateString}T00:00:00`
            );


        return Number.isNaN(
            value.getTime()
        )

            ? new Date(0)

            : value;

    }


    function formatDate(
        dateString
    ) {

        return getDateValue(
            dateString
        ).toLocaleDateString(
            "en-US",
            {
                month:
                    "long",

                day:
                    "numeric",

                year:
                    "numeric"
            }
        );

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
            match =>

                match.date === event.date

                &&

                normalize(
                    match.event
                ) === normalize(
                    event.name
                )
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
                    a,
                    b
                ) =>

                    Number(
                        b.starRating || 0
                    )

                    -

                    Number(
                        a.starRating || 0
                    )

                    ||

                    Number(
                        b.rating || 0
                    )

                    -

                    Number(
                        a.rating || 0
                    )
            )[0]

            ||

            null;

    }


    function renderNextEvent(
        event
    ) {

        if (
            !event
        ) {

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
                            formatDate(
                                event.date
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
                                            formatDate(
                                                event.date
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
                !eventsResponse.ok ||
                !matchesResponse.ok ||
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
                        ) === normalize(
                            brand
                        )

                        &&

                        normalize(
                            event.eventType
                        ) === "weekly"
                );


            const upcomingBrandEvent =
                brandWeeklyEvents

                    .filter(
                        event =>

                            normalize(
                                event.status
                            ) === "upcoming"
                    )

                    .sort(
                        (
                            a,
                            b
                        ) =>

                            getDateValue(
                                a.date
                            )

                            -

                            getDateValue(
                                b.date
                            )
                    )[0]

                ||

                null;


            const upcomingPpv =
                events

                    .filter(
                        event =>

                            normalize(
                                event.status
                            ) === "upcoming"

                            &&

                            normalize(
                                event.eventType
                            ) === "ppv"
                    )

                    .sort(
                        (
                            a,
                            b
                        ) =>

                            getDateValue(
                                a.date
                            )

                            -

                            getDateValue(
                                b.date
                            )
                    )[0]

                ||

                null;


            const recentBrandEvents =
                brandWeeklyEvents

                    .filter(
                        event =>

                            normalize(
                                event.status
                            ) === "completed"
                    )

                    .sort(
                        (
                            a,
                            b
                        ) =>

                            getDateValue(
                                b.date
                            )

                            -

                            getDateValue(
                                a.date
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
