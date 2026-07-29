// =================================
// OWL AFTER DARK
// WEEKLY EPISODE READER
// =================================


// =================================
// ELEMENTS
// =================================


const afterDarkEls = {


    currentLabel:

        document.getElementById(
            "after-dark-current-label"
        ),


    episode:

        document.getElementById(
            "after-dark-episode"
        ),


    emptyEpisode:

        document.getElementById(
            "after-dark-empty-episode"
        ),


    archiveGrid:

        document.getElementById(
            "after-dark-archive-grid"
        ),


    emptyArchive:

        document.getElementById(
            "after-dark-empty-archive"
        )

};



// =================================
// HTML SAFETY
// =================================


function afterDarkEscape(
    value
) {


    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}



// =================================
// FETCH JSON
// =================================


async function afterDarkFetchJson(
    filePath
) {


    const response =

        await fetch(

            filePath,

            {
                cache:
                    "no-store"
            }

        );


    if (
        !response.ok
    ) {


        throw new Error(

            `Could not load ${filePath}`

        );

    }


    return response.json();

}



// =================================
// ARRAY SAFETY
// =================================


function afterDarkArray(
    value
) {


    return Array.isArray(
        value
    )

        ? value

        : [];

}



// =================================
// RESULT CARD
// =================================


function afterDarkResultHtml(
    result
) {


    const rating =

        result.rating !== null

        &&

        result.rating !== undefined

            ? `${afterDarkEscape(
                result.rating
            )}%`

            : "—";


    const stars =

        result.stars !== null

        &&

        result.stars !== undefined

            ? `${afterDarkEscape(
                result.stars
            )} ★`

            : "—";


    return `

        <article class="after-dark-result-card">


            <span class="after-dark-result-type">

                ${afterDarkEscape(
                    result.matchType || "MATCH"
                )}

            </span>


            <h4>

                ${afterDarkEscape(
                    result.match || "Match result"
                )}

            </h4>


            <p>

                Winner:

                <strong>

                    ${afterDarkEscape(
                        result.winner || "—"
                    )}

                </strong>

            </p>


            <div class="after-dark-result-ratings">


                <span>
                    ${rating}
                </span>


                <span>
                    ${stars}
                </span>


            </div>


        </article>

    `;

}



// =================================
// SHOW RECAP
// =================================


function afterDarkShowHtml(
    show,
    fallbackName
) {


    const results =

        afterDarkArray(
            show?.results
        );


    return `

        <article class="after-dark-show-card">


            <header class="after-dark-show-heading">


                <div>


                    <span>
                        WEEKLY SHOW
                    </span>


                    <h3>

                        ${afterDarkEscape(
                            show?.name || fallbackName
                        )}

                    </h3>


                </div>


                <div class="after-dark-show-meta">


                    <strong>

                        ${afterDarkEscape(
                            show?.dateLabel || ""
                        )}

                    </strong>


                    ${
                        show?.eventId

                            ? `

                                <a
                                    href="event.html?id=${encodeURIComponent(
                                        show.eventId
                                    )}"
                                >
                                    VIEW EVENT →
                                </a>

                            `

                            : ""
                    }


                </div>


            </header>


            <p class="after-dark-show-summary">

                ${afterDarkEscape(
                    show?.summary || ""
                )}

            </p>


            <div class="after-dark-result-list">

                ${results

                    .map(
                        afterDarkResultHtml
                    )

                    .join(
                        ""
                    )}

            </div>


        </article>

    `;

}



// =================================
// TEXT LIST
// =================================


function afterDarkListHtml(
    items,
    emptyText
) {


    const entries =

        afterDarkArray(
            items
        );


    if (
        !entries.length
    ) {


        return `

            <p class="after-dark-list-empty">

                ${afterDarkEscape(
                    emptyText
                )}

            </p>

        `;

    }


    return `

        <div class="after-dark-story-list">

            ${entries

                .map(

                    item => {


                        const title =

                            typeof item ===
                            "string"

                                ? item

                                : item.title || "";


                        const body =

                            typeof item ===
                            "string"

                                ? ""

                                : item.body || "";


                        return `

                            <article>


                                <h4>

                                    ${afterDarkEscape(
                                        title
                                    )}

                                </h4>


                                ${
                                    body

                                        ? `

                                            <p>

                                                ${afterDarkEscape(
                                                    body
                                                )}

                                            </p>

                                        `

                                        : ""
                                }


                            </article>

                        `;

                    }

                )

                .join(
                    ""
                )}

        </div>

    `;

}



// =================================
// MATCH OF THE WEEK
// =================================


function afterDarkMatchOfWeekHtml(
    match
) {


    if (
        !match
    ) {


        return "";

    }


    return `

        <article class="after-dark-match-of-week">


            <span>
                MATCH OF THE WEEK
            </span>


            <h2>

                ${afterDarkEscape(
                    match.match || ""
                )}

            </h2>


            <p>

                ${afterDarkEscape(
                    match.summary || ""
                )}

            </p>


            <div>


                <strong>

                    ${
                        match.rating !== null

                        &&

                        match.rating !== undefined

                            ? `${afterDarkEscape(
                                match.rating
                            )}%`

                            : "—"
                    }

                </strong>


                <strong>

                    ${
                        match.stars !== null

                        &&

                        match.stars !== undefined

                            ? `${afterDarkEscape(
                                match.stars
                            )} ★`

                            : "—"
                    }

                </strong>

            </div>


        </article>

    `;

}



// =================================
// EPISODE
// =================================


