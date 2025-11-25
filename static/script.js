// Data storage
let latencyData = [];
let testRunning = false;
let testIntervalId = null;
let currentUrl = "";
let charts = {
    latency: null,
    distribution: null,
    status: null,
};

// Preset URLs
const presetUrls = [
    { name: "Google", url: "https://www.google.com" },
    { name: "Cloudflare", url: "https://www.cloudflare.com" },
    { name: "GitHub", url: "https://www.github.com" },
    { name: "Amazon", url: "https://www.amazon.com" },
    { name: "Microsoft", url: "https://www.microsoft.com" },
];

// Initialize
document.addEventListener("DOMContentLoaded", function () {
    renderPresetUrls();
    initCharts();
    setupChart();
});

// Render preset URLs
function renderPresetUrls() {
    const urlList = document.getElementById("urlList");
    urlList.innerHTML = presetUrls
        .map(
        (preset) => ` 
            <div class="url-item">
            <div>
                <strong>${preset.name}</strong><br>
                <small style="color: #666;">${preset.url}</small>
            </div>
            <button class="btn-secondary" onclick="setUrl('${preset.url}')" style="padding: 6px 12px; width: auto;">Use</button>
            </div>
        `
        )
        .join("");
}

// Set URL from preset
function setUrl(url) {
    document.getElementById("urlInput").value = url;
    showMessage(`URL set to ${url}`, "info");
}

// Add custom URL
function addToPresets() {
    const url = document.getElementById("urlInput").value;
    if (!url.trim()) {
        showMessage("Please enter a URL", "error");
        return;
    }
    if (!presetUrls.some((p) => p.url === url)) {
        let name = url;
        try { name = new URL(url).hostname.toUpperCase(); } catch(e){}
        presetUrls.unshift({ name, url });
        if (presetUrls.length > 8) presetUrls.pop();
        renderPresetUrls();
        showMessage("URL added to presets", "success");
    } else {
        showMessage("URL already in presets", "info");
    }
}

// Show message
function showMessage(text, type) {
    const container = document.getElementById("messageContainer");
    const msg = document.createElement("div");
    msg.className = `message ${type}`;
    msg.textContent = text;
    container.innerHTML = "";
    container.appendChild(msg);
    setTimeout(() => msg.remove(), 5000);
}

// Start latency test
async function startLatencyTest() {
    const url = document.getElementById("urlInput").value.trim();
    if (!url) {
        alert("Enter a valid URL");
        return;
    }

    if (testRunning) return; // Prevent multiple intervals
    
    // Disable start button, enable stop
    document.querySelector(".btn-primary").disabled = true;

    testRunning = true;
    showMessage("Test started...", "info");

    testIntervalId = setInterval(async () => {
        try {
        const res = await fetch(
            `/latency?url=${encodeURIComponent(url)}`
        );
        const data = await res.json();

        const latency = data.latency ?? 0;
        recordLatency(
            url,
            latency,
            data.status === "success" ? 200 : 0,
            data.status
        );
        } catch (err) {
        recordLatency(url, null, 0, "error");
        }
    }, parseInt(document.getElementById("interval").value));
}

// Record latency
function recordLatency(url, latency, statusCode, status) {
    const now = new Date();
    const entry = {
        time: now.toLocaleTimeString(),
        timestamp: now.getTime(),
        url: url,
        latency: latency,
        statusCode: statusCode,
        status: status,
    };

    latencyData.push(entry);
    updateHistoryTable(entry);
    updateStats();
    updateCharts();
}

