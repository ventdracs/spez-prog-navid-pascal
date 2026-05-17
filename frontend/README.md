# Frontend

Dieses Verzeichnis enthaelt ein statisches Dashboard fuer das Supplements-Projekt.

## Ziel

Das Frontend verbindet:

- Kennzahlen aus dem Data Service
- Zeitreihen fuer Visualisierungen
- Query-Signale aus Top Queries und Rising Queries
- AI-Interpretation aus dem AI Service
- Business Use Cases fuer Unternehmensentscheidungen

## Inhalt

- KPI-Karten fuer Mean, Peak und Growth
- Use-Case-Karten fuer Content, Produktportfolio und Channel-Aktivierung
- Query-Highlights fuer Breakouts, Overlap und Rising Momentum
- Verlaufschart fuer das Suchinteresse
- Vergleichsansicht fuer Mean und Peak
- Query-Karten pro Supplement fuer Top- und Rising-Insights
- AI-Auswertung fuer die fachliche Einordnung

## Start

Lokal ueber Docker Compose:

```bash
docker compose up --build -d
```

Dann ist das Dashboard unter `http://127.0.0.1:8080` erreichbar.
