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


        finishers: {

            label:
                "Finisher GIF",

            dataKey:
                "wrestlers",

            folder:
                "finishers",

            pathFields:
                [],

            finisherMode:
                true

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


    const baseName =

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

        "Unnamed Record";


    const finisherName =

        cleanText(
            record?.finisherName
        );


    return finisherName

        ? `${baseName} — ${finisherName}`

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


    if (
        config.finisherMode
    ) {


        const [

            wrestlerId,
            slot

        ] =

            String(
                recordSelect.value || ""
            )
                .split(
                    "::"
                );


        const wrestler =

            recordsForConfig(
                config
            )

                .find(

                    record =>

                        String(
                            record.id
                        )

                        ===

                        wrestlerId

                );


        if (
            !wrestler
        ) {


            return null;

        }


        const isSecond =
            slot === "2";


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


            finisherName:
                finisherName,


            finisherPathField:

                isSecond

                    ? "finisher2Gif"

                    : "finisherGif"

        };

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


    if (
        config.finisherMode
    ) {


        if (

            extension !== "gif"

            ||

            !record.finisherSlot

        ) {


            return "";

        }


        return (

            `assets/images/finishers/${record.id}-finisher-${record.finisherSlot}.gif`

        );

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


        const sourceRecords =

    [

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

            : sourceRecords

    )

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
    record.mediaSelectionId || record.id
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


fileInput.accept =

    config.finisherMode

        ? "image/gif"

        : "image/png,image/jpeg,image/webp,image/gif";


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


fileInput.accept =

    config.finisherMode

        ? "image/gif"

        : "image/png,image/jpeg,image/webp,image/gif";


setStatus(

    config.finisherMode

        ? "SELECT GIF"

        : "SELECT IMAGE"

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
if (

    config.finisherMode

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


            ${config.finisherMode

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

                : ""}


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
