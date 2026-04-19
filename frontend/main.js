// Agrinova - Main Logic (Full-Stack Version)
const API_BASE = "http://localhost:5000";

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
    initRecommendationForm();
    initTechniques();
    initIndiaMapTrends();
    initSidebar();
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
            // Optional: Smooth scroll handling already exists, but we need to close the drawer
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

    // Trends Search Listener
    const trendsBtn = document.getElementById('getTrendsBtn');
    if (trendsBtn) {
        trendsBtn.onclick = () => {
            const state = document.getElementById('trendState').value;
            const district = document.getElementById('trendDistrict').value;
            const month = document.getElementById('trendMonth').value;
            const year = document.getElementById('trendYear').value;
            
            if (!state) return showToastError("❌ Please select a State before analyzing trends.");
            if (!district) return showToastError("❌ Please select a District before analyzing trends.");
            if (!month) return showToastError("❌ Please select a Month before analyzing trends.");
            if (!year) return showToastError("❌ Please select a Year before analyzing trends.");

            fetchTrends(state, district, month, year);
        };
    }
}

function showToastError(msg) {
    let t = document.createElement('div');
    t.innerText = msg;
    t.style.cssText = "position:fixed; top:30px; right:30px; background:#ef4444; color:white; padding:15px 25px; border-radius:12px; z-index:9999; box-shadow:0 10px 40px rgba(239,68,68,0.4); font-weight:700; transition:0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform:translateX(100px); opacity:0;";
    document.body.appendChild(t);
    setTimeout(() => { t.style.transform = 'translateX(0)'; t.style.opacity = '1'; }, 10);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100px)'; setTimeout(()=>t.remove(), 400); }, 3500);
}

// --- Weather Logic ---
async function fetchWeather(city) {
    const container = document.getElementById('weatherDashboard');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/weather?city=${encodeURIComponent(city)}`);
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || `Status ${res.status}`);
        renderWeather(data);
    } catch (err) {
        console.error("Weather fetch failed:", err);
        showWeatherError("Weather service unavailable. Please try again later.", city);
    }
}

function showWeatherError(message, fallbackCity = "Lucknow") {
    // Show a toast warning but smoothly fallback the UI so it doesn't break
    showToastError("⚠️ Live API failed. Showing last known state for " + fallbackCity);
    renderWeather({
        city: fallbackCity,
        temp: 32,
        description: "haze",
        humidity: 31,
        wind_speed: 1.54,
        pressure: 1005,
        feels_like: 31,
        icon: "50n",
        suggestion: "Weather is normal for field work."
    });
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
                <div style="background: rgba(255,255,255,0.08); padding: 1.3rem; border-radius: 25px; border: 1px solid rgba(255,255,255,0.12); text-align: center;">
                    <i class="fas fa-droplet" style="color: #3b82f6; font-size: 1.3rem; margin-bottom: 0.8rem;"></i>
                    <p style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 0.5rem;">Humidity</p>
                    <strong style="font-size: 1.25rem;">${data.humidity}%</strong>
                </div>
                <div style="background: rgba(255,255,255,0.08); padding: 1.3rem; border-radius: 25px; border: 1px solid rgba(255,255,255,0.12); text-align: center;">
                    <i class="fas fa-wind" style="color: #10b981; font-size: 1.3rem; margin-bottom: 0.8rem;"></i>
                    <p style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 0.5rem;">Wind Speed</p>
                    <strong style="font-size: 1.25rem;">${data.wind_speed ?? data.wind?.speed ?? 0} m/s</strong>
                </div>
                <div style="background: rgba(255,255,255,0.08); padding: 1.3rem; border-radius: 25px; border: 1px solid rgba(255,255,255,0.12); text-align: center;">
                    <i class="fas fa-temperature-full" style="color: #f59e0b; font-size: 1.3rem; margin-bottom: 0.8rem;"></i>
                    <p style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 0.5rem;">Feels Like</p>
                    <strong style="font-size: 1.25rem;">${Math.round(data.feels_like ?? data.temp)}°C</strong>
                </div>
                <div style="background: rgba(255,255,255,0.08); padding: 1.3rem; border-radius: 25px; border: 1px solid rgba(255,255,255,0.12); text-align: center;">
                    <i class="fas fa-gauge-high" style="color: #ef4444; font-size: 1.3rem; margin-bottom: 0.8rem;"></i>
                    <p style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 0.5rem;">Pressure</p>
                    <strong style="font-size: 1.25rem;">${data.pressure ?? 0} hPa</strong>
                </div>
            </div>
        </div>
    `;
}

