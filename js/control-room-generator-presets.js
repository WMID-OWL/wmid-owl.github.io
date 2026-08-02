// =================================
// CONTROL ROOM GENERATOR PRESETS
// FATE'S WHEEL + HEX-CELL + WILDCARDS
// RANKING RANGE + JOW BOOKING STYLE
// =================================

(() => {
    const PRESET_TYPES = new Set([
        "fates-wheel",
        "hex-cell-order",
        "wildcard-play-in",
        "ranking-selection",
        "jow-booking-style"
    ]);

    const TYPE_LABELS = {
        "fates-wheel": "Fate’s Wheel Cases",
        "hex-cell-order": "Hex-Cell Entry Order",
        "wildcard-play-in": "Wildcard Play-In Selection",
        "ranking-selection": "Ranking Position Selection",
        "jow-booking-style": "JoW Private Booking Style"
    };

    const FATE_CASES = [
        "Main Title Shot",
        "Midcard Title Shot",
        "Midcard Title Shot",
        "Remorse Case",
        "Remorse Case"
    ];

    const JOW_BOOKING_STYLES = [
        "Quality",
        "Standard",
        "Long Term",
        "Bizzaro",
        "Terrible"
    ];

    const originalGetTypeLabel =
        getGeneratorTypeLabel;

    const originalRenderTypeState =
        renderGeneratorTypeState;

    const originalRenderControls =
        renderGeneratorControls;

    const els = {
        fatesFields:
            document.getElementById(
                "cr-generator-fates-fields"
            ),

        fatesFinishers:
            document.getElementById(
                "cr-generator-fates-finishers"
            ),

        hexFields:
            document.getElementById(
                "cr-generator-hex-fields"
            ),

        hexEntrants:
            document.getElementById(
                "cr-generator-hex-entrants"
            ),

        wildcardFields:
            document.getElementById(
                "cr-generator-wildcard-fields"
            ),

        wildcardType:
            document.getElementById(
                "cr-generator-wildcard-type"
            ),

        rankedPool:
            document.getElementById(
                "cr-generator-ranked-pool"
            ),

        rankedExclusions:
            document.getElementById(
                "cr-generator-ranked-exclusions"
            ),

        wildcardRule:
            document.getElementById(
                "cr-generator-wildcard-rule"
            ),

        rankingFields:
            document.getElementById(
                "cr-generator-ranking-fields"
            ),

        rankingPool:
            document.getElementById(
                "cr-generator-ranking-pool"
            ),

        rankingExclusions:
            document.getElementById(
                "cr-generator-ranking-exclusions"
            ),

        rankMin:
            document.getElementById(
                "cr-generator-rank-min"
            ),

        rankMax:
            document.getElementById(
                "cr-generator-rank-max"
            ),

        rankCount:
            document.getElementById(
                "cr-generator-rank-count"
            ),

        jowFields:
            document.getElementById(
                "cr-generator-jow-fields"
            )
    };


    // =================================
    // BASIC HELPERS
    // =================================


    function lines(
        value
    ) {
        return String(
            value || ""
        )
            .split(
                /\r?\n/
            )
            .map(
                entry =>
                    entry.trim()
            )
            .filter(
                Boolean
            );
    }


    function uniqueLines(
        value
    ) {
        const seen =
            new Set();

        return lines(
            value
        ).filter(
            entry => {
                const key =
                    entry.toLowerCase();

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


    function hasDuplicates(
        entries
    ) {
        return new Set(
            entries.map(
                entry =>
                    entry.toLowerCase()
            )
        ).size !==
            entries.length;
    }


    function numericValue(
        element
    ) {
        return Number(
            element?.value
        );
    }


    function selectedMode() {
        return generatorEls.mode?.value ||
            "test";
    }


    function selectedLabel(
        fallback
    ) {
        return generatorCleanText(
            generatorEls.label?.value
        ) || fallback;
    }


    function selectedContext() {
        return generatorCleanText(
            generatorEls.context?.value
        );
    }


    function ordinal(
        value
    ) {
        const number =
            Number(
                value
            );

        const lastTwo =
            number % 100;

        if (
            lastTwo >=
                11
            &&
            lastTwo <=
                13
        ) {
            return `${number}th`;
        }

        if (
            number % 10 ===
            1
        ) {
            return `${number}st`;
        }

        if (
            number % 10 ===
            2
        ) {
            return `${number}nd`;
        }

        if (
            number % 10 ===
            3
        ) {
            return `${number}rd`;
        }

        return `${number}th`;
    }


    function createResult({
        type,
        method,
        methodLabel,
        label,
        eligiblePool,
        excludedEntries = [],
        result,
        randomDecisions = [],
        extra = {}
    }) {
        return {
            id:
                generatorCreateId(),

            generatorType:
                TYPE_LABELS[type],

            generatorKey:
                type,

            mode:
                selectedMode(),

            method,

            methodLabel,

            label,

            relatedContext:
                selectedContext(),

            eligiblePool:
                [
                    ...eligiblePool
                ],

            excludedEntries:
                [
                    ...excludedEntries
                ],

            result:
                [
                    ...result
                ],

            randomDecisions:
                [
                    ...randomDecisions
                ],

            generatedAt:
                new Date().toISOString(),

            confirmed:
                false,

            ...extra
        };
    }


    function setPresetVisibility(
        activeElement
    ) {
        [
            els.fatesFields,
            els.hexFields,
            els.wildcardFields,
            els.rankingFields,
            els.jowFields
        ]
            .filter(
                Boolean
            )
            .forEach(
                element => {
                    element.hidden =
                        element !==
                        activeElement;
                }
            );
    }


    function ensureOptions() {
        if (
            !generatorEls.type
        ) {
            return;
        }

        Object.entries(
            TYPE_LABELS
        ).forEach(
            ([
                value,
                label
            ]) => {
                let option =
                    [
                        ...generatorEls.type.options
                    ].find(
                        candidate =>
                            candidate.value ===
                            value
                    );

                if (
                    !option
                ) {
                    option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        value;

                    generatorEls.type.appendChild(
                        option
                    );
                }

                option.disabled =
                    false;

                option.textContent =
                    label;
            }
        );
    }


    getGeneratorTypeLabel =
        function (
            type
        ) {
            return TYPE_LABELS[type] ||
                originalGetTypeLabel(
                    type
                );
        };


    // =================================
    // FATE'S WHEEL
    // =================================


    function fateState(
        strict = false
    ) {
        const finishers =
            lines(
                els.fatesFinishers?.value
            );

        if (
            finishers.length !==
            5
        ) {
            if (
                strict
            ) {
                throw new Error(
                    "Enter exactly five case-eligible finishers in order from 2nd through 6th place."
                );
            }

            return {
                ready:
                    false,

                previewPool:
                    finishers
            };
        }

        if (
            hasDuplicates(
                finishers
            )
        ) {
            if (
                strict
            ) {
                throw new Error(
                    "Each Fate’s Wheel case-eligible finisher must be entered only once."
                );
            }

            return {
                ready:
                    false,

                previewPool:
                    finishers
            };
        }

        return {
            ready:
                true,

            finishers,

            previewPool:
                finishers
        };
    }


    function buildFateResult() {
        const {
            finishers
        } =
            fateState(
                true
            );

        const shuffledCases =
            generatorShuffle(
                FATE_CASES
            );

        const assignments =
            finishers.map(
                (
                    wrestler,
                    index
                ) => ({
                    placement:
                        index + 2,

                    wrestler,

                    drawNumber:
                        index + 1,

                    case:
                        shuffledCases[
                            index
                        ]
                })
            );

        return createResult({
            type:
                "fates-wheel",

            method:
                "finish-order-case-assignment",

            methodLabel:
                "Five sealed cases assigned in 2nd-through-6th finish order",

            label:
                selectedLabel(
                    "Fate’s Wheel Case Assignment"
                ),

            eligiblePool:
                finishers,

            result:
                assignments.map(
                    assignment =>
                        `${ordinal(
                            assignment.placement
                        )} place — ${assignment.wrestler} — Draw ${assignment.drawNumber}: ${assignment.case}`
                ),

            randomDecisions: [
                {
                    type:
                        "case-order-shuffle",

                    pool:
                        [
                            ...FATE_CASES
                        ],

                    finalOrder:
                        [
                            ...shuffledCases
                        ]
                }
            ],

            extra: {
                fatesWheel: {
                    selectionOrder:
                        finishers.map(
                            (
                                wrestler,
                                index
                            ) => ({
                                placement:
                                    index + 2,

                                wrestler
                            })
                        ),

                    caseAssignments:
                        assignments
                }
            }
        });
    }


    // =================================
    // HEX-CELL ENTRY ORDER
    // =================================


    function hexState(
        strict = false
    ) {
        const entrants =
            lines(
                els.hexEntrants?.value
            );

        if (
            entrants.length !==
            6
        ) {
            if (
                strict
            ) {
                throw new Error(
                    "Enter exactly six Hex-Cell entrants."
                );
            }

            return {
                ready:
                    false,

                previewPool:
                    entrants
            };
        }

        if (
            hasDuplicates(
                entrants
            )
        ) {
            if (
                strict
            ) {
                throw new Error(
                    "Each Hex-Cell entrant must be entered only once."
                );
            }

            return {
                ready:
                    false,

                previewPool:
                    entrants
            };
        }

        return {
            ready:
                true,

            entrants,

            previewPool:
                entrants
        };
    }


    function buildHexResult() {
        const {
            entrants
        } =
            hexState(
                true
            );

        const order =
            generatorShuffle(
                entrants
            );

        const schedule = [
            [
                "Starter 1",
                "Opening bell"
            ],
            [
                "Starter 2",
                "Opening bell"
            ],
            [
                "Entry 3",
                "5:00"
            ],
            [
                "Entry 4",
                "10:00"
            ],
            [
                "Entry 5",
                "15:00"
            ],
            [
                "Entry 6",
                "20:00"
            ]
        ];

        const entryOrder =
            order.map(
                (
                    wrestler,
                    index
                ) => ({
                    role:
                        schedule[
                            index
                        ][0],

                    time:
                        schedule[
                            index
                        ][1],

                    wrestler
                })
            );

        return createResult({
            type:
                "hex-cell-order",

            method:
                "six-person-entry-order",

            methodLabel:
                "Two starters followed by four five-minute entries",

            label:
                selectedLabel(
                    "Hex-Cell Entry Order"
                ),

            eligiblePool:
                entrants,

            result:
                entryOrder.map(
                    entry =>
                        `${entry.role} — ${entry.wrestler} — ${entry.time}`
                ),

            randomDecisions: [
                {
                    type:
                        "full-order-shuffle",

                    pool:
                        [
                            ...entrants
                        ],

                    finalOrder:
                        [
                            ...order
                        ]
                }
            ],

            extra: {
                hexCell: {
                    entryOrder
                }
            }
        });
    }


    // =================================
    // RANKED POOL HELPERS
    // =================================


    function rankedEntriesFrom(
        element,
        strict = false
    ) {
        const names =
            lines(
                element?.value
            );

        if (
            hasDuplicates(
                names
            )
        ) {
            if (
                strict
            ) {
                throw new Error(
                    "A ranked list cannot contain the same wrestler more than once."
                );
            }

            return {
                valid:
                    false,

                entries:
                    []
            };
        }

        return {
            valid:
                true,

            entries:
                names.map(
                    (
                        name,
                        index
                    ) => ({
                        rank:
                            index + 1,

                        name
                    })
                )
        };
    }


    function exclusionState(
        element
    ) {
        const exclusions =
            uniqueLines(
                element?.value
            );

        return {
            exclusions,

            keys:
                new Set(
                    exclusions.map(
                        entry =>
                            entry.toLowerCase()
                    )
                )
        };
    }


    function rankedLabel(
        entry
    ) {
        return `#${entry.rank} ${entry.name}`;
    }


    function filterRankedRange(
        entries,
        minimum,
        maximum,
        exclusionKeys
    ) {
        const range =
            entries.filter(
                entry =>
                    entry.rank >=
                        minimum
                    &&
                    entry.rank <=
                        maximum
            );

        return {
            range,

            eligible:
                range.filter(
                    entry =>
                        !exclusionKeys.has(
                            entry.name.toLowerCase()
                        )
                ),

            excluded:
                range.filter(
                    entry =>
                        exclusionKeys.has(
                            entry.name.toLowerCase()
                        )
                )
        };
    }


    // =================================
    // WILDCARD PLAY-IN
    // =================================


    function wildcardKind() {
        return els.wildcardType?.value ||
            "proving-ground";
    }


    function renderWildcardRule() {
        if (
            !els.wildcardRule
        ) {
            return;
        }

        els.wildcardRule.textContent =

            wildcardKind() ===
                "hex-cell"

                ? "HEX-CELL ULTIMATE WILDCARD — Draw one wrestler from #4–#10 and one wrestler from #11–#32."

                : "PROVING GROUND WILDCARD — Draw four eligible wrestlers from #3–#12 for the one-night mini bracket.";
    }


    function wildcardState(
        strict = false
    ) {
        const rankedState =
            rankedEntriesFrom(
                els.rankedPool,
                strict
            );

        if (
            !rankedState.valid
        ) {
            return {
                ready:
                    false,

                previewPool:
                    []
            };
        }

        const {
            entries
        } =
            rankedState;

        const {
            exclusions,
            keys
        } =
            exclusionState(
                els.rankedExclusions
            );

        if (
            wildcardKind() ===
            "hex-cell"
        ) {
            if (
                entries.length <
                32
            ) {
                if (
                    strict
                ) {
                    throw new Error(
                        "The Hex-Cell Ultimate Wildcard list must include rankings through #32."
                    );
                }

                return {
                    ready:
                        false,

                    previewPool:
                        entries.map(
                            rankedLabel
                        )
                };
            }

            const upper =
                filterRankedRange(
                    entries,
                    4,
                    10,
                    keys
                );

            const lower =
                filterRankedRange(
                    entries,
                    11,
                    32,
                    keys
                );

            if (
                !upper.eligible.length
                ||
                !lower.eligible.length
            ) {
                if (
                    strict
                ) {
                    throw new Error(
                        "The Hex-Cell Ultimate Wildcard requires at least one eligible wrestler in both #4–#10 and #11–#32."
                    );
                }

                return {
                    ready:
                        false,

                    previewPool: [
                        ...upper.eligible,
                        ...lower.eligible
                    ].map(
                        rankedLabel
                    )
                };
            }

            return {
                ready:
                    true,

                kind:
                    "hex-cell",

                exclusions,

                upper,

                lower,

                previewPool: [
                    ...upper.eligible,
                    ...lower.eligible
                ].map(
                    rankedLabel
                )
            };
        }

        if (
            entries.length <
            12
        ) {
            if (
                strict
            ) {
                throw new Error(
                    "The Proving Ground Wildcard list must include rankings through #12."
                );
            }

            return {
                ready:
                    false,

                previewPool:
                    entries.map(
                        rankedLabel
                    )
            };
        }

        const proving =
            filterRankedRange(
                entries,
                3,
                12,
                keys
            );

        if (
            proving.eligible.length <
            4
        ) {
            if (
                strict
            ) {
                throw new Error(
                    "The Proving Ground Wildcard requires at least four eligible wrestlers from #3–#12."
                );
            }

            return {
                ready:
                    false,

                previewPool:
                    proving.eligible.map(
                        rankedLabel
                    )
            };
        }

        return {
            ready:
                true,

            kind:
                "proving-ground",

            exclusions,

            proving,

            previewPool:
                proving.eligible.map(
                    rankedLabel
                )
        };
    }


    function buildWildcardResult() {
        const state =
            wildcardState(
                true
            );

        if (
            state.kind ===
            "hex-cell"
        ) {
            const upperSelection =
                state.upper.eligible[
                    generatorRandomIndex(
                        state.upper.eligible.length
                    )
                ];

            const lowerSelection =
                state.lower.eligible[
                    generatorRandomIndex(
                        state.lower.eligible.length
                    )
                ];

            const selected = [
                upperSelection,
                lowerSelection
            ];

            return createResult({
                type:
                    "wildcard-play-in",

                method:
                    "split-ranking-pool-draw",

                methodLabel:
                    "Hex-Cell Ultimate Wildcard — one from #4–#10 and one from #11–#32",

                label:
                    selectedLabel(
                        "Hex-Cell Ultimate Wildcard Selection"
                    ),

                eligiblePool: [
                    ...state.upper.eligible,
                    ...state.lower.eligible
                ].map(
                    rankedLabel
                ),

                excludedEntries: [
                    ...state.upper.excluded,
                    ...state.lower.excluded
                ].map(
                    rankedLabel
                ),

                result: [
                    `Upper Pool — ${rankedLabel(
                        upperSelection
                    )}`,

                    `Lower Pool — ${rankedLabel(
                        lowerSelection
                    )}`
                ],

                randomDecisions: [
                    {
                        type:
                            "upper-pool-selection",

                        pool:
                            state.upper.eligible.map(
                                rankedLabel
                            ),

                        selected:
                            rankedLabel(
                                upperSelection
                            )
                    },
                    {
                        type:
                            "lower-pool-selection",

                        pool:
                            state.lower.eligible.map(
                                rankedLabel
                            ),

                        selected:
                            rankedLabel(
                                lowerSelection
                            )
                    }
                ],

                extra: {
                    wildcardPlayIn: {
                        format:
                            "hex-cell",

                        selected
                    }
                }
            });
        }

        const selected =
            generatorShuffle(
                state.proving.eligible
            ).slice(
                0,
                4
            );

        return createResult({
            type:
                "wildcard-play-in",

            method:
                "four-person-ranking-draw",

            methodLabel:
                "Proving Ground Wildcard — four from #3–#12",

            label:
                selectedLabel(
                    "Proving Ground Wildcard Play-In"
                ),

            eligiblePool:
                state.proving.eligible.map(
                    rankedLabel
                ),

            excludedEntries:
                state.proving.excluded.map(
                    rankedLabel
                ),

            result: [
                `Semifinal 1 — ${rankedLabel(
                    selected[0]
                )} vs. ${rankedLabel(
                    selected[1]
                )}`,

                `Semifinal 2 — ${rankedLabel(
                    selected[2]
                )} vs. ${rankedLabel(
                    selected[3]
                )}`
            ],

            randomDecisions: [
                {
                    type:
                        "four-person-selection-and-bracket-order",

                    pool:
                        state.proving.eligible.map(
                            rankedLabel
                        ),

                    selected:
                        selected.map(
                            rankedLabel
                        )
                }
            ],

            extra: {
                wildcardPlayIn: {
                    format:
                        "proving-ground",

                    selected,

                    semifinals: [
                        [
                            selected[0],
                            selected[1]
                        ],
                        [
                            selected[2],
                            selected[3]
                        ]
                    ]
                }
            }
        });
    }


    // =================================
    // GENERIC RANKING POSITION DRAW
    // =================================


    function rankingState(
        strict = false
    ) {
        const rankedState =
            rankedEntriesFrom(
                els.rankingPool,
                strict
            );

        if (
            !rankedState.valid
        ) {
            return {
                ready:
                    false,

                previewPool:
                    []
            };
        }

        const minimum =
            numericValue(
                els.rankMin
            );

        const maximum =
            numericValue(
                els.rankMax
            );

        const count =
            numericValue(
                els.rankCount
            );

        const validNumbers =
            Number.isInteger(
                minimum
            )
            &&
            Number.isInteger(
                maximum
            )
            &&
            Number.isInteger(
                count
            )
            &&
            minimum >=
                1
            &&
            maximum >=
                minimum
            &&
            count >=
                1;

        if (
            !validNumbers
        ) {
            if (
                strict
            ) {
                throw new Error(
                    "Enter valid whole-number minimum rank, maximum rank, and selection count values."
                );
            }

            return {
                ready:
                    false,

                previewPool:
                    rankedState.entries.map(
                        rankedLabel
                    )
            };
        }

        if (
            rankedState.entries.length <
            maximum
        ) {
            if (
                strict
            ) {
                throw new Error(
                    `The ranked list must include rankings through #${maximum}.`
                );
            }

            return {
                ready:
                    false,

                previewPool:
                    rankedState.entries.map(
                        rankedLabel
                    )
            };
        }

        const {
            keys
        } =
            exclusionState(
                els.rankingExclusions
            );

        const range =
            filterRankedRange(
                rankedState.entries,
                minimum,
                maximum,
                keys
            );

        if (
            range.eligible.length <
            count
        ) {
            if (
                strict
            ) {
                throw new Error(
                    `Only ${range.eligible.length} eligible ranked entries are available, but ${count} selections are required.`
                );
            }

            return {
                ready:
                    false,

                previewPool:
                    range.eligible.map(
                        rankedLabel
                    )
            };
        }

        return {
            ready:
                true,

            minimum,

            maximum,

            count,

            range,

            previewPool:
                range.eligible.map(
                    rankedLabel
                )
        };
    }


    function buildRankingResult() {
        const state =
            rankingState(
                true
            );

        const selected =
            generatorShuffle(
                state.range.eligible
            ).slice(
                0,
                state.count
            );

        return createResult({
            type:
                "ranking-selection",

            method:
                "rank-range-selection",

            methodLabel:
                `Random selection from #${state.minimum}–#${state.maximum}`,

            label:
                selectedLabel(
                    "Ranking Position Selection"
                ),

            eligiblePool:
                state.range.eligible.map(
                    rankedLabel
                ),

            excludedEntries:
                state.range.excluded.map(
                    rankedLabel
                ),

            result:
                selected.map(
                    (
                        entry,
                        index
                    ) =>
                        `Selection ${index + 1} — ${rankedLabel(
                            entry
                        )}`
                ),

            randomDecisions: [
                {
                    type:
                        "rank-range-selection",

                    minimumRank:
                        state.minimum,

                    maximumRank:
                        state.maximum,

                    selectionCount:
                        state.count,

                    pool:
                        state.range.eligible.map(
                            rankedLabel
                        ),

                    selected:
                        selected.map(
                            rankedLabel
                        )
                }
            ],

            extra: {
                rankingSelection: {
                    minimumRank:
                        state.minimum,

                    maximumRank:
                        state.maximum,

                    selectionCount:
                        state.count,

                    selected
                }
            }
        });
    }


    // =================================
    // JOW PRIVATE BOOKING STYLE
    // =================================


    function buildJowResult() {
        const selectedIndex =
            generatorRandomIndex(
                JOW_BOOKING_STYLES.length
            );

        const selectedStyle =
            JOW_BOOKING_STYLES[
                selectedIndex
            ];

        return createResult({
            type:
                "jow-booking-style",

            method:
                "fixed-choice",

            methodLabel:
                "Secure single-choice draw",

            label:
                selectedLabel(
                    "JoW Private Booking Style"
                ),

            eligiblePool:
                JOW_BOOKING_STYLES,

            result: [
                selectedStyle
            ],

            randomDecisions: [
                {
                    type:
                        "fixed-choice",

                    pool:
                        [
                            ...JOW_BOOKING_STYLES
                        ],

                    selectedIndex,

                    selected:
                        selectedStyle
                }
            ],

            extra: {
                jowBookingStyle: {
                    selectedStyle
                }
            }
        });
    }


    function presetState(
        type,
        strict = false
    ) {
        if (
            type ===
            "fates-wheel"
        ) {
            return fateState(
                strict
            );
        }

        if (
            type ===
            "hex-cell-order"
        ) {
            return hexState(
                strict
            );
        }

        if (
            type ===
            "wildcard-play-in"
        ) {
            return wildcardState(
                strict
            );
        }

        if (
            type ===
            "ranking-selection"
        ) {
            return rankingState(
                strict
            );
        }

        if (
            type ===
            "jow-booking-style"
        ) {
            return {
                ready:
                    true,

                previewPool:
                    [
                        ...JOW_BOOKING_STYLES
                    ]
            };
        }

        return {
            ready:
                false,

            previewPool:
                []
        };
    }


    // =================================
    // UI STATE WRAPPERS
    // =================================


    renderGeneratorTypeState =
        function () {
            originalRenderTypeState();

            const type =
                getGeneratorType();

            if (
                !PRESET_TYPES.has(
                    type
                )
            ) {
                setPresetVisibility(
                    null
                );

                return;
            }

            if (
                generatorEls.injuryFields
            ) {
                generatorEls.injuryFields.hidden =
                    true;
            }

            if (
                generatorEls.poolFields
            ) {
                generatorEls.poolFields.hidden =
                    true;
            }

            if (
                generatorEls.countFields
            ) {
                generatorEls.countFields.hidden =
                    true;
            }

            if (
                generatorEls.method
            ) {
                generatorEls.method.disabled =
                    true;

                generatorEls.method.value =

                    type ===
                        "jow-booking-style"

                        ? "single"

                        : "order";
            }

            if (
                generatorEls.label
            ) {
                generatorEls.label.placeholder =
                    `Example: ${TYPE_LABELS[type]} — 2027`;
            }

            if (
                generatorEls.context
            ) {
                generatorEls.context.placeholder =
                    "Example: Event — Show — Division";
            }

            const activeFields = {
                "fates-wheel":
                    els.fatesFields,

                "hex-cell-order":
                    els.hexFields,

                "wildcard-play-in":
                    els.wildcardFields,

                "ranking-selection":
                    els.rankingFields,

                "jow-booking-style":
                    els.jowFields
            }[
                type
            ];

            setPresetVisibility(
                activeFields
            );

            if (
                type ===
                "wildcard-play-in"
            ) {
                renderWildcardRule();
            }
        };


    renderGeneratorControls =
        function () {
            originalRenderControls();

            const type =
                getGeneratorType();

            if (
                !PRESET_TYPES.has(
                    type
                )
            ) {
                return;
            }

            const state =
                presetState(
                    type,
                    false
                );

            if (
                generatorEls.generate
            ) {
                generatorEls.generate.disabled =

                    !owlRepositoryHandle

                    ||

                    generatorIsRolling

                    ||

                    !state.ready;
            }
        };


    async function animatePreset(
        previewPool,
        stageLabel
    ) {
        const pool =
            previewPool.length

                ? previewPool

                : [
                    "Preparing draw"
                ];

        for (
            let cycle = 0;
            cycle < 16;
            cycle += 1
        ) {
            const preview =
                pool[
                    generatorRandomIndex(
                        pool.length
                    )
                ];

            setGeneratorStage(
                stageLabel,
                preview,
                []
            );

            await generatorDelay(
                60 +
                (
                    cycle * 4
                )
            );
        }
    }


    function buildPresetResult(
        type
    ) {
        if (
            type ===
            "fates-wheel"
        ) {
            return buildFateResult();
        }

        if (
            type ===
            "hex-cell-order"
        ) {
            return buildHexResult();
        }

        if (
            type ===
            "wildcard-play-in"
        ) {
            return buildWildcardResult();
        }

        if (
            type ===
            "ranking-selection"
        ) {
            return buildRankingResult();
        }

        if (
            type ===
            "jow-booking-style"
        ) {
            return buildJowResult();
        }

        throw new Error(
            "Unsupported generator preset."
        );
    }


    function resultSummary(
        type,
        result
    ) {
        if (
            type ===
            "fates-wheel"
        ) {
            return "5 Fate cases assigned";
        }

        if (
            type ===
            "hex-cell-order"
        ) {
            return "6-person entry order set";
        }

        if (
            type ===
            "wildcard-play-in"
        ) {
            return result
                .wildcardPlayIn
                ?.format ===
                    "hex-cell"

                    ? "2 Ultimate Wildcard entrants selected"

                    : "4 Proving Ground entrants selected";
        }

        if (
            type ===
            "ranking-selection"
        ) {
            const count =
                result
                    .rankingSelection
                    ?.selectionCount

                ||

                result.result.length;

            return `${count} ranked selection${count === 1 ? "" : "s"} generated`;
        }

        return result.result[0] ||
            "Result generated";
    }


    async function generatePresetResult(
        event
    ) {
        const type =
            getGeneratorType();

        if (
            !PRESET_TYPES.has(
                type
            )
        ) {
            return;
        }

        event.preventDefault();

        event.stopImmediatePropagation();

        if (
            generatorIsRolling
        ) {
            return;
        }

        clearGeneratorMessage();

        let state;

        try {
            state =
                presetState(
                    type,
                    true
                );
        }

        catch (
            error
        ) {
            setGeneratorMessage(
                error.message ||
                "Complete the generator preset before generating.",
                "error"
            );

            renderGeneratorControls();

            return;
        }

        generatorIsRolling =
            true;

        generatorCurrentResult =
            null;

        renderGeneratorControls();

        try {
            if (
                generatorEls.stage
            ) {
                generatorEls.stage.classList.add(
                    "is-rolling"
                );

                generatorEls.stage.classList.remove(
                    "has-result"
                );
            }

            await animatePreset(
                state.previewPool,
                `GENERATING ${TYPE_LABELS[
                    type
                ].toUpperCase()}`
            );

            generatorCurrentResult =
                buildPresetResult(
                    type
                );

            if (
                generatorEls.stage
            ) {
                generatorEls.stage.classList.remove(
                    "is-rolling"
                );

                generatorEls.stage.classList.add(
                    "has-result"
                );
            }

            setGeneratorStage(

                generatorCurrentResult.mode ===
                    "canon"

                    ? "PENDING CANON CONFIRMATION"

                    : "TEST RESULT — NOT SAVED",

                resultSummary(
                    type,
                    generatorCurrentResult
                ),

                generatorCurrentResult.result.length >
                    1

                    ? generatorCurrentResult.result

                    : []

            );

            setGeneratorMessage(

                generatorCurrentResult.mode ===
                    "canon"

                    ? "Result generated. Review it, then confirm or discard it."

                    : "Test result generated. It exists only on this screen and cannot be saved."

            );
        }

        catch (
            error
        ) {
            console.error(
                "Could not generate preset result:",
                error
            );

            resetGeneratorResult(
                "Generation failed."
            );

            setGeneratorMessage(
                error.message ||
                "Could not generate the preset result.",
                "error"
            );
        }

        finally {
            generatorIsRolling =
                false;

            renderGeneratorControls();
        }
    }


    function handlePresetChange() {
        handleGeneratorSettingChange(
            "Generator information changed. Generate a new result."
        );
    }


    [
        els.fatesFinishers,
        els.hexEntrants,
        els.rankedPool,
        els.rankedExclusions,
        els.rankingPool,
        els.rankingExclusions,
        els.rankMin,
        els.rankMax,
        els.rankCount
    ]
        .filter(
            Boolean
        )
        .forEach(
            element => {
                element.addEventListener(
                    "input",
                    handlePresetChange
                );
            }
        );


    els.wildcardType
        ?.addEventListener(
            "change",
            () => {
                renderWildcardRule();

                handlePresetChange();
            }
        );


    generatorEls.generate
        ?.addEventListener(
            "click",
            generatePresetResult,
            true
        );


    window.addEventListener(
        "owl-control-room-data-loaded",
        () => {
            ensureOptions();

            renderWildcardRule();

            renderGeneratorTypeState();

            renderGeneratorControls();
        }
    );


    ensureOptions();

    renderWildcardRule();

})();
