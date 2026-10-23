export type Id = string;

export type TrancheStatus = 'planned' | 'released';

export type VarianceState = 'under' | 'onTrack' | 'over' | 'inflated';

export type DocumentKind = 'budget' | 'invoice';

export type DocumentStatus = 'pending' | 'validated' | 'rejected';

export type FundingSourceType = 'tranche' | 'equity';

export interface FundingSource {
  type: FundingSourceType;
  trancheId?: Id;
}

export interface Project {
  id: Id;
  name: string;
  loanTotal: number;
  /** Opening equity; later top-ups are EquityContribution rows. */
  equityTotal: number;
  /** Alert when remaining equity falls below this percentage of total equity (opening + contributions). */
  equityAlertPct: number;
  /** Flag inflated when real cost is this percentage below submitted and the category is complete. */
  inflatedVariancePct: number;
}

export interface Tranche {
  id: Id;
  projectId: Id;
  label: string;
  amount: number;
  plannedDate: string;
  releasedDate?: string;
  status: TrancheStatus;
}

export interface EquityContribution {
  id: Id;
  projectId: Id;
  label: string;
  amount: number;
  date: string;
}

/** Extra quoted cost for a category, added on top of its base submitted budget. */
export interface BudgetItem {
  id: Id;
  projectId: Id;
  categoryId: Id;
  providerId?: Id;
  amount: number;
  date: string;
  documentId?: Id;
}

export interface Category {
  id: Id;
  projectId: Id;
  name: string;
  submittedBudget: number;
  color: string;
  sortOrder: number;
  complete: boolean;
}

export interface Provider {
  id: Id;
  projectId: Id;
  name: string;
  nif: string;
  categoryIds: Id[];
}

export interface Expense {
  id: Id;
  projectId: Id;
  providerId: Id;
  categoryId: Id;
  amount: number;
  date: string;
  documentId?: Id;
  notes?: string;
}

export interface ExtractedFields {
  providerName?: string;
  nif?: string;
  amount?: number;
  date?: string;
  invoiceNumber?: string;
  categoryHint?: string;
}

export interface ParsedDocument {
  id: Id;
  projectId: Id;
  providerId?: Id;
  /** Set on validation; budgets update this category's submitted value. */
  categoryId?: Id;
  kind: DocumentKind;
  fileName: string;
  mimeType: string;
  extracted: ExtractedFields;
  status: DocumentStatus;
  uploadedAt: string;
}

export interface AllocationSplit {
  source: FundingSource;
  amount: number;
}

export interface ExpenseAllocation {
  expenseId: Id;
  splits: AllocationSplit[];
}

export interface MonthlyBalance {
  month: string;
  releasedThisMonth: number;
  equityAddedThisMonth: number;
  expensesThisMonth: number;
  trancheDrawnThisMonth: number;
  equityDrawnThisMonth: number;
  trancheRemaining: number;
  equityRemaining: number;
  available: number;
}

export interface CashflowResult {
  allocations: ExpenseAllocation[];
  monthly: MonthlyBalance[];
  trancheRemaining: Record<Id, number>;
  equityRemaining: number;
}

export type ExtractKind = 'opening' | 'contribution' | 'release' | 'expense';

export interface ExtractLine {
  id: string;
  date: string;
  kind: ExtractKind;
  sourceId?: Id;
  amount: number;
  balance: number;
}

export interface CategoryVariance {
  categoryId: Id;
  submittedBudget: number;
  realCost: number;
  delta: number;
  deltaPct: number;
  state: VarianceState;
}

export type AlertKind = 'category-over' | 'equity-low';

export interface Alert {
  kind: AlertKind;
  categoryId?: Id;
  categoryName?: string;
  amount: number;
  pct?: number;
}

export interface SankeyNodeInput {
  id: string;
  label: string;
  color?: string;
  note?: string;
  displayValue?: number;
}

export interface SankeyLinkInput {
  source: string;
  target: string;
  value: number;
}

export interface FundingFlowGraph {
  nodes: SankeyNodeInput[];
  links: SankeyLinkInput[];
}
