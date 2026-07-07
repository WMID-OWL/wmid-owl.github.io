// =================================
// OWL CONTROL ROOM
// FACTION MANAGER
// =================================


// =================================
// ELEMENTS
// =================================


const crFactionMode =
    document.getElementById(
        "cr-faction-editor-mode"
    );


const crFactionSelect =
    document.getElementById(
        "cr-faction-editor-select"
    );


const crFactionSelectRow =
    document.getElementById(
        "cr-faction-editor-select-row"
    );


const crFactionIdPreview =
    document.getElementById(
        "cr-faction-id-preview"
    );


const crFactionStatus =
    document.getElementById(
        "cr-faction-editor-status"
    );


const crFactionPreview =
    document.getElementById(
        "cr-faction-change-preview"
    );


const crFactionChangeList =
    document.getElementById(
        "cr-faction-change-list"
    );


const crFactionConflictMessage =
    document.getElementById(
        "cr-faction-conflict-message"
    );


const crFactionSaveButton =
    document.getElementById(
        "cr-save-faction"
    );


const crFactionMessage =
    document.getElementById(
        "cr-faction-editor-message"
    );



// =================================
// FORM FIELDS
// =================================


const crFactionFields = {

    name:
        document.getElementById(
            "cr-faction-name"
        ),

    brand:
        document.getElementById(
            "cr-faction-brand"
        ),

    tagTeamId:
        document.getElementById(
            "cr-faction-tag-team"
        ),

    leader:
        document.getElementById(
            "cr-faction-leader"
        ),

    memberOne:
        document.getElementById(
            "cr-faction-member-one"
        ),

    memberTwo:
        document.getElementById(
            "cr-faction-member-two"
        ),

    memberThree:
        document.getElementById(
            "cr-faction-member-three"
        ),

    memberFour:
        document.getElementById(
            "cr-faction-member-four"
        ),

    singlesOne:
        document.getElementById(
            "cr-faction-singles-one"
        ),

    singlesTwo:
        document.getElementById(
            "cr-faction-singles-two"
        ),

    whyWereHere:
        document.getElementById(
            "cr-faction-story"
        ),

    logo:
        document.getElementById(
            "cr-faction-logo"
        )

};



// =================================
// STATE
// =================================


let crFactionOriginalRecord =
    null;


let crFactionPendingSelectionId =
    "";



// =================================
// BASIC UI HELPERS
// =================================


function crFactionSetStatus(
    text
) {

    crFactionStatus.textContent =
        text;

}



function crFactionShowMessage(
    message,
    type
) {

    crFactionMessage.textContent =
        message;


    crFactionMessage.className =
        `cr-save-message ${type}`;


    crFactionMessage.hidden =
        false;

}



function crFactionHideMessage() {

    crFactionMessage.textContent =
        "";


    crFactionMessage.hidden =
        true;

}



// =================================
// DATA HELPERS
// =================================


