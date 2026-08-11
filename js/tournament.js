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

// =================================
// TOURNAMENT BROADCASTS
// =================================


function getTournamentBroadcasts(
    tournament
) {


    return Array.isArray(
        tournament?.broadcasts
    )

        ? tournament.broadcasts

        : [];

}



function getTournamentBroadcastStatusClass(
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



function getTournamentBroadcastBracket(
    tournament,
    bracketId
) {


    const brackets =

        Array.isArray(
            tournament?.brackets
        )

            ? tournament.brackets

            : [];


    return brackets.find(

        bracket =>
            bracket.id ===
                bracketId

    ) || null;

}



function getTournamentBroadcastMatch(
    bracket,
    matchId
) {


    const rounds =

        Array.isArray(
            bracket?.bracketSetup?.rounds
        )

            ? bracket.bracketSetup.rounds

            : [];


    for (
        const round
        of rounds
    ) {


        const matches =

            Array.isArray(
                round.matches
            )

                ? round.matches

                : [];


        const match =

            matches.find(

                entry =>
                    entry.id ===
                        matchId

            );


        if (
            match
        ) {


            return {
                round,
                match
            };

        }

    }


    return null;

}



function getTournamentBroadcastEntrantName(
    bracket,
    participantId,
    wrestlers,
    teams
) {


    if (
        !participantId
    ) {

        return "";

    }


    if (
        bracket?.participantType ===
            "team"
    ) {


        const team =

            teams.find(

                entry =>
                    entry.id ===
                        participantId

            );


        return team?.name ||
            "Team Unavailable";

    }


    const wrestler =

        wrestlers.find(

            entry =>
                entry.id ===
                    participantId

        );


    return wrestler?.name ||
        "Competitor Unavailable";

}



function getTournamentBroadcastSourceLabel(
    sourceMatchId
) {


    const sourceMatch =

        /^round-(\d+)-match-(\d+)$/i.exec(

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



function getTournamentBroadcastSideLabel(
    bracket,
    match,
    participantProperty,
    sourceProperty,
    wrestlers,
    teams
) {


    const participantId =

        String(
            match?.[
                participantProperty
            ] || ""
        ).trim();


    if (
        participantId
    ) {


        return getTournamentBroadcastEntrantName(
            bracket,
            participantId,
            wrestlers,
            teams
        );

    }


    const sourceMatchId =

        String(
            match?.[
                sourceProperty
            ] || ""
        ).trim();


    if (
        sourceMatchId
    ) {


        return getTournamentBroadcastSourceLabel(
            sourceMatchId
        );

    }


    return "TBD";

}



function getTournamentBroadcastMatchupLabel(
    bracket,
    match,
    wrestlers,
    teams
) {


    const participantOne =

        getTournamentBroadcastSideLabel(
            bracket,
            match,
            "participantOneId",
            "sourceOneMatchId",
            wrestlers,
            teams
        );


    const participantTwo =

        getTournamentBroadcastSideLabel(
            bracket,
            match,
            "participantTwoId",
            "sourceTwoMatchId",
            wrestlers,
            teams
        );


    if (
        match?.isBye
    ) {


        return `${participantOne} — BYE`;

    }


    return `${participantOne} vs ${participantTwo}`;

}



function renderTournamentBroadcastMatchList(
    tournament,
    matches,
    wrestlers,
    teams
) {


    if (
        matches.length ===
            0
    ) {

        return "";

    }


    return `

        <details class="tournament-broadcast-matches">


            <summary>

                VIEW ${escapeTournamentPageText(
                    matches.length
                )}

                ${
                    matches.length === 1
                        ? "MATCH"
                        : "MATCHES"
                }

            </summary>


            <div class="tournament-broadcast-match-list">


                ${matches.map(

                    (
                        reference,
                        index
                    ) => {


                        const bracket =

                            getTournamentBroadcastBracket(
                                tournament,
                                reference?.bracketId
                            );


                        const matchRecord =

                            bracket

                                ? getTournamentBroadcastMatch(
                                    bracket,
                                    reference?.matchId
                                )

                                : null;


                        if (
                            !bracket
                            ||
                            !matchRecord
                        ) {


                            return `

                                <div class="tournament-broadcast-match tournament-broadcast-match-unavailable">


                                    <span class="tournament-broadcast-match-number">
                                        MATCH ${index + 1}
                                    </span>


                                    <span class="tournament-broadcast-match-bracket">
                                        MATCH REFERENCE
                                    </span>


                                    <strong class="tournament-broadcast-match-matchup">
                                        Match information unavailable
                                    </strong>


                                </div>

                            `;

                        }


                                                const matchup =
                            getTournamentBroadcastMatchupLabel(
                                bracket,
                                matchRecord.match,
                                wrestlers,
                                teams
                            );


                        const graphic =
                            matchRecord.match?.matchGraphic;


                        const graphicSrc =
                            typeof graphic ===
                                "string"

                                ? graphic.trim()

                                : String(
                                    graphic?.src || ""
                                ).trim();


                        const storedOrientation =
                            String(
                                graphic?.orientation || ""
                            )
                                .trim()
                                .toLowerCase();


                        const graphicOrientation =
                            [
                                "portrait",
                                "landscape",
                                "square"
                            ].includes(
                                storedOrientation
                            )

                                ? storedOrientation

                                : "square";


                        const graphicMarkup =
                            graphicSrc

                                ? `
                                    <div
                                        class="tournament-broadcast-match-graphic"
                                    >
                                                                                <div
                                            class="tournament-broadcast-match-graphic-frame"
                                            data-orientation="${escapeTournamentPageText(
                                                graphicOrientation
                                            )}"
                                            role="button"
                                            tabindex="0"
                                            aria-label="${escapeTournamentPageText(
                                                `${matchup} — expand match graphic`
                                            )}"
                                        >
                                            <img
                                                src="${escapeTournamentPageText(
                                                    graphicSrc
                                                )}"
                                                alt="${escapeTournamentPageText(
                                                    `${matchup} match graphic`
                                                )}"
                                                loading="lazy"
                                            >
                                        </div>
                                    </div>
                                `

                                : "";


                        return `
                            <div
                                class="tournament-broadcast-match"
                                data-bracket-id="${escapeTournamentPageText(
                                    bracket.id
                                )}"
                                data-match-id="${escapeTournamentPageText(
                                    matchRecord.match.id
                                )}"
                            >

                                <span class="tournament-broadcast-match-number">
                                    MATCH ${index + 1}
                                </span>

                                <span class="tournament-broadcast-match-bracket">
                                    ${escapeTournamentPageText(
                                        bracket.name
                                    )}
                                </span>

                                <strong class="tournament-broadcast-match-matchup">
                                    ${escapeTournamentPageText(
                                        matchup
                                    )}
                                </strong>

                                ${graphicMarkup}

                            </div>
                        `;

                    }

                ).join("")}


            </div>


        </details>

    `;

}



