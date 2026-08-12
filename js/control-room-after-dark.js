// =================================
// OWL AFTER DARK
// CONTROL ROOM PUBLISHER
// =================================


// =================================
// ELEMENTS
// =================================


const afterDarkPublisherEls = {


    status:

        document.getElementById(
            "cr-after-dark-status"
        ),


    episode:

        document.getElementById(
            "cr-after-dark-episode"
        ),


    airDate:

        document.getElementById(
            "cr-after-dark-air-date"
        ),


    coverageLabel:

        document.getElementById(
            "cr-after-dark-coverage-label"
        ),


    headline:

        document.getElementById(
            "cr-after-dark-headline"
        ),


        deck:

        document.getElementById(
            "cr-after-dark-deck"
        ),


    tickerMode:

        document.getElementById(
            "cr-after-dark-ticker-mode"
        ),


    tickerItems:

        document.getElementById(
            "cr-after-dark-ticker-items"
        ),


    ascensionEvent:

        document.getElementById(
            "cr-after-dark-ascension-event"
        ),


    revoltEvent:

        document.getElementById(
            "cr-after-dark-revolt-event"
        ),


    ascensionSummary:

        document.getElementById(
            "cr-after-dark-ascension-summary"
        ),


    revoltSummary:

        document.getElementById(
            "cr-after-dark-revolt-summary"
        ),


    matchOfWeek:

        document.getElementById(
            "cr-after-dark-match-of-week"
        ),


    matchSummary:

        document.getElementById(
            "cr-after-dark-match-summary"
        ),


    titleChanges:

        document.getElementById(
            "cr-after-dark-title-changes"
        ),


    storyFallout:

        document.getElementById(
            "cr-after-dark-story-fallout"
        ),


    powerShifts:

        document.getElementById(
            "cr-after-dark-power-shifts"
        ),


    closingNote:

        document.getElementById(
            "cr-after-dark-closing-note"
        ),


    preview:

        document.getElementById(
            "cr-after-dark-preview"
        ),


    changeList:

        document.getElementById(
            "cr-after-dark-change-list"
        ),


    error:

        document.getElementById(
            "cr-after-dark-error"
        ),


    publishButton:

        document.getElementById(
            "cr-after-dark-publish"
        ),


    message:

        document.getElementById(
            "cr-after-dark-message"
        )

};



// =================================
// STATE
// =================================


const afterDarkPublisherState = {


    archiveIndex: {

        version:
            1,

        episodes:
            []

    },


    matchOfWeek:
        null,


    automaticTitleChanges:
        [],


    listenersInstalled:
        false

};



// =================================
// BASIC HELPERS
// =================================


function afterDarkPublisherArray(
    value
) {


    return Array.isArray(
        value
    )

        ? value

        : [];

}



function afterDarkPublisherNormalize(
    value
) {


    return String(
        value || ""
    )
        .trim()
        .toLowerCase();

}



function afterDarkPublisherFormatDate(
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



function afterDarkPublisherSetStatus(
    value
) {


    if (
        afterDarkPublisherEls.status
    ) {


        afterDarkPublisherEls
            .status
            .textContent =
                value;

    }

}



// =================================
// REPOSITORY ARCHIVE INDEX
// =================================


async function afterDarkPublisherReadArchiveIndex() {


    if (
        !owlRepositoryHandle
    ) {


        return {

            version:
                1,

            episodes:
                []

        };

    }


    try {


        const dataDirectory =

            await owlRepositoryHandle
                .getDirectoryHandle(
                    "data"
                );


        const afterDarkDirectory =

            await dataDirectory
                .getDirectoryHandle(
                    "after-dark"
                );


        const indexHandle =

            await afterDarkDirectory
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


            episodes:

                afterDarkPublisherArray(
                    parsed.episodes
                )

        };

    }


    catch (
        error
    ) {


        console.warn(

            "Could not read the OWL After Dark archive index:",

            error

        );


        return {

            version:
                1,

            episodes:
                []

        };

    }

}



