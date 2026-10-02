'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const { devopsPractices, cloudConcepts, pipelineStages } = require('./data/content');

const { version } = require('../package.json');

// Página principal como HTML estático (sin motor de plantillas).
// Dos marcadores permiten mantener el comportamiento dinámico de antes:
//   - <!-- APP_VERSION -->       -> badge con la versión vigente de package.json
//   - <!-- NOT_FOUND_NOTICE -->  -> aviso visible solo en el 404
const indexHtml = fs.readFileSync(path.join(__dirname, 'views', 'index.html'), 'utf8');

const notFoundNotice =
  '\n      <section class="notice">\n' +
  '        <strong>404:</strong> La página solicitada no existe. Volvemos al contenido principal.\n' +
  '      </section>\n' +
  '    ';

function renderIndex(notFound = false) {
  return indexHtml
    .replace('<!-- NOT_FOUND_NOTICE -->', notFound ? notFoundNotice : '')
    .replace(/v[\d.]+<!-- APP_VERSION -->/, `v${version}`);
}

function createApp() {
  const app = express();

  app.use(express.static(path.join(__dirname, 'public')));

  // Página principal
  app.get('/', (req, res) => {
    res.type('html').send(renderIndex());
  });

  // API JSON para consumir el contenido desde otros clientes
  app.get('/api/devops', (req, res) => {
    res.json({ total: devopsPractices.length, prácticas: devopsPractices });
  });

  app.get('/api/cloud', (req, res) => {
    res.json({ total: cloudConcepts.length, conceptos: cloudConcepts });
  });

  app.get('/api/pipeline', (req, res) => {
    res.json({ etapas: pipelineStages });
  });

  // Endpoint de salud usado por los pipelines y por el sondeo del App Service
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  // 404
  app.use((req, res) => {
    res.status(404).type('html').send(renderIndex(true));
  });

  return app;
}

module.exports = { createApp };
