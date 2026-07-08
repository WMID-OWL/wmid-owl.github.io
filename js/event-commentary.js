// =================================
// OWL EVENT COMMENTARY TEAMS
// =================================


const eventCommentaryTeams = {


    ascension: {

        playByPlay:
            "Cichael Mole",

        color:
            "Rim Joss"

    },


    revolt: {

        playByPlay:
            "Tony Salami",

        color:
            "Corey Crypts"

    }

};



// =================================
// ELEMENTS
// =================================


const eventBrandElement =
    document.getElementById(
        "event-brand"
    );


const commentarySection =
    document.getElementById(
        "event-commentary-team"
    );


const playByPlayName =
    document.getElementById(
        "event-play-by-play-name"
    );


const colorName =
    document.getElementById(
        "event-color-name"
    );



// =================================
// RENDER COMMENTARY TEAM
// =================================


function renderEventCommentaryTeam() {


    const brand = String(

        eventBrandElement
            ?.textContent || ""

    )
        .trim()
        .toLowerCase();



    let team =
        null;



    if (
        brand.includes(
            "ascension"
        )
    ) {

        team =
            eventCommentaryTeams.ascension;

    }


    else if (
        brand.includes(
            "revolt"
        )
    ) {

        team =
            eventCommentaryTeams.revolt;

    }



    if (
        !team
    ) {

        commentarySection.hidden =
            true;


        return;

    }



    playByPlayName.textContent =
        team.playByPlay;


    colorName.textContent =
        team.color;


    commentarySection.hidden =
        false;

}



// =================================
// WATCH DYNAMIC EVENT BRAND
// =================================


if (
    eventBrandElement
)
{

    renderEventCommentaryTeam();


    const commentaryObserver =
        new MutationObserver(

            renderEventCommentaryTeam

        );


    commentaryObserver.observe(

        eventBrandElement,

        {

            childList:
                true,

            characterData:
                true,

            subtree:
                true

        }

    );

}
