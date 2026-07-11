// =================================
// OWL CONTROL ROOM
// LANDSCAPE CHAMPIONSHIP DESK
// =================================

(() => {
  "use strict";


  // =================================
  // ELEMENTS
  // =================================

  const els = {
    company:
      document.getElementById(
        "cr-landscape-champion-company"
      ),

    addTitle:
      document.getElementById(
        "cr-landscape-add-title-slot"
      ),

    titleSlots:
      document.getElementById(
        "cr-landscape-title-slots"
      ),

    history:
      document.getElementById(
        "cr-landscape-champion-history"
      ),

    status:
      document.getElementById(
        "cr-landscape-champion-status"
      ),

    save:
      document.getElementById(
        "cr-landscape-save-champions"
      )
  };


  // =================================
  // STATE
  // =================================

  const state = {
    companies: [],
    events: [],
    titles: [],
    changes: []
  };


  let initialized =
    false;


  // =================================
  // BASIC HELPERS
  // =================================

  function setStatus(
    text
  ) {

    if (
      els.status
    ) {

      els.status.textContent =
        text;

    }

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


  function createSlug(
    value
  ) {

    return String(
      value || ""
    )

      .normalize(
        "NFD"
      )

      .replace(
        /[\u0300-\u036f]/g,
        ""
      )

      .toLowerCase()

      .replace(
        /[^a-z0-9]+/g,
        "-"
      )

      .replace(
        /^-+|-+$/g,
        ""
      );

  }


  function selectedCompanyId() {

    return (
      els.company?.value ||
      ""
    );

  }


  function companyForId(
    companyId
  ) {

    return (
      state.companies.find(
        company =>
          company.id === companyId
      )

      ||

      null
    );

  }


  function eventForId(
    eventId
  ) {

    return (
      state.events.find(
        event =>
          event.id === eventId
      )

      ||

      null
    );

  }


  function eventName(
    event
  ) {

    if (!event) {

      return "";

    }


    return (

      event.eventName

      ||

      event.showId

      ||

      event.id

      ||

      "Untitled Event"

    );

  }


  // =================================
  // LANDSCAPE DIRECTORY
  // =================================

  async function landscapeDirectoryHandle() {

    if (
      typeof owlRepositoryHandle ===
        "undefined"

      ||

      !owlRepositoryHandle
    ) {

      throw new Error(
        "OWL repository is not connected."
      );

    }


    const dataDirectory =
      await owlRepositoryHandle
        .getDirectoryHandle(
          "data"
        );


    return dataDirectory
      .getDirectoryHandle(
        "landscape"
      );

  }


  // =================================
  // READ JSON
  // =================================

  async function readJson(
    fileName
  ) {

    const directory =
      await landscapeDirectoryHandle();


    const fileHandle =
      await directory.getFileHandle(
        fileName
      );


    const file =
      await fileHandle.getFile();


    return JSON.parse(
      await file.text()
    );

  }


  // =================================
  // WRITE JSON
  // =================================

  async function writeJson(
    fileName,
    data
  ) {

    const directory =
      await landscapeDirectoryHandle();


    const fileHandle =
      await directory.getFileHandle(
        fileName
      );


    const writable =
      await fileHandle.createWritable();


    await writable.write(

      `${
        JSON.stringify(
          data,
          null,
          2
        )
      }\n`

    );


    await writable.close();

  }


  // =================================
  // WRITE PERMISSION
  // =================================

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
      mode: "readwrite"
    };


    if (
      typeof owlRepositoryHandle
        .queryPermission !== "function"
    ) {

      return true;

    }


    if (
      await owlRepositoryHandle
        .queryPermission(
          options
        )

      === "granted"
    ) {

      return true;

    }


    if (
      typeof owlRepositoryHandle
        .requestPermission !== "function"
    ) {

      return false;

    }


    return (

      await owlRepositoryHandle
        .requestPermission(
          options
        )

      === "granted"

    );

  }


  // =================================
  // COMPANY SELECT
  // =================================

  function buildCompanyOptions() {

    if (
      !els.company
    ) {

      return;

    }


    const previousValue =
      els.company.value;


    const companies =
      [...state.companies]

        .filter(
          company =>
            company.id !== "owl"
        )

        .sort(
          (a, b) =>

            String(
              a.name || ""
            )

              .localeCompare(

                String(
                  b.name || ""
                )

              )

        );


    els.company.innerHTML =
      companies

        .map(
          company => `

            <option
              value="${escapeHtml(company.id)}"
            >
              ${escapeHtml(company.name)}
            </option>

          `
        )

        .join("");


    if (
      previousValue

      &&

      companies.some(
        company =>
          company.id === previousValue
      )
    ) {

      els.company.value =
        previousValue;

    }

  }


  // =================================
  // COMPANY EVENTS
  // =================================

  function companyEvents(
    companyId
  ) {

    return [...state.events]

      .filter(
        event =>
          event.companyId ===
            companyId
      )

      .sort(
        (a, b) => {

          const periodDifference =

            String(
              b.periodId || ""
            )

              .localeCompare(

                String(
                  a.periodId || ""
                )

              );


          if (
            periodDifference !== 0
          ) {

            return periodDifference;

          }


          return (

            String(
              b.recordedAt || ""
            )

              .localeCompare(

                String(
                  a.recordedAt || ""
                )

              )

          );

        }
      );

  }


  // =================================
  // EVENT OPTIONS
  // =================================

  function buildEventOptions(
    companyId,
    selectedEventId = ""
  ) {

    const events =
      companyEvents(
        companyId
      );


    const emptyOption = `

      <option value="">
        Not Recorded / Unknown
      </option>

    `;


    return (

      emptyOption

      +

      events

        .map(
          event => `

            <option
              value="${escapeHtml(event.id)}"
              ${
                event.id === selectedEventId
                  ? "selected"
                  : ""
              }
            >
              ${escapeHtml(event.periodId || "—")}
              —
              ${escapeHtml(eventName(event))}
            </option>

          `
        )

        .join("")

    );

  }


  // =================================
  // TITLE STATUS MODE
  // =================================

  function refreshCardStatus(
    card
  ) {

    const status =
      card.querySelector(
        ".cr-landscape-title-status"
      );


    const champion =
      card.querySelector(
        ".cr-landscape-title-champion"
      );


    if (
      !status ||
      !champion
    ) {

      return;

    }


    const vacant =
      status.value === "vacant";


    if (
      vacant
    ) {

      champion.value =
        "";

    }


    champion.disabled =
      vacant;

  }


  // =================================
  // TITLE SLOT CARD
  // =================================

  function createTitleCard(
    record = {}
  ) {

    const companyId =
      selectedCompanyId();


    const card =
      document.createElement(
        "article"
      );


    card.className =
      "cr-landscape-content-item cr-landscape-title-slot";


    card.dataset.titleId =
      record.id || "";


    const titleName =
      record.name || "";


    const championName =
      record.championName || "";


    const status =
      record.status === "vacant"
        ? "vacant"
        : "active";


    const wonEventId =
      record.wonEventId || "";


    const wonDate =
      record.wonDate || "";


    card.innerHTML = `

      <div class="cr-landscape-content-item-heading">

        <div>

          <span>
            TITLE SLOT
          </span>

          <strong class="cr-landscape-title-heading">
            ${
              escapeHtml(titleName)
              ||
              "New Championship"
            }
          </strong>

        </div>


        <button
          type="button"
          class="cr-landscape-remove-title"
        >
          Remove
        </button>

      </div>


      <div class="cr-editor-form-grid">


        <div class="cr-form-group">

          <label>
            TITLE NAME
          </label>

          <input
            type="text"
            class="cr-landscape-title-name"
            autocomplete="off"
            value="${escapeHtml(titleName)}"
            placeholder="World Championship"
          >

        </div>


        <div class="cr-form-group">

          <label>
            STATUS
          </label>

          <select
            class="cr-landscape-title-status"
          >

            <option
              value="active"
              ${
                status === "active"
                  ? "selected"
                  : ""
              }
            >
              Active Champion
            </option>

            <option
              value="vacant"
              ${
                status === "vacant"
                  ? "selected"
                  : ""
              }
            >
              Vacant
            </option>

          </select>

        </div>


        <div class="cr-form-group">

          <label>
            CURRENT CHAMPION
          </label>

          <input
            type="text"
            class="cr-landscape-title-champion"
            autocomplete="off"
            value="${escapeHtml(championName)}"
            placeholder="Champion Name"
          >

        </div>


        <div class="cr-form-group">

          <label>
            WON / CHANGE EVENT
          </label>

          <select
            class="cr-landscape-title-event"
          >

            ${
              buildEventOptions(
                companyId,
                wonEventId
              )
            }

          </select>

        </div>


        <div class="cr-form-group">

          <label>
            WON / CHANGE DATE
          </label>

          <input
            type="date"
            class="cr-landscape-title-date"
            value="${escapeHtml(wonDate)}"
          >

        </div>


      </div>

    `;


    const nameInput =
      card.querySelector(
        ".cr-landscape-title-name"
      );


    const heading =
      card.querySelector(
        ".cr-landscape-title-heading"
      );


    const statusSelect =
      card.querySelector(
        ".cr-landscape-title-status"
      );


    const removeButton =
      card.querySelector(
        ".cr-landscape-remove-title"
      );


    nameInput?.addEventListener(

      "input",

      () => {

        if (
          heading
        ) {

          heading.textContent =

            nameInput.value.trim()

            ||

            "New Championship";

        }


        setStatus(
          "CHANGES READY"
        );

      }

    );


    statusSelect?.addEventListener(

      "change",

      () => {

        refreshCardStatus(
          card
        );


        setStatus(
          "CHANGES READY"
        );

      }

    );


    card

      .querySelectorAll(
        "input, select"
      )

      .forEach(
        field => {

          field.addEventListener(

            "change",

            () => {

              setStatus(
                "CHANGES READY"
              );

            }

          );

        }
      );


    removeButton?.addEventListener(

      "click",

      () => {

        card.remove();


        renderEmptyState();


        setStatus(
          "CHANGES READY"
        );

      }

    );


    refreshCardStatus(
      card
    );


    return card;

  }


  // =================================
  // EMPTY STATE
  // =================================

  function renderEmptyState() {

    if (
      !els.titleSlots
    ) {

      return;

    }


    const titleCards =

      els.titleSlots.querySelectorAll(
        ".cr-landscape-title-slot"
      );


    const existingEmpty =

      els.titleSlots.querySelector(
        ".cr-landscape-title-empty-message"
      );


    existingEmpty?.remove();


    if (
      titleCards.length === 0
    ) {

      els.titleSlots.insertAdjacentHTML(

        "beforeend",

        `

          <p
            class="
              cr-landscape-entry-empty
              cr-landscape-title-empty-message
            "
          >
            No title slots have been created
            for this company yet.
          </p>

        `

      );

    }

  }


  // =================================
  // RENDER TITLE SLOTS
  // =================================

  function renderTitleSlots() {

    if (
      !els.titleSlots
    ) {

      return;

    }


    const companyId =
      selectedCompanyId();


    const companyTitles =
      [...state.titles]

        .filter(
          title =>
            title.companyId ===
              companyId
        )

        .sort(
          (a, b) =>

            String(
              a.name || ""
            )

              .localeCompare(

                String(
                  b.name || ""
                )

              )

        );


    els.titleSlots.innerHTML =
      "";


    companyTitles.forEach(
      title => {

        els.titleSlots.appendChild(

          createTitleCard(
            title
          )

        );

      }
    );


    renderEmptyState();

  }


  // =================================
  // ADD TITLE SLOT
  // =================================

  function addTitleSlot() {

    if (
      !els.titleSlots
    ) {

      return;

    }


    if (
      !selectedCompanyId()
    ) {

      setStatus(
        "SELECT COMPANY"
      );


      return;

    }


    els.titleSlots

      .querySelector(
        ".cr-landscape-title-empty-message"
      )

      ?.remove();


    els.titleSlots.appendChild(

      createTitleCard()

    );


    setStatus(
      "CHANGES READY"
    );

  }


  // =================================
  // HISTORY LABEL
  // =================================

  function changeTypeLabel(
    changeType
  ) {

    const labels = {

      "initial-champion":
        "INITIAL CHAMPION",

      "title-change":
        "TITLE CHANGE",

      "new-champion":
        "NEW CHAMPION",

      "vacated":
        "TITLE VACATED",

      "title-retired":
        "TITLE RETIRED"

    };


    return (

      labels[
        changeType
      ]

      ||

      "CHAMPIONSHIP UPDATE"

    );

  }


  // =================================
  // RENDER HISTORY
  // =================================

  function renderHistory() {

    if (
      !els.history
    ) {

      return;

    }


    const companyId =
      selectedCompanyId();


    const changes =
      [...state.changes]

        .filter(
          change =>
            change.companyId ===
              companyId
        )

        .sort(
          (a, b) =>

            String(
              b.recordedAt || ""
            )

              .localeCompare(

                String(
                  a.recordedAt || ""
                )

              )

        )

        .slice(
          0,
          12
        );


    if (
      changes.length === 0
    ) {

      els.history.innerHTML = `

        <p class="cr-landscape-entry-empty">
          No championship history recorded yet.
        </p>

      `;


      return;

    }


    els.history.innerHTML =
      changes

        .map(
          change => {

            const previousChampion =

              change.previousChampionName

              ||

              "VACANT";


            const newChampion =

              change.newChampionName

              ||

              (
                change.changeType ===
                  "title-retired"

                  ? "RETIRED"

                  : "VACANT"
              );


            const eventText =

              change.eventName

              ||

              change.periodId

              ||

              "Event not recorded";


            return `

              <article
                class="cr-landscape-event-result-row"
              >

                <div>

                  <span>
                    ${
                      escapeHtml(
                        changeTypeLabel(
                          change.changeType
                        )
                      )
                    }
                  </span>

                  <strong>
                    ${escapeHtml(change.titleName)}
                  </strong>

                  <small>
                    ${
                      escapeHtml(
                        previousChampion
                      )
                    }
                    →
                    ${
                      escapeHtml(
                        newChampion
                      )
                    }
                  </small>

                  <small>
                    ${escapeHtml(eventText)}
                  </small>

                </div>

              </article>

            `;

          }
        )

        .join("");

  }


  // =================================
  // RENDER DESK
  // =================================

  function renderDesk() {

    renderTitleSlots();

    renderHistory();

  }


  // =================================
  // BUILD TITLE ID
  // =================================

  function buildTitleId(
    companyId,
    titleName
  ) {

    return [

      createSlug(
        companyId
      ),

      createSlug(
        titleName
      )

    ]

      .filter(
        Boolean
      )

      .join("-");

  }


  // =================================
  // COLLECT TITLE SLOTS
  // =================================

  function collectCompanyTitles() {

    const companyId =
      selectedCompanyId();


    if (
      !companyId
    ) {

      throw new Error(
        "Select a company."
      );

    }


    const cards =

      [
        ...(
          els.titleSlots
            ?.querySelectorAll(
              ".cr-landscape-title-slot"
            )

          ||

          []
        )
      ];


    const titles =
      cards.map(
        card => {

          const name =

            card.querySelector(
              ".cr-landscape-title-name"
            )

              ?.value
              .trim()

            ||

            "";


          const status =

            card.querySelector(
              ".cr-landscape-title-status"
            )

              ?.value

            ||

            "active";


          const championName =

            status === "vacant"

              ? ""

              : (

                card.querySelector(
                  ".cr-landscape-title-champion"
                )

                  ?.value
                  .trim()

                ||

                ""

              );


          const selectedEventId =

            card.querySelector(
              ".cr-landscape-title-event"
            )

              ?.value

            ||

            "";


          const selectedEvent =
            eventForId(
              selectedEventId
            );


          const wonDate =

            card.querySelector(
              ".cr-landscape-title-date"
            )

              ?.value

            ||

            "";


          if (
            !name
          ) {

            throw new Error(
              "Every title slot needs a title name."
            );

          }


          if (
            status === "active"

            &&

            !championName
          ) {

            throw new Error(
              `${name} needs a current champion or must be marked vacant.`
            );

          }


          const existingId =
            card.dataset.titleId || "";


          const id =

            existingId

            ||

            buildTitleId(
              companyId,
              name
            );


          return {
            id,
            companyId,
            name,
            championName,
            status,

            wonPeriodId:
              selectedEvent?.periodId || "",

            wonEventId:
              selectedEvent?.id || "",

            wonEventName:
              selectedEvent
                ? eventName(selectedEvent)
                : "",

            wonDate
          };

        }
      );


    const normalizedNames =
      titles.map(
        title =>
          title.name
            .trim()
            .toLowerCase()
      );


    if (
      new Set(
        normalizedNames
      ).size !==
        normalizedNames.length
    ) {

      throw new Error(
        "A company cannot have two title slots with the same name."
      );

    }


    const titleIds =
      titles.map(
        title =>
          title.id
      );


    if (
      new Set(
        titleIds
      ).size !==
        titleIds.length
    ) {

      throw new Error(
        "Two title slots generated the same database ID."
      );

    }


    return titles;

  }


  // =================================
  // BUILD HISTORY CHANGE
  // =================================

  function buildHistoryChange(
    before,
    after,
    index
  ) {

    if (
      !after
    ) {

      return null;

    }


    const previousChampion =
      before?.championName || "";


    const newChampion =
      after.championName || "";


    const previousStatus =
      before?.status || "";


    const newStatus =
      after.status || "";


    let changeType =
      "";


    if (
      !before
    ) {

      if (
        newStatus === "active"
      ) {

        changeType =
          "initial-champion";

      }

    }


    else if (
      previousStatus === "active"

      &&

      newStatus === "vacant"
    ) {

      changeType =
        "vacated";

    }


    else if (
      previousStatus === "vacant"

      &&

      newStatus === "active"
    ) {

      changeType =
        "new-champion";

    }


    else if (
      previousChampion !==
        newChampion

      &&

      newStatus === "active"
    ) {

      changeType =
        "title-change";

    }


    if (
      !changeType
    ) {

      return null;

    }


    const recordedAt =
      new Date().toISOString();


    return {
      id:
        `change-${Date.now()}-${index + 1}`,

      titleId:
        after.id,

      companyId:
        after.companyId,

      titleName:
        after.name,

      previousChampionName:
        previousChampion,

      newChampionName:
        newChampion,

      changeType,

      periodId:
        after.wonPeriodId || "",

      eventId:
        after.wonEventId || "",

      eventName:
        after.wonEventName || "",

      wonDate:
        after.wonDate || "",

      recordedAt
    };

  }


  // =================================
  // BUILD RETIREMENT HISTORY
  // =================================

  function buildRetirementChange(
    title,
    index
  ) {

    return {
      id:
        `change-${Date.now()}-retired-${index + 1}`,

      titleId:
        title.id,

      companyId:
        title.companyId,

      titleName:
        title.name,

      previousChampionName:
        title.championName || "",

      newChampionName:
        "",

      changeType:
        "title-retired",

      periodId:
        "",

      eventId:
        "",

      eventName:
        "",

      wonDate:
        "",

      recordedAt:
        new Date().toISOString()
    };

  }


  // =================================
  // SAVE CHAMPIONSHIPS
  // =================================

  async function saveChampionships() {

    setStatus(
      "VALIDATING"
    );


    try {

      const permission =
        await ensureWritePermission();


      if (
        !permission
      ) {

        throw new Error(
          "Write permission was not granted."
        );

      }


      const companyId =
        selectedCompanyId();


      if (
        !companyId
      ) {

        throw new Error(
          "Select a company."
        );

      }


      const nextCompanyTitles =
        collectCompanyTitles();


      setStatus(
        "SAVING"
      );


      const [
        championshipsData,
        historyData
      ] =
        await Promise.all([

          readJson(
            "championships.json"
          ),

          readJson(
            "championship-history.json"
          )

        ]);


      championshipsData.titles =
        Array.isArray(
          championshipsData.titles
        )

          ? championshipsData.titles

          : [];


      historyData.changes =
        Array.isArray(
          historyData.changes
        )

          ? historyData.changes

          : [];


      const originalChampionships =
        structuredClone(
          championshipsData
        );


      const existingCompanyTitles =
        championshipsData.titles

          .filter(
            title =>
              title.companyId ===
                companyId
          );


      const otherCompanyTitles =
        championshipsData.titles

          .filter(
            title =>
              title.companyId !==
                companyId
          );


      const otherIds =
        new Set(

          otherCompanyTitles.map(
            title =>
              title.id
          )

        );


      const conflictingTitle =
        nextCompanyTitles.find(
          title =>
            otherIds.has(
              title.id
            )
        );


      if (
        conflictingTitle
      ) {

        throw new Error(
          `The title ID ${conflictingTitle.id} already belongs to another company.`
        );

      }


      const newHistoryEntries =
        [];


      nextCompanyTitles.forEach(
        (
          title,
          index
        ) => {

          const previousTitle =
            existingCompanyTitles.find(
              existing =>
                existing.id ===
                  title.id
            )

            ||

            null;


          const historyChange =
            buildHistoryChange(

              previousTitle,

              title,

              index

            );


          if (
            historyChange
          ) {

            newHistoryEntries.push(
              historyChange
            );

          }

        }
      );


      const nextTitleIds =
        new Set(

          nextCompanyTitles.map(
            title =>
              title.id
          )

        );


      existingCompanyTitles

        .filter(
          title =>
            !nextTitleIds.has(
              title.id
            )
        )

        .forEach(
          (
            title,
            index
          ) => {

            newHistoryEntries.push(

              buildRetirementChange(
                title,
                index
              )

            );

          }
        );


      championshipsData.titles =

        [
          ...otherCompanyTitles,
          ...nextCompanyTitles
        ]

          .sort(
            (a, b) => {

              const companyDifference =

                String(
                  a.companyId || ""
                )

                  .localeCompare(

                    String(
                      b.companyId || ""
                    )

                  );


              if (
                companyDifference !== 0
              ) {

                return companyDifference;

              }


              return (

                String(
                  a.name || ""
                )

                  .localeCompare(

                    String(
                      b.name || ""
                    )

                  )

              );

            }
          );


      historyData.changes.push(
        ...newHistoryEntries
      );


      let championshipsWritten =
        false;


      try {

        await writeJson(

          "championships.json",

          championshipsData

        );


        championshipsWritten =
          true;


        await writeJson(

          "championship-history.json",

          historyData

        );

      }


      catch (
        writeError
      ) {

        if (
          championshipsWritten
        ) {

          try {

            await writeJson(

              "championships.json",

              originalChampionships

            );

          }


          catch (
            rollbackError
          ) {

            console.error(

              "Landscape championship rollback failed:",

              rollbackError

            );

          }

        }


        throw writeError;

      }


      await loadAll();


      setStatus(
        "SAVED"
      );

    }


    catch (
      error
    ) {

      console.error(

        "Landscape championship save failed:",

        error

      );


      setStatus(

        error.message

        ||

        "SAVE FAILED"

      );

    }

  }


  // =================================
  // LOAD ALL CHAMPIONSHIP DATA
  // =================================

  async function loadAll() {

    if (
      typeof owlRepositoryHandle ===
        "undefined"

      ||

      !owlRepositoryHandle
    ) {

      return;

    }


    try {

      setStatus(
        "LOADING"
      );


      const [
        companiesData,
        eventsData,
        championshipsData,
        historyData
      ] =
        await Promise.all([

          readJson(
            "companies.json"
          ),

          readJson(
            "events.json"
          ),

          readJson(
            "championships.json"
          ),

          readJson(
            "championship-history.json"
          )

        ]);


      state.companies =
        Array.isArray(
          companiesData.companies
        )

          ? companiesData.companies

          : [];


      state.events =
        Array.isArray(
          eventsData.events
        )

          ? eventsData.events

          : [];


      state.titles =
        Array.isArray(
          championshipsData.titles
        )

          ? championshipsData.titles

          : [];


      state.changes =
        Array.isArray(
          historyData.changes
        )

          ? historyData.changes

          : [];


      buildCompanyOptions();


      renderDesk();


      setStatus(
        "READY"
      );

    }


    catch (
      error
    ) {

      console.error(

        "Landscape Championship Desk load failed:",

        error

      );


      setStatus(
        "LOAD FAILED"
      );


      if (
        els.titleSlots
      ) {

        els.titleSlots.innerHTML = `

          <p class="cr-landscape-entry-empty">
            ${
              escapeHtml(
                error.message ||
                "Championship data could not load."
              )
            }
          </p>

        `;

      }

    }

  }


  // =================================
  // EVENTS
  // =================================

  function bindEvents() {

    if (
      initialized
    ) {

      return;

    }


    initialized =
      true;


    els.company?.addEventListener(

      "change",

      () => {

        renderDesk();


        setStatus(
          "READY"
        );

      }

    );


    els.addTitle?.addEventListener(

      "click",

      addTitleSlot

    );


    els.save?.addEventListener(

      "click",

      saveChampionships

    );

  }


  // =================================
  // PUBLIC HOOK
  // =================================

  window.crLandscapeChampionLoad =
    loadAll;


  // =================================
  // STARTUP
  // =================================

  bindEvents();


  window.addEventListener(

    "owl-control-room-data-loaded",

    loadAll

  );


  try {

    if (
      typeof owlRepositoryHandle !==
        "undefined"

      &&

      owlRepositoryHandle
    ) {

      loadAll();

    }

  }


  catch (
    error
  ) {

    console.warn(

      "Landscape Championship Desk waiting for repository connection.",

      error

    );

  }

})();
