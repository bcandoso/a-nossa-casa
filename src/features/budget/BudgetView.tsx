import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { pt } from '@/i18n/pt-PT';
import type { ProjectData } from '@/hooks/useProjectData';
import { AddEntryForm } from './AddEntryForm';
import { BudgetLedger } from './BudgetLedger';
import { BudgetWidgets } from './BudgetWidgets';
import shared from '../shared.module.css';
import styles from './BudgetView.module.css';

export function BudgetView({ data }: { data: ProjectData }) {
  const [adding, setAdding] = useState(false);
  if (!data.project) return null;

  return (
    <div className={shared.stack}>
      <PageHeader title={pt.budget.title} subtitle={pt.budget.subtitle} />
      <BudgetWidgets data={data} />
      <Card title={pt.budget.ledger} hint={pt.budget.ledgerHint}>
        <div className={styles.toolbar}>
          {adding ? (
            <AddEntryForm data={data} onClose={() => setAdding(false)} />
          ) : (
            <div>
              <Button onClick={() => setAdding(true)}>
                <Plus size={16} aria-hidden />
                {pt.budget.add}
              </Button>
            </div>
          )}
        </div>
        <BudgetLedger data={data} />
      </Card>
    </div>
  );
}
