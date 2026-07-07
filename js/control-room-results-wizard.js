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
// EVENT CHANGE
// =================================


function crResultsHandleEventChange() {
    crResultsSelectedMatch =
        null;

    crResultsMatch.innerHTML = `
        <option value="">
            Select Match
        </option>
    `;

    crResultsMatch.disabled =
        !crResultsEvent.value;

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
    crResultsSelectedMatch =
        null;

    crResultsHideMatchFields();

    crResultsSetStatus(
        crResultsMatch.value
            ? "MATCH SELECTED"
            : "SELECT MATCH",
    );
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
