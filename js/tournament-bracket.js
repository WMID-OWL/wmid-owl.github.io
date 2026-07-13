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



function renderParticipantSlots(
    bracket
) {


    const participantGrid =

        document.getElementById(
            "tournament-participant-grid"
        );


    const participantCount =

        Number(
            bracket.fieldSize || 0
        );


    participantGrid.innerHTML =

        Array.from(

            {

                length:
                    participantCount

            },

            (
                unusedValue,
                index
            ) => `

                <article class="tournament-participant-slot">

                    <span>
                        ${index + 1}
                    </span>

                    <strong>
                        Participant TBD
                    </strong>

                    <small>
                        ${escapeTournamentBracketText(
                            bracket.fieldUnit === "Teams"
                                ? "Team Slot"
                                : "Competitor Slot"
                        )}
                    </small>

                </article>

            `

        ).join("");

}



function renderRoundShell(
    bracket
) {


    const roundGrid =

        document.getElementById(
            "tournament-round-grid"
        );


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



function renderTournamentBracketPage(
    tournament,
    bracket
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
        bracket
    );


    renderRoundShell(
        bracket
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


        const response =

            await fetch(
                "data/tournaments.json"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `Tournament request failed: ${response.status}`
            );

        }


        const database =

            await response.json();


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
            bracket
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
