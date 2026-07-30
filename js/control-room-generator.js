// =================================
// CONTROL ROOM GENERATOR HUB
// CUSTOM DRAW + INJURY EVALUATION
// =================================


const generatorEls = {

    status:
        document.getElementById(
            "cr-generator-status"
        ),

    mode:
        document.getElementById(
            "cr-generator-mode"
        ),

    type:
        document.getElementById(
            "cr-generator-type"
        ),

    method:
        document.getElementById(
            "cr-generator-method"
        ),

    label:
        document.getElementById(
            "cr-generator-label"
        ),

    context:
        document.getElementById(
            "cr-generator-context"
        ),

    poolFields:
        document.getElementById(
            "cr-generator-pool-fields"
        ),

    countFields:
        document.getElementById(
            "cr-generator-count-fields"
        ),

    pool:
        document.getElementById(
            "cr-generator-pool"
        ),

    exclusions:
        document.getElementById(
            "cr-generator-exclusions"
        ),

    eligibleCount:
        document.getElementById(
            "cr-generator-eligible-count"
        ),

    excludedCount:
        document.getElementById(
            "cr-generator-excluded-count"
        ),

    injuryFields:
        document.getElementById(
            "cr-generator-injury-fields"
        ),

    injuryWrestler:
        document.getElementById(
            "cr-generator-injury-wrestler"
        ),

    injuryCritCause:
        document.getElementById(
            "cr-generator-injury-crit-cause"
        ),

    modeNote:
        document.getElementById(
            "cr-generator-mode-note"
        ),

    stage:
        document.getElementById(
            "cr-generator-stage"
        ),

    stageState:
        document.getElementById(
            "cr-generator-stage-state"
        ),

    stageResult:
        document.getElementById(
            "cr-generator-stage-result"
        ),

    stageList:
        document.getElementById(
            "cr-generator-stage-list"
        ),

    generate:
        document.getElementById(
            "cr-generator-generate"
        ),

    confirm:
        document.getElementById(
            "cr-generator-confirm"
        ),

    discard:
        document.getElementById(
            "cr-generator-discard"
        ),

    message:
        document.getElementById(
            "cr-generator-message"
        ),

    historyCount:
        document.getElementById(
            "cr-generator-history-count"
        ),

    history:
        document.getElementById(
            "cr-generator-history"
        )

};


let generatorCurrentResult =
    null;


let generatorIsRolling =
    false;


// =================================
// BASIC HELPERS
// =================================


function generatorArray(
    value
) {

    return Array.isArray(
        value
    )

        ? value

        : [];

}


function generatorCleanText(
    value
) {

    return String(
        value || ""
    ).trim();

}


