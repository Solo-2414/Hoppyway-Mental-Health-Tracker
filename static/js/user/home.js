document.addEventListener("DOMContentLoaded", () => {
    const emotionContainer = document.querySelector(".emotion-container");
    const reCheckinContainer = document.querySelector(".re-checkin-container");
    const btnCheckInAgain = document.getElementById("btn-check-in-again");
    const periodTextSpan = document.getElementById("current-period-text");
    const userIdEl = document.getElementById("user-identity");

    const moodModal = document.getElementById("moodDetailModal");
    const closeModal = document.querySelector(".close-modal");
    const stressSlider = document.getElementById("stress-slider");
    const stressDisplay = document.getElementById("stress-display");
    const moodNotes = document.getElementById("mood-notes");
    const btnSubmitMood = document.getElementById("btn-submit-mood");

    const journalModal = document.getElementById("journalModal");
    const openJournalBtn = document.getElementById("open-journal-btn");
    const closeJournalBtn = document.getElementById("close-journal");
    const journalForm = document.getElementById("journal-form");

    let selectedMoodValue = null;
    let userId = userIdEl ? userIdEl.getAttribute("data-user-id") : "guest";

    const breathingModal = document.getElementById("breathingModal");
    const openBtn = document.getElementById("start-breathing-btn");
    const closeBtn = document.getElementById("close-breathing");

    const startBtn = document.getElementById("begin-session-btn");
    const stopBtn = document.getElementById("stop-breathing-btn"); 
 
    const container = document.getElementById("breathing-container");
    const text = document.getElementById("breath-text");
    const timerDisplay = document.getElementById("breath-timer");

    const totalTime = 7500; 
    const breatheTime = 3000;
    const holdTime = 1500;
    
    let breathingInterval;
    let countdownInterval;
  
    let holdTimeout;
    let exhaleTimeout;
    
    let timeLeft = 120; 

    function breathAnimation() {
        if (!container) return;

        text.innerText = 'Breathe In';
        container.className = 'breathing-container grow';

        holdTimeout = setTimeout(() => {
            text.innerText = 'Hold';

            exhaleTimeout = setTimeout(() => {
                text.innerText = 'Breathe Out';
                container.className = 'breathing-container shrink';
            }, holdTime);

        }, breatheTime);
    }

    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        
        timerDisplay.innerText = `${minutes}:${seconds}`;
        
        if (timeLeft === 0) {
            finishExercise();
        } else {
            timeLeft--;
        }
    }

    function startSession() {
        startBtn.style.display = "none";
        stopBtn.style.display = "inline-block";
        timerDisplay.style.color = "var(--primary-color)";
        
        timeLeft = 120; 
        updateTimer(); 

        breathAnimation();
        breathingInterval = setInterval(breathAnimation, totalTime);

        countdownInterval = setInterval(updateTimer, 1000);
    }

    function stopSession() {
        clearInterval(breathingInterval);
        clearInterval(countdownInterval);

        clearTimeout(holdTimeout);
        clearTimeout(exhaleTimeout);

        container.className = "breathing-container"; 
        text.innerText = "Ready?";
        timerDisplay.innerText = "2:00";
        timerDisplay.style.color = "var(--primary-color)";
        
        startBtn.style.display = "inline-block";
        startBtn.innerText = "Start Exercise";
        stopBtn.style.display = "none";
    }

    function finishExercise() {
        clearInterval(breathingInterval);
        clearInterval(countdownInterval);
        clearTimeout(holdTimeout);
        clearTimeout(exhaleTimeout);
        
        container.className = "breathing-container";
        text.innerText = "Great Job!";
        timerDisplay.innerText = "Complete";
        timerDisplay.style.color = "#2ecc71"; 
        
        stopBtn.style.display = "none";
        startBtn.style.display = "inline-block";
        startBtn.innerText = "Do it again";
    }

    if (openBtn) {
        openBtn.addEventListener("click", () => {
            breathingModal.style.display = "flex";
            stopSession(); 
        });
    }

    if (startBtn) startBtn.addEventListener("click", startSession);
    if (stopBtn) stopBtn.addEventListener("click", stopSession);

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            stopSession();
            breathingModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === breathingModal) {
            stopSession();
            breathingModal.style.display = "none";
        }
    });


