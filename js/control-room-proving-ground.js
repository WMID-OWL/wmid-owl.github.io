(function () {

    "use strict";


    // =================================
    // PAGE ELEMENTS
    // =================================


    const entrySelect =
        document.getElementById(
            "cr-proving-entry-select"
        );


    const entryCount =
        document.getElementById(
            "cr-proving-entry-count"
        );


    const deleteButton =
        document.getElementById(
            "cr-proving-delete-entry"
        );


    const yearField =
        document.getElementById(
            "cr-proving-year"
        );


    const brandField =
        document.getElementById(
            "cr-proving-brand"
        );


    const divisionField =
        document.getElementById(
            "cr-proving-division"
        );


    const slotField =
        document.getElementById(
            "cr-proving-slot"
        );


    const wrestlerField =
        document.getElementById(
            "cr-proving-wrestler"
        );


    const statusField =
        document.getElementById(
            "cr-proving-status"
        );


    const noteField =
        document.getElementById(
            "cr-proving-note"
        );


    const preview =
        document.getElementById(
            "cr-proving-preview"
        );


    const changeList =
        document.getElementById(
            "cr-proving-change-list"
        );


    const errorMessage =
        document.getElementById(
            "cr-proving-error"
        );


    const saveButton =
        document.getElementById(
            "cr-proving-save"
        );


    const message =
        document.getElementById(
            "cr-proving-message"
        );


    if (
        !entrySelect ||
        !entryCount ||
        !deleteButton ||
        !yearField ||
        !brandField ||
        !divisionField ||
        !slotField ||
        !wrestlerField ||
        !statusField ||
        !noteField ||
        !preview ||
        !changeList ||
        !errorMessage ||
        !saveButton ||
        !message
    ) {

        console.warn(
            "Proving Ground Manager HTML is incomplete."
        );


        return;

    }



    // =================================
    // QUALIFICATION SLOTS
    // =================================


    const qualificationSlots = {

        "1": {
            shortLabel:
                "#1 W/L Average",

            fullLabel:
                "Slot 1 — #1 W/L Average"
        },

        "2": {
            shortLabel:
                "#2 W/L Average",

            fullLabel:
                "Slot 2 — #2 W/L Average"
        },

        "3": {
            shortLabel:
                "Best PPV Performer",

            fullLabel:
                "Slot 3 — Best PPV Performer"
        },

        "4": {
            shortLabel:
                "Wildcard Play-In Winner",

            fullLabel:
                "Slot 4 — Wildcard Play-In Winner"
        }

    };



    // =================================
    // DATA HELPERS
    // =================================


    function getDatabase() {


        const database =
            owlControlRoomData.provingGround;


        if (
            !database ||
            Array.isArray(
                database
            ) ||
            typeof database !==
                "object"
        ) {

            return {

                entries:
                    [],

                blockResults:
                    [],

                finals:
                    []

            };

        }


        return {

            ...database,

            entries:

                Array.isArray(
                    database.entries
                )

                    ? database.entries

                    : [],

            blockResults:

                Array.isArray(
                    database.blockResults
                )

                    ? database.blockResults

                    : [],

            finals:

                Array.isArray(
                    database.finals
                )

                    ? database.finals

                    : []

        };

    }



    function getWrestlers() {


        return Array.isArray(
            owlControlRoomData.wrestlers
        )

            ? owlControlRoomData.wrestlers

            : [];

    }



    function getWrestler(
        wrestlerId
    ) {


        return getWrestlers().find(
            wrestler =>
                wrestler.id ===
                wrestlerId
        ) || null;

    }



    function createEntryId(
        draft
    ) {


        const baseId =

            [
                "proving-ground",
                draft.year,
                draft.brand,
                draft.division,
                `slot-${draft.slot}`,
                draft.wrestlerId
            ]

                .join(
                    "-"
                )

                .toLowerCase()

                .replace(
                    /['’]/g,
                    ""
                )

                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                )

                .replace(
                    /^-+|-+$/g,
                    ""
                );


        return baseId ||
            "proving-ground-entry";

    }



    // =================================
    // MESSAGES
    // =================================


    function showMessage(
        text,
        type = "success"
    ) {


        message.textContent =
            text;


        message.className =

            `cr-save-message ${
                type === "error"

                    ? "save-error"

                    : "save-success"
            }`;


        message.hidden =
            false;

    }



    function hideMessage() {


        message.hidden =
            true;


        message.textContent =
            "";

    }



    // =================================
    // ENTRY DIRECTORY
    // =================================


    function renderEntrySelect() {


        const database =
            getDatabase();


        entrySelect.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =

            database.entries.length

                ? "Select Proving Ground Entry"

                : "No Proving Ground Entries";


        entrySelect.appendChild(
            placeholder
        );


        const sortedEntries = [

            ...database.entries

        ].sort(
            (
                entryA,
                entryB
            ) => {


                return (

                    Number(
                        entryB.year || 0
                    )

                    -

                    Number(
                        entryA.year || 0
                    )

                    ||

                    String(
                        entryA.brand || ""
                    ).localeCompare(
                        String(
                            entryB.brand || ""
                        )
                    )

                    ||

                    String(
                        entryA.division || ""
                    ).localeCompare(
                        String(
                            entryB.division || ""
                        )
                    )

                    ||

                    Number(
                        entryA.slot || 0
                    )

                    -

                    Number(
                        entryB.slot || 0
                    )

                );

            }
        );


        sortedEntries.forEach(
            entry => {


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    entry.id;


                option.textContent =

                    `${entry.year || "—"} — ${entry.brand || "—"} ${entry.division || "—"} — Slot ${entry.slot || "—"} — ${entry.wrestlerName || entry.name || entry.wrestlerId || "Unnamed"}`;


                entrySelect.appendChild(
                    option
                );

            }
        );


        entrySelect.disabled =
            database.entries.length ===
            0;


        entryCount.textContent =
            String(
                database.entries.length
            );


        deleteButton.disabled =
            true;

    }



    // =================================
    // ELIGIBLE WRESTLERS
    // =================================


    function populateWrestlers() {


        const brand =
            brandField.value;


        const division =
            divisionField.value;


        const year =
            Number(
                yearField.value
            );


        wrestlerField.innerHTML =
            "";


        if (
            !brand ||
            !division
        ) {


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";


            option.textContent =
                "Select Show and Division First";


            wrestlerField.appendChild(
                option
            );


            wrestlerField.disabled =
                true;


            renderPreview();


            return;

        }


        const database =
            getDatabase();


        const alreadyEnteredWrestlers =
            new Set(

                database.entries

                    .filter(
                        entry =>

                            Number(
                                entry.year
                            ) ===
                                year
                    )

                    .map(
                        entry =>
                            entry.wrestlerId
                    )

                    .filter(
                        Boolean
                    )

            );


        const eligibleWrestlers =

            getWrestlers()

                .filter(
                    wrestler =>

                        wrestler.brand ===
                            brand

                        &&

                        wrestler.division ===
                            division

                        &&

                        !alreadyEnteredWrestlers.has(
                            wrestler.id
                        )
                )

                .sort(
                    (
                        wrestlerA,
                        wrestlerB
                    ) =>

                        String(
                            wrestlerA.name || ""
                        ).localeCompare(
                            String(
                                wrestlerB.name || ""
                            )
                        )
                );


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =

            eligibleWrestlers.length

                ? "Select Wrestler"

                : "No Eligible Wrestlers";


        wrestlerField.appendChild(
            placeholder
        );


        eligibleWrestlers.forEach(
            wrestler => {


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    wrestler.id;


                option.textContent =
                    wrestler.name ||
                    wrestler.id;


                wrestlerField.appendChild(
                    option
                );

            }
        );


        wrestlerField.disabled =
            eligibleWrestlers.length ===
            0;


        renderPreview();

    }



    // =================================
    // DRAFT
    // =================================


    function getDraft() {


        const slot =
            slotField.value;


        const slotMeta =
            qualificationSlots[
                slot
            ] || null;


        const wrestler =
            getWrestler(
                wrestlerField.value
            );


        const draft = {

            year:
                Number(
                    yearField.value
                ),

            brand:
                brandField.value,

            division:
                divisionField.value,

            slot:
                Number(
                    slot
                ),

            wrestlerId:
                wrestler?.id || "",

            wrestlerName:
                wrestler?.name || "",

            name:
                wrestler?.name || "",

            qualification:

                slotMeta
                    ?.fullLabel || "",

            qualificationMethod:

                slotMeta
                    ?.shortLabel || "",

            qualificationPath:

                slotMeta
                    ?.fullLabel || "",

            status:
                statusField.value,

            note:
                noteField.value.trim(),

            wins:
                0,

            losses:
                0,

            draws:
                0,

            combatPoints:
                0,

            points:
                0,

            createdAt:
                new Date().toISOString()

        };


        draft.blockId =

            `${draft.brand}-${draft.division}`

                .toLowerCase()

                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                )

                .replace(
                    /^-+|-+$/g,
                    ""
                );


        draft.blockLabel =

            draft.brand &&
            draft.division

                ? `${draft.brand} ${draft.division}`

                : "";


        draft.id =
            createEntryId(
                draft
            );


        return draft;

    }



    // =================================
    // VALIDATION
    // =================================


    function validateDraft(
        draft
    ) {


        if (
            !Number.isInteger(
                draft.year
            ) ||
            draft.year <
                2026
        ) {

            return "Enter a valid tournament year.";

        }


        if (!draft.brand) {

            return "Select a show.";

        }


        if (!draft.division) {

            return "Select a division.";

        }


        if (
            !Number.isInteger(
                draft.slot
            ) ||
            draft.slot <
                1 ||
            draft.slot >
                4
        ) {

            return "Select a qualification slot.";

        }


        if (!draft.wrestlerId) {

            return "Select a wrestler.";

        }


        const wrestler =
            getWrestler(
                draft.wrestlerId
            );


        if (!wrestler) {

            return "The selected wrestler could not be found.";

        }


        if (
            wrestler.brand !==
                draft.brand ||
            wrestler.division !==
                draft.division
        ) {

            return "The selected wrestler does not belong to that show and division.";

        }


        const database =
            getDatabase();


        const slotConflict =

            database.entries.find(
                entry =>

                    Number(
                        entry.year
                    ) ===
                        draft.year

                    &&

                    entry.brand ===
                        draft.brand

                    &&

                    entry.division ===
                        draft.division

                    &&

                    Number(
                        entry.slot
                    ) ===
                        draft.slot
            );


        if (slotConflict) {

            return `Slot ${draft.slot} is already filled for ${draft.brand} ${draft.division} in ${draft.year}.`;

        }


        const wrestlerConflict =

            database.entries.find(
                entry =>

                    Number(
                        entry.year
                    ) ===
                        draft.year

                    &&

                    entry.wrestlerId ===
                        draft.wrestlerId
            );


        if (wrestlerConflict) {

            return `${draft.wrestlerName} is already entered in the ${draft.year} Proving Ground.`;

        }


        return "";

    }



    // =================================
    // PREVIEW
    // =================================


    function addReviewRow(
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
            value || "—";


        row.append(
            labelElement,
            valueElement
        );


        changeList.appendChild(
            row
        );

    }



    function renderPreview() {


        const draft =
            getDraft();


        const formStarted =

            Boolean(
                draft.brand ||
                draft.division ||
                draft.slot ||
                draft.wrestlerId
            );


        if (!formStarted) {


            preview.hidden =
                true;


            saveButton.disabled =
                true;


            errorMessage.hidden =
                true;


            return;

        }


        changeList.innerHTML =
            "";


        errorMessage.hidden =
            true;


        errorMessage.textContent =
            "";


        addReviewRow(
            "DATABASE ID",
            draft.id
        );


        addReviewRow(
            "YEAR",
            String(
                draft.year || "—"
            )
        );


        addReviewRow(
            "BLOCK",
            draft.blockLabel
        );


        addReviewRow(
            "QUALIFICATION",
            draft.qualification
        );


        addReviewRow(
            "WRESTLER",
            draft.wrestlerName
        );


        addReviewRow(
            "STATUS",
            draft.status
        );


        addReviewRow(
            "NOTE",
            draft.note
        );


        preview.hidden =
            false;


        const validationError =
            validateDraft(
                draft
            );


        if (validationError) {


            errorMessage.textContent =
                validationError;


            errorMessage.hidden =
                false;


            saveButton.disabled =
                true;


            return;

        }


        saveButton.disabled =
            false;

    }



    // =================================
    // FORM RESET
    // =================================


    function resetForm() {


        yearField.value =
            String(
                new Date().getFullYear()
            );


        brandField.value =
            "";


        divisionField.value =
            "";


        slotField.value =
            "";


        statusField.value =
            "Upcoming";


        noteField.value =
            "";


        wrestlerField.innerHTML = `

            <option value="">
                Select Show and Division First
            </option>

        `;


        wrestlerField.disabled =
            true;


        preview.hidden =
            true;


        errorMessage.hidden =
            true;


        errorMessage.textContent =
            "";


        saveButton.disabled =
            true;

    }



    // =================================
    // SAVE ENTRY
    // =================================


    async function saveEntry() {


        try {


            hideMessage();


            const draft =
                getDraft();


            const validationError =
                validateDraft(
                    draft
                );


            if (validationError) {


                showMessage(
                    validationError,
                    "error"
                );


                renderPreview();


                return;

            }


            const database =
                getDatabase();


            const updatedDatabase = {

                ...database,

                updatedAt:
                    new Date().toISOString(),

                entries: [

                    ...database.entries,

                    draft

                ]

            };


            saveButton.disabled =
                true;


            await writeControlRoomJsonFile(
                "proving-ground.json",
                updatedDatabase
            );


            await loadRepositoryData(
                owlRepositoryHandle
            );


            resetForm();


            showMessage(

                `${draft.wrestlerName} was added to the ${draft.year} ${draft.blockLabel} Proving Ground field.`

            );

        }


        catch (error) {


            console.error(
                "Could not save Proving Ground entry:",
                error
            );


            showMessage(
                error.message ||
                "The Proving Ground entry could not be saved.",
                "error"
            );


            renderPreview();

        }

    }



    // =================================
    // DELETE ENTRY
    // =================================


    function entryHasRecordedData(
        database,
        entry
    ) {


        const recordedData = [

            ...database.blockResults,

            ...database.finals

        ];


        return recordedData.some(
            record =>

                JSON.stringify(
                    record
                ).includes(
                    entry.id
                )
        );

    }



    async function deleteEntry() {


        try {


            hideMessage();


            const database =
                getDatabase();


            const selectedEntry =

                database.entries.find(
                    entry =>
                        entry.id ===
                        entrySelect.value
                );


            if (!selectedEntry) {


                showMessage(
                    "Select a Proving Ground entry first.",
                    "error"
                );


                return;

            }


            if (
                entryHasRecordedData(
                    database,
                    selectedEntry
                )
            ) {


                showMessage(
                    "This entrant already has block results or final data and cannot be deleted.",
                    "error"
                );


                return;

            }


            const confirmation =
                window.prompt(

                    `Type DELETE PROVING ENTRY to remove "${selectedEntry.wrestlerName || selectedEntry.name}".`

                );


            if (
                confirmation !==
                "DELETE PROVING ENTRY"
            ) {


                showMessage(
                    "Proving Ground entry deletion cancelled.",
                    "error"
                );


                return;

            }


            deleteButton.disabled =
                true;


            const updatedDatabase = {

                ...database,

                updatedAt:
                    new Date().toISOString(),

                entries:

                    database.entries.filter(
                        entry =>
                            entry.id !==
                            selectedEntry.id
                    )

            };


            await writeControlRoomJsonFile(
                "proving-ground.json",
                updatedDatabase
            );


            await loadRepositoryData(
                owlRepositoryHandle
            );


            showMessage(

                `${selectedEntry.wrestlerName || selectedEntry.name} was removed from the Proving Ground field.`

            );

        }


        catch (error) {


            console.error(
                "Could not delete Proving Ground entry:",
                error
            );


            showMessage(
                error.message ||
                "The Proving Ground entry could not be deleted.",
                "error"
            );

        }

    }



    // =================================
    // INITIALIZE
    // =================================


    function initializeManager() {


        hideMessage();


        renderEntrySelect();


        resetForm();

    }



    // =================================
    // EVENTS
    // =================================


    yearField.addEventListener(
        "input",
        () => {


            populateWrestlers();


            renderPreview();

        }
    );


    brandField.addEventListener(
        "change",
        populateWrestlers
    );


    divisionField.addEventListener(
        "change",
        populateWrestlers
    );


    slotField.addEventListener(
        "change",
        renderPreview
    );


    wrestlerField.addEventListener(
        "change",
        renderPreview
    );


    statusField.addEventListener(
        "change",
        renderPreview
    );


    noteField.addEventListener(
        "input",
        renderPreview
    );


    entrySelect.addEventListener(
        "change",
        () => {


            deleteButton.disabled =
                !entrySelect.value;

        }
    );


    saveButton.addEventListener(
        "click",
        saveEntry
    );


    deleteButton.addEventListener(
        "click",
        deleteEntry
    );


    window.addEventListener(

        "owl-control-room-data-loaded",

        initializeManager

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
                owlControlRoomData.wrestlers
            )
        ) {


            initializeManager();

        }


    }


    catch (error) {


        console.warn(
            "Proving Ground Manager waiting for repository data."
        );

    }

}());