function generatorEscape(
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


function generatorUniqueLines(
    value
) {

    const lines =

        String(
            value || ""
        )
            .split(
                /\r?\n/
            )
            .map(
                line =>
                    line.trim()
            )
            .filter(
                Boolean
            );


    const seen =
        new Set();


    return lines.filter(
        line => {

            const key =
                line.toLowerCase();


            if (
                seen.has(
                    key
                )
            ) {

                return false;

            }


            seen.add(
                key
            );


            return true;

        }
    );

}


function generatorRandomIndex(
    length
) {

    if (
        !Number.isInteger(
            length
        )
        ||
        length <= 0
    ) {

        throw new Error(
            "A positive pool length is required."
        );

    }


    const range =
        0x100000000;


    const limit =
        range - (
            range % length
        );


    const values =
        new Uint32Array(
            1
        );


    do {

        window.crypto.getRandomValues(
            values
        );

    } while (
        values[0] >= limit
    );


    return values[0] % length;

}


function generatorShuffle(
    entries
) {

    const shuffled =
        [
            ...entries
        ];


    for (
        let index = shuffled.length - 1;
        index > 0;
        index -= 1
    ) {

        const swapIndex =
            generatorRandomIndex(
                index + 1
            );


        [
            shuffled[index],
            shuffled[swapIndex]
        ] = [
            shuffled[swapIndex],
            shuffled[index]
        ];

    }


    return shuffled;

}


function generatorDelay(
    milliseconds
) {

    return new Promise(
        resolve =>
            window.setTimeout(
                resolve,
                milliseconds
            )
    );

}


function generatorFormatDateTime(
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

        return value;

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


function generatorCreateId() {

    const randomPart =
        window.crypto
            .getRandomValues(
                new Uint32Array(
                    1
                )
            )[0]
            .toString(
                36
            );


    return `generator-${Date.now()}-${randomPart}`;

}


function getGeneratorType() {

    return generatorEls.type?.value ||
        "custom-pool-draw";

}


function getGeneratorTypeLabel(
    type
) {

    const labels = {

        "custom-pool-draw":
            "Custom Pool Draw",

        "injury-evaluation":
            "Injury Evaluation"

    };


    return labels[
        type
    ]

    ||

    "Generator Result";

}


// =================================
// DATABASE
// =================================


function getGeneratorHistoryDatabase() {

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
        typeof database !== "object"
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

        version:
            Number(
                database.version || 1
            ),

        results:
            generatorArray(
                database.results
            )
    };

}


async function generatorHasWritePermission() {

    if (
        !owlRepositoryHandle
    ) {

        return false;

    }


    const options = {
        mode:
            "readwrite"
    };


    if (
        await owlRepositoryHandle.queryPermission(
            options
        ) === "granted"
    ) {

        return true;

    }


    return (
        await owlRepositoryHandle.requestPermission(
            options
        ) === "granted"
    );

}


async function writeGeneratorHistoryDatabase(
    database
) {

    if (
        !await generatorHasWritePermission()
    ) {

        throw new Error(
            "Repository write permission was not granted."
        );

    }


    const dataDirectory =
        await owlRepositoryHandle.getDirectoryHandle(
            "data"
        );


    const fileHandle =
        await dataDirectory.getFileHandle(
            "generator-history.json"
        );


    const writable =
        await fileHandle.createWritable();


    try {

        await writable.write(
            `${JSON.stringify(
                database,
                null,
                2
            )}\n`
        );


        await writable.close();

    }

    catch (
        error
    ) {

        try {

            await writable.abort();

        }

        catch {

            // No additional action required.

        }


        throw error;

    }

}


// =================================
// CUSTOM POOL STATE
// =================================


function getGeneratorPoolState() {

    const pool =
        generatorUniqueLines(
            generatorEls.pool?.value
        );


    const exclusions =
        generatorUniqueLines(
            generatorEls.exclusions?.value
        );


    const exclusionKeys =
        new Set(
            exclusions.map(
                entry =>
                    entry.toLowerCase()
            )
        );


    const eligible =
        pool.filter(
            entry =>
                !exclusionKeys.has(
                    entry.toLowerCase()
                )
        );


    const appliedExclusions =
        exclusions.filter(
            entry =>
                pool.some(
                    poolEntry =>
                        poolEntry.toLowerCase() ===
                        entry.toLowerCase()
                )
        );


    return {
        pool,
        exclusions,
        eligible,
        appliedExclusions
    };

}


// =================================
// INJURY STATE
// =================================


function populateGeneratorWrestlers() {

    if (
        !generatorEls.injuryWrestler
    ) {

        return;

    }


    const previousValue =
        generatorEls.injuryWrestler.value;


    const wrestlers =

        generatorArray(
            owlControlRoomData
                ?.wrestlers
        )
            .filter(
                wrestler =>
                    wrestler
                    &&
                    wrestler.id
                    &&
                    wrestler.name
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    String(
                        a.name
                    ).localeCompare(
                        String(
                            b.name
                        )
                    )
            );


    generatorEls.injuryWrestler.innerHTML =
        "";


    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value =
        "";


    defaultOption.textContent =
        "Select Wrestler";


    generatorEls.injuryWrestler.appendChild(
        defaultOption
    );


    wrestlers.forEach(
        wrestler => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                wrestler.id;


            option.textContent =
                wrestler.name;


            option.dataset.name =
                wrestler.name;


            generatorEls.injuryWrestler.appendChild(
                option
            );

        }
    );


    if (
        wrestlers.some(
            wrestler =>
                wrestler.id ===
                previousValue
        )
    ) {

        generatorEls.injuryWrestler.value =
            previousValue;

    }

}


