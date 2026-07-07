// =================================
// OWL CONTROL ROOM
// MATCH BOOKER
// =================================


// =================================
// ELEMENTS
// =================================


const crBookerMode =
    document.getElementById(
        "cr-booker-mode"
    );


const crBookerEvent =
    document.getElementById(
        "cr-booker-event"
    );


const crBookerMatchSelectRow =
    document.getElementById(
        "cr-booker-match-select-row"
    );


const crBookerMatchSelect =
    document.getElementById(
        "cr-booker-match-select"
    );


const crBookerStatus =
    document.getElementById(
        "cr-booker-status"
    );


const crBookerPreview =
    document.getElementById(
        "cr-booker-preview"
    );


const crBookerReviewList =
    document.getElementById(
        "cr-booker-review-list"
    );


const crBookerError =
    document.getElementById(
        "cr-booker-error"
    );


const crBookerSave =
    document.getElementById(
        "cr-booker-save"
    );


const crBookerMessage =
    document.getElementById(
        "cr-booker-message"
    );



// =================================
// ADVANCED MATCH ELEMENTS
// =================================


const crBookerStandardCompetitors =
    document.getElementById(
        "cr-booker-standard-competitors"
    );


const crBookerAdvancedMatch =
    document.getElementById(
        "cr-booker-advanced-match"
    );


const crBookerParticipantCountRow =
    document.getElementById(
        "cr-booker-participant-count-row"
    );


const crBookerParticipantCount =
    document.getElementById(
        "cr-booker-participant-count"
    );


const crBookerEliminationRuleRow =
    document.getElementById(
        "cr-booker-elimination-rule-row"
    );


const crBookerEliminationRule =
    document.getElementById(
        "cr-booker-elimination-rule"
    );


const crBookerDivisionRow =
    document.getElementById(
        "cr-booker-division-row"
    );


const crBookerDivision =
    document.getElementById(
        "cr-booker-division"
    );


const crBookerAdvancedParticipants =
    document.getElementById(
        "cr-booker-advanced-participants"
    );



// =================================
// MATCH FIELDS
// =================================


const crBookerMatchType =
    document.getElementById(
        "cr-booker-match-type"
    );


const crBookerOrder =
    document.getElementById(
        "cr-booker-order"
    );


const crBookerChampionship =
    document.getElementById(
        "cr-booker-championship"
    );


const crBookerStatusField =
    document.getElementById(
        "cr-booker-status-field"
    );


const crBookerStipulation =
    document.getElementById(
        "cr-booker-stipulation"
    );


const crBookerStatusNote =
    document.getElementById(
        "cr-booker-status-note"
    );



// =================================
// SIDE 1
// =================================


const crBookerSideOneTagControls =
    document.getElementById(
        "cr-booker-side-one-tag-controls"
    );


const crBookerSideOneMode =
    document.getElementById(
        "cr-booker-side-one-mode"
    );


const crBookerSideOneTeamRow =
    document.getElementById(
        "cr-booker-side-one-team-row"
    );


const crBookerSideOneTeam =
    document.getElementById(
        "cr-booker-side-one-team"
    );


const crBookerSideOneWrestlers =
    document.getElementById(
        "cr-booker-side-one-wrestlers"
    );


const crBookerSideOneWrestlerOne =
    document.getElementById(
        "cr-booker-side-one-wrestler-one"
    );


const crBookerSideOneWrestlerTwoRow =
    document.getElementById(
        "cr-booker-side-one-wrestler-two-row"
    );


const crBookerSideOneWrestlerTwo =
    document.getElementById(
        "cr-booker-side-one-wrestler-two"
    );



// =================================
// SIDE 2
// =================================


const crBookerSideTwoTagControls =
    document.getElementById(
        "cr-booker-side-two-tag-controls"
    );


const crBookerSideTwoMode =
    document.getElementById(
        "cr-booker-side-two-mode"
    );


const crBookerSideTwoTeamRow =
    document.getElementById(
        "cr-booker-side-two-team-row"
    );


const crBookerSideTwoTeam =
    document.getElementById(
        "cr-booker-side-two-team"
    );


const crBookerSideTwoWrestlers =
    document.getElementById(
        "cr-booker-side-two-wrestlers"
    );


const crBookerSideTwoWrestlerOne =
    document.getElementById(
        "cr-booker-side-two-wrestler-one"
    );


const crBookerSideTwoWrestlerTwoRow =
    document.getElementById(
        "cr-booker-side-two-wrestler-two-row"
    );


const crBookerSideTwoWrestlerTwo =
    document.getElementById(
        "cr-booker-side-two-wrestler-two"
    );



// =================================
// EXTRA SIDES
// =================================


const crBookerSideThree =
    document.getElementById(
        "cr-booker-side-three"
    );


const crBookerSideThreeWrestler =
    document.getElementById(
        "cr-booker-side-three-wrestler"
    );


const crBookerSideFour =
    document.getElementById(
        "cr-booker-side-four"
    );


const crBookerSideFourWrestler =
    document.getElementById(
        "cr-booker-side-four-wrestler"
    );



// =================================
// STATE
// =================================


let crBookerOriginalRecord =
    null;


let crBookerPendingMatchId =
    "";



// =================================
// MATCH STRUCTURE MODES
// =================================


const CR_BOOKER_STRUCTURE_MODES = {

    STANDARD:
        "standard",

    FREE_FOR_ALL:
        "freeForAll",

    TEAM_BATTLE:
        "teamBattle",

    DEFERRED_ROSTER:
        "deferredRoster",

    SPECIAL_FIELD:
        "specialField"

};



// =================================
// SPECIALTY MATCH PROFILES
// =================================


