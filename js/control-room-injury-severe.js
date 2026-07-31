// =================================
// OWL SEVERE-INJURY EXTENSION
// GENERATOR + INJURY RECORD HANDOFF
// =================================


(() => {


    if (
        typeof buildInjuryEvaluationResult !==
            "function"

        ||

        typeof injuryCreateGetDraft !==
            "function"
    ) {

        console.warn(

            "The severe-injury extension could not find the Generator or Injury Record Creator."

        );


        return;

    }


    const originalInjuryCreateGetDraft =
        injuryCreateGetDraft;


    // =================================
    // SEVERE-INJURY RULES
    // =================================


    function severeGetDuration(
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


    function severeGetChampionshipAction(
        classification,
        absenceWeeks,
        championshipStatus
    ) {

        const status =
            String(
                championshipStatus || ""
            )
                .trim()
                .toLowerCase();


        const isChampion =

            status ===
                "current champion"

            ||

            status ===
                "interim champion";


        if (
            classification !==
                "SEVERE"

            ||

            !isChampion
        ) {

            return "None required";

        }


        if (
            absenceWeeks ===
            8
        ) {

            return "Interim championship optional";

        }


        if (
            absenceWeeks ===
            12
        ) {

            return "Interim championship or vacancy required";

        }


        if (
            absenceWeeks ===
            16
        ) {

            return "Championship automatically vacated";

        }


        return "Commissioner review required";

    }


    // =================================
    // REPLACE INJURY RESULT BUILDER
    // =================================


    buildInjuryEvaluationResult =
        function () {


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
                primaryRoll >=
                4

                &&

                primaryRoll <=
                6
            ) {

                absenceWeeks =
                    1;


                outcomeLabel =
                    "1 week unavailable";

            }


            else if (
                primaryRoll >=
                7

                &&

                primaryRoll <=
                9
            ) {

                absenceWeeks =
                    2;


                outcomeLabel =
                    "2 weeks unavailable";

            }


            else if (
                primaryRoll ===
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
                        severeGetDuration(
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


            const result = [

                `${wrestler.name} received a primary injury roll of ${primaryRoll} out of 10.`

            ];


            if (
                severeCheckRoll !==
                null
            ) {

                result.push(

                    `Severe-injury check: ${severeCheckRoll} out of 100.`

                );


                result.push(

                    severeCheckPassed

                        ? "The severe-injury check succeeded."

                        : "The severe-injury check did not succeed. The standard three-week result applies."

                );

            }


            if (
                severeDurationRoll !==
                null
            ) {

                result.push(

                    `Severe-duration roll: ${severeDurationRoll} out of 100.`

                );

            }


            result.push(
                outcomeLabel
            );


            result.push(
                `CRIT cause: ${critCause}`
            );


            if (
                absenceWeeks ===
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

                    primaryRoll ===
                        10

                        ? "primary-d10-severe-check"

                        : "primary-d10",

                methodLabel:

                    primaryRoll ===
                        10

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

                injuryEvaluation: {

                    wrestlerId:
                        wrestler.id,

                    wrestlerName:
                        wrestler.name,

                    critCause,

                    primaryRoll,

                    classification,

                    absenceWeeks,

                    outcomeLabel,

                    severe:
                        classification ===
                        "SEVERE",

                    severeCheckRoll,

                    severeCheckPassed,

                    severeDurationRoll,

                    postReturnLowWeeks:

                        classification ===
                            "SEVERE"

                            ? 4

                            : absenceWeeks,

                    severeReviewRequired:
                        false

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
    // EXTEND OFFICIAL INJURY DRAFT
    // =================================


    injuryCreateGetDraft =
        function () {


            const draft =
                originalInjuryCreateGetDraft();


            if (
                !draft
            ) {

                return null;

            }


            const generatorResult =
                injuryCreateGetSelectedEvaluation();


            const evaluation =
                generatorResult
                    ?.injuryEvaluation;


            if (
                !evaluation
            ) {

                return draft;

            }


            const classification =

                evaluation.classification ===
                    "SEVERE"

                    ? "SEVERE"

                    : "STANDARD";


            const absenceWeeks =
                Number(
                    evaluation.absenceWeeks ||
                    draft.absenceWeeks ||
                    0
                );


            const postReturnLowWeeks =

                classification ===
                    "SEVERE"

                    ? 4

                    : absenceWeeks;


            const requiredChampionshipAction =
                severeGetChampionshipAction(

                    classification,

                    absenceWeeks,

                    draft
                        .championshipStatusAtInjury

                );


            return {

                ...draft,

                classification,

                absenceWeeks,

                postReturnLowWeeks,

                severeCheckRoll:

                    evaluation.severeCheckRoll ??
                    null,

                severeCheckPassed:

                    evaluation.severeCheckPassed ===
                    true,

                severeDurationRoll:

                    evaluation.severeDurationRoll ??
                    null,

                requiredChampionshipAction

            };

        };


    // =================================
    // PREVIEW ENHANCEMENT
    // =================================


    function severeAppendPreviewRow(
        label,
        value
    ) {

        const list =
            injuryCreateEls
                .previewList;


        if (
            !list
        ) {

            return;

        }


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "cr-editor-change-row";


        row.dataset.severePreviewRow =
            "true";


        const labelElement =
            document.createElement(
                "strong"
            );


        labelElement.textContent =
            label;


        const valueElement =
            document.createElement(
                "span"
            );


        valueElement.textContent =
            String(
                value ?? "—"
            );


        row.append(
            labelElement,
            valueElement
        );


        list.appendChild(
            row
        );

    }


    function severeEnhancePreview() {


        const list =
            injuryCreateEls
                .previewList;


        if (
            !list
        ) {

            return;

        }


        list
            .querySelectorAll(
                '[data-severe-preview-row="true"]'
            )
            .forEach(
                row => {

                    row.remove();

                }
            );


        const draft =
            injuryCreateGetDraft();


        if (
            !draft
        ) {

            return;

        }


        severeAppendPreviewRow(

            "CLASSIFICATION",

            draft.classification

        );


        if (
            draft.severeCheckRoll !==
                null
        ) {

            severeAppendPreviewRow(

                "SEVERE CHECK",

                `${draft.severeCheckRoll} / 100`

            );

        }


        if (
            draft.severeDurationRoll !==
                null
        ) {

            severeAppendPreviewRow(

                "SEVERE DURATION ROLL",

                `${draft.severeDurationRoll} / 100`

            );

        }


        severeAppendPreviewRow(

            "CHAMPIONSHIP ACTION",

            draft.requiredChampionshipAction

        );

    }


    function severeSchedulePreviewEnhancement() {

        window.requestAnimationFrame(
            severeEnhancePreview
        );

    }


    [

        injuryCreateEls.evaluation,
        injuryCreateEls.diagnosis,
        injuryCreateEls.bodyPart,
        injuryCreateEls.priorEndurance,
        injuryCreateEls.championshipStatus,
        injuryCreateEls.startWeek,
        injuryCreateEls.returnWeek,
        injuryCreateEls.clearanceWeek,
        injuryCreateEls.eventId,
        injuryCreateEls.matchId,
        injuryCreateEls.note

    ]
        .filter(
            Boolean
        )
        .forEach(
            field => {

                field.addEventListener(

                    field.tagName ===
                        "SELECT"

                        ? "change"

                        : "input",

                    severeSchedulePreviewEnhancement

                );

            }
        );


    window.addEventListener(

        "owl-control-room-data-loaded",

        severeSchedulePreviewEnhancement

    );


})();
