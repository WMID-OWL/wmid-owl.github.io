// =================================
// OWL CONTROL ROOM
// LANDSCAPE SHOW RECORDER
// =================================


// =================================
// ELEMENTS
// =================================


const crLandscapeEntryEls = {


    year:

        document.getElementById(
            "cr-landscape-entry-year"
        ),


    month:

        document.getElementById(
            "cr-landscape-entry-month"
        ),


    stage:

        document.getElementById(
            "cr-landscape-entry-stage"
        ),


    company:

        document.getElementById(
            "cr-landscape-entry-company"
        ),


    showWrap:

        document.getElementById(
            "cr-landscape-entry-show-wrap"
        ),


    show:

        document.getElementById(
            "cr-landscape-entry-show"
        ),


    eventNameWrap:

        document.getElementById(
            "cr-landscape-entry-event-name-wrap"
        ),


    eventName:

        document.getElementById(
            "cr-landscape-entry-event-name"
        ),


    bookingStyle:

        document.getElementById(
            "cr-landscape-entry-booking-style"
        ),


    rating:

        document.getElementById(
            "cr-landscape-entry-rating"
        ),


        notes:

        document.getElementById(
            "cr-landscape-entry-notes"
        ),


    location:

        document.getElementById(
            "cr-landscape-entry-location"
        ),


    locationDetail:

        document.getElementById(
            "cr-landscape-entry-location-detail"
        ),


    generateLocation:

        document.getElementById(
            "cr-landscape-generate-location"
        ),


    addMatch:

        document.getElementById(
            "cr-landscape-add-match"
        ),


    addSegment:

        document.getElementById(
            "cr-landscape-add-segment"
        ),


    items:

        document.getElementById(
            "cr-landscape-entry-items"
        ),


    empty:

        document.getElementById(
            "cr-landscape-entry-empty"
        ),


    save:

        document.getElementById(
            "cr-landscape-save-event"
        ),


    status:

        document.getElementById(
            "cr-landscape-entry-status"
        )

};



// =================================
// STATE
// =================================


let crLandscapeEntryData = {


    companies:
        [],


    shows:
        [],


    calendar:
        null

};


let crLandscapeEntryItemCounter =
    0;


let crLandscapeLocationRules =
    null;


let crLandscapeGeneratedLocation =
    null;



// =================================
// STATUS
// =================================


function crLandscapeEntrySetStatus(
    value
) {


    crLandscapeEntryEls
        .status
        .textContent =
            value;

}



// =================================
// ESCAPE HTML
// =================================


