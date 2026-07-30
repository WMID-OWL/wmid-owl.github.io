import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";


const ROOT =
    process.cwd();


const CHECK_ONLY =
    process.argv.includes(
        "--check-only"
    );


const TARGET_SERMON_ID =
    String(
        process.env.TARGET_SERMON_ID || ""
    ).trim();


const ELEVENLABS_API_KEY =
    String(
        process.env.ELEVENLABS_API_KEY || ""
    ).trim();


const TREY_WISE_VOICE_ID =
    String(
        process.env.TREY_WISE_VOICE_ID || ""
    ).trim();


const MODEL =
    String(
        process.env.SUNDAY_DISSERVICE_AUDIO_MODEL
        ||
        "eleven_flash_v2_5"
    ).trim();


const OUTPUT_FORMAT =
    String(
        process.env.SUNDAY_DISSERVICE_AUDIO_FORMAT
        ||
        "mp3_44100_128"
    ).trim();


const MAX_NARRATION_CHARACTERS =
    39000;


const ARCHIVE_INDEX_PATH =
    "data/sunday-disservice/archive-index.json";


const AUDIO_DIRECTORY =
    "assets/audio/sunday-disservice";


// =================================
// BASIC HELPERS
// =================================


function array(
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


function hashText(
    value
) {

    return crypto
        .createHash(
            "sha256"
        )
        .update(
            String(
                value || ""
            ),
            "utf8"
        )
        .digest(
            "hex"
        );

}


function toPosixPath(
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


// =================================
// JSON HELPERS
// =================================


async function readJson(
    relativePath,
    fallback = undefined
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
            fallback !== undefined
            &&
            error.code === "ENOENT"
        ) {

            return fallback;

        }


        throw new Error(
            `Could not read ${relativePath}: ${error.message}`
        );

    }

}


async function writeJson(
    relativePath,
    value
) {

    const fullPath =
        path.join(
            ROOT,
            relativePath
        );


    await fs.mkdir(
        path.dirname(
            fullPath
        ),
        {
            recursive:
                true
        }
    );


    await fs.writeFile(
        fullPath,
        `${JSON.stringify(
            value,
            null,
            2
        )}\n`,
        "utf8"
    );

}


// =================================
// GIT-BASED AUTOMATION GATE
// =================================


function gitOutput(
    args
) {

    try {

        return execFileSync(
            "git",
            args,
            {
                cwd:
                    ROOT,

                encoding:
                    "utf8",

                stdio: [
                    "ignore",
                    "pipe",
                    "pipe"
                ]
            }
        ).trim();

    }

    catch {

        return "";

    }

}


function latestCommitMessage() {

    return gitOutput([
        "log",
        "-1",
        "--pretty=%s"
    ]);

}


function latestCommitFiles() {

    return gitOutput([
        "diff-tree",
        "--no-commit-id",
        "--name-only",
        "-r",
        "HEAD"
    ])
        .split(
            /\r?\n/
        )
        .map(
            line =>
                toPosixPath(
                    line.trim()
                )
        )
        .filter(
            Boolean
        );

}


function automaticCandidateIds() {

    const commitMessage =
        latestCommitMessage();


    if (
        commitMessage !==
        "Publish Sunday Disservice sermon"
    ) {

        return [];

    }


    return latestCommitFiles()
        .filter(
            filePath =>
                /^data\/sunday-disservice\/sunday-disservice-[^/]+\.json$/
                    .test(
                        filePath
                    )
        )
        .map(
            filePath =>
                path.basename(
                    filePath,
                    ".json"
                )
        );

}


// =================================
// NARRATION BUILDER
// =================================


function speechText(
    value
) {

    return cleanText(
        value
    )
        .replace(
            /\[([^\]]+)]\([^\s)]+\)/g,
            "$1"
        )
        .replace(
            /https?:\/\/\S+/gi,
            ""
        )
        .replace(
            /<[^>]*>/g,
            ""
        )
        .replace(
            /[*_#`~]/g,
            ""
        )
        .replace(
            /\s*&\s*/g,
            " and "
        )
        .replace(
            /\bvs\.?\b/gi,
            "versus"
        )
        .replace(
            /[ \t]+/g,
            " "
        )
        .replace(
            /\n{3,}/g,
            "\n\n"
        )
        .trim();

}


