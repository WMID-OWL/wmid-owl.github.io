// =================================
// OWL CONTROL ROOM
// INNANET ACCOUNT MANAGER
// =================================


// =================================
// ELEMENTS
// =================================


const crAccountStatus =
    document.getElementById(
        "cr-account-status"
    );


const crAccountMode =
    document.getElementById(
        "cr-account-mode"
    );


const crAccountSelect =
    document.getElementById(
        "cr-account-select"
    );


const crAccountSelectRow =
    document.getElementById(
        "cr-account-select-row"
    );


const crAccountIdPreview =
    document.getElementById(
        "cr-account-id-preview"
    );


const crAccountDirectory =
    document.getElementById(
        "cr-account-directory"
    );


const crAccountTotalCount =
    document.getElementById(
        "cr-account-total-count"
    );


const crAccountActiveCount =
    document.getElementById(
        "cr-account-active-count"
    );


const crAccountRetiredCount =
    document.getElementById(
        "cr-account-retired-count"
    );


const crAccountPreview =
    document.getElementById(
        "cr-account-change-preview"
    );


const crAccountChangeList =
    document.getElementById(
        "cr-account-change-list"
    );


const crAccountError =
    document.getElementById(
        "cr-account-error"
    );


const crAccountSave =
    document.getElementById(
        "cr-account-save"
    );


const crAccountMessage =
    document.getElementById(
        "cr-account-message"
    );



// =================================
// FORM FIELDS
// =================================


const crAccountFields = {


    accountName:

        document.getElementById(
            "cr-account-name"
        ),


    handle:

        document.getElementById(
            "cr-account-handle"
        ),


    status:

        document.getElementById(
            "cr-account-account-status"
        ),


    archetype:

        document.getElementById(
            "cr-account-archetype"
        ),


    tone:

        document.getElementById(
            "cr-account-tone"
        ),


    focus:

        document.getElementById(
            "cr-account-focus"
        ),


    profanityLevel:

        document.getElementById(
            "cr-account-profanity"
        ),


    frequency:

        document.getElementById(
            "cr-account-frequency"
        ),


    replyStyle:

        document.getElementById(
            "cr-account-reply-style"
        ),


    factDiscipline:

        document.getElementById(
            "cr-account-fact-discipline"
        )

};



// =================================
// FIELD LABELS
// =================================


const crAccountLabels = {


    accountName:
        "Display Name",


    handle:
        "Handle",


    status:
        "Status",


    archetype:
        "Archetype",


    tone:
        "Tone",


    focus:
        "Focus Areas",


    profanityLevel:
        "Profanity Level",


    frequency:
        "Posting Frequency",


    replyStyle:
        "Reply Style",


    factDiscipline:
        "Fact Discipline"

};



// =================================
// STATE
// =================================


let crAccountRecords =
    [];


let crAccountOriginalRecord =
    null;


// EXACT FILE STATE WHEN THE MANAGER FIRST LOADS.
// THIS LETS A FULL REVERT RESTORE THE ORIGINAL FILE
// BYTE-FOR-BYTE INSTEAD OF LEAVING FORMATTING CHANGES.


let crAccountBaselineRecords =
    [];


let crAccountBaselineText =
    "";



// =================================
// BASIC HELPERS
// =================================


function crAccountNormalizeStatus(
    account
) {


    return String(

        account?.status

        ||

        "active"

    )
        .trim()
        .toLowerCase()

        ===

        "retired"

        ? "retired"

        : "active";

}



function crAccountSetStatus(
    text
) {


    if (
        crAccountStatus
    ) {


        crAccountStatus.textContent =
            text;

    }

}



function crAccountShowMessage(
    message,
    type
) {


    crAccountMessage.textContent =
        message;


    crAccountMessage.className =

        `cr-save-message ${type}`;


    crAccountMessage.hidden =
        false;

}



function crAccountHideMessage() {


    crAccountMessage.textContent =
        "";


    crAccountMessage.hidden =
        true;

}



function crAccountCreateId(
    value
) {


    return String(

        value || ""

    )

        .replace(
            /^@/,
            ""
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
            /[^a-z0-9]+/g,
            ""
        )

        .slice(
            0,
            40
        );

}



