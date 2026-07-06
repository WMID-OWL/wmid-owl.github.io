async function loadUpcomingMatchCard() {

    try {


        // =================================
        // GET EVENT ID
        // =================================


        const params =
            new URLSearchParams(
                window.location.search
            );


        const eventId =
            params.get("id");


        if (!eventId) {

            return;

        }



        // =================================
        // LOAD DATABASES
        // =================================


        const [
            announcedResponse,
            wrestlerResponse,
            championshipResponse
        ] = await Promise.all([

            fetch(
                "data/announced-matches.json",
                {
                    cache: "no-store"
                }
            ),

            fetch(
                "data/wrestlers.json",
                {
                    cache: "no-store"
                }
            ),

            fetch(
                "data/championships.json",
                {
                    cache: "no-store"
                }
            )

        ]);


        if (
            !announcedResponse.ok ||
            !wrestlerResponse.ok ||
            !championshipResponse.ok
        ) {

            throw new Error(
                "Could not load announced match databases."
            );

        }



        const announcedMatches =
            await announcedResponse.json();


        const wrestlers =
            await wrestlerResponse.json();


        const championships =
            await championshipResponse.json();



        // =================================
        // LOOKUP MAPS
        // =================================


        const wrestlerMap = {};


        wrestlers.forEach(
            wrestler => {

                wrestlerMap[
                    wrestler.id
                ] = wrestler;

            }
        );



        const championshipMap = {};


        championships.forEach(
            championship => {

                championshipMap[
                    championship.id
                ] = championship;

            }
        );



        // =================================
        // BASIC HELPERS
        // =================================


        function normalize(
            value
        ) {

            return String(
                value || ""
            )
                .trim()
                .toLowerCase();

        }



        function getWrestlerName(
            wrestlerId
        ) {


            const wrestler =
                wrestlerMap[
                    wrestlerId
                ];


            return wrestler
                ? wrestler.name
                : wrestlerId;

        }



        function formatSide(
            side
        ) {


            return side.wrestlers

                .map(
                    wrestlerId =>

                        getWrestlerName(
                            wrestlerId
                        )
                )

                .join(" & ");

        }



        function formatMatch(
            match
        ) {


            return match.sides

                .map(
                    side =>

                        formatSide(
                            side
                        )
                )

                .join(" vs. ");

        }



        // =================================
        // STATUS HELPERS
        // =================================


        function getStatusLabel(
            match
        ) {


            const status =
                normalize(
                    match.status
                );


            if (
                status === "postponed"
            ) {

                return "POSTPONED";

            }


            if (
                status === "cancelled"
            ) {

                return "CANCELLED";

            }


            return "ANNOUNCED";

        }



        function getStatusClass(
            match
        ) {


            const status =
                normalize(
                    match.status
                );


            if (
                status === "postponed"
            ) {

                return "status-postponed";

            }


            if (
                status === "cancelled"
            ) {

                return "status-cancelled";

            }


            return "status-announced";

        }



        // =================================
        // FIND DISPLAYABLE MATCHES
        // =================================


        const eventMatches =
            announcedMatches

                .filter(
                    match => {


                        const status =
                            normalize(
                                match.status
                            );


                        return (

                            match.eventId ===
                                eventId

                            &&

                            status !==
                                "completed"

                        );

                    }
                )

                .sort(
                    (a, b) =>

                        Number(
                            a.order || 0
                        )

                        -

                        Number(
                            b.order || 0
                        )
                );



        if (
            eventMatches.length === 0
        ) {

            return;

        }



        // =================================
        // PAGE ELEMENTS
        // =================================


        const matchList =
            document.getElementById(
                "event-match-list"
            );


        const noMatches =
            document.getElementById(
                "event-no-matches"
            );


        if (!matchList) {

            return;

        }


        if (noMatches) {

            noMatches.hidden =
                true;

        }



        // =================================
        // ANNOUNCED CARD HEADER
        // =================================


        const announcedHeader =
            document.createElement(
                "div"
            );


        announcedHeader.className =
            "announced-card-header";


        announcedHeader.innerHTML = `

            <span>
                ANNOUNCED CARD
            </span>

            <strong>

                ${eventMatches.length}

                ${
                    eventMatches.length === 1
                        ? "MATCH"
                        : "MATCHES"
                }

            </strong>

        `;


        matchList.appendChild(
            announcedHeader
        );



        // =================================
        // RENDER MATCHES
        // =================================


        eventMatches.forEach(
            (
                match,
                index
            ) => {


                const card =
                    document.createElement(
                        "article"
                    );


                const statusClass =
                    getStatusClass(
                        match
                    );


                const statusLabel =
                    getStatusLabel(
                        match
                    );


                card.className =

                    `event-match-card event-announced-match ${statusClass}`;



                const championship =
                    match.championshipId

                        ? championshipMap[
                            match.championshipId
                        ]

                        : null;



                const championshipName =
                    championship

                        ? championship.name

                        : "";



                card.innerHTML = `

                    <div class="event-match-order">

                        MATCH ${index + 1}

                    </div>


                    <div class="event-match-content">


                        <span class="event-match-type">

                            ${match.matchType}

                        </span>


                        <h3>

                            ${formatMatch(match)}

                        </h3>


                        ${
                            championship

                                ? `
                                    <p class="announced-title-match">

                                        <a
                                            href="title.html?id=${encodeURIComponent(match.championshipId)}"
                                        >
                                            ${championshipName}
                                        </a>

                                    </p>
                                `

                                : ""
                        }


                        ${
                            match.stipulation

                                ? `
                                    <p class="announced-stipulation">

                                        ${match.stipulation}

                                    </p>
                                `

                                : ""
                        }


                        ${
                            match.statusNote

                                ? `
                                    <p class="announced-status-note">

                                        ${match.statusNote}

                                    </p>
                                `

                                : ""
                        }


                    </div>


                    <div class="announced-match-status">


                        <span>
                            STATUS
                        </span>


                        <strong>

                            ${statusLabel}

                        </strong>


                    </div>

                `;


                matchList.appendChild(
                    card
                );

            }
        );


    }


    catch (error) {


        console.error(
            "Could not load upcoming match card:",
            error
        );

    }

}



loadUpcomingMatchCard();
