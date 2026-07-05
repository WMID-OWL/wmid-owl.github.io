async function loadWrestlerProfile() {

    try {

        // Read wrestler ID from URL
        const params = new URLSearchParams(window.location.search);
        const wrestlerId = params.get("id");


        // Load wrestler and match data
        const wrestlerResponse = await fetch("data/wrestlers.json");
        const matchResponse = await fetch("data/matches.json");

        const wrestlers = await wrestlerResponse.json();
        const matches = await matchResponse.json();


        // Find wrestler
        const wrestler = wrestlers.find(
            person => person.id === wrestlerId
        );


        if (!wrestler) {

            document.querySelector(".profile-page").innerHTML = `
                <section class="profile-section">
                    <h1>Wrestler Not Found</h1>
                    <p>This wrestler does not exist in the OWL database.</p>
                </section>
            `;

            return;
        }


        // Change browser tab title
        document.title =
            `${wrestler.name} | OWL Wrestling`;


        // NAME
        document.getElementById(
            "wrestler-name"
        ).textContent = wrestler.name;


        // NICKNAME
        const nickname = document.getElementById(
            "wrestler-nickname"
        );

        if (wrestler.nickname) {

            nickname.textContent =
                `"${wrestler.nickname}"`;

            nickname.hidden = false;
        }


        // HOMETOWN + COUNTRY FLAG

const hometownElement =
    document.getElementById(
        "wrestler-hometown"
    );


if (wrestler.flag) {

    hometownElement.textContent =
        `${wrestler.hometown} ${wrestler.flag}`;

} else {

    hometownElement.textContent =
        wrestler.hometown;

}

        // PHOTO
        if (wrestler.photo) {

            const photo =
                document.getElementById("wrestler-photo");

            photo.src = wrestler.photo;
            photo.alt = wrestler.name;

            photo.hidden = false;

            document.getElementById(
                "photo-placeholder"
            ).hidden = true;
        }


        // CURRENT CHAMPIONSHIP
        const currentTitle =
            document.getElementById("current-title");

        if (wrestler.currentTitle) {

            currentTitle.textContent =
                wrestler.currentTitle;

            currentTitle.hidden = false;
        }


        // FINISHER
        if (wrestler.finisher) {

            document.getElementById(
                "finisher"
            ).textContent = wrestler.finisher;
        }


        // SIGNATURE MOVES
        const signatureList =
            document.getElementById("signature-moves");

        if (
            wrestler.signatureMoves &&
            wrestler.signatureMoves.length > 0
        ) {

            wrestler.signatureMoves.forEach(move => {

                const item =
                    document.createElement("li");

                item.textContent = move;

                signatureList.appendChild(item);
            });

        } else {

            const item =
                document.createElement("li");

            item.textContent =
                "Signature moves not entered yet.";

            signatureList.appendChild(item);
        }


        // WHY I'M HERE
        if (wrestler.whyImHere) {

            document.getElementById(
                "why-im-here"
            ).textContent = wrestler.whyImHere;
        }


        // TEAM / FACTION
        const affiliations = [];

        if (wrestler.team) {

            affiliations.push(
                `<div class="affiliation-item">
                    <span>TEAM</span>
                    <strong>${wrestler.team}</strong>
                </div>`
            );
        }

        if (wrestler.faction) {

            affiliations.push(
                `<div class="affiliation-item">
                    <span>FACTION</span>
                    <strong>${wrestler.faction}</strong>
                </div>`
            );
        }

        if (affiliations.length > 0) {

            document.getElementById(
                "affiliation-content"
            ).innerHTML = affiliations.join("");

            document.getElementById(
                "affiliation-section"
            ).hidden = false;
        }


        // CHAMPIONSHIPS HELD
        if (
            wrestler.championshipsHeld &&
            wrestler.championshipsHeld.length > 0
        ) {

            const championshipContainer =
                document.getElementById(
                    "championship-history"
                );

            wrestler.championshipsHeld.forEach(title => {

                const item =
                    document.createElement("div");

                item.className =
                    "accomplishment-item";

                item.textContent = title;

                championshipContainer.appendChild(item);
            });

            document.getElementById(
                "championship-history-section"
            ).hidden = false;
        }


        // AWARDS
        if (
            wrestler.awards &&
            wrestler.awards.length > 0
        ) {

            const awardsContainer =
                document.getElementById(
                    "awards-list"
                );

            wrestler.awards.forEach(award => {

                const item =
                    document.createElement("div");

                item.className =
                    "accomplishment-item";

                item.textContent = award;

                awardsContainer.appendChild(item);
            });

            document.getElementById(
                "awards-section"
            ).hidden = false;
        }


        // FIND MATCHES INVOLVING THIS WRESTLER
        const wrestlerMatches = matches.filter(match => {

            return match.sides.some(side =>
                side.wrestlers.includes(wrestler.id)
            );

        });


        // RECORD CALCULATOR
        function calculateRecord(matchList) {

            let wins = 0;
            let losses = 0;
            let draws = 0;

            matchList.forEach(match => {

                const wrestlerSide =
                    match.sides.findIndex(side =>
                        side.wrestlers.includes(wrestler.id)
                    );


                if (
                    match.winnerSide === null ||
                    match.winnerSide === undefined
                ) {

                    draws++;

                } else if (
                    match.winnerSide === wrestlerSide
                ) {

                    wins++;

                } else {

                    losses++;
                }

            });


            return `${wins}-${losses}-${draws}`;
        }


        // OVERALL RECORD
        document.getElementById(
            "overall-record"
        ).textContent =
            calculateRecord(wrestlerMatches);


        // PPV RECORD
        const ppvMatches =
            wrestlerMatches.filter(match =>
                match.eventType &&
                match.eventType.toLowerCase() === "ppv"
            );


        document.getElementById(
            "ppv-record"
        ).textContent =
            calculateRecord(ppvMatches);


        // MATCH HISTORY
        const history =
            document.getElementById("match-history");


        if (wrestlerMatches.length === 0) {

            document.getElementById(
                "no-matches"
            ).hidden = false;

            document.querySelector(
                ".match-table"
            ).hidden = true;

            return;
        }


        // Newest matches first
        wrestlerMatches.sort(
            (a, b) =>
                new Date(b.date) - new Date(a.date)
        );


        const wrestlerNameMap = {};

        wrestlers.forEach(person => {

            wrestlerNameMap[person.id] =
                person.name;
        });


        wrestlerMatches.forEach(match => {

            const wrestlerSide =
                match.sides.findIndex(side =>
                    side.wrestlers.includes(wrestler.id)
                );


            let result = "LOSS";


            if (
                match.winnerSide === null ||
                match.winnerSide === undefined
            ) {

                result = "DRAW";

            } else if (
                match.winnerSide === wrestlerSide
            ) {

                result = "WIN";
            }


            // Find opponents
            const opponentIds =
                match.sides
                    .filter(
                        (side, index) =>
                            index !== wrestlerSide
                    )
                    .flatMap(
                        side => side.wrestlers
                    );


            const opponentNames =
                opponentIds.map(
                    id =>
                        wrestlerNameMap[id] || id
                );


            const opponentText =
                opponentNames.join(", ");


            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>${match.date}</td>

                <td>
                    ${match.event}
                </td>

                <td>
                    ${match.matchType}<br>
                    <span class="opponent-text">
                        vs. ${opponentText}
                    </span>
                </td>

                <td class="result-${result.toLowerCase()}">
                    ${result}
                </td>

                <td>
    ${
        match.rating !== null &&
        match.rating !== undefined
            ? match.rating + "%"
            : "—"
    }
</td>

<td>
    ${
        match.starRating !== null &&
        match.starRating !== undefined
            ? match.starRating + " ★"
            : "—"
    }
</td>
            `;


            history.appendChild(row);

        });


    } catch (error) {

        console.error(
            "Could not load wrestler profile:",
            error
        );
    }

}


loadWrestlerProfile();
