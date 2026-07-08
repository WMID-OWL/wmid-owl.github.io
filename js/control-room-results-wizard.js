// =================================
// OWL CONTROL ROOM
// RESULTS WIZARD
// =================================

// =================================
// ELEMENTS
// =================================

const crResultsStatus =
  document.getElementById(
    "cr-results-status",
  );

const crResultsEvent =
  document.getElementById(
    "cr-results-event",
  );

const crResultsMatch =
  document.getElementById(
    "cr-results-match",
  );

const crResultsMatchPreview =
  document.getElementById(
    "cr-results-match-preview",
  );

const crResultsMatchSummary =
  document.getElementById(
    "cr-results-match-summary",
  );

const crResultsBasicFields =
  document.getElementById(
    "cr-results-basic-fields",
  );

const crResultsPerformanceFields =
  document.getElementById(
    "cr-results-performance-fields",
  );

const crResultsSpecialtyFields =
  document.getElementById(
    "cr-results-specialty-fields",
  );

const crResultsSpecialtyContent =
  document.getElementById(
    "cr-results-specialty-content",
  );

const crResultsReview =
  document.getElementById(
    "cr-results-review",
  );

const crResultsReviewList =
  document.getElementById(
    "cr-results-review-list",
  );

const crResultsError =
  document.getElementById(
    "cr-results-error",
  );

const crResultsSave =
  document.getElementById(
    "cr-results-save",
  );

const crResultsMessage =
  document.getElementById(
    "cr-results-message",
  );


const crResultsResultType =
  document.getElementById(
    "cr-results-result-type",
  );

const crResultsWinnerSideRow =
  document.getElementById(
    "cr-results-winner-side-row",
  );

const crResultsWinnerSide =
  document.getElementById(
    "cr-results-winner-side",
  );

const crResultsFinishWinnerRow =
  document.getElementById(
    "cr-results-finish-winner-row",
  );

const crResultsFinishWinner =
  document.getElementById(
    "cr-results-finish-winner",
  );

const crResultsFinishLoserRow =
  document.getElementById(
    "cr-results-finish-loser-row",
  );

const crResultsFinishLoser =
  document.getElementById(
    "cr-results-finish-loser",
  );

const crResultsMethodRow =
  document.getElementById(
    "cr-results-method-row",
  );

const crResultsMethod =
  document.getElementById(
    "cr-results-method",
  );

const crResultsRating =
  document.getElementById(
    "cr-results-rating",
  );

const crResultsStars =
  document.getElementById(
    "cr-results-stars",
  );

const crResultsTime =
  document.getElementById(
    "cr-results-time",
  );


// =================================
// STATE
// =================================

let crResultsSelectedMatch =
  null;


// =================================
// BASIC HELPERS
// =================================

function crResultsSetStatus(
  text,
) {
  crResultsStatus.textContent =
    text;
}


function crResultsShowMessage(
  message,
  type,
) {
  crResultsMessage.textContent =
    message;

  crResultsMessage.className =
    `cr-save-message ${type}`;

  crResultsMessage.hidden =
    false;
}


function crResultsHideMessage() {
  crResultsMessage.textContent =
    "";

  crResultsMessage.hidden =
    true;
}


function crResultsHideMatchFields() {
  crResultsMatchPreview.hidden =
    true;

  crResultsBasicFields.hidden =
    true;

  crResultsPerformanceFields.hidden =
    true;

  crResultsSpecialtyFields.hidden =
    true;

  crResultsReview.hidden =
    true;

  crResultsSave.disabled =
    true;

  crResultsSpecialtyContent.innerHTML =
    "";
}


function crResultsGetWrestlerName(
  wrestlerId,
) {
  const wrestler =
    owlControlRoomData.wrestlers.find(
      (item) =>
        item.id === wrestlerId,
    );

  return wrestler
    ? wrestler.name
    : wrestlerId;
}


function crResultsGetChampionshipName(
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


function crResultsFormatSide(
  side,
) {
  const wrestlerIds =
    Array.isArray(
      side?.wrestlers,
    )
      ? side.wrestlers
      : [];

  return wrestlerIds
    .map(
      crResultsGetWrestlerName,
    )
    .join(" & ");
}


function crResultsFormatMatch(
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
      crResultsFormatSide,
    )
    .filter(Boolean)
    .join(" vs. ");
}


function crResultsAddRow(
  container,
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

  container.appendChild(
    row,
  );
}


function crResultsGetSideLabel(
  sideIndex,
) {
  const side =
    crResultsSelectedMatch
      ?.sides
      ?.[sideIndex];

  return side
    ? crResultsFormatSide(
        side,
      )
    : "—";
}


function crResultsTimeToSeconds(
  timeValue,
) {
  if (
    !/^(?:\d+):[0-5]\d$/.test(
      timeValue,
    )
  ) {
    return null;
  }

  const [
    minutes,
    seconds,
  ] =
    timeValue
      .split(":")
      .map(Number);

  return (
    minutes * 60
    +
    seconds
  );
}


function crResultsJoinWrestlerNames(
  wrestlerIds,
) {
  if (
    !Array.isArray(
      wrestlerIds,
    )
    ||
    wrestlerIds.length === 0
  ) {
    return "—";
  }

  return wrestlerIds
    .map(
      crResultsGetWrestlerName,
    )
    .join(", ");
}


// =================================
// EVENT AND MATCH POPULATION
// =================================

function crResultsPopulateEvents() {
  const oldValue =
    crResultsEvent.value;

  crResultsEvent.innerHTML = `
    <option value="">
      Select Event
    </option>
  `;

  const events =
    [...owlControlRoomData.events]
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

      crResultsEvent.appendChild(
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
    crResultsEvent.value =
      oldValue;
  }
}