const CR_BOOKER_SPECIALTY_PROFILES = {


    "Battle Royal": {

        mode:
            CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL,

        minParticipants:
            3,

        maxParticipants:
            8,

        defaultParticipants:
            6,

        allowParticipantCountChange:
            true,

        requiresEliminationRule:
            true

    },



    "Hex-Cell Eliminator": {

        mode:
            CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL,

        minParticipants:
            6,

        maxParticipants:
            6,

        defaultParticipants:
            6,

        allowParticipantCountChange:
            false

    },



    "The Devil's Contract": {

        mode:
            CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL,

        minParticipants:
            6,

        maxParticipants:
            6,

        defaultParticipants:
            6,

        allowParticipantCountChange:
            false

    },



    "Fate's Wheel": {

        mode:
            CR_BOOKER_STRUCTURE_MODES.SPECIAL_FIELD,

        minParticipants:
            8,

        maxParticipants:
            8,

        defaultParticipants:
            8,

        allowParticipantCountChange:
            false

    },



    "Love and War": {

        mode:
            CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE

    },



    "Overthrow Rumble": {

        mode:
            CR_BOOKER_STRUCTURE_MODES.DEFERRED_ROSTER,

        participantCount:
            30,

        requiresParticipantSelection:
            false

    },



    "Elimination Match": {

        mode:
            null,

        requiresStructureChoice:
            true,

        allowedModes: [

            CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL,

            CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE

        ]

    }

};



// =================================
// BATTLE ROYAL RULES
// =================================


const CR_BOOKER_BATTLE_ROYAL_RULES = [

    "Over the Top Rope",

    "Pinfall or Submission",

    "All Three (Over the Top Rope, Pinfall, or Submission)"

];



// =================================
// SPECIALTY PROFILE HELPERS
// =================================


function crBookerGetSpecialtyProfile(
    stipulation
) {

    if (!stipulation) {

        return null;

    }


    return (

        CR_BOOKER_SPECIALTY_PROFILES[
            stipulation
        ]

        ||

        null

    );

}



function crBookerGetStructureMode(
    stipulation
) {

    const profile =
        crBookerGetSpecialtyProfile(
            stipulation
        );


    if (!profile) {

        return CR_BOOKER_STRUCTURE_MODES.STANDARD;

    }


    return profile.mode;

}



// =================================
// BASIC HELPERS
// =================================


function crBookerSetStatus(
    text
) {

    crBookerStatus.textContent =
        text;

}



function crBookerShowMessage(
    message,
    type
) {

    crBookerMessage.textContent =
        message;


    crBookerMessage.className =
        `cr-save-message ${type}`;


    crBookerMessage.hidden =
        false;

}



function crBookerHideMessage() {

    crBookerMessage.textContent =
        "";


    crBookerMessage.hidden =
        true;

}



function crBookerGetWrestler(
    wrestlerId
) {

    return owlControlRoomData.wrestlers.find(
        wrestler =>
            wrestler.id === wrestlerId
    ) || null;

}



function crBookerGetWrestlerName(
    wrestlerId
) {

    const wrestler =
        crBookerGetWrestler(
            wrestlerId
        );


    return wrestler
        ? wrestler.name
        : wrestlerId;

}



function crBookerGetTeam(
    teamId
) {

    return owlControlRoomData.teams.find(
        team =>
            team.id === teamId
    ) || null;

}



function crBookerGetChampionshipName(
    championshipId
) {

    if (!championshipId) {

        return "Non-Title Match";

    }


    const championship =
        owlControlRoomData.championships.find(
            item =>
                item.id === championshipId
        );


    return championship
        ? championship.name
        : championshipId;

}



function crBookerSignature(
    wrestlerIds
) {

    return [...wrestlerIds]
        .sort()
        .join("|");

}



function crBookerGetOfficialTeamByMembers(
    wrestlerIds
) {

    const signature =
        crBookerSignature(
            wrestlerIds
        );


    return owlControlRoomData.teams.find(
        team =>

            Array.isArray(
                team.members
            )

            &&

            team.members.length === 2

            &&

            crBookerSignature(
                team.members
            ) === signature

    ) || null;

}



function crBookerFormatSide(
    side
) {

    const wrestlerIds =
        Array.isArray(
            side.wrestlers
        )
            ? side.wrestlers
            : [];


    const officialTeam =
        wrestlerIds.length === 2

            ? crBookerGetOfficialTeamByMembers(
                wrestlerIds
            )

            : null;


    if (officialTeam) {

        return officialTeam.name;

    }


    return wrestlerIds
        .map(
            crBookerGetWrestlerName
        )
        .join(" & ");

}



function crBookerFormatMatch(
    match
) {

    if (
        !match ||
        !Array.isArray(
            match.sides
        )
    ) {

        return "Unknown Match";

    }


    return match.sides
        .map(
            crBookerFormatSide
        )
        .join(" vs. ");

}



// =================================
// POPULATE SELECT HELPERS
// =================================


function crBookerPopulateWrestlerSelect(
    selectElement
) {

    const oldValue =
        selectElement.value;


    selectElement.innerHTML = `

        <option value="">
            Select Wrestler
        </option>

    `;


    const wrestlers =
        [...owlControlRoomData.wrestlers]
            .sort(
                (a, b) =>

                    String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        )
                    )
            );


    wrestlers.forEach(
        wrestler => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                wrestler.id;


            option.textContent =
                wrestler.name;


            selectElement.appendChild(
                option
            );

        }
    );


    if (
        oldValue

        &&

        wrestlers.some(
            wrestler =>
                wrestler.id === oldValue
        )
    ) {

        selectElement.value =
            oldValue;

    }

}



function crBookerPopulateTeamSelect(
    selectElement
) {

    const oldValue =
        selectElement.value;


    selectElement.innerHTML = `

        <option value="">
            Select Team
        </option>

    `;


    const teams =
        [...owlControlRoomData.teams]
            .sort(
                (a, b) =>

                    String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        )
                    )
            );


    teams.forEach(
        team => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                team.id;


            option.textContent =
                team.name;


            selectElement.appendChild(
                option
            );

        }
    );


    if (
        oldValue

        &&

        teams.some(
            team =>
                team.id === oldValue
        )
    ) {

        selectElement.value =
            oldValue;

    }

}



