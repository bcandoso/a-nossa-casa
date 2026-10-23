import type { Id, Provider } from './types';

/** Providers linked to the category, or every provider when none is linked. */
export function providersForCategory(providers: Provider[], categoryId: Id): Provider[] {
  const linked = providers.filter((provider) => provider.categoryIds.includes(categoryId));
  return linked.length > 0 ? linked : providers;
}

/** Keeps a still-valid choice, auto-picks a single option, otherwise clears. */
export function resolveProvider(options: Provider[], current: Id): Id {
  if (options.length === 1) return options[0]?.id ?? '';
  return options.some((provider) => provider.id === current) ? current : '';
}
