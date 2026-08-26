import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const CHECK_ONLY = process.argv.includes("--check-only");
const TARGET_SERMON_ID = String(process.env.TARGET_SERMON_ID || "").trim();
const ELEVENLABS_API_KEY = String(process.env.ELEVENLABS_API_KEY || "").trim();
const TREY_WISE_VOICE_ID = String(process.env.TREY_WISE_VOICE_ID || "").trim();
const MODEL = String(process.env.SUNDAY_DISSERVICE_AUDIO_MODEL || "eleven_v3").trim();
const OUTPUT_FORMAT = String(process.env.SUNDAY_DISSERVICE_AUDIO_FORMAT || "mp3_44100_128").trim();

const MAX_NARRATION_CHARACTERS = 4500;
const MAX_DIALOGUE_BATCH_CHARACTERS = 1800;
const ARCHIVE_INDEX_PATH = "data/sunday-disservice/archive-index.json";
const AUDIO_DIRECTORY = "assets/audio/sunday-disservice";

function array(value) {
    return Array.isArray(value) ? value : [];
}

function cleanText(value) {
    return String(value || "").trim();
}

function hashText(value) {
    return crypto
        .createHash("sha256")
        .update(String(value || ""), "utf8")
        .digest("hex");
}

function toPosixPath(value) {
    return String(value || "").replace(/\\/g, "/");
}

async function fileExists(relativePath) {
    try {
        await fs.access(path.join(ROOT, relativePath));
        return true;
    }
    catch {
        return false;
    }
}

async function readJson(relativePath, fallback = undefined) {
    const fullPath = path.join(ROOT, relativePath);

    try {
        return JSON.parse(await fs.readFile(fullPath, "utf8"));
    }
    catch (error) {
        if (fallback !== undefined && error.code === "ENOENT") {
            return fallback;
        }

        throw new Error(`Could not read ${relativePath}: ${error.message}`);
    }
}

