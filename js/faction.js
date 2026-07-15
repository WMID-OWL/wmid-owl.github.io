async function loadFactionProfile() {

    try {


        // =================================
        // GET FACTION ID
        // =================================


        const params =
            new URLSearchParams(
                window.location.search
            );


        const factionId =
            params.get("id");



        // =================================
        // LOAD DATABASES
        // =================================


        const [
            factionResponse,
            teamResponse,
            wrestlerResponse,
            matchResponse
        ] = await Promise.all([

            fetch(
                "data/factions.json",
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
            )

        ]);


        if (
            !factionResponse.ok ||
            !teamResponse.ok ||
            !wrestlerResponse.ok ||
            !matchResponse.ok
        ) {

            throw new Error(
                "Could not load faction databases."
            );

        }


        const factions =
            await factionResponse.json();


        const teams =
            await teamResponse.json();


        const wrestlers =
            await wrestlerResponse.json();


        const matches =
            await matchResponse.json();



        // =================================
        // FIND FACTION
        // =================================


        const faction =
            factions.find(
                item =>
                    item.id === factionId
            );


        if (!faction) {

            document.querySelector(
                ".faction-page"
            ).innerHTML = `

                <section class="team-section">

                    <h1>
                        Faction Not Found
                    </h1>

                    <p>
                        This faction does not exist
                        in the OWL database.
                    </p>

                </section>

            `;

            return;

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


        const officialTeam =
            teamMap[
                faction.tagTeamId
            ] || null;


        const factionMemberIds =
            Array.from(
                new Set(
                    [
                        ...(faction.members || []),

                        ...(
                            faction.singlesMembers ||
                            []
                        ),

                        ...(
                            officialTeam
                                ? officialTeam.members
                                : []
                        ),

                        ...(
                            faction.leader
                                ? [faction.leader]
                                : []
                        )
                    ]
                )
            );


        const factionMemberSet =
            new Set(
                factionMemberIds
            );



        // =================================
        // BASIC INFORMATION
        // =================================


        document.title =
            `${faction.name} | OWL Wrestling`;


        document.getElementById(
            "faction-name"
        ).textContent =
            faction.name;


                document.getElementById(
            "faction-brand"
        ).textContent =
            faction.brand || "";



        // =================================
        // MANAGER / VALET
        // =================================


        if (
            faction.manager
        ) {


            document.getElementById(
                "faction-manager"
            ).textContent =
                faction.manager;


            document.getElementById(
                "faction-manager-section"
            ).hidden =
                false;

        }



        // =================================
        // LOGO
        // =================================


        if (faction.logo) {


            const logo =
                document.getElementById(
                    "faction-logo"
                );


            logo.src =
                faction.logo;


            logo.alt =
                faction.name;


            logo.hidden =
                false;


            document.getElementById(
                "faction-logo-placeholder"
            ).hidden =
                true;

        }



        // =================================
        // OPTIONAL LEADER
        // =================================


        if (faction.leader) {


            const leader =
                wrestlerMap[
                    faction.leader
                ];


            const leaderDisplay =
                document.getElementById(
                    "leader-display"
                );


            const leaderLink =
                document.getElementById(
                    "faction-leader"
                );


            leaderDisplay.hidden =
                false;


            leaderLink.textContent =
                leader
                    ? leader.name
                    : faction.leader;


            leaderLink.href =
                `wrestler.html?id=${encodeURIComponent(faction.leader)}`;

        }



        // =================================
        // OFFICIAL TAG TEAM
        // =================================


        const officialTeamCard =
            document.getElementById(
                "official-team-card"
            );


        if (officialTeam) {


            const memberNames =
                officialTeam.members

                    .map(
                        memberId => {

                            const wrestler =
                                wrestlerMap[
                                    memberId
                                ];


                            return wrestler
                                ? wrestler.name
                                : memberId;

                        }
                    )

                    .join(" & ");


            officialTeamCard.href =
                `team.html?id=${encodeURIComponent(officialTeam.id)}`;


            officialTeamCard.innerHTML = `

                <span class="official-team-label">
                    OFFICIAL TEAM
                </span>

                <strong>
                    ${officialTeam.name}
                </strong>

                <p>
                    ${memberNames}
                </p>

                <span class="official-team-link">
                    View Team →
                </span>

            `;

        }



        // =================================
        // SINGLES MEMBERS
        // =================================


        const singlesMembers =
            faction.singlesMembers ||
            [];


        if (
            singlesMembers.length > 0
        ) {


            const singlesSection =
                document.getElementById(
                    "singles-members-section"
                );


            const singlesGrid =
                document.getElementById(
                    "singles-member-grid"
                );


            singlesSection.hidden =
                false;


            singlesMembers.forEach(
                memberId => {


                    const wrestler =
                        wrestlerMap[
                            memberId
                        ];


                    const card =
                        document.createElement(
                            "a"
                        );


                    card.href =
                        `wrestler.html?id=${encodeURIComponent(memberId)}`;


                    card.className =
                        "faction-member-card";


                    card.innerHTML = `

                        <strong>
                            ${
                                wrestler
                                    ? wrestler.name
                                    : memberId
                            }
                        </strong>

                        <span>
                            View Profile →
                        </span>

                    `;


                    singlesGrid.appendChild(
                        card
                    );

                }
            );

        }



        // =================================
        // STORY
        // =================================


        if (faction.whyWereHere) {

            document.getElementById(
                "faction-story"
            ).textContent =
                faction.whyWereHere;

        }



        // =================================
        // CHAMPIONSHIPS
        // =================================


        if (
            faction.championshipsHeld &&
            faction.championshipsHeld.length > 0
        ) {


            const section =
                document.getElementById(
                    "faction-championship-section"
                );


            const container =
                document.getElementById(
                    "faction-championships"
                );


            faction.championshipsHeld.forEach(
                championship => {


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "team-accomplishment";


                    item.textContent =
                        championship;


                    container.appendChild(
                        item
                    );

                }
            );


            section.hidden =
                false;

        }



        // =================================
        // AWARDS
        // =================================


        if (
            faction.awards &&
            faction.awards.length > 0
        ) {


            const section =
                document.getElementById(
                    "faction-awards-section"
                );


            const container =
                document.getElementById(
                    "faction-awards"
                );


            faction.awards.forEach(
                award => {


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "team-accomplishment";


                    item.textContent =
                        award;


                    container.appendChild(
                        item
                    );

                }
            );


            section.hidden =
                false;

        }



        // =================================
        // MATCH HELPERS
        // =================================


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



        function getFactionSide(match) {


            const sidesWithFactionMembers =
                match.sides

                    .map(
                        (side, index) => {


                            const factionMembersOnSide =
                                side.wrestlers.filter(
                                    wrestlerId =>

                                        factionMemberSet.has(
                                            wrestlerId
                                        )
                                );


                            return {

                                index:
                                    index,

                                count:
                                    factionMembersOnSide.length

                            };

                        }
                    )

                    .filter(
                        item =>
                            item.count > 0
                    );


            if (
                sidesWithFactionMembers.length !== 1
            ) {

                return -1;

            }


            return sidesWithFactionMembers[0]
                .index;

        }



        function getFactionOutcome(match) {


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


            const factionSide =
                getFactionSide(
                    match
                );


            if (
                factionSide ===
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



        function formatFactionSide(side) {


            const factionParticipants =
                side.wrestlers.filter(
                    wrestlerId =>

                        factionMemberSet.has(
                            wrestlerId
                        )
                );


            const outsiders =
                side.wrestlers.filter(
                    wrestlerId =>

                        !factionMemberSet.has(
                            wrestlerId
                        )
                );


            const officialTeamIsComplete =
                officialTeam

                    ? officialTeam.members.every(
                        memberId =>

                            factionParticipants.includes(
                                memberId
                            )
                    )

                    : false;


            const exactOfficialTeam =
                officialTeamIsComplete &&
                factionParticipants.length ===
                    officialTeam.members.length &&
                outsiders.length === 0;


            const fullFaction =
                factionParticipants.length ===
                    factionMemberIds.length &&
                outsiders.length === 0;


            if (
                exactOfficialTeam ||
                fullFaction
            ) {

                return faction.name;

            }


            return formatSide(
                side
            );

        }



        function formatMatch(match) {


            const factionSide =
                getFactionSide(
                    match
                );


            return match.sides

                .map(
                    (side, index) => {


                        if (
                            index === factionSide
                        ) {

                            return formatFactionSide(
                                side
                            );

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
        // FACTION MATCHES
        // =================================


        const factionMatches =
            matches.filter(
                match =>

                    getFactionSide(
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
                        getFactionOutcome(
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
        // RECORDS
        // =================================


        document.getElementById(
            "faction-overall-record"
        ).textContent =
            calculateRecord(
                factionMatches
            );


        const ppvMatches =
            factionMatches.filter(
                match =>

                    String(
                        match.eventType || ""
                    ).toLowerCase()
                    === "ppv"
            );


        document.getElementById(
            "faction-ppv-record"
        ).textContent =
            calculateRecord(
                ppvMatches
            );



        // =================================
        // MATCH HISTORY
        // =================================


        const history =
            document.getElementById(
                "faction-match-history"
            );


        if (
            factionMatches.length === 0
        ) {


            document.getElementById(
                "faction-no-matches"
            ).hidden =
                false;


            document.querySelector(
                ".match-table"
            ).hidden =
                true;


            return;

        }


        factionMatches.sort(
            (a, b) =>

                new Date(b.date)
                -
                new Date(a.date)
        );


        factionMatches.forEach(
            match => {


                const outcome =
                    getFactionOutcome(
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
            "Could not load faction profile:",
            error
        );


        document.querySelector(
            ".faction-page"
        ).innerHTML = `

            <section class="team-section">

                <h1>
                    Faction Profile Could Not Load
                </h1>

                <p>
                    There was a problem loading
                    the OWL faction database.
                </p>

            </section>

        `;

    }

}



loadFactionProfile();