// =================================
// DATABASE LOOKUPS
// =================================


function afterDarkPublisherEvents() {


    return afterDarkPublisherArray(
        owlControlRoomData.events
    );

}



function afterDarkPublisherMatches() {


    return afterDarkPublisherArray(
        owlControlRoomData.matches
    );

}



function afterDarkPublisherWrestlers() {


    return afterDarkPublisherArray(
        owlControlRoomData.wrestlers
    );

}



function afterDarkPublisherTeams() {


    return afterDarkPublisherArray(
        owlControlRoomData.teams
    );

}



function afterDarkPublisherChampionships() {


    return afterDarkPublisherArray(
        owlControlRoomData.championships
    );

}



function afterDarkPublisherEventById(
    eventId
) {


    return afterDarkPublisherEvents()
        .find(

            event =>

                event.id ===
                eventId

        )

        ||

        null;

}



function afterDarkPublisherEventMatches(
    eventId
) {


    return afterDarkPublisherMatches()
        .filter(

            match =>

                match.eventId ===
                eventId

                &&

                (

                    !match.status

                    ||

                    afterDarkPublisherNormalize(
                        match.status
                    )

                    ===
                    "completed"

                )

        );

}



// =================================
// NAME AND MATCH HELPERS
// =================================


function afterDarkPublisherWrestlerName(
    wrestlerId
) {


    const wrestler =

        afterDarkPublisherWrestlers()
            .find(

                item =>

                    item.id ===
                    wrestlerId

            );


    return wrestler

        ? wrestler.name

        : wrestlerId || "Unknown";

}



function afterDarkPublisherTeamName(
    teamId
) {


    const team =

        afterDarkPublisherTeams()
            .find(

                item =>

                    item.id ===
                    teamId

            );


    return team

        ? team.name

        : teamId || "Unknown Team";

}



function afterDarkPublisherSideText(
    side
) {


    if (
        Array.isArray(
            side?.wrestlers
        )

        &&

        side.wrestlers.length
    ) {


        return side.wrestlers

            .map(
                afterDarkPublisherWrestlerName
            )

            .join(
                " & "
            );

    }


    if (
        side?.teamId
    ) {


        return afterDarkPublisherTeamName(
            side.teamId
        );

    }


    return side?.name

        ||

        "Unknown";

}



function afterDarkPublisherMatchText(
    match
) {


    const sides =

        afterDarkPublisherArray(
            match?.sides
        );


    if (
        sides.length
    ) {


        return sides

            .map(
                afterDarkPublisherSideText
            )

            .join(
                " vs. "
            );

    }


    return match?.match

        ||

        match?.resultText

        ||

        match?.matchType

        ||

        "Untitled Match";

}



function afterDarkPublisherWinnerText(
    match
) {


    if (
        match?.winnerSide ===
        null

        ||

        match?.winnerSide ===
        undefined
    ) {


        return match?.winner

            ||

            "Draw";

    }


    const winningSide =

        afterDarkPublisherArray(
            match.sides
        )[
            match.winnerSide
        ];


    return winningSide

        ? afterDarkPublisherSideText(
            winningSide
        )

        : match?.winner || "—";

}



// =================================
// COMPLETED WEEKLY EVENTS
// =================================


function afterDarkPublisherCompletedEvents(
    brand
) {


    return afterDarkPublisherEvents()

        .filter(

            event => {


                const eventType =

                    afterDarkPublisherNormalize(
                        event.eventType
                    );


                const isWeekly =

                    eventType ===
                    "weekly"

                    ||

                    eventType ===
                    "weekly-show"

                    ||

                    eventType ===
                    "weekly show";


                return (

                    afterDarkPublisherNormalize(
                        event.status
                    )

                    ===
                    "completed"

                    &&

                    afterDarkPublisherNormalize(
                        event.brand
                    )

                    ===

                    afterDarkPublisherNormalize(
                        brand
                    )

                    &&

                    isWeekly

                );

            }

        )

        .sort(

            (
                a,
                b
            ) =>

                String(
                    b.date || ""
                )

                    .localeCompare(

                        String(
                            a.date || ""
                        )

                    )

        );

}



