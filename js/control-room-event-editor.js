// =================================
// OWL CONTROL ROOM
// EVENT MANAGER
// =================================


// =================================
// ELEMENTS
// =================================


const crEventMode =
    document.getElementById(
        "cr-event-editor-mode"
    );


const crEventSelect =
    document.getElementById(
        "cr-event-editor-select"
    );


const crEventSelectRow =
    document.getElementById(
        "cr-event-editor-select-row"
    );


const crEventIdPreview =
    document.getElementById(
        "cr-event-id-preview"
    );


const crEventStatus =
    document.getElementById(
        "cr-event-editor-status"
    );


const crEventPreview =
    document.getElementById(
        "cr-event-change-preview"
    );


const crEventChangeList =
    document.getElementById(
        "cr-event-change-list"
    );


const crEventConflictMessage =
    document.getElementById(
        "cr-event-conflict-message"
    );


const crEventSaveButton =
    document.getElementById(
        "cr-save-event"
    );


const crEventMessage =
    document.getElementById(
        "cr-event-editor-message"
    );



// =================================
// FORM FIELDS
// =================================


const crEventFields = {

    name:
        document.getElementById(
            "cr-event-name"
        ),

    brand:
        document.getElementById(
            "cr-event-brand"
        ),

    eventType:
        document.getElementById(
            "cr-event-type"
        ),

    date:
        document.getElementById(
            "cr-event-date"
        ),

    status:
        document.getElementById(
            "cr-event-status"
        ),

    location:
        document.getElementById(
            "cr-event-location"
        ),

    image:
        document.getElementById(
            "cr-event-image"
        ),

    tagline:
        document.getElementById(
            "cr-event-tagline"
        ),

    description:
        document.getElementById(
            "cr-event-description"
        )

};



// =================================
// LABELS
// =================================


const crEventLabels = {

    name:
        "Event Name",

    brand:
        "Show / Brand",

    eventType:
        "Event Type",

    date:
        "Date",

    status:
        "Status",

    location:
        "Location",

    image:
        "Poster Path",

    tagline:
        "Tagline",

    description:
        "Description"

};



// =================================
// STATE
// =================================


let crEventOriginalRecord =
    null;


let crEventPendingSelectionId =
    "";



// =================================
// BASIC HELPERS
// =================================


function crEventSetStatus(
    text
) {

    crEventStatus.textContent =
        text;

}



function crEventShowMessage(
    message,
    type
) {

    crEventMessage.textContent =
        message;


    crEventMessage.className =
        `cr-save-message ${type}`;


    crEventMessage.hidden =
        false;

}



function crEventHideMessage() {

    crEventMessage.textContent =
        "";


    crEventMessage.hidden =
        true;

}



function crEventCreateSlug(
    name
) {

    return String(
        name || ""
    )

        .normalize(
            "NFD"
        )

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .toLowerCase()

        .replace(
            /&/g,
            " and "
        )

        .replace(
            /[^a-z0-9]+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            ""
        );

}



function crEventCreateId(
    record
) {

    const slug =
        crEventCreateSlug(
            record.name
        );


    if (
        !slug ||
        !record.date
    ) {

        return "";

    }


    if (
        record.eventType === "ppv"
    ) {

        const year =
            record.date.slice(
                0,
                4
            );


        return `${slug}-${year}`;

    }


    return `${slug}-${record.date}`;

}



function crEventValuesMatch(
    first,
    second
) {

    return (

        JSON.stringify(
            first
        )

        ===

        JSON.stringify(
            second
        )

    );

}



function crEventDisplayValue(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "Empty";

    }


    return String(
        value
    );

}



// =================================
// FORM RECORD
// =================================


function crEventGetFormRecord() {

    return {

        name:
            crEventFields.name.value.trim(),

        brand:
            crEventFields.brand.value,

        eventType:
            crEventFields.eventType.value,

        date:
            crEventFields.date.value,

        status:
            crEventFields.status.value,

        location:
            crEventFields.location.value.trim(),

        image:
            crEventFields.image.value.trim(),

        tagline:
            crEventFields.tagline.value.trim(),

        description:
            crEventFields.description.value.trim()

    };

}



function crEventGetEditableRecord(
    event
) {

    return {

        name:
            event.name || "",

        brand:
            event.brand || "",

        eventType:
            event.eventType || "weekly",

        date:
            event.date || "",

        status:
            event.status || "upcoming",

        location:
            event.location || "",

        image:
            event.image || "",

        tagline:
            event.tagline || "",

        description:
            event.description || ""

    };

}



