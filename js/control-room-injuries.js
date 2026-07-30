// =================================
// CONTROL ROOM INJURY TRACKER
// READ-ONLY FOUNDATION
// =================================


const injuryTrackerEls = {

    status:
        document.getElementById(
            "cr-injury-tracker-status"
        ),

    pendingCount:
        document.getElementById(
            "cr-injury-count-pending"
        ),

    injuredCount:
        document.getElementById(
            "cr-injury-count-injured"
        ),

    recoveringCount:
        document.getElementById(
            "cr-injury-count-recovering"
        ),

    clearedCount:
        document.getElementById(
            "cr-injury-count-cleared"
        ),

    pendingList:
        document.getElementById(
            "cr-injury-pending-list"
        ),

    activeList:
        document.getElementById(
            "cr-injury-active-list"
        ),

    clearedList:
        document.getElementById(
            "cr-injury-cleared-list"
        )

};


// =================================
// BASIC HELPERS
// =================================


function injuryArray(
    value
) {

    return Array.isArray(
        value
    )

        ? value

        : [];

}


function injuryText(
    value,
    fallback = "—"
) {

    const text =
        String(
            value ?? ""
        ).trim();


    return text ||
        fallback;

}


function injuryEscape(
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


function injuryNormalizeStatus(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toUpperCase();

}


function injuryFormatDateTime(
    value
) {

    if (
        !value
    ) {

        return "—";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return date.toLocaleString(
        "en-US",
        {
            year:
                "numeric",

            month:
                "short",

            day:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"
        }
    );

}


function injuryFormatPeriod(
    value
) {

    if (
        !value
    ) {

        return "—";

    }


    if (
        typeof value ===
        "string"
    ) {

        return value;

    }


    if (
        typeof value !==
        "object"
    ) {

        return String(
            value
        );

    }


    const year =
        value.year ||
        value.owlYear ||
        "";


    const month =
        value.month ||
        value.owlMonth ||
        "";


    const week =
        value.week ||
        value.owlWeek ||
        "";


    const parts =
        [];


    if (
        year
    ) {

        parts.push(
            String(
                year
            )
        );

    }


    if (
        month
    ) {

        parts.push(
            `Month ${month}`
        );

    }


    if (
        week
    ) {

        parts.push(
            `Week ${week}`
        );

    }


    return parts.join(
        " · "
    )

    ||

    "—";

}


function injurySetCount(
    element,
    value
) {

    if (
        element
    ) {

        element.textContent =
            Number(
                value || 0
            );

    }

}


// =================================
// DATABASE HELPERS
// =================================


function getInjuryGeneratorDatabase() {

    const database =
        owlControlRoomData
            ?.generatorHistory;


    if (
        !database
        ||
        Array.isArray(
            database
        )
        ||
        typeof database !==
            "object"
    ) {

        return {

            version:
                1,

            results:
                []

        };

    }


    return {

        ...database,

        results:
            injuryArray(
                database.results
            )

    };

}


function getInjuryDatabase() {

    const database =
        owlControlRoomData
            ?.injuries;


    if (
        !database
        ||
        Array.isArray(
            database
        )
        ||
        typeof database !==
            "object"
    ) {

        return {

            version:
                1,

            injuries:
                []

        };

    }


    return {

        ...database,

        injuries:
            injuryArray(
                database.injuries
            )

    };

}


function getWrestlerName(
    wrestlerId,
    savedName = ""
) {

    if (
        savedName
    ) {

        return savedName;

    }


    const wrestler =
        injuryArray(
            owlControlRoomData
                ?.wrestlers
        ).find(
            candidate =>
                candidate?.id ===
                wrestlerId
        );


    return wrestler?.name ||
        wrestlerId ||
        "Unknown Wrestler";

}


// =================================
// PENDING EVALUATIONS
// =================================


function getPendingInjuryEvaluations(
    injuries
) {

    const usedGeneratorIds =
        new Set(

            injuries

                .map(
                    injury =>
                        injury
                            ?.generatorResultId
                )

                .filter(
                    Boolean
                )

        );


    return getInjuryGeneratorDatabase()
        .results

        .filter(
            result => {

                const evaluation =
                    result
                        ?.injuryEvaluation;


                return Boolean(

                    result
                    &&
                    result.confirmed ===
                        true
                    &&
                    result.generatorKey ===
                        "injury-evaluation"
                    &&
                    evaluation
                    &&
                    Number(
                        evaluation.absenceWeeks ||
                        0
                    ) > 0
                    &&
                    !usedGeneratorIds.has(
                        result.id
                    )

                );

            }
        )

        .sort(
            (
                a,
                b
            ) =>
                String(
                    b.confirmedAt ||
                    b.generatedAt ||
                    ""
                ).localeCompare(
                    String(
                        a.confirmedAt ||
                        a.generatedAt ||
                        ""
                    )
                )
        );

}


// =================================
// EMPTY STATE
// =================================


function renderInjuryEmptyState(
    container,
    message
) {

    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    const empty =
        document.createElement(
            "p"
        );


    empty.className =
        "cr-injury-empty";


    empty.textContent =
        message;


    container.appendChild(
        empty
    );

}


// =================================
// PENDING EVALUATION CARDS
// =================================


function renderPendingInjuryEvaluations(
    evaluations
) {

    const container =
        injuryTrackerEls
            .pendingList;


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !evaluations.length
    ) {

        renderInjuryEmptyState(

            container,

            "No confirmed injury evaluations are waiting to enter the tracker."

        );


        return;

    }


    evaluations.forEach(
        result => {

            const evaluation =
                result.injuryEvaluation;


            const wrestlerName =
                getWrestlerName(

                    evaluation.wrestlerId,

                    evaluation.wrestlerName

                );


            const severeReviewRequired =
                evaluation
                    .severeReviewRequired ===
                    true;


            const card =
                document.createElement(
                    "article"
                );


            card.className =

                `cr-injury-card cr-injury-pending-card ${
                    severeReviewRequired

                        ? "requires-rule-review"

                        : ""
                }`;


            card.innerHTML = `

                <div class="cr-injury-card-heading">

                    <div>

                        <span>
                            CONFIRMED GENERATOR RESULT
                        </span>

                        <h4>
                            ${injuryEscape(
                                wrestlerName
                            )}
                        </h4>

                    </div>

                    <strong
                        class="cr-injury-status-badge ${
                            severeReviewRequired

                                ? "cr-injury-status-review"

                                : "cr-injury-status-pending"
                        }"
                    >

                        ${
                            severeReviewRequired

                                ? "RULE REVIEW REQUIRED"

                                : "READY FOR TRACKER"
                        }

                    </strong>

                </div>

                <div class="cr-injury-detail-grid">

                    <div>

                        <span>
                            PRIMARY ROLL
                        </span>

                        <strong>
                            ${injuryEscape(
                                evaluation.primaryRoll
                            )} / 10
                        </strong>

                    </div>

                    <div>

                        <span>
                            STANDARD OUTCOME
                        </span>

                        <strong>
                            ${injuryEscape(
                                evaluation.outcomeLabel
                            )}
                        </strong>

                    </div>

                    <div>

                        <span>
                            CRIT CAUSE
                        </span>

                        <strong>
                            ${injuryEscape(
                                evaluation.critCause
                            )}
                        </strong>

                    </div>

                    <div>

                        <span>
                            CONFIRMED
                        </span>

                        <strong>
                            ${injuryEscape(
                                injuryFormatDateTime(
                                    result.confirmedAt
                                )
                            )}
                        </strong>

                    </div>

                </div>

                ${
                    severeReviewRequired

                        ? `

                            <p class="cr-injury-review-note">

                                This roll requires the unfinished severe-injury
                                rules to be resolved before it can become an
                                official injury record.

                            </p>

                        `

                        : `

                            <p class="cr-injury-ready-note">

                                The future record-creation form will collect the
                                diagnosis, affected Fire Pro area, prior
                                endurance state, and OWL start week.

                            </p>

                        `
                }

            `;


            container.appendChild(
                card
            );

        }
    );

}


// =================================
// INJURY RECORD CARDS
// =================================


function getInjuryStatusClass(
    status
) {

    if (
        status ===
        "INJURED"
    ) {

        return "cr-injury-status-injured";

    }


    if (
        status ===
        "RECOVERING"
    ) {

        return "cr-injury-status-recovering";

    }


    if (
        status ===
        "CLEARED"
    ) {

        return "cr-injury-status-cleared";

    }


    return "cr-injury-status-pending";

}


function renderInjuryRecordCard(
    injury
) {

    const status =
        injuryNormalizeStatus(
            injury.status ||
            injury.currentStatus
        );


    const wrestlerName =
        getWrestlerName(

            injury.wrestlerId,

            injury.wrestlerName

        );


    const card =
        document.createElement(
            "article"
        );


        card.className =
        "cr-injury-card";


    card.dataset.injuryId =
        injury.id ||
        "";


    const expectedReturn =

        injury.expectedReturnWeek
        ||
        injury.expectedReturnPeriod
        ||
        injury.returnWeek;


    const expectedClearance =

        injury.expectedClearanceWeek
        ||
        injury.expectedClearancePeriod
        ||
        injury.clearanceWeek;


    card.innerHTML = `

        <div class="cr-injury-card-heading">

            <div>

                <span>
                    ${injuryEscape(
                        injury.diagnosis ||
                        "INJURY RECORD"
                    )}
                </span>

                <h4>
                    ${injuryEscape(
                        wrestlerName
                    )}
                </h4>

            </div>

            <strong
                class="cr-injury-status-badge ${getInjuryStatusClass(
                    status
                )}"
            >

                ${injuryEscape(
                    status ||
                    "UNKNOWN"
                )}

            </strong>

        </div>

        <div class="cr-injury-detail-grid">

            <div>

                <span>
                    AFFECTED AREA
                </span>

                <strong>
                    ${injuryEscape(
                        injuryText(

                            injury.affectedBodyPart
                            ||
                            injury.fireProBodyPart
                            ||
                            injury.bodyArea

                        )
                    )}
                </strong>

            </div>

            <div>

                <span>
                    ABSENCE
                </span>

                <strong>
                    ${injuryEscape(
                        injuryText(
                            injury.absenceWeeks
                        )
                    )} week(s)
                </strong>

            </div>

            <div>

                <span>
                    EXPECTED RETURN
                </span>

                <strong>
                    ${injuryEscape(
                        injuryFormatPeriod(
                            expectedReturn
                        )
                    )}
                </strong>

            </div>

            <div>

                <span>
                    EXPECTED CLEARANCE
                </span>

                <strong>
                    ${injuryEscape(
                        injuryFormatPeriod(
                            expectedClearance
                        )
                    )}
                </strong>

            </div>

            <div>

                <span>
                    PRIOR ENDURANCE
                </span>

                <strong>
                    ${injuryEscape(
                        injuryText(
                            injury.priorEnduranceState
                        )
                    )}
                </strong>

            </div>

                        <div>

                <span>
                    CURRENT ENDURANCE
                </span>

                <strong>
                    ${injuryEscape(
                        injuryText(
                            injury.currentEnduranceState
                        )
                    )}
                </strong>

            </div>

        </div>

        ${
            injury.id
            &&
            status ===
                "INJURED"

                ? `

                    <div class="cr-injury-action-bar">

                        <div>

                            <strong>
                                RETURN ACTION
                            </strong>

                            <p>

                                When the absence has been served, set
                                ${injuryEscape(
                                    injuryText(
                                        injury.affectedBodyPart
                                    )
                                )}
                                to Low endurance in Fire Pro.

                            </p>

                        </div>

                        <button
                            class="control-room-button control-room-button-primary"
                            type="button"
                            data-injury-action="return"
                            data-injury-id="${injuryEscape(
                                injury.id
                            )}"
                        >
                            Confirm Return
                        </button>

                    </div>

                `

                : ""
        }

        ${
            injury.id
            &&
            status ===
                "RECOVERING"

                ? `

                    <div class="cr-injury-action-bar">

                        <div>

                            <strong>
                                CLEARANCE ACTION
                            </strong>

                            <p>

                                When the recovery window ends, restore
                                ${injuryEscape(
                                    injuryText(
                                        injury.affectedBodyPart
                                    )
                                )}
                                to
                                ${injuryEscape(
                                    injuryText(
                                        injury.priorEnduranceState
                                    )
                                )}
                                endurance in Fire Pro.

                            </p>

                        </div>

                        <button
                            class="control-room-button control-room-button-primary"
                            type="button"
                            data-injury-action="clear"
                            data-injury-id="${injuryEscape(
                                injury.id
                            )}"
                        >
                            Confirm Full Clearance
                        </button>

                    </div>

                `

                : ""
        }

    `;


    return card;

}


