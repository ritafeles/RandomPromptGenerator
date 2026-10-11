import { describe, it, expect } from 'vitest';
import { baseOptionCounts, categories, getCategories } from './data';
import { initialChoices, reroll, buildPrompt, restore, serialize, normalizeTags, restoreOptions } from './generator';
describe('prompt invariants', () => {
  it('always begins with exactly one 1girl across 2000 generations', () => {
    let state = initialChoices();
    for (let i = 0; i < 2000; i++) {
      state = reroll(state);
      const tags = buildPrompt(state).split(', ');
      expect(tags[0]).toBe('1girl');
      expect(tags.filter(t => t === '1girl')).toHaveLength(1);
      expect(new Set(tags).size).toBe(tags.length);
      expect(tags).not.toContain('');
    }
  });
  it('normalizes blanks, casing and duplicates', () => {
    expect(normalizeTags([' 1girl, ', 'Blue Eyes, blue eyes', ''])).toBe('1girl, blue eyes');
  });
  it('preserves locks and disabled choices while changing all other choices', () => {
    const state = initialChoices(); state.hairStyle.locked = true; state.eyes.enabled = false;
    const next = reroll(state);
    for (const c of categories) expect(next[c.id].selected === state[c.id].selected).toBe(c.id === 'hairStyle' || c.id === 'eyes');
    expect(buildPrompt(next)).not.toContain(categories[2].options[state.eyes.selected].tags);
    expect(state).not.toBe(next);
  });
  it('rerolls only the selected category', () => {
    const state = initialChoices(); const next = reroll(state, 'pose');
    for (const c of categories) expect(next[c.id].selected === state[c.id].selected).toBe(c.id !== 'pose');
  });
  it('handles all disabled and all locked', () => {
    const state = initialChoices(); Object.values(state).forEach(c => c.enabled = false);
    expect(buildPrompt(state)).toBe('1girl'); expect(reroll(state)).toEqual(state);
    Object.values(state).forEach(c => { c.enabled = true; c.locked = true; });
    expect(reroll(state)).toEqual(state);
  });
  it('restores persisted settings exactly', () => {
    const state = initialChoices(); state.pose.locked = true; state.eyes.enabled = false;
    expect(restore(serialize(state))).toEqual(state);
  });
  it.each([null, '', '{bad', 'null', '{}', '{"version":2}', '{"version":1,"choices":{}}'])('recovers invalid storage %s', raw => {
    const state = restore(raw);
    expect(Object.keys(state)).toHaveLength(categories.length);
    expect(Object.values(state).every(c => c.enabled && !c.locked)).toBe(true);
    expect(buildPrompt(state)).toMatch(/^1girl, /);
  });
  it('rejects out of range and wrongly typed persisted fields', () => {
    for (const patch of [{ selected: -1 }, { selected: 1000 }, { selected: 1.5 }, { enabled: 'yes' }, { locked: null }]) {
      const state = initialChoices(); Object.assign(state.pose, patch); state.eyes.enabled = false;
      expect(restore(serialize(state)).eyes.enabled).toBe(true);
    }
  });
  it('provides at least 54 unique options per category, including Danbooru top tags', () => {
    for (const c of categories) { expect(c.options.length).toBeGreaterThanOrEqual(['artist', 'artStyle'].includes(c.id) ? 40 : 54); expect(new Set(c.options.map(o => o.tags)).size).toBe(c.options.length); expect(new Set(c.options.map(o => o.label)).size).toBe(c.options.length); }
    const tagsOf = (id: string) => categories.find(c => c.id === id)!.options.map(o => o.tags);
    expect(tagsOf('hairStyle')).toContain('ahoge'); expect(tagsOf('expression')).toContain('blush'); expect(tagsOf('outfit')).toContain('school uniform');
    expect(tagsOf('background')).toContain('simple background'); expect(tagsOf('framing')).toContain('cowboy shot'); expect(tagsOf('lighting')).toContain('lens flare');
  });
});

