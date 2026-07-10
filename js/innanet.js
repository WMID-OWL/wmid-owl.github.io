// =================================
// THE INNANET
// SOCIAL APP READER
// =================================


// =================================
// ELEMENTS
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
        ),


    trendingList:

        document.getElementById(
            "innanet-trending-list"
        ),


    timelineCount:

        document.getElementById(
            "innanet-timeline-count"
        )

};



// =================================
// HTML SAFETY
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



// =================================
// FETCH JSON
// =================================


async function innanetFetchJson(
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
// ACCOUNT INITIALS
// =================================


function innanetInitials(
    name,
    handle
) {


    const source =

        String(

            name

            ||

            handle

            ||

            "IN"

        )

            .replace(
                /^@/,
                ""
            )

            .trim();


    const words =

        source

            .split(
                /\s+/
            )

            .filter(
                Boolean
            );


    if (
        words.length >= 2
    ) {


        return (

            words[0][0]

            +

            words[1][0]

        ).toUpperCase();

    }


    return source

        .slice(
            0,
            2
        )

        .toUpperCase();

}



// =================================
// AVATAR HUE
// =================================


function innanetAvatarHue(
    value
) {


    const text =

        String(
            value || "innanet"
        );


    let hash =
        0;


    for (
        let index = 0;

        index < text.length;

        index += 1
    ) {


        hash =

            (
                hash * 31

                +

                text.charCodeAt(
                    index
                )
            )

            %

            360;

    }


    return Math.abs(
        hash
    );

}



// =================================
// POST TYPE LABEL
// =================================


function innanetTypeLabel(
    type
) {


    const labels = {


        "fan-post":
            "FAN",


        "stats-post":
            "STATS",


        "news-report":
            "NEWS",


        "opinion":
            "OPINION",


        "rumor":
            "RUMOR",


        "satire":
            "SATIRE",


        "wrestler-post":
            "WRESTLER"

    };


    return labels[
        type
    ]

    ||

    String(
        type || "POST"
    )
        .replaceAll(
            "-",
            " "
        )
        .toUpperCase();

}



// =================================
// DATE DISPLAY
// =================================


function innanetFormatDate(
    dateString
) {


    if (
        !dateString
    ) {


        return "";

    }


    const date =

        new Date(

            `${dateString}T00:00:00Z`

        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {


        return dateString;

    }


    return date.toLocaleDateString(

        "en-US",

        {

            month:
                "short",

            day:
                "numeric",

            year:
                "numeric",

            timeZone:
                "UTC"

        }

    );

}



// =================================
// ENGAGEMENT SCORE
// =================================


function innanetEngagementScore(
    post
) {


    return (

        Number(
            post.likes || 0
        )

        +

        (
            Number(
                post.reposts || 0
            )

            *

            2
        )

        +

        (
            Number(
                post.replies || 0
            )

            *

            2
        )

    );

}



// =================================
// ARCHIVE
// =================================


function innanetRenderArchive(
    months,
    activeMonthId
) {


    innanetEls
        .archiveGrid
        .innerHTML =
            "";


    if (
        !months.length
    ) {


        innanetEls
            .emptyArchive
            .hidden =
                false;


        return;

    }


    innanetEls
        .emptyArchive
        .hidden =
            true;


    months.forEach(

        month => {


            const link =

                document.createElement(
                    "a"
                );


            link.className =

                month.id === activeMonthId

                    ? "innanet-archive-chip active"

                    : "innanet-archive-chip";


            link.href =

                `innanet.html?month=${encodeURIComponent(

                    month.id

                )}`;


            link.innerHTML = `

                <div>

                    <strong>
                        ${innanetEscape(
                            month.label
                        )}
                    </strong>

                                        <span>

                        ${Number(
                            month.showCount || 0
                        )}

                        ${

                            Number(
                                month.showCount || 0
                            ) === 1

                                ? "Show"

                                : "Shows"

                        }


                        ${

                            Number(
                                month.pulseCount || 0
                            ) > 0

                                ? ` · ${Number(
                                    month.pulseCount || 0
                                )} ${

                                    Number(
                                        month.pulseCount || 0
                                    ) === 1

                                        ? "Pulse"

                                        : "Pulses"

                                }`

                                : ""

                        }

                    </span>

                </div>


                <b>
                    ${Number(
                        month.postCount || 0
                    )}
                </b>

            `;


            innanetEls
                .archiveGrid
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


    const accountIdentity =

        post.accountId

        ||

        post.wrestlerId

        ||

        post.handle

        ||

        post.accountName;


    const initials =

        innanetInitials(

            post.accountName,

            post.handle

        );


    const avatarHue =

        innanetAvatarHue(
            accountIdentity
        );


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

        <div
            class="innanet-avatar"
            style="--innanet-avatar-hue: ${avatarHue};"
        >

            ${innanetEscape(
                initials
            )}

        </div>


        <div class="innanet-post-content">


            <div class="innanet-post-header">


                <strong class="innanet-post-name">

                    ${innanetEscape(

                        post.accountName

                        ||

                        post.handle

                        ||

                        "Anonymous"

                    )}

                </strong>


                <span class="innanet-post-handle">

                    ${innanetEscape(
                        post.handle || ""
                    )}

                </span>


                <span class="innanet-post-dot">
                    ·
                </span>


                <span class="innanet-post-now">
                    now
                </span>


                <span
                    class="innanet-post-role innanet-role-${innanetEscape(

                        post.type || "fan-post"

                    )}"
                >

                    ${innanetEscape(

                        innanetTypeLabel(
                            post.type
                        )

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


                <span title="Replies">

                    <i>
                        ↩
                    </i>

                    <strong>
                        ${Number(
                            post.replies || 0
                        )}
                    </strong>

                </span>


                <span title="Reposts">

                    <i>
                        ⟳
                    </i>

                    <strong>
                        ${Number(
                            post.reposts || 0
                        )}
                    </strong>

                </span>


                <span title="Likes">

                    <i>
                        ♡
                    </i>

                    <strong>
                        ${Number(
                            post.likes || 0
                        )}
                    </strong>

                </span>


                <span
                    class="innanet-post-share"
                    title="Share"
                >

                    <i>
                        ↑
                    </i>

                </span>


            </div>


        </div>

    `;


    return article;

}



// =================================
// TRENDING
// =================================


function innanetRenderTrending(
    events
) {


    if (
        !innanetEls.trendingList
    ) {


        return;

    }


    const posts =

        events

            .flatMap(

                event =>

                    (
                        event.posts || []
                    )

                        .map(

                            post => ({

                                ...post,

                                eventName:

                                    event.eventName

                                    ||

                                    "OWL Event",

                                eventDate:
                                    event.date

                            })

                        )

            )

            .sort(

                (
                    a,
                    b
                ) =>

                    innanetEngagementScore(
                        b
                    )

                    -

                    innanetEngagementScore(
                        a
                    )

            )

            .slice(
                0,
                4
            );


    innanetEls
        .trendingList
        .innerHTML =
            "";


    if (
        !posts.length
    ) {


        innanetEls
            .trendingList
            .innerHTML = `

                <p class="innanet-trending-empty">
                    Nothing is trending yet.
                </p>

            `;


        return;

    }


    posts.forEach(

        (
            post,
            index
        ) => {


            const item =

                document.createElement(
                    "article"
                );


            const excerpt =

                String(
                    post.body || ""
                ).length > 115

                    ? `${String(

                        post.body

                    ).slice(

                        0,
                        112

                    )}...`

                    : post.body;


            item.className =
                "innanet-trending-item";


            item.innerHTML = `

                <span>
                    ${innanetEscape(
                        post.eventName
                    )} · Trending
                </span>


                <strong>

                    ${index + 1}.
                    ${innanetEscape(

                        post.handle

                        ||

                        post.accountName

                        ||

                        "Innanet User"

                    )}

                </strong>


                <p>
                    ${innanetEscape(
                        excerpt
                    )}
                </p>


                <small>

                    ${innanetEngagementScore(
                        post
                    )} engagement

                </small>

            `;


            innanetEls
                .trendingList
                .appendChild(
                    item
                );

        }

    );

}



// =================================
// FEED
// =================================


function innanetRenderMonth(
    monthData
) {


    innanetEls
        .feed
        .innerHTML =
            "";


    innanetEls
        .month
        .textContent =

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
        innanetEls.timelineCount
    ) {


        innanetEls
            .timelineCount
            .textContent =

                `${totalPosts} ${

                    totalPosts === 1

                        ? "POST"

                        : "POSTS"

                }`;

    }


    if (
        totalPosts === 0
    ) {


        innanetEls
            .emptyFeed
            .hidden =
                false;


        innanetRenderTrending(
            events
        );


        return;

    }


    innanetEls
        .emptyFeed
        .hidden =
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

                <div>

                                        <span class="innanet-event-live">

                        ${innanetEscape(

                            event.sequenceLabel

                            ||

                            "LIVE REACTION"

                        )}

                    </span>


                    <strong>

                        ${innanetEscape(

                            event.eventName

                            ||

                            "OWL Event"

                        )}

                    </strong>

                </div>


                <span>

                    ${innanetEscape(

                        innanetFormatDate(
                            event.date
                        )

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


            innanetEls
                .feed
                .appendChild(
                    group
                );

        }

    );


    innanetRenderTrending(
        events
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


        if (
            !months.length
        ) {


            innanetRenderArchive(
                [],
                ""
            );


            innanetEls
                .emptyFeed
                .hidden =
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


        innanetRenderArchive(

            months,

            selected.id

        );


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


        innanetEls
            .emptyFeed
            .hidden =
                false;


        innanetEls
            .emptyArchive
            .hidden =
                false;

    }

}



// =================================
// START
// =================================


innanetLoad();
