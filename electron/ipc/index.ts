import { registerAccountHandlers } from "./accounts";
import { registerCategoryHandlers } from "./categories";
import { registerTransactionHandlers } from "./transactions";
import { registerBudgetHandlers } from "./budgets";
import { registerInvestmentHandlers } from "./investments";
import { registerLiabilityHandlers } from "./liabilities";
import { registerNetWorthHandlers } from "./networth";
import { registerSettingsHandlers } from "./settings";
import { registerImportCsvHandlers } from "./importCsv";
import { registerBackupHandlers } from "./backup";

export function registerAllIpcHandlers() {
  registerAccountHandlers();
  registerCategoryHandlers();
  registerTransactionHandlers();
  registerBudgetHandlers();
  registerInvestmentHandlers();
  registerLiabilityHandlers();
  registerNetWorthHandlers();
  registerSettingsHandlers();
  registerImportCsvHandlers();
  registerBackupHandlers();
}
