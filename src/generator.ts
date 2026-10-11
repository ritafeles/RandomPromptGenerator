import { baseOptionCounts, categories, getCategories } from './data';
import { qualityTags } from './extra-options';
export type Choice = { enabled: boolean; locked: boolean; selected: number };
export type Choices = Record<string, Choice>;
export const STORAGE_KEY = 'prompt-atelier-v1';
export function initialChoices(): Choices {
  return Object.fromEntries(categories.map(c => [c.id, { enabled: true, locked: false, selected: Math.floor(Math.random() * c.options.length) }]));
}
export function reroll(state: Choices, target?: string, adult = false): Choices {
  return Object.fromEntries(getCategories(adult).map(c => {
    const item = state[c.id];
    if (!item.enabled || item.locked || (target && c.id !== target)) return [c.id, item];
    // Sample every other candidate uniformly, ensuring a visible change.
    const selected = (item.selected + 1 + Math.floor(Math.random() * (c.options.length - 1))) % c.options.length;
    return [c.id, { ...item, selected }];
  }));
}
export function normalizeTags(tags: string[]): string {
  return [...new Set(['1girl', ...tags.flatMap(t => t.split(',')).map(t => t.trim().toLowerCase()).filter(Boolean)])].join(', ');
}
export const CUSTOM_MAX_LENGTH = 500;
export function buildPrompt(state: Choices, quality: string[] = [], adult = false, custom = ''): string {
  return normalizeTags([
    ...(adult ? ['adult woman', 'mature female'] : []),
    ...quality.filter(tag => qualityTags.some(q => q.tags === tag)),
    ...getCategories(adult).filter(c => state[c.id].enabled).map(c => (c.options[state[c.id].selected] ?? c.options[0]).tags),
    // Free-form tags typed by the user come last; normalizeTags splits on commas and removes duplicates.
    custom.slice(0, CUSTOM_MAX_LENGTH),
  ]);
}
export function restore(raw: string | null, adult = false): Choices {
  try {
    const value = JSON.parse(raw ?? 'null');
    if (!value || ![1, 2, 3].includes(value.version) || !value.choices) return initialChoices();
    // Version 1 stored adult outfits after the original 36 regular outfits.
    // Move those saved indices past the newly appended regular candidates.
    if (value.version === 1 && value.choices.outfit && Number.isInteger(value.choices.outfit.selected) && value.choices.outfit.selected >= 36 && value.choices.outfit.selected < 52) {
      value.choices.outfit.selected += categories.find(c => c.id === 'outfit')!.options.length - 36;
    }
    // Version 2 stored adult outfits right after the regular candidates, before the Danbooru candidates were appended.
    if (value.version === 2 && value.choices.outfit && Number.isInteger(value.choices.outfit.selected) && value.choices.outfit.selected >= baseOptionCounts.outfit) {
      value.choices.outfit.selected += categories.find(c => c.id === 'outfit')!.options.length - baseOptionCounts.outfit;
    }
    // Categories added after a save was written start from their defaults instead of discarding the whole save.
    for (const c of categories) value.choices[c.id] ??= initialChoices()[c.id];
    for (const c of getCategories(true)) {
      const item = value.choices[c.id];
      if (!item || typeof item.enabled !== 'boolean' || typeof item.locked !== 'boolean' || !Number.isInteger(item.selected) || item.selected < 0 || item.selected >= c.options.length) return initialChoices();
    }
    return sanitizeChoices(Object.fromEntries(categories.map(c => [c.id, value.choices[c.id]])), adult);
  } catch { return initialChoices(); }
}
export function serialize(choices: Choices) { return JSON.stringify({ version: 3, choices }); }
export function sanitizeChoices(choices: Choices, adult: boolean): Choices {
  return Object.fromEntries(getCategories(adult).map(c => [c.id, choices[c.id].selected < c.options.length ? choices[c.id] : {...choices[c.id], selected: 0}]));
}
export const OPTIONS_KEY = 'prompt-atelier-options-v1';
export type Options = { adult: boolean; quality: string[]; custom: string };
export function restoreOptions(raw: string | null): Options {
  try {
    const value = JSON.parse(raw ?? 'null');
    if (value?.version !== 1 || typeof value.adult !== 'boolean' || !Array.isArray(value.quality) || !value.quality.every((v: unknown) => typeof v === 'string')) return {adult:false, quality:[], custom:''};
    return { adult: value.adult, quality: [...new Set<string>(value.quality)].filter(tag => qualityTags.some(q => q.tags === tag)), custom: typeof value.custom === 'string' ? value.custom.slice(0, CUSTOM_MAX_LENGTH) : '' };
  } catch { return {adult:false, quality:[], custom:''}; }
}
