import { SankeyDiagram } from '@/components/charts/SankeyDiagram';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatMoney, formatMoneyShort } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import { useFundingFlow } from '@/hooks/useFundingFlow';
import type { ProjectData } from '@/hooks/useProjectData';
import { AlertBanner } from './AlertBanner';
import { KpiStrip } from './KpiCard';
import { StatementCard } from './StatementCard';
import { SaldoWidget } from './SaldoWidget';
import styles from './DashboardView.module.css';

export function DashboardView({ data }: { data: ProjectData }) {
  const { project } = data;
  const { cashflow, graph, alerts, totalDelta, releasedTotal, equityTotal } = useFundingFlow(data);
  if (!project || !cashflow) return null;

  return (
    <>
      <PageHeader title={pt.dashboard.title} subtitle={pt.dashboard.subtitle} />
      <SaldoWidget cashflow={cashflow} />
      <KpiStrip
        project={project}
        releasedTotal={releasedTotal}
        equityTotal={equityTotal}
        equityRemaining={cashflow.equityRemaining}
        totalDelta={totalDelta}
      />
      <AlertBanner alerts={alerts} />
      <div className={styles.flow}>
        <Card title={pt.dashboard.fundingFlow} hint={pt.dashboard.fundingFlowHint}>
          <SankeyDiagram
            nodes={graph.nodes}
            links={graph.links}
            height={380}
            emptyMessage={pt.dashboard.emptyFlow}
            formatValue={formatMoneyShort}
            formatTooltipValue={formatMoney}
            legend={[
              { label: pt.sankey.legendLoan, color: 'var(--flow-loan)' },
              { label: pt.sankey.legendEquity, color: 'var(--flow-equity)' },
              { label: pt.sankey.legendUnreleased, color: 'var(--flow-unreleased)' },
            ]}
          />
        </Card>
      </div>
      <StatementCard
        expenses={data.expenses}
        tranches={data.tranches}
        openingEquity={project.equityTotal}
        contributions={data.contributions}
        categories={data.categories}
        providers={data.providers}
      />
    </>
  );
}