// Update history table
function updateHistoryTable(entry) {
    const tbody = document.getElementById("historyBody");
    // Remove "No test data" row if it exists
    if (tbody.rows.length === 1 && tbody.rows[0].cells.length === 1) {
        tbody.innerHTML = "";
    }

    const tr = document.createElement("tr");
    const indicator =
        entry.status === "success"
        ? entry.latency < 200
            ? "good"
            : entry.latency < 500
            ? "fair"
            : "poor"
        : "poor";

    tr.innerHTML = `
        <td>${entry.time}</td>
        <td><small>${entry.url}</small></td>
        <td>${entry.latency ? entry.latency.toFixed(2) : "N/A"}</td>
        <td>${entry.statusCode || "N/A"}</td>
        <td>
        <span class="status ${entry.status}">
            <span class="latency-indicator ${indicator}"></span>
            ${entry.status.toUpperCase()}
        </span>
        </td>
        <td>${entry.latency ? entry.latency.toFixed(2) + " ms" : "Timeout"}</td>
    `;
    tbody.insertBefore(tr, tbody.firstChild);

    while (tbody.children.length > 50) {
        tbody.removeChild(tbody.lastChild);
    }
}

// Update statistics
function updateStats() {
    const successful = latencyData.filter(
        (d) => d.status === "success" && d.latency !== null
    );
    if (successful.length === 0) return;

    const latencies = successful.map((d) => d.latency);
    const minLatency = Math.min(...latencies);
    const maxLatency = Math.max(...latencies);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const successRate = ((successful.length / latencyData.length) * 100).toFixed(1);

    document.getElementById("minLatency").textContent = minLatency.toFixed(2);
    document.getElementById("maxLatency").textContent = maxLatency.toFixed(2);
    document.getElementById("avgLatency").textContent = avgLatency.toFixed(2);
    document.getElementById("successRate").textContent = successRate;

    updatePerformanceSummary(minLatency, maxLatency, avgLatency, successRate);
}

// Update performance summary
function updatePerformanceSummary(min, max, avg, successRate) {
    const summary = document.getElementById("performanceSummary");
    let performance =
        avg < 100 ? "🟢 Excellent" : avg < 300 ? "🟡 Good" : "🔴 Poor";

    summary.innerHTML = `
        <div style="line-height: 1.8;">
        <strong>Performance Rating:</strong> ${performance}<br>
        <strong>Average Latency:</strong> ${avg.toFixed(2)} ms<br>
        <strong>Latency Range:</strong> ${min.toFixed(2)} - ${max.toFixed(2)} ms<br>
        <strong>Successful Requests:</strong> ${successRate}%
        </div>
    `;
}

// Stop latency test
function stopLatencyTest() {
    testRunning = false;
    if (testIntervalId) {
        clearInterval(testIntervalId);
        testIntervalId = null;
    }
    document.querySelector(".btn-primary").disabled = false;
    if (latencyData.length > 0) {
        showMessage("Test completed", "success");
    }
}

// Clear history
function clearHistory() {
    if (confirm("Are you sure you want to clear all test data?")) {
        latencyData = [];
        document.getElementById("historyBody").innerHTML =
        '<tr><td colspan="6" style="text-align: center; color: #999;">No test data yet</td></tr>';
        document.getElementById("minLatency").textContent = "—";
        document.getElementById("maxLatency").textContent = "—";
        document.getElementById("avgLatency").textContent = "—";
        document.getElementById("successRate").textContent = "—";
        document.getElementById("performanceSummary").innerHTML =
        '<p style="color: #999; text-align: center;">No data yet. Start a test to see results.</p>';
        
        // Reset charts
        if (charts.latency) {
            charts.latency.data.labels = [];
            charts.latency.data.datasets[0].data = [];
            charts.latency.update();
        }
        if (charts.distribution) {
            charts.distribution.data.datasets[0].data = [0,0,0,0];
            charts.distribution.update();
        }
        if (charts.status) {
            charts.status.data.datasets[0].data = [0,0];
            charts.status.update();
        }
        
        showMessage("History cleared", "success");
    }
}

