// =================================
// OWL CONTROL ROOM
// RESULTS WIZARD
// =================================


// =================================
// ELEMENTS
// =================================

const crResultsStatus =
    document.getElementById(
        "cr-results-status"
    );


const crResultsEvent =
    document.getElementById(
        "cr-results-event"
    );


const crResultsMatch =
    document.getElementById(
        "cr-results-match"
    );


const crResultsMatchPreview =
    document.getElementById(
        "cr-results-match-preview"
    );


const crResultsMatchSummary =
    document.getElementById(
        "cr-results-match-summary"
    );


const crResultsBasicFields =
    document.getElementById(
        "cr-results-basic-fields"
    );


const crResultsResultType =
    document.getElementById(
        "cr-results-result-type"
    );


const crResultsWinnerSideRow =
    document.getElementById(
        "cr-results-winner-side-row"
    );


const crResultsWinnerSide =
    document.getElementById(
        "cr-results-winner-side"
    );


const crResultsFinishWinnerRow =
    document.getElementById(
        "cr-results-finish-winner-row"
    );


const crResultsFinishWinner =
    document.getElementById(
        "cr-results-finish-winner"
    );


const crResultsFinishLoserRow =
    document.getElementById(
        "cr-results-finish-loser-row"
    );


const crResultsFinishLoser =
    document.getElementById(
        "cr-results-finish-loser"
    );


const crResultsMethodRow =
    document.getElementById(
        "cr-results-method-row"
    );


const crResultsMethod =
    document.getElementById(
        "cr-results-method"
    );


const crResultsPerformanceFields =
    document.getElementById(
        "cr-results-performance-fields"
    );


const crResultsRating =
    document.getElementById(
        "cr-results-rating"
    );


const crResultsStars =
    document.getElementById(
        "cr-results-stars"
    );


const crResultsTime =
    document.getElementById(
        "cr-results-time"
    );


const crResultsSpecialtyFields =
    document.getElementById(
        "cr-results-specialty-fields"
    );


const crResultsSpecialtyContent =
    document.getElementById(
        "cr-results-specialty-content"
    );


const crResultsReview =
    document.getElementById(
        "cr-results-review"
    );


const crResultsReviewList =
    document.getElementById(
        "cr-results-review-list"
    );


const crResultsError =
    document.getElementById(
        "cr-results-error"
    );


const crResultsSave =
    document.getElementById(
        "cr-results-save"
    );


const crResultsMessage =
    document.getElementById(
        "cr-results-message"
    );



// =================================
// STATE
// =================================

let crResultsSelectedMatch =
    null;



// =================================
// CONSTANTS
// =================================

const CR_RESULTS_METHODS = [

    "Pinfall",

    "Submission",

    "KO",

    "Count Out",

    "Disqualification",

    "Over the Top Rope",

    "Referee Stoppage",

    "Other"

];


const CR_RESULTS_FATE_OUTCOMES = [

    "Main Title Shot",

    "Midcard Title Shot",

    "Remorse Case"

];


const CR_RESULTS_FORCED_WIN_STIPULATIONS =
    new Set([

        "Love and War",

        "Overthrow Rumble",

        "2 Out Of 3 Falls Match",

        "Ironman Match"

    ]);



// =================================
// BASIC HELPERS
// =================================

function crResultsSetStatus(
    text
) {

    crResultsStatus.textContent =
        text;

}



function crResultsShowMessage(
    message,
    type
) {

    crResultsMessage.textContent =
        message;


    crResultsMessage.className =
        `cr-save-message ${type}`;


    crResultsMessage.hidden =
        false;

}



function crResultsHideMessage() {

    crResultsMessage.textContent =
        "";


    crResultsMessage.hidden =
        true;

}



function crResultsGetWrestler(
    wrestlerId
) {

    return owlControlRoomData.wrestlers.find(

        wrestler =>
            wrestler.id === wrestlerId

    ) || null;

}



function crResultsGetWrestlerName(
    wrestlerId
) {

    const wrestler =
        crResultsGetWrestler(
            wrestlerId
        );


    return wrestler

        ? wrestler.name

        : wrestlerId || "—";

}



function crResultsGetChampionshipName(
    championshipId
) {

    if (!championshipId) {

        return "Non-Title Match";

    }


    const championship =
        owlControlRoomData.championships.find(

            item =>
                item.id === championshipId

        );


    return championship

        ? championship.name

        : championshipId;

}



function crResultsSignature(
    wrestlerIds
) {

    return [...wrestlerIds]

        .sort()

        .join("|");

}



function crResultsGetOfficialTeamByMembers(
    wrestlerIds
) {

    if (
        !Array.isArray(
            wrestlerIds
        )

        ||

        wrestlerIds.length !== 2
    ) {

        return null;

    }


    const signature =
        crResultsSignature(
            wrestlerIds
        );


    return owlControlRoomData.teams.find(

        team =>

            Array.isArray(
                team.members
            )

            &&

            team.members.length === 2

            &&

            crResultsSignature(
                team.members
            ) === signature

    ) || null;

}



function crResultsFormatSide(
    side
) {

    const wrestlerIds =

        Array.isArray(
            side?.wrestlers
        )

            ? side.wrestlers

            : [];


    const officialTeam =
        crResultsGetOfficialTeamByMembers(
            wrestlerIds
        );


    if (officialTeam) {

        return officialTeam.name;

    }


    return wrestlerIds

        .map(
            crResultsGetWrestlerName
        )

        .join(" & ");

}



function crResultsFormatMatch(
    match
) {

    if (!match) {

        return "Unknown Match";

    }


    if (
        match.stipulation ===
            "Overthrow Rumble"
    ) {

        const division =
            match.specialty?.division || "";


        return `${

            division

                ? `${division} `

                : ""

        }Overthrow Rumble`;

    }


    if (
        !Array.isArray(
            match.sides
        )

        ||

        match.sides.length === 0
    ) {

        return (

            match.stipulation

            ||

            match.matchType

            ||

            "Unknown Match"

        );

    }


    return match.sides

        .map(
            crResultsFormatSide
        )

        .join(" vs. ");

}



function crResultsGetSideLabel(
    match,
    sideIndex
) {

    const side =
        match?.sides?.[
            sideIndex
        ];


    return side

        ? crResultsFormatSide(
            side
        )

        : `Side ${sideIndex + 1}`;

}



function crResultsGetMatchParticipantIds(
    match = crResultsSelectedMatch
) {

    if (
        !match

        ||

        !Array.isArray(
            match.sides
        )
    ) {

        return [];

    }


    return match.sides.flatMap(

        side =>

            Array.isArray(
                side.wrestlers
            )

                ? side.wrestlers

                : []

    );

}



function crResultsTimeToSeconds(
    value
) {

    const text =
        String(
            value || ""
        ).trim();


    if (!text) {

        return null;

    }


    if (
        /^\d+$/.test(
            text
        )
    ) {

        return Number(
            text
        );

    }


    const parts =
        text

            .split(":")

            .map(
                Number
            );


    if (
        parts.some(

            part =>
                !Number.isFinite(
                    part
                )

        )
    ) {

        return null;

    }


    if (
        parts.length === 2
    ) {

        return (

            parts[0] * 60

            +

            parts[1]

        );

    }


    if (
        parts.length === 3
    ) {

        return (

            parts[0] * 3600

            +

            parts[1] * 60

            +

            parts[2]

        );

    }


    return null;

}



function crResultsJoinWrestlerNames(
    ids
) {

    return ids

        .map(
            crResultsGetWrestlerName
        )

        .join(", ");

}



function crResultsCreateOption(
    value,
    text
) {

    const option =
        document.createElement(
            "option"
        );


    option.value =
        value;


    option.textContent =
        text;


    return option;

}



function crResultsPopulateWrestlerSelect(
    selectElement,
    wrestlerIds,
    includeBlank = true
) {

    const oldValue =
        selectElement.value;


    selectElement.innerHTML =
        "";


    if (includeBlank) {

        selectElement.appendChild(

            crResultsCreateOption(

                "",

                "Select Wrestler"

            )

        );

    }


    wrestlerIds.forEach(

        wrestlerId => {

            selectElement.appendChild(

                crResultsCreateOption(

                    wrestlerId,

                    crResultsGetWrestlerName(
                        wrestlerId
                    )

                )

            );

        }

    );


    if (
        wrestlerIds.includes(
            oldValue
        )
    ) {

        selectElement.value =
            oldValue;

    }

}



function crResultsCreateMethodSelect(
    className = ""
) {

    const select =
        document.createElement(
            "select"
        );


    select.className =
        className;


    select.appendChild(

        crResultsCreateOption(

            "",

            "Select Method"

        )

    );


    CR_RESULTS_METHODS.forEach(

        method => {

            select.appendChild(

                crResultsCreateOption(

                    method,

                    method

                )

            );

        }

    );


    return select;

}



function crResultsCreateFieldGroup(
    labelText,
    controlElement
) {

    const group =
        document.createElement(
            "div"
        );


    group.className =
        "cr-form-group";


    const label =
        document.createElement(
            "label"
        );


    label.textContent =
        labelText;


    group.appendChild(
        label
    );


    group.appendChild(
        controlElement
    );


    return group;

}



function crResultsGetSelectedEvent() {

    const eventId =

        crResultsSelectedMatch?.eventId

        ||

        crResultsEvent.value;


    return owlControlRoomData.events.find(

        event =>
            event.id === eventId

    ) || null;

}



function crResultsGetWinnerSideMembers(
    form
) {

    if (
        !crResultsSelectedMatch

        ||

        form.winningSideIndex === null
    ) {

        return [];

    }


    const side =
        crResultsSelectedMatch.sides?.[
            form.winningSideIndex
        ];


    return Array.isArray(
        side?.wrestlers
    )

        ? side.wrestlers

        : [];

}



// =================================
// EVENT AND MATCH OPTIONS
// =================================

function crResultsPopulateEvents() {

    const oldValue =
        crResultsEvent.value;


    crResultsEvent.innerHTML =
        "";


    crResultsEvent.appendChild(

        crResultsCreateOption(

            "",

            "Select Event"

        )

    );


    const announcedEventIds =
        new Set(

            owlControlRoomData
                .announcedMatches

                .map(
                    match =>
                        match.eventId
                )

        );


    const events =

        [...owlControlRoomData.events]

            .filter(

                event =>
                    announcedEventIds.has(
                        event.id
                    )

            )

            .sort(

                (a, b) =>

                    new Date(
                        `${a.date}T00:00:00`
                    )

                    -

                    new Date(
                        `${b.date}T00:00:00`
                    )

            );


    events.forEach(

        event => {

            crResultsEvent.appendChild(

                crResultsCreateOption(

                    event.id,

                    `${event.date} — ${event.name}`

                )

            );

        }

    );


    if (
        events.some(

            event =>
                event.id === oldValue

        )
    ) {

        crResultsEvent.value =
            oldValue;

    }

}



