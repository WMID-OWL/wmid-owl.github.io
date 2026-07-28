(function () {

    "use strict";


    // =================================
    // PAGE ELEMENTS
    // =================================


    const finalSelect =
        document.getElementById(
            "cr-proving-final-select"
        );


    const finalCount =
        document.getElementById(
            "cr-proving-final-count"
        );


    const deleteButton =
        document.getElementById(
            "cr-proving-delete-final"
        );


    const yearField =
        document.getElementById(
            "cr-proving-final-year"
        );


    const blockField =
        document.getElementById(
            "cr-proving-final-block"
        );


    const dateField =
        document.getElementById(
            "cr-proving-final-date"
        );


    const timeField =
        document.getElementById(
            "cr-proving-final-match-time"
        );


    const finalistOneField =
        document.getElementById(
            "cr-proving-finalist-one"
        );


    const finalistTwoField =
        document.getElementById(
            "cr-proving-finalist-two"
        );


    const winnerField =
        document.getElementById(
            "cr-proving-final-winner"
        );


    const methodField =
        document.getElementById(
            "cr-proving-final-method"
        );


    const trophyWinnerDisplay =
        document.getElementById(
            "cr-proving-final-trophy-winner"
        );


    const titleShotDisplay =
        document.getElementById(
            "cr-proving-final-title-shot"
        );


    const noteField =
        document.getElementById(
            "cr-proving-final-note"
        );


    const preview =
        document.getElementById(
            "cr-proving-final-preview"
        );


    const changeList =
        document.getElementById(
            "cr-proving-final-change-list"
        );


    const errorMessage =
        document.getElementById(
            "cr-proving-final-error"
        );


    const saveButton =
        document.getElementById(
            "cr-proving-final-save"
        );


    const message =
        document.getElementById(
            "cr-proving-final-message"
        );


    if (
        !finalSelect ||
        !finalCount ||
        !deleteButton ||
        !yearField ||
        !blockField ||
        !dateField ||
        !timeField ||
        !finalistOneField ||
        !finalistTwoField ||
        !winnerField ||
        !methodField ||
        !trophyWinnerDisplay ||
        !titleShotDisplay ||
        !noteField ||
        !preview ||
        !changeList ||
        !errorMessage ||
        !saveButton ||
        !message
    ) {

        console.warn(
            "Proving Ground Final Recorder HTML is incomplete."
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


        if (entry?.blockId) {

            return entry.blockId;

        }


        return `${entry?.brand || ""}-${entry?.division || ""}`

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


        if (!entry) {

            return "";

        }


        return (

            entry.wrestlerName ||
            entry.name ||
            entry.wrestlerId ||
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



    function getResultsForBlock(
        year,
        blockId
    ) {


        return getDatabase().blockResults

            .filter(
                result =>

                    Number(
                        result.year
                    ) ===
                        Number(
                            year
                        )

                    &&

                    result.blockId ===
                        blockId
            );

    }



    function getPairKey(
        entryOneId,
        entryTwoId
    ) {


        return [

            entryOneId,
            entryTwoId

        ]

            .filter(
                Boolean
            )

            .sort()

            .join(
                "|"
            );

    }



    function getExpectedPairKeys(
        entries
    ) {


        const pairKeys =
            [];


        for (
            let firstIndex = 0;
            firstIndex < entries.length;
            firstIndex += 1
        ) {


            for (
                let secondIndex = firstIndex + 1;
                secondIndex < entries.length;
                secondIndex += 1
            ) {


                pairKeys.push(

                    getPairKey(
                        entries[firstIndex].id,
                        entries[secondIndex].id
                    )

                );

            }

        }


        return pairKeys;

    }



    function sortStandings(
        entries
    ) {


        return [

            ...entries

        ].sort(
            (
                entryA,
                entryB
            ) => {


                return (

                    Number(
                        entryB.combatPoints ??
                        entryB.points ??
                        0
                    )

                    -

                    Number(
                        entryA.combatPoints ??
                        entryA.points ??
                        0
                    )

                    ||

                    Number(
                        entryB.wins || 0
                    )

                    -

                    Number(
                        entryA.wins || 0
                    )

                    ||

                    Number(
                        entryB.draws || 0
                    )

                    -

                    Number(
                        entryA.draws || 0
                    )

                    ||

                    Number(
                        entryA.slot || 0
                    )

                    -

                    Number(
                        entryB.slot || 0
                    )

                    ||

                    getEntryName(
                        entryA
                    ).localeCompare(
                        getEntryName(
                            entryB
                        )
                    )

                );

            }
        );

    }



    function getCompletedBlocks(
        year
    ) {


        const database =
            getDatabase();


        const blockMap =
            new Map();


        database.entries

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

                                brand:
                                    entry.brand || "",

                                division:
                                    entry.division || "",

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

            .map(
                block => {


                    const results =
                        getResultsForBlock(
                            year,
                            block.id
                        );


                    const expectedPairKeys =
                        getExpectedPairKeys(
                            block.entries
                        );


                    const recordedPairKeys =
                        new Set(

                            results.map(
                                result =>

                                    getPairKey(
                                        result.competitorOneEntryId,
                                        result.competitorTwoEntryId
                                    )
                            )

                        );


                    const roundRobinComplete =

                        block.entries.length ===
                            4

                        &&

                        expectedPairKeys.length ===
                            6

                        &&

                        expectedPairKeys.every(
                            pairKey =>
                                recordedPairKeys.has(
                                    pairKey
                                )
                        );


                    const finalAlreadyExists =

                        database.finals.some(
                            finalRecord =>

                                Number(
                                    finalRecord.year
                                ) ===
                                    Number(
                                        year
                                    )

                                &&

                                finalRecord.blockId ===
                                    block.id
                        );


                    return {

                        ...block,

                        entries:
                            sortStandings(
                                block.entries
                            ),

                        results,

                        roundRobinComplete,

                        finalAlreadyExists

                    };

                }
            )

            .filter(
                block =>

                    block.roundRobinComplete

                    &&

                    !block.finalAlreadyExists
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



    function getSelectedCompletedBlock() {


        return getCompletedBlocks(
            yearField.value
        ).find(
            block =>
                block.id ===
                blockField.value
        ) || null;

    }



    function getEntryRank(
        entry,
        standings
    ) {


        const index =
            standings.findIndex(
                standingEntry =>
                    standingEntry.id ===
                    entry?.id
            );


        return index ===
            -1

            ? 0

            : index + 1;

    }



    function getTitleShotTitle(
        brand,
        division
    ) {


        const titleMap = {

            "Ascension|Men":
                "OWL World Championship",

            "Ascension|Women":
                "OWL Women’s World Championship",

            "Revolt|Men":
                "OWL Heavyweight Championship",

            "Revolt|Women":
                "OWL Women’s Heavyweight Championship"

        };


        return titleMap[
            `${brand}|${division}`
        ] || "OWL Championship";

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
    // FINAL DIRECTORY
    // =================================


    function renderFinalSelect() {


        const database =
            getDatabase();


        finalSelect.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =

            database.finals.length

                ? "Select Proving Ground Final"

                : "No Proving Ground Finals";


        finalSelect.appendChild(
            placeholder
        );


        const sortedFinals = [

            ...database.finals

        ].sort(
            (
                finalA,
                finalB
            ) => {


                return (

                    Number(
                        finalB.year || 0
                    )

                    -

                    Number(
                        finalA.year || 0
                    )

                    ||

                    String(
                        finalB.finalDate || ""
                    ).localeCompare(
                        String(
                            finalA.finalDate || ""
                        )
                    )

                    ||

                    String(
                        finalA.blockLabel || ""
                    ).localeCompare(
                        String(
                            finalB.blockLabel || ""
                        )
                    )

                );

            }
        );


        sortedFinals.forEach(
            finalRecord => {


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    finalRecord.id;


                option.textContent =

                    `${finalRecord.year || "—"} — ${finalRecord.blockLabel || finalRecord.blockId || "—"} — ${finalRecord.winnerName || finalRecord.trophyWinner || "Unnamed Winner"}`;


                finalSelect.appendChild(
                    option
                );

            }
        );


        finalSelect.disabled =
            database.finals.length ===
            0;


        finalCount.textContent =
            String(
                database.finals.length
            );


        deleteButton.disabled =
            true;

    }



    // =================================
    // SELECT HELPERS
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


        const blocks =
            getCompletedBlocks(
                yearField.value
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

                ? "Select Completed Tournament Block"

                : "Complete All Six Block Matches First";


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

                    `${block.label} — 6 / 6 Matches Complete`;


                blockField.appendChild(
                    option
                );

            }
        );


        blockField.disabled =
            blocks.length ===
            0;


        setEmptySelect(
            finalistOneField,
            "Select Tournament Block First"
        );


        setEmptySelect(
            finalistTwoField,
            "Select Tournament Block First"
        );


        setEmptySelect(
            winnerField,
            "Select Both Finalists First"
        );


        renderPreview();

    }



    function createFinalistOption(
        entry,
        rank
    ) {


        const option =
            document.createElement(
                "option"
            );


        option.value =
            entry.id;


        option.textContent =

            `#${rank} — ${getEntryName(
                entry
            )} — ${Number(
                entry.combatPoints ??
                entry.points ??
                0
            )} Points`;


        return option;

    }



    function populateFinalists() {


        const block =
            getSelectedCompletedBlock();


        if (!block) {


            setEmptySelect(
                finalistOneField,
                "Select Tournament Block First"
            );


            setEmptySelect(
                finalistTwoField,
                "Select Tournament Block First"
            );


            setEmptySelect(
                winnerField,
                "Select Both Finalists First"
            );


            renderPreview();


            return;

        }


        finalistOneField.innerHTML =
            "";


        finalistTwoField.innerHTML =
            "";


        block.entries.forEach(
            (
                entry,
                index
            ) => {


                finalistOneField.appendChild(
                    createFinalistOption(
                        entry,
                        index + 1
                    )
                );


                finalistTwoField.appendChild(
                    createFinalistOption(
                        entry,
                        index + 1
                    )
                );

            }
        );


        finalistOneField.disabled =
            false;


        finalistTwoField.disabled =
            false;


        finalistOneField.value =
            block.entries[0]?.id || "";


        finalistTwoField.value =
            block.entries[1]?.id || "";


        populateWinner();

    }



    function repopulateFinalistTwo() {


        const block =
            getSelectedCompletedBlock();


        const previousValue =
            finalistTwoField.value;


        finalistTwoField.innerHTML =
            "";


        if (!block) {


            setEmptySelect(
                finalistTwoField,
                "Select Tournament Block First"
            );


            populateWinner();


            return;

        }


        const availableEntries =

            block.entries.filter(
                entry =>
                    entry.id !==
                    finalistOneField.value
            );


        availableEntries.forEach(
            entry => {


                const rank =
                    getEntryRank(
                        entry,
                        block.entries
                    );


                finalistTwoField.appendChild(
                    createFinalistOption(
                        entry,
                        rank
                    )
                );

            }
        );


        finalistTwoField.disabled =
            availableEntries.length ===
            0;


        finalistTwoField.value =

            availableEntries.some(
                entry =>
                    entry.id ===
                    previousValue
            )

                ? previousValue

                : availableEntries[0]?.id || "";


        populateWinner();

    }



    function populateWinner() {


        const finalistOne =
            getEntryById(
                finalistOneField.value
            );


        const finalistTwo =
            getEntryById(
                finalistTwoField.value
            );


        winnerField.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =
            "Select Final Winner";


        winnerField.appendChild(
            placeholder
        );


        [

            finalistOne,
            finalistTwo

        ]

            .filter(
                Boolean
            )

            .forEach(
                finalist => {


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        finalist.id;


                    option.textContent =
                        getEntryName(
                            finalist
                        );


                    winnerField.appendChild(
                        option
                    );

                }
            );


        winnerField.disabled =

            !finalistOne

            ||

            !finalistTwo

            ||

            finalistOne.id ===
                finalistTwo.id;


        updatePrizeDisplays();


        renderPreview();

    }



    // =================================
    // DRAFT
    // =================================


    function createFinalId(
        draft
    ) {


        return [

            "proving-ground-final",
            draft.year,
            draft.blockId

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


        const block =
            getSelectedCompletedBlock();


        const standings =
            block?.entries || [];


        const finalistOne =
            getEntryById(
                finalistOneField.value
            );


        const finalistTwo =
            getEntryById(
                finalistTwoField.value
            );


        const winner =
            getEntryById(
                winnerField.value
            );


        const loser =

            winner &&
            finalistOne &&
            finalistTwo

                ? (
                    winner.id ===
                        finalistOne.id

                        ? finalistTwo

                        : finalistOne
                )

                : null;


        const parsedTime =
            parseMatchTime(
                timeField.value
            );


        const titleShotTitle =
            getTitleShotTitle(
                block?.brand || "",
                block?.division || ""
            );


        const draft = {

            year:
                Number(
                    yearField.value
                ),

            blockId:
                block?.id || "",

            blockLabel:
                block?.label || "",

            brand:
                block?.brand || "",

            division:
                block?.division || "",

            finalDate:
                dateField.value,

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

            finalistOneEntryId:
                finalistOne?.id || "",

            finalistOneId:
                finalistOne?.wrestlerId || "",

            finalistOneName:
                getEntryName(
                    finalistOne
                ),

            finalistOneRank:
                getEntryRank(
                    finalistOne,
                    standings
                ),

            finalistOnePoints:

                Number(
                    finalistOne?.combatPoints ??
                    finalistOne?.points ??
                    0
                ),

            finalistTwoEntryId:
                finalistTwo?.id || "",

            finalistTwoId:
                finalistTwo?.wrestlerId || "",

            finalistTwoName:
                getEntryName(
                    finalistTwo
                ),

            finalistTwoRank:
                getEntryRank(
                    finalistTwo,
                    standings
                ),

            finalistTwoPoints:

                Number(
                    finalistTwo?.combatPoints ??
                    finalistTwo?.points ??
                    0
                ),

            winnerEntryId:
                winner?.id || "",

            winnerId:
                winner?.wrestlerId || "",

            winnerName:
                getEntryName(
                    winner
                ),

            loserEntryId:
                loser?.id || "",

            loserId:
                loser?.wrestlerId || "",

            loserName:
                getEntryName(
                    loser
                ),

            method:
                methodField.value,

            trophyWinner:
                getEntryName(
                    winner
                ),

            titleShotHolder:
                getEntryName(
                    winner
                ),

            titleShotTitle,

            titleShotEvent:
                "December to Remember",

            titleShotDescription:

                winner

                    ? `${getEntryName(
                        winner
                    )} earned a ${titleShotTitle} opportunity at December to Remember.`

                    : "",

            qualifyingResultIds:

                block?.results.map(
                    result =>
                        result.id
                ) || [],

            finalStandings:

                standings.map(
                    (
                        entry,
                        index
                    ) => ({

                        rank:
                            index + 1,

                        entryId:
                            entry.id,

                        wrestlerId:
                            entry.wrestlerId || "",

                        name:
                            getEntryName(
                                entry
                            ),

                        wins:
                            Number(
                                entry.wins || 0
                            ),

                        losses:
                            Number(
                                entry.losses || 0
                            ),

                        draws:
                            Number(
                                entry.draws || 0
                            ),

                        combatPoints:

                            Number(
                                entry.combatPoints ??
                                entry.points ??
                                0
                            )

                    })
                ),

            note:
                noteField.value.trim(),

            createdAt:
                new Date().toISOString()

        };


        draft.id =
            createFinalId(
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

            return "Select a completed tournament block.";

        }


        const block =
            getSelectedCompletedBlock();


        if (!block) {

            return "The selected block must contain four entrants and all six block results.";

        }


        if (!draft.finalDate) {

            return "Select the final date.";

        }


        const latestBlockDate =

            block.results

                .map(
                    result =>
                        result.matchDate || ""
                )

                .filter(
                    Boolean
                )

                .sort()

                .at(
                    -1
                ) || "";


        if (
            latestBlockDate &&
            draft.finalDate <
                latestBlockDate
        ) {

            return "The PPV final date cannot be earlier than the block’s latest recorded match.";

        }


        if (
            !parseMatchTime(
                draft.matchTime
            )
        ) {

            return "Enter match time in minutes and seconds, such as 18:46.";

        }


        if (!draft.finalistOneEntryId) {

            return "Select Finalist 1.";

        }


        if (!draft.finalistTwoEntryId) {

            return "Select Finalist 2.";

        }


        if (
            draft.finalistOneEntryId ===
            draft.finalistTwoEntryId
        ) {

            return "The same wrestler cannot fill both finalist positions.";

        }


        const finalistIds = [

            draft.finalistOneEntryId,
            draft.finalistTwoEntryId

        ];


        const finalistsBelongToBlock =

            finalistIds.every(
                entryId =>

                    block.entries.some(
                        entry =>
                            entry.id ===
                            entryId
                    )
            );


        if (!finalistsBelongToBlock) {

            return "Both finalists must belong to the selected tournament block.";

        }


        if (!draft.winnerEntryId) {

            return "Select the final winner.";

        }


        if (
            !finalistIds.includes(
                draft.winnerEntryId
            )
        ) {

            return "The final winner must be one of the two selected finalists.";

        }


        if (!draft.method) {

            return "Select the finish method.";

        }


        const duplicateFinal =

            getDatabase().finals.find(
                finalRecord =>

                    Number(
                        finalRecord.year
                    ) ===
                        draft.year

                    &&

                    finalRecord.blockId ===
                        draft.blockId
            );


        if (duplicateFinal) {

            return "This tournament block already has a recorded PPV final.";

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



    function updatePrizeDisplays() {


        const winner =
            getEntryById(
                winnerField.value
            );


        const block =
            getSelectedCompletedBlock();


        if (
            !winner ||
            !block
        ) {

            trophyWinnerDisplay.textContent =
                "—";


            titleShotDisplay.textContent =
                "—";


            return;

        }


        const winnerName =
            getEntryName(
                winner
            );


        const titleName =
            getTitleShotTitle(
                block.brand,
                block.division
            );


        trophyWinnerDisplay.textContent =
            winnerName;


        titleShotDisplay.textContent =

            `${winnerName} — ${titleName} at December to Remember`;

    }



    function renderPreview() {


        updatePrizeDisplays();


        const draft =
            getDraft();


        const formStarted =

            Boolean(
                draft.blockId ||
                draft.finalistOneEntryId ||
                draft.finalistTwoEntryId ||
                draft.winnerEntryId ||
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
            "FINALISTS",

            `${draft.finalistOneName || "—"} vs ${draft.finalistTwoName || "—"}`
        );


        addReviewRow(
            "BLOCK RANKS",

            `#${draft.finalistOneRank || "—"} vs #${draft.finalistTwoRank || "—"}`
        );


        addReviewRow(
            "FINAL WINNER",
            draft.winnerName
        );


        addReviewRow(
            "FINISH",

            draft.method &&
            draft.matchTime

                ? `${draft.method} at ${draft.matchTime}`

                : draft.method ||
                    draft.matchTime
        );


        addReviewRow(
            "TROPHY WINNER",
            draft.trophyWinner
        );


        addReviewRow(
            "DECEMBER TITLE OPPORTUNITY",
            draft.titleShotDescription
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
    // ENTRY STATUS HELPERS
    // =================================


    function applyFinalStatuses(
        entries,
        finalRecord
    ) {


        return entries.map(
            entry => {


                if (
                    Number(
                        entry.year
                    ) !==
                        Number(
                            finalRecord.year
                        )

                    ||

                    getEntryBlockId(
                        entry
                    ) !==
                        finalRecord.blockId
                ) {

                    return entry;

                }


                let status =
                    "Eliminated";


                if (
                    entry.id ===
                    finalRecord.loserEntryId
                ) {

                    status =
                        "Finalist";

                }


                if (
                    entry.id ===
                    finalRecord.winnerEntryId
                ) {

                    status =
                        "Winner";

                }


                return {

                    ...entry,

                    status,

                    finalId:
                        finalRecord.id,

                    finalPlacement:

                        entry.id ===
                            finalRecord.winnerEntryId

                            ? 1

                            : entry.id ===
                                finalRecord.loserEntryId

                                ? 2

                                : null

                };

            }
        );

    }



    function removeFinalStatuses(
        entries,
        finalRecord,
        blockResults
    ) {


        const blockHasResults =

            blockResults.some(
                result =>

                    Number(
                        result.year
                    ) ===
                        Number(
                            finalRecord.year
                        )

                    &&

                    result.blockId ===
                        finalRecord.blockId
            );


        return entries.map(
            entry => {


                if (
                    Number(
                        entry.year
                    ) !==
                        Number(
                            finalRecord.year
                        )

                    ||

                    getEntryBlockId(
                        entry
                    ) !==
                        finalRecord.blockId
                ) {

                    return entry;

                }


                const updatedEntry = {

                    ...entry,

                    status:

                        blockHasResults

                            ? "Active"

                            : "Upcoming"

                };


                delete updatedEntry.finalId;


                delete updatedEntry.finalPlacement;


                return updatedEntry;

            }
        );

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


        methodField.value =
            "";


        noteField.value =
            "";


        trophyWinnerDisplay.textContent =
            "—";


        titleShotDisplay.textContent =
            "—";


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
    // SAVE FINAL
    // =================================


    async function saveFinal() {


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


            const updatedEntries =

                applyFinalStatuses(
                    database.entries,
                    draft
                );


            const updatedDatabase = {

                ...database,

                updatedAt:
                    new Date().toISOString(),

                entries:
                    updatedEntries,

                finals: [

                    ...database.finals,

                    draft

                ]

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

                `${draft.winnerName} won the ${draft.year} ${draft.blockLabel} Proving Ground final and earned the ${draft.titleShotTitle} opportunity at December to Remember.`

            );

        }


        catch (error) {


            console.error(
                "Could not save Proving Ground final:",
                error
            );


            showMessage(

                error.message

                ||

                "The Proving Ground final could not be saved.",

                "error"

            );


            renderPreview();

        }

    }



    // =================================
    // DELETE FINAL
    // =================================


    async function deleteFinal() {


        try {


            hideMessage();


            const database =
                getDatabase();


            const selectedFinal =

                database.finals.find(
                    finalRecord =>
                        finalRecord.id ===
                        finalSelect.value
                );


            if (!selectedFinal) {


                showMessage(
                    "Select a Proving Ground final first.",
                    "error"
                );


                return;

            }


            const confirmation =
                window.prompt(

                    `Type DELETE PROVING FINAL to remove "${selectedFinal.finalistOneName} vs ${selectedFinal.finalistTwoName}".`

                );


            if (
                confirmation !==
                "DELETE PROVING FINAL"
            ) {


                showMessage(
                    "Proving Ground final deletion cancelled.",
                    "error"
                );


                return;

            }


            deleteButton.disabled =
                true;


            const updatedEntries =

                removeFinalStatuses(
                    database.entries,
                    selectedFinal,
                    database.blockResults
                );


            const updatedDatabase = {

                ...database,

                updatedAt:
                    new Date().toISOString(),

                entries:
                    updatedEntries,

                finals:

                    database.finals.filter(
                        finalRecord =>
                            finalRecord.id !==
                            selectedFinal.id
                    )

            };


            await writeControlRoomJsonFile(
                "proving-ground.json",
                updatedDatabase
            );


            await loadRepositoryData(
                owlRepositoryHandle
            );


            showMessage(

                `${selectedFinal.finalistOneName} vs ${selectedFinal.finalistTwoName} was removed from the Proving Ground final history.`

            );

        }


        catch (error) {


            console.error(
                "Could not delete Proving Ground final:",
                error
            );


            showMessage(

                error.message

                ||

                "The Proving Ground final could not be deleted.",

                "error"

            );

        }

    }



    // =================================
    // INITIALIZE
    // =================================


    function initializeManager() {


        hideMessage();


        renderFinalSelect();


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
        populateFinalists
    );


    finalistOneField.addEventListener(
        "change",
        repopulateFinalistTwo
    );


    finalistTwoField.addEventListener(
        "change",
        populateWinner
    );


    winnerField.addEventListener(
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


    methodField.addEventListener(
        "change",
        renderPreview
    );


    noteField.addEventListener(
        "input",
        renderPreview
    );


    finalSelect.addEventListener(
        "change",
        () => {


            deleteButton.disabled =
                !finalSelect.value;

        }
    );


    saveButton.addEventListener(
        "click",
        saveFinal
    );


    deleteButton.addEventListener(
        "click",
        deleteFinal
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
            "Proving Ground Final Recorder waiting for repository data."
        );

    }

}());
