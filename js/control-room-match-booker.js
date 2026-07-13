// =================================
// OWL CONTROL ROOM
// MATCH BOOKER
// =================================

// =================================
// ELEMENTS
// =================================

const crBookerMode = document.getElementById("cr-booker-mode");

const crBookerEvent = document.getElementById("cr-booker-event");

const crBookerMatchSelectRow = document.getElementById(
  "cr-booker-match-select-row",
);

const crBookerMatchSelect = document.getElementById(
  "cr-booker-match-select",
);

const crBookerStatus = document.getElementById(
  "cr-booker-status",
);

const crBookerPreview = document.getElementById(
  "cr-booker-preview",
);

const crBookerReviewList = document.getElementById(
  "cr-booker-review-list",
);

const crBookerError = document.getElementById(
  "cr-booker-error",
);

const crBookerSave = document.getElementById(
  "cr-booker-save",
);

const crBookerMessage = document.getElementById(
  "cr-booker-message",
);


// =================================
// ADVANCED MATCH ELEMENTS
// =================================

const crBookerStandardCompetitors = document.getElementById(
  "cr-booker-standard-competitors",
);

const crBookerAdvancedMatch = document.getElementById(
  "cr-booker-advanced-match",
);

const crBookerParticipantCountRow = document.getElementById(
  "cr-booker-participant-count-row",
);

const crBookerParticipantCount = document.getElementById(
  "cr-booker-participant-count",
);

const crBookerEliminationRuleRow = document.getElementById(
  "cr-booker-elimination-rule-row",
);

const crBookerEliminationRule = document.getElementById(
  "cr-booker-elimination-rule",
);

const crBookerDivisionRow = document.getElementById(
  "cr-booker-division-row",
);

const crBookerDivision = document.getElementById(
  "cr-booker-division",
);

const crBookerStructureChoiceRow = document.getElementById(
  "cr-booker-structure-choice-row",
);

const crBookerStructureChoice = document.getElementById(
  "cr-booker-structure-choice",
);

const crBookerAdvancedParticipants = document.getElementById(
  "cr-booker-advanced-participants",
);

const crBookerTeamBattleSides = document.getElementById(
  "cr-booker-team-battle-sides",
);


// =================================
// MATCH FIELDS
// =================================

const crBookerMatchType = document.getElementById(
  "cr-booker-match-type",
);

const crBookerOrder = document.getElementById(
  "cr-booker-order",
);

const crBookerChampionship = document.getElementById(
  "cr-booker-championship",
);

const crBookerStatusField = document.getElementById(
  "cr-booker-status-field",
);

const crBookerStipulation = document.getElementById(
  "cr-booker-stipulation",
);

const crBookerStatusNote = document.getElementById(
  "cr-booker-status-note",
);


// =================================
// SIDE 1
// =================================

const crBookerSideOneTagControls = document.getElementById(
  "cr-booker-side-one-tag-controls",
);

const crBookerSideOneMode = document.getElementById(
  "cr-booker-side-one-mode",
);

const crBookerSideOneTeamRow = document.getElementById(
  "cr-booker-side-one-team-row",
);

const crBookerSideOneTeam = document.getElementById(
  "cr-booker-side-one-team",
);

const crBookerSideOneWrestlers = document.getElementById(
  "cr-booker-side-one-wrestlers",
);

const crBookerSideOneWrestlerOne = document.getElementById(
  "cr-booker-side-one-wrestler-one",
);

const crBookerSideOneWrestlerTwoRow = document.getElementById(
  "cr-booker-side-one-wrestler-two-row",
);

const crBookerSideOneWrestlerTwo = document.getElementById(
  "cr-booker-side-one-wrestler-two",
);


// =================================
// SIDE 2
// =================================

const crBookerSideTwoTagControls = document.getElementById(
  "cr-booker-side-two-tag-controls",
);

const crBookerSideTwoMode = document.getElementById(
  "cr-booker-side-two-mode",
);

const crBookerSideTwoTeamRow = document.getElementById(
  "cr-booker-side-two-team-row",
);

const crBookerSideTwoTeam = document.getElementById(
  "cr-booker-side-two-team",
);

const crBookerSideTwoWrestlers = document.getElementById(
  "cr-booker-side-two-wrestlers",
);

const crBookerSideTwoWrestlerOne = document.getElementById(
  "cr-booker-side-two-wrestler-one",
);

const crBookerSideTwoWrestlerTwoRow = document.getElementById(
  "cr-booker-side-two-wrestler-two-row",
);

const crBookerSideTwoWrestlerTwo = document.getElementById(
  "cr-booker-side-two-wrestler-two",
);


// =================================
// EXTRA SIDES
// =================================

const crBookerSideThree = document.getElementById(
  "cr-booker-side-three",
);

const crBookerSideThreeWrestler = document.getElementById(
  "cr-booker-side-three-wrestler",
);

const crBookerSideFour = document.getElementById(
  "cr-booker-side-four",
);

const crBookerSideFourWrestler = document.getElementById(
  "cr-booker-side-four-wrestler",
);


// =================================
// STATE
// =================================

let crBookerOriginalRecord =
    null;


let crBookerPendingMatchId =
    "";


let crBookerTournamentLinkContext =
    null;


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
    "specialField",
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
      true,
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
      false,
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
      false,
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
      false,
  },


  "Love and War": {
    mode:
      CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE,

    teamCount:
      2,

    teamSize:
      5,
  },


  "Handicap Match": {
    mode:
      CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE,

    allowedSideSizes: [
      [2, 1],
      [2, 3],
      [3, 1],
    ],

    victoryRules: [
      "Pinfall or Submission",
      "Elimination",
    ],
  },


  "Overthrow Rumble": {
    mode:
      CR_BOOKER_STRUCTURE_MODES.DEFERRED_ROSTER,

    participantCount:
      30,

    requiresParticipantSelection:
      false,
  },


  "Elimination Match": {
    mode:
      null,

    requiresStructureChoice:
      true,

    allowedModes: [
      CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL,
      CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE,
    ],
  },
};


// =================================
// BATTLE ROYAL RULES
// =================================

const CR_BOOKER_BATTLE_ROYAL_RULES = [
  "Over the Top Rope",

  "Pinfall or Submission",

  "All Three (Over the Top Rope, Pinfall, or Submission)",
];


// =================================
// SPECIALTY PROFILE HELPERS
// =================================

function crBookerGetSpecialtyProfile(
  stipulation,
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
  stipulation,
) {
  const profile =
    crBookerGetSpecialtyProfile(
      stipulation,
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
  text,
) {
  crBookerStatus.textContent =
    text;
}


function crBookerShowMessage(
  message,
  type,
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
  wrestlerId,
) {
  return (
    owlControlRoomData.wrestlers.find(
      (wrestler) =>
        wrestler.id === wrestlerId,
    )
    ||
    null
  );
}


function crBookerGetWrestlerName(
  wrestlerId,
) {
  const wrestler =
    crBookerGetWrestler(
      wrestlerId,
    );

  return wrestler
    ? wrestler.name
    : wrestlerId;
}


function crBookerGetTeam(
  teamId,
) {
  return (
    owlControlRoomData.teams.find(
      (team) =>
        team.id === teamId,
    )
    ||
    null
  );
}


function crBookerGetChampionshipName(
  championshipId,
) {
  if (!championshipId) {
    return "Non-Title Match";
  }

  const championship =
    owlControlRoomData.championships.find(
      (item) =>
        item.id === championshipId,
    );

  return championship
    ? championship.name
    : championshipId;
}


function crBookerSignature(
  wrestlerIds,
) {
  return [...wrestlerIds]
    .sort()
    .join("|");
}


function crBookerGetOfficialTeamByMembers(
  wrestlerIds,
) {
  const signature =
    crBookerSignature(
      wrestlerIds,
    );

  return (
    owlControlRoomData.teams.find(
      (team) =>
        Array.isArray(
          team.members,
        )
        &&
        team.members.length === 2
        &&
        crBookerSignature(
          team.members,
        ) === signature,
    )
    ||
    null
  );
}


function crBookerFormatSide(
  side,
) {
  const wrestlerIds =
    Array.isArray(
      side.wrestlers,
    )
      ? side.wrestlers
      : [];

  const officialTeam =
    wrestlerIds.length === 2
      ? crBookerGetOfficialTeamByMembers(
          wrestlerIds,
        )
      : null;

  if (officialTeam) {
    return officialTeam.name;
  }

  return wrestlerIds
    .map(
      crBookerGetWrestlerName,
    )
    .join(" & ");
}


function crBookerFormatMatch(
  match,
) {
  if (!match) {
    return "Unknown Match";
  }

  if (
    match.stipulation ===
    "Overthrow Rumble"
  ) {
    const division =
      match.specialty?.division;

    return division
      ? `${division}'s Overthrow Rumble`
      : "Overthrow Rumble";
  }

  if (
    !Array.isArray(
      match.sides,
    )
  ) {
    return "Unknown Match";
  }

  return match.sides
    .map(
      crBookerFormatSide,
    )
    .join(" vs. ");
}


// =================================
// POPULATE SELECT HELPERS
// =================================

function crBookerPopulateWrestlerSelect(
  selectElement,
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
            a.name || "",
          ).localeCompare(
            String(
              b.name || "",
            ),
          ),
      );

  wrestlers.forEach(
    (wrestler) => {
      const option =
        document.createElement(
          "option",
        );

      option.value =
        wrestler.id;

      option.textContent =
        wrestler.name;

      selectElement.appendChild(
        option,
      );
    },
  );

  if (
    oldValue
    &&
    wrestlers.some(
      (wrestler) =>
        wrestler.id === oldValue,
    )
  ) {
    selectElement.value =
      oldValue;
  }
}