function crResultsPopulateMatches() {

    const eventId =
        crResultsEvent.value;


    const oldValue =
        crResultsMatch.value;


    crResultsMatch.innerHTML =
        "";


    crResultsMatch.appendChild(

        crResultsCreateOption(

            "",

            "Select Match"

        )

    );


    if (!eventId) {

        return;

    }


    const matches =

        owlControlRoomData
            .announcedMatches

            .filter(

                match =>
                    match.eventId === eventId

            )

            .sort(

                (a, b) =>

                    Number(
                        a.order || 0
                    )

                    -

                    Number(
                        b.order || 0
                    )

            );


    matches.forEach(

        match => {

            const specialty =

                match.stipulation

                    ? ` — ${match.stipulation}`

                    : "";


            crResultsMatch.appendChild(

                crResultsCreateOption(

                    match.id,

                    `Match ${match.order} — ${crResultsFormatMatch(match)}${specialty}`

                )

            );

        }

    );


    if (
        matches.some(

            match =>
                match.id === oldValue

        )
    ) {

        crResultsMatch.value =
            oldValue;

    }

}



// =================================
// STANDARD RESULT CONTROLS
// =================================

function crResultsPopulateWinnerControls() {

    crResultsWinnerSide.innerHTML =
        "";


    crResultsWinnerSide.appendChild(

        crResultsCreateOption(

            "",

            "Select Winning Side"

        )

    );


    crResultsFinishWinner.innerHTML =
        "";


    crResultsFinishWinner.appendChild(

        crResultsCreateOption(

            "",

            "Select Winning Wrestler"

        )

    );


    crResultsFinishLoser.innerHTML =
        "";


    crResultsFinishLoser.appendChild(

        crResultsCreateOption(

            "",

            "Select Losing Wrestler"

        )

    );


    if (!crResultsSelectedMatch) {

        return;

    }


    crResultsSelectedMatch.sides.forEach(

        (
            side,
            index
        ) => {

            crResultsWinnerSide.appendChild(

                crResultsCreateOption(

                    String(
                        index
                    ),

                    crResultsFormatSide(
                        side
                    )

                )

            );

        }

    );


    const participantIds =
        crResultsGetMatchParticipantIds();


    participantIds.forEach(

        wrestlerId => {

            crResultsFinishWinner.appendChild(

                crResultsCreateOption(

                    wrestlerId,

                    crResultsGetWrestlerName(
                        wrestlerId
                    )

                )

            );


            crResultsFinishLoser.appendChild(

                crResultsCreateOption(

                    wrestlerId,

                    crResultsGetWrestlerName(
                        wrestlerId
                    )

                )

            );

        }

    );

}



function crResultsResetStandardFields() {

    crResultsResultType.value =
        "win";


    crResultsResultType.disabled =
        false;


    crResultsWinnerSide.value =
        "";


    crResultsFinishWinner.value =
        "";


    crResultsFinishLoser.value =
        "";


    crResultsMethod.value =
        "";


    crResultsRating.value =
        "";


    crResultsStars.value =
        "";


    crResultsTime.value =
        "";

}



function crResultsRefreshBasicLayout() {

    const stipulation =
        crResultsSelectedMatch
            ?.stipulation || "";


    const isOverthrow =
        stipulation ===
            "Overthrow Rumble";


    const isLoveAndWar =
        stipulation ===
            "Love and War";


    const isIronman =
        stipulation ===
            "Ironman Match";


    crResultsResultType.disabled =
        CR_RESULTS_FORCED_WIN_STIPULATIONS.has(
            stipulation
        );


    if (
        CR_RESULTS_FORCED_WIN_STIPULATIONS.has(
            stipulation
        )
    ) {

        crResultsResultType.value =
            "win";

    }


    const actualWin =
        crResultsResultType.value ===
            "win";


    crResultsWinnerSideRow.hidden =

        !actualWin

        ||

        isOverthrow;


    crResultsFinishWinnerRow.hidden =

        !actualWin

        ||

        isOverthrow

        ||

        isLoveAndWar;


    crResultsFinishLoserRow.hidden =

        !actualWin

        ||

        isOverthrow

        ||

        isLoveAndWar;


    crResultsMethodRow.hidden =

        !actualWin

        ||

        isOverthrow

        ||

        isLoveAndWar

        ||

        isIronman;


    const winnerLabel =
        crResultsWinnerSideRow
            .querySelector(
                "label"
            );


    if (winnerLabel) {

        winnerLabel.textContent =

            isLoveAndWar

                ? "WINNING TEAM"

                : "WINNING SIDE";

    }


    if (!actualWin) {

        crResultsWinnerSide.value =
            "";


        crResultsFinishWinner.value =
            "";


        crResultsFinishLoser.value =
            "";


        crResultsMethod.value =
            "";

    }

}



// =================================
// BATTLE ROYAL
// =================================

function crResultsRenderBattleRoyal() {

    const participantIds =
        crResultsGetMatchParticipantIds();


    const heading =
        document.createElement(
            "div"
        );


    heading.className =
        "cr-specialty-heading";


    heading.innerHTML = `

        <strong>
            BATTLE ROYAL ELIMINATION DETAILS
        </strong>

        <span>
            Track time in match and eliminator for every participant.
        </span>

    `;


    crResultsSpecialtyContent.appendChild(
        heading
    );


    participantIds.forEach(

        (
            wrestlerId,
            index
        ) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "cr-booker-side-card cr-results-battle-participant";


            card.dataset.wrestlerId =
                wrestlerId;


            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "cr-booker-side-heading";


            title.textContent =
                `${index + 1}. ${crResultsGetWrestlerName(wrestlerId)}`;


            const grid =
                document.createElement(
                    "div"
                );


            grid.className =
                "cr-form-grid";


            const timeInput =
                document.createElement(
                    "input"
                );


            timeInput.type =
                "text";


            timeInput.placeholder =
                "MM:SS";


            timeInput.dataset.battleTime =
                "true";


            const eliminatedBy =
                document.createElement(
                    "select"
                );


            eliminatedBy.dataset
                .battleEliminatedBy =
                    "true";


            eliminatedBy.appendChild(

                crResultsCreateOption(

                    "",

                    "Winner / Not Eliminated"

                )

            );


            participantIds

                .filter(
                    id =>
                        id !== wrestlerId
                )

                .forEach(

                    id => {

                        eliminatedBy.appendChild(

                            crResultsCreateOption(

                                id,

                                crResultsGetWrestlerName(
                                    id
                                )

                            )

                        );

                    }

                );


            timeInput.addEventListener(

                "input",

                crResultsReviewResult

            );


            eliminatedBy.addEventListener(

                "change",

                crResultsReviewResult

            );


            grid.appendChild(

                crResultsCreateFieldGroup(

                    "TIME IN MATCH",

                    timeInput

                )

            );


            grid.appendChild(

                crResultsCreateFieldGroup(

                    "ELIMINATED BY",

                    eliminatedBy

                )

            );


            card.appendChild(
                title
            );


            card.appendChild(
                grid
            );


            crResultsSpecialtyContent.appendChild(
                card
            );

        }

    );

}



function crResultsBuildBattleRoyalResult() {

    const participants =

        [
            ...crResultsSpecialtyContent
                .querySelectorAll(
                    ".cr-results-battle-participant"
                )
        ]

            .map(

                card => ({

                    wrestlerId:
                        card.dataset.wrestlerId,

                    time:
                        card.querySelector(
                            "[data-battle-time='true']"
                        )
                            ?.value
                            .trim()

                        || "",

                    eliminatedBy:
                        card.querySelector(
                            "[data-battle-eliminated-by='true']"
                        )
                            ?.value

                        || ""

                })

            );


    return {

        participants

    };

}



function crResultsValidateBattleRoyal(
    form,
    errors
) {

    if (
        !form.specialtyResult
            ?.participants
    ) {

        errors.push(
            "Battle Royal participant results are missing."
        );


        return;

    }


    const winnerId =
        form.winningWrestlerId;


    form.specialtyResult
        .participants

        .forEach(

            participant => {

                if (
                    !participant.time
                ) {

                    errors.push(

                        `${crResultsGetWrestlerName(participant.wrestlerId)} needs a time in match.`

                    );

                }


                if (
                    participant.wrestlerId ===
                        winnerId
                ) {

                    if (
                        participant.eliminatedBy
                    ) {

                        errors.push(
                            "The Battle Royal winner cannot have an eliminator."
                        );

                    }

                }


                else if (
                    !participant.eliminatedBy
                ) {

                    errors.push(

                        `${crResultsGetWrestlerName(participant.wrestlerId)} needs an eliminator.`

                    );

                }

            }

        );

}



// =================================
// HEX-CELL ELIMINATOR
// =================================

function crResultsRenderHexCell() {

    const participantIds =
        crResultsGetMatchParticipantIds();


    const heading =
        document.createElement(
            "div"
        );


    heading.className =
        "cr-specialty-heading";


    heading.innerHTML = `

        <strong>
            HEX-CELL ELIMINATIONS
        </strong>

        <span>
            Enter the five eliminations in order.
        </span>

    `;


    crResultsSpecialtyContent.appendChild(
        heading
    );


    for (
        let index = 0;
        index < 5;
        index += 1
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "cr-booker-side-card cr-results-hex-elimination";


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "cr-booker-side-heading";


        title.textContent =
            `ELIMINATION ${index + 1}`;


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "cr-form-grid";


        const eliminated =
            document.createElement(
                "select"
            );


        eliminated.dataset.hexEliminated =
            "true";


        crResultsPopulateWrestlerSelect(

            eliminated,

            participantIds

        );


        const eliminatedBy =
            document.createElement(
                "select"
            );


        eliminatedBy.dataset.hexEliminatedBy =
            "true";


        crResultsPopulateWrestlerSelect(

            eliminatedBy,

            participantIds

        );


        const method =
            crResultsCreateMethodSelect();


        method.dataset.hexMethod =
            "true";


        [
            eliminated,
            eliminatedBy,
            method
        ].forEach(

            field => {

                field.addEventListener(

                    "change",

                    crResultsReviewResult

                );

            }

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "ELIMINATED WRESTLER",

                eliminated

            )

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "ELIMINATED BY",

                eliminatedBy

            )

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "METHOD",

                method

            )

        );


        card.appendChild(
            title
        );


        card.appendChild(
            grid
        );


        crResultsSpecialtyContent.appendChild(
            card
        );

    }

}



