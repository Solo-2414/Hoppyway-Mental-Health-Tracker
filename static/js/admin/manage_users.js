// Global State
let users = [];
let currentPage = 1;
const rowsPerPage = 10;

// Dynamic Modals Containers
let editUserModal, viewUserModal, deleteUserModal;

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. DOM ELEMENTS (Selected after DOM is ready) ---
    const userTableBody = document.getElementById("userTableBody");
    const addUserBtn = document.getElementById("addUserBtn");
    const addUserModal = document.getElementById("addUserModal");
    const addUserForm = document.getElementById("addUserForm");
    
    const searchInput = document.getElementById("searchUser");
    const filterRole = document.getElementById("filterRole");
    const filterStatus = document.getElementById("filterStatus");

    // --- 2. INITIAL FETCH ---
    fetchUsers();

    // --- 3. EVENT LISTENERS: ADD USER ---
    if (addUserBtn && addUserModal) {
        addUserBtn.addEventListener("click", () => {
            openModal(addUserModal);
        });

        // Close button inside modal
        const closeBtn = addUserModal.querySelector(".close-modal");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                closeModal(addUserModal);
            });
        }
    }

    if (addUserForm) {
        addUserForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = addUserForm.querySelector("button[type='submit']");
            const originalText = btn.innerText;
            btn.innerText = "Adding...";
            
            const inputs = addUserForm.querySelectorAll("input, select");
            const newUser = {
                name: inputs[0].value,
                username: inputs[1].value,
                email: inputs[2].value,
                password: inputs[3].value,
                role: inputs[4].value
            };

            try {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                });

                if (response.ok) {
                    alert("User created successfully!");
                    closeModal(addUserModal);
                    addUserForm.reset();
                    fetchUsers(); 
                } else {
                    const err = await response.json();
                    alert("Error: " + err.error);
                }
            } catch (error) {
                console.error("Add user failed:", error);
            } finally {
                btn.innerText = originalText;
            }
        });
    }

    // --- 4. EVENT LISTENERS: FILTERS & PAGINATION ---
    if(searchInput) searchInput.addEventListener("input", () => { currentPage = 1; applyFilters(); });
    if(filterRole) filterRole.addEventListener("change", () => { currentPage = 1; applyFilters(); });
    if(filterStatus) filterStatus.addEventListener("change", () => { currentPage = 1; applyFilters(); });

    document.getElementById("prevPage")?.addEventListener("click", () => {
        if (currentPage > 1) { currentPage--; applyFilters(); }
    });
    document.getElementById("nextPage")?.addEventListener("click", () => {
        const totalPages = Math.ceil(window.currentDataSetLength / rowsPerPage);
        if (currentPage < totalPages) { currentPage++; applyFilters(); }
    });

    // --- 5. EVENT DELEGATION FOR TABLE ACTIONS ---
    if (userTableBody) {
        userTableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('.action-btn');
            if (!btn) return;

            const id = parseInt(btn.dataset.id);

            if (btn.classList.contains('view')) openViewUser(id);
            else if (btn.classList.contains('edit')) openEditUser(id);
            else if (btn.classList.contains('delete')) openDeleteUser(id);
        });
    }
});

// ==========================
// HELPER FUNCTIONS (Outside DOMContentLoaded so they are cleaner)
// ==========================

// --- Modal Helpers ---
function openModal(modal) {
    if(!modal) return;
    modal.style.display = "flex";
    // Small delay to allow display:flex to apply before adding opacity class
    setTimeout(() => { modal.classList.add("active"); }, 10);
    // document.body.style.overflow = "hidden"; // Optional: Prevent background scrolling
}

function closeModal(modal) {
    if(!modal) return;
    modal.classList.remove("active");
    // Wait for transition to finish
    setTimeout(() => { modal.style.display = "none"; }, 300);
    // document.body.style.overflow = "";
}

// --- Fetch Data ---
async function fetchUsers() {
    const userTableBody = document.getElementById("userTableBody");
    try {
        const response = await fetch('/api/all_users');
        if (!response.ok) throw new Error("Failed to fetch users");
        users = await response.json();
        applyFilters(); 
    } catch (error) {
        console.error("Error:", error);
        if(userTableBody) userTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">Error loading data</td></tr>`;
    }
}