async function writeJson(relativePath, value) {
    const fullPath = path.join(ROOT, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function gitOutput(args) {
    try {
        return execFileSync("git", args, {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"]
        }).trim();
    }
    catch {
        return "";
    }
}

function automaticCandidateIds() {
    if (gitOutput(["log", "-1", "--pretty=%s"]) !== "Publish Sunday Disservice sermon") {
        return [];
    }

    return gitOutput([
        "diff-tree",
        "--no-commit-id",
        "--name-only",
        "-r",
        "HEAD"
    ])
        .split(/\r?\n/)
        .map(line => toPosixPath(line.trim()))
        .filter(filePath =>
            /^data\/sunday-disservice\/sunday-disservice-[^/]+\.json$/
                .test(filePath)
        )
        .map(filePath => path.basename(filePath, ".json"));
}

function speechText(value) {
    return cleanText(value)
        .replace(/\[([^\]]+)]\([^\s)]+\)/g, "$1")
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/<[^>]*>/g, "")
        .replace(/[*_#`~]/g, "")
        .replace(/\s*&\s*/g, " and ")
        .replace(/\bvs\.?\b/gi, "versus")
        .replace(/\bOWL\b/g, "O. W. L.")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function dialogueTurn(cue, ...parts) {
    const text = parts
        .map(speechText)
        .filter(Boolean)
        .join(" ");

    return text
        ? { text: speechText(`${cue} ${text}`) }
        : null;
}

function entryText(entry) {
    if (typeof entry === "string") {
        return speechText(entry);
    }

    return [
        speechText(entry?.title),
        speechText(entry?.body)
    ]
        .filter(Boolean)
        .join(". ");
}

function collectionTurns(cue, introduction, entries) {
    return array(entries)
        .map(entryText)
        .filter(Boolean)
        .map((text, index) =>
            dialogueTurn(
                cue,
                index === 0 ? introduction : "",
                text
            )
        )
        .filter(Boolean);
}

function buildDialogueTurns(sermon) {
    const turns = [];

    const intro = dialogueTurn(
        "[American accent] [excited] [confident]",
        "Sunday Disservice. The Gospel According to Trey Wise.",
        Number.isFinite(Number(sermon.sermon))
            ? `Sermon ${Number(sermon.sermon)}.`
            : "",
        sermon.label
            ? `Delivered ${speechText(sermon.label)}.`
            : "",
        sermon.headline,
        sermon.deck
    );

    if (intro) {
        turns.push(intro);
    }

    const argumentTitle = speechText(sermon?.argument?.title);
    const argumentBody = array(sermon?.argument?.body)
        .map(speechText)
        .filter(Boolean);

    const argumentCues = [
        "[American accent] [incredulous] [conversational]",
        "[American accent] [frustrated] [emphatic]",
        "[American accent] [sarcastic] [conversational]"
    ];

    argumentBody.forEach((paragraph, index) => {
        const turn = dialogueTurn(
            argumentCues[index % argumentCues.length],
            index === 0 && argumentTitle
                ? `Here's where I'm at: ${argumentTitle}.`
                : "",
            paragraph
        );

        if (turn) {
            turns.push(turn);
        }
    });

    if (argumentTitle && !argumentBody.length) {
        turns.push(
            dialogueTurn(
                "[American accent] [incredulous] [conversational]",
                `Here's where I'm at: ${argumentTitle}.`
            )
        );
    }

    turns.push(
        ...collectionTurns(
            "[American accent] [approving] [upbeat]",
            "Aight, give credit where it's due.",
            sermon.praise
        ),
        ...collectionTurns(
            "[American accent] [frustrated] [heated]",
            "Now for what I got a problem with.",
            sermon.condemnation
        ),
        ...collectionTurns(
            "[American accent] [mischievously] [cocky]",
            "Now, y'all already know who I've been backing.",
            sermon.favorites
        ),
        ...collectionTurns(
            "[American accent] [sarcastic] [defensive]",
            "And yeah, y'all keep receipts on me too.",
            sermon.blindSpots
        )
    );

    if (sermon.closingWord) {
        turns.push(
            dialogueTurn(
                "[American accent] [serious] [calm]",
                "Before I get outta here, one last thing.",
                sermon.closingWord
            )
        );
    }

    return turns.filter(Boolean);
}

function narrationFromTurns(turns) {
    return array(turns)
        .map(turn => speechText(turn?.text))
        .filter(Boolean)
        .join("\n\n");
}

function buildDialogueBatches(turns) {
    const batches = [];
    let currentBatch = [];
    let currentCharacters = 0;

    for (const turn of array(turns)) {
        const text = speechText(turn?.text);

        if (!text) {
            continue;
        }

        if (text.length > MAX_DIALOGUE_BATCH_CHARACTERS) {
            throw new Error(
                `A single dialogue turn is ${text.length} characters. The protected per-request turn limit is ${MAX_DIALOGUE_BATCH_CHARACTERS}. ElevenLabs was not contacted.`
            );
        }

        if (
            currentBatch.length
            && currentCharacters + text.length > MAX_DIALOGUE_BATCH_CHARACTERS
        ) {
            batches.push(currentBatch);
            currentBatch = [];
            currentCharacters = 0;
        }

        currentBatch.push({ text });
        currentCharacters += text.length;
    }

    if (currentBatch.length) {
        batches.push(currentBatch);
    }

    return batches;
}

function expectedAudioPath(sermonId) {
    return `${AUDIO_DIRECTORY}/${sermonId}.mp3`;
}

async function loadSermonCandidate(archiveIndex, sermonId) {
    const entry = array(archiveIndex.sermons)
        .find(sermon => sermon.id === sermonId);

    if (!entry) {
        return null;
    }

    const sermonPath = entry.file
        || `data/sunday-disservice/${sermonId}.json`;

    const sermon = await readJson(sermonPath, null);

    if (!sermon) {
        return null;
    }

    const audioPath = sermon?.audio?.file
        || expectedAudioPath(sermonId);

    const turns = buildDialogueTurns(sermon);

    return {
        entry,
        sermon,
        sermonPath,
        audioPath,
        audioAlreadyExists: await fileExists(audioPath),
        turns,
        narration: narrationFromTurns(turns)
    };
}

async function selectCandidate(archiveIndex) {
    const candidateIds = TARGET_SERMON_ID
        ? [TARGET_SERMON_ID]
        : automaticCandidateIds();

    if (!candidateIds.length) {
        return {
            candidate: null,
            reason: TARGET_SERMON_ID
                ? "The requested sermon was not found."
                : "The latest commit did not publish a new Sunday Disservice sermon."
        };
    }

    for (const sermonId of candidateIds) {
        const candidate = await loadSermonCandidate(archiveIndex, sermonId);

        if (!candidate) {
            continue;
        }

        if (candidate.audioAlreadyExists) {
            continue;
        }

        if (!candidate.narration) {
            continue;
        }

        return {
            candidate,
            reason: "A newly published sermon has no audio file."
        };
    }

    return {
        candidate: null,
        reason: "No selected sermon requires a new audio file."
    };
}

function printDecision(candidate, reason) {
    console.log(`SHOULD_GENERATE=${candidate ? "true" : "false"}`);
    console.log(`SERMON_ID=${candidate?.sermon?.id || ""}`);
    console.log(`CHARACTER_COUNT=${candidate?.narration?.length || 0}`);
    console.log(`TURN_COUNT=${candidate?.turns?.length || 0}`);
    console.log(`DIALOGUE_BATCH_COUNT=${candidate ? buildDialogueBatches(candidate.turns).length : 0}`);
    console.log(`REASON=${reason}`);
}

async function generateDialogueBatch(batch, batchNumber, totalBatches) {
    const endpoint = new URL("https://api.elevenlabs.io/v1/text-to-dialogue");
    endpoint.searchParams.set("output_format", OUTPUT_FORMAT);

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
            inputs: batch.map(turn => ({
                text: turn.text,
                voice_id: TREY_WISE_VOICE_ID
            })),
            model_id: MODEL,
            language_code: "en",
            settings: {
                stability: 0.35
            }
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
            `ElevenLabs dialogue batch ${batchNumber}/${totalBatches} failed (${response.status}): ${errorBody}`
        );
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    if (!audioBuffer.length) {
        throw new Error(
            `ElevenLabs returned an empty audio file for dialogue batch ${batchNumber}/${totalBatches}.`
        );
    }

    return audioBuffer;
}

async function generateAudio(turns) {
    const batches = buildDialogueBatches(turns);

    if (!batches.length) {
        throw new Error(
            "No dialogue turns were available for audio generation. ElevenLabs was not contacted."
        );
    }

    console.log(
        `Generating ${turns.length} performance turns across ${batches.length} protected dialogue request(s).`
    );

    const audioBuffers = [];

    for (let index = 0; index < batches.length; index += 1) {
        const batchNumber = index + 1;

        console.log(
            `Generating dialogue batch ${batchNumber}/${batches.length}.`
        );

        audioBuffers.push(
            await generateDialogueBatch(
                batches[index],
                batchNumber,
                batches.length
            )
        );
    }

    return {
        audioBuffer: Buffer.concat(audioBuffers),
        requestCount: batches.length,
        turnCount: turns.length
    };
}

const archiveIndex = await readJson(
    ARCHIVE_INDEX_PATH,
    {
        version: 1,
        sermons: []
    }
);

const selection = await selectCandidate(archiveIndex);

if (CHECK_ONLY) {
    printDecision(selection.candidate, selection.reason);
    process.exit(0);
}

if (!selection.candidate) {
    console.log(selection.reason);
    console.log("ElevenLabs was not contacted. Credits used: 0.");
    process.exit(0);
}

if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is missing.");
}