function crResultsBuildHexCellResult() {

    const eliminations =

        [
            ...crResultsSpecialtyContent
                .querySelectorAll(
                    ".cr-results-hex-elimination"
                )
        ]

            .map(

                card => ({

                    wrestlerId:
                        card.querySelector(
                            "[data-hex-eliminated='true']"
                        )
                            ?.value

                        || "",

                    eliminatedBy:
                        card.querySelector(
                            "[data-hex-eliminated-by='true']"
                        )
                            ?.value

                        || "",

                    method:
                        card.querySelector(
                            "[data-hex-method='true']"
                        )
                            ?.value

                        || ""

                })

            );


    return {

        eliminations

    };

}



function crResultsValidateHexCell(
    form,
    errors
) {

    const eliminations =
        form.specialtyResult
            ?.eliminations || [];


    if (
        eliminations.length !== 5
    ) {

        errors.push(
            "Hex-Cell requires five eliminations."
        );


        return;

    }


    eliminations.forEach(

        (
            elimination,
            index
        ) => {

            if (
                !elimination.wrestlerId

                ||

                !elimination.eliminatedBy

                ||

                !elimination.method
            ) {

                errors.push(

                    `Hex-Cell elimination ${index + 1} is incomplete.`

                );

            }


            if (
                elimination.wrestlerId

                &&

                elimination.wrestlerId ===
                    elimination.eliminatedBy
            ) {

                errors.push(

                    `Hex-Cell elimination ${index + 1} cannot be self-elimination.`

                );

            }

        }

    );


    const eliminatedIds =
        eliminations

            .map(
                item =>
                    item.wrestlerId
            )

            .filter(
                Boolean
            );


    if (
        new Set(
            eliminatedIds
        ).size !== eliminatedIds.length
    ) {

        errors.push(
            "A wrestler cannot be eliminated from Hex-Cell more than once."
        );

    }


    const winnerId =
        form.winningWrestlerId;


    if (
        winnerId

        &&

        eliminatedIds.includes(
            winnerId
        )
    ) {

        errors.push(
            "The Hex-Cell winner cannot appear in the elimination list."
        );

    }

}



// =================================
// FATE'S WHEEL
// =================================

function crResultsRenderFatesWheel() {

    const participantIds =
        crResultsGetMatchParticipantIds();


    const heading =
        document.createElement(
            "div"
        );


    heading.className =
        "cr-specialty-heading";


    heading.innerHTML = `

        <strong>
            FATE'S WHEEL FINAL FIVE
        </strong>

        <span>
            Assign the five finalists and their exact outcomes.
        </span>

    `;


    crResultsSpecialtyContent.appendChild(
        heading
    );


    for (
        let index = 0;
        index < 5;
        index += 1
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "cr-booker-side-card cr-results-fate-finalist";


        card.dataset.rank =
            String(
                index + 1
            );


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "cr-booker-side-heading";


        title.textContent =
            `FINALIST ${index + 1}`;


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "cr-form-grid";


        const wrestler =
            document.createElement(
                "select"
            );


        wrestler.dataset.fateWrestler =
            "true";


        crResultsPopulateWrestlerSelect(

            wrestler,

            participantIds

        );


        const outcome =
            document.createElement(
                "select"
            );


        outcome.dataset.fateOutcome =
            "true";


        outcome.appendChild(

            crResultsCreateOption(

                "",

                "Select Outcome"

            )

        );


        CR_RESULTS_FATE_OUTCOMES.forEach(

            value => {

                outcome.appendChild(

                    crResultsCreateOption(

                        value,

                        value

                    )

                );

            }

        );


        wrestler.addEventListener(

            "change",

            crResultsReviewResult

        );


        outcome.addEventListener(

            "change",

            crResultsReviewResult

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "WRESTLER",

                wrestler

            )

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "OUTCOME",

                outcome

            )

        );


        card.appendChild(
            title
        );


        card.appendChild(
            grid
        );


        crResultsSpecialtyContent.appendChild(
            card
        );

    }

}



function crResultsBuildFatesWheelResult() {

    const finalists =

        [
            ...crResultsSpecialtyContent
                .querySelectorAll(
                    ".cr-results-fate-finalist"
                )
        ]

            .map(

                card => ({

                    rank:
                        Number(
                            card.dataset.rank
                        ),

                    wrestlerId:
                        card.querySelector(
                            "[data-fate-wrestler='true']"
                        )
                            ?.value

                        || "",

                    outcome:
                        card.querySelector(
                            "[data-fate-outcome='true']"
                        )
                            ?.value

                        || ""

                })

            );


    return {

        finalists

    };

}



function crResultsValidateFatesWheel(
    form,
    errors
) {

    const finalists =
        form.specialtyResult
            ?.finalists || [];


    if (
        finalists.length !== 5
    ) {

        errors.push(
            "Fate's Wheel requires five finalists."
        );


        return;

    }


    finalists.forEach(

        (
            finalist,
            index
        ) => {

            if (
                !finalist.wrestlerId

                ||

                !finalist.outcome
            ) {

                errors.push(

                    `Fate's Wheel finalist ${index + 1} is incomplete.`

                );

            }

        }

    );


    const wrestlerIds =
        finalists

            .map(
                item =>
                    item.wrestlerId
            )

            .filter(
                Boolean
            );


    if (
        new Set(
            wrestlerIds
        ).size !== wrestlerIds.length
    ) {

        errors.push(
            "Fate's Wheel finalists must be unique."
        );

    }


    const outcomeCounts =
        finalists.reduce(

            (
                counts,
                finalist
            ) => {

                counts[
                    finalist.outcome
                ] =

                    (
                        counts[
                            finalist.outcome
                        ] || 0
                    )

                    + 1;


                return counts;

            },

            {}

        );


    if (
        (
            outcomeCounts[
                "Main Title Shot"
            ] || 0
        )

        !== 1
    ) {

        errors.push(
            "Fate's Wheel needs exactly one Main Title Shot."
        );

    }


    if (
        (
            outcomeCounts[
                "Midcard Title Shot"
            ] || 0
        )

        !== 2
    ) {

        errors.push(
            "Fate's Wheel needs exactly two Midcard Title Shots."
        );

    }


    if (
        (
            outcomeCounts[
                "Remorse Case"
            ] || 0
        )

        !== 2
    ) {

        errors.push(
            "Fate's Wheel needs exactly two Remorse Cases."
        );

    }


    const winnerId =
        form.winningWrestlerId;


    if (
        winnerId

        &&

        finalists[0]
            ?.wrestlerId

        &&

        finalists[0]
            .wrestlerId !== winnerId
    ) {

        errors.push(
            "Fate's Wheel finalist 1 must be the overall winner."
        );

    }

}



// =================================
// LOVE AND WAR
// =================================

function crResultsRenderLoveAndWar() {

    const heading =
        document.createElement(
            "div"
        );


    heading.className =
        "cr-specialty-heading";


    heading.innerHTML = `

        <strong>
            LOVE AND WAR RESULT
        </strong>

        <span>
            Select the winning team above. The opposite team is saved as the losing team.
        </span>

    `;


    crResultsSpecialtyContent.appendChild(
        heading
    );

}



function crResultsBuildLoveAndWarResult() {

    const winningSide =

        crResultsWinnerSide.value === ""

            ? null

            : Number(
                crResultsWinnerSide.value
            );


    if (
        winningSide === null
    ) {

        return {

            winningSide:
                null,

            losingSide:
                null

        };

    }


    return {

        winningSide,

        losingSide:

            winningSide === 0

                ? 1

                : 0

    };

}



function crResultsValidateLoveAndWar(
    form,
    errors
) {

    if (
        form.winningSideIndex === null
    ) {

        errors.push(
            "Select the winning Love and War team."
        );

    }

}



// =================================
// TWO OUT OF THREE FALLS
// =================================

function crResultsRenderTwoOutOfThreeFalls() {

    const participantIds =
        crResultsGetMatchParticipantIds();


    const heading =
        document.createElement(
            "div"
        );


    heading.className =
        "cr-specialty-heading";


    heading.innerHTML = `

        <strong>
            2 OUT OF 3 FALLS
        </strong>

        <span>
            Enter Fall 1 and Fall 2. Fall 3 appears only if the first two falls are split.
        </span>

    `;


    crResultsSpecialtyContent.appendChild(
        heading
    );


    for (
        let index = 0;
        index < 3;
        index += 1
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "cr-booker-side-card cr-results-fall-card";


        card.dataset.fallNumber =
            String(
                index + 1
            );


        if (
            index === 2
        ) {

            card.hidden =
                true;

        }


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "cr-booker-side-heading";


        title.textContent =
            `FALL ${index + 1}`;


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "cr-form-grid";


        const sideSelect =
            document.createElement(
                "select"
            );


        sideSelect.dataset.fallSide =
            "true";


        sideSelect.appendChild(

            crResultsCreateOption(

                "",

                "Select Winning Side"

            )

        );


        crResultsSelectedMatch.sides.forEach(

            (
                side,
                sideIndex
            ) => {

                sideSelect.appendChild(

                    crResultsCreateOption(

                        String(
                            sideIndex
                        ),

                        crResultsFormatSide(
                            side
                        )

                    )

                );

            }

        );


        const winnerSelect =
            document.createElement(
                "select"
            );


        winnerSelect.dataset.fallWinner =
            "true";


        crResultsPopulateWrestlerSelect(

            winnerSelect,

            participantIds

        );


        const loserSelect =
            document.createElement(
                "select"
            );


        loserSelect.dataset.fallLoser =
            "true";


        crResultsPopulateWrestlerSelect(

            loserSelect,

            participantIds

        );


        const methodSelect =
            crResultsCreateMethodSelect();


        methodSelect.dataset.fallMethod =
            "true";


        sideSelect.addEventListener(

            "change",

            () => {

                crResultsRefreshThirdFallVisibility();


                crResultsReviewResult();

            }

        );


        [
            winnerSelect,
            loserSelect,
            methodSelect
        ].forEach(

            field => {

                field.addEventListener(

                    "change",

                    crResultsReviewResult

                );

            }

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "WINNING SIDE",

                sideSelect

            )

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "FALL WINNER",

                winnerSelect

            )

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "FALL LOSER",

                loserSelect

            )

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "METHOD",

                methodSelect

            )

        );


        card.appendChild(
            title
        );


        card.appendChild(
            grid
        );


        crResultsSpecialtyContent.appendChild(
            card
        );

    }

}



