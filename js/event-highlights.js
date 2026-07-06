async function loadEventHighlights() {

    try {


        // =================================
        // GET EVENT ID
        // =================================


        const params =
            new URLSearchParams(
                window.location.search
            );


        const eventId =
            params.get("id");


        if (!eventId) {

            return;

        }



        // =================================
        // LOAD DATABASES
        // =================================


        const [
            eventsResponse,
            matchesResponse,
            wrestlersResponse,
            championshipsResponse,
            reignsResponse
        ] = await Promise.all([

            fetch(
                "data/events.json",
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
                "data/wrestlers.json",
                {
                    cache: "no-store"
                }
            ),

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
            !eventsResponse.ok ||
            !matchesResponse.ok ||
            !wrestlersResponse.ok ||
            !championshipsResponse.ok ||
            !reignsResponse.ok
        ) {

            throw new Error(
                "Could not load Event Highlights databases."
            );

        }



        const events =
            await eventsResponse.json();


        const matches =
            await matchesResponse.json();


        const wrestlers =
            await wrestlersResponse.json();


        const championships =
            await championshipsResponse.json();


        const reigns =
            await reignsResponse.json();



        // =================================
        // FIND EVENT
        // =================================


        const event =
            events.find(
                item =>
                    item.id === eventId
            );


        if (!event) {

            return;

        }



        // =================================
        // HELPERS
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



        const wrestlerMap = {};


        wrestlers.forEach(
            wrestler => {

                wrestlerMap[
                    wrestler.id
                ] = wrestler;

            }
        );



        const championshipMap = {};


        championships.forEach(
            championship => {

                championshipMap[
                    championship.id
                ] = championship;

            }
        );



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



        // =================================
        // FIND EVENT MATCHES
        // =================================


        const eventMatches =
            matches.filter(
                match => {


                    if (
                        match.eventId &&
                        match.eventId === event.id
                    ) {

                        return true;

                    }


                    return (

                        match.date === event.date

                        &&

                        normalize(
                            match.event
                        )

                        ===

                        normalize(
                            event.name
                        )

                    );

                }
            );



        // =================================
        // CHAMPIONSHIP CHANGES
        // =================================


        const championshipChangeIds =
            new Set();


        reigns.forEach(
            reign => {


                if (
                    reign.wonEventId === event.id ||
                    reign.lostEventId === event.id
                ) {

                    championshipChangeIds.add(
                        reign.championshipId
                    );

                }

            }
        );



        // =================================
        // HIDE FOR EMPTY / UPCOMING EVENTS
        // =================================


        if (
            eventMatches.length === 0 &&
            championshipChangeIds.size === 0
        ) {

            return;

        }



        // =================================
        // MATCH OF THE NIGHT
        // =================================


        const ratedMatches =
            eventMatches

                .filter(
                    match =>

                        Number.isFinite(
                            Number(
                                match.rating
                            )
                        )
                )

                .sort(
                    (a, b) => {


                        const ratingDifference =

                            Number(
                                b.rating
                            )

                            -

                            Number(
                                a.rating
                            );


                        if (
                            ratingDifference !== 0
                        ) {

                            return ratingDifference;

                        }


                        return (

                            Number(
                                b.starRating || 0
                            )

                            -

                            Number(
                                a.starRating || 0
                            )

                        );

                    }
                );


        const matchOfTheNight =
            ratedMatches.length > 0

                ? ratedMatches[0]

                : null;



        // =================================
        // TITLE MATCH COUNT
        // =================================


        const titleMatches =
            eventMatches.filter(
                match =>
                    Boolean(
                        match.championshipId
                    )
            );



        // =================================
        // UNIQUE COMPETITORS
        // =================================


        const competitorIds =
            new Set();


        eventMatches.forEach(
            match => {


                match.sides.forEach(
                    side => {


                        side.wrestlers.forEach(
                            wrestlerId => {


                                competitorIds.add(
                                    wrestlerId
                                );

                            }
                        );

                    }
                );

            }
        );



        // =================================
        // PAGE ELEMENTS
        // =================================


        const section =
            document.getElementById(
                "event-highlights-section"
            );


        const grid =
            document.getElementById(
                "event-highlights-grid"
            );


        if (
            !section ||
            !grid
        ) {

            return;

        }


        section.hidden =
            false;



        // =================================
        // MATCH OF THE NIGHT CARD
        // =================================


        const matchCard =
            document.createElement(
                "article"
            );


        matchCard.className =
            "event-highlight-card event-highlight-featured";


        if (matchOfTheNight) {


            matchCard.innerHTML = `

                <span class="event-highlight-label">

                    MATCH OF THE NIGHT

                </span>


                <strong class="event-highlight-match">

                    ${formatMatch(matchOfTheNight)}

                </strong>


                <div class="event-highlight-rating">

                    <span>

                        ${matchOfTheNight.rating}%

                    </span>


                    <span>

                        ${
                            matchOfTheNight.starRating !== null &&
                            matchOfTheNight.starRating !== undefined

                                ? `${matchOfTheNight.starRating} ★`

                                : "—"
                        }

                    </span>

                </div>

            `;

        }


        else {


            matchCard.innerHTML = `

                <span class="event-highlight-label">

                    MATCH OF THE NIGHT

                </span>


                <strong class="event-highlight-match">

                    —

                </strong>

            `;

        }


        grid.appendChild(
            matchCard
        );



        // =================================
        // TITLE MATCH CARD
        // =================================


        const titleMatchCard =
            document.createElement(
                "article"
            );


        titleMatchCard.className =
            "event-highlight-card";


        titleMatchCard.innerHTML = `

            <span class="event-highlight-label">

                TITLE MATCHES

            </span>


            <strong class="event-highlight-number">

                ${titleMatches.length}

            </strong>

        `;


        grid.appendChild(
            titleMatchCard
        );



        // =================================
        // CHAMPIONSHIP CHANGE CARD
        // =================================


        const titleChangeCard =
            document.createElement(
                "article"
            );


        titleChangeCard.className =
            "event-highlight-card";


        titleChangeCard.innerHTML = `

            <span class="event-highlight-label">

                CHAMPIONSHIP CHANGES

            </span>


            <strong class="event-highlight-number">

                ${championshipChangeIds.size}

            </strong>

        `;


        grid.appendChild(
            titleChangeCard
        );



        // =================================
        // COMPETITOR CARD
        // =================================


        const competitorCard =
            document.createElement(
                "article"
            );


        competitorCard.className =
            "event-highlight-card";


        competitorCard.innerHTML = `

            <span class="event-highlight-label">

                COMPETITORS

            </span>


            <strong class="event-highlight-number">

                ${competitorIds.size}

            </strong>

        `;


        grid.appendChild(
            competitorCard
        );


    }


    catch (error) {


        console.error(
            "Could not load Event Highlights:",
            error
        );

    }

}



loadEventHighlights();