function getSelectedInjuryWrestler() {

    const select =
        generatorEls.injuryWrestler;


    if (
        !select
        ||
        !select.value
    ) {

        return null;

    }


    const option =
        select.selectedOptions[0];


    return {

        id:
            select.value,

        name:
            option?.dataset?.name ||
            option?.textContent ||
            select.value

    };

}


function getInjuryOutcome(
    roll
) {

    if (
        roll <= 3
    ) {

        return {

            absenceWeeks:
                0,

            outcomeLabel:
                "No injury absence",

            severeReviewRequired:
                false

        };

    }


    if (
        roll <= 6
    ) {

        return {

            absenceWeeks:
                1,

            outcomeLabel:
                "1 week unavailable",

            severeReviewRequired:
                false

        };

    }


    if (
        roll <= 9
    ) {

        return {

            absenceWeeks:
                2,

            outcomeLabel:
                "2 weeks unavailable",

            severeReviewRequired:
                false

        };

    }


    return {

        absenceWeeks:
            3,

        outcomeLabel:
            "3 weeks unavailable",

        severeReviewRequired:
            true

    };

}


// =================================
// UI STATE
// =================================


function setGeneratorMessage(
    message,
    type = "success"
) {

    if (
        !generatorEls.message
    ) {

        return;

    }


    generatorEls.message.textContent =
        message;


    generatorEls.message.className =
        `cr-save-message ${
            type === "error"
                ? "save-error"
                : "save-success"
        }`;


    generatorEls.message.hidden =
        false;

}


function clearGeneratorMessage() {

    if (
        !generatorEls.message
    ) {

        return;

    }


    generatorEls.message.hidden =
        true;


    generatorEls.message.textContent =
        "";

}


function setGeneratorStage(
    state,
    resultText,
    resultEntries = []
) {

    if (
        generatorEls.stageState
    ) {

        generatorEls.stageState.textContent =
            state;

    }


    if (
        generatorEls.stageResult
    ) {

        generatorEls.stageResult.textContent =
            resultText;

    }


    if (
        generatorEls.stageList
    ) {

        generatorEls.stageList.innerHTML =
            "";


        resultEntries.forEach(
            (
                entry,
                index
            ) => {

                const item =
                    document.createElement(
                        "li"
                    );


                item.textContent =
                    `${index + 1}. ${entry}`;


                generatorEls.stageList.appendChild(
                    item
                );

            }
        );

    }

}


function resetGeneratorResult(
    message = "Ready for a new draw."
) {

    generatorCurrentResult =
        null;


    if (
        generatorEls.stage
    ) {

        generatorEls.stage.classList.remove(
            "is-rolling",
            "has-result"
        );

    }


    setGeneratorStage(
        "READY",
        message,
        []
    );


    renderGeneratorControls();

}


function renderGeneratorTypeState() {

    const isInjury =
        getGeneratorType() ===
        "injury-evaluation";


    if (
        generatorEls.injuryFields
    ) {

        generatorEls.injuryFields.hidden =
            !isInjury;

    }


    if (
        generatorEls.poolFields
    ) {

        generatorEls.poolFields.hidden =
            isInjury;

    }


    if (
        generatorEls.countFields
    ) {

        generatorEls.countFields.hidden =
            isInjury;

    }


    if (
        generatorEls.method
    ) {

        generatorEls.method.disabled =
            isInjury;


        if (
            isInjury
        ) {

            generatorEls.method.value =
                "single";

        }

    }


    if (
        generatorEls.label
    ) {

        generatorEls.label.placeholder =

            isInjury

                ? "Example: Revolt Week 3 Injury Evaluation"

                : "Example: Overthrow Final Ten Selection";

    }


    if (
        generatorEls.context
    ) {

        generatorEls.context.placeholder =

            isInjury

                ? "Example: Revolt — July Week 3 — Match ID"

                : "Example: Overthrow 2027 — Revolt Men";

    }

}


