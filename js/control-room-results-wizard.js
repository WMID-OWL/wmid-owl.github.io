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


// =================================
// BASIC RESULT FIELDS
// =================================


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
// STARTER STATE
// =================================


let crResultsSelectedMatch =
    null;


// =================================
// BASIC HELPERS
// =================================


function crResultsSetStatus(
    text,
) {
    crResultsStatus.textContent =
        text;
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
}

// =================================
// MATCH HELPERS
// =================================


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
    if (!championshipId) {
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
        .join(" & ");
}


function crResultsFormatMatch(
    match,
) {
    if (!match) {
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
        .filter(Boolean)
        .join(" vs. ");
}


function crResultsAddSummaryRow(
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


    crResultsMatchSummary.appendChild(
        row,
    );
}


function crResultsGetEventMatches() {
    const eventId =
        crResultsEvent.value;


    if (!eventId) {
        return [];
    }


    return owlControlRoomData.announcedMatches
        .filter(
            (match) =>
                match.eventId === eventId,
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
                `Match ${match.order} — ${crResultsFormatMatch(match)}`;


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
// RESULT CONTROL POPULATION
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
                String(index);


            option.textContent =
                `Side ${index + 1} — ${crResultsFormatSide(side)}`;


            crResultsWinnerSide.appendChild(
                option,
            );
        },
    );


    const wrestlerIds =
        [
            ...new Set(
                sides.flatMap(
                    (side) =>
                        Array.isArray(
                            side.wrestlers,
                        )
                            ? side.wrestlers
                            : [],
                ),
            ),
        ];


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


// =================================
// RESULT TYPE LAYOUT
// =================================


function crResultsRefreshResultTypeLayout() {
    const isWin =
        crResultsResultType.value ===
        "win";


    crResultsWinnerSideRow.hidden =
        !isWin;


    crResultsWinnerSideRow.style.display =
        isWin
            ? ""
            : "none";


    crResultsFinishWinnerRow.hidden =
        !isWin;


    crResultsFinishWinnerRow.style.display =
        isWin
            ? ""
            : "none";


    crResultsFinishLoserRow.hidden =
        !isWin;


    crResultsFinishLoserRow.style.display =
        isWin
            ? ""
            : "none";


    crResultsMethodRow.hidden =
        !isWin;


    crResultsMethodRow.style.display =
        isWin
            ? ""
            : "none";
}


// =================================
// SELECTED MATCH LOAD
// =================================


function crResultsLoadSelectedMatch() {
    const matchId =
        crResultsMatch.value;


    crResultsSelectedMatch =
        null;


    crResultsHideMatchFields();


    if (!matchId) {
        crResultsSetStatus(
            "SELECT MATCH",
        );

        return;
    }


    const match =
        owlControlRoomData.announcedMatches.find(
            (item) =>
                item.id === matchId,
        );


    if (!match) {
        crResultsSetStatus(
            "MATCH NOT FOUND",
        );

        return;
    }


    crResultsSelectedMatch =
        match;


    crResultsMatchSummary.innerHTML =
        "";


    crResultsAddSummaryRow(
        "Match",
        crResultsFormatMatch(
            match,
        ),
    );


    crResultsAddSummaryRow(
        "Match Type",
        match.matchType || "—",
    );


    crResultsAddSummaryRow(
        "Specialty Match",
        match.stipulation || "Standard Match",
    );


    crResultsAddSummaryRow(
        "Championship",
        crResultsGetChampionshipName(
            match.championshipId,
        ),
    );


    crResultsPopulateWinnerControls(
        match,
    );


    crResultsResultType.value =
        "win";


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


    crResultsSpecialtyFields.hidden =
        true;


    crResultsReview.hidden =
        true;


    crResultsSave.disabled =
        true;


    crResultsRefreshResultTypeLayout();


    crResultsSetStatus(
        "ENTER RESULT",
    );
}

// =================================
// EVENT CHANGE
// =================================


function crResultsHandleEventChange() {
    crResultsSelectedMatch =
        null;


    crResultsPopulateMatches();


    crResultsHideMatchFields();


    crResultsSetStatus(
        crResultsEvent.value
            ? "SELECT MATCH"
            : "READY",
    );
}

// =================================
// MATCH CHANGE
// =================================


function crResultsHandleMatchChange() {
    crResultsLoadSelectedMatch();
}


// =================================
// EVENTS
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

window.addEventListener(
    "owl-control-room-data-loaded",
    () => {
        crResultsPopulateEvents();
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
    ) {
        crResultsPopulateEvents();
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
