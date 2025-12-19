document.addEventListener("DOMContentLoaded", () => {
    loadDashboardStats(); // 1. Load Top Cards
    initCharts();         // 2. Load Charts
    initTable();          // 3. Load User Table
});

// ==========================================
// 1. DASHBOARD STATISTICS (Top Cards)
// ==========================================
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const data = await response.json();
        
        // Update DOM elements with database values
        // We use '0' as a fallback if data is null/undefined
        document.getElementById('total-users-count').innerText = data.total_users || 0;
        document.getElementById('avg-mood-score').innerText = data.avg_mood || "N/A";
        document.getElementById('daily-checkins').innerText = data.daily_checkins || 0;
        
        // Update Engagement Text & Color
        const engagementEl = document.getElementById('engagement-status');
        if (engagementEl) {
            engagementEl.innerText = data.engagement || "Low";
            // Optional: Change color based on text
            if (data.engagement === 'High') engagementEl.style.color = '#2ecc71'; // Green
            else if (data.engagement === 'Medium') engagementEl.style.color = '#f1c40f'; // Yellow
            else engagementEl.style.color = '#e74c3c'; // Red
        }
        
    } catch (error) {
        console.error("Error loading stats:", error);
        // Fallback for UI if error
        document.getElementById('total-users-count').innerText = "-";
        document.getElementById('avg-mood-score').innerText = "-";
    }
}

// ==========================================
// 2. CHARTS LOGIC
// ==========================================
let moodChart, activityChart, engagementChart;

