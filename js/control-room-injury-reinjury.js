// =================================
// OWL REINJURY MECHANICS
// =================================

(() => {
    if (
        typeof buildInjuryEvaluationResult !== "function" ||
        typeof injuryCreateGetDraft !== "function" ||
        typeof injuryCreateWriteDatabase !== "function" ||
        !window.owlInjuryDiagnosisAPI
    ) {
        console.warn(
            "The reinjury extension could not find the completed injury Generator, diagnosis catalog, or Injury Record Creator."
        );
        return;
    }

    const diagnosisApi = window.owlInjuryDiagnosisAPI;
    const originalGetDraft = injuryCreateGetDraft;

    if (typeof renderGeneratorModeNote === "function") {
        renderGeneratorModeNote = function () {
            if (!generatorEls.modeNote) return;

            const modeText = generatorEls.mode?.value === "canon"
                ? "Canon mode creates a pending official result. It is not saved until Confirm Canon Result is pressed."
                : "Test mode demonstrates the generator only. Test results can never be written to official history.";

            const typeText = getGeneratorType() === "injury-evaluation"
                ? " Injury Evaluation applies the finalized standard, severe, body-mapping, diagnosis, and reinjury rules. A same-area CRIT during recovery rolls two d10s and uses the higher result; a different-area CRIT uses one normal d10."
                : "";

            generatorEls.modeNote.textContent = `${modeText}${typeText}`;
        };
    }

    let busy = false;
    let generatorNote = null;
    let creatorNote = null;
    let aggravationPanel = null;
    let aggravationList = null;

    const asArray = value => Array.isArray(value) ? value : [];
    const text = value => String(value || "").trim();

    const statusOf = injury =>
        text(
            injury?.status ||
            injury?.currentStatus
        ).toUpperCase();

    const areaOf = injury =>
        text(
            injury?.affectedBodyPart ||
            injury?.fireProBodyPart ||
            injury?.bodyArea
        ).toLowerCase();


    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    function getInjuryDatabase() {
        const database =
            owlControlRoomData
                ?.injuries;

        if (
            !database ||
            Array.isArray(database) ||
            typeof database !== "object"
        ) {
            return {
                version: 1,
                injuries: []
            };
        }

        return {
            ...database,

            version:
                Number(
                    database.version || 1
                ),

            injuries:
                asArray(
                    database.injuries
                )
        };
    }


    function getGeneratorDatabase() {
        const database =
            owlControlRoomData
                ?.generatorHistory;

        if (
            !database ||
            Array.isArray(database) ||
            typeof database !== "object"
        ) {
            return {
                results: []
            };
        }

        return {
            ...database,

            results:
                asArray(
                    database.results
                )
        };
    }


    function getRecoveringRecords(
        wrestlerId
    ) {
        return getInjuryDatabase()
            .injuries

            .filter(
                injury => (
                    injury?.wrestlerId ===
                        wrestlerId

                    &&

                    statusOf(
                        injury
                    ) ===
                        "RECOVERING"
                )
            )

            .sort(
                (
                    firstInjury,
                    secondInjury
                ) =>
                    text(
                        secondInjury.updatedAt ||
                        secondInjury.recoveryStartedAt ||
                        secondInjury.createdAt
                    ).localeCompare(
                        text(
                            firstInjury.updatedAt ||
                            firstInjury.recoveryStartedAt ||
                            firstInjury.createdAt
                        )
                    )
            );
    }


    function rollD10() {
        return generatorRandomIndex(
            10
        ) + 1;
    }


    function severeDuration(
        durationRoll
    ) {
        if (
            durationRoll <=
                60
        ) {
            return 8;
        }

        if (
            durationRoll <=
                90
        ) {
            return 12;
        }

        return 16;
    }


    function resolveOutcome(
        usedRoll
    ) {
        let classification =
            "STANDARD";

        let absenceWeeks =
            0;

        let outcomeLabel =
            "No injury absence";

        let severeCheckRoll =
            null;

        let severeCheckPassed =
            false;

        let severeDurationRoll =
            null;

        if (
            usedRoll >= 4 &&
            usedRoll <= 6
        ) {
            absenceWeeks =
                1;

            outcomeLabel =
                "1 week unavailable";
        }

        else if (
            usedRoll >= 7 &&
            usedRoll <= 9
        ) {
            absenceWeeks =
                2;

            outcomeLabel =
                "2 weeks unavailable";
        }

        else if (
            usedRoll ===
                10
        ) {
            severeCheckRoll =
                generatorRandomIndex(
                    100
                ) + 1;

            severeCheckPassed =
                severeCheckRoll >=
                    96;

            if (
                severeCheckPassed
            ) {
                classification =
                    "SEVERE";

                severeDurationRoll =
                    generatorRandomIndex(
                        100
                    ) + 1;

                absenceWeeks =
                    severeDuration(
                        severeDurationRoll
                    );

                outcomeLabel =
                    `${absenceWeeks} weeks unavailable — severe injury`;
            }

            else {
                absenceWeeks =
                    3;

                outcomeLabel =
                    "3 weeks unavailable";
            }
        }

        return {
            classification,
            absenceWeeks,
            outcomeLabel,
            severeCheckRoll,
            severeCheckPassed,
            severeDurationRoll,

            postReturnLowWeeks:
                classification === "SEVERE"
                    ? 4
                    : absenceWeeks
        };
    }


    // =================================
    // COMPLETE GENERATOR BUILDER
    // =================================


    buildInjuryEvaluationResult =
        function () {
            const wrestler =
                getSelectedInjuryWrestler();

            const critCause =
                diagnosisApi.sanitize(
                    generatorCleanText(
                        generatorEls
                            .injuryCritCause
                            ?.value
                    )
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

            const mapping =
                diagnosisApi.getMapping();

            const bodyAreaSelectionIndex =
                mapping.candidates.length === 2
                    ? generatorRandomIndex(
                        2
                    )
                    : 0;

            const selectedArea =
                mapping.candidates[
                    bodyAreaSelectionIndex
                ];

            const recoveringRecords =
                getRecoveringRecords(
                    wrestler.id
                );

            const parentInjury =
                recoveringRecords.find(
                    injury =>
                        areaOf(
                            injury
                        ) ===
                        selectedArea
                            .fireProArea
                            .toLowerCase()
                )

                ||

                null;

            const reinjuryType =
                parentInjury
                    ? "SAME_AREA"
                    : recoveringRecords.length
                        ? "DIFFERENT_AREA"
                        : "NONE";

            const firstRoll =
                rollD10();

            const secondRoll =
                reinjuryType ===
                    "SAME_AREA"

                    ? rollD10()

                    : null;

            const usedRoll =
                secondRoll ===
                    null

                    ? firstRoll

                    : Math.max(
                        firstRoll,
                        secondRoll
                    );

            const outcome =
                resolveOutcome(
                    usedRoll
                );

            const aggravationOnly =
                reinjuryType ===
                    "SAME_AREA"

                &&

                outcome.absenceWeeks ===
                    0;

            const diagnosisPool =
                outcome.absenceWeeks > 0

                    ? diagnosisApi.diagnosisPool(
                        selectedArea.fireProArea,
                        selectedArea.anatomicalSubArea,
                        outcome.absenceWeeks
                    )

                    : [];

            if (
                outcome.absenceWeeks > 0 &&
                diagnosisPool.length === 0
            ) {
                throw new Error(
                    `No approved ${outcome.absenceWeeks}-week diagnosis exists for ${selectedArea.label}.`
                );
            }

            const diagnosisSelectionIndex =
                diagnosisPool.length
                    ? generatorRandomIndex(
                        diagnosisPool.length
                    )
                    : null;

            const diagnosis =
                diagnosisSelectionIndex ===
                    null

                    ? ""

                    : diagnosisPool[
                        diagnosisSelectionIndex
                    ];

            const result =
                [];

            if (
                reinjuryType ===
                    "SAME_AREA"
            ) {
                result.push(
                    `${wrestler.name} received same-area reinjury rolls of ${firstRoll} and ${secondRoll} out of 10.`
                );

                result.push(
                    `The higher result, ${usedRoll}, is the official injury roll.`
                );
            }

            else {
                result.push(
                    `${wrestler.name} received a primary injury roll of ${usedRoll} out of 10.`
                );
            }

            if (
                outcome.severeCheckRoll !==
                    null
            ) {
                result.push(
                    `Severe-injury check: ${outcome.severeCheckRoll} out of 100.`
                );

                result.push(
                    outcome.severeCheckPassed
                        ? "The severe-injury check succeeded."
                        : "The severe-injury check did not succeed. The standard three-week result applies."
                );
            }

            if (
                outcome.severeDurationRoll !==
                    null
            ) {
                result.push(
                    `Severe-duration roll: ${outcome.severeDurationRoll} out of 100.`
                );
            }

            result.push(
                aggravationOnly
                    ? "No new absence. Add one week to the existing Low-endurance recovery period, capped at four weeks."
                    : outcome.outcomeLabel
            );

            result.push(
                `CRIT cause: ${critCause}`
            );

            result.push(
                `CRIT determination: ${mapping.methodLabel}.`
            );

            if (
                mapping.candidates.length ===
                    2
            ) {
                result.push(
                    `Equal-area pool: ${mapping.candidates
                        .map(
                            item =>
                                item.label
                        )
                        .join(" / ")}.`
                );

                result.push(
                    `50/50 selected: ${selectedArea.label}.`
                );
            }

            else {
                result.push(
                    `Affected area: ${selectedArea.label}.`
                );
            }

            if (
                reinjuryType ===
                    "SAME_AREA"
            ) {
                result.push(
                    `Same-area reinjury detected. Parent injury: ${parentInjury.id}.`
                );
            }

            else if (
                reinjuryType ===
                    "DIFFERENT_AREA"
            ) {
                result.push(
                    "Different-area reinjury detected. Existing recovering areas continue on their own timelines."
                );
            }

            result.push(
                diagnosis
                    ? `Diagnosis: ${diagnosis}.`
                    : aggravationOnly
                        ? "No new diagnosis is created for an aggravation without a new absence."
                        : "No diagnosis was generated because the roll produced no absence."
            );

            if (
                aggravationOnly
            ) {
                result.push(
                    "After canon confirmation, apply the Low-endurance extension from the Injury Tracker."
                );
            }

            else if (
                outcome.absenceWeeks >
                    0
            ) {
                result.push(
                    "This result may be transferred into the Injury Tracker after canon confirmation."
                );
            }

            else {
                result.push(
                    "No injury record or tracker action should be created from this evaluation."
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
                    reinjuryType === "SAME_AREA"
                        ? "same-area-reinjury-higher-of-two-d10"
                        : usedRoll === 10
                            ? "primary-d10-severe-check"
                            : "primary-d10",

                methodLabel:
                    reinjuryType === "SAME_AREA"
                        ? "Same-Area Reinjury — Higher of Two d10s"
                        : usedRoll === 10
                            ? "Primary Injury d10 + Severe Check"
                            : "Primary Injury d10",

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

                eligiblePool: [
                    wrestler.name
                ],

                excludedEntries:
                    [],

                randomDecisions: [
                    {
                        type:
                            reinjuryType === "SAME_AREA"
                                ? "same-area-reinjury-rolls"
                                : "primary-injury-roll",

                        eligiblePool:
                            reinjuryType === "SAME_AREA"
                                ? [
                                    firstRoll,
                                    secondRoll
                                ]
                                : [
                                    firstRoll
                                ],

                        selectedResult:
                            usedRoll
                    },

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

                        selectedIndex:
                            bodyAreaSelectionIndex,

                        selectedResult:
                            selectedArea.label
                    },

                    ...(
                        diagnosis
                            ? [
                                {
                                    type:
                                        "injury-diagnosis",

                                    eligiblePool:
                                        diagnosisPool,

                                    selectedIndex:
                                        diagnosisSelectionIndex,

                                    selectedResult:
                                        diagnosis
                                }
                            ]
                            : []
                    )
                ],

                injuryEvaluation: {
                    wrestlerId:
                        wrestler.id,

                    wrestlerName:
                        wrestler.name,

                    critCause,

                    primaryRoll:
                        usedRoll,

                    firstReinjuryRoll:
                        reinjuryType === "SAME_AREA"
                            ? firstRoll
                            : null,

                    secondReinjuryRoll:
                        secondRoll,

                    usedReinjuryResult:
                        reinjuryType === "SAME_AREA"
                            ? usedRoll
                            : null,

                    reinjuryType,

                    parentInjuryId:
                        parentInjury?.id ||
                        "",

                    relatedRecoveringInjuryIds:
                        recoveringRecords.map(
                            injury =>
                                injury.id
                        ),

                    aggravationOnly,

                    lowEnduranceExtensionWeeks:
                        aggravationOnly
                            ? 1
                            : 0,

                    classification:
                        outcome.classification,

                    absenceWeeks:
                        outcome.absenceWeeks,

                    outcomeLabel:
                        aggravationOnly
                            ? "No new absence — Low recovery extended by one week"
                            : outcome.outcomeLabel,

                    severe:
                        outcome.classification ===
                            "SEVERE",

                    severeCheckRoll:
                        outcome.severeCheckRoll,

                    severeCheckPassed:
                        outcome.severeCheckPassed,

                    severeDurationRoll:
                        outcome.severeDurationRoll,

                    postReturnLowWeeks:
                        outcome.postReturnLowWeeks,

                    severeReviewRequired:
                        false,

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

                    bodyAreaSelectionIndex,

                    affectedBodyPart:
                        selectedArea.fireProArea,

                    fireProBodyPart:
                        selectedArea.fireProArea,

                    specificAnatomicalSubArea:
                        selectedArea.anatomicalSubArea,

                    anatomicalSubArea:
                        selectedArea.anatomicalSubArea,

                    diagnosisPool,

                    diagnosisSelectionIndex,

                    diagnosis
                },

                generatedAt:
                    new Date().toISOString(),

                confirmed:
                    false,

                confirmedAt:
                    null
            };
        };


    // =================================
    // GENERATOR NOTICE
    // =================================


    function ensureGeneratorNote() {
        if (
            generatorNote
        ) {
            return;
        }

        const mappingPanel =
            document.getElementById(
                "cr-generator-injury-mapping"
            );

        if (
            !mappingPanel
        ) {
            return;
        }

        generatorNote =
            document.createElement(
                "p"
            );

        generatorNote.id =
            "cr-generator-reinjury-note";

        generatorNote.className =
            "cr-reinjury-note";

        generatorNote.hidden =
            true;

        mappingPanel.insertAdjacentElement(
            "afterend",
            generatorNote
        );
    }


    function selectedCandidateAreas() {
        const method =
            document.getElementById(
                "cr-generator-injury-determination"
            )?.value;

        return [
            document.getElementById(
                "cr-generator-injury-first-area"
            )?.value,

            ...(
                method ===
                    "ambiguous-50-50"

                    ? [
                        document.getElementById(
                            "cr-generator-injury-second-area"
                        )?.value
                    ]

                    : []
            )
        ]
            .map(
                value =>
                    text(
                        value
                    )
                        .split("::")[0]
                        .toLowerCase()
            )
            .filter(
                Boolean
            );
    }


    function renderGeneratorNote() {
        ensureGeneratorNote();

        if (
            !generatorNote
        ) {
            return;
        }

        const wrestler =
            getSelectedInjuryWrestler();

        if (
            !wrestler
        ) {
            generatorNote.hidden =
                true;

            return;
        }

        const recovering =
            getRecoveringRecords(
                wrestler.id
            );

        if (
            !recovering.length
        ) {
            generatorNote.hidden =
                true;

            return;
        }

        const recoveringAreas = [
            ...new Set(
                recovering.map(
                    areaOf
                )
            )
        ];

        const sameAreaPossible =
            selectedCandidateAreas()
                .some(
                    area =>
                        recoveringAreas.includes(
                            area
                        )
                );

        generatorNote.hidden =
            false;

        generatorNote.textContent =
            sameAreaPossible
                ? `${wrestler.name} is already RECOVERING in a selected Fire Pro area. If that area is the final result, the Generator will roll two d10s and use the higher roll.`
                : `${wrestler.name} has another area currently RECOVERING. This evaluation will use the normal single d10 and preserve the existing recovery timeline independently.`;
    }


    // =================================
    // OFFICIAL DRAFT EXTENSION
    // =================================


    injuryCreateGetDraft =
        function () {
            const draft =
                originalGetDraft();

            const evaluation =
                injuryCreateGetSelectedEvaluation()
                    ?.injuryEvaluation;

            if (
                !draft ||
                !evaluation
            ) {
                return draft;
            }

            const sameArea =
                evaluation.reinjuryType ===
                    "SAME_AREA";

            return {
                ...draft,

                parentInjuryId:
                    evaluation.parentInjuryId ||
                    "",

                reinjuryType:
                    evaluation.reinjuryType ||
                    "NONE",

                firstReinjuryRoll:
                    evaluation.firstReinjuryRoll ??
                    null,

                secondReinjuryRoll:
                    evaluation.secondReinjuryRoll ??
                    null,

                usedReinjuryResult:
                    evaluation.usedReinjuryResult ??
                    null,

                lowEnduranceExtensionWeeks:
                    Number(
                        evaluation.lowEnduranceExtensionWeeks ||
                        0
                    ),

                relatedRecoveringInjuryIds:
                    asArray(
                        evaluation.relatedRecoveringInjuryIds
                    ),

                recoveryTimelineReset:
                    sameArea &&
                    Number(
                        evaluation.absenceWeeks ||
                        0
                    ) > 0,

                priorEnduranceState:
                    sameArea
                        ? "Low"
                        : draft.priorEnduranceState,

                currentEnduranceState:
                    sameArea
                        ? "Low"
                        : draft.currentEnduranceState
            };
        };


    function ensureCreatorNote() {
        if (
            creatorNote
        ) {
            return;
        }

        const priorField =
            injuryCreateEls
                .priorEndurance
                ?.closest(
                    ".cr-form-group"
                );

        if (
            !priorField
        ) {
            return;
        }

        creatorNote =
            document.createElement(
                "p"
            );

        creatorNote.id =
            "cr-injury-reinjury-creator-note";

        creatorNote.className =
            "cr-reinjury-note";

        creatorNote.hidden =
            true;

        priorField.insertAdjacentElement(
            "afterend",
            creatorNote
        );
    }


    function syncCreator() {
        ensureCreatorNote();

        const evaluation =
            injuryCreateGetSelectedEvaluation()
                ?.injuryEvaluation;

        const sameArea =
            evaluation?.reinjuryType ===
                "SAME_AREA";

        if (
            injuryCreateEls.priorEndurance
        ) {
            injuryCreateEls.priorEndurance.disabled =
                Boolean(
                    sameArea
                );

            if (
                sameArea
            ) {
                injuryCreateEls.priorEndurance.value =
                    "Low";
            }
        }

        if (
            !creatorNote
        ) {
            return;
        }

        if (
            !evaluation ||
            evaluation.reinjuryType ===
                "NONE"
        ) {
            creatorNote.hidden =
                true;

            return;
        }

        creatorNote.hidden =
            false;

        creatorNote.textContent =
            sameArea
                ? `Same-area reinjury: rolls ${evaluation.firstReinjuryRoll} and ${evaluation.secondReinjuryRoll}; result ${evaluation.usedReinjuryResult}. Prior endurance is locked at Low. Saving the new absence will preserve the earlier recovery timeline as SUPERSEDED and link the new injury record to it.`
                : "Different-area reinjury: this creates an independent injury record. Every existing recovering area keeps its own status and clearance timeline.";

        window.requestAnimationFrame(
            injuryCreateRenderPreview
        );
    }


    // =================================
    // SAME-AREA NEW ABSENCE SAVE
    // =================================


    async function saveSameAreaAbsence(
        event
    ) {
        const evaluation =
            injuryCreateGetSelectedEvaluation()
                ?.injuryEvaluation;

        if (
            evaluation?.reinjuryType !==
                "SAME_AREA"

            ||

            Number(
                evaluation.absenceWeeks ||
                0
            ) <= 0
        ) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        if (
            busy
        ) {
            return;
        }

        const draft =
            injuryCreateGetDraft();

        const validationError =
            injuryCreateValidateDraft(
                draft
            );

        if (
            validationError
        ) {
            injuryCreateSetMessage(
                validationError,
                "error"
            );

            return;
        }

        const database =
            getInjuryDatabase();

        const parentInjury =
            database.injuries.find(
                injury =>
                    injury?.id ===
                        draft.parentInjuryId
            );

        if (
            !parentInjury ||
            statusOf(
                parentInjury
            ) !==
                "RECOVERING"
        ) {
            injuryCreateSetMessage(
                "The parent recovery record is no longer active. Regenerate the injury evaluation before creating this record.",
                "error"
            );

            return;
        }

        const approved =
            window.confirm(
                `Create a new same-area INJURED record for ${draft.wrestlerName}?\n\n` +
                `The existing ${draft.affectedBodyPart} recovery record will be preserved in history as SUPERSEDED, and the new recovery timeline will replace it.`
            );

        if (
            !approved
        ) {
            return;
        }

        busy =
            true;

        injuryCreateEls.save.disabled =
            true;

        try {
            const now =
                new Date().toISOString();

            const officialDraft = {
                ...draft,

                status:
                    "INJURED",

                currentStatus:
                    "INJURED",

                priorEnduranceState:
                    "Low",

                currentEnduranceState:
                    "Low",

                parentInjuryId:
                    parentInjury.id,

                recoveryTimelineReset:
                    true,

                createdAt:
                    now,

                updatedAt:
                    now
            };

            const supersededParent = {
                ...parentInjury,

                status:
                    "SUPERSEDED",

                currentStatus:
                    "SUPERSEDED",

                supersededByInjuryId:
                    officialDraft.id,

                supersededAt:
                    now,

                reinjuredAt:
                    now,

                updatedAt:
                    now
            };

            const updatedDatabase = {
                ...database,

                version:
                    Number(
                        database.version || 1
                    ),

                injuries: [
                    officialDraft,

                    ...database.injuries
                        .filter(
                            injury =>
                                injury.id !==
                                    officialDraft.id
                        )
                        .map(
                            injury =>
                                injury.id ===
                                    parentInjury.id

                                    ? supersededParent

                                    : injury
                        )
                ]
            };

            await injuryCreateWriteDatabase(
                updatedDatabase
            );

            owlControlRoomData.injuries =
                updatedDatabase;

            window.dispatchEvent(
                new CustomEvent(
                    "owl-injuries-updated"
                )
            );

            injuryCreateEls.evaluation.value =
                "";

            injuryCreateResetForm();
            injuryCreatePopulateEvaluations();
            syncCreator();

            injuryCreateSetMessage(
                `${officialDraft.wrestlerName} is now INJURED again. The earlier ${officialDraft.affectedBodyPart} recovery record was preserved as SUPERSEDED.`
            );
        }

        catch (
            error
        ) {
            console.error(
                "Could not create same-area reinjury record:",
                error
            );

            injuryCreateSetMessage(
                error.message ||
                "Could not save the reinjury record.",
                "error"
            );

            injuryCreateRenderPreview();
        }

        finally {
            busy =
                false;
        }
    }


    // =================================
    // AGGRAVATION WITHOUT NEW ABSENCE
    // =================================


    function usedAggravationIds(
        injuries
    ) {
        return new Set(
            injuries
                .flatMap(
                    injury =>
                        asArray(
                            injury?.reinjuryHistory
                        )
                )
                .map(
                    entry =>
                        entry?.generatorResultId
                )
                .filter(
                    Boolean
                )
        );
    }


    function pendingAggravations() {
        const database =
            getInjuryDatabase();

        const usedIds =
            usedAggravationIds(
                database.injuries
            );

        return getGeneratorDatabase()
            .results

            .filter(
                result => {
                    const evaluation =
                        result?.injuryEvaluation;

                    return Boolean(
                        result?.confirmed ===
                            true

                        &&

                        result.generatorKey ===
                            "injury-evaluation"

                        &&

                        evaluation?.reinjuryType ===
                            "SAME_AREA"

                        &&

                        evaluation.aggravationOnly ===
                            true

                        &&

                        evaluation.parentInjuryId

                        &&

                        !usedIds.has(
                            result.id
                        )
                    );
                }
            )

            .sort(
                (
                    firstResult,
                    secondResult
                ) =>
                    text(
                        secondResult.confirmedAt ||
                        secondResult.generatedAt
                    ).localeCompare(
                        text(
                            firstResult.confirmedAt ||
                            firstResult.generatedAt
                        )
                    )
            );
    }


    function ensureAggravationPanel() {
        if (
            aggravationPanel
        ) {
            return;
        }

        const pendingList =
            injuryTrackerEls
                ?.pendingList;

        if (
            !pendingList
        ) {
            return;
        }

        aggravationPanel =
            document.createElement(
                "section"
            );

        aggravationPanel.id =
            "cr-injury-aggravation-panel";

        aggravationPanel.className =
            "cr-reinjury-action-panel";

        aggravationPanel.hidden =
            true;

        aggravationPanel.innerHTML = `
            <div class="cr-editor-section-heading">
                <span>
                    SAME-AREA REINJURY
                </span>

                <h3>
                    Pending Recovery Extensions
                </h3>
            </div>

            <p class="cr-editor-note">
                These confirmed canon results create no new absence. Apply the one-week Low-endurance extension to the existing recovery record.
            </p>

            <div
                id="cr-injury-aggravation-list"
                class="cr-reinjury-action-list"
            >
            </div>
        `;

        pendingList.insertAdjacentElement(
            "afterend",
            aggravationPanel
        );

        aggravationList =
            aggravationPanel.querySelector(
                "#cr-injury-aggravation-list"
            );

        aggravationList?.addEventListener(
            "click",
            handleAggravationClick
        );
    }


    function renderAggravations() {
        ensureAggravationPanel();

        if (
            !aggravationPanel ||
            !aggravationList
        ) {
            return;
        }

        const pending =
            pendingAggravations();

        const database =
            getInjuryDatabase();

        aggravationPanel.hidden =
            pending.length ===
                0;

        aggravationList.innerHTML =
            "";

        pending.forEach(
            result => {
                const evaluation =
                    result.injuryEvaluation;

                const parentInjury =
                    database.injuries.find(
                        injury =>
                            injury?.id ===
                                evaluation.parentInjuryId
                    );

                const currentLowWeeks =
                    Number(
                        parentInjury?.postReturnLowWeeks ||
                        0
                    );

                const revisedLowWeeks =
                    Math.min(
                        4,
                        currentLowWeeks + 1
                    );

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "cr-injury-card cr-reinjury-action-card";

                card.dataset.generatorResultId =
                    result.id;

                card.innerHTML = `
                    <div class="cr-injury-card-heading">
                        <div>
                            <span>
                                RECOVERY AGGRAVATION
                            </span>

                            <h4>
                                ${escapeHtml(
                                    evaluation.wrestlerName ||
                                    evaluation.wrestlerId
                                )}
                            </h4>
                        </div>

                        <strong class="cr-injury-status-badge cr-injury-status-recovering">
                            ACTION REQUIRED
                        </strong>
                    </div>

                    <div class="cr-injury-detail-grid">
                        <div>
                            <span>
                                AFFECTED AREA
                            </span>

                            <strong>
                                ${escapeHtml(
                                    evaluation.affectedBodyPart
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                REINJURY ROLLS
                            </span>

                            <strong>
                                ${escapeHtml(
                                    evaluation.firstReinjuryRoll
                                )}
                                and
                                ${escapeHtml(
                                    evaluation.secondReinjuryRoll
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                USED RESULT
                            </span>

                            <strong>
                                ${escapeHtml(
                                    evaluation.usedReinjuryResult
                                )} / 10
                            </strong>
                        </div>

                        <div>
                            <span>
                                LOW PERIOD
                            </span>

                            <strong>
                                ${currentLowWeeks}
                                →
                                ${revisedLowWeeks}
                                week(s)
                            </strong>
                        </div>
                    </div>

                    <div class="cr-reinjury-action-form">
                        <div class="cr-form-group">
                            <label>
                                REVISED EXPECTED CLEARANCE WEEK
                            </label>

                            <input
                                type="text"
                                data-reinjury-clearance-week
                                autocomplete="off"
                                placeholder="Example: August 2027 — Week 3"
                                value="${escapeHtml(
                                    parentInjury?.expectedClearanceWeek ||
                                    ""
                                )}"
                            >
                        </div>

                        <button
                            class="control-room-button control-room-button-primary"
                            type="button"
                            data-apply-reinjury-aggravation
                            data-generator-result-id="${escapeHtml(
                                result.id
                            )}"
                        >
                            Apply Recovery Extension
                        </button>
                    </div>
                `;

                aggravationList.appendChild(
                    card
                );
            }
        );

        const basePending =
            typeof getPendingInjuryEvaluations ===
                "function"

                ? getPendingInjuryEvaluations(
                    database.injuries
                ).length

                : 0;

        if (
            injuryTrackerEls?.pendingCount
        ) {
            injuryTrackerEls.pendingCount.textContent =
                basePending +
                pending.length;
        }
    }


    async function applyAggravation(
        generatorResultId,
        card
    ) {
        if (
            busy
        ) {
            return;
        }

        const result =
            pendingAggravations()
                .find(
                    candidate =>
                        candidate.id ===
                            generatorResultId
                );

        const evaluation =
            result?.injuryEvaluation;

        if (
            !result ||
            !evaluation
        ) {
            injuryActionSetMessage(
                "The selected aggravation result is no longer pending.",
                "error"
            );

            renderAll();

            return;
        }

        const database =
            getInjuryDatabase();

        const parentInjury =
            database.injuries.find(
                injury =>
                    injury?.id ===
                        evaluation.parentInjuryId
            );

        if (
            !parentInjury ||
            statusOf(
                parentInjury
            ) !==
                "RECOVERING"
        ) {
            injuryActionSetMessage(
                "The parent recovery record is no longer active. This aggravation cannot be applied.",
                "error"
            );

            return;
        }

        const clearanceWeek =
            text(
                card.querySelector(
                    "[data-reinjury-clearance-week]"
                )?.value
            );

        if (
            !clearanceWeek
        ) {
            injuryActionSetMessage(
                "Enter the revised expected clearance week before applying the recovery extension.",
                "error"
            );

            return;
        }

        const currentLowWeeks =
            Number(
                parentInjury.postReturnLowWeeks ||
                0
            );

        const revisedLowWeeks =
            Math.min(
                4,
                currentLowWeeks + 1
            );

        const approved =
            window.confirm(
                `Apply the same-area aggravation to ${parentInjury.wrestlerName || evaluation.wrestlerName}?\n\n` +
                `Low-endurance recovery: ${currentLowWeeks} → ${revisedLowWeeks} week(s)\n` +
                `Revised clearance: ${clearanceWeek}\n\n` +
                "No new absence or injury record will be created."
            );

        if (
            !approved
        ) {
            return;
        }

        busy =
            true;

        const button =
            card.querySelector(
                "[data-apply-reinjury-aggravation]"
            );

        if (
            button
        ) {
            button.disabled =
                true;
        }

        try {
            const now =
                new Date().toISOString();

            const updatedParent = {
                ...parentInjury,

                postReturnLowWeeks:
                    revisedLowWeeks,

                expectedClearanceWeek:
                    clearanceWeek,

                reinjuryHistory: [
                    ...asArray(
                        parentInjury.reinjuryHistory
                    ),

                    {
                        generatorResultId:
                            result.id,

                        reinjuryType:
                            "SAME_AREA_AGGRAVATION",

                        firstReinjuryRoll:
                            evaluation.firstReinjuryRoll,

                        secondReinjuryRoll:
                            evaluation.secondReinjuryRoll,

                        usedReinjuryResult:
                            evaluation.usedReinjuryResult,

                        lowEnduranceExtensionWeeks:
                            Math.max(
                                0,
                                revisedLowWeeks -
                                currentLowWeeks
                            ),

                        previousLowWeeks:
                            currentLowWeeks,

                        revisedLowWeeks,

                        previousExpectedClearanceWeek:
                            parentInjury.expectedClearanceWeek ||
                            "",

                        revisedExpectedClearanceWeek:
                            clearanceWeek,

                        appliedAt:
                            now
                    }
                ],

                updatedAt:
                    now
            };

            const updatedDatabase = {
                ...database,

                injuries:
                    database.injuries.map(
                        injury =>
                            injury.id ===
                                parentInjury.id

                                ? updatedParent

                                : injury
                    )
            };

            await injuryCreateWriteDatabase(
                updatedDatabase
            );

            owlControlRoomData.injuries =
                updatedDatabase;

            window.dispatchEvent(
                new CustomEvent(
                    "owl-injuries-updated"
                )
            );

            injuryActionSetMessage(
                revisedLowWeeks > currentLowWeeks
                    ? `${updatedParent.wrestlerName} remains RECOVERING. The ${updatedParent.affectedBodyPart} Low-endurance period is now ${revisedLowWeeks} weeks.`
                    : `${updatedParent.wrestlerName} remains RECOVERING. The ${updatedParent.affectedBodyPart} Low-endurance period remains capped at four weeks, and the revised clearance week was saved.`
            );
        }

        catch (
            error
        ) {
            console.error(
                "Could not apply reinjury aggravation:",
                error
            );

            injuryActionSetMessage(
                error.message ||
                "Could not update the recovery record.",
                "error"
            );

            if (
                button
            ) {
                button.disabled =
                    false;
            }
        }

        finally {
            busy =
                false;
        }
    }


    function handleAggravationClick(
        event
    ) {
        const button =
            event.target.closest(
                "[data-apply-reinjury-aggravation][data-generator-result-id]"
            );

        if (
            !button
        ) {
            return;
        }

        applyAggravation(
            button.dataset.generatorResultId,

            button.closest(
                ".cr-reinjury-action-card"
            )
        );
    }


    // =================================
    // SUPERSEDED HISTORY
    // =================================


    function renderSupersededHistory() {
        const container =
            injuryTrackerEls
                ?.clearedList;

        if (
            !container ||
            typeof renderInjuryRecordCard !==
                "function"
        ) {
            return;
        }

        container
            .querySelectorAll(
                '[data-reinjury-superseded-card="true"]'
            )
            .forEach(
                card =>
                    card.remove()
            );

        const superseded =
            getInjuryDatabase()
                .injuries
                .filter(
                    injury =>
                        statusOf(
                            injury
                        ) ===
                            "SUPERSEDED"
                );

        if (
            !superseded.length
        ) {
            return;
        }

        container
            .querySelector(
                ".cr-injury-empty"
            )
            ?.remove();

        superseded.forEach(
            injury => {
                const card =
                    renderInjuryRecordCard(
                        injury
                    );

                card.dataset.reinjurySupersededCard =
                    "true";

                card.classList.add(
                    "is-superseded"
                );

                const note =
                    document.createElement(
                        "div"
                    );

                note.className =
                    "cr-reinjury-history-note";

                note.textContent =
                    `This recovery timeline was replaced by linked injury ${injury.supersededByInjuryId || "—"}.`;

                card.appendChild(
                    note
                );

                container.appendChild(
                    card
                );
            }
        );
    }


    function renderAll() {
        renderGeneratorNote();
        syncCreator();
        renderAggravations();
        renderSupersededHistory();
    }


    generatorEls.injuryWrestler
        ?.addEventListener(
            "change",
            renderGeneratorNote
        );


    document.getElementById(
        "cr-generator-injury-mapping"
    )?.addEventListener(
        "change",
        renderGeneratorNote
    );


    injuryCreateEls.evaluation
        ?.addEventListener(
            "change",
            () =>
                window.requestAnimationFrame(
                    syncCreator
                )
        );


    injuryCreateEls.save
        ?.addEventListener(
            "click",
            saveSameAreaAbsence,
            true
        );


    window.addEventListener(
        "owl-control-room-data-loaded",
        () =>
            window.requestAnimationFrame(
                renderAll
            )
    );


    window.addEventListener(
        "owl-injuries-updated",
        () =>
            window.requestAnimationFrame(
                renderAll
            )
    );


    ensureGeneratorNote();
    ensureCreatorNote();
})();
