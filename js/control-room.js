const OWL_CONTROL_ROOM_FILES = [

    {
        key: "wrestlers",
        fileName: "wrestlers.json",
        label: "Wrestlers"
    },

    {
        key: "matches",
        fileName: "matches.json",
        label: "Completed Matches"
    },

    {
        key: "teams",
        fileName: "teams.json",
        label: "Teams"
    },

    {
        key: "factions",
        fileName: "factions.json",
        label: "Factions"
    },

    {
        key: "championships",
        fileName: "championships.json",
        label: "Championships"
    },

    {
        key: "titleReigns",
        fileName: "title-reigns.json",
        label: "Title Reigns"
    },

            {
        key: "events",
        fileName: "events.json",
        label: "Events"
    },

    {
        key: "segments",
        fileName: "segments.json",
        label: "Segments"
    },

        {
        key: "announcedMatches",
        fileName: "announced-matches.json",
        label: "Announced Matches"
    },

        {
        key: "tournaments",
        fileName: "tournaments.json",
        label: "Tournaments",
        collectionKey: "tournaments"
    },

    {
        key: "signatureMatches",
        fileName: "signature-matches.json",
        label: "Signature Matches",
        objectFile: true,
        countKey: "matches"
    },

    {
        key: "powerPlayers",
        fileName: "power-players.json",
        label: "Current Power Players",
        objectFile: true,
        countKeys: [
            "activeEntries",
            "completedEntries"
        ]
    },

        {
        key: "provingGround",
        fileName: "proving-ground.json",
        label: "Proving Ground",
        objectFile: true,
        countKeys: [
            "entries",
            "blockResults",
            "finals"
        ]
    },

    {
        key: "generatorHistory",
        fileName: "generator-history.json",
        label: "Generator History",
        objectFile: true,
        countKey: "results"
    },

        {
        key: "injuries",
        fileName: "injuries.json",
        label: "Injury Records",
        objectFile: true,
        countKey: "injuries"
    },

            {
        key: "enduranceProfiles",
        fileName: "endurance-profiles.json",
        label: "Endurance Profiles",
        objectFile: true,
        countKey: "profiles"
    },

    {
        key: "careerAchievements",
        fileName: "career-achievements.json",
        label: "Career Achievements",
        objectFile: true,
        countKey: "achievements"
    }
];



let owlRepositoryHandle =
    null;


let owlControlRoomData =
    {};



// =================================
// PAGE ELEMENTS
// =================================


const connectButton =
    document.getElementById(
        "cr-connect-folder"
    );


const reconnectButton =
    document.getElementById(
        "cr-reconnect-folder"
    );


const browserWarning =
    document.getElementById(
        "cr-browser-warning"
    );


const loadingSection =
    document.getElementById(
        "cr-loading"
    );


const dashboard =
    document.getElementById(
        "cr-dashboard"
    );


const statusBadge =
    document.getElementById(
        "cr-status-badge"
    );


const repoName =
    document.getElementById(
        "cr-repo-name"
    );


const fileSummary =
    document.getElementById(
        "cr-file-summary"
    );


const lastCheck =
    document.getElementById(
        "cr-last-check"
    );


const connectionMessage =
    document.getElementById(
        "cr-connection-message"
    );


const healthList =
    document.getElementById(
        "cr-health-list"
    );


const healthSummary =
    document.getElementById(
        "cr-health-summary"
    );



// =================================
// BROWSER SUPPORT
// =================================


function browserSupportsFileSystemAccess() {


    return (

        "showDirectoryPicker"
        in window

    );

}



function checkBrowserSupport() {


    const supported =
        browserSupportsFileSystemAccess();


    if (!supported) {


        browserWarning.hidden =
            false;


        connectButton.disabled =
            true;


        connectButton.textContent =
            "Chrome Required";


        setConnectionMessage(

            "The Control Room requires a supported desktop Chromium browser."

        );

    }


    return supported;

}



// =================================
// UI HELPERS
// =================================


function setLoading(
    isLoading
) {


    loadingSection.hidden =
        !isLoading;


    connectButton.disabled =
        isLoading;


    reconnectButton.disabled =
        isLoading;

}



function setConnectionStatus(
    status,
    label
) {


    statusBadge.className =
        `control-room-status ${status}`;


    statusBadge.textContent =
        label;

}



function setConnectionMessage(
    message
) {


    connectionMessage.textContent =
        message;

}



function formatCheckTime() {


    return new Date().toLocaleTimeString(
        "en-US",
        {
            hour:
                "numeric",

            minute:
                "2-digit"
        }
    );

}



function getDateValue(
    dateString
) {


    if (!dateString) {

        return 0;

    }


    return new Date(
        `${dateString}T00:00:00`
    ).getTime();

}



function formatDate(
    dateString
) {


    if (!dateString) {

        return "—";

    }


    return new Date(
        `${dateString}T00:00:00`
    ).toLocaleDateString(
        "en-US",
        {
            year:
                "numeric",

            month:
                "long",

            day:
                "numeric"
        }
    );

}



function normalize(
    value
) {


    return String(
        value || ""
    )
        .trim()
        .toLowerCase();

}



// =================================
// INDEXED DB
// REMEMBER REPOSITORY HANDLE
// =================================


function openControlRoomDatabase() {


    return new Promise(
        (
            resolve,
            reject
        ) => {


            const request =
                indexedDB.open(
                    "owl-control-room",
                    1
                );


            request.onupgradeneeded =
                () => {


                    const database =
                        request.result;


                    if (
                        !database.objectStoreNames.contains(
                            "handles"
                        )
                    ) {


                        database.createObjectStore(
                            "handles"
                        );

                    }

                };


            request.onsuccess =
                () => {


                    resolve(
                        request.result
                    );

                };


            request.onerror =
                () => {


                    reject(
                        request.error
                    );

                };

        }
    );

}



async function saveRepositoryHandle(
    handle
) {


    try {


        const database =
            await openControlRoomDatabase();


        await new Promise(
            (
                resolve,
                reject
            ) => {


                const transaction =
                    database.transaction(
                        "handles",
                        "readwrite"
                    );


                const store =
                    transaction.objectStore(
                        "handles"
                    );


                store.put(
                    handle,
                    "owl-repository"
                );


                transaction.oncomplete =
                    () => resolve();


                transaction.onerror =
                    () => reject(
                        transaction.error
                    );

            }
        );


        database.close();


    }


    catch (error) {


        console.warn(
            "Could not remember repository handle:",
            error
        );

    }

}



async function loadSavedRepositoryHandle() {


    try {


        const database =
            await openControlRoomDatabase();


        const handle =
            await new Promise(
                (
                    resolve,
                    reject
                ) => {


                    const transaction =
                        database.transaction(
                            "handles",
                            "readonly"
                        );


                    const store =
                        transaction.objectStore(
                            "handles"
                        );


                    const request =
                        store.get(
                            "owl-repository"
                        );


                    request.onsuccess =
                        () => resolve(
                            request.result || null
                        );


                    request.onerror =
                        () => reject(
                            request.error
                        );

                }
            );


        database.close();


        return handle;


    }


    catch (error) {


        console.warn(
            "Could not load saved repository handle:",
            error
        );


        return null;

    }

}



// =================================
// PERMISSION
// =================================


async function hasRepositoryPermission(
    handle
) {


    if (!handle) {

        return false;

    }


    const options = {

        mode:
            "readwrite"

    };


    if (
        await handle.queryPermission(
            options
        )

        === "granted"
    ) {

        return true;

    }


    if (
        await handle.requestPermission(
            options
        )

        === "granted"
    ) {

        return true;

    }


    return false;

}



// =================================
// READ JSON FILE
// =================================
function getObjectFileRecordCount(
    parsed,
    databaseFile
) {


    const countKeys =

        Array.isArray(
            databaseFile.countKeys
        )

            ? databaseFile.countKeys

            : databaseFile.countKey

                ? [
                    databaseFile.countKey
                ]

                : [];


    if (
        countKeys.length === 0
    ) {

        return Object.keys(
            parsed || {}
        ).length;

    }


    return countKeys.reduce(
        (
            total,
            key
        ) => {


            const value =
                parsed[
                    key
                ];


            return total +

                (
                    Array.isArray(
                        value
                    )

                        ? value.length

                        : 0
                );

        },
        0
    );

}



function getDefaultControlRoomData(
    databaseFile
) {


    if (
        databaseFile.collectionKey
    ) {


        return {

            [
                databaseFile.collectionKey
            ]:
                []

        };

    }


    if (
        databaseFile.objectFile
    ) {

        return {};

    }


    return [];

}

async function readJsonFile(
    dataDirectory,
    databaseFile
) {


    const fileHandle =
        await dataDirectory.getFileHandle(
            databaseFile.fileName
        );


    const file =
        await fileHandle.getFile();


    const text =
        await file.text();


    const parsed =
        JSON.parse(
            text
        );


    if (
        databaseFile.collectionKey
    ) {


        if (
            !parsed

            ||

            Array.isArray(
                parsed
            )

            ||

            typeof parsed !==
                "object"

            ||

            !Array.isArray(
                parsed[
                    databaseFile.collectionKey
                ]
            )
        ) {


            throw new Error(

                `${databaseFile.fileName} must contain a JSON object with a ${databaseFile.collectionKey} array.`

            );

        }


        return {

            data:
                parsed,

            count:
                parsed[
                    databaseFile.collectionKey
                ].length

        };

    }


        if (
        databaseFile.objectFile
    ) {


        if (
            !parsed

            ||

            Array.isArray(
                parsed
            )

            ||

            typeof parsed !==
                "object"
        ) {


            throw new Error(

                `${databaseFile.fileName} must contain a JSON object.`

            );

        }


        return {

            data:
                parsed,

            count:
                getObjectFileRecordCount(
                    parsed,
                    databaseFile
                )

        };

    }


    if (
        !Array.isArray(
            parsed
        )
    ) {


        throw new Error(
            `${databaseFile.fileName} must contain a JSON array.`
        );

    }


    return {

        data:
            parsed,

        count:
            parsed.length

    };

}



// =================================
// LOAD REPOSITORY DATA
// =================================


async function loadRepositoryData(
    repositoryHandle
) {


    const savedScrollPosition = {

        left:
            window.scrollX,

        top:
            window.scrollY

    };


    setLoading(
        true
    );


    dashboard.hidden =
        true;


    healthList.innerHTML =
        "";


    owlControlRoomData =
        {};


    const fileResults =
        [];


    try {


        const dataDirectory =
            await repositoryHandle.getDirectoryHandle(
                "data"
            );



        for (
            const databaseFile
            of OWL_CONTROL_ROOM_FILES
        ) {


            try {


                                const fileResult =
                    await readJsonFile(

                        dataDirectory,

                        databaseFile

                    );


                owlControlRoomData[
                    databaseFile.key
                ] =
                    fileResult.data;


                fileResults.push({

                    ...databaseFile,

                    success:
                        true,

                    count:
                        fileResult.count,

                    error:
                        ""

                });


            }


            catch (error) {


                                               owlControlRoomData[
                    databaseFile.key
                ] =
                    getDefaultControlRoomData(
                        databaseFile
                    );


                fileResults.push({

                    ...databaseFile,

                    success:
                        false,

                    count:
                        0,

                    error:
                        error.message

                });

            }

        }



        renderRepositoryStatus(
            repositoryHandle,
            fileResults
        );


        renderDashboard();


        renderHealthCheck(
            fileResults
        );


        dashboard.hidden =
    false;


window.dispatchEvent(

    new CustomEvent(
        "owl-control-room-data-loaded"
    )

);


    }


    catch (error) {


        console.error(
            "Could not open OWL repository:",
            error
        );


        setConnectionStatus(
            "status-warning",
            "INVALID FOLDER"
        );


        repoName.textContent =
            repositoryHandle.name ||
            "Selected Folder";


                fileSummary.textContent =

            `0 / ${OWL_CONTROL_ROOM_FILES.length} valid`;


        setConnectionMessage(

            "This folder does not appear to be the OWL repository root. Select the folder that contains the data, css, and js folders."

        );


        dashboard.hidden =
            true;

    }


        finally {


        setLoading(
            false
        );


        requestAnimationFrame(
            () => {


                requestAnimationFrame(
                    () => {


                        window.scrollTo({

                            left:
                                savedScrollPosition.left,

                            top:
                                savedScrollPosition.top,

                            behavior:
                                "auto"

                        });

                    }
                );

            }
        );

    }

}



// =================================
// REPOSITORY STATUS
// =================================


function renderRepositoryStatus(
    repositoryHandle,
    fileResults
) {


    const successfulFiles =
        fileResults.filter(
            result =>
                result.success
        ).length;


    repoName.textContent =
        repositoryHandle.name;


    fileSummary.textContent =

        `${successfulFiles} / ${OWL_CONTROL_ROOM_FILES.length} valid`;


    lastCheck.textContent =
        formatCheckTime();



    if (
        successfulFiles ===
        OWL_CONTROL_ROOM_FILES.length
    ) {


        setConnectionStatus(
            "status-connected",
            "CONNECTED"
        );


        setConnectionMessage(

            "OWL databases loaded successfully. The Control Room is connected to your local repository."

        );

    }


    else {


        setConnectionStatus(
            "status-warning",
            "CHECK FILES"
        );


        setConnectionMessage(

            "The repository was found, but one or more database files need attention."

        );

    }

}



// =================================
// DASHBOARD COUNTS
// =================================


function setCount(
    elementId,
    value
) {


    const element =
        document.getElementById(
            elementId
        );


    if (element) {


        element.textContent =
            Number(
                value || 0
            );

    }

}



function renderDashboard() {


    setCount(

        "cr-count-wrestlers",

        owlControlRoomData.wrestlers.length

    );


    setCount(

        "cr-count-teams",

        owlControlRoomData.teams.length

    );


    setCount(

        "cr-count-factions",

        owlControlRoomData.factions.length

    );


    setCount(

        "cr-count-championships",

        owlControlRoomData.championships.length

    );


    setCount(

        "cr-count-events",

        owlControlRoomData.events.length

    );


            setCount(
        "cr-count-matches",
        owlControlRoomData.matches.length
    );


    setCount(
        "cr-count-segments",
        owlControlRoomData.segments.length
    );


    setCount(
        "cr-count-announced",
        owlControlRoomData.announcedMatches.length
    );


    setCount(

        "cr-count-reigns",

        owlControlRoomData.titleReigns.length

    );


    renderEventSnapshot();

}



// =================================
// EVENT SNAPSHOT
// =================================


function renderEventSnapshot() {


    const events =

        [...owlControlRoomData.events];



    const upcomingEvents =

        events

            .filter(
                event =>

                    normalize(
                        event.status
                    ) === "upcoming"
            )

            .sort(
                (a, b) =>

                    getDateValue(
                        a.date
                    )

                    -

                    getDateValue(
                        b.date
                    )
            );



    const completedEvents =

        events

            .filter(
                event =>

                    normalize(
                        event.status
                    ) === "completed"
            )

            .sort(
                (a, b) =>

                    getDateValue(
                        b.date
                    )

                    -

                    getDateValue(
                        a.date
                    )
            );



    const nextEvent =
        upcomingEvents[0] ||
        null;


    const latestEvent =
        completedEvents[0] ||
        null;



    document.getElementById(
        "cr-next-event-name"
    ).textContent =

        nextEvent
            ? nextEvent.name
            : "No upcoming event";


    document.getElementById(
        "cr-next-event-date"
    ).textContent =

        nextEvent
            ? formatDate(
                nextEvent.date
            )
            : "—";



    document.getElementById(
        "cr-latest-event-name"
    ).textContent =

        latestEvent
            ? latestEvent.name
            : "No completed event";


    document.getElementById(
        "cr-latest-event-date"
    ).textContent =

        latestEvent
            ? formatDate(
                latestEvent.date
            )
            : "—";

}



// =================================
// DATA HEALTH
// =================================


function renderHealthCheck(
    fileResults
) {


    healthList.innerHTML =
        "";


    const successfulFiles =
        fileResults.filter(
            result =>
                result.success
        ).length;


    healthSummary.textContent =

        `${successfulFiles} of ${fileResults.length} files healthy`;



    fileResults.forEach(
        result => {


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "control-room-health-item";


            row.innerHTML = `

                <span class="control-room-health-file">

                    data/${result.fileName}

                </span>


                <span class="control-room-health-count">

                    ${
                        result.success

                            ? `${result.count} records`

                            : result.error
                    }

                </span>


                <span
                    class="control-room-health-status ${
                        result.success
                            ? "health-ok"
                            : "health-error"
                    }"
                >

                    ${
                        result.success
                            ? "HEALTHY"
                            : "ERROR"
                    }

                </span>

            `;


            healthList.appendChild(
                row
            );

        }
    );

}

// =================================
// SIGNATURE SERIES MANAGER
// =================================


const signatureSeriesStatus =

    document.getElementById(
        "cr-signature-series-status"
    );


const signaturePowerEntrySelect =

    document.getElementById(
        "cr-signature-power-entry-select"
    );


const signaturePowerActiveCount =

    document.getElementById(
        "cr-signature-power-active-count"
    );


const signaturePowerDeleteButton =

    document.getElementById(
        "cr-signature-power-delete-entry"
    );


const signaturePowerType =

    document.getElementById(
        "cr-signature-power-type"
    );


const signaturePowerName =

    document.getElementById(
        "cr-signature-power-name"
    );


const signaturePowerStatus =

    document.getElementById(
        "cr-signature-power-status"
    );


const signaturePowerSource =

    document.getElementById(
        "cr-signature-power-source"
    );


const signaturePowerBrand =

    document.getElementById(
        "cr-signature-power-brand"
    );


const signaturePowerDivision =

    document.getElementById(
        "cr-signature-power-division"
    );


const signaturePowerExpires =

    document.getElementById(
        "cr-signature-power-expires"
    );


const signaturePowerDescription =

    document.getElementById(
        "cr-signature-power-description"
    );


const signaturePowerNotes =

    document.getElementById(
        "cr-signature-power-notes"
    );


const signaturePowerPreview =

    document.getElementById(
        "cr-signature-power-preview"
    );


const signaturePowerChangeList =

    document.getElementById(
        "cr-signature-power-change-list"
    );


const signaturePowerError =

    document.getElementById(
        "cr-signature-power-error"
    );


const signaturePowerSaveButton =

    document.getElementById(
        "cr-signature-power-save"
    );


