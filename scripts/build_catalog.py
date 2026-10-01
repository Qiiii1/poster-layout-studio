#!/usr/bin/env python3
"""Render an offline contact sheet of the sixteen reconstructed layout structures."""
import argparse,html,json
from pathlib import Path
from build_editor import compile_css
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--output',required=True,type=Path);a=p.parse_args()
layouts=json.loads((ROOT/'assets/catalogs/layouts.json').read_text())['layouts']
parts=[]
for l in layouts:
 shapes=''.join(f'<i style="left:{g["x"]}px;top:{g["y"]}px;width:{g["w"]}px;height:{g["h"]}px;border-radius:{"50%" if g["shape"]=="ellipse" else "0"}"></i>' for g in l['referenceImageRegions'])
 words=''.join(f'<div class="text-layer" data-layer-id="{s["key"]}">{html.escape(l["sampleContent"][s["key"]])}</div>' for s in l['slots'])
 deco=''.join(f'<div style="position:absolute;left:{d["x"]}px;top:{d["y"]}px;width:{d["w"]}px;height:{d["h"]}px;border:{"1.5px solid #666" if d["type"]=="frame" else "none"};border-bottom:{"4px solid #666" if d["type"]=="arrow" else "1.5px solid #666"}">{"→" if d["type"]=="arrow" else ""}</div>' for d in l.get('referenceDecorations',[]))
 parts.append(f'<article><div class="thumbnail"><div class="poster-canvas reference-preview" data-layout="{l["id"]}">{shapes}{deco}{words}</div></div><h2><span>{l["id"][1:]}</span> {l["name"]}</h2><p>{l["description"]}</p></article>')
css=compile_css({'layouts':layouts})
page='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>16 种海报文字排版 · CSS 模板图谱</title><style>'+css+'''\n*{box-sizing:border-box}body{margin:0;background:#f5f5ee;color:#262b22;font-family:Arial,"PingFang SC",sans-serif}header{width:1080px;margin:0 auto;padding:36px 0 28px;display:flex;justify-content:space-between;align-items:flex-end}h1{font-size:25px;font-weight:600;margin:8px 0}small{font:10px monospace;letter-spacing:.16em;color:#6e7b63}header p{font-size:11px;line-height:1.8;color:#69715f;margin:0}main{width:1080px;margin:auto;display:grid;grid-template-columns:repeat(4,252px);gap:24px}.thumbnail{width:252px;height:336px;border:1px solid #ced4c4;overflow:hidden;background:white}.poster-canvas{transform:scale(.3333333333);transform-origin:top left;background:#fff;color:#080808}.text-layer{z-index:1}.poster-canvas i{position:absolute;background:#e5e5e3;display:block}h2{font-size:12px;margin:10px 0 5px;font-weight:500}h2 span{font:11px monospace;color:#738069;margin-right:7px}article p{font-size:10px;line-height:1.6;color:#858b7d;margin:0}footer{width:1080px;margin:26px auto;padding:18px 0;border-top:1px solid #d5dacd;font-size:10px;color:#79836e}a{color:inherit}@media print{body{background:white}header,main,footer{width:1080px}article{break-inside:avoid}}\n</style></head><body><header><div><small>POSTER STUDIO / TYPE SYSTEM</small><h1>16 种排版，同一张底图。</h1></div><p>参考图顺序：左 → 右，上 → 下<br>750 × 1000 px · 坐标与字号为视觉重建<br>灰色形状仅说明参考构图，不进入实际海报。</p></header><main>'''+''.join(parts)+'</main><footer>详细 CSS 和坐标表随 skill 提供。示例文案来自参考图及模板演示，不代表真实活动信息。　<a href="editor.html">打开编辑器 ↗</a></footer></body></html>'
a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(page);print(a.output.resolve())
