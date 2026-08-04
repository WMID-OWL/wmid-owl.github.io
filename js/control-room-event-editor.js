(() => {
    "use strict";

    const $ =
        id =>
            document.getElementById(
                id
            );


    const ui = {

        mode:
            $(
                "cr-event-editor-mode"
            ),

        select:
            $(
                "cr-event-editor-select"
            ),

        selectRow:
            $(
                "cr-event-editor-select-row"
            ),

        idPreview:
            $(
                "cr-event-id-preview"
            ),

        status:
            $(
                "cr-event-editor-status"
            ),

        preview:
            $(
                "cr-event-change-preview"
            ),

        changes:
            $(
                "cr-event-change-list"
            ),

        error:
            $(
                "cr-event-conflict-message"
            ),

        save:
            $(
                "cr-save-event"
            ),

        message:
            $(
                "cr-event-editor-message"
            )

    };


    const fields = {

        name:
            $(
                "cr-event-name"
            ),

        brand:
            $(
                "cr-event-brand"
            ),

        eventType:
            $(
                "cr-event-type"
            ),

        periodId:
            $(
                "cr-event-period"
            ),

        stage:
            $(
                "cr-event-stage"
            ),

        status:
            $(
                "cr-event-status"
            ),

        location:
            $(
                "cr-event-location"
            ),

        image:
            $(
                "cr-event-image"
            ),

        youtubeVideoId:
            $(
                "cr-event-youtube"
            ),

        tagline:
            $(
                "cr-event-tagline"
            ),

        description:
            $(
                "cr-event-description"
            )

    };


    if (
        Object.values(
            ui
        ).some(
            element =>
                !element
        )

        ||

        Object.values(
            fields
        ).some(
            element =>
                !element
        )
    ) {

        return;

    }


    const labels = {

        name:
            "Event Name",

        brand:
            "Show / Brand",

        eventType:
            "Event Type",

        periodId:
            "Month",

        stage:
            "Week",

        status:
            "Status",

        location:
            "Location",

        image:
            "Poster Path",

        youtubeVideoId:
            "YouTube Video",

        tagline:
            "Tagline",

        description:
            "Description"

    };


    let original =
        null;


    let pendingSelectionId =
        "";



    function clean(
        value
    ) {

        return String(
            value || ""
        ).trim();

    }



    function normal(
        value
    ) {

        return clean(
            value
        ).toLowerCase();

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



    function calendar() {

        return window.OWLCalendar || null;

    }



    function normalizeStage(
        value
    ) {

        const helper =
            calendar();


        if (
            helper

            &&

            typeof helper.normalizeStage ===
                "function"
        ) {

            return helper.normalizeStage(
                value
            );

        }


        const match =
            normal(
                value
            )
                .replace(
                    /_/g,
                    "-"
                )
                .match(
                    /^(?:week-?)?([1-4])$/
                );


        return match
            ? `week-${match[1]}`
            : "";

    }



    function formatSlot(
        record
    ) {

        const helper =
            calendar();


        if (
            helper

            &&

            typeof helper.formatEventSlot ===
                "function"
        ) {

            return helper.formatEventSlot(
                record
            );

        }


        return "Schedule Not Set";

    }



    function compareEvents(
        eventA,
        eventB
    ) {

        const helper =
            calendar();


        if (
            helper

            &&

            typeof helper.compareEvents ===
                "function"
        ) {

            return helper.compareEvents(
                eventA,
                eventB
            );

        }


        return clean(
            eventA?.name
        ).localeCompare(
            clean(
                eventB?.name
            )
        );

    }



    function setStatus(
        value
    ) {

        ui.status.textContent =
            value;

    }



    function hideMessage() {

        ui.message.hidden =
            true;


        ui.message.textContent =
            "";


        ui.message.className =
            "cr-save-message";

    }



    function showMessage(
        value,
        type = "success"
    ) {

        ui.message.textContent =
            value;


        ui.message.className =

            `cr-save-message ${
                type === "error"

                    ? "save-error"

                    : "save-success"
            }`;


        ui.message.hidden =
            false;

    }



    function slugify(
        value
    ) {

        return clean(
            value
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
                /['’]/g,
                ""
            )
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



    function createId(
        record
    ) {

        const slug =
            slugify(
                record.name
            );


        if (
            !slug

            ||

            !/^\d{4}-(0[1-9]|1[0-2])$/.test(
                record.periodId
            )

            ||

            !record.stage
        ) {

            return "";

        }


        if (
            record.eventType ===
                "ppv"
        ) {

            return `${slug}-${record.periodId.slice(
                0,
                4
            )}`;

        }


        return `${slug}-${record.periodId}-${record.stage}`;

    }



    function extractYouTubeId(
        value
    ) {

        const raw =
            clean(
                value
            );


        const pattern =
            /^[A-Za-z0-9_-]{11}$/;


        if (!raw) {

            return "";

        }


        if (
            pattern.test(
                raw
            )
        ) {

            return raw;

        }


        try {

            const url =
                new URL(
                    raw
                );


            const host =
                url.hostname
                    .replace(
                        /^www\./i,
                        ""
                    )
                    .toLowerCase();


            let id =
                "";


            if (
                host ===
                    "youtu.be"
            ) {

                id =
                    url.pathname
                        .split(
                            "/"
                        )
                        .filter(
                            Boolean
                        )[0]

                    ||

                    "";

            }


            else if (
                host.endsWith(
                    "youtube.com"
                )

                ||

                host.endsWith(
                    "youtube-nocookie.com"
                )
            ) {

                if (
                    url.pathname ===
                        "/watch"
                ) {

                    id =
                        url.searchParams.get(
                            "v"
                        )

                        ||

                        "";

                }


                else {

                    const parts =
                        url.pathname
                            .split(
                                "/"
                            )
                            .filter(
                                Boolean
                            );


                    if (
                        [
                            "embed",
                            "shorts",
                            "live"
                        ].includes(
                            parts[0]
                        )
                    ) {

                        id =
                            parts[1] || "";

                    }

                }

            }


            return pattern.test(
                id
            )

                ? id

                : "";

        }


        catch {

            return "";

        }

    }



    function getForm() {

        return {

            name:
                fields.name.value.trim(),

            brand:
                fields.brand.value,

            eventType:
                fields.eventType.value,

            periodId:
                fields.periodId.value,

            stage:
                normalizeStage(
                    fields.stage.value
                ),

            status:
                fields.status.value,

            location:
                fields.location.value.trim(),

            image:
                fields.image.value.trim(),

            youtubeVideoId:
                extractYouTubeId(
                    fields.youtubeVideoId.value
                ),

            tagline:
                fields.tagline.value.trim(),

            description:
                fields.description.value.trim()

        };

    }



    function editable(
        event
    ) {

        return {

            name:
                event?.name || "",

            brand:
                event?.brand || "",

            eventType:
                event?.eventType || "weekly",

            periodId:
                event?.periodId || "",

            stage:
                normalizeStage(
                    event?.stage
                ),

            status:
                event?.status || "upcoming",

            location:
                event?.location || "",

            image:
                event?.image || "",

            youtubeVideoId:
                extractYouTubeId(
                    event?.youtubeVideoId || ""
                ),

            tagline:
                event?.tagline || "",

            description:
                event?.description || ""

        };

    }



    function fill(
        record
    ) {

        fields.name.value =
            record.name || "";


        fields.brand.value =
            record.brand || "";


        fields.eventType.value =
            record.eventType || "weekly";


        fields.periodId.value =
            record.periodId || "";


        fields.stage.value =
            normalizeStage(
                record.stage
            );


        fields.status.value =
            record.status || "upcoming";


        fields.location.value =
            record.location || "";


        fields.image.value =
            record.image || "";


        fields.youtubeVideoId.value =

            record.youtubeVideoId

                ? `https://www.youtube.com/watch?v=${record.youtubeVideoId}`

                : "";


        fields.tagline.value =
            record.tagline || "";


        fields.description.value =
            record.description || "";

    }



    function clearForm() {

        fill({

            eventType:
                "weekly",

            status:
                "upcoming"

        });


        original =
            null;


        ui.idPreview.textContent =
            "—";


        ui.preview.hidden =
            true;


        ui.changes.innerHTML =
            "";


        ui.error.hidden =
            true;


        ui.error.textContent =
            "";


        ui.save.disabled =
            true;

    }



    function eventData() {

        return (

            typeof owlControlRoomData !==
                "undefined"

            &&

            Array.isArray(
                owlControlRoomData.events
            )
        )

            ? owlControlRoomData.events

            : [];

    }



    function populateEvents() {

        const events =
            [
                ...eventData()
            ].sort(
                compareEvents
            );


        const preferred =
            pendingSelectionId

            ||

            ui.select.value;


        pendingSelectionId =
            "";


        ui.select.innerHTML =
            `<option value="">Select Event</option>`;


        events.forEach(
            event => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    event.id;


                option.textContent =
                    `${formatSlot(
                        event
                    )} — ${event.name || event.id}`;


                ui.select.appendChild(
                    option
                );

            }
        );


        if (
            events.some(
                event =>
                    event.id ===
                        preferred
            )
        ) {

            ui.select.value =
                preferred;

        }


        if (
            ui.mode.value ===
                "edit"

            &&

            ui.select.value
        ) {

            loadSelected();

        }


        else if (
            ui.mode.value ===
                "edit"
        ) {

            clearForm();


            setStatus(
                events.length

                    ? "SELECT EVENT"

                    : "NO EVENTS"
            );

        }

    }



    function loadSelected() {

        hideMessage();


        const event =
            eventData().find(
                item =>
                    item.id ===
                        ui.select.value
            );


        if (!event) {

            clearForm();


            setStatus(
                "SELECT EVENT"
            );


            return;

        }


        original =
            editable(
                event
            );


        fill(
            original
        );


        ui.idPreview.textContent =
            event.id;


        review();


        setStatus(
            "READY"
        );

    }



    function changeMode() {

        hideMessage();


        clearForm();


        const creating =
            ui.mode.value ===
                "create";


        ui.selectRow.hidden =
            creating;


        ui.save.textContent =

            creating

                ? "Create Event"

                : "Save Event Changes";


        setStatus(

            creating

                ? "NEW EVENT"

                : "SELECT EVENT"

        );


        if (creating) {

            review();

        }


        else if (
            ui.select.value
        ) {

            loadSelected();

        }

    }



    function displayValue(
        key,
        value
    ) {

        const helper =
            calendar();


        if (
            key ===
                "periodId"
        ) {

            if (
                helper

                &&

                typeof helper.formatPeriod ===
                    "function"
            ) {

                return helper.formatPeriod(
                    value
                );

            }


            return clean(
                value
            ) || "Empty";

        }


        if (
            key ===
                "stage"
        ) {

            if (
                helper

                &&

                typeof helper.formatStage ===
                    "function"
            ) {

                return helper.formatStage(
                    value
                );

            }


            return clean(
                value
            ) || "Empty";

        }


        return (

            value === ""

            ||

            value === null

            ||

            value === undefined
        )

            ? "Empty"

            : String(
                value
            );

    }



    function getChanges() {

        if (!original) {

            return {};

        }


        const current =
            getForm();


        return Object.keys(
            labels
        ).reduce(
            (
                changes,
                key
            ) => {


                if (
                    JSON.stringify(
                        current[key]
                    )

                    !==

                    JSON.stringify(
                        original[key]
                    )
                ) {

                    changes[key] =
                        current[key];

                }


                return changes;

            },
            {}
        );

    }



    function validate(
        record
    ) {

        const errors =
            [];


        if (!record.name) {

            errors.push(
                "Event name is required."
            );

        }


        if (!record.brand) {

            errors.push(
                "Show / brand is required."
            );

        }


        if (
            ![
                "weekly",
                "ppv"
            ].includes(
                record.eventType
            )
        ) {

            errors.push(
                "Select a valid event type."
            );

        }


        if (
            !/^\d{4}-(0[1-9]|1[0-2])$/.test(
                record.periodId
            )
        ) {

            errors.push(
                "Select a valid event month."
            );

        }


        if (
            ![
                "week-1",
                "week-2",
                "week-3",
                "week-4"
            ].includes(
                record.stage
            )
        ) {

            errors.push(
                "Select Week 1, Week 2, Week 3, or Week 4."
            );

        }


        if (
            ![
                "upcoming",
                "completed"
            ].includes(
                record.status
            )
        ) {

            errors.push(
                "Select a valid event status."
            );

        }


        if (
            fields.youtubeVideoId.value.trim()

            &&

            !record.youtubeVideoId
        ) {

            errors.push(
                "The YouTube value is not a supported URL or clean video ID."
            );

        }


        return errors;

    }



    function findConflict(
        record,
        currentId = ""
    ) {

        return eventData().find(
            event => {


                if (
                    event.id ===
                        currentId

                    ||

                    event.periodId !==
                        record.periodId
                ) {

                    return false;

                }


                if (
                    record.eventType ===
                        "ppv"
                ) {

                    return normal(
                        event.eventType
                    ) ===
                        "ppv";

                }


                return (

                    normalizeStage(
                        event.stage
                    ) ===
                        record.stage

                    &&

                    normal(
                        event.eventType
                    ) ===
                        "weekly"

                    &&

                    normal(
                        event.brand
                    ) ===
                        normal(
                            record.brand
                        )

                );

            }
        ) || null;

    }



    function addRow(
        label,
        oldValue,
        newValue,
        creating
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "cr-editor-change-row";


        row.innerHTML =

            creating

                ? `
                    <strong>
                        ${escapeHtml(label)}
                    </strong>

                    <span>
                        ${escapeHtml(newValue)}
                    </span>
                `

                : `
                    <strong>
                        ${escapeHtml(label)}
                    </strong>

                    <span>
                        ${escapeHtml(oldValue)}
                        →
                        ${escapeHtml(newValue)}
                    </span>
                `;


        ui.changes.appendChild(
            row
        );

    }



    function review() {

        hideMessage();


        ui.changes.innerHTML =
            "";


        ui.error.hidden =
            true;


        ui.error.textContent =
            "";


        const record =
            getForm();


        const creating =
            ui.mode.value ===
                "create";


        const currentId =
            creating
                ? ""
                : ui.select.value;


        const errors =
            validate(
                record
            );


        const conflict =
            findConflict(
                record,
                currentId
            );


        if (creating) {

            ui.idPreview.textContent =
                createId(
                    record
                ) || "—";


            Object.keys(
                labels
            ).forEach(
                key => {

                    addRow(

                        labels[key],

                        "",

                        displayValue(
                            key,
                            record[key]
                        ),

                        true

                    );

                }
            );

        }


        else if (original) {

            ui.idPreview.textContent =
                ui.select.value || "—";


            const changes =
                getChanges();


            Object.entries(
                changes
            ).forEach(
                (
                    [
                        key,
                        value
                    ]
                ) => {

                    addRow(

                        labels[key],

                        displayValue(
                            key,
                            original[key]
                        ),

                        displayValue(
                            key,
                            value
                        ),

                        false

                    );

                }
            );


            if (
                Object.keys(
                    changes
                ).length ===
                    0
            ) {

                ui.preview.hidden =
                    true;


                ui.save.disabled =
                    true;


                setStatus(
                    "READY"
                );


                return;

            }

        }


        else {

            ui.preview.hidden =
                true;


            ui.save.disabled =
                true;


            return;

        }


        ui.preview.hidden =
            false;


        if (
            errors.length
        ) {

            ui.error.textContent =
                errors.join(
                    " "
                );


            ui.error.hidden =
                false;


            ui.save.disabled =
                true;


            setStatus(
                "CHECK FIELDS"
            );


            return;

        }


        if (conflict) {

            ui.error.textContent =
                `Schedule conflict: ${conflict.name || conflict.id} already occupies ${formatSlot(conflict)}.`;


            ui.error.hidden =
                false;


            ui.save.disabled =
                true;


            setStatus(
                "CONFLICT"
            );


            return;

        }


        if (
            creating

            &&

            !createId(
                record
            )
        ) {

            ui.error.textContent =
                "A database ID could not be generated from the event name and schedule.";


            ui.error.hidden =
                false;


            ui.save.disabled =
                true;


            setStatus(
                "CHECK FIELDS"
            );


            return;

        }


        ui.save.disabled =
            false;


        setStatus(
            "REVIEW"
        );

    }



    async function ensurePermission() {

        if (
            typeof owlRepositoryHandle ===
                "undefined"

            ||

            !owlRepositoryHandle
        ) {

            return false;

        }


        const options = {

            mode:
                "readwrite"

        };


        if (
            await owlRepositoryHandle
                .queryPermission(
                    options
                )

            ===
                "granted"
        ) {

            return true;

        }


        return (

            await owlRepositoryHandle
                .requestPermission(
                    options
                )

            ===
                "granted"

        );

    }



    async function readFile() {

        const dataDirectory =
            await owlRepositoryHandle
                .getDirectoryHandle(
                    "data"
                );


        const fileHandle =
            await dataDirectory
                .getFileHandle(
                    "events.json"
                );


        const file =
            await fileHandle
                .getFile();


        const events =
            JSON.parse(
                await file.text()
            );


        if (
            !Array.isArray(
                events
            )
        ) {

            throw new Error(
                "data/events.json must contain a JSON array."
            );

        }


        return {

            fileHandle,
            events

        };

    }



    async function writeFile(
        fileHandle,
        events
    ) {

        const writable =
            await fileHandle
                .createWritable();


        try {

            await writable.write(

                `${JSON.stringify(
                    events,
                    null,
                    2
                )}\n`

            );


            await writable.close();

        }


        catch (
            error
        ) {

            try {

                await writable.abort();

            }


            catch {

                // No additional action required.

            }


            throw error;

        }

    }



    function storedRecord(
        form,
        existing = null
    ) {

        const record =
            existing

                ? {
                    ...existing
                }

                : {
                    id:
                        createId(
                            form
                        )
                };


        Object.assign(
            record,
            {

                name:
                    form.name,

                brand:
                    form.brand,

                eventType:
                    form.eventType,

                periodId:
                    form.periodId,

                stage:
                    form.stage,

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

            }
        );


        if (
            form.youtubeVideoId
        ) {

            record.youtubeVideoId =
                form.youtubeVideoId;

        }


        else {

            delete record.youtubeVideoId;

        }


        /*
         * Existing legacy date fields remain temporarily
         * until every OWL event reader is migrated.
         *
         * Newly created records do not receive an
         * exact-day date field.
         */


        return record;

    }



    async function save() {

        ui.save.disabled =
            true;


        setStatus(
            "SAVING..."
        );


        hideMessage();


        const wasCreating =
            ui.mode.value ===
                "create";


        try {

            if (
                !await ensurePermission()
            ) {

                throw new Error(
                    "Write permission was not granted."
                );

            }


            const form =
                getForm();


            const errors =
                validate(
                    form
                );


            if (
                errors.length
            ) {

                throw new Error(
                    errors.join(
                        " "
                    )
                );

            }


            const currentId =
                wasCreating
                    ? ""
                    : ui.select.value;


            const conflict =
                findConflict(
                    form,
                    currentId
                );


            if (conflict) {

                throw new Error(
                    `Schedule conflict: ${conflict.name || conflict.id} already occupies ${formatSlot(conflict)}.`
                );

            }


            const {
                fileHandle,
                events
            } =
                await readFile();


            let savedId =
                "";


            if (wasCreating) {

                const record =
                    storedRecord(
                        form
                    );


                if (
                    events.some(
                        event =>
                            event.id ===
                                record.id
                    )
                ) {

                    throw new Error(
                        "An event with this database ID already exists."
                    );

                }


                events.push(
                    record
                );


                savedId =
                    record.id;

            }


            else {

                const index =
                    events.findIndex(
                        event =>
                            event.id ===
                                ui.select.value
                    );


                if (
                    index === -1
                ) {

                    throw new Error(
                        "The selected event could not be found in data/events.json."
                    );

                }


                const stableId =
                    events[index].id;


                events[index] =
                    storedRecord(

                        form,

                        events[index]

                    );


                events[index].id =
                    stableId;


                savedId =
                    stableId;

            }


            events.sort(
                compareEvents
            );


            await writeFile(
                fileHandle,
                events
            );


            pendingSelectionId =
                savedId;


            ui.mode.value =
                "edit";


            ui.selectRow.hidden =
                false;


            ui.save.textContent =
                "Save Event Changes";


            await loadRepositoryData(
                owlRepositoryHandle
            );


            showMessage(

                wasCreating

                    ? `${form.name} was created in data/events.json.`

                    : `${form.name} was saved in data/events.json.`

            );


            setStatus(
                "SAVED"
            );

        }


        catch (
            error
        ) {

            console.error(
                "Could not save event:",
                error
            );


            review();


            showMessage(

                error.message

                ||

                "The event could not be saved.",

                "error"

            );


            setStatus(
                "SAVE FAILED"
            );

        }

    }



    ui.mode.addEventListener(
        "change",
        changeMode
    );


    ui.select.addEventListener(
        "change",
        loadSelected
    );


    Object.values(
        fields
    ).forEach(
        field => {

            field.addEventListener(
                "input",
                review
            );


            field.addEventListener(
                "change",
                review
            );

        }
    );


    ui.save.addEventListener(
        "click",
        save
    );


    window.addEventListener(

        "owl-control-room-data-loaded",

        populateEvents

    );


    try {

        if (
            typeof owlControlRoomData !==
                "undefined"

            &&

            Array.isArray(
                owlControlRoomData.events
            )
        ) {

            populateEvents();

        }

    }


    catch (
        error
    ) {

        console.warn(
            "Event Manager waiting for repository data.",
            error
        );

    }

})();
