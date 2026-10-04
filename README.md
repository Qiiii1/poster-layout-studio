# Poster Layout Studio V1.6

海报生成与排版 Skill：依据标签推荐风格和文字结构，生成无字底图，配合可独立编辑的文字与 16 种 CSS 排版模板。

## 流程

读取素材与文案 → 确认多图组织（适用时）→ 确认主体抠图或完整背景 → 确认风格 → 确认配色 → 确认初始排版 → 确认普通或艺术标题 → 分层生成 → 视觉自检查 → HTML 编辑 → PNG 导出。

- 标签：52 个基础选项、六个风格大类、18 个视觉小类；推荐可参考 1,318 条有标签的案例，并说明命中标签和原表行号。
- 风格：21 条处理路线，保留 Mono-color、Y2K、Gathered Scenes，增加东方、拼贴、简约、数码、学术与复古处理，以及独立的霓虹蓝喷绘和冷白套印变体。
- 标签只更新推荐。点击候选才选择风格或排版，现有素材、文案和已确认配色保持可编辑。
- 所有适用的 Human Gate 确认后才能生成；用户已明确指定或授权代选时不重复询问。
- 支持多个透明主体图层独立移动、缩放；艺术标题单独生成，改字需要重新生成图片。
- 切换模板保留底图、文案和主体位置；艺术标题框跟随模板。不同模板需检查文字容量及主体遮挡。
- 竖版画布：2:3（800 × 1200）、4:5（800 × 1000）、3:4（750 × 1000，默认）；支持 1×、2×、3× 导出。
- 支持撤销、工程保存；海报 PNG 包含所有图层，底图 PNG 排除主体与文字/标题图层。

## 安装

将本仓库放入 Codex skills 目录的 `poster-layout-studio` 文件夹，入口为 [SKILL.md](SKILL.md)。

```bash
git clone https://github.com/Qiiii1/poster-layout-studio.git ~/.codex/skills/poster-layout-studio
```

如果该目录已存在，先保留或备份已有版本。

## 本地构建编辑器

需要 Python 3。仅预览模板：

```bash
python3 scripts/build_editor.py --output output/editor.html
```

使用已生成的底图与文案：

```bash
python3 scripts/prepare_project.py --brief /absolute/brief.json --background /absolute/background.png --output output/project.json
python3 scripts/build_editor.py --project output/project.json --output output/editor.html
```

使用 `--subject-image`（可重复）加入透明主体，用 `--title-image` 加入艺术标题。

文案结构见 [project-contract.md](references/project-contract.md)。HTML 离线运行，图像生成与视觉检查由 Codex 完成。系统字体可能因设备不同而改变排版。

## 标签推荐

命令行推荐需要 Node.js；与编辑器使用同一推荐引擎。

```bash
node scripts/recommend.mjs --brief /absolute/brief.json --output output/recommendations.json
```

输入维度、别名、案例依据和数据更新方法见 [标签推荐说明](references/tag-recommendations.md)。原始照片状态会影响可用候选；多图组织、抠图、配色、初始排版和艺术标题仍通过 HumanGate 确认。

## 来源与限制

- [来源说明](references/provenance.md)
- [风格处理说明](references/style-adapters.md)
- [扩展视觉配方](references/visual-recipes.md)
- [来源与下载状态](assets/catalogs/source-registry.json)
- bundled editable-design runtime 的 Apache-2.0 授权文件保留于 `assets/editor/vendor/LICENSE`，此授权仅适用于对应第三方代码。
- 排版模板为参考图片的视觉重建，不是原始 CSS。
- 案例索引仅用于标签关联；没有自动分析案例图片，也不把推荐分数当作审美评分。S 形、四角、完整包围构图需要在相近模板上手动调整。
- 仓库不含原始用户图片、案例成稿或第三方风格 skill 的原文与示例图。

## 验证

`scripts/verify_editor.mjs` 用于浏览器验证，依赖 editable-design 的 `_browser.mjs`；可通过第三个命令行参数指定该运行器路径。构建编辑器本身不依赖此测试运行器。

V1.6 已验证标签导入、推荐约束、旧工程兼容、标签保存，以及 2:3、4:5、3:4 的海报与底图 PNG 导出。新增风格配方每次实际生图仍需视觉自检查。
