(() => {


    "use strict";



    const MEDIA_TYPES = {


        wrestlers: {

            label:
                "Wrestler Photo",

            dataKey:
                "wrestlers",

            folder:
                "wrestlers",

            pathFields: [

                "photo",
                "image",
                "photoPath"

            ]

        },


        teams: {

            label:
                "Team Logo",

            dataKey:
                "teams",

            folder:
                "teams",

            pathFields: [

                "logo",
                "image",
                "logoPath"

            ]

        },


        factions: {

            label:
                "Faction Logo",

            dataKey:
                "factions",

            folder:
                "factions",

            pathFields: [

                "logo",
                "image",
                "logoPath"

            ]

        },


        championships: {

            label:
                "Championship Image",

            dataKey:
                "championships",

            folder:
                "championships",

            pathFields: [

                "image",
                "beltImage",
                "imagePath"

            ]

        },


        events: {

            label:
                "Event Poster",

            dataKey:
                "events",

            folder:
                "events",

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



    // =================================
    // BASIC HELPERS
    // =================================


    function cleanText(
        value
    ) {


        return String(
            value || ""
        )
            .trim();

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


        return (

            cleanText(
                record?.name
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

            "Unnamed Record"

        );

    }



    function currentMediaPath(
        record,
        config
    ) {


        for (
            const field
            of config.pathFields
        ) {


            const value =

                cleanText(
                    record?.[field]
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


        return (

            MEDIA_TYPES[
                mediaTypeSelect.value
            ]

            ||

            null

        );

    }



    function recordsForConfig(
        config
    ) {


        if (

            !config

            ||

            typeof owlControlRoomData ===
            "undefined"

        ) {


            return [];

        }


        return (

            Array.isArray(
                owlControlRoomData[
                    config.dataKey
                ]
            )

                ? owlControlRoomData[
                    config.dataKey
                ]

                : []

        );

    }



    function selectedRecord() {


        const config =
            selectedConfig();


        if (
            !config
        ) {


            return null;

        }


        return (

            recordsForConfig(
                config
            )

                .find(

                    record =>

                        String(
                            record.id
                        )

                        ===

                        recordSelect.value

                )

            ||

            null

        );

    }



    function fileExtension(
        file
    ) {


        const extensionByType = {


            "image/png":
                "png",


            "image/jpeg":
                "jpg",


            "image/webp":
                "webp",


            "image/gif":
                "gif"

        };


        return (

            extensionByType[
                file?.type
            ]

            ||

            ""

        );

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


        return (

            `assets/images/${config.folder}/${record.id}.${extension}`

        );

    }



    // =================================
    // RESET
    // =================================


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


        recordSelect.innerHTML = `

            <option value="">
                Select Media Type First
            </option>

        `;


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



    // =================================
    // RECORD DIRECTORY
    // =================================


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


        const records =

            [

                ...recordsForConfig(
                    config
                )

            ]

                .sort(

                    (
                        a,
                        b
                    ) =>

                        recordLabel(
                            a
                        )

                            .localeCompare(

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

            ${records

                .map(

                    record => `

                        <option
                            value="${escapeHtml(
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

                )

                .join(
                    ""
                )}

        `;


        recordSelect.disabled =
            records.length === 0;


        fileInput.disabled =
            true;


        setStatus(

            records.length

                ? "SELECT RECORD"

                : "NO RECORDS"

        );

    }



    // =================================
    // SELECT RECORD
    // =================================


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


        setStatus(
            "SELECT IMAGE"
        );

    }



    // =================================
    // FILE PREVIEW
    // =================================


    function handleFileChange() {


        clearMessage();


        errorMessage.hidden =
            true;


        const config =
            selectedConfig();


        const record =
            selectedRecord();


        const file =

            fileInput.files?.[0]

            ||

            null;


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
            true;


        setStatus(
            "PREVIEW READY"
        );

    }



    // =================================
    // EVENTS
    // =================================


    mediaTypeSelect.addEventListener(

        "change",
        populateRecordOptions

    );


    recordSelect.addEventListener(

        "change",
        handleRecordChange

    );


    fileInput.addEventListener(

        "change",
        handleFileChange

    );


    window.addEventListener(

        "owl-control-room-data-loaded",

        () => {


            if (
                mediaTypeSelect.value
            ) {


                populateRecordOptions();

            }


            else {


                resetManager();

            }

        }

    );



    resetManager();


})();
