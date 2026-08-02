// =================================
// OWL DYNAMIC WEEKLY RUNBOOK
// =================================

(() => {
    const VERSION = 1;

    const CATEGORY = {
        booking:
            "Booking / Preparation",

        production:
            "Match Production",

        website:
            "Website Processing",

        media:
            "OWL Media Publishing",

        youtube:
            "YouTube Publishing",

        closeout:
            "Week Closeout"
    };

    const TYPE = {
        automatic:
            "Automatic",

        manual:
            "Manual Confirmation",

        conditional:
            "Conditional"
    };

    const $ =
        id =>
            document.getElementById(
                id
            );

    const array =
        value =>
            Array.isArray(
                value
            )

                ? value

                : [];

    const text =
        value =>
            String(
                value || ""
            ).trim();

    const els = {
        panel:
            $("cr-tool-runbook"),

        status:
            $("cr-runbook-status"),

        week:
            $("cr-runbook-current-week"),

        today:
            $("cr-runbook-today"),

        events:
            $("cr-runbook-event-summary"),

        select:
            $("cr-runbook-week-select"),

        current:
            $("cr-runbook-current-week-button"),

        next:
            $("cr-runbook-next-count"),

        due:
            $("cr-runbook-due-count"),

        blocked:
            $("cr-runbook-blocked-count"),

        failed:
            $("cr-runbook-failed-count"),

        completed:
            $("cr-runbook-completed-count"),

        archive:
            $("cr-runbook-archive-notice"),

        board:
            $("cr-runbook-board"),

        customSection:
            $("cr-runbook-custom-section"),

        customTitle:
            $("cr-runbook-custom-title"),

        customCategory:
            $("cr-runbook-custom-category"),

        customType:
            $("cr-runbook-custom-type"),

        customDue:
            $("cr-runbook-custom-due"),

        customNote:
            $("cr-runbook-custom-note"),

        addCustom:
            $("cr-runbook-add-custom"),

        message:
            $("cr-runbook-message")
    };

    if (
        !els.panel
    ) {
        return;
    }

    let activeWeekId =
        "";

    let tasks =
        [];

    let busy =
        false;

    function db() {
        const value =
            owlControlRoomData
                ?.weeklyRunbook;

        return (
            value &&
            !Array.isArray(
                value
            ) &&
            typeof value ===
                "object"
        )

            ? {
                ...value,

                weeks:
                    array(
                        value.weeks
                    )
            }

            : {
                version:
                    1,

                weekStartsOn:
                    "monday",

                templateVersion:
                    VERSION,

                weeks:
                    []
            };
    }

    const eventData =
        () =>
            array(
                owlControlRoomData
                    ?.events
            );

    function localDate(
        value = new Date()
    ) {
        const date =
            new Date(
                value
            );

        date.setHours(
            12,
            0,
            0,
            0
        );

        return date;
    }

    function parseDate(
        value
    ) {
        const match =
            /^(\d{4})-(\d{2})-(\d{2})$/
                .exec(
                    text(
                        value
                    )
                );

        return match

            ? localDate(
                new Date(
                    Number(
                        match[1]
                    ),

                    Number(
                        match[2]
                    ) - 1,

                    Number(
                        match[3]
                    )
                )
            )

            : null;
    }

    function dateId(
        value
    ) {
        const date =
            localDate(
                value
            );

        return [
            date.getFullYear(),

            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            ),

            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            )
        ].join(
            "-"
        );
    }

    function addDays(
        value,
        amount
    ) {
        const date =
            localDate(
                value
            );

        date.setDate(
            date.getDate() +
            amount
        );

        return date;
    }

    function monday(
        value = new Date()
    ) {
        const date =
            localDate(
                value
            );

        date.setDate(
            date.getDate() -
            (
                (
                    date.getDay() +
                    6
                ) %
                7
            )
        );

        return date;
    }

    function weekRange(
        start,
        end
    ) {
        const sameYear =
            start.getFullYear() ===
            end.getFullYear();

        const sameMonth =
            sameYear &&
            start.getMonth() ===
            end.getMonth();

        if (
            sameMonth
        ) {
            return (
                `${start.toLocaleDateString(
                    "en-US",
                    {
                        month:
                            "long",

                        day:
                            "numeric"
                    }
                )}–${end.getDate()}, ${end.getFullYear()}`
            );
        }

        if (
            sameYear
        ) {
            return (
                `${start.toLocaleDateString(
                    "en-US",
                    {
                        month:
                            "short",

                        day:
                            "numeric"
                    }
                )}–${end.toLocaleDateString(
                    "en-US",
                    {
                        month:
                            "short",

                        day:
                            "numeric"
                    }
                )}, ${end.getFullYear()}`
            );
        }

        return (
            `${start.toLocaleDateString(
                "en-US",
                {
                    month:
                        "short",

                    day:
                        "numeric",

                    year:
                        "numeric"
                }
            )}–${end.toLocaleDateString(
                "en-US",
                {
                    month:
                        "short",

                    day:
                        "numeric",

                    year:
                        "numeric"
                }
            )}`
        );
    }

    function weekFromStart(
        value
    ) {
        const start =
            localDate(
                value
            );

        const end =
            addDays(
                start,
                6
            );

        return {
            id:
                dateId(
                    start
                ),

            start,

            end,

            startDate:
                dateId(
                    start
                ),

            endDate:
                dateId(
                    end
                ),

            label:
                weekRange(
                    start,
                    end
                )
        };
    }

    const currentWeek =
        () =>
            weekFromStart(
                monday()
            );

    const weekById =
        id =>
            weekFromStart(
                parseDate(
                    id
                )

                ||

                monday()
            );

    const day =
        (
            week,
            index
        ) =>
            dateId(
                addDays(
                    week.start,
                    index
                )
            );

    const id =
        (
            week,
            task
        ) =>
            `${week.id}-${task}`;

    function shortDate(
        value
    ) {
        const date =
            typeof value ===
                "string"

                ? parseDate(
                    value
                )

                : localDate(
                    value
                );

        return date

            ? date.toLocaleDateString(
                "en-US",
                {
                    weekday:
                        "short",

                    month:
                        "short",

                    day:
                        "numeric"
                }
            )

            : "Date not set";
    }

    function fullDate(
        value
    ) {
        return localDate(
            value
        ).toLocaleDateString(
            "en-US",
            {
                weekday:
                    "long",

                month:
                    "long",

                day:
                    "numeric",

                year:
                    "numeric"
            }
        );
    }

    function makeTask(
        week,
        templateId,
        title,
        category,
        type,
        dueDate,
        options = {}
    ) {
        return {
            id:
                id(
                    week,
                    templateId
                ),

            templateId,

            title,

            category,

            type,

            dueDate,

            note:
                options.note ||
                "",

            dependencies:
                array(
                    options.dependencies
                ).map(
                    item =>
                        id(
                            week,
                            item
                        )
                ),

            source:
                options.source ||
                "template",

            eventId:
                options.eventId ||
                "",

            autoRule:
                options.autoRule ||
                "",

            status:
                "pending",

            completedAt:
                "",

            updatedAt:
                ""
        };
    }

    function weeklyTasks(
        week
    ) {
        return [
            makeTask(
                week,
                "review-availability",
                "Review injuries, recovery status, and wrestler availability",
                "booking",
                "manual",
                day(
                    week,
                    0
                ),
                {
                    note:
                        "Confirm the active roster before finalizing either weekly card."
                }
            ),

            makeTask(
                week,
                "review-special-obligations",
                "Review active tournaments and Signature Series obligations",
                "booking",
                "conditional",
                day(
                    week,
                    0
                ),
                {
                    note:
                        "Mark Not Needed when nothing affects this week."
                }
            ),

            makeTask(
                week,
                "finalize-ascension",
                "Finalize the Ascension match card",
                "booking",
                "manual",
                day(
                    week,
                    0
                ),
                {
                    dependencies:
                        [
                            "review-availability"
                        ]
                }
            ),

            makeTask(
                week,
                "finalize-revolt",
                "Finalize the Revolt match card",
                "booking",
                "manual",
                day(
                    week,
                    1
                ),
                {
                    dependencies:
                        [
                            "review-availability"
                        ]
                }
            ),

            makeTask(
                week,
                "run-ascension",
                "Run the Ascension matches",
                "production",
                "manual",
                day(
                    week,
                    1
                ),
                {
                    dependencies:
                        [
                            "finalize-ascension"
                        ]
                }
            ),

            makeTask(
                week,
                "ascension-crit",
                "Process any Ascension CRIT injury evaluations",
                "production",
                "conditional",
                day(
                    week,
                    1
                ),
                {
                    dependencies:
                        [
                            "run-ascension"
                        ],

                    note:
                        "Mark Not Needed when Ascension produces no CRIT finish."
                }
            ),

            makeTask(
                week,
                "ascension-results",
                "Enter Ascension results and complete website processing",
                "website",
                "manual",
                day(
                    week,
                    2
                ),
                {
                    dependencies:
                        [
                            "run-ascension"
                        ]
                }
            ),

            makeTask(
                week,
                "ascension-youtube",
                "Publish Ascension to YouTube",
                "youtube",
                "manual",
                day(
                    week,
                    2
                ),
                {
                    dependencies:
                        [
                            "run-ascension"
                        ]
                }
            ),

            makeTask(
                week,
                "run-revolt",
                "Run the Revolt matches",
                "production",
                "manual",
                day(
                    week,
                    2
                ),
                {
                    dependencies:
                        [
                            "finalize-revolt"
                        ]
                }
            ),

            makeTask(
                week,
                "revolt-crit",
                "Process any Revolt CRIT injury evaluations",
                "production",
                "conditional",
                day(
                    week,
                    2
                ),
                {
                    dependencies:
                        [
                            "run-revolt"
                        ],

                    note:
                        "Mark Not Needed when Revolt produces no CRIT finish."
                }
            ),

            makeTask(
                week,
                "revolt-results",
                "Enter Revolt results and complete website processing",
                "website",
                "manual",
                day(
                    week,
                    3
                ),
                {
                    dependencies:
                        [
                            "run-revolt"
                        ]
                }
            ),

            makeTask(
                week,
                "revolt-youtube",
                "Publish Revolt to YouTube",
                "youtube",
                "manual",
                day(
                    week,
                    3
                ),
                {
                    dependencies:
                        [
                            "run-revolt"
                        ]
                }
            ),

            makeTask(
                week,
                "after-dark",
                "Publish OWL After Dark for this week’s shows",
                "media",
                "conditional",
                day(
                    week,
                    3
                ),
                {
                    dependencies:
                        [
                            "ascension-results",
                            "revolt-results"
                        ],

                    note:
                        "Mark Not Needed while the full show remains inactive."
                }
            ),

            makeTask(
                week,
                "weekly-database-update",
                "Update rankings, records, title history, and affected public profiles",
                "website",
                "manual",
                day(
                    week,
                    4
                ),
                {
                    dependencies:
                        [
                            "ascension-results",
                            "revolt-results"
                        ]
                }
            ),

            makeTask(
                week,
                "sunday-disservice",
                "Publish Sunday Disservice",
                "media",
                "conditional",
                day(
                    week,
                    6
                ),
                {
                    note:
                        "Mark Not Needed while the podcast remains inactive."
                }
            ),

            makeTask(
                week,
                "data-health",
                "Verify Data Health before closing the week",
                "closeout",
                "manual",
                day(
                    week,
                    6
                )
            ),

            makeTask(
                week,
                "close-week",
                "Close the OWL week and resolve remaining exceptions",
                "closeout",
                "manual",
                day(
                    week,
                    6
                ),
                {
                    dependencies:
                        [
                            "data-health"
                        ]
                }
            )
        ];
    }

    function ppvs(
        week
    ) {
        return eventData()
            .filter(
                event => {
                    const date =
                        text(
                            event?.date
                        );

                    return (
                        text(
                            event?.eventType
                        ).toLowerCase() ===
                            "ppv"

                        &&

                        date >=
                            week.startDate

                        &&

                        date <=
                            week.endDate
                    );
                }
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    text(
                        first.date
                    ).localeCompare(
                        text(
                            second.date
                        )
                    )
            );
    }

    function clampDate(
        value,
        week
    ) {
        const date =
            dateId(
                value
            );

        return date <
            week.startDate

            ? week.startDate

            : date >
                week.endDate

                ? week.endDate

                : date;
    }

    function ppvTasks(
        week
    ) {
        return ppvs(
            week
        ).flatMap(
            event => {
                const eventDate =
                    parseDate(
                        event.date
                    );

                const slug =
                    text(
                        event.id
                    )

                    ||

                    text(
                        event.name
                    )
                        .toLowerCase()
                        .replace(
                            /[^a-z0-9]+/g,
                            "-"
                        );

                const prefix =
                    `ppv-${slug}`;

                const prep =
                    clampDate(
                        addDays(
                            eventDate,
                            -1
                        ),
                        week
                    );

                const followup =
                    clampDate(
                        addDays(
                            eventDate,
                            1
                        ),
                        week
                    );

                const options =
                    extra => ({
                        source:
                            "event",

                        eventId:
                            event.id,

                        ...extra
                    });

                return [
                    makeTask(
                        week,
                        `${prefix}-finalize`,
                        `Finalize the ${event.name} card and production notes`,
                        "booking",
                        "manual",
                        prep,
                        options({
                            dependencies:
                                [
                                    "review-availability"
                                ],

                            note:
                                `PPV scheduled for ${shortDate(event.date)}.`
                        })
                    ),

                    makeTask(
                        week,
                        `${prefix}-run`,
                        `Run the ${event.name} matches`,
                        "production",
                        "manual",
                        event.date,
                        options({
                            dependencies:
                                [
                                    `${prefix}-finalize`
                                ],

                            note:
                                "The event database date controls this task; the Runbook does not force PPVs onto Sunday."
                        })
                    ),

                    makeTask(
                        week,
                        `${prefix}-crit`,
                        `Process any ${event.name} CRIT injury evaluations`,
                        "production",
                        "conditional",
                        event.date,
                        options({
                            dependencies:
                                [
                                    `${prefix}-run`
                                ],

                            note:
                                "Mark Not Needed when the PPV produces no CRIT finish."
                        })
                    ),

                    makeTask(
                        week,
                        `${prefix}-results`,
                        `Enter ${event.name} results and close the event record`,
                        "website",
                        "manual",
                        followup,
                        options({
                            dependencies:
                                [
                                    `${prefix}-run`
                                ]
                        })
                    ),

                    makeTask(
                        week,
                        `${prefix}-youtube`,
                        `Publish ${event.name} to YouTube`,
                        "youtube",
                        "manual",
                        followup,
                        options({
                            dependencies:
                                [
                                    `${prefix}-run`
                                ]
                        })
                    ),

                    makeTask(
                        week,
                        `${prefix}-media`,
                        `Publish ${event.name} follow-up coverage`,
                        "media",
                        "conditional",
                        followup,
                        options({
                            dependencies:
                                [
                                    `${prefix}-results`
                                ],

                            note:
                                "Use only when PPV-specific follow-up is needed."
                        })
                    ),

                    makeTask(
                        week,
                        `${prefix}-poster-check`,
                        `Confirm ${event.name} poster artwork is attached`,
                        "website",
                        "automatic",
                        prep,
                        options({
                            autoRule:
                                "event-image",

                            note:
                                "Automatically checks the event image field."
                        })
                    ),

                    makeTask(
                        week,
                        `${prefix}-youtube-check`,
                        `Confirm ${event.name} YouTube video is attached to the event`,
                        "youtube",
                        "automatic",
                        followup,
                        options({
                            autoRule:
                                "event-youtube",

                            note:
                                "Automatically checks youtubeVideoId or youtubeVideo."
                        })
                    ),

                    makeTask(
                        week,
                        `${prefix}-status-check`,
                        `Confirm ${event.name} is marked completed`,
                        "closeout",
                        "automatic",
                        followup,
                        options({
                            autoRule:
                                "event-completed",

                            note:
                                "Automatically checks the event status field."
                        })
                    )
                ];
            }
        );
    }

    const storedWeek =
        weekId =>
            db()
                .weeks
                .find(
                    week =>
                        week?.id ===
                        weekId
                )

            ||

            null;

    function currentTasks(
        week
    ) {
        const stored =
            array(
                storedWeek(
                    week.id
                )?.tasks
            );

        const storedMap =
            new Map(
                stored.map(
                    task => [
                        task.id,
                        task
                    ]
                )
            );

        const generated =
            [
                ...weeklyTasks(
                    week
                ),

                ...ppvTasks(
                    week
                )
            ].map(
                task => ({
                    ...task,

                    ...(
                        storedMap.get(
                            task.id
                        )

                        ||

                        {}
                    ),

                    id:
                        task.id,

                    templateId:
                        task.templateId,

                    title:
                        task.title,

                    category:
                        task.category,

                    type:
                        task.type,

                    dueDate:
                        task.dueDate,

                    note:
                        task.note,

                    dependencies:
                        task.dependencies,

                    source:
                        task.source,

                    eventId:
                        task.eventId,

                    autoRule:
                        task.autoRule
                })
            );

        return [
            ...generated,

            ...stored.filter(
                task =>
                    task?.source ===
                    "custom"
            )
        ];
    }

    function eventFor(
        task
    ) {
        return eventData()
            .find(
                event =>
                    event?.id ===
                    task.eventId
            )

        ||

        null;
    }

    function autoStatus(
        task,
        today
    ) {
        if (
            activeWeekId !==
            currentWeek().id
        ) {
            return task.status ||
                "pending";
        }

        const event =
            eventFor(
                task
            );

        const passed =
            task.autoRule ===
                "event-image"

                ? Boolean(
                    text(
                        event?.image
                    )
                )

                : task.autoRule ===
                    "event-youtube"

                    ? Boolean(
                        text(
                            event?.youtubeVideoId
                        )

                        ||

                        text(
                            event?.youtubeVideo
                        )
                    )

                    : task.autoRule ===
                        "event-completed"

                        ? text(
                            event?.status
                        ).toLowerCase() ===
                            "completed"

                        : false;

        return passed

            ? "completed"

            : task.dueDate <
                today

                ? "failed"

                : "pending";
    }

    function effectiveStatus(
        task,
        map,
        today
    ) {
        if (
            task.type ===
            "automatic"
        ) {
            return autoStatus(
                task,
                today
            );
        }

        if (
            [
                "completed",
                "not-needed"
            ].includes(
                task.status
            )
        ) {
            return task.status;
        }

        const blocked =
            array(
                task.dependencies
            ).some(
                dependencyId => {
                    const dependency =
                        map.get(
                            dependencyId
                        );

                    if (
                        !dependency
                    ) {
                        return false;
                    }

                    const status =
                        dependency.type ===
                            "automatic"

                            ? autoStatus(
                                dependency,
                                today
                            )

                            : dependency.status ||
                                "pending";

                    return ![
                        "completed",
                        "not-needed"
                    ].includes(
                        status
                    );
                }
            );

        return blocked

            ? "blocked"

            : "pending";
    }

    function views() {
        const today =
            dateId(
                new Date()
            );

        const map =
            new Map(
                tasks.map(
                    task => [
                        task.id,
                        task
                    ]
                )
            );

        return tasks.map(
            task => {
                const status =
                    effectiveStatus(
                        task,
                        map,
                        today
                    );

                return {
                    ...task,

                    effectiveStatus:
                        status,

                    dueToday:
                        task.dueDate ===
                        today,

                    overdue:
                        task.dueDate <
                            today

                        &&

                        ![
                            "completed",
                            "not-needed"
                        ].includes(
                            status
                        )
                };
            }
        );
    }

    function compare(
        first,
        second
    ) {
        return (
            text(
                first.dueDate
            ).localeCompare(
                text(
                    second.dueDate
                )
            )

            ||

            text(
                first.title
            ).localeCompare(
                text(
                    second.title
                )
            )
        );
    }

    function buckets() {
        const today =
            dateId(
                new Date()
            );

        const result = {
            next:
                [],

            due:
                [],

            blocked:
                [],

            failed:
                [],

            upcoming:
                [],

            completed:
                []
        };

        views()
            .sort(
                compare
            )
            .forEach(
                task => {
                    if (
                        [
                            "completed",
                            "not-needed"
                        ].includes(
                            task.effectiveStatus
                        )
                    ) {
                        result.completed.push(
                            task
                        );
                    }

                    else if (
                        task.effectiveStatus ===
                        "failed"
                    ) {
                        result.failed.push(
                            task
                        );
                    }

                    else if (
                        task.effectiveStatus ===
                        "blocked"
                    ) {
                        result.blocked.push(
                            task
                        );
                    }

                    else if (
                        task.dueDate <=
                        today
                    ) {
                        result.due.push(
                            task
                        );
                    }

                    else {
                        result.upcoming.push(
                            task
                        );
                    }
                }
            );

        const next =
            result.due.shift()

            ||

            result.upcoming.shift();

        if (
            next
        ) {
            result.next.push(
                next
            );
        }

        return result;
    }

    function setMessage(
        message,
        type = "success"
    ) {
        els.message.textContent =
            message;

        els.message.className =
            `cr-save-message ${
                type ===
                    "error"

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

    async function writeDb(
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

        const directory =
            await owlRepositoryHandle
                .getDirectoryHandle(
                    "data"
                );

        const handle =
            await directory
                .getFileHandle(
                    "weekly-runbook.json"
                );

        const writable =
            await handle
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
                // No additional action is required.
            }

            throw error;
        }
    }

    function record() {
        const week =
            weekById(
                activeWeekId
            );

        const existing =
            storedWeek(
                activeWeekId
            );

        const now =
            new Date()
                .toISOString();

        const today =
            dateId(
                new Date()
            );

        const map =
            new Map(
                tasks.map(
                    task => [
                        task.id,
                        task
                    ]
                )
            );

        return {
            id:
                week.id,

            startDate:
                week.startDate,

            endDate:
                week.endDate,

            label:
                week.label,

            eventIds:
                ppvs(
                    week
                ).map(
                    event =>
                        event.id
                ),

            tasks:
                tasks.map(
                    task => ({
                        ...task,

                        status:
                            task.type ===
                                "automatic"

                                ? effectiveStatus(
                                    task,
                                    map,
                                    today
                                )

                                : task.status ||
                                    "pending",

                        updatedAt:
                            task.updatedAt ||
                            now
                    })
                ),

            createdAt:
                existing?.createdAt ||
                now,

            updatedAt:
                now
        };
    }

    async function save(
        message
    ) {
        if (
            busy
        ) {
            return;
        }

        if (
            activeWeekId !==
            currentWeek().id
        ) {
            setMessage(
                "Archived weeks are read-only. Return to the current week to make changes.",
                "error"
            );

            return;
        }

        busy =
            true;

        els.status.textContent =
            "SAVING";

        try {
            const current =
                db();

            const week =
                record();

            const updated = {
                ...current,

                version:
                    Number(
                        current.version ||
                        1
                    ),

                weekStartsOn:
                    "monday",

                templateVersion:
                    VERSION,

                weeks:
                    [
                        week,

                        ...current.weeks.filter(
                            item =>
                                item?.id !==
                                week.id
                        )
                    ].sort(
                        (
                            first,
                            second
                        ) =>
                            text(
                                second.startDate
                            ).localeCompare(
                                text(
                                    first.startDate
                                )
                            )
                    )
            };

            await writeDb(
                updated
            );

            owlControlRoomData.weeklyRunbook =
                updated;

            tasks =
                currentTasks(
                    currentWeek()
                );

            populateWeeks();

            render();

            setMessage(
                message
            );
        }

        catch (
            error
        ) {
            console.error(
                "Could not save Weekly Runbook:",
                error
            );

            setMessage(
                error.message ||
                "Could not save the Weekly Runbook.",
                "error"
            );
        }

        finally {
            busy =
                false;

            els.status.textContent =
                "READY";
        }
    }

    function renderSummary(
        grouped
    ) {
        const week =
            weekById(
                activeWeekId
            );

        const current =
            activeWeekId ===
            currentWeek().id;

        const eventList =
            ppvs(
                week
            );

        els.week.textContent =
            week.label;

        els.today.textContent =
            current

                ? fullDate(
                    new Date()
                )

                : "Archived week";

        els.events.textContent =
            eventList.length

                ? eventList.map(
                    event =>
                        `${event.name} — ${shortDate(event.date)}`
                ).join(
                    " · "
                )

                : "No PPV is scheduled in this week’s event data.";

        els.next.textContent =
            grouped.next.length;

        els.due.textContent =
            views().filter(
                task =>
                    task.dueToday

                    &&

                    ![
                        "completed",
                        "not-needed"
                    ].includes(
                        task.effectiveStatus
                    )
            ).length;

        els.blocked.textContent =
            grouped.blocked.length;

        els.failed.textContent =
            grouped.failed.length;

        els.completed.textContent =
            grouped.completed.length;

        els.archive.hidden =
            current;

        els.customSection.hidden =
            !current;
    }

    function taskCard(
        task
    ) {
        const current =
            activeWeekId ===
            currentWeek().id;

        const card =
            document.createElement(
                "article"
            );

        card.className =
            `cr-runbook-task cr-runbook-status-${task.effectiveStatus}`;

        card.dataset.taskId =
            task.id;

        const dependencyNames =
            array(
                task.dependencies
            )
                .map(
                    dependencyId =>
                        tasks.find(
                            item =>
                                item.id ===
                                dependencyId
                        )?.title
                )
                .filter(
                    Boolean
                );

        card.innerHTML = `
            <div class="cr-runbook-task-heading">
                <div>
                    <span>
                        ${CATEGORY[task.category] || task.category}
                    </span>

                    <h4></h4>
                </div>

                <strong class="cr-runbook-task-state">
                    ${task.effectiveStatus
                        .replace("-", " ")
                        .toUpperCase()}
                </strong>
            </div>

            <div class="cr-runbook-task-meta">
                <span>
                    ${TYPE[task.type] || task.type}
                </span>

                <span class="${task.overdue ? "is-overdue" : ""}">
                    Due ${shortDate(task.dueDate)}
                    ${task.overdue ? " · OVERDUE" : ""}
                </span>
            </div>
        `;

        card.querySelector(
            "h4"
        ).textContent =
            task.title;

        if (
            task.note
        ) {
            const note =
                document.createElement(
                    "p"
                );

            note.className =
                "cr-runbook-task-note";

            note.textContent =
                task.note;

            card.appendChild(
                note
            );
        }

        if (
            task.effectiveStatus ===
                "blocked"

            &&

            dependencyNames.length
        ) {
            const note =
                document.createElement(
                    "p"
                );

            note.className =
                "cr-runbook-task-blocked-note";

            note.textContent =
                `Waiting on: ${dependencyNames.join("; ")}`;

            card.appendChild(
                note
            );
        }

        if (
            !current
        ) {
            return card;
        }

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "cr-runbook-task-actions";

        const button =
            (
                label,
                action,
                primary = false
            ) => {
                const element =
                    document.createElement(
                        "button"
                    );

                element.type =
                    "button";

                element.className =
                    `control-room-button ${
                        primary

                            ? "control-room-button-primary"

                            : "control-room-button-secondary"
                    }`;

                element.dataset.runbookAction =
                    action;

                element.textContent =
                    label;

                return element;
            };

        if (
            task.type !==
            "automatic"
        ) {
            if (
                [
                    "completed",
                    "not-needed"
                ].includes(
                    task.effectiveStatus
                )
            ) {
                actions.appendChild(
                    button(
                        "Reopen",
                        "reopen"
                    )
                );
            }

            else {
                const complete =
                    button(
                        "Complete",
                        "complete",
                        true
                    );

                complete.disabled =
                    task.effectiveStatus ===
                    "blocked";

                actions.append(
                    complete,

                    button(
                        "Not Needed This Week",
                        "not-needed"
                    )
                );
            }
        }

        if (
            task.source ===
            "custom"
        ) {
            const remove =
                button(
                    "Delete Custom Task",
                    "delete"
                );

            remove.classList.add(
                "cr-runbook-delete-button"
            );

            actions.appendChild(
                remove
            );
        }

        if (
            actions.children.length
        ) {
            card.appendChild(
                actions
            );
        }

        return card;
    }

    function renderBucket(
        title,
        kicker,
        items,
        className
    ) {
        if (
            !items.length
        ) {
            return;
        }

        const section =
            document.createElement(
                "section"
            );

        section.className =
            `cr-runbook-bucket ${className}`;

        section.innerHTML = `
            <div class="cr-runbook-bucket-heading">
                <div>
                    <span>${kicker}</span>
                    <h3>${title}</h3>
                </div>

                <strong>${items.length}</strong>
            </div>

            <div class="cr-runbook-task-list"></div>
        `;

        const list =
            section.querySelector(
                ".cr-runbook-task-list"
            );

        items.forEach(
            task =>
                list.appendChild(
                    taskCard(
                        task
                    )
                )
        );

        els.board.appendChild(
            section
        );
    }

    function render() {
        const grouped =
            buckets();

        renderSummary(
            grouped
        );

        els.board.innerHTML =
            "";

        renderBucket(
            "Next Action",
            "START HERE",
            grouped.next,
            "is-next"
        );

        renderBucket(
            "Failed Automations",
            "NEEDS ATTENTION",
            grouped.failed,
            "is-failed"
        );

        renderBucket(
            "Blocked",
            "WAITING ON ANOTHER TASK",
            grouped.blocked,
            "is-blocked"
        );

        renderBucket(
            "Due Today",
            "TODAY / OVERDUE",
            grouped.due,
            "is-due"
        );

        renderBucket(
            "Upcoming",
            "LATER THIS WEEK",
            grouped.upcoming,
            "is-upcoming"
        );

        renderBucket(
            "Completed",
            "RESOLVED THIS WEEK",
            grouped.completed,
            "is-completed"
        );

        els.status.textContent =
            "READY";
    }

    function populateWeeks() {
        const current =
            currentWeek();

        const values =
            new Map([
                [
                    current.id,

                    {
                        id:
                            current.id,

                        startDate:
                            current.startDate,

                        label:
                            `${current.label} — CURRENT`
                    }
                ]
            ]);

        db().weeks.forEach(
            week => {
                if (
                    !week?.id
                ) {
                    return;
                }

                values.set(
                    week.id,
                    {
                        id:
                            week.id,

                        startDate:
                            week.startDate ||
                            week.id,

                        label:
                            week.id ===
                                current.id

                                ? `${week.label || current.label} — CURRENT`

                                : `${week.label || week.id} — ARCHIVED`
                    }
                );
            }
        );

        const previous =
            activeWeekId ||
            current.id;

        els.select.innerHTML =
            "";

        [
            ...values.values()
        ]
            .sort(
                (
                    first,
                    second
                ) =>
                    text(
                        second.startDate
                    ).localeCompare(
                        text(
                            first.startDate
                        )
                    )
            )
            .forEach(
                week => {
                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        week.id;

                    option.textContent =
                        week.label;

                    els.select.appendChild(
                        option
                    );
                }
            );

        els.select.value =
            values.has(
                previous
            )

                ? previous

                : current.id;
    }

    function loadWeek(
        weekId
    ) {
        clearMessage();

        activeWeekId =
            weekId ||
            currentWeek().id;

        tasks =
            activeWeekId ===
                currentWeek().id

                ? currentTasks(
                    currentWeek()
                )

                : array(
                    storedWeek(
                        activeWeekId
                    )?.tasks
                ).map(
                    task => ({
                        ...task
                    })
                );

        const week =
            weekById(
                activeWeekId
            );

        els.customDue.min =
            week.startDate;

        els.customDue.max =
            week.endDate;

        els.customDue.value =
            activeWeekId ===
                currentWeek().id

                ? dateId(
                    new Date()
                )

                : week.startDate;

        render();
    }

    async function taskAction(
        taskIdValue,
        action
    ) {
        const task =
            tasks.find(
                item =>
                    item.id ===
                    taskIdValue
            );

        if (
            !task ||
            task.type ===
                "automatic"
        ) {
            return;
        }

        clearMessage();

        const now =
            new Date()
                .toISOString();

        if (
            action ===
                "delete"

            &&

            task.source ===
                "custom"
        ) {
            if (
                !window.confirm(
                    `Delete this custom Runbook task?\n\n${task.title}`
                )
            ) {
                return;
            }

            tasks =
                tasks.filter(
                    item =>
                        item.id !==
                        task.id
                );

            await save(
                `${task.title} was removed from this week.`
            );

            return;
        }

        if (
            action ===
            "complete"
        ) {
            task.status =
                "completed";
        }

        if (
            action ===
            "not-needed"
        ) {
            task.status =
                "not-needed";
        }

        if (
            action ===
            "reopen"
        ) {
            task.status =
                "pending";
        }

        task.completedAt =
            action ===
                "reopen"

                ? ""

                : now;

        task.updatedAt =
            now;

        const message =
            action ===
                "complete"

                ? `${task.title} marked complete.`

                : action ===
                    "not-needed"

                    ? `${task.title} marked Not Needed for this week.`

                    : `${task.title} reopened.`;

        await save(
            message
        );
    }

    function customId(
        title
    ) {
        const slug =
            text(
                title
            )
                .toLowerCase()
                .replace(
                    /[’']/g,
                    ""
                )
                .replace(
                    /&/g,
                    "and"
                )
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                )

            ||

            "custom-task";

        const base =
            `${activeWeekId}-custom-${slug}`;

        let result =
            base;

        let count =
            2;

        while (
            tasks.some(
                task =>
                    task.id ===
                    result
            )
        ) {
            result =
                `${base}-${count++}`;
        }

        return result;
    }

    async function addCustom() {
        clearMessage();

        const title =
            text(
                els.customTitle.value
            );

        const dueDate =
            text(
                els.customDue.value
            );

        const week =
            currentWeek();

        if (
            !title
        ) {
            setMessage(
                "Enter a custom task title.",
                "error"
            );

            return;
        }

        if (
            dueDate <
                week.startDate

            ||

            dueDate >
                week.endDate
        ) {
            setMessage(
                "The custom task due date must fall inside the current Monday–Sunday week.",
                "error"
            );

            return;
        }

        const now =
            new Date()
                .toISOString();

        tasks.push({
            id:
                customId(
                    title
                ),

            templateId:
                "",

            title,

            category:
                els.customCategory.value,

            type:
                els.customType.value,

            dueDate,

            note:
                text(
                    els.customNote.value
                ),

            dependencies:
                [],

            source:
                "custom",

            eventId:
                "",

            autoRule:
                "",

            status:
                "pending",

            completedAt:
                "",

            createdAt:
                now,

            updatedAt:
                now
        });

        await save(
            `${title} was added to this week’s Runbook.`
        );

        els.customTitle.value =
            "";

        els.customNote.value =
            "";

        els.customCategory.value =
            "booking";

        els.customType.value =
            "manual";

        els.customDue.value =
            dateId(
                new Date()
            );
    }

    function initialize() {
        activeWeekId =
            currentWeek().id;

        populateWeeks();

        loadWeek(
            activeWeekId
        );
    }

    els.board.addEventListener(
        "click",
        event => {
            const button =
                event.target.closest(
                    "[data-runbook-action]"
                );

            const card =
                event.target.closest(
                    "[data-task-id]"
                );

            if (
                button &&
                card
            ) {
                taskAction(
                    card.dataset.taskId,
                    button.dataset.runbookAction
                );
            }
        }
    );

    els.select.addEventListener(
        "change",
        () =>
            loadWeek(
                els.select.value
            )
    );

    els.current.addEventListener(
        "click",
        () => {
            els.select.value =
                currentWeek().id;

            loadWeek(
                currentWeek().id
            );
        }
    );

    els.addCustom.addEventListener(
        "click",
        addCustom
    );

    window.addEventListener(
        "owl-control-room-data-loaded",
        initialize
    );
})();
