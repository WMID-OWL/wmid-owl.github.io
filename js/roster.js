async function loadRoster() {

    try {

        const response = await fetch(
            "data/wrestlers.json",
            {
                cache: "no-store"
            }
        );


        const wrestlers = await response.json();


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


        const unassignedSection =
            document.getElementById(
                "unassigned-section"
            );


        let unassignedCount = 0;



        function getInitials(name) {

            return name
                .split(" ")
                .map(word => word[0])
                .join("")
                .slice(0, 3)
                .toUpperCase();

        }



        function createWrestlerCard(wrestler) {


            // LINK TO PROFILE

            const link =
                document.createElement("a");


            link.href =
                `wrestler.html?id=${encodeURIComponent(wrestler.id)}`;


            link.className =
                "roster-card-link";



            // CARD

            const card =
                document.createElement("article");


            card.className =
                "wrestler-card roster-wrestler-card";



            // PORTRAIT AREA

            const portrait =
                document.createElement("div");


            portrait.className =
                "roster-portrait";


            if (wrestler.photo) {

                const image =
                    document.createElement("img");


                image.src =
                    wrestler.photo;


                image.alt =
                    wrestler.name;


                portrait.appendChild(image);

            } else {

                portrait.textContent =
                    getInitials(wrestler.name);

            }



            // INFORMATION AREA

            const info =
                document.createElement("div");


            info.className =
                "roster-card-info";



            // NAME

            const name =
                document.createElement("h3");


            name.textContent =
                wrestler.name;


            info.appendChild(name);



            // NICKNAME

            if (wrestler.nickname) {

                const nickname =
                    document.createElement("p");


                nickname.className =
                    "roster-nickname";


                nickname.textContent =
                    `"${wrestler.nickname}"`;


                info.appendChild(nickname);

            }



            // HOMETOWN

            if (wrestler.hometown) {

    const hometown =
        document.createElement("p");


    hometown.className =
        "roster-hometown";


    if (wrestler.flag) {

        hometown.textContent =
            `${wrestler.hometown} ${wrestler.flag}`;

    } else {

        hometown.textContent =
            wrestler.hometown;

    }


    info.appendChild(hometown);

}


            card.appendChild(portrait);

            card.appendChild(info);

            link.appendChild(card);


            return link;

        }



        wrestlers.forEach(wrestler => {


            const card =
                createWrestlerCard(wrestler);


            const brand =
                wrestler.brand
                    ? wrestler.brand.toLowerCase()
                    : "";


            if (brand === "ascension") {

                ascensionRoster.appendChild(card);

            }

            else if (brand === "revolt") {

                revoltRoster.appendChild(card);

            }

            else {

                unassignedRoster.appendChild(card);

                unassignedCount++;

            }

        });



        if (unassignedCount > 0) {

            unassignedSection.hidden = false;

        }


    }

    catch (error) {

        console.error(
            "Could not load OWL roster:",
            error
        );


        document.querySelector("main").innerHTML += `

            <section class="section">

                <p class="empty-message">

                    The roster database could not be loaded.

                </p>

            </section>

        `;

    }

}


loadRoster();
