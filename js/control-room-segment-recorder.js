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



    // =================================
    // HELPERS
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



    function eventName(
        eventId
    ) {


        const event =

            events().find(

                item =>

                    item.id ===
                    eventId

            );


        return event
            ?.name

            ||

            eventId;

    }



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


                card.appendChild(
                    heading
                );


                card.appendChild(
                    participants
                );


                card.appendChild(
                    summary
                );


                historyList.appendChild(
                    card
                );

            }

        );

    }



    // =================================
    // VALIDATION
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


        status.textContent =

            valid

                ? "READY TO SAVE"

                : "READY";

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
    // SAVE
    // =================================


    async function saveSegment() {


        clearMessage();


        if (
            saveButton.disabled
        ) {


            return;

        }


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


        saveButton.disabled =
            true;


        status.textContent =
            "SAVING";


        try {


            owlControlRoomData
                .segments
                .push(
                    record
                );


            await writeSegmentsFile();


            setCount(

                "cr-count-segments",

                owlControlRoomData
                    .segments
                    .length

            );


            titleInput.value =
                "";


            summaryInput.value =
                "";


            importanceSelect.value =
                "regular";


            selectedParticipantIds.clear();


            participantSearch.value =
                "";


            renderParticipants();


            renderHistory();


            validateForm();


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


    window.addEventListener(

        "owl-control-room-data-loaded",

        initialize

    );


})();