function crFactionCreateSlug(
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



function crFactionValuesMatch(
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



function crFactionGetWrestlerName(
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



function crFactionGetTeamName(
    teamId
) {

    if (!teamId) {

        return "None";

    }


    const team =
        owlControlRoomData.teams.find(
            item =>
                item.id === teamId
        );


    return team
        ? team.name
        : teamId;

}



function crFactionDisplayMembers(
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

                crFactionGetWrestlerName(
                    memberId
                )
        )

        .join(", ");

}



// =================================
// FORM RECORD
// =================================


function crFactionGetFormRecord() {

    return {

        name:
            crFactionFields.name.value.trim(),

        brand:
            crFactionFields.brand.value,

        logo:
            crFactionFields.logo.value.trim(),

        leader:
            crFactionFields.leader.value,

        tagTeamId:
            crFactionFields.tagTeamId.value,

        members:
            [
                crFactionFields.memberOne.value,
                crFactionFields.memberTwo.value,
                crFactionFields.memberThree.value,
                crFactionFields.memberFour.value
            ]
                .filter(Boolean),

        singlesMembers:
            [
                crFactionFields.singlesOne.value,
                crFactionFields.singlesTwo.value
            ]
                .filter(Boolean),

        whyWereHere:
            crFactionFields.whyWereHere.value.trim()

    };

}



function crFactionGetEditableRecord(
    faction
) {

    return {

        name:
            faction.name || "",

        brand:
            faction.brand || "",

        logo:
            faction.logo || "",

        leader:
            faction.leader || "",

        tagTeamId:
            faction.tagTeamId || "",

        members:
            Array.isArray(
                faction.members
            )
                ? [...faction.members]
                : [],

        singlesMembers:
            Array.isArray(
                faction.singlesMembers
            )
                ? [...faction.singlesMembers]
                : [],

        whyWereHere:
            faction.whyWereHere || ""

    };

}



// =================================
// FILL FORM
// =================================


function crFactionFillForm(
    record
) {

    crFactionFields.name.value =
        record.name || "";


    crFactionFields.brand.value =
        record.brand || "";


    crFactionFields.logo.value =
        record.logo || "";


    crFactionFields.leader.value =
        record.leader || "";


    crFactionFields.tagTeamId.value =
        record.tagTeamId || "";


    crFactionFields.memberOne.value =
        record.members[0] || "";


    crFactionFields.memberTwo.value =
        record.members[1] || "";


    crFactionFields.memberThree.value =
        record.members[2] || "";


    crFactionFields.memberFour.value =
        record.members[3] || "";


    crFactionFields.singlesOne.value =
        record.singlesMembers[0] || "";


    crFactionFields.singlesTwo.value =
        record.singlesMembers[1] || "";


    crFactionFields.whyWereHere.value =
        record.whyWereHere || "";

}



// =================================
// CLEAR FORM
// =================================


function crFactionClearForm() {

    crFactionFillForm({

        name:
            "",

        brand:
            "",

        logo:
            "",

        leader:
            "",

        tagTeamId:
            "",

        members:
            [],

        singlesMembers:
            [],

        whyWereHere:
            ""

    });


    crFactionOriginalRecord =
        null;


    crFactionIdPreview.textContent =
        "—";


    crFactionPreview.hidden =
        true;


    crFactionConflictMessage.hidden =
        true;


    crFactionSaveButton.disabled =
        true;

}



// =================================
// POPULATE WRESTLER SELECT
// =================================


function crFactionPopulateWrestlerSelect(
    selectElement,
    emptyLabel
) {

    const oldValue =
        selectElement.value;


    selectElement.innerHTML =
        "";


    const emptyOption =
        document.createElement(
            "option"
        );


    emptyOption.value =
        "";


    emptyOption.textContent =
        emptyLabel;


    selectElement.appendChild(
        emptyOption
    );



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
        oldValue

        &&

        sortedWrestlers.some(
            wrestler =>
                wrestler.id === oldValue
        )
    ) {

        selectElement.value =
            oldValue;

    }

}



// =================================
// POPULATE TEAM SELECT
// =================================


function crFactionPopulateTeamSelect() {

    const oldValue =
        crFactionFields.tagTeamId.value;


    crFactionFields.tagTeamId.innerHTML = `

        <option value="">
            No Associated Team
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


            crFactionFields.tagTeamId.appendChild(
                option
            );

        }
    );



    if (
        oldValue

        &&

        sortedTeams.some(
            team =>
                team.id === oldValue
        )
    ) {

        crFactionFields.tagTeamId.value =
            oldValue;

    }

}



// =================================
// POPULATE ALL FORM OPTIONS
// =================================


function crFactionPopulateOptions() {

    crFactionPopulateWrestlerSelect(
        crFactionFields.memberOne,
        "Select Wrestler"
    );


    crFactionPopulateWrestlerSelect(
        crFactionFields.memberTwo,
        "Select Wrestler"
    );


    crFactionPopulateWrestlerSelect(
        crFactionFields.memberThree,
        "Select Wrestler"
    );


    crFactionPopulateWrestlerSelect(
        crFactionFields.memberFour,
        "Optional Fourth Member"
    );


    crFactionPopulateWrestlerSelect(
        crFactionFields.singlesOne,
        "None"
    );


    crFactionPopulateWrestlerSelect(
        crFactionFields.singlesTwo,
        "None"
    );


    crFactionPopulateWrestlerSelect(
        crFactionFields.leader,
        "No Leader"
    );


    crFactionPopulateTeamSelect();

}



// =================================
// POPULATE FACTION SELECT
// =================================


function crFactionPopulateFactions() {

    if (
        !Array.isArray(
            owlControlRoomData.factions
        )

        ||

        !Array.isArray(
            owlControlRoomData.wrestlers
        )

        ||

        !Array.isArray(
            owlControlRoomData.teams
        )
    ) {

        return;

    }



    crFactionPopulateOptions();



    const desiredSelection =

        crFactionPendingSelectionId

        ||

        crFactionSelect.value;



    crFactionSelect.innerHTML = `

        <option value="">
            Select Faction
        </option>

    `;



    const sortedFactions =
        [...owlControlRoomData.factions]

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



    sortedFactions.forEach(
        faction => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                faction.id;


            option.textContent =
                faction.name;


            crFactionSelect.appendChild(
                option
            );

        }
    );



    if (
        desiredSelection

        &&

        sortedFactions.some(
            faction =>
                faction.id === desiredSelection
        )
    ) {

        crFactionSelect.value =
            desiredSelection;


        crFactionPendingSelectionId =
            "";


        crFactionLoadSelected();

    }


    else {

        crFactionSetStatus(
            "READY"
        );

    }

}



// =================================
// LOAD SELECTED FACTION
// =================================


function crFactionLoadSelected() {

    crFactionHideMessage();



    const factionId =
        crFactionSelect.value;



    if (!factionId) {

        crFactionClearForm();


        crFactionSetStatus(
            "READY"
        );


        return;

    }



    const faction =
        owlControlRoomData.factions.find(
            item =>
                item.id === factionId
        );


    if (!faction) {

        crFactionShowMessage(

            "The selected faction could not be found.",

            "save-error"

        );


        return;

    }



    crFactionOriginalRecord =
        crFactionGetEditableRecord(
            faction
        );


    crFactionFillForm(
        crFactionOriginalRecord
    );


    crFactionIdPreview.textContent =
        faction.id;


    crFactionPreview.hidden =
        true;


    crFactionConflictMessage.hidden =
        true;


    crFactionSaveButton.disabled =
        true;


    crFactionSetStatus(
        "EDITING"
    );

}



// =================================
// MODE CHANGE
// =================================


function crFactionChangeMode() {

    crFactionHideMessage();


    crFactionChangeList.innerHTML =
        "";


    crFactionPreview.hidden =
        true;


    crFactionConflictMessage.hidden =
        true;



    if (
        crFactionMode.value === "create"
    ) {

        crFactionSelectRow.hidden =
            true;


        crFactionSelect.value =
            "";


        crFactionClearForm();


        crFactionSaveButton.textContent =
            "Create Faction";


        crFactionSetStatus(
            "NEW FACTION"
        );


        return;

    }



    crFactionSelectRow.hidden =
        false;


    crFactionSaveButton.textContent =
        "Save Faction Changes";


    crFactionClearForm();


    crFactionSetStatus(
        "READY"
    );

}



// =================================
// CHANGE DETECTION
// =================================


function crFactionGetChanges() {

    if (!crFactionOriginalRecord) {

        return {};

    }


    const current =
        crFactionGetFormRecord();


    const changes =
        {};



    Object.keys(
        current
    ).forEach(
        key => {

            if (
                !crFactionValuesMatch(

                    current[key],

                    crFactionOriginalRecord[key]

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
// MEMBER CONFLICT CHECK
// =================================


function crFactionFindMemberConflicts(
    memberIds
) {

    const currentFactionId =

        crFactionMode.value === "edit"

            ? crFactionSelect.value

            : "";



    const conflicts =
        [];



    owlControlRoomData.factions.forEach(
        faction => {

            if (
                faction.id === currentFactionId
            ) {

                return;

            }


            if (
                !Array.isArray(
                    faction.members
                )
            ) {

                return;

            }



            memberIds.forEach(
                memberId => {

                    if (
                        faction.members.includes(
                            memberId
                        )
                    ) {

                        conflicts.push({

                            wrestlerId:
                                memberId,

                            factionName:
                                faction.name

                        });

                    }

                }
            );

        }
    );


    return conflicts;

}



// =================================
// VALIDATION
// =================================


function crFactionValidate(
    record
) {

    const errors =
        [];


    const uniqueMembers =
        new Set(
            record.members
        );



    if (
        record.members.length < 3
    ) {

        errors.push(
            "A faction must contain at least three members."
        );

    }



    if (
        record.members.length > 4
    ) {

        errors.push(
            "A faction can contain no more than four members."
        );

    }



    if (
        uniqueMembers.size !==
        record.members.length
    ) {

        errors.push(
            "A wrestler cannot occupy more than one faction member slot."
        );

    }



    const uniqueSingles =
        new Set(
            record.singlesMembers
        );


    if (
        uniqueSingles.size !==
        record.singlesMembers.length
    ) {

        errors.push(
            "The same wrestler cannot occupy both singles member slots."
        );

    }



    record.singlesMembers.forEach(
        wrestlerId => {

            if (
                !record.members.includes(
                    wrestlerId
                )
            ) {

                errors.push(

                    `${crFactionGetWrestlerName(
                        wrestlerId
                    )} is selected as a singles member but is not in the faction lineup.`

                );

            }

        }
    );



    if (
        record.leader

        &&

        !record.members.includes(
            record.leader
        )
    ) {

        errors.push(
            "The faction leader must also be listed as a faction member."
        );

    }



    if (record.tagTeamId) {

        const team =
            owlControlRoomData.teams.find(
                item =>
                    item.id === record.tagTeamId
            );


        if (!team) {

            errors.push(
                "The selected official tag team could not be found."
            );

        }


        else {

            const teamMembers =
                Array.isArray(
                    team.members
                )
                    ? team.members
                    : [];


            teamMembers.forEach(
                wrestlerId => {

                    if (
                        !record.members.includes(
                            wrestlerId
                        )
                    ) {

                        errors.push(

                            `${crFactionGetWrestlerName(
                                wrestlerId
                            )} is a member of ${team.name} and must also be included in the faction lineup.`

                        );

                    }

                }
            );

        }

    }



    const conflicts =
        crFactionFindMemberConflicts(
            record.members
        );


    conflicts.forEach(
        conflict => {

            errors.push(

                `${crFactionGetWrestlerName(
                    conflict.wrestlerId
                )} already belongs to ${conflict.factionName}.`

            );

        }
    );


    return errors;

}



// =================================
// REVIEW DISPLAY HELPERS
// =================================


function crFactionAddReviewRow(
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


    crFactionChangeList.appendChild(
        row
    );

}



function crFactionFormatField(
    key,
    value
) {

    if (
        key === "members" ||
        key === "singlesMembers"
    ) {

        return crFactionDisplayMembers(
            value
        );

    }


    if (
        key === "leader"
    ) {

        return value

            ? crFactionGetWrestlerName(
                value
            )

            : "None";

    }


    if (
        key === "tagTeamId"
    ) {

        return crFactionGetTeamName(
            value
        );

    }


    return value || "Empty";

}



function crFactionFieldLabel(
    key
) {

    const labels = {

        name:
            "Faction Name",

        brand:
            "Show",

        logo:
            "Logo Path",

        leader:
            "Leader",

        tagTeamId:
            "Official Tag Team",

        members:
            "Members",

        singlesMembers:
            "Singles Members",

        whyWereHere:
            "Why We're Here"

    };


    return labels[key] || key;

}



// =================================
// REVIEW CHANGES
// =================================


function crFactionReviewChanges() {

    crFactionHideMessage();


    crFactionChangeList.innerHTML =
        "";


    crFactionConflictMessage.hidden =
        true;



    const record =
        crFactionGetFormRecord();


    const errors =
        crFactionValidate(
            record
        );


    const newId =
        crFactionCreateSlug(
            record.name
        );



    // =================================
    // CREATE MODE
    // =================================


    if (
        crFactionMode.value === "create"
    ) {

        crFactionIdPreview.textContent =
            newId || "—";



        if (!record.name) {

            crFactionPreview.hidden =
                true;


            crFactionSaveButton.disabled =
                true;


            return;

        }



        const duplicateId =
            owlControlRoomData.factions.some(
                faction =>
                    faction.id === newId
            );



        if (duplicateId) {

            errors.push(

                `A faction with the database ID ${newId} already exists.`

            );

        }



        crFactionPreview.hidden =
            false;


        crFactionAddReviewRow(
            "New Faction",
            record.name
        );


        crFactionAddReviewRow(
            "Database ID",
            newId
        );


        crFactionAddReviewRow(
            "Members",
            crFactionDisplayMembers(
                record.members
            )
        );


        crFactionAddReviewRow(
            "Official Tag Team",
            crFactionGetTeamName(
                record.tagTeamId
            )
        );


        crFactionAddReviewRow(
            "Singles Members",
            crFactionDisplayMembers(
                record.singlesMembers
            )
        );



        if (
            errors.length > 0
        ) {

            crFactionConflictMessage.textContent =
                errors.join(" ");


            crFactionConflictMessage.hidden =
                false;

        }



        crFactionSaveButton.disabled =
            errors.length > 0;


        crFactionSetStatus(

            errors.length > 0

                ? "CHECK FORM"

                : "READY TO CREATE"

        );


        return;

    }



    // =================================
    // EDIT MODE
    // =================================


    if (!crFactionOriginalRecord) {

        crFactionPreview.hidden =
            true;


        crFactionSaveButton.disabled =
            true;


        return;

    }



    const changes =
        crFactionGetChanges();


    const changeKeys =
        Object.keys(
            changes
        );



    if (
        changeKeys.length === 0
    ) {

        crFactionPreview.hidden =
            true;


        crFactionSaveButton.disabled =
            true;


        crFactionSetStatus(
            "NO CHANGES"
        );


        return;

    }



    changeKeys.forEach(
        key => {

            crFactionAddReviewRow(

                crFactionFieldLabel(
                    key
                ),

                `${crFactionFormatField(
                    key,
                    crFactionOriginalRecord[key]
                )} → ${crFactionFormatField(
                    key,
                    changes[key]
                )}`

            );

        }
    );



    crFactionPreview.hidden =
        false;



    if (
        errors.length > 0
    ) {

        crFactionConflictMessage.textContent =
            errors.join(" ");


        crFactionConflictMessage.hidden =
            false;

    }



    crFactionSaveButton.disabled =
        errors.length > 0;


    crFactionSetStatus(

        errors.length > 0

            ? "CHECK FORM"

            : "CHANGES READY"

    );

}



// =================================
// WRITE PERMISSION
// =================================


async function crFactionEnsureWritePermission() {

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


async function crFactionReadTextFile(
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



async function crFactionWriteTextFile(
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
// FIND RECORD OBJECT
// =================================


function crFactionFindObjectBounds(
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


function crFactionReplaceStringField(
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
// PRESERVE PRETTY FORMATTING
// =================================


function crFactionReplaceArrayField(
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
// UPDATE RECORD TEXT
// =================================


function crFactionUpdateRecordText(
    text,
    recordId,
    changes
) {

    const bounds =
        crFactionFindObjectBounds(
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
                    crFactionReplaceArrayField(

                        block,

                        key,

                        value

                    );


                return;

            }


            block =
                crFactionReplaceStringField(

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
// APPEND NEW RECORD
// =================================


function crFactionAppendRecordText(
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
// BUILD NEW FACTION
// =================================


function crFactionBuildNewRecord() {

    const form =
        crFactionGetFormRecord();


    return {

        id:
            crFactionCreateSlug(
                form.name
            ),

        name:
            form.name,

        brand:
            form.brand,

        logo:
            form.logo,

        leader:
            form.leader,

        tagTeamId:
            form.tagTeamId,

        members:
            form.members,

        singlesMembers:
            form.singlesMembers,

        whyWereHere:
            form.whyWereHere,

        championshipsHeld:
            [],

        awards:
            []

    };

}



// =================================
// APPLY WRESTLER FACTION ASSIGNMENTS
// =================================


function crFactionApplyWrestlerAssignments(
    wrestlerText,
    factionId,
    factionName,
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


            const belongedToFaction =

                oldMembers.includes(
                    wrestlerId
                )

                ||

                wrestler.factionId ===
                    factionId;



            if (
                !isNewMember

                &&

                !belongedToFaction
            ) {

                return;

            }



            updatedText =
                crFactionUpdateRecordText(

                    updatedText,

                    wrestlerId,

                    {

                        faction:
                            isNewMember
                                ? factionName
                                : "",

                        factionId:
                            isNewMember
                                ? factionId
                                : ""

                    }

                );

        }
    );


    return updatedText;

}



// =================================
// SAVE EXISTING FACTION
// =================================


async function crFactionSaveExisting() {

    const factionId =
        crFactionSelect.value;


    const form =
        crFactionGetFormRecord();


    const changes =
        crFactionGetChanges();



    if (
        !factionId

        ||

        Object.keys(
            changes
        ).length === 0
    ) {

        return;

    }



    const oldMembers =
        crFactionOriginalRecord.members;



    const factionsFile =
        await crFactionReadTextFile(
            "factions.json"
        );


    const wrestlersFile =
        await crFactionReadTextFile(
            "wrestlers.json"
        );



    const updatedFactionsText =
        crFactionUpdateRecordText(

            factionsFile.text,

            factionId,

            changes

        );



    const updatedWrestlersText =
        crFactionApplyWrestlerAssignments(

            wrestlersFile.text,

            factionId,

            form.name,

            oldMembers,

            form.members

        );



    await crFactionWriteTextFile(

        factionsFile.fileHandle,

        updatedFactionsText

    );


    await crFactionWriteTextFile(

        wrestlersFile.fileHandle,

        updatedWrestlersText

    );



    crFactionPendingSelectionId =
        factionId;



    await loadRepositoryData(
        owlRepositoryHandle
    );



    crFactionShowMessage(

        "Faction changes were saved locally. Review factions.json and wrestlers.json in GitHub Desktop before committing.",

        "save-success"

    );


    crFactionSetStatus(
        "SAVED"
    );

}



// =================================
// SAVE NEW FACTION
// =================================


async function crFactionSaveNew() {

    const faction =
        crFactionBuildNewRecord();



    const factionsFile =
        await crFactionReadTextFile(
            "factions.json"
        );


    const wrestlersFile =
        await crFactionReadTextFile(
            "wrestlers.json"
        );



    const updatedFactionsText =
        crFactionAppendRecordText(

            factionsFile.text,

            faction

        );



    const updatedWrestlersText =
        crFactionApplyWrestlerAssignments(

            wrestlersFile.text,

            faction.id,

            faction.name,

            [],

            faction.members

        );



    await crFactionWriteTextFile(

        factionsFile.fileHandle,

        updatedFactionsText

    );


    await crFactionWriteTextFile(

        wrestlersFile.fileHandle,

        updatedWrestlersText

    );



    crFactionMode.value =
        "edit";


    crFactionSelectRow.hidden =
        false;


    crFactionSaveButton.textContent =
        "Save Faction Changes";


    crFactionPendingSelectionId =
        faction.id;



    await loadRepositoryData(
        owlRepositoryHandle
    );



    crFactionShowMessage(

        `${faction.name} was created and its wrestler profiles were synchronized. Review factions.json and wrestlers.json in GitHub Desktop.`,

        "save-success"

    );


    crFactionSetStatus(
        "CREATED"
    );

}



// =================================
// SAVE BUTTON
// =================================


async function crFactionSave() {

    crFactionSaveButton.disabled =
        true;


    crFactionSetStatus(
        "SAVING..."
    );


    crFactionHideMessage();



    try {

        const permission =
            await crFactionEnsureWritePermission();


        if (!permission) {

            throw new Error(
                "Write permission was not granted."
            );

        }



        const record =
            crFactionGetFormRecord();


        const errors =
            crFactionValidate(
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
            crFactionMode.value === "create"
        ) {

            await crFactionSaveNew();

        }


        else {

            await crFactionSaveExisting();

        }

    }


    catch (error) {

        console.error(
            "Could not save faction:",
            error
        );


        // Rebuild review first because that function
        // clears existing messages.

        crFactionReviewChanges();


        crFactionSetStatus(
            "SAVE FAILED"
        );


        crFactionShowMessage(

            error.message ||
            "The faction could not be saved.",

            "save-error"

        );

    }

}



// =================================
// DATA RELOAD
// =================================


function crFactionHandleDataLoaded() {

    crFactionPopulateFactions();

}



// =================================
// EVENT LISTENERS
// =================================


crFactionMode.addEventListener(
    "change",
    crFactionChangeMode
);


crFactionSelect.addEventListener(
    "change",
    crFactionLoadSelected
);



Object.values(
    crFactionFields
).forEach(
    field => {

        field.addEventListener(
            "input",
            crFactionReviewChanges
        );


        field.addEventListener(
            "change",
            crFactionReviewChanges
        );

    }
);



crFactionSaveButton.addEventListener(
    "click",
    crFactionSave
);



window.addEventListener(

    "owl-control-room-data-loaded",

    crFactionHandleDataLoaded

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
            owlControlRoomData.factions
        )

        &&

        Array.isArray(
            owlControlRoomData.wrestlers
        )

        &&

        Array.isArray(
            owlControlRoomData.teams
        )
    ) {

        crFactionPopulateFactions();

    }

}


catch (error) {

    console.warn(
        "Faction Manager waiting for repository data.",
        error
    );

}
