// =================================
// OWL CONTROL ROOM
// WRESTLER SHOW MANAGER
// =================================


const crWrestlerSelect =
    document.getElementById(
        "cr-wrestler-select"
    );


const crCurrentBrand =
    document.getElementById(
        "cr-current-brand"
    );


const crNewBrand =
    document.getElementById(
        "cr-new-brand"
    );


const crBrandPreview =
    document.getElementById(
        "cr-brand-change-preview"
    );


const crBrandChangeText =
    document.getElementById(
        "cr-brand-change-text"
    );


const crSaveBrandButton =
    document.getElementById(
        "cr-save-brand-change"
    );


const crBrandSaveMessage =
    document.getElementById(
        "cr-brand-save-message"
    );


const crWrestlerManagerStatus =
    document.getElementById(
        "cr-wrestler-manager-status"
    );



// =================================
// MANAGER STATE
// =================================


let crSelectedWrestlerId =
    "";


let crOriginalBrand =
    "";



// =================================
// HELPERS
// =================================


function crGetSelectedWrestler() {


    if (
        !crSelectedWrestlerId ||
        !Array.isArray(
            owlControlRoomData.wrestlers
        )
    ) {

        return null;

    }


    return owlControlRoomData.wrestlers.find(
        wrestler =>

            wrestler.id ===
                crSelectedWrestlerId
    ) || null;

}



function crFormatBrand(
    brand
) {


    return brand || "Unassigned";

}



function crSetManagerStatus(
    text
) {


    crWrestlerManagerStatus.textContent =
        text;

}



function crShowSaveMessage(
    message,
    type
) {


    crBrandSaveMessage.textContent =
        message;


    crBrandSaveMessage.className =
        `cr-save-message ${type}`;


    crBrandSaveMessage.hidden =
        false;

}



function crHideSaveMessage() {


    crBrandSaveMessage.hidden =
        true;


    crBrandSaveMessage.textContent =
        "";

}



// =================================
// POPULATE WRESTLER SELECT
// =================================


function crLoadWrestlerOptions() {


    if (
        !Array.isArray(
            owlControlRoomData.wrestlers
        )
    ) {

        return;

    }


    const previousSelection =
        crWrestlerSelect.value;


    crWrestlerSelect.innerHTML = `

        <option value="">
            Select Wrestler
        </option>

    `;



    const sortedWrestlers =
        [...owlControlRoomData.wrestlers]

            .sort(
                (a, b) =>

                    String(
                        a.name || ""
                    ).localeCompare(

                        String(
                            b.name || ""
                        )

                    )
            );



    sortedWrestlers.forEach(
        wrestler => {


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                wrestler.id;


            option.textContent =
                wrestler.name;


            crWrestlerSelect.appendChild(
                option
            );

        }
    );



    if (
        previousSelection &&
        sortedWrestlers.some(
            wrestler =>

                wrestler.id ===
                    previousSelection
        )
    ) {

        crWrestlerSelect.value =
            previousSelection;

    }


    crSetManagerStatus(
        "READY"
    );

}



// =================================
// LOAD SELECTED WRESTLER
// =================================


function crLoadSelectedWrestler() {


    crHideSaveMessage();


    crSelectedWrestlerId =
        crWrestlerSelect.value;



    if (!crSelectedWrestlerId) {


        crOriginalBrand =
            "";


        crCurrentBrand.textContent =
            "—";


        crNewBrand.value =
            "";


        crNewBrand.disabled =
            true;


        crSaveBrandButton.disabled =
            true;


        crBrandPreview.hidden =
            true;


        return;

    }



    const wrestler =
        crGetSelectedWrestler();



    if (!wrestler) {


        crShowSaveMessage(

            "The selected wrestler could not be found.",

            "save-error"

        );


        return;

    }



    crOriginalBrand =
        wrestler.brand || "";


    crCurrentBrand.textContent =
        crFormatBrand(
            crOriginalBrand
        );


    crNewBrand.value =
        crOriginalBrand;


    crNewBrand.disabled =
        false;


    crSaveBrandButton.disabled =
        true;


    crBrandPreview.hidden =
        true;


    crSetManagerStatus(
        "EDITING"
    );

}



