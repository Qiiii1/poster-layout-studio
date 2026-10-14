# 文字案例检索

数据为飞书案例库 C、E–I 六列的2026-10-09快照，revision 5978，剔除异常第54行后1313条；无图片。检索源 assets/catalogs/cases-text.jsonl，来源见 cases-source.json。原表行号仅内部记录。

从资料识别活动类型、受众类型和包含内容；用原标签对齐，在素材理解确认卡明确展示三项并获得确认后再检索。查询只用本次已批准标签，未知维度不填，不以设计偏好倒灌查询。运行：
```text
python scripts/retrieve_cases.py --brief brief.json --observed-subject none --output matches.json
```
brief 示例：`{"selectedTags":{"eventType":["展览展示类"],"audience":["文化审美型"],"contentTypes":["活动名称/时间/地点","主题语/传播语"]}}`。

仅 C活动、E受众、F包含内容参与排序：各维度命中查询标签数/查询标签数，已提供维度等权平均；额外标签不扣分，缺失计零。默认返回八条、有重合才入选；并列按原行号稳定显示，建议统计包含边界同分案例。分数是标签覆盖率，不是概率或视觉相似度。

一次提取 G主体组织、H构图、I风格证据，缓存后供同轮选择。实际主体数量靠看图，以 single/multiple/none/unknown 记录，不被案例投票覆盖；“不能抠图”只是历史标签。输入匹配维度变化才重检索。没有完整匹配就说明部分匹配，不声称看过案例图，不把整库放入生成提示词。

风格排序另按 [固定判断顺序](recommendation-order.md)；案例票数不直接决定最佳风格。当前仅按六大风格映射配方，见 local-style-skills.md。
