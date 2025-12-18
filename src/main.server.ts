// src/main.server.ts
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { App } from './app/app';                    // adapte le chemin si nécessaire
import { config } from './app/app.config.server'; // si tu as un config server, sinon adapte

// Exporte une fonction par défaut acceptant le BootstrapContext côté serveur
const bootstrap = (context: BootstrapContext) => {
  return bootstrapApplication(App, config, context);
};

export default bootstrap;
