import fs from "node:fs/promises";
import path from "node:path";


const ROOT =
    process.cwd();


const WORKFLOW_DIRECTORY =
    ".github/workflows";


// =================================
// REQUIRED MEDIA CHAIN
// =================================


const requiredWorkflows = [

    {
        file:
            "build-after-dark-context.yml",

        workflowName:
            "Build After Dark Context",

        upstreamWorkflow:
            "Generate Innanet Posts",

        script:
            "scripts/build-after-dark-context.mjs",

        requiresModels:
            false,

        requiresWrite:
            true
    },

    {
        file:
            "generate-after-dark-episode.yml",

        workflowName:
            "Generate After Dark Episode",

        upstreamWorkflow:
            "Build After Dark Context",

        script:
            "scripts/write-after-dark-episode.mjs",

        requiresModels:
            true,

        requiresWrite:
            true
    },

    {
        file:
            "build-sunday-disservice-context.yml",

        workflowName:
            "Build Sunday Disservice Context",

        upstreamWorkflow:
            "Generate After Dark Episode",

        script:
            "scripts/build-sunday-disservice-context.mjs",

        requiresModels:
            false,

        requiresWrite:
            true
    },

    {
        file:
            "generate-sunday-disservice-sermon.yml",

        workflowName:
            "Generate Sunday Disservice Sermon",

        upstreamWorkflow:
            "Build Sunday Disservice Context",

        script:
            "scripts/write-sunday-disservice-sermon.mjs",

        requiresModels:
            true,

        requiresWrite:
            true
    },

    {
        file:
            "generate-sunday-disservice-audio.yml",

        workflowName:
            "Generate Sunday Disservice Audio",

        upstreamWorkflow:
            "Generate Sunday Disservice Sermon",

        script:
            "scripts/generate-sunday-disservice-audio.mjs",

        requiresModels:
            false,

        requiresWrite:
            true
    }

];


const manualOnlyWorkflows = [

    "audit-site-links.yml",
    "audit-site-data.yml",
    "test-owl-media-end-to-end.yml"

];


// =================================
// BASIC HELPERS
// =================================


function toPosix(
    value
) {

    return String(
        value || ""
    ).replace(
        /\\/g,
        "/"
    );

}


async function fileExists(
    relativePath
) {

    try {

        await fs.access(
            path.join(
                ROOT,
                relativePath
            )
        );

        return true;

    }

    catch {

        return false;

    }

}


async function readText(
    relativePath
) {

    return fs.readFile(
        path.join(
            ROOT,
            relativePath
        ),
        "utf8"
    );

}


function containsWorkflowName(
    source,
    workflowName
) {

    const escapedName =
        workflowName.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    return new RegExp(
        `^\\s*name:\\s*["']?${escapedName}["']?\\s*$`,
        "m"
    ).test(
        source
    );

}


function containsNodeScript(
    source,
    scriptPath
) {

    const escapedPath =
        scriptPath.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    return new RegExp(
        `node\\s+${escapedPath}(?:\\s|$)`,
        "m"
    ).test(
        source
    );

}


function hasPermission(
    source,
    permission,
    value
) {

    const escapedPermission =
        permission.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    const escapedValue =
        value.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    return new RegExp(
        `^\\s*${escapedPermission}:\\s*${escapedValue}\\s*$`,
        "m"
    ).test(
        source
    );

}


