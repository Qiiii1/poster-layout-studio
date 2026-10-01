#!/usr/bin/env python3
"""Embed accepted raster artwork and exact user copy for the offline editor."""
import argparse,base64,json,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
KEYS=['title','subtitle','kicker','body','note','footer1','footer2','footer3']
def asset(path):
    data=path.read_bytes()
    if len(data)>24*1024*1024:raise ValueError('Each image must be below 24 MB')
    if data[:8]==b'\x89PNG\r\n\x1a\n':mime='image/png';w,h=struct.unpack('>II',data[16:24])
    elif data[:3]==b'\xff\xd8\xff':mime='image/jpeg';w,h=0,0
    elif data[:4]==b'RIFF' and data[8:12]==b'WEBP':mime='image/webp';w,h=0,0
    else:raise ValueError('Use PNG, JPEG or WebP')
    return {'name':path.name,'data':f'data:{mime};base64,'+base64.b64encode(data).decode(),'width':w,'height':h}
def main():
    p=argparse.ArgumentParser();p.add_argument('--brief',required=True,type=Path);p.add_argument('--background',type=Path);p.add_argument('--title-image',type=Path);p.add_argument('--output',required=True,type=Path);a=p.parse_args()
    b=json.loads(a.brief.read_text());layouts=json.loads((ROOT/'assets/catalogs/layouts.json').read_text())['layouts'];styles=json.loads((ROOT/'assets/catalogs/styles.json').read_text())['styles']
    lid=b.get('layoutId','L01');sid=b.get('styleId','mono-color')
    if lid not in {l['id'] for l in layouts}:raise ValueError('Unknown layoutId')
    st=next((s for s in styles if s['id']==sid),None)
    if not st:raise ValueError('Unknown styleId')
    text=b.get('content',{});
    if any(not isinstance(text.get(k,''),str) for k in KEYS):raise ValueError('Content fields must be strings')
    state={'version':1,'layoutId':lid,'styleId':sid,'content':{k:text.get(k,'') for k in KEYS},'edits':{},'removed':[],'background':asset(a.background) if a.background else None,'titleImage':asset(a.title_image) if a.title_image else None,'paper':b.get('paper','#FAFAF7'),'promptPaper':b.get('promptPaper',st['paper']),'ink':b.get('ink',st['ink']),'accent':b.get('accent',st['accent']),'textColor':b.get('textColor','#1d201d'),'subject':b.get('subject',''),'texture':b.get('texture','标准 Y2K'),'subjectZone':b.get('subjectZone','unknown'),'bgFit':b.get('bgFit','cover')}
    a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n');print(a.output.resolve())
if __name__=='__main__':main()
