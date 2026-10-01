# 16 种文字排版模板

编号对应参考图从左到右、从上到下。画布 750 × 1000 px。所有值均为视觉重建，非原始 CSS。

| 编号 | 模板 | 结构 | 建议文字留白 |
|---|---|---|---|
| L01 | 上下居中 | 顶部短引题、中段图像、底部主副标题与说明。 | top-bottom |
| L02 | 中轴圆形 | 顶部长标题，中心圆形图像，细密说明沿中轴递减。 | top-bottom |
| L03 | 顶部错位双栏 | 主副标题分别占据顶部两栏，正文形成中部双栏。 | top |
| L04 | 对角呼应 | 左上英文引题与右中主标题形成对角，说明居下。 | corners |
| L05 | 边框环绕 | 大字从左上阶梯展开，两侧形成竖向信息轨道。 | frame |
| L06 | 左上双重标题 | 左上主标题与横向副标题交错，说明分布于右下。 | top-right |
| L07 | 左标题右引导 | 左上竖叠标题、右上辅助引题，正文分组靠右。 | top-right |
| L08 | 顶部括号标题 | 宽标题置顶，中心说明与横幅图像依次展开。 | top-bottom |
| L09 | 阶梯标题右下图 | 标题逐级向右展开，正文左下与图像错开。 | top-left |
| L10 | 左侧长竖排 | 主副标题合为左侧竖向书脊，其余信息沿窄栏排列。 | left |
| L11 | 中部横题凹口图 | 横向主标题下方为凹口式图片区域，说明分为左右两栏。 | top-bottom |
| L12 | 竖向标题双圆 | 左上双列竖标题与右侧竖引题，信息落在右下。 | top-left |
| L13 | 圆形之间的文字 | 主标题右上，英文引题左中，正文右下，形成三点节奏。 | corners |
| L14 | 三段图像底部大字 | 顶部两端标题，三段横向图像，以底部超大英文收尾。 | top-bottom |
| L15 | 大刊头与图内注释 | 大刊头在顶，副标题紧随，正文落入图像的上下边缘。 | top-bottom |
| L16 | 大字横压信息底栏 | 顶部双层强标题，右侧短说明，底部用边框容纳长说明。 | top |

完整机器可读参数见 `../assets/catalogs/layouts.json`；完整 CSS 见 `../assets/editor/templates.css`。

## 使用规则

- 图片位置、裁切和像素不会随模板切换而变化。
- 灰色区域只用于说明原参考图的构图，不进入实际成品。
- 先检查字数、换行与底图主体位置，再推荐 2–3 个可用模板。
- capacity 是初步内容密度分级，不是经过字体测量的字数保证。
- 竖排不适合很长的英文单词；横向标题对长度有明确限制。
- 原图中的多图、双圆等形状不能靠移动文字在任意底图上重现。
- 不为强行适配而擅自删除用户文案或无限缩小字号。

