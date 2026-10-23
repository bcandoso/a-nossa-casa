import { AppShell } from '@/components/layout/AppShell';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { BudgetView } from '@/features/budget/BudgetView';
import { FundingView } from '@/features/funding/FundingView';
import { SettingsView } from '@/features/settings/SettingsView';
import { useAppearance } from '@/hooks/useAppearance';
import { useHashRoute } from '@/hooks/useHashRoute';
import { useProjectData } from '@/hooks/useProjectData';
import { pt } from '@/i18n/pt-PT';

export function App() {
  const [page, navigate] = useHashRoute();
  const data = useProjectData();
  const appearance = useAppearance();
  const projectName = data.project?.name ?? pt.appName;

  return (
    <AppShell
      page={page}
      projectName={projectName}
      ready={data.ready}
      data={data}
      appearance={appearance}
      onNavigate={navigate}
    >
      {page === 'dashboard' ? <DashboardView data={data} /> : null}
      {page === 'funding' ? <FundingView data={data} /> : null}
      {page === 'budget' ? <BudgetView data={data} /> : null}
      {page === 'settings' ? <SettingsView data={data} /> : null}
    </AppShell>
  );
}
