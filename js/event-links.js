async function loadEventLinks() {

    try {


        // =================================
        // LOAD EVENT DATABASE
        // =================================


        const response =
            await fetch(
                "data/events.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not load event database."
            );

        }


        const events =
            await response.json();



        // =================================
        // HELPERS
        // =================================


        function normalizeText(
            value
        ) {


            return String(
                value || ""
            )
                .trim()
                .toLowerCase();

        }



        function normalizeDate(
            value
        ) {


            const text =
                String(
                    value || ""
                ).trim();


            if (
                /^\d{4}-\d{2}-\d{2}$/.test(
                    text
                )
            ) {

                return text;

            }


            const parsedDate =
                new Date(
                    text
                );


            if (
                Number.isNaN(
                    parsedDate.getTime()
                )
            ) {

                return text;

            }


            const year =
                parsedDate.getFullYear();


            const month =
                String(
                    parsedDate.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            const day =
                String(
                    parsedDate.getDate()
                ).padStart(
                    2,
                    "0"
                );


            return `${year}-${month}-${day}`;

        }



        // =================================
        // EVENT LOOKUP
        // =================================


        const eventLookup =
            new Map();


        events.forEach(
            event => {


                const key =

                    `${normalizeDate(event.date)}|${normalizeText(event.name)}`;


                eventLookup.set(
                    key,
                    event
                );

            }
        );



        // =================================
        // TURN EVENT CELLS INTO LINKS
        // =================================


        function linkEventCells() {


            const rows =
                document.querySelectorAll(
                    "table tbody tr"
                );


            rows.forEach(
                row => {


                    const cells =
                        row.querySelectorAll(
                            "td"
                        );


                    if (
                        cells.length < 2
                    ) {

                        return;

                    }


                    const dateCell =
                        cells[0];


                    const eventCell =
                        cells[1];


                    if (
                        eventCell.querySelector(
                            ".event-history-link"
                        )
                    ) {

                        return;

                    }


                    const dateText =
                        normalizeDate(
                            dateCell.textContent
                        );


                    const eventText =
                        eventCell.textContent.trim();


                    if (
                        !dateText ||
                        !eventText
                    ) {

                        return;

                    }


                    const key =

                        `${dateText}|${normalizeText(eventText)}`;


                    const event =
                        eventLookup.get(
                            key
                        );


                    if (!event) {

                        return;

                    }


                    const link =
                        document.createElement(
                            "a"
                        );


                    link.href =

                        `event.html?id=${encodeURIComponent(event.id)}`;


                    link.className =
                        "event-history-link";


                    link.textContent =
                        eventText;


                    eventCell.textContent =
                        "";


                    eventCell.appendChild(
                        link
                    );

                }
            );

        }



        // =================================
        // INITIAL CHECK
        // =================================


        linkEventCells();



        // =================================
        // WATCH FOR DYNAMIC MATCH RESULTS
        // =================================


        const pageMain =

            document.querySelector(
                "main"
            )

            ||

            document.body;


        const observer =
            new MutationObserver(
                () => {

                    linkEventCells();

                }
            );


        observer.observe(
            pageMain,
            {
                childList:
                    true,

                subtree:
                    true
            }
        );


    }


    catch (error) {


        console.error(
            "Could not create event links:",
            error
        );

    }

}



loadEventLinks();
