// =================================
// OWL TOURNAMENT BRACKET PAGE
// =================================


const tournamentBracketLoading =

    document.getElementById(
        "tournament-bracket-loading"
    );


const tournamentBracketError =

    document.getElementById(
        "tournament-bracket-error"
    );


const tournamentBracketContent =

    document.getElementById(
        "tournament-bracket-content"
    );



function escapeTournamentBracketText(
    value
) {


    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}



function getTournamentBracketParameters() {


    const parameters =

        new URLSearchParams(
            window.location.search
        );


    return {

        tournamentId:
            parameters.get(
                "tournament"
            ),

        bracketId:
            parameters.get(
                "bracket"
            )

    };

}



function getBracketStatusClass(
    status
) {


    return String(
        status || ""
    )

        .trim()

        .toLowerCase()

        .replaceAll(
            " ",
            "-"
        );

}



function getRoundNames(
    fieldSize
) {
    const numericFieldSize =
        Number(
            fieldSize || 0
        );


    if (
        numericFieldSize ===
            28
    ) {
        return [
            "Opening Round",
            "Brand Quarterfinals",
            "Brand Semifinals",
            "Brand Finals",
            "Twin Talon Final"
        ];
    }


    if (
        numericFieldSize ===
            16
    ) {
        return [
            "Round of 16",
            "Quarterfinals",
            "Semifinals",
            "Final"
        ];
    }


    if (
        numericFieldSize ===
            8
    ) {
        return [
            "Quarterfinals",
            "Semifinals",
            "Final"
        ];
    }


    if (
        numericFieldSize ===
            4
    ) {
        return [
            "Semifinals",
            "Final"
        ];
    }


    return [
        "Final"
    ];
}


function getTournamentBracketWrestlerById(
    wrestlers,
    wrestlerId
) {


    return wrestlers.find(

        wrestler =>

            wrestler.id ===
            wrestlerId

    ) || null;

}



function getTournamentBracketTeamById(
    teams,
    teamId
) {


    return teams.find(

        team =>

            team.id ===
            teamId

    ) || null;

}



function getTournamentBracketEntrant(
    bracket,
    participantId,
    wrestlers,
    teams
) {


    if (
        !participantId
    ) {

        return null;

    }


    if (
        bracket.participantType ===
        "team"
    ) {

        return getTournamentBracketTeamById(

            teams,

            participantId

        );

    }


    return getTournamentBracketWrestlerById(

        wrestlers,

        participantId

    );

}



function getTournamentBracketEntrantDetail(
    bracket,
    entrant,
    wrestlers
) {


    if (
        !entrant
    ) {

        return "Database record unavailable";

    }


    if (
        bracket.participantType ===
        "team"
    ) {


        const memberIds =

            Array.isArray(
                entrant.members
            )

                ? entrant.members

                : [];


        const memberNames =

            memberIds.map(

                memberId =>

                    getTournamentBracketWrestlerById(

                        wrestlers,

                        memberId

                    )?.name

                    ||

                    "Unknown Member"

            );


        return memberNames.length > 0

            ? memberNames.join(
                " & "
            )

            : "Official Tag Team";

    }


    return [

        entrant.brand,

        entrant.division

    ]

        .filter(
            Boolean
        )

        .join(
            " • "
        )

        ||

        "Singles Competitor";

}

function renderParticipantSlots(
    bracket,
    wrestlers,
    teams
) {


    const participantGrid =

        document.getElementById(
            "tournament-participant-grid"
        );


    const participantCount =

        Number(
            bracket.fieldSize || 0
        );


    const lockedParticipants =

        bracket.fieldLocked

        &&

        Array.isArray(
            bracket.participants
        )

            ? bracket.participants

            : [];


    participantGrid.innerHTML =

        Array.from(

            {

                length:
                    participantCount

            },

            (
                unusedValue,
                index
            ) => {


                const participantId =

                    lockedParticipants[
                        index
                    ]

                    ||

                    "";


                const entrant =

                    getTournamentBracketEntrant(

                        bracket,

                        participantId,

                        wrestlers,

                        teams

                    );


                const entrantName =

                    participantId

                        ? entrant?.name

                            ||

                            "Participant Unavailable"

                        : "Participant TBD";


                const entrantDetail =

                    participantId

                        ? getTournamentBracketEntrantDetail(

                            bracket,

                            entrant,

                            wrestlers

                        )

                        : bracket.fieldUnit ===
                            "Teams"

                            ? "Team Slot"

                            : "Competitor Slot";


                return `

                    <article class="tournament-participant-slot">

                        <span>
                            ${index + 1}
                        </span>

                        <strong>
                            ${escapeTournamentBracketText(
                                entrantName
                            )}
                        </strong>

                        <small>
                            ${escapeTournamentBracketText(
                                entrantDetail
                            )}
                        </small>

                    </article>

                `;

            }

        ).join("");

}


