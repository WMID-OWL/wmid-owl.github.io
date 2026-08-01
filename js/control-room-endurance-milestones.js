// =================================
// OWL HIGH ENDURANCE MILESTONES
// GENERATOR + RESTORATION WORKFLOW
// =================================

(() => {
    const AREAS = ["Neck", "Arms", "Back", "Legs"];

    const MILESTONES = {
        30: {
            threshold: 30,
            targetHighCount: 1
        },

        75: {
            threshold: 75,
            targetHighCount: 2
        }
    };

    const enduranceEls = {
        panel:
            document.getElementById(
                "cr-tool-endurance"
            ),

        wrestler:
            document.getElementById(
                "cr-endurance-wrestler"
            ),

        note:
            document.getElementById(
                "cr-endurance-profile-note"
            ),

        highCount:
            document.getElementById(
                "cr-endurance-high-count"
            ),

        profileCount:
            document.getElementById(
                "cr-endurance-profile-count"
            ),

        baselineCount:
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

        milestone30:
            document.getElementById(
                "cr-endurance-milestone-30"
            ),

        milestone75:
            document.getElementById(
                "cr-endurance-milestone-75"
            ),

        message:
            document.getElementById(
                "cr-endurance-message"
            )
    };

    let busy = false;

    let restorationSection = null;
    let restorationList = null;

    let generatorPanel = null;
    let generatorWrestler = null;
    let generatorMilestone = null;
    let generatorReadout = null;

    let generatorInstalled = false;
    let injuryActionsInstalled = false;
    let trackerCopyInstalled = false;

    const array =
        value =>
            Array.isArray(value)
                ? value
                : [];

    const text =
        value =>
            String(value || "").trim();

    const state =
        value => {
            const normalized =
                text(value).toLowerCase();

            if (
                normalized ===
                "low"
            ) {
                return "Low";
            }

            if (
                normalized ===
                "high"
            ) {
                return "High";
            }

            return "Normal";
        };

    const escapeHtml =
        value =>
            String(value ?? "")
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

    const date =
        value => {
            if (
                !value
            ) {
                return null;
            }

            const parsed =
                new Date(value);

            return Number.isNaN(
                parsed.getTime()
            )
                ? null
                : parsed;
        };

    const weeksSince =
        value => {
            const start =
                value instanceof Date
                    ? value
                    : date(value);

            if (
                !start
            ) {
                return 0;
            }

            return Math.max(
                0,
                Math.floor(
                    (
                        Date.now() -
                        start.getTime()
                    )
                    /
                    604800000
                )
            );
        };

    const injuryStatus =
        injury =>
            text(
                injury?.status ||
                injury?.currentStatus
            ).toUpperCase();


    // =================================
    // DATABASES
    // =================================


    function enduranceDatabase() {
        const source =
            owlControlRoomData
                ?.enduranceProfiles;

        if (
            !source ||
            Array.isArray(source) ||
            typeof source !==
                "object"
        ) {
            return {
                version:
                    1,

                defaultAreas: {
                    Neck:
                        "Normal",

                    Arms:
                        "Normal",

                    Back:
                        "Normal",

                    Legs:
                        "Normal"
                },

                profiles:
                    []
            };
        }

        return {
            ...source,

            version:
                Number(
                    source.version || 1
                ),

            defaultAreas: {
                Neck:
                    state(
                        source.defaultAreas?.Neck
                    ),

                Arms:
                    state(
                        source.defaultAreas?.Arms
                    ),

                Back:
                    state(
                        source.defaultAreas?.Back
                    ),

                Legs:
                    state(
                        source.defaultAreas?.Legs
                    )
            },

            profiles:
                array(
                    source.profiles
                )
        };
    }


    function injuryDatabase() {
        const source =
            owlControlRoomData
                ?.injuries;

        if (
            !source ||
            Array.isArray(source) ||
            typeof source !==
                "object"
        ) {
            return {
                version:
                    1,

                injuries:
                    []
            };
        }

        return {
            ...source,

            version:
                Number(
                    source.version || 1
                ),

            injuries:
                array(
                    source.injuries
                )
        };
    }


    function generatorDatabase() {
        const source =
            owlControlRoomData
                ?.generatorHistory;

        if (
            !source ||
            Array.isArray(source) ||
            typeof source !==
                "object"
        ) {
            return {
                version:
                    1,

                results:
                    []
            };
        }

        return {
            ...source,

            version:
                Number(
                    source.version || 1
                ),

            results:
                array(
                    source.results
                )
        };
    }


    const wrestlers =
        () =>
            array(
                owlControlRoomData
                    ?.wrestlers
            );


    const matches =
        () =>
            array(
                owlControlRoomData
                    ?.matches
            );


    const events =
        () =>
            array(
                owlControlRoomData
                    ?.events
            );


    const profileFor =
        wrestlerId =>
            enduranceDatabase()
                .profiles
                .find(
                    profile =>
                        profile?.wrestlerId ===
                        wrestlerId
                )

            ||

            null;


    function baselineAreas() {
        return {
            ...enduranceDatabase()
                .defaultAreas
        };
    }


    function areasFor(
        profile
    ) {
        const baseline =
            baselineAreas();

        const source =
            profile?.areas ||
            {};

        return {
            Neck:
                state(
                    source.Neck ||
                    baseline.Neck
                ),

            Arms:
                state(
                    source.Arms ||
                    baseline.Arms
                ),

            Back:
                state(
                    source.Back ||
                    baseline.Back
                ),

            Legs:
                state(
                    source.Legs ||
                    baseline.Legs
                )
        };
    }


    async function writeObject(
        fileName,
        value
    ) {
        if (
            !owlRepositoryHandle
        ) {
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
                    fileName
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
    // MATCH HISTORY
    // =================================


    function isCompleted(
        match
    ) {
        const status =
            text(
                match?.status
            ).toLowerCase();

        return (
            !status ||
            status ===
                "completed"
        );
    }


    function appearsInMatch(
        match,
        wrestlerId
    ) {
        return array(
            match?.sides
        ).some(
            side =>
                array(
                    side?.wrestlers
                ).includes(
                    wrestlerId
                )
        );
    }


    function eventForMatch(
        match
    ) {
        if (
            match?.eventId
        ) {
            const byId =
                events()
                    .find(
                        event =>
                            event?.id ===
                            match.eventId
                    );

            if (
                byId
            ) {
                return byId;
            }
        }

        return events()
            .find(
                event =>
                    event?.date ===
                    match?.date

                    &&

                    text(
                        event?.name
                    ).toLowerCase() ===
                    text(
                        match?.event
                    ).toLowerCase()
            )

        ||

        null;
    }


    function matchDate(
        match
    ) {
        const value =
            eventForMatch(
                match
            )?.date

        ||

        match?.date;

        return value
            ? date(
                `${value}T00:00:00`
            )
            : null;
    }


    function wrestlerMatches(
        wrestlerId
    ) {
        return matches()
            .filter(
                match =>
                    isCompleted(
                        match
                    )

                    &&

                    appearsInMatch(
                        match,
                        wrestlerId
                    )
            );
    }


    const completedMatchCount =
        wrestlerId =>
            wrestlerMatches(
                wrestlerId
            ).length;


    function matchesAfter(
        wrestlerId,
        startValue
    ) {
        const start =
            startValue instanceof Date
                ? startValue
                : date(
                    startValue
                );

        if (
            !start
        ) {
            return completedMatchCount(
                wrestlerId
            );
        }

        return wrestlerMatches(
            wrestlerId
        )
            .filter(
                match => {
                    const completed =
                        matchDate(
                            match
                        );

                    return (
                        completed &&
                        completed >
                            start
                    );
                }
            )
            .length;
    }


    // =================================
    // MEDICAL HISTORY
    // =================================


    const wrestlerInjuries =
        wrestlerId =>
            injuryDatabase()
                .injuries
                .filter(
                    injury =>
                        injury?.wrestlerId ===
                        wrestlerId
                );


    function medicalStatus(
        wrestlerId
    ) {
        const statuses =
            wrestlerInjuries(
                wrestlerId
            ).map(
                injuryStatus
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


    function latestInjury(
        wrestlerId
    ) {
        return wrestlerInjuries(
            wrestlerId
        )
            .map(
                injury => ({
                    injury,

                    occurredAt:
                        date(
                            injury.generatorConfirmedAt ||
                            injury.createdAt ||
                            injury.updatedAt
                        )
                })
            )
            .filter(
                item =>
                    item.occurredAt
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    second.occurredAt -
                    first.occurredAt
            )[0]

        ||

        null;
    }


    // =================================
    // HIGH AREA STATE
    // =================================


    function activeRestorations(
        profile
    ) {
        return array(
            profile?.highRestorations
        ).filter(
            restoration =>
                ![
                    "RESTORED",
                    "CANCELLED"
                ].includes(
                    text(
                        restoration?.status
                    ).toUpperCase()
                )
        );
    }


    function currentHighAreas(
        profile
    ) {
        const areas =
            areasFor(
                profile
            );

        return AREAS.filter(
            area =>
                areas[area] ===
                "High"
        );
    }


    function reservedHighAreas(
        profile
    ) {
        return activeRestorations(
            profile
        )
            .map(
                restoration =>
                    text(
                        restoration.area
                    )
            )
            .filter(
                area =>
                    AREAS.includes(
                        area
                    )
            );
    }


    function effectiveHighAreas(
        profile
    ) {
        return [
            ...new Set([
                ...currentHighAreas(
                    profile
                ),

                ...reservedHighAreas(
                    profile
                )
            ])
        ];
    }


    function eligibleNormalAreas(
        profile
    ) {
        const areas =
            areasFor(
                profile
            );

        const reserved =
            new Set(
                reservedHighAreas(
                    profile
                )
            );

        return AREAS.filter(
            area =>
                areas[area] ===
                    "Normal"

                &&

                !reserved.has(
                    area
                )
        );
    }


    function usedMilestoneGeneratorIds() {
        return new Set(
            enduranceDatabase()
                .profiles
                .flatMap(
                    profile =>
                        Object.values(
                            profile?.milestones ||
                            {}
                        )
                )
                .map(
                    milestone =>
                        milestone
                            ?.generatorResultId
                )
                .filter(
                    Boolean
                )
        );
    }


    function pendingGeneratorResult(
        wrestlerId,
        threshold
    ) {
        const used =
            usedMilestoneGeneratorIds();

        return generatorDatabase()
            .results
            .find(
                result => {
                    const milestone =
                        result
                            ?.highEnduranceMilestone;

                    return (
                        result?.confirmed ===
                            true

                        &&

                        result.generatorKey ===
                            "high-endurance-milestone"

                        &&

                        milestone?.wrestlerId ===
                            wrestlerId

                        &&

                        Number(
                            milestone.threshold
                        ) ===
                            Number(
                                threshold
                            )

                        &&

                        !used.has(
                            result.id
                        )
                    );
                }
            )

        ||

        null;
    }


    // =================================
    // MILESTONE EVALUATION
    // =================================


    function evaluateMilestone(
        wrestlerId,
        threshold
    ) {
        const meta =
            MILESTONES[
                threshold
            ];

        if (
            !meta
        ) {
            return {
                status:
                    "INVALID",

                className:
                    "pending",

                reason:
                    "Unknown milestone.",

                eligibleAreas:
                    []
            };
        }

        const profile =
            profileFor(
                wrestlerId
            );

        const matchCount =
            completedMatchCount(
                wrestlerId
            );

        const saved =
            profile
                ?.milestones
                ?.[String(
                    threshold
                )];

        if (
            saved
        ) {
            return {
                status:
                    "SATISFIED",

                className:
                    "satisfied",

                reason:
                    `${saved.selectedArea || "A High area"} was activated from this milestone.`,

                eligibleAreas:
                    [],

                milestoneRecord:
                    saved
            };
        }

        if (
            effectiveHighAreas(
                profile
            ).length >=
            meta.targetHighCount
        ) {
            return {
                status:
                    "SATISFIED",

                className:
                    "satisfied",

                reason:
                    meta.targetHighCount ===
                        1

                        ? "The wrestler already has or is restoring a High endurance area."

                        : "The wrestler already has or is restoring the maximum two High endurance areas.",

                eligibleAreas:
                    []
            };
        }

        if (
            matchCount <
            threshold
        ) {
            return {
                status:
                    "NOT REACHED",

                className:
                    "not-reached",

                reason:
                    `${matchCount} of ${threshold} completed OWL matches.`,

                eligibleAreas:
                    []
            };
        }

        const confirmedDraw =
            pendingGeneratorResult(
                wrestlerId,
                threshold
            );

        const currentMedicalStatus =
            medicalStatus(
                wrestlerId
            );

        if (
            [
                "INJURED",
                "RECOVERING"
            ].includes(
                currentMedicalStatus
            )
        ) {
            return {
                status:
                    confirmedDraw
                        ? "DRAW ON HOLD"
                        : "PENDING",

                className:
                    "pending",

                reason:
                    `The wrestler is currently ${currentMedicalStatus}.`,

                eligibleAreas:
                    [],

                pendingResult:
                    confirmedDraw
            };
        }

        const latest =
            latestInjury(
                wrestlerId
            );

        if (
            latest
        ) {
            const matchCountSince =
                matchesAfter(
                    wrestlerId,
                    latest.occurredAt
                );

            if (
                matchCountSince <
                4
            ) {
                return {
                    status:
                        confirmedDraw
                            ? "DRAW ON HOLD"
                            : "PENDING",

                    className:
                        "pending",

                    reason:
                        `${matchCountSince} of 4 required matches have been completed since the most recent injury.`,

                    eligibleAreas:
                        [],

                    pendingResult:
                        confirmedDraw
                };
            }

            const healthyWeeks =
                weeksSince(
                    latest.occurredAt
                );

            if (
                healthyWeeks <
                8
            ) {
                return {
                    status:
                        confirmedDraw
                            ? "DRAW ON HOLD"
                            : "PENDING",

                    className:
                        "pending",

                    reason:
                        `${healthyWeeks} of 8 required injury-free calendar weeks have passed.`,

                    eligibleAreas:
                        [],

                    pendingResult:
                        confirmedDraw
                };
            }
        }

        const eligibleAreas =
            eligibleNormalAreas(
                profile
            );

        if (
            confirmedDraw
        ) {
            const selectedArea =
                text(
                    confirmedDraw
                        .highEnduranceMilestone
                        ?.selectedArea
                );

            if (
                !eligibleAreas.includes(
                    selectedArea
                )
            ) {
                return {
                    status:
                        "DRAW CONFLICT",

                    className:
                        "pending",

                    reason:
                        `${selectedArea || "The selected area"} is no longer an eligible Normal area.`,

                    eligibleAreas,

                    pendingResult:
                        confirmedDraw
                };
            }

            return {
                status:
                    "DRAW CONFIRMED",

                className:
                    "ready",

                reason:
                    `${selectedArea} was selected. Apply the Fire Pro change, then confirm activation here.`,

                eligibleAreas,

                pendingResult:
                    confirmedDraw
            };
        }

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
                    "No eligible Normal endurance area is currently available.",

                eligibleAreas:
                    []
            };
        }

        return {
            status:
                "READY",

            className:
                "ready",

            reason:
                `${eligibleAreas.length} eligible Normal area${eligibleAreas.length === 1 ? "" : "s"} available for the Generator.`,

            eligibleAreas
        };
    }


    // =================================
    // RESTORATION EVALUATION
    // =================================


    function evaluateRestoration(
        wrestlerId,
        restoration
    ) {
        if (
            text(
                restoration?.status
            ).toUpperCase() ===
            "RESTORED"
        ) {
            return {
                status:
                    "RESTORED",

                className:
                    "satisfied",

                reason:
                    `${restoration.area} was restored to High endurance.`
            };
        }

        const currentMedicalStatus =
            medicalStatus(
                wrestlerId
            );

        if (
            [
                "INJURED",
                "RECOVERING"
            ].includes(
                currentMedicalStatus
            )
        ) {
            return {
                status:
                    "PENDING",

                className:
                    "pending",

                reason:
                    `The wrestler is currently ${currentMedicalStatus}.`
            };
        }

        const startedAt =
            date(
                restoration.startedAt
            );

        const requiredMatches =
            Number(
                restoration.requiredMatches ||
                0
            );

        const requiredWeeks =
            Number(
                restoration.requiredHealthyWeeks ||
                0
            );

        const completedMatches =
            matchesAfter(
                wrestlerId,
                startedAt
            );

        const healthyWeeks =
            weeksSince(
                startedAt
            );

        if (
            completedMatches <
            requiredMatches
        ) {
            return {
                status:
                    "PENDING",

                className:
                    "pending",

                reason:
                    `${completedMatches} of ${requiredMatches} required post-clearance matches completed.`
            };
        }

        if (
            healthyWeeks <
            requiredWeeks
        ) {
            return {
                status:
                    "PENDING",

                className:
                    "pending",

                reason:
                    `${healthyWeeks} of ${requiredWeeks} required healthy calendar weeks completed.`
            };
        }

        return {
            status:
                "READY",

            className:
                "ready",

            reason:
                `Restore ${restoration.area} to High in Fire Pro, then confirm the restoration.`
        };
    }


    // =================================
    // PROFILE WRITES
    // =================================


    function baseProfile(
        wrestlerId,
        wrestlerName,
        existing = null
    ) {
        const now =
            new Date()
                .toISOString();

        return {
            ...existing,

            wrestlerId,

            wrestlerName,

            areas:
                areasFor(
                    existing
                ),

            milestones: {
                ...(
                    existing
                        ?.milestones ||
                    {}
                )
            },

            highRestorations:
                array(
                    existing
                        ?.highRestorations
                ),

            source:
                existing?.source ||
                "global-baseline-with-overrides",

            createdAt:
                existing?.createdAt ||
                now,

            updatedAt:
                now
        };
    }


    function profileHasData(
        profile,
        database
    ) {
        const baseline =
            database.defaultAreas;

        const areas =
            areasFor(
                profile
            );

        return (
            AREAS.some(
                area =>
                    areas[area] !==
                    baseline[area]
            )

            ||

            Object.keys(
                profile.milestones ||
                {}
            ).length >
                0

            ||

            array(
                profile.highRestorations
            ).length >
                0
        );
    }


    function upsertProfile(
        database,
        profile
    ) {
        const profiles =
            database.profiles
                .filter(
                    candidate =>
                        candidate?.wrestlerId !==
                        profile.wrestlerId
                );

        if (
            profileHasData(
                profile,
                database
            )
        ) {
            profiles.unshift(
                profile
            );
        }

        return {
            ...database,

            profiles
        };
    }


    async function saveEnduranceDatabase(
        database
    ) {
        await writeObject(
            "endurance-profiles.json",
            database
        );

        owlControlRoomData
            .enduranceProfiles =
                database;

        window.dispatchEvent(
            new CustomEvent(
                "owl-endurance-profiles-updated"
            )
        );
    }


    function setEnduranceMessage(
        message,
        type = "success"
    ) {
        if (
            !enduranceEls.message
        ) {
            return;
        }

        enduranceEls.message.textContent =
            message;

        enduranceEls.message.className =
            `cr-save-message ${
                type === "error"
                    ? "save-error"
                    : "save-success"
            }`;

        enduranceEls.message.hidden =
            false;
    }


    // =================================
    // APPLY MILESTONE
    // =================================


    async function applyMilestone(
        wrestlerId,
        threshold
    ) {
        if (
            busy
        ) {
            return;
        }

        const evaluation =
            evaluateMilestone(
                wrestlerId,
                threshold
            );

        if (
            evaluation.status !==
                "DRAW CONFIRMED"

            ||

            !evaluation.pendingResult
        ) {
            setEnduranceMessage(
                evaluation.reason ||
                "This milestone is not ready.",
                "error"
            );

            return;
        }

        const result =
            evaluation.pendingResult;

        const selectedArea =
            text(
                result
                    .highEnduranceMilestone
                    ?.selectedArea
            );

        const wrestler =
            wrestlers()
                .find(
                    candidate =>
                        candidate?.id ===
                        wrestlerId
                );

        if (
            !wrestler
        ) {
            setEnduranceMessage(
                "The selected wrestler could not be found.",
                "error"
            );

            return;
        }

        const approved =
            window.confirm(
                `Activate ${selectedArea} as High endurance for ${wrestler.name}?\n\n` +
                `Before continuing, set ${selectedArea} to High in Fire Pro.\n\n` +
                `This permanently records the ${threshold}-match milestone.`
            );

        if (
            !approved
        ) {
            return;
        }

        busy =
            true;

        try {
            const database =
                enduranceDatabase();

            const existing =
                profileFor(
                    wrestlerId
                );

            const profile =
                baseProfile(
                    wrestlerId,
                    wrestler.name,
                    existing
                );

            const areas =
                areasFor(
                    profile
                );

            if (
                currentHighAreas(
                    profile
                ).length >=
                    2

                &&

                areas[selectedArea] !==
                    "High"
            ) {
                throw new Error(
                    "This wrestler already has the maximum two High endurance areas."
                );
            }

            if (
                areas[selectedArea] !==
                "Normal"
            ) {
                throw new Error(
                    `${selectedArea} is no longer set to Normal.`
                );
            }

            const now =
                new Date()
                    .toISOString();

            const updatedProfile = {
                ...profile,

                areas: {
                    ...areas,

                    [selectedArea]:
                        "High"
                },

                milestones: {
                    ...profile.milestones,

                    [String(
                        threshold
                    )]: {
                        threshold,

                        selectedArea,

                        generatorResultId:
                            result.id,

                        completedMatchCount:
                            completedMatchCount(
                                wrestlerId
                            ),

                        status:
                            "ACTIVE",

                        activatedAt:
                            now
                    }
                },

                updatedAt:
                    now
            };

            await saveEnduranceDatabase(
                upsertProfile(
                    database,
                    updatedProfile
                )
            );

            setEnduranceMessage(
                `${wrestler.name}'s ${selectedArea} endurance is now officially High.`
            );
        }

        catch (
            error
        ) {
            console.error(
                "Could not activate High endurance milestone:",
                error
            );

            setEnduranceMessage(
                error.message ||
                "Could not activate the milestone.",
                "error"
            );
        }

        finally {
            busy =
                false;

            renderAll();
        }
    }


    // =================================
    // APPLY RESTORATION
    // =================================


    async function applyRestoration(
        wrestlerId,
        restorationId
    ) {
        if (
            busy
        ) {
            return;
        }

        const wrestler =
            wrestlers()
                .find(
                    candidate =>
                        candidate?.id ===
                        wrestlerId
                );

        const profile =
            profileFor(
                wrestlerId
            );

        const restoration =
            array(
                profile
                    ?.highRestorations
            )
                .find(
                    candidate =>
                        candidate?.id ===
                        restorationId
                );

        if (
            !wrestler ||
            !profile ||
            !restoration
        ) {
            setEnduranceMessage(
                "The selected High restoration could not be found.",
                "error"
            );

            return;
        }

        const evaluation =
            evaluateRestoration(
                wrestlerId,
                restoration
            );

        if (
            evaluation.status !==
            "READY"
        ) {
            setEnduranceMessage(
                evaluation.reason,
                "error"
            );

            return;
        }

        const approved =
            window.confirm(
                `Restore ${wrestler.name}'s ${restoration.area} endurance to High?\n\n` +
                `Before continuing, set ${restoration.area} to High in Fire Pro.`
            );

        if (
            !approved
        ) {
            return;
        }

        busy =
            true;

        try {
            const database =
                enduranceDatabase();

            const areas =
                areasFor(
                    profile
                );

            const otherHigh =
                currentHighAreas(
                    profile
                ).filter(
                    area =>
                        area !==
                        restoration.area
                );

            if (
                otherHigh.length >=
                2
            ) {
                throw new Error(
                    "The two-High maximum is already occupied by other areas."
                );
            }

            const now =
                new Date()
                    .toISOString();

            const updatedProfile = {
                ...profile,

                areas: {
                    ...areas,

                    [restoration.area]:
                        "High"
                },

                highRestorations:
                    array(
                        profile.highRestorations
                    ).map(
                        candidate =>
                            candidate?.id ===
                                restorationId

                                ? {
                                    ...candidate,

                                    status:
                                        "RESTORED",

                                    restoredAt:
                                        now
                                }

                                : candidate
                    ),

                updatedAt:
                    now
            };

            await saveEnduranceDatabase(
                upsertProfile(
                    database,
                    updatedProfile
                )
            );

            setEnduranceMessage(
                `${wrestler.name}'s ${restoration.area} endurance has been restored to High.`
            );
        }

        catch (
            error
        ) {
            console.error(
                "Could not restore High endurance:",
                error
            );

            setEnduranceMessage(
                error.message ||
                "Could not restore the High area.",
                "error"
            );
        }

        finally {
            busy =
                false;

            renderAll();
        }
    }


    // =================================
    // ENDURANCE UI
    // =================================


    function renderMilestoneCard(
        element,
        wrestlerId,
        threshold
    ) {
        if (
            !element ||
            !wrestlerId
        ) {
            return;
        }

        const evaluation =
            evaluateMilestone(
                wrestlerId,
                threshold
            );

        const selectedArea =
            text(
                evaluation
                    .pendingResult
                    ?.highEnduranceMilestone
                    ?.selectedArea
            );

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

            ${
                selectedArea
                    ? `
                        <div class="cr-endurance-selected-area">
                            <span>
                                SELECTED AREA
                            </span>

                            <strong>
                                ${escapeHtml(
                                    selectedArea
                                )}
                            </strong>
                        </div>
                    `
                    : ""
            }

            ${
                evaluation.status ===
                    "READY"
                    ? `
                        <button
                            class="control-room-button control-room-button-secondary"
                            type="button"
                            data-load-high-generator
                            data-wrestler-id="${escapeHtml(
                                wrestlerId
                            )}"
                            data-threshold="${threshold}"
                        >
                            Load in Generator
                        </button>
                    `
                    : ""
            }

            ${
                evaluation.status ===
                    "DRAW CONFIRMED"
                    ? `
                        <button
                            class="control-room-button control-room-button-primary"
                            type="button"
                            data-apply-high-milestone
                            data-wrestler-id="${escapeHtml(
                                wrestlerId
                            )}"
                            data-threshold="${threshold}"
                        >
                            Confirm High Applied
                        </button>
                    `
                    : ""
            }
        `;
    }


    function ensureRestorationSection() {
        if (
            restorationSection
        ) {
            return;
        }

        const milestoneSection =
            document.getElementById(
                "cr-endurance-milestones"
            );

        if (
            !milestoneSection
        ) {
            return;
        }

        restorationSection =
            document.createElement(
                "div"
            );

        restorationSection.id =
            "cr-endurance-restorations";

        restorationSection.className =
            "cr-editor-section cr-endurance-restoration-section";

        restorationSection.hidden =
            true;

        restorationSection.innerHTML = `
            <div class="cr-editor-section-heading">
                <span>
                    FORMER HIGH AREAS
                </span>

                <h3>
                    High Endurance Restoration
                </h3>
            </div>

            <div
                id="cr-endurance-restoration-list"
                class="cr-endurance-restoration-list"
            ></div>
        `;

        milestoneSection.insertAdjacentElement(
            "afterend",
            restorationSection
        );

        restorationList =
            restorationSection.querySelector(
                "#cr-endurance-restoration-list"
            );
    }


    function renderRestorations(
        wrestlerId
    ) {
        ensureRestorationSection();

        if (
            !restorationSection ||
            !restorationList
        ) {
            return;
        }

        const restorations =
            array(
                profileFor(
                    wrestlerId
                )?.highRestorations
            );

        restorationSection.hidden =
            !wrestlerId ||
            restorations.length ===
                0;

        restorationList.innerHTML =
            "";

        restorations.forEach(
            restoration => {
                const evaluation =
                    evaluateRestoration(
                        wrestlerId,
                        restoration
                    );

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    `cr-endurance-restoration-card is-${evaluation.className}`;

                card.innerHTML = `
                    <div class="cr-endurance-milestone-heading">
                        <span>
                            ${escapeHtml(
                                restoration.area ||
                                "HIGH AREA"
                            )}
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

                    <div class="cr-endurance-restoration-requirements">
                        <span>
                            ${Number(
                                restoration.requiredHealthyWeeks ||
                                0
                            )} healthy weeks
                        </span>

                        <span>
                            ${Number(
                                restoration.requiredMatches ||
                                0
                            )} post-clearance matches
                        </span>
                    </div>

                    ${
                        evaluation.status ===
                            "READY"
                            ? `
                                <button
                                    class="control-room-button control-room-button-primary"
                                    type="button"
                                    data-apply-high-restoration
                                    data-wrestler-id="${escapeHtml(
                                        wrestlerId
                                    )}"
                                    data-restoration-id="${escapeHtml(
                                        restoration.id
                                    )}"
                                >
                                    Confirm High Restored
                                </button>
                            `
                            : ""
                    }
                `;

                restorationList.appendChild(
                    card
                );
            }
        );
    }


    function renderSummary() {
        const allWrestlers =
            wrestlers();

        const profiles =
            enduranceDatabase()
                .profiles;

        let ready =
            0;

        let pending =
            0;

        allWrestlers.forEach(
            wrestler => {
                [
                    30,
                    75
                ].forEach(
                    threshold => {
                        const evaluation =
                            evaluateMilestone(
                                wrestler.id,
                                threshold
                            );

                        if (
                            [
                                "READY",
                                "DRAW CONFIRMED"
                            ].includes(
                                evaluation.status
                            )
                        ) {
                            ready +=
                                1;
                        }

                        if (
                            [
                                "PENDING",
                                "DRAW ON HOLD",
                                "DRAW CONFLICT"
                            ].includes(
                                evaluation.status
                            )
                        ) {
                            pending +=
                                1;
                        }
                    }
                );

                activeRestorations(
                    profileFor(
                        wrestler.id
                    )
                ).forEach(
                    restoration => {
                        const evaluation =
                            evaluateRestoration(
                                wrestler.id,
                                restoration
                            );

                        if (
                            evaluation.status ===
                            "READY"
                        ) {
                            ready +=
                                1;
                        }

                        else {
                            pending +=
                                1;
                        }
                    }
                );
            }
        );

        if (
            enduranceEls.profileCount
        ) {
            enduranceEls.profileCount.textContent =
                profiles.length;
        }

        if (
            enduranceEls.baselineCount
        ) {
            const overrideIds =
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

            enduranceEls.baselineCount.textContent =
                Math.max(
                    0,
                    allWrestlers.length -
                    overrideIds.size
                );
        }

        if (
            enduranceEls.readyCount
        ) {
            enduranceEls.readyCount.textContent =
                ready;
        }

        if (
            enduranceEls.pendingCount
        ) {
            enduranceEls.pendingCount.textContent =
                pending;
        }
    }


    function renderAll() {
        const wrestlerId =
            enduranceEls
                .wrestler
                ?.value

        ||

        "";

        const profile =
            profileFor(
                wrestlerId
            );

        if (
            enduranceEls.note &&
            wrestlerId
        ) {
            enduranceEls.note.hidden =
                false;

            enduranceEls.note.className =
                `cr-endurance-profile-note ${
                    profile
                        ? "is-recorded"
                        : "is-missing"
                }`;

            enduranceEls.note.textContent =
                profile
                    ? "This wrestler has a canonical endurance override or recorded durability history."
                    : "This wrestler uses OWL's official global baseline: Normal endurance for Neck, Arms, Back, and Legs.";
        }

        if (
            enduranceEls.highCount
        ) {
            enduranceEls.highCount.textContent =
                wrestlerId
                    ? `${effectiveHighAreas(
                        profile
                    ).length} / 2`
                    : "—";
        }

        if (
            wrestlerId
        ) {
            renderMilestoneCard(
                enduranceEls.milestone30,
                wrestlerId,
                30
            );

            renderMilestoneCard(
                enduranceEls.milestone75,
                wrestlerId,
                75
            );
        }

        renderRestorations(
            wrestlerId
        );

        renderSummary();

        refreshGeneratorFields();
    }


    // =================================
    // GENERATOR FIELDS
    // =================================


    function ensureGeneratorOption() {
        if (
            !generatorEls?.type
        ) {
            return;
        }

        if (
            generatorEls.type.querySelector(
                'option[value="high-endurance-milestone"]'
            )
        ) {
            return;
        }

        const option =
            document.createElement(
                "option"
            );

        option.value =
            "high-endurance-milestone";

        option.textContent =
            "High Endurance Milestone";

        generatorEls.type
            .querySelector(
                'option[value="injury-evaluation"]'
            )
            ?.insertAdjacentElement(
                "afterend",
                option
            );
    }


    function ensureGeneratorPanel() {
        if (
            generatorPanel ||
            !generatorEls?.injuryFields
        ) {
            return;
        }

        generatorPanel =
            document.createElement(
                "div"
            );

        generatorPanel.id =
            "cr-generator-high-endurance-fields";

        generatorPanel.className =
            "cr-generator-high-endurance-grid";

        generatorPanel.hidden =
            true;

        generatorPanel.innerHTML = `
            <div class="cr-form-group">
                <label for="cr-generator-high-endurance-wrestler">
                    WRESTLER
                </label>

                <select id="cr-generator-high-endurance-wrestler">
                    <option value="">
                        Select Wrestler
                    </option>
                </select>
            </div>

            <div class="cr-form-group">
                <label for="cr-generator-high-endurance-milestone">
                    MILESTONE
                </label>

                <select
                    id="cr-generator-high-endurance-milestone"
                    disabled
                >
                    <option value="">
                        Select Wrestler First
                    </option>
                </select>
            </div>

            <div class="cr-form-group">
                <label>
                    ELIGIBILITY
                </label>

                <div
                    id="cr-generator-high-endurance-readout"
                    class="cr-current-value"
                >
                    Select a wrestler
                </div>
            </div>
        `;

        generatorEls.injuryFields
            .insertAdjacentElement(
                "afterend",
                generatorPanel
            );

        generatorWrestler =
            generatorPanel.querySelector(
                "#cr-generator-high-endurance-wrestler"
            );

        generatorMilestone =
            generatorPanel.querySelector(
                "#cr-generator-high-endurance-milestone"
            );

        generatorReadout =
            generatorPanel.querySelector(
                "#cr-generator-high-endurance-readout"
            );

        generatorWrestler
            .addEventListener(
                "change",
                () => {
                    populateGeneratorMilestones();

                    handleGeneratorSettingChange(
                        "Selected wrestler changed. Generate a new result."
                    );
                }
            );

        generatorMilestone
            .addEventListener(
                "change",
                () => {
                    updateGeneratorReadout();

                    handleGeneratorSettingChange(
                        "Selected milestone changed. Generate a new result."
                    );
                }
            );
    }


    function populateGeneratorWrestlers() {
        if (
            !generatorWrestler
        ) {
            return;
        }

        const previous =
            generatorWrestler.value;

        generatorWrestler.innerHTML =
            '<option value="">Select Wrestler</option>';

        const sorted =
            wrestlers()
                .filter(
                    wrestler =>
                        wrestler?.id &&
                        wrestler?.name
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
                );

        sorted.forEach(
            wrestler => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    wrestler.id;

                option.textContent =
                    wrestler.name;

                generatorWrestler.appendChild(
                    option
                );
            }
        );

        if (
            sorted.some(
                wrestler =>
                    wrestler.id ===
                    previous
            )
        ) {
            generatorWrestler.value =
                previous;
        }

        populateGeneratorMilestones();
    }


    function populateGeneratorMilestones() {
        if (
            !generatorMilestone
        ) {
            return;
        }

        const wrestlerId =
            generatorWrestler
                ?.value

        ||

        "";

        const previous =
            generatorMilestone.value;

        generatorMilestone.innerHTML =
            "";

        if (
            !wrestlerId
        ) {
            generatorMilestone.disabled =
                true;

            generatorMilestone.innerHTML =
                '<option value="">Select Wrestler First</option>';

            updateGeneratorReadout();

            return;
        }

        generatorMilestone.disabled =
            false;

        generatorMilestone.innerHTML =
            '<option value="">Select Eligible Milestone</option>';

        [
            30,
            75
        ].forEach(
            threshold => {
                const evaluation =
                    evaluateMilestone(
                        wrestlerId,
                        threshold
                    );

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    String(
                        threshold
                    );

                option.textContent =
                    `${threshold} Matches — ${evaluation.status}`;

                option.disabled =
                    evaluation.status !==
                    "READY";

                generatorMilestone.appendChild(
                    option
                );
            }
        );

        const validPrevious =
            [
                ...generatorMilestone.options
            ].some(
                option =>
                    option.value ===
                        previous

                    &&

                    !option.disabled
            );

        if (
            validPrevious
        ) {
            generatorMilestone.value =
                previous;
        }

        else {
            const firstReady =
                [
                    ...generatorMilestone.options
                ].find(
                    option =>
                        option.value &&
                        !option.disabled
                );

            generatorMilestone.value =
                firstReady?.value ||
                "";
        }

        updateGeneratorReadout();
    }


    function selectedGeneratorEvaluation() {
        const wrestlerId =
            generatorWrestler
                ?.value

        ||

        "";

        const threshold =
            Number(
                generatorMilestone
                    ?.value ||
                0
            );

        return wrestlerId &&
            threshold
                ? evaluateMilestone(
                    wrestlerId,
                    threshold
                )
                : null;
    }


    function updateGeneratorReadout() {
        if (
            !generatorReadout
        ) {
            return;
        }

        const wrestlerId =
            generatorWrestler
                ?.value

        ||

        "";

        const threshold =
            Number(
                generatorMilestone
                    ?.value ||
                0
            );

        if (
            !wrestlerId
        ) {
            generatorReadout.textContent =
                "Select a wrestler";

            return;
        }

        if (
            !threshold
        ) {
            generatorReadout.textContent =
                [
                    30,
                    75
                ]
                    .map(
                        value =>
                            `${value}: ${evaluateMilestone(
                                wrestlerId,
                                value
                            ).status}`
                    )
                    .join(
                        " · "
                    );

            return;
        }

        generatorReadout.textContent =
            evaluateMilestone(
                wrestlerId,
                threshold
            ).reason;
    }


    function refreshGeneratorFields() {
        if (
            !generatorPanel
        ) {
            return;
        }

        const selected =
            generatorWrestler
                ?.value

        ||

        "";

        populateGeneratorWrestlers();

        if (
            selected
        ) {
            generatorWrestler.value =
                selected;

            populateGeneratorMilestones();
        }
    }


    function loadIntoGenerator(
        wrestlerId,
        threshold
    ) {
        ensureGeneratorOption();
        ensureGeneratorPanel();

        generatorEls.type.value =
            "high-endurance-milestone";

        populateGeneratorWrestlers();

        generatorWrestler.value =
            wrestlerId;

        populateGeneratorMilestones();

        generatorMilestone.value =
            String(
                threshold
            );

        updateGeneratorReadout();

        handleGeneratorSettingChange(
            "High endurance milestone loaded. Generate the official area draw."
        );

        document.getElementById(
            "cr-tool-generator"
        )?.scrollIntoView({
            behavior:
                "smooth",

            block:
                "start"
        });
    }


    // =================================
    // GENERATOR RESULT
    // =================================


    function buildGeneratorResult() {
        const wrestlerId =
            generatorWrestler
                ?.value

        ||

        "";

        const threshold =
            Number(
                generatorMilestone
                    ?.value ||
                0
            );

        const wrestler =
            wrestlers()
                .find(
                    candidate =>
                        candidate?.id ===
                        wrestlerId
                );

        if (
            !wrestler
        ) {
            throw new Error(
                "Select a wrestler for the High endurance milestone."
            );
        }

        const evaluation =
            evaluateMilestone(
                wrestlerId,
                threshold
            );

        if (
            evaluation.status !==
            "READY"
        ) {
            throw new Error(
                evaluation.reason ||
                "This milestone is not ready."
            );
        }

        const selectedArea =
            evaluation.eligibleAreas[
                generatorRandomIndex(
                    evaluation.eligibleAreas.length
                )
            ];

        return {
            id:
                generatorCreateId(),

            generatorKey:
                "high-endurance-milestone",

            generatorType:
                "High Endurance Milestone",

            mode:
                generatorEls.mode?.value ||
                "test",

            method:
                "eligible-normal-area-draw",

            methodLabel:
                "Eligible Normal Area Draw",

            label:
                generatorCleanText(
                    generatorEls.label?.value
                )

                ||

                `${threshold}-Match High Endurance — ${wrestler.name}`,

            relatedContext:
                generatorCleanText(
                    generatorEls.context?.value
                ),

            result: [
                `${wrestler.name} reached the ${threshold}-match High endurance milestone.`,

                `Eligible Normal areas: ${evaluation.eligibleAreas.join(", ")}.`,

                `${selectedArea} was randomly selected for High endurance.`,

                "After canon confirmation, apply the Fire Pro change from the Endurance Profile Manager."
            ],

            eligiblePool: [
                ...evaluation.eligibleAreas
            ],

            excludedEntries:
                AREAS.filter(
                    area =>
                        !evaluation
                            .eligibleAreas
                            .includes(
                                area
                            )
                ),

            highEnduranceMilestone: {
                wrestlerId:
                    wrestler.id,

                wrestlerName:
                    wrestler.name,

                threshold,

                targetHighCount:
                    MILESTONES[
                        threshold
                    ].targetHighCount,

                completedMatchCount:
                    completedMatchCount(
                        wrestler.id
                    ),

                eligibleAreas: [
                    ...evaluation.eligibleAreas
                ],

                selectedArea
            },

            generatedAt:
                new Date()
                    .toISOString(),

            confirmed:
                false,

            confirmedAt:
                null
        };
    }


    async function animateGenerator(
        eligibleAreas
    ) {
        for (
            let cycle = 0;
            cycle < 14;
            cycle += 1
        ) {
            const preview =
                eligibleAreas[
                    generatorRandomIndex(
                        eligibleAreas.length
                    )
                ];

            setGeneratorStage(
                "DRAWING HIGH ENDURANCE AREA",
                preview,
                []
            );

            await generatorDelay(
                70 +
                cycle * 5
            );
        }
    }


    // =================================
    // GENERATOR INTEGRATION
    // =================================


    function installGenerator() {
        if (
            generatorInstalled
        ) {
            return;
        }

        if (
            typeof generateGeneratorResult !==
                "function"

            ||

            typeof confirmGeneratorResult !==
                "function"

            ||

            !generatorEls?.generate

            ||

            !generatorEls?.confirm
        ) {
            console.warn(
                "High endurance milestones could not connect to the Generator Hub."
            );

            return;
        }

        generatorInstalled =
            true;

        ensureGeneratorOption();
        ensureGeneratorPanel();

        const originalRenderTypeState =
            renderGeneratorTypeState;

        renderGeneratorTypeState =
            function () {
                originalRenderTypeState();

                const active =
                    getGeneratorType() ===
                    "high-endurance-milestone";

                generatorPanel.hidden =
                    !active;

                if (
                    !active
                ) {
                    return;
                }

                if (
                    generatorEls.injuryFields
                ) {
                    generatorEls.injuryFields.hidden =
                        true;
                }

                if (
                    generatorEls.poolFields
                ) {
                    generatorEls.poolFields.hidden =
                        true;
                }

                if (
                    generatorEls.countFields
                ) {
                    generatorEls.countFields.hidden =
                        true;
                }

                if (
                    generatorEls.method
                ) {
                    generatorEls.method.value =
                        "single";

                    generatorEls.method.disabled =
                        true;
                }

                if (
                    generatorEls.label
                ) {
                    generatorEls.label.placeholder =
                        "Example: Jordan Pack First High Endurance";
                }

                if (
                    generatorEls.context
                ) {
                    generatorEls.context.placeholder =
                        "Example: 30 completed OWL matches";
                }
            };


        const originalRenderControls =
            renderGeneratorControls;

        renderGeneratorControls =
            function () {
                originalRenderControls();

                if (
                    getGeneratorType() !==
                    "high-endurance-milestone"
                ) {
                    return;
                }

                const evaluation =
                    selectedGeneratorEvaluation();

                generatorEls.generate.disabled =
                    !owlRepositoryHandle

                    ||

                    generatorIsRolling

                    ||

                    !evaluation

                    ||

                    evaluation.status !==
                    "READY";
            };


        const originalRenderModeNote =
            renderGeneratorModeNote;

        renderGeneratorModeNote =
            function () {
                if (
                    getGeneratorType() !==
                    "high-endurance-milestone"
                ) {
                    originalRenderModeNote();

                    return;
                }

                const modeText =
                    generatorEls.mode?.value ===
                    "canon"

                        ? "Canon mode creates a pending official area draw. The endurance profile changes only after the separate Fire Pro confirmation."

                        : "Test mode demonstrates the area draw only. It cannot change endurance data.";

                generatorEls.modeNote.textContent =
                    `${modeText} Only eligible Normal areas enter the draw.`;
            };


        const originalTypeLabel =
            getGeneratorTypeLabel;

        getGeneratorTypeLabel =
            type =>
                type ===
                "high-endurance-milestone"

                    ? "High Endurance Milestone"

                    : originalTypeLabel(
                        type
                    );


        const originalGenerate =
            generateGeneratorResult;

        generatorEls.generate
            .removeEventListener(
                "click",
                originalGenerate
            );

        generateGeneratorResult =
            async function () {
                if (
                    getGeneratorType() !==
                    "high-endurance-milestone"
                ) {
                    return originalGenerate();
                }

                if (
                    generatorIsRolling
                ) {
                    return;
                }

                const evaluation =
                    selectedGeneratorEvaluation();

                if (
                    !evaluation ||
                    evaluation.status !==
                    "READY"
                ) {
                    setGeneratorMessage(
                        evaluation?.reason ||
                        "Select an eligible milestone.",
                        "error"
                    );

                    return;
                }

                clearGeneratorMessage();

                generatorIsRolling =
                    true;

                generatorCurrentResult =
                    null;

                renderGeneratorControls();

                try {
                    generatorEls.stage
                        ?.classList
                        .add(
                            "is-rolling"
                        );

                    generatorEls.stage
                        ?.classList
                        .remove(
                            "has-result"
                        );

                    await animateGenerator(
                        evaluation.eligibleAreas
                    );

                    generatorCurrentResult =
                        buildGeneratorResult();

                    generatorEls.stage
                        ?.classList
                        .remove(
                            "is-rolling"
                        );

                    generatorEls.stage
                        ?.classList
                        .add(
                            "has-result"
                        );

                    setGeneratorStage(
                        generatorCurrentResult.mode ===
                            "canon"

                            ? "PENDING CANON CONFIRMATION"

                            : "TEST RESULT — NOT SAVED",

                        generatorCurrentResult
                            .highEnduranceMilestone
                            .selectedArea,

                        generatorCurrentResult.result
                    );

                    setGeneratorMessage(
                        generatorCurrentResult.mode ===
                            "canon"

                            ? "Area selected. Review it, then confirm or discard it."

                            : "Test result generated. No endurance data was changed."
                    );
                }

                catch (
                    error
                ) {
                    console.error(
                        "Could not generate High endurance result:",
                        error
                    );

                    resetGeneratorResult(
                        "Generation failed."
                    );

                    setGeneratorMessage(
                        error.message ||
                        "Could not generate the result.",
                        "error"
                    );
                }

                finally {
                    generatorIsRolling =
                        false;

                    renderGeneratorControls();
                }
            };

        generatorEls.generate
            .addEventListener(
                "click",
                generateGeneratorResult
            );


        const originalConfirm =
            confirmGeneratorResult;

        generatorEls.confirm
            .removeEventListener(
                "click",
                originalConfirm
            );

        confirmGeneratorResult =
            async function () {
                const wasHigh =
                    generatorCurrentResult
                        ?.generatorKey ===
                    "high-endurance-milestone";

                await originalConfirm();

                if (
                    wasHigh
                ) {
                    window.dispatchEvent(
                        new CustomEvent(
                            "owl-high-endurance-generator-updated"
                        )
                    );

                    renderAll();
                }
            };

        generatorEls.confirm
            .addEventListener(
                "click",
                confirmGeneratorResult
            );

        populateGeneratorWrestlers();
    }


    // =================================
    // INJURY / ENDURANCE SYNCHRONIZATION
    // =================================


    function injuryProfileUpdate(
        database,
        injury,
        action,
        now
    ) {
        const area =
            text(
                injury.affectedBodyPart ||
                injury.fireProBodyPart ||
                injury.bodyArea
            );

        if (
            !AREAS.includes(
                area
            )
        ) {
            throw new Error(
                "The injury record does not contain a valid Fire Pro endurance area."
            );
        }

        const existing =
            database.profiles
                .find(
                    profile =>
                        profile?.wrestlerId ===
                        injury.wrestlerId
                )

        ||

        null;

        const profile =
            baseProfile(
                injury.wrestlerId,
                injury.wrestlerName,
                existing
            );

        const areas =
            areasFor(
                profile
            );

        if (
            action ===
            "return"
        ) {
            areas[area] =
                "Low";
        }

        else if (
            action ===
            "clear"
        ) {
            const prior =
                state(
                    injury.priorEnduranceState
                );

            if (
                prior ===
                "High"
            ) {
                areas[area] =
                    "Normal";

                const severe =
                    text(
                        injury.classification
                    ).toUpperCase() ===
                    "SEVERE";

                const restoration = {
                    id:
                        `high-restoration-${injury.id}`,

                    injuryId:
                        injury.id,

                    area,

                    classification:
                        severe
                            ? "SEVERE"
                            : "STANDARD",

                    requiredHealthyWeeks:
                        severe
                            ? 12
                            : 8,

                    requiredMatches:
                        severe
                            ? 8
                            : 4,

                    status:
                        "PENDING",

                    startedAt:
                        now,

                    createdAt:
                        now,

                    restoredAt:
                        null
                };

                profile.highRestorations = [
                    restoration,

                    ...array(
                        profile.highRestorations
                    ).filter(
                        item =>
                            item?.id !==
                            restoration.id
                    )
                ];
            }

            else {
                areas[area] =
                    prior;
            }
        }

        return upsertProfile(
            database,
            {
                ...profile,

                areas,

                updatedAt:
                    now
            }
        );
    }


    function installInjuryActions() {
        if (
            injuryActionsInstalled
        ) {
            return;
        }

        if (
            typeof injuryActionUpdateRecord !==
                "function"

            ||

            typeof injuryActionGetDatabase !==
                "function"

            ||

            typeof injuryActionWriteDatabase !==
                "function"
        ) {
            console.warn(
                "High endurance restoration could not connect to Injury Actions."
            );

            return;
        }

        injuryActionsInstalled =
            true;

        injuryActionUpdateRecord =
            async function (
                injuryId,
                action
            ) {
                if (
                    injuryActionBusy
                ) {
                    return;
                }

                const injuries =
                    injuryActionGetDatabase();

                const existing =
                    injuries.injuries
                        .find(
                            injury =>
                                injury?.id ===
                                injuryId
                        );

                if (
                    !existing
                ) {
                    injuryActionSetMessage(
                        "The selected injury record could not be found.",
                        "error"
                    );

                    return;
                }

                const wrestlerName =
                    injuryActionText(
                        existing.wrestlerName
                    )

                ||

                "This wrestler";

                const area =
                    injuryActionText(
                        existing.affectedBodyPart
                    )

                ||

                "the affected body part";

                const prior =
                    state(
                        existing.priorEnduranceState
                    );

                const now =
                    new Date()
                        .toISOString();

                let updatedInjury;

                if (
                    action ===
                    "return"
                ) {
                    const approved =
                        window.confirm(
                            `Confirm ${wrestlerName}'s return to active competition?\n\n` +
                            `Before continuing, set ${area} to Low endurance in Fire Pro.\n\n` +
                            "The injury status will change from INJURED to RECOVERING."
                        );

                    if (
                        !approved
                    ) {
                        return;
                    }

                    updatedInjury = {
                        ...existing,

                        status:
                            "RECOVERING",

                        currentStatus:
                            "RECOVERING",

                        currentEnduranceState:
                            "Low",

                        returnedAt:
                            now,

                        recoveryStartedAt:
                            now,

                        updatedAt:
                            now
                    };
                }

                else if (
                    action ===
                    "clear"
                ) {
                    if (
                        !injuryActionText(
                            existing.priorEnduranceState
                        )
                    ) {
                        injuryActionSetMessage(
                            `${wrestlerName} cannot be cleared because the prior endurance state is missing.`,
                            "error"
                        );

                        return;
                    }

                    const severe =
                        text(
                            existing.classification
                        ).toUpperCase() ===
                        "SEVERE";

                    const restoredState =
                        prior ===
                        "High"

                            ? "Normal"

                            : prior;

                    const highNote =
                        prior ===
                        "High"

                            ? `\n\nBecause this area was previously High, restore it only to Normal now. High restoration requires ${severe ? 12 : 8} healthy weeks and ${severe ? 8 : 4} post-clearance matches.`

                            : "";

                    const approved =
                        window.confirm(
                            `Confirm ${wrestlerName}'s full medical clearance?\n\n` +
                            `Before continuing, set ${area} to ${restoredState} endurance in Fire Pro.` +
                            highNote +
                            "\n\nThe injury status will change from RECOVERING to CLEARED."
                        );

                    if (
                        !approved
                    ) {
                        return;
                    }

                    updatedInjury = {
                        ...existing,

                        status:
                            "CLEARED",

                        currentStatus:
                            "CLEARED",

                        currentEnduranceState:
                            restoredState,

                        highRestorationRequired:
                            prior ===
                            "High",

                        highRestorationStatus:
                            prior ===
                            "High"

                                ? "PENDING"

                                : "NOT REQUIRED",

                        clearedAt:
                            now,

                        updatedAt:
                            now
                    };
                }

                else {
                    return;
                }

                injuryActionBusy =
                    true;

                const buttons =
                    document.querySelectorAll(
                        `[data-injury-id="${CSS.escape(
                            injuryId
                        )}"]`
                    );

                buttons.forEach(
                    button => {
                        button.disabled =
                            true;
                    }
                );

                const originalEndurance =
                    enduranceDatabase();

                try {
                    const updatedInjuries = {
                        ...injuries,

                        injuries:
                            injuries.injuries.map(
                                injury =>
                                    injury?.id ===
                                    injuryId

                                        ? updatedInjury

                                        : injury
                            )
                    };

                    const updatedEndurance =
                        injuryProfileUpdate(
                            originalEndurance,
                            existing,
                            action,
                            now
                        );

                    await injuryActionWriteDatabase(
                        updatedInjuries
                    );

                    try {
                        await writeObject(
                            "endurance-profiles.json",
                            updatedEndurance
                        );
                    }

                    catch (
                        enduranceError
                    ) {
                        try {
                            await injuryActionWriteDatabase(
                                injuries
                            );
                        }

                        catch (
                            rollbackError
                        ) {
                            console.error(
                                "Could not roll back injury status:",
                                rollbackError
                            );
                        }

                        throw enduranceError;
                    }

                    owlControlRoomData.injuries =
                        updatedInjuries;

                    owlControlRoomData.enduranceProfiles =
                        updatedEndurance;

                    window.dispatchEvent(
                        new CustomEvent(
                            "owl-injuries-updated"
                        )
                    );

                    window.dispatchEvent(
                        new CustomEvent(
                            "owl-endurance-profiles-updated"
                        )
                    );

                    const highClearance =
                        action ===
                        "clear"

                        &&

                        prior ===
                        "High";

                    injuryActionSetMessage(
                        action ===
                        "return"

                            ? `${wrestlerName} is now RECOVERING. ${area} is recorded at Low endurance.`

                            : highClearance

                                ? `${wrestlerName} is CLEARED. ${area} is now Normal, with High restoration pending.`

                                : `${wrestlerName} is CLEARED and ${area} has been restored to ${updatedInjury.currentEnduranceState}.`
                    );
                }

                catch (
                    error
                ) {
                    console.error(
                        "Could not update injury and endurance status:",
                        error
                    );

                    injuryActionSetMessage(
                        error.message ||
                        "Could not update the injury and endurance records.",
                        "error"
                    );

                    buttons.forEach(
                        button => {
                            button.disabled =
                                false;
                        }
                    );
                }

                finally {
                    injuryActionBusy =
                        false;
                }
            };
    }


    function installInjuryTrackerCopy() {
        if (
            trackerCopyInstalled ||
            typeof renderInjuryRecordCard !==
                "function"
        ) {
            return;
        }

        trackerCopyInstalled =
            true;

        const originalRenderInjuryRecordCard =
            renderInjuryRecordCard;

        renderInjuryRecordCard =
            function (
                injury
            ) {
                const card =
                    originalRenderInjuryRecordCard(
                        injury
                    );

                const status =
                    injuryStatus(
                        injury
                    );

                const prior =
                    state(
                        injury
                            ?.priorEnduranceState
                    );

                if (
                    status ===
                        "RECOVERING"

                    &&

                    prior ===
                        "High"
                ) {
                    const paragraph =
                        card.querySelector(
                            ".cr-injury-action-bar p"
                        );

                    if (
                        paragraph
                    ) {
                        const area =
                            text(
                                injury.affectedBodyPart ||
                                injury.fireProBodyPart ||
                                injury.bodyArea
                            );

                        const severe =
                            text(
                                injury.classification
                            ).toUpperCase() ===
                            "SEVERE";

                        paragraph.textContent =
                            `When the recovery window ends, restore ${area} to Normal in Fire Pro. ` +
                            `High restoration will then require ${severe ? 12 : 8} healthy weeks and ` +
                            `${severe ? 8 : 4} post-clearance matches.`;
                    }
                }

                return card;
            };

        if (
            typeof renderInjuryTracker ===
            "function"
        ) {
            renderInjuryTracker();
        }
    }


    // =================================
    // CLICK HANDLING
    // =================================


    enduranceEls.panel
        ?.addEventListener(
            "click",
            event => {
                const loadButton =
                    event.target.closest(
                        "[data-load-high-generator]"
                    );

                if (
                    loadButton
                ) {
                    loadIntoGenerator(
                        loadButton.dataset.wrestlerId,
                        Number(
                            loadButton.dataset.threshold
                        )
                    );

                    return;
                }

                const applyButton =
                    event.target.closest(
                        "[data-apply-high-milestone]"
                    );

                if (
                    applyButton
                ) {
                    applyMilestone(
                        applyButton.dataset.wrestlerId,
                        Number(
                            applyButton.dataset.threshold
                        )
                    );

                    return;
                }

                const restoreButton =
                    event.target.closest(
                        "[data-apply-high-restoration]"
                    );

                if (
                    restoreButton
                ) {
                    applyRestoration(
                        restoreButton.dataset.wrestlerId,
                        restoreButton.dataset.restorationId
                    );
                }
            }
        );


    enduranceEls.wrestler
        ?.addEventListener(
            "change",
            () => {
                window.requestAnimationFrame(
                    renderAll
                );
            }
        );


    window.owlEnduranceMilestones =
        Object.freeze({
            evaluateMilestone,
            evaluateRestoration,
            completedMatchCount,
            eligibleNormalAreas,
            effectiveHighAreas,
            render:
                renderAll
        });


    // =================================
    // INITIALIZATION
    // =================================


    function initialize() {
        ensureRestorationSection();

        installGenerator();

        installInjuryActions();

        installInjuryTrackerCopy();

        window.requestAnimationFrame(
            renderAll
        );
    }


    window.addEventListener(
        "owl-control-room-data-loaded",
        initialize
    );


    window.addEventListener(
        "owl-endurance-profiles-updated",
        () => {
            window.requestAnimationFrame(
                renderAll
            );
        }
    );


    window.addEventListener(
        "owl-injuries-updated",
        () => {
            window.requestAnimationFrame(
                renderAll
            );
        }
    );


    window.addEventListener(
        "owl-high-endurance-generator-updated",
        () => {
            window.requestAnimationFrame(
                renderAll
            );
        }
    );
})();
