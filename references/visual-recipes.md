# 扩展视觉配方

## 使用边界

只提取来源中的媒介、形状、材料、色彩和层级方法。来源完整工作流中的字号、比例、固定主体数量、模型选择、安装命令、推广文案、额外门禁和输出方式不进入本 skill。底图仍无标题与正文；主体和艺术标题按照用户选择分别生成可移动图层。提示词脚手架、照片要求和逐项检查在 `assets/catalogs/styles.json`。

这些配方是按用户标签整理的独立视觉描述。原始下载材料保存在任务工作区，不混入可安装包。来源 URL、提交版本及下载状态见 `assets/catalogs/source-registry.json`。某些来源有独立的使用限制；复用其原文、代码或示例时应读取原始许可。

## 路线表

使用每条路线前，查看 `styles.json.referenceImages` 中对应的 C 列本地参考图，并按 [风格参考图的使用](style-image-references.md) 记录观察结果。图片帮助解释视觉处理；主体、配色、布局和标题仍按本次用户确认执行。

| 大类 | 视觉小类 | styleId | 图像处理重点 |
| --- | --- | --- | --- |
| 中国风（东方水墨） | 书卷编排风 | oriental-editorial | 一处材料证据、明确轴线、局部中断和克制留白 |
| 中国风（东方水墨） | 山水氛围风 | landscape-ink | 将来源结构转成墨色层次、轮廓与空间间隔 |
| 中国风（东方水墨） | 静物留白风 | still-life-ink | 一件器物或意象、纸面、湿墨与局部干笔 |
| 趣味风（拼贴） | 拼贴图鉴风 | specimen-collage | 保留实际素材名单，以尺度差、重叠与切纸边缘组织 |
| 趣味风（拼贴） | 纸感印刷风 | paper-print | 提炼照片的主动作和重复节奏，选择一种主要印刷工艺 |
| 趣味风（拼贴） | 纸感印刷风的实景变体 | gathered-scenes | 保留摄影锚点，再连接稀疏图形与窄撕纸边缘 |
| 趣味风（拼贴） | 插画叙事风 | narrative-illustration | 一个叙事关系，一种主媒介和一种有限辅助工艺 |
| 简约风 | 轻插画风 | minimal-illustration | 一次小型视觉事件、大面积纸面、结构性强调色 |
| 简约风 | 单器物风 | single-object | 用一件器物的轮廓、材料或裁切集中注意力 |
| 简约风 | 图文秩序风 | editorial-order | 图像窗口、线块和材料分区支持真实信息层级 |
| 简约风 | 图文秩序风的冷白套印变体 | cool-riso | 冷白纸面、清晰平涂、克制错位与活动信息预留区 |
| 赛博风 | 霓虹动感风 | y2k | 来源主体、连续硬描边、与姿态关联的撞色爆破形 |
| 赛博风 | 数码界面风 | digital-interface | 位图切面、共享网格、局部扫描线和信号位移 |
| 赛博风 | 数码界面风的喷绘变体 | neon-blue | 近黑留白、分层电光喷绘、选择性柔边和微小随机颗粒 |
| 赛博风 | 超现实风 | surreal-pop | 原场景中一次可解释的尺度或语义反转 |
| 学术风（ascii风格） | 数字科技风 | ascii-tech | 在 ASCII、抖动、网点中选择一种主要明暗编码 |
| 学术风（ascii风格） | 学术板报风 | academic-board | 信息主导，背景仅有少量线块；依据用户表格备注补充 |
| 学术风（ascii风格） | 实验文化风 | experimental-culture | 局部故障、色阶断裂或位移，保留识别锚点 |
| 复古风（油印） | 套色油印风 | mono-color | 一至两种油墨、纸面透出、网点与局部套印 |
| 复古风（油印） | 旧报刊编排风 | newspaper-print | 新闻纸、局部粗网点和渗墨，文字仍使用 HTML 网格 |
| 复古风（油印） | 复古装饰插画风 | retro-illustration | 手绘不规则、平涂、干笔、装饰图案与丝印肌理 |

## 具体处理与来源

### 东方与简约

书卷路线从材料特性建立视觉关系，不自动加古建筑、印章或古纸。山水路线优先提取主题的线势、面、开口和层次；文化元素需有输入依据。静物路线保留可辨认的器物结构，留白比例服从文字容量，不把源配方里的超小主体尺寸硬套到本模板。