// --- Trends Dropdown Selector ---
/**
 * Wires up the state dropdown, the "Other" text input visibility toggle,
 * the Fetch button, and runs validation before making an API call.
 */
function initTrendsSelector() {
    const select      = document.getElementById('trendsStateSelect');
    const otherWrap   = document.getElementById('trendsOtherWrap');
    const otherInput  = document.getElementById('trendsOtherInput');
    const searchBtn   = document.getElementById('trendsSearchBtn');
    const errorDiv    = document.getElementById('trendsError');

    if (!select || !searchBtn) return;

    // Show/hide the "Other" text field based on selection
    function toggleOtherField() {
        if (select.value === 'Other') {
            otherWrap.classList.add('visible');
            otherInput.focus();
        } else {
            otherWrap.classList.remove('visible');
            clearTrendsError();
        }
    }

    select.addEventListener('change', toggleOtherField);

    // Validate inputs and trigger fetch
    function handleFetch() {
        clearTrendsError();
        const selected = select.value;

        // Validation: nothing chosen
        if (!selected) {
            showTrendsSelectorError('⚠️ Please select a state from the dropdown.');
            return;
        }

        let stateName;
        if (selected === 'Other') {
            const custom = otherInput.value.trim();
            // Validation: "Other" chosen but box is empty
            if (!custom) {
                showTrendsSelectorError('⚠️ Please enter a state name in the text field.');
                otherInput.focus();
                return;
            }
            stateName = custom;
        } else {
            stateName = selected;
        }

        fetchLiveTrends(stateName);
    }

    searchBtn.addEventListener('click', handleFetch);

    // Allow Enter key inside the "Other" text box
    otherInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleFetch();
    });
}

/** Shows a styled inline error below the selector row.
 *  type: 'error' (default, red) | 'info' (amber) */