function crBookerPopulateTeamSelect(
  selectElement,
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
            a.name || "",
          ).localeCompare(
            String(
              b.name || "",
            ),
          ),
      );

  teams.forEach(
    (team) => {
      const option =
        document.createElement(
          "option",
        );

      option.value =
        team.id;

      option.textContent =
        team.name;

      selectElement.appendChild(
        option,
      );
    },
  );

  if (
    oldValue
    &&
    teams.some(
      (team) =>
        team.id === oldValue,
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
            a.name || "",
          ).localeCompare(
            String(
              b.name || "",
            ),
          ),
      );

  championships.forEach(
    (championship) => {
      const option =
        document.createElement(
          "option",
        );

      option.value =
        championship.id;

      option.textContent =
        championship.name;

      crBookerChampionship.appendChild(
        option,
      );
    },
  );

  if (
    oldValue
    &&
    championships.some(
      (championship) =>
        championship.id === oldValue,
    )
  ) {
    crBookerChampionship.value =
      oldValue;
  }
}


// =================================
// STRUCTURE CONTROL HELPERS
// =================================

function crBookerGetHandicapSideSizes(
  structureValue,
) {
  const structureMap = {
    "2v1":
      [2, 1],

    "2v3":
      [2, 3],

    "3v1":
      [3, 1],
  };

  return structureMap[
    structureValue
  ]
    ? [
        ...structureMap[
          structureValue
        ],
      ]
    : null;
}


function crBookerGetHandicapStructureValue(
  sideSizes,
) {
  if (
    !Array.isArray(
      sideSizes,
    )
  ) {
    return "";
  }

  const signature =
    sideSizes.join("v");

  const validStructures = [
    "2v1",
    "2v3",
    "3v1",
  ];

  return validStructures.includes(
    signature,
  )
    ? signature
    : "";
}


function crBookerConfigureStructureChoice(
  stipulation =
    crBookerStipulation.value,
) {
  const oldValue =
    crBookerStructureChoice.value;

  const label =
    crBookerStructureChoiceRow.querySelector(
      'label[for="cr-booker-structure-choice"]',
    );

  crBookerStructureChoice.innerHTML =
    "";

  if (
    stipulation ===
    "Handicap Match"
  ) {
    if (label) {
      label.textContent =
        "HANDICAP STRUCTURE";
    }

    crBookerStructureChoice.innerHTML = `
      <option value="">
        Select Structure
      </option>

      <option value="2v1">
        2 vs 1
      </option>

      <option value="2v3">
        2 vs 3
      </option>

      <option value="3v1">
        3 vs 1
      </option>
    `;

    if (
      [
        "2v1",
        "2v3",
        "3v1",
      ].includes(
        oldValue,
      )
    ) {
      crBookerStructureChoice.value =
        oldValue;
    }

    return;
  }

  if (label) {
    label.textContent =
      "MATCH STRUCTURE";
  }

  crBookerStructureChoice.innerHTML = `
    <option value="">
      Select Structure
    </option>

    <option value="freeForAll">
      Individual Elimination
    </option>

    <option value="teamBattle">
      Team Elimination
    </option>
  `;

  if (
    oldValue ===
      CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL
    ||
    oldValue ===
      CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE
  ) {
    crBookerStructureChoice.value =
      oldValue;
  }
}


function crBookerConfigureRuleChoice(
  stipulation =
    crBookerStipulation.value,
) {
  const oldValue =
    crBookerEliminationRule.value;

  const label =
    crBookerEliminationRuleRow.querySelector(
      'label[for="cr-booker-elimination-rule"]',
    );

  crBookerEliminationRule.innerHTML =
    "";

  if (
    stipulation ===
    "Handicap Match"
  ) {
    if (label) {
      label.textContent =
        "VICTORY RULE";
    }

    crBookerEliminationRule.innerHTML = `
      <option value="">
        Select Victory Rule
      </option>

      <option value="Pinfall or Submission">
        Pinfall or Submission
      </option>

      <option value="Elimination">
        Elimination
      </option>
    `;

    if (
      oldValue ===
        "Pinfall or Submission"
      ||
      oldValue ===
        "Elimination"
    ) {
      crBookerEliminationRule.value =
        oldValue;
    }

    return;
  }

  if (label) {
    label.textContent =
      "ELIMINATION RULE";
  }

  crBookerEliminationRule.innerHTML = `
    <option value="Over the Top Rope">
      Over the Top Rope
    </option>

    <option value="Pinfall or Submission">
      Pinfall or Submission
    </option>

    <option value="All Three (Over the Top Rope, Pinfall, or Submission)">
      All Three (Over the Top Rope, Pinfall, or Submission)
    </option>
  `;

  if (
    CR_BOOKER_BATTLE_ROYAL_RULES.includes(
      oldValue,
    )
  ) {
    crBookerEliminationRule.value =
      oldValue;
  } else {
    crBookerEliminationRule.value =
      "Over the Top Rope";
  }
}


function crBookerSetCountControl(
  labelText,
  values,
  defaultValue,
) {
  const label =
    crBookerParticipantCountRow.querySelector(
      'label[for="cr-booker-participant-count"]',
    );

  if (label) {
    label.textContent =
      labelText;
  }

  const currentValue =
    Number(
      crBookerParticipantCount.value,
    );

  crBookerParticipantCount.innerHTML =
    "";

  values.forEach(
    (value) => {
      const option =
        document.createElement(
          "option",
        );

      option.value =
        String(
          value,
        );

      option.textContent =
        String(
          value,
        );

      crBookerParticipantCount.appendChild(
        option,
      );
    },
  );

  crBookerParticipantCount.value =
    values.includes(
      currentValue,
    )
      ? String(
          currentValue,
        )
      : String(
          defaultValue,
        );
}


// =================================
// ADVANCED PARTICIPANT HELPERS
// =================================

function crBookerGetAdvancedParticipantSelects() {
  return [
    ...crBookerAdvancedParticipants.querySelectorAll(
      "[data-cr-booker-participant='true']",
    ),
  ];
}


function crBookerBuildAdvancedIndividualSides() {
  return crBookerGetAdvancedParticipantSelects()
    .map(
      (selectElement) => ({
        wrestlers: [
          selectElement.value,
        ].filter(
          Boolean,
        ),
      }),
    );
}


function crBookerGetTeamBattleParticipantSelects(
  sideNumber = null,
) {
  const selects = [
    ...crBookerTeamBattleSides.querySelectorAll(
      "[data-cr-booker-team-battle-participant='true']",
    ),
  ];

  if (
    sideNumber === null
  ) {
    return selects;
  }

  return selects.filter(
    (selectElement) =>
      Number(
        selectElement.dataset.crBookerTeamBattleSide,
      ) === sideNumber,
  );
}


function crBookerBuildTeamBattleSides() {
  return [1, 2]
    .map(
      (sideNumber) => ({
        wrestlers:
          crBookerGetTeamBattleParticipantSelects(
            sideNumber,
          )
            .map(
              (selectElement) =>
                selectElement.value,
            )
            .filter(
              Boolean,
            ),
      }),
    );
}