function getSavedTournamentBracketSetup(
    bracket
) {


    const bracketSetup =
        bracket?.bracketSetup;


    if (
        !bracketSetup

        ||

        Array.isArray(
            bracketSetup
        )

        ||

        typeof bracketSetup !==
            "object"
    ) {

        return {

            generated:
                false,

            generatedAt:
                "",

            rounds:
                [],

            winnerId:
                ""

        };

    }


    return bracketSetup;

}



function getTournamentBracketSourceLabel(
    sourceMatchId
) {


    const sourceMatch =

        /^round-(\d+)-match-(\d+)$/.exec(

            String(
                sourceMatchId || ""
            )

        );


    if (
        !sourceMatch
    ) {

        return "Previous-Round Winner";

    }


    return `Winner of Round ${sourceMatch[1]} Match ${sourceMatch[2]}`;

}



function getTournamentBracketMatchSideLabel(
    bracket,
    match,
    participantProperty,
    sourceProperty,
    wrestlers,
    teams
) {


    const participantId =

        match[
            participantProperty
        ];


    if (
        participantId
    ) {


        const entrant =

            getTournamentBracketEntrant(

                bracket,

                participantId,

                wrestlers,

                teams

            );


        return entrant?.name

            ||

            "Participant Unavailable";

    }


    const sourceMatchId =

        match[
            sourceProperty
        ];


    if (
        sourceMatchId
    ) {

        return getTournamentBracketSourceLabel(
            sourceMatchId
        );

    }


    return "TBD";

}


function getTournamentBracketMatchWinnerLabel(
    bracket,
    match,
    wrestlers,
    teams
) {


    if (
        !match?.winnerId
    ) {

        return "";

    }


    const winner =

        getTournamentBracketEntrant(

            bracket,

            match.winnerId,

            wrestlers,

            teams

        );


    return winner?.name

        ||

        "Winner Unavailable";

}

function renderPendingTournamentRounds(
    bracket,
    roundGrid
) {


    const roundNames =

        getRoundNames(
            bracket.fieldSize
        );


    roundGrid.innerHTML =

        roundNames.map(

            (
                roundName,
                roundIndex
            ) => `

                <section class="tournament-round-column">


                    <div class="tournament-round-heading">


                        <span>
                            ROUND ${roundIndex + 1}
                        </span>


                        <h3>
                            ${escapeTournamentBracketText(
                                roundName
                            )}
                        </h3>


                    </div>


                    <div class="tournament-round-match-list">


                        <article class="tournament-round-match">

                            <span>
                                MATCHUPS PENDING
                            </span>

                            <strong>
                                —
                            </strong>

                        </article>


                    </div>


                </section>

            `

        ).join("");

}



