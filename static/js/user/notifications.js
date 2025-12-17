document.addEventListener("DOMContentLoaded", () => {
    
    // Select all delete buttons
    const deleteButtons = document.querySelectorAll(".delete-notif");

    deleteButtons.forEach(btn => {
        btn.addEventListener("click", async function() {
            // Get ID from data attribute
            const notifId = this.dataset.id;
            
            // Find the parent row to animate/remove
            const row = document.querySelector(`.notification-row[data-id="${notifId}"]`);

            if (!confirm("Are you sure you want to delete this notification?")) return;

            try {
                // Call the API
                const response = await fetch(`/api/notifications/${notifId}`, {
                    method: "DELETE"
                });

                if (response.ok) {
                    // Success: Animate removal
                    if (row) {
                        row.style.opacity = "0";
                        row.style.transform = "translateX(20px)";
                        
                        setTimeout(() => {
                            row.remove();
                            // Check if list is empty
                            const list = document.querySelector(".notifications-list");
                            if (list && list.children.length === 0) {
                                list.innerHTML = "<p style='text-align:center; padding:20px; color:#777;'>No notifications yet.</p>";
                            }
                        }, 300);
                    }
                } else {
                    alert("Failed to delete notification.");
                }
            } catch (err) {
                console.error("Error deleting notification:", err);
            }
        });
    });
});