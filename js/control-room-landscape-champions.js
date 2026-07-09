// =================================
// OWL CONTROL ROOM
// LANDSCAPE CHAMPIONSHIP DESK
// =================================


// =================================
// ELEMENTS
// =================================


const crLandscapeChampionEls = {


    company:

        document.getElementById(
            "cr-landscape-champion-company"
        ),


    addTitle:

        document.getElementById(
            "cr-landscape-add-title-slot"
        ),


    titleSlots:

        document.getElementById(
            "cr-landscape-title-slots"
        ),


    empty:

        document.getElementById(
            "cr-landscape-title-empty"
        ),


    history:

        document.getElementById(
            "cr-landscape-champion-history"
        ),


    status:

        document.getElementById(
            "cr-landscape-champion-status"
        ),


    save:

        document.getElementById(
            "cr-landscape-save-champions"
        )

};



// =================================
// STATE
// =================================


let crLandscapeChampionData = {


    companies:
        [],


    champions:
        null,


    events:
        [],


    shows:
        [],


    calendar:
        null

};


let crLandscapeChampionBaselineTitles =
    [];



// =================================
// STATUS
// =================================


function crLandscapeChampionSetStatus(
    value
) {


    crLandscapeChampionEls
        .status
        .textContent =
            value;

}



// =================================
// HTML SAFETY
// =================================


