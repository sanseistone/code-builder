import {
  createDoc,
  createSection,
  createParagraph,
  createImage,
  createVideo,
  createList,
  createProducts,
  createModal,
  createCta,
} from './types.js'

// ============================================================
// 内置模板
// 结构: doc = { title, includeStyle, toc, blocks[] }
// 区块内文本支持行内标记：
//   **粗体**   __下划线__   ==高亮==   [文字](链接)
//   换行 → <br>
// ============================================================

// 从 demo.html 完整还原的 KumaDoll 处置指南文章
function kumaDisposalTemplate() {
  return createDoc({
    title: 'ラブドール 処分 方法',
    includeStyle: true,
    toc: { enabled: true, title: '目次', mode: 'auto', items: [] },
    blocks: [
      createImage({
        src: 'https://www.kuma-doll.com/image/article/6/01.webp',
        alt: 'ラブドール 処分 方法 回収サービス',
        width: '1400',
        height: '855',
        banner: true,
      }),
      createParagraph({
        text: '寿命や破損、重量の負担、買い替え、生活環境の変化など、ラブドールを手放したい、手放さなければならないタイミングがいつかは訪れます。',
      }),
      createParagraph({
        text: '人の形を持ち、”モノ”以上の日常の一部だったラブドールを手放す際、心理的な抵抗を感じることは珍しくありません。方法を検索するにも、”処分”という言葉に違和感を抱くこともあるかと思います。',
      }),
      createParagraph({
        text: '本記事では、__1,000体以上のラブドールの「里帰り」__をサポートしてきた **KumaDoll（クマドール）** が、ラブドールの”送り出し方”について、注意点や現実的な選択肢を解説します。',
      }),

      createSection({
        id: 'item1',
        level: 2,
        title: '不法投棄・野焼きの法的リスクと危険性',
        children: [
          createParagraph({
            text: 'まず、法的に明確な点を簡潔に整理します。不法投棄は廃棄物処理法第25条により「5年以下の懲役または1,000万円以下の罰金、もしくはその併科」の対象となります。',
          }),
          createParagraph({
            text: 'また、ラブドールに使用されるTPEやシリコンは、不完全燃焼時に有害物質を含む煙を発生させる可能性があります。野焼きは、法律や条令で禁止されており、上記の廃棄物処理法第25条の罰則の対象となります。',
          }),
          createParagraph({
            text: 'これらは、安全面、法的・社会的、そしてドーラー的にも、推奨できる選択肢ではありません。ラブドール販売者としてKumaDoll のご提供する選択肢も後でご紹介します。',
          }),
        ],
      }),

      createSection({
        id: 'item2',
        level: 2,
        title: '自治体サービスでの処分',
        children: [
          createParagraph({
            text: '家庭ごみ、粗大ごみとして出すことは不可能ではありませんが、受付方法、上限サイズ、重量制限、持込可否、指定袋代・粗大ごみ処理券などの実費など自治体ごとに異なりますので、事前に確認が必要です。',
          }),
          createParagraph({
            text: '家庭ごみとして袋で出す場合、解体して家庭ごみ用の袋に分けるにも、ラブドールはTPEやシリコン、カッターやハサミでは切断できない金属の骨格など複数素材で構成されています。細かくしようとするほど作業量・危険性・精神的負担が大きくなります。また、袋の外から人の部位に見えてしまい、誤認通報や近隣トラブルのリスクもあります。',
          }),
          createParagraph({
            text: '箱に入れたとしても、重量やサイズによって回収可否は自治体の判断に委ねられます。回収を拒否される可能性もゼロではありません。最後の思い出として様々なリスクや負担がかかってきてしまう形となりますので、家庭ごみでの処分は避けた方がいいでしょう。',
          }),
          createParagraph({
            text: '自治体サービスの利用では、回収場所までの搬出の負担がありますが、粗大ごみが基本です。詳細は自治体により異なりますが、粗大ごみ受付センターへ事前に連絡し、シールの記載内容、添付方法をご相談ください。',
          }),
        ],
      }),

      createSection({
        id: 'item3',
        level: 2,
        title: '個人間取引',
        children: [
          createParagraph({
            text: '知人間、ネットサービスいずれにおいても、個人間取引ではキャンセル、返品、配送時破損、支払いトラブルなどの責任がすべて当事者間の問題になります。ネットサービスでは掲載写真のほか、使用状況に関する質問などのやり取りの中でプライバシー露出のリスクがあります。精神的、時間的な負担を見積もった上で、注意して進める必要があるでしょう。',
          }),
        ],
      }),

      createSection({
        id: 'item4',
        level: 2,
        title: '買取サービスの利用',
        children: [
          createParagraph({
            text: '人気ブランドのリアルドールで、状態が良く、購入履歴と付属品が揃っていれば、買取サービスの利用も選択肢になりえます。買取対象外となることもありますが、軽微な損傷や汚れは修復して販売可能となる場合がありますので、事業者に相談してみるのもいいでしょう。',
          }),
        ],
      }),

      createSection({
        id: 'item5',
        level: 2,
        title: '不用品回収業者の利用',
        children: [
          createParagraph({
            text: '搬出をお任せできる手軽さや即日対応などがメリットとなる一方、違法業者による不法投棄や高額請求が問題になる場合も指摘されており、料金の確認を含む事業者の選定が重要となります。また、中身を隠すとトラブルになるリスクがあり、品目がラブドールであることを伝える必要があります。',
          }),
        ],
      }),

      createSection({
        id: 'item6',
        level: 2,
        title: 'ラブドール代理店の「里帰り」サービス利用',
        children: [
          createParagraph({
            text: 'KumaDoll を含む一部の[**ラブドール代理店**](https://www.kuma-doll.com)では、**「里帰り」**というラブドールの回収サービスをご提供しています。信頼できる提携の処理業者にて、人目に触れることなく、法令を遵守した適切な方法で責任をもって最後まで対応しております。\nKumaDoll では、心理的負担の軽さ、プライバシー、簡便さの観点を重視し、お客様に発送いただく「里帰り」をご用意しています。いずれもリアルドールへの感謝と梱包をお済ませいただきましたら、あとは安心して送り出し、プロにお任せいただけます。',
          }),
        ],
      }),

      createSection({
        id: 'item6-1',
        level: 3,
        inToc: false, // 该章节不进入目次（与 demo.html 一致）
        title: 'お客様に発送いただく「里帰り」',
        children: [
          createProducts({
            items: [
              {
                href: 'https://www.kuma-doll.com/product-p1451616.html',
                img: 'https://www.kuma-doll.com/image/products/1451616/m-01.webp',
                alt: 'ダッチワイフ 処分',
                title: '里帰りサービス ラブドールの処分＆引き取り',
                price: '15,000 円(税込)',
                width: '600',
                height: '900',
              },
            ],
          }),
          createList({
            ordered: false,
            items: [
              { text: '対象：購入先やメーカー不問。不要になったドールをお引き取り。' },
              {
                text: '料金：\n無償引き取りサービス：当店購入者様のみ、1体まで送料のみご負担で無料（購入後3ヶ月以内）。\n有償引き取りサービス：他店購入者様も可、1体あたり15,000円＋送料。',
              },
              {
                text: '流れ：\n1.利用希望者はメールで連絡、または KumaDoll ストア内サービスページからご決済。\n2.KumaDoll から送付先案内が届きます。\n3.お客様にてダンボールをご用意の上ドールを梱包。\n4.指定送付先に発送。佐川急便様の集荷サービスもご利用いただけます。',
              },
            ],
          }),
        ],
      }),

      createSection({
        id: 'item7',
        level: 2,
        title: '後悔しない“送り出し”のために',
        children: [
          createParagraph({
            text: 'ラブドールの送り出しには様々な選択肢がありますが、費用のほか、心理的負担、法的リスク、手間、時間、プライバシーなど、総合的に判断する必要があります。しかしその判断は必ずしも計画的に行えるとは限りません。急を要する場面が発生した場合には、知識不足や焦りによって、不適切な手段を選択してしまうこともありえます。\n事前に信頼できる事業者と選択肢を把握し状態に応じた最適な方法を理解しておくことが、リスク回避と同時に大事なラブドールの最善の送り出し方につながります。KumaDoll は[**ラブドール**](https://www.kuma-doll.com)の販売者、専門家として、最後までサポートいたします。',
          }),
        ],
      }),
    ],
  })
}

