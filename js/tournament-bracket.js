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
        numericFieldSize === 16
    ) {

        return [

            "Round of 16",

            "Quarterfinals",

            "Semifinals",

            "Final"

        ];

    }


    if (
        numericFieldSize === 28
    ) {

        return [

            "Opening Round",

            "Round of 16",

            "Quarterfinals",

            "Semifinals",

            "Final"

        ];

    }


    return [

        "Opening Round",

        "Quarterfinals",

        "Semifinals",

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

                                    getTournamentBracketMatchSideLabel(

                                        bracket,

                                        match,

                                        "participantTwoId",

                                        "sourceTwoMatchId",

                                        wrestlers,

                                        teams

                                    );


                                                                const matchupLabel =

                                    match.isBye

                                        ? `${participantOneLabel} — BYE`

                                        : `${participantOneLabel} vs ${participantTwoLabel}`;


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


                                const isTournamentWinner =

                                    Boolean(
                                        winnerLabel
                                    )

                                    &&

                                    bracketSetup.winnerId ===
                                        match.winnerId;


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


                                const resultPrefix =

                                    match.isBye

                                        ? "ADVANCES"

                                        : isTournamentWinner

                                            ? "TOURNAMENT WINNER"

                                            : "WINNER";


                                const resultName =

                                    winnerLabel

                                    ||

                                    (

                                        match.isBye

                                            ? participantOneLabel

                                            : ""

                                    );


                                return `

                                    <article class="${matchClassName}">

                                        <span>
                                            ${
                                                match.isBye

                                                    ? "BYE"

                                                    : isCompletedMatch

                                                        ? `MATCH ${matchNumber} • COMPLETE`

                                                        : `MATCH ${matchNumber}`
                                            }
                                        </span>

                                        <strong>
                                            ${escapeTournamentBracketText(
                                                matchupLabel
                                            )}
                                        </strong>

                                        ${
                                            resultName

                                                ? `

                                                    <small class="tournament-round-match-result">

                                                        ${escapeTournamentBracketText(
                                                            resultPrefix
                                                        )}:

                                                        ${escapeTournamentBracketText(
                                                            resultName
                                                        )}

                                                    </small>

                                                `

                                                : ""
                                        }

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


    document.getElementById(
        "tournament-bracket-description"
    ).textContent =

        `This bracket will crown the inaugural ${bracket.name} and establish the first titleholder in this division.`;


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