function crLandscapeChampionEscapeHtml(
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


function crLandscapeChampionSlug(
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


async function crLandscapeChampionReadJson(
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


async function crLandscapeChampionWriteJson(
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
// PERIOD LABEL
// =================================


function crLandscapeChampionPeriodLabel(
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


        return periodId || "";

    }


    const year =
        match[1];


    const monthId =
        match[2];


    const month =

        crLandscapeChampionData
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
// STAGE LABEL
// =================================


function crLandscapeChampionStageLabel(
    stageId
) {


    const stages = [

        ...(
            crLandscapeChampionData
                .calendar
                ?.weeklyStages

            ||

            []
        ),

        crLandscapeChampionData
            .calendar
            ?.monthlyFinale

    ]

        .filter(
            Boolean
        );


    return stages

        .find(

            stage =>

                stage.id ===
                stageId

        )

        ?.label

        ||

        stageId

        ||

        "";

}



// =================================
// EVENT LABEL
// =================================


function crLandscapeChampionEventLabel(
    event
) {


    return [

        crLandscapeChampionPeriodLabel(
            event.periodId
        ),

        crLandscapeChampionStageLabel(
            event.stage
        ),

        event.eventName || ""

    ]

        .filter(
            Boolean
        )

        .join(
            " · "
        );

}



// =================================
// BUILD COMPANY SELECT
// =================================


function crLandscapeChampionBuildCompanySelect() {


    const externalCompanies =

        crLandscapeChampionData
            .companies

            .filter(

                company =>

                    company.id !==
                    "owl"

            );


    crLandscapeChampionEls
        .company
        .innerHTML =

            externalCompanies

                .map(

                    company => `

                        <option value="${

                            crLandscapeChampionEscapeHtml(
                                company.id
                            )

                        }">

                            ${crLandscapeChampionEscapeHtml(
                                company.name
                            )}

                        </option>

                    `

                )

                .join(
                    ""
                );

}



// =================================
// EVENT OPTIONS
// =================================


function crLandscapeChampionEventOptions(
    companyId,
    selectedEventId
) {


    const companyEvents =

        crLandscapeChampionData
            .events

            .filter(

                event =>

                    event.companyId ===
                    companyId

            )

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


    const defaultOption = `

        <option value="">

            No event selected / initial snapshot

        </option>

    `;


    return (

        defaultOption

        +

        companyEvents

            .map(

                event => `

                    <option
                        value="${

                            crLandscapeChampionEscapeHtml(
                                event.id
                            )

                        }"

                        ${

                            event.id ===
                            selectedEventId

                                ? "selected"

                                : ""

                        }
                    >

                        ${crLandscapeChampionEscapeHtml(

                            crLandscapeChampionEventLabel(
                                event
                            )

                        )}

                    </option>

                `

            )

            .join(
                ""
            )

    );

}



// =================================
// CREATE TITLE CARD
// =================================


function crLandscapeChampionCreateTitleCard(
    title = null
) {


    const companyId =

        crLandscapeChampionEls
            .company
            .value;


    const card =

        document.createElement(
            "article"
        );


    card.className =
        "cr-landscape-title-card";


    card.dataset.titleId =

        title?.id

        ||

        "";


    card.innerHTML = `

        <div class="cr-landscape-title-card-heading">


            <div>


                <span>
                    CHAMPIONSHIP
                </span>


                <strong>

                    ${crLandscapeChampionEscapeHtml(

                        title?.name

                        ||

                        "New Title Slot"

                    )}

                </strong>


            </div>


            ${

                title?.id

                    ? ""

                    : `

                        <button
                            type="button"
                            class="cr-landscape-remove-new-title"
                        >
                            Remove
                        </button>

                    `

            }


        </div>



        <div class="cr-landscape-title-fields">


            <label>


                <span>
                    TITLE NAME
                </span>


                <input
                    class="cr-landscape-title-name"
                    type="text"
                    value="${

                        crLandscapeChampionEscapeHtml(
                            title?.name || ""
                        )

                    }"
                    placeholder="AEW World Championship"
                >


            </label>



            <label>


                <span>
                    CURRENT CHAMPION
                </span>


                <input
                    class="cr-landscape-title-champion"
                    type="text"
                    value="${

                        crLandscapeChampionEscapeHtml(
                            title?.champion || ""
                        )

                    }"
                    placeholder="Jon Moxley"
                >


            </label>


        </div>



        <label class="cr-landscape-title-event-label">


            <span>
                CHANGE EVENT
            </span>


            <select class="cr-landscape-title-event">

                ${crLandscapeChampionEventOptions(

                    companyId,

                    title?.lastChangeEventId || ""

                )}

            </select>


            <small>

                Used only when a new title slot is created
                or the champion name changes.

            </small>


        </label>

    `;


    const removeButton =

        card.querySelector(
            ".cr-landscape-remove-new-title"
        );


    if (
        removeButton
    ) {


        removeButton.addEventListener(

            "click",

            () => {


                card.remove();

                crLandscapeChampionRefreshEmpty();

            }

        );

    }


    const titleNameInput =

        card.querySelector(
            ".cr-landscape-title-name"
        );


    const heading =

        card.querySelector(
            ".cr-landscape-title-card-heading strong"
        );


    titleNameInput.addEventListener(

        "input",

        () => {


            heading.textContent =

                titleNameInput.value.trim()

                ||

                "New Title Slot";

        }

    );


    return card;

}



// =================================
// EMPTY STATE
// =================================


function crLandscapeChampionRefreshEmpty() {


    const cardCount =

        crLandscapeChampionEls
            .titleSlots

            .querySelectorAll(
                ".cr-landscape-title-card"
            )
            .length;


    crLandscapeChampionEls
        .empty
        .hidden =

            cardCount > 0;

}



// =================================
// RENDER TITLE SLOTS
// =================================


function crLandscapeChampionRenderTitles() {


    const companyId =

        crLandscapeChampionEls
            .company
            .value;


    const companyRecord =

        crLandscapeChampionData
            .champions
            ?.companies
            ?.[companyId]

        ||

        {
            titles:
                []
        };


    const titles =

        Array.isArray(
            companyRecord.titles
        )

            ? companyRecord.titles

            : [];


    crLandscapeChampionBaselineTitles =

        structuredClone(
            titles
        );


    crLandscapeChampionEls
        .titleSlots

        .querySelectorAll(
            ".cr-landscape-title-card"
        )

        .forEach(

            card =>
                card.remove()

        );


    titles

        .slice()

        .sort(

            (
                a,
                b
            ) =>

                String(
                    a.name || ""
                )

                    .localeCompare(

                        String(
                            b.name || ""
                        )

                    )

        )

        .forEach(

            title => {


                crLandscapeChampionEls
                    .titleSlots
                    .appendChild(

                        crLandscapeChampionCreateTitleCard(
                            title
                        )

                    );

            }

        );


    crLandscapeChampionRefreshEmpty();

    crLandscapeChampionRenderHistory();

}



// =================================
// ADD TITLE SLOT
// =================================


function crLandscapeChampionAddTitle() {


    crLandscapeChampionEls
        .titleSlots
        .appendChild(

            crLandscapeChampionCreateTitleCard()

        );


    crLandscapeChampionRefreshEmpty();


    const cards =

        crLandscapeChampionEls
            .titleSlots

            .querySelectorAll(
                ".cr-landscape-title-card"
            );


    cards[
        cards.length - 1
    ]

        ?.querySelector(
            ".cr-landscape-title-name"
        )

        ?.focus();

}



// =================================
// RENDER HISTORY
// =================================


function crLandscapeChampionRenderHistory() {


    const companyId =

        crLandscapeChampionEls
            .company
            .value;


    const history =

        Array.isArray(
            crLandscapeChampionData
                .champions
                ?.history
        )

            ? crLandscapeChampionData
                .champions
                .history

            : [];


    const companyHistory =

        history

            .filter(

                entry =>

                    entry.companyId ===
                    companyId

            )

            .slice()

            .reverse()

            .slice(
                0,
                10
            );


    if (
        companyHistory.length === 0
    ) {


        crLandscapeChampionEls
            .history
            .innerHTML = `

                <p class="cr-landscape-entry-empty">

                    No championship history recorded yet.

                </p>

            `;


        return;

    }


    crLandscapeChampionEls
        .history
        .innerHTML =

            companyHistory

                .map(

                    entry => {


                        const event =

                            crLandscapeChampionData
                                .events

                                .find(

                                    item =>

                                        item.id ===
                                        entry.eventId

                                );


                        const context =

                            event

                                ? crLandscapeChampionEventLabel(
                                    event
                                )

                                : entry.periodId

                                    ? crLandscapeChampionPeriodLabel(
                                        entry.periodId
                                    )

                                    : "Initial Landscape snapshot";


                        return `

                            <article class="cr-landscape-title-history-row">


                                <div>


                                    <span>

                                        ${crLandscapeChampionEscapeHtml(
                                            entry.titleName
                                        )}

                                    </span>


                                    <strong>

                                        ${crLandscapeChampionEscapeHtml(
                                            entry.newChampion
                                        )}

                                    </strong>


                                </div>



                                <div>


                                    <span>

                                        ${

                                            entry.previousChampion

                                                ? `FROM ${

                                                    crLandscapeChampionEscapeHtml(
                                                        entry.previousChampion
                                                    )

                                                }`

                                                : "INITIAL CHAMPION"

                                        }

                                    </span>


                                    <small>

                                        ${crLandscapeChampionEscapeHtml(
                                            context
                                        )}

                                    </small>


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
// UNIQUE TITLE ID
// =================================


function crLandscapeChampionUniqueTitleId(
    titleName,
    usedIds
) {


    const baseId =

        crLandscapeChampionSlug(
            titleName
        )

        ||

        "title";


    let candidate =
        baseId;


    let number =
        2;


    while (
        usedIds.has(
            candidate
        )
    ) {


        candidate =

            `${baseId}-${number}`;


        number +=
            1;

    }


    usedIds.add(
        candidate
    );


    return candidate;

}



// =================================
// COLLECT TITLE CARDS
// =================================


function crLandscapeChampionCollectCards() {


    return [

        ...crLandscapeChampionEls
            .titleSlots

            .querySelectorAll(
                ".cr-landscape-title-card"
            )

    ]

        .map(

            card => ({


                existingId:

                    card.dataset.titleId

                    ||

                    "",


                name:

                    card

                        .querySelector(
                            ".cr-landscape-title-name"
                        )

                        .value
                        .trim(),


                champion:

                    card

                        .querySelector(
                            ".cr-landscape-title-champion"
                        )

                        .value
                        .trim(),


                eventId:

                    card

                        .querySelector(
                            ".cr-landscape-title-event"
                        )

                        .value

            })

        );

}



// =================================
// VALIDATE
// =================================


function crLandscapeChampionValidate(
    records
) {


    if (
        records.length === 0
    ) {


        throw new Error(
            "Add at least one championship title slot."
        );

    }


    const incomplete =

        records.find(

            record =>

                !record.name

                ||

                !record.champion

        );


    if (
        incomplete
    ) {


        throw new Error(

            "Every title slot needs a title name and current champion."

        );

    }


    const normalizedNames =

        records.map(

            record =>

                record.name
                    .toLowerCase()

        );


    const uniqueNames =

        new Set(
            normalizedNames
        );


    if (
        uniqueNames.size !==
        normalizedNames.length
    ) {


        throw new Error(

            "Two title slots cannot use the same title name."

        );

    }

}



// =================================
// SAVE
// =================================


async function crLandscapeChampionSave() {


    try {


        crLandscapeChampionSetStatus(
            "VALIDATING"
        );


        const companyId =

            crLandscapeChampionEls
                .company
                .value;


        const records =

            crLandscapeChampionCollectCards();


        crLandscapeChampionValidate(
            records
        );


        const championsData =

            await crLandscapeChampionReadJson(
                "champions.json"
            );


        const companyRecord =

            championsData
                .companies
                ?.[companyId]

            ||

            {
                titles:
                    []
            };


        const existingTitles =

            Array.isArray(
                companyRecord.titles
            )

                ? companyRecord.titles

                : [];


        const existingMap =

            new Map(

                existingTitles.map(

                    title => [

                        title.id,
                        title

                    ]

                )

            );


        const usedIds =

            new Set(

                existingTitles.map(
                    title =>
                        title.id
                )

            );


        const eventMap =

            new Map(

                crLandscapeChampionData
                    .events

                    .map(

                        event => [

                            event.id,
                            event

                        ]

                    )

            );


        const historyAdditions =
            [];


        const newTitles =

            records.map(

                (
                    record,
                    index
                ) => {


                    const existing =

                        record.existingId

                            ? existingMap.get(
                                record.existingId
                            )

                            : null;


                    const titleId =

                        existing

                            ? existing.id

                            : crLandscapeChampionUniqueTitleId(

                                record.name,
                                usedIds

                            );


                    const selectedEvent =

                        record.eventId

                            ? eventMap.get(
                                record.eventId
                            )

                            : null;


                    const championChanged =

                        existing

                        &&

                        String(
                            existing.champion || ""
                        )

                        !==

                        record.champion;


                    const isNewTitle =

                        !existing;


                    if (
                        championChanged

                        ||

                        isNewTitle
                    ) {


                        historyAdditions.push({


                            id:

                                [

                                    companyId,
                                    titleId,
                                    Date.now(),
                                    index

                                ].join(
                                    "-"
                                ),


                            type:

                                isNewTitle

                                    ? "initial-snapshot"

                                    : "title-change",


                            companyId:
                                companyId,


                            titleId:
                                titleId,


                            titleName:
                                record.name,


                            previousChampion:

                                existing?.champion

                                ||

                                "",


                            newChampion:
                                record.champion,


                            eventId:

                                selectedEvent?.id

                                ||

                                "",


                            periodId:

                                selectedEvent?.periodId

                                ||

                                "",


                            stage:

                                selectedEvent?.stage

                                ||

                                "",


                            recordedAt:

                                new Date()
                                    .toISOString()

                        });

                    }


                    return {


                        id:
                            titleId,


                        name:
                            record.name,


                        champion:
                            record.champion,


                        lastChangeEventId:

                            (
                                championChanged

                                ||

                                isNewTitle
                            )

                                ? selectedEvent?.id || ""

                                : existing
                                    ?.lastChangeEventId

                                    ||

                                    "",


                        lastChangePeriodId:

                            (
                                championChanged

                                ||

                                isNewTitle
                            )

                                ? selectedEvent?.periodId || ""

                                : existing
                                    ?.lastChangePeriodId

                                    ||

                                    "",


                        updatedAt:

                            new Date()
                                .toISOString()

                    };

                }

            );


        newTitles.sort(

            (
                a,
                b
            ) =>

                String(
                    a.name
                )

                    .localeCompare(

                        String(
                            b.name
                        )

                    )

        );


        championsData.companies[
            companyId
        ] = {


            titles:
                newTitles

        };


        championsData.history =

            Array.isArray(
                championsData.history
            )

                ? [

                    ...championsData.history,
                    ...historyAdditions

                ]

                : [

                    ...historyAdditions

                ];


        const periodIds =

            championsData
                .history

                .map(

                    entry =>
                        entry.periodId

                )

                .filter(
                    Boolean
                )

                .sort();


        championsData.updatedPeriodId =

            periodIds.at(
                -1
            )

            ||

            championsData.updatedPeriodId

            ||

            "";


        crLandscapeChampionSetStatus(
            "SAVING"
        );


        await crLandscapeChampionWriteJson(

            "champions.json",

            championsData

        );


        crLandscapeChampionData.champions =

            championsData;


        crLandscapeChampionRenderTitles();


        crLandscapeChampionSetStatus(
            "SAVED"
        );

    }


    catch (
        error
    ) {


        console.error(

            "Could not save Landscape championships:",

            error

        );


        crLandscapeChampionSetStatus(

            error.message

            ||

            "SAVE FAILED"

        );

    }

}



// =================================
// LOAD
// =================================


async function crLandscapeChampionLoad() {


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


        crLandscapeChampionSetStatus(
            "LOADING"
        );


        const [

            companiesData,
            championsData,
            eventsData,
            showsData,
            calendarData

        ] =

            await Promise.all([

                crLandscapeChampionReadJson(
                    "companies.json"
                ),

                crLandscapeChampionReadJson(
                    "champions.json"
                ),

                crLandscapeChampionReadJson(
                    "events.json"
                ),

                crLandscapeChampionReadJson(
                    "shows.json"
                ),

                crLandscapeChampionReadJson(
                    "calendar-config.json"
                )

            ]);


        crLandscapeChampionData = {


            companies:

                Array.isArray(
                    companiesData.companies
                )

                    ? companiesData.companies

                    : [],


            champions:
                championsData,


            events:

                Array.isArray(
                    eventsData.events
                )

                    ? eventsData.events

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


        crLandscapeChampionBuildCompanySelect();

        crLandscapeChampionRenderTitles();


        crLandscapeChampionSetStatus(
            "READY"
        );

    }


    catch (
        error
    ) {


        console.error(

            "Could not load Landscape Championship Desk:",

            error

        );


        crLandscapeChampionSetStatus(
            "LOAD FAILED"
        );

    }

}



// =================================
// EVENTS
// =================================


crLandscapeChampionEls
    .company
    .addEventListener(

        "change",

        () => {


            crLandscapeChampionRenderTitles();

            crLandscapeChampionSetStatus(
                "READY"
            );

        }

    );


crLandscapeChampionEls
    .addTitle
    .addEventListener(

        "click",

        crLandscapeChampionAddTitle

    );


crLandscapeChampionEls
    .save
    .addEventListener(

        "click",

        crLandscapeChampionSave

    );



// =================================
// REPOSITORY EVENT
// =================================


window.addEventListener(

    "owl-control-room-data-loaded",

    crLandscapeChampionLoad

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


        crLandscapeChampionLoad();

    }


}


catch (
    error
) {


    console.warn(

        "Landscape Championship Desk waiting for repository connection.",

        error

    );

}