function renderInjuryRecords(
    container,
    injuries,
    emptyMessage
) {

    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !injuries.length
    ) {

        renderInjuryEmptyState(
            container,
            emptyMessage
        );


        return;

    }


    injuries.forEach(
        injury => {

            container.appendChild(
                renderInjuryRecordCard(
                    injury
                )
            );

        }
    );

}


// =================================
// MAIN RENDER
// =================================


function renderInjuryTracker() {

    if (
        !injuryTrackerEls.status
    ) {

        return;

    }


    const database =
        getInjuryDatabase();


    const injuries =
        database.injuries;


    const pendingEvaluations =
        getPendingInjuryEvaluations(
            injuries
        );


    const injured =
        injuries.filter(
            injury =>
                injuryNormalizeStatus(

                    injury.status ||
                    injury.currentStatus

                ) ===
                "INJURED"
        );


    const recovering =
        injuries.filter(
            injury =>
                injuryNormalizeStatus(

                    injury.status ||
                    injury.currentStatus

                ) ===
                "RECOVERING"
        );


    const cleared =
        injuries.filter(
            injury =>
                injuryNormalizeStatus(

                    injury.status ||
                    injury.currentStatus

                ) ===
                "CLEARED"
        );


    injurySetCount(
        injuryTrackerEls.pendingCount,
        pendingEvaluations.length
    );


    injurySetCount(
        injuryTrackerEls.injuredCount,
        injured.length
    );


    injurySetCount(
        injuryTrackerEls.recoveringCount,
        recovering.length
    );


    injurySetCount(
        injuryTrackerEls.clearedCount,
        cleared.length
    );


    renderPendingInjuryEvaluations(
        pendingEvaluations
    );


    renderInjuryRecords(

        injuryTrackerEls.activeList,

        [
            ...injured,
            ...recovering
        ],

        "No wrestlers are currently injured or recovering."

    );


    renderInjuryRecords(

        injuryTrackerEls.clearedList,

        cleared,

        "No cleared injury records are stored yet."

    );


    injuryTrackerEls.status.textContent =
        "READY";

}


// =================================
// INITIALIZATION
// =================================


window.addEventListener(

    "owl-control-room-data-loaded",

    renderInjuryTracker

);

window.addEventListener(

    "owl-injuries-updated",

    renderInjuryTracker

);
