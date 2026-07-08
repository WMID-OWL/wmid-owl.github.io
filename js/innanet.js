// =================================
// THE INNANET
// MONTHLY ARCHIVE READER
// =================================


const innanetEls = {

    month:
        document.getElementById(
            "innanet-current-month"
        ),

    feed:
        document.getElementById(
            "innanet-feed"
        ),

    emptyFeed:
        document.getElementById(
            "innanet-empty-feed"
        ),

    archiveGrid:
        document.getElementById(
            "innanet-archive-grid"
        ),

    emptyArchive:
        document.getElementById(
            "innanet-empty-archive"
        )

};



// =================================
// HELPERS
// =================================


function innanetEscape(
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



async function innanetFetchJson(
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


function innanetRenderArchive(
    months
) {

    innanetEls.archiveGrid.innerHTML =
        "";


    if (
        !months.length
    ) {

        innanetEls.emptyArchive.hidden =
            false;


        return;

    }


    innanetEls.emptyArchive.hidden =
        true;


    months.forEach(

        month => {

            const link =
                document.createElement(
                    "a"
                );


            link.className =
                "social-archive-link";


            link.href =

                `innanet.html?month=${encodeURIComponent(
                    month.id
                )}`;


            link.innerHTML = `

                <strong>

                    ${innanetEscape(
                        month.label
                    )}

                </strong>


                <span>

                    ${Number(
                        month.showCount || 0
                    )} Shows ·

                    ${Number(
                        month.postCount || 0
                    )} Posts

                </span>

            `;


            innanetEls.archiveGrid
                .appendChild(
                    link
                );

        }

    );

}



// =================================
// POST
// =================================


function innanetCreatePost(
    post,
    postMap
) {

    const parent =

        post.replyTo

            ? postMap[
                post.replyTo
            ]

            : null;


    const article =
        document.createElement(
            "article"
        );


    article.className =

        parent

            ? "innanet-post innanet-post-reply"

            : "innanet-post";


    const replyContext =

        parent

            ? `

                <div class="innanet-reply-context">

                    Replying to

                    <strong>

                        ${innanetEscape(
                            parent.handle
                            ||
                            parent.accountName
                            ||
                            "post"
                        )}

                    </strong>

                </div>

            `

            : "";


    article.innerHTML = `

        <div class="innanet-post-header">


            <span class="innanet-post-name">

                ${innanetEscape(
                    post.accountName
                    || post.handle
                    || "Anonymous"
                )}

            </span>


            <span class="innanet-post-handle">

                ${innanetEscape(
                    post.handle || ""
                )}

            </span>


            <span class="innanet-post-role">

                ${innanetEscape(
                    post.type
                    || post.role
                    || "fan-post"
                )}

            </span>


        </div>


        ${replyContext}


        <p class="innanet-post-body">

${innanetEscape(
    post.body || ""
)}

        </p>


        <div class="innanet-post-stats">


            <span>

                ${Number(
                    post.replies || 0
                )} Replies

            </span>


            <span>

                ${Number(
                    post.reposts || 0
                )} Reposts

            </span>


            <span>

                ${Number(
                    post.likes || 0
                )} Likes

            </span>


        </div>

    `;


    return article;

}


// =================================
// FEED
// =================================


function innanetRenderMonth(
    monthData
) {

    innanetEls.feed.innerHTML =
        "";


    innanetEls.month.textContent =

        monthData.label

        ||

        "Current Feed";


    const events =

        Array.isArray(
            monthData.events
        )

            ? monthData.events

            : [];


    const totalPosts =
        events.reduce(

            (
                total,
                event
            ) =>

                total

                +

                (
                    Array.isArray(
                        event.posts
                    )

                        ? event.posts.length

                        : 0
                ),

            0

        );


    if (
        totalPosts === 0
    ) {

        innanetEls.emptyFeed.hidden =
            false;


        return;

    }


    innanetEls.emptyFeed.hidden =
        true;


    events.forEach(

        event => {

            const posts =

                Array.isArray(
                    event.posts
                )

                    ? event.posts

                    : [];


            if (
                !posts.length
            ) {

                return;

            }


            const group =
                document.createElement(
                    "section"
                );


            group.className =
                "innanet-event-group";


            const heading =
                document.createElement(
                    "div"
                );


            heading.className =
                "innanet-event-heading";


            heading.innerHTML = `

                <strong>

                    ${innanetEscape(
                        event.eventName
                        || "OWL Event"
                    )}

                </strong>


                <span>

                    ${innanetEscape(
                        event.date || ""
                    )}

                </span>

            `;


            group.appendChild(
                heading
            );


            const postMap =
    Object.fromEntries(

        posts.map(

            post => [

                post.postId,

                post

            ]

        )

    );


posts.forEach(

    post => {

        group.appendChild(

            innanetCreatePost(

                post,

                postMap

            )

        );

    }

);


            innanetEls.feed
                .appendChild(
                    group
                );

        }

    );

}



// =================================
// LOAD
// =================================


async function innanetLoad() {

    try {


        const index =
            await innanetFetchJson(

                "data/innanet/archive-index.json"

            );


        const months =

            Array.isArray(
                index.months
            )

                ? [...index.months]

                : [];


        months.sort(

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


        innanetRenderArchive(
            months
        );


        if (
            !months.length
        ) {

            innanetEls.emptyFeed.hidden =
                false;


            return;

        }


        const params =
            new URLSearchParams(

                window.location.search

            );


        const requestedMonth =
            params.get(
                "month"
            );


        const selected =

            months.find(

                month =>

                    month.id ===
                        requestedMonth

            )

            ||

            months[0];


        const monthData =
            await innanetFetchJson(

                selected.file

            );


        innanetRenderMonth(
            monthData
        );

    }


    catch (
        error
    ) {


        console.error(

            "Could not load The Innanet:",

            error

        );


        innanetEls.emptyFeed.hidden =
            false;


        innanetEls.emptyArchive.hidden =
            false;

    }

}



// =================================
// START
// =================================


innanetLoad();
