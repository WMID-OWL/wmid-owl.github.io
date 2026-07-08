// =================================
// OWL CONTROL ROOM
// RESULTS WIZARD
// =================================


// =================================
// ELEMENTS
// =================================


const crResultsStatus =
    document.getElementById(
        "cr-results-status",
    );


const crResultsEvent =
    document.getElementById(
        "cr-results-event",
    );


const crResultsMatch =
    document.getElementById(
        "cr-results-match",
    );


const crResultsMatchPreview =
    document.getElementById(
        "cr-results-match-preview",
    );


const crResultsMatchSummary =
    document.getElementById(
        "cr-results-match-summary",
    );


const crResultsBasicFields =
    document.getElementById(
        "cr-results-basic-fields",
    );


const crResultsPerformanceFields =
    document.getElementById(
        "cr-results-performance-fields",
    );


const crResultsSpecialtyFields =
    document.getElementById(
        "cr-results-specialty-fields",
    );


const crResultsSpecialtyContent =
    document.getElementById(
        "cr-results-specialty-content",
    );


const crResultsReview =
    document.getElementById(
        "cr-results-review",
    );


const crResultsReviewList =
    document.getElementById(
        "cr-results-review-list",
    );


const crResultsError =
    document.getElementById(
        "cr-results-error",
    );


const crResultsSave =
    document.getElementById(
        "cr-results-save",
    );


const crResultsMessage =
    document.getElementById(
        "cr-results-message",
    );


const crResultsResultType =
    document.getElementById(
        "cr-results-result-type",
    );


const crResultsWinnerSideRow =
    document.getElementById(
        "cr-results-winner-side-row",
    );


const crResultsWinnerSide =
    document.getElementById(
        "cr-results-winner-side",
    );


const crResultsFinishWinnerRow =
    document.getElementById(
        "cr-results-finish-winner-row",
    );


const crResultsFinishWinner =
    document.getElementById(
        "cr-results-finish-winner",
    );


const crResultsFinishLoserRow =
    document.getElementById(
        "cr-results-finish-loser-row",
    );


const crResultsFinishLoser =
    document.getElementById(
        "cr-results-finish-loser",
    );


const crResultsMethodRow =
    document.getElementById(
        "cr-results-method-row",
    );


const crResultsMethod =
    document.getElementById(
        "cr-results-method",
    );


const crResultsRating =
    document.getElementById(
        "cr-results-rating",
    );


const crResultsStars =
    document.getElementById(
        "cr-results-stars",
    );


const crResultsTime =
    document.getElementById(
        "cr-results-time",
    );


// =================================
// STATE
// =================================


let crResultsSelectedMatch =
    null;


// =================================
// CONSTANTS
// =================================


const CR_RESULTS_ELIMINATION_METHODS = [

    "Pinfall",

    "Submission",

    "KO",

    "Count Out",

    "Disqualification",

    "Other",

];


const CR_RESULTS_FATES_WHEEL_OUTCOMES = {

    MAIN_TITLE:
        "main-title-shot",

    MIDCARD_TITLE:
        "midcard-title-shot",

    REMORSE:
        "remorse-case",

};


// =================================
// BASIC HELPERS
// =================================


function crResultsSetStatus(
    text,
) {
    crResultsStatus.textContent =
        text;
}