if (openJournalBtn) {
        openJournalBtn.addEventListener("click", () => {
            journalModal.style.display = "flex";
        });
    }

    if (closeJournalBtn) {
        closeJournalBtn.addEventListener("click", () => {
            journalModal.style.display = "none";
        });
    }

    if (journalForm) {
        journalForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const title = document.getElementById("journal-title").value;
            const entry = document.getElementById("journal-entry").value;
            const submitBtn = journalForm.querySelector("button");

            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Saving...";
            submitBtn.disabled = true;

            fetch("/log_journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title, entry: entry })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    journalForm.reset();
                    journalModal.style.display = "none";
                    alert("Journal entry saved successfully!");
                } else {
                    alert("Error saving journal.");
                }
            })
            .catch(err => console.error(err))
            .finally(() => {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // ============================
    // 2. TIPS CAROUSEL LOGIC
    // ============================
    const tipsModal = document.getElementById("tipsModal");
    const openTipsBtn = document.getElementById("open-tips-btn");
    const closeTipsBtn = document.getElementById("close-tips");
    
    const slides = document.querySelectorAll(".tip-slide");
    const dots = document.querySelectorAll(".dot");
    const prevBtn = document.getElementById("prev-tip");
    const nextBtn = document.getElementById("next-tip");
    let currentSlide = 0;

    function showSlide(index) {
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        slides.forEach(slide => slide.classList.remove("active"));
        slides[currentSlide].classList.add("active");

        dots.forEach(dot => dot.classList.remove("active"));
        dots[currentSlide].classList.add("active");
    }

    if (openTipsBtn) {
        openTipsBtn.addEventListener("click", () => {
            tipsModal.style.display = "flex";
            currentSlide = 0; 
            showSlide(0);
        });
    }

    if (closeTipsBtn) {
        closeTipsBtn.addEventListener("click", () => {
            tipsModal.style.display = "none";
        });
    }

    if (nextBtn) nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));
    if (prevBtn) prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));

    window.addEventListener("click", (e) => {
        if (e.target === journalModal) journalModal.style.display = "none";
        if (e.target === tipsModal) tipsModal.style.display = "none";
    });

    

    const now = new Date();
    const hour = now.getHours();
    let currentPeriod = "morning";
    let periodDisplayName = "Morning";

    if (hour >= 12 && hour < 18) {
        currentPeriod = "afternoon";
        periodDisplayName = "Afternoon";
    } else if (hour >= 18) {
        currentPeriod = "evening";
        periodDisplayName = "Evening";
    }

    if (periodTextSpan) periodTextSpan.innerText = periodDisplayName;

    const todayStr = now.toISOString().split('T')[0];
    const storageKey = `hoppy_mood_${userId}_${todayStr}_${currentPeriod}`;
    const alreadyLogged = localStorage.getItem(storageKey);

    if (alreadyLogged) {
        if(emotionContainer) emotionContainer.style.display = "none";
        if(reCheckinContainer) reCheckinContainer.style.display = "flex"; 
    } else {
        if(emotionContainer) emotionContainer.style.display = "block";
        if(reCheckinContainer) reCheckinContainer.style.display = "none";
    }
-
    if (btnCheckInAgain) {
        btnCheckInAgain.addEventListener("click", () => {
            reCheckinContainer.style.display = "none";
            emotionContainer.style.display = "block";
            emotionContainer.classList.add("fade-in");
        });
    }

    document.querySelectorAll(".emotion").forEach((emotion) => {
        emotion.addEventListener("click", function() {
            selectedMoodValue = this.getAttribute("data-value");

            stressSlider.value = 1;
            stressDisplay.innerText = "1";
            moodNotes.value = "";
            
            moodModal.style.display = "flex";
        });
    });

    if(stressSlider) {
        stressSlider.addEventListener("input", (e) => {
            stressDisplay.innerText = e.target.value;
        });
    }

    if(closeModal) {
        closeModal.addEventListener("click", () => {
            moodModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === moodModal) {
            moodModal.style.display = "none";
        }
    });

    if(btnSubmitMood) {
        btnSubmitMood.addEventListener("click", () => {
            const stressValue = stressSlider.value;
            const notes = moodNotes.value;

            if (!selectedMoodValue) return;

            fetch("/log_mood", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    mood_value: selectedMoodValue,
                    stress_value: stressValue,
                    notes: notes
                })
            })
            .then((res) => {
                if (res.ok) {
                    moodModal.style.display = "none";

                    localStorage.setItem(storageKey, "true");

                    emotionContainer.classList.add("fade-out");
                    
                    setTimeout(() => {
                        emotionContainer.style.display = "none";
                        emotionContainer.classList.remove("fade-out");

                        reCheckinContainer.style.display = "flex";
                        reCheckinContainer.classList.add("fade-in");

                    }, 400);

                } else {
                    alert("Failed to log mood. Please try again.");
                }
            })
            .catch(err => console.error(err));
        });
    }
});