function crBookerPopulateChampionships() {

    const oldValue =
        crBookerChampionship.value;


    crBookerChampionship.innerHTML = `

        <option value="">
            Non-Title Match
        </option>

    `;


    const championships =
        [...owlControlRoomData.championships]
            .sort(
                (a, b) =>

                    String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        )
                    )
            );


    championships.forEach(
        championship => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                championship.id;


            option.textContent =
                championship.name;


            crBookerChampionship.appendChild(
                option
            );

        }
    );


    if (
        oldValue

        &&

        championships.some(
            championship =>
                championship.id === oldValue
        )
    ) {

        crBookerChampionship.value =
            oldValue;

    }

}



// =================================
// ADVANCED PARTICIPANT HELPERS
// =================================


function crBookerGetAdvancedParticipantSelects() {

    return [

        ...crBookerAdvancedParticipants.querySelectorAll(
            "[data-cr-booker-participant='true']"
        )

    ];

}



function crBookerBuildAdvancedIndividualSides() {

    return crBookerGetAdvancedParticipantSelects()
        .map(
            selectElement => ({

                wrestlers:
                    [
                        selectElement.value
                    ].filter(Boolean)

            })
        );

}



// =================================
// ADVANCED PARTICIPANTS
// =================================


function crBookerRenderAdvancedParticipants(
    participantCount,
    wrestlerIds = []
) {

    const existingValues =

        wrestlerIds.length > 0

            ? wrestlerIds

            : crBookerGetAdvancedParticipantSelects()
                .map(
                    selectElement =>
                        selectElement.value
                );


    const count =
        Number(
            participantCount
        ) || 6;


    crBookerAdvancedParticipants.innerHTML =
        "";


    const grid =
        document.createElement(
            "div"
        );


    grid.className =
        "cr-booker-wrestler-grid";


    for (
        let index = 0;
        index < count;
        index += 1
    ) {

        const group =
            document.createElement(
                "div"
            );


        group.className =
            "cr-form-group";


        const label =
            document.createElement(
                "label"
            );


        const select =
            document.createElement(
                "select"
            );


        const selectId =
            `cr-booker-advanced-participant-${index + 1}`;


        label.htmlFor =
            selectId;


        label.textContent =
            `PARTICIPANT ${index + 1}`;


        select.id =
            selectId;


        select.dataset.crBookerParticipant =
            "true";


        crBookerPopulateWrestlerSelect(
            select
        );


        if (
            existingValues[index]
        ) {

            select.value =
                existingValues[index];

        }


        select.addEventListener(
            "input",
            crBookerReview
        );


        select.addEventListener(
            "change",
            crBookerReview
        );


        group.appendChild(
            label
        );


        group.appendChild(
            select
        );


        grid.appendChild(
            group
        );

    }


    crBookerAdvancedParticipants.appendChild(
        grid
    );


    crBookerAdvancedParticipants.hidden =
        false;

}



// =================================
// ADVANCED MATCH LAYOUT
// =================================


function crBookerRefreshAdvancedMatchLayout() {

    const stipulation =
        crBookerStipulation.value;


    const isBattleRoyal =
        stipulation ===
            "Battle Royal";


    const isHexCell =
        stipulation ===
            "Hex-Cell Eliminator";


    const isDevilsContract =
        stipulation ===
            "The Devil's Contract";


    const isFatesWheel =
        stipulation ===
            "Fate's Wheel";


    const isOverthrowRumble =
        stipulation ===
            "Overthrow Rumble";


    const usesAdvancedParticipants =
        isBattleRoyal ||
        isHexCell ||
        isDevilsContract ||
        isFatesWheel;


    const usesAdvancedLayout =
        usesAdvancedParticipants ||
        isOverthrowRumble;


    crBookerAdvancedMatch.hidden =
        !usesAdvancedLayout;


    crBookerParticipantCountRow.hidden =
        !isBattleRoyal;


    crBookerParticipantCountRow.style.display =

        isBattleRoyal

            ? ""

            : "none";


    crBookerEliminationRuleRow.hidden =
        !isBattleRoyal;


    crBookerEliminationRuleRow.style.display =

        isBattleRoyal

            ? ""

            : "none";


    crBookerDivisionRow.hidden =
        !isOverthrowRumble;


    crBookerDivisionRow.style.display =

        isOverthrowRumble

            ? ""

            : "none";


    crBookerAdvancedParticipants.hidden =
        !usesAdvancedParticipants;


    crBookerStandardCompetitors.hidden =
        usesAdvancedLayout;


    if (usesAdvancedParticipants) {

        const currentSelects =
            crBookerGetAdvancedParticipantSelects();


        const desiredCount =

            isFatesWheel

                ? 8

                : isHexCell ||
                  isDevilsContract

                    ? 6

                    : Number(
                        crBookerParticipantCount.value
                    ) || 6;


        if (
            currentSelects.length !==
                desiredCount
        ) {

            crBookerRenderAdvancedParticipants(
                desiredCount
            );

        }

    }


    else {

        crBookerAdvancedParticipants.innerHTML =
            "";

    }


    crBookerReview();

}

// =================================
// POPULATE EVENTS
// =================================


function crBookerPopulateEvents() {

    const oldValue =
        crBookerEvent.value;


    crBookerEvent.innerHTML = `

        <option value="">
            Select Event
        </option>

    `;


    const events =
        [...owlControlRoomData.events]
            .filter(
                event =>
                    String(
                        event.status || ""
                    ).toLowerCase() !== "completed"
            )
            .sort(
                (a, b) =>

                    new Date(
                        `${a.date}T00:00:00`
                    )

                    -

                    new Date(
                        `${b.date}T00:00:00`
                    )
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
                `${event.date} — ${event.name}`;


            crBookerEvent.appendChild(
                option
            );

        }
    );


    if (
        oldValue

        &&

        events.some(
            event =>
                event.id === oldValue
        )
    ) {

        crBookerEvent.value =
            oldValue;

    }

}