function crAccountParseFocus(
    value
) {


    return String(

        value || ""

    )

        .split(
            /[\n,]+/
        )

        .map(

            item =>
                item.trim()

        )

        .filter(
            Boolean
        );

}



function crAccountFormatFocus(
    focus
) {


    return Array.isArray(
        focus
    )

        ? focus.join(
            ", "
        )

        : "";

}



function crAccountValueText(
    value
) {


    if (
        Array.isArray(
            value
        )
    ) {


        return value.join(
            ", "
        );

    }


    return String(
        value ?? ""
    );

}



// =================================
// FORM RECORD
// =================================


function crAccountGetFormRecord() {


    const handleValue =

        crAccountFields
            .handle
            .value
            .trim();


    const cleanHandle =

        handleValue

            ? handleValue.startsWith(
                "@"
            )

                ? handleValue

                : `@${handleValue}`

            : "";


    const idSource =

        cleanHandle

        ||

        crAccountFields
            .accountName
            .value;


    const id =

        crAccountMode.value === "edit"

            ? crAccountOriginalRecord?.id

                ||

                ""

            : crAccountCreateId(
                idSource
            );


    return {


        id,


        accountName:

            crAccountFields
                .accountName
                .value
                .trim(),


        handle:
            cleanHandle,


        status:

            crAccountFields
                .status
                .value,


        archetype:

            crAccountFields
                .archetype
                .value
                .trim(),


        tone:

            crAccountFields
                .tone
                .value
                .trim(),


        focus:

            crAccountParseFocus(

                crAccountFields
                    .focus
                    .value

            ),


        profanityLevel:

            crAccountFields
                .profanityLevel
                .value,


        factDiscipline:

            crAccountFields
                .factDiscipline
                .value
                .trim(),


        replyStyle:

            crAccountFields
                .replyStyle
                .value
                .trim(),


        frequency:

            crAccountFields
                .frequency
                .value
                .trim()

    };

}



// =================================
// CLEAR FORM
// =================================


function crAccountClearForm() {


    crAccountOriginalRecord =
        null;


    crAccountFields.accountName.value =
        "";


    crAccountFields.handle.value =
        "";


    crAccountFields.status.value =
        "active";


    crAccountFields.archetype.value =
        "";


    crAccountFields.tone.value =
        "";


    crAccountFields.focus.value =
        "";


    crAccountFields.profanityLevel.value =
        "none";


    crAccountFields.frequency.value =
        "";


    crAccountFields.replyStyle.value =
        "";


    crAccountFields.factDiscipline.value =
        "";


    crAccountIdPreview.textContent =
        "—";


    crAccountPreview.hidden =
        true;


    crAccountError.hidden =
        true;


    crAccountSave.disabled =
        true;

}



// =================================
// FILE ACCESS
// =================================


async function crAccountEnsureWritePermission() {


    if (
        !owlRepositoryHandle
    ) {


        return false;

    }


    const options = {

        mode:
            "readwrite"

    };


    if (
        await owlRepositoryHandle.queryPermission(
            options
        )

        ===

        "granted"
    ) {


        return true;

    }


    return (

        await owlRepositoryHandle.requestPermission(
            options
        )

        ===

        "granted"

    );

}



async function crAccountGetFileHandle() {


    const dataDirectory =

        await owlRepositoryHandle
            .getDirectoryHandle(
                "data"
            );


    const innanetDirectory =

        await dataDirectory
            .getDirectoryHandle(
                "innanet"
            );


    return await innanetDirectory
        .getFileHandle(
            "accounts.json"
        );

}



async function crAccountReadFile() {


    const fileHandle =

        await crAccountGetFileHandle();


    const file =

        await fileHandle
            .getFile();


    const text =

        await file.text();


    return {

        fileHandle,

        text,

        accounts:

            JSON.parse(
                text
            )

    };

}



async function crAccountWriteFile(
    fileHandle,
    accounts
) {


    const writable =

        await fileHandle
            .createWritable();



    const matchesOriginalState =

        JSON.stringify(
            accounts
        )

        ===

        JSON.stringify(
            crAccountBaselineRecords
        );



    const outputText =

        matchesOriginalState

        &&

        crAccountBaselineText

            ? crAccountBaselineText

            : `${JSON.stringify(

                accounts,

                null,

                2

            )}\n`;



    await writable.write(
        outputText
    );


    await writable.close();

}



