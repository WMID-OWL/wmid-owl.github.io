async function loadRoster() {

    try {

        const wrestlerResponse = await fetch(
    "data/wrestlers.json",
    {
        cache: "no-store"
    }
);


const teamResponse = await fetch(
    "data/teams.json",
    {
        cache: "no-store"
    }
);


const matchResponse = await fetch(
    "data/matches.json",
    {
        cache: "no-store"
    }
);


const wrestlers =
    await wrestlerResponse.json();


const teams =
    await teamResponse.json();


const matches =
    await matchResponse.json();

        
        // ROSTER CONTAINERS

        const ascensionRoster =
            document.getElementById(
                "ascension-roster"
            );


        const revoltRoster =
            document.getElementById(
                "revolt-roster"
            );


        const unassignedRoster =
            document.getElementById(
                "unassigned-roster"
            );



        // SECTIONS

        const ascensionSection =
            document.getElementById(
                "ascension"
            );


        const revoltSection =
            document.getElementById(
                "revolt"
            );


        const unassignedSection =
            document.getElementById(
                "unassigned-section"
            );



        // SEARCH AND FILTER ELEMENTS

        const searchInput =
            document.getElementById(
                "roster-search"
            );


        const filterButtons =
            document.querySelectorAll(
                ".roster-filter"
            );


        const emptyState =
            document.getElementById(
                "roster-empty-state"
            );



        let activeFilter = "all";
// TAG TEAM DISPLAY SECTION

const teamSection =
    document.createElement(
        "section"
    );


teamSection.id =
    "roster-team-section";


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


const teamGrid =
    document.getElementById(
        "roster-team-grid"
    );


const teamCount =
    document.getElementById(
        "roster-team-count"
    );


        function normalize(value) {

            return String(value || "")
                .trim()
                .toLowerCase();

        }



        function getInitials(name) {

            return name
                .split(" ")
                .map(word => word[0])
                .join("")
                .slice(0, 3)
                .toUpperCase();

        }


// =================================
// TAG TEAM HELPERS
// =================================


function getTeamMemberNames(team) {

    return team.members

        .map(memberId => {

            const wrestler =
                wrestlers.find(
                    item =>
                        item.id === memberId
                );


            return wrestler
                ? wrestler.name
                : memberId;

        })

        .join(" & ");

}



function findTeamSide(
    match,
    team
) {

    return match.sides.findIndex(
        side =>

            team.members.every(
                memberId =>

                    side.wrestlers.includes(
                        memberId
                    )
            )
    );

}



function calculateTeamRecord(team) {

    let wins = 0;

    let losses = 0;

    let draws = 0;


    matches.forEach(match => {

        const teamSide =
            findTeamSide(
                match,
                team
            );


        if (teamSide === -1) {

            return;

        }


        const resultType =
            normalize(
                match.resultType
            );


        if (
            resultType === "no-contest" ||
            resultType === "no contest" ||
            resultType === "nc"
        ) {

            return;

        }


        if (
            resultType === "draw" ||
            match.winnerSide === null ||
            match.winnerSide === undefined
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

    });


    return `${wins}-${losses}-${draws}`;

}



function createTeamCard(team) {

    const link =
        document.createElement(
            "a"
        );


    link.href =
        `team.html?id=${encodeURIComponent(team.id)}`;


    link.className =
        "roster-team-card";


    const memberNames =
        getTeamMemberNames(
            team
        );


    const record =
        calculateTeamRecord(
            team
        );


    link.innerHTML = `

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
                    ${team.brand || "OWL"}
                </span>

                <strong>
                    ${record}
                </strong>

            </div>


            <h3>
                ${team.name}
            </h3>


            <p>
                ${memberNames}
            </p>


            <span class="roster-view-team">
                View Team →
            </span>


        </div>

    `;


    return link;

}



        function createWrestlerCard(wrestler) {


            // PROFILE LINK

            const link =
                document.createElement("a");


            link.href =
                `wrestler.html?id=${encodeURIComponent(wrestler.id)}`;


            link.className =
                "roster-card-link";



            // STORE FILTER INFORMATION ON CARD

            link.dataset.brand =
                normalize(wrestler.brand);


            link.dataset.division =
                normalize(wrestler.division);


            link.dataset.hasTeam =
                wrestler.team
                    ? "true"
                    : "false";


            link.dataset.hasFaction =
                wrestler.faction
                    ? "true"
                    : "false";



            // SEARCHABLE TEXT

            link.dataset.search = [

                wrestler.name,
                wrestler.nickname,
                wrestler.hometown,
                wrestler.country,
                wrestler.team,
                wrestler.faction

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();



            // CARD

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "wrestler-card roster-wrestler-card";



            // PORTRAIT

            const portrait =
                document.createElement(
                    "div"
                );


            portrait.className =
                "roster-portrait";


            if (wrestler.photo) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    wrestler.photo;


                image.alt =
                    wrestler.name;


                portrait.appendChild(
                    image
                );

            }

            else {

                portrait.textContent =
                    getInitials(
                        wrestler.name
                    );

            }



            // INFORMATION

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "roster-card-info";



            // NAME

            const name =
                document.createElement(
                    "h3"
                );


            name.textContent =
                wrestler.name;


            info.appendChild(name);



            // NICKNAME

            if (wrestler.nickname) {

                const nickname =
                    document.createElement(
                        "p"
                    );


                nickname.className =
                    "roster-nickname";


                nickname.textContent =
                    `"${wrestler.nickname}"`;


                info.appendChild(
                    nickname
                );

            }



            // HOMETOWN + FLAG

            if (wrestler.hometown) {

                const hometown =
                    document.createElement(
                        "p"
                    );


                hometown.className =
                    "roster-hometown";


                if (wrestler.flag) {

                    hometown.textContent =
                        `${wrestler.hometown} ${wrestler.flag}`;

                }

                else {

                    hometown.textContent =
                        wrestler.hometown;

                }


                info.appendChild(
                    hometown
                );

            }



            card.appendChild(
                portrait
            );


            card.appendChild(
                info
            );


            link.appendChild(
                card
            );


            return link;

        }



        // CREATE THE ROSTER

        wrestlers.forEach(wrestler => {


            const card =
                createWrestlerCard(
                    wrestler
                );


            const brand =
                normalize(
                    wrestler.brand
                );


            if (brand === "ascension") {

                ascensionRoster.appendChild(
                    card
                );

            }

            else if (brand === "revolt") {

                revoltRoster.appendChild(
                    card
                );

            }

            else {

                unassignedRoster.appendChild(
                    card
                );

            }

        });



        function matchesActiveFilter(card) {


            switch (activeFilter) {


                case "ascension":

                    return (
                        card.dataset.brand
                        === "ascension"
                    );


                case "revolt":

                    return (
                        card.dataset.brand
                        === "revolt"
                    );


                case "men":

                    return (
                        card.dataset.division
                        === "men"
                    );


                case "women":

                    return (
                        card.dataset.division
                        === "women"
                    );


                case "tag-teams":

                    return (
                        card.dataset.hasTeam
                        === "true"
                    );


                case "factions":

                    return (
                        card.dataset.hasFaction
                        === "true"
                    );


                case "all":

                default:

                    return true;

            }

        }



        function updateSectionVisibility() {


            const sections = [

                {
                    section:
                        ascensionSection,

                    container:
                        ascensionRoster
                },

                {
                    section:
                        revoltSection,

                    container:
                        revoltRoster
                },

                {
                    section:
                        unassignedSection,

                    container:
                        unassignedRoster
                }

            ];



            let totalVisible = 0;



            sections.forEach(item => {


                const cards = [

                    ...item.container
                        .querySelectorAll(
                            ".roster-card-link"
                        )

                ];


                const visibleCards =
                    cards.filter(
                        card => !card.hidden
                    );


                item.section.hidden =
                    visibleCards.length === 0;


                totalVisible +=
                    visibleCards.length;

            });



            emptyState.hidden =
                totalVisible !== 0;

        }



        function applyFilters() {


    const searchText =
        normalize(
            searchInput.value
        );



    // TAG TEAM MODE

    if (
        activeFilter === "tag-teams"
    ) {


        ascensionSection.hidden =
            true;


        revoltSection.hidden =
            true;


        unassignedSection.hidden =
            true;


        teamSection.hidden =
            false;


        teamGrid.innerHTML =
            "";


        const visibleTeams =
            teams.filter(team => {


                const searchableText =
                    normalize(

                        [
                            team.name,
                            team.brand,
                            getTeamMemberNames(team)
                        ]
                            .filter(Boolean)
                            .join(" ")

                    );


                return searchableText.includes(
                    searchText
                );

            });



        visibleTeams.forEach(team => {

            teamGrid.appendChild(
                createTeamCard(team)
            );

        });



        teamCount.textContent =

            `${visibleTeams.length} ${
                visibleTeams.length === 1
                    ? "Team"
                    : "Teams"
            }`;



        emptyState.hidden =
            visibleTeams.length !== 0;


        return;

    }



    // NORMAL WRESTLER MODE

    teamSection.hidden =
        true;


    const cards =
        document.querySelectorAll(
            ".roster-card-link"
        );


            const cards =
                document.querySelectorAll(
                    ".roster-card-link"
                );



            cards.forEach(card => {


                const matchesFilter =
                    matchesActiveFilter(
                        card
                    );


                const matchesSearch =
                    card.dataset.search
                        .includes(
                            searchText
                        );


                card.hidden =
                    !(
                        matchesFilter
                        &&
                        matchesSearch
                    );

            });



            updateSectionVisibility();

        }



        // FILTER BUTTONS

        filterButtons.forEach(button => {


            button.addEventListener(
                "click",
                () => {


                    activeFilter =
                        button.dataset.filter;


                    filterButtons.forEach(
                        otherButton => {

                            otherButton.classList.remove(
                                "is-active"
                            );

                        }
                    );


                    button.classList.add(
                        "is-active"
                    );


                    applyFilters();

                }
            );

        });



        // SEARCH BOX

        searchInput.addEventListener(
            "input",
            applyFilters
        );



        // INITIAL DISPLAY

        applyFilters();


    }

    catch (error) {


        console.error(
            "Could not load OWL roster:",
            error
        );


        document.querySelector(
            "main"
        ).innerHTML += `

            <section class="section">

                <p class="empty-message">

                    The roster database could not be loaded.

                </p>

            </section>

        `;

    }

}



loadRoster();