function renderTournamentBroadcasts(
    tournament,
    wrestlers,
    teams
) {


    const broadcastSection =

        document.getElementById(
            "tournament-broadcasts-section"
        );


    const broadcastGrid =

        document.getElementById(
            "tournament-broadcast-grid"
        );


    const broadcastEmpty =

        document.getElementById(
            "tournament-broadcasts-empty"
        );


    if (
        !broadcastSection
        ||
        !broadcastGrid
        ||
        !broadcastEmpty
    ) {

        return;

    }


    const broadcasts =

        getTournamentBroadcasts(
            tournament
        );


    broadcastGrid.innerHTML =
        "";


    if (
        broadcasts.length ===
            0
    ) {


        broadcastSection.hidden =
            true;


        broadcastEmpty.hidden =
            true;


        return;

    }


    broadcastSection.hidden =
        false;


    const validBroadcasts =

        broadcasts.filter(

            broadcast =>

                broadcast

                &&

                typeof broadcast ===
                    "object"

        );


    if (
        validBroadcasts.length ===
            0
    ) {


        broadcastEmpty.hidden =
            false;


        return;

    }


    broadcastEmpty.hidden =
        true;


    broadcastGrid.innerHTML =

        validBroadcasts.map(

            broadcast => {


                const week =

                    Number(
                        broadcast.week || 0
                    );


                const block =

                    String(
                        broadcast.block || ""
                    ).trim();


                const title =

                    String(
                        broadcast.title || ""
                    ).trim()

                    ||

                    [
                        week
                            ? `Week ${week}`
                            : "",

                        block
                    ]

                        .filter(
                            Boolean
                        )

                        .join(
                            " — "
                        )

                    ||

                    "Championship Series Broadcast";


                const description =

                    String(
                        broadcast.description || ""
                    ).trim();


                const status =

                    String(
                        broadcast.status ||
                        "Upcoming"
                    ).trim();


                const statusClass =

                    getTournamentBroadcastStatusClass(
                        status
                    );


                const youtube =

                    String(
                        broadcast.youtube || ""
                    ).trim();


                const matches =

                    Array.isArray(
                        broadcast.matches
                    )

                        ? broadcast.matches

                        : [];


                const matchListMarkup =

                    renderTournamentBroadcastMatchList(
                        tournament,
                        matches,
                        wrestlers,
                        teams
                    );


                return `

                    <article
                        class="tournament-broadcast-card"
                        data-broadcast-id="${escapeTournamentPageText(
                            broadcast.id || ""
                        )}"
                    >


                        <div class="tournament-broadcast-card-topline">


                            <span>

                                ${
                                    week
                                        ? `WEEK ${escapeTournamentPageText(
                                            week
                                        )}`
                                        : "CHAMPIONSHIP SERIES"
                                }

                                ${
                                    block
                                        ? ` • ${escapeTournamentPageText(
                                            block
                                        )}`
                                        : ""
                                }

                            </span>


                            <strong
                                class="tournament-broadcast-status tournament-broadcast-status-${escapeTournamentPageText(
                                    statusClass
                                )}"
                            >
                                ${escapeTournamentPageText(
                                    status
                                )}
                            </strong>


                        </div>


                        <h3>
                            ${escapeTournamentPageText(
                                title
                            )}
                        </h3>


                        ${
                            description

                                ? `

                                    <p class="tournament-broadcast-description">
                                        ${escapeTournamentPageText(
                                            description
                                        )}
                                    </p>

                                `

                                : ""
                        }


                        ${matchListMarkup}


                        <div class="tournament-broadcast-meta">


                            <span>

                                ${escapeTournamentPageText(
                                    matches.length
                                )}

                                ${
                                    matches.length === 1
                                        ? "MATCH"
                                        : "MATCHES"
                                }

                            </span>


                                                        ${
                                youtube

                                    ? `

                                        <a
                                            class="tournament-broadcast-watch"
                                            href="${escapeTournamentPageText(
                                                youtube
                                            )}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            WATCH BROADCAST →
                                        </a>

                                    `

                                    : `

                                        <span>
                                            VIDEO PENDING
                                        </span>

                                    `
                            }


                        </div>


                    </article>

                `;

            }

        ).join("");

}

