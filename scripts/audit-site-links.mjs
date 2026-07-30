import fs from "node:fs/promises";
import path from "node:path";


const ROOT =
    process.cwd();


const IGNORED_DIRECTORIES =

    new Set([

        ".git",
        ".github",
        "node_modules"

    ]);


const TEXT_EXTENSIONS =

    new Set([

        ".html",
        ".js"

    ]);


const HTML_ATTRIBUTE_PATTERN =

    /\b(?:href|src|poster)\s*=\s*["']([^"']+)["']/gi;


const CSS_URL_PATTERN =

    /url\(\s*["']?([^"')]+)["']?\s*\)/gi;


const JS_HTML_PATH_PATTERN =

    /["'`]([^"'`\s<>]+\.html(?:[?#][^"'`\s<>]*)?)["'`]/gi;


// =================================
// BASIC HELPERS
// =================================


function toPosix(
    value
) {


    return String(
        value || ""
    ).replace(
        /\\/g,
        "/"
    );

}



function isIgnoredReference(
    reference
) {


    const value =

        String(
            reference || ""
        ).trim();


    return (

        !value

        ||

        value.startsWith(
            "#"
        )

        ||

        value.startsWith(
            "//"
        )

        ||

        /^[a-z][a-z0-9+.-]*:/i.test(
            value
        )

        ||

        value.includes(
            "${"
        )

        ||

        value.includes(
            "{{"
        )

        ||

        value.includes(
            "<%"
        )

    );

}



function splitReference(
    reference
) {


    const value =

        String(
            reference || ""
        ).trim();


    const hashIndex =

        value.indexOf(
            "#"
        );


    const queryIndex =

        value.indexOf(
            "?"
        );


    let cutIndex =

        value.length;


    if (
        queryIndex >= 0
    ) {


        cutIndex =

            Math.min(
                cutIndex,
                queryIndex
            );

    }


    if (
        hashIndex >= 0
    ) {


        cutIndex =

            Math.min(
                cutIndex,
                hashIndex
            );

    }


    const filePart =

        value.slice(
            0,
            cutIndex
        );


    const fragment =

        hashIndex >= 0

            ? value.slice(
                hashIndex + 1
            )

            : "";


    return {

        filePart,

        fragment:

            decodeURIComponent(
                fragment
            )

    };

}



async function pathExists(
    fullPath
) {


    try {


        await fs.access(
            fullPath
        );


        return true;

    }


    catch {


        return false;

    }

}



async function isDirectory(
    fullPath
) {


    try {


        return (

            await fs.stat(
                fullPath
            )

        ).isDirectory();

    }


    catch {


        return false;

    }

}


// =================================
// FILE DISCOVERY
// =================================


async function walk(
    relativeDirectory = ""
) {


    const fullDirectory =

        path.join(
            ROOT,
            relativeDirectory
        );


    const entries =

        await fs.readdir(

            fullDirectory,

            {
                withFileTypes:
                    true
            }

        );


    const files =
        [];


    for (
        const entry of entries
    ) {


        if (
            IGNORED_DIRECTORIES.has(
                entry.name
            )
        ) {


            continue;

        }


        const relativePath =

            path.join(

                relativeDirectory,

                entry.name

            );


        if (
            entry.isDirectory()
        ) {


            files.push(

                ...await walk(
                    relativePath
                )

            );


            continue;

        }


        if (
            TEXT_EXTENSIONS.has(

                path.extname(
                    entry.name
                ).toLowerCase()

            )
        ) {


            files.push(
                relativePath
            );

        }

    }


    return files;

}


// =================================
// REFERENCE COLLECTION
// =================================


function collectReferences(
    relativePath,
    source
) {


    const references =
        [];


    const extension =

        path.extname(
            relativePath
        ).toLowerCase();


    if (
        extension === ".html"
    ) {


        for (
            const match of source.matchAll(
                HTML_ATTRIBUTE_PATTERN
            )
        ) {


            references.push({

                raw:
                    match[1],

                kind:
                    "HTML attribute"

            });

        }


        for (
            const match of source.matchAll(
                CSS_URL_PATTERN
            )
        ) {


            references.push({

                raw:
                    match[1],

                kind:
                    "Inline CSS URL"

            });

        }

    }


    if (
        extension === ".js"
    ) {


        for (
            const match of source.matchAll(
                HTML_ATTRIBUTE_PATTERN
            )
        ) {


            references.push({

                raw:
                    match[1],

                kind:
                    "JavaScript HTML markup"

            });

        }


        for (
            const match of source.matchAll(
                JS_HTML_PATH_PATTERN
            )
        ) {


            references.push({

                raw:
                    match[1],

                kind:
                    "JavaScript page path"

            });

        }

    }


    const seen =
        new Set();


    return references.filter(

        reference => {


            const key =

                `${reference.kind}|${reference.raw}`;


            if (
                seen.has(
                    key
                )
            ) {


                return false;

            }


            seen.add(
                key
            );


            return true;

        }

    );

}



function collectAnchors(
    source
) {


    const anchors =
        new Set();


    const idPattern =

        /\b(?:id|name)\s*=\s*["']([^"']+)["']/gi;


    for (
        const match of source.matchAll(
            idPattern
        )
    ) {


        anchors.add(
            match[1]
        );

    }


    return anchors;

}


