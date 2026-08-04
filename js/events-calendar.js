(() => {

    "use strict";


    const monthLabel =
        document.getElementById(
            "owl-calendar-month"
        );


    const calendarGrid =
        document.getElementById(
            "owl-calendar-grid"
        );


    const previousButton =
        document.getElementById(
            "owl-calendar-previous"
        );


    const nextButton =
        document.getElementById(
            "owl-calendar-next"
        );


    if (
        !monthLabel
        ||
        !calendarGrid
        ||
        !previousButton
        ||
        !nextButton
    ) {

        return;

    }


    let monthIds =
        [];


    let selectedMonthIndex =
        0;


    let scheduledEvents =
        [];


    let nextUpcomingEventId =
        "";



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



    function getPeriodId(
        event
    ) {

        const calendar =
            getCalendar();


        if (
            calendar
            &&
            typeof calendar.getPeriodId ===
                "function"
        ) {

            return calendar.getPeriodId(
                event
            );

        }


        return String(
            event?.periodId || ""
        ).trim();

    }



    function getStage(
        event
    ) {

        const calendar =
            getCalendar();


        if (
            calendar
            &&
            typeof calendar.getStage ===
                "function"
        ) {

            return calendar.getStage(
                event
            );

        }


        return String(
            event?.stage || ""
        ).trim();

    }



    function getWeekNumber(
        event
    ) {

        const calendar =
            getCalendar();


        if (
            calendar
            &&
            typeof calendar.stageNumber ===
                "function"
        ) {

            return calendar.stageNumber(
                getStage(
                    event
                )
            );

        }


        const match =
            getStage(
                event
            ).match(
                /^week-([1-4])$/
            );


        return match
            ? Number(
                match[1]
            )
            : 0;

    }



    function formatMonth(
        periodId
    ) {

        const calendar =
            getCalendar();


        if (
            calendar
            &&
            typeof calendar.formatPeriod ===
                "function"
        ) {

            return calendar.formatPeriod(
                periodId
            );

        }


        return "OWL Schedule";

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



    function eventScheduleValue(
        event
    ) {

        const calendar =
            getCalendar();


        if (
            calendar
            &&
            typeof calendar.eventSortValue ===
                "function"
        ) {

            return calendar.eventSortValue(
                event
            );

        }


        return 0;

    }



    function eventSequence(
        event
    ) {

        const eventType =
            normalize(
                event?.eventType
            );


        const brand =
            normalize(
                event?.brand
            );


        if (
            eventType === "weekly"
            &&
            brand === "ascension"
        ) {

            return 1;

        }


        if (
            eventType === "weekly"
            &&
            brand === "revolt"
        ) {

            return 2;

        }


        if (
            eventType === "ppv"
        ) {

            return 3;

        }


        return 4;

    }



    function compareScheduledEvents(
        eventA,
        eventB
    ) {

        const scheduleDifference =

            eventScheduleValue(
                eventA
            )

            -

            eventScheduleValue(
                eventB
            );


        if (
            scheduleDifference !== 0
        ) {

            return scheduleDifference;

        }


        const sequenceDifference =

            eventSequence(
                eventA
            )

            -

            eventSequence(
                eventB
            );


        if (
            sequenceDifference !== 0
        ) {

            return sequenceDifference;

        }


        const orderDifference =

            Number(
                eventA?.order || 0
            )

            -

            Number(
                eventB?.order || 0
            );


        if (
            orderDifference !== 0
        ) {

            return orderDifference;

        }


        return String(
            eventA?.name || ""
        ).localeCompare(
            String(
                eventB?.name || ""
            )
        );

    }



    function brandClass(
        event
    ) {

        const brand =
            normalize(
                event?.brand
            );


        if (
            brand === "ascension"
        ) {

            return "calendar-brand-ascension";

        }


        if (
            brand === "revolt"
        ) {

            return "calendar-brand-revolt";

        }


        return "calendar-brand-owl";

    }



    function isNextUpcoming(
        event
    ) {

        return (

            String(
                event?.id || ""
            )

            ===

            nextUpcomingEventId

        );

    }



    function showSlot(
        event,
        fallbackBrand,
        dayLabel
    ) {

        if (!event) {

            return `

                <div class="owl-calendar-show-slot calendar-slot-empty">

                    <span class="owl-calendar-show-day">
                        ${escapeHtml(
                            dayLabel
                        )}
                    </span>

                    <strong>
                        ${escapeHtml(
                            fallbackBrand
                        )}
                    </strong>

                    <small>
                        Not scheduled
                    </small>

                </div>

            `;

        }


        return `

            <a
                class="owl-calendar-show-slot ${brandClass(
                    event
                )} ${
                    isNextUpcoming(
                        event
                    )
                        ? "calendar-next-up"
                        : ""
                }"
                href="event.html?id=${encodeURIComponent(
                    event.id
                )}"
            >

                ${
                    isNextUpcoming(
                        event
                    )

                        ? `
                            <span class="owl-calendar-next-badge">
                                NEXT UP
                            </span>
                        `

                        : ""
                }

                <span class="owl-calendar-show-day">
                    ${escapeHtml(
                        dayLabel
                    )}
                </span>

                <div class="owl-calendar-show-branding">

                    ${
                        event.image

                            ? `
                                <img
                                    src="${escapeHtml(
                                        event.image
                                    )}"
                                    alt="${escapeHtml(
                                        event.name
                                        ||
                                        event.brand
                                        ||
                                        fallbackBrand
                                    )}"
                                >
                            `

                            : `
                                <strong>
                                    ${escapeHtml(
                                        event.brand
                                        ||
                                        fallbackBrand
                                    )}
                                </strong>
                            `
                    }

                </div>

                <small>
                    ${escapeHtml(
                        formatEventSchedule(
                            event
                        )
                    )}
                </small>

            </a>

        `;

    }



    function ppvCard(
        event
    ) {

        if (!event) {

            return `

                <article class="owl-calendar-ppv calendar-slot-empty">

                    <span class="owl-calendar-card-label">
                        MONTHLY PPV
                    </span>

                    <div class="owl-calendar-ppv-placeholder">
                        OWL
                    </div>

                    <div class="owl-calendar-ppv-copy">

                        <strong>
                            PPV not scheduled
                        </strong>

                        <small>
                            Parliament Hall awaits its next major night.
                        </small>

                    </div>

                </article>

            `;

        }


        return `

            <a
                class="owl-calendar-ppv ${
                    isNextUpcoming(
                        event
                    )
                        ? "calendar-next-up"
                        : ""
                }"
                href="event.html?id=${encodeURIComponent(
                    event.id
                )}"
            >

                ${
                    isNextUpcoming(
                        event
                    )

                        ? `
                            <span class="owl-calendar-next-badge">
                                NEXT UP
                            </span>
                        `

                        : ""
                }

                <span class="owl-calendar-card-label">
                    MONTHLY PPV
                </span>

                <div class="owl-calendar-ppv-art">

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
                                <div class="owl-calendar-ppv-placeholder">
                                    OWL
                                </div>
                            `
                    }

                </div>

                <div class="owl-calendar-ppv-copy">

                    <strong>
                        ${escapeHtml(
                            event.name
                            ||
                            "OWL PPV"
                        )}
                    </strong>

                    <small>
                        ${escapeHtml(
                            formatEventSchedule(
                                event
                            )
                        )}
                    </small>

                    ${
                        event.location

                            ? `
                                <span>
                                    ${escapeHtml(
                                        event.location
                                    )}
                                </span>
                            `

                            : ""
                    }

                </div>

            </a>

        `;

    }



    function getWeeklyEvent(
        monthEvents,
        brand,
        weekNumber
    ) {

        return monthEvents.find(
            event =>

                normalize(
                    event.eventType
                ) === "weekly"

                &&

                normalize(
                    event.brand
                ) === normalize(
                    brand
                )

                &&

                getWeekNumber(
                    event
                ) === weekNumber
        ) || null;

    }



    function renderMonth() {

        if (
            monthIds.length === 0
        ) {

            monthLabel.textContent =
                "No Scheduled Month";


            calendarGrid.innerHTML = `

                <div class="owl-calendar-empty">
                    Add month-and-week OWL events to display the monthly calendar.
                </div>

            `;


            previousButton.disabled =
                true;


            nextButton.disabled =
                true;


            return;

        }


        const selectedMonth =
            monthIds[
                selectedMonthIndex
            ];


        const monthEvents =
            scheduledEvents

                .filter(
                    event =>

                        event.calendarPeriodId ===
                            selectedMonth
                )

                .sort(
                    compareScheduledEvents
                );


        const ppvEvent =
            monthEvents.find(
                event =>

                    normalize(
                        event.eventType
                    ) === "ppv"
            ) || null;


        monthLabel.textContent =
            formatMonth(
                selectedMonth
            );


        calendarGrid.innerHTML = `

            ${[1, 2, 3, 4]

                .map(
                    weekNumber => `

                        <article class="owl-calendar-week-card">

                            <div class="owl-calendar-week-heading">

                                <span>
                                    WEEK ${weekNumber}
                                </span>

                                <strong>
                                    OWL TV
                                </strong>

                            </div>

                            ${showSlot(
                                getWeeklyEvent(
                                    monthEvents,
                                    "Ascension",
                                    weekNumber
                                ),
                                "Ascension",
                                "TUESDAY"
                            )}

                            ${showSlot(
                                getWeeklyEvent(
                                    monthEvents,
                                    "Revolt",
                                    weekNumber
                                ),
                                "Revolt",
                                "WEDNESDAY"
                            )}

                        </article>

                    `
                )

                .join(
                    ""
                )}

            ${ppvCard(
                ppvEvent
            )}

        `;


        previousButton.disabled =
            selectedMonthIndex === 0;


        nextButton.disabled =
            selectedMonthIndex ===
                monthIds.length - 1;

    }



    async function loadCalendar() {

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
                    "Could not load the OWL calendar."
                );

            }


            const events =
                await response.json();


            scheduledEvents =
                Array.isArray(
                    events
                )

                    ? events

                        .map(
                            event => ({

                                ...event,

                                calendarPeriodId:
                                    getPeriodId(
                                        event
                                    ),

                                calendarStage:
                                    getStage(
                                        event
                                    )

                            })
                        )

                        .filter(
                            event =>

                                event.calendarPeriodId

                                &&

                                event.calendarStage
                        )

                    : [];


            monthIds = [

                ...new Set(

                    scheduledEvents.map(
                        event =>
                            event.calendarPeriodId
                    )

                )

            ]
                .sort();


            const nextUpcomingEvent =
                scheduledEvents

                    .filter(
                        event =>

                            normalize(
                                event.status
                            ) === "upcoming"
                    )

                    .sort(
                        compareScheduledEvents
                    )[0]

                || null;


            nextUpcomingEventId =
                nextUpcomingEvent

                    ? String(
                        nextUpcomingEvent.id || ""
                    )

                    : "";


            const firstUpcomingMonth =
                nextUpcomingEvent
                    ?.calendarPeriodId
                ||
                "";


            selectedMonthIndex =
                firstUpcomingMonth

                &&
                monthIds.includes(
                    firstUpcomingMonth
                )

                    ? monthIds.indexOf(
                        firstUpcomingMonth
                    )

                    : Math.max(
                        0,
                        monthIds.length - 1
                    );


            renderMonth();

        }


        catch (
            error
        ) {

            console.error(
                "Could not load OWL calendar:",
                error
            );


            monthLabel.textContent =
                "Calendar unavailable";


            calendarGrid.innerHTML = `

                <div class="owl-calendar-empty">
                    The OWL monthly schedule could not be loaded.
                </div>

            `;


            previousButton.disabled =
                true;


            nextButton.disabled =
                true;

        }

    }



    previousButton.addEventListener(
        "click",
        () => {

            if (
                selectedMonthIndex > 0
            ) {

                selectedMonthIndex -=
                    1;


                renderMonth();

            }

        }
    );



    nextButton.addEventListener(
        "click",
        () => {

            if (
                selectedMonthIndex <
                    monthIds.length - 1
            ) {

                selectedMonthIndex +=
                    1;


                renderMonth();

            }

        }
    );



    loadCalendar();

})();
