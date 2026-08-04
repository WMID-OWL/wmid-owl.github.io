async function loadHomePage() {

    try {


        // =================================
        // LOAD DATABASES
        // =================================


        const [
            eventResponse,
            matchResponse,
            wrestlerResponse,
            teamResponse,
            championshipResponse,
            reignResponse
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
                "data/teams.json",
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
            !eventResponse.ok ||
            !matchResponse.ok ||
            !wrestlerResponse.ok ||
            !teamResponse.ok ||
            !championshipResponse.ok ||
            !reignResponse.ok
        ) {

            throw new Error(
                "Could not load homepage databases."
            );

        }



        const events =
            await eventResponse.json();


        const matches =
            await matchResponse.json();


        const wrestlers =
            await wrestlerResponse.json();


        const teams =
            await teamResponse.json();


        const championships =
            await championshipResponse.json();


        const reigns =
            await reignResponse.json();



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


            return getDateValue(
                dateString
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
        function getEventScheduleValue(
            event
        ) {


            if (
                window.OWLCalendar

                &&

                typeof window.OWLCalendar
                    .eventSortValue ===
                    "function"
            ) {

                return window.OWLCalendar
                    .eventSortValue(
                        event
                    );

            }


            return 0;

        }



        function formatEventSchedule(
            event
        ) {


            if (
                window.OWLCalendar

                &&

                typeof window.OWLCalendar
                    .formatEventSlot ===
                    "function"
            ) {

                return window.OWLCalendar
                    .formatEventSlot(
                        event
                    );

            }


            return "Schedule Not Set";

        }


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



        const championshipMap = {};


        championships.forEach(
            championship => {


                championshipMap[
                    championship.id
                ] = championship;

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
        // NAME HELPERS
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



        // =================================
        // MATCH FORMATTERS
        // =================================


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


            const winningSide =
                match.sides[
                    match.winnerSide
                ];


            return winningSide

                ? formatSide(
                    winningSide
                )

                : "—";

        }




        // =================================
        // NEXT EVENT
        // =================================


                const upcomingEvents =
            events

                .filter(
                    event =>

                        normalize(
                            event.status
                        ) === "upcoming"
                )

                .sort(
                    (
                        eventA,
                        eventB
                    ) =>

                        getEventScheduleValue(
                            eventA
                        )

                        -

                        getEventScheduleValue(
                            eventB
                        )
                );



        const nextEvent =
            upcomingEvents[0] || null;



        if (nextEvent) {


            const section =
                document.getElementById(
                    "home-next-event-section"
                );


            section.hidden =
                false;



            document.getElementById(
                "home-next-event-heading"
            ).textContent =
                nextEvent.name;



            document.getElementById(
                "home-event-name"
            ).textContent =
                nextEvent.name;



                        document.getElementById(
                "home-event-date"
            ).textContent =
                formatEventSchedule(
                    nextEvent
                );



            document.getElementById(
                "home-event-type"
            ).textContent =

                normalize(
                    nextEvent.eventType
                ) === "ppv"

                    ? "UPCOMING PPV"

                    : "UPCOMING EVENT";



            const location =
                document.getElementById(
                    "home-event-location"
                );


            if (
                nextEvent.location
            ) {


                location.textContent =
                    nextEvent.location;


                location.hidden =
                    false;

            }



            document.getElementById(
                "home-event-description"
            ).textContent =

                nextEvent.description ||

                nextEvent.tagline ||

                "The next chapter of OWL Wrestling is coming soon.";



            document.getElementById(
                "home-event-link"
            ).href =

                `event.html?id=${encodeURIComponent(nextEvent.id)}`;



            if (
                nextEvent.image
            ) {


                const eventArt =
                    document.getElementById(
                        "home-event-art"
                    );


                eventArt.classList.remove(
                    "placeholder-art"
                );


                eventArt.innerHTML = `

                    <img
                        src="${nextEvent.image}"
                        alt="${nextEvent.name}"
                    >

                `;

            }

        }



        // =================================
        // LATEST RESULTS
        // =================================


        const latestMatches =
            [...matches]

                .sort(
                    (a, b) =>

                        getDateValue(
                            b.date
                        )

                        -

                        getDateValue(
                            a.date
                        )
                )

                .slice(
                    0,
                    4
                );



        const resultList =
            document.getElementById(
                "home-results-list"
            );



        latestMatches.forEach(
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
                        : match.event || "OWL Event";


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "home-result-card";


                card.innerHTML = `

                    <div class="home-result-meta">


                        <span>
                            ${formatDate(match.date)}
                        </span>


                        ${
                            match.eventId

                                ? `
                                    <a
                                        href="event.html?id=${encodeURIComponent(match.eventId)}"
                                    >
                                        ${eventName} →
                                    </a>
                                `

                                : `
                                    <span>
                                        ${eventName}
                                    </span>
                                `
                        }


                    </div>


                    <div class="home-result-main">


                        <div>

                            <span class="home-result-type">

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


                        <div class="home-result-ratings">


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

                `;


                resultList.appendChild(
                    card
                );

            }
        );



        // =================================
        // LATEST COMPLETED EVENT
        // =================================


                const completedEvents =
            events

                .filter(
                    event =>

                        normalize(
                            event.status
                        ) !== "upcoming"
                )

                .sort(
                    (
                        eventA,
                        eventB
                    ) =>

                        getEventScheduleValue(
                            eventB
                        )

                        -

                        getEventScheduleValue(
                            eventA
                        )
                );



        const latestCompletedEvent =
            completedEvents[0] || null;



        // =================================
        // MATCH OF THE NIGHT
        // =================================


        if (
            latestCompletedEvent
        ) {


            const eventMatches =
                matches.filter(
                    match =>

                        match.eventId ===
                            latestCompletedEvent.id
                );


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
                        (a, b) =>

                            Number(
                                b.rating
                            )

                            -

                            Number(
                                a.rating
                            )
                    );



            const bestMatch =
                ratedMatches[0] || null;



            if (bestMatch) {


                document.getElementById(
                    "home-match-of-night-event"
                ).innerHTML = `

                    <a
                        href="event.html?id=${encodeURIComponent(latestCompletedEvent.id)}"
                    >
                        ${latestCompletedEvent.name} →
                    </a>

                `;



                document.getElementById(
                    "home-match-of-night-fixture"
                ).textContent =
                    formatMatch(
                        bestMatch
                    );



                document.getElementById(
                    "home-match-of-night-rating"
                ).textContent =

                    `${bestMatch.rating}%`;



                document.getElementById(
                    "home-match-of-night-stars"
                ).textContent =

                    bestMatch.starRating !== null &&
                    bestMatch.starRating !== undefined

                        ? `${bestMatch.starRating} ★`

                        : "—";

            }

        }



        // =================================
        // LATEST TITLE CHANGE
        // =================================


        const titleChangeMatches =
            matches

                .filter(
                    match =>

                        normalize(
                            match.titleOutcome
                        ) === "changed"

                        &&

                        match.championshipId
                )

                .sort(
                    (a, b) =>

                        getDateValue(
                            b.date
                        )

                        -

                        getDateValue(
                            a.date
                        )
                );



        const latestTitleChange =
            titleChangeMatches[0] || null;



        if (latestTitleChange) {


            const championship =
                championshipMap[
                    latestTitleChange.championshipId
                ];


            const incomingReign =
                reigns.find(
                    reign =>

                        reign.championshipId ===
                            latestTitleChange.championshipId

                        &&

                        reign.wonEventId ===
                            latestTitleChange.eventId
                )

                || null;



            const outgoingReign =
                reigns.find(
                    reign =>

                        reign.championshipId ===
                            latestTitleChange.championshipId

                        &&

                        reign.lostEventId ===
                            latestTitleChange.eventId
                )

                || null;



            document.getElementById(
                "home-title-change-title"
            ).textContent =

                championship
                    ? championship.name
                    : latestTitleChange.championshipId;



            document.getElementById(
                "home-title-change-old"
            ).textContent =

                outgoingReign

                    ? getHolderName(
                        outgoingReign
                    )

                    : "VACANT";



            document.getElementById(
                "home-title-change-new"
            ).textContent =

                incomingReign

                    ? getHolderName(
                        incomingReign
                    )

                    : getWinnerText(
                        latestTitleChange
                    );



            document.getElementById(
                "home-title-change-link"
            ).href =

                `title.html?id=${encodeURIComponent(latestTitleChange.championshipId)}`;

        }



        console.log(
            "Live homepage loaded successfully."
        );


    }


    catch (error) {


        console.error(
            "Could not load live homepage:",
            error
        );

    }

}



loadHomePage();
