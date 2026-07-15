// =================================
// OWL CONTROL ROOM
// FULL WRESTLER MANAGER
// =================================


// =================================
// ELEMENTS
// =================================


const crEditorMode =
    document.getElementById(
        "cr-wrestler-editor-mode"
    );


const crEditorSelect =
    document.getElementById(
        "cr-wrestler-editor-select"
    );


const crEditorSelectRow =
    document.getElementById(
        "cr-wrestler-editor-select-row"
    );


const crEditorIdPreview =
    document.getElementById(
        "cr-wrestler-id-preview"
    );


const crEditorStatus =
    document.getElementById(
        "cr-wrestler-editor-status"
    );


const crEditorAffiliations =
    document.getElementById(
        "cr-existing-affiliations"
    );


const crEditorCurrentTeam =
    document.getElementById(
        "cr-editor-current-team"
    );


const crEditorCurrentFaction =
    document.getElementById(
        "cr-editor-current-faction"
    );


const crEditorPreview =
    document.getElementById(
        "cr-wrestler-change-preview"
    );


const crEditorChangeList =
    document.getElementById(
        "cr-wrestler-change-list"
    );


const crEditorSaveButton =
    document.getElementById(
        "cr-save-wrestler"
    );


const crEditorMessage =
    document.getElementById(
        "cr-wrestler-editor-message"
    );



// =================================
// EDITABLE FIELDS
// =================================


const crEditorFields = {

    name:
        document.getElementById(
            "cr-edit-name"
        ),

        nickname:
        document.getElementById(
            "cr-edit-nickname"
        ),

    manager:
        document.getElementById(
            "cr-edit-manager"
        ),

    hometown:
        document.getElementById(
            "cr-edit-hometown"
        ),

    country:
        document.getElementById(
            "cr-edit-country"
        ),

    countryCode:
        document.getElementById(
            "cr-edit-country-code"
        ),

    flag:
        document.getElementById(
            "cr-edit-flag"
        ),

    brand:
        document.getElementById(
            "cr-edit-brand"
        ),

    division:
        document.getElementById(
            "cr-edit-division"
        ),

    finisher:
    document.getElementById(
        "cr-edit-finisher"
    ),

finisher2:
    document.getElementById(
        "cr-edit-finisher-two"
    ),

signatureMoves:
        document.getElementById(
            "cr-edit-signatures"
        ),

    whyImHere:
        document.getElementById(
            "cr-edit-story"
        ),

    photo:
        document.getElementById(
            "cr-edit-photo"
        )

};



// =================================
// FIELD LABELS
// =================================


const crEditorFieldLabels = {

    name:
        "Name",

       nickname:
        "Nickname",

    manager:
        "Manager / Valet",

    hometown:
        "Hometown",

    country:
        "Country",

    countryCode:
        "Country Code",

    flag:
        "Flag",

    brand:
        "Show",

    division:
        "Division",

    finisher:
    "Finisher 1",

finisher2:
    "Finisher 2",

signatureMoves:
        "Signature Moves",

    whyImHere:
        "Why I'm Here",

    photo:
        "Photo Path"

};



// =================================
// STATE
// =================================


let crEditorOriginalRecord =
    null;


let crEditorPendingSelectionId =
    "";



// =================================
// BASIC HELPERS
// =================================


function crEditorSetStatus(
    text
) {


    crEditorStatus.textContent =
        text;

}



function crEditorShowMessage(
    message,
    type
) {


    crEditorMessage.textContent =
        message;


    crEditorMessage.className =
        `cr-save-message ${type}`;


    crEditorMessage.hidden =
        false;

}



function crEditorHideMessage() {


    crEditorMessage.hidden =
        true;


    crEditorMessage.textContent =
        "";

}



