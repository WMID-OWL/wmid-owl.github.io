(() => {
    "use strict";

    const mediaPanel = document.getElementById("cr-tool-media");
    const mediaTypeSelect = document.getElementById("cr-media-type");
    const mediaStatus = document.getElementById("cr-media-status");
    const standardRecordField = document.getElementById("cr-media-standard-record-field");
    const standardPathField = document.getElementById("cr-media-standard-path-field");
    const standardWorkflow = document.getElementById("cr-media-standard-workflow");
    const workflow = document.getElementById("cr-match-card-workflow");

    const eventSelect = document.getElementById("cr-match-card-event");
    const matchSelect = document.getElementById("cr-match-card-match");
    const currentPath = document.getElementById("cr-match-card-current-path");
    const fileInput = document.getElementById("cr-match-card-file");
    const layoutSelect = document.getElementById("cr-match-card-layout");

    const previewFrame = document.getElementById("cr-match-card-preview-frame");
    const previewImage = document.getElementById("cr-match-card-preview-image");
    const previewEmpty = document.getElementById("cr-match-card-preview-empty");
    const detectedValue = document.getElementById("cr-match-card-detected");
    const originalDimensions = document.getElementById("cr-match-card-original-dimensions");
    const optimizedDimensions = document.getElementById("cr-match-card-optimized-dimensions");
    const optimizedSize = document.getElementById("cr-match-card-optimized-size");
    const destinationPath = document.getElementById("cr-match-card-destination-path");

    const review = document.getElementById("cr-match-card-review");
    const reviewList = document.getElementById("cr-match-card-review-list");
    const errorMessage = document.getElementById("cr-match-card-error");
    const saveButton = document.getElementById("cr-match-card-save");
    const removeButton = document.getElementById("cr-match-card-remove");
    const message = document.getElementById("cr-match-card-message");

    if (!mediaTypeSelect || !workflow || !eventSelect || !matchSelect || !fileInput) {
        return;
    }

    const MATCH_CARD_TYPE = "matchCards";
    const WEBP_QUALITY = 0.9;

    let selectedSource = null;
    let selectedFile = null;
    let processedBlob = null;
    let processedMeta = null;
    let previewObjectUrl = "";

    function cleanText(value) {
        return String(value || "").trim();
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setStatus(value) {
        if (mediaStatus) {
            mediaStatus.textContent = value;
        }
    }

    function clearMessage() {
        if (!message) {
            return;
        }

        message.hidden = true;
        message.textContent = "";
        message.className = "cr-save-message";
    }

    function showMessage(value, type = "success") {
        if (!message) {
            return;
        }

        message.textContent = value;
        message.className =
            `cr-save-message ${
                type === "error"
                    ? "save-error"
                    : "save-success"
            }`;

        message.hidden = false;
    }

    function clearError() {
        if (!errorMessage) {
            return;
        }

        errorMessage.hidden = true;
        errorMessage.textContent = "";
    }

    function showError(value) {
        if (errorMessage) {
            errorMessage.textContent = value;
            errorMessage.hidden = false;
        }

        if (review) {
            review.hidden = false;
        }

        if (saveButton) {
            saveButton.disabled = true;
        }

        setStatus("CHECK FILE");
    }

    function isActive() {
        return mediaTypeSelect.value === MATCH_CARD_TYPE;
    }

    function revokePreviewUrl() {
        if (!previewObjectUrl) {
            return;
        }

        URL.revokeObjectURL(previewObjectUrl);
        previewObjectUrl = "";
    }

    function clearPreviewImage() {
        revokePreviewUrl();

        if (previewImage) {
            previewImage.removeAttribute("src");
            previewImage.hidden = true;
        }

        if (previewEmpty) {
            previewEmpty.hidden = false;
        }

        if (previewFrame) {
            previewFrame.dataset.orientation = "square";
        }
    }

    function formatFileSize(bytes) {
        const value = Number(bytes || 0);

        if (!value) {
            return "—";
        }

        if (value < 1024) {
            return `${value} B`;
        }

        if (value < 1024 * 1024) {
            return `${(value / 1024).toFixed(1)} KB`;
        }

        return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    }

    function titleCase(value) {
        const text = cleanText(value);

        return text
            ? text.charAt(0).toUpperCase() + text.slice(1)
            : "—";
    }

        function formatEventSchedule(
        event
    ) {
        if (
            window.OWLCalendar
            &&
            typeof window.OWLCalendar
                .formatEventSlot ===
                "function"
        ) {
            return window.OWLCalendar
                .formatEventSlot(
                    event
                );
        }

        return "Schedule Not Set";
    }


    function compareEvents(
        eventA,
        eventB
    ) {
        if (
            window.OWLCalendar
            &&
            typeof window.OWLCalendar
                .compareEvents ===
                "function"
        ) {
            return window.OWLCalendar
                .compareEvents(
                    eventA,
                    eventB
                );
        }

        return String(
            eventA?.name || ""
        ).localeCompare(
            String(
                eventB?.name || ""
            )
        );
    }

    function getWrestlerName(wrestlerId) {
        const wrestlers =
            Array.isArray(
                owlControlRoomData?.wrestlers
            )
                ? owlControlRoomData.wrestlers
                : [];

        const wrestler =
            wrestlers.find(
                item =>
                    item.id === wrestlerId
            );

        return wrestler
            ? wrestler.name
            : wrestlerId;
    }

    function memberSignature(memberIds) {
        return [...memberIds]
            .sort()
            .join("|");
    }

    function getOfficialTeam(wrestlerIds) {
        if (
            !Array.isArray(wrestlerIds)
            ||
            wrestlerIds.length !== 2
        ) {
            return null;
        }

        const teams =
            Array.isArray(
                owlControlRoomData?.teams
            )
                ? owlControlRoomData.teams
                : [];

        const signature =
            memberSignature(wrestlerIds);

        return teams.find(
            team =>
                Array.isArray(team.members)
                &&
                team.members.length === 2
                &&
                memberSignature(team.members) === signature
        ) || null;
    }

    function formatSide(side) {
        const wrestlerIds =
            Array.isArray(side?.wrestlers)
                ? side.wrestlers
                : [];

        const officialTeam =
            getOfficialTeam(wrestlerIds);

        if (officialTeam) {
            return officialTeam.name;
        }

        return wrestlerIds
            .map(getWrestlerName)
            .join(" & ");
    }

    function formatMatch(match) {
        if (
            !match
            ||
            !Array.isArray(match.sides)
        ) {
            return (
                cleanText(
                    match?.stipulation
                    ||
                    match?.matchType
                )
                ||
                "Unknown Match"
            );
        }

        const competitors =
            match.sides
                .map(formatSide)
                .filter(Boolean)
                .join(" vs. ");

        return (
            competitors
            ||
            cleanText(
                match.stipulation
                ||
                match.matchType
            )
            ||
            "Unknown Match"
        );
    }

    function eventRecords() {
        return Array.isArray(
            owlControlRoomData?.events
        )
            ? owlControlRoomData.events
            : [];
    }

    function allMatchSources() {
        const announced =
            Array.isArray(
                owlControlRoomData?.announcedMatches
            )
                ? owlControlRoomData.announcedMatches
                : [];

        const completed =
            Array.isArray(
                owlControlRoomData?.matches
            )
                ? owlControlRoomData.matches
                : [];

        return [
            ...announced.map(
                match => ({
                    match,
                    fileName:
                        "announced-matches.json",
                    sourceLabel:
                        "Announced"
                })
            ),

            ...completed.map(
                match => ({
                    match,
                    fileName:
                        "matches.json",
                    sourceLabel:
                        "Completed"
                })
            )
        ];
    }

    function matchSourcesForEvent(eventId) {
        return allMatchSources()
            .filter(
                source =>
                    source.match.eventId === eventId
            )
            .sort(
                (a, b) =>
                    Number(a.match.order || 0)
                    -
                    Number(b.match.order || 0)
            );
    }

    function selectedEvent() {
        return eventRecords().find(
            event =>
                event.id === eventSelect.value
        ) || null;
    }

    function getSelectedSource() {
        const eventId =
            eventSelect.value;

        const matchId =
            matchSelect.value;

        if (!eventId || !matchId) {
            return null;
        }

        return matchSourcesForEvent(
            eventId
        ).find(
            source =>
                source.match.id === matchId
        ) || null;
    }

    function getGraphic(match) {
        const graphic =
            match?.matchGraphic;

        if (
            graphic
            &&
            !Array.isArray(graphic)
            &&
            typeof graphic === "object"
        ) {
            return graphic;
        }

        if (
            typeof graphic === "string"
            &&
            graphic.trim()
        ) {
            return {
                src:
                    graphic.trim()
            };
        }

        return null;
    }

    function destinationFor(source) {
        const eventId =
            cleanText(
                source?.match?.eventId
            );

        const matchId =
            cleanText(
                source?.match?.id
            );

        if (!eventId || !matchId) {
            return "";
        }

        return `assets/images/match-cards/${eventId}/${matchId}.webp`;
    }

    function detectOrientation(
        width,
        height
    ) {
        const ratio =
            Number(width)
            /
            Number(height);

        if (ratio >= 1.15) {
            return "landscape";
        }

        if (ratio <= 0.87) {
            return "portrait";
        }

        return "square";
    }

    function selectedOrientation() {
        const override =
            cleanText(
                layoutSelect?.value
            );

        if (
            override
            &&
            override !== "auto"
        ) {
            return override;
        }

        return (
            processedMeta?.detectedOrientation
            ||
            getGraphic(
                selectedSource?.match
            )?.orientation
            ||
            "square"
        );
    }

    function getOutputBounds(orientation) {
        if (orientation === "landscape") {
            return {
                maxWidth: 1600,
                maxHeight: 1200
            };
        }

        if (orientation === "portrait") {
            return {
                maxWidth: 1200,
                maxHeight: 1600
            };
        }

        return {
            maxWidth: 1400,
            maxHeight: 1400
        };
    }

    function calculateOutputDimensions(
        width,
        height,
        orientation
    ) {
        const bounds =
            getOutputBounds(orientation);

        const scale =
            Math.min(
                1,
                bounds.maxWidth / width,
                bounds.maxHeight / height
            );

        return {
            width:
                Math.max(
                    1,
                    Math.round(width * scale)
                ),

            height:
                Math.max(
                    1,
                    Math.round(height * scale)
                )
        };
    }

    function loadImage(file) {
        return new Promise(
            (
                resolve,
                reject
            ) => {
                const objectUrl =
                    URL.createObjectURL(file);

                const image =
                    new Image();

                image.onload =
                    () => {
                        URL.revokeObjectURL(
                            objectUrl
                        );

                        resolve(image);
                    };

                image.onerror =
                    () => {
                        URL.revokeObjectURL(
                            objectUrl
                        );

                        reject(
                            new Error(
                                "The selected image could not be decoded."
                            )
                        );
                    };

                image.src =
                    objectUrl;
            }
        );
    }

    function canvasToWebp(canvas) {
        return new Promise(
            (
                resolve,
                reject
            ) => {
                canvas.toBlob(
                    blob => {
                        if (!blob) {
                            reject(
                                new Error(
                                    "The browser could not create the optimized WebP image."
                                )
                            );

                            return;
                        }

                        resolve(blob);
                    },
                    "image/webp",
                    WEBP_QUALITY
                );
            }
        );
    }

    async function processImage(file) {
        const image =
            await loadImage(file);

        const originalWidth =
            image.naturalWidth;

        const originalHeight =
            image.naturalHeight;

        if (
            !originalWidth
            ||
            !originalHeight
        ) {
            throw new Error(
                "The selected image does not have valid dimensions."
            );
        }

        const detectedOrientation =
            detectOrientation(
                originalWidth,
                originalHeight
            );

        const output =
            calculateOutputDimensions(
                originalWidth,
                originalHeight,
                detectedOrientation
            );

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width =
            output.width;

        canvas.height =
            output.height;

        const context =
            canvas.getContext(
                "2d",
                {
                    alpha:
                        true
                }
            );

        if (!context) {
            throw new Error(
                "The browser could not prepare the image processor."
            );
        }

        context.imageSmoothingEnabled =
            true;

        context.imageSmoothingQuality =
            "high";

        context.drawImage(
            image,
            0,
            0,
            output.width,
            output.height
        );

        const blob =
            await canvasToWebp(canvas);

        return {
            blob,

            meta: {
                originalWidth,
                originalHeight,
                width:
                    output.width,
                height:
                    output.height,
                detectedOrientation
            }
        };
    }

    function setPreviewSource(
        src,
        orientation
    ) {
        if (!src) {
            clearPreviewImage();
            return;
        }

        if (previewImage) {
            previewImage.src =
                src;

            previewImage.hidden =
                false;
        }

        if (previewEmpty) {
            previewEmpty.hidden =
                true;
        }

        if (previewFrame) {
            previewFrame.dataset.orientation =
                orientation || "square";
        }
    }

    function updatePreviewReadout() {
        const existingGraphic =
            getGraphic(
                selectedSource?.match
            );

        const detected =
            processedMeta?.detectedOrientation
            ||
            cleanText(
                existingGraphic?.orientation
            )
            ||
            "";

        const originalWidth =
            processedMeta?.originalWidth
            ||
            existingGraphic?.originalWidth
            ||
            0;

        const originalHeight =
            processedMeta?.originalHeight
            ||
            existingGraphic?.originalHeight
            ||
            0;

        const width =
            processedMeta?.width
            ||
            existingGraphic?.width
            ||
            0;

        const height =
            processedMeta?.height
            ||
            existingGraphic?.height
            ||
            0;

        if (detectedValue) {
            detectedValue.textContent =
                detected
                    ? titleCase(detected)
                    : "—";
        }

        if (originalDimensions) {
            originalDimensions.textContent =
                originalWidth
                &&
                originalHeight
                    ? `${originalWidth} × ${originalHeight}`
                    : "—";
        }

        if (optimizedDimensions) {
            optimizedDimensions.textContent =
                width
                &&
                height
                    ? `${width} × ${height}`
                    : "—";
        }

        if (optimizedSize) {
            optimizedSize.textContent =
                processedBlob
                    ? formatFileSize(
                        processedBlob.size
                    )
                    : "—";
        }

        if (destinationPath) {
            destinationPath.textContent =
                selectedSource
                    ? destinationFor(
                        selectedSource
                    )
                    : "—";
        }

        if (previewFrame) {
            previewFrame.dataset.orientation =
                selectedOrientation();
        }
    }

    function renderReview() {
        if (!review || !reviewList) {
            return;
        }

        if (
            !selectedSource
            ||
            !selectedFile
            ||
            !processedBlob
            ||
            !processedMeta
        ) {
            review.hidden = true;
            reviewList.innerHTML = "";
            return;
        }

        const event =
            selectedEvent();

        const orientation =
            selectedOrientation();

        reviewList.innerHTML = `
            <div class="cr-editor-change-row">
                <strong>EVENT</strong>

                <span>
                    ${escapeHtml(
                        event?.name
                        ||
                        selectedSource.match.eventId
                    )}
                </span>
            </div>

            <div class="cr-editor-change-row">
                <strong>MATCH</strong>

                <span>
                    Match ${escapeHtml(
                        selectedSource.match.order
                        ||
                        "—"
                    )} —
                    ${escapeHtml(
                        formatMatch(
                            selectedSource.match
                        )
                    )}
                </span>
            </div>

            <div class="cr-editor-change-row">
                <strong>SOURCE FILE</strong>

                <span>
                    ${escapeHtml(
                        selectedFile.name
                    )}
                </span>
            </div>

            <div class="cr-editor-change-row">
                <strong>DETECTED LAYOUT</strong>

                <span>
                    ${escapeHtml(
                        titleCase(
                            processedMeta.detectedOrientation
                        )
                    )}
                </span>
            </div>

            <div class="cr-editor-change-row">
                <strong>SAVED LAYOUT</strong>

                <span>
                    ${escapeHtml(
                        titleCase(
                            orientation
                        )
                    )}
                </span>
            </div>

            <div class="cr-editor-change-row">
                <strong>OPTIMIZED OUTPUT</strong>

                <span>
                    ${escapeHtml(
                        `${processedMeta.width} × ${processedMeta.height} WebP — ${formatFileSize(
                            processedBlob.size
                        )}`
                    )}
                </span>
            </div>

            <div class="cr-editor-change-row">
                <strong>DESTINATION</strong>

                <span>
                    ${escapeHtml(
                        destinationFor(
                            selectedSource
                        )
                    )}
                </span>
            </div>
        `;

        review.hidden = false;
    }

    function resetSelectedFile() {
        selectedFile = null;
        processedBlob = null;
        processedMeta = null;
        fileInput.value = "";

        clearError();

        if (saveButton) {
            saveButton.disabled = true;
        }

        if (review) {
            review.hidden = true;
        }

        if (reviewList) {
            reviewList.innerHTML = "";
        }
    }

    function showExistingGraphic() {
        const graphic =
            getGraphic(
                selectedSource?.match
            );

        revokePreviewUrl();

        if (graphic?.src) {
            setPreviewSource(
                graphic.src,
                graphic.orientation
                ||
                "square"
            );
        }
        else {
            clearPreviewImage();
        }

        updatePreviewReadout();
    }

        function populateEvents() {
        const oldValue =
            eventSelect.value;

        const eventIdsWithMatches =
            new Set(
                allMatchSources().map(
                    source =>
                        source.match.eventId
                )
            );

        const events =
            eventRecords()
                .filter(
                    event =>
                        eventIdsWithMatches.has(
                            event.id
                        )
                )
                .sort(
                    compareEvents
                );

        eventSelect.innerHTML = `
            <option value="">
                Select Event
            </option>

            ${events.map(
                event => `
                    <option value="${escapeHtml(event.id)}">
                        ${escapeHtml(
                            `${formatEventSchedule(event)} — ${event.name} — ${titleCase(event.status)}`
                        )}
                    </option>
                `
            ).join("")}
        `;

        eventSelect.disabled =
            events.length === 0;

        if (
            events.some(
                event =>
                    event.id === oldValue
            )
        ) {
            eventSelect.value =
                oldValue;
        }

        setStatus(
            events.length
                ? "SELECT EVENT"
                : "NO MATCHES"
        );
    }

    function populateMatches(
        preferredMatchId = ""
    ) {
        const eventId =
            eventSelect.value;

        const oldValue =
            preferredMatchId
            ||
            matchSelect.value;

        const sources =
            eventId
                ? matchSourcesForEvent(
                    eventId
                )
                : [];

        matchSelect.innerHTML = `
            <option value="">
                ${
                    eventId
                        ? "Select Match"
                        : "Select Event First"
                }
            </option>

            ${sources.map(
                source => `
                    <option value="${escapeHtml(source.match.id)}">
                        ${escapeHtml(
                            `Match ${source.match.order || "—"} — ${formatMatch(source.match)} — ${source.sourceLabel}`
                        )}
                    </option>
                `
            ).join("")}
        `;

        matchSelect.disabled =
            sources.length === 0;

        if (
            sources.some(
                source =>
                    source.match.id === oldValue
            )
        ) {
            matchSelect.value =
                oldValue;
        }
    }

    function handleEventChange() {
        clearMessage();
        resetSelectedFile();

        selectedSource = null;

        populateMatches();

        currentPath.textContent = "—";
        fileInput.disabled = true;
        layoutSelect.disabled = true;
        removeButton.disabled = true;

        clearPreviewImage();
        updatePreviewReadout();

        setStatus(
            eventSelect.value
                ? "SELECT MATCH"
                : "SELECT EVENT"
        );
    }

    function handleMatchChange() {
        clearMessage();
        resetSelectedFile();

        selectedSource =
            getSelectedSource();

        const graphic =
            getGraphic(
                selectedSource?.match
            );

        currentPath.textContent =
            graphic?.src
            ||
            "No match graphic assigned";

        fileInput.disabled =
            !selectedSource;

        layoutSelect.disabled =
            !selectedSource;

        layoutSelect.value =
            "auto";

        removeButton.disabled =
            !graphic?.src;

        showExistingGraphic();

        setStatus(
            selectedSource
                ? "SELECT IMAGE"
                : "SELECT MATCH"
        );
    }

    async function handleFileChange() {
        clearMessage();
        clearError();

        const file =
            fileInput.files?.[0]
            ||
            null;

        if (!selectedSource || !file) {
            resetSelectedFile();
            showExistingGraphic();
            return;
        }

        const allowedTypes =
            new Set([
                "image/png",
                "image/jpeg",
                "image/webp"
            ]);

        if (!allowedTypes.has(file.type)) {
            resetSelectedFile();

            showError(
                "Select a PNG, JPG, or WebP image. Animated GIFs are not supported for match-card graphics."
            );

            return;
        }

        selectedFile = file;
        processedBlob = null;
        processedMeta = null;
        saveButton.disabled = true;

        setStatus("OPTIMIZING...");

        try {
            const result =
                await processImage(file);

            processedBlob =
                result.blob;

            processedMeta =
                result.meta;

            revokePreviewUrl();

            previewObjectUrl =
                URL.createObjectURL(
                    processedBlob
                );

            setPreviewSource(
                previewObjectUrl,
                selectedOrientation()
            );

            updatePreviewReadout();
            renderReview();

            saveButton.disabled =
                false;

            setStatus("READY TO SAVE");
        }
        catch (error) {
            console.error(
                "Could not optimize match-card graphic:",
                error
            );

            resetSelectedFile();
            showExistingGraphic();

            showError(
                error.message
                ||
                "The selected image could not be optimized."
            );
        }
    }

    function handleLayoutChange() {
        if (!selectedSource) {
            return;
        }

        if (previewFrame) {
            previewFrame.dataset.orientation =
                selectedOrientation();
        }

        updatePreviewReadout();
        renderReview();
    }

    async function ensureWritePermission() {
        if (
            typeof owlRepositoryHandle === "undefined"
            ||
            !owlRepositoryHandle
        ) {
            return false;
        }

        const options = {
            mode:
                "readwrite"
        };

        if (
            await owlRepositoryHandle.queryPermission(
                options
            ) === "granted"
        ) {
            return true;
        }

        return (
            await owlRepositoryHandle.requestPermission(
                options
            )
            ===
            "granted"
        );
    }

    async function getDirectoryPath(
        root,
        folders,
        options = {}
    ) {
        let current =
            root;

        for (const folder of folders) {
            current =
                await current.getDirectoryHandle(
                    folder,
                    options
                );
        }

        return current;
    }

    async function writeOptimizedFile(
        source,
        blob
    ) {
        const assetsDirectory =
            await owlRepositoryHandle
                .getDirectoryHandle(
                    "assets",
                    {
                        create:
                            true
                    }
                );

        const destinationDirectory =
            await getDirectoryPath(
                assetsDirectory,
                [
                    "images",
                    "match-cards",
                    source.match.eventId
                ],
                {
                    create:
                        true
                }
            );

        const fileHandle =
            await destinationDirectory
                .getFileHandle(
                    `${source.match.id}.webp`,
                    {
                        create:
                            true
                    }
                );

        const writable =
            await fileHandle
                .createWritable();

        try {
            await writable.write(blob);
            await writable.close();
        }
        catch (error) {
            try {
                await writable.abort();
            }
            catch {
                // No additional action required.
            }

            throw error;
        }
    }

    async function updateMatchRecord(
        source,
        updater
    ) {
        const dataDirectory =
            await owlRepositoryHandle
                .getDirectoryHandle(
                    "data"
                );

        const fileHandle =
            await dataDirectory
                .getFileHandle(
                    source.fileName
                );

        const file =
            await fileHandle.getFile();

        const parsed =
            JSON.parse(
                await file.text()
            );

        if (!Array.isArray(parsed)) {
            throw new Error(
                `data/${source.fileName} must contain a JSON array.`
            );
        }

        const record =
            parsed.find(
                match =>
                    match.id === source.match.id
            );

        if (!record) {
            throw new Error(
                `Could not find match ${source.match.id} in data/${source.fileName}.`
            );
        }

        updater(record);

        const writable =
            await fileHandle
                .createWritable();

        try {
            await writable.write(
                `${JSON.stringify(
                    parsed,
                    null,
                    2
                )}\n`
            );

            await writable.close();
        }
        catch (error) {
            try {
                await writable.abort();
            }
            catch {
                // No additional action required.
            }

            throw error;
        }
    }

    async function removeStoredFile(source) {
        const assetsDirectory =
            await owlRepositoryHandle
                .getDirectoryHandle(
                    "assets"
                );

        const destinationDirectory =
            await getDirectoryPath(
                assetsDirectory,
                [
                    "images",
                    "match-cards",
                    source.match.eventId
                ]
            );

        await destinationDirectory
            .removeEntry(
                `${source.match.id}.webp`
            );
    }

    async function reloadAndRestore(
        eventId,
        matchId
    ) {
        await loadRepositoryData(
            owlRepositoryHandle
        );

        mediaTypeSelect.value =
            MATCH_CARD_TYPE;

        activateWorkflow();

        eventSelect.value =
            eventId;

        populateMatches(
            matchId
        );

        matchSelect.value =
            matchId;

        handleMatchChange();
    }

    async function saveGraphic() {
        if (
            !selectedSource
            ||
            !selectedFile
            ||
            !processedBlob
            ||
            !processedMeta
        ) {
            return;
        }

        clearMessage();
        clearError();

        saveButton.disabled = true;
        removeButton.disabled = true;

        setStatus("SAVING...");

        const source =
            selectedSource;

        const eventId =
            source.match.eventId;

        const matchId =
            source.match.id;

        const path =
            destinationFor(source);

        const hadExistingGraphic =
            Boolean(
                getGraphic(
                    source.match
                )?.src
            );

        let fileWritten =
            false;

        try {
            if (!await ensureWritePermission()) {
                throw new Error(
                    "Write permission was not granted."
                );
            }

            await writeOptimizedFile(
                source,
                processedBlob
            );

            fileWritten = true;

            const graphic = {
                src:
                    path,

                orientation:
                    selectedOrientation(),

                width:
                    processedMeta.width,

                height:
                    processedMeta.height,

                originalWidth:
                    processedMeta.originalWidth,

                originalHeight:
                    processedMeta.originalHeight,

                format:
                    "webp"
            };

            await updateMatchRecord(
                source,
                record => {
                    record.matchGraphic =
                        graphic;
                }
            );

            await reloadAndRestore(
                eventId,
                matchId
            );

            showMessage(
                `Match ${source.match.order || "—"} graphic was optimized, saved, and attached to ${matchId}.`
            );

            setStatus("SAVED");
        }
        catch (error) {
            console.error(
                "Could not save match-card graphic:",
                error
            );

            if (
                fileWritten
                &&
                !hadExistingGraphic
            ) {
                try {
                    await removeStoredFile(
                        source
                    );
                }
                catch {
                    // A failed database update may leave an orphaned file.
                }
            }

            showMessage(
                error.message
                ||
                "The match-card graphic could not be saved.",
                "error"
            );

            saveButton.disabled =
                false;

            removeButton.disabled =
                !getGraphic(
                    source.match
                )?.src;

            setStatus("SAVE FAILED");
        }
    }

    async function removeGraphic() {
        if (!selectedSource) {
            return;
        }

        const graphic =
            getGraphic(
                selectedSource.match
            );

        if (!graphic?.src) {
            return;
        }

        const confirmed =
            window.confirm(
                "Remove this match-card graphic from the match and delete its optimized file?"
            );

        if (!confirmed) {
            return;
        }

        clearMessage();
        clearError();

        saveButton.disabled = true;
        removeButton.disabled = true;

        setStatus("REMOVING...");

        const source =
            selectedSource;

        const eventId =
            source.match.eventId;

        const matchId =
            source.match.id;

        try {
            if (!await ensureWritePermission()) {
                throw new Error(
                    "Write permission was not granted."
                );
            }

            await updateMatchRecord(
                source,
                record => {
                    delete record.matchGraphic;
                }
            );

            let fileWarning = "";

            try {
                await removeStoredFile(
                    source
                );
            }
            catch (error) {
                if (
                    error?.name !==
                    "NotFoundError"
                ) {
                    fileWarning =
                        " The database link was removed, but the old optimized file could not be deleted automatically.";
                }
            }

            await reloadAndRestore(
                eventId,
                matchId
            );

            showMessage(
                `The match-card graphic was removed from ${matchId}.${fileWarning}`
            );

            setStatus("REMOVED");
        }
        catch (error) {
            console.error(
                "Could not remove match-card graphic:",
                error
            );

            showMessage(
                error.message
                ||
                "The match-card graphic could not be removed.",
                "error"
            );

            removeButton.disabled =
                false;

            setStatus("REMOVE FAILED");
        }
    }

    function activateWorkflow() {
        const active =
            isActive();

        standardRecordField.hidden =
            active;

        standardPathField.hidden =
            active;

        standardWorkflow.hidden =
            active;

        workflow.hidden =
            !active;

        mediaPanel?.classList.toggle(
            "match-card-mode",
            active
        );

        if (!active) {
            resetSelectedFile();
            clearPreviewImage();
            return;
        }

        clearMessage();
        populateEvents();

        if (eventSelect.value) {
            populateMatches();
        }
        else {
            matchSelect.innerHTML =
                `<option value="">Select Event First</option>`;

            matchSelect.disabled =
                true;
        }

        selectedSource =
            getSelectedSource();

        if (selectedSource) {
            handleMatchChange();
        }
        else {
            currentPath.textContent = "—";
            fileInput.disabled = true;
            layoutSelect.disabled = true;
            removeButton.disabled = true;

            clearPreviewImage();
            updatePreviewReadout();
        }
    }

    mediaTypeSelect.addEventListener(
        "change",
        activateWorkflow
    );

    eventSelect.addEventListener(
        "change",
        handleEventChange
    );

    matchSelect.addEventListener(
        "change",
        handleMatchChange
    );

    fileInput.addEventListener(
        "change",
        handleFileChange
    );

    layoutSelect.addEventListener(
        "change",
        handleLayoutChange
    );

    saveButton.addEventListener(
        "click",
        saveGraphic
    );

    removeButton.addEventListener(
        "click",
        removeGraphic
    );

    window.addEventListener(
        "owl-control-room-data-loaded",
        () => {
            if (isActive()) {
                activateWorkflow();
            }
        }
    );

    window.addEventListener(
        "beforeunload",
        revokePreviewUrl
    );

    activateWorkflow();
})();
