// =================================
// CONTROL ROOM INJURY RECORD CREATOR
// =================================


const injuryCreateEls = {

    evaluation:
        document.getElementById(
            "cr-injury-create-evaluation"
        ),

    form:
        document.getElementById(
            "cr-injury-create-form"
        ),

    wrestler:
        document.getElementById(
            "cr-injury-create-wrestler"
        ),

    roll:
        document.getElementById(
            "cr-injury-create-roll"
        ),

    absence:
        document.getElementById(
            "cr-injury-create-absence"
        ),

    recovery:
        document.getElementById(
            "cr-injury-create-recovery"
        ),

    critCause:
        document.getElementById(
            "cr-injury-create-crit-cause"
        ),

    diagnosis:
        document.getElementById(
            "cr-injury-create-diagnosis"
        ),

    bodyPart:
        document.getElementById(
            "cr-injury-create-body-part"
        ),

    priorEndurance:
        document.getElementById(
            "cr-injury-create-prior-endurance"
        ),

    championshipStatus:
        document.getElementById(
            "cr-injury-create-championship-status"
        ),

    startWeek:
        document.getElementById(
            "cr-injury-create-start-week"
        ),

    returnWeek:
        document.getElementById(
            "cr-injury-create-return-week"
        ),

    clearanceWeek:
        document.getElementById(
            "cr-injury-create-clearance-week"
        ),

    eventId:
        document.getElementById(
            "cr-injury-create-event-id"
        ),

    matchId:
        document.getElementById(
            "cr-injury-create-match-id"
        ),

    note:
        document.getElementById(
            "cr-injury-create-note"
        ),

    preview:
        document.getElementById(
            "cr-injury-create-preview"
        ),

    previewList:
        document.getElementById(
            "cr-injury-create-preview-list"
        ),

    error:
        document.getElementById(
            "cr-injury-create-error"
        ),

    save:
        document.getElementById(
            "cr-injury-create-save"
        ),

    message:
        document.getElementById(
            "cr-injury-create-message"
        )

};


// =================================
// BASIC HELPERS
// =================================


function injuryCreateArray(
    value
) {

    return Array.isArray(
        value
    )

        ? value

        : [];

}


function injuryCreateText(
    value
) {

    return String(
        value || ""
    ).trim();

}


function injuryCreateId() {

    if (
        window.crypto?.randomUUID
    ) {

        return `injury-${window.crypto.randomUUID()}`;

    }


    const randomPart =
        window.crypto
            .getRandomValues(
                new Uint32Array(
                    1
                )
            )[0]
            .toString(
                36
            );


    return `injury-${Date.now()}-${randomPart}`;

}


function injuryCreateGetDatabase() {

    const database =
        owlControlRoomData
            ?.injuries;


    if (
        !database
        ||
        Array.isArray(
            database
        )
        ||
        typeof database !==
            "object"
    ) {

        return {

            version:
                1,

            injuries:
                []

        };

    }


    return {

        ...database,

        version:
            Number(
                database.version || 1
            ),

        injuries:
            injuryCreateArray(
                database.injuries
            )

    };

}


function injuryCreateGetGeneratorDatabase() {

    const database =
        owlControlRoomData
            ?.generatorHistory;


    if (
        !database
        ||
        Array.isArray(
            database
        )
        ||
        typeof database !==
            "object"
    ) {

        return {

            results:
                []

        };

    }


    return {

        ...database,

        results:
            injuryCreateArray(
                database.results
            )

    };

}


// =================================
// ELIGIBLE EVALUATIONS
// =================================


function injuryCreateGetPendingEvaluations() {

    const usedGeneratorIds =
        new Set(

            injuryCreateGetDatabase()
                .injuries

                .map(
                    injury =>
                        injury?.generatorResultId
                )

                .filter(
                    Boolean
                )

        );


    return injuryCreateGetGeneratorDatabase()
        .results

        .filter(
            result => {

                const evaluation =
                    result
                        ?.injuryEvaluation;


                return Boolean(

                    result
                    &&
                    result.confirmed ===
                        true
                    &&
                    result.generatorKey ===
                        "injury-evaluation"
                    &&
                    evaluation
                    &&
                    Number(
                        evaluation.absenceWeeks ||
                        0
                    ) > 0
                    &&
                    evaluation.severeReviewRequired !==
                        true
                    &&
                    !usedGeneratorIds.has(
                        result.id
                    )

                );

            }
        )

        .sort(
            (
                a,
                b
            ) =>
                String(
                    b.confirmedAt ||
                    b.generatedAt ||
                    ""
                ).localeCompare(
                    String(
                        a.confirmedAt ||
                        a.generatedAt ||
                        ""
                    )
                )
        );

}


