// =================================
// SUNDAY DISSERVICE
// CONTROL ROOM PUBLISHER
// =================================


// =================================
// ELEMENTS
// =================================


const sundayDisservicePublisherEls = {


    status:

        document.getElementById(
            "cr-sunday-disservice-status"
        ),


    sermon:

        document.getElementById(
            "cr-sunday-disservice-sermon"
        ),


    date:

        document.getElementById(
            "cr-sunday-disservice-date"
        ),


    headline:

        document.getElementById(
            "cr-sunday-disservice-headline"
        ),


    deck:

        document.getElementById(
            "cr-sunday-disservice-deck"
        ),


    argumentTitle:

        document.getElementById(
            "cr-sunday-disservice-argument-title"
        ),


    argumentBody:

        document.getElementById(
            "cr-sunday-disservice-argument-body"
        ),


    praise:

        document.getElementById(
            "cr-sunday-disservice-praise"
        ),


    condemnation:

        document.getElementById(
            "cr-sunday-disservice-condemnation"
        ),


    favorites:

        document.getElementById(
            "cr-sunday-disservice-favorites"
        ),


    blindSpots:

        document.getElementById(
            "cr-sunday-disservice-blind-spots"
        ),


    references:

        document.getElementById(
            "cr-sunday-disservice-references"
        ),


    closingWord:

        document.getElementById(
            "cr-sunday-disservice-closing-word"
        ),


    preview:

        document.getElementById(
            "cr-sunday-disservice-preview"
        ),


    changeList:

        document.getElementById(
            "cr-sunday-disservice-change-list"
        ),


    error:

        document.getElementById(
            "cr-sunday-disservice-error"
        ),


    publishButton:

        document.getElementById(
            "cr-sunday-disservice-publish"
        ),


    message:

        document.getElementById(
            "cr-sunday-disservice-message"
        )

};



// =================================
// STATE
// =================================


const sundayDisservicePublisherState = {


    archiveIndex: {

        version:
            1,

        sermons:
            []

    },


    listenersInstalled:
        false

};



// =================================
// BASIC HELPERS
// =================================


function sundayDisservicePublisherArray(
    value
) {


    return Array.isArray(
        value
    )

        ? value

        : [];

}



function sundayDisservicePublisherSetStatus(
    value
) {


    if (
        sundayDisservicePublisherEls.status
    ) {


        sundayDisservicePublisherEls
            .status
            .textContent =
                value;

    }

}



