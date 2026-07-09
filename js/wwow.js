// =================================
// THE WONDERFUL WORLD OF WRESTLING
// DIGITAL MAGAZINE READER
// =================================


// =================================
// ELEMENTS
// =================================


const wwowEls = {


    currentLabel:

        document.getElementById(
            "wwow-current-label"
        ),


    sidebarIssueLabel:

        document.getElementById(
            "wwow-sidebar-issue-label"
        ),


    sidebarVolume:

        document.getElementById(
            "wwow-sidebar-volume"
        ),


    tableOfContents:

        document.getElementById(
            "wwow-table-of-contents"
        ),


    issue:

        document.getElementById(
            "wwow-issue"
        ),


    emptyIssue:

        document.getElementById(
            "wwow-empty-issue"
        ),


    archiveGrid:

        document.getElementById(
            "wwow-archive-grid"
        ),


    emptyArchive:

        document.getElementById(
            "wwow-empty-archive"
        )

};



// =================================
// HTML SAFETY
// =================================


function wwowEscape(
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


async function wwowFetchJson(
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
// ID HELPER
// =================================


function wwowSectionAnchor(
    section,
    index
) {


    const source =

        section.sectionId

        ||

        section.title

        ||

        `section-${index + 1}`;


    return (

        `wwow-story-${String(

            source

        )

            .toLowerCase()

            .replace(
                /[^a-z0-9]+/g,
                "-"
            )

            .replace(
                /^-|-$/g,
                ""
            )}`

    );

}



// =================================
// SECTION NUMBER
// =================================


function wwowSectionNumber(
    index
) {


    return String(

        index + 1

    ).padStart(
        2,
        "0"
    );

}



// =================================
// READING TIME
// =================================


function wwowReadingTime(
    paragraphs
) {


    const words =

        paragraphs

            .join(
                " "
            )

            .trim()

            .split(
                /\s+/
            )

            .filter(
                Boolean
            )
            .length;


    return Math.max(

        1,

        Math.ceil(
            words / 220
        )

    );

}



// =================================
// PULL QUOTE
// =================================


function wwowPullQuote(
    paragraphs
) {


    const sentences =

        paragraphs

            .flatMap(

                paragraph =>

                    String(
                        paragraph || ""
                    )
                        .match(
                            /[^.!?]+[.!?]+/g
                        )

                    ||

                    [
                        paragraph
                    ]

            )

            .map(

                sentence =>
                    sentence.trim()

            )

            .filter(

                sentence =>

                    sentence.length >= 55

                    &&

                    sentence.length <= 210

            );


    if (
        sentences.length
    ) {


        return sentences[
            Math.min(
                1,
                sentences.length - 1
            )
        ];

    }


    const fallback =

        String(
            paragraphs[0] || ""
        );


    return fallback.length > 190

        ? `${fallback.slice(
            0,
            187
        )}...`

        : fallback;

}



// =================================
// TABLE OF CONTENTS
// =================================


function wwowRenderContents(
    sections
) {


    wwowEls
        .tableOfContents
        .innerHTML =
            "";


    sections.forEach(

        (
            section,
            index
        ) => {


            const link =

                document.createElement(
                    "a"
                );


            link.href =

                `#${wwowSectionAnchor(

                    section,

                    index

                )}`;


            link.innerHTML = `

                <span>
                    ${wwowSectionNumber(
                        index
                    )}
                </span>


                <strong>

                    ${wwowEscape(

                        section.title

                        ||

                        section.kicker

                        ||

                        "Story"

                    )}

                </strong>

            `;


            wwowEls
                .tableOfContents
                .appendChild(
                    link
                );

        }

    );

}



// =================================
// ARCHIVE
// =================================


function wwowRenderArchive(
    issues,
    activeIssueId
) {


    wwowEls
        .archiveGrid
        .innerHTML =
            "";


    if (
        !issues.length
    ) {


        wwowEls
            .emptyArchive
            .hidden =
                false;


        return;

    }


    wwowEls
        .emptyArchive
        .hidden =
            true;


    issues.forEach(

        (
            issue,
            index
        ) => {


            const link =

                document.createElement(
                    "a"
                );


            link.className =

                issue.id === activeIssueId

                    ? "wwow-archive-issue active"

                    : "wwow-archive-issue";


            link.href =

                `wwow.html?issue=${encodeURIComponent(

                    issue.id

                )}`;


            const issueNumber =

                Number(
                    issue.issue || 0
                )

                    ? `ISSUE ${String(

                        issue.issue

                    ).padStart(
                        2,
                        "0"
                    )}`

                    : `ARCHIVE ${String(

                        index + 1

                    ).padStart(
                        2,
                        "0"
                    )}`;


            link.innerHTML = `

                <div class="wwow-archive-cover-top">


                    <span>
                        THE WONDERFUL WORLD
                    </span>


                    <strong>
                        OF WRESTLING
                    </strong>


                </div>



                <div class="wwow-archive-cover-story">


                    <span>

                        ${wwowEscape(
                            issue.label
                        )}

                    </span>


                    <h3>

                        ${wwowEscape(

                            issue.coverTitle

                            ||

                            "Monthly Issue"

                        )}

                    </h3>


                </div>



                <div class="wwow-archive-cover-bottom">


                    <span>
                        ${wwowEscape(
                            issueNumber
                        )}
                    </span>


                    <b>
                        READ →
                    </b>


                </div>

            `;


            wwowEls
                .archiveGrid
                .appendChild(
                    link
                );

        }

    );

}



// =================================
// COVER STORY
// =================================


function wwowCreateCover(
    issue,
    sections
) {


    const cover =

        document.createElement(
            "article"
        );


    cover.className =
        "wwow-cover-package";


    const firstSection =

        sections[0]

        ||

        null;


    cover.innerHTML = `

        <div class="wwow-cover-eyebrow">


            <span>
                COVER STORY
            </span>


            <span>

                ${wwowEscape(
                    issue.label || ""
                )}

            </span>


        </div>



        <div class="wwow-cover-main">


            <div class="wwow-cover-copy">


                <span class="wwow-cover-kicker">

                    THIS MONTH IN WRESTLING

                </span>


                <h1>

                    ${wwowEscape(

                        issue.coverTitle

                        ||

                        "The Wonderful World of Wrestling"

                    )}

                </h1>


                <p>

                    ${wwowEscape(
                        issue.coverDeck || ""
                    )}

                </p>


                ${
                    firstSection

                        ? `

                            <a
                                class="wwow-cover-read-link"
                                href="#${wwowSectionAnchor(
                                    firstSection,
                                    0
                                )}"
                            >
                                READ THE COVER STORY
                                <span>↓</span>
                            </a>

                        `

                        : ""
                }


            </div>



            <aside class="wwow-cover-edition-card">


                <span>
                    EDITION
                </span>


                <strong>

                    ${wwowEscape(
                        issue.label || ""
                    )}

                </strong>


                <div>


                    <span>

                        VOL.
                        ${wwowEscape(
                            issue.volume || "1"
                        )}

                    </span>


                    <span>

                        ISSUE
                        ${wwowEscape(
                            issue.issue || "1"
                        )}

                    </span>


                </div>


                <small>

                    ${sections.length}
                    STORIES

                </small>


            </aside>


        </div>

    `;


    return cover;

}



