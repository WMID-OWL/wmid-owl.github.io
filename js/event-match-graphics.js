(() => {
    "use strict";


    const lightbox =
        document.getElementById(
            "event-match-graphic-lightbox"
        );


    const lightboxImage =
        document.getElementById(
            "event-match-graphic-lightbox-image"
        );


    const closeButton =
        document.getElementById(
            "event-match-graphic-lightbox-close"
        );


    if (
        !lightbox
        ||
        !lightboxImage
        ||
        !closeButton
    ) {

        return;

    }


    let previousFocus =
        null;



    function openLightbox(
        trigger
    ) {


        const source =
            String(
                trigger?.dataset
                    ?.matchGraphicSrc
                ||
                ""
            ).trim();


        if (!source) {

            return;

        }


        previousFocus =
            document.activeElement;


        lightboxImage.src =
            source;


        lightbox.hidden =
            false;


        document.body.classList.add(
            "event-match-lightbox-open"
        );


        closeButton.focus();

    }



    function closeLightbox() {


        if (lightbox.hidden) {

            return;

        }


        lightbox.hidden =
            true;


        lightboxImage.removeAttribute(
            "src"
        );


        document.body.classList.remove(
            "event-match-lightbox-open"
        );


        if (
            previousFocus

            &&

            typeof previousFocus.focus ===
                "function"
        ) {

            previousFocus.focus();

        }


        previousFocus =
            null;

    }



    document.addEventListener(
        "click",
        event => {


            if (
                !(event.target instanceof Element)
            ) {

                return;

            }


            const trigger =
                event.target.closest(
                    "[data-match-graphic-src]"
                );


            if (!trigger) {

                return;

            }


            event.preventDefault();


            openLightbox(
                trigger
            );

        }
    );


    closeButton.addEventListener(
        "click",
        closeLightbox
    );


    lightbox.addEventListener(
        "click",
        event => {


            if (
                event.target ===
                    lightbox
            ) {

                closeLightbox();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {


            if (
                event.key ===
                    "Escape"

                &&

                !lightbox.hidden
            ) {

                closeLightbox();

            }

        }
    );

})();