function afterDarkPublisherPopulateSelect(
    select,
    events,
    placeholder
) {


    if (!select) {

        return;

    }


    const previousValue =
        select.value;


    select.innerHTML =
        "";


    const placeholderOption =

        document.createElement(
            "option"
        );


    placeholderOption.value =
        "";


    placeholderOption.textContent =
        placeholder;


    select.appendChild(
        placeholderOption
    );


    events.forEach(

        event => {


            const option =

                document.createElement(
                    "option"
                );


            option.value =
                event.id;


            option.textContent =

                `${afterDarkPublisherFormatDate(

                    event.date

                )} — ${event.name || event.id}`;


            select.appendChild(
                option
            );

        }

    );


    if (

        previousValue

        &&

        events.some(
            event =>
                event.id ===
                previousValue
        )

    ) {


        select.value =
            previousValue;

    }


    else if (
        events.length
    ) {


        select.value =
            events[0].id;

    }

}



// =================================
// NEXT EPISODE NUMBER
// =================================


function afterDarkPublisherNextEpisodeNumber() {


    const episodeNumbers =

        afterDarkPublisherArray(
            afterDarkPublisherState
                .archiveIndex
                .episodes
        )

            .map(

                episode =>

                    Number(
                        episode.episode
                    )

            )

            .filter(
                Number.isFinite
            );


    return episodeNumbers.length

        ? Math.max(
            ...episodeNumbers
        ) + 1

        : 1;

}



// =================================
// MATCH OF THE WEEK
// =================================


function afterDarkPublisherFindMatchOfWeek() {


    const eventIds = [

        afterDarkPublisherEls
            .ascensionEvent
            ?.value,

        afterDarkPublisherEls
            .revoltEvent
            ?.value

    ]
        .filter(
            Boolean
        );


    if (
        eventIds.length < 2
    ) {


        return null;

    }


    const candidates =

        eventIds

            .flatMap(

                eventId => {


                    const event =

                        afterDarkPublisherEventById(
                            eventId
                        );


                    return afterDarkPublisherEventMatches(
                        eventId
                    )

                        .map(

                            match => ({

                                match,

                                event,

                                rating:

                                    Number(
                                        match.rating
                                    )

                            })

                        );

                }

            )

            .filter(

                item =>

                    Number.isFinite(
                        item.rating
                    )

            )

            .sort(

                (
                    a,
                    b
                ) =>

                    b.rating
                    -
                    a.rating

                    ||

                    Number(
                        b.match.starRating || 0
                    )

                    -

                    Number(
                        a.match.starRating || 0
                    )

            );


    return candidates[0]

        ||

        null;

}



function afterDarkPublisherRenderMatchOfWeek() {


    const selectedAscension =

        afterDarkPublisherEls
            .ascensionEvent
            ?.value;


    const selectedRevolt =

        afterDarkPublisherEls
            .revoltEvent
            ?.value;


    if (
        !selectedAscension

        ||

        !selectedRevolt
    ) {


        afterDarkPublisherState
            .matchOfWeek =
                null;


        afterDarkPublisherEls
            .matchOfWeek
            .textContent =

                "Select both weekly events first.";


        return;

    }


    const result =

        afterDarkPublisherFindMatchOfWeek();


    afterDarkPublisherState
        .matchOfWeek =
            result;


    if (!result) {


        afterDarkPublisherEls
            .matchOfWeek
            .textContent =

                "No rated matches were found across the selected events.";


        return;

    }


    const stars =

        result.match.starRating !==
        null

        &&

        result.match.starRating !==
        undefined

            ? `${result.match.starRating} ★`

            : "—";


    afterDarkPublisherEls
        .matchOfWeek
        .textContent =

            `${afterDarkPublisherMatchText(

                result.match

            )} — ${result.rating}% / ${stars} — ${

                result.event?.name || "OWL Event"

            }`;

}



