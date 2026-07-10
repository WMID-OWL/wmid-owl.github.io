// =================================
// OWL CONTROL ROOM
// BRAGGING RIGHTS DESK
// =================================


(() => {


    "use strict";



    const els = {


        desk:

            document.getElementById(
                "cr-bragging-rights-desk"
            ),


        year:

            document.getElementById(
                "cr-bragging-year"
            ),


        load:

            document.getElementById(
                "cr-bragging-load"
            ),


        create:

            document.getElementById(
                "cr-bragging-create"
            ),


        status:

            document.getElementById(
                "cr-bragging-status"
            ),


        qualification:

            document.getElementById(
                "cr-bragging-qualification"
            ),


        menCore:

            document.getElementById(
                "cr-bragging-men-core"
            ),


        menGuests:

            document.getElementById(
                "cr-bragging-men-guests"
            ),


        womenCore:

            document.getElementById(
                "cr-bragging-women-core"
            ),


        womenGuests:

            document.getElementById(
                "cr-bragging-women-guests"
            ),


        saveStatus:

            document.getElementById(
                "cr-bragging-save-status"
            ),


        saveField:

            document.getElementById(
                "cr-bragging-save-field"
            ),


        draw:

            document.getElementById(
                "cr-bragging-draw"
            ),


        brackets:

            document.getElementById(
                "cr-bragging-brackets"
            ),


        menBracket:

            document.getElementById(
                "cr-bragging-men-bracket"
            ),


        womenBracket:

            document.getElementById(
                "cr-bragging-women-bracket"
            )

    };



    const state = {


        data:
            null,


        rankings:
            null,


        currentEdition:
            null

    };



    // =================================
    // HELPERS
    // =================================


    function escapeHtml(
        value
    ) {


        return String(
            value ?? ""
        )

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }



    function slugify(
        value
    ) {


        return String(
            value || ""
        )

            .trim()

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



    function setStatus(
        value
    ) {


        if (
            els.status
        ) {


            els.status.textContent =
                value;

        }

    }



    function setSaveStatus(
        value
    ) {


        if (
            els.saveStatus
        ) {


            els.saveStatus.textContent =
                value;

        }

    }



    async function landscapeDirectoryHandle() {


        if (

            typeof owlRepositoryHandle ===
            "undefined"

            ||

            !owlRepositoryHandle

        ) {


            throw new Error(

                "OWL repository is not connected."

            );

        }


        const dataDirectory =

            await owlRepositoryHandle
                .getDirectoryHandle(
                    "data"
                );


        return dataDirectory
            .getDirectoryHandle(
                "landscape"
            );

    }



    async function readJson(
        fileName
    ) {


        const directory =

            await landscapeDirectoryHandle();


        const handle =

            await directory
                .getFileHandle(
                    fileName
                );


        const file =

            await handle
                .getFile();


        return JSON.parse(

            await file.text()

        );

    }



    async function writeJson(
        fileName,
        data
    ) {


        const directory =

            await landscapeDirectoryHandle();


        const handle =

            await directory
                .getFileHandle(
                    fileName
                );


        const writable =

            await handle
                .createWritable();


        await writable.write(

            `${JSON.stringify(

                data,
                null,
                2

            )}\n`

        );


        await writable.close();

    }



    function selectedYear() {


        const year =

            String(
                els.year?.value || ""
            )
                .trim();


        if (
            !/^\d{4}$/.test(
                year
            )
        ) {


            throw new Error(

                "Enter a valid tournament year."

            );

        }


        return year;

    }



    function findEdition(
        year
    ) {


        return (

            state.data
                ?.editions
                ?.find(

                    edition =>

                        String(
                            edition.year
                        )

                        ===

                        String(
                            year
                        )

                )

            ||

            null

        );

    }    // =================================
    // DEFAULT YEAR
    // =================================


    function setDefaultYear() {


        if (
            !els.year

            ||

            els.year.value
        ) {


            return;

        }


        const editionYears =

            (

                state.data
                    ?.editions

                ||

                []

            )

                .map(

                    edition =>

                        String(
                            edition.year || ""
                        )

                )

                .filter(

                    value =>

                        /^\d{4}$/.test(
                            value
                        )

                )

                .sort();


        const rankingYears =

            (

                state.rankings
                    ?.periods

                ||

                []

            )

                .map(

                    period =>

                        String(
                            period.periodId || ""
                        )
                            .slice(
                                0,
                                4
                            )

                )

                .filter(

                    value =>

                        /^\d{4}$/.test(
                            value
                        )

                )

                .sort();


        els.year.value =

            editionYears.at(
                -1
            )

            ||

            rankingYears.at(
                -1
            )

            ||

            String(
                new Date()
                    .getFullYear()
            );

    }



    // =================================
    // EMPTY FIELD
    // =================================


    function renderEmptyField() {


        const emptyHtml = `

            <p class="cr-landscape-entry-empty">

                Lock an October qualification period first.

            </p>

        `;


        els.qualification.innerHTML =
            emptyHtml;


        els.menCore.innerHTML =
            emptyHtml;


        els.menGuests.innerHTML =
            emptyHtml;


        els.womenCore.innerHTML =
            emptyHtml;


        els.womenGuests.innerHTML =
            emptyHtml;


        els.brackets.hidden =
            true;

    }



    // =================================
    // QUALIFICATION SNAPSHOT
    // =================================


    function renderQualification(
        edition
    ) {


        const companies =

            edition
                ?.qualificationSnapshot
                ?.companyOrder

            ||

            [];


        els.qualification.innerHTML =

            companies

                .map(

                    company => `

                        <article class="cr-bragging-qualification-row">


                            <strong>
                                #${company.rank}
                            </strong>


                            <div>


                                <span>

                                    ${escapeHtml(
                                        company.companyName
                                    )}

                                </span>


                                <small>

                                    LANDSCAPE SCORE
                                    ${

                                        Number.isFinite(
                                            Number(
                                                company.landscapeScore
                                            )
                                        )

                                            ? Number(
                                                company.landscapeScore
                                            )
                                                .toFixed(
                                                    1
                                                )

                                            : "—"

                                    }

                                </small>


                            </div>


                            <strong>

                                ${company.allocation}

                                SLOT${

                                    company.allocation === 1

                                        ? ""

                                        : "S"

                                }

                            </strong>


                        </article>

                    `

                )

                .join(
                    ""
                );

    }



    // =================================
    // FIELD RENDER
    // =================================


    function renderCoreSlots(
        slots,
        division,
        locked
    ) {


        return (

            slots

            ||

            []

        )

            .map(

                (
                    slot,
                    index
                ) => `

                    <article class="cr-bragging-slot-row">


                        <div class="cr-bragging-slot-company">


                            <strong>

                                ${escapeHtml(
                                    slot.companyName
                                )}

                            </strong>


                            <small>

                                RANK
                                #${slot.qualificationRank}

                                ·

                                SLOT
                                ${slot.allocationSlot}

                            </small>


                        </div>


                        <input
                            type="text"
                            value="${escapeHtml(
                                slot.wrestlerName || ""
                            )}"
                            placeholder="Wrestler name"
                            data-br-slot
                            data-division="${division}"
                            data-kind="core"
                            data-index="${index}"
                            data-field="wrestlerName"
                            ${locked ? "disabled" : ""}
                        >


                    </article>

                `

            )

            .join(
                ""
            );

    }



    function renderGuestSlots(
        slots,
        division,
        locked
    ) {


        return (

            slots

            ||

            []

        )

            .map(

                (
                    slot,
                    index
                ) => `

                    <article class="cr-bragging-guest-row">


                        <span class="cr-bragging-guest-number">

                            G${index + 1}

                        </span>


                        <input
                            type="text"
                            value="${escapeHtml(
                                slot.guestCompanyName || ""
                            )}"
                            placeholder="Guest company"
                            data-br-slot
                            data-division="${division}"
                            data-kind="guest"
                            data-index="${index}"
                            data-field="guestCompanyName"
                            ${locked ? "disabled" : ""}
                        >


                        <input
                            type="text"
                            value="${escapeHtml(
                                slot.wrestlerName || ""
                            )}"
                            placeholder="Wrestler name"
                            data-br-slot
                            data-division="${division}"
                            data-kind="guest"
                            data-index="${index}"
                            data-field="wrestlerName"
                            ${locked ? "disabled" : ""}
                        >


                    </article>

                `

            )

            .join(
                ""
            );

    }    // =================================
    // BRACKET RENDER
    // =================================


    function winnerOptions(
        match
    ) {


        const entrants = [

            match.entrantA,
            match.entrantB

        ];


        return entrants

            .map(

                entrant => `

                    <option
                        value="${escapeHtml(
                            entrant.entrantId
                        )}"
                        ${

                            match.winnerEntrantId ===
                            entrant.entrantId

                                ? "selected"

                                : ""

                        }
                    >

                        ${escapeHtml(
                            entrant.wrestlerName
                        )}

                    </option>

                `

            )

            .join(
                ""
            );

    }



    function renderMatchCard({

        match,
        roundKey,
        division,
        matchNumber,
        locked

    }) {


        const winner =

            window
                .LandscapeBraggingRightsEngine
                .winnerFromMatch(
                    match
                );


        return `

            <article
                class="cr-bragging-result-card ${

                    winner

                        ? "has-result"

                        : ""

                }"

                data-br-match-card
            >


                <div class="cr-bragging-result-matchup">


                    <span class="cr-bragging-result-number">

                        MATCH ${matchNumber}

                    </span>


                    <div class="cr-bragging-result-team">


                        <strong>

                            ${escapeHtml(
                                match.entrantA
                                    ?.wrestlerName
                            )}

                        </strong>


                        <small>

                            ${escapeHtml(
                                match.entrantA
                                    ?.companyName
                            )}

                        </small>


                    </div>


                    <b>
                        VS
                    </b>


                    <div class="cr-bragging-result-team">


                        <strong>

                            ${escapeHtml(
                                match.entrantB
                                    ?.wrestlerName
                            )}

                        </strong>


                        <small>

                            ${escapeHtml(
                                match.entrantB
                                    ?.companyName
                            )}

                        </small>


                    </div>


                </div>



                <div class="cr-bragging-result-form">


                    <label>


                        <span>
                            WINNER
                        </span>


                        <select
                            data-br-result-winner
                            ${locked ? "disabled" : ""}
                        >


                            <option value="">
                                Select winner
                            </option>


                            ${winnerOptions(
                                match
                            )}


                        </select>


                    </label>



                    <label>


                        <span>
                            MATCH RATING
                        </span>


                        <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.25"
                            value="${

                                match.rating
                                ??
                                ""

                            }"
                            placeholder="0–5"
                            data-br-result-rating
                            ${locked ? "disabled" : ""}
                        >


                    </label>



                    <label class="cr-bragging-result-text-label">


                        <span>
                            CANONICAL RESULT
                        </span>


                        <input
                            type="text"
                            value="${escapeHtml(
                                match.resultText || ""
                            )}"
                            placeholder="Winner defeated opponent..."
                            data-br-result-text
                            ${locked ? "disabled" : ""}
                        >


                    </label>



                    <button
                        type="button"
                        class="control-room-secondary-button"
                        data-br-save-result
                        data-division="${division}"
                        data-round="${roundKey}"
                        data-match-id="${escapeHtml(
                            match.matchId
                        )}"
                        ${locked ? "disabled" : ""}
                    >

                        ${winner ? "Update Result" : "Save Result"}

                    </button>


                </div>


                ${

                    locked

                        ? `

                            <div class="cr-bragging-round-lock">

                                ROUND LOCKED · TOURNAMENT ADVANCED

                            </div>

                        `

                        : ""

                }


            </article>

        `;

    }



    function renderDivisionBracket(
        division,
        bracket
    ) {


        if (
            !bracket
        ) {


            return `

                <p class="cr-landscape-entry-empty">

                    Bracket has not been drawn.

                </p>

            `;

        }


        const engine =

            window
                .LandscapeBraggingRightsEngine;


        const roundHtml =

            engine
                .ROUND_ORDER

                .map(

                    roundKey => {


                        const matches =

                            bracket
                                .rounds
                                ?.[roundKey]

                            ||

                            [];


                        if (
                            matches.length === 0
                        ) {


                            return "";

                        }


                        const locked =

                            engine
                                .roundIsLocked(

                                    bracket,
                                    roundKey

                                );


                        return `

                            <section class="cr-bragging-round-block">


                                <div class="cr-bragging-round-heading">


                                    <span>

                                        ${escapeHtml(
                                            engine
                                                .ROUND_LABELS[
                                                    roundKey
                                                ]
                                        )}

                                    </span>


                                    <small>

                                        ${

                                            matches.filter(

                                                match =>

                                                    Boolean(
                                                        engine
                                                            .winnerFromMatch(
                                                                match
                                                            )
                                                    )

                                            ).length

                                        }

                                        /

                                        ${matches.length}

                                        COMPLETE

                                    </small>


                                </div>


                                <div class="cr-bragging-result-match-list">


                                    ${matches

                                        .map(

                                            (
                                                match,
                                                index
                                            ) =>

                                                renderMatchCard({


                                                    match:
                                                        match,


                                                    roundKey:
                                                        roundKey,


                                                    division:
                                                        division,


                                                    matchNumber:
                                                        index + 1,


                                                    locked:
                                                        locked

                                                })

                                        )

                                        .join(
                                            ""
                                        )}


                                </div>


                            </section>

                        `;

                    }

                )

                .join(
                    ""
                );


        const championHtml =

            bracket.winner

                ? `

                    <article class="cr-bragging-champion-panel">


                        <span>
                            TOURNAMENT CHAMPION
                        </span>


                        <strong>

                            ${escapeHtml(
                                bracket.winner
                                    .wrestlerName
                            )}

                        </strong>


                        <small>

                            ${escapeHtml(
                                bracket.winner
                                    .companyName
                            )}

                        </small>


                    </article>

                `

                : "";


        return (

            roundHtml

            +

            championHtml

        );

    }    function renderBrackets(
        edition
    ) {


        const menBracket =

            edition
                ?.men
                ?.bracket;


        const womenBracket =

            edition
                ?.women
                ?.bracket;


        if (
            !menBracket

            &&

            !womenBracket
        ) {


            els.brackets.hidden =
                true;


            return;

        }


        els.brackets.hidden =
            false;


        els.menBracket.innerHTML =

            renderDivisionBracket(

                "men",
                menBracket

            );


        els.womenBracket.innerHTML =

            renderDivisionBracket(

                "women",
                womenBracket

            );

    }



    // =================================
    // EDITION RENDER
    // =================================


    function renderEdition(
        edition
    ) {


        state.currentEdition =
            edition;


        if (
            !edition
        ) {


            setStatus(
                "NO EDITION"
            );


            renderEmptyField();


            return;

        }


        setStatus(

            `${edition.eventPeriodId} · ${String(
                edition.status || ""
            )
                .replace(
                    /-/g,
                    " "
                )
                .toUpperCase()}`

        );


        renderQualification(
            edition
        );


        const menLocked =

            Boolean(
                edition.men
                    ?.bracket
            );


        const womenLocked =

            Boolean(
                edition.women
                    ?.bracket
            );


        els.menCore.innerHTML =

            renderCoreSlots(

                edition.men
                    ?.coreSlots,

                "men",

                menLocked

            );


        els.menGuests.innerHTML =

            renderGuestSlots(

                edition.men
                    ?.guestSlots,

                "men",

                menLocked

            );


        els.womenCore.innerHTML =

            renderCoreSlots(

                edition.women
                    ?.coreSlots,

                "women",

                womenLocked

            );


        els.womenGuests.innerHTML =

            renderGuestSlots(

                edition.women
                    ?.guestSlots,

                "women",

                womenLocked

            );


        if (
            els.saveField
        ) {


            els.saveField.disabled =

                menLocked

                ||

                womenLocked;

        }


        if (
            els.draw
        ) {


            els.draw.disabled =

                menLocked

                ||

                womenLocked;

        }


        renderBrackets(
            edition
        );

    }



    // =================================
    // LOAD DATA
    // =================================


    async function loadData() {


        if (

            typeof owlRepositoryHandle ===
            "undefined"

            ||

            !owlRepositoryHandle

        ) {


            return;

        }


        try {


            setStatus(
                "LOADING"
            );


            const [

                braggingData,
                rankingsData

            ] =

                await Promise.all([


                    readJson(
                        "bragging-rights.json"
                    ),


                    readJson(
                        "rankings.json"
                    )


                ]);


            state.data =
                braggingData;


            state.rankings =
                rankingsData;


            state.data.editions =

                Array.isArray(
                    state.data.editions
                )

                    ? state.data.editions

                    : [];


            setDefaultYear();


            renderEdition(

                findEdition(
                    els.year.value
                )

            );


        }


        catch (
            error
        ) {


            console.error(

                "Bragging Rights desk load failed:",

                error

            );


            setStatus(
                "LOAD FAILED"
            );

        }

    }



    // =================================
    // LOAD EDITION
    // =================================


    function loadSelectedEdition() {


        try {


            const year =
                selectedYear();


            const edition =

                findEdition(
                    year
                );


            renderEdition(
                edition
            );


            setSaveStatus(

                edition

                    ? "EDITION LOADED"

                    : "NO EDITION FOR THIS YEAR"

            );


        }


        catch (
            error
        ) {


            setSaveStatus(

                error.message

                ||

                "LOAD FAILED"

            );

        }

    }



    // =================================
    // CREATE EDITION
    // =================================


    async function createEdition() {


        try {


            const year =
                selectedYear();


            if (
                findEdition(
                    year
                )
            ) {


                throw new Error(

                    "A Bragging Rights edition already exists for this year."

                );

            }


            setSaveStatus(
                "LOCKING QUALIFICATION"
            );


            const edition =

                window
                    .LandscapeBraggingRightsEngine
                    .createEdition({


                        year:
                            year,


                        rankingsData:
                            state.rankings,


                        eventMonth:

                            state.data
                                .eventMonth

                            ||

                            "11",


                        cutoffMonth:

                            state.data
                                .qualificationCutoffMonth

                            ||

                            "10"


                    });


            state.data.editions.push(
                edition
            );


            state.data.editions.sort(

                (
                    a,
                    b
                ) =>

                    String(
                        a.year
                    )

                        .localeCompare(

                            String(
                                b.year
                            )

                        )

            );


            await writeJson(

                "bragging-rights.json",

                state.data

            );


            renderEdition(
                edition
            );


            setSaveStatus(
                "QUALIFICATION LOCKED"
            );


        }


        catch (
            error
        ) {


            console.error(
                error
            );


            setSaveStatus(

                error.message

                ||

                "QUALIFICATION FAILED"

            );

        }

    }    // =================================
    // COLLECT FIELD INPUTS
    // =================================


    function collectFieldInputs() {


        const edition =
            state.currentEdition;


        if (
            !edition
        ) {


            throw new Error(

                "Load or create a Bragging Rights edition first."

            );

        }


        const inputs = [

            ...els.desk
                .querySelectorAll(
                    "[data-br-slot]"
                )

        ];


        inputs.forEach(

            input => {


                const division =
                    input.dataset.division;


                const kind =
                    input.dataset.kind;


                const index =

                    Number(
                        input.dataset.index
                    );


                const field =
                    input.dataset.field;


                const divisionData =

                    edition[
                        division
                    ];


                const slotList =

                    kind === "core"

                        ? divisionData
                            .coreSlots

                        : divisionData
                            .guestSlots;


                const slot =
                    slotList[index];


                if (
                    !slot
                ) {


                    return;

                }


                slot[field] =

                    input.value
                        .trim();


                if (
                    kind === "guest"

                    &&

                    field ===
                    "guestCompanyName"
                ) {


                    slot.guestCompanyId =

                        slugify(
                            input.value
                        );

                }

            }

        );


        return edition;

    }



    // =================================
    // SAVE EDITION
    // =================================


    async function persistCurrentEdition() {


        const edition =
            state.currentEdition;


        const index =

            state.data
                .editions
                .findIndex(

                    item =>

                        String(
                            item.year
                        )

                        ===

                        String(
                            edition.year
                        )

                );


        if (
            index === -1
        ) {


            throw new Error(

                "Current edition could not be found."

            );

        }


        state.data.editions[
            index
        ] = edition;


        await writeJson(

            "bragging-rights.json",

            state.data

        );

    }



    // =================================
    // SAVE FIELD
    // =================================


    async function saveField() {


        try {


            if (
                state.currentEdition
                    ?.men
                    ?.bracket

                ||

                state.currentEdition
                    ?.women
                    ?.bracket
            ) {


                throw new Error(

                    "The tournament field is already locked."

                );

            }


            setSaveStatus(
                "SAVING FIELD"
            );


            collectFieldInputs();


            await persistCurrentEdition();


            setSaveStatus(
                "FIELD SAVED"
            );


        }


        catch (
            error
        ) {


            console.error(
                error
            );


            setSaveStatus(

                error.message

                ||

                "SAVE FAILED"

            );

        }

    }



    // =================================
    // DRAW BRACKETS
    // =================================


    async function drawBrackets() {


        try {


            const edition =

                collectFieldInputs();


            if (

                edition.men.bracket

                ||

                edition.women.bracket
            ) {


                throw new Error(

                    "Brackets have already been drawn for this edition."

                );

            }


            setSaveStatus(
                "DRAWING BRACKETS"
            );


            edition.men.bracket =

                window
                    .LandscapeBraggingRightsEngine
                    .createBracket(

                        edition.men

                    );


            edition.men.entrants =

                edition.men
                    .bracket
                    .entrants;


            edition.women.bracket =

                window
                    .LandscapeBraggingRightsEngine
                    .createBracket(

                        edition.women

                    );


            edition.women.entrants =

                edition.women
                    .bracket
                    .entrants;


            [

                edition.men,
                edition.women

            ]

                .forEach(

                    division => {


                        division.coreSlots

                            .forEach(

                                slot =>

                                    slot.affiliationFrozen =
                                        true

                            );


                        division.guestSlots

                            .forEach(

                                slot =>

                                    slot.affiliationFrozen =
                                        true

                            );

                    }

                );


            edition.status =
                "brackets-drawn";


            edition.bracketsDrawnAt =

                new Date()
                    .toISOString();


            state.currentEdition =
                edition;


            await persistCurrentEdition();


            renderEdition(
                edition
            );


            setSaveStatus(
                "BRACKETS DRAWN"
            );


        }


        catch (
            error
        ) {


            console.error(
                error
            );


            setSaveStatus(

                error.message

                ||

                "DRAW FAILED"

            );

        }

    }



    // =================================
    // RESULT RECORDING
    // =================================


    function syncEditionOutcome(
        edition
    ) {


        const menWinner =

            edition.men
                ?.bracket
                ?.winner

            ||

            null;


        const womenWinner =

            edition.women
                ?.bracket
                ?.winner

            ||

            null;



        edition.men.champion =
            menWinner;


        edition.men.finalist =

            edition.men
                ?.bracket
                ?.finalist

            ||

            null;


        edition.women.champion =
            womenWinner;


        edition.women.finalist =

            edition.women
                ?.bracket
                ?.finalist

            ||

            null;



        edition.trophies =

            edition.trophies

            ||

            {};


        edition.trophies.menCompanyId =

            menWinner
                ?.companyId

            ||

            "";


        edition.trophies.womenCompanyId =

            womenWinner
                ?.companyId

            ||

            "";



        if (
            menWinner

            &&

            womenWinner
        ) {


            edition.status =
                "complete";


            edition.completedAt =

                edition.completedAt

                ||

                new Date()
                    .toISOString();

        }


        else {


            edition.status =
                "tournament-in-progress";

        }

    }



    async function saveMatchResult(
        button
    ) {


        try {


            const card =

                button.closest(
                    "[data-br-match-card]"
                );


            if (
                !card
            ) {


                throw new Error(

                    "Match result form could not be found."

                );

            }


            const division =

                button.dataset.division;


            const roundKey =

                button.dataset.round;


            const matchId =

                button.dataset.matchId;


            const winnerEntrantId =

                card
                    .querySelector(
                        "[data-br-result-winner]"
                    )
                    ?.value

                ||

                "";


            const rating =

                card
                    .querySelector(
                        "[data-br-result-rating]"
                    )
                    ?.value

                ||

                "";


            const resultText =

                card
                    .querySelector(
                        "[data-br-result-text]"
                    )
                    ?.value

                ||

                "";


            const edition =
                state.currentEdition;


            const bracket =

                edition[
                    division
                ]
                    ?.bracket;


            setSaveStatus(
                "SAVING MATCH RESULT"
            );


            window
                .LandscapeBraggingRightsEngine
                .recordMatchResult({


                    bracket:
                        bracket,


                    roundKey:
                        roundKey,


                    matchId:
                        matchId,


                    winnerEntrantId:
                        winnerEntrantId,


                    rating:
                        rating,


                    resultText:
                        resultText


                });


            syncEditionOutcome(
                edition
            );


            await persistCurrentEdition();


            renderEdition(
                edition
            );


            setSaveStatus(
                "MATCH RESULT SAVED"
            );


        }


        catch (
            error
        ) {


            console.error(
                error
            );


            setSaveStatus(

                error.message

                ||

                "RESULT SAVE FAILED"

            );

        }

    }



    // =================================
    // EVENTS
    // =================================


    els.load
        ?.addEventListener(

            "click",

            loadSelectedEdition

        );


    els.create
        ?.addEventListener(

            "click",

            createEdition

        );


    els.saveField
        ?.addEventListener(

            "click",

            saveField

        );


    els.draw
        ?.addEventListener(

            "click",

            drawBrackets

        );


    els.year
        ?.addEventListener(

            "change",

            loadSelectedEdition

        );


    els.desk
        ?.addEventListener(

            "click",

            event => {


                const button =

                    event.target.closest(
                        "[data-br-save-result]"
                    );


                if (
                    button
                ) {


                    saveMatchResult(
                        button
                    );

                }

            }

        );



    // =================================
    // STARTUP
    // =================================


    window
        .addEventListener(

            "owl-control-room-data-loaded",

            loadData

        );


    try {


        if (

            typeof owlRepositoryHandle !==
            "undefined"

            &&

            owlRepositoryHandle
        ) {


            loadData();

        }


    }


    catch (
        error
    ) {


        console.warn(

            "Bragging Rights desk waiting for repository connection.",

            error

        );

    }


})();
