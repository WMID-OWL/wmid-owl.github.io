async function loadGroupsDirectory() {

    try {


        // =================================
        // LOAD DATABASES
        // =================================


        const teamResponse =
            await fetch(
                "data/teams.json",
                {
                    cache: "no-store"
                }
            );


        const factionResponse =
            await fetch(
                "data/factions.json",
                {
                    cache: "no-store"
                }
            );


        const wrestlerResponse =
            await fetch(
                "data/wrestlers.json",
                {
                    cache: "no-store"
                }
            );


        const matchResponse =
            await fetch(
                "data/matches.json",
                {
                    cache: "no-store"
                }
            );


        if (
            !teamResponse.ok ||
            !factionResponse.ok ||
            !wrestlerResponse.ok ||
            !matchResponse.ok
        ) {

            throw new Error(
                "Could not load groups directory."
            );

        }


        const teams =
            await teamResponse.json();


        const factions =
            await factionResponse.json();


        const wrestlers =
            await wrestlerResponse.json();


        const matches =
            await matchResponse.json();



        // =================================
        // WRESTLER LOOKUP
        // =================================


        const wrestlerMap = {};


        wrestlers.forEach(
            wrestler => {

                wrestlerMap[
                    wrestler.id
                ] = wrestler;

            }
        );



        // =================================
        // RECORD HELPERS
        // =================================


        function sideContainsEntireGroup(
            side,
            members
        ) {


            return members.every(
                memberId =>

                    side.wrestlers.includes(
                        memberId
                    )
            );

        }



        function findGroupSide(
            match,
            members
        ) {


            return match.sides.findIndex(
                side =>

                    sideContainsEntireGroup(
                        side,
                        members
                    )
            );

        }



        function getResultType(match) {


            const resultType =
                String(
                    match.resultType || ""
                )
                    .trim()
                    .toLowerCase();


            if (
                resultType === "no-contest" ||
                resultType === "no contest" ||
                resultType === "nc"
            ) {

                return "no-contest";

            }


            if (
                resultType === "draw"
            ) {

                return "draw";

            }


            if (
                match.winnerSide === null ||
                match.winnerSide === undefined
            ) {

                return "draw";

            }


            return "win";

        }



        function calculateGroupRecord(
            members
        ) {


            let wins = 0;

            let losses = 0;

            let draws = 0;


            const groupMatches =
                matches.filter(
                    match =>

                        findGroupSide(
                            match,
                            members
                        ) !== -1
                );


            groupMatches.forEach(
                match => {


                    const resultType =
                        getResultType(
                            match
                        );


                    if (
                        resultType === "no-contest"
                    ) {

                        return;

                    }


                    if (
                        resultType === "draw"
                    ) {

                        draws++;

                        return;

                    }


                    const groupSide =
                        findGroupSide(
                            match,
                            members
                        );


                    if (
                        groupSide ===
                        match.winnerSide
                    ) {

                        wins++;

                    }

                    else {

                        losses++;

                    }


                }
            );


            return `${wins}-${losses}-${draws}`;

        }



        // =================================
        // MEMBER NAME DISPLAY
        // =================================


        function getMemberNames(
            memberIds
        ) {


            return memberIds

                .map(
                    memberId => {


                        const wrestler =
                            wrestlerMap[
                                memberId
                            ];


                        return wrestler
                            ? wrestler.name
                            : memberId;

                    }
                )

                .join(" & ");

        }



        // =================================
        // TEAM CARDS
        // =================================


        const teamGrid =
            document.getElementById(
                "team-grid"
            );


        document.getElementById(
            "team-count"
        ).textContent =

            `${teams.length} ${
                teams.length === 1
                    ? "Team"
                    : "Teams"
            }`;


        if (
            teams.length === 0
        ) {


            document.getElementById(
                "no-teams"
            ).hidden =
                false;

        }



        teams.forEach(
            team => {


                const card =
                    document.createElement(
                        "a"
                    );


                card.href =
                    `team.html?id=${encodeURIComponent(team.id)}`;


                card.className =
                    "group-card";


                const record =
                    calculateGroupRecord(
                        team.members
                    );


                const memberNames =
                    getMemberNames(
                        team.members
                    );


                card.innerHTML = `

                    <div class="group-card-image">

                        ${
                            team.logo

                                ? `
                                    <img
                                        src="${team.logo}"
                                        alt="${team.name}"
                                    >
                                `

                                : `
                                    <span>
                                        OWL
                                    </span>
                                `
                        }

                    </div>


                    <div class="group-card-body">


                        <div class="group-card-topline">

                            <span class="group-brand">

                                ${
                                    team.brand ||
                                    "OWL"
                                }

                            </span>


                            <span class="group-record">

                                ${record}

                            </span>

                        </div>


                        <h3>
                            ${team.name}
                        </h3>


                        <p>
                            ${memberNames}
                        </p>


                        <span class="view-group">

                            View Team →

                        </span>


                    </div>

                `;


                teamGrid.appendChild(
                    card
                );


            }
        );



        // =================================
        // FACTION SECTION
        // =================================


        if (
            factions.length > 0
        ) {


            const factionSection =
                document.getElementById(
                    "factions-section"
                );


            const factionGrid =
                document.getElementById(
                    "faction-grid"
                );


            factionSection.hidden =
                false;


            document.getElementById(
                "faction-count"
            ).textContent =

                `${factions.length} ${
                    factions.length === 1
                        ? "Faction"
                        : "Factions"
                }`;



            factions.forEach(
                faction => {


                    const card =
    document.createElement(
        "a"
    );


card.href =
    `faction.html?id=${encodeURIComponent(faction.id)}`;


card.className =
    "group-card";


                    const memberNames =
                        getMemberNames(
                            faction.members
                        );


                    card.innerHTML = `

                        <div class="group-card-image">

                            ${
                                faction.logo

                                    ? `
                                        <img
                                            src="${faction.logo}"
                                            alt="${faction.name}"
                                        >
                                    `

                                    : `
                                        <span>
                                            OWL
                                        </span>
                                    `
                            }

                        </div>


                        <div class="group-card-body">


                            <div class="group-card-topline">

                                <span class="group-brand">

                                    ${
                                        faction.brand ||
                                        "OWL"
                                    }

                                </span>

                            </div>


                            <h3>
                                ${faction.name}
                            </h3>


                            <p>
                                ${memberNames}
                            </p>


                        </div>

                    `;


                    factionGrid.appendChild(
                        card
                    );


                }
            );

        }


    }


    catch (error) {


        console.error(
            "Could not load groups directory:",
            error
        );


        document.querySelector(
            ".groups-page"
        ).innerHTML = `

            <section class="groups-section">

                <h1>
                    Directory Could Not Load
                </h1>

                <p>
                    There was a problem loading
                    the OWL teams and factions database.
                </p>

            </section>

        `;

    }

}



loadGroupsDirectory();
