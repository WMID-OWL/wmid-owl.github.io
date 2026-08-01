// =================================
// OWL TROPHY ROOM MANAGER
// CAREER ACHIEVEMENT DATABASE
// =================================

(() => {
    const CATEGORIES = {
        "video-game-cover": "Video Game Cover",
        "movie-role": "Movie Role",
        "television-role": "Television Role",
        "documentary": "Documentary",
        "endorsement": "Endorsement",
        "magazine-cover": "Magazine Cover",
        "special-award": "Special Award",
        "career-milestone": "Career Milestone",
        "other": "Other Achievement"
    };

    const byId = id => document.getElementById(id);
    const array = value => Array.isArray(value) ? value : [];
    const text = value => String(value || "").trim();

    const els = {
        panel: byId("cr-tool-trophy-room"),
        status: byId("cr-trophy-status"),
        totalCount: byId("cr-trophy-total-count"),
        wrestlerCount: byId("cr-trophy-wrestler-count"),
        externalCount: byId("cr-trophy-external-count"),
        featuredCount: byId("cr-trophy-featured-count"),
        mode: byId("cr-trophy-mode"),
        existingRow: byId("cr-trophy-existing-row"),
        existing: byId("cr-trophy-existing"),
        idPreview: byId("cr-trophy-id-preview"),
        recipientType: byId("cr-trophy-recipient-type"),
        wrestlerRow: byId("cr-trophy-wrestler-row"),
        wrestler: byId("cr-trophy-wrestler"),
        externalRow: byId("cr-trophy-external-row"),
        externalName: byId("cr-trophy-external-name"),
        category: byId("cr-trophy-category"),
        title: byId("cr-trophy-title"),
        year: byId("cr-trophy-year"),
        date: byId("cr-trophy-date"),
        source: byId("cr-trophy-source"),
        description: byId("cr-trophy-description"),
        image: byId("cr-trophy-image"),
        link: byId("cr-trophy-link"),
        visibility: byId("cr-trophy-visibility"),
        featured: byId("cr-trophy-featured"),
        preview: byId("cr-trophy-preview"),
        previewList: byId("cr-trophy-preview-list"),
        error: byId("cr-trophy-error"),
        save: byId("cr-trophy-save"),
        delete: byId("cr-trophy-delete"),
        message: byId("cr-trophy-message"),
        archive: byId("cr-trophy-archive")
    };

    if (!els.panel) {
        return;
    }

    let busy = false;

    function database() {
        const value = owlControlRoomData?.careerAchievements;

        if (!value || Array.isArray(value) || typeof value !== "object") {
            return {
                version: 1,
                achievements: []
            };
        }

        return {
            ...value,
            version: Number(value.version || 1),
            achievements: array(value.achievements)
        };
    }

    function wrestlers() {
        return array(owlControlRoomData?.wrestlers);
    }

    function categoryLabel(value) {
        return CATEGORIES[value] || CATEGORIES.other;
    }

    function slug(value) {
        return text(value)
            .toLowerCase()
            .replace(/['’]/g, "")
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "achievement";
    }

    function formatDate(value) {
        if (!value) {
            return "";
        }

        const parsed = new Date(`${value}T00:00:00`);

        if (Number.isNaN(parsed.getTime())) {
            return value;
        }

        return parsed.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function selectedAchievement() {
        const id = els.existing?.value || "";

        return database().achievements.find(
            achievement => achievement?.id === id
        ) || null;
    }

    function selectedWrestler() {
        const id = els.wrestler?.value || "";

        return wrestlers().find(
            wrestler => wrestler?.id === id
        ) || null;
    }

    function uniqueId(value, existingId = "") {
        if (existingId) {
            return existingId;
        }

        const base = slug(
            [value.recipientName, value.title, value.year]
                .filter(Boolean)
                .join("-")
        );

        const used = new Set(
            database().achievements.map(
                achievement => achievement?.id
            )
        );

        let candidate = base;
        let suffix = 2;

        while (used.has(candidate)) {
            candidate = `${base}-${suffix}`;
            suffix += 1;
        }

        return candidate;
    }

    function draft() {
        const existing = selectedAchievement();
        const recipientType = els.recipientType?.value || "wrestler";
        const wrestler = recipientType === "wrestler"
            ? selectedWrestler()
            : null;

        const value = {
            recipientType,
            recipientId: wrestler?.id || "",
            recipientName: recipientType === "wrestler"
                ? wrestler?.name || ""
                : text(els.externalName?.value),
            category: els.category?.value || "other",
            categoryLabel: categoryLabel(els.category?.value),
            title: text(els.title?.value),
            year: Number(els.year?.value || 0),
            date: els.date?.value || "",
            source: text(els.source?.value),
            description: text(els.description?.value),
            image: text(els.image?.value),
            link: text(els.link?.value),
            visibility: els.visibility?.value || "public",
            featured: Boolean(els.featured?.checked)
        };

        value.id = uniqueId(value, existing?.id || "");

        return value;
    }

    function validationError(value) {
        if (!["wrestler", "external"].includes(value.recipientType)) {
            return "Select a valid recipient type.";
        }

        if (value.recipientType === "wrestler" && !value.recipientId) {
            return "Select an OWL wrestler.";
        }

        if (!value.recipientName) {
            return "Recipient name is required.";
        }

        if (!value.title) {
            return "Achievement title is required.";
        }

        if (!Number.isInteger(value.year) || value.year < 2026) {
            return "Enter a valid OWL year of 2026 or later.";
        }

        if (!value.description) {
            return "Achievement description is required.";
        }

        if (value.link && !/^https?:\/\//i.test(value.link)) {
            return "The optional external link must begin with http:// or https://.";
        }

        return "";
    }

    function setStatus(value) {
        if (els.status) {
            els.status.textContent = value;
        }
    }

    function setMessage(message, type = "success") {
        if (!els.message) {
            return;
        }

        els.message.textContent = message;
        els.message.className =
            `cr-save-message ${type === "error" ? "save-error" : "save-success"}`;
        els.message.hidden = false;
    }

    function clearMessage() {
        if (!els.message) {
            return;
        }

        els.message.hidden = true;
        els.message.textContent = "";
    }

    function addPreviewRow(label, value) {
        const row = document.createElement("div");
        row.className = "cr-editor-change-row";

        const strong = document.createElement("strong");
        strong.textContent = label;

        const span = document.createElement("span");
        span.textContent = value || "—";

        row.append(strong, span);
        els.previewList.appendChild(row);
    }

    function renderPreview() {
        if (!els.preview || !els.previewList || !els.save) {
            return;
        }

        const value = draft();
        const error = validationError(value);

        els.previewList.innerHTML = "";

        addPreviewRow("DATABASE ID", value.id);
        addPreviewRow("RECIPIENT", value.recipientName);
        addPreviewRow(
            "RECIPIENT TYPE",
            value.recipientType === "wrestler"
                ? "OWL Wrestler"
                : "External Archive"
        );
        addPreviewRow("CATEGORY", value.categoryLabel);
        addPreviewRow("TITLE", value.title);
        addPreviewRow(
            "DATE",
            value.date ? formatDate(value.date) : String(value.year || "—")
        );
        addPreviewRow(
            "VISIBILITY",
            value.visibility === "public" ? "Public" : "Hidden"
        );
        addPreviewRow("FEATURED", value.featured ? "Yes" : "No");

        els.idPreview.textContent = value.id || "—";
        els.preview.hidden = false;

        if (els.error) {
            els.error.textContent = error;
            els.error.hidden = !error;
        }

        els.save.disabled = busy || Boolean(error);
    }

    function toggleRecipientFields() {
        const external = els.recipientType?.value === "external";

        if (els.wrestlerRow) {
            els.wrestlerRow.hidden = external;
        }

        if (els.externalRow) {
            els.externalRow.hidden = !external;
        }

        renderPreview();
    }

    function clearForm() {
        els.recipientType.value = "wrestler";
        els.wrestler.value = "";
        els.externalName.value = "";
        els.category.value = "video-game-cover";
        els.title.value = "";
        els.year.value = String(new Date().getFullYear());
        els.date.value = "";
        els.source.value = "";
        els.description.value = "";
        els.image.value = "";
        els.link.value = "";
        els.visibility.value = "public";
        els.featured.checked = false;
        els.idPreview.textContent = "—";
        els.preview.hidden = true;
        els.save.disabled = true;
        els.delete.disabled = true;

        toggleRecipientFields();
    }

    function loadAchievement(value) {
        if (!value) {
            clearForm();
            return;
        }

        els.recipientType.value =
            value.recipientType === "external" ? "external" : "wrestler";
        els.wrestler.value = value.recipientId || "";
        els.externalName.value =
            value.recipientType === "external" ? value.recipientName || "" : "";
        els.category.value = CATEGORIES[value.category] ? value.category : "other";
        els.title.value = value.title || "";
        els.year.value = value.year || "";
        els.date.value = value.date || "";
        els.source.value = value.source || "";
        els.description.value = value.description || "";
        els.image.value = value.image || "";
        els.link.value = value.link || "";
        els.visibility.value =
            value.visibility === "hidden" ? "hidden" : "public";
        els.featured.checked = Boolean(value.featured);
        els.delete.disabled = false;

        toggleRecipientFields();
        renderPreview();
    }

    function renderMode() {
        const editing = els.mode?.value === "edit";

        els.existingRow.hidden = !editing;

        if (!editing) {
            els.existing.value = "";
            clearForm();
            return;
        }

        loadAchievement(selectedAchievement());
    }

    function sortedAchievements() {
        return [...database().achievements].sort((first, second) => {
            const firstValue = first?.date || `${first?.year || 0}-01-01`;
            const secondValue = second?.date || `${second?.year || 0}-01-01`;

            return String(secondValue).localeCompare(String(firstValue));
        });
    }

    function populateWrestlers() {
        const previous = els.wrestler.value;
        const values = [...wrestlers()]
            .filter(wrestler => wrestler?.id && wrestler?.name)
            .sort((first, second) =>
                String(first.name).localeCompare(String(second.name))
            );

        els.wrestler.innerHTML =
            '<option value="">Select Wrestler</option>';

        values.forEach(wrestler => {
            const option = document.createElement("option");
            option.value = wrestler.id;
            option.textContent = wrestler.name;
            els.wrestler.appendChild(option);
        });

        if (values.some(wrestler => wrestler.id === previous)) {
            els.wrestler.value = previous;
        }
    }

    function populateExisting() {
        const previous = els.existing.value;
        const values = sortedAchievements();

        els.existing.innerHTML =
            '<option value="">Select Achievement</option>';

        values.forEach(achievement => {
            const option = document.createElement("option");
            option.value = achievement.id;
            option.textContent =
                `${achievement.recipientName || "Unknown"} — ` +
                `${achievement.title || "Untitled"} (${achievement.year || "—"})`;
            els.existing.appendChild(option);
        });

        els.existing.disabled = values.length === 0;

        if (values.some(achievement => achievement.id === previous)) {
            els.existing.value = previous;
        }
    }

    function renderSummary() {
        const values = database().achievements;

        els.totalCount.textContent = values.length;
        els.wrestlerCount.textContent = values.filter(
            item => item?.recipientType === "wrestler"
        ).length;
        els.externalCount.textContent = values.filter(
            item => item?.recipientType === "external"
        ).length;
        els.featuredCount.textContent = values.filter(
            item => item?.featured === true
        ).length;
    }

    function renderArchive() {
        const values = sortedAchievements();
        els.archive.innerHTML = "";

        if (!values.length) {
            const empty = document.createElement("p");
            empty.className = "cr-landscape-entry-empty";
            empty.textContent =
                "No Trophy Room achievements have been recorded yet.";
            els.archive.appendChild(empty);
            return;
        }

        values.forEach(achievement => {
            const card = document.createElement("article");
            card.className = "cr-trophy-archive-card";

            card.innerHTML = `
                <div class="cr-trophy-archive-heading">
                    <div>
                        <span>${escapeHtml(categoryLabel(achievement.category))}</span>
                        <h4>${escapeHtml(achievement.title || "Untitled Achievement")}</h4>
                    </div>
                    <strong>
                        ${escapeHtml(
                            achievement.date
                                ? formatDate(achievement.date)
                                : achievement.year || "—"
                        )}
                    </strong>
                </div>

                <p class="cr-trophy-recipient">
                    ${escapeHtml(achievement.recipientName || "Unknown Recipient")}
                </p>

                <p>${escapeHtml(achievement.description || "")}</p>

                <div class="cr-trophy-archive-meta">
                    <span>
                        ${achievement.recipientType === "external"
                            ? "EXTERNAL ARCHIVE"
                            : "OWL WRESTLER"}
                    </span>
                    <span>
                        ${achievement.visibility === "hidden" ? "HIDDEN" : "PUBLIC"}
                    </span>
                    ${achievement.featured ? "<span>FEATURED</span>" : ""}
                </div>

                <button
                    class="control-room-button control-room-button-secondary"
                    type="button"
                    data-trophy-edit="${escapeHtml(achievement.id)}"
                >
                    Edit Achievement
                </button>
            `;

            els.archive.appendChild(card);
        });
    }

    function renderAll() {
        populateWrestlers();
        populateExisting();
        renderSummary();
        renderArchive();

        if (els.mode.value === "edit") {
            loadAchievement(selectedAchievement());
        }

        setStatus("READY");
    }

    async function writeDatabase(value) {
        if (!owlRepositoryHandle) {
            throw new Error("Connect the OWL repository first.");
        }

        const options = { mode: "readwrite" };
        let permission = await owlRepositoryHandle.queryPermission(options);

        if (permission !== "granted") {
            permission = await owlRepositoryHandle.requestPermission(options);
        }

        if (permission !== "granted") {
            throw new Error("Repository write permission was not granted.");
        }

        const dataDirectory =
            await owlRepositoryHandle.getDirectoryHandle("data");

        const fileHandle =
            await dataDirectory.getFileHandle("career-achievements.json");

        const writable =
            await fileHandle.createWritable();

        try {
            await writable.write(`${JSON.stringify(value, null, 2)}\n`);
            await writable.close();
        }

        catch (error) {
            try {
                await writable.abort();
            }

            catch {
                // No additional action is required.
            }

            throw error;
        }
    }

    async function saveAchievement() {
        if (busy) {
            return;
        }

        const value = draft();
        const error = validationError(value);

        if (error) {
            setMessage(error, "error");
            renderPreview();
            return;
        }

        const existing = selectedAchievement();

        const approved = window.confirm(
            `${existing ? "Update" : "Create"} this Trophy Room achievement?\n\n` +
            `${value.recipientName}\n${value.title}\n` +
            `${value.categoryLabel}\n${value.year}`
        );

        if (!approved) {
            return;
        }

        busy = true;
        els.save.disabled = true;
        setStatus("SAVING");

        try {
            const current = database();
            const now = new Date().toISOString();

            const achievement = {
                ...existing,
                ...value,
                createdAt: existing?.createdAt || now,
                updatedAt: now
            };

            const updated = {
                ...current,
                version: Number(current.version || 1),
                achievements: [
                    achievement,
                    ...current.achievements.filter(
                        item => item?.id !== achievement.id
                    )
                ]
            };

            await writeDatabase(updated);

            owlControlRoomData.careerAchievements =
                updated;

            window.dispatchEvent(
                new CustomEvent(
                    "owl-career-achievements-updated"
                )
            );

            setMessage(
                `${achievement.title} was saved to the Trophy Room.`
            );

            els.mode.value = "edit";

            renderAll();

            els.existing.value =
                achievement.id;

            loadAchievement(
                achievement
            );
        }

        catch (error) {
            console.error(
                "Could not save Trophy Room achievement:",
                error
            );

            setMessage(
                error.message ||
                "Could not save the Trophy Room achievement.",
                "error"
            );
        }

        finally {
            busy = false;
            setStatus("READY");
            renderPreview();
        }
    }

    async function deleteAchievement() {
        if (busy) {
            return;
        }

        const existing =
            selectedAchievement();

        if (!existing) {
            setMessage(
                "Select an achievement to delete.",
                "error"
            );

            return;
        }

        const approved = window.confirm(
            `Delete this Trophy Room achievement?\n\n` +
            `${existing.recipientName}\n${existing.title}\n\n` +
            "This removes it from the wrestler profile and future Trophy Room page."
        );

        if (!approved) {
            return;
        }

        busy = true;
        setStatus("DELETING");

        try {
            const current = database();

            const updated = {
                ...current,

                achievements:
                    current.achievements.filter(
                        item =>
                            item?.id !==
                            existing.id
                    )
            };

            await writeDatabase(
                updated
            );

            owlControlRoomData.careerAchievements =
                updated;

            window.dispatchEvent(
                new CustomEvent(
                    "owl-career-achievements-updated"
                )
            );

            setMessage(
                `${existing.title} was removed from the Trophy Room.`
            );

            els.existing.value = "";

            renderAll();
            clearForm();
        }

        catch (error) {
            console.error(
                "Could not delete Trophy Room achievement:",
                error
            );

            setMessage(
                error.message ||
                "Could not delete the Trophy Room achievement.",
                "error"
            );
        }

        finally {
            busy = false;
            setStatus("READY");
        }
    }

    [
        els.recipientType,
        els.wrestler,
        els.externalName,
        els.category,
        els.title,
        els.year,
        els.date,
        els.source,
        els.description,
        els.image,
        els.link,
        els.visibility,
        els.featured
    ]
        .filter(Boolean)
        .forEach(field => {
            const eventName =
                field.type === "checkbox" ||
                field.tagName === "SELECT"

                    ? "change"

                    : "input";

            field.addEventListener(
                eventName,
                () => {
                    clearMessage();

                    if (
                        field ===
                        els.recipientType
                    ) {
                        toggleRecipientFields();
                        return;
                    }

                    renderPreview();
                }
            );
        });

    els.mode.addEventListener(
        "change",
        () => {
            clearMessage();
            renderMode();
        }
    );

    els.existing.addEventListener(
        "change",
        () => {
            clearMessage();

            loadAchievement(
                selectedAchievement()
            );
        }
    );

    els.save.addEventListener(
        "click",
        saveAchievement
    );

    els.delete.addEventListener(
        "click",
        deleteAchievement
    );

    els.archive.addEventListener(
        "click",
        event => {
            const button =
                event.target.closest(
                    "[data-trophy-edit]"
                );

            if (!button) {
                return;
            }

            els.mode.value = "edit";

            renderMode();

            els.existing.value =
                button.dataset.trophyEdit;

            loadAchievement(
                selectedAchievement()
            );

            els.panel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    );

    function initialize() {
        populateWrestlers();
        populateExisting();
        renderSummary();
        renderArchive();
        renderMode();
        setStatus("READY");
    }

    window.addEventListener(
        "owl-control-room-data-loaded",
        initialize
    );

    window.addEventListener(
        "owl-career-achievements-updated",
        renderAll
    );

    if (
        typeof owlControlRoomData !== "undefined" &&
        wrestlers().length
    ) {
        initialize();
    }
})();
