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

    const userIconBtn = document.querySelector(".icons .fa-user"); 

    const notifBell = document.getElementById("notif-bell");
    const notifDropdown = document.getElementById("notif-dropdown");
    const notifWrapper = document.querySelector(".notif-wrapper");

    function toggleSettings(e) {
        e.stopPropagation();
        
        if (notifDropdown) notifDropdown.classList.remove("show");

        if (settingsGear) settingsGear.classList.toggle("spin");
        if (settingsDropdown) settingsDropdown.classList.toggle("show");
    }

    if (settingsGear) settingsGear.addEventListener("click", toggleSettings);
    if (userIconBtn) {
        userIconBtn.style.cursor = "pointer";
        userIconBtn.addEventListener("click", toggleSettings);
    }

    if (notifBell) {
        notifBell.addEventListener("click", (e) => {
            e.stopPropagation();

            if (settingsDropdown) settingsDropdown.classList.remove("show");
            if (settingsGear) settingsGear.classList.remove("spin");

            notifDropdown.classList.toggle("show");
        });
    }

    document.addEventListener("click", (e) => {
        if (settingsWrapper && !settingsWrapper.contains(e.target) && e.target !== userIconBtn) {
            if (settingsDropdown) settingsDropdown.classList.remove("show");
            if (settingsGear) settingsGear.classList.remove("spin");
        }

        if (notifWrapper && !notifWrapper.contains(e.target)) {
            if (notifDropdown) notifDropdown.classList.remove("show");
        }

        const editModal = document.getElementById("editProfileModal");
        if (editModal && e.target === editModal) {
            closeEditModal();
        }
    });

    // ============================
    // 3. EDIT PROFILE LOGIC
    // ============================
    const editProfileBtn = document.querySelector(".edit-profile-btn");
    const profileBtn = document.querySelector(".profile-btn");
    const editModal = document.getElementById("editProfileModal");
    const editForm = document.getElementById("editProfileForm");
    const closeEditBtn = editModal ? editModal.querySelector(".close-btn") : null;

    function openEditModal() {
        if (!editModal) return;
        
        if (settingsDropdown) settingsDropdown.classList.remove("show");
        if (settingsGear) settingsGear.classList.remove("spin");

        editModal.style.display = "flex";
        setTimeout(() => { editModal.classList.add("active"); }, 10);
        document.body.classList.add("modal-open");
    }

    function closeEditModal() {
        if (!editModal) return;
        editModal.classList.remove("active");
        document.body.classList.remove("modal-open");

        setTimeout(() => { editModal.style.display = "none"; }, 300);
    }

    if (editProfileBtn) editProfileBtn.addEventListener("click", openEditModal);
    if (profileBtn) profileBtn.addEventListener("click", openEditModal);
    if (closeEditBtn) closeEditBtn.addEventListener("click", closeEditModal);

    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const btn = editForm.querySelector("button[type='submit']");
            const originalText = btn.innerText;

            btn.innerText = "Saving...";
            btn.disabled = true;

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
                    location.reload(); 
                } else {
                    alert("Error: " + (result.error || "Failed to update profile"));
                }
            } catch (error) {
                console.error("Update Error:", error);
                alert("An error occurred. Please try again.");
            } finally {
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

    // ==========================================
    // 6. REAL-TIME NOTIFICATION POLLING
    // ==========================================
    
    function startNotificationPolling() {
        setInterval(fetchNotifications, 5000);
    }

    async function fetchNotifications() {
        try {
            const response = await fetch('/api/notifications/poll');
            if (!response.ok) return;

            const data = await response.json();
            updateNotificationUI(data);
        } catch (error) {
            console.error("Polling Error:", error);
        }
    }

    function updateNotificationUI(data) {
        const notifWrapper = document.querySelector(".notif-wrapper");
        const bellIcon = document.getElementById("notif-bell");
        const notifList = document.querySelector(".notif-list");
        
        let badge = document.querySelector(".notif-badge");
        
        if (data.count > 0) {
            if (!badge) {
                badge = document.createElement("span");
                badge.className = "notif-badge";
                notifWrapper.insertBefore(badge, bellIcon.nextSibling);
            }
            badge.innerText = data.count;
            badge.style.display = "flex";
        } else {
            if (badge) badge.style.display = "none";
        }

        if (data.notifications.length > 0) {
            notifList.innerHTML = "";
            
            data.notifications.forEach(n => {
                const item = document.createElement("div");
                item.className = "notif-item";
                item.onclick = () => window.location.href = '/notifications';
                
                item.innerHTML = `
                    <span class="notif-icon">
                        <i class="fa-solid fa-circle-info"></i>
                    </span>
                    <div class="notif-content">
                        <p>${n.message}</p>
                        <span class="notif-meta">${n.time}</span>
                    </div>
                `;
                notifList.appendChild(item);
            });
        } else {
            if (data.count === 0) {
                notifList.innerHTML = `
                    <div class="notif-empty">
                        <p>No new notifications</p>
                    </div>
                `;
            }
        }
    }

    startNotificationPolling();
});