const signaturePowerMessage =

    document.getElementById(
        "cr-signature-power-message"
    );
const signaturePowerCompleteDate =

    document.getElementById(
        "cr-signature-power-complete-date"
    );


const signaturePowerCompleteResult =

    document.getElementById(
        "cr-signature-power-complete-result"
    );


const signaturePowerCompletePreview =

    document.getElementById(
        "cr-signature-power-complete-preview"
    );


const signaturePowerCompleteChangeList =

    document.getElementById(
        "cr-signature-power-complete-change-list"
    );


const signaturePowerCompleteError =

    document.getElementById(
        "cr-signature-power-complete-error"
    );


const signaturePowerCompleteButton =

    document.getElementById(
        "cr-signature-power-complete"
    );
// =================================
// SIGNATURE SERIES HELPERS
// =================================


function getPowerPlayersDatabase() {


    const database =
        owlControlRoomData.powerPlayers;


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

            activeEntries:
                [],

            completedEntries:
                []

        };

    }


    return {

        ...database,

        activeEntries:

            Array.isArray(
                database.activeEntries
            )

                ? database.activeEntries

                : [],

        completedEntries:

            Array.isArray(
                database.completedEntries
            )

                ? database.completedEntries

                : []

    };

}



function getSignaturePowerTypeMeta(
    type
) {


    const typeMap = {

        "devils-contract": {

            label:
                "Devil’s Contract Holder",

            accentClass:
                "power-player-contract"

        },

        "overthrow-winner": {

            label:
                "Overthrow Winner",

            accentClass:
                "power-player-overthrow"

        },

        "hex-cell-winner": {

            label:
                "Hex-Cell Winner",

            accentClass:
                "power-player-hex"

        },

        "fates-wheel-case": {

            label:
                "Fate’s Wheel Case Holder",

            accentClass:
                "power-player-fate"

        },

        "proving-ground-winner": {

            label:
                "Proving Ground Winner",

            accentClass:
                "power-player-proving"

        },

        "active-penalty": {

            label:
                "Active Penalty / Lockout",

            accentClass:
                "power-player-penalty"

        }

    };


    return typeMap[
        type
    ]

    ||

    typeMap[
        "devils-contract"
    ];

}



