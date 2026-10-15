// Danbooru の投稿数上位タグを取得して src/danbooru-options.ts を生成する開発用スクリプト。
// 実行: node scripts/danbooru-options.mjs  （ネットワーク接続が必要。アプリ本体は実行時に通信しない）
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adultTags } from './danbooru-adult-tags.mjs';
import { extraArtists, extraStyles, extraTags } from './danbooru-extra-tags.mjs';
import { moreArtists, moreStyles, moreTags } from './danbooru-more-tags.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Danbooru のタグ名（アンダースコア区切り）→ 日本語ラベル。記号のみの顔文字は区切りをそのまま使う。
const curated = {
  hairStyle: { braid: '三つ編み(基本)', hair_bun: 'お団子(基本)', double_bun: 'ダブルお団子', single_hair_bun: '片側お団子', side_ponytail: 'サイドポニー', low_twintails: '低めのツインテール', high_ponytail: '高いポニー', short_twintails: '短いツインテール', low_ponytail: '低めのポニー', short_ponytail: '短いポニー', twin_braids: 'おさげ', single_braid: '一本の三つ編み', side_braid: 'サイド三つ編み', braided_ponytail: '編み込みポニー', half_up_braid: 'ハーフアップ三つ編み', crown_braid: '編み込みの冠', drill_hair: 'ドリルヘア', wavy_hair: 'ウェーブ', messy_hair: 'ぼさぼさ髪', ahoge: 'アホ毛', sidelocks: '触角(もみあげ)', blunt_bangs: 'ぱっつん前髪', parted_bangs: '分け目の前髪', swept_bangs: '流し前髪', hime_cut: '姫カット', bob_cut: 'ボブカット', curtained_hair: 'カーテン前髪', spiked_hair: 'ツンツン髪', straight_hair: 'ストレート', flipped_hair: '外ハネ', asymmetrical_hair: 'アシンメトリー', antenna_hair: 'ぴょんと立つ毛', 'low-tied_long_hair': '低い位置で結んだロング', crossed_bangs: 'クロス前髪', 'double-parted_bangs': 'センター分け前髪', long_bangs: '長い前髪', braided_bangs: '編み込み前髪', single_side_bun: '片側サイドお団子', cone_hair_bun: '円錐お団子', side_braids: 'サイドおさげ', wolf_cut: 'ウルフカット', very_short_hair: 'ベリーショート', absurdly_long_hair: '足まで届くロング', hair_over_one_eye: '片目隠れ', long_hair: 'ロング', short_hair: 'ショート', very_long_hair: '超ロング', medium_hair: 'ミディアム', twintails: 'ツインテール', ponytail: 'ポニーテール' },
  hairColor: { black_hair: '黒', brown_hair: '茶', blonde_hair: '金', blue_hair: '青', pink_hair: 'ピンク', white_hair: '白', grey_hair: 'グレー', purple_hair: '紫', red_hair: '赤', green_hair: '緑', orange_hair: 'オレンジ', multicolored_hair: 'マルチカラー', streaked_hair: 'メッシュ', 'two-tone_hair': 'ツートーン', gradient_hair: 'グラデーション', aqua_hair: 'アクア', colored_inner_hair: 'インナーカラー', 'split-color_hair': '左右色分け', rainbow_hair: 'レインボー' },
  eyes: { blue_eyes: '青', red_eyes: '赤', purple_eyes: '紫', green_eyes: '緑', brown_eyes: '茶', yellow_eyes: '黄', pink_eyes: 'ピンク', black_eyes: '黒', grey_eyes: 'グレー', orange_eyes: 'オレンジ', aqua_eyes: 'アクア', multicolored_eyes: 'マルチカラーの瞳', glowing_eyes: '光る瞳', empty_eyes: '虚ろな瞳', white_eyes: '白い瞳', 'two-tone_eyes': 'ツートーンの瞳', sparkling_eyes: 'きらきらの瞳', gradient_eyes: 'グラデーションの瞳', ringed_eyes: '波紋の瞳', 'heart-shaped_eyes': 'ハートの瞳', rainbow_eyes: 'レインボーの瞳' },
  expression: { smile: '微笑み(基本)', blush: '頬を赤らめる', open_mouth: '口を開ける', closed_mouth: '口を閉じる', ':d': 'にっこり口開け', parted_lips: '唇を軽く開く', fang: '八重歯', tongue_out: '舌を出す', grin: 'にやけ笑い', tears: '涙', ':o': '口を丸く開ける', ':3': 'ω口', expressionless: '無表情(基本)', '^_^': '目を細めた笑顔', frown: '眉をひそめる', embarrassed: '恥ずかしそう', happy: 'うれしそう', crying: '泣き顔', light_smile: 'ほのかな笑み', ';d': 'ウィンク笑顔', '>_<': '目をぎゅっと閉じる', surprised: '驚き顔', angry: '怒り顔', 'wide-eyed': '目を見開く', jitome: 'ジト目', ':q': '舌ぺろ', serious: '真剣な顔', ':t': 'むくれ口', pout: 'ふくれっ面', smirk: 'ドヤ笑い', smug: 'どや顔(スマグ)', ';)': 'ウィンク(顔文字)', evil_smile: '悪い笑み', laughing: '笑う', annoyed: 'うんざり', nervous: '緊張', sad: '悲しげ', shy: '恥じらい', sleepy: '眠い顔', flustered: 'あたふた', scowl: 'しかめっ面', worried: '心配顔', confused: '困惑顔', crazy_smile: '狂気の笑み', sigh: 'ため息(顔)', disgust: '嫌悪', doyagao: 'ドヤ顔', determined: '決意の顔', puffy_cheeks: '頬をふくらませる', closed_eyes: '目を閉じる(基本)' },
  outfit: { shirt: 'シャツ', skirt: 'スカート', dress: 'ドレス', gloves: '手袋', hat: '帽子', thighhighs: 'ニーソックス', jacket: 'ジャケット', white_shirt: '白シャツ', school_uniform: '学校の制服', pantyhose: 'パンスト', pants: 'パンツ', pleated_skirt: 'プリーツスカート', boots: 'ブーツ', necktie: 'ネクタイ', shorts: 'ショートパンツ', white_dress: '白いドレス', sailor_collar: 'セーラーカラー', serafuku: 'セーラー服', miniskirt: 'ミニスカート', coat: 'コート', black_dress: '黒いドレス', off_shoulder: 'オフショルダー', kimono: '着物(基本)', vest: 'ベスト', apron: 'エプロン', armor: '鎧', sweater: 'セーター', cape: 'マント', crop_top: 'クロップトップ', scarf: 'マフラー', sleeveless_dress: 'ノースリーブのドレス', maid: 'メイド服', hoodie: 'パーカー(基本)', turtleneck: 'タートルネック(基本)', capelet: 'ケープ', frilled_dress: 'フリルのドレス', witch_hat: '魔女帽子', cardigan: 'カーディガン(基本)', tank_top: 'タンクトップ', military_uniform: '軍服', denim: 'デニム', suit: 'スーツ', 't-shirt': 'Tシャツ', blazer: 'ブレザー', strapless_dress: 'ストラップレスドレス', winter_uniform: '冬服の制服', casual: 'カジュアル', long_skirt: 'ロングスカート', summer_uniform: '夏服の制服', sailor_dress: 'セーラーワンピース', jeans: 'ジーンズ', santa_costume: 'サンタ衣装', lolita_fashion: 'ロリータファッション', gym_uniform: '体操服', pajamas: 'パジャマ(基本)', overalls: 'オーバーオール(基本)', yukata: '浴衣(基本)', wedding_dress: 'ウェディングドレス', winter_clothes: '冬服', hanfu: '漢服', cheerleader: 'チアリーダー', halloween_costume: 'ハロウィン衣装', sundress: 'サンドレス', gothic_lolita: 'ゴスロリ', miko: '巫女', office_lady: 'OL風', nurse: 'ナース服', idol: 'アイドル衣装', track_suit: 'トラックスーツ', trench_coat: 'トレンチコート(基本)', raincoat: 'レインコート(基本)', denim_jacket: 'デニムジャケット' },
  pose: { sitting: '座る(基本)', lying: '横たわる', hand_up: '手を上げる', looking_back: '振り返る(基本)', on_back: '仰向け', arm_up: '腕を上げる', hands_up: '両手を上げる', arms_up: '両腕を上げる', v: 'ピースサイン', hand_on_own_hip: '腰に手を当てる', head_tilt: '首をかしげる', leaning_forward: '前かがみ', kneeling: 'ひざをつく', holding_hands: '手をつなぐ', squatting: 'しゃがみ込む', arms_behind_back: '後ろで手を組む', on_side: '横向きに寝る', crossed_arms: '腕組み(基本)', own_hands_together: '両手を合わせる', wariza: '女の子座り', crossed_legs: '脚を組む', outstretched_arm: '腕を伸ばす', pointing: '指をさす', hand_on_own_chest: '胸に手を当てる', knees_up: 'ひざを立てる', hand_on_own_face: '顔に手を添える', arms_behind_head: '頭の後ろで手を組む', walking: '歩く(基本)', finger_to_mouth: '口に指を当てる', arm_behind_head: '頭の後ろに腕を回す', reaching: '手を伸ばす', seiza: '正座', hand_in_own_hair: '髪に手を入れる', head_rest: '頬杖', running: '走る', waving: '手を振る(基本)', hand_on_own_cheek: '頬に手を当てる', hands_in_pockets: 'ポケットに手を入れる', fighting_stance: '構える', outstretched_hand: '手を差し出す', jumping: 'ジャンプ', spread_arms: '両腕を広げる', leaning_back: 'のけぞる', yokozuwari: '横座り', stretching: '伸びをする(基本)', dancing: '踊る', hand_to_own_mouth: '口元に手を当てる', salute: '敬礼', against_wall: '壁に背をつける', hugging_own_legs: '自分の脚を抱える', tiptoes: 'つま先立ち', hair_flip: '髪をかき上げる' },
  background: { simple_background: 'シンプルな背景', white_background: '白背景', flower: '花', outdoors: '屋外', sky: '空', indoors: '屋内', day: '昼', cloud: '雲', grey_background: 'グレー背景', blue_sky: '青空', water: '水辺', tree: '木', blue_background: '青背景', gradient_background: 'グラデーション背景', blurry_background: 'ぼかし背景', window: '窓', transparent_background: '透過背景', petals: '花びら', night: '夜', pink_background: 'ピンク背景', ocean: '海', black_background: '黒背景', beach: 'ビーチ', depth_of_field: '被写界深度', moon: '月', cloudy_sky: '曇り空', yellow_background: '黄背景', red_background: '赤背景', curtains: 'カーテン', building: '建物', scenery: '風景', cherry_blossoms: '桜', green_background: '緑背景', nature: '自然', purple_background: '紫背景', 'two-tone_background': 'ツートーン背景', brown_background: '茶背景', full_moon: '満月', snow: '雪', starry_sky: '星空', forest: '森(基本)', rain: '雨', orange_background: 'オレンジ背景', sunset: '夕焼け', city: '都会', mountain: '山', floral_background: '花柄背景', horizon: '水平線', bookshelf: '本棚', classroom: '教室', cityscape: '街並み', field: '野原', bedroom: '寝室', autumn_leaves: '紅葉', striped_background: 'ストライプ背景', ruins: '廃墟', bamboo: '竹', checkered_background: 'チェック柄背景', flower_field: '花畑(基本)', bridge: '橋', evening: '夕方', falling_leaves: '落ち葉', street: '通り', train_interior: '電車の中', river: '川', bokeh: 'ボケ', castle: '城', abstract_background: '抽象的な背景', kitchen: 'キッチン', orange_sky: 'オレンジの空', twilight: '黄昏', school: '学校', lake: '湖', waterfall: '滝', library: '図書館(基本)', rooftop: '屋上(基本)', desert: '砂漠', sunrise: '日の出', balcony: 'バルコニー', cafe: 'カフェ(基本)', garden: '庭', park: '公園', aurora: 'オーロラ' },
  framing: { looking_at_viewer: 'カメラ目線', full_body: '全身(基本)', upper_body: '上半身(基本)', cowboy_shot: 'カウボーイショット', from_side: '横から', from_behind: '後ろから', looking_to_the_side: '横を見る', pov: '主観視点', profile: '横顔(基本)', dutch_angle: '傾いた構図', from_above: '見下ろし', portrait: 'ポートレート(基本)', looking_down: '見下ろす視線', from_below: '見上げ', facing_viewer: '正面向き', looking_up: '見上げる視線', cropped_torso: '胴体で切る', cropped_legs: '脚を切る', foreshortening: '遠近強調', eye_contact: '目が合う', 'close-up': 'クローズアップ', 'straight-on': '正面から', sideways_glance: '流し目', out_of_frame: 'フレームアウト', facing_away: '背を向ける', looking_away: '視線をそらす', selfie: '自撮り', wide_shot: '引きの構図', perspective: 'パース', lower_body: '下半身', fisheye: '魚眼風', head_only: '頭のみ', symmetry: '左右対称の構図' },
  lighting: { sunlight: '日差し', light_particles: '光の粒', lens_flare: 'レンズフレア', backlighting: '逆光(基本)', sunset: '夕日', light_rays: '光線', dappled_sunlight: '木漏れ日', sunbeam: '差し込む光', spotlight: 'スポットライト', moonlight: '月明かり(基本)', neon_lights: 'ネオンの光', candlelight: 'ろうそくの灯り', dim_lighting: '薄暗い光', window_light: '窓の光(基本)', golden_hour: 'ゴールデンアワー(基本)', twilight: 'トワイライト', bloom: 'ブルーム', high_contrast: 'ハイコントラスト', silhouette: 'シルエット', glint: 'きらめき', shadow: '影', dark: '暗がり', reflection: '反射光', glowing: '発光', warm_colors: '暖色系', cool_colors: '寒色系', chiaroscuro: '明暗対比' },
};
const isSymbol = name => !/[a-z]/i.test(name);
// 括弧付きのタグは強調構文と誤解されないよう \( \) にエスケープする。
const toPrompt = name => isSymbol(name) ? name : name.replace(/_/g, ' ').replace(/[()]/g, '\\$&');
// 既定では一般タグ(0)とメタタグ(5)のみ対象。作品名・キャラ名・絵師名が混ざらないようにする。
async function counts(names, categories = [0, 5]) {
  const result = new Map();
  for (let i = 0; i < names.length; i += 100) {
    const url = new URL('https://danbooru.donmai.us/tags.json');
    url.searchParams.set('search[name_comma]', names.slice(i, i + 100).join(','));
    url.searchParams.set('limit', '100');
    const res = await fetch(url, { headers: { 'User-Agent': 'RandomPromptGenerator/1.0' } });
    if (!res.ok) throw new Error(`Danbooru API ${res.status}`);
    for (const t of await res.json()) if (categories.includes(t.category)) result.set(t.name, t.post_count);
  }
  return result;
}
for (const [id, entries] of [...Object.entries(extraTags), ...Object.entries(moreTags)]) curated[id] = { ...entries, ...curated[id] };
const existing = (await Promise.all(['src/data.ts', 'src/extra-options.ts', 'src/more-options.ts'].map(f => readFile(resolve(root, f), 'utf8')))).join('\n');
// NSFWモード専用（成人・非露骨）。水着・ランジェリー・色気のある表情やポーズまでで、露骨な性描写タグは含めない。
const curatedAdult = {
  outfit: { swimsuit: '水着', bikini: 'ビキニ', leotard: 'レオタード', bodysuit: 'ボディスーツ', 'one-piece_swimsuit': 'ワンピース水着', black_bikini: '黒ビキニ', white_bikini: '白ビキニ', frilled_bikini: 'フリルビキニ', 'front-tie_bikini_top': 'フロントタイビキニ', highleg_leotard: 'ハイレグレオタード', playboy_bunny: 'バニースーツ', lingerie: 'ランジェリー', babydoll: 'ベビードール', negligee: 'ネグリジェ', nightgown: 'ナイトガウン', camisole: 'キャミソール', chemise: 'シュミーズ', backless_dress: '背中開きのドレス', backless_outfit: '背中開きの服', halterneck: 'ホルターネック', side_slit: 'サイドスリット', china_dress: 'チャイナドレス', pencil_skirt: 'タイトスカート', bathrobe: 'バスローブ', sarong: 'サロン', cleavage: '胸元の開いた服', midriff: 'ヘソ出し', navel: 'おへそ', bare_shoulders: '肩出し', bare_legs: '素足' },
  pose: { bent_over: '前屈み', arched_back: '背中を反らす', head_back: '顔をのけぞらせる', hand_on_own_thigh: '太ももに手を置く', on_bed: 'ベッドの上', 'sitting_on_bed': 'ベッドに座る', hand_in_own_hair: '髪をかき上げる手', looking_over_eyewear: '眼鏡越しの視線' },
  expression: { seductive_smile: '誘うような微笑み', naughty_face: 'いたずらな顔', 'half-closed_eyes': '半目', licking_lips: '唇をなめる', lip_biting: '唇をかむ', bedroom_eyes: 'とろんとした目' },
  background: { bed: 'ベッド', bed_sheet: 'シーツ', pillow: '枕', bathroom: 'バスルーム', bathtub: 'バスタブ', onsen: '温泉', pool: 'プール', poolside: 'プールサイド', steam: '湯気', beach_chair: 'ビーチチェア', hotel_room: 'ホテルの部屋', swimming_pool: '水泳プール' },
  framing: { head_out_of_frame: '顔を切る構図', looking_over_shoulder: '肩越しに見る' },
};
for (const [id, entries] of Object.entries(adultTags)) curatedAdult[id] = { ...curatedAdult[id], ...entries };
async function build(source, existingText) {
  const out = {};
  for (const [id, entries] of Object.entries(source)) {
    const found = await counts(Object.keys(entries));
    const rows = Object.entries(entries).filter(([name]) => (found.get(name) ?? 0) > 0)
      .sort((a, b) => found.get(b[0]) - found.get(a[0]))
      .filter(([name]) => !existingText.includes(`|${toPrompt(name)}'`))
      .map(([name, label]) => `${label}|${toPrompt(name)}`);
    const missing = Object.keys(entries).filter(n => !(found.get(n) > 0));
    console.log(`${id}: ${rows.length} 件追加${missing.length ? ` (未登録/0件: ${missing.join(', ')})` : ''}`);
    out[id] = rows;
  }
  return out;
}
const NL = String.fromCharCode(10);
const render = out => Object.entries(out).map(([id, rows]) => ` ${id}: [${rows.map(r => `'${r.replace(/\\/g, '\\\\')}'`).join(',')}],`).join(NL);
// 前回生成した候補。保存データは候補の番号で選択を記録するため、既存の順序を保ち、新しいタグは末尾に追加する。
const previous = {};
try {
  const text = await readFile(resolve(root, 'src/danbooru-options.ts'), 'utf8');
  new Function('previous', text.replace(/^export const (\w+)[^=]*=/gm, 'previous.$1 ='))(previous);
} catch { /* 初回生成 */ }
const tagOf = row => row.slice(row.indexOf('|') + 1);
const appendNew = (prev = [], rows) => { const seen = new Set(prev.map(tagOf)); return [...prev, ...rows.filter(r => !seen.has(tagOf(r)))]; };
const merge = (prev = {}, out) => Object.fromEntries([...new Set([...Object.keys(prev), ...Object.keys(out)])].map(id => [id, appendNew(prev[id], out[id] ?? [])]));
// NSFWモード専用の候補と同じタグを通常候補に加えると、NSFWモードの候補の番号がずれるため除く。
const adultTagsOf = id => new Set((previous.danbooruAdultOptions?.[id] ?? []).map(tagOf));
const regularBuilt = await build(curated, existing);
const regular = merge(previous.danbooruOptions, Object.fromEntries(Object.entries(regularBuilt).map(([id, rows]) => [id, rows.filter(r => !adultTagsOf(id).has(tagOf(r)))])));
const adult = merge(previous.danbooruAdultOptions, await build(curatedAdult, existing));
// 人気アーティスト（Danbooru の artist タグ）。プロンプトには artist:名前 の形で出力する。
const artistNames = ["tony_taka","ixy","huke","namori","kantoku","tsunako","takeuchi_takashi","toosaka_asagi","yamamoto_souichirou","tomose_shunsaku","matsuryuu","ilya_kuvshinov","mizumoto_tadashi","swd3e2","lack","kishida_mel","fuzichoco","fkey","mika_pikazo","nardack","atdan","sakimichan","mignon","ke-ta","mitsumi_misato","kuroboshi_kouhaku","hanekoto","anmi","yamanashi_taiki","ningen_mame","kakage","oda_non","ogipote","tsubasa_tsubasa","yuuki_tatsuya","kawacy","rella","shirokitsune","tiv","aoi_ogata","redjuice","nanaken_nana","rei_kun","wlop","onineko","nyanya","nekojira"];
artistNames.push(...[...extraArtists, ...moreArtists].filter(n => !artistNames.includes(n)));
const artistCounts = await counts(artistNames, [1]);
const artistRows = appendNew(previous.danbooruArtists, artistNames.filter(n => (artistCounts.get(n) ?? 0) > 0).sort((a, b) => artistCounts.get(b) - artistCounts.get(a)).map(n => `${n.replace(/_/g, ' ')}|artist:${toPrompt(n)}`));
console.log(`artist: ${artistRows.length} 件`);
// 絵柄タグ。括弧付きのタグは強調構文と誤解されないよう ( ) にエスケープして出力する。
const styleNames = {"anime_coloring":"アニメ塗り","flat_color":"フラットカラー","realistic":"リアル調","photorealistic":"フォトリアル","sketch":"スケッチ","lineart":"線画","pixel_art":"ドット絵","chibi":"ちび","3d":"3D風","retro_artstyle":"レトロ調","painting_(medium)":"絵画","watercolor_(medium)":"水彩","oil_painting_(medium)":"油彩","marker_(medium)":"マーカー","colored_pencil_(medium)":"色鉛筆","graphite_(medium)":"鉛筆画","acrylic_paint_(medium)":"アクリル絵の具","ink_(medium)":"インク画","pastel_(medium)":"パステル画","gouache_(medium)":"ガッシュ","traditional_media":"アナログ画","monochrome":"モノクロ","greyscale":"グレースケール","sepia":"セピア","limited_palette":"限定色","spot_color":"ワンポイントカラー","partially_colored":"部分着色","halftone":"ハーフトーン","screentones":"スクリーントーン","comic":"漫画風","2000s_(style)":"2000年代風","1990s_(style)":"1990年代風","1980s_(style)":"1980年代風","painterly":"厚塗り風","concept_art":"コンセプトアート","official_style":"公式イラスト風","toon_(style)":"トゥーン調","stained_glass":"ステンドグラス","no_lineart":"線画なし","pastel_colors":"パステルカラー","high_contrast":"ハイコントラスト","minimalism":"ミニマル","impressionism":"印象派","ukiyo-e":"浮世絵","art_nouveau":"アールヌーボー","western_comics_(style)":"アメコミ風","low_poly":"ローポリ","crosshatching":"クロスハッチング","vaporwave":"ヴェイパーウェイブ"};
Object.assign(styleNames, Object.fromEntries([...Object.entries(extraStyles), ...Object.entries(moreStyles)].filter(([n]) => !(n in styleNames))));
const styleCounts = await counts(Object.keys(styleNames));
const styleRows = appendNew(previous.danbooruStyles, Object.keys(styleNames).filter(n => (styleCounts.get(n) ?? 0) > 0).sort((a, b) => styleCounts.get(b) - styleCounts.get(a)).map(n => `${styleNames[n]}|${n.replace(/_/g, ' ').replace(/[()]/g, '\\$&')}`));
console.log(`artStyle: ${styleRows.length} 件`);
const header = '// scripts/danbooru-options.mjs で生成（既存の候補の順序を保ち、新しいタグを投稿数順で末尾に追加）。直接編集せず再生成してください。';
await writeFile(resolve(root, 'src/danbooru-options.ts'), [header, 'export const danbooruOptions: Record<string, string[]> = {', render(regular), '};', '// NSFWモード専用（成人・非露骨）の候補。', 'export const danbooruAdultOptions: Record<string, string[]> = {', render(adult), '};', '// 人気アーティスト（投稿数順）。', `export const danbooruArtists: string[] = [${artistRows.map(r => `'${r.replace(/\\/g, '\\\\')}'`).join(',')}];`, '// 絵柄タグ（投稿数順）。', `export const danbooruStyles: string[] = [${styleRows.map(r => `'${r.replace(/\\/g, '\\\\')}'`).join(',')}];`, ''].join(NL));
