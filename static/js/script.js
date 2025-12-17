document.addEventListener("DOMContentLoaded", function () {
    const signupModal = document.getElementById("signupModal");
    const signinModal = document.getElementById("signinModal");

    const signUpBtns = document.querySelectorAll(".sign-up");
    const loginBtn = document.querySelector(".login-link");

    const closeBtns = document.querySelectorAll(".close-btn");
    const openSigninLink = document.getElementById("openSignin");
    const openSignupLink = document.getElementById("openSignup");

    // Variable to track the closing animation timer
    let fadeOutTimer;

    // --- HELPER FUNCTIONS ---

    const openModal = (modal) => {
        if (!modal) return;

        // 1. STOP any pending close actions immediately
        clearTimeout(fadeOutTimer);

        // 2. Instantly hide the OTHER modal (if open) to prevent overlap
        if (modal === signupModal) {
            if (signinModal) {
                signinModal.classList.remove("active");
                signinModal.style.display = "none";
            }
        } else {
            if (signupModal) {
                signupModal.classList.remove("active");
                signupModal.style.display = "none";
            }
        }

        // 3. Open the requested modal
        modal.style.display = "flex";
        
        // Small delay to allow the display:flex to apply before adding opacity class
        requestAnimationFrame(() => {
            modal.classList.add("active");
        });

        // 4. Lock Scroll
        document.body.classList.add("modal-open");
        document.body.style.overflow = "hidden"; 
    };

    const closeModal = () => {
        // 1. Start Fade Out Animation
        if (signupModal) signupModal.classList.remove("active");
        if (signinModal) signinModal.classList.remove("active");

        // 2. Unlock Scroll immediately
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";

        // 3. Wait for animation to finish (300ms) then hide display
        // We assign this to a variable so we can CANCEL it if the user clicks open quickly
        fadeOutTimer = setTimeout(() => {
            if (signupModal) signupModal.style.display = "none";
            if (signinModal) signinModal.style.display = "none";
        }, 300); 
    };

    // --- SERVER TRIGGER CHECK (For Errors) ---
    const modalTrigger = document.body.dataset.showModal;
    if (modalTrigger === "signin") openModal(signinModal);
    else if (modalTrigger === "signup") openModal(signupModal);

    // --- EVENT LISTENERS ---

    // 1. Sign Up Buttons
    signUpBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            // We do NOT call closeModal() here anymore, openModal handles the swap
            openModal(signupModal);
        });
    });

    // 2. Login Link
    if (loginBtn) {
        loginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openModal(signinModal);
        });
    }

    // 3. Switch Links (inside modals)
    if (openSigninLink) {
        openSigninLink.onclick = () => {
            openModal(signinModal);
        };
    }

    if (openSignupLink) {
        openSignupLink.onclick = () => {
            openModal(signupModal);
        };
    }

    // 4. Close Buttons (X)
    closeBtns.forEach((btn) => {
        btn.onclick = closeModal;
    });

    // 5. Close when clicking background overlay
    window.addEventListener("click", (e) => {
        if (e.target === signupModal || e.target === signinModal) {
            closeModal();
        }
    });
});