// =================================
// FILL FORM
// =================================


function crEventFillForm(
    record
) {

    crEventFields.name.value =
        record.name || "";


    crEventFields.brand.value =
        record.brand || "";


    crEventFields.eventType.value =
        record.eventType || "weekly";


    crEventFields.date.value =
        record.date || "";


    crEventFields.status.value =
        record.status || "upcoming";


    crEventFields.location.value =
        record.location || "";


    crEventFields.image.value =
        record.image || "";


    crEventFields.tagline.value =
        record.tagline || "";


    crEventFields.description.value =
        record.description || "";

}



// =================================
// CLEAR FORM
// =================================


function crEventClearForm() {

    crEventFillForm({

        name:
            "",

        brand:
            "",

        eventType:
            "weekly",

        date:
            "",

        status:
            "upcoming",

        location:
            "",

        image:
            "",

        tagline:
            "",

        description:
            ""

    });


    crEventOriginalRecord =
        null;


    crEventIdPreview.textContent =
        "—";


    crEventPreview.hidden =
        true;


    crEventConflictMessage.hidden =
        true;


    crEventSaveButton.disabled =
        true;

}



// =================================
// POPULATE EVENT SELECT
// =================================


function crEventPopulateEvents() {

    if (
        !Array.isArray(
            owlControlRoomData.events
        )
    ) {

        return;

    }



    const desiredSelection =

        crEventPendingSelectionId

        ||

        crEventSelect.value;



    crEventSelect.innerHTML = `

        <option value="">
            Select Event
        </option>

    `;



    const sortedEvents =
        [...owlControlRoomData.events]

            .sort(
                (a, b) => {

                    const dateDifference =

                        new Date(
                            `${b.date}T00:00:00`
                        )

                        -

                        new Date(
                            `${a.date}T00:00:00`
                        );


                    if (
                        dateDifference !== 0
                    ) {

                        return dateDifference;

                    }


                    return String(
                        a.name || ""
                    ).localeCompare(

                        String(
                            b.name || ""
                        )

                    );

                }
            );



    sortedEvents.forEach(
        event => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                event.id;


            option.textContent =

                `${event.date} — ${event.name}`;


            crEventSelect.appendChild(
                option
            );

        }
    );



    if (
        desiredSelection

        &&

        sortedEvents.some(
            event =>
                event.id === desiredSelection
        )
    ) {

        crEventSelect.value =
            desiredSelection;


        crEventPendingSelectionId =
            "";


        crEventLoadSelected();

    }


    else {

        crEventSetStatus(
            "READY"
        );

    }

}



// =================================
// LOAD SELECTED EVENT
// =================================


function crEventLoadSelected() {

    crEventHideMessage();



    const eventId =
        crEventSelect.value;



    if (!eventId) {

        crEventClearForm();


        crEventSetStatus(
            "READY"
        );


        return;

    }



    const event =
        owlControlRoomData.events.find(
            item =>
                item.id === eventId
        );


    if (!event) {

        crEventShowMessage(

            "The selected event could not be found.",

            "save-error"

        );


        return;

    }



    crEventOriginalRecord =
        crEventGetEditableRecord(
            event
        );


    crEventFillForm(
        crEventOriginalRecord
    );


    crEventIdPreview.textContent =
        event.id;


    crEventPreview.hidden =
        true;


    crEventConflictMessage.hidden =
        true;


    crEventSaveButton.disabled =
        true;


    crEventSetStatus(
        "EDITING"
    );

}



// =================================
// MODE CHANGE
// =================================


function crEventChangeMode() {

    crEventHideMessage();


    crEventChangeList.innerHTML =
        "";


    crEventPreview.hidden =
        true;


    crEventConflictMessage.hidden =
        true;



    if (
        crEventMode.value === "create"
    ) {

        crEventSelectRow.hidden =
            true;


        crEventSelect.value =
            "";


        crEventClearForm();


        crEventSaveButton.textContent =
            "Create Event";


        crEventSetStatus(
            "NEW EVENT"
        );


        return;

    }



    crEventSelectRow.hidden =
        false;


    crEventSaveButton.textContent =
        "Save Event Changes";


    crEventClearForm();


    crEventSetStatus(
        "READY"
    );

}



// =================================
// CHANGE DETECTION
// =================================


