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

            holderType =
                "wrestler";


            matchHistoryId =
                "match-history";


            sectionClass =
                "profile-section";

        }


        else if (
            currentPage === "team.html"
        ) {

            holderType =
                "team";


            matchHistoryId =
                "team-match-history";


            sectionClass =
                "team-section";

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
            reignResponse
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
            )

        ]);


        if (
            !championshipResponse.ok ||
            !reignResponse.ok
        ) {

            throw new Error(
                "Could not load championship history databases."
            );

        }


        const championships =
            await championshipResponse.json();


        const reigns =
            await reignResponse.json();



        // =================================
        // FIND THIS PROFILE'S REIGNS
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


        if (
            holderReigns.length === 0
        ) {

            return;

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



        // =================================
        // DATE HELPERS
        // =================================


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


            if (!reign.wonDate) {

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
        // CREATE SECTION
        // =================================


        if (
            document.getElementById(
                "automatic-championship-history"
            )
        ) {

            return;

        }


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


        if (!matchHistory) {

            return;

        }


        const matchHistorySection =
            matchHistory.closest(
                "section"
            );


        if (!matchHistorySection) {

            return;

        }


        matchHistorySection.parentNode.insertBefore(
            section,
            matchHistorySection
        );



        // =================================
        // RENDER CHAMPIONSHIP GROUPS
        // =================================


        const historyGrid =
            document.getElementById(
                "championship-history-grid"
            );


        const championshipIds =
            Object.keys(
                reignGroups
            );


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

                    return bHasCurrent -
                        aHasCurrent;

                }


                const aName =
                    championshipMap[a]
                        ? championshipMap[a].name
                        : a;


                const bName =
                    championshipMap[b]
                        ? championshipMap[b].name
                        : b;


                return aName.localeCompare(
                    bName
                );

            }
        );



        championshipIds.forEach(
            championshipId => {


                const championship =
                    championshipMap[
                        championshipId
                    ];


                const championshipName =
                    championship
                        ? championship.name
                        : championshipId;


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



                titleReigns.forEach(
                    (reign, index) => {


                        const reignItem =
                            document.createElement(
                                "div"
                            );


                        reignItem.className =
                            "championship-reign-item";


                        const defenseCount =

                            reign.defenses !== null &&
                            reign.defenses !== undefined

                                ? reign.defenses

                                : 0;


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


                            ${
                                reign.wonAt

                                    ? `
                                        <p class="championship-reign-event">
                                            Won at ${reign.wonAt}
                                        </p>
                                    `

                                    : ""
                            }


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


    }


    catch (error) {


        console.error(
            "Could not load automatic championship history:",
            error
        );

    }

}



loadAutomaticChampionshipHistory();