// =================================
// AUTOMATIC TITLE CHANGES
// =================================


function afterDarkPublisherDetectTitleChanges() {


    const selectedEventIds = [

        afterDarkPublisherEls
            .ascensionEvent
            ?.value,

        afterDarkPublisherEls
            .revoltEvent
            ?.value

    ]
        .filter(
            Boolean
        );


    const championshipMap =

        Object.fromEntries(

            afterDarkPublisherChampionships()

                .map(

                    championship => [

                        championship.id,

                        championship

                    ]

                )

        );


    return selectedEventIds

        .flatMap(

            eventId => {


                const event =

                    afterDarkPublisherEventById(
                        eventId
                    );


                return afterDarkPublisherEventMatches(
                    eventId
                )

                    .filter(

                        match =>

                            afterDarkPublisherNormalize(
                                match.titleOutcome
                            )

                            ===
                            "changed"

                            &&

                            match.championshipId

                    )

                    .map(

                        match => {


                            const championship =

                                championshipMap[
                                    match.championshipId
                                ];


                            const titleName =

                                championship?.name

                                ||

                                match.championshipId;


                            return {


                                title:
                                    titleName,


                                body:

                                    `${afterDarkPublisherWinnerText(

                                        match

                                    )} won the ${titleName} at ${

                                        event?.name || "an OWL event"

                                    }.`

                            };

                        }

                    );

            }

        );

}



// =================================
// EDITORIAL LINE PARSER
// =================================


function afterDarkPublisherParseEntries(
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

        );

}



// =================================
// DRAFT
// =================================


function afterDarkPublisherDraft() {


    const ascensionEvent =

        afterDarkPublisherEventById(

            afterDarkPublisherEls
                .ascensionEvent
                ?.value

        );


    const revoltEvent =

        afterDarkPublisherEventById(

            afterDarkPublisherEls
                .revoltEvent
                ?.value

        );


    const episodeNumber =

        Number(
            afterDarkPublisherEls
                .episode
                ?.value
        );


    const airDate =

        afterDarkPublisherEls
            .airDate
            ?.value

        ||

        "";


    return {


        id:

            airDate

                ? `after-dark-${airDate}`

                : "after-dark-unpublished",


        file:

            airDate

                ? `data/after-dark/after-dark-${airDate}.json`

                : "—",


        episode:
            episodeNumber,


        airDate,


        label:

            airDate

                ? afterDarkPublisherFormatDate(
                    airDate
                )

                : "",


        coverageLabel:

            afterDarkPublisherEls
                .coverageLabel
                ?.value
                .trim()

            ||

            "ASCENSION + REVOLT",


        headline:

            afterDarkPublisherEls
                .headline
                ?.value
                .trim()

            ||

            "",


        deck:

            afterDarkPublisherEls
                .deck
                ?.value
                .trim()

            ||

            "",


        ascensionEvent,


        revoltEvent,


        ascensionSummary:

            afterDarkPublisherEls
                .ascensionSummary
                ?.value
                .trim()

            ||

            "",


        revoltSummary:

            afterDarkPublisherEls
                .revoltSummary
                ?.value
                .trim()

            ||

            "",


        matchOfWeek:

            afterDarkPublisherState
                .matchOfWeek,


        matchSummary:

            afterDarkPublisherEls
                .matchSummary
                ?.value
                .trim()

            ||

            "",


        automaticTitleChanges:

            afterDarkPublisherState
                .automaticTitleChanges,


        additionalTitleChanges:

            afterDarkPublisherParseEntries(

                afterDarkPublisherEls
                    .titleChanges
                    ?.value

            ),


        storyFallout:

            afterDarkPublisherParseEntries(

                afterDarkPublisherEls
                    .storyFallout
                    ?.value

            ),


        powerShifts:

            afterDarkPublisherParseEntries(

                afterDarkPublisherEls
                    .powerShifts
                    ?.value

            ),


        closingNote:

            afterDarkPublisherEls
                .closingNote
                ?.value
                .trim()

            ||

            ""

    };

}



