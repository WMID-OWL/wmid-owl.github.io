async function loadEventPage() {

    try {


        // =================================
        // GET EVENT ID FROM URL
        // =================================


        const params =
            new URLSearchParams(
                window.location.search
            );


        const eventId =
            params.get("id");


        if (!eventId) {

            throw new Error(
                "No event ID was provided."
            );

        }



        // =================================
        // LOAD DATABASES
        // =================================


        const [
            eventResponse,
            matchResponse,
            wrestlerResponse,
            teamResponse,
            championshipResponse,
            reignResponse
        ] = await Promise.all([

            fetch(
                "data/events.json",
                {
                    cache: "no-store"
                }
            ),

            fetch(
                "data/matches.json",
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
            )

        ]);


        if (
            !eventResponse.ok ||
            !matchResponse.ok ||
            !wrestlerResponse.ok ||
            !teamResponse.ok ||
            !championshipResponse.ok ||
            !reignResponse.ok
        ) {

            throw new Error(
                "Could not load event databases."
            );

        }


        const events =
            await eventResponse.json();


        const matches =
            await matchResponse.json();


        const wrestlers =
            await wrestlerResponse.json();


        const teams =
            await teamResponse.json();


        const championships =
            await championshipResponse.json();


        const reigns =
            await reignResponse.json();



        // =================================
        // FIND EVENT
        // =================================


        const event =
            events.find(
                item =>
                    item.id === eventId
            );


        if (!event) {


            document.querySelector(
                ".event-page"
            ).innerHTML = `

                <section class="event-section">

                    <h1>
                        Event Not Found
                    </h1>

                    <p class="empty-message">

                        This event does not exist
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



        function formatDate(
            dateString
        ) {


            return new Date(
                `${dateString}T00:00:00`
            ).toLocaleDateString(
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



        const championshipMap = {};


        championships.forEach(
            championship => {


                championshipMap[
                    championship.id
                ] = championship;

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

                return `team.html?id=${encodeURIComponent(reign.holderId)}`;

            }


            return `wrestler.html?id=${encodeURIComponent(reign.holderId)}`;

        }



        function getWrestlerName(
            wrestlerId
        ) {


            const wrestler =
                wrestlerMap[
                    wrestlerId
                ];


            return wrestler
                ? wrestler.name
                : wrestlerId;

        }
// =================================
// OFFICIAL TEAM DETECTION
// =================================


function createMemberSignature(
    memberIds
) {


    return [...memberIds]
        .sort()
        .join("|");

}



const officialTeamMap = {};


teams.forEach(
    team => {


        if (
            Array.isArray(
                team.members
            )

            &&

            team.members.length === 2
        ) {


            const signature =
                createMemberSignature(
                    team.members
                );


            officialTeamMap[
                signature
            ] = team;

        }

    }
);



function getOfficialTeam(
    wrestlerIds
) {


    if (
        !Array.isArray(
            wrestlerIds
        )

        ||

        wrestlerIds.length !== 2
    ) {

        return null;

    }


    const signature =
        createMemberSignature(
            wrestlerIds
        );


    return officialTeamMap[
        signature
    ] || null;

}



function createWrestlerLink(
    wrestlerId
) {


    return `

        <a
            href="wrestler.html?id=${encodeURIComponent(wrestlerId)}"
            class="event-competitor-link"
        >
            ${getWrestlerName(wrestlerId)}
        </a>

    `;

}
        


        // =================================
        // BASIC EVENT INFORMATION
        // =================================


        document.title =
            `${event.name} | OWL Wrestling`;


        document.getElementById(
            "event-name"
        ).textContent =
            event.name;


        document.getElementById(
            "event-type"
        ).textContent =

            normalize(
                event.eventType
            ) === "ppv"

                ? "OWL PAY-PER-VIEW"

                : "OWL WEEKLY EVENT";


        document.getElementById(
            "event-date"
        ).textContent =
            formatDate(
                event.date
            );


        document.getElementById(
            "event-brand"
        ).textContent =
            event.brand || "OWL";



        // =================================
        // LOCATION
        // =================================


        if (event.location) {


            const location =
                document.getElementById(
                    "event-location"
                );


            location.textContent =
                event.location;


            location.hidden =
                false;

        }



        // =================================
        // TAGLINE
        // =================================


        if (event.tagline) {


            const tagline =
                document.getElementById(
                    "event-tagline"
                );


            tagline.textContent =
                event.tagline;


            tagline.hidden =
                false;

        }



        // =================================
        // IMAGE
        // =================================


        if (event.image) {


            const image =
                document.getElementById(
                    "event-image"
                );


            image.src =
                event.image;


            image.alt =
                event.name;


            image.hidden =
                false;


            document.getElementById(
                "event-image-placeholder"
            ).hidden =
                true;

        }



        // =================================
        // DESCRIPTION
        // =================================


        if (event.description) {


            document.getElementById(
                "event-description"
            ).textContent =
                event.description;


            document.getElementById(
                "event-description-section"
            ).hidden =
                false;

        }



        // =================================
        // CHAMPIONSHIP CHANGE HELPERS
        // =================================


        function getIncomingReign(
            championshipId
        ) {


            return reigns.find(
                reign =>

                    reign.championshipId ===
                        championshipId

                    &&

                    reign.wonEventId ===
                        event.id
            ) || null;

        }



        function getOutgoingReign(
            championshipId
        ) {


            return reigns.find(
                reign =>

                    reign.championshipId ===
                        championshipId

                    &&

                    reign.lostEventId ===
                        event.id
            ) || null;

        }



        // =================================
        // FIND CHAMPIONSHIP CHANGES
        // =================================


        const changedChampionshipIds =
            Array.from(
                new Set(

                    reigns

                        .filter(
                            reign =>

                                reign.wonEventId ===
                                    event.id

                                ||

                                reign.lostEventId ===
                                    event.id
                        )

                        .map(
                            reign =>
                                reign.championshipId
                        )

                )
            );



        // =================================
        // RENDER CHAMPIONSHIP CHANGES
        // =================================


        if (
            changedChampionshipIds.length > 0
        ) {


            const titleChangeSection =
                document.getElementById(
                    "event-title-changes-section"
                );


            const titleChangeGrid =
                document.getElementById(
                    "event-title-change-grid"
                );


            titleChangeSection.hidden =
                false;



            changedChampionshipIds.forEach(
                championshipId => {


                    const championship =
                        championshipMap[
                            championshipId
                        ];


                    const championshipName =
                        championship
                            ? championship.name
                            : championshipId;


                    const incomingReign =
                        getIncomingReign(
                            championshipId
                        );


                    const outgoingReign =
                        getOutgoingReign(
                            championshipId
                        );


                    const previousHolderName =
                        getHolderName(
                            outgoingReign
                        );


                    const newHolderName =
                        getHolderName(
                            incomingReign
                        );


                    const changeCard =
                        document.createElement(
                            "article"
                        );


                    changeCard.className =
                        "event-title-change-card";


                    changeCard.innerHTML = `

                        <div class="event-title-change-heading">


                            <span>
                                CHAMPIONSHIP CHANGE
                            </span>


                            <h3>

                                <a
                                    href="title.html?id=${encodeURIComponent(championshipId)}"
                                >
                                    ${championshipName}
                                </a>

                            </h3>


                        </div>


                        <div class="event-title-change-transition">


                            ${
                                outgoingReign

                                    ? `
                                        <a
                                            href="${getHolderUrl(outgoingReign)}"
                                        >
                                            ${previousHolderName}
                                        </a>
                                    `

                                    : `
                                        <span class="vacant-holder">
                                            VACANT
                                        </span>
                                    `
                            }


                            <span class="title-change-arrow">
                                →
                            </span>


                            ${
                                incomingReign

                                    ? `
                                        <a
                                            href="${getHolderUrl(incomingReign)}"
                                        >
                                            ${newHolderName}
                                        </a>
                                    `

                                    : `
                                        <span class="vacant-holder">
                                            VACANT
                                        </span>
                                    `
                            }


                        </div>


                        <div class="event-new-champion">


                            <span>

                                ${
                                    incomingReign &&
                                    incomingReign.holderType === "team"

                                        ? "NEW CHAMPIONS"

                                        : incomingReign

                                            ? "NEW CHAMPION"

                                            : "STATUS"
                                }

                            </span>


                            <strong>

                                ${
                                    incomingReign
                                        ? newHolderName
                                        : "VACANT"
                                }

                            </strong>


                        </div>

                    `;


                    titleChangeGrid.appendChild(
                        changeCard
                    );

                }
            );

        }



        // =================================
        // FIND EVENT MATCHES
        // =================================


        const eventMatches =
            matches.filter(
                match => {


                    if (
                        match.eventId &&
                        match.eventId === event.id
                    ) {

                        return true;

                    }


                    return (

                        match.date === event.date

                        &&

                        normalize(
                            match.event
                        )
                        ===
                        normalize(
                            event.name
                        )

                    );

                }
            );



        // =================================
        // EVENT STATISTICS
        // =================================


        document.getElementById(
            "event-match-count"
        ).textContent =
            eventMatches.length;



        function averageField(
            matchList,
            field
        ) {


            const validValues =
                matchList

                    .map(
                        match =>
                            Number(
                                match[field]
                            )
                    )

                    .filter(
                        value =>
                            Number.isFinite(
                                value
                            )
                    );


            if (
                validValues.length === 0
            ) {

                return null;

            }


            const total =
                validValues.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum + value,
                    0
                );


            return (
                total /
                validValues.length
            );

        }



        const averageRating =
            averageField(
                eventMatches,
                "rating"
            );


        const averageStars =
            averageField(
                eventMatches,
                "starRating"
            );


        const validRatings =
            eventMatches

                .map(
                    match =>
                        Number(
                            match.rating
                        )
                )

                .filter(
                    value =>
                        Number.isFinite(
                            value
                        )
                );


        const bestRating =
            validRatings.length > 0

                ? Math.max(
                    ...validRatings
                )

                : null;



        document.getElementById(
            "event-average-rating"
        ).textContent =

            averageRating !== null

                ? `${averageRating.toFixed(1)}%`

                : "—";


        document.getElementById(
            "event-average-stars"
        ).textContent =

            averageStars !== null

                ? `${averageStars.toFixed(2)} ★`

                : "—";


        document.getElementById(
            "event-best-rating"
        ).textContent =

            bestRating !== null

                ? `${bestRating}%`

                : "—";



        // =================================
        // MATCH DISPLAY HELPERS
        // =================================


        function formatSide(
    side
) {


    const wrestlerIds =
        Array.isArray(
            side.wrestlers
        )

            ? side.wrestlers

            : [];



    const officialTeam =
        getOfficialTeam(
            wrestlerIds
        );



    if (officialTeam) {


        return `

            <a
                href="team.html?id=${encodeURIComponent(officialTeam.id)}"
                class="event-team-link"
            >
                ${officialTeam.name}
            </a>

        `;

    }



    return wrestlerIds

        .map(
            wrestlerId =>

                createWrestlerLink(
                    wrestlerId
                )
        )

        .join(
            ` <span class="event-member-divider">&amp;</span> `
        );

}



        function formatMatch(
            match
        ) {


            return match.sides

                .map(
                    side =>
                        formatSide(
                            side
                        )
                )

                .join(" vs. ");

        }



        function getResultType(
            match
        ) {


            const resultType =
                normalize(
                    match.resultType
                );


            if (
                resultType === "no-contest" ||
                resultType === "no contest" ||
                resultType === "nc"
            ) {

                return "no-contest";

            }


            if (
                resultType === "draw"
            ) {

                return "draw";

            }


            if (
                match.winnerSide === null ||
                match.winnerSide === undefined
            ) {

                return "draw";

            }


            return "win";

        }



        function getWinnerText(
            match
        ) {


            const resultType =
                getResultType(
                    match
                );


            if (
                resultType === "no-contest"
            ) {

                return "No Contest";

            }


            if (
                resultType === "draw"
            ) {

                return "Draw";

            }


            const winnerSide =
                match.sides[
                    match.winnerSide
                ];


            return winnerSide

                ? formatSide(
                    winnerSide
                )

                : "—";

        }



        function formatFinish(
            match
        ) {


            const resultType =
                getResultType(
                    match
                );


            if (
                resultType === "no-contest"
            ) {

                return "No Contest";

            }


            if (
                resultType === "draw"
            ) {

                return "Draw";

            }


            if (
                match.finish &&
                match.finish.winner &&
                match.finish.loser
            ) {


                const winnerName =
                    getWrestlerName(
                        match.finish.winner
                    );


                const loserName =
                    getWrestlerName(
                        match.finish.loser
                    );


                const method =
                    match.finish.method ||
                    "Unknown Method";


                return `${winnerName} defeated ${loserName} by ${method}`;

            }


            if (
                match.resultMethod
            ) {

                return match.resultMethod;

            }


            return "";

        }



        // =================================
        // RENDER MATCH CARD
        // =================================


        const matchList =
            document.getElementById(
                "event-match-list"
            );


        if (
            eventMatches.length === 0
        ) {


            document.getElementById(
                "event-no-matches"
            ).hidden =
                false;


            return;

        }



        eventMatches.forEach(
            (
                match,
                index
            ) => {


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "event-match-card";


                const finishText =
                    formatFinish(
                        match
                    );


                card.innerHTML = `

                    <div class="event-match-order">

                        MATCH ${index + 1}

                    </div>


                    <div class="event-match-content">


                        <span class="event-match-type">

                            ${match.matchType}

                        </span>


                        <h3>

                            ${formatMatch(match)}

                        </h3>


                        ${
                            finishText

                                ? `
                                    <p class="event-match-finish">

                                        ${finishText}

                                    </p>
                                `

                                : ""
                        }


                    </div>


                    <div class="event-match-winner">


                        <span>
                            WINNER
                        </span>


                        <strong>

                            ${getWinnerText(match)}

                        </strong>


                    </div>


                    <div class="event-match-rating-grid">


                        <div>

                            <span>
                                MATCH %
                            </span>

                            <strong>

                                ${
                                    match.rating !== null &&
                                    match.rating !== undefined

                                        ? `${match.rating}%`

                                        : "—"
                                }

                            </strong>

                        </div>


                        <div>

                            <span>
                                STARS
                            </span>

                            <strong>

                                ${
                                    match.starRating !== null &&
                                    match.starRating !== undefined

                                        ? `${match.starRating} ★`

                                        : "—"
                                }

                            </strong>

                        </div>


                    </div>

                `;


                matchList.appendChild(
                    card
                );

            }
        );


    }


    catch (error) {


        console.error(
            "Could not load event page:",
            error
        );


        document.querySelector(
            ".event-page"
        ).innerHTML = `

            <section class="event-section">

                <h1>
                    Event Page Could Not Load
                </h1>

                <p class="empty-message">

                    There was a problem loading
                    the OWL event database.

                </p>

            </section>

        `;

    }

}



loadEventPage();
