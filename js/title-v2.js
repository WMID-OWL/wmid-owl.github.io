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


        if (!championshipId) {

            throw new Error(
                "No championship ID was provided."
            );

        }



        // =================================
        // LOAD DATABASES
        // =================================


        const [
            championshipResponse,
            reignResponse,
            wrestlerResponse,
            teamResponse,
            matchResponse
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
            ),

            fetch(
                "data/matches.json",
                {
                    cache: "no-store"
                }
            )

        ]);


        if (
            !championshipResponse.ok ||
            !reignResponse.ok ||
            !wrestlerResponse.ok ||
            !teamResponse.ok ||
            !matchResponse.ok
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


        const matches =
            await matchResponse.json();



        // =================================
        // FIND CHAMPIONSHIP
        // =================================


        const championship =
            championships.find(
                item =>
                    item.id ===
                    championshipId
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
        // BASIC HELPERS
        // =================================


        function normalize(
            value
        ) {


            return String(
                value || ""
            )
                .trim()
                .toLowerCase();

        }



        function getDateValue(
            dateString
        ) {


            if (!dateString) {

                return null;

            }


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


            const date =
                getDateValue(
                    dateString
                );


            if (!date) {

                return "—";

            }


            return date.toLocaleDateString(
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


            if (
                !reign ||
                !reign.wonDate
            ) {

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


            if (
                !startDate ||
                !endDate
            ) {

                return "—";

            }


            const millisecondsPerDay =
                1000 *
                60 *
                60 *
                24;


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
        // HOLDER HELPERS
        // =================================


        function getHolderName(
            reign
        ) {


            if (!reign) {

                return "VACANT";

            }


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



        function getHolderUrl(
            reign
        ) {


            if (!reign) {

                return "";

            }


            if (
                reign.holderType === "team"
            ) {

                return (
                    "team.html?id=" +
                    encodeURIComponent(
                        reign.holderId
                    )
                );

            }


            return (
                "wrestler.html?id=" +
                encodeURIComponent(
                    reign.holderId
                )
            );

        }



        // =================================
        // EVENT LINK HELPER
        // =================================


        function formatEventLink(
            eventId,
            eventName
        ) {


            if (!eventName) {

                return "";

            }


            if (eventId) {

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
        // AUTOMATIC DEFENSE HELPERS
        // =================================


        function matchFallsWithinReign(
            match,
            reign
        ) {


            if (
                !match ||
                !reign ||
                !match.date ||
                !reign.wonDate
            ) {

                return false;

            }


            if (
                match.date <
                reign.wonDate
            ) {

                return false;

            }


            if (
                reign.lostDate &&
                match.date >
                reign.lostDate
            ) {

                return false;

            }


            return true;

        }



        function calculateDefenseCount(
            reign
        ) {


            if (!reign) {

                return 0;

            }


            return matches.filter(
                match =>

                    match.championshipId ===
                        reign.championshipId

                    &&

                    normalize(
                        match.titleOutcome
                    ) === "retained"

                    &&

                    matchFallsWithinReign(
                        match,
                        reign
                    )
            ).length;

        }



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


            const placeholder =
                document.getElementById(
                    "title-image-placeholder"
                );


            if (placeholder) {

                placeholder.hidden =
                    true;

            }

        }



        // =================================
        // DESCRIPTION
        // =================================


        if (championship.description) {


            const description =
                document.getElementById(
                    "title-description"
                );


            const descriptionSection =
                document.getElementById(
                    "title-description-section"
                );


            if (description) {

                description.textContent =
                    championship.description;

            }


            if (descriptionSection) {

                descriptionSection.hidden =
                    false;

            }

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

                        new Date(
                            a.wonDate
                        )

                        -

                        new Date(
                            b.wonDate
                        )
                );



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

                        new Date(
                            b.wonDate
                        )

                        -

                        new Date(
                            a.wonDate
                        )
                );


        const currentReign =
            activeReigns[0] || null;



        if (currentReign) {


            const holderName =
                document.getElementById(
                    "current-holder-name"
                );


            if (holderName) {


                holderName.textContent =
                    getHolderName(
                        currentReign
                    );


                holderName.href =
                    getHolderUrl(
                        currentReign
                    );

            }



            const currentHolderWon =
                document.getElementById(
                    "current-holder-won"
                );


            if (currentHolderWon) {


                currentHolderWon.innerHTML =

                    `Won ${formatDate(currentReign.wonDate)}${
                        currentReign.wonAt

                            ? ` at ${formatEventLink(
                                currentReign.wonEventId,
                                currentReign.wonAt
                            )}`

                            : ""
                    }`;

            }



            const currentDays =
                document.getElementById(
                    "current-reign-days"
                );


            if (currentDays) {


                currentDays.textContent =
                    calculateReignDays(
                        currentReign
                    );

            }



            const currentDefenses =
                document.getElementById(
                    "current-reign-defenses"
                );


            if (currentDefenses) {


                currentDefenses.textContent =
                    calculateDefenseCount(
                        currentReign
                    );

            }

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


            const wrapper =
                document.getElementById(
                    "lineage-table-wrapper"
                );


            const emptyHistory =
                document.getElementById(
                    "no-title-history"
                );


            if (wrapper) {

                wrapper.hidden =
                    true;

            }


            if (emptyHistory) {

                emptyHistory.hidden =
                    false;

            }


            return;

        }



        if (lineage) {

            lineage.innerHTML = "";

        }



        const numberedReigns =
            titleReigns

                .map(
                    (
                        reign,
                        index
                    ) => {


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


                const defenseCount =
                    calculateDefenseCount(
                        reign
                    );


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

                                ? formatDate(
                                    reign.lostDate
                                )

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

                        ${defenseCount}

                    </td>

                `;


                if (lineage) {


                    lineage.appendChild(
                        row
                    );

                }

            }
        );



        console.log(
            "Title Profile v2 loaded:",
            {
                championship:
                    championship.id,

                reigns:
                    titleReigns.length,

                currentDefenses:
                    currentReign

                        ? calculateDefenseCount(
                            currentReign
                        )

                        : 0
            }
        );


    }


    catch (error) {


        console.error(
            "Could not load championship profile:",
            error
        );


        const page =
            document.querySelector(
                ".title-page"
            );


        if (page) {


            page.innerHTML = `

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

}



loadTitleProfile();
