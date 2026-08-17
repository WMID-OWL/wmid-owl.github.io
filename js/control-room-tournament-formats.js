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


    // =================================
    // CREATOR: MIXED + COMPETITION TYPE
    // =================================

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


        if (
            womensSingles
        ) {
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


    let competitionTypeSelect =
        document.getElementById(
            "cr-tournament-bracket-create-competition-type"
        );


    if (
        !competitionTypeSelect
    ) {
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


    const headingBlock =
        creatorForm.querySelector(
            ".cr-editor-section-heading"
        );


    if (
        headingBlock
    ) {
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


        if (
            eyebrow
        ) {
            eyebrow.textContent =
                "COMPETITION DIRECTORY";
        }


        if (
            heading
        ) {
            heading.textContent =
                "Add Competition to Selected Tournament";
        }


        if (
            copy
        ) {
            copy.textContent =
                "Add a tournament bracket or battle royal to the selected tournament.";
        }
    }


    const reviewHeading =
        creatorForm.querySelector(
            "#cr-tournament-bracket-create-preview > span"
        );


    if (
        reviewHeading
    ) {
        reviewHeading.textContent =
            "REVIEW NEW COMPETITION";
    }


    const saveButton =
        document.getElementById(
            "cr-tournament-bracket-create-save"
        );


    if (
        saveButton
    ) {
        saveButton.textContent =
            "Save New Competition";
    }


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


        if (
            forceWrestlers
        ) {
            participantTypeSelect.value =
                "wrestler";
        }


        participantTypeSelect.disabled =
            forceWrestlers;
    }



    // =================================
    // BATTLE ROYAL CONTROL ROOM PANELS
    // =================================


    const bracketSetupSection =
        typeof tournamentBracketSetupPreview !==
            "undefined"
            ? tournamentBracketSetupPreview?.closest(
                ".cr-editor-section"
            )
            : null;


    if (
        bracketSetupSection &&
        !bracketSetupSection.id
    ) {
        bracketSetupSection.id =
            "cr-tournament-bracket-method-panel";
    }


    const style =
        document.createElement(
            "style"
        );


    style.textContent = `

        body.cr-tournament-battle-royal-selected
        #cr-tournament-bracket-method-panel {
            display:
                none !important;
        }

    `;


    document.head.appendChild(
        style
    );


    let battleRoyalWinnerPanel =
        document.getElementById(
            "cr-tournament-battle-royal-winner-panel"
        );


    if (
        !battleRoyalWinnerPanel
    ) {
        battleRoyalWinnerPanel =
            document.createElement(
                "div"
            );


        battleRoyalWinnerPanel.id =
            "cr-tournament-battle-royal-winner-panel";


        battleRoyalWinnerPanel.className =
            "cr-editor-section";


        battleRoyalWinnerPanel.hidden =
            true;


        battleRoyalWinnerPanel.innerHTML = `

            <div class="cr-editor-section-heading">

                <span>
                    BATTLE ROYAL RESULT
                </span>

                <h3>
                    Record Battle Royal Winner
                </h3>

                <p>
                    After the Battle Royal is completed, select the winner from the locked participant field and save the result.
                </p>

            </div>


            <div class="cr-editor-top-grid">


                <div class="cr-form-group">

                    <label>
                        ELIMINATION RULE
                    </label>

                    <div
                        id="cr-tournament-battle-royal-rule"
                        class="cr-current-value"
                    >
                        Over the Top Rope
                    </div>

                </div>


                <div class="cr-form-group">

                    <label for="cr-tournament-battle-royal-winner">
                        WINNER
                    </label>

                    <select
                        id="cr-tournament-battle-royal-winner"
                        disabled
                    >

                        <option value="">
                            Select a Battle Royal first
                        </option>

                    </select>

                </div>


                <div class="cr-form-group">

                    <label>
                        CURRENT RESULT
                    </label>

                    <div
                        id="cr-tournament-battle-royal-current-winner"
                        class="cr-current-value"
                    >
                        —
                    </div>

                </div>


            </div>


            <div
                id="cr-tournament-battle-royal-winner-review"
                class="cr-change-preview"
                hidden
            >

                <span>
                    REVIEW BATTLE ROYAL RESULT
                </span>

                <div
                    id="cr-tournament-battle-royal-winner-change-list"
                    class="cr-editor-change-list"
                >
                </div>

                <p
                    id="cr-tournament-battle-royal-winner-error"
                    class="cr-change-error"
                    hidden
                >
                </p>

            </div>


            <div class="cr-manager-actions">

                <button
                    id="cr-tournament-battle-royal-winner-save"
                    class="control-room-button control-room-button-primary"
                    type="button"
                    disabled
                >
                    Save Battle Royal Winner
                </button>

            </div>


            <p
                id="cr-tournament-battle-royal-winner-message"
                class="cr-save-message"
                hidden
            >
            </p>

        `;


        if (
            bracketSetupSection
        ) {
            bracketSetupSection.after(
                battleRoyalWinnerPanel
            );
        }

        else {
            document.getElementById(
                "cr-tool-tournaments"
            )?.appendChild(
                battleRoyalWinnerPanel
            );
        }
    }


    const battleRoyalWinnerSelect =
        document.getElementById(
            "cr-tournament-battle-royal-winner"
        );


    const battleRoyalRule =
        document.getElementById(
            "cr-tournament-battle-royal-rule"
        );


    const battleRoyalCurrentWinner =
        document.getElementById(
            "cr-tournament-battle-royal-current-winner"
        );


    const battleRoyalWinnerReview =
        document.getElementById(
            "cr-tournament-battle-royal-winner-review"
        );


    const battleRoyalWinnerChangeList =
        document.getElementById(
            "cr-tournament-battle-royal-winner-change-list"
        );


    const battleRoyalWinnerError =
        document.getElementById(
            "cr-tournament-battle-royal-winner-error"
        );


    const battleRoyalWinnerSaveButton =
        document.getElementById(
            "cr-tournament-battle-royal-winner-save"
        );


    const battleRoyalWinnerMessage =
        document.getElementById(
            "cr-tournament-battle-royal-winner-message"
        );



    function getBattleRoyalWinnerId(
        bracket
    ) {
        return String(
            bracket?.battleRoyalSetup?.winnerId ||
            ""
        ).trim();
    }



    function getBattleRoyalEliminationRule(
        bracket
    ) {
        return String(
            bracket?.battleRoyalSetup?.eliminationRule ||
            "Over the Top Rope"
        ).trim()
        ||
        "Over the Top Rope";
    }



    function getBattleRoyalParticipantRecords(
        bracket
    ) {
        if (
            !bracket ||
            !Array.isArray(
                bracket.participants
            )
        ) {
            return [];
        }


        const wrestlerDatabase =
            typeof getTournamentWrestlers ===
                "function"
                ? getTournamentWrestlers()
                : [];


        return bracket.participants
            .map(
                participantId =>
                    wrestlerDatabase.find(
                        wrestler =>
                            wrestler.id ===
                            participantId
                    )
                    ||
                    null
            )
            .filter(
                Boolean
            );
    }



    function getBattleRoyalWinnerName(
        bracket,
        winnerId
    ) {
        if (
            !winnerId
        ) {
            return "";
        }


        return getBattleRoyalParticipantRecords(
            bracket
        ).find(
            wrestler =>
                wrestler.id ===
                winnerId
        )?.name
        ||
        "Winner Unavailable";
    }



    function appendBattleRoyalReviewRow(
        label,
        value
    ) {
        const row =
            document.createElement(
                "div"
            );


        row.className =
            "cr-editor-change-row";


        const strong =
            document.createElement(
                "strong"
            );


        strong.textContent =
            label;


        const span =
            document.createElement(
                "span"
            );


        span.textContent =
            value;


        row.append(
            strong,
            span
        );


        battleRoyalWinnerChangeList.appendChild(
            row
        );
    }



    function renderBattleRoyalWinnerReview(
        bracket
    ) {
        if (
            !battleRoyalWinnerReview ||
            !battleRoyalWinnerChangeList ||
            !battleRoyalWinnerSaveButton ||
            !battleRoyalWinnerSelect ||
            !battleRoyalWinnerError ||
            !battleRoyalWinnerMessage
        ) {
            return;
        }


        battleRoyalWinnerError.hidden =
            true;


        battleRoyalWinnerMessage.hidden =
            true;


        const selectedWinnerId =
            String(
                battleRoyalWinnerSelect.value ||
                ""
            ).trim();


        const currentWinnerId =
            getBattleRoyalWinnerId(
                bracket
            );


        battleRoyalWinnerChangeList.innerHTML =
            "";


        if (
            !selectedWinnerId ||
            selectedWinnerId ===
                currentWinnerId
        ) {
            battleRoyalWinnerReview.hidden =
                true;


            battleRoyalWinnerSaveButton.disabled =
                true;


            return;
        }


        const selectedWinnerName =
            getBattleRoyalWinnerName(
                bracket,
                selectedWinnerId
            );


        const currentWinnerName =
            currentWinnerId
                ? getBattleRoyalWinnerName(
                    bracket,
                    currentWinnerId
                )
                : "Not yet crowned";


        appendBattleRoyalReviewRow(
            "CURRENT RESULT",
            currentWinnerName
        );


        appendBattleRoyalReviewRow(
            "NEW WINNER",
            selectedWinnerName
        );


        battleRoyalWinnerReview.hidden =
            false;


        battleRoyalWinnerSaveButton.disabled =
            false;
    }



    function populateBattleRoyalWinnerSelect(
        bracket,
        participants,
        currentWinnerId
    ) {
        battleRoyalWinnerSelect.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =
            "— Select Winner —";


        battleRoyalWinnerSelect.appendChild(
            placeholder
        );


        participants.forEach(
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


                battleRoyalWinnerSelect.appendChild(
                    option
                );
            }
        );


        if (
            currentWinnerId &&
            participants.some(
                wrestler =>
                    wrestler.id ===
                    currentWinnerId
            )
        ) {
            battleRoyalWinnerSelect.value =
                currentWinnerId;
        }

        else {
            battleRoyalWinnerSelect.value =
                "";
        }
    }



    function renderBattleRoyalWinnerManager(
        bracket
    ) {
        if (
            !battleRoyalWinnerPanel ||
            !battleRoyalWinnerSelect ||
            !battleRoyalRule ||
            !battleRoyalCurrentWinner ||
            !battleRoyalWinnerSaveButton ||
            !battleRoyalWinnerReview ||
            !battleRoyalWinnerMessage
        ) {
            return;
        }


        const activeBattleRoyal =
            Boolean(
                bracket &&
                isBattleRoyal(
                    bracket
                )
            );


        battleRoyalWinnerPanel.hidden =
            !activeBattleRoyal;


        if (
            !activeBattleRoyal
        ) {
            battleRoyalWinnerSelect.innerHTML =
                "";


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";


            option.textContent =
                "Select a Battle Royal first";


            battleRoyalWinnerSelect.appendChild(
                option
            );


            battleRoyalWinnerSelect.disabled =
                true;


            battleRoyalCurrentWinner.textContent =
                "—";


            battleRoyalWinnerSaveButton.disabled =
                true;


            battleRoyalWinnerReview.hidden =
                true;


            battleRoyalWinnerMessage.hidden =
                true;


            return;
        }


        battleRoyalRule.textContent =
            getBattleRoyalEliminationRule(
                bracket
            );


        const participants =
            getBattleRoyalParticipantRecords(
                bracket
            );


        const currentWinnerId =
            getBattleRoyalWinnerId(
                bracket
            );


        const currentWinnerName =
            currentWinnerId
                ? getBattleRoyalWinnerName(
                    bracket,
                    currentWinnerId
                )
                : "";


        battleRoyalCurrentWinner.textContent =
            currentWinnerName ||
            "TO BE CROWNED";


        if (
            !bracket.fieldLocked
        ) {
            battleRoyalWinnerSelect.innerHTML =
                "";


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";


            option.textContent =
                "Lock the participant field first";


            battleRoyalWinnerSelect.appendChild(
                option
            );


            battleRoyalWinnerSelect.disabled =
                true;


            battleRoyalWinnerSaveButton.disabled =
                true;


            battleRoyalWinnerReview.hidden =
                true;


            battleRoyalWinnerMessage.textContent =
                "Lock the completed Battle Royal field before recording a winner.";


            battleRoyalWinnerMessage.hidden =
                false;


            return;
        }


        if (
            participants.length ===
                0
        ) {
            battleRoyalWinnerSelect.innerHTML =
                "";


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";


            option.textContent =
                "No locked competitors available";


            battleRoyalWinnerSelect.appendChild(
                option
            );


            battleRoyalWinnerSelect.disabled =
                true;


            battleRoyalWinnerSaveButton.disabled =
                true;


            battleRoyalWinnerReview.hidden =
                true;


            battleRoyalWinnerMessage.textContent =
                "No participant records are available for this Battle Royal.";


            battleRoyalWinnerMessage.hidden =
                false;


            return;
        }


        battleRoyalWinnerMessage.hidden =
            true;


        populateBattleRoyalWinnerSelect(
            bracket,
            participants,
            currentWinnerId
        );


        battleRoyalWinnerSelect.disabled =
            false;


        renderBattleRoyalWinnerReview(
            bracket
        );
    }



    async function saveBattleRoyalWinner() {
        const tournament =
            typeof getSelectedControlRoomTournament ===
                "function"
                ? getSelectedControlRoomTournament()
                : null;


        const bracket =
            typeof getSelectedControlRoomBracket ===
                "function"
                ? getSelectedControlRoomBracket()
                : null;


        if (
            !tournament ||
            !bracket ||
            !isBattleRoyal(
                bracket
            )
        ) {
            return;
        }


        battleRoyalWinnerError.hidden =
            true;


        battleRoyalWinnerMessage.hidden =
            true;


        const winnerId =
            String(
                battleRoyalWinnerSelect?.value ||
                ""
            ).trim();


        if (
            !winnerId
        ) {
            battleRoyalWinnerError.textContent =
                "Select the Battle Royal winner.";


            battleRoyalWinnerError.hidden =
                false;


            battleRoyalWinnerReview.hidden =
                false;


            return;
        }


        if (
            !bracket.fieldLocked
        ) {
            battleRoyalWinnerError.textContent =
                "Lock the Battle Royal participant field before recording a winner.";


            battleRoyalWinnerError.hidden =
                false;


            battleRoyalWinnerReview.hidden =
                false;


            return;
        }


        const participants =
            Array.isArray(
                bracket.participants
            )
                ? bracket.participants
                : [];


        if (
            !participants.includes(
                winnerId
            )
        ) {
            battleRoyalWinnerError.textContent =
                "The selected winner is not part of the locked Battle Royal field.";


            battleRoyalWinnerError.hidden =
                false;


            battleRoyalWinnerReview.hidden =
                false;


            return;
        }


        const winnerName =
            getBattleRoyalWinnerName(
                bracket,
                winnerId
            );


        const currentWinnerId =
            getBattleRoyalWinnerId(
                bracket
            );


        const currentWinnerName =
            currentWinnerId
                ? getBattleRoyalWinnerName(
                    bracket,
                    currentWinnerId
                )
                : "";


        const confirmationMessage =
            currentWinnerId &&
            currentWinnerId !==
                winnerId
                ? `Replace ${currentWinnerName} with ${winnerName} as the winner of ${bracket.name}?`
                : `Record ${winnerName} as the winner of ${bracket.name}?`;


        const confirmed =
            window.confirm(
                confirmationMessage
            );


        if (
            !confirmed
        ) {
            return;
        }


        const tournamentDatabase =
            owlControlRoomData.tournaments;


        if (
            !tournamentDatabase ||
            Array.isArray(
                tournamentDatabase
            ) ||
            !Array.isArray(
                tournamentDatabase.tournaments
            )
        ) {
            battleRoyalWinnerError.textContent =
                "The tournament database is not available.";


            battleRoyalWinnerError.hidden =
                false;


            battleRoyalWinnerReview.hidden =
                false;


            return;
        }


        const selectedTournamentId =
            tournament.id;


        const selectedBracketId =
            bracket.id;


        const updatedTournamentDatabase = {
            ...tournamentDatabase,


            tournaments:
                tournamentDatabase.tournaments.map(
                    storedTournament => {

                        if (
                            storedTournament.id !==
                            selectedTournamentId
                        ) {
                            return storedTournament;
                        }


                        return {
                            ...storedTournament,


                            brackets:
                                Array.isArray(
                                    storedTournament.brackets
                                )
                                    ? storedTournament.brackets.map(
                                        storedBracket => {

                                            if (
                                                storedBracket.id !==
                                                selectedBracketId
                                            ) {
                                                return storedBracket;
                                            }


                                            const storedSetup =
                                                storedBracket.battleRoyalSetup &&
                                                typeof storedBracket.battleRoyalSetup ===
                                                    "object" &&
                                                !Array.isArray(
                                                    storedBracket.battleRoyalSetup
                                                )
                                                    ? storedBracket.battleRoyalSetup
                                                    : {};


                                            return {
                                                ...storedBracket,


                                                battleRoyalSetup: {
                                                    ...storedSetup,


                                                    eliminationRule:
                                                        getBattleRoyalEliminationRule(
                                                            storedBracket
                                                        ),


                                                    winnerId:
                                                        winnerId
                                                }
                                            };
                                        }
                                    )
                                    : []
                        };
                    }
                )
        };


        battleRoyalWinnerSaveButton.disabled =
            true;


        battleRoyalWinnerSelect.disabled =
            true;


        battleRoyalWinnerMessage.textContent =
            "SAVING BATTLE ROYAL RESULT...";


        battleRoyalWinnerMessage.hidden =
            false;


        try {
            await writeTournamentDatabase(
                updatedTournamentDatabase
            );


            await loadRepositoryData(
                owlRepositoryHandle
            );


            tournamentSelect.value =
                selectedTournamentId;


            populateTournamentBracketSelector();


            tournamentBracketSelect.value =
                selectedBracketId;


            loadTournamentFieldDraft();


            window.setTimeout(
                () => {

                    const refreshedBracket =
                        getSelectedControlRoomBracket();


                    syncSelectedCompetitionState();


                    battleRoyalWinnerMessage.textContent =
                        `${winnerName} was recorded as the winner of ${refreshedBracket?.name || bracket.name}.`;


                    battleRoyalWinnerMessage.hidden =
                        false;

                },
                0
            );
        }


        catch (
            error
        ) {
            console.error(
                "Could not save Battle Royal winner:",
                error
            );


            battleRoyalWinnerError.textContent =
                error.message
                ||
                "The Battle Royal winner could not be saved.";


            battleRoyalWinnerError.hidden =
                false;


            battleRoyalWinnerReview.hidden =
                false;


            battleRoyalWinnerSelect.disabled =
                false;


            renderBattleRoyalWinnerReview(
                bracket
            );
        }
    }



    function syncSelectedCompetitionState() {
        const selected =
            typeof getSelectedControlRoomBracket ===
                "function"
                ? getSelectedControlRoomBracket()
                : null;


        const battleRoyalSelected =
            Boolean(
                selected &&
                isBattleRoyal(
                    selected
                )
            );


        document.body.classList.toggle(
            "cr-tournament-battle-royal-selected",
            battleRoyalSelected
        );


        renderBattleRoyalWinnerManager(
            selected
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


            if (
                competitionTypeSelect
            ) {
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


            if (
                !changeList
            ) {
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
    // BRACKET SETUP VS. BATTLE ROYAL
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

                if (
                    tournamentBracketPreviewButton
                ) {
                    tournamentBracketPreviewButton.textContent =
                        "Generate Bracket Preview";
                }


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
    // EVENT LISTENERS
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


    if (
        bracketSelect
    ) {
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


    const tournamentSelector =
        document.getElementById(
            "cr-tournament-select"
        );


    if (
        tournamentSelector
    ) {
        tournamentSelector.addEventListener(
            "change",
            () => {

                window.setTimeout(
                    syncSelectedCompetitionState,
                    0
                );

            }
        );
    }


    if (
        battleRoyalWinnerSelect
    ) {
        battleRoyalWinnerSelect.addEventListener(
            "change",
            () => {

                const selected =
                    getSelectedControlRoomBracket();


                if (
                    selected &&
                    isBattleRoyal(
                        selected
                    )
                ) {
                    renderBattleRoyalWinnerReview(
                        selected
                    );
                }

            }
        );
    }


    if (
        battleRoyalWinnerSaveButton
    ) {
        battleRoyalWinnerSaveButton.addEventListener(
            "click",
            saveBattleRoyalWinner
        );
    }


    syncCreatorFields();


    syncSelectedCompetitionState();

})();