function crResultsRefreshThirdFallVisibility() {

    const cards =

        [
            ...crResultsSpecialtyContent
                .querySelectorAll(
                    ".cr-results-fall-card"
                )
        ];


    if (
        cards.length !== 3
    ) {

        return;

    }


    const first =
        cards[0]
            .querySelector(
                "[data-fall-side='true']"
            )
            ?.value || "";


    const second =
        cards[1]
            .querySelector(
                "[data-fall-side='true']"
            )
            ?.value || "";


    const thirdCard =
        cards[2];


    const needsThird =

        first !== ""

        &&

        second !== ""

        &&

        first !== second;


    thirdCard.hidden =
        !needsThird;


    if (!needsThird) {

        thirdCard

            .querySelectorAll(
                "select"
            )

            .forEach(

                select => {

                    select.value =
                        "";

                }

            );

    }

}



function crResultsBuildTwoOutOfThreeFallsResult() {

    const falls =

        [
            ...crResultsSpecialtyContent
                .querySelectorAll(
                    ".cr-results-fall-card"
                )
        ]

            .filter(

                card =>
                    !card.hidden

            )

            .map(

                card => {

                    const sideValue =
                        card.querySelector(
                            "[data-fall-side='true']"
                        )
                            ?.value || "";


                    return {

                        fall:
                            Number(
                                card.dataset.fallNumber
                            ),

                        winningSide:

                            sideValue === ""

                                ? null

                                : Number(
                                    sideValue
                                ),

                        winner:
                            card.querySelector(
                                "[data-fall-winner='true']"
                            )
                                ?.value || "",

                        loser:
                            card.querySelector(
                                "[data-fall-loser='true']"
                            )
                                ?.value || "",

                        method:
                            card.querySelector(
                                "[data-fall-method='true']"
                            )
                                ?.value || ""

                    };

                }

            );


    return {

        falls

    };

}



function crResultsValidateTwoOutOfThreeFalls(
    form,
    errors
) {

    const falls =
        form.specialtyResult
            ?.falls || [];


    if (
        falls.length < 2

        ||

        falls.length > 3
    ) {

        errors.push(
            "2 Out Of 3 Falls must contain two or three falls."
        );


        return;

    }


    falls.forEach(

        fall => {

            if (
                fall.winningSide === null

                ||

                !fall.winner

                ||

                !fall.loser

                ||

                !fall.method
            ) {

                errors.push(

                    `Fall ${fall.fall} is incomplete.`

                );


                return;

            }


            const winningMembers =

                crResultsSelectedMatch
                    .sides?.[
                        fall.winningSide
                    ]
                    ?.wrestlers

                || [];


            if (
                !winningMembers.includes(
                    fall.winner
                )
            ) {

                errors.push(

                    `Fall ${fall.fall} winner is not on the selected winning side.`

                );

            }


            if (
                winningMembers.includes(
                    fall.loser
                )
            ) {

                errors.push(

                    `Fall ${fall.fall} loser must be on the opposing side.`

                );

            }

        }

    );


    const counts =
        {};


    falls.forEach(

        fall => {

            if (
                fall.winningSide !== null
            ) {

                counts[
                    fall.winningSide
                ] =

                    (
                        counts[
                            fall.winningSide
                        ] || 0
                    )

                    + 1;

            }

        }

    );


    const overallSide =
        form.winningSideIndex;


    if (
        overallSide === null

        ||

        (
            counts[
                overallSide
            ] || 0
        )

        !== 2
    ) {

        errors.push(
            "The overall winning side must have exactly two falls."
        );

    }


    if (
        falls.length === 2

        &&

        falls[0]
            ?.winningSide !==

        falls[1]
            ?.winningSide
    ) {

        errors.push(
            "A split first two falls requires Fall 3."
        );

    }

}



// =================================
// IRONMAN MATCH
// =================================

function crResultsRenderIronman() {

    const heading =
        document.createElement(
            "div"
        );


    heading.className =
        "cr-specialty-heading";


    heading.innerHTML = `

        <strong>
            IRONMAN FINAL SCORE
        </strong>

        <span>
            Enter each side's final score. Individual falls are not tracked.
        </span>

    `;


    crResultsSpecialtyContent.appendChild(
        heading
    );


    const grid =
        document.createElement(
            "div"
        );


    grid.className =
        "cr-form-grid cr-results-ironman-grid";


    crResultsSelectedMatch.sides.forEach(

        (
            side,
            index
        ) => {

            const input =
                document.createElement(
                    "input"
                );


            input.type =
                "number";


            input.min =
                "0";


            input.step =
                "1";


            input.dataset.ironmanSide =
                String(
                    index
                );


            input.addEventListener(

                "input",

                crResultsReviewResult

            );


            grid.appendChild(

                crResultsCreateFieldGroup(

                    `${crResultsFormatSide(side)} SCORE`,

                    input

                )

            );

        }

    );


    crResultsSpecialtyContent.appendChild(
        grid
    );

}



function crResultsBuildIronmanResult() {

    const scores =

        [
            ...crResultsSpecialtyContent
                .querySelectorAll(
                    "[data-ironman-side]"
                )
        ]

            .map(

                input => ({

                    side:
                        Number(
                            input.dataset.ironmanSide
                        ),

                    score:

                        input.value === ""

                            ? null

                            : Number(
                                input.value
                            )

                })

            );


    return {

        scores

    };

}



function crResultsValidateIronman(
    form,
    errors
) {

    const scores =
        form.specialtyResult
            ?.scores || [];


    if (
        scores.length !==
            crResultsSelectedMatch
                .sides.length
    ) {

        errors.push(
            "Ironman scores are incomplete."
        );


        return;

    }


    if (
        scores.some(

            item =>

                !Number.isInteger(
                    item.score
                )

                ||

                item.score < 0

        )
    ) {

        errors.push(
            "Every Ironman score must be a whole number of zero or higher."
        );


        return;

    }


    const sorted =
        [...scores]

            .sort(

                (a, b) =>
                    b.score - a.score

            );


    if (
        sorted.length > 1

        &&

        sorted[0].score ===
            sorted[1].score
    ) {

        errors.push(
            "Ironman final scores are tied. This result setup requires an overall winner."
        );


        return;

    }


    if (
        form.winningSideIndex === null

        ||

        sorted[0].side !==
            form.winningSideIndex
    ) {

        errors.push(
            "The Ironman winning side must match the highest final score."
        );

    }

}



// =================================
// OVERTHROW RUMBLE
// =================================

function crResultsRenderOverthrow() {

    const heading =
        document.createElement(
            "div"
        );


    heading.className =
        "cr-specialty-heading";


    heading.innerHTML = `

        <strong>
            OVERTHROW RUMBLE RESULTS
        </strong>

        <span>
            Enter all 30 entrants, times, eliminators, Final Four order, and Final Four elimination methods.
        </span>

    `;


    crResultsSpecialtyContent.appendChild(
        heading
    );


    const entriesWrap =
        document.createElement(
            "div"
        );


    entriesWrap.className =
        "cr-results-overthrow-entries";


    for (
        let entryNumber = 1;
        entryNumber <= 30;
        entryNumber += 1
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "cr-booker-side-card cr-results-overthrow-entry";


        card.dataset.entryNumber =
            String(
                entryNumber
            );


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "cr-booker-side-heading";


        title.textContent =
            `ENTRY ${entryNumber}`;


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "cr-form-grid";


        const wrestler =
            document.createElement(
                "select"
            );


        wrestler.dataset.overthrowWrestler =
            "true";


        crResultsPopulateWrestlerSelect(

            wrestler,

            [...owlControlRoomData.wrestlers]

                .sort(

                    (a, b) =>

                        String(
                            a.name || ""
                        )

                            .localeCompare(

                                String(
                                    b.name || ""
                                )

                            )

                )

                .map(
                    item =>
                        item.id
                )

        );


        const time =
            document.createElement(
                "input"
            );


        time.type =
            "text";


        time.placeholder =
            "MM:SS";


        time.dataset.overthrowTime =
            "true";


        const eliminatedBy =
            document.createElement(
                "select"
            );


        eliminatedBy.dataset
            .overthrowEliminatedBy =
                "true";


        eliminatedBy.appendChild(

            crResultsCreateOption(

                "",

                "Winner / Not Eliminated"

            )

        );


        wrestler.addEventListener(

            "change",

            () => {

                crResultsRefreshOverthrowChoices();


                crResultsReviewResult();

            }

        );


        time.addEventListener(

            "input",

            crResultsReviewResult

        );


        eliminatedBy.addEventListener(

            "change",

            crResultsReviewResult

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "WRESTLER",

                wrestler

            )

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "TIME IN MATCH",

                time

            )

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "ELIMINATED BY",

                eliminatedBy

            )

        );


        card.appendChild(
            title
        );


        card.appendChild(
            grid
        );


        entriesWrap.appendChild(
            card
        );

    }


    crResultsSpecialtyContent.appendChild(
        entriesWrap
    );


    const finalFourHeading =
        document.createElement(
            "div"
        );


    finalFourHeading.className =
        "cr-specialty-heading";


    finalFourHeading.innerHTML = `

        <strong>
            FINAL FOUR ORDER
        </strong>

        <span>
            Save the relative finish order from fourth place through winner.
        </span>

    `;


    crResultsSpecialtyContent.appendChild(
        finalFourHeading
    );


    const finalGrid =
        document.createElement(
            "div"
        );


    finalGrid.className =
        "cr-form-grid cr-results-final-four-grid";


    [

        [
            "4TH PLACE",
            4
        ],

        [
            "3RD PLACE",
            3
        ],

        [
            "RUNNER-UP",
            2
        ],

        [
            "WINNER",
            1
        ]

    ].forEach(

        (
            [
                labelText,
                place
            ]
        ) => {

            const select =
                document.createElement(
                    "select"
                );


            select.dataset.finalFourPlace =
                String(
                    place
                );


            select.appendChild(

                crResultsCreateOption(

                    "",

                    "Select Wrestler"

                )

            );


            select.addEventListener(

                "change",

                () => {

                    crResultsRefreshOverthrowFinalEliminationChoices();


                    crResultsReviewResult();

                }

            );


            finalGrid.appendChild(

                crResultsCreateFieldGroup(

                    labelText,

                    select

                )

            );

        }

    );


    crResultsSpecialtyContent.appendChild(
        finalGrid
    );


    const finalsHeading =
        document.createElement(
            "div"
        );


    finalsHeading.className =
        "cr-specialty-heading";


    finalsHeading.innerHTML = `

        <strong>
            FINAL FOUR ELIMINATION PHASE
        </strong>

        <span>
            Track who eliminated fourth place, third place, and the runner-up, plus the method.
        </span>

    `;


    crResultsSpecialtyContent.appendChild(
        finalsHeading
    );


    for (
        const place of [
            4,
            3,
            2
        ]
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "cr-booker-side-card cr-results-overthrow-final-elimination";


        card.dataset.eliminatedPlace =
            String(
                place
            );


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "cr-booker-side-heading";


        title.textContent =

            place === 4

                ? "4TH PLACE ELIMINATION"

                : place === 3

                    ? "3RD PLACE ELIMINATION"

                    : "RUNNER-UP ELIMINATION";


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "cr-form-grid";


        const eliminatedBy =
            document.createElement(
                "select"
            );


        eliminatedBy.dataset
            .overthrowFinalEliminatedBy =
                "true";


        eliminatedBy.appendChild(

            crResultsCreateOption(

                "",

                "Select Eliminator"

            )

        );


        const method =
            crResultsCreateMethodSelect();


        method.dataset
            .overthrowFinalMethod =
                "true";


        eliminatedBy.addEventListener(

            "change",

            crResultsReviewResult

        );


        method.addEventListener(

            "change",

            crResultsReviewResult

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "ELIMINATED BY",

                eliminatedBy

            )

        );


        grid.appendChild(

            crResultsCreateFieldGroup(

                "METHOD",

                method

            )

        );


        card.appendChild(
            title
        );


        card.appendChild(
            grid
        );


        crResultsSpecialtyContent.appendChild(
            card
        );

    }


    crResultsRefreshOverthrowChoices();

}



