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
const analysisSummaryGrid = document.getElementById("analysisSummaryGrid");
const analysisBulletList = document.getElementById("analysisBulletList");
const analysisText = document.getElementById("analysisText");
const kpiGrid = document.getElementById("kpiGrid");
const rankingList = document.getElementById("rankingList");
const metricsTable = document.getElementById("metricsTable");
const useCaseGrid = document.getElementById("useCaseGrid");
const queryHighlights = document.getElementById("queryHighlights");
const queryCards = document.getElementById("queryCards");
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

function formatPercent(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${formatNumber(value)}%`;
}

function formatRisingLabel(query) {
  if (!query) {
    return "-";
  }

  return query.is_breakout ? "Breakout" : formatPercent(query.increase_percent);
}

function formatPriority(priority) {
  if (priority === "high") {
    return "High Priority";
  }

  if (priority === "medium") {
    return "Medium Priority";
  }

  return "Observe";
}

function stripMarkdown(value) {
  return String(value)
    .replaceAll("###", "")
    .replaceAll("##", "")
    .replaceAll("#", "")
    .replaceAll("**", "")
    .replaceAll("*", "")
    .replaceAll("•", "")
    .replaceAll("—", "-");
}

function splitReadableLines(value) {
  return stripMarkdown(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^-+\s*/, ""));
}

function buildAnalysisSummary(data, useCases, queryHighlightsData) {
  const strongestMean = [...data.terms].sort((a, b) => b.mean - a.mean)[0];
  const strongestGrowth = [...data.terms]
    .filter((term) => term.growth_percent !== null)
    .sort((a, b) => b.growth_percent - a.growth_percent)[0];
  const topUseCase = useCases[0];
  const topMomentum = queryHighlightsData.most_breakouts_term;

  const cards = [
    {
      label: "Groesstes Basissignal",
      value: strongestMean?.name ?? "-",
      meta: strongestMean ? `Mean ${formatNumber(strongestMean.mean)}` : "-",
    },
    {
      label: "Wachstumsgewinner",
      value: strongestGrowth?.name ?? "-",
      meta: strongestGrowth ? `${formatPercent(strongestGrowth.growth_percent)} Wachstum` : "-",
    },
    {
      label: "Wichtigste Massnahme",
      value: topUseCase?.title ?? "-",
      meta: topUseCase ? topUseCase.recommended_term : "-",
    },
    {
      label: "Neue Nachfrage",
      value: topMomentum?.name ?? "-",
      meta: topMomentum ? `${formatNumber(topMomentum.breakout_count)} Breakouts` : "-",
    },
  ];

  analysisSummaryGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="analysis-summary-card">
          <p class="kpi-label">${escapeHtml(card.label)}</p>
          <p class="analysis-summary-value">${escapeHtml(card.value)}</p>
          <p class="kpi-meta">${escapeHtml(card.meta)}</p>
        </article>
      `,
    )
    .join("");
}

function buildAnalysisBullets(data, useCases, queryHighlightsData) {
  const strongestMean = [...data.terms].sort((a, b) => b.mean - a.mean)[0];
  const strongestGrowth = [...data.terms]
    .filter((term) => term.growth_percent !== null)
    .sort((a, b) => b.growth_percent - a.growth_percent)[0];
  const overlapLeader = queryHighlightsData.highest_overlap_term;
  const topUseCase = useCases[0];

  const bullets = [
    strongestMean
      ? `${strongestMean.name} hat aktuell die staerkste stabile Basisnachfrage.`
      : null,
    strongestGrowth
      ? `${strongestGrowth.name} ist der klarste kurzfristige Wachstumshebel.`
      : null,
    overlapLeader
      ? `${overlapLeader.name} verbindet bestehende Nachfrage und neue Suchdynamik am saubersten.`
      : null,
    topUseCase
      ? `${topUseCase.title} ist aktuell die wichtigste Management-Prioritaet.`
      : null,
  ].filter(Boolean);

  analysisBulletList.innerHTML = bullets
    .slice(0, 4)
    .map(
      (bullet) => `
        <div class="analysis-bullet">
          <span class="analysis-bullet-dot"></span>
          <span>${escapeHtml(bullet)}</span>
        </div>
      `,
    )
    .join("");
}

