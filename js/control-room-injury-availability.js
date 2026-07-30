// =================================
// CONTROL ROOM INJURY AVAILABILITY
// MATCH BOOKER PROTECTION
// =================================


const injuryAvailabilityBooker =
    document.getElementById(
        "cr-tool-booker"
    );


const injuryAvailabilitySaveButton =
    document.getElementById(
        "cr-booker-save"
    );


const injuryAvailabilityStatusField =
    document.getElementById(
        "cr-booker-status-field"
    );


let injuryAvailabilityMessage =
    null;


let injuryAvailabilityScheduled =
    false;


// =================================
// BASIC HELPERS
// =================================


function injuryAvailabilityArray(
    value
) {

    return Array.isArray(
        value
    )

        ? value

        : [];

}


function injuryAvailabilityStatus(
    injury
) {

    return String(

        injury?.status
        ||
        injury?.currentStatus
        ||
        ""

    )
        .trim()
        .toUpperCase();

}


function injuryAvailabilityGetDatabase() {

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

            injuries:
                []

        };

    }


    return {

        ...database,

        injuries:
            injuryAvailabilityArray(
                database.injuries
            )

    };

}


function injuryAvailabilityGetInjuredIds() {

    return new Set(

        injuryAvailabilityGetDatabase()
            .injuries

            .filter(
                injury =>
                    injuryAvailabilityStatus(
                        injury
                    ) ===
                    "INJURED"
            )

            .map(
                injury =>
                    injury?.wrestlerId
            )

            .filter(
                Boolean
            )

    );

}


function injuryAvailabilityGetWrestlerMap() {

    return new Map(

        injuryAvailabilityArray(
            owlControlRoomData
                ?.wrestlers
        )
            .filter(
                wrestler =>
                    wrestler?.id
            )

            .map(
                wrestler => [

                    wrestler.id,

                    wrestler

                ]
            )

    );

}


function injuryAvailabilityGetTeamMap() {

    return new Map(

        injuryAvailabilityArray(
            owlControlRoomData
                ?.teams
        )
            .filter(
                team =>
                    team?.id
            )

            .map(
                team => [

                    team.id,

                    team

                ]
            )

    );

}


// =================================
// MESSAGE AREA
// =================================


function injuryAvailabilityCreateMessage() {

    if (
        injuryAvailabilityMessage
        ||
        !injuryAvailabilityBooker
    ) {

        return;

    }


    const heading =
        injuryAvailabilityBooker
            .querySelector(
                ".control-room-panel-heading"
            );


    if (
        !heading
    ) {

        return;

    }


    injuryAvailabilityMessage =
        document.createElement(
            "section"
        );


    injuryAvailabilityMessage.id =
        "cr-booker-injury-availability";


    injuryAvailabilityMessage.className =
        "control-room-message control-room-message-error";


    injuryAvailabilityMessage.hidden =
        true;


    injuryAvailabilityMessage.innerHTML = `

        <strong>
            Injury Availability
        </strong>

        <p></p>

    `;


    heading.insertAdjacentElement(

        "afterend",

        injuryAvailabilityMessage

    );

}


function injuryAvailabilitySetMessage(
    message
) {

    injuryAvailabilityCreateMessage();


    if (
        !injuryAvailabilityMessage
    ) {

        return;

    }


    const paragraph =
        injuryAvailabilityMessage
            .querySelector(
                "p"
            );


    if (
        paragraph
    ) {

        paragraph.textContent =
            message;

    }


    injuryAvailabilityMessage.hidden =
        false;

}


function injuryAvailabilityHideMessage() {

    if (
        injuryAvailabilityMessage
    ) {

        injuryAvailabilityMessage.hidden =
            true;

    }

}


// =================================
// OPTION LABELS
// =================================


function injuryAvailabilityGetOriginalLabel(
    option
) {

    if (
        !option.dataset
            .owlAvailabilityOriginalLabel
    ) {

        option.dataset
            .owlAvailabilityOriginalLabel =
                option.textContent.trim();

    }


    return option.dataset
        .owlAvailabilityOriginalLabel;

}


