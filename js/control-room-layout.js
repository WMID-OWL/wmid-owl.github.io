/* Control Room workflow layout. Runs after the managers have created their UI.
 * Move existing nodes; never recreate controls or change their event handlers,
 * hidden/disabled rules, data, or save operations.
 */
(() => {
    "use strict";

    function initializeLayout() {

        const byId = id => document.getElementById(id);
        const section = id => byId(id)?.closest(".cr-editor-section");
        const before = (node, target) => {
            if (node && target && node !== target) target.before(node);
        };
        const headingSection = (panel, title) =>
            Array.from(panel?.querySelectorAll("h3") || [])
                .find(heading => heading.textContent.trim() === title)
                ?.closest(".cr-editor-section");

        // Keep optional setup available without making it a mandatory detour when
        // managing an existing tournament. The original section stays intact.
        function optionalSetup(node, title) {
            if (!node) return;
            const details = document.createElement("details");
            details.className = "cr-flow-optional";
            const summary = document.createElement("summary");
            summary.textContent = title;
            node.before(details);
            details.append(summary, node);
        }

        const tournaments = byId("cr-tool-tournaments");
        if (tournaments) {
            const artwork = byId("cr-tournament-artwork-panel");
            before(artwork, tournaments.querySelector(".cr-tournament-cleanup-section"));
            optionalSetup(tournaments.querySelector(".cr-tournament-creator-section"),
                "Create a new tournament (optional)");
            optionalSetup(tournaments.querySelector(".cr-tournament-bracket-create-form"),
                "Add a bracket or battle royal (optional)");

            // Eligible and selected participants are one editing task. Show them
            // together, with the existing review/save/lock controls immediately after.
            const available = section("cr-tournament-eligible-list");
            const selected = section("cr-tournament-selected-list");
            if (available && selected) {
                const field = document.createElement("div");
                field.className = "cr-flow-field-columns";
                available.before(field);
                field.append(available, selected);
            }
        }

        // Handoffs appear before the forms they populate.
        before(section("cr-injury-pending-list"), section("cr-injury-create-evaluation"));

        const covers = byId("cr-tool-annual-cover");
        const drawMode = section("cr-cover-random-mode");
        before(section("cr-cover-men-leaderboard"), drawMode);
        before(section("cr-cover-women-leaderboard"), drawMode);

        // Selection -> identity -> voice -> review/save -> optional directory.
        const accounts = byId("cr-tool-innanet-accounts");
        const directory = section("cr-account-directory");
        if (accounts && directory) accounts.append(directory);

        // Add a power holder before completing that holder's active entry.
        before(document.querySelector(".cr-signature-power-form-section"),
            document.querySelector(".cr-signature-power-complete-section"));

        // Write the episode first, prepare its lower third, then review/publish.
        const afterDark = byId("cr-tool-after-dark");
        before(headingSection(afterDark, "After Dark Lower Third"), byId("cr-after-dark-preview"));

        // Explicit checkpoints for nested or conditional workflows; simple editors
        // use their existing top-level sections in their existing logical order.
        const checkpoints = {
            tournaments: [
                ["Choose / create", ".cr-tournament-selection-section"],
                ["Participant field", () => section("cr-tournament-field-size")],
                ["Review & lock", () => byId("cr-tournament-field-save")?.parentElement],
                ["Generate matchups", "#cr-tournament-bracket-method-panel"],
                ["Battle royal result", "#cr-tournament-battle-royal-winner-panel"],
                ["Book matches", () => section("cr-tournament-match-select")],
                ["Broadcast lineup", ".cr-tournament-broadcast-manager"],
                ["Artwork", "#cr-tournament-artwork-panel"],
                ["Cleanup", ".cr-tournament-cleanup-section"]
            ],
            "signature-series": [
                ["Active entries", () => section("cr-signature-power-entry-select")],
                ["Add holder", ".cr-signature-power-form-section"],
                ["Complete entry", ".cr-signature-power-complete-section"],
                ["Proving Ground field", ".cr-signature-proving-section"],
                ["Round-robin results", () => section("cr-proving-result-select")],
                ["Final results", () => section("cr-proving-final-select")]
            ],
            "annual-cover": [
                ["Edition", () => section("cr-cover-edition-select")],
                ["Scoring", () => headingSection(covers, "Weighted Cover Score")],
                ["Leaderboards", () => section("cr-cover-men-leaderboard")],
                ["Draw & ballots", () => section("cr-cover-random-mode")],
                ["Save draft", () => byId("cr-cover-save-draft")?.parentElement],
                ["Confirm winners", ".cr-cover-finalization-section"],
                ["Artwork", () => section("cr-cover-men-art")],
                ["Publish", ".cr-cover-publish-section"]
            ],
            media: [
                ["Type & target", ".cr-media-top-grid"],
                ["Choose image", "#cr-media-standard-workflow .cr-editor-section"],
                ["Review & import", () => byId("cr-media-save")?.parentElement],
                ["Match source", () => section("cr-match-card-source")],
                ["Prepare graphic", () => section("cr-match-card-file")],
                ["Save graphic", ".cr-match-card-actions"]
            ],
            generator: [
                ["Mode & type", ".cr-generator-control-grid"],
                ["Injury details", "#cr-generator-injury-fields"],
                ["Case assignment", "#cr-generator-fates-fields"],
                ["Entry order", "#cr-generator-hex-fields"],
                ["Play-in pool", "#cr-generator-wildcard-fields"],
                ["Ranked pool", "#cr-generator-ranking-fields"],
                ["Booking style", "#cr-generator-jow-fields"],
                ["Context", ".cr-generator-detail-grid"],
                ["Pool", "#cr-generator-pool-fields"],
                ["Draw & confirm", "#cr-generator-stage"],
                ["History", () => headingSection(byId("cr-tool-generator"), "Generator History")]
            ],
            runbook: [
                ["Week", ".cr-runbook-toolbar"],
                ["Tasks", "#cr-runbook-board"],
                ["Add task", "#cr-runbook-custom-section"]
            ],
            health: [["Checks", "#cr-health-list"]]
        };

        const shortLabels = {
            "Basic Information": "Identity", "Show and Division": "Brand & division",
            "Moves and Story": "Moves & story", "Wrestler Photo": "Photo",
            "Core Simulation Settings": "Skills", "Current OWL Durability": "Durability",
            "Ring Movement Settings": "Movement", "OWL Build Balance": "Point audit",
            "Tag Team Lineup": "Lineup", "Wrestling Information": "Moves",
            "Team and Leadership": "Leadership", "Faction Members": "Membership",
            "Singles Members": "Singles", "Event Media": "Media",
            "Pending Injury Evaluations": "Pending evaluations", "Create Injury Record": "Create record",
            "Active Injury Cases": "Active cases", "Cleared Injury History": "History",
            "Fire Pro Endurance Settings": "Profile", "High Endurance Milestones": "Milestones",
            "Create or Edit Achievement": "Select / create", "Who Earned It?": "Recipient",
            "Career Accomplishment": "Achievement", "Artwork and Visibility": "Presentation",
            "Recorded Achievements": "Archive", "Broadcast Identity": "Episode",
            "After Dark Lower Third": "Lower third", "Ascension and Revolt": "Show recaps",
            "Match of the Week": "Match of the week", "What Changed": "Developments",
            "Final Word": "Closing", "Publication Identity": "Edition",
            "The Main Argument": "Argument", "Praise and Condemnation": "Praise / criticism",
            "Favorites and Blind Spots": "Editorial view", "Referenced This Week": "References",
            "Closing Word": "Closing", "Match Information": "Match setup",
            "Special Match Setup": "Special rules", "Match Sides": "Competitors",
            "Match Rating": "Rating & time", "Match-Specific Details": "Special results",
            "Who Was Involved?": "Participants", "Summary / Notes": "Notes",
            "Recorded Segments": "History", "Record JoW Show": "Record show",
            "Landscape Championship Desk": "Champions", "Landscape Score Preview": "Rankings",
            "Landscape Event Archive": "Event archive", "The Wrestling Week": "Weekly schedule",
            "Monthly Cycle": "Monthly cycle", "Landscape Archive": "Period archive",
            "Personality Profile": "Select / create", "Account Information": "Identity",
            "Voice and Behavior": "Voice", "Recurring Innanet Accounts": "Browse accounts"
        };

        const workspace = document.querySelector(".control-room-page");
        const flows = [];
        for (const panel of document.querySelectorAll("section[id^='cr-tool-']")) {
            const header = panel.querySelector(":scope > .control-room-panel-heading");
            if (!header) continue;
            const key = panel.id.slice("cr-tool-".length);
            let entries;
            if (checkpoints[key]) {
                entries = checkpoints[key].map(([label, target]) => ({label,
                    target: typeof target === "function" ? target() : panel.querySelector(target)}));
            } else {
                entries = Array.from(panel.children).flatMap(node => {
                    if (node.matches(".cr-editor-top-grid")) return [{label: "Select", target: node}];
                    if (node.matches(".cr-manager-actions")) return [{label: "Review & save", target: node}];
                    if (!node.matches(".cr-editor-section")) return [];
                    const title = node.querySelector("h3")?.textContent.trim();
                    return title ? [{label: shortLabels[title] || title, target: node}] : [];
                });
            }
            entries = entries.filter(entry => entry.target);
            if (!entries.length) continue;

            const nav = document.createElement("nav");
            nav.className = "cr-flow-nav";
            nav.setAttribute("aria-label", `${header.querySelector("h2").textContent.trim()} workflow`);
            for (const [index, entry] of entries.entries()) {
                if (!entry.target.id) entry.target.id = `${panel.id}-step-${index + 1}`;
                entry.target.classList.add("cr-flow-checkpoint");
                const button = document.createElement("button");
                button.type = "button";
                button.className = "cr-flow-link";
                button.textContent = entry.label;
                button.setAttribute("aria-controls", entry.target.id);
                button.addEventListener("click", () => {
                    const review = entry.target.previousElementSibling;
                    const destination = entry.target.matches(".cr-manager-actions")
                        && review?.matches(".cr-change-preview:not([hidden])")
                        ? review : entry.target;
                    destination.scrollIntoView({block: "start", behavior: "auto"});
                    // Keyboard users land at the same checkpoint without losing
                    // the normal tab order of the original form controls.
                    destination.setAttribute("tabindex", "-1");
                    destination.focus({preventScroll: true});
                });
                nav.append(button);
                entry.button = button;
            }
            header.append(nav);
            panel.classList.add("cr-flow-enabled");
            flows.push({panel, header, entries});
        }

        let scheduled = false;
        function updateNavigation() {
            scheduled = false;
            for (const {panel, header, entries} of flows) {
                if (!panel.getClientRects().length) continue;
                const stickyHeading = window.matchMedia("(max-width: 900px)").matches
                    ? document.querySelector(".cr-tool-jump-bar") : header;
                const offset = `${Math.ceil(stickyHeading?.getBoundingClientRect().height || 0) + 16}px`;
                if (panel.style.getPropertyValue("--cr-flow-offset") !== offset) {
                    panel.style.setProperty("--cr-flow-offset", offset);
                }
                const visible = entries.filter(entry => {
                    const shown = !!entry.target.getClientRects().length;
                    if (entry.button.hidden === shown) entry.button.hidden = !shown;
                    return shown;
                });
                const line = header.getBoundingClientRect().bottom + 40;
                let active = visible[0];
                for (const entry of visible) {
                    if (entry.target.getBoundingClientRect().top <= line) active = entry;
                }
                for (const entry of entries) {
                    if (entry === active) entry.button.setAttribute("aria-current", "step");
                    else entry.button.removeAttribute("aria-current");
                }
            }
        }
        function scheduleUpdate() {
            if (!scheduled) {
                scheduled = true;
                requestAnimationFrame(updateNavigation);
            }
        }
        workspace?.addEventListener("scroll", scheduleUpdate, {passive: true});
        window.addEventListener("scroll", scheduleUpdate, {passive: true});
        window.addEventListener("resize", scheduleUpdate);
        window.addEventListener("owl-control-room-data-loaded", scheduleUpdate);
        document.addEventListener("change", scheduleUpdate);
        const observer = new MutationObserver(scheduleUpdate);
        for (const {panel} of flows) {
            observer.observe(panel, {subtree: true, attributes: true, attributeFilter: ["hidden"]});
        }
        scheduleUpdate();
    }

    // Some managers add sections only after the folder is connected (including
    // High Endurance Restoration). Build navigation after that first load, so
    // those functions get checkpoints too. Later reloads retain the same UI.
    if (document.getElementById("cr-dashboard")?.hidden === false) {
        initializeLayout();
    } else {
        window.addEventListener("owl-control-room-data-loaded", initializeLayout, {once: true});
    }
})();

