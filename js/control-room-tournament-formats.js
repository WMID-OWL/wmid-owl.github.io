// =================================
// OWL CONTROL ROOM
// TOURNAMENT COMPETITION FORMATS
// Mixed Singles + Battle Royal support
// =================================

(() => {
    const divisionSelect =
        document.getElementById(
            "cr-tournament-bracket-create-division"
        );

    const participantTypeSelect =
        document.getElementById(
            "cr-tournament-bracket-create-participant-type"
        );

    const creatorForm =
        document.querySelector(
            ".cr-tournament-bracket-create-form"
        );

    if (
        !divisionSelect ||
        !participantTypeSelect ||
        !creatorForm
    ) {
        return;
    }

    // Add Mixed Singles.
    if (
        ![
            ...divisionSelect.options
        ].some(
            option =>
                option.value ===
                "Mixed Singles"
        )
    ) {
        const option =
            document.createElement(
                "option"
            );

        option.value =
            "Mixed Singles";

        option.textContent =
            "Mixed Singles";

        const womensSingles =
            [
                ...divisionSelect.options
            ].find(
                option =>
                    option.value ===
                    "Women's Singles"
            );

        if (womensSingles) {
            womensSingles.after(
                option
            );
        }

        else {
            divisionSelect.appendChild(
                option
            );
        }
    }

    // Add Competition Type.
    let competitionTypeSelect =
        document.getElementById(
            "cr-tournament-bracket-create-competition-type"
        );

    if (!competitionTypeSelect) {
        const group =
            document.createElement(
                "div"
            );

        group.className =
            "cr-form-group";

        group.innerHTML = `
            <label for="cr-tournament-bracket-create-competition-type">
                COMPETITION TYPE
            </label>

            <select id="cr-tournament-bracket-create-competition-type">
                <option value="bracket">
                    Tournament Bracket
                </option>

                <option value="battle-royal">
                    Battle Royal
                </option>
            </select>
        `;

        divisionSelect
            .closest(
                ".cr-form-group"
            )
            ?.after(
                group
            );

        competitionTypeSelect =
            document.getElementById(
                "cr-tournament-bracket-create-competition-type"
            );
    }

    // Update creator wording.
    const headingBlock =
        creatorForm.querySelector(
            ".cr-editor-section-heading"
        );

    if (headingBlock) {
        const eyebrow =
            headingBlock.querySelector(
                "span"
            );

        const heading =
            headingBlock.querySelector(
                "h3"
            );

        const copy =
            headingBlock.querySelector(
                "p"
            );

        if (eyebrow) {
            eyebrow.textContent =
                "COMPETITION DIRECTORY";
        }

        if (heading) {
            heading.textContent =
                "Add Competition to Selected Tournament";
        }

        if (copy) {
            copy.textContent =
                "Add a tournament bracket or battle royal to the selected tournament.";
        }
    }

    const reviewHeading =
        creatorForm.querySelector(
            "#cr-tournament-bracket-create-preview > span"
        );

    if (reviewHeading) {
        reviewHeading.textContent =
            "REVIEW NEW COMPETITION";
    }

    const saveButton =
        document.getElementById(
            "cr-tournament-bracket-create-save"
        );

    if (saveButton) {
        saveButton.textContent =
            "Save New Competition";
    }

    // Keep the bracket-method panel hidden for Battle Royals.
    const style =
        document.createElement(
            "style"
        );

    style.textContent = `
        body.cr-tournament-battle-royal-selected
        #cr-tournament-bracket-method-panel {
            display: none !important;
        }
    `;

    document.head.appendChild(
        style
    );

    const getCompetitionType =
        bracket =>
            String(
                bracket?.competitionType ||
                "bracket"
            )
                .trim()
                .toLowerCase();

    const isBattleRoyal =
        bracket =>
            getCompetitionType(
                bracket
            ) ===
            "battle-royal";

    function syncCreatorFields() {
        const forceWrestlers =
            competitionTypeSelect?.value ===
                "battle-royal"
            ||
            divisionSelect.value ===
                "Mixed Singles";

        if (forceWrestlers) {
            participantTypeSelect.value =
                "wrestler";
        }

        participantTypeSelect.disabled =
            forceWrestlers;
    }

    function syncSelectedCompetitionState() {
        const selected =
            typeof getSelectedControlRoomBracket ===
                "function"
                ? getSelectedControlRoomBracket()
                : null;

        document.body.classList.toggle(
            "cr-tournament-battle-royal-selected",
            Boolean(
                selected &&
                isBattleRoyal(
                    selected
                )
            )
        );
    }

    // =================================
    // MIXED DIVISION ELIGIBILITY
    // =================================

    const originalGetTournamentBracketGender =
        getTournamentBracketGender;

    getTournamentBracketGender =
        function (
            bracket
        ) {
            if (
                normalize(
                    bracket?.division
                ).includes(
                    "mixed"
                )
            ) {
                return "mixed";
            }

            return originalGetTournamentBracketGender(
                bracket
            );
        };

    const originalIsTournamentWrestlerEligible =
        isTournamentWrestlerEligible;

    isTournamentWrestlerEligible =
        function (
            wrestler,
            bracket
        ) {
            if (
                getTournamentBracketGender(
                    bracket
                ) !==
                "mixed"
            ) {
                return originalIsTournamentWrestlerEligible(
                    wrestler,
                    bracket
                );
            }

            const wrestlerDivision =
                normalize(
                    wrestler?.division
                );

            if (
                wrestlerDivision !==
                    "men"
                &&
                wrestlerDivision !==
                    "women"
            ) {
                return false;
            }

            const bracketBrand =
                normalize(
                    bracket?.brand
                );

            if (
                !bracketBrand ||
                bracketBrand ===
                    "shared" ||
                bracketBrand ===
                    "owl"
            ) {
                return true;
            }

            return (
                normalize(
                    wrestler?.brand
                ) ===
                bracketBrand
            );
        };

    // =================================
    // SAVE COMPETITION FORMAT
    // =================================

    const originalGetTournamentBracketCreateDraft =
        getTournamentBracketCreateDraft;

    getTournamentBracketCreateDraft =
        function () {
            const draft =
                originalGetTournamentBracketCreateDraft();

            const type =
                competitionTypeSelect?.value ||
                "bracket";

            return {
                ...draft,

                competitionType:
                    type,

                participantType:
                    type ===
                        "battle-royal"
                        ? "wrestler"
                        : draft.participantType,

                fieldUnit:
                    type ===
                        "battle-royal"
                        ? "Competitors"
                        : draft.fieldUnit,

                battleRoyalSetup:
                    type ===
                        "battle-royal"
                        ? {
                            eliminationRule:
                                "Over the Top Rope",

                            winnerId:
                                ""
                        }
                        : null
            };
        };

    const originalResetTournamentBracketCreateForm =
        resetTournamentBracketCreateForm;

    resetTournamentBracketCreateForm =
        function () {
            originalResetTournamentBracketCreateForm();

            if (competitionTypeSelect) {
                competitionTypeSelect.value =
                    "bracket";
            }

            syncCreatorFields();
        };

    // =================================
    // CREATOR REVIEW
    // =================================

    const originalRenderTournamentBracketCreatePreview =
        renderTournamentBracketCreatePreview;

    renderTournamentBracketCreatePreview =
        function () {
            originalRenderTournamentBracketCreatePreview();

            const changeList =
                document.getElementById(
                    "cr-tournament-bracket-create-change-list"
                );

            if (!changeList) {
                return;
            }

            [
                ...changeList.querySelectorAll(
                    ".cr-editor-change-row"
                )
            ]
                .filter(
                    row =>
                        row.querySelector(
                            "strong"
                        )?.textContent.trim() ===
                        "FORMAT"
                )
                .forEach(
                    row =>
                        row.remove()
                );

            appendTournamentBracketCreateReviewRow(
                "FORMAT",

                competitionTypeSelect?.value ===
                    "battle-royal"
                    ? "Battle Royal"
                    : "Tournament Bracket"
            );
        };

    // =================================
    // BATTLE ROYAL SETUP
    // =================================

    const originalRenderTournamentBracketSetupOverview =
        renderTournamentBracketSetupOverview;

    renderTournamentBracketSetupOverview =
        function (
            bracket
        ) {
            if (
                !bracket ||
                !isBattleRoyal(
                    bracket
                )
            ) {
                originalRenderTournamentBracketSetupOverview(
                    bracket
                );

                syncSelectedCompetitionState();

                return;
            }

            tournamentBracketSetupDraft =
                null;

            tournamentBracketSetupStatus.textContent =
                "BATTLE ROYAL";

            tournamentBracketRoundCount.textContent =
                "—";

            tournamentBracketOpeningMatchCount.textContent =
                "1";

            tournamentBracketByeCount.textContent =
                "0";

            tournamentBracketPreviewButton.disabled =
                true;

            tournamentBracketPreviewButton.textContent =
                "Bracket Not Used";

            tournamentBracketSaveButton.disabled =
                true;

            tournamentBracketSetupMessage.hidden =
                true;

            const participants =
                getStoredTournamentParticipants(
                    bracket
                );

            const complete =
                participants.length ===
                Number(
                    bracket.fieldSize ||
                    0
                );

            let message =
                "Build the Battle Royal participant field. No tournament bracket will be generated.";

            if (
                complete &&
                !bracket.fieldLocked
            ) {
                message =
                    "The Battle Royal field is complete. Lock the field when the participants are final; no bracket generation is required.";
            }

            if (
                complete &&
                bracket.fieldLocked
            ) {
                message =
                    "Battle Royal field locked. This competition is ready without tournament bracket generation.";
            }

            setTournamentManagerEmptyMessage(
                tournamentBracketSetupPreview,
                message
            );

            syncSelectedCompetitionState();
        };

    // =================================
    // KEEP CREATOR IN SYNC
    // =================================

    const creatorFields = [
        document.getElementById(
            "cr-tournament-bracket-create-name"
        ),

        document.getElementById(
            "cr-tournament-bracket-create-brand"
        ),

        divisionSelect,

        document.getElementById(
            "cr-tournament-bracket-create-field-size"
        ),

        participantTypeSelect,

        document.getElementById(
            "cr-tournament-bracket-create-status"
        ),

        competitionTypeSelect
    ].filter(
        Boolean
    );

    creatorFields.forEach(
        field => {
            const refresh =
                () => {
                    syncCreatorFields();

                    renderTournamentBracketCreatePreview();
                };

            field.addEventListener(
                "input",
                refresh
            );

            field.addEventListener(
                "change",
                refresh
            );
        }
    );

    const bracketSelect =
        document.getElementById(
            "cr-tournament-bracket-select"
        );

    if (bracketSelect) {
        bracketSelect.addEventListener(
            "change",
            () => {
                window.setTimeout(
                    syncSelectedCompetitionState,
                    0
                );
            }
        );
    }

    syncCreatorFields();

    syncSelectedCompetitionState();
})();