// =================================
// ARTICLE
// =================================


function wwowCreateArticle(
    section,
    index
) {


    const paragraphs =

        Array.isArray(
            section.body
        )

            ? section.body

            : [];


    const anchor =

        wwowSectionAnchor(

            section,

            index

        );


    const article =

        document.createElement(
            "article"
        );


    article.id =
        anchor;


    article.className =

        index === 0

            ? "wwow-story wwow-story-feature"

            : index % 3 === 0

                ? "wwow-story wwow-story-wide"

                : "wwow-story";


    const pullQuote =

        wwowPullQuote(
            paragraphs
        );


    const bodyHtml =

        paragraphs

            .map(

                (
                    paragraph,
                    paragraphIndex
                ) => {


                    const dropCapClass =

                        paragraphIndex === 0

                            ? "wwow-story-paragraph wwow-drop-cap"

                            : "wwow-story-paragraph";


                    return `

                        <p class="${dropCapClass}">

                            ${wwowEscape(
                                paragraph
                            )}

                        </p>

                    `;

                }

            )

            .join(
                ""
            );


    article.innerHTML = `

        <header class="wwow-story-header">


            <div class="wwow-story-number">

                ${wwowSectionNumber(
                    index
                )}

            </div>



            <div>


                <span class="wwow-story-kicker">

                    ${wwowEscape(
                        section.kicker || ""
                    )}

                </span>


                <h2>

                    ${wwowEscape(
                        section.title || ""
                    )}

                </h2>


                <div class="wwow-story-meta">


                    <span>
                        WWoW EDITORIAL
                    </span>


                    <span>
                        ${wwowReadingTime(
                            paragraphs
                        )} MIN READ
                    </span>


                </div>


            </div>


        </header>



        <div class="wwow-story-rule">
        </div>



        <div class="wwow-story-reading-layout">


            <div class="wwow-story-body">

                ${bodyHtml}

            </div>



            ${
                pullQuote

                    ? `

                        <aside class="wwow-pull-quote">


                            <span>
                                “
                            </span>


                            <blockquote>

                                ${wwowEscape(
                                    pullQuote
                                )}

                            </blockquote>


                        </aside>

                    `

                    : ""
            }


        </div>

    `;


    return article;

}