// Export data as CSV
function exportData() {
    if (latencyData.length === 0) {
        showMessage("No data to export", "error");
        return;
    }

    let csv = "Time,URL,Latency (ms),Status Code,Status,Response Time\n";
    latencyData.forEach((entry) => {
        csv += `"${entry.time}","${entry.url}",${entry.latency || "N/A"},${
        entry.statusCode || "N/A"
        },"${entry.status}","${
        entry.latency ? entry.latency.toFixed(2) + " ms" : "Timeout"
        }"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `latency-data-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    showMessage("Data exported successfully", "success");
}

// Initialize charts
function initCharts() {
    try {
        const c1 = document.getElementById("latencyChart");
        const c2 = document.getElementById("distributionChart");
        const c3 = document.getElementById("statusChart");

        const ctx1 = c1 ? c1.getContext("2d") : null;
        const ctx2 = c2 ? c2.getContext("2d") : null;
        const ctx3 = c3 ? c3.getContext("2d") : null;

        if (ctx1) {
        charts.latency = new Chart(ctx1, {
            type: "line",
            data: { labels: [], datasets: [] },
            options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Latency Over Time" },
            },
            scales: {
                y: {
                beginAtZero: true,
                title: { display: true, text: "Latency (ms)" },
                },
            },
            },
        });
        }

        if (ctx2) {
        charts.distribution = new Chart(ctx2, {
            type: "bar",
            data: { labels: [], datasets: [] },
            options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Latency Distribution" },
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "Frequency" } },
            },
            },
        });
        }

        if (ctx3) {
        charts.status = new Chart(ctx3, {
            type: "doughnut",
            data: { labels: [], datasets: [] },
            options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom" },
                title: { display: true, text: "Success vs Failure" },
            },
            },
        });
        }
    } catch (err) {
        console.error("Error initializing charts:", err);
    }
}

// Update charts
function updateCharts() {
    const successful = latencyData.filter(
        (d) => d.status === "success" && d.latency !== null
    );

    // Latency over time
    if (charts.latency) {
        charts.latency.data.labels = latencyData.map((d, i) => `#${i + 1}`);
        charts.latency.data.datasets = [
        {
            label: "Latency (ms)",
            data: latencyData.map((d) => d.latency || 0),
            borderColor: "#667eea",
            backgroundColor: "rgba(102, 126, 234, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.3,
        },
        ];
        charts.latency.update();
    }

    // Latency distribution
    if (charts.distribution && successful.length > 0) {
        const buckets = {
        "0-100ms": 0,
        "100-200ms": 0,
        "200-500ms": 0,
        "500ms+": 0,
        };

        successful.forEach((d) => {
        if (d.latency < 100) buckets["0-100ms"]++;
        else if (d.latency < 200) buckets["100-200ms"]++;
        else if (d.latency < 500) buckets["200-500ms"]++;
        else buckets["500ms+"]++;
        });

        charts.distribution.data.labels = Object.keys(buckets);
        charts.distribution.data.datasets = [
        {
            label: "Count",
            data: Object.values(buckets),
            backgroundColor: ["#51cf66", "#ffd43b", "#ff922b", "#ff6b6b"],
        },
        ];
        charts.distribution.update();
    }

    // Success rate doughnut chart
    if (charts.status) {
        const successCount = successful.length;
        const failureCount = latencyData.length - successCount;

        charts.status.data.labels = ["Success", "Failed"];
        charts.status.data.datasets = [
        {
            data: [successCount, failureCount],
            backgroundColor: ["#51cf66", "#ff6b6b"],
        },
        ];
        charts.status.update();
    }
}

// Initialize empty chart
function setupChart() {
    updateCharts();
}

// Switch chart tab
function switchChart(chartId, btn) {
    document.querySelectorAll(".tab-content").forEach((el) =>
        el.classList.remove("active")
    );
    document
        .querySelectorAll(".tab-btn")
        .forEach((el) => el.classList.remove("active"));

    const target = document.getElementById(chartId);
    if (target) target.classList.add("active");
    if (btn && btn.classList) btn.classList.add("active");
}