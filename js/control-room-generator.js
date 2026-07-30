// =================================
// CONTROL ROOM GENERATOR HUB
// FOUNDATION
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

            // No additional action is required.

        }


        throw error;

    }

}


// =================================
// POOL STATE
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


function renderGeneratorModeNote() {

    if (
        !generatorEls.modeNote
    ) {

        return;

    }


    const isCanon =
        generatorEls.mode?.value ===
        "canon";


    generatorEls.modeNote.textContent =

        isCanon

            ? "Canon mode creates a pending official result. It is not saved until Confirm Canon Result is pressed."

            : "Test mode demonstrates the generator only. Test results can never be written to official history.";

}


function renderGeneratorControls() {

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


    const canGenerate =
        connected
        &&
        !generatorIsRolling
        &&
        poolState.eligible.length > 0
        &&
        generatorEls.type?.value ===
            "custom-pool-draw";


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
                                "Untitled Draw"
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
                            "Draw"
                        )}
                    </span>

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

                </div>

            `;


            generatorEls.history.appendChild(
                card
            );

        }
    );

}


// =================================
// GENERATION
// =================================


async function animateGenerator(
    eligible
) {

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


async function generateGeneratorResult() {

    if (
        generatorIsRolling
    ) {

        return;

    }


    const poolState =
        getGeneratorPoolState();


    if (
        !poolState.eligible.length
    ) {

        setGeneratorMessage(
            "Add at least one eligible pool entry before generating.",
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

        await animateGenerator(
            poolState.eligible
        );


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


        generatorCurrentResult = {

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


        setGeneratorStage(
            generatorCurrentResult.mode ===
                "canon"

                ? "PENDING CANON CONFIRMATION"

                : "TEST RESULT — NOT SAVED",

            method === "order"

                ? `${result.length} entries ordered`

                : result[0],

            method === "order"
                ? result
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


    renderGeneratorHistory();


    resetGeneratorResult(
        "Enter a pool and generate a result."
    );


    renderGeneratorControls();

}


[
    generatorEls.mode,
    generatorEls.type,
    generatorEls.method,
    generatorEls.pool,
    generatorEls.exclusions
]
    .filter(
        Boolean
    )
    .forEach(
        element => {

            element.addEventListener(
                "change",
                () => {

                    if (
                        generatorCurrentResult
                    ) {

                        resetGeneratorResult(
                            "Settings changed. Generate a new result."
                        );

                    }


                    renderGeneratorControls();

                }
            );


            if (
                element.tagName ===
                "TEXTAREA"
            ) {

                element.addEventListener(
                    "input",
                    () => {

                        if (
                            generatorCurrentResult
                        ) {

                            resetGeneratorResult(
                                "Pool changed. Generate a new result."
                            );

                        }


                        renderGeneratorControls();

                    }
                );

            }

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
