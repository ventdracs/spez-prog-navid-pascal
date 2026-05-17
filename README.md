# Google Trends Supplements Analysis

## Projektstatus

Dieses Repository enthaelt eine lauffaehige Analyseanwendung fuer Google-Trends-Daten zur Kategorie `Supplements`. Die Architektur besteht aus einem Data Service, einem AI Service und einem Frontend-Dashboard. Der Data Service verarbeitet sowohl `interest over time` als auch `top queries` und `rising queries`, der AI Service interpretiert diese Daten per HTTP, und das Frontend visualisiert die Ergebnisse.

## Aktuell gewaehlte Kategorie

Wir arbeiten mit der Kategorie `Supplements` und verwenden aktuell diese fünf Begriffe:

- Proteinpulver
- Kreatin
- Vitamin D
- Omega 3
- Magnesium

Diese Begriffe sind thematisch vergleichbar, gehoeren zur gleichen Oberkategorie und eignen sich deshalb fuer einen gemeinsamen Vergleich in Google Trends.

## Datengrundlage

Die Daten wurden aus Google Trends mit den geforderten Parametern exportiert:

- Region: Deutschland
- Zeitraum: letzter Monat
- Suchtyp: Web Search

Im Repository liegen derzeit folgende CSV-Dateien in [data/csv](/Users/pascalnoack/Desktop/spez-prog-navid-pascal/data/csv):

- `interest_over_time.csv`
- `top_queries_proteinpulver.csv`
- `top_queries_kreatin.csv`
- `top_queries_vitamin_d.csv`
- `top_queries_omega_3.csv`
- `top_queries_magnesium.csv`
- `rising_queries_proteinpulver.csv`
- `rising_queries_kreatin.csv`
- `rising_queries_vitamin_d.csv`
- `rising_queries_omega_3.csv`
- `rising_queries_magnesium.csv`

Dabei wurde `interest over time` als gemeinsamer Vergleichsexport fuer alle fünf Begriffe heruntergeladen. Die Dateien `top queries` und `rising queries` wurden pro Begriff einzeln exportiert und anschliessend konsistent umbenannt.

## Kurzpruefung der Rohdaten

Die Rohdaten wurden bereits auf die wichtigsten technischen Punkte geprueft:

- Die Spaltennamen sind konsistent und fuer die Weiterverarbeitung geeignet.
- Das Datumsformat in `interest_over_time.csv` liegt als `YYYY-MM-DD` vor.
- In den Query-Dateien kommen Sonderzeichen und Unicode-Whitespace vor.
- In `increase percent` gibt es Werte wie `30 %`, `4.300 %` und `Breakout`, die spaeter beim Parsing bereinigt werden muessen.

## Projektstruktur

Die Projektstruktur wurde bereits an die Aufgabenstellung angepasst:

```text
.
|-- README.md
|-- Workflow.md
|-- docker-compose.yml
|-- data/
|   |-- csv/
|-- services/
|   |-- data-service/
|   |   |-- Dockerfile
|   |   |-- app/
|   |-- ai-service/
|   |   |-- Dockerfile
|   |   |-- app/
|-- frontend/
|-- k8s/
|   |-- data-service-deployment.yml
|   |-- data-service-service.yml
|   |-- ai-service-deployment.yml
|   |-- ai-service-service.yml
```

## Technischer Stand

Folgende Teile sind bereits vorhanden:

- Projektstruktur fuer die Abgabe
- CSV-Daten fuer alle fünf Suchbegriffe
- `docker-compose.yml` als Startpunkt fuer die lokale Orchestrierung
- Dockerfiles fuer `data-service`, `ai-service` und `frontend`
- implementierter Data Service mit `/metrics`, `/timeseries`, `/queries` und `/overview`
- implementierter AI Service mit kombinierter Kennzahlen-, Query- und Use-Case-Interpretation
- Frontend-Dashboard mit KPI-Karten, Charts, Query-Signal-Ansicht und Business-Use-Case-Sektion
- Kubernetes-Manifeste fuer Deployments, Services und Ingress
- interne Planungsdatei `Workflow.md`

Folgende Teile sind noch nicht final implementiert:

- automatisierte Tests fuer die Services
- abschliessender Pitch
- moegliche Erweiterungen wie Opportunity Score oder persistente Historie

## Geplante Architektur

### Data Service

Der Data Service liest die CSV-Dateien ein, bereinigt Sonderfaelle wie `<1`, Unicode-Whitespace, Prozentwerte und `Breakout` und berechnet Kennzahlen, Query-Signale und geschaeftliche Use Cases. Ueber HTTP stellt er Zeitreihen, Metrics, Top/Rising-Analysen und eine kombinierte Overview-Antwort bereit.

### AI Service

Der AI Service ruft die Kennzahlen, Query-Analysen und Business-Use-Cases vom Data Service per HTTP ab und erzeugt daraus eine datenbasierte Interpretation. Die AI dient dabei nicht als Chatbot, sondern als automatische Interpretationsschicht zwischen Rohdaten und Nutzer:innen.

### Visualisierung

Das Frontend zeigt mindestens zwei Visualisierungen: den Zeitverlauf aller Begriffe und einen Mean-vs.-Peak-Vergleich. Zusaetzlich visualisiert es Query-Highlights wie Breakouts, Overlap und Rising Momentum sowie drei konkrete Business Use Cases fuer Unternehmen.

## How To Start

Die Anwendung kann lokal ueber Docker Compose gestartet werden:

```bash
docker compose up --build -d
```

Danach sind die Komponenten standardmaessig erreichbar unter:

- `http://127.0.0.1:8000` fuer den Data Service
- `http://127.0.0.1:8001` fuer den AI Service
- `http://127.0.0.1:8080` fuer das Frontend

## Kubernetes

Im Ordner [k8s](/Users/pascalnoack/Desktop/spez-prog-navid-pascal/k8s) liegen bereits erste Kubernetes-Manifeste fuer:

- `data-service`
- `ai-service`
- `frontend`

Die Manifeste bilden die Zielarchitektur fuer Deployments, Services und Ingress ab.

## Naechste Schritte

Die naechsten Entwicklungsschritte sind:

1. Services in Docker Compose und Kubernetes end-to-end testen
2. README fuer die finale Abgabe inhaltlich straffen
3. Pitch vorbereiten
4. Optionalen Opportunity Score fuer Rankings ergaenzen
5. Tests und Monitoring erweitern

## Hinweis zum aktuellen Stand

Die Anwendung ist funktional umgesetzt. Die verbleibenden Arbeiten liegen vor allem in Verifikation, Praesentation und moeglichen fachlichen Erweiterungen.
