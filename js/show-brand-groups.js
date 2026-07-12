(() => {

    "use strict";


    const brand =
        String(
            document.body.dataset.showBrand || ""
        ).trim();


    const teamGrid =
        document.getElementById(
            "show-brand-team-grid"
        );


    const teamCount =
        document.getElementById(
            "show-team-count"
        );


    const factionGrid =
        document.getElementById(
            "show-brand-faction-grid"
        );


    const factionCount =
        document.getElementById(
            "show-faction-count"
        );


    if (
        !brand ||
        !teamGrid ||
        !teamCount ||
        !factionGrid ||
        !factionCount
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
                word =>
                    word[0]
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



    function uniqueIds(
        values
    ) {

        return Array.from(

            new Set(

                values.filter(
                    Boolean
                )

            )

        );

    }



    function getMemberNames(
        memberIds,
        wrestlerMap
    ) {

        return memberIds

            .map(
                memberId =>

                    wrestlerMap[
                        memberId
                    ]?.name

                    ||

                    memberId
            )

            .filter(
                Boolean
            )

            .join(
                " · "
            );

    }



    function getBrandFromMembers(
        memberIds,
        wrestlerMap
    ) {

        const memberBrands =
            uniqueIds(

                memberIds

                    .map(
                        memberId =>

                            normalize(
                                wrestlerMap[
                                    memberId
                                ]?.brand
                            )
                    )

                    .filter(
                        Boolean
                    )

            );


        return memberBrands.length === 1

            ? memberBrands[0]

            : "";

    }



    function resolveTeamBrand(
        team,
        wrestlerMap
    ) {

        const directBrand =
            normalize(
                team.brand
            );


        if (
            directBrand
        ) {

            return directBrand;

        }


        return getBrandFromMembers(
            Array.isArray(
                team.members
            )

                ? team.members

                : [],

            wrestlerMap
        );

    }



    function getFactionMemberIds(
        faction,
        officialTeam
    ) {

        return uniqueIds([

            ...(
                Array.isArray(
                    faction.members
                )

                    ? faction.members

                    : []
            ),

            ...(
                Array.isArray(
                    faction.singlesMembers
                )

                    ? faction.singlesMembers

                    : []
            ),

            ...(
                officialTeam &&
                Array.isArray(
                    officialTeam.members
                )

                    ? officialTeam.members

                    : []
            ),

            ...(
                faction.leader

                    ? [
                        faction.leader
                    ]

                    : []
            )

        ]);

    }



    function resolveFactionBrand(
        faction,
        officialTeam,
        memberIds,
        wrestlerMap
    ) {

        const directBrand =
            normalize(
                faction.brand
            );


        if (
            directBrand
        ) {

            return directBrand;

        }


        const teamBrand =
            normalize(
                officialTeam?.brand
            );


        if (
            teamBrand
        ) {

            return teamBrand;

        }


        return getBrandFromMembers(
            memberIds,
            wrestlerMap
        );

    }



    function createTeamCard(
        team,
        wrestlerMap
    ) {

        const memberIds =
            Array.isArray(
                team.members
            )

                ? team.members

                : [];


        const memberNames =
            getMemberNames(
                memberIds,
                wrestlerMap
            );


        return `

            <a
                class="show-group-card"
                href="team.html?id=${encodeURIComponent(
                    team.id
                )}"
            >

                <div class="show-group-art">

                    ${
                        team.logo

                            ? `

                                <img
                                    src="${escapeHtml(
                                        team.logo
                                    )}"
                                    alt="${escapeHtml(
                                        team.name
                                    )}"
                                >

                            `

                            : `

                                <span>

                                    ${escapeHtml(
                                        getInitials(
                                            team.name
                                        )
                                    )}

                                </span>

                            `
                    }

                </div>


                <div class="show-group-copy">

                    <div class="show-group-meta">

                        <span>
                            TAG TEAM
                        </span>

                        <small>
                            ${memberIds.length} MEMBERS
                        </small>

                    </div>


                    <h3>
                        ${escapeHtml(
                            team.name
                        )}
                    </h3>


                    <p>

                        ${
                            memberNames

                                ? escapeHtml(
                                    memberNames
                                )

                                : "Members not assigned."
                        }

                    </p>


                    <strong>
                        View Team →
                    </strong>

                </div>

            </a>

        `;

    }



    function createFactionCard(
        faction,
        officialTeam,
        memberIds,
        wrestlerMap
    ) {

        const memberNames =
            getMemberNames(
                memberIds,
                wrestlerMap
            );


        return `

            <a
                class="show-group-card show-faction-card"
                href="faction.html?id=${encodeURIComponent(
                    faction.id
                )}"
            >

                <div class="show-group-art">

                    ${
                        faction.logo

                            ? `

                                <img
                                    src="${escapeHtml(
                                        faction.logo
                                    )}"
                                    alt="${escapeHtml(
                                        faction.name
                                    )}"
                                >

                            `

                            : `

                                <span>

                                    ${escapeHtml(
                                        getInitials(
                                            faction.name
                                        )
                                    )}

                                </span>

                            `
                    }

                </div>


                <div class="show-group-copy">

                    <div class="show-group-meta">

                        <span>
                            FACTION
                        </span>

                        <small>
                            ${memberIds.length} MEMBERS
                        </small>

                    </div>


                    <h3>
                        ${escapeHtml(
                            faction.name
                        )}
                    </h3>


                    <p>

                        ${
                            memberNames

                                ? escapeHtml(
                                    memberNames
                                )

                                : "Members not assigned."
                        }

                    </p>


                    ${
                        officialTeam

                            ? `

                                <div class="show-faction-team">

                                    Official Team:

                                    <b>
                                        ${escapeHtml(
                                            officialTeam.name
                                        )}
                                    </b>

                                </div>

                            `

                            : ""
                    }


                    <strong>
                        View Faction →
                    </strong>

                </div>

            </a>

        `;

    }



    async function loadBrandGroups() {

        try {


            const [
                teamResponse,
                factionResponse,
                wrestlerResponse
            ] = await Promise.all([

                fetch(
                    "data/teams.json",
                    {
                        cache:
                            "no-store"
                    }
                ),

                fetch(
                    "data/factions.json",
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
                )

            ]);


            if (
                !teamResponse.ok ||
                !factionResponse.ok ||
                !wrestlerResponse.ok
            ) {

                throw new Error(
                    "Could not load team and faction databases."
                );

            }


            const [
                teamData,
                factionData,
                wrestlerData
            ] = await Promise.all([

                teamResponse.json(),
                factionResponse.json(),
                wrestlerResponse.json()

            ]);


            const teams =
                Array.isArray(
                    teamData
                )

                    ? teamData

                    : [];


            const factions =
                Array.isArray(
                    factionData
                )

                    ? factionData

                    : [];


            const wrestlers =
                Array.isArray(
                    wrestlerData
                )

                    ? wrestlerData

                    : [];


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


            const selectedBrand =
                normalize(
                    brand
                );


            const brandTeams =
                teams

                    .filter(
                        team =>

                            resolveTeamBrand(
                                team,
                                wrestlerMap
                            ) === selectedBrand
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


            const brandFactions =
                factions

                    .map(
                        faction => {


                            const officialTeam =
                                teamMap[
                                    faction.tagTeamId
                                ]

                                ||

                                null;


                            const memberIds =
                                getFactionMemberIds(
                                    faction,
                                    officialTeam
                                );


                            return {

                                faction,
                                officialTeam,
                                memberIds,
                                resolvedBrand:
                                    resolveFactionBrand(
                                        faction,
                                        officialTeam,
                                        memberIds,
                                        wrestlerMap
                                    )

                            };

                        }
                    )

                    .filter(
                        entry =>

                            entry.resolvedBrand ===
                            selectedBrand
                    )

                    .sort(
                        (
                            a,
                            b
                        ) =>

                            String(
                                a.faction.name || ""
                            )
                                .localeCompare(
                                    String(
                                        b.faction.name || ""
                                    )
                                )
                    );


            teamCount.textContent =
                formatCount(
                    brandTeams.length,
                    "Team",
                    "Teams"
                );


            teamGrid.innerHTML =
                brandTeams.length > 0

                    ? brandTeams

                        .map(
                            team =>

                                createTeamCard(
                                    team,
                                    wrestlerMap
                                )
                        )
                        .join(
                            ""
                        )

                    : `

                        <p class="show-brand-empty">

                            No ${escapeHtml(
                                brand
                            )} tag teams are currently assigned.

                        </p>

                    `;


            factionCount.textContent =
                formatCount(
                    brandFactions.length,
                    "Faction",
                    "Factions"
                );


            factionGrid.innerHTML =
                brandFactions.length > 0

                    ? brandFactions

                        .map(
                            entry =>

                                createFactionCard(
                                    entry.faction,
                                    entry.officialTeam,
                                    entry.memberIds,
                                    wrestlerMap
                                )
                        )
                        .join(
                            ""
                        )

                    : `

                        <p class="show-brand-empty">

                            No ${escapeHtml(
                                brand
                            )} factions are currently assigned.

                        </p>

                    `;

        }


        catch (
            error
        ) {

            console.error(
                `Could not load ${brand} teams and factions:`,
                error
            );


            teamGrid.innerHTML = `

                <p class="show-brand-empty">
                    Tag teams could not be loaded.
                </p>

            `;


            factionGrid.innerHTML = `

                <p class="show-brand-empty">
                    Factions could not be loaded.
                </p>

            `;


            teamCount.textContent =
                "Unavailable";


            factionCount.textContent =
                "Unavailable";

        }

    }


    loadBrandGroups();


})();
