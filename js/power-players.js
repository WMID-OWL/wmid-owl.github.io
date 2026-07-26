(function () {

    const DATA_PATH = "data/power-players.json?v=286d";



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