function renderRoundShell(
    bracket,
    wrestlers,
    teams
) {


    const roundGrid =

        document.getElementById(
            "tournament-round-grid"
        );


    const bracketSetup =

        getSavedTournamentBracketSetup(
            bracket
        );


    if (
        !bracketSetup.generated

        ||

        !Array.isArray(
            bracketSetup.rounds
        )

        ||

        bracketSetup.rounds.length ===
            0
    ) {


        renderPendingTournamentRounds(

            bracket,

            roundGrid

        );


        return;

    }


    roundGrid.innerHTML =

        bracketSetup.rounds.map(

            (
                round,
                roundIndex
            ) => {


                const roundNumber =

                    Number(
                        round.order
                    )

                    ||

                    roundIndex +
                        1;


                const roundName =

                    round.name

                    ||

                    `Round ${roundNumber}`;


                const matches =

                    Array.isArray(
                        round.matches
                    )

                        ? round.matches

                        : [];


                const matchMarkup =

                    matches.length > 0

                        ? matches.map(

                            (
                                match,
                                matchIndex
                            ) => {


                                const participantOneLabel =

                                    getTournamentBracketMatchSideLabel(

                                        bracket,

                                        match,

                                        "participantOneId",

                                        "sourceOneMatchId",

                                        wrestlers,

                                        teams

                                    );


                                                                const participantTwoLabel =

                                    match.isBye

                                        ? "BYE"

                                        : getTournamentBracketMatchSideLabel(

                                            bracket,

                                            match,

                                            "participantTwoId",

                                            "sourceTwoMatchId",

                                            wrestlers,

                                            teams

                                        );


                                const participantOrder =

                                    Array.isArray(
                                        bracket.participants
                                    )

                                        ? bracket.participants

                                        : [];


                                const participantOneSeedIndex =

                                    match.participantOneId

                                        ? participantOrder.indexOf(
                                            match.participantOneId
                                        )

                                        : -1;


                                const participantTwoSeedIndex =

                                    match.participantTwoId

                                        ? participantOrder.indexOf(
                                            match.participantTwoId
                                        )

                                        : -1;


                                const participantOneSeed =

                                    participantOneSeedIndex >= 0

                                        ? participantOneSeedIndex + 1

                                        : "";


                                const participantTwoSeed =

                                    participantTwoSeedIndex >= 0

                                        ? participantTwoSeedIndex + 1

                                        : "";


                                const winnerLabel =

                                    getTournamentBracketMatchWinnerLabel(

                                        bracket,

                                        match,

                                        wrestlers,

                                        teams

                                    );


                                const isCompletedMatch =

                                    Boolean(
                                        winnerLabel
                                    )

                                    &&

                                    !match.isBye;


                                const isBookedMatch =

                                    Boolean(
                                        match.eventId
                                    )

                                    &&

                                    !match.isBye

                                    &&

                                    !isCompletedMatch;


                                const isFinalRound =

                                    roundIndex ===
                                    bracketSetup.rounds.length - 1;


                                const isTournamentWinner =

                                    Boolean(
                                        winnerLabel
                                    )

                                    &&

                                    isFinalRound

                                    &&

                                    bracketSetup.winnerId ===
                                        match.winnerId;


                                const participantOneIsWinner =

                                    Boolean(
                                        match.winnerId
                                    )

                                    &&

                                    match.winnerId ===
                                        match.participantOneId;


                                const participantTwoIsWinner =

                                    Boolean(
                                        match.winnerId
                                    )

                                    &&

                                    match.winnerId ===
                                        match.participantTwoId;


                                const matchNumber =

                                    Number(
                                        match.order
                                    )

                                    ||

                                    matchIndex +
                                        1;


                                const matchClassName =

                                    [

                                        "tournament-round-match",

                                        match.isBye

                                            ? "tournament-round-match-bye"

                                            : "",

                                        isCompletedMatch

                                            ? "tournament-round-match-completed"

                                            : "",

                                        isTournamentWinner

                                            ? "tournament-round-match-champion"

                                            : ""

                                    ]

                                        .filter(
                                            Boolean
                                        )

                                        .join(
                                            " "
                                        );


                                return `

                                                                        <article
                                        class="${matchClassName}"
                                        data-bracket-match-id="${escapeTournamentBracketText(
                                            match.id || ""
                                        )}"
                                    >

                                        <div class="tournament-round-match-meta">

                                            <span>

                                                ${
                                                    match.isBye

                                                        ? "AUTOMATIC ADVANCEMENT"

                                                        : isCompletedMatch

                                                            ? `MATCH ${matchNumber} • COMPLETE`

                                                            : isBookedMatch

                                                                ? `MATCH ${matchNumber} • BOOKED`

                                                                : `MATCH ${matchNumber}`
                                                }

                                            </span>

                                        </div>


                                        <div class="tournament-bracket-entrant-list">


                                            <div
                                                class="tournament-bracket-entrant${
                                                    participantOneIsWinner

                                                        ||

                                                    match.isBye

                                                        ? " tournament-bracket-entrant-winner"

                                                        : ""
                                                }"
                                            >

                                                <span class="tournament-bracket-seed">

                                                    ${
                                                        participantOneSeed

                                                            ? escapeTournamentBracketText(
                                                                participantOneSeed
                                                            )

                                                            : "—"
                                                    }

                                                </span>

                                                <strong>

                                                    ${escapeTournamentBracketText(
                                                        participantOneLabel
                                                    )}

                                                </strong>

                                            </div>


                                            <div
                                                class="tournament-bracket-entrant${
                                                    participantTwoIsWinner

                                                        ? " tournament-bracket-entrant-winner"

                                                        : ""
                                                }${
                                                    match.isBye

                                                        ? " tournament-bracket-entrant-bye"

                                                        : ""
                                                }"
                                            >

                                                <span class="tournament-bracket-seed">

                                                    ${
                                                        match.isBye

                                                            ? "—"

                                                            : participantTwoSeed

                                                                ? escapeTournamentBracketText(
                                                                    participantTwoSeed
                                                                )

                                                                : "—"
                                                    }

                                                </span>

                                                <strong>

                                                    ${escapeTournamentBracketText(
                                                        participantTwoLabel
                                                    )}

                                                </strong>

                                            </div>


                                        </div>

                                    </article>

                                `;

                            }

                        ).join("")

                        : `

                            <article class="tournament-round-match">

                                <span>
                                    MATCHUPS PENDING
                                </span>

                                <strong>
                                    —
                                </strong>

                            </article>

                        `;


                return `

                    <section class="tournament-round-column">


                        <div class="tournament-round-heading">


                            <span>
                                ROUND ${roundNumber}
                            </span>


                            <h3>
                                ${escapeTournamentBracketText(
                                    roundName
                                )}
                            </h3>


                        </div>


                        <div class="tournament-round-match-list">

                            ${matchMarkup}

                        </div>


                    </section>

                `;

            }

                ).join("");

}


