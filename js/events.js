async function loadEventsDirectory() {

    try {


        // =================================
        // LOAD EVENTS DATABASE
        // =================================


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



        // =================================
        // PAGE ELEMENTS
        // =================================


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



        // =================================
        // HELPERS
        // =================================


        function normalize(
            value
        ) {


            return String(
                value || ""
            )
                .trim()
                .toLowerCase();

        }



        function getDateValue(
            dateString
        ) {


            return new Date(

                `${dateString}T00:00:00`

            );

        }



        function formatDate(
            dateString
        ) {


            return getDateValue(
                dateString
            )
                .toLocaleDateString(

                    "en-US",

                    {
                        year:
                            "numeric",

                        month:
                            "long",

                        day:
                            "numeric"
                    }

                );

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



        // =================================
        // CREATE EVENT CARD
        // =================================


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
                                    src="${event.image}"
                                    alt="${event.name}"
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
                            ${event.brand || "OWL"}
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
                        ${event.name}
                    </h3>


                    <p class="event-card-date">

                        ${formatDate(
                            event.date
                        )}

                    </p>


                    ${

                        event.location

                            ? `

                                <p class="event-card-location">
                                    ${event.location}
                                </p>

                            `

                            : ""

                    }


                    ${

                        event.tagline

                            ? `

                                <p class="event-card-tagline">
                                    ${event.tagline}
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



        // =================================
        // COMPLETED EVENT HISTORY
        // =================================


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
        )
            .innerHTML = `

                <section class="events-section">

                    <h1>
                        Events Page Could Not Load
                    </h1>

                    <p class="empty-message">

                        There was a problem loading
                        the OWL events database.

                    </p>

                </section>

            `;

    }

}



loadEventsDirectory();
