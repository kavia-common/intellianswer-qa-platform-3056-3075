# QA Frontend (Angular)

Angular-based user interface for Q&A with an LLM backend, themed with the Ocean Professional style.

- Sidebar navigation, top bar with user info/settings, main chat/Q&A area.
- Prepared to connect to REST and WebSocket endpoints via ApiService and WebsocketService.
- Colors: primary #2563EB, secondary #F59E0B, error #EF4444.

Scripts:
- npm start (dev on port 3000)
- npm run build

Configuration:
- REST base URL and WebSocket URL are resolved at runtime from window globals:
  - window.__QA_API_BASE_URL__
  - window.__QA_WS_URL__
- Defaults (for local dev) are used if not provided:
  - apiBaseUrl: http://localhost:8080/api
  - wsUrl: ws://localhost:8080/ws

Notes for Preview/CI:
- The dev server is configured to listen on 0.0.0.0:3000 and angular.json allows the preview host.
- If the WebSocket URL is not configured, the app will skip connecting and continue to render the UI normally.
