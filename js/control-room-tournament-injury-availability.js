// =================================
// TOURNAMENT INJURY AVAILABILITY
// =================================


(() => {


    if (
        typeof getEligibleTournamentEntrants !==
            "function"

        ||

        typeof addTournamentFieldParticipant !==
            "function"
    ) {

        console.warn(
            "Tournament injury protection could not find the Tournament Field Manager."
        );


        return;

    }


    const originalGetEligibleTournamentEntrants =
        getEligibleTournamentEntrants;


    const originalAddTournamentFieldParticipant =
        addTournamentFieldParticipant;


    const tournamentPanel =
        document.getElementById(
            "cr-tool-tournaments"
        );


    const tournamentSaveButton =
        document.getElementById(
            "cr-tournament-field-save"
        );


    const tournamentLockButton =
        document.getElementById(
            "cr-tournament-field-lock"
        );


    const bracketPreviewButton =
        document.getElementById(
            "cr-tournament-bracket-preview"
        );


    const bracketSaveButton =
        document.getElementById(
            "cr-tournament-bracket-save"
        );


    let tournamentInjuryMessage =
        null;


    // =================================
    // BASIC HELPERS
    // =================================


    function tournamentInjuryArray(
        value
    ) {

        return Array.isArray(
            value
        )

            ? value

            : [];

    }


    function tournamentInjuryStatus(
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


    function tournamentInjuryGetDatabase() {

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
                tournamentInjuryArray(
                    database.injuries
                )

        };

    }


    function tournamentInjuryGetInjuredIds() {

        return new Set(

            tournamentInjuryGetDatabase()
                .injuries

                .filter(
                    injury =>
                        tournamentInjuryStatus(
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


    function tournamentInjuryGetWrestlers() {

        if (
            typeof getTournamentWrestlers ===
                "function"
        ) {

            return tournamentInjuryArray(
                getTournamentWrestlers()
            );

        }


        return tournamentInjuryArray(
            owlControlRoomData
                ?.wrestlers
        );

    }


    function tournamentInjuryGetTeams() {

        if (
            typeof getTournamentTeams ===
                "function"
        ) {

            return tournamentInjuryArray(
                getTournamentTeams()
            );

        }


        return tournamentInjuryArray(
            owlControlRoomData
                ?.teams
        );

    }


    function tournamentInjuryTeamUnavailable(
        team,
        injuredIds
    ) {

        return tournamentInjuryArray(
            team?.members
        ).some(
            wrestlerId =>
                injuredIds.has(
                    wrestlerId
                )
        );

    }


    function tournamentInjuryEntrantUnavailable(
        entrant,
        bracket,
        injuredIds
    ) {

        if (
            bracket?.participantType ===
                "team"
        ) {

            return tournamentInjuryTeamUnavailable(
                entrant,
                injuredIds
            );

        }


        return injuredIds.has(
            entrant?.id
        );

    }


    function tournamentInjuryGetEntrant(
        bracket,
        participantId
    ) {

        const entrants =

            bracket?.participantType ===
                "team"

                ? tournamentInjuryGetTeams()

                : tournamentInjuryGetWrestlers();


        return entrants.find(
            entrant =>
                entrant?.id ===
                    participantId
        )

        ||

        null;

    }


    function tournamentInjuryGetEntrantName(
        bracket,
        participantId
    ) {

        const entrant =
            tournamentInjuryGetEntrant(
                bracket,
                participantId
            );


        return entrant?.name ||
            participantId;

    }


    // =================================
    // MESSAGE AREA
    // =================================


    function tournamentInjuryCreateMessage() {

        if (
            tournamentInjuryMessage
            ||
            !tournamentPanel
        ) {

            return;

        }


        const heading =
            tournamentPanel.querySelector(
                ".control-room-panel-heading"
            );


        if (
            !heading
        ) {

            return;

        }


        tournamentInjuryMessage =
            document.createElement(
                "section"
            );


        tournamentInjuryMessage.id =
            "cr-tournament-injury-availability";


        tournamentInjuryMessage.className =
            "control-room-message control-room-message-error";


        tournamentInjuryMessage.hidden =
            true;


        tournamentInjuryMessage.innerHTML = `

            <strong>
                Tournament Injury Availability
            </strong>

            <p></p>

        `;


        heading.insertAdjacentElement(

            "afterend",

            tournamentInjuryMessage

        );

    }


    function tournamentInjuryShowMessage(
        message
    ) {

        tournamentInjuryCreateMessage();


        if (
            !tournamentInjuryMessage
        ) {

            return;

        }


        const paragraph =
            tournamentInjuryMessage.querySelector(
                "p"
            );


        if (
            paragraph
        ) {

            paragraph.textContent =
                message;

        }


        tournamentInjuryMessage.hidden =
            false;

    }


    function tournamentInjuryHideMessage() {

        if (
            tournamentInjuryMessage
        ) {

            tournamentInjuryMessage.hidden =
                true;

        }

    }


    // =================================
    // SELECTED FIELD VALIDATION
    // =================================


    function tournamentInjuryGetSelectedBracket() {

        if (
            typeof getSelectedControlRoomBracket !==
                "function"
        ) {

            return null;

        }


        return getSelectedControlRoomBracket();

    }


    function tournamentInjuryGetDraftParticipants() {

        try {

            return tournamentInjuryArray(
                tournamentFieldDraftParticipants
            );

        }

        catch {

            return [];

        }

    }


    function tournamentInjuryGetBlockedParticipants(
        bracket
    ) {

        if (
            !bracket
        ) {

            return [];

        }


        const injuredIds =
            tournamentInjuryGetInjuredIds();


        return tournamentInjuryGetDraftParticipants()

            .map(
                participantId => {

                    const entrant =
                        tournamentInjuryGetEntrant(
                            bracket,
                            participantId
                        );


                    return {

                        participantId,

                        entrant,

                        unavailable:
                            tournamentInjuryEntrantUnavailable(

                                entrant,

                                bracket,

                                injuredIds

                            )

                    };

                }
            )

            .filter(
                item =>
                    item.unavailable
            );

    }


    function tournamentInjuryApplyFieldProtection() {

        const bracket =
            tournamentInjuryGetSelectedBracket();


        if (
            !bracket
        ) {

            tournamentInjuryHideMessage();


            return false;

        }


        const blockedParticipants =
            tournamentInjuryGetBlockedParticipants(
                bracket
            );


        if (
            blockedParticipants.length ===
                0
        ) {

            tournamentInjuryHideMessage();


            return false;

        }


        const names =
            blockedParticipants.map(
                item =>
                    item.entrant?.name
                    ||
                    item.participantId
            );


        tournamentInjuryShowMessage(

            `${names.join(
                ", "
            )} ${
                names.length === 1

                    ? "is"

                    : "are"
            } currently unavailable because of an active injury. Reopen the field if necessary and replace ${
                names.length === 1

                    ? "this entrant"

                    : "these entrants"
            } before saving, locking, or generating the bracket.`

        );


        if (
            tournamentSaveButton
        ) {

            tournamentSaveButton.disabled =
                true;

        }


        if (
            tournamentLockButton
        ) {

            tournamentLockButton.disabled =
                true;

        }


        if (
            bracketPreviewButton
        ) {

            bracketPreviewButton.disabled =
                true;

        }


        if (
            bracketSaveButton
        ) {

            bracketSaveButton.disabled =
                true;

        }


        return true;

    }


    // =================================
    // ELIGIBLE POOL FILTER
    // =================================


    getEligibleTournamentEntrants =
        function (
            bracket
        ) {

            const injuredIds =
                tournamentInjuryGetInjuredIds();


            return originalGetEligibleTournamentEntrants(
                bracket
            ).filter(
                entrant =>
                    !tournamentInjuryEntrantUnavailable(

                        entrant,

                        bracket,

                        injuredIds

                    )
            );

        };


    // =================================
    // ADD PARTICIPANT PROTECTION
    // =================================


    addTournamentFieldParticipant =
        function (
            participantId
        ) {

            const bracket =
                tournamentInjuryGetSelectedBracket();


            const injuredIds =
                tournamentInjuryGetInjuredIds();


            const entrant =
                tournamentInjuryGetEntrant(
                    bracket,
                    participantId
                );


            if (
                bracket
                &&
                entrant
                &&
                tournamentInjuryEntrantUnavailable(

                    entrant,

                    bracket,

                    injuredIds

                )
            ) {

                tournamentInjuryShowMessage(

                    `${tournamentInjuryGetEntrantName(
                        bracket,
                        participantId
                    )} cannot be added while marked INJURED.`

                );


                return;

            }


            originalAddTournamentFieldParticipant(
                participantId
            );


            tournamentInjuryApplyFieldProtection();

        };


    // =================================
    // SAVE / LOCK / BRACKET PROTECTION
    // =================================


    tournamentPanel?.addEventListener(

        "click",

        event => {

            const protectedButton =
                event.target.closest(

                    `#cr-tournament-field-save,
                    #cr-tournament-field-lock,
                    #cr-tournament-bracket-preview,
                    #cr-tournament-bracket-save`

                );


            if (
                !protectedButton
            ) {

                return;

            }


            if (
                !tournamentInjuryApplyFieldProtection()
            ) {

                return;

            }


            event.preventDefault();


            event.stopImmediatePropagation();

        },

        true

    );


    // =================================
    // REFRESH HANDLING
    // =================================


    function tournamentInjuryRefresh() {

        tournamentInjuryCreateMessage();


        try {

            if (
                typeof renderTournamentFieldOverview ===
                    "function"

                &&

                tournamentInjuryGetSelectedBracket()
            ) {

                renderTournamentFieldOverview();

            }

        }

        catch (
            error
        ) {

            console.warn(
                "Could not refresh Tournament Field Manager injury availability:",
                error
            );

        }


        tournamentInjuryApplyFieldProtection();

    }


    window.addEventListener(

        "owl-control-room-data-loaded",

        tournamentInjuryRefresh

    );


    window.addEventListener(

        "owl-injuries-updated",

        tournamentInjuryRefresh

    );


    tournamentInjuryCreateMessage();


})();
