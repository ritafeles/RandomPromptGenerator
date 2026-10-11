import { extraOptions } from './extra-options';
import { moreOptions } from './more-options';
import { danbooruAdultOptions, danbooruArtists, danbooruOptions, danbooruStyles } from './danbooru-options';
export type Category = { id: string; label: string; subtitle: string; options: { label: string; tags: string }[] };
// seen には使用済みのタグと表示名を入れる。タグが重複する候補は除き、表示名だけが重複する候補はタグ名を添えて区別する。
function parse(entries: string[], seen: Set<string>, prefix = '') {
  const result: { label: string; tags: string }[] = [];
  for (const entry of entries) {
    const [name, tags] = entry.split('|');
    if (seen.has(`tag:${tags}`)) continue;
    let label = prefix + name;
    if (seen.has(`label:${label}`)) label = `${label} (${tags})`;
    seen.add(`tag:${tags}`); seen.add(`label:${label}`);
    result.push({ label, tags });
  }
  return result;
}
const usedKeys = (options: { label: string; tags: string }[]) => options.flatMap(o => [`tag:${o.tags}`, `label:${o.label}`]);
// Danbooru 候補を追加する前の候補数。バージョン2の保存データ内の成人向け服装の位置を移行するために使う。
export const baseOptionCounts: Record<string, number> = {};
function category(id: string, label: string, subtitle: string, entries: string[]): Category {
  const seen = new Set<string>();
  const base = parse([...entries, ...(extraOptions[id] ?? []), ...(moreOptions[id] ?? [])], seen);
  baseOptionCounts[id] = base.length;
  return { id, label, subtitle, options: [...base, ...parse(danbooruOptions[id] ?? [], seen)] };
}
export const categories: Category[] = [
  category('hairStyle', '髪型', 'HAIR STYLE', ['ロング|long hair','ショート|short hair','ボブ|bob cut','ポニーテール|ponytail','ツインテール|twintails','三つ編み|braid','お団子|hair bun','ウェーブ|wavy hair','巻き髪|curly hair','ストレート|straight hair','サイドポニー|side ponytail','ハーフアップ|half updo','ピクシーカット|pixie cut','編み込みの冠|crown braid','低めのポニー|low ponytail','ゆるい三つ編み|loose braid','肩までの髪|medium hair','編んだおさげ|twin braids']),
  category('hairColor', '髪色', 'HAIR COLOR', ['黒|black hair','茶|brown hair','金|blonde hair','銀|silver hair','白|white hair','赤|red hair','青|blue hair','水色|light blue hair','ピンク|pink hair','紫|purple hair','緑|green hair','オレンジ|orange hair','グレー|grey hair','栗色|auburn hair','ラベンダー|lavender hair','青緑|teal hair']),
  category('eyes', '瞳の色', 'EYE COLOR', ['青|blue eyes','緑|green eyes','茶|brown eyes','琥珀|amber eyes','紫|purple eyes','赤|red eyes','グレー|grey eyes','金|golden eyes','ピンク|pink eyes','水色|light blue eyes','ヘーゼル|hazel eyes','青緑|teal eyes','黒|black eyes','銀|silver eyes','すみれ色|violet eyes','アクア|aqua eyes']),
  category('expression', '表情', 'EXPRESSION', ['微笑み|smile','穏やか|gentle smile','明るい笑顔|open-mouth smile','真剣|serious','考えごと|thoughtful expression','驚き|surprised','照れ|blush','自信ありげ|confident smile','好奇心|curious expression','物憂げ|melancholic expression','眠たげ|sleepy expression','いたずらっぽい|playful smile','決意|determined expression','不機嫌|pout','落ち着いた|calm expression','無表情|expressionless']),
  category('outfit', '服装', 'OUTFIT', ['ニット＆スカート|knitted sweater, long skirt','白いワンピース|white sundress','パーカー＆ジーンズ|hoodie, jeans','トレンチコート|trench coat, trousers','着物|kimono, obi','カーディガン|cardigan, pleated skirt','シャツ＆パンツ|button-up shirt, tailored trousers','冬の装い|winter coat, scarf, gloves','魔法使い|witch hat, witch robe','冒険者|leather armor, cape, boots','騎士|plate armor, armored boots','イブニングドレス|evening gown','スポーツウェア|tracksuit, sneakers','オーバーオール|overalls, t-shirt','セーターのワンピース|sweater dress, tights','浴衣|yukata, sash','レインコート|raincoat, rain boots','ジャケット＆スカート|denim jacket, midi skirt']),
  category('pose', 'ポーズ', 'POSE', ['立つ|standing','座る|sitting','歩く|walking','振り返る|looking back','手を振る|waving','腕を組む|crossed arms','腰に手|hands on hips','伸びをする|stretching','本を読む|reading a book','花を持つ|holding a flower','カップを持つ|holding a cup','髪に触れる|hand in hair','前かがみ|leaning forward','ひざを抱える|hugging knees','手を合わせる|clasped hands','踊る|dancing','空を見る|looking at sky','頬に手を添える|hand on own cheek']),
  category('background', '背景', 'BACKGROUND', ['花畑|flower field','森|forest','海辺|beach','カフェ|cafe interior','図書館|library','街角|street corner','屋上|rooftop','日本庭園|japanese garden','雪景色|snowy landscape','温室|greenhouse','山並み|mountain landscape','寝室|bedroom','駅|train station','雨の街|rainy city','星空|starry sky','無地|simple background','湖畔|lakeside','城の廊下|castle corridor']),
  category('framing', '構図', 'COMPOSITION', ['ポートレート|portrait','上半身|upper body','全身|full body','顔のアップ|close-up','横顔|profile','斜めから|three-quarter view','俯瞰|from above','あおり|from below','背面|from behind','中央配置|centered composition','左右対称|symmetrical composition','三分割|rule of thirds','広角|wide shot','ミディアム|medium shot','傾いた視点|dutch angle','肩越し|over-the-shoulder shot']),
  category('lighting', 'ライティング', 'LIGHTING', ['柔らかな光|soft lighting','逆光|backlighting','黄金の光|golden hour','月明かり|moonlight','自然光|natural lighting','窓からの光|window light','輪郭光|rim lighting','映画風|cinematic lighting','拡散光|diffused lighting','木漏れ日|dappled sunlight','ネオン|neon lighting','ろうそく|candlelight','青い光|blue lighting','ドラマチック|dramatic lighting','スタジオ|studio lighting','夕焼け|sunset lighting','朝の光|morning light','薄明かり|dim lighting']),
  category('artStyle', '絵柄', 'ART STYLE', danbooruStyles),
  category('artist', 'アーティスト', 'ARTIST', danbooruArtists),
];
const adultOutfits = [
  ['ワンピース水着', 'one-piece swimsuit'], ['スポーツ水着', 'athletic swimsuit'],
  ['ビキニ', 'bikini'], ['ハイウエスト水着', 'high-waisted bikini'],
  ['タンキニ', 'tankini'], ['水着＆サロン', 'swimsuit, sarong'],
  ['水着＆ビーチシャツ', 'swimsuit, open beach shirt'], ['ラッシュガード', 'rash guard, swim shorts'],
  ['サテンのランジェリー', 'satin lingerie'], ['レースのランジェリー', 'lace lingerie'],
  ['ランジェリー＆ローブ', 'lingerie, silk robe'], ['クラシックなランジェリー', 'classic lingerie'],
  ['シルクのスリップ', 'silk slip dress'], ['背中開きドレス', 'backless evening gown'],
  ['オフショルダードレス', 'off-shoulder evening dress'], ['カクテルドレス', 'cocktail dress'],
  ['ホルターネック水着', 'halter-neck swimsuit'], ['スイムドレス', 'swim dress'],
  ['レトロ水着', 'retro swimsuit'], ['長袖水着', 'long-sleeved swimsuit'],
  ['スポーティービキニ', 'sporty bikini'], ['水着＆リゾートローブ', 'swimsuit, resort robe'],
  ['花柄ビキニ', 'floral bikini'], ['ストライプ水着', 'striped swimsuit'],
  ['ベルベットドレス', 'velvet evening dress'], ['サテンのガウン', 'satin evening gown'],
  ['ホルターネックドレス', 'halter-neck evening dress'], ['ワンショルダードレス', 'one-shoulder evening dress'],
  ['シルクのキャミソールセット', 'silk camisole, matching shorts'], ['サテンのパジャマ', 'satin pajamas'],
  ['刺繍ランジェリー', 'embroidered lingerie'], ['ランジェリー＆カーディガン', 'lingerie, long cardigan'],
].map(([label, tags]) => ({label: `成人 · ${label}`, tags}));
// NSFWモード用の候補は通常候補の後ろに追加するため、保存済みの選択番号は変わらない。
const adultCategories: Category[] = categories.map(c => {
  const seen = new Set(usedKeys([...c.options, ...(c.id === 'outfit' ? adultOutfits : [])]));
  const extra = parse(danbooruAdultOptions[c.id] ?? [], seen, '成人 · ');
  return { ...c, options: [...c.options, ...(c.id === 'outfit' ? adultOutfits : []), ...extra] };
});
export function getCategories(adult = false): Category[] {
  return adult ? adultCategories : categories;
}