// =================================
// LOAD ACCOUNT DATA
// =================================


async function crAccountLoadRecords() {


    if (
        !owlRepositoryHandle
    ) {


        return;

    }


    try {


        crAccountSetStatus(
            "LOADING"
        );


        const file =

            await crAccountReadFile();


                crAccountRecords =

            Array.isArray(
                file.accounts
            )

                ? file.accounts

                : [];



        crAccountBaselineRecords =

            structuredClone(
                crAccountRecords
            );



        crAccountBaselineText =

            file.text;



        crAccountRenderAll();


        crAccountSetStatus(
            "READY"
        );

    }


    catch (
        error
    ) {


        console.error(

            "Could not load Innanet accounts:",

            error

        );


        crAccountSetStatus(
            "LOAD FAILED"
        );


        crAccountShowMessage(

            error.message

            ||

            "Could not load data/innanet/accounts.json.",

            "save-error"

        );

    }

}



// =================================
// SUMMARY COUNTS
// =================================


function crAccountRenderCounts() {


    const activeCount =

        crAccountRecords.filter(

            account =>

                crAccountNormalizeStatus(
                    account
                )

                ===

                "active"

        ).length;


    const retiredCount =

        crAccountRecords.length

        -

        activeCount;


    crAccountTotalCount.textContent =

        String(
            crAccountRecords.length
        );


    crAccountActiveCount.textContent =

        String(
            activeCount
        );


    crAccountRetiredCount.textContent =

        String(
            retiredCount
        );

}



// =================================
// ACCOUNT SELECT
// =================================


function crAccountPopulateSelect() {


    const selectedValue =

        crAccountSelect.value;


    crAccountSelect.innerHTML =

        `<option value="">Select Account</option>`;


    [...crAccountRecords]

        .sort(

            (
                a,
                b
            ) =>

                String(
                    a.accountName || ""
                )

                    .localeCompare(

                        String(
                            b.accountName || ""
                        )

                    )

        )

        .forEach(

            account => {


                const option =

                    document.createElement(
                        "option"
                    );


                option.value =
                    account.id;


                option.textContent =

                    `${account.accountName} — ${account.handle}`;


                crAccountSelect.appendChild(
                    option
                );

            }

        );


    if (
        crAccountRecords.some(

            account =>

                account.id ===
                    selectedValue

        )
    ) {


        crAccountSelect.value =
            selectedValue;

    }

}



// =================================
// ACCOUNT DIRECTORY
// =================================


function crAccountRenderDirectory() {


    crAccountDirectory.innerHTML =
        "";


    if (
        !crAccountRecords.length
    ) {


        crAccountDirectory.innerHTML =

            `<p class="cr-account-directory-empty">
                No Innanet accounts found.
            </p>`;


        return;

    }


    [...crAccountRecords]

        .sort(

            (
                a,
                b
            ) => {


                const statusCompare =

                    crAccountNormalizeStatus(
                        a
                    )

                        .localeCompare(

                            crAccountNormalizeStatus(
                                b
                            )

                        );


                if (
                    statusCompare !== 0
                ) {


                    return statusCompare;

                }


                return String(

                    a.accountName || ""

                ).localeCompare(

                    String(
                        b.accountName || ""
                    )

                );

            }

        )

        .forEach(

            account => {


                const status =

                    crAccountNormalizeStatus(
                        account
                    );


                const card =

                    document.createElement(
                        "article"
                    );


                card.className =

                    `cr-account-card cr-account-card-${status}`;


                card.innerHTML = `

                    <div class="cr-account-card-top">

                        <div>

                            <strong>
                                ${crAccountEscapeHtml(
                                    account.accountName || account.id
                                )}
                            </strong>

                            <span>
                                ${crAccountEscapeHtml(
                                    account.handle || ""
                                )}
                            </span>

                        </div>

                        <b class="cr-account-card-status">

                            ${status.toUpperCase()}

                        </b>

                    </div>


                    <p class="cr-account-card-archetype">

                        ${crAccountEscapeHtml(
                            account.archetype || "No archetype"
                        )}

                    </p>


                    <div class="cr-account-card-meta">

                        <span>
                            ${crAccountEscapeHtml(
                                account.frequency || "Unspecified frequency"
                            )}
                        </span>

                        <span>
                            ${crAccountEscapeHtml(
                                account.profanityLevel || "none"
                            )} profanity
                        </span>

                    </div>


                    <button
                        type="button"
                        class="cr-account-edit-button"
                        data-account-id="${crAccountEscapeHtml(
                            account.id
                        )}"
                    >
                        Edit Account
                    </button>

                `;


                crAccountDirectory.appendChild(
                    card
                );

            }

        );


    crAccountDirectory
        .querySelectorAll(
            ".cr-account-edit-button"
        )

        .forEach(

            button => {


                button.addEventListener(

                    "click",

                    () => {


                        crAccountMode.value =
                            "edit";


                        crAccountChangeMode();


                        crAccountSelect.value =

                            button.dataset
                                .accountId;


                        crAccountLoadSelected();


                        crAccountSelect
                            .scrollIntoView({

                                behavior:
                                    "smooth",

                                block:
                                    "center"

                            });

                    }

                );

            }

        );

}