function renderTournamentBracketConnectors(
    bracket
) {


    const roundGrid =

        document.getElementById(
            "tournament-round-grid"
        );


    const bracketSetup =

        getSavedTournamentBracketSetup(
            bracket
        );


    const oldConnectorLayer =

        roundGrid.querySelector(
            ".tournament-bracket-connectors"
        );


    if (
        oldConnectorLayer
    ) {

        oldConnectorLayer.remove();

    }


    if (
        !bracketSetup.generated

        ||

        !Array.isArray(
            bracketSetup.rounds
        )

        ||

        bracketSetup.rounds.length < 2
    ) {

        return;

    }


    window.requestAnimationFrame(

        () => {


            const matchElements =

                new Map(

                    Array.from(

                        roundGrid.querySelectorAll(
                            "[data-bracket-match-id]"
                        )

                    ).map(

                        element => [

                            element.dataset
                                .bracketMatchId,

                            element

                        ]

                    )

                );


            if (
                matchElements.size === 0
            ) {

                return;

            }


            const gridRectangle =

                roundGrid.getBoundingClientRect();


            const svg =

                document.createElementNS(

                    "http://www.w3.org/2000/svg",

                    "svg"

                );


            svg.classList.add(
                "tournament-bracket-connectors"
            );


            svg.setAttribute(
                "aria-hidden",
                "true"
            );


            svg.setAttribute(

                "width",

                Math.ceil(
                    roundGrid.scrollWidth
                )

            );


            svg.setAttribute(

                "height",

                Math.ceil(
                    roundGrid.scrollHeight
                )

            );


            svg.style.position =
                "absolute";

            svg.style.inset =
                "0";

            svg.style.width =
                `${roundGrid.scrollWidth}px`;

            svg.style.height =
                `${roundGrid.scrollHeight}px`;

            svg.style.overflow =
                "visible";

            svg.style.pointerEvents =
                "none";

            svg.style.zIndex =
                "0";


            roundGrid.style.position =
                "relative";


            bracketSetup.rounds.forEach(

                (
                    round,
                    roundIndex
                ) => {


                    if (
                        roundIndex === 0
                    ) {

                        return;

                    }


                    const matches =

                        Array.isArray(
                            round.matches
                        )

                            ? round.matches

                            : [];


                    matches.forEach(

                        match => {


                            const targetElement =

                                matchElements.get(
                                    match.id
                                );


                            if (
                                !targetElement
                            ) {

                                return;

                            }


                            const targetNode =

                                targetElement.querySelector(
                                    ".tournament-bracket-entrant-list"
                                )

                                ||

                                targetElement;


                            const targetRectangle =

                                targetNode
                                    .getBoundingClientRect();


                            const sourceIds = [

                                match.sourceOneMatchId,

                                match.sourceTwoMatchId

                            ].filter(
                                Boolean
                            );


                            sourceIds.forEach(

                                sourceId => {


                                    const sourceElement =

                                        matchElements.get(
                                            sourceId
                                        );


                                    if (
                                        !sourceElement
                                    ) {

                                        return;

                                    }


                                    const sourceNode =

                                        sourceElement.querySelector(
                                            ".tournament-bracket-entrant-list"
                                        )

                                        ||

                                        sourceElement;


                                    const sourceRectangle =

                                        sourceNode
                                            .getBoundingClientRect();


                                    const startX =

                                        sourceRectangle.right

                                        -

                                        gridRectangle.left;


                                    const startY =

                                        sourceRectangle.top

                                        -

                                        gridRectangle.top

                                        +

                                        (
                                            sourceRectangle.height
                                            /
                                            2
                                        );


                                    const endX =

                                        targetRectangle.left

                                        -

                                        gridRectangle.left;


                                    const endY =

                                        targetRectangle.top

                                        -

                                        gridRectangle.top

                                        +

                                        (
                                            targetRectangle.height
                                            /
                                            2
                                        );


                                    const elbowX =

                                        startX

                                        +

                                        (
                                            endX
                                            -
                                            startX
                                        )
                                        /
                                        2;


                                    const glowPath =

                                        document.createElementNS(

                                            "http://www.w3.org/2000/svg",

                                            "path"

                                        );


                                    glowPath.setAttribute(

                                        "d",

                                        `M ${startX} ${startY} H ${elbowX} V ${endY} H ${endX}`

                                    );


                                    glowPath.style.fill =
                                        "none";

                                    glowPath.style.stroke =
                                        "rgba(201, 164, 92, 0.10)";

                                    glowPath.style.strokeWidth =
                                        "5";

                                    glowPath.style.strokeLinejoin =
                                        "round";


                                    const connectorPath =

                                        document.createElementNS(

                                            "http://www.w3.org/2000/svg",

                                            "path"

                                        );


                                    connectorPath.setAttribute(

                                        "d",

                                        `M ${startX} ${startY} H ${elbowX} V ${endY} H ${endX}`

                                    );


                                    connectorPath.style.fill =
                                        "none";

                                    connectorPath.style.stroke =
                                        "rgba(229, 199, 126, 0.58)";

                                    connectorPath.style.strokeWidth =
                                        "1.5";

                                    connectorPath.style.strokeLinejoin =
                                        "round";

                                    connectorPath.style.strokeLinecap =
                                        "square";


                                    svg.appendChild(
                                        glowPath
                                    );


                                    svg.appendChild(
                                        connectorPath
                                    );

                                }

                            );

                        }

                    );

                }

            );


            roundGrid.prepend(
                svg
            );

        }

    );

}


