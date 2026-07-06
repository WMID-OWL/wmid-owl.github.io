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
            teamsResponse,
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
            !eventsResponse.ok ||
            !matchesResponse.ok ||
            !wrestlersResponse.ok ||
            !teamsResponse.ok ||
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


        const teams =
            await teamsResponse.json();


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



        function createMemberSignature(
            memberIds
        ) {


            return [...memberIds]
                .sort()
                .join("|");

        }



        function isDecisiveMatch(
            match
        ) {


            const resultType =
                normalize(
                    match.resultType
                );


            if (
                resultType === "draw" ||
                resultType === "no-contest" ||
                resultType === "no contest" ||
                resultType === "nc"
            ) {

                return false;

            }


            return (

                match.winnerSide !== null

                &&

                match.winnerSide !== undefined

            );

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



        const championshipMap = {};


        championships.forEach(
            championship => {


                championshipMap[
                    championship.id
                ] = championship;

            }
        );



        const officialTeamMap = {};


        teams.forEach(
            team => {


                if (
                    Array.isArray(
                        team.members
                    )

                    &&

                    team.members.length === 2
                ) {


                    const signature =
                        createMemberSignature(
                            team.members
                        );


                    officialTeamMap[
                        signature
                    ] = team;

                }

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



        function getOfficialTeam(
            wrestlerIds
        ) {


            if (
                !Array.isArray(
                    wrestlerIds
                )

                ||

                wrestlerIds.length !== 2
            ) {

                return null;

            }


            const signature =
                createMemberSignature(
                    wrestlerIds
                );


            return officialTeamMap[
                signature
            ] || null;

        }



        function formatSide(
            side
        ) {


            const wrestlerIds =
                Array.isArray(
                    side.wrestlers
                )

                    ? side.wrestlers

                    : [];


            const officialTeam =
                getOfficialTeam(
                    wrestlerIds
                );


            if (officialTeam) {

                return officialTeam.name;

            }


            return wrestlerIds

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
        // HIDE FOR EMPTY EVENTS
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
            ratedMatches[0] || null;



        // =================================
        // PERFORMER OF THE NIGHT STATS
        // =================================


        const performerStats = {};



        function ensurePerformer(
            wrestlerId
        ) {


            if (
                !performerStats[
                    wrestlerId
                ]
            ) {


                performerStats[
                    wrestlerId
                ] = {

                    wrestlerId:
                        wrestlerId,

                    wins:
                        0,

                    finishes:
                        0,

                    winningRatingTotal:
                        0,

                    bestWinningRating:
                        0

                };

            }


            return performerStats[
                wrestlerId
            ];

        }



        eventMatches.forEach(
            match => {


                if (
                    !Array.isArray(
                        match.sides
                    )
                ) {

                    return;

                }


                // Make sure everyone is known
                // to the performer database.


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


                                ensurePerformer(
                                    wrestlerId
                                );

                            }
                        );

                    }
                );



                if (
                    !isDecisiveMatch(
                        match
                    )
                ) {

                    return;

                }



                const winningSide =
                    match.sides[
                        match.winnerSide
                    ];


                if (
                    !winningSide ||
                    !Array.isArray(
                        winningSide.wrestlers
                    )
                ) {

                    return;

                }



                const matchRating =
                    Number.isFinite(
                        Number(
                            match.rating
                        )
                    )

                        ? Number(
                            match.rating
                        )

                        : 0;



                winningSide.wrestlers.forEach(
                    wrestlerId => {


                        const stats =
                            ensurePerformer(
                                wrestlerId
                            );


                        stats.wins +=
                            1;


                        stats.winningRatingTotal +=
                            matchRating;


                        stats.bestWinningRating =
                            Math.max(

                                stats.bestWinningRating,

                                matchRating

                            );

                    }
                );



                if (
                    match.finish &&
                    match.finish.winner
                ) {


                    const finisherStats =
                        ensurePerformer(
                            match.finish.winner
                        );


                    finisherStats.finishes +=
                        1;

                }

            }
        );



        const performerRanking =
            Object.values(
                performerStats
            )

                .sort(
                    (a, b) => {


                        if (
                            b.wins !==
                            a.wins
                        ) {

                            return (
                                b.wins -
                                a.wins
                            );

                        }


                        if (
                            b.finishes !==
                            a.finishes
                        ) {

                            return (
                                b.finishes -
                                a.finishes
                            );

                        }


                        if (
                            b.winningRatingTotal !==
                            a.winningRatingTotal
                        ) {

                            return (
                                b.winningRatingTotal -
                                a.winningRatingTotal
                            );

                        }


                        if (
                            b.bestWinningRating !==
                            a.bestWinningRating
                        ) {

                            return (
                                b.bestWinningRating -
                                a.bestWinningRating
                            );

                        }


                        return getWrestlerName(
                            a.wrestlerId
                        ).localeCompare(

                            getWrestlerName(
                                b.wrestlerId
                            )

                        );

                    }
                );



        const performerOfTheNight =
            performerRanking

                .find(
                    performer =>
                        performer.wins > 0
                )

                || null;



        // =================================
        // BIGGEST WIN
        // =================================


        const decisiveMatches =
            eventMatches

                .filter(
                    match =>

                        isDecisiveMatch(
                            match
                        )
                )

                .sort(
                    (a, b) => {


                        const ratingDifference =

                            Number(
                                b.rating || 0
                            )

                            -

                            Number(
                                a.rating || 0
                            );


                        if (
                            ratingDifference !== 0
                        ) {

                            return ratingDifference;

                        }


                        const aTitleChange =
                            normalize(
                                a.titleOutcome
                            ) === "changed"

                                ? 1

                                : 0;


                        const bTitleChange =
                            normalize(
                                b.titleOutcome
                            ) === "changed"

                                ? 1

                                : 0;


                        return (
                            bTitleChange -
                            aTitleChange
                        );

                    }
                );


        const biggestWinMatch =
            decisiveMatches[0] || null;



        function getWinningSideText(
            match
        ) {


            if (!match) {

                return "—";

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



        function getLosingSidesText(
            match
        ) {


            if (!match) {

                return "—";

            }


            return match.sides

                .filter(
                    (
                        side,
                        index
                    ) =>

                        index !==
                        match.winnerSide
                )

                .map(
                    side =>

                        formatSide(
                            side
                        )
                )

                .join(" & ");

        }



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


        grid.innerHTML =
            "";



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
        // PERFORMER OF THE NIGHT CARD
        // =================================


        const performerCard =
            document.createElement(
                "article"
            );


        performerCard.className =
            "event-highlight-card event-highlight-award";


        if (performerOfTheNight) {


            const performerId =
                performerOfTheNight.wrestlerId;


            performerCard.innerHTML = `

                <span class="event-highlight-label">

                    PERFORMER OF THE NIGHT

                </span>


                <strong class="event-highlight-match">

                    <a
                        href="wrestler.html?id=${encodeURIComponent(performerId)}"
                        class="event-highlight-wrestler-link"
                    >

                        ${getWrestlerName(performerId)}

                    </a>

                </strong>


                <div class="event-highlight-rating">


                    <span>

                        ${performerOfTheNight.wins}

                        ${
                            performerOfTheNight.wins === 1
                                ? "WIN"
                                : "WINS"
                        }

                    </span>


                    <span>

                        ${performerOfTheNight.finishes}

                        ${
                            performerOfTheNight.finishes === 1
                                ? "FINISH"
                                : "FINISHES"
                        }

                    </span>


                </div>

            `;

        }


        else {


            performerCard.innerHTML = `

                <span class="event-highlight-label">

                    PERFORMER OF THE NIGHT

                </span>


                <strong class="event-highlight-match">

                    —

                </strong>

            `;

        }


        grid.appendChild(
            performerCard
        );



        // =================================
        // BIGGEST WIN CARD
        // =================================


        const biggestWinCard =
            document.createElement(
                "article"
            );


        biggestWinCard.className =
            "event-highlight-card event-highlight-award";


        if (biggestWinMatch) {


            biggestWinCard.innerHTML = `

                <span class="event-highlight-label">

                    BIGGEST WIN

                </span>


                <strong class="event-highlight-match">

                    ${getWinningSideText(biggestWinMatch)}

                </strong>


                <p class="event-highlight-win-detail">

                    defeated

                    ${getLosingSidesText(biggestWinMatch)}

                </p>


                <div class="event-highlight-rating">


                    <span>

                        ${
                            biggestWinMatch.rating !== null &&
                            biggestWinMatch.rating !== undefined

                                ? `${biggestWinMatch.rating}%`

                                : "—"
                        }

                    </span>


                    <span>

                        ${
                            biggestWinMatch.starRating !== null &&
                            biggestWinMatch.starRating !== undefined

                                ? `${biggestWinMatch.starRating} ★`

                                : "—"
                        }

                    </span>


                </div>

            `;

        }


        else {


            biggestWinCard.innerHTML = `

                <span class="event-highlight-label">

                    BIGGEST WIN

                </span>


                <strong class="event-highlight-match">

                    —

                </strong>

            `;

        }


        grid.appendChild(
            biggestWinCard
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



        console.log(
            "Event Highlights loaded:",
            {
                event:
                    event.id,

                matchOfTheNight:
                    matchOfTheNight
                        ? matchOfTheNight.id
                        : null,

                performerOfTheNight:
                    performerOfTheNight
                        ? performerOfTheNight.wrestlerId
                        : null,

                biggestWin:
                    biggestWinMatch
                        ? biggestWinMatch.id
                        : null
            }
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
