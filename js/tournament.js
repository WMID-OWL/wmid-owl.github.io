// =================================
// OWL TOURNAMENT PAGE
// =================================


const tournamentLoading =

    document.getElementById(
        "tournament-loading"
    );


const tournamentError =

    document.getElementById(
        "tournament-error"
    );


const tournamentContent =

    document.getElementById(
        "tournament-content"
    );



function escapeTournamentPageText(
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



function getTournamentPageId() {


    const parameters =

        new URLSearchParams(
            window.location.search
        );


    return parameters.get(
        "id"
    );

}



function getTournamentPageStatusClass(
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



function renderTournamentSummary(
    tournament
) {


    const summaryGrid =

        document.getElementById(
            "tournament-summary-grid"
        );


    const brackets =

        Array.isArray(
            tournament.brackets
        )

            ? tournament.brackets

            : [];


    const singlesBrackets =

        brackets.filter(

            bracket =>

                bracket.fieldUnit ===
                "Competitors"

        );


    const tagBrackets =

        brackets.filter(

            bracket =>

                bracket.fieldUnit ===
                "Teams"

        );


    const singlesSlots =

        singlesBrackets.reduce(

            (
                total,
                bracket
            ) =>

                total

                +

                Number(
                    bracket.fieldSize || 0
                ),

            0

        );


    const teamSlots =

        tagBrackets.reduce(

            (
                total,
                bracket
            ) =>

                total

                +

                Number(
                    bracket.fieldSize || 0
                ),

            0

        );


    const summaryItems = [

        {

            value:
                brackets.length,

            label:
                "Championship Brackets"

        },

        {

            value:
                singlesSlots,

            label:
                "Singles Competitor Slots"

        },

        {

            value:
                teamSlots,

            label:
                "Tag Team Slots"

        },

        {

            value:
                "10",

            label:
                "Inaugural Champions"

        }

    ];


    summaryGrid.innerHTML =

        summaryItems.map(

            item => `

                <article class="tournament-summary-card">

                    <strong>
                        ${escapeTournamentPageText(
                            item.value
                        )}
                    </strong>

                    <span>
                        ${escapeTournamentPageText(
                            item.label
                        )}
                    </span>

                </article>

            `

        ).join("");

}



function renderTournamentBracketGroups(
    tournament
) {


    const bracketGroups =

        document.getElementById(
            "tournament-bracket-groups"
        );


    const brackets =

        Array.isArray(
            tournament.brackets
        )

            ? tournament.brackets

            : [];


    const groupOrder = [

        {

            key:
                "Ascension",

            label:
                "Ascension",

            description:
                "The four championships belonging to OWL Ascension."

        },

        {

            key:
                "Revolt",

            label:
                "Revolt",

            description:
                "The four championships belonging to OWL Revolt."

        },

        {

            key:
                "Shared",

            label:
                "Shared Championships",

            description:
                "The Twin Talon championships defended across both brands."

        }

    ];


    bracketGroups.innerHTML =

        groupOrder.map(

            group => {


                const groupBrackets =

                    brackets.filter(

                        bracket =>

                            bracket.brand ===
                            group.key

                    );


                if (
                    groupBrackets.length === 0
                ) {

                    return "";

                }


                return `

                    <section class="tournament-bracket-group">


                        <div class="tournament-bracket-group-heading">


                            <div>

                                <span>
                                    ${escapeTournamentPageText(
                                        group.label
                                    )}
                                </span>

                                <h3>
                                    ${escapeTournamentPageText(
                                        group.description
                                    )}
                                </h3>

                            </div>


                            <strong>
                                ${groupBrackets.length}
                                BRACKETS
                            </strong>


                        </div>



                        <div class="tournament-bracket-grid">

                            ${groupBrackets.map(

                                bracket => `

                                    <a
                                        class="tournament-bracket-card"
                                        href="tournament-bracket.html?tournament=${encodeURIComponent(
                                            tournament.id
                                        )}&bracket=${encodeURIComponent(
                                            bracket.id
                                        )}"
                                    >

                                        <div class="tournament-bracket-card-topline">

                                            <span>
                                                ${escapeTournamentPageText(
                                                    bracket.division
                                                )}
                                            </span>

                                            <strong>
                                                ${escapeTournamentPageText(
                                                    bracket.status
                                                )}
                                            </strong>

                                        </div>


                                        <h4>
                                            ${escapeTournamentPageText(
                                                bracket.name
                                            )}
                                        </h4>


                                        <div class="tournament-bracket-card-footer">

                                            <span>

                                                ${escapeTournamentPageText(
                                                    bracket.fieldSize
                                                )}

                                                ${escapeTournamentPageText(
                                                    bracket.fieldUnit
                                                )}

                                            </span>

                                            <strong>
                                                Open Bracket →
                                            </strong>

                                        </div>

                                    </a>

                                `

                            ).join("")}

                        </div>


                    </section>

                `;

            }

        ).join("");

}



function renderTournamentPage(
    tournament
) {


    document.title =

        `${tournament.name} | OWL Signature Series`;


    document.getElementById(
        "tournament-name"
    ).textContent =
        tournament.name;


    document.getElementById(
        "tournament-year"
    ).textContent =
        tournament.year;


    document.getElementById(
        "tournament-placeholder-year"
    ).textContent =
        tournament.year;


    document.getElementById(
        "tournament-badge"
    ).textContent =
        tournament.badge || "";


    document.getElementById(
        "tournament-purpose"
    ).textContent =
        tournament.purpose || "";


    const statusElement =

        document.getElementById(
            "tournament-status"
        );


    statusElement.textContent =
        tournament.status || "";


    statusElement.className =

        `tournament-status tournament-status-${getTournamentPageStatusClass(
            tournament.status
        )}`;


    const imagePath =

        String(
            tournament.image || ""
        ).trim();


    const imageElement =

        document.getElementById(
            "tournament-image"
        );


    const imagePlaceholder =

        document.getElementById(
            "tournament-image-placeholder"
        );


    if (
        imagePath
    ) {


        imageElement.src =
            imagePath;


        imageElement.alt =
            tournament.name;


        imageElement.hidden =
            false;


        imagePlaceholder.hidden =
            true;

    }


    renderTournamentSummary(
        tournament
    );


    renderTournamentBracketGroups(
        tournament
    );


    tournamentLoading.hidden =
        true;


    tournamentContent.hidden =
        false;

}



async function loadTournamentPage() {


    try {


        const tournamentId =

            getTournamentPageId();


        if (
            !tournamentId
        ) {

            throw new Error(
                "No tournament ID supplied."
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


        renderTournamentPage(
            tournament
        );

    }


    catch (
        error
    ) {


        console.error(
            "Tournament page error:",
            error
        );


        tournamentLoading.hidden =
            true;


        tournamentError.hidden =
            false;

    }

}



loadTournamentPage();
