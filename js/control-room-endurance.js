// =================================
// OWL ENDURANCE PROFILE MANAGER
// CANONICAL FIRE PRO SETTINGS
// =================================


(() => {


    const AREAS = [
        "Neck",
        "Arms",
        "Back",
        "Legs"
    ];


    const VALID_STATES =
        new Set([
            "Low",
            "Normal",
            "High"
        ]);


    const els = {

        status:
            document.getElementById(
                "cr-endurance-status"
            ),

        profileCount:
            document.getElementById(
                "cr-endurance-profile-count"
            ),

        missingCount:
            document.getElementById(
                "cr-endurance-missing-count"
            ),

        readyCount:
            document.getElementById(
                "cr-endurance-ready-count"
            ),

        pendingCount:
            document.getElementById(
                "cr-endurance-pending-count"
            ),

        wrestler:
            document.getElementById(
                "cr-endurance-wrestler"
            ),

        matchCount:
            document.getElementById(
                "cr-endurance-match-count"
            ),

        highCount:
            document.getElementById(
                "cr-endurance-high-count"
            ),

        note:
            document.getElementById(
                "cr-endurance-profile-note"
            ),

        areaGrid:
            document.getElementById(
                "cr-endurance-area-grid"
            ),

        neck:
            document.getElementById(
                "cr-endurance-neck"
            ),

        arms:
            document.getElementById(
                "cr-endurance-arms"
            ),

        back:
            document.getElementById(
                "cr-endurance-back"
            ),

        legs:
            document.getElementById(
                "cr-endurance-legs"
            ),

        validation:
            document.getElementById(
                "cr-endurance-validation"
            ),

        save:
            document.getElementById(
                "cr-endurance-save"
            ),

        message:
            document.getElementById(
                "cr-endurance-message"
            ),

        milestones:
            document.getElementById(
                "cr-endurance-milestones"
            ),

        milestone30:
            document.getElementById(
                "cr-endurance-milestone-30"
            ),

        milestone75:
            document.getElementById(
                "cr-endurance-milestone-75"
            )

    };


    let busy =
        false;


    // =================================
    // BASIC HELPERS
    // =================================


    function asArray(
        value
    ) {

        return Array.isArray(
            value
        )

            ? value

            : [];

    }


    function cleanText(
        value
    ) {

        return String(
            value || ""
        ).trim();

    }


    function escapeHtml(
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


    function normalizeEnduranceState(
        value
    ) {

        const state =
            cleanText(
                value
            );


        if (
            state.toLowerCase() ===
                "medium"
        ) {

            return "Normal";

        }


        const matchedState =

            [
                ...VALID_STATES
            ].find(
                candidate =>

                    candidate.toLowerCase() ===
                    state.toLowerCase()
            );


        return matchedState ||
            "Normal";

    }


    function statusOf(
        injury
    ) {

        return cleanText(

            injury?.status
            ||
            injury?.currentStatus

        ).toUpperCase();

    }


    function validDate(
        value
    ) {

        if (
            !value
        ) {

            return null;

        }


        const date =
            new Date(
                value
            );


        return Number.isNaN(
            date.getTime()
        )

            ? null

            : date;

    }


    // =================================
    // DATABASE HELPERS
    // =================================


    function getDatabase() {

        const database =
            owlControlRoomData
                ?.enduranceProfiles;


        if (
            !database
            ||
            Array.isArray(
                database
            )
            ||
            typeof database !==
                "object"
        ) {

            return {

                version:
                    1,

                profiles:
                    []

            };

        }


        return {

            ...database,

            version:
                Number(
                    database.version || 1
                ),

            profiles:
                asArray(
                    database.profiles
                )

        };

    }


    function getWrestlers() {

        return asArray(
            owlControlRoomData
                ?.wrestlers
        );

    }


    function getMatches() {

        return asArray(
            owlControlRoomData
                ?.matches
        );

    }


    function getInjuries() {

        const database =
            owlControlRoomData
                ?.injuries;


        return asArray(
            database?.injuries
        );

    }


    function getProfile(
        wrestlerId
    ) {

        return getDatabase()
            .profiles
            .find(
                profile =>

                    profile?.wrestlerId ===
                    wrestlerId
            )

        ||

        null;

    }


    async function hasWritePermission() {

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
            ) ===
            "granted"
        ) {

            return true;

        }


        return (
            await owlRepositoryHandle.requestPermission(
                options
            ) ===
            "granted"
        );

    }


    async function writeDatabase(
        database
    ) {

        if (
            !await hasWritePermission()
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
                    "endurance-profiles.json"
                );


        const writable =
            await fileHandle
                .createWritable();


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

                // Nothing else is required.

            }


            throw error;

        }

    }


    // =================================
    // MATCH COUNTS
    // =================================


    function wrestlerAppearsInMatch(
        match,
        wrestlerId
    ) {

        return asArray(
            match?.sides
        ).some(
            side =>

                asArray(
                    side?.wrestlers
                ).includes(
                    wrestlerId
                )
        );

    }


    function completedMatchCount(
        wrestlerId
    ) {

        return getMatches()
            .filter(
                match =>

                    wrestlerAppearsInMatch(
                        match,
                        wrestlerId
                    )
            )
            .length;

    }


    function matchDate(
        match
    ) {

        if (
            !match?.date
        ) {

            return null;

        }


        return validDate(
            `${match.date}T00:00:00`
        );

    }


    function matchesAfterDate(
        wrestlerId,
        date
    ) {

        if (
            !date
        ) {

            return completedMatchCount(
                wrestlerId
            );

        }


        return getMatches()
            .filter(
                match => {

                    if (
                        !wrestlerAppearsInMatch(
                            match,
                            wrestlerId
                        )
                    ) {

                        return false;

                    }


                    const completedDate =
                        matchDate(
                            match
                        );


                    return Boolean(

                        completedDate

                        &&

                        completedDate >
                            date

                    );

                }
            )
            .length;

    }


    // =================================
    // INJURY CONDITIONS
    // =================================


    function wrestlerInjuries(
        wrestlerId
    ) {

        return getInjuries()
            .filter(
                injury =>

                    injury?.wrestlerId ===
                    wrestlerId
            );

    }


    function activeMedicalStatus(
        wrestlerId
    ) {

        const statuses =

            wrestlerInjuries(
                wrestlerId
            )
                .map(
                    statusOf
                );


        if (
            statuses.includes(
                "INJURED"
            )
        ) {

            return "INJURED";

        }


        if (
            statuses.includes(
                "RECOVERING"
            )
        ) {

            return "RECOVERING";

        }


        return "CLEARED";

    }


    function injuryOccurrenceDate(
        injury
    ) {

        return validDate(

            injury?.generatorConfirmedAt
            ||
            injury?.createdAt
            ||
            injury?.updatedAt

        );

    }


    function latestInjury(
        wrestlerId
    ) {

        return wrestlerInjuries(
            wrestlerId
        )
            .map(
                injury => ({

                    injury,

                    date:
                        injuryOccurrenceDate(
                            injury
                        )

                })
            )
            .filter(
                item =>
                    item.date
            )
            .sort(
                (
                    firstItem,
                    secondItem
                ) =>

                    secondItem.date -
                    firstItem.date
            )[0]

        ||

        null;

    }


    function healthyWeeksSince(
        date
    ) {

        if (
            !date
        ) {

            return Infinity;

        }


        const milliseconds =
            Date.now() -
            date.getTime();


        return Math.max(

            0,

            Math.floor(

                milliseconds

                /

                (
                    7 *
                    24 *
                    60 *
                    60 *
                    1000
                )

            )

        );

    }


    // =================================
    // PROFILE STATE
    // =================================


    function defaultAreas() {

        return {

            Neck:
                "Normal",

            Arms:
                "Normal",

            Back:
                "Normal",

            Legs:
                "Normal"

        };

    }


    function profileAreas(
        profile
    ) {

        const source =
            profile?.areas ||
            {};


        return {

            Neck:
                normalizeEnduranceState(
                    source.Neck
                ),

            Arms:
                normalizeEnduranceState(
                    source.Arms
                ),

            Back:
                normalizeEnduranceState(
                    source.Back
                ),

            Legs:
                normalizeEnduranceState(
                    source.Legs
                )

        };

    }


    function highAreaCount(
        profile
    ) {

        return Object
            .values(
                profileAreas(
                    profile
                )
            )
            .filter(
                state =>
                    state ===
                    "High"
            )
            .length;

    }


    function eligibleNormalAreas(
        profile
    ) {

        const areas =
            profileAreas(
                profile
            );


        return AREAS.filter(
            area =>
                areas[area] ===
                "Normal"
        );

    }


    // =================================
    // MILESTONE EVALUATION
    // =================================


    function evaluateMilestone(
        profile,
        wrestlerId,
        threshold,
        targetHighCount
    ) {

        const matches =
            completedMatchCount(
                wrestlerId
            );


        const currentHighCount =
            highAreaCount(
                profile
            );


        if (
            matches <
            threshold
        ) {

            return {

                status:
                    "NOT REACHED",

                className:
                    "not-reached",

                reason:
                    `${matches} of ${threshold} completed OWL matches.`

            };

        }


        if (
            currentHighCount >=
            targetHighCount
        ) {

            return {

                status:
                    "SATISFIED",

                className:
                    "satisfied",

                reason:

                    targetHighCount ===
                        1

                        ? "The wrestler already has at least one High endurance area."

                        : "The wrestler already has the maximum two High endurance areas."

            };

        }


        if (
            !profile
        ) {

            return {

                status:
                    "PROFILE REQUIRED",

                className:
                    "pending",

                reason:
                    "Save the wrestler’s real Fire Pro endurance profile before activating this milestone."

            };

        }


        const medicalStatus =
            activeMedicalStatus(
                wrestlerId
            );


        if (
            medicalStatus ===
                "INJURED"

            ||

            medicalStatus ===
                "RECOVERING"
        ) {

            return {

                status:
                    "PENDING",

                className:
                    "pending",

                reason:
                    `The wrestler is currently ${medicalStatus}.`

            };

        }


        const latest =
            latestInjury(
                wrestlerId
            );


        if (
            latest
        ) {

            const matchesSinceInjury =
                matchesAfterDate(
                    wrestlerId,
                    latest.date
                );


            if (
                matchesSinceInjury <
                4
            ) {

                return {

                    status:
                        "PENDING",

                    className:
                        "pending",

                    reason:
                        `${matchesSinceInjury} of 4 required matches have been completed since the most recent injury.`

                };

            }


            const healthyWeeks =
                healthyWeeksSince(
                    latest.date
                );


            if (
                healthyWeeks <
                8
            ) {

                return {

                    status:
                        "PENDING",

                    className:
                        "pending",

                    reason:
                        `${healthyWeeks} of 8 required healthy calendar weeks have passed since the most recent injury.`

                };

            }

        }


        const eligibleAreas =
            eligibleNormalAreas(
                profile
            );


        if (
            eligibleAreas.length ===
            0
        ) {

            return {

                status:
                    "PENDING",

                className:
                    "pending",

                reason:
                    "No eligible Normal endurance area is currently available."

            };

        }


        return {

            status:
                "READY",

            className:
                "ready",

            reason:
                `${eligibleAreas.length} eligible Normal endurance area${eligibleAreas.length === 1 ? "" : "s"} available for the Generator.`

        };

    }


    // =================================
    // UI HELPERS
    // =================================


    function setMessage(
        message,
        type = "success"
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

                    : "save-success"
            }`;


        els.message.hidden =
            false;

    }


    function clearMessage() {

        if (
            els.message
        ) {

            els.message.hidden =
                true;


            els.message.textContent =
                "";

        }

    }


    function setValidation(
        message = ""
    ) {

        if (
            !els.validation
        ) {

            return;

        }


        els.validation.textContent =
            message;


        els.validation.hidden =
            !message;

    }


    function selectedWrestler() {

        const wrestlerId =
            els.wrestler?.value;


        return getWrestlers()
            .find(
                wrestler =>
                    wrestler?.id ===
                    wrestlerId
            )

        ||

        null;

    }


    function formAreas() {

        return {

            Neck:
                normalizeEnduranceState(
                    els.neck?.value
                ),

            Arms:
                normalizeEnduranceState(
                    els.arms?.value
                ),

            Back:
                normalizeEnduranceState(
                    els.back?.value
                ),

            Legs:
                normalizeEnduranceState(
                    els.legs?.value
                )

        };

    }


    function formHighCount() {

        return Object
            .values(
                formAreas()
            )
            .filter(
                state =>
                    state ===
                    "High"
            )
            .length;

    }


    function renderMilestoneCard(
        element,
        threshold,
        evaluation
    ) {

        if (
            !element
        ) {

            return;

        }


        element.className =
            `cr-endurance-milestone-card is-${evaluation.className}`;


        element.innerHTML = `

            <div class="cr-endurance-milestone-heading">

                <span>
                    ${threshold} COMPLETED MATCHES
                </span>

                <strong>
                    ${escapeHtml(
                        evaluation.status
                    )}
                </strong>

            </div>

            <p>
                ${escapeHtml(
                    evaluation.reason
                )}
            </p>

        `;

    }


    function renderSelectedProfile() {

        clearMessage();


        const wrestler =
            selectedWrestler();


        if (
            !wrestler
        ) {

            els.areaGrid.hidden =
                true;


            els.milestones.hidden =
                true;


            els.note.hidden =
                true;


            els.save.disabled =
                true;


            els.matchCount.textContent =
                "—";


            els.highCount.textContent =
                "—";


            setValidation();


            return;

        }


        const profile =
            getProfile(
                wrestler.id
            );


        const areas =
            profile

                ? profileAreas(
                    profile
                )

                : defaultAreas();


        els.neck.value =
            areas.Neck;


        els.arms.value =
            areas.Arms;


        els.back.value =
            areas.Back;


        els.legs.value =
            areas.Legs;


        els.matchCount.textContent =
            completedMatchCount(
                wrestler.id
            );


        els.highCount.textContent =
            `${highAreaCount({
                areas
            })} / 2`;


        els.areaGrid.hidden =
            false;


        els.milestones.hidden =
            false;


        els.note.hidden =
            false;


        els.note.className =
            `cr-endurance-profile-note ${
                profile

                    ? "is-recorded"

                    : "is-missing"
            }`;


        els.note.textContent =

            profile

                ? "Canonical endurance profile recorded. Changes must match the current Fire Pro settings."

                : "No canonical profile exists yet. The displayed Normal values are unsaved defaults, not official data.";


        renderMilestoneCard(

            els.milestone30,

            30,

            evaluateMilestone(
                profile,
                wrestler.id,
                30,
                1
            )

        );


        renderMilestoneCard(

            els.milestone75,

            75,

            evaluateMilestone(
                profile,
                wrestler.id,
                75,
                2
            )

        );


        validateForm();

    }


    function validateForm() {

        const wrestler =
            selectedWrestler();


        if (
            !wrestler
        ) {

            els.save.disabled =
                true;


            setValidation();


            return false;

        }


        const areas =
            formAreas();


        const invalidArea =
            AREAS.find(
                area =>

                    !VALID_STATES.has(
                        areas[area]
                    )
            );


        if (
            invalidArea
        ) {

            setValidation(
                `${invalidArea} contains an invalid endurance state.`
            );


            els.save.disabled =
                true;


            return false;

        }


        const highCount =
            formHighCount();


        els.highCount.textContent =
            `${highCount} / 2`;


        if (
            highCount >
            2
        ) {

            setValidation(
                "A wrestler may have no more than two High endurance areas."
            );


            els.save.disabled =
                true;


            return false;

        }


        setValidation();


        els.save.disabled =
            busy;


        return true;

    }


    function renderSummary() {

        const wrestlers =
            getWrestlers();


        const profiles =
            getDatabase()
                .profiles;


        const recordedIds =
            new Set(
                profiles
                    .map(
                        profile =>
                            profile?.wrestlerId
                    )
                    .filter(
                        Boolean
                    )
            );


        let readyCount =
            0;


        let pendingCount =
            0;


        wrestlers.forEach(
            wrestler => {

                const profile =
                    getProfile(
                        wrestler.id
                    );


                [
                    evaluateMilestone(
                        profile,
                        wrestler.id,
                        30,
                        1
                    ),

                    evaluateMilestone(
                        profile,
                        wrestler.id,
                        75,
                        2
                    )

                ].forEach(
                    evaluation => {

                        if (
                            evaluation.status ===
                                "READY"
                        ) {

                            readyCount +=
                                1;

                        }


                        if (
                            evaluation.status ===
                                "PENDING"

                            ||

                            evaluation.status ===
                                "PROFILE REQUIRED"
                        ) {

                            pendingCount +=
                                1;

                        }

                    }
                );

            }
        );


        els.profileCount.textContent =
            recordedIds.size;


        els.missingCount.textContent =
            Math.max(
                0,
                wrestlers.length -
                recordedIds.size
            );


        els.readyCount.textContent =
            readyCount;


        els.pendingCount.textContent =
            pendingCount;

    }


    // =================================
    // SELECT POPULATION
    // =================================


    function populateWrestlers() {

        const previousValue =
            els.wrestler.value;


        els.wrestler.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =
            "Select Wrestler";


        els.wrestler.appendChild(
            placeholder
        );


        const wrestlers =

            [
                ...getWrestlers()
            ]
                .filter(
                    wrestler =>

                        wrestler?.id

                        &&

                        wrestler?.name
                )
                .sort(
                    (
                        firstWrestler,
                        secondWrestler
                    ) =>

                        String(
                            firstWrestler.name
                        ).localeCompare(
                            String(
                                secondWrestler.name
                            )
                        )
                );


        wrestlers.forEach(
            wrestler => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    wrestler.id;


                option.textContent =
                    wrestler.name;


                els.wrestler.appendChild(
                    option
                );

            }
        );


        if (
            wrestlers.some(
                wrestler =>
                    wrestler.id ===
                    previousValue
            )
        ) {

            els.wrestler.value =
                previousValue;

        }

    }


    // =================================
    // SAVE PROFILE
    // =================================


    async function saveProfile() {

        if (
            busy
            ||
            !validateForm()
        ) {

            return;

        }


        const wrestler =
            selectedWrestler();


        const database =
            getDatabase();


        const existing =
            getProfile(
                wrestler.id
            );


        const areas =
            formAreas();


        const approved =
            window.confirm(

                `${existing ? "Update" : "Create"} the canonical endurance profile for ${wrestler.name}?\n\n` +

                `Neck: ${areas.Neck}\n` +
                `Arms: ${areas.Arms}\n` +
                `Back: ${areas.Back}\n` +
                `Legs: ${areas.Legs}\n\n` +

                "Confirm these values match the wrestler’s current Fire Pro settings."

            );


        if (
            !approved
        ) {

            return;

        }


        busy =
            true;


        els.save.disabled =
            true;


        try {

            const now =
                new Date().toISOString();


            const profile = {

                ...existing,

                wrestlerId:
                    wrestler.id,

                wrestlerName:
                    wrestler.name,

                areas,

                milestones:
                    existing?.milestones ||
                    {},

                highRestorations:
                    asArray(
                        existing?.highRestorations
                    ),

                source:
                    existing?.source ||
                    "manual-fire-pro-baseline",

                createdAt:
                    existing?.createdAt ||
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

                profiles: [

                    profile,

                    ...database.profiles.filter(
                        candidate =>

                            candidate?.wrestlerId !==
                            wrestler.id
                    )

                ]

            };


            await writeDatabase(
                updatedDatabase
            );


            owlControlRoomData
                .enduranceProfiles =
                    updatedDatabase;


            window.dispatchEvent(

                new CustomEvent(
                    "owl-endurance-profiles-updated"
                )

            );


            setMessage(

                `${wrestler.name}'s canonical endurance profile was saved.`

            );

        }

        catch (
            error
        ) {

            console.error(
                "Could not save endurance profile:",
                error
            );


            setMessage(

                error.message ||
                "Could not save the endurance profile.",

                "error"

            );

        }

        finally {

            busy =
                false;


            renderSummary();


            renderSelectedProfile();

        }

    }


    // =================================
    // INITIALIZATION
    // =================================


    function initialize() {

        if (
            !els.status
        ) {

            return;

        }


        populateWrestlers();


        renderSummary();


        renderSelectedProfile();


        els.status.textContent =
            "READY";

    }


    els.wrestler
        ?.addEventListener(
            "change",
            renderSelectedProfile
        );


    [
        els.neck,
        els.arms,
        els.back,
        els.legs
    ]
        .filter(
            Boolean
        )
        .forEach(
            field => {

                field.addEventListener(
                    "change",
                    validateForm
                );

            }
        );


    els.save
        ?.addEventListener(
            "click",
            saveProfile
        );


    window.addEventListener(

        "owl-control-room-data-loaded",

        initialize

    );


    window.addEventListener(

        "owl-injuries-updated",

        () => {

            renderSummary();


            renderSelectedProfile();

        }

    );


    window.addEventListener(

        "owl-endurance-profiles-updated",

        () => {

            renderSummary();


            renderSelectedProfile();

        }

    );


})();