function sectionNarration(
    heading,
    entries
) {

    const validEntries =
        array(
            entries
        )
            .map(
                entry => ({
                    title:
                        speechText(
                            entry?.title
                        ),

                    body:
                        speechText(
                            entry?.body
                        )
                })
            )
            .filter(
                entry =>
                    entry.title
                    ||
                    entry.body
            );


    if (
        !validEntries.length
    ) {

        return [];

    }


    return [
        heading,
        ...validEntries.map(
            entry =>
                [
                    entry.title,
                    entry.body
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        ". "
                    )
        )
    ];

}


function buildNarration(
    sermon
) {

    const parts = [
        "Sunday Disservice. The Gospel According to Trey Wise.",

        Number.isFinite(
            Number(
                sermon.sermon
            )
        )

            ? `Sermon ${Number(
                sermon.sermon
            )}.`

            : "",

        sermon.label

            ? `Delivered ${speechText(
                sermon.label
            )}.`

            : "",

        speechText(
            sermon.headline
        ),

        speechText(
            sermon.deck
        ),

        sermon?.argument?.title

            ? `Today's text: ${speechText(
                sermon.argument.title
            )}.`

            : "",

        ...array(
            sermon?.argument?.body
        ).map(
            speechText
        ),

        ...sectionNarration(
            "Now, praise where praise is due.",
            sermon.praise
        ),

        ...sectionNarration(
            "And now, condemnation.",
            sermon.condemnation
        ),

        ...sectionNarration(
            "The favorites in my gospel.",
            sermon.favorites
        ),

        ...sectionNarration(
            "The blind spots the congregation keeps putting on trial.",
            sermon.blindSpots
        ),

        sermon.closingWord

            ? "The closing word."

            : "",

        speechText(
            sermon.closingWord
        )
    ]
        .map(
            speechText
        )
        .filter(
            Boolean
        );


    return parts.join(
        "\n\n"
    );

}


// =================================
// SERMON SELECTION
// =================================


function expectedAudioPath(
    sermonId
) {

    return `${AUDIO_DIRECTORY}/${sermonId}.mp3`;

}


async function loadSermonCandidate(
    archiveIndex,
    sermonId
) {

    const entry =
        array(
            archiveIndex.sermons
        ).find(
            sermon =>
                sermon.id === sermonId
        );


    if (
        !entry
    ) {

        return null;

    }


    const sermonPath =
        entry.file
        ||
        `data/sunday-disservice/${sermonId}.json`;


    const sermon =
        await readJson(
            sermonPath,
            null
        );


    if (
        !sermon
    ) {

        return null;

    }


    const audioPath =
        sermon?.audio?.file
        ||
        expectedAudioPath(
            sermonId
        );


    const audioAlreadyExists =
        await fileExists(
            audioPath
        );


    return {
        entry,
        sermon,
        sermonPath,
        audioPath,
        audioAlreadyExists,
        narration:
            buildNarration(
                sermon
            )
    };

}


async function selectCandidate(
    archiveIndex
) {

    const candidateIds =
        TARGET_SERMON_ID

            ? [
                TARGET_SERMON_ID
            ]

            : automaticCandidateIds();


    if (
        !candidateIds.length
    ) {

        return {
            candidate:
                null,

            reason:
                TARGET_SERMON_ID

                    ? "The requested sermon was not found."

                    : "The latest commit did not publish a new Sunday Disservice sermon."
        };

    }


    for (
        const sermonId of candidateIds
    ) {

        const candidate =
            await loadSermonCandidate(
                archiveIndex,
                sermonId
            );


        if (
            !candidate
        ) {

            continue;

        }


        if (
            candidate.audioAlreadyExists
        ) {

            continue;

        }


        if (
            !candidate.narration
        ) {

            continue;

        }


        return {
            candidate,
            reason:
                "A newly published sermon has no audio file."
        };

    }


    return {
        candidate:
            null,

        reason:
            "No selected sermon requires a new audio file."
    };

}


function printDecision(
    candidate,
    reason
) {

    console.log(
        `SHOULD_GENERATE=${candidate ? "true" : "false"}`
    );

    console.log(
        `SERMON_ID=${candidate?.sermon?.id || ""}`
    );

    console.log(
        `CHARACTER_COUNT=${candidate?.narration?.length || 0}`
    );

    console.log(
        `REASON=${reason}`
    );

}


// =================================
// ELEVENLABS REQUEST
// =================================


