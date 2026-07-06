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
            teamResponse,
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
                "data/teams.json",
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
            !teamResponse.ok ||
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


        const teams =
            await teamResponse.json();


        const championships =
            await championshipResponse.json();



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



        function createMemberSignature(
            memberIds
        ) {

            return [...memberIds]
                .sort()
                .join("|");

        }



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
        // OFFICIAL TEAM LOOKUP
        // =================================


        const officialTeamMap = {};


        teams.forEach(
            team => {


                if (
                    Array.isArray(
                        team.members
                    )

                    &&

                    team.members.length === 2
                ) {


                    const signature =
                        createMemberSignature(
                            team.members
                        );


                    officialTeamMap[
                        signature
                    ] = team;

                }

            }
        );



        // =================================
        // WRESTLER HELPERS
        // =================================


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



        function createWrestlerLink(
            wrestlerId
        ) {


            return `

                <a
                    href="wrestler.html?id=${encodeURIComponent(wrestlerId)}"
                    class="announced-competitor-link"
                >
                    ${getWrestlerName(wrestlerId)}
                </a>

            `;

        }



        // =================================
        // OFFICIAL TEAM DETECTION
        // =================================


        function getOfficialTeam(
            wrestlerIds
        ) {


            if (
                !Array.isArray(
                    wrestlerIds
                )

                ||

                wrestlerIds.length !== 2
            ) {

                return null;

            }


            const signature =
                createMemberSignature(
                    wrestlerIds
                );


            return officialTeamMap[
                signature
            ] || null;

        }



        // =================================
        // FORMAT MATCH SIDE
        // =================================


        function formatSide(
            side
        ) {


            const wrestlerIds =
                Array.isArray(
                    side.wrestlers
                )

                    ? side.wrestlers

                    : [];



            const officialTeam =
                getOfficialTeam(
                    wrestlerIds
                );



            if (officialTeam) {


                return `

                    <a
                        href="team.html?id=${encodeURIComponent(officialTeam.id)}"
                        class="announced-team-link"
                    >
                        ${officialTeam.name}
                    </a>

                `;

            }



            return wrestlerIds

                .map(
                    wrestlerId =>

                        createWrestlerLink(
                            wrestlerId
                        )
                )

                .join(
                    ` <span class="announced-member-divider">&amp;</span> `
                );

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

                .join(
                    ` <span class="announced-vs">vs.</span> `
                );

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


                        <h3 class="announced-match-fixture">

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
