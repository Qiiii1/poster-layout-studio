# Poster Layout Studio V1.0

海报生成与排版 Skill：一张无字底图，配合可独立编辑的文字与 16 种 CSS 排版模板。

## 流程

读取素材与文案 → 推荐风格 → **用户确认风格** → 预览兼容版式 → **用户确认排版** → 生成底图 → 视觉自检查 → HTML 编辑与排版微调 → PNG 导出。

- 风格：Mono-color、Y2K、Gathered Scenes。
- 两项 human gate 均确认后才能生成底图；用户已明确指定或授权代选时不重复询问。
- 切换模板保留底图与文案；不同模板需检查文字容量及主体遮挡。
- 支持文字编辑、拖动、缩放、撤销、项目保存，以及成稿和纯底图分别导出 PNG。
- 默认画布 750 × 1000；支持 1×、2×、3× 导出。

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

文案结构见 [project-contract.md](references/project-contract.md)。HTML 离线运行，图像生成与视觉检查由 Codex 完成。系统字体可能因设备不同而改变排版。

## 来源与限制

- [来源说明](references/provenance.md)
- [风格处理说明](references/style-adapters.md)
- bundled editable-design runtime 的 Apache-2.0 授权文件保留于 `assets/editor/vendor/LICENSE`，此授权仅适用于对应第三方代码。
- 排版模板为参考图片的视觉重建，不是原始 CSS。
- 仓库不含原始用户图片、案例成稿或第三方风格 skill 的原文与示例图。

## 验证

`scripts/verify_editor.mjs` 用于浏览器验证，依赖 editable-design 的 `_browser.mjs`；可通过第三个命令行参数指定该运行器路径。构建编辑器本身不依赖此测试运行器。