// =================================
// REVIEW BRAND CHANGE
// =================================


function crReviewBrandChange() {


    crHideSaveMessage();


    const wrestler =
        crGetSelectedWrestler();



    if (!wrestler) {


        crBrandPreview.hidden =
            true;


        crSaveBrandButton.disabled =
            true;


        return;

    }



    const newBrand =
        crNewBrand.value;



    if (
        newBrand ===
        crOriginalBrand
    ) {


        crBrandPreview.hidden =
            true;


        crSaveBrandButton.disabled =
            true;


        crSetManagerStatus(
            "NO CHANGES"
        );


        return;

    }



    crBrandChangeText.textContent =

        `${wrestler.name}: ` +

        `${crFormatBrand(crOriginalBrand)} → ` +

        `${crFormatBrand(newBrand)}`;



    crBrandPreview.hidden =
        false;


    crSaveBrandButton.disabled =
        false;


    crSetManagerStatus(
        "CHANGE READY"
    );

}



// =================================
// CHECK WRITE PERMISSION
// =================================


async function crEnsureWritePermission() {


    if (!owlRepositoryHandle) {

        return false;

    }


    const permissionOptions = {

        mode:
            "readwrite"

    };


    const currentPermission =
        await owlRepositoryHandle.queryPermission(
            permissionOptions
        );


    if (
        currentPermission ===
        "granted"
    ) {

        return true;

    }



    const requestedPermission =
        await owlRepositoryHandle.requestPermission(
            permissionOptions
        );


    return (

        requestedPermission ===
        "granted"

    );

}



// =================================
// WRITE WRESTLERS DATABASE
// =================================


