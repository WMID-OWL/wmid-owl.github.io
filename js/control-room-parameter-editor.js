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


    function renderParameterEditor() {

        renderParameterWrestlerOptions();

        renderReferenceOptions();

        renderSpecialSkillReference();

        renderEnduranceProfile();

    }


        wrestlerSelect.addEventListener(
        "change",
        renderEnduranceProfile
    );


    window.addEventListener(
        "owl-control-room-data-loaded",
        renderParameterEditor
    );


    window.addEventListener(
        "owl-endurance-profiles-updated",
        renderEnduranceProfile
    );


    renderParameterEditor();

})();
