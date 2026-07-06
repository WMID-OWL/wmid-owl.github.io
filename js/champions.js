async function loadChampionsPage() {

    try {


        // =================================
        // LOAD DATABASES
        // =================================


        const [
            championshipResponse,
            reignResponse,
            wrestlerResponse,
            teamResponse
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
            )

        ]);


        if (
            !championshipResponse.ok ||
            !reignResponse.ok ||
            !wrestlerResponse.ok ||
            !teamResponse.ok
        ) {

            throw new Error(
                "Could not load championship databases."
            );

        }


        const championships =
            await championshipResponse.json();


        const reigns =
            await reignResponse.json();


        const wrestlers =
            await wrestlerResponse.json();


        const teams =
            await teamResponse.json();



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

                return "";

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

                        new Date(b.wonDate)
                        -
                        new Date(a.wonDate)
                )[0]

                || null;

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
                reign.holderType === "team"
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
                reign.holderType === "team"
            ) {


                return `team.html?id=${encodeURIComponent(reign.holderId)}`;

            }


            return `wrestler.html?id=${encodeURIComponent(reign.holderId)}`;

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


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "championship-card";



            const holderName =
                getHolderName(
                    currentReign
                );


            const holderUrl =
                getHolderUrl(
                    currentReign
                );


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
                            ${championship.division}
                        </span>

                        <span>
                            ${championship.type}
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

                            ${
                                currentReign
                                    ? "CURRENT CHAMPION"
                                    : "STATUS"
                            }

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
                                    <strong class="champion-name vacant">
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

                                        ${
                                            currentReign.wonAt

                                                ? `
                                                    at
                                                    ${currentReign.wonAt}
                                                `

                                                : ""
                                        }

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

                                                ${
                                                    currentReign.defenses !== null &&
                                                    currentReign.defenses !== undefined

                                                        ? currentReign.defenses

                                                        : 0
                                                }

                                            </strong>

                                            Defenses

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
        // SPLIT CHAMPIONSHIPS BY BRAND
        // =================================


        const ascensionTitles =
            championships.filter(
                championship =>

                    String(
                        championship.brand || ""
                    ).toLowerCase()
                    === "ascension"
            );


        const revoltTitles =
            championships.filter(
                championship =>

                    String(
                        championship.brand || ""
                    ).toLowerCase()
                    === "revolt"
            );


        const owlTitles =
            championships.filter(
                championship => {


                    const brand =
                        String(
                            championship.brand || ""
                        ).toLowerCase();


                    return (
                        brand !== "ascension" &&
                        brand !== "revolt"
                    );

                }
            );



        // =================================
        // RENDER COUNTS
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
        // RENDER CARDS
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


        revoltTitles.forEach(
            championship => {


                revoltGrid.appendChild(
                    createChampionshipCard(
                        championship
                    )
                );

            }
        );


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


        emptyState.hidden =
            championships.length !== 0;


    }


    catch (error) {


        console.error(
            "Could not load Champions page:",
            error
        );


        document.querySelector(
            ".champions-page"
        ).innerHTML = `

            <section class="championship-brand-section">

                <h1>
                    Champions Page Could Not Load
                </h1>

                <p>
                    There was a problem loading
                    the OWL championship database.
                </p>

            </section>

        `;

    }

}



loadChampionsPage();