function crResultsGetEventMatches() {
  const eventId =
    crResultsEvent.value;

  if (!eventId) {
    return [];
  }

  return owlControlRoomData
    .announcedMatches
    .filter(
      (match) =>
        match.eventId === eventId,
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


function crResultsPopulateMatches() {
  const oldValue =
    crResultsMatch.value;

  crResultsMatch.innerHTML = `
    <option value="">
      Select Match
    </option>
  `;

  const eventMatches =
    crResultsGetEventMatches();

  eventMatches.forEach(
    (match) => {
      const option =
        document.createElement(
          "option",
        );

      option.value =
        match.id;

      option.textContent =
        `Match ${match.order} — ${crResultsFormatMatch(match)}`;

      crResultsMatch.appendChild(
        option,
      );
    },
  );

  crResultsMatch.disabled =
    !crResultsEvent.value;

  if (
    oldValue
    &&
    eventMatches.some(
      (match) =>
        match.id === oldValue,
    )
  ) {
    crResultsMatch.value =
      oldValue;
  }
}


// =================================
// STANDARD RESULT CONTROLS
// =================================

function crResultsPopulateWinnerControls(
  match,
) {
  crResultsWinnerSide.innerHTML = `
    <option value="">
      Select Winning Side
    </option>
  `;

  crResultsFinishWinner.innerHTML = `
    <option value="">
      Select Wrestler
    </option>
  `;

  crResultsFinishLoser.innerHTML = `
    <option value="">
      Select Wrestler
    </option>
  `;

  const sides =
    Array.isArray(
      match.sides,
    )
      ? match.sides
      : [];

  sides.forEach(
    (side, index) => {
      const option =
        document.createElement(
          "option",
        );

      option.value =
        String(index);

      option.textContent =
        `Side ${index + 1} — ${crResultsFormatSide(side)}`;

      crResultsWinnerSide.appendChild(
        option,
      );
    },
  );

  const wrestlerIds = [
    ...new Set(
      sides.flatMap(
        (side) =>
          Array.isArray(
            side.wrestlers,
          )
            ? side.wrestlers
            : [],
      ),
    ),
  ];

  wrestlerIds.forEach(
    (wrestlerId) => {
      const winnerOption =
        document.createElement(
          "option",
        );

      winnerOption.value =
        wrestlerId;

      winnerOption.textContent =
        crResultsGetWrestlerName(
          wrestlerId,
        );

      crResultsFinishWinner.appendChild(
        winnerOption,
      );


      const loserOption =
        document.createElement(
          "option",
        );

      loserOption.value =
        wrestlerId;

      loserOption.textContent =
        crResultsGetWrestlerName(
          wrestlerId,
        );

      crResultsFinishLoser.appendChild(
        loserOption,
      );
    },
  );
}


function crResultsRefreshResultTypeLayout() {
  const isWin =
    crResultsResultType.value ===
    "win";

  const isOverthrowRumble =
    crResultsSelectedMatch
      ?.stipulation ===
      "Overthrow Rumble";

  const showStandardWinFields =
    isWin
    &&
    !isOverthrowRumble;

  crResultsWinnerSideRow.hidden =
    !showStandardWinFields;

  crResultsWinnerSideRow.style.display =
    showStandardWinFields
      ? ""
      : "none";


  crResultsFinishWinnerRow.hidden =
    !showStandardWinFields;

  crResultsFinishWinnerRow.style.display =
    showStandardWinFields
      ? ""
      : "none";


  crResultsFinishLoserRow.hidden =
    !showStandardWinFields;

  crResultsFinishLoserRow.style.display =
    showStandardWinFields
      ? ""
      : "none";


  crResultsMethodRow.hidden =
    !showStandardWinFields;

  crResultsMethodRow.style.display =
    showStandardWinFields
      ? ""
      : "none";

  crResultsReviewResult();
}


// =================================
// BATTLE ROYAL RESULTS
// =================================

function crResultsGetBattleRoyalParticipants() {
  if (
    !crResultsSelectedMatch
    ||
    !Array.isArray(
      crResultsSelectedMatch.sides,
    )
  ) {
    return [];
  }

  return crResultsSelectedMatch.sides
    .flatMap(
      (side) =>
        Array.isArray(
          side.wrestlers,
        )
          ? side.wrestlers
          : [],
    )
    .filter(Boolean);
}


function crResultsBuildBattleRoyalResult() {
  if (
    crResultsSelectedMatch
      ?.stipulation !==
      "Battle Royal"
  ) {
    return null;
  }

  const rows = [
    ...crResultsSpecialtyContent
      .querySelectorAll(
        "[data-cr-results-br-participant]",
      ),
  ];

  return {
    participantResults:
      rows.map(
        (row) => {
          const wrestlerId =
            row.dataset
              .crResultsBrParticipant;

          const timeInput =
            row.querySelector(
              "[data-cr-results-br-time]",
            );

          const eliminatorSelect =
            row.querySelector(
              "[data-cr-results-br-eliminator]",
            );

          return {
            wrestlerId:
              wrestlerId,

            timeInMatch:
              timeInput
                ?.value
                .trim()
              ||
              "",

            eliminatedBy:
              eliminatorSelect
                ?.value
              ||
              null,
          };
        },
      ),
  };
}


function crResultsRenderBattleRoyalFields(
  match,
) {
  const participantIds =
    Array.isArray(
      match.sides,
    )
      ? match.sides
          .flatMap(
            (side) =>
              Array.isArray(
                side.wrestlers,
              )
                ? side.wrestlers
                : [],
          )
          .filter(Boolean)
      : [];

  crResultsSpecialtyContent.innerHTML =
    "";

  participantIds.forEach(
    (wrestlerId) => {
      const row =
        document.createElement(
          "div",
        );

      row.className =
        "cr-editor-section";

      row.dataset.crResultsBrParticipant =
        wrestlerId;


      const heading =
        document.createElement(
          "div",
        );

      heading.className =
        "cr-editor-section-heading";

      heading.innerHTML = `
        <span>
          PARTICIPANT
        </span>

        <h3>
          ${crResultsGetWrestlerName(wrestlerId)}
        </h3>
      `;


      const grid =
        document.createElement(
          "div",
        );

      grid.className =
        "cr-editor-form-grid";


      const timeGroup =
        document.createElement(
          "div",
        );

      timeGroup.className =
        "cr-form-group";


      const timeLabel =
        document.createElement(
          "label",
        );

      timeLabel.textContent =
        "TIME IN MATCH";


      const timeInput =
        document.createElement(
          "input",
        );

      timeInput.type =
        "text";

      timeInput.placeholder =
        "12:34";

      timeInput.autocomplete =
        "off";

      timeInput.dataset.crResultsBrTime =
        "true";


      timeGroup.appendChild(
        timeLabel,
      );

      timeGroup.appendChild(
        timeInput,
      );


      const eliminatorGroup =
        document.createElement(
          "div",
        );

      eliminatorGroup.className =
        "cr-form-group";


      const eliminatorLabel =
        document.createElement(
          "label",
        );

      eliminatorLabel.textContent =
        "ELIMINATED BY";


      const eliminatorSelect =
        document.createElement(
          "select",
        );

      eliminatorSelect.dataset.crResultsBrEliminator =
        "true";

      eliminatorSelect.innerHTML = `
        <option value="">
          Not Eliminated / Winner
        </option>
      `;


      participantIds
        .filter(
          (otherId) =>
            otherId !== wrestlerId,
        )
        .forEach(
          (otherId) => {
            const option =
              document.createElement(
                "option",
              );

            option.value =
              otherId;

            option.textContent =
              crResultsGetWrestlerName(
                otherId,
              );

            eliminatorSelect.appendChild(
              option,
            );
          },
        );


      eliminatorGroup.appendChild(
        eliminatorLabel,
      );

      eliminatorGroup.appendChild(
        eliminatorSelect,
      );


      grid.appendChild(
        timeGroup,
      );

      grid.appendChild(
        eliminatorGroup,
      );


      row.appendChild(
        heading,
      );

      row.appendChild(
        grid,
      );

      crResultsSpecialtyContent.appendChild(
        row,
      );


      [
        timeInput,
        eliminatorSelect,
      ].forEach(
        (field) => {
          field.addEventListener(
            "input",
            crResultsReviewResult,
          );

          field.addEventListener(
            "change",
            crResultsReviewResult,
          );
        },
      );
    },
  );
}


// =================================
// OVERTHROW RUMBLE RESULTS
// =================================

function crResultsGetOverthrowEntryRows() {
  return [
    ...crResultsSpecialtyContent
      .querySelectorAll(
        "[data-cr-results-overthrow-entry]",
      ),
  ];
}


function crResultsGetOverthrowEntrantIds() {
  return crResultsGetOverthrowEntryRows()
    .map(
      (row) =>
        row.querySelector(
          "[data-cr-results-overthrow-wrestler]",
        )
          ?.value
        ||
        "",
    )
    .filter(Boolean);
}


function crResultsPopulateOverthrowWrestlerSelect(
  selectElement,
  selectedValue = "",
) {
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
    selectedValue
    &&
    wrestlers.some(
      (wrestler) =>
        wrestler.id ===
        selectedValue,
    )
  ) {
    selectElement.value =
      selectedValue;
  }
}


function crResultsCalculateOverthrowStatistics(
  overthrowResult,
) {
  const entries =
    Array.isArray(
      overthrowResult?.entries,
    )
      ? overthrowResult.entries
      : [];

  const validEntries =
    entries.filter(
      (entry) =>
        entry.wrestlerId,
    );

  const eliminationCounts =
    new Map();


  validEntries.forEach(
    (entry) => {
      eliminationCounts.set(
        entry.wrestlerId,
        0,
      );
    },
  );


  validEntries.forEach(
    (entry) => {
      if (
        entry.eliminatedBy
        &&
        eliminationCounts.has(
          entry.eliminatedBy,
        )
      ) {
        eliminationCounts.set(
          entry.eliminatedBy,

          eliminationCounts.get(
            entry.eliminatedBy,
          )
          +
          1,
        );
      }
    },
  );


  const highestEliminationCount =
    eliminationCounts.size > 0
      ? Math.max(
          ...eliminationCounts.values(),
        )
      : 0;


  const mostEliminations =
    highestEliminationCount > 0
      ? [...eliminationCounts.entries()]
          .filter(
            ([, count]) =>
              count ===
              highestEliminationCount,
          )
          .map(
            ([wrestlerId]) =>
              wrestlerId,
          )
      : [];


  const timedEntries =
    validEntries
      .map(
        (entry) => ({
          wrestlerId:
            entry.wrestlerId,

          timeInMatch:
            entry.timeInMatch,

          seconds:
            crResultsTimeToSeconds(
              entry.timeInMatch,
            ),
        }),
      )
      .filter(
        (entry) =>
          entry.seconds !== null,
      );


  const longestSeconds =
    timedEntries.length > 0
      ? Math.max(
          ...timedEntries.map(
            (entry) =>
              entry.seconds,
          ),
        )
      : null;


  const shortestSeconds =
    timedEntries.length > 0
      ? Math.min(
          ...timedEntries.map(
            (entry) =>
              entry.seconds,
          ),
        )
      : null;


  const longestEntries =
    longestSeconds === null
      ? []
      : timedEntries.filter(
          (entry) =>
            entry.seconds ===
            longestSeconds,
        );


  const shortestEntries =
    shortestSeconds === null
      ? []
      : timedEntries.filter(
          (entry) =>
            entry.seconds ===
            shortestSeconds,
        );


  return {
    mostEliminations: {
      wrestlerIds:
        mostEliminations,

      count:
        highestEliminationCount,
    },

    longestTime: {
      wrestlerIds:
        longestEntries.map(
          (entry) =>
            entry.wrestlerId,
        ),

      timeInMatch:
        longestEntries[0]
          ?.timeInMatch
        ||
        "",
    },

    shortestTime: {
      wrestlerIds:
        shortestEntries.map(
          (entry) =>
            entry.wrestlerId,
        ),

      timeInMatch:
        shortestEntries[0]
          ?.timeInMatch
        ||
        "",
    },
  };
}


function crResultsBuildOverthrowResult() {
  if (
    crResultsSelectedMatch
      ?.stipulation !==
      "Overthrow Rumble"
  ) {
    return null;
  }


  const entries =
    crResultsGetOverthrowEntryRows()
      .map(
        (row) => ({
          entryNumber:
            Number(
              row.dataset
                .crResultsOverthrowEntry,
            ),

          wrestlerId:
            row.querySelector(
              "[data-cr-results-overthrow-wrestler]",
            )
              ?.value
            ||
            "",

          timeInMatch:
            row.querySelector(
              "[data-cr-results-overthrow-time]",
            )
              ?.value
              .trim()
            ||
            "",

          eliminatedBy:
            row.querySelector(
              "[data-cr-results-overthrow-eliminator]",
            )
              ?.value
            ||
            null,
        }),
      );


  const finalFour =
    [4, 3, 2, 1]
      .map(
        (place) => {
          const wrestlerSelect =
            crResultsSpecialtyContent
              .querySelector(
                `[data-cr-results-overthrow-final-place="${place}"]`,
              );

          const methodSelect =
            crResultsSpecialtyContent
              .querySelector(
                `[data-cr-results-overthrow-final-method="${place}"]`,
              );

          return {
            place:
              place,

            wrestlerId:
              wrestlerSelect
                ?.value
              ||
              "",

            method:
              place === 1
                ? null
                : methodSelect
                    ?.value
                  ||
                  "",
          };
        },
      );


  const result = {
    entries:
      entries,

    finalFour:
      finalFour,

    winner:
      finalFour.find(
        (entry) =>
          entry.place === 1,
      )
        ?.wrestlerId
      ||
      "",
  };


  result.statistics =
    crResultsCalculateOverthrowStatistics(
      result,
    );


  return result;
}


function crResultsRefreshOverthrowChoices() {
  const entrantIds =
    crResultsGetOverthrowEntrantIds();


  crResultsGetOverthrowEntryRows()
    .forEach(
      (row) => {
        const wrestlerId =
          row.querySelector(
            "[data-cr-results-overthrow-wrestler]",
          )
            ?.value
          ||
          "";

        const eliminatorSelect =
          row.querySelector(
            "[data-cr-results-overthrow-eliminator]",
          );

        if (
          !eliminatorSelect
        ) {
          return;
        }


        const oldValue =
          eliminatorSelect.value;


        eliminatorSelect.innerHTML = `
          <option value="">
            Not Eliminated / Winner
          </option>
        `;


        entrantIds
          .filter(
            (otherId) =>
              otherId !== wrestlerId,
          )
          .forEach(
            (otherId) => {
              const option =
                document.createElement(
                  "option",
                );

              option.value =
                otherId;

              option.textContent =
                crResultsGetWrestlerName(
                  otherId,
                );

              eliminatorSelect.appendChild(
                option,
              );
            },
          );


        if (
          entrantIds.includes(
            oldValue,
          )
          &&
          oldValue !== wrestlerId
        ) {
          eliminatorSelect.value =
            oldValue;
        }
      },
    );


  [
    ...crResultsSpecialtyContent
      .querySelectorAll(
        "[data-cr-results-overthrow-final-place]",
      ),
  ].forEach(
    (selectElement) => {
      const oldValue =
        selectElement.value;

      selectElement.innerHTML = `
        <option value="">
          Select Wrestler
        </option>
      `;

      entrantIds.forEach(
        (wrestlerId) => {
          const option =
            document.createElement(
              "option",
            );

          option.value =
            wrestlerId;

          option.textContent =
            crResultsGetWrestlerName(
              wrestlerId,
            );

          selectElement.appendChild(
            option,
          );
        },
      );

      if (
        entrantIds.includes(
          oldValue,
        )
      ) {
        selectElement.value =
          oldValue;
      }
    },
  );


  crResultsReviewResult();
}


function crResultsRenderOverthrowFields() {
  crResultsSpecialtyContent.innerHTML =
    "";


  const entryHeading =
    document.createElement(
      "div",
    );

  entryHeading.className =
    "cr-editor-section-heading";

  entryHeading.innerHTML = `
    <span>
      OVERTHROW ENTRIES
    </span>

    <h3>
      Entry Order and Eliminations
    </h3>
  `;

  crResultsSpecialtyContent.appendChild(
    entryHeading,
  );


  for (
    let entryNumber = 1;
    entryNumber <= 30;
    entryNumber += 1
  ) {
    const row =
      document.createElement(
        "div",
      );

    row.className =
      "cr-editor-section";

    row.dataset.crResultsOverthrowEntry =
      String(
        entryNumber,
      );


    const heading =
      document.createElement(
        "div",
      );

    heading.className =
      "cr-editor-section-heading";

    heading.innerHTML = `
      <span>
        ENTRY NUMBER
      </span>

      <h3>
        #${entryNumber}
      </h3>
    `;


    const grid =
      document.createElement(
        "div",
      );

    grid.className =
      "cr-editor-form-grid";


    const wrestlerGroup =
      document.createElement(
        "div",
      );

    wrestlerGroup.className =
      "cr-form-group";


    const wrestlerLabel =
      document.createElement(
        "label",
      );

    wrestlerLabel.textContent =
      "WRESTLER";


    const wrestlerSelect =
      document.createElement(
        "select",
      );

    wrestlerSelect.dataset.crResultsOverthrowWrestler =
      "true";

    crResultsPopulateOverthrowWrestlerSelect(
      wrestlerSelect,
    );


    wrestlerGroup.appendChild(
      wrestlerLabel,
    );

    wrestlerGroup.appendChild(
      wrestlerSelect,
    );


    const timeGroup =
      document.createElement(
        "div",
      );

    timeGroup.className =
      "cr-form-group";


    const timeLabel =
      document.createElement(
        "label",
      );

    timeLabel.textContent =
      "TIME IN MATCH";


    const timeInput =
      document.createElement(
        "input",
      );

    timeInput.type =
      "text";

    timeInput.placeholder =
      "12:34";

    timeInput.autocomplete =
      "off";

    timeInput.dataset.crResultsOverthrowTime =
      "true";


    timeGroup.appendChild(
      timeLabel,
    );

    timeGroup.appendChild(
      timeInput,
    );


    const eliminatorGroup =
      document.createElement(
        "div",
      );

    eliminatorGroup.className =
      "cr-form-group";


    const eliminatorLabel =
      document.createElement(
        "label",
      );

    eliminatorLabel.textContent =
      "ELIMINATED BY";


    const eliminatorSelect =
      document.createElement(
        "select",
      );

    eliminatorSelect.dataset.crResultsOverthrowEliminator =
      "true";

    eliminatorSelect.innerHTML = `
      <option value="">
        Not Eliminated / Winner
      </option>
    `;


    eliminatorGroup.appendChild(
      eliminatorLabel,
    );

    eliminatorGroup.appendChild(
      eliminatorSelect,
    );


    grid.appendChild(
      wrestlerGroup,
    );

    grid.appendChild(
      timeGroup,
    );

    grid.appendChild(
      eliminatorGroup,
    );


    row.appendChild(
      heading,
    );

    row.appendChild(
      grid,
    );

    crResultsSpecialtyContent.appendChild(
      row,
    );


    wrestlerSelect.addEventListener(
      "change",
      crResultsRefreshOverthrowChoices,
    );

    timeInput.addEventListener(
      "input",
      crResultsReviewResult,
    );

    eliminatorSelect.addEventListener(
      "change",
      crResultsReviewResult,
    );
  }


  const finalFourSection =
    document.createElement(
      "div",
    );

  finalFourSection.className =
    "cr-editor-section";


  const finalFourHeading =
    document.createElement(
      "div",
    );

  finalFourHeading.className =
    "cr-editor-section-heading";

  finalFourHeading.innerHTML = `
    <span>
      FINAL FOUR
    </span>

    <h3>
      Final Finish Order
    </h3>
  `;

  finalFourSection.appendChild(
    finalFourHeading,
  );


  const finalFourGrid =
    document.createElement(
      "div",
    );

  finalFourGrid.className =
    "cr-editor-form-grid";


  const finalFourLabels = {
    4:
      "4TH PLACE",

    3:
      "3RD PLACE",

    2:
      "RUNNER-UP",

    1:
      "WINNER",
  };


  [4, 3, 2, 1].forEach(
    (place) => {
      const wrestlerGroup =
        document.createElement(
          "div",
        );

      wrestlerGroup.className =
        "cr-form-group";


      const wrestlerLabel =
        document.createElement(
          "label",
        );

      wrestlerLabel.textContent =
        finalFourLabels[
          place
        ];


      const wrestlerSelect =
        document.createElement(
          "select",
        );

      wrestlerSelect.dataset.crResultsOverthrowFinalPlace =
        String(
          place,
        );

      wrestlerSelect.innerHTML = `
        <option value="">
          Select Wrestler
        </option>
      `;


      wrestlerGroup.appendChild(
        wrestlerLabel,
      );

      wrestlerGroup.appendChild(
        wrestlerSelect,
      );

      finalFourGrid.appendChild(
        wrestlerGroup,
      );


      wrestlerSelect.addEventListener(
        "change",
        crResultsReviewResult,
      );


      if (
        place !== 1
      ) {
        const methodGroup =
          document.createElement(
            "div",
          );

        methodGroup.className =
          "cr-form-group";


        const methodLabel =
          document.createElement(
            "label",
          );

        methodLabel.textContent =
          `${finalFourLabels[place]} ELIMINATION METHOD`;


        const methodSelect =
          document.createElement(
            "select",
          );

        methodSelect.dataset.crResultsOverthrowFinalMethod =
          String(
            place,
          );

        methodSelect.innerHTML = `
          <option value="">
            Select Method
          </option>

          <option value="Pinfall">
            Pinfall
          </option>

          <option value="Submission">
            Submission
          </option>

          <option value="KO">
            KO
          </option>
        `;


        methodGroup.appendChild(
          methodLabel,
        );

        methodGroup.appendChild(
          methodSelect,
        );

        finalFourGrid.appendChild(
          methodGroup,
        );


        methodSelect.addEventListener(
          "change",
          crResultsReviewResult,
        );
      }
    },
  );


  finalFourSection.appendChild(
    finalFourGrid,
  );

  crResultsSpecialtyContent.appendChild(
    finalFourSection,
  );
}


// =================================
// SPECIALTY FIELD ROUTING
// =================================

function crResultsRenderSpecialtyFields(
  match,
) {
  crResultsSpecialtyContent.innerHTML =
    "";


  if (
    match.stipulation ===
    "Battle Royal"
  ) {
    crResultsRenderBattleRoyalFields(
      match,
    );

    crResultsSpecialtyFields.hidden =
      false;

    return;
  }


  if (
    match.stipulation ===
    "Overthrow Rumble"
  ) {
    crResultsRenderOverthrowFields();

    crResultsSpecialtyFields.hidden =
      false;

    return;
  }


  crResultsSpecialtyFields.hidden =
    true;
}


// =================================
// FORM RECORD
// =================================

function crResultsGetFormRecord() {
  const match =
    crResultsSelectedMatch;

  const resultType =
    crResultsResultType.value;

  const isWin =
    resultType ===
    "win";


  let specialtyResult =
    null;


  if (
    match?.stipulation ===
    "Battle Royal"
  ) {
    specialtyResult =
      crResultsBuildBattleRoyalResult();
  }

  else if (
    match?.stipulation ===
    "Overthrow Rumble"
  ) {
    specialtyResult =
      crResultsBuildOverthrowResult();
  }


  return {
    matchId:
      match?.id
      ||
      "",

    eventId:
      match?.eventId
      ||
      "",

    resultType:
      resultType,

    winningSideIndex:
      isWin
      &&
      crResultsWinnerSide.value !== ""
        ? Number(
            crResultsWinnerSide.value,
          )
        : null,

    winningWrestlerId:
      isWin
        ? crResultsFinishWinner.value
        : "",

    losingWrestlerId:
      isWin
        ? crResultsFinishLoser.value
        : "",

    finishMethod:
      isWin
        ? crResultsMethod.value
        : "",

    rating:
      crResultsRating.value === ""
        ? null
        : Number(
            crResultsRating.value,
          ),

    stars:
      crResultsStars.value === ""
        ? null
        : Number(
            crResultsStars.value,
          ),

    matchTime:
      crResultsTime.value.trim(),

    specialtyResult:
      specialtyResult,
  };
}


// =================================
// VALIDATION
// =================================

function crResultsValidate(
  record,
) {
  const errors =
    [];


  if (
    !record.matchId
  ) {
    errors.push(
      "Select a match.",
    );

    return errors;
  }


  const isOverthrowRumble =
    crResultsSelectedMatch
      ?.stipulation ===
      "Overthrow Rumble";


  if (
    record.resultType ===
      "win"
    &&
    !isOverthrowRumble
  ) {
    if (
      !Number.isInteger(
        record.winningSideIndex,
      )
    ) {
      errors.push(
        "Select the winning side.",
      );
    }


    if (
      !record.winningWrestlerId
    ) {
      errors.push(
        "Select the winning wrestler.",
      );
    }


    if (
      !record.losingWrestlerId
    ) {
      errors.push(
        "Select the losing wrestler.",
      );
    }


    if (
      !record.finishMethod
    ) {
      errors.push(
        "Select the finish method.",
      );
    }


    if (
      record.winningWrestlerId
      &&
      record.losingWrestlerId
      &&
      record.winningWrestlerId ===
        record.losingWrestlerId
    ) {
      errors.push(
        "Winning and losing wrestler cannot be the same person.",
      );
    }


    const sides =
      Array.isArray(
        crResultsSelectedMatch
          ?.sides,
      )
        ? crResultsSelectedMatch.sides
        : [];


    const winningSide =
      Number.isInteger(
        record.winningSideIndex,
      )
        ? sides[
            record.winningSideIndex
          ]
        : null;


    const winningSideWrestlers =
      Array.isArray(
        winningSide?.wrestlers,
      )
        ? winningSide.wrestlers
        : [];


    if (
      record.winningWrestlerId
      &&
      winningSide
      &&
      !winningSideWrestlers.includes(
        record.winningWrestlerId,
      )
    ) {
      errors.push(
        "Winning wrestler must belong to the winning side.",
      );
    }


    if (
      record.losingWrestlerId
      &&
      winningSide
      &&
      winningSideWrestlers.includes(
        record.losingWrestlerId,
      )
    ) {
      errors.push(
        "Losing wrestler cannot belong to the winning side.",
      );
    }
  }


  if (
    record.rating === null
    ||
    !Number.isInteger(
      record.rating,
    )
    ||
    record.rating < 0
    ||
    record.rating > 100
  ) {
    errors.push(
      "Match % must be a whole number from 0 to 100.",
    );
  }


  if (
    record.stars === null
    ||
    Number.isNaN(
      record.stars,
    )
    ||
    record.stars < 0
    ||
    record.stars > 5
    ||
    Math.round(
      record.stars * 4,
    ) !==
    record.stars * 4
  ) {
    errors.push(
      "Star Rating must be from 0 to 5 in 0.25 increments.",
    );
  }


  if (
    !/^(?:\d+):[0-5]\d$/.test(
      record.matchTime,
    )
  ) {
    errors.push(
      "Match Time must use minutes and seconds, such as 18:42.",
    );
  }


  if (
    crResultsSelectedMatch
      ?.stipulation ===
      "Battle Royal"
    &&
    record.resultType ===
      "win"
  ) {
    const participantResults =
      Array.isArray(
        record.specialtyResult
          ?.participantResults,
      )
        ? record.specialtyResult
            .participantResults
        : [];


    const participantIds =
      crResultsGetBattleRoyalParticipants();


    if (
      participantResults.length !==
      participantIds.length
    ) {
      errors.push(
        "Battle Royal participant results are incomplete.",
      );
    }


    participantResults.forEach(
      (participant) => {
        if (
          !/^(?:\d+):[0-5]\d$/.test(
            participant.timeInMatch,
          )
        ) {
          errors.push(
            `${crResultsGetWrestlerName(
              participant.wrestlerId,
            )} needs a valid Time in Match.`,
          );
        }


        const isWinner =
          participant.wrestlerId ===
          record.winningWrestlerId;


        if (
          isWinner
          &&
          participant.eliminatedBy
        ) {
          errors.push(
            "The Battle Royal winner cannot have an eliminator.",
          );
        }


        if (
          !isWinner
          &&
          !participant.eliminatedBy
        ) {
          errors.push(
            `${crResultsGetWrestlerName(
              participant.wrestlerId,
            )} needs an eliminator.`,
          );
        }


        if (
          participant.eliminatedBy ===
          participant.wrestlerId
        ) {
          errors.push(
            "A wrestler cannot eliminate themselves.",
          );
        }
      },
    );
  }


  if (
    isOverthrowRumble
  ) {
    if (
      record.resultType !==
      "win"
    ) {
      errors.push(
        "Overthrow Rumble must have a winner.",
      );
    }


    const overthrowResult =
      record.specialtyResult;


    const entries =
      Array.isArray(
        overthrowResult?.entries,
      )
        ? overthrowResult.entries
        : [];


    const finalFour =
      Array.isArray(
        overthrowResult?.finalFour,
      )
        ? overthrowResult.finalFour
        : [];


    if (
      entries.length !== 30
    ) {
      errors.push(
        "Overthrow Rumble must contain exactly 30 entries.",
      );
    }


    const entrantIds =
      entries
        .map(
          (entry) =>
            entry.wrestlerId,
        )
        .filter(Boolean);


    if (
      entrantIds.length !== 30
    ) {
      errors.push(
        "Select all 30 Overthrow Rumble entrants.",
      );
    }


    if (
      new Set(
        entrantIds,
      ).size !==
      entrantIds.length
    ) {
      errors.push(
        "The same wrestler cannot enter the Overthrow Rumble more than once.",
      );
    }


    const winnerId =
      overthrowResult?.winner
      ||
      "";


    entries.forEach(
      (entry) => {
        if (
          !/^(?:\d+):[0-5]\d$/.test(
            entry.timeInMatch,
          )
        ) {
          errors.push(
            `Entry #${entry.entryNumber} needs a valid Time in Match.`,
          );
        }


        if (
          entry.wrestlerId ===
            winnerId
          &&
          entry.eliminatedBy
        ) {
          errors.push(
            "The Overthrow Rumble winner cannot have an eliminator.",
          );
        }


        if (
          entry.wrestlerId
          &&
          entry.wrestlerId !==
            winnerId
          &&
          !entry.eliminatedBy
        ) {
          errors.push(
            `${crResultsGetWrestlerName(
              entry.wrestlerId,
            )} needs an eliminator.`,
          );
        }


        if (
          entry.eliminatedBy ===
          entry.wrestlerId
        ) {
          errors.push(
            "A wrestler cannot eliminate themselves.",
          );
        }
      },
    );


    const finalFourIds =
      finalFour
        .map(
          (entry) =>
            entry.wrestlerId,
        )
        .filter(Boolean);


    if (
      finalFourIds.length !== 4
    ) {
      errors.push(
        "Select all four Final Four finishers.",
      );
    }


    if (
      new Set(
        finalFourIds,
      ).size !==
      finalFourIds.length
    ) {
      errors.push(
        "Each Final Four position must contain a different wrestler.",
      );
    }


    finalFourIds.forEach(
      (wrestlerId) => {
        if (
          !entrantIds.includes(
            wrestlerId,
          )
        ) {
          errors.push(
            "Every Final Four wrestler must be an Overthrow Rumble entrant.",
          );
        }
      },
    );


    const validFinalMethods = [
      "Pinfall",
      "Submission",
      "KO",
    ];


    finalFour
      .filter(
        (entry) =>
          entry.place !== 1,
      )
      .forEach(
        (entry) => {
          if (
            !validFinalMethods.includes(
              entry.method,
            )
          ) {
            errors.push(
              `Final Four place ${entry.place} needs an elimination method.`,
            );
          }
        },
      );


    if (
      winnerId
      &&
      !entrantIds.includes(
        winnerId,
      )
    ) {
      errors.push(
        "The Overthrow Rumble winner must be one of the 30 entrants.",
      );
    }


    const finalPlaceByWrestler =
      new Map(
        finalFour
          .filter(
            (entry) =>
              entry.wrestlerId,
          )
          .map(
            (entry) => [
              entry.wrestlerId,
              entry.place,
            ],
          ),
      );


    finalFour
      .filter(
        (entry) =>
          entry.place !== 1
          &&
          entry.wrestlerId,
      )
      .forEach(
        (finalEntry) => {
          const participantEntry =
            entries.find(
              (entry) =>
                entry.wrestlerId ===
                finalEntry.wrestlerId,
            );


          const eliminatorPlace =
            finalPlaceByWrestler.get(
              participantEntry
                ?.eliminatedBy,
            );


          if (
            !eliminatorPlace
            ||
            eliminatorPlace >=
              finalEntry.place
          ) {
            errors.push(
              `${crResultsGetWrestlerName(
                finalEntry.wrestlerId,
              )} must be eliminated by a Final Four wrestler who finished higher.`,
            );
          }
        },
      );
  }


  return errors;
}


// =================================
// REVIEW RESULT
// =================================

function crResultsReviewResult() {
  if (
    !crResultsSelectedMatch
  ) {
    crResultsReview.hidden =
      true;

    crResultsSave.disabled =
      true;

    return;
  }


  const record =
    crResultsGetFormRecord();


  const errors =
    crResultsValidate(
      record,
    );


  crResultsReviewList.innerHTML =
    "";

  crResultsError.hidden =
    true;

  crResultsReview.hidden =
    false;


  crResultsAddRow(
    crResultsReviewList,

    "Result Type",

    record.resultType ===
      "win"
      ? "Win"
      : record.resultType ===
          "draw"
        ? "Draw"
        : "No Contest",
  );


  const isOverthrowRumble =
    crResultsSelectedMatch
      .stipulation ===
      "Overthrow Rumble";


  if (
    record.resultType ===
      "win"
    &&
    !isOverthrowRumble
  ) {
    crResultsAddRow(
      crResultsReviewList,

      "Winning Side",

      Number.isInteger(
        record.winningSideIndex,
      )
        ? crResultsGetSideLabel(
            record.winningSideIndex,
          )
        : "—",
    );


    crResultsAddRow(
      crResultsReviewList,

      "Winning Wrestler",

      record.winningWrestlerId
        ? crResultsGetWrestlerName(
            record.winningWrestlerId,
          )
        : "—",
    );


    crResultsAddRow(
      crResultsReviewList,

      "Losing Wrestler",

      record.losingWrestlerId
        ? crResultsGetWrestlerName(
            record.losingWrestlerId,
          )
        : "—",
    );


    crResultsAddRow(
      crResultsReviewList,

      "Finish Method",

      record.finishMethod
      ||
      "—",
    );
  }


  if (
    isOverthrowRumble
  ) {
    const overthrowResult =
      record.specialtyResult;


    const finalFour =
      Array.isArray(
        overthrowResult?.finalFour,
      )
        ? overthrowResult.finalFour
        : [];


    const statistics =
      overthrowResult?.statistics;


    const winnerId =
      overthrowResult?.winner
      ||
      "";


    const runnerUpId =
      finalFour.find(
        (entry) =>
          entry.place === 2,
      )
        ?.wrestlerId
      ||
      "";


    const thirdId =
      finalFour.find(
        (entry) =>
          entry.place === 3,
      )
        ?.wrestlerId
      ||
      "";


    const fourthId =
      finalFour.find(
        (entry) =>
          entry.place === 4,
      )
        ?.wrestlerId
      ||
      "";


    crResultsAddRow(
      crResultsReviewList,

      "Winner",

      winnerId
        ? crResultsGetWrestlerName(
            winnerId,
          )
        : "—",
    );


    crResultsAddRow(
      crResultsReviewList,

      "Runner-Up",

      runnerUpId
        ? crResultsGetWrestlerName(
            runnerUpId,
          )
        : "—",
    );


    crResultsAddRow(
      crResultsReviewList,

      "3rd Place",

      thirdId
        ? crResultsGetWrestlerName(
            thirdId,
          )
        : "—",
    );


    crResultsAddRow(
      crResultsReviewList,

      "4th Place",

      fourthId
        ? crResultsGetWrestlerName(
            fourthId,
          )
        : "—",
    );


    const eliminationLeaders =
      statistics
        ?.mostEliminations
        ?.wrestlerIds
      ||
      [];


    const eliminationCount =
      statistics
        ?.mostEliminations
        ?.count
      ??
      0;


    crResultsAddRow(
      crResultsReviewList,

      "Most Eliminations",

      eliminationLeaders.length > 0
        ? `${crResultsJoinWrestlerNames(
            eliminationLeaders,
          )} — ${eliminationCount}`
        : "—",
    );


    const ironLabel =
      crResultsSelectedMatch
        .specialty
        ?.division ===
        "Women"
        ? "Ironwoman"
        : "Ironman";


    const ironWrestlers =
      statistics
        ?.longestTime
        ?.wrestlerIds
      ||
      [];


    const ironTime =
      statistics
        ?.longestTime
        ?.timeInMatch
      ||
      "";


    crResultsAddRow(
      crResultsReviewList,

      ironLabel,

      ironWrestlers.length > 0
        ? `${crResultsJoinWrestlerNames(
            ironWrestlers,
          )} — ${ironTime}`
        : "—",
    );


    const shortestWrestlers =
      statistics
        ?.shortestTime
        ?.wrestlerIds
      ||
      [];


    const shortestTime =
      statistics
        ?.shortestTime
        ?.timeInMatch
      ||
      "";


    crResultsAddRow(
      crResultsReviewList,

      "Shortest Time",

      shortestWrestlers.length > 0
        ? `${crResultsJoinWrestlerNames(
            shortestWrestlers,
          )} — ${shortestTime}`
        : "—",
    );
  }


  crResultsAddRow(
    crResultsReviewList,

    "Match %",

    record.rating === null
      ? "—"
      : `${record.rating}%`,
  );


  crResultsAddRow(
    crResultsReviewList,

    "Star Rating",

    record.stars === null
      ? "—"
      : String(
          record.stars,
        ),
  );


  crResultsAddRow(
    crResultsReviewList,

    "Match Time",

    record.matchTime
    ||
    "—",
  );


  if (
    errors.length > 0
  ) {
    crResultsError.textContent =
      errors.join(" ");

    crResultsError.hidden =
      false;
  }


  crResultsSave.disabled =
    errors.length > 0;


  crResultsSetStatus(
    errors.length > 0
      ? "CHECK RESULT"
      : "READY TO SAVE",
  );
}


// =================================
// SELECTED MATCH LOAD
// =================================

function crResultsLoadSelectedMatch() {
  const matchId =
    crResultsMatch.value;


  crResultsSelectedMatch =
    null;


  crResultsHideMessage();

  crResultsHideMatchFields();


  if (
    !matchId
  ) {
    crResultsSetStatus(
      "SELECT MATCH",
    );

    return;
  }


  const match =
    owlControlRoomData
      .announcedMatches
      .find(
        (item) =>
          item.id === matchId,
      );


  if (
    !match
  ) {
    crResultsSetStatus(
      "MATCH NOT FOUND",
    );

    return;
  }


  crResultsSelectedMatch =
    match;


  crResultsMatchSummary.innerHTML =
    "";


  crResultsAddRow(
    crResultsMatchSummary,

    "Match",

    crResultsFormatMatch(
      match,
    ),
  );


  crResultsAddRow(
    crResultsMatchSummary,

    "Match Type",

    match.matchType
    ||
    "—",
  );


  crResultsAddRow(
    crResultsMatchSummary,

    "Specialty Match",

    match.stipulation
    ||
    "Standard Match",
  );


  crResultsAddRow(
    crResultsMatchSummary,

    "Championship",

    crResultsGetChampionshipName(
      match.championshipId,
    ),
  );


  crResultsPopulateWinnerControls(
    match,
  );


  crResultsResultType.value =
    "win";

  crResultsWinnerSide.value =
    "";

  crResultsFinishWinner.value =
    "";

  crResultsFinishLoser.value =
    "";

  crResultsMethod.value =
    "";

  crResultsRating.value =
    "";

  crResultsStars.value =
    "";

  crResultsTime.value =
    "";


  crResultsMatchPreview.hidden =
    false;

  crResultsBasicFields.hidden =
    false;

  crResultsPerformanceFields.hidden =
    false;

  crResultsReview.hidden =
    false;


  crResultsRenderSpecialtyFields(
    match,
  );


  crResultsRefreshResultTypeLayout();
}


// =================================
// COMPLETED MATCH RECORD
// =================================

function crResultsBuildCompletedMatchRecord() {
  if (
    !crResultsSelectedMatch
  ) {
    throw new Error(
      "Select a match before saving a result.",
    );
  }


  const form =
    crResultsGetFormRecord();


  const record = {
    ...structuredClone(
      crResultsSelectedMatch,
    ),

    status:
      "completed",

    resultType:
      form.resultType,

    winnerSide:
      form.resultType ===
        "win"
        ? form.winningSideIndex
        : null,

    rating:
      form.rating,

    starRating:
      form.stars,

    matchTime:
      form.matchTime,
  };


  if (
    form.resultType ===
      "win"
    &&
    crResultsSelectedMatch
      .stipulation !==
      "Overthrow Rumble"
  ) {
    record.finish = {
      winner:
        form.winningWrestlerId,

      loser:
        form.losingWrestlerId,

      method:
        form.finishMethod,
    };
  }

  else {
    delete record.finish;
  }


  if (
    form.specialtyResult
  ) {
    record.specialtyResult =
      form.specialtyResult;
  }

  else {
    delete record.specialtyResult;
  }


  return record;
}


// =================================
// FILE HELPERS
// =================================

async function crResultsEnsureWritePermission() {
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
    await owlRepositoryHandle
      .queryPermission(
        options,
      )
    ===
    "granted"
  ) {
    return true;
  }


  return (
    await owlRepositoryHandle
      .requestPermission(
        options,
      )
  )
  ===
  "granted";
}


