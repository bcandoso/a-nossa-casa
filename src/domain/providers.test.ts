import { describe, expect, it } from 'vitest';
import { providersForCategory, resolveProvider } from './providers';
import type { Provider } from './types';

const provider = (id: string, categoryIds: string[]): Provider => ({ id, projectId: 'p', name: id, nif: '', categoryIds });

const providers = [provider('silva', ['pedreiro', 'trolha']), provider('ribeiro', ['pichelaria']), provider('costa', ['trolha'])];

describe('providersForCategory', () => {
  it('returns only providers linked to the category', () => {
    expect(providersForCategory(providers, 'trolha').map((p) => p.id)).toEqual(['silva', 'costa']);
  });

  it('falls back to every provider when none is linked', () => {
    expect(providersForCategory(providers, 'pintura')).toHaveLength(3);
  });
});

describe('resolveProvider', () => {
  it('auto-picks the only option', () => {
    expect(resolveProvider(providersForCategory(providers, 'pichelaria'), '')).toBe('ribeiro');
  });

  it('keeps a valid choice and clears one that no longer applies', () => {
    const trolha = providersForCategory(providers, 'trolha');
    expect(resolveProvider(trolha, 'costa')).toBe('costa');
    expect(resolveProvider(trolha, 'ribeiro')).toBe('');
  });
});