function crEventGetChanges() {

    if (!crEventOriginalRecord) {

        return {};

    }


    const current =
        crEventGetFormRecord();


    const changes =
        {};



    Object.keys(
        current
    ).forEach(
        key => {

            if (
                !crEventValuesMatch(

                    current[key],

                    crEventOriginalRecord[key]

                )
            ) {

                changes[key] =
                    current[key];

            }

        }
    );


    return changes;

}



// =================================
// REVIEW ROW
// =================================


function crEventAddReviewRow(
    label,
    value
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "cr-editor-change-row";


    const labelElement =
        document.createElement(
            "strong"
        );


    labelElement.textContent =
        label;


    const valueElement =
        document.createElement(
            "span"
        );


    valueElement.textContent =
        value;


    row.appendChild(
        labelElement
    );


    row.appendChild(
        valueElement
    );


    crEventChangeList.appendChild(
        row
    );

}



// =================================
// VALIDATION
// =================================


function crEventValidate(
    record
) {

    const errors =
        [];


    if (!record.name) {

        errors.push(
            "Event name is required."
        );

    }


    if (!record.date) {

        errors.push(
            "Event date is required."
        );

    }


    if (!record.eventType) {

        errors.push(
            "Event type is required."
        );

    }


    return errors;

}



// =================================
// REVIEW CHANGES
// =================================


function crEventReviewChanges() {

    crEventHideMessage();


    crEventChangeList.innerHTML =
        "";


    crEventConflictMessage.hidden =
        true;



    const record =
        crEventGetFormRecord();


    const errors =
        crEventValidate(
            record
        );



    // =================================
    // CREATE MODE
    // =================================


    if (
        crEventMode.value === "create"
    ) {

        const newId =
            crEventCreateId(
                record
            );


        crEventIdPreview.textContent =
            newId || "—";



        if (
            !record.name &&
            !record.date
        ) {

            crEventPreview.hidden =
                true;


            crEventSaveButton.disabled =
                true;


            return;

        }



        const duplicateId =
            newId

            &&

            owlControlRoomData.events.some(
                event =>
                    event.id === newId
            );



        if (duplicateId) {

            errors.push(

                `An event with the database ID ${newId} already exists.`

            );

        }



        crEventPreview.hidden =
            false;


        crEventAddReviewRow(
            "New Event",
            record.name || "Unnamed"
        );


        crEventAddReviewRow(
            "Database ID",
            newId || "Waiting for name and date"
        );


        crEventAddReviewRow(
            "Date",
            record.date || "Not selected"
        );


        crEventAddReviewRow(
            "Show / Brand",
            record.brand || "Unassigned"
        );


        crEventAddReviewRow(
            "Event Type",
            record.eventType
        );


        crEventAddReviewRow(
            "Status",
            record.status
        );



        if (
            errors.length > 0
        ) {

            crEventConflictMessage.textContent =
                errors.join(" ");


            crEventConflictMessage.hidden =
                false;

        }



        crEventSaveButton.disabled =
            errors.length > 0;


        crEventSetStatus(

            errors.length > 0

                ? "CHECK FORM"

                : "READY TO CREATE"

        );


        return;

    }



    // =================================
    // EDIT MODE
    // =================================


    if (!crEventOriginalRecord) {

        crEventPreview.hidden =
            true;


        crEventSaveButton.disabled =
            true;


        return;

    }



    const changes =
        crEventGetChanges();


    const changeKeys =
        Object.keys(
            changes
        );



    if (
        changeKeys.length === 0
    ) {

        crEventPreview.hidden =
            true;


        crEventSaveButton.disabled =
            true;


        crEventSetStatus(
            "NO CHANGES"
        );


        return;

    }



    changeKeys.forEach(
        key => {

            crEventAddReviewRow(

                crEventLabels[key],

                `${crEventDisplayValue(
                    crEventOriginalRecord[key]
                )} → ${crEventDisplayValue(
                    changes[key]
                )}`

            );

        }
    );



    crEventPreview.hidden =
        false;



    if (
        errors.length > 0
    ) {

        crEventConflictMessage.textContent =
            errors.join(" ");


        crEventConflictMessage.hidden =
            false;

    }



    crEventSaveButton.disabled =
        errors.length > 0;


    crEventSetStatus(

        errors.length > 0

            ? "CHECK FORM"

            : "CHANGES READY"

    );

}



// =================================
// WRITE PERMISSION
// =================================