// 从 demo-01.html 还原的 IronAI 功能介绍文章
// 额外用到三种新区块：视频 / PDF 弹窗 / CTA 按钮，以及段落内包裹的图片
function ironaiTemplate() {
  return createDoc({
    title: 'IronAI Bionic VaginaX とは',
    includeStyle: true,
    toc: { enabled: true, title: '目次', mode: 'auto', items: [] },
    blocks: [
      createImage({
        src: '/image/cup/2026/09/01/6a964f4b2bf5c.webp',
        alt: 'IronAI Bionic VaginaX機能',
        width: '1470',
        height: '800',
        banner: true,
      }),
      createParagraph({
        text: 'ラブドールの電動機能は、温感・振動・音声など、これまで「それぞれの機能を個別に操作する」という仕組みが一般的でした。',
      }),
      createParagraph({
        text: 'Irontech Dollが発表した「IronAI Bionic VaginaX（バイオニック・ヴァジャイナX）」は、こうした従来型の電動機能から一歩進み、センサーによって動きの変化を検知し、それに合わせて各機能が自動的に反応することを目指した新しいシステムです。',
      }),
      createParagraph({
        text: '今回は、Irontech DollのAIシステム「IronAI」の中でも注目度の高いBionic VaginaXについて、その仕組みや主な機能、従来の電動機能との違い、使用する際の注意点までKumaDollが分かりやすく解説します。',
      }),

      createSection({
        id: 'item1',
        level: 2,
        title: '**IronAI Bionic VaginaXとは？**',
        children: [
          createParagraph({
            text: 'IronAI Bionic VaginaXは、Irontech Dollが開発したセンサー連動型のインタラクティブシステムです。',
          }),
          createParagraph({
            text: '大きな特徴は、あらかじめ設定された動作を単純に繰り返すのではなく、**内蔵センサーで動きや変化を検知し、その状態に応じて各機能を自動的に反応させる**という点にあります。',
          }),
          createParagraph({ text: 'Irontech Doll公式情報では、主に以下のような機能が組み合わされています。' }),
          createParagraph({ text: '・センサーによる動きの検知' }),
          createParagraph({ text: '・動きに合わせた自動的な締め付け反応' }),
          createParagraph({ text: '・振動機能' }),
          createParagraph({ text: '・温感機能' }),
          createParagraph({ text: '・インタラクションに連動した音声フィードバック' }),
          createParagraph({ text: '・アプリによる感度・強度調整' }),
          createParagraph({
            text: 'つまり、単純に「電動機能が増えた」というよりも、**複数の機能をセンサーと制御システムによって連動させたこと**がBionic VaginaXのポイントです。',
          }),
          createParagraph({ text: '下記の動画はirontechdoll社長のLeoさんの紹介です、是非ご覧ください。' }),
          createVideo({
            src: 'https://www.kuma-doll.com/video/cup/2026/09/01/6a96706677cf1.mp4',
            mime: 'video/mp4',
            wrapP: true,
          }),
        ],
      }),

      createSection({
        id: 'item2',
        level: 2,
        title: '**従来の電動機能との違い**',
        children: [
          createParagraph({ text: '従来型の電動機能ラブドールでは、' }),
          createParagraph({ text: '「温感機能をONにする」' }),
          createParagraph({ text: '「振動機能をONにする」' }),
          createParagraph({ text: '「強度を選択する」' }),
          createParagraph({
            text: 'といったように、ユーザーが各機能を個別に操作するタイプが一般的でした。',
          }),
          createParagraph({ text: 'Bionic VaginaXでは、この考え方が少し異なります。' }),
          createParagraph({ text: '**「設定された動作」から「状況に応じた反応」へ**' }),
          createParagraph({
            text: '内蔵されたセンサーが動きの頻度や速度などを検知し、その変化に合わせてシステム側が反応します。',
          }),
          createParagraph({
            text: 'そのため、一定の強度で動作し続けるだけではなく、使用状況の変化に合わせて反応を変化させることが、このシステムの大きな特徴となっています。',
          }),
          createParagraph({ text: 'これはIrontech DollがIronAIで進めている、' }),
          createParagraph({ text: '**「機能を操作する」から「ドールが反応する」へ**' }),
          createParagraph({
            text: 'という方向性を象徴する機能のひとつと言えるでしょう。',
          }),
        ],
      }),

      createSection({
        id: 'item3',
        level: 2,
        title: '**IronAI CoreAIとの接続**',
        children: [
          createParagraph({
            text: 'Bionic VaginaXを理解するうえで重要なのが、「IronAI CoreAI」です。',
          }),
          createParagraph({
            text: 'IronAI CoreAIは、IronAIシリーズにおける中核となる制御システムで、センサーから得られた情報と各種機能をつなぐ役割を担っています。',
          }),
          createParagraph({ text: 'Bionic VaginaXでは、' }),
          createParagraph({
            text: '**センサーによる検知→IronAI CoreAIによる制御→各機能が状態に応じて反応**',
          }),
          createParagraph({ text: 'という流れでシステムが構成されています。' }),
          createParagraph({
            text: 'そのため、Bionic VaginaXは単独で使用する機能ではなく、**IronAI CoreAIとの組み合わせが必要**です。',
          }),
          createParagraph({
            text: 'Bionic VaginaXは単体の電動オプションではありません。IronAI CoreAIと連携して動作するIronAIシステムの一部として設計されています。',
          }),
        ],
      }),

      createSection({
        id: 'item4',
        level: 2,
        title: '**Bionic VaginaXの主な機能**',
        children: [
          createImage({
            src: '/image/cup/2026/09/01/6a967f0801448.webp',
            alt: 'iron-ai主な機能',
            width: '1000',
            height: '750',
            wrapP: true,
          }),
          createParagraph({ text: '**1. センサーによるインタラクション検知**' }),
          createParagraph({
            text: 'Bionic VaginaXにはセンサーが搭載されており、使用中の動きや変化を検知します。',
          }),
          createParagraph({
            text: 'Irontech Dollによると、動きが検知されると各種レスポンス機能が作動し、動きが検知されない場合にはアイドル状態へ移行する仕組みも採用されています。',
          }),
          createParagraph({
            text: 'これにより、従来の「スイッチを入れたら一定の動作を続ける」という方式とは異なる制御が可能になっています。',
          }),
          createParagraph({ text: '**2. 動きに応じた自動レスポンス**' }),
          createParagraph({
            text: 'システムは動きの頻度や速度などの変化を検知し、それに合わせて締め付けの反応を自動的に変化させます。',
          }),
          createParagraph({
            text: '毎回同じパターンで動作するのではなく、検知した動きに合わせてレスポンスを変化させることを目的とした設計です。',
          }),
          createParagraph({ text: '**3. 温感機能**' }),
          createParagraph({ text: 'Bionic VaginaXには温感機能も搭載されています。' }),
          createParagraph({ text: 'メーカー公表値では、温度はおよそ33℃～44℃' }),
          createParagraph({ text: 'の範囲で上昇・維持される設計となっています。' }),
          createParagraph({
            text: '単純に高温にするのではなく、一定範囲内で温度をコントロールする仕組みです。',
          }),
          createParagraph({ text: '**4. 振動機能**' }),
          createParagraph({ text: 'センサーと連携した振動機能も搭載されています。' }),
          createParagraph({
            text: 'Bionic VaginaXでは、振動を独立した機能として搭載するだけでなく、IronAIシステムのレスポンス機能のひとつとして統合している点が特徴です。',
          }),
          createParagraph({ text: '**5. 音声フィードバック**' }),
          createParagraph({ text: '使用中の状態に合わせた音声フィードバックにも対応しています。' }),
          createParagraph({
            text: '音量は調整可能で、必要がない場合はミュートにすることもできます。',
          }),
          createParagraph({
            text: '音声をOFFにしても、その他のBionic VaginaX機能は引き続き利用できます。',
          }),
        ],
      }),

      createSection({
        id: 'item5',
        level: 2,
        title: '**Dollia Appで好みに合わせて調整可能**',
        children: [
          createParagraph({
            text: '自動レスポンスだけではなく、ユーザー自身で設定を変更できることもBionic VaginaXの特徴です。',
          }),
          createParagraph({ text: '専用の「Dollia App」を利用することで、' }),
          createParagraph({ text: '・締め付けの強さ' }),
          createParagraph({ text: '・センサー感度' }),
          createParagraph({ text: 'などを調整できます。' }),
          createParagraph({
            text: '自動制御にすべて任せるのではなく、基本的な反応の強さを自分の好みに合わせて調整し、その設定をもとにシステムを使用できる仕組みになっています。',
          }),
          createParagraph({
            text: 'また、メーカーによると直近の設定は記憶され、次回使用時にも反映されます。',
          }),
        ],
      }),

      createSection({
        id: 'item6',
        level: 2,
        title: '**使用開始までの流れ**',
        children: [
          createParagraph({
            text: 'Irontech Dollが案内している基本的なセットアップは比較的シンプルです。',
          }),
          createParagraph({ text: '**STEP 1　デバイスを接続**' }),
          createParagraph({ text: 'まずIronAI関連デバイスを正しく接続します。' }),
          createParagraph({ text: '**STEP 2　Dollia Appとペアリング**' }),
          createParagraph({ text: 'スマートフォンなどからDollia Appと接続します。' }),
          createParagraph({ text: '**STEP 3　各種設定を調整**' }),
          createParagraph({ text: '感度や強度などを好みに合わせて設定します。' }),
          createParagraph({ text: '**STEP 4　使用開始**' }),
          createParagraph({
            text: '設定完了後、センサーが動きを検知するとシステムが状態に応じて反応します。',
          }),
          createModal({
            modalId: 'pdfModal',
            btnClass: 'btn btn-primary',
            btnText: 'IronAI Bionic VaginaXの取扱説明書（PDF）',
            title: 'IronAI Bionic VaginaXの取扱説明書（PDF）',
            src: 'https://www.kuma-doll.com/image/blog/ironai-bionic-vaginax.pdf',
            size: 'modal-xl',
          }),
        ],
      }),

      createSection({
        id: 'item7',
        level: 3,
        title: '**使用前に確認しておきたいポイント**',
        children: [
          createParagraph({ text: '**Bionic VaginaXを利用するにはIronAI CoreAIが必要です。**' }),
          createParagraph({
            text: 'Bionic VaginaXだけを追加すれば、すべてのIronAI機能が使用できるというわけではありません。',
          }),
          createParagraph({
            text: '購入時には対応するIronAI構成を確認することをおすすめします。',
          }),
          createParagraph({ text: '**防水ではなくIPX4の防滴仕様**' }),
          createParagraph({
            text: '電子機器を内蔵しているため、お手入れ方法にも注意が必要です。',
          }),
          createParagraph({
            text: 'メーカー公表ではIPX4の防滴仕様となっており、日常的な水しぶきなどを想定した設計ですが、水中に沈めることはできません。',
          }),
          createParagraph({
            text: '特に電子部品、接続端子、制御システムなどを水に浸さないよう注意が必要です。',
          }),
          createParagraph({ text: '**AI会話機能とは別のシステム**' }),
          createParagraph({
            text: 'IronAIには「IronAI TalkX」というAI会話サービスもありますが、Bionic VaginaXの基本機能とは別に扱われています。',
          }),
          createParagraph({
            text: 'Bionic VaginaXの基本的なレスポンス機能を使用するためにサブスクリプション契約は必要ありません。',
          }),
          createParagraph({
            text: '一方、IronAI TalkXや一部のプレミアムAI機能を利用する場合には、別途サブスクリプションが必要になります。',
          }),
          createParagraph({
            text: 'また、メーカーによるとBionic VaginaXのインタラクション機能が動作している間はAI Talkが一時停止し、終了後に一定の時間をおいて再び利用可能になります。',
          }),
        ],
      }),

      createSection({
        id: 'item8',
        level: 3,
        title: '**IronAIが目指している「次世代ラブドール」とは？**',
        children: [
          createParagraph({
            text: '**Bionic VaginaXで注目したいのは、個々の機能以上にラブドールの電動機能に対する考え方が変わり始めていることです。**',
          }),
          createParagraph({
            text: 'これまでは、温度感、振動、音声、電動機能といった機能を追加していくで進化してきました。',
          }),
          createParagraph({ text: 'IronAIでは、それらを単純に増やすだけではなく、' }),
          createParagraph({
            text: '**センサーで状態を検知する→制御システムが判断する→複数の機能を連動させる**',
          }),
          createParagraph({ text: 'という方向へ進化しています。' }),
          createParagraph({
            text: 'つまり今後のAIラブドールでは、「どれだけ多くの機能を搭載しているか」だけではなく、それぞれの機能がどのようにつながり、どのように反応するのかが重要になってくる可能性があります。',
          }),
          createParagraph({
            text: 'Bionic VaginaXは、その方向性を分かりやすく示したIronAIの新機能と言えるでしょう。',
          }),
        ],
      }),

      createSection({
        id: 'item9',
        level: 3,
        title: '**よくある質問**',
        children: [
          createParagraph({ text: '**Q. Bionic VaginaXだけで使用できますか？**' }),
          createParagraph({
            text: 'Bionic VaginaXはIronAI CoreAIとの連携を前提としたシステムです。そのため、対応するIronAI構成が必要になります。',
          }),
          createParagraph({ text: '**Q. サブスクリプションへの加入は必要ですか？**' }),
          createParagraph({ text: 'Bionic VaginaXの基本機能にはサブスクリプションは必要ありません。' }),
          createParagraph({
            text: 'AI会話サービス「IronAI TalkX」や関連するプレミアムAI機能を利用する場合は、別途サブスクリプションが必要です。',
          }),
          createParagraph({ text: '**Q. 温度はどのくらいまで上がりますか？**' }),
          createParagraph({
            text: 'メーカー公表では、およそ33℃～44℃の範囲で温度を上昇・維持する設計です。',
          }),
          createParagraph({ text: '**Q. 強さを自分で変更できますか？**' }),
          createParagraph({
            text: 'はい。Dollia Appから締め付けの強さやセンサー感度などを調整できます。',
          }),
          createParagraph({ text: '**Q. 水洗いできますか？**' }),
          createParagraph({
            text: 'メーカー公表ではIPX4の防滴仕様です。水しぶきには一定の耐性がありますが、完全防水ではなく、水中に沈めることはできません。電子部品や端子部分を濡らさないよう、メーカー指定のお手入れ方法に従ってください。',
          }),
        ],
      }),

      createSection({
        id: 'item10',
        level: 3,
        title: '**まとめ**',
        children: [
          createParagraph({
            text: 'Irontech DollのIronAI Bionic VaginaXは、従来のように温感・振動などを個別に動作させるだけではなく、**センサーによる検知とIronAI CoreAIによる制御を組み合わせ、使用状況に応じて複数の機能を連動させる**システムです。',
          }),
          createParagraph({ text: '主なポイントは、' }),
          createParagraph({ text: '・センサーによる動きの検知' }),
          createParagraph({ text: '・動きに応じた自動レスポンス' }),
          createImage({
            src: '/image/cup/2026/09/01/6a967f770ba7f.webp',
            alt: 'センサー検知と自動レスポンス',
            width: '1000',
            height: '670',
            wrapP: true,
          }),
          createParagraph({ text: '・約33℃～44℃の温感機能' }),
          createImage({
            src: '/image/cup/2026/09/01/6a967f9ae65ca.webp',
            alt: '温度機能',
            width: '1000',
            height: '670',
            wrapP: true,
          }),
          createParagraph({ text: '・振動機能' }),
          createParagraph({ text: '・音声フィードバック' }),
          createImage({
            src: '/image/cup/2026/09/01/6a967faea8b55.webp',
            alt: 'フィーとバック',
            width: '1000',
            height: '670',
            wrapP: true,
          }),
          createParagraph({ text: '・Dollia Appによる感度・強度調整' }),
          createImage({
            src: '/image/cup/2026/09/01/6a967fbc4b450.webp',
            alt: '',
            width: '1000',
            height: '670',
            wrapP: true,
          }),
          createParagraph({ text: '・IronAI CoreAIとの接続' }),
          createParagraph({ text: 'などです。' }),
          createParagraph({
            text: '単に電動機能を追加するのではなく、**「操作する機能」から「状況を検知して反応する機能」へ進化していること**が、Bionic VaginaXの最も大きな特徴と言えるでしょう。',
          }),
          createParagraph({
            text: 'KumaDollでは今後も、AIラブドールやセンサー技術、電動機能など、ラブドール業界で登場する新しい技術・機能について分かりやすくご紹介していきます。',
          }),
        ],
      }),

      createCta({
        text: 'Irontech Dollの商品一覧を見る',
        href: 'https://www.kuma-doll.com/Category-c45553.html',
        className: 'cta-btn',
        wrapP: true,
      }),
    ],
  })
}

// 空白模板（自定义母版起点）
function blankTemplate() {
  return createDoc({
    title: '新規記事',
    includeStyle: true,
    toc: { enabled: true, title: '目次', mode: 'auto', items: [] },
    blocks: [
      createImage({ banner: true, alt: '' }),
      createParagraph({ text: 'ここに導入文を入力します。' }),
      createSection({
        id: 'item1',
        level: 2,
        title: '章タイトル',
        children: [createParagraph({ text: '' })],
      }),
    ],
  })
}

export const TEMPLATES = [
  { id: 'blank', name: '空白模板（自定义）', make: blankTemplate },
  { id: 'kuma-disposal', name: 'Demo 常规内容', make: kumaDisposalTemplate },
  { id: 'kuma-ironai', name: 'Demo - 包含视频/PDF/CTA', make: ironaiTemplate },
]

export function makeTemplate(id) {
  const t = TEMPLATES.find((x) => x.id === id) || TEMPLATES[0]
  return t.make()
}