function injuryCreateGetSelectedEvaluation() {

    const selectedId =
        injuryCreateEls
            .evaluation
            ?.value;


    if (
        !selectedId
    ) {

        return null;

    }


    return injuryCreateGetPendingEvaluations()
        .find(
            result =>
                result.id ===
                selectedId
        )

    ||

    null;

}


// =================================
// MESSAGES
// =================================


function injuryCreateSetMessage(
    message,
    type = "success"
) {

    if (
        !injuryCreateEls.message
    ) {

        return;

    }


    injuryCreateEls.message.textContent =
        message;


    injuryCreateEls.message.className =
        `cr-save-message ${
            type === "error"

                ? "save-error"

                : "save-success"
        }`;


    injuryCreateEls.message.hidden =
        false;

}


function injuryCreateClearMessage() {

    if (
        !injuryCreateEls.message
    ) {

        return;

    }


    injuryCreateEls.message.hidden =
        true;


    injuryCreateEls.message.textContent =
        "";

}


// =================================
// FORM RESET
// =================================


function injuryCreateClearFields() {

    [

        injuryCreateEls.diagnosis,
        injuryCreateEls.bodyPart,
        injuryCreateEls.startWeek,
        injuryCreateEls.returnWeek,
        injuryCreateEls.clearanceWeek,
        injuryCreateEls.eventId,
        injuryCreateEls.matchId,
        injuryCreateEls.note

    ]
        .filter(
            Boolean
        )
        .forEach(
            field => {

                field.value =
                    "";

            }
        );


    if (
        injuryCreateEls.priorEndurance
    ) {

        injuryCreateEls.priorEndurance.value =
            "";

    }


    if (
        injuryCreateEls.championshipStatus
    ) {

        injuryCreateEls.championshipStatus.value =
            "Not Champion";

    }

}


function injuryCreateResetForm() {

    injuryCreateClearFields();


    if (
        injuryCreateEls.form
    ) {

        injuryCreateEls.form.hidden =
            true;

    }


    if (
        injuryCreateEls.preview
    ) {

        injuryCreateEls.preview.hidden =
            true;

    }


    if (
        injuryCreateEls.save
    ) {

        injuryCreateEls.save.disabled =
            true;

    }

}


// =================================
// EVALUATION SELECT
// =================================


function injuryCreatePopulateEvaluations() {

    const select =
        injuryCreateEls.evaluation;


    if (
        !select
    ) {

        return;

    }


    const previousValue =
        select.value;


    const evaluations =
        injuryCreateGetPendingEvaluations();


    select.innerHTML =
        "";


    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value =
        "";


    defaultOption.textContent =

        evaluations.length

            ? "Select Confirmed Evaluation"

            : "No eligible evaluations available";


    select.appendChild(
        defaultOption
    );


    evaluations.forEach(
        result => {

            const evaluation =
                result.injuryEvaluation;


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                result.id;


            option.textContent =
                `${evaluation.wrestlerName} — Roll ${evaluation.primaryRoll} — ${evaluation.outcomeLabel}`;


            select.appendChild(
                option
            );

        }
    );


    select.disabled =
        evaluations.length ===
        0;


    if (
        evaluations.some(
            result =>
                result.id ===
                previousValue
        )
    ) {

        select.value =
            previousValue;

    }

    else {

        injuryCreateResetForm();

    }

}


// =================================
// FORM DISPLAY
// =================================


function injuryCreateRenderSelectedEvaluation() {

    const result =
        injuryCreateGetSelectedEvaluation();


    injuryCreateClearMessage();


    if (
        !result
    ) {

        injuryCreateResetForm();


        return;

    }


    const evaluation =
        result.injuryEvaluation;


    const absenceWeeks =
        Number(
            evaluation.absenceWeeks ||
            0
        );


    const recoveryWeeks =
        Math.min(
            absenceWeeks,
            4
        );


    if (
        injuryCreateEls.form
    ) {

        injuryCreateEls.form.hidden =
            false;

    }


    injuryCreateEls.wrestler.textContent =
        evaluation.wrestlerName ||
        evaluation.wrestlerId ||
        "Unknown Wrestler";


    injuryCreateEls.roll.textContent =
        `${evaluation.primaryRoll} / 10`;


    injuryCreateEls.absence.textContent =
        `${absenceWeeks} week${absenceWeeks === 1 ? "" : "s"}`;


    injuryCreateEls.recovery.textContent =
        `${recoveryWeeks} week${recoveryWeeks === 1 ? "" : "s"}`;


    injuryCreateEls.critCause.value =
        evaluation.critCause ||
        "";


    injuryCreateRenderPreview();

}


