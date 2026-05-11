const palette = ["#D95D39", "#F4A261", "#14705F", "#2A9D8F", "#6C8A3B"];

function getApiBaseUrl() {
  const { protocol, hostname, port } = window.location;

  if (hostname === "dashboard.localhost") {
    return `${protocol}//ai.localhost`;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:${port === "8080" ? "8001" : "8001"}`;
  }

  return `${protocol}//${hostname}:8001`;
}

const API_BASE_URL = getApiBaseUrl();

const refreshButton = document.getElementById("refreshButton");
const statusBadge = document.getElementById("statusBadge");
const analysisSource = document.getElementById("analysisSource");
const analysisText = document.getElementById("analysisText");
const kpiGrid = document.getElementById("kpiGrid");
const rankingList = document.getElementById("rankingList");
const metricsTable = document.getElementById("metricsTable");
const lineLegend = document.getElementById("lineLegend");
const lineChart = document.getElementById("lineChart");
const barChart = document.getElementById("barChart");

function setStatus(label, state) {
  statusBadge.textContent = label;
  statusBadge.className = `status-badge ${state}`;
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildKpis(terms) {
  const strongestMean = [...terms].sort((a, b) => b.mean - a.mean)[0];
  const strongestPeak = [...terms].sort((a, b) => b.peak - a.peak)[0];
  const strongestGrowth = [...terms]
    .filter((term) => term.growth_percent !== null)
    .sort((a, b) => b.growth_percent - a.growth_percent)[0];
  const decliningCount = terms.filter((term) => term.trend === "decreasing").length;

  const cards = [
    {
      label: "Staerkstes Interesse",
      value: strongestMean.name,
      meta: `Mean ${formatNumber(strongestMean.mean)}`,
    },
    {
      label: "Hoechster Peak",
      value: strongestPeak.peak,
      meta: strongestPeak.name,
    },
    {
      label: "Wachstumsleader",
      value: `${formatNumber(strongestGrowth.growth_percent)} %`,
      meta: strongestGrowth.name,
    },
    {
      label: "Fallende Begriffe",
      value: decliningCount,
      meta: `${terms.length - decliningCount} nicht fallend`,
    },
  ];

  kpiGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="kpi-card">
          <p class="kpi-label">${escapeHtml(card.label)}</p>
          <p class="kpi-value">${escapeHtml(card.value)}</p>
          <p class="kpi-meta">${escapeHtml(card.meta)}</p>
        </article>
      `,
    )
    .join("");
}

function buildRanking(terms) {
  const values = terms
    .map((term) => Math.abs(term.growth_percent ?? 0))
    .filter((value) => value > 0);
  const maxValue = Math.max(...values, 1);

  rankingList.innerHTML = [...terms]
    .sort((a, b) => (b.growth_percent ?? -999) - (a.growth_percent ?? -999))
    .map((term) => {
      const value = term.growth_percent ?? 0;
      const width = (Math.abs(value) / maxValue) * 100;
      return `
        <div class="ranking-row">
          <div>
            <div class="ranking-label">${escapeHtml(term.name)}</div>
            <div class="ranking-track">
              <div class="ranking-fill ${value < 0 ? "negative" : ""}" style="width:${width}%"></div>
            </div>
          </div>
          <strong>${formatNumber(value)}%</strong>
        </div>
      `;
    })
    .join("");
}

function buildTable(terms) {
  metricsTable.innerHTML = terms
    .map(
      (term) => `
        <tr>
          <td><strong>${escapeHtml(term.name)}</strong></td>
          <td>${formatNumber(term.mean)}</td>
          <td>${formatNumber(term.peak)}</td>
          <td><span class="trend-pill ${escapeHtml(term.trend)}">${escapeHtml(term.trend)}</span></td>
          <td>${formatNumber(term.growth_percent)}%</td>
        </tr>
      `,
    )
    .join("");
}

function buildLegend(series) {
  lineLegend.innerHTML = series
    .map(
      (item, index) => `
        <span class="legend-item">
          <span class="legend-swatch" style="background:${palette[index % palette.length]}"></span>
          ${escapeHtml(item.name)}
        </span>
      `,
    )
    .join("");
}

function buildLineChart(series) {
  const width = 860;
  const height = 320;
  const padding = { top: 18, right: 18, bottom: 34, left: 34 };
  const values = series.flatMap((item) => item.points.map((point) => point.value));
  const labels = series[0]?.points.map((point) => point.time) ?? [];
  const maxValue = Math.max(...values, 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const yGrid = [0, 25, 50, 75, 100];

  const gridLines = yGrid
    .map((tick) => {
      const y = padding.top + innerHeight - (tick / maxValue) * innerHeight;
      return `
        <line class="grid-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"></line>
        <text class="axis-label" x="6" y="${y + 4}">${tick}</text>
      `;
    })
    .join("");

  const xLabels = labels
    .filter((_, index) => index === 0 || index === labels.length - 1 || index === Math.floor(labels.length / 2))
    .map((label) => {
      const index = labels.indexOf(label);
      const x = padding.left + (index / Math.max(labels.length - 1, 1)) * innerWidth;
      return `<text class="axis-label" x="${x}" y="${height - 8}" text-anchor="middle">${label.slice(5)}</text>`;
    })
    .join("");

  const lines = series
    .map((item, index) => {
      const points = item.points.map((point, pointIndex) => {
        const x = padding.left + (pointIndex / Math.max(item.points.length - 1, 1)) * innerWidth;
        const y = padding.top + innerHeight - (point.value / maxValue) * innerHeight;
        return { x, y, value: point.value };
      });

      const d = points
        .map((point, pointIndex) => `${pointIndex === 0 ? "M" : "L"} ${point.x} ${point.y}`)
        .join(" ");

      const circles = points
        .filter((_, pointIndex) => pointIndex === 0 || pointIndex === points.length - 1 || pointIndex === Math.floor(points.length / 2))
        .map(
          (point) => `
            <circle class="point" cx="${point.x}" cy="${point.y}" r="4" fill="${palette[index % palette.length]}"></circle>
          `,
        )
        .join("");

      return `
        <path class="line-path" d="${d}" stroke="${palette[index % palette.length]}"></path>
        ${circles}
      `;
    })
    .join("");

  lineChart.innerHTML = `
    <svg class="svg-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Zeitverlauf des Suchinteresses">
      ${gridLines}
      ${lines}
      ${xLabels}
    </svg>
  `;
}

function buildBarChart(terms) {
  barChart.innerHTML = `
    <div class="bar-group">
      ${terms
        .map((term) => `
          <div class="bar-row">
            <div class="bar-head">
              <strong>${escapeHtml(term.name)}</strong>
              <span>Mean ${formatNumber(term.mean)} · Peak ${formatNumber(term.peak)}</span>
            </div>
            <div class="bar-stack">
              <div class="bar-track">
                <div class="bar-fill mean" style="width:${term.mean}%"></div>
              </div>
              <div class="bar-track">
                <div class="bar-fill peak" style="width:${term.peak}%"></div>
              </div>
            </div>
          </div>
        `)
        .join("")}
    </div>
  `;
}

async function loadDashboard() {
  setStatus("Lade Daten...", "loading");
  analysisText.textContent = "Die Analyse wird geladen.";

  try {
    const [analysisResponse, timeseriesResponse, readyResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/analysis`),
      fetch(`${API_BASE_URL}/timeseries`),
      fetch(`${API_BASE_URL}/ready`),
    ]);

    if (!analysisResponse.ok) {
      throw new Error("AI-Service Antwort fehlgeschlagen");
    }

    if (!timeseriesResponse.ok) {
      throw new Error("Zeitreihen konnten nicht geladen werden");
    }

    if (!readyResponse.ok) {
      throw new Error("AI-Service ist nicht bereit");
    }

    const analysisPayload = await analysisResponse.json();
    const timeseriesPayload = await timeseriesResponse.json();
    const terms = analysisPayload.data.terms;

    buildKpis(terms);
    buildRanking(terms);
    buildTable(terms);
    buildLegend(timeseriesPayload.series);
    buildLineChart(timeseriesPayload.series);
    buildBarChart(terms);

    analysisText.textContent = analysisPayload.analysis;
    analysisSource.textContent = `Quelle: ${analysisPayload.analysis_source}${analysisPayload.model ? ` · ${analysisPayload.model}` : ""}`;
    setStatus("System bereit", "ready");
  } catch (error) {
    analysisSource.textContent = "Quelle: Fehler";
    analysisText.textContent =
      "Das Dashboard konnte die Daten nicht laden. Bitte pruefe, ob Data Service und AI Service laufen.";
    setStatus("Fehler beim Laden", "error");
    lineLegend.innerHTML = "";
    lineChart.innerHTML = "";
    barChart.innerHTML = "";
    rankingList.innerHTML = "";
    kpiGrid.innerHTML = "";
    metricsTable.innerHTML = "";
    console.error(error);
  }
}

refreshButton.addEventListener("click", loadDashboard);
loadDashboard();