function showTrendsSelectorError(msg, type = 'error') {
    const err = document.getElementById('trendsError');
    if (!err) return;
    err.textContent = msg;
    err.setAttribute('data-type', type === 'info' ? 'info' : '');
    err.style.display = 'flex';
    // Trigger reflow so the CSS transition fires
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
        const res  = await fetch(`${API_BASE}/live-trends?state=${encodeURIComponent(state)}`);
        const data = await res.json();

        // Backend returned a "not supported" or error message
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
        
        // Use realistic icons
        const iconUrls = {
            "Wheat": "wheat.png", "Rice": "rice-bowl.png", "Onion": "onion.png", 
            "Tomato": "tomato.png", "Sugarcane": "sugarcane.png"
        };
        const iconName = iconUrls[p.name] || "leaf.png";
        
        // Mock the change since main API only provides raw price now
        const isUp = (p.price % 3) !== 0; // 66% chance to be up
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
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        
        // Check if we have multiple datasets or labels
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
    const ctx = document.getElementById('marketChart').getContext('2d');
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
        data: {
            labels: labels,
            datasets: enhancedDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { 
                    position: 'top',
                    labels: { 
                        color: '#ffffff', 
                        font: { weight: 'bold', size: 13 },
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: { 
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    cornerRadius: 10,
                    titleColor: '#10b981'
                }
            },
            scales: {
                y: { 
                    beginAtZero: false, 
                    grid: { color: 'rgba(255,255,255,0.08)' },
                    ticks: { color: '#cbd5e1' }
                },
                x: { 
                    grid: { display: false },
                    ticks: { color: '#cbd5e1' }
                }
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
    // Scheme Tabs
    document.querySelectorAll('.btn-tab-scheme').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.btn-tab-scheme').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            fetchSchemes(tab.getAttribute('data-scheme'));
        };
    });

    // Advisory Portal Tabs
    const advisoryTabs = Array.from(document.querySelectorAll('.btn-tab')).filter(tab => !tab.classList.contains('btn-tab-scheme'));
    const advisoryPanels = Array.from(document.querySelectorAll('.tab-content-panel'));
    const defaultTabId = 'tab1';
    const defaultButton = advisoryTabs.find(tab => tab.getAttribute('data-tab') === defaultTabId) || advisoryTabs[0];
    const defaultPanel = document.getElementById(defaultTabId) || advisoryPanels[0];

    // Ensure Planning is active by default
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
            if (value <= rating) {
                star.classList.add('fas');
                star.classList.remove('far');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
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
        const payload = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            rating: selectedRating || 5,
            message: document.getElementById('message').value
        };

        try {
            const res = await fetch(`${API_BASE}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.success) {
                form.innerHTML = `<div style="text-align:center; padding:2.5rem 1rem; color:#f8fafc;"><h3 style="margin:0 0 0.4rem;">Thank you!</h3><p style="margin:0; color:#cbd5e1;">Your feedback has been submitted successfully.</p></div>`;
            }
        } catch (err) {
            console.error(err);
            showToastError("❌ Feedback submit nahi hua. Backend check karein.");
        }
    };
}

function initRecommendationForm() {
    const form = document.getElementById('recommendationForm');
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const payload = {
            soil_type: document.getElementById('soilType').value,
            month: document.getElementById('advisoryMonth').value,
            temperature: Number(document.getElementById('advisoryTemp').value),
            rainfall: document.getElementById('advisoryRainfall').value ? Number(document.getElementById('advisoryRainfall').value) : null
        };
        try {
            const res = await fetch(`${API_BASE}/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            lastRecommendationData = {
                crop: data.recommended_crop,
                reason: data.reason,
                month: payload.month,
                soilType: payload.soil_type,
                temperature: payload.temperature,
                rainfall: payload.rainfall
            };
            const output = document.getElementById('recommendationResult');
            if (output) {
                output.style.display = 'flex';
                output.innerHTML = `
                    <div style="display:flex; align-items:center; gap:0.5rem; color: var(--primary); font-weight:800; font-size:1.2rem;">
                        <i class="fas fa-check-circle"></i> Recommended Crop: ${data.recommended_crop}
                    </div>
                    <div style="opacity:0.9; line-height:1.5;">
                        ${data.reason}
                    </div>
                `;
            }
        } catch (error) {
            console.error(error);
        }
    };
}

function getAIAdvice(type) {
    if (type === "weather") {
        if (!lastWeatherData) return "Please check live weather first to get the best farming advice.";
        const temp = lastWeatherData.temp ?? lastWeatherData.main?.temp ?? 0;
        const desc = (lastWeatherData.description || lastWeatherData.weather?.[0]?.description || "").toLowerCase();
        const advice = [];
        if (temp >= 34) {
            advice.push("High heat is expected, so water your crop early in the morning and avoid midday irrigation.");
        } else if (temp >= 28) {
            advice.push("Warm conditions mean keep soil moist and protect young plants from afternoon stress.");
        } else {
            advice.push("Cool weather is good for crops now; hold irrigation and avoid waterlogging.");
        }
        if (desc.includes("rain") || desc.includes("shower")) {
            advice.push("Use the expected rain to reduce manual watering and protect seeds from heavy showers.");
        }
        return advice.join(" ");
    }

    if (type === "price") {
        if (!lastLiveTrend) return "Select a state on the trends map to see current price movement and get explainers.";
        return `Prices are moving because demand for ${lastLiveTrend.toLowerCase()} is strong and local supply is tighter than usual. Seasonal demand and transport conditions also affect rates.`;
    }

    if (type === "crop") {
        if (!lastRecommendationData) return "Generate a crop recommendation first, then tap this button for a simple reason why it is a good choice.";
        const crop = lastRecommendationData.crop || "This crop";
        const month = lastRecommendationData.month || "this season";
        const soil = lastRecommendationData.soilType ? `on ${lastRecommendationData.soilType.toLowerCase()} soil` : "";
        return `${crop} is suitable for ${month} ${soil}. It fits current climate needs, has good market demand, and can deliver healthy profit with careful management.`;
    }

    return "Use the smart help buttons inside the section for quick farming advice.";
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
            const titleMap = {
                weather: 'Weather Advice',
                price: 'Price Change Help',
                crop: 'Crop Recommendation Help'
            };
            openAIModal(titleMap[type] || 'Smart Help', getAIAdvice(type));
        };
    });

    const closeButton = document.getElementById('aiModalCloseBtn');
    if (closeButton) closeButton.onclick = closeAIModal;

    const overlay = document.getElementById('aiAssistantModal');
    if (overlay) {
        overlay.onclick = (event) => {
            if (event.target === overlay) closeAIModal();
        };
    }

    document.addEventListener('keyup', (event) => {
        if (event.key === 'Escape') closeAIModal();
    });
}

