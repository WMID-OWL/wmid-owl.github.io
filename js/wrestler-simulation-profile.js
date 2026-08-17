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


            statusElement.textContent =
                "Current OWL simulation build loaded.";

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