function renderGeneratorModeNote() {

    if (
        !generatorEls.modeNote
    ) {

        return;

    }


    const isCanon =
        generatorEls.mode?.value ===
        "canon";


    const isInjury =
        getGeneratorType() ===
        "injury-evaluation";


    const modeText =

        isCanon

            ? "Canon mode creates a pending official result. It is not saved until Confirm Canon Result is pressed."

            : "Test mode demonstrates the generator only. Test results can never be written to official history.";


    const typeText =

        isInjury

            ? " Injury Evaluation currently performs the approved primary d10 roll only. A roll of 10 flags severe-injury review instead of inventing unfinished rules."

            : "";


    generatorEls.modeNote.textContent =
        `${modeText}${typeText}`;

}


function renderGeneratorControls() {

    const type =
        getGeneratorType();


    const poolState =
        getGeneratorPoolState();


    if (
        generatorEls.eligibleCount
    ) {

        generatorEls.eligibleCount.textContent =
            poolState.eligible.length;

    }


    if (
        generatorEls.excludedCount
    ) {

        generatorEls.excludedCount.textContent =
            poolState.appliedExclusions.length;

    }


    const connected =
        Boolean(
            owlRepositoryHandle
        );


    let requiredInputsReady =
        false;


    if (
        type ===
        "injury-evaluation"
    ) {

        requiredInputsReady =
            Boolean(
                getSelectedInjuryWrestler()
            )
            &&
            Boolean(
                generatorCleanText(
                    generatorEls
                        .injuryCritCause
                        ?.value
                )
            );

    }

    else {

        requiredInputsReady =
            poolState.eligible.length >
            0;

    }


    const canGenerate =
        connected
        &&
        !generatorIsRolling
        &&
        requiredInputsReady;


    if (
        generatorEls.generate
    ) {

        generatorEls.generate.disabled =
            !canGenerate;

    }


    const canConfirm =
        !generatorIsRolling
        &&
        generatorCurrentResult
        &&
        generatorCurrentResult.mode ===
            "canon"
        &&
        generatorEls.mode?.value ===
            "canon";


    if (
        generatorEls.confirm
    ) {

        generatorEls.confirm.disabled =
            !canConfirm;

    }


    if (
        generatorEls.discard
    ) {

        generatorEls.discard.disabled =
            !generatorCurrentResult
            ||
            generatorIsRolling;

    }


    renderGeneratorModeNote();

}


// =================================
// HISTORY
// =================================


function renderGeneratorHistory() {

    if (
        !generatorEls.history
    ) {

        return;

    }


    const database =
        getGeneratorHistoryDatabase();


    const results =
        [
            ...database.results
        ].sort(
            (
                a,
                b
            ) =>
                String(
                    b.confirmedAt || ""
                ).localeCompare(
                    String(
                        a.confirmedAt || ""
                    )
                )
        );


    if (
        generatorEls.historyCount
    ) {

        generatorEls.historyCount.textContent =
            `${results.length} CONFIRMED`;

    }


    generatorEls.history.innerHTML =
        "";


    if (
        !results.length
    ) {

        const empty =
            document.createElement(
                "p"
            );


        empty.className =
            "cr-generator-history-empty";


        empty.textContent =
            "No confirmed canon generator results are stored yet.";


        generatorEls.history.appendChild(
            empty
        );


        return;

    }


    results.forEach(
        result => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "cr-generator-history-card";


            const resultEntries =
                generatorArray(
                    result.result
                );


            card.innerHTML = `

                <div class="cr-generator-history-card-heading">

                    <div>

                        <span>
                            ${generatorEscape(
                                result.generatorType ||
                                "Generator Result"
                            )}
                        </span>

                        <h4>
                            ${generatorEscape(
                                result.label ||
                                "Untitled Result"
                            )}
                        </h4>

                    </div>

                    <strong>
                        ${generatorEscape(
                            generatorFormatDateTime(
                                result.confirmedAt
                            )
                        )}
                    </strong>

                </div>

                ${
                    result.relatedContext

                        ? `

                            <p class="cr-generator-history-context">

                                ${generatorEscape(
                                    result.relatedContext
                                )}

                            </p>

                        `

                        : ""
                }

                <ol class="cr-generator-history-result">

                    ${resultEntries
                        .map(
                            entry => `

                                <li>
                                    ${generatorEscape(
                                        entry
                                    )}
                                </li>

                            `
                        )
                        .join(
                            ""
                        )}

                </ol>

                <div class="cr-generator-history-meta">

                    <span>
                        ${generatorEscape(
                            result.methodLabel ||
                            result.method ||
                            "Generator"
                        )}
                    </span>

                    ${
                        result.injuryEvaluation

                            ? `

                                <span>
                                    Roll ${generatorEscape(
                                        result
                                            .injuryEvaluation
                                            .primaryRoll
                                    )} / 10
                                </span>

                                <span>
                                    ${generatorEscape(
                                        result
                                            .injuryEvaluation
                                            .absenceWeeks
                                    )} week absence
                                </span>

                            `

                            : `

                                <span>
                                    ${generatorArray(
                                        result.eligiblePool
                                    ).length} eligible
                                </span>

                                <span>
                                    ${generatorArray(
                                        result.excludedEntries
                                    ).length} excluded
                                </span>

                            `
                    }

                </div>

            `;


            generatorEls.history.appendChild(
                card
            );

        }
    );

}


