import fs from "node:fs/promises";
import path from "node:path";


const ROOT =
    process.cwd();


const DATA_ROOT =
    path.join(
        ROOT,
        "data"
    );


const SOURCE_EXTENSIONS =
    new Set([
        ".html",
        ".js"
    ]);


const IGNORED_DIRECTORIES =
    new Set([
        ".git",
        ".github",
        "node_modules"
    ]);


const STATIC_JSON_REFERENCE_PATTERN =
    /["'`](data\/[^"'`\s<>${}]+\.json(?:\?[^"'`\s<>]*)?)["'`]/gi;


// =================================
// BASIC HELPERS
// =================================


function array(
    value
) {

    return Array.isArray(
        value
    )

        ? value

        : [];

}


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


function withoutQueryOrHash(
    value
) {

    return String(
        value || ""
    ).split(
        /[?#]/
    )[0];

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


async function readText(
    fullPath
) {

    return fs.readFile(
        fullPath,
        "utf8"
    );

}


// =================================
// FILE DISCOVERY
// =================================


async function walkFiles(
    fullDirectory,
    relativeDirectory = ""
) {

    const currentDirectory =
        path.join(
            fullDirectory,
            relativeDirectory
        );


    const entries =
        await fs.readdir(
            currentDirectory,
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
                ...await walkFiles(
                    fullDirectory,
                    relativePath
                )
            );

            continue;

        }


        files.push(
            relativePath
        );

    }


    return files;

}


// =================================
// JSON READER
// =================================


async function parseJsonFile(
    relativePath
) {

    const fullPath =
        path.join(
            ROOT,
            relativePath
        );


    const source =
        await readText(
            fullPath
        );


    if (
        !source.trim()
    ) {

        throw new Error(
            "File is blank."
        );

    }


    try {

        return JSON.parse(
            source
        );

    }

    catch (
        error
    ) {

        throw new Error(
            `Invalid JSON: ${error.message}`
        );

    }

}


// =================================
// STATIC JSON REFERENCES
// =================================


