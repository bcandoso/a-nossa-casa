import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { DateField } from '@/components/ui/DateField';
import table from '@/components/ui/DataTable.module.css';
import { formatDate, formatMoney, formatMoneySigned, interpolate } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import type { ProjectData } from '@/hooks/useProjectData';
import { totalEquity } from '@/domain/cashflow';
import {
  removeContribution,
  removeTranche,
  saveContribution,
  saveProject,
  saveTranche,
} from '@/services/storage/repositories';
import type { EquityContribution, Tranche } from '@/domain/types';
import shared from '../shared.module.css';

export function FundingView({ data }: { data: ProjectData }) {
  const { project, tranches, contributions } = data;
  const [notice, setNotice] = useState('');
  const [loan, setLoan] = useState(String(project?.loanTotal ?? 0));
  const [equity, setEquity] = useState(String(project?.equityTotal ?? 0));
  const [alertPct, setAlertPct] = useState(String(project?.equityAlertPct ?? 20));
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [contributionLabel, setContributionLabel] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionDate, setContributionDate] = useState('');

  if (!project) return null;

  const onSaveTotals = async () => {
    await saveProject({
      ...project,
      loanTotal: Number(loan) || 0,
      equityTotal: Number(equity) || 0,
      equityAlertPct: Number(alertPct) || 0,
    });
    setNotice(pt.funding.saved);
  };

  const onAddTranche = async () => {
    if (!label || !amount || !plannedDate) return;
    const tranche: Tranche = {
      id: crypto.randomUUID(),
      projectId: project.id,
      label,
      amount: Number(amount) || 0,
      plannedDate,
      status: 'planned',
    };
    await saveTranche(tranche);
    setLabel('');
    setAmount('');
    setPlannedDate('');
  };

  const onAddContribution = async () => {
    const value = Number(contributionAmount);
    if (!value || !contributionDate) return;
    const contribution: EquityContribution = {
      id: crypto.randomUUID(),
      projectId: project.id,
      label: contributionLabel.trim() || pt.funding.contributionDefault,
      amount: value,
      date: contributionDate,
    };
    await saveContribution(contribution);
    setContributionLabel('');
    setContributionAmount('');
    setContributionDate('');
  };

  const addedEquity = totalEquity(0, contributions);
  const equitySummary = interpolate(pt.funding.equitySummary, {
    total: formatMoney(project.equityTotal + addedEquity),
    opening: formatMoney(project.equityTotal),
    added: formatMoney(addedEquity),
  });

  const onRelease = async (tranche: Tranche) => {
    const today = new Date().toISOString().slice(0, 10);
    await saveTranche({ ...tranche, status: 'released', releasedDate: today });
  };

  return (
    <div className={shared.stack}>
      <PageHeader title={pt.funding.title} subtitle={pt.funding.subtitle} />
      <Card title={pt.funding.title}>
        <div className={shared.form}>
          <TextField id="loan" label={pt.funding.loanTotal} type="number" value={loan} onChange={(e) => setLoan(e.target.value)} />
          <TextField id="equity" label={pt.funding.equityTotal} type="number" value={equity} onChange={(e) => setEquity(e.target.value)} />
          <TextField id="alert" label={pt.funding.equityAlertPct} type="number" value={alertPct} onChange={(e) => setAlertPct(e.target.value)} />
          <Button onClick={() => void onSaveTotals()}>{pt.funding.save}</Button>
        </div>
        {notice ? <p className={shared.notice}>{notice}</p> : null}
      </Card>
      <Card title={pt.funding.contributions} hint={pt.funding.contributionsHint}>
        <div className={shared.form}>
          <TextField
            id="c-label"
            label={pt.funding.label}
            placeholder={pt.funding.contributionDefault}
            value={contributionLabel}
            onChange={(e) => setContributionLabel(e.target.value)}
          />
          <TextField
            id="c-amount"
            label={pt.table.amount}
            type="number"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
          />
          <DateField id="c-date" label={pt.funding.contributionDate} value={contributionDate} onChange={setContributionDate} />
          <Button onClick={() => void onAddContribution()}>{pt.funding.addContribution}</Button>
        </div>
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th>{pt.table.date}</th>
                <th>{pt.funding.label}</th>
                <th className={table.numeric}>{pt.table.amount}</th>
                <th>{pt.table.actions}</th>
              </tr>
            </thead>
            <tbody>
              {contributions.length === 0 ? (
                <tr>
                  <td colSpan={4} className={table.muted}>
                    {pt.funding.contributionsEmpty}
                  </td>
                </tr>
              ) : (
                contributions.map((contribution) => (
                  <tr key={contribution.id}>
                    <td className={table.subStart}>{formatDate(contribution.date)}</td>
                    <td className={table.primary}>{contribution.label}</td>
                    <td className={[table.numeric, table.aside, table.positive].join(' ')}>{formatMoneySigned(contribution.amount)}</td>
                    <td className={table.actionsCell}>
                      <Button tone="ghost" size="sm" onClick={() => void removeContribution(contribution.id)}>
                        {pt.funding.remove}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className={shared.summary}>{equitySummary}</p>
      </Card>
      <Card title={pt.funding.tranches}>
        <div className={shared.form}>
          <TextField id="t-label" label={pt.funding.label} value={label} onChange={(e) => setLabel(e.target.value)} />
          <TextField id="t-amount" label={pt.table.amount} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <DateField id="t-date" label={pt.funding.plannedDate} value={plannedDate} onChange={setPlannedDate} />
          <Button onClick={() => void onAddTranche()}>{pt.funding.addTranche}</Button>
        </div>
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th>{pt.funding.label}</th>
                <th className={table.numeric}>{pt.table.amount}</th>
                <th>{pt.table.status}</th>
                <th>{pt.funding.plannedDate}</th>
                <th>{pt.funding.releasedDate}</th>
                <th>{pt.table.actions}</th>
              </tr>
            </thead>
            <tbody>
              {tranches.map((tranche) => (
                <tr key={tranche.id}>
                  <td className={table.primary}>{tranche.label}</td>
                  <td className={[table.numeric, table.aside].join(' ')}>{formatMoney(tranche.amount)}</td>
                  <td data-label={pt.table.status}>{tranche.status === 'released' ? pt.funding.released : pt.funding.planned}</td>
                  <td data-label={pt.funding.plannedDate}>{formatDate(tranche.plannedDate)}</td>
                  <td data-label={pt.funding.releasedDate}>{tranche.releasedDate ? formatDate(tranche.releasedDate) : '—'}</td>
                  <td className={table.actionsCell}>
                    <div className={shared.actions}>
                      {tranche.status === 'planned' ? (
                        <Button tone="secondary" size="sm" onClick={() => void onRelease(tranche)}>
                          {pt.funding.release}
                        </Button>
                      ) : null}
                      <Button tone="ghost" size="sm" onClick={() => void removeTranche(tranche.id)}>
                        {pt.funding.remove}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
