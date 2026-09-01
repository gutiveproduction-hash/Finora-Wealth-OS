import { contextBridge, ipcRenderer } from "electron";

/**
 * Security note: contextIsolation is on and nodeIntegration is off (see main.ts),
 * so the renderer has zero direct Node/Electron access. Everything it can do is
 * explicitly whitelisted here as a plain async function that forwards to a named
 * IPC channel — the renderer never gets a raw `ipcRenderer.invoke` handle.
 */
const api = {
  accounts: {
    list: () => ipcRenderer.invoke("accounts:list"),
    create: (input: unknown) => ipcRenderer.invoke("accounts:create", input),
    update: (id: string, patch: unknown) => ipcRenderer.invoke("accounts:update", id, patch),
    delete: (id: string) => ipcRenderer.invoke("accounts:delete", id),
  },
  categories: {
    list: () => ipcRenderer.invoke("categories:list"),
    create: (input: unknown) => ipcRenderer.invoke("categories:create", input),
    update: (id: string, patch: unknown) => ipcRenderer.invoke("categories:update", id, patch),
    delete: (id: string) => ipcRenderer.invoke("categories:delete", id),
  },
  transactions: {
    list: (filters?: unknown) => ipcRenderer.invoke("transactions:list", filters),
    create: (input: unknown) => ipcRenderer.invoke("transactions:create", input),
    update: (id: string, patch: unknown) => ipcRenderer.invoke("transactions:update", id, patch),
    delete: (id: string) => ipcRenderer.invoke("transactions:delete", id),
    bulkDelete: (ids: string[]) => ipcRenderer.invoke("transactions:bulkDelete", ids),
  },
  budgets: {
    list: (month?: string) => ipcRenderer.invoke("budgets:list", month),
    upsert: (input: unknown) => ipcRenderer.invoke("budgets:upsert", input),
    delete: (id: string) => ipcRenderer.invoke("budgets:delete", id),
    actuals: (month: string) => ipcRenderer.invoke("budgets:actuals", month),
  },
  assets: {
    list: () => ipcRenderer.invoke("assets:list"),
    create: (input: unknown) => ipcRenderer.invoke("assets:create", input),
    update: (id: string, patch: unknown) => ipcRenderer.invoke("assets:update", id, patch),
    updatePrice: (id: string, price: number, date?: string) =>
      ipcRenderer.invoke("assets:updatePrice", id, price, date),
    delete: (id: string) => ipcRenderer.invoke("assets:delete", id),
    priceHistory: (assetId: string) => ipcRenderer.invoke("assets:priceHistory", assetId),
  },
  holdings: {
    create: (input: unknown) => ipcRenderer.invoke("holdings:create", input),
    update: (id: string, patch: unknown) => ipcRenderer.invoke("holdings:update", id, patch),
    delete: (id: string) => ipcRenderer.invoke("holdings:delete", id),
  },
  liabilities: {
    list: () => ipcRenderer.invoke("liabilities:list"),
    create: (input: unknown) => ipcRenderer.invoke("liabilities:create", input),
    update: (id: string, patch: unknown) => ipcRenderer.invoke("liabilities:update", id, patch),
    delete: (id: string) => ipcRenderer.invoke("liabilities:delete", id),
  },
  networth: {
    summary: () => ipcRenderer.invoke("networth:summary"),
    snapshots: () => ipcRenderer.invoke("networth:snapshots"),
    recordSnapshot: (date?: string) => ipcRenderer.invoke("networth:recordSnapshot", date),
  },
  settings: {
    getAll: () => ipcRenderer.invoke("settings:getAll"),
    set: (key: string, value: string) => ipcRenderer.invoke("settings:set", key, value),
  },
  exchangeRates: {
    list: () => ipcRenderer.invoke("exchangeRates:list"),
    upsert: (currency: string, rate: number) => ipcRenderer.invoke("exchangeRates:upsert", currency, rate),
    delete: (currency: string) => ipcRenderer.invoke("exchangeRates:delete", currency),
  },
  importCsv: {
    chooseFile: () => ipcRenderer.invoke("import:chooseFile"),
    preview: (filePath: string) => ipcRenderer.invoke("import:preview", filePath),
    commit: (options: unknown) => ipcRenderer.invoke("import:commit", options),
  },
  backup: {
    exportJson: () => ipcRenderer.invoke("backup:exportJson"),
    importJson: () => ipcRenderer.invoke("backup:importJson"),
    revealDbFile: () => ipcRenderer.invoke("backup:revealDbFile"),
    dbPath: () => ipcRenderer.invoke("backup:dbPath"),
  },
  app: {
    getVersion: () => ipcRenderer.invoke("app:getVersion"),
  },
  /** Renderer has no direct Node access, so the OS platform is exposed as a plain
   * value here — used to add clearance under macOS's inset traffic-light buttons. */
  platform: process.platform,
};

contextBridge.exposeInMainWorld("api", api);

export type MyNetworthApi = typeof api;