async function crResultsReadDataFile(
  filename,
) {
  const dataDirectory =
    await owlRepositoryHandle
      .getDirectoryHandle(
        "data",
      );


  const fileHandle =
    await dataDirectory
      .getFileHandle(
        filename,
      );


  const file =
    await fileHandle
      .getFile();


  return {
    fileHandle:
      fileHandle,

    text:
      await file.text(),
  };
}


async function crResultsWriteFile(
  fileHandle,
  text,
) {
  const writable =
    await fileHandle
      .createWritable();


  await writable.write(
    text,
  );


  await writable.close();
}


function crResultsFormatObject(
  record,
) {
  return JSON.stringify(
    record,
    null,
    2,
  )
    .split("\n")
    .map(
      (line) =>
        `  ${line}`,
    )
    .join("\n");
}


function crResultsAppendRecordText(
  text,
  record,
) {
  let existingRecords;


  try {
    existingRecords =
      JSON.parse(
        text,
      );
  }

  catch {
    throw new Error(
      "matches.json is not valid JSON.",
    );
  }


  if (
    !Array.isArray(
      existingRecords,
    )
  ) {
    throw new Error(
      "matches.json must contain a JSON array.",
    );
  }


  if (
    existingRecords.some(
      (match) =>
        match.id === record.id,
    )
  ) {
    throw new Error(
      `A completed match with ID ${record.id} already exists.`,
    );
  }


  const closingIndex =
    text.lastIndexOf(
      "]",
    );


  if (
    closingIndex === -1
  ) {
    throw new Error(
      "Could not find the end of matches.json.",
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
    crResultsFormatObject(
      record,
    )
    +
    "\n"
    +
    after
  );
}


function crResultsFindObjectBounds(
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
      `Could not find announced match ${recordId}.`,
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
      text[index];


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
        depth === 0
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
      `Could not locate announced match ${recordId}.`,
    );
  }


  return {
    start:
      start,

    end:
      end,
  };
}