function renderTournamentBracketWinner(
    bracket,
    wrestlers,
    teams
) {


    const winnerElement =

        document.getElementById(
            "tournament-bracket-winner"
        );


    const winnerStatus =

        winnerElement.querySelector(
            "span"
        );


    const winnerName =

        winnerElement.querySelector(
            "strong"
        );


    const winnerDetail =

        winnerElement.querySelector(
            "small"
        );


    const bracketSetup =

        getSavedTournamentBracketSetup(
            bracket
        );


    const winnerId =

        bracketSetup.winnerId

        ||

        "";


    if (
        !winnerId
    ) {


        winnerElement.className =
            "tournament-bracket-winner";


        winnerStatus.textContent =
            "TO BE CROWNED";


        winnerName.textContent =
            "—";


        winnerDetail.textContent =
            "Tournament winner";


        return;

    }


    const winner =

        getTournamentBracketEntrant(

            bracket,

            winnerId,

            wrestlers,

            teams

        );


    const winnerDisplayName =

        winner?.name

        ||

        "Winner Unavailable";


    const entrantDetail =

        getTournamentBracketEntrantDetail(

            bracket,

            winner,

            wrestlers

        );


    winnerElement.className =

        "tournament-bracket-winner tournament-bracket-winner-crowned";


    winnerStatus.textContent =
        "TOURNAMENT WINNER";


    winnerName.textContent =
        winnerDisplayName;


    winnerDetail.textContent =

        `${bracket.name} • ${entrantDetail}`;

}

