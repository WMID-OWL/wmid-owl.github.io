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


        if (
            saveButton
        ) {

            saveButton.disabled =
                !(
                    buildComplete
                    &&
                    editTotal ===
                        baseline
                );

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
            editTotal ===
            baseline
        ) {

            balanceMessage.textContent =
                `BALANCED — ${editTotal} / ${baseline} ✓`;

            return;

        }


        if (
            editTotal >
            baseline
        ) {

            balanceMessage.textContent =
                `OVER BASELINE — ${editTotal} / ${baseline} ⚠`;

            return;

        }


        balanceMessage.textContent =
            `UNDER BASELINE — ${editTotal} / ${baseline}`;

    }


    function renderSelectedBuild() {

        renderEnduranceProfile();

        renderPointAudit();

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
