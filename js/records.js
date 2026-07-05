async function loadMatchDatabase() {

    try {


        // LOAD DATABASES

        const wrestlerResponse = await fetch(
            "data/wrestlers.json",
            {
                cache: "no-store"
            }
        );


        const matchResponse = await fetch(
            "data/matches.json",
            {
                cache: "no-store"
            }
        );


        const wrestlers =
            await wrestlerResponse.json();


        const matches =
            await matchResponse.json();



        // ELEMENTS

        const wrestlerFilter =
            document.getElementById(
                "wrestler-filter"
            );


        const opponentFilter =
            document.getElementById(
                "opponent-filter"
            );


        const matchTypeFilter =
            document.getElementById(
                "match-type-filter"
            );


        const eventTypeFilter =
            document.getElementById(
                "event-type-filter"
            );


        const minimumRating =
            document.getElementById(
                "minimum-rating"
            );


        const minimumStars =
            document.getElementById(
                "minimum-stars"
            );


        const maximumStars =
            document.getElementById(
                "maximum-stars"
            );


        const searchButton =
            document.getElementById(
                "search-button"
            );


        const resetButton =
            document.getElementById(
                "reset-button"
            );


        const resultsBody =
            document.getElementById(
                "match-results"
            );


        const resultCount =
            document.getElementById(
                "result-count"
            );


        const noResults =
            document.getElementById(
                "no-results"
            );



        // CREATE WRESTLER NAME LOOKUP

        const wrestlerNameMap = {};


        wrestlers.forEach(wrestler => {

            wrestlerNameMap[wrestler.id] =
                wrestler.name;

        });



        // SORT WRESTLERS ALPHABETICALLY

        const sortedWrestlers =
            [...wrestlers].sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name
                    )
            );



        // FILL WRESTLER DROPDOWNS

        sortedWrestlers.forEach(wrestler => {


            const wrestlerOption =
                document.createElement(
                    "option"
                );


            wrestlerOption.value =
                wrestler.id;


            wrestlerOption.textContent =
                wrestler.name;


            wrestlerFilter.appendChild(
                wrestlerOption
            );



            const opponentOption =
                document.createElement(
                    "option"
                );


            opponentOption.value =
                wrestler.id;


            opponentOption.textContent =
                wrestler.name;


            opponentFilter.appendChild(
                opponentOption
            );


        });



        // BUILD MATCH TYPE OPTIONS AUTOMATICALLY

        const matchTypes = [

            ...new Set(
                matches
                    .map(match =>
                        match.matchType
                    )
                    .filter(Boolean)
            )

        ].sort();



        matchTypes.forEach(matchType => {


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                matchType;


            option.textContent =
                matchType;


            matchTypeFilter.appendChild(
                option
            );


        });



        function matchIncludesWrestler(
            match,
            wrestlerId
        ) {

            if (!wrestlerId) {

                return true;

            }


            return match.sides.some(side =>

                side.wrestlers.includes(
                    wrestlerId
                )

            );

        }



        function findWrestlerSide(
            match,
            wrestlerId
        ) {

            return match.sides.findIndex(
                side =>
                    side.wrestlers.includes(
                        wrestlerId
                    )
            );

        }



        function formatSide(side) {

            return side.wrestlers
                .map(
                    id =>
                        wrestlerNameMap[id]
                        || id
                )
                .join(" & ");

        }



        function formatMatch(match) {

            return match.sides
                .map(formatSide)
                .join(" vs. ");

        }



        function getWinnerText(match) {


            if (
                match.winnerSide === null ||
                match.winnerSide === undefined
            ) {

                return "Draw";

            }


            const winningSide =
                match.sides[
                    match.winnerSide
                ];


            if (!winningSide) {

                return "Unknown";

            }


            return formatSide(
                winningSide
            );

        }



        function renderResults(
            filteredMatches
        ) {


            resultsBody.innerHTML = "";


            const sortedMatches =
                [...filteredMatches].sort(
                    (a, b) =>
                        new Date(b.date)
                        -
                        new Date(a.date)
                );



            resultCount.textContent =

                `${sortedMatches.length} ${
                    sortedMatches.length === 1
                        ? "match"
                        : "matches"
                }`;



            if (
                sortedMatches.length === 0
            ) {

                noResults.hidden = false;

                document.querySelector(
                    ".match-table"
                ).hidden = true;

                return;

            }


            noResults.hidden = true;


            document.querySelector(
                ".match-table"
            ).hidden = false;



            sortedMatches.forEach(match => {


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${match.date}
                    </td>


                    <td>
                        ${match.event}
                    </td>


                    <td>

                        <strong>
                            ${match.matchType}
                        </strong>

                        <br>

                        <span class="match-fixture">
                            ${formatMatch(match)}
                        </span>

                    </td>


                    <td>
                        ${getWinnerText(match)}
                    </td>


                    <td>

                        ${
                            match.rating !== null &&
                            match.rating !== undefined

                                ? match.rating + "%"

                                : "—"
                        }

                    </td>


                    <td>

                        ${
                            match.starRating !== null &&
                            match.starRating !== undefined

                                ? match.starRating + " ★"

                                : "—"
                        }

                    </td>

                `;


                resultsBody.appendChild(
                    row
                );


            });


        }



        function searchMatches() {


            const wrestlerId =
                wrestlerFilter.value;


            const opponentId =
                opponentFilter.value;


            const selectedMatchType =
                matchTypeFilter.value;


            const selectedEventType =
                eventTypeFilter.value;


            const minRatingValue =
                minimumRating.value === ""

                    ? null

                    : Number(
                        minimumRating.value
                    );


            const minStarsValue =
                minimumStars.value === ""

                    ? null

                    : Number(
                        minimumStars.value
                    );


            const maxStarsValue =
                maximumStars.value === ""

                    ? null

                    : Number(
                        maximumStars.value
                    );



            const filteredMatches =
                matches.filter(match => {


                    // WRESTLER

                    if (
                        wrestlerId &&
                        !matchIncludesWrestler(
                            match,
                            wrestlerId
                        )
                    ) {

                        return false;

                    }



                    // OPPONENT

                    if (
                        opponentId &&
                        !matchIncludesWrestler(
                            match,
                            opponentId
                        )
                    ) {

                        return false;

                    }



                    // IF BOTH SELECTED,
                    // THEY MUST BE DIFFERENT PEOPLE

                    if (
                        wrestlerId &&
                        opponentId &&
                        wrestlerId === opponentId
                    ) {

                        return false;

                    }



                    // MATCH TYPE

                    if (
                        selectedMatchType &&
                        match.matchType !==
                            selectedMatchType
                    ) {

                        return false;

                    }



                    // EVENT TYPE

                    if (
                        selectedEventType &&
                        String(
                            match.eventType
                        ).toLowerCase()
                        !==
                        selectedEventType.toLowerCase()
                    ) {

                        return false;

                    }



                    // MINIMUM GAME RATING

                    if (
                        minRatingValue !== null
                    ) {

                        if (
                            match.rating === null ||
                            match.rating === undefined ||
                            Number(match.rating)
                                < minRatingValue
                        ) {

                            return false;

                        }

                    }



                    // MINIMUM STARS

                    if (
                        minStarsValue !== null
                    ) {

                        if (
                            match.starRating === null ||
                            match.starRating === undefined ||
                            Number(
                                match.starRating
                            )
                                < minStarsValue
                        ) {

                            return false;

                        }

                    }



                    // MAXIMUM STARS

                    if (
                        maxStarsValue !== null
                    ) {

                        if (
                            match.starRating === null ||
                            match.starRating === undefined ||
                            Number(
                                match.starRating
                            )
                                > maxStarsValue
                        ) {

                            return false;

                        }

                    }



                    return true;


                });



            renderResults(
                filteredMatches
            );


        }



       // SEARCH BUTTON WITH VISUAL FEEDBACK

searchButton.addEventListener(
    "click",
    () => {


        // Prevent repeated clicks during feedback

        searchButton.disabled = true;


        // Show pressed/searching state

        searchButton.classList.remove(
            "search-confirmed"
        );


        searchButton.classList.add(
            "searching"
        );


        searchButton.textContent =
            "Searching...";



        // Small delay makes the interaction
        // feel deliberate instead of invisible

        setTimeout(
            () => {


                // RUN THE ACTUAL SEARCH

                searchMatches();



                // CONFIRM RESULTS UPDATED

                searchButton.classList.remove(
                    "searching"
                );


                searchButton.classList.add(
                    "search-confirmed"
                );


                searchButton.textContent =
                    "Results Updated ✓";


                searchButton.disabled = false;



                // RETURN TO NORMAL LABEL

                setTimeout(
                    () => {


                        searchButton.textContent =
                            "Search Matches";


                        searchButton.classList.remove(
                            "search-confirmed"
                        );


                    },
                    900
                );


            },
            175
        );


    }
);



        // RESET BUTTON

        resetButton.addEventListener(
            "click",
            () => {


                wrestlerFilter.value = "";

                opponentFilter.value = "";

                matchTypeFilter.value = "";

                eventTypeFilter.value = "";

                minimumRating.value = "";

                minimumStars.value = "";

                maximumStars.value = "";


                renderResults(
                    matches
                );


            }
        );



        // INITIAL PAGE LOAD

        renderResults(
            matches
        );


    }

    catch (error) {


        console.error(
            "Could not load match database:",
            error
        );


        document.querySelector(
            "main"
        ).innerHTML += `

            <section class="section">

                <p class="empty-message">

                    The OWL match database
                    could not be loaded.

                </p>

            </section>

        `;


    }

}



loadMatchDatabase();
