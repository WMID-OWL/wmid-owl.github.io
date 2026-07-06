async function loadChampionsPage() {

    try {

        // =================================
        // JSON LOADER
        // =================================

        async function loadJson(
            path,
            required = true
        ) {

            try {

                const response =
                    await fetch(
                        path,
                        {
                            cache: "no-store"
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        `${path} returned ${response.status}`
                    );

                }


                return await response.json();

            }


            catch (error) {

                if (required) {

                    throw error;

                }


                console.warn(
                    `Optional database could not load: ${path}`,
                    error
                );


                return [];

            }

        }



        // =================================
        // LOAD DATABASES
        // =================================

        const [
            championshipData,
            reignData,
            wrestlerData,
            teamData,
            matchData
        ] = await Promise.all([

            loadJson(
                "data/championships.json",
                true
            ),

            loadJson(
                "data/title-reigns.json",
                false
            ),

            loadJson(
                "data/wrestlers.json",
                false
            ),

            loadJson(
                "data/teams.json",
                false
            ),

            loadJson(
                "data/matches.json",
                false
            )

        ]);



        // =================================
        // NORMALIZE DATABASE SHAPES
        // =================================

        function extractArray(
            data,
            possibleKeys = []
        ) {

            if (
                Array.isArray(data)
            ) {

                return data;

            }


            if (
                data &&
                typeof data === "object"
            ) {

                for (
                    const key of possibleKeys
                ) {

                    if (
                        Array.isArray(
                            data[key]
                        )
                    ) {

                        return data[key];

                    }

                }

            }


            return [];

        }



        const championships =
            extractArray(
                championshipData,
                [
                    "championships",
                    "titles"
                ]
            );


        const reigns =
            extractArray(
                reignData,
                [
                    "reigns",
                    "titleReigns"
                ]
            );


        const wrestlers =
            extractArray(
                wrestlerData,
                [
                    "wrestlers",
                    "roster"
                ]
            );


        const teams =
            extractArray(
                teamData,
                [
                    "teams"
                ]
            );


        const matches =
            extractArray(
                matchData,
                [
                    "matches"
                ]
            );



        if (
            championships.length === 0
        ) {

            throw new Error(
                "Championship database loaded, but no championships were found."
            );

        }



        // =================================
        // PAGE ELEMENTS
        // =================================

        const ascensionGrid =
            document.getElementById(
                "ascension-title-grid"
            );


        const revoltGrid =
            document.getElementById(
                "revolt-title-grid"
            );


        const owlGrid =
            document.getElementById(
                "owl-title-grid"
            );


        const ascensionCount =
            document.getElementById(
                "ascension-title-count"
            );


        const revoltCount =
            document.getElementById(
                "revolt-title-count"
            );


        const owlCount =
            document.getElementById(
                "owl-title-count"
            );


        const emptyState =
            document.getElementById(
                "championship-empty-state"
            );



        if (
            !ascensionGrid ||
            !revoltGrid ||
            !owlGrid ||
            !ascensionCount ||
            !revoltCount ||
            !owlCount
        ) {

            throw new Error(
                "Champions page HTML is missing required elements."
            );

        }



        // =================================
        // CLEAR DEFAULT CONTENT
        // =================================

        ascensionGrid.innerHTML = "";

        revoltGrid.innerHTML = "";

        owlGrid.innerHTML = "";



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



        function getDateValue(
            dateString
        ) {

            if (!dateString) {

                return null;

            }


            return new Date(
                `${dateString}T00:00:00`
            );

        }



        function formatDate(
            dateString
        ) {

            const date =
                getDateValue(
                    dateString
                );


            if (!date) {

                return "";

            }


            return date.toLocaleDateString(
                "en-US",
                {
                    year:
                        "numeric",

                    month:
                        "short",

                    day:
                        "numeric"
                }
            );

        }



        function calculateReignDays(
            reign
        ) {

            if (
                !reign ||
                !reign.wonDate
            ) {

                return "—";

            }


            const startDate =
                getDateValue(
                    reign.wonDate
                );


            const endDate =
                reign.lostDate

                    ? getDateValue(
                        reign.lostDate
                    )

                    : new Date();


            if (
                !startDate ||
                !endDate
            ) {

                return "—";

            }


            const millisecondsPerDay =
                1000 *
                60 *
                60 *
                24;


            return Math.max(

                0,

                Math.floor(

                    (
                        endDate -
                        startDate
                    )

                    /

                    millisecondsPerDay

                )

            );

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



        const teamMap = {};


        teams.forEach(
            team => {

                teamMap[
                    team.id
                ] = team;

            }
        );



        // =================================
        // CURRENT REIGN
        // =================================

        function getCurrentReign(
            championshipId
        ) {

            return reigns

                .filter(
                    reign =>

                        reign.championshipId ===
                            championshipId

                        &&

                        !reign.lostDate
                )

                .sort(
                    (a, b) =>

                        new Date(
                            b.wonDate
                        )

                        -

                        new Date(
                            a.wonDate
                        )
                )[0]

                || null;

        }



        // =================================
        // AUTOMATIC DEFENSE CALCULATION
        // =================================

        function matchFallsWithinReign(
            match,
            reign
        ) {

            if (
                !match ||
                !reign ||
                !match.date ||
                !reign.wonDate
            ) {

                return false;

            }


            if (
                match.date <
                reign.wonDate
            ) {

                return false;

            }


            if (
                reign.lostDate &&
                match.date >
                reign.lostDate
            ) {

                return false;

            }


            return true;

        }



        function calculateDefenseCount(
            reign
        ) {

            if (!reign) {

                return 0;

            }


            return matches.filter(
                match =>

                    match.championshipId ===
                        reign.championshipId

                    &&

                    normalize(
                        match.titleOutcome
                    ) === "retained"

                    &&

                    matchFallsWithinReign(
                        match,
                        reign
                    )
            ).length;

        }



        // =================================
        // HOLDER HELPERS
        // =================================

        function getHolderName(
            reign
        ) {

            if (!reign) {

                return "VACANT";

            }


            if (
                reign.holderType ===
                "team"
            ) {

                const team =
                    teamMap[
                        reign.holderId
                    ];


                return team
                    ? team.name
                    : reign.holderId;

            }


            const wrestler =
                wrestlerMap[
                    reign.holderId
                ];


            return wrestler
                ? wrestler.name
                : reign.holderId;

        }



        function getHolderUrl(
            reign
        ) {

            if (!reign) {

                return "";

            }


            if (
                reign.holderType ===
                "team"
            ) {

                return (
                    "team.html?id=" +
                    encodeURIComponent(
                        reign.holderId
                    )
                );

            }


            return (
                "wrestler.html?id=" +
                encodeURIComponent(
                    reign.holderId
                )
            );

        }



        function getChampionLabel(
            reign
        ) {

            if (!reign) {

                return "STATUS";

            }


            return reign.holderType === "team"

                ? "CURRENT CHAMPIONS"

                : "CURRENT CHAMPION";

        }



        // =================================
        // EVENT LINK
        // =================================

        function createWonAtDisplay(
            reign
        ) {

            if (
                !reign ||
                !reign.wonAt
            ) {

                return "";

            }


            if (
                reign.wonEventId
            ) {

                return `

                    at

                    <a
                        href="event.html?id=${encodeURIComponent(reign.wonEventId)}"
                        class="champion-event-link"
                    >
                        ${reign.wonAt} →
                    </a>

                `;

            }


            return `

                at ${reign.wonAt}

            `;

        }



        // =================================
        // CREATE CHAMPIONSHIP CARD
        // =================================

        function createChampionshipCard(
            championship
        ) {

            const currentReign =
                getCurrentReign(
                    championship.id
                );


            const defenseCount =
                calculateDefenseCount(
                    currentReign
                );


            const holderName =
                getHolderName(
                    currentReign
                );


            const holderUrl =
                getHolderUrl(
                    currentReign
                );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "championship-card";


            card.innerHTML = `

                <a
                    href="title.html?id=${encodeURIComponent(championship.id)}"
                    class="championship-image-link"
                >

                    <div class="championship-card-image">

                        ${
                            championship.image

                                ? `
                                    <img
                                        src="${championship.image}"
                                        alt="${championship.name}"
                                    >
                                `

                                : `
                                    <span>
                                        OWL
                                    </span>
                                `
                        }

                    </div>

                </a>


                <div class="championship-card-body">


                    <div class="championship-card-meta">

                        <span>

                            ${
                                championship.division ||
                                "OWL"
                            }

                        </span>


                        <span>

                            ${
                                championship.type ||
                                "Championship"
                            }

                        </span>

                    </div>


                    <h3>

                        <a
                            href="title.html?id=${encodeURIComponent(championship.id)}"
                        >
                            ${championship.name}
                        </a>

                    </h3>


                    <div class="champion-display">


                        <span class="champion-label">

                            ${getChampionLabel(currentReign)}

                        </span>


                        ${
                            currentReign

                                ? `
                                    <a
                                        href="${holderUrl}"
                                        class="champion-name"
                                    >
                                        ${holderName}
                                    </a>
                                `

                                : `
                                    <strong
                                        class="champion-name vacant"
                                    >
                                        VACANT
                                    </strong>
                                `
                        }


                        ${
                            currentReign

                                ? `
                                    <p class="champion-won">

                                        Won
                                        ${formatDate(currentReign.wonDate)}

                                        ${createWonAtDisplay(currentReign)}

                                    </p>


                                    <div class="champion-stat-row">


                                        <span>

                                            <strong>

                                                ${calculateReignDays(currentReign)}

                                            </strong>

                                            Days

                                        </span>


                                        <span>

                                            <strong>

                                                ${defenseCount}

                                            </strong>

                                            ${
                                                defenseCount === 1

                                                    ? "Defense"

                                                    : "Defenses"
                                            }

                                        </span>


                                    </div>
                                `

                                : `
                                    <p class="champion-won">

                                        No active reign.

                                    </p>
                                `
                        }


                    </div>


                    <a
                        href="title.html?id=${encodeURIComponent(championship.id)}"
                        class="view-title-link"
                    >

                        View Championship →

                    </a>


                </div>

            `;


            return card;

        }



        // =================================
        // BRAND DETECTION
        // =================================

        function getChampionshipBrand(
            championship
        ) {

            return normalize(

                championship.brand ||

                championship.show ||

                championship.roster ||

                ""

            );

        }



        // =================================
        // SPLIT CHAMPIONSHIPS
        // =================================

        const ascensionTitles =
            championships.filter(
                championship =>

                    getChampionshipBrand(
                        championship
                    ) === "ascension"
            );



        const revoltTitles =
            championships.filter(
                championship =>

                    getChampionshipBrand(
                        championship
                    ) === "revolt"
            );



        const owlTitles =
            championships.filter(
                championship => {

                    const brand =
                        getChampionshipBrand(
                            championship
                        );


                    return (

                        brand !== "ascension"

                        &&

                        brand !== "revolt"

                    );

                }
            );



        // =================================
        // COUNTS
        // =================================

        function formatCount(
            count
        ) {

            return `${count} ${
                count === 1

                    ? "Championship"

                    : "Championships"
            }`;

        }



        ascensionCount.textContent =
            formatCount(
                ascensionTitles.length
            );


        revoltCount.textContent =
            formatCount(
                revoltTitles.length
            );


        owlCount.textContent =
            formatCount(
                owlTitles.length
            );



        // =================================
        // RENDER ASCENSION
        // =================================

        ascensionTitles.forEach(
            championship => {

                ascensionGrid.appendChild(

                    createChampionshipCard(
                        championship
                    )

                );

            }
        );



        // =================================
        // RENDER REVOLT
        // =================================

        revoltTitles.forEach(
            championship => {

                revoltGrid.appendChild(

                    createChampionshipCard(
                        championship
                    )

                );

            }
        );



        // =================================
        // RENDER SHARED OWL TITLES
        // =================================

        owlTitles.forEach(
            championship => {

                owlGrid.appendChild(

                    createChampionshipCard(
                        championship
                    )

                );

            }
        );



        // =================================
        // EMPTY STATE
        // =================================

        if (emptyState) {

            emptyState.hidden =
                championships.length !== 0;

        }


        console.log(
            "Champions page loaded:",
            {
                total:
                    championships.length,

                ascension:
                    ascensionTitles.length,

                revolt:
                    revoltTitles.length,

                owl:
                    owlTitles.length
            }
        );

    }


    catch (error) {

        console.error(
            "Could not load Champions page:",
            error
        );


        const page =
            document.querySelector(
                ".champions-page"
            );


        if (page) {

            page.innerHTML = `

                <section class="championship-brand-section">

                    <p class="eyebrow">
                        DATABASE ERROR
                    </p>

                    <h1>
                        Champions Page Could Not Load
                    </h1>

                    <p class="empty-message">

                        The championship database
                        could not be rendered.

                    </p>

                </section>

            `;

        }

    }

}



loadChampionsPage();
