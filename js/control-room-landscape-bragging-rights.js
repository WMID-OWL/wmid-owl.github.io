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


            els.status
                .textContent =
                    value;

        }

    }



    function setSaveStatus(
        value
    ) {


        if (
            els.saveStatus
        ) {


            els.saveStatus
                .textContent =
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

    }



    // =================================
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


        els.qualification
            .innerHTML =
                emptyHtml;


        els.menCore
            .innerHTML =
                emptyHtml;


        els.menGuests
            .innerHTML =
                emptyHtml;


        els.womenCore
            .innerHTML =
                emptyHtml;


        els.womenGuests
            .innerHTML =
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


        els.qualification
            .innerHTML =

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
    // CORE SLOT RENDER
    // =================================


    function renderCoreSlots(
        slots,
        division
    ) {


        if (
            !Array.isArray(
                slots
            )

            ||

            slots.length === 0
        ) {


            return `

                <p class="cr-landscape-entry-empty">

                    No qualification slots available.

                </p>

            `;

        }


        return slots

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
                            data-division="${escapeHtml(
                                division
                            )}"
                            data-kind="core"
                            data-index="${index}"
                            data-field="wrestlerName"
                        >


                    </article>

                `

            )

            .join(
                ""
            );

    }



    // =================================
    // GUEST SLOT RENDER
    // =================================


    function renderGuestSlots(
        slots,
        division
    ) {


        if (
            !Array.isArray(
                slots
            )

            ||

            slots.length === 0
        ) {


            return `

                <p class="cr-landscape-entry-empty">

                    No guest slots available.

                </p>

            `;

        }


        return slots

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
                            data-division="${escapeHtml(
                                division
                            )}"
                            data-kind="guest"
                            data-index="${index}"
                            data-field="guestCompanyName"
                        >



                        <input
                            type="text"
                            value="${escapeHtml(
                                slot.wrestlerName || ""
                            )}"
                            placeholder="Wrestler name"
                            data-br-slot
                            data-division="${escapeHtml(
                                division
                            )}"
                            data-kind="guest"
                            data-index="${index}"
                            data-field="wrestlerName"
                        >


                    </article>

                `

            )

            .join(
                ""
            );

    }



    // =================================
    // BRACKET RENDER
    // =================================


    function renderRoundOne(
        matches
    ) {


        if (
            !Array.isArray(
                matches
            )

            ||

            matches.length === 0
        ) {


            return `

                <p class="cr-landscape-entry-empty">

                    Bracket has not been drawn.

                </p>

            `;

        }


        return matches

            .map(

                (
                    match,
                    index
                ) => `

                    <article class="cr-bragging-match-card">


                        <span>

                            MATCH ${index + 1}

                        </span>



                        <div>


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



                        <div>


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


                    </article>

                `

            )

            .join(
                ""
            );

    }



    function renderBrackets(
        edition
    ) {


        const menMatches =

            edition
                ?.men
                ?.bracket
                ?.rounds
                ?.roundOf16

            ||

            [];


        const womenMatches =

            edition
                ?.women
                ?.bracket
                ?.rounds
                ?.roundOf16

            ||

            [];


        if (

            menMatches.length === 0

            &&

            womenMatches.length === 0

        ) {


            els.brackets.hidden =
                true;


            return;

        }


        els.brackets.hidden =
            false;


        els.menBracket
            .innerHTML =

                renderRoundOne(
                    menMatches
                );


        els.womenBracket
            .innerHTML =

                renderRoundOne(
                    womenMatches
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


        els.menCore
            .innerHTML =

                renderCoreSlots(

                    edition.men
                        ?.coreSlots,

                    "men"

                );


        els.menGuests
            .innerHTML =

                renderGuestSlots(

                    edition.men
                        ?.guestSlots,

                    "men"

                );


        els.womenCore
            .innerHTML =

                renderCoreSlots(

                    edition.women
                        ?.coreSlots,

                    "women"

                );


        els.womenGuests
            .innerHTML =

                renderGuestSlots(

                    edition.women
                        ?.guestSlots,

                    "women"

                );


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


            const edition =

                findEdition(
                    els.year.value
                );


            renderEdition(
                edition
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


            if (
                edition
            ) {


                setSaveStatus(
                    "EDITION LOADED"
                );

            }


            else {


                setSaveStatus(
                    "NO EDITION FOR THIS YEAR"
                );

            }


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


            if (
                !window
                    .LandscapeBraggingRightsEngine
            ) {


                throw new Error(

                    "Bragging Rights engine is not loaded."

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


            state.currentEdition =
                edition;


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

                "Could not create Bragging Rights edition:",

                error

            );


            setSaveStatus(

                error.message

                ||

                "QUALIFICATION FAILED"

            );

        }

    }



    // =================================
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
    // SAVE FIELD
    // =================================


    async function saveField() {


        try {


            setSaveStatus(
                "SAVING FIELD"
            );


            const edition =

                collectFieldInputs();


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


            state.data.editions[index] =
                edition;


            await writeJson(

                "bragging-rights.json",

                state.data

            );


            setSaveStatus(
                "FIELD SAVED"
            );


        }


        catch (
            error
        ) {


            console.error(

                "Could not save Bragging Rights field:",

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
    // LOCK FIELD & DRAW
    // =================================


    async function drawBrackets() {


        try {


            if (
                !window
                    .LandscapeBraggingRightsEngine
            ) {


                throw new Error(

                    "Bragging Rights engine is not loaded."

                );

            }


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


            const menBracket =

                window
                    .LandscapeBraggingRightsEngine
                    .createBracket(

                        edition.men

                    );


            const womenBracket =

                window
                    .LandscapeBraggingRightsEngine
                    .createBracket(

                        edition.women

                    );


            edition.men.entrants =
                menBracket.entrants;


            edition.men.bracket =
                menBracket;


            edition.women.entrants =
                womenBracket.entrants;


            edition.women.bracket =
                womenBracket;


            edition.men.coreSlots

                .forEach(

                    slot =>

                        slot.affiliationFrozen =
                            true

                );


            edition.men.guestSlots

                .forEach(

                    slot =>

                        slot.affiliationFrozen =
                            true

                );


            edition.women.coreSlots

                .forEach(

                    slot =>

                        slot.affiliationFrozen =
                            true

                );


            edition.women.guestSlots

                .forEach(

                    slot =>

                        slot.affiliationFrozen =
                            true

                );


            edition.status =
                "brackets-drawn";


            edition.bracketsDrawnAt =

                new Date()
                    .toISOString();


            const editionIndex =

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


            state.data.editions[
                editionIndex
            ] = edition;


            await writeJson(

                "bragging-rights.json",

                state.data

            );


            state.currentEdition =
                edition;


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

                "Could not draw Bragging Rights brackets:",

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
