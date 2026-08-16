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


        status.textContent =
            wrestlers.length > 0
                ? "READY"
                : "WAITING";

    }


    window.addEventListener(
        "owl-control-room-data-loaded",
        renderParameterWrestlerOptions
    );


    renderParameterWrestlerOptions();

})();
