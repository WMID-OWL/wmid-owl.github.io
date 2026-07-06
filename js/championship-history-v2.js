async function loadAutomaticChampionshipHistory() {

    try {

        // =================================
        // DETERMINE PROFILE TYPE
        // =================================

        const currentPage =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        let holderType = "";
        let matchHistoryId = "";
        let sectionClass = "";


        if (
            currentPage === "wrestler.html"
        ) {

            holderType = "wrestler";
            matchHistoryId = "match-history";
            sectionClass = "profile-section";

        }


        else if (
            currentPage === "team.html"
        ) {

            holderType = "team";
            matchHistoryId = "team-match-history";
            sectionClass = "team-section";

        }


        else {

            return;

        }



        // =================================
        // GET PROFILE ID
        // =================================

        const params =
            new URLSearchParams(
                window.location.search
            );


        const holderId =
            params.get("id");


        if (!holderId) {

            return;

        }



        // =================================
        // LOAD DATABASES
        // =================================

        const [
            championshipResponse,
            reignResponse,
            matchResponse
        ] = await Promise.all([

            fetch(
                "data/championships.json",
                {
                    cache: "no-store"
                }
            ),

            fetch(
                "data/title-reigns.json",
                {
                    cache: "no-store"
                }
            ),

            fetch(
                "data/matches.json",
                {
                    cache: "no-store"
                }
            )

        ]);


        if (
            !championshipResponse.ok ||
            !reignResponse.ok ||
            !matchResponse.ok
        ) {

            throw new Error(
                "Could not load championship history databases."
            );

        }


        const championships =
            await championshipResponse.json();


        const reigns =
            await reignResponse.json();


        const matches =
            await matchResponse.json();



        // =================================
        // HELPERS
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

            return new Date(
                `${dateString}T00:00:00`
            );

        }



        function formatDate(
            dateString
        ) {

            if (!dateString) {

                return "Current";

            }


            return getDateValue(
                dateString
            ).toLocaleDateString(
                "en-US",
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
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


            const millisecondsPerDay =
                1000 * 60 * 60 * 24;


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
        // AUTOMATIC DEFENSE CALCULATION
        // =================================

        function matchFallsWithinReign(
            match,
            reign
        ) {

            if (
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
        // CHAMPIONSHIP LOOKUP
        // =================================

        const championshipMap = {};


        championships.forEach(
            championship => {

                championshipMap[
                    championship.id
                ] = championship;

            }
        );



        function getChampionshipName(
            championshipId
        ) {

            const championship =
                championshipMap[
                    championshipId
                ];


            return championship
                ? championship.name
                : championshipId;

        }



        // =================================
        // FIND PROFILE REIGNS
        // =================================

        const holderReigns =
            reigns.filter(
                reign =>

                    reign.holderType ===
                        holderType

                    &&

                    reign.holderId ===
                        holderId
            );



        // =================================
        // ACTIVE REIGNS
        // =================================

        const activeReigns =
            holderReigns

                .filter(
                    reign =>
                        !reign.lostDate
                )

                .filter(
                    (
                        reign,
                        index,
                        array
                    ) =>

                        array.findIndex(
                            item =>

                                item.championshipId ===
                                    reign.championshipId
                        )
                        === index
                )

                .sort(
                    (a, b) =>

                        getChampionshipName(
                            a.championshipId
                        ).localeCompare(

                            getChampionshipName(
                                b.championshipId
                            )

                        )
                );



        // =================================
        // CURRENT TITLE LINKS
        // =================================

        function createCurrentTitleLinks() {

            return activeReigns

                .map(
                    reign => `

                        <a
                            href="title.html?id=${encodeURIComponent(reign.championshipId)}"
                            class="automatic-current-title-link"
                        >
                            ${getChampionshipName(reign.championshipId)}
                        </a>

                    `
                )

                .join(

                    activeReigns.length > 1

                        ? `
                            <span class="automatic-current-title-divider">
                                •
                            </span>
                        `

                        : ""

                );

        }



        // =================================
        // WRESTLER CURRENT TITLE DISPLAY
        // =================================

        if (
            holderType === "wrestler"
        ) {

            const currentTitleElement =
                document.getElementById(
                    "current-title"
                );


            if (
                currentTitleElement
            ) {

                if (
                    activeReigns.length > 0
                ) {

                    currentTitleElement.innerHTML =
                        createCurrentTitleLinks();


                    currentTitleElement.classList.add(
                        "automatic-current-title-list"
                    );


                    currentTitleElement.hidden =
                        false;

                }


                else {

                    currentTitleElement.innerHTML =
                        "";


                    currentTitleElement.hidden =
                        true;

                }

            }

        }



        // =================================
        // TEAM CURRENT TITLE DISPLAY
        // =================================

        if (
            holderType === "team"
        ) {

            const teamIdentity =
                document.querySelector(
                    ".team-identity"
                );


            const existingDisplay =
                document.getElementById(
                    "automatic-team-title-display"
                );


            if (
                existingDisplay
            ) {

                existingDisplay.remove();

            }


            if (
                teamIdentity &&
                activeReigns.length > 0
            ) {

                const titleDisplay =
                    document.createElement(
                        "div"
                    );


                titleDisplay.id =
                    "automatic-team-title-display";


                titleDisplay.className =
                    "automatic-team-title-display";


                titleDisplay.innerHTML = `

                    <span class="automatic-team-title-label">

                        ${
                            activeReigns.length === 1

                                ? "CURRENT CHAMPIONS"

                                : "CURRENT CHAMPIONSHIPS"
                        }

                    </span>


                    <div class="automatic-team-title-links">

                        ${createCurrentTitleLinks()}

                    </div>

                `;


                const recordGrid =
                    teamIdentity.querySelector(
                        ".record-grid"
                    );


                if (
                    recordGrid
                ) {

                    teamIdentity.insertBefore(
                        titleDisplay,
                        recordGrid
                    );

                }


                else {

                    teamIdentity.appendChild(
                        titleDisplay
                    );

                }

            }

        }



        // =================================
        // STOP IF NO TITLE HISTORY
        // =================================

        if (
            holderReigns.length === 0
        ) {

            return;

        }



        // =================================
        // GROUP REIGNS BY CHAMPIONSHIP
        // =================================

        const reignGroups = {};


        holderReigns.forEach(
            reign => {

                if (
                    !reignGroups[
                        reign.championshipId
                    ]
                ) {

                    reignGroups[
                        reign.championshipId
                    ] = [];

                }


                reignGroups[
                    reign.championshipId
                ].push(
                    reign
                );

            }
        );



        // =================================
        // PREVENT DUPLICATE SECTION
        // =================================

        if (
            document.getElementById(
                "automatic-championship-history"
            )
        ) {

            return;

        }



        // =================================
        // CREATE HISTORY SECTION
        // =================================

        const section =
            document.createElement(
                "section"
            );


        section.id =
            "automatic-championship-history";


        section.className =
            `${sectionClass} automatic-championship-history`;


        section.innerHTML = `

            <p class="eyebrow">
                TITLE DATABASE
            </p>

            <h2>
                Championship History
            </h2>

            <div
                id="championship-history-grid"
                class="championship-history-grid"
            >
            </div>

        `;



        // =================================
        // INSERT BEFORE MATCH HISTORY
        // =================================

        const matchHistory =
            document.getElementById(
                matchHistoryId
            );


        if (
            !matchHistory
        ) {

            return;

        }


        const matchHistorySection =
            matchHistory.closest(
                "section"
            );


        if (
            !matchHistorySection
        ) {

            return;

        }


        matchHistorySection.parentNode.insertBefore(
            section,
            matchHistorySection
        );



        // =================================
        // HISTORY GRID
        // =================================

        const historyGrid =
            document.getElementById(
                "championship-history-grid"
            );


        const championshipIds =
            Object.keys(
                reignGroups
            );



        // =================================
        // SORT CHAMPIONSHIP GROUPS
        // =================================

        championshipIds.sort(
            (a, b) => {

                const aHasCurrent =
                    reignGroups[a].some(
                        reign =>
                            !reign.lostDate
                    );


                const bHasCurrent =
                    reignGroups[b].some(
                        reign =>
                            !reign.lostDate
                    );


                if (
                    aHasCurrent !==
                    bHasCurrent
                ) {

                    return (
                        Number(bHasCurrent)
                        -
                        Number(aHasCurrent)
                    );

                }


                return getChampionshipName(
                    a
                ).localeCompare(

                    getChampionshipName(
                        b
                    )

                );

            }
        );



        // =================================
        // RENDER CHAMPIONSHIP GROUPS
        // =================================

        championshipIds.forEach(
            championshipId => {

                const championshipName =
                    getChampionshipName(
                        championshipId
                    );


                const titleReigns =
                    reignGroups[
                        championshipId
                    ];


                titleReigns.sort(
                    (a, b) =>

                        new Date(b.wonDate)
                        -
                        new Date(a.wonDate)
                );


                const hasCurrentReign =
                    titleReigns.some(
                        reign =>
                            !reign.lostDate
                    );


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "championship-history-card";


                card.innerHTML = `

                    <div class="championship-history-header">

                        <div>

                            <span class="championship-history-count">

                                ${titleReigns.length}

                                ${
                                    titleReigns.length === 1
                                        ? "Reign"
                                        : "Reigns"
                                }

                            </span>


                            <h3>

                                <a
                                    href="title.html?id=${encodeURIComponent(championshipId)}"
                                >
                                    ${championshipName}
                                </a>

                            </h3>

                        </div>


                        ${
                            hasCurrentReign

                                ? `
                                    <span class="current-champion-badge">

                                        ${
                                            holderType === "team"

                                                ? "CURRENT CHAMPIONS"

                                                : "CURRENT CHAMPION"
                                        }

                                    </span>
                                `

                                : ""
                        }

                    </div>


                    <div class="championship-reign-list">
                    </div>

                `;


                const reignList =
                    card.querySelector(
                        ".championship-reign-list"
                    );



                // =================================
                // RENDER INDIVIDUAL REIGNS
                // =================================

                titleReigns.forEach(
                    (
                        reign,
                        index
                    ) => {

                        const reignItem =
                            document.createElement(
                                "div"
                            );


                        reignItem.className =
                            "championship-reign-item";


                        const defenseCount =
                            calculateDefenseCount(
                                reign
                            );


                        const wonAtDisplay =
                            reign.wonAt

                                ? reign.wonEventId

                                    ? `
                                        <p class="championship-reign-event">

                                            Won at

                                            <a
                                                href="event.html?id=${encodeURIComponent(reign.wonEventId)}"
                                            >
                                                ${reign.wonAt} →
                                            </a>

                                        </p>
                                    `

                                    : `
                                        <p class="championship-reign-event">

                                            Won at ${reign.wonAt}

                                        </p>
                                    `

                                : "";


                        reignItem.innerHTML = `

                            <div class="championship-reign-topline">

                                <strong>

                                    ${
                                        titleReigns.length > 1

                                            ? `Reign ${titleReigns.length - index}`

                                            : "Reign"
                                    }

                                </strong>


                                <span>

                                    ${
                                        !reign.lostDate

                                            ? "Current"

                                            : `${calculateReignDays(reign)} Days`
                                    }

                                </span>

                            </div>


                            <p class="championship-reign-dates">

                                ${formatDate(reign.wonDate)}
                                –

                                ${
                                    reign.lostDate

                                        ? formatDate(
                                            reign.lostDate
                                        )

                                        : "Current"
                                }

                            </p>


                            ${wonAtDisplay}


                            <div class="championship-reign-stats">

                                <span>

                                    <strong>
                                        ${calculateReignDays(reign)}
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

                        `;


                        reignList.appendChild(
                            reignItem
                        );

                    }
                );


                historyGrid.appendChild(
                    card
                );

            }
        );


        console.log(
            "Championship History v2 loaded:",
            {
                holderType,
                holderId,
                reigns:
                    holderReigns.length
            }
        );

    }


    catch (error) {

        console.error(
            "Could not load automatic championship history:",
            error
        );

    }

}



loadAutomaticChampionshipHistory();