async function collectStaticJsonReferences() {

    const allFiles =
        await walkFiles(
            ROOT
        );


    const sourceFiles =
        allFiles.filter(
            relativePath =>
                SOURCE_EXTENSIONS.has(
                    path.extname(
                        relativePath
                    ).toLowerCase()
                )
        );


    const references =
        [];


    for (
        const relativePath of sourceFiles
    ) {

        const source =
            await readText(
                path.join(
                    ROOT,
                    relativePath
                )
            );


        for (
            const match of source.matchAll(
                STATIC_JSON_REFERENCE_PATTERN
            )
        ) {

            references.push({
                source:
                    toPosix(
                        relativePath
                    ),

                reference:
                    withoutQueryOrHash(
                        match[1]
                    )
            });

        }

    }


    const seen =
        new Set();


    return references.filter(
        reference => {

            const key =
                `${reference.source}|${reference.reference}`;


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


// =================================
// ARCHIVE FILE REFERENCES
// =================================


function collectArchiveFileReferences(
    value,
    location = "root",
    results = []
) {

    if (
        Array.isArray(
            value
        )
    ) {

        value.forEach(
            (
                entry,
                index
            ) => {

                collectArchiveFileReferences(
                    entry,
                    `${location}[${index}]`,
                    results
                );

            }
        );


        return results;

    }


    if (
        !value
        ||
        typeof value !== "object"
    ) {

        return results;

    }


    for (
        const [
            key,
            child
        ] of Object.entries(
            value
        )
    ) {

        const childLocation =
            `${location}.${key}`;


        if (
            key === "file"
            &&
            typeof child === "string"
            &&
            /\.(?:json|mp3|wav|ogg|m4a)$/i.test(
                withoutQueryOrHash(
                    child
                )
            )
        ) {

            results.push({
                location:
                    childLocation,

                file:
                    withoutQueryOrHash(
                        child
                    )
            });

        }


        collectArchiveFileReferences(
            child,
            childLocation,
            results
        );

    }


    return results;

}


// =================================
// QUEUE CONSISTENCY
// =================================


function inspectQueueConsistency(
    relativePath,
    value
) {

    const failures =
        [];


    if (
        !relativePath.endsWith(
            "queue.json"
        )
    ) {

        return failures;

    }


    const queueSchemas = [

        {
            countKey:
                "pendingEventCount",

            arrayKey:
                "pendingEvents"
        },

        {
            countKey:
                "pendingWeekCount",

            arrayKey:
                "pendingWeeks"
        },

        {
            countKey:
                "pendingSermonCount",

            arrayKey:
                "pendingSermons"
        },

        {
            countKey:
                "pendingPulseCount",

            arrayKey:
                "pendingPulses"
        },

        {
            countKey:
                "pendingIssueCount",

            arrayKey:
                "pendingIssues"
        }

    ];


    const schema =

        queueSchemas.find(

            candidate =>

                Object.prototype.hasOwnProperty.call(

                    value || {},

                    candidate.countKey

                )

                ||

                Object.prototype.hasOwnProperty.call(

                    value || {},

                    candidate.arrayKey

                )

        );


    if (
        !schema
    ) {

        failures.push(

            "Queue does not use a recognized OWL pending-count and pending-items schema."

        );


        return failures;

    }


    const queueArray =

        value[
            schema.arrayKey
        ];


    const declaredCount =

        value[
            schema.countKey
        ];


    if (
        !Array.isArray(
            queueArray
        )
    ) {

        failures.push(

            `${schema.arrayKey} must be an array.`

        );


        return failures;

    }


    if (
        !Number.isFinite(
            Number(
                declaredCount
            )
        )
    ) {

        failures.push(

            `${schema.countKey} must be numeric.`

        );


        return failures;

    }


    if (
        Number(
            declaredCount
        ) !== queueArray.length
    ) {

        failures.push(

            `${schema.countKey} is ${Number(
                declaredCount
            )}, but ${schema.arrayKey} contains ${queueArray.length} item(s).`

        );

    }


    return failures;

}


// =================================
// RUN AUDIT
// =================================


if (
    !await pathExists(
        DATA_ROOT
    )
) {

    throw new Error(
        "The data directory does not exist."
    );

}


const failures =
    [];


const notices =
    [];


const dataFiles =

    (
        await walkFiles(
            DATA_ROOT
        )
    )

        .filter(
            relativePath =>
                path.extname(
                    relativePath
                ).toLowerCase() === ".json"
        )

        .map(
            relativePath =>
                toPosix(
                    path.join(
                        "data",
                        relativePath
                    )
                )
        );


const parsedData =
    new Map();


for (
    const relativePath of dataFiles
) {

    try {

        const value =
            await parseJsonFile(
                relativePath
            );


        parsedData.set(
            relativePath,
            value
        );


        for (
            const queueFailure of inspectQueueConsistency(
                relativePath,
                value
            )
        ) {

            failures.push({
                source:
                    relativePath,

                message:
                    queueFailure
            });

        }


        if (
            relativePath.endsWith(
                "archive-index.json"
            )
        ) {

            const archiveReferences =
                collectArchiveFileReferences(
                    value
                );


            if (
                !archiveReferences.length
            ) {

                notices.push(
                    `${relativePath} contains no published file references. This is a valid empty archive state.`
                );

            }


            for (
                const reference of archiveReferences
            ) {

                const referencedPath =
                    toPosix(
                        withoutQueryOrHash(
                            reference.file
                        )
                    );


                if (
                    !await pathExists(
                        path.join(
                            ROOT,
                            referencedPath
                        )
                    )
                ) {

                    failures.push({
                        source:
                            relativePath,

                        message:
                            `${reference.location} points to missing file ${referencedPath}`
                    });

                    continue;

                }


                if (
                    referencedPath.endsWith(
                        ".json"
                    )
                    &&
                    !parsedData.has(
                        referencedPath
                    )
                ) {

                    try {

                        parsedData.set(
                            referencedPath,
                            await parseJsonFile(
                                referencedPath
                            )
                        );

                    }

                    catch (
                        error
                    ) {

                        failures.push({
                            source:
                                relativePath,

                            message:
                                `${reference.location} points to unreadable JSON file ${referencedPath}: ${error.message}`
                        });

                    }

                }

            }

        }

    }

    catch (
        error
    ) {

        failures.push({
            source:
                relativePath,

            message:
                error.message
        });

    }

}


// =================================
// CHECK STATIC DATA REFERENCES
// =================================


const staticReferences =
    await collectStaticJsonReferences();


for (
    const reference of staticReferences
) {

    const referencedPath =
        toPosix(
            reference.reference
        );


    if (
        !await pathExists(
            path.join(
                ROOT,
                referencedPath
            )
        )
    ) {

        failures.push({
            source:
                reference.source,

            message:
                `Static JSON reference points to missing file ${referencedPath}`
        });

        continue;

    }


    if (
        !parsedData.has(
            referencedPath
        )
    ) {

        try {

            parsedData.set(
                referencedPath,
                await parseJsonFile(
                    referencedPath
                )
            );

        }

        catch (
            error
        ) {

            failures.push({
                source:
                    reference.source,

                message:
                    `Static JSON reference points to invalid file ${referencedPath}: ${error.message}`
            });

        }

    }

}


// =================================
// REPORT
// =================================


console.log(
    `Scanned ${dataFiles.length} JSON data files.`
);


console.log(
    `Checked ${staticReferences.length} static JSON references from HTML and JavaScript.`
);


console.log(
    `Validated ${parsedData.size} unique JSON files.`
);


if (
    notices.length
) {

    console.log(
        "\nVALID EMPTY STATES:\n"
    );


    for (
        const notice of notices
    ) {

        console.log(
            `- ${notice}`
        );

    }

}


if (
    !failures.length
) {

    console.log(
        "\nPASS: No missing, blank, invalid, or internally broken site data was found."
    );


    process.exit(
        0
    );

}


console.error(
    "\nSITE DATA FAILURES:\n"
);


for (
    const failure of failures
) {

    console.error(
        `- ${failure.source}`
    );


    console.error(
        `  ${failure.message}`
    );

}


console.error(
    `\nFAIL: ${failures.length} site-data problem(s) found.`
);


process.exit(
    1
);