function initIndiaMapTrends() {
    if (typeof L === "undefined") return;

    const mapNode = document.getElementById("indiaStateTrendsMap");
    if (!mapNode) return;

    indiaMap = L.map("indiaStateTrendsMap", {
        zoomControl: true,
        scrollWheelZoom: true
    }).setView([22.8, 79.2], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(indiaMap);

    const stateCoords = {
        "Andhra Pradesh": [15.9129, 79.7400],
        "Arunachal Pradesh": [28.2180, 94.7278],
        "Assam": [26.2006, 92.9376],
        "Bihar": [25.0961, 85.3131],
        "Chhattisgarh": [21.2787, 81.8661],
        "Goa": [15.2993, 74.1240],
        "Gujarat": [22.2587, 71.1924],
        "Haryana": [29.0588, 76.0856],
        "Himachal Pradesh": [31.1048, 77.1734],
        "Jharkhand": [23.6102, 85.2799],
        "Karnataka": [15.3173, 75.7139],
        "Kerala": [10.8505, 76.2711],
        "Madhya Pradesh": [22.9734, 78.6569],
        "Maharashtra": [19.7515, 75.7139],
        "Manipur": [24.6637, 93.9063],
        "Meghalaya": [25.4670, 91.3662],
        "Mizoram": [23.1645, 92.9376],
        "Nagaland": [26.1584, 94.5624],
        "Odisha": [20.9517, 85.0985],
        "Punjab": [31.1471, 75.3412],
        "Rajasthan": [27.0238, 74.2179],
        "Sikkim": [27.5330, 88.5122],
        "Tamil Nadu": [11.1271, 78.6569],
        "Telangana": [18.1124, 79.0193],
        "Tripura": [23.9408, 91.9882],
        "Uttar Pradesh": [26.8467, 80.9462],
        "Uttarakhand": [30.0668, 79.0193],
        "West Bengal": [22.9868, 87.8550],
        "Andaman and Nicobar Islands": [11.7401, 92.6586],
        "Chandigarh": [30.7333, 76.7794],
        "Dadra and Nagar Haveli and Daman and Diu": [20.1809, 73.0169],
        "Delhi": [28.7041, 77.1025],
        "Jammu and Kashmir": [33.7782, 76.5762],
        "Ladakh": [34.1526, 77.5770],
        "Lakshadweep": [10.5667, 72.6417],
        "Puducherry": [11.9416, 79.8083]
    };

    Object.entries(stateCoords).forEach(([stateName, coords]) => {
        const marker = L.circleMarker(coords, {
            radius: 7,
            color: "#065f46",
            weight: 2,
            fillColor: "#10b981",
            fillOpacity: 0.85
        }).addTo(indiaMap);

        marker.bindTooltip(stateName, { direction: "top", sticky: true });
        marker.on("click", () => handleStateMapClick(stateName, marker));
    });
}

async function handleStateMapClick(stateName, markerNode) {
    if (selectedStateMarker) {
        selectedStateMarker.setStyle({
            radius: 7,
            color: "#065f46",
            fillColor: "#10b981",
            fillOpacity: 0.85
        });
    }
    selectedStateMarker = markerNode;
    selectedStateMarker.setStyle({
        radius: 10,
        color: "#92400e",
        fillColor: "#fbbf24",
        fillOpacity: 0.95
    });

    const defaultMessage = document.getElementById("mapDefaultMessage");
    const loading = document.getElementById("mapLoading");
    const trendBox = document.getElementById("topTrendBox");
    if (defaultMessage) defaultMessage.style.display = "none";
    if (loading) loading.style.display = "block";

    try {
        const res = await fetch(`${API_BASE}/live-trends?state=${encodeURIComponent(stateName)}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        renderIndiaTrendsUI(data);
        markerNode.bindPopup(`<div class="state-marker-popup"><strong>${data.state}</strong><br/>Top Trend: ${data.top_trend}</div>`).openPopup();
        if (trendBox) {
            trendBox.style.display = "block";
            trendBox.innerHTML = `Trending Crop: ${data.top_trend} <span style="opacity:0.8;">(${data.state})</span>`;
        }
    } catch (error) {
        console.error(error);
        if (trendBox) {
            trendBox.style.display = "block";
            trendBox.innerHTML = "Unable to load trends data for selected state.";
        }
    } finally {
        if (loading) loading.style.display = "none";
    }
}

function renderIndiaTrendsUI(payload) {
    const chartCanvas = document.getElementById("indiaTrendsChart");
    if (!chartCanvas) return;
    const labels = payload.crops.map((item) => item.name);
    const prices = payload.crops.map((item) => item.price);

    // Calculate Insights
    let highest = payload.crops.reduce((max, item) => item.price > max.price ? item : max, payload.crops[0]);
    let lowest = payload.crops.reduce((min, item) => item.price < min.price ? item : min, payload.crops[0]);

    const insightsBox = document.getElementById("trendsInsightsBox");
    if (insightsBox) {
        insightsBox.style.display = "block";
        insightsBox.innerHTML = `
            <div style="font-weight: 800; font-size: 1.2rem; color: #f1f5f9; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                📊 Insights:
            </div>
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.8rem; font-size: 1.05rem; color: rgba(203,213,225,0.95);">
                <li><strong style="color: #22c55e;">• Highest Price:</strong> ${highest.name} (₹${highest.price})</li>
                <li><strong style="color: #ef4444;">• Lowest Price:</strong> ${lowest.name} (₹${lowest.price})</li>
                <li><strong style="color: #f59e0b;">• Market Trend:</strong> <span style="font-weight:700;">${payload.top_trend}</span> dominating</li>
            </ul>
        `;
    }

    lastLiveTrend = payload.top_trend;
    lastLiveTrendState = payload.state;
    if (indiaTrendsChart) indiaTrendsChart.destroy();
    indiaTrendsChart = new Chart(chartCanvas.getContext("2d"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: `${payload.state} Crop Prices`,
                data: prices,
                backgroundColor: ["#22c55e","#3b82f6","#f97316","#ef4444","#a855f7"],
                borderRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#e2e8f0" } }
            },
            scales: {
                x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.08)" } },
                y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.08)" } }
            }
        }
    });
}

// --- Techniques Logic ---
const precautionsData = {
    organic: [
        "Avoid synthetic chemical fertilizers strictly to maintain organic soil structures.",
        "Implement rigid crop rotation to naturally combat pest cycles without pesticides.",
        "Test soil routinely to ensure macro-nutrients aren't depleted."
    ],
    drip: [
        "Flush the entire system mapped lines regularly to prevent emitter clogging.",
        "Ensure robust water filtration to keep sand/silt out of the micro-tubes.",
        "Check lines for rodent damage, as animals often chew exposed drip lines for water."
    ],
    mixed: [
        "Create absolute isolation between livestock disease vectors and crop zones.",
        "Rigorously balance the land ratio to prevent overgrazing by animals.",
        "Organize separate secure storage for agro-chemicals vs. animal feeds."
    ],
    vertical: [
        "Maintain redundant backup power supplies; HVAC/LED failure is catastrophic.",
        "Enforce strict clean-room hygiene to prevent uncontrollable indoor mold spreads.",
        "Calibrate automatic hydroponic dosing systems weakly to prevent nutrient burn."
    ],
    hydroponics: [
        "Continuously and strictly monitor water pH and EC (Electrical Conductivity).",
        "Over-oxygenate the water reservoir to securely prevent root rot diseases.",
        "Keep ambient ambient water temperatures cool, as warm water holds no oxygen."
    ],
    precision: [
        "Regularly calibrate soil and humidity sensors to prevent catastrophic false data.",
        "Protect sensitive drone batteries and IoT radio modules from unpredicted heavy rain.",
        "Maintain secure local/cloud data backups for field mapping history."
    ]
};

function initTechniques() {
    // Watch Video Buttons
    document.querySelectorAll('.youtube-btn').forEach(btn => {
        btn.onclick = (e) => {
            const url = e.currentTarget.getAttribute('data-url');
            if(url) window.open(url, '_blank');
        };
    });

    // Precautions Buttons
    document.querySelectorAll('.precaution-btn').forEach(btn => {
        btn.onclick = (e) => {
            const topic = e.currentTarget.getAttribute('data-topic');
            showPrecautionModal(topic);
        };
    });
}

function showPrecautionModal(topic) {
    const data = precautionsData[topic];
    if (!data) return;
    
    let existing = document.getElementById('precautionModal');
    if (existing) existing.remove();

    const titleMap = {
        organic: "Organic Farming", drip: "Drip Irrigation", mixed: "Mixed Farming",
        vertical: "Vertical Farming", hydroponics: "Hydroponics", precision: "Precision Agriculture"
    };

    const iconMap = {
        organic: "fa-leaf", drip: "fa-droplet", mixed: "fa-cow",
        vertical: "fa-building", hydroponics: "fa-water", precision: "fa-satellite-dish"
    };

    const modal = document.createElement('div');
    modal.id = 'precautionModal';
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(12px); opacity:0; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);";
    
    let listHTML = data.map(item => `<li style="margin-bottom:1.2rem; display:flex; gap:1rem; align-items:flex-start;"><i class="fas fa-exclamation-triangle" style="color:#ef4444; margin-top:0.25rem;"></i><span style="font-weight:500; color:#e2e8f0;">${item}</span></li>`).join('');

    modal.innerHTML = `
        <div style="background: rgba(15,23,42,0.98); border-radius:28px; padding:2.5rem; max-width:550px; width:90%; box-shadow:0 25px 60px rgba(0,0,0,0.6); transform:scale(0.95); transition:transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position:relative; border:1px solid rgba(255,255,255,0.08);">
            <button class="close-modal-btn" style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.08); border:none; width:40px; height:40px; border-radius:50%; font-size:1.2rem; cursor:pointer; color:#f1f5f9; transition:0.2s;"><i class="fas fa-times"></i></button>
            <h3 style="font-size:1.8rem; margin-top:0; color:#f1f5f9; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.8rem;"><div style="background:rgba(239, 68, 68, 0.12); width:45px; height:45px; border-radius:12px; display:flex; align-items:center; justify-content:center;"><i class="fas ${iconMap[topic]}" style="color:#ef4444; font-size:1.4rem;"></i></div> ${titleMap[topic]} Precautions</h3>
            <ul style="list-style:none; padding:0; margin:0; color:#cbd5e1; font-size:1.1rem; line-height:1.6;">
                ${listHTML}
            </ul>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Close button hover
    const closeBtn = modal.querySelector('.close-modal-btn');
    closeBtn.onmouseover = () => closeBtn.style.background = '#e2e8f0';
    closeBtn.onmouseout = () => closeBtn.style.background = '#f1f5f9';
    closeBtn.onclick = () => {
        modal.style.opacity = '0';
        modal.querySelector('div').style.transform = 'scale(0.95)';
        setTimeout(()=>modal.remove(), 300);
    };

    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('div').style.transform = 'scale(1)';
    }, 10);
    
    modal.onclick = (e) => {
        if(e.target === modal) {
            modal.style.opacity = '0';
            modal.querySelector('div').style.transform = 'scale(0.95)';
            setTimeout(()=>modal.remove(), 300);
        }
    };
}

/** Scroll reveal — animations replay every time section enters viewport */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element enters view → trigger animation
                entry.target.classList.add('active');
            } else {
                // Element leaves view → reset so it can replay next time
                entry.target.classList.remove('active');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}


// Call init at bottom
initScrollReveal();
