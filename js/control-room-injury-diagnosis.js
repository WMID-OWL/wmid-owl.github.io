// =================================
// OWL INJURY BODY MAPPING + DIAGNOSES
// =================================

(() => {
    if (
        typeof buildInjuryEvaluationResult !== "function" ||
        typeof generatorEls === "undefined" ||
        !generatorEls?.injuryCritCause
    ) {
        console.warn("Injury mapping could not find the Injury Evaluation Generator.");
        return;
    }

    const AREA_ORDER = ["Neck", "Arms", "Back", "Legs"];
    const DURATIONS = ["1", "2", "3", "8", "12", "16"];

    const METHOD_LABELS = {
        "submission-target": "Submission Target",
        "explicit-target": "Explicitly Targeted Attack",
        "primary-impact": "Primary Landing / Impact Area",
        "ambiguous-50-50": "Equal Ambiguity — 50/50 Draw"
    };

    const originalBuild =
        buildInjuryEvaluationResult;

    const originalGetDraft =
        typeof injuryCreateGetDraft === "function"
            ? injuryCreateGetDraft
            : null;

    let catalog = null;
    let syncingCreator = false;

    const els = {
        panel: null,
        method: null,
        first: null,
        secondWrap: null,
        second: null,
        result: null,
        status: null
    };

    const asArray =
        value =>
            Array.isArray(value)
                ? value
                : [];

    const clean =
        value =>
            String(value || "").trim();

    function sanitize(value) {
        return String(value || "").replace(
            /\bcontusions?\b/gi,
            match =>
                /s$/i.test(match)
                    ? "bruises"
                    : "bruise"
        );
    }

    function parseArea(value) {
        const [
            fireProArea,
            anatomicalSubArea
        ] = clean(value).split("::");

        if (
            !fireProArea ||
            !anatomicalSubArea
        ) {
            return null;
        }

        return {
            fireProArea,
            anatomicalSubArea,
            label:
                `${fireProArea} — ${anatomicalSubArea}`
        };
    }

    function countDiagnoses() {
        return AREA_ORDER.reduce(
            (total, areaName) => {
                const subAreas =
                    catalog
                        ?.areas
                        ?.[areaName]
                        ?.subAreas
                    ||
                    {};

                return total +
                    Object.values(subAreas)
                        .reduce(
                            (
                                areaTotal,
                                durationMap
                            ) =>
                                areaTotal +
                                DURATIONS.reduce(
                                    (
                                        durationTotal,
                                        duration
                                    ) =>
                                        durationTotal +
                                        asArray(
                                            durationMap?.[duration]
                                        ).length,
                                    0
                                ),
                            0
                        );
            },
            0
        );
    }

    function cachePanel(panel) {
        els.panel =
            panel;

        els.method =
            panel.querySelector(
                "#cr-generator-injury-determination"
            );

        els.first =
            panel.querySelector(
                "#cr-generator-injury-first-area"
            );

        els.secondWrap =
            panel.querySelector(
                "#cr-generator-injury-second-wrap"
            );

        els.second =
            panel.querySelector(
                "#cr-generator-injury-second-area"
            );

        els.result =
            panel.querySelector(
                "#cr-generator-injury-area-result"
            );

        els.status =
            panel.querySelector(
                "#cr-generator-injury-catalog-status"
            );
    }

    function createPanel() {
        const existing =
            document.getElementById(
                "cr-generator-injury-mapping"
            );

        if (existing) {
            cachePanel(existing);
            return;
        }

        const causeGroup =
            generatorEls
                .injuryCritCause
                .closest(
                    ".cr-form-group"
                );

        if (!causeGroup) {
            return;
        }

        const panel =
            document.createElement(
                "section"
            );

        panel.id =
            "cr-generator-injury-mapping";

        panel.className =
            "cr-injury-mapping-panel";

        panel.innerHTML = `
            <div class="cr-injury-mapping-heading">
                <div>
                    <span>
                        CRIT BODY MAPPING
                    </span>

                    <h4>
                        Determine the affected area
                    </h4>
                </div>

                <small id="cr-generator-injury-catalog-status">
                    Loading catalog…
                </small>
            </div>

            <div class="cr-editor-form-grid">
                <div class="cr-form-group">
                    <label for="cr-generator-injury-determination">
                        DETERMINATION METHOD
                    </label>

                    <select id="cr-generator-injury-determination">
                        <option value="submission-target">
                            Submission Target
                        </option>

                        <option value="explicit-target">
                            Explicitly Targeted Attack
                        </option>

                        <option value="primary-impact">
                            Primary Landing / Impact Area
                        </option>

                        <option value="ambiguous-50-50">
                            Equal Ambiguity — 50/50 Draw
                        </option>
                    </select>
                </div>

                <div class="cr-form-group">
                    <label for="cr-generator-injury-first-area">
                        ANATOMICAL AREA
                    </label>

                    <select
                        id="cr-generator-injury-first-area"
                        disabled
                    >
                        <option value="">
                            Load Diagnosis Catalog
                        </option>
                    </select>
                </div>

                <div
                    id="cr-generator-injury-second-wrap"
                    class="cr-form-group"
                    hidden
                >
                    <label for="cr-generator-injury-second-area">
                        EQUALLY PLAUSIBLE AREA TWO
                    </label>

                    <select
                        id="cr-generator-injury-second-area"
                        disabled
                    >
                        <option value="">
                            Load Diagnosis Catalog
                        </option>
                    </select>
                </div>

                <div class="cr-form-group">
                    <label>
                        FIRE PRO ENDURANCE RESULT
                    </label>

                    <div
                        id="cr-generator-injury-area-result"
                        class="cr-current-value"
                    >
                        Select an anatomical area
                    </div>
                </div>
            </div>
        `;

        causeGroup.insertAdjacentElement(
            "afterend",
            panel
        );

        cachePanel(panel);

        [
            els.method,
            els.first,
            els.second
        ].forEach(
            field => {
                field.addEventListener(
                    "change",
                    updatePanel
                );
            }
        );
    }

    function buildOptions() {
        const fragment =
            document.createDocumentFragment();

        const placeholder =
            document.createElement(
                "option"
            );

        placeholder.value =
            "";

        placeholder.textContent =
            "Select Anatomical Area";

        fragment.appendChild(
            placeholder
        );

        AREA_ORDER.forEach(
            areaName => {
                const group =
                    document.createElement(
                        "optgroup"
                    );

                group.label =
                    areaName;

                const subAreas =
                    catalog
                        ?.areas
                        ?.[areaName]
                        ?.subAreas
                    ||
                    {};

                Object.keys(subAreas)
                    .forEach(
                        subAreaName => {
                            const option =
                                document.createElement(
                                    "option"
                                );

                            option.value =
                                `${areaName}::${subAreaName}`;

                            option.textContent =
                                `${areaName} — ${subAreaName}`;

                            group.appendChild(
                                option
                            );
                        }
                    );

                fragment.appendChild(
                    group
                );
            }
        );

        return fragment;
    }

    function populateOptions() {
        const firstValue =
            els.first.value;

        const secondValue =
            els.second.value;

        els.first.innerHTML =
            "";

        els.second.innerHTML =
            "";

        els.first.appendChild(
            buildOptions()
        );

        els.second.appendChild(
            buildOptions()
        );

        els.first.disabled =
            false;

        els.second.disabled =
            false;

        if (
            [...els.first.options]
                .some(
                    option =>
                        option.value ===
                        firstValue
                )
        ) {
            els.first.value =
                firstValue;
        }

        if (
            [...els.second.options]
                .some(
                    option =>
                        option.value ===
                        secondValue
                )
        ) {
            els.second.value =
                secondValue;
        }

        updatePanel();
    }

    function updatePanel() {
        const ambiguous =
            els.method.value ===
            "ambiguous-50-50";

        const first =
            parseArea(
                els.first.value
            );

        const second =
            parseArea(
                els.second.value
            );

        els.secondWrap.hidden =
            !ambiguous;

        els.result.classList.remove(
            "is-error"
        );

        if (!first) {
            els.result.textContent =
                "Select an anatomical area";

            return;
        }

        if (!ambiguous) {
            els.result.textContent =
                first.label;

            return;
        }

        if (!second) {
            els.result.textContent =
                "Select the second equally plausible area";

            return;
        }

        if (
            first.fireProArea ===
            second.fireProArea
        ) {
            els.result.textContent =
                "The 50/50 choices must use different Fire Pro endurance areas.";

            els.result.classList.add(
                "is-error"
            );

            return;
        }

        els.result.textContent =
            `50/50: ${first.label} or ${second.label}`;
    }

    function validateCatalog(data) {
        if (!data?.areas) {
            throw new Error(
                "The injury diagnosis catalog is invalid."
            );
        }

        if (
            /\bcontusions?\b/i.test(
                JSON.stringify(data)
            )
        ) {
            throw new Error(
                "The injury diagnosis catalog must use bruise wording only."
            );
        }

        AREA_ORDER.forEach(
            areaName => {
                const subAreas =
                    data
                        ?.areas
                        ?.[areaName]
                        ?.subAreas;

                if (
                    !subAreas ||
                    Object.keys(subAreas).length === 0
                ) {
                    throw new Error(
                        `${areaName} is missing from the diagnosis catalog.`
                    );
                }

                Object.entries(subAreas)
                    .forEach(
                        ([
                            subAreaName,
                            durationMap
                        ]) => {
                            DURATIONS.forEach(
                                duration => {
                                    if (
                                        asArray(
                                            durationMap?.[duration]
                                        ).length === 0
                                    ) {
                                        throw new Error(
                                            `${areaName} / ${subAreaName} is missing its ${duration}-week pool.`
                                        );
                                    }
                                }
                            );
                        }
                    );
            }
        );

        return data;
    }

    async function loadCatalog() {
        try {
            let data =
                null;

            if (
                typeof owlRepositoryHandle !==
                    "undefined" &&
                owlRepositoryHandle
            ) {
                const dataDirectory =
                    await owlRepositoryHandle
                        .getDirectoryHandle(
                            "data"
                        );

                const fileHandle =
                    await dataDirectory
                        .getFileHandle(
                            "injury-diagnoses.json"
                        );

                const file =
                    await fileHandle
                        .getFile();

                data =
                    JSON.parse(
                        await file.text()
                    );
            }
            else {
                const response =
                    await fetch(
                        "data/injury-diagnoses.json",
                        {
                            cache:
                                "no-store"
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        "Could not load data/injury-diagnoses.json."
                    );
                }

                data =
                    await response.json();
            }

            catalog =
                validateCatalog(data);

            populateOptions();

            els.status.textContent =
                `${countDiagnoses()} approved diagnosis options ready.`;

            els.status.classList.remove(
                "is-error"
            );
        }
        catch (error) {
            console.error(
                "Could not load injury diagnoses:",
                error
            );

            catalog =
                null;

            els.status.textContent =
                error.message;

            els.status.classList.add(
                "is-error"
            );
        }
    }

    function getMapping() {
        if (!catalog) {
            throw new Error(
                "The approved diagnosis catalog is not ready."
            );
        }

        const method =
            els.method.value;

        const first =
            parseArea(
                els.first.value
            );

        if (!METHOD_LABELS[method]) {
            throw new Error(
                "Select the CRIT determination method."
            );
        }

        if (!first) {
            throw new Error(
                "Select the anatomical area affected by the CRIT."
            );
        }

        const candidates = [
            first
        ];

        if (
            method ===
            "ambiguous-50-50"
        ) {
            const second =
                parseArea(
                    els.second.value
                );

            if (!second) {
                throw new Error(
                    "Select the second equally plausible area."
                );
            }

            if (
                first.fireProArea ===
                second.fireProArea
            ) {
                throw new Error(
                    "The 50/50 choices must use different Fire Pro endurance areas."
                );
            }

            candidates.push(
                second
            );
        }

        return {
            method,
            methodLabel:
                METHOD_LABELS[method],
            candidates
        };
    }

    function diagnosisPool(
        area,
        subArea,
        weeks
    ) {
        return asArray(
            catalog
                ?.areas
                ?.[area]
                ?.subAreas
                ?.[subArea]
                ?.[String(weeks)]
        ).map(
            sanitize
        );
    }

    buildInjuryEvaluationResult =
        function () {
            const mapping =
                getMapping();

            const result =
                originalBuild();

            const selectedIndex =
                mapping.candidates.length === 2
                    ? generatorRandomIndex(2)
                    : 0;

            const selected =
                mapping.candidates[
                    selectedIndex
                ];

            const weeks =
                Number(
                    result
                        ?.injuryEvaluation
                        ?.absenceWeeks
                    ||
                    0
                );

            const pool =
                weeks > 0
                    ? diagnosisPool(
                        selected.fireProArea,
                        selected.anatomicalSubArea,
                        weeks
                    )
                    : [];

            if (
                weeks > 0 &&
                pool.length === 0
            ) {
                throw new Error(
                    `No approved ${weeks}-week diagnosis exists for ${selected.label}.`
                );
            }

            const diagnosisIndex =
                pool.length
                    ? generatorRandomIndex(
                        pool.length
                    )
                    : null;

            const diagnosis =
                diagnosisIndex === null
                    ? ""
                    : pool[diagnosisIndex];

            result.result =
                asArray(
                    result.result
                ).map(
                    sanitize
                );

            result.result.push(
                `CRIT determination: ${mapping.methodLabel}.`
            );

            if (
                mapping.candidates.length === 2
            ) {
                result.result.push(
                    `Equal-area pool: ${mapping.candidates
                        .map(
                            item =>
                                item.label
                        )
                        .join(" / ")}.`
                );

                result.result.push(
                    `50/50 selected: ${selected.label}.`
                );
            }
            else {
                result.result.push(
                    `Affected area: ${selected.label}.`
                );
            }

            result.result.push(
                diagnosis
                    ? `Diagnosis: ${diagnosis}.`
                    : "No diagnosis was generated because the roll produced no absence."
            );

            result.injuryEvaluation = {
                ...result.injuryEvaluation,

                critCause:
                    sanitize(
                        result
                            ?.injuryEvaluation
                            ?.critCause
                    ),

                critDeterminationMethod:
                    mapping.method,

                critDeterminationMethodLabel:
                    mapping.methodLabel,

                bodyAreaCandidates:
                    mapping.candidates.map(
                        item => ({
                            fireProArea:
                                item.fireProArea,

                            anatomicalSubArea:
                                item.anatomicalSubArea,

                            label:
                                item.label
                        })
                    ),

                bodyAreaSelectionIndex:
                    selectedIndex,

                affectedBodyPart:
                    selected.fireProArea,

                fireProBodyPart:
                    selected.fireProArea,

                specificAnatomicalSubArea:
                    selected.anatomicalSubArea,

                anatomicalSubArea:
                    selected.anatomicalSubArea,

                diagnosisPool:
                    pool,

                diagnosisSelectionIndex:
                    diagnosisIndex,

                diagnosis
            };

            result.randomDecisions = [
                ...asArray(
                    result.randomDecisions
                ),

                {
                    type:
                        "crit-body-area",

                    method:
                        mapping.method,

                    eligiblePool:
                        mapping.candidates.map(
                            item =>
                                item.label
                        ),

                    selectedIndex,

                    selectedResult:
                        selected.label
                },

                ...(
                    diagnosis
                        ? [
                            {
                                type:
                                    "injury-diagnosis",

                                eligiblePool:
                                    pool,

                                selectedIndex:
                                    diagnosisIndex,

                                selectedResult:
                                    diagnosis
                            }
                        ]
                        : []
                )
            ];

            return result;
        };

    function selectedOfficialEvaluation() {
        return typeof injuryCreateGetSelectedEvaluation ===
            "function"
                ? injuryCreateGetSelectedEvaluation()
                    ?.injuryEvaluation
                : null;
    }

    function setCreatorValue(
        field,
        value
    ) {
        if (
            !field ||
            !value
        ) {
            return false;
        }

        const finalValue =
            sanitize(value);

        if (
            field.tagName === "SELECT" &&
            ![...field.options]
                .some(
                    option =>
                        option.value ===
                        finalValue
                )
        ) {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                finalValue;

            option.textContent =
                finalValue;

            field.appendChild(
                option
            );
        }

        if (
            field.value ===
            finalValue
        ) {
            return false;
        }

        field.value =
            finalValue;

        return true;
    }

    function syncOfficialCreator(
        dispatchEvents = true
    ) {
        if (
            syncingCreator ||
            typeof injuryCreateEls ===
                "undefined"
        ) {
            return;
        }

        const evaluation =
            selectedOfficialEvaluation();

        if (
            !evaluation
                ?.affectedBodyPart
        ) {
            return;
        }

        syncingCreator =
            true;

        try {
            const changed = [];

            if (
                setCreatorValue(
                    injuryCreateEls.bodyPart,
                    evaluation.affectedBodyPart
                )
            ) {
                changed.push(
                    injuryCreateEls.bodyPart
                );
            }

            if (
                setCreatorValue(
                    injuryCreateEls.diagnosis,
                    evaluation.diagnosis
                )
            ) {
                changed.push(
                    injuryCreateEls.diagnosis
                );
            }

            if (dispatchEvents) {
                changed.forEach(
                    field => {
                        field.dispatchEvent(
                            new Event(
                                field.tagName ===
                                    "SELECT"
                                    ? "change"
                                    : "input",
                                {
                                    bubbles:
                                        true
                                }
                            )
                        );
                    }
                );
            }
        }
        finally {
            syncingCreator =
                false;
        }
    }

    if (originalGetDraft) {
        injuryCreateGetDraft =
            function () {
                syncOfficialCreator(
                    false
                );

                const draft =
                    originalGetDraft();

                const evaluation =
                    selectedOfficialEvaluation();

                if (
                    !draft ||
                    !evaluation
                        ?.affectedBodyPart
                ) {
                    return draft;
                }

                return {
                    ...draft,

                    critCause:
                        sanitize(
                            evaluation.critCause
                            ||
                            draft.critCause
                        ),

                    critDeterminationMethod:
                        evaluation
                            .critDeterminationMethod,

                    critDeterminationMethodLabel:
                        evaluation
                            .critDeterminationMethodLabel,

                    bodyAreaCandidates:
                        asArray(
                            evaluation
                                .bodyAreaCandidates
                        ),

                    bodyAreaSelectionIndex:
                        evaluation
                            .bodyAreaSelectionIndex,

                    affectedBodyPart:
                        evaluation
                            .affectedBodyPart,

                    fireProBodyPart:
                        evaluation
                            .affectedBodyPart,

                    specificAnatomicalSubArea:
                        evaluation
                            .specificAnatomicalSubArea,

                    anatomicalSubArea:
                        evaluation
                            .specificAnatomicalSubArea,

                    diagnosis:
                        sanitize(
                            evaluation.diagnosis
                            ||
                            draft.diagnosis
                        ),

                    diagnosisPool:
                        asArray(
                            evaluation
                                .diagnosisPool
                        ),

                    diagnosisSelectionIndex:
                        evaluation
                            .diagnosisSelectionIndex
                };
            };
    }

        function scheduleCreatorSync() {
        window.requestAnimationFrame(
            () =>
                syncOfficialCreator(
                    true
                )
        );
    }


    window.owlInjuryDiagnosisAPI =
        Object.freeze({

            isReady:
                () =>
                    Boolean(
                        catalog
                    ),

            getMapping,

            diagnosisPool,

            sanitize

        });


    createPanel();
    loadCatalog();

    if (
        typeof injuryCreateEls !==
        "undefined"
    ) {
        injuryCreateEls
            .evaluation
            ?.addEventListener(
                "change",
                scheduleCreatorSync
            );
    }

    window.addEventListener(
        "owl-control-room-data-loaded",
        () => {
            loadCatalog();
            scheduleCreatorSync();
        }
    );
})();
