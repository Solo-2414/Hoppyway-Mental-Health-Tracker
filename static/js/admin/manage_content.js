/* manage_content.js - API-based content manager */

const contentTableBody = document.querySelector("#contentTable tbody");
const addContentBtn = document.getElementById("addContentBtn");
const searchContentInput = document.getElementById("searchContent");

// Modal elements
const modal = document.getElementById("contentModal");
const modalTitle = document.getElementById("modalTitle");
const contentTypeSelect = document.getElementById("contentType");
const titleInput = document.getElementById("contentTitle");
const categoryInput = document.getElementById("contentCategory");
const descriptionInput = document.getElementById("contentDescription");
const emotionContainer = document.getElementById("emotionSelectContainer");
const emotionSelect = document.getElementById("emotionCategory");
const mediaInput = document.getElementById("contentMedia");
const saveContentBtn = document.getElementById("saveContentBtn");
const closeModalBtn = document.getElementById("closeModalBtn");


/* We'll create an overlay to dim the page when modal is shown */
let overlay = document.querySelector(".manage-content-overlay");
if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "manage-content-overlay";
    document.body.appendChild(overlay);
}

// Restore original modal CSS injection if not present
if (!document.querySelector("style#manageContentStyles")) {
    const s = document.createElement("style");
    s.id = "manageContentStyles";
    s.textContent = `
    .manage-content-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.45);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.18s ease;
        z-index: 999;
    }
    .manage-content-overlay.show {
        opacity: 1;
        pointer-events: all;
    }
    #contentModal {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -45%);
        width: 720px;
        max-width: calc(100% - 40px);
        background: var(--container-bg-color);
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.12);
        padding: 22px;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: transform 0.18s ease, opacity 0.18s ease;
        border: 1px solid var(--border-color);
        font-family: var(--inter-font);
    }
    #contentModal.show {
        transform: translate(-50%, -50%);
        opacity: 1;
        pointer-events: all;
    }
    #contentModal .modal-content { display:block; }
    #contentModal label { font-weight:600; display:block; margin-top:12px; color:var(--text-color); }
    #contentModal input[type="text"],
    #contentModal textarea,
    #contentModal select {
        width:100%;
        padding:10px 12px;
        border-radius:8px;
        border:1px solid var(--border-color);
        margin-top:6px;
        font-size:0.95rem;
        color:var(--text-color);
        background:var(--container-bg-color);
    }
    #contentModal textarea { min-height:100px; resize:vertical; }
    #contentModal .modal-actions {
        display:flex; gap:10px; justify-content:flex-end; margin-top:16px;
    }
    .btn-primary { background:var(--primary-color); color:white; border:none; padding:8px 14px; border-radius:8px; cursor:pointer; }
    .btn-secondary { background:transparent; border:1px solid var(--border-color); padding:8px 12px; border-radius:8px; cursor:pointer; }
    .btn-action { background:transparent; border:none; padding:8px; cursor:pointer; color:var(--text-color); border-radius:8px; transition:background 0.12s; }
    .btn-action:hover { background: rgba(0,0,0,0.04); }
    .actions { display:flex; gap:6px; align-items:center; }
    @media (max-width:820px){
        #contentModal { width: 94%; padding:16px; }
    }
    `;
    document.head.appendChild(s);
}

// Ensure overlay shows/hides together with modal
const observerModal = new MutationObserver((mut) => {
    const m = mut[0];
    if (!m) return;
    const isShown = modal.classList.contains("show");
    if (isShown) overlay.classList.add("show");
    else overlay.classList.remove("show");
});
observerModal.observe(modal, { attributes: true, attributeFilter: ["class"] });

let contents = [];
let editId = null;

/* ===========================
   LOAD CONTENT FROM API
=========================== */

async function loadContents() {
    try {
        const response = await fetch('/api/content');
        if (!response.ok) throw new Error('Failed to load contents');
        contents = await response.json();
        renderTable(contents);
    } catch (error) {
        console.error('Error loading contents:', error);
        alert('Error loading content');
    }
}

/* ===========================
   RENDERING
=========================== */

function renderTable(items = contents) {
    contentTableBody.innerHTML = "";

    if (!items.length) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="6" style="text-align:center; color:var(--grayish-color); padding:18px;">
            No content found. Add new content to get started.
        </td>`;
        contentTableBody.appendChild(tr);
        return;
    }

    items.forEach((c) => {
        const tr = document.createElement("tr");
        const typeDisplay = c.content_type === 'emotion' ? 'Emotion-Based' : 'Resource';
        const emotionDisplay = c.emotion ? ` • <em style="text-transform:capitalize;">${c.emotion.replace("_", " ")}</em>` : '';

        tr.innerHTML = `
            <td>${c.id}</td>
            <td>${escapeHtml(c.title)}</td>
            <td style="text-transform:capitalize">${typeDisplay}</td>
            <td>${escapeHtml(c.category || "")}${c.content_type === "emotion" && c.emotion ? emotionDisplay : ""}</td>
            <td>${formatDate(c.created_at)}</td>
            <td class="actions">
                <button class="btn-action edit-btn" data-id="${c.id}" title="Edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-action delete-btn" data-id="${c.id}" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        contentTableBody.appendChild(tr);
    });

    attachRowListeners();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    } catch (e) {
        return dateStr;
    }
}