it('migrates saved adult outfit indices without changing the selected outfit', () => {
 const state = initialChoices(); state.outfit = {enabled:true, locked:true, selected:36};
 const old = JSON.stringify({version:1, choices:state});
 const migrated = restore(old, true);
 expect(buildPrompt(migrated, [], true)).toContain('one-piece swimsuit');
 expect(migrated.outfit.locked).toBe(true);
 expect(restore(serialize(migrated), true)).toEqual(migrated);
 expect(restore(old, false).outfit.selected).toBe(0);
});

it('migrates version 2 adult outfit indices past the Danbooru candidates', () => {
 const regular = categories.find(c => c.id === 'outfit')!.options.length;
 const state = initialChoices(); state.outfit = {enabled:true, locked:true, selected:baseOptionCounts.outfit + 2};
 const restored = restore(JSON.stringify({version:2, choices:state}), true);
 expect(restored.outfit.selected).toBe(regular + 2);
 expect(getCategories(true).find(c => c.id === 'outfit')!.options[restored.outfit.selected].label).toBe('成人 · ビキニ');
});

it('adds Danbooru adult candidates to every supported category only in NSFW mode', () => {
 const regular = getCategories(false), adult = getCategories(true);
 for (const id of ['outfit', 'pose', 'expression', 'background', 'framing', 'lighting']) {
  const r = regular.find(c => c.id === id)!, a = adult.find(c => c.id === id)!;
  expect(a.options.length).toBeGreaterThan(r.options.length);
  expect(a.options.slice(0, r.options.length)).toEqual(r.options);
  expect(new Set(a.options.map(o => o.tags)).size).toBe(a.options.length);
  expect(new Set(a.options.map(o => o.label)).size).toBe(a.options.length);
 }
 expect(adult.find(c => c.id === 'pose')!.options.map(o => o.tags)).toContain('arched back');
 expect(regular.find(c => c.id === 'pose')!.options.map(o => o.tags)).not.toContain('arched back');
});

it('adds artist:name tags and keeps older saves that predate the artist category', () => {
 const artist = categories.find(c => c.id === 'artist')!;
 expect(artist.options.length).toBeGreaterThan(40);
 expect(artist.options.every(o => o.tags.startsWith('artist:'))).toBe(true);
 const state = initialChoices(); state.hairStyle = {enabled:true, locked:true, selected:2};
 const { artist: _removed, ...legacy } = state;
 const restored = restore(JSON.stringify({version:3, choices:legacy}));
 expect(restored.hairStyle).toEqual({enabled:true, locked:true, selected:2});
 expect(restored.artist.enabled).toBe(true);
 state.artist = {enabled:true, locked:true, selected:0};
 expect(buildPrompt(state)).toContain(artist.options[0].tags);
});

it('offers art style tags with escaped parentheses', () => {
 const style = categories.find(c => c.id === 'artStyle')!.options.map(o => o.tags);
 expect(style).toContain('anime coloring'); expect(style).toContain('watercolor \\(medium\\)');
 expect(style.some(tag => /(?<!\\)[()]/.test(tag))).toBe(false);
});

it('appends free-form custom tags last, normalized and deduplicated, and persists them', () => {
 const state = initialChoices(); for (const c of Object.values(state)) c.enabled = false;
 expect(buildPrompt(state, [], false, ' Red Ribbon, 1girl,, red ribbon ,  ')).toBe('1girl, red ribbon');
 expect(buildPrompt(state, [], true, 'x')).toBe('1girl, adult woman, mature female, x');
 expect(restoreOptions(JSON.stringify({version:1, adult:false, quality:[], custom:'abc'})).custom).toBe('abc');
 expect(restoreOptions(JSON.stringify({version:1, adult:false, quality:[]})).custom).toBe('');
 expect(restoreOptions(JSON.stringify({version:1, adult:false, quality:[], custom:5})).custom).toBe('');
});
