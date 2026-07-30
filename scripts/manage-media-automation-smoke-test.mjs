import fs from "node:fs/promises";
import path from "node:path";


const ROOT =
    process.cwd();


const ACTION =
    String(
        process.env.SMOKE_TEST_ACTION || ""
    )
        .trim()
        .toLowerCase();


const AFTER_DARK_ID =
    "after-dark-2200-01-01";


const SUNDAY_DISSERVICE_ID =
    "sunday-disservice-2200-01-05";


const AUDIO_FILE =
    `assets/audio/sunday-disservice/${SUNDAY_DISSERVICE_ID}.mp3`;


const EVENT_IDS =
    new Set([

        "media-smoke-ascension-2199-12-31",
        "media-smoke-revolt-2200-01-01"

    ]);


const MATCH_IDS =
    new Set([

        "media-smoke-ascension-match-1",
        "media-smoke-ascension-match-2",
        "media-smoke-revolt-match-1",
        "media-smoke-revolt-match-2"

    ]);


const SEGMENT_IDS =
    new Set([

        "media-smoke-ascension-segment-1",
        "media-smoke-ascension-segment-2",
        "media-smoke-revolt-segment-1",
        "media-smoke-revolt-segment-2"

    ]);


const WRESTLER_IDS =
    new Set([

        "media-smoke-atlas-crowe",
        "media-smoke-mason-reed",
        "media-smoke-nova-mercer",
        "media-smoke-ember-vale",
        "media-smoke-jax-ransom",
        "media-smoke-luca-voss",
        "media-smoke-rhea-knox",
        "media-smoke-sloane-ryder"

    ]);


// =================================
// HELPERS
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


