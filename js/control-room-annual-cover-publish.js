// =================================
// OWL ANNUAL COVER
// WINNER FINALIZATION AND PUBLISHING
// =================================


(() => {


    const DIVISIONS = {

        men: {
            label:
                "Men’s",

            trophyTitle:
                "Men’s Cover Star"
        },

        women: {
            label:
                "Women’s",

            trophyTitle:
                "Women’s Cover Star"
        }

    };


    const byId =
        id =>
            document.getElementById(
                id
            );


    const asArray =
        value =>
            Array.isArray(
                value
            )

                ? value

                : [];


    const text =
        value =>
            String(
                value || ""
            ).trim();


    const numeric =
        value => {

            const parsed =
                Number(
                    value
                );


            return Number.isFinite(
                parsed
            )

                ? parsed

                : null;

        };


    const els = {

        panel:
            byId(
                "cr-tool-annual-cover"
            ),

        year:
            byId(
                "cr-cover-year"
            ),

        publicYear:
            byId(
                "cr-cover-public-year"
            ),

        finalizationStatus:
            byId(
                "cr-cover-finalization-status"
            ),

        menName:
            byId(
                "cr-cover-final-men-name"
            ),

        menCompany:
            byId(
                "cr-cover-final-men-company"
            ),

        menScore:
            byId(
                "cr-cover-final-men-score"
            ),

        menState:
            byId(
                "cr-cover-final-men-state"
            ),

        menFinalize:
            byId(
                "cr-cover-finalize-men"
            ),

        womenName:
            byId(
                "cr-cover-final-women-name"
            ),

        womenCompany:
            byId(
                "cr-cover-final-women-company"
            ),

        womenScore:
            byId(
                "cr-cover-final-women-score"
            ),

        womenState:
            byId(
                "cr-cover-final-women-state"
            ),

        womenFinalize:
            byId(
                "cr-cover-finalize-women"
            ),

        menArt:
            byId(
                "cr-cover-men-art"
            ),

        womenArt:
            byId(
                "cr-cover-women-art"
            ),

        savePresentation:
            byId(
                "cr-cover-save-presentation"
            ),

        publish:
            byId(
                "cr-cover-publish"
            ),

        message:
            byId(
                "cr-cover-publish-message"
            )

    };


    if (
        !els.panel ||
        !els.publish
    ) {

        return;

    }


    let busy =
        false;


    let renderedYear =
        null;


    // =================================
    // DATABASE HELPERS
    // =================================


    function annualCoverDatabase() {

        const database =
            owlControlRoomData
                ?.annualCovers;


        if (
            !database

            ||

            Array.isArray(
                database
            )

            ||

            typeof database !==
                "object"
        ) {

            return {

                version:
                    1,

                releaseSchedule: {
                    month:
                        4,

                    week:
                        4
                },

                formula: {
                    performance:
                        0.5,

                    prominence:
                        0.25,

                    companyPrestige:
                        0.15,

                    randomness:
                        0.1
                },

                editions:
                    []

            };

        }


        return {

            ...database,

            editions:
                asArray(
                    database.editions
                )

        };

    }


    function achievementDatabase() {

        const database =
            owlControlRoomData
                ?.careerAchievements;


        if (
            !database

            ||

            Array.isArray(
                database
            )

            ||

            typeof database !==
                "object"
        ) {

            return {

                version:
                    1,

                achievements:
                    []

            };

        }


        return {

            ...database,

            achievements:
                asArray(
                    database.achievements
                )

        };

    }


    function currentYear() {

        return Number(
            els.year?.value ||
            0
        );

    }


    function currentEdition() {

        return annualCoverDatabase()
            .editions
            .find(
                edition =>

                    Number(
                        edition?.year
                    ) ===
                    currentYear()
            )

        ||

        null;

    }


    function editionCandidates(
        edition,
        division
    ) {

        return asArray(
            edition
                ?.ballots
                ?.[
                    division
                ]
        );

    }


    // =================================
    // WINNER CALCULATION
    // =================================


    function candidateIsComplete(
        candidate
    ) {

        return Boolean(

            candidate

            &&

            text(
                candidate.name
            )

            &&

            text(
                candidate.companyId
            )

            &&

            numeric(
                candidate.performance
            ) !==
                null

            &&

            numeric(
                candidate.prominence
            ) !==
                null

            &&

            numeric(
                candidate.companyPrestige
            ) !==
                null

            &&

            candidate.randomLocked ===
                true

            &&

            numeric(
                candidate.randomScore
            ) !==
                null

            &&

            numeric(
                candidate.totalScore
            ) !==
                null

        );

    }


    function compareCandidates(
        first,
        second
    ) {

        const fields = [

            "totalScore",
            "performance",
            "prominence",
            "companyPrestige",
            "randomScore"

        ];


        for (
            const field
            of fields
        ) {

            const difference =

                Number(
                    second?.[
                        field
                    ] ||
                    0
                )

                -

                Number(
                    first?.[
                        field
                    ] ||
                    0
                );


            if (
                difference !==
                0
            ) {

                return difference;

            }

        }


        return String(
            first?.name ||
            ""
        ).localeCompare(
            String(
                second?.name ||
                ""
            )
        );

    }


    function calculatedWinner(
        edition,
        division
    ) {

        const candidates =
            editionCandidates(
                edition,
                division
            );


        if (
            candidates.length !==
                5

            ||

            !candidates.every(
                candidateIsComplete
            )
        ) {

            return null;

        }


        return [
            ...candidates
        ]
            .sort(
                compareCandidates
            )[0]

        ||

        null;

    }


    function storedWinner(
        edition,
        division
    ) {

        const winner =
            edition
                ?.winners
                ?.[
                    division
                ];


        return (
            winner &&
            typeof winner ===
                "object"

                ? winner

                : null
        );

    }


    function winnerMatchesCalculation(
        edition,
        division
    ) {

        const stored =
            storedWinner(
                edition,
                division
            );


        const calculated =
            calculatedWinner(
                edition,
                division
            );


        if (
            !stored ||
            !calculated
        ) {

            return false;

        }


        return (

            stored.candidateId ===
                calculated.id

            &&

            Number(
                stored.totalScore
            ) ===
                Number(
                    calculated.totalScore
                )
        );

    }


    function createWinnerRecord(
        candidate,
        division
    ) {

        return {

            division,

            candidateId:
                candidate.id,

            candidateType:
                candidate.candidateType ===
                    "external"

                    ? "external"

                    : "owl",

            wrestlerId:
                candidate.candidateType ===
                    "external"

                    ? ""

                    : candidate.wrestlerId ||
                        "",

            name:
                candidate.name,

            companyId:
                candidate.companyId,

            companyName:
                candidate.companyName,

            performance:
                Number(
                    candidate.performance
                ),

            prominence:
                Number(
                    candidate.prominence
                ),

            companyPrestige:
                Number(
                    candidate.companyPrestige
                ),

            prestigePeriodId:
                candidate.prestigePeriodId ||
                "",

            randomScore:
                Number(
                    candidate.randomScore
                ),

            totalScore:
                Number(
                    candidate.totalScore
                ),

            finalizedAt:
                new Date()
                    .toISOString()

        };

    }


    // =================================
    // STATUS AND MESSAGES
    // =================================


    function displayStatus(
        edition
    ) {

        if (!edition) {

            return "NO SAVED EDITION";

        }


        return text(
            edition.status ||
            "draft"
        )
            .replaceAll(
                "-",
                " "
            )
            .toUpperCase();

    }


    function setMessage(
        message,
        type = "success"
    ) {

        els.message.textContent =
            message;


        els.message.className =

            `cr-save-message ${
                type ===
                    "error"

                    ? "save-error"

                    : "save-success"
            }`;


        els.message.hidden =
            false;

    }


    function clearMessage() {

        els.message.hidden =
            true;


        els.message.textContent =
            "";

    }


    // =================================
    // FILE WRITING
    // =================================


    async function writeRootJson(
        fileName,
        value
    ) {

        if (
            !owlRepositoryHandle
        ) {

            throw new Error(
                "Connect the OWL repository first."
            );

        }


        const options = {
            mode:
                "readwrite"
        };


        let permission =
            await owlRepositoryHandle
                .queryPermission(
                    options
                );


        if (
            permission !==
                "granted"
        ) {

            permission =
                await owlRepositoryHandle
                    .requestPermission(
                        options
                    );

        }


        if (
            permission !==
                "granted"
        ) {

            throw new Error(
                "Repository write permission was not granted."
            );

        }


        const dataDirectory =
            await owlRepositoryHandle
                .getDirectoryHandle(
                    "data"
                );


        const fileHandle =
            await dataDirectory
                .getFileHandle(
                    fileName
                );


        const writable =
            await fileHandle
                .createWritable();


        try {

            await writable.write(

                `${JSON.stringify(
                    value,
                    null,
                    2
                )}\n`

            );


            await writable.close();

        }


        catch (
            error
        ) {

            try {

                await writable.abort();

            }


            catch {

                // No additional action required.

            }


            throw error;

        }

    }


    async function saveEdition(
        edition
    ) {

        const database =
            annualCoverDatabase();


        const updated = {

            ...database,

            editions: [

                edition,

                ...database.editions.filter(
                    item =>

                        Number(
                            item?.year
                        ) !==
                        Number(
                            edition.year
                        )
                )

            ].sort(
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
            )

        };


        await writeRootJson(
            "annual-covers.json",
            updated
        );


        owlControlRoomData.annualCovers =
            updated;


        window.dispatchEvent(

            new CustomEvent(
                "owl-annual-covers-updated"
            )

        );


        return updated;

    }


    // =================================
    // RENDERING
    // =================================


    function renderDivision(
        edition,
        division
    ) {

        const calculated =
            calculatedWinner(
                edition,
                division
            );


        const stored =
            storedWinner(
                edition,
                division
            );


        const elements =

            division ===
                "men"

                ? {

                    name:
                        els.menName,

                    company:
                        els.menCompany,

                    score:
                        els.menScore,

                    state:
                        els.menState,

                    button:
                        els.menFinalize

                }

                : {

                    name:
                        els.womenName,

                    company:
                        els.womenCompany,

                    score:
                        els.womenScore,

                    state:
                        els.womenState,

                    button:
                        els.womenFinalize

                };


        if (
            stored
        ) {

            elements.name.textContent =
                stored.name ||
                "Finalized Winner";


            elements.company.textContent =
                stored.companyName ||
                stored.companyId ||
                "Company not recorded";


            elements.score.textContent =
                numeric(
                    stored.totalScore
                ) ??
                "—";


            elements.state.textContent =
                "FINALIZED";


            elements.state.className =
                "cr-cover-winner-state is-finalized";


            elements.button.textContent =
                `${DIVISIONS[division].label} Winner Finalized`;


            elements.button.disabled =
                true;


            return;

        }


        if (
            calculated
        ) {

            elements.name.textContent =
                calculated.name;


            elements.company.textContent =
                calculated.companyName ||
                calculated.companyId ||
                "Company not recorded";


            elements.score.textContent =
                calculated.totalScore;


            elements.state.textContent =
                "READY";


            elements.state.className =
                "cr-cover-winner-state is-ready";


            elements.button.textContent =
                `Finalize ${DIVISIONS[division].label} Winner`;


            elements.button.disabled =
                busy;


            return;

        }


        const completed =
            editionCandidates(
                edition,
                division
            )
                .filter(
                    candidateIsComplete
                )
                .length;


        elements.name.textContent =
            "Winner Pending";


        elements.company.textContent =
            `${completed} of 5 candidates canon-locked.`;


        elements.score.textContent =
            "—";


        elements.state.textContent =
            "BLOCKED";


        elements.state.className =
            "cr-cover-winner-state";


        elements.button.textContent =
            `Finalize ${DIVISIONS[division].label} Winner`;


        elements.button.disabled =
            true;

    }


    function artworkValues() {

        return {

            men:
                text(
                    els.menArt.value
                ),

            women:
                text(
                    els.womenArt.value
                )

        };

    }


    function refreshActionState() {

        const edition =
            currentEdition();


        const art =
            artworkValues();


        const bothWinners =
            Boolean(

                storedWinner(
                    edition,
                    "men"
                )

                &&

                storedWinner(
                    edition,
                    "women"
                )

            );


        els.savePresentation.disabled =

            busy

            ||

            !edition

            ||

            (
                !art.men &&
                !art.women
            );


        els.publish.disabled =

            busy

            ||

            !edition

            ||

            !bothWinners

            ||

            !art.men

            ||

            !art.women

            ||

            !winnerMatchesCalculation(
                edition,
                "men"
            )

            ||

            !winnerMatchesCalculation(
                edition,
                "women"
            );


        els.publish.textContent =

            edition?.status ===
                "published"

                ? "Update Published Covers"

                : "Publish Annual Covers";

    }


    function render(
        forceArtworkRefresh = false
    ) {

        const edition =
            currentEdition();


        const year =
            currentYear();


        els.publicYear.textContent =
            year ||
            "—";


        els.finalizationStatus.textContent =
            displayStatus(
                edition
            );


        renderDivision(
            edition,
            "men"
        );


        renderDivision(
            edition,
            "women"
        );


        if (
            forceArtworkRefresh

            ||

            renderedYear !==
                year
        ) {

            els.menArt.value =
                edition
                    ?.presentation
                    ?.men
                    ?.image

                ||

                "";


            els.womenArt.value =
                edition
                    ?.presentation
                    ?.women
                    ?.image

                ||

                "";


            renderedYear =
                year;

        }


        refreshActionState();

    }


    // =================================
    // WINNER FINALIZATION
    // =================================


    async function finalizeWinner(
        division
    ) {

        if (
            busy
        ) {

            return;

        }


        clearMessage();


        const edition =
            currentEdition();


        if (
            !edition
        ) {

            setMessage(
                "Save the annual cover edition before finalizing a winner.",
                "error"
            );


            return;

        }


        if (
            storedWinner(
                edition,
                division
            )
        ) {

            setMessage(
                `${DIVISIONS[division].label} winner is already finalized.`,
                "error"
            );


            return;

        }


        const winner =
            calculatedWinner(
                edition,
                division
            );


        if (
            !winner
        ) {

            setMessage(
                `All five ${DIVISIONS[division].label.toLowerCase()} candidates must have complete canon-locked scores.`,
                "error"
            );


            return;

        }


        const approved =
            window.confirm(

                `Finalize ${winner.name} as the ${edition.year} ${DIVISIONS[division].label} cover star?\n\n`

                +

                `Weighted Score: ${winner.totalScore}\n`

                +

                `Company: ${winner.companyName || winner.companyId}\n\n`

                +

                "The winner is determined by the locked formula and tie-break rules. This confirmation is permanent."

            );


        if (
            !approved
        ) {

            return;

        }


        busy =
            true;


        refreshActionState();


        try {

            const updatedEdition = {

                ...edition,

                winners: {

                    ...(
                        edition.winners ||
                        {}
                    ),

                    [
                        division
                    ]:
                        createWinnerRecord(
                            winner,
                            division
                        )

                },

                status:

                    storedWinner(
                        edition,
                        division ===
                            "men"

                            ? "women"

                            : "men"
                    )

                        ? "winners-finalized"

                        : "partially-finalized",

                updatedAt:
                    new Date()
                        .toISOString()

            };


            await saveEdition(
                updatedEdition
            );


            setMessage(

                `${winner.name} is the finalized ${edition.year} ${DIVISIONS[division].label} cover star.`

            );


            render(
                true
            );

        }


        catch (
            error
        ) {

            console.error(
                "Could not finalize Annual Cover winner:",
                error
            );


            setMessage(

                error.message

                ||

                "Could not finalize the Annual Cover winner.",

                "error"

            );

        }


        finally {

            busy =
                false;


            render();

        }

    }


    // =================================
    // COVER ARTWORK
    // =================================


    async function savePresentation() {

        if (
            busy
        ) {

            return;

        }


        clearMessage();


        const edition =
            currentEdition();


        if (
            !edition
        ) {

            setMessage(
                "Save the annual cover edition first.",
                "error"
            );


            return;

        }


        const art =
            artworkValues();


        if (
            !art.men &&
            !art.women
        ) {

            setMessage(
                "Enter at least one cover artwork path.",
                "error"
            );


            return;

        }


        const approved =
            window.confirm(
                `Save the ${edition.year} cover artwork paths?`
            );


        if (
            !approved
        ) {

            return;

        }


        busy =
            true;


        refreshActionState();


        try {

            const updatedEdition = {

                ...edition,

                presentation: {

                    men: {
                        ...(
                            edition
                                ?.presentation
                                ?.men

                            ||

                            {}
                        ),

                        image:
                            art.men
                    },

                    women: {
                        ...(
                            edition
                                ?.presentation
                                ?.women

                            ||

                            {}
                        ),

                        image:
                            art.women
                    }

                },

                updatedAt:
                    new Date()
                        .toISOString()

            };


            await saveEdition(
                updatedEdition
            );


            setMessage(
                `${edition.year} cover artwork paths saved.`
            );


            render(
                true
            );

        }


        catch (
            error
        ) {

            console.error(
                "Could not save Annual Cover artwork:",
                error
            );


            setMessage(

                error.message

                ||

                "Could not save the cover artwork paths.",

                "error"

            );

        }


        finally {

            busy =
                false;


            render();

        }

    }


    // =================================
    // TROPHY ROOM SYNCHRONIZATION
    // =================================


    function achievementId(
        year,
        division
    ) {

        return `annual-cover-${year}-${division}`;

    }


    function achievementDescription(
        winner,
        edition,
        division
    ) {

        if (
            winner.candidateType ===
                "external"
        ) {

            return (

                `${winner.name} of ${winner.companyName || winner.companyId} `

                +

                `was selected as the ${DIVISIONS[division].label.toLowerCase()} `

                +

                `cover star for OWL Wrestling ${edition.year}.`

            );

        }


        return (

            `${winner.name} earned the ${DIVISIONS[division].label.toLowerCase()} `

            +

            `cover of OWL Wrestling ${edition.year} by finishing first `

            +

            `in OWL’s five-candidate weighted annual selection.`

        );

    }


    function buildAchievement(
        edition,
        division,
        image,
        existing
    ) {

        const winner =
            storedWinner(
                edition,
                division
            );


        const now =
            new Date()
                .toISOString();


        const owlWinner =
            winner.candidateType !==
                "external";


        return {

            ...(
                existing ||
                {}
            ),

            id:
                achievementId(
                    edition.year,
                    division
                ),

            recipientType:
                owlWinner
                    ? "wrestler"
                    : "external",

            recipientId:
                owlWinner
                    ? winner.wrestlerId ||
                        ""
                    : "",

            recipientName:
                winner.name,

            category:
                "video-game-cover",

            categoryLabel:
                "Video Game Cover",

            title:

                `OWL Wrestling ${edition.year} `

                +

                `${DIVISIONS[division].trophyTitle}`,

            year:
                edition.year,

            date:
                "",

            source:
                `OWL Wrestling ${edition.year} — April, Week 4`,

            description:
                achievementDescription(
                    winner,
                    edition,
                    division
                ),

            image,

            link:
                "",

            visibility:
                "public",

            featured:
                owlWinner,

            createdAt:
                existing?.createdAt ||
                now,

            updatedAt:
                now

        };

    }


    async function synchronizeAchievements(
        edition,
        art
    ) {

        const database =
            achievementDatabase();


        const nowIds = [

            achievementId(
                edition.year,
                "men"
            ),

            achievementId(
                edition.year,
                "women"
            )

        ];


        const existingMap =
            new Map(

                database.achievements

                    .filter(
                        achievement =>

                            nowIds.includes(
                                achievement?.id
                            )
                    )

                    .map(
                        achievement => [

                            achievement.id,
                            achievement

                        ]
                    )

            );


        const generated = [

            buildAchievement(

                edition,

                "men",

                art.men,

                existingMap.get(
                    achievementId(
                        edition.year,
                        "men"
                    )
                )

            ),

            buildAchievement(

                edition,

                "women",

                art.women,

                existingMap.get(
                    achievementId(
                        edition.year,
                        "women"
                    )
                )

            )

        ];


        const updated = {

            ...database,

            version:
                Number(
                    database.version ||
                    1
                ),

            achievements: [

                ...generated,

                ...database.achievements.filter(
                    achievement =>

                        !nowIds.includes(
                            achievement?.id
                        )
                )

            ]

        };


        await writeRootJson(
            "career-achievements.json",
            updated
        );


        owlControlRoomData.careerAchievements =
            updated;


        window.dispatchEvent(

            new CustomEvent(
                "owl-career-achievements-updated"
            )

        );


        return updated;

    }


    // =================================
    // PUBLICATION
    // =================================


    async function publishEdition() {

        if (
            busy
        ) {

            return;

        }


        clearMessage();


        const edition =
            currentEdition();


        const art =
            artworkValues();


        if (
            !edition
        ) {

            setMessage(
                "Save the annual cover edition before publishing.",
                "error"
            );


            return;

        }


        if (
            !storedWinner(
                edition,
                "men"
            )

            ||

            !storedWinner(
                edition,
                "women"
            )
        ) {

            setMessage(
                "Finalize both cover winners before publishing.",
                "error"
            );


            return;

        }


        if (
            !winnerMatchesCalculation(
                edition,
                "men"
            )

            ||

            !winnerMatchesCalculation(
                edition,
                "women"
            )
        ) {

            setMessage(
                "A finalized winner no longer matches the locked ballot calculation. Publication was blocked.",
                "error"
            );


            return;

        }


        if (
            !art.men ||
            !art.women
        ) {

            setMessage(
                "Both finished cover artwork paths are required.",
                "error"
            );


            return;

        }


        const alreadyPublished =
            edition.status ===
                "published";


        const approved =
            window.confirm(

                alreadyPublished

                    ? `Update the published ${edition.year} annual covers and synchronized Trophy Room records?`

                    : `Publish the ${edition.year} men’s and women’s annual covers?\n\nThis creates permanent public Trophy Room records and activates the homepage reveal.`

            );


        if (
            !approved
        ) {

            return;

        }


        busy =
            true;


        refreshActionState();


        try {

            const publicationTime =
                new Date()
                    .toISOString();


            const editionWithPresentation = {

                ...edition,

                presentation: {

                    men: {
                        image:
                            art.men
                    },

                    women: {
                        image:
                            art.women
                    }

                }

            };


            await synchronizeAchievements(
                editionWithPresentation,
                art
            );


            const publishedEdition = {

                ...editionWithPresentation,

                status:
                    "published",

                publishedAt:
                    edition.publishedAt ||
                    publicationTime,

                updatedAt:
                    publicationTime,

                winners: {

                    men: {

                        ...edition.winners.men,

                        achievementId:
                            achievementId(
                                edition.year,
                                "men"
                            )

                    },

                    women: {

                        ...edition.winners.women,

                        achievementId:
                            achievementId(
                                edition.year,
                                "women"
                            )

                    }

                }

            };


            await saveEdition(
                publishedEdition
            );


            setMessage(

                alreadyPublished

                    ? `${edition.year} published covers and Trophy Room records were updated.`

                    : `${edition.year} annual covers were published successfully.`

            );


            render(
                true
            );

        }


        catch (
            error
        ) {

            console.error(
                "Could not publish Annual Covers:",
                error
            );


            setMessage(

                error.message

                ||

                "Could not publish the Annual Covers.",

                "error"

            );

        }


        finally {

            busy =
                false;


            render();

        }

    }


    // =================================
    // EVENTS
    // =================================


    els.menFinalize.addEventListener(
        "click",
        () =>
            finalizeWinner(
                "men"
            )
    );


    els.womenFinalize.addEventListener(
        "click",
        () =>
            finalizeWinner(
                "women"
            )
    );


    els.savePresentation.addEventListener(
        "click",
        savePresentation
    );


    els.publish.addEventListener(
        "click",
        publishEdition
    );


    [
        els.menArt,
        els.womenArt
    ].forEach(
        field => {

            field.addEventListener(
                "input",
                () => {

                    clearMessage();


                    refreshActionState();

                }
            );

        }
    );


    els.year.addEventListener(
        "change",
        () => {

            renderedYear =
                null;


            clearMessage();


            render(
                true
            );

        }
    );


    window.addEventListener(
        "owl-control-room-data-loaded",
        () =>
            render(
                true
            )
    );


    window.addEventListener(
        "owl-annual-covers-updated",
        () =>
            render(
                true
            )
    );


    if (
        typeof owlControlRoomData !==
            "undefined"
    ) {

        render(
            true
        );

    }


})();