function crResultsRemoveRecordText(
  text,
  recordId,
) {
  const bounds =
    crResultsFindObjectBounds(
      text,
      recordId,
    );


  let removeStart =
    bounds.start;


  let removeEnd =
    bounds.end + 1;


  const lineStart =
    text.lastIndexOf(
      "\n",
      removeStart - 1,
    );


  if (
    lineStart !== -1
    &&
    text
      .slice(
        lineStart + 1,
        removeStart,
      )
      .trim() === ""
  ) {
    removeStart =
      lineStart + 1;
  }


  let cursor =
    removeEnd;


  while (
    cursor < text.length
    &&
    /[ \t\r\n]/.test(
      text[cursor],
    )
  ) {
    cursor +=
      1;
  }


  if (
    text[cursor] ===
    ","
  ) {
    removeEnd =
      cursor + 1;


    if (
      text[removeEnd] ===
      "\r"
    ) {
      removeEnd +=
        1;
    }


    if (
      text[removeEnd] ===
      "\n"
    ) {
      removeEnd +=
        1;
    }
  }

  else {
    cursor =
      removeStart - 1;


    while (
      cursor >= 0
      &&
      /[ \t\r\n]/.test(
        text[cursor],
      )
    ) {
      cursor -=
        1;
    }


    if (
      text[cursor] ===
      ","
    ) {
      removeStart =
        cursor;
    }
  }


  return (
    text.slice(
      0,
      removeStart,
    )
    +
    text.slice(
      removeEnd,
    )
  );
}