// =================================
// VALIDATION
// =================================


function afterDarkPublisherValidate(
    draft
) {


    if (
        !Number.isInteger(
            draft.episode
        )

        ||

        draft.episode < 1
    ) {


        return "Enter a valid episode number.";

    }


    if (!draft.airDate) {

        return "Select the episode air date.";

    }


    const duplicateId =

        afterDarkPublisherArray(
            afterDarkPublisherState
                .archiveIndex
                .episodes
        )

            .some(

                episode =>

                    episode.id ===
                    draft.id

            );


    if (duplicateId) {

        return "An After Dark episode already exists for this air date.";

    }


    if (!draft.headline) {

        return "Enter the episode headline.";

    }


    if (!draft.deck) {

        return "Enter the episode introduction.";

    }


    if (!draft.ascensionEvent) {

        return "Select a completed Ascension event.";

    }


    if (!draft.revoltEvent) {

        return "Select a completed Revolt event.";

    }


    if (!draft.ascensionSummary) {

        return "Enter the Ascension summary.";

    }


    if (!draft.revoltSummary) {

        return "Enter the Revolt summary.";

    }


    if (

        draft.matchOfWeek

        &&

        !draft.matchSummary
    ) {


        return "Enter the Match of the Week analysis.";

    }


    if (!draft.closingNote) {

        return "Enter the final closing note.";

    }


    return "";

}



// =================================
// PREVIEW ROW
// =================================


function afterDarkPublisherAppendReviewRow(
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
        value || "—";


    row.append(

        labelElement,

        valueElement

    );


    afterDarkPublisherEls
        .changeList
        .appendChild(
            row
        );

}



// =================================
// PREVIEW
// =================================


function afterDarkPublisherRenderPreview() {


    const draft =

        afterDarkPublisherDraft();


    const validationError =

        afterDarkPublisherValidate(
            draft
        );


    afterDarkPublisherEls
        .changeList
        .innerHTML =
            "";


    afterDarkPublisherAppendReviewRow(

        "DATABASE ID",

        draft.id

    );


    afterDarkPublisherAppendReviewRow(

        "EPISODE",

        Number.isInteger(
            draft.episode
        )

            ? `Episode ${draft.episode}`

            : "—"

    );


    afterDarkPublisherAppendReviewRow(

        "AIR DATE",

        draft.label

    );


    afterDarkPublisherAppendReviewRow(

        "ASCENSION",

        draft.ascensionEvent?.name

        ||

        "—"

    );


    afterDarkPublisherAppendReviewRow(

        "REVOLT",

        draft.revoltEvent?.name

        ||

        "—"

    );


    afterDarkPublisherAppendReviewRow(

        "MATCH OF THE WEEK",

        draft.matchOfWeek

            ? afterDarkPublisherMatchText(
                draft.matchOfWeek.match
            )

            : "No rated match selected"

    );


    afterDarkPublisherAppendReviewRow(

        "AUTOMATIC TITLE CHANGES",

        draft.automaticTitleChanges.length

            ? draft.automaticTitleChanges

                .map(
                    entry =>
                        entry.title
                )

                .join(
                    ", "
                )

            : "None detected"

    );


    afterDarkPublisherAppendReviewRow(

        "ADDITIONAL TITLE NOTES",

        `${draft.additionalTitleChanges.length} entr${

            draft.additionalTitleChanges.length === 1

                ? "y"

                : "ies"

        }`

    );


    afterDarkPublisherAppendReviewRow(

        "STORY FALLOUT",

        `${draft.storyFallout.length} entr${

            draft.storyFallout.length === 1

                ? "y"

                : "ies"

        }`

    );


    afterDarkPublisherAppendReviewRow(

        "POWER SHIFTS",

        `${draft.powerShifts.length} entr${

            draft.powerShifts.length === 1

                ? "y"

                : "ies"

        }`

    );


    afterDarkPublisherAppendReviewRow(

        "EPISODE FILE",

        draft.file

    );


    afterDarkPublisherEls
        .preview
        .hidden =
            false;


    afterDarkPublisherEls
        .error
        .hidden =
            !validationError;


    afterDarkPublisherEls
        .error
        .textContent =
            validationError;


      afterDarkPublisherEls
        .publishButton
        .disabled =
            Boolean(
                validationError
            );


    afterDarkPublisherSetStatus(

        validationError

            ? "NEEDS INPUT"

            : "PREVIEW READY"

    );


    if (
        afterDarkPublisherEls.message
    ) {


        if (validationError) {


            afterDarkPublisherEls
                .message
                .hidden =
                    true;

        }


        else {


                        afterDarkPublisherEls
                .message
                .textContent =

                    "Episode preview is valid and ready to publish.";


            afterDarkPublisherEls
                .message
                .className =

                    "cr-save-message save-success";


            afterDarkPublisherEls
                .message
                .hidden =
                    false;

        }

    }

}



