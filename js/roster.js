async function loadRosterPage() {

    try {


        // =================================
        // LOAD DATABASES
        // =================================


        const wrestlerResponse =
            await fetch(
                "data/wrestlers.json",
                {
                    cache: "no-store"
                }
            );


        const teamResponse =
            await fetch(
                "data/teams.json",
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
            !wrestlerResponse.ok ||
            !teamResponse.ok ||
            !matchResponse.ok
        ) {

            throw new Error(
                "Could not load roster databases."
            );

        }


        const wrestlers =
            await wrestlerResponse.json();


        const teams =
            await teamResponse.json();


        const matches =
            await matchResponse.json();



        // =================================
        // PAGE ELEMENTS
        // =================================


        const ascensionGrid =
            document.getElementById(
                "ascension-roster"
            );


        const revoltGrid =
            document.getElementById(
                "revolt-roster"
            );


        const unassignedGrid =
            document.getElementById(
                "unassigned-roster"
            );


        const noResults =
            document.getElementById(
                "no-roster-results"
            );


        const searchInput =

            document.getElementById(
                "roster-search"
            )

            ||

            document.querySelector(
                'input[type="search"]'
            );



        if (
            !ascensionGrid ||
            !revoltGrid
        ) {

            throw new Error(
                "Roster sections could not be found."
            );

        }



        const ascensionSection =
            ascensionGrid.closest(
                "section"
            );


        const revoltSection =
            revoltGrid.closest(
                "section"
            );


        const unassignedSection =
            unassignedGrid

                ? unassignedGrid.closest(
                    "section"
                )

                : null;



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
        // CREATE TEAM RESULTS SECTION
        // =================================


        let teamSection =
            document.getElementById(
                "team-roster-section"
            );


        if (!teamSection) {


            teamSection =
                document.createElement(
                    "section"
                );


            teamSection.id =
                "team-roster-section";


            teamSection.className =
                "roster-team-section";


            teamSection.hidden =
                true;


            teamSection.innerHTML = `

                <div class="roster-section-heading">

                    <div>

                        <p class="eyebrow">
                            TWO AS ONE
                        </p>

                        <h2>
                            Tag Teams
                        </h2>

                    </div>

                    <span id="roster-team-count">
                        0 Teams
                    </span>

                </div>


                <div
                    id="roster-team-grid"
                    class="roster-team-grid"
                >
                </div>

            `;


            ascensionSection.parentNode.insertBefore(
                teamSection,
                ascensionSection
            );

        }



        const teamGrid =
            document.getElementById(
                "roster-team-grid"
            );


        const teamCount =
            document.getElementById(
                "roster-team-count"
            );



        // =================================
        // HELPER: INITIALS
        // =================================


        function getInitials(name) {


            return name

                .split(" ")

                .map(
                    word =>
                        word.charAt(0)
                )

                .join("")

                .slice(0, 3)

                .toUpperCase();

        }



        // =================================
        // WRESTLER CARD
        // =================================


        function createWrestlerCard(
            wrestler
        ) {


            const card =
                document.createElement(
                    "a"
                );


            card.href =
                `wrestler.html?id=${encodeURIComponent(wrestler.id)}`;


            card.className =
                "roster-card";


            const hometownParts = [];


            if (wrestler.hometown) {

                hometownParts.push(
                    wrestler.hometown
                );

            }


            if (wrestler.flag) {

                hometownParts.push(
                    wrestler.flag
                );

            }


            const hometown =
                hometownParts.join(" ");



            card.innerHTML = `

                <div class="roster-card-image">

                    ${
                        wrestler.photo

                            ? `
                                <img
                                    src="${wrestler.photo}"
                                    alt="${wrestler.name}"
                                >
                            `

                            : `
                                <span class="roster-initials">
                                    ${getInitials(wrestler.name)}
                                </span>
                            `
                    }

                </div>


                <div class="roster-card-content">


                    <span class="roster-card-brand">

                        ${
                            wrestler.brand ||
                            "OWL"
                        }

                    </span>


                    <h3>
                        ${wrestler.name}
                    </h3>


                    ${
                        wrestler.nickname

                            ? `
                                <p class="roster-nickname">
                                    "${wrestler.nickname}"
                                </p>
                            `

                            : ""
                    }


                    ${
                        hometown

                            ? `
                                <p class="roster-hometown">
                                    ${hometown}
                                </p>
                            `

                            : ""
                    }


                </div>

            `;


            return card;

        }



        // =================================
        // TEAM RECORD HELPERS
        // =================================


        function findTeamSide(
            match,
            members
        ) {


            return match.sides.findIndex(
                side =>

                    members.every(
                        memberId =>

                            side.wrestlers.includes(
                                memberId
                            )
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



        function calculateTeamRecord(
            team
        ) {


            let wins = 0;

            let losses = 0;

            let draws = 0;


            matches.forEach(
                match => {


                    const teamSide =
                        findTeamSide(
                            match,
                            team.members
                        );


                    if (
                        teamSide === -1
                    ) {

                        return;

                    }


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


                    if (
                        teamSide ===
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
        // TEAM MEMBER NAMES
        // =================================


        function getTeamMemberNames(
            team
        ) {


            return team.members

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
        // TEAM CARD
        // =================================


        function createTeamCard(team) {


            const card =
                document.createElement(
                    "a"
                );


            card.href =
                `team.html?id=${encodeURIComponent(team.id)}`;


            card.className =
                "roster-team-card";


            const record =
                calculateTeamRecord(
                    team
                );


            const members =
                getTeamMemberNames(
                    team
                );



            card.innerHTML = `

                <div class="roster-team-image">

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


                <div class="roster-team-body">


                    <div class="roster-team-topline">

                        <span>
                            ${
                                team.brand ||
                                "OWL"
                            }
                        </span>

                        <strong>
                            ${record}
                        </strong>

                    </div>


                    <h3>
                        ${team.name}
                    </h3>


                    <p>
                        ${members}
                    </p>


                    <span class="roster-view-team">
                        View Team →
                    </span>


                </div>

            `;


            return card;

        }



        // =================================
        // FILTER BUTTON DETECTION
        // =================================


        function getButtonFilter(
            button
        ) {


            const dataFilter =
                String(
                    button.dataset.filter || ""
                )
                    .trim()
                    .toLowerCase();


            const buttonText =
                button.textContent
                    .trim()
                    .toLowerCase();


            const value =
                dataFilter ||
                buttonText;



            const filterMap = {

                "all":
                    "all",

                "ascension":
                    "ascension",

                "revolt":
                    "revolt",

                "men":
                    "men",

                "women":
                    "women",

                "teams":
                    "teams",

                "team":
                    "teams",

                "tag":
                    "teams",

                "tag-team":
                    "teams",

                "tag-teams":
                    "teams",

                "tag team":
                    "teams",

                "tag teams":
                    "teams",

                "faction":
                    "factions",

                "factions":
                    "factions"

            };


            return filterMap[
                value
            ] || null;

        }



        const filterButtons =

            Array.from(
                document.querySelectorAll(
                    "button"
                )
            )

            .filter(
                button =>
                    getButtonFilter(
                        button
                    ) !== null
            );



        // =================================
        // CURRENT FILTER
        // =================================


        let currentFilter =
            "all";



        // =================================
        // SEARCH TEXT HELPERS
        // =================================


        function getWrestlerSearchText(
            wrestler
        ) {


            return [

                wrestler.name,
                wrestler.nickname,
                wrestler.hometown,
                wrestler.country,
                wrestler.brand,
                wrestler.division,
                wrestler.team,
                wrestler.faction

            ]

                .filter(Boolean)

                .join(" ")

                .toLowerCase();

        }



        function getTeamSearchText(
            team
        ) {


            return [

                team.name,
                team.brand,
                getTeamMemberNames(team)

            ]

                .filter(Boolean)

                .join(" ")

                .toLowerCase();

        }



        // =================================
        // HIDE WRESTLER SECTIONS
        // =================================


        function hideWrestlerSections() {


            ascensionSection.hidden =
                true;


            revoltSection.hidden =
                true;


            if (
                unassignedSection
            ) {

                unassignedSection.hidden =
                    true;

            }

        }



        // =================================
        // TEAM FILTER DISPLAY
        // =================================


        function renderTeams(
            searchTerm
        ) {


            hideWrestlerSections();


            teamSection.hidden =
                false;


            teamGrid.innerHTML =
                "";


            const filteredTeams =
                teams.filter(
                    team =>

                        getTeamSearchText(
                            team
                        ).includes(
                            searchTerm
                        )
                );


            teamCount.textContent =

                `${filteredTeams.length} ${
                    filteredTeams.length === 1

                        ? "Team"

                        : "Teams"
                }`;


            filteredTeams.forEach(
                team => {

                    teamGrid.appendChild(
                        createTeamCard(
                            team
                        )
                    );

                }
            );


            if (noResults) {

                noResults.hidden =
                    filteredTeams.length !== 0;

            }

        }



        // =================================
        // WRESTLER FILTER DISPLAY
        // =================================


        function renderWrestlers(
            searchTerm
        ) {


            teamSection.hidden =
                true;


            ascensionGrid.innerHTML =
                "";


            revoltGrid.innerHTML =
                "";


            if (
                unassignedGrid
            ) {

                unassignedGrid.innerHTML =
                    "";

            }



            const filteredWrestlers =
                wrestlers.filter(
                    wrestler => {


                        const matchesSearch =
                            getWrestlerSearchText(
                                wrestler
                            ).includes(
                                searchTerm
                            );


                        if (
                            !matchesSearch
                        ) {

                            return false;

                        }



                        if (
                            currentFilter === "ascension"
                        ) {

                            return (
                                String(
                                    wrestler.brand || ""
                                ).toLowerCase()
                                === "ascension"
                            );

                        }



                        if (
                            currentFilter === "revolt"
                        ) {

                            return (
                                String(
                                    wrestler.brand || ""
                                ).toLowerCase()
                                === "revolt"
                            );

                        }



                        if (
                            currentFilter === "men"
                        ) {

                            return (
                                String(
                                    wrestler.division || ""
                                ).toLowerCase()
                                === "men"
                            );

                        }



                        if (
                            currentFilter === "women"
                        ) {

                            return (
                                String(
                                    wrestler.division || ""
                                ).toLowerCase()
                                === "women"
                            );

                        }



                        if (
                            currentFilter === "factions"
                        ) {

                            return Boolean(
                                wrestler.faction
                            );

                        }



                        return true;

                    }
                );



            let ascensionCount = 0;

            let revoltCount = 0;

            let unassignedCount = 0;



            filteredWrestlers.forEach(
                wrestler => {


                    const card =
                        createWrestlerCard(
                            wrestler
                        );


                    const brand =
                        String(
                            wrestler.brand || ""
                        ).toLowerCase();



                    if (
                        brand === "ascension"
                    ) {


                        ascensionGrid.appendChild(
                            card
                        );


                        ascensionCount++;

                    }



                    else if (
                        brand === "revolt"
                    ) {


                        revoltGrid.appendChild(
                            card
                        );


                        revoltCount++;

                    }



                    else if (
                        unassignedGrid
                    ) {


                        unassignedGrid.appendChild(
                            card
                        );


                        unassignedCount++;

                    }


                }
            );



            ascensionSection.hidden =
                ascensionCount === 0;


            revoltSection.hidden =
                revoltCount === 0;


            if (
                unassignedSection
            ) {

                unassignedSection.hidden =
                    unassignedCount === 0;

            }


            if (noResults) {

                noResults.hidden =
                    filteredWrestlers.length !== 0;

            }

        }



        // =================================
        // MAIN RENDER FUNCTION
        // =================================


        function renderRoster() {


            const searchTerm =

                searchInput

                    ? searchInput.value
                        .trim()
                        .toLowerCase()

                    : "";


            if (
                currentFilter === "teams"
            ) {

                renderTeams(
                    searchTerm
                );

                return;

            }


            renderWrestlers(
                searchTerm
            );

        }



        // =================================
        // FILTER BUTTON EVENTS
        // =================================


        filterButtons.forEach(
            button => {


                button.addEventListener(
                    "click",
                    () => {


                        currentFilter =
                            getButtonFilter(
                                button
                            );


                        filterButtons.forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        button.classList.add(
                            "active"
                        );


                        renderRoster();

                    }
                );


            }
        );



        // =================================
        // SEARCH EVENT
        // =================================


        if (
            searchInput
        ) {


            searchInput.addEventListener(
                "input",
                renderRoster
            );

        }



        // =================================
        // INITIAL PAGE LOAD
        // =================================


        renderRoster();


    }


    catch (error) {


        console.error(
            "Could not load roster:",
            error
        );


        document.querySelector(
            "main"
        ).innerHTML += `

            <section class="section">

                <p class="empty-message">

                    The OWL roster
                    could not be loaded.

                </p>

            </section>

        `;

    }

}



loadRosterPage();