// =================================
// TARGET RESOLUTION
// =================================


async function resolveTarget(
    sourceRelativePath,
    reference
) {


    const {

        filePart,
        fragment

    } = splitReference(
        reference
    );


    const sourceDirectory =

        path.dirname(
            sourceRelativePath
        );


    const sourceExtension =

        path.extname(
            sourceRelativePath
        ).toLowerCase();


    const isJavaScriptDocumentReference =

        sourceExtension === ".js"

        &&

        filePart

        &&

        !filePart.startsWith(
            "/"
        )

        &&

        !filePart.startsWith(
            "./"
        )

        &&

        !filePart.startsWith(
            "../"
        );


    let targetRelativePath;


    if (
        !filePart
    ) {


        targetRelativePath =
            sourceRelativePath;

    }


    else if (
        filePart.startsWith(
            "/"
        )
    ) {


        targetRelativePath =

            filePart.replace(
                /^\/+/,
                ""
            );

    }


    else if (
        isJavaScriptDocumentReference
    ) {


        /*
         * Links placed into page markup by JavaScript resolve
         * relative to the loaded HTML document, not relative
         * to the JavaScript file inside the js directory.
         */

        targetRelativePath =

            path.normalize(
                filePart
            );

    }


    else {


        targetRelativePath =

            path.normalize(

                path.join(

                    sourceDirectory,

                    filePart

                )

            );

    }


    let targetFullPath =

        path.join(
            ROOT,
            targetRelativePath
        );


    if (
        await isDirectory(
            targetFullPath
        )
    ) {


        targetRelativePath =

            path.join(

                targetRelativePath,

                "index.html"

            );


        targetFullPath =

            path.join(
                ROOT,
                targetRelativePath
            );

    }


    return {

        targetRelativePath,
        targetFullPath,
        fragment

    };

}


// =================================
// RUN AUDIT
// =================================


const sourceFiles =

    await walk();


const sourceCache =

    new Map();


const broken =
    [];


const anchorFailures =
    [];


let checkedReferenceCount =
    0;


for (
    const relativePath of sourceFiles
) {


    const source =

        await fs.readFile(

            path.join(
                ROOT,
                relativePath
            ),

            "utf8"

        );


    sourceCache.set(

        toPosix(
            relativePath
        ),

        source

    );


    const references =

        collectReferences(

            relativePath,

            source

        );


    for (
        const reference of references
    ) {


        if (
            isIgnoredReference(
                reference.raw
            )
        ) {


            continue;

        }


        checkedReferenceCount +=
            1;


        const target =

            await resolveTarget(

                relativePath,

                reference.raw

            );


        const targetPosix =

            toPosix(
                target.targetRelativePath
            );


        if (
            !await pathExists(
                target.targetFullPath
            )
        ) {


            broken.push({

                source:
                    toPosix(
                        relativePath
                    ),

                reference:
                    reference.raw,

                resolved:
                    targetPosix,

                kind:
                    reference.kind

            });


            continue;

        }


        if (
            target.fragment

            &&

            path.extname(
                target.targetRelativePath
            ).toLowerCase() === ".html"
        ) {


            let targetSource =

                sourceCache.get(
                    targetPosix
                );


            if (
                targetSource === undefined
            ) {


                targetSource =

                    await fs.readFile(

                        target.targetFullPath,

                        "utf8"

                    );


                sourceCache.set(

                    targetPosix,

                    targetSource

                );

            }


            const anchors =

                collectAnchors(
                    targetSource
                );


            if (
                !anchors.has(
                    target.fragment
                )
            ) {


                anchorFailures.push({

                    source:
                        toPosix(
                            relativePath
                        ),

                    reference:
                        reference.raw,

                    resolved:
                        targetPosix,

                    fragment:
                        target.fragment,

                    kind:
                        reference.kind

                });

            }

        }

    }

}


// =================================
// REPORT
// =================================


console.log(

    `Scanned ${sourceFiles.length} HTML/JavaScript files.`

);


console.log(

    `Checked ${checkedReferenceCount} local references.`

);


if (
    !broken.length

    &&

    !anchorFailures.length
) {


    console.log(

        "PASS: No broken local files or missing static anchors were found."

    );


    process.exit(
        0
    );

}


if (
    broken.length
) {


    console.error(

        "\nBROKEN LOCAL FILE REFERENCES:\n"

    );


    for (
        const failure of broken
    ) {


        console.error(

            `- ${failure.source}`

        );


        console.error(

            `  ${failure.kind}: ${failure.reference}`

        );


        console.error(

            `  Resolved target: ${failure.resolved}`

        );

    }

}


if (
    anchorFailures.length
) {


    console.error(

        "\nMISSING STATIC PAGE ANCHORS:\n"

    );


    for (
        const failure of anchorFailures
    ) {


        console.error(

            `- ${failure.source}`

        );


        console.error(

            `  ${failure.kind}: ${failure.reference}`

        );


        console.error(

            `  Missing #${failure.fragment} in ${failure.resolved}`

        );

    }

}


console.error(

    `\nFAIL: ${broken.length} broken file reference(s) and ${anchorFailures.length} missing anchor(s) found.`

);


process.exit(
    1
);
