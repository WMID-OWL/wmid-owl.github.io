// =================================
// OWL GLOBAL MOBILE NAVIGATION
// =================================


const navToggle =
    document.querySelector(
        ".nav-toggle"
    );


const siteNav =
    document.querySelector(
        ".site-nav"
    );


if (
    navToggle

    &&

    siteNav
) {


    if (!siteNav.id) {

        siteNav.id =
            "site-navigation";

    }


    navToggle.setAttribute(
        "aria-controls",
        siteNav.id
    );


    function openSiteNav() {


        siteNav.classList.add(
            "open"
        );


        document.body.classList.add(
            "nav-open"
        );


        navToggle.setAttribute(
            "aria-expanded",
            "true"
        );


        navToggle.setAttribute(
            "aria-label",
            "Close navigation"
        );


        navToggle.textContent =
            "×";

    }



    function closeSiteNav() {


        siteNav.classList.remove(
            "open"
        );


        document.body.classList.remove(
            "nav-open"
        );


        navToggle.setAttribute(
            "aria-expanded",
            "false"
        );


        navToggle.setAttribute(
            "aria-label",
            "Open navigation"
        );


        navToggle.textContent =
            "☰";

    }



    function toggleSiteNav() {


        if (
            siteNav.classList.contains(
                "open"
            )
        ) {

            closeSiteNav();

        }


        else {

            openSiteNav();

        }

    }



    navToggle.addEventListener(
        "click",
        toggleSiteNav
    );



    siteNav

        .querySelectorAll(
            "a"
        )

        .forEach(
            link => {


                link.addEventListener(
                    "click",
                    closeSiteNav
                );

            }
        );



    document.addEventListener(
        "click",
        event => {


            if (
                !siteNav.classList.contains(
                    "open"
                )
            ) {

                return;

            }


            if (
                siteNav.contains(
                    event.target
                )

                ||

                navToggle.contains(
                    event.target
                )
            ) {

                return;

            }


            closeSiteNav();

        }
    );



    document.addEventListener(
        "keydown",
        event => {


            if (
                event.key === "Escape"
            ) {

                closeSiteNav();

            }

        }
    );



    window.addEventListener(
        "resize",
        () => {


            if (
                window.innerWidth > 820
            ) {

                closeSiteNav();

            }

        }
    );



    closeSiteNav();

}
