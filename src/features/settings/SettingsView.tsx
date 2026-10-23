import { PageHeader } from '@/components/ui/PageHeader';
import type { ProjectData } from '@/hooks/useProjectData';
import { pt } from '@/i18n/pt-PT';
import shared from '../shared.module.css';
import { CategoriesCard } from './CategoriesCard';
import { ProvidersCard } from './ProvidersCard';

export function SettingsView({ data }: { data: ProjectData }) {
  const { project, categories, providers } = data;
  if (!project) return null;

  return (
    <div className={shared.stack}>
      <PageHeader title={pt.settings.title} subtitle={pt.settings.subtitle} />
      <CategoriesCard project={project} categories={categories} />
      <ProvidersCard project={project} providers={providers} categories={categories} />
    </div>
  );
}