// =================================
// SAVE RESULT
// =================================

async function crResultsSaveResult() {
  crResultsSave.disabled =
    true;


  crResultsSetStatus(
    "SAVING...",
  );


  crResultsHideMessage();


  try {
    const permission =
      await crResultsEnsureWritePermission();


    if (
      !permission
    ) {
      throw new Error(
        "Write permission was not granted.",
      );
    }


    const form =
      crResultsGetFormRecord();


    const errors =
      crResultsValidate(
        form,
      );


    if (
      errors.length > 0
    ) {
      throw new Error(
        errors.join(" "),
      );
    }


    const completedRecord =
      crResultsBuildCompletedMatchRecord();


    const matchesFile =
      await crResultsReadDataFile(
        "matches.json",
      );


    const announcedFile =
      await crResultsReadDataFile(
        "announced-matches.json",
      );


    const updatedMatchesText =
      crResultsAppendRecordText(
        matchesFile.text,
        completedRecord,
      );


    const updatedAnnouncedText =
      crResultsRemoveRecordText(
        announcedFile.text,
        crResultsSelectedMatch.id,
      );


    await crResultsWriteFile(
      matchesFile.fileHandle,
      updatedMatchesText,
    );


    try {
      await crResultsWriteFile(
        announcedFile.fileHandle,
        updatedAnnouncedText,
      );
    }

    catch (
      error
    ) {
      await crResultsWriteFile(
        matchesFile.fileHandle,
        matchesFile.text,
      );

      throw error;
    }


    crResultsSelectedMatch =
      null;


    crResultsMatch.value =
      "";


    await loadRepositoryData(
      owlRepositoryHandle,
    );


    crResultsPopulateEvents();

    crResultsPopulateMatches();

    crResultsHideMatchFields();


    crResultsSetStatus(
      "SAVED",
    );


    crResultsShowMessage(
      "Match result was saved locally. Review matches.json and announced-matches.json in GitHub Desktop.",

      "save-success",
    );
  }

  catch (
    error
  ) {
    console.error(
      "Could not save match result:",
      error,
    );


    crResultsReviewResult();


    crResultsSetStatus(
      "SAVE FAILED",
    );


    crResultsShowMessage(
      error.message
      ||
      "The match result could not be saved.",

      "save-error",
    );
  }
}


