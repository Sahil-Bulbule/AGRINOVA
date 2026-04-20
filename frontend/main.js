// 🔗 Backend API Configuration
const RENDER_URL = "https://agrinova-smart-agriculture-web-platform-3d16.onrender.com";
const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "")
    ? "http://localhost:5000"
    : RENDER_URL;

console.log("🚀 AgriNova API Base Connected:", API_BASE);

// --- Global State ---
let marketChart = null;
let indiaTrendsChart = null;
let indiaMap = null;
let selectedStateMarker = null;
let lastWeatherData = null;
let lastRecommendationData = null;
let lastLiveTrend = null;
let lastLiveTrendState = null;

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    fetchWeather("Lucknow");
    fetchLiveTrends("Punjab");       // default state on load
    fetchTrends();
    fetchSchemes("central");
    initTabs();
    initTrendsSelector();       // new dropdown logic
    initAIAssistant();
    initFeedbackForm();
    loadFeedbacksFromFirestore();
    initRecommendationForm();
    initTechniques();
    initIndiaMapTrends();
    initSidebar();
    initDropdownVisibilityFix();
}

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');
    const body = document.body;
    const navLinks = document.querySelectorAll('.sidebar .nav-links a');

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        body.classList.toggle('sidebar-active');
    }

    if (toggle) toggle.onclick = toggleSidebar;
    if (overlay) overlay.onclick = toggleSidebar;

    // Close on link click
    navLinks.forEach(link => {
        link.onclick = (e) => {
            if (window.innerWidth < 1024) toggleSidebar();
        };
    });

    // Close on Esc key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            toggleSidebar();
        }
    });
}

// Weather Search Listener
const weatherBtn = document.getElementById('getWeatherBtn');
if (weatherBtn) {
    weatherBtn.onclick = () => {
        const city = document.getElementById('cityInput').value;
        if (city) fetchWeather(city);
    };
}

// --- Weather Logic ---
async function fetchWeather(city) {
    const container = document.getElementById('weatherDashboard');
    if (!container) return;

    clearWeatherError();

    try {
        const res = await fetch(`${API_BASE}/weather?city=${encodeURIComponent(city)}`);
        const data = await res.json();
        if (!res.ok || data.error) {
            const apiError = data?.error || `Status ${res.status}`;
            const notFound = res.status === 404 || /not found|invalid city|city not found/i.test(apiError);
            if (notFound) {
                const typedCity = city?.trim() || "given location";
                showWeatherError(`State/City "${typedCity}" not found. Please check spelling and try again.`);
                return;
            }
            throw new Error(apiError);
        }
        renderWeather(data);
    } catch (err) {
        console.error("Weather fetch failed:", err);
        showWeatherError("Weather service unavailable right now. Please try again in a moment.");
    }
}

function showWeatherError(message) {
    const container = document.getElementById('weatherDashboard');
    if (!container) return;
    container.innerHTML = `
        <div style="text-align:center; padding:2rem; border-radius:18px; border:1px solid rgba(239,68,68,0.4); background:rgba(239,68,68,0.12); color:#fecaca; font-weight:700;">
            <i class="fas fa-circle-exclamation" style="margin-right:8px;"></i>${message}
        </div>
    `;
}

function clearWeatherError() {
    const container = document.getElementById('weatherDashboard');
    if (!container) return;
    // If a previous API error box is present, remove it before loading new data.
    if (container.textContent?.toLowerCase().includes("not found") || container.textContent?.toLowerCase().includes("unavailable")) {
        container.innerHTML = "";
    }
}