// --- Render Table ---
function renderTable(data) {
    const userTableBody = document.getElementById("userTableBody");
    if(!userTableBody) return;
    
    userTableBody.innerHTML = "";

    if (data.length === 0) {
        userTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No users found</td></tr>`;
        return;
    }

    data.forEach((u) => {
        const row = document.createElement("tr");
        const displayRole = u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Unknown';
        const displayStatus = u.status || "Active";

        row.innerHTML = `
            <td>#${u.id}</td>
            <td><div style="font-weight:600;">${u.name}</div></td>
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td><span style="background:${u.role === 'admin' ? '#e3f2fd' : '#f5f5f5'}; padding:4px 8px; border-radius:4px; color:${u.role === 'admin' ? '#1976d2' : '#666'}; font-size:0.85rem;">${displayRole}</span></td>
            <td class="status ${displayStatus.toLowerCase()}">${displayStatus}</td>
            <td style="font-size:0.9rem; color:#777;">${u.lastLogin || 'Never'}</td>
            <td>
                <button class="action-btn view" data-id="${u.id}"><i class="fa-regular fa-eye"></i></button>
                <button class="action-btn edit" data-id="${u.id}"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="action-btn delete" data-id="${u.id}"><i class="fa-regular fa-trash-can"></i></button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

function applyFilters() {
    const searchInput = document.getElementById("searchUser");
    const filterRole = document.getElementById("filterRole");
    const filterStatus = document.getElementById("filterStatus");

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedRole = filterRole ? filterRole.value.toLowerCase() : "all";
    const selectedStatus = filterStatus ? filterStatus.value.toLowerCase() : "all";

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            (user.name && user.name.toLowerCase().includes(searchTerm)) ||
            (user.username && user.username.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm));

        const matchesRole = selectedRole === "all" || (user.role && user.role.toLowerCase() === selectedRole);
        const currentStatus = user.status ? user.status.toLowerCase() : 'active';
        const matchesStatus = selectedStatus === "all" || currentStatus === selectedStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });

    paginateUsers(filteredUsers);
}

function paginateUsers(dataSet) {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = dataSet.slice(start, end);

    renderTable(paginatedData);
    
    const totalPages = Math.ceil(dataSet.length / rowsPerPage) || 1;
    const pageInfo = document.getElementById("pageInfo");
    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");

    if(pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    if(prevBtn) prevBtn.disabled = currentPage === 1;
    if(nextBtn) nextBtn.disabled = currentPage === totalPages;
    
    window.currentDataSetLength = dataSet.length;
}

// ==========================
// DYNAMIC MODAL FUNCTIONS (Edit, Delete, View)
// ==========================

function openEditUser(id) {
    const user = users.find((u) => u.id === id);
    if (!editUserModal) createEditModal(); 

    const form = document.getElementById("editUserFormReal");
    form.dataset.id = id;

    form.querySelector("[name='name']").value = user.name;
    form.querySelector("[name='username']").value = user.username;
    form.querySelector("[name='email']").value = user.email;
    form.querySelector("[name='role']").value = user.role.toLowerCase(); 

    openModal(editUserModal);
}

function createEditModal() {
    editUserModal = document.createElement("div");
    editUserModal.className = "modal-overlay";
    editUserModal.innerHTML = `
        <div class="modal-box">
            <h2>Edit User</h2>
            <form id="editUserFormReal">
                <label>Name</label><input type="text" name="name" required />
                <label>Username</label><input type="text" name="username" required />
                <label>Email</label><input type="email" name="email" required />
                <label>Role</label>
                <select name="role">
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
                <button type="submit" class="btn primary full">Save Changes</button>
            </form>
            <span class="close-modal">&times;</span>
        </div>
    `;
    document.body.appendChild(editUserModal);
    
    editUserModal.querySelector(".close-modal").onclick = () => closeModal(editUserModal);
    
    document.getElementById("editUserFormReal").addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = e.target.dataset.id;
        const updatedData = {
            name: e.target.name.value,
            username: e.target.username.value,
            email: e.target.email.value,
            role: e.target.role.value
        };

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert("User updated!");
                closeModal(editUserModal);
                fetchUsers(); 
            } else {
                alert("Update failed");
            }
        } catch (err) { console.error(err); }
    });
}