// =================================
// EVENT HANDLERS
// =================================

function crResultsHandleEventChange() {
  crResultsSelectedMatch =
    null;


  crResultsHideMessage();


  crResultsPopulateMatches();


  crResultsHideMatchFields();


  crResultsSetStatus(
    crResultsEvent.value
      ? "SELECT MATCH"
      : "READY",
  );
}


function crResultsHandleMatchChange() {
  crResultsLoadSelectedMatch();
}


// =================================
// INPUT EVENTS
// =================================

crResultsEvent.addEventListener(
  "change",
  crResultsHandleEventChange,
);


crResultsMatch.addEventListener(
  "change",
  crResultsHandleMatchChange,
);


crResultsResultType.addEventListener(
  "change",
  crResultsRefreshResultTypeLayout,
);


[
  crResultsWinnerSide,
  crResultsFinishWinner,
  crResultsFinishLoser,
  crResultsMethod,
  crResultsRating,
  crResultsStars,
  crResultsTime,
].forEach(
  (field) => {
    field.addEventListener(
      "input",
      crResultsReviewResult,
    );

    field.addEventListener(
      "change",
      crResultsReviewResult,
    );
  },
);


crResultsSave.addEventListener(
  "click",
  crResultsSaveResult,
);


window.addEventListener(
  "owl-control-room-data-loaded",
  () => {
    crResultsPopulateEvents();

    crResultsPopulateMatches();
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
      owlControlRoomData.events,
    )
    &&
    Array.isArray(
      owlControlRoomData.announcedMatches,
    )
    &&
    Array.isArray(
      owlControlRoomData.wrestlers,
    )
    &&
    Array.isArray(
      owlControlRoomData.championships,
    )
  ) {
    crResultsPopulateEvents();

    crResultsPopulateMatches();
  }
}

catch (
  error
) {
  console.warn(
    "Results Wizard waiting for repository data.",
    error,
  );
}