function renderWeather(data) {
    const container = document.getElementById('weatherDashboard');
    if (!container) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    lastWeatherData = data;
    container.innerHTML = `
        <style>
        @keyframes floatAnim {
            0% { transform: translateY(0px); filter: drop-shadow(0 5px 15px rgba(255,255,255,0.1)); }
            50% { transform: translateY(-12px); filter: drop-shadow(0 15px 15px rgba(255,255,255,0.2)); }
            100% { transform: translateY(0px); filter: drop-shadow(0 5px 15px rgba(255,255,255,0.1)); }
        }
        </style>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1.5fr; gap:1.5rem; align-items:center; background: rgba(255,255,255,0.08); border-radius: 40px; padding: 2.5rem; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 30px 60px rgba(0,0,0,0.12); width:100%;">
            <div style="color:white; display:flex; flex-direction:column; justify-content:center;">
                <div><div style="background: var(--primary-light); color: #0f172a; padding: 0.6rem 1.2rem; border-radius: 999px; display: inline-block; font-weight: 700; margin-bottom: 1.5rem;">Live Now</div></div>
                <h2 style="font-size: 3.5rem; font-weight: 900; margin: 0; line-height: 1.1;">${timeStr}</h2>
                <p style="margin: 0.5rem 0 1.5rem; opacity: 0.85; font-size: 1rem;">${dateStr}</p>
                <h3 style="font-size: 1.8rem; color: white; margin: 0;"><i class="fas fa-location-dot" style="margin-right: 0.5rem;"></i>${data.city}</h3>
            </div>
            <div style="text-align:center; color:white;">
                <img src="https://openweathermap.org/img/wn/${data.icon}@4x.png" style="width: 170px; margin-bottom: -1rem; animation: floatAnim 3s ease-in-out infinite;" alt="Weather">
                <h1 style="font-size: 4.5rem; font-weight: 900; margin: 0; line-height: 1;">${Math.round(data.temp)}<span style="font-size: 2rem; color: var(--primary-light);">°C</span></h1>
                <p style="font-size: 1.3rem; text-transform: capitalize; font-weight: 700; margin-top: 0.5rem; opacity: 0.9;">${data.description}</p>
                <p style="font-size: 0.95rem; margin-top: 0.3rem; opacity: 0.85;">${data.suggestion || ""}</p>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%;">
                <style>
                    .w-stat-card {
                        padding: 1.3rem; border-radius: 25px; text-align: center;
                        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
                        cursor: default; position: relative; overflow: hidden;
                    }
                    .w-stat-card::before {
                        content: '';
                        position: absolute; inset: 0;
                        border-radius: 25px;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    }
                    .w-stat-card:hover { transform: translateY(-6px) scale(1.04); }
                    .w-stat-card:hover::before { opacity: 1; }

                    /* Blue — Humidity */
                    .w-stat-blue {
                        background: rgba(59,130,246,0.08);
                        border: 1px solid rgba(59,130,246,0.35);
                        box-shadow: 0 0 18px rgba(59,130,246,0.15);
                    }
                    .w-stat-blue:hover {
                        box-shadow: 0 0 35px rgba(59,130,246,0.55), 0 8px 30px rgba(0,0,0,0.3);
                        border-color: rgba(59,130,246,0.85);
                    }
                    .w-stat-blue::before { background: radial-gradient(circle at 50% 0%, rgba(59,130,246,0.18), transparent 70%); }

                    /* Teal — Wind Speed */
                    .w-stat-teal {
                        background: rgba(16,185,129,0.08);
                        border: 1px solid rgba(16,185,129,0.35);
                        box-shadow: 0 0 18px rgba(16,185,129,0.15);
                    }
                    .w-stat-teal:hover {
                        box-shadow: 0 0 35px rgba(16,185,129,0.55), 0 8px 30px rgba(0,0,0,0.3);
                        border-color: rgba(16,185,129,0.85);
                    }
                    .w-stat-teal::before { background: radial-gradient(circle at 50% 0%, rgba(16,185,129,0.18), transparent 70%); }

                    /* Amber — Feels Like */
                    .w-stat-amber {
                        background: rgba(245,158,11,0.08);
                        border: 1px solid rgba(245,158,11,0.35);
                        box-shadow: 0 0 18px rgba(245,158,11,0.15);
                    }
                    .w-stat-amber:hover {
                        box-shadow: 0 0 35px rgba(245,158,11,0.55), 0 8px 30px rgba(0,0,0,0.3);
                        border-color: rgba(245,158,11,0.85);
                    }
                    .w-stat-amber::before { background: radial-gradient(circle at 50% 0%, rgba(245,158,11,0.18), transparent 70%); }

                    /* Red — Pressure */
                    .w-stat-red {
                        background: rgba(239,68,68,0.08);
                        border: 1px solid rgba(239,68,68,0.35);
                        box-shadow: 0 0 18px rgba(239,68,68,0.15);
                    }
                    .w-stat-red:hover {
                        box-shadow: 0 0 35px rgba(239,68,68,0.55), 0 8px 30px rgba(0,0,0,0.3);
                        border-color: rgba(239,68,68,0.85);
                    }
                    .w-stat-red::before { background: radial-gradient(circle at 50% 0%, rgba(239,68,68,0.18), transparent 70%); }

                    .w-stat-card .stat-icon {
                        font-size: 1.6rem; margin-bottom: 0.8rem; display: block;
                        filter: drop-shadow(0 0 8px currentColor);
                    }
                    .w-stat-card .stat-label {
                        font-size: 0.8rem; opacity: 0.75; margin-bottom: 0.5rem;
                        letter-spacing: 0.06em; text-transform: uppercase; font-weight: 600;
                    }
                    .w-stat-card .stat-value {
                        font-size: 1.35rem; font-weight: 900;
                    }
                </style>

                <div class="w-stat-card w-stat-blue">
                    <i class="fas fa-droplet stat-icon" style="color:#60a5fa;"></i>
                    <p class="stat-label">Humidity</p>
                    <strong class="stat-value" style="color:#93c5fd;">${data.humidity}%</strong>
                </div>
                <div class="w-stat-card w-stat-teal">
                    <i class="fas fa-wind stat-icon" style="color:#34d399;"></i>
                    <p class="stat-label">Wind Speed</p>
                    <strong class="stat-value" style="color:#6ee7b7;">${data.wind_speed ?? data.wind?.speed ?? 0} m/s</strong>
                </div>
                <div class="w-stat-card w-stat-amber">
                    <i class="fas fa-temperature-full stat-icon" style="color:#fbbf24;"></i>
                    <p class="stat-label">Feels Like</p>
                    <strong class="stat-value" style="color:#fcd34d;">${Math.round(data.feels_like ?? data.temp)}°C</strong>
                </div>
                <div class="w-stat-card w-stat-red">
                    <i class="fas fa-gauge-high stat-icon" style="color:#f87171;"></i>
                    <p class="stat-label">Pressure</p>
                    <strong class="stat-value" style="color:#fca5a5;">${data.pressure ?? 0} hPa</strong>
                </div>
            </div>
        </div>
    `;
}

