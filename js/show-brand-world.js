(() => {

    "use strict";


    const brand =
        String(
            document.body.dataset.showBrand || ""
        ).trim();


    const championshipGrid =
        document.getElementById(
            "show-brand-championship-grid"
        );


    const championshipCount =
        document.getElementById(
            "show-championship-count"
        );


    const rosterGrid =
        document.getElementById(
            "show-brand-roster-grid"
        );


    const rosterCount =
        document.getElementById(
            "show-roster-count"
        );


    if (
        !brand ||
        !championshipGrid ||
        !championshipCount ||
        !rosterGrid ||
        !rosterCount
    ) {

        return;

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



    function escapeHtml(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }



    function extractArray(
        data,
        possibleKeys = []
    ) {

        if (
            Array.isArray(
                data
            )
        ) {

            return data;

        }


        if (
            data &&
            typeof data === "object"
        ) {

            for (
                const key of possibleKeys
            ) {

                if (
                    Array.isArray(
                        data[key]
                    )
                ) {

                    return data[key];

                }

            }

        }


        return [];

    }



    function getInitials(
        name
    ) {

        return String(
            name || "OWL"
        )
            .split(
                /\s+/
            )
            .filter(
                Boolean
            )
            .map(
                word => word[0]
            )
            .join(
                ""
            )
            .slice(
                0,
                3
            )
            .toUpperCase();

    }



    function formatCount(
        count,
        singular,
        plural
    ) {

        return `${count} ${
            count === 1
                ? singular
                : plural
        }`;

    }



    function getCurrentReign(
        championshipId,
        reigns
    ) {

        return reigns

            .filter(
                reign =>

                    reign.championshipId ===
                        championshipId

                    &&

                    !reign.lostDate
            )

            .sort(
                (
                    a,
                    b
                ) =>

                    new Date(
                        b.wonDate || 0
                    )

                    -

                    new Date(
                        a.wonDate || 0
                    )
            )[0]

            ||

            null;

    }



    function getHolderDetails(
        reign,
        wrestlerMap,
        teamMap
    ) {

        if (
            !reign
        ) {

            return null;

        }


        if (
            normalize(
                reign.holderType
            ) === "team"
        ) {

            const team =
                teamMap[
                    reign.holderId
                ];


            return {

                name:
                    team?.name
                    ||
                    reign.holderId,

                url:
                    `team.html?id=${encodeURIComponent(
                        reign.holderId
                    )}`

            };

        }


        const wrestler =
            wrestlerMap[
                reign.holderId
            ];


        return {

            name:
                wrestler?.name
                ||
                reign.holderId,

            url:
                `wrestler.html?id=${encodeURIComponent(
                    reign.holderId
                )}`

        };

    }



    function createChampionshipCard(
        championship,
        reigns,
        wrestlerMap,
        teamMap
    ) {

        const currentReign =
            getCurrentReign(
                championship.id,
                reigns
            );


        const holder =
            getHolderDetails(
                currentReign,
                wrestlerMap,
                teamMap
            );


        const titleUrl =
            `title.html?id=${encodeURIComponent(
                championship.id
            )}`;


        return `

            <article class="show-title-card">


                <a
                    class="show-title-art"
                    href="${titleUrl}"
                >

                    ${
                        championship.image

                            ? `

                                <img
                                    src="${escapeHtml(
                                        championship.image
                                    )}"
                                    alt="${escapeHtml(
                                        championship.name
                                    )}"
                                >

                            `

                            : `

                                <span>
                                    OWL
                                </span>

                            `
                    }

                </a>


                <div class="show-title-copy">


                    <span class="show-title-meta">

                        ${escapeHtml(
                            championship.division ||
                            "OWL"
                        )}

                        ·

                        ${escapeHtml(
                            championship.tier ||
                            "Championship"
                        )}

                    </span>


                    <h3>

                        <a href="${titleUrl}">

                            ${escapeHtml(
                                championship.name
                            )}

                        </a>

                    </h3>


                    <small>

                        ${
                            holder
                                ? "CURRENT CHAMPION"
                                : "STATUS"
                        }

                    </small>


                    ${
                        holder

                            ? `

                                <a
                                    class="show-title-holder"
                                    href="${holder.url}"
                                >

                                    ${escapeHtml(
                                        holder.name
                                    )}

                                </a>

                            `

                            : `

                                <span class="show-title-holder vacant">
                                    Vacant
                                </span>

                            `
                    }


                </div>


            </article>

        `;

    }



    function createRosterCard(
        wrestler
    ) {

        return `

            <a
                class="show-roster-card"
                href="wrestler.html?id=${encodeURIComponent(
                    wrestler.id
                )}"
            >

                <div class="show-roster-portrait">

                    ${
                        wrestler.photo

                            ? `

                                <img
                                    src="${escapeHtml(
                                        wrestler.photo
                                    )}"
                                    alt="${escapeHtml(
                                        wrestler.name
                                    )}"
                                >

                            `

                            : `

                                <span>

                                    ${escapeHtml(
                                        getInitials(
                                            wrestler.name
                                        )
                                    )}

                                </span>

                            `
                    }

                </div>


                <div class="show-roster-copy">

                    <small>
                        ${escapeHtml(
                            wrestler.division ||
                            "OWL"
                        )}
                    </small>

                    <h3>
                        ${escapeHtml(
                            wrestler.name
                        )}
                    </h3>

                    ${
                        wrestler.nickname

                            ? `

                                <p>
                                    “${escapeHtml(
                                        wrestler.nickname
                                    )}”
                                </p>

                            `

                            : ""
                    }

                </div>

            </a>

        `;

    }



    function createRosterPreview(
        wrestlers
    ) {

        const men =
            wrestlers.filter(
                wrestler =>

                    normalize(
                        wrestler.division
                    ) === "men"
            );


        const women =
            wrestlers.filter(
                wrestler =>

                    normalize(
                        wrestler.division
                    ) === "women"
            );


        const others =
            wrestlers.filter(
                wrestler =>

                    ![
                        "men",
                        "women"
                    ].includes(
                        normalize(
                            wrestler.division
                        )
                    )
            );


        const preview = [

            ...men.slice(
                0,
                6
            ),

            ...women.slice(
                0,
                6
            )

        ];


        const selectedIds =
            new Set(
                preview.map(
                    wrestler =>
                        wrestler.id
                )
            );


        const remaining = [

            ...men,
            ...women,
            ...others

        ]
            .filter(
                wrestler =>

                    !selectedIds.has(
                        wrestler.id
                    )
            )
            .slice(
                0,
                Math.max(
                    0,
                    12 - preview.length
                )
            );


        return [

            ...preview,
            ...remaining

        ]
            .slice(
                0,
                12
            );

    }



    async function loadBrandWorld() {

        try {


            const responses =
                await Promise.all([

                    fetch(
                        "data/championships.json",
                        {
                            cache:
                                "no-store"
                        }
                    ),

                    fetch(
                        "data/title-reigns.json",
                        {
                            cache:
                                "no-store"
                        }
                    ),

                    fetch(
                        "data/wrestlers.json",
                        {
                            cache:
                                "no-store"
                        }
                    ),

                    fetch(
                        "data/teams.json",
                        {
                            cache:
                                "no-store"
                        }
                    )

                ]);


            if (
                responses.some(
                    response =>
                        !response.ok
                )
            ) {

                throw new Error(
                    "Could not load the brand databases."
                );

            }


            const [

                championshipData,
                reignData,
                wrestlerData,
                teamData

            ] = await Promise.all(

                responses.map(
                    response =>
                        response.json()
                )

            );


            const championships =
                extractArray(
                    championshipData,
                    [
                        "championships",
                        "titles"
                    ]
                );


            const reigns =
                extractArray(
                    reignData,
                    [
                        "reigns",
                        "titleReigns"
                    ]
                );


            const wrestlers =
                extractArray(
                    wrestlerData,
                    [
                        "wrestlers",
                        "roster"
                    ]
                );


            const teams =
                extractArray(
                    teamData,
                    [
                        "teams"
                    ]
                );


            const wrestlerMap =
                {};


            wrestlers.forEach(
                wrestler => {

                    wrestlerMap[
                        wrestler.id
                    ] = wrestler;

                }
            );


            const teamMap =
                {};


            teams.forEach(
                team => {

                    teamMap[
                        team.id
                    ] = team;

                }
            );


            const brandChampionships =
                championships

                    .filter(
                        championship =>

                            normalize(
                                championship.brand
                            ) ===
                            normalize(
                                brand
                            )
                    )

                    .sort(
                        (
                            a,
                            b
                        ) => {


                            const tierOrder = {

                                world:
                                    0,

                                midcard:
                                    1

                            };


                            const divisionOrder = {

                                men:
                                    0,

                                women:
                                    1

                            };


                            return (

                                (
                                    tierOrder[
                                        normalize(
                                            a.tier
                                        )
                                    ]

                                    ??

                                    99
                                )

                                -

                                (
                                    tierOrder[
                                        normalize(
                                            b.tier
                                        )
                                    ]

                                    ??

                                    99
                                )

                            )

                            ||

                            (

                                (
                                    divisionOrder[
                                        normalize(
                                            a.division
                                        )
                                    ]

                                    ??

                                    99
                                )

                                -

                                (
                                    divisionOrder[
                                        normalize(
                                            b.division
                                        )
                                    ]

                                    ??

                                    99
                                )

                            );

                        }
                    );


            championshipCount.textContent =
                formatCount(
                    brandChampionships.length,
                    "Title",
                    "Titles"
                );


            championshipGrid.innerHTML =
                brandChampionships.length > 0

                    ? brandChampionships

                        .map(
                            championship =>

                                createChampionshipCard(
                                    championship,
                                    reigns,
                                    wrestlerMap,
                                    teamMap
                                )
                        )
                        .join(
                            ""
                        )

                    : `

                        <p class="show-brand-empty">

                            No ${escapeHtml(
                                brand
                            )} championships are currently listed.

                        </p>

                    `;


            const brandRoster =
                wrestlers

                    .filter(
                        wrestler =>

                            normalize(
                                wrestler.brand
                            ) ===
                            normalize(
                                brand
                            )
                    )

                    .sort(
                        (
                            a,
                            b
                        ) =>

                            String(
                                a.name || ""
                            )
                                .localeCompare(
                                    String(
                                        b.name || ""
                                    )
                                )
                    );


            rosterCount.textContent =
                formatCount(
                    brandRoster.length,
                    "Wrestler",
                    "Wrestlers"
                );


            const rosterPreview =
                createRosterPreview(
                    brandRoster
                );


            rosterGrid.innerHTML =
                rosterPreview.length > 0

                    ? rosterPreview

                        .map(
                            createRosterCard
                        )
                        .join(
                            ""
                        )

                    : `

                        <p class="show-brand-empty">

                            No ${escapeHtml(
                                brand
                            )} wrestlers are currently assigned.

                        </p>

                    `;

        }


        catch (
            error
        ) {

            console.error(
                `Could not load ${brand} championships and roster:`,
                error
            );


            championshipGrid.innerHTML = `

                <p class="show-brand-empty">
                    Championships could not be loaded.
                </p>

            `;


            rosterGrid.innerHTML = `

                <p class="show-brand-empty">
                    The roster could not be loaded.
                </p>

            `;


            championshipCount.textContent =
                "Unavailable";


            rosterCount.textContent =
                "Unavailable";

        }

    }


    loadBrandWorld();


})();
