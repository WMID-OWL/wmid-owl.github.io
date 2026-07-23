(function () {

    const DATA_PATH = "data/signature-matches.json";



    const byId = function (id) {

        return document.getElementById(id);

    };



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



    const createList = function (items, className) {

        const list = createElement("ul", className || "signature-rules-list");

        items.forEach(function (item) {

            const listItem = createElement("li", "", item);

            list.appendChild(listItem);

        });

        return list;

    };



    const createStars = function (rating) {

        const fullStars = "★".repeat(Math.max(0, Math.min(5, Number(rating) || 0)));
        const emptyStars = "☆".repeat(Math.max(0, 5 - fullStars.length));

        return fullStars + emptyStars;

    };



    const createInfoGrid = function (match) {

        const grid = createElement("div", "signature-info-grid");

        const items = [
            ["Match Type", match.matchType],
            ["Held At / Usage", match.event],
            ["Participants", match.participants],
            ["Win Condition", match.winCondition],
            ["Prize", match.prize],
            ["Penalty", match.penalty]
        ];

        items.forEach(function (item) {

            if (!item[1]) {

                return;

            }

            const card = createElement("article", "signature-info-card");

            card.appendChild(createElement("span", "", item[0]));
            card.appendChild(createElement("p", "", item[1]));

            grid.appendChild(card);

        });

        return grid;

    };
    const createIdentityRibbon = function (match) {

        const ribbon = createElement("div", "signature-identity-ribbon");

        const items = [
            ["Event / Usage", match.event || match.usage],
            ["Identity", match.identity],
            ["Match Type", match.matchType]
        ];

        items.forEach(function (item) {

            if (!item[1]) {

                return;

            }

            const tile = createElement("div", "signature-identity-tile");

            tile.appendChild(createElement("span", "", item[0]));
            tile.appendChild(createElement("strong", "", item[1]));

            ribbon.appendChild(tile);

        });

        return ribbon;

    };


    const createSectionBlock = function (heading, content) {

        const block = createElement("div", "signature-detail-block");

        block.appendChild(createElement("h3", "", heading));

        if (typeof content === "string") {

            block.appendChild(createElement("p", "", content));

        } else if (content instanceof HTMLElement) {

            block.appendChild(content);

        }

        return block;

    };



    const createRatings = function (match) {

        if (!Array.isArray(match.profileRatings) || !match.profileRatings.length) {

            return null;

        }

        const ratings = createElement("div", "signature-rating-grid");

        match.profileRatings.forEach(function (item) {

            const row = createElement("div", "signature-rating-row");

            row.appendChild(createElement("span", "", item.label));
            row.appendChild(createElement("strong", "", createStars(item.rating)));

            ratings.appendChild(row);

        });

        return ratings;

    };



    const createCaseBreakdown = function (match) {

        if (!Array.isArray(match.cases) || !match.cases.length) {

            return null;

        }

        const grid = createElement("div", "signature-info-grid signature-case-grid");

        match.cases.forEach(function (caseItem) {

            const card = createElement("article", "signature-info-card");

            card.appendChild(createElement("span", "", `${caseItem.count}× ${caseItem.name}`));
            card.appendChild(createElement("p", "", caseItem.result));

            grid.appendChild(card);

        });

        return grid;

    };



    const createDebtClause = function (match) {

        if (!match.debtClause) {

            return null;

        }

        const wrapper = createElement("div", "signature-debt-clause");

        wrapper.appendChild(createElement("p", "", match.debtClause.summary));

        if (Array.isArray(match.debtClause.contractHolderLoses)) {

            wrapper.appendChild(
                createSectionBlock(
                    "If the Contract Holder Loses",
                    createList(match.debtClause.contractHolderLoses)
                )
            );

        }

        if (Array.isArray(match.debtClause.championLoses)) {

            wrapper.appendChild(
                createSectionBlock(
                    "If the Champion Loses",
                    createList(match.debtClause.championLoses)
                )
            );

        }

        return wrapper;

    };



    const createCombatPoints = function (match) {

        if (!match.combatPoints) {

            return null;

        }

        const wrapper = createElement("div", "signature-combat-points");

        const groups = [
            ["Core Result", match.combatPoints.core],
            ["Finish Bonus", match.combatPoints.finishBonus],
            ["Speed Bonus", match.combatPoints.speedBonus],
            ["Special Bonus", match.combatPoints.specialBonus]
        ];

        groups.forEach(function (group) {

            if (!Array.isArray(group[1]) || !group[1].length) {

                return;

            }

            const block = createElement("div", "signature-points-block");

            block.appendChild(createElement("h4", "", group[0]));

            group[1].forEach(function (item) {

                const row = createElement("div", "signature-points-row");

                const label = createElement("span", "", item.label);
                const points = createElement("strong", "", `${item.points > 0 ? "+" : ""}${item.points}`);

                row.appendChild(label);
                row.appendChild(points);

                if (item.note) {

                    const note = createElement("small", "", item.note);
                    row.appendChild(note);

                }

                block.appendChild(row);

            });

            wrapper.appendChild(block);

        });

        if (Array.isArray(match.combatPoints.notes) && match.combatPoints.notes.length) {

            wrapper.appendChild(createSectionBlock("Combat Points Notes", createList(match.combatPoints.notes)));

        }

        return wrapper;

    };



    const renderMatchDetails = function (match) {

        const section = byId(match.id);

        if (!section) {

            return;

        }

        if (section.dataset.signatureRendered === "true") {

            return;

        }

        section.dataset.signatureRendered = "true";

                const details = createElement("div", "signature-match-details");

        details.appendChild(createIdentityRibbon(match));
        details.appendChild(createInfoGrid(match));

        if (Array.isArray(match.sections)) {

            match.sections.forEach(function (sectionItem) {

                details.appendChild(createSectionBlock(sectionItem.heading, sectionItem.body));

            });

        }

        if (Array.isArray(match.rules) && match.rules.length) {

            details.appendChild(createSectionBlock("Official Rules", createList(match.rules)));

        }

        if (match.qualifying) {

            const qualifying = createElement("div", "signature-detail-stack");

            qualifying.appendChild(createElement("p", "", match.qualifying.summary));

            if (Array.isArray(match.qualifying.paths)) {

                qualifying.appendChild(createList(match.qualifying.paths));

            }

            details.appendChild(createSectionBlock("Qualifying Path", qualifying));

        }

        if (Array.isArray(match.qualification) && match.qualification.length) {

            details.appendChild(createSectionBlock("Qualification", createList(match.qualification)));

        }

        const caseBreakdown = createCaseBreakdown(match);

        if (caseBreakdown) {

            details.appendChild(createSectionBlock("Case Breakdown", caseBreakdown));

        }

        const debtClause = createDebtClause(match);

        if (debtClause) {

            details.appendChild(createSectionBlock("The Debt Clause", debtClause));

        }

        const combatPoints = createCombatPoints(match);

        if (combatPoints) {

            details.appendChild(createSectionBlock("Combat Points", combatPoints));

        }

        if (Array.isArray(match.statsTracked) && match.statsTracked.length) {

            details.appendChild(createSectionBlock("Stats Tracked", createList(match.statsTracked)));

        }

        const ratings = createRatings(match);

        if (ratings) {

            details.appendChild(createSectionBlock("Official Match Profile", ratings));

        }

        section.appendChild(details);

    };



    const loadMatches = function () {

        fetch(DATA_PATH)
            .then(function (response) {

                if (!response.ok) {

                    throw new Error("Unable to load Signature Se7en data.");

                }

                return response.json();

            })
            .then(function (data) {

                if (!data || !Array.isArray(data.matches)) {

                    return;

                }

                data.matches.forEach(renderMatchDetails);

            })
            .catch(function (error) {

                console.warn(error.message);

            });

    };



    if (document.readyState === "loading") {

        document.addEventListener("DOMContentLoaded", loadMatches);

    } else {

        loadMatches();

    }

}());