function injuryAvailabilityMarkOption(
    option,
    unavailable,
    suffix
) {

    const originalLabel =
        injuryAvailabilityGetOriginalLabel(
            option
        );


    const desiredLabel =

        unavailable

            ? `${originalLabel}${suffix}`

            : originalLabel;


    if (
        option.textContent !==
        desiredLabel
    ) {

        option.textContent =
            desiredLabel;

    }


    if (
        unavailable
    ) {

        option.disabled =
            true;


        option.dataset
            .owlInjuryUnavailable =
                "true";

    }

    else if (
        option.dataset
            .owlInjuryUnavailable ===
                "true"
    ) {

        option.disabled =
            false;


        delete option.dataset
            .owlInjuryUnavailable;

    }

}


// =================================
// SELECT DISCOVERY
// =================================


function injuryAvailabilityGetWrestlerSelects() {

    if (
        !injuryAvailabilityBooker
    ) {

        return [];

    }


    return [

        ...injuryAvailabilityBooker
            .querySelectorAll(

                `select[id*="wrestler"],
                select[data-cr-booker-participant="true"]`

            )

    ];

}


function injuryAvailabilityGetTeamSelects() {

    return [

        document.getElementById(
            "cr-booker-side-one-team"
        ),

        document.getElementById(
            "cr-booker-side-two-team"
        )

    ].filter(
        Boolean
    );

}


// =================================
// APPLY AVAILABILITY
// =================================


function injuryAvailabilityApplyWrestlers(
    injuredIds
) {

    injuryAvailabilityGetWrestlerSelects()
        .forEach(
            select => {

                [

                    ...select.options

                ].forEach(
                    option => {

                        if (
                            !option.value
                        ) {

                            return;

                        }


                        injuryAvailabilityMarkOption(

                            option,

                            injuredIds.has(
                                option.value
                            ),

                            " — INJURED"

                        );

                    }
                );

            }
        );

}


function injuryAvailabilityApplyTeams(
    injuredIds
) {

    const teamMap =
        injuryAvailabilityGetTeamMap();


    injuryAvailabilityGetTeamSelects()
        .forEach(
            select => {

                [

                    ...select.options

                ].forEach(
                    option => {

                        if (
                            !option.value
                        ) {

                            return;

                        }


                        const team =
                            teamMap.get(
                                option.value
                            );


                        const members =
                            injuryAvailabilityArray(
                                team?.members
                            );


                        const unavailable =
                            members.some(
                                wrestlerId =>
                                    injuredIds.has(
                                        wrestlerId
                                    )
                            );


                        injuryAvailabilityMarkOption(

                            option,

                            unavailable,

                            " — MEMBER INJURED"

                        );

                    }
                );

            }
        );

}


// =================================
// SELECTED COMPETITORS
// =================================


function injuryAvailabilityGetSelectedIds() {

    const selectedIds =
        new Set();


    injuryAvailabilityGetWrestlerSelects()
        .forEach(
            select => {

                if (
                    select.value
                ) {

                    selectedIds.add(
                        select.value
                    );

                }

            }
        );


    const teamMap =
        injuryAvailabilityGetTeamMap();


    injuryAvailabilityGetTeamSelects()
        .forEach(
            select => {

                if (
                    !select.value
                ) {

                    return;

                }


                const team =
                    teamMap.get(
                        select.value
                    );


                injuryAvailabilityArray(
                    team?.members
                ).forEach(
                    wrestlerId => {

                        selectedIds.add(
                            wrestlerId
                        );

                    }
                );

            }
        );


    return selectedIds;

}


function injuryAvailabilityGetSelectedInjuredIds(
    injuredIds
) {

    return [

        ...injuryAvailabilityGetSelectedIds()

    ].filter(
        wrestlerId =>
            injuredIds.has(
                wrestlerId
            )
    );

}