// --- Trends Dropdown Selector ---
function initTrendsSelector() {
    const select = document.getElementById('trendsStateSelect');
    const otherWrap = document.getElementById('trendsOtherWrap');
    const otherInput = document.getElementById('trendsOtherInput');
    const searchBtn = document.getElementById('trendsSearchBtn');
    const errorDiv = document.getElementById('trendsError');

    if (!select || !searchBtn) return;

    function toggleOtherField() {
        if (select.value === 'Other') {
            if (otherWrap) otherWrap.classList.add('visible');
            if (otherInput) otherInput.focus();
        } else {
            if (otherWrap) otherWrap.classList.remove('visible');
            clearTrendsError();
        }
    }

    select.addEventListener('change', toggleOtherField);

    function handleFetch() {
        clearTrendsError();
        const selected = select.value;

        if (!selected) {
            showTrendsSelectorError('⚠️ Please select a state from the dropdown.');
            return;
        }

        let stateName;
        if (selected === 'Other') {
            const custom = otherInput ? otherInput.value.trim() : "";
            if (!custom) {
                showTrendsSelectorError('⚠️ Please enter a state name in the text field.');
                if (otherInput) otherInput.focus();
                return;
            }
            stateName = custom;
        } else {
            stateName = selected;
        }

        fetchLiveTrends(stateName);
    }

    searchBtn.addEventListener('click', handleFetch);

    if (otherInput) {
        otherInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleFetch();
        });
    }
}

function initDropdownVisibilityFix() {
    const selects = Array.from(document.querySelectorAll('select'));
    if (!selects.length) return;

    selects.forEach(select => {
        // Keep browser-native dropdown behavior for reliable mouse handling.
        select.addEventListener('focus', () => {
            select.classList.add('dropdown-expanded');
        });
        select.addEventListener('blur', () => {
            select.classList.remove('dropdown-expanded');
        });
    });
}

function showTrendsSelectorError(msg, type = 'error') {
    const err = document.getElementById('trendsError');
    if (!err) return;
    err.textContent = msg;
    err.setAttribute('data-type', type === 'info' ? 'info' : '');
    err.style.display = 'flex';
    void err.offsetWidth;
    err.classList.add('visible');
}

function clearTrendsError() {
    const err = document.getElementById('trendsError');
    if (!err) return;
    err.classList.remove('visible');
    setTimeout(() => { err.style.display = 'none'; }, 350);
}

// --- Live Trends Logic ---
async function fetchLiveTrends(state) {
    try {
        const res = await fetch(`${API_BASE}/live-trends?state=${encodeURIComponent(state)}`);
        const data = await res.json();
        if (data.success === false) {
            showTrendsSelectorError(`ℹ️ ${data.message}`, 'info');
            showLiveTrendsError();
            return;
        }
        if (!res.ok) throw new Error(`Status ${res.status}`);
        renderLiveTrends(data.crops || [], data.state);
    } catch (err) {
        console.error("Trends fetch failed:", err);
        showLiveTrendsError();
    }
}

function showLiveTrendsError() {
    const grid = document.getElementById('trendsResult');
    if (!grid) return;
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:2rem; color: #f1f5f9; background: rgba(255,255,255,0.12); border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);">Unable to load market data from backend. Please start the server and refresh.</div>`;
}

