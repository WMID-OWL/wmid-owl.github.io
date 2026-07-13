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

                    databaseFile.collectionKey

                        ? {

                            [
                                databaseFile.collectionKey
                            ]: []

                        }

                        : [];


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
// TOURNAMENT FIELD MANAGER
// =================================


const tournamentFieldStatus =

    document.getElementById(
        "cr-tournament-field-status"
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


let tournamentFieldDraftParticipants =
    [];


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


    setTournamentManagerEmptyMessage(

        tournamentBracketSetupPreview,

        structure.byeCount > 0

            ? `This field is ready for bracket setup. The opening round will contain ${structure.openingMatchCount} matches and ${structure.byeCount} byes.`

            : `This field is ready for bracket setup. The opening round will contain ${structure.openingMatchCount} matches.`

    );

}

function resetTournamentFieldOverview() {


    tournamentFieldDraftParticipants =
        [];


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

}



function initializeTournamentFieldManager() {


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


window.addEventListener(

    "owl-control-room-data-loaded",

    initializeTournamentFieldManager

);


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



// =================================
// START
// =================================

initializeControlRoom();
