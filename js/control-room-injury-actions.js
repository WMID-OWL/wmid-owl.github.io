// =================================
// CONTROL ROOM INJURY ACTIONS
// RETURN AND CLEARANCE
// =================================


const injuryActionList =
    document.getElementById(
        "cr-injury-active-list"
    );


let injuryActionMessage =
    document.getElementById(
        "cr-injury-action-message"
    );


let injuryActionBusy =
    false;


// =================================
// MESSAGE AREA
// =================================


function injuryActionCreateMessageArea() {

    if (
        injuryActionMessage
    ) {

        return;

    }


    const summaryGrid =
        document.querySelector(
            "#cr-tool-injuries .cr-injury-summary-grid"
        );


    if (
        !summaryGrid
    ) {

        return;

    }


    injuryActionMessage =
        document.createElement(
            "p"
        );


    injuryActionMessage.id =
        "cr-injury-action-message";


    injuryActionMessage.className =
        "cr-save-message";


    injuryActionMessage.hidden =
        true;


    summaryGrid.insertAdjacentElement(
        "afterend",
        injuryActionMessage
    );

}


function injuryActionSetMessage(
    message,
    type = "success"
) {

    injuryActionCreateMessageArea();


    if (
        !injuryActionMessage
    ) {

        return;

    }


    injuryActionMessage.textContent =
        message;


    injuryActionMessage.className =
        `cr-save-message ${
            type === "error"

                ? "save-error"

                : "save-success"
        }`;


    injuryActionMessage.hidden =
        false;

}


// =================================
// DATABASE HELPERS
// =================================


function injuryActionArray(
    value
) {

    return Array.isArray(
        value
    )

        ? value

        : [];

}


function injuryActionText(
    value
) {

    return String(
        value || ""
    ).trim();

}


function injuryActionGetDatabase() {

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
            injuryActionArray(
                database.injuries
            )

    };

}


async function injuryActionHasWritePermission() {

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


async function injuryActionWriteDatabase(
    database
) {

    if (
        !await injuryActionHasWritePermission()
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
// STATUS TRANSITIONS
// =================================


function injuryActionGetReturnUpdate(
    injury
) {

    return {

        ...injury,

        status:
            "RECOVERING",

        currentStatus:
            "RECOVERING",

        currentEnduranceState:
            "Low",

        returnedAt:
            new Date().toISOString(),

        recoveryStartedAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };

}


function injuryActionGetClearanceUpdate(
    injury
) {

    const priorEnduranceState =
        injuryActionText(
            injury.priorEnduranceState
        );


    if (
        !priorEnduranceState
    ) {

        throw new Error(

            "This injury record does not contain a prior endurance state. Add that information before clearing the wrestler."

        );

    }


    return {

        ...injury,

        status:
            "CLEARED",

        currentStatus:
            "CLEARED",

        currentEnduranceState:
            priorEnduranceState,

        clearedAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };

}


async function injuryActionUpdateRecord(
    injuryId,
    action
) {

    if (
        injuryActionBusy
    ) {

        return;

    }


    const database =
        injuryActionGetDatabase();


    const existingInjury =
        database.injuries.find(
            injury =>
                injury?.id ===
                injuryId
        );


    if (
        !existingInjury
    ) {

        injuryActionSetMessage(
            "The selected injury record could not be found.",
            "error"
        );


        return;

    }


    const wrestlerName =
        injuryActionText(
            existingInjury.wrestlerName
        )
        ||
        "This wrestler";


    const affectedBodyPart =
        injuryActionText(
            existingInjury.affectedBodyPart
        )
        ||
        "the affected body part";


    let updatedInjury;


    if (
        action ===
        "return"
    ) {

        const approved =
            window.confirm(

                `Confirm ${wrestlerName}'s return to active competition?\n\nBefore continuing, set ${affectedBodyPart} to Low endurance in Fire Pro.\n\nThe injury status will change from INJURED to RECOVERING.`

            );


        if (
            !approved
        ) {

            return;

        }


        updatedInjury =
            injuryActionGetReturnUpdate(
                existingInjury
            );

    }

    else if (
        action ===
        "clear"
    ) {

        const priorEnduranceState =
            injuryActionText(
                existingInjury.priorEnduranceState
            );


        if (
            !priorEnduranceState
        ) {

            injuryActionSetMessage(

                `${wrestlerName} cannot be cleared because the prior endurance state is missing.`,

                "error"

            );


            return;

        }


        const approved =
            window.confirm(

                `Confirm ${wrestlerName}'s full medical clearance?\n\nBefore continuing, restore ${affectedBodyPart} to ${priorEnduranceState} endurance in Fire Pro.\n\nThe injury status will change from RECOVERING to CLEARED.`

            );


        if (
            !approved
        ) {

            return;

        }


        updatedInjury =
            injuryActionGetClearanceUpdate(
                existingInjury
            );

    }

    else {

        return;

    }


    injuryActionBusy =
        true;


    const clickedButtons =
        document.querySelectorAll(
            `[data-injury-id="${CSS.escape(
                injuryId
            )}"]`
        );


    clickedButtons.forEach(
        button => {

            button.disabled =
                true;

        }
    );


    try {

        const updatedDatabase = {

            ...database,

            injuries:
                database.injuries.map(
                    injury =>

                        injury?.id ===
                            injuryId

                            ? updatedInjury

                            : injury
                )

        };


        await injuryActionWriteDatabase(
            updatedDatabase
        );


        owlControlRoomData.injuries =
            updatedDatabase;


        window.dispatchEvent(

            new CustomEvent(
                "owl-injuries-updated"
            )

        );


        injuryActionSetMessage(

            action ===
                "return"

                ? `${wrestlerName} is now RECOVERING and eligible for booking.`

                : `${wrestlerName} is now CLEARED and the affected body part has been restored to ${updatedInjury.currentEnduranceState}.`

        );

    }

    catch (
        error
    ) {

        console.error(
            "Could not update injury status:",
            error
        );


        injuryActionSetMessage(

            error.message ||
            "Could not update the injury record.",

            "error"

        );


        clickedButtons.forEach(
            button => {

                button.disabled =
                    false;

            }
        );

    }

    finally {

        injuryActionBusy =
            false;

    }

}


// =================================
// CLICK HANDLING
// =================================


injuryActionList?.addEventListener(

    "click",

    event => {

        const button =
            event.target.closest(
                "[data-injury-action][data-injury-id]"
            );


        if (
            !button
        ) {

            return;

        }


        injuryActionUpdateRecord(

            button.dataset.injuryId,

            button.dataset.injuryAction

        );

    }

);


window.addEventListener(

    "owl-control-room-data-loaded",

    injuryActionCreateMessageArea

);
