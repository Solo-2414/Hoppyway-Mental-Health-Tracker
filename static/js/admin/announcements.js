document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("announcementForm");
    const titleInput = document.getElementById("announcementTitle");
    const contentInput = document.getElementById("announcementContent");
    const submitBtn = document.querySelector(".btn-submit");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            showAlert("Please fill in all fields.", "error");
            return;
        }

        // UX: Disable button while sending
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = "Publishing...";
        submitBtn.disabled = true;

        try {
            const response = await fetch("/api/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content }),
            });

            const data = await response.json();

            if (response.ok) {
                showAlert(`Success! Sent to ${data.recipient_count} users.`, "success");
                form.reset();
            } else {
                throw new Error(data.error || "Failed to publish.");
            }
        } catch (error) {
            console.error("Announcement Error:", error);
            showAlert(error.message, "error");
        } finally {
            // Restore button
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    /* --- CUSTOM ALERT SYSTEM --- */
    function showAlert(message, type) {
        // Remove existing alerts first
        const existing = document.querySelector('.announce-alert');
        if (existing) existing.remove();

        const alert = document.createElement("div");
        alert.className = `announce-alert ${type}`;
        alert.innerHTML = message; // Using innerHTML allows for bold text if needed

        document.body.appendChild(alert);

        // Animation In
        requestAnimationFrame(() => {
            alert.classList.add("show");
        });

        // Auto Dismiss
        setTimeout(() => {
            alert.classList.remove("show");
            alert.addEventListener('transitionend', () => alert.remove());
        }, 3500);
    }
});