// =================================
// GENERATION BUILDERS
// =================================


function buildCustomPoolResult() {

    const poolState =
        getGeneratorPoolState();


    const method =
        generatorEls.method?.value ||
        "single";


    const result =

        method === "order"

            ? generatorShuffle(
                poolState.eligible
            )

            : [
                poolState.eligible[
                    generatorRandomIndex(
                        poolState.eligible.length
                    )
                ]
            ];


    return {

        id:
            generatorCreateId(),

        generatorKey:
            "custom-pool-draw",

        generatorType:
            "Custom Pool Draw",

        mode:
            generatorEls.mode?.value ||
            "test",

        method,

        methodLabel:

            method === "order"

                ? "Full Random Order"

                : "Select One",

        label:
            generatorCleanText(
                generatorEls.label?.value
            )
            ||
            "Custom Pool Draw",

        relatedContext:
            generatorCleanText(
                generatorEls.context?.value
            ),

        result,

        eligiblePool:
            [
                ...poolState.eligible
            ],

        excludedEntries:
            [
                ...poolState.appliedExclusions
            ],

        generatedAt:
            new Date().toISOString(),

        confirmed:
            false,

        confirmedAt:
            null

    };

}


function buildInjuryEvaluationResult() {

    const wrestler =
        getSelectedInjuryWrestler();


    const critCause =
        generatorCleanText(
            generatorEls
                .injuryCritCause
                ?.value
        );


    if (
        !wrestler
    ) {

        throw new Error(
            "Select the wrestler who received the CRIT."
        );

    }


    if (
        !critCause
    ) {

        throw new Error(
            "Enter the cause of the CRIT."
        );

    }


    const primaryRoll =
        generatorRandomIndex(
            10
        ) + 1;


    const outcome =
        getInjuryOutcome(
            primaryRoll
        );


    const result = [

        `${wrestler.name} received a primary injury roll of ${primaryRoll} out of 10.`,

        outcome.outcomeLabel,

        `CRIT cause: ${critCause}`

    ];


    if (
        outcome.severeReviewRequired
    ) {

        result.push(

            "Severe-injury review required. The standard result is three weeks unavailable, but no severe outcome will be generated until the remaining severe-injury rules are approved."

        );

    }

    else if (
        outcome.absenceWeeks ===
        0
    ) {

        result.push(

            "No injury record should be created from this evaluation."

        );

    }

    else {

        result.push(

            "This result may be transferred into the Injury Tracker after canon confirmation."

        );

    }


    return {

        id:
            generatorCreateId(),

        generatorKey:
            "injury-evaluation",

        generatorType:
            "Injury Evaluation",

        mode:
            generatorEls.mode?.value ||
            "test",

        method:
            "primary-d10",

        methodLabel:
            "Primary Injury d10",

        label:
            generatorCleanText(
                generatorEls.label?.value
            )
            ||
            `Injury Evaluation — ${wrestler.name}`,

        relatedContext:
            generatorCleanText(
                generatorEls.context?.value
            ),

        result,

        eligiblePool:
            [
                wrestler.name
            ],

        excludedEntries:
            [],

        injuryEvaluation: {

            wrestlerId:
                wrestler.id,

            wrestlerName:
                wrestler.name,

            critCause,

            primaryRoll,

            absenceWeeks:
                outcome.absenceWeeks,

            outcomeLabel:
                outcome.outcomeLabel,

            severeReviewRequired:
                outcome.severeReviewRequired

        },

        generatedAt:
            new Date().toISOString(),

        confirmed:
            false,

        confirmedAt:
            null

    };

}


