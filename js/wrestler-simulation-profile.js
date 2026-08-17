(() => {

    "use strict";


    const section =
        document.getElementById(
            "owl-simulation-profile-section"
        );

    const statusElement =
        document.getElementById(
            "owl-simulation-profile-status"
        );


    if (
        !section
        ||
        !statusElement
    ) {

        return;

    }


        function defaultEnduranceAreas() {

        return {
            Neck: "Normal",
            Arms: "Normal",
            Back: "Normal",
            Legs: "Normal"
        };

    }


    function findOption(
        options,
        value
    ) {

        if (
            !Array.isArray(options)
        ) {

            return null;

        }


        return (
            options.find(
                option =>
                    option?.value ===
                    value
            )
            ||
            null
        );

    }


    function makeBuildItem(
        label,
        value,
        points
    ) {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "owl-sim-build-item";


        const labelElement =
            document.createElement(
                "span"
            );

        labelElement.textContent =
            label;


        const valueElement =
            document.createElement(
                "strong"
            );

        valueElement.textContent =
            value || "—";


        const pointsElement =
            document.createElement(
                "small"
            );

        pointsElement.textContent =
            `${Number(points ?? 0)} pts`;


        item.append(
            labelElement,
            valueElement,
            pointsElement
        );


        return item;

    }


    function renderSimulationSkills(
        profile,
        reference,
        enduranceAreas
    ) {

        statusElement.textContent =
            "";


        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "owl-sim-build";


        // =============================
        // SKILLS
        // =============================

        const skillsSection =
            document.createElement(
                "section"
            );

        skillsSection.className =
            "owl-sim-build-group";


        const skillsHeading =
            document.createElement(
                "h3"
            );

        skillsHeading.textContent =
            "Skills";


        const skillsGrid =
            document.createElement(
                "div"
            );

        skillsGrid.className =
            "owl-sim-build-grid";


        const skillDefinitions = [

            {
                label:
                    "CRITICAL! Ability",

                key:
                    "criticalAbility",

                options:
                    reference
                        ?.skillSettings
                        ?.criticalAbility
                        ?.options
            },

            {
                label:
                    "Recovery",

                key:
                    "recovery",

                options:
                    reference
                        ?.skillSettings
                        ?.recovery
                        ?.options
            },

            {
                label:
                    "Recovery (When Bleeding)",

                key:
                    "recoveryBleeding",

                options:
                    reference
                        ?.skillSettings
                        ?.recoveryBleeding
                        ?.options
            },

            {
                label:
                    "Breathing",

                key:
                    "breathing",

                options:
                    reference
                        ?.skillSettings
                        ?.breathing
                        ?.options
            },

            {
                label:
                    "Breathing (When Bleeding)",

                key:
                    "breathingBleeding",

                options:
                    reference
                        ?.skillSettings
                        ?.breathingBleeding
                        ?.options
            },

            {
                label:
                    "Spirit",

                key:
                    "spirit",

                options:
                    reference
                        ?.skillSettings
                        ?.spirit
                        ?.options
            },

            {
                label:
                    "Spirit (When Bleeding)",

                key:
                    "spiritBleeding",

                options:
                    reference
                        ?.skillSettings
                        ?.spiritBleeding
                        ?.options
            }

        ];


        skillDefinitions.forEach(
            definition => {

                const value =
                    profile
                        ?.skills
                        ?.[definition.key]
                    ||
                    "";

                const option =
                    findOption(
                        definition.options,
                        value
                    );


                skillsGrid.appendChild(
                    makeBuildItem(
                        definition.label,
                        value,
                        option?.points
                    )
                );

            }
        );


        const specialSkillValue =
            profile
                ?.skills
                ?.specialSkill
            ||
            "None";

        const specialSkill =
            Array.isArray(
                reference?.specialSkills
            )
                ? reference.specialSkills.find(
                    skill =>
                        skill?.value ===
                        specialSkillValue
                )
                : null;


        skillsGrid.appendChild(
            makeBuildItem(
                "Special Skill",
                specialSkillValue,
                specialSkill?.points
            )
        );


        skillsSection.append(
            skillsHeading,
            skillsGrid
        );


        if (
            specialSkill?.synopsis
            &&
            specialSkillValue !==
                "None"
        ) {

            const skillReference =
                document.createElement(
                    "div"
                );

            skillReference.className =
                "owl-sim-special-skill-reference";


            const referenceLabel =
                document.createElement(
                    "span"
                );

            referenceLabel.textContent =
                `${specialSkillValue} — What It Does`;


            const synopsis =
                document.createElement(
                    "p"
                );

            synopsis.textContent =
                specialSkill.synopsis;


            skillReference.append(
                referenceLabel,
                synopsis
            );


            skillsSection.appendChild(
                skillReference
            );

        }


        // =============================
        // BODY ENDURANCE
        // =============================

        const enduranceSection =
            document.createElement(
                "section"
            );

        enduranceSection.className =
            "owl-sim-build-group";


        const enduranceHeading =
            document.createElement(
                "h3"
            );

        enduranceHeading.textContent =
            "Body Endurance";


        const enduranceGrid =
            document.createElement(
                "div"
            );

        enduranceGrid.className =
            "owl-sim-build-grid";


        const enduranceOptions =
            reference
                ?.enduranceSettings
                ?.options;


        [
            {
                key: "Neck",
                label: "Neck Endurance"
            },

            {
                key: "Arms",
                label: "Arm Endurance"
            },

            {
                key: "Back",
                label: "Back Endurance"
            },

            {
                key: "Legs",
                label: "Leg Endurance"
            }
        ]
            .forEach(
                area => {

                    const value =
                        enduranceAreas[
                            area.key
                        ]
                        ||
                        "Normal";

                    const option =
                        findOption(
                            enduranceOptions,
                            value
                        );


                    enduranceGrid.appendChild(
                        makeBuildItem(
                            area.label,
                            value,
                            option?.points
                        )
                    );

                }
            );


        enduranceSection.append(
            enduranceHeading,
            enduranceGrid
        );


        // =============================
        // MOVEMENT
        // =============================

        const movementSection =
            document.createElement(
                "section"
            );

        movementSection.className =
            "owl-sim-build-group";


        const movementHeading =
            document.createElement(
                "h3"
            );

        movementHeading.textContent =
            "Movement";


        const movementGrid =
            document.createElement(
                "div"
            );

        movementGrid.className =
            "owl-sim-build-grid";


        const movementDefinitions = [

            {
                label:
                    "Movement Speed",

                key:
                    "movementSpeed",

                options:
                    reference
                        ?.movementSettings
                        ?.movementSpeed
                        ?.options
            },

            {
                label:
                    "Ascent Style",

                key:
                    "ascentStyle",

                options:
                    reference
                        ?.movementSettings
                        ?.ascentStyle
                        ?.options
            },

            {
                label:
                    "Up and Down Speed",

                key:
                    "upDownSpeed",

                options:
                    reference
                        ?.movementSettings
                        ?.upDownSpeed
                        ?.options
            }

        ];


        movementDefinitions.forEach(
            definition => {

                const value =
                    profile
                        ?.movement
                        ?.[definition.key]
                    ||
                    "";

                const option =
                    findOption(
                        definition.options,
                        value
                    );


                movementGrid.appendChild(
                    makeBuildItem(
                        definition.label,
                        value,
                        option?.points
                    )
                );

            }
        );


        movementSection.append(
            movementHeading,
            movementGrid
        );


        wrapper.append(
            skillsSection,
            enduranceSection,
            movementSection
        );


        statusElement.appendChild(
            wrapper
        );

    }


    async function loadSimulationProfile() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const wrestlerId =
            params.get(
                "id"
            );


        if (!wrestlerId) {

            section.hidden =
                true;

            return;

        }


        try {

            const [
                profileResponse,
                referenceResponse,
                enduranceResponse
            ] =
                await Promise.all([

                    fetch(
                        "data/owl-parameter-profiles.json",
                        {
                            cache: "no-store"
                        }
                    ),

                    fetch(
                        "data/owl-parameter-reference.json",
                        {
                            cache: "no-store"
                        }
                    ),

                    fetch(
                        "data/endurance-profiles.json",
                        {
                            cache: "no-store"
                        }
                    )

                ]);


            if (
                !profileResponse.ok
                ||
                !referenceResponse.ok
                ||
                !enduranceResponse.ok
            ) {

                throw new Error(
                    "Could not load OWL simulation databases."
                );

            }


            const profileDatabase =
                await profileResponse.json();

            const reference =
                await referenceResponse.json();

            const enduranceDatabase =
                await enduranceResponse.json();


            const profiles =
                Array.isArray(
                    profileDatabase?.profiles
                )
                    ? profileDatabase.profiles
                    : [];


            const profile =
                profiles.find(
                    candidate =>
                        candidate?.wrestlerId ===
                        wrestlerId
                )
                ||
                null;


            if (!profile) {

                section.hidden =
                    true;

                return;

            }


            const enduranceProfiles =
                Array.isArray(
                    enduranceDatabase?.profiles
                )
                    ? enduranceDatabase.profiles
                    : [];


            const enduranceProfile =
                enduranceProfiles.find(
                    candidate =>
                        candidate?.wrestlerId ===
                        wrestlerId
                )
                ||
                null;


            const enduranceAreas = {

                ...defaultEnduranceAreas(),

                ...(
                    enduranceProfile?.areas
                    ||
                    {}
                )

            };


            window.owlSimulationProfileData = {

                wrestlerId,

                profile,

                reference,

                endurance: {
                    profile:
                        enduranceProfile,

                    areas:
                        enduranceAreas
                }

            };


                        section.hidden =
                false;


            renderSimulationSkills(
                profile,
                reference,
                enduranceAreas
            );

        }

        catch (
            error
        ) {

            console.error(
                "Could not load OWL Simulation Profile:",
                error
            );


            section.hidden =
                true;

        }

    }


    loadSimulationProfile();

})();
