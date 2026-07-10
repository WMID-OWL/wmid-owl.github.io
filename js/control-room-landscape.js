// =================================
// OWL CONTROL ROOM
// THE LANDSCAPE — CONSOLIDATED SYSTEM
// =================================

(() => {
  "use strict";

  const els = {
    status: document.getElementById("cr-landscape-status"),
    companyCount: document.getElementById("cr-landscape-company-count"),
    showCount: document.getElementById("cr-landscape-show-count"),
    eventCount: document.getElementById("cr-landscape-event-count"),
    latestPeriod: document.getElementById("cr-landscape-latest-period"),

    entryYear: document.getElementById("cr-landscape-entry-year"),
    entryMonth: document.getElementById("cr-landscape-entry-month"),
    entryStage: document.getElementById("cr-landscape-entry-stage"),
    entryCompany: document.getElementById("cr-landscape-entry-company"),
    entryShowWrap: document.getElementById("cr-landscape-entry-show-wrap"),
    entryShow: document.getElementById("cr-landscape-entry-show"),
    entryEventNameWrap: document.getElementById("cr-landscape-entry-event-name-wrap"),
    entryEventName: document.getElementById("cr-landscape-entry-event-name"),
    entryBookingStyle: document.getElementById("cr-landscape-entry-booking-style"),
    entryRating: document.getElementById("cr-landscape-entry-rating"),
    entryNotes: document.getElementById("cr-landscape-entry-notes"),
    entryLocation: document.getElementById("cr-landscape-entry-location"),
    entryLocationDetail: document.getElementById("cr-landscape-entry-location-detail"),
    generateLocation: document.getElementById("cr-landscape-generate-location"),
    addMatch: document.getElementById("cr-landscape-add-match"),
    addSegment: document.getElementById("cr-landscape-add-segment"),
    entryItems: document.getElementById("cr-landscape-entry-items"),
    entryEmpty: document.getElementById("cr-landscape-entry-empty"),
    entryStatus: document.getElementById("cr-landscape-entry-status"),
    saveEvent: document.getElementById("cr-landscape-save-event"),

    rankingPeriod: document.getElementById("cr-landscape-ranking-period"),
    rankingMode: document.getElementById("cr-landscape-ranking-mode"),
    refreshRankings: document.getElementById("cr-landscape-refresh-rankings"),
    freezeRankings: document.getElementById("cr-landscape-freeze-rankings"),
    rankingStatus: document.getElementById("cr-landscape-ranking-status"),
    companyRankings: document.getElementById("cr-landscape-company-rankings"),
    showRankings: document.getElementById("cr-landscape-show-rankings"),

    recordedEvents: document.getElementById("cr-landscape-recorded-events"),
    weeklySchedule: document.getElementById("cr-landscape-weekly-schedule"),
    monthlyCycle: document.getElementById("cr-landscape-monthly-cycle"),
    archiveSummary: document.getElementById("cr-landscape-archive-summary")
  };

  const state = {
    companies: [],
    shows: [],
    events: [],
    calendar: null,
    archive: null,
    rankings: null,
    locationRules: null
  };

  let generatedLocation = null;
  let itemCounter = 0;
  let initialized = false;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function setLandscapeStatus(value) {
    setText(els.status, value);
  }

  function setEntryStatus(value) {
    setText(els.entryStatus, value);
  }

  function setRankingStatus(value) {
    setText(els.rankingStatus, value);
  }

  async function landscapeDirectoryHandle() {
    if (typeof owlRepositoryHandle === "undefined" || !owlRepositoryHandle) {
      throw new Error("OWL repository is not connected.");
    }

    const dataDirectory = await owlRepositoryHandle.getDirectoryHandle("data");
    return dataDirectory.getDirectoryHandle("landscape");
  }

  async function readJson(fileName) {
    const directory = await landscapeDirectoryHandle();
    const handle = await directory.getFileHandle(fileName);
    const file = await handle.getFile();
    return JSON.parse(await file.text());
  }

  async function writeJson(fileName, data) {
    const directory = await landscapeDirectoryHandle();
    const handle = await directory.getFileHandle(fileName);
    const writable = await handle.createWritable();

    await writable.write(
      `${JSON.stringify(data, null, 2)}\n`
    );

    await writable.close();
  }

  function periodLabel(periodId) {
    const match = String(periodId || "").match(/^(\d{4})-(\d{2})$/);

    if (!match) {
      return periodId || "—";
    }

    const [, year, monthId] = match;

    const month = state.calendar?.months?.find(
      (item) => item.id === monthId
    );

    return month
      ? `${month.name} ${year}`
      : periodId;
  }

  function stageLabel(stageId) {
    const stages = [
      ...(state.calendar?.weeklyStages || []),
      state.calendar?.monthlyFinale
    ].filter(Boolean);

    return (
      stages.find(
        (stage) => stage.id === stageId
      )?.label ||
      stageId ||
      ""
    );
  }

  function showForId(showId) {
    return (
      state.shows.find(
        (show) => show.id === showId
      ) || null
    );
  }

  function companyForId(companyId) {
    return (
      state.companies.find(
        (company) => company.id === companyId
      ) || null
    );
  }

  function eventTypeForStage(stageId) {
    return stageId === "showdown-saturday"
      ? "major-event"
      : "weekly";
  }

  function eventSortValue(event) {
    const show = showForId(event.showId);

    const stageMap = {
      "week-1": 1,
      "week-2": 2,
      "week-3": 3,
      "week-4": 4,
      "showdown-saturday": 5
    };

    return [
      String(event.periodId || ""),
      String(stageMap[event.stage] || 99).padStart(2, "0"),
      String(show?.dayOrder || 99).padStart(2, "0"),
      String(show?.showOrder || 99).padStart(2, "0"),
      String(event.id || "")
    ].join("|");
  }

  function locationKey(location) {
    return [
      location?.city || "",
      location?.region || "",
      location?.country || ""
    ]
      .join("|")
      .toLowerCase();
  }

  function formatLocation(location) {
    if (!location) {
      return "Not generated";
    }

    return [
      location.city,
      location.region,
      location.country
    ]
      .filter(Boolean)
      .join(", ");
  }

  function randomItem(items) {
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return null;
    }

    return items[
      Math.floor(
        Math.random() * items.length
      )
    ];
  }

  // =================================
  // LOAD ALL DATA
  // =================================

  async function loadAll() {
    if (
      typeof owlRepositoryHandle === "undefined" ||
      !owlRepositoryHandle
    ) {
      return;
    }

    try {
      setLandscapeStatus("LOADING");

      const [
        companiesData,
        showsData,
        eventsData,
        calendarData,
        archiveData,
        rankingsData,
        locationData
      ] = await Promise.all([
        readJson("companies.json"),
        readJson("shows.json"),
        readJson("events.json"),
        readJson("calendar-config.json"),
        readJson("archive-index.json"),
        readJson("rankings.json"),
        readJson("location-pools.json")
      ]);

      state.companies = Array.isArray(
        companiesData.companies
      )
        ? companiesData.companies
        : [];

      state.shows = Array.isArray(
        showsData.shows
      )
        ? showsData.shows
        : [];

      state.events = Array.isArray(
        eventsData.events
      )
        ? eventsData.events
        : [];

      state.calendar =
        calendarData || null;

      state.archive =
        archiveData || {
          version: 1,
          latestPeriodId: "",
          periods: []
        };

      state.rankings =
        rankingsData || {
          version: 1,
          scoreVersion: 1,
          latestPeriodId: "",
          periods: []
        };

      state.locationRules =
        locationData || null;

      buildRecorderSelects();
      renderAll();
      buildRankingPeriods();
      refreshRankingPreview();

      setLandscapeStatus("READY");

      if (
        els.entryStatus &&
        els.entryStatus.textContent === "LOADING"
      ) {
        setEntryStatus("READY");
      }
    } catch (error) {
      console.error(
        "Landscape system load failed:",
        error
      );

      setLandscapeStatus("LOAD FAILED");
      setEntryStatus("LOAD FAILED");
      setRankingStatus("LOAD FAILED");

      if (els.archiveSummary) {
        els.archiveSummary.innerHTML = `
          <div class="cr-landscape-archive-empty">
            <strong>LANDSCAPE DATA COULD NOT LOAD</strong>
            <p>${escapeHtml(
              error.message ||
              "Unknown Landscape data error."
            )}</p>
          </div>
        `;
      }
    }
  }  // =================================
  // COMMAND CENTER
  // =================================

  function renderSummary() {
    setText(
      els.companyCount,
      String(state.companies.length)
    );

    setText(
      els.showCount,
      String(state.shows.length)
    );

    setText(
      els.eventCount,
      String(state.events.length)
    );

    const latestPeriodId =
      state.archive?.latestPeriodId ||
      state.events
        .map((event) => event.periodId)
        .filter(Boolean)
        .sort()
        .at(-1) ||
      "";

    setText(
      els.latestPeriod,
      periodLabel(latestPeriodId)
    );
  }

  function renderSchedule() {
    if (!els.weeklySchedule) {
      return;
    }

    const shows = [...state.shows].sort(
      (a, b) => {
        const dayDifference =
          Number(a.dayOrder || 0) -
          Number(b.dayOrder || 0);

        if (dayDifference !== 0) {
          return dayDifference;
        }

        return (
          Number(a.showOrder || 0) -
          Number(b.showOrder || 0)
        );
      }
    );

    const groups = new Map();

    shows.forEach((show) => {
      const day =
        show.day || "Unscheduled";

      if (!groups.has(day)) {
        groups.set(day, []);
      }

      groups
        .get(day)
        .push(show);
    });

    els.weeklySchedule.innerHTML = [
      ...groups.entries()
    ]
      .map(
        ([day, dayShows]) => `
          <article class="cr-landscape-day-card">

            <span class="cr-landscape-day-name">
              ${escapeHtml(day)}
            </span>

            <div class="cr-landscape-show-list">
              ${dayShows
                .map(
                  (show) => `
                    <strong>
                      ${escapeHtml(show.name)}
                    </strong>
                  `
                )
                .join("")}
            </div>

          </article>
        `
      )
      .join("");
  }

  function renderCycle() {
    if (!els.monthlyCycle) {
      return;
    }

    const weeklyStages = [
      ...(state.calendar?.weeklyStages || [])
    ].sort(
      (a, b) =>
        Number(a.order || 0) -
        Number(b.order || 0)
    );

    const weeklyHtml = weeklyStages
      .map(
        (stage) => `
          <article class="cr-landscape-cycle-card">

            <span>
              REGULAR CYCLE
            </span>

            <strong>
              ${escapeHtml(stage.label)}
            </strong>

            <small>
              11 weekly shows
            </small>

          </article>
        `
      )
      .join("");

    const finale =
      state.calendar?.monthlyFinale;

    const finaleHtml = finale
      ? `
        <article class="cr-landscape-cycle-card cr-landscape-cycle-finale">

          <span>
            MONTHLY FINALE
          </span>

          <strong>
            ${escapeHtml(finale.label)}
          </strong>

          <small>
            ${Number(finale.eventCount || 0)}
            major events
          </small>

        </article>
      `
      : "";

    els.monthlyCycle.innerHTML =
      weeklyHtml + finaleHtml;
  }

  function renderArchiveSummary() {
    if (!els.archiveSummary) {
      return;
    }

    const periods = Array.isArray(
      state.archive?.periods
    )
      ? [...state.archive.periods]
      : [];

    if (periods.length === 0) {
      els.archiveSummary.innerHTML = `
        <div class="cr-landscape-archive-empty">

          <strong>
            THE LANDSCAPE IS READY
          </strong>

          <p>
            No show results have been recorded yet.
            The first saved result will begin Landscape history.
          </p>

        </div>
      `;

      return;
    }

    periods.sort(
      (a, b) =>
        String(b.id || "").localeCompare(
          String(a.id || "")
        )
    );

    els.archiveSummary.innerHTML = periods
      .slice(0, 6)
      .map(
        (period) => `
          <article class="cr-landscape-period-row">

            <div>

              <span>
                PERIOD
              </span>

              <strong>
                ${escapeHtml(
                  period.label ||
                  periodLabel(period.id)
                )}
              </strong>

            </div>

            <div class="cr-landscape-period-state">

              <span>
                ${
                  period.weeklyShowsComplete
                    ? "WEEKLY COMPLETE"
                    : `WEEKLY ${Number(
                        period.weeklyShowsRecorded || 0
                      )}/44`
                }
              </span>

              <span>
                ${
                  period.showdownSaturdayComplete
                    ? "SHOWDOWN COMPLETE"
                    : `SHOWDOWN ${Number(
                        period.majorEventsRecorded || 0
                      )}/8`
                }
              </span>

              ${
                period.rankingsFinalized
                  ? "<span>RANKINGS FROZEN</span>"
                  : ""
              }

            </div>

          </article>
        `
      )
      .join("");
  }

  function renderRecordedEvents() {
    if (!els.recordedEvents) {
      return;
    }

    const events = [
      ...state.events
    ].sort(
      (a, b) =>
        eventSortValue(b).localeCompare(
          eventSortValue(a)
        )
    );

    if (events.length === 0) {
      els.recordedEvents.innerHTML = `
        <p class="cr-landscape-entry-empty">
          No Landscape events have been recorded yet.
        </p>
      `;

      return;
    }

    els.recordedEvents.innerHTML = events
      .slice(0, 30)
      .map((event) => {
        const company =
          companyForId(event.companyId);

        const show =
          showForId(event.showId);

        const eventTitle =
          event.eventName ||
          show?.name ||
          "Untitled Landscape Event";

        const matches = Array.isArray(
          event.matches
        )
          ? event.matches
          : [];

        const segments = Array.isArray(
          event.segments
        )
          ? event.segments
          : [];

        const locationText =
          formatLocation(event.location);

        const matchHtml = matches.length
          ? matches
              .map(
                (match) => `
                  <article class="cr-landscape-event-result-row">

                    <div>

                      <span>
                        MATCH
                      </span>

                      <strong>
                        ${escapeHtml(
                          match.resultText ||
                          "Untitled match"
                        )}
                      </strong>

                      ${
                        match.storyContext
                          ? `
                            <small>
                              ${escapeHtml(
                                match.storyContext
                              )}
                            </small>
                          `
                          : ""
                      }

                    </div>

                    <strong>
                      ${match.rating ?? "—"} ★
                    </strong>

                  </article>
                `
              )
              .join("")
          : `
            <p class="cr-landscape-event-none">
              No matches recorded.
            </p>
          `;

        const segmentHtml = segments.length
          ? segments
              .map(
                (segment) => `
                  <article class="cr-landscape-event-result-row">

                    <div>

                      <span>
                        SEGMENT
                      </span>

                      <strong>
                        ${escapeHtml(
                          segment.segmentType ||
                          "Segment"
                        )}
                      </strong>

                      <small>
                        ${escapeHtml(
                          segment.summary || ""
                        )}
                      </small>

                      ${
                        segment.storyContext
                          ? `
                            <small>
                              ${escapeHtml(
                                segment.storyContext
                              )}
                            </small>
                          `
                          : ""
                      }

                    </div>

                    <strong>
                      ${segment.rating ?? "—"} ★
                    </strong>

                  </article>
                `
              )
              .join("")
          : "";

        return `
          <details class="cr-landscape-recorded-event">

            <summary>

              <div>

                <span>
                  ${escapeHtml(
                    company?.name ||
                    event.companyId
                  )}
                  ·
                  ${escapeHtml(
                    periodLabel(event.periodId)
                  )}
                  ·
                  ${escapeHtml(
                    stageLabel(event.stage)
                  )}
                </span>

                <strong>
                  ${escapeHtml(eventTitle)}
                </strong>

                <small>
                  ${escapeHtml(locationText)}
                  ·
                  ${matches.length} matches
                  ·
                  ${segments.length} segments
                </small>

              </div>

              <strong class="cr-landscape-event-rating">
                ${event.overallRating ?? "—"} ★
              </strong>

            </summary>

            <div class="cr-landscape-recorded-event-body">

              <div class="cr-landscape-event-meta">

                <span>
                  BOOKING STYLE:
                  ${escapeHtml(
                    event.bookingStyle || "—"
                  )}
                </span>

                ${
                  event.location?.venue
                    ? `
                      <span>
                        VENUE:
                        ${escapeHtml(
                          event.location.venue
                        )}
                      </span>
                    `
                    : ""
                }

              </div>

              <div class="cr-landscape-event-results">
                ${matchHtml}
                ${segmentHtml}
              </div>

              ${
                event.universeNotes
                  ? `
                    <div class="cr-landscape-event-notes">

                      <span>
                        UNIVERSE NOTES
                      </span>

                      <p>
                        ${escapeHtml(
                          event.universeNotes
                        )}
                      </p>

                    </div>
                  `
                  : ""
              }

            </div>

          </details>
        `;
      })
      .join("");
  }

  function renderAll() {
    renderSummary();
    renderRecordedEvents();
    renderSchedule();
    renderCycle();
    renderArchiveSummary();
  }  // =================================
  // RECORDER SELECTS
  // =================================

  function buildRecorderSelects() {
    if (
      !els.entryMonth ||
      !els.entryStage ||
      !els.entryCompany ||
      !els.entryShow
    ) {
      return;
    }

    const currentYear =
      new Date().getFullYear();

    if (!els.entryYear.value) {
      els.entryYear.value =
        currentYear;
    }

    const existingMonth =
      els.entryMonth.value;

    const existingStage =
      els.entryStage.value;

    const existingCompany =
      els.entryCompany.value;

    els.entryMonth.innerHTML =
      (state.calendar?.months || [])
        .map(
          (month) => `
            <option value="${escapeHtml(month.id)}">
              ${escapeHtml(month.name)}
            </option>
          `
        )
        .join("");

    const stages = [
      ...(state.calendar?.weeklyStages || []),
      state.calendar?.monthlyFinale
    ].filter(Boolean);

    els.entryStage.innerHTML =
      stages
        .map(
          (stage) => `
            <option value="${escapeHtml(stage.id)}">
              ${escapeHtml(stage.label)}
            </option>
          `
        )
        .join("");

    const externalCompanies =
      state.companies.filter(
        (company) =>
          company.id !== "owl"
      );

    els.entryCompany.innerHTML =
      externalCompanies
        .map(
          (company) => `
            <option value="${escapeHtml(company.id)}">
              ${escapeHtml(company.name)}
            </option>
          `
        )
        .join("");

    if (
      existingMonth &&
      [...els.entryMonth.options].some(
        (option) =>
          option.value === existingMonth
      )
    ) {
      els.entryMonth.value =
        existingMonth;
    }

    if (
      existingStage &&
      [...els.entryStage.options].some(
        (option) =>
          option.value === existingStage
      )
    ) {
      els.entryStage.value =
        existingStage;
    }

    if (
      existingCompany &&
      [...els.entryCompany.options].some(
        (option) =>
          option.value === existingCompany
      )
    ) {
      els.entryCompany.value =
        existingCompany;
    }

    updateShowOptions();
    updateEntryMode();
    refreshEntryEmptyState();
  }

  function updateShowOptions() {
    if (
      !els.entryCompany ||
      !els.entryShow
    ) {
      return;
    }

    const companyId =
      els.entryCompany.value;

    const shows =
      state.shows.filter(
        (show) =>
          show.companyId === companyId
      );

    const previousShowId =
      els.entryShow.value;

    els.entryShow.innerHTML =
      shows
        .map(
          (show) => `
            <option value="${escapeHtml(show.id)}">
              ${escapeHtml(show.name)}
            </option>
          `
        )
        .join("");

    if (
      previousShowId &&
      shows.some(
        (show) =>
          show.id === previousShowId
      )
    ) {
      els.entryShow.value =
        previousShowId;
    }
  }

  function updateEntryMode() {
    if (!els.entryStage) {
      return;
    }

    const isMajorEvent =
      eventTypeForStage(
        els.entryStage.value
      ) === "major-event";

    if (els.entryShowWrap) {
      els.entryShowWrap.hidden =
        isMajorEvent;
    }

    if (els.entryEventNameWrap) {
      els.entryEventNameWrap.hidden =
        !isMajorEvent;
    }
  }

  function resetGeneratedLocation() {
    generatedLocation = null;

    setText(
      els.entryLocation,
      "Not generated"
    );

    setText(
      els.entryLocationDetail,
      "Generate a canon location before saving."
    );
  }

  // =================================
  // LOCATION GENERATION
  // =================================

  function sameSimulationDay(
    event,
    periodId,
    stageId,
    selectedShow
  ) {
    if (
      event.periodId !== periodId ||
      event.stage !== stageId
    ) {
      return false;
    }

    if (
      stageId === "showdown-saturday"
    ) {
      return (
        event.eventType ===
        "major-event"
      );
    }

    if (
      event.eventType !== "weekly"
    ) {
      return false;
    }

    const eventShow =
      showForId(event.showId);

    return (
      Number(eventShow?.dayOrder || 0) ===
      Number(selectedShow?.dayOrder || 0)
    );
  }

  function occupiedCityKeys(
    periodId,
    stageId,
    selectedShow
  ) {
    return new Set(
      state.events
        .filter(
          (event) =>
            sameSimulationDay(
              event,
              periodId,
              stageId,
              selectedShow
            )
        )
        .map(
          (event) =>
            locationKey(event.location)
        )
        .filter(Boolean)
    );
  }

  function reservedFixedCityKeys(
    stageId,
    selectedShow
  ) {
    const reserved =
      new Set();

    if (
      stageId === "showdown-saturday"
    ) {
      Object.values(
        state.locationRules
          ?.majorEventRules ||
        {}
      )
        .filter(
          (rule) =>
            rule.mode === "fixed"
        )
        .forEach(
          (rule) =>
            reserved.add(
              locationKey(rule)
            )
        );

      return reserved;
    }

    const selectedDayOrder =
      Number(
        selectedShow?.dayOrder || 0
      );

    state.shows
      .filter(
        (show) =>
          Number(
            show.dayOrder || 0
          ) === selectedDayOrder
      )
      .forEach((show) => {
        const rule =
          state.locationRules
            ?.showRules
            ?.[show.id];

        if (
          rule?.mode === "fixed"
        ) {
          reserved.add(
            locationKey(rule)
          );
        }
      });

    return reserved;
  }

  function siblingLocation(
    periodId,
    stageId,
    siblingShowId
  ) {
    return (
      state.events.find(
        (event) =>
          event.periodId === periodId &&
          event.stage === stageId &&
          event.showId === siblingShowId
      )?.location ||
      null
    );
  }

  async function generateLocation() {
    try {
      setEntryStatus(
        "GENERATING LOCATION"
      );

      const year =
        String(
          els.entryYear?.value || ""
        ).trim();

      const monthId =
        els.entryMonth?.value || "";

      const stageId =
        els.entryStage?.value || "";

      const companyId =
        els.entryCompany?.value || "";

      const periodId =
        `${year}-${monthId}`;

      const eventType =
        eventTypeForStage(stageId);

      const selectedShow =
        showForId(
          els.entryShow?.value
        );

      const rule =
        eventType === "major-event"
          ? state.locationRules
              ?.majorEventRules
              ?.[companyId]
          : state.locationRules
              ?.showRules
              ?.[selectedShow?.id];

      if (!rule) {
        throw new Error(
          "No location rule exists for this show or company."
        );
      }

      const occupied =
        occupiedCityKeys(
          periodId,
          stageId,
          selectedShow
        );

      const reserved =
        reservedFixedCityKeys(
          stageId,
          selectedShow
        );

      if (rule.mode === "fixed") {
        const fixedLocation = {
          venue:
            rule.venue || "",

          city:
            rule.city || "",

          region:
            rule.region || "",

          country:
            rule.country || ""
        };

        if (
          occupied.has(
            locationKey(fixedLocation)
          )
        ) {
          throw new Error(
            "The fixed venue city is already occupied on this simulation day."
          );
        }

        generatedLocation =
          fixedLocation;
      } else {
        let pool = [];

        if (
          rule.mode === "traveling"
        ) {
          pool = [
            ...(
              state.locationRules
                ?.travelingCityPool ||
              []
            )
          ];

          if (
            eventType === "weekly" &&
            rule.weeklySiblingShowId
          ) {
            const sibling =
              siblingLocation(
                periodId,
                stageId,
                rule.weeklySiblingShowId
              );

            const reuseChance =
              Number(
                rule.siblingCityReuseChance ||
                0
              );

            if (
              sibling &&
              Math.random() < reuseChance
            ) {
              pool = [
                sibling,
                ...pool
              ];
            } else if (sibling) {
              const siblingKey =
                locationKey(sibling);

              pool = pool.filter(
                (location) =>
                  locationKey(location) !==
                  siblingKey
              );
            }
          }
        }

        if (
          rule.mode === "venue-pool"
        ) {
          const weeklyPoolRule =
            eventType === "major-event"
              ? state.locationRules
                  ?.showRules
                  ?.[
                    companyId === "cmll"
                      ? "cmll-super-viernes"
                      : "aaa-lucha-libre"
                  ]
              : rule;

          pool = [
            ...(
              weeklyPoolRule?.venues ||
              []
            )
          ];
        }

        const available =
          pool.filter((location) => {
            const key =
              locationKey(location);

            return (
              !occupied.has(key) &&
              !reserved.has(key)
            );
          });

        if (
          available.length === 0
        ) {
          throw new Error(
            "No valid unused city is available for this simulation day."
          );
        }

        generatedLocation =
          structuredClone(
            randomItem(available)
          );
      }

      setText(
        els.entryLocation,
        formatLocation(
          generatedLocation
        )
      );

      setText(
        els.entryLocationDetail,
        generatedLocation?.venue ||
        "City assignment"
      );

      setEntryStatus(
        "LOCATION READY"
      );
    } catch (error) {
      console.error(
        "Landscape location generation failed:",
        error
      );

      setEntryStatus(
        error.message ||
        "LOCATION FAILED"
      );
    }
  }  // =================================
  // MATCH / SEGMENT BUILDER
  // =================================

  function refreshEntryEmptyState() {
    if (
      !els.entryItems ||
      !els.entryEmpty
    ) {
      return;
    }

    const count =
      els.entryItems.querySelectorAll(
        ".cr-landscape-content-item"
      ).length;

    els.entryEmpty.hidden =
      count > 0;
  }

  function addMatch() {
    if (!els.entryItems) {
      return;
    }

    itemCounter += 1;

    const item =
      document.createElement(
        "article"
      );

    item.className =
      "cr-landscape-content-item cr-landscape-match-item";

    item.dataset.itemType =
      "match";

    item.innerHTML = `
      <div class="cr-landscape-content-item-heading">

        <div>

          <span>
            MATCH
          </span>

          <strong>
            Match ${itemCounter}
          </strong>

        </div>

        <button
          type="button"
          class="cr-landscape-remove-item"
        >
          Remove
        </button>

      </div>

      <label>

        <span>
          RESULT
        </span>

        <textarea
          class="cr-landscape-item-description"
          rows="3"
          placeholder="Will Ospreay def. Jon Moxley"
        ></textarea>

      </label>

      <div class="cr-landscape-item-detail-grid">

        <label>

          <span>
            MATCH RATING
          </span>

          <input
            class="cr-landscape-item-rating"
            type="number"
            min="0"
            max="5"
            step="0.25"
            placeholder="4.00"
          >

        </label>

        <label>

          <span>
            STORY / FEUD CONTEXT
          </span>

          <input
            class="cr-landscape-item-context"
            type="text"
            placeholder="Greatest Wrestler"
          >

        </label>

      </div>
    `;

    item
      .querySelector(
        ".cr-landscape-remove-item"
      )
      ?.addEventListener(
        "click",
        () => {
          item.remove();

          refreshEntryEmptyState();
        }
      );

    els.entryItems.appendChild(item);

    refreshEntryEmptyState();
  }

  function addSegment() {
    if (!els.entryItems) {
      return;
    }

    itemCounter += 1;

    const item =
      document.createElement(
        "article"
      );

    item.className =
      "cr-landscape-content-item cr-landscape-segment-item";

    item.dataset.itemType =
      "segment";

    item.innerHTML = `
      <div class="cr-landscape-content-item-heading">

        <div>

          <span>
            SEGMENT
          </span>

          <strong>
            Segment ${itemCounter}
          </strong>

        </div>

        <button
          type="button"
          class="cr-landscape-remove-item"
        >
          Remove
        </button>

      </div>

      <div class="cr-landscape-item-detail-grid">

        <label>

          <span>
            SEGMENT TYPE
          </span>

          <input
            class="cr-landscape-segment-type"
            type="text"
            placeholder="Masked Attacker"
          >

        </label>

        <label>

          <span>
            SEGMENT RATING
          </span>

          <input
            class="cr-landscape-item-rating"
            type="number"
            min="0"
            max="5"
            step="0.25"
            placeholder="4.50"
          >

        </label>

      </div>

      <label>

        <span>
          SEGMENT SUMMARY
        </span>

        <textarea
          class="cr-landscape-item-description"
          rows="4"
          placeholder="Describe only what JoW explicitly showed."
        ></textarea>

      </label>

      <label>

        <span>
          STORY / FEUD CONTEXT
        </span>

        <input
          class="cr-landscape-item-context"
          type="text"
          placeholder="New Challenger"
        >

      </label>
    `;

    item
      .querySelector(
        ".cr-landscape-remove-item"
      )
      ?.addEventListener(
        "click",
        () => {
          item.remove();

          refreshEntryEmptyState();
        }
      );

    els.entryItems.appendChild(item);

    refreshEntryEmptyState();
  }

  function collectContent() {
    const matches = [];
    const segments = [];

    const items = [
      ...(
        els.entryItems
          ?.querySelectorAll(
            ".cr-landscape-content-item"
          ) ||
        []
      )
    ];

    items.forEach((item) => {
      const type =
        item.dataset.itemType;

      const description =
        item
          .querySelector(
            ".cr-landscape-item-description"
          )
          ?.value
          .trim() ||
        "";

      const ratingRaw =
        item
          .querySelector(
            ".cr-landscape-item-rating"
          )
          ?.value ??
        "";

      const rating =
        ratingRaw === ""
          ? null
          : Number(ratingRaw);

      const storyContext =
        item
          .querySelector(
            ".cr-landscape-item-context"
          )
          ?.value
          .trim() ||
        "";

      if (type === "match") {
        matches.push({
          id:
            `match-${matches.length + 1}`,

          resultText:
            description,

          rating:
            rating,

          storyContext:
            storyContext
        });
      } else {
        segments.push({
          id:
            `segment-${segments.length + 1}`,

          segmentType:
            item
              .querySelector(
                ".cr-landscape-segment-type"
              )
              ?.value
              .trim() ||
            "",

          summary:
            description,

          rating:
            rating,

          storyContext:
            storyContext
        });
      }
    });

    return {
      matches,
      segments
    };
  }

  function validateEvent(
    eventType,
    content
  ) {
    const year =
      Number(
        els.entryYear?.value
      );

    if (
      !Number.isInteger(year) ||
      year < 2026
    ) {
      throw new Error(
        "Enter a valid Landscape year."
      );
    }

    if (
      eventType === "major-event" &&
      !els.entryEventName?.value.trim()
    ) {
      throw new Error(
        "Enter the major event name."
      );
    }

    const overallRating =
      Number(
        els.entryRating?.value
      );

    if (
      !Number.isFinite(overallRating) ||
      overallRating < 0 ||
      overallRating > 5
    ) {
      throw new Error(
        "Enter a valid official show rating from 0 to 5."
      );
    }

    if (!generatedLocation) {
      throw new Error(
        "Generate the event location before saving."
      );
    }

    if (
      content.matches.length === 0 &&
      content.segments.length === 0
    ) {
      throw new Error(
        "Add at least one match or segment."
      );
    }

    const badMatch =
      content.matches.find(
        (match) =>
          !match.resultText ||
          match.rating === null ||
          !Number.isFinite(
            match.rating
          ) ||
          match.rating < 0 ||
          match.rating > 5
      );

    if (badMatch) {
      throw new Error(
        "Every match needs result text and a valid match rating."
      );
    }

    const badSegment =
      content.segments.find(
        (segment) =>
          !segment.summary
      );

    if (badSegment) {
      throw new Error(
        "Every segment needs a summary."
      );
    }
  }

  function updateArchiveIndex(
    archiveData,
    events,
    periodId
  ) {
    archiveData.periods =
      Array.isArray(
        archiveData.periods
      )
        ? archiveData.periods
        : [];

    const weeklyCount =
      events.filter(
        (event) =>
          event.periodId === periodId &&
          event.eventType === "weekly"
      ).length;

    const majorCount =
      events.filter(
        (event) =>
          event.periodId === periodId &&
          event.eventType === "major-event"
      ).length;

    let period =
      archiveData.periods.find(
        (item) =>
          item.id === periodId
      );

    if (!period) {
      period = {
        id:
          periodId,

        label:
          periodLabel(periodId),

        weeklyShowsRecorded:
          0,

        majorEventsRecorded:
          0,

        weeklyShowsComplete:
          false,

        showdownSaturdayComplete:
          false,

        awardsFinalized:
          false,

        rankingsFinalized:
          false
      };

      archiveData.periods.push(
        period
      );
    }

    period.weeklyShowsRecorded =
      weeklyCount;

    period.majorEventsRecorded =
      majorCount;

    period.weeklyShowsComplete =
      weeklyCount >= 44;

    period.showdownSaturdayComplete =
      majorCount >= 8;

    archiveData.periods.sort(
      (a, b) =>
        String(a.id).localeCompare(
          String(b.id)
        )
    );

    archiveData.latestPeriodId =
      archiveData.periods
        .at(-1)
        ?.id ||
      "";

    return archiveData;
  }

  function resetRecorderContent() {
    if (els.entryRating) {
      els.entryRating.value = "";
    }

    if (els.entryNotes) {
      els.entryNotes.value = "";
    }

    if (els.entryEventName) {
      els.entryEventName.value = "";
    }

    els.entryItems
      ?.querySelectorAll(
        ".cr-landscape-content-item"
      )
      .forEach(
        (item) =>
          item.remove()
      );

    resetGeneratedLocation();

    refreshEntryEmptyState();
  }

  async function saveEvent() {
    try {
      setEntryStatus(
        "VALIDATING"
      );

      const stageId =
        els.entryStage?.value ||
        "";

      const eventType =
        eventTypeForStage(stageId);

      const content =
        collectContent();

      validateEvent(
        eventType,
        content
      );

      const year =
        String(
          els.entryYear.value
        );

      const monthId =
        els.entryMonth.value;

      const periodId =
        `${year}-${monthId}`;

      const companyId =
        els.entryCompany.value;

      const selectedShow =
        showForId(
          els.entryShow.value
        );

      const eventName =
        eventType === "major-event"
          ? els.entryEventName
              .value
              .trim()
          : selectedShow?.name ||
            "";

      const eventId =
        eventType === "major-event"
          ? `${periodId}-${stageId}-${companyId}`
          : `${periodId}-${stageId}-${selectedShow?.id || "unknown-show"}`;

      if (
        state.events.some(
          (event) =>
            event.id === eventId
        )
      ) {
        throw new Error(
          "That Landscape show has already been recorded."
        );
      }

      const newEvent = {
        id:
          eventId,

        periodId:
          periodId,

        stage:
          stageId,

        companyId:
          companyId,

        showId:
          eventType === "weekly"
            ? selectedShow?.id ||
              ""
            : "",

        eventName:
          eventName,

        eventType:
          eventType,

        bookingStyle:
          els.entryBookingStyle.value,

        overallRating:
          Number(
            els.entryRating.value
          ),

        location:
          structuredClone(
            generatedLocation
          ),

        matches:
          content.matches,

        segments:
          content.segments,

        universeNotes:
          els.entryNotes
            .value
            .trim(),

        recordedAt:
          new Date().toISOString()
      };

      setEntryStatus(
        "SAVING"
      );

      const eventsData =
        await readJson(
          "events.json"
        );

      const archiveData =
        await readJson(
          "archive-index.json"
        );

      eventsData.events =
        Array.isArray(
          eventsData.events
        )
          ? eventsData.events
          : [];

      if (
        eventsData.events.some(
          (event) =>
            event.id === eventId
        )
      ) {
        throw new Error(
          "That Landscape show has already been recorded."
        );
      }

      eventsData.events.push(
        newEvent
      );

      eventsData.events.sort(
        (a, b) =>
          eventSortValue(a).localeCompare(
            eventSortValue(b)
          )
      );

      updateArchiveIndex(
        archiveData,
        eventsData.events,
        periodId
      );

      await writeJson(
        "events.json",
        eventsData
      );

      await writeJson(
        "archive-index.json",
        archiveData
      );

      resetRecorderContent();

      setEntryStatus(
        "SAVED"
      );

      await loadAll();

      if (
        typeof window
          .crLandscapeChampionLoad ===
        "function"
      ) {
        await window
          .crLandscapeChampionLoad();
      }

      window.dispatchEvent(
        new CustomEvent(
          "landscape-event-saved",
          {
            detail: {
              eventId,
              periodId
            }
          }
        )
      );
    } catch (error) {
      console.error(
        "Landscape event save failed:",
        error
      );

      setEntryStatus(
        error.message ||
        "SAVE FAILED"
      );
    }
  }  // =================================
  // RANKINGS
  // =================================

  function buildRankingPeriods() {
    if (!els.rankingPeriod) {
      return;
    }

    const previousValue =
      els.rankingPeriod.value;

    const periodIds = [
      ...new Set(
        state.events
          .map(
            (event) =>
              event.periodId
          )
          .filter(Boolean)
      )
    ].sort();

    if (periodIds.length === 0) {
      els.rankingPeriod.innerHTML = `
        <option value="">
          No recorded periods
        </option>
      `;

      setRankingStatus(
        "NO PERIOD"
      );

      return;
    }

    els.rankingPeriod.innerHTML =
      periodIds
        .map(
          (periodId) => `
            <option value="${escapeHtml(periodId)}">
              ${escapeHtml(
                periodLabel(periodId)
              )}
            </option>
          `
        )
        .join("");

    els.rankingPeriod.value =
      periodIds.includes(previousValue)
        ? previousValue
        : periodIds.at(-1);
  }

  function scoreDisplay(score) {
    const numeric =
      Number(score);

    return Number.isFinite(numeric)
      ? numeric.toFixed(1)
      : "—";
  }

  function renderCompanyRankings(
    rankings
  ) {
    if (!els.companyRankings) {
      return;
    }

    const usable =
      rankings.filter(
        (item) =>
          item.landscapeScore !==
          null
      );

    if (usable.length === 0) {
      els.companyRankings.innerHTML = `
        <p class="cr-landscape-entry-empty">
          No company scores available for this period.
        </p>
      `;

      return;
    }

    els.companyRankings.innerHTML =
      usable
        .map(
          (item) => `
            <article class="cr-landscape-ranking-row">

              <strong class="cr-landscape-rank-number">
                ${item.rank}
              </strong>

              <div class="cr-landscape-ranking-name">

                <strong>
                  ${escapeHtml(
                    item.companyName
                  )}
                </strong>

                <small>
                  Weekly product:
                  ${scoreDisplay(
                    item.components
                      ?.weeklyProduct
                  )}
                </small>

              </div>

              <strong class="cr-landscape-ranking-score">
                ${scoreDisplay(
                  item.landscapeScore
                )}
              </strong>

            </article>
          `
        )
        .join("");
  }

  function renderShowRankings(
    rankings
  ) {
    if (!els.showRankings) {
      return;
    }

    const usable =
      rankings.filter(
        (item) =>
          item.landscapeScore !==
          null
      );

    if (usable.length === 0) {
      els.showRankings.innerHTML = `
        <p class="cr-landscape-entry-empty">
          No weekly-show scores available for this period.
        </p>
      `;

      return;
    }

    els.showRankings.innerHTML =
      usable
        .map(
          (item) => `
            <article class="cr-landscape-ranking-row">

              <strong class="cr-landscape-rank-number">
                ${item.rank}
              </strong>

              <div class="cr-landscape-ranking-name">

                <strong>
                  ${escapeHtml(
                    item.showName
                  )}
                </strong>

                <small>
                  Overall:
                  ${item.overallAverage ?? "—"}
                  ·
                  In-ring:
                  ${item.matchAverage ?? "—"}
                </small>

              </div>

              <strong class="cr-landscape-ranking-score">
                ${scoreDisplay(
                  item.landscapeScore
                )}
              </strong>

            </article>
          `
        )
        .join("");
  }

  function refreshRankingPreview() {
    if (
      !els.rankingPeriod ||
      !els.rankingMode
    ) {
      return;
    }

    const periodId =
      els.rankingPeriod.value;

    if (!periodId) {
      renderCompanyRankings([]);
      renderShowRankings([]);

      setRankingStatus(
        "NO PERIOD"
      );

      return;
    }

    if (
      !window.LandscapeScoreEngine
    ) {
      setRankingStatus(
        "ENGINE MISSING"
      );

      console.error(
        "LandscapeScoreEngine is not loaded."
      );

      return;
    }

    const mode =
      els.rankingMode.value;

    const frozenPeriod =
      state.rankings
        ?.periods
        ?.find(
          (period) =>
            period.periodId ===
            periodId
        ) ||
      null;

    let result;

    if (frozenPeriod) {
      result =
        mode === "ytd"
          ? frozenPeriod.ytd
          : frozenPeriod.monthly;

      setRankingStatus(
        "FROZEN OFFICIAL"
      );
    } else {
      result =
        mode === "ytd"
          ? window
              .LandscapeScoreEngine
              .calculateYtdRankings({
                events:
                  state.events,

                shows:
                  state.shows,

                companies:
                  state.companies,

                periodId:
                  periodId
              })
          : window
              .LandscapeScoreEngine
              .calculateMonthlyRankings({
                events:
                  state.events,

                shows:
                  state.shows,

                companies:
                  state.companies,

                periodId:
                  periodId
              });

      setRankingStatus(
        "LIVE PREVIEW"
      );
    }

    renderCompanyRankings(
      result?.companyRankings ||
      []
    );

    renderShowRankings(
      result?.showRankings ||
      []
    );
  }

  async function freezeRankings() {
    try {
      const periodId =
        els.rankingPeriod
          ?.value ||
        "";

      if (!periodId) {
        throw new Error(
          "Select a Landscape period first."
        );
      }

      const archivePeriod =
        state.archive
          ?.periods
          ?.find(
            (period) =>
              period.id ===
              periodId
          );

      if (!archivePeriod) {
        throw new Error(
          "That period does not exist in the Landscape archive."
        );
      }

      if (
        !archivePeriod
          .weeklyShowsComplete
      ) {
        throw new Error(
          "All 44 weekly show records must be complete before standings can freeze."
        );
      }

      if (
        !archivePeriod
          .showdownSaturdayComplete
      ) {
        throw new Error(
          "All 8 Showdown Saturday major events must be complete before standings can freeze."
        );
      }

      if (
        state.rankings
          ?.periods
          ?.some(
            (period) =>
              period.periodId ===
              periodId
          )
      ) {
        throw new Error(
          "Official standings for this period are already frozen."
        );
      }

      if (
        !window.LandscapeScoreEngine
      ) {
        throw new Error(
          "Landscape Score engine is not loaded."
        );
      }

      setRankingStatus(
        "CALCULATING"
      );

      const monthly =
        window
          .LandscapeScoreEngine
          .calculateMonthlyRankings({
            events:
              state.events,

            shows:
              state.shows,

            companies:
              state.companies,

            periodId:
              periodId
          });

      const ytd =
        window
          .LandscapeScoreEngine
          .calculateYtdRankings({
            events:
              state.events,

            shows:
              state.shows,

            companies:
              state.companies,

            periodId:
              periodId
          });

      const rankingsData =
        await readJson(
          "rankings.json"
        );

      const archiveData =
        await readJson(
          "archive-index.json"
        );

      rankingsData.scoreVersion =
        window
          .LandscapeScoreEngine
          .SCORE_VERSION;

      rankingsData.periods =
        Array.isArray(
          rankingsData.periods
        )
          ? rankingsData.periods
          : [];

      rankingsData.periods.push({
        periodId:
          periodId,

        scoreVersion:
          window
            .LandscapeScoreEngine
            .SCORE_VERSION,

        frozenAt:
          new Date().toISOString(),

        monthly:
          monthly,

        ytd:
          ytd
      });

      rankingsData.periods.sort(
        (a, b) =>
          String(
            a.periodId
          ).localeCompare(
            String(
              b.periodId
            )
          )
      );

      rankingsData.latestPeriodId =
        rankingsData.periods
          .at(-1)
          ?.periodId ||
        "";

      const archiveRecord =
        archiveData.periods
          ?.find(
            (period) =>
              period.id ===
              periodId
          );

      if (archiveRecord) {
        archiveRecord
          .rankingsFinalized =
          true;

        archiveRecord
          .rankingsFrozenAt =
          new Date().toISOString();
      }

      setRankingStatus(
        "SAVING"
      );

      await writeJson(
        "rankings.json",
        rankingsData
      );

      await writeJson(
        "archive-index.json",
        archiveData
      );

      await loadAll();

      setRankingStatus(
        "FROZEN OFFICIAL"
      );
    } catch (error) {
      console.error(
        "Landscape ranking freeze failed:",
        error
      );

      setRankingStatus(
        error.message ||
        "FREEZE FAILED"
      );
    }
  }  // =================================
  // EVENT LISTENERS
  // =================================

  function bindEvents() {
    if (initialized) {
      return;
    }

    initialized = true;

    els.entryCompany
      ?.addEventListener(
        "change",
        () => {
          updateShowOptions();

          resetGeneratedLocation();
        }
      );

    els.entryStage
      ?.addEventListener(
        "change",
        () => {
          updateEntryMode();

          resetGeneratedLocation();
        }
      );

    els.entryShow
      ?.addEventListener(
        "change",
        resetGeneratedLocation
      );

    els.entryMonth
      ?.addEventListener(
        "change",
        resetGeneratedLocation
      );

    els.entryYear
      ?.addEventListener(
        "change",
        resetGeneratedLocation
      );

    els.generateLocation
      ?.addEventListener(
        "click",
        generateLocation
      );

    els.addMatch
      ?.addEventListener(
        "click",
        addMatch
      );

    els.addSegment
      ?.addEventListener(
        "click",
        addSegment
      );

    els.saveEvent
      ?.addEventListener(
        "click",
        saveEvent
      );

    els.refreshRankings
      ?.addEventListener(
        "click",
        refreshRankingPreview
      );

    els.rankingPeriod
      ?.addEventListener(
        "change",
        refreshRankingPreview
      );

    els.rankingMode
      ?.addEventListener(
        "change",
        refreshRankingPreview
      );

    els.freezeRankings
      ?.addEventListener(
        "click",
        freezeRankings
      );
  }

  // =================================
  // PUBLIC HOOKS + STARTUP
  // =================================

  window.crLandscapeLoad =
    loadAll;

  window.crLandscapeRankingLoad =
    loadAll;

  bindEvents();

  window.addEventListener(
    "owl-control-room-data-loaded",
    loadAll
  );

  try {
    if (
      typeof owlRepositoryHandle !==
        "undefined" &&
      owlRepositoryHandle
    ) {
      loadAll();
    }
  } catch (error) {
    console.warn(
      "Landscape system waiting for repository connection.",
      error
    );
  }
})();