function injuryAvailabilityCanSaveInactiveMatch() {

    const status =
        String(
            injuryAvailabilityStatusField
                ?.value
                ||
                ""
        )
            .trim()
            .toLowerCase();


    return (

        status ===
            "cancelled"

        ||

        status ===
            "postponed"

    );

}


// =================================
// MAIN APPLICATION
// =================================


function injuryAvailabilityApply() {

    if (
        !injuryAvailabilityBooker
    ) {

        return;

    }


    injuryAvailabilityCreateMessage();


    const injuredIds =
        injuryAvailabilityGetInjuredIds();


    injuryAvailabilityApplyWrestlers(
        injuredIds
    );


    injuryAvailabilityApplyTeams(
        injuredIds
    );


    const selectedInjuredIds =
        injuryAvailabilityGetSelectedInjuredIds(
            injuredIds
        );


    const blocked =
        selectedInjuredIds.length >
            0

        &&

        !injuryAvailabilityCanSaveInactiveMatch();


    if (
        blocked
    ) {

        const wrestlerMap =
            injuryAvailabilityGetWrestlerMap();


        const names =
            selectedInjuredIds.map(
                wrestlerId =>
                    wrestlerMap.get(
                        wrestlerId
                    )?.name

                    ||

                    wrestlerId
            );


        injuryAvailabilitySetMessage(

            `${names.join(
                ", "
            )} cannot be booked while marked INJURED. Remove the injured competitor or change the existing match status to Postponed or Cancelled.`

        );


        if (
            injuryAvailabilitySaveButton
        ) {

            injuryAvailabilitySaveButton.disabled =
                true;

        }


        return;

    }


    if (
        injuredIds.size >
        0
    ) {

        injuryAvailabilitySetMessage(

            `${injuredIds.size} injured wrestler${
                injuredIds.size === 1

                    ? " is"

                    : "s are"
            } unavailable and disabled in Match Booker selections.`

        );

    }

    else {

        injuryAvailabilityHideMessage();

    }

}


// =================================
// SCHEDULING
// =================================


function injuryAvailabilityScheduleApply() {

    if (
        injuryAvailabilityScheduled
    ) {

        return;

    }


    injuryAvailabilityScheduled =
        true;


    window.requestAnimationFrame(
        () => {

            injuryAvailabilityScheduled =
                false;


            injuryAvailabilityApply();

        }
    );

}


// =================================
// SAVE PROTECTION
// =================================


injuryAvailabilitySaveButton
    ?.addEventListener(

        "click",

        event => {

            const injuredIds =
                injuryAvailabilityGetInjuredIds();


            const selectedInjuredIds =
                injuryAvailabilityGetSelectedInjuredIds(
                    injuredIds
                );


            const blocked =
                selectedInjuredIds.length >
                    0

                &&

                !injuryAvailabilityCanSaveInactiveMatch();


            if (
                !blocked
            ) {

                return;

            }


            event.preventDefault();


            event.stopImmediatePropagation();


            injuryAvailabilityApply();

        },

        true

    );


// =================================
// CHANGE HANDLING
// =================================


injuryAvailabilityBooker
    ?.addEventListener(

        "change",

        injuryAvailabilityScheduleApply

    );


injuryAvailabilityBooker
    ?.addEventListener(

        "input",

        injuryAvailabilityScheduleApply

    );


// =================================
// DYNAMIC PARTICIPANT HANDLING
// =================================


if (
    injuryAvailabilityBooker
) {

    const injuryAvailabilityObserver =
        new MutationObserver(
            injuryAvailabilityScheduleApply
        );


    injuryAvailabilityObserver.observe(

        injuryAvailabilityBooker,

        {

            childList:
                true,

            subtree:
                true

        }

    );

}


// =================================
// DATA EVENTS
// =================================


window.addEventListener(

    "owl-control-room-data-loaded",

    injuryAvailabilityScheduleApply

);


window.addEventListener(

    "owl-injuries-updated",

    injuryAvailabilityScheduleApply

);