// =================================
// ISSUE
// =================================


function wwowRenderIssue(
    issue
) {


    wwowEls
        .issue
        .innerHTML =
            "";


    wwowEls
        .emptyIssue
        .hidden =
            true;


    wwowEls
        .currentLabel
        .textContent =

            issue.label

            ||

            "Latest Issue";


    wwowEls
        .sidebarIssueLabel
        .textContent =

            issue.label

            ||

            "Latest Issue";


    wwowEls
        .sidebarVolume
        .textContent =

            `VOL. ${issue.volume || 1} · ISSUE ${issue.issue || 1}`;


    const sections =

        Array.isArray(
            issue.sections
        )

            ? issue.sections

            : [];


    wwowRenderContents(
        sections
    );


    wwowEls
        .issue
        .appendChild(

            wwowCreateCover(

                issue,

                sections

            )

        );


    const divider =

        document.createElement(
            "div"
        );


    divider.className =
        "wwow-reading-banner";


    divider.innerHTML = `

        <span>
            THE ISSUE
        </span>


        <strong>
            STORIES, ANALYSIS & OPINION
        </strong>


        <span>
            ${wwowEscape(
                issue.label || ""
            )}
        </span>

    `;


    wwowEls
        .issue
        .appendChild(
            divider
        );


    sections.forEach(

        (
            section,
            index
        ) => {


            wwowEls
                .issue
                .appendChild(

                    wwowCreateArticle(

                        section,

                        index

                    )

                );

        }

    );

}



// =================================
// LOAD
// =================================


async function wwowLoad() {


    try {


        const index =

            await wwowFetchJson(

                "data/wwow/archive-index.json"

            );


        const issues =

            Array.isArray(
                index.issues
            )

                ? [...index.issues]

                : [];


        issues.sort(

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
            !issues.length
        ) {


            wwowRenderArchive(
                [],
                ""
            );


            wwowEls
                .emptyIssue
                .hidden =
                    false;


            return;

        }


        const params =

            new URLSearchParams(

                window.location.search

            );


        const requestedIssue =

            params.get(
                "issue"
            );


        const selected =

            issues.find(

                issue =>

                    issue.id ===
                    requestedIssue

            )

            ||

            issues[0];


        wwowRenderArchive(

            issues,

            selected.id

        );


        const issue =

            await wwowFetchJson(

                selected.file

            );


        wwowRenderIssue(
            issue
        );

    }


    catch (
        error
    ) {


        console.error(

            "Could not load WWoW:",

            error

        );


        wwowEls
            .emptyIssue
            .hidden =
                false;


        wwowEls
            .emptyArchive
            .hidden =
                false;

    }

}



// =================================
// START
// =================================


wwowLoad();
