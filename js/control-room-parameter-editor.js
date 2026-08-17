(() => {

    const wrestlerSelect =
        document.getElementById(
            "cr-parameter-wrestler"
        );

    const status =
        document.getElementById(
            "cr-parameter-status"
        );


    if (
        !wrestlerSelect
        ||
        !status
    ) {

        return;

    }


    const referenceFields = {

        criticalAbility: {
            selectId:
                "cr-param-critical",
            pointsId:
                "cr-param-critical-points"
        },

        recovery: {
            selectId:
                "cr-param-recovery",
            pointsId:
                "cr-param-recovery-points"
        },

        recoveryBleeding: {
            selectId:
                "cr-param-recovery-bleeding",
            pointsId:
                "cr-param-recovery-bleeding-points"
        },

        breathing: {
            selectId:
                "cr-param-breathing",
            pointsId:
                "cr-param-breathing-points"
        },

        breathingBleeding: {
            selectId:
                "cr-param-breathing-bleeding",
            pointsId:
                "cr-param-breathing-bleeding-points"
        },

        spirit: {
            selectId:
                "cr-param-spirit",
            pointsId:
                "cr-param-spirit-points"
        },

        spiritBleeding: {
            selectId:
                "cr-param-spirit-bleeding",
            pointsId:
                "cr-param-spirit-bleeding-points"
        }

    };


    const movementFields = {

        movementSpeed: {
            selectId:
                "cr-param-movement-speed",
            pointsId:
                "cr-param-movement-speed-points"
        },

        ascentStyle: {
            selectId:
                "cr-param-ascent-style",
            pointsId:
                "cr-param-ascent-style-points"
        },

        upDownSpeed: {
            selectId:
                "cr-param-up-down-speed",
            pointsId:
                "cr-param-up-down-speed-points"
        }

    };


    const specialSkillSelect =
        document.getElementById(
            "cr-param-special-skill"
        );

    const specialSkillPoints =
        document.getElementById(
            "cr-param-special-skill-points"
        );

    const specialSkillReference =
        document.getElementById(
            "cr-param-special-skill-reference"
        );

        const specialSkillSynopsis =
        document.getElementById(
            "cr-param-special-skill-synopsis"
        );


    const enduranceFields = {

        Neck: {
            valueId:
                "cr-param-endurance-neck",
            pointsId:
                "cr-param-endurance-neck-points"
        },

        Arms: {
            valueId:
                "cr-param-endurance-arms",
            pointsId:
                "cr-param-endurance-arms-points"
        },

        Back: {
            valueId:
                "cr-param-endurance-back",
            pointsId:
                "cr-param-endurance-back-points"
        },

        Legs: {
            valueId:
                "cr-param-endurance-legs",
            pointsId:
                "cr-param-endurance-legs-points"
        }

    };


        const offenseParameterFields = [

        {
            key: "punch",
            id: "cr-param-offense-punch"
        },

        {
            key: "kick",
            id: "cr-param-offense-kick"
        },

        {
            key: "throw",
            id: "cr-param-offense-throw"
        },

        {
            key: "joint",
            id: "cr-param-offense-joint"
        },

        {
            key: "stretch",
            id: "cr-param-offense-stretch"
        },

        {
            key: "power",
            id: "cr-param-offense-power"
        },

        {
            key: "agility",
            id: "cr-param-offense-agility"
        },

        {
            key: "arm",
            id: "cr-param-offense-arm"
        },

        {
            key: "technical",
            id: "cr-param-offense-technical"
        },

        {
            key: "rough",
            id: "cr-param-offense-rough"
        },

        {
            key: "mmaOverall",
            id: "cr-param-offense-mma"
        },

        {
            key: "entertain",
            id: "cr-param-offense-entertain"
        }

    ];


    const defenseParameterFields = [

        {
            key: "punch",
            id: "cr-param-defense-punch"
        },

        {
            key: "kick",
            id: "cr-param-defense-kick"
        },

        {
            key: "throw",
            id: "cr-param-defense-throw"
        },

        {
            key: "joint",
            id: "cr-param-defense-joint"
        },

        {
            key: "stretch",
            id: "cr-param-defense-stretch"
        },

        {
            key: "aerial",
            id: "cr-param-defense-aerial"
        },

        {
            key: "impact",
            id: "cr-param-defense-impact"
        },

        {
            key: "lariat",
            id: "cr-param-defense-lariat"
        },

        {
            key: "technical",
            id: "cr-param-defense-technical"
        },

        {
            key: "rough",
            id: "cr-param-defense-rough"
        },

        {
            key: "mmaOverall",
            id: "cr-param-defense-mma"
        },

        {
            key: "entertain",
            id: "cr-param-defense-entertain"
        }

    ];


    const parameterTotalElement =
        document.getElementById(
            "cr-param-parameter-total"
        );

    const skillTotalElement =
        document.getElementById(
            "cr-param-skill-total"
        );

    const editTotalElement =
        document.getElementById(
            "cr-param-edit-total"
        );

    const currentTotalElement =
        document.getElementById(
            "cr-parameter-current-total"
        );

    const dnmtOffenseElement =
        document.getElementById(
            "cr-param-dnmt-offense"
        );

    const dnmtDefenseElement =
        document.getElementById(
            "cr-param-dnmt-defense"
        );

    const dnmtRatioElement =
        document.getElementById(
            "cr-param-dnmt-ratio"
        );

        const balanceMessage =
        document.getElementById(
            "cr-param-balance-message"
        );

            const saveButton =
        document.getElementById(
            "cr-param-save"
        );

    const saveMessage =
        document.getElementById(
            "cr-param-save-message"
        );


    const permanentBonusInput =
        document.getElementById(
            "cr-param-permanent-bonus"
        );

    const championBonusSelect =
        document.getElementById(
            "cr-param-champion-bonus"
        );

    const baseBuildElement =
        document.getElementById(
            "cr-param-base-build"
        );

    const authorizedBuildElement =
        document.getElementById(
            "cr-param-authorized-build"
        );

    const overBaselineConfirm =
        document.getElementById(
            "cr-param-over-baseline-confirm"
        );

    const overBaselineCopy =
        document.getElementById(
            "cr-param-over-baseline-copy"
        );

    const overBaselineInput =
        document.getElementById(
            "cr-param-over-baseline-input"
        );

    const overBaselineHelp =
        document.getElementById(
            "cr-param-over-baseline-help"
        );


    function getParameterReference() {

        if (
            typeof owlControlRoomData ===
                "undefined"
            ||
            !owlControlRoomData.parameterReference
        ) {

            return null;

        }

        return (
            owlControlRoomData.parameterReference
        );

    }


    function getParameterEditorWrestlers() {

        if (
            typeof owlControlRoomData ===
                "undefined"
            ||
            !Array.isArray(
                owlControlRoomData.wrestlers
            )
        ) {

            return [];

        }

        return [
            ...owlControlRoomData.wrestlers
        ]
            .filter(
                wrestler =>
                    wrestler
                    &&
                    wrestler.id
            )
            .sort(
                (
                    wrestlerA,
                    wrestlerB
                ) =>
                    String(
                        wrestlerA.name
                        ||
                        wrestlerA.id
                    )
                        .localeCompare(
                            String(
                                wrestlerB.name
                                ||
                                wrestlerB.id
                            )
                        )
            );

    }


    function renderParameterWrestlerOptions() {

        const currentValue =
            wrestlerSelect.value;

        const wrestlers =
            getParameterEditorWrestlers();


        wrestlerSelect.innerHTML =
            "";

        const placeholder =
            document.createElement(
                "option"
            );

        placeholder.value =
            "";

        placeholder.textContent =
            "Select Wrestler";

        wrestlerSelect.appendChild(
            placeholder
        );


        wrestlers.forEach(
            wrestler => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    wrestler.id;

                option.textContent =
                    wrestler.name
                    ||
                    wrestler.id;

                wrestlerSelect.appendChild(
                    option
                );

            }
        );


        if (
            currentValue
            &&
            wrestlers.some(
                wrestler =>
                    wrestler.id ===
                    currentValue
            )
        ) {

            wrestlerSelect.value =
                currentValue;

        }

    }


    function populateSelect(
        selectElement,
        options
    ) {

        if (
            !selectElement
            ||
            !Array.isArray(
                options
            )
        ) {

            return;

        }


        const currentValue =
            selectElement.value;


        selectElement.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );

        placeholder.value =
            "";

        placeholder.textContent =
            "—";

        selectElement.appendChild(
            placeholder
        );


        options.forEach(
            optionData => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    optionData.value;

                option.textContent =
                    optionData.value;

                option.dataset.points =
                    String(
                        optionData.points
                        ??
                        0
                    );

                selectElement.appendChild(
                    option
                );

            }
        );


        if (
            currentValue
            &&
            options.some(
                optionData =>
                    optionData.value ===
                    currentValue
            )
        ) {

            selectElement.value =
                currentValue;

        }

    }


    function updatePointReadout(
        selectElement,
        pointsElement
    ) {

        if (
            !selectElement
            ||
            !pointsElement
        ) {

            return;

        }


        const selectedOption =
            selectElement.options[
                selectElement.selectedIndex
            ];


        if (
            !selectedOption
            ||
            !selectElement.value
        ) {

            pointsElement.textContent =
                "— pts";

            return;

        }


        const points =
            Number(
                selectedOption.dataset.points
                ||
                0
            );


        pointsElement.textContent =
            `${points} pts`;

    }


    function wirePointField(
        field
    ) {

        const selectElement =
            document.getElementById(
                field.selectId
            );

        const pointsElement =
            document.getElementById(
                field.pointsId
            );


        if (
            !selectElement
            ||
            !pointsElement
        ) {

            return;

        }


        selectElement.addEventListener(
            "change",
            () => {

                updatePointReadout(
                    selectElement,
                    pointsElement
                );

            }
        );

    }


    function renderReferenceOptions() {

        const reference =
            getParameterReference();


        if (!reference) {

            status.textContent =
                "REFERENCE MISSING";

            return;

        }


        Object.entries(
            referenceFields
        )
            .forEach(
                ([
                    referenceKey,
                    field
                ]) => {

                    const selectElement =
                        document.getElementById(
                            field.selectId
                        );

                    const setting =
                        reference.skillSettings
                        ?.[
                            referenceKey
                        ];


                    populateSelect(
                        selectElement,
                        setting?.options
                    );


                    updatePointReadout(
                        selectElement,
                        document.getElementById(
                            field.pointsId
                        )
                    );

                }
            );


        Object.entries(
            movementFields
        )
            .forEach(
                ([
                    referenceKey,
                    field
                ]) => {

                    const selectElement =
                        document.getElementById(
                            field.selectId
                        );

                    const setting =
                        reference.movementSettings
                        ?.[
                            referenceKey
                        ];


                    populateSelect(
                        selectElement,
                        setting?.options
                    );


                    updatePointReadout(
                        selectElement,
                        document.getElementById(
                            field.pointsId
                        )
                    );

                }
            );


        populateSelect(
            specialSkillSelect,
            reference.specialSkills
        );


        updatePointReadout(
            specialSkillSelect,
            specialSkillPoints
        );


        status.textContent =
            "READY";

    }


    function renderSpecialSkillReference() {

        const reference =
            getParameterReference();


        if (
            !reference
            ||
            !specialSkillSelect
            ||
            !specialSkillReference
            ||
            !specialSkillSynopsis
        ) {

            return;

        }


        const selectedSkill =
            reference.specialSkills
                ?.find(
                    skill =>
                        skill.value ===
                        specialSkillSelect.value
                );


        updatePointReadout(
            specialSkillSelect,
            specialSkillPoints
        );


        if (
            !selectedSkill
            ||
            !specialSkillSelect.value
        ) {

            specialSkillReference.hidden =
                true;

            specialSkillSynopsis.textContent =
                "—";

            return;

        }


        specialSkillSynopsis.textContent =
            selectedSkill.synopsis
            ||
            "No synopsis available.";

        specialSkillReference.hidden =
            false;

    }


    Object.values(
        referenceFields
    )
        .forEach(
            wirePointField
        );


    Object.values(
        movementFields
    )
        .forEach(
            wirePointField
        );


    if (
        specialSkillSelect
    ) {

        specialSkillSelect.addEventListener(
            "change",
            renderSpecialSkillReference
        );

    }


        function getSelectedEnduranceProfile() {

        if (
            !wrestlerSelect.value
            ||
            typeof owlControlRoomData ===
                "undefined"
        ) {

            return null;

        }


        const profiles =
            owlControlRoomData
                .enduranceProfiles
                ?.profiles;


        if (
            !Array.isArray(
                profiles
            )
        ) {

            return null;

        }


        return (
            profiles.find(
                profile =>
                    profile?.wrestlerId ===
                    wrestlerSelect.value
            )
            ||
            null
        );

    }


    function getEndurancePoints(
        state
    ) {

        const reference =
            getParameterReference();

        const option =
            reference
                ?.enduranceSettings
                ?.options
                ?.find(
                    candidate =>
                        candidate.value ===
                        state
                );


        return Number(
            option?.points
            ??
            0
        );

    }


    function renderEnduranceProfile() {

        const hasWrestler =
            Boolean(
                wrestlerSelect.value
            );


        const profile =
            getSelectedEnduranceProfile();


        const savedAreas =
            profile?.areas
            ||
            {};


        Object.entries(
            enduranceFields
        )
            .forEach(
                ([
                    area,
                    field
                ]) => {

                    const valueElement =
                        document.getElementById(
                            field.valueId
                        );

                    const pointsElement =
                        document.getElementById(
                            field.pointsId
                        );


                    if (
                        !valueElement
                        ||
                        !pointsElement
                    ) {

                        return;

                    }


                    if (
                        !hasWrestler
                    ) {

                        valueElement.textContent =
                            "—";

                        pointsElement.textContent =
                            "— pts";

                        return;

                    }


                    const storedState =
                        savedAreas[
                            area
                        ];


                    const state =
                        [
                            "Low",
                            "Normal",
                            "High"
                        ]
                            .includes(
                                storedState
                            )
                            ? storedState
                            : "Normal";


                    valueElement.textContent =
                        state;

                    pointsElement.textContent =
                        `${getEndurancePoints(
                            state
                        )} pts`;

                }
            );

    }


        function getParameterRatingCost(
        rating
    ) {

        const reference =
            getParameterReference();

        const costs =
            reference
                ?.parameterRatingCosts;


        if (
            Array.isArray(
                costs
            )
        ) {

            const match =
                costs.find(
                    item =>
                        Number(
                            item.rating
                            ??
                            item.value
                        )
                        ===
                        rating
                );


            if (match) {

                return Number(
                    match.points
                    ??
                    0
                );

            }

        }


        if (
            costs
            &&
            typeof costs ===
                "object"
            &&
            costs[
                String(
                    rating
                )
            ]
            !== undefined
        ) {

            return Number(
                costs[
                    String(
                        rating
                    )
                ]
            );

        }


        return Math.max(
            0,
            rating - 1
        );

    }


    function getParameterFieldValue(
        field
    ) {

        const input =
            document.getElementById(
                field.id
            );


        if (!input) {

            return null;

        }


        const value =
            Number(
                input.value
            );


        if (
            !Number.isInteger(
                value
            )
            ||
            value < 1
            ||
            value > 10
        ) {

            return null;

        }


        return value;

    }


    function getSelectedOptionPoints(
        selectElement
    ) {

        if (
            !selectElement
            ||
            !selectElement.value
        ) {

            return 0;

        }


        const option =
            selectElement.options[
                selectElement.selectedIndex
            ];


        return Number(
            option?.dataset.points
            ??
            0
        );

    }


    function parameterFieldsComplete() {

        return [
            ...offenseParameterFields,
            ...defenseParameterFields
        ]
            .every(
                field =>
                    getParameterFieldValue(
                        field
                    )
                    !==
                    null
            );

    }


    function selectionFieldsComplete() {

        const coreComplete =
            Object
                .values(
                    referenceFields
                )
                .every(
                    field =>
                        Boolean(
                            document
                                .getElementById(
                                    field.selectId
                                )
                                ?.value
                        )
                );


        const movementComplete =
            Object
                .values(
                    movementFields
                )
                .every(
                    field =>
                        Boolean(
                            document
                                .getElementById(
                                    field.selectId
                                )
                                ?.value
                        )
                );


        return (
            coreComplete
            &&
            movementComplete
            &&
            Boolean(
                specialSkillSelect
                    ?.value
            )
        );

    }


    function calculateParameterPoints() {

        return [
            ...offenseParameterFields,
            ...defenseParameterFields
        ]
            .reduce(
                (
                    total,
                    field
                ) => {

                    const rating =
                        getParameterFieldValue(
                            field
                        );


                    if (
                        rating ===
                        null
                    ) {

                        return total;

                    }


                    return (
                        total
                        +
                        getParameterRatingCost(
                            rating
                        )
                    );

                },
                0
            );

    }


    function calculateSkillPoints() {

        let total =
            0;


        Object.values(
            referenceFields
        )
            .forEach(
                field => {

                    total +=
                        getSelectedOptionPoints(
                            document.getElementById(
                                field.selectId
                            )
                        );

                }
            );


        Object.values(
            movementFields
        )
            .forEach(
                field => {

                    total +=
                        getSelectedOptionPoints(
                            document.getElementById(
                                field.selectId
                            )
                        );

                }
            );


        total +=
            getSelectedOptionPoints(
                specialSkillSelect
            );


        if (
            wrestlerSelect.value
        ) {

            const profile =
                getSelectedEnduranceProfile();

            const areas =
                profile?.areas
                ||
                {};


            Object.keys(
                enduranceFields
            )
                .forEach(
                    area => {

                        const storedState =
                            areas[
                                area
                            ];


                        const state =
                            [
                                "Low",
                                "Normal",
                                "High"
                            ]
                                .includes(
                                    storedState
                                )
                                ? storedState
                                : "Normal";


                        total +=
                            getEndurancePoints(
                                state
                            );

                    }
                );

        }


        return total;

    }


    function calculateDnmtSum(
        fields
    ) {

        return fields
            .filter(
                field =>
                    field.key !==
                        "mmaOverall"
                    &&
                    field.key !==
                        "entertain"
            )
            .reduce(
                (
                    total,
                    field
                ) => {

                    const rating =
                        getParameterFieldValue(
                            field
                        );


                    return (
                        total
                        +
                        (
                            rating
                            ??
                            0
                        )
                    );

                },
                0
            );

    }


    function renderPointAudit() {

        const hasWrestler =
            Boolean(
                wrestlerSelect.value
            );


        if (!hasWrestler) {

            parameterTotalElement.textContent =
                "—";

            skillTotalElement.textContent =
                "—";

            editTotalElement.textContent =
                "—";

            currentTotalElement.textContent =
                "—";

            dnmtOffenseElement.textContent =
                "—";

            dnmtDefenseElement.textContent =
                "—";

            dnmtRatioElement.textContent =
                "—";

            balanceMessage.hidden =
                true;

            return;

        }


        const parameterPoints =
            calculateParameterPoints();

        const skillPoints =
            calculateSkillPoints();

        const editTotal =
            parameterPoints
            +
            skillPoints;

        const baseline =
            Number(
                getParameterReference()
                    ?.owlRules
                    ?.baselinePoints
                ??
                160
            );


        parameterTotalElement.textContent =
            parameterPoints;

        skillTotalElement.textContent =
            skillPoints;

        editTotalElement.textContent =
            editTotal;

        currentTotalElement.textContent =
            `${editTotal} / ${baseline}`;


        if (
            parameterFieldsComplete()
        ) {

            const offense =
                calculateDnmtSum(
                    offenseParameterFields
                );

            const defense =
                calculateDnmtSum(
                    defenseParameterFields
                );


            dnmtOffenseElement.textContent =
                offense;

            dnmtDefenseElement.textContent =
                defense;


            dnmtRatioElement.textContent =
                offense > 0
                    ? `${(
                        (
                            defense
                            /
                            offense
                        )
                        *
                        100
                    ).toFixed(
                        1
                    )}%`
                    : "—";

        }

        else {

            dnmtOffenseElement.textContent =
                "—";

            dnmtDefenseElement.textContent =
                "—";

            dnmtRatioElement.textContent =
                "—";

        }


                        const buildComplete =
            parameterFieldsComplete()
            &&
            selectionFieldsComplete();


        const permanentBonus =
            Math.max(
                0,
                Number.parseInt(
                    permanentBonusInput
                        ?.value
                    ||
                    "0",
                    10
                )
                ||
                0
            );


        const championBonus =
            Number(
                championBonusSelect
                    ?.value
                ||
                0
            );


        const authorizedBuild =
            baseline
            +
            permanentBonus
            +
            championBonus;


        if (
            baseBuildElement
        ) {

            baseBuildElement.textContent =
                baseline;

        }


        if (
            authorizedBuildElement
        ) {

            authorizedBuildElement.textContent =
                authorizedBuild;

        }


        const confirmationPhrase =
            `SAVE ${authorizedBuild}`;


        const requiresAuthorization =
            authorizedBuild >
            baseline;


        const authorizationMatches =
            !requiresAuthorization
            ||
            (
                overBaselineInput
                    ?.value
                    ?.trim()
                    ?.toUpperCase()
                ===
                confirmationPhrase
            );


        if (
            overBaselineConfirm
        ) {

            overBaselineConfirm.hidden =
                !requiresAuthorization;

        }


        if (
            requiresAuthorization
        ) {

            if (
                overBaselineCopy
            ) {

                overBaselineCopy.textContent =
                    `This wrestler is authorized for ${authorizedBuild} points: ${baseline} base + ${permanentBonus} permanent + ${championBonus} champion bonus.`;

            }


            if (
                overBaselineHelp
            ) {

                overBaselineHelp.textContent =
                    `Type ${confirmationPhrase} exactly to authorize this over-baseline save.`;

            }

        }

        else {

            if (
                overBaselineInput
            ) {

                overBaselineInput.value =
                    "";

            }

        }


        const validSave =
            buildComplete
            &&
            editTotal >=
                baseline
            &&
            editTotal ===
                authorizedBuild
            &&
            authorizationMatches;


        if (
            saveButton
        ) {

            saveButton.disabled =
                !validSave;

        }


        balanceMessage.hidden =
            false;


        if (
            !buildComplete
        ) {

            const parametersComplete =
                parameterFieldsComplete();

            const selectionsComplete =
                selectionFieldsComplete();


            if (
                !parametersComplete
                &&
                !selectionsComplete
            ) {

                balanceMessage.textContent =
                    "BUILD INCOMPLETE — parameter ratings and one or more Skill / Movement selections are still missing.";

            }

            else if (
                !parametersComplete
            ) {

                balanceMessage.textContent =
                    "BUILD INCOMPLETE — one or more parameter ratings are blank or outside 1–10.";

            }

            else {

                balanceMessage.textContent =
                    "BUILD INCOMPLETE — all parameter ratings are entered, but one or more Skill / Movement selections are still blank.";

            }


            return;

        }


        if (
            editTotal <
            baseline
        ) {

            balanceMessage.textContent =
                `UNDER BASELINE — ${editTotal} / ${baseline}`;

            return;

        }


        if (
            editTotal <
            authorizedBuild
        ) {

            balanceMessage.textContent =
                `BELOW AUTHORIZED BUILD — ${editTotal} / ${authorizedBuild}`;

            return;

        }


        if (
            editTotal >
            authorizedBuild
        ) {

            balanceMessage.textContent =
                `EXCEEDS AUTHORIZED BUILD — ${editTotal} / ${authorizedBuild} ⚠`;

            return;

        }


        if (
            authorizedBuild ===
            baseline
        ) {

            balanceMessage.textContent =
                `BALANCED — ${editTotal} / ${baseline} ✓`;

            return;

        }


        if (
            !authorizationMatches
        ) {

            balanceMessage.textContent =
                `AUTHORIZED BONUS BUILD — ${editTotal} / ${authorizedBuild}. Confirmation required before saving.`;

            return;

        }


        balanceMessage.textContent =
            `AUTHORIZED BONUS BUILD — ${editTotal} / ${authorizedBuild} ✓`;

    }


    function renderSelectedBuild() {

        renderEnduranceProfile();

        renderPointAudit();

    }


        function getParameterProfileDatabase() {

        const database =
            typeof owlControlRoomData !==
                "undefined"
                ? owlControlRoomData
                    .parameterProfiles
                : null;


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
                version: 1,
                profiles: []
            };

        }


        return {
            ...database,

            version:
                Number(
                    database.version
                    ||
                    1
                ),

            profiles:
                Array.isArray(
                    database.profiles
                )
                    ? database.profiles
                    : []
        };

    }


    function getSavedParameterProfile(
        wrestlerId
    ) {

        return (
            getParameterProfileDatabase()
                .profiles
                .find(
                    profile =>
                        profile
                            ?.wrestlerId ===
                        wrestlerId
                )
            ||
            null
        );

    }


        function selectedWrestler() {

        const wrestlers =
            (
                typeof owlControlRoomData !==
                    "undefined"
                &&
                Array.isArray(
                    owlControlRoomData.wrestlers
                )
            )
                ? owlControlRoomData.wrestlers
                : [];


        return (
            wrestlers.find(
                wrestler =>
                    wrestler.id ===
                    wrestlerSelect.value
            )
            ||
            null
        );

    }


    function collectParameterValues(
        fields
    ) {

        const result =
            {};


        fields.forEach(
            field => {

                result[
                    field.key
                ] =
                    getParameterFieldValue(
                        field
                    );

            }
        );


        return result;

    }


    function collectSelectValues(
        fields
    ) {

        const result =
            {};


        Object.entries(
            fields
        )
            .forEach(
                ([
                    key,
                    field
                ]) => {

                    result[
                        key
                    ] =
                        document
                            .getElementById(
                                field.selectId
                            )
                            ?.value
                        ||
                        "";

                }
            );


        return result;

    }


    function currentPermanentBonus() {

        return Math.max(
            0,
            Number.parseInt(
                permanentBonusInput
                    ?.value
                ||
                "0",
                10
            )
            ||
            0
        );

    }


    function currentChampionBonus() {

        return Number(
            championBonusSelect
                ?.value
            ||
            0
        );

    }


    function currentAuthorizedBuild() {

        const baseline =
            Number(
                getParameterReference()
                    ?.owlRules
                    ?.baselinePoints
                ??
                160
            );


        return (
            baseline
            +
            currentPermanentBonus()
            +
            currentChampionBonus()
        );

    }


    function currentEditTotal() {

        return (
            calculateParameterPoints()
            +
            calculateSkillPoints()
        );

    }


    function saveAuthorizationIsValid() {

        if (
            !wrestlerSelect.value
            ||
            !parameterFieldsComplete()
            ||
            !selectionFieldsComplete()
        ) {

            return false;

        }


        const baseline =
            Number(
                getParameterReference()
                    ?.owlRules
                    ?.baselinePoints
                ??
                160
            );

        const editTotal =
            currentEditTotal();

        const authorizedBuild =
            currentAuthorizedBuild();


        if (
            editTotal <
            baseline
            ||
            editTotal !==
            authorizedBuild
        ) {

            return false;

        }


        if (
            authorizedBuild >
            baseline
        ) {

            return (
                overBaselineInput
                    ?.value
                    ?.trim()
                    ?.toUpperCase()
                ===
                `SAVE ${authorizedBuild}`
            );

        }


        return true;

    }


    async function writeParameterProfileDatabase(
        database
    ) {

        if (
            typeof owlRepositoryHandle ===
                "undefined"
            ||
            !owlRepositoryHandle
        ) {

            throw new Error(
                "OWL repository is not connected."
            );

        }


        const permissionOptions = {
            mode:
                "readwrite"
        };


        let permission =
            await owlRepositoryHandle
                .queryPermission(
                    permissionOptions
                );


        if (
            permission !==
            "granted"
        ) {

            permission =
                await owlRepositoryHandle
                    .requestPermission(
                        permissionOptions
                    );

        }


        if (
            permission !==
            "granted"
        ) {

            throw new Error(
                "Repository write permission was not granted."
            );

        }


        const dataDirectory =
            await owlRepositoryHandle
                .getDirectoryHandle(
                    "data"
                );


        const fileHandle =
            await dataDirectory
                .getFileHandle(
                    "owl-parameter-profiles.json"
                );


        const writable =
            await fileHandle
                .createWritable();


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

                // Nothing else required.

            }


            throw error;

        }

    }


    async function saveParameterProfile() {

        if (
            !saveAuthorizationIsValid()
        ) {

            renderPointAudit();

            return;

        }


        const wrestler =
            selectedWrestler();


        if (!wrestler) {

            return;

        }


        const database =
            getParameterProfileDatabase();

        const existing =
            getSavedParameterProfile(
                wrestler.id
            );

        const baseline =
            Number(
                getParameterReference()
                    ?.owlRules
                    ?.baselinePoints
                ??
                160
            );

        const permanentBonus =
            currentPermanentBonus();

        const championBonus =
            currentChampionBonus();

        const authorizedBuild =
            currentAuthorizedBuild();

        const editTotal =
            currentEditTotal();


        const approved =
            window.confirm(
                `${existing ? "Update" : "Create"} ${wrestler.name}'s OWL Simulation Profile?\n\n`
                +
                `Edit Total: ${editTotal}\n`
                +
                `Base Build: ${baseline}\n`
                +
                `Permanent Bonus: +${permanentBonus}\n`
                +
                `Champion Bonus: +${championBonus}\n`
                +
                `Authorized Build: ${authorizedBuild}\n\n`
                +
                "Confirm these values match the wrestler's current Fire Pro OWL build."
            );


        if (!approved) {

            return;

        }


        saveButton.disabled =
            true;

        status.textContent =
            "SAVING...";


        if (
            saveMessage
        ) {

            saveMessage.hidden =
                true;

        }


        try {

            const now =
                new Date()
                    .toISOString();


            const profile = {

                ...existing,

                wrestlerId:
                    wrestler.id,

                wrestlerName:
                    wrestler.name,

                offense:
                    collectParameterValues(
                        offenseParameterFields
                    ),

                defense:
                    collectParameterValues(
                        defenseParameterFields
                    ),

                skills: {
                    ...collectSelectValues(
                        referenceFields
                    ),

                    specialSkill:
                        specialSkillSelect
                            ?.value
                        ||
                        ""
                },

                movement:
                    collectSelectValues(
                        movementFields
                    ),

                bonuses: {
                    permanent:
                        permanentBonus,

                    champion:
                        championBonus
                },

                createdAt:
                    existing?.createdAt
                    ||
                    now,

                updatedAt:
                    now
            };


            const updatedDatabase = {

                ...database,

                version:
                    Number(
                        database.version
                        ||
                        1
                    ),

                profiles: [

                    profile,

                    ...database.profiles
                        .filter(
                            candidate =>
                                candidate
                                    ?.wrestlerId !==
                                wrestler.id
                        )

                ]
            };


            await writeParameterProfileDatabase(
                updatedDatabase
            );


            owlControlRoomData
                .parameterProfiles =
                    updatedDatabase;


            if (
                typeof loadRepositoryData ===
                    "function"
            ) {

                await loadRepositoryData(
                    owlRepositoryHandle
                );

            }


            status.textContent =
                "SAVED";


            if (
                saveMessage
            ) {

                saveMessage.textContent =
                    `${wrestler.name}'s OWL Simulation Profile was saved to data/owl-parameter-profiles.json.`;

                saveMessage.hidden =
                    false;

            }


            window.dispatchEvent(
                new CustomEvent(
                    "owl-parameter-profiles-updated",
                    {
                        detail: {
                            wrestlerId:
                                wrestler.id
                        }
                    }
                )
            );


            renderPointAudit();

        }

        catch (
            error
        ) {

            console.error(
                "Could not save OWL Simulation Profile:",
                error
            );


            status.textContent =
                "SAVE FAILED";


            if (
                saveMessage
            ) {

                saveMessage.textContent =
                    error.message
                    ||
                    "The OWL Simulation Profile could not be saved.";

                saveMessage.hidden =
                    false;

            }


            renderPointAudit();

        }

    }


    function renderParameterEditor() {

        renderParameterWrestlerOptions();

        renderReferenceOptions();

        renderSpecialSkillReference();

        renderSelectedBuild();

    }


            wrestlerSelect.addEventListener(
        "change",
        renderSelectedBuild
    );


    [
        ...offenseParameterFields,
        ...defenseParameterFields
    ]
        .forEach(
            field => {

                const input =
                    document.getElementById(
                        field.id
                    );


                                if (input) {

                    input.type =
                        "text";

                    input.inputMode =
                        "numeric";

                    input.maxLength =
                        2;

                    input.setAttribute(
                        "pattern",
                        "[0-9]*"
                    );


                    input.addEventListener(
                        "input",
                        renderPointAudit
                    );

                    input.addEventListener(
                        "change",
                        renderPointAudit
                    );

                }
            }
        );


    Object.values(
        referenceFields
    )
        .forEach(
            field => {

                document
                    .getElementById(
                        field.selectId
                    )
                    ?.addEventListener(
                        "change",
                        renderPointAudit
                    );

            }
        );


    Object.values(
        movementFields
    )
        .forEach(
            field => {

                document
                    .getElementById(
                        field.selectId
                    )
                    ?.addEventListener(
                        "change",
                        renderPointAudit
                    );

            }
        );


        specialSkillSelect
        ?.addEventListener(
            "change",
            renderPointAudit
        );


    permanentBonusInput
        ?.addEventListener(
            "input",
            renderPointAudit
        );


    championBonusSelect
        ?.addEventListener(
            "change",
            renderPointAudit
        );


        overBaselineInput
        ?.addEventListener(
            "input",
            renderPointAudit
        );


    saveButton
        ?.addEventListener(
            "click",
            saveParameterProfile
        );


    window.addEventListener(
        "owl-control-room-data-loaded",
        renderParameterEditor
    );


    window.addEventListener(
        "owl-endurance-profiles-updated",
        renderSelectedBuild
    );


    renderParameterEditor();

})();