async function crWriteWrestlerBrandChange(
    wrestlerId,
    newBrand
) {


    const dataDirectory =
        await owlRepositoryHandle.getDirectoryHandle(
            "data"
        );


    const fileHandle =
        await dataDirectory.getFileHandle(
            "wrestlers.json"
        );


    const file =
        await fileHandle.getFile();


    const originalText =
        await file.text();



    // =================================
    // FIND THE WRESTLER RECORD
    // =================================


    const escapedWrestlerId =
        wrestlerId.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    const idPattern =
        new RegExp(

            `"id"\\s*:\\s*"${escapedWrestlerId}"`

        );


    const idMatch =
        idPattern.exec(
            originalText
        );


    if (!idMatch) {


        throw new Error(
            `Could not find wrestler ${wrestlerId}.`
        );

    }



    // =================================
    // FIND START OF OBJECT
    // =================================


    const objectStart =
        originalText.lastIndexOf(
            "{",
            idMatch.index
        );


    if (
        objectStart === -1
    ) {


        throw new Error(
            "Could not find the wrestler record start."
        );

    }



    // =================================
    // FIND END OF OBJECT
    // =================================


    let objectEnd =
        -1;


    let braceDepth =
        0;


    let insideString =
        false;


    let escapedCharacter =
        false;



    for (
        let index = objectStart;
        index < originalText.length;
        index += 1
    ) {


        const character =
            originalText[index];



        if (escapedCharacter) {


            escapedCharacter =
                false;


            continue;

        }



        if (
            character === "\\"

            &&

            insideString
        ) {


            escapedCharacter =
                true;


            continue;

        }



        if (
            character === "\""
        ) {


            insideString =
                !insideString;


            continue;

        }



        if (insideString) {

            continue;

        }



        if (
            character === "{"
        ) {


            braceDepth +=
                1;

        }



        if (
            character === "}"
        ) {


            braceDepth -=
                1;



            if (
                braceDepth === 0
            ) {


                objectEnd =
                    index;


                break;

            }

        }

    }



    if (
        objectEnd === -1
    ) {


        throw new Error(
            "Could not find the wrestler record end."
        );

    }



    // =================================
    // CHANGE ONLY THE BRAND FIELD
    // =================================


    const wrestlerBlock =
        originalText.slice(

            objectStart,

            objectEnd + 1

        );


    const brandPattern =
        /("brand"\s*:\s*")[^"]*(")/;



    if (
        !brandPattern.test(
            wrestlerBlock
        )
    ) {


        throw new Error(
            "The selected wrestler does not have a brand field."
        );

    }



    const updatedWrestlerBlock =
        wrestlerBlock.replace(

            brandPattern,

            (
                match,
                opening,
                closing
            ) => {


                return (
                    opening
                    +
                    newBrand
                    +
                    closing
                );

            }

        );



    const updatedText =

        originalText.slice(
            0,
            objectStart
        )

        +

        updatedWrestlerBlock

        +

        originalText.slice(
            objectEnd + 1
        );



    // =================================
    // WRITE EXACTLY ONE TARGETED EDIT
    // =================================


    const writable =
        await fileHandle.createWritable();


    await writable.write(
        updatedText
    );


    await writable.close();

}



// =================================
// SAVE BRAND CHANGE
// =================================


async function crSaveBrandChange() {


    const wrestler =
        crGetSelectedWrestler();



    if (!wrestler) {

        return;

    }


    const newBrand =
        crNewBrand.value;



    if (
        newBrand ===
        crOriginalBrand
    ) {

        return;

    }



    crSaveBrandButton.disabled =
        true;


    crNewBrand.disabled =
        true;


    crSetManagerStatus(
        "SAVING..."
    );


    crHideSaveMessage();



    try {


        const hasPermission =
            await crEnsureWritePermission();



        if (!hasPermission) {


            throw new Error(
                "Write permission was not granted."
            );

        }



        const updatedWrestlers =

            owlControlRoomData.wrestlers.map(
                item => {


                    if (
                        item.id !==
                        crSelectedWrestlerId
                    ) {

                        return item;

                    }


                    return {

                        ...item,

                        brand:
                            newBrand

                    };

                }
            );



        await crWriteWrestlersDatabase(
            updatedWrestlers
        );



        owlControlRoomData.wrestlers =
            updatedWrestlers;



        crOriginalBrand =
            newBrand;


        crCurrentBrand.textContent =
            crFormatBrand(
                newBrand
            );


        crBrandPreview.hidden =
            true;


        crNewBrand.disabled =
            false;


        crSetManagerStatus(
            "SAVED"
        );



        crShowSaveMessage(

            `${wrestler.name} was moved to ${crFormatBrand(newBrand)}. GitHub Desktop should now show wrestlers.json as changed.`,

            "save-success"

        );


    }


    catch (error) {


        console.error(
            "Could not save wrestler show change:",
            error
        );


        crNewBrand.disabled =
            false;


        crSaveBrandButton.disabled =
            false;


        crSetManagerStatus(
            "SAVE FAILED"
        );


        crShowSaveMessage(

            "The change could not be saved. No database update was completed.",

            "save-error"

        );

    }

}



// =================================
// EVENT LISTENERS
// =================================


crWrestlerSelect.addEventListener(
    "change",
    crLoadSelectedWrestler
);


crNewBrand.addEventListener(
    "change",
    crReviewBrandChange
);


crSaveBrandButton.addEventListener(
    "click",
    crSaveBrandChange
);



window.addEventListener(

    "owl-control-room-data-loaded",

    crLoadWrestlerOptions

);



// =================================
// SAFETY INITIALIZATION
// =================================


try {


    if (
        typeof owlControlRoomData !==
            "undefined"

        &&

        Array.isArray(
            owlControlRoomData.wrestlers
        )

        &&

        owlControlRoomData.wrestlers.length > 0
    ) {


        crLoadWrestlerOptions();

    }


}

catch (error) {


    console.warn(
        "Wrestler Manager waiting for repository data."
    );

}
