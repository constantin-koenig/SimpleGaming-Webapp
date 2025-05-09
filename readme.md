# Discord Gaming Community Plattform

Eine umfassende Webplattform für die Verwaltung und Interaktion einer Gaming-Community mit Discord-Integration.

## Features

- Discord OAuth2-Anmeldung
- Öffentliche Homepage für Community-Marketing
- Benutzer-Dashboard mit Discord-Statistiken
- Gaming-Buddy-Finder für Spielpartner
- Event-Management und Gewinnspiele
- Admin-Panel für Discord- und Gameserver-Verwaltung
- Rollenbasiertes Berechtigungssystem

## Technologie-Stack

- **Backend**: Node.js, Express, MongoDB, Discord.js
- **Frontend**: React, Vite, Tailwind CSS
- **Authentifizierung**: Discord OAuth2, JWT

## Einrichtung

### Voraussetzungen

- Node.js (v14 oder höher)
- MongoDB
- Discord Developer Account und App

### Backend einrichten

1. Ins Backend-Verzeichnis wechseln:

   ```bash
   cd backend
   ```

2. Abhängigkeiten installieren:

   ```bash
   npm install
   ```

3. Umgebungsvariablen konfigurieren:

   - `.env.example` in `.env` umbenennen
   - Die Variablen mit deinen eigenen Werten aktualisieren

4. Server starten:
   ```bash
   npm run dev
   ```

### Frontend einrichten

1. Ins Frontend-Verzeichnis wechseln:

   ```bash
   cd frontend
   ```

2. Abhängigkeiten installieren:

   ```bash
   npm install
   ```

3. Umgebungsvariablen konfigurieren:

   - `.env.example` in `.env` umbenennen
   - Die Variablen aktualisieren, falls nötig

4. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

### Discord-App einrichten

1. Besuche [Discord Developer Portal](https://discord.com/developers/applications)
2. Erstelle eine neue Anwendung
3. Unter "OAuth2" füge die Redirect-URL hinzu: `http://localhost:5000/api/auth/discord/callback`
4. Kopiere Client ID und Client Secret in deine Backend-`.env`-Datei

## Entwicklungsumgebung

- Backend-Server läuft auf: `http://localhost:5000`
- Frontend-Dev-Server läuft auf: `http://localhost:3000`
