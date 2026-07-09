import fs from "node:fs/promises";
import path from "node:path";


const ROOT =
    process.cwd();


const MANUAL_TARGET_MONTH =
    String(
        process.env.MANUAL_TARGET_MONTH || ""
    ).trim();



// =================================
// JSON HELPER
// =================================


async function readJson(
    relativePath,
    fallback
) {

    const fullPath =
        path.join(
            ROOT,
            relativePath
        );


    try {

        return JSON.parse(

            await fs.readFile(
                fullPath,
                "utf8"
            )

        );

    }


    catch (
        error
    ) {

        if (
            error.code === "ENOENT"
        ) {

            return fallback;

        }


        throw error;

    }

}



// =================================
// MONTH HELPERS
// =================================


function previousMonth(
    monthId
) {

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



function monthLabel(
    monthId
) {

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



// =================================
// ACTION OUTPUT HELPER
// =================================


async function setOutputs(
    values
) {

    const lines =

        Object.entries(
            values
        )

            .map(

                (
                    [
                        key,
                        value
                    ]
                ) =>

                    `${key}=${value}`

            )

            .join(
                "\n"
            )

        +

        "\n";


    if (
        process.env.GITHUB_OUTPUT
    ) {

        await fs.appendFile(

            process.env.GITHUB_OUTPUT,

            lines,

            "utf8"

        );

    }

}



// =================================
// LOAD MEDIA STATE
// =================================


const [

    innanetIndex,

    generationQueue,

    wwowIndex

] = await Promise.all([

    readJson(

        "data/innanet/archive-index.json",

        {
            months:
                []
        }

    ),

    readJson(

        "data/innanet/generation-queue.json",

        {
            pendingEvents:
                []
        }

    ),

    readJson(

        "data/wwow/archive-index.json",

        {
            issues:
                []
        }

    )

]);



const innanetMonths =

    (
        innanetIndex.months || []
    )

        .filter(

            month =>
                month?.id

        )

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

        );



const publishedIssueIds =

    new Set(

        (
            wwowIndex.issues || []
        )

            .map(

                issue =>
                    issue.id

            )

    );



// =================================
// DETERMINE TARGET MONTH
// =================================


let targetMonth =
    "";


let reason =
    "";



if (
    MANUAL_TARGET_MONTH
) {

    targetMonth =
        MANUAL_TARGET_MONTH;


    reason =

        "Manual publication request.";

}


else {


    const latestInnanetMonth =

        innanetMonths.at(-1)?.id

        ||

        "";



    if (
        !latestInnanetMonth
    ) {

        reason =

            "No Innanet months exist yet.";

    }


    else {

        targetMonth =

            previousMonth(
                latestInnanetMonth
            );


        reason =

            `Latest Innanet activity is ${latestInnanetMonth}; checking closed month ${targetMonth}.`;

    }

}



// =================================
// VALIDATE TARGET
// =================================


let shouldPublish =
    true;



if (
    !targetMonth
) {

    shouldPublish =
        false;


    reason =

        reason

        ||

        "No publication month could be determined.";

}



// =================================
// TARGET MONTH MUST EXIST
// =================================


const targetInnanetMonth =

    innanetMonths.find(

        month =>
            month.id ===
            targetMonth

    );



if (
    shouldPublish

    &&

    !targetInnanetMonth
) {

    shouldPublish =
        false;


    reason =

        `No Innanet archive exists for ${targetMonth}.`;

}



// =================================
// TARGET MONTH QUEUE MUST BE CLEAR
// =================================


const pendingTargetEvents =

    (
        generationQueue.pendingEvents || []
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
                    targetMonth
                )

        );



if (
    shouldPublish

    &&

    pendingTargetEvents.length > 0
) {

    shouldPublish =
        false;


    reason =

        `${targetMonth} still has ${pendingTargetEvents.length} pending Innanet event(s).`;

}



// =================================
// ISSUE MUST NOT ALREADY EXIST
// =================================


if (
    shouldPublish

    &&

    publishedIssueIds.has(
        targetMonth
    )
) {

    shouldPublish =
        false;


    reason =

        `${targetMonth} already has a published WWoW issue. Published issues are frozen.`;

}



// =================================
// OUTPUT
// =================================


await setOutputs({

    should_publish:

        shouldPublish
            ? "true"
            : "false",

    target_month:
        targetMonth,

    target_label:

        targetMonth

            ? monthLabel(
                targetMonth
            )

            : ""

});



console.log(
    reason
);



if (
    shouldPublish
) {

    console.log(

        `WWoW publication approved for ${monthLabel(

            targetMonth

        )}.`

    );

}


else {

    console.log(

        "No WWoW issue will be generated during this run."

    );

}
