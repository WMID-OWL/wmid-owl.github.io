async function loadTitleMatchHistory() {

    try {


        // =================================
        // GET CHAMPIONSHIP ID
        // =================================


        const params =
            new URLSearchParams(
                window.location.search
            );


        const championshipId =
            params.get("id");


        if (!championshipId) {

            return;

        }



        // =================================
        // LOAD DATABASES
        // =================================


        const [
            matchesResponse,
            wrestlersResponse,
            eventsResponse,
            reignsResponse
        ] = await Promise.all([

            fetch(
                "data/matches.json",
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
                "data/events.json",
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
            !matchesResponse.ok ||
            !wrestlersResponse.ok ||
            !eventsResponse.ok ||
            !reignsResponse.ok
        ) {

            throw new Error(
                "Could not load championship match databases."
            );

        }



        const matches =
            await matchesResponse.json();


        const wrestlers =
            await wrestlersResponse.json();


        const events =
            await eventsResponse.json();


        const reigns =
            await reignsResponse.json();



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



        const eventMap = {};


        events.forEach(
            event => {

                eventMap[
                    event.id
                ] = event;

            }
        );



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



        function getWrestlerName(
            wrestlerId
        ) {


            const wrestler =
                wrestlerMap[
                    wrestlerId
                ];


            return wrestler
                ? wrestler.name
                : wrestlerId;

        }



        function formatDate(
            dateString
        ) {


            return new Date(
                `${dateString}T00:00:00`
            ).toLocaleDateString(
                "en-US",
                {
                    year:
                        "numeric",

                    month:
                        "long",

                    day:
                        "numeric"
                }
            );

        }



        function formatSide(
            side
        ) {


            return side.wrestlers

                .map(
                    wrestlerId =>
                        getWrestlerName(
                            wrestlerId
                        )
                )

                .join(" & ");

        }



        function formatMatch(
            match
        ) {


            return match.sides

                .map(
                    side =>
                        formatSide(
                            side
                        )
                )

                .join(" vs. ");

        }



        function getWinnerText(
            match
        ) {


            if (
                match.winnerSide === null ||
                match.winnerSide === undefined
            ) {

                return "Draw";

            }


            const winnerSide =
                match.sides[
                    match.winnerSide
                ];


            return winnerSide

                ? formatSide(
                    winnerSide
                )

                : "—";

        }



        // =================================
        // TITLE OUTCOME HELPERS
        // =================================


        function getOutcomeLabel(
            match
        ) {


            const outcome =
                normalize(
                    match.titleOutcome
                );


            if (
                outcome === "changed"
            ) {

                return "TITLE CHANGE";

            }


            if (
                outcome === "retained"
            ) {

                return "TITLE RETAINED";

            }


            if (
                outcome === "vacated"
            ) {

                return "TITLE VACATED";

            }


            return "TITLE MATCH";

        }



        function getOutcomeClass(
            match
        ) {


            const outcome =
                normalize(
                    match.titleOutcome
                );


            if (
                outcome === "changed"
            ) {

                return "title-outcome-changed";

            }


            if (
                outcome === "retained"
            ) {

                return "title-outcome-retained";

            }


            return "title-outcome-default";

        }



        // =================================
        // FIND TITLE MATCHES
        // =================================


        const titleMatches =
            matches

                .filter(
                    match =>

                        match.championshipId ===
                            championshipId
                )

                .sort(
                    (a, b) =>

                        new Date(
                            `${b.date}T00:00:00`
                        )

                        -

                        new Date(
                            `${a.date}T00:00:00`
                        )
                );



        if (
            titleMatches.length === 0
        ) {

            return;

        }



        // =================================
        // FIND CURRENT REIGN
        // =================================


        const currentReign =
            reigns.find(
                reign =>

                    reign.championshipId ===
                        championshipId

                    &&

                    !reign.lostDate
            ) || null;



        // =================================
        // MATCH WITHIN REIGN
        // =================================


        function matchFallsWithinReign(
            match,
            reign
        ) {


            if (!reign) {

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



        // =================================
        // AUTOMATIC DEFENSE COUNTS
        // =================================


        const currentReignDefenses =
            currentReign

                ? titleMatches.filter(
                    match =>

                        normalize(
                            match.titleOutcome
                        ) === "retained"

                        &&

                        matchFallsWithinReign(
                            match,
                            currentReign
                        )
                ).length

                : 0;



        const titleChanges =
            titleMatches.filter(
                match =>

                    normalize(
                        match.titleOutcome
                    ) === "changed"
            ).length;



        // =================================
        // PAGE ELEMENTS
        // =================================


        const section =
            document.getElementById(
                "title-match-history-section"
            );


        const list =
            document.getElementById(
                "title-match-history-list"
            );


        if (
            !section ||
            !list
        ) {

            return;

        }


        section.hidden =
            false;



        // =================================
        // UPDATE EXISTING DEFENSE DISPLAY
        // =================================


        const currentDefenseElement =
            document.getElementById(
                "current-reign-defenses"
            );


        if (
            currentDefenseElement &&
            currentReign
        ) {

            currentDefenseElement.textContent =
                currentReignDefenses;

        }



        // =================================
        // CREATE AUTOMATIC STATS BAR
        // =================================


        const summaryGrid =
            document.createElement(
                "div"
            );


        summaryGrid.className =
            "title-match-summary-grid";


        summaryGrid.innerHTML = `

            <div class="title-match-summary-card">

                <span>
                    CURRENT REIGN DEFENSES
                </span>

                <strong>

                    ${
                        currentReign
                            ? currentReignDefenses
                            : "—"
                    }

                </strong>

            </div>


            <div class="title-match-summary-card">

                <span>
                    TOTAL TITLE MATCHES
                </span>

                <strong>

                    ${titleMatches.length}

                </strong>

            </div>


            <div class="title-match-summary-card">

                <span>
                    TITLE CHANGES
                </span>

                <strong>

                    ${titleChanges}

                </strong>

            </div>

        `;


        section.insertBefore(
            summaryGrid,
            list
        );



        // =================================
        // RENDER TITLE MATCHES
        // =================================


        titleMatches.forEach(
            match => {


                const event =
                    match.eventId

                        ? eventMap[
                            match.eventId
                        ]

                        : null;


                const eventName =
                    event
                        ? event.name
                        : match.event || "Event";


                const eventLink =
                    match.eventId

                        ? `
                            <a
                                href="event.html?id=${encodeURIComponent(match.eventId)}"
                                class="title-match-event-link"
                            >
                                ${eventName} →
                            </a>
                        `

                        : `
                            <span>
                                ${eventName}
                            </span>
                        `;



                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "title-match-history-card";


                card.innerHTML = `

                    <div class="title-match-history-meta">


                        <span class="title-match-date">

                            ${formatDate(match.date)}

                        </span>


                        ${eventLink}


                    </div>


                    <div class="title-match-history-main">


                        <div class="title-match-history-fixture">


                            <span>

                                ${match.matchType}

                            </span>


                            <h3>

                                ${formatMatch(match)}

                            </h3>


                            <p>

                                Winner:

                                <strong>

                                    ${getWinnerText(match)}

                                </strong>

                            </p>


                        </div>


                        <div class="title-match-history-result">


                            <span
                                class="title-outcome-badge ${getOutcomeClass(match)}"
                            >

                                ${getOutcomeLabel(match)}

                            </span>


                            <div class="title-match-history-ratings">


                                <span>

                                    ${
                                        match.rating !== null &&
                                        match.rating !== undefined

                                            ? `${match.rating}%`

                                            : "—"
                                    }

                                </span>


                                <span>

                                    ${
                                        match.starRating !== null &&
                                        match.starRating !== undefined

                                            ? `${match.starRating} ★`

                                            : "—"
                                    }

                                </span>


                            </div>


                        </div>


                    </div>

                `;


                list.appendChild(
                    card
                );

            }
        );


    }


    catch (error) {


        console.error(
            "Could not load championship match history:",
            error
        );

    }

}



loadTitleMatchHistory();
