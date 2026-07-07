// =================================
// OWL CONTROL ROOM
// TEAM MANAGER
// =================================


// =================================
// ELEMENTS
// =================================


const crTeamMode =
    document.getElementById(
        "cr-team-editor-mode"
    );


const crTeamSelect =
    document.getElementById(
        "cr-team-editor-select"
    );


const crTeamSelectRow =
    document.getElementById(
        "cr-team-editor-select-row"
    );


const crTeamIdPreview =
    document.getElementById(
        "cr-team-id-preview"
    );


const crTeamStatus =
    document.getElementById(
        "cr-team-editor-status"
    );


const crTeamPreview =
    document.getElementById(
        "cr-team-change-preview"
    );


const crTeamChangeList =
    document.getElementById(
        "cr-team-change-list"
    );


const crTeamConflictMessage =
    document.getElementById(
        "cr-team-conflict-message"
    );


const crTeamSaveButton =
    document.getElementById(
        "cr-save-team"
    );


const crTeamMessage =
    document.getElementById(
        "cr-team-editor-message"
    );



const crTeamFields = {

    name:
        document.getElementById(
            "cr-team-name"
        ),

    brand:
        document.getElementById(
            "cr-team-brand"
        ),

    memberOne:
        document.getElementById(
            "cr-team-member-one"
        ),

    memberTwo:
        document.getElementById(
            "cr-team-member-two"
        ),

    finisher:
        document.getElementById(
            "cr-team-finisher"
        ),

    whyWereHere:
        document.getElementById(
            "cr-team-story"
        ),

    logo:
        document.getElementById(
            "cr-team-logo"
        )

};



// =================================
// STATE
// =================================


let crTeamOriginalRecord =
    null;


let crTeamPendingSelectionId =
    "";



// =================================
// BASIC HELPERS
// =================================


function crTeamSetStatus(
    text
) {


    crTeamStatus.textContent =
        text;

}



function crTeamShowMessage(
    message,
    type
) {


    crTeamMessage.textContent =
        message;


    crTeamMessage.className =
        `cr-save-message ${type}`;


    crTeamMessage.hidden =
        false;

}



function crTeamHideMessage() {


    crTeamMessage.textContent =
        "";


    crTeamMessage.hidden =
        true;

}