// =================================
// ANIMATION
// =================================


async function animateCustomPoolGenerator(
    eligible
) {

    for (
        let cycle = 0;
        cycle < 16;
        cycle += 1
    ) {

        const preview =
            eligible[
                generatorRandomIndex(
                    eligible.length
                )
            ];


        setGeneratorStage(
            "GENERATING",
            preview,
            []
        );


        await generatorDelay(
            65 + (
                cycle * 4
            )
        );

    }

}


async function animateInjuryGenerator() {

    for (
        let cycle = 0;
        cycle < 18;
        cycle += 1
    ) {

        const previewRoll =
            generatorRandomIndex(
                10
            ) + 1;


        setGeneratorStage(
            "ROLLING PRIMARY INJURY d10",
            String(
                previewRoll
            ),
            []
        );


        await generatorDelay(
            60 + (
                cycle * 4
            )
        );

    }

}


// =================================
// GENERATION
// =================================


async function generateGeneratorResult() {

    if (
        generatorIsRolling
    ) {

        return;

    }


    const type =
        getGeneratorType();


    const poolState =
        getGeneratorPoolState();


    if (
        type ===
        "custom-pool-draw"
        &&
        !poolState.eligible.length
    ) {

        setGeneratorMessage(
            "Add at least one eligible pool entry before generating.",
            "error"
        );


        return;

    }


    if (
        type ===
        "injury-evaluation"
        &&
        (
            !getSelectedInjuryWrestler()
            ||
            !generatorCleanText(
                generatorEls
                    .injuryCritCause
                    ?.value
            )
        )
    ) {

        setGeneratorMessage(
            "Select a wrestler and enter the CRIT cause before generating.",
            "error"
        );


        return;

    }


    clearGeneratorMessage();


    generatorIsRolling =
        true;


    generatorCurrentResult =
        null;


    renderGeneratorControls();


    try {

        if (
            generatorEls.stage
        ) {

            generatorEls.stage.classList.add(
                "is-rolling"
            );


            generatorEls.stage.classList.remove(
                "has-result"
            );

        }


        if (
            type ===
            "injury-evaluation"
        ) {

            await animateInjuryGenerator();


            generatorCurrentResult =
                buildInjuryEvaluationResult();

        }

        else {

            await animateCustomPoolGenerator(
                poolState.eligible
            );


            generatorCurrentResult =
                buildCustomPoolResult();

        }


        if (
            generatorEls.stage
        ) {

            generatorEls.stage.classList.remove(
                "is-rolling"
            );


            generatorEls.stage.classList.add(
                "has-result"
            );

        }


        const isInjury =
            Boolean(
                generatorCurrentResult
                    .injuryEvaluation
            );


        const injuryData =
            generatorCurrentResult
                .injuryEvaluation;


        const resultText =

            isInjury

                ? `ROLL ${injuryData.primaryRoll} — ${injuryData.outcomeLabel.toUpperCase()}`

                : generatorCurrentResult.method ===
                    "order"

                    ? `${generatorCurrentResult.result.length} entries ordered`

                    : generatorCurrentResult.result[0];


        setGeneratorStage(
            generatorCurrentResult.mode ===
                "canon"

                ? "PENDING CANON CONFIRMATION"

                : "TEST RESULT — NOT SAVED",

            resultText,

            isInjury
            ||
            generatorCurrentResult.method ===
                "order"

                ? generatorCurrentResult.result

                : []
        );


        setGeneratorMessage(

            generatorCurrentResult.mode ===
                "canon"

                ? "Result generated. Review it, then confirm or discard it."

                : "Test result generated. It exists only on this screen and cannot be saved."

        );

    }

    catch (
        error
    ) {

        console.error(
            "Could not generate result:",
            error
        );


        resetGeneratorResult(
            "Generation failed."
        );


        setGeneratorMessage(
            error.message ||
            "Could not generate the result.",
            "error"
        );

    }

    finally {

        generatorIsRolling =
            false;


        renderGeneratorControls();

    }

}


