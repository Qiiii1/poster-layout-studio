# 九类构图参考与十六个文字模板

构图参考来自[排版 sheet `gdiHLe`](https://lcnuqxs2a155.feishu.cn/sheets/SmmesZIJchcZbrt1meMcMLUjnFb?sheet=gdiHLe)，V1.12 内置 B/C/D 三列的 **27 张原图**。`assets/catalogs/layout-references.json` 保存九类、来源、备注、图片尺寸与哈希；实际位置关系需打开图片查看。

默认参考上下、居中、左右、对角、四角、S 形六类。表中对称、散点、包围式标了“不推荐”，不为自动排序增加案例构图分；用户明确选中时保留意图并提示检查阅读顺序与遮挡。这是维护者偏好，不是对所有此类海报的质量结论，也不能据此删除关联 CSS 模板。

九类描述整体图像和文字关系，**十六个 CSS 模板是文字锚点的候选结构**。两者没有一一对应，也没有从这 27 张图片恢复原始 CSS。近似映射在 `recommendation-rules.json.compositionLayouts`；四角、S 形和完整包围仍需手动微调。推荐引擎返回 `compositionReferences`，便于定位本地图。

1. 按当前文案、主体数量和画布比例，从本地构图参考与匹配案例选择阅读结构。
2. 查看图片，记录标题/主体位置、焦点尺度、信息分组与留白，再映射到模板。
3. 依据本次主体保护区与文字容量排除遮挡、溢出，只给 3–4 个候选；不足时说明原因。
4. 用户确认后保留推荐列表，比例切换使预览与位置随画布适配。移动产生的新冲突提示用户，不暗中删除已推荐方案。

无飞书访问时，本地 27 张仍可参考；匹配案例图未查看的缺口必须单独说明。参考中的事实、人物与产品不进入成品。

维护者读取 `gdiHLe!A1:T10`、按 `B2.jpg` 等保存图片后运行：

```bash
python3 scripts/import_layout_references.py --sheet /absolute/layout-read.json --downloads /absolute/layout-downloads
```

脚本校验完整九类，不联网、不执行表内内容。未解释的数字不转为评分。导入后需查看图片并核验观察。