function crLandscapeEntryEscapeHtml(
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
// SLUG
// =================================


function crLandscapeEntrySlug(
    value
) {


    return String(
        value || ""
    )

        .toLowerCase()

        .trim()

        .replace(
            /[^a-z0-9]+/g,
            "-"
        )

        .replace(
            /^-|-$/g,
            ""
        );

}



// =================================
// READ JSON
// =================================


async function crLandscapeEntryReadJson(
    fileName
) {


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


    return JSON.parse(

        await file.text()

    );

}



// =================================
// WRITE JSON
// =================================


async function crLandscapeEntryWriteJson(
    fileName,
    data
) {


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


    const writable =

        await fileHandle
            .createWritable();


    await writable.write(

        `${JSON.stringify(

            data,

            null,

            2

        )}\n`

    );


    await writable.close();

}



// =================================
// MONTH LABEL
// =================================


function crLandscapeEntryPeriodLabel(
    periodId
) {


    const [

        year,
        monthId

    ] =

        String(
            periodId
        )
            .split(
                "-"
            );


    const month =

        crLandscapeEntryData
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
// BUILD SELECTS
// =================================


function crLandscapeEntryBuildSelects() {


    const calendar =

        crLandscapeEntryData.calendar;


    crLandscapeEntryEls
        .month
        .innerHTML =

            calendar
                .months

                .map(

                    month => `

                        <option value="${

                            crLandscapeEntryEscapeHtml(
                                month.id
                            )

                        }">

                            ${crLandscapeEntryEscapeHtml(
                                month.name
                            )}

                        </option>

                    `

                )

                .join(
                    ""
                );


    const stages = [

        ...calendar.weeklyStages,

        calendar.monthlyFinale

    ];


    crLandscapeEntryEls
        .stage
        .innerHTML =

            stages

                .map(

                    stage => `

                        <option value="${

                            crLandscapeEntryEscapeHtml(
                                stage.id
                            )

                        }">

                            ${crLandscapeEntryEscapeHtml(
                                stage.label
                            )}

                        </option>

                    `

                )

                .join(
                    ""
                );


    const externalCompanies =

        crLandscapeEntryData
            .companies

            .filter(

                company =>

                    company.id !==
                    "owl"

            );


    crLandscapeEntryEls
        .company
        .innerHTML =

            externalCompanies

                .map(

                    company => `

                        <option value="${

                            crLandscapeEntryEscapeHtml(
                                company.id
                            )

                        }">

                            ${crLandscapeEntryEscapeHtml(
                                company.name
                            )}

                        </option>

                    `

                )

                .join(
                    ""
                );


    crLandscapeEntryUpdateShows();

    crLandscapeEntryUpdateMode();

}



// =================================
// UPDATE WEEKLY SHOW OPTIONS
// =================================


function crLandscapeEntryUpdateShows() {


    const companyId =

        crLandscapeEntryEls
            .company
            .value;


    const shows =

        crLandscapeEntryData
            .shows

            .filter(

                show =>

                    show.companyId ===
                    companyId

            );


    crLandscapeEntryEls
        .show
        .innerHTML =

            shows

                .map(

                    show => `

                        <option value="${

                            crLandscapeEntryEscapeHtml(
                                show.id
                            )

                        }">

                            ${crLandscapeEntryEscapeHtml(
                                show.name
                            )}

                        </option>

                    `

                )

                .join(
                    ""
                );

}



// =================================
// WEEKLY / MAJOR EVENT MODE
// =================================


function crLandscapeEntryUpdateMode() {


    const isMajorEvent =

        crLandscapeEntryEls
            .stage
            .value

        ===

        "showdown-saturday";


    crLandscapeEntryEls
        .showWrap
        .hidden =
            isMajorEvent;


    crLandscapeEntryEls
        .eventNameWrap
        .hidden =
            !isMajorEvent;

}


// =================================
// LOCATION HELPERS
// =================================


function crLandscapeEntryRandomItem(
    items
) {


    if (
        !Array.isArray(
            items
        )

        ||

        items.length === 0
    ) {


        return null;

    }


    return items[

        Math.floor(

            Math.random()
            *
            items.length

        )

    ];

}



// =================================
// SAME SIMULATION DAY
// =================================


function crLandscapeEntrySameSimulationDay(
    event,
    periodId,
    stageId,
    selectedShow
) {


    if (
        event.periodId !==
        periodId

        ||

        event.stage !==
        stageId
    ) {


        return false;

    }


    if (
        stageId ===
        "showdown-saturday"
    ) {


        return (
            event.eventType ===
            "major-event"
        );

    }


    if (
        event.eventType !==
        "weekly"
    ) {


        return false;

    }


    const eventShow =

        crLandscapeEntryData
            .shows

            .find(

                show =>

                    show.id ===
                    event.showId

            );


    return (

        Number(
            eventShow?.dayOrder || 0
        )

        ===

        Number(
            selectedShow?.dayOrder || 0
        )

    );

}



// =================================
// LOCATION KEY
// =================================


function crLandscapeEntryLocationKey(
    location
) {


    return [

        location?.city || "",
        location?.region || "",
        location?.country || ""

    ]

        .join(
            "|"
        )

        .toLowerCase();

}



// =================================
// GET OCCUPIED CITIES
// =================================


function crLandscapeEntryOccupiedCities(
    events,
    periodId,
    stageId,
    selectedShow
) {


    return new Set(

        events

            .filter(

                event =>

                    crLandscapeEntrySameSimulationDay(

                        event,
                        periodId,
                        stageId,
                        selectedShow

                    )

            )

            .map(

                event =>

                    crLandscapeEntryLocationKey(
                        event.location
                    )

            )

            .filter(
                Boolean
            )

    );

}



// =================================
// FORMAT LOCATION
// =================================


function crLandscapeEntryFormatLocation(
    location
) {


    if (
        !location
    ) {


        return "Not generated";

    }


    return [

        location.city,
        location.region,
        location.country

    ]

        .filter(
            Boolean
        )

        .join(
            ", "
        );

}



// =================================
// RENDER LOCATION
// =================================


function crLandscapeEntryRenderLocation() {


    if (
        !crLandscapeGeneratedLocation
    ) {


        crLandscapeEntryEls
            .location
            .textContent =
                "Not generated";


        crLandscapeEntryEls
            .locationDetail
            .textContent =

                "Generate a canon location before saving.";


        return;

    }


    crLandscapeEntryEls
        .location
        .textContent =

            crLandscapeEntryFormatLocation(
                crLandscapeGeneratedLocation
            );


    crLandscapeEntryEls
        .locationDetail
        .textContent =

            crLandscapeGeneratedLocation.venue

                ? crLandscapeGeneratedLocation.venue

                : "City assignment";

}



// =================================
// RESET GENERATED LOCATION
// =================================


function crLandscapeEntryResetLocation() {


    crLandscapeGeneratedLocation =
        null;


    crLandscapeEntryRenderLocation();

}



// =================================
// WEEKLY SIBLING CITY
// =================================


function crLandscapeEntrySiblingLocation(
    events,
    periodId,
    stageId,
    siblingShowId
) {


    return events

        .find(

            event =>

                event.periodId ===
                periodId

                &&

                event.stage ===
                stageId

                &&

                event.showId ===
                siblingShowId

        )

        ?.location

        ||

        null;

}



// =================================
// GENERATE LOCATION
// =================================


async function crLandscapeEntryGenerateLocation() {


    try {


        crLandscapeEntrySetStatus(
            "GENERATING LOCATION"
        );


        const stageId =

            crLandscapeEntryEls
                .stage
                .value;


        const eventType =

            stageId ===
            "showdown-saturday"

                ? "major-event"

                : "weekly";


        const year =

            String(
                crLandscapeEntryEls
                    .year
                    .value
            );


        const monthId =

            crLandscapeEntryEls
                .month
                .value;


        const periodId =

            `${year}-${monthId}`;


        const companyId =

            crLandscapeEntryEls
                .company
                .value;


        const selectedShow =

            crLandscapeEntryData
                .shows

                .find(

                    show =>

                        show.id ===
                        crLandscapeEntryEls
                            .show
                            .value

                );


        const eventsData =

            await crLandscapeEntryReadJson(
                "events.json"
            );


        const events =

            Array.isArray(
                eventsData.events
            )

                ? eventsData.events

                : [];


        const occupiedCities =

            crLandscapeEntryOccupiedCities(

                events,
                periodId,
                stageId,
                selectedShow

            );


        let rule =
            null;


        if (
            eventType ===
            "major-event"
        ) {


            rule =

                crLandscapeLocationRules
                    ?.majorEventRules
                    ?.[companyId]

                ||

                null;

        }


        else {


            rule =

                crLandscapeLocationRules
                    ?.showRules
                    ?.[selectedShow?.id]

                ||

                null;

        }


        if (
            !rule
        ) {


            throw new Error(
                "No location rule exists for this show."
            );

        }


        if (
            rule.mode ===
            "fixed"
        ) {


            crLandscapeGeneratedLocation = {

                venue:
                    rule.venue || "",

                city:
                    rule.city || "",

                region:
                    rule.region || "",

                country:
                    rule.country || ""

            };


            crLandscapeEntryRenderLocation();


            crLandscapeEntrySetStatus(
                "LOCATION READY"
            );


            return;

        }


        let candidatePool =
            [];


        if (
            rule.mode ===
            "traveling"
        ) {


            candidatePool =

                [

                    ...(
                        crLandscapeLocationRules
                            ?.travelingCityPool

                        ||

                        []
                    )

                ];


            if (

                eventType ===
                "weekly"

                &&

                rule.weeklySiblingShowId

            ) {


                const siblingLocation =

                    crLandscapeEntrySiblingLocation(

                        events,
                        periodId,
                        stageId,
                        rule.weeklySiblingShowId

                    );


                if (

                    siblingLocation

                    &&

                    Math.random()

                    <

                    Number(
                        rule.siblingCityReuseChance || 0
                    )

                ) {


                    candidatePool.unshift(
                        siblingLocation
                    );

                }


                else {


                    candidatePool =

                        candidatePool.filter(

                            location =>

                                crLandscapeEntryLocationKey(
                                    location
                                )

                                !==

                                crLandscapeEntryLocationKey(
                                    siblingLocation
                                )

                        );

                }

            }

        }


        if (
            rule.mode ===
            "venue-pool"
        ) {


            const showRule =

                eventType ===
                "major-event"

                    ? crLandscapeLocationRules
                        ?.showRules
                        ?.[

                            companyId === "cmll"

                                ? "cmll-super-viernes"

                                : "aaa-lucha-libre"

                        ]

                    : rule;


            candidatePool =

                [

                    ...(
                        showRule?.venues

                        ||

                        []
                    )

                ];

        }


        const availablePool =

            candidatePool

                .filter(

                    location =>

                        !occupiedCities.has(

                            crLandscapeEntryLocationKey(
                                location
                            )

                        )

                );


        if (
            availablePool.length === 0
        ) {


            throw new Error(

                "No valid unused city is available for this simulation day."

            );

        }


        crLandscapeGeneratedLocation =

            structuredClone(

                crLandscapeEntryRandomItem(
                    availablePool
                )

            );


        crLandscapeEntryRenderLocation();


        crLandscapeEntrySetStatus(
            "LOCATION READY"
        );

    }


    catch (
        error
    ) {


        console.error(

            "Could not generate Landscape location:",

            error

        );


        crLandscapeEntrySetStatus(

            error.message

            ||

            "LOCATION FAILED"

        );

    }

}

// =================================
// REFRESH EMPTY STATE
// =================================


function crLandscapeEntryRefreshEmptyState() {


    const itemCount =

        crLandscapeEntryEls
            .items

            .querySelectorAll(
                ".cr-landscape-content-item"
            )
            .length;


    crLandscapeEntryEls
        .empty
        .hidden =

            itemCount > 0;

}



// =================================
// REMOVE ITEM
// =================================


function crLandscapeEntryRemoveItem(
    item
) {


    item.remove();

    crLandscapeEntryRefreshEmptyState();

}



// =================================
// ADD MATCH
// =================================


function crLandscapeEntryAddMatch() {


    crLandscapeEntryItemCounter +=
        1;


    const item =

        document.createElement(
            "article"
        );


    item.className =

        "cr-landscape-content-item "
        +

        "cr-landscape-match-item";


    item.dataset.itemType =
        "match";


    item.innerHTML = `

        <div class="cr-landscape-content-item-heading">


            <div>

                <span>
                    MATCH
                </span>

                <strong>
                    Match ${crLandscapeEntryItemCounter}
                </strong>

            </div>


            <button
                type="button"
                class="cr-landscape-remove-item"
            >
                Remove
            </button>


        </div>



        <label>


            <span>
                RESULT
            </span>


            <textarea
                class="cr-landscape-item-description"
                rows="3"
                placeholder="Will Ospreay def. Jon Moxley — Greatest Wrestler"
            ></textarea>


        </label>



        <div class="cr-landscape-item-detail-grid">


            <label>


                <span>
                    MATCH RATING
                </span>


                <input
                    class="cr-landscape-item-rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.25"
                    placeholder="4.00"
                >


            </label>



            <label>


                <span>
                    STORY / FEUD CONTEXT
                </span>


                <input
                    class="cr-landscape-item-context"
                    type="text"
                    placeholder="Grudge"
                >


            </label>


        </div>

    `;


    item

        .querySelector(
            ".cr-landscape-remove-item"
        )

        .addEventListener(

            "click",

            () =>

                crLandscapeEntryRemoveItem(
                    item
                )

        );


    crLandscapeEntryEls
        .items
        .appendChild(
            item
        );


    crLandscapeEntryRefreshEmptyState();

}



// =================================
// ADD SEGMENT
// =================================


function crLandscapeEntryAddSegment() {


    crLandscapeEntryItemCounter +=
        1;


    const item =

        document.createElement(
            "article"
        );


    item.className =

        "cr-landscape-content-item "
        +

        "cr-landscape-segment-item";


    item.dataset.itemType =
        "segment";


    item.innerHTML = `

        <div class="cr-landscape-content-item-heading">


            <div>

                <span>
                    SEGMENT
                </span>

                <strong>
                    Segment ${crLandscapeEntryItemCounter}
                </strong>

            </div>


            <button
                type="button"
                class="cr-landscape-remove-item"
            >
                Remove
            </button>


        </div>



        <div class="cr-landscape-item-detail-grid">


            <label>


                <span>
                    SEGMENT TYPE
                </span>


                <input
                    class="cr-landscape-segment-type"
                    type="text"
                    placeholder="Masked Attacker"
                >


            </label>



            <label>


                <span>
                    SEGMENT RATING
                </span>


                <input
                    class="cr-landscape-item-rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.25"
                    placeholder="4.50"
                >


            </label>


        </div>



        <label>


            <span>
                SEGMENT SUMMARY
            </span>


            <textarea
                class="cr-landscape-item-description"
                rows="4"
                placeholder="Seth Rollins was attacked by a masked assailant after confronting Oba Femi."
            ></textarea>


        </label>



        <label>


            <span>
                STORY / FEUD CONTEXT
            </span>


            <input
                class="cr-landscape-item-context"
                type="text"
                placeholder="New Challenger"
            >


        </label>

    `;


    item

        .querySelector(
            ".cr-landscape-remove-item"
        )

        .addEventListener(

            "click",

            () =>

                crLandscapeEntryRemoveItem(
                    item
                )

        );


    crLandscapeEntryEls
        .items
        .appendChild(
            item
        );


    crLandscapeEntryRefreshEmptyState();

}



// =================================
// COLLECT CONTENT
// =================================


function crLandscapeEntryCollectContent() {


    const items =

        [

            ...crLandscapeEntryEls
                .items

                .querySelectorAll(
                    ".cr-landscape-content-item"
                )

        ];


    const matches =
        [];


    const segments =
        [];


    items.forEach(

        (
            item,
            index
        ) => {


            const description =

                item

                    .querySelector(
                        ".cr-landscape-item-description"
                    )

                    ?.value
                    ?.trim()

                ||

                "";


            const ratingValue =

                item

                    .querySelector(
                        ".cr-landscape-item-rating"
                    )

                    ?.value;


            const rating =

                ratingValue === ""

                    ? null

                    : Number(
                        ratingValue
                    );


            const context =

                item

                    .querySelector(
                        ".cr-landscape-item-context"
                    )

                    ?.value
                    ?.trim()

                ||

                "";


            if (
                item.dataset.itemType ===
                "match"
            ) {


                matches.push({


                    id:

                        `match-${index + 1}`,


                    resultText:
                        description,


                    rating:
                        rating,


                    storyContext:
                        context

                });


                return;

            }


            const segmentType =

                item

                    .querySelector(
                        ".cr-landscape-segment-type"
                    )

                    ?.value
                    ?.trim()

                ||

                "";


            segments.push({


                id:

                    `segment-${index + 1}`,


                segmentType:
                    segmentType,


                summary:
                    description,


                rating:
                    rating,


                storyContext:
                    context

            });

        }

    );


    return {
        matches,
        segments
    };

}



// =================================
// VALIDATE
// =================================


function crLandscapeEntryValidate(
    eventType,
    content
) {


    const year =

        Number(
            crLandscapeEntryEls
                .year
                .value
        );


    if (
        !Number.isInteger(
            year
        )

        ||

        year < 2026
    ) {


        throw new Error(
            "Enter a valid Landscape year."
        );

    }


    if (
        eventType === "major-event"

        &&

        !crLandscapeEntryEls
            .eventName
            .value
            .trim()
    ) {


        throw new Error(
            "Enter the major event name."
        );

    }


    const overallRating =

        Number(
            crLandscapeEntryEls
                .rating
                .value
        );


    if (
        !Number.isFinite(
            overallRating
        )

        ||

        overallRating < 0

        ||

        overallRating > 5
    ) {


        throw new Error(
            "Enter a valid official show rating from 0 to 5."
        );

    }

    if (
        !crLandscapeGeneratedLocation
    ) {


        throw new Error(
            "Generate the event location before saving."
        );

    }
    
    if (
        content.matches.length === 0

        &&

        content.segments.length === 0
    ) {


        throw new Error(
            "Add at least one match or segment."
        );

    }


    const emptyMatch =

        content.matches.find(

            match =>

                !match.resultText

                ||

                match.rating === null

                ||

                !Number.isFinite(
                    match.rating
                )

        );


    if (
        emptyMatch
    ) {


        throw new Error(
            "Every match needs result text and a match rating."
        );

    }


    const emptySegment =

        content.segments.find(

            segment =>

                !segment.summary

        );


    if (
        emptySegment
    ) {


        throw new Error(
            "Every segment needs a summary."
        );

    }

}



// =================================
// EVENT ID
// =================================


function crLandscapeEntryBuildEventId(
    periodId,
    stageId,
    companyId,
    eventType
) {


    if (
        eventType ===
        "major-event"
    ) {


        return [

            periodId,
            stageId,
            companyId

        ].join(
            "-"
        );

    }


    return [

        periodId,
        stageId,
        crLandscapeEntryEls
            .show
            .value

    ].join(
        "-"
    );

}



// =================================
// UPDATE ARCHIVE INDEX
// =================================


function crLandscapeEntryUpdateArchive(
    archiveData,
    events,
    periodId
) {


    const weeklyCount =

        events.filter(

            event =>

                event.periodId ===
                periodId

                &&

                event.eventType ===
                "weekly"

        ).length;


    const majorEventCount =

        events.filter(

            event =>

                event.periodId ===
                periodId

                &&

                event.eventType ===
                "major-event"

        ).length;


    let period =

        archiveData
            .periods

            .find(

                item =>

                    item.id ===
                    periodId

            );


    if (
        !period
    ) {


        period = {


            id:
                periodId,


            label:

                crLandscapeEntryPeriodLabel(
                    periodId
                ),


            weeklyShowsRecorded:
                0,


            majorEventsRecorded:
                0,


            weeklyShowsComplete:
                false,


            showdownSaturdayComplete:
                false,


            awardsFinalized:
                false

        };


        archiveData
            .periods
            .push(
                period
            );

    }


    period.weeklyShowsRecorded =
        weeklyCount;


    period.majorEventsRecorded =
        majorEventCount;


    period.weeklyShowsComplete =

        weeklyCount >= 44;


    period.showdownSaturdayComplete =

        majorEventCount >= 8;


    archiveData
        .periods
        .sort(

            (
                a,
                b
            ) =>

                String(
                    a.id
                )

                    .localeCompare(

                        String(
                            b.id
                        )

                    )

        );


    archiveData.latestPeriodId =

        archiveData
            .periods
            .at(
                -1
            )
            ?.id

        ||

        "";


    return archiveData;

}



// =================================
// RESET FORM CONTENT
// =================================


function crLandscapeEntryResetContent() {


    crLandscapeEntryEls
        .rating
        .value =
            "";


    crLandscapeEntryEls
        .notes
        .value =
            "";


    crLandscapeEntryEls
        .eventName
        .value =
            "";
    crLandscapeEntryResetLocation();

    crLandscapeEntryEls
        .items
        .querySelectorAll(
            ".cr-landscape-content-item"
        )
        .forEach(

            item =>
                item.remove()

        );


    crLandscapeEntryRefreshEmptyState();

}



// =================================
// SAVE EVENT
// =================================


async function crLandscapeEntrySave() {


    try {


        crLandscapeEntrySetStatus(
            "VALIDATING"
        );


        const stageId =

            crLandscapeEntryEls
                .stage
                .value;


        const eventType =

            stageId ===
            "showdown-saturday"

                ? "major-event"

                : "weekly";


        const content =

            crLandscapeEntryCollectContent();


        crLandscapeEntryValidate(

            eventType,

            content

        );


        const year =

            String(
                crLandscapeEntryEls
                    .year
                    .value
            );


        const monthId =

            crLandscapeEntryEls
                .month
                .value;


        const periodId =

            `${year}-${monthId}`;


        const companyId =

            crLandscapeEntryEls
                .company
                .value;


        const selectedShow =

            crLandscapeEntryData
                .shows

                .find(

                    show =>

                        show.id ===
                        crLandscapeEntryEls
                            .show
                            .value

                );


        const eventName =

            eventType ===
            "major-event"

                ? crLandscapeEntryEls
                    .eventName
                    .value
                    .trim()

                : selectedShow
                    ?.name

                    ||

                    "";


        const eventId =

            crLandscapeEntryBuildEventId(

                periodId,

                stageId,

                companyId,

                eventType

            );


        crLandscapeEntrySetStatus(
            "SAVING"
        );


        const [

            eventsData,
            archiveData

        ] =

            await Promise.all([

                crLandscapeEntryReadJson(
                    "events.json"
                ),

                crLandscapeEntryReadJson(
                    "archive-index.json"
                )

            ]);


        if (

            eventsData.events.some(

                event =>

                    event.id ===
                    eventId

            )

        ) {


            throw new Error(

                "That Landscape show has already been recorded."

            );

        }


        const event = {


            id:
                eventId,


            periodId:
                periodId,


            stage:
                stageId,


            companyId:
                companyId,


            showId:

                eventType ===
                "weekly"

                    ? selectedShow?.id || ""

                    : "",


            eventName:
                eventName,


            eventType:
                eventType,


            bookingStyle:

                crLandscapeEntryEls
                    .bookingStyle
                    .value,


                        overallRating:

                Number(
                    crLandscapeEntryEls
                        .rating
                        .value
                ),


            location:

                structuredClone(
                    crLandscapeGeneratedLocation
                ),


            matches:
                content.matches,


            segments:
                content.segments,


            universeNotes:

                crLandscapeEntryEls
                    .notes
                    .value
                    .trim(),


            recordedAt:

                new Date()
                    .toISOString()

        };


        eventsData
            .events
            .push(
                event
            );


        eventsData
            .events
            .sort(

                (
                    a,
                    b
                ) => {


                    const periodDifference =

                        String(
                            a.periodId
                        )

                            .localeCompare(

                                String(
                                    b.periodId
                                )

                            );


                    if (
                        periodDifference !== 0
                    ) {


                        return periodDifference;

                    }


                    return String(
                        a.id
                    )

                        .localeCompare(

                            String(
                                b.id
                            )

                        );

                }

            );


        const updatedArchive =

            crLandscapeEntryUpdateArchive(

                archiveData,

                eventsData.events,

                periodId

            );


        await crLandscapeEntryWriteJson(

            "events.json",

            eventsData

        );


        await crLandscapeEntryWriteJson(

            "archive-index.json",

            updatedArchive

        );


        crLandscapeEntryResetContent();


        crLandscapeEntrySetStatus(
            "SAVED"
        );


        if (
            typeof crLandscapeLoad
            ===
            "function"
        ) {


            await crLandscapeLoad();

        }

    }


    catch (
        error
    ) {


        console.error(

            "Could not save Landscape event:",

            error

        );


        crLandscapeEntrySetStatus(

            error.message

            ||

            "SAVE FAILED"

        );

    }

}



// =================================
// LOAD ENTRY DATA
// =================================


async function crLandscapeEntryLoad() {


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


        crLandscapeEntrySetStatus(
            "LOADING"
        );


                const [

            companiesData,
            showsData,
            calendarData,
            locationData

        ] =

            await Promise.all([

                crLandscapeEntryReadJson(
                    "companies.json"
                ),

                crLandscapeEntryReadJson(
                    "shows.json"
                ),

                crLandscapeEntryReadJson(
                    "calendar-config.json"
                ),

                crLandscapeEntryReadJson(
                    "location-pools.json"
                )

            ]);

        crLandscapeLocationRules =
            locationData;
        crLandscapeEntryData = {


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


            calendar:
                calendarData

        };


        crLandscapeEntryEls
            .year
            .value =

                new Date()
                    .getFullYear();


        crLandscapeEntryBuildSelects();


        crLandscapeEntrySetStatus(
            "READY"
        );

    }


    catch (
        error
    ) {


        console.error(

            "Could not load Landscape entry system:",

            error

        );


        crLandscapeEntrySetStatus(
            "LOAD FAILED"
        );

    }

}



// =================================
// EVENTS
// =================================


crLandscapeEntryEls
    .company
    .addEventListener(

        "change",

        crLandscapeEntryUpdateShows

    );


crLandscapeEntryEls
    .stage
    .addEventListener(

        "change",

        crLandscapeEntryUpdateMode

    );


crLandscapeEntryEls
    .addMatch
    .addEventListener(

        "click",

        crLandscapeEntryAddMatch

    );


crLandscapeEntryEls
    .addSegment
    .addEventListener(

        "click",

        crLandscapeEntryAddSegment

    );


crLandscapeEntryEls
    .save
    .addEventListener(

        "click",

        crLandscapeEntrySave

    );



// =================================
// REPOSITORY DATA EVENT
// =================================


window.addEventListener(

    "owl-control-room-data-loaded",

    crLandscapeEntryLoad

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


        crLandscapeEntryLoad();

    }


}


catch (
    error
) {


    console.warn(

        "Landscape entry system waiting for repository connection.",

        error

    );

}
