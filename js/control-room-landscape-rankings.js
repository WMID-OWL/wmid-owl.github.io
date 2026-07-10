// =================================
// OWL CONTROL ROOM
// LANDSCAPE RANKING PREVIEW
// =================================


const crLandscapeRankingEls = {


    period:

        document.getElementById(
            "cr-landscape-ranking-period"
        ),


    mode:

        document.getElementById(
            "cr-landscape-ranking-mode"
        ),


        refresh:

        document.getElementById(
            "cr-landscape-refresh-rankings"
        ),


    freeze:

        document.getElementById(
            "cr-landscape-freeze-rankings"
        ),


    status:

        document.getElementById(
            "cr-landscape-ranking-status"
        ),


    companies:

        document.getElementById(
            "cr-landscape-company-rankings"
        ),


    shows:

        document.getElementById(
            "cr-landscape-show-rankings"
        )

};



let crLandscapeRankingData = {


    events:
        [],


    shows:
        [],


    companies:
        [],


    calendar:
        null,


    archive:
        null,


    rankings:
        null

};


// =================================
// STATUS
// =================================


function crLandscapeRankingSetStatus(
    value
) {


    crLandscapeRankingEls
        .status
        .textContent =
            value;

}

// =================================
// HTML SAFETY
// =================================


function crLandscapeRankingEscapeHtml(
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



// =================================
// READ JSON
// =================================


async function crLandscapeRankingReadJson(
    fileName
) {


    const dataDirectory =

        await owlRepositoryHandle
            .getDirectoryHandle(
                "data"
            );


    const landscapeDirectory =

        await dataDirectory
            .getDirectoryHandle(
                "landscape"
            );


    const fileHandle =

        await landscapeDirectory
            .getFileHandle(
                fileName
            );


    const file =

        await fileHandle
            .getFile();


    return JSON.parse(

        await file.text()

    );

}


// =================================
// WRITE JSON
// =================================


async function crLandscapeRankingWriteJson(
    fileName,
    data
) {


    const dataDirectory =

        await owlRepositoryHandle
            .getDirectoryHandle(
                "data"
            );


    const landscapeDirectory =

        await dataDirectory
            .getDirectoryHandle(
                "landscape"
            );


    const fileHandle =

        await landscapeDirectory
            .getFileHandle(
                fileName
            );


    const writable =

        await fileHandle
            .createWritable();


    await writable.write(

        `${JSON.stringify(

            data,

            null,

            2

        )}\n`

    );


    await writable.close();

}

// =================================
// PERIOD LABEL
// =================================


function crLandscapeRankingPeriodLabel(
    periodId
) {


    const match =

        String(
            periodId || ""
        )
            .match(
                /^(\d{4})-(\d{2})$/
            );


    if (
        !match
    ) {


        return periodId || "—";

    }


    const year =
        match[1];


    const monthId =
        match[2];


    const month =

        crLandscapeRankingData
            .calendar
            ?.months
            ?.find(

                item =>

                    item.id ===
                    monthId

            );


    return month

        ? `${month.name} ${year}`

        : periodId;

}



// =================================
// BUILD PERIOD OPTIONS
// =================================


function crLandscapeRankingBuildPeriods() {


    const periodIds =

        [

            ...new Set(

                crLandscapeRankingData
                    .events

                    .map(

                        event =>

                            event.periodId

                    )

                    .filter(
                        Boolean
                    )

            )

        ]

            .sort();


    if (
        periodIds.length === 0
    ) {


        crLandscapeRankingEls
            .period
            .innerHTML = `

                <option value="">

                    No recorded periods

                </option>

            `;


        return;

    }


    crLandscapeRankingEls
        .period
        .innerHTML =

            periodIds

                .map(

                    periodId => `

                        <option value="${

                            crLandscapeRankingEscapeHtml(
                                periodId
                            )

                        }">

                            ${crLandscapeRankingEscapeHtml(

                                crLandscapeRankingPeriodLabel(
                                    periodId
                                )

                            )}

                        </option>

                    `

                )

                .join(
                    ""
                );


    crLandscapeRankingEls
        .period
        .value =

            periodIds.at(
                -1
            );

}



// =================================
// SCORE DISPLAY
// =================================


function crLandscapeRankingScoreDisplay(
    score
) {


    return Number.isFinite(
        Number(
            score
        )
    )

        ? Number(
            score
        )
            .toFixed(
                1
            )

        : "—";

}



// =================================
// RENDER COMPANY RANKINGS
// =================================


function crLandscapeRankingRenderCompanies(
    rankings
) {


    const usable =

        rankings.filter(

            item =>

                item.landscapeScore
                !==
                null

        );


    if (
        usable.length === 0
    ) {


        crLandscapeRankingEls
            .companies
            .innerHTML = `

                <p class="cr-landscape-entry-empty">

                    No company scores available for this period.

                </p>

            `;


        return;

    }


    crLandscapeRankingEls
        .companies
        .innerHTML =

            usable

                .map(

                    item => `

                        <article class="cr-landscape-ranking-row">


                            <strong class="cr-landscape-rank-number">

                                ${item.rank}

                            </strong>



                            <div class="cr-landscape-ranking-name">


                                <strong>

                                    ${crLandscapeRankingEscapeHtml(
                                        item.companyName
                                    )}

                                </strong>


                                <small>

                                    Weekly product:
                                    ${crLandscapeRankingScoreDisplay(

                                        item.components
                                            ?.weeklyProduct

                                    )}

                                </small>


                            </div>



                            <strong class="cr-landscape-ranking-score">

                                ${crLandscapeRankingScoreDisplay(
                                    item.landscapeScore
                                )}

                            </strong>


                        </article>

                    `

                )

                .join(
                    ""
                );

}



// =================================
// RENDER SHOW RANKINGS
// =================================


function crLandscapeRankingRenderShows(
    rankings
) {


    const usable =

        rankings.filter(

            item =>

                item.landscapeScore
                !==
                null

        );


    if (
        usable.length === 0
    ) {


        crLandscapeRankingEls
            .shows
            .innerHTML = `

                <p class="cr-landscape-entry-empty">

                    No weekly-show scores available for this period.

                </p>

            `;


        return;

    }


    crLandscapeRankingEls
        .shows
        .innerHTML =

            usable

                .map(

                    item => `

                        <article class="cr-landscape-ranking-row">


                            <strong class="cr-landscape-rank-number">

                                ${item.rank}

                            </strong>



                            <div class="cr-landscape-ranking-name">


                                <strong>

                                    ${crLandscapeRankingEscapeHtml(
                                        item.showName
                                    )}

                                </strong>


                                <small>

                                    Overall:
                                    ${

                                        item.overallAverage
                                        ??
                                        "—"

                                    }
                                    ·
                                    In-ring:
                                    ${

                                        item.matchAverage
                                        ??
                                        "—"

                                    }

                                </small>


                            </div>



                            <strong class="cr-landscape-ranking-score">

                                ${crLandscapeRankingScoreDisplay(
                                    item.landscapeScore
                                )}

                            </strong>


                        </article>

                    `

                )

                .join(
                    ""
                );

}



// =================================
// CALCULATE PREVIEW
// =================================


function crLandscapeRankingRefresh() {


    const periodId =

        crLandscapeRankingEls
            .period
            .value;


    if (
        !periodId
    ) {


        crLandscapeRankingRenderCompanies(
            []
        );


        crLandscapeRankingRenderShows(
            []
        );


        return;

    }


    const mode =

        crLandscapeRankingEls
            .mode
            .value;


    const result =

        mode ===
        "ytd"

            ? window
                .LandscapeScoreEngine
                .calculateYtdRankings({

                    events:

                        crLandscapeRankingData
                            .events,

                    shows:

                        crLandscapeRankingData
                            .shows,

                    companies:

                        crLandscapeRankingData
                            .companies,

                    periodId:
                        periodId

                })

            : window
                .LandscapeScoreEngine
                .calculateMonthlyRankings({

                    events:

                        crLandscapeRankingData
                            .events,

                    shows:

                        crLandscapeRankingData
                            .shows,

                    companies:

                        crLandscapeRankingData
                            .companies,

                    periodId:
                        periodId

                });


    crLandscapeRankingRenderCompanies(

        result.companyRankings

    );


    crLandscapeRankingRenderShows(

        result.showRankings

    );

}



// =================================
// LOAD
// =================================


async function crLandscapeRankingLoad() {


    if (
        typeof owlRepositoryHandle
        ===
        "undefined"

        ||

        !owlRepositoryHandle
    ) {


        return;

    }


    try {


        const [

            eventsData,
            showsData,
            companiesData,
            calendarData

        ] =

            await Promise.all([

                crLandscapeRankingReadJson(
                    "events.json"
                ),

                crLandscapeRankingReadJson(
                    "shows.json"
                ),

                crLandscapeRankingReadJson(
                    "companies.json"
                ),

                crLandscapeRankingReadJson(
                    "calendar-config.json"
                )

            ]);


        crLandscapeRankingData = {


            events:

                Array.isArray(
                    eventsData.events
                )

                    ? eventsData.events

                    : [],


            shows:

                Array.isArray(
                    showsData.shows
                )

                    ? showsData.shows

                    : [],


            companies:

                Array.isArray(
                    companiesData.companies
                )

                    ? companiesData.companies

                    : [],


            calendar:
                calendarData

        };


        crLandscapeRankingBuildPeriods();

        crLandscapeRankingRefresh();

    }


    catch (
        error
    ) {


        console.error(

            "Could not load Landscape ranking preview:",

            error

        );

    }

}



// =================================
// EVENTS
// =================================


crLandscapeRankingEls
    .refresh
    .addEventListener(

        "click",

        crLandscapeRankingRefresh

    );


crLandscapeRankingEls
    .period
    .addEventListener(

        "change",

        crLandscapeRankingRefresh

    );


crLandscapeRankingEls
    .mode
    .addEventListener(

        "change",

        crLandscapeRankingRefresh

    );



// =================================
// REPOSITORY EVENT
// =================================


window.addEventListener(

    "owl-control-room-data-loaded",

    crLandscapeRankingLoad

);



// =================================
// SAFETY INITIALIZATION
// =================================


try {


    if (

        typeof owlRepositoryHandle
        !==
        "undefined"

        &&

        owlRepositoryHandle

    ) {


        crLandscapeRankingLoad();

    }


}


catch (
    error
) {


    console.warn(

        "Landscape ranking preview waiting for repository connection.",

        error

    );

}
