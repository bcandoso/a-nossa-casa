import { FileText, LayoutDashboard, Settings, Wallet, type LucideIcon } from 'lucide-react';
import type { PageId } from '@/hooks/useHashRoute';
import { pt } from '@/i18n/pt-PT';

export type NavAccent = 'flare' | 'blue' | 'surge' | 'yellow' | 'green' | 'muted';

export interface NavItem {
  id: PageId;
  label: string;
  sub: string;
  Icon: LucideIcon;
  accent: NavAccent;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: pt.nav.dashboard, sub: pt.dashboard.subtitle, Icon: LayoutDashboard, accent: 'flare' },
  { id: 'budget', label: pt.nav.budget, sub: pt.budget.subtitle, Icon: FileText, accent: 'surge' },
  { id: 'funding', label: pt.nav.funding, sub: pt.funding.subtitle, Icon: Wallet, accent: 'blue' },
];

export const SETTINGS_ITEM: NavItem = {
  id: 'settings',
  label: pt.nav.settings,
  sub: pt.settings.subtitle,
  Icon: Settings,
  accent: 'muted',
};

export const ALL_NAV_ITEMS: NavItem[] = [...NAV_ITEMS, SETTINGS_ITEM];

export const PAGE_COPY: Record<PageId, { title: string; sub: string }> = {
  dashboard: { title: pt.dashboard.title, sub: pt.dashboard.subtitle },
  funding: { title: pt.funding.title, sub: pt.funding.subtitle },
  budget: { title: pt.budget.title, sub: pt.budget.subtitle },
  settings: { title: pt.settings.title, sub: pt.settings.subtitle },
};
