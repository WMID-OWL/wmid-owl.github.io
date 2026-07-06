async function loadCareerHighlights() {

    try {


        // =================================
        // GET WRESTLER ID
        // =================================


        const params =
            new URLSearchParams(
                window.location.search
            );


        const wrestlerId =
            params.get("id");


        if (!wrestlerId) {

            return;

        }



        // =================================
        // LOAD DATABASES
        // =================================


        const [
            wrestlerResponse,
            matchResponse,
            eventResponse,
            teamResponse,
            championshipResponse,
            reignResponse
        ] = await Promise.all([

            fetch(
                "data/wrestlers.json",
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
                "data/events.json",
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
            !wrestlerResponse.ok ||
            !matchResponse.ok ||
            !eventResponse.ok ||
            !teamResponse.ok ||
            !championshipResponse.ok ||
            !reignResponse.ok
        ) {

            throw new Error(
                "Could not load Career Highlights databases."
            );

        }



        const wrestlers =
            await wrestlerResponse.json();


        const matches =
            await matchResponse.json();


        const events =
            await eventResponse.json();


        const teams =
            await teamResponse.json();


        const championships =
            await championshipResponse.json();


        const reigns =
            await reignResponse.json();



        // =================================
        // VERIFY WRESTLER
        // =================================


        const wrestler =
            wrestlers.find(
                item =>
                    item.id === wrestlerId
            );


        if (!wrestler) {

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



        function getDateValue(
            dateString
        ) {


            if (!dateString) {

                return 0;

            }


            return new Date(
                `${dateString}T00:00:00`
            ).getTime();

        }



        function getNumericValue(
            value
        ) {


            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {

                return null;

            }


            const number =
                Number(
                    value
                );


            return Number.isFinite(
                number
            )

                ? number

                : null;

        }



        function getResultType(
            match
        ) {


            const resultType =
                normalize(
                    match.resultType
                );


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



        function isDecisiveMatch(
            match
        ) {


            return (
                getResultType(
                    match
                ) === "win"
            );

        }



        // =================================
        // LOOKUP MAPS
        // =================================


        const wrestlerMap = {};


        wrestlers.forEach(
            item => {


                wrestlerMap[
                    item.id
                ] = item;

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



        const teamMap = {};


        teams.forEach(
            team => {


                teamMap[
                    team.id
                ] = team;

            }
        );



        // =================================
        // WRESTLER NAME
        // =================================


        function getWrestlerName(
            id
        ) {


            const item =
                wrestlerMap[
                    id
                ];


            return item
                ? item.name
                : id;

        }



        // =================================
        // WRESTLER PARTICIPATION
        // =================================


        function getWrestlerSideIndex(
            match,
            targetWrestlerId
        ) {


            if (
                !Array.isArray(
                    match.sides
                )
            ) {

                return -1;

            }


            return match.sides.findIndex(
                side =>

                    Array.isArray(
                        side.wrestlers
                    )

                    &&

                    side.wrestlers.includes(
                        targetWrestlerId
                    )
            );

        }



        function wrestlerParticipated(
            match,
            targetWrestlerId
        ) {


            return (

                getWrestlerSideIndex(
                    match,
                    targetWrestlerId
                )

                !== -1

            );

        }



        function getWrestlerOutcome(
            match,
            targetWrestlerId
        ) {


            const sideIndex =
                getWrestlerSideIndex(
                    match,
                    targetWrestlerId
                );


            if (
                sideIndex === -1
            ) {

                return null;

            }


            const resultType =
                getResultType(
                    match
                );


            if (
                resultType === "draw" ||
                resultType === "no-contest"
            ) {

                return "neutral";

            }


            return (

                Number(
                    match.winnerSide
                )

                ===

                sideIndex

            )

                ? "win"

                : "loss";

        }



        // =================================
        // EVENT MATCH GROUPS
        // =================================


        function getMatchEventKey(
            match
        ) {


            if (match.eventId) {

                return `id:${match.eventId}`;

            }


            return (

                `fallback:${match.date || ""}:` +

                normalize(
                    match.event
                )

            );

        }



        const eventMatchGroups = {};


        matches.forEach(
            match => {


                const key =
                    getMatchEventKey(
                        match
                    );


                if (
                    !eventMatchGroups[
                        key
                    ]
                ) {


                    eventMatchGroups[
                        key
                    ] = [];

                }


                eventMatchGroups[
                    key
                ].push(
                    match
                );

            }
        );



        // =================================
        // CHAMPIONSHIP REIGNS
        // =================================


        function teamIncludesWrestler(
            teamId,
            targetWrestlerId
        ) {


            const team =
                teamMap[
                    teamId
                ];


            return Boolean(

                team

                &&

                Array.isArray(
                    team.members
                )

                &&

                team.members.includes(
                    targetWrestlerId
                )

            );

        }



        const wrestlerReigns =
            reigns.filter(
                reign => {


                    if (
                        reign.holderType === "wrestler"
                    ) {


                        return (

                            reign.holderId ===
                            wrestlerId

                        );

                    }


                    if (
                        reign.holderType === "team"
                    ) {


                        return teamIncludesWrestler(

                            reign.holderId,

                            wrestlerId

                        );

                    }


                    return false;

                }
            );



        // =================================
        // CHAMPIONSHIP REIGN COUNTS
        // =================================


        const championshipReignCounts = {};


        wrestlerReigns.forEach(
            reign => {


                if (
                    !championshipReignCounts[
                        reign.championshipId
                    ]
                ) {


                    championshipReignCounts[
                        reign.championshipId
                    ] = 0;

                }


                championshipReignCounts[
                    reign.championshipId
                ] += 1;

            }
        );



        // =================================
        // SUCCESSFUL TITLE DEFENSES
        // =================================


        function matchFallsWithinReign(
            match,
            reign
        ) {


            if (
                !match.date ||
                !reign.wonDate
            ) {

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



        const defenseMatchIds =
            new Set();



        wrestlerReigns.forEach(
            reign => {


                matches.forEach(
                    match => {


                        if (
                            match.championshipId !==
                            reign.championshipId
                        ) {

                            return;

                        }


                        if (
                            normalize(
                                match.titleOutcome
                            ) !== "retained"
                        ) {

                            return;

                        }


                        if (
                            !matchFallsWithinReign(
                                match,
                                reign
                            )
                        ) {

                            return;

                        }


                        if (
                            !wrestlerParticipated(
                                match,
                                wrestlerId
                            )
                        ) {

                            return;

                        }


                        defenseMatchIds.add(
                            match.id
                        );

                    }
                );

            }
        );


        const successfulDefenses =
            defenseMatchIds.size;



        // =================================
        // MATCH OF THE NIGHT AWARDS
        // =================================


        let matchOfTheNightAwards =
            0;



        Object.values(
            eventMatchGroups
        ).forEach(
            eventMatches => {


                const ratedMatches =
                    eventMatches

                        .filter(
                            match =>

                                getNumericValue(
                                    match.rating
                                )

                                !== null
                        )

                        .sort(
                            (a, b) => {


                                const ratingDifference =

                                    getNumericValue(
                                        b.rating
                                    )

                                    -

                                    getNumericValue(
                                        a.rating
                                    );


                                if (
                                    ratingDifference !== 0
                                ) {

                                    return ratingDifference;

                                }


                                return (

                                    (
                                        getNumericValue(
                                            b.starRating
                                        )

                                        || 0
                                    )

                                    -

                                    (
                                        getNumericValue(
                                            a.starRating
                                        )

                                        || 0
                                    )

                                );

                            }
                        );


                const matchOfTheNight =
                    ratedMatches[0] || null;


                if (
                    matchOfTheNight

                    &&

                    wrestlerParticipated(
                        matchOfTheNight,
                        wrestlerId
                    )
                ) {


                    matchOfTheNightAwards +=
                        1;

                }

            }
        );



        // =================================
        // PERFORMER OF THE NIGHT AWARDS
        // =================================


        let performerOfTheNightAwards =
            0;



        Object.values(
            eventMatchGroups
        ).forEach(
            eventMatches => {


                const performerStats = {};



                function ensurePerformer(
                    id
                ) {


                    if (
                        !performerStats[
                            id
                        ]
                    ) {


                        performerStats[
                            id
                        ] = {

                            wrestlerId:
                                id,

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
                        id
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
                                    id => {


                                        ensurePerformer(
                                            id
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



                        const winnerIndex =
                            Number(
                                match.winnerSide
                            );


                        const winningSide =
                            match.sides[
                                winnerIndex
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
                            getNumericValue(
                                match.rating
                            )

                            || 0;



                        winningSide.wrestlers.forEach(
                            id => {


                                const stats =
                                    ensurePerformer(
                                        id
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



                const ranking =
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

                                        b.winningRatingTotal

                                        -

                                        a.winningRatingTotal

                                    );

                                }


                                if (
                                    b.bestWinningRating !==
                                    a.bestWinningRating
                                ) {

                                    return (

                                        b.bestWinningRating

                                        -

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
                    ranking.find(
                        performer =>
                            performer.wins > 0
                    )

                    || null;



                if (
                    performerOfTheNight

                    &&

                    performerOfTheNight.wrestlerId ===
                    wrestlerId
                ) {


                    performerOfTheNightAwards +=
                        1;

                }

            }
        );



        // =================================
        // LONGEST WINNING STREAK
        // =================================


        const wrestlerMatches =
            matches

                .filter(
                    match =>

                        wrestlerParticipated(
                            match,
                            wrestlerId
                        )
                )

                .sort(
                    (a, b) => {


                        const dateDifference =

                            getDateValue(
                                a.date
                            )

                            -

                            getDateValue(
                                b.date
                            );


                        if (
                            dateDifference !== 0
                        ) {

                            return dateDifference;

                        }


                        const orderDifference =

                            Number(
                                a.order || 0
                            )

                            -

                            Number(
                                b.order || 0
                            );


                        if (
                            orderDifference !== 0
                        ) {

                            return orderDifference;

                        }


                        return String(
                            a.id || ""
                        ).localeCompare(

                            String(
                                b.id || ""
                            )

                        );

                    }
                );



        let currentWinningStreak =
            0;


        let longestWinningStreak =
            0;



        wrestlerMatches.forEach(
            match => {


                const outcome =
                    getWrestlerOutcome(
                        match,
                        wrestlerId
                    );


                if (
                    outcome === "win"
                ) {


                    currentWinningStreak +=
                        1;


                    longestWinningStreak =
                        Math.max(

                            longestWinningStreak,

                            currentWinningStreak

                        );


                    return;

                }


                if (
                    outcome === "loss"
                ) {


                    currentWinningStreak =
                        0;

                }


                // Draws and no-contests pause
                // the streak instead of breaking it.

            }
        );



        // =================================
        // PAGE ELEMENTS
        // =================================


        const section =
            document.getElementById(
                "career-highlights-section"
            );


        const titleAccolades =
            document.getElementById(
                "career-title-accolades"
            );


        const statsGrid =
            document.getElementById(
                "career-highlight-stats"
            );


        if (
            !section ||
            !titleAccolades ||
            !statsGrid
        ) {

            return;

        }



        titleAccolades.innerHTML =
            "";


        statsGrid.innerHTML =
            "";



        // =================================
        // RENDER CHAMPIONSHIP ACCOLADES
        // =================================


        let titleAccoladeCount =
            0;



        championships.forEach(
            championship => {


                const reignCount =
                    championshipReignCounts[
                        championship.id
                    ]

                    || 0;


                if (
                    reignCount === 0
                ) {

                    return;

                }



                const championLabel =
                    championship.name

                        .replace(
                            /\s+Championship$/i,
                            ""
                        )

                    + " Champion";



                const accolade =
                    document.createElement(
                        "a"
                    );


                accolade.href =

                    `title.html?id=${encodeURIComponent(championship.id)}`;


                accolade.className =
                    "career-title-accolade";


                accolade.innerHTML = `

                    <strong>

                        ${reignCount}×

                    </strong>


                    <span>

                        ${championLabel}

                    </span>

                `;


                titleAccolades.appendChild(
                    accolade
                );


                titleAccoladeCount +=
                    1;

            }
        );



        if (
            titleAccoladeCount > 0
        ) {


            titleAccolades.hidden =
                false;

        }



        // =================================
        // STAT CARD HELPER
        // =================================


        function addStatCard(
            value,
            singularLabel,
            pluralLabel
        ) {


            if (
                value <= 0
            ) {

                return;

            }


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "career-highlight-stat";


            card.innerHTML = `

                <strong>

                    ${value}

                </strong>


                <span>

                    ${
                        value === 1
                            ? singularLabel
                            : pluralLabel
                    }

                </span>

            `;


            statsGrid.appendChild(
                card
            );

        }



        // =================================
        // RENDER AUTOMATIC STATS
        // =================================


        addStatCard(

            successfulDefenses,

            "Successful Title Defense",

            "Successful Title Defenses"

        );


        addStatCard(

            matchOfTheNightAwards,

            "Match of the Night Award",

            "Match of the Night Awards"

        );


        addStatCard(

            performerOfTheNightAwards,

            "Performer of the Night Award",

            "Performer of the Night Awards"

        );


        addStatCard(

            longestWinningStreak,

            "Longest Winning Streak",

            "Longest Winning Streak"

        );



        // =================================
        // SHOW SECTION ONLY IF NEEDED
        // =================================


        const hasStats =
            statsGrid.children.length > 0;


        const hasTitles =
            titleAccoladeCount > 0;



        section.hidden =
            !hasStats &&
            !hasTitles;



        console.log(
            "Career Highlights loaded:",
            {
                wrestler:
                    wrestlerId,

                titleAccolades:
                    titleAccoladeCount,

                successfulDefenses:
                    successfulDefenses,

                matchOfTheNightAwards:
                    matchOfTheNightAwards,

                performerOfTheNightAwards:
                    performerOfTheNightAwards,

                longestWinningStreak:
                    longestWinningStreak
            }
        );


    }


    catch (error) {


        console.error(
            "Could not load Career Highlights:",
            error
        );

    }

}



loadCareerHighlights();
