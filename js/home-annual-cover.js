// =================================
// HOME ANNUAL COVER REVEAL
// =================================


(() => {


    const section =
        document.getElementById(
            "home-annual-cover-section"
        );


    if (
        !section
    ) {

        return;

    }


    const elements = {

        heading:
            document.getElementById(
                "home-annual-cover-heading"
            ),

        men: {

            image:
                document.getElementById(
                    "home-cover-men-image"
                ),

            placeholder:
                document.getElementById(
                    "home-cover-men-placeholder"
                ),

            name:
                document.getElementById(
                    "home-cover-men-name"
                ),

            company:
                document.getElementById(
                    "home-cover-men-company"
                ),

            score:
                document.getElementById(
                    "home-cover-men-score"
                ),

            link:
                document.getElementById(
                    "home-cover-men-link"
                )

        },

        women: {

            image:
                document.getElementById(
                    "home-cover-women-image"
                ),

            placeholder:
                document.getElementById(
                    "home-cover-women-placeholder"
                ),

            name:
                document.getElementById(
                    "home-cover-women-name"
                ),

            company:
                document.getElementById(
                    "home-cover-women-company"
                ),

            score:
                document.getElementById(
                    "home-cover-women-score"
                ),

            link:
                document.getElementById(
                    "home-cover-women-link"
                )

        }

    };


    function asArray(
        value
    ) {

        return Array.isArray(
            value
        )

            ? value

            : [];

    }


    function renderWinner(
        winner,
        presentation,
        target
    ) {

        target.name.textContent =
            winner.name ||
            "Cover Star";


        target.company.textContent =
            winner.companyName ||
            winner.companyId ||
            "Company not recorded";


        target.score.textContent =

            `FINAL SCORE: ${
                winner.totalScore ??
                "—"
            }`;


        if (
            winner.candidateType !==
                "external"

            &&

            winner.wrestlerId
        ) {

            target.link.href =

                `wrestler.html?id=${
                    encodeURIComponent(
                        winner.wrestlerId
                    )
                }`;


            target.link.textContent =
                "View wrestler profile →";

        }


        else {

            target.link.href =
                "trophy-room.html";


            target.link.textContent =
                "View Trophy Room entry →";

        }


        const imagePath =
            presentation?.image ||
            "";


        if (
            imagePath
        ) {

            target.image.src =
                imagePath;


            target.image.alt =
                `${winner.name || "OWL"} annual video-game cover`;


            target.image.hidden =
                false;


            target.placeholder.hidden =
                true;


            target.image.addEventListener(
                "error",
                () => {

                    target.image.hidden =
                        true;


                    target.placeholder.hidden =
                        false;

                },
                {
                    once:
                        true
                }
            );

        }

    }


    async function loadAnnualCover() {

        try {

            const response =
                await fetch(
                    "data/annual-covers.json",
                    {
                        cache:
                            "no-store"
                    }
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    "Could not load annual-covers.json."
                );

            }


            const database =
                await response.json();


            const published =

                asArray(
                    database?.editions
                )

                    .filter(
                        edition =>

                            edition?.status ===
                                "published"

                            &&

                            edition
                                ?.winners
                                ?.men

                            &&

                            edition
                                ?.winners
                                ?.women

                            &&

                            edition
                                ?.presentation
                                ?.men
                                ?.image

                            &&

                            edition
                                ?.presentation
                                ?.women
                                ?.image
                    )

                    .sort(
                        (
                            first,
                            second
                        ) =>

                            Number(
                                second?.year ||
                                0
                            )

                            -

                            Number(
                                first?.year ||
                                0
                            )
                    );


            const edition =
                published[0];


            if (
                !edition
            ) {

                return;

            }


            elements.heading.textContent =
                `${edition.year} Annual Cover Stars`;


            renderWinner(

                edition.winners.men,

                edition.presentation.men,

                elements.men

            );


            renderWinner(

                edition.winners.women,

                edition.presentation.women,

                elements.women

            );


            section.hidden =
                false;

        }


        catch (
            error
        ) {

            console.warn(
                "Could not render the Annual Cover homepage reveal:",
                error
            );

        }

    }


    loadAnnualCover();


})();
