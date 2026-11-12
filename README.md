# POI Editor

A web-based geographic Point of Interest (POI) editor and map visualizer built with **Vue 3**, **Quasar Framework v2**, and **Leaflet**.

---

## What the Application Does

**POI Editor** allows users to manage, visualize, create, and import geographic points of interest directly on an interactive map.

### Key Features

- **Interactive Map Visualization**:
  - OpenStreetMap tiles rendered using Leaflet and `@vue-leaflet/vue-leaflet`.
  - Dynamic panning, zooming, and centering on points.

- **Point Creation & Interactive Placement**:
  - **Click to Add**: Add new points directly by clicking anywhere on the map.
  - **Toolbar / Sidebar Action**: Add a point at the current map view center.
  - **Drag and Drop**: Reposition markers on the map by dragging them; coordinates update automatically in real time.

- **Point Management & Editing**:
  - **Collapsible Sidebar**: Lists all points with their labels and coordinates.
  - **In-Place Editing**: Double-click or click to edit point names inline with instant auto-save.
  - **Center & Focus**: Click any point in the sidebar list to center the map on its coordinates.
  - **Delete Points**: Remove unwanted points with one click.

- **TomTom OV2 File Import**:
  - Native binary parser for TomTom `.ov2` POI files.
  - Extracts coordinates and decodes point descriptions to UTF-8.
  - Batch ingestion into Vuex store with progress notifications and status feedback.

---

## Tech Stack

- **Framework**: [Quasar Framework v2](https://quasar.dev/) with [Vue 3](https://v3.vuejs.org/)
- **State Management**: [Vuex 4](https://vuex.vuejs.org/)
- **Mapping**: [Leaflet](https://leafletjs.com/) via [@vue-leaflet/vue-leaflet](https://github.com/vue-leaflet/vue-leaflet) & OpenStreetMap
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Code Quality**: ESLint, Prettier, Husky, lint-staged, and Commitlint (Conventional Commits)

---

## Getting Started

### Prerequisites

- **Node.js**: `>= 26` (see `.nvmrc`)
- **pnpm**: `>= 7.0.0`

### Installation

```bash
pnpm install
```

### Development

Start the development server with hot-code reloading:

```bash
pnpm dev
```

### Build for Production

Compile and bundle the production assets:

```bash
pnpm build
```

### Code Quality & Scripts

- **Lint files**:
  ```bash
  pnpm lint
  ```
- **Format code**:
  ```bash
  pnpm format
  ```
- **Check formatting**:
  ```bash
  pnpm format:check
  ```

---

## Configuration

For advanced configuration, see [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).
