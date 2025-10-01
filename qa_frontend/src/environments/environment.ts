export const environment = {
  production: false,
  // IMPORTANT: Ask user to provide these via .env mapped build system if needed.
  apiBaseUrl: (window as any).__QA_API_BASE_URL__ ?? "http://localhost:8080/api",
  wsUrl: (window as any).__QA_WS_URL__ ?? "ws://localhost:8080/ws"
};
