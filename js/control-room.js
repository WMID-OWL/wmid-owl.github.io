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
        key: "announcedMatches",
        fileName: "announced-matches.json",
        label: "Announced Matches"
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


async function readJsonFile(
    dataDirectory,
    fileName
) {


    const fileHandle =
        await dataDirectory.getFileHandle(
            fileName
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
        !Array.isArray(
            parsed
        )
    ) {


        throw new Error(
            `${fileName} must contain a JSON array.`
        );

    }


    return parsed;

}



// =================================
// LOAD REPOSITORY DATA
// =================================


async function loadRepositoryData(
    repositoryHandle
) {


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


                const data =
                    await readJsonFile(

                        dataDirectory,

                        databaseFile.fileName

                    );


                owlControlRoomData[
                    databaseFile.key
                ] = data;


                fileResults.push({

                    ...databaseFile,

                    success:
                        true,

                    count:
                        data.length,

                    error:
                        ""

                });


            }


            catch (error) {


                owlControlRoomData[
                    databaseFile.key
                ] = [];


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
            "0 / 8 valid";


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



// =================================
// START
// =================================


initializeControlRoom();