async function crEventEnsureWritePermission() {

    if (!owlRepositoryHandle) {

        return false;

    }


    const options = {

        mode:
            "readwrite"

    };


    const currentPermission =
        await owlRepositoryHandle.queryPermission(
            options
        );


    if (
        currentPermission === "granted"
    ) {

        return true;

    }


    const requestedPermission =
        await owlRepositoryHandle.requestPermission(
            options
        );


    return (

        requestedPermission ===
        "granted"

    );

}



// =================================
// FILE HELPERS
// =================================


async function crEventReadFile() {

    const dataDirectory =
        await owlRepositoryHandle.getDirectoryHandle(
            "data"
        );


    const fileHandle =
        await dataDirectory.getFileHandle(
            "events.json"
        );


    const file =
        await fileHandle.getFile();


    return {

        fileHandle,

        text:
            await file.text()

    };

}



async function crEventWriteFile(
    fileHandle,
    text
) {

    const writable =
        await fileHandle.createWritable();


    await writable.write(
        text
    );


    await writable.close();

}



// =================================
// FIND OBJECT BOUNDS
// =================================


function crEventFindObjectBounds(
    text,
    recordId
) {

    const escapedId =
        recordId.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    const pattern =
        new RegExp(

            `"id"\\s*:\\s*"${escapedId}"`

        );


    const match =
        pattern.exec(
            text
        );


    if (!match) {

        throw new Error(

            `Could not find event ${recordId}.`

        );

    }



    const start =
        text.lastIndexOf(
            "{",
            match.index
        );


    let end =
        -1;


    let depth =
        0;


    let inString =
        false;


    let escaped =
        false;



    for (
        let index = start;
        index < text.length;
        index += 1
    ) {

        const character =
            text[index];


        if (escaped) {

            escaped =
                false;


            continue;

        }


        if (
            character === "\\"

            &&

            inString
        ) {

            escaped =
                true;


            continue;

        }


        if (
            character === "\""
        ) {

            inString =
                !inString;


            continue;

        }


        if (inString) {

            continue;

        }


        if (
            character === "{"
        ) {

            depth +=
                1;

        }


        if (
            character === "}"
        ) {

            depth -=
                1;


            if (
                depth === 0
            ) {

                end =
                    index;


                break;

            }

        }

    }



    if (
        start === -1 ||
        end === -1
    ) {

        throw new Error(

            `Could not locate event ${recordId}.`

        );

    }


    return {

        start,
        end

    };

}



// =================================
// REPLACE STRING FIELD
// =================================


function crEventReplaceStringField(
    block,
    key,
    value
) {

    const escapedKey =
        key.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    const pattern =
        new RegExp(

            `("${escapedKey}"\\s*:\\s*)("(?:\\\\.|[^"\\\\])*")`

        );


    if (
        !pattern.test(
            block
        )
    ) {

        throw new Error(

            `Could not find field ${key}.`

        );

    }


    return block.replace(

        pattern,

        (
            match,
            prefix
        ) =>

            prefix

            +

            JSON.stringify(
                value
            )

    );

}



// =================================
// UPDATE EXISTING EVENT
// =================================


function crEventUpdateRecordText(
    text,
    recordId,
    changes
) {

    const bounds =
        crEventFindObjectBounds(
            text,
            recordId
        );


    let block =
        text.slice(

            bounds.start,

            bounds.end + 1

        );



    Object.entries(
        changes
    ).forEach(
        (
            [
                key,
                value
            ]
        ) => {

            block =
                crEventReplaceStringField(

                    block,

                    key,

                    value

                );

        }
    );



    return (

        text.slice(
            0,
            bounds.start
        )

        +

        block

        +

        text.slice(
            bounds.end + 1
        )

    );

}



// =================================
// APPEND NEW EVENT
// =================================


function crEventAppendRecordText(
    text,
    record
) {

    const closingIndex =
        text.lastIndexOf(
            "]"
        );


    if (
        closingIndex === -1
    ) {

        throw new Error(
            "Could not find the end of events.json."
        );

    }



    const before =
        text.slice(
            0,
            closingIndex
        );


    const after =
        text.slice(
            closingIndex
        );


    const trimmedBefore =
        before.trimEnd();


    const hasRecords =
        !trimmedBefore.endsWith(
            "["
        );


    const objectText =
        JSON.stringify(
            record,
            null,
            2
        )

            .split("\n")

            .map(
                line =>
                    `  ${line}`
            )

            .join("\n");



    return (

        trimmedBefore

        +

        (
            hasRecords
                ? ",\n"
                : "\n"
        )

        +

        objectText

        +

        "\n"

        +

        after

    );

}