// =================================
// REFRESH AUTOMATIC DATA
// =================================


function afterDarkPublisherRefresh() {


    afterDarkPublisherRenderMatchOfWeek();


    afterDarkPublisherState
        .automaticTitleChanges =

            afterDarkPublisherDetectTitleChanges();


    afterDarkPublisherRenderPreview();

}



// =================================
// EVENT LISTENERS
// =================================


function afterDarkPublisherInstallListeners() {


    if (
        afterDarkPublisherState
            .listenersInstalled
    ) {


        return;

    }


    const liveFields = [

        afterDarkPublisherEls.episode,

        afterDarkPublisherEls.airDate,

        afterDarkPublisherEls.coverageLabel,

        afterDarkPublisherEls.headline,

        afterDarkPublisherEls.deck,

        afterDarkPublisherEls.ascensionSummary,

        afterDarkPublisherEls.revoltSummary,

        afterDarkPublisherEls.matchSummary,

        afterDarkPublisherEls.titleChanges,

        afterDarkPublisherEls.storyFallout,

        afterDarkPublisherEls.powerShifts,

        afterDarkPublisherEls.closingNote

    ];


    liveFields.forEach(

        field => {


            if (!field) {

                return;

            }


            field.addEventListener(

                "input",

                afterDarkPublisherRefresh

            );


            field.addEventListener(

                "change",

                afterDarkPublisherRefresh

            );

        }

    );


    afterDarkPublisherEls
        .ascensionEvent
        .addEventListener(

            "change",

            afterDarkPublisherRefresh

        );


    afterDarkPublisherEls
        .revoltEvent
        .addEventListener(

            "change",

            () => {


                const revoltEvent =

                    afterDarkPublisherEventById(

                        afterDarkPublisherEls
                            .revoltEvent
                            .value

                    );


                if (
                    revoltEvent?.date
                ) {


                    afterDarkPublisherEls
                        .airDate
                        .value =
                            revoltEvent.date;

                }


                afterDarkPublisherRefresh();

            }

        );


    afterDarkPublisherState
        .listenersInstalled =
            true;

}



// =================================
// INITIALISE
// =================================