function crResultsGetOverthrowEntrantIds() {

    return [

        ...crResultsSpecialtyContent
            .querySelectorAll(
                "[data-overthrow-wrestler='true']"
            )

    ]

        .map(
            select =>
                select.value
        )

        .filter(
            Boolean
        );

}



function crResultsRefreshOverthrowChoices() {

    const entrantIds =
        crResultsGetOverthrowEntrantIds();


    [
        ...crResultsSpecialtyContent
            .querySelectorAll(
                "[data-overthrow-eliminated-by='true']"
            )
    ].forEach(

        select => {

            const current =
                select.value;


            const card =
                select.closest(
                    ".cr-results-overthrow-entry"
                );


            const wrestlerId =
                card

                    ?.querySelector(
                        "[data-overthrow-wrestler='true']"
                    )

                    ?.value || "";


            select.innerHTML =
                "";


            select.appendChild(

                crResultsCreateOption(

                    "",

                    "Winner / Not Eliminated"

                )

            );


            entrantIds

                .filter(
                    id =>
                        id !== wrestlerId
                )

                .forEach(

                    id => {

                        select.appendChild(

                            crResultsCreateOption(

                                id,

                                crResultsGetWrestlerName(
                                    id
                                )

                            )

                        );

                    }

                );


            if (
                [...select.options].some(

                    option =>
                        option.value === current

                )
            ) {

                select.value =
                    current;

            }

        }

    );


    [
        ...crResultsSpecialtyContent
            .querySelectorAll(
                "[data-final-four-place]"
            )
    ].forEach(

        select => {

            const current =
                select.value;


            select.innerHTML =
                "";


            select.appendChild(

                crResultsCreateOption(

                    "",

                    "Select Wrestler"

                )

            );


            entrantIds.forEach(

                id => {

                    select.appendChild(

                        crResultsCreateOption(

                            id,

                            crResultsGetWrestlerName(
                                id
                            )

                        )

                    );

                }

            );


            if (
                entrantIds.includes(
                    current
                )
            ) {

                select.value =
                    current;

            }

        }

    );


    crResultsRefreshOverthrowFinalEliminationChoices();

}



function crResultsRefreshOverthrowFinalEliminationChoices() {

    const finalists =

        [
            ...crResultsSpecialtyContent
                .querySelectorAll(
                    "[data-final-four-place]"
                )
        ]

            .map(
                select =>
                    select.value
            )

            .filter(
                Boolean
            );


    [
        ...crResultsSpecialtyContent
            .querySelectorAll(
                ".cr-results-overthrow-final-elimination"
            )
    ].forEach(

        card => {

            const place =
                Number(
                    card.dataset.eliminatedPlace
                );


            const eliminatedId =
                crResultsSpecialtyContent

                    .querySelector(
                        `[data-final-four-place='${place}']`
                    )

                    ?.value || "";


            const select =
                card.querySelector(
                    "[data-overthrow-final-eliminated-by='true']"
                );


            const current =
                select.value;


            select.innerHTML =
                "";


            select.appendChild(

                crResultsCreateOption(

                    "",

                    "Select Eliminator"

                )

            );


            finalists

                .filter(
                    id =>
                        id !== eliminatedId
                )

                .forEach(

                    id => {

                        select.appendChild(

                            crResultsCreateOption(

                                id,

                                crResultsGetWrestlerName(
                                    id
                                )

                            )

                        );

                    }

                );


            if (
                [...select.options].some(

                    option =>
                        option.value === current

                )
            ) {

                select.value =
                    current;

            }

        }

    );

}



function crResultsBuildOverthrowResult() {

    const entries =

        [
            ...crResultsSpecialtyContent
                .querySelectorAll(
                    ".cr-results-overthrow-entry"
                )
        ]

            .map(

                card => ({

                    entryNumber:
                        Number(
                            card.dataset.entryNumber
                        ),

                    wrestlerId:
                        card.querySelector(
                            "[data-overthrow-wrestler='true']"
                        )
                            ?.value || "",

                    time:
                        card.querySelector(
                            "[data-overthrow-time='true']"
                        )
                            ?.value
                            .trim() || "",

                    eliminatedBy:
                        card.querySelector(
                            "[data-overthrow-eliminated-by='true']"
                        )
                            ?.value || ""

                })

            );


    const finalFour =

        [
            ...crResultsSpecialtyContent
                .querySelectorAll(
                    "[data-final-four-place]"
                )
        ]

            .map(

                select => ({

                    place:
                        Number(
                            select.dataset.finalFourPlace
                        ),

                    wrestlerId:
                        select.value

                })

            )

            .sort(

                (a, b) =>
                    b.place - a.place

            );


    const finalEliminations =

        [
            ...crResultsSpecialtyContent
                .querySelectorAll(
                    ".cr-results-overthrow-final-elimination"
                )
        ]

            .map(

                card => {

                    const place =
                        Number(
                            card.dataset.eliminatedPlace
                        );


                    const wrestlerId =
                        crResultsSpecialtyContent

                            .querySelector(
                                `[data-final-four-place='${place}']`
                            )

                            ?.value || "";


                    return {

                        place,

                        wrestlerId,

                        eliminatedBy:
                            card.querySelector(
                                "[data-overthrow-final-eliminated-by='true']"
                            )
                                ?.value || "",

                        method:
                            card.querySelector(
                                "[data-overthrow-final-method='true']"
                            )
                                ?.value || ""

                    };

                }

            );


    const winner =
        finalFour.find(

            item =>
                item.place === 1

        )?.wrestlerId || "";


    const eliminationCounts =
        {};


    entries.forEach(

        entry => {

            if (
                entry.eliminatedBy
            ) {

                eliminationCounts[
                    entry.eliminatedBy
                ] =

                    (
                        eliminationCounts[
                            entry.eliminatedBy
                        ] || 0
                    )

                    + 1;

            }

        }

    );


    const maxEliminations =
        Math.max(

            0,

            ...Object.values(
                eliminationCounts
            )

        );


    const mostEliminations =
        Object.keys(
            eliminationCounts
        )

            .filter(

                id =>

                    eliminationCounts[
                        id
                    ] === maxEliminations

                    &&

                    maxEliminations > 0

            );


    const timedEntries =
        entries

            .map(

                entry => ({

                    wrestlerId:
                        entry.wrestlerId,

                    seconds:
                        crResultsTimeToSeconds(
                            entry.time
                        )

                })

            )

            .filter(

                item =>

                    item.wrestlerId

                    &&

                    item.seconds !== null

            );


    const longestSeconds =

        timedEntries.length

            ? Math.max(

                ...timedEntries.map(
                    item =>
                        item.seconds
                )

            )

            : null;


    const shortestSeconds =

        timedEntries.length

            ? Math.min(

                ...timedEntries.map(
                    item =>
                        item.seconds
                )

            )

            : null;


    const ironman =
        timedEntries

            .filter(

                item =>
                    item.seconds === longestSeconds

            )

            .map(
                item =>
                    item.wrestlerId
            );


    const shortestTime =
        timedEntries

            .filter(

                item =>
                    item.seconds === shortestSeconds

            )

            .map(
                item =>
                    item.wrestlerId
            );


    return {

        division:
            crResultsSelectedMatch
                .specialty
                ?.division || "",

        entries,

        finalFour,

        finalEliminations,

        winner,

        stats: {

            mostEliminations,

            eliminationCount:
                maxEliminations,

            ironman,

            shortestTime

        }

    };

}



function crResultsValidateOverthrow(
    form,
    errors
) {

    const result =
        form.specialtyResult;


    if (!result) {

        errors.push(
            "Overthrow Rumble results are missing."
        );


        return;

    }


    if (
        result.entries.length !== 30
    ) {

        errors.push(
            "Overthrow Rumble requires 30 entries."
        );


        return;

    }


    result.entries.forEach(

        entry => {

            if (
                !entry.wrestlerId

                ||

                !entry.time
            ) {

                errors.push(

                    `Overthrow entry ${entry.entryNumber} is incomplete.`

                );

            }

        }

    );


    const entrantIds =
        result.entries

            .map(
                entry =>
                    entry.wrestlerId
            )

            .filter(
                Boolean
            );


    if (
        new Set(
            entrantIds
        ).size !== entrantIds.length
    ) {

        errors.push(
            "Every Overthrow entrant must be unique."
        );

    }


    const finalFourIds =
        result.finalFour

            .map(
                item =>
                    item.wrestlerId
            )

            .filter(
                Boolean
            );


    if (
        finalFourIds.length !== 4

        ||

        new Set(
            finalFourIds
        ).size !== 4
    ) {

        errors.push(
            "Overthrow Final Four selections must contain four unique wrestlers."
        );

    }


    if (
        finalFourIds.some(

            id =>
                !entrantIds.includes(
                    id
                )

        )
    ) {

        errors.push(
            "Every Final Four wrestler must appear in the 30-entry field."
        );

    }


    if (
        !result.winner
    ) {

        errors.push(
            "Select the Overthrow winner."
        );

    }


    result.entries.forEach(

        entry => {

            if (
                !entry.wrestlerId
            ) {

                return;

            }


            if (
                entry.wrestlerId ===
                    result.winner
            ) {

                if (
                    entry.eliminatedBy
                ) {

                    errors.push(
                        "The Overthrow winner cannot have an eliminator."
                    );

                }

            }


            else if (
                !entry.eliminatedBy
            ) {

                errors.push(

                    `${crResultsGetWrestlerName(entry.wrestlerId)} needs an eliminator.`

                );

            }

        }

    );


    result.finalEliminations.forEach(

        item => {

            if (
                !item.wrestlerId

                ||

                !item.eliminatedBy

                ||

                !item.method
            ) {

                errors.push(

                    `Overthrow Final Four place ${item.place} elimination is incomplete.`

                );

            }


            if (
                item.wrestlerId

                &&

                item.wrestlerId ===
                    item.eliminatedBy
            ) {

                errors.push(

                    `Overthrow Final Four place ${item.place} cannot be self-elimination.`

                );

            }

        }

    );

}



