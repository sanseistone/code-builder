import { createSection, createNote, createTags, createList, createListItem } from './types.js'

// ============================================================
// 内置模板配置（从 type-01 ~ type-04 提取）
// 结构: header(必选) → blocks(note/section 可增删) → date/footerNote/link(可选)
// ============================================================

export const TEMPLATES = [
  {
    id: 'type-01',
    name: 'type-01 · 8月特売セール',
    header: { icon: '🎉', title: '8月特売セール' },
    blocks: [
      createNote([
        '※ 対象：FANREAL フルシリコン製ラブドール',
        '※ シームレスタイプを除く',
        '※ FANREAL工場のヘッドをご選択の場合、2つ目のヘッドは無料となります。Graceシリーズのヘッドをご選択の場合は、＋75,000円で追加可能です。',
      ]),
      createSection({
        showNumber: true,
        title: '割引',
        discount: '10%OFF',
        children: [],
      }),
      createSection({
        showNumber: true,
        title: '無料特典',
        children: [
          createTags([
            '2個目ヘッド無料',
            '眉毛と睫毛の植毛',
            '足指ワイヤー',
            '新型球体指関節',
            'ヘッドリアルメイク',
            'ボディリアルメイク',
            'ROS機能*2',
            'EVO新骨格',
            'ハードハンド',
            'ハードフィート',
            'お尻の柔らか仕上げ',
            'ゼリー胸',
          ]),
        ],
      }),
      createSection({
        showNumber: true,
        title: 'オプション割引',
        children: [
          createList([
            createListItem({ name: '植毛（人工毛）', price: '20,000円', note: '（通常40,000円 → 半額）' }),
          ]),
        ],
      }),
    ],
    date: { text: '期間：2026年8月31日（月）23:59まで' },
  },
  {
    id: 'type-02',
    name: 'type-02 · 新作発売キャンペーン',
    header: { icon: '🎉', title: '新作発売キャンペーン' },
    blocks: [
      createSection({
        showNumber: true,
        title: '新作ヘッド＋任意ボディ',
        link: 'https://www.kuma-doll.com/gynoid-head-with-body-custom.html',
        discount: '12%OFF',
        children: [
          createNote(
            ['※ トルソーボディは対象外', '※「新作の怜儿」「井上優奈」「若依」ヘッドのみ'],
            true
          ),
          createList([
            createListItem({ name: 'Delux究極リアルボディ', price: '50,000円', note: '（通常100,000円 → 半額）' }),
            createListItem({ name: 'RS仕様（植眉）', price: '15,000円', note: '（通常30,000円 → 半額）' }),
            createListItem({ name: 'AP仕様（髪の毛植毛）', price: '60,000円', note: '（通常120,000円 → 半額）' }),
          ]),
        ],
      }),
      createSection({
        showNumber: true,
        title: 'ヘッド単体購入',
        link: 'https://www.kuma-doll.com/product-p1330426.html',
        discount: '8%OFF',
        children: [
          createList([
            createListItem({ name: 'RS仕様（植眉）', price: '15,000円', note: '（通常30,000円 → 半額）' }),
            createListItem({ name: 'AP仕様（髪の毛植毛）', price: '60,000円', note: '（通常120,000円 → 半額）' }),
            createListItem({ name: '高級ヘッドスタンド無料', price: '', note: '（新作「怜儿」ヘッド購入特典）', noteColor: 'red' }),
          ]),
        ],
      }),
    ],
    date: { text: '期間：2026年7月31日（金）23:59まで' },
  },
  {
    id: 'type-03',
    name: 'type-03 · 8月限定セール',
    header: { icon: '🎉', title: '8月限定セール' },
    blocks: [
      createNote(['※ 対象：TOP CYDOLL フルシリコンドール']),
      createSection({
        showNumber: true,
        title: '本体割引',
        discount: '5%OFF',
        children: [],
      }),
      createSection({
        showNumber: true,
        title: '無料特典',
        children: [
          createTags([
            '二つ目ヘッド（シリコンのみ）',
            'ROS口開閉機能（二つ目ヘッドも無料）',
            '人工毛の植毛（二つ目ヘッドも無料）',
            'ゼリ一胸',
            'お尻の柔らか仕上げ',
            'ハードハンド',
            'ボディ超リアルメイク',
            'ハードフィート',
            '新技術指関節',
            '膣の吸引電動機能',
          ]),
        ],
      }),
      createSection({
        showNumber: true,
        title: 'オプション割引',
        children: [
          createList([
            createListItem({ name: '可動足指', price: '10,000円', note: '（通常20,000円 → 半額）' }),
          ]),
          createNote(['※ 注意：167D・168F・176Eボディのみ対応']),
        ],
      }),
    ],
    date: { text: '期間：2026年8月31日（月）23:59まで' },
  },
  {
    id: 'type-04',
    name: 'type-04 · 夏セール',
    header: { icon: '🎉', title: '夏セール' },
    blocks: [
      createNote(['※ 対象：Irontech Doll フルシリコン製ラブドール']),
      createSection({
        showNumber: false,
        title: '無料特典',
        children: [
          createTags([
            '二つ目ヘッド',
            'ROS機能',
            'ROS-MAX機能',
            '新技術の骨格関節の手指',
            'S+メイク/S+ボディペイント',
            'ジェルお尻',
            'ヴァギナの柔らか仕上げ',
            'ゼリー胸',
            'ハードハンド',
            'ハードフィート',
            'EVO新骨格',
            '足指関節（応対モデルのみ）',
            '球体ジョイントボルト',
            'AI会話機能搭載・初回60分無料（以降有料）',
          ]),
        ],
      }),
      createNote(['※ 対象：Irontech Doll シリコンヘッドとTPEボディシリーズ']),
      createSection({
        showNumber: false,
        title: '無料特典',
        children: [
          createTags([
            '二つ目ヘッド',
            'EVO新骨格',
            'ゼリー胸',
            'シリコン製の舌',
            '新技術の骨格関節の手指',
          ]),
        ],
      }),
    ],
    date: { text: '期間：2026年8月31日（月）23:59まで' },
  },
]

// 创建空白模板（作为自定义母版起点）
export function createBlankTemplate() {
  return {
    id: 'custom',
    name: '自定义模板',
    header: { icon: '🎉', title: '新規キャンペーン' },
    blocks: [
      createSection({ showNumber: true, title: '割引', discount: '10%OFF', children: [] }),
    ],
    date: { text: '期間：2026年12月31日（木）23:59まで' },
  }
}
