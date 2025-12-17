document.addEventListener("DOMContentLoaded", () => {
    
    // ============================
    // 1. SIDEBAR TOGGLE
    // ============================
    const sidebar = document.querySelector("aside");
    const menuBtn = document.querySelector("header .left-panel i.fas.fa-bars");
    const body = document.querySelector("body");

    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("expanded");
            body.classList.toggle("sidebar-expanded");
        });
    }

    // ============================
    // 2. DROPDOWN ELEMENTS
    // ============================
    const settingsGear = document.getElementById("settings-gear");
    const settingsDropdown = document.getElementById("settings-dropdown");
    const settingsWrapper = document.querySelector(".settings-wrapper");
    
    // Select the User Icon (Assuming it's the one in .icons div)
    const userIconBtn = document.querySelector(".icons .fa-user"); 

    const notifBell = document.getElementById("notif-bell");
    const notifDropdown = document.getElementById("notif-dropdown");
    const notifWrapper = document.querySelector(".notif-wrapper");

    // Helper: Toggle Settings Dropdown
    function toggleSettings(e) {
        e.stopPropagation();
        
        // Close Notification if open
        if (notifDropdown) notifDropdown.classList.remove("show");
        
        // Toggle Settings
        if (settingsGear) settingsGear.classList.toggle("spin");
        if (settingsDropdown) settingsDropdown.classList.toggle("show");
    }

    // Event Listeners for Settings
    if (settingsGear) settingsGear.addEventListener("click", toggleSettings);
    if (userIconBtn) {
        userIconBtn.style.cursor = "pointer"; // Ensure it looks clickable
        userIconBtn.addEventListener("click", toggleSettings);
    }

    // Event Listener for Notifications
    if (notifBell) {
        notifBell.addEventListener("click", (e) => {
            e.stopPropagation();
            
            // Close Settings if open
            if (settingsDropdown) settingsDropdown.classList.remove("show");
            if (settingsGear) settingsGear.classList.remove("spin");

            notifDropdown.classList.toggle("show");
        });
    }

    // Close on Outside Click
    document.addEventListener("click", (e) => {
        // Close Settings
        if (settingsWrapper && !settingsWrapper.contains(e.target) && e.target !== userIconBtn) {
            if (settingsDropdown) settingsDropdown.classList.remove("show");
            if (settingsGear) settingsGear.classList.remove("spin");
        }
        
        // Close Notifications
        if (notifWrapper && !notifWrapper.contains(e.target)) {
            if (notifDropdown) notifDropdown.classList.remove("show");
        }

        // Close Edit Profile Modal on Background Click
        const editModal = document.getElementById("editProfileModal");
        if (editModal && e.target === editModal) {
            closeEditModal();
        }
    });

    // ============================
    // 3. EDIT PROFILE LOGIC
    // ============================
    const editProfileBtn = document.querySelector(".edit-profile-btn"); // Button in dropdown
    const profileBtn = document.querySelector(".profile-btn"); // Alternative button class if used
    const editModal = document.getElementById("editProfileModal");
    const editForm = document.getElementById("editProfileForm");
    const closeEditBtn = editModal ? editModal.querySelector(".close-btn") : null;

    // Helper: Open Modal
    function openEditModal() {
        if (!editModal) return;
        
        // Close dropdowns first
        if (settingsDropdown) settingsDropdown.classList.remove("show");
        if (settingsGear) settingsGear.classList.remove("spin");

        editModal.style.display = "flex";
        // Small delay to allow display:flex to apply before adding opacity class for animation
        setTimeout(() => { editModal.classList.add("active"); }, 10);
        document.body.classList.add("modal-open");
    }

    // Helper: Close Modal
    function closeEditModal() {
        if (!editModal) return;
        editModal.classList.remove("active");
        document.body.classList.remove("modal-open");
        
        // Wait for animation to finish before hiding
        setTimeout(() => { editModal.style.display = "none"; }, 300);
    }

    // Event Listeners
    if (editProfileBtn) editProfileBtn.addEventListener("click", openEditModal);
    if (profileBtn) profileBtn.addEventListener("click", openEditModal); // Just in case you use this class
    if (closeEditBtn) closeEditBtn.addEventListener("click", closeEditModal);

    // Handle Form Submit
    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const btn = editForm.querySelector("button[type='submit']");
            const originalText = btn.innerText;
            
            // UX: Loading State
            btn.innerText = "Saving...";
            btn.disabled = true;

            // Gather Data
            const data = {
                name: document.getElementById("editName").value,
                username: document.getElementById("editUsername").value,
                email: document.getElementById("editEmail").value
            };

            try {
                const response = await fetch('/api/user/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Profile updated successfully!");
                    closeEditModal();
                    // Reload page to reflect changes (e.g. name in header)
                    location.reload(); 
                } else {
                    alert("Error: " + (result.error || "Failed to update profile"));
                }
            } catch (error) {
                console.error("Update Error:", error);
                alert("An error occurred. Please try again.");
            } finally {
                // Reset Button
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    // ============================
    // 4. DARK MODE LOGIC
    // ============================
    const darkToggle = document.getElementById("dark-mode-toggle");

    function applyTheme(theme) {
        if (theme === "dark") {
            document.documentElement.classList.add("dark-mode");
            document.body.classList.add("dark-mode");
            if (darkToggle) darkToggle.classList.add("active");
        } else {
            document.documentElement.classList.remove("dark-mode");
            document.body.classList.remove("dark-mode");
            if (darkToggle) darkToggle.classList.remove("active");
        }
    }

    // Check Local Storage on Load
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) applyTheme(savedTheme);

    // Toggle Click Listener
    if (darkToggle) {
        darkToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const isDark = document.documentElement.classList.toggle("dark-mode");
            document.body.classList.toggle("dark-mode", isDark);
            
            localStorage.setItem("theme", isDark ? "dark" : "light");
            darkToggle.classList.toggle("active", isDark);
        });
    }

    // ============================
    // 5. NAVIGATION LINKS
    // ============================
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            window.location.href = "/logout";
        });
    }

    const notifViewAllBtn = document.querySelector(".notif-view-all");
    if (notifViewAllBtn) {
        notifViewAllBtn.addEventListener("click", () => {
            window.location.href = "/notifications";
        });
    }
});