// =================================
// DRAFT
// =================================


function injuryCreateGetDraft() {

    const result =
        injuryCreateGetSelectedEvaluation();


    if (
        !result
    ) {

        return null;

    }


    const evaluation =
        result.injuryEvaluation;


    const absenceWeeks =
        Number(
            evaluation.absenceWeeks ||
            0
        );


    const postReturnLowWeeks =
        Math.min(
            absenceWeeks,
            4
        );


    const priorEnduranceState =
        injuryCreateText(
            injuryCreateEls
                .priorEndurance
                ?.value
        );


    return {

        id:
            injuryCreateId(),

        generatorResultId:
            result.id,

        wrestlerId:
            evaluation.wrestlerId,

        wrestlerName:
            evaluation.wrestlerName,

        eventId:
            injuryCreateText(
                injuryCreateEls
                    .eventId
                    ?.value
            ),

        matchId:
            injuryCreateText(
                injuryCreateEls
                    .matchId
                    ?.value
            ),

        critCause:
            evaluation.critCause,

        diagnosis:
            injuryCreateText(
                injuryCreateEls
                    .diagnosis
                    ?.value
            ),

        affectedBodyPart:
            injuryCreateText(
                injuryCreateEls
                    .bodyPart
                    ?.value
            ),

        primaryRoll:
            Number(
                evaluation.primaryRoll
            ),

        classification:
            "STANDARD",

        absenceWeeks,

        injuryStartWeek:
            injuryCreateText(
                injuryCreateEls
                    .startWeek
                    ?.value
            ),

        expectedReturnWeek:
            injuryCreateText(
                injuryCreateEls
                    .returnWeek
                    ?.value
            ),

        postReturnLowWeeks,

        recoveryStartWeek:
            injuryCreateText(
                injuryCreateEls
                    .returnWeek
                    ?.value
            ),

        expectedClearanceWeek:
            injuryCreateText(
                injuryCreateEls
                    .clearanceWeek
                    ?.value
            ),

        priorEnduranceState,

        currentEnduranceState:
            priorEnduranceState,

        status:
            "INJURED",

        championshipStatusAtInjury:
            injuryCreateText(
                injuryCreateEls
                    .championshipStatus
                    ?.value
            )
            ||
            "Not Champion",

        titleDecision:
            "",

        commissionerNote:
            injuryCreateText(
                injuryCreateEls
                    .note
                    ?.value
            ),

        generatorConfirmedAt:
            result.confirmedAt ||
            result.generatedAt ||
            "",

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };

}


function injuryCreateValidateDraft(
    draft
) {

    if (
        !draft
    ) {

        return "Select a confirmed injury evaluation.";

    }


    if (
        !draft.diagnosis
    ) {

        return "Diagnosis is required.";

    }


    if (
        !draft.affectedBodyPart
    ) {

        return "Affected Fire Pro body part is required.";

    }


    if (
        !draft.priorEnduranceState
    ) {

        return "Prior endurance state is required.";

    }


    if (
        !draft.injuryStartWeek
    ) {

        return "Injury start week is required.";

    }


    if (
        !draft.expectedReturnWeek
    ) {

        return "Expected return week is required.";

    }


    if (
        !draft.expectedClearanceWeek
    ) {

        return "Expected full-clearance week is required.";

    }


    return "";

}


// =================================
// PREVIEW
// =================================


function injuryCreateAppendPreviewRow(
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


    injuryCreateEls
        .previewList
        ?.appendChild(
            row
        );

}


function injuryCreateRenderPreview() {

    const result =
        injuryCreateGetSelectedEvaluation();


    if (
        !result
        ||
        !injuryCreateEls.preview
        ||
        !injuryCreateEls.previewList
    ) {

        return;

    }


    const draft =
        injuryCreateGetDraft();


    const error =
        injuryCreateValidateDraft(
            draft
        );


    injuryCreateEls.preview.hidden =
        false;


    injuryCreateEls.previewList.innerHTML =
        "";


    injuryCreateAppendPreviewRow(
        "WRESTLER",
        draft.wrestlerName
    );


    injuryCreateAppendPreviewRow(
        "DIAGNOSIS",
        draft.diagnosis
    );


    injuryCreateAppendPreviewRow(
        "AFFECTED AREA",
        draft.affectedBodyPart
    );


    injuryCreateAppendPreviewRow(
        "ABSENCE",
        `${draft.absenceWeeks} week(s)`
    );


    injuryCreateAppendPreviewRow(
        "RETURN WEEK",
        draft.expectedReturnWeek
    );


    injuryCreateAppendPreviewRow(
        "POST-RETURN LOW",
        `${draft.postReturnLowWeeks} week(s)`
    );


    injuryCreateAppendPreviewRow(
        "CLEARANCE WEEK",
        draft.expectedClearanceWeek
    );


    injuryCreateAppendPreviewRow(
        "PRIOR ENDURANCE",
        draft.priorEnduranceState
    );


    injuryCreateAppendPreviewRow(
        "INITIAL STATUS",
        "INJURED"
    );


    if (
        injuryCreateEls.error
    ) {

        injuryCreateEls.error.textContent =
            error;


        injuryCreateEls.error.hidden =
            !error;

    }


    if (
        injuryCreateEls.save
    ) {

        injuryCreateEls.save.disabled =
            Boolean(
                error
            );

    }

}


// =================================
// WRITE DATABASE
// =================================


async function injuryCreateHasWritePermission() {

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
        ) ===
        "granted"
    ) {

        return true;

    }


    return (
        await owlRepositoryHandle.requestPermission(
            options
        ) ===
        "granted"
    );

}


async function injuryCreateWriteDatabase(
    database
) {

    if (
        !await injuryCreateHasWritePermission()
    ) {

        throw new Error(
            "Repository write permission was not granted."
        );

    }


    const dataDirectory =
        await owlRepositoryHandle.getDirectoryHandle(
            "data"
        );


    const fileHandle =
        await dataDirectory.getFileHandle(
            "injuries.json"
        );


    const writable =
        await fileHandle.createWritable();


    try {

        await writable.write(
            `${JSON.stringify(
                database,
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

            // No additional action is required.

        }


        throw error;

    }

}


// =================================
// SAVE
// =================================


async function injuryCreateSave() {

    const draft =
        injuryCreateGetDraft();


    const validationError =
        injuryCreateValidateDraft(
            draft
        );


    if (
        validationError
    ) {

        injuryCreateSetMessage(
            validationError,
            "error"
        );


        return;

    }


    const approved =
        window.confirm(

            `Create an official INJURED record for ${draft.wrestlerName}?\n\nThis will be written to data/injuries.json.`

        );


    if (
        !approved
    ) {

        return;

    }


    injuryCreateEls.save.disabled =
        true;


    try {

        const database =
            injuryCreateGetDatabase();


        const updatedDatabase = {

            ...database,

            version:
                Number(
                    database.version || 1
                ),

            injuries: [

                draft,

                ...database.injuries.filter(
                    injury =>
                        injury.id !==
                        draft.id
                )

            ]

        };


        await injuryCreateWriteDatabase(
            updatedDatabase
        );


        owlControlRoomData.injuries =
            updatedDatabase;


        window.dispatchEvent(

            new CustomEvent(
                "owl-injuries-updated"
            )

        );


        injuryCreateEls.evaluation.value =
            "";


        injuryCreateResetForm();


        injuryCreatePopulateEvaluations();


        injuryCreateSetMessage(

            `${draft.wrestlerName} is now officially marked INJURED.`

        );

    }

    catch (
        error
    ) {

        console.error(
            "Could not create injury record:",
            error
        );


        injuryCreateSetMessage(

            error.message ||
            "Could not save the injury record.",

            "error"

        );


        injuryCreateRenderPreview();

    }

}


// =================================
// EVENTS
// =================================


injuryCreateEls.evaluation?.addEventListener(

    "change",

    injuryCreateRenderSelectedEvaluation

);


[

    injuryCreateEls.diagnosis,
    injuryCreateEls.bodyPart,
    injuryCreateEls.priorEndurance,
    injuryCreateEls.championshipStatus,
    injuryCreateEls.startWeek,
    injuryCreateEls.returnWeek,
    injuryCreateEls.clearanceWeek,
    injuryCreateEls.eventId,
    injuryCreateEls.matchId,
    injuryCreateEls.note

]
    .filter(
        Boolean
    )
    .forEach(
        field => {

            field.addEventListener(

                field.tagName ===
                    "SELECT"

                    ? "change"

                    : "input",

                injuryCreateRenderPreview

            );

        }
    );


injuryCreateEls.save?.addEventListener(

    "click",

    injuryCreateSave

);


window.addEventListener(

    "owl-control-room-data-loaded",

    () => {

        injuryCreateClearMessage();


        injuryCreatePopulateEvaluations();


        injuryCreateResetForm();

    }

);
