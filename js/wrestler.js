async function loadWrestlerProfile() {

    try {


        // ---------------------------------
        // GET WRESTLER ID FROM URL
        // ---------------------------------

        const params =
            new URLSearchParams(
                window.location.search
            );


        const wrestlerId =
            params.get("id");



        // ---------------------------------
        // LOAD DATABASES
        // ---------------------------------

        const wrestlerResponse =
            await fetch(
                "data/wrestlers.json",
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
            !matchResponse.ok
        ) {

            throw new Error(
                "Could not load OWL database files."
            );

        }


        const wrestlers =
            await wrestlerResponse.json();


        const matches =
            await matchResponse.json();



        // ---------------------------------
        // FIND CURRENT WRESTLER
        // ---------------------------------

        const wrestler =
            wrestlers.find(
                person =>
                    person.id === wrestlerId
            );


        if (!wrestler) {

            document.querySelector(
                ".profile-page"
            ).innerHTML = `

                <section class="profile-section">

                    <h1>
                        Wrestler Not Found
                    </h1>

                    <p>
                        This wrestler does not exist
                        in the OWL database.
                    </p>

                </section>

            `;

            return;

        }



        // ---------------------------------
        // WRESTLER NAME LOOKUP
        // ---------------------------------

        const wrestlerNameMap = {};


        wrestlers.forEach(person => {

            wrestlerNameMap[
                person.id
            ] = person.name;

        });



        // ---------------------------------
        // PAGE TITLE
        // ---------------------------------

        document.title =
            `${wrestler.name} | OWL Wrestling`;



        // ---------------------------------
        // NAME
        // ---------------------------------

        document.getElementById(
            "wrestler-name"
        ).textContent =
            wrestler.name;



        // ---------------------------------
        // NICKNAME
        // ---------------------------------

        const nicknameElement =
            document.getElementById(
                "wrestler-nickname"
            );


        if (wrestler.nickname) {

            nicknameElement.textContent =
                `"${wrestler.nickname}"`;


            nicknameElement.hidden =
                false;

        }



        // ---------------------------------
        // HOMETOWN + FLAG
        // ---------------------------------

        const hometownElement =
            document.getElementById(
                "wrestler-hometown"
            );


        if (wrestler.flag) {

            hometownElement.textContent =
                `${wrestler.hometown} ${wrestler.flag}`;

        }

        else {

            hometownElement.textContent =
                wrestler.hometown || "";

        }



        // ---------------------------------
        // PHOTO
        // ---------------------------------

        if (wrestler.photo) {

            const photo =
                document.getElementById(
                    "wrestler-photo"
                );


            photo.src =
                wrestler.photo;


            photo.alt =
                wrestler.name;


            photo.hidden =
                false;


            document.getElementById(
                "photo-placeholder"
            ).hidden = true;

        }



        // ---------------------------------
        // CURRENT CHAMPIONSHIP
        // ---------------------------------

        const currentTitleElement =
            document.getElementById(
                "current-title"
            );


        if (wrestler.currentTitle) {

            currentTitleElement.textContent =
                wrestler.currentTitle;


            currentTitleElement.hidden =
                false;

        }



        // ---------------------------------
        // FINISHER
        // ---------------------------------

        if (wrestler.finisher) {

            document.getElementById(
                "finisher"
            ).textContent =
                wrestler.finisher;

        }



        // ---------------------------------
        // SIGNATURE MOVES
        // ---------------------------------

        const signatureList =
            document.getElementById(
                "signature-moves"
            );


        if (
            wrestler.signatureMoves &&
            wrestler.signatureMoves.length > 0
        ) {

            wrestler.signatureMoves.forEach(
                move => {


                    const item =
                        document.createElement(
                            "li"
                        );


                    item.textContent =
                        move;


                    signatureList.appendChild(
                        item
                    );

                }
            );

        }

        else {

            const item =
                document.createElement(
                    "li"
                );


            item.textContent =
                "Signature moves not entered yet.";


            signatureList.appendChild(
                item
            );

        }



        // ---------------------------------
        // WHY I'M HERE
        // ---------------------------------

        if (wrestler.whyImHere) {

            document.getElementById(
                "why-im-here"
            ).textContent =
                wrestler.whyImHere;

        }



        // ---------------------------------
        // TEAM / FACTION
        // ---------------------------------

        const affiliations = [];


        if (wrestler.team) {

            affiliations.push(`

                <div class="affiliation-item">

                    <span>
                        TEAM
                    </span>

                    <strong>
                        ${wrestler.team}
                    </strong>

                </div>

            `);

        }


        if (wrestler.faction) {

            affiliations.push(`

                <div class="affiliation-item">

                    <span>
                        FACTION
                    </span>

                    <strong>
                        ${wrestler.faction}
                    </strong>

                </div>

            `);

        }


        if (affiliations.length > 0) {

            document.getElementById(
                "affiliation-content"
            ).innerHTML =
                affiliations.join("");


            document.getElementById(
                "affiliation-section"
            ).hidden = false;

        }



        // ---------------------------------
        // CHAMPIONSHIPS HELD
        // ---------------------------------

        if (
            wrestler.championshipsHeld &&
            wrestler.championshipsHeld.length > 0
        ) {

            const championshipContainer =
                document.getElementById(
                    "championship-history"
                );


            wrestler.championshipsHeld.forEach(
                title => {


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "accomplishment-item";


                    item.textContent =
                        title;


                    championshipContainer.appendChild(
                        item
                    );

                }
            );


            document.getElementById(
                "championship-history-section"
            ).hidden = false;

        }



        // ---------------------------------
        // YEAR-END AWARDS
        // ---------------------------------

        if (
            wrestler.awards &&
            wrestler.awards.length > 0
        ) {

            const awardsContainer =
                document.getElementById(
                    "awards-list"
                );


            wrestler.awards.forEach(
                award => {


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "accomplishment-item";


                    item.textContent =
                        award;


                    awardsContainer.appendChild(
                        item
                    );

                }
            );


            document.getElementById(
                "awards-section"
            ).hidden = false;

        }



        // =================================
        // MATCH RESULT HELPERS
        // =================================


        function getMatchResultType(match) {


            const resultType =
                String(
                    match.resultType || ""
                )
                    .trim()
                    .toLowerCase();


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



        function findWrestlerSide(
            match,
            targetWrestlerId
        ) {


            return match.sides.findIndex(
                side =>
                    side.wrestlers.includes(
                        targetWrestlerId
                    )
            );

        }



        function getWrestlerOutcome(
            match,
            targetWrestlerId
        ) {


            const resultType =
                getMatchResultType(
                    match
                );


            if (
                resultType === "no-contest"
            ) {

                return "no-contest";

            }


            if (
                resultType === "draw"
            ) {

                return "draw";

            }


            const wrestlerSide =
                findWrestlerSide(
                    match,
                    targetWrestlerId
                );


            if (wrestlerSide === -1) {

                return "not-in-match";

            }


            if (
                wrestlerSide ===
                match.winnerSide
            ) {

                return "win";

            }


            return "loss";

        }



        // =================================
        // FIND THIS WRESTLER'S MATCHES
        // =================================


        const wrestlerMatches =
            matches.filter(
                match => {


                    return match.sides.some(
                        side =>
                            side.wrestlers.includes(
                                wrestler.id
                            )
                    );

                }
            );



        // =================================
        // RECORD CALCULATOR
        // =================================


        function calculateRecord(
            matchList
        ) {


            let wins = 0;

            let losses = 0;

            let draws = 0;


            matchList.forEach(
                match => {


                    const outcome =
                        getWrestlerOutcome(
                            match,
                            wrestler.id
                        );


                    if (
                        outcome === "win"
                    ) {

                        wins++;

                    }


                    else if (
                        outcome === "loss"
                    ) {

                        losses++;

                    }


                    else if (
                        outcome === "draw"
                    ) {

                        draws++;

                    }


                    // NO CONTESTS DO NOT
                    // CHANGE W-L-D RECORD


                }
            );


            return `${wins}-${losses}-${draws}`;

        }



        // ---------------------------------
        // OVERALL RECORD
        // ---------------------------------

        document.getElementById(
            "overall-record"
        ).textContent =
            calculateRecord(
                wrestlerMatches
            );



        // ---------------------------------
        // PPV RECORD
        // ---------------------------------

        const ppvMatches =
            wrestlerMatches.filter(
                match => {


                    return (
                        String(
                            match.eventType || ""
                        )
                            .toLowerCase()
                        === "ppv"
                    );

                }
            );


        document.getElementById(
            "ppv-record"
        ).textContent =
            calculateRecord(
                ppvMatches
            );



        // =================================
        // MATCH DISPLAY HELPERS
        // =================================


        function formatMatchSide(side) {


            return side.wrestlers

                .map(
                    id =>
                        wrestlerNameMap[id]
                        || id
                )

                .join(" & ");

        }



        function formatFullMatch(match) {


            return match.sides

                .map(
                    side =>
                        formatMatchSide(
                            side
                        )
                )

                .join(" vs. ");

        }



        function formatFinish(match) {


            const resultType =
                getMatchResultType(
                    match
                );


            if (
                resultType === "no-contest"
            ) {

                return "No Contest";

            }


            if (
                resultType === "draw"
            ) {

                return "Draw";

            }



            // NEW DETAILED FINISH FORMAT

            if (match.finish) {


                const winnerName =
                    wrestlerNameMap[
                        match.finish.winner
                    ];


                const loserName =
                    wrestlerNameMap[
                        match.finish.loser
                    ];


                const method =
                    match.finish.method || "";


                if (
                    winnerName &&
                    loserName &&
                    method
                ) {

                    return (
                        `${winnerName} defeated ` +
                        `${loserName} by ${method}`
                    );

                }


                if (method) {

                    return method;

                }

            }



            // SUPPORT OLDER TEST DATA

            if (match.resultMethod) {

                return match.resultMethod;

            }


            return "";

        }



        // =================================
        // MATCH HISTORY
        // =================================


        const history =
            document.getElementById(
                "match-history"
            );


        if (
            wrestlerMatches.length === 0
        ) {

            document.getElementById(
                "no-matches"
            ).hidden = false;


            document.querySelector(
                ".match-table"
            ).hidden = true;


            return;

        }



        // NEWEST MATCHES FIRST

        wrestlerMatches.sort(
            (a, b) =>
                new Date(b.date)
                -
                new Date(a.date)
        );



        wrestlerMatches.forEach(
            match => {


                const outcome =
                    getWrestlerOutcome(
                        match,
                        wrestler.id
                    );


                let result =
                    "LOSS";


                if (
                    outcome === "win"
                ) {

                    result =
                        "WIN";

                }


                else if (
                    outcome === "draw"
                ) {

                    result =
                        "DRAW";

                }


                else if (
                    outcome === "no-contest"
                ) {

                    result =
                        "NC";

                }



                const fixtureText =
                    formatFullMatch(
                        match
                    );


                const finishText =
                    formatFinish(
                        match
                    );


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${match.date}
                    </td>


                    <td>
                        ${match.event}
                    </td>


                    <td>

                        <strong>
                            ${match.matchType}
                        </strong>

                        <br>

                        <span class="opponent-text">
                            ${fixtureText}
                        </span>


                        ${
                            finishText

                                ? `

                                    <br>

                                    <span class="finish-text">
                                        ${finishText}
                                    </span>

                                `

                                : ""
                        }

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


                history.appendChild(
                    row
                );


            }
        );


    }


    catch (error) {


        console.error(
            "Could not load wrestler profile:",
            error
        );


        const profilePage =
            document.querySelector(
                ".profile-page"
            );


        if (profilePage) {

            profilePage.innerHTML = `

                <section class="profile-section">

                    <h1>
                        Profile Could Not Load
                    </h1>

                    <p>
                        There was a problem loading
                        the OWL wrestler database.
                    </p>

                </section>

            `;

        }


    }

}



loadWrestlerProfile();
