// =================================
// OWL GLOBAL FAVICON
// =================================


function installOwlFavicon() {


    const faviconPath =
        "assets/images/branding/owl-favicon.png";


    const appleTouchIconPath =
        "assets/images/branding/apple-touch-icon.png";



    function ensureHeadLink(
        relValue,
        hrefValue,
        typeValue = ""
    ) {

        let link =
            document.head.querySelector(
                `link[rel="${relValue}"]`
            );


        if (!link) {

            link =
                document.createElement(
                    "link"
                );


            link.rel =
                relValue;


            document.head.appendChild(
                link
            );

        }


        link.href =
            hrefValue;


        if (typeValue) {

            link.type =
                typeValue;

        }


        return link;

    }



    ensureHeadLink(
        "icon",
        faviconPath,
        "image/png"
    );


    ensureHeadLink(
        "shortcut icon",
        faviconPath,
        "image/png"
    );


    const appleTouchIcon =
        ensureHeadLink(
            "apple-touch-icon",
            appleTouchIconPath,
            "image/png"
        );


    appleTouchIcon.sizes =
        "180x180";



    let themeColor =
        document.head.querySelector(
            'meta[name="theme-color"]'
        );


    if (!themeColor) {

        themeColor =
            document.createElement(
                "meta"
            );


        themeColor.name =
            "theme-color";


        document.head.appendChild(
            themeColor
        );

    }


    themeColor.content =
        "#080a0b";

}



installOwlFavicon();



// =================================
// OWL SIGNATURE SERIES NAVIGATION
// =================================


function installSignatureSeriesNavigation() {


    const navigationBars =

        document.querySelectorAll(
            ".site-nav, .landscape-main-nav"
        );


    navigationBars.forEach(

        navigationBar => {


            const existingLink =

                navigationBar.querySelector(
                    'a[href="signature-series.html"]'
                );


            if (
                existingLink
            ) {

                return;

            }


            const signatureSeriesLink =

                document.createElement(
                    "a"
                );


            signatureSeriesLink.href =
                "signature-series.html";


            signatureSeriesLink.textContent =
    "SIGNATURE SERIES";


            const currentPage =

                window.location.pathname
                    .split("/")
                    .pop();


                        const signatureSeriesPages = [

                "signature-series.html",

                "one-off-tournaments.html",

                "tournament.html",

                "signature-matches.html",

                "power-players.html",

                "proving-ground.html"

            ];


            if (
                signatureSeriesPages.includes(
                    currentPage
                )
            ) {

                signatureSeriesLink.classList.add(
                    "active"
                );

            }


            const owlSocialLink =

                navigationBar.querySelector(
                    'a[href="owl-social.html"]'
                );


            if (
                owlSocialLink
            ) {

                navigationBar.insertBefore(

                    signatureSeriesLink,

                    owlSocialLink

                );

            }


            else {

                navigationBar.appendChild(
                    signatureSeriesLink
                );

            }

        }

    );

}



installSignatureSeriesNavigation();



// =================================
// OWL OFFICIAL SOCIAL LINKS
// =================================


const owlOfficialSocialPages = [


    {

        name:
            "X / Twitter",

        url:
            "https://x.com/WeAreTheOWLefed",

        className:
            "owl-social-x",

        icon:
            `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path
                        fill="currentColor"
                        d="M18.244 2.25h3.308l-7.227 8.26
                        8.502 11.24H16.17l-5.214-6.817
                        L4.99 21.75H1.68l7.73-8.835
                        L1.254 2.25H8.08l4.713 6.231
                        5.451-6.231Zm-1.161 17.52h1.833
                        L7.084 4.126H5.117L17.083 19.77Z"
                    >
                    </path>
                </svg>
            `

    },


    {

        name:
            "Instagram",

        url:
            "https://www.instagram.com/WeAreTheOWLefed",

        className:
            "owl-social-instagram",

        icon:
            `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                >
                    <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                    </rect>

                    <circle
                        cx="12"
                        cy="12"
                        r="4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                    </circle>

                    <circle
                        cx="17.4"
                        cy="6.7"
                        r="1.1"
                        fill="currentColor"
                    >
                    </circle>
                </svg>
            `

    },


    {

        name:
            "YouTube",

        url:
    "https://www.youtube.com/@WeAreTheOWLefed",

        className:
            "owl-social-youtube",

        icon:
            `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path
                        fill="currentColor"
                        d="M23.5 6.2a3 3 0 0 0-2.1-2.1
                        C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5
                        A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12
                        a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1
                        c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5
                        a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12
                        a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4
                        l6.3 3.6-6.3 3.6Z"
                    >
                    </path>
                </svg>
            `

    }


];



