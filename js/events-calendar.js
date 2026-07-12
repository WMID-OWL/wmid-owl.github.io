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


    function dateValue(
        dateString
    ) {

        if (
            !dateString
        ) {

            return null;

        }


        const value =
            new Date(
                `${dateString}T00:00:00`
            );


        return Number.isNaN(
            value.getTime()
        )

            ? null

            : value;

    }


    function monthIdFromDate(
        dateString
    ) {

        const value =
            dateValue(
                dateString
            );


        if (
            !value
        ) {

            return "";

        }


        return `${value.getFullYear()}-${String(
            value.getMonth() + 1
        ).padStart(
            2,
            "0"
        )}`;

    }


    function formatMonth(
        monthId
    ) {

        const match =
            String(
                monthId || ""
            )
                .match(
                    /^(\d{4})-(\d{2})$/
                );


        if (
            !match
        ) {

            return "OWL Schedule";

        }


        return new Date(
            Number(
                match[1]
            ),
            Number(
                match[2]
            ) - 1,
            1
        )
            .toLocaleDateString(
                "en-US",
                {
                    month:
                        "long",

                    year:
                        "numeric"
                }
            );

    }


    function formatShortDate(
        dateString
    ) {

        const value =
            dateValue(
                dateString
            );


        if (
            !value
        ) {

            return "TBA";

        }


        return value.toLocaleDateString(
            "en-US",
            {
                month:
                    "short",

                day:
                    "numeric"
            }
        );

    }


    function formatFullDate(
        dateString
    ) {

        const value =
            dateValue(
                dateString
            );


        if (
            !value
        ) {

            return "Date TBA";

        }


        return value.toLocaleDateString(
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


    function showSlot(
        event,
        fallbackBrand,
        dayLabel
    ) {

        if (
            !event
        ) {

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
                )}"
                href="event.html?id=${encodeURIComponent(
                    event.id
                )}"
            >

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
                                        event.name ||
                                        event.brand ||
                                        fallbackBrand
                                    )}"
                                >
                            `

                            : `
                                <strong>
                                    ${escapeHtml(
                                        event.brand ||
                                        fallbackBrand
                                    )}
                                </strong>
                            `
                    }

                </div>

                <small>
                    ${escapeHtml(
                        formatShortDate(
                            event.date
                        )
                    )}
                </small>

            </a>

        `;

    }


    function ppvCard(
        event
    ) {

        if (
            !event
        ) {

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
                class="owl-calendar-ppv"
                href="event.html?id=${encodeURIComponent(
                    event.id
                )}"
            >

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
                            event.name ||
                            "OWL PPV"
                        )}
                    </strong>

                    <small>
                        ${escapeHtml(
                            formatFullDate(
                                event.date
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


    function renderMonth() {

        if (
            monthIds.length === 0
        ) {

            monthLabel.textContent =
                "No Scheduled Month";


            calendarGrid.innerHTML = `

                <div class="owl-calendar-empty">
                    Add dated OWL events to display the monthly calendar.
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

                        event.calendarMonthId ===
                        selectedMonth
                )

                .sort(
                    (a, b) =>

                        dateValue(
                            a.date
                        )

                        -

                        dateValue(
                            b.date
                        )
                );


        const ascensionEvents =
            monthEvents.filter(
                event =>

                    normalize(
                        event.eventType
                    ) === "weekly"

                    &&

                    normalize(
                        event.brand
                    ) === "ascension"
            );


        const revoltEvents =
            monthEvents.filter(
                event =>

                    normalize(
                        event.eventType
                    ) === "weekly"

                    &&

                    normalize(
                        event.brand
                    ) === "revolt"
            );


        const ppvEvent =
            monthEvents.find(
                event =>

                    normalize(
                        event.eventType
                    ) === "ppv"
            )

            ||

            null;


        monthLabel.textContent =
            formatMonth(
                selectedMonth
            );


        calendarGrid.innerHTML = `

            ${[0, 1, 2, 3]

                .map(
                    index => `

                        <article class="owl-calendar-week-card">

                            <div class="owl-calendar-week-heading">

                                <span>
                                    WEEK ${index + 1}
                                </span>

                                <strong>
                                    OWL TV
                                </strong>

                            </div>

                            ${showSlot(
                                ascensionEvents[index],
                                "Ascension",
                                "TUESDAY"
                            )}

                            ${showSlot(
                                revoltEvents[index],
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

                                calendarMonthId:
                                    monthIdFromDate(
                                        event.date
                                    )

                            })
                        )

                        .filter(
                            event =>

                                event.calendarMonthId
                        )

                    : [];


            monthIds =
                [

                    ...new Set(

                        scheduledEvents.map(
                            event =>

                                event.calendarMonthId
                        )

                    )

                ]
                    .sort();


            const firstUpcomingMonth =
                scheduledEvents

                    .filter(
                        event =>

                            normalize(
                                event.status
                            ) === "upcoming"
                    )

                    .sort(
                        (a, b) =>

                            dateValue(
                                a.date
                            )

                            -

                            dateValue(
                                b.date
                            )
                    )

                    .map(
                        event =>

                            event.calendarMonthId
                    )
                    [0];


            selectedMonthIndex =
                firstUpcomingMonth

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
