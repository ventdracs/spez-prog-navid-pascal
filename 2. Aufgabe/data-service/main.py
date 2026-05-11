import csv
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


CSV_PATH = Path(__file__).resolve().parent.parent / "data" / "Interest.csv"
DEFAULT_TERM = "Proteinpulver"
PORT = 8000


def clean_value(value):
    value = value.strip()

    if value == "":
        return None

    if value == "<1":
        return 0

    return int(value)


def load_rows():
    with open(CSV_PATH, newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        return list(reader)


def get_terms():
    rows = load_rows()

    if not rows:
        return []

    return [column for column in rows[0].keys() if column != "Time"]


def calculate_metrics(term):
    rows = load_rows()
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
    }


def send_json(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")

    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


class DataServiceHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        query = parse_qs(parsed_url.query)

        try:
            if parsed_url.path == "/health":
                send_json(self, 200, {"status": "ok"})
                return

            if parsed_url.path == "/terms":
                send_json(self, 200, {"terms": get_terms()})
                return

            if parsed_url.path == "/metrics":
                term = query.get("term", [DEFAULT_TERM])[0]
                send_json(self, 200, calculate_metrics(term))
                return

            send_json(self, 404, {"error": "Not found"})
        except ValueError as error:
            send_json(self, 400, {"error": str(error)})

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), DataServiceHandler)
    print(f"Data Service running on http://localhost:{PORT}")
    server.serve_forever()
