export const environment = {
  production: true,
  apiBaseUrl: (window as any).__QA_API_BASE_URL__ ?? "https://api.example.com/api",
  wsUrl: (window as any).__QA_WS_URL__ ?? "wss://api.example.com/ws"
};