## L01 上下居中

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| kicker | 70 | 28 | 610 | 193 | 58 | 1.12 | 800 | center | horizontal-tb |
| title | 40 | 607 | 670 | 108 | 82 | 1.08 | 900 | center | horizontal-tb |
| subtitle | 30 | 716 | 690 | 104 | 79 | 1.08 | 900 | center | horizontal-tb |
| body | 45 | 836 | 660 | 63 | 27 | 1.12 | 500 | center | horizontal-tb |
| note | 54 | 902 | 642 | 27 | 18 | 1.12 | 500 | center | horizontal-tb |
| footer1 | 24 | 933 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 933 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 933 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L02 中轴圆形

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| title | 30 | 28 | 690 | 115 | 83 | 1.08 | 900 | center | horizontal-tb |
| kicker | 155 | 146 | 440 | 100 | 30 | 1.12 | 700 | center | horizontal-tb |
| body | 142 | 692 | 466 | 108 | 21 | 1.12 | 500 | center | horizontal-tb |
| note | 173 | 813 | 404 | 48 | 29 | 1.12 | 500 | center | horizontal-tb |
| subtitle | 50 | 872 | 650 | 40 | 28 | 1.08 | 700 | center | horizontal-tb |
| footer1 | 24 | 933 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 933 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 933 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L03 顶部错位双栏

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| title | 24 | 24 | 399 | 274 | 96 | 1.08 | 900 | left | horizontal-tb |
| subtitle | 431 | 29 | 295 | 270 | 90 | 1.08 | 900 | right | horizontal-tb |
| kicker | 24 | 303 | 700 | 49 | 17 | 1.12 | 500 | left | horizontal-tb |
| body | 24 | 483 | 338 | 107 | 32 | 1.12 | 500 | left | horizontal-tb |
| note | 478 | 483 | 245 | 107 | 32 | 1.12 | 500 | left | horizontal-tb |
| footer1 | 24 | 933 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 933 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 933 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L04 对角呼应

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| kicker | 27 | 24 | 319 | 320 | 55 | 1.12 | 800 | left | horizontal-tb |
| note | 365 | 35 | 351 | 97 | 16 | 1.12 | 500 | left | horizontal-tb |
| title | 412 | 348 | 304 | 221 | 87 | 1.08 | 900 | right | horizontal-tb |
| subtitle | 186 | 574 | 513 | 120 | 80 | 1.08 | 900 | center | horizontal-tb |
| body | 140 | 772 | 486 | 130 | 18 | 1.12 | 500 | center | horizontal-tb |
| footer1 | 24 | 933 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 933 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 933 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L05 边框环绕

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| title | 21 | 10 | 530 | 311 | 130 | 1.08 | 900 | left | horizontal-tb |
| kicker | 412 | 32 | 310 | 123 | 26 | 1.12 | 700 | right | horizontal-tb |
| body | 29 | 330 | 47 | 445 | 18 | 1.04 | 500 | left | vertical-rl |
| note | 669 | 165 | 57 | 665 | 32 | 1.04 | 500 | left | vertical-rl |
| subtitle | 12 | 875 | 723 | 108 | 73 | 1.08 | 900 | center | horizontal-tb |
| footer1 | 24 | 812 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 812 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 812 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L06 左上双重标题

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| title | 13 | 16 | 536 | 132 | 96 | 1.08 | 900 | left | horizontal-tb |
| kicker | 548 | 30 | 178 | 110 | 20 | 1.12 | 700 | right | horizontal-tb |
| subtitle | 139 | 157 | 594 | 154 | 85 | 1.08 | 900 | left | horizontal-tb |
| body | 337 | 478 | 378 | 95 | 32 | 1.12 | 500 | center | horizontal-tb |
| note | 412 | 692 | 309 | 108 | 30 | 1.12 | 500 | center | horizontal-tb |
| footer1 | 24 | 933 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 933 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 933 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L07 左标题右引导

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| title | 27 | 19 | 256 | 260 | 110 | 1.08 | 900 | left | horizontal-tb |
| kicker | 298 | 27 | 429 | 189 | 45 | 1.12 | 800 | left | horizontal-tb |
| subtitle | 49 | 352 | 229 | 145 | 43 | 1.08 | 800 | center | horizontal-tb |
| body | 295 | 437 | 432 | 105 | 30 | 1.12 | 500 | left | horizontal-tb |
| note | 295 | 589 | 408 | 184 | 18 | 1.12 | 500 | left | horizontal-tb |
| footer1 | 24 | 933 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 933 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 933 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L08 顶部括号标题

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| title | 22 | 27 | 706 | 226 | 80 | 1.08 | 900 | center | horizontal-tb |
| subtitle | 108 | 318 | 534 | 105 | 38 | 1.08 | 600 | center | horizontal-tb |
| kicker | 118 | 423 | 514 | 49 | 18 | 1.12 | 500 | center | horizontal-tb |
| body | 48 | 766 | 315 | 104 | 20 | 1.12 | 500 | left | horizontal-tb |
| note | 426 | 766 | 282 | 104 | 20 | 1.12 | 500 | left | horizontal-tb |
| footer1 | 24 | 933 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 933 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 933 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L09 阶梯标题右下图

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| title | 20 | 22 | 349 | 128 | 101 | 1.08 | 900 | left | horizontal-tb |
| kicker | 375 | 31 | 352 | 98 | 23 | 1.12 | 700 | left | horizontal-tb |
| subtitle | 231 | 157 | 496 | 153 | 83 | 1.08 | 900 | left | horizontal-tb |
| body | 23 | 570 | 303 | 253 | 34 | 1.12 | 500 | left | horizontal-tb |
| note | 30 | 319 | 280 | 207 | 66 | 1.12 | 800 | left | horizontal-tb |
| footer1 | 24 | 933 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 933 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 933 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L10 左侧长竖排

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| title | 22 | 19 | 224 | 249 | 104 | 1.08 | 900 | left | horizontal-tb |
| subtitle | 25 | 273 | 121 | 330 | 88 | 1.04 | 900 | left | vertical-rl |
| kicker | 247 | 24 | 187 | 90 | 17 | 1.12 | 500 | left | horizontal-tb |
| body | 30 | 632 | 374 | 190 | 22 | 1.12 | 500 | left | horizontal-tb |
| note | 244 | 208 | 172 | 287 | 19 | 1.12 | 500 | left | horizontal-tb |
| footer1 | 24 | 933 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 933 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 933 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L11 中部横题凹口图

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| kicker | 33 | 25 | 300 | 64 | 19 | 1.12 | 500 | left | horizontal-tb |
| title | 30 | 110 | 690 | 145 | 95 | 1.08 | 900 | center | horizontal-tb |
| subtitle | 354 | 302 | 350 | 187 | 24 | 1.08 | 600 | left | horizontal-tb |
| body | 35 | 709 | 312 | 145 | 23 | 1.12 | 500 | left | horizontal-tb |
| note | 429 | 709 | 289 | 145 | 23 | 1.12 | 500 | left | horizontal-tb |
| footer1 | 24 | 933 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 933 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 933 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L12 竖向标题双圆

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| title | 28 | 18 | 107 | 492 | 91 | 1.04 | 900 | left | vertical-rl |
| subtitle | 139 | 18 | 107 | 450 | 91 | 1.04 | 900 | left | vertical-rl |
| kicker | 265 | 147 | 76 | 382 | 24 | 1.04 | 500 | left | vertical-rl |
| body | 282 | 604 | 429 | 98 | 31 | 1.12 | 500 | left | horizontal-tb |
| note | 281 | 746 | 419 | 166 | 18 | 1.12 | 500 | left | horizontal-tb |
| footer1 | 24 | 933 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 933 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 933 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L13 圆形之间的文字

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| title | 220 | 22 | 509 | 106 | 86 | 1.08 | 900 | left | horizontal-tb |
| subtitle | 221 | 126 | 508 | 100 | 76 | 1.08 | 900 | left | horizontal-tb |
| kicker | 50 | 289 | 367 | 284 | 58 | 1.12 | 800 | left | horizontal-tb |
| body | 424 | 618 | 304 | 80 | 27 | 1.12 | 500 | left | horizontal-tb |
| note | 288 | 728 | 436 | 165 | 18 | 1.12 | 500 | left | horizontal-tb |
| footer1 | 24 | 933 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 933 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 933 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L14 三段图像底部大字

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| title | 18 | 21 | 288 | 80 | 69 | 1.08 | 900 | left | horizontal-tb |
| subtitle | 392 | 21 | 338 | 80 | 60 | 1.08 | 800 | right | horizontal-tb |
| kicker | 29 | 801 | 585 | 146 | 118 | 1.12 | 900 | left | horizontal-tb |
| body | 29 | 113 | 39 | 201 | 17 | 1.04 | 500 | left | vertical-rl |
| note | 674 | 369 | 39 | 229 | 17 | 1.04 | 500 | left | vertical-rl |
| footer1 | 24 | 951 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 951 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 951 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L15 大刊头与图内注释

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| title | 24 | 12 | 537 | 146 | 122 | 1.08 | 900 | left | horizontal-tb |
| kicker | 572 | 24 | 154 | 101 | 18 | 1.12 | 700 | right | horizontal-tb |
| subtitle | 102 | 159 | 627 | 108 | 58 | 1.08 | 800 | center | horizontal-tb |
| body | 31 | 282 | 567 | 107 | 37 | 1.12 | 500 | left | horizontal-tb |
| note | 345 | 632 | 380 | 120 | 36 | 1.12 | 500 | left | horizontal-tb |
| footer1 | 24 | 933 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 933 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 933 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |

## L16 大字横压信息底栏

| 字段 | x | y | 宽 | 高 | 字号 | 行高 | 字重 | 对齐 | 方向 |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| kicker | 20 | 27 | 461 | 65 | 22 | 1.12 | 500 | left | horizontal-tb |
| title | 22 | 92 | 706 | 123 | 100 | 1.08 | 900 | left | horizontal-tb |
| subtitle | 22 | 216 | 706 | 133 | 96 | 1.08 | 900 | left | horizontal-tb |
| note | 474 | 365 | 240 | 134 | 27 | 1.12 | 500 | right | horizontal-tb |
| body | 30 | 810 | 692 | 153 | 18 | 1.12 | 500 | left | horizontal-tb |
| footer1 | 24 | 737 | 270 | 45 | 17 | 1.15 | 500 | left | horizontal-tb |
| footer2 | 338 | 737 | 90 | 45 | 17 | 1.15 | 500 | center | horizontal-tb |
| footer3 | 457 | 737 | 269 | 45 | 17 | 1.15 | 500 | right | horizontal-tb |