/*
 * Control Room write-health guard.
 * This is intentionally separate from every manager's save code. It verifies the
 * common dependency all writers share: the connected File System Access handle.
 * The probe writes, reads back, and removes a temporary file so a broken or stale
 * connection is visible before a manager claims a save succeeded.
 */
(() => {
    "use strict";

    const byId = id => document.getElementById(id);

    function installWriteHealthUi() {
        const grid = document.querySelector(".control-room-repo-grid");
        if (grid && !byId("cr-write-health")) {
            const item = document.createElement("div");
            item.className = "control-room-repo-item";
            item.innerHTML = '<span>WRITE ACCESS</span><strong id="cr-write-health">—</strong>';
            grid.appendChild(item);
        }

        const actions = document.querySelector(".control-room-actions");
        if (actions && !byId("cr-verify-write-access")) {
            const button = document.createElement("button");
            button.id = "cr-verify-write-access";
            button.type = "button";
            button.className = "control-room-button control-room-button-secondary";
            button.textContent = "Verify Write Access";
            button.hidden = true;
            button.addEventListener("click", () => verifyWriteAccess(true));
            actions.appendChild(button);
        }
    }

    function render(result) {
        window.owlControlRoomWriteHealth = result;
        const label = byId("cr-write-health");
        const button = byId("cr-verify-write-access");
        if (button) button.hidden = result.state === "disconnected";
        if (!label) return;

        label.textContent = result.ok
            ? "VERIFIED"
            : result.state === "permission"
                ? "PERMISSION REQUIRED"
                : result.state === "disconnected"
                    ? "DISCONNECTED"
                    : "WRITE BLOCKED";
        label.title = result.message || "";
    }

    async function verifyWriteAccess(requestIfNeeded = false) {
        installWriteHealthUi();

        if (typeof owlRepositoryHandle === "undefined" || !owlRepositoryHandle) {
            const result = {ok: false, state: "disconnected", message: "No OWL folder is connected."};
            render(result);
            return result;
        }

        const options = {mode: "readwrite"};

        try {
            let permission = await owlRepositoryHandle.queryPermission(options);
            if (permission !== "granted" && requestIfNeeded) {
                permission = await owlRepositoryHandle.requestPermission(options);
            }

            if (permission !== "granted") {
                const result = {
                    ok: false,
                    state: "permission",
                    message: "Read/write permission is not granted. Click Verify Write Access or reconnect the exact repository folder GitHub Desktop is using."
                };
                render(result);
                return result;
            }

            const dataDirectory = await owlRepositoryHandle.getDirectoryHandle("data");
            const probeName = ".owl-control-room-write-probe.tmp";
            const token = `OWL-WRITE-PROBE:${Date.now()}:${Math.random().toString(36).slice(2)}`;

            try {
                const probeHandle = await dataDirectory.getFileHandle(probeName, {create: true});
                const writable = await probeHandle.createWritable();
                await writable.write(token);
                await writable.close();

                const file = await probeHandle.getFile();
                if (await file.text() !== token) {
                    throw new Error("The write probe did not read back the same bytes.");
                }

                await dataDirectory.removeEntry(probeName);
            } catch (probeError) {
                try { await dataDirectory.removeEntry(probeName); } catch {}
                throw probeError;
            }

            let gitMetadata = false;
            try {
                await owlRepositoryHandle.getDirectoryHandle(".git");
                gitMetadata = true;
            } catch {
                // Some browser/filesystem combinations do not expose dot folders.
            }

            const folderName = owlRepositoryHandle.name || "OWL repository";
            const result = {
                ok: true,
                state: "verified",
                folderName,
                gitMetadata,
                message: gitMetadata
                    ? `Read/write verified for ${folderName}; Git metadata is present.`
                    : `Read/write verified for ${folderName}. Git metadata could not be confirmed, so make sure this is the exact folder GitHub Desktop is watching.`
            };
            render(result);
            return result;
        } catch (error) {
            const result = {
                ok: false,
                state: "blocked",
                message: error?.message || "The connected folder could not be written to."
            };
            render(result);
            console.error("Control Room write verification failed:", error);
            return result;
        }
    }

    window.owlControlRoomVerifyWriteAccess = verifyWriteAccess;
    installWriteHealthUi();

    window.addEventListener("owl-control-room-data-loaded", () => {
        verifyWriteAccess(false);
    });

    if (typeof owlRepositoryHandle !== "undefined" && owlRepositoryHandle) {
        verifyWriteAccess(false);
    } else {
        render({ok: false, state: "disconnected", message: "Repository not connected."});
    }
})();
