# Fact-Digit — Instructions de Build

## Prérequis
- Node.js 18+
- npm ou yarn

## Build Web (SaaS)
```bash
npm install
npm run build
```
Les fichiers sont générés dans `dist/`.

## Build Desktop (.EXE)

### 1. Installer les dépendances Electron
```bash
npm install --save-dev electron electron-builder
```

### 2. Ajouter au package.json
```json
{
  "main": "electron/main.js",
  "build": {
    "appId": "com.factdigit.app",
    "productName": "Fact-Digit",
    "directories": { "output": "release" },
    "win": {
      "target": "nsis",
      "icon": "electron/assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "electron/assets/icon.icns"
    }
  },
  "scripts": {
    "electron:dev": "vite & electron .",
    "electron:build": "vite build && electron-builder --win"
  }
}
```

### 3. Préparer l'icône
Placez `icon.png` (512x512) dans `electron/assets/`.
Pour Windows, convertissez en `.ico`.

### 4. Builder
```bash
npm run electron:build
```
L'exécutable sera dans `release/`.
