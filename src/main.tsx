import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getCategories } from './data';
import { qualityTags } from './extra-options';
import { buildPrompt, initialChoices, reroll, restore, serialize, STORAGE_KEY, type Choice, sanitizeChoices, restoreOptions, OPTIONS_KEY, CUSTOM_MAX_LENGTH } from './generator';
import './style.css';

export function App() {
  const [options, setOptions] = useState(() => { try { return restoreOptions(localStorage.getItem(OPTIONS_KEY)); } catch { return restoreOptions(null); } });
  const categories = getCategories(options.adult);
  const [choices, setChoices] = useState(() => { try { return restore(localStorage.getItem(STORAGE_KEY), options.adult); } catch { return initialChoices(); } });
  const [notice, setNotice] = useState('');
  const [saveError, setSaveError] = useState(false);
  const output = useRef<HTMLTextAreaElement>(null);
  const prompt = buildPrompt(choices, options.quality, options.adult, options.custom);
  const enabled = Object.values(choices).filter(c => c.enabled).length;
  const locked = Object.values(choices).filter(c => c.enabled && c.locked).length;
  const canRoll = enabled > locked;
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, serialize(choices)); localStorage.setItem(OPTIONS_KEY, JSON.stringify({ version: 1, ...options })); setSaveError(false); } catch { setSaveError(true); } setNotice(''); }, [choices, options]);
  function update(id: string, patch: Partial<Choice>) { setChoices(prev => ({ ...prev, [id]: { ...prev[id], ...patch } })); }
  async function copy() {
    try { await navigator.clipboard.writeText(prompt); setNotice('コピーしました'); }
    catch { output.current?.focus(); output.current?.select(); setNotice('自動コピーできませんでした。選択したテキストを Ctrl+C（Macは⌘C）でコピーしてください。'); }
  }
  async function copyTag(label: string, tags: string) {
    try { await navigator.clipboard.writeText(tags); setNotice(`「${label}」のタグをコピーしました: ${tags}`); }
    catch { setNotice(`自動コピーできませんでした。手動でコピーしてください: ${tags}`); }
  }
  return <div className="app-shell">
    <header className="header"><a className="brand" href="#" aria-label="Prompt Atelier ホーム"><span className="brand-icon">✦</span><span>Prompt <b>Atelier</b></span></a><span className="local-badge"><i/> LOCAL WORKSPACE</span></header>
    <main>
      <section className="intro"><div><p className="eyebrow">A LITTLE CHANCE. A NEW IDEA.</p><h1>偶然から、次の一枚へ。</h1><p className="lead">組み合わせて、ひらめく。あなたのためのプロンプト工房。</p></div><div className="fixed-badge"><span>✦</span><div><strong>1girl</strong><small>必ず含まれる固定タグ</small></div><span className="fixed-lock">固定</span></div></section>
      <section className="settings-panel" aria-label="生成オプション">
        <div className="quality-settings"><h2>品質タグ <span>必要なタグを複数選択</span></h2><div className="quality-chips">{qualityTags.map(q => <button key={q.tags} aria-pressed={options.quality.includes(q.tags)} title={q.tags} onClick={() => setOptions(prev => ({...prev, quality: prev.quality.includes(q.tags) ? prev.quality.filter(t => t !== q.tags) : [...prev.quality, q.tags]}))}>{q.label}<small>{q.tags}</small></button>)}</div><p>品質タグの効果は使用するモデルによって異なります。</p></div>
        <div className={`adult-settings ${options.adult ? 'active' : ''}`}><label><span>NSFWモード <small>成人・非露骨</small></span><input type="checkbox" aria-label="NSFWモード" checked={options.adult} onChange={e => { const adult = e.target.checked; setChoices(prev => sanitizeChoices(prev, adult)); setOptions(prev => ({...prev, adult})); }}/></label><p>成人向けの水着・ランジェリー・ドレスに加え、ポーズ・表情・背景・構図にも非露骨な候補を追加。オンの間は成人を示すタグが必ず入ります。</p><strong>{options.adult ? 'ON · 成人向け候補を追加中' : 'OFF · 通常の候補のみ'}</strong></div>
      <div className="custom-settings"><label htmlFor="custom-tags">自由入力タグ <span>カンマ区切りでプロンプトの末尾に追加</span></label><input id="custom-tags" type="text" spellCheck={false} autoComplete="off" maxLength={CUSTOM_MAX_LENGTH} placeholder="例: masterpiece, looking at viewer, red ribbon" value={options.custom} onChange={e => setOptions(prev => ({...prev, custom: e.target.value}))}/><p>入力した内容はブラウザに保存されます。小文字に統一され、重複するタグは自動で除かれます。</p></div>
      </section>
      <div className="workspace">
        <section className="category-panel" aria-labelledby="category-heading"><div className="section-title"><div><span className="step">01</span><h2 id="category-heading">組み合わせを選ぶ</h2></div><span>{enabled} / {categories.length} 使用中</span></div><p className="section-hint">気に入った項目は固定して、残りをランダムに。</p>
          <div className="category-grid">{categories.map((c, index) => { const item = choices[c.id]; return <article key={c.id} className={`category-card ${!item.enabled ? 'off' : ''} ${item.locked ? 'locked' : ''}`}><div className="card-heading"><div><span className="category-number">{String(index + 1).padStart(2, '0')}</span><h3>{c.label}</h3></div><label className="switch"><input type="checkbox" checked={item.enabled} onChange={e => update(c.id, { enabled: e.target.checked })} aria-label={`${c.label}を使用する`}/><span/></label></div><p className="category-subtitle">{c.subtitle} · {c.options.length}種類</p><select aria-label={`${c.label}の候補`} disabled={!item.enabled || item.locked} value={item.selected} onChange={e => update(c.id, { selected: Number(e.target.value) })}>{c.options.map((option, i) => <option key={option.tags} value={i}>{option.label}</option>)}</select><div className="tag-row"><p className="tag-preview" title={c.options[item.selected].tags}>{c.options[item.selected].tags}</p><button className="tag-copy" aria-label={`${c.label}のタグをコピー`} title="このタグをコピー" onClick={() => copyTag(c.label, c.options[item.selected].tags)}>⧉ <span>コピー</span></button></div><div className="card-actions"><button className="lock-button" aria-label={`${c.label}を固定`} aria-pressed={item.locked} disabled={!item.enabled} onClick={() => update(c.id, { locked: !item.locked })}><span>{item.locked ? '▣' : '□'}</span> {item.locked ? '固定中' : '固定する'}</button><button className="reroll-button" aria-label={`${c.label}を再抽選`} disabled={!item.enabled || item.locked} onClick={() => setChoices(prev => reroll(prev, c.id, options.adult))}>↻ <span>再抽選</span></button></div></article>; })}</div>
        </section>
        <aside className="result-panel" aria-labelledby="result-heading"><div className="section-title"><div><span className="step">02</span><h2 id="result-heading">プロンプト</h2></div><span className="live-dot">LIVE</span></div><p className="section-hint">そのまま画像生成サービスに貼り付け。</p><div className="output-label"><span>POSITIVE PROMPT</span><span>{prompt.split(', ').length} TAGS</span></div><textarea ref={output} aria-label="生成されたプロンプト" readOnly spellCheck={false} value={prompt}/><div className="result-meta"><span><i/> 1girl は常に先頭に入ります</span><span>{prompt.length} 文字</span></div><button className="generate-button" disabled={!canRoll} onClick={() => setChoices(prev => reroll(prev, undefined, options.adult))}><span>✦</span> ランダム生成 <span>↗</span></button><button className="copy-button" onClick={copy}>▧　プロンプトをコピー</button><p className="notice" role="status">{notice || (!enabled ? 'カテゴリをオンにするとタグが追加されます。' : !canRoll ? 'すべて固定中です。固定を解除すると再抽選できます。' : `${enabled - locked} 項目を再抽選 · ${locked} 項目を固定`)}</p><div className="tip"><span>✧</span><p>「これ、いいかも」を残そう。<small>固定した項目を軸に、別の組み合わせを探せます。</small></p></div><p className="save-note">{saveError ? '設定を保存できません。この画面では引き続き使えます。' : '設定はこのブラウザに自動保存されます'}</p></aside>
      </div>
    </main><footer><span>PROMPT ATELIER</span><span>画像生成は行いません · ひらめきを、ひとつずつ。</span></footer>
  </div>;
}
const root = document.getElementById('root');
if (root) createRoot(root).render(<React.StrictMode><App/></React.StrictMode>);