async function confirmGeneratorResult() {

    if (
        !generatorCurrentResult
        ||
        generatorCurrentResult.mode !==
            "canon"
    ) {

        return;

    }


    const approved =
        window.confirm(

            "Confirm this as an official OWL canon generator result?\n\nOnce saved, it will remain in Generator History."

        );


    if (
        !approved
    ) {

        return;

    }


    if (
        generatorEls.confirm
    ) {

        generatorEls.confirm.disabled =
            true;

    }


    try {

        const database =
            getGeneratorHistoryDatabase();


        const confirmedResult = {

            ...generatorCurrentResult,

            confirmed:
                true,

            confirmedAt:
                new Date().toISOString()

        };


        const updatedDatabase = {

            ...database,

            version:
                Number(
                    database.version || 1
                ),

            results: [

                confirmedResult,

                ...database.results.filter(
                    result =>
                        result.id !==
                        confirmedResult.id
                )

            ]

        };


        await writeGeneratorHistoryDatabase(
            updatedDatabase
        );


        owlControlRoomData.generatorHistory =
            updatedDatabase;


        generatorCurrentResult =
            null;


        renderGeneratorHistory();


        resetGeneratorResult(
            "Official result confirmed and saved."
        );


        setGeneratorMessage(
            "Canon generator result saved to data/generator-history.json."
        );

    }

    catch (
        error
    ) {

        console.error(
            "Could not save generator result:",
            error
        );


        setGeneratorMessage(
            error.message ||
            "Could not save the generator result.",
            "error"
        );


        renderGeneratorControls();

    }

}


// =================================
// CHANGE HANDLING
// =================================


function handleGeneratorSettingChange(
    message
) {

    if (
        generatorCurrentResult
    ) {

        resetGeneratorResult(
            message
        );

    }


    renderGeneratorTypeState();


    renderGeneratorControls();

}


// =================================
// INITIALIZATION
// =================================


function initializeGeneratorHub() {

    if (
        !generatorEls.status
    ) {

        return;

    }


    generatorEls.status.textContent =
        "READY";


    clearGeneratorMessage();


    populateGeneratorWrestlers();


    renderGeneratorTypeState();


    renderGeneratorHistory();


    resetGeneratorResult(
        "Choose a generator and enter the required information."
    );


    renderGeneratorControls();

}


generatorEls.mode?.addEventListener(
    "change",
    () => {

        handleGeneratorSettingChange(
            "Mode changed. Generate a new result."
        );

    }
);


generatorEls.type?.addEventListener(
    "change",
    () => {

        handleGeneratorSettingChange(
            "Generator type changed. Generate a new result."
        );

    }
);


generatorEls.method?.addEventListener(
    "change",
    () => {

        handleGeneratorSettingChange(
            "Draw method changed. Generate a new result."
        );

    }
);


[
    generatorEls.pool,
    generatorEls.exclusions,
    generatorEls.injuryCritCause
]
    .filter(
        Boolean
    )
    .forEach(
        element => {

            element.addEventListener(
                "input",
                () => {

                    handleGeneratorSettingChange(
                        "Generator information changed. Generate a new result."
                    );

                }
            );

        }
    );


generatorEls.injuryWrestler?.addEventListener(
    "change",
    () => {

        handleGeneratorSettingChange(
            "Selected wrestler changed. Generate a new result."
        );

    }
);


[
    generatorEls.label,
    generatorEls.context
]
    .filter(
        Boolean
    )
    .forEach(
        element => {

            element.addEventListener(
                "input",
                () => {

                    if (
                        generatorCurrentResult
                    ) {

                        resetGeneratorResult(
                            "Details changed. Generate a new result."
                        );

                    }

                }
            );

        }
    );


generatorEls.generate?.addEventListener(
    "click",
    generateGeneratorResult
);


generatorEls.confirm?.addEventListener(
    "click",
    confirmGeneratorResult
);


generatorEls.discard?.addEventListener(
    "click",
    () => {

        resetGeneratorResult(
            "Result discarded. Nothing was saved."
        );


        setGeneratorMessage(
            "Pending result discarded."
        );

    }
);


window.addEventListener(
    "owl-control-room-data-loaded",
    initializeGeneratorHub
);
