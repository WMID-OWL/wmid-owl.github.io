// =================================
// SUNDAY DISSERVICE
// WEEKLY SERMON READER
// =================================


// =================================
// ELEMENTS
// =================================


const sundayDisserviceEls = {


    currentLabel:

        document.getElementById(
            "sunday-disservice-current-label"
        ),


    sermon:

        document.getElementById(
            "sunday-disservice-sermon"
        ),


    emptySermon:

        document.getElementById(
            "sunday-disservice-empty-sermon"
        ),


    archiveGrid:

        document.getElementById(
            "sunday-disservice-archive-grid"
        ),


    emptyArchive:

        document.getElementById(
            "sunday-disservice-empty-archive"
        )

};



// =================================
// HTML SAFETY
// =================================


function sundayDisserviceEscape(
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


async function sundayDisserviceFetchJson(
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


function sundayDisserviceArray(
    value
) {


    return Array.isArray(
        value
    )

        ? value

        : [];

}



// =================================
// PARAGRAPHS
// =================================


function sundayDisserviceParagraphsHtml(
    paragraphs
) {


    return sundayDisserviceArray(
        paragraphs
    )

        .map(

            paragraph => `

                <p>

                    ${sundayDisserviceEscape(
                        paragraph
                    )}

                </p>

            `

        )

        .join(
            ""
        );

}



// =================================
// EDITORIAL COLLECTION
// =================================


function sundayDisserviceCollectionHtml(
    label,
    heading,
    items,
    emptyText
) {


    const entries =

        sundayDisserviceArray(
            items
        );


    return `

        <section class="sunday-disservice-collection">


            <header>


                <span>

                    ${sundayDisserviceEscape(
                        label
                    )}

                </span>


                <h3>

                    ${sundayDisserviceEscape(
                        heading
                    )}

                </h3>


            </header>


            ${
                entries.length

                    ? `

                        <div class="sunday-disservice-collection-list">

                            ${entries

                                .map(

                                    item => `

                                        <article>


                                            <h4>

                                                ${sundayDisserviceEscape(

                                                    typeof item ===
                                                    "string"

                                                        ? item

                                                        : item.title || ""

                                                )}

                                            </h4>


                                            ${
                                                typeof item !==
                                                "string"

                                                &&

                                                item.body

                                                    ? `

                                                        <p>

                                                            ${sundayDisserviceEscape(
                                                                item.body
                                                            )}

                                                        </p>

                                                    `

                                                    : ""
                                            }


                                        </article>

                                    `

                                )

                                .join(
                                    ""
                                )}

                        </div>

                    `

                    : `

                        <p class="sunday-disservice-list-empty">

                            ${sundayDisserviceEscape(
                                emptyText
                            )}

                        </p>

                    `
            }


        </section>

    `;

}



// =================================
// FAVORITES / BLIND SPOTS
// =================================


function sundayDisserviceBiasHtml(
    favorites,
    blindSpots
) {


    return `

        <section class="sunday-disservice-bias-grid">


            ${sundayDisserviceCollectionHtml(

                "TREY APPROVES",

                "The Favorites",

                favorites,

                "Trey declined to grant his approval this week."

            )}


            ${sundayDisserviceCollectionHtml(

                "OBJECTIVITY NOT GUARANTEED",

                "The Blind Spots",

                blindSpots,

                "No blind spot was admitted. Naturally."

            )}


        </section>

    `;

}



// =================================
// REFERENCES
// =================================


function sundayDisserviceReferencesHtml(
    references
) {


    const entries =

        sundayDisserviceArray(
            references
        );


    if (
        !entries.length
    ) {


        return "";

    }


    return `

        <section class="sunday-disservice-references">


            <span>
                CITED FROM THE PULPIT
            </span>


            <h3>
                Referenced This Week
            </h3>


            <div>

                ${entries

                    .map(

                        reference => {


                            const label =

                                typeof reference ===
                                "string"

                                    ? reference

                                    : reference.label || "";


                            const type =

                                typeof reference ===
                                "string"

                                    ? "REFERENCE"

                                    : reference.type || "REFERENCE";


                            const href =

                                typeof reference ===
                                "string"

                                    ? ""

                                    : reference.href || "";


                            if (
                                href
                            ) {


                                return `

                                    <a href="${sundayDisserviceEscape(
                                        href
                                    )}">

                                        <span>

                                            ${sundayDisserviceEscape(
                                                type
                                            )}

                                        </span>

                                        <strong>

                                            ${sundayDisserviceEscape(
                                                label
                                            )}

                                        </strong>

                                    </a>

                                `;

                            }


                            return `

                                <div>

                                    <span>

                                        ${sundayDisserviceEscape(
                                            type
                                        )}

                                    </span>

                                    <strong>

                                        ${sundayDisserviceEscape(
                                            label
                                        )}

                                    </strong>

                                </div>

                            `;

                        }

                    )

                    .join(
                        ""
                    )}

            </div>


        </section>

    `;

}



// =================================
// SERMON
// =================================