function crResultsShowMessage(
    message,
    type,
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


function crResultsHideMatchFields() {
    crResultsMatchPreview.hidden =
        true;


    crResultsBasicFields.hidden =
        true;


    crResultsPerformanceFields.hidden =
        true;


    crResultsSpecialtyFields.hidden =
        true;


    crResultsReview.hidden =
        true;


    crResultsSave.disabled =
        true;


    crResultsSpecialtyContent.innerHTML =
        "";
}


function crResultsGetWrestlerName(
    wrestlerId,
) {
    const wrestler =
        owlControlRoomData.wrestlers.find(
            (item) =>
                item.id === wrestlerId,
        );


    return wrestler

        ? wrestler.name

        : wrestlerId;
}


function crResultsGetChampionshipName(
    championshipId,
) {
    if (
        !championshipId
    ) {
        return "Non-Title Match";
    }


    const championship =
        owlControlRoomData.championships.find(
            (item) =>
                item.id === championshipId,
        );


    return championship

        ? championship.name

        : championshipId;
}


function crResultsFormatSide(
    side,
) {
    const wrestlerIds =
        Array.isArray(
            side?.wrestlers,
        )

            ? side.wrestlers

            : [];


    return wrestlerIds

        .map(
            crResultsGetWrestlerName,
        )

        .join(
            " & ",
        );
}


function crResultsFormatMatch(
    match,
) {
    if (
        !match
    ) {
        return "Unknown Match";
    }


    if (
        match.stipulation ===
        "Overthrow Rumble"
    ) {
        const division =
            match.specialty?.division;


        return division

            ? `${division}'s Overthrow Rumble`

            : "Overthrow Rumble";
    }


    if (
        !Array.isArray(
            match.sides,
        )
    ) {
        return "Unknown Match";
    }


    return match.sides

        .map(
            crResultsFormatSide,
        )

        .filter(
            Boolean,
        )

        .join(
            " vs. ",
        );
}


function crResultsAddRow(
    container,
    label,
    value,
) {
    const row =
        document.createElement(
            "div",
        );


    row.className =
        "cr-editor-change-row";


    const labelElement =
        document.createElement(
            "strong",
        );


    labelElement.textContent =
        label;


    const valueElement =
        document.createElement(
            "span",
        );


    valueElement.textContent =
        value;


    row.appendChild(
        labelElement,
    );


    row.appendChild(
        valueElement,
    );


    container.appendChild(
        row,
    );
}


function crResultsGetSideLabel(
    sideIndex,
) {
    const side =
        crResultsSelectedMatch
            ?.sides
            ?.[sideIndex];


    return side

        ? crResultsFormatSide(
            side,
        )

        : "—";
}


function crResultsGetMatchParticipantIds(
    match = crResultsSelectedMatch,
) {
    if (
        !match

        ||

        !Array.isArray(
            match.sides,
        )
    ) {
        return [];
    }


    return [

        ...new Set(

            match.sides.flatMap(

                (side) =>

                    Array.isArray(
                        side.wrestlers,
                    )

                        ? side.wrestlers

                        : [],

            ),

        ),

    ].filter(
        Boolean,
    );
}


function crResultsTimeToSeconds(
    timeValue,
) {
    if (
        !/^(?:\d+):[0-5]\d$/.test(
            timeValue,
        )
    ) {
        return null;
    }


    const [

        minutes,

        seconds,

    ] =
        timeValue

            .split(
                ":",
            )

            .map(
                Number,
            );


    return (

        minutes * 60

        +

        seconds

    );
}


function crResultsJoinWrestlerNames(
    wrestlerIds,
) {
    if (
        !Array.isArray(
            wrestlerIds,
        )

        ||

        wrestlerIds.length === 0
    ) {
        return "—";
    }


    return wrestlerIds

        .map(
            crResultsGetWrestlerName,
        )

        .join(
            ", ",
        );
}


function crResultsPopulateParticipantSelect(

    selectElement,

    participantIds,

    placeholder = "Select Wrestler",

    selectedValue = "",

) {
    selectElement.innerHTML =
        "";


    const placeholderOption =
        document.createElement(
            "option",
        );


    placeholderOption.value =
        "";


    placeholderOption.textContent =
        placeholder;


    selectElement.appendChild(
        placeholderOption,
    );


    participantIds.forEach(

        (wrestlerId) => {

            const option =
                document.createElement(
                    "option",
                );


            option.value =
                wrestlerId;


            option.textContent =
                crResultsGetWrestlerName(
                    wrestlerId,
                );


            selectElement.appendChild(
                option,
            );

        },

    );


    if (
        participantIds.includes(
            selectedValue,
        )
    ) {
        selectElement.value =
            selectedValue;
    }
}


function crResultsCreateMethodSelect(

    values =
        CR_RESULTS_ELIMINATION_METHODS,

) {
    const select =
        document.createElement(
            "select",
        );


    const placeholder =
        document.createElement(
            "option",
        );


    placeholder.value =
        "";


    placeholder.textContent =
        "Select Method";


    select.appendChild(
        placeholder,
    );


    values.forEach(

        (method) => {

            const option =
                document.createElement(
                    "option",
                );


            option.value =
                method;


            option.textContent =
                method;


            select.appendChild(
                option,
            );

        },

    );


    return select;
}


// =================================
// EVENT POPULATION
// =================================


function crResultsPopulateEvents() {
    const oldValue =
        crResultsEvent.value;


    crResultsEvent.innerHTML = `
        <option value="">
            Select Event
        </option>
    `;


    const events =
        [...owlControlRoomData.events]

            .sort(

                (a, b) =>

                    new Date(
                        `${a.date}T00:00:00`,
                    )

                    -

                    new Date(
                        `${b.date}T00:00:00`,
                    ),

            );


    events.forEach(

        (event) => {

            const option =
                document.createElement(
                    "option",
                );


            option.value =
                event.id;


            option.textContent =
                `${event.date} — ${event.name}`;


            crResultsEvent.appendChild(
                option,
            );

        },

    );


    if (
        oldValue

        &&

        events.some(

            (event) =>
                event.id === oldValue,

        )
    ) {
        crResultsEvent.value =
            oldValue;
    }
}


// =================================
// MATCH POPULATION
// =================================


function crResultsGetEventMatches() {
    const eventId =
        crResultsEvent.value;


    if (
        !eventId
    ) {
        return [];
    }


    return owlControlRoomData
        .announcedMatches

        .filter(

            (match) =>
                match.eventId ===
                eventId,

        )

        .sort(

            (a, b) =>

                Number(
                    a.order || 0,
                )

                -

                Number(
                    b.order || 0,
                ),

        );
}


function crResultsPopulateMatches() {
    const oldValue =
        crResultsMatch.value;


    crResultsMatch.innerHTML = `
        <option value="">
            Select Match
        </option>
    `;


    const eventMatches =
        crResultsGetEventMatches();


    eventMatches.forEach(

        (match) => {

            const option =
                document.createElement(
                    "option",
                );


            option.value =
                match.id;


            option.textContent =

                `Match ${match.order} — ${crResultsFormatMatch(
                    match,
                )}`;


            crResultsMatch.appendChild(
                option,
            );

        },

    );


    crResultsMatch.disabled =
        !crResultsEvent.value;


    if (
        oldValue

        &&

        eventMatches.some(

            (match) =>
                match.id === oldValue,

        )
    ) {
        crResultsMatch.value =
            oldValue;
    }
}


// =================================
// STANDARD RESULT CONTROLS
// =================================


function crResultsPopulateWinnerControls(
    match,
) {
    crResultsWinnerSide.innerHTML = `
        <option value="">
            Select Winning Side
        </option>
    `;


    crResultsFinishWinner.innerHTML = `
        <option value="">
            Select Wrestler
        </option>
    `;


    crResultsFinishLoser.innerHTML = `
        <option value="">
            Select Wrestler
        </option>
    `;


    const sides =
        Array.isArray(
            match.sides,
        )

            ? match.sides

            : [];


    sides.forEach(

        (side, index) => {

            const option =
                document.createElement(
                    "option",
                );


            option.value =
                String(
                    index,
                );


            option.textContent =

                `Side ${index + 1} — ${crResultsFormatSide(
                    side,
                )}`;


            crResultsWinnerSide.appendChild(
                option,
            );

        },

    );


    const wrestlerIds =
        crResultsGetMatchParticipantIds(
            match,
        );


    wrestlerIds.forEach(

        (wrestlerId) => {

            const winnerOption =
                document.createElement(
                    "option",
                );


            winnerOption.value =
                wrestlerId;


            winnerOption.textContent =
                crResultsGetWrestlerName(
                    wrestlerId,
                );


            crResultsFinishWinner.appendChild(
                winnerOption,
            );


            const loserOption =
                document.createElement(
                    "option",
                );


            loserOption.value =
                wrestlerId;


            loserOption.textContent =
                crResultsGetWrestlerName(
                    wrestlerId,
                );


            crResultsFinishLoser.appendChild(
                loserOption,
            );

        },

    );
}


function crResultsConfigureWinnerSideLabel(
    match,
) {
    const label =
        crResultsWinnerSideRow.querySelector(

            'label[for="cr-results-winner-side"]',

        );


    if (
        !label
    ) {
        return;
    }


    label.textContent =

        match?.stipulation ===
        "Love and War"

            ? "WINNING TEAM"

            : "WINNING SIDE";
}


function crResultsRefreshResultTypeLayout() {
    const isWin =
        crResultsResultType.value ===
        "win";


    const stipulation =
        crResultsSelectedMatch
            ?.stipulation || "";


    const isOverthrowRumble =

        stipulation ===
        "Overthrow Rumble";


        const isLoveAndWar =

        stipulation ===
        "Love and War";


    const isIronmanMatch =

        stipulation ===
        "Ironman Match";


    const showWinningSide =

        isWin

        &&

        !isOverthrowRumble;


    const showDetailedFinish =

        showWinningSide

        &&

        !isLoveAndWar;


    crResultsWinnerSideRow.hidden =
        !showWinningSide;


    crResultsWinnerSideRow.style.display =

        showWinningSide

            ? ""

            : "none";


    crResultsFinishWinnerRow.hidden =
        !showDetailedFinish;


    crResultsFinishWinnerRow.style.display =

        showDetailedFinish

            ? ""

            : "none";


    crResultsFinishLoserRow.hidden =
        !showDetailedFinish;


    crResultsFinishLoserRow.style.display =

        showDetailedFinish

            ? ""

            : "none";


        const showFinishMethod =

        showDetailedFinish

        &&

        !isIronmanMatch;


    crResultsMethodRow.hidden =
        !showFinishMethod;


    crResultsMethodRow.style.display =

        showFinishMethod

            ? ""

            : "none";


    crResultsReviewResult();
}


// =================================
// BATTLE ROYAL RESULTS
// =================================


function crResultsGetBattleRoyalParticipants() {
    return crResultsGetMatchParticipantIds();
}


function crResultsBuildBattleRoyalResult() {
    if (
        crResultsSelectedMatch
            ?.stipulation !==
        "Battle Royal"
    ) {
        return null;
    }


    const rows = [

        ...crResultsSpecialtyContent.querySelectorAll(

            "[data-cr-results-br-participant]",

        ),

    ];


    return {

        participantResults:

            rows.map(

                (row) => ({

                    wrestlerId:

                        row.dataset
                            .crResultsBrParticipant,


                    timeInMatch:

                        row.querySelector(

                            "[data-cr-results-br-time]",

                        )
                            ?.value
                            .trim()

                        || "",


                    eliminatedBy:

                        row.querySelector(

                            "[data-cr-results-br-eliminator]",

                        )
                            ?.value

                        || null,

                }),

            ),

    };
}


function crResultsRenderBattleRoyalFields(
    match,
) {
    const participantIds =
        crResultsGetMatchParticipantIds(
            match,
        );


    crResultsSpecialtyContent.innerHTML =
        "";


    participantIds.forEach(

        (wrestlerId) => {

            const row =
                document.createElement(
                    "div",
                );


            row.className =
                "cr-editor-section";


            row.dataset.crResultsBrParticipant =
                wrestlerId;


            const heading =
                document.createElement(
                    "div",
                );


            heading.className =
                "cr-editor-section-heading";


            const eyebrow =
                document.createElement(
                    "span",
                );


            eyebrow.textContent =
                "PARTICIPANT";


            const name =
                document.createElement(
                    "h3",
                );


            name.textContent =
                crResultsGetWrestlerName(
                    wrestlerId,
                );


            heading.appendChild(
                eyebrow,
            );


            heading.appendChild(
                name,
            );


            const grid =
                document.createElement(
                    "div",
                );


            grid.className =
                "cr-editor-form-grid";


            const timeGroup =
                document.createElement(
                    "div",
                );


            timeGroup.className =
                "cr-form-group";


            const timeLabel =
                document.createElement(
                    "label",
                );


            timeLabel.textContent =
                "TIME IN MATCH";


            const timeInput =
                document.createElement(
                    "input",
                );


            timeInput.type =
                "text";


            timeInput.placeholder =
                "12:34";


            timeInput.autocomplete =
                "off";


            timeInput.dataset.crResultsBrTime =
                "true";


            timeGroup.appendChild(
                timeLabel,
            );


            timeGroup.appendChild(
                timeInput,
            );


            const eliminatorGroup =
                document.createElement(
                    "div",
                );


            eliminatorGroup.className =
                "cr-form-group";


            const eliminatorLabel =
                document.createElement(
                    "label",
                );


            eliminatorLabel.textContent =
                "ELIMINATED BY";


            const eliminatorSelect =
                document.createElement(
                    "select",
                );


            eliminatorSelect.dataset.crResultsBrEliminator =
                "true";


            crResultsPopulateParticipantSelect(

                eliminatorSelect,

                participantIds.filter(

                    (otherId) =>
                        otherId !==
                        wrestlerId,

                ),

                "Not Eliminated / Winner",

            );


            eliminatorGroup.appendChild(
                eliminatorLabel,
            );


            eliminatorGroup.appendChild(
                eliminatorSelect,
            );


            grid.appendChild(
                timeGroup,
            );


            grid.appendChild(
                eliminatorGroup,
            );


            row.appendChild(
                heading,
            );


            row.appendChild(
                grid,
            );


            crResultsSpecialtyContent.appendChild(
                row,
            );


            [

                timeInput,

                eliminatorSelect,

            ].forEach(

                (field) => {

                    field.addEventListener(

                        "input",

                        crResultsReviewResult,

                    );


                    field.addEventListener(

                        "change",

                        crResultsReviewResult,

                    );

                },

            );

        },

    );
}


// =================================
// HEX-CELL ELIMINATOR RESULTS
// =================================


function crResultsBuildHexCellResult() {
    if (
        crResultsSelectedMatch
            ?.stipulation !==
        "Hex-Cell Eliminator"
    ) {
        return null;
    }


    const rows = [

        ...crResultsSpecialtyContent.querySelectorAll(

            "[data-cr-results-hex-elimination]",

        ),

    ];


    return {

        eliminations:

            rows.map(

                (row, index) => ({

                    slot:
                        index + 1,


                    eliminatedWrestlerId:

                        row.querySelector(

                            "[data-cr-results-hex-eliminated]",

                        )
                            ?.value || "",


                    eliminatedBy:

                        row.querySelector(

                            "[data-cr-results-hex-eliminator]",

                        )
                            ?.value || "",


                    method:

                        row.querySelector(

                            "[data-cr-results-hex-method]",

                        )
                            ?.value || "",

                }),

            ),

    };
}


function crResultsRenderHexCellFields(
    match,
) {
    const participantIds =
        crResultsGetMatchParticipantIds(
            match,
        );


    crResultsSpecialtyContent.innerHTML =
        "";


    const intro =
        document.createElement(
            "div",
        );


    intro.className =
        "cr-editor-section-heading";


    intro.innerHTML = `
        <span>
            HEX-CELL ELIMINATIONS
        </span>

        <h3>
            Who Eliminated Who
        </h3>
    `;


    crResultsSpecialtyContent.appendChild(
        intro,
    );


    for (

        let eliminationNumber = 1;

        eliminationNumber <= 5;

        eliminationNumber += 1

    ) {
        const row =
            document.createElement(
                "div",
            );


        row.className =
            "cr-editor-section";


        row.dataset.crResultsHexElimination =
            String(
                eliminationNumber,
            );


        const heading =
            document.createElement(
                "div",
            );


        heading.className =
            "cr-editor-section-heading";


        heading.innerHTML = `
            <span>
                ELIMINATION
            </span>

            <h3>
                #${eliminationNumber}
            </h3>
        `;


        const grid =
            document.createElement(
                "div",
            );


        grid.className =
            "cr-editor-form-grid";


        const eliminatedGroup =
            document.createElement(
                "div",
            );


        eliminatedGroup.className =
            "cr-form-group";


        const eliminatedLabel =
            document.createElement(
                "label",
            );


        eliminatedLabel.textContent =
            "ELIMINATED WRESTLER";


        const eliminatedSelect =
            document.createElement(
                "select",
            );


        eliminatedSelect.dataset.crResultsHexEliminated =
            "true";


        crResultsPopulateParticipantSelect(

            eliminatedSelect,

            participantIds,

            "Select Wrestler",

        );


        eliminatedGroup.appendChild(
            eliminatedLabel,
        );


        eliminatedGroup.appendChild(
            eliminatedSelect,
        );


        const eliminatorGroup =
            document.createElement(
                "div",
            );


        eliminatorGroup.className =
            "cr-form-group";


        const eliminatorLabel =
            document.createElement(
                "label",
            );


        eliminatorLabel.textContent =
            "ELIMINATED BY";


        const eliminatorSelect =
            document.createElement(
                "select",
            );


        eliminatorSelect.dataset.crResultsHexEliminator =
            "true";


        crResultsPopulateParticipantSelect(

            eliminatorSelect,

            participantIds,

            "Select Wrestler",

        );


        eliminatorGroup.appendChild(
            eliminatorLabel,
        );


        eliminatorGroup.appendChild(
            eliminatorSelect,
        );


        const methodGroup =
            document.createElement(
                "div",
            );


        methodGroup.className =
            "cr-form-group";


        const methodLabel =
            document.createElement(
                "label",
            );


        methodLabel.textContent =
            "ELIMINATION METHOD";


        const methodSelect =
            crResultsCreateMethodSelect();


        methodSelect.dataset.crResultsHexMethod =
            "true";


        methodGroup.appendChild(
            methodLabel,
        );


        methodGroup.appendChild(
            methodSelect,
        );


        grid.appendChild(
            eliminatedGroup,
        );


        grid.appendChild(
            eliminatorGroup,
        );


        grid.appendChild(
            methodGroup,
        );


        row.appendChild(
            heading,
        );


        row.appendChild(
            grid,
        );


        crResultsSpecialtyContent.appendChild(
            row,
        );


        [

            eliminatedSelect,

            eliminatorSelect,

            methodSelect,

        ].forEach(

            (field) => {

                field.addEventListener(

                    "change",

                    crResultsReviewResult,

                );

            },

        );
    }
}


// =================================
// FATE'S WHEEL RESULTS
// =================================


function crResultsGetFatesWheelOutcomeLabel(
    outcome,
) {
    if (
        outcome ===
        CR_RESULTS_FATES_WHEEL_OUTCOMES.MAIN_TITLE
    ) {
        return "Main Title Shot";
    }


    if (
        outcome ===
        CR_RESULTS_FATES_WHEEL_OUTCOMES.MIDCARD_TITLE
    ) {
        return "Midcard Title Shot";
    }


    if (
        outcome ===
        CR_RESULTS_FATES_WHEEL_OUTCOMES.REMORSE
    ) {
        return "Remorse Case";
    }


    return "—";
}


function crResultsBuildFatesWheelResult() {
    if (
        crResultsSelectedMatch
            ?.stipulation !==
        "Fate's Wheel"
    ) {
        return null;
    }


    const rows = [

        ...crResultsSpecialtyContent.querySelectorAll(

            "[data-cr-results-fates-finalist]",

        ),

    ];


    return {

        finalists:

            rows.map(

                (row, index) => ({

                    slot:
                        index + 1,


                    wrestlerId:

                        row.querySelector(

                            "[data-cr-results-fates-wrestler]",

                        )
                            ?.value || "",


                    outcome:

                        row.querySelector(

                            "[data-cr-results-fates-outcome]",

                        )
                            ?.value || "",

                }),

            ),

    };
}


function crResultsRenderFatesWheelFields(
    match,
) {
    const participantIds =
        crResultsGetMatchParticipantIds(
            match,
        );


    crResultsSpecialtyContent.innerHTML =
        "";


    const intro =
        document.createElement(
            "div",
        );


    intro.className =
        "cr-editor-section-heading";


    intro.innerHTML = `
        <span>
            FATE'S WHEEL
        </span>

        <h3>
            Top 5 Briefcase Assignments
        </h3>
    `;


    crResultsSpecialtyContent.appendChild(
        intro,
    );


    for (

        let finalistNumber = 1;

        finalistNumber <= 5;

        finalistNumber += 1

    ) {
        const row =
            document.createElement(
                "div",
            );


        row.className =
            "cr-editor-section";


        row.dataset.crResultsFatesFinalist =
            String(
                finalistNumber,
            );


        const heading =
            document.createElement(
                "div",
            );


        heading.className =
            "cr-editor-section-heading";


        heading.innerHTML = `
            <span>
                TOP 5 FINALIST
            </span>

            <h3>
                Finalist ${finalistNumber}
            </h3>
        `;


        const grid =
            document.createElement(
                "div",
            );


        grid.className =
            "cr-editor-form-grid";


        const wrestlerGroup =
            document.createElement(
                "div",
            );


        wrestlerGroup.className =
            "cr-form-group";


        const wrestlerLabel =
            document.createElement(
                "label",
            );


        wrestlerLabel.textContent =
            "WRESTLER";


        const wrestlerSelect =
            document.createElement(
                "select",
            );


        wrestlerSelect.dataset.crResultsFatesWrestler =
            "true";


        crResultsPopulateParticipantSelect(

            wrestlerSelect,

            participantIds,

            "Select Wrestler",

        );


        wrestlerGroup.appendChild(
            wrestlerLabel,
        );


        wrestlerGroup.appendChild(
            wrestlerSelect,
        );


        const outcomeGroup =
            document.createElement(
                "div",
            );


        outcomeGroup.className =
            "cr-form-group";


        const outcomeLabel =
            document.createElement(
                "label",
            );


        outcomeLabel.textContent =
            "BRIEFCASE OUTCOME";


        const outcomeSelect =
            document.createElement(
                "select",
            );


        outcomeSelect.dataset.crResultsFatesOutcome =
            "true";


        outcomeSelect.innerHTML = `
            <option value="">
                Select Outcome
            </option>

            <option value="${CR_RESULTS_FATES_WHEEL_OUTCOMES.MAIN_TITLE}">
                Main Title Shot
            </option>

            <option value="${CR_RESULTS_FATES_WHEEL_OUTCOMES.MIDCARD_TITLE}">
                Midcard Title Shot
            </option>

            <option value="${CR_RESULTS_FATES_WHEEL_OUTCOMES.REMORSE}">
                Remorse Case
            </option>
        `;


        outcomeGroup.appendChild(
            outcomeLabel,
        );


        outcomeGroup.appendChild(
            outcomeSelect,
        );


        grid.appendChild(
            wrestlerGroup,
        );


        grid.appendChild(
            outcomeGroup,
        );


        row.appendChild(
            heading,
        );


        row.appendChild(
            grid,
        );


        crResultsSpecialtyContent.appendChild(
            row,
        );


        [

            wrestlerSelect,

            outcomeSelect,

        ].forEach(

            (field) => {

                field.addEventListener(

                    "change",

                    crResultsReviewResult,

                );

            },

        );
    }
}


// =================================
// LOVE AND WAR RESULTS
// =================================


function crResultsBuildLoveAndWarResult() {
    if (
        crResultsSelectedMatch
            ?.stipulation !==
        "Love and War"
    ) {
        return null;
    }


    const winningSideIndex =

        crResultsWinnerSide.value === ""

            ? null

            : Number(
                crResultsWinnerSide.value,
            );


    if (
        !Number.isInteger(
            winningSideIndex,
        )
    ) {
        return {

            winningSideIndex:
                null,

            losingSideIndex:
                null,

        };
    }


    return {

        winningSideIndex:
            winningSideIndex,


        losingSideIndex:

            winningSideIndex === 0

                ? 1

                : 0,

    };
}

// =================================
// 2 OUT OF 3 FALLS RESULTS
// =================================


function crResultsGetTwoOutOfThreeRows() {
    return [

        ...crResultsSpecialtyContent.querySelectorAll(

            "[data-cr-results-fall]",

        ),

    ];
}


function crResultsBuildTwoOutOfThreeResult() {
    if (
        crResultsSelectedMatch
            ?.stipulation !==
        "2 Out Of 3 Falls Match"
    ) {
        return null;
    }


    const rows =
        crResultsGetTwoOutOfThreeRows();


    const falls = [];


    rows.forEach(

        (row) => {

            if (
                row.hidden
            ) {
                return;
            }


            falls.push({

                fallNumber:

                    Number(
                        row.dataset.crResultsFall,
                    ),


                winningSideIndex:

                    row.querySelector(

                        "[data-cr-results-fall-side]",

                    )?.value === ""

                        ? null

                        : Number(

                            row.querySelector(

                                "[data-cr-results-fall-side]",

                            )?.value,

                        ),


                winningWrestlerId:

                    row.querySelector(

                        "[data-cr-results-fall-winner]",

                    )?.value || "",


                losingWrestlerId:

                    row.querySelector(

                        "[data-cr-results-fall-loser]",

                    )?.value || "",


                method:

                    row.querySelector(

                        "[data-cr-results-fall-method]",

                    )?.value || "",

            });

        },

    );


    return {

        falls:
            falls,

    };
}


function crResultsRefreshTwoOutOfThreeLayout() {
    const rows =
        crResultsGetTwoOutOfThreeRows();


    const fallOneSide =
        rows[0]?.querySelector(

            "[data-cr-results-fall-side]",

        )?.value || "";


    const fallTwoSide =
        rows[1]?.querySelector(

            "[data-cr-results-fall-side]",

        )?.value || "";


    const thirdFallRow =
        rows.find(

            (row) =>
                Number(
                    row.dataset.crResultsFall,
                ) === 3,

        );


    const needsThirdFall =

        fallOneSide !== ""

        &&

        fallTwoSide !== ""

        &&

        fallOneSide !==
        fallTwoSide;


    if (
        thirdFallRow
    ) {
        thirdFallRow.hidden =
            !needsThirdFall;


        thirdFallRow.style.display =

            needsThirdFall

                ? ""

                : "none";


        if (
            !needsThirdFall
        ) {
            thirdFallRow

                .querySelectorAll(
                    "select",
                )

                .forEach(

                    (selectElement) => {

                        selectElement.value =
                            "";

                    },

                );
        }
    }


    crResultsReviewResult();
}


function crResultsRenderTwoOutOfThreeFields(
    match,
) {
    const participantIds =
        crResultsGetMatchParticipantIds(
            match,
        );


    const sides =
        Array.isArray(
            match.sides,
        )

            ? match.sides

            : [];


    crResultsSpecialtyContent.innerHTML =
        "";


    const intro =
        document.createElement(
            "div",
        );


    intro.className =
        "cr-editor-section-heading";


    intro.innerHTML = `
        <span>
            2 OUT OF 3 FALLS
        </span>

        <h3>
            Fall Results
        </h3>
    `;


    crResultsSpecialtyContent.appendChild(
        intro,
    );


    for (

        let fallNumber = 1;

        fallNumber <= 3;

        fallNumber += 1

    ) {
        const row =
            document.createElement(
                "div",
            );


        row.className =
            "cr-editor-section";


        row.dataset.crResultsFall =
            String(
                fallNumber,
            );


        if (
            fallNumber === 3
        ) {
            row.hidden =
                true;


            row.style.display =
                "none";
        }


        const heading =
            document.createElement(
                "div",
            );


        heading.className =
            "cr-editor-section-heading";


        heading.innerHTML = `
            <span>
                FALL
            </span>

            <h3>
                Fall ${fallNumber}
            </h3>
        `;


        const grid =
            document.createElement(
                "div",
            );


        grid.className =
            "cr-editor-form-grid";


        const sideGroup =
            document.createElement(
                "div",
            );


        sideGroup.className =
            "cr-form-group";


        const sideLabel =
            document.createElement(
                "label",
            );


        sideLabel.textContent =
            "WINNING SIDE";


        const sideSelect =
            document.createElement(
                "select",
            );


        sideSelect.dataset.crResultsFallSide =
            "true";


        sideSelect.innerHTML = `
            <option value="">
                Select Winning Side
            </option>
        `;


        sides.forEach(

            (side, index) => {

                const option =
                    document.createElement(
                        "option",
                    );


                option.value =
                    String(
                        index,
                    );


                option.textContent =

                    `Side ${index + 1} — ${crResultsFormatSide(
                        side,
                    )}`;


                sideSelect.appendChild(
                    option,
                );

            },

        );


        sideGroup.appendChild(
            sideLabel,
        );


        sideGroup.appendChild(
            sideSelect,
        );


        const winnerGroup =
            document.createElement(
                "div",
            );


        winnerGroup.className =
            "cr-form-group";


        const winnerLabel =
            document.createElement(
                "label",
            );


        winnerLabel.textContent =
            "WINNING WRESTLER";


        const winnerSelect =
            document.createElement(
                "select",
            );


        winnerSelect.dataset.crResultsFallWinner =
            "true";


        crResultsPopulateParticipantSelect(

            winnerSelect,

            participantIds,

            "Select Wrestler",

        );


        winnerGroup.appendChild(
            winnerLabel,
        );


        winnerGroup.appendChild(
            winnerSelect,
        );


        const loserGroup =
            document.createElement(
                "div",
            );


        loserGroup.className =
            "cr-form-group";


        const loserLabel =
            document.createElement(
                "label",
            );


        loserLabel.textContent =
            "LOSING WRESTLER";


        const loserSelect =
            document.createElement(
                "select",
            );


        loserSelect.dataset.crResultsFallLoser =
            "true";


        crResultsPopulateParticipantSelect(

            loserSelect,

            participantIds,

            "Select Wrestler",

        );


        loserGroup.appendChild(
            loserLabel,
        );


        loserGroup.appendChild(
            loserSelect,
        );


        const methodGroup =
            document.createElement(
                "div",
            );


        methodGroup.className =
            "cr-form-group";


        const methodLabel =
            document.createElement(
                "label",
            );


        methodLabel.textContent =
            "METHOD";


        const methodSelect =
            crResultsCreateMethodSelect();


        methodSelect.dataset.crResultsFallMethod =
            "true";


        methodGroup.appendChild(
            methodLabel,
        );


        methodGroup.appendChild(
            methodSelect,
        );


        grid.appendChild(
            sideGroup,
        );


        grid.appendChild(
            winnerGroup,
        );


        grid.appendChild(
            loserGroup,
        );


        grid.appendChild(
            methodGroup,
        );


        row.appendChild(
            heading,
        );


        row.appendChild(
            grid,
        );


        crResultsSpecialtyContent.appendChild(
            row,
        );


        sideSelect.addEventListener(

            "change",

            crResultsRefreshTwoOutOfThreeLayout,

        );


        [

            winnerSelect,

            loserSelect,

            methodSelect,

        ].forEach(

            (field) => {

                field.addEventListener(

                    "change",

                    crResultsReviewResult,

                );

            },

        );
    }
}
// =================================
// IRONMAN MATCH RESULTS
// =================================


function crResultsBuildIronmanResult() {
    if (
        crResultsSelectedMatch
            ?.stipulation !==
        "Ironman Match"
    ) {
        return null;
    }


    const scoreInputs = [

        ...crResultsSpecialtyContent.querySelectorAll(

            "[data-cr-results-ironman-score]",

        ),

    ];


    return {

        sideScores:

            scoreInputs.map(

                (input) =>

                    input.value === ""

                        ? null

                        : Number(
                            input.value,
                        ),

            ),

    };
}


function crResultsRenderIronmanFields(
    match,
) {
    const sides =
        Array.isArray(
            match.sides,
        )

            ? match.sides

            : [];


    crResultsSpecialtyContent.innerHTML =
        "";


    const intro =
        document.createElement(
            "div",
        );


    intro.className =
        "cr-editor-section-heading";


    intro.innerHTML = `
        <span>
            IRONMAN MATCH
        </span>

        <h3>
            Final Score
        </h3>
    `;


    crResultsSpecialtyContent.appendChild(
        intro,
    );


    const grid =
        document.createElement(
            "div",
        );


    grid.className =
        "cr-editor-form-grid";


    sides.forEach(

        (side, index) => {

            const group =
                document.createElement(
                    "div",
                );


            group.className =
                "cr-form-group";


            const label =
                document.createElement(
                    "label",
                );


            label.textContent =

                `SIDE ${index + 1} SCORE — ${crResultsFormatSide(
                    side,
                )}`;


            const input =
                document.createElement(
                    "input",
                );


            input.type =
                "number";


            input.min =
                "0";


            input.step =
                "1";


            input.dataset.crResultsIronmanScore =
                String(
                    index,
                );


            group.appendChild(
                label,
            );


            group.appendChild(
                input,
            );


            grid.appendChild(
                group,
            );


            input.addEventListener(

                "input",

                crResultsReviewResult,

            );

        },

    );


    crResultsSpecialtyContent.appendChild(
        grid,
    );
}

// =================================
// OVERTHROW RUMBLE RESULTS
// =================================


function crResultsGetOverthrowEntryRows() {
    return [

        ...crResultsSpecialtyContent.querySelectorAll(

            "[data-cr-results-overthrow-entry]",

        ),

    ];
}


function crResultsGetOverthrowEntrantIds() {
    return crResultsGetOverthrowEntryRows()

        .map(

            (row) =>

                row.querySelector(

                    "[data-cr-results-overthrow-wrestler]",

                )
                    ?.value || "",

        )

        .filter(
            Boolean,
        );
}


function crResultsPopulateOverthrowWrestlerSelect(

    selectElement,

    selectedValue = "",

) {
    selectElement.innerHTML = `
        <option value="">
            Select Wrestler
        </option>
    `;


    const wrestlers =
        [...owlControlRoomData.wrestlers]

            .sort(

                (a, b) =>

                    String(
                        a.name || "",
                    )
                        .localeCompare(

                            String(
                                b.name || "",
                            ),

                        ),

            );


    wrestlers.forEach(

        (wrestler) => {

            const option =
                document.createElement(
                    "option",
                );


            option.value =
                wrestler.id;


            option.textContent =
                wrestler.name;


            selectElement.appendChild(
                option,
            );

        },

    );


    if (
        selectedValue

        &&

        wrestlers.some(

            (wrestler) =>
                wrestler.id ===
                selectedValue,

        )
    ) {
        selectElement.value =
            selectedValue;
    }
}


function crResultsCalculateOverthrowStatistics(
    overthrowResult,
) {
    const entries =

        Array.isArray(
            overthrowResult?.entries,
        )

            ? overthrowResult.entries

            : [];


    const validEntries =

        entries.filter(

            (entry) =>
                entry.wrestlerId,

        );


    const eliminationCounts =
        new Map();


    validEntries.forEach(

        (entry) => {

            eliminationCounts.set(

                entry.wrestlerId,

                0,

            );

        },

    );


    validEntries.forEach(

        (entry) => {

            if (
                entry.eliminatedBy

                &&

                eliminationCounts.has(
                    entry.eliminatedBy,
                )
            ) {
                eliminationCounts.set(

                    entry.eliminatedBy,

                    eliminationCounts.get(
                        entry.eliminatedBy,
                    )

                    +

                    1,

                );
            }

        },

    );


    const highestEliminationCount =

        eliminationCounts.size > 0

            ? Math.max(

                ...eliminationCounts.values(),

            )

            : 0;


    const mostEliminations =

        highestEliminationCount > 0

            ? [...eliminationCounts.entries()]

                .filter(

                    ([, count]) =>

                        count ===
                        highestEliminationCount,

                )

                .map(

                    ([wrestlerId]) =>
                        wrestlerId,

                )

            : [];


    const timedEntries =

        validEntries

            .map(

                (entry) => ({

                    wrestlerId:
                        entry.wrestlerId,


                    timeInMatch:
                        entry.timeInMatch,


                    seconds:

                        crResultsTimeToSeconds(
                            entry.timeInMatch,
                        ),

                }),

            )

            .filter(

                (entry) =>
                    entry.seconds !== null,

            );


    const longestSeconds =

        timedEntries.length > 0

            ? Math.max(

                ...timedEntries.map(

                    (entry) =>
                        entry.seconds,

                ),

            )

            : null;


    const shortestSeconds =

        timedEntries.length > 0

            ? Math.min(

                ...timedEntries.map(

                    (entry) =>
                        entry.seconds,

                ),

            )

            : null;


    const longestEntries =

        longestSeconds === null

            ? []

            : timedEntries.filter(

                (entry) =>

                    entry.seconds ===
                    longestSeconds,

            );


    const shortestEntries =

        shortestSeconds === null

            ? []

            : timedEntries.filter(

                (entry) =>

                    entry.seconds ===
                    shortestSeconds,

            );


    return {

        mostEliminations: {

            wrestlerIds:
                mostEliminations,


            count:
                highestEliminationCount,

        },


        longestTime: {

            wrestlerIds:

                longestEntries.map(

                    (entry) =>
                        entry.wrestlerId,

                ),


            timeInMatch:

                longestEntries[0]
                    ?.timeInMatch

                || "",

        },


        shortestTime: {

            wrestlerIds:

                shortestEntries.map(

                    (entry) =>
                        entry.wrestlerId,

                ),


            timeInMatch:

                shortestEntries[0]
                    ?.timeInMatch

                || "",

        },

    };
}


function crResultsBuildOverthrowResult() {
    if (
        crResultsSelectedMatch
            ?.stipulation !==
        "Overthrow Rumble"
    ) {
        return null;
    }


    const entries =

        crResultsGetOverthrowEntryRows()

            .map(

                (row) => ({

                    entryNumber:

                        Number(

                            row.dataset
                                .crResultsOverthrowEntry,

                        ),


                    wrestlerId:

                        row.querySelector(

                            "[data-cr-results-overthrow-wrestler]",

                        )
                            ?.value || "",


                    timeInMatch:

                        row.querySelector(

                            "[data-cr-results-overthrow-time]",

                        )
                            ?.value
                            .trim()

                        || "",


                    eliminatedBy:

                        row.querySelector(

                            "[data-cr-results-overthrow-eliminator]",

                        )
                            ?.value

                        || null,

                }),

            );


    const finalFour =

        [4, 3, 2, 1]

            .map(

                (place) => {

                    const wrestlerSelect =

                        crResultsSpecialtyContent.querySelector(

                            `[data-cr-results-overthrow-final-place="${place}"]`,

                        );


                    const methodSelect =

                        crResultsSpecialtyContent.querySelector(

                            `[data-cr-results-overthrow-final-method="${place}"]`,

                        );


                    return {

                        place:
                            place,


                        wrestlerId:

                            wrestlerSelect
                                ?.value || "",


                        method:

                            place === 1

                                ? null

                                : methodSelect
                                    ?.value || "",

                    };

                },

            );


    const result = {

        entries:
            entries,


        finalFour:
            finalFour,


        winner:

            finalFour.find(

                (entry) =>
                    entry.place === 1,

            )
                ?.wrestlerId

            || "",

    };


    result.statistics =

        crResultsCalculateOverthrowStatistics(
            result,
        );


    return result;
}


function crResultsRefreshOverthrowChoices() {
    const entrantIds =
        crResultsGetOverthrowEntrantIds();


    crResultsGetOverthrowEntryRows()

        .forEach(

            (row) => {

                const wrestlerId =

                    row.querySelector(

                        "[data-cr-results-overthrow-wrestler]",

                    )
                        ?.value || "";


                const eliminatorSelect =

                    row.querySelector(

                        "[data-cr-results-overthrow-eliminator]",

                    );


                if (
                    !eliminatorSelect
                ) {
                    return;
                }


                const oldValue =
                    eliminatorSelect.value;


                crResultsPopulateParticipantSelect(

                    eliminatorSelect,


                    entrantIds.filter(

                        (otherId) =>

                            otherId !==
                            wrestlerId,

                    ),


                    "Not Eliminated / Winner",


                    oldValue,

                );

            },

        );


    [

        ...crResultsSpecialtyContent.querySelectorAll(

            "[data-cr-results-overthrow-final-place]",

        ),

    ].forEach(

        (selectElement) => {

            const oldValue =
                selectElement.value;


            crResultsPopulateParticipantSelect(

                selectElement,

                entrantIds,

                "Select Wrestler",

                oldValue,

            );

        },

    );


    crResultsReviewResult();
}


function crResultsRenderOverthrowFields() {
    crResultsSpecialtyContent.innerHTML =
        "";


    const entryHeading =
        document.createElement(
            "div",
        );


    entryHeading.className =
        "cr-editor-section-heading";


    entryHeading.innerHTML = `
        <span>
            OVERTHROW ENTRIES
        </span>

        <h3>
            Entry Order and Eliminations
        </h3>
    `;


    crResultsSpecialtyContent.appendChild(
        entryHeading,
    );


    for (

        let entryNumber = 1;

        entryNumber <= 30;

        entryNumber += 1

    ) {
        const row =
            document.createElement(
                "div",
            );


        row.className =
            "cr-editor-section";


        row.dataset.crResultsOverthrowEntry =
            String(
                entryNumber,
            );


        const heading =
            document.createElement(
                "div",
            );


        heading.className =
            "cr-editor-section-heading";


        heading.innerHTML = `
            <span>
                ENTRY NUMBER
            </span>

            <h3>
                #${entryNumber}
            </h3>
        `;


        const grid =
            document.createElement(
                "div",
            );


        grid.className =
            "cr-editor-form-grid";


        const wrestlerGroup =
            document.createElement(
                "div",
            );


        wrestlerGroup.className =
            "cr-form-group";


        const wrestlerLabel =
            document.createElement(
                "label",
            );


        wrestlerLabel.textContent =
            "WRESTLER";


        const wrestlerSelect =
            document.createElement(
                "select",
            );


        wrestlerSelect.dataset.crResultsOverthrowWrestler =
            "true";


        crResultsPopulateOverthrowWrestlerSelect(
            wrestlerSelect,
        );


        wrestlerGroup.appendChild(
            wrestlerLabel,
        );


        wrestlerGroup.appendChild(
            wrestlerSelect,
        );


        const timeGroup =
            document.createElement(
                "div",
            );


        timeGroup.className =
            "cr-form-group";


        const timeLabel =
            document.createElement(
                "label",
            );


        timeLabel.textContent =
            "TIME IN MATCH";


        const timeInput =
            document.createElement(
                "input",
            );


        timeInput.type =
            "text";


        timeInput.placeholder =
            "12:34";


        timeInput.autocomplete =
            "off";


        timeInput.dataset.crResultsOverthrowTime =
            "true";


        timeGroup.appendChild(
            timeLabel,
        );


        timeGroup.appendChild(
            timeInput,
        );


        const eliminatorGroup =
            document.createElement(
                "div",
            );


        eliminatorGroup.className =
            "cr-form-group";


        const eliminatorLabel =
            document.createElement(
                "label",
            );


        eliminatorLabel.textContent =
            "ELIMINATED BY";


        const eliminatorSelect =
            document.createElement(
                "select",
            );


        eliminatorSelect.dataset.crResultsOverthrowEliminator =
            "true";


        crResultsPopulateParticipantSelect(

            eliminatorSelect,

            [],

            "Not Eliminated / Winner",

        );


        eliminatorGroup.appendChild(
            eliminatorLabel,
        );


        eliminatorGroup.appendChild(
            eliminatorSelect,
        );


        grid.appendChild(
            wrestlerGroup,
        );


        grid.appendChild(
            timeGroup,
        );


        grid.appendChild(
            eliminatorGroup,
        );


        row.appendChild(
            heading,
        );


        row.appendChild(
            grid,
        );


        crResultsSpecialtyContent.appendChild(
            row,
        );


        wrestlerSelect.addEventListener(

            "change",

            crResultsRefreshOverthrowChoices,

        );


        timeInput.addEventListener(

            "input",

            crResultsReviewResult,

        );


        eliminatorSelect.addEventListener(

            "change",

            crResultsReviewResult,

        );
    }


    const finalFourSection =
        document.createElement(
            "div",
        );


    finalFourSection.className =
        "cr-editor-section";


    const finalFourHeading =
        document.createElement(
            "div",
        );


    finalFourHeading.className =
        "cr-editor-section-heading";


    finalFourHeading.innerHTML = `
        <span>
            FINAL FOUR
        </span>

        <h3>
            Final Finish Order
        </h3>
    `;


    finalFourSection.appendChild(
        finalFourHeading,
    );


    const finalFourGrid =
        document.createElement(
            "div",
        );


    finalFourGrid.className =
        "cr-editor-form-grid";


    const finalFourLabels = {

        4:
            "4TH PLACE",

        3:
            "3RD PLACE",

        2:
            "RUNNER-UP",

        1:
            "WINNER",

    };


    [4, 3, 2, 1].forEach(

        (place) => {

            const wrestlerGroup =
                document.createElement(
                    "div",
                );


            wrestlerGroup.className =
                "cr-form-group";


            const wrestlerLabel =
                document.createElement(
                    "label",
                );


            wrestlerLabel.textContent =
                finalFourLabels[
                    place
                ];


            const wrestlerSelect =
                document.createElement(
                    "select",
                );


            wrestlerSelect.dataset.crResultsOverthrowFinalPlace =
                String(
                    place,
                );


            crResultsPopulateParticipantSelect(

                wrestlerSelect,

                [],

                "Select Wrestler",

            );


            wrestlerGroup.appendChild(
                wrestlerLabel,
            );


            wrestlerGroup.appendChild(
                wrestlerSelect,
            );


            finalFourGrid.appendChild(
                wrestlerGroup,
            );


            wrestlerSelect.addEventListener(

                "change",

                crResultsReviewResult,

            );


            if (
                place !== 1
            ) {
                const methodGroup =
                    document.createElement(
                        "div",
                    );


                methodGroup.className =
                    "cr-form-group";


                const methodLabel =
                    document.createElement(
                        "label",
                    );


                methodLabel.textContent =

                    `${finalFourLabels[place]} ELIMINATION METHOD`;


                const methodSelect =

                    crResultsCreateMethodSelect(

                        [

                            "Pinfall",

                            "Submission",

                            "KO",

                        ],

                    );


                methodSelect.dataset.crResultsOverthrowFinalMethod =
                    String(
                        place,
                    );


                methodGroup.appendChild(
                    methodLabel,
                );


                methodGroup.appendChild(
                    methodSelect,
                );


                finalFourGrid.appendChild(
                    methodGroup,
                );


                methodSelect.addEventListener(

                    "change",

                    crResultsReviewResult,

                );
            }

        },

    );


    finalFourSection.appendChild(
        finalFourGrid,
    );


    crResultsSpecialtyContent.appendChild(
        finalFourSection,
    );
}


// =================================
// SPECIALTY FIELD ROUTING
// =================================


function crResultsRenderSpecialtyFields(
    match,
) {
    crResultsSpecialtyContent.innerHTML =
        "";


    if (
        match.stipulation ===
        "Battle Royal"
    ) {
        crResultsRenderBattleRoyalFields(
            match,
        );


        crResultsSpecialtyFields.hidden =
            false;


        return;
    }


    if (
        match.stipulation ===
        "Hex-Cell Eliminator"
    ) {
        crResultsRenderHexCellFields(
            match,
        );


        crResultsSpecialtyFields.hidden =
            false;


        return;
    }


    if (
        match.stipulation ===
        "Fate's Wheel"
    ) {
        crResultsRenderFatesWheelFields(
            match,
        );


        crResultsSpecialtyFields.hidden =
            false;


        return;
    }


       if (
        match.stipulation ===
        "2 Out Of 3 Falls Match"
    ) {
        crResultsRenderTwoOutOfThreeFields(
            match,
        );


        crResultsSpecialtyFields.hidden =
            false;


        return;
    }


    if (
        match.stipulation ===
        "Ironman Match"
    ) {
        crResultsRenderIronmanFields(
            match,
        );


        crResultsSpecialtyFields.hidden =
            false;


        return;
    }


    if (
        match.stipulation ===
        "Overthrow Rumble"
    ) {
        crResultsRenderOverthrowFields();


        crResultsSpecialtyFields.hidden =
            false;


        return;
    }


    crResultsSpecialtyFields.hidden =
        true;
}


// =================================
// FORM RECORD
// =================================


function crResultsGetFormRecord() {
    const match =
        crResultsSelectedMatch;


    const resultType =
        crResultsResultType.value;


    const isWin =
        resultType === "win";


    let specialtyResult =
        null;


    if (
        match?.stipulation ===
        "Battle Royal"
    ) {
        specialtyResult =
            crResultsBuildBattleRoyalResult();
    }


    else if (
        match?.stipulation ===
        "Hex-Cell Eliminator"
    ) {
        specialtyResult =
            crResultsBuildHexCellResult();
    }


    else if (
        match?.stipulation ===
        "Fate's Wheel"
    ) {
        specialtyResult =
            crResultsBuildFatesWheelResult();
    }


        else if (
        match?.stipulation ===
        "Love and War"
    ) {
        specialtyResult =
            crResultsBuildLoveAndWarResult();
    }


    else if (
        match?.stipulation ===
        "2 Out Of 3 Falls Match"
    ) {
        specialtyResult =
            crResultsBuildTwoOutOfThreeResult();
    }


    else if (
        match?.stipulation ===
        "Ironman Match"
    ) {
        specialtyResult =
            crResultsBuildIronmanResult();
    }


    else if (
        match?.stipulation ===
        "Overthrow Rumble"
    ) {
        specialtyResult =
            crResultsBuildOverthrowResult();
    }


    return {

        matchId:
            match?.id || "",


        eventId:
            match?.eventId || "",


        resultType:
            resultType,


        winningSideIndex:

            isWin

            &&

            crResultsWinnerSide.value !== ""

                ? Number(
                    crResultsWinnerSide.value,
                )

                : null,


        winningWrestlerId:

            isWin

                ? crResultsFinishWinner.value

                : "",


        losingWrestlerId:

            isWin

                ? crResultsFinishLoser.value

                : "",


        finishMethod:

            isWin

                ? crResultsMethod.value

                : "",


        rating:

            crResultsRating.value === ""

                ? null

                : Number(
                    crResultsRating.value,
                ),


        stars:

            crResultsStars.value === ""

                ? null

                : Number(
                    crResultsStars.value,
                ),


        matchTime:
            crResultsTime.value.trim(),


        specialtyResult:
            specialtyResult,

    };
}


// =================================
// HEX-CELL VALIDATION
// =================================


function crResultsValidateHexCell(
    record,
    errors,
) {
    if (
        crResultsSelectedMatch
            ?.stipulation !==
        "Hex-Cell Eliminator"

        ||

        record.resultType !==
        "win"
    ) {
        return;
    }


    const participantIds =
        crResultsGetMatchParticipantIds();


    const eliminations =

        Array.isArray(
            record.specialtyResult
                ?.eliminations,
        )

            ? record.specialtyResult
                .eliminations

            : [];


    if (
        eliminations.length !== 5
    ) {
        errors.push(

            "Hex-Cell Eliminator must contain exactly five elimination records.",

        );


        return;
    }


    const eliminatedIds =

        eliminations

            .map(

                (entry) =>
                    entry.eliminatedWrestlerId,

            )

            .filter(
                Boolean,
            );


    if (
        eliminatedIds.length !== 5
    ) {
        errors.push(

            "Complete all five Hex-Cell elimination records.",

        );
    }


    if (
        new Set(
            eliminatedIds,
        ).size !==
        eliminatedIds.length
    ) {
        errors.push(

            "A wrestler can only be eliminated once in the Hex-Cell Eliminator.",

        );
    }


    eliminations.forEach(

        (entry) => {

            if (
                entry.eliminatedWrestlerId

                &&

                !participantIds.includes(
                    entry.eliminatedWrestlerId,
                )
            ) {
                errors.push(

                    "Every eliminated wrestler must be a Hex-Cell participant.",

                );
            }


            if (
                !entry.eliminatedBy
            ) {
                errors.push(

                    "Every Hex-Cell elimination needs an eliminator.",

                );
            }


            if (
                entry.eliminatedBy

                &&

                !participantIds.includes(
                    entry.eliminatedBy,
                )
            ) {
                errors.push(

                    "Every Hex-Cell eliminator must be a match participant.",

                );
            }


            if (
                entry.eliminatedWrestlerId

                &&

                entry.eliminatedWrestlerId ===
                entry.eliminatedBy
            ) {
                errors.push(

                    "A wrestler cannot eliminate themselves.",

                );
            }


            if (
                !CR_RESULTS_ELIMINATION_METHODS.includes(
                    entry.method,
                )
            ) {
                errors.push(

                    "Every Hex-Cell elimination needs a valid method.",

                );
            }

        },

    );


    if (
        record.winningWrestlerId

        &&

        eliminatedIds.includes(
            record.winningWrestlerId,
        )
    ) {
        errors.push(

            "The Hex-Cell winner cannot also appear as an eliminated wrestler.",

        );
    }


    const expectedEliminatedIds =

        participantIds.filter(

            (wrestlerId) =>

                wrestlerId !==
                record.winningWrestlerId,

        );


    if (
        record.winningWrestlerId

        &&

        expectedEliminatedIds.some(

            (wrestlerId) =>

                !eliminatedIds.includes(
                    wrestlerId,
                ),

        )
    ) {
        errors.push(

            "All five non-winning Hex-Cell participants must be recorded as eliminated.",

        );
    }
}


// =================================
// FATE'S WHEEL VALIDATION
// =================================


function crResultsValidateFatesWheel(
    record,
    errors,
) {
    if (
        crResultsSelectedMatch
            ?.stipulation !==
        "Fate's Wheel"
    ) {
        return;
    }


    const participantIds =
        crResultsGetMatchParticipantIds();


    const finalists =

        Array.isArray(
            record.specialtyResult
                ?.finalists,
        )

            ? record.specialtyResult
                .finalists

            : [];


    if (
        finalists.length !== 5
    ) {
        errors.push(

            "Fate's Wheel must contain exactly five finalists.",

        );


        return;
    }


    const finalistIds =

        finalists

            .map(

                (entry) =>
                    entry.wrestlerId,

            )

            .filter(
                Boolean,
            );


    if (
        finalistIds.length !== 5
    ) {
        errors.push(

            "Select all five Fate's Wheel finalists.",

        );
    }


    if (
        new Set(
            finalistIds,
        ).size !==
        finalistIds.length
    ) {
        errors.push(

            "Each Fate's Wheel finalist must be a different wrestler.",

        );
    }


    finalistIds.forEach(

        (wrestlerId) => {

            if (
                !participantIds.includes(
                    wrestlerId,
                )
            ) {
                errors.push(

                    "Every Fate's Wheel finalist must be one of the eight match participants.",

                );
            }

        },

    );


    const outcomeCounts = {

        [CR_RESULTS_FATES_WHEEL_OUTCOMES.MAIN_TITLE]:
            0,


        [CR_RESULTS_FATES_WHEEL_OUTCOMES.MIDCARD_TITLE]:
            0,


        [CR_RESULTS_FATES_WHEEL_OUTCOMES.REMORSE]:
            0,

    };


    finalists.forEach(

        (entry) => {

            if (
                Object.prototype.hasOwnProperty.call(

                    outcomeCounts,

                    entry.outcome,

                )
            ) {
                outcomeCounts[
                    entry.outcome
                ] += 1;
            }


            else {
                errors.push(

                    "Every Fate's Wheel finalist needs a briefcase outcome.",

                );
            }

        },

    );


    if (
        outcomeCounts[
            CR_RESULTS_FATES_WHEEL_OUTCOMES.MAIN_TITLE
        ] !== 1
    ) {
        errors.push(

            "Fate's Wheel must award exactly one Main Title Shot.",

        );
    }


    if (
        outcomeCounts[
            CR_RESULTS_FATES_WHEEL_OUTCOMES.MIDCARD_TITLE
        ] !== 2
    ) {
        errors.push(

            "Fate's Wheel must award exactly two Midcard Title Shots.",

        );
    }


    if (
        outcomeCounts[
            CR_RESULTS_FATES_WHEEL_OUTCOMES.REMORSE
        ] !== 2
    ) {
        errors.push(

            "Fate's Wheel must assign exactly two Remorse Cases.",

        );
    }


    if (
        record.resultType ===
        "win"

        &&

        record.winningWrestlerId

        &&

        !finalistIds.includes(
            record.winningWrestlerId,
        )
    ) {
        errors.push(

            "The Fate's Wheel match winner must be one of the Top 5 finalists.",

        );
    }
}


// =================================
// LOVE AND WAR VALIDATION
// =================================


function crResultsValidateLoveAndWar(
    record,
    errors,
) {
    if (
        crResultsSelectedMatch
            ?.stipulation !==
        "Love and War"
    ) {
        return;
    }


    if (
        record.resultType !==
        "win"
    ) {
        errors.push(

            "Love and War must have a winning team.",

        );


        return;
    }


    if (
        !Number.isInteger(
            record.winningSideIndex,
        )
    ) {
        errors.push(

            "Select the winning Love and War team.",

        );


        return;
    }


    if (
        ![0, 1].includes(
            record.winningSideIndex,
        )
    ) {
        errors.push(

            "Love and War must have one winning team and one losing team.",

        );
    }
}

// =================================
// 2 OUT OF 3 FALLS VALIDATION
// =================================


function crResultsValidateTwoOutOfThree(
    record,
    errors,
) {
    if (
        crResultsSelectedMatch
            ?.stipulation !==
        "2 Out Of 3 Falls Match"
    ) {
        return;
    }


    if (
        record.resultType !==
        "win"
    ) {
        errors.push(

            "2 Out Of 3 Falls must have a winner.",

        );


        return;
    }


    const falls =

        Array.isArray(
            record.specialtyResult
                ?.falls,
        )

            ? record.specialtyResult.falls

            : [];


    if (
        falls.length < 2

        ||

        falls.length > 3
    ) {
        errors.push(

            "2 Out Of 3 Falls must contain two or three fall records.",

        );


        return;
    }


    const sides =

        Array.isArray(
            crResultsSelectedMatch.sides,
        )

            ? crResultsSelectedMatch.sides

            : [];


    const fallWins =
        new Map();


    sides.forEach(

        (side, index) => {

            fallWins.set(
                index,
                0,
            );

        },

    );


    falls.forEach(

        (fall) => {

            if (
                !Number.isInteger(
                    fall.winningSideIndex,
                )

                ||

                !fallWins.has(
                    fall.winningSideIndex,
                )
            ) {
                errors.push(

                    `Fall ${fall.fallNumber} needs a valid winning side.`,

                );


                return;
            }


            fallWins.set(

                fall.winningSideIndex,

                fallWins.get(
                    fall.winningSideIndex,
                )

                +

                1,

            );


            const winningSideWrestlers =

                sides[
                    fall.winningSideIndex
                ]?.wrestlers || [];


            if (
                !fall.winningWrestlerId

                ||

                !winningSideWrestlers.includes(
                    fall.winningWrestlerId,
                )
            ) {
                errors.push(

                    `Fall ${fall.fallNumber} winning wrestler must belong to the winning side.`,

                );
            }


            if (
                !fall.losingWrestlerId
            ) {
                errors.push(

                    `Fall ${fall.fallNumber} needs a losing wrestler.`,

                );
            }


            if (
                winningSideWrestlers.includes(
                    fall.losingWrestlerId,
                )
            ) {
                errors.push(

                    `Fall ${fall.fallNumber} losing wrestler cannot belong to the winning side.`,

                );
            }


            if (
                fall.winningWrestlerId ===
                fall.losingWrestlerId
            ) {
                errors.push(

                    `Fall ${fall.fallNumber} cannot use the same wrestler as winner and loser.`,

                );
            }


            if (
                !CR_RESULTS_ELIMINATION_METHODS.includes(
                    fall.method,
                )
            ) {
                errors.push(

                    `Fall ${fall.fallNumber} needs a valid method.`,

                );
            }

        },

    );


    const firstTwoSplit =

        falls.length >= 2

        &&

        falls[0].winningSideIndex !==
        falls[1].winningSideIndex;


    if (
        firstTwoSplit

        &&

        falls.length !== 3
    ) {
        errors.push(

            "Fall 3 is required when the first two falls are split 1–1.",

        );
    }


    if (
        !firstTwoSplit

        &&

        falls.length !== 2
    ) {
        errors.push(

            "Fall 3 should only be used when the first two falls are split.",

        );
    }


    const matchWinningSide =

        [...fallWins.entries()]

            .find(

                ([, count]) =>
                    count === 2,

            )?.[0];


    if (
        !Number.isInteger(
            matchWinningSide,
        )
    ) {
        errors.push(

            "One side must win exactly two falls.",

        );
    }


    if (
        Number.isInteger(
            matchWinningSide,
        )

        &&

        record.winningSideIndex !==
        matchWinningSide
    ) {
        errors.push(

            "Overall winning side must match the side that won two falls.",

        );
    }
}
// =================================
// IRONMAN MATCH VALIDATION
// =================================


function crResultsValidateIronman(
    record,
    errors,
) {
    if (
        crResultsSelectedMatch
            ?.stipulation !==
        "Ironman Match"
    ) {
        return;
    }


    if (
        record.resultType !==
        "win"
    ) {
        errors.push(

            "Ironman Match must have a winner.",

        );


        return;
    }


    const sideScores =

        Array.isArray(
            record.specialtyResult
                ?.sideScores,
        )

            ? record.specialtyResult.sideScores

            : [];


    if (
        sideScores.length !== 2
    ) {
        errors.push(

            "Ironman Match must contain exactly two final scores.",

        );


        return;
    }


    sideScores.forEach(

        (score, index) => {

            if (
                !Number.isInteger(
                    score,
                )

                ||

                score < 0
            ) {
                errors.push(

                    `Side ${index + 1} score must be a whole number of zero or greater.`,

                );
            }

        },

    );


    if (
        Number.isInteger(
            sideScores[0],
        )

        &&

        Number.isInteger(
            sideScores[1],
        )

        &&

        sideScores[0] ===
        sideScores[1]
    ) {
        errors.push(

            "Ironman Match final score cannot be tied.",

        );
    }


    if (
        Number.isInteger(
            sideScores[0],
        )

        &&

        Number.isInteger(
            sideScores[1],
        )

        &&

        sideScores[0] !==
        sideScores[1]
    ) {
        const winningSideIndex =

            sideScores[0] >
            sideScores[1]

                ? 0

                : 1;


        if (
            record.winningSideIndex !==
            winningSideIndex
        ) {
            errors.push(

                "Ironman Match winning side must match the higher final score.",

            );
        }
    }
}

// =================================
// MAIN VALIDATION
// =================================


function crResultsValidate(
    record,
) {
    const errors =
        [];


    if (
        !record.matchId
    ) {
        errors.push(

            "Select a match.",

        );


        return errors;
    }


    const stipulation =
        crResultsSelectedMatch
            ?.stipulation || "";


    const isOverthrowRumble =

        stipulation ===
        "Overthrow Rumble";


        const isLoveAndWar =

        stipulation ===
        "Love and War";


    const isIronmanMatch =

        stipulation ===
        "Ironman Match";


    if (
        record.resultType ===
        "win"

        &&

        !isOverthrowRumble
    ) {
        if (
            !Number.isInteger(
                record.winningSideIndex,
            )
        ) {
            errors.push(

                isLoveAndWar

                    ? "Select the winning team."

                    : "Select the winning side.",

            );
        }


        if (
            !isLoveAndWar
        ) {
            if (
                !record.winningWrestlerId
            ) {
                errors.push(

                    "Select the winning wrestler.",

                );
            }


            if (
                !record.losingWrestlerId
            ) {
                errors.push(

                    "Select the losing wrestler.",

                );
            }


                        if (
                !isIronmanMatch

                &&

                !record.finishMethod
            ) {
                errors.push(

                    "Select the finish method.",

                );
            }


            if (
                record.winningWrestlerId

                &&

                record.losingWrestlerId

                &&

                record.winningWrestlerId ===
                record.losingWrestlerId
            ) {
                errors.push(

                    "Winning and losing wrestler cannot be the same person.",

                );
            }


            const sides =

                Array.isArray(
                    crResultsSelectedMatch
                        ?.sides,
                )

                    ? crResultsSelectedMatch
                        .sides

                    : [];


            const winningSide =

                Number.isInteger(
                    record.winningSideIndex,
                )

                    ? sides[
                        record.winningSideIndex
                    ]

                    : null;


            const winningSideWrestlers =

                Array.isArray(
                    winningSide?.wrestlers,
                )

                    ? winningSide.wrestlers

                    : [];


            if (
                record.winningWrestlerId

                &&

                winningSide

                &&

                !winningSideWrestlers.includes(
                    record.winningWrestlerId,
                )
            ) {
                errors.push(

                    "Winning wrestler must belong to the winning side.",

                );
            }


            if (
                record.losingWrestlerId

                &&

                winningSide

                &&

                winningSideWrestlers.includes(
                    record.losingWrestlerId,
                )
            ) {
                errors.push(

                    "Losing wrestler cannot belong to the winning side.",

                );
            }
        }
    }


    if (
        record.rating === null

        ||

        !Number.isInteger(
            record.rating,
        )

        ||

        record.rating < 0

        ||

        record.rating > 100
    ) {
        errors.push(

            "Match % must be a whole number from 0 to 100.",

        );
    }


    if (
        record.stars === null

        ||

        Number.isNaN(
            record.stars,
        )

        ||

        record.stars < 0

        ||

        record.stars > 5

        ||

        Math.round(
            record.stars * 4,
        )
        !==
        record.stars * 4
    ) {
        errors.push(

            "Star Rating must be from 0 to 5 in 0.25 increments.",

        );
    }


    if (
        !/^(?:\d+):[0-5]\d$/.test(
            record.matchTime,
        )
    ) {
        errors.push(

            "Match Time must use minutes and seconds, such as 18:42.",

        );
    }


    if (
        stipulation ===
        "Battle Royal"

        &&

        record.resultType ===
        "win"
    ) {
        const participantResults =

            Array.isArray(
                record.specialtyResult
                    ?.participantResults,
            )

                ? record.specialtyResult
                    .participantResults

                : [];


        const participantIds =
            crResultsGetBattleRoyalParticipants();


        if (
            participantResults.length !==
            participantIds.length
        ) {
            errors.push(

                "Battle Royal participant results are incomplete.",

            );
        }


        participantResults.forEach(

            (participant) => {

                if (
                    !/^(?:\d+):[0-5]\d$/.test(
                        participant.timeInMatch,
                    )
                ) {
                    errors.push(

                        `${crResultsGetWrestlerName(
                            participant.wrestlerId,
                        )} needs a valid Time in Match.`,

                    );
                }


                const isWinner =

                    participant.wrestlerId ===
                    record.winningWrestlerId;


                if (
                    isWinner

                    &&

                    participant.eliminatedBy
                ) {
                    errors.push(

                        "The Battle Royal winner cannot have an eliminator.",

                    );
                }


                if (
                    !isWinner

                    &&

                    !participant.eliminatedBy
                ) {
                    errors.push(

                        `${crResultsGetWrestlerName(
                            participant.wrestlerId,
                        )} needs an eliminator.`,

                    );
                }


                if (
                    participant.eliminatedBy ===
                    participant.wrestlerId
                ) {
                    errors.push(

                        "A wrestler cannot eliminate themselves.",

                    );
                }

            },

        );
    }


    crResultsValidateHexCell(
        record,
        errors,
    );


    crResultsValidateFatesWheel(
        record,
        errors,
    );


        crResultsValidateLoveAndWar(
        record,
        errors,
    );


    crResultsValidateTwoOutOfThree(
        record,
        errors,
    );


    crResultsValidateIronman(
        record,
        errors,
    );


    if (
        isOverthrowRumble
    ) {
        if (
            record.resultType !==
            "win"
        ) {
            errors.push(

                "Overthrow Rumble must have a winner.",

            );
        }


        const overthrowResult =
            record.specialtyResult;


        const entries =

            Array.isArray(
                overthrowResult?.entries,
            )

                ? overthrowResult.entries

                : [];


        const finalFour =

            Array.isArray(
                overthrowResult?.finalFour,
            )

                ? overthrowResult.finalFour

                : [];


        if (
            entries.length !== 30
        ) {
            errors.push(

                "Overthrow Rumble must contain exactly 30 entries.",

            );
        }


        const entrantIds =

            entries

                .map(

                    (entry) =>
                        entry.wrestlerId,

                )

                .filter(
                    Boolean,
                );


        if (
            entrantIds.length !== 30
        ) {
            errors.push(

                "Select all 30 Overthrow Rumble entrants.",

            );
        }


        if (
            new Set(
                entrantIds,
            ).size !==
            entrantIds.length
        ) {
            errors.push(

                "The same wrestler cannot enter the Overthrow Rumble more than once.",

            );
        }


        const winnerId =
            overthrowResult?.winner || "";


        entries.forEach(

            (entry) => {

                if (
                    !/^(?:\d+):[0-5]\d$/.test(
                        entry.timeInMatch,
                    )
                ) {
                    errors.push(

                        `Entry #${entry.entryNumber} needs a valid Time in Match.`,

                    );
                }


                if (
                    entry.wrestlerId ===
                    winnerId

                    &&

                    entry.eliminatedBy
                ) {
                    errors.push(

                        "The Overthrow Rumble winner cannot have an eliminator.",

                    );
                }


                if (
                    entry.wrestlerId

                    &&

                    entry.wrestlerId !==
                    winnerId

                    &&

                    !entry.eliminatedBy
                ) {
                    errors.push(

                        `${crResultsGetWrestlerName(
                            entry.wrestlerId,
                        )} needs an eliminator.`,

                    );
                }


                if (
                    entry.eliminatedBy ===
                    entry.wrestlerId
                ) {
                    errors.push(

                        "A wrestler cannot eliminate themselves.",

                    );
                }

            },

        );


        const finalFourIds =

            finalFour

                .map(

                    (entry) =>
                        entry.wrestlerId,

                )

                .filter(
                    Boolean,
                );


        if (
            finalFourIds.length !== 4
        ) {
            errors.push(

                "Select all four Final Four finishers.",

            );
        }


        if (
            new Set(
                finalFourIds,
            ).size !==
            finalFourIds.length
        ) {
            errors.push(

                "Each Final Four position must contain a different wrestler.",

            );
        }


        finalFourIds.forEach(

            (wrestlerId) => {

                if (
                    !entrantIds.includes(
                        wrestlerId,
                    )
                ) {
                    errors.push(

                        "Every Final Four wrestler must be an Overthrow Rumble entrant.",

                    );
                }

            },

        );


        const validFinalMethods = [

            "Pinfall",

            "Submission",

            "KO",

        ];


        finalFour

            .filter(

                (entry) =>
                    entry.place !== 1,

            )

            .forEach(

                (entry) => {

                    if (
                        !validFinalMethods.includes(
                            entry.method,
                        )
                    ) {
                        errors.push(

                            `Final Four place ${entry.place} needs an elimination method.`,

                        );
                    }

                },

            );


        if (
            winnerId

            &&

            !entrantIds.includes(
                winnerId,
            )
        ) {
            errors.push(

                "The Overthrow Rumble winner must be one of the 30 entrants.",

            );
        }


        const finalPlaceByWrestler =

            new Map(

                finalFour

                    .filter(

                        (entry) =>
                            entry.wrestlerId,

                    )

                    .map(

                        (entry) => [

                            entry.wrestlerId,

                            entry.place,

                        ],

                    ),

            );


        finalFour

            .filter(

                (entry) =>

                    entry.place !== 1

                    &&

                    entry.wrestlerId,

            )

            .forEach(

                (finalEntry) => {

                    const participantEntry =

                        entries.find(

                            (entry) =>

                                entry.wrestlerId ===
                                finalEntry.wrestlerId,

                        );


                    const eliminatorPlace =

                        finalPlaceByWrestler.get(

                            participantEntry
                                ?.eliminatedBy,

                        );


                    if (
                        !eliminatorPlace

                        ||

                        eliminatorPlace >=
                        finalEntry.place
                    ) {
                        errors.push(

                            `${crResultsGetWrestlerName(
                                finalEntry.wrestlerId,
                            )} must be eliminated by a Final Four wrestler who finished higher.`,

                        );
                    }

                },

            );
    }


    return errors;
}


// =================================
// SPECIALTY REVIEW HELPERS
// =================================


function crResultsReviewHexCell(
    record,
) {
    const eliminations =

        Array.isArray(
            record.specialtyResult
                ?.eliminations,
        )

            ? record.specialtyResult
                .eliminations

            : [];


    eliminations.forEach(

        (entry, index) => {

            const eliminatedName =

                entry.eliminatedWrestlerId

                    ? crResultsGetWrestlerName(
                        entry.eliminatedWrestlerId,
                    )

                    : "—";


            const eliminatorName =

                entry.eliminatedBy

                    ? crResultsGetWrestlerName(
                        entry.eliminatedBy,
                    )

                    : "—";


            crResultsAddRow(

                crResultsReviewList,


                `Hex Elimination ${index + 1}`,


                `${eliminatedName} — eliminated by ${eliminatorName} — ${entry.method || "—"}`,

            );

        },

    );
}


function crResultsReviewFatesWheel(
    record,
) {
    const finalists =

        Array.isArray(
            record.specialtyResult
                ?.finalists,
        )

            ? record.specialtyResult
                .finalists

            : [];


    finalists.forEach(

        (entry, index) => {

            crResultsAddRow(

                crResultsReviewList,


                `Fate's Wheel Finalist ${index + 1}`,


                `${entry.wrestlerId

                    ? crResultsGetWrestlerName(
                        entry.wrestlerId,
                    )

                    : "—"} — ${crResultsGetFatesWheelOutcomeLabel(
                        entry.outcome,
                    )}`,

            );

        },

    );
}


function crResultsReviewLoveAndWar(
    record,
) {
    const winningSideIndex =
        record.specialtyResult
            ?.winningSideIndex;


    const losingSideIndex =
        record.specialtyResult
            ?.losingSideIndex;


    crResultsAddRow(

        crResultsReviewList,

        "Winning Team",

        Number.isInteger(
            winningSideIndex,
        )

            ? crResultsGetSideLabel(
                winningSideIndex,
            )

            : "—",

    );


    crResultsAddRow(

        crResultsReviewList,

        "Losing Team",

        Number.isInteger(
            losingSideIndex,
        )

            ? crResultsGetSideLabel(
                losingSideIndex,
            )

            : "—",

    );
}

function crResultsReviewTwoOutOfThree(
    record,
) {
    const falls =

        Array.isArray(
            record.specialtyResult
                ?.falls,
        )

            ? record.specialtyResult.falls

            : [];


    falls.forEach(

        (fall) => {

            crResultsAddRow(

                crResultsReviewList,


                `Fall ${fall.fallNumber}`,


                `${Number.isInteger(
                    fall.winningSideIndex,
                )

                    ? crResultsGetSideLabel(
                        fall.winningSideIndex,
                    )

                    : "—"} — ${fall.winningWrestlerId

                    ? crResultsGetWrestlerName(
                        fall.winningWrestlerId,
                    )

                    : "—"} over ${fall.losingWrestlerId

                    ? crResultsGetWrestlerName(
                        fall.losingWrestlerId,
                    )

                    : "—"} by ${fall.method || "—"}`,

            );

        },

    );
}


function crResultsReviewIronman(
    record,
) {
    const scores =

        Array.isArray(
            record.specialtyResult
                ?.sideScores,
        )

            ? record.specialtyResult.sideScores

            : [];


    crResultsAddRow(

        crResultsReviewList,

        "Final Score",

        scores.length === 2

            ? `${crResultsGetSideLabel(
                0,
            )} ${scores[0] ?? "—"} — ${scores[1] ?? "—"} ${crResultsGetSideLabel(
                1,
            )}`

            : "—",

    );
}

function crResultsReviewOverthrow(
    record,
) {
    const overthrowResult =
        record.specialtyResult;


    const finalFour =

        Array.isArray(
            overthrowResult?.finalFour,
        )

            ? overthrowResult.finalFour

            : [];


    const statistics =
        overthrowResult?.statistics;


    const winnerId =
        overthrowResult?.winner || "";


    const runnerUpId =

        finalFour.find(

            (entry) =>
                entry.place === 2,

        )
            ?.wrestlerId || "";


    const thirdId =

        finalFour.find(

            (entry) =>
                entry.place === 3,

        )
            ?.wrestlerId || "";


    const fourthId =

        finalFour.find(

            (entry) =>
                entry.place === 4,

        )
            ?.wrestlerId || "";


    crResultsAddRow(

        crResultsReviewList,

        "Winner",

        winnerId

            ? crResultsGetWrestlerName(
                winnerId,
            )

            : "—",

    );


    crResultsAddRow(

        crResultsReviewList,

        "Runner-Up",

        runnerUpId

            ? crResultsGetWrestlerName(
                runnerUpId,
            )

            : "—",

    );


    crResultsAddRow(

        crResultsReviewList,

        "3rd Place",

        thirdId

            ? crResultsGetWrestlerName(
                thirdId,
            )

            : "—",

    );


    crResultsAddRow(

        crResultsReviewList,

        "4th Place",

        fourthId

            ? crResultsGetWrestlerName(
                fourthId,
            )

            : "—",

    );


    const eliminationLeaders =

        statistics
            ?.mostEliminations
            ?.wrestlerIds || [];


    const eliminationCount =

        statistics
            ?.mostEliminations
            ?.count ?? 0;


    crResultsAddRow(

        crResultsReviewList,

        "Most Eliminations",

        eliminationLeaders.length > 0

            ? `${crResultsJoinWrestlerNames(
                eliminationLeaders,
            )} — ${eliminationCount}`

            : "—",

    );


    const ironLabel =

        crResultsSelectedMatch
            .specialty
            ?.division ===
        "Women"

            ? "Ironwoman"

            : "Ironman";


    const ironWrestlers =

        statistics
            ?.longestTime
            ?.wrestlerIds || [];


    const ironTime =

        statistics
            ?.longestTime
            ?.timeInMatch || "";


    crResultsAddRow(

        crResultsReviewList,

        ironLabel,

        ironWrestlers.length > 0

            ? `${crResultsJoinWrestlerNames(
                ironWrestlers,
            )} — ${ironTime}`

            : "—",

    );


    const shortestWrestlers =

        statistics
            ?.shortestTime
            ?.wrestlerIds || [];


    const shortestTime =

        statistics
            ?.shortestTime
            ?.timeInMatch || "";


    crResultsAddRow(

        crResultsReviewList,

        "Shortest Time",

        shortestWrestlers.length > 0

            ? `${crResultsJoinWrestlerNames(
                shortestWrestlers,
            )} — ${shortestTime}`

            : "—",

    );
}


// =================================
// REVIEW RESULT
// =================================


function crResultsReviewResult() {
    if (
        !crResultsSelectedMatch
    ) {
        crResultsReview.hidden =
            true;


        crResultsSave.disabled =
            true;


        return;
    }


    const record =
        crResultsGetFormRecord();


    const errors =
        crResultsValidate(
            record,
        );


    crResultsReviewList.innerHTML =
        "";


    crResultsError.hidden =
        true;


    crResultsReview.hidden =
        false;


    crResultsAddRow(

        crResultsReviewList,

        "Result Type",

        record.resultType ===
        "win"

            ? "Win"

            : record.resultType ===
              "draw"

                ? "Draw"

                : "No Contest",

    );


    const stipulation =
        crResultsSelectedMatch.stipulation;


    const isOverthrowRumble =

        stipulation ===
        "Overthrow Rumble";


    const isLoveAndWar =

        stipulation ===
        "Love and War";


    if (
        record.resultType ===
        "win"

        &&

        !isOverthrowRumble

        &&

        !isLoveAndWar
    ) {
        crResultsAddRow(

            crResultsReviewList,

            "Winning Side",

            Number.isInteger(
                record.winningSideIndex,
            )

                ? crResultsGetSideLabel(
                    record.winningSideIndex,
                )

                : "—",

        );


        crResultsAddRow(

            crResultsReviewList,

            "Winning Wrestler",

            record.winningWrestlerId

                ? crResultsGetWrestlerName(
                    record.winningWrestlerId,
                )

                : "—",

        );


        crResultsAddRow(

            crResultsReviewList,

            "Losing Wrestler",

            record.losingWrestlerId

                ? crResultsGetWrestlerName(
                    record.losingWrestlerId,
                )

                : "—",

        );


        crResultsAddRow(

            crResultsReviewList,

            "Finish Method",

            record.finishMethod || "—",

        );
    }


    if (
        stipulation ===
        "Hex-Cell Eliminator"
    ) {
        crResultsReviewHexCell(
            record,
        );
    }


    if (
        stipulation ===
        "Fate's Wheel"
    ) {
        crResultsReviewFatesWheel(
            record,
        );
    }


        if (
        stipulation ===
        "Love and War"
    ) {
        crResultsReviewLoveAndWar(
            record,
        );
    }


    if (
        stipulation ===
        "2 Out Of 3 Falls Match"
    ) {
        crResultsReviewTwoOutOfThree(
            record,
        );
    }


    if (
        stipulation ===
        "Ironman Match"
    ) {
        crResultsReviewIronman(
            record,
        );
    }


    if (
        isOverthrowRumble
    ) {
        crResultsReviewOverthrow(
            record,
        );
    }


    crResultsAddRow(

        crResultsReviewList,

        "Match %",

        record.rating === null

            ? "—"

            : `${record.rating}%`,

    );


    crResultsAddRow(

        crResultsReviewList,

        "Star Rating",

        record.stars === null

            ? "—"

            : String(
                record.stars,
            ),

    );


    crResultsAddRow(

        crResultsReviewList,

        "Match Time",

        record.matchTime || "—",

    );


    if (
        errors.length > 0
    ) {
        crResultsError.textContent =
            errors.join(
                " ",
            );


        crResultsError.hidden =
            false;
    }


    crResultsSave.disabled =
        errors.length > 0;


    crResultsSetStatus(

        errors.length > 0

            ? "CHECK RESULT"

            : "READY TO SAVE",

    );
}


// =================================
// SELECTED MATCH LOAD
// =================================


function crResultsLoadSelectedMatch() {
    const matchId =
        crResultsMatch.value;


    crResultsSelectedMatch =
        null;


    crResultsHideMessage();


    crResultsHideMatchFields();


    if (
        !matchId
    ) {
        crResultsSetStatus(
            "SELECT MATCH",
        );


        return;
    }


    const match =

        owlControlRoomData
            .announcedMatches

            .find(

                (item) =>
                    item.id ===
                    matchId,

            );


    if (
        !match
    ) {
        crResultsSetStatus(
            "MATCH NOT FOUND",
        );


        return;
    }


    crResultsSelectedMatch =
        match;


    crResultsMatchSummary.innerHTML =
        "";


    crResultsAddRow(

        crResultsMatchSummary,

        "Match",

        crResultsFormatMatch(
            match,
        ),

    );


    crResultsAddRow(

        crResultsMatchSummary,

        "Match Type",

        match.matchType || "—",

    );


    crResultsAddRow(

        crResultsMatchSummary,

        "Specialty Match",

        match.stipulation ||
        "Standard Match",

    );


    crResultsAddRow(

        crResultsMatchSummary,

        "Championship",

        crResultsGetChampionshipName(
            match.championshipId,
        ),

    );


    crResultsPopulateWinnerControls(
        match,
    );


    crResultsConfigureWinnerSideLabel(
        match,
    );


    crResultsResultType.value =
        "win";


        crResultsResultType.disabled =

        match.stipulation ===
        "Overthrow Rumble"

        ||

        match.stipulation ===
        "Love and War"

        ||

        match.stipulation ===
        "2 Out Of 3 Falls Match"

        ||

        match.stipulation ===
        "Ironman Match";


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


    crResultsMatchPreview.hidden =
        false;


    crResultsBasicFields.hidden =
        false;


    crResultsPerformanceFields.hidden =
        false;


    crResultsReview.hidden =
        false;


    crResultsRenderSpecialtyFields(
        match,
    );


    crResultsRefreshResultTypeLayout();
}


// =================================
// COMPLETED MATCH RECORD
// =================================


function crResultsBuildCompletedMatchRecord() {
    if (
        !crResultsSelectedMatch
    ) {
        throw new Error(

            "Select a match before saving a result.",

        );
    }


    const form =
        crResultsGetFormRecord();


    const record = {

        ...structuredClone(
            crResultsSelectedMatch,
        ),


        status:
            "completed",


        resultType:
            form.resultType,


        winnerSide:

            form.resultType ===
            "win"

            &&

            Number.isInteger(
                form.winningSideIndex,
            )

                ? form.winningSideIndex

                : null,


        rating:
            form.rating,


        starRating:
            form.stars,


        matchTime:
            form.matchTime,

    };


    const suppressStandardFinish =

        crResultsSelectedMatch.stipulation ===
        "Overthrow Rumble"

        ||

        crResultsSelectedMatch.stipulation ===
        "Love and War";


    if (
        form.resultType ===
        "win"

        &&

        !suppressStandardFinish
    ) {
        record.finish = {

            winner:
                form.winningWrestlerId,


            loser:
                form.losingWrestlerId,


                        method:

                crResultsSelectedMatch.stipulation ===
                "Ironman Match"

                    ? "Ironman Score"

                    : form.finishMethod,

        };
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
// FILE HELPERS
// =================================


async function crResultsEnsureWritePermission() {
    if (
        !owlRepositoryHandle
    ) {
        return false;
    }


    const options = {

        mode:
            "readwrite",

    };


    if (
        await owlRepositoryHandle.queryPermission(
            options,
        )

        === "granted"
    ) {
        return true;
    }


    return (

        await owlRepositoryHandle.requestPermission(
            options,
        )

    )
    ===
    "granted";
}


async function crResultsReadDataFile(
    filename,
) {
    const dataDirectory =

        await owlRepositoryHandle.getDirectoryHandle(
            "data",
        );


    const fileHandle =

        await dataDirectory.getFileHandle(
            filename,
        );


    const file =
        await fileHandle.getFile();


    return {

        fileHandle:
            fileHandle,


        text:
            await file.text(),

    };
}


async function crResultsWriteFile(

    fileHandle,

    text,

) {
    const writable =
        await fileHandle.createWritable();


    await writable.write(
        text,
    );


    await writable.close();
}


function crResultsFormatObject(
    record,
) {
    return JSON.stringify(

        record,

        null,

        2,

    )

        .split(
            "\n",
        )

        .map(

            (line) =>
                `  ${line}`,

        )

        .join(
            "\n",
        );
}


function crResultsAppendRecordText(

    text,

    record,

) {
    let existingRecords;


    try {
        existingRecords =
            JSON.parse(
                text,
            );
    }


    catch {
        throw new Error(

            "matches.json is not valid JSON.",

        );
    }


    if (
        !Array.isArray(
            existingRecords,
        )
    ) {
        throw new Error(

            "matches.json must contain a JSON array.",

        );
    }


    if (
        existingRecords.some(

            (match) =>
                match.id ===
                record.id,

        )
    ) {
        throw new Error(

            `A completed match with ID ${record.id} already exists.`,

        );
    }


    const closingIndex =
        text.lastIndexOf(
            "]",
        );


    if (
        closingIndex === -1
    ) {
        throw new Error(

            "Could not find the end of matches.json.",

        );
    }


    const before =
        text.slice(

            0,

            closingIndex,

        );


    const after =
        text.slice(
            closingIndex,
        );


    const trimmedBefore =
        before.trimEnd();


    const hasRecords =

        !trimmedBefore.endsWith(
            "[",
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
            record,
        )

        +

        "\n"

        +

        after

    );
}


function crResultsFindObjectBounds(

    text,

    recordId,

) {
    const escapedId =

        recordId.replace(

            /[.*+?^${}()|[\]\\]/g,

            "\\$&",

        );


    const pattern =

        new RegExp(

            `"id"\\s*:\\s*"${escapedId}"`,

        );


    const match =
        pattern.exec(
            text,
        );


    if (
        !match
    ) {
        throw new Error(

            `Could not find announced match ${recordId}.`,

        );
    }


    const start =

        text.lastIndexOf(

            "{",

            match.index,

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


        if (
            escaped
        ) {
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
            character === '"'
        ) {
            inString =
                !inString;


            continue;
        }


        if (
            inString
        ) {
            continue;
        }


        if (
            character === "{"
        ) {
            depth +=
                1;
        }


        if (
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

            `Could not locate announced match ${recordId}.`,

        );
    }


    return {

        start:
            start,


        end:
            end,

    };
}


function crResultsRemoveRecordText(

    text,

    recordId,

) {
    const bounds =

        crResultsFindObjectBounds(

            text,

            recordId,

        );


    let removeStart =
        bounds.start;


    let removeEnd =
        bounds.end + 1;


    const lineStart =

        text.lastIndexOf(

            "\n",

            removeStart - 1,

        );


    if (
        lineStart !== -1

        &&

        text

            .slice(

                lineStart + 1,

                removeStart,

            )

            .trim() === ""
    ) {
        removeStart =
            lineStart + 1;
    }


    let cursor =
        removeEnd;


    while (
        cursor < text.length

        &&

        /[ \t\r\n]/.test(
            text[cursor],
        )
    ) {
        cursor +=
            1;
    }


    if (
        text[cursor] ===
        ","
    ) {
        removeEnd =
            cursor + 1;


        if (
            text[removeEnd] ===
            "\r"
        ) {
            removeEnd +=
                1;
        }


        if (
            text[removeEnd] ===
            "\n"
        ) {
            removeEnd +=
                1;
        }
    }


    else {
        cursor =
            removeStart - 1;


        while (
            cursor >= 0

            &&

            /[ \t\r\n]/.test(
                text[cursor],
            )
        ) {
            cursor -=
                1;
        }


        if (
            text[cursor] ===
            ","
        ) {
            removeStart =
                cursor;
        }
    }


    return (

        text.slice(

            0,

            removeStart,

        )

        +

        text.slice(
            removeEnd,
        )

    );
}


// =================================
// SAVE RESULT
// =================================


async function crResultsSaveResult() {
    crResultsSave.disabled =
        true;


    crResultsSetStatus(
        "SAVING...",
    );


    crResultsHideMessage();


    try {
        const permission =

            await crResultsEnsureWritePermission();


        if (
            !permission
        ) {
            throw new Error(

                "Write permission was not granted.",

            );
        }


        const form =
            crResultsGetFormRecord();


        const errors =
            crResultsValidate(
                form,
            );


        if (
            errors.length > 0
        ) {
            throw new Error(

                errors.join(
                    " ",
                ),

            );
        }


        const completedRecord =

            crResultsBuildCompletedMatchRecord();


        const matchesFile =

            await crResultsReadDataFile(
                "matches.json",
            );


        const announcedFile =

            await crResultsReadDataFile(
                "announced-matches.json",
            );


        const updatedMatchesText =

            crResultsAppendRecordText(

                matchesFile.text,

                completedRecord,

            );


        const updatedAnnouncedText =

            crResultsRemoveRecordText(

                announcedFile.text,

                crResultsSelectedMatch.id,

            );


        await crResultsWriteFile(

            matchesFile.fileHandle,

            updatedMatchesText,

        );


        try {
            await crResultsWriteFile(

                announcedFile.fileHandle,

                updatedAnnouncedText,

            );
        }


        catch (
            error
        ) {
            await crResultsWriteFile(

                matchesFile.fileHandle,

                matchesFile.text,

            );


            throw error;
        }


        crResultsSelectedMatch =
            null;


        crResultsMatch.value =
            "";


        await loadRepositoryData(
            owlRepositoryHandle,
        );


        crResultsPopulateEvents();


        crResultsPopulateMatches();


        crResultsHideMatchFields();


        crResultsSetStatus(
            "SAVED",
        );


        crResultsShowMessage(

            "Match result was saved locally. Review matches.json and announced-matches.json in GitHub Desktop.",

            "save-success",

        );
    }


    catch (
        error
    ) {
        console.error(

            "Could not save match result:",

            error,

        );


        crResultsReviewResult();


        crResultsSetStatus(
            "SAVE FAILED",
        );


        crResultsShowMessage(

            error.message

            ||

            "The match result could not be saved.",

            "save-error",

        );
    }
}


// =================================
// EVENT HANDLERS
// =================================


function crResultsHandleEventChange() {
    crResultsSelectedMatch =
        null;


    crResultsHideMessage();


    crResultsPopulateMatches();


    crResultsHideMatchFields();


    crResultsSetStatus(

        crResultsEvent.value

            ? "SELECT MATCH"

            : "READY",

    );
}


function crResultsHandleMatchChange() {
    crResultsLoadSelectedMatch();
}


// =================================
// INPUT EVENTS
// =================================


crResultsEvent.addEventListener(

    "change",

    crResultsHandleEventChange,

);


crResultsMatch.addEventListener(

    "change",

    crResultsHandleMatchChange,

);


crResultsResultType.addEventListener(

    "change",

    crResultsRefreshResultTypeLayout,

);


[

    crResultsWinnerSide,

    crResultsFinishWinner,

    crResultsFinishLoser,

    crResultsMethod,

    crResultsRating,

    crResultsStars,

    crResultsTime,

].forEach(

    (field) => {

        field.addEventListener(

            "input",

            crResultsReviewResult,

        );


        field.addEventListener(

            "change",

            crResultsReviewResult,

        );

    },

);


crResultsSave.addEventListener(

    "click",

    crResultsSaveResult,

);


window.addEventListener(

    "owl-control-room-data-loaded",

    () => {

        crResultsPopulateEvents();


        crResultsPopulateMatches();

    },

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
            owlControlRoomData.events,
        )

        &&

        Array.isArray(
            owlControlRoomData.announcedMatches,
        )

        &&

        Array.isArray(
            owlControlRoomData.wrestlers,
        )

        &&

        Array.isArray(
            owlControlRoomData.championships,
        )
    ) {
        crResultsPopulateEvents();


        crResultsPopulateMatches();
    }
}


catch (
    error
) {
    console.warn(

        "Results Wizard waiting for repository data.",

        error,

    );
}