function buildAnalysisBrief(data, useCases) {
  const strongestMean = [...data.terms].sort((a, b) => b.mean - a.mean)[0];
  const strongestGrowth = [...data.terms]
    .filter((term) => term.growth_percent !== null)
    .sort((a, b) => b.growth_percent - a.growth_percent)[0];
  const topUseCase = useCases[0];

  const parts = [
    strongestMean ? `${strongestMean.name} liefert derzeit die staerkste Sichtbarkeit.` : null,
    strongestGrowth ? `${strongestGrowth.name} ist der beste Wachstumshebel.` : null,
    topUseCase ? `Unternehmerisch sollte zuerst ${topUseCase.title.toLowerCase()} priorisiert werden.` : null,
  ].filter(Boolean);

  analysisText.textContent = parts.join(" ");
}

function getUseCaseLabel(useCaseId) {
  if (useCaseId === "content_education") {
    return "Content";
  }

  if (useCaseId === "product_portfolio") {
    return "Produkt";
  }

  return "Vertrieb";
}

function getUseCaseHeadline(useCase) {
  if (useCase.id === "content_education") {
    return `${useCase.recommended_term} als Content-Thema priorisieren`;
  }

  if (useCase.id === "product_portfolio") {
    return `${useCase.recommended_term} fuer Produktplanung nutzen`;
  }

  return `${useCase.recommended_term} fuer Channel-Steuerung nutzen`;
}

