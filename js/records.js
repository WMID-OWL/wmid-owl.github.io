async function loadMatchDatabase() {

    try {


        // =================================
        // LOAD DATABASES
        // =================================

        const wrestlerResponse =
            await fetch(
                "data/wrestlers.json",
                {
                    cache: "no-store"
                }
            );


        const matchResponse =
            await fetch(
                "data/matches.json",
                {
                    cache: "no-store"
                }
            );


        if (
            !wrestlerResponse.ok ||
            !matchResponse.ok
        ) {

            throw new Error(
                "Could not load OWL database files."
            );

        }


        const wrestlers =
            await wrestlerResponse.json();


        const matches =
            await matchResponse.json();



        // =================================
        // PAGE ELEMENTS
        // =================================


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


        const matchTable =
            document.querySelector(
                ".match-table"
            );


        const summarySection =
            document.getElementById(
                "search-summary-section"
            );


        const summaryTitle =
            document.getElementById(
                "search-summary-title"
            );


        const summaryGrid =
            document.getElementById(
                "search-summary"
            );



        // =================================
        // WRESTLER NAME LOOKUP
        // =================================


        const wrestlerNameMap = {};


        wrestlers.forEach(
            wrestler => {

                wrestlerNameMap[
                    wrestler.id
                ] = wrestler.name;

            }
        );



        // =================================
        // FILL WRESTLER DROPDOWNS
        // =================================


        const sortedWrestlers =
            [...wrestlers].sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name
                    )
            );


        sortedWrestlers.forEach(
            wrestler => {


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


            }
        );



        // =================================
        // BUILD MATCH TYPE DROPDOWN
        // =================================


        const matchTypes = [

            ...new Set(

                matches

                    .map(
                        match =>
                            match.matchType
                    )

                    .filter(Boolean)

            )

        ].sort();


        matchTypes.forEach(
            matchType => {


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

            }
        );



        // =================================
        // GENERAL MATCH HELPERS
        // =================================


        function matchIncludesWrestler(
            match,
            wrestlerId
        ) {


            if (!wrestlerId) {

                return true;

            }


            return match.sides.some(
                side =>

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

                .map(
                    side =>
                        formatSide(side)
                )

                .join(" vs. ");

        }



        function getMatchResultType(match) {


            const resultType =
                String(
                    match.resultType || ""
                )
                    .trim()
                    .toLowerCase();


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



        function getWinnerText(match) {


            const resultType =
                getMatchResultType(
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



        // =================================
        // CLEAR SEARCH RESULTS
        // =================================


        function clearSearchResults() {


            resultsBody.innerHTML = "";


            resultCount.textContent =
                "0 matches";


            noResults.hidden =
                true;


            matchTable.hidden =
                true;


            summarySection.hidden =
                true;


            summaryGrid.innerHTML =
                "";

        }



        // =================================
        // RENDER MATCH RESULTS
        // =================================


        function renderResults(
            filteredMatches
        ) {


            resultsBody.innerHTML =
                "";


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


                noResults.hidden =
                    false;


                matchTable.hidden =
                    true;


                return;

            }



            noResults.hidden =
                true;


            matchTable.hidden =
                false;



            sortedMatches.forEach(
                match => {


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

                }
            );

        }



        // =================================
        // HEAD-TO-HEAD HELPERS
        // =================================


        function getOutcomeForSide(
            match,
            sideIndex
        ) {


            const resultType =
                getMatchResultType(
                    match
                );


            if (
                resultType === "no-contest"
            ) {

                return "no-contest";

            }


            if (
                resultType === "draw"
            ) {

                return "draw";

            }


            if (
                match.winnerSide ===
                sideIndex
            ) {

                return "win";

            }


            return "loss";

        }



        function calculatePerspectiveRecord(
            matchList,
            wrestlerId
        ) {


            let wins = 0;

            let losses = 0;

            let draws = 0;


            matchList.forEach(
                match => {


                    const wrestlerSide =
                        findWrestlerSide(
                            match,
                            wrestlerId
                        );


                    const outcome =
                        getOutcomeForSide(
                            match,
                            wrestlerSide
                        );


                    if (
                        outcome === "win"
                    ) {

                        wins++;

                    }


                    else if (
                        outcome === "loss"
                    ) {

                        losses++;

                    }


                    else if (
                        outcome === "draw"
                    ) {

                        draws++;

                    }


                    // NO CONTEST DOES NOT
                    // CHANGE THE W-L-D RECORD


                }
            );


            return {

                wins,

                losses,

                draws,

                text:
                    `${wins}-${losses}-${draws}`

            };

        }



        function isOneOnOneMatch(
            match,
            wrestlerA,
            wrestlerB
        ) {


            const sideA =
                findWrestlerSide(
                    match,
                    wrestlerA
                );


            const sideB =
                findWrestlerSide(
                    match,
                    wrestlerB
                );


            if (
                sideA === -1 ||
                sideB === -1 ||
                sideA === sideB
            ) {

                return false;

            }


            if (
                match.sides.length !== 2
            ) {

                return false;

            }


            return (

                match.sides[
                    sideA
                ].wrestlers.length === 1

                &&

                match.sides[
                    sideB
                ].wrestlers.length === 1

            );

        }



        function averageField(
            matchList,
            fieldName
        ) {


            const values =
                matchList

                    .filter(
                        match =>

                            match[fieldName] !== null
                            &&
                            match[fieldName] !== undefined
                            &&
                            match[fieldName] !== ""
                    )

                    .map(
                        match =>
                            Number(
                                match[fieldName]
                            )
                    )

                    .filter(
                        value =>
                            Number.isFinite(
                                value
                            )
                    );


            if (
                values.length === 0
            ) {

                return null;

            }


            const total =
                values.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                );


            return (
                total / values.length
            );

        }



        function addSummaryCard(
            label,
            value,
            detail = ""
        ) {


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "summary-card";


            const labelElement =
                document.createElement(
                    "span"
                );


            labelElement.textContent =
                label;


            const valueElement =
                document.createElement(
                    "strong"
                );


            valueElement.textContent =
                value;


            card.appendChild(
                labelElement
            );


            card.appendChild(
                valueElement
            );


            if (detail) {


                const detailElement =
                    document.createElement(
                        "small"
                    );


                detailElement.textContent =
                    detail;


                card.appendChild(
                    detailElement
                );

            }


            summaryGrid.appendChild(
                card
            );

        }



        // =================================
        // HEAD-TO-HEAD SUMMARY
        // =================================


        function renderHeadToHeadSummary(
            wrestlerAId,
            wrestlerBId
        ) {


            if (
                !wrestlerAId ||
                !wrestlerBId ||
                wrestlerAId === wrestlerBId
            ) {


                summarySection.hidden =
                    true;


                summaryGrid.innerHTML =
                    "";


                return;

            }



            const wrestlerAName =
                wrestlerNameMap[
                    wrestlerAId
                ]
                || wrestlerAId;


            const wrestlerBName =
                wrestlerNameMap[
                    wrestlerBId
                ]
                || wrestlerBId;



            // ALL MATCHES CONTAINING BOTH

            const sharedMatches =
                matches.filter(
                    match =>

                        matchIncludesWrestler(
                            match,
                            wrestlerAId
                        )

                        &&

                        matchIncludesWrestler(
                            match,
                            wrestlerBId
                        )
                );



            // ONE-ON-ONE MATCHES

            const singlesMatches =
                sharedMatches.filter(
                    match =>

                        isOneOnOneMatch(
                            match,
                            wrestlerAId,
                            wrestlerBId
                        )
                );



            // OPPOSING TAG OR MULTI-MAN

            const opposingMultiMatches =
                sharedMatches.filter(
                    match => {


                        const sideA =
                            findWrestlerSide(
                                match,
                                wrestlerAId
                            );


                        const sideB =
                            findWrestlerSide(
                                match,
                                wrestlerBId
                            );


                        return (

                            sideA !== sideB

                            &&

                            !isOneOnOneMatch(
                                match,
                                wrestlerAId,
                                wrestlerBId
                            )

                        );

                    }
                );



            // MATCHES AS TEAMMATES

            const teammateMatches =
                sharedMatches.filter(
                    match => {


                        const sideA =
                            findWrestlerSide(
                                match,
                                wrestlerAId
                            );


                        const sideB =
                            findWrestlerSide(
                                match,
                                wrestlerBId
                            );


                        return (
                            sideA === sideB
                        );

                    }
                );



            // RECORDS

            const singlesRecord =
                calculatePerspectiveRecord(
                    singlesMatches,
                    wrestlerAId
                );


            const opposingRecord =
                calculatePerspectiveRecord(
                    opposingMultiMatches,
                    wrestlerAId
                );


            const teammateRecord =
                calculatePerspectiveRecord(
                    teammateMatches,
                    wrestlerAId
                );



            // AVERAGES

            const averageRating =
                averageField(
                    sharedMatches,
                    "rating"
                );


            const averageStars =
                averageField(
                    sharedMatches,
                    "starRating"
                );



            // HIGHEST-RATED SHARED MATCH

            const ratedSharedMatches =
                sharedMatches.filter(
                    match =>

                        match.rating !== null
                        &&
                        match.rating !== undefined
                        &&
                        match.rating !== ""
                        &&
                        Number.isFinite(
                            Number(match.rating)
                        )
                );


            const highestRatedMatch =
                [...ratedSharedMatches]

                    .sort(
                        (a, b) => {


                            const ratingDifference =

                                Number(b.rating)
                                -
                                Number(a.rating);


                            if (
                                ratingDifference !== 0
                            ) {

                                return ratingDifference;

                            }


                            return (

                                Number(
                                    b.starRating || 0
                                )

                                -

                                Number(
                                    a.starRating || 0
                                )

                            );

                        }
                    )[0];



            // BUILD SUMMARY

            summaryGrid.innerHTML =
                "";


            summaryTitle.textContent =

                `${wrestlerAName} vs. ${wrestlerBName}`;



            addSummaryCard(

                "SHARED MATCHES",

                String(
                    sharedMatches.length
                ),

                "All matches involving both wrestlers"

            );



            addSummaryCard(

                "ONE-ON-ONE",

                String(
                    singlesMatches.length
                ),

                `${wrestlerAName}: ${singlesRecord.text}`

            );



            addSummaryCard(

                "OPPOSING TAG / MULTI",

                String(
                    opposingMultiMatches.length
                ),

                `${wrestlerAName}'s side: ${opposingRecord.text}`

            );



            addSummaryCard(

                "AS TEAMMATES",

                String(
                    teammateMatches.length
                ),

                `Record together: ${teammateRecord.text}`

            );



            addSummaryCard(

                "AVERAGE MATCH %",

                averageRating !== null

                    ? `${averageRating.toFixed(1)}%`

                    : "—",

                "Across all shared matches"

            );



            addSummaryCard(

                "AVERAGE STARS",

                averageStars !== null

                    ? `${averageStars.toFixed(2)} ★`

                    : "—",

                "Across all shared matches"

            );



            if (highestRatedMatch) {


                const highestStarText =

                    highestRatedMatch.starRating !== null
                    &&
                    highestRatedMatch.starRating !== undefined

                        ? ` | ${highestRatedMatch.starRating} ★`

                        : "";


                addSummaryCard(

                    "HIGHEST RATED",

                    `${highestRatedMatch.rating}%${highestStarText}`,

                    highestRatedMatch.event

                );

            }



            summarySection.hidden =
                false;

        }



        // =================================
        // SEARCH MATCHES
        // =================================


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
                matches.filter(
                    match => {


                        // WRESTLER FILTER

                        if (
                            wrestlerId &&
                            !matchIncludesWrestler(
                                match,
                                wrestlerId
                            )
                        ) {

                            return false;

                        }



                        // OPPONENT FILTER

                        if (
                            opponentId &&
                            !matchIncludesWrestler(
                                match,
                                opponentId
                            )
                        ) {

                            return false;

                        }



                        // SAME PERSON CANNOT
                        // BE COMPARED TO THEMSELVES

                        if (
                            wrestlerId &&
                            opponentId &&
                            wrestlerId === opponentId
                        ) {

                            return false;

                        }



                        // MATCH TYPE FILTER

                        if (
                            selectedMatchType &&
                            match.matchType !==
                                selectedMatchType
                        ) {

                            return false;

                        }



                        // EVENT TYPE FILTER

                        if (
                            selectedEventType &&
                            String(
                                match.eventType || ""
                            )
                                .toLowerCase()
                            !==
                            selectedEventType
                                .toLowerCase()
                        ) {

                            return false;

                        }



                        // MINIMUM MATCH %

                        if (
                            minRatingValue !== null
                        ) {


                            if (
                                match.rating === null
                                ||
                                match.rating === undefined
                                ||
                                Number(match.rating)
                                    < minRatingValue
                            ) {

                                return false;

                            }

                        }



                        // MINIMUM STAR RATING

                        if (
                            minStarsValue !== null
                        ) {


                            if (
                                match.starRating === null
                                ||
                                match.starRating === undefined
                                ||
                                Number(
                                    match.starRating
                                )
                                    < minStarsValue
                            ) {

                                return false;

                            }

                        }



                        // MAXIMUM STAR RATING

                        if (
                            maxStarsValue !== null
                        ) {


                            if (
                                match.starRating === null
                                ||
                                match.starRating === undefined
                                ||
                                Number(
                                    match.starRating
                                )
                                    > maxStarsValue
                            ) {

                                return false;

                            }

                        }



                        return true;

                    }
                );



            renderResults(
                filteredMatches
            );


            renderHeadToHeadSummary(
                wrestlerId,
                opponentId
            );

        }



        // =================================
        // SEARCH BUTTON FEEDBACK
        // =================================


        searchButton.addEventListener(
            "click",
            () => {


                searchButton.disabled =
                    true;


                searchButton.classList.remove(
                    "search-confirmed"
                );


                searchButton.classList.add(
                    "searching"
                );


                searchButton.textContent =
                    "Searching...";


                setTimeout(
                    () => {


                        searchMatches();


                        searchButton.classList.remove(
                            "searching"
                        );


                        searchButton.classList.add(
                            "search-confirmed"
                        );


                        searchButton.textContent =
                            "Results Updated ✓";


                        searchButton.disabled =
                            false;


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



        // =================================
        // RESET BUTTON
        // =================================


        resetButton.addEventListener(
            "click",
            () => {


                wrestlerFilter.value =
                    "";


                opponentFilter.value =
                    "";


                matchTypeFilter.value =
                    "";


                eventTypeFilter.value =
                    "";


                minimumRating.value =
                    "";


                minimumStars.value =
                    "";


                maximumStars.value =
                    "";


                clearSearchResults();

            }
        );



        // =================================
        // INITIAL EMPTY PAGE LOAD
        // =================================


        clearSearchResults();


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
