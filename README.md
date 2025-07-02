# Bluetooth GPS Tracker Simulation

## Sinn und Zweck
Diese Simulation demonstriert die Funktionsweise einer Bluetooth-Tracker-Karte (ähnlich Tile oder AirTag) mit:
- Realistischer Bluetooth-Geräteinteraktion
- Standortverfolgung über Crowd-Netzwerk
- Batterie- und Signalmanagement
- Praktische Anwendungsfälle wie Diebstahlschutz und Schlüsselfinder

## Ordnerstruktur
```
/projektordner/
├── tracker.html      # UI-Struktur
├── tracker.css       # Styling
└── tracker.js        # Kernlogik
```

## Hauptfunktionen
✅ **Geräteverwaltung**  
- Bluetooth-Scan mit Signalstärke
- Verbindungsaufbau/Trennung
- Geräteinfo (Firmware, Hardware)

✅ **Standortfeatures**  
- Live-Kartenansicht (OpenStreetMap)
- Positionshistorie mit Genauigkeitsangabe
- Entfernungsberechnung zwischen Updates

✅ **Sicherheitsfunktionen**  
- Verlustmodus mit Kontaktinfo
- Akustischer Alarm
- Batteriewarnungen

✅ **Diagnose**  
- Echtzeit-Ereignisprotokoll
- Signal- und Batteriestatus
- Werkzeug zur Fehlerbehebung

## Setup
1. Alle drei Dateien im selben Ordner speichern
2. `tracker.html` im Browser öffnen
3. Keine Installation oder Server benötigt

## Technische Basis
- **Pure JavaScript** (keine Frameworks)
- **LocalStorage** für Persistenz
- **OpenStreetMap** für kartografische Darstellung
- **Haversine-Formel** für Entfernungsberechnung

## Anwendungsszenarien
- Demo für IoT-Entwicklung
- Lehrbeispiel für Bluetooth Low Energy
- UI/UX-Prototyping
- Technologievermittlung im Unterricht

## Anpassungen
1. Standardposition in `tracker.js` (Zeile ~30):
```js
this.lastLocation = { lat: 52.5200, lng: 13.4050 }; // Berlin
```
2. Designanpassungen in `tracker.css`
3. Owner-Info im Verlustmodus anpassen (Zeile ~40)

## Browserkompatibilität
| Browser  | Unterstützt |
|----------|-------------|
| Chrome   | ✓           |
| Firefox  | ✓           |
| Edge     | ✓           |
| Safari   | ✓*          |

*Eingeschränkte localStorage-Funktionalität

## Lizenz
MIT-Lizenz - Nutzung für private und kommerzielle Zwecke erlaubt