// =================================
// SPECIALTY ROUTER
// =================================

function crResultsRenderSpecialty() {

    crResultsSpecialtyContent.innerHTML =
        "";


    if (!crResultsSelectedMatch) {

        crResultsSpecialtyFields.hidden =
            true;


        return;

    }


    const stipulation =
        crResultsSelectedMatch
            .stipulation || "";


    const renderers = {

        "Battle Royal":
            crResultsRenderBattleRoyal,

        "Hex-Cell Eliminator":
            crResultsRenderHexCell,

        "Fate's Wheel":
            crResultsRenderFatesWheel,

        "Love and War":
            crResultsRenderLoveAndWar,

        "2 Out Of 3 Falls Match":
            crResultsRenderTwoOutOfThreeFalls,

        "Ironman Match":
            crResultsRenderIronman,

        "Overthrow Rumble":
            crResultsRenderOverthrow

    };


    const renderer =
        renderers[
            stipulation
        ];


    if (!renderer) {

        crResultsSpecialtyFields.hidden =
            true;


        return;

    }


    crResultsSpecialtyFields.hidden =
        false;


    renderer();

}



function crResultsBuildSpecialtyResult() {

    const stipulation =
        crResultsSelectedMatch
            ?.stipulation || "";


    switch (
        stipulation
    ) {

        case "Battle Royal":

            return crResultsBuildBattleRoyalResult();


        case "Hex-Cell Eliminator":

            return crResultsBuildHexCellResult();


        case "Fate's Wheel":

            return crResultsBuildFatesWheelResult();


        case "Love and War":

            return crResultsBuildLoveAndWarResult();


        case "2 Out Of 3 Falls Match":

            return crResultsBuildTwoOutOfThreeFallsResult();


        case "Ironman Match":

            return crResultsBuildIronmanResult();


        case "Overthrow Rumble":

            return crResultsBuildOverthrowResult();


        default:

            return null;

    }

}



// =================================
// FORM RECORD
// =================================

function crResultsGetFormRecord() {

    const resultType =
        crResultsResultType.value;


    const winningSideIndex =

        crResultsWinnerSide.value === ""

            ? null

            : Number(
                crResultsWinnerSide.value
            );


    return {

        resultType,

        winningSideIndex,

        winningWrestlerId:
            crResultsFinishWinner.value,

        losingWrestlerId:
            crResultsFinishLoser.value,

        method:
            crResultsMethod.value,

        rating:

            crResultsRating.value === ""

                ? null

                : Number(
                    crResultsRating.value
                ),

        starRating:

            crResultsStars.value === ""

                ? null

                : Number(
                    crResultsStars.value
                ),

        matchTime:
            crResultsTime.value.trim(),

        specialtyResult:
            crResultsBuildSpecialtyResult()

    };

}



// =================================
// VALIDATION
// =================================

function crResultsValidateStandard(
    form,
    errors
) {

    if (
        form.resultType !== "win"
    ) {

        return;

    }


    const stipulation =
        crResultsSelectedMatch
            ?.stipulation || "";


    if (
        stipulation ===
            "Overthrow Rumble"
    ) {

        return;

    }


    if (
        form.winningSideIndex === null
    ) {

        errors.push(
            "Select the winning side."
        );


        return;

    }


    if (
        stipulation ===
            "Love and War"
    ) {

        return;

    }


    if (
        !form.winningWrestlerId
    ) {

        errors.push(
            "Select the winning wrestler."
        );

    }


    if (
        !form.losingWrestlerId
    ) {

        errors.push(
            "Select the losing wrestler."
        );

    }


    if (
        stipulation !==
            "Ironman Match"

        &&

        !form.method
    ) {

        errors.push(
            "Select the finish method."
        );

    }


    if (
        form.winningWrestlerId

        &&

        form.winningWrestlerId ===
            form.losingWrestlerId
    ) {

        errors.push(
            "The finish winner and loser cannot be the same wrestler."
        );

    }


    const winnerMembers =

        crResultsSelectedMatch
            .sides?.[
                form.winningSideIndex
            ]
            ?.wrestlers

        || [];


    if (
        form.winningWrestlerId

        &&

        !winnerMembers.includes(
            form.winningWrestlerId
        )
    ) {

        errors.push(
            "The finish winner must belong to the selected winning side."
        );

    }


    if (
        form.losingWrestlerId

        &&

        winnerMembers.includes(
            form.losingWrestlerId
        )
    ) {

        errors.push(
            "The finish loser must belong to a losing side."
        );

    }

}



function crResultsValidatePerformance(
    form,
    errors
) {

    if (
        !Number.isFinite(
            form.rating
        )

        ||

        form.rating < 0

        ||

        form.rating > 100
    ) {

        errors.push(
            "Match % must be between 0 and 100."
        );

    }


    if (
        !Number.isFinite(
            form.starRating
        )

        ||

        form.starRating < 0

        ||

        form.starRating > 5
    ) {

        errors.push(
            "Star Rating must be between 0 and 5."
        );

    }


    if (
        !form.matchTime
    ) {

        errors.push(
            "Match time is required."
        );

    }

}



function crResultsValidateSpecialty(
    form,
    errors
) {

    const stipulation =
        crResultsSelectedMatch
            ?.stipulation || "";


    switch (
        stipulation
    ) {

        case "Battle Royal":

            crResultsValidateBattleRoyal(
                form,
                errors
            );

            break;


        case "Hex-Cell Eliminator":

            crResultsValidateHexCell(
                form,
                errors
            );

            break;


        case "Fate's Wheel":

            crResultsValidateFatesWheel(
                form,
                errors
            );

            break;


        case "Love and War":

            crResultsValidateLoveAndWar(
                form,
                errors
            );

            break;


        case "2 Out Of 3 Falls Match":

            crResultsValidateTwoOutOfThreeFalls(
                form,
                errors
            );

            break;


        case "Ironman Match":

            crResultsValidateIronman(
                form,
                errors
            );

            break;


        case "Overthrow Rumble":

            crResultsValidateOverthrow(
                form,
                errors
            );

            break;

    }

}



function crResultsValidate(
    form
) {

    const errors =
        [];


    if (
        !crResultsSelectedMatch
    ) {

        errors.push(
            "Select a match."
        );


        return errors;

    }


    if (
        !form.resultType
    ) {

        errors.push(
            "Select a result type."
        );

    }


    crResultsValidateStandard(
        form,
        errors
    );


    crResultsValidatePerformance(
        form,
        errors
    );


    crResultsValidateSpecialty(
        form,
        errors
    );


    return errors;

}



// =================================
// REVIEW
// =================================

function crResultsAddReviewRow(
    label,
    value
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "cr-editor-change-row";


    const strong =
        document.createElement(
            "strong"
        );


    strong.textContent =
        label;


    const span =
        document.createElement(
            "span"
        );


    span.textContent =
        value;


    row.appendChild(
        strong
    );


    row.appendChild(
        span
    );


    crResultsReviewList.appendChild(
        row
    );

}



function crResultsReviewSpecialty(
    form
) {

    const stipulation =
        crResultsSelectedMatch
            ?.stipulation || "";


    const specialty =
        form.specialtyResult;


    if (!specialty) {

        return;

    }


    if (
        stipulation ===
            "Battle Royal"
    ) {

        crResultsAddReviewRow(

            "Battle Royal Entries",

            String(
                specialty.participants.length
            )

        );

    }


    if (
        stipulation ===
            "Hex-Cell Eliminator"
    ) {

        crResultsAddReviewRow(

            "Hex Eliminations",

            String(
                specialty.eliminations.length
            )

        );

    }


    if (
        stipulation ===
            "Fate's Wheel"
    ) {

        crResultsAddReviewRow(

            "Final Five",

            specialty.finalists

                .map(

                    item =>
                        crResultsGetWrestlerName(
                            item.wrestlerId
                        )

                )

                .filter(
                    Boolean
                )

                .join(", ")

            ||

            "Incomplete"

        );

    }


    if (
        stipulation ===
            "Love and War"
    ) {

        crResultsAddReviewRow(

            "Winning Team",

            specialty.winningSide === null

                ? "—"

                : crResultsGetSideLabel(

                    crResultsSelectedMatch,

                    specialty.winningSide

                )

        );


        crResultsAddReviewRow(

            "Losing Team",

            specialty.losingSide === null

                ? "—"

                : crResultsGetSideLabel(

                    crResultsSelectedMatch,

                    specialty.losingSide

                )

        );

    }


    if (
        stipulation ===
            "2 Out Of 3 Falls Match"
    ) {

        crResultsAddReviewRow(

            "Falls Recorded",

            String(
                specialty.falls.length
            )

        );

    }


    if (
        stipulation ===
            "Ironman Match"
    ) {

        crResultsAddReviewRow(

            "Final Score",

            specialty.scores

                .map(

                    item =>

                        `${crResultsGetSideLabel(
                            crResultsSelectedMatch,
                            item.side
                        )} ${item.score ?? "—"}`

                )

                .join(" — ")

        );

    }


    if (
        stipulation ===
            "Overthrow Rumble"
    ) {

        crResultsAddReviewRow(

            "Overthrow Winner",

            specialty.winner

                ? crResultsGetWrestlerName(
                    specialty.winner
                )

                : "—"

        );


        crResultsAddReviewRow(

            "Most Eliminations",

            specialty.stats
                .mostEliminations
                .length

                ? `${crResultsJoinWrestlerNames(
                    specialty.stats.mostEliminations
                )} (${specialty.stats.eliminationCount})`

                : "—"

        );


        const ironLabel =

            String(
                specialty.division
            ).toLowerCase() === "women"

                ? "Ironwoman"

                : "Ironman";


        crResultsAddReviewRow(

            ironLabel,

            specialty.stats
                .ironman
                .length

                ? crResultsJoinWrestlerNames(
                    specialty.stats.ironman
                )

                : "—"

        );


        crResultsAddReviewRow(

            "Shortest Time",

            specialty.stats
                .shortestTime
                .length

                ? crResultsJoinWrestlerNames(
                    specialty.stats.shortestTime
                )

                : "—"

        );

    }

}



