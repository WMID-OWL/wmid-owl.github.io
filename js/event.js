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
            wrestlerResponse
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
            )

        ]);


        if (
            !eventResponse.ok ||
            !matchResponse.ok ||
            !wrestlerResponse.ok
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
        // WRESTLER LOOKUP
        // =================================


        const wrestlerMap = {};


        wrestlers.forEach(
            wrestler => {


                wrestlerMap[
                    wrestler.id
                ] = wrestler;

            }
        );



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
        // FIND EVENT MATCHES
        // =================================


        const eventMatches =
            matches.filter(
                match => {


                    // Preferred method:
                    // exact event ID match


                    if (
                        match.eventId &&
                        match.eventId === event.id
                    ) {

                        return true;

                    }


                    // Fallback method:
                    // date and event name match


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


            return side.wrestlers

                .map(
                    wrestlerId =>
                        getWrestlerName(
                            wrestlerId
                        )
                )

                .join(" & ");

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