function renderLiveTrends(crops, stateName = "Selected State") {
    const grid = document.getElementById('trendsResult');
    if (!grid) return;

    grid.innerHTML = '';
    crops.forEach(p => {
        const card = document.createElement('div');
        card.className = 'trends-card';
        card.style.cssText = "display: flex; flex-direction: column; justify-content: space-between; height: 100%;";

        const iconUrls = {
            "Wheat": "wheat.png", "Rice": "rice-bowl.png", "Onion": "onion.png",
            "Tomato": "tomato.png", "Sugarcane": "sugarcane.png"
        };
        const iconName = iconUrls[p.name] || "leaf.png";

        const isUp = (p.price % 3) !== 0;
        const changeValue = Math.floor(p.price * (Math.random() * 0.08 + 0.01));
        const trendClass = isUp ? 'trend-up' : 'trend-down';
        const trendIcon = isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
        const trendText = isUp ? `+₹${changeValue}` : `-₹${changeValue}`;

        card.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <div style="width:75px; height:75px; background: rgba(16,185,129,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.2rem; border: 1px solid rgba(16,185,129,0.1);">
                    <img src="https://img.icons8.com/color/96/${iconName}" style="width:45px; height:45px; object-fit:contain; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1));" alt="${p.name}"/>
                </div>
                <h3 style="margin: 0; font-size: 1.7rem; font-weight: 800; color: #f1f5f9;">${p.name}</h3>
                <div style="margin: 1rem 0 1.5rem;">
                    <span style="font-size: 2.2rem; font-weight: 900; color: #22c55e;">&#x20B9;${p.price}</span>
                    <span style="font-size: 0.95rem; color: rgba(203,213,225,0.9); font-weight: 700; opacity: 0.9;"> /q</span>
                </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; width:100%; margin-top: auto;">
                <div class="trend-badge ${trendClass}" style="margin:0 0 1.5rem; padding: 0.5rem 1.2rem; border-radius:30px; font-weight:800; font-size:1.05rem; display: inline-flex; align-items: center; gap: 0.5rem; justify-content:center; width:max-content; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                    <i class="fas ${trendIcon}"></i> ${trendText}
                </div>
                <div style="padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08); width: 100%; font-size: 0.9rem; color: rgba(203,213,225,0.85); font-weight: 700;">
                    <i class="fas fa-map-marker-alt" style="color:var(--primary); margin-right:4px;"></i> ${stateName}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- Trends Logic (Chart.js) ---
async function fetchTrends(state = "", district = "", month = "", year = "") {
    try {
        let url = `${API_BASE}/trends`;
        const params = new URLSearchParams();
        if (state) params.append('state', state);
        if (district) params.append('district', district);
        if (month) params.append('month', month);
        if (year) params.append('year', year);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        renderChart(data.labels, data.datasets, month);
    } catch (err) {
        console.error("Trends fetch failed:", err);
        showTrendsError();
    }
}

function showTrendsError() {
    const chartContainer = document.getElementById('marketChart');
    if (!chartContainer) return;
    const parent = chartContainer.parentElement;
    if (parent) {
        parent.innerHTML = `<div style="padding:2rem; text-align:center; color: #f1f5f9; background: rgba(255,255,255,0.12); border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);">Unable to load market trends from backend. Please start the server and refresh.</div>`;
    }
}

function renderChart(labels, datasets, selectedMonth = "") {
    const chartNode = document.getElementById('marketChart');
    if (!chartNode) return;
    const ctx = chartNode.getContext('2d');
    if (marketChart) marketChart.destroy();

    const isBar = selectedMonth !== "";
    const iconUrls = {
        "Wheat": "https://img.icons8.com/color/48/wheat.png",
        "Rice": "https://img.icons8.com/color/48/rice-bowl.png",
        "Onion": "https://img.icons8.com/color/48/onion.png",
        "Tomato": "https://img.icons8.com/color/48/tomato.png",
        "Sugarcane": "https://img.icons8.com/color/48/sugarcane.png"
    };

    const enhancedDatasets = datasets.map(ds => {
        let cropName = ds.label.split(' ')[0];
        let pStyle = 'circle';
        if (iconUrls[cropName]) {
            let img = new Image();
            img.src = iconUrls[cropName];
            img.width = 24;
            img.height = 24;
            pStyle = img;
        }
        return {
            ...ds,
            fill: !isBar,
            tension: 0.4,
            backgroundColor: isBar ? ds.borderColor : ds.backgroundColor,
            borderWidth: 2,
            pointStyle: pStyle,
            radius: 4,
            hoverRadius: 6
        };
    });

    marketChart = new Chart(ctx, {
        type: isBar ? 'bar' : 'line',
        data: { labels: labels, datasets: enhancedDatasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#ffffff', font: { weight: 'bold', size: 13 }, usePointStyle: true, padding: 20 }
                },
                tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 10, titleColor: '#10b981' }
            },
            scales: {
                y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#cbd5e1' } },
                x: { grid: { display: false }, ticks: { color: '#cbd5e1' } }
            }
        }
    });
}

// --- Schemes Logic ---
async function fetchSchemes(category) {
    try {
        const res = await fetch(`${API_BASE}/schemes?category=${category}`);
        const data = await res.json();
        renderSchemes(data);
    } catch (err) {
        console.error("Schemes fetch failed:", err);
    }
}

function renderSchemes(data) {
    const grid = document.getElementById('schemesGrid');
    if (!grid) return;
    grid.innerHTML = "";
    data.forEach(s => {
        const card = document.createElement('div');
        card.className = "card";
        card.style.cssText = "padding:2.5rem; display:flex; flex-direction:column; justify-content:space-between; gap:1.5rem; height: 100%;";
        card.innerHTML = `
            <div>
                <div style="width:50px; height:50px; background:var(--primary); border-radius:15px; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem;">
                    <i class="fas fa-leaf" style="color:white; font-size:1.2rem;"></i>
                </div>
                <h3 style="color:var(--primary); font-size:1.3rem; margin-bottom:0.8rem;">${s.name}</h3>
                <p style="color:var(--text-light); line-height:1.6;">${s.desc}</p>
            </div>
            <a href="${s.link}" target="_blank" style="display:inline-block; background:var(--primary); color:white; padding:0.8rem 1.5rem; border-radius:30px; text-decoration:none; font-weight:700; text-align:center; transition:0.3s; margin-top: 1rem;">Apply Now →</a>
        `;
        grid.appendChild(card);
    });
}