function crResultsReviewResult() {

    crResultsHideMessage();


    crResultsReviewList.innerHTML =
        "";


    crResultsError.hidden =
        true;


    if (
        !crResultsSelectedMatch
    ) {

        crResultsReview.hidden =
            true;


        crResultsSave.disabled =
            true;


        crResultsSetStatus(
            "SELECT MATCH"
        );


        return;

    }


    crResultsRefreshBasicLayout();


    const form =
        crResultsGetFormRecord();


    const errors =
        crResultsValidate(
            form
        );


    crResultsReview.hidden =
        false;


    crResultsAddReviewRow(

        "Match",

        crResultsFormatMatch(
            crResultsSelectedMatch
        )

    );


    crResultsAddReviewRow(

        "Result Type",

        form.resultType === "win"

            ? "Win"

            : form.resultType === "draw"

                ? "Draw"

                : "No Contest"

    );


    const stipulation =
        crResultsSelectedMatch
            .stipulation || "";


    if (
        form.resultType === "win"

        &&

        stipulation !==
            "Overthrow Rumble"

        &&

        form.winningSideIndex !== null
    ) {

        crResultsAddReviewRow(

            stipulation ===
                "Love and War"

                ? "Winning Team"

                : "Winning Side",

            crResultsGetSideLabel(

                crResultsSelectedMatch,

                form.winningSideIndex

            )

        );

    }


    if (
        form.resultType === "win"

        &&

        stipulation !==
            "Overthrow Rumble"

        &&

        stipulation !==
            "Love and War"

        &&

        form.winningWrestlerId
    ) {

        crResultsAddReviewRow(

            "Finish",

            `${crResultsGetWrestlerName(
                form.winningWrestlerId
            )} defeated ${crResultsGetWrestlerName(
                form.losingWrestlerId
            )} by ${

                stipulation ===
                    "Ironman Match"

                    ? "Ironman Score"

                    : form.method || "—"

            }`

        );

    }


    crResultsReviewSpecialty(
        form
    );


    crResultsAddReviewRow(

        "Match %",

        form.rating === null

            ? "—"

            : `${form.rating}%`

    );


    crResultsAddReviewRow(

        "Stars",

        form.starRating === null

            ? "—"

            : `${form.starRating} ★`

    );


    crResultsAddReviewRow(

        "Match Time",

        form.matchTime || "—"

    );


    if (
        errors.length > 0
    ) {

        crResultsError.textContent =
            errors.join(" ");


        crResultsError.hidden =
            false;

    }


    crResultsSave.disabled =
        errors.length > 0;


    crResultsSetStatus(

        errors.length > 0

            ? "CHECK FORM"

            : "READY TO SAVE"

    );

}



// =================================
// MATCH LOADING
// =================================

function crResultsClearWizard() {

    crResultsSelectedMatch =
        null;


    crResultsMatchPreview.hidden =
        true;


    crResultsBasicFields.hidden =
        true;


    crResultsPerformanceFields.hidden =
        true;


    crResultsSpecialtyFields.hidden =
        true;


    crResultsSpecialtyContent.innerHTML =
        "";


    crResultsReview.hidden =
        true;


    crResultsReviewList.innerHTML =
        "";


    crResultsError.hidden =
        true;


    crResultsSave.disabled =
        true;


    crResultsResetStandardFields();

}



function crResultsLoadSelectedMatch() {

    crResultsHideMessage();


    const matchId =
        crResultsMatch.value;


    if (!matchId) {

        crResultsClearWizard();


        crResultsSetStatus(
            "SELECT MATCH"
        );


        return;

    }


    const match =
        owlControlRoomData
            .announcedMatches

            .find(

                item =>
                    item.id === matchId

            );


    if (!match) {

        crResultsClearWizard();


        crResultsShowMessage(

            "The selected announced match could not be found.",

            "save-error"

        );


        crResultsSetStatus(
            "MATCH NOT FOUND"
        );


        return;

    }


    crResultsSelectedMatch =
        structuredClone(
            match
        );


    crResultsResetStandardFields();


    crResultsPopulateWinnerControls();


    if (
        CR_RESULTS_FORCED_WIN_STIPULATIONS.has(
            match.stipulation
        )
    ) {

        crResultsResultType.value =
            "win";


        crResultsResultType.disabled =
            true;

    }


    crResultsMatchSummary.innerHTML =
        "";


    const title =
        document.createElement(
            "strong"
        );


    title.textContent =
        crResultsFormatMatch(
            match
        );


    const meta =
        document.createElement(
            "span"
        );


    meta.textContent =

        [

            match.matchType,

            match.stipulation
                || "Standard",

            crResultsGetChampionshipName(
                match.championshipId
            )

        ]

            .join(" • ");


    crResultsMatchSummary.appendChild(
        title
    );


    crResultsMatchSummary.appendChild(
        meta
    );


    crResultsMatchPreview.hidden =
        false;


    crResultsBasicFields.hidden =
        false;


    crResultsPerformanceFields.hidden =
        false;


    crResultsRefreshBasicLayout();


    crResultsRenderSpecialty();


    crResultsReviewResult();

}



// =================================
// COMPLETED MATCH RECORD
// =================================

function crResultsBuildCompletedRecord(
    form
) {

    const record =
        structuredClone(
            crResultsSelectedMatch
        );


    record.status =
        "completed";


    record.resultType =
        form.resultType;


    record.winnerSide =

        form.resultType === "win"

            ? form.winningSideIndex

            : null;


    record.rating =
        form.rating;


    record.starRating =
        form.starRating;


    record.matchTime =
        form.matchTime;


    if (
        form.resultType === "win"
    ) {

        const stipulation =
            record.stipulation || "";


        if (
            stipulation ===
                "Overthrow Rumble"
        ) {

            const entries =
                form.specialtyResult
                    ?.entries || [];


            record.sides =
                entries.map(

                    entry => ({

                        wrestlers:
                            [
                                entry.wrestlerId
                            ].filter(
                                Boolean
                            )

                    })

                );


            record.winnerSide =
                entries.findIndex(

                    entry =>
                        entry.wrestlerId ===
                            form.specialtyResult
                                ?.winner

                );


            delete record.finish;

        }


        else if (
            stipulation ===
                "Love and War"
        ) {

            delete record.finish;

        }


        else {

            record.finish = {

                winner:
                    form.winningWrestlerId,

                loser:
                    form.losingWrestlerId,

                method:

                    stipulation ===
                        "Ironman Match"

                        ? "Ironman Score"

                        : form.method

            };

        }

    }


    else {

        delete record.finish;

    }


    if (
        form.specialtyResult
    ) {

        record.specialtyResult =
            form.specialtyResult;

    }


    else {

        delete record.specialtyResult;

    }


    return record;

}



// =================================
// TITLE CONSEQUENCE HELPERS
// =================================

function crResultsResolveTitleHolder(
    form
) {

    const stipulation =
        crResultsSelectedMatch
            ?.stipulation || "";


    if (
        stipulation ===
            "Overthrow Rumble"
    ) {

        const winnerId =
            form.specialtyResult
                ?.winner || "";


        if (!winnerId) {

            throw new Error(
                "Could not resolve the Overthrow winner for the championship result."
            );

        }


        return {

            holderType:
                "wrestler",

            holderId:
                winnerId

        };

    }


    if (
        form.winningSideIndex === null
    ) {

        throw new Error(
            "Could not resolve the championship-winning side."
        );

    }


    const wrestlerIds =

        crResultsSelectedMatch
            .sides?.[
                form.winningSideIndex
            ]
            ?.wrestlers

        || [];


    if (
        wrestlerIds.length === 1
    ) {

        return {

            holderType:
                "wrestler",

            holderId:
                wrestlerIds[0]

        };

    }


    if (
        wrestlerIds.length === 2
    ) {

        const officialTeam =
            crResultsGetOfficialTeamByMembers(
                wrestlerIds
            );


        if (!officialTeam) {

            throw new Error(
                "The winning tag side does not match an official OWL team, so the title reign cannot be linked safely."
            );

        }


        return {

            holderType:
                "team",

            holderId:
                officialTeam.id

        };

    }


    throw new Error(
        "This championship result cannot be linked to a single wrestler or official two-person team."
    );

}



function crResultsSlug(
    value
) {

    return String(
        value || ""
    )

        .normalize(
            "NFD"
        )

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .toLowerCase()

        .replace(
            /[^a-z0-9]+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            ""
        );

}



function crResultsCreateReignId(
    reigns,
    championshipId,
    event,
    holder
) {

    const base =

        [

            "reign",

            crResultsSlug(
                championshipId
            ),

            crResultsSlug(
                event.date
            ),

            crResultsSlug(
                holder.holderId
            )

        ]

            .filter(
                Boolean
            )

            .join("-");


    let candidate =
        base;


    let suffix =
        2;


    while (
        reigns.some(

            reign =>
                reign.id === candidate

        )
    ) {

        candidate =
            `${base}-${suffix}`;


        suffix +=
            1;

    }


    return candidate;

}



function crResultsBuildTitleReignUpdate(
    reigns,
    form
) {

    const championshipId =
        crResultsSelectedMatch
            ?.championshipId || "";


    if (
        !championshipId

        ||

        form.resultType !== "win"
    ) {

        return {

            changed:
                false,

            reigns

        };

    }


    const event =
        crResultsGetSelectedEvent();


    if (
        !event

        ||

        !event.date
    ) {

        throw new Error(
            "The event date could not be found for the championship result."
        );

    }


    const holder =
        crResultsResolveTitleHolder(
            form
        );


    const updatedReigns =
        structuredClone(
            reigns
        );


    const activeIndex =
        updatedReigns.findIndex(

            reign =>

                reign.championshipId ===
                    championshipId

                &&

                !reign.lostDate

        );


    if (
        activeIndex !== -1
    ) {

        const activeReign =
            updatedReigns[
                activeIndex
            ];


        const sameHolder =

            activeReign.holderType ===
                holder.holderType

            &&

            activeReign.holderId ===
                holder.holderId;


        if (sameHolder) {

            activeReign.defenses =

                Number(
                    activeReign.defenses || 0
                )

                + 1;


            return {

                changed:
                    true,

                reigns:
                    updatedReigns,

                consequence:
                    "defense"

            };

        }


        activeReign.lostDate =
            event.date;


        activeReign.lostAt =
            event.name || "";


        activeReign.lostEventId =
            event.id;

    }


    updatedReigns.push({

        id:
            crResultsCreateReignId(

                updatedReigns,

                championshipId,

                event,

                holder

            ),

        championshipId,

        holderType:
            holder.holderType,

        holderId:
            holder.holderId,

        wonDate:
            event.date,

        wonAt:
            event.name || "",

        wonEventId:
            event.id,

        lostDate:
            "",

        lostAt:
            "",

        lostEventId:
            "",

        defenses:
            0

    });


    return {

        changed:
            true,

        reigns:
            updatedReigns,

        consequence:

            activeIndex === -1

                ? "new-reign"

                : "title-change"

    };

}