function crBookerRenderTeamBattleSides(
  sideWrestlers =
    [[], []],
  teamSizeOrSideSizes =
    5,
) {
  const sideSizes =
    Array.isArray(
      teamSizeOrSideSizes,
    )
      ? [
          ...teamSizeOrSideSizes,
        ]
      : [
          Number(
            teamSizeOrSideSizes,
          ),
          Number(
            teamSizeOrSideSizes,
          ),
        ];

  crBookerTeamBattleSides.innerHTML =
    "";

  for (
    let sideNumber = 1;
    sideNumber <= 2;
    sideNumber += 1
  ) {
    const sideCard =
      document.createElement(
        "div",
      );

    sideCard.className =
      "cr-booker-side-card";

    const heading =
      document.createElement(
        "div",
      );

    heading.className =
      "cr-booker-side-heading";

    const headingText =
      document.createElement(
        "span",
      );

    headingText.textContent =
      `TEAM ${sideNumber}`;

    heading.appendChild(
      headingText,
    );

    sideCard.appendChild(
      heading,
    );

    const grid =
      document.createElement(
        "div",
      );

    grid.className =
      "cr-booker-wrestler-grid";

    const currentSideSize =
      Number(
        sideSizes[
          sideNumber - 1
        ],
      )
      ||
      1;

    for (
      let memberIndex = 0;
      memberIndex < currentSideSize;
      memberIndex += 1
    ) {
      const group =
        document.createElement(
          "div",
        );

      group.className =
        "cr-form-group";

      const label =
        document.createElement(
          "label",
        );

      const select =
        document.createElement(
          "select",
        );

      const selectId =
        `cr-booker-team-${sideNumber}-member-${memberIndex + 1}`;

      label.htmlFor =
        selectId;

      label.textContent =
        `WRESTLER ${memberIndex + 1}`;

      select.id =
        selectId;

      select.dataset.crBookerTeamBattleParticipant =
        "true";

      select.dataset.crBookerTeamBattleSide =
        String(
          sideNumber,
        );

      crBookerPopulateWrestlerSelect(
        select,
      );

      const savedWrestlerId =
        sideWrestlers[
          sideNumber - 1
        ]?.[
          memberIndex
        ]
        ||
        "";

      if (
        savedWrestlerId
      ) {
        select.value =
          savedWrestlerId;
      }

      select.addEventListener(
        "input",
        crBookerReview,
      );

      select.addEventListener(
        "change",
        crBookerReview,
      );

      group.appendChild(
        label,
      );

      group.appendChild(
        select,
      );

      grid.appendChild(
        group,
      );
    }

    sideCard.appendChild(
      grid,
    );

    crBookerTeamBattleSides.appendChild(
      sideCard,
    );
  }

  crBookerTeamBattleSides.hidden =
    false;

  crBookerTeamBattleSides.style.display =
    "";
}


// =================================
// ADVANCED PARTICIPANTS
// =================================

