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


    crResultsReviewResult();
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


            crResultsRenderSpecialtyFields(
        match,
    );


    crResultsReview.hidden =
        false;


    crResultsSave.disabled =
        true;


    crResultsRefreshResultTypeLayout();
}
// =================================
// BATTLE ROYAL RESULT HELPERS
// =================================


function crResultsGetBattleRoyalParticipants() {
    if (
        !crResultsSelectedMatch
        ||
        !Array.isArray(
            crResultsSelectedMatch.sides,
        )
    ) {
        return [];
    }


    return crResultsSelectedMatch.sides
        .flatMap(
            (side) =>
                Array.isArray(
                    side.wrestlers,
                )
                    ? side.wrestlers
                    : [],
        )
        .filter(Boolean);
}


function crResultsBuildBattleRoyalResult() {
    if (
        crResultsSelectedMatch?.stipulation !==
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
                (row) => {
                    const wrestlerId =
                        row.dataset.crResultsBrParticipant;


                    const timeInput =
                        row.querySelector(
                            "[data-cr-results-br-time]",
                        );


                    const eliminatorSelect =
                        row.querySelector(
                            "[data-cr-results-br-eliminator]",
                        );


                    return {
                        wrestlerId:
                            wrestlerId,

                        timeInMatch:
                            timeInput?.value.trim() || "",

                        eliminatedBy:
                            eliminatorSelect?.value || null,
                    };
                },
            ),
    };
}


// =================================
// SPECIALTY RESULT RENDERING
// =================================


function crResultsRenderBattleRoyalFields(
    match,
) {
    const participantIds =
        Array.isArray(
            match.sides,
        )
            ? match.sides
                .flatMap(
                    (side) =>
                        Array.isArray(
                            side.wrestlers,
                        )
                            ? side.wrestlers
                            : [],
                )
                .filter(Boolean)
            : [];


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


            eliminatorSelect.innerHTML = `
                <option value="">
                    Not Eliminated / Winner
                </option>
            `;


            participantIds
                .filter(
                    (otherId) =>
                        otherId !== wrestlerId,
                )
                .forEach(
                    (otherId) => {
                        const option =
                            document.createElement(
                                "option",
                            );


                        option.value =
                            otherId;


                        option.textContent =
                            crResultsGetWrestlerName(
                                otherId,
                            );


                        eliminatorSelect.appendChild(
                            option,
                        );
                    },
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


    crResultsSpecialtyFields.hidden =
        true;
}

// =================================
// RESULT FORM RECORD
// =================================


function crResultsGetFormRecord() {
    const match =
        crResultsSelectedMatch;


    const resultType =
        crResultsResultType.value;


    const isWin =
        resultType === "win";


    return {
        matchId:
            match?.id || "",

        eventId:
            match?.eventId || "",

        resultType:
            resultType,

        winningSideIndex:

            isWin &&
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
            crResultsSelectedMatch?.stipulation ===
            "Battle Royal"

                ? crResultsBuildBattleRoyalResult()

                : null,
    };
}

// =================================
// RESULT VALIDATION
// =================================


function crResultsValidate(
    record,
) {
    const errors = [];


    if (!record.matchId) {
        errors.push(
            "Select a match.",
        );

        return errors;
    }


    if (
        record.resultType === "win"
    ) {
        if (
            !Number.isInteger(
                record.winningSideIndex,
            )
        ) {
            errors.push(
                "Select the winning side.",
            );
        }


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
                crResultsSelectedMatch?.sides,
            )
                ? crResultsSelectedMatch.sides
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
        ) !==
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
        crResultsSelectedMatch?.stipulation ===
        "Battle Royal"
        &&
        record.resultType === "win"
    ) {
        const participantResults =
            Array.isArray(
                record.specialtyResult?.participantResults,
            )
                ? record.specialtyResult.participantResults
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


    return errors;
}

// =================================
// REVIEW HELPERS
// =================================


function crResultsAddReviewRow(
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


    crResultsReviewList.appendChild(
        row,
    );
}


function crResultsGetSideLabel(
    sideIndex,
) {
    const side =
        crResultsSelectedMatch?.sides?.[
            sideIndex
        ];


    if (!side) {
        return "—";
    }


    return crResultsFormatSide(
        side,
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


    crResultsAddReviewRow(
        "Result Type",

        record.resultType === "win"

            ? "Win"

            : record.resultType === "draw"

                ? "Draw"

                : "No Contest",
    );


    if (
        record.resultType === "win"
    ) {
        crResultsAddReviewRow(
            "Winning Side",

            Number.isInteger(
                record.winningSideIndex,
            )

                ? crResultsGetSideLabel(
                    record.winningSideIndex,
                )

                : "—",
        );


        crResultsAddReviewRow(
            "Winning Wrestler",

            record.winningWrestlerId

                ? crResultsGetWrestlerName(
                    record.winningWrestlerId,
                )

                : "—",
        );


        crResultsAddReviewRow(
            "Losing Wrestler",

            record.losingWrestlerId

                ? crResultsGetWrestlerName(
                    record.losingWrestlerId,
                )

                : "—",
        );


        crResultsAddReviewRow(
            "Finish Method",

            record.finishMethod || "—",
        );
    }


    crResultsAddReviewRow(
        "Match %",

        record.rating === null

            ? "—"

            : `${record.rating}%`,
    );


    crResultsAddReviewRow(
        "Star Rating",

        record.stars === null

            ? "—"

            : String(
                record.stars,
            ),
    );


    crResultsAddReviewRow(
        "Match Time",

        record.matchTime || "—",
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

            ? "CHECK RESULT"

            : "READY TO SAVE",
    );
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

            form.resultType === "win"

                ? form.winningSideIndex

                : null,

        rating:
            form.rating,

        starRating:
            form.stars,

        matchTime:
            form.matchTime,
    };


        if (
        form.resultType === "win"
    ) {
        record.finish = {

            winner:
                form.winningWrestlerId,

            loser:
                form.losingWrestlerId,

            method:
                form.finishMethod,
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
// RESULT SAVE MESSAGES
// =================================


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


// =================================
// WRITE PERMISSION
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

        === "granted"
    );
}


// =================================
// DATA FILE ACCESS
// =================================


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


// =================================
// FORMAT RESULT RECORD
// =================================


function crResultsFormatObject(
    record,
) {
    return JSON.stringify(
        record,
        null,
        2,
    )

        .split("\n")

        .map(
            line =>
                `  ${line}`,
        )

        .join("\n");
}


// =================================
// APPEND COMPLETED MATCH
// =================================


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
            match =>
                match.id === record.id,
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


// =================================
// FIND ANNOUNCED MATCH
// =================================


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
            character === "\""
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

        start,
        end,
    };
}


// =================================
// REMOVE ANNOUNCED MATCH
// =================================


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
        text[cursor] === ","
    ) {
        removeEnd =
            cursor + 1;


        if (
            text[removeEnd] === "\r"
        ) {
            removeEnd +=
                1;
        }


        if (
            text[removeEnd] === "\n"
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
            text[cursor] === ","
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
// SAVE MATCH RESULT
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
                errors.join(" "),
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


        catch (error) {
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


    catch (error) {
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
window.addEventListener(
    "owl-control-room-data-loaded",
    () => {
        crResultsPopulateEvents();
    },
);

crResultsSave.addEventListener(
    "click",
    crResultsSaveResult,
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