// =================================
// FILE HELPERS
// =================================

async function crResultsEnsureWritePermission() {

    if (!owlRepositoryHandle) {

        return false;

    }


    const options = {

        mode:
            "readwrite"

    };


    if (
        await owlRepositoryHandle
            .queryPermission(
                options
            )

        === "granted"
    ) {

        return true;

    }


    return (

        await owlRepositoryHandle
            .requestPermission(
                options
            )

        === "granted"

    );

}



async function crResultsReadDataFile(
    filename
) {

    const dataDirectory =
        await owlRepositoryHandle
            .getDirectoryHandle(
                "data"
            );


    const fileHandle =
        await dataDirectory
            .getFileHandle(
                filename
            );


    const file =
        await fileHandle
            .getFile();


    return {

        filename,

        fileHandle,

        text:
            await file.text()

    };

}



async function crResultsWriteFile(
    fileHandle,
    text
) {

    const writable =
        await fileHandle
            .createWritable();


    await writable.write(
        text
    );


    await writable.close();

}



function crResultsFindObjectBounds(
    text,
    recordId
) {

    const escapedId =
        recordId.replace(

            /[.*+?^${}()|[\]\\]/g,

            "\\$&"

        );


    const pattern =
        new RegExp(

            `"id"\\s*:\\s*"${escapedId}"`

        );


    const match =
        pattern.exec(
            text
        );


    if (!match) {

        throw new Error(
            `Could not find record ${recordId}.`
        );

    }


    const start =
        text.lastIndexOf(

            "{",

            match.index

        );


    let end =
        -1;


    let depth =
        0;


    let inString =
        false;


    let escaped =
        false;


    for (
        let index = start;
        index < text.length;
        index += 1
    ) {

        const character =
            text[index];


        if (escaped) {

            escaped =
                false;


            continue;

        }


        if (
            character === "\\"

            &&

            inString
        ) {

            escaped =
                true;


            continue;

        }


        if (
            character === "\""
        ) {

            inString =
                !inString;


            continue;

        }


        if (inString) {

            continue;

        }


        if (
            character === "{"
        ) {

            depth +=
                1;

        }


        else if (
            character === "}"
        ) {

            depth -=
                1;


            if (
                depth === 0
            ) {

                end =
                    index;


                break;

            }

        }

    }


    if (
        start === -1

        ||

        end === -1
    ) {

        throw new Error(
            `Could not locate record ${recordId}.`
        );

    }


    return {

        start,

        end

    };

}



function crResultsFormatObject(
    record
) {

    return JSON.stringify(

        record,

        null,

        2

    )

        .split("\n")

        .map(

            line =>
                `  ${line}`

        )

        .join("\n");

}



function crResultsAppendRecordText(
    text,
    record
) {

    const closingIndex =
        text.lastIndexOf(
            "]"
        );


    if (
        closingIndex === -1
    ) {

        throw new Error(
            "Could not find the end of matches.json."
        );

    }


    const before =
        text.slice(

            0,

            closingIndex

        );


    const after =
        text.slice(
            closingIndex
        );


    const trimmedBefore =
        before.trimEnd();


    const hasRecords =
        !trimmedBefore.endsWith(
            "["
        );


    return (

        trimmedBefore

        +

        (
            hasRecords

                ? ",\n"

                : "\n"
        )

        +

        crResultsFormatObject(
            record
        )

        +

        "\n"

        +

        after

    );

}



function crResultsRemoveRecordText(
    text,
    recordId
) {

    const bounds =
        crResultsFindObjectBounds(

            text,

            recordId

        );


    let before =
        text.slice(

            0,

            bounds.start

        );


    let after =
        text.slice(
            bounds.end + 1
        );


    if (
        /^\s*,/.test(
            after
        )
    ) {

        after =
            after.replace(

                /^\s*,/,

                ""

            );

    }


    else if (
        /,\s*$/.test(
            before
        )
    ) {

        before =
            before.replace(

                /,\s*$/,

                "\n"

            );

    }


    return before + after;

}



function crResultsParseJsonArray(
    text,
    filename
) {

    let parsed;


    try {

        parsed =
            JSON.parse(
                text
            );

    }


    catch (error) {

        throw new Error(
            `${filename} is not valid JSON.`
        );

    }


    if (
        !Array.isArray(
            parsed
        )
    ) {

        throw new Error(
            `${filename} must contain a JSON array.`
        );

    }


    return parsed;

}



function crResultsSerializeJsonArray(
    records
) {

    return `${JSON.stringify(
        records,
        null,
        2
    )}\n`;

}



// =================================
// SAVE RESULT
// =================================

async function crResultsSaveResult() {

    crResultsSave.disabled =
        true;


    crResultsSetStatus(
        "SAVING..."
    );


    crResultsHideMessage();


    const writtenFiles =
        [];


    try {

        const permission =
            await crResultsEnsureWritePermission();


        if (!permission) {

            throw new Error(
                "Write permission was not granted."
            );

        }


        const form =
            crResultsGetFormRecord();


        const errors =
            crResultsValidate(
                form
            );


        if (
            errors.length > 0
        ) {

            throw new Error(
                errors.join(" ")
            );

        }


        const completedRecord =
            crResultsBuildCompletedRecord(
                form
            );


        const matchesFile =
            await crResultsReadDataFile(
                "matches.json"
            );


        const announcedFile =
            await crResultsReadDataFile(
                "announced-matches.json"
            );


        const updatedMatchesText =
            crResultsAppendRecordText(

                matchesFile.text,

                completedRecord

            );


        const updatedAnnouncedText =
            crResultsRemoveRecordText(

                announcedFile.text,

                crResultsSelectedMatch.id

            );


        let titleFile =
            null;


        let titleUpdate = {

            changed:
                false,

            reigns:
                []

        };


        let updatedTitleText =
            "";


        if (
            crResultsSelectedMatch
                .championshipId

            &&

            form.resultType === "win"
        ) {

            titleFile =
                await crResultsReadDataFile(
                    "title-reigns.json"
                );


            const reigns =
                crResultsParseJsonArray(

                    titleFile.text,

                    "title-reigns.json"

                );


            titleUpdate =
                crResultsBuildTitleReignUpdate(

                    reigns,

                    form

                );


            if (
                titleUpdate.changed
            ) {

                updatedTitleText =
                    crResultsSerializeJsonArray(
                        titleUpdate.reigns
                    );

            }

        }


        writtenFiles.push(
            matchesFile
        );


        await crResultsWriteFile(

            matchesFile.fileHandle,

            updatedMatchesText

        );


        writtenFiles.push(
            announcedFile
        );


        await crResultsWriteFile(

            announcedFile.fileHandle,

            updatedAnnouncedText

        );


        if (
            titleFile

            &&

            titleUpdate.changed
        ) {

            writtenFiles.push(
                titleFile
            );


            await crResultsWriteFile(

                titleFile.fileHandle,

                updatedTitleText

            );

        }


        await loadRepositoryData(
            owlRepositoryHandle
        );


        crResultsPopulateEvents();


        crResultsPopulateMatches();


        crResultsMatch.value =
            "";


        crResultsClearWizard();


        const filesChanged =

            [

                "matches.json",

                "announced-matches.json",

                ...(

                    titleUpdate.changed

                        ? [
                            "title-reigns.json"
                        ]

                        : []

                )

            ];


        crResultsShowMessage(

            `Result saved locally. Review ${filesChanged.join(", ")} in GitHub Desktop before committing.`,

            "save-success"

        );


        crResultsSetStatus(
            "RESULT SAVED"
        );

    }


    catch (error) {

        console.error(
            "Could not save match result:",
            error
        );


        for (
            const file of
            [...writtenFiles].reverse()
        ) {

            try {

                await crResultsWriteFile(

                    file.fileHandle,

                    file.text

                );

            }


            catch (
                rollbackError
            ) {

                console.error(

                    `Could not roll back ${file.filename}:`,

                    rollbackError

                );

            }

        }


        crResultsReviewResult();


        crResultsSetStatus(
            "SAVE FAILED"
        );


        crResultsShowMessage(

            error.message

            ||

            "The match result could not be saved.",

            "save-error"

        );

    }

}



// =================================
// EVENTS
// =================================

crResultsEvent.addEventListener(

    "change",

    () => {

        crResultsHideMessage();


        crResultsMatch.value =
            "";


        crResultsPopulateMatches();


        crResultsClearWizard();


        crResultsSetStatus(

            crResultsEvent.value

                ? "SELECT MATCH"

                : "READY"

        );

    }

);


crResultsMatch.addEventListener(

    "change",

    crResultsLoadSelectedMatch

);


crResultsResultType.addEventListener(

    "change",

    () => {

        crResultsRefreshBasicLayout();


        crResultsReviewResult();

    }

);


[

    crResultsWinnerSide,

    crResultsFinishWinner,

    crResultsFinishLoser,

    crResultsMethod,

    crResultsStars

].forEach(

    field => {

        field.addEventListener(

            "change",

            crResultsReviewResult

        );

    }

);


[

    crResultsRating,

    crResultsTime

].forEach(

    field => {

        field.addEventListener(

            "input",

            crResultsReviewResult

        );

    }

);


crResultsSave.addEventListener(

    "click",

    crResultsSaveResult

);


window.addEventListener(

    "owl-control-room-data-loaded",

    () => {

        crResultsPopulateEvents();


        crResultsPopulateMatches();

    }

);



// =================================
// SAFETY INITIALIZATION
// =================================

try {

    if (
        typeof owlControlRoomData !==
            "undefined"

        &&

        Array.isArray(
            owlControlRoomData.wrestlers
        )

        &&

        Array.isArray(
            owlControlRoomData.teams
        )

        &&

        Array.isArray(
            owlControlRoomData.events
        )

        &&

        Array.isArray(
            owlControlRoomData.championships
        )

        &&

        Array.isArray(
            owlControlRoomData.announcedMatches
        )
    ) {

        crResultsPopulateEvents();


        crResultsPopulateMatches();


        crResultsSetStatus(
            "READY"
        );

    }

}


catch (error) {

    console.warn(

        "Results Wizard waiting for repository data.",

        error

    );

}