function attachRowListeners() {
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", (e) => handleEditClick(e));
    });
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => handleDeleteClick(e));
    });
}

// Initial load
loadContents();

/* ===========================
   MODAL: Open / Close
=========================== */

function showModal() {
    modal.classList.add("show");
    overlay.classList.add("show");
    setTimeout(() => titleInput.focus(), 80);
}

function hideModal() {
    modal.classList.remove("show");
    overlay.classList.remove("show");
    resetForm();
}

function resetForm() {
    editId = null;
    titleInput.value = "";
    categoryInput.value = "";
    descriptionInput.value = "";
    mediaInput.value = "";
    emotionSelect.value = "happy";
    contentTypeSelect.value = "resource";
    emotionContainer.style.display = "none";
    modalTitle.textContent = "Add Content";
    saveContentBtn.textContent = "Save";
}

/* ===========================
   MODAL: Content Type Toggle
=========================== */

contentTypeSelect.addEventListener("change", () => {
    const kind = contentTypeSelect.value;
    emotionContainer.style.display = kind === "emotion" ? "block" : "none";
});

/* ===========================
   ADD BUTTON
=========================== */

addContentBtn.addEventListener("click", () => {
    resetForm();
    showModal();
});

closeModalBtn.addEventListener("click", hideModal);
overlay.addEventListener("click", hideModal);
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) hideModal();
});

/* ===========================
   SAVE CONTENT
=========================== */

saveContentBtn.addEventListener("click", async () => {
    const contentType = contentTypeSelect.value;
    const title = titleInput.value.trim();
    const category = categoryInput.value.trim();
    const description = descriptionInput.value.trim();
    const media = mediaInput.value.trim();
    const emotion = contentType === "emotion" ? emotionSelect.value : null;

    // Validation
    if (!title) {
        alert("Please enter a title.");
        titleInput.focus();
        return;
    }
    if (!category) {
        alert("Please enter a category (e.g. Article, Video).");
        categoryInput.focus();
        return;
    }
    if (!description) {
        alert("Please enter a description.");
        descriptionInput.focus();
        return;
    }

    try {
        const method = editId ? 'PUT' : 'POST';
        const url = editId ? `/api/content/${editId}` : '/api/content';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description,
                content_type: contentType,
                category,
                emotion,
                media_url: media
            })
        });

        if (!response.ok) {
            const error = await response.json();
            alert('Error: ' + (error.error || 'Failed to save content'));
            return;
        }

        await loadContents();
        hideModal();
        alert(editId ? 'Content updated!' : 'Content added successfully!');
    } catch (error) {
        console.error('Error saving content:', error);
        alert('Error saving content');
    }
});

/* ===========================
   DELETE CONTENT
=========================== */

async function handleDeleteClick(e) {
    const id = Number(e.currentTarget.dataset.id);
    const item = contents.find((c) => c.id === id);
    if (!item) return;

    const confirmed = confirm(`Delete "${item.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
        const response = await fetch(`/api/content/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            alert('Error deleting content');
            return;
        }

        await loadContents();
        alert('Content deleted successfully!');
    } catch (error) {
        console.error('Error deleting content:', error);
        alert('Error deleting content');
    }
}

/* ===========================
   EDIT CONTENT
=========================== */

async function handleEditClick(e) {
    const id = Number(e.currentTarget.dataset.id);
    const item = contents.find((c) => c.id === id);
    if (!item) {
        alert("Could not find content.");
        return;
    }

    editId = id;
    modalTitle.textContent = "Edit Content";
    saveContentBtn.textContent = "Update";

    titleInput.value = item.title;
    categoryInput.value = item.category || "";
    descriptionInput.value = item.description;
    mediaInput.value = item.media_url || "";
    contentTypeSelect.value = item.content_type;
    
    if (item.content_type === "emotion") {
        emotionContainer.style.display = "block";
        emotionSelect.value = item.emotion || "happy";
    } else {
        emotionContainer.style.display = "none";
    }

    showModal();
}

/* ===========================
   SEARCH
=========================== */

searchContentInput.addEventListener("input", () => {
    const q = searchContentInput.value.trim().toLowerCase();
    if (!q) {
        renderTable(contents);
        return;
    }

    const filtered = contents.filter((c) => {
        return (
            c.title.toLowerCase().includes(q) ||
            (c.category && c.category.toLowerCase().includes(q)) ||
            (c.content_type && c.content_type.toLowerCase().includes(q)) ||
            (c.emotion && c.emotion.toLowerCase().includes(q)) ||
            (c.description && c.description.toLowerCase().includes(q))
        );
    });

    renderTable(filtered);
});

/* ===========================
   Expose API for user pages
=========================== */

window.getAllResources = async function () {
    try {
        const response = await fetch('/api/content/resources');
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Error fetching resources:', error);
        return [];
    }
};

window.getContentForEmotion = async function (emotionKey) {
    try {
        const response = await fetch(`/api/content/emotion/${emotionKey}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Error fetching emotion content:', error);
        return [];
    }
};
