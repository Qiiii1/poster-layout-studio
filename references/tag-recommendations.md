# 标签与案例推荐

当前检索源为 cases-text.jsonl，1313 条清理后的 C、E–I 文字记录。来源字段及检索流程见 [case-retrieval.md](case-retrieval.md)。只用活动类型、受众、包含内容排序；输出近邻原行号、逐维命中与视觉建议分布。缺失或未知维度不冒充已知。

案例风格大类按 [local-style-skills.md](local-style-skills.md) 映射当前配方。运行目录不保留旧风格小类。风格、配色、构图同轮分别询问；明确选择优先于统计。

九种构图标签映射 L01–L09，仅提供相对关系，实际位置在整图生成中依据文案和图片决定。素材关键细节和文字可读性须查看最终图片，不由标签或坐标算法保证。

命令：`python scripts/retrieve_cases.py --brief brief.json --output matches.json`。完整字段、排名算法和限制见检索说明。
