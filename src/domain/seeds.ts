import { IDS } from './ids';
import type { Category, EquityContribution, Expense, ParsedDocument, Project, Provider, Tranche } from './types';

const PROJECT_ID = IDS.project;

export function demoProject(): Project {
  return {
    id: PROJECT_ID,
    name: 'Obra da casa',
    loanTotal: 180_000,
    equityTotal: 20_000,
    equityAlertPct: 20,
    inflatedVariancePct: 15,
  };
}

export function demoTranches(): Tranche[] {
  return [
    {
      id: IDS.tranches.t1,
      projectId: PROJECT_ID,
      label: '1.ª tranche',
      amount: 60_000,
      plannedDate: '2026-01-15',
      releasedDate: '2026-01-15',
      status: 'released',
    },
    {
      id: IDS.tranches.t2,
      projectId: PROJECT_ID,
      label: '2.ª tranche',
      amount: 60_000,
      plannedDate: '2026-04-10',
      releasedDate: '2026-04-10',
      status: 'released',
    },
    {
      id: IDS.tranches.t3,
      projectId: PROJECT_ID,
      label: '3.ª tranche',
      amount: 60_000,
      plannedDate: '2026-08-01',
      status: 'planned',
    },
  ];
}

export function demoContributions(): EquityContribution[] {
  return [
    {
      id: IDS.contributions.c1,
      projectId: PROJECT_ID,
      label: 'Reforço de capitais próprios',
      amount: 5_000,
      date: '2026-06-01',
    },
  ];
}

export function demoCategories(): Category[] {
  const { categories: c } = IDS;
  return [
    { id: c.pedreiro, projectId: PROJECT_ID, name: 'Pedreiro', submittedBudget: 50_000, color: 'var(--flare-500)', sortOrder: 1, complete: false },
    { id: c.trolha, projectId: PROJECT_ID, name: 'Trolha', submittedBudget: 18_000, color: 'var(--flare-400)', sortOrder: 2, complete: false },
    { id: c.pichelaria, projectId: PROJECT_ID, name: 'Pichelaria', submittedBudget: 22_000, color: 'var(--blue-500)', sortOrder: 3, complete: false },
    { id: c.carpintaria, projectId: PROJECT_ID, name: 'Carpintaria', submittedBudget: 28_000, color: 'var(--surge-500)', sortOrder: 4, complete: false },
    { id: c.eletricidade, projectId: PROJECT_ID, name: 'Eletricidade', submittedBudget: 16_000, color: 'var(--yellow-500)', sortOrder: 5, complete: false },
    { id: c.serralharia, projectId: PROJECT_ID, name: 'Serralharia', submittedBudget: 12_000, color: 'var(--abyss-400)', sortOrder: 6, complete: false },
    { id: c.pintura, projectId: PROJECT_ID, name: 'Pintura', submittedBudget: 14_000, color: 'var(--green-500)', sortOrder: 7, complete: false },
    { id: c.projeto, projectId: PROJECT_ID, name: 'Projeto e Licenças', submittedBudget: 8_000, color: 'var(--purple-500)', sortOrder: 8, complete: true },
  ];
}

export function demoProviders(): Provider[] {
  const { providers: p, categories: c } = IDS;
  return [
    { id: p.silva, projectId: PROJECT_ID, name: 'Construtora Silva & Filhos', nif: '509111222', categoryIds: [c.pedreiro, c.trolha] },
    { id: p.ribeiro, projectId: PROJECT_ID, name: 'Canalizações Ribeiro', nif: '507333444', categoryIds: [c.pichelaria] },
    { id: p.madeiras, projectId: PROJECT_ID, name: 'Madeiras do Norte', nif: '508555666', categoryIds: [c.carpintaria] },
    { id: p.electro, projectId: PROJECT_ID, name: 'Electro Norte', nif: '506777888', categoryIds: [c.eletricidade] },
    { id: p.alves, projectId: PROJECT_ID, name: 'Serralharia Alves', nif: '505999000', categoryIds: [c.serralharia] },
    { id: p.costa, projectId: PROJECT_ID, name: 'Pinturas Costa', nif: '504121314', categoryIds: [c.pintura] },
    { id: p.mendes, projectId: PROJECT_ID, name: 'Arquitecto Mendes', nif: '503151617', categoryIds: [c.projeto] },
  ];
}

function expense(
  id: string,
  providerId: string,
  categoryId: string,
  amount: number,
  date: string,
): Expense {
  return { id, projectId: PROJECT_ID, providerId, categoryId, amount, date };
}

export function demoExpenses(): Expense[] {
  const { providers: p, categories: c } = IDS;
  return [
    expense('exp-01', p.mendes, c.projeto, 4_200, '2025-12-10'),
    expense('exp-02', p.silva, c.pedreiro, 18_000, '2026-01-20'),
    expense('exp-03', p.silva, c.trolha, 6_000, '2026-02-05'),
    expense('exp-04', p.ribeiro, c.pichelaria, 9_000, '2026-02-18'),
    expense('exp-05', p.electro, c.eletricidade, 5_000, '2026-03-02'),
    expense('exp-06', p.madeiras, c.carpintaria, 8_000, '2026-03-15'),
    expense('exp-07', p.alves, c.serralharia, 4_000, '2026-03-28'),
    expense('exp-08', p.silva, c.pedreiro, 12_000, '2026-04-05'),
    expense('exp-09', p.silva, c.pedreiro, 8_000, '2026-04-12'),
    expense('exp-10', p.ribeiro, c.pichelaria, 14_000, '2026-04-20'),
    expense('exp-11', p.madeiras, c.carpintaria, 10_000, '2026-05-08'),
    expense('exp-12', p.costa, c.pintura, 3_500, '2026-05-22'),
    expense('exp-13', p.electro, c.eletricidade, 4_200, '2026-06-10'),
    expense('exp-14', p.silva, c.trolha, 4_500, '2026-06-25'),
    expense('exp-15', p.alves, c.serralharia, 3_800, '2026-07-08'),
    expense('exp-16', p.costa, c.pintura, 2_800, '2026-07-20'),
    expense('exp-17', p.madeiras, c.carpintaria, 6_500, '2026-08-02'),
    expense('exp-18', p.silva, c.pedreiro, 9_000, '2026-09-15'),
    expense('exp-19', p.costa, c.pintura, 4_000, '2026-09-28'),
  ];
}

export function demoDocuments(): ParsedDocument[] {
  return [];
}