if (!TREY_WISE_VOICE_ID) {
    throw new Error("TREY_WISE_VOICE_ID is missing.");
}

const {
    entry,
    sermon,
    sermonPath,
    audioPath,
    turns,
    narration
} = selection.candidate;

if (narration.length > MAX_NARRATION_CHARACTERS) {
    throw new Error(
        `Narration is ${narration.length} characters. The protected total narration limit is ${MAX_NARRATION_CHARACTERS}. ElevenLabs was not contacted.`
    );
}

if (await fileExists(audioPath)) {
    console.log(`Audio already exists for ${sermon.id}.`);
    console.log("ElevenLabs was not contacted. Credits used: 0.");
    process.exit(0);
}

const sourceHash = hashText(narration);
const voiceFingerprint = hashText(TREY_WISE_VOICE_ID).slice(0, 16);
const generationFingerprint = hashText(
    JSON.stringify({
        sermonId: sermon.id,
        sourceHash,
        voiceFingerprint,
        model: MODEL,
        outputFormat: OUTPUT_FORMAT,
        generationMode: "segmented-text-to-dialogue"
    })
);

console.log(`Generating one audio file for ${sermon.id}.`);
console.log(`Narration characters: ${narration.length}.`);

const {
    audioBuffer,
    requestCount,
    turnCount
} = await generateAudio(turns);

const fullAudioPath = path.join(ROOT, audioPath);
const temporaryAudioPath = `${fullAudioPath}.tmp`;

await fs.mkdir(path.dirname(fullAudioPath), { recursive: true });
await fs.writeFile(temporaryAudioPath, audioBuffer);
await fs.rename(temporaryAudioPath, fullAudioPath);

const generatedAt = new Date().toISOString();

const audioRecord = {
    status: "published",
    file: audioPath,
    format: OUTPUT_FORMAT,
    model: MODEL,
    voice: "Trey Wise",
    voiceFingerprint,
    generationMode: "segmented-text-to-dialogue",
    turnCount,
    requestCount,
    characterCount: narration.length,
    sourceHash,
    generationFingerprint,
    generatedAt
};

await writeJson(
    sermonPath,
    {
        ...sermon,
        audio: audioRecord
    }
);

await writeJson(
    ARCHIVE_INDEX_PATH,
    {
        ...archiveIndex,
        sermons: array(archiveIndex.sermons).map(archiveEntry =>
            archiveEntry.id === entry.id
                ? {
                    ...archiveEntry,
                    audio: {
                        status: "published",
                        file: audioPath,
                        format: OUTPUT_FORMAT,
                        generationMode: "segmented-text-to-dialogue",
                        turnCount,
                        requestCount,
                        characterCount: narration.length,
                        generatedAt
                    }
                }
                : archiveEntry
        )
    }
);

console.log(`Published ${audioPath}.`);
console.log(
    `${requestCount} ElevenLabs dialogue request(s) were made across ${turnCount} performance turns.`
);
