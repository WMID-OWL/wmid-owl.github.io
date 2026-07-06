async function loadTitleProfile() {

    try {


        // =================================
        // GET CHAMPIONSHIP ID
        // =================================


        const params =
            new URLSearchParams(
                window.location.search
            );


        const championshipId =
            params.get("id");



        // =================================
        // LOAD DATABASES
        // =================================


        const [
            championshipResponse,
            reignResponse,
            wrestlerResponse,
            teamResponse
        ] = await Promise.all([

            fetch(
                "data/championships.json",
                {
                    cache: "no-store"
                }
            ),

            fetch(
                "data/title-reigns.json",
                {
                    cache: "no-store"
                }
            ),

            fetch(
                "data/wrestlers.json",
                {
                    cache: "no-store"
                }
            ),

            fetch(
                "data/teams.json",
                {
                    cache: "no-store"
                }
            )

        ]);


        if (
            !championshipResponse.ok ||
            !reignResponse.ok ||
            !wrestlerResponse.ok ||
            !teamResponse.ok
        ) {

            throw new Error(
                "Could not load championship databases."
            );

        }


        const championships =
            await championshipResponse.json();


        const reigns =
            await reignResponse.json();


        const wrestlers =
            await wrestlerResponse.json();


        const teams =
            await teamResponse.json();



        // =================================
        // FIND CHAMPIONSHIP
        // =================================


        const championship =
            championships.find(
                item =>
                    item.id === championshipId
            );


        if (!championship) {

            document.querySelector(
                ".title-page"
            ).innerHTML = `

                <section class="title-section">

                    <h1>
                        Championship Not Found
                    </h1>

                    <p>
                        This championship does not exist
                        in the OWL database.
                    </p>

                </section>

            `;

            return;

        }



        // =================================
        // LOOKUP MAPS
        // =================================


        const wrestlerMap = {};


        wrestlers.forEach(
            wrestler => {

                wrestlerMap[
                    wrestler.id
                ] = wrestler;

            }
        );


        const teamMap = {};


        teams.forEach(
            team => {

                teamMap[
                    team.id
                ] = team;

            }
        );



        // =================================
        // BASIC TITLE INFORMATION
        // =================================


        document.title =
            `${championship.name} | OWL Wrestling`;


        document.getElementById(
            "title-name"
        ).textContent =
            championship.name;


        document.getElementById(
            "title-brand"
        ).textContent =
            championship.brand || "OWL";


        document.getElementById(
            "title-meta"
        ).textContent =

            [
                championship.division,
                championship.type,
                championship.tier
            ]

                .filter(Boolean)

                .join(" • ");



        // =================================
        // TITLE IMAGE
        // =================================


        if (championship.image) {


            const image =
                document.getElementById(
                    "title-image"
                );


            image.src =
                championship.image;


            image.alt =
                championship.name;


            image.hidden =
                false;


            document.getElementById(
                "title-image-placeholder"
            ).hidden =
                true;

        }



        // =================================
        // DESCRIPTION
        // =================================


        if (championship.description) {


            document.getElementById(
                "title-description"
            ).textContent =
                championship.description;


            document.getElementById(
                "title-description-section"
            ).hidden =
                false;

        }



        // =================================
        // TITLE REIGNS
        // =================================


        const titleReigns =
            reigns

                .filter(
                    reign =>

                        reign.championshipId ===
                        championship.id
                )

                .sort(
                    (a, b) =>

                        new Date(a.wonDate)
                        -
                        new Date(b.wonDate)
                );



        // =================================
        // HOLDER HELPERS
        // =================================


        function getHolderName(reign) {


            if (
                reign.holderType === "team"
            ) {


                const team =
                    teamMap[
                        reign.holderId
                    ];


                return team
                    ? team.name
                    : reign.holderId;

            }


            const wrestler =
                wrestlerMap[
                    reign.holderId
                ];


            return wrestler
                ? wrestler.name
                : reign.holderId;

        }



        function getHolderUrl(reign) {


            if (
                reign.holderType === "team"
            ) {

                return `team.html?id=${encodeURIComponent(reign.holderId)}`;

            }


            return `wrestler.html?id=${encodeURIComponent(reign.holderId)}`;

        }
function formatEventLink(
    eventId,
    eventName
) {


    if (
        !eventName
    ) {

        return "";

    }


    if (
        eventId
    ) {

        return `

            <a
                href="event.html?id=${encodeURIComponent(eventId)}"
                class="title-event-link"
            >
                ${eventName} →
            </a>

        `;

    }


    return `

        <span class="title-event-text">
            ${eventName}
        </span>

    `;

}


        // =================================
        // DATE HELPERS
        // =================================


        function getDateValue(
            dateString
        ) {


            return new Date(
                `${dateString}T00:00:00`
            );

        }



        function formatDate(
            dateString
        ) {


            if (!dateString) {

                return "Current";

            }


            return getDateValue(
                dateString
            ).toLocaleDateString(
                "en-US",
                {
                    year:
                        "numeric",

                    month:
                        "short",

                    day:
                        "numeric"
                }
            );

        }



        function calculateReignDays(
            reign
        ) {


            if (!reign.wonDate) {

                return "—";

            }


            const startDate =
                getDateValue(
                    reign.wonDate
                );


            const endDate =
                reign.lostDate

                    ? getDateValue(
                        reign.lostDate
                    )

                    : new Date();


            const millisecondsPerDay =
                1000 * 60 * 60 * 24;


            return Math.max(

                0,

                Math.floor(

                    (
                        endDate -
                        startDate
                    )

                    /

                    millisecondsPerDay

                )

            );

        }



        // =================================
        // CURRENT CHAMPION
        // =================================


        const activeReigns =
            titleReigns

                .filter(
                    reign =>
                        !reign.lostDate
                )

                .sort(
                    (a, b) =>

                        new Date(b.wonDate)
                        -
                        new Date(a.wonDate)
                );


        const currentReign =
            activeReigns[0] || null;



        if (currentReign) {


            const holderName =
                document.getElementById(
                    "current-holder-name"
                );


            holderName.textContent =
                getHolderName(
                    currentReign
                );


            holderName.href =
                getHolderUrl(
                    currentReign
                );


            document.getElementById(
    "current-holder-won"
).innerHTML =

    `Won ${formatDate(currentReign.wonDate)}${
        currentReign.wonAt

            ? ` at ${formatEventLink(
                currentReign.wonEventId,
                currentReign.wonAt
            )}`

            : ""
    }`;


            document.getElementById(
                "current-reign-days"
            ).textContent =
                calculateReignDays(
                    currentReign
                );


            document.getElementById(
                "current-reign-defenses"
            ).textContent =

                currentReign.defenses !== null &&
                currentReign.defenses !== undefined

                    ? currentReign.defenses

                    : 0;

        }



        // =================================
        // TITLE LINEAGE
        // =================================


        const lineage =
            document.getElementById(
                "title-lineage"
            );


        if (
            titleReigns.length === 0
        ) {


            document.getElementById(
                "lineage-table-wrapper"
            ).hidden =
                true;


            document.getElementById(
                "no-title-history"
            ).hidden =
                false;


            return;

        }



        const numberedReigns =
            titleReigns

                .map(
                    (reign, index) => {

                        return {

                            reign:
                                reign,

                            number:
                                index + 1

                        };

                    }
                )

                .reverse();



        numberedReigns.forEach(
            item => {


                const reign =
                    item.reign;


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        #${item.number}

                    </td>


                    <td>

                        <a
                            href="${getHolderUrl(reign)}"
                            class="lineage-holder-link"
                        >
                            ${getHolderName(reign)}
                        </a>

                    </td>


                    <td>

                        ${formatDate(reign.wonDate)}

                        ${
    reign.wonAt

        ? `
            <br>

            <span class="lineage-event">

                ${formatEventLink(
                    reign.wonEventId,
                    reign.wonAt
                )}

            </span>
        `

        : ""
}

                    </td>


                    <td>

                        ${
                            reign.lostDate
                                ? formatDate(reign.lostDate)
                                : "Current"
                        }

                        ${
    reign.lostAt

        ? `
            <br>

            <span class="lineage-event">

                ${formatEventLink(
                    reign.lostEventId,
                    reign.lostAt
                )}

            </span>
        `

        : ""
}

                    </td>


                    <td>

                        ${calculateReignDays(reign)}

                    </td>


                    <td>

                        ${
                            reign.defenses !== null &&
                            reign.defenses !== undefined

                                ? reign.defenses

                                : 0
                        }

                    </td>

                `;


                lineage.appendChild(
                    row
                );

            }
        );


    }


    catch (error) {


        console.error(
            "Could not load championship profile:",
            error
        );


        document.querySelector(
            ".title-page"
        ).innerHTML = `

            <section class="title-section">

                <h1>
                    Championship Profile Could Not Load
                </h1>

                <p>
                    There was a problem loading
                    the OWL championship database.
                </p>

            </section>

        `;

    }

}



loadTitleProfile();
