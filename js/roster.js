const wrestlers = await response.json();



        // ROSTER CONTAINERS

const ascensionRoster =
document.getElementById(
"ascension-roster"
@@ -31,13 +34,60 @@ async function loadRoster() {
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


        let unassignedCount = 0;

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



@@ -57,7 +107,7 @@ async function loadRoster() {
function createWrestlerCard(wrestler) {


            // LINK TO PROFILE
            // PROFILE LINK

const link =
document.createElement("a");
@@ -72,21 +122,66 @@ async function loadRoster() {



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
                document.createElement("article");
                document.createElement(
                    "article"
                );


card.className =
"wrestler-card roster-wrestler-card";



            // PORTRAIT AREA
            // PORTRAIT

const portrait =
                document.createElement("div");
                document.createElement(
                    "div"
                );


portrait.className =
@@ -96,7 +191,9 @@ async function loadRoster() {
if (wrestler.photo) {

const image =
                    document.createElement("img");
                    document.createElement(
                        "img"
                    );


image.src =
@@ -107,21 +204,29 @@ async function loadRoster() {
wrestler.name;


                portrait.appendChild(image);
                portrait.appendChild(
                    image
                );

            } else {
            }

            else {

portrait.textContent =
                    getInitials(wrestler.name);
                    getInitials(
                        wrestler.name
                    );

}



            // INFORMATION AREA
            // INFORMATION

const info =
                document.createElement("div");
                document.createElement(
                    "div"
                );


info.className =
@@ -132,7 +237,9 @@ async function loadRoster() {
// NAME

const name =
                document.createElement("h3");
                document.createElement(
                    "h3"
                );


name.textContent =
@@ -148,7 +255,9 @@ async function loadRoster() {
if (wrestler.nickname) {

const nickname =
                    document.createElement("p");
                    document.createElement(
                        "p"
                    );


nickname.className =
@@ -159,47 +268,64 @@ async function loadRoster() {
`"${wrestler.nickname}"`;


                info.appendChild(nickname);
                info.appendChild(
                    nickname
                );

}



            // HOMETOWN
            // HOMETOWN + FLAG

if (wrestler.hometown) {

    const hometown =
        document.createElement("p");
                const hometown =
                    document.createElement(
                        "p"
                    );


    hometown.className =
        "roster-hometown";
                hometown.className =
                    "roster-hometown";


    if (wrestler.flag) {
                if (wrestler.flag) {

        hometown.textContent =
            `${wrestler.hometown} ${wrestler.flag}`;
                    hometown.textContent =
                        `${wrestler.hometown} ${wrestler.flag}`;

    } else {
                }

        hometown.textContent =
            wrestler.hometown;
                else {

    }
                    hometown.textContent =
                        wrestler.hometown;

                }

    info.appendChild(hometown);

}
                info.appendChild(
                    hometown
                );

            }


            card.appendChild(portrait);

            card.appendChild(info);
            card.appendChild(
                portrait
            );


            card.appendChild(
                info
            );


            link.appendChild(card);
            link.appendChild(
                card
            );


return link;
@@ -208,61 +334,307 @@ async function loadRoster() {



        // CREATE THE ROSTER

wrestlers.forEach(wrestler => {


const card =
                createWrestlerCard(wrestler);
                createWrestlerCard(
                    wrestler
                );


const brand =
                wrestler.brand
                    ? wrestler.brand.toLowerCase()
                    : "";
                normalize(
                    wrestler.brand
                );


if (brand === "ascension") {

                ascensionRoster.appendChild(card);
                ascensionRoster.appendChild(
                    card
                );

}

else if (brand === "revolt") {

                revoltRoster.appendChild(card);
                revoltRoster.appendChild(
                    card
                );

}

else {

                unassignedRoster.appendChild(card);

                unassignedCount++;
                unassignedRoster.appendChild(
                    card
                );

}

});



        if (unassignedCount > 0) {
        function matchesActiveFilter(card) {


            switch (activeFilter) {


            unassignedSection.hidden = false;
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


        document.querySelector("main").innerHTML += `
        document.querySelector(
            "main"
        ).innerHTML += `

           <section class="section">

@@ -281,4 +653,5 @@ async function loadRoster() {
}



loadRoster();