async function initializeAfterDarkPublisher() {


    if (
        !afterDarkPublisherEls.status

        ||

        !owlRepositoryHandle
    ) {


        return;

    }


    afterDarkPublisherSetStatus(
        "LOADING"
    );


    afterDarkPublisherState
        .archiveIndex =

            await afterDarkPublisherReadArchiveIndex();


    const ascensionEvents =

        afterDarkPublisherCompletedEvents(
            "Ascension"
        );


    const revoltEvents =

        afterDarkPublisherCompletedEvents(
            "Revolt"
        );


    afterDarkPublisherPopulateSelect(

        afterDarkPublisherEls
            .ascensionEvent,

        ascensionEvents,

        ascensionEvents.length

            ? "Select Completed Ascension"

            : "No Completed Ascension Events"

    );


    afterDarkPublisherPopulateSelect(

        afterDarkPublisherEls
            .revoltEvent,

        revoltEvents,

        revoltEvents.length

            ? "Select Completed Revolt"

            : "No Completed Revolt Events"

    );


    if (
        !afterDarkPublisherEls
            .episode
            .value
    ) {


        afterDarkPublisherEls
            .episode
            .value =

                afterDarkPublisherNextEpisodeNumber();

    }


    const selectedRevolt =

        afterDarkPublisherEventById(

            afterDarkPublisherEls
                .revoltEvent
                .value

        );


    if (
        selectedRevolt?.date

        &&

        !afterDarkPublisherEls
            .airDate
            .value
    ) {


        afterDarkPublisherEls
            .airDate
            .value =
                selectedRevolt.date;

    }


    afterDarkPublisherInstallListeners();


    afterDarkPublisherRefresh();

}


// =================================
// SAVED MATCH VALUES
// =================================


function afterDarkPublisherSavedRating(
    match
) {


    const rating =

        Number(
            match?.rating
        );


    return Number.isFinite(
        rating
    )

        ? rating

        : null;

}



function afterDarkPublisherSavedStars(
    match
) {


    const stars =

        Number(

            match?.starRating

            ??

            match?.stars

        );


    return Number.isFinite(
        stars
    )

        ? stars

        : null;

}



// =================================
// SAVED RESULT
// =================================


function afterDarkPublisherCreateResult(
    match
) {


    return {

        matchType:

            match?.matchType

            ||

            match?.stipulation

            ||

            "MATCH",


        match:

            afterDarkPublisherMatchText(
                match
            ),


        winner:

            afterDarkPublisherWinnerText(
                match
            ),


        rating:

            afterDarkPublisherSavedRating(
                match
            ),


        stars:

            afterDarkPublisherSavedStars(
                match
            )

    };

}



// =================================
// SAVED SHOW RECAP
// =================================


function afterDarkPublisherCreateShow(
    event,
    summary
) {


    return {

        eventId:

            event?.id

            ||

            "",


        name:

            event?.name

            ||

            "OWL Weekly Event",


        date:

            event?.date

            ||

            "",


        dateLabel:

            event?.date

                ? afterDarkPublisherFormatDate(
                    event.date
                )

                : "",


        summary:

            summary

            ||

            "",


        results:

            event?.id

                ? afterDarkPublisherEventMatches(
                    event.id
                )
                    .map(
                        afterDarkPublisherCreateResult
                    )

                : []

    };

}



// =================================
// SAVED EPISODE
// =================================


function afterDarkPublisherCreateEpisodeRecord(
    draft
) {


    const featuredMatch =

        draft.matchOfWeek;


    return {

        id:
            draft.id,


        episode:
            draft.episode,


        airDate:
            draft.airDate,


        label:
            draft.label,


        coverageLabel:
            draft.coverageLabel,


        headline:
            draft.headline,


        deck:
            draft.deck,


        ascension:

            afterDarkPublisherCreateShow(

                draft.ascensionEvent,

                draft.ascensionSummary

            ),


        revolt:

            afterDarkPublisherCreateShow(

                draft.revoltEvent,

                draft.revoltSummary

            ),


        matchOfWeek:

            featuredMatch

                ? {

                    eventId:

                        featuredMatch
                            .event
                            ?.id

                        ||

                        "",


                    eventName:

                        featuredMatch
                            .event
                            ?.name

                        ||

                        "OWL Event",


                    match:

                        afterDarkPublisherMatchText(

                            featuredMatch.match

                        ),


                    summary:

                        draft.matchSummary,


                    rating:

                        afterDarkPublisherSavedRating(

                            featuredMatch.match

                        ),


                    stars:

                        afterDarkPublisherSavedStars(

                            featuredMatch.match

                        )

                }

                : null,


        titleChanges: [

            ...draft.automaticTitleChanges,

            ...draft.additionalTitleChanges

        ],


        storyFallout:
            draft.storyFallout,


        powerShifts:
            draft.powerShifts,


        closingNote:
            draft.closingNote

    };

}