function sundayDisservicePublisherFormatDate(
    dateString
) {


    if (!dateString) {

        return "—";

    }


    return new Date(

        `${dateString}T12:00:00`

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



function sundayDisservicePublisherIsoDate(
    date
) {


    const year =

        date.getFullYear();


    const month =

        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =

        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}



// =================================
// UPCOMING SUNDAY
// =================================


function sundayDisservicePublisherUpcomingSunday() {


    const date =

        new Date();


    date.setHours(
        12,
        0,
        0,
        0
    );


    const daysUntilSunday =

        (
            7
            -
            date.getDay()
        )

        %
        7;


    date.setDate(

        date.getDate()

        +

        daysUntilSunday

    );


    return sundayDisservicePublisherIsoDate(
        date
    );

}



function sundayDisservicePublisherIsSunday(
    dateString
) {


    if (!dateString) {

        return false;

    }


    const date =

        new Date(
            `${dateString}T12:00:00`
        );


    return (

        !Number.isNaN(
            date.getTime()
        )

        &&

        date.getDay() ===
        0

    );

}



// =================================
// ARCHIVE INDEX
// =================================


async function sundayDisservicePublisherReadArchiveIndex() {


    if (
        !owlRepositoryHandle
    ) {


        return {

            version:
                1,

            sermons:
                []

        };

    }


    try {


        const dataDirectory =

            await owlRepositoryHandle
                .getDirectoryHandle(
                    "data"
                );


        const sundayDirectory =

            await dataDirectory
                .getDirectoryHandle(
                    "sunday-disservice"
                );


        const indexHandle =

            await sundayDirectory
                .getFileHandle(
                    "archive-index.json"
                );


        const file =

            await indexHandle
                .getFile();


        const text =

            await file.text();


        const parsed =

            JSON.parse(
                text
            );


        return {

            version:

                Number(
                    parsed.version || 1
                ),


            sermons:

                sundayDisservicePublisherArray(
                    parsed.sermons
                )

        };

    }


    catch (
        error
    ) {


        console.warn(

            "Could not read the Sunday Disservice archive index:",

            error

        );


        return {

            version:
                1,

            sermons:
                []

        };

    }

}



// =================================
// NEXT SERMON NUMBER
// =================================


function sundayDisservicePublisherNextNumber() {


    const sermonNumbers =

        sundayDisservicePublisherArray(

            sundayDisservicePublisherState
                .archiveIndex
                .sermons

        )

            .map(

                sermon =>

                    Number(
                        sermon.sermon
                    )

            )

            .filter(
                Number.isFinite
            );


    return sermonNumbers.length

        ? Math.max(
            ...sermonNumbers
        ) + 1

        : 1;

}



// =================================
// PARAGRAPH PARSER
// =================================


function sundayDisservicePublisherParseParagraphs(
    value
) {


    return String(
        value || ""
    )

        .split(
            /\n\s*\n/
        )

        .map(

            paragraph =>

                paragraph
                    .trim()

        )

        .filter(
            Boolean
        );

}



// =================================
// EDITORIAL ENTRY PARSER
// =================================


function sundayDisservicePublisherParseEntries(
    value
) {


    return String(
        value || ""
    )

        .split(
            "\n"
        )

        .map(
            line =>
                line.trim()
        )

        .filter(
            Boolean
        )

        .map(

            line => {


                const parts =

                    line.split(
                        "|"
                    );


                const title =

                    String(
                        parts.shift() || ""
                    )
                        .trim();


                const body =

                    parts

                        .join(
                            "|"
                        )

                        .trim();


                return {

                    title,

                    body

                };

            }

        )

        .filter(
            entry =>
                entry.title
        );

}



// =================================
// REFERENCE PARSER
// =================================


function sundayDisservicePublisherParseReferences(
    value
) {


    return String(
        value || ""
    )

        .split(
            "\n"
        )

        .map(
            line =>
                line.trim()
        )

        .filter(
            Boolean
        )

        .map(

            line => {


                const parts =

                    line

                        .split(
                            "|"
                        )

                        .map(
                            part =>
                                part.trim()
                        );


                const type =

                    parts[0]

                    ||

                    "REFERENCE";


                const label =

                    parts[1]

                    ||

                    parts[0]

                    ||

                    "";


                const href =

                    parts

                        .slice(
                            2
                        )

                        .join(
                            "|"
                        )

                        .trim();


                return {

                    type:

                        String(
                            type
                        ).toUpperCase(),


                    label,


                    href

                };

            }

        )

        .filter(
            reference =>
                reference.label
        );

}



// =================================
// DRAFT
// =================================


function sundayDisservicePublisherDraft() {


    const sermonNumber =

        Number(

            sundayDisservicePublisherEls
                .sermon
                ?.value

        );


    const deliveryDate =

        sundayDisservicePublisherEls
            .date
            ?.value

        ||

        "";


    return {


        id:

            deliveryDate

                ? `sunday-disservice-${deliveryDate}`

                : "sunday-disservice-unpublished",


        file:

            deliveryDate

                ? `data/sunday-disservice/sunday-disservice-${deliveryDate}.json`

                : "—",


        sermon:
            sermonNumber,


        deliveryDate,


        label:

            deliveryDate

                ? sundayDisservicePublisherFormatDate(
                    deliveryDate
                )

                : "",


        host:
            "Trey Wise",


        headline:

            sundayDisservicePublisherEls
                .headline
                ?.value
                .trim()

            ||

            "",


        deck:

            sundayDisservicePublisherEls
                .deck
                ?.value
                .trim()

            ||

            "",


        argument: {

            title:

                sundayDisservicePublisherEls
                    .argumentTitle
                    ?.value
                    .trim()

                ||

                "",


            body:

                sundayDisservicePublisherParseParagraphs(

                    sundayDisservicePublisherEls
                        .argumentBody
                        ?.value

                )

        },


        praise:

            sundayDisservicePublisherParseEntries(

                sundayDisservicePublisherEls
                    .praise
                    ?.value

            ),


        condemnation:

            sundayDisservicePublisherParseEntries(

                sundayDisservicePublisherEls
                    .condemnation
                    ?.value

            ),


        favorites:

            sundayDisservicePublisherParseEntries(

                sundayDisservicePublisherEls
                    .favorites
                    ?.value

            ),


        blindSpots:

            sundayDisservicePublisherParseEntries(

                sundayDisservicePublisherEls
                    .blindSpots
                    ?.value

            ),


        references:

            sundayDisservicePublisherParseReferences(

                sundayDisservicePublisherEls
                    .references
                    ?.value

            ),


        closingWord:

            sundayDisservicePublisherEls
                .closingWord
                ?.value
                .trim()

            ||

            ""

    };

}



// =================================
// VALIDATION
// =================================


function sundayDisservicePublisherValidate(
    draft
) {


    if (
        !Number.isInteger(
            draft.sermon
        )

        ||

        draft.sermon < 1
    ) {


        return "Enter a valid sermon number.";

    }


    if (
        !draft.deliveryDate
    ) {


        return "Select the sermon delivery date.";

    }


    if (
        !sundayDisservicePublisherIsSunday(
            draft.deliveryDate
        )
    ) {


        return "Sunday Disservice must use a Sunday delivery date.";

    }


    const duplicateId =

        sundayDisservicePublisherArray(

            sundayDisservicePublisherState
                .archiveIndex
                .sermons

        )

            .some(

                sermon =>

                    sermon.id ===
                    draft.id

            );


    if (
        duplicateId
    ) {


        return "A Sunday Disservice sermon already exists for this date.";

    }


    const duplicateNumber =

        sundayDisservicePublisherArray(

            sundayDisservicePublisherState
                .archiveIndex
                .sermons

        )

            .some(

                sermon =>

                    Number(
                        sermon.sermon
                    )

                    ===
                    draft.sermon

            );


    if (
        duplicateNumber
    ) {


        return "That sermon number already exists in the archive.";

    }


    if (
        !draft.headline
    ) {


        return "Enter the sermon headline.";

    }


    if (
        !draft.deck
    ) {


        return "Enter the opening declaration.";

    }


    if (
        !draft.argument.title
    ) {


        return "Enter the main argument title.";

    }


    if (
        !draft.argument.body.length
    ) {


        return "Write at least one paragraph for the main argument.";

    }


    if (
        !draft.closingWord
    ) {


        return "Enter Trey Wise’s final proclamation.";

    }


    return "";

}



// =================================
// REVIEW ROW
// =================================


function sundayDisservicePublisherAppendReviewRow(
    label,
    value
) {


    if (
        !sundayDisservicePublisherEls.changeList
    ) {


        return;

    }


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
        value || "—";


    row.append(

        labelElement,

        valueElement

    );


    sundayDisservicePublisherEls
        .changeList
        .appendChild(
            row
        );

}



// =================================
// ENTRY COUNT TEXT
// =================================


function sundayDisservicePublisherEntryCount(
    entries
) {


    const count =

        sundayDisservicePublisherArray(
            entries
        ).length;


    return `${count} entr${

        count === 1

            ? "y"

            : "ies"

    }`;

}



// =================================
// PREVIEW
// =================================


function sundayDisservicePublisherRenderPreview() {


    if (
        !sundayDisservicePublisherEls.preview

        ||

        !sundayDisservicePublisherEls.changeList

        ||

        !sundayDisservicePublisherEls.publishButton
    ) {


        return;

    }


    const draft =

        sundayDisservicePublisherDraft();


    const validationError =

        sundayDisservicePublisherValidate(
            draft
        );


    sundayDisservicePublisherEls
        .changeList
        .innerHTML =
            "";


    sundayDisservicePublisherAppendReviewRow(

        "DATABASE ID",

        draft.id

    );


    sundayDisservicePublisherAppendReviewRow(

        "SERMON",

        Number.isInteger(
            draft.sermon
        )

            ? `Sermon ${draft.sermon}`

            : "—"

    );


    sundayDisservicePublisherAppendReviewRow(

        "DELIVERY DATE",

        draft.label

    );


    sundayDisservicePublisherAppendReviewRow(

        "HOST",

        draft.host

    );


    sundayDisservicePublisherAppendReviewRow(

        "HEADLINE",

        draft.headline

    );


    sundayDisservicePublisherAppendReviewRow(

        "ARGUMENT",

        draft.argument.title

    );


    sundayDisservicePublisherAppendReviewRow(

        "ARGUMENT PARAGRAPHS",

        String(
            draft.argument.body.length
        )

    );


    sundayDisservicePublisherAppendReviewRow(

        "PRAISE",

        sundayDisservicePublisherEntryCount(
            draft.praise
        )

    );


    sundayDisservicePublisherAppendReviewRow(

        "CONDEMNATION",

        sundayDisservicePublisherEntryCount(
            draft.condemnation
        )

    );


    sundayDisservicePublisherAppendReviewRow(

        "FAVORITES",

        sundayDisservicePublisherEntryCount(
            draft.favorites
        )

    );


    sundayDisservicePublisherAppendReviewRow(

        "BLIND SPOTS",

        sundayDisservicePublisherEntryCount(
            draft.blindSpots
        )

    );


    sundayDisservicePublisherAppendReviewRow(

        "REFERENCES",

        sundayDisservicePublisherEntryCount(
            draft.references
        )

    );


    sundayDisservicePublisherAppendReviewRow(

        "SERMON FILE",

        draft.file

    );


    sundayDisservicePublisherEls
        .preview
        .hidden =
            false;


    sundayDisservicePublisherEls
        .error
        .hidden =
            !validationError;


    sundayDisservicePublisherEls
        .error
        .textContent =
            validationError;


        sundayDisservicePublisherEls
        .publishButton
        .disabled =
            Boolean(
                validationError
            );


    sundayDisservicePublisherSetStatus(

        validationError

            ? "NEEDS INPUT"

            : "PREVIEW READY"

    );


    if (
        sundayDisservicePublisherEls.message
    ) {


        if (
            validationError
        ) {


            sundayDisservicePublisherEls
                .message
                .hidden =
                    true;

        }


        else {


                        sundayDisservicePublisherEls
                .message
                .textContent =

                    "Sermon preview is valid and ready to publish.";

            sundayDisservicePublisherEls
                .message
                .className =

                    "cr-save-message save-success";


            sundayDisservicePublisherEls
                .message
                .hidden =
                    false;

        }

    }

}



// =================================
// EVENT LISTENERS
// =================================


function sundayDisservicePublisherInstallListeners() {


    if (
        sundayDisservicePublisherState
            .listenersInstalled
    ) {


        return;

    }


    const liveFields = [

        sundayDisservicePublisherEls.sermon,

        sundayDisservicePublisherEls.date,

        sundayDisservicePublisherEls.headline,

        sundayDisservicePublisherEls.deck,

        sundayDisservicePublisherEls.argumentTitle,

        sundayDisservicePublisherEls.argumentBody,

        sundayDisservicePublisherEls.praise,

        sundayDisservicePublisherEls.condemnation,

        sundayDisservicePublisherEls.favorites,

        sundayDisservicePublisherEls.blindSpots,

        sundayDisservicePublisherEls.references,

        sundayDisservicePublisherEls.closingWord

    ];


    liveFields.forEach(

        field => {


            if (!field) {

                return;

            }


            field.addEventListener(

                "input",

                sundayDisservicePublisherRenderPreview

            );


            field.addEventListener(

                "change",

                sundayDisservicePublisherRenderPreview

            );

        }

    );


    sundayDisservicePublisherState
        .listenersInstalled =
            true;

}



// =================================
// INITIALISE
// =================================


async function initializeSundayDisservicePublisher() {


    if (
        !sundayDisservicePublisherEls.status

        ||

        !owlRepositoryHandle
    ) {


        return;

    }


    sundayDisservicePublisherSetStatus(
        "LOADING"
    );


    sundayDisservicePublisherState
        .archiveIndex =

            await sundayDisservicePublisherReadArchiveIndex();


    if (
        !sundayDisservicePublisherEls
            .sermon
            .value
    ) {


        sundayDisservicePublisherEls
            .sermon
            .value =

                sundayDisservicePublisherNextNumber();

    }


    if (
        !sundayDisservicePublisherEls
            .date
            .value
    ) {


        sundayDisservicePublisherEls
            .date
            .value =

                sundayDisservicePublisherUpcomingSunday();

    }


    sundayDisservicePublisherInstallListeners();


    sundayDisservicePublisherRenderPreview();

}


// =================================
// SAVED SERMON RECORD
// =================================


function sundayDisservicePublisherCreateSermonRecord(
    draft
) {


    return {

        id:
            draft.id,


        sermon:
            draft.sermon,


        deliveryDate:
            draft.deliveryDate,


        label:
            draft.label,


        host:
            draft.host,


        headline:
            draft.headline,


        deck:
            draft.deck,


        argument: {

            title:
                draft.argument.title,

            body: [
                ...draft.argument.body
            ]

        },


        praise: [
            ...draft.praise
        ],


        condemnation: [
            ...draft.condemnation
        ],


        favorites: [
            ...draft.favorites
        ],


        blindSpots: [
            ...draft.blindSpots
        ],


        references: [
            ...draft.references
        ],


        closingWord:
            draft.closingWord

    };

}



// =================================
// ARCHIVE ENTRY
// =================================


function sundayDisservicePublisherCreateArchiveEntry(
    draft
) {


    return {

        id:
            draft.id,


        sermon:
            draft.sermon,


        deliveryDate:
            draft.deliveryDate,


        label:
            draft.label,


        headline:
            draft.headline,


        file:
            draft.file

    };

}



// =================================
// WRITE PERMISSION
// =================================


async function sundayDisservicePublisherEnsureWritePermission() {


    if (
        !owlRepositoryHandle
    ) {


        return false;

    }


    const options = {

        mode:
            "readwrite"

    };


    if (

        typeof owlRepositoryHandle
            .queryPermission !==
            "function"

    ) {


        return true;

    }


    const currentPermission =

        await owlRepositoryHandle
            .queryPermission(
                options
            );


    if (
        currentPermission ===
        "granted"
    ) {


        return true;

    }


    if (

        typeof owlRepositoryHandle
            .requestPermission !==
            "function"

    ) {


        return false;

    }


    const requestedPermission =

        await owlRepositoryHandle
            .requestPermission(
                options
            );


    return requestedPermission ===
        "granted";

}



// =================================
// WRITE JSON
// =================================


async function sundayDisservicePublisherWriteJson(
    directoryHandle,
    fileName,
    value
) {


    const fileHandle =

        await directoryHandle
            .getFileHandle(

                fileName,

                {
                    create:
                        true
                }

            );


    const writable =

        await fileHandle
            .createWritable();


    await writable.write(

        `${JSON.stringify(

            value,

            null,

            4

        )}\n`

    );


    await writable.close();

}



// =================================
// PUBLISH
// =================================


async function sundayDisservicePublisherPublish() {


    const draft =

        sundayDisservicePublisherDraft();


    const validationError =

        sundayDisservicePublisherValidate(
            draft
        );


    if (
        validationError
    ) {


        sundayDisservicePublisherRenderPreview();


        return;

    }


    sundayDisservicePublisherEls
        .publishButton
        .disabled =
            true;


    sundayDisservicePublisherSetStatus(
        "PUBLISHING"
    );


    sundayDisservicePublisherEls
        .message
        .hidden =
            true;


    sundayDisservicePublisherEls
        .error
        .hidden =
            true;


    try {


        const hasPermission =

            await sundayDisservicePublisherEnsureWritePermission();


        if (
            !hasPermission
        ) {


            throw new Error(

                "Write permission was not granted."

            );

        }


        const dataDirectory =

            await owlRepositoryHandle
                .getDirectoryHandle(

                    "data",

                    {
                        create:
                            true
                    }

                );


        const sundayDirectory =

            await dataDirectory
                .getDirectoryHandle(

                    "sunday-disservice",

                    {
                        create:
                            true
                    }

                );


        const sermonRecord =

            sundayDisservicePublisherCreateSermonRecord(
                draft
            );


        const archiveEntry =

            sundayDisservicePublisherCreateArchiveEntry(
                draft
            );


        const existingSermons =

            sundayDisservicePublisherArray(

                sundayDisservicePublisherState
                    .archiveIndex
                    .sermons

            );


        const updatedIndex = {

            version:

                Number(

                    sundayDisservicePublisherState
                        .archiveIndex
                        .version

                    ||

                    1

                ),


            sermons: [

                ...existingSermons,

                archiveEntry

            ]

                .sort(

                    (
                        a,
                        b
                    ) =>

                        String(
                            b.id || ""
                        )

                            .localeCompare(

                                String(
                                    a.id || ""
                                )

                            )

                )

        };


        await sundayDisservicePublisherWriteJson(

            sundayDirectory,

            `${draft.id}.json`,

            sermonRecord

        );


        await sundayDisservicePublisherWriteJson(

            sundayDirectory,

            "archive-index.json",

            updatedIndex

        );


        sundayDisservicePublisherState
            .archiveIndex =
                updatedIndex;


        sundayDisservicePublisherSetStatus(
            "SAVED"
        );


        sundayDisservicePublisherEls
            .message
            .textContent =

                `Sermon ${draft.sermon} was published. Review ${draft.file} and data/sunday-disservice/archive-index.json in GitHub Desktop before committing.`;


        sundayDisservicePublisherEls
            .message
            .className =

                "cr-save-message save-success";


        sundayDisservicePublisherEls
            .message
            .hidden =
                false;


        sundayDisservicePublisherEls
            .publishButton
            .disabled =
                true;

    }


    catch (
        error
    ) {


        console.error(

            "Could not publish Sunday Disservice:",

            error

        );


        sundayDisservicePublisherSetStatus(
            "SAVE FAILED"
        );


        sundayDisservicePublisherEls
            .error
            .textContent =

                error.message

                ||

                "Sunday Disservice could not be published.";


        sundayDisservicePublisherEls
            .error
            .hidden =
                false;


        sundayDisservicePublisherEls
            .publishButton
            .disabled =
                false;

    }

}



// =================================
// PUBLISH BUTTON
// =================================


sundayDisservicePublisherEls
    .publishButton
    ?.addEventListener(

        "click",

        sundayDisservicePublisherPublish

    );
// =================================
// CONTROL ROOM DATA EVENT
// =================================


window.addEventListener(

    "owl-control-room-data-loaded",

    initializeSundayDisservicePublisher

);
