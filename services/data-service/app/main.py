import csv
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware


CSV_FILE_NAME = "interest_over_time.csv"
QUERY_FILE_PREFIXES = {
    "top": "top_queries",
    "rising": "rising_queries",
}
BUSINESS_USE_CASE_DEFINITIONS = [
    {
        "id": "content_education",
        "title": "Content & Education",
        "goal": "Informationsbeduerfnis in SEO-, Ratgeber- und Awareness-Content uebersetzen",
        "keywords": [
            "wirkung",
            "was ist",
            "was bringt",
            "symptome",
            "mangel",
            "einnehmen",
            "lebensmittel",
            "wert",
            "tagesbedarf",
            "bewirkt",
            "welches",
            "wieviel",
            "wie ",
            "für was",
            "fuer was",
        ],
        "actions": [
            "SEO-Landingpages und Ratgeber fuer die dominanten Fragestellungen priorisieren.",
            "FAQ-Module und kurze Educational Ads auf die haeufigsten Wirkungs- und Anwendungsfragen ausrichten.",
            "Content-Kalender mit Fokus auf Suchintention statt nur auf Produktnamen planen.",
        ],
    },
    {
        "id": "product_portfolio",
        "title": "Product & Formulation",
        "goal": "Nachfrage nach Formaten, Wirkstoffformen und Produktkombinationen frueh erkennen",
        "keywords": [
            "monohydrat",
            "glycinate",
            "glycinat",
            "bisglycinat",
            "kapseln",
            "öl",
            "oel",
            "tropfen",
            "tabletten",
            "vegan",
            "k2",
            "d3",
            "komplex",
            "whey",
            "algenöl",
            "algenoel",
            "citrat",
            "malat",
            "prohormon",
            "creapure",
            "400",
        ],
        "actions": [
            "Produktportfolio auf gefragte Wirkstoffformen und Darreichungsformen ausrichten.",
            "Neue SKU-Ideen und Produktbundles anhand der dynamischsten Query-Kombinationen testen.",
            "Produktdetailseiten auf die konkret gesuchten Formulierungen optimieren.",
        ],
    },
    {
        "id": "channel_activation",
        "title": "Channel & Retail Activation",
        "goal": "Haendler-, Marken- und Kaufinteresse fuer Vertrieb, Retail Media und Partnersteuerung nutzen",
        "keywords": [
            "dm",
            "amazon",
            "apotheke",
            "kaufen",
            "testsieger",
            "esn",
            "norsan",
            "sunday",
            "melaviva",
            "verla",
            "rocka",
            "more",
            "getvuel",
            "naduria",
            "hsn",
            "nature heart",
            "vitamoment",
            "doc morris",
            "vaya",
            "natural elements",
            "pure encapsulations",
            "medizinfuchs",
            "diasporal",
            "weider",
            "naturtreu",
        ],
        "actions": [
            "Retail-Media- und Marktplatzbudgets auf die staerksten Channel-Signale konzentrieren.",
            "Partner- und Haendlergespraeche mit den auffaelligsten Suchbelegen untermauern.",
            "Wettbewerber- und Markenpull im Vertrieb frueh monitoren und Gegenmassnahmen planen.",
        ],
    },
]

