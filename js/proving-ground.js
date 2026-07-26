(function () {

                        const DATA_PATH = "data/proving-ground.json?v=287h";



    const createElement = function (tagName, className, textContent) {

        const element = document.createElement(tagName);

        if (className) {

            element.className = className;

        }

        if (textContent) {

            element.textContent = textContent;

        }

        return element;

    };



    const renderOverviewStats = function (data) {

        const stats = document.querySelector(".proving-ground-overview-stats");

        if (!stats || !Array.isArray(data.overviewStats)) {

            return;

        }

        stats.innerHTML = "";

        data.overviewStats.forEach(function (item) {

            const stat = createElement("div", "");

            stat.appendChild(createElement("span", "", item.value || ""));
            stat.appendChild(createElement("strong", "", item.label || ""));

            stats.appendChild(stat);

        });

    };


    const renderQualificationPaths = function (data) {

        const grid = document.querySelector("[data-proving-ground-qualification-grid]");

        if (!grid || !Array.isArray(data.qualificationPaths)) {

            return;

        }

        grid.innerHTML = "";

        data.qualificationPaths.forEach(function (path) {

            const card = createElement("article", "proving-ground-qualification-card");

            card.appendChild(createElement("span", "", path.slot || ""));
            card.appendChild(createElement("h3", "", path.title || ""));
            card.appendChild(createElement("p", "", path.description || ""));

            grid.appendChild(card);

        });

    };



    const renderBlocks = function (data) {

        const grid = document.querySelector(".proving-ground-blocks");

        if (!grid || !Array.isArray(data.blocks)) {

            return;

        }

        grid.innerHTML = "";

        data.blocks.forEach(function (block) {

            const card = createElement(
                "article",
                `proving-ground-block-card ${block.accentClass || ""}`
            );

            card.appendChild(createElement("span", "", block.brand || ""));
            card.appendChild(createElement("h2", "", block.division || ""));
            card.appendChild(createElement("p", "", block.description || ""));
            card.appendChild(createElement("small", "", block.status || ""));

            grid.appendChild(card);

        });

    };



    const renderCombatPoints = function (data) {

        const grid = document.querySelector(".proving-ground-points-grid");

        if (!grid || !Array.isArray(data.combatPoints)) {

            return;

        }

        grid.innerHTML = "";

        data.combatPoints.forEach(function (item) {

            const card = createElement("article", "");

                        card.appendChild(createElement("span", "", item.label || ""));
            card.appendChild(createElement("strong", "", item.points || ""));

            if (item.note) {

                card.appendChild(createElement("p", "", item.note));

            }

            grid.appendChild(card);

        });

    };


    const renderEntries = function (data) {

        const field = document.querySelector(".proving-ground-field");
        const grid = document.querySelector("[data-proving-ground-field-grid]");

        if (!field || !grid) {

            return;

        }

        const entries = Array.isArray(data.entries)
            ? data.entries
            : [];

        field.hidden = entries.length === 0;

        grid.innerHTML = "";

        entries.forEach(function (entry) {

            const card = createElement(
                "article",
                `proving-ground-entry-card ${entry.accentClass || ""}`
            );

            card.appendChild(createElement("span", "proving-ground-entry-brand", entry.brand || ""));
            card.appendChild(createElement("h3", "", entry.name || "Unassigned"));
            card.appendChild(createElement("p", "", entry.description || ""));

            const meta = createElement("div", "proving-ground-entry-meta");

            const metaItems = [
                ["Division", entry.division],
                ["Qualified By", entry.qualification],
                ["Record", entry.record],
                ["Combat Points", entry.points],
                ["Status", entry.status]
            ];

            metaItems.forEach(function (item) {

                if (!item[1]) {

                    return;

                }

                const metaItem = createElement("div", "");

                metaItem.appendChild(createElement("small", "", item[0]));
                metaItem.appendChild(createElement("strong", "", item[1]));

                meta.appendChild(metaItem);

            });

            if (meta.children.length) {

                card.appendChild(meta);

            }

            grid.appendChild(card);

        });

    };



    const renderEmptyState = function (data) {

        const emptyState = document.querySelector(".proving-ground-empty");

        if (!emptyState || !data.status) {

            return;

        }

        const hasEntries = Array.isArray(data.entries) && data.entries.length > 0;

        emptyState.hidden = hasEntries;

        const eyebrow = emptyState.querySelector(".signature-series-eyebrow");
        const headline = emptyState.querySelector("h2");
        const body = emptyState.querySelector("p:last-child");

        if (eyebrow) {

            eyebrow.textContent = data.status.eyebrow || "";

        }

        if (headline) {

            headline.textContent = data.status.headline || "";

        }

        if (body) {

            body.textContent = data.status.body || "";

        }

    };



    const loadProvingGround = function () {

        fetch(DATA_PATH)
            .then(function (response) {

                if (!response.ok) {

                    throw new Error("Unable to load Proving Ground data.");

                }

                return response.json();

            })
            .then(function (data) {

                if (!data) {

                    return;

                }

                                                renderOverviewStats(data);
                renderQualificationPaths(data);
                renderBlocks(data);
                renderEntries(data);
                renderCombatPoints(data);
                renderEmptyState(data);

            })
            .catch(function (error) {

                console.warn(error.message);

            });

    };



    if (document.readyState === "loading") {

        document.addEventListener("DOMContentLoaded", loadProvingGround);

    } else {

        loadProvingGround();

    }

}());