function afterDarkRenderEpisode(
    episode
) {


    afterDarkEls
        .episode
        .innerHTML =
            "";


    afterDarkEls
        .emptyEpisode
        .hidden =
            true;


    afterDarkEls
        .currentLabel
        .textContent =

            episode.label

            ||

            "Latest Episode";


    const article =

        document.createElement(
            "article"
        );


    article.className =
        "after-dark-episode-package";


    article.innerHTML = `

        <header class="after-dark-episode-hero">


            <div>


                <span class="after-dark-episode-number">

                    EPISODE

                    ${afterDarkEscape(
                        episode.episode || "—"
                    )}

                </span>


                <h2>

                    ${afterDarkEscape(
                        episode.headline || "OWL After Dark"
                    )}

                </h2>


                <p>

                    ${afterDarkEscape(
                        episode.deck || ""
                    )}

                </p>


            </div>


            <aside class="after-dark-episode-meta">


                <span>
                    AIR DATE
                </span>


                <strong>

                    ${afterDarkEscape(
                        episode.label || ""
                    )}

                </strong>


                <small>

                    ${afterDarkEscape(
                        episode.coverageLabel ||
                        "ASCENSION + REVOLT"
                    )}

                </small>


            </aside>


        </header>


        ${afterDarkMatchOfWeekHtml(
            episode.matchOfWeek
        )}


        <section class="after-dark-show-grid">


            ${afterDarkShowHtml(
                episode.ascension,
                "OWL Ascension"
            )}


            ${afterDarkShowHtml(
                episode.revolt,
                "OWL Revolt"
            )}


        </section>


        <section class="after-dark-fallout-grid">


            <article class="after-dark-fallout-panel">


                <span>
                    TITLE WATCH
                </span>


                <h3>
                    Championship Movement
                </h3>


                ${afterDarkListHtml(

                    episode.titleChanges,

                    "No championship changes this week."

                )}


            </article>


            <article class="after-dark-fallout-panel">


                <span>
                    STORY FALLOUT
                </span>


                <h3>
                    What Changed
                </h3>


                ${afterDarkListHtml(

                    episode.storyFallout,

                    "No major storyline fallout was recorded."

                )}


            </article>


            <article class="after-dark-fallout-panel">


                <span>
                    POWER SHIFTS
                </span>


                <h3>
                    Stock Rising and Falling
                </h3>


                ${afterDarkListHtml(

                    episode.powerShifts,

                    "No major power shift was recorded."

                )}


            </article>


        </section>


        ${
            episode.closingNote

                ? `

                    <footer class="after-dark-closing-note">


                        <span>
                            FINAL WORD
                        </span>


                        <p>

                            ${afterDarkEscape(
                                episode.closingNote
                            )}

                        </p>


                    </footer>

                `

                : ""
        }

    `;


    afterDarkEls
        .episode
        .appendChild(
            article
        );

}



// =================================
// ARCHIVE
// =================================


function afterDarkRenderArchive(
    episodes,
    activeEpisodeId
) {


    afterDarkEls
        .archiveGrid
        .innerHTML =
            "";


    if (
        !episodes.length
    ) {


        afterDarkEls
            .emptyArchive
            .hidden =
                false;


        return;

    }


    afterDarkEls
        .emptyArchive
        .hidden =
            true;


    episodes.forEach(

        episode => {


            const link =

                document.createElement(
                    "a"
                );


            link.className =

                episode.id ===
                activeEpisodeId

                    ? "after-dark-archive-card active"

                    : "after-dark-archive-card";


            link.href =

                `owl-after-dark.html?episode=${encodeURIComponent(
                    episode.id
                )}`;


            link.innerHTML = `

                <span>

                    EPISODE

                    ${afterDarkEscape(
                        episode.episode || "—"
                    )}

                </span>


                <h3>

                    ${afterDarkEscape(
                        episode.headline ||
                        "OWL After Dark"
                    )}

                </h3>


                <p>

                    ${afterDarkEscape(
                        episode.label || ""
                    )}

                </p>


                <strong>
                    WATCH THE RECAP →
                </strong>

            `;


            afterDarkEls
                .archiveGrid
                .appendChild(
                    link
                );

        }

    );

}



// =================================
// LOAD
// =================================


async function afterDarkLoad() {


    try {


        const index =

            await afterDarkFetchJson(

                "data/after-dark/archive-index.json"

            );


        const episodes =

            afterDarkArray(
                index.episodes
            );


        episodes.sort(

            (
                a,
                b
            ) =>

                String(
                    b.id
                )

                    .localeCompare(

                        String(
                            a.id
                        )

                    )

        );


        if (
            !episodes.length
        ) {


            afterDarkRenderArchive(
                [],
                ""
            );


            afterDarkEls
                .emptyEpisode
                .hidden =
                    false;


            return;

        }


        const params =

            new URLSearchParams(
                window.location.search
            );


        const requestedEpisode =

            params.get(
                "episode"
            );


        const selected =

            episodes.find(

                episode =>

                    episode.id ===
                    requestedEpisode

            )

            ||

            episodes[0];


        afterDarkRenderArchive(

            episodes,

            selected.id

        );


        const episode =

            await afterDarkFetchJson(
                selected.file
            );


        afterDarkRenderEpisode(
            episode
        );

    }


    catch (
        error
    ) {


        console.error(

            "Could not load OWL After Dark:",

            error

        );


        afterDarkEls
            .emptyEpisode
            .hidden =
                false;


        afterDarkEls
            .emptyArchive
            .hidden =
                false;

    }

}



// =================================
// START
// =================================


afterDarkLoad();
