// Global State
let users = [];
let currentPage = 1;
const rowsPerPage = 10;

// DOM Elements
const userTableBody = document.getElementById("userTableBody");
const addUserBtn = document.getElementById("addUserBtn");
const addUserModal = document.getElementById("addUserModal");
const addUserForm = document.getElementById("addUserForm");
const searchInput = document.getElementById("searchUser");
const filterRole = document.getElementById("filterRole");
const filterStatus = document.getElementById("filterStatus");

// Dynamic Modals Containers
let editUserModal, viewUserModal, deleteUserModal;

// ==========================
// 1. FETCH DATA FROM DB
// ==========================
async function fetchUsers() {
    try {
        const response = await fetch('/api/all_users');
        if (!response.ok) throw new Error("Failed to fetch users");
        
        users = await response.json();
        
        // Initial Render
        applyFilters(); 
    } catch (error) {
        console.error("Error:", error);
        userTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">Error loading data</td></tr>`;
    }
}

// Load on start
document.addEventListener("DOMContentLoaded", fetchUsers);

// ==========================
// 2. RENDER & PAGINATION
// ==========================
function renderTable(data) {
    userTableBody.innerHTML = "";

    if (data.length === 0) {
        userTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No users found</td></tr>`;
        return;
    }

    data.forEach((u) => {
        const row = document.createElement("tr");
        
        // Ensure role is capitalized for display
        const displayRole = u.role.charAt(0).toUpperCase() + u.role.slice(1);
        const displayStatus = u.status || "Active"; // Default if not in DB yet

        row.innerHTML = `
            <td>#${u.id}</td>
            <td><div style="font-weight:600;">${u.name}</div></td>
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td><span style="background:${u.role === 'admin' ? '#e3f2fd' : '#f5f5f5'}; padding:4px 8px; border-radius:4px; color:${u.role === 'admin' ? '#1976d2' : '#666'}; font-size:0.85rem;">${displayRole}</span></td>
            <td class="status ${displayStatus.toLowerCase()}">${displayStatus}</td>
            <td style="font-size:0.9rem; color:#777;">${u.lastLogin || 'Never'}</td>
            <td>
                <button class="action-btn view" onclick="openViewUser(${u.id})"><i class="fa-regular fa-eye"></i></button>
                <button class="action-btn edit" onclick="openEditUser(${u.id})"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="action-btn delete" onclick="openDeleteUser(${u.id})"><i class="fa-regular fa-trash-can"></i></button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

// --- Filtering Logic ---
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedRole = filterRole.value.toLowerCase();
    const selectedStatus = filterStatus.value.toLowerCase();

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            (user.name && user.name.toLowerCase().includes(searchTerm)) ||
            (user.username && user.username.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm));

        const matchesRole =
            selectedRole === "all" || (user.role && user.role.toLowerCase() === selectedRole);

        // Note: Assuming 'Active' as default if status is missing in DB
        const currentStatus = user.status ? user.status.toLowerCase() : 'active';
        const matchesStatus =
            selectedStatus === "all" || currentStatus === selectedStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });

    paginateUsers(filteredUsers);
}

// --- Pagination Logic ---
function paginateUsers(dataSet) {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = dataSet.slice(start, end);

    renderTable(paginatedData);
    
    // Update Controls
    const totalPages = Math.ceil(dataSet.length / rowsPerPage) || 1;
    document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages;
    
    // Update Next/Prev Button Logic context
    window.currentDataSetLength = dataSet.length;
}

// Controls Event Listeners
searchInput.addEventListener("input", () => { currentPage = 1; applyFilters(); });
filterRole.addEventListener("change", () => { currentPage = 1; applyFilters(); });
filterStatus.addEventListener("change", () => { currentPage = 1; applyFilters(); });

document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; applyFilters(); }
});
document.getElementById("nextPage").addEventListener("click", () => {
    const totalPages = Math.ceil(window.currentDataSetLength / rowsPerPage);
    if (currentPage < totalPages) { currentPage++; applyFilters(); }
});


// ==========================
// 3. ADD USER (POST)
// ==========================
addUserBtn.addEventListener("click", () => { addUserModal.style.display = "flex"; });
addUserModal.querySelector(".close-modal").addEventListener("click", () => { addUserModal.style.display = "none"; });

addUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
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
            addUserModal.style.display = "none";
            addUserForm.reset();
            fetchUsers(); // Refresh table
        } else {
            const err = await response.json();
            alert("Error: " + err.error);
        }
    } catch (error) {
        console.error("Add user failed:", error);
    }
});


// ==========================
// 4. EDIT USER (PUT)
// ==========================
function openEditUser(id) {
    const user = users.find((u) => u.id === id);
    if (!editUserModal) createEditModal(); // Create if doesn't exist

    const form = document.getElementById("editUserFormReal");
    form.dataset.id = id;

    // Populate fields
    form.querySelector("[name='name']").value = user.name;
    form.querySelector("[name='username']").value = user.username;
    form.querySelector("[name='email']").value = user.email;
    form.querySelector("[name='role']").value = user.role.toLowerCase(); 
    // form.querySelector("[name='status']").value = user.status || 'Active';

    editUserModal.style.display = "flex";
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
    
    // Close Logic
    editUserModal.querySelector(".close-modal").onclick = () => editUserModal.style.display = "none";
    
    // Submit Logic
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
                editUserModal.style.display = "none";
                fetchUsers(); // Refresh
            } else {
                alert("Update failed");
            }
        } catch (err) { console.error(err); }
    });
}


// ==========================
// 5. DELETE USER (DELETE)
// ==========================
function openDeleteUser(id) {
    const user = users.find((u) => u.id === id);
    if (!deleteUserModal) createDeleteModal();

    const deleteText = deleteUserModal.querySelector(".delete-text");
    deleteText.innerHTML = `Are you sure you want to delete <strong>${user.name}</strong>?`;
    
    // Attach ID to the confirm button
    const confirmBtn = document.getElementById("confirmDeleteBtn");
    confirmBtn.onclick = async () => {
        try {
            const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert("User deleted.");
                deleteUserModal.style.display = "none";
                fetchUsers(); // Refresh
            } else {
                alert("Failed to delete user.");
            }
        } catch (err) { console.error(err); }
    };

    deleteUserModal.style.display = "flex";
}

function createDeleteModal() {
    deleteUserModal = document.createElement("div");
    deleteUserModal.className = "modal-overlay";
    deleteUserModal.innerHTML = `
        <div class="modal-box">
            <h2>Delete User</h2>
            <p class="delete-text"></p>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button id="confirmDeleteBtn" class="btn primary full" style="background:#FF3B30;">Delete</button>
                <button class="btn full close-delete">Cancel</button>
            </div>
            <span class="close-modal">&times;</span>
        </div>
    `;
    document.body.appendChild(deleteUserModal);

    deleteUserModal.querySelector(".close-modal").onclick = () => deleteUserModal.style.display = "none";
    deleteUserModal.querySelector(".close-delete").onclick = () => deleteUserModal.style.display = "none";
}


// ==========================
// 6. VIEW USER (Read-only)
// ==========================
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
    viewUserModal.style.display = "flex";
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
    
    viewUserModal.querySelector(".close-modal").onclick = () => viewUserModal.style.display = "none";
    viewUserModal.querySelector(".close-view").onclick = () => viewUserModal.style.display = "none";
}