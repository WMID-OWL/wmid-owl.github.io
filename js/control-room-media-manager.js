(() => {
    "use strict";

    const MEDIA_TYPES = {
        wrestlers: {
            label: "Wrestler Photo",
            dataKey: "wrestlers",
            folder: "wrestlers",
            writeField: "photo",
            pathFields: [
                "photo",
                "image",
                "photoPath"
            ]
        },

        finishers: {
            label: "Finisher GIF",
            dataKey: "wrestlers",
            folder: "finishers",
            pathFields: [],
            finisherMode: true
        },

        teams: {
            label: "Team Logo",
            dataKey: "teams",
            folder: "teams",
            writeField: "logo",
            pathFields: [
                "logo",
                "image",
                "logoPath"
            ]
        },

        teamFinishers: {
            label: "Team Finisher GIF",
            dataKey: "teams",
            folder: "team-finishers",
            writeField: "finisherGif",
            pathFields: [
                "finisherGif"
            ],
            teamFinisherMode: true,
            gifOnly: true
        },

        landscapePromotions: {
            label: "Landscape Promotion Logo",
            dataKey: "landscapePromotions",
            dataFolderPath: [
                "landscape"
            ],
            dataFileName: "companies.json",
            sourceCollectionKey: "companies",
            folderPath: [
                "landscape",
                "promotion-logos"
            ],
            writeField: "logo",
            pathFields: [
                "logo"
            ],
            specialSource: true
        },

        landscapeShows: {
            label: "Landscape Show Logo",
            dataKey: "landscapeShows",
            dataFolderPath: [
                "landscape"
            ],
            dataFileName: "shows.json",
            sourceCollectionKey: "shows",
            folderPath: [
                "landscape",
                "show-logos"
            ],
            writeField: "logo",
            pathFields: [
                "logo"
            ],
            specialSource: true
        },

        innanetProfiles: {
            label: "Innanet Profile Picture",
            dataKey: "innanetAccounts",
            dataFolderPath: [
                "innanet"
            ],
            dataFileName: "accounts.json",
            sourceCollectionKey: "",
            folderPath: [
                "innanet",
                "profiles"
            ],
            writeField: "profileImage",
            pathFields: [
                "profileImage"
            ],
            specialSource: true
        },

        factions: {
            label: "Faction Logo",
            dataKey: "factions",
            folder: "factions",
            writeField: "logo",
            pathFields: [
                "logo",
                "image",
                "logoPath"
            ]
        },

        championships: {
            label: "Championship Image",
            dataKey: "championships",
            folder: "championships",
            writeField: "image",
            pathFields: [
                "image",
                "beltImage",
                "imagePath"
            ]
        },

        events: {
            label: "Event Poster",
            dataKey: "events",
            folder: "events",
            writeField: "image",
            pathFields: [
                "image",
                "poster",
                "posterPath"
            ]
        }
    };


    const mediaTypeSelect =
        document.getElementById(
            "cr-media-type"
        );


    const recordSelect =
        document.getElementById(
            "cr-media-record"
        );


    const currentPath =
        document.getElementById(
            "cr-media-current-path"
        );


    const fileInput =
        document.getElementById(
            "cr-media-file"
        );


    const destinationPath =
        document.getElementById(
            "cr-media-destination-path"
        );


    const review =
        document.getElementById(
            "cr-media-review"
        );


    const reviewList =
        document.getElementById(
            "cr-media-review-list"
        );


    const errorMessage =
        document.getElementById(
            "cr-media-error"
        );


    const saveButton =
        document.getElementById(
            "cr-media-save"
        );


    const status =
        document.getElementById(
            "cr-media-status"
        );


    const message =
        document.getElementById(
            "cr-media-message"
        );


    if (
        !mediaTypeSelect
        ||
        !recordSelect
        ||
        !fileInput
    ) {
        return;
    }


    let selectedFile =
        null;


    const specialRecords =
        new Map();


    function cleanText(
        value
    ) {
        return String(
            value || ""
        ).trim();
    }


    function escapeHtml(
        value
    ) {
        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    function setStatus(
        value
    ) {
        status.textContent =
            value;
    }


    function clearMessage() {
        message.hidden =
            true;

        message.textContent =
            "";

        message.className =
            "cr-save-message";
    }


    function showError(
        value
    ) {
        errorMessage.textContent =
            value;

        errorMessage.hidden =
            false;

        review.hidden =
            false;

        saveButton.disabled =
            true;

        setStatus(
            "CHECK FILE"
        );
    }


    function recordLabel(
        record
    ) {
        const baseName =
            cleanText(
                record?.name
            )
            ||
            cleanText(
                record?.accountName
            )
            ||
            cleanText(
                record?.title
            )
            ||
            cleanText(
                record?.eventName
            )
            ||
            cleanText(
                record?.id
            )
            ||
            "Unnamed Record";


        const finisherName =
            cleanText(
                record?.finisherName
            );


        if (
            finisherName
        ) {
            return `${baseName} — ${finisherName}`;
        }


        const accountHandle =
            cleanText(
                record?.handle
            );


        return accountHandle
            ? `${baseName} — ${accountHandle}`
            : baseName;
    }


    function currentMediaPath(
        record,
        config
    ) {
        if (
            config?.finisherMode
        ) {
            return cleanText(
                record?.[
                    record.finisherPathField
                ]
            );
        }


        for (
            const field
            of config?.pathFields || []
        ) {
            const value =
                cleanText(
                    record?.[
                        field
                    ]
                );


            if (
                value
            ) {
                return value;
            }
        }


        return "";
    }


    function selectedConfig() {
        return MEDIA_TYPES[
            mediaTypeSelect.value
        ] || null;
    }


    async function getNestedDirectory(
        root,
        folders,
        options = {}
    ) {
        let directory =
            root;


        for (
            const folderName
            of folders || []
        ) {
            if (
                !cleanText(
                    folderName
                )
            ) {
                throw new Error(
                    "A required folder name could not be determined."
                );
            }


            directory =
                await directory.getDirectoryHandle(
                    folderName,
                    options
                );
        }


        return directory;
    }


    async function loadSpecialRecords(
        config
    ) {
        if (
            !config?.specialSource
        ) {
            return;
        }


        if (
            typeof owlRepositoryHandle ===
                "undefined"
            ||
            !owlRepositoryHandle
        ) {
            specialRecords.set(
                config.dataKey,
                []
            );

            return;
        }


        const dataDirectory =
            await owlRepositoryHandle
                .getDirectoryHandle(
                    "data"
                );


        const targetDirectory =
            await getNestedDirectory(
                dataDirectory,
                config.dataFolderPath || []
            );


        const fileHandle =
            await targetDirectory
                .getFileHandle(
                    config.dataFileName
                );


        const file =
            await fileHandle.getFile();


        const parsed =
            JSON.parse(
                await file.text()
            );


        const records =
            config.sourceCollectionKey
                ? parsed?.[
                    config.sourceCollectionKey
                ]
                : parsed;


        if (
            !Array.isArray(
                records
            )
        ) {
            const expected =
                config.sourceCollectionKey
                    ? `an object containing a ${config.sourceCollectionKey} array`
                    : "a JSON array";


            throw new Error(
                `data/${[
                    ...(
                        config.dataFolderPath || []
                    ),
                    config.dataFileName
                ].join("/")} must contain ${expected}.`
            );
        }


        specialRecords.set(
            config.dataKey,
            records
        );
    }


    function recordsForConfig(
        config
    ) {
        if (
            !config
        ) {
            return [];
        }


        if (
            config.specialSource
        ) {
            return specialRecords.get(
                config.dataKey
            ) || [];
        }


        if (
            typeof owlControlRoomData ===
                "undefined"
        ) {
            return [];
        }


        return Array.isArray(
            owlControlRoomData[
                config.dataKey
            ]
        )
            ? owlControlRoomData[
                config.dataKey
            ]
            : [];
    }


    function selectedRecord() {
        const config =
            selectedConfig();


        if (
            !config
        ) {
            return null;
        }


        if (
            config.finisherMode
        ) {
            const [
                wrestlerId,
                slot
            ] =
                String(
                    recordSelect.value || ""
                ).split(
                    "::"
                );


            const wrestler =
                recordsForConfig(
                    config
                ).find(
                    record =>
                        String(
                            record.id
                        ) ===
                        wrestlerId
                );


            if (
                !wrestler
            ) {
                return null;
            }


            const isSecond =
                slot ===
                "2";


            const finisherName =
                cleanText(
                    isSecond
                        ? wrestler.finisher2
                        : wrestler.finisher
                );


            if (
                !finisherName
            ) {
                return null;
            }


            return {
                ...wrestler,

                mediaSelectionId:
                    recordSelect.value,

                finisherSlot:
                    isSecond
                        ? "2"
                        : "1",

                finisherName,

                finisherPathField:
                    isSecond
                        ? "finisher2Gif"
                        : "finisherGif"
            };
        }


        const record =
            recordsForConfig(
                config
            ).find(
                item =>
                    String(
                        item.id
                    ) ===
                    recordSelect.value
            ) || null;


        if (
            !record
        ) {
            return null;
        }


        if (
            config.teamFinisherMode
        ) {
            const finisherName =
                cleanText(
                    record.finisher
                );


            return finisherName
                ? {
                    ...record,
                    finisherName
                }
                : null;
        }


        return record;
    }


    function fileExtension(
        file
    ) {
        return {
            "image/png":
                "png",

            "image/jpeg":
                "jpg",

            "image/webp":
                "webp",

            "image/gif":
                "gif"
        }[
            file?.type
        ] || "";
    }


    function buildDestinationPath(
        config,
        record,
        file
    ) {
        const extension =
            fileExtension(
                file
            );


        if (
            !config
            ||
            !record?.id
            ||
            !extension
        ) {
            return "";
        }


        if (
            config.gifOnly
            &&
            extension !==
                "gif"
        ) {
            return "";
        }


        if (
            config.finisherMode
        ) {
            if (
                extension !==
                    "gif"
                ||
                !record.finisherSlot
            ) {
                return "";
            }


            return `assets/images/finishers/${record.id}-finisher-${record.finisherSlot}.gif`;
        }


        const folderPath =
            Array.isArray(
                config.folderPath
            )
            &&
            config.folderPath.length
                ? config.folderPath.join(
                    "/"
                )
                : config.folder;


        return folderPath
            ? `assets/images/${folderPath}/${record.id}.${extension}`
            : "";
    }


    async function ensureWritePermission() {
        if (
            typeof owlRepositoryHandle ===
                "undefined"
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
            await owlRepositoryHandle
                .queryPermission(
                    options
                ) ===
                "granted"
        ) {
            return true;
        }


        return (
            await owlRepositoryHandle
                .requestPermission(
                    options
                ) ===
            "granted"
        );
    }


    function selectedWriteField(
        config,
        record
    ) {
        return config?.finisherMode
            ? cleanText(
                record?.finisherPathField
            )
            : cleanText(
                config?.writeField
            );
    }


    function findRecordObjectBounds(
        text,
        recordId
    ) {
        const escapedId =
            String(
                recordId
            ).replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );


        const idPattern =
            new RegExp(
                `"id"\\s*:\\s*"${escapedId}"`
            );


        const idMatch =
            idPattern.exec(
                text
            );


        if (
            !idMatch
        ) {
            throw new Error(
                `Could not find database record ${recordId}.`
            );
        }


        const start =
            text.lastIndexOf(
                "{",
                idMatch.index
            );


        if (
            start ===
                -1
        ) {
            throw new Error(
                "Could not find the beginning of the database record."
            );
        }


        let depth =
            0;


        let insideString =
            false;


        let escapedCharacter =
            false;


        for (
            let index = start;
            index < text.length;
            index += 1
        ) {
            const character =
                text[
                    index
                ];


            if (
                escapedCharacter
            ) {
                escapedCharacter =
                    false;

                continue;
            }


            if (
                character ===
                    "\\"
                &&
                insideString
            ) {
                escapedCharacter =
                    true;

                continue;
            }


            if (
                character ===
                    "\""
            ) {
                insideString =
                    !insideString;

                continue;
            }


            if (
                insideString
            ) {
                continue;
            }


            if (
                character ===
                    "{"
            ) {
                depth +=
                    1;
            }


            if (
                character ===
                    "}"
            ) {
                depth -=
                    1;


                if (
                    depth ===
                        0
                ) {
                    return {
                        start,
                        end:
                            index
                    };
                }
            }
        }


        throw new Error(
            "Could not find the end of the database record."
        );
    }


    function replaceOrAddStringField(
        block,
        key,
        value
    ) {
        const escapedKey =
            String(
                key
            ).replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );


        const pattern =
            new RegExp(
                `("${escapedKey}"\\s*:\\s*)("(?:\\\\.|[^"\\\\])*")`
            );


        if (
            pattern.test(
                block
            )
        ) {
            return block.replace(
                pattern,
                (
                    match,
                    prefix
                ) =>
                    prefix
                    +
                    JSON.stringify(
                        value
                    )
            );
        }


        const closingBraceIndex =
            block.lastIndexOf(
                "}"
            );


        if (
            closingBraceIndex ===
                -1
        ) {
            throw new Error(
                `Could not add media field ${key}.`
            );
        }


        const beforeClosingBrace =
            block.slice(
                0,
                closingBraceIndex
            ).trimEnd();


        const separator =
            beforeClosingBrace.endsWith(
                "{"
            )
                ? ""
                : ",";


        return (
            beforeClosingBrace
            +
            separator
            +
            `\n    ${JSON.stringify(
                key
            )}: ${JSON.stringify(
                value
            )}\n`
            +
            block.slice(
                closingBraceIndex
            )
        );
    }


    async function writeMediaFile(
        config,
        file,
        newPath
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


        const imagesDirectory =
            await assetsDirectory
                .getDirectoryHandle(
                    "images",
                    {
                        create:
                            true
                    }
                );


        const folders =
            Array.isArray(
                config.folderPath
            )
            &&
            config.folderPath.length
                ? config.folderPath
                : [
                    config.folder
                ];


        const destinationDirectory =
            await getNestedDirectory(
                imagesDirectory,
                folders,
                {
                    create:
                        true
                }
            );


        const fileName =
            newPath.split(
                "/"
            ).pop();


        if (
            !fileName
        ) {
            throw new Error(
                "The destination filename could not be created."
            );
        }


        const destinationHandle =
            await destinationDirectory
                .getFileHandle(
                    fileName,
                    {
                        create:
                            true
                    }
                );


        const writable =
            await destinationHandle
                .createWritable();


        try {
            await writable.write(
                file
            );


            await writable.close();
        }


        catch (
            error
        ) {
            try {
                await writable.abort();
            }


            catch {
                // No additional action required.
            }


            throw error;
        }
    }


    async function updateDatabasePath(
        config,
        record,
        newPath
    ) {
        const field =
            selectedWriteField(
                config,
                record
            );


        if (
            !field
        ) {
            throw new Error(
                "The database media field could not be determined."
            );
        }


        const dataDirectory =
            await owlRepositoryHandle
                .getDirectoryHandle(
                    "data"
                );


        const targetDataDirectory =
            await getNestedDirectory(
                dataDirectory,
                config.dataFolderPath || []
            );


        const dataFileName =
            cleanText(
                config.dataFileName
            )
            ||
            `${config.dataKey}.json`;


        const fileHandle =
            await targetDataDirectory
                .getFileHandle(
                    dataFileName
                );


        const file =
            await fileHandle.getFile();


        const originalText =
            await file.text();


        const bounds =
            findRecordObjectBounds(
                originalText,
                record.id
            );


        const originalBlock =
            originalText.slice(
                bounds.start,
                bounds.end + 1
            );


        const updatedBlock =
            replaceOrAddStringField(
                originalBlock,
                field,
                newPath
            );


        const updatedText =
            originalText.slice(
                0,
                bounds.start
            )
            +
            updatedBlock
            +
            originalText.slice(
                bounds.end + 1
            );


        const writable =
            await fileHandle
                .createWritable();


        try {
            await writable.write(
                updatedText
            );


            await writable.close();
        }


        catch (
            error
        ) {
            try {
                await writable.abort();
            }


            catch {
                // No additional action required.
            }


            throw error;
        }
    }


    async function saveSelectedMedia() {
        const config =
            selectedConfig();


        const record =
            selectedRecord();


        const file =
            selectedFile;


        if (
            !config
            ||
            !record
            ||
            !file
        ) {
            return;
        }


        const newPath =
            buildDestinationPath(
                config,
                record,
                file
            );


        if (
            !newPath
        ) {
            showError(
                "A valid destination path could not be created."
            );

            return;
        }


        saveButton.disabled =
            true;


        setStatus(
            "IMPORTING..."
        );


        clearMessage();


        errorMessage.hidden =
            true;


        try {
            if (
                !await ensureWritePermission()
            ) {
                throw new Error(
                    "Write permission was not granted."
                );
            }


            const selectedType =
                mediaTypeSelect.value;


            const selectedRecordValue =
                recordSelect.value;


            await writeMediaFile(
                config,
                file,
                newPath
            );


            await updateDatabasePath(
                config,
                record,
                newPath
            );


            await loadRepositoryData(
                owlRepositoryHandle
            );


            if (
                config.specialSource
            ) {
                await loadSpecialRecords(
                    config
                );
            }


            mediaTypeSelect.value =
                selectedType;


            populateRecordOptions();


            recordSelect.value =
                selectedRecordValue;


            handleRecordChange();


            message.textContent =
                `${recordLabel(
                    record
                )} was imported and assigned to ${newPath}. Review the new image file and database change in GitHub Desktop before committing.`;


            message.className =
                "cr-save-message save-success";


            message.hidden =
                false;


            setStatus(
                "SAVED"
            );
        }


        catch (
            error
        ) {
            console.error(
                "Could not import media:",
                error
            );


            message.textContent =
                error.message
                ||
                "The media file could not be imported.";


            message.className =
                "cr-save-message save-error";


            message.hidden =
                false;


            setStatus(
                "IMPORT FAILED"
            );


            saveButton.disabled =
                false;
        }
    }


    function resetFileSelection() {
        selectedFile =
            null;


        fileInput.value =
            "";


        destinationPath.textContent =
            "—";


        review.hidden =
            true;


        reviewList.innerHTML =
            "";


        errorMessage.hidden =
            true;


        errorMessage.textContent =
            "";


        saveButton.disabled =
            true;


        clearMessage();
    }


    function resetManager() {
        recordSelect.innerHTML =
            `<option value="">Select Media Type First</option>`;


        recordSelect.disabled =
            true;


        currentPath.textContent =
            "—";


        fileInput.disabled =
            true;


        resetFileSelection();


        setStatus(
            "READY"
        );
    }


    function populateRecordOptions() {
        const config =
            selectedConfig();


        resetFileSelection();


        currentPath.textContent =
            "—";


        if (
            !config
        ) {
            resetManager();

            return;
        }


        const sourceRecords = [
            ...recordsForConfig(
                config
            )
        ];


        const records =
            (
                config.finisherMode
                    ? sourceRecords.flatMap(
                        wrestler => {
                            const options =
                                [];


                            const firstFinisher =
                                cleanText(
                                    wrestler.finisher
                                );


                            const secondFinisher =
                                cleanText(
                                    wrestler.finisher2
                                );


                            if (
                                firstFinisher
                            ) {
                                options.push({
                                    ...wrestler,

                                    mediaSelectionId:
                                        `${wrestler.id}::1`,

                                    finisherSlot:
                                        "1",

                                    finisherName:
                                        firstFinisher,

                                    finisherPathField:
                                        "finisherGif"
                                });
                            }


                            if (
                                secondFinisher
                            ) {
                                options.push({
                                    ...wrestler,

                                    mediaSelectionId:
                                        `${wrestler.id}::2`,

                                    finisherSlot:
                                        "2",

                                    finisherName:
                                        secondFinisher,

                                    finisherPathField:
                                        "finisher2Gif"
                                });
                            }


                            return options;
                        }
                    )
                    : config.teamFinisherMode
                        ? sourceRecords
                            .filter(
                                team =>
                                    cleanText(
                                        team.finisher
                                    )
                            )
                            .map(
                                team => ({
                                    ...team,

                                    finisherName:
                                        cleanText(
                                            team.finisher
                                        )
                                })
                            )
                        : sourceRecords
            ).sort(
                (
                    a,
                    b
                ) =>
                    recordLabel(
                        a
                    ).localeCompare(
                        recordLabel(
                            b
                        )
                    )
            );


        recordSelect.innerHTML = `
            <option value="">
                Select ${escapeHtml(
                    config.label
                )} Record
            </option>

            ${records.map(
                record => `
                    <option
                        value="${escapeHtml(
                            record.mediaSelectionId
                            ||
                            record.id
                        )}"
                    >
                        ${escapeHtml(
                            recordLabel(
                                record
                            )
                        )}
                    </option>
                `
            ).join("")}
        `;


        recordSelect.disabled =
            records.length ===
                0;


        fileInput.disabled =
            true;


        fileInput.accept =
            config.finisherMode
            ||
            config.gifOnly
                ? "image/gif"
                : "image/png,image/jpeg,image/webp,image/gif";


        setStatus(
            records.length
                ? "SELECT RECORD"
                : "NO RECORDS"
        );
    }


    function handleRecordChange() {
        resetFileSelection();


        const config =
            selectedConfig();


        const record =
            selectedRecord();


        if (
            !config
            ||
            !record
        ) {
            currentPath.textContent =
                "—";


            fileInput.disabled =
                true;


            setStatus(
                "SELECT RECORD"
            );


            return;
        }


        currentPath.textContent =
            currentMediaPath(
                record,
                config
            )
            ||
            "No media assigned";


        fileInput.disabled =
            false;


        fileInput.accept =
            config.finisherMode
            ||
            config.gifOnly
                ? "image/gif"
                : "image/png,image/jpeg,image/webp,image/gif";


        setStatus(
            config.finisherMode
            ||
            config.gifOnly
                ? "SELECT GIF"
                : "SELECT IMAGE"
        );
    }


    function handleFileChange() {
        clearMessage();


        errorMessage.hidden =
            true;


        const config =
            selectedConfig();


        const record =
            selectedRecord();


        const file =
            fileInput.files?.[
                0
            ] || null;


        if (
            !config
            ||
            !record
            ||
            !file
        ) {
            resetFileSelection();

            return;
        }


        const extension =
            fileExtension(
                file
            );


        if (
            !extension
        ) {
            selectedFile =
                null;


            destinationPath.textContent =
                "—";


            showError(
                "Select a PNG, JPG, WebP, or GIF image."
            );


            return;
        }


        if (
            (
                config.finisherMode
                ||
                config.gifOnly
            )
            &&
            extension !==
                "gif"
        ) {
            selectedFile =
                null;


            destinationPath.textContent =
                "—";


            showError(
                "Finisher media must be an animated GIF file."
            );


            return;
        }


        selectedFile =
            file;


        const newPath =
            buildDestinationPath(
                config,
                record,
                file
            );


        destinationPath.textContent =
            newPath;


        reviewList.innerHTML = `
            <div class="cr-editor-change-row">
                <strong>RECORD</strong>

                <span>
                    ${escapeHtml(
                        recordLabel(
                            record
                        )
                    )}
                </span>
            </div>

            ${
                config.finisherMode
                ||
                config.teamFinisherMode
                    ? `
                        <div class="cr-editor-change-row">
                            <strong>FINISHER</strong>

                            <span>
                                ${escapeHtml(
                                    record.finisherName
                                )}
                            </span>
                        </div>
                    `
                    : ""
            }

            <div class="cr-editor-change-row">
                <strong>SELECTED FILE</strong>

                <span>
                    ${escapeHtml(
                        file.name
                    )}
                </span>
            </div>

            <div class="cr-editor-change-row">
                <strong>CURRENT PATH</strong>

                <span>
                    ${escapeHtml(
                        currentMediaPath(
                            record,
                            config
                        )
                        ||
                        "No media assigned"
                    )}
                </span>
            </div>

            <div class="cr-editor-change-row">
                <strong>NEW PATH</strong>

                <span>
                    ${escapeHtml(
                        newPath
                    )}
                </span>
            </div>
        `;


        review.hidden =
            false;


        saveButton.disabled =
            false;


        setStatus(
            "READY TO IMPORT"
        );
    }


    async function handleMediaTypeChange() {
        clearMessage();


        const config =
            selectedConfig();


        if (
            config?.specialSource
        ) {
            setStatus(
                config.dataKey ===
                    "innanetAccounts"
                    ? "LOADING ACCOUNTS"
                    : config.dataKey ===
                        "landscapeShows"
                        ? "LOADING SHOWS"
                        : "LOADING PROMOTIONS"
            );


            try {
                await loadSpecialRecords(
                    config
                );
            }


            catch (
                error
            ) {
                console.error(
                    `Could not load ${config.label}:`,
                    error
                );


                specialRecords.set(
                    config.dataKey,
                    []
                );


                populateRecordOptions();


                showError(
                    error.message
                    ||
                    `The ${config.label} database could not be loaded.`
                );


                return;
            }
        }


        populateRecordOptions();
    }


    window.owlOpenMediaManager =
        async function (
            mediaType,
            recordId
        ) {
            const typeValue =
                cleanText(
                    mediaType
                );


            const recordValue =
                cleanText(
                    recordId
                );


            if (
                !typeValue
                ||
                !recordValue
            ) {
                return false;
            }


            const matchingOption =
                [
                    ...mediaTypeSelect.options
                ].some(
                    option =>
                        option.value ===
                            typeValue
                );


            if (
                !matchingOption
            ) {
                return false;
            }


            mediaTypeSelect.value =
                typeValue;


            await handleMediaTypeChange();


            recordSelect.value =
                recordValue;


            if (
                recordSelect.value !==
                    recordValue
            ) {
                showError(
                    "The selected Media Manager record could not be loaded."
                );


                return false;
            }


            handleRecordChange();


            document.getElementById(
                "cr-tool-media"
            )?.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "start"
            });


            window.setTimeout(
                () => {
                    if (
                        !fileInput.disabled
                    ) {
                        fileInput.click();
                    }
                },
                450
            );


            return true;
        };


    mediaTypeSelect.addEventListener(
        "change",
        handleMediaTypeChange
    );


    recordSelect.addEventListener(
        "change",
        handleRecordChange
    );


    fileInput.addEventListener(
        "change",
        handleFileChange
    );


    saveButton.addEventListener(
        "click",
        saveSelectedMedia
    );


    window.addEventListener(
        "owl-control-room-data-loaded",
        () => {
            if (
                mediaTypeSelect.value
            ) {
                handleMediaTypeChange();
            }


            else {
                resetManager();
            }
        }
    );


    resetManager();
})();