function crTeamCreateSlug(
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



function crTeamGetWrestlerName(
    wrestlerId
) {


    const wrestler =
        owlControlRoomData.wrestlers.find(
            item =>
                item.id === wrestlerId
        );


    return wrestler
        ? wrestler.name
        : wrestlerId;

}



function crTeamDisplayMembers(
    memberIds
) {


    if (
        !Array.isArray(
            memberIds
        )

        ||

        memberIds.length === 0
    ) {

        return "None";

    }


    return memberIds

        .map(
            memberId =>
                crTeamGetWrestlerName(
                    memberId
                )
        )

        .join(" & ");

}



function crTeamValuesMatch(
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
// FORM RECORD
// =================================


function crTeamGetFormRecord() {


    return {

        name:
            crTeamFields.name.value.trim(),

        brand:
            crTeamFields.brand.value,

        members:
            [
                crTeamFields.memberOne.value,
                crTeamFields.memberTwo.value
            ]
                .filter(Boolean),

        finisher:
            crTeamFields.finisher.value.trim(),

        whyWereHere:
            crTeamFields.whyWereHere.value.trim(),

        logo:
            crTeamFields.logo.value.trim()

    };

}



function crTeamGetEditableRecord(
    team
) {


    return {

        name:
            team.name || "",

        brand:
            team.brand || "",

        members:
            Array.isArray(
                team.members
            )

                ? [...team.members]

                : [],

        finisher:
            team.finisher || "",

        whyWereHere:
            team.whyWereHere || "",

        logo:
            team.logo || ""

    };

}



// =================================
// FILL / CLEAR FORM
// =================================


function crTeamFillForm(
    record
) {


    crTeamFields.name.value =
        record.name || "";


    crTeamFields.brand.value =
        record.brand || "";


    crTeamFields.memberOne.value =

        Array.isArray(
            record.members
        )

            ? record.members[0] || ""

            : "";


    crTeamFields.memberTwo.value =

        Array.isArray(
            record.members
        )

            ? record.members[1] || ""

            : "";


    crTeamFields.finisher.value =
        record.finisher || "";


    crTeamFields.whyWereHere.value =
        record.whyWereHere || "";


    crTeamFields.logo.value =
        record.logo || "";

}



function crTeamClearForm() {


    crTeamFillForm({

        name:
            "",

        brand:
            "",

        members:
            [],

        finisher:
            "",

        whyWereHere:
            "",

        logo:
            ""

    });


    crTeamOriginalRecord =
        null;


    crTeamIdPreview.textContent =
        "—";


    crTeamPreview.hidden =
        true;


    crTeamConflictMessage.hidden =
        true;


    crTeamSaveButton.disabled =
        true;

}



// =================================
// POPULATE WRESTLER OPTIONS
// =================================


function crTeamPopulateWrestlerSelect(
    selectElement
) {


    const previousValue =
        selectElement.value;


    selectElement.innerHTML = `

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


            selectElement.appendChild(
                option
            );

        }
    );



    if (
        previousValue

        &&

        sortedWrestlers.some(
            wrestler =>
                wrestler.id === previousValue
        )
    ) {


        selectElement.value =
            previousValue;

    }

}



// =================================
// POPULATE TEAM SELECT
// =================================


function crTeamPopulateTeams() {


    if (
        !Array.isArray(
            owlControlRoomData.teams
        )
    ) {

        return;

    }



    crTeamPopulateWrestlerSelect(
        crTeamFields.memberOne
    );


    crTeamPopulateWrestlerSelect(
        crTeamFields.memberTwo
    );



    const desiredSelection =

        crTeamPendingSelectionId

        ||

        crTeamSelect.value;



    crTeamSelect.innerHTML = `

        <option value="">
            Select Team
        </option>

    `;



    const sortedTeams =

        [...owlControlRoomData.teams]

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



    sortedTeams.forEach(
        team => {


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                team.id;


            option.textContent =
                team.name;


            crTeamSelect.appendChild(
                option
            );

        }
    );



    if (
        desiredSelection

        &&

        sortedTeams.some(
            team =>
                team.id === desiredSelection
        )
    ) {


        crTeamSelect.value =
            desiredSelection;


        crTeamPendingSelectionId =
            "";


        crTeamLoadSelectedTeam();

    }


    else {


        crTeamSetStatus(
            "READY"
        );

    }

}



// =================================
// LOAD SELECTED TEAM
// =================================


function crTeamLoadSelectedTeam() {


    crTeamHideMessage();



    const teamId =
        crTeamSelect.value;



    if (!teamId) {


        crTeamClearForm();


        crTeamSetStatus(
            "READY"
        );


        return;

    }



    const team =
        owlControlRoomData.teams.find(
            item =>
                item.id === teamId
        );


    if (!team) {


        crTeamShowMessage(

            "The selected team could not be found.",

            "save-error"

        );


        return;

    }



    crTeamOriginalRecord =
        crTeamGetEditableRecord(
            team
        );


    crTeamFillForm(
        crTeamOriginalRecord
    );


    crTeamIdPreview.textContent =
        team.id;


    crTeamPreview.hidden =
        true;


    crTeamConflictMessage.hidden =
        true;


    crTeamSaveButton.disabled =
        true;


    crTeamSetStatus(
        "EDITING"
    );

}



// =================================
// MODE CHANGE
// =================================


function crTeamChangeMode() {


    crTeamHideMessage();


    crTeamPreview.hidden =
        true;


    crTeamConflictMessage.hidden =
        true;


    crTeamChangeList.innerHTML =
        "";



    if (
        crTeamMode.value === "create"
    ) {


        crTeamSelectRow.hidden =
            true;


        crTeamSelect.value =
            "";


        crTeamClearForm();


        crTeamSaveButton.textContent =
            "Create Team";


        crTeamSetStatus(
            "NEW TEAM"
        );


        return;

    }



    crTeamSelectRow.hidden =
        false;


    crTeamSaveButton.textContent =
        "Save Team Changes";


    crTeamClearForm();


    crTeamSetStatus(
        "READY"
    );

}



// =================================
// CHANGE DETECTION
// =================================


function crTeamGetChanges() {


    if (!crTeamOriginalRecord) {

        return {};

    }


    const current =
        crTeamGetFormRecord();


    const changes =
        {};



    Object.keys(
        current
    ).forEach(
        key => {


            if (
                !crTeamValuesMatch(

                    current[key],

                    crTeamOriginalRecord[key]

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
// CONFLICT CHECK
// =================================


function crTeamFindMemberConflicts(
    memberIds
) {


    const currentTeamId =

        crTeamMode.value === "edit"

            ? crTeamSelect.value

            : "";



    const conflicts =
        [];



    owlControlRoomData.teams.forEach(
        team => {


            if (
                team.id === currentTeamId
            ) {

                return;

            }


            if (
                !Array.isArray(
                    team.members
                )
            ) {

                return;

            }



            memberIds.forEach(
                memberId => {


                    if (
                        team.members.includes(
                            memberId
                        )
                    ) {


                        conflicts.push({

                            wrestlerId:
                                memberId,

                            teamName:
                                team.name

                        });

                    }

                }
            );

        }
    );


    return conflicts;

}



// =================================
// REVIEW ROW
// =================================


function crTeamAddReviewRow(
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


    crTeamChangeList.appendChild(
        row
    );

}



// =================================
// REVIEW CHANGES
// =================================


function crTeamReviewChanges() {


    crTeamHideMessage();


    crTeamChangeList.innerHTML =
        "";


    crTeamConflictMessage.hidden =
        true;



    const record =
        crTeamGetFormRecord();


    const newId =
        crTeamCreateSlug(
            record.name
        );



    if (
        crTeamMode.value === "create"
    ) {


        crTeamIdPreview.textContent =
            newId || "—";

    }



    const membersValid =

        record.members.length === 2

        &&

        record.members[0] !==
            record.members[1];



    const conflicts =
        crTeamFindMemberConflicts(
            record.members
        );



    if (
        conflicts.length > 0
    ) {


        const conflictText =
            conflicts

                .map(
                    conflict =>

                        `${crTeamGetWrestlerName(
                            conflict.wrestlerId
                        )} is already on ${conflict.teamName}`
                )

                .join(". ");


        crTeamConflictMessage.textContent =
            conflictText + ".";


        crTeamConflictMessage.hidden =
            false;

    }



    if (
        crTeamMode.value === "create"
    ) {


        if (!record.name) {


            crTeamPreview.hidden =
                true;


            crTeamSaveButton.disabled =
                true;


            return;

        }



        const duplicateId =
            owlControlRoomData.teams.some(
                team =>
                    team.id === newId
            );



        crTeamPreview.hidden =
            false;



        crTeamAddReviewRow(
            "New Team",
            record.name
        );


        crTeamAddReviewRow(
            "Database ID",
            newId
        );


        crTeamAddReviewRow(
            "Members",
            crTeamDisplayMembers(
                record.members
            )
        );


        crTeamAddReviewRow(
            "Show",
            record.brand || "Unassigned"
        );



        if (duplicateId) {


            crTeamConflictMessage.textContent =
                `A team with the database ID ${newId} already exists.`;


            crTeamConflictMessage.hidden =
                false;

        }



        crTeamSaveButton.disabled =

            !record.name

            ||

            !membersValid

            ||

            duplicateId

            ||

            conflicts.length > 0;



        crTeamSetStatus(

            crTeamSaveButton.disabled

                ? "CHECK FORM"

                : "READY TO CREATE"

        );


        return;

    }



    if (!crTeamOriginalRecord) {


        crTeamPreview.hidden =
            true;


        crTeamSaveButton.disabled =
            true;


        return;

    }



    const changes =
        crTeamGetChanges();


    const changeKeys =
        Object.keys(
            changes
        );



    if (
        changeKeys.length === 0
    ) {


        crTeamPreview.hidden =
            true;


        crTeamSaveButton.disabled =
            true;


        crTeamSetStatus(
            "NO CHANGES"
        );


        return;

    }



    changeKeys.forEach(
        key => {


            let oldValue =
                crTeamOriginalRecord[key];


            let newValue =
                changes[key];


            if (
                key === "members"
            ) {


                oldValue =
                    crTeamDisplayMembers(
                        oldValue
                    );


                newValue =
                    crTeamDisplayMembers(
                        newValue
                    );

            }



            crTeamAddReviewRow(

                key === "name"
                    ? "Team Name"

                    : key === "brand"
                        ? "Show"

                        : key === "members"
                            ? "Members"

                            : key === "finisher"
                                ? "Finisher"

                                : key === "whyWereHere"
                                    ? "Why We're Here"

                                    : "Logo Path",

                `${oldValue || "Empty"} → ${newValue || "Empty"}`

            );

        }
    );



    crTeamPreview.hidden =
        false;



    crTeamSaveButton.disabled =

        !membersValid

        ||

        conflicts.length > 0;



    crTeamSetStatus(

        crTeamSaveButton.disabled

            ? "CHECK FORM"

            : "CHANGES READY"

    );

}



// =================================
// WRITE PERMISSION
// =================================


async function crTeamEnsureWritePermission() {


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
// READ TEXT FILE
// =================================


async function crTeamReadTextFile(
    fileName
) {


    const dataDirectory =
        await owlRepositoryHandle.getDirectoryHandle(
            "data"
        );


    const fileHandle =
        await dataDirectory.getFileHandle(
            fileName
        );


    const file =
        await fileHandle.getFile();


    return {

        fileHandle,

        text:
            await file.text()

    };

}



// =================================
// WRITE TEXT FILE
// =================================


async function crTeamWriteTextFile(
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


function crTeamFindObjectBounds(
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
            `Could not find record ${recordId}.`
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
            `Could not locate record ${recordId}.`
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


function crTeamReplaceStringField(
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
// REPLACE ARRAY FIELD
// =================================


function crTeamReplaceArrayField(
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

            `^(\\s*)("${escapedKey}"\\s*:\\s*)(\\[[\\s\\S]*?\\])`,

            "m"

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
            indentation,
            prefix
        ) => {


            const formattedArray =
                JSON.stringify(
                    value,
                    null,
                    2
                )

                    .split("\n")

                    .map(
                        (
                            line,
                            index
                        ) => {


                            if (
                                index === 0
                            ) {

                                return line;

                            }


                            return (
                                indentation
                                +
                                line
                            );

                        }
                    )

                    .join("\n");



            return (

                indentation

                +

                prefix

                +

                formattedArray

            );

        }

    );

}


// =================================
// UPDATE RECORD IN TEXT
// =================================


function crTeamUpdateRecordText(
    text,
    recordId,
    changes
) {


    const bounds =
        crTeamFindObjectBounds(
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


            if (
                Array.isArray(
                    value
                )
            ) {


                block =
                    crTeamReplaceArrayField(

                        block,

                        key,

                        value

                    );


                return;

            }


            block =
                crTeamReplaceStringField(

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
// APPEND RECORD
// =================================


function crTeamAppendRecordText(
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
            "Could not find database array ending."
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
// BUILD NEW TEAM
// =================================


function crTeamBuildNewRecord() {


    const form =
        crTeamGetFormRecord();


    return {

        id:
            crTeamCreateSlug(
                form.name
            ),

        name:
            form.name,

        members:
            form.members,

        brand:
            form.brand,

        logo:
            form.logo,

        finisher:
            form.finisher,

        whyWereHere:
            form.whyWereHere,

        championshipsHeld:
            [],

        awards:
            []

    };

}



// =================================
// UPDATE WRESTLER TEAM FIELDS
// =================================


function crTeamApplyWrestlerAssignments(
    wrestlerText,
    teamId,
    teamName,
    oldMembers,
    newMembers
) {


    const affectedMembers =
        Array.from(

            new Set(
                [
                    ...oldMembers,
                    ...newMembers
                ]
            )

        );



    let updatedText =
        wrestlerText;



    affectedMembers.forEach(
        wrestlerId => {


            const wrestler =
                owlControlRoomData.wrestlers.find(
                    item =>
                        item.id === wrestlerId
                );


            if (!wrestler) {

                return;

            }



            const isNewMember =
                newMembers.includes(
                    wrestlerId
                );


            const wasThisTeamMember =

                oldMembers.includes(
                    wrestlerId
                )

                ||

                wrestler.teamId ===
                    teamId;



            if (
                !isNewMember

                &&

                !wasThisTeamMember
            ) {

                return;

            }



            updatedText =
                crTeamUpdateRecordText(

                    updatedText,

                    wrestlerId,

                    {

                        team:
                            isNewMember
                                ? teamName
                                : "",

                        teamId:
                            isNewMember
                                ? teamId
                                : ""

                    }

                );

        }
    );


    return updatedText;

}



// =================================
// SAVE EXISTING TEAM
// =================================


async function crTeamSaveExisting() {


    const teamId =
        crTeamSelect.value;


    const form =
        crTeamGetFormRecord();


    const changes =
        crTeamGetChanges();



    if (
        !teamId

        ||

        Object.keys(
            changes
        ).length === 0
    ) {

        return;

    }



    const oldMembers =
        crTeamOriginalRecord.members;



    const teamsFile =
        await crTeamReadTextFile(
            "teams.json"
        );


    const wrestlersFile =
        await crTeamReadTextFile(
            "wrestlers.json"
        );



    const updatedTeamsText =
        crTeamUpdateRecordText(

            teamsFile.text,

            teamId,

            changes

        );



    const updatedWrestlersText =
        crTeamApplyWrestlerAssignments(

            wrestlersFile.text,

            teamId,

            form.name,

            oldMembers,

            form.members

        );



    await crTeamWriteTextFile(

        teamsFile.fileHandle,

        updatedTeamsText

    );


    await crTeamWriteTextFile(

        wrestlersFile.fileHandle,

        updatedWrestlersText

    );



    crTeamPendingSelectionId =
        teamId;



    await loadRepositoryData(
        owlRepositoryHandle
    );



    crTeamShowMessage(

        "Team changes were saved locally. Review teams.json and wrestlers.json in GitHub Desktop before committing.",

        "save-success"

    );


    crTeamSetStatus(
        "SAVED"
    );

}



// =================================
// SAVE NEW TEAM
// =================================


async function crTeamSaveNew() {


    const team =
        crTeamBuildNewRecord();



    const teamsFile =
        await crTeamReadTextFile(
            "teams.json"
        );


    const wrestlersFile =
        await crTeamReadTextFile(
            "wrestlers.json"
        );



    const updatedTeamsText =
        crTeamAppendRecordText(

            teamsFile.text,

            team

        );



    const updatedWrestlersText =
        crTeamApplyWrestlerAssignments(

            wrestlersFile.text,

            team.id,

            team.name,

            [],

            team.members

        );



    await crTeamWriteTextFile(

        teamsFile.fileHandle,

        updatedTeamsText

    );


    await crTeamWriteTextFile(

        wrestlersFile.fileHandle,

        updatedWrestlersText

    );



    crTeamMode.value =
        "edit";


    crTeamSelectRow.hidden =
        false;


    crTeamSaveButton.textContent =
        "Save Team Changes";


    crTeamPendingSelectionId =
        team.id;



    await loadRepositoryData(
        owlRepositoryHandle
    );



    crTeamShowMessage(

        `${team.name} was created and its two wrestler profiles were synchronized. Review teams.json and wrestlers.json in GitHub Desktop.`,

        "save-success"

    );


    crTeamSetStatus(
        "CREATED"
    );

}



// =================================
// SAVE BUTTON
// =================================


async function crTeamSave() {


    crTeamSaveButton.disabled =
        true;


    crTeamSetStatus(
        "SAVING..."
    );


    crTeamHideMessage();



    try {


        const permission =
            await crTeamEnsureWritePermission();


        if (!permission) {


            throw new Error(
                "Write permission was not granted."
            );

        }



        const record =
            crTeamGetFormRecord();


        if (
            record.members.length !== 2

            ||

            record.members[0] ===
                record.members[1]
        ) {


            throw new Error(
                "A team must have exactly two different wrestlers."
            );

        }



        const conflicts =
            crTeamFindMemberConflicts(
                record.members
            );


        if (
            conflicts.length > 0
        ) {


            throw new Error(
                "One or more selected wrestlers already belong to another official team."
            );

        }



        if (
            crTeamMode.value === "create"
        ) {


            await crTeamSaveNew();

        }


        else {


            await crTeamSaveExisting();

        }


    }


    catch (error) {


        console.error(
            "Could not save team:",
            error
        );


        crTeamSetStatus(
            "SAVE FAILED"
        );


        crTeamShowMessage(

            error.message ||
            "The team could not be saved.",

            "save-error"

        );


        crTeamReviewChanges();

    }

}



// =================================
// DATA RELOAD
// =================================


function crTeamHandleDataLoaded() {


    crTeamPopulateTeams();

}



// =================================
// EVENTS
// =================================


crTeamMode.addEventListener(
    "change",
    crTeamChangeMode
);


crTeamSelect.addEventListener(
    "change",
    crTeamLoadSelectedTeam
);



Object.values(
    crTeamFields
).forEach(
    field => {


        field.addEventListener(
            "input",
            crTeamReviewChanges
        );


        field.addEventListener(
            "change",
            crTeamReviewChanges
        );

    }
);



crTeamSaveButton.addEventListener(
    "click",
    crTeamSave
);



window.addEventListener(

    "owl-control-room-data-loaded",

    crTeamHandleDataLoaded

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
            owlControlRoomData.teams
        )

        &&

        Array.isArray(
            owlControlRoomData.wrestlers
        )
    ) {


        crTeamPopulateTeams();

    }


}

catch (error) {


    console.warn(
        "Team Manager waiting for repository data."
    );

}