// =================================
// POPULATE ALL OPTIONS
// =================================


function crBookerPopulateOptions() {

    crBookerPopulateEvents();


    crBookerPopulateChampionships();


    [
        crBookerSideOneWrestlerOne,
        crBookerSideOneWrestlerTwo,
        crBookerSideTwoWrestlerOne,
        crBookerSideTwoWrestlerTwo,
        crBookerSideThreeWrestler,
        crBookerSideFourWrestler
    ].forEach(
        crBookerPopulateWrestlerSelect
    );


    [
        crBookerSideOneTeam,
        crBookerSideTwoTeam
    ].forEach(
        crBookerPopulateTeamSelect
    );


    crBookerRefreshMatchList();

}



// =================================
// NEXT MATCH ID
// =================================


function crBookerGetNextMatchId() {

    let highestNumber =
        0;


    owlControlRoomData.announcedMatches.forEach(
        match => {

            const idMatch =
                /^announced-(\d+)$/.exec(
                    match.id || ""
                );


            if (!idMatch) {

                return;

            }


            highestNumber =
                Math.max(
                    highestNumber,
                    Number(
                        idMatch[1]
                    )
                );

        }
    );


    return `announced-${String(
        highestNumber + 1
    ).padStart(4, "0")}`;

}



// =================================
// EVENT MATCHES
// =================================


function crBookerGetEventMatches() {

    const eventId =
        crBookerEvent.value;


    if (!eventId) {

        return [];

    }


    return owlControlRoomData.announcedMatches
        .filter(
            match =>
                match.eventId === eventId
        )
        .sort(
            (a, b) =>
                Number(
                    a.order || 0
                )
                -
                Number(
                    b.order || 0
                )
        );

}



// =================================
// REFRESH MATCH SELECT
// =================================


function crBookerRefreshMatchList() {

    const desiredMatchId =

        crBookerPendingMatchId

        ||

        crBookerMatchSelect.value;


    crBookerMatchSelect.innerHTML = `

        <option value="">
            Select Match
        </option>

    `;


    const eventMatches =
        crBookerGetEventMatches();


    eventMatches.forEach(
        match => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                match.id;


            option.textContent =
                `Match ${match.order} — ${crBookerFormatMatch(match)}`;


            crBookerMatchSelect.appendChild(
                option
            );

        }
    );


    if (
        desiredMatchId

        &&

        eventMatches.some(
            match =>
                match.id === desiredMatchId
        )
    ) {

        crBookerMatchSelect.value =
            desiredMatchId;


        crBookerPendingMatchId =
            "";


        crBookerLoadSelectedMatch();

    }

}



// =================================
// SIDE DISPLAY MODE
// =================================


function crBookerRefreshSideLayout() {

    const matchType =
        crBookerMatchType.value;


    const isTag =
        matchType === "Tag Team";


    const isTriple =
        matchType === "Triple Threat";


    const isFourWay =
        matchType === "Fatal 4-Way";


    crBookerSideOneTagControls.hidden =
        !isTag;


    crBookerSideTwoTagControls.hidden =
        !isTag;


    crBookerSideThree.hidden =
        !isTriple &&
        !isFourWay;


    crBookerSideFour.hidden =
        !isFourWay;



    if (isTag) {

        crBookerRefreshTagSide(
            1
        );


        crBookerRefreshTagSide(
            2
        );

    }


    else {

        crBookerSideOneTeamRow.hidden =
            true;


        crBookerSideTwoTeamRow.hidden =
            true;


        crBookerSideOneWrestlers.hidden =
            false;


        crBookerSideTwoWrestlers.hidden =
            false;


        crBookerSideOneWrestlerTwoRow.hidden =
            true;


        crBookerSideTwoWrestlerTwoRow.hidden =
            true;

    }


    crBookerRefreshAdvancedMatchLayout();

}



// =================================
// TAG SIDE DISPLAY
// =================================


function crBookerRefreshTagSide(
    sideNumber
) {

    const isSideOne =
        sideNumber === 1;


    const mode =
        isSideOne

            ? crBookerSideOneMode.value

            : crBookerSideTwoMode.value;


    const teamRow =
        isSideOne

            ? crBookerSideOneTeamRow

            : crBookerSideTwoTeamRow;


    const wrestlerGrid =
        isSideOne

            ? crBookerSideOneWrestlers

            : crBookerSideTwoWrestlers;


    const wrestlerTwoRow =
        isSideOne

            ? crBookerSideOneWrestlerTwoRow

            : crBookerSideTwoWrestlerTwoRow;



    if (
        mode === "team"
    ) {

        teamRow.hidden =
            false;


        wrestlerGrid.hidden =
            true;

    }


    else {

        teamRow.hidden =
            true;


        wrestlerGrid.hidden =
            false;


        wrestlerTwoRow.hidden =
            false;

    }


    crBookerReview();

}



// =================================
// CLEAR FORM
// =================================


function crBookerClearForm() {

    crBookerMatchType.value =
        "Singles";


    crBookerOrder.value =
        "";


    crBookerChampionship.value =
        "";


    crBookerStatusField.value =
        "announced";


    crBookerStipulation.value =
        "";


    crBookerStatusNote.value =
        "";


    crBookerSideOneMode.value =
        "team";


    crBookerSideTwoMode.value =
        "team";


    crBookerSideOneTeam.value =
        "";


    crBookerSideTwoTeam.value =
        "";


    crBookerSideOneWrestlerOne.value =
        "";


    crBookerSideOneWrestlerTwo.value =
        "";


    crBookerSideTwoWrestlerOne.value =
        "";


    crBookerSideTwoWrestlerTwo.value =
        "";


    crBookerSideThreeWrestler.value =
        "";


    crBookerSideFourWrestler.value =
        "";


    crBookerOriginalRecord =
        null;


    crBookerPreview.hidden =
        true;


    crBookerError.hidden =
        true;


    crBookerSave.disabled =
        true;


    crBookerRefreshSideLayout();

}