// =================================
// ARCHIVE ENTRY
// =================================


function afterDarkPublisherCreateArchiveEntry(
    draft
) {


    return {

        id:
            draft.id,


        episode:
            draft.episode,


        airDate:
            draft.airDate,


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


async function afterDarkPublisherEnsureWritePermission() {


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


async function afterDarkPublisherWriteJson(
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


async function afterDarkPublisherPublish() {


    const draft =

        afterDarkPublisherDraft();


    const validationError =

        afterDarkPublisherValidate(
            draft
        );


    if (
        validationError
    ) {


        afterDarkPublisherRenderPreview();


        return;

    }


    afterDarkPublisherEls
        .publishButton
        .disabled =
            true;


    afterDarkPublisherSetStatus(
        "PUBLISHING"
    );


    afterDarkPublisherEls
        .message
        .hidden =
            true;


    afterDarkPublisherEls
        .error
        .hidden =
            true;


    try {


        const hasPermission =

            await afterDarkPublisherEnsureWritePermission();


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


        const afterDarkDirectory =

            await dataDirectory
                .getDirectoryHandle(

                    "after-dark",

                    {
                        create:
                            true
                    }

                );


        const episodeRecord =

            afterDarkPublisherCreateEpisodeRecord(
                draft
            );


        const archiveEntry =

            afterDarkPublisherCreateArchiveEntry(
                draft
            );


        const existingEpisodes =

            afterDarkPublisherArray(

                afterDarkPublisherState
                    .archiveIndex
                    .episodes

            );


        const updatedIndex = {

            version:

                Number(

                    afterDarkPublisherState
                        .archiveIndex
                        .version

                    ||

                    1

                ),


            episodes: [

                ...existingEpisodes,

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


        await afterDarkPublisherWriteJson(

            afterDarkDirectory,

            `${draft.id}.json`,

            episodeRecord

        );


        await afterDarkPublisherWriteJson(

            afterDarkDirectory,

            "archive-index.json",

            updatedIndex

        );


        afterDarkPublisherState
            .archiveIndex =
                updatedIndex;


        afterDarkPublisherSetStatus(
            "SAVED"
        );


        afterDarkPublisherEls
            .message
            .textContent =

                `Episode ${draft.episode} was published. Review ${draft.file} and data/after-dark/archive-index.json in GitHub Desktop before committing.`;


        afterDarkPublisherEls
            .message
            .className =

                "cr-save-message save-success";


        afterDarkPublisherEls
            .message
            .hidden =
                false;


        afterDarkPublisherEls
            .publishButton
            .disabled =
                true;

    }


    catch (
        error
    ) {


        console.error(

            "Could not publish OWL After Dark:",

            error

        );


        afterDarkPublisherSetStatus(
            "SAVE FAILED"
        );


        afterDarkPublisherEls
            .error
            .textContent =

                error.message

                ||

                "OWL After Dark could not be published.";


        afterDarkPublisherEls
            .error
            .hidden =
                false;


        afterDarkPublisherEls
            .publishButton
            .disabled =
                false;

    }

}



// =================================
// PUBLISH BUTTON
// =================================


afterDarkPublisherEls
    .publishButton
    ?.addEventListener(

        "click",

        afterDarkPublisherPublish

    );
// =================================
// CONTROL ROOM DATA EVENT
// =================================


window.addEventListener(

    "owl-control-room-data-loaded",

    initializeAfterDarkPublisher

);
