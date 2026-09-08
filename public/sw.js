// Service worker mínimo: existe para tornar o app instalável como PWA.
// Não faz cache de propósito — assim o app nunca serve conteúdo desatualizado.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Sem interceptação: o navegador segue com a requisição normalmente.
});