function renderTournamentPage(
    tournament,
    wrestlers,
    teams
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


   renderTournamentBroadcasts(
    tournament,
    wrestlers,
    teams
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


        const [
            tournamentResponse,
            wrestlerResponse,
            teamResponse
        ] =

            await Promise.all([

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
        ] =

            await Promise.all([

                tournamentResponse.json(),

                wrestlerResponse.json(),

                teamResponse.json()

            ]);


        const tournaments =

            Array.isArray(
                database.tournaments
            )

                ? database.tournaments

                : [];


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
            tournament,
            wrestlers,
            teams
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


let tournamentMatchGraphicLightbox =
    null;

let tournamentMatchGraphicLightboxImage =
    null;

let tournamentMatchGraphicLightboxTrigger =
    null;



function ensureTournamentMatchGraphicLightbox() {

    if (
        tournamentMatchGraphicLightbox
    ) {
        return;
    }


    const lightbox =
        document.createElement(
            "div"
        );


    lightbox.id =
        "tournament-match-graphic-lightbox";

    lightbox.className =
        "tournament-match-graphic-lightbox";

    lightbox.hidden =
        true;


    lightbox.innerHTML = `
        <button
            type="button"
            class="tournament-match-graphic-lightbox-backdrop"
            aria-label="Close expanded match graphic"
        ></button>

        <div
            class="tournament-match-graphic-lightbox-content"
            role="dialog"
            aria-modal="true"
            aria-label="Expanded tournament match graphic"
        >
            <img
                class="tournament-match-graphic-lightbox-image"
                alt=""
            >
        </div>

        <button
            type="button"
            class="tournament-match-graphic-lightbox-close"
            aria-label="Close expanded match graphic"
        >
            ×
        </button>
    `;


    document.body.appendChild(
        lightbox
    );


    tournamentMatchGraphicLightbox =
        lightbox;

    tournamentMatchGraphicLightboxImage =
        lightbox.querySelector(
            ".tournament-match-graphic-lightbox-image"
        );

}



function openTournamentMatchGraphicLightbox(
    frame
) {

    const image =
        frame?.querySelector(
            "img"
        );


    if (
        !image
        ||
        !image.src
    ) {
        return;
    }


    ensureTournamentMatchGraphicLightbox();


    tournamentMatchGraphicLightboxTrigger =
        frame;


    tournamentMatchGraphicLightboxImage.src =
        image.currentSrc
        ||
        image.src;


    tournamentMatchGraphicLightboxImage.alt =
        image.alt
        ||
        "Tournament match graphic";


    tournamentMatchGraphicLightbox.hidden =
        false;


    document.body.classList.add(
        "tournament-lightbox-open"
    );


    tournamentMatchGraphicLightbox
        .querySelector(
            ".tournament-match-graphic-lightbox-close"
        )
        ?.focus();

}



function closeTournamentMatchGraphicLightbox() {

    if (
        !tournamentMatchGraphicLightbox
        ||
        tournamentMatchGraphicLightbox.hidden
    ) {
        return;
    }


    tournamentMatchGraphicLightbox.hidden =
        true;


    document.body.classList.remove(
        "tournament-lightbox-open"
    );


    if (
        tournamentMatchGraphicLightboxImage
    ) {

        tournamentMatchGraphicLightboxImage
            .removeAttribute(
                "src"
            );

        tournamentMatchGraphicLightboxImage.alt =
            "";

    }


    tournamentMatchGraphicLightboxTrigger
        ?.focus();


    tournamentMatchGraphicLightboxTrigger =
        null;

}



document.addEventListener(
    "click",
    event => {

        if (
            !(event.target instanceof Element)
        ) {
            return;
        }


        const graphicFrame =
            event.target.closest(
                ".tournament-broadcast-match-graphic-frame"
            );


        if (
            graphicFrame
        ) {

            openTournamentMatchGraphicLightbox(
                graphicFrame
            );

            return;

        }


        if (
            event.target.closest(
                ".tournament-match-graphic-lightbox-close"
            )
            ||
            event.target.closest(
                ".tournament-match-graphic-lightbox-backdrop"
            )
        ) {

            closeTournamentMatchGraphicLightbox();

        }

    }
);



document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
                "Escape"
        ) {

            closeTournamentMatchGraphicLightbox();

            return;

        }


        if (
            event.key !==
                "Enter"
            &&
            event.key !==
                " "
        ) {
            return;
        }


        if (
            !(event.target instanceof Element)
        ) {
            return;
        }


        const graphicFrame =
            event.target.closest(
                ".tournament-broadcast-match-graphic-frame"
            );


        if (
            !graphicFrame
        ) {
            return;
        }


        event.preventDefault();


        openTournamentMatchGraphicLightbox(
            graphicFrame
        );

    }
);



loadTournamentPage();
