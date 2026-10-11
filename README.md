# Poster Layout Studio V1.12.2

根据用户的素材与文案推荐风格、配色和排版，确认选择后生成独立图层，并交付可编辑 HTML 与 PNG。

## 本版内容

- 六条优化风格：山水氛围风、拼贴图鉴风、轻插画风、超现实风、数字科技风、套色油印风。原风格记录用于打开旧工程。
- 包内携带 20 张风格参考图、27 张构图参考图、9 类构图、16 个 CSS 文字模板及 1,313 条案例标签快照。
- 风格和排版建议说明素材、标签、参考图与案例依据；初始排版筛选 3–4 个兼容方案。素材不适合时允许更少的候选。
- HumanGate 提问使用真实选择按钮。适用时确认多图组织、主体呈现、抠图清单、联网补充、风格、配色和初始排版。艺术标题默认单独生成，用户明确要求普通文字时遵从。
- 对输入素材和最终海报进行文化语境审核；素材取色形成配色建议，联网元素由用户选择后补充。
- 底图、透明主体、艺术标题和文字独立移动、缩放。切换文字排版保留底图、主体素材和手动位置，艺术标题重新适配标题槽；拖动、字体更换和比例切换保留推荐列表，新的遮挡会显示提示。
- 水平文字按实际可见字形边缘对齐；新艺术标题去除透明外边，按自然比例沿标题槽的左、中或右对齐线定位。
- 主图采用更大的默认尺度，支持近景、偏心和局部出框。新主体使用兼容空区；提供「按字形对齐」和每次 25% 的「放大主图」，可撤销。
- 六种系统字体组合及本地字体导入。竖版比例支持 2:3、3:4、4:5；海报和纯底图分别导出 1×、2×、3× PNG。

## 安装与运行条件

将完整仓库或解压后的 `poster-layout-studio` 文件夹安装到宿主的 skill 目录。保留 `SKILL.md`、`assets/`、`references/`、`scripts/` 和 `agents/`。

当前 Codex 本机目录的安装示例；其他宿主按其配置选择目录：

```bash
git clone https://github.com/Qiiii1/poster-layout-studio.git ~/.codex/skills/poster-layout-studio
```

若目标目录已经存在，先备份已有版本。也可以在 [Releases](https://github.com/Qiiii1/poster-layout-studio/releases/latest) 下载完整 ZIP。

| 能力 | 所需条件 |
| --- | --- |
| 理解文案、查看素材、生成图片与语义审核 | 能读取本地文件并提供图片查看/生成能力的 AI 宿主 |
| HumanGate 按钮选择 | 宿主原生交互提问，或按规则提供真实的 HTML 选择面板 |
| 构建 HTML 编辑器 | Python 3；构建脚本使用标准库 |
| 命令行标签推荐 | Node.js；推荐引擎使用本地包内文件 |
| HTML 编辑和 PNG 导出 | 现代浏览器；本版在 Chrome 155 验证 |
| Python 脚本提取素材配色 | Pillow；也可直接使用 HTML 中的素材取色按钮 |
| 读取飞书在线案例原图 | 可选：`lark-cli`、使用者自己的登录及文档/图片权限 |

本地风格参考、构图参考、标签索引和 CSS 模板不需要作者的飞书账号，也不需要另行安装来源风格 skill。飞书在线案例原图未批量打包；没有访问权限时使用本地材料继续推荐，并说明未查看的在线案例。飞书修改需要重新导入和发布版本才会进入下载包。

已生成的 HTML 包含工程图片、编辑器代码和导入字体，可离线打开；HTML 本身不调用图片模型。系统字体会随电脑变化，精确共享字形需嵌入有授权的字体。详情见 [换电脑使用](references/portability.md)。

## 开始使用

在支持本 skill 的 AI 宿主中提供素材和文案，例如：

> 使用 $poster-layout-studio，根据这张图片和活动信息生成海报。先用按钮让我选择主体处理方式、风格、素材配色和初始排版，再生成可编辑 HTML。

仅构建模板示例：

```bash
python3 scripts/build_editor.py --output output/editor.html
```

用已确认的文案和已生成的底图构建工程：

```bash
python3 scripts/prepare_project.py --brief /absolute/brief.json --background /absolute/background.png --output /absolute/poster-project.json
python3 scripts/build_editor.py --project /absolute/poster-project.json --output /absolute/editor.html
```

`--subject-image` 可重复加入独立主体，`--title-image` 加入艺术标题。结构和按钮行为见 [工程格式](references/project-contract.md)、[艺术标题](references/art-title-layers.md) 和 [光学对齐与尺度](references/optical-alignment.md)。直接用浏览器打开构建的 HTML 即可编辑。

标签推荐：

```bash
node scripts/recommend.mjs --brief /absolute/brief.json --output /absolute/recommendations.json
```

## 来源与验证

参考图、源单元格、哈希与观察分别记录在风格和构图参考清单中；图片保留来源标记。它们不继承软件运行时的授权。见 [来源说明](references/provenance.md)、[风格参考](references/style-image-references.md) 和 [构图参考](references/composition-references.md)。编辑运行时的 Apache-2.0 授权保留在 `assets/editor/vendor/LICENSE`。

V1.12.2 已检查六种风格、47 张本地图及其哈希、相对引用和 16 个模板加载。浏览器验证涵盖文字原生编辑、字体导入与导出、图层拖动、撤销、工程恢复、推荐保持及三个竖版比例。实际 PNG 像素检查覆盖中英文字形边缘、透明艺术标题对齐和主体放大；文化审核 hold 继续阻止导出。每次新生成的素材与组合仍需检查实际画面。

维护者浏览器验证脚本使用独立的 `_browser.mjs` 运行器，可传入自有路径。普通构建和使用已生成的 HTML 不依赖该验证运行器。
