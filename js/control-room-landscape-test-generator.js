// =================================
// OWL CONTROL ROOM
// LANDSCAPE TEMPORARY TEST GENERATOR
// =================================

(() => {
  "use strict";

  const button =
    document.getElementById(
      "cr-landscape-generate-test-month"
    );

  if (!button) {
    return;
  }

  const PERIOD_ID =
    "2099-10";

  const WEEKLY_STAGES = [
    "week-1",
    "week-2",
    "week-3",
    "week-4"
  ];

  const COMPANY_STRENGTH = {
    aew: 0.62,
    owl: 0.54,
    tna: 0.43,
    wwe: 0.36,
    mlw: 0.30,
    aaa: 0.22,
    nxt: 0.15,
    roh: 0.08
  };


  // =================================
  // HELPERS
  // =================================

  function round(
    value,
    decimals = 2
  ) {
    return Number(
      Number(value).toFixed(
        decimals
      )
    );
  }


  function clamp(
    value,
    minimum,
    maximum
  ) {
    return Math.min(
      maximum,
      Math.max(
        minimum,
        value
      )
    );
  }


  function companyStrength(
    companyId
  ) {
    return (
      COMPANY_STRENGTH[
        companyId
      ]

      ??

      0
    );
  }


  async function landscapeDirectory() {
    if (
      typeof owlRepositoryHandle ===
        "undefined"

      ||

      !owlRepositoryHandle
    ) {
      throw new Error(
        "Connect the OWL folder first."
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


  async function readJson(
    fileName
  ) {
    const directory =
      await landscapeDirectory();

    const handle =
      await directory.getFileHandle(
        fileName
      );

    const file =
      await handle.getFile();

    return JSON.parse(
      await file.text()
    );
  }


  async function writeJson(
    fileName,
    value
  ) {
    const directory =
      await landscapeDirectory();

    const handle =
      await directory.getFileHandle(
        fileName
      );

    const writable =
      await handle.createWritable();

    await writable.write(
      `${JSON.stringify(
        value,
        null,
        2
      )}\n`
    );

    await writable.close();
  }


  // =================================
  // RATINGS
  // =================================

  function weeklyRating(
    show,
    showIndex,
    weekIndex
  ) {
    const base =
      3.25;

    const companyBonus =
      companyStrength(
        show.companyId
      );

    const showVariation =
      (
        showIndex % 3
      )
      *
      0.04;

    const weeklyTrend =
      weekIndex
      *
      0.06;

    return round(
      clamp(
        base
        +
        companyBonus
        +
        showVariation
        +
        weeklyTrend,
        0,
        5
      )
    );
  }


  function majorRating(
    company,
    companyIndex
  ) {
    return round(
      clamp(
        3.45
        +
        companyStrength(
          company.id
        )
        +
        (
          companyIndex
          *
          0.015
        ),
        0,
        5
      )
    );
  }


  // =================================
  // WEEKLY EVENT
  // =================================

  function makeWeeklyEvent(
    show,
    showIndex,
    weekIndex
  ) {
    const stage =
      WEEKLY_STAGES[
        weekIndex
      ];

    const overallRating =
      weeklyRating(
        show,
        showIndex,
        weekIndex
      );

    const showLabel =
      show.shortName

      ||

      show.name;

    return {
      id:
        `${PERIOD_ID}-${stage}-${show.id}`,

      periodId:
        PERIOD_ID,

      stage:
        stage,

      eventType:
        "weekly",

      companyId:
        show.companyId,

      showId:
        show.id,

      eventName:
        show.name,

      bookingStyle:
        "Standard",

      overallRating:
        overallRating,

      location: {
        venue:
          `Test Venue ${showIndex + 1}`,

        city:
          `Test City ${showIndex + 1}`,

        region:
          "Test Region",

        country:
          "Test Country"
      },

      matches: [
        {
          id:
            `${PERIOD_ID}-${stage}-${show.id}-match-1`,

          matchType:
            "singles",

          resultText:
            `Test ${showLabel} Alpha defeated Test ${showLabel} Beta.`,

          rating:
            round(
              clamp(
                overallRating + 0.12,
                0,
                5
              )
            ),

          storyContext:
            ""
        },
        {
          id:
            `${PERIOD_ID}-${stage}-${show.id}-match-2`,

          matchType:
            "singles",

          resultText:
            `Test ${showLabel} Gamma defeated Test ${showLabel} Delta.`,

          rating:
            round(
              clamp(
                overallRating - 0.08,
                0,
                5
              )
            ),

          storyContext:
            ""
        }
      ],

      segments: [
        {
          segmentType:
            "story-segment",

          summary:
            `Test story context for ${show.name}.`,

          rating:
            null
        }
      ],

      universeNotes:
        ""
    };
  }


  // =================================
  // MAJOR EVENT
  // =================================

  function makeMajorEvent(
    company,
    companyIndex
  ) {
    const overallRating =
      majorRating(
        company,
        companyIndex
      );

    const octoberEvent =
      (
        company.eventCalendar

        ||

        []
      )
        .find(
          event =>
            event.month ===
            "10"
        );

    const companyLabel =
      company.shortName

      ||

      company.name;

    const eventName =
      octoberEvent?.name

        ? `${companyLabel} ${octoberEvent.name}`

        : `${companyLabel} October Test Event`;

    return {
      id:
        `${PERIOD_ID}-major-${company.id}`,

      periodId:
        PERIOD_ID,

      stage:
        "showdown-saturday",

      eventType:
        "major-event",

      companyId:
        company.id,

      showId:
        "",

      eventName:
        eventName,

      bookingStyle:
        "Standard",

      overallRating:
        overallRating,

      location: {
        venue:
          `${companyLabel} Test Arena`,

        city:
          `Showdown City ${companyIndex + 1}`,

        region:
          "Test Region",

        country:
          "Test Country"
      },

      matches: [
        {
          id:
            `${PERIOD_ID}-major-${company.id}-match-1`,

          matchType:
            "singles",

          resultText:
            `Test ${companyLabel} Major Alpha defeated Test ${companyLabel} Major Beta.`,

          rating:
            round(
              clamp(
                overallRating + 0.16,
                0,
                5
              )
            )
        },
        {
          id:
            `${PERIOD_ID}-major-${company.id}-match-2`,

          matchType:
            "singles",

          resultText:
            `Test ${companyLabel} Major Gamma defeated Test ${companyLabel} Major Delta.`,

          rating:
            round(
              clamp(
                overallRating - 0.04,
                0,
                5
              )
            )
        }
      ],

      segments:
        [],

      universeNotes:
        ""
    };
  }


  // =================================
  // GENERATE TEST MONTH
  // =================================

  async function generateTestMonth() {
    const originalText =
      button.textContent;

    button.disabled =
      true;

    button.textContent =
      "GENERATING 52 EVENTS...";

    try {
      const [
        companiesData,
        showsData,
        eventsData
      ] =
        await Promise.all([
          readJson(
            "companies.json"
          ),

          readJson(
            "shows.json"
          ),

          readJson(
            "events.json"
          )
        ]);

      const companies =
        Array.isArray(
          companiesData.companies
        )

          ? companiesData.companies

          : [];

      const shows =
        Array.isArray(
          showsData.shows
        )

          ? showsData.shows

          : [];

      const existingEvents =
        Array.isArray(
          eventsData.events
        )

          ? eventsData.events

          : [];

      if (
        existingEvents.length !==
        0
      ) {
        throw new Error(
          "events.json is not empty. Reset the test data before generating again."
        );
      }

      if (
        companies.length !==
        8
      ) {
        throw new Error(
          `Expected 8 promotions but found ${companies.length}.`
        );
      }

      if (
        shows.length !==
        11
      ) {
        throw new Error(
          `Expected 11 weekly shows but found ${shows.length}.`
        );
      }

      if (
        !companies.some(
          company =>
            company.id ===
            "mlw"
        )
      ) {
        throw new Error(
          "MLW is missing from companies.json."
        );
      }

      if (
        companies.some(
          company =>
            company.id ===
            "cmll"
        )
      ) {
        throw new Error(
          "CMLL is still present in companies.json."
        );
      }

      if (
        !shows.some(
          show =>
            show.id ===
            "mlw-fusion"
        )
      ) {
        throw new Error(
          "MLW Fusion is missing from shows.json."
        );
      }

      const weeklyEvents =
        [];

      WEEKLY_STAGES.forEach(
        (
          stage,
          weekIndex
        ) => {
          shows.forEach(
            (
              show,
              showIndex
            ) => {
              weeklyEvents.push(
                makeWeeklyEvent(
                  show,
                  showIndex,
                  weekIndex
                )
              );
            }
          );
        }
      );

      const majorEvents =
        companies.map(
          (
            company,
            companyIndex
          ) =>
            makeMajorEvent(
              company,
              companyIndex
            )
        );

      const events = [
        ...weeklyEvents,
        ...majorEvents
      ];

      if (
        weeklyEvents.length !==
        44
      ) {
        throw new Error(
          `Expected 44 weekly events but generated ${weeklyEvents.length}.`
        );
      }

      if (
        majorEvents.length !==
        8
      ) {
        throw new Error(
          `Expected 8 major events but generated ${majorEvents.length}.`
        );
      }

      if (
        events.length !==
        52
      ) {
        throw new Error(
          `Expected 52 total events but generated ${events.length}.`
        );
      }

      await writeJson(
        "events.json",
        {
          version:
            1,

          events:
            events
        }
      );

      await writeJson(
        "archive-index.json",
        {
          version:
            1,

          latestPeriodId:
            PERIOD_ID,

          periods: [
            {
              id:
                PERIOD_ID,

              label:
                "October 2099",

              weeklyShowsRecorded:
                44,

              weeklyShowsComplete:
                true,

              majorEventsRecorded:
                8,

              showdownSaturdayComplete:
                true,

              awardsFinalized:
                false,

              rankingsFinalized:
                false
            }
          ]
        }
      );

      if (
        typeof window
          .crLandscapeLoad ===
        "function"
      ) {
        await window
          .crLandscapeLoad();
      }

      button.textContent =
        "52 TEST EVENTS GENERATED";

      const status =
        document.getElementById(
          "cr-landscape-ranking-status"
        );

      if (status) {
        status.textContent =
          "READY TO FREEZE";
      }
    } catch (error) {
      console.error(
        "Landscape test generation failed:",
        error
      );

      button.textContent =
        error.message

        ||

        "GENERATION FAILED";

      button.disabled =
        false;

      return;
    }

    setTimeout(
      () => {
        button.textContent =
          originalText;

        button.disabled =
          false;
      },
      5000
    );
  }


  button.addEventListener(
    "click",
    generateTestMonth
  );
})();
