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


function isInauguralTournament(
    tournament
) {
    return tournament.id ===
        "inaugural-championship-series";
}


function getTournamentPublicCopy(
    tournament
) {
    if (
        isInauguralTournament(
            tournament
        )
    ) {
        return {
            placeholderLabel:
                "FOUNDING SERIES",

            summaryEyebrow:
                "TOURNAMENT SCALE",

            summaryTitle:
                "The First Fight for Gold",

            summaryDescription:
                "Ten championship brackets will determine the first titleholders in OWL history.",

            bracketEyebrow:
                "CHAMPIONSHIP BRACKETS",

            bracketTitle:
                "Choose a Division",

            bracketDescription:
                "Select a championship to view its participants, rounds, progress, results, and eventual inaugural champion.",

            bracketCountLabel:
                "Championship Brackets",

            winnerCountLabel:
                "Inaugural Champions"
        };
    }


    return {
        placeholderLabel:
            tournament.badge ||
            "TOURNAMENT SERIES",

        summaryEyebrow:
            "TOURNAMENT FORMAT",

        summaryTitle:
            tournament.name ||
            "Tournament Overview",

        summaryDescription:
            tournament.purpose ||
            "Tournament details will be announced.",

        bracketEyebrow:
            "TOURNAMENT BRACKETS",

        bracketTitle:
            "Choose a Bracket",

        bracketDescription:
            "Select a bracket to view its participants, rounds, progress, results, and eventual winner.",

        bracketCountLabel:
            "Tournament Brackets",

        winnerCountLabel:
            "Tournament Winners"
    };
}


function renderTournamentPublicCopy(
    tournament
) {
    const publicCopy =
        getTournamentPublicCopy(
            tournament
        );


    const placeholderLabel =
        document.querySelector(
            "#tournament-image-placeholder small"
        );


    if (placeholderLabel) {
        placeholderLabel.textContent =
            publicCopy.placeholderLabel;
    }


    const summaryHeading =
        document.querySelector(
            ".tournament-summary-section .tournament-section-heading"
        );


    if (summaryHeading) {
        const eyebrow =
            summaryHeading.querySelector(
                ".tournament-eyebrow"
            );


        const title =
            summaryHeading.querySelector(
                "h2"
            );


        const description =
            summaryHeading.querySelector(
                ":scope > p"
            );


        if (eyebrow) {
            eyebrow.textContent =
                publicCopy.summaryEyebrow;
        }


        if (title) {
            title.textContent =
                publicCopy.summaryTitle;
        }


        if (description) {
            description.textContent =
                publicCopy.summaryDescription;


            description.style.whiteSpace =
                "pre-line";
        }
    }


    const bracketHeading =
        document.querySelector(
            ".tournament-brackets-section .tournament-section-heading"
        );


    if (bracketHeading) {
        const eyebrow =
            bracketHeading.querySelector(
                ".tournament-eyebrow"
            );


        const title =
            bracketHeading.querySelector(
                "h2"
            );


        const description =
            bracketHeading.querySelector(
                ":scope > p"
            );


        if (eyebrow) {
            eyebrow.textContent =
                publicCopy.bracketEyebrow;
        }


        if (title) {
            title.textContent =
                publicCopy.bracketTitle;
        }


        if (description) {
            description.textContent =
                publicCopy.bracketDescription;
        }
    }


    return publicCopy;
}


function renderTournamentSummary(
    tournament,
    publicCopy
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


    const singlesSlots =
        brackets
            .filter(
                bracket =>
                    bracket.fieldUnit ===
                        "Competitors"
            )
            .reduce(
                (
                    total,
                    bracket
                ) =>
                    total +
                    Number(
                        bracket.fieldSize || 0
                    ),
                0
            );


    const teamSlots =
        brackets
            .filter(
                bracket =>
                    bracket.fieldUnit ===
                        "Teams"
            )
            .reduce(
                (
                    total,
                    bracket
                ) =>
                    total +
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
                publicCopy.bracketCountLabel
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
                brackets.length,

            label:
                publicCopy.winnerCountLabel
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


function getTournamentGroupCopy(
    tournament,
    groupKey
) {
    const inaugural =
        isInauguralTournament(
            tournament
        );


    const groupCopy = {
        Ascension: {
            label:
                "Ascension",

            description:

                inaugural

                    ? "The four championships belonging to OWL Ascension."

                    : "Tournament brackets assigned to OWL Ascension."
        },

        Revolt: {
            label:
                "Revolt",

            description:

                inaugural

                    ? "The four championships belonging to OWL Revolt."

                    : "Tournament brackets assigned to OWL Revolt."
        },

        Shared: {
            label:

                inaugural

                    ? "Shared Championships"

                    : "Shared OWL Brackets",

            description:

                inaugural

                    ? "The Twin Talon championships defended across both brands."

                    : "Tournament brackets involving competitors from both brands."
        }
    };


    return groupCopy[
        groupKey
    ];
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


    if (
        brackets.length ===
            0
    ) {
        bracketGroups.innerHTML = `

            <section class="tournament-state">

                <strong>
                    BRACKETS NOT CREATED
                </strong>

                <p>
                    Tournament brackets will appear here after they are added in the OWL Control Room.
                </p>

            </section>

        `;


        return;
    }


    const groupOrder = [
        "Ascension",
        "Revolt",
        "Shared"
    ];


    bracketGroups.innerHTML =
        groupOrder.map(
            groupKey => {
                const groupBrackets =
                    brackets.filter(
                        bracket =>
                            bracket.brand ===
                                groupKey
                    );


                if (
                    groupBrackets.length ===
                        0
                ) {
                    return "";
                }


                const groupCopy =
                    getTournamentGroupCopy(
                        tournament,
                        groupKey
                    );


                return `

                    <section class="tournament-bracket-group">

                        <div class="tournament-bracket-group-heading">

                            <div>

                                <span>
                                    ${escapeTournamentPageText(
                                        groupCopy.label
                                    )}
                                </span>

                                <h3>
                                    ${escapeTournamentPageText(
                                        groupCopy.description
                                    )}
                                </h3>

                            </div>

                            <strong>
                                ${groupBrackets.length}
                                ${
                                    groupBrackets.length === 1

                                        ? "BRACKET"

                                        : "BRACKETS"
                                }
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


    const purposeElement =
        document.getElementById(
            "tournament-purpose"
        );


    purposeElement.textContent =
        tournament.purpose ||
        "Tournament details will be announced.";


    purposeElement.style.whiteSpace =
        "pre-line";


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


    if (imagePath) {
        imageElement.src =
            imagePath;


        imageElement.alt =
            tournament.name;


        imageElement.hidden =
            false;


        imagePlaceholder.hidden =
            true;
    }

    else {
        imageElement.hidden =
            true;


        imagePlaceholder.hidden =
            false;
    }


    const publicCopy =
        renderTournamentPublicCopy(
            tournament
        );


    renderTournamentSummary(
        tournament,
        publicCopy
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


        if (!tournamentId) {
            throw new Error(
                "No tournament ID supplied."
            );
        }


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


        const tournament =
            tournaments.find(
                entry =>
                    entry.id ===
                        tournamentId
            );


        if (!tournament) {
            throw new Error(
                "Tournament not found."
            );
        }


        renderTournamentPage(
            tournament
        );
    }

    catch (error) {
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