async function initCharts() {
    try {
        // Fetch data from your existing Chart APIs
        const [moodRes, weeklyRes, engageRes] = await Promise.all([
            fetch('/api/chart/mood_distribution').then(r => r.json()),
            fetch('/api/chart/weekly_activity').then(r => r.json()),
            fetch('/api/chart/engagement_trends').then(r => r.json())
        ]);

        // Theme Configuration
        const isDark = document.body.classList.contains("dark-mode");
        const textColor = isDark ? '#e4e6eb' : '#333';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

        // ------------------
        // A. MOOD PIE CHART
        // ------------------
        const ctxMood = document.getElementById('moodPieChart').getContext('2d');
        if (moodChart) moodChart.destroy();
        
        moodChart = new Chart(ctxMood, {
            type: 'doughnut', 
            data: {
                labels: moodRes.labels,
                datasets: [{
                    data: moodRes.data,
                    backgroundColor: ['#2ecc71', '#aadd22', '#f1c40f', '#e67e22', '#e74c3c'], // Green to Red
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%', 
                plugins: {
                    legend: { position: 'right', labels: { color: textColor, font: { size: 11 }, boxWidth: 10 } }
                }
            }
        });

        // ------------------
        // B. ACTIVITY BAR CHART
        // ------------------
        const ctxAct = document.getElementById('userActivityBarChart').getContext('2d');
        if (activityChart) activityChart.destroy();

        activityChart = new Chart(ctxAct, {
            type: 'bar',
            data: {
                labels: weeklyRes.labels,
                datasets: [{
                    label: 'Active Users',
                    data: weeklyRes.data,
                    backgroundColor: '#465ED7',
                    borderRadius: 4,
                    barThickness: 25
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: gridColor }, ticks: { color: textColor } },
                    x: { grid: { display: false }, ticks: { color: textColor } }
                },
                plugins: { legend: { display: false } }
            }
        });

        // ------------------
        // C. ENGAGEMENT LINE CHART
        // ------------------
        const ctxEng = document.getElementById('engagementLineChart').getContext('2d');
        if (engagementChart) engagementChart.destroy();

        engagementChart = new Chart(ctxEng, {
            type: 'line',
            data: {
                labels: engageRes.labels,
                datasets: [{
                    label: 'Score',
                    data: engageRes.data,
                    borderColor: '#f1c40f', // Orange/Yellow
                    backgroundColor: 'rgba(241, 196, 15, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: gridColor }, ticks: { color: textColor } },
                    x: { grid: { display: false }, ticks: { color: textColor } }
                },
                plugins: { legend: { display: false } }
            }
        });

    } catch (err) {
        console.error("Chart initialization error:", err);
    }
}

// ==========================================
// 3. TABLE LOGIC (Search, Sort, Pagination)
// ==========================================
let allUsers = [];
let currentPage = 1;
const rowsPerPage = 5;

async function initTable() {
    try {
        const res = await fetch('/api/users_demographics');
        allUsers = await res.json();
        renderTable();
    } catch (err) {
        console.error("Table data load failed", err);
        document.querySelector('#userTable tbody').innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Failed to load data</td></tr>`;
    }
}

function renderTable() {
    const tbody = document.querySelector('#userTable tbody');
    tbody.innerHTML = '';

    // 1. Get Filters
    const searchQuery = document.getElementById('tableSearch').value.toLowerCase();
    const moodFilter = document.getElementById('filterEmotionalState').value;

    // 2. Filter Data
    let filteredData = allUsers.filter(user => {
        // Search by name or email
        const nameMatch = user.name.toLowerCase().includes(searchQuery);
        const emailMatch = user.email.toLowerCase().includes(searchQuery);
        
        // Filter by mood (handle "all" case)
        const moodMatch = moodFilter === 'all' || (user.emotional_state && user.emotional_state === moodFilter);
        
        return (nameMatch || emailMatch) && moodMatch;
    });

    // 3. Pagination Logic
    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    
    // Ensure current page is valid
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageRows = filteredData.slice(startIndex, endIndex);

    // 4. Render Rows
    if (pageRows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#888;">No users found matching filters.</td></tr>`;
    } else {
        pageRows.forEach(user => {
            const tr = document.createElement('tr');
            
            // Determine emotional state badge color
            let badgeColor = '#888'; // Default grey
            const mood = user.emotional_state || 'Unknown';
            
            // FIX: Updated logic to match Python API values
            if(mood === 'Great' || mood === 'Good') badgeColor = '#2ecc71'; // Green
            else if(mood === 'Neutral') badgeColor = '#f1c40f'; // Yellow
            else if(mood === 'Bad' || mood === 'Awful') badgeColor = '#e74c3c'; // Red

            tr.innerHTML = `
                <td>#${user.id}</td>
                <td><div style="font-weight:600; color:var(--primary-color);">${user.name}</div></td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <span style="color:${badgeColor}; font-weight:600; font-size:0.9rem;">
                        ${mood}
                    </span>
                </td>
                <td><span class="status-active">Active</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 5. Update Pagination Controls
    document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevPage').disabled = (currentPage === 1);
    document.getElementById('nextPage').disabled = (currentPage === totalPages);
}

// Table Event Listeners
document.getElementById('tableSearch').addEventListener('input', () => {
    currentPage = 1; // Reset to first page on search
    renderTable();
});

document.getElementById('filterEmotionalState').addEventListener('change', () => {
    currentPage = 1; // Reset to first page on filter change
    renderTable();
});

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    // We recalculate filtered length to know if next is valid
    const searchQuery = document.getElementById('tableSearch').value.toLowerCase();
    const moodFilter = document.getElementById('filterEmotionalState').value;
    const currentFilteredLength = allUsers.filter(u => 
        (u.name.toLowerCase().includes(searchQuery) || u.email.toLowerCase().includes(searchQuery)) && 
        (moodFilter === 'all' || u.emotional_state === moodFilter)
    ).length;
    
    const totalPages = Math.ceil(currentFilteredLength / rowsPerPage);

    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
});

// ==========================================
// 4. THEME TOGGLE WATCHER
// ==========================================
// If user toggles dark mode, charts need to re-render to pick up new colors
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
            initCharts();
        }
    });
});
observer.observe(document.body, { attributes: true });