// =================================
// DEFAULT ORDER
// =================================


function crBookerSetDefaultOrder() {

    const eventMatches =
        crBookerGetEventMatches();


    const highestOrder =
        eventMatches.reduce(
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


    crBookerOrder.value =
        highestOrder + 1;

}



// =================================
// SIDE DATA
// =================================


function crBookerGetTagSide(
    sideNumber
) {

    const isSideOne =
        sideNumber === 1;


    const mode =
        isSideOne

            ? crBookerSideOneMode.value

            : crBookerSideTwoMode.value;


    if (
        mode === "team"
    ) {

        const teamId =
            isSideOne

                ? crBookerSideOneTeam.value

                : crBookerSideTwoTeam.value;


        const team =
            crBookerGetTeam(
                teamId
            );


        return {

            wrestlers:
                team &&
                Array.isArray(
                    team.members
                )

                    ? [...team.members]

                    : []

        };

    }


    const wrestlerOne =
        isSideOne

            ? crBookerSideOneWrestlerOne.value

            : crBookerSideTwoWrestlerOne.value;


    const wrestlerTwo =
        isSideOne

            ? crBookerSideOneWrestlerTwo.value

            : crBookerSideTwoWrestlerTwo.value;


    return {

        wrestlers:
            [
                wrestlerOne,
                wrestlerTwo
            ].filter(Boolean)

    };

}



// =================================
// BUILD SIDES
// =================================


function crBookerBuildSides() {

    const matchType =
        crBookerMatchType.value;


        const stipulation =
        crBookerStipulation.value;


    if (
        stipulation === "Overthrow Rumble"
    ) {

        return [];

    }


    if (
        stipulation === "Battle Royal"

        ||

        stipulation === "Hex-Cell Eliminator"

        ||

        stipulation === "The Devil's Contract"

        ||

        stipulation === "Fate's Wheel"
    ) {

        return crBookerBuildAdvancedIndividualSides();

    }


    if (
        matchType === "Tag Team"
    ) {

        return [

            crBookerGetTagSide(
                1
            ),

            crBookerGetTagSide(
                2
            )

        ];

    }


    const sides = [

        {
            wrestlers:
                [
                    crBookerSideOneWrestlerOne.value
                ].filter(Boolean)
        },

        {
            wrestlers:
                [
                    crBookerSideTwoWrestlerOne.value
                ].filter(Boolean)
        }

    ];


    if (
        matchType === "Triple Threat"

        ||

        matchType === "Fatal 4-Way"
    ) {

        sides.push({

            wrestlers:
                [
                    crBookerSideThreeWrestler.value
                ].filter(Boolean)

        });

    }


    if (
        matchType === "Fatal 4-Way"
    ) {

        sides.push({

            wrestlers:
                [
                    crBookerSideFourWrestler.value
                ].filter(Boolean)

        });

    }


    return sides;

}



// =================================
// FORM RECORD
// =================================


function crBookerGetFormRecord() {

    const stipulation =
        crBookerStipulation.value.trim();


    const isBattleRoyal =
        stipulation ===
            "Battle Royal";


    const isHexCell =
        stipulation ===
            "Hex-Cell Eliminator";


    const isDevilsContract =
        stipulation ===
            "The Devil's Contract";


    const isFatesWheel =
        stipulation ===
            "Fate's Wheel";


    const isOverthrowRumble =
        stipulation ===
            "Overthrow Rumble";


    const usesAdvancedParticipants =
        isBattleRoyal ||
        isHexCell ||
        isDevilsContract ||
        isFatesWheel;


    const participantCount =

        isFatesWheel

            ? 8

            : isHexCell ||
              isDevilsContract

                ? 6

                : Number(
                    crBookerParticipantCount.value
                );


    return {

        eventId:
            crBookerEvent.value,

        order:
            Number(
                crBookerOrder.value
            ),

        matchType:
            crBookerMatchType.value,

        sides:
            crBookerBuildSides(),

        championshipId:
            crBookerChampionship.value,

        stipulation:
            stipulation,

        structure:

            isOverthrowRumble

                ? {

                    mode:
                        CR_BOOKER_STRUCTURE_MODES.DEFERRED_ROSTER,

                    participantCount:
                        30

                }

                : usesAdvancedParticipants

                    ? {

                        mode:

                            isFatesWheel

                                ? CR_BOOKER_STRUCTURE_MODES.SPECIAL_FIELD

                                : CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL,

                        participantCount:
                            participantCount

                    }

                    : null,

        specialty:

            isBattleRoyal

                ? {

                    eliminationRule:
                        crBookerEliminationRule.value

                }

                : isOverthrowRumble

                    ? {

                        division:
                            crBookerDivision.value

                    }

                    : null,

        status:
            crBookerStatusField.value,

        statusNote:
            crBookerStatusNote.value.trim()

    };

}

// =================================
// VALIDATION
// =================================


    if (
        !Number.isInteger(
            record.order
        )

        ||

        record.order < 1
    ) {

        errors.push(
            "Card order must be a whole number greater than zero."
        );

    } {

    const errors = [];


    if (!record.eventId) {

        errors.push(
            "Select an event."
        );

    }


    if (
        !Number.isInteger(
            record.order
        )

        ||

        record.order < 1
    ) {

        errors.push(
            "Card order must be a whole number greater than zero."
        );

    }
    if (
        record.stipulation ===
            "Overthrow Rumble"

        &&

        !record.specialty?.division
    ) {

        errors.push(
            "Select a division for the Overthrow Rumble."
        );

    }


    const expectedSideSize =
        record.matchType === "Tag Team"
            ? 2
            : 1;


    record.sides.forEach(
        (
            side,
            index
        ) => {

            if (
                !Array.isArray(
                    side.wrestlers
                )

                ||

                side.wrestlers.length !==
                    expectedSideSize
            ) {

                errors.push(
                    `Side ${index + 1} is incomplete.`
                );

            }

        }
    );



    const allWrestlers =
        record.sides
            .flatMap(
                side =>
                    side.wrestlers
            );


    const uniqueWrestlers =
        new Set(
            allWrestlers
        );


    if (
        uniqueWrestlers.size !==
        allWrestlers.length
    ) {

        errors.push(
            "The same wrestler cannot appear on more than one side."
        );

    }


    return errors;

}



// =================================
// REVIEW ROW
// =================================


function crBookerAddReviewRow(
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


    row.appendChild(
        labelElement
    );


    row.appendChild(
        valueElement
    );


    crBookerReviewList.appendChild(
        row
    );

}



// =================================
// REVIEW
// =================================


function crBookerReview() {

    crBookerHideMessage();


    crBookerReviewList.innerHTML =
        "";


    crBookerError.hidden =
        true;


    const record =
        crBookerGetFormRecord();


    const errors =
        crBookerValidate(
            record
        );


    if (
        !record.eventId
    ) {

        crBookerPreview.hidden =
            true;


        crBookerSave.disabled =
            true;


        return;

    }


    crBookerPreview.hidden =
        false;


    crBookerAddReviewRow(

        "Match",

        crBookerFormatMatch(
            record
        )

    );


    crBookerAddReviewRow(

        "Match Type",

        record.matchType

    );


    crBookerAddReviewRow(

        "Card Order",

        String(
            record.order || "—"
        )

    );


    crBookerAddReviewRow(

        "Championship",

        crBookerGetChampionshipName(
            record.championshipId
        )

    );


    crBookerAddReviewRow(

        "Status",

        record.status

    );


    if (
        record.stipulation
    ) {

        crBookerAddReviewRow(

            "Specialty Match",

            record.stipulation

        );

    }


    if (
        errors.length > 0
    ) {

        crBookerError.textContent =
            errors.join(" ");


        crBookerError.hidden =
            false;

    }


    crBookerSave.disabled =
        errors.length > 0;


    crBookerSetStatus(

        errors.length > 0

            ? "CHECK FORM"

            : crBookerMode.value === "create"

                ? "READY TO BOOK"

                : "CHANGES READY"

    );

}



// =================================
// EVENT CHANGE
// =================================


function crBookerHandleEventChange() {

    crBookerHideMessage();


    crBookerClearForm();


    crBookerRefreshMatchList();


    if (
        crBookerMode.value === "create"

        &&

        crBookerEvent.value
    ) {

        crBookerSetDefaultOrder();

    }


    crBookerReview();

}



// =================================
// MODE CHANGE
// =================================


function crBookerHandleModeChange() {

    crBookerHideMessage();


    crBookerClearForm();


    if (
        crBookerMode.value === "edit"
    ) {

        crBookerMatchSelectRow.hidden =
            false;


        crBookerSave.textContent =
            "Save Match Changes";


        crBookerSetStatus(
            "SELECT MATCH"
        );

    }


    else {

        crBookerMatchSelectRow.hidden =
            true;


        crBookerMatchSelect.value =
            "";


        crBookerSave.textContent =
            "Add Match to Card";


        crBookerSetStatus(
            "READY"
        );


        if (
            crBookerEvent.value
        ) {

            crBookerSetDefaultOrder();

        }

    }


    crBookerRefreshMatchList();


    crBookerReview();

}



// =================================
// LOAD EXISTING MATCH
// =================================


function crBookerLoadSelectedMatch() {

    const matchId =
        crBookerMatchSelect.value;


    if (!matchId) {

        crBookerClearForm();


        crBookerSetStatus(
            "SELECT MATCH"
        );


        return;

    }


    const match =
        owlControlRoomData.announcedMatches.find(
            item =>
                item.id === matchId
        );


    if (!match) {

        return;

    }


    crBookerOriginalRecord =
        structuredClone(
            match
        );


    crBookerMatchType.value =
        match.matchType || "Singles";


    crBookerOrder.value =
        match.order || 1;


    crBookerChampionship.value =
        match.championshipId || "";


    crBookerStatusField.value =
        match.status || "announced";


    crBookerStipulation.value =
        match.stipulation || "";


    crBookerStatusNote.value =
        match.statusNote || "";


    if (
        match.stipulation === "Battle Royal"
    ) {

        crBookerParticipantCount.value =
            String(
                match.structure?.participantCount || 6
            );


        crBookerEliminationRule.value =
            match.specialty?.eliminationRule ||
            "Over the Top Rope";

    }


    crBookerRefreshSideLayout();



        if (
        match.stipulation === "Battle Royal"

        ||

        match.stipulation === "Hex-Cell Eliminator"

        ||

        match.stipulation === "The Devil's Contract"

        ||

        match.stipulation === "Fate's Wheel"
    ) {

        const participantIds =
            Array.isArray(
                match.sides
            )

                ? match.sides.map(
                    side =>
                        side.wrestlers?.[0] || ""
                )

                : [];


                const participantCount =

            match.stipulation ===
                "Fate's Wheel"

                ? 8

                : match.stipulation ===
                    "Hex-Cell Eliminator"

                  ||

                  match.stipulation ===
                    "The Devil's Contract"

                    ? 6

                    : Number(
                        match.structure?.participantCount
                    ) || 6;


        crBookerRenderAdvancedParticipants(

            participantCount,

            participantIds

        );

    }


    else if (
        match.matchType === "Tag Team"
    ) {

        [
            {
                side:
                    match.sides[0],

                modeElement:
                    crBookerSideOneMode,

                teamElement:
                    crBookerSideOneTeam,

                wrestlerOne:
                    crBookerSideOneWrestlerOne,

                wrestlerTwo:
                    crBookerSideOneWrestlerTwo
            },

            {
                side:
                    match.sides[1],

                modeElement:
                    crBookerSideTwoMode,

                teamElement:
                    crBookerSideTwoTeam,

                wrestlerOne:
                    crBookerSideTwoWrestlerOne,

                wrestlerTwo:
                    crBookerSideTwoWrestlerTwo
            }

        ].forEach(
            configuration => {

                const officialTeam =
                    crBookerGetOfficialTeamByMembers(
                        configuration.side.wrestlers
                    );


                if (officialTeam) {

                    configuration.modeElement.value =
                        "team";


                    configuration.teamElement.value =
                        officialTeam.id;

                }


                else {

                    configuration.modeElement.value =
                        "custom";


                    configuration.wrestlerOne.value =
                        configuration.side.wrestlers[0] || "";


                    configuration.wrestlerTwo.value =
                        configuration.side.wrestlers[1] || "";

                }

            }
        );


        crBookerRefreshTagSide(
            1
        );


        crBookerRefreshTagSide(
            2
        );

    }


    else {

        crBookerSideOneWrestlerOne.value =
            match.sides[0]?.wrestlers[0] || "";


        crBookerSideTwoWrestlerOne.value =
            match.sides[1]?.wrestlers[0] || "";


        crBookerSideThreeWrestler.value =
            match.sides[2]?.wrestlers[0] || "";


        crBookerSideFourWrestler.value =
            match.sides[3]?.wrestlers[0] || "";

    }


    crBookerSetStatus(
        "EDITING"
    );


    crBookerReview();

}



// =================================
// WRITE PERMISSION
// =================================


async function crBookerEnsureWritePermission() {

    if (!owlRepositoryHandle) {

        return false;

    }


    const options = {

        mode:
            "readwrite"

    };


    if (
        await owlRepositoryHandle.queryPermission(
            options
        )

        === "granted"
    ) {

        return true;

    }


    return (

        await owlRepositoryHandle.requestPermission(
            options
        )

        === "granted"

    );

}



// =================================
// READ FILE
// =================================


async function crBookerReadFile() {

    const dataDirectory =
        await owlRepositoryHandle.getDirectoryHandle(
            "data"
        );


    const fileHandle =
        await dataDirectory.getFileHandle(
            "announced-matches.json"
        );


    const file =
        await fileHandle.getFile();


    return {

        fileHandle,

        text:
            await file.text()

    };

}



// =================================
// WRITE FILE
// =================================


async function crBookerWriteFile(
    fileHandle,
    text
) {

    const writable =
        await fileHandle.createWritable();


    await writable.write(
        text
    );


    await writable.close();

}



// =================================
// FIND OBJECT BOUNDS
// =================================


function crBookerFindObjectBounds(
    text,
    recordId
) {

    const escapedId =
        recordId.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    const pattern =
        new RegExp(

            `"id"\\s*:\\s*"${escapedId}"`

        );


    const match =
        pattern.exec(
            text
        );


    if (!match) {

        throw new Error(
            `Could not find booked match ${recordId}.`
        );

    }


    const start =
        text.lastIndexOf(
            "{",
            match.index
        );


    let end =
        -1;


    let depth =
        0;


    let inString =
        false;


    let escaped =
        false;


    for (
        let index = start;
        index < text.length;
        index += 1
    ) {

        const character =
            text[index];


        if (escaped) {

            escaped =
                false;

            continue;

        }


        if (
            character === "\\"

            &&

            inString
        ) {

            escaped =
                true;

            continue;

        }


        if (
            character === "\""
        ) {

            inString =
                !inString;

            continue;

        }


        if (inString) {

            continue;

        }


        if (
            character === "{"
        ) {

            depth +=
                1;

        }


        if (
            character === "}"
        ) {

            depth -=
                1;


            if (
                depth === 0
            ) {

                end =
                    index;

                break;

            }

        }

    }


    if (
        start === -1 ||
        end === -1
    ) {

        throw new Error(
            `Could not locate booked match ${recordId}.`
        );

    }


    return {

        start,
        end

    };

}



// =================================
// FORMAT OBJECT FOR ARRAY
// =================================


function crBookerFormatObject(
    record
) {

    return JSON.stringify(
        record,
        null,
        2
    )

        .split("\n")

        .map(
            line =>
                `  ${line}`
        )

        .join("\n");

}



// =================================
// APPEND RECORD
// =================================


function crBookerAppendRecordText(
    text,
    record
) {

    const closingIndex =
        text.lastIndexOf(
            "]"
        );


    if (
        closingIndex === -1
    ) {

        throw new Error(
            "Could not find the end of announced-matches.json."
        );

    }


    const before =
        text.slice(
            0,
            closingIndex
        );


    const after =
        text.slice(
            closingIndex
        );


    const trimmedBefore =
        before.trimEnd();


    const hasRecords =
        !trimmedBefore.endsWith(
            "["
        );


    return (

        trimmedBefore

        +

        (
            hasRecords
                ? ",\n"
                : "\n"
        )

        +

        crBookerFormatObject(
            record
        )

        +

        "\n"

        +

        after

    );

}



// =================================
// REPLACE RECORD
// =================================


function crBookerReplaceRecordText(
    text,
    recordId,
    record
) {

    const bounds =
        crBookerFindObjectBounds(
            text,
            recordId
        );


    return (

        text.slice(
            0,
            bounds.start
        )

        +

        crBookerFormatObject(
            record
        ).slice(2)

        +

        text.slice(
            bounds.end + 1
        )

    );

}



// =================================
// BUILD SAVED RECORD
// =================================


function crBookerBuildSavedRecord() {

    const form =
        crBookerGetFormRecord();


    const baseRecord =

        crBookerMode.value === "edit"

            ? {
                ...crBookerOriginalRecord
            }

            : {

                id:
                    crBookerGetNextMatchId()

            };


    const record = {

        ...baseRecord,

        eventId:
            form.eventId,

        order:
            form.order,

        matchType:
            form.matchType,

        sides:
            form.sides,

        championshipId:
            form.championshipId,

        stipulation:
            form.stipulation,

        status:
            form.status

    };


    if (
        form.structure
    ) {

        record.structure =
            form.structure;

    }


    else {

        delete record.structure;

    }


    if (
        form.specialty
    ) {

        record.specialty =
            form.specialty;

    }


    else {

        delete record.specialty;

    }


    if (
        form.statusNote
    ) {

        record.statusNote =
            form.statusNote;

    }


    else {

        delete record.statusNote;

    }


    return record;

}



// =================================
// SAVE MATCH
// =================================


async function crBookerSaveMatch() {

    crBookerSave.disabled =
        true;


    crBookerSetStatus(
        "SAVING..."
    );


    crBookerHideMessage();


    try {

        const permission =
            await crBookerEnsureWritePermission();


        if (!permission) {

            throw new Error(
                "Write permission was not granted."
            );

        }


        const form =
            crBookerGetFormRecord();


        const errors =
            crBookerValidate(
                form
            );


        if (
            errors.length > 0
        ) {

            throw new Error(
                errors.join(" ")
            );

        }


        const record =
            crBookerBuildSavedRecord();


        const matchFile =
            await crBookerReadFile();


        const updatedText =

            crBookerMode.value === "edit"

                ? crBookerReplaceRecordText(

                    matchFile.text,

                    crBookerOriginalRecord.id,

                    record

                )

                : crBookerAppendRecordText(

                    matchFile.text,

                    record

                );


        await crBookerWriteFile(

            matchFile.fileHandle,

            updatedText

        );


        crBookerPendingMatchId =

            crBookerMode.value === "edit"

                ? record.id

                : "";



        await loadRepositoryData(
            owlRepositoryHandle
        );


        crBookerRefreshMatchList();



        crBookerShowMessage(

            crBookerMode.value === "edit"

                ? "Booked match changes were saved locally. Review announced-matches.json in GitHub Desktop."

                : "Match was added to the event card. Review announced-matches.json in GitHub Desktop.",

            "save-success"

        );



        crBookerSetStatus(

            crBookerMode.value === "edit"

                ? "SAVED"

                : "BOOKED"

        );

    }


    catch (error) {

        console.error(
            "Could not save booked match:",
            error
        );


        crBookerReview();


        crBookerSetStatus(
            "SAVE FAILED"
        );


        crBookerShowMessage(

            error.message ||
            "The booked match could not be saved.",

            "save-error"

        );

    }

}



// =================================
// INPUT EVENTS
// =================================


const crBookerReviewFields = [

    crBookerOrder,
    crBookerChampionship,
    crBookerStatusField,
    crBookerStipulation,
    crBookerStatusNote,

    crBookerSideOneTeam,
    crBookerSideTwoTeam,

    crBookerSideOneWrestlerOne,
    crBookerSideOneWrestlerTwo,

    crBookerSideTwoWrestlerOne,
    crBookerSideTwoWrestlerTwo,

    crBookerSideThreeWrestler,
    crBookerSideFourWrestler

];


crBookerReviewFields.forEach(
    field => {

        field.addEventListener(
            "input",
            crBookerReview
        );


        field.addEventListener(
            "change",
            crBookerReview
        );

    }
);



crBookerMode.addEventListener(
    "change",
    crBookerHandleModeChange
);


crBookerEvent.addEventListener(
    "change",
    crBookerHandleEventChange
);


crBookerMatchSelect.addEventListener(
    "change",
    crBookerLoadSelectedMatch
);


crBookerMatchType.addEventListener(
    "change",
    crBookerRefreshSideLayout
);


crBookerStipulation.addEventListener(
    "change",
    crBookerRefreshAdvancedMatchLayout
);


crBookerParticipantCount.addEventListener(
    "change",
    () => {

        crBookerRenderAdvancedParticipants(

            Number(
                crBookerParticipantCount.value
            ) || 6

        );


        crBookerReview();

    }
);


crBookerEliminationRule.addEventListener(
    "change",
    crBookerReview
);


crBookerSideOneMode.addEventListener(
    "change",
    () => crBookerRefreshTagSide(1)
);


crBookerSideTwoMode.addEventListener(
    "change",
    () => crBookerRefreshTagSide(2)
);


crBookerSave.addEventListener(
    "click",
    crBookerSaveMatch
);



window.addEventListener(

    "owl-control-room-data-loaded",

    () => {

        crBookerPopulateOptions();


        if (
            crBookerMode.value === "create"

            &&

            crBookerEvent.value
        ) {

            crBookerSetDefaultOrder();

        }

    }

);



// =================================
// SAFETY INITIALIZATION
// =================================


try {

    if (
        typeof owlControlRoomData !==
            "undefined"

        &&

        Array.isArray(
            owlControlRoomData.wrestlers
        )

        &&

        Array.isArray(
            owlControlRoomData.teams
        )

        &&

        Array.isArray(
            owlControlRoomData.events
        )

        &&

        Array.isArray(
            owlControlRoomData.championships
        )

        &&

        Array.isArray(
            owlControlRoomData.announcedMatches
        )
    ) {

        crBookerPopulateOptions();

    }

}


catch (error) {

    console.warn(
        "Match Booker waiting for repository data.",
        error
    );

}
