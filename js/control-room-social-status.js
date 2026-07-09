// =================================
// OWL CONTROL ROOM
// SOCIAL SYSTEM STATUS
// =================================


// =================================
// ELEMENTS
// =================================


const crSocialElements = {


    overallStatus:

        document.getElementById(
            "cr-social-overall-status"
        ),


    refreshButton:

        document.getElementById(
            "cr-social-refresh"
        ),



    // INNANET


    latestShow:

        document.getElementById(
            "cr-social-latest-show"
        ),


    latestShowDate:

        document.getElementById(
            "cr-social-latest-show-date"
        ),


    innanetMonths:

        document.getElementById(
            "cr-social-innanet-months"
        ),


    publishedShows:

        document.getElementById(
            "cr-social-published-shows"
        ),


    totalPosts:

        document.getElementById(
            "cr-social-total-posts"
        ),


    pendingShows:

        document.getElementById(
            "cr-social-pending-shows"
        ),



    // WWOW


    latestIssue:

        document.getElementById(
            "cr-social-latest-issue"
        ),


    latestIssueTitle:

        document.getElementById(
            "cr-social-latest-issue-title"
        ),


    issueCount:

        document.getElementById(
            "cr-social-issue-count"
        ),


    nextIssue:

        document.getElementById(
            "cr-social-next-issue"
        ),


    nextIssueNote:

        document.getElementById(
            "cr-social-next-issue-note"
        ),



    // HISTORY


    snapshotCount:

        document.getElementById(
            "cr-social-snapshot-count"
        ),


    latestSnapshot:

        document.getElementById(
            "cr-social-latest-snapshot"
        ),


    latestSnapshotDate:

        document.getElementById(
            "cr-social-latest-snapshot-date"
        ),


    historySpan:

        document.getElementById(
            "cr-social-history-span"
        ),



    // HEALTH


    healthQueue:

        document.getElementById(
            "cr-social-health-queue"
        ),


    healthWwow:

        document.getElementById(
            "cr-social-health-wwow"
        ),


    healthHistory:

        document.getElementById(
            "cr-social-health-history"
        ),


    healthMemory:

        document.getElementById(
            "cr-social-health-memory"
        )

};



// =================================
// FETCH JSON
// =================================


async function crSocialFetchJson(
    filePath,
    fallback
) {


    try {


        const separator =

            filePath.includes("?")

                ? "&"

                : "?";


        const response =

            await fetch(

                `${filePath}${separator}status=${Date.now()}`,

                {
                    cache:
                        "no-store"
                }

            );


        if (
            !response.ok
        ) {


            throw new Error(

                `${filePath} returned ${response.status}`

            );

        }


        return await response.json();

    }


    catch (
        error
    ) {


        console.warn(

            `Could not load ${filePath}:`,

            error

        );


        return fallback;

    }

}



// =================================
// MONTH HELPERS
// =================================


function crSocialMonthLabel(
    monthId
) {


    if (
        !/^\d{4}-\d{2}$/.test(
            String(
                monthId || ""
            )
        )
    ) {


        return "—";

    }


    const [

        year,

        month

    ] =

        monthId
            .split("-")
            .map(Number);


    return new Date(

        Date.UTC(

            year,

            month - 1,

            1

        )

    ).toLocaleDateString(

        "en-US",

        {

            month:
                "long",

            year:
                "numeric",

            timeZone:
                "UTC"

        }

    );

}



function crSocialPreviousMonth(
    monthId
) {


    if (
        !/^\d{4}-\d{2}$/.test(
            String(
                monthId || ""
            )
        )
    ) {


        return "";

    }


    const [

        year,

        month

    ] =

        monthId
            .split("-")
            .map(Number);


    const date =

        new Date(

            Date.UTC(

                year,

                month - 2,

                1

            )

        );


    return (

        `${date.getUTCFullYear()}-${String(

            date.getUTCMonth() + 1

        ).padStart(

            2,

            "0"

        )}`

    );

}



// =================================
// DATE HELPER
// =================================


