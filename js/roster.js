async function loadRoster() {

    try {

        const response = await fetch(
            "data/wrestlers.json",
            {
                cache: "no-store"
            }
        );


        const wrestlers = await response.json();



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
