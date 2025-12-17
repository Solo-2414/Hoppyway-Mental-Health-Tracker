document.addEventListener("DOMContentLoaded", () => {
    
    // --- SIDEBAR TOGGLE ---
    const sidebar = document.querySelector("aside");
    const menuBtn = document.querySelector("header .left-panel i.fas.fa-bars");
    const body = document.querySelector("body");

    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("expanded");
            body.classList.toggle("sidebar-expanded");
        });
    }

    // --- DROPDOWNS ---
    const settingsGear = document.getElementById("settings-gear");
    const settingsDropdown = document.getElementById("settings-dropdown");
    const settingsWrapper = document.querySelector(".settings-wrapper");
    const notifBell = document.getElementById("notif-bell");
    const notifDropdown = document.getElementById("notif-dropdown");
    const notifWrapper = document.querySelector(".notif-wrapper");

    // Toggle Settings
    if (settingsGear) {
        settingsGear.addEventListener("click", (e) => {
            e.stopPropagation();
            if (notifDropdown) notifDropdown.classList.remove("show"); // Close other
            settingsGear.classList.toggle("spin");
            settingsDropdown.classList.toggle("show");
        });
    }

    // Toggle Notifications
    if (notifBell) {
        notifBell.addEventListener("click", (e) => {
            e.stopPropagation();
            if (settingsDropdown) settingsDropdown.classList.remove("show"); // Close other
            if (settingsGear) settingsGear.classList.remove("spin");
            notifDropdown.classList.toggle("show");
        });
    }

    // Close on Click Outside
    document.addEventListener("click", (e) => {
        if (settingsWrapper && !settingsWrapper.contains(e.target)) {
            if (settingsDropdown) settingsDropdown.classList.remove("show");
            if (settingsGear) settingsGear.classList.remove("spin");
        }
        if (notifWrapper && !notifWrapper.contains(e.target)) {
            if (notifDropdown) notifDropdown.classList.remove("show");
        }
        
        // Close Modals on Background Click
        if (e.target.classList.contains("modal-overlay")) {
            closeModal(e.target);
        }
    });

    // --- DARK MODE ---
    const darkToggle = document.getElementById("dark-mode-toggle");
    
    function applyTheme(theme) {
        if (theme === "dark") {
            document.documentElement.classList.add("dark-mode");
            document.body.classList.add("dark-mode");
            if(darkToggle) darkToggle.classList.add("active");
        } else {
            document.documentElement.classList.remove("dark-mode");
            document.body.classList.remove("dark-mode");
            if(darkToggle) darkToggle.classList.remove("active");
        }
    }
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) applyTheme(savedTheme);

    if (darkToggle) {
        darkToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const isDark = document.documentElement.classList.toggle("dark-mode");
            document.body.classList.toggle("dark-mode", isDark);
            localStorage.setItem("theme", isDark ? "dark" : "light");
            darkToggle.classList.toggle("active", isDark);
        });
    }

    // --- NAVIGATION ---
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            window.location.href = "/logout"; // Adjust logout route
        });
    }

    // --- RIPPLE EFFECT ---
    document.querySelectorAll(".settings-dropdown button").forEach(btn => {
        btn.addEventListener("click", function(e) {
            const rect = this.getBoundingClientRect();
            this.style.setProperty("--x", `${e.clientX - rect.left}px`);
            this.style.setProperty("--y", `${e.clientY - rect.top}px`);
        });
    });

    // ==========================================
    //  NEW FUNCTIONALITY: PROFILE & BACKUP
    // ==========================================

    // --- 1. PROFILE MODAL LOGIC ---
    const profileBtn = document.querySelector(".profile-btn");
    const profileModal = document.getElementById("profileModal");
    const profileForm = document.getElementById("adminProfileForm");

    if (profileBtn && profileModal) {
        profileBtn.addEventListener("click", () => {
            closeDropdowns();
            openModal(profileModal);
        });
    }

    if (profileForm) {
        profileForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = profileForm.querySelector("button");
            btn.innerText = "Saving...";
            
            const data = {
                name: document.getElementById("adminName").value,
                email: document.getElementById("adminEmail").value,
                password: document.getElementById("adminPassword").value
            };

            try {
                // Mock API Call - Replace with real fetch
                // const res = await fetch('/api/admin/profile', { method: 'PUT', body: JSON.stringify(data) });
                await new Promise(r => setTimeout(r, 1000)); // Fake delay
                alert("Profile updated successfully!");
                closeModal(profileModal);
            } catch (error) {
                alert("Error updating profile.");
            } finally {
                btn.innerText = "Save Changes";
            }
        });
    }

    // --- 2. BACKUP MODAL LOGIC ---
    const backupBtn = document.querySelector(".backup-btn");
    const backupModal = document.getElementById("backupModal");
    const triggerBackupBtn = document.getElementById("triggerBackupBtn");
    const restoreForm = document.getElementById("restoreForm");

    if (backupBtn && backupModal) {
        backupBtn.addEventListener("click", () => {
            closeDropdowns();
            openModal(backupModal);
        });
    }

    if (triggerBackupBtn) {
        triggerBackupBtn.addEventListener("click", () => {
            // Trigger backend download
            window.location.href = "/api/admin/backup/download"; 
        });
    }

    if (restoreForm) {
        restoreForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if(!confirm("Are you sure? This will overwrite existing data.")) return;

            const btn = restoreForm.querySelector("button");
            btn.innerText = "Restoring...";
            
            const file = document.getElementById("backupFile").files[0];
            const formData = new FormData();
            formData.append('backup_file', file);

            try {
                const response = await fetch('/api/admin/backup/restore', {
                    method: 'POST',
                    body: formData
                });
                
                if(response.ok) {
                    alert("System restored successfully! Please log in again.");
                    window.location.href = "/logout";
                } else {
                    alert("Restore failed.");
                }
            } catch (error) {
                alert("Error uploading file.");
            } finally {
                btn.innerText = "Restore from File";
            }
        });
    }

    // --- HELPER FUNCTIONS ---
    function openModal(modal) {
        modal.style.display = "flex";
        setTimeout(() => modal.classList.add("active"), 10);
        document.body.classList.add("modal-open");
    }

    function closeModal(modal) {
        modal.classList.remove("active");
        document.body.classList.remove("modal-open");
        setTimeout(() => modal.style.display = "none", 300);
    }

    function closeDropdowns() {
        if (settingsDropdown) settingsDropdown.classList.remove("show");
        if (settingsGear) settingsGear.classList.remove("spin");
    }

    // Close buttons inside modals
    document.querySelectorAll(".close-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const modal = e.target.closest(".modal-overlay");
            closeModal(modal);
        });
    });
});