app = FastAPI(title="Supplements Data Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def find_data_dir():
    if os.environ.get("DATA_DIR"):
        return Path(os.environ["DATA_DIR"])

    app_dir = Path(__file__).resolve().parent
    candidates = [
        Path("/app/data/csv"),
        Path.cwd() / "data" / "csv",
    ]

    if len(app_dir.parents) > 2:
        candidates.append(app_dir.parents[2] / "data" / "csv")

    for candidate in candidates:
        if (candidate / CSV_FILE_NAME).exists():
            return candidate

    return candidates[0]


DATA_DIR = find_data_dir()


def normalize_text(value):
    return " ".join(value.replace("\xa0", " ").strip().split())


def normalize_lower_text(value):
    return normalize_text(value).lower()


def clean_value(value):
    value = value.strip()

    if value == "":
        return None

    if value == "<1":
        return 0

    return int(value)


def parse_percent_value(value):
    cleaned = normalize_text(value)

    if cleaned == "":
        return None, None, False

    if cleaned.lower() == "breakout":
        return None, "Breakout", True

    number_text = (
        cleaned.replace("%", "")
        .replace(".", "")
        .replace(",", ".")
        .replace(" ", "")
    )
    percent = float(number_text)
    return percent, f"{percent:.1f}%", False


def load_rows():
    csv_path = DATA_DIR / CSV_FILE_NAME

    with open(csv_path, newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        return list(reader)


def get_terms():
    rows = load_rows()

    if not rows:
        return []

    return [column for column in rows[0].keys() if column != "Time"]


def validate_term(term):
    if term not in get_terms():
        raise ValueError(f"Unknown term: {term}")

    return term


def slugify_term(term):
    return term.strip().lower().replace(" ", "_")


def get_query_csv_path(kind, term):
    if kind not in QUERY_FILE_PREFIXES:
        raise ValueError(f"Unknown query kind: {kind}")

    file_name = f"{QUERY_FILE_PREFIXES[kind]}_{slugify_term(term)}.csv"
    csv_path = DATA_DIR / file_name

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    return csv_path


def load_query_rows(kind, term):
    csv_path = get_query_csv_path(kind, term)

    with open(csv_path, newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        rows = []

        for row in reader:
            increase_percent, increase_label, is_breakout = parse_percent_value(
                row.get("increase percent", "")
            )
            rows.append(
                {
                    "query": normalize_text(row.get("query", "")),
                    "search_interest": clean_value(row.get("search interest", "")),
                    "increase_percent": increase_percent,
                    "increase_label": increase_label,
                    "is_breakout": is_breakout,
                }
            )

        return rows


def calculate_growth_percent(first, last):
    if first == 0 and last == 0:
        return 0.0

    if first == 0:
        return None

    return round(((last - first) / first) * 100, 1)


def calculate_metrics(term, rows):
    values = []

    for row in rows:
        if term not in row:
            raise ValueError(f"Unknown term: {term}")

        value = clean_value(row[term])

        if value is None:
            continue

        values.append(value)

    if not values:
        raise ValueError(f"No numeric values found for: {term}")

    first = values[0]
    last = values[-1]
    growth_percent = calculate_growth_percent(first, last)

    if last > first:
        trend = "increasing"
    elif last < first:
        trend = "decreasing"
    else:
        trend = "stable"

    return {
        "name": term,
        "mean": round(sum(values) / len(values), 1),
        "peak": max(values),
        "trend": trend,
        "growth_percent": growth_percent,
    }


def build_timeseries(rows):
    terms = get_terms()
    series = []

    for term in terms:
        points = []

        for row in rows:
            value = clean_value(row.get(term, ""))

            if value is None:
                continue

            points.append({"time": row["Time"], "value": value})

        series.append({"name": term, "points": points})

    return {"series": series}


def get_highest_interest_query(rows):
    valid_rows = [row for row in rows if row["search_interest"] is not None]

    if not valid_rows:
        return None

    return max(valid_rows, key=lambda row: row["search_interest"])


def get_strongest_rising_query(rows):
    if not rows:
        return None

    breakout_rows = [row for row in rows if row["is_breakout"]]

    if breakout_rows:
        return max(
            breakout_rows,
            key=lambda row: (row["search_interest"] or 0, row["query"]),
        )

    numeric_rows = [row for row in rows if row["increase_percent"] is not None]

    if not numeric_rows:
        return None

    return max(
        numeric_rows,
        key=lambda row: (row["increase_percent"], row["search_interest"] or 0),
    )


def round_or_none(value):
    if value is None:
        return None

    return round(value, 1)


def summarize_query_rows(top_rows, rising_rows):
    top_interest_values = [
        row["search_interest"] for row in top_rows if row["search_interest"] is not None
    ]
    rising_interest_values = [
        row["search_interest"]
        for row in rising_rows
        if row["search_interest"] is not None
    ]
    top_percent_values = [
        row["increase_percent"]
        for row in top_rows
        if row["increase_percent"] is not None
    ]
    rising_percent_values = [
        row["increase_percent"]
        for row in rising_rows
        if row["increase_percent"] is not None
    ]

    shared_queries = sorted(
        {row["query"] for row in top_rows if row["query"]}
        & {row["query"] for row in rising_rows if row["query"]}
    )
    breakout_queries = [row["query"] for row in rising_rows if row["is_breakout"]]

    return {
        "top_query": get_highest_interest_query(top_rows),
        "rising_query": get_strongest_rising_query(rising_rows),
        "top_average_interest": round_or_none(
            sum(top_interest_values) / len(top_interest_values)
            if top_interest_values
            else None
        ),
        "rising_average_interest": round_or_none(
            sum(rising_interest_values) / len(rising_interest_values)
            if rising_interest_values
            else None
        ),
        "top_average_increase_percent": round_or_none(
            sum(top_percent_values) / len(top_percent_values)
            if top_percent_values
            else None
        ),
        "rising_average_increase_percent": round_or_none(
            sum(rising_percent_values) / len(rising_percent_values)
            if rising_percent_values
            else None
        ),
        "breakout_count": len(breakout_queries),
        "breakout_queries": breakout_queries[:5],
        "shared_query_count": len(shared_queries),
        "shared_queries": shared_queries[:5],
        "high_momentum_count": sum(
            1
            for row in rising_rows
            if row["is_breakout"]
            or (
                row["increase_percent"] is not None
                and row["increase_percent"] >= 100
            )
        ),
        "positive_top_count": sum(
            1
            for row in top_rows
            if row["increase_percent"] is not None and row["increase_percent"] > 0
        ),
        "negative_top_count": sum(
            1
            for row in top_rows
            if row["increase_percent"] is not None and row["increase_percent"] < 0
        ),
    }


def build_query_insight(term):
    top_rows = load_query_rows("top", term)
    rising_rows = load_query_rows("rising", term)
    summary = summarize_query_rows(top_rows, rising_rows)

    return {
        "name": term,
        "summary": summary,
        "top_queries": top_rows,
        "rising_queries": rising_rows,
    }


def build_query_insights(term=None):
    terms = [validate_term(term)] if term else get_terms()
    insights = [build_query_insight(current_term) for current_term in terms]

    return {
        "terms": insights,
        "highlights": build_query_highlights(insights),
    }


def get_term_with_maximum(insights, metric_name):
    if not insights:
        return None

    return max(
        insights,
        key=lambda insight: insight["summary"].get(metric_name, 0),
    )


def build_query_highlights(insights):
    if not insights:
        return {}

    strongest_breakout_term = get_term_with_maximum(insights, "breakout_count")
    highest_overlap_term = get_term_with_maximum(insights, "shared_query_count")
    highest_momentum_term = get_term_with_maximum(insights, "high_momentum_count")

    strongest_rising_candidates = [
        {
            "term": insight["name"],
            **insight["summary"]["rising_query"],
        }
        for insight in insights
        if insight["summary"]["rising_query"] is not None
    ]

    strongest_rising_query = None

    if strongest_rising_candidates:
        breakout_candidates = [
            candidate for candidate in strongest_rising_candidates if candidate["is_breakout"]
        ]

        if breakout_candidates:
            strongest_rising_query = max(
                breakout_candidates,
                key=lambda candidate: (
                    candidate["search_interest"] or 0,
                    candidate["query"],
                ),
            )
        else:
            strongest_rising_query = max(
                strongest_rising_candidates,
                key=lambda candidate: (
                    candidate["increase_percent"] or 0,
                    candidate["search_interest"] or 0,
                ),
            )

    return {
        "most_breakouts_term": {
            "name": strongest_breakout_term["name"],
            "breakout_count": strongest_breakout_term["summary"]["breakout_count"],
        }
        if strongest_breakout_term
        else None,
        "highest_overlap_term": {
            "name": highest_overlap_term["name"],
            "shared_query_count": highest_overlap_term["summary"]["shared_query_count"],
        }
        if highest_overlap_term
        else None,
        "highest_momentum_term": {
            "name": highest_momentum_term["name"],
            "high_momentum_count": highest_momentum_term["summary"]["high_momentum_count"],
        }
        if highest_momentum_term
        else None,
        "strongest_rising_query": strongest_rising_query,
    }


def query_matches_keywords(query, keywords):
    normalized_query = normalize_lower_text(query)
    return any(keyword in normalized_query for keyword in keywords)


def compute_business_signal_score(row, source):
    interest = row["search_interest"] or 0
    positive_increase = max(row["increase_percent"] or 0, 0)

    if source == "top":
        return round(interest + min(positive_increase, 400) * 0.15, 1)

    return round(
        interest * 0.7
        + min(positive_increase, 400) * 0.25
        + (140 if row["is_breakout"] else 0),
        1,
    )


def build_business_signal_matches(rows, keywords, source):
    matches = []

    for row in rows:
        if not row["query"] or not query_matches_keywords(row["query"], keywords):
            continue

        matches.append(
            {
                **row,
                "source": source,
                "match_score": compute_business_signal_score(row, source),
            }
        )

    matches.sort(
        key=lambda row: (
            row["match_score"],
            row["search_interest"] or 0,
            row["query"],
        ),
        reverse=True,
    )
    return matches


def build_use_case_signal(top_rows, rising_rows, keywords):
    top_matches = build_business_signal_matches(top_rows, keywords, "top")
    rising_matches = build_business_signal_matches(rising_rows, keywords, "rising")
    combined_matches = top_matches + rising_matches
    matched_queries = []

    for match in combined_matches:
        if match["query"] not in matched_queries:
            matched_queries.append(match["query"])

    return {
        "score": round(sum(match["match_score"] for match in combined_matches), 1),
        "top_match": top_matches[0] if top_matches else None,
        "rising_match": rising_matches[0] if rising_matches else None,
        "top_match_count": len(top_matches),
        "rising_match_count": len(rising_matches),
        "breakout_match_count": sum(1 for match in rising_matches if match["is_breakout"]),
        "matched_queries": matched_queries[:5],
    }


def determine_use_case_priority(signal, metric):
    if signal["breakout_match_count"] > 0 or signal["score"] >= 500:
        return "high"

    if (
        metric
        and metric["growth_percent"] is not None
        and metric["growth_percent"] > 0
        and signal["score"] >= 250
    ):
        return "high"

    if signal["score"] >= 180:
        return "medium"

    return "observe"


def build_use_case_reason(use_case_id, term_name, signal, metric):
    top_query = signal["top_match"]["query"] if signal["top_match"] else None
    rising_query = signal["rising_match"]["query"] if signal["rising_match"] else None
    rising_label = signal["rising_match"]["increase_label"] if signal["rising_match"] else None
    growth_percent = metric["growth_percent"] if metric else None

    if use_case_id == "content_education":
        growth_text = (
            f"{growth_percent} Prozent Wachstum"
            if growth_percent is not None
            else "relevanter Basisnachfrage"
        )
        return (
            f"{term_name} zeigt starkes Informationsinteresse mit Suchmustern wie "
            f"'{top_query or '-'}' und '{rising_query or '-'}'. Das spricht fuer "
            f"Educational Content bei gleichzeitigem Signal aus {growth_text}."
        )

    if use_case_id == "product_portfolio":
        return (
            f"Bei {term_name} verdichten sich konkrete Formulierungs- und Formatwuensche. "
            f"Top-Signale wie '{top_query or '-'}' und dynamische Trigger wie "
            f"'{rising_query or '-'}' ({rising_label or '-'}) liefern verwertbare Hinweise "
            "fuer SKU-Planung und Produktdetailseiten."
        )

    return (
        f"{term_name} zeigt haendler- und markennahe Nachfrage mit Queries wie "
        f"'{top_query or '-'}' und '{rising_query or '-'}'. Das ist ein Signal fuer "
        "Retail Media, Vertrieb und Wettbewerbsmonitoring."
    )


def build_business_use_case(definition, insight, signal, metric):
    priority = determine_use_case_priority(signal, metric)

    return {
        "id": definition["id"],
        "title": definition["title"],
        "goal": definition["goal"],
        "priority": priority,
        "recommended_term": insight["name"],
        "term_metrics": metric,
        "score": signal["score"],
        "why_now": build_use_case_reason(definition["id"], insight["name"], signal, metric),
        "top_evidence": signal["top_match"],
        "rising_evidence": signal["rising_match"],
        "matched_query_count": signal["top_match_count"] + signal["rising_match_count"],
        "breakout_match_count": signal["breakout_match_count"],
        "supporting_queries": signal["matched_queries"],
        "actions": definition["actions"],
    }


def build_business_use_cases(metrics_by_name, query_insights):
    use_cases = []

    for definition in BUSINESS_USE_CASE_DEFINITIONS:
        candidates = []

        for insight in query_insights:
            signal = build_use_case_signal(
                insight["top_queries"],
                insight["rising_queries"],
                definition["keywords"],
            )

            if signal["score"] <= 0:
                continue

            metric = metrics_by_name.get(insight["name"])
            adjusted_score = signal["score"]

            if metric:
                adjusted_score += metric["mean"] * 0.2

                if metric["growth_percent"] is not None and metric["growth_percent"] > 0:
                    adjusted_score += metric["growth_percent"] * 0.5

            candidates.append((adjusted_score, insight, signal, metric))

        if not candidates:
            continue

        candidates.sort(key=lambda item: item[0], reverse=True)
        _, best_insight, best_signal, best_metric = candidates[0]
        use_cases.append(
            build_business_use_case(
                definition,
                best_insight,
                best_signal,
                best_metric,
            )
        )

    return use_cases


def build_overview(term=None):
    rows = load_rows()
    terms_to_calculate = [validate_term(term)] if term else get_terms()
    metrics = [
        calculate_metrics(current_term, rows)
        for current_term in terms_to_calculate
    ]
    query_data = build_query_insights(term)
    metrics_by_name = {metric["name"]: metric for metric in metrics}
    business_use_cases = build_business_use_cases(
        metrics_by_name,
        query_data["terms"],
    )

    return {
        "terms": metrics,
        "query_insights": query_data["terms"],
        "query_highlights": query_data["highlights"],
        "business_use_cases": business_use_cases,
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/live")
def live():
    return {"status": "alive"}


@app.get("/ready")
def ready():
    try:
        if not (DATA_DIR / CSV_FILE_NAME).exists():
            raise FileNotFoundError(f"CSV file not found: {DATA_DIR / CSV_FILE_NAME}")

        build_overview()
        return {"status": "ready"}
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@app.get("/terms")
def terms():
    try:
        return {"terms": get_terms()}
    except FileNotFoundError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error


@app.get("/metrics")
def metrics(term: str | None = Query(default=None)):
    try:
        rows = load_rows()
        terms_to_calculate = [term] if term else get_terms()

        return {
            "terms": [
                calculate_metrics(current_term, rows)
                for current_term in terms_to_calculate
            ]
        }
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail=f"CSV file not found: {DATA_DIR / CSV_FILE_NAME}",
        ) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.get("/timeseries")
def timeseries():
    try:
        rows = load_rows()
        return build_timeseries(rows)
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail=f"CSV file not found: {DATA_DIR / CSV_FILE_NAME}",
        ) from error


@app.get("/queries")
def queries(term: str | None = Query(default=None)):
    try:
        return build_query_insights(term)
    except FileNotFoundError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.get("/overview")
def overview(term: str | None = Query(default=None)):
    try:
        return build_overview(term)
    except FileNotFoundError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
