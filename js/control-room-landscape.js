// =================================
// OWL CONTROL ROOM
// THE LANDSCAPE COMMAND CENTER
// =================================


// =================================
// ELEMENTS
// =================================


const crLandscapeEls = {


    status:

        document.getElementById(
            "cr-landscape-status"
        ),


    companyCount:

        document.getElementById(
            "cr-landscape-company-count"
        ),


    showCount:

        document.getElementById(
            "cr-landscape-show-count"
        ),


    eventCount:

        document.getElementById(
            "cr-landscape-event-count"
        ),


    latestPeriod:

        document.getElementById(
            "cr-landscape-latest-period"
        ),


    weeklySchedule:

        document.getElementById(
            "cr-landscape-weekly-schedule"
        ),


    monthlyCycle:

        document.getElementById(
            "cr-landscape-monthly-cycle"
        ),


    archiveSummary:

        document.getElementById(
            "cr-landscape-archive-summary"
        )

};



// =================================
// STATE
// =================================


let crLandscapeData = {


    companies:
        [],


    shows:
        [],


    events:
        [],


    calendar:
        null,


    archive:
        null

};



// =================================
// STATUS
// =================================


function crLandscapeSetStatus(
    value
) {


    if (
        crLandscapeEls.status
    ) {


        crLandscapeEls
            .status
            .textContent =
                value;

    }

}



// =================================
// HTML SAFETY
// =================================


