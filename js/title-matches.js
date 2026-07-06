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
            eventsResponse
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
            )

        ]);


        if (
            !matchesResponse.ok ||
            !wrestlersResponse.ok ||
            !eventsResponse.ok
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
        // HELPERS
        // =================================


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



        function getOutcomeLabel(
            match
        ) {


            const outcome =
                String(
                    match.titleOutcome || ""
                )
                    .trim()
                    .toLowerCase();


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
                String(
                    match.titleOutcome || ""
                )
                    .trim()
                    .toLowerCase();


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
