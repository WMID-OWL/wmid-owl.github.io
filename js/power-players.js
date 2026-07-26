(function () {

                const DATA_PATH = "data/power-players.json?v=286g";



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



    const renderStatus = function (data) {

        const statusCard = document.querySelector(".power-players-status-card");

        if (!statusCard || !data.status) {

            return;

        }

        const label = statusCard.querySelector("span");
        const headline = statusCard.querySelector("strong");
        const body = statusCard.querySelector("p");

        if (label) {

            label.textContent = data.seasonLabel || "Current Season";

        }

        if (headline) {

            headline.textContent = data.status.headline || "";

        }

        if (body) {

            body.textContent = data.status.body || "";

        }

    };



    const renderCategories = function (data) {

        const grid = document.querySelector(".power-players-grid");

        if (!grid || !Array.isArray(data.categories)) {

            return;

        }

        grid.innerHTML = "";

        data.categories.forEach(function (category) {

            const card = createElement(
                "article",
                `power-player-category ${category.accentClass || ""}`
            );

            card.appendChild(createElement("span", "", category.number || ""));
            card.appendChild(createElement("h2", "", category.title || ""));
            card.appendChild(createElement("p", "", category.description || ""));
            card.appendChild(createElement("small", "", category.tag || ""));

            grid.appendChild(card);

        });

    };


    const renderActiveEntries = function (data) {

        const board = document.querySelector(".power-players-active-board");
        const grid = document.querySelector("[data-power-players-active-grid]");

        if (!board || !grid) {

            return;

        }

        const entries = Array.isArray(data.activeEntries)
            ? data.activeEntries
            : [];

        board.hidden = entries.length === 0;

        grid.innerHTML = "";

        entries.forEach(function (entry) {

            const card = createElement(
                "article",
                `power-players-active-card ${entry.accentClass || ""}`
            );

            card.appendChild(createElement("span", "power-players-active-type", entry.type || "Active Power"));
            card.appendChild(createElement("h3", "", entry.name || "Unassigned"));
            card.appendChild(createElement("p", "", entry.description || ""));

            const meta = createElement("div", "power-players-active-meta");

            const metaItems = [
                ["Status", entry.status],
                ["Source", entry.source],
                ["Brand", entry.brand],
                ["Division", entry.division],
                ["Expires", entry.expires]
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

            if (Array.isArray(entry.notes) && entry.notes.length) {

                const notes = createElement("ul", "power-players-active-notes");

                entry.notes.forEach(function (note) {

                    notes.appendChild(createElement("li", "", note));

                });

                card.appendChild(notes);

            }

            grid.appendChild(card);

        });

    };


    const renderCompletedEntries = function (data) {

        const history = document.querySelector(".power-players-history");
        const list = document.querySelector("[data-power-players-history-list]");

        if (!history || !list) {

            return;

        }

        const entries = Array.isArray(data.completedEntries)
            ? data.completedEntries
            : [];

        history.hidden = entries.length === 0;

        list.innerHTML = "";

        entries.forEach(function (entry) {

            const row = createElement(
                "article",
                `power-players-history-row ${entry.accentClass || ""}`
            );

            const main = createElement("div", "power-players-history-main");

            main.appendChild(createElement("span", "", entry.type || "Completed Power"));
            main.appendChild(createElement("h3", "", entry.name || "Unassigned"));
            main.appendChild(createElement("p", "", entry.result || entry.description || ""));

            const meta = createElement("div", "power-players-history-meta");

            const metaItems = [
                ["Source", entry.source],
                ["Date", entry.date],
                ["Brand", entry.brand],
                ["Division", entry.division],
                ["Final Status", entry.status]
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

            row.appendChild(main);

            if (meta.children.length) {

                row.appendChild(meta);

            }

            list.appendChild(row);

        });

    };



    const renderEmptyState = function (data) {

        const emptyState = document.querySelector(".power-players-empty");

        if (!emptyState || !data.emptyState) {

            return;

        }

        const hasActiveEntries = Array.isArray(data.activeEntries) && data.activeEntries.length > 0;

        emptyState.hidden = hasActiveEntries;

        const eyebrow = emptyState.querySelector(".signature-series-eyebrow");
        const headline = emptyState.querySelector("h2");
        const body = emptyState.querySelector("p:last-child");

        if (eyebrow) {

            eyebrow.textContent = data.emptyState.eyebrow || "";

        }

        if (headline) {

            headline.textContent = data.emptyState.headline || "";

        }

        if (body) {

            body.textContent = data.emptyState.body || "";

        }

    };



    const loadPowerPlayers = function () {

        fetch(DATA_PATH)
            .then(function (response) {

                if (!response.ok) {

                    throw new Error("Unable to load Current Power Players data.");

                }

                return response.json();

            })
            .then(function (data) {

                if (!data) {

                    return;

                }

                                                renderStatus(data);
                renderCategories(data);
                renderActiveEntries(data);
                renderCompletedEntries(data);
                renderEmptyState(data);

            })
            .catch(function (error) {

                console.warn(error.message);

            });

    };



    if (document.readyState === "loading") {

        document.addEventListener("DOMContentLoaded", loadPowerPlayers);

    } else {

        loadPowerPlayers();

    }

}());