async function generateAudio(
    narration
) {

    const endpoint =
        new URL(
            `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
                TREY_WISE_VOICE_ID
            )}`
        );


    endpoint.searchParams.set(
        "output_format",
        OUTPUT_FORMAT
    );


    const response =
        await fetch(
            endpoint,
            {
                method:
                    "POST",

                headers: {
                    Accept:
                        "audio/mpeg",

                    "Content-Type":
                        "application/json",

                    "xi-api-key":
                        ELEVENLABS_API_KEY
                },

                body:
                    JSON.stringify({
                        text:
                            narration,

                        model_id:
                            MODEL,

                        language_code:
                            "en"
                    })
            }
        );


    if (
        !response.ok
    ) {

        const errorBody =
            await response.text();


        throw new Error(
            `ElevenLabs request failed (${response.status}): ${errorBody}`
        );

    }


    const audioBuffer =
        Buffer.from(
            await response.arrayBuffer()
        );


    if (
        !audioBuffer.length
    ) {

        throw new Error(
            "ElevenLabs returned an empty audio file."
        );

    }


    return audioBuffer;

}


// =================================
// MAIN
// =================================


const archiveIndex =
    await readJson(
        ARCHIVE_INDEX_PATH,
        {
            version:
                1,

            sermons:
                []
        }
    );


const selection =
    await selectCandidate(
        archiveIndex
    );


if (
    CHECK_ONLY
) {

    printDecision(
        selection.candidate,
        selection.reason
    );

    process.exit(
        0
    );

}


if (
    !selection.candidate
) {

    console.log(
        selection.reason
    );

    console.log(
        "ElevenLabs was not contacted. Credits used: 0."
    );

    process.exit(
        0
    );

}


if (
    !ELEVENLABS_API_KEY
) {

    throw new Error(
        "ELEVENLABS_API_KEY is missing."
    );

}


if (
    !TREY_WISE_VOICE_ID
) {

    throw new Error(
        "TREY_WISE_VOICE_ID is missing."
    );

}


const {
    entry,
    sermon,
    sermonPath,
    audioPath,
    narration
} = selection.candidate;


if (
    narration.length >
    MAX_NARRATION_CHARACTERS
) {

    throw new Error(
        `Narration is ${narration.length} characters. The protected single-request limit is ${MAX_NARRATION_CHARACTERS}. ElevenLabs was not contacted.`
    );

}


if (
    await fileExists(
        audioPath
    )
) {

    console.log(
        `Audio already exists for ${sermon.id}.`
    );

    console.log(
        "ElevenLabs was not contacted. Credits used: 0."
    );

    process.exit(
        0
    );

}


const sourceHash =
    hashText(
        narration
    );


const voiceFingerprint =
    hashText(
        TREY_WISE_VOICE_ID
    ).slice(
        0,
        16
    );


const generationFingerprint =
    hashText(
        JSON.stringify({
            sermonId:
                sermon.id,

            sourceHash,

            voiceFingerprint,

            model:
                MODEL,

            outputFormat:
                OUTPUT_FORMAT
        })
    );


console.log(
    `Generating one audio file for ${sermon.id}.`
);

console.log(
    `Narration characters: ${narration.length}.`
);


const audioBuffer =
    await generateAudio(
        narration
    );


const fullAudioPath =
    path.join(
        ROOT,
        audioPath
    );


const temporaryAudioPath =
    `${fullAudioPath}.tmp`;


await fs.mkdir(
    path.dirname(
        fullAudioPath
    ),
    {
        recursive:
            true
    }
);


await fs.writeFile(
    temporaryAudioPath,
    audioBuffer
);


await fs.rename(
    temporaryAudioPath,
    fullAudioPath
);


const generatedAt =
    new Date().toISOString();


const audioRecord = {
    status:
        "published",

    file:
        audioPath,

    format:
        OUTPUT_FORMAT,

    model:
        MODEL,

    voice:
        "Trey Wise",

    voiceFingerprint,

    characterCount:
        narration.length,

    sourceHash,

    generationFingerprint,

    generatedAt
};


const updatedSermon = {
    ...sermon,
    audio:
        audioRecord
};


await writeJson(
    sermonPath,
    updatedSermon
);


const updatedArchive = {
    ...archiveIndex,

    sermons:
        array(
            archiveIndex.sermons
        ).map(
            archiveEntry =>
                archiveEntry.id === entry.id

                    ? {
                        ...archiveEntry,

                        audio: {
                            status:
                                "published",

                            file:
                                audioPath,

                            format:
                                OUTPUT_FORMAT,

                            characterCount:
                                narration.length,

                            generatedAt
                        }
                    }

                    : archiveEntry
        )
};


await writeJson(
    ARCHIVE_INDEX_PATH,
    updatedArchive
);


console.log(
    `Published ${audioPath}.`
);

console.log(
    "One ElevenLabs request was made."
);
