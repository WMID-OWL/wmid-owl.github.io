async function loadRoster() {

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


        const factionResponse =
            await fetch(
                "data/factions.json",
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
            !factionResponse.ok ||
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


        const factions =
            await factionResponse.json();


        const matches =
            await matchResponse.json();



        // =================================
        // ROSTER CONTAINERS
        // =================================


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



        // =================================
        // ROSTER SECTIONS
        // =================================


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



        // =================================
        // SEARCH AND FILTER ELEMENTS
        // =================================


        const searchInput =
            document.getElementById(
                "roster-search"
            );


                const brandButtons =
            document.querySelectorAll(
                ".roster-brand-filter"
            );


        const categoryButtons =
            document.querySelectorAll(
                ".roster-category-filter"
            );


        const emptyState =
            document.getElementById(
                "roster-empty-state"
            );
        
        const alphabetNav =
            document.getElementById(
                "roster-alphabet-nav"
            );


        const alphabetLetters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                .split("");


        const alphabetButtons =
            [];

        let activeBrand =
            "ascension";


        let activeCategory =
            "men";
        alphabetLetters.forEach(
            letter => {


                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "roster-alphabet-button";


                button.dataset.letter =
                    letter;


                button.textContent =
                    letter;


                button.setAttribute(
                    "aria-label",
                    `Jump to wrestlers beginning with ${letter}`
                );


                alphabetNav.appendChild(
                    button
                );


                alphabetButtons.push(
                    button
                );

            }
        );


        // =================================
        // BASIC HELPERS
        // =================================


        function normalize(value) {

            return String(
                value || ""
            )
                .trim()
                .toLowerCase();

        }



        function getInitials(name) {

            return name
                .split(" ")
                .map(
                    word =>
                        word[0]
                )
                .join("")
                .slice(0, 3)
                .toUpperCase();

        }
        function getAlphabetLetter(
            name
        ) {


            const firstCharacter =
                String(
                    name || ""
                )
                    .trim()
                    .charAt(0)
                    .toUpperCase();


            return /^[A-Z]$/.test(
                firstCharacter
            )
                ? firstCharacter
                : "#";

        }


        function getActiveRosterContainer() {


            if (
                activeBrand ===
                "ascension"
            ) {

                return ascensionRoster;

            }


            if (
                activeBrand ===
                "revolt"
            ) {

                return revoltRoster;

            }


            return null;

        }
        
        function getAlphabetGroup(
            container,
            letter
        ) {


            let group =
                container.querySelector(
                    `[data-letter="${letter}"]`
                );


            if (
                group
            ) {

                return group;

            }


            group =
                document.createElement(
                    "section"
                );


            group.className =
                "roster-letter-group";


            group.dataset.letter =
                letter;


            const heading =
                document.createElement(
                    "h3"
                );


            heading.className =
                "roster-letter-heading";


            heading.textContent =
                letter;


            const grid =
                document.createElement(
                    "div"
                );


            grid.className =
                "roster-letter-grid";


            group.appendChild(
                heading
            );


            group.appendChild(
                grid
            );


            container.appendChild(
                group
            );


            return group;

        }


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
        // CREATE TAG TEAM SECTION
        // =================================


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



        // =================================
        // CREATE FACTION SECTION
        // =================================


        const factionSection =
            document.createElement(
                "section"
            );


        factionSection.id =
            "roster-faction-section";


        factionSection.className =
            "roster-team-section";


        factionSection.hidden =
            true;


        factionSection.innerHTML = `

            <div class="roster-section-heading">

                <div>

                    <p class="eyebrow">
                        POWER IN NUMBERS
                    </p>

                    <h2>
                        Factions
                    </h2>

                </div>


                <span id="roster-faction-count">
                    0 Factions
                </span>

            </div>


            <div
                id="roster-faction-grid"
                class="roster-team-grid"
            >
            </div>

        `;


        ascensionSection.parentNode.insertBefore(
            factionSection,
            ascensionSection
        );


        const factionGrid =
            document.getElementById(
                "roster-faction-grid"
            );


        const factionCount =
            document.getElementById(
                "roster-faction-count"
            );



        // =================================
        // CREATE WRESTLER CARD
        // =================================


        function createWrestlerCard(
            wrestler
        ) {


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                `wrestler.html?id=${encodeURIComponent(wrestler.id)}`;


            link.className =
                "roster-card-link";



            link.dataset.brand =
                normalize(
                    wrestler.brand
                );


            link.dataset.division =
                normalize(
                    wrestler.division
                );


            link.dataset.hasTeam =
                wrestler.team
                    ? "true"
                    : "false";


            link.dataset.hasFaction =
                wrestler.faction
                    ? "true"
                    : "false";



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



            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "wrestler-card roster-wrestler-card";



            const portrait =
                document.createElement(
                    "div"
                );


            portrait.className =
                "roster-portrait";


            if (
                wrestler.photo
            ) {


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



            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "roster-card-info";



            const brand =
                document.createElement(
                    "span"
                );


            brand.className =
                "roster-card-brand";


            brand.textContent =
                wrestler.brand || "OWL";


            info.appendChild(
                brand
            );



            const name =
                document.createElement(
                    "h3"
                );


            name.textContent =
                wrestler.name;


            info.appendChild(
                name
            );



            if (
                wrestler.nickname
            ) {


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



            const hometownParts =
                [];


            if (
                wrestler.hometown
            ) {

                hometownParts.push(
                    wrestler.hometown
                );

            }


            if (
                wrestler.flag
            ) {

                hometownParts.push(
                    wrestler.flag
                );

            }


            if (
                hometownParts.length > 0
            ) {


                const hometown =
                    document.createElement(
                        "p"
                    );


                hometown.className =
                    "roster-hometown";


                hometown.textContent =
                    hometownParts.join(" ");


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



        // =================================
        // TEAM HELPERS
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



        function getResultType(
            match
        ) {


            const resultType =
                normalize(
                    match.resultType
                );


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
                            team
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
        // CREATE TEAM CARD
        // =================================


        function createTeamCard(
            team
        ) {


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                `team.html?id=${encodeURIComponent(team.id)}`;


            link.className =
                "roster-team-card";


            const record =
                calculateTeamRecord(
                    team
                );


            const memberNames =
                getTeamMemberNames(
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



        // =================================
        // FACTION HELPERS
        // =================================


        function getFactionMemberIds(
            faction
        ) {


            const officialTeam =
                teams.find(
                    team =>
                        team.id ===
                        faction.tagTeamId
                );


            return Array.from(
                new Set(
                    [

                        ...(faction.members || []),

                        ...(
                            faction.singlesMembers ||
                            []
                        ),

                        ...(
                            officialTeam
                                ? officialTeam.members
                                : []
                        ),

                        ...(
                            faction.leader
                                ? [faction.leader]
                                : []
                        )

                    ]
                )
            );

        }



        function getFactionMemberNames(
            faction
        ) {


            return getFactionMemberIds(
                faction
            )

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



        function getFactionSide(
            match,
            faction
        ) {


            const memberSet =
                new Set(
                    getFactionMemberIds(
                        faction
                    )
                );


            const sidesWithFactionMembers =
                match.sides

                    .map(
                        (side, index) => {


                            const count =
                                side.wrestlers.filter(
                                    wrestlerId =>

                                        memberSet.has(
                                            wrestlerId
                                        )
                                ).length;


                            return {
                                index:
                                    index,

                                count:
                                    count
                            };

                        }
                    )

                    .filter(
                        item =>
                            item.count > 0
                    );


            if (
                sidesWithFactionMembers.length !== 1
            ) {

                return -1;

            }


            return sidesWithFactionMembers[0]
                .index;

        }



        function calculateFactionRecord(
            faction
        ) {


            let wins = 0;

            let losses = 0;

            let draws = 0;


            matches.forEach(
                match => {


                    const factionSide =
                        getFactionSide(
                            match,
                            faction
                        );


                    if (
                        factionSide === -1
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
                        factionSide ===
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
        // CREATE FACTION CARD
        // =================================


        function createFactionCard(
            faction
        ) {


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                `faction.html?id=${encodeURIComponent(faction.id)}`;


            link.className =
                "roster-team-card";


            const memberIds =
                getFactionMemberIds(
                    faction
                );


            const record =
                calculateFactionRecord(
                    faction
                );


            link.innerHTML = `

                <div class="roster-team-image">

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


                <div class="roster-team-body">


                    <div class="roster-team-topline">

                        <span>
                            ${faction.brand || "OWL"}
                        </span>


                        <strong>
                            ${record}
                        </strong>

                    </div>


                    <h3>
                        ${faction.name}
                    </h3>


                    <p>
                        ${memberIds.length} ${
                            memberIds.length === 1
                                ? "Member"
                                : "Members"
                        }
                    </p>


                    <span class="roster-view-team">
                        View Faction →
                    </span>


                </div>

            `;


            return link;

        }



        // =================================
        // BUILD WRESTLER ROSTER
        // =================================


                function placeWrestlerCard(
            wrestler
        ) {


            const card =
                createWrestlerCard(
                    wrestler
                );


            const brand =
                normalize(
                    wrestler.brand
                );


            const letter =
                getAlphabetLetter(
                    wrestler.name
                );


            let rosterContainer =
                null;


            if (
                brand === "ascension"
            ) {

                rosterContainer =
                    ascensionRoster;

            }


            else if (
                brand === "revolt"
            ) {

                rosterContainer =
                    revoltRoster;

            }


            if (
                !rosterContainer
            ) {

                return;

            }


            const alphabetGroup =
                getAlphabetGroup(
                    rosterContainer,
                    letter
                );


            const alphabetGrid =
                alphabetGroup.querySelector(
                    ".roster-letter-grid"
                );


            alphabetGrid.appendChild(
                card
            );

        }


                const alphabetizedWrestlers =

            [...wrestlers]

                .sort(
                    (
                        firstWrestler,
                        secondWrestler
                    ) =>

                        String(
                            firstWrestler.name || ""
                        ).localeCompare(

                            String(
                                secondWrestler.name || ""
                            ),

                            undefined,

                            {
                                sensitivity:
                                    "base"
                            }

                        )
                );


        alphabetizedWrestlers.forEach(
            wrestler => {

                placeWrestlerCard(
                    wrestler
                );

            }
        );



        // =================================
        // WRESTLER FILTER LOGIC
        // =================================


                function matchesActiveWrestlerView(
            card
        ) {


            const matchesBrand =

                card.dataset.brand ===
                activeBrand;


            const matchesDivision =

                card.dataset.division ===
                activeCategory;


            return (

                matchesBrand

                &&

                matchesDivision

            );

        }


        // =================================
        // UPDATE ALPHABET NAVIGATION
        // =================================


        function updateAlphabetNavigation() {


            const isWrestlerCategory =

                activeCategory === "men"

                ||

                activeCategory === "women";


            alphabetNav.hidden =
                !isWrestlerCategory;


            if (
                !isWrestlerCategory
            ) {

                return;

            }


            const activeContainer =
                getActiveRosterContainer();


            alphabetButtons.forEach(
                button => {


                    const letter =
                        button.dataset.letter;


                    const group =
                        activeContainer

                            ? activeContainer.querySelector(
                                `.roster-letter-group[data-letter="${letter}"]`
                            )

                            : null;


                    const visibleCards =
                        group

                            ? [
                                ...group.querySelectorAll(
                                    ".roster-card-link"
                                )
                            ]

                                .filter(
                                    card =>
                                        !card.hidden
                                )

                            : [];


                    const hasVisibleWrestlers =
                        visibleCards.length > 0;


                    button.disabled =
                        !hasVisibleWrestlers;


                    button.classList.toggle(
                        "is-available",
                        hasVisibleWrestlers
                    );

                }
            );

        }
        
        // =================================
        // UPDATE WRESTLER SECTIONS
        // =================================


        function updateWrestlerSections() {


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


            let totalVisible =
                0;


            sections.forEach(
                item => {


                    if (
                        !item.section ||
                        !item.container
                    ) {

                        return;

                    }


                    const cards = [

                        ...item.container
                            .querySelectorAll(
                                ".roster-card-link"
                            )

                    ];


                                        const visibleCards =
                        cards.filter(
                            card =>
                                !card.hidden
                        );


                    const alphabetGroups = [

                        ...item.container
                            .querySelectorAll(
                                ".roster-letter-group"
                            )

                    ];


                    alphabetGroups.forEach(
                        group => {


                            const visibleGroupCards = [

                                ...group.querySelectorAll(
                                    ".roster-card-link"
                                )

                            ]

                                .filter(
                                    card =>
                                        !card.hidden
                                );


                            group.hidden =
                                visibleGroupCards.length === 0;

                        }
                    );


                    item.section.hidden =
                        visibleCards.length === 0;


                    totalVisible +=
                        visibleCards.length;

                }
            );


            emptyState.hidden =
                totalVisible !== 0;

        }



        // =================================
        // HIDE NORMAL ROSTER SECTIONS
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
        // TEAM MODE
        // =================================


        function renderTeams(
            searchText
        ) {


                        hideWrestlerSections();


            alphabetNav.hidden =
                true;


            factionSection.hidden =
                true;


            teamSection.hidden =
                false;


            teamGrid.innerHTML =
                "";


                        const visibleTeams =
                teams.filter(
                    team => {


                        const teamBrand =
                            normalize(
                                team.brand
                            );


                        const searchableText =
                            normalize(

                                [
                                    team.name,
                                    team.brand,
                                    getTeamMemberNames(
                                        team
                                    )
                                ]

                                    .filter(Boolean)

                                    .join(" ")

                            );


                        return (

                            teamBrand ===
                                activeBrand

                            &&

                            searchableText.includes(
                                searchText
                            )

                        );

                    }
                );


            visibleTeams.forEach(
                team => {


                    teamGrid.appendChild(
                        createTeamCard(
                            team
                        )
                    );

                }
            );


            teamCount.textContent =

                `${visibleTeams.length} ${
                    visibleTeams.length === 1

                        ? "Team"

                        : "Teams"
                }`;


            emptyState.hidden =
                visibleTeams.length !== 0;

        }



        // =================================
        // FACTION MODE
        // =================================


        function renderFactions(
            searchText
        ) {


                        hideWrestlerSections();


            alphabetNav.hidden =
                true;


            teamSection.hidden =
                true;


            factionSection.hidden =
                false;


            factionGrid.innerHTML =
                "";


                        const visibleFactions =
                factions.filter(
                    faction => {


                        const factionBrand =
                            normalize(
                                faction.brand
                            );


                        const searchableText =
                            normalize(

                                [
                                    faction.name,
                                    faction.brand,
                                    getFactionMemberNames(
                                        faction
                                    )
                                ]

                                    .filter(Boolean)

                                    .join(" ")

                            );


                        return (

                            factionBrand ===
                                activeBrand

                            &&

                            searchableText.includes(
                                searchText
                            )

                        );

                    }
                );

            visibleFactions.forEach(
                faction => {


                    factionGrid.appendChild(
                        createFactionCard(
                            faction
                        )
                    );

                }
            );


            factionCount.textContent =

                `${visibleFactions.length} ${
                    visibleFactions.length === 1

                        ? "Faction"

                        : "Factions"
                }`;


            emptyState.hidden =
                visibleFactions.length !== 0;

        }



        // =================================
        // APPLY FILTERS
        // =================================


        function applyFilters() {


            const searchText =
                normalize(
                    searchInput.value
                );



            // TAG TEAM MODE


                        if (
                activeCategory ===
                    "tag-teams"
            ) {


                renderTeams(
                    searchText
                );


                return;

            }



            // FACTION MODE


                        if (
                activeCategory ===
                    "factions"
            ) {


                renderFactions(
                    searchText
                );


                return;

            }



            // NORMAL WRESTLER MODE


            teamSection.hidden =
                true;


            factionSection.hidden =
                true;


            const cards =
                document.querySelectorAll(
                    ".roster-card-link"
                );


            cards.forEach(
                card => {


                                        const matchesFilter =
                        matchesActiveWrestlerView(
                            card
                        );


                    const matchesSearch =
                        card.dataset.search
                            .includes(
                                searchText
                            );


                    card.hidden =
                        !(
                            matchesFilter &&
                            matchesSearch
                        );

                }
            );


                        updateWrestlerSections();


            updateAlphabetNavigation();

        }


        // =================================
        // ALPHABET JUMP EVENTS
        // =================================


        alphabetButtons.forEach(
            button => {


                button.addEventListener(
                    "click",
                    () => {


                        if (
                            button.disabled
                        ) {

                            return;

                        }


                        const activeContainer =
                            getActiveRosterContainer();


                        if (
                            !activeContainer
                        ) {

                            return;

                        }


                        const letter =
                            button.dataset.letter;


                        const targetGroup =
                            activeContainer.querySelector(
                                `.roster-letter-group[data-letter="${letter}"]`
                            );


                        if (
                            !targetGroup ||
                            targetGroup.hidden
                        ) {

                            return;

                        }


                                                const siteHeader =
                            document.querySelector(
                                ".site-header"
                            );


                        const siteHeaderHeight =
                            siteHeader

                                ? siteHeader.offsetHeight

                                : 0;


                        const alphabetNavHeight =
                            alphabetNav.offsetHeight;


                        const stickyOffset =

                            siteHeaderHeight

                            +

                            alphabetNavHeight

                            +

                            16;


                        const targetPosition =

                            targetGroup
                                .getBoundingClientRect()
                                .top

                            +

                            window.scrollY

                            -

                            stickyOffset;


                        window.scrollTo(
                            {
                                top:
                                    Math.max(
                                        0,
                                        targetPosition
                                    ),

                                behavior:
                                    "smooth"
                            }
                        );

                    }
                );

            }
        );
        
        // =================================
        // FILTER BUTTON EVENTS
        // =================================


                brandButtons.forEach(
            button => {


                button.addEventListener(
                    "click",
                    () => {


                        activeBrand =
                            button.dataset.brand;


                        brandButtons.forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        button.classList.add(
                            "active"
                        );


                        applyFilters();

                    }
                );

            }
        );



        categoryButtons.forEach(
            button => {


                button.addEventListener(
                    "click",
                    () => {


                        activeCategory =
                            button.dataset.category;


                        categoryButtons.forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        button.classList.add(
                            "active"
                        );


                        applyFilters();

                    }
                );

            }
        );



        // =================================
        // SEARCH EVENT
        // =================================


        searchInput.addEventListener(
            "input",
            applyFilters
        );



        // =================================
        // INITIAL PAGE LOAD
        // =================================


        applyFilters();


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



loadRoster();
