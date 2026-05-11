### Aufgabe 2 – CSV einlesen, bereinigen und Kennzahlen berechnen

Die CSV-Dateien sind bereits im Ordner `data` gespeichert.

****Kopiert den bisherigen Projektstand in einen neuen Ordner und benennt diesen in `2. Aufgabe` um.****

Ziel:
- CSV-Datei laden  
- Werte für **coffee** extrahieren  
- Daten bereinigen  
- Mean, Peak und Trend berechnen  

Die Bereinigung soll im Code passieren. Das bedeutet:
- "<1" in eine Zahl umwandeln  
- leere Werte behandeln  
- Strings in Zahlen konvertieren  

Die CSV-Datei darf nicht manuell verändert werden.

---

### Ordnerstruktur

Erstellt folgende Struktur:

```text
project/
├── data/
│ └── Interest.csv
├── data-service/
│ └── main.py
```

Führt diesen Code in der Datei main.py aus und prüft die Ausgabe in der Konsole.

```bash
python main.py
```

### Code der main.py
```python
import csv

values = []

with open('../data/Interest.csv', newline='', encoding='utf-8') as file:
    reader = csv.reader(file)

    for row in reader:
        if not row:
            continue

        if row[0] == "Time":
            continue  # Header überspringen

        value = row[1]

        if value == "<1":
            value = 0

        if value == "":
            continue

        values.append(int(value))

mean = sum(values) / len(values)
peak = max(values)

first = values[0]
last = values[-1]

if last > first:
    trend = "increasing"
elif last < first:
    trend = "decreasing"
else:
    trend = "stable"

result = {
    "name": "coffee",
    "mean": round(mean, 1),
    "peak": peak,
    "trend": trend
}

print(result)
```

### Beispiel erwartetes Ergebnis
```json
{
  "name": "coffee",
  "mean": 72.9,
  "peak": 100,
  "trend": "decreasing"
}
```