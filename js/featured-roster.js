async function loadFeaturedRoster() {

    try {


        // =================================
        // LOAD DATABASES
        // =================================


        const [
            wrestlerResponse,
            matchResponse,
            reignResponse
        ] = await Promise.all([

            fetch(
                "data/wrestlers.json",
                {
                    cache: "no-store"
                }
            ),

            fetch(
                "data/matches.json",
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
            !wrestlerResponse.ok ||
            !matchResponse.ok ||
            !reignResponse.ok
        ) {

            throw new Error(
                "Could not load Featured Roster databases."
            );

        }



        const wrestlers =
            await wrestlerResponse.json();


        const matches =
            await matchResponse.json();


        const reigns =
            await reignResponse.json();



        // =================================
        // PAGE ELEMENT
        // =================================


        const featuredGrid =
            document.getElementById(
                "home-featured-roster"
            );


        if (!featuredGrid) {

            return;

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
        // DATE HELPER
        // =================================


        function getDateValue(
            dateString
        ) {


            if (!dateString) {

                return 0;

            }


            return new Date(
                `${dateString}T00:00:00`
            ).getTime();

        }



        // =================================
        // CURRENT WORLD CHAMPION
        // =================================


        const worldChampionReign =
            reigns

                .filter(
                    reign =>

                        reign.championshipId ===
                            "owl-world-championship"

                        &&

                        reign.holderType ===
                            "wrestler"

                        &&

                        !reign.lostDate
                )

                .sort(
                    (a, b) =>

                        getDateValue(
                            b.wonDate
                        )

                        -

                        getDateValue(
                            a.wonDate
                        )
                )[0]

                || null;



        // =================================
        // RECENT WRESTLER ACTIVITY
        // =================================


        const wrestlerActivity = {};



        matches.forEach(
            match => {


                if (
                    !Array.isArray(
                        match.sides
                    )
                ) {

                    return;

                }


                match.sides.forEach(
                    side => {


                        if (
                            !Array.isArray(
                                side.wrestlers
                            )
                        ) {

                            return;

                        }


                        side.wrestlers.forEach(
                            wrestlerId => {


                                const matchDate =
                                    getDateValue(
                                        match.date
                                    );


                                if (
                                    !wrestlerActivity[
                                        wrestlerId
                                    ]

                                    ||

                                    matchDate >
                                    wrestlerActivity[
                                        wrestlerId
                                    ]
                                ) {


                                    wrestlerActivity[
                                        wrestlerId
                                    ] =
                                        matchDate;

                                }

                            }
                        );

                    }
                );

            }
        );



        // =================================
        // BUILD FEATURED LIST
        // =================================


        const featuredIds = [];



        // SLOT 1:
        // CURRENT WORLD CHAMPION


        if (
            worldChampionReign &&
            wrestlerMap[
                worldChampionReign.holderId
            ]
        ) {


            featuredIds.push(
                worldChampionReign.holderId
            );

        }



        // SLOTS 2–3:
        // MOST RECENTLY ACTIVE


        const recentWrestlerIds =
            Object.keys(
                wrestlerActivity
            )

                .filter(
                    wrestlerId =>

                        wrestlerMap[
                            wrestlerId
                        ]
                )

                .sort(
                    (a, b) =>

                        wrestlerActivity[b]
                        -
                        wrestlerActivity[a]
                );



        recentWrestlerIds.forEach(
            wrestlerId => {


                if (
                    featuredIds.length >= 3
                ) {

                    return;

                }


                if (
                    !featuredIds.includes(
                        wrestlerId
                    )
                ) {


                    featuredIds.push(
                        wrestlerId
                    );

                }

            }
        );



        // =================================
        // FALLBACK
        // =================================


        wrestlers.forEach(
            wrestler => {


                if (
                    featuredIds.length >= 3
                ) {

                    return;

                }


                if (
                    !featuredIds.includes(
                        wrestler.id
                    )
                ) {


                    featuredIds.push(
                        wrestler.id
                    );

                }

            }
        );



        // =================================
        // CARD HELPERS
        // =================================


        function getInitials(
            name
        ) {


            return String(
                name || ""
            )

                .split(" ")

                .filter(Boolean)

                .map(
                    word =>
                        word.charAt(0)
                )

                .slice(
                    0,
                    2
                )

                .join("")

                .toUpperCase();

        }



        function getCardTag(
            wrestler,
            index
        ) {


            if (
                index === 0 &&
                worldChampionReign &&
                wrestler.id ===
                    worldChampionReign.holderId
            ) {

                return "WORLD CHAMPION";

            }


            if (wrestler.team) {

                return wrestler.team;

            }


            if (wrestler.faction) {

                return wrestler.faction;

            }


            if (wrestler.brand) {

                return wrestler.brand;

            }


            return "FEATURED";

        }



        function getSubtitle(
            wrestler
        ) {


            if (wrestler.hometown) {

                return wrestler.hometown;

            }


            if (wrestler.country) {

                return wrestler.country;

            }


            if (wrestler.division) {

                return wrestler.division;

            }


            return "OWL Wrestling";

        }



        // =================================
        // RENDER CARDS
        // =================================


        featuredGrid.innerHTML =
            "";



        featuredIds

            .slice(
                0,
                3
            )

            .forEach(
                (
                    wrestlerId,
                    index
                ) => {


                    const wrestler =
                        wrestlerMap[
                            wrestlerId
                        ];


                    if (!wrestler) {

                        return;

                    }


                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "wrestler-card home-featured-wrestler";


                    card.innerHTML = `

                        <a
                            href="wrestler.html?id=${encodeURIComponent(wrestler.id)}"
                            class="home-featured-portrait"
                            aria-label="View ${wrestler.name}"
                        >

                            ${
                                wrestler.photo

                                    ? `
                                        <img
                                            src="${wrestler.photo}"
                                            alt="${wrestler.name}"
                                        >
                                    `

                                    : `
                                        <div class="portrait-placeholder">

                                            ${getInitials(wrestler.name)}

                                        </div>
                                    `
                            }

                        </a>


                        <div class="home-featured-info">


                            <span class="tag">

                                ${getCardTag(
                                    wrestler,
                                    index
                                )}

                            </span>


                            <h3>

                                <a
                                    href="wrestler.html?id=${encodeURIComponent(wrestler.id)}"
                                >
                                    ${wrestler.name}
                                </a>

                            </h3>


                            <p>

                                ${getSubtitle(wrestler)}

                            </p>


                        </div>

                    `;


                    featuredGrid.appendChild(
                        card
                    );

                }
            );



        console.log(
            "Featured Roster loaded:",
            featuredIds
        );


    }


    catch (error) {


        console.error(
            "Could not load Featured Roster:",
            error
        );

    }

}



loadFeaturedRoster();
