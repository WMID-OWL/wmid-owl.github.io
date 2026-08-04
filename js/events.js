async function loadEventsDirectory() {

    try {


        const response =
            await fetch(
                "data/events.json",
                {
                    cache:
                        "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Could not load events database."
            );

        }


        const events =
            await response.json();



        const completedSection =
            document.getElementById(
                "completed-events-section"
            );


        const completedGrid =
            document.getElementById(
                "completed-event-grid"
            );


        const completedCount =
            document.getElementById(
                "completed-event-count"
            );


        const emptyState =
            document.getElementById(
                "events-empty-state"
            );



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



        function formatEventSchedule(
            event
        ) {

            if (
                window.OWLCalendar

                &&

                typeof window.OWLCalendar
                    .formatEventSlot ===
                    "function"
            ) {

                return window.OWLCalendar
                    .formatEventSlot(
                        event
                    );

            }


            return "Schedule Not Set";

        }



        function compareEventsNewestFirst(
            eventA,
            eventB
        ) {

            if (
                window.OWLCalendar

                &&

                typeof window.OWLCalendar
                    .compareEvents ===
                    "function"
            ) {

                return window.OWLCalendar
                    .compareEvents(
                        eventB,
                        eventA
                    );

            }


            return 0;

        }



        function formatCount(
            count
        ) {

            return `${count} ${
                count === 1
                    ? "Event"
                    : "Events"
            }`;

        }



        function createEventCard(
            event
        ) {

            const link =
                document.createElement(
                    "a"
                );


            link.href =
                `event.html?id=${encodeURIComponent(
                    event.id
                )}`;


            link.className =
                "event-card";


            link.innerHTML = `

                <div class="event-card-image">

                    ${
                        event.image

                            ? `
                                <img
                                    src="${escapeHtml(
                                        event.image
                                    )}"
                                    alt="${escapeHtml(
                                        event.name
                                    )}"
                                >
                            `

                            : `
                                <span>
                                    OWL
                                </span>
                            `
                    }

                </div>


                <div class="event-card-body">


                    <div class="event-card-topline">

                        <span>
                            ${escapeHtml(
                                event.brand || "OWL"
                            )}
                        </span>

                        <span>

                            ${
                                normalize(
                                    event.eventType
                                ) === "ppv"

                                    ? "PPV"

                                    : "WEEKLY"
                            }

                        </span>

                    </div>


                    <h3>
                        ${escapeHtml(
                            event.name
                        )}
                    </h3>


                    <p class="event-card-date">

                        ${escapeHtml(
                            formatEventSchedule(
                                event
                            )
                        )}

                    </p>


                    ${
                        event.location

                            ? `
                                <p class="event-card-location">
                                    ${escapeHtml(
                                        event.location
                                    )}
                                </p>
                            `

                            : ""
                    }


                    ${
                        event.tagline

                            ? `
                                <p class="event-card-tagline">
                                    ${escapeHtml(
                                        event.tagline
                                    )}
                                </p>
                            `

                            : ""
                    }


                    <span class="view-event-link">
                        View Event →
                    </span>


                </div>

            `;


            return link;

        }



        const completedEvents =
            Array.isArray(
                events
            )

                ? events

                    .filter(
                        event =>

                            normalize(
                                event.status
                            ) !== "upcoming"
                    )

                    .sort(
                        compareEventsNewestFirst
                    )

                : [];


        completedGrid.innerHTML =
            "";


        completedCount.textContent =
            formatCount(
                completedEvents.length
            );


        if (
            completedEvents.length > 0
        ) {

            completedSection.hidden =
                false;


            completedEvents.forEach(
                event => {

                    completedGrid.appendChild(
                        createEventCard(
                            event
                        )
                    );

                }
            );


            emptyState.hidden =
                true;

        }


        else {

            completedSection.hidden =
                true;


            emptyState.hidden =
                false;

        }

    }


    catch (
        error
    ) {

        console.error(
            "Could not load Events directory:",
            error
        );


        document.querySelector(
            ".events-page"
        ).innerHTML = `

            <section class="events-section">

                <h1>
                    Events Page Could Not Load
                </h1>

                <p class="empty-message">
                    There was a problem loading the OWL events database.
                </p>

            </section>

        `;

    }

}



loadEventsDirectory();
