// NSFWモード用の追加候補（成人・非露骨）。Danbooru のタグ名 → 日本語ラベル。
// 水着・ランジェリー・色気のある服装/ポーズ/表情/背景までに限り、露骨な性描写のタグは含めない。
export const adultTags = {
  outfit: {
    striped_bikini: 'ストライプビキニ', polka_dot_bikini: '水玉ビキニ', 'side-tie_bikini_bottom': 'サイドタイビキニ', string_bikini: 'ストリングビキニ',
    bikini_skirt: 'ビキニスカート', sailor_bikini: 'セーラービキニ', competition_swimsuit: '競泳水着', 'casual_one-piece_swimsuit': 'カジュアルワンピース水着',
    swimsuit_under_clothes: '服の下に水着', 'off-shoulder_bikini': 'オフショルダービキニ', halterneck_bikini: 'ホルタービキニ', frilled_swimsuit: 'フリル水着',
    flower_bikini: '花飾りのビキニ', strapless_bikini: 'バンドゥビキニ', bikini_under_clothes: '服の下にビキニ', lace_trim: 'レース飾り', thigh_strap: 'サイハイストラップ',
    choker: 'チョーカー', 'off-shoulder_dress': 'オフショルダーのワンピース', 'one-shoulder_dress': 'ワンショルダードレス', evening_gown: 'イブニングドレス',
    cocktail_dress: 'カクテルドレス', tight_dress: 'ボディコンドレス', open_jacket: 'ジャケットを羽織る', open_shirt: 'シャツをはだける', oversized_shirt: 'ぶかぶかのシャツ',
    dress_shirt: 'ワイシャツ', 'off-shoulder_shirt': 'オフショルダーシャツ', tied_shirt: '結んだシャツ', bike_shorts: 'バイクショーツ', yoga_pants: 'ヨガパンツ',
    high_heels: 'ハイヒール', stockings: 'ストッキング', fishnet_legwear: '網タイツ', bare_arms: '腕出し', bare_back: '背中出し', cleavage_cutout: '胸元カットアウト',
    navel_cutout: 'へそカットアウト', microskirt: 'マイクロミニスカート', 'criss-cross_halter': 'クロスホルター', halter_dress: 'ホルタードレス', ribbed_sweater: 'リブニット',
    crop_top_overhang: 'ゆるいクロップトップ', corset: 'コルセット', bustier: 'ビスチェ', garter_belt: 'ガーターベルト', silk: 'シルク地', satin: 'サテン地', lace: 'レース',
    velvet: 'ベルベット', leather: 'レザー', bunny_ears: 'バニーの耳', fake_animal_ears: 'ケモ耳カチューシャ', flower_hair_ornament: '花の髪飾り', sunglasses: 'サングラス',
    eyewear_on_head: '頭にサングラス', long_gloves: 'ロンググローブ', elbow_gloves: 'エルボーグローブ', 'over-kneehighs': 'オーバーニーソックス', black_pantyhose: '黒パンスト',
    white_thighhighs: '白ニーソ', black_thighhighs: '黒ニーソ', zettai_ryouiki: '絶対領域',
  },
  pose: {
    on_couch: 'ソファの上', on_chair: '椅子の上', sitting_on_table: 'テーブルに座る', lying_on_bed: 'ベッドに寝そべる', on_stomach: 'うつ伏せ', reclining: '横たわって寛ぐ',
    hair_over_shoulder: '肩に髪を流す', hand_on_own_stomach: 'お腹に手を当てる', hands_on_own_thighs: '両手を太ももに', arm_support: '片腕で体を支える',
    leaning_on_table: 'テーブルにもたれる', knees_to_chest: 'ひざを胸に', contrapposto: 'コントラポスト', 'pin-up_pose': 'ピンナップポーズ', hand_on_own_neck: '首に手を当てる',
    hand_on_own_collarbone: '鎖骨に手を当てる', hands_on_own_cheeks: '両手で頬を挟む', finger_to_cheek: '頬に指を当てる', chin_on_hand: '手に顎をのせる', legs_together: '脚を揃える',
    leg_up: '片脚を上げる', legs_crossed: '脚を交差させる', over_shoulder: '肩越し', sitting_on_windowsill: '窓辺に座る', lying_on_side: '横向きに寝る', sitting_on_sofa: 'ソファに座る',
    sitting_on_chair: '椅子に座る', holding_own_arm: '自分の腕を抱く', standing_on_one_leg: '片脚で立つ', sitting_on_stairs: '階段に座る', cat_pose: '猫のポーズ',
    wading: '水に浸かる', kneeling: 'ひざまずく', seiza: '正座', wariza: 'ぺたん座り', yokozuwari: '横座り',
  },
  expression: {
    blowing_kiss: '投げキッス', pursed_lips: 'すぼめた唇', one_eye_closed: '片目をつぶる', lipstick: '口紅', makeup: 'メイク', red_lips: '赤い唇', eyeshadow: 'アイシャドウ',
    eyeliner: 'アイライン', mascara: 'マスカラ', long_eyelashes: '長いまつげ', mole_under_eye: '目の下のほくろ', mole_under_mouth: '口元のほくろ', mole: 'ほくろ',
    glossy_lips: 'つやのある唇', smirk: '含み笑い', light_blush: 'ほんのり赤面', sleepy: '眠たげ', gentle_smile: '柔らかな微笑み', looking_at_viewer: 'カメラを見つめる',
    finger_to_mouth: '唇に指',
  },
  background: {
    couch: 'ソファ', hotel: 'ホテル', candle: 'キャンドル', bubble_bath: '泡風呂', hot_spring: '温泉(露天)', sauna: 'サウナ', night_view: '夜景', city_lights: '街の灯り',
    'bar_(place)': 'バー', cocktail: 'カクテル', wine_glass: 'ワイングラス', champagne_flute: 'シャンパングラス', yacht: 'ヨット', palm_tree: 'ヤシの木', sunbed: 'サンベッド',
    beach_umbrella: 'ビーチパラソル', spa: 'スパ', mirror: '鏡', 'shower_(place)': 'シャワー室', infinity_pool: 'インフィニティプール', water_drop: '水滴', lantern: 'ランタン',
    fireplace: '暖炉', rose_petals: 'バラの花びら', rose: 'バラ', table_lamp: '卓上ランプ', chandelier: 'シャンデリア',
  },
  lighting: {
    dim_lighting: '薄暗い照明', candlelight: 'ろうそくの灯り', neon_lights: 'ネオンの光', warm_colors: '暖色の光', sunset: '夕日の光', backlighting: '逆光', rim_lighting: '輪郭光',
    moonlight: '月明かり', window_light: '窓の光', light_rays: '光線', bloom: 'ブルーム', chiaroscuro: '明暗対比', lamp: 'ランプの灯り', spotlight: 'スポットライト',
  },
  framing: {
    from_below: '下から', from_above: '上から', from_behind: '後ろから', looking_back: '振り返り', pov: '主観視点', 'close-up': 'クローズアップ', foreshortening: '遠近強調',
    sideways_glance: '流し目', cropped_torso: '胴体を切る', cropped_legs: '脚を切る', selfie: '自撮り', from_side: '横から', back: '後ろ姿',
  },
};
