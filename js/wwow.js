// =================================
// THE WONDERFUL WORLD OF WRESTLING
// MONTHLY ISSUE READER
// =================================


const wwowEls = {

    currentLabel:
        document.getElementById(
            "wwow-current-label"
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
// HELPERS
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



async function wwowFetchJson(
    path
) {

    const response =
        await fetch(

            path,

            {

                cache:
                    "no-store"

            }

        );


    if (
        !response.ok
    ) {

        throw new Error(

            `Could not load ${path}`

        );

    }


    return response.json();

}



// =================================
// ARCHIVE
// =================================


function wwowRenderArchive(
    issues
) {

    wwowEls.archiveGrid.innerHTML =
        "";


    if (
        !issues.length
    ) {

        wwowEls.emptyArchive.hidden =
            false;


        return;

    }


    wwowEls.emptyArchive.hidden =
        true;


    issues.forEach(

        issue => {

            const link =
                document.createElement(
                    "a"
                );


            link.className =
                "social-archive-link";


            link.href =

                `wwow.html?issue=${encodeURIComponent(
                    issue.id
                )}`;


            link.innerHTML = `

                <strong>

                    ${wwowEscape(
                        issue.label
                    )}

                </strong>


                <span>

                    ${wwowEscape(
                        issue.coverTitle
                        || "Monthly Issue"
                    )}

                </span>

            `;


            wwowEls.archiveGrid
                .appendChild(
                    link
                );

        }

    );

}



// =================================
// ISSUE
// =================================


function wwowRenderIssue(
    issue
) {

    wwowEls.issue.innerHTML =
        "";


    wwowEls.emptyIssue.hidden =
        true;


    wwowEls.currentLabel.textContent =

        issue.label

        ||

        "Latest Issue";


    const cover =
        document.createElement(
            "article"
        );


    cover.className =
        "wwow-cover";


    cover.innerHTML = `

        <div class="wwow-cover-meta">

            ${wwowEscape(
                issue.label || ""
            )}

            ${issue.volume
                ? ` · VOL. ${wwowEscape(
                    issue.volume
                )}`
                : ""
            }

            ${issue.issue
                ? ` · ISSUE ${wwowEscape(
                    issue.issue
                )}`
                : ""
            }

        </div>


        <h2>

            ${wwowEscape(
                issue.coverTitle
                || "The Wonderful World of Wrestling"
            )}

        </h2>


        <p>

            ${wwowEscape(
                issue.coverDeck || ""
            )}

        </p>

    `;


    wwowEls.issue
        .appendChild(
            cover
        );


    const sections =

        Array.isArray(
            issue.sections
        )

            ? issue.sections

            : [];


    sections.forEach(

        section => {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "wwow-article-section";


            const paragraphs =

                Array.isArray(
                    section.body
                )

                    ? section.body

                    : [];


            article.innerHTML = `

                <span class="wwow-article-kicker">

                    ${wwowEscape(
                        section.kicker || ""
                    )}

                </span>


                <h3>

                    ${wwowEscape(
                        section.title || ""
                    )}

                </h3>


                ${paragraphs

                    .map(

                        paragraph => `

                            <p>

                                ${wwowEscape(
                                    paragraph
                                )}

                            </p>

                        `

                    )

                    .join(
                        ""
                    )
                }

            `;


            wwowEls.issue
                .appendChild(
                    article
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


        wwowRenderArchive(
            issues
        );


        if (
            !issues.length
        ) {

            wwowEls.emptyIssue.hidden =
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


        wwowEls.emptyIssue.hidden =
            false;


        wwowEls.emptyArchive.hidden =
            false;

    }

}



// =================================
// START
// =================================


wwowLoad();