来源：[东方文化编辑](https://github.com/dacnay816y62-hub/fantasy-dongfang-jianyuehaibao)、[中国风结构转译](https://github.com/dacnay816y62-hub/chinese-poster-skill)、[水墨配方](https://github.com/TwentyfiveBTea/ink-wash-poster)、[地域文化结构](https://github.com/dacnay816y62-hub/regional-culture-poster)。地域字符或材料字体只能在标题 HumanGate 后用于独立艺术标题。

轻插画只用一个主题关系，不填充成完整场景。单器物通过来源材料改变裁切和重心。图文秩序使用少量图像字段，避免模型生成伪标签和长段假字。标题需要保持独立，不能照搬来源中图字共生的整张位图输出。

来源：[Sparse Zine](https://github.com/langrenlibai/poster-forge-deluxe)、[Minimal Zine](https://github.com/LiamGvchi/gc-minimal-zine-poster)、[Photo Riso](https://github.com/luckdvr/photo-riso-poster)、[文化碎片](https://github.com/wendenchina-beep/culture-fragment-poster-engine)、[Poster Generator](https://github.com/howardz27/poster-generator-skill)、[营造](https://github.com/op7418/guizang-yingzao-skill)。

`cool-riso` 来自表内 [N11 自定义附件](https://lcnuqxs2a155.feishu.cn/sheets/SmmesZIJchcZbrt1meMcMLUjnFb?sheet=Plpjbx&range=N11)，已下载并读取。把实际图像的轴线、重复、开口、遮挡或反射概括成清晰印刷形状，在用户确认的冷白或淡蓝灰纸面上使用少量平涂油墨、受控网点和轻微错位。第三种油墨只有配色已明确确认时才加入；编辑器默认配色只指定主色与强调色。为主标题和活动信息保留可用空间，减少整张场景的逐边描摹，避免发黄做旧和蜡笔粉彩。源文件的完整图片输出、默认 4:5 与固定标题占比不覆盖本 skill 的分层输出、画布选择和模板主标题槽。

### 拼贴与叙事

图鉴保留确认的主体数量，建立大小差和局部遮挡；透明素材各自独立，不固定为五件、九件或某个来源模板。纸感印刷先提炼轮廓与节奏，再选网点、复印或套印中的一种主工艺。实景变体保留摄影部分。叙事插画从源场景提取一个清楚的关系，调整至少一处尺度、位置或图底关系；必要时明确哪一个材质过程只用于辅助区域。

来源：[Collage Design](https://github.com/polgarp/collage-design)、[文物拼贴](https://github.com/Starryear/S.013-Starryear-Artifact-collage)、[HeiGe Poster Lab](https://github.com/HeiGeAi/HeiGe-poster-lab)、[Zine Poster](https://github.com/jas0nh/zine-poster-skill)、[Halftone Riso Pop](https://github.com/Zhang-ym92/halftone-riso-pop)、[Scene to Art Lab](https://github.com/N1kO724/scene-to-art-lab)。Gathered Scenes 的原有处理说明仍在 `style-adapters.md`。

### 赛博与数字实验

Y2K 按原有配方检查身份、轮廓、质感和装饰数量。数码界面使用硬切面和共享网格，允许局部 CRT 扫描语言；表格中的靛蓝网点来源是邻近材料参考，它本身不属于霓虹路线，因此不能把其禁止霓虹的限色规则混入 CRT 或 Y2K。只在用户选择靛蓝版画变体时使用细网点表达消散、交叉网纹表达深度，并确认限色色卡。

超现实只设置一次源场景相关的变化，不按示例习惯添加鲸鱼、红日等物件。ASCII 字符可作为图像明暗纹理，所有真实标题、时间和说明仍是独立文字。抖动、半色调和故障仓库是图像工具，不能描述成已经接入的可调用 skill；当前只吸收其静态视觉方法，编辑器不会自行运行它们。

来源：[Y2K](https://github.com/koinu32/y2k-pop-poster)、[CRT](https://github.com/TaiT-tt/tait-crt-interface-skill)、[靛蓝网点](https://github.com/NeekChaw/indigo-riso-poster-skill)、[超现实波普](https://github.com/2998980-hue/surreal-pop-collage)、[Ditherlab](https://github.com/jjanousek/dither_app)、[Halftone](https://github.com/Trolzie/halftone)、[Halftone Dots](https://github.com/haaarshsingh/halftone-dots)、[Glitch Generator](https://github.com/JMMonte/glitch-generator)、[DitherMe](https://github.com/joshuavanderpoll/DitherMe)。

表格把 [霓虹蓝插画](https://redskill.xiaohongshu.net/install.md) 放在数码界面风下，但实际素材是一种数字喷绘处理。保留为独立 `neon-blue` 路线，不与 CRT 网格、Y2K 硬描边或写实镀铬混合。保留来源主体的结构、数量和视角；用近黑核心、深蓝过渡、向形体内部扩散的宽阔青蓝底光、少量冰白高光塑造体积。细颗粒集中在过渡区，保持随机、微小且独立；边缘有明暗变化，避免整圈发亮。倒影低亮度且结构模糊。蓝黑配色需要颜色 HumanGate；其他色相应说明是改编变体，不能承诺符合原蓝色规范。抠图模式的主体光晕属于透明主体层；倒影如随主体移动则与主体成组，不能烘焙在空底图形成第二个主体。

从商店公开接口下载的 v1.0.0 压缩包已校验 SHA-256，并读取实际 `SKILL.md` 和 `references/style-spec.md`。只提取视觉方法，原文件不进入安装包；没有执行商店安装脚本。来源固定中央占比和两阶段脚本不适用于所有文字模板，此处构图服从用户确认的模板并检查完整主体、光晕和倒影的边界。

学术板报只有表格中的背景与排版备注，配方明确标为 `catalog-note`，不冒充完整来源实现。

### 油印、报刊与装饰插画

油印沿用 Mono-color 的一至两块油墨，强调色不能暗中成为第三种油墨。报刊采用局部新闻纸和网点，正文依然可读、可编辑；原来源主要处理文字，不据此声称自动保留原照片。装饰插画提取确认的物件，用不规则手绘色块和图案概括，并保持每件对象可辨认；不继承素材合集的固定九宫格或尺寸。艺术标题的字形处理需要独立生成和逐字检查。

来源：[Mono-color](https://github.com/yanliudesign/mono-color-skill)、[The Lamplighter](https://github.com/starinzlob/the-lamplighter)、[Mondo Poster](https://github.com/joeseesun/qiaomu-mondo-poster-design)、[手帐物件转绘](https://github.com/emmaCCdesign/make-journal-material-skill)。不把来源中的具名艺术家模仿指令默认带入提示词。

## 自检查

每条路线按 `styles.json.checks` 在完整尺寸和缩略尺寸检查。共同检查文字预留区域、素材身份与数量、主次关系、没有烘焙标题正文。 cutout 模式分别检查透明主体及无主体底图；素材身份应由对应的来源图保持，不能因为抽象方法默认把真人变成匿名剪影。需要这种变化时先与用户确认。按现有修复上限，只自动纠正一次具体缺陷。