function sundayDisserviceRenderSermon(
    sermon
) {


    sundayDisserviceEls
        .sermon
        .innerHTML =
            "";


    sundayDisserviceEls
        .emptySermon
        .hidden =
            true;


    sundayDisserviceEls
        .currentLabel
        .textContent =

            sermon.label

            ||

            "Latest Sermon";


    const article =

        document.createElement(
            "article"
        );


    article.className =
        "sunday-disservice-sermon-package";


    const argument =

        sermon.argument

        ||

        {};


    article.innerHTML = `

        <header class="sunday-disservice-sermon-hero">


            <div>


                <span class="sunday-disservice-sermon-number">

                    SERMON

                    ${sundayDisserviceEscape(
                        sermon.sermon || "—"
                    )}

                </span>


                <h2>

                    ${sundayDisserviceEscape(
                        sermon.headline ||
                        "Sunday Disservice"
                    )}

                </h2>


                <p>

                    ${sundayDisserviceEscape(
                        sermon.deck || ""
                    )}

                </p>


            </div>


            <aside class="sunday-disservice-sermon-meta">


                <span>
                    DELIVERED
                </span>


                <strong>

                    ${sundayDisserviceEscape(
                        sermon.label || ""
                    )}

                </strong>


                <small>
                    THE GOSPEL ACCORDING TO TREY WISE
                </small>


            </aside>


        </header>


        <section class="sunday-disservice-main-argument">


            <span>
                THIS WEEK’S GOSPEL
            </span>


            <h3>

                ${sundayDisserviceEscape(
                    argument.title ||
                    "The Weekly Argument"
                )}

            </h3>


            <div>

                ${sundayDisserviceParagraphsHtml(
                    argument.body
                )}

            </div>


        </section>


        <section class="sunday-disservice-verdict-grid">


            ${sundayDisserviceCollectionHtml(

                "PRAISE BE",

                "What Trey Praised",

                sermon.praise,

                "No praise was issued this week."

            )}


            ${sundayDisserviceCollectionHtml(

                "HERESY OF THE WEEK",

                "What Trey Condemned",

                sermon.condemnation,

                "No condemnation was issued this week."

            )}


        </section>


        ${sundayDisserviceBiasHtml(

            sermon.favorites,

            sermon.blindSpots

        )}


        ${sundayDisserviceReferencesHtml(
            sermon.references
        )}


        ${
            sermon.closingWord

                ? `

                    <footer class="sunday-disservice-closing-word">


                        <span>
                            THE BENEDICTION
                        </span>


                        <p>

                            ${sundayDisserviceEscape(
                                sermon.closingWord
                            )}

                        </p>


                        <strong>
                            — TREY WISE
                        </strong>


                    </footer>

                `

                : ""
        }

    `;


    sundayDisserviceEls
        .sermon
        .appendChild(
            article
        );

}



// =================================
// ARCHIVE
// =================================


function sundayDisserviceRenderArchive(
    sermons,
    activeSermonId
) {


    sundayDisserviceEls
        .archiveGrid
        .innerHTML =
            "";


    if (
        !sermons.length
    ) {


        sundayDisserviceEls
            .emptyArchive
            .hidden =
                false;


        return;

    }


    sundayDisserviceEls
        .emptyArchive
        .hidden =
            true;


    sermons.forEach(

        sermon => {


            const link =

                document.createElement(
                    "a"
                );


            link.className =

                sermon.id ===
                activeSermonId

                    ? "sunday-disservice-archive-card active"

                    : "sunday-disservice-archive-card";


            link.href =

                `sunday-disservice.html?sermon=${encodeURIComponent(
                    sermon.id
                )}`;


            link.innerHTML = `

                <span>

                    SERMON

                    ${sundayDisserviceEscape(
                        sermon.sermon || "—"
                    )}

                </span>


                <h3>

                    ${sundayDisserviceEscape(

                        sermon.headline

                        ||

                        "The Gospel According to Trey Wise"

                    )}

                </h3>


                <p>

                    ${sundayDisserviceEscape(
                        sermon.label || ""
                    )}

                </p>


                <strong>
                    READ THE SERMON →
                </strong>

            `;


            sundayDisserviceEls
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


async function sundayDisserviceLoad() {


    try {


        const index =

            await sundayDisserviceFetchJson(

                "data/sunday-disservice/archive-index.json"

            );


        const sermons =

            sundayDisserviceArray(
                index.sermons
            );


        sermons.sort(

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
            !sermons.length
        ) {


            sundayDisserviceRenderArchive(
                [],
                ""
            );


            sundayDisserviceEls
                .emptySermon
                .hidden =
                    false;


            return;

        }


        const params =

            new URLSearchParams(
                window.location.search
            );


        const requestedSermon =

            params.get(
                "sermon"
            );


        const selected =

            sermons.find(

                sermon =>

                    sermon.id ===
                    requestedSermon

            )

            ||

            sermons[0];


        sundayDisserviceRenderArchive(

            sermons,

            selected.id

        );


        const sermon =

            await sundayDisserviceFetchJson(
                selected.file
            );


        sundayDisserviceRenderSermon(
            sermon
        );

    }


    catch (
        error
    ) {


        console.error(

            "Could not load Sunday Disservice:",

            error

        );


        sundayDisserviceEls
            .emptySermon
            .hidden =
                false;


        sundayDisserviceEls
            .emptyArchive
            .hidden =
                false;

    }

}



// =================================
// START
// =================================


sundayDisserviceLoad();