function renderTournamentBracketPage(
    tournament,
    bracket,
    wrestlers,
    teams
) {


    document.title =

        `${bracket.name} | ${tournament.name}`;


    const backLink =

        document.getElementById(
            "tournament-bracket-back"
        );


    backLink.href =

        `tournament.html?id=${encodeURIComponent(
            tournament.id
        )}`;


    document.getElementById(
        "tournament-bracket-badge"
    ).textContent =
        tournament.badge || "";


    document.getElementById(
        "tournament-bracket-year"
    ).textContent =
        tournament.year || "";


    document.getElementById(
        "tournament-bracket-parent-name"
    ).textContent =
        tournament.name || "";


    document.getElementById(
        "tournament-bracket-name"
    ).textContent =
        bracket.name || "";


    const tournamentBracketDescription =

    bracket.description

    ||

    (
        tournament.id ===
            "inaugural-championship-series"

            ? `This bracket will crown the inaugural ${bracket.name} and establish the first titleholder in this division.`

            : tournament.purpose

                || `This bracket is part of ${tournament.name}.`
    );


document.getElementById(
    "tournament-bracket-description"
).textContent =
    tournamentBracketDescription;


document.getElementById(
    "tournament-bracket-description"
).style.whiteSpace =
    "pre-line";

    document.getElementById(
        "tournament-bracket-brand"
    ).textContent =
        bracket.brand || "";


    document.getElementById(
        "tournament-bracket-division"
    ).textContent =
        bracket.division || "";


    document.getElementById(
        "tournament-bracket-field"
    ).textContent =

        `${bracket.fieldSize} ${bracket.fieldUnit}`;


    const statusElement =

        document.getElementById(
            "tournament-bracket-status"
        );


    statusElement.textContent =
        bracket.status || "";


    statusElement.className =

        `tournament-bracket-status tournament-bracket-status-${getBracketStatusClass(
            bracket.status
        )}`;


        renderParticipantSlots(

        bracket,

        wrestlers,

        teams

    );


                        renderRoundShell(

        bracket,

        wrestlers,

        teams

    );


    renderTournamentBracketConnectors(
        bracket
    );


    window.addEventListener(

        "resize",

        () => {

            renderTournamentBracketConnectors(
                bracket
            );

        },

        {
            passive:
                true
        }

    );


    renderTournamentBracketWinner(

        bracket,

        wrestlers,

        teams

    );


    tournamentBracketLoading.hidden =
        true;


    tournamentBracketContent.hidden =
        false;

}



async function loadTournamentBracketPage() {


    try {


        const {

            tournamentId,
            bracketId

        } = getTournamentBracketParameters();


        if (
            !tournamentId

            ||

            !bracketId
        ) {

            throw new Error(
                "Missing tournament or bracket ID."
            );

        }


               const [

            tournamentResponse,

            wrestlerResponse,

            teamResponse

        ] = await Promise.all([

            fetch(
                "data/tournaments.json"
            ),

            fetch(
                "data/wrestlers.json"
            ),

            fetch(
                "data/teams.json"
            )

        ]);


        if (
            !tournamentResponse.ok
        ) {

            throw new Error(

                `Tournament request failed: ${tournamentResponse.status}`

            );

        }


        if (
            !wrestlerResponse.ok
        ) {

            throw new Error(

                `Wrestler request failed: ${wrestlerResponse.status}`

            );

        }


        if (
            !teamResponse.ok
        ) {

            throw new Error(

                `Team request failed: ${teamResponse.status}`

            );

        }


        const [

            database,

            wrestlerDatabase,

            teamDatabase

        ] = await Promise.all([

            tournamentResponse.json(),

            wrestlerResponse.json(),

            teamResponse.json()

        ]);


        const wrestlers =

            Array.isArray(
                wrestlerDatabase
            )

                ? wrestlerDatabase

                : [];


        const teams =

            Array.isArray(
                teamDatabase
            )

                ? teamDatabase

                : [];


        const tournaments =

            Array.isArray(
                database.tournaments
            )

                ? database.tournaments

                : [];


        const tournament =

            tournaments.find(

                entry =>

                    entry.id ===
                    tournamentId

            );


        if (
            !tournament
        ) {

            throw new Error(
                "Tournament not found."
            );

        }


        const brackets =

            Array.isArray(
                tournament.brackets
            )

                ? tournament.brackets

                : [];


        const bracket =

            brackets.find(

                entry =>

                    entry.id ===
                    bracketId

            );


        if (
            !bracket
        ) {

            throw new Error(
                "Bracket not found."
            );

        }


                renderTournamentBracketPage(

            tournament,

            bracket,

            wrestlers,

            teams

        );

    }


    catch (
        error
    ) {


        console.error(
            "Tournament bracket error:",
            error
        );


        tournamentBracketLoading.hidden =
            true;


        tournamentBracketError.hidden =
            false;

    }

}



loadTournamentBracketPage();