// =================================
// HTML SAFETY
// =================================


function crAccountEscapeHtml(
    value
) {


    return String(
        value || ""
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
// RENDER ALL
// =================================


function crAccountRenderAll() {


    crAccountRenderCounts();


    crAccountPopulateSelect();


    crAccountRenderDirectory();

}



// =================================
// LOAD SELECTED ACCOUNT
// =================================


function crAccountLoadSelected() {


    crAccountHideMessage();


    const accountId =

        crAccountSelect.value;


    if (
        !accountId
    ) {


        crAccountClearForm();


        crAccountSetStatus(
            "SELECT ACCOUNT"
        );


        return;

    }


    const account =

        crAccountRecords.find(

            item =>

                item.id ===
                    accountId

        );


    if (
        !account
    ) {


        return;

    }


    crAccountOriginalRecord =

        structuredClone(
            account
        );


    crAccountFields.accountName.value =

        account.accountName

        ||

        "";


    crAccountFields.handle.value =

        account.handle

        ||

        "";


    crAccountFields.status.value =

        crAccountNormalizeStatus(
            account
        );


    crAccountFields.archetype.value =

        account.archetype

        ||

        "";


    crAccountFields.tone.value =

        account.tone

        ||

        "";


    crAccountFields.focus.value =

        crAccountFormatFocus(
            account.focus
        );


    crAccountFields.profanityLevel.value =

        account.profanityLevel

        ||

        "none";


    crAccountFields.frequency.value =

        account.frequency

        ||

        "";


    crAccountFields.replyStyle.value =

        account.replyStyle

        ||

        "";


    crAccountFields.factDiscipline.value =

        account.factDiscipline

        ||

        "";


    crAccountIdPreview.textContent =

        account.id;


    crAccountSetStatus(
        "EDITING"
    );


    crAccountReview();

}



// =================================
// MODE CHANGE
// =================================


function crAccountChangeMode() {


    crAccountHideMessage();


    crAccountClearForm();


    if (
        crAccountMode.value === "create"
    ) {


        crAccountSelectRow.hidden =
            true;


        crAccountSelect.value =
            "";


        crAccountSave.textContent =
            "Create Innanet Account";


        crAccountSetStatus(
            "NEW ACCOUNT"
        );

    }


    else {


        crAccountSelectRow.hidden =
            false;


        crAccountSave.textContent =
            "Save Account Changes";


        crAccountSetStatus(
            "SELECT ACCOUNT"
        );

    }


    crAccountReview();

}



// =================================
// VALIDATION
// =================================


function crAccountValidate(
    record
) {


    const errors =
        [];


    if (
        !record.accountName
    ) {


        errors.push(
            "Display name is required."
        );

    }


    if (
        !record.handle
    ) {


        errors.push(
            "Handle is required."
        );

    }


    if (
        !record.id
    ) {


        errors.push(
            "A database ID could not be created."
        );

    }


    if (
        !record.archetype
    ) {


        errors.push(
            "Archetype is required."
        );

    }


    if (
        !record.tone
    ) {


        errors.push(
            "Tone is required."
        );

    }


    if (
        record.focus.length === 0
    ) {


        errors.push(
            "Add at least one focus area."
        );

    }


    if (
        !record.factDiscipline
    ) {


        errors.push(
            "Fact discipline is required."
        );

    }


    if (
        !record.replyStyle
    ) {


        errors.push(
            "Reply style is required."
        );

    }


    if (
        !record.frequency
    ) {


        errors.push(
            "Posting frequency is required."
        );

    }


    const duplicateHandle =

        crAccountRecords.find(

            account =>

                account.id !==
                    crAccountOriginalRecord?.id

                &&

                String(
                    account.handle || ""
                )
                    .trim()
                    .toLowerCase()

                ===

                record.handle
                    .toLowerCase()

        );


    if (
        duplicateHandle
    ) {


        errors.push(
            "Another account already uses that handle."
        );

    }


    if (
        crAccountMode.value === "create"

        &&

        crAccountRecords.some(

            account =>

                account.id ===
                    record.id

        )
    ) {


        errors.push(
            "That database ID already exists."
        );

    }


    return errors;

}



// =================================
// REVIEW ROW
// =================================


function crAccountAddReviewRow(
    label,
    oldValue,
    newValue
) {


    const row =

        document.createElement(
            "div"
        );


    row.className =
        "cr-account-change-row";


    row.innerHTML = `

        <strong>
            ${crAccountEscapeHtml(label)}
        </strong>

        <span>
            ${crAccountEscapeHtml(
                crAccountValueText(oldValue) || "Empty"
            )}
        </span>

        <b>
            →
        </b>

        <span>
            ${crAccountEscapeHtml(
                crAccountValueText(newValue) || "Empty"
            )}
        </span>

    `;


    crAccountChangeList.appendChild(
        row
    );

}



// =================================
// REVIEW
// =================================


function crAccountReview() {


    const record =

        crAccountGetFormRecord();


    crAccountIdPreview.textContent =

        record.id

        ||

        "—";


    const errors =

        crAccountValidate(
            record
        );


    crAccountChangeList.innerHTML =
        "";


    crAccountError.hidden =
        true;


    let changeCount =
        0;


    if (
        crAccountMode.value === "create"
    ) {


        Object.keys(
            crAccountLabels
        )

            .forEach(

                key => {


                    const value =

                        record[
                            key
                        ];


                    if (
                        crAccountValueText(
                            value
                        )
                    ) {


                        crAccountAddReviewRow(

                            crAccountLabels[
                                key
                            ],

                            "",

                            value

                        );


                        changeCount +=
                            1;

                    }

                }

            );

    }


    else if (
        crAccountOriginalRecord
    ) {


        Object.keys(
            crAccountLabels
        )

            .forEach(

                key => {


                    const oldValue =

                        key === "status"

                            ? crAccountNormalizeStatus(
                                crAccountOriginalRecord
                            )

                            : crAccountOriginalRecord[
                                key
                            ];


                    const newValue =

                        record[
                            key
                        ];


                    if (
                        JSON.stringify(
                            oldValue
                        )

                        !==

                        JSON.stringify(
                            newValue
                        )
                    ) {


                        crAccountAddReviewRow(

                            crAccountLabels[
                                key
                            ],

                            oldValue,

                            newValue

                        );


                        changeCount +=
                            1;

                    }

                }

            );

    }


    crAccountPreview.hidden =

        changeCount === 0

        &&

        errors.length === 0;


    if (
        errors.length > 0
    ) {


        crAccountError.textContent =

            errors.join(
                " "
            );


        crAccountError.hidden =
            false;


        crAccountPreview.hidden =
            false;

    }


    const canSave =

        errors.length === 0

        &&

        changeCount > 0;


    crAccountSave.disabled =
        !canSave;


    if (
        errors.length > 0
    ) {


        crAccountSetStatus(
            "CHECK FORM"
        );

    }


    else if (
        changeCount > 0
    ) {


        crAccountSetStatus(

            crAccountMode.value === "create"

                ? "READY TO CREATE"

                : "CHANGES READY"

        );

    }

}



// =================================
// SAVE ACCOUNT
// =================================


async function crAccountSaveRecord() {


    crAccountSave.disabled =
        true;


    crAccountSetStatus(
        "SAVING..."
    );


    crAccountHideMessage();


    try {


        const permission =

            await crAccountEnsureWritePermission();


        if (
            !permission
        ) {


            throw new Error(

                "Write permission was not granted."

            );

        }


        const record =

            crAccountGetFormRecord();


        const errors =

            crAccountValidate(
                record
            );


        if (
            errors.length > 0
        ) {


            throw new Error(

                errors.join(
                    " "
                )

            );

        }


        const file =

            await crAccountReadFile();


        const latestAccounts =

            Array.isArray(
                file.accounts
            )

                ? file.accounts

                : [];


        let updatedAccounts;


                if (
            crAccountMode.value === "create"
        ) {


            if (
                latestAccounts.some(

                    account =>

                        account.id ===
                            record.id

                )
            ) {


                throw new Error(

                    "That account ID already exists in accounts.json."

                );

            }



            const newAccount =

                structuredClone(
                    record
                );



            // ACTIVE IS THE DEFAULT STATE.
            // ONLY RETIRED ACCOUNTS NEED A STORED STATUS FIELD.


            if (
                newAccount.status === "active"
            ) {


                delete newAccount.status;

            }



            updatedAccounts = [

                ...latestAccounts,

                newAccount

            ];

        }


        else {


            const existingIndex =

                latestAccounts.findIndex(

                    account =>

                        account.id ===
                            crAccountOriginalRecord?.id

                );


            if (
                existingIndex === -1
            ) {


                throw new Error(

                    "The selected account could not be found in the latest accounts.json file."

                );

            }


            updatedAccounts =

                structuredClone(
                    latestAccounts
                );


            updatedAccounts[
                existingIndex
            ] = {


                ...updatedAccounts[
                    existingIndex
                ],


                ...record

            };



            // ACTIVE IS THE DEFAULT STATE.
            // REMOVE THE STATUS FIELD WHEN AN ACCOUNT IS ACTIVE.


            if (
                record.status === "active"
            ) {


                delete updatedAccounts[
                    existingIndex
                ].status;

            }

        }

        await crAccountWriteFile(

            file.fileHandle,

            updatedAccounts

        );


        const savedId =
            record.id;


        crAccountRecords =
            updatedAccounts;


        crAccountRenderAll();


        crAccountMode.value =
            "edit";


        crAccountChangeMode();


        crAccountSelect.value =
            savedId;


        crAccountLoadSelected();


        crAccountShowMessage(

            crAccountMode.value === "edit"

                ? "Account saved locally. Review data/innanet/accounts.json in GitHub Desktop before committing."

                : "Account created locally. Review data/innanet/accounts.json in GitHub Desktop before committing.",

            "save-success"

        );


        crAccountSetStatus(
            "SAVED"
        );

    }


    catch (
        error
    ) {


        console.error(

            "Could not save Innanet account:",

            error

        );


        crAccountSetStatus(
            "SAVE FAILED"
        );


        crAccountShowMessage(

            error.message

            ||

            "The Innanet account could not be saved.",

            "save-error"

        );


        crAccountReview();

    }

}



// =================================
// FIELD EVENTS
// =================================


Object.values(
    crAccountFields
)

    .forEach(

        field => {


            field.addEventListener(

                "input",

                crAccountReview

            );


            field.addEventListener(

                "change",

                crAccountReview

            );

        }

    );



crAccountMode.addEventListener(

    "change",

    crAccountChangeMode

);



crAccountSelect.addEventListener(

    "change",

    crAccountLoadSelected

);



crAccountSave.addEventListener(

    "click",

    crAccountSaveRecord

);



// =================================
// REPOSITORY DATA EVENT
// =================================


window.addEventListener(

    "owl-control-room-data-loaded",

    crAccountLoadRecords

);



// =================================
// SAFETY INITIALIZATION
// =================================


try {


    if (
        typeof owlRepositoryHandle !==
            "undefined"

        &&

        owlRepositoryHandle
    ) {


        crAccountLoadRecords();

    }

}


catch (
    error
) {


    console.warn(

        "Innanet Account Manager waiting for repository connection.",

        error

    );

}
