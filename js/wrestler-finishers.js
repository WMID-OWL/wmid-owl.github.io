(() => {


    "use strict";



    const showcase =

        document.getElementById(
            "finisher-showcase"
        );


    const heading =

        document.getElementById(
            "finisher-heading"
        );


    const fallback =

        document.getElementById(
            "finisher"
        );



    if (
        !showcase
    ) {


        return;

    }



    function cleanText(
        value
    ) {


        return String(
            value || ""
        )
            .trim();

    }



    function createFinisherCard(
        finisher,
        index
    ) {


        const card =

            document.createElement(
                "article"
            );


        card.className =
            "finisher-card";



        const media =

            document.createElement(
                "div"
            );


        media.className =
            "finisher-card-media";



        const image =

            document.createElement(
                "img"
            );


        image.src =
            finisher.gif;


        image.alt =

            `${finisher.name} finisher animation`;


        image.loading =
            "lazy";


        media.appendChild(
            image
        );



        const copy =

            document.createElement(
                "div"
            );


        copy.className =
            "finisher-card-copy";



        const label =

            document.createElement(
                "span"
            );


        label.textContent =

            index === 0

                ? "FINISHER"

                : "SECOND FINISHER";



        const name =

            document.createElement(
                "strong"
            );


        name.textContent =
            finisher.name;



        copy.appendChild(
            label
        );


        copy.appendChild(
            name
        );


        card.appendChild(
            media
        );


        card.appendChild(
            copy
        );


        return card;

    }



    async function loadFinisherShowcase() {


        try {


            const parameters =

                new URLSearchParams(
                    window.location.search
                );


            const wrestlerId =

                parameters.get(
                    "id"
                );


            if (
                !wrestlerId
            ) {


                return;

            }



            const response =

                await fetch(

                    "data/wrestlers.json",

                    {
                        cache:
                            "no-store"
                    }

                );


            if (
                !response.ok
            ) {


                throw new Error(

                    "Could not load the wrestler database."

                );

            }



            const wrestlers =

                await response.json();



            const wrestler =

                Array.isArray(
                    wrestlers
                )

                    ? wrestlers.find(

                        item =>

                            String(
                                item.id
                            )

                            ===

                            wrestlerId

                    )

                    : null;



            if (
                !wrestler
            ) {


                return;

            }



            const finishers = [

                {
                    name:

                        cleanText(
                            wrestler.finisher
                        ),

                    gif:

                        cleanText(
                            wrestler.finisherGif
                        )
                },

                {
                    name:

                        cleanText(
                            wrestler.finisher2
                        ),

                    gif:

                        cleanText(
                            wrestler.finisher2Gif
                        )
                }

            ]

                .filter(

                    finisher =>

                        finisher.name

                        &&

                        finisher.gif

                )

                .slice(
                    0,
                    2
                );



            if (
                finishers.length === 0
            ) {


                showcase.hidden =
                    true;


                return;

            }



            showcase.innerHTML =
                "";


            finishers.forEach(

                (
                    finisher,
                    index
                ) => {


                    showcase.appendChild(

                        createFinisherCard(
                            finisher,
                            index
                        )

                    );

                }

            );



            showcase.classList.toggle(

                "finisher-showcase-single",

                finishers.length === 1

            );


            showcase.hidden =
                false;



            if (
                heading
            ) {


                heading.textContent =

                    finishers.length === 2

                        ? "Finishers"

                        : "Finisher";

            }



            if (
                fallback
            ) {


                fallback.hidden =
                    true;

            }


        }


        catch (
            error
        ) {


            console.error(

                "Could not load finisher showcase:",

                error

            );

        }

    }



    loadFinisherShowcase();


})();