function installOwlOfficialSocialLinks() {


    const navigationBars =

        document.querySelectorAll(

            ".site-nav, .landscape-main-nav"

        );


    navigationBars.forEach(

        navigationBar => {


            const alreadyInstalled =

                Array.from(
                    navigationBar.children
                ).some(

                    child =>

                        child.classList

                        &&

                        child.classList.contains(
                            "owl-social-links"
                        )

                );


            if (
                alreadyInstalled
            ) {

                return;

            }


            const socialGroup =

                document.createElement(
                    "div"
                );


            socialGroup.className =
                "owl-social-links";


            socialGroup.setAttribute(
                "role",
                "group"
            );


            socialGroup.setAttribute(
                "aria-label",
                "OWL official social media"
            );


            owlOfficialSocialPages.forEach(

                socialPage => {


                    const socialLink =

                        document.createElement(
                            "a"
                        );


                    socialLink.className =

                        `owl-social-link ${socialPage.className}`;


                    socialLink.href =
                        socialPage.url;


                    socialLink.target =
                        "_blank";


                    socialLink.rel =
                        "noopener noreferrer";


                    socialLink.title =
                        socialPage.name;


                    socialLink.setAttribute(

                        "aria-label",

                        `${socialPage.name} — opens in a new tab`

                    );


                    socialLink.innerHTML =
                        socialPage.icon;


                    socialGroup.appendChild(
                        socialLink
                    );

                }

            );


            navigationBar.appendChild(
                socialGroup
            );

        }

    );

}



installOwlOfficialSocialLinks();

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
// =================================
// SITE-WIDE BACK TO TOP
// =================================


function setupSiteBackToTop() {


    if (
        document.getElementById(
            "site-back-to-top"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.textContent = `

        .site-back-to-top {

            position:
                fixed;

            right:
                24px;

            bottom:
                24px;

            z-index:
                120;

            display:
                grid;

            place-items:
                center;

            width:
                52px;

            height:
                52px;

            padding:
                0;

            background:
                #c6a15b;

            border:
                1px solid
                #c6a15b;

            border-radius:
                50%;

            box-shadow:
                0 12px 30px
                rgba(0, 0, 0, 0.42);

            color:
                #080a0b;

            cursor:
                pointer;

            font:
                inherit;

            font-size:
                1.35rem;

            font-weight:
                900;

            line-height:
                1;

            opacity:
                0;

            pointer-events:
                none;

            transform:
                translateY(16px);

            transition:
                opacity 0.2s ease,
                transform 0.2s ease,
                background 0.2s ease,
                border-color 0.2s ease;

        }


        .site-back-to-top.is-visible {

            opacity:
                1;

            pointer-events:
                auto;

            transform:
                translateY(0);

        }


        .site-back-to-top:hover {

            background:
                #f5f5f2;

            border-color:
                #f5f5f2;

        }


        .site-back-to-top:focus-visible {

            outline:
                3px solid
                #f5f5f2;

            outline-offset:
                4px;

        }


        @media (max-width: 600px) {

            .site-back-to-top {

                right:
                    16px;

                bottom:
                    16px;

                width:
                    46px;

                height:
                    46px;

                font-size:
                    1.15rem;

            }

        }


        @media (prefers-reduced-motion: reduce) {

            .site-back-to-top {

                transition:
                    none;

            }

        }

    `;


    document.head.appendChild(
        style
    );


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "site-back-to-top";


    button.className =
        "site-back-to-top";


    button.type =
        "button";


    button.textContent =
        "↑";


    button.setAttribute(
        "aria-label",
        "Back to top"
    );


    button.title =
        "Back to top";


    document.body.appendChild(
        button
    );


    function updateSiteBackToTop() {


        button.classList.toggle(
            "is-visible",
            window.scrollY > 600
        );

    }


    button.addEventListener(
        "click",
        () => {


            const reduceMotion =
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;


            window.scrollTo(
                {
                    top:
                        0,

                    behavior:
                        reduceMotion
                            ? "auto"
                            : "smooth"
                }
            );

        }
    );


    window.addEventListener(
        "scroll",
        updateSiteBackToTop,
        {
            passive:
                true
        }
    );


    updateSiteBackToTop();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        setupSiteBackToTop
    );

}


else {

    setupSiteBackToTop();

}
