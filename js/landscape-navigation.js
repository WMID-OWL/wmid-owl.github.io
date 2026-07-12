// =================================
// THE LANDSCAPE
// MOBILE NAVIGATION
// =================================


const landscapeNavToggle =
    document.querySelector(
        ".landscape-nav-toggle"
    );


const landscapeMainNav =
    document.querySelector(
        ".landscape-main-nav"
    );


if (
    landscapeNavToggle

    &&

    landscapeMainNav
) {


    function landscapeOpenNavigation() {


        landscapeMainNav.classList.add(
            "open"
        );


        document.body.classList.add(
            "landscape-nav-open"
        );


        landscapeNavToggle.setAttribute(
            "aria-expanded",
            "true"
        );


        landscapeNavToggle.setAttribute(
            "aria-label",
            "Close navigation"
        );


        landscapeNavToggle.textContent =
            "×";

    }



    function landscapeCloseNavigation() {


        landscapeMainNav.classList.remove(
            "open"
        );


        document.body.classList.remove(
            "landscape-nav-open"
        );


        landscapeNavToggle.setAttribute(
            "aria-expanded",
            "false"
        );


        landscapeNavToggle.setAttribute(
            "aria-label",
            "Open navigation"
        );


        landscapeNavToggle.textContent =
            "☰";

    }



    landscapeNavToggle.addEventListener(

        "click",

        event => {


            event.stopPropagation();


            if (
                landscapeMainNav.classList.contains(
                    "open"
                )
            ) {

                landscapeCloseNavigation();

            }


            else {

                landscapeOpenNavigation();

            }

        }

    );



    landscapeMainNav

        .querySelectorAll(
            "a"
        )

        .forEach(
            link => {


                link.addEventListener(
                    "click",
                    landscapeCloseNavigation
                );

            }
        );



    document.addEventListener(

        "click",

        event => {


            if (
                !landscapeMainNav.classList.contains(
                    "open"
                )
            ) {

                return;

            }


            if (
                landscapeMainNav.contains(
                    event.target
                )

                ||

                landscapeNavToggle.contains(
                    event.target
                )
            ) {

                return;

            }


            landscapeCloseNavigation();

        }

    );



    document.addEventListener(

        "keydown",

        event => {


            if (
                event.key === "Escape"
            ) {

                landscapeCloseNavigation();

            }

        }

    );



    window.addEventListener(

        "resize",

        () => {


            if (
                window.innerWidth > 900
            ) {

                landscapeCloseNavigation();

            }

        }

    );



    landscapeCloseNavigation();

}
