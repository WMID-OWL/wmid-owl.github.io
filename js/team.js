async function loadTeamProfile() {

    try {


        // =================================
        // GET TEAM ID FROM URL
        // =================================


        const params =
            new URLSearchParams(
                window.location.search
            );


        const teamId =
            params.get("id");



        // =================================
        // LOAD DATABASES
        // =================================


        const teamResponse =
            await fetch(
                "data/teams.json",
                {
                    cache: "no-store"
                }
            );


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
            !teamResponse.ok ||
            !wrestlerResponse.ok ||
            !matchResponse.ok
        ) {

            throw new Error(
                "Could not load team database."
            );

        }


        const teams =
            await teamResponse.json();


        const wrestlers =
            await wrestlerResponse.json();


        const matches =
            await matchResponse.json();



        // =================================
        // FIND TEAM
        // =================================


        const team =
            teams.find(
                item =>
                    item.id === teamId
            );


        if (!team) {

            document.querySelector(
                ".team-page"
            ).innerHTML = `

                <section class="team-section">

                    <h1>
                        Team Not Found
                    </h1>

                    <p>
                        This team does not exist
                        in the OWL database.
                    </p>

                </section>

            `;

            return;

        }



        // =================================
        // LOOKUP MAP
        // =================================


        const wrestlerMap = {};


        wrestlers.forEach(
            wrestler => {

                wrestlerMap[
                    wrestler.id
                ] = wrestler;

            }
        );



        // =================================
        // BASIC TEAM INFORMATION
        // =================================


        document.title =
            `${team.name} | OWL Wrestling`;


        document.getElementById(
            "team-name"
        ).textContent =
            team.name;


                document.getElementById(
            "team-brand"
        ).textContent =
            team.brand || "";



        // =================================
        // MANAGER / VALET
        // =================================


        if (
            team.manager
        ) {


            document.getElementById(
                "team-manager"
            ).textContent =
                team.manager;


            document.getElementById(
                "team-manager-section"
            ).hidden =
                false;

        }



        // =================================
        // TEAM LOGO
        // =================================


        if (team.logo) {


            const logo =
                document.getElementById(
                    "team-logo"
                );


            logo.src =
                team.logo;


            logo.alt =
                team.name;


            logo.hidden =
                false;


            document.getElementById(
                "team-logo-placeholder"
            ).hidden =
                true;

        }



        // =================================
        // MEMBERS
        // =================================


        const memberContainer =
            document.getElementById(
                "team-members"
            );


        team.members.forEach(
            memberId => {


                const wrestler =
                    wrestlerMap[
                        memberId
                    ];


                if (!wrestler) {

                    return;

                }


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    `wrestler.html?id=${encodeURIComponent(memberId)}`;


                link.className =
                    "team-member-card";


                link.innerHTML = `

                    <strong>
                        ${wrestler.name}
                    </strong>

                    ${
                        wrestler.nickname

                            ? `
                                <span>
                                    "${wrestler.nickname}"
                                </span>
                            `

                            : ""
                    }

                `;


                memberContainer.appendChild(
                    link
                );


            }
        );



        // =================================
        // FINISHER
        // =================================


        if (team.finisher) {

            document.getElementById(
                "team-finisher"
            ).textContent =
                team.finisher;

        }



        // =================================
        // TEAM STORY
        // =================================


        if (team.whyWereHere) {

            document.getElementById(
                "team-story"
            ).textContent =
                team.whyWereHere;

        }



        // =================================
        // CHAMPIONSHIPS
        // =================================


        if (
            team.championshipsHeld &&
            team.championshipsHeld.length > 0
        ) {


            const championshipContainer =
                document.getElementById(
                    "team-championships"
                );


            team.championshipsHeld.forEach(
                championship => {


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "team-accomplishment";


                    item.textContent =
                        championship;


                    championshipContainer.appendChild(
                        item
                    );


                }
            );


            document.getElementById(
                "team-championship-section"
            ).hidden =
                false;

        }



        // =================================
        // AWARDS
        // =================================


        if (
            team.awards &&
            team.awards.length > 0
        ) {


            const awardsContainer =
                document.getElementById(
                    "team-awards"
                );


            team.awards.forEach(
                award => {


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "team-accomplishment";


                    item.textContent =
                        award;


                    awardsContainer.appendChild(
                        item
                    );


                }
            );


            document.getElementById(
                "team-awards-section"
            ).hidden =
                false;

        }



        // =================================
        // MATCH HELPERS
        // =================================


        function sideContainsEntireTeam(
            side
        ) {


            return team.members.every(
                memberId =>

                    side.wrestlers.includes(
                        memberId
                    )
            );

        }



        function findTeamSide(match) {


            return match.sides.findIndex(
                side =>
                    sideContainsEntireTeam(
                        side
                    )
            );

        }



        function getResultType(match) {


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



        function getTeamOutcome(match) {


            const resultType =
                getResultType(
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


            const teamSide =
                findTeamSide(
                    match
                );


            if (
                teamSide ===
                match.winnerSide
            ) {

                return "win";

            }


            return "loss";

        }



        function formatSide(side) {


            return side.wrestlers

                .map(
                    wrestlerId => {

                        const wrestler =
                            wrestlerMap[
                                wrestlerId
                            ];


                        return wrestler
                            ? wrestler.name
                            : wrestlerId;

                    }
                )

                .join(" & ");

        }



        function formatMatch(match) {


    const teamSideIndex =
        findTeamSide(
            match
        );


    return match.sides

        .map(
            (side, index) => {


                if (
                    index === teamSideIndex
                ) {

                    return team.name;

                }


                return formatSide(
                    side
                );

            }
        )

        .join(" vs. ");

}
        
function formatFinish(match) {


    const resultType =
        getResultType(
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


    if (
        match.finish &&
        match.finish.winner &&
        match.finish.loser
    ) {


        const winner =
            wrestlerMap[
                match.finish.winner
            ];


        const loser =
            wrestlerMap[
                match.finish.loser
            ];


        const winnerName =
            winner
                ? winner.name
                : match.finish.winner;


        const loserName =
            loser
                ? loser.name
                : match.finish.loser;


        const method =
            match.finish.method ||
            "Unknown Method";


        return `${winnerName} defeated ${loserName} by ${method}`;

    }


    if (
        match.resultMethod
    ) {

        return match.resultMethod;

    }


    return "";

}


        // =================================
        // FIND OFFICIAL TEAM MATCHES
        // =================================


        const teamMatches =
            matches.filter(
                match =>

                    findTeamSide(
                        match
                    ) !== -1
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
                        getTeamOutcome(
                            match
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


                }
            );


            return `${wins}-${losses}-${draws}`;

        }



        // =================================
        // OVERALL RECORD
        // =================================


        document.getElementById(
            "team-overall-record"
        ).textContent =
            calculateRecord(
                teamMatches
            );



        // =================================
        // PPV RECORD
        // =================================


        const ppvMatches =
            teamMatches.filter(
                match =>

                    String(
                        match.eventType || ""
                    ).toLowerCase()
                    === "ppv"
            );


        document.getElementById(
            "team-ppv-record"
        ).textContent =
            calculateRecord(
                ppvMatches
            );



        // =================================
        // MATCH HISTORY
        // =================================


        const history =
            document.getElementById(
                "team-match-history"
            );


        if (
            teamMatches.length === 0
        ) {


            document.getElementById(
                "team-no-matches"
            ).hidden =
                false;


            document.querySelector(
                ".match-table"
            ).hidden =
                true;


            return;

        }



        teamMatches.sort(
            (a, b) =>

                new Date(b.date)
                -
                new Date(a.date)
        );



        teamMatches.forEach(
            match => {


                const outcome =
                    getTeamOutcome(
                        match
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

                        <span class="match-fixture">
    ${formatMatch(match)}
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


                    <td>
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
            "Could not load team profile:",
            error
        );


        document.querySelector(
            ".team-page"
        ).innerHTML = `

            <section class="team-section">

                <h1>
                    Team Profile Could Not Load
                </h1>

                <p>
                    There was a problem loading
                    the OWL team database.
                </p>

            </section>

        `;

    }

}



loadTeamProfile();