function crSocialFormatDate(
    value
) {


    if (
        !value
    ) {


        return "—";

    }


    const date =

        new Date(

            `${value}T00:00:00Z`

        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {


        return value;

    }


    return date.toLocaleDateString(

        "en-US",

        {

            month:
                "short",

            day:
                "numeric",

            year:
                "numeric",

            timeZone:
                "UTC"

        }

    );

}



// =================================
// STATUS BADGE
// =================================


function crSocialSetBadge(
    element,
    text,
    state
) {


    if (
        !element
    ) {


        return;

    }


    element.textContent =
        text;


    element.className =

        `cr-social-health-badge cr-social-${state}`;

}



// =================================
// OVERALL STATUS
// =================================


function crSocialSetOverall(
    text,
    state
) {


    if (
        !crSocialElements.overallStatus
    ) {


        return;

    }


    crSocialElements
        .overallStatus
        .textContent =
            text;


    crSocialElements
        .overallStatus
        .className =

            `control-room-health-summary cr-social-overall-${state}`;

}



// =================================
// LATEST INNANET SHOW
// =================================


async function crSocialLatestPublishedShow(
    months
) {


    const latestMonth =

        [...months]

            .sort(

                (
                    a,
                    b
                ) =>

                    String(
                        b.id
                    )

                        .localeCompare(

                            String(
                                a.id
                            )

                        )

            )[0];


    if (
        !latestMonth?.file
    ) {


        return null;

    }


    const monthData =

        await crSocialFetchJson(

            latestMonth.file,

            {
                events:
                    []
            }

        );


    return (

        monthData.events || []

    )

        .slice()

        .sort(

            (
                a,
                b
            ) =>

                String(
                    b.date || ""
                )

                    .localeCompare(

                        String(
                            a.date || ""
                        )

                    )

        )[0]

        ||

        null;

}



// =================================
// RENDER INNANET
// =================================


function crSocialRenderInnanet(
    months,
    queue,
    latestShow
) {


    const showCount =

        months.reduce(

            (
                total,
                month
            ) =>

                total

                +

                Number(
                    month.showCount || 0
                ),

            0

        );


    const postCount =

        months.reduce(

            (
                total,
                month
            ) =>

                total

                +

                Number(
                    month.postCount || 0
                ),

            0

        );


    const pendingCount =

        Number(

            queue.pendingEventCount

            ||

            (
                queue.pendingEvents || []
            ).length

            ||

            0

        );


    crSocialElements
        .innanetMonths
        .textContent =
            String(
                months.length
            );


    crSocialElements
        .publishedShows
        .textContent =
            String(
                showCount
            );


    crSocialElements
        .totalPosts
        .textContent =
            String(
                postCount
            );


    crSocialElements
        .pendingShows
        .textContent =
            String(
                pendingCount
            );


    if (
        latestShow
    ) {


        crSocialElements
            .latestShow
            .textContent =

                latestShow.eventName

                ||

                latestShow.name

                ||

                "Published Show";


        crSocialElements
            .latestShowDate
            .textContent =

                crSocialFormatDate(
                    latestShow.date
                );

    }


    else {


        crSocialElements
            .latestShow
            .textContent =
                "No Published Shows";


        crSocialElements
            .latestShowDate
            .textContent =
                "—";

    }


    return pendingCount;

}



// =================================
// RENDER WWOW
// =================================


function crSocialRenderWwow(
    issues,
    innanetMonths,
    queue
) {


    const sortedIssues =

        [...issues]

            .sort(

                (
                    a,
                    b
                ) =>

                    String(
                        b.id
                    )

                        .localeCompare(

                            String(
                                a.id
                            )

                        )

            );


    const latestIssue =

        sortedIssues[0]

        ||

        null;


    crSocialElements
        .issueCount
        .textContent =
            String(
                issues.length
            );


    if (
        latestIssue
    ) {


        crSocialElements
            .latestIssue
            .textContent =

                latestIssue.label

                ||

                crSocialMonthLabel(
                    latestIssue.id
                );


        crSocialElements
            .latestIssueTitle
            .textContent =

                latestIssue.coverTitle

                ||

                `Issue ${latestIssue.issue || ""}`.trim();

    }


    else {


        crSocialElements
            .latestIssue
            .textContent =
                "No Issues Published";


        crSocialElements
            .latestIssueTitle
            .textContent =
                "—";

    }



    const sortedMonths =

        [...innanetMonths]

            .sort(

                (
                    a,
                    b
                ) =>

                    String(
                        b.id
                    )

                        .localeCompare(

                            String(
                                a.id
                            )

                        )

            );


    const latestInnanetMonth =

        sortedMonths[0]?.id

        ||

        "";


    const candidateMonth =

        crSocialPreviousMonth(
            latestInnanetMonth
        );


    const issueIds =

        new Set(

            issues.map(

                issue =>
                    issue.id

            )

        );


    const archiveIds =

        new Set(

            innanetMonths.map(

                month =>
                    month.id

            )

        );


    const pendingCandidateEvents =

        (
            queue.pendingEvents || []
        )

            .filter(

                eventPackage =>

                    String(

                        eventPackage
                            ?.event
                            ?.date

                        ||

                        ""

                    ).startsWith(
                        candidateMonth
                    )

            );


    let state =
        "waiting";


    if (
        !candidateMonth
    ) {


        crSocialElements
            .nextIssue
            .textContent =
                "Waiting";


        crSocialElements
            .nextIssueNote
            .textContent =
                "More monthly activity is needed.";

    }


    else if (
        issueIds.has(
            candidateMonth
        )
    ) {


        state =
            "current";


        crSocialElements
            .nextIssue
            .textContent =
                "Current";


        crSocialElements
            .nextIssueNote
            .textContent =

                `${crSocialMonthLabel(

                    candidateMonth

                )} is published.`;

    }


    else if (
        pendingCandidateEvents.length > 0
    ) {


        state =
            "waiting";


        crSocialElements
            .nextIssue
            .textContent =
                crSocialMonthLabel(
                    candidateMonth
                );


        crSocialElements
            .nextIssueNote
            .textContent =

                `${pendingCandidateEvents.length} Innanet event(s) still pending.`;

    }


    else if (
        archiveIds.has(
            candidateMonth
        )
    ) {


        state =
            "ready";


        crSocialElements
            .nextIssue
            .textContent =
                crSocialMonthLabel(
                    candidateMonth
                );


        crSocialElements
            .nextIssueNote
            .textContent =
                "Closed month is ready for publication.";

    }


    else {


        crSocialElements
            .nextIssue
            .textContent =
                crSocialMonthLabel(
                    candidateMonth
                );


        crSocialElements
            .nextIssueNote
            .textContent =
                "Waiting for closed-month archive data.";

    }


    return {

        state,

        candidateMonth,

        latestIssue

    };

}



// =================================
// RENDER HISTORY
// =================================


function crSocialRenderHistory(
    snapshots
) {


    const sortedSnapshots =

        [...snapshots]

            .sort(

                (
                    a,
                    b
                ) =>

                    String(
                        b.id
                    )

                        .localeCompare(

                            String(
                                a.id
                            )

                        )

            );


    const latest =

        sortedSnapshots[0]

        ||

        null;


    const earliest =

        [...snapshots]

            .sort(

                (
                    a,
                    b
                ) =>

                    String(
                        a.id
                    )

                        .localeCompare(

                            String(
                                b.id
                            )

                        )

            )[0]

        ||

        null;


    crSocialElements
        .snapshotCount
        .textContent =
            String(
                snapshots.length
            );


    if (
        latest
    ) {


        crSocialElements
            .latestSnapshot
            .textContent =

                latest.label

                ||

                crSocialMonthLabel(
                    latest.id
                );


        crSocialElements
            .latestSnapshotDate
            .textContent =

                latest.asOfDate

                    ? `Through ${crSocialFormatDate(

                        latest.asOfDate

                    )}`

                    : "Frozen month-end state";

    }


    else {


        crSocialElements
            .latestSnapshot
            .textContent =
                "No Snapshots";


        crSocialElements
            .latestSnapshotDate
            .textContent =
                "—";

    }


    if (
        earliest

        &&

        latest
    ) {


        const firstLabel =

            crSocialMonthLabel(
                earliest.id
            );


        const lastLabel =

            crSocialMonthLabel(
                latest.id
            );


        crSocialElements
            .historySpan
            .textContent =

                earliest.id === latest.id

                    ? firstLabel

                    : `${firstLabel} → ${lastLabel}`;

    }


    else {


        crSocialElements
            .historySpan
            .textContent =
                "—";

    }


    return latest;

}



// =================================
// RENDER HEALTH
// =================================


function crSocialRenderHealth({

    pendingCount,

    wwowState,

    latestIssue,

    latestSnapshot,

    snapshotCount

}) {


    // QUEUE


    if (
        pendingCount === 0
    ) {


        crSocialSetBadge(

            crSocialElements.healthQueue,

            "CLEAR",

            "good"

        );

    }


    else {


        crSocialSetBadge(

            crSocialElements.healthQueue,

            `${pendingCount} PENDING`,

            "warn"

        );

    }



    // WWOW


    if (
        wwowState === "current"
    ) {


        crSocialSetBadge(

            crSocialElements.healthWwow,

            "CURRENT",

            "good"

        );

    }


    else if (
        wwowState === "ready"
    ) {


        crSocialSetBadge(

            crSocialElements.healthWwow,

            "READY",

            "warn"

        );

    }


    else {


        crSocialSetBadge(

            crSocialElements.healthWwow,

            "WAITING",

            "neutral"

        );

    }



    // HISTORY


    if (
        latestIssue

        &&

        latestSnapshot

        &&

        latestIssue.id ===
            latestSnapshot.id
    ) {


        crSocialSetBadge(

            crSocialElements.healthHistory,

            "CURRENT",

            "good"

        );

    }


    else if (
        latestIssue
    ) {


        crSocialSetBadge(

            crSocialElements.healthHistory,

            "CHECK",

            "bad"

        );

    }


    else {


        crSocialSetBadge(

            crSocialElements.healthHistory,

            "WAITING",

            "neutral"

        );

    }



    // MEMORY


    if (
        snapshotCount > 0
    ) {


        crSocialSetBadge(

            crSocialElements.healthMemory,

            "ACTIVE",

            "good"

        );

    }


    else {


        crSocialSetBadge(

            crSocialElements.healthMemory,

            "WAITING",

            "neutral"

        );

    }



    // OVERALL


    if (
        latestIssue

        &&

        (
            !latestSnapshot

            ||

            latestIssue.id !==
                latestSnapshot.id
        )
    ) {


        crSocialSetOverall(

            "ATTENTION",

            "bad"

        );


        return;

    }


    if (
        pendingCount > 0
    ) {


        crSocialSetOverall(

            "PROCESSING",

            "warn"

        );


        return;

    }


    crSocialSetOverall(

        "HEALTHY",

        "good"

    );

}



// =================================
// LOAD STATUS
// =================================


async function crSocialLoadStatus() {


    crSocialSetOverall(

        "CHECKING",

        "neutral"

    );


    if (
        crSocialElements.refreshButton
    ) {


        crSocialElements
            .refreshButton
            .disabled =
                true;


        crSocialElements
            .refreshButton
            .textContent =
                "Refreshing...";

    }


    try {


        const [

            innanetIndex,

            queue,

            wwowIndex,

            historyIndex

        ] = await Promise.all([


            crSocialFetchJson(

                "data/innanet/archive-index.json",

                {
                    months:
                        []
                }

            ),


            crSocialFetchJson(

                "data/innanet/generation-queue.json",

                {
                    pendingEventCount:
                        0,

                    pendingEvents:
                        []
                }

            ),


            crSocialFetchJson(

                "data/wwow/archive-index.json",

                {
                    issues:
                        []
                }

            ),


            crSocialFetchJson(

                "data/history/archive-index.json",

                {
                    months:
                        []
                }

            )

        ]);



        const innanetMonths =

            Array.isArray(
                innanetIndex.months
            )

                ? innanetIndex.months

                : [];


        const issues =

            Array.isArray(
                wwowIndex.issues
            )

                ? wwowIndex.issues

                : [];


        const snapshots =

            Array.isArray(
                historyIndex.months
            )

                ? historyIndex.months

                : [];



        const latestShow =

            await crSocialLatestPublishedShow(

                innanetMonths

            );



        const pendingCount =

            crSocialRenderInnanet(

                innanetMonths,

                queue,

                latestShow

            );



        const wwowStatus =

            crSocialRenderWwow(

                issues,

                innanetMonths,

                queue

            );



        const latestSnapshot =

            crSocialRenderHistory(

                snapshots

            );



        crSocialRenderHealth({


            pendingCount,


            wwowState:
                wwowStatus.state,


            latestIssue:
                wwowStatus.latestIssue,


            latestSnapshot,


            snapshotCount:
                snapshots.length

        });


        console.log(

            "OWL Social system status loaded."

        );

    }


    catch (
        error
    ) {


        console.error(

            "Could not load OWL Social system status:",

            error

        );


        crSocialSetOverall(

            "CHECK FAILED",

            "bad"

        );


        [


            crSocialElements.healthQueue,

            crSocialElements.healthWwow,

            crSocialElements.healthHistory,

            crSocialElements.healthMemory


        ].forEach(

            element =>

                crSocialSetBadge(

                    element,

                    "CHECK",

                    "bad"

                )

        );

    }


    finally {


        if (
            crSocialElements.refreshButton
        ) {


            crSocialElements
                .refreshButton
                .disabled =
                    false;


            crSocialElements
                .refreshButton
                .textContent =
                    "Refresh Status";

        }

    }

}



// =================================
// EVENTS
// =================================


if (
    crSocialElements.refreshButton
) {


    crSocialElements
        .refreshButton
        .addEventListener(

            "click",

            crSocialLoadStatus

        );

}



// =================================
// INITIAL LOAD
// =================================


crSocialLoadStatus();
