import csv
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware


CSV_FILE_NAME = "interest_over_time.csv"

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


def clean_value(value):
    value = value.strip()

    if value == "":
        return None

    if value == "<1":
        return 0

    return int(value)


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


def calculate_growth_percent(first, last):
    if first == 0 and last == 0:
        return 0.0

    if first == 0:
        return None

    return round(((last - first) / first) * 100, 1)


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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/live")
def live():
    return {"status": "alive"}


@app.get("/ready")
def ready():
    csv_path = DATA_DIR / CSV_FILE_NAME

    if not csv_path.exists():
        raise HTTPException(status_code=503, detail=f"CSV file not found: {csv_path}")

    return {"status": "ready"}


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
        raise HTTPException(status_code=500, detail=f"CSV file not found: {DATA_DIR / CSV_FILE_NAME}") from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.get("/timeseries")
def timeseries():
    try:
        rows = load_rows()
        return build_timeseries(rows)
    except FileNotFoundError as error:
        raise HTTPException(status_code=500, detail=f"CSV file not found: {DATA_DIR / CSV_FILE_NAME}") from error
