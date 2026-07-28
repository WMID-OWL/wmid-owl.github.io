(function () {

    "use strict";


    // =================================
    // PAGE ELEMENTS
    // =================================


    const resultSelect =
        document.getElementById(
            "cr-proving-result-select"
        );


    const resultCount =
        document.getElementById(
            "cr-proving-result-count"
        );


    const deleteButton =
        document.getElementById(
            "cr-proving-delete-result"
        );


    const yearField =
        document.getElementById(
            "cr-proving-result-year"
        );


    const blockField =
        document.getElementById(
            "cr-proving-result-block"
        );


    const dateField =
        document.getElementById(
            "cr-proving-result-date"
        );


    const timeField =
        document.getElementById(
            "cr-proving-result-match-time"
        );


    const competitorOneField =
        document.getElementById(
            "cr-proving-result-competitor-one"
        );


    const competitorTwoField =
        document.getElementById(
            "cr-proving-result-competitor-two"
        );


    const outcomeField =
        document.getElementById(
            "cr-proving-result-outcome"
        );


    const methodField =
        document.getElementById(
            "cr-proving-result-method"
        );


    const bloodField =
        document.getElementById(
            "cr-proving-result-blood"
        );


    const pointsOneDisplay =
        document.getElementById(
            "cr-proving-result-points-one"
        );


    const pointsTwoDisplay =
        document.getElementById(
            "cr-proving-result-points-two"
        );


    const noteField =
        document.getElementById(
            "cr-proving-result-note"
        );


    const preview =
        document.getElementById(
            "cr-proving-result-preview"
        );


    const changeList =
        document.getElementById(
            "cr-proving-result-change-list"
        );


    const errorMessage =
        document.getElementById(
            "cr-proving-result-error"
        );


    const saveButton =
        document.getElementById(
            "cr-proving-result-save"
        );


    const message =
        document.getElementById(
            "cr-proving-result-message"
        );


    if (
        !resultSelect ||
        !resultCount ||
        !deleteButton ||
        !yearField ||
        !blockField ||
        !dateField ||
        !timeField ||
        !competitorOneField ||
        !competitorTwoField ||
        !outcomeField ||
        !methodField ||
        !bloodField ||
        !pointsOneDisplay ||
        !pointsTwoDisplay ||
        !noteField ||
        !preview ||
        !changeList ||
        !errorMessage ||
        !saveButton ||
        !message
    ) {

        console.warn(
            "Proving Ground Block Result Recorder HTML is incomplete."
        );


        return;

    }



    // =================================
    // DATA HELPERS
    // =================================


    function getDatabase() {


        const database =
            owlControlRoomData.provingGround;


        if (
            !database ||
            Array.isArray(
                database
            ) ||
            typeof database !==
                "object"
        ) {

            return {

                entries:
                    [],

                blockResults:
                    [],

                finals:
                    []

            };

        }


        return {

            ...database,

            entries:

                Array.isArray(
                    database.entries
                )

                    ? database.entries

                    : [],

            blockResults:

                Array.isArray(
                    database.blockResults
                )

                    ? database.blockResults

                    : [],

            finals:

                Array.isArray(
                    database.finals
                )

                    ? database.finals

                    : []

        };

    }



    function getEntryBlockId(
        entry
    ) {


        if (entry.blockId) {

            return entry.blockId;

        }


        return `${entry.brand || ""}-${entry.division || ""}`

            .toLowerCase()

            .replace(
                /[^a-z0-9]+/g,
                "-"
            )

            .replace(
                /^-+|-+$/g,
                ""
            );

    }



    function getEntryName(
        entry
    ) {


        return (

            entry?.wrestlerName ||
            entry?.name ||
            entry?.wrestlerId ||
            "Unnamed Entrant"

        );

    }



    function getEntryById(
        entryId
    ) {


        return getDatabase().entries.find(
            entry =>
                entry.id ===
                entryId
        ) || null;

    }



    function getEntriesForBlock(
        year,
        blockId
    ) {


        return getDatabase().entries

            .filter(
                entry =>

                    Number(
                        entry.year
                    ) ===
                        Number(
                            year
                        )

                    &&

                    getEntryBlockId(
                        entry
                    ) ===
                        blockId
            )

            .sort(
                (
                    entryA,
                    entryB
                ) =>

                    Number(
                        entryA.slot || 0
                    )

                    -

                    Number(
                        entryB.slot || 0
                    )
            );

    }



    function getAvailableBlocks(
        year
    ) {


        const blockMap =
            new Map();


        getDatabase().entries

            .filter(
                entry =>

                    Number(
                        entry.year
                    ) ===
                        Number(
                            year
                        )
            )

            .forEach(
                entry => {


                    const blockId =
                        getEntryBlockId(
                            entry
                        );


                    if (!blockId) {

                        return;

                    }


                    if (
                        !blockMap.has(
                            blockId
                        )
                    ) {

                        blockMap.set(
                            blockId,
                            {
                                id:
                                    blockId,

                                label:

                                    entry.blockLabel

                                    ||

                                    `${entry.brand || "—"} ${entry.division || "—"}`,

                                entries:
                                    []
                            }
                        );

                    }


                    blockMap.get(
                        blockId
                    ).entries.push(
                        entry
                    );

                }
            );


        return Array.from(
            blockMap.values()
        )

            .filter(
                block =>
                    block.entries.length >=
                        2
            )

            .sort(
                (
                    blockA,
                    blockB
                ) =>

                    blockA.label.localeCompare(
                        blockB.label
                    )
            );

    }



    // =================================
    // TIME HELPERS
    // =================================


    function parseMatchTime(
        value
    ) {


        const match =

            String(
                value || ""
            )
                .trim()
                .match(
                    /^(\d{1,3}):([0-5]\d)$/
                );


        if (!match) {

            return null;

        }


        const minutes =
            Number(
                match[1]
            );


        const seconds =
            Number(
                match[2]
            );


        return {

            minutes,

            seconds,

            totalSeconds:

                (
                    minutes *
                    60
                )

                +

                seconds,

            formatted:

                `${minutes}:${String(
                    seconds
                ).padStart(
                    2,
                    "0"
                )}`

        };

    }



    function getSpeedBonus(
        totalSeconds
    ) {


        if (
            totalSeconds <
            10 * 60
        ) {

            return {

                points:
                    3,

                label:
                    "Win Under 10 Minutes"

            };

        }


        if (
            totalSeconds <
            15 * 60
        ) {

            return {

                points:
                    2,

                label:
                    "Win Under 15 Minutes"

            };

        }


        if (
            totalSeconds <
            20 * 60
        ) {

            return {

                points:
                    1,

                label:
                    "Win Under 20 Minutes"

            };

        }


        return {

            points:
                0,

            label:
                ""

        };

    }



    // =================================
    // POINT CALCULATION
    // =================================


    function calculatePoints(
        draft
    ) {


        const result = {

            competitorOnePoints:
                0,

            competitorTwoPoints:
                0,

            competitorOneBreakdown:
                [],

            competitorTwoBreakdown:
                [],

            speedBonus:
                0,

            finishBonus:
                0,

            zeroPointWin:
                false

        };


        const competitorOneDrewBlood =

            draft.bloodBonus ===
                "competitor-one"

            ||

            draft.bloodBonus ===
                "both";


        const competitorTwoDrewBlood =

            draft.bloodBonus ===
                "competitor-two"

            ||

            draft.bloodBonus ===
                "both";


        if (
            draft.outcome ===
            "draw"
        ) {


            result.competitorOnePoints =
                1;


            result.competitorTwoPoints =
                1;


            result.competitorOneBreakdown.push(
                "Draw +1"
            );


            result.competitorTwoBreakdown.push(
                "Draw +1"
            );


            if (
                competitorOneDrewBlood
            ) {


                result.competitorOnePoints +=
                    1;


                result.competitorOneBreakdown.push(
                    "Draw Blood +1"
                );

            }


            if (
                competitorTwoDrewBlood
            ) {


                result.competitorTwoPoints +=
                    1;


                result.competitorTwoBreakdown.push(
                    "Draw Blood +1"
                );

            }


            return result;

        }


        const competitorOneWon =

            draft.outcome ===
            "competitor-one";


        const competitorTwoWon =

            draft.outcome ===
            "competitor-two";


        if (
            !competitorOneWon &&
            !competitorTwoWon
        ) {

            return result;

        }


        const zeroPointWin =

            draft.method ===
                "Count-Out"

            ||

            draft.method ===
                "Disqualification";


        result.zeroPointWin =
            zeroPointWin;


        let finishBonus =
            0;


        let finishLabel =
            "";


        if (
            draft.method ===
            "Pinfall"
        ) {

            finishBonus =
                1;


            finishLabel =
                "Pinfall Win +1";

        }


        if (
            draft.method ===
            "Submission"
        ) {

            finishBonus =
                1;


            finishLabel =
                "Submission Win +1";

        }


        if (
            draft.method ===
            "KO"
        ) {

            finishBonus =
                2;


            finishLabel =
                "KO Win +2";

        }


        result.finishBonus =
            finishBonus;


        const parsedTime =
            parseMatchTime(
                draft.matchTime
            );


        const speedBonus =

            parsedTime

                ? getSpeedBonus(
                    parsedTime.totalSeconds
                )

                : {
                    points:
                        0,

                    label:
                        ""
                };


        result.speedBonus =
            speedBonus.points;


        const winnerBreakdown =

            zeroPointWin

                ? [
                    `${draft.method} Win — 0 Total Points`
                ]

                : [
                    "Win +3"
                ];


        if (
            !zeroPointWin &&
            finishLabel
        ) {

            winnerBreakdown.push(
                finishLabel
            );

        }


        if (
            !zeroPointWin &&
            speedBonus.points
        ) {

            winnerBreakdown.push(

                `${speedBonus.label} +${speedBonus.points}`

            );

        }


        let winnerPoints =

            zeroPointWin

                ? 0

                : 3 +
                    finishBonus +
                    speedBonus.points;


        let loserPoints =
            0;


        const loserBreakdown = [
            "Loss +0"
        ];


        if (
            competitorOneWon
        ) {


            if (
                competitorOneDrewBlood &&
                !zeroPointWin
            ) {


                winnerPoints +=
                    1;


                winnerBreakdown.push(
                    "Draw Blood +1"
                );

            }


            if (
                competitorTwoDrewBlood
            ) {


                loserPoints +=
                    1;


                loserBreakdown.push(
                    "Draw Blood +1"
                );

            }


            result.competitorOnePoints =
                winnerPoints;


            result.competitorTwoPoints =
                loserPoints;


            result.competitorOneBreakdown =
                winnerBreakdown;


            result.competitorTwoBreakdown =
                loserBreakdown;


            return result;

        }


        if (
            competitorTwoDrewBlood &&
            !zeroPointWin
        ) {


            winnerPoints +=
                1;


            winnerBreakdown.push(
                "Draw Blood +1"
            );

        }


        if (
            competitorOneDrewBlood
        ) {


            loserPoints +=
                1;


            loserBreakdown.push(
                "Draw Blood +1"
            );

        }


        result.competitorOnePoints =
            loserPoints;


        result.competitorTwoPoints =
            winnerPoints;


        result.competitorOneBreakdown =
            loserBreakdown;


        result.competitorTwoBreakdown =
            winnerBreakdown;


        return result;

    }



    // =================================
    // RESULT DIRECTORY
    // =================================


    function renderResultSelect() {


        const database =
            getDatabase();


        resultSelect.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =

            database.blockResults.length

                ? "Select Block Result"

                : "No Block Results";


        resultSelect.appendChild(
            placeholder
        );


        const sortedResults = [

            ...database.blockResults

        ].sort(
            (
                resultA,
                resultB
            ) => {


                return (

                    String(
                        resultB.matchDate || ""
                    ).localeCompare(
                        String(
                            resultA.matchDate || ""
                        )
                    )

                    ||

                    String(
                        resultA.blockLabel || ""
                    ).localeCompare(
                        String(
                            resultB.blockLabel || ""
                        )
                    )

                );

            }
        );


        sortedResults.forEach(
            result => {


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    result.id;


                option.textContent =

                    `${result.year || "—"} — ${result.blockLabel || result.blockId || "—"} — ${result.competitorOneName || "—"} vs ${result.competitorTwoName || "—"}`;


                resultSelect.appendChild(
                    option
                );

            }
        );


        resultSelect.disabled =
            database.blockResults.length ===
            0;


        resultCount.textContent =
            String(
                database.blockResults.length
            );


        deleteButton.disabled =
            true;

    }



    // =================================
    // BLOCK AND COMPETITOR SELECTORS
    // =================================


    function setEmptySelect(
        select,
        label
    ) {


        select.innerHTML =
            "";


        const option =
            document.createElement(
                "option"
            );


        option.value =
            "";


        option.textContent =
            label;


        select.appendChild(
            option
        );


        select.disabled =
            true;

    }



    function populateBlocks() {


        const year =
            Number(
                yearField.value
            );


        const blocks =
            getAvailableBlocks(
                year
            );


        blockField.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =

            blocks.length

                ? "Select Tournament Block"

                : "Add at Least Two Entries to a Block";


        blockField.appendChild(
            placeholder
        );


        blocks.forEach(
            block => {


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    block.id;


                option.textContent =

                    `${block.label} — ${block.entries.length} Entrants`;


                blockField.appendChild(
                    option
                );

            }
        );


        blockField.disabled =
            blocks.length ===
            0;


        setEmptySelect(
            competitorOneField,
            "Select Tournament Block First"
        );


        setEmptySelect(
            competitorTwoField,
            "Select Tournament Block First"
        );


        renderPreview();

    }



    function populateCompetitorOne() {


        const entries =
            getEntriesForBlock(
                yearField.value,
                blockField.value
            );


        competitorOneField.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =

            entries.length

                ? "Select Competitor 1"

                : "No Entrants Available";


        competitorOneField.appendChild(
            placeholder
        );


        entries.forEach(
            entry => {


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    entry.id;


                option.textContent =

                    `Slot ${entry.slot || "—"} — ${getEntryName(
                        entry
                    )}`;


                competitorOneField.appendChild(
                    option
                );

            }
        );


        competitorOneField.disabled =
            entries.length ===
            0;

    }



    function populateCompetitorTwo() {


        const selectedOneId =
            competitorOneField.value;


        const entries =

            getEntriesForBlock(
                yearField.value,
                blockField.value
            )

                .filter(
                    entry =>
                        entry.id !==
                        selectedOneId
                );


        competitorTwoField.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =

            entries.length

                ? "Select Competitor 2"

                : "Select Competitor 1 First";


        competitorTwoField.appendChild(
            placeholder
        );


        entries.forEach(
            entry => {


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    entry.id;


                option.textContent =

                    `Slot ${entry.slot || "—"} — ${getEntryName(
                        entry
                    )}`;


                competitorTwoField.appendChild(
                    option
                );

            }
        );


        competitorTwoField.disabled =

            !selectedOneId

            ||

            entries.length ===
                0;

    }



    function populateCompetitors() {


        populateCompetitorOne();


        setEmptySelect(
            competitorTwoField,
            "Select Competitor 1 First"
        );


        renderPreview();

    }



    // =================================
    // DRAFT
    // =================================


    function createResultId(
        draft
    ) {


        const competitorIds = [

            draft.competitorOneEntryId,

            draft.competitorTwoEntryId

        ]

            .filter(
                Boolean
            )

            .sort();


        return [

            "proving-ground",

            draft.year,

            draft.blockId,

            ...competitorIds

        ]

            .join(
                "-"
            )

            .toLowerCase()

            .replace(
                /[^a-z0-9]+/g,
                "-"
            )

            .replace(
                /^-+|-+$/g,
                ""
            );

    }



    function getDraft() {


        const competitorOne =
            getEntryById(
                competitorOneField.value
            );


        const competitorTwo =
            getEntryById(
                competitorTwoField.value
            );


        const parsedTime =
            parseMatchTime(
                timeField.value
            );


        const blockEntries =
            getEntriesForBlock(
                yearField.value,
                blockField.value
            );


        const blockReference =
            blockEntries[0] || null;


        const draft = {

            year:
                Number(
                    yearField.value
                ),

            blockId:
                blockField.value,

            blockLabel:

                blockReference?.blockLabel

                ||

                (
                    blockReference

                        ? `${blockReference.brand || "—"} ${blockReference.division || "—"}`

                        : ""
                ),

            brand:
                blockReference?.brand || "",

            division:
                blockReference?.division || "",

            matchDate:
                dateField.value,

            matchTime:

                parsedTime

                    ? parsedTime.formatted

                    : timeField.value.trim(),

            matchSeconds:

                parsedTime

                    ? parsedTime.totalSeconds

                    : 0,

            competitorOneEntryId:
                competitorOne?.id || "",

            competitorOneId:
                competitorOne?.wrestlerId || "",

            competitorOneName:
                getEntryName(
                    competitorOne
                ),

            competitorTwoEntryId:
                competitorTwo?.id || "",

            competitorTwoId:
                competitorTwo?.wrestlerId || "",

            competitorTwoName:
                getEntryName(
                    competitorTwo
                ),

            outcome:
                outcomeField.value,

            method:
                methodField.value,

            bloodBonus:
                bloodField.value,

            competitorOneDrewBlood:

                bloodField.value ===
                    "competitor-one"

                ||

                bloodField.value ===
                    "both",

            competitorTwoDrewBlood:

                bloodField.value ===
                    "competitor-two"

                ||

                bloodField.value ===
                    "both",

            note:
                noteField.value.trim(),

            createdAt:
                new Date().toISOString()

        };


        if (
            draft.outcome ===
            "competitor-one"
        ) {

            draft.winnerEntryId =
                draft.competitorOneEntryId;


            draft.winnerId =
                draft.competitorOneId;


            draft.winnerName =
                draft.competitorOneName;


            draft.loserEntryId =
                draft.competitorTwoEntryId;


            draft.loserId =
                draft.competitorTwoId;


            draft.loserName =
                draft.competitorTwoName;

        }


        else if (
            draft.outcome ===
            "competitor-two"
        ) {

            draft.winnerEntryId =
                draft.competitorTwoEntryId;


            draft.winnerId =
                draft.competitorTwoId;


            draft.winnerName =
                draft.competitorTwoName;


            draft.loserEntryId =
                draft.competitorOneEntryId;


            draft.loserId =
                draft.competitorOneId;


            draft.loserName =
                draft.competitorOneName;

        }


        else {

            draft.winnerEntryId =
                "";


            draft.winnerId =
                "";


            draft.winnerName =
                "";


            draft.loserEntryId =
                "";


            draft.loserId =
                "";


            draft.loserName =
                "";

        }


        const scoring =
            calculatePoints(
                draft
            );


        draft.competitorOnePoints =
            scoring.competitorOnePoints;


        draft.competitorTwoPoints =
            scoring.competitorTwoPoints;


        draft.pointsOne =
            scoring.competitorOnePoints;


        draft.pointsTwo =
            scoring.competitorTwoPoints;


        draft.competitorOnePointBreakdown =
            scoring.competitorOneBreakdown;


        draft.competitorTwoPointBreakdown =
            scoring.competitorTwoBreakdown;


        draft.speedBonus =
            scoring.speedBonus;


        draft.finishBonus =
            scoring.finishBonus;


        draft.zeroPointWin =
            scoring.zeroPointWin;


        draft.isDraw =
            draft.outcome ===
            "draw";


        draft.id =
            createResultId(
                draft
            );


        return draft;

    }



    // =================================
    // VALIDATION
    // =================================


    function validateDraft(
        draft
    ) {


        if (
            !Number.isInteger(
                draft.year
            )

            ||

            draft.year <
                2026
        ) {

            return "Enter a valid tournament year.";

        }


        if (!draft.blockId) {

            return "Select a tournament block.";

        }


        if (!draft.matchDate) {

            return "Select the match date.";

        }


        if (
            !parseMatchTime(
                draft.matchTime
            )
        ) {

            return "Enter match time in minutes and seconds, such as 14:32.";

        }


        if (
            !draft.competitorOneEntryId
        ) {

            return "Select Competitor 1.";

        }


        if (
            !draft.competitorTwoEntryId
        ) {

            return "Select Competitor 2.";

        }


        if (
            draft.competitorOneEntryId ===
            draft.competitorTwoEntryId
        ) {

            return "A wrestler cannot face themselves.";

        }


        if (!draft.outcome) {

            return "Select the match outcome.";

        }


        if (!draft.method) {

            return "Select the finish method.";

        }


        const drawMethods = [
            "Time-Limit Draw",
            "Other Draw"
        ];


        if (
            draft.outcome ===
                "draw"

            &&

            !drawMethods.includes(
                draft.method
            )
        ) {

            return "A draw must use Time-Limit Draw or Other Draw as the finish method.";

        }


        if (
            draft.outcome !==
                "draw"

            &&

            drawMethods.includes(
                draft.method
            )
        ) {

            return "A winning result cannot use a draw finish method.";

        }


        const blockEntries =
            getEntriesForBlock(
                draft.year,
                draft.blockId
            );


        const competitorOneExists =

            blockEntries.some(
                entry =>
                    entry.id ===
                    draft.competitorOneEntryId
            );


        const competitorTwoExists =

            blockEntries.some(
                entry =>
                    entry.id ===
                    draft.competitorTwoEntryId
            );


        if (
            !competitorOneExists ||
            !competitorTwoExists
        ) {

            return "Both competitors must belong to the selected tournament block.";

        }


        const pairKey = [

            draft.competitorOneEntryId,

            draft.competitorTwoEntryId

        ]

            .sort()

            .join(
                "|"
            );


        const duplicateResult =

            getDatabase().blockResults.find(
                result => {


                    const existingPairKey = [

                        result.competitorOneEntryId,

                        result.competitorTwoEntryId

                    ]

                        .filter(
                            Boolean
                        )

                        .sort()

                        .join(
                            "|"
                        );


                    return (

                        Number(
                            result.year
                        ) ===
                            draft.year

                        &&

                        result.blockId ===
                            draft.blockId

                        &&

                        existingPairKey ===
                            pairKey

                    );

                }
            );


        if (duplicateResult) {

            return "These competitors already have a recorded block match.";

        }


        return "";

    }



    // =================================
    // PREVIEW
    // =================================


    function addReviewRow(
        label,
        value
    ) {


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "cr-editor-change-row";


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
            value || "—";


        row.append(
            labelElement,
            valueElement
        );


        changeList.appendChild(
            row
        );

    }



    function getOutcomeLabel(
        draft
    ) {


        if (
            draft.outcome ===
            "draw"
        ) {

            return "Draw";

        }


        if (
            draft.outcome ===
            "competitor-one"
        ) {

            return `${draft.competitorOneName} Wins`;

        }


        if (
            draft.outcome ===
            "competitor-two"
        ) {

            return `${draft.competitorTwoName} Wins`;

        }


        return "—";

    }



    function renderPreview() {


        const draft =
            getDraft();


        pointsOneDisplay.textContent =
            String(
                draft.competitorOnePoints
            );


        pointsTwoDisplay.textContent =
            String(
                draft.competitorTwoPoints
            );


        const formStarted =

            Boolean(
                draft.blockId ||
                draft.competitorOneEntryId ||
                draft.competitorTwoEntryId ||
                draft.outcome ||
                draft.method ||
                draft.matchTime
            );


        if (!formStarted) {


            preview.hidden =
                true;


            saveButton.disabled =
                true;


            errorMessage.hidden =
                true;


            return;

        }


        changeList.innerHTML =
            "";


        errorMessage.hidden =
            true;


        errorMessage.textContent =
            "";


        addReviewRow(
            "DATABASE ID",
            draft.id
        );


        addReviewRow(
            "BLOCK",
            draft.blockLabel
        );


        addReviewRow(
            "MATCHUP",

            `${draft.competitorOneName} vs ${draft.competitorTwoName}`
        );


        addReviewRow(
            "OUTCOME",
            getOutcomeLabel(
                draft
            )
        );


        addReviewRow(
            "METHOD",
            draft.method
        );


        addReviewRow(
            "MATCH TIME",
            draft.matchTime
        );


        addReviewRow(
            `${draft.competitorOneName} POINTS`,

            `${draft.competitorOnePoints} — ${draft.competitorOnePointBreakdown.join(" • ") || "No points"}`
        );


        addReviewRow(
            `${draft.competitorTwoName} POINTS`,

            `${draft.competitorTwoPoints} — ${draft.competitorTwoPointBreakdown.join(" • ") || "No points"}`
        );


        addReviewRow(
            "NOTE",
            draft.note
        );


        preview.hidden =
            false;


        const validationError =
            validateDraft(
                draft
            );


        if (validationError) {


            errorMessage.textContent =
                validationError;


            errorMessage.hidden =
                false;


            saveButton.disabled =
                true;


            return;

        }


        saveButton.disabled =
            false;

    }



    // =================================
    // STANDINGS REBUILD
    // =================================


    function rebuildEntryStandings(
        entries,
        results
    ) {


        const standingsMap =
            new Map();


        entries.forEach(
            entry => {


                standingsMap.set(
                    entry.id,
                    {
                        wins:
                            0,

                        losses:
                            0,

                        draws:
                            0,

                        combatPoints:
                            0,

                        points:
                            0
                    }
                );

            }
        );


        results.forEach(
            result => {


                const competitorOneStats =
                    standingsMap.get(
                        result.competitorOneEntryId
                    );


                const competitorTwoStats =
                    standingsMap.get(
                        result.competitorTwoEntryId
                    );


                if (
                    !competitorOneStats ||
                    !competitorTwoStats
                ) {

                    return;

                }


                if (
                    result.isDraw ||
                    result.outcome ===
                        "draw"
                ) {


                    competitorOneStats.draws +=
                        1;


                    competitorTwoStats.draws +=
                        1;

                }


                else {


                    const winnerStats =
                        standingsMap.get(
                            result.winnerEntryId
                        );


                    const loserStats =
                        standingsMap.get(
                            result.loserEntryId
                        );


                    if (winnerStats) {

                        winnerStats.wins +=
                            1;

                    }


                    if (loserStats) {

                        loserStats.losses +=
                            1;

                    }

                }


                competitorOneStats.combatPoints +=

                    Number(
                        result.competitorOnePoints

                        ??

                        result.pointsOne

                        ??

                        0
                    );


                competitorTwoStats.combatPoints +=

                    Number(
                        result.competitorTwoPoints

                        ??

                        result.pointsTwo

                        ??

                        0
                    );


                competitorOneStats.points =
                    competitorOneStats.combatPoints;


                competitorTwoStats.points =
                    competitorTwoStats.combatPoints;

            }
        );


        return entries.map(
            entry => {


                const standings =
                    standingsMap.get(
                        entry.id
                    );


                if (!standings) {

                    return entry;

                }


                return {

                    ...entry,

                    wins:
                        standings.wins,

                    losses:
                        standings.losses,

                    draws:
                        standings.draws,

                    matches:

                        standings.wins +
                        standings.losses +
                        standings.draws,

                    combatPoints:
                        standings.combatPoints,

                    points:
                        standings.points

                };

            }
        );

    }



    // =================================
    // MESSAGES
    // =================================


    function showMessage(
        text,
        type = "success"
    ) {


        message.textContent =
            text;


        message.className =

            `cr-save-message ${
                type === "error"

                    ? "save-error"

                    : "save-success"
            }`;


        message.hidden =
            false;

    }



    function hideMessage() {


        message.hidden =
            true;


        message.textContent =
            "";

    }



    // =================================
    // FORM RESET
    // =================================


    function resetForm() {


        yearField.value =
            String(
                new Date().getFullYear()
            );


        dateField.value =
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                );


        timeField.value =
            "";


        outcomeField.value =
            "";


        methodField.value =
            "";


        bloodField.value =
            "none";


        noteField.value =
            "";


        pointsOneDisplay.textContent =
            "0";


        pointsTwoDisplay.textContent =
            "0";


        preview.hidden =
            true;


        errorMessage.hidden =
            true;


        errorMessage.textContent =
            "";


        saveButton.disabled =
            true;


        populateBlocks();

    }



    // =================================
    // SAVE RESULT
    // =================================


    async function saveResult() {


        try {


            hideMessage();


            const draft =
                getDraft();


            const validationError =
                validateDraft(
                    draft
                );


            if (validationError) {


                showMessage(
                    validationError,
                    "error"
                );


                renderPreview();


                return;

            }


            const database =
                getDatabase();


            const updatedResults = [

                ...database.blockResults,

                draft

            ];


            const updatedEntries =

                rebuildEntryStandings(

                    database.entries,

                    updatedResults

                );


            const updatedDatabase = {

                ...database,

                updatedAt:
                    new Date().toISOString(),

                entries:
                    updatedEntries,

                blockResults:
                    updatedResults

            };


            saveButton.disabled =
                true;


            await writeControlRoomJsonFile(
                "proving-ground.json",
                updatedDatabase
            );


            await loadRepositoryData(
                owlRepositoryHandle
            );


            resetForm();


            showMessage(

                `${draft.competitorOneName} vs ${draft.competitorTwoName} was added to the ${draft.blockLabel} block results.`

            );

        }


        catch (error) {


            console.error(
                "Could not save Proving Ground block result:",
                error
            );


            showMessage(

                error.message

                ||

                "The Proving Ground block result could not be saved.",

                "error"

            );


            renderPreview();

        }

    }



    // =================================
    // DELETE RESULT
    // =================================


    async function deleteResult() {


        try {


            hideMessage();


            const database =
                getDatabase();


            const selectedResult =

                database.blockResults.find(
                    result =>
                        result.id ===
                        resultSelect.value
                );


            if (!selectedResult) {


                showMessage(
                    "Select a block result first.",
                    "error"
                );


                return;

            }


            const finalReferenceExists =

                database.finals.some(
                    finalRecord =>

                        JSON.stringify(
                            finalRecord
                        ).includes(
                            selectedResult.id
                        )
                );


            if (finalReferenceExists) {


                showMessage(
                    "This block result is already referenced by final data and cannot be deleted.",
                    "error"
                );


                return;

            }


            const confirmation =
                window.prompt(

                    `Type DELETE BLOCK RESULT to remove "${selectedResult.competitorOneName} vs ${selectedResult.competitorTwoName}".`

                );


            if (
                confirmation !==
                "DELETE BLOCK RESULT"
            ) {


                showMessage(
                    "Block result deletion cancelled.",
                    "error"
                );


                return;

            }


            deleteButton.disabled =
                true;


            const updatedResults =

                database.blockResults.filter(
                    result =>
                        result.id !==
                        selectedResult.id
                );


            const updatedEntries =

                rebuildEntryStandings(

                    database.entries,

                    updatedResults

                );


            const updatedDatabase = {

                ...database,

                updatedAt:
                    new Date().toISOString(),

                entries:
                    updatedEntries,

                blockResults:
                    updatedResults

            };


            await writeControlRoomJsonFile(
                "proving-ground.json",
                updatedDatabase
            );


            await loadRepositoryData(
                owlRepositoryHandle
            );


            showMessage(

                `${selectedResult.competitorOneName} vs ${selectedResult.competitorTwoName} was removed and the block standings were recalculated.`

            );

        }


        catch (error) {


            console.error(
                "Could not delete Proving Ground block result:",
                error
            );


            showMessage(

                error.message

                ||

                "The Proving Ground block result could not be deleted.",

                "error"

            );

        }

    }



    // =================================
    // INITIALIZE
    // =================================


    function initializeManager() {


        hideMessage();


        renderResultSelect();


        resetForm();

    }



    // =================================
    // EVENTS
    // =================================


    yearField.addEventListener(
        "input",
        populateBlocks
    );


    blockField.addEventListener(
        "change",
        populateCompetitors
    );


    competitorOneField.addEventListener(
        "change",
        () => {


            populateCompetitorTwo();


            renderPreview();

        }
    );


    competitorTwoField.addEventListener(
        "change",
        renderPreview
    );


    dateField.addEventListener(
        "change",
        renderPreview
    );


    timeField.addEventListener(
        "input",
        renderPreview
    );


    outcomeField.addEventListener(
        "change",
        renderPreview
    );


    methodField.addEventListener(
        "change",
        renderPreview
    );


    bloodField.addEventListener(
        "change",
        renderPreview
    );


    noteField.addEventListener(
        "input",
        renderPreview
    );


    resultSelect.addEventListener(
        "change",
        () => {


            deleteButton.disabled =
                !resultSelect.value;

        }
    );


    saveButton.addEventListener(
        "click",
        saveResult
    );


    deleteButton.addEventListener(
        "click",
        deleteResult
    );


    window.addEventListener(

        "owl-control-room-data-loaded",

        initializeManager

    );



    // =================================
    // SAFETY INITIALIZATION
    // =================================


    try {


        if (
            typeof owlControlRoomData !==
                "undefined"

            &&

            owlControlRoomData.provingGround
        ) {

            initializeManager();

        }

    }


    catch (error) {


        console.warn(
            "Proving Ground Block Result Recorder waiting for repository data."
        );

    }

}());
