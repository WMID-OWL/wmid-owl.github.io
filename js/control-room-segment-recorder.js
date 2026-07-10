// =================================
// OWL CONTROL ROOM
// SEGMENT RECORDER
// =================================


(() => {


    // =================================
    // ELEMENTS
    // =================================


    const eventSelect =

        document.getElementById(
            "cr-segment-event"
        );


    const titleInput =

        document.getElementById(
            "cr-segment-title"
        );


    const importanceSelect =

        document.getElementById(
            "cr-segment-importance"
        );


    const participantSearch =

        document.getElementById(
            "cr-segment-participant-search"
        );


    const participantList =

        document.getElementById(
            "cr-segment-participant-list"
        );


    const summaryInput =

        document.getElementById(
            "cr-segment-summary"
        );


    const historyList =

        document.getElementById(
            "cr-segment-history"
        );


    const saveButton =

        document.getElementById(
            "cr-segment-save"
        );


    const cancelEditButton =

        document.getElementById(
            "cr-segment-cancel-edit"
        );


    const message =

        document.getElementById(
            "cr-segment-message"
        );


    const status =

        document.getElementById(
            "cr-segment-status"
        );


    if (
        !eventSelect
    ) {


        return;

    }



    // =================================
    // STATE
    // =================================


    const selectedParticipantIds =
        new Set();


    let editingSegmentId =
        null;



    // =================================
    // DATA HELPERS
    // =================================


    function segments() {


        return Array.isArray(
            owlControlRoomData.segments
        )

            ? owlControlRoomData.segments

            : [];

    }



    function wrestlers() {


        return Array.isArray(
            owlControlRoomData.wrestlers
        )

            ? owlControlRoomData.wrestlers

            : [];

    }



    function events() {


        return Array.isArray(
            owlControlRoomData.events
        )

            ? owlControlRoomData.events

            : [];

    }



    function wrestlerName(
        wrestlerId
    ) {


        return (

            wrestlers().find(

                wrestler =>

                    wrestler.id ===
                    wrestlerId

            )
                ?.name

            ||

            wrestlerId

        );

    }



    // =================================
    // MESSAGE HELPERS
    // =================================


    function showMessage(
        text,
        type = "success"
    ) {


        message.textContent =
            text;


        message.className =

            `cr-save-message ${type}`;


        message.hidden =
            false;

    }



    function clearMessage() {


        message.textContent =
            "";


        message.hidden =
            true;

    }



    // =================================
    // EVENT OPTIONS
    // =================================


    function populateEvents() {


        const currentValue =
            eventSelect.value;


        eventSelect.innerHTML = `

            <option value="">
                Select Completed Event
            </option>

        `;


        events()

            .filter(

                event =>

                    String(
                        event.status || ""
                    )
                        .toLowerCase()

                    ===

                    "completed"

            )

            .sort(

                (
                    a,
                    b
                ) =>

                    String(
                        b.date || ""
                    )

                        .localeCompare(

                            String(
                                a.date || ""
                            )

                        )

            )

            .forEach(

                event => {


                    const option =

                        document.createElement(
                            "option"
                        );


                    option.value =
                        event.id;


                    option.textContent =

                        `${event.date || "No Date"} — ${event.name}`;


                    eventSelect.appendChild(
                        option
                    );

                }

            );


        if (

            [...eventSelect.options]
                .some(

                    option =>

                        option.value ===
                        currentValue

                )

        ) {


            eventSelect.value =
                currentValue;

        }

    }



    // =================================
    // PARTICIPANTS
    // =================================


    function renderParticipants() {


        const query =

            String(
                participantSearch.value || ""
            )
                .trim()
                .toLowerCase();


        const filtered =

            wrestlers()

                .filter(

                    wrestler =>

                        !query

                        ||

                        String(
                            wrestler.name || ""
                        )
                            .toLowerCase()
                            .includes(
                                query
                            )

                )

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

                );


        participantList.innerHTML =
            "";


        if (
            filtered.length === 0
        ) {


            const empty =

                document.createElement(
                    "p"
                );


            empty.className =
                "cr-landscape-entry-empty";


            empty.textContent =
                "No wrestlers match this search.";


            participantList.appendChild(
                empty
            );


            return;

        }



        filtered.forEach(

            wrestler => {


                const label =

                    document.createElement(
                        "label"
                    );


                label.className =
                    "cr-segment-participant-option";


                const checkbox =

                    document.createElement(
                        "input"
                    );


                checkbox.type =
                    "checkbox";


                checkbox.value =
                    wrestler.id;


                checkbox.checked =

                    selectedParticipantIds.has(
                        wrestler.id
                    );


                checkbox.addEventListener(

                    "change",

                    () => {


                        if (
                            checkbox.checked
                        ) {


                            selectedParticipantIds.add(
                                wrestler.id
                            );

                        }


                        else {


                            selectedParticipantIds.delete(
                                wrestler.id
                            );

                        }


                        validateForm();

                    }

                );


                const name =

                    document.createElement(
                        "span"
                    );


                name.textContent =
                    wrestler.name;


                label.appendChild(
                    checkbox
                );


                label.appendChild(
                    name
                );


                participantList.appendChild(
                    label
                );

            }

        );

    }



    // =================================
    // HISTORY
    // =================================


    function renderHistory() {


        const eventId =
            eventSelect.value;


        historyList.innerHTML =
            "";


        if (
            !eventId
        ) {


            historyList.innerHTML = `

                <p class="cr-landscape-entry-empty">
                    Select an event to view recorded segments.
                </p>

            `;


            return;

        }



        const eventSegments =

            segments()

                .filter(

                    segment =>

                        segment.eventId ===
                        eventId

                )

                .sort(

                    (
                        a,
                        b
                    ) =>

                        String(
                            a.createdAt || ""
                        )

                            .localeCompare(

                                String(
                                    b.createdAt || ""
                                )

                            )

                );


        if (
            eventSegments.length === 0
        ) {


            historyList.innerHTML = `

                <p class="cr-landscape-entry-empty">
                    No segments recorded for this event yet.
                </p>

            `;


            return;

        }



        eventSegments.forEach(

            segment => {


                const card =

                    document.createElement(
                        "article"
                    );


                card.className =
                    "cr-segment-history-card";


                if (
                    segment.id ===
                    editingSegmentId
                ) {


                    card.classList.add(
                        "is-editing"
                    );

                }



                const heading =

                    document.createElement(
                        "div"
                    );


                heading.className =
                    "cr-segment-history-heading";


                const title =

                    document.createElement(
                        "strong"
                    );


                title.textContent =
                    segment.title;


                const importance =

                    document.createElement(
                        "span"
                    );


                importance.textContent =

                    String(
                        segment.importance || "regular"
                    )
                        .toUpperCase();


                heading.appendChild(
                    title
                );


                heading.appendChild(
                    importance
                );



                const participants =

                    document.createElement(
                        "small"
                    );


                const participantNames =

                    (

                        segment.participantIds

                        ||

                        []

                    )

                        .map(
                            wrestlerName
                        );


                participants.textContent =

                    participantNames.length

                        ? participantNames.join(
                            ", "
                        )

                        : "No listed participants";



                const summary =

                    document.createElement(
                        "p"
                    );


                summary.textContent =
                    segment.summary;



                const actions =

                    document.createElement(
                        "div"
                    );


                actions.className =
                    "cr-segment-history-actions";



                const editButton =

                    document.createElement(
                        "button"
                    );


                editButton.type =
                    "button";


                editButton.className =
                    "control-room-button";


                editButton.dataset.action =
                    "edit-segment";


                editButton.dataset.segmentId =
                    segment.id;


                editButton.textContent =
                    "Edit";



                const deleteButton =

                    document.createElement(
                        "button"
                    );


                deleteButton.type =
                    "button";


                deleteButton.className =

                    "control-room-button cr-segment-delete-button";


                deleteButton.dataset.action =
                    "delete-segment";


                deleteButton.dataset.segmentId =
                    segment.id;


                deleteButton.textContent =
                    "Delete";



                actions.appendChild(
                    editButton
                );


                actions.appendChild(
                    deleteButton
                );



                card.appendChild(
                    heading
                );


                card.appendChild(
                    participants
                );


                card.appendChild(
                    summary
                );


                card.appendChild(
                    actions
                );


                historyList.appendChild(
                    card
                );

            }

        );

    }



    // =================================
    // FORM VALIDATION
    // =================================


    function validateForm() {


        const valid =

            Boolean(
                eventSelect.value
            )

            &&

            Boolean(
                titleInput.value.trim()
            )

            &&

            Boolean(
                summaryInput.value.trim()
            );


        saveButton.disabled =
            !valid;


        if (
            editingSegmentId
        ) {


            status.textContent =

                valid

                    ? "READY TO UPDATE"

                    : "EDITING";


            saveButton.textContent =
                "Update Segment";


            cancelEditButton.hidden =
                false;

        }


        else {


            status.textContent =

                valid

                    ? "READY TO SAVE"

                    : "READY";


            saveButton.textContent =
                "Save Segment";


            cancelEditButton.hidden =
                true;

        }

    }



    // =================================
    // ID GENERATION
    // =================================


    function nextSegmentId(
        eventId
    ) {


        const prefix =

            `${eventId}-segment-`;


        const usedNumbers =

            segments()

                .filter(

                    segment =>

                        String(
                            segment.id || ""
                        )
                            .startsWith(
                                prefix
                            )

                )

                .map(

                    segment =>

                        Number(

                            String(
                                segment.id
                            )
                                .replace(
                                    prefix,
                                    ""
                                )

                        )

                )

                .filter(
                    Number.isFinite
                );


        const nextNumber =

            usedNumbers.length

                ? Math.max(
                    ...usedNumbers
                ) + 1

                : 1;


        return (

            prefix

            +

            String(
                nextNumber
            )
                .padStart(
                    2,
                    "0"
                )

        );

    }



    // =================================
    // WRITE FILE
    // =================================


    async function writeSegmentsFile() {


        const dataDirectory =

            await owlRepositoryHandle
                .getDirectoryHandle(
                    "data"
                );


        const fileHandle =

            await dataDirectory
                .getFileHandle(
                    "segments.json"
                );


        const writable =

            await fileHandle
                .createWritable();


        await writable.write(

            `${JSON.stringify(
                owlControlRoomData.segments,
                null,
                2
            )}\n`

        );


        await writable.close();

    }



    // =================================
    // RESET FORM
    // =================================


    function resetForm() {


        editingSegmentId =
            null;


        eventSelect.disabled =
            false;


        titleInput.value =
            "";


        importanceSelect.value =
            "regular";


        summaryInput.value =
            "";


        participantSearch.value =
            "";


        selectedParticipantIds.clear();


        renderParticipants();


        renderHistory();


        validateForm();

    }



    // =================================
    // START EDIT
    // =================================


    function startEdit(
        segmentId
    ) {


        const segment =

            segments().find(

                item =>

                    item.id ===
                    segmentId

            );


        if (
            !segment
        ) {


            showMessage(

                "Could not find that segment.",

                "error"

            );


            return;

        }


        clearMessage();


        editingSegmentId =
            segment.id;


        eventSelect.value =
            segment.eventId;


        eventSelect.disabled =
            true;


        titleInput.value =
            segment.title || "";


        importanceSelect.value =

            segment.importance

            ||

            "regular";


        summaryInput.value =
            segment.summary || "";


        selectedParticipantIds.clear();


        (

            segment.participantIds

            ||

            []

        )

            .forEach(

                wrestlerId =>

                    selectedParticipantIds.add(
                        wrestlerId
                    )

            );


        participantSearch.value =
            "";


        renderParticipants();


        renderHistory();


        validateForm();


        titleInput.focus();


        showMessage(

            `Editing segment: ${segment.title}`,

            "success"

        );

    }



    // =================================
    // SAVE NEW SEGMENT
    // =================================


    async function createSegment() {


        const eventId =
            eventSelect.value;


        const record = {


            id:
                nextSegmentId(
                    eventId
                ),


            eventId:
                eventId,


            title:
                titleInput.value.trim(),


            importance:
                importanceSelect.value,


            participantIds:

                [
                    ...selectedParticipantIds
                ],


            summary:
                summaryInput.value.trim(),


            createdAt:

                new Date()
                    .toISOString()

        };


        owlControlRoomData
            .segments
            .push(
                record
            );


        try {


            await writeSegmentsFile();


            setCount(

                "cr-count-segments",

                segments().length

            );


            resetForm();


            showMessage(

                `Saved segment: ${record.title}`,

                "success"

            );

        }


        catch (
            error
        ) {


            owlControlRoomData
                .segments
                .pop();


            throw error;

        }

    }



    // =================================
    // UPDATE SEGMENT
    // =================================


    async function updateSegment() {


        const index =

            segments().findIndex(

                segment =>

                    segment.id ===
                    editingSegmentId

            );


        if (
            index < 0
        ) {


            throw new Error(

                "The segment being edited could not be found."

            );

        }


        const previousRecord =

            JSON.parse(

                JSON.stringify(

                    segments()[
                        index
                    ]

                )

            );


        const updatedRecord = {


            ...previousRecord,


            title:
                titleInput.value.trim(),


            importance:
                importanceSelect.value,


            participantIds:

                [
                    ...selectedParticipantIds
                ],


            summary:
                summaryInput.value.trim(),


            updatedAt:

                new Date()
                    .toISOString()

        };


        owlControlRoomData
            .segments[
                index
            ] = updatedRecord;


        try {


            await writeSegmentsFile();


            resetForm();


            showMessage(

                `Updated segment: ${updatedRecord.title}`,

                "success"

            );

        }


        catch (
            error
        ) {


            owlControlRoomData
                .segments[
                    index
                ] = previousRecord;


            throw error;

        }

    }



    // =================================
    // SAVE
    // =================================


    async function saveSegment() {


        clearMessage();


        if (
            saveButton.disabled
        ) {


            return;

        }


        saveButton.disabled =
            true;


        status.textContent =
            "SAVING";


        try {


            if (
                editingSegmentId
            ) {


                await updateSegment();

            }


            else {


                await createSegment();

            }

        }


        catch (
            error
        ) {


            console.error(
                error
            );


            showMessage(

                `Could not save segment: ${error.message}`,

                "error"

            );


            validateForm();

        }

    }



    // =================================
    // DELETE
    // =================================


    async function deleteSegment(
        segmentId
    ) {


        const index =

            segments().findIndex(

                segment =>

                    segment.id ===
                    segmentId

            );


        if (
            index < 0
        ) {


            showMessage(

                "Could not find that segment.",

                "error"

            );


            return;

        }


        const record =

            segments()[
                index
            ];


        const confirmed =

            window.confirm(

                `Delete segment "${record.title}"?\n\nThis removes it from OWL canon.`

            );


        if (
            !confirmed
        ) {


            return;

        }


        clearMessage();


        const removed =

            owlControlRoomData
                .segments
                .splice(
                    index,
                    1
                )[0];


        try {


            await writeSegmentsFile();


            if (
                editingSegmentId ===
                segmentId
            ) {


                resetForm();

            }


            else {


                renderHistory();


                validateForm();

            }


            setCount(

                "cr-count-segments",

                segments().length

            );


            showMessage(

                `Deleted segment: ${removed.title}`,

                "success"

            );

        }


        catch (
            error
        ) {


            owlControlRoomData
                .segments
                .splice(

                    index,
                    0,
                    removed

                );


            console.error(
                error
            );


            renderHistory();


            showMessage(

                `Could not delete segment: ${error.message}`,

                "error"

            );

        }

    }



    // =================================
    // INITIALIZE
    // =================================


    function initialize() {


        if (
            !Array.isArray(
                owlControlRoomData.segments
            )
        ) {


            return;

        }


        populateEvents();


        renderParticipants();


        renderHistory();


        validateForm();

    }



    // =================================
    // EVENTS
    // =================================


    eventSelect.addEventListener(

        "change",

        () => {


            clearMessage();


            renderHistory();


            validateForm();

        }

    );


    titleInput.addEventListener(

        "input",
        validateForm

    );


    summaryInput.addEventListener(

        "input",
        validateForm

    );


    participantSearch.addEventListener(

        "input",
        renderParticipants

    );


    saveButton.addEventListener(

        "click",
        saveSegment

    );


    cancelEditButton.addEventListener(

        "click",

        () => {


            clearMessage();


            resetForm();


            showMessage(

                "Segment edit canceled.",

                "success"

            );

        }

    );


    historyList.addEventListener(

        "click",

        event => {


            const button =

                event.target.closest(

                    "button[data-action]"

                );


            if (
                !button
            ) {


                return;

            }


            const segmentId =

                button.dataset.segmentId;


            if (
                button.dataset.action ===
                "edit-segment"
            ) {


                startEdit(
                    segmentId
                );

            }


            if (
                button.dataset.action ===
                "delete-segment"
            ) {


                deleteSegment(
                    segmentId
                );

            }

        }

    );


    window.addEventListener(

        "owl-control-room-data-loaded",

        initialize

    );


})();
