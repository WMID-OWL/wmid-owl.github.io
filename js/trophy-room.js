// =================================
// OWL PUBLIC TROPHY ROOM
// =================================


(() => {


    const CATEGORY_LABELS = {

        "video-game-cover":
            "Video Game Cover",

        "movie-role":
            "Movie Role",

        "television-role":
            "Television Role",

        "documentary":
            "Documentary",

        "endorsement":
            "Endorsement",

        "magazine-cover":
            "Magazine Cover",

        "special-award":
            "Special Award",

        "career-milestone":
            "Career Milestone",

        "other":
            "Other Achievement"

    };


    const els = {

        totalCount:
            document.getElementById(
                "trophy-total-count"
            ),

        wrestlerCount:
            document.getElementById(
                "trophy-wrestler-count"
            ),

        externalCount:
            document.getElementById(
                "trophy-external-count"
            ),

        featuredCount:
            document.getElementById(
                "trophy-featured-count"
            ),

        featuredSection:
            document.getElementById(
                "trophy-featured-section"
            ),

        featuredSummary:
            document.getElementById(
                "trophy-featured-summary"
            ),

        featuredList:
            document.getElementById(
                "trophy-featured-list"
            ),

        search:
            document.getElementById(
                "trophy-search"
            ),

        category:
            document.getElementById(
                "trophy-category-filter"
            ),

        year:
            document.getElementById(
                "trophy-year-filter"
            ),

        recipient:
            document.getElementById(
                "trophy-recipient-filter"
            ),

        reset:
            document.getElementById(
                "trophy-reset-filters"
            ),

        archive:
            document.getElementById(
                "trophy-archive-list"
            ),

        resultCount:
            document.getElementById(
                "trophy-result-count"
            ),

        empty:
            document.getElementById(
                "trophy-empty-state"
            ),

        filterEmpty:
            document.getElementById(
                "trophy-filter-empty-state"
            ),

        error:
            document.getElementById(
                "trophy-error-state"
            )

    };


    if (
        !els.archive
    ) {

        return;

    }


    let publicAchievements =
        [];


    // =================================
    // HELPERS
    // =================================


    function asArray(
        value
    ) {

        return Array.isArray(
            value
        )

            ? value

            : [];

    }


    function normalize(
        value
    ) {

        return String(
            value || ""
        )
            .trim()
            .toLowerCase();

    }


    function categoryLabel(
        value
    ) {

        return CATEGORY_LABELS[
            value
        ]

        ||

        CATEGORY_LABELS.other;

    }


    function formatAchievementDate(
        achievement
    ) {

        if (
            achievement?.date
        ) {

            const parsed =
                new Date(
                    `${achievement.date}T00:00:00`
                );


            if (
                !Number.isNaN(
                    parsed.getTime()
                )
            ) {

                return parsed.toLocaleDateString(
                    "en-US",
                    {
                        year:
                            "numeric",

                        month:
                            "long",

                        day:
                            "numeric"
                    }
                );

            }

        }


        return achievement?.year

            ? String(
                achievement.year
            )

            : "Date not recorded";

    }


    function achievementSortValue(
        achievement
    ) {

        return achievement?.date

        ||

        `${achievement?.year || 0}-01-01`;

    }


    function sortAchievements(
        achievements
    ) {

        return [
            ...achievements
        ].sort(
            (
                first,
                second
            ) => {

                const dateDifference =
                    String(
                        achievementSortValue(
                            second
                        )
                    ).localeCompare(
                        String(
                            achievementSortValue(
                                first
                            )
                        )
                    );


                if (
                    dateDifference !==
                    0
                ) {

                    return dateDifference;

                }


                return String(
                    first?.title || ""
                ).localeCompare(
                    String(
                        second?.title || ""
                    )
                );

            }
        );

    }


    function isSafeSourceLink(
        value
    ) {

        return /^https?:\/\//i.test(
            String(
                value || ""
            )
        );

    }


    function pluralAchievement(
        count
    ) {

        return `${count} ${
            count === 1

                ? "achievement"

                : "achievements"
        }`;

    }


    // =================================
    // CARD CREATION
    // =================================


    function createCard(
        achievement,
        featuredDisplay = false
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "trophy-card";


        if (
            achievement?.featured
            ||
            featuredDisplay
        ) {

            card.classList.add(
                "is-featured"
            );

        }


        if (
            achievement?.image
        ) {

            card.classList.add(
                "has-image"
            );


            const media =
                document.createElement(
                    "div"
                );


            media.className =
                "trophy-card-media";


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                achievement.image;


            image.alt =
                `${achievement.title || "Trophy Room achievement"} artwork`;


            image.loading =
                "lazy";


            image.addEventListener(
                "error",
                () => {

                    media.remove();


                    card.classList.remove(
                        "has-image"
                    );

                },
                {
                    once:
                        true
                }
            );


            media.appendChild(
                image
            );


            card.appendChild(
                media
            );

        }


        const body =
            document.createElement(
                "div"
            );


        body.className =
            "trophy-card-body";


        const topline =
            document.createElement(
                "div"
            );


        topline.className =
            "trophy-card-topline";


        const category =
            document.createElement(
                "span"
            );


        category.className =
            "trophy-card-category";


        category.textContent =
            categoryLabel(
                achievement?.category
            );


        const date =
            document.createElement(
                "span"
            );


        date.className =
            "trophy-card-date";


        date.textContent =
            formatAchievementDate(
                achievement
            );


        topline.append(
            category,
            date
        );


        const title =
            document.createElement(
                "h3"
            );


        title.textContent =
            achievement?.title
            ||
            "Career Achievement";


        const recipient =
            document.createElement(
                "p"
            );


        recipient.className =
            "trophy-card-recipient";


        if (
            achievement?.recipientType ===
                "wrestler"

            &&

            achievement?.recipientId
        ) {

            const link =
                document.createElement(
                    "a"
                );


            link.href =
                `wrestler.html?id=${
                    encodeURIComponent(
                        achievement.recipientId
                    )
                }`;


            link.textContent =
                `${achievement.recipientName || "OWL Wrestler"} →`;


            recipient.appendChild(
                link
            );

        }

        else {

            recipient.textContent =
                achievement?.recipientName
                ||
                "External Archive Recipient";

        }


        body.append(
            topline,
            title,
            recipient
        );


        if (
            achievement?.source
        ) {

            const source =
                document.createElement(
                    "p"
                );


            source.className =
                "trophy-card-source";


            source.textContent =
                achievement.source;


            body.appendChild(
                source
            );

        }


        if (
            achievement?.description
        ) {

            const description =
                document.createElement(
                    "p"
                );


            description.className =
                "trophy-card-description";


            description.textContent =
                achievement.description;


            body.appendChild(
                description
            );

        }


        const footer =
            document.createElement(
                "div"
            );


        footer.className =
            "trophy-card-footer";


        const badges =
            document.createElement(
                "div"
            );


        badges.className =
            "trophy-card-badges";


        const recipientBadge =
            document.createElement(
                "span"
            );


        recipientBadge.className =
            "trophy-card-badge";


        recipientBadge.textContent =

            achievement?.recipientType ===
                "external"

                ? "EXTERNAL ARCHIVE"

                : "OWL WRESTLER";


        badges.appendChild(
            recipientBadge
        );


        if (
            achievement?.featured
        ) {

            const featuredBadge =
                document.createElement(
                    "span"
                );


            featuredBadge.className =
                "trophy-card-badge";


            featuredBadge.textContent =
                "FEATURED";


            badges.appendChild(
                featuredBadge
            );

        }


        footer.appendChild(
            badges
        );


        if (
            isSafeSourceLink(
                achievement?.link
            )
        ) {

            const sourceLink =
                document.createElement(
                    "a"
                );


            sourceLink.className =
                "trophy-card-source-link";


            sourceLink.href =
                achievement.link;


            sourceLink.target =
                "_blank";


            sourceLink.rel =
                "noopener noreferrer";


            sourceLink.textContent =
                "View source →";


            footer.appendChild(
                sourceLink
            );

        }


        body.appendChild(
            footer
        );


        card.appendChild(
            body
        );


        return card;

    }


    // =================================
    // SUMMARY
    // =================================


    function renderSummary() {

        const wrestlerRecipients =
            new Set(

                publicAchievements

                    .filter(
                        achievement =>

                            achievement?.recipientType ===
                                "wrestler"

                            &&

                            achievement?.recipientId
                    )

                    .map(
                        achievement =>
                            achievement.recipientId
                    )

            );


        const externalCount =
            publicAchievements.filter(
                achievement =>

                    achievement?.recipientType ===
                        "external"
            ).length;


        const featuredCount =
            publicAchievements.filter(
                achievement =>
                    achievement?.featured ===
                        true
            ).length;


        els.totalCount.textContent =
            publicAchievements.length;


        els.wrestlerCount.textContent =
            wrestlerRecipients.size;


        els.externalCount.textContent =
            externalCount;


        els.featuredCount.textContent =
            featuredCount;

    }


    // =================================
    // FILTER OPTIONS
    // =================================


    function populateFilters() {

        const categories =
            [
                ...new Set(

                    publicAchievements

                        .map(
                            achievement =>
                                achievement?.category ||
                                "other"
                        )

                )
            ].sort(
                (
                    first,
                    second
                ) =>

                    categoryLabel(
                        first
                    ).localeCompare(
                        categoryLabel(
                            second
                        )
                    )
            );


        categories.forEach(
            categoryValue => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    categoryValue;


                option.textContent =
                    categoryLabel(
                        categoryValue
                    );


                els.category.appendChild(
                    option
                );

            }
        );


        const years =
            [
                ...new Set(

                    publicAchievements

                        .map(
                            achievement =>
                                Number(
                                    achievement?.year ||
                                    0
                                )
                        )

                        .filter(
                            year =>
                                Number.isInteger(
                                    year
                                )
                                &&
                                year > 0
                        )

                )
            ].sort(
                (
                    first,
                    second
                ) =>
                    second - first
            );


        years.forEach(
            year => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(
                        year
                    );


                option.textContent =
                    String(
                        year
                    );


                els.year.appendChild(
                    option
                );

            }
        );

    }


    // =================================
    // FEATURED DISPLAY
    // =================================


    function renderFeatured() {

        const featured =
            sortAchievements(

                publicAchievements.filter(
                    achievement =>
                        achievement?.featured ===
                            true
                )

            );


        els.featuredList.innerHTML =
            "";


        if (
            featured.length ===
            0
        ) {

            els.featuredSection.hidden =
                true;


            return;

        }


        featured.forEach(
            achievement => {

                els.featuredList.appendChild(
                    createCard(
                        achievement,
                        true
                    )
                );

            }
        );


        els.featuredSummary.textContent =
            `${featured.length} featured`;


        els.featuredSection.hidden =
            false;

    }


    // =================================
    // FILTERING
    // =================================


    function filteredAchievements() {

        const searchValue =
            normalize(
                els.search.value
            );


        const categoryValue =
            els.category.value;


        const yearValue =
            els.year.value;


        const recipientValue =
            els.recipient.value;


        return publicAchievements.filter(
            achievement => {

                if (
                    categoryValue
                    &&
                    achievement?.category !==
                        categoryValue
                ) {

                    return false;

                }


                if (
                    yearValue
                    &&
                    String(
                        achievement?.year || ""
                    ) !==
                        yearValue
                ) {

                    return false;

                }


                if (
                    recipientValue
                    &&
                    achievement?.recipientType !==
                        recipientValue
                ) {

                    return false;

                }


                if (
                    searchValue
                ) {

                    const searchText =
                        normalize(

                            [
                                achievement?.recipientName,
                                achievement?.title,
                                categoryLabel(
                                    achievement?.category
                                ),
                                achievement?.source,
                                achievement?.description,
                                achievement?.year
                            ]
                                .filter(Boolean)
                                .join(" ")

                        );


                    if (
                        !searchText.includes(
                            searchValue
                        )
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );

    }


    function renderArchive() {

        const values =
            sortAchievements(
                filteredAchievements()
            );


        els.archive.innerHTML =
            "";


        els.resultCount.textContent =
            pluralAchievement(
                values.length
            );


        els.empty.hidden =
            publicAchievements.length !==
            0;


        els.filterEmpty.hidden =
            !(
                publicAchievements.length >
                    0

                &&

                values.length ===
                    0
            );


        if (
            values.length ===
            0
        ) {

            return;

        }


        values.forEach(
            achievement => {

                els.archive.appendChild(
                    createCard(
                        achievement
                    )
                );

            }
        );

    }


    function resetFilters() {

        els.search.value =
            "";


        els.category.value =
            "";


        els.year.value =
            "";


        els.recipient.value =
            "";


        renderArchive();

    }


    // =================================
    // LOAD DATABASE
    // =================================


    async function loadTrophyRoom() {

        try {

            const response =
                await fetch(
                    "data/career-achievements.json",
                    {
                        cache:
                            "no-store"
                    }
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    "Could not load career-achievements.json."
                );

            }


            const database =
                await response.json();


            if (
                !database

                ||

                Array.isArray(
                    database
                )

                ||

                typeof database !==
                    "object"

                ||

                !Array.isArray(
                    database.achievements
                )
            ) {

                throw new Error(
                    "career-achievements.json has an invalid structure."
                );

            }


            publicAchievements =

                asArray(
                    database.achievements
                )

                    .filter(
                        achievement =>

                            achievement

                            &&

                            typeof achievement ===
                                "object"

                            &&

                            achievement.visibility !==
                                "hidden"
                    );


            els.error.hidden =
                true;


            renderSummary();


            populateFilters();


            renderFeatured();


            renderArchive();

        }


        catch (
            error
        ) {

            console.error(
                "Could not load the OWL Trophy Room:",
                error
            );


            publicAchievements =
                [];


            els.archive.innerHTML =
                "";


            els.empty.hidden =
                true;


            els.filterEmpty.hidden =
                true;


            els.error.hidden =
                false;


            els.resultCount.textContent =
                "0 achievements";

        }

    }


    // =================================
    // EVENTS
    // =================================


    els.search.addEventListener(
        "input",
        renderArchive
    );


    [
        els.category,
        els.year,
        els.recipient
    ].forEach(
        field => {

            field.addEventListener(
                "change",
                renderArchive
            );

        }
    );


    els.reset.addEventListener(
        "click",
        resetFilters
    );


    // =================================
    // INITIALIZATION
    // =================================


    loadTrophyRoom();


})();