function getQueryMeaning(insight) {
  const summary = insight.summary;

  if (summary.breakout_count >= 8) {
    return "Viele neue Nischensignale: gut fuer Tests, Kampagnen und Trend-Monitoring.";
  }

  if (summary.shared_query_count >= 15) {
    return "Hohe Ueberschneidung: Thema ist bereits relevant und gewinnt gleichzeitig an Fahrt.";
  }

  if ((summary.rising_average_increase_percent ?? 0) >= 120) {
    return "Starkes Momentum: Suchinteresse verschiebt sich gerade sichtbar in neue Themen.";
  }

  return "Solide Nachfrage: sinnvoll fuer kontinuierliche Beobachtung und Content-Optimierung.";
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

function buildUseCases(useCases) {
  if (!useCases || useCases.length === 0) {
    useCaseGrid.innerHTML = `
      <article class="panel empty-panel">
        <p class="empty-title">Noch keine Business Use Cases verfuegbar</p>
        <p class="empty-copy">Sobald die Query-Analyse geladen ist, erscheinen hier konkrete Unternehmenshebel.</p>
      </article>
    `;
    return;
  }

  useCaseGrid.innerHTML = useCases
    .map((useCase) => {
      const topEvidence = useCase.top_evidence;
      const risingEvidence = useCase.rising_evidence;
      const actions = (useCase.actions ?? []).slice(0, 1);
      const supportingQueries = (useCase.supporting_queries ?? []).slice(0, 3);

      return `
        <article class="panel use-case-card">
          <div class="panel-head">
            <h2>${escapeHtml(getUseCaseHeadline(useCase))}</h2>
            <span class="chip priority-chip ${escapeHtml(useCase.priority)}">${escapeHtml(formatPriority(useCase.priority))}</span>
          </div>

          <p class="use-case-kicker">${escapeHtml(getUseCaseLabel(useCase.id))}</p>
          <p class="use-case-goal">${escapeHtml(useCase.goal)}</p>

          <div class="use-case-focus">
            <span class="kpi-label">Warum jetzt?</span>
            <strong>${escapeHtml(useCase.recommended_term)}</strong>
            <span class="kpi-meta">${formatNumber(useCase.breakout_match_count)} Breakout-Signale · Score ${formatNumber(useCase.score)}</span>
          </div>

          <p class="use-case-why">${escapeHtml(useCase.why_now)}</p>

          <div class="use-case-evidence-grid">
            <div class="query-stat">
              <span>Aktuelles Hauptsignal</span>
              <strong>${escapeHtml(topEvidence ? topEvidence.query : "-")}</strong>
              <small>${topEvidence ? `Interesse ${formatNumber(topEvidence.search_interest)}` : "-"}</small>
            </div>
            <div class="query-stat">
              <span>Neues Wachstumssignal</span>
              <strong>${escapeHtml(risingEvidence ? risingEvidence.query : "-")}</strong>
              <small>${escapeHtml(formatRisingLabel(risingEvidence))}</small>
            </div>
          </div>

          <div class="query-tag-group">
            <p class="kpi-label">Wichtige Suchthemen</p>
            <div class="query-tags">${renderTagList(supportingQueries, "Keine passenden Queries")}</div>
          </div>

          <div class="query-tag-group">
            <p class="kpi-label">Naechster Schritt</p>
            <div class="use-case-actions">
              ${actions
                .map((action) => `<p class="use-case-action">${escapeHtml(action)}</p>`)
                .join("")}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderTagList(values, fallback = "Keine Auffaelligkeit") {
  if (!values || values.length === 0) {
    return `<span class="query-tag muted">${escapeHtml(fallback)}</span>`;
  }

  return values
    .map((value) => `<span class="query-tag">${escapeHtml(value)}</span>`)
    .join("");
}

function buildQueryHighlights(highlights) {
  const cards = [];

  if (highlights.strongest_rising_query) {
    cards.push({
      label: "Schnellstes neues Thema",
      value: highlights.strongest_rising_query.query,
      meta: `${highlights.strongest_rising_query.term} · ${formatRisingLabel(highlights.strongest_rising_query)}`,
    });
  }

  if (highlights.most_breakouts_term) {
    cards.push({
      label: "Meiste neue Nischen",
      value: highlights.most_breakouts_term.name,
      meta: `${highlights.most_breakouts_term.breakout_count} Breakouts`,
    });
  }

  if (highlights.highest_overlap_term) {
    cards.push({
      label: "Beste Kombination aus Basis + Wachstum",
      value: highlights.highest_overlap_term.name,
      meta: `${highlights.highest_overlap_term.shared_query_count} gemeinsame Queries`,
    });
  }

  if (highlights.highest_momentum_term) {
    cards.push({
      label: "Hoechste Dynamik",
      value: highlights.highest_momentum_term.name,
      meta: `${highlights.highest_momentum_term.high_momentum_count} starke Rising Queries`,
    });
  }

  if (cards.length === 0) {
    queryHighlights.innerHTML = `
      <article class="panel empty-panel">
        <p class="empty-title">Keine Query-Highlights verfuegbar</p>
        <p class="empty-copy">Die Highlight-Karten erscheinen, sobald Top- und Rising-Queries geladen wurden.</p>
      </article>
    `;
    return;
  }

  queryHighlights.innerHTML = cards
    .map(
      (card) => `
        <article class="panel query-highlight-card">
          <p class="kpi-label">${escapeHtml(card.label)}</p>
          <p class="kpi-value query-highlight-value">${escapeHtml(card.value)}</p>
          <p class="kpi-meta">${escapeHtml(card.meta)}</p>
        </article>
      `,
    )
    .join("");
}

function buildQueryCards(queryInsights) {
  if (!queryInsights || queryInsights.length === 0) {
    queryCards.innerHTML = `
      <article class="panel empty-panel">
        <p class="empty-title">Keine Supplement-Signale verfuegbar</p>
        <p class="empty-copy">Die Detailkarten werden gefuellt, sobald die Query-Analyse Daten liefert.</p>
      </article>
    `;
    return;
  }

  queryCards.innerHTML = queryInsights
    .map((insight) => {
      const summary = insight.summary;
      const topQuery = summary.top_query;
      const risingQuery = summary.rising_query;
      const breakoutQueries = (summary.breakout_queries ?? []).slice(0, 3);
      const sharedQueries = (summary.shared_queries ?? []).slice(0, 3);
      const meaning = getQueryMeaning(insight);

      return `
        <article class="panel query-card">
          <div class="panel-head">
            <h2>${escapeHtml(insight.name)}</h2>
            <span class="chip">${summary.breakout_count} Breakouts</span>
          </div>

          <p class="query-meaning">${escapeHtml(meaning)}</p>

          <div class="query-card-metrics">
            <div>
              <p class="kpi-label">Was wird am meisten gesucht?</p>
              <p class="query-main-value">${escapeHtml(topQuery ? topQuery.query : "-")}</p>
              <p class="kpi-meta">${topQuery ? `Interesse ${formatNumber(topQuery.search_interest)}` : "-"}</p>
            </div>
            <div>
              <p class="kpi-label">Was gewinnt gerade an Fahrt?</p>
              <p class="query-main-value">${escapeHtml(risingQuery ? risingQuery.query : "-")}</p>
              <p class="kpi-meta">${escapeHtml(formatRisingLabel(risingQuery))}</p>
            </div>
          </div>

          <div class="query-stats-grid">
            <div class="query-stat">
              <span>Starke Basisnachfrage</span>
              <strong>${formatNumber(summary.top_average_interest)}</strong>
            </div>
            <div class="query-stat">
              <span>Neue Dynamik</span>
              <strong>${formatPercent(summary.rising_average_increase_percent)}</strong>
            </div>
            <div class="query-stat">
              <span>Basis + Wachstum</span>
              <strong>${formatNumber(summary.shared_query_count)}</strong>
            </div>
            <div class="query-stat">
              <span>Neue Chancenthemen</span>
              <strong>${formatNumber(summary.high_momentum_count)}</strong>
            </div>
          </div>

          <div class="query-tag-group">
            <p class="kpi-label">Neue Breakout-Themen</p>
            <div class="query-tags">${renderTagList(breakoutQueries, "Keine Breakouts")}</div>
          </div>

          <div class="query-tag-group">
            <p class="kpi-label">Bereits sichtbar und weiter steigend</p>
            <div class="query-tags">${renderTagList(sharedQueries, "Keine Ueberschneidung")}</div>
          </div>
        </article>
      `;
    })
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
  analysisSummaryGrid.innerHTML = "";
  analysisBulletList.innerHTML = "";

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
    const businessUseCases = analysisPayload.data.business_use_cases ?? [];
    const queryInsights = analysisPayload.data.query_insights ?? [];
    const queryHighlightsData = analysisPayload.data.query_highlights ?? {};

    buildKpis(terms);
    buildRanking(terms);
    buildTable(terms);
    buildAnalysisSummary(analysisPayload.data, businessUseCases, queryHighlightsData);
    buildAnalysisBullets(analysisPayload.data, businessUseCases, queryHighlightsData);
    buildAnalysisBrief(analysisPayload.data, businessUseCases);
    buildUseCases(businessUseCases);
    buildQueryHighlights(queryHighlightsData);
    buildQueryCards(queryInsights);
    buildLegend(timeseriesPayload.series);
    buildLineChart(timeseriesPayload.series);
    buildBarChart(terms);

    analysisSource.textContent = `Quelle: ${analysisPayload.analysis_source}${analysisPayload.model ? ` · ${analysisPayload.model}` : ""}`;
    setStatus("System bereit", "ready");
  } catch (error) {
    analysisSource.textContent = "Quelle: Fehler";
    analysisText.textContent =
      "Das Dashboard konnte die Daten nicht laden. Bitte pruefe, ob Data Service und AI Service laufen.";
    analysisSummaryGrid.innerHTML = "";
    analysisBulletList.innerHTML = "";
    setStatus("Fehler beim Laden", "error");
    lineLegend.innerHTML = "";
    lineChart.innerHTML = "";
    barChart.innerHTML = "";
    rankingList.innerHTML = "";
    kpiGrid.innerHTML = "";
    metricsTable.innerHTML = "";
    useCaseGrid.innerHTML = "";
    queryHighlights.innerHTML = "";
    queryCards.innerHTML = "";
    console.error(error);
  }
}

refreshButton.addEventListener("click", loadDashboard);
loadDashboard();