function createSignatureEntrySlug(
    name,
    type
) {


    const baseSlug =

        String(
            `${type || "power"}-${name || "entry"}`
        )
            .trim()
            .toLowerCase()
            .replace(
                /['’]/g,
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

        "power-entry";


    const database =
        getPowerPlayersDatabase();


    const allEntries = [

        ...database.activeEntries,

        ...database.completedEntries

    ];


    let candidate =
        baseSlug;


    let counter =
        2;


    while (

        allEntries.some(
            entry =>
                entry.id ===
                candidate
        )

    ) {


        candidate =
            `${baseSlug}-${counter}`;


        counter +=
            1;

    }


    return candidate;

}



function setSignaturePowerMessage(
    message,
    type = "success"
) {


    if (!signaturePowerMessage) {

        return;

    }


    signaturePowerMessage.textContent =
        message;


    signaturePowerMessage.className =

        `cr-save-message ${
            type === "error"

                ? "save-error"

                : "save-success"
        }`;


    signaturePowerMessage.hidden =
        false;

}



function appendSignaturePowerReviewRow(
    label,
    value
) {


    if (!signaturePowerChangeList) {

        return;

    }


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "cr-editor-change-row";


    row.innerHTML = `

        <strong>
            ${label}
        </strong>

        <span>
            ${value || "—"}
        </span>

    `;


    signaturePowerChangeList.appendChild(
        row
    );

}



function getSignaturePowerDraft() {


    const selectedType =

        signaturePowerType

            ? signaturePowerType.value

            : "devils-contract";


    const typeMeta =
        getSignaturePowerTypeMeta(
            selectedType
        );


    const name =

        signaturePowerName

            ? signaturePowerName.value.trim()

            : "";


    const notes =

        signaturePowerNotes

            ? signaturePowerNotes.value
                .split(
                    "\n"
                )
                .map(
                    note =>
                        note.trim()
                )
                .filter(Boolean)

            : [];


    return {

        id:
            createSignatureEntrySlug(
                name,
                selectedType
            ),

        type:
            typeMeta.label,

        name,

        description:

            signaturePowerDescription

                ? signaturePowerDescription.value.trim()

                : "",

        status:

            signaturePowerStatus

                ? signaturePowerStatus.value.trim()

                : "",

        source:

            signaturePowerSource

                ? signaturePowerSource.value.trim()

                : "",

        brand:

            signaturePowerBrand

                ? signaturePowerBrand.value

                : "",

        division:

            signaturePowerDivision

                ? signaturePowerDivision.value

                : "",

        expires:

            signaturePowerExpires

                ? signaturePowerExpires.value.trim()

                : "",

        accentClass:
            typeMeta.accentClass,

        notes

    };

}



function validateSignaturePowerDraft(
    draft
) {


    if (!draft.name) {

        return "Name / holder is required.";

    }


    if (!draft.description) {

        return "Description is required.";

    }


    return "";

}



function renderSignaturePowerPreview() {


    if (
        !signaturePowerPreview ||
        !signaturePowerChangeList ||
        !signaturePowerSaveButton
    ) {

        return;

    }


    signaturePowerChangeList.innerHTML =
        "";


    if (signaturePowerError) {

        signaturePowerError.hidden =
            true;


        signaturePowerError.textContent =
            "";

    }


    const draft =
        getSignaturePowerDraft();


    const validationError =
        validateSignaturePowerDraft(
            draft
        );


    appendSignaturePowerReviewRow(
        "DATABASE ID",
        draft.id
    );


    appendSignaturePowerReviewRow(
        "TYPE",
        draft.type
    );


    appendSignaturePowerReviewRow(
        "NAME",
        draft.name
    );


    appendSignaturePowerReviewRow(
        "STATUS",
        draft.status
    );


    appendSignaturePowerReviewRow(
        "SOURCE",
        draft.source
    );


    appendSignaturePowerReviewRow(
        "BRAND",
        draft.brand
    );


    appendSignaturePowerReviewRow(
        "DIVISION",
        draft.division
    );


    appendSignaturePowerReviewRow(
        "EXPIRES",
        draft.expires
    );


    appendSignaturePowerReviewRow(
        "NOTES",
        draft.notes.length

            ? `${draft.notes.length} note(s)`

            : "—"
    );


    signaturePowerPreview.hidden =
        false;


    if (validationError) {


        if (signaturePowerError) {

            signaturePowerError.textContent =
                validationError;


            signaturePowerError.hidden =
                false;

        }


        signaturePowerSaveButton.disabled =
            true;


        return;

    }


    signaturePowerSaveButton.disabled =
        false;

}



function resetSignaturePowerForm() {


    if (signaturePowerType) {

        signaturePowerType.value =
            "devils-contract";

    }


    [
        signaturePowerName,
        signaturePowerStatus,
        signaturePowerSource,
        signaturePowerExpires,
        signaturePowerDescription,
        signaturePowerNotes
    ].forEach(
        field => {


            if (field) {

                field.value =
                    "";

            }

        }
    );


    if (signaturePowerBrand) {

        signaturePowerBrand.value =
            "";

    }


    if (signaturePowerDivision) {

        signaturePowerDivision.value =
            "";

    }


    if (signaturePowerPreview) {

        signaturePowerPreview.hidden =
            true;

    }


    if (signaturePowerSaveButton) {

        signaturePowerSaveButton.disabled =
            true;

    }

}



function renderSignaturePowerEntrySelect() {


    if (
        !signaturePowerEntrySelect ||
        !signaturePowerActiveCount ||
        !signaturePowerDeleteButton
    ) {

        return;

    }


    const database =
        getPowerPlayersDatabase();


    signaturePowerEntrySelect.innerHTML =
        "";


    const placeholder =
        document.createElement(
            "option"
        );


    placeholder.value =
        "";


    placeholder.textContent =

        database.activeEntries.length

            ? "Select Active Entry"

            : "No Active Entries";


    signaturePowerEntrySelect.appendChild(
        placeholder
    );


    database.activeEntries.forEach(
        entry => {


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                entry.id;


            option.textContent =
                `${entry.type || "Power"} — ${entry.name || "Unnamed"}`;


            signaturePowerEntrySelect.appendChild(
                option
            );

        }
    );


    signaturePowerEntrySelect.disabled =
        database.activeEntries.length === 0;


    signaturePowerActiveCount.textContent =
        String(
            database.activeEntries.length
        );


        signaturePowerDeleteButton.disabled =
        true;


    resetSignaturePowerCompletionForm();

}



function updateSignaturePowerDeleteButton() {


    if (
        !signaturePowerDeleteButton ||
        !signaturePowerEntrySelect
    ) {

        return;

    }


    signaturePowerDeleteButton.disabled =
        !signaturePowerEntrySelect.value;

}



function getSelectedSignaturePowerEntry() {


    const database =
        getPowerPlayersDatabase();


    if (
        !signaturePowerEntrySelect ||
        !signaturePowerEntrySelect.value
    ) {

        return null;

    }


    return database.activeEntries.find(
        entry =>
            entry.id ===
            signaturePowerEntrySelect.value
    ) || null;

}



function appendSignaturePowerCompleteReviewRow(
    label,
    value
) {


    if (!signaturePowerCompleteChangeList) {

        return;

    }


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "cr-editor-change-row";


    row.innerHTML = `

        <strong>
            ${label}
        </strong>

        <span>
            ${value || "—"}
        </span>

    `;


    signaturePowerCompleteChangeList.appendChild(
        row
    );

}



function getSignaturePowerCompletionDraft() {


    const selectedEntry =
        getSelectedSignaturePowerEntry();


    const today =
        new Date()
            .toISOString()
            .slice(
                0,
                10
            );


    return {

        selectedEntry,

        completedAt:

            signaturePowerCompleteDate

                ? signaturePowerCompleteDate.value || today

                : today,

        result:

            signaturePowerCompleteResult

                ? signaturePowerCompleteResult.value.trim()

                : ""

    };

}



function validateSignaturePowerCompletionDraft(
    draft
) {


    if (!draft.selectedEntry) {

        return "Select an active entry first.";

    }


    if (!draft.result) {

        return "Result / resolution is required.";

    }


    return "";

}



function renderSignaturePowerCompletePreview() {


    if (
        !signaturePowerCompletePreview ||
        !signaturePowerCompleteChangeList ||
        !signaturePowerCompleteButton
    ) {

        return;

    }


    signaturePowerCompleteChangeList.innerHTML =
        "";


    if (signaturePowerCompleteError) {

        signaturePowerCompleteError.hidden =
            true;


        signaturePowerCompleteError.textContent =
            "";

    }


    const draft =
        getSignaturePowerCompletionDraft();


    const validationError =
        validateSignaturePowerCompletionDraft(
            draft
        );


    appendSignaturePowerCompleteReviewRow(
        "ENTRY",
        draft.selectedEntry

            ? `${draft.selectedEntry.type || "Power"} — ${draft.selectedEntry.name || "Unnamed"}`

            : "—"
    );


    appendSignaturePowerCompleteReviewRow(
        "COMPLETED DATE",
        draft.completedAt
    );


    appendSignaturePowerCompleteReviewRow(
        "RESULT",
        draft.result
    );


    signaturePowerCompletePreview.hidden =
        false;


    if (validationError) {


        if (signaturePowerCompleteError) {

            signaturePowerCompleteError.textContent =
                validationError;


            signaturePowerCompleteError.hidden =
                false;

        }


        signaturePowerCompleteButton.disabled =
            true;


        return;

    }


    signaturePowerCompleteButton.disabled =
        false;

}



function resetSignaturePowerCompletionForm() {


    if (signaturePowerCompleteDate) {

        signaturePowerCompleteDate.value =
            "";

    }


    if (signaturePowerCompleteResult) {

        signaturePowerCompleteResult.value =
            "";

    }


    if (signaturePowerCompletePreview) {

        signaturePowerCompletePreview.hidden =
            true;

    }


    if (signaturePowerCompleteButton) {

        signaturePowerCompleteButton.disabled =
            true;

    }


    if (signaturePowerCompleteError) {

        signaturePowerCompleteError.hidden =
            true;


        signaturePowerCompleteError.textContent =
            "";

    }

}



async function completeSelectedSignaturePowerEntry() {


    try {


        const draft =
            getSignaturePowerCompletionDraft();


        const validationError =
            validateSignaturePowerCompletionDraft(
                draft
            );


        if (validationError) {

            setSignaturePowerMessage(
                validationError,
                "error"
            );


            return;

        }


        const selectedEntry =
            draft.selectedEntry;


        const confirmation =
            window.prompt(
                `Type COMPLETE POWER to move "${selectedEntry.name}" to completed history.`
            );


        if (
            confirmation !==
            "COMPLETE POWER"
        ) {

            setSignaturePowerMessage(
                "Completed-history move cancelled.",
                "error"
            );


            return;

        }


        const database =
            getPowerPlayersDatabase();


        const completedEntry = {

            ...selectedEntry,

            previousStatus:
                selectedEntry.status || "",

            status:
                "Completed",

            result:
                draft.result,

            resolution:
                draft.result,

            completedAt:
                draft.completedAt,

            archivedAt:
                new Date().toISOString()

        };


        const updatedDatabase = {

            ...database,

            activeEntries:

                database.activeEntries.filter(
                    entry =>
                        entry.id !==
                        selectedEntry.id
                ),

            completedEntries: [

                ...database.completedEntries,

                completedEntry

            ]

        };


        if (signaturePowerCompleteButton) {

            signaturePowerCompleteButton.disabled =
                true;

        }


        await writeControlRoomJsonFile(
            "power-players.json",
            updatedDatabase
        );


        await loadRepositoryData(
            owlRepositoryHandle
        );


        resetSignaturePowerCompletionForm();


        setSignaturePowerMessage(

            `${selectedEntry.name} was moved to completed history.`

        );

    }


    catch (error) {


        console.error(
            "Could not complete Signature Series power entry:",
            error
        );


        setSignaturePowerMessage(
            error.message,
            "error"
        );

    }

}



async function saveSignaturePowerEntry() {


    try {


        const draft =
            getSignaturePowerDraft();


        const validationError =
            validateSignaturePowerDraft(
                draft
            );


        if (validationError) {

            setSignaturePowerMessage(
                validationError,
                "error"
            );


            return;

        }


        const database =
            getPowerPlayersDatabase();


        const updatedDatabase = {

            ...database,

            activeEntries: [

                ...database.activeEntries,

                draft

            ]

        };


        signaturePowerSaveButton.disabled =
            true;


        await writeControlRoomJsonFile(
            "power-players.json",
            updatedDatabase
        );


        await loadRepositoryData(
            owlRepositoryHandle
        );


        resetSignaturePowerForm();


        setSignaturePowerMessage(

            `${draft.name} was added to Current Power Players.`

        );


    }


    catch (error) {


        console.error(
            "Could not save Signature Series power entry:",
            error
        );


        setSignaturePowerMessage(
            error.message,
            "error"
        );

    }

}



async function deleteSelectedSignaturePowerEntry() {


    try {


        if (
            !signaturePowerEntrySelect ||
            !signaturePowerEntrySelect.value
        ) {

            setSignaturePowerMessage(
                "Select an active entry first.",
                "error"
            );


            return;

        }


        const database =
            getPowerPlayersDatabase();


        const selectedEntry =
            database.activeEntries.find(
                entry =>
                    entry.id ===
                    signaturePowerEntrySelect.value
            );


                if (!selectedEntry) {

            setSignaturePowerMessage(
                "Selected active entry was not found.",
                "error"
            );


            return;

        }


        if (
            selectedEntry.linkedProvingGroundFinalId
        ) {

            setSignaturePowerMessage(
                "This entry was generated by a Proving Ground final. Delete the linked final instead, or move the opportunity into completed history once it has been resolved.",
                "error"
            );


            return;

        }


        const confirmation =
            window.prompt(
                `Type DELETE POWER to remove "${selectedEntry.name}".`
            );


        if (
            confirmation !==
            "DELETE POWER"
        ) {

            setSignaturePowerMessage(
                "Active entry deletion cancelled.",
                "error"
            );


            return;

        }


        const updatedDatabase = {

            ...database,

            activeEntries:

                database.activeEntries.filter(
                    entry =>
                        entry.id !==
                        selectedEntry.id
                )

        };


        await writeControlRoomJsonFile(
            "power-players.json",
            updatedDatabase
        );


        await loadRepositoryData(
            owlRepositoryHandle
        );


        setSignaturePowerMessage(

            `${selectedEntry.name} was removed from Current Power Players.`

        );


    }


    catch (error) {


        console.error(
            "Could not delete Signature Series power entry:",
            error
        );


        setSignaturePowerMessage(
            error.message,
            "error"
        );

    }

}



function initializeSignatureSeriesManager() {


    if (signatureSeriesStatus) {

        signatureSeriesStatus.textContent =
            "READY";

    }


    renderSignaturePowerEntrySelect();

    
    resetSignaturePowerForm();
    
    resetSignaturePowerCompletionForm();
}
// =================================
// TOURNAMENT FIELD MANAGER
// =================================

const tournamentManagerMode =

    document.getElementById(
        "cr-tournament-manager-mode"
    );


const tournamentCreateStatus =

    document.getElementById(
        "cr-tournament-create-status"
    );


const tournamentCreateForm =

    document.getElementById(
        "cr-tournament-create-form"
    );


const tournamentCreateName =

    document.getElementById(
        "cr-tournament-create-name"
    );


const tournamentCreateYear =

    document.getElementById(
        "cr-tournament-create-year"
    );


const tournamentCreateStatusSelect =

    document.getElementById(
        "cr-tournament-create-status-select"
    );


const tournamentCreateBadge =

    document.getElementById(
        "cr-tournament-create-badge"
    );


const tournamentCreatePurpose =

    document.getElementById(
        "cr-tournament-create-purpose"
    );


const tournamentCreatePreview =

    document.getElementById(
        "cr-tournament-create-preview"
    );


const tournamentCreateChangeList =

    document.getElementById(
        "cr-tournament-create-change-list"
    );


const tournamentCreateError =

    document.getElementById(
        "cr-tournament-create-error"
    );


const tournamentCreateSaveButton =

    document.getElementById(
        "cr-tournament-create-save"
    );


const tournamentCreateMessage =

    document.getElementById(
        "cr-tournament-create-message"
    );
const tournamentBracketCreateName =

    document.getElementById(
        "cr-tournament-bracket-create-name"
    );


const tournamentBracketCreateBrand =

    document.getElementById(
        "cr-tournament-bracket-create-brand"
    );


const tournamentBracketCreateDivision =

    document.getElementById(
        "cr-tournament-bracket-create-division"
    );


const tournamentBracketCreateFieldSize =

    document.getElementById(
        "cr-tournament-bracket-create-field-size"
    );


const tournamentBracketCreateParticipantType =

    document.getElementById(
        "cr-tournament-bracket-create-participant-type"
    );


const tournamentBracketCreateStatus =

    document.getElementById(
        "cr-tournament-bracket-create-status"
    );


const tournamentBracketCreatePreview =

    document.getElementById(
        "cr-tournament-bracket-create-preview"
    );


const tournamentBracketCreateChangeList =

    document.getElementById(
        "cr-tournament-bracket-create-change-list"
    );


const tournamentBracketCreateError =

    document.getElementById(
        "cr-tournament-bracket-create-error"
    );


const tournamentBracketCreateSaveButton =

    document.getElementById(
        "cr-tournament-bracket-create-save"
    );


const tournamentBracketCreateMessage =

    document.getElementById(
        "cr-tournament-bracket-create-message"
    );

const tournamentFieldStatus =

    document.getElementById(
        "cr-tournament-field-status"
    );
const tournamentDeleteEmptyBracketButton =

    document.getElementById(
        "cr-tournament-delete-empty-bracket"
    );


const tournamentDeleteEmptyTournamentButton =

    document.getElementById(
        "cr-tournament-delete-empty-tournament"
    );


const tournamentCleanupMessage =

    document.getElementById(
        "cr-tournament-cleanup-message"
    );

const tournamentSelect =

    document.getElementById(
        "cr-tournament-select"
    );


const tournamentBracketSelect =

    document.getElementById(
        "cr-tournament-bracket-select"
    );


const tournamentCurrentStatus =

    document.getElementById(
        "cr-tournament-current-status"
    );


const tournamentFieldSize =

    document.getElementById(
        "cr-tournament-field-size"
    );


const tournamentSelectedCount =

    document.getElementById(
        "cr-tournament-selected-count"
    );


const tournamentRemainingCount =

    document.getElementById(
        "cr-tournament-remaining-count"
    );


const tournamentLockState =

    document.getElementById(
        "cr-tournament-lock-state"
    );


const tournamentParticipantSearch =

    document.getElementById(
        "cr-tournament-participant-search"
    );


const tournamentEligibleList =

    document.getElementById(
        "cr-tournament-eligible-list"
    );


const tournamentSelectedList =

    document.getElementById(
        "cr-tournament-selected-list"
    );


const tournamentFieldReview =

    document.getElementById(
        "cr-tournament-field-review"
    );


const tournamentFieldChangeList =

    document.getElementById(
        "cr-tournament-field-change-list"
    );


const tournamentFieldError =

    document.getElementById(
        "cr-tournament-field-error"
    );


const tournamentFieldMessage =

    document.getElementById(
        "cr-tournament-field-message"
    );


const tournamentFieldSaveButton =

    document.getElementById(
        "cr-tournament-field-save"
    );


const tournamentFieldLockButton =

    document.getElementById(
        "cr-tournament-field-lock"
    );


const tournamentBracketSetupStatus =

    document.getElementById(
        "cr-tournament-bracket-setup-status"
    );


const tournamentBracketRoundCount =

    document.getElementById(
        "cr-tournament-bracket-round-count"
    );


const tournamentBracketOpeningMatchCount =

    document.getElementById(
        "cr-tournament-bracket-opening-match-count"
    );


const tournamentBracketByeCount =

    document.getElementById(
        "cr-tournament-bracket-bye-count"
    );


const tournamentBracketSetupPreview =

    document.getElementById(
        "cr-tournament-bracket-setup-preview"
    );


const tournamentBracketPreviewButton =

    document.getElementById(
        "cr-tournament-bracket-preview"
    );


const tournamentBracketSaveButton =

    document.getElementById(
        "cr-tournament-bracket-save"
    );


const tournamentBracketSetupMessage =

    document.getElementById(
        "cr-tournament-bracket-setup-message"
    );


const tournamentMatchSelect =

    document.getElementById(
        "cr-tournament-match-select"
    );


const tournamentMatchEvent =

    document.getElementById(
        "cr-tournament-match-event"
    );


const tournamentMatchOrder =

    document.getElementById(
        "cr-tournament-match-order"
    );


const tournamentMatchLinkStatus =

    document.getElementById(
        "cr-tournament-match-link-status"
    );


const tournamentMatchBookingPreview =

    document.getElementById(
        "cr-tournament-match-booking-preview"
    );


const tournamentMatchBookingDetails =

    document.getElementById(
        "cr-tournament-match-booking-details"
    );


const tournamentMatchBookingError =

    document.getElementById(
        "cr-tournament-match-booking-error"
    );


const tournamentLoadMatchBookerButton =

    document.getElementById(
        "cr-tournament-load-match-booker"
    );


const tournamentMatchBookingMessage =

    document.getElementById(
        "cr-tournament-match-booking-message"
    );


let tournamentFieldDraftParticipants =
    [];


let tournamentBracketSetupDraft =
    null;


function getControlRoomTournaments() {


    const database =
        owlControlRoomData.tournaments;


    if (
        !database

        ||

        Array.isArray(
            database
        )

        ||

        typeof database !==
            "object"

        ||

        !Array.isArray(
            database.tournaments
        )
    ) {

        return [];

    }


    return database.tournaments;

}



function getSelectedControlRoomTournament() {


    const tournaments =
        getControlRoomTournaments();


    return tournaments.find(

        tournament =>

            tournament.id ===
            tournamentSelect.value

    ) || null;

}



function getSelectedControlRoomBracket() {


    const tournament =
        getSelectedControlRoomTournament();


    if (
        !tournament

        ||

        !Array.isArray(
            tournament.brackets
        )
    ) {

        return null;

    }


    return tournament.brackets.find(

        bracket =>

            bracket.id ===
            tournamentBracketSelect.value

    ) || null;

}



function setTournamentManagerEmptyMessage(
    element,
    message
) {


    element.innerHTML =
        "";


    const emptyMessage =
        document.createElement(
            "p"
        );


    emptyMessage.className =
        "cr-landscape-entry-empty";


    emptyMessage.textContent =
        message;


    element.appendChild(
        emptyMessage
    );

}


function getTournamentBracketSetup(
    bracket
) {


    const bracketSetup =
        bracket?.bracketSetup;


    if (
        !bracketSetup

        ||

        Array.isArray(
            bracketSetup
        )

        ||

        typeof bracketSetup !==
            "object"
    ) {

        return {

            generated:
                false,

            generatedAt:
                "",

            rounds:
                [],

            winnerId:
                ""

        };

    }


    return bracketSetup;

}



function getTournamentBracketStructure(
    fieldSize
) {


    const numericFieldSize =

        Number(
            fieldSize || 0
        );


    if (
        !Number.isInteger(
            numericFieldSize
        )

        ||

        numericFieldSize <
            2
    ) {

        return {

            bracketSize:
                0,

            totalRounds:
                0,

            openingMatchCount:
                0,

            byeCount:
                0

        };

    }


    const bracketSize =

        2 ** Math.ceil(

            Math.log2(
                numericFieldSize
            )

        );


    const byeCount =

        bracketSize -
        numericFieldSize;


    const openingMatchCount =

        (
            numericFieldSize -
            byeCount
        )

        /

        2;


    const totalRounds =

        Math.log2(
            bracketSize
        );


    return {

        bracketSize,

        totalRounds,

        openingMatchCount,

        byeCount

    };

}


function shuffleTournamentBracketParticipants(
    participantIds
) {


    const shuffledParticipants = [
        ...participantIds
    ];


    for (
        let index =
            shuffledParticipants.length - 1;

        index >
            0;

        index -=
            1
    ) {


        const randomIndex =

            Math.floor(

                Math.random() *
                (
                    index +
                    1
                )

            );


        [

            shuffledParticipants[
                index
            ],

            shuffledParticipants[
                randomIndex
            ]

        ] = [

            shuffledParticipants[
                randomIndex
            ],

            shuffledParticipants[
                index
            ]

        ];

    }


    return shuffledParticipants;

}



function getTournamentBracketRoundNames(
    fieldSize
) {


    const numericFieldSize =

        Number(
            fieldSize || 0
        );


    if (
        numericFieldSize ===
        16
    ) {

        return [

            "Round of 16",

            "Quarterfinals",

            "Semifinals",

            "Final"

        ];

    }


    if (
        numericFieldSize ===
        28
    ) {

        return [

            "Opening Round",

            "Round of 16",

            "Quarterfinals",

            "Semifinals",

            "Final"

        ];

    }


    return [

        "Opening Round",

        "Quarterfinals",

        "Semifinals",

        "Final"

    ];

}



function createTournamentBracketMatch(
    roundNumber,
    matchNumber,
    values = {}
) {


    const participantOneId =
        values.participantOneId || "";


    const participantTwoId =
        values.participantTwoId || "";


    const isBye =
        Boolean(
            values.isBye
        );


        return {

        id:
            `round-${roundNumber}-match-${matchNumber}`,

        order:
            matchNumber,

        participantOneId,

        participantTwoId,

        sourceOneMatchId:
            values.sourceOneMatchId || "",

        sourceTwoMatchId:
            values.sourceTwoMatchId || "",

        eventId:
            values.eventId || "",

        matchRecordId:
            values.matchRecordId || "",

        winnerId:

            isBye

                ? participantOneId

                : "",

        status:

            isBye

                ? "bye"

                : "pending",

        isBye

    };

}



function generateTournamentBracketPreviewData(
    bracket
) {


    const structure =
        getTournamentBracketStructure(
            bracket.fieldSize
        );


    const participants =

        Array.isArray(
            bracket.participants
        )

            ? bracket.participants

            : [];


    const shuffledParticipants =

        shuffleTournamentBracketParticipants(
            participants
        );


    const roundNames =

        getTournamentBracketRoundNames(
            bracket.fieldSize
        );


    const rounds =
        [];


    const openingRoundSlotCount =

        structure.bracketSize /
        2;


    const openingRoundMatches =
        [];


    if (
        structure.byeCount >
        0
    ) {


        const byeRecipients =

            shuffledParticipants.slice(
                0,
                structure.byeCount
            );


        const openingRoundCompetitors =

            shuffledParticipants.slice(
                structure.byeCount
            );


        const byePositions =

            new Set(

                Array.from(

                    {
                        length:
                            structure.byeCount
                    },

                    (
                        unusedValue,
                        index
                    ) =>

                        index *

                        (
                            openingRoundSlotCount /
                            structure.byeCount
                        )

                )

            );


        let byeRecipientIndex =
            0;


        let competitorIndex =
            0;


        for (
            let matchIndex =
                0;

            matchIndex <
                openingRoundSlotCount;

            matchIndex +=
                1
        ) {


            if (
                byePositions.has(
                    matchIndex
                )
            ) {


                const byeRecipientId =

                    byeRecipients[
                        byeRecipientIndex
                    ];


                openingRoundMatches.push(

                    createTournamentBracketMatch(

                        1,

                        matchIndex +
                            1,

                        {

                            participantOneId:
                                byeRecipientId,

                            participantTwoId:
                                "",

                            isBye:
                                true

                        }

                    )

                );


                byeRecipientIndex +=
                    1;


                continue;

            }


            openingRoundMatches.push(

                createTournamentBracketMatch(

                    1,

                    matchIndex +
                        1,

                    {

                        participantOneId:

                            openingRoundCompetitors[
                                competitorIndex
                            ],

                        participantTwoId:

                            openingRoundCompetitors[
                                competitorIndex +
                                    1
                            ],

                        isBye:
                            false

                    }

                )

            );


            competitorIndex +=
                2;

        }

    }


    else {


        for (
            let matchIndex =
                0;

            matchIndex <
                openingRoundSlotCount;

            matchIndex +=
                1
        ) {


            openingRoundMatches.push(

                createTournamentBracketMatch(

                    1,

                    matchIndex +
                        1,

                    {

                        participantOneId:

                            shuffledParticipants[
                                matchIndex *
                                2
                            ],

                        participantTwoId:

                            shuffledParticipants[

                                (
                                    matchIndex *
                                    2
                                )

                                +

                                1

                            ],

                        isBye:
                            false

                    }

                )

            );

        }

    }


    rounds.push({

        id:
            "round-1",

        order:
            1,

        name:
            roundNames[0] ||
            "Opening Round",

        matches:
            openingRoundMatches

    });


    for (
        let roundNumber =
            2;

        roundNumber <=
            structure.totalRounds;

        roundNumber +=
            1
    ) {


        const previousRound =

            rounds[
                roundNumber -
                2
            ];


        const matchCount =

            previousRound.matches.length /
            2;


        const matches =
            [];


        for (
            let matchIndex =
                0;

            matchIndex <
                matchCount;

            matchIndex +=
                1
        ) {


            matches.push(

                createTournamentBracketMatch(

                    roundNumber,

                    matchIndex +
                        1,

                    {

                        sourceOneMatchId:

                            previousRound.matches[

                                matchIndex *
                                2

                            ].id,

                        sourceTwoMatchId:

                            previousRound.matches[

                                (
                                    matchIndex *
                                    2
                                )

                                +

                                1

                            ].id

                    }

                )

            );

        }


        rounds.push({

            id:
                `round-${roundNumber}`,

            order:
                roundNumber,

            name:

                roundNames[
                    roundNumber -
                    1
                ]

                ||

                `Round ${roundNumber}`,

            matches

        });

    }


    return {

        rounds,

        winnerId:
            ""

    };

}



function getTournamentBracketPreviewSideLabel(
    bracket,
    match,
    participantProperty,
    sourceProperty
) {


    const participantId =
        match[
            participantProperty
        ];


    if (
        participantId
    ) {

        return getTournamentEntrantDisplayName(

            bracket,

            participantId

        );

    }


    const sourceMatchId =
        match[
            sourceProperty
        ];


    if (
        sourceMatchId
    ) {


        const sourceMatchNumber =

            sourceMatchId.split(
                "-"
            ).at(
                -1
            );


        return `Winner of Match ${sourceMatchNumber}`;

    }


    return "TBD";

}



function renderTournamentBracketSetupDraft(
    bracket
) {


    if (
        !tournamentBracketSetupDraft

        ||

        !Array.isArray(
            tournamentBracketSetupDraft.rounds
        )
    ) {

        return;

    }


    tournamentBracketSetupPreview.innerHTML =
        "";


    tournamentBracketSetupDraft.rounds.forEach(

        round => {


            const roundHeading =
                document.createElement(
                    "div"
                );


            roundHeading.className =
                "cr-editor-section-heading";


            const roundLabel =
                document.createElement(
                    "span"
                );


            roundLabel.textContent =

                `ROUND ${round.order}`;


            const roundName =
                document.createElement(
                    "h3"
                );


            roundName.textContent =
                round.name;


            roundHeading.append(

                roundLabel,

                roundName

            );


            tournamentBracketSetupPreview.appendChild(
                roundHeading
            );


            round.matches.forEach(

                match => {


                    const matchRow =
                        document.createElement(
                            "div"
                        );


                    matchRow.className =
                        "control-room-health-item";


                    const matchLabel =
                        document.createElement(
                            "span"
                        );


                    matchLabel.textContent =

                        `MATCH ${match.order}`;


                    const participantOneLabel =

                        getTournamentBracketPreviewSideLabel(

                            bracket,

                            match,

                            "participantOneId",

                            "sourceOneMatchId"

                        );


                    const participantTwoLabel =

                        getTournamentBracketPreviewSideLabel(

                            bracket,

                            match,

                            "participantTwoId",

                            "sourceTwoMatchId"

                        );


                    const matchup =
                        document.createElement(
                            "strong"
                        );


                    matchup.textContent =

                        match.isBye

                            ? `${participantOneLabel} — BYE`

                            : `${participantOneLabel} vs ${participantTwoLabel}`;


                    matchRow.append(

                        matchLabel,

                        matchup

                    );


                    tournamentBracketSetupPreview.appendChild(
                        matchRow
                    );

                }

            );

        }

    );

}



function generateTournamentBracketPreview() {
    
function validateTournamentBracketSetupDraft(
    bracket
) {


    if (
        !bracket
    ) {

        return "Select a championship bracket.";

    }


    const savedBracketSetup =
        getTournamentBracketSetup(
            bracket
        );


    if (
        savedBracketSetup.generated
    ) {

        return "A saved bracket setup already exists.";

    }


    if (
        !bracket.fieldLocked
    ) {

        return "Lock the completed participant field before saving the bracket setup.";

    }


    const fieldSize =

        Number(
            bracket.fieldSize || 0
        );


    const storedParticipants =
        getStoredTournamentParticipants(
            bracket
        );


    if (
        storedParticipants.length !==
        fieldSize
    ) {

        return "The saved participant field is not complete.";

    }


    if (
        !tournamentBracketSetupDraft

        ||

        !Array.isArray(
            tournamentBracketSetupDraft.rounds
        )
    ) {

        return "Generate a bracket preview before saving.";

    }


    const structure =
        getTournamentBracketStructure(
            fieldSize
        );


    const rounds =
        tournamentBracketSetupDraft.rounds;


    if (
        rounds.length !==
        structure.totalRounds
    ) {

        return "The bracket preview has an incorrect number of rounds.";

    }


    for (
        let roundIndex =
            0;

        roundIndex <
            rounds.length;

        roundIndex +=
            1
    ) {


        const round =
            rounds[
                roundIndex
            ];


        const expectedMatchCount =

            structure.bracketSize

            /

            (
                2 ** (
                    roundIndex +
                    1
                )
            );


        if (
            !Array.isArray(
                round.matches
            )

            ||

            round.matches.length !==
                expectedMatchCount
        ) {

            return `${round.name || `Round ${roundIndex + 1}`} has an incorrect number of matches.`;

        }

    }


    const openingRound =
        rounds[0];


    const openingParticipantIds =

        openingRound.matches.flatMap(

            match => [

                match.participantOneId,

                match.participantTwoId

            ]

        )

            .filter(
                Boolean
            );


    if (
        openingParticipantIds.length !==
        fieldSize
    ) {

        return "The opening round does not contain the complete participant field.";

    }


    const uniqueOpeningParticipantIds =
        new Set(
            openingParticipantIds
        );


    if (
        uniqueOpeningParticipantIds.size !==
        openingParticipantIds.length
    ) {

        return "The bracket preview contains a duplicate participant.";

    }


    const storedParticipantSet =
        new Set(
            storedParticipants
        );


    if (
        openingParticipantIds.some(

            participantId =>

                !storedParticipantSet.has(
                    participantId
                )

        )
    ) {

        return "The bracket preview contains a participant outside the saved field.";

    }


    const byeMatches =

        openingRound.matches.filter(

            match =>
                match.isBye
        );


    if (
        byeMatches.length !==
        structure.byeCount
    ) {

        return "The bracket preview has an incorrect number of byes.";

    }


    const invalidByeMatch =

        byeMatches.find(

            match =>

                !match.participantOneId

                ||

                Boolean(
                    match.participantTwoId
                )

                ||

                match.winnerId !==
                    match.participantOneId

                ||

                match.status !==
                    "bye"

        );


    if (
        invalidByeMatch
    ) {

        return "One or more bracket byes are invalid.";

    }


    const invalidOpeningMatch =

        openingRound.matches.find(

            match =>

                !match.isBye

                &&

                (
                    !match.participantOneId

                    ||

                    !match.participantTwoId
                )

        );


    if (
        invalidOpeningMatch
    ) {

        return "One or more opening-round matchups are incomplete.";

    }


    return "";

}



async function saveTournamentBracketSetup() {


    const tournament =
        getSelectedControlRoomTournament();


    const bracket =
        getSelectedControlRoomBracket();


    if (
        !tournament

        ||

        !bracket
    ) {

        return;

    }


    const validationError =
        validateTournamentBracketSetupDraft(
            bracket
        );


    if (
        validationError
    ) {


        tournamentBracketSetupMessage.textContent =
            validationError;


        tournamentBracketSetupMessage.hidden =
            false;


        tournamentBracketSaveButton.disabled =
            true;


        return;

    }


    const confirmed =
        window.confirm(

            `Save the ${bracket.name} bracket setup as official? The participant field cannot be reopened while this setup exists.`

        );


    if (
        !confirmed
    ) {

        return;

    }


    const tournamentDatabase =
        owlControlRoomData.tournaments;


    if (
        !tournamentDatabase

        ||

        Array.isArray(
            tournamentDatabase
        )

        ||

        !Array.isArray(
            tournamentDatabase.tournaments
        )
    ) {


        tournamentBracketSetupMessage.textContent =
            "The tournament database is not available.";


        tournamentBracketSetupMessage.hidden =
            false;


        return;

    }


    const selectedTournamentId =
        tournament.id;


    const selectedBracketId =
        bracket.id;


    const savedRounds =

        tournamentBracketSetupDraft.rounds.map(

            round => ({

                ...round,

                matches:

                    round.matches.map(

                        match => ({

                            ...match

                        })

                    )

            })

        );


    const updatedTournamentDatabase = {

        ...tournamentDatabase,

        tournaments:

            tournamentDatabase.tournaments.map(

                storedTournament => {


                    if (
                        storedTournament.id !==
                        selectedTournamentId
                    ) {

                        return storedTournament;

                    }


                    return {

                        ...storedTournament,

                        brackets:

                            Array.isArray(
                                storedTournament.brackets
                            )

                                ? storedTournament.brackets.map(

                                    storedBracket => {


                                        if (
                                            storedBracket.id !==
                                            selectedBracketId
                                        ) {

                                            return storedBracket;

                                        }


                                        return {

                                            ...storedBracket,

                                            bracketSetup: {

                                                generated:
                                                    true,

                                                generatedAt:
                                                    new Date().toISOString(),

                                                rounds:
                                                    savedRounds,

                                                winnerId:
                                                    ""

                                            }

                                        };

                                    }

                                )

                                : []

                    };

                }

            )

    };


    tournamentBracketPreviewButton.disabled =
        true;


    tournamentBracketSaveButton.disabled =
        true;


    tournamentFieldLockButton.disabled =
        true;


    tournamentFieldStatus.textContent =
        "SAVING SETUP";


    tournamentBracketSetupMessage.hidden =
        true;


    try {


        await writeTournamentDatabase(
            updatedTournamentDatabase
        );


        await loadRepositoryData(
            owlRepositoryHandle
        );


        tournamentSelect.value =
            selectedTournamentId;


        populateTournamentBracketSelector();


        tournamentBracketSelect.value =
            selectedBracketId;


        loadTournamentFieldDraft();


        tournamentFieldStatus.textContent =
            "READY";


        tournamentBracketSetupMessage.textContent =
            "Bracket setup saved successfully.";


        tournamentBracketSetupMessage.hidden =
            false;


    }


    catch (
        error
    ) {


        console.error(

            "Could not save tournament bracket setup:",

            error

        );


        tournamentFieldStatus.textContent =
            "ERROR";


        tournamentBracketSetupMessage.textContent =

            error.message

            ||

            "The bracket setup could not be saved.";


        tournamentBracketSetupMessage.hidden =
            false;


        renderTournamentFieldOverview();

    }

}

    const bracket =
        getSelectedControlRoomBracket();


    if (
        !bracket
    ) {

        return;

    }


    const bracketSetup =
        getTournamentBracketSetup(
            bracket
        );


    const storedParticipants =
        getStoredTournamentParticipants(
            bracket
        );


    const fieldIsComplete =

        storedParticipants.length ===
        Number(
            bracket.fieldSize || 0
        );


    if (
        bracketSetup.generated

        ||

        !fieldIsComplete

        ||

        !bracket.fieldLocked
    ) {

        return;

    }


    tournamentBracketSetupDraft =

        generateTournamentBracketPreviewData(
            bracket
        );


    renderTournamentBracketSetupOverview(
        bracket
    );

}

function renderTournamentBracketSetupOverview(
    bracket
) {


    if (
        !bracket
    ) {


        tournamentBracketSetupStatus.textContent =
            "NOT GENERATED";


        tournamentBracketRoundCount.textContent =
            "0";


        tournamentBracketOpeningMatchCount.textContent =
            "0";


        tournamentBracketByeCount.textContent =
            "0";


        tournamentBracketPreviewButton.disabled =
            true;


        tournamentBracketSaveButton.disabled =
            true;


        tournamentBracketSetupMessage.hidden =
            true;


        setTournamentManagerEmptyMessage(

            tournamentBracketSetupPreview,

            "Select a championship bracket to view its bracket-setup status."

        );


        return;

    }


    const bracketSetup =
        getTournamentBracketSetup(
            bracket
        );


    const structure =
        getTournamentBracketStructure(
            bracket.fieldSize
        );


    const storedParticipants =
        getStoredTournamentParticipants(
            bracket
        );


    const fieldIsComplete =

        storedParticipants.length ===
        Number(
            bracket.fieldSize || 0
        );


    tournamentBracketSetupStatus.textContent =

        bracketSetup.generated

            ? "GENERATED"

            : "NOT GENERATED";


    tournamentBracketRoundCount.textContent =
        structure.totalRounds;


    tournamentBracketOpeningMatchCount.textContent =
        structure.openingMatchCount;


    tournamentBracketByeCount.textContent =
        structure.byeCount;


        tournamentBracketSaveButton.disabled =
        true;


    tournamentBracketSetupMessage.hidden =
        true;


    tournamentBracketPreviewButton.textContent =
        "Generate Bracket Preview";


    if (
        bracketSetup.generated
    ) {


        tournamentBracketPreviewButton.disabled =
            true;


        setTournamentManagerEmptyMessage(

            tournamentBracketSetupPreview,

            "A saved bracket setup already exists for this championship bracket."

        );


        return;

    }


    if (
        !fieldIsComplete
    ) {


        tournamentBracketPreviewButton.disabled =
            true;


        setTournamentManagerEmptyMessage(

            tournamentBracketSetupPreview,

            "Complete and save the participant field before generating tournament matchups."

        );


        return;

    }


    if (
        !bracket.fieldLocked
    ) {


        tournamentBracketPreviewButton.disabled =
            true;


        setTournamentManagerEmptyMessage(

            tournamentBracketSetupPreview,

            "Lock the completed participant field before generating tournament matchups."

        );


        return;

    }


        tournamentBracketPreviewButton.disabled =
        false;


        if (
        tournamentBracketSetupDraft
    ) {


        tournamentBracketSetupStatus.textContent =
            "PREVIEW READY";


        tournamentBracketPreviewButton.textContent =
            "Regenerate Bracket Preview";


        tournamentBracketSaveButton.disabled =
            false;


        renderTournamentBracketSetupDraft(
            bracket
        );


        return;

    }


    setTournamentManagerEmptyMessage(

        tournamentBracketSetupPreview,

        structure.byeCount > 0

            ? `This field is ready for bracket setup. The opening round will contain ${structure.openingMatchCount} matches and ${structure.byeCount} byes.`

            : `This field is ready for bracket setup. The opening round will contain ${structure.openingMatchCount} matches.`

    );

}
function getTournamentBracketMatchEntries(
    bracket
) {


    const bracketSetup =
        getTournamentBracketSetup(
            bracket
        );


    if (
        !bracketSetup.generated

        ||

        !Array.isArray(
            bracketSetup.rounds
        )
    ) {

        return [];

    }


    return bracketSetup.rounds.flatMap(

        (
            round,
            roundIndex
        ) => {


            const matches =

                Array.isArray(
                    round.matches
                )

                    ? round.matches

                    : [];


            return matches.map(

                (
                    match,
                    matchIndex
                ) => ({

                    round: {

                        ...round,

                        order:

                            Number(
                                round.order
                            )

                            ||

                            roundIndex +
                                1

                    },

                    match: {

                        ...match,

                        order:

                            Number(
                                match.order
                            )

                            ||

                            matchIndex +
                                1

                    }

                })

            );

        }

    );

}



function getSelectedTournamentBracketMatchEntry() {


    const bracket =
        getSelectedControlRoomBracket();


    if (
        !bracket

        ||

        !tournamentMatchSelect.value
    ) {

        return null;

    }


    return getTournamentBracketMatchEntries(
        bracket
    ).find(

        entry =>

            entry.match.id ===
            tournamentMatchSelect.value

    ) || null;

}



function getTournamentMatchLinkedRecord(
    match
) {


    if (
        !match?.matchRecordId
    ) {

        return {

            record:
                null,

            source:
                ""

        };

    }


    const completedMatches =

        Array.isArray(
            owlControlRoomData.matches
        )

            ? owlControlRoomData.matches

            : [];


    const completedRecord =

        completedMatches.find(

            record =>

                record.id ===
                match.matchRecordId

        );


    if (
        completedRecord
    ) {

        return {

            record:
                completedRecord,

            source:
                "completed"

        };

    }


    const announcedMatches =

        Array.isArray(
            owlControlRoomData.announcedMatches
        )

            ? owlControlRoomData.announcedMatches

            : [];


    const announcedRecord =

        announcedMatches.find(

            record =>

                record.id ===
                match.matchRecordId

        );


    if (
        announcedRecord
    ) {

        return {

            record:
                announcedRecord,

            source:
                "announced"

        };

    }


    return {

        record:
            null,

        source:
            "missing"

    };

}



function getTournamentMatchLinkStatusValue(
    match
) {


    if (
        match.isBye

        ||

        normalize(
            match.status
        ) ===
            "bye"
    ) {

        return "BYE";

    }


    const linkedMatch =
        getTournamentMatchLinkedRecord(
            match
        );


    if (
        linkedMatch.source ===
        "completed"
    ) {

        return "COMPLETED";

    }


    if (
        linkedMatch.source ===
        "announced"
    ) {

        return String(

            linkedMatch.record.status

            ||

            "announced"

        ).toUpperCase();

    }


    if (
        linkedMatch.source ===
        "missing"
    ) {

        return "LINK MISSING";

    }


    if (
        match.participantOneId

        &&

        match.participantTwoId
    ) {

        return "UNBOOKED";

    }


    return "AWAITING WINNERS";

}



function getTournamentMatchupDisplayName(
    bracket,
    match
) {


    if (
        match.isBye
    ) {


        return `${getTournamentEntrantDisplayName(
            bracket,
            match.participantOneId
        )} — BYE`;

    }


    if (
        match.participantOneId

        &&

        match.participantTwoId
    ) {


        return `${getTournamentEntrantDisplayName(
            bracket,
            match.participantOneId
        )} vs ${getTournamentEntrantDisplayName(
            bracket,
            match.participantTwoId
        )}`;

    }


    return "Awaiting previous-round winners";

}


function getTournamentBracketChampionshipId(
    bracket
) {


    const championships =

        Array.isArray(
            owlControlRoomData.championships
        )

            ? owlControlRoomData.championships

            : [];


    const championshipById =

        championships.find(

            championship =>

                championship.id ===
                bracket.id

        );


    if (
        championshipById
    ) {

        return championshipById.id;

    }


    const championshipByName =

        championships.find(

            championship =>

                normalize(
                    championship.name
                )

                ===

                normalize(
                    bracket.name
                )

        );


    return championshipByName?.id || "";

}

function getTournamentEventById(
    eventId
) {


    const events =

        Array.isArray(
            owlControlRoomData.events
        )

            ? owlControlRoomData.events

            : [];


    return events.find(

        event =>

            event.id ===
            eventId

    ) || null;

}



function getTournamentBookingEligibleEvents() {


    const events =

        Array.isArray(
            owlControlRoomData.events
        )

            ? owlControlRoomData.events

            : [];


    return [

        ...events

    ]

        .filter(

            event =>

                normalize(
                    event.status
                ) !==
                    "completed"

        )

        .sort(

            (
                eventA,
                eventB
            ) =>

                getDateValue(
                    eventA.date
                )

                -

                getDateValue(
                    eventB.date
                )

        );

}



function resetTournamentMatchBookingSelection() {


    tournamentMatchEvent.innerHTML =
        `

            <option value="">
                Select Tournament Match First
            </option>

        `;


    tournamentMatchEvent.disabled =
        true;


    tournamentMatchOrder.value =
        "";


    tournamentMatchOrder.disabled =
        true;


    tournamentMatchLinkStatus.textContent =
        "—";


    tournamentMatchBookingPreview.hidden =
        true;


    tournamentMatchBookingDetails.innerHTML =
        "";


    tournamentMatchBookingError.hidden =
        true;


    tournamentMatchBookingError.textContent =
        "";


    tournamentLoadMatchBookerButton.disabled =
        true;


    tournamentMatchBookingMessage.hidden =
        true;


    tournamentMatchBookingMessage.textContent =
        "";

}



function resetTournamentMatchBookingPanel(
    placeholderText =
        "Select a Generated Bracket First"
) {


    tournamentMatchSelect.innerHTML =
        "";


    const placeholder =
        document.createElement(
            "option"
        );


    placeholder.value =
        "";


    placeholder.textContent =
        placeholderText;


    tournamentMatchSelect.appendChild(
        placeholder
    );


    tournamentMatchSelect.disabled =
        true;


    resetTournamentMatchBookingSelection();

}



function appendTournamentMatchBookingDetail(
    label,
    value
) {


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "cr-editor-change-row";


    const labelElement =
        document.createElement(
            "strong"
        );


    labelElement.textContent =
        label;


    const valueElement =
        document.createElement(
            "span"
        );


    valueElement.textContent =
        value;


    row.append(

        labelElement,

        valueElement

    );


    tournamentMatchBookingDetails.appendChild(
        row
    );

}


function updateTournamentMatchBookerLoadButton() {


    tournamentLoadMatchBookerButton.disabled =
        true;


    tournamentMatchBookingError.hidden =
        true;


    tournamentMatchBookingError.textContent =
        "";


    const entry =
        getSelectedTournamentBracketMatchEntry();


    if (
        !entry
    ) {

        return;

    }


    const linkStatus =

        getTournamentMatchLinkStatusValue(
            entry.match
        );


    if (
        linkStatus !==
            "UNBOOKED"
    ) {

        return;

    }


    if (
        !entry.match.participantOneId

        ||

        !entry.match.participantTwoId
    ) {

        tournamentMatchBookingError.textContent =
            "This tournament matchup does not have two ready participants.";


        tournamentMatchBookingError.hidden =
            false;


        return;

    }


    const event =

        getTournamentEventById(
            tournamentMatchEvent.value
        );


    if (
        !event

        ||

        normalize(
            event.status
        ) ===
            "completed"
    ) {

        return;

    }


    const cardOrder =

        Number(
            tournamentMatchOrder.value
        );


    if (
        !Number.isInteger(
            cardOrder
        )

        ||

        cardOrder <
            1
    ) {


        tournamentMatchBookingError.textContent =
            "Card Order must be a whole number greater than zero.";


        tournamentMatchBookingError.hidden =
            false;


        return;

    }


    tournamentLoadMatchBookerButton.disabled =
        false;

}

function renderTournamentMatchBookingDetails(
    entry
) {


    const tournament =
        getSelectedControlRoomTournament();


    const bracket =
        getSelectedControlRoomBracket();


    if (
        !tournament

        ||

        !bracket

        ||

        !entry
    ) {

        tournamentMatchBookingPreview.hidden =
            true;


        return;

    }


    const linkStatus =

        getTournamentMatchLinkStatusValue(
            entry.match
        );


    tournamentMatchBookingDetails.innerHTML =
        "";


    appendTournamentMatchBookingDetail(

        "Tournament",

        tournament.name

    );


    appendTournamentMatchBookingDetail(

        "Championship Bracket",

        bracket.name

    );


    appendTournamentMatchBookingDetail(

        "Round",

        entry.round.name

        ||

        `Round ${entry.round.order}`

    );


    appendTournamentMatchBookingDetail(

        "Tournament Match",

        `Match ${entry.match.order}`

    );


    appendTournamentMatchBookingDetail(

        "Matchup",

        getTournamentMatchupDisplayName(

            bracket,

            entry.match

        )

    );


    appendTournamentMatchBookingDetail(

        "Link Status",

        linkStatus

    );


    if (
        tournamentMatchEvent.value
    ) {


        const event =
            getTournamentEventById(
                tournamentMatchEvent.value
            );


        appendTournamentMatchBookingDetail(

            "Hosting Event",

            event?.name

            ||

            tournamentMatchEvent.value

        );

    }


    if (
        tournamentMatchOrder.value
    ) {


        appendTournamentMatchBookingDetail(

            "Card Order",

            tournamentMatchOrder.value

        );

    }


        tournamentMatchBookingPreview.hidden =
        false;


    updateTournamentMatchBookerLoadButton();

}



function populateTournamentMatchEventOptions() {


    tournamentMatchEvent.innerHTML =
        `

            <option value="">
                Select Hosting Event
            </option>

        `;


    const events =
        getTournamentBookingEligibleEvents();


    events.forEach(

        event => {


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                event.id;


            option.textContent =

                `${event.date || "No Date"} — ${event.name}`;


            tournamentMatchEvent.appendChild(
                option
            );

        }

    );


    tournamentMatchEvent.disabled =

        events.length ===
        0;

}



function setTournamentMatchDefaultOrder() {


    const eventId =
        tournamentMatchEvent.value;


    if (
        !eventId
    ) {


        tournamentMatchOrder.value =
            "";


        tournamentMatchOrder.disabled =
            true;


        return;

    }


    const announcedMatches =

        Array.isArray(
            owlControlRoomData.announcedMatches
        )

            ? owlControlRoomData.announcedMatches

            : [];


    const highestOrder =

        announcedMatches

            .filter(

                match =>

                    match.eventId ===
                    eventId

            )

            .reduce(

                (
                    highest,
                    match
                ) =>

                    Math.max(

                        highest,

                        Number(
                            match.order || 0
                        )

                    ),

                0

            );


    tournamentMatchOrder.value =
        highestOrder +
        1;


    tournamentMatchOrder.disabled =
        false;

}



function renderTournamentMatchBookingSelection() {


    resetTournamentMatchBookingSelection();


    const entry =
        getSelectedTournamentBracketMatchEntry();


    if (
        !entry
    ) {

        return;

    }


    const linkStatus =

        getTournamentMatchLinkStatusValue(
            entry.match
        );


    tournamentMatchLinkStatus.textContent =
        linkStatus;


    if (
        linkStatus ===
        "UNBOOKED"
    ) {


        populateTournamentMatchEventOptions();


        renderTournamentMatchBookingDetails(
            entry
        );


        return;

    }


    const linkedMatch =
        getTournamentMatchLinkedRecord(
            entry.match
        );


    if (
        linkedMatch.record
    ) {


        const event =
            getTournamentEventById(

                linkedMatch.record.eventId

                ||

                entry.match.eventId

            );


        tournamentMatchEvent.innerHTML =
            "";


        const eventOption =
            document.createElement(
                "option"
            );


        eventOption.value =

            event?.id

            ||

            linkedMatch.record.eventId

            ||

            entry.match.eventId

            ||

            "";


        eventOption.textContent =

            event?.name

            ||

            "Linked Event";


        tournamentMatchEvent.appendChild(
            eventOption
        );


        tournamentMatchEvent.disabled =
            true;


        tournamentMatchOrder.value =

            linkedMatch.record.order

            ||

            "";


        tournamentMatchOrder.disabled =
            true;

    }


    if (
        linkStatus ===
        "LINK MISSING"
    ) {


        tournamentMatchBookingError.textContent =
            "The linked match record could not be found in announced or completed matches.";


        tournamentMatchBookingError.hidden =
            false;

    }


    renderTournamentMatchBookingDetails(
        entry
    );

}



function renderTournamentMatchQueue(
    bracket
) {


    resetTournamentMatchBookingPanel();


    if (
        !bracket
    ) {

        return;

    }


    const bracketSetup =
        getTournamentBracketSetup(
            bracket
        );


    if (
        !bracketSetup.generated
    ) {

        resetTournamentMatchBookingPanel(
            "Select a Generated Bracket First"
        );


        return;

    }


    const entries =
        getTournamentBracketMatchEntries(
            bracket
        );


    tournamentMatchSelect.innerHTML =
        `

            <option value="">
                Select Tournament Match
            </option>

        `;


    let selectableMatchCount =
        0;


    entries.forEach(

        entry => {


            const linkStatus =

                getTournamentMatchLinkStatusValue(
                    entry.match
                );


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                entry.match.id;


            option.textContent =

                `${entry.round.name || `Round ${entry.round.order}`} — Match ${entry.match.order} — ${getTournamentMatchupDisplayName(
                    bracket,
                    entry.match
                )} — ${linkStatus}`;


            option.disabled =

                linkStatus ===
                    "BYE"

                ||

                linkStatus ===
                    "AWAITING WINNERS";


            if (
                !option.disabled
            ) {

                selectableMatchCount +=
                    1;

            }


            tournamentMatchSelect.appendChild(
                option
            );

        }

    );


    tournamentMatchSelect.disabled =

        selectableMatchCount ===
        0;


    if (
        selectableMatchCount ===
        0
    ) {


        tournamentMatchSelect.options[0].textContent =
            "No Ready or Linked Matches";

    }

}


function loadTournamentMatchIntoMatchBooker() {


    const tournament =
        getSelectedControlRoomTournament();


    const bracket =
        getSelectedControlRoomBracket();


    const entry =
        getSelectedTournamentBracketMatchEntry();


    if (
        !tournament

        ||

        !bracket

        ||

        !entry
    ) {

        return;

    }


    updateTournamentMatchBookerLoadButton();


    if (
        tournamentLoadMatchBookerButton.disabled
    ) {

        return;

    }


    const eventId =
        tournamentMatchEvent.value;


    const cardOrder =

        Number(
            tournamentMatchOrder.value
        );


    const championshipId =

        getTournamentBracketChampionshipId(
            bracket
        );


    tournamentLoadMatchBookerButton.disabled =
        true;


    tournamentMatchBookingMessage.hidden =
        true;


    window.dispatchEvent(

        new CustomEvent(

            "owl-load-tournament-match",

            {

                detail: {

                    tournamentId:
                        tournament.id,

                    bracketId:
                        bracket.id,

                    bracketMatchId:
                        entry.match.id,

                    roundId:
                        entry.round.id || "",

                    roundOrder:

                        Number(
                            entry.round.order || 0
                        ),

                    participantType:
                        bracket.participantType,

                    participantOneId:
                        entry.match.participantOneId,

                    participantTwoId:
                        entry.match.participantTwoId,

                    eventId,

                    order:
                        cardOrder,

                    championshipId

                }

            }

        )

    );


    tournamentMatchBookingMessage.textContent =
        "Tournament match loaded into Match Booker. Review it there before adding it to the event card.";


    tournamentMatchBookingMessage.hidden =
        false;


    updateTournamentMatchBookerLoadButton();

}

function handleTournamentMatchEventChange() {


    setTournamentMatchDefaultOrder();


    const entry =
        getSelectedTournamentBracketMatchEntry();


    if (
        entry
    ) {

        renderTournamentMatchBookingDetails(
            entry
        );

    }


    updateTournamentMatchBookerLoadButton();

}



function refreshTournamentMatchBookingDetails() {


    const entry =
        getSelectedTournamentBracketMatchEntry();


    if (
        entry
    ) {

        renderTournamentMatchBookingDetails(
            entry
        );

    }


    updateTournamentMatchBookerLoadButton();

}

function resetTournamentFieldOverview() {


        tournamentFieldDraftParticipants =
        [];


    tournamentBracketSetupDraft =
        null;


    tournamentCurrentStatus.textContent =
        "—";


    tournamentFieldSize.textContent =
        "0";


    tournamentSelectedCount.textContent =
        "0";


    tournamentRemainingCount.textContent =
        "0";


    tournamentLockState.textContent =
        "OPEN";


    tournamentParticipantSearch.value =
        "";


    tournamentParticipantSearch.disabled =
        true;


    tournamentParticipantSearch.placeholder =
        "Select a bracket first";


        tournamentFieldReview.hidden =
        true;


    tournamentFieldChangeList.innerHTML =
        "";


    tournamentFieldError.hidden =
        true;


    tournamentFieldError.textContent =
        "";


    tournamentFieldMessage.hidden =
        true;


    tournamentFieldMessage.textContent =
        "";


        tournamentFieldSaveButton.disabled =
        true;


       tournamentFieldLockButton.textContent =
        "Lock Completed Field";


    tournamentFieldLockButton.disabled =
        true;


        renderTournamentBracketSetupOverview(
        null
    );


    renderTournamentMatchQueue(
        null
    );


    setTournamentManagerEmptyMessage(

        tournamentEligibleList,

        "Select a tournament and championship bracket to view eligible participants."

    );


    setTournamentManagerEmptyMessage(

        tournamentSelectedList,

        "No bracket selected."

    );

}



function getTournamentWrestlers() {


    return Array.isArray(
        owlControlRoomData.wrestlers
    )

        ? owlControlRoomData.wrestlers

        : [];

}



function getTournamentTeams() {


    return Array.isArray(
        owlControlRoomData.teams
    )

        ? owlControlRoomData.teams

        : [];

}



function getTournamentWrestlerById(
    wrestlerId
) {


    return getTournamentWrestlers().find(

        wrestler =>

            wrestler.id ===
            wrestlerId

    ) || null;

}



function getTournamentTeamById(
    teamId
) {


    return getTournamentTeams().find(

        team =>

            team.id ===
            teamId

    ) || null;

}



function getTournamentBracketGender(
    bracket
) {


    const division =
        normalize(
            bracket?.division
        );


    if (
        division.includes(
            "women"
        )
    ) {

        return "women";

    }


    if (
        division.includes(
            "men"
        )
    ) {

        return "men";

    }


    return "";

}



function isTournamentWrestlerEligible(
    wrestler,
    bracket
) {


    const requiredGender =
        getTournamentBracketGender(
            bracket
        );


    if (
        !requiredGender

        ||

        normalize(
            wrestler.division
        ) !==
            requiredGender
    ) {

        return false;

    }


    const bracketBrand =
        normalize(
            bracket.brand
        );


    if (
        !bracketBrand

        ||

        bracketBrand ===
            "shared"

        ||

        bracketBrand ===
            "owl"
    ) {

        return true;

    }


    return (

        normalize(
            wrestler.brand
        )

        ===

        bracketBrand

    );

}



function isTournamentTeamEligible(
    team,
    bracket
) {


    const members =

        Array.isArray(
            team.members
        )

            ? team.members

            : [];


    if (
        members.length !==
        2
    ) {

        return false;

    }


    const memberRecords =

        members.map(
            getTournamentWrestlerById
        );


    if (
        memberRecords.some(
            member => !member
        )
    ) {

        return false;

    }


    const requiredGender =
        getTournamentBracketGender(
            bracket
        );


    if (
        !requiredGender

        ||

        !memberRecords.every(

            member =>

                normalize(
                    member.division
                )

                ===

                requiredGender

        )
    ) {

        return false;

    }


    const bracketBrand =
        normalize(
            bracket.brand
        );


    if (
        !bracketBrand

        ||

        bracketBrand ===
            "shared"

        ||

        bracketBrand ===
            "owl"
    ) {

        return true;

    }


    return (

        normalize(
            team.brand
        )

        ===

        bracketBrand

    );

}



function getTournamentEntrantRecord(
    bracket,
    participantId
) {


    if (
        bracket.participantType ===
        "team"
    ) {

        return getTournamentTeamById(
            participantId
        );

    }


    return getTournamentWrestlerById(
        participantId
    );

}



function getTournamentEntrantDetail(
    bracket,
    entrant
) {


    if (
        !entrant
    ) {

        return "Database record not found";

    }


    if (
        bracket.participantType ===
        "team"
    ) {


        const memberNames =

            (
                Array.isArray(
                    entrant.members
                )

                    ? entrant.members

                    : []
            )

                .map(

                    memberId =>

                        getTournamentWrestlerById(
                            memberId
                        )?.name

                        ||

                        memberId

                )

                .join(
                    " & "
                );


        return [

            memberNames,

            entrant.brand || "OWL"

        ]

            .filter(
                Boolean
            )

            .join(
                " • "
            );

    }


    return [

        entrant.brand,

        entrant.division

    ]

        .filter(
            Boolean
        )

        .join(
            " • "
        );

}

function getStoredTournamentParticipants(
    bracket
) {


    return Array.isArray(
        bracket?.participants
    )

        ? bracket.participants

        : [];

}



function tournamentParticipantListsMatch(
    firstList,
    secondList
) {


    if (
        firstList.length !==
        secondList.length
    ) {

        return false;

    }


    return firstList.every(

        (
            participantId,
            index
        ) =>

            participantId ===
            secondList[index]

    );

}



function getTournamentEntrantDisplayName(
    bracket,
    participantId
) {


    const entrant =
        getTournamentEntrantRecord(

            bracket,

            participantId

        );


    return entrant?.name ||
        participantId;

}



function validateTournamentFieldDraft(
    bracket
) {


    if (
        !bracket
    ) {

        return "Select a championship bracket.";

    }


    if (
        bracket.fieldLocked
    ) {

        return "This participant field is locked.";

    }


    const numericFieldSize =

        Number(
            bracket.fieldSize || 0
        );


    if (
        !Number.isInteger(
            numericFieldSize
        )

        ||

        numericFieldSize <=
            0
    ) {

        return "This bracket does not have a valid field size.";

    }


    if (
        tournamentFieldDraftParticipants.length >
            numericFieldSize
    ) {

        return `This bracket allows only ${numericFieldSize} participants.`;

    }


    const uniqueParticipantIds =
        new Set(
            tournamentFieldDraftParticipants
        );


    if (
        uniqueParticipantIds.size !==
        tournamentFieldDraftParticipants.length
    ) {

        return "The participant field contains a duplicate entrant.";

    }


    for (
        const participantId
        of tournamentFieldDraftParticipants
    ) {


        const entrant =
            getTournamentEntrantRecord(

                bracket,

                participantId

            );


        if (
            !entrant
        ) {

            return `Participant record not found: ${participantId}`;

        }


        const isEligible =

            bracket.participantType ===
                "team"

                ? isTournamentTeamEligible(
                    entrant,
                    bracket
                )

                : isTournamentWrestlerEligible(
                    entrant,
                    bracket
                );


        if (
            !isEligible
        ) {

            return `${entrant.name || participantId} is not eligible for this bracket.`;

        }

    }


    return "";

}



function appendTournamentFieldReviewRow(
    label,
    value
) {


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "control-room-health-item";


    const rowLabel =
        document.createElement(
            "span"
        );


    rowLabel.textContent =
        label;


    const rowValue =
        document.createElement(
            "strong"
        );


    rowValue.textContent =
        value;


    row.append(

        rowLabel,

        rowValue

    );


    tournamentFieldChangeList.appendChild(
        row
    );

}



function renderTournamentFieldChangeReview(
    bracket
) {


    const storedParticipants =
        getStoredTournamentParticipants(
            bracket
        );


    const draftMatchesStored =
        tournamentParticipantListsMatch(

            storedParticipants,

            tournamentFieldDraftParticipants

        );


    tournamentFieldChangeList.innerHTML =
        "";


    tournamentFieldError.hidden =
        true;


    tournamentFieldError.textContent =
        "";


    if (
        draftMatchesStored

        ||

        bracket.fieldLocked
    ) {


        tournamentFieldReview.hidden =
            true;


        tournamentFieldSaveButton.disabled =
            true;


        return;

    }


    const validationError =
        validateTournamentFieldDraft(
            bracket
        );


    const storedParticipantSet =
        new Set(
            storedParticipants
        );


    const draftParticipantSet =
        new Set(
            tournamentFieldDraftParticipants
        );


    const addedParticipantIds =

        tournamentFieldDraftParticipants.filter(

            participantId =>

                !storedParticipantSet.has(
                    participantId
                )

        );


    const removedParticipantIds =

        storedParticipants.filter(

            participantId =>

                !draftParticipantSet.has(
                    participantId
                )

        );


    appendTournamentFieldReviewRow(

        "FIELD COUNT",

        `${storedParticipants.length} → ${tournamentFieldDraftParticipants.length}`

    );


    addedParticipantIds.forEach(

        participantId => {


            appendTournamentFieldReviewRow(

                "ADD",

                getTournamentEntrantDisplayName(
                    bracket,
                    participantId
                )

            );

        }

    );


    removedParticipantIds.forEach(

        participantId => {


            appendTournamentFieldReviewRow(

                "REMOVE",

                getTournamentEntrantDisplayName(
                    bracket,
                    participantId
                )

            );

        }

    );


    tournamentFieldReview.hidden =
        false;


    if (
        validationError
    ) {


        tournamentFieldError.textContent =
            validationError;


        tournamentFieldError.hidden =
            false;


        tournamentFieldSaveButton.disabled =
            true;


        return;

    }


    tournamentFieldSaveButton.disabled =
        false;

}


function updateTournamentFieldLockButton(
    bracket
) {
    
    const bracketSetup =
        getTournamentBracketSetup(
            bracket
        );


    if (
        bracketSetup.generated
    ) {


        tournamentFieldLockButton.textContent =
            "Participant Field Finalized";


        tournamentFieldLockButton.disabled =
            true;


        return;

    }

    if (
        bracket.fieldLocked
    ) {


        tournamentFieldLockButton.textContent =
            "Reopen Participant Field";


        tournamentFieldLockButton.disabled =
            false;


        return;

    }


    tournamentFieldLockButton.textContent =
        "Lock Completed Field";


    const numericFieldSize =

        Number(
            bracket.fieldSize || 0
        );


    const storedParticipants =
        getStoredTournamentParticipants(
            bracket
        );


    const draftMatchesStored =
        tournamentParticipantListsMatch(

            storedParticipants,

            tournamentFieldDraftParticipants

        );


    const validationError =
        validateTournamentFieldDraft(
            bracket
        );


    const fieldIsComplete =

        Number.isInteger(
            numericFieldSize
        )

        &&

        numericFieldSize >
            0

        &&

        storedParticipants.length ===
            numericFieldSize;


    tournamentFieldLockButton.disabled =

        !fieldIsComplete

        ||

        !draftMatchesStored

        ||

        Boolean(
            validationError
        );

}
async function writeControlRoomJsonFile(
    fileName,
    data
) {


    if (
        !owlRepositoryHandle
    ) {

        throw new Error(
            "The OWL repository is not connected."
        );

    }


    const hasPermission =
        await hasRepositoryPermission(
            owlRepositoryHandle
        );


    if (
        !hasPermission
    ) {

        throw new Error(
            "Write permission was not granted for the OWL repository."
        );

    }


    const dataDirectory =

        await owlRepositoryHandle.getDirectoryHandle(
            "data"
        );


    const fileHandle =

        await dataDirectory.getFileHandle(
            fileName
        );


    const writable =

        await fileHandle.createWritable();


    try {


        await writable.write(

            `${JSON.stringify(
                data,
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


        catch (
            abortError
        ) {


            console.warn(

                `Could not abort ${fileName} write:`,

                abortError

            );

        }


        throw error;

    }

}
async function writeTournamentDatabase(
    tournamentDatabase
) {


    if (
        !owlRepositoryHandle
    ) {

        throw new Error(
            "The OWL repository is not connected."
        );

    }


    const hasPermission =
        await hasRepositoryPermission(
            owlRepositoryHandle
        );


    if (
        !hasPermission
    ) {

        throw new Error(
            "Write permission was not granted for the OWL repository."
        );

    }


    const dataDirectory =

        await owlRepositoryHandle.getDirectoryHandle(
            "data"
        );


    const tournamentFileHandle =

        await dataDirectory.getFileHandle(
            "tournaments.json"
        );


    const writable =

        await tournamentFileHandle.createWritable();


    try {


        await writable.write(

            `${JSON.stringify(
                tournamentDatabase,
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


        catch (
            abortError
        ) {


            console.warn(

                "Could not abort tournament database write:",

                abortError

            );

        }


        throw error;

    }

}



async function saveTournamentParticipantField() {


    const tournament =
        getSelectedControlRoomTournament();


    const bracket =
        getSelectedControlRoomBracket();


    if (
        !tournament

        ||

        !bracket
    ) {

        return;

    }


    const validationError =
        validateTournamentFieldDraft(
            bracket
        );


    if (
        validationError
    ) {


        tournamentFieldError.textContent =
            validationError;


        tournamentFieldError.hidden =
            false;


        tournamentFieldReview.hidden =
            false;


        tournamentFieldSaveButton.disabled =
            true;


        return;

    }


    const tournamentDatabase =
        owlControlRoomData.tournaments;


    if (
        !tournamentDatabase

        ||

        Array.isArray(
            tournamentDatabase
        )

        ||

        !Array.isArray(
            tournamentDatabase.tournaments
        )
    ) {

        tournamentFieldError.textContent =
            "The tournament database is not available.";


        tournamentFieldError.hidden =
            false;


        tournamentFieldReview.hidden =
            false;


        return;

    }


    const selectedTournamentId =
        tournament.id;


    const selectedBracketId =
        bracket.id;


    const updatedTournamentDatabase = {

        ...tournamentDatabase,

        tournaments:

            tournamentDatabase.tournaments.map(

                storedTournament => {


                    if (
                        storedTournament.id !==
                        selectedTournamentId
                    ) {

                        return storedTournament;

                    }


                    return {

                        ...storedTournament,

                        brackets:

                            Array.isArray(
                                storedTournament.brackets
                            )

                                ? storedTournament.brackets.map(

                                    storedBracket => {


                                        if (
                                            storedBracket.id !==
                                            selectedBracketId
                                        ) {

                                            return storedBracket;

                                        }


                                        return {

                                            ...storedBracket,

                                            participants: [

                                                ...tournamentFieldDraftParticipants

                                            ]

                                        };

                                    }

                                )

                                : []

                    };

                }

            )

    };


    tournamentFieldSaveButton.disabled =
        true;


    tournamentFieldLockButton.disabled =
        true;


    tournamentFieldStatus.textContent =
        "SAVING";


    tournamentFieldMessage.hidden =
        true;


    tournamentFieldError.hidden =
        true;


    try {


        await writeTournamentDatabase(
            updatedTournamentDatabase
        );


        await loadRepositoryData(
            owlRepositoryHandle
        );


        tournamentSelect.value =
            selectedTournamentId;


        populateTournamentBracketSelector();


        tournamentBracketSelect.value =
            selectedBracketId;


        loadTournamentFieldDraft();


        tournamentFieldStatus.textContent =
            "READY";


        tournamentFieldMessage.textContent =
            "Participant field saved successfully.";


        tournamentFieldMessage.hidden =
            false;


    }


    catch (
        error
    ) {


        console.error(

            "Could not save tournament participant field:",

            error

        );


        tournamentFieldStatus.textContent =
            "ERROR";


        tournamentFieldError.textContent =

            error.message

            ||

            "The participant field could not be saved.";


        tournamentFieldError.hidden =
            false;


        tournamentFieldReview.hidden =
            false;


        renderTournamentFieldChangeReview(
            bracket
        );

    }

}
async function toggleTournamentParticipantFieldLock() {


    const tournament =
        getSelectedControlRoomTournament();


    const bracket =
        getSelectedControlRoomBracket();


    if (
        !tournament

        ||

        !bracket
    ) {

        return;

    }


    const shouldLock =
        !Boolean(
            bracket.fieldLocked
        );


    if (
        shouldLock
    ) {


        const numericFieldSize =

            Number(
                bracket.fieldSize || 0
            );


        const storedParticipants =
            getStoredTournamentParticipants(
                bracket
            );


        const draftMatchesStored =
            tournamentParticipantListsMatch(

                storedParticipants,

                tournamentFieldDraftParticipants

            );


        const validationError =
            validateTournamentFieldDraft(
                bracket
            );


        if (
            validationError

            ||

            !draftMatchesStored

            ||

            storedParticipants.length !==
                numericFieldSize
        ) {


            tournamentFieldError.textContent =

                validationError

                ||

                "Save the complete participant field before locking it.";


            tournamentFieldError.hidden =
                false;


            tournamentFieldReview.hidden =
                false;


            return;

        }

    }


    const confirmationMessage =

        shouldLock

            ? `Lock the completed ${bracket.name} participant field? Entrants cannot be edited while it is locked.`

            : `Reopen the ${bracket.name} participant field for editing?`;


    const confirmed =
        window.confirm(
            confirmationMessage
        );


    if (
        !confirmed
    ) {

        return;

    }


    const tournamentDatabase =
        owlControlRoomData.tournaments;


    if (
        !tournamentDatabase

        ||

        Array.isArray(
            tournamentDatabase
        )

        ||

        !Array.isArray(
            tournamentDatabase.tournaments
        )
    ) {


        tournamentFieldError.textContent =
            "The tournament database is not available.";


        tournamentFieldError.hidden =
            false;


        tournamentFieldReview.hidden =
            false;


        return;

    }


    const selectedTournamentId =
        tournament.id;


    const selectedBracketId =
        bracket.id;


    const updatedTournamentDatabase = {

        ...tournamentDatabase,

        tournaments:

            tournamentDatabase.tournaments.map(

                storedTournament => {


                    if (
                        storedTournament.id !==
                        selectedTournamentId
                    ) {

                        return storedTournament;

                    }


                    return {

                        ...storedTournament,

                        brackets:

                            Array.isArray(
                                storedTournament.brackets
                            )

                                ? storedTournament.brackets.map(

                                    storedBracket => {


                                        if (
                                            storedBracket.id !==
                                            selectedBracketId
                                        ) {

                                            return storedBracket;

                                        }


                                        return {

                                            ...storedBracket,

                                            fieldLocked:
                                                shouldLock

                                        };

                                    }

                                )

                                : []

                    };

                }

            )

    };


    tournamentFieldSaveButton.disabled =
        true;


    tournamentFieldLockButton.disabled =
        true;


    tournamentFieldStatus.textContent =

        shouldLock

            ? "LOCKING"

            : "REOPENING";


    tournamentFieldMessage.hidden =
        true;


    tournamentFieldError.hidden =
        true;


    try {


        await writeTournamentDatabase(
            updatedTournamentDatabase
        );


        await loadRepositoryData(
            owlRepositoryHandle
        );


        tournamentSelect.value =
            selectedTournamentId;


        populateTournamentBracketSelector();


        tournamentBracketSelect.value =
            selectedBracketId;


        loadTournamentFieldDraft();


        tournamentFieldStatus.textContent =
            "READY";


        tournamentFieldMessage.textContent =

            shouldLock

                ? "Participant field locked successfully."

                : "Participant field reopened successfully.";


        tournamentFieldMessage.hidden =
            false;


    }


    catch (
        error
    ) {


        console.error(

            "Could not update tournament field lock:",

            error

        );


        tournamentFieldStatus.textContent =
            "ERROR";


        tournamentFieldError.textContent =

            error.message

            ||

            "The participant field lock could not be updated.";


        tournamentFieldError.hidden =
            false;


        tournamentFieldReview.hidden =
            false;


        renderTournamentFieldOverview();

    }

}

function loadTournamentFieldDraft() {


    tournamentBracketSetupDraft =
        null;


    const bracket =
        getSelectedControlRoomBracket();


    tournamentFieldDraftParticipants =

        bracket

        &&

        Array.isArray(
            bracket.participants
        )

            ? [
                ...bracket.participants
            ]

            : [];


    renderTournamentFieldOverview();

}



function addTournamentFieldParticipant(
    participantId
) {


    tournamentFieldMessage.hidden =
        true;


    const bracket =
        getSelectedControlRoomBracket();


    if (
        !bracket

        ||

        bracket.fieldLocked

        ||

        !participantId
    ) {

        return;

    }


    const numericFieldSize =

        Number(
            bracket.fieldSize || 0
        );


    if (
        tournamentFieldDraftParticipants.includes(
            participantId
        )

        ||

        tournamentFieldDraftParticipants.length >=
            numericFieldSize
    ) {

        return;

    }


    tournamentFieldDraftParticipants.push(
        participantId
    );


    renderTournamentFieldOverview();

}



function removeTournamentFieldParticipant(
    participantId
) {


    tournamentFieldMessage.hidden =
        true;


    const bracket =
        getSelectedControlRoomBracket();


    if (
        !bracket

        ||

        bracket.fieldLocked

        ||

        !participantId
    ) {

        return;

    }


    tournamentFieldDraftParticipants =

        tournamentFieldDraftParticipants.filter(

            storedParticipantId =>

                storedParticipantId !==
                participantId

        );


    renderTournamentFieldOverview();

}

function getEligibleTournamentEntrants(
    bracket
) {


        const selectedParticipantIds =
        new Set(

            tournamentFieldDraftParticipants

        );

    const entrants =

        bracket.participantType ===
        "team"

            ? getTournamentTeams().filter(

                team =>

                    !selectedParticipantIds.has(
                        team.id
                    )

                    &&

                    isTournamentTeamEligible(
                        team,
                        bracket
                    )

            )

            : getTournamentWrestlers().filter(

                wrestler =>

                    !selectedParticipantIds.has(
                        wrestler.id
                    )

                    &&

                    isTournamentWrestlerEligible(
                        wrestler,
                        bracket
                    )

            );


    return entrants.sort(

        (
            entrantA,
            entrantB
        ) =>

            String(
                entrantA.name || entrantA.id
            ).localeCompare(

                String(
                    entrantB.name || entrantB.id
                )

            )

    );

}



function renderTournamentEligibleParticipants() {


    const bracket =
        getSelectedControlRoomBracket();


    if (
        !bracket
    ) {


        setTournamentManagerEmptyMessage(

            tournamentEligibleList,

            "Select a tournament and championship bracket to view eligible participants."

        );


        return;

    }


    if (
        bracket.fieldLocked
    ) {


        setTournamentManagerEmptyMessage(

            tournamentEligibleList,

            "This participant field is locked."

        );


        return;

    }


    const numericFieldSize =

        Number(
            bracket.fieldSize || 0
        );


    if (
        tournamentFieldDraftParticipants.length >=
            numericFieldSize
    ) {


        setTournamentManagerEmptyMessage(

            tournamentEligibleList,

            "This participant field is full."

        );


        return;

    }


    const searchQuery =
        normalize(
            tournamentParticipantSearch.value
        );


    const eligibleEntrants =

        getEligibleTournamentEntrants(
            bracket
        )

            .filter(

                entrant => {


                    if (
                        !searchQuery
                    ) {

                        return true;

                    }


                    const detail =
                        getTournamentEntrantDetail(
                            bracket,
                            entrant
                        );


                    return normalize(

                        [

                            entrant.name,

                            entrant.id,

                            detail

                        ].join(
                            " "
                        )

                    ).includes(
                        searchQuery
                    );

                }

            );


    if (
        eligibleEntrants.length ===
        0
    ) {


        setTournamentManagerEmptyMessage(

            tournamentEligibleList,

            searchQuery

                ? "No eligible participants match this search."

                : "No eligible participants are available for this bracket."

        );


        return;

    }


    tournamentEligibleList.innerHTML =
        "";


    eligibleEntrants.forEach(

        entrant => {


            const entrantRow =
                document.createElement(
                    "div"
                );


            entrantRow.className =
                "control-room-health-item";


            const entrantIdentity =
                document.createElement(
                    "div"
                );


            const entrantName =
                document.createElement(
                    "strong"
                );


            entrantName.textContent =
                entrant.name ||
                entrant.id;


            const entrantDetail =
                document.createElement(
                    "span"
                );


            entrantDetail.textContent =
                getTournamentEntrantDetail(
                    bracket,
                    entrant
                );


            entrantIdentity.append(

                entrantName,

                entrantDetail

            );


            const addButton =
                document.createElement(
                    "button"
                );


            addButton.type =
                "button";


            addButton.className =
                "control-room-button";


            addButton.textContent =
                "Add to Field";


            addButton.addEventListener(

                "click",

                () => {

                    addTournamentFieldParticipant(
                        entrant.id
                    );

                }

            );


            entrantRow.append(

                entrantIdentity,

                addButton

            );


            tournamentEligibleList.appendChild(
                entrantRow
            );

        }

    );

}


function renderStoredTournamentParticipants(
    bracket
) {


    const participants =

        tournamentFieldDraftParticipants;


    if (
        participants.length ===
        0
    ) {


        setTournamentManagerEmptyMessage(

            tournamentSelectedList,

            "No participants have been selected for this bracket."

        );


        return;

    }


    tournamentSelectedList.innerHTML =
        "";


    participants.forEach(

        (
            participantId,
            index
        ) => {


            const entrant =
                getTournamentEntrantRecord(

                    bracket,

                    participantId

                );


            const participantRow =
                document.createElement(
                    "div"
                );


            participantRow.className =
                "control-room-health-item";


            const participantNumber =
                document.createElement(
                    "span"
                );


            participantNumber.textContent =

                `Slot ${index + 1}`;


            const participantIdentity =
                document.createElement(
                    "div"
                );


            const participantName =
                document.createElement(
                    "strong"
                );


            participantName.textContent =

                entrant?.name

                ||

                participantId;


            const participantDetail =
                document.createElement(
                    "span"
                );


            participantDetail.textContent =
                getTournamentEntrantDetail(

                    bracket,

                    entrant

                );


            participantIdentity.append(

                participantName,

                participantDetail

            );


            const removeButton =
                document.createElement(
                    "button"
                );


            removeButton.type =
                "button";


            removeButton.className =
                "control-room-button";


            removeButton.textContent =
                "Remove";


            removeButton.disabled =
                Boolean(
                    bracket.fieldLocked
                );


            removeButton.addEventListener(

                "click",

                () => {

                    removeTournamentFieldParticipant(
                        participantId
                    );

                }

            );


            participantRow.append(

                participantNumber,

                participantIdentity,

                removeButton

            );


            tournamentSelectedList.appendChild(
                participantRow
            );

        }

    );

}


function renderTournamentFieldOverview() {


    const bracket =
        getSelectedControlRoomBracket();


    if (
        !bracket
    ) {


        resetTournamentFieldOverview();


        return;

    }


        const participants =

        tournamentFieldDraftParticipants;


    const numericFieldSize =

        Number(
            bracket.fieldSize || 0
        );


    const selectedCount =
        participants.length;


    const remainingCount =

        Math.max(

            numericFieldSize -
            selectedCount,

            0

        );


    tournamentCurrentStatus.textContent =
        bracket.status || "—";


    tournamentFieldSize.textContent =
        numericFieldSize;


    tournamentSelectedCount.textContent =
        selectedCount;


    tournamentRemainingCount.textContent =
        remainingCount;


    tournamentLockState.textContent =

        bracket.fieldLocked
            ? "LOCKED"
            : "OPEN";


        tournamentParticipantSearch.value =
        "";


        tournamentParticipantSearch.disabled =

        Boolean(
            bracket.fieldLocked
        )

        ||

        selectedCount >=
            numericFieldSize;


    tournamentParticipantSearch.placeholder =

        bracket.fieldLocked

            ? "This participant field is locked"

            : selectedCount >=
                numericFieldSize

                ? "This participant field is full"

                : bracket.participantType ===
                    "team"

                    ? "Search eligible teams"

                    : "Search eligible wrestlers";


            renderTournamentEligibleParticipants();


    renderStoredTournamentParticipants(
        bracket
    );


        renderTournamentFieldChangeReview(
        bracket
    );


        updateTournamentFieldLockButton(
        bracket
    );


        renderTournamentBracketSetupOverview(
        bracket
    );


    renderTournamentMatchQueue(
        bracket
    );

}



function populateTournamentBracketSelector() {


    const tournament =
        getSelectedControlRoomTournament();


    tournamentBracketSelect.innerHTML =
        "";


    const placeholder =
        document.createElement(
            "option"
        );


    placeholder.value =
        "";


    placeholder.textContent =
        tournament

            ? "Select Championship Bracket"

            : "Select Tournament First";


    tournamentBracketSelect.appendChild(
        placeholder
    );


    resetTournamentFieldOverview();


    if (
        !tournament

        ||

        !Array.isArray(
            tournament.brackets
        )

        ||

        tournament.brackets.length ===
            0
    ) {


                tournamentBracketSelect.disabled =
            true;


        updateTournamentCleanupTools();


        return;

    }


    tournament.brackets.forEach(

        bracket => {


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                bracket.id;


            option.textContent =
                bracket.name;


            tournamentBracketSelect.appendChild(
                option
            );

        }

    );


        tournamentBracketSelect.disabled =
        false;


    updateTournamentCleanupTools();

}

// =================================
// TOURNAMENT BRACKET CREATOR
// =================================


function createTournamentBracketSlug(
    name,
    tournament
) {


    const baseSlug =

        String(
            name || ""
        )
            .trim()
            .toLowerCase()
            .replace(
                /['’]/g,
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

        "new-bracket";


    const brackets =

        tournament

        &&

        Array.isArray(
            tournament.brackets
        )

            ? tournament.brackets

            : [];


    let candidate =
        baseSlug;


    let counter =
        2;


    while (

        brackets.some(
            bracket =>
                bracket.id ===
                candidate
        )

    ) {


        candidate =
            `${baseSlug}-${counter}`;


        counter +=
            1;

    }


    return candidate;

}



function setTournamentBracketCreateMessage(
    message,
    type = "success"
) {


    if (!tournamentBracketCreateMessage) {

        return;

    }


    tournamentBracketCreateMessage.textContent =
        message;


    tournamentBracketCreateMessage.className =

        `cr-save-message ${
            type === "error"

                ? "save-error"

                : "save-success"
        }`;


    tournamentBracketCreateMessage.hidden =
        false;

}



function getTournamentBracketCreateDraft() {


    const tournament =
        getSelectedControlRoomTournament();


    const name =

        tournamentBracketCreateName

            ? tournamentBracketCreateName.value.trim()

            : "";


    const fieldSizeValue =

        tournamentBracketCreateFieldSize

            ? tournamentBracketCreateFieldSize.value.trim()

            : "";


    const participantType =

        tournamentBracketCreateParticipantType

            ? tournamentBracketCreateParticipantType.value

            : "wrestler";


    return {

        id:
            createTournamentBracketSlug(
                name,
                tournament
            ),

        name,

        brand:

            tournamentBracketCreateBrand

                ? tournamentBracketCreateBrand.value

                : "Ascension",

        division:

            tournamentBracketCreateDivision

                ? tournamentBracketCreateDivision.value

                : "Men's Singles",

        fieldSize:

            fieldSizeValue

                ? Number(
                    fieldSizeValue
                )

                : 0,

        fieldUnit:

            participantType === "team"

                ? "Teams"

                : "Competitors",

        participantType,

        participants:
            [],

        fieldLocked:
            false,

        bracketSetup: {

            generated:
                false,

            generatedAt:
                "",

            rounds:
                [],

            winnerId:
                ""

        },

        status:

            tournamentBracketCreateStatus

                ? tournamentBracketCreateStatus.value

                : "Upcoming"

    };

}



function validateTournamentBracketCreateDraft(
    draft
) {


    const tournament =
        getSelectedControlRoomTournament();


    if (!tournament) {

        return "Select a tournament before adding a bracket.";

    }


    if (!draft.name) {

        return "Bracket name is required.";

    }


    if (
        !Number.isInteger(
            draft.fieldSize
        )

        ||

        draft.fieldSize <
            2
    ) {

        return "Enter a valid field size of 2 or more.";

    }


    return "";

}



function appendTournamentBracketCreateReviewRow(
    label,
    value
) {


    if (!tournamentBracketCreateChangeList) {

        return;

    }


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "cr-editor-change-row";


    row.innerHTML = `

        <strong>
            ${label}
        </strong>

        <span>
            ${value || "—"}
        </span>

    `;


    tournamentBracketCreateChangeList.appendChild(
        row
    );

}



function renderTournamentBracketCreatePreview() {


    if (
        !tournamentBracketCreatePreview ||
        !tournamentBracketCreateChangeList ||
        !tournamentBracketCreateSaveButton
    ) {

        return;

    }


    tournamentBracketCreateChangeList.innerHTML =
        "";


    if (tournamentBracketCreateError) {

        tournamentBracketCreateError.hidden =
            true;


        tournamentBracketCreateError.textContent =
            "";

    }


    const draft =
        getTournamentBracketCreateDraft();


    const validationError =
        validateTournamentBracketCreateDraft(
            draft
        );


    appendTournamentBracketCreateReviewRow(
        "DATABASE ID",
        draft.id
    );


    appendTournamentBracketCreateReviewRow(
        "NAME",
        draft.name
    );


    appendTournamentBracketCreateReviewRow(
        "BRAND",
        draft.brand
    );


    appendTournamentBracketCreateReviewRow(
        "DIVISION",
        draft.division
    );


    appendTournamentBracketCreateReviewRow(
        "FIELD SIZE",
        String(
            draft.fieldSize || "—"
        )
    );


    appendTournamentBracketCreateReviewRow(
        "PARTICIPANTS",
        draft.participantType
    );


    appendTournamentBracketCreateReviewRow(
        "STATUS",
        draft.status
    );


    tournamentBracketCreatePreview.hidden =
        false;


    if (validationError) {


        if (tournamentBracketCreateError) {

            tournamentBracketCreateError.textContent =
                validationError;


            tournamentBracketCreateError.hidden =
                false;

        }


        tournamentBracketCreateSaveButton.disabled =
            true;


        return;

    }


    tournamentBracketCreateSaveButton.disabled =
        false;

}



function resetTournamentBracketCreateForm() {


    if (tournamentBracketCreateName) {

        tournamentBracketCreateName.value =
            "";

    }


    if (tournamentBracketCreateBrand) {

        tournamentBracketCreateBrand.value =
            "Ascension";

    }


    if (tournamentBracketCreateDivision) {

        tournamentBracketCreateDivision.value =
            "Men's Singles";

    }


    if (tournamentBracketCreateFieldSize) {

        tournamentBracketCreateFieldSize.value =
            "";

    }


    if (tournamentBracketCreateParticipantType) {

        tournamentBracketCreateParticipantType.value =
            "wrestler";

    }


    if (tournamentBracketCreateStatus) {

        tournamentBracketCreateStatus.value =
            "Upcoming";

    }


    if (tournamentBracketCreatePreview) {

        tournamentBracketCreatePreview.hidden =
            true;

    }


    if (tournamentBracketCreateSaveButton) {

        tournamentBracketCreateSaveButton.disabled =
            true;

    }


    if (tournamentBracketCreateMessage) {

        tournamentBracketCreateMessage.hidden =
            true;

    }

}



async function saveNewTournamentBracket() {


    try {


        const tournament =
            getSelectedControlRoomTournament();


        const draft =
            getTournamentBracketCreateDraft();


        const validationError =
            validateTournamentBracketCreateDraft(
                draft
            );


        if (validationError) {

            setTournamentBracketCreateMessage(
                validationError,
                "error"
            );


            return;

        }


        const tournamentDatabase =
            owlControlRoomData.tournaments;


        if (
            !tournamentDatabase

            ||

            Array.isArray(
                tournamentDatabase
            )

            ||

            !Array.isArray(
                tournamentDatabase.tournaments
            )
        ) {


            setTournamentBracketCreateMessage(
                "The tournament database is not available.",
                "error"
            );


            return;

        }


        const selectedTournamentId =
            tournament.id;


        const updatedTournamentDatabase = {

            ...tournamentDatabase,

            tournaments:

                tournamentDatabase.tournaments.map(

                    storedTournament => {


                        if (
                            storedTournament.id !==
                            selectedTournamentId
                        ) {

                            return storedTournament;

                        }


                        return {

                            ...storedTournament,

                            brackets: [

                                ...(
                                    Array.isArray(
                                        storedTournament.brackets
                                    )

                                        ? storedTournament.brackets

                                        : []
                                ),

                                draft

                            ]

                        };

                    }

                )

        };


        tournamentBracketCreateSaveButton.disabled =
            true;


        await writeTournamentDatabase(
            updatedTournamentDatabase
        );


        await loadRepositoryData(
            owlRepositoryHandle
        );


        if (tournamentSelect) {

            tournamentSelect.value =
                selectedTournamentId;


            populateTournamentBracketSelector();

        }


        if (tournamentBracketSelect) {

            tournamentBracketSelect.value =
                draft.id;


            loadTournamentFieldDraft();
    renderTournamentBracketCreatePreview();
        }


        resetTournamentBracketCreateForm();


        setTournamentBracketCreateMessage(

            `${draft.name} was added to ${tournament.name}.`

        );


    }


    catch (error) {


        console.error(
            "Could not create tournament bracket:",
            error
        );


        setTournamentBracketCreateMessage(
            error.message,
            "error"
        );

    }

}


// =================================
// TOURNAMENT CLEANUP TOOLS
// =================================


function setTournamentCleanupMessage(
    message,
    type = "success"
) {


    if (!tournamentCleanupMessage) {

        return;

    }


    tournamentCleanupMessage.textContent =
        message;


    tournamentCleanupMessage.className =

        `cr-save-message ${
            type === "error"

                ? "save-error"

                : "save-success"
        }`;


    tournamentCleanupMessage.hidden =
        false;

}



function tournamentBracketCanBeDeleted(
    bracket
) {


    if (!bracket) {

        return false;

    }


    const participants =

        Array.isArray(
            bracket.participants
        )

            ? bracket.participants

            : [];


    const bracketSetup =
        getTournamentBracketSetup(
            bracket
        );


    const rounds =

        Array.isArray(
            bracketSetup.rounds
        )

            ? bracketSetup.rounds

            : [];


    return (

        participants.length === 0

        &&

        !bracket.fieldLocked

        &&

        !bracketSetup.generated

        &&

        rounds.length === 0

    );

}



function tournamentCanBeDeleted(
    tournament
) {


    if (!tournament) {

        return false;

    }


    const brackets =

        Array.isArray(
            tournament.brackets
        )

            ? tournament.brackets

            : [];


    return brackets.length === 0;

}



function updateTournamentCleanupTools() {


    const tournament =
        getSelectedControlRoomTournament();


    const bracket =
        getSelectedControlRoomBracket();


    if (tournamentDeleteEmptyBracketButton) {

        tournamentDeleteEmptyBracketButton.disabled =
            !tournamentBracketCanBeDeleted(
                bracket
            );

    }


    if (tournamentDeleteEmptyTournamentButton) {

        tournamentDeleteEmptyTournamentButton.disabled =
            !tournamentCanBeDeleted(
                tournament
            );

    }

}



async function deleteSelectedEmptyBracket() {


    try {


        const tournament =
            getSelectedControlRoomTournament();


        const bracket =
            getSelectedControlRoomBracket();


        if (
            !tournament ||
            !bracket
        ) {

            setTournamentCleanupMessage(
                "Select a tournament and bracket first.",
                "error"
            );


            return;

        }


        if (
            !tournamentBracketCanBeDeleted(
                bracket
            )
        ) {

            setTournamentCleanupMessage(
                "This bracket is not empty, is locked, or already has a generated setup.",
                "error"
            );


            return;

        }


        const confirmation =
            window.prompt(
                `Type DELETE BRACKET to remove "${bracket.name}".`
            );


        if (
            confirmation !==
            "DELETE BRACKET"
        ) {

            setTournamentCleanupMessage(
                "Bracket deletion cancelled.",
                "error"
            );


            return;

        }


        const tournamentDatabase =
            owlControlRoomData.tournaments;


        const updatedTournamentDatabase = {

            ...tournamentDatabase,

            tournaments:

                tournamentDatabase.tournaments.map(
                    storedTournament => {


                        if (
                            storedTournament.id !==
                            tournament.id
                        ) {

                            return storedTournament;

                        }


                        return {

                            ...storedTournament,

                            brackets:

                                (
                                    Array.isArray(
                                        storedTournament.brackets
                                    )

                                        ? storedTournament.brackets

                                        : []
                                ).filter(
                                    storedBracket =>

                                        storedBracket.id !==
                                        bracket.id
                                )

                        };

                    }
                )

        };


        await writeTournamentDatabase(
            updatedTournamentDatabase
        );


        await loadRepositoryData(
            owlRepositoryHandle
        );


        if (tournamentSelect) {

            tournamentSelect.value =
                tournament.id;


            populateTournamentBracketSelector();

        }


        updateTournamentCleanupTools();


        setTournamentCleanupMessage(
            `${bracket.name} was removed from ${tournament.name}.`
        );

    }


    catch (error) {


        console.error(
            "Could not delete tournament bracket:",
            error
        );


        setTournamentCleanupMessage(
            error.message,
            "error"
        );

    }

}



async function deleteSelectedEmptyTournament() {


    try {


        const tournament =
            getSelectedControlRoomTournament();


        if (!tournament) {

            setTournamentCleanupMessage(
                "Select a tournament first.",
                "error"
            );


            return;

        }


        if (
            !tournamentCanBeDeleted(
                tournament
            )
        ) {

            setTournamentCleanupMessage(
                "This tournament still has brackets. Delete empty brackets first.",
                "error"
            );


            return;

        }


        const confirmation =
            window.prompt(
                `Type DELETE TOURNAMENT to remove "${tournament.name}".`
            );


        if (
            confirmation !==
            "DELETE TOURNAMENT"
        ) {

            setTournamentCleanupMessage(
                "Tournament deletion cancelled.",
                "error"
            );


            return;

        }


        const tournamentDatabase =
            owlControlRoomData.tournaments;


        const updatedTournamentDatabase = {

            ...tournamentDatabase,

            tournaments:

                tournamentDatabase.tournaments.filter(
                    storedTournament =>

                        storedTournament.id !==
                        tournament.id
                )

        };


        await writeTournamentDatabase(
            updatedTournamentDatabase
        );


        await loadRepositoryData(
            owlRepositoryHandle
        );


        updateTournamentCleanupTools();


        setTournamentCleanupMessage(
            `${tournament.name} was removed from data/tournaments.json.`
        );

    }


    catch (error) {


        console.error(
            "Could not delete tournament:",
            error
        );


        setTournamentCleanupMessage(
            error.message,
            "error"
        );

    }

}



// =================================
// TOURNAMENT CREATOR
// =================================


function createTournamentSlug(
    name,
    year
) {


    const baseSlug =

        String(
            name || ""
        )
            .trim()
            .toLowerCase()
            .replace(
                /['’]/g,
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

        "new-tournament";


    const yearSuffix =

        year

            ? `-${year}`

            : "";


    let candidate =

        `${baseSlug}${yearSuffix}`;


    const tournaments =
        getControlRoomTournaments();


    let counter =
        2;


    while (

        tournaments.some(
            tournament =>
                tournament.id ===
                candidate
        )

    ) {


        candidate =

            `${baseSlug}${yearSuffix}-${counter}`;


        counter +=
            1;

    }


    return candidate;

}



function setTournamentCreateMessage(
    message,
    type = "success"
) {


    if (!tournamentCreateMessage) {

        return;

    }


    tournamentCreateMessage.textContent =
        message;


    tournamentCreateMessage.className =

        `cr-save-message ${
            type === "error"

                ? "save-error"

                : "save-success"
        }`;


    tournamentCreateMessage.hidden =
        false;

}



function getTournamentCreateDraft() {


    const name =

        tournamentCreateName

            ? tournamentCreateName.value.trim()

            : "";


    const yearValue =

        tournamentCreateYear

            ? tournamentCreateYear.value.trim()

            : "";


    const year =

        yearValue

            ? Number(
                yearValue
            )

            : new Date().getFullYear();


    const status =

        tournamentCreateStatusSelect

            ? tournamentCreateStatusSelect.value

            : "Upcoming";


    const badge =

        tournamentCreateBadge

            ? tournamentCreateBadge.value.trim()

            : "";


    const purpose =

        tournamentCreatePurpose

            ? tournamentCreatePurpose.value.trim()

            : "";


    return {

        id:
            createTournamentSlug(
                name,
                year
            ),

        name,

        year,

        status,

        badge,

        purpose,

        image:
            "",

        directoryStats:
            [],

        brackets:
            []

    };

}



function validateTournamentCreateDraft(
    draft
) {


    if (!draft.name) {

        return "Tournament name is required.";

    }


    if (
        !Number.isInteger(
            draft.year
        )

        ||

        draft.year <
            2026
    ) {

        return "Enter a valid tournament year.";

    }


    return "";

}



function appendTournamentCreateReviewRow(
    label,
    value
) {


    if (!tournamentCreateChangeList) {

        return;

    }


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "cr-editor-change-row";


    row.innerHTML = `

        <strong>
            ${label}
        </strong>

        <span>
            ${value || "—"}
        </span>

    `;


    tournamentCreateChangeList.appendChild(
        row
    );

}



function renderTournamentCreatePreview() {


    if (
        !tournamentCreatePreview ||
        !tournamentCreateChangeList ||
        !tournamentCreateSaveButton
    ) {

        return;

    }


    tournamentCreateChangeList.innerHTML =
        "";


    if (tournamentCreateError) {

        tournamentCreateError.hidden =
            true;


        tournamentCreateError.textContent =
            "";

    }


    const draft =
        getTournamentCreateDraft();


    const validationError =
        validateTournamentCreateDraft(
            draft
        );


    appendTournamentCreateReviewRow(
        "DATABASE ID",
        draft.id
    );


    appendTournamentCreateReviewRow(
        "NAME",
        draft.name
    );


    appendTournamentCreateReviewRow(
        "YEAR",
        String(
            draft.year
        )
    );


    appendTournamentCreateReviewRow(
        "STATUS",
        draft.status
    );


    appendTournamentCreateReviewRow(
        "BADGE",
        draft.badge
    );


    appendTournamentCreateReviewRow(
        "BRACKETS",
        "0 — add brackets after creation"
    );


    tournamentCreatePreview.hidden =
        false;


    if (validationError) {


        if (tournamentCreateError) {

            tournamentCreateError.textContent =
                validationError;


            tournamentCreateError.hidden =
                false;

        }


        tournamentCreateSaveButton.disabled =
            true;


        if (tournamentCreateStatus) {

            tournamentCreateStatus.textContent =
                "NEEDS INFO";

        }


        return;

    }


    tournamentCreateSaveButton.disabled =
        false;


    if (tournamentCreateStatus) {

        tournamentCreateStatus.textContent =
            "READY TO SAVE";

    }

}



function resetTournamentCreateForm() {


    if (tournamentCreateName) {

        tournamentCreateName.value =
            "";

    }


    if (tournamentCreateYear) {

        tournamentCreateYear.value =
            String(
                new Date().getFullYear()
            );

    }


    if (tournamentCreateStatusSelect) {

        tournamentCreateStatusSelect.value =
            "Upcoming";

    }


    if (tournamentCreateBadge) {

        tournamentCreateBadge.value =
            "";

    }


    if (tournamentCreatePurpose) {

        tournamentCreatePurpose.value =
            "";

    }


    if (tournamentCreatePreview) {

        tournamentCreatePreview.hidden =
            true;

    }


    if (tournamentCreateSaveButton) {

        tournamentCreateSaveButton.disabled =
            true;

    }


    if (tournamentCreateMessage) {

        tournamentCreateMessage.hidden =
            true;

    }


    if (tournamentCreateStatus) {

        tournamentCreateStatus.textContent =
            "READY";

    }

}



function toggleTournamentCreatorMode() {


    const isCreateMode =

        tournamentManagerMode

        &&

        tournamentManagerMode.value ===
            "create";


    if (tournamentCreateForm) {

        tournamentCreateForm.hidden =
            !isCreateMode;

    }


    if (isCreateMode) {

        renderTournamentCreatePreview();

    }


    else {

        resetTournamentCreateForm();

    }

}



async function saveNewTournament() {


    try {


        const draft =
            getTournamentCreateDraft();


        const validationError =
            validateTournamentCreateDraft(
                draft
            );


        if (validationError) {

            setTournamentCreateMessage(
                validationError,
                "error"
            );


            return;

        }


        if (
            !owlControlRoomData.tournaments

            ||

            Array.isArray(
                owlControlRoomData.tournaments
            )

            ||

            typeof owlControlRoomData.tournaments !==
                "object"

            ||

            !Array.isArray(
                owlControlRoomData.tournaments.tournaments
            )
        ) {


            owlControlRoomData.tournaments = {

                tournaments:
                    []

            };

        }


        const tournamentDatabase =
            owlControlRoomData.tournaments;


        tournamentDatabase.tournaments.push(
            draft
        );


        await writeTournamentDatabase(
            tournamentDatabase
        );


        initializeTournamentFieldManager();


        if (tournamentSelect) {

            tournamentSelect.value =
                draft.id;


            populateTournamentBracketSelector();

        }


        if (tournamentManagerMode) {

            tournamentManagerMode.value =
                "edit";

        }


        toggleTournamentCreatorMode();


        setTournamentCreateMessage(

            `${draft.name} was added to data/tournaments.json.`

        );


    }


    catch (error) {


        console.error(
            "Could not create tournament:",
            error
        );


        setTournamentCreateMessage(
            error.message,
            "error"
        );

    }

}



function initializeTournamentFieldManager() {

    if (tournamentManagerMode) {

        tournamentManagerMode.value =
            "edit";

    }


    toggleTournamentCreatorMode();


    const tournaments =
        getControlRoomTournaments();


    tournamentSelect.innerHTML =
        "";


    const placeholder =
        document.createElement(
            "option"
        );


    placeholder.value =
        "";


    placeholder.textContent =

        tournaments.length > 0

            ? "Select Tournament"

            : "No Tournaments Available";


    tournamentSelect.appendChild(
        placeholder
    );


    tournaments.forEach(

        tournament => {


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                tournament.id;


            option.textContent =

                tournament.year

                    ? `${tournament.name} (${tournament.year})`

                    : tournament.name;


            tournamentSelect.appendChild(
                option
            );

        }

    );


    tournamentSelect.disabled =

        tournaments.length ===
        0;


    tournamentBracketSelect.innerHTML =
        `

            <option value="">
                Select Tournament First
            </option>

        `;


    tournamentBracketSelect.disabled =
        true;


    resetTournamentFieldOverview();


        tournamentFieldStatus.textContent =

        tournaments.length > 0

            ? "READY"

            : "NO DATA";


    updateTournamentCleanupTools();

}

// =================================
// CONNECT NEW FOLDER
// =================================


async function connectRepository() {


    try {


        const handle =
            await window.showDirectoryPicker({

                mode:
                    "readwrite"

            });


        const hasPermission =
            await hasRepositoryPermission(
                handle
            );


        if (!hasPermission) {


            setConnectionMessage(

                "Folder permission was not granted."

            );


            return;

        }


        owlRepositoryHandle =
            handle;


        await saveRepositoryHandle(
            handle
        );


        reconnectButton.hidden =
            true;


        await loadRepositoryData(
            handle
        );


    }


    catch (error) {


        if (
            error.name === "AbortError"
        ) {

            return;

        }


        console.error(
            "Could not connect repository:",
            error
        );


        setConnectionStatus(
            "status-warning",
            "CONNECTION ERROR"
        );


        setConnectionMessage(

            "The folder could not be connected. Try selecting the OWL repository again."

        );

    }

}



// =================================
// RECONNECT SAVED FOLDER
// =================================


async function reconnectSavedRepository() {


    if (
        !owlRepositoryHandle
    ) {

        return;

    }


    try {


        const hasPermission =
            await hasRepositoryPermission(
                owlRepositoryHandle
            );


        if (!hasPermission) {


            setConnectionMessage(

                "Permission was not granted for the saved OWL folder."

            );


            return;

        }


        reconnectButton.hidden =
            true;


        await loadRepositoryData(
            owlRepositoryHandle
        );


    }


    catch (error) {


        console.error(
            "Could not reconnect repository:",
            error
        );


        setConnectionMessage(

            "The saved folder could not be reopened. Use Connect OWL Folder to select it again."

        );

    }

}



// =================================
// INITIALIZE
// =================================


async function initializeControlRoom() {


    if (
        !checkBrowserSupport()
    ) {

        return;

    }


    const savedHandle =
        await loadSavedRepositoryHandle();


    if (
        savedHandle
    ) {


        owlRepositoryHandle =
            savedHandle;


        reconnectButton.hidden =
            false;


        repoName.textContent =
            savedHandle.name;


        setConnectionMessage(

            "A saved OWL repository was found. Click Reconnect Saved Folder to continue."

        );



        try {


            const permission =
                await savedHandle.queryPermission({

                    mode:
                        "readwrite"

                });


            if (
                permission === "granted"
            ) {


                reconnectButton.hidden =
                    true;


                await loadRepositoryData(
                    savedHandle
                );

            }

        }


        catch (error) {


            console.warn(
                "Could not check saved folder permission:",
                error
            );

        }

    }

}


// =================================
// TOURNAMENT BRACKET SETUP GLOBAL SAVE FIX
// =================================


function validateTournamentBracketSetupDraft(
    bracket
) {


    if (
        !bracket
    ) {

        return "Select a championship bracket.";

    }


    const savedBracketSetup =
        getTournamentBracketSetup(
            bracket
        );


    if (
        savedBracketSetup.generated
    ) {

        return "A saved bracket setup already exists.";

    }


    if (
        !bracket.fieldLocked
    ) {

        return "Lock the completed participant field before saving the bracket setup.";

    }


    const fieldSize =

        Number(
            bracket.fieldSize || 0
        );


    const storedParticipants =
        getStoredTournamentParticipants(
            bracket
        );


    if (
        storedParticipants.length !==
        fieldSize
    ) {

        return "The saved participant field is not complete.";

    }


    if (
        !tournamentBracketSetupDraft

        ||

        !Array.isArray(
            tournamentBracketSetupDraft.rounds
        )
    ) {

        return "Generate a bracket preview before saving.";

    }


    const structure =
        getTournamentBracketStructure(
            fieldSize
        );


    const rounds =
        tournamentBracketSetupDraft.rounds;


    if (
        rounds.length !==
        structure.totalRounds
    ) {

        return "The bracket preview has an incorrect number of rounds.";

    }


    for (
        let roundIndex =
            0;

        roundIndex <
            rounds.length;

        roundIndex +=
            1
    ) {


        const round =
            rounds[
                roundIndex
            ];


        const expectedMatchCount =

            structure.bracketSize

            /

            (
                2 ** (
                    roundIndex +
                    1
                )
            );


        if (
            !Array.isArray(
                round.matches
            )

            ||

            round.matches.length !==
                expectedMatchCount
        ) {

            return `${round.name || `Round ${roundIndex + 1}`} has an incorrect number of matches.`;

        }

    }


    const openingRound =
        rounds[0];


    const openingParticipantIds =

        openingRound.matches.flatMap(

            match => [

                match.participantOneId,

                match.participantTwoId

            ]

        )

            .filter(
                Boolean
            );


    if (
        openingParticipantIds.length !==
        fieldSize
    ) {

        return "The opening round does not contain the complete participant field.";

    }


    const uniqueOpeningParticipantIds =
        new Set(
            openingParticipantIds
        );


    if (
        uniqueOpeningParticipantIds.size !==
        openingParticipantIds.length
    ) {

        return "The bracket preview contains a duplicate participant.";

    }


    const storedParticipantSet =
        new Set(
            storedParticipants
        );


    if (
        openingParticipantIds.some(

            participantId =>

                !storedParticipantSet.has(
                    participantId
                )

        )
    ) {

        return "The bracket preview contains a participant outside the saved field.";

    }


    const byeMatches =

        openingRound.matches.filter(

            match =>
                match.isBye
        );


    if (
        byeMatches.length !==
        structure.byeCount
    ) {

        return "The bracket preview has an incorrect number of byes.";

    }


    const invalidByeMatch =

        byeMatches.find(

            match =>

                !match.participantOneId

                ||

                Boolean(
                    match.participantTwoId
                )

                ||

                match.winnerId !==
                    match.participantOneId

                ||

                match.status !==
                    "bye"

        );


    if (
        invalidByeMatch
    ) {

        return "One or more bracket byes are invalid.";

    }


    const invalidOpeningMatch =

        openingRound.matches.find(

            match =>

                !match.isBye

                &&

                (
                    !match.participantOneId

                    ||

                    !match.participantTwoId
                )

        );


    if (
        invalidOpeningMatch
    ) {

        return "One or more opening-round matchups are incomplete.";

    }


    return "";

}



async function saveTournamentBracketSetup() {


    const tournament =
        getSelectedControlRoomTournament();


    const bracket =
        getSelectedControlRoomBracket();


    if (
        !tournament

        ||

        !bracket
    ) {

        return;

    }


    const validationError =
        validateTournamentBracketSetupDraft(
            bracket
        );


    if (
        validationError
    ) {


        tournamentBracketSetupMessage.textContent =
            validationError;


        tournamentBracketSetupMessage.hidden =
            false;


        tournamentBracketSaveButton.disabled =
            true;


        return;

    }


    const confirmed =
        window.confirm(

            `Save the ${bracket.name} bracket setup as official? The participant field cannot be reopened while this setup exists.`

        );


    if (
        !confirmed
    ) {

        return;

    }


    const tournamentDatabase =
        owlControlRoomData.tournaments;


    if (
        !tournamentDatabase

        ||

        Array.isArray(
            tournamentDatabase
        )

        ||

        !Array.isArray(
            tournamentDatabase.tournaments
        )
    ) {


        tournamentBracketSetupMessage.textContent =
            "The tournament database is not available.";


        tournamentBracketSetupMessage.hidden =
            false;


        return;

    }


    const selectedTournamentId =
        tournament.id;


    const selectedBracketId =
        bracket.id;


    const savedRounds =

        tournamentBracketSetupDraft.rounds.map(

            round => ({

                ...round,

                matches:

                    round.matches.map(

                        match => ({

                            ...match

                        })

                    )

            })

        );


    const updatedTournamentDatabase = {

        ...tournamentDatabase,

        tournaments:

            tournamentDatabase.tournaments.map(

                storedTournament => {


                    if (
                        storedTournament.id !==
                        selectedTournamentId
                    ) {

                        return storedTournament;

                    }


                    return {

                        ...storedTournament,

                        brackets:

                            Array.isArray(
                                storedTournament.brackets
                            )

                                ? storedTournament.brackets.map(

                                    storedBracket => {


                                        if (
                                            storedBracket.id !==
                                            selectedBracketId
                                        ) {

                                            return storedBracket;

                                        }


                                        return {

                                            ...storedBracket,

                                            bracketSetup: {

                                                generated:
                                                    true,

                                                generatedAt:
                                                    new Date().toISOString(),

                                                rounds:
                                                    savedRounds,

                                                winnerId:
                                                    ""

                                            }

                                        };

                                    }

                                )

                                : []

                    };

                }

            )

    };


    tournamentBracketPreviewButton.disabled =
        true;


    tournamentBracketSaveButton.disabled =
        true;


    tournamentFieldLockButton.disabled =
        true;


    tournamentFieldStatus.textContent =
        "SAVING SETUP";


    tournamentBracketSetupMessage.hidden =
        true;


    try {


        await writeTournamentDatabase(
            updatedTournamentDatabase
        );


        await loadRepositoryData(
            owlRepositoryHandle
        );


        tournamentSelect.value =
            selectedTournamentId;


        populateTournamentBracketSelector();


        tournamentBracketSelect.value =
            selectedBracketId;


        loadTournamentFieldDraft();


        tournamentFieldStatus.textContent =
            "READY";


        tournamentBracketSetupMessage.textContent =
            "Bracket setup saved successfully.";


        tournamentBracketSetupMessage.hidden =
            false;


    }


    catch (
        error
    ) {


        console.error(

            "Could not save tournament bracket setup:",

            error

        );


        tournamentFieldStatus.textContent =
            "ERROR";


        tournamentBracketSetupMessage.textContent =

            error.message

            ||

            "The bracket setup could not be saved.";


        tournamentBracketSetupMessage.hidden =
            false;


        renderTournamentFieldOverview();

    }

}
// =================================
// BUTTON EVENTS
// =================================


connectButton.addEventListener(
    "click",
    connectRepository
);


reconnectButton.addEventListener(
    "click",
    reconnectSavedRepository
);


window.addEventListener(

    "owl-control-room-data-loaded",

    initializeTournamentFieldManager

);
window.addEventListener(

    "owl-control-room-data-loaded",

    initializeSignatureSeriesManager

);
if (tournamentManagerMode) {

    tournamentManagerMode.addEventListener(
        "change",
        toggleTournamentCreatorMode
    );

}


[
    tournamentCreateName,
    tournamentCreateYear,
    tournamentCreateStatusSelect,
    tournamentCreateBadge,
    tournamentCreatePurpose
].forEach(
    field => {


        if (!field) {

            return;

        }


        field.addEventListener(
            "input",
            renderTournamentCreatePreview
        );


        field.addEventListener(
            "change",
            renderTournamentCreatePreview
        );

    }
);


if (tournamentCreateSaveButton) {

    tournamentCreateSaveButton.addEventListener(
        "click",
        saveNewTournament
    );

}
[
    tournamentBracketCreateName,
    tournamentBracketCreateBrand,
    tournamentBracketCreateDivision,
    tournamentBracketCreateFieldSize,
    tournamentBracketCreateParticipantType,
    tournamentBracketCreateStatus
].forEach(
    field => {


        if (!field) {

            return;

        }


        field.addEventListener(
            "input",
            renderTournamentBracketCreatePreview
        );


        field.addEventListener(
            "change",
            renderTournamentBracketCreatePreview
        );

    }
);


if (tournamentBracketCreateSaveButton) {

    tournamentBracketCreateSaveButton.addEventListener(
        "click",
        saveNewTournamentBracket
    );

}
if (tournamentDeleteEmptyBracketButton) {

    tournamentDeleteEmptyBracketButton.addEventListener(
        "click",
        deleteSelectedEmptyBracket
    );

}


if (tournamentDeleteEmptyTournamentButton) {

    tournamentDeleteEmptyTournamentButton.addEventListener(
        "click",
        deleteSelectedEmptyTournament
    );

}


if (tournamentSelect) {

    tournamentSelect.addEventListener(
        "change",
        updateTournamentCleanupTools
    );

}


if (tournamentBracketSelect) {

    tournamentBracketSelect.addEventListener(
        "change",
        updateTournamentCleanupTools
    );

}

if (tournamentSelect) {

    tournamentSelect.addEventListener(
        "change",
        renderTournamentBracketCreatePreview
    );

}


tournamentSelect.addEventListener(

    "change",

    populateTournamentBracketSelector

);


tournamentBracketSelect.addEventListener(

    "change",

    loadTournamentFieldDraft

);

tournamentParticipantSearch.addEventListener(

    "input",

    renderTournamentEligibleParticipants

);


tournamentFieldSaveButton.addEventListener(

    "click",

    saveTournamentParticipantField

);


tournamentFieldLockButton.addEventListener(

    "click",

    toggleTournamentParticipantFieldLock

);


tournamentBracketPreviewButton.addEventListener(

    "click",

    generateTournamentBracketPreview

);


tournamentBracketSaveButton.addEventListener(

    "click",

    saveTournamentBracketSetup

);


tournamentMatchSelect.addEventListener(

    "change",

    renderTournamentMatchBookingSelection

);


tournamentMatchEvent.addEventListener(

    "change",

    handleTournamentMatchEventChange

);


tournamentMatchOrder.addEventListener(

    "input",

    refreshTournamentMatchBookingDetails

);


tournamentLoadMatchBookerButton.addEventListener(

    "click",

    loadTournamentMatchIntoMatchBooker

);



[
    signaturePowerType,
    signaturePowerName,
    signaturePowerStatus,
    signaturePowerSource,
    signaturePowerBrand,
    signaturePowerDivision,
    signaturePowerExpires,
    signaturePowerDescription,
    signaturePowerNotes
].forEach(
    field => {


        if (!field) {

            return;

        }


        field.addEventListener(
            "input",
            renderSignaturePowerPreview
        );


        field.addEventListener(
            "change",
            renderSignaturePowerPreview
        );

    }
);


if (signaturePowerSaveButton) {

    signaturePowerSaveButton.addEventListener(
        "click",
        saveSignaturePowerEntry
    );

}


if (signaturePowerEntrySelect) {

    signaturePowerEntrySelect.addEventListener(
        "change",
        () => {


            updateSignaturePowerDeleteButton();


            renderSignaturePowerCompletePreview();

        }
    );

}


if (signaturePowerDeleteButton) {

    signaturePowerDeleteButton.addEventListener(
        "click",
        deleteSelectedSignaturePowerEntry
    );

}
[
    signaturePowerCompleteDate,
    signaturePowerCompleteResult
].forEach(
    field => {


        if (!field) {

            return;

        }


        field.addEventListener(
            "input",
            renderSignaturePowerCompletePreview
        );


        field.addEventListener(
            "change",
            renderSignaturePowerCompletePreview
        );

    }
);


if (signaturePowerCompleteButton) {

    signaturePowerCompleteButton.addEventListener(
        "click",
        completeSelectedSignaturePowerEntry
    );

}


// =================================
// START
// WAIT UNTIL EVERY CONTROL ROOM
// MODULE HAS LOADED
// =================================

window.addEventListener(

    "load",

    () => {

        initializeControlRoom();

    },

    {
        once:
            true
    }

);
