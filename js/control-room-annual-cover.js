// =================================
// OWL ANNUAL VIDEO-GAME COVER
// BALLOT AND SCORE ENGINE
// =================================

(() => {
    const RELEASE = { month: 4, week: 4 };

    const FORMULA = {
        performance: 0.50,
        prominence: 0.25,
        companyPrestige: 0.15,
        randomness: 0.10
    };

    const SLOT_COUNT = 5;

    const DIVISIONS = {
        men: {
            label: "Men",
            wrestlerDivision: "Men"
        },

        women: {
            label: "Women",
            wrestlerDivision: "Women"
        }
    };

    const $ =
        id =>
            document.getElementById(id);

    const list =
        value =>
            Array.isArray(value)
                ? value
                : [];

    const text =
        value =>
            String(value || "").trim();

    const number =
        value => {
            if (
                value === "" ||
                value === null ||
                value === undefined
            ) {
                return null;
            }

            const parsed =
                Number(value);

            return Number.isFinite(parsed)
                ? parsed
                : null;
        };

    const score =
        value => {
            const parsed =
                number(value);

            return parsed === null
                ? null
                : Math.min(
                    100,
                    Math.max(
                        0,
                        parsed
                    )
                );
        };

    const escapeHtml =
        value =>
            String(value ?? "")
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");

    const els = {
        panel:
            $("cr-tool-annual-cover"),

        status:
            $("cr-cover-status"),

        editionCount:
            $("cr-cover-edition-count"),

        activeYear:
            $("cr-cover-active-year"),

        menComplete:
            $("cr-cover-men-complete"),

        womenComplete:
            $("cr-cover-women-complete"),

        editionSelect:
            $("cr-cover-edition-select"),

        year:
            $("cr-cover-year"),

        loadYear:
            $("cr-cover-load-year"),

        editionState:
            $("cr-cover-edition-state"),

        prestigePeriod:
            $("cr-cover-prestige-period"),

        landscapeMessage:
            $("cr-cover-landscape-message"),

        randomMode:
            $("cr-cover-random-mode"),

        randomModeNote:
            $("cr-cover-random-mode-note"),

        menContainer:
            $("cr-cover-men-candidates"),

        womenContainer:
            $("cr-cover-women-candidates"),

        menLeaderboard:
            $("cr-cover-men-leaderboard"),

        womenLeaderboard:
            $("cr-cover-women-leaderboard"),

        save:
            $("cr-cover-save-draft"),

        message:
            $("cr-cover-message")
    };

    if (!els.panel) {
        return;
    }

    let companies = [];
    let rankings = null;
    let snapshot = null;
    let activeEdition = null;
    let busy = false;

    const testScores =
        new Map();

    function database() {
        const value =
            owlControlRoomData?.annualCovers;

        if (
            !value ||
            Array.isArray(value) ||
            typeof value !== "object"
        ) {
            return {
                version: 1,

                releaseSchedule: {
                    ...RELEASE
                },

                formula: {
                    ...FORMULA
                },

                editions: []
            };
        }

        return {
            ...value,

            version:
                Number(value.version || 1),

            releaseSchedule: {
                ...RELEASE,
                ...(value.releaseSchedule || {})
            },

            formula: {
                ...FORMULA,
                ...(value.formula || {})
            },

            editions:
                list(value.editions)
        };
    }

    const wrestlers =
        () =>
            list(
                owlControlRoomData?.wrestlers
            );

    const currentYear =
        () =>
            Number(
                els.year.value || 0
            );

    const editionByYear =
        year =>
            database().editions.find(
                edition =>
                    Number(edition?.year) ===
                    Number(year)
            ) || null;

    const companyById =
        id =>
            companies.find(
                company =>
                    company?.id === id
            ) || null;

    const companyName =
        id => {
            const company =
                companyById(id);

            return (
                company?.shortName ||
                company?.name ||
                id ||
                "—"
            );
        };

    const keyFor =
        (
            division,
            slot
        ) =>
            `${division}-${slot}`;

    function defaultCandidate(
        division,
        slot
    ) {
        return {
            id:
                `cover-${currentYear() || "year"}-${division}-${slot}`,

            slot,

            division,

            candidateType:
                "owl",

            wrestlerId:
                "",

            name:
                "",

            companyId:
                "owl",

            companyName:
                "OWL",

            performance:
                null,

            prominence:
                null,

            companyPrestige:
                null,

            prestigePeriodId:
                "",

            randomScore:
                null,

            randomLocked:
                false,

            randomAudit:
                null,

            totalScore:
                null
        };
    }

    function normalizeBallot(
        edition,
        division
    ) {
        const source =
            list(
                edition?.ballots?.[
                    division
                ]
            );

        return Array.from(
            {
                length:
                    SLOT_COUNT
            },

            (
                _,
                index
            ) => ({
                ...defaultCandidate(
                    division,
                    index + 1
                ),

                ...(source[index] || {}),

                slot:
                    index + 1,

                division,

                randomLocked:
                    source[index]
                        ?.randomLocked ===
                            true,

                randomScore:
                    number(
                        source[index]
                            ?.randomScore
                    )
            })
        );
    }

    function setStatus(label) {
        els.status.textContent =
            label;
    }

    function setMessage(
        message,
        type = "success"
    ) {
        els.message.textContent =
            message;

        els.message.className =
            `cr-save-message ${
                type === "error"
                    ? "save-error"
                    : "save-success"
            }`;

        els.message.hidden =
            false;
    }

    function clearMessage() {
        els.message.hidden =
            true;

        els.message.textContent =
            "";
    }

    function getSnapshot(year) {
        const eligible =
            list(rankings?.periods)

                .filter(
                    period => {
                        const match =
                            /^(\d{4})-(\d{2})$/
                                .exec(
                                    text(
                                        period?.periodId
                                    )
                                );

                        return Boolean(
                            match &&

                            Number(match[1]) ===
                                Number(year) &&

                            Number(match[2]) >=
                                1 &&

                            Number(match[2]) <=
                                3 &&

                            Array.isArray(
                                period
                                    ?.ytd
                                    ?.companyRankings
                            )
                        );
                    }
                )

                .sort(
                    (
                        first,
                        second
                    ) =>
                        String(
                            second.periodId
                        ).localeCompare(
                            String(
                                first.periodId
                            )
                        )
                );

        return eligible[0]
            ? {
                periodId:
                    eligible[0].periodId,

                companyRankings:
                    list(
                        eligible[0]
                            .ytd
                            .companyRankings
                    )
            }
            : null;
    }

    function companyPrestige(
        companyId
    ) {
        const item =
            snapshot?.companyRankings
                .find(
                    ranking =>
                        ranking?.companyId ===
                            companyId
                );

        return number(
            item?.landscapeScore
        );
    }

    async function readLandscapeJson(
        fileName
    ) {
        if (!owlRepositoryHandle) {
            throw new Error(
                "Connect the OWL repository first."
            );
        }

        const dataDirectory =
            await owlRepositoryHandle
                .getDirectoryHandle(
                    "data"
                );

        const landscapeDirectory =
            await dataDirectory
                .getDirectoryHandle(
                    "landscape"
                );

        const fileHandle =
            await landscapeDirectory
                .getFileHandle(
                    fileName
                );

        const file =
            await fileHandle.getFile();

        return JSON.parse(
            await file.text()
        );
    }

    async function loadLandscapeSources() {
        try {
            const [
                companyDatabase,
                rankingDatabase
            ] = await Promise.all([
                readLandscapeJson(
                    "companies.json"
                ),

                readLandscapeJson(
                    "rankings.json"
                )
            ]);

            if (
                !Array.isArray(
                    companyDatabase?.companies
                )
            ) {
                throw new Error(
                    "companies.json does not contain a companies array."
                );
            }

            if (
                !Array.isArray(
                    rankingDatabase?.periods
                )
            ) {
                throw new Error(
                    "rankings.json does not contain a periods array."
                );
            }

            companies =
                companyDatabase.companies

                    .filter(
                        company =>
                            company
                                ?.rankingEligible !==
                                    false &&

                            company?.id &&

                            company?.name
                    )

                    .sort(
                        (
                            first,
                            second
                        ) =>
                            String(
                                first.shortName ||
                                first.name
                            ).localeCompare(
                                String(
                                    second.shortName ||
                                    second.name
                                )
                            )
                    );

            rankings =
                rankingDatabase;

            refreshSnapshot();

            renderCandidates();
        }

        catch (error) {
            console.error(
                "Could not load Annual Cover Landscape data:",
                error
            );

            companies = [];
            rankings = null;
            snapshot = null;

            els.prestigePeriod.textContent =
                "UNAVAILABLE";

            els.landscapeMessage.textContent =
                error.message ||
                "Landscape prestige data could not be loaded.";

            els.landscapeMessage.className =
                "cr-save-message save-error";

            els.landscapeMessage.hidden =
                false;
        }
    }

    function refreshSnapshot() {
        snapshot =
            getSnapshot(
                currentYear()
            );

        els.prestigePeriod.textContent =
            snapshot?.periodId ||
            "NO PRE-RELEASE SNAPSHOT";

        els.landscapeMessage.textContent =
            snapshot
                ? `Company Prestige is frozen from ${snapshot.periodId} YTD Landscape company rankings.`
                : `No January–March YTD Landscape snapshot exists for ${currentYear() || "this edition"}. Future-dated periods are ignored.`;

        els.landscapeMessage.className =
            `cr-save-message ${
                snapshot
                    ? "save-success"
                    : "save-error"
            }`;

        els.landscapeMessage.hidden =
            false;
    }

    function secureRandomScore() {
        if (
            !window.crypto
                ?.getRandomValues
        ) {
            throw new Error(
                "Secure browser randomness is unavailable."
            );
        }

        const values =
            new Uint32Array(1);

        const maximum =
            0x100000000;

        const limit =
            maximum -
            (
                maximum %
                100
            );

        do {
            window.crypto
                .getRandomValues(
                    values
                );
        }

        while (
            values[0] >=
            limit
        );

        return (
            values[0] %
            100
        ) + 1;
    }

    function weightedTotal(
        candidate,
        randomValue
    ) {
        const values = {
            performance:
                score(
                    candidate.performance
                ),

            prominence:
                score(
                    candidate.prominence
                ),

            companyPrestige:
                score(
                    candidate.companyPrestige
                ),

            randomness:
                score(
                    randomValue
                )
        };

        if (
            Object.values(values)
                .some(
                    value =>
                        value === null
                )
        ) {
            return null;
        }

        return Number(
            (
                values.performance *
                    FORMULA.performance +

                values.prominence *
                    FORMULA.prominence +

                values.companyPrestige *
                    FORMULA.companyPrestige +

                values.randomness *
                    FORMULA.randomness
            ).toFixed(2)
        );
    }

    function wrestlerOptions(
        division,
        selectedId = ""
    ) {
        const options =
            wrestlers()

                .filter(
                    wrestler =>
                        wrestler?.id &&

                        wrestler?.name &&

                        wrestler?.division ===
                            division
                )

                .sort(
                    (
                        first,
                        second
                    ) =>
                        String(
                            first.name
                        ).localeCompare(
                            String(
                                second.name
                            )
                        )
                )

                .map(
                    wrestler => `
                        <option
                            value="${escapeHtml(wrestler.id)}"
                            ${
                                wrestler.id ===
                                    selectedId
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${escapeHtml(wrestler.name)}
                        </option>
                    `
                );

        return [
            '<option value="">Select Wrestler</option>',
            ...options
        ].join("");
    }

    function companyOptions(
        selectedId = ""
    ) {
        const options =
            companies

                .filter(
                    company =>
                        company.id !==
                            "owl"
                )

                .map(
                    company => `
                        <option
                            value="${escapeHtml(company.id)}"
                            ${
                                company.id ===
                                    selectedId
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${escapeHtml(
                                company.shortName ||
                                company.name
                            )}
                        </option>
                    `
                );

        return [
            '<option value="">Select Company</option>',
            ...options
        ].join("");
    }

    function createCandidateCard(
        division,
        candidate
    ) {
        const meta =
            DIVISIONS[
                division
            ];

        const locked =
            candidate.randomLocked ===
                true;

        const livePrestige =
            companyPrestige(
                candidate.candidateType ===
                    "external"
                    ? candidate.companyId
                    : "owl"
            );

        const shownPrestige =
            locked &&
            number(
                candidate.companyPrestige
            ) !== null

                ? number(
                    candidate.companyPrestige
                )

                : livePrestige;

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "cr-cover-candidate-card";

        card.dataset.division =
            division;

        card.dataset.slot =
            String(
                candidate.slot
            );

        card.innerHTML = `
            <div class="cr-cover-candidate-heading">

                <div>

                    <span>
                        ${meta.label.toUpperCase()} CANDIDATE ${candidate.slot}
                    </span>

                    <h4>
                        ${escapeHtml(candidate.name || "Open Candidate Slot")}
                    </h4>

                </div>

                <strong
                    class="cr-cover-lock-badge ${
                        locked
                            ? "is-locked"
                            : ""
                    }"
                >
                    ${
                        locked
                            ? "CANON LOCKED"
                            : "DRAFT"
                    }
                </strong>

            </div>


            <div class="cr-editor-form-grid">

                <div class="cr-form-group">

                    <label>
                        CANDIDATE TYPE
                    </label>

                    <select
                        data-cover-field="candidateType"
                        ${locked ? "disabled" : ""}
                    >

                        <option
                            value="owl"
                            ${
                                candidate.candidateType !==
                                    "external"
                                    ? "selected"
                                    : ""
                            }
                        >
                            OWL Wrestler
                        </option>

                        <option
                            value="external"
                            ${
                                candidate.candidateType ===
                                    "external"
                                    ? "selected"
                                    : ""
                            }
                        >
                            External Wrestler
                        </option>

                    </select>

                </div>


                <div
                    class="cr-form-group"
                    data-cover-row="wrestler"
                    ${
                        candidate.candidateType ===
                            "external"
                            ? "hidden"
                            : ""
                    }
                >

                    <label>
                        OWL WRESTLER
                    </label>

                    <select
                        data-cover-field="wrestlerId"
                        ${locked ? "disabled" : ""}
                    >
                        ${wrestlerOptions(
                            meta.wrestlerDivision,
                            candidate.wrestlerId
                        )}
                    </select>

                </div>


                <div
                    class="cr-form-group"
                    data-cover-row="external"
                    ${
                        candidate.candidateType ===
                            "external"
                            ? ""
                            : "hidden"
                    }
                >

                    <label>
                        EXTERNAL WRESTLER
                    </label>

                    <input
                        data-cover-field="externalName"
                        type="text"
                        autocomplete="off"
                        value="${escapeHtml(
                            candidate.candidateType ===
                                "external"
                                ? candidate.name
                                : ""
                        )}"
                        placeholder="Enter wrestler name"
                        ${locked ? "disabled" : ""}
                    >

                </div>


                <div
                    class="cr-form-group"
                    data-cover-row="company"
                    ${
                        candidate.candidateType ===
                            "external"
                            ? ""
                            : "hidden"
                    }
                >

                    <label>
                        COMPANY
                    </label>

                    <select
                        data-cover-field="companyId"
                        ${locked ? "disabled" : ""}
                    >
                        ${companyOptions(
                            candidate.companyId
                        )}
                    </select>

                </div>


                <div class="cr-form-group">

                    <label>
                        PERFORMANCE — 0 TO 100
                    </label>

                    <input
                        data-cover-field="performance"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value="${candidate.performance ?? ""}"
                        ${locked ? "disabled" : ""}
                    >

                </div>


                <div class="cr-form-group">

                    <label>
                        PROMINENCE / STAR POWER — 0 TO 100
                    </label>

                    <input
                        data-cover-field="prominence"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value="${candidate.prominence ?? ""}"
                        ${locked ? "disabled" : ""}
                    >

                </div>

            </div>


            <div class="cr-cover-score-strip">

                <div>

                    <span>
                        COMPANY PRESTIGE
                    </span>

                    <strong data-cover-readout="prestige">
                        ${shownPrestige ?? "—"}
                    </strong>

                    <small>
                        ${escapeHtml(
                            locked
                                ? candidate.prestigePeriodId ||
                                    "Frozen source"
                                : snapshot?.periodId ||
                                    "No valid snapshot"
                        )}
                    </small>

                </div>


                <div>

                    <span>
                        RANDOMNESS
                    </span>

                    <strong data-cover-readout="random">
                        ${
                            locked
                                ? candidate.randomScore
                                : "NOT DRAWN"
                        }
                    </strong>

                    <small data-cover-readout="random-note">
                        ${
                            locked
                                ? "Permanent canon score"
                                : "Awaiting draw"
                        }
                    </small>

                </div>


                <div>

                    <span>
                        WEIGHTED TOTAL
                    </span>

                    <strong data-cover-readout="total">
                        ${candidate.totalScore ?? "—"}
                    </strong>

                    <small>
                        50 / 25 / 15 / 10
                    </small>

                </div>

            </div>


            <div class="cr-manager-actions">

                <button
                    class="control-room-button ${
                        locked
                            ? "control-room-button-secondary"
                            : "control-room-button-primary"
                    }"
                    type="button"
                    data-cover-action="random"
                    ${locked ? "disabled" : ""}
                >
                    ${
                        locked
                            ? "Canon Score Locked"
                            : "Generate Random Score"
                    }
                </button>

            </div>
        `;

        bindCandidateCard(
            card
        );

        return card;
    }

    function savedCandidate(
        division,
        slot
    ) {
        return normalizeBallot(
            activeEdition,
            division
        )[slot - 1];
    }

    function candidateFromRow(row) {
        const division =
            row.dataset.division;

        const slot =
            Number(
                row.dataset.slot
            );

        const type =
            row.querySelector(
                "[data-cover-field='candidateType']"
            ).value;

        const wrestlerId =
            row.querySelector(
                "[data-cover-field='wrestlerId']"
            ).value;

        const selectedWrestler =
            wrestlers().find(
                wrestler =>
                    wrestler?.id ===
                        wrestlerId
            ) || null;

        const companyId =
            type === "owl"
                ? "owl"
                : row.querySelector(
                    "[data-cover-field='companyId']"
                ).value;

        const saved =
            savedCandidate(
                division,
                slot
            );

        const locked =
            saved?.randomLocked ===
                true;

        const livePrestige =
            companyPrestige(
                companyId
            );

        const frozenPrestige =
            locked
                ? number(
                    saved.companyPrestige
                )
                : null;

        const candidate = {
            id:
                `cover-${currentYear()}-${division}-${slot}`,

            slot,

            division,

            candidateType:
                type,

            wrestlerId:
                type === "owl"
                    ? selectedWrestler?.id ||
                        ""
                    : "",

            name:
                type === "owl"
                    ? selectedWrestler?.name ||
                        ""
                    : text(
                        row.querySelector(
                            "[data-cover-field='externalName']"
                        ).value
                    ),

            companyId,

            companyName:
                locked
                    ? saved.companyName ||
                        companyName(
                            companyId
                        )
                    : companyName(
                        companyId
                    ),

            performance:
                score(
                    row.querySelector(
                        "[data-cover-field='performance']"
                    ).value
                ),

            prominence:
                score(
                    row.querySelector(
                        "[data-cover-field='prominence']"
                    ).value
                ),

            companyPrestige:
                frozenPrestige !==
                    null
                    ? frozenPrestige
                    : livePrestige,

            prestigePeriodId:
                locked
                    ? saved.prestigePeriodId ||
                        snapshot?.periodId ||
                        ""
                    : snapshot?.periodId ||
                        "",

            randomScore:
                locked
                    ? number(
                        saved.randomScore
                    )
                    : null,

            randomLocked:
                locked,

            randomAudit:
                locked
                    ? saved.randomAudit ||
                        null
                    : null,

            totalScore:
                null
        };

        candidate.totalScore =
            weightedTotal(
                candidate,
                candidate.randomScore
            );

        return candidate;
    }

    function allRows() {
        return [
            ...els.panel.querySelectorAll(
                ".cr-cover-candidate-card"
            )
        ];
    }

    function toggleCandidateType(
        card
    ) {
        const external =
            card.querySelector(
                "[data-cover-field='candidateType']"
            ).value ===
                "external";

        card.querySelector(
            "[data-cover-row='wrestler']"
        ).hidden =
            external;

        card.querySelector(
            "[data-cover-row='external']"
        ).hidden =
            !external;

        card.querySelector(
            "[data-cover-row='company']"
        ).hidden =
            !external;
    }

    function displayedRandom(
        candidate
    ) {
        if (
            candidate.randomLocked
        ) {
            return candidate.randomScore;
        }

        if (
            els.randomMode.value !==
                "test"
        ) {
            return null;
        }

        return testScores.get(
            keyFor(
                candidate.division,
                candidate.slot
            )
        ) ?? null;
    }

    function refreshCard(card) {
        const candidate =
            candidateFromRow(
                card
            );

        const randomValue =
            displayedRandom(
                candidate
            );

        const total =
            weightedTotal(
                candidate,
                randomValue
            );

        card.querySelector(
            "h4"
        ).textContent =
            candidate.name ||
            "Open Candidate Slot";

        card.querySelector(
            "[data-cover-readout='prestige']"
        ).textContent =
            candidate.companyPrestige ??
            "—";

        card.querySelector(
            "[data-cover-readout='random']"
        ).textContent =
            randomValue ??
            "NOT DRAWN";

        card.querySelector(
            "[data-cover-readout='random-note']"
        ).textContent =
            candidate.randomLocked
                ? "Permanent canon score"
                : randomValue !== null
                    ? "Temporary test score — not saved"
                    : "Awaiting draw";

        card.querySelector(
            "[data-cover-readout='total']"
        ).textContent =
            total ??
            "—";
    }

    function bindCandidateCard(card) {
        const typeField =
            card.querySelector(
                "[data-cover-field='candidateType']"
            );

        card.querySelectorAll(
            "[data-cover-field]"
        ).forEach(
            field => {
                field.addEventListener(
                    field.tagName ===
                        "SELECT"
                        ? "change"
                        : "input",

                    () => {
                        clearMessage();

                        testScores.delete(
                            keyFor(
                                card.dataset.division,
                                card.dataset.slot
                            )
                        );

                        if (
                            field ===
                                typeField
                        ) {
                            toggleCandidateType(
                                card
                            );
                        }

                        refreshCard(
                            card
                        );

                        renderLeaderboards();

                        renderSummary();
                    }
                );
            }
        );

        card.querySelector(
            "[data-cover-action='random']"
        ).addEventListener(
            "click",
            () =>
                generateRandom(
                    card
                )
        );
    }

    function renderCandidates() {
        const containers = {
            men:
                els.menContainer,

            women:
                els.womenContainer
        };

        Object.keys(
            DIVISIONS
        ).forEach(
            division => {
                containers[
                    division
                ].innerHTML =
                    "";

                normalizeBallot(
                    activeEdition,
                    division
                ).forEach(
                    candidate => {
                        containers[
                            division
                        ].appendChild(
                            createCandidateCard(
                                division,
                                candidate
                            )
                        );
                    }
                );
            }
        );

        renderSummary();

        renderLeaderboards();
    }

        function buildDraft() {
        const year =
            currentYear();

        const existing =
            editionByYear(
                year
            );

        const ballots = {
            men: [],
            women: []
        };

        allRows().forEach(
            row => {
                ballots[
                    row.dataset.division
                ].push(
                    candidateFromRow(
                        row
                    )
                );
            }
        );

        Object.values(
            ballots
        ).forEach(
            values =>
                values.sort(
                    (
                        first,
                        second
                    ) =>
                        first.slot -
                        second.slot
                )
        );

        return {
            ...(
                existing &&
                typeof existing ===
                    "object"

                    ? existing

                    : {}
            ),

            id:
                `annual-cover-${year}`,

            year,

            releaseMonth:
                RELEASE.month,

            releaseWeek:
                RELEASE.week,

            status:
                text(
                    existing?.status
                ) ||
                "draft",

            formula: {
                ...FORMULA
            },

            prestigePeriodId:
                snapshot?.periodId ||
                existing?.prestigePeriodId ||
                "",

            ballots,

            winners: {
                ...(
                    existing?.winners &&
                    typeof existing.winners ===
                        "object"

                        ? existing.winners

                        : {}
                )
            },

            presentation: {

                men: {
                    ...(
                        existing
                            ?.presentation
                            ?.men

                        ||

                        {}
                    )
                },

                women: {
                    ...(
                        existing
                            ?.presentation
                            ?.women

                        ||

                        {}
                    )
                }

            },

            createdAt:
                existing?.createdAt ||
                new Date()
                    .toISOString(),

            updatedAt:
                new Date()
                    .toISOString()
        };
    }

    function validateDraft(
        edition,
        candidate = null
    ) {
        if (
            !Number.isInteger(
                edition.year
            ) ||
            edition.year < 2026
        ) {
            return "Enter an edition year of 2026 or later.";
        }

        const candidates = [
            ...edition.ballots.men,
            ...edition.ballots.women
        ];

        const names =
            candidates

                .map(
                    item =>
                        text(
                            item.name
                        ).toLowerCase()
                )

                .filter(Boolean);

        if (
            new Set(names).size !==
            names.length
        ) {
            return "The same candidate cannot appear more than once in an edition.";
        }

        if (!candidate) {
            return "";
        }

        if (!candidate.name) {
            return "Complete the candidate identity before generating a score.";
        }

        if (!candidate.companyId) {
            return "Select the candidate’s company before generating a score.";
        }

        if (
            candidate.performance ===
                null ||
            candidate.prominence ===
                null
        ) {
            return "Enter Performance and Prominence before generating a score.";
        }

        if (
            candidate.companyPrestige ===
                null
        ) {
            return "A valid January–March YTD Landscape snapshot is required before generating a score.";
        }

        return "";
    }

    async function writeDatabase(
        value
    ) {
        if (!owlRepositoryHandle) {
            throw new Error(
                "Connect the OWL repository first."
            );
        }

        const options = {
            mode:
                "readwrite"
        };

        let permission =
            await owlRepositoryHandle
                .queryPermission(
                    options
                );

        if (
            permission !==
                "granted"
        ) {
            permission =
                await owlRepositoryHandle
                    .requestPermission(
                        options
                    );
        }

        if (
            permission !==
                "granted"
        ) {
            throw new Error(
                "Repository write permission was not granted."
            );
        }

        const dataDirectory =
            await owlRepositoryHandle
                .getDirectoryHandle(
                    "data"
                );

        const fileHandle =
            await dataDirectory
                .getFileHandle(
                    "annual-covers.json"
                );

        const writable =
            await fileHandle
                .createWritable();

        try {
            await writable.write(
                `${JSON.stringify(
                    value,
                    null,
                    2
                )}\n`
            );

            await writable.close();
        }

        catch (error) {
            try {
                await writable.abort();
            }

            catch {
                // No additional action required.
            }

            throw error;
        }
    }

    async function persistEdition(
        edition
    ) {
        const current =
            database();

        const updated = {
            ...current,

            version:
                Number(
                    current.version ||
                    1
                ),

            releaseSchedule: {
                ...RELEASE
            },

            formula: {
                ...FORMULA
            },

            editions: [
                edition,

                ...current.editions.filter(
                    item =>
                        Number(item?.year) !==
                            edition.year
                )
            ].sort(
                (
                    first,
                    second
                ) =>
                    Number(
                        second.year || 0
                    ) -
                    Number(
                        first.year || 0
                    )
            )
        };

        await writeDatabase(
            updated
        );

        owlControlRoomData.annualCovers =
            updated;

        activeEdition =
            edition;

        window.dispatchEvent(
            new CustomEvent(
                "owl-annual-covers-updated"
            )
        );
    }

    function leaderboardValues(
        division
    ) {
        return allRows()

            .filter(
                row =>
                    row.dataset.division ===
                        division
            )

            .map(
                row => {
                    const candidate =
                        candidateFromRow(
                            row
                        );

                    const randomValue =
                        displayedRandom(
                            candidate
                        );

                    return {
                        ...candidate,

                        displayRandom:
                            randomValue,

                        displayTotal:
                            weightedTotal(
                                candidate,
                                randomValue
                            )
                    };
                }
            );
    }

    function compareCandidates(
        first,
        second
    ) {
        const firstComplete =
            first.displayTotal !==
                null;

        const secondComplete =
            second.displayTotal !==
                null;

        if (
            firstComplete !==
                secondComplete
        ) {
            return firstComplete
                ? -1
                : 1;
        }

        if (
            firstComplete &&
            secondComplete
        ) {
            const fields = [
                "displayTotal",
                "performance",
                "prominence",
                "companyPrestige",
                "displayRandom"
            ];

            for (
                const field
                of fields
            ) {
                const difference =
                    Number(
                        second[field] ||
                        0
                    ) -
                    Number(
                        first[field] ||
                        0
                    );

                if (
                    difference !==
                        0
                ) {
                    return difference;
                }
            }
        }

        return String(
            first.name || ""
        ).localeCompare(
            String(
                second.name || ""
            )
        );
    }

    function renderLeaderboard(
        division,
        container
    ) {
        const values =
            leaderboardValues(
                division
            )

                .filter(
                    candidate =>
                        candidate.name ||

                        candidate.performance !==
                            null ||

                        candidate.prominence !==
                            null
                )

                .sort(
                    compareCandidates
                );

        container.innerHTML =
            "";

        if (!values.length) {
            container.innerHTML =
                '<p class="cr-landscape-entry-empty">No candidates have been entered yet.</p>';

            return;
        }

        values.forEach(
            (
                candidate,
                index
            ) => {
                const row =
                    document.createElement(
                        "article"
                    );

                row.className =
                    "cr-cover-leaderboard-row";

                row.innerHTML = `
                    <strong class="cr-cover-rank">
                        ${
                            candidate.displayTotal !==
                                null
                                ? index + 1
                                : "—"
                        }
                    </strong>

                    <div class="cr-cover-leaderboard-name">

                        <span>
                            ${escapeHtml(candidate.name || "Incomplete Candidate")}
                        </span>

                        <small>
                            ${escapeHtml(candidate.companyName || "Company pending")}
                        </small>

                    </div>

                    <div>

                        <span>
                            PERF
                        </span>

                        <strong>
                            ${candidate.performance ?? "—"}
                        </strong>

                    </div>

                    <div>

                        <span>
                            STAR
                        </span>

                        <strong>
                            ${candidate.prominence ?? "—"}
                        </strong>

                    </div>

                    <div>

                        <span>
                            PRESTIGE
                        </span>

                        <strong>
                            ${candidate.companyPrestige ?? "—"}
                        </strong>

                    </div>

                    <div>

                        <span>
                            RANDOM
                        </span>

                        <strong>
                            ${candidate.displayRandom ?? "—"}
                        </strong>

                    </div>

                    <div class="cr-cover-total">

                        <span>
                            TOTAL
                        </span>

                        <strong>
                            ${candidate.displayTotal ?? "PENDING"}
                        </strong>

                    </div>
                `;

                container.appendChild(
                    row
                );
            }
        );
    }

    function renderLeaderboards() {
        renderLeaderboard(
            "men",
            els.menLeaderboard
        );

        renderLeaderboard(
            "women",
            els.womenLeaderboard
        );
    }

    function completedCount(
        division
    ) {
        return leaderboardValues(
            division
        ).filter(
            candidate =>
                candidate.name &&

                candidate.performance !==
                    null &&

                candidate.prominence !==
                    null &&

                candidate.companyPrestige !==
                    null &&

                candidate.randomLocked &&

                candidate.randomScore !==
                    null
        ).length;
    }

    function renderSummary() {
        els.editionCount.textContent =
            database().editions.length;

        els.activeYear.textContent =
            currentYear() ||
            "—";

        els.menComplete.textContent =
            `${completedCount("men")} / ${SLOT_COUNT}`;

        els.womenComplete.textContent =
            `${completedCount("women")} / ${SLOT_COUNT}`;
    }

    function populateEditionSelect() {
        const previous =
            els.editionSelect.value;

        const editions =
            [...database().editions]

                .sort(
                    (
                        first,
                        second
                    ) =>
                        Number(
                            second.year || 0
                        ) -
                        Number(
                            first.year || 0
                        )
                );

        els.editionSelect.innerHTML =
            '<option value="">Select Saved Edition</option>';

        editions.forEach(
            edition => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    String(
                        edition.year
                    );

                option.textContent =
                    `${edition.year} — ${String(
                        edition.status ||
                        "draft"
                    ).toUpperCase()}`;

                els.editionSelect.appendChild(
                    option
                );
            }
        );

        if (
            editions.some(
                edition =>
                    String(
                        edition.year
                    ) ===
                    previous
            )
        ) {
            els.editionSelect.value =
                previous;
        }
    }

    function loadYear() {
        clearMessage();

        activeEdition =
            editionByYear(
                currentYear()
            );

        testScores.clear();

        els.editionState.textContent =
            activeEdition
                ? "SAVED DRAFT"
                : "NEW DRAFT";

        refreshSnapshot();

        renderCandidates();

        setStatus(
            "READY"
        );
    }

    async function saveDraft() {
        if (busy) {
            return;
        }

        const edition =
            buildDraft();

        const error =
            validateDraft(
                edition
            );

        if (error) {
            setMessage(
                error,
                "error"
            );

            return;
        }

        const approved =
            window.confirm(
                `Save the ${edition.year} Annual Cover draft?\n\n` +
                "This does not select or publish either winner."
            );

        if (!approved) {
            return;
        }

        busy =
            true;

        els.save.disabled =
            true;

        setStatus(
            "SAVING"
        );

        try {
            await persistEdition(
                edition
            );

            populateEditionSelect();

            els.editionSelect.value =
                String(
                    edition.year
                );

            loadYear();

            setMessage(
                `${edition.year} Annual Cover draft saved.`
            );
        }

        catch (error) {
            console.error(
                "Could not save Annual Cover draft:",
                error
            );

            setMessage(
                error.message ||
                "Could not save the Annual Cover draft.",
                "error"
            );
        }

        finally {
            busy =
                false;

            els.save.disabled =
                false;

            setStatus(
                "READY"
            );
        }
    }

    async function generateRandom(
        card
    ) {
        if (busy) {
            return;
        }

        const edition =
            buildDraft();

        const candidate =
            edition.ballots[
                card.dataset.division
            ][
                Number(
                    card.dataset.slot
                ) - 1
            ];

        const error =
            validateDraft(
                edition,
                candidate
            );

        if (error) {
            setMessage(
                error,
                "error"
            );

            return;
        }

        if (
            els.randomMode.value ===
                "test"
        ) {
            const value =
                secureRandomScore();

            testScores.set(
                keyFor(
                    candidate.division,
                    candidate.slot
                ),
                value
            );

            refreshCard(
                card
            );

            renderLeaderboards();

            setMessage(
                `${candidate.name} received a temporary TEST score of ${value}. It was not saved.`
            );

            return;
        }

        if (
            candidate.randomLocked
        ) {
            setMessage(
                `${candidate.name} already has a locked canon score.`,
                "error"
            );

            return;
        }

        const approved =
            window.confirm(
                `Generate and permanently lock ${candidate.name}’s canon randomness score?\n\n` +
                "The candidate identity and all four scoring inputs will be locked. There is no reroll."
            );

        if (!approved) {
            return;
        }

        busy =
            true;

        setStatus(
            "LOCKING SCORE"
        );

        try {
            const value =
                secureRandomScore();

            candidate.randomScore =
                value;

            candidate.randomLocked =
                true;

            candidate.randomAudit = {
                mode:
                    "canon",

                method:
                    "crypto.getRandomValues",

                range:
                    "1-100",

                generatedAt:
                    new Date()
                        .toISOString()
            };

            candidate.totalScore =
                weightedTotal(
                    candidate,
                    value
                );

            edition.updatedAt =
                new Date()
                    .toISOString();

            await persistEdition(
                edition
            );

            testScores.delete(
                keyFor(
                    candidate.division,
                    candidate.slot
                )
            );

            populateEditionSelect();

            els.editionSelect.value =
                String(
                    edition.year
                );

            loadYear();

            setMessage(
                `${candidate.name} received a permanent canon randomness score of ${value}.`
            );
        }

        catch (error) {
            console.error(
                "Could not lock Annual Cover randomness:",
                error
            );

            setMessage(
                error.message ||
                "Could not lock the canon randomness score.",
                "error"
            );
        }

        finally {
            busy =
                false;

            setStatus(
                "READY"
            );
        }
    }

    function renderRandomMode() {
        const canon =
            els.randomMode.value ===
                "canon";

        els.randomModeNote.textContent =
            canon
                ? "CANON MODE permanently saves one secure 1–100 score and locks that candidate row. There is no reroll."
                : "TEST MODE creates temporary preview scores only. Test results disappear on reload and are never written to canon.";

        els.randomModeNote.className =
            `cr-cover-random-note ${
                canon
                    ? "is-canon"
                    : "is-test"
            }`;

        allRows().forEach(
            refreshCard
        );

        renderLeaderboards();
    }

    function initialize() {
        populateEditionSelect();

        if (!currentYear()) {
            els.year.value =
                String(
                    new Date()
                        .getFullYear()
                );
        }

        activeEdition =
            editionByYear(
                currentYear()
            );

        renderRandomMode();

        loadLandscapeSources();

        loadYear();
    }

    els.loadYear.addEventListener(
        "click",
        loadYear
    );

    els.year.addEventListener(
        "change",
        loadYear
    );

    els.editionSelect.addEventListener(
        "change",
        () => {
            if (
                !els.editionSelect.value
            ) {
                return;
            }

            els.year.value =
                els.editionSelect.value;

            loadYear();
        }
    );

    els.randomMode.addEventListener(
        "change",
        renderRandomMode
    );

    els.save.addEventListener(
        "click",
        saveDraft
    );

    window.addEventListener(
        "owl-control-room-data-loaded",
        initialize
    );

    window.addEventListener(
        "owl-annual-covers-updated",
        () => {
            populateEditionSelect();

            renderSummary();
        }
    );

    if (
        typeof owlControlRoomData !==
            "undefined" &&

        wrestlers().length
    ) {
        initialize();
    }
})();
