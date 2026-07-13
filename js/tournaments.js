// =================================
// OWL ONE-OFF TOURNAMENT DIRECTORY
// =================================


const tournamentDirectoryGrid =

    document.getElementById(
        "tournament-directory-grid"
    );


const tournamentDirectoryLoading =

    document.getElementById(
        "tournament-directory-loading"
    );


const tournamentDirectoryError =

    document.getElementById(
        "tournament-directory-error"
    );


const tournamentDirectoryEmpty =

    document.getElementById(
        "tournament-directory-empty"
    );



function escapeTournamentText(
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



function getTournamentStatusClass(
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



function renderTournamentDirectory(
    tournaments
) {


    tournamentDirectoryGrid.innerHTML =
        "";


    const orderedTournaments =

        [...tournaments].sort(

            (
                tournamentA,
                tournamentB
            ) => {


                return Number(
                    tournamentB.year || 0
                )

                -

                Number(
                    tournamentA.year || 0
                );

            }

        );


    orderedTournaments.forEach(

        tournament => {


            const tournamentCard =

                document.createElement(
                    "a"
                );


            tournamentCard.className =
                "tournament-directory-card";


            tournamentCard.href =

                `tournament.html?id=${encodeURIComponent(
                    tournament.id
                )}`;


            const imagePath =

                String(
                    tournament.image || ""
                ).trim();


            const statusClass =

                getTournamentStatusClass(
                    tournament.status
                );


            const stats =

                Array.isArray(
                    tournament.directoryStats
                )

                    ? tournament.directoryStats

                    : [];


            tournamentCard.innerHTML = `

                <div class="tournament-card-visual">

                    ${
                        imagePath

                            ? `

                                <img
                                    src="${escapeTournamentText(
                                        imagePath
                                    )}"
                                    alt="${escapeTournamentText(
                                        tournament.name
                                    )}"
                                >

                            `

                            : `

                                <div class="tournament-card-placeholder">

                                    <span>
                                        OWL
                                    </span>

                                    <strong>
                                        ${escapeTournamentText(
                                            tournament.year
                                        )}
                                    </strong>

                                    <small>
                                        TOURNAMENT SERIES
                                    </small>

                                </div>

                            `
                    }

                </div>


                <div class="tournament-card-content">


                    <div class="tournament-card-topline">


                        <span class="tournament-card-badge">
                            ${escapeTournamentText(
                                tournament.badge
                            )}
                        </span>


                        <span class="tournament-card-year">
                            ${escapeTournamentText(
                                tournament.year
                            )}
                        </span>


                    </div>


                    <h3>
                        ${escapeTournamentText(
                            tournament.name
                        )}
                    </h3>


                    <p>
                        ${escapeTournamentText(
                            tournament.purpose
                        )}
                    </p>


                    <div class="tournament-card-stats">

                        ${stats.map(

                            stat => `

                                <div>

                                    <strong>
                                        ${escapeTournamentText(
                                            stat.value
                                        )}
                                    </strong>

                                    <span>
                                        ${escapeTournamentText(
                                            stat.label
                                        )}
                                    </span>

                                </div>

                            `

                        ).join("")}

                    </div>


                    <div class="tournament-card-footer">


                        <span
                            class="tournament-status tournament-status-${escapeTournamentText(
                                statusClass
                            )}"
                        >
                            ${escapeTournamentText(
                                tournament.status
                            )}
                        </span>


                        <strong>
                            Open Tournament →
                        </strong>


                    </div>


                </div>

            `;


            tournamentDirectoryGrid.appendChild(
                tournamentCard
            );

        }

    );


    tournamentDirectoryLoading.hidden =
        true;


    tournamentDirectoryGrid.hidden =
        false;

}



async function loadTournamentDirectory() {


    try {


        const response =

            await fetch(
                "data/tournaments.json"
            );


        if (!response.ok) {

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


        tournamentDirectoryLoading.hidden =
            true;


        if (
            tournaments.length === 0
        ) {

            tournamentDirectoryEmpty.hidden =
                false;

            return;

        }


        renderTournamentDirectory(
            tournaments
        );

    }


    catch (
        error
    ) {


        console.error(
            "Tournament directory error:",
            error
        );


        tournamentDirectoryLoading.hidden =
            true;


        tournamentDirectoryError.hidden =
            false;

    }

}



loadTournamentDirectory();