function hasAutomaticTrigger(
    source
) {

    return (
        /^\s{2}(?:push|pull_request|schedule|workflow_run):\s*$/m.test(
            source
        )
        ||
        /^\s{2}(?:push|pull_request|schedule|workflow_run):\s*\{/m.test(
            source
        )
    );

}


function hasWorkflowRunTrigger(
    source
) {

    return /^\s{2}workflow_run:\s*$/m.test(
        source
    );

}


function hasManualTrigger(
    source
) {

    return /^\s{2}workflow_dispatch:\s*$/m.test(
        source
    );

}


function hasConcurrencyProtection(
    source
) {

    return (
        /^concurrency:\s*$/m.test(
            source
        )
        &&
        /^\s{2}group:\s*\S+/m.test(
            source
        )
    );

}


// =================================
// AUDIT RESULT HELPERS
// =================================


const failures =
    [];


const notices =
    [];


let passedCheckCount =
    0;


function pass() {

    passedCheckCount +=
        1;

}


function fail(
    source,
    message
) {

    failures.push({
        source,
        message
    });

}


function notice(
    source,
    message
) {

    notices.push({
        source,
        message
    });

}


function requireCondition(
    condition,
    source,
    message
) {

    if (
        condition
    ) {

        pass();

        return;

    }


    fail(
        source,
        message
    );

}


// =================================
// REQUIRED WORKFLOW CHAIN
// =================================


for (
    const definition of requiredWorkflows
) {

    const workflowPath =
        toPosix(
            path.join(
                WORKFLOW_DIRECTORY,
                definition.file
            )
        );


    if (
        !await fileExists(
            workflowPath
        )
    ) {

        fail(
            workflowPath,
            "Required workflow file is missing."
        );

        continue;

    }


    const source =
        await readText(
            workflowPath
        );


    requireCondition(
        containsWorkflowName(
            source,
            definition.workflowName
        ),
        workflowPath,
        `Workflow name must be "${definition.workflowName}".`
    );


    requireCondition(
        hasWorkflowRunTrigger(
            source
        ),
        workflowPath,
        "Required workflow_run trigger is missing."
    );


    requireCondition(
        source.includes(
            definition.upstreamWorkflow
        ),
        workflowPath,
        `Workflow must run after "${definition.upstreamWorkflow}".`
    );


    requireCondition(
        hasManualTrigger(
            source
        ),
        workflowPath,
        "Manual workflow_dispatch fallback is missing."
    );


    requireCondition(
        containsNodeScript(
            source,
            definition.script
        ),
        workflowPath,
        `Workflow does not invoke ${definition.script}.`
    );


    requireCondition(
        hasConcurrencyProtection(
            source
        ),
        workflowPath,
        "Workflow does not define a concurrency group."
    );


    if (
        definition.requiresModels
    ) {

        requireCondition(
            hasPermission(
                source,
                "models",
                "read"
            ),
            workflowPath,
            "AI writer workflow does not declare models: read."
        );

    }


    if (
        definition.requiresWrite
    ) {

        requireCondition(
            hasPermission(
                source,
                "contents",
                "write"
            ),
            workflowPath,
            "Publishing workflow does not declare contents: write."
        );

    }

}


// =================================
// MANUAL-ONLY WORKFLOWS
// =================================


for (
    const fileName of manualOnlyWorkflows
) {

    const workflowPath =
        toPosix(
            path.join(
                WORKFLOW_DIRECTORY,
                fileName
            )
        );


    if (
        !await fileExists(
            workflowPath
        )
    ) {

        fail(
            workflowPath,
            "Expected manual workflow file is missing."
        );

        continue;

    }


    const source =
        await readText(
            workflowPath
        );


    requireCondition(
        hasManualTrigger(
            source
        ),
        workflowPath,
        "Manual workflow does not define workflow_dispatch."
    );


    requireCondition(
        !hasAutomaticTrigger(
            source
        ),
        workflowPath,
        "Manual audit/test workflow contains an automatic trigger."
    );

}


// =================================
// AFTER DARK DUPLICATE PROTECTION
// =================================


const afterDarkContextPath =
    "scripts/build-after-dark-context.mjs";


if (
    await fileExists(
        afterDarkContextPath
    )
) {

    const source =
        await readText(
            afterDarkContextPath
        );


    requireCondition(
        source.includes(
            "data/after-dark/archive-index.json"
        ),
        afterDarkContextPath,
        "Context builder does not read the After Dark archive."
    );


    requireCondition(
        /published|existing/i.test(
            source
        ),
        afterDarkContextPath,
        "Context builder does not appear to track already-published episodes."
    );


    requireCondition(
        source.includes(
            "generation-queue.json"
        ),
        afterDarkContextPath,
        "Context builder does not write the After Dark generation queue."
    );

}

else {

    fail(
        afterDarkContextPath,
        "After Dark context builder is missing."
    );

}


const afterDarkWriterPath =
    "scripts/write-after-dark-episode.mjs";


if (
    await fileExists(
        afterDarkWriterPath
    )
) {

    const source =
        await readText(
            afterDarkWriterPath
        );


    requireCondition(
        source.includes(
            "data/after-dark/archive-index.json"
        ),
        afterDarkWriterPath,
        "Writer does not read or update the After Dark archive."
    );


    requireCondition(
        /existing|published/i.test(
            source
        ),
        afterDarkWriterPath,
        "Writer does not appear to reject previously published episodes."
    );


    requireCondition(
        source.includes(
            "pendingWeeks"
        ),
        afterDarkWriterPath,
        "Writer does not appear to read pending weekly packages."
    );

}

else {

    fail(
        afterDarkWriterPath,
        "After Dark writer is missing."
    );

}


// =================================
// SUNDAY DISSERVICE DUPLICATE PROTECTION
// =================================


const sundayContextPath =
    "scripts/build-sunday-disservice-context.mjs";


if (
    await fileExists(
        sundayContextPath
    )
) {

    const source =
        await readText(
            sundayContextPath
        );


    requireCondition(
        source.includes(
            "publishedSermonIds"
        ),
        sundayContextPath,
        "Context builder does not block published sermon IDs."
    );


    requireCondition(
        source.includes(
            "publishedDeliveryDates"
        ),
        sundayContextPath,
        "Context builder does not block published delivery dates."
    );


    requireCondition(
        source.includes(
            "data/sunday-disservice/archive-index.json"
        ),
        sundayContextPath,
        "Context builder does not read the Sunday archive."
    );

}

else {

    fail(
        sundayContextPath,
        "Sunday Disservice context builder is missing."
    );

}


const sundayWriterPath =
    "scripts/write-sunday-disservice-sermon.mjs";


if (
    await fileExists(
        sundayWriterPath
    )
) {

    const source =
        await readText(
            sundayWriterPath
        );


    requireCondition(
        source.includes(
            "existingIds"
        ),
        sundayWriterPath,
        "Writer does not block previously published sermon IDs."
    );


    requireCondition(
        source.includes(
            "existingNumbers"
        ),
        sundayWriterPath,
        "Writer does not block previously used sermon numbers."
    );


    requireCondition(
        source.includes(
            "data/sunday-disservice/archive-index.json"
        ),
        sundayWriterPath,
        "Writer does not read or update the Sunday archive."
    );


    requireCondition(
        source.includes(
            "pendingWeeks"
        ),
        sundayWriterPath,
        "Writer does not appear to read pending weekly packages."
    );

}

else {

    fail(
        sundayWriterPath,
        "Sunday Disservice writer is missing."
    );

}


// =================================
// AUDIO WORKFLOW SAFETY
// =================================


const audioWorkflowPath =
    ".github/workflows/generate-sunday-disservice-audio.yml";


if (
    await fileExists(
        audioWorkflowPath
    )
) {

    const source =
        await readText(
            audioWorkflowPath
        );


    requireCondition(
        source.includes(
            "vars.SUNDAY_DISSERVICE_AUDIO_ENABLED"
        ),
        audioWorkflowPath,
        "Audio workflow is not protected by the repository kill switch."
    );


    requireCondition(
        source.includes(
            "vars.SUNDAY_DISSERVICE_AUDIO_ENABLED == 'true'"
        ),
        audioWorkflowPath,
        "Audio-generation job does not require the kill switch to equal true."
    );


    requireCondition(
        source.includes(
            "vars.SUNDAY_DISSERVICE_AUDIO_ENABLED != 'true'"
        ),
        audioWorkflowPath,
        "Audio-disabled reporting job is missing."
    );


    requireCondition(
        source.includes(
            "--check-only"
        ),
        audioWorkflowPath,
        "Audio workflow does not run the zero-credit eligibility check."
    );


    requireCondition(
        source.includes(
            "should_generate == 'true'"
        ),
        audioWorkflowPath,
        "Paid audio step is not gated by the protected eligibility result."
    );


    requireCondition(
        source.includes(
            "secrets.ELEVENLABS_API_KEY"
        ),
        audioWorkflowPath,
        "Audio workflow does not reference the ElevenLabs API-key secret."
    );


    requireCondition(
        source.includes(
            "secrets.TREY_WISE_VOICE_ID"
        ),
        audioWorkflowPath,
        "Audio workflow does not reference the Trey Wise voice-ID secret."
    );


    requireCondition(
        !source.includes(
            "xi-api-key:"
        ),
        audioWorkflowPath,
        "Workflow appears to contain a direct ElevenLabs authentication header."
    );

}


// =================================
// AUDIO SCRIPT DUPLICATE PROTECTION
// =================================


const audioScriptPath =
    "scripts/generate-sunday-disservice-audio.mjs";


if (
    await fileExists(
        audioScriptPath
    )
) {

    const source =
        await readText(
            audioScriptPath
        );


    requireCondition(
        source.includes(
            "audioAlreadyExists"
        ),
        audioScriptPath,
        "Audio script does not check whether the MP3 already exists."
    );


    requireCondition(
        source.includes(
            "generationFingerprint"
        ),
        audioScriptPath,
        "Audio script does not create a generation fingerprint."
    );


    requireCondition(
        source.includes(
            "sourceHash"
        ),
        audioScriptPath,
        "Audio script does not hash the narration source."
    );


    requireCondition(
        source.includes(
            "MAX_NARRATION_CHARACTERS"
        ),
        audioScriptPath,
        "Audio script does not enforce a single-request narration limit."
    );


    requireCondition(
        source.includes(
            "TARGET_SERMON_ID"
        ),
        audioScriptPath,
        "Audio script does not support exact protected sermon selection."
    );


    requireCondition(
        source.includes(
            "ElevenLabs was not contacted"
        ),
        audioScriptPath,
        "Audio script does not clearly report zero-request exits."
    );

}

else {

    fail(
        audioScriptPath,
        "Sunday Disservice audio generator is missing."
    );

}


// =================================
// SMOKE-TEST SAFETY
// =================================


const smokeWorkflowPath =
    ".github/workflows/test-owl-media-end-to-end.yml";


if (
    await fileExists(
        smokeWorkflowPath
    )
) {

    const source =
        await readText(
            smokeWorkflowPath
        );


    requireCondition(
        source.includes(
            "workflow_dispatch"
        ),
        smokeWorkflowPath,
        "End-to-end test is not manually triggered."
    );


    requireCondition(
        !source.includes(
            "workflow_run:"
        ),
        smokeWorkflowPath,
        "End-to-end smoke test must not trigger automatically."
    );


    requireCondition(
        source.includes(
            "- generate"
        )
        &&
        source.includes(
            "- cleanup"
        ),
        smokeWorkflowPath,
        "Smoke test does not provide both generate and cleanup actions."
    );


    requireCondition(
        source.includes(
            "git restore"
        ),
        smokeWorkflowPath,
        "Smoke test does not restore temporary core database fixtures."
    );

}


// =================================
// REPORT
// =================================


console.log(
    `Passed ${passedCheckCount} automation-safety checks.`
);


if (
    notices.length
) {

    console.log(
        "\nAUTOMATION NOTICES:\n"
    );


    for (
        const item of notices
    ) {

        console.log(
            `- ${item.source}`
        );


        console.log(
            `  ${item.message}`
        );

    }

}


if (
    !failures.length
) {

    console.log(
        "\nPASS: OWL publishing automation, duplicate protection, manual test boundaries, and Sunday audio safeguards are correctly configured."
    );


    process.exit(
        0
    );

}


console.error(
    "\nAUTOMATION SAFETY FAILURES:\n"
);


for (
    const failure of failures
) {

    console.error(
        `- ${failure.source}`
    );


    console.error(
        `  ${failure.message}`
    );

}


console.error(
    `\nFAIL: ${failures.length} automation-safety problem(s) found.`
);


process.exit(
    1
);
