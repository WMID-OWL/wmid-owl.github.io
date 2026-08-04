// =================================
// OWL CONTROL ROOM
// TOURNAMENT EDITOR + BRACKET SETUP
// =================================

(() => {
    const originalToggleTournamentCreatorMode =
        toggleTournamentCreatorMode;

    const originalSaveNewTournament =
        saveNewTournament;

    const originalGetTournamentCreateDraft =
        getTournamentCreateDraft;

    const originalValidateTournamentCreateDraft =
        validateTournamentCreateDraft;

    const originalGetTournamentBracketStructure =
        getTournamentBracketStructure;

    const originalGenerateTournamentBracketPreviewData =
        generateTournamentBracketPreviewData;

    const originalGenerateTournamentBracketPreview =
        generateTournamentBracketPreview;

    const originalValidateTournamentBracketSetupDraft =
        validateTournamentBracketSetupDraft;

    const originalRenderTournamentBracketSetupOverview =
        renderTournamentBracketSetupOverview;


    // =================================
    // EXISTING TOURNAMENT EDITING
    // =================================

    const tournamentCreatorHeading =
        document.querySelector(
            ".cr-tournament-creator-section > .cr-editor-section-heading h3"
        );

    const tournamentCreatorDescription =
        document.querySelector(
            ".cr-tournament-creator-section > .cr-editor-section-heading p"
        );


    function populateSelectedTournamentEditor() {
        const tournament =
            getSelectedControlRoomTournament();

        if (!tournament) {
            tournamentCreateName.value =
                "";

            tournamentCreateYear.value =
                String(
                    new Date().getFullYear()
                );

            tournamentCreateStatusSelect.value =
                "Upcoming";

            tournamentCreateBadge.value =
                "";

            tournamentCreatePurpose.value =
                "";

            tournamentCreateSaveButton.disabled =
                true;

            return;
        }


        tournamentCreateName.value =
            tournament.name || "";

        tournamentCreateYear.value =
            tournament.year || "";

        tournamentCreateStatusSelect.value =
            tournament.status || "Upcoming";

        tournamentCreateBadge.value =
            tournament.badge || "";

        tournamentCreatePurpose.value =
            tournament.purpose || "";


        renderTournamentCreatePreview();
    }


    getTournamentCreateDraft = function () {
        const draft =
            originalGetTournamentCreateDraft();


        if (
            tournamentManagerMode.value ===
                "edit"
        ) {
            const tournament =
                getSelectedControlRoomTournament();


            if (tournament) {
                return {
                    ...draft,

                    id:
                        tournament.id
                };
            }
        }


        return draft;
    };


    validateTournamentCreateDraft = function (
        draft
    ) {
        const baseError =
            originalValidateTournamentCreateDraft(
                draft
            );


        if (baseError) {
            return baseError;
        }


        if (!draft.purpose) {
            return "Purpose / rules / stakes are required.";
        }


        return "";
    };


    toggleTournamentCreatorMode = function () {
        const isCreateMode =
            tournamentManagerMode.value ===
                "create";


        tournamentCreateForm.hidden =
            false;


        if (tournamentCreatorHeading) {
            tournamentCreatorHeading.textContent =

                isCreateMode

                    ? "Create New Tournament"

                    : "Edit Selected Tournament";
        }


        if (tournamentCreatorDescription) {
            tournamentCreatorDescription.textContent =

                isCreateMode

                    ? "Create a new tournament shell in data/tournaments.json, then add its brackets and participant fields."

                    : "Update the selected tournament's public name, status, badge, purpose, rules, and stakes.";
        }


        tournamentCreateSaveButton.textContent =

            isCreateMode

                ? "Save New Tournament"

                : "Save Tournament Details";


        tournamentCreateMessage.hidden =
            true;


        if (isCreateMode) {
            resetTournamentCreateForm();

            tournamentCreateForm.hidden =
                false;

            return;
        }


        populateSelectedTournamentEditor();
    };


    async function saveExistingTournamentDetails() {
        const tournament =
            getSelectedControlRoomTournament();


        if (!tournament) {
            setTournamentCreateMessage(
                "Select a tournament first.",
                "error"
            );

            return;
        }


        const draft =
            getTournamentCreateDraft();


        const validationError =
            validateTournamentCreateDraft(
                draft
            );


        if (validationError) {
            setTournamentCreateMessage(
                validationError,
                "error"
            );

            return;
        }


        const tournamentDatabase =
            owlControlRoomData.tournaments;


        if (
            !tournamentDatabase

            ||

            Array.isArray(
                tournamentDatabase
            )

            ||

            !Array.isArray(
                tournamentDatabase.tournaments
            )
        ) {
            setTournamentCreateMessage(
                "The tournament database is not available.",
                "error"
            );

            return;
        }


        const selectedTournamentId =
            tournament.id;


        const selectedBracketId =
            tournamentBracketSelect.value;


        const updatedDatabase = {
            ...tournamentDatabase,

            tournaments:

                tournamentDatabase.tournaments.map(
                    storedTournament =>

                        storedTournament.id ===
                            selectedTournamentId

                            ? {
                                ...storedTournament,

                                name:
                                    draft.name,

                                year:
                                    draft.year,

                                status:
                                    draft.status,

                                badge:
                                    draft.badge,

                                purpose:
                                    draft.purpose
                            }

                            : storedTournament
                )
        };


        tournamentCreateSaveButton.disabled =
            true;

        tournamentCreateStatus.textContent =
            "SAVING";


        try {
            await writeTournamentDatabase(
                updatedDatabase
            );


            await loadRepositoryData(
                owlRepositoryHandle
            );


            tournamentSelect.value =
                selectedTournamentId;


            populateTournamentBracketSelector();


            if (selectedBracketId) {
                tournamentBracketSelect.value =
                    selectedBracketId;

                loadTournamentFieldDraft();
            }


            tournamentCreateStatus.textContent =
                "READY";


            populateSelectedTournamentEditor();


            setTournamentCreateMessage(
                "Tournament details saved successfully."
            );
        }

        catch (error) {
            console.error(
                "Could not save tournament details:",
                error
            );


            tournamentCreateStatus.textContent =
                "ERROR";


            setTournamentCreateMessage(

                error.message

                ||

                "The tournament details could not be saved.",

                "error"
            );
        }
    }


    async function saveTournamentFromCurrentMode() {
        if (
            tournamentManagerMode.value ===
                "create"
        ) {
            await originalSaveNewTournament();

            return;
        }


        await saveExistingTournamentDetails();
    }


    tournamentManagerMode.removeEventListener(
        "change",
        originalToggleTournamentCreatorMode
    );


    tournamentManagerMode.addEventListener(
        "change",
        toggleTournamentCreatorMode
    );


    tournamentCreateSaveButton.removeEventListener(
        "click",
        originalSaveNewTournament
    );


    tournamentCreateSaveButton.addEventListener(
        "click",
        saveTournamentFromCurrentMode
    );


    tournamentSelect.addEventListener(
        "change",
        () => {
            if (
                tournamentManagerMode.value ===
                    "edit"
            ) {
                window.setTimeout(
                    populateSelectedTournamentEditor,
                    0
                );
            }
        }
    );


    // =================================
    // BRACKET SETUP METHOD CONTROLS
    // =================================

    const bracketSetupPreview =
        document.getElementById(
            "cr-tournament-bracket-setup-preview"
        );


    const methodPanel =
        document.createElement(
            "div"
        );


    methodPanel.id =
        "cr-tournament-bracket-method-panel";


    methodPanel.className =
        "cr-editor-section";


    methodPanel.hidden =
        true;


    methodPanel.innerHTML = `

        <div class="cr-editor-section-heading">

            <span>
                DRAW METHOD
            </span>

            <h3>
                Choose How Matchups Are Set
            </h3>

            <p>
                Random Draw shuffles the locked field. Manual — Preserve Field Order pairs slots 1 vs. 2, 3 vs. 4, and so on without shuffling.
            </p>

        </div>


        <div class="cr-editor-top-grid">

            <div class="cr-form-group">

                <label for="cr-tournament-bracket-method">
                    BRACKET SETUP METHOD
                </label>

                <select id="cr-tournament-bracket-method">

                    <option value="random">
                        Random Draw
                    </option>

                    <option value="manual-order">
                        Manual — Preserve Field Order
                    </option>

                </select>

            </div>


            <div class="cr-form-group">

                <label>
                    FIELD-ORDER RULE
                </label>

                <div class="cr-current-value">
                    Consecutive slots become opening matches
                </div>

            </div>

        </div>


        <div
            id="cr-tournament-28-bye-controls"
            class="cr-editor-form-grid"
            hidden
        >

            <div class="cr-form-group">

                <label for="cr-tournament-ascension-bye-source">
                    ASCENSION SECOND-ROUND BYE PATH
                </label>

                <select id="cr-tournament-ascension-bye-source">
                </select>

            </div>


            <div class="cr-form-group">

                <label for="cr-tournament-revolt-bye-source">
                    REVOLT SECOND-ROUND BYE PATH
                </label>

                <select id="cr-tournament-revolt-bye-source">
                </select>

            </div>

        </div>


        <p class="cr-editor-note">
            For the 28-team Twin Talon bracket, locked slots 1–14 must be the seven Ascension matchups and slots 15–28 must be the seven Revolt matchups.
        </p>

    `;


    bracketSetupPreview.before(
        methodPanel
    );


    const bracketMethodSelect =
        document.getElementById(
            "cr-tournament-bracket-method"
        );


    const byeControls =
        document.getElementById(
            "cr-tournament-28-bye-controls"
        );


    const ascensionByeSelect =
        document.getElementById(
            "cr-tournament-ascension-bye-source"
        );


    const revoltByeSelect =
        document.getElementById(
            "cr-tournament-revolt-bye-source"
        );


    function isPowerOfTwo(
        value
    ) {
        return (
            Number.isInteger(
                value
            )

            &&

            value >
                0

            &&

            (
                value

                &

                (
                    value -
                    1
                )
            ) ===
                0
        );
    }


    function getParticipantBrand(
        bracket,
        participantId
    ) {
        return normalize(
            getTournamentEntrantRecord(
                bracket,
                participantId
            )?.brand
        );
    }


    function getOpeningMatchLabel(
        bracket,
        matchNumber
    ) {
        const participants =
            getStoredTournamentParticipants(
                bracket
            );


        const firstIndex =
            (
                matchNumber -
                1
            )

            *

            2;


        const firstId =
            participants[
                firstIndex
            ];


        const secondId =
            participants[
                firstIndex +
                1
            ];


        return `${

            getTournamentEntrantDisplayName(
                bracket,
                firstId
            )

        } vs ${

            getTournamentEntrantDisplayName(
                bracket,
                secondId
            )

        }`;
    }


    function populateByeSelect(
        select,
        bracket,
        firstMatchNumber,
        lastMatchNumber
    ) {
        const oldValue =
            select.value;


        select.innerHTML =
            "";


        for (
            let matchNumber =
                firstMatchNumber;

            matchNumber <=
                lastMatchNumber;

            matchNumber +=
                1
        ) {
            const option =
                document.createElement(
                    "option"
                );


            option.value =
                `round-1-match-${matchNumber}`;


            option.textContent =

                `Opening Match ${matchNumber} winner — ${

                    getOpeningMatchLabel(
                        bracket,
                        matchNumber
                    )

                }`;


            select.appendChild(
                option
            );
        }


        if (
            [
                ...select.options
            ].some(
                option =>
                    option.value ===
                        oldValue
            )
        ) {
            select.value =
                oldValue;
        }
    }


    function refreshBracketMethodControls(
        bracket
    ) {
        const bracketSetup =

            bracket

                ? getTournamentBracketSetup(
                    bracket
                )

                : null;


        const fieldComplete =

            bracket

            &&

            getStoredTournamentParticipants(
                bracket
            ).length ===

                Number(
                    bracket.fieldSize || 0
                );


        const ready =
            Boolean(
                bracket

                &&

                bracket.fieldLocked

                &&

                fieldComplete

                &&

                !bracketSetup?.generated
            );


        methodPanel.hidden =
            !ready;


        if (!ready) {
            byeControls.hidden =
                true;

            return;
        }


        const fieldSize =
            Number(
                bracket.fieldSize || 0
            );


        const manualOption =
            bracketMethodSelect.querySelector(
                "option[value='manual-order']"
            );


        manualOption.disabled =

            !(
                fieldSize ===
                    28

                ||

                isPowerOfTwo(
                    fieldSize
                )
            );


        if (
            manualOption.disabled

            &&

            bracketMethodSelect.value ===
                "manual-order"
        ) {
            bracketMethodSelect.value =
                "random";
        }


        byeControls.hidden =
            fieldSize !==
                28;


        if (
            fieldSize ===
                28
        ) {
            populateByeSelect(
                ascensionByeSelect,
                bracket,
                1,
                7
            );


            populateByeSelect(
                revoltByeSelect,
                bracket,
                8,
                14
            );
        }
    }


    function buildPowerOfTwoBracket(
        participantIds
    ) {
        const fieldSize =
            participantIds.length;


        const roundNames =

            fieldSize ===
                16

                ? [
                    "Round of 16",
                    "Quarterfinals",
                    "Semifinals",
                    "Final"
                ]

                : fieldSize ===
                    8

                    ? [
                        "Quarterfinals",
                        "Semifinals",
                        "Final"
                    ]

                    : fieldSize ===
                        4

                        ? [
                            "Semifinals",
                            "Final"
                        ]

                        : [
                            "Final"
                        ];


        const rounds =
            [];


        const openingMatches =
            [];


        for (
            let index =
                0;

            index <
                fieldSize;

            index +=
                2
        ) {
            openingMatches.push(

                createTournamentBracketMatch(
                    1,
                    index / 2 + 1,
                    {
                        participantOneId:
                            participantIds[
                                index
                            ],

                        participantTwoId:
                            participantIds[
                                index + 1
                            ]
                    }
                )

            );
        }


        rounds.push({
            id:
                "round-1",

            order:
                1,

            name:
                roundNames[0],

            matches:
                openingMatches
        });


        let previousMatches =
            openingMatches;


        let roundNumber =
            2;


        while (
            previousMatches.length >
                1
        ) {
            const matches =
                [];


            for (
                let index =
                    0;

                index <
                    previousMatches.length;

                index +=
                    2
            ) {
                matches.push(

                    createTournamentBracketMatch(
                        roundNumber,
                        index / 2 + 1,
                        {
                            sourceOneMatchId:
                                previousMatches[
                                    index
                                ].id,

                            sourceTwoMatchId:
                                previousMatches[
                                    index + 1
                                ].id
                        }
                    )

                );
            }


            rounds.push({
                id:
                    `round-${roundNumber}`,

                order:
                    roundNumber,

                name:

                    roundNames[
                        roundNumber -
                        1
                    ]

                    ||

                    `Round ${roundNumber}`,

                matches
            });


            previousMatches =
                matches;


            roundNumber +=
                1;
        }


        return {
            rounds,

            winnerId:
                ""
        };
    }


    function createSourceByeMatch(
        matchNumber,
        sourceMatchId
    ) {
        return createTournamentBracketMatch(
            2,
            matchNumber,
            {
                sourceOneMatchId:
                    sourceMatchId,

                isBye:
                    true
            }
        );
    }


    function buildBrandQuarterfinals(
        sourceIds,
        byeSourceId,
        startingMatchNumber
    ) {
        const remaining =

            sourceIds.filter(
                sourceId =>
                    sourceId !==
                        byeSourceId
            );


        return [
            createSourceByeMatch(
                startingMatchNumber,
                byeSourceId
            ),

            createTournamentBracketMatch(
                2,
                startingMatchNumber + 1,
                {
                    sourceOneMatchId:
                        remaining[0],

                    sourceTwoMatchId:
                        remaining[1]
                }
            ),

            createTournamentBracketMatch(
                2,
                startingMatchNumber + 2,
                {
                    sourceOneMatchId:
                        remaining[2],

                    sourceTwoMatchId:
                        remaining[3]
                }
            ),

            createTournamentBracketMatch(
                2,
                startingMatchNumber + 3,
                {
                    sourceOneMatchId:
                        remaining[4],

                    sourceTwoMatchId:
                        remaining[5]
                }
            )
        ];
    }


    function buildDualBrand28Bracket(
        participantIds,
        ascensionByeSource,
        revoltByeSource
    ) {
        const openingMatches =
            [];


        for (
            let index =
                0;

            index <
                28;

            index +=
                2
        ) {
            openingMatches.push(

                createTournamentBracketMatch(
                    1,
                    index / 2 + 1,
                    {
                        participantOneId:
                            participantIds[
                                index
                            ],

                        participantTwoId:
                            participantIds[
                                index + 1
                            ]
                    }
                )

            );
        }


        const ascensionSources =

            openingMatches
                .slice(
                    0,
                    7
                )
                .map(
                    match =>
                        match.id
                );


        const revoltSources =

            openingMatches
                .slice(
                    7
                )
                .map(
                    match =>
                        match.id
                );


        const quarterfinals = [
            ...buildBrandQuarterfinals(
                ascensionSources,
                ascensionByeSource,
                1
            ),

            ...buildBrandQuarterfinals(
                revoltSources,
                revoltByeSource,
                5
            )
        ];


        const semifinals = [
            createTournamentBracketMatch(
                3,
                1,
                {
                    sourceOneMatchId:
                        quarterfinals[0].id,

                    sourceTwoMatchId:
                        quarterfinals[1].id
                }
            ),

            createTournamentBracketMatch(
                3,
                2,
                {
                    sourceOneMatchId:
                        quarterfinals[2].id,

                    sourceTwoMatchId:
                        quarterfinals[3].id
                }
            ),

            createTournamentBracketMatch(
                3,
                3,
                {
                    sourceOneMatchId:
                        quarterfinals[4].id,

                    sourceTwoMatchId:
                        quarterfinals[5].id
                }
            ),

            createTournamentBracketMatch(
                3,
                4,
                {
                    sourceOneMatchId:
                        quarterfinals[6].id,

                    sourceTwoMatchId:
                        quarterfinals[7].id
                }
            )
        ];


        const brandFinals = [
            createTournamentBracketMatch(
                4,
                1,
                {
                    sourceOneMatchId:
                        semifinals[0].id,

                    sourceTwoMatchId:
                        semifinals[1].id
                }
            ),

            createTournamentBracketMatch(
                4,
                2,
                {
                    sourceOneMatchId:
                        semifinals[2].id,

                    sourceTwoMatchId:
                        semifinals[3].id
                }
            )
        ];


        const finalMatch =
            createTournamentBracketMatch(
                5,
                1,
                {
                    sourceOneMatchId:
                        brandFinals[0].id,

                    sourceTwoMatchId:
                        brandFinals[1].id
                }
            );


        return {
            rounds: [
                {
                    id:
                        "round-1",

                    order:
                        1,

                    name:
                        "Opening Round",

                    matches:
                        openingMatches
                },

                {
                    id:
                        "round-2",

                    order:
                        2,

                    name:
                        "Brand Quarterfinals",

                    matches:
                        quarterfinals
                },

                {
                    id:
                        "round-3",

                    order:
                        3,

                    name:
                        "Brand Semifinals",

                    matches:
                        semifinals
                },

                {
                    id:
                        "round-4",

                    order:
                        4,

                    name:
                        "Brand Finals",

                    matches:
                        brandFinals
                },

                {
                    id:
                        "round-5",

                    order:
                        5,

                    name:
                        "Twin Talon Final",

                    matches: [
                        finalMatch
                    ]
                }
            ],

            winnerId:
                ""
        };
    }


    function validateDualBrandFieldOrder(
        bracket,
        participantIds
    ) {
        if (
            participantIds.length !==
                28
        ) {
            return "The 28-team bracket needs a complete locked field.";
        }


        const ascensionIds =
            participantIds.slice(
                0,
                14
            );


        const revoltIds =
            participantIds.slice(
                14
            );


        if (
            ascensionIds.some(
                participantId =>

                    getParticipantBrand(
                        bracket,
                        participantId
                    ) !==
                        "ascension"
            )
        ) {
            return "Locked slots 1–14 must contain the seven Ascension opening matchups.";
        }


        if (
            revoltIds.some(
                participantId =>

                    getParticipantBrand(
                        bracket,
                        participantId
                    ) !==
                        "revolt"
            )
        ) {
            return "Locked slots 15–28 must contain the seven Revolt opening matchups.";
        }


        return "";
    }


    function generateRandomDualBrand28(
        bracket
    ) {
        const participantIds =
            getStoredTournamentParticipants(
                bracket
            );


        const ascensionIds =

            shuffleTournamentBracketParticipants(

                participantIds.filter(
                    participantId =>

                        getParticipantBrand(
                            bracket,
                            participantId
                        ) ===
                            "ascension"
                )

            );


        const revoltIds =

            shuffleTournamentBracketParticipants(

                participantIds.filter(
                    participantId =>

                        getParticipantBrand(
                            bracket,
                            participantId
                        ) ===
                            "revolt"
                )

            );


        if (
            ascensionIds.length !==
                14

            ||

            revoltIds.length !==
                14
        ) {
            throw new Error(
                "The 28-team Twin Talon bracket requires exactly 14 Ascension teams and 14 Revolt teams."
            );
        }


        const ascensionByeMatch =
            Math.floor(
                Math.random() * 7
            ) + 1;


        const revoltByeMatch =
            Math.floor(
                Math.random() * 7
            ) + 8;


        return buildDualBrand28Bracket(
            [
                ...ascensionIds,
                ...revoltIds
            ],

            `round-1-match-${ascensionByeMatch}`,

            `round-1-match-${revoltByeMatch}`
        );
    }


    function generateUpgradedBracketPreview() {
        const bracket =
            getSelectedControlRoomBracket();


        if (!bracket) {
            return;
        }


        const bracketSetup =
            getTournamentBracketSetup(
                bracket
            );


        const participantIds =
            getStoredTournamentParticipants(
                bracket
            );


        const fieldSize =
            Number(
                bracket.fieldSize || 0
            );


        const fieldComplete =
            participantIds.length ===
                fieldSize;


        if (
            bracketSetup.generated

            ||

            !fieldComplete

            ||

            !bracket.fieldLocked
        ) {
            return;
        }


        try {
            const preserveFieldOrder =

                bracketMethodSelect.value ===
                    "manual-order";


            if (
                fieldSize ===
                    28
            ) {
                if (preserveFieldOrder) {
                    const orderError =
                        validateDualBrandFieldOrder(
                            bracket,
                            participantIds
                        );


                    if (orderError) {
                        throw new Error(
                            orderError
                        );
                    }


                    tournamentBracketSetupDraft =

                        buildDualBrand28Bracket(
                            [
                                ...participantIds
                            ],

                            ascensionByeSelect.value,

                            revoltByeSelect.value
                        );
                }

                else {
                    tournamentBracketSetupDraft =

                        generateRandomDualBrand28(
                            bracket
                        );
                }
            }

            else if (preserveFieldOrder) {
                if (
                    !isPowerOfTwo(
                        fieldSize
                    )
                ) {
                    throw new Error(
                        "Manual field-order setup currently requires a power-of-two field or the 28-team Twin Talon format."
                    );
                }


                tournamentBracketSetupDraft =

                    buildPowerOfTwoBracket(
                        [
                            ...participantIds
                        ]
                    );
            }

            else {
                tournamentBracketSetupDraft =

                    originalGenerateTournamentBracketPreviewData(
                        bracket
                    );
            }


            const validationError =
                validateTournamentBracketSetupDraft(
                    bracket
                );


            if (validationError) {
                throw new Error(
                    validationError
                );
            }


            renderTournamentBracketSetupOverview(
                bracket
            );
        }

        catch (error) {
            tournamentBracketSetupDraft =
                null;


            tournamentBracketSetupMessage.textContent =

                error.message

                ||

                "The bracket preview could not be generated.";


            tournamentBracketSetupMessage.className =
                "cr-save-message save-error";


            tournamentBracketSetupMessage.hidden =
                false;


            refreshBracketMethodControls(
                bracket
            );
        }
    }


    getTournamentBracketStructure = function (
        fieldSize
    ) {
        if (
            Number(
                fieldSize
            ) ===
                28
        ) {
            return {
                bracketSize:
                    28,

                totalRounds:
                    5,

                openingMatchCount:
                    14,

                byeCount:
                    2
            };
        }


        return originalGetTournamentBracketStructure(
            fieldSize
        );
    };


    getTournamentBracketRoundNames = function (
        fieldSize
    ) {
        if (
            Number(
                fieldSize
            ) ===
                28
        ) {
            return [
                "Opening Round",
                "Brand Quarterfinals",
                "Brand Semifinals",
                "Brand Finals",
                "Twin Talon Final"
            ];
        }


        if (
            Number(
                fieldSize
            ) ===
                8
        ) {
            return [
                "Quarterfinals",
                "Semifinals",
                "Final"
            ];
        }


        return Number(
            fieldSize
        ) ===
            16

            ? [
                "Round of 16",
                "Quarterfinals",
                "Semifinals",
                "Final"
            ]

            : [
                "Opening Round",
                "Quarterfinals",
                "Semifinals",
                "Final"
            ];
    };


    generateTournamentBracketPreviewData = function (
        bracket
    ) {
        if (
            Number(
                bracket?.fieldSize
            ) ===
                28
        ) {
            return generateRandomDualBrand28(
                bracket
            );
        }


        return originalGenerateTournamentBracketPreviewData(
            bracket
        );
    };


    validateTournamentBracketSetupDraft = function (
        bracket
    ) {
        if (
            Number(
                bracket?.fieldSize
            ) !==
                28
        ) {
            return originalValidateTournamentBracketSetupDraft(
                bracket
            );
        }


        if (!bracket.fieldLocked) {
            return "Lock the completed participant field before saving the bracket setup.";
        }


        const participantIds =
            getStoredTournamentParticipants(
                bracket
            );


        if (
            participantIds.length !==
                28
        ) {
            return "The 28-team participant field is not complete.";
        }


        const rounds =
            tournamentBracketSetupDraft?.rounds;


        const expectedCounts = [
            14,
            8,
            4,
            2,
            1
        ];


        if (
            !Array.isArray(
                rounds
            )

            ||

            rounds.length !==
                5

            ||

            rounds.some(
                (
                    round,
                    index
                ) =>

                    !Array.isArray(
                        round.matches
                    )

                    ||

                    round.matches.length !==
                        expectedCounts[
                            index
                        ]
            )
        ) {
            return "The 28-team bracket does not match the required dual-brand structure.";
        }


        const openingParticipantIds =

            rounds[0].matches.flatMap(
                match => [
                    match.participantOneId,
                    match.participantTwoId
                ]
            ).filter(
                Boolean
            );


        if (
            openingParticipantIds.length !==
                28

            ||

            new Set(
                openingParticipantIds
            ).size !==
                28
        ) {
            return "The opening round must contain every team exactly once.";
        }


        const storedSet =
            new Set(
                participantIds
            );


        if (
            openingParticipantIds.some(
                participantId =>
                    !storedSet.has(
                        participantId
                    )
            )
        ) {
            return "The bracket contains a team outside the locked field.";
        }


        const secondRoundByes =

            rounds[1].matches.filter(
                match =>
                    match.isBye
            );


        if (
            secondRoundByes.length !==
                2
        ) {
            return "The 28-team bracket requires one second-round bye path per brand.";
        }


        return "";
    };


    renderTournamentBracketSetupOverview = function (
        bracket
    ) {
        originalRenderTournamentBracketSetupOverview(
            bracket
        );


        refreshBracketMethodControls(
            bracket
        );


        if (
            bracket

            &&

            Number(
                bracket.fieldSize
            ) ===
                28

            &&

            bracket.fieldLocked

            &&

            !getTournamentBracketSetup(
                bracket
            ).generated

            &&

            !tournamentBracketSetupDraft
        ) {
            setTournamentManagerEmptyMessage(

                tournamentBracketSetupPreview,

                "This shared Twin Talon field will open with seven Ascension matches and seven Revolt matches. Each brand side then receives one second-round bye path before the survivors meet in the Twin Talon Final."

            );
        }
    };


    tournamentBracketPreviewButton.removeEventListener(
        "click",
        originalGenerateTournamentBracketPreview
    );


    generateTournamentBracketPreview =
        generateUpgradedBracketPreview;


    tournamentBracketPreviewButton.addEventListener(
        "click",
        generateTournamentBracketPreview
    );


    bracketMethodSelect.addEventListener(
        "change",
        () => {
            tournamentBracketSetupDraft =
                null;


            renderTournamentBracketSetupOverview(
                getSelectedControlRoomBracket()
            );
        }
    );


    ascensionByeSelect.addEventListener(
        "change",
        () => {
            tournamentBracketSetupDraft =
                null;
        }
    );


    revoltByeSelect.addEventListener(
        "change",
        () => {
            tournamentBracketSetupDraft =
                null;
        }
    );


    tournamentSelect.addEventListener(
        "change",
        () => {
            bracketMethodSelect.value =
                "random";


            window.setTimeout(
                () =>
                    refreshBracketMethodControls(
                        getSelectedControlRoomBracket()
                    ),
                0
            );
        }
    );


    tournamentBracketSelect.addEventListener(
        "change",
        () => {
            bracketMethodSelect.value =
                "random";


            window.setTimeout(
                () =>
                    refreshBracketMethodControls(
                        getSelectedControlRoomBracket()
                    ),
                0
            );
        }
    );


    // =================================
    // SOURCE-BASED BYE RESOLUTION
    // =================================

    window.OWLResolveTournamentByes = function (
        rounds
    ) {
        const orderedRounds =

            [
                ...rounds
            ].sort(
                (
                    roundA,
                    roundB
                ) =>

                    Number(
                        roundA.order || 0
                    )

                    -

                    Number(
                        roundB.order || 0
                    )
            );


        const matchMap =
            new Map();


        orderedRounds.forEach(
            round => {
                const matches =

                    Array.isArray(
                        round.matches
                    )

                        ? round.matches

                        : [];


                matches.forEach(
                    match =>
                        matchMap.set(
                            match.id,
                            match
                        )
                );
            }
        );


        let changed =
            true;


        let safety =
            0;


        while (
            changed

            &&

            safety <
                matchMap.size + 2
        ) {
            changed =
                false;

            safety +=
                1;


            orderedRounds.forEach(
                (
                    round,
                    roundIndex
                ) => {
                    if (
                        roundIndex ===
                            0
                    ) {
                        return;
                    }


                    const matches =

                        Array.isArray(
                            round.matches
                        )

                            ? round.matches

                            : [];


                    matches.forEach(
                        match => {
                            if (
                                match.sourceOneMatchId
                            ) {
                                const nextId =

                                    matchMap.get(
                                        match.sourceOneMatchId
                                    )?.winnerId

                                    ||

                                    "";


                                if (
                                    match.participantOneId !==
                                        nextId
                                ) {
                                    match.participantOneId =
                                        nextId;

                                    changed =
                                        true;
                                }
                            }


                            if (
                                match.sourceTwoMatchId
                            ) {
                                const nextId =

                                    matchMap.get(
                                        match.sourceTwoMatchId
                                    )?.winnerId

                                    ||

                                    "";


                                if (
                                    match.participantTwoId !==
                                        nextId
                                ) {
                                    match.participantTwoId =
                                        nextId;

                                    changed =
                                        true;
                                }
                            }


                            if (match.isBye) {
                                const byeWinnerId =

                                    match.participantOneId

                                    ||

                                    match.participantTwoId

                                    ||

                                    "";


                                if (
                                    byeWinnerId

                                    &&

                                    match.winnerId !==
                                        byeWinnerId
                                ) {
                                    match.winnerId =
                                        byeWinnerId;

                                    match.status =
                                        "bye";

                                    changed =
                                        true;
                                }
                            }
                        }
                    );
                }
            );
        }


        return orderedRounds;
    };


    window.addEventListener(
        "owl-control-room-data-loaded",
        () => {
            window.setTimeout(
                () => {
                    toggleTournamentCreatorMode();


                    refreshBracketMethodControls(
                        getSelectedControlRoomBracket()
                    );
                },
                0
            );
        }
    );
})();