// =================================
// BUILD NEW EVENT
// =================================


function crEventBuildNewRecord() {

    const form =
        crEventGetFormRecord();


    return {

        id:
            crEventCreateId(
                form
            ),

        name:
            form.name,

        brand:
            form.brand,

        eventType:
            form.eventType,

        date:
            form.date,

        status:
            form.status,

        location:
            form.location,

        image:
            form.image,

        tagline:
            form.tagline,

        description:
            form.description

    };

}



// =================================
// SAVE EXISTING EVENT
// =================================


async function crEventSaveExisting() {

    const eventId =
        crEventSelect.value;


    const changes =
        crEventGetChanges();



    if (
        !eventId

        ||

        Object.keys(
            changes
        ).length === 0
    ) {

        return;

    }



    const eventFile =
        await crEventReadFile();



    const updatedText =
        crEventUpdateRecordText(

            eventFile.text,

            eventId,

            changes

        );



    await crEventWriteFile(

        eventFile.fileHandle,

        updatedText

    );



    crEventPendingSelectionId =
        eventId;



    await loadRepositoryData(
        owlRepositoryHandle
    );



    crEventShowMessage(

        "Event changes were saved locally. Review events.json in GitHub Desktop before committing.",

        "save-success"

    );


    crEventSetStatus(
        "SAVED"
    );

}



// =================================
// SAVE NEW EVENT
// =================================


async function crEventSaveNew() {

    const event =
        crEventBuildNewRecord();



    const duplicate =
        owlControlRoomData.events.some(
            item =>
                item.id === event.id
        );


    if (duplicate) {

        throw new Error(
            "An event with this database ID already exists."
        );

    }



    const eventFile =
        await crEventReadFile();



    const updatedText =
        crEventAppendRecordText(

            eventFile.text,

            event

        );



    await crEventWriteFile(

        eventFile.fileHandle,

        updatedText

    );



    crEventMode.value =
        "edit";


    crEventSelectRow.hidden =
        false;


    crEventSaveButton.textContent =
        "Save Event Changes";


    crEventPendingSelectionId =
        event.id;



    await loadRepositoryData(
        owlRepositoryHandle
    );



    crEventShowMessage(

        `${event.name} was created in the local event database. Review events.json in GitHub Desktop before committing.`,

        "save-success"

    );


    crEventSetStatus(
        "CREATED"
    );

}



// =================================
// SAVE BUTTON
// =================================


async function crEventSave() {

    crEventSaveButton.disabled =
        true;


    crEventSetStatus(
        "SAVING..."
    );


    crEventHideMessage();



    try {

        const permission =
            await crEventEnsureWritePermission();


        if (!permission) {

            throw new Error(
                "Write permission was not granted."
            );

        }



        const record =
            crEventGetFormRecord();


        const errors =
            crEventValidate(
                record
            );


        if (
            errors.length > 0
        ) {

            throw new Error(
                errors.join(" ")
            );

        }



        if (
            crEventMode.value === "create"
        ) {

            await crEventSaveNew();

        }


        else {

            await crEventSaveExisting();

        }

    }


    catch (error) {

        console.error(
            "Could not save event:",
            error
        );


        crEventReviewChanges();


        crEventSetStatus(
            "SAVE FAILED"
        );


        crEventShowMessage(

            error.message ||
            "The event could not be saved.",

            "save-error"

        );

    }

}



// =================================
// DATA RELOAD
// =================================


function crEventHandleDataLoaded() {

    crEventPopulateEvents();

}



// =================================
// EVENTS
// =================================


crEventMode.addEventListener(
    "change",
    crEventChangeMode
);


crEventSelect.addEventListener(
    "change",
    crEventLoadSelected
);



Object.values(
    crEventFields
).forEach(
    field => {

        field.addEventListener(
            "input",
            crEventReviewChanges
        );


        field.addEventListener(
            "change",
            crEventReviewChanges
        );

    }
);



crEventSaveButton.addEventListener(
    "click",
    crEventSave
);



window.addEventListener(

    "owl-control-room-data-loaded",

    crEventHandleDataLoaded

);



// =================================
// SAFETY INITIALIZATION
// =================================


try {

    if (
        typeof owlControlRoomData !==
            "undefined"

        &&

        Array.isArray(
            owlControlRoomData.events
        )
    ) {

        crEventPopulateEvents();

    }

}


catch (error) {

    console.warn(
        "Event Manager waiting for repository data.",
        error
    );

}
