#!/usr/bin/env python3
"""Build a self-contained offline HTML editor and explicit CSS catalog."""
import argparse,json,base64,mimetypes
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def compile_css(catalog):
    out=['/* Visual reconstruction; 750 × 1000 px; image regions are preview guides only. */', '.poster-canvas{position:relative;width:750px;height:1000px;overflow:hidden}', '.text-layer{position:absolute;box-sizing:border-box;margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font-family:"Arial Black","PingFang SC","Microsoft YaHei",sans-serif}']
    for l in catalog['layouts']:
        out.append('\n/* '+l['id']+' '+l['name']+' — '+l['description']+' */')
        for s in l['slots']:
            out.append(f'.poster-canvas[data-layout="{l["id"]}"] [data-layer-id="{s["key"]}"]'+'{'+f'left:{s["x"]}px;top:{s["y"]}px;width:{s["w"]}px;height:{s["h"]}px;font-size:{s["fontSize"]}px;line-height:{s["lineHeight"]};font-weight:{s["weight"]};font-family:{s["fontFamily"]};letter-spacing:{s["tracking"]}px;text-align:{s["align"]};writing-mode:'+('vertical-rl' if s.get('vertical') else 'horizontal-tb')+';text-orientation:mixed;}')
        for i,g in enumerate(l['referenceImageRegions']):
            out.append(f'.reference-preview[data-layout="{l["id"]}"] .image-guide-{i+1}'+'{position:absolute;'+f'left:{g["x"]}px;top:{g["y"]}px;width:{g["w"]}px;height:{g["h"]}px;background:#e5e5e3;border-radius:'+('50%' if g['shape']=='ellipse' else '0')+';}')
    return '\n'.join(out)+'\n'

def main():
    p=argparse.ArgumentParser();p.add_argument('--output',required=True,type=Path);p.add_argument('--project',type=Path,help='Optional poster-project.json containing approved content and embedded assets');p.add_argument('--write-css',action='store_true',help='Maintainer option: refresh bundled CSS catalog');args=p.parse_args()
    d=ROOT/'assets/editor';catalog=json.loads((ROOT/'assets/catalogs/layouts.json').read_text());css=compile_css(catalog)
    if args.write_css:(d/'templates.css').write_text(css)
    bundle={'catalog':catalog,'styles':json.loads((ROOT/'assets/catalogs/styles.json').read_text()),'templatesCSS':css,'runtimeCSS':(d/'vendor/layer-editor.css').read_text(),'runtimeJS':(d/'vendor/layer-editor.js').read_text()}
    if args.project:bundle['initial']=json.loads(args.project.read_text())
    shell=(d/'shell.html').read_text();shell=shell.replace('__SHELL_CSS__',(d/'shell.css').read_text()).replace('__BUNDLE__',json.dumps(bundle,ensure_ascii=False).replace('<','\\u003c')).replace('__APP_JS__',(d/'app.js').read_text().replace('</script','<\\/script'))
    args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(shell)
    print(args.output.resolve())
if __name__=='__main__':main()