function crBookerRenderAdvancedParticipants(
  participantCount,
  wrestlerIds = [],
) {
  const existingValues =
    wrestlerIds.length > 0
      ? wrestlerIds
      : crBookerGetAdvancedParticipantSelects()
          .map(
            (selectElement) =>
              selectElement.value,
          );

  const count =
    Number(
      participantCount,
    )
    ||
    6;

  crBookerAdvancedParticipants.innerHTML =
    "";

  const grid =
    document.createElement(
      "div",
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
        "div",
      );

    group.className =
      "cr-form-group";

    const label =
      document.createElement(
        "label",
      );

    const select =
      document.createElement(
        "select",
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
      select,
    );

    if (
      existingValues[
        index
      ]
    ) {
      select.value =
        existingValues[
          index
        ];
    }

    select.addEventListener(
      "input",
      crBookerReview,
    );

    select.addEventListener(
      "change",
      crBookerReview,
    );

    group.appendChild(
      label,
    );

    group.appendChild(
      select,
    );

    grid.appendChild(
      group,
    );
  }

  crBookerAdvancedParticipants.appendChild(
    grid,
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

  const isLoveAndWar =
    stipulation ===
    "Love and War";

  const isEliminationMatch =
    stipulation ===
    "Elimination Match";

  const isHandicapMatch =
    stipulation ===
    "Handicap Match";

  const eliminationMode =
    isEliminationMatch
      ? crBookerStructureChoice.value
      : "";

  const isIndividualElimination =
    isEliminationMatch
    &&
    eliminationMode ===
      CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL;

  const isTeamElimination =
    isEliminationMatch
    &&
    eliminationMode ===
      CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE;

  const handicapSideSizes =
    isHandicapMatch
      ? crBookerGetHandicapSideSizes(
          crBookerStructureChoice.value,
        )
      : null;

  const isConfiguredHandicap =
    isHandicapMatch
    &&
    Array.isArray(
      handicapSideSizes,
    );

  const usesAdvancedParticipants =
    isBattleRoyal
    ||
    isHexCell
    ||
    isDevilsContract
    ||
    isFatesWheel
    ||
    isIndividualElimination;

  const usesTeamBattleSides =
    isLoveAndWar
    ||
    isTeamElimination
    ||
    isConfiguredHandicap;

  const usesAdvancedLayout =
    usesAdvancedParticipants
    ||
    usesTeamBattleSides
    ||
    isOverthrowRumble
    ||
    isEliminationMatch
    ||
    isHandicapMatch;

  crBookerAdvancedMatch.hidden =
    !usesAdvancedLayout;

  const showsStructureChoice =
    isEliminationMatch
    ||
    isHandicapMatch;

  crBookerStructureChoiceRow.hidden =
    !showsStructureChoice;

  crBookerStructureChoiceRow.style.display =
    showsStructureChoice
      ? ""
      : "none";

  const showsCountControl =
    isBattleRoyal
    ||
    isIndividualElimination
    ||
    isTeamElimination;

  crBookerParticipantCountRow.hidden =
    !showsCountControl;

  crBookerParticipantCountRow.style.display =
    showsCountControl
      ? ""
      : "none";

  const showsRuleChoice =
    isBattleRoyal
    ||
    isHandicapMatch;

  crBookerEliminationRuleRow.hidden =
    !showsRuleChoice;

  crBookerEliminationRuleRow.style.display =
    showsRuleChoice
      ? ""
      : "none";

  crBookerDivisionRow.hidden =
    !isOverthrowRumble;

  crBookerDivisionRow.style.display =
    isOverthrowRumble
      ? ""
      : "none";

  if (
    isBattleRoyal
  ) {
    crBookerSetCountControl(
      "PARTICIPANT COUNT",
      [3, 4, 5, 6, 7, 8],
      6,
    );
  }

  if (
    isIndividualElimination
  ) {
    crBookerSetCountControl(
      "PARTICIPANT COUNT",
      [3, 4, 5, 6, 7, 8],
      6,
    );
  }

  if (
    isTeamElimination
  ) {
    crBookerSetCountControl(
      "TEAM SIZE",
      [2, 3, 4],
      2,
    );
  }

  crBookerAdvancedParticipants.hidden =
    !usesAdvancedParticipants;

  crBookerAdvancedParticipants.style.display =
    usesAdvancedParticipants
      ? ""
      : "none";

  crBookerTeamBattleSides.hidden =
    !usesTeamBattleSides;

  crBookerTeamBattleSides.style.display =
    usesTeamBattleSides
      ? ""
      : "none";

  crBookerStandardCompetitors.hidden =
    usesAdvancedLayout;

  if (
    usesAdvancedParticipants
  ) {
    const currentSelects =
      crBookerGetAdvancedParticipantSelects();

    const desiredCount =
      isFatesWheel
        ? 8
        : isHexCell
          ||
          isDevilsContract
          ? 6
          : Number(
              crBookerParticipantCount.value,
            )
            ||
            6;

    if (
      currentSelects.length !==
      desiredCount
    ) {
      crBookerRenderAdvancedParticipants(
        desiredCount,
      );
    }
  } else {
    crBookerAdvancedParticipants.innerHTML =
      "";
  }

  if (
    usesTeamBattleSides
  ) {
    let desiredSideSizes;

    if (
      isLoveAndWar
    ) {
      desiredSideSizes =
        [5, 5];
    } else if (
      isTeamElimination
    ) {
      const teamSize =
        Number(
          crBookerParticipantCount.value,
        )
        ||
        2;

      desiredSideSizes =
        [
          teamSize,
          teamSize,
        ];
    } else {
      desiredSideSizes =
        handicapSideSizes;
    }

    const currentSideSizes =
      [1, 2]
        .map(
          (sideNumber) =>
            crBookerGetTeamBattleParticipantSelects(
              sideNumber,
            ).length,
        );

    const sideSizesMatch =
      currentSideSizes.length ===
        desiredSideSizes.length
      &&
      currentSideSizes.every(
        (size, index) =>
          size ===
          desiredSideSizes[
            index
          ],
      );

    if (
      !sideSizesMatch
    ) {
      crBookerRenderTeamBattleSides(
        [[], []],
        desiredSideSizes,
      );
    }
  } else {
    crBookerTeamBattleSides.innerHTML =
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
        (event) =>
          String(
            event.status || "",
          ).toLowerCase() !==
          "completed",
      )
      .sort(
        (a, b) =>
          new Date(
            `${a.date}T00:00:00`,
          )
          -
          new Date(
            `${b.date}T00:00:00`,
          ),
      );

  events.forEach(
    (event) => {
      const option =
        document.createElement(
          "option",
        );

      option.value =
        event.id;

      option.textContent =
        `${event.date} — ${event.name}`;

      crBookerEvent.appendChild(
        option,
      );
    },
  );

  if (
    oldValue
    &&
    events.some(
      (event) =>
        event.id === oldValue,
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

  crBookerConfigureStructureChoice();

  crBookerConfigureRuleChoice();

  [
    crBookerSideOneWrestlerOne,
    crBookerSideOneWrestlerTwo,
    crBookerSideTwoWrestlerOne,
    crBookerSideTwoWrestlerTwo,
    crBookerSideThreeWrestler,
    crBookerSideFourWrestler,
  ].forEach(
    crBookerPopulateWrestlerSelect,
  );

  [
    crBookerSideOneTeam,
    crBookerSideTwoTeam,
  ].forEach(
    crBookerPopulateTeamSelect,
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
    (match) => {
      const idMatch =
        /^announced-(\d+)$/.exec(
          match.id || "",
        );

      if (
        !idMatch
      ) {
        return;
      }

      highestNumber =
        Math.max(
          highestNumber,
          Number(
            idMatch[
              1
            ],
          ),
        );
    },
  );

  return `announced-${String(
    highestNumber + 1,
  ).padStart(
    4,
    "0",
  )}`;
}


// =================================
// EVENT MATCHES
// =================================

function crBookerGetEventMatches() {
  const eventId =
    crBookerEvent.value;

  if (
    !eventId
  ) {
    return [];
  }

  return owlControlRoomData.announcedMatches
    .filter(
      (match) =>
        match.eventId ===
        eventId,
    )
    .sort(
      (a, b) =>
        Number(
          a.order || 0,
        )
        -
        Number(
          b.order || 0,
        ),
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
    (match) => {
      const option =
        document.createElement(
          "option",
        );

      option.value =
        match.id;

      option.textContent =
        `Match ${match.order} — ${crBookerFormatMatch(match)}`;

      crBookerMatchSelect.appendChild(
        option,
      );
    },
  );

  if (
    desiredMatchId
    &&
    eventMatches.some(
      (match) =>
        match.id ===
        desiredMatchId,
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
    matchType ===
    "Tag Team";

  const isTriple =
    matchType ===
    "Triple Threat";

  const isFourWay =
    matchType ===
    "Fatal 4-Way";

  crBookerSideOneTagControls.hidden =
    !isTag;

  crBookerSideTwoTagControls.hidden =
    !isTag;

  crBookerSideThree.hidden =
    !isTriple
    &&
    !isFourWay;

  crBookerSideFour.hidden =
    !isFourWay;

  if (
    isTag
  ) {
    crBookerRefreshTagSide(
      1,
    );

    crBookerRefreshTagSide(
      2,
    );
  } else {
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
  sideNumber,
) {
  const isSideOne =
    sideNumber ===
    1;

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
    mode ===
    "team"
  ) {
    teamRow.hidden =
      false;

    wrestlerGrid.hidden =
      true;
  } else {
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

    crBookerTournamentLinkContext =
        null;


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

  crBookerDivision.value =
    "";

  crBookerStructureChoice.value =
    "";

  crBookerEliminationRule.value =
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
        match,
      ) =>
        Math.max(
          highest,
          Number(
            match.order || 0,
          ),
        ),
      0,
    );

  crBookerOrder.value =
    highestOrder + 1;
}


// =================================
// SIDE DATA
// =================================

function crBookerGetTagSide(
  sideNumber,
) {
  const isSideOne =
    sideNumber ===
    1;

  const mode =
    isSideOne
      ? crBookerSideOneMode.value
      : crBookerSideTwoMode.value;

  if (
    mode ===
    "team"
  ) {
    const teamId =
      isSideOne
        ? crBookerSideOneTeam.value
        : crBookerSideTwoTeam.value;

    const team =
      crBookerGetTeam(
        teamId,
      );

    return {
      wrestlers:
        team
        &&
        Array.isArray(
          team.members,
        )
          ? [
              ...team.members,
            ]
          : [],
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
    wrestlers: [
      wrestlerOne,
      wrestlerTwo,
    ].filter(
      Boolean,
    ),
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
    stipulation ===
    "Overthrow Rumble"
  ) {
    return [];
  }

  if (
    stipulation ===
    "Love and War"
  ) {
    return crBookerBuildTeamBattleSides();
  }

  if (
    stipulation ===
    "Handicap Match"
  ) {
    return crBookerBuildTeamBattleSides();
  }

  if (
    stipulation ===
    "Elimination Match"
  ) {
    if (
      crBookerStructureChoice.value ===
      CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL
    ) {
      return crBookerBuildAdvancedIndividualSides();
    }

    if (
      crBookerStructureChoice.value ===
      CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE
    ) {
      return crBookerBuildTeamBattleSides();
    }

    return [];
  }

  if (
    stipulation ===
      "Battle Royal"
    ||
    stipulation ===
      "Hex-Cell Eliminator"
    ||
    stipulation ===
      "The Devil's Contract"
    ||
    stipulation ===
      "Fate's Wheel"
  ) {
    return crBookerBuildAdvancedIndividualSides();
  }

  if (
    matchType ===
    "Tag Team"
  ) {
    return [
      crBookerGetTagSide(
        1,
      ),
      crBookerGetTagSide(
        2,
      ),
    ];
  }

  const sides = [
    {
      wrestlers: [
        crBookerSideOneWrestlerOne.value,
      ].filter(
        Boolean,
      ),
    },

    {
      wrestlers: [
        crBookerSideTwoWrestlerOne.value,
      ].filter(
        Boolean,
      ),
    },
  ];

  if (
    matchType ===
      "Triple Threat"
    ||
    matchType ===
      "Fatal 4-Way"
  ) {
    sides.push({
      wrestlers: [
        crBookerSideThreeWrestler.value,
      ].filter(
        Boolean,
      ),
    });
  }

  if (
    matchType ===
    "Fatal 4-Way"
  ) {
    sides.push({
      wrestlers: [
        crBookerSideFourWrestler.value,
      ].filter(
        Boolean,
      ),
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

  const isLoveAndWar =
    stipulation ===
    "Love and War";

  const isEliminationMatch =
    stipulation ===
    "Elimination Match";

  const isHandicapMatch =
    stipulation ===
    "Handicap Match";

  const eliminationMode =
    isEliminationMatch
      ? crBookerStructureChoice.value
      : "";

  const handicapSideSizes =
    isHandicapMatch
      ? crBookerGetHandicapSideSizes(
          crBookerStructureChoice.value,
        )
      : null;

  const usesAdvancedParticipants =
    isBattleRoyal
    ||
    isHexCell
    ||
    isDevilsContract
    ||
    isFatesWheel;

  const participantCount =
    isFatesWheel
      ? 8
      : isHexCell
        ||
        isDevilsContract
        ? 6
        : Number(
            crBookerParticipantCount.value,
          );

  const resolvedMatchType =
    isHandicapMatch
      ? "Tag Team"
      : isEliminationMatch
        ? eliminationMode ===
          CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE
          ? "Tag Team"
          : "Singles"
        : crBookerMatchType.value;

  return {
    eventId:
      crBookerEvent.value,

    order:
      Number(
        crBookerOrder.value,
      ),

    matchType:
      resolvedMatchType,

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
              30,
          }
        : isLoveAndWar
          ? {
              mode:
                CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE,

              teamCount:
                2,

              teamSize:
                5,
            }
          : isHandicapMatch
            &&
            Array.isArray(
              handicapSideSizes,
            )
            ? {
                mode:
                  CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE,

                sideSizes:
                  handicapSideSizes,
              }
            : isEliminationMatch
              &&
              eliminationMode ===
                CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL
              ? {
                  mode:
                    CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL,

                  participantCount:
                    Number(
                      crBookerParticipantCount.value,
                    ),
                }
              : isEliminationMatch
                &&
                eliminationMode ===
                  CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE
                ? {
                    mode:
                      CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE,

                    teamCount:
                      2,

                    teamSize:
                      Number(
                        crBookerParticipantCount.value,
                      ),
                  }
                : usesAdvancedParticipants
                  ? {
                      mode:
                        isFatesWheel
                          ? CR_BOOKER_STRUCTURE_MODES.SPECIAL_FIELD
                          : CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL,

                      participantCount:
                        participantCount,
                    }
                  : null,

    specialty:
      isBattleRoyal
        ? {
            eliminationRule:
              crBookerEliminationRule.value,
          }
        : isOverthrowRumble
          ? {
              division:
                crBookerDivision.value,
            }
          : isHandicapMatch
            ? {
                victoryRule:
                  crBookerEliminationRule.value,
              }
            : null,

    status:
      crBookerStatusField.value,

    statusNote:
      crBookerStatusNote.value.trim(),
  };
}


// =================================
// VALIDATION
// =================================

function crBookerValidate(
  record,
) {
  const errors =
    [];

  if (
    !record.eventId
  ) {
    errors.push(
      "Select an event.",
    );
  }

  if (
    !Number.isInteger(
      record.order,
    )
    ||
    record.order < 1
  ) {
    errors.push(
      "Card order must be a whole number greater than zero.",
    );
  }

  if (
    record.stipulation ===
      "Overthrow Rumble"
    &&
    !record.specialty?.division
  ) {
    errors.push(
      "Select a division for the Overthrow Rumble.",
    );
  }

  if (
    record.stipulation ===
      "Elimination Match"
    &&
    !record.structure?.mode
  ) {
    errors.push(
      "Select an Elimination Match structure.",
    );
  }

  if (
    record.stipulation ===
      "Handicap Match"
    &&
    !Array.isArray(
      record.structure?.sideSizes,
    )
  ) {
    errors.push(
      "Select a Handicap Match structure.",
    );
  }

  if (
    record.stipulation ===
      "Handicap Match"
    &&
    !record.specialty?.victoryRule
  ) {
    errors.push(
      "Select a Handicap Match victory rule.",
    );
  }

  const expectedSideSizes =
    record.stipulation ===
      "Handicap Match"
      ? Array.isArray(
          record.structure?.sideSizes,
        )
        ? record.structure.sideSizes
        : []
      : record.stipulation ===
          "Love and War"
        ? [5, 5]
        : record.stipulation ===
            "Elimination Match"
          &&
          record.structure?.mode ===
            CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE
          ? [
              Number(
                record.structure.teamSize,
              ),
              Number(
                record.structure.teamSize,
              ),
            ]
          : record.matchType ===
              "Tag Team"
            ? [2, 2]
            : record.sides.map(
                () =>
                  1,
              );

  record.sides.forEach(
    (
      side,
      index,
    ) => {
      if (
        !Array.isArray(
          side.wrestlers,
        )
        ||
        side.wrestlers.length !==
          expectedSideSizes[
            index
          ]
      ) {
        errors.push(
          `Side ${index + 1} is incomplete.`,
        );
      }
    },
  );

  const allWrestlers =
    record.sides.flatMap(
      (side) =>
        side.wrestlers,
    );

  const uniqueWrestlers =
    new Set(
      allWrestlers,
    );

  if (
    uniqueWrestlers.size !==
    allWrestlers.length
  ) {
    errors.push(
      "The same wrestler cannot appear on more than one side.",
    );
  }

  return errors;
}


// =================================
// REVIEW ROW
// =================================

function crBookerAddReviewRow(
  label,
  value,
) {
  const row =
    document.createElement(
      "div",
    );

  row.className =
    "cr-editor-change-row";

  const labelElement =
    document.createElement(
      "strong",
    );

  labelElement.textContent =
    label;

  const valueElement =
    document.createElement(
      "span",
    );

  valueElement.textContent =
    value;

  row.appendChild(
    labelElement,
  );

  row.appendChild(
    valueElement,
  );

  crBookerReviewList.appendChild(
    row,
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
      record,
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
      record,
    ),
  );

  crBookerAddReviewRow(
    "Match Type",
    record.matchType,
  );

  crBookerAddReviewRow(
    "Card Order",
    String(
      record.order || "—",
    ),
  );

  crBookerAddReviewRow(
    "Championship",
    crBookerGetChampionshipName(
      record.championshipId,
    ),
  );

  crBookerAddReviewRow(
    "Status",
    record.status,
  );

  if (
    record.stipulation
  ) {
    crBookerAddReviewRow(
      "Specialty Match",
      record.stipulation,
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
      : crBookerMode.value ===
          "create"
        ? "READY TO BOOK"
        : "CHANGES READY",
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
    crBookerMode.value ===
      "create"
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
    crBookerMode.value ===
    "edit"
  ) {
    crBookerMatchSelectRow.hidden =
      false;

    crBookerSave.textContent =
      "Save Match Changes";

    crBookerSetStatus(
      "SELECT MATCH",
    );
  } else {
    crBookerMatchSelectRow.hidden =
      true;

    crBookerMatchSelect.value =
      "";

    crBookerSave.textContent =
      "Add Match to Card";

    crBookerSetStatus(
      "READY",
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

  if (
    !matchId
  ) {
    crBookerClearForm();

    crBookerSetStatus(
      "SELECT MATCH",
    );

    return;
  }

  const match =
    owlControlRoomData.announcedMatches.find(
      (item) =>
        item.id ===
        matchId,
    );

  if (
    !match
  ) {
    return;
  }

  crBookerOriginalRecord =
    structuredClone(
      match,
    );

  crBookerMatchType.value =
    match.matchType
    ||
    "Singles";

  crBookerOrder.value =
    match.order
    ||
    1;

  crBookerChampionship.value =
    match.championshipId
    ||
    "";

  crBookerStatusField.value =
    match.status
    ||
    "announced";

  crBookerStipulation.value =
    match.stipulation
    ||
    "";

  crBookerConfigureStructureChoice(
    match.stipulation,
  );

  crBookerConfigureRuleChoice(
    match.stipulation,
  );

  crBookerStatusNote.value =
    match.statusNote
    ||
    "";

  if (
    match.stipulation ===
    "Battle Royal"
  ) {
    crBookerParticipantCount.value =
      String(
        match.structure?.participantCount
        ||
        6,
      );

    crBookerEliminationRule.value =
      match.specialty?.eliminationRule
      ||
      "Over the Top Rope";
  }

  if (
    match.stipulation ===
    "Overthrow Rumble"
  ) {
    crBookerDivision.value =
      match.specialty?.division
      ||
      "";
  }

  if (
    match.stipulation ===
    "Elimination Match"
  ) {
    crBookerStructureChoice.value =
      match.structure?.mode
      ||
      "";

    if (
      match.structure?.mode ===
      CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL
    ) {
      crBookerParticipantCount.value =
        String(
          match.structure?.participantCount
          ||
          3,
        );
    }

    if (
      match.structure?.mode ===
      CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE
    ) {
      crBookerParticipantCount.value =
        String(
          match.structure?.teamSize
          ||
          2,
        );
    }
  }

  if (
    match.stipulation ===
    "Handicap Match"
  ) {
    crBookerStructureChoice.value =
      crBookerGetHandicapStructureValue(
        match.structure?.sideSizes,
      );

    crBookerEliminationRule.value =
      match.specialty?.victoryRule
      ||
      "";
  }

  crBookerRefreshSideLayout();

  if (
    match.stipulation ===
      "Battle Royal"
    ||
    match.stipulation ===
      "Hex-Cell Eliminator"
    ||
    match.stipulation ===
      "The Devil's Contract"
    ||
    match.stipulation ===
      "Fate's Wheel"
    ||
    (
      match.stipulation ===
        "Elimination Match"
      &&
      match.structure?.mode ===
        CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL
    )
  ) {
    const participantIds =
      Array.isArray(
        match.sides,
      )
        ? match.sides.map(
            (side) =>
              side.wrestlers?.[
                0
              ]
              ||
              "",
          )
        : [];

    let participantCount =
      Number(
        match.structure?.participantCount,
      )
      ||
      6;

    if (
      match.stipulation ===
        "Hex-Cell Eliminator"
      ||
      match.stipulation ===
        "The Devil's Contract"
    ) {
      participantCount =
        6;
    }

    if (
      match.stipulation ===
      "Fate's Wheel"
    ) {
      participantCount =
        8;
    }

    if (
      match.stipulation ===
        "Elimination Match"
      &&
      match.structure?.mode ===
        CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL
    ) {
      participantCount =
        Number(
          match.structure?.participantCount,
        )
        ||
        3;
    }

    crBookerRenderAdvancedParticipants(
      participantCount,
      participantIds,
    );
  } else if (
    match.stipulation ===
    "Handicap Match"
  ) {
    const sideWrestlers =
      Array.isArray(
        match.sides,
      )
        ? match.sides
            .slice(
              0,
              2,
            )
            .map(
              (side) =>
                Array.isArray(
                  side.wrestlers,
                )
                  ? [
                      ...side.wrestlers,
                    ]
                  : [],
            )
        : [[], []];

    while (
      sideWrestlers.length <
      2
    ) {
      sideWrestlers.push(
        [],
      );
    }

    crBookerRenderTeamBattleSides(
      sideWrestlers,
      match.structure?.sideSizes
      ||
      [2, 1],
    );
  } else if (
    match.stipulation ===
      "Elimination Match"
    &&
    match.structure?.mode ===
      CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE
  ) {
    const sideWrestlers =
      Array.isArray(
        match.sides,
      )
        ? match.sides
            .slice(
              0,
              2,
            )
            .map(
              (side) =>
                Array.isArray(
                  side.wrestlers,
                )
                  ? [
                      ...side.wrestlers,
                    ]
                  : [],
            )
        : [[], []];

    while (
      sideWrestlers.length <
      2
    ) {
      sideWrestlers.push(
        [],
      );
    }

    crBookerRenderTeamBattleSides(
      sideWrestlers,
      Number(
        match.structure?.teamSize,
      )
      ||
      2,
    );
  } else if (
    match.stipulation ===
    "Love and War"
  ) {
    const sideWrestlers =
      Array.isArray(
        match.sides,
      )
        ? match.sides
            .slice(
              0,
              2,
            )
            .map(
              (side) =>
                Array.isArray(
                  side.wrestlers,
                )
                  ? [
                      ...side.wrestlers,
                    ]
                  : [],
            )
        : [[], []];

    while (
      sideWrestlers.length <
      2
    ) {
      sideWrestlers.push(
        [],
      );
    }

    crBookerRenderTeamBattleSides(
      sideWrestlers,
      5,
    );
  } else if (
    match.matchType ===
    "Tag Team"
  ) {
    [
      {
        side:
          match.sides[
            0
          ],

        modeElement:
          crBookerSideOneMode,

        teamElement:
          crBookerSideOneTeam,

        wrestlerOne:
          crBookerSideOneWrestlerOne,

        wrestlerTwo:
          crBookerSideOneWrestlerTwo,
      },

      {
        side:
          match.sides[
            1
          ],

        modeElement:
          crBookerSideTwoMode,

        teamElement:
          crBookerSideTwoTeam,

        wrestlerOne:
          crBookerSideTwoWrestlerOne,

        wrestlerTwo:
          crBookerSideTwoWrestlerTwo,
      },
    ].forEach(
      (configuration) => {
        const officialTeam =
          crBookerGetOfficialTeamByMembers(
            configuration.side.wrestlers,
          );

        if (
          officialTeam
        ) {
          configuration.modeElement.value =
            "team";

          configuration.teamElement.value =
            officialTeam.id;
        } else {
          configuration.modeElement.value =
            "custom";

          configuration.wrestlerOne.value =
            configuration.side.wrestlers[
              0
            ]
            ||
            "";

          configuration.wrestlerTwo.value =
            configuration.side.wrestlers[
              1
            ]
            ||
            "";
        }
      },
    );

    crBookerRefreshTagSide(
      1,
    );

    crBookerRefreshTagSide(
      2,
    );
  } else if (
    match.stipulation !==
    "Overthrow Rumble"
  ) {
    crBookerSideOneWrestlerOne.value =
      match.sides[
        0
      ]?.wrestlers[
        0
      ]
      ||
      "";

    crBookerSideTwoWrestlerOne.value =
      match.sides[
        1
      ]?.wrestlers[
        0
      ]
      ||
      "";

    crBookerSideThreeWrestler.value =
      match.sides[
        2
      ]?.wrestlers[
        0
      ]
      ||
      "";

    crBookerSideFourWrestler.value =
      match.sides[
        3
      ]?.wrestlers[
        0
      ]
      ||
      "";
  }

  crBookerSetStatus(
    "EDITING",
  );

  crBookerReview();
}


// =================================
// WRITE PERMISSION
// =================================

async function crBookerEnsureWritePermission() {
  if (
    !owlRepositoryHandle
  ) {
    return false;
  }

  const options = {
    mode:
      "readwrite",
  };

  if (
    await owlRepositoryHandle.queryPermission(
      options,
    )
    ===
    "granted"
  ) {
    return true;
  }

  return (
    await owlRepositoryHandle.requestPermission(
      options,
    )
  )
  ===
  "granted";
}


// =================================
// READ FILE
// =================================

async function crBookerReadFile() {
  const dataDirectory =
    await owlRepositoryHandle.getDirectoryHandle(
      "data",
    );

  const fileHandle =
    await dataDirectory.getFileHandle(
      "announced-matches.json",
    );

  const file =
    await fileHandle.getFile();

  return {
    fileHandle:

      fileHandle,

    text:

      await file.text(),
  };
}


// =================================
// WRITE FILE
// =================================

async function crBookerWriteFile(
  fileHandle,
  text,
) {
  const writable =
    await fileHandle.createWritable();

  await writable.write(
    text,
  );

  await writable.close();
}


// =================================
// FIND OBJECT BOUNDS
// =================================

function crBookerFindObjectBounds(
  text,
  recordId,
) {
  const escapedId =
    recordId.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

  const pattern =
    new RegExp(
      `"id"\\s*:\\s*"${escapedId}"`,
    );

  const match =
    pattern.exec(
      text,
    );

  if (
    !match
  ) {
    throw new Error(
      `Could not find booked match ${recordId}.`,
    );
  }

  const start =
    text.lastIndexOf(
      "{",
      match.index,
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
      text[
        index
      ];

    if (
      escaped
    ) {
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
      character === '"'
    ) {
      inString =
        !inString;

      continue;
    }

    if (
      inString
    ) {
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
        depth ===
        0
      ) {
        end =
          index;

        break;
      }
    }
  }

  if (
    start === -1
    ||
    end === -1
  ) {
    throw new Error(
      `Could not locate booked match ${recordId}.`,
    );
  }

  return {
    start:
      start,

    end:
      end,
  };
}


// =================================
// FORMAT OBJECT FOR ARRAY
// =================================

function crBookerFormatObject(
  record,
) {
  return JSON.stringify(
    record,
    null,
    2,
  )
    .split(
      "\n",
    )
    .map(
      (line) =>
        `  ${line}`,
    )
    .join(
      "\n",
    );
}


// =================================
// APPEND RECORD
// =================================

function crBookerAppendRecordText(
  text,
  record,
) {
  const closingIndex =
    text.lastIndexOf(
      "]",
    );

  if (
    closingIndex ===
    -1
  ) {
    throw new Error(
      "Could not find the end of announced-matches.json.",
    );
  }

  const before =
    text.slice(
      0,
      closingIndex,
    );

  const after =
    text.slice(
      closingIndex,
    );

  const trimmedBefore =
    before.trimEnd();

  const hasRecords =
    !trimmedBefore.endsWith(
      "[",
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
      record,
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
  record,
) {
  const bounds =
    crBookerFindObjectBounds(
      text,
      recordId,
    );

  return (
    text.slice(
      0,
      bounds.start,
    )
    +
    crBookerFormatObject(
      record,
    ).slice(
      2,
    )
    +
    text.slice(
      bounds.end + 1,
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
    crBookerMode.value ===
      "edit"
      ? {
          ...crBookerOriginalRecord,
        }
      : {
          id:
            crBookerGetNextMatchId(),
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
      form.status,
  };

  if (
    form.structure
  ) {
    record.structure =
      form.structure;
  } else {
    delete record.structure;
  }

  if (
    form.specialty
  ) {
    record.specialty =
      form.specialty;
  } else {
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


    if (
        crBookerTournamentLinkContext
    ) {


        record.tournamentLink = {

            tournamentId:
                crBookerTournamentLinkContext.tournamentId,

            bracketId:
                crBookerTournamentLinkContext.bracketId,

            bracketMatchId:
                crBookerTournamentLinkContext.bracketMatchId,

            roundId:
                crBookerTournamentLinkContext.roundId,

            roundOrder:
                crBookerTournamentLinkContext.roundOrder

        };

    }


    else if (
        crBookerMode.value !==
            "edit"
    ) {


        delete record.tournamentLink;

    }


    return record;

}

// =================================
// SAVE TOURNAMENT MATCH LINK
// =================================


async function crBookerSaveTournamentMatchLink(
    record
) {


    const context =
        crBookerTournamentLinkContext;


    if (
        !context
    ) {

        return false;

    }


    if (
        crBookerMode.value !==
            "create"
    ) {

        throw new Error(
            "Tournament intake can only create a new booked match."
        );

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

        throw new Error(
            "The tournament database is not available."
        );

    }


    let tournamentFound =
        false;


    let bracketFound =
        false;


    let roundFound =
        false;


    let bracketMatchFound =
        false;


    const updatedTournamentDatabase = {

        ...tournamentDatabase,

        tournaments:

            tournamentDatabase.tournaments.map(

                tournament => {


                    if (
                        tournament.id !==
                        context.tournamentId
                    ) {

                        return tournament;

                    }


                    tournamentFound =
                        true;


                    return {

                        ...tournament,

                        brackets:

                            Array.isArray(
                                tournament.brackets
                            )

                                ? tournament.brackets.map(

                                    bracket => {


                                        if (
                                            bracket.id !==
                                            context.bracketId
                                        ) {

                                            return bracket;

                                        }


                                        bracketFound =
                                            true;


                                        const bracketSetup =

                                            bracket.bracketSetup

                                            &&

                                            !Array.isArray(
                                                bracket.bracketSetup
                                            )

                                            &&

                                            typeof bracket.bracketSetup ===
                                                "object"

                                                ? bracket.bracketSetup

                                                : {

                                                    generated:
                                                        false,

                                                    generatedAt:
                                                        "",

                                                    rounds:
                                                        [],

                                                    winnerId:
                                                        ""

                                                };


                                        return {

                                            ...bracket,

                                            bracketSetup: {

                                                ...bracketSetup,

                                                rounds:

                                                    Array.isArray(
                                                        bracketSetup.rounds
                                                    )

                                                        ? bracketSetup.rounds.map(

                                                            round => {


                                                                if (
                                                                    round.id !==
                                                                    context.roundId
                                                                ) {

                                                                    return round;

                                                                }


                                                                roundFound =
                                                                    true;


                                                                return {

                                                                    ...round,

                                                                    matches:

                                                                        Array.isArray(
                                                                            round.matches
                                                                        )

                                                                            ? round.matches.map(

                                                                                match => {


                                                                                    if (
                                                                                        match.id !==
                                                                                        context.bracketMatchId
                                                                                    ) {

                                                                                        return match;

                                                                                    }


                                                                                    bracketMatchFound =
                                                                                        true;


                                                                                    if (
                                                                                        match.matchRecordId
                                                                                    ) {

                                                                                        throw new Error(

                                                                                            "This tournament matchup is already linked to a booked match."

                                                                                        );

                                                                                    }


                                                                                    return {

                                                                                        ...match,

                                                                                        eventId:
                                                                                            record.eventId,

                                                                                        matchRecordId:
                                                                                            record.id,

                                                                                        status:
                                                                                            record.status || "announced"

                                                                                    };

                                                                                }

                                                                            )

                                                                            : []

                                                                };

                                                            }

                                                        )

                                                        : []

                                            }

                                        };

                                    }

                                )

                                : []

                    };

                }

            )

    };


    if (
        !tournamentFound
    ) {

        throw new Error(
            "The linked tournament could not be found."
        );

    }


    if (
        !bracketFound
    ) {

        throw new Error(
            "The linked championship bracket could not be found."
        );

    }


    if (
        !roundFound
    ) {

        throw new Error(
            "The linked tournament round could not be found."
        );

    }


    if (
        !bracketMatchFound
    ) {

        throw new Error(
            "The linked tournament matchup could not be found."
        );

    }


    if (
        typeof writeTournamentDatabase !==
            "function"
    ) {

        throw new Error(
            "The tournament database writer is unavailable."
        );

    }


    await writeTournamentDatabase(
        updatedTournamentDatabase
    );


    return true;

}

// =================================
// SAVE MATCH
// =================================

async function crBookerSaveMatch() {
  crBookerSave.disabled =
    true;

  crBookerSetStatus(
    "SAVING...",
  );

  crBookerHideMessage();

  try {
    const permission =
      await crBookerEnsureWritePermission();

    if (
      !permission
    ) {
      throw new Error(
        "Write permission was not granted.",
      );
    }

    const form =
      crBookerGetFormRecord();

    const errors =
      crBookerValidate(
        form,
      );

    if (
      errors.length > 0
    ) {
      throw new Error(
        errors.join(" "),
      );
    }

    const record =
      crBookerBuildSavedRecord();

    const matchFile =
      await crBookerReadFile();

    const updatedText =
      crBookerMode.value ===
        "edit"
        ? crBookerReplaceRecordText(
            matchFile.text,
            crBookerOriginalRecord.id,
            record,
          )
        : crBookerAppendRecordText(
            matchFile.text,
            record,
          );

            await crBookerWriteFile(

            matchFile.fileHandle,

            updatedText

        );


        const savedTournamentContext =

            crBookerTournamentLinkContext

                ? {

                    ...crBookerTournamentLinkContext

                }

                : null;


        let tournamentMatchLinked =
            false;


        if (
            savedTournamentContext
        ) {


            try {


                tournamentMatchLinked =

                    await crBookerSaveTournamentMatchLink(
                        record
                    );


            }


            catch (
                tournamentLinkError
            ) {


                await crBookerWriteFile(

                    matchFile.fileHandle,

                    matchFile.text

                );


                throw new Error(

                    `${tournamentLinkError.message} The announced match write was rolled back.`

                );

            }

        }


        crBookerTournamentLinkContext =
            null;


        crBookerPendingMatchId =

            crBookerMode.value ===
                "edit"

                ? record.id

                : "";


        await loadRepositoryData(
            owlRepositoryHandle
        );

    crBookerRefreshMatchList();

    crBookerShowMessage(

    crBookerMode.value ===
        "edit"

        ? "Booked match changes were saved locally. Review announced-matches.json in GitHub Desktop."

        : tournamentMatchLinked

            ? "Tournament match was added to the event card and linked to its bracket. Review announced-matches.json and tournaments.json in GitHub Desktop."

            : "Match was added to the event card. Review announced-matches.json in GitHub Desktop.",

    "save-success"

);

    crBookerSetStatus(
      crBookerMode.value ===
        "edit"
        ? "SAVED"
        : "BOOKED",
    );
  } catch (
    error
  ) {
    console.error(
      "Could not save booked match:",
      error,
    );

    crBookerReview();

    crBookerSetStatus(
      "SAVE FAILED",
    );

    crBookerShowMessage(
      error.message
      ||
      "The booked match could not be saved.",

      "save-error",
    );
  }
}

// =================================
// TOURNAMENT MATCH INTAKE
// =================================


function crBookerGetTournamentIntakeEvent(
    eventId
) {


    const event =

        Array.isArray(
            owlControlRoomData.events
        )

            ? owlControlRoomData.events.find(

                storedEvent =>

                    storedEvent.id ===
                    eventId

            )

            : null;


    if (
        !event
    ) {

        return null;

    }


    if (
        String(
            event.status || ""
        ).toLowerCase() ===
            "completed"
    ) {

        return null;

    }


    return event;

}



function crBookerValidateTournamentIntake(
    intake
) {


    if (
        !intake

        ||

        Array.isArray(
            intake
        )

        ||

        typeof intake !==
            "object"
    ) {

        return "Tournament match information was not provided.";

    }


    if (
        intake.participantType !==
            "wrestler"

        &&

        intake.participantType !==
            "team"
    ) {

        return "Tournament participant type must be wrestler or team.";

    }


    if (
        !intake.participantOneId

        ||

        !intake.participantTwoId
    ) {

        return "The tournament matchup does not have two participants.";

    }


    if (
        intake.participantOneId ===
        intake.participantTwoId
    ) {

        return "The same participant cannot appear on both sides.";

    }


    if (
        !crBookerGetTournamentIntakeEvent(
            intake.eventId
        )
    ) {

        return "Select a valid non-completed hosting event.";

    }


    const cardOrder =
        Number(
            intake.order
        );


    if (
        !Number.isInteger(
            cardOrder
        )

        ||

        cardOrder <
            1
    ) {

        return "Tournament match card order must be a whole number greater than zero.";

    }


    if (
        intake.participantType ===
            "team"
    ) {


        const teamOne =
            crBookerGetTeam(
                intake.participantOneId
            );


        const teamTwo =
            crBookerGetTeam(
                intake.participantTwoId
            );


        if (
            !teamOne

            ||

            !teamTwo
        ) {

            return "One or more tournament team records could not be found.";

        }


        if (
            !Array.isArray(
                teamOne.members
            )

            ||

            teamOne.members.length !==
                2

            ||

            !Array.isArray(
                teamTwo.members
            )

            ||

            teamTwo.members.length !==
                2
        ) {

            return "Tournament tag-team matches require two official two-member teams.";

        }


        const sharedMember =

            teamOne.members.some(

                memberId =>

                    teamTwo.members.includes(
                        memberId
                    )

            );


        if (
            sharedMember
        ) {

            return "The two tournament teams cannot share a wrestler.";

        }

    }


    else {


        const wrestlerOne =
            crBookerGetWrestler(
                intake.participantOneId
            );


        const wrestlerTwo =
            crBookerGetWrestler(
                intake.participantTwoId
            );


        if (
            !wrestlerOne

            ||

            !wrestlerTwo
        ) {

            return "One or more tournament wrestler records could not be found.";

        }

    }


    return "";

}



function crBookerLoadTournamentMatch(
    intake
) {


    const validationError =
        crBookerValidateTournamentIntake(
            intake
        );


    if (
        validationError
    ) {

        throw new Error(
            validationError
        );

    }


    crBookerMode.value =
        "create";


    crBookerHandleModeChange();


    crBookerEvent.value =
        intake.eventId;


    crBookerHandleEventChange();


    crBookerMatchType.value =

        intake.participantType ===
            "team"

            ? "Tag Team"

            : "Singles";


    crBookerOrder.value =
        Number(
            intake.order
        );


    crBookerStatusField.value =
        "announced";


    crBookerStipulation.value =
        "";


    crBookerStatusNote.value =
        "";


    const championshipId =
        String(
            intake.championshipId || ""
        );


    const championshipExists =

        [

            ...crBookerChampionship.options

        ].some(

            option =>

                option.value ===
                championshipId

        );


    crBookerChampionship.value =

        championshipExists

            ? championshipId

            : "";


    crBookerRefreshSideLayout();


    if (
        intake.participantType ===
            "team"
    ) {


        crBookerSideOneMode.value =
            "team";


        crBookerSideTwoMode.value =
            "team";


        crBookerSideOneTeam.value =
            intake.participantOneId;


        crBookerSideTwoTeam.value =
            intake.participantTwoId;


        crBookerRefreshTagSide(
            1
        );


        crBookerRefreshTagSide(
            2
        );

    }


    else {


        crBookerSideOneWrestlerOne.value =
            intake.participantOneId;


        crBookerSideTwoWrestlerOne.value =
            intake.participantTwoId;

    }


    crBookerTournamentLinkContext = {

        tournamentId:
            intake.tournamentId || "",

        bracketId:
            intake.bracketId || "",

        bracketMatchId:
            intake.bracketMatchId || "",

        roundId:
            intake.roundId || "",

        roundOrder:
            Number(
                intake.roundOrder || 0
            )

    };


    crBookerReview();


    const matchBookerPanel =

        document.getElementById(
            "cr-tool-booker"
        );


    if (
        matchBookerPanel
    ) {


        matchBookerPanel.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }


    window.dispatchEvent(

        new CustomEvent(

            "owl-tournament-match-booker-loaded",

            {

                detail: {

                    ...crBookerTournamentLinkContext,

                    eventId:
                        intake.eventId,

                    order:
                        Number(
                            intake.order
                        )

                }

            }

        )

    );

}

// =================================
// INPUT EVENTS
// =================================

const crBookerReviewFields = [
  crBookerOrder,
  crBookerChampionship,
  crBookerStatusField,
  crBookerStipulation,
  crBookerDivision,
  crBookerStatusNote,

  crBookerSideOneTeam,
  crBookerSideTwoTeam,

  crBookerSideOneWrestlerOne,
  crBookerSideOneWrestlerTwo,

  crBookerSideTwoWrestlerOne,
  crBookerSideTwoWrestlerTwo,

  crBookerSideThreeWrestler,
  crBookerSideFourWrestler,
];


crBookerReviewFields.forEach(
  (field) => {
    field.addEventListener(
      "input",
      crBookerReview,
    );

    field.addEventListener(
      "change",
      crBookerReview,
    );
  },
);


crBookerMode.addEventListener(
  "change",
  crBookerHandleModeChange,
);


crBookerEvent.addEventListener(
  "change",
  crBookerHandleEventChange,
);


crBookerMatchSelect.addEventListener(
  "change",
  crBookerLoadSelectedMatch,
);


crBookerMatchType.addEventListener(
  "change",
  crBookerRefreshSideLayout,
);


crBookerStipulation.addEventListener(
  "change",
  () => {
    crBookerStructureChoice.value =
      "";

    crBookerConfigureStructureChoice(
      crBookerStipulation.value,
    );

    crBookerConfigureRuleChoice(
      crBookerStipulation.value,
    );

    crBookerRefreshAdvancedMatchLayout();
  },
);


crBookerStructureChoice.addEventListener(
  "change",
  () => {
    if (
      crBookerStipulation.value ===
      "Elimination Match"
    ) {
      if (
        crBookerStructureChoice.value ===
        CR_BOOKER_STRUCTURE_MODES.FREE_FOR_ALL
      ) {
        crBookerMatchType.value =
          "Singles";
      }

      if (
        crBookerStructureChoice.value ===
        CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE
      ) {
        crBookerMatchType.value =
          "Tag Team";
      }
    }

    if (
      crBookerStipulation.value ===
      "Handicap Match"
    ) {
      crBookerMatchType.value =
        "Tag Team";
    }

    crBookerRefreshSideLayout();
  },
);


crBookerParticipantCount.addEventListener(
  "change",
  () => {
    const isTeamElimination =
      crBookerStipulation.value ===
        "Elimination Match"
      &&
      crBookerStructureChoice.value ===
        CR_BOOKER_STRUCTURE_MODES.TEAM_BATTLE;

    if (
      isTeamElimination
    ) {
      const existingSideWrestlers =
        [1, 2]
          .map(
            (sideNumber) =>
              crBookerGetTeamBattleParticipantSelects(
                sideNumber,
              ).map(
                (selectElement) =>
                  selectElement.value,
              ),
          );

      crBookerRenderTeamBattleSides(
        existingSideWrestlers,
        Number(
          crBookerParticipantCount.value,
        )
        ||
        2,
      );
    } else {
      crBookerRenderAdvancedParticipants(
        Number(
          crBookerParticipantCount.value,
        )
        ||
        6,
      );
    }

    crBookerReview();
  },
);


crBookerEliminationRule.addEventListener(
  "change",
  crBookerReview,
);


crBookerSideOneMode.addEventListener(
  "change",
  () =>
    crBookerRefreshTagSide(
      1,
    ),
);


crBookerSideTwoMode.addEventListener(
  "change",
  () =>
    crBookerRefreshTagSide(
      2,
    ),
);


crBookerSave.addEventListener(
    "click",
    crBookerSaveMatch
);


window.addEventListener(

    "owl-load-tournament-match",

    event => {


        try {


            crBookerLoadTournamentMatch(

                event.detail || {}

            );


        }


        catch (
            error
        ) {


            console.error(

                "Could not load tournament match into Match Booker:",

                error

            );


            crBookerSetStatus(
                "LOAD FAILED"
            );


            crBookerShowMessage(

                error.message

                ||

                "The tournament match could not be loaded.",

                "save-error"

            );

        }

    }

);



window.addEventListener(

    "owl-control-room-data-loaded",
  () => {
    crBookerPopulateOptions();

    if (
      crBookerMode.value ===
        "create"
      &&
      crBookerEvent.value
    ) {
      crBookerSetDefaultOrder();
    }
  },
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
      owlControlRoomData.wrestlers,
    )
    &&
    Array.isArray(
      owlControlRoomData.teams,
    )
    &&
    Array.isArray(
      owlControlRoomData.events,
    )
    &&
    Array.isArray(
      owlControlRoomData.championships,
    )
    &&
    Array.isArray(
      owlControlRoomData.announcedMatches,
    )
  ) {
    crBookerPopulateOptions();
  }
} catch (
  error
) {
  console.warn(
    "Match Booker waiting for repository data.",
    error,
  );
}
