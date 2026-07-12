// =================================
// THE LANDSCAPE
// ANNUAL MAJOR EVENT CALENDAR
// =================================


(() => {


    "use strict";


    const calendarGrid =

        document.getElementById(
            "landscape-annual-event-calendar"
        );


    if (
        !calendarGrid
    ) {

        return;

    }


    const monthLabels = {

        "01":
            "JAN",

        "02":
            "FEB",

        "03":
            "MAR",

        "04":
            "APR",

        "05":
            "MAY",

        "06":
            "JUN",

        "07":
            "JUL",

        "08":
            "AUG",

        "09":
            "SEP",

        "10":
            "OCT",

        "11":
            "NOV",

        "12":
            "DEC"

    };


    const companyOrder = [

        "owl",
        "wwe",
        "aew",
        "tna",
        "roh",
        "nxt",
        "aaa",
        "cmll"

    ];



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



    function safeClassName(
        value
    ) {

        return normalize(
            value
        )
            .replace(
                /[^a-z0-9_-]+/g,
                "-"
            );

    }



    function renderEventTile(
        event,
        majorEventIds,
        flagshipEventId
    ) {

        const eventId =
            String(
                event.id || ""
            );


        const isBigFour =
            majorEventIds.has(
                eventId
            );


        const isFlagship =
            eventId ===
            flagshipEventId;


        const classNames = [

            "landscape-calendar-event"

        ];


        if (
            isBigFour
        ) {

            classNames.push(
                "is-big-four"
            );

        }


        if (
            isFlagship
        ) {

            classNames.push(
                "is-flagship"
            );

        }


        return `

            <article
                class="${classNames.join(" ")}"
            >


                <div class="landscape-calendar-event-topline">


                    <span class="landscape-calendar-month">

                        ${escapeHtml(
                            monthLabels[
                                event.month
                            ]

                            ||

                            event.month

                            ||

                            "—"
                        )}

                    </span>


                    ${

                        isFlagship

                            ? `

                                <span class="landscape-calendar-flagship-label">
                                    FLAGSHIP
                                </span>

                            `

                            : isBigFour

                                ? `

                                    <span
                                        class="landscape-calendar-big-four-mark"
                                        title="Big 4 event"
                                        aria-label="Big 4 event"
                                    >
                                        ◆
                                    </span>

                                `

                                : ""

                    }


                </div>


                <strong>

                    ${escapeHtml(
                        event.name ||
                        "Event TBA"
                    )}

                </strong>


            </article>

        `;

    }



    function renderCompanyCard(
        company,
        index
    ) {

        const events =

            Array.isArray(
                company.eventCalendar
            )

                ? [...company.eventCalendar]

                    .sort(
                        (
                            a,
                            b
                        ) =>

                            Number(
                                a.month || 0
                            )

                            -

                            Number(
                                b.month || 0
                            )
                    )

                : [];


        const majorEventIds =

            new Set(

                Array.isArray(
                    company.majorEventIds
                )

                    ? company.majorEventIds

                    : []

            );


        const flagshipEventId =

            String(
                company.flagshipEventId || ""
            );


        const companyId =

            safeClassName(
                company.id
            );


        const displayName =

            company.calendarName

            ||

            company.shortName

            ||

            company.name

            ||

            company.id

            ||

            "Company";


        return `

            <article
                class="landscape-calendar-company landscape-calendar-company--${companyId}"
            >


                <div class="landscape-calendar-company-heading">


                    <div>


                        <span>

                            CORE COMPANY
                            ${String(
                                index + 1
                            ).padStart(
                                2,
                                "0"
                            )}

                        </span>


                        <h3>

                            ${escapeHtml(
                                displayName
                            )}

                        </h3>


                    </div>


                    <small>

                        ${events.length}
                        MAJOR EVENTS

                    </small>


                </div>


                <div class="landscape-calendar-month-grid">


                    ${

                        events.length > 0

                            ? events

                                .map(
                                    event =>

                                        renderEventTile(
                                            event,
                                            majorEventIds,
                                            flagshipEventId
                                        )
                                )
                                .join(
                                    ""
                                )

                            : `

                                <p class="landscape-calendar-empty">
                                    No annual event calendar has been entered.
                                </p>

                            `

                    }


                </div>


            </article>

        `;

    }



    async function loadAnnualEventCalendar() {

        try {


            const response =

                await fetch(

                    "data/landscape/companies.json",

                    {
                        cache:
                            "no-store"
                    }

                );


            if (
                !response.ok
            ) {

                throw new Error(
                    "Could not load company event calendars."
                );

            }


            const data =

                await response.json();


            const companies =

                Array.isArray(
                    data
                )

                    ? data

                    : Array.isArray(
                        data.companies
                    )

                        ? data.companies

                        : [];


            const orderMap =

                new Map(

                    companyOrder.map(
                        (
                            companyId,
                            index
                        ) => [

                            companyId,
                            index

                        ]
                    )

                );


            const coreCompanies =

                companies

                    .filter(
                        company =>

                            normalize(
                                company.type
                            ) === "core"
                    )

                    .sort(
                        (
                            a,
                            b
                        ) => {

                            const aOrder =

                                orderMap.has(
                                    a.id
                                )

                                    ? orderMap.get(
                                        a.id
                                    )

                                    : 999;


                            const bOrder =

                                orderMap.has(
                                    b.id
                                )

                                    ? orderMap.get(
                                        b.id
                                    )

                                    : 999;


                            return aOrder - bOrder;

                        }
                    );


            if (
                coreCompanies.length === 0
            ) {

                calendarGrid.innerHTML = `

                    <div class="landscape-calendar-empty">
                        No core-company calendars are currently available.
                    </div>

                `;


                return;

            }


            calendarGrid.innerHTML =

                coreCompanies

                    .map(
                        renderCompanyCard
                    )

                    .join(
                        ""
                    );

        }


        catch (
            error
        ) {


            console.error(
                "Could not load Landscape annual event calendar:",
                error
            );


            calendarGrid.innerHTML = `

                <div class="landscape-calendar-empty">
                    The annual major-event calendar could not be loaded.
                </div>

            `;

        }

    }



    loadAnnualEventCalendar();


})();
