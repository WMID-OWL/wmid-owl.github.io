// =================================
// OWL WRESTLER TROPHY CASE
// PUBLIC CAREER ACHIEVEMENTS
// =================================

(() => {
    const CATEGORY_LABELS = {
        "video-game-cover": "Video Game Cover",
        "movie-role": "Movie Role",
        "television-role": "Television Role",
        "documentary": "Documentary",
        "endorsement": "Endorsement",
        "magazine-cover": "Magazine Cover",
        "special-award": "Special Award",
        "career-milestone": "Career Milestone",
        "other": "Other Achievement"
    };

    const section =
        document.getElementById(
            "trophy-case-section"
        );

    const count =
        document.getElementById(
            "trophy-case-count"
        );

    const list =
        document.getElementById(
            "trophy-case-list"
        );

    if (!section || !list) {
        return;
    }

    const array =
        value =>
            Array.isArray(value)
                ? value
                : [];

    function categoryLabel(value) {
        return CATEGORY_LABELS[value] ||
            CATEGORY_LABELS.other;
    }

    function displayDate(achievement) {
        if (achievement?.date) {
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

            : "";
    }

    function sortValue(achievement) {
        return achievement?.date ||
            `${achievement?.year || 0}-01-01`;
    }

    function createCard(achievement) {
        const card =
            document.createElement(
                "article"
            );

        card.className =
            `profile-trophy-card profile-trophy-${achievement.category || "other"}`;

        if (achievement.featured) {
            card.classList.add(
                "is-featured"
            );
        }

        if (achievement.image) {
            card.classList.add(
                "has-image"
            );

            const media =
                document.createElement(
                    "div"
                );

            media.className =
                "profile-trophy-media";

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                achievement.image;

            image.alt =
                `${achievement.title || "Career achievement"} artwork`;

            image.loading =
                "lazy";

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
            "profile-trophy-body";

        const heading =
            document.createElement(
                "div"
            );

        heading.className =
            "profile-trophy-heading";

        const headingCopy =
            document.createElement(
                "div"
            );

        const category =
            document.createElement(
                "span"
            );

        category.textContent =
            categoryLabel(
                achievement.category
            );

        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            achievement.title ||
            "Career Achievement";

        headingCopy.append(
            category,
            title
        );

        const date =
            document.createElement(
                "strong"
            );

        date.textContent =
            displayDate(
                achievement
            );

        heading.append(
            headingCopy,
            date
        );

        body.appendChild(
            heading
        );

        if (achievement.source) {
            const source =
                document.createElement(
                    "p"
                );

            source.className =
                "profile-trophy-source";

            source.textContent =
                achievement.source;

            body.appendChild(
                source
            );
        }

        if (achievement.description) {
            const description =
                document.createElement(
                    "p"
                );

            description.className =
                "profile-trophy-description";

            description.textContent =
                achievement.description;

            body.appendChild(
                description
            );
        }

        if (achievement.link) {
            const link =
                document.createElement(
                    "a"
                );

            link.className =
                "profile-trophy-link";

            link.href =
                achievement.link;

            link.target =
                "_blank";

            link.rel =
                "noopener noreferrer";

            link.textContent =
                "View achievement source →";

            body.appendChild(
                link
            );
        }

        card.appendChild(
            body
        );

        return card;
    }

    async function loadTrophyCase() {
        const wrestlerId =
            new URLSearchParams(
                window.location.search
            ).get(
                "id"
            );

        if (!wrestlerId) {
            return;
        }

        try {
            const response =
                await fetch(
                    "data/career-achievements.json",
                    {
                        cache:
                            "no-store"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Could not load the career-achievement database."
                );
            }

            const database =
                await response.json();

            const achievements =
                array(
                    database?.achievements
                )
                    .filter(
                        achievement =>

                            achievement?.recipientType ===
                                "wrestler"

                            &&

                            achievement?.recipientId ===
                                wrestlerId

                            &&

                            achievement?.visibility !==
                                "hidden"
                    )
                    .sort(
                        (
                            first,
                            second
                        ) =>

                            String(
                                sortValue(
                                    second
                                )
                            ).localeCompare(
                                String(
                                    sortValue(
                                        first
                                    )
                                )
                            )
                    );

            if (!achievements.length) {
                return;
            }

            list.innerHTML =
                "";

            achievements.forEach(
                achievement => {

                    list.appendChild(
                        createCard(
                            achievement
                        )
                    );

                }
            );

            if (count) {
                count.textContent =
                    `${achievements.length} ` +
                    `${
                        achievements.length === 1

                            ? "ACHIEVEMENT"

                            : "ACHIEVEMENTS"
                    }`;
            }

            section.hidden =
                false;
        }

        catch (error) {
            console.warn(
                "Could not render wrestler Trophy Case:",
                error
            );
        }
    }

    if (
        document.readyState ===
            "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            loadTrophyCase,
            {
                once:
                    true
            }
        );
    }

    else {
        loadTrophyCase();
    }
})();