function openDeleteUser(id) {
    const user = users.find((u) => u.id === id);
    if (!deleteUserModal) createDeleteModal();

    const modalTitle = deleteUserModal.querySelector("h2");
    const deleteText = deleteUserModal.querySelector(".delete-text");
    const deactivateBtn = document.getElementById("deactivateBtn");
    const deleteBtn = document.getElementById("confirmDeleteBtn");

    // Update Content
    modalTitle.innerText = "Account Actions";
    deleteText.innerHTML = `Manage access for <strong>${user.name}</strong> (@${user.username})`;

    // Configure Deactivate Button State
    // Check 'status' (safely handle undefined or null)
    const currentStatus = user.status ? user.status.toLowerCase() : 'active';
    const isDeactivated = currentStatus === 'disabled';

    deactivateBtn.innerHTML = isDeactivated 
        ? '<i class="fa-solid fa-unlock"></i> Activate Account' 
        : '<i class="fa-solid fa-ban"></i> Deactivate Account';
    
    deactivateBtn.className = isDeactivated 
        ? "btn full btn-success" 
        : "btn full btn-warning";

    // --- Deactivate Logic ---
    // Clone to remove old listeners
    const newDeactivateBtn = deactivateBtn.cloneNode(true);
    deactivateBtn.parentNode.replaceChild(newDeactivateBtn, deactivateBtn);

    newDeactivateBtn.onclick = async () => {
        const newStatus = isDeactivated ? 'active' : 'disabled';
        const actionText = isDeactivated ? "activate" : "deactivate";
        
        if(!confirm(`Are you sure you want to ${actionText} this user?`)) return;

        const originalText = newDeactivateBtn.innerHTML;
        newDeactivateBtn.innerText = "Processing...";
        newDeactivateBtn.disabled = true;

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                alert(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
                closeModal(deleteUserModal);
                fetchUsers(); // Refresh table to show new status
            } else {
                const err = await response.json();
                alert("Error: " + (err.error || "Failed to update status"));
            }
        } catch (err) { 
            console.error(err); 
            alert("Network error occurred.");
        } finally {
            newDeactivateBtn.innerHTML = originalText;
            newDeactivateBtn.disabled = false;
        }
    };

    // --- Delete Logic ---
    const newDeleteBtn = deleteBtn.cloneNode(true);
    deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
    
    newDeleteBtn.onclick = async () => {
        if(!confirm("⚠️ WARNING: This action is permanent and cannot be undone.\n\nAre you sure you want to delete this user?")) return;
        
        const originalText = newDeleteBtn.innerHTML;
        newDeleteBtn.innerText = "Deleting...";
        newDeleteBtn.disabled = true;

        try {
            const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert("User deleted permanently.");
                closeModal(deleteUserModal);
                fetchUsers();
            } else {
                alert("Failed to delete user.");
            }
        } catch (err) { console.error(err); }
        finally {
            newDeleteBtn.innerHTML = originalText;
            newDeleteBtn.disabled = false;
        }
    };

    openModal(deleteUserModal);
}

function createDeleteModal() {
    deleteUserModal = document.createElement("div");
    deleteUserModal.className = "modal-overlay";
    deleteUserModal.innerHTML = `
        <div class="modal-box action-modal">
            <h2>Account Actions</h2>
            <p class="delete-text"></p>
            
            <div class="modal-actions-stack">
                <button id="deactivateBtn" class="btn full btn-warning">
                    <i class="fa-solid fa-ban"></i> Deactivate Account
                </button>
                
                <div class="divider"><span>OR</span></div>

                <button id="confirmDeleteBtn" class="btn full btn-danger">
                    <i class="fa-solid fa-trash"></i> Delete Permanently
                </button>
                
                <button class="btn full close-delete btn-text">Cancel</button>
            </div>
            <span class="close-modal">&times;</span>
        </div>
    `;
    document.body.appendChild(deleteUserModal);

    deleteUserModal.querySelector(".close-modal").onclick = () => closeModal(deleteUserModal);
    deleteUserModal.querySelector(".close-delete").onclick = () => closeModal(deleteUserModal);
}

function openViewUser(id) {
    const user = users.find((u) => u.id === id);
    if (!viewUserModal) createViewModal();

    const content = viewUserModal.querySelector(".modal-box-content");
    content.innerHTML = `
        <div style="display:grid; gap:10px; font-size:1rem;">
            <div><strong>ID:</strong> ${user.id}</div>
            <div><strong>Name:</strong> ${user.name}</div>
            <div><strong>Username:</strong> @${user.username}</div>
            <div><strong>Email:</strong> ${user.email}</div>
            <div><strong>Role:</strong> ${user.role.toUpperCase()}</div>
            <div><strong>Status:</strong> ${user.status || 'Active'}</div>
            <div><strong>Last Login:</strong> ${user.lastLogin || 'Never'}</div>
        </div>
    `;
    openModal(viewUserModal);
}

function createViewModal() {
    viewUserModal = document.createElement("div");
    viewUserModal.className = "modal-overlay";
    viewUserModal.innerHTML = `
        <div class="modal-box">
            <h2>User Details</h2>
            <div class="modal-box-content" style="margin:20px 0;"></div>
            <button class="btn primary full close-view">Close</button>
            <span class="close-modal">&times;</span>
        </div>
    `;
    document.body.appendChild(viewUserModal);
    
    viewUserModal.querySelector(".close-modal").onclick = () => closeModal(viewUserModal);
    viewUserModal.querySelector(".close-view").onclick = () => closeModal(viewUserModal);
}