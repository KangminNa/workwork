#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const modules = ['auth', 'user', 'schedule', 'notification', 'label', 'admin'];
const gateway = 'gateway';
const base = 'base';

const layerFolders = ['app', 'interface', 'application', 'domain', 'infrastructure', 'shared'];
const nestedFolders = {
  interface: ['http', 'controllers', 'pages'],
  application: ['services', 'use-cases'],
  domain: ['models', 'entities', 'repositories'],
  infrastructure: ['adapters'],
  shared: ['dto', 'utils'],
};

function ensureDir(target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
}

function scaffoldModule(basePath) {
  layerFolders.forEach((layer) => {
    const layerPath = path.join(basePath, layer);
    ensureDir(layerPath);
    if (nestedFolders[layer]) {
      nestedFolders[layer].forEach((child) => ensureDir(path.join(layerPath, child)));
    }
  });
}

[...modules, gateway, base].forEach((moduleName) => {
  scaffoldModule(path.resolve(moduleName));
});

console.log('Scaffold complete for modules: ', [...modules, gateway, base].join(', '));