// --- Tabs & Event Listeners ---
function initTabs() {
    document.querySelectorAll('.btn-tab-scheme').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.btn-tab-scheme').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            fetchSchemes(tab.getAttribute('data-scheme'));
        };
    });

    const advisoryTabs = Array.from(document.querySelectorAll('.btn-tab')).filter(tab => !tab.classList.contains('btn-tab-scheme'));
    const advisoryPanels = Array.from(document.querySelectorAll('.tab-content-panel'));
    const defaultTabId = 'tab1';
    const defaultButton = advisoryTabs.find(tab => tab.getAttribute('data-tab') === defaultTabId) || advisoryTabs[0];
    const defaultPanel = document.getElementById(defaultTabId) || advisoryPanels[0];

    advisoryTabs.forEach(tab => tab.classList.remove('active'));
    advisoryPanels.forEach(panel => panel.classList.remove('active'));
    if (defaultButton) defaultButton.classList.add('active');
    if (defaultPanel) defaultPanel.classList.add('active');

    advisoryTabs.forEach(tab => {
        tab.onclick = () => {
            advisoryTabs.forEach(t => t.classList.remove('active'));
            advisoryPanels.forEach(panel => panel.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.getAttribute('data-tab');
            const panel = document.getElementById(target);
            if (panel) panel.classList.add('active');
        };
    });
}