function crLandscapeEscapeHtml(
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



// =================================
// READ LANDSCAPE JSON
// =================================


async function crLandscapeReadJson(
    fileName
) {


    if (
        !owlRepositoryHandle
    ) {


        throw new Error(
            "OWL repository is not connected."
        );

    }


    const dataDirectory =

        await owlRepositoryHandle
            .getDirectoryHandle(
                "data"
            );


    const landscapeDirectory =

        await dataDirectory
            .getDirectoryHandle(
                "landscape"
            );


    const fileHandle =

        await landscapeDirectory
            .getFileHandle(
                fileName
            );


    const file =

        await fileHandle
            .getFile();


    const text =

        await file.text();


    return JSON.parse(
        text
    );

}



// =================================
// PERIOD LABEL
// =================================


function crLandscapePeriodLabel(
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

        crLandscapeData
            .calendar
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



// =================================
// SUMMARY
// =================================


function crLandscapeRenderSummary() {


    crLandscapeEls
        .companyCount
        .textContent =

            String(
                crLandscapeData
                    .companies
                    .length
            );


    crLandscapeEls
        .showCount
        .textContent =

            String(
                crLandscapeData
                    .shows
                    .length
            );


    crLandscapeEls
        .eventCount
        .textContent =

            String(
                crLandscapeData
                    .events
                    .length
            );


    const latestPeriodId =

        crLandscapeData
            .archive
            ?.latestPeriodId

        ||

        crLandscapeData
            .events

            .map(
                event =>
                    event.periodId
            )

            .filter(
                Boolean
            )

            .sort()

            .at(
                -1
            )

        ||

        "";


    crLandscapeEls
        .latestPeriod
        .textContent =

            crLandscapePeriodLabel(
                latestPeriodId
            );

}



// =================================
// WEEKLY SCHEDULE
// =================================


function crLandscapeRenderSchedule() {


    const shows =

        [...crLandscapeData.shows]

            .sort(

                (
                    a,
                    b
                ) => {


                    const dayDifference =

                        Number(
                            a.dayOrder || 0
                        )

                        -

                        Number(
                            b.dayOrder || 0
                        );


                    if (
                        dayDifference !== 0
                    ) {


                        return dayDifference;

                    }


                    return (

                        Number(
                            a.showOrder || 0
                        )

                        -

                        Number(
                            b.showOrder || 0
                        )

                    );

                }

            );


    crLandscapeEls
        .weeklySchedule
        .innerHTML =
            "";


    const dayGroups =
        new Map();


    shows.forEach(

        show => {


            const day =

                show.day

                ||

                "Unscheduled";


            if (
                !dayGroups.has(
                    day
                )
            ) {


                dayGroups.set(
                    day,
                    []
                );

            }


            dayGroups
                .get(
                    day
                )
                .push(
                    show
                );

        }

    );


    dayGroups.forEach(

        (
            dayShows,
            day
        ) => {


            const card =

                document.createElement(
                    "article"
                );


            card.className =
                "cr-landscape-day-card";


            card.innerHTML = `

                <span class="cr-landscape-day-name">

                    ${crLandscapeEscapeHtml(
                        day
                    )}

                </span>


                <div class="cr-landscape-show-list">

                    ${dayShows

                        .map(

                            show => `

                                <strong>

                                    ${crLandscapeEscapeHtml(
                                        show.name
                                    )}

                                </strong>

                            `

                        )

                        .join(
                            ""
                        )}

                </div>

            `;


            crLandscapeEls
                .weeklySchedule
                .appendChild(
                    card
                );

        }

    );

}



// =================================
// MONTHLY CYCLE
// =================================


function crLandscapeRenderCycle() {


    crLandscapeEls
        .monthlyCycle
        .innerHTML =
            "";


    const weeklyStages =

        Array.isArray(
            crLandscapeData
                .calendar
                ?.weeklyStages
        )

            ? [

                ...crLandscapeData
                    .calendar
                    .weeklyStages

            ]

            : [];


    weeklyStages

        .sort(

            (
                a,
                b
            ) =>

                Number(
                    a.order || 0
                )

                -

                Number(
                    b.order || 0
                )

        )

        .forEach(

            stage => {


                const card =

                    document.createElement(
                        "article"
                    );


                card.className =
                    "cr-landscape-cycle-card";


                card.innerHTML = `

                    <span>
                        REGULAR CYCLE
                    </span>


                    <strong>

                        ${crLandscapeEscapeHtml(
                            stage.label
                        )}

                    </strong>


                    <small>
                        11 weekly shows
                    </small>

                `;


                crLandscapeEls
                    .monthlyCycle
                    .appendChild(
                        card
                    );

            }

        );


    const finale =

        crLandscapeData
            .calendar
            ?.monthlyFinale;


    if (
        finale
    ) {


        const card =

            document.createElement(
                "article"
            );


        card.className =

            "cr-landscape-cycle-card "
            +

            "cr-landscape-cycle-finale";


        card.innerHTML = `

            <span>
                MONTHLY FINALE
            </span>


            <strong>

                ${crLandscapeEscapeHtml(
                    finale.label
                )}

            </strong>


            <small>

                ${Number(
                    finale.eventCount || 0
                )}
                major events

            </small>

        `;


        crLandscapeEls
            .monthlyCycle
            .appendChild(
                card
            );

    }

}


// =================================
// STAGE LABEL
// =================================


function crLandscapeStageLabel(
    stageId
) {


    const weeklyStages =

        Array.isArray(
            crLandscapeData
                .calendar
                ?.weeklyStages
        )

            ? crLandscapeData
                .calendar
                .weeklyStages

            : [];


    const weeklyMatch =

        weeklyStages.find(

            stage =>

                stage.id ===
                stageId

        );


    if (
        weeklyMatch
    ) {


        return weeklyMatch.label;

    }


    if (

        crLandscapeData
            .calendar
            ?.monthlyFinale
            ?.id

        ===

        stageId

    ) {


        return crLandscapeData
            .calendar
            .monthlyFinale
            .label;

    }


    return stageId || "";

}



// =================================
// RECORDED EVENTS
// =================================


function crLandscapeRenderRecordedEvents() {


    if (
        !crLandscapeEls.recordedEvents
    ) {


        return;

    }


    const events =

        [...crLandscapeData.events]

            .sort(

                (
                    a,
                    b
                ) => {


                    const periodDifference =

                        String(
                            b.periodId || ""
                        )

                            .localeCompare(

                                String(
                                    a.periodId || ""
                                )

                            );


                    if (
                        periodDifference !== 0
                    ) {


                        return periodDifference;

                    }


                    return String(
                        b.id || ""
                    )

                        .localeCompare(

                            String(
                                a.id || ""
                            )

                        );

                }

            );


    if (
        events.length === 0
    ) {


        crLandscapeEls
            .recordedEvents
            .innerHTML = `

                <p class="cr-landscape-entry-empty">

                    No Landscape events have been recorded yet.

                </p>

            `;


        return;

    }


    crLandscapeEls
        .recordedEvents
        .innerHTML =

            events

                .slice(
                    0,
                    20
                )

                .map(

                    event => {


                        const company =

                            crLandscapeData
                                .companies

                                .find(

                                    item =>

                                        item.id ===
                                        event.companyId

                                );


                        const show =

                            crLandscapeData
                                .shows

                                .find(

                                    item =>

                                        item.id ===
                                        event.showId

                                );


                        const eventTitle =

                            event.eventName

                            ||

                            show?.name

                            ||

                            "Untitled Landscape Event";


                        const matches =

                            Array.isArray(
                                event.matches
                            )

                                ? event.matches

                                : [];


                        const segments =

                            Array.isArray(
                                event.segments
                            )

                                ? event.segments

                                : [];


                        const locationText =

                            [

                                event.location?.city,
                                event.location?.region,
                                event.location?.country

                            ]

                                .filter(
                                    Boolean
                                )

                                .join(
                                    ", "
                                );


                        const matchHtml =

                            matches.length

                                ? matches

                                    .map(

                                        match => `

                                            <article class="cr-landscape-event-result-row">


                                                <div>


                                                    <span>
                                                        MATCH
                                                    </span>


                                                    <strong>

                                                        ${crLandscapeEscapeHtml(
                                                            match.resultText
                                                        )}

                                                    </strong>


                                                    ${

                                                        match.storyContext

                                                            ? `

                                                                <small>

                                                                    ${crLandscapeEscapeHtml(
                                                                        match.storyContext
                                                                    )}

                                                                </small>

                                                            `

                                                            : ""

                                                    }


                                                </div>



                                                <strong>

                                                    ${

                                                        match.rating
                                                        ??
                                                        "—"

                                                    }
                                                    ★

                                                </strong>


                                            </article>

                                        `

                                    )

                                    .join(
                                        ""
                                    )

                                : `

                                    <p class="cr-landscape-event-none">

                                        No matches recorded.

                                    </p>

                                `;


                        const segmentHtml =

                            segments.length

                                ? segments

                                    .map(

                                        segment => `

                                            <article class="cr-landscape-event-result-row">


                                                <div>


                                                    <span>
                                                        SEGMENT
                                                    </span>


                                                    <strong>

                                                        ${crLandscapeEscapeHtml(

                                                            segment.segmentType

                                                            ||

                                                            "Segment"

                                                        )}

                                                    </strong>


                                                    <small>

                                                        ${crLandscapeEscapeHtml(
                                                            segment.summary
                                                        )}

                                                    </small>


                                                </div>



                                                <strong>

                                                    ${

                                                        segment.rating
                                                        ??
                                                        "—"

                                                    }
                                                    ★

                                                </strong>


                                            </article>

                                        `

                                    )

                                    .join(
                                        ""
                                    )

                                : "";


                        return `

                            <details class="cr-landscape-recorded-event">


                                <summary>


                                    <div>


                                        <span>

                                            ${crLandscapeEscapeHtml(

                                                company?.name

                                                ||

                                                event.companyId

                                            )}

                                            ·

                                            ${crLandscapeEscapeHtml(

                                                crLandscapePeriodLabel(
                                                    event.periodId
                                                )

                                            )}

                                            ·

                                            ${crLandscapeEscapeHtml(

                                                crLandscapeStageLabel(
                                                    event.stage
                                                )

                                            )}

                                        </span>


                                        <strong>

                                            ${crLandscapeEscapeHtml(
                                                eventTitle
                                            )}

                                        </strong>


                                        <small>

                                            ${

                                                locationText

                                                    ? crLandscapeEscapeHtml(
                                                        locationText
                                                    )

                                                    : "Location unavailable"

                                            }

                                            ·

                                            ${matches.length}
                                            matches

                                            ·

                                            ${segments.length}
                                            segments

                                        </small>


                                    </div>



                                    <strong class="cr-landscape-event-rating">

                                        ${

                                            event.overallRating
                                            ??
                                            "—"

                                        }
                                        ★

                                    </strong>


                                </summary>



                                <div class="cr-landscape-recorded-event-body">


                                    <div class="cr-landscape-event-meta">


                                        <span>

                                            BOOKING STYLE:
                                            ${crLandscapeEscapeHtml(

                                                event.bookingStyle

                                                ||

                                                "—"

                                            )}

                                        </span>


                                        ${

                                            event.location?.venue

                                                ? `

                                                    <span>

                                                        VENUE:
                                                        ${crLandscapeEscapeHtml(
                                                            event.location.venue
                                                        )}

                                                    </span>

                                                `

                                                : ""

                                        }


                                    </div>



                                    <div class="cr-landscape-event-results">

                                        ${matchHtml}

                                        ${segmentHtml}

                                    </div>


                                    ${

                                        event.universeNotes

                                            ? `

                                                <div class="cr-landscape-event-notes">


                                                    <span>
                                                        UNIVERSE NOTES
                                                    </span>


                                                    <p>

                                                        ${crLandscapeEscapeHtml(
                                                            event.universeNotes
                                                        )}

                                                    </p>


                                                </div>

                                            `

                                            : ""

                                    }


                                </div>


                            </details>

                        `;

                    }

                )

                .join(
                    ""
                );

}

// =================================
// ARCHIVE
// =================================


function crLandscapeRenderArchive() {


    const periods =

        Array.isArray(
            crLandscapeData
                .archive
                ?.periods
        )

            ? crLandscapeData
                .archive
                .periods

            : [];


    if (
        !periods.length
    ) {


        crLandscapeEls
            .archiveSummary
            .innerHTML = `

                <div class="cr-landscape-archive-empty">

                    <strong>
                        THE LANDSCAPE IS READY
                    </strong>


                    <p>

                        No show results have been recorded yet.
                        The first saved JoW result will begin
                        Landscape history.

                    </p>

                </div>

            `;


        return;

    }


    const ordered =

        [...periods]

            .sort(

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


    crLandscapeEls
        .archiveSummary
        .innerHTML =

            ordered

                .slice(
                    0,
                    6
                )

                .map(

                    period => `

                        <article class="cr-landscape-period-row">


                            <div>

                                <span>
                                    PERIOD
                                </span>


                                <strong>

                                    ${crLandscapeEscapeHtml(

                                        period.label

                                        ||

                                        crLandscapePeriodLabel(
                                            period.id
                                        )

                                    )}

                                </strong>

                            </div>



                            <div class="cr-landscape-period-state">


                                <span>

                                    ${

                                        period.weeklyShowsComplete

                                            ? "WEEKLY COMPLETE"

                                            : "WEEKLY ACTIVE"

                                    }

                                </span>


                                <span>

                                    ${

                                        period.showdownSaturdayComplete

                                            ? "SHOWDOWN COMPLETE"

                                            : "SHOWDOWN PENDING"

                                    }

                                </span>


                            </div>


                        </article>

                    `

                )

                .join(
                    ""
                );

}



// =================================
// RENDER ALL
// =================================


function crLandscapeRenderAll() {


    crLandscapeRenderSummary();

    crLandscapeRenderRecordedEvents();

    crLandscapeRenderSchedule();

    crLandscapeRenderCycle();

    crLandscapeRenderArchive();

}



// =================================
// LOAD
// =================================


async function crLandscapeLoad() {


    if (
        typeof owlRepositoryHandle
        ===
        "undefined"

        ||

        !owlRepositoryHandle
    ) {


        return;

    }


    try {


        crLandscapeSetStatus(
            "LOADING"
        );


        const [

            companiesData,
            showsData,
            eventsData,
            calendarData,
            archiveData

        ] =

            await Promise.all([

                crLandscapeReadJson(
                    "companies.json"
                ),

                crLandscapeReadJson(
                    "shows.json"
                ),

                crLandscapeReadJson(
                    "events.json"
                ),

                crLandscapeReadJson(
                    "calendar-config.json"
                ),

                crLandscapeReadJson(
                    "archive-index.json"
                )

            ]);


        crLandscapeData = {


            companies:

                Array.isArray(
                    companiesData.companies
                )

                    ? companiesData.companies

                    : [],


            shows:

                Array.isArray(
                    showsData.shows
                )

                    ? showsData.shows

                    : [],


            events:

                Array.isArray(
                    eventsData.events
                )

                    ? eventsData.events

                    : [],


            calendar:

                calendarData

                ||

                null,


            archive:

                archiveData

                ||

                null

        };


        crLandscapeRenderAll();


        crLandscapeSetStatus(
            "READY"
        );

    }


    catch (
        error
    ) {


        console.error(

            "Could not load Landscape Control Room data:",

            error

        );


        crLandscapeSetStatus(
            "LOAD FAILED"
        );


        crLandscapeEls
            .archiveSummary
            .innerHTML = `

                <div class="cr-landscape-archive-empty">

                    <strong>
                        LANDSCAPE DATA COULD NOT LOAD
                    </strong>


                    <p>

                        ${crLandscapeEscapeHtml(

                            error.message

                            ||

                            "Unknown Landscape data error."

                        )}

                    </p>

                </div>

            `;

    }

}



// =================================
// REPOSITORY DATA EVENT
// =================================


window.addEventListener(

    "owl-control-room-data-loaded",

    crLandscapeLoad

);



// =================================
// SAFETY INITIALIZATION
// =================================


try {


    if (

        typeof owlRepositoryHandle
        !==
        "undefined"

        &&

        owlRepositoryHandle

    ) {


        crLandscapeLoad();

    }


}


catch (
    error
) {


    console.warn(

        "Landscape Control Room waiting for repository connection.",

        error

    );

}
