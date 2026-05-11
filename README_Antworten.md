# Google Trends Supplements Analysis

## 1. Executive Summary

In diesem Projekt analysieren wir die Google-Trends-Kategorie `Supplements` fuer Deutschland.
Verglichen werden die fuenf Begriffe Proteinpulver, Kreatin, Vitamin D, Omega 3 und Magnesium.
Die Daten stammen aus dem Zeitraum des letzten Monats und aus der Websuche.
Technisch besteht das System aus einem Data Service, einem AI Service und einem Frontend-Dashboard.
Der Data Service berechnet Kennzahlen aus den CSV-Dateien, der AI Service interpretiert diese per HTTP und OpenAI, und das Frontend visualisiert die Ergebnisse.
Magnesium zeigt im Datensatz den hoechsten Durchschnitt und den hoechsten Peak, waehrend Kreatin als einziger Begriff ein positives Wachstum besitzt.
Damit verbindet das Projekt Datenaufbereitung, API-Kommunikation, AI-Auswertung, Containerisierung und Kubernetes in einer durchgaengigen Anwendung.

## 2. Ziele des Projekts

Ziel des Projekts ist es, oeffentliche Google-Trends-Daten in eine nutzbare Analyseanwendung zu ueberfuehren.
Die Anwendung soll nicht nur Rohdaten anzeigen, sondern konkrete Kennzahlen und eine kurze fachliche Einordnung liefern.
Im Mittelpunkt steht die Frage, welche Supplements aktuell stark gesucht werden und welche Begriffe an Dynamik gewinnen oder verlieren.
Aus technischer Sicht soll gezeigt werden, wie mehrere Services ueber HTTP zusammenarbeiten, wie Daten reproduzierbar verarbeitet werden und wie ein Projekt lokal und in Kubernetes betrieben werden kann.
Fachlich soll die Anwendung Marketing-, Produkt- und Content-Entscheidungen datenbasiert unterstuetzen.

## 3. Anwendung und Nutzung

Lokal wird die Anwendung im Projekt-Root mit `docker compose up --build -d` gestartet.
Danach sind die wichtigsten Komponenten unter folgenden URLs erreichbar:

- Data Service: `http://127.0.0.1:8000`
- AI Service: `http://127.0.0.1:8001`
- Frontend-Dashboard: `http://127.0.0.1:8080`

Wichtige Endpunkte sind:

- `GET /metrics` im Data Service fuer Mean, Peak, Trend und Growth Percent
- `GET /timeseries` im Data Service fuer den Zeitverlauf
- `GET /analysis` im AI Service fuer Daten plus Textinterpretation
- `GET /live` und `GET /ready` fuer Health Checks

In Kubernetes ist das Dashboard zusaetzlich ueber `http://dashboard.localhost` erreichbar und der AI Service ueber `http://ai.localhost`.
Der AI Service liest nie direkt Dateien, sondern ruft die Daten ausschliesslich per HTTP vom Data Service ab.

## 4. Datenanalyse und Ergebnisse

Die Kennzahlen zeigen klare Unterschiede zwischen den fuenf Supplements.
Magnesium erreicht mit einem Durchschnitt von 87,7 und einem Peak von 100 den staerksten Gesamtwert.
Vitamin D liegt mit einem Durchschnitt von 50,7 im oberen Mittelfeld und zeigt einzelne starke Ausschlaege.
Omega 3 erreicht einen Durchschnitt von 41,2, weist aber ein negatives Wachstum von -21,7 Prozent auf.
Kreatin liegt mit einem Durchschnitt von 26,4 zwar unter Magnesium, Vitamin D und Omega 3, ist aber der einzige Begriff mit positivem Wachstum von 18,2 Prozent.
Proteinpulver zeigt mit 15,6 den niedrigsten Durchschnitt und mit -31,6 Prozent auch den staerksten Rueckgang.
Aus fachlicher Sicht ist Magnesium der stabilste Sichtbarkeitskandidat, waehrend Kreatin aktuell das groesste Wachstumsinteresse signalisiert.

## 5. Visualisierung

Das Frontend-Dashboard wurde passend zur Aufgabenstellung als klare, kompakte Visualisierung umgesetzt.
Es kombiniert Kennzahlen, AI-Auswertung und zwei zentrale Diagrammtypen.
Das Zeitverlaufsdiagramm zeigt die taegliche Entwicklung aller fuenf Begriffe ueber den betrachteten Monat.
Ein Vergleichsdiagramm stellt Mean und Peak je Begriff gegenueber.
Ergaenzt wird das Dashboard durch KPI-Karten, ein Trend-Ranking nach Growth Percent und eine Detailtabelle mit allen berechneten Metriken.
Dadurch werden die Daten nicht nur technisch sichtbar, sondern auch fachlich leichter interpretierbar.

## 6. Herausforderungen und Learnings

Eine wichtige Herausforderung war die saubere Verarbeitung der CSV-Daten ohne manuelle Aenderung der Dateien.
Leere Werte, der Ausdruck `<1` und unterschiedliche Zahlenformate mussten im Code behandelt werden.
Eine weitere Herausforderung war die Ueberfuehrung der Vorlesungsbeispiele in eine echte Drei-Service-Architektur mit Data Service, AI Service und Frontend.
Fuer den Betrieb in Docker Compose und Kubernetes mussten Pfade, Ports, Service-Namen, Probes und Ingress-Routing sauber aufeinander abgestimmt werden.
Auch die sichere Bereitstellung des OpenAI-Keys war relevant; dafuer wurden Kubernetes Secret und Sealed Secret beruecksichtigt.
Gelernt haben wir vor allem, dass saubere Schnittstellen, reproduzierbare Datenaufbereitung und klare Deployment-Schritte fuer ein funktionierendes Gesamtsystem entscheidend sind.

## 7. Zukunftsvision

Das System kann fachlich und technisch weiter ausgebaut werden.
Als naechster Schritt waere die Einbindung von `top queries` und `rising queries` sinnvoll, damit nicht nur das Suchinteresse, sondern auch konkrete Suchanfragen analysiert werden.
Darauf aufbauend koennte ein Opportunity Score entstehen, der Mean, Peak, Trend, Wachstum und Schwankung kombiniert.
Der AI Service koennte zusaetzlich konkrete Handlungsempfehlungen formulieren, zum Beispiel fuer Kampagnen, Produktplatzierung oder SEO-Inhalte.
Technisch waeren Authentifizierung, persistente Speicherung historischer Analysen und ein CI/CD-Deployment sinnvolle Erweiterungen.
Langfristig koennte aus dem Projekt ein datengetriebenes Monitoring fuer reale Produkt- und Marketingentscheidungen im Supplements-Bereich entstehen.