function crEditorDisplayValue(
    value
) {


    if (
        Array.isArray(
            value
        )
    ) {


        return value.length > 0

            ? value.join(", ")

            : "None";

    }


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



function crEditorCreateSlug(
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



// =================================
// FORM VALUE HELPERS
// =================================


function crEditorGetSignatureMoves() {


    return crEditorFields.signatureMoves.value

        .split("\n")

        .map(
            move =>
                move.trim()
        )

        .filter(Boolean);

}



function crEditorGetFormRecord() {


    return {

        name:
            crEditorFields.name.value.trim(),

               nickname:
            crEditorFields.nickname.value.trim(),

        manager:
            crEditorFields.manager.value.trim(),

        hometown:
            crEditorFields.hometown.value.trim(),

        country:
            crEditorFields.country.value.trim(),

        countryCode:
            crEditorFields.countryCode.value
                .trim()
                .toUpperCase(),

        flag:
            crEditorFields.flag.value.trim(),

        brand:
            crEditorFields.brand.value,

        division:
            crEditorFields.division.value,

        finisher:
    crEditorFields.finisher.value.trim(),

finisher2:
    crEditorFields.finisher2.value.trim(),

signatureMoves:
            crEditorGetSignatureMoves(),

        whyImHere:
            crEditorFields.whyImHere.value.trim(),

        photo:
            crEditorFields.photo.value.trim()

    };

}



function crEditorGetEditableRecord(
    wrestler
) {


    return {

        name:
            wrestler.name || "",

                nickname:
            wrestler.nickname || "",

        manager:
            wrestler.manager || "",

        hometown:
            wrestler.hometown || "",

        country:
            wrestler.country || "",

        countryCode:
            wrestler.countryCode || "",

        flag:
            wrestler.flag || "",

        brand:
            wrestler.brand || "",

        division:
            wrestler.division || "",

        finisher:
    wrestler.finisher || "",

finisher2:
    wrestler.finisher2 || "",

signatureMoves:
            Array.isArray(
                wrestler.signatureMoves
            )

                ? [...wrestler.signatureMoves]

                : [],

        whyImHere:
            wrestler.whyImHere || "",

        photo:
            wrestler.photo || ""

    };

}



function crEditorFillForm(
    record
) {


    crEditorFields.name.value =
        record.name || "";


        crEditorFields.nickname.value =
        record.nickname || "";


    crEditorFields.manager.value =
        record.manager || "";


    crEditorFields.hometown.value =
        record.hometown || "";


    crEditorFields.country.value =
        record.country || "";


    crEditorFields.countryCode.value =
        record.countryCode || "";


    crEditorFields.flag.value =
        record.flag || "";


    crEditorFields.brand.value =
        record.brand || "";


    crEditorFields.division.value =
        record.division || "";


    crEditorFields.finisher.value =
    record.finisher || "";


crEditorFields.finisher2.value =
    record.finisher2 || "";


crEditorFields.signatureMoves.value =

        Array.isArray(
            record.signatureMoves
        )

            ? record.signatureMoves.join(
                "\n"
            )

            : "";


    crEditorFields.whyImHere.value =
        record.whyImHere || "";


    crEditorFields.photo.value =
        record.photo || "";

}



// =================================
// CLEAR FORM
// =================================


function crEditorClearForm() {


    crEditorFillForm({

        name:
            "",

                nickname:
            "",

        manager:
            "",

        hometown:
            "",

        country:
            "",

        countryCode:
            "",

        flag:
            "",

        brand:
            "",

        division:
            "",

        finisher:
    "",

finisher2:
    "",

signatureMoves:
            [],

        whyImHere:
            "",

        photo:
            ""

    });


    crEditorOriginalRecord =
        null;


    crEditorIdPreview.textContent =
        "—";


    crEditorAffiliations.hidden =
        true;


    crEditorPreview.hidden =
        true;


    crEditorSaveButton.disabled =
        true;

}



// =================================
// POPULATE WRESTLER SELECT
// =================================


function crEditorPopulateWrestlers() {


    if (
        !Array.isArray(
            owlControlRoomData.wrestlers
        )
    ) {

        return;

    }


    const desiredSelection =

        crEditorPendingSelectionId

        ||

        crEditorSelect.value;



    crEditorSelect.innerHTML = `

        <option value="">
            Select Wrestler
        </option>

    `;



    const sortedWrestlers =

        [...owlControlRoomData.wrestlers]

            .sort(
                (a, b) =>

                    String(
                        a.name || ""
                    ).localeCompare(

                        String(
                            b.name || ""
                        )

                    )
            );



    sortedWrestlers.forEach(
        wrestler => {


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                wrestler.id;


            option.textContent =
                wrestler.name;


            crEditorSelect.appendChild(
                option
            );

        }
    );



    if (
        desiredSelection

        &&

        sortedWrestlers.some(
            wrestler =>

                wrestler.id ===
                    desiredSelection
        )
    ) {


        crEditorSelect.value =
            desiredSelection;


        crEditorPendingSelectionId =
            "";


        crEditorLoadSelectedWrestler();

    }


    else {


        crEditorSetStatus(
            "READY"
        );

    }

}



// =================================
// LOAD SELECTED WRESTLER
// =================================


function crEditorLoadSelectedWrestler() {


    crEditorHideMessage();



    const wrestlerId =
        crEditorSelect.value;



    if (!wrestlerId) {


        crEditorClearForm();


        crEditorSetStatus(
            "READY"
        );


        return;

    }



    const wrestler =
        owlControlRoomData.wrestlers.find(
            item =>

                item.id ===
                    wrestlerId
        );


    if (!wrestler) {


        crEditorShowMessage(

            "The selected wrestler could not be found.",

            "save-error"

        );


        return;

    }



    crEditorOriginalRecord =
        crEditorGetEditableRecord(
            wrestler
        );


    crEditorFillForm(
        crEditorOriginalRecord
    );


    crEditorIdPreview.textContent =
        wrestler.id;


    crEditorCurrentTeam.textContent =
        wrestler.team || "None";


    crEditorCurrentFaction.textContent =
        wrestler.faction || "None";


    crEditorAffiliations.hidden =
        false;


    crEditorPreview.hidden =
        true;


    crEditorSaveButton.disabled =
        true;


    crEditorSetStatus(
        "EDITING"
    );

}



// =================================
// MODE CHANGE
// =================================


function crEditorChangeMode() {


    crEditorHideMessage();


    crEditorPreview.hidden =
        true;


    crEditorChangeList.innerHTML =
        "";


    if (
        crEditorMode.value === "create"
    ) {


        crEditorSelectRow.hidden =
            true;


        crEditorSelect.value =
            "";


        crEditorClearForm();


        crEditorAffiliations.hidden =
            true;


        crEditorSaveButton.textContent =
            "Create Wrestler";


        crEditorSetStatus(
            "NEW WRESTLER"
        );


        crEditorReviewChanges();


        return;

    }



    crEditorSelectRow.hidden =
        false;


    crEditorSaveButton.textContent =
        "Save Wrestler Changes";


    crEditorClearForm();


    crEditorSetStatus(
        "READY"
    );

}



// =================================
// COMPARE VALUES
// =================================


function crEditorValuesMatch(
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



// =================================
// GET EDIT CHANGES
// =================================


function crEditorGetChanges() {


    if (!crEditorOriginalRecord) {

        return {};

    }


    const currentRecord =
        crEditorGetFormRecord();


    const changes =
        {};



    Object.keys(
        currentRecord
    ).forEach(
        key => {


            if (
                !crEditorValuesMatch(

                    currentRecord[key],

                    crEditorOriginalRecord[key]

                )
            ) {


                changes[key] =
                    currentRecord[key];

            }

        }
    );


    return changes;

}



// =================================
// RENDER REVIEW
// =================================


function crEditorReviewChanges() {


    crEditorHideMessage();



    const mode =
        crEditorMode.value;


    const currentRecord =
        crEditorGetFormRecord();



    if (
        mode === "create"
    ) {


        const newId =
            crEditorCreateSlug(
                currentRecord.name
            );


        crEditorIdPreview.textContent =
            newId || "—";


        crEditorChangeList.innerHTML =
            "";


        if (!currentRecord.name) {


            crEditorPreview.hidden =
                true;


            crEditorSaveButton.disabled =
                true;


            return;

        }



        const duplicateId =
            owlControlRoomData.wrestlers.some(
                wrestler =>

                    wrestler.id ===
                        newId
            );


        if (duplicateId) {


            crEditorChangeList.innerHTML = `

                <p class="cr-change-error">

                    A wrestler with the ID
                    <strong>${newId}</strong>
                    already exists.

                </p>

            `;


            crEditorPreview.hidden =
                false;


            crEditorSaveButton.disabled =
                true;


            crEditorSetStatus(
                "DUPLICATE ID"
            );


            return;

        }



        crEditorChangeList.innerHTML = `

            <div class="cr-editor-change-row">

                <strong>
                    New Wrestler
                </strong>

                <span>
                    ${currentRecord.name}
                </span>

            </div>


            <div class="cr-editor-change-row">

                <strong>
                    Database ID
                </strong>

                <span>
                    ${newId}
                </span>

            </div>


            <div class="cr-editor-change-row">

                <strong>
                    Show
                </strong>

                <span>
                    ${currentRecord.brand || "Unassigned"}
                </span>

            </div>


            <div class="cr-editor-change-row">

                <strong>
                    Division
                </strong>

                <span>
                    ${currentRecord.division || "Unassigned"}
                </span>

            </div>

        `;


        crEditorPreview.hidden =
            false;


        crEditorSaveButton.disabled =
            false;


        crEditorSetStatus(
            "READY TO CREATE"
        );


        return;

    }



    if (!crEditorOriginalRecord) {


        crEditorPreview.hidden =
            true;


        crEditorSaveButton.disabled =
            true;


        return;

    }



    const changes =
        crEditorGetChanges();


    const changeKeys =
        Object.keys(
            changes
        );



    if (
        changeKeys.length === 0
    ) {


        crEditorPreview.hidden =
            true;


        crEditorSaveButton.disabled =
            true;


        crEditorSetStatus(
            "NO CHANGES"
        );


        return;

    }



    crEditorChangeList.innerHTML =
        "";



    changeKeys.forEach(
        key => {


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "cr-editor-change-row";


            row.innerHTML = `

                <strong>

                    ${crEditorFieldLabels[key]}

                </strong>


                <span>

                    ${crEditorDisplayValue(
                        crEditorOriginalRecord[key]
                    )}

                    →

                    ${crEditorDisplayValue(
                        changes[key]
                    )}

                </span>

            `;


            crEditorChangeList.appendChild(
                row
            );

        }
    );



    crEditorPreview.hidden =
        false;


    crEditorSaveButton.disabled =
        false;


    crEditorSetStatus(
        "CHANGES READY"
    );

}



// =================================
// WRITE PERMISSION
// =================================


async function crEditorEnsureWritePermission() {


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
// FIND WRESTLER OBJECT
// =================================


function crEditorFindWrestlerObjectBounds(
    text,
    wrestlerId
) {


    const escapedId =
        wrestlerId.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    const idPattern =
        new RegExp(

            `"id"\\s*:\\s*"${escapedId}"`

        );


    const idMatch =
        idPattern.exec(
            text
        );


    if (!idMatch) {


        throw new Error(
            `Could not find wrestler ${wrestlerId}.`
        );

    }



    const start =
        text.lastIndexOf(
            "{",
            idMatch.index
        );


    if (
        start === -1
    ) {


        throw new Error(
            "Could not find wrestler record start."
        );

    }



    let end =
        -1;


    let depth =
        0;


    let insideString =
        false;


    let escapedCharacter =
        false;



    for (
        let index = start;
        index < text.length;
        index += 1
    ) {


        const character =
            text[index];



        if (escapedCharacter) {


            escapedCharacter =
                false;


            continue;

        }



        if (
            character === "\\"

            &&

            insideString
        ) {


            escapedCharacter =
                true;


            continue;

        }



        if (
            character === "\""
        ) {


            insideString =
                !insideString;


            continue;

        }



        if (insideString) {

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
        end === -1
    ) {


        throw new Error(
            "Could not find wrestler record end."
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


function crEditorReplaceStringField(
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
        pattern.test(
            block
        )
    ) {


        return block.replace(

            pattern,

            (
                match,
                prefix
            ) => {


                return (

                    prefix

                    +

                    JSON.stringify(
                        value
                    )

                );

            }

        );

    }


    const closingBraceIndex =
        block.lastIndexOf(
            "}"
        );


    if (
        closingBraceIndex === -1
    ) {


        throw new Error(
            `Could not add field ${key}.`
        );

    }


    const beforeClosingBrace =

        block.slice(
            0,
            closingBraceIndex
        )
            .trimEnd();


    const separator =

        beforeClosingBrace.endsWith(
            "{"
        )

            ? ""

            : ",";


    return (

        beforeClosingBrace

        +

        separator

        +

        `\n    ${JSON.stringify(
            key
        )}: ${JSON.stringify(
            value
        )}\n`

        +

        block.slice(
            closingBraceIndex
        )

    );

}



// =================================
// REPLACE ARRAY FIELD
// =================================


function crEditorReplaceArrayField(
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

            `("${escapedKey}"\\s*:\\s*)(\\[[\\s\\S]*?\\])`

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
        ) => {


            return (

                prefix

                +

                JSON.stringify(
                    value
                )

            );

        }

    );

}



// =================================
// WRITE EXISTING WRESTLER CHANGES
// =================================


async function crEditorWriteExistingWrestler(
    wrestlerId,
    changes
) {


    const dataDirectory =
        await owlRepositoryHandle.getDirectoryHandle(
            "data"
        );


    const fileHandle =
        await dataDirectory.getFileHandle(
            "wrestlers.json"
        );


    const file =
        await fileHandle.getFile();


    const originalText =
        await file.text();



    const bounds =
        crEditorFindWrestlerObjectBounds(

            originalText,

            wrestlerId

        );



    let wrestlerBlock =
        originalText.slice(

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


            if (
                Array.isArray(
                    value
                )
            ) {


                wrestlerBlock =
                    crEditorReplaceArrayField(

                        wrestlerBlock,

                        key,

                        value

                    );


                return;

            }



            wrestlerBlock =
                crEditorReplaceStringField(

                    wrestlerBlock,

                    key,

                    value

                );

        }
    );



    const updatedText =

        originalText.slice(
            0,
            bounds.start
        )

        +

        wrestlerBlock

        +

        originalText.slice(
            bounds.end + 1
        );



    const writable =
        await fileHandle.createWritable();


    await writable.write(
        updatedText
    );


    await writable.close();

}



// =================================
// CREATE NEW WRESTLER RECORD
// =================================


function crEditorBuildNewWrestler() {


    const form =
        crEditorGetFormRecord();


    return {

        id:
            crEditorCreateSlug(
                form.name
            ),

        name:
            form.name,

                nickname:
            form.nickname,

        manager:
            form.manager,

        hometown:
            form.hometown,

        country:
            form.country,

        countryCode:
            form.countryCode,

        flag:
            form.flag,

        brand:
            form.brand,

        division:
            form.division,

        photo:
            form.photo,

        currentTitle:
            "",

        finisher:
    form.finisher,

finisher2:
    form.finisher2,

finisherGif:
    "",

finisher2Gif:
    "",

signatureMoves:
            form.signatureMoves,

        whyImHere:
            form.whyImHere,

        team:
            "",

        teamId:
            "",

        faction:
            "",

        factionId:
            "",

        championshipsHeld:
            [],

        awards:
            []

    };

}



// =================================
// APPEND NEW WRESTLER
// =================================


async function crEditorAppendNewWrestler(
    wrestler
) {


    const dataDirectory =
        await owlRepositoryHandle.getDirectoryHandle(
            "data"
        );


    const fileHandle =
        await dataDirectory.getFileHandle(
            "wrestlers.json"
        );


    const file =
        await fileHandle.getFile();


    const originalText =
        await file.text();


    const closingBracketIndex =
        originalText.lastIndexOf(
            "]"
        );


    if (
        closingBracketIndex === -1
    ) {


        throw new Error(
            "Could not find the end of wrestlers.json."
        );

    }



    const beforeArrayEnd =
        originalText.slice(
            0,
            closingBracketIndex
        );


    const afterArrayEnd =
        originalText.slice(
            closingBracketIndex
        );



    const trimmedBefore =
        beforeArrayEnd.trimEnd();



    const hasExistingRecords =
        !trimmedBefore.endsWith(
            "["
        );



    const objectText =
        JSON.stringify(
            wrestler,
            null,
            2
        )

            .split("\n")

            .map(
                line =>
                    `  ${line}`
            )

            .join("\n");



    const updatedText =

        trimmedBefore

        +

        (
            hasExistingRecords

                ? ",\n"

                : "\n"
        )

        +

        objectText

        +

        "\n"

        +

        afterArrayEnd;



    const writable =
        await fileHandle.createWritable();


    await writable.write(
        updatedText
    );


    await writable.close();

}



// =================================
// SAVE EDIT
// =================================


async function crEditorSaveExisting() {


    const wrestlerId =
        crEditorSelect.value;


    const changes =
        crEditorGetChanges();



    if (
        !wrestlerId ||
        Object.keys(
            changes
        ).length === 0
    ) {

        return;

    }



    await crEditorWriteExistingWrestler(

        wrestlerId,

        changes

    );



    crEditorPendingSelectionId =
        wrestlerId;


    await loadRepositoryData(
        owlRepositoryHandle
    );


    crEditorShowMessage(

        "Wrestler changes were saved to the local repository. Review wrestlers.json in GitHub Desktop before committing.",

        "save-success"

    );


    crEditorSetStatus(
        "SAVED"
    );

}



// =================================
// SAVE NEW WRESTLER
// =================================


async function crEditorSaveNew() {


    const wrestler =
        crEditorBuildNewWrestler();



    if (!wrestler.name) {


        throw new Error(
            "A wrestler name is required."
        );

    }



    if (!wrestler.id) {


        throw new Error(
            "A valid wrestler ID could not be created."
        );

    }



    const duplicate =
        owlControlRoomData.wrestlers.some(
            item =>

                item.id ===
                    wrestler.id
        );


    if (duplicate) {


        throw new Error(
            "A wrestler with this database ID already exists."
        );

    }



    await crEditorAppendNewWrestler(
        wrestler
    );



    crEditorMode.value =
        "edit";


    crEditorSelectRow.hidden =
        false;


    crEditorSaveButton.textContent =
        "Save Wrestler Changes";


    crEditorPendingSelectionId =
        wrestler.id;



    await loadRepositoryData(
        owlRepositoryHandle
    );



    crEditorShowMessage(

        `${wrestler.name} was added to the local OWL roster. Review wrestlers.json in GitHub Desktop before committing.`,

        "save-success"

    );


    crEditorSetStatus(
        "CREATED"
    );

}



// =================================
// SAVE BUTTON
// =================================


async function crEditorSave() {


    crEditorSaveButton.disabled =
        true;


    crEditorSetStatus(
        "SAVING..."
    );


    crEditorHideMessage();



    try {


        const hasPermission =
            await crEditorEnsureWritePermission();



        if (!hasPermission) {


            throw new Error(
                "Write permission was not granted."
            );

        }



        if (
            crEditorMode.value === "create"
        ) {


            await crEditorSaveNew();

        }


        else {


            await crEditorSaveExisting();

        }


    }


    catch (error) {


        console.error(
            "Could not save wrestler:",
            error
        );


        crEditorSetStatus(
            "SAVE FAILED"
        );


        crEditorShowMessage(

            error.message ||
            "The wrestler could not be saved.",

            "save-error"

        );


        crEditorReviewChanges();

    }

}



// =================================
// DATA LOADED EVENT
// =================================


function crEditorHandleDataLoaded() {


    crEditorPopulateWrestlers();

}



// =================================
// EVENT LISTENERS
// =================================


crEditorMode.addEventListener(
    "change",
    crEditorChangeMode
);


crEditorSelect.addEventListener(
    "change",
    crEditorLoadSelectedWrestler
);



Object.values(
    crEditorFields
)

    .filter(
        Boolean
    )

    .forEach(
        field => {


            field.addEventListener(
                "input",
                crEditorReviewChanges
            );


            field.addEventListener(
                "change",
                crEditorReviewChanges
            );

        }
    );



crEditorSaveButton.addEventListener(
    "click",
    crEditorSave
);



window.addEventListener(

    "owl-control-room-data-loaded",

    crEditorHandleDataLoaded

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

        &&

        owlControlRoomData.wrestlers.length > 0
    ) {


        crEditorPopulateWrestlers();

    }


}

catch (error) {


    console.warn(
        "Wrestler Manager waiting for repository data."
    );

}