// --- Feedback Logic ---
function initFeedbackForm() {
    const form = document.getElementById('feedbackForm');
    if (!form) return;
    const stars = Array.from(document.querySelectorAll('.rating-star'));
    let selectedRating = 0;
    const updateStarDisplay = (rating) => {
        stars.forEach(star => {
            const value = Number(star.getAttribute('data-rating'));
            if (value <= rating) { star.classList.add('fas'); star.classList.remove('far'); }
            else { star.classList.remove('fas'); star.classList.add('far'); }
        });
    };
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = Number(star.getAttribute('data-rating'));
            updateStarDisplay(selectedRating);
        });
    });
    form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending to Cloud...';
        }

        const payload = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            rating: selectedRating || 5,
            message: document.getElementById('message').value,
            submittedAt: new Date().toISOString()
        };

        console.log("📝 Sending to Firestore Collection 'feedbacks':", payload);

        try {
            // Use the global 'db' variable from firebase.js
            if (!db) throw new Error("Firebase Database (db) is not initialized!");

            await db.collection("feedbacks").add(payload);
            
            console.log("✅ SUCCESS: Saved to Firebase!");

            form.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 3rem 2rem;
                    background: linear-gradient(135deg, rgba(76,175,80,0.12), rgba(56,142,60,0.06));
                    border: 1px solid rgba(76,175,80,0.4);
                    border-radius: 24px;
                    box-shadow: 0 0 30px rgba(76,175,80,0.2), 0 20px 50px rgba(0,0,0,0.3);
                    animation: fadeInUp 0.5s ease forwards;
                ">
                    <div style="font-size: 3.5rem; margin-bottom: 1rem;">🎉</div>
                    <h3 style="margin: 0 0 0.6rem; font-size: 1.8rem; font-weight: 900; color: #4ade80;">Thank You!</h3>
                    <p style="margin: 0 0 0.5rem; color: #a7f3d0; font-size: 1.05rem; font-weight: 600;">Your feedback has been submitted successfully.</p>
                    <p style="margin: 0; color: rgba(161,233,161,0.6); font-size: 0.9rem;">It means a lot to us 🌾</p>
                </div>
            `;
            loadFeedbacksFromFirestore();

        } catch (err) {
            console.error("🔥 FIRESTORE ERROR:", err);

            // Show inline error — no alert popup
            const errBox = document.createElement('div');
            errBox.style.cssText = "margin-top:1rem; padding:1rem 1.5rem; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.35); border-radius:14px; color:#fca5a5; font-weight:700; font-size:0.95rem; text-align:center;";
            errBox.textContent = "⚠️ Could not submit feedback. Please try again.";
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-redo"></i> Retry';
                btn.parentElement.insertBefore(errBox, btn);
            }
        }
    };
}

async function loadFeedbacksFromFirestore() {
    const wall = document.getElementById('feedbacksWall');
    if (!wall) return;

    try {
        if (!db) return;
        const querySnapshot = await db.collection("feedbacks")
            .limit(10)
            .get();
        
        if (querySnapshot.empty) {
            wall.innerHTML = `<p style="text-align: center; color: var(--text-light); font-style: italic; opacity: 0.6;">No feedbacks found in Firebase. Be the first! 🚀</p>`;
            return;
        }

        let html = '';
        querySnapshot.forEach((doc) => {
            const f = doc.data();
            const dateStr = f.submittedAt ? new Date(f.submittedAt).toLocaleString() : 'Recently';
            html += `
                <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 20px; border-left: 4px solid #f59e0b; transition: 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <strong style="color: #f59e0b; font-size: 1.1rem;">${f.name}</strong>
                        <div style="color: #fbbf24; font-size: 0.9rem;">
                            ${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}
                        </div>
                    </div>
                    <p style="color: #f1f5f9; margin-bottom: 0.5rem; line-height: 1.5;">"${f.message}"</p>
                    <div style="font-size: 0.8rem; color: var(--text-light); opacity: 0.6; text-align: right;">${dateStr}</div>
                </div>
            `;
        });
        wall.innerHTML = html;

    } catch (err) {
        console.error("🔥 LOAD ERROR:", err);
        wall.innerHTML = `<p style="color: #ef4444; text-align: center;">Firebase Load Error: Check Rules or Console.</p>`;
    }
}
// --- Recommendation Logic (CRITICAL FIX) ---
function initRecommendationForm() {
    const form = document.getElementById('recommendationForm');
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const output = document.getElementById('recommendationResult');

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Advice...';
        }

        const tempEl = document.getElementById('advisoryTemp');
        const soilEl = document.getElementById('soilType');
        const monthEl = document.getElementById('advisoryMonth');
        const rainEl = document.getElementById('advisoryRainfall');

        const payload = {
            soil_type: soilEl ? soilEl.value : "",
            month: monthEl ? monthEl.value : "",
            temperature: tempEl ? Number(tempEl.value) : 0,
            rainfall: (rainEl && rainEl.value) ? Number(rainEl.value) : null
        };

        try {
            console.log("Sending Recommendation Payload:", payload);
            const res = await fetch(`${API_BASE}/recommend`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const data = await res.json();
            console.log("Received Recommendation Data:", data);

            lastRecommendationData = { crop: data.recommended_crop, reason: data.reason, ...payload };

            if (output) {
                output.style.display = 'flex';
                output.innerHTML = `
                    <div style="display:flex; align-items:center; gap:0.5rem; color: var(--primary); font-weight:800; font-size:1.4rem; margin-bottom:0.5rem;">
                        <i class="fas fa-star" style="color:#fbbf24;"></i> Recommended Crop: ${data.recommended_crop}
                    </div>
                    <div style="opacity:0.95; line-height:1.6; font-size:1.1rem; border-left: 4px solid var(--primary); padding-left: 1.2rem;">${data.reason}</div>
                `;
                output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } catch (error) {
            console.error("Recommendation fetch failed:", error);
            showToastError("❌ Connection Error: Backend is likely starting up. Please wait 10 seconds and try again.");
            if (output) {
                output.style.display = 'flex';
                output.innerHTML = `<div style="color:#ef4444; font-weight:700;"><i class="fas fa-exclamation-triangle"></i> Error: Unable to reach server. Please try again soon.</div>`;
            }
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-microchip"></i> Generate Live Recommendation';
            }
        }
    };
}

function getAIAdvice(type) {
    if (type === "weather") {
        if (!lastWeatherData) return "Please check live weather first to get the best farming advice.";
        const temp = lastWeatherData.temp ?? 0;
        const desc = (lastWeatherData.description || "").toLowerCase();
        const advice = [];
        if (temp >= 34) advice.push("High heat is expected, so water your crop early in the morning and avoid midday irrigation.");
        else if (temp >= 28) advice.push("Warm conditions mean keep soil moist and protect young plants from afternoon stress.");
        else advice.push("Cool weather is good for crops now; hold irrigation and avoid waterlogging.");
        if (desc.includes("rain") || desc.includes("shower")) advice.push("Use the expected rain to reduce manual watering and protect seeds from heavy showers.");
        return advice.join(" ");
    }
    if (type === "price") {
        if (!lastLiveTrend) return "Select a state on the trends map to see current price movement.";
        const trend = lastLiveTrend;
        return `Market analysis indicates that ${trend.dominating || trend.crop || 'this crop'} is currently dominating the market in ${trend.state}. Prices for ${trend.dominating} are at a peak of ₹${trend.highest_price}, while others like ${trend.lowest_crop} remain stable. This shift is driven by local supply demands and logistics.`;
    }
    if (type === "crop") {
        if (!lastRecommendationData) return "Generate a crop recommendation first, then tap this button.";
        const crop = lastRecommendationData.crop || "This crop";
        return `${crop} is suitable for the current conditions. It fits current climate needs and can deliver healthy profit.`;
    }
    return "Use the smart help buttons for quick farming advice.";
}

function openAIModal(title, message) {
    const modal = document.getElementById('aiAssistantModal');
    if (!modal) return;
    modal.querySelector('.ai-modal-title').innerText = title;
    modal.querySelector('.ai-modal-body').innerText = message;
    modal.classList.add('open');
}

function closeAIModal() {
    const modal = document.getElementById('aiAssistantModal');
    if (!modal) return;
    modal.classList.remove('open');
}

function initAIAssistant() {
    document.querySelectorAll('.ai-help-btn').forEach(btn => {
        btn.onclick = () => {
            const type = btn.getAttribute('data-ai-type');
            const titleMap = { weather: 'Weather Advice', price: 'Price Change Help', crop: 'Crop Recommendation Help' };
            openAIModal(titleMap[type] || 'Smart Help', getAIAdvice(type));
        };
    });
    const closeBtn = document.getElementById('aiModalCloseBtn');
    if (closeBtn) closeBtn.onclick = closeAIModal;
    const overlay = document.getElementById('aiAssistantModal');
    if (overlay) overlay.onclick = (e) => { if (e.target === overlay) closeAIModal(); };
    document.addEventListener('keyup', (e) => { if (e.key === 'Escape') closeAIModal(); });
}

function initIndiaMapTrends() {
    if (typeof L === "undefined") return;
    const mapNode = document.getElementById("indiaStateTrendsMap");
    if (!mapNode) return;
    indiaMap = L.map("indiaStateTrendsMap").setView([22.8, 79.2], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap" }).addTo(indiaMap);
    const stateCoords = {
        "Andhra Pradesh": [15.9129, 79.7400], "Arunachal Pradesh": [28.2180, 94.7278], "Assam": [26.2006, 92.9376], "Bihar": [25.0961, 85.3131],
        "Chhattisgarh": [21.2787, 81.8661], "Goa": [15.2993, 74.1240], "Gujarat": [22.2587, 71.1924], "Haryana": [29.0588, 76.0856],
        "Himachal Pradesh": [31.1048, 77.1734], "Jharkhand": [23.6102, 85.2799], "Karnataka": [15.3173, 75.7139], "Kerala": [10.8505, 76.2711],
        "Madhya Pradesh": [22.9734, 78.6569], "Maharashtra": [19.7515, 75.7139], "Manipur": [24.6637, 93.9063], "Meghalaya": [25.4670, 91.3662],
        "Mizoram": [23.1645, 92.9376], "Nagaland": [26.1584, 94.5624], "Odisha": [20.9517, 85.0985], "Punjab": [31.1471, 75.3412],
        "Rajasthan": [27.0238, 74.2179], "Sikkim": [27.5330, 88.5122], "Tamil Nadu": [11.1271, 78.6569], "Telangana": [18.1124, 79.0193],
        "Tripura": [23.9408, 91.9882], "Uttar Pradesh": [26.8467, 80.9462], "Uttarakhand": [30.0668, 79.0193], "West Bengal": [22.9868, 87.8550]
    };
    Object.entries(stateCoords).forEach(([name, coords]) => {
        const marker = L.circleMarker(coords, { radius: 7, color: "#065f46", fillColor: "#10b981", fillOpacity: 0.85 }).addTo(indiaMap);
        marker.bindTooltip(name, { direction: "top", sticky: true });
        marker.on("click", () => handleStateMapClick(name, marker));
    });
}

async function handleStateMapClick(stateName, markerNode) {
    if (selectedStateMarker) selectedStateMarker.setStyle({ radius: 7, color: "#065f46", fillColor: "#10b981", fillOpacity: 0.85 });
    selectedStateMarker = markerNode;
    selectedStateMarker.setStyle({ radius: 10, color: "#92400e", fillColor: "#fbbf24", fillOpacity: 0.95 });
    const defaultMsg = document.getElementById("mapDefaultMessage");
    const loading = document.getElementById("mapLoading");
    const trendBox = document.getElementById("topTrendBox");
    if (defaultMsg) defaultMsg.style.display = "none";
    if (loading) loading.style.display = "block";
    try {
        const res = await fetch(`${API_BASE}/live-trends?state=${encodeURIComponent(stateName)}`);
        const data = await res.json();
        renderIndiaTrendsUI(data);
        markerNode.bindPopup(`<strong>${data.state}</strong><br/>Top Trend: ${data.top_trend}`).openPopup();
        if (trendBox) { trendBox.style.display = "block"; trendBox.innerHTML = `Trending Crop: ${data.top_trend}`; }
    } catch (error) { console.error(error); }
    finally { if (loading) loading.style.display = "none"; }
}

function renderIndiaTrendsUI(payload) {
    const chartCanvas = document.getElementById("indiaTrendsChart");
    if (!chartCanvas) return;
    const labels = payload.crops.map(i => i.name);
    const prices = payload.crops.map(i => i.price);
    let high = payload.crops.reduce((max, i) => i.price > max.price ? i : max, payload.crops[0]);
    let low = payload.crops.reduce((min, i) => i.price < min.price ? i : min, payload.crops[0]);
    const insights = document.getElementById("trendsInsightsBox");
    if (insights) {
        insights.style.display = "block";
        insights.innerHTML = `
            <div style="font-weight:800; color:var(--primary); margin-bottom:0.5rem;"><i class="fas fa-chart-line"></i> Dominating Crop Analysis:</div>
            <div style="display:flex; justify-content:space-between; opacity:0.9;">
                <span>📈 Highest (Dominating): <strong>${high.name}</strong></span>
                <span style="color:var(--primary);">₹${high.price}</span>
            </div>
            <div style="display:flex; justify-content:space-between; opacity:0.9; margin-top:0.3rem;">
                <span>📉 Lowest: <strong>${low.name}</strong></span>
                <span style="color:#ef4444;">₹${low.price}</span>
            </div>
        `;
    }
    lastLiveTrend = { dominating: high.name, highest_price: high.price, lowest_crop: low.name, state: payload.state };
    if (indiaTrendsChart) indiaTrendsChart.destroy();
    indiaTrendsChart = new Chart(chartCanvas.getContext("2d"), {
        type: "bar", data: { labels, datasets: [{ label: `${payload.state} Prices`, data: prices, backgroundColor: ["#22c55e", "#3b82f6", "#f97316", "#ef4444", "#a855f7"] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function initTechniques() {
    document.querySelectorAll('.youtube-btn').forEach(btn => btn.onclick = (e) => window.open(e.currentTarget.getAttribute('data-url'), '_blank'));
    document.querySelectorAll('.precaution-btn').forEach(btn => btn.onclick = (e) => showPrecautionModal(e.currentTarget.getAttribute('data-topic')));
}

function showPrecautionModal(topic) {
    const data = {
        'organic': {
            title: 'Organic Farming Precautions',
            content: '1. Seed Quality: Always use non-GMO and certified organic seeds. 2. Buffer Zones: Maintain a distance from neighbor farms using chemicals to avoid drift. 3. Documentation: Keep strict logs of manure sources and pest control methods for certification. 4. Natural Pests: Monitor fields daily; organic solutions work best if applied early.'
        },
        'drip': {
            title: 'Drip Irrigation Precautions',
            content: '1. Filtration: Use high-quality filters to prevent emitter clogging from sand or algae. 2. Pressure Check: Maintain uniform pressure across the field for equal water distribution. 3. Flushing: Flush your main and sub-main lines every 15 days to remove silt. 4. Root Zone: Ensure the drippers are close to the roots but not buried too deep.'
        },
        'mixed': {
            title: 'Mixed Farming Precautions',
            content: '1. Species Compatibility: Ensure used crops and livestock do not transmit diseases to each other. 2. Nutrient Management: Balance the manure output of animals with the intake capacity of the soil. 3. Space Allocation: Prevent animals from overgrazing or compacting the crop soil. 4. Labor Demand: Mixed farming is effort-intensive; ensure you have enough manpower for both units.'
        },
        'vertical': {
            title: 'Vertical Farming Precautions',
            content: '1. Lighting: Monitor LED spectrum and intensity regularly; excess heat can burn leaves. 2. Humidity: Air circulation is critical in vertical stacks to prevent fungal growth. 3. Structural Integrity: Ensure the racks can handle the weight of wet soil and fully grown plants. 4. System failure: Have a battery backup for the pumps to avoid crop loss during power cuts.'
        },
        'hydroponics': {
            title: 'Hydroponics Precautions',
            content: '1. pH & EC Levels: Check these twice daily. Small changes can kill the entire crop in hours. 2. Water Temp: Keep water between 18-22°C; warm water depletes oxygen and causes root rot. 3. Sanitation: Sterilize the system between cycles to kill stubborn pathogens. 4. Algae Control: Keep the reservoir and pipes opaque to prevent light from growing algae.'
        },
        'precision': {
            title: 'Precision Agriculture Precautions',
            content: '1. Sensor Calibration: Calibrate soil sensors every season for accurate data. 2. Data Connectivity: Ensure your field has stable network coverage for real-time IoT alerts. 3. Software Updates: Keep your management app updated to avoid security bugs. 4. Skill Building: Training is key; data is only useful if interpreted correctly by the farmer.'
        }
    };

    const info = data[topic] || { title: 'Precautions', content: 'General farming safety: Wear protective gear and monitor crop health regularly.' };

    // Reuse the AI Modal structure for consistency and premium look
    const modal = document.getElementById('aiAssistantModal');
    if (!modal) {
        showToastError("⚠️ Modal element not found! Please check HTML.");
        return;
    }

    modal.querySelector('.ai-modal-title').innerText = info.title;
    modal.querySelector('.ai-modal-body').innerHTML = `
        <div style="font-size:1.1rem; line-height:1.7; color: rgba(226, 232, 240, 0.95);">
            ${info.content.split('. ').map(item => `<div style="margin-bottom:0.8rem; border-left:3px solid var(--primary); padding-left:1rem;">${item}</div>`).join('')}
        </div>
    `;
    modal.classList.add('open');
}

function showToastError(msg) {
    let t = document.createElement('div');
    t.innerText = msg;
    t.style.cssText = "position:fixed; top:30px; right:30px; background:#ef4444; color:white; padding:15px 25px; border-radius:12px; z-index:9999; opacity:0; transition:0.4s;";
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 3500);
}


/** Scroll reveal logic */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('active'); }
            else { entry.target.classList.remove('active'); }
        });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));
}

initScrollReveal();