async function readJson(
    relativePath,
    fallback
) {

    try {

        return JSON.parse(

            await fs.readFile(

                path.join(
                    ROOT,
                    relativePath
                ),

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


async function removeFile(
    relativePath
) {

    await fs.rm(

        path.join(
            ROOT,
            relativePath
        ),

        {
            force:
                true
        }

    );

}


function withoutIds(
    records,
    ids
) {

    return array(
        records
    ).filter(

        record =>
            !ids.has(
                record?.id
            )

    );

}


// =================================
// TEMPORARY WRESTLERS
// =================================


const testWrestlers = [

    {
        id:
            "media-smoke-atlas-crowe",

        name:
            "Atlas Crowe",

        nickname:
            "The Standard",

        hometown:
            "Test Fixture",

        country:
            "United States",

        countryCode:
            "US",

        flag:
            "🇺🇸",

        brand:
            "Ascension",

        division:
            "Men",

        finisher:
            "Final Measure",

        whyImHere:
            "Disposable media automation test wrestler.",

        photo:
            "",

        championshipsHeld:
            [],

        awards:
            []
    },

    {
        id:
            "media-smoke-mason-reed",

        name:
            "Mason Reed",

        nickname:
            "The Foundation",

        hometown:
            "Test Fixture",

        country:
            "United States",

        countryCode:
            "US",

        flag:
            "🇺🇸",

        brand:
            "Ascension",

        division:
            "Men",

        finisher:
            "Cornerstone",

        whyImHere:
            "Disposable media automation test wrestler.",

        photo:
            "",

        championshipsHeld:
            [],

        awards:
            []
    },

    {
        id:
            "media-smoke-nova-mercer",

        name:
            "Nova Mercer",

        nickname:
            "The Breakthrough",

        hometown:
            "Test Fixture",

        country:
            "United States",

        countryCode:
            "US",

        flag:
            "🇺🇸",

        brand:
            "Ascension",

        division:
            "Women",

        finisher:
            "Supernova",

        whyImHere:
            "Disposable media automation test wrestler.",

        photo:
            "",

        championshipsHeld:
            [],

        awards:
            []
    },

    {
        id:
            "media-smoke-ember-vale",

        name:
            "Ember Vale",

        nickname:
            "The Last Spark",

        hometown:
            "Test Fixture",

        country:
            "United States",

        countryCode:
            "US",

        flag:
            "🇺🇸",

        brand:
            "Ascension",

        division:
            "Women",

        finisher:
            "Burn Notice",

        whyImHere:
            "Disposable media automation test wrestler.",

        photo:
            "",

        championshipsHeld:
            [],

        awards:
            []
    },

    {
        id:
            "media-smoke-jax-ransom",

        name:
            "Jax Ransom",

        nickname:
            "No Refunds",

        hometown:
            "Test Fixture",

        country:
            "United States",

        countryCode:
            "US",

        flag:
            "🇺🇸",

        brand:
            "Revolt",

        division:
            "Men",

        finisher:
            "Paid in Full",

        whyImHere:
            "Disposable media automation test wrestler.",

        photo:
            "",

        championshipsHeld:
            [],

        awards:
            []
    },

    {
        id:
            "media-smoke-luca-voss",

        name:
            "Luca Voss",

        nickname:
            "The Counterpoint",

        hometown:
            "Test Fixture",

        country:
            "United States",

        countryCode:
            "US",

        flag:
            "🇺🇸",

        brand:
            "Revolt",

        division:
            "Men",

        finisher:
            "Final Argument",

        whyImHere:
            "Disposable media automation test wrestler.",

        photo:
            "",

        championshipsHeld:
            [],

        awards:
            []
    },

    {
        id:
            "media-smoke-rhea-knox",

        name:
            "Rhea Knox",

        nickname:
            "The Pace Setter",

        hometown:
            "Test Fixture",

        country:
            "United States",

        countryCode:
            "US",

        flag:
            "🇺🇸",

        brand:
            "Revolt",

        division:
            "Women",

        finisher:
            "Knox Out",

        whyImHere:
            "Disposable media automation test wrestler.",

        photo:
            "",

        championshipsHeld:
            [],

        awards:
            []
    },

    {
        id:
            "media-smoke-sloane-ryder",

        name:
            "Sloane Ryder",

        nickname:
            "Against the Current",

        hometown:
            "Test Fixture",

        country:
            "United States",

        countryCode:
            "US",

        flag:
            "🇺🇸",

        brand:
            "Revolt",

        division:
            "Women",

        finisher:
            "Wrong Way Down",

        whyImHere:
            "Disposable media automation test wrestler.",

        photo:
            "",

        championshipsHeld:
            [],

        awards:
            []
    }

];


// =================================
// TEMPORARY EVENTS
// =================================


const testEvents = [

    {
        id:
            "media-smoke-ascension-2199-12-31",

        name:
            "Ascension — Media Automation Test",

        brand:
            "Ascension",

        eventType:
            "weekly",

        date:
            "2199-12-31",

        status:
            "completed",

        location:
            "OWL Parliament Hall",

        tagline:
            "Disposable automation smoke test",

        description:
            "Temporary non-canon event used only to verify OWL Media automation."
    },

    {
        id:
            "media-smoke-revolt-2200-01-01",

        name:
            "Revolt — Media Automation Test",

        brand:
            "Revolt",

        eventType:
            "weekly",

        date:
            "2200-01-01",

        status:
            "completed",

        location:
            "OWL Parliament Hall",

        tagline:
            "Disposable automation smoke test",

        description:
            "Temporary non-canon event used only to verify OWL Media automation."
    }

];


// =================================
// TEMPORARY MATCHES
// =================================


const testMatches = [

    {
        id:
            "media-smoke-ascension-match-1",

        eventId:
            "media-smoke-ascension-2199-12-31",

        event:
            "Ascension — Media Automation Test",

        date:
            "2199-12-31",

        brand:
            "Ascension",

        eventType:
            "weekly",

        status:
            "completed",

        order:
            1,

        matchType:
            "Singles Match",

        sides: [

            {
                wrestlers: [
                    "media-smoke-atlas-crowe"
                ]
            },

            {
                wrestlers: [
                    "media-smoke-mason-reed"
                ]
            }

        ],

        winnerSide:
            0,

        resultType:
            "win",

        finish: {
            method:
                "Pinfall",

            winner:
                "Atlas Crowe",

            loser:
                "Mason Reed"
        },

        rating:
            88,

        starRating:
            4.25,

        duration:
            "15:18"
    },

    {
        id:
            "media-smoke-ascension-match-2",

        eventId:
            "media-smoke-ascension-2199-12-31",

        event:
            "Ascension — Media Automation Test",

        date:
            "2199-12-31",

        brand:
            "Ascension",

        eventType:
            "weekly",

        status:
            "completed",

        order:
            2,

        matchType:
            "Singles Match",

        sides: [

            {
                wrestlers: [
                    "media-smoke-nova-mercer"
                ]
            },

            {
                wrestlers: [
                    "media-smoke-ember-vale"
                ]
            }

        ],

        winnerSide:
            0,

        resultType:
            "win",

        finish: {
            method:
                "Pinfall",

            winner:
                "Nova Mercer",

            loser:
                "Ember Vale"
        },

        rating:
            91,

        starRating:
            4.5,

        duration:
            "17:42"
    },

    {
        id:
            "media-smoke-revolt-match-1",

        eventId:
            "media-smoke-revolt-2200-01-01",

        event:
            "Revolt — Media Automation Test",

        date:
            "2200-01-01",

        brand:
            "Revolt",

        eventType:
            "weekly",

        status:
            "completed",

        order:
            1,

        matchType:
            "Singles Match",

        sides: [

            {
                wrestlers: [
                    "media-smoke-jax-ransom"
                ]
            },

            {
                wrestlers: [
                    "media-smoke-luca-voss"
                ]
            }

        ],

        winnerSide:
            0,

        resultType:
            "win",

        finish: {
            method:
                "Submission",

            winner:
                "Jax Ransom",

            loser:
                "Luca Voss"
        },

        rating:
            86,

        starRating:
            4,

        duration:
            "13:57"
    },

    {
        id:
            "media-smoke-revolt-match-2",

        eventId:
            "media-smoke-revolt-2200-01-01",

        event:
            "Revolt — Media Automation Test",

        date:
            "2200-01-01",

        brand:
            "Revolt",

        eventType:
            "weekly",

        status:
            "completed",

        order:
            2,

        matchType:
            "Singles Match",

        sides: [

            {
                wrestlers: [
                    "media-smoke-rhea-knox"
                ]
            },

            {
                wrestlers: [
                    "media-smoke-sloane-ryder"
                ]
            }

        ],

        winnerSide:
            0,

        resultType:
            "win",

        finish: {
            method:
                "KO",

            winner:
                "Rhea Knox",

            loser:
                "Sloane Ryder"
        },

        rating:
            89,

        starRating:
            4.25,

        duration:
            "12:49"
    }

];


// =================================
// TEMPORARY SEGMENTS
// =================================


const testSegments = [

    {
        id:
            "media-smoke-ascension-segment-1",

        eventId:
            "media-smoke-ascension-2199-12-31",

        order:
            3,

        type:
            "promo",

        title:
            "Atlas Crowe Addresses His Victory",

        summary:
            "Atlas Crowe said preparation mattered more than noise and presented his victory over Mason Reed as proof of that belief.",

        participantIds: [
            "media-smoke-atlas-crowe"
        ],

        createdAt:
            "2199-12-31T23:00:00.000Z"
    },

    {
        id:
            "media-smoke-ascension-segment-2",

        eventId:
            "media-smoke-ascension-2199-12-31",

        order:
            4,

        type:
            "interview",

        title:
            "Ember Vale Rejects Excuses",

        summary:
            "Ember Vale accepted responsibility for her loss to Nova Mercer and said one result would not change her approach.",

        participantIds: [
            "media-smoke-ember-vale"
        ],

        createdAt:
            "2199-12-31T23:10:00.000Z"
    },

    {
        id:
            "media-smoke-revolt-segment-1",

        eventId:
            "media-smoke-revolt-2200-01-01",

        order:
            3,

        type:
            "promo",

        title:
            "Jax Ransom Sets His Standard",

        summary:
            "Jax Ransom said he expected resistance from Luca Voss and viewed the submission victory as the first result supporting his larger ambitions.",

        participantIds: [
            "media-smoke-jax-ransom"
        ],

        createdAt:
            "2200-01-01T23:00:00.000Z"
    },

    {
        id:
            "media-smoke-revolt-segment-2",

        eventId:
            "media-smoke-revolt-2200-01-01",

        order:
            4,

        type:
            "interview",

        title:
            "Rhea Knox Refuses Approval",

        summary:
            "Rhea Knox said she did not need public approval after defeating Sloane Ryder and wanted the division judged at her pace.",

        participantIds: [
            "media-smoke-rhea-knox"
        ],

        createdAt:
            "2200-01-01T23:10:00.000Z"
    }

];


// =================================
// CORE DATABASE FIXTURES
// =================================


async function loadCoreData() {

    const [

        events,
        matches,
        segments,
        wrestlers

    ] = await Promise.all([

        readJson(
            "data/events.json",
            []
        ),

        readJson(
            "data/matches.json",
            []
        ),

        readJson(
            "data/segments.json",
            []
        ),

        readJson(
            "data/wrestlers.json",
            []
        )

    ]);


    return {
        events,
        matches,
        segments,
        wrestlers
    };

}


async function writeCoreData(
    core
) {

    await Promise.all([

        writeJson(
            "data/events.json",
            core.events
        ),

        writeJson(
            "data/matches.json",
            core.matches
        ),

        writeJson(
            "data/segments.json",
            core.segments
        ),

        writeJson(
            "data/wrestlers.json",
            core.wrestlers
        )

    ]);

}


function removeCoreFixtures(
    core
) {

    return {

        events:

            withoutIds(
                core.events,
                EVENT_IDS
            ),

        matches:

            withoutIds(
                core.matches,
                MATCH_IDS
            ),

        segments:

            withoutIds(
                core.segments,
                SEGMENT_IDS
            ),

        wrestlers:

            withoutIds(
                core.wrestlers,
                WRESTLER_IDS
            )

    };

}


async function seedCoreFixtures() {

    const core =

        removeCoreFixtures(

            await loadCoreData()

        );


    core.events.push(
        ...testEvents
    );


    core.matches.push(
        ...testMatches
    );


    core.segments.push(
        ...testSegments
    );


    core.wrestlers.push(
        ...testWrestlers
    );


    await writeCoreData(
        core
    );


    console.log(
        "Temporary OWL Media smoke-test data was seeded in the runner workspace."
    );

}


async function cleanCoreFixtures() {

    const core =

        removeCoreFixtures(

            await loadCoreData()

        );


    await writeCoreData(
        core
    );


    console.log(
        "Temporary OWL Media core fixtures were removed."
    );

}


// =================================
// GENERATED MEDIA CLEANUP
// =================================


async function cleanGeneratedMedia() {

    const [

        afterDarkIndex,
        afterDarkQueue,
        sundayIndex,
        sundayQueue

    ] = await Promise.all([

        readJson(

            "data/after-dark/archive-index.json",

            {
                version:
                    1,

                episodes:
                    []
            }

        ),

        readJson(

            "data/after-dark/generation-queue.json",

            {
                generatedAt:
                    "",

                pendingWeekCount:
                    0,

                pendingWeeks:
                    []
            }

        ),

        readJson(

            "data/sunday-disservice/archive-index.json",

            {
                version:
                    1,

                sermons:
                    []
            }

        ),

        readJson(

            "data/sunday-disservice/generation-queue.json",

            {
                generatedAt:
                    "",

                pendingWeekCount:
                    0,

                pendingWeeks:
                    []
            }

        )

    ]);


    afterDarkIndex.episodes =

        array(
            afterDarkIndex.episodes
        ).filter(

            episode =>
                episode.id !==
                AFTER_DARK_ID

        );


    afterDarkQueue.pendingWeeks =

        array(
            afterDarkQueue.pendingWeeks
        ).filter(

            week =>
                week.id !==
                AFTER_DARK_ID

        );


    afterDarkQueue.pendingWeekCount =

        afterDarkQueue.pendingWeeks.length;


    sundayIndex.sermons =

        array(
            sundayIndex.sermons
        ).filter(

            sermon =>
                sermon.id !==
                SUNDAY_DISSERVICE_ID

        );


    sundayQueue.pendingWeeks =

        array(
            sundayQueue.pendingWeeks
        ).filter(

            week =>
                week.id !==
                SUNDAY_DISSERVICE_ID

        );


    sundayQueue.pendingWeekCount =

        sundayQueue.pendingWeeks.length;


    await Promise.all([

        writeJson(

            "data/after-dark/archive-index.json",
            afterDarkIndex

        ),

        writeJson(

            "data/after-dark/generation-queue.json",
            afterDarkQueue

        ),

        writeJson(

            "data/sunday-disservice/archive-index.json",
            sundayIndex

        ),

        writeJson(

            "data/sunday-disservice/generation-queue.json",
            sundayQueue

        ),

        removeFile(
            `data/after-dark/${AFTER_DARK_ID}.json`
        ),

        removeFile(
            `data/sunday-disservice/${SUNDAY_DISSERVICE_ID}.json`
        ),

        removeFile(
            AUDIO_FILE
        )

    ]);


    console.log(
        "Disposable After Dark, Sunday Disservice, and audio outputs were removed."
    );

}


// =================================
// RUN
// =================================


if (
    ACTION === "seed"
) {

    await cleanGeneratedMedia();

    await seedCoreFixtures();

}


else if (
    ACTION === "cleanup"
) {

    await cleanCoreFixtures();

    await cleanGeneratedMedia();

}


else {

    throw new Error(

        "SMOKE_TEST_ACTION must be either seed or cleanup."

    );

}


console.log(
    `AFTER_DARK_TEST_ID=${AFTER_DARK_ID}`
);


console.log(
    `SUNDAY_DISSERVICE_TEST_ID=${SUNDAY_DISSERVICE_ID}`
);
