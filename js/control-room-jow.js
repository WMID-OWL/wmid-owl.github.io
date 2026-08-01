// =================================
// JOURNEY OF WRESTLING
// CONTROL ROOM EMBED PROOF OF CONCEPT
// =================================


(() => {


    const JOW_URL =
        "https://www.journeyofwrestling.com/";


    const STORAGE_KEY =
        "owl-jow-embed-proof-v1";


    const els = {

        panel:
            document.getElementById(
                "cr-tool-jow"
            ),

        status:
            document.getElementById(
                "cr-jow-status"
            ),

        workspace:
            document.getElementById(
                "cr-jow-workspace"
            ),

        shell:
            document.getElementById(
            ),

        shell:
            document.getElementById(
                "cr-jow-frame-shell"
            ),

        placeholder:
            document.getElementById(
                "cr-jow-frame-placeholder"
            ),

        frame:
            document.getElementById(
                "cr-jow-frame"
            ),

        start:
            document.getElementById(
                "cr-jow-start"
            ),

        reload:
            document.getElementById(
                "cr-jow-reload"
            ),

        expand:
            document.getElementById(
                "cr-jow-expand"
            ),

        message:
            document.getElementById(
                "cr-jow-message"
            ),

        checkVisible:
            document.getElementById(
                "cr-jow-check-visible"
            ),

        checkLogin:
            document.getElementById(
                "cr-jow-check-login"
            ),

        checkSession:
            document.getElementById(
                "cr-jow-check-session"
            ),

        checkSave:
            document.getElementById(
                "cr-jow-check-save"
            ),

        checkUsable:
            document.getElementById(
                "cr-jow-check-usable"
            ),

        pass:
            document.getElementById(
                "cr-jow-pass"
            ),

        fail:
            document.getElementById(
                "cr-jow-fail"
            ),

        verdict:
            document.getElementById(
                "cr-jow-verdict"
            )

    };


    if (
        !els.panel
        ||
        !els.frame
    ) {

        return;

    }


    const checklist = [

        {
            key:
                "visible",

            element:
                els.checkVisible
        },

        {
            key:
                "login",

            element:
                els.checkLogin
        },

        {
            key:
                "session",

            element:
                els.checkSession
        },

        {
            key:
                "save",

            element:
                els.checkSave
        },

        {
            key:
                "usable",

            element:
                els.checkUsable
        }

    ];


    let testStarted =
        false;


    let loadTimer =
        null;


    // =================================
    // STATUS
    // =================================


    function setStatus(
        label,
        stateName
    ) {

        if (
            !els.status
        ) {

            return;

        }


        els.status.textContent =
            label;


        els.status.className =
            `control-room-health-summary cr-jow-status is-${stateName}`;

    }


    function setMessage(
        message,
        type = "info"
    ) {

        if (
            !els.message
        ) {

            return;

        }


        els.message.textContent =
            message;


        els.message.className =
            `cr-save-message ${
                type === "error"

                    ? "save-error"

                    : type === "success"

                        ? "save-success"

                        : "cr-jow-info-message"
            }`;


        els.message.hidden =
            false;

    }


    // =================================
    // LOCAL TEST STATE
    // =================================


    function defaultState() {

        return {

            checks: {

                visible:
                    false,

                login:
                    false,

                session:
                    false,

                save:
                    false,

                usable:
                    false

            },

            verdict:
                "",

            updatedAt:
                ""

        };

    }


    function readState() {

        try {

            const stored =
                window.localStorage.getItem(
                    STORAGE_KEY
                );


            if (
                !stored
            ) {

                return defaultState();

            }


            const parsed =
                JSON.parse(
                    stored
                );


            return {

                ...defaultState(),

                ...parsed,

                checks: {

                    ...defaultState().checks,

                    ...(
                        parsed.checks ||
                        {}
                    )

                }

            };

        }

        catch (
            error
        ) {

            console.warn(
                "Could not read the JoW embed test state:",
                error
            );


            return defaultState();

        }

    }


    function currentState(
        verdictOverride = null
    ) {

        const existing =
            readState();


        const checks =
            {};


        checklist.forEach(
            item => {

                checks[
                    item.key
                ] =
                    Boolean(
                        item.element?.checked
                    );

            }
        );


        return {

            checks,

            verdict:

                verdictOverride ===
                    null

                    ? existing.verdict

                    : verdictOverride,

            updatedAt:
                new Date().toISOString()

        };

    }


    function saveState(
        verdictOverride = null
    ) {

        try {

            window.localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify(
                    currentState(
                        verdictOverride
                    )
                )

            );

        }

        catch (
            error
        ) {

            console.warn(
                "Could not save the JoW embed test state:",
                error
            );

        }

    }


    function restoreState() {

        const stored =
            readState();


        checklist.forEach(
            item => {

                if (
                    item.element
                ) {

                    item.element.checked =
                        Boolean(
                            stored.checks[
                                item.key
                            ]
                        );

                }

            }
        );


        renderStoredVerdict(
            stored.verdict
        );

    }


    // =================================
    // FRAME
    // =================================


    function clearLoadTimer() {

        if (
            loadTimer
        ) {

            window.clearTimeout(
                loadTimer
            );


            loadTimer =
                null;

        }

    }


    function beginLoadTimeout() {

        clearLoadTimer();


        loadTimer =
            window.setTimeout(
                () => {

                    if (
                        !testStarted
                    ) {

                        return;

                    }


                    setStatus(
                        "CHECK FRAME",
                        "review"
                    );


                    setMessage(

                        "JoW has not produced a clearly confirmed load result. Inspect the embedded window for a blank page, browser error, login problem, or refused connection.",

                        "error"

                    );

                },

                12000
            );

    }


    function prepareFrame() {

        testStarted =
            true;


        els.placeholder.hidden =
            true;


        els.frame.hidden =
            false;


        els.reload.disabled =
            false;


        els.expand.disabled =
            false;


        els.fail.disabled =
            false;


        setStatus(
            "LOADING",
            "loading"
        );


        setMessage(

            "Loading Journey of Wrestling. The frame response alone does not prove compatibility—visually confirm the page and complete the checklist."

        );


        beginLoadTimeout();

    }


    function startEmbeddedTest() {

        prepareFrame();


        els.frame.src =
            JOW_URL;


        els.start.textContent =
            "Restart Embedded Test";

    }


    function reloadEmbeddedTest() {

        if (
            !testStarted
        ) {

            startEmbeddedTest();


            return;

        }


        prepareFrame();


        els.frame.src =
            "about:blank";


        window.setTimeout(
            () => {

                els.frame.src =
                    J        els.frame.src =
            "about:blank";


OW_URL;

            },

            80
        );

    }


    function handleFrameLoad() {

        if (
            !testStarted

            ||

            els.frame.getAttribute(
                "src"
            ) ===
                "about:blank"
        ) {

            return;

        }


        clearLoadTimer();


        setStatus(
            "FRAME RESPONDED",
            "review"
        );


        setMessage(

            "The browser received a frame response. Check the actual window before marking Page visibly loads; blocked pages can still produce a frame event."

        );


        updateVerdictButtons();

    }


    // =================================
    // EXPANDED WINDOW
    // =================================


    function toggleExpandedWindow() {

        const expanded =
            els.workspace.classList.toggle(
                "is-expanded"
            );


        document.body.classList.toggle(
            "cr-jow-window-expanded",
            expanded
        );


        els.expand.textContent =
            expanded

                ? "Exit Expanded Window"

                : "Expand Window";

    }


    // =================================
    // CHECKLIST AND VERDICT
    // =================================


    function everyCheckPassed() {

        return checklist.every(
            item =>
                Boolean(
                    item.element?.checked
                )
        );

    }


    function updateVerdictButtons() {

        els

                ? "Exit Expanded Window"

                : "Expand Window";

   .pass.disabled =
            !testStarted

            ||

            !everyCheckPassed();


        els.fail.disabled =
            !testStarted;

    }


    function renderStoredVerdict(
        verdict
    ) {

        if (
            !els.verdict
        ) {

            return;

        }


        if (
            verdict ===
                "working"
        ) {

            els.verdict.hidden =
                false;


            els.verdict.className =
                "cr-jow-verdict is-working";


            els.verdict.innerHTML = `

                <strong>
                    EMBED PROOF PASSED
                </strong>

                <p>
                    JoW loaded, account access worked, the session survived
                    reload, saving worked, and gameplay remained usable.
                </p>

            `;


            setStatus(
                "EMBED PASSED",
                "working"
            );


            return;

        }


        if (
            verdict ===
                "failed"
        ) {

            els.verdict.hidden =
                false;


            els.verdict.className =
                "cr-jow-verdict is-failed";


            els.verdict.innerHTML = `

                <strong>
                    EMBED PROOF FAILED
                </strong>

                <p>
                    The permanent implementation should use the normal
                    JoW launcher rather than forcing an unreliable frame.
                </p>

            `;


            setStatus(
                "EMBED FAILED",
                "failed"
            );


            return;

        }


        els.verdict.hidden =
            true;


        els.verdict.innerHTML =
            "";


        setStatus(
            "NOT TESTED",
            "waiting"
        );

    }


    function markWorking() {

        if (
            !everyCheckPassed()
        ) {

            setMessage(

                "Complete all five compatibility checks before marking the embed as working.",

                "error"

            );


            return;

        }


        saveState(
            "working"
        );


        renderStoredVerdict(
            "working"
        );


        setMessage(

            "JoW embedding passed the Control Room proof-of-concept.",

            "success"

        );

    }


    function markFailed() {

        const approved =
            window.confirm(

                "Mark the JoW embed proof-of-concept as failed?\n\nThe normal JoW launcher will remain the safe fallback."

            );


        if (
            !approved
        ) {

            return;

        }


        saveState(
            "failed"
        );


        renderStoredVerdict(
            "failed"
        );


        setMessage(

            "JoW embedding was marked unreliable. Do not force the iframe implementation.",

            "error"

        );

    }


    // =================================
    // EVENTS
    // =================================


    els.start.addEventListener(
        "click",
        startEmbeddedTest
    );


    els.reload.addEventListener(
        "click",
        reloadEmbeddedTest
    );


    els.expand.addEventListener(
        "click",
        toggleExpandedWindow
    );


    els.frame.addEventListener(
        "load",
        handleFrameLoad
    );


    els.pass.addEventListener(
        "click",
        markWorking
    );


    els.fail.addEventListener(
        "click",
        markFailed
    );


    checklist.forEach(
        item => {

            item.element
                ?.addEventListener(
                    "change",
                    () => {

                        saveState();


                        updateVerdictButtons();

                    }
                );

        }
    );


    // =================================
    // INITIALIZATION
    // =================================


    restoreState();


    updateVerdictButtons();


})();
