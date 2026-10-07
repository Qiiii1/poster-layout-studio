#!/usr/bin/env python3
"""Extract representative colors from approved local images (requires Pillow)."""
import argparse,json
from pathlib import Path

def main():
    from PIL import Image,ImageOps
    p=argparse.ArgumentParser();p.add_argument('--image',type=Path,required=True);p.add_argument('--output',type=Path,required=True);p.add_argument('--source-name',default='用户素材');a=p.parse_args()
    with Image.open(a.image) as original:
        im=ImageOps.exif_transpose(original).convert('RGBA');im.thumbnail((160,160))
        bins={}
        pixels=im.tobytes()
        for offset in range(0,len(pixels),4):
            r,g,b,alpha=pixels[offset:offset+4]
            if alpha<160:continue
            key=(r//32,g//32,b//32);count,sums=bins.setdefault(key,[0,[0,0,0]])
            bins[key][0]=count+1
            for i,v in enumerate((r,g,b)):sums[i]+=v
        colors=[];rgb_values=[]
        for count,sums in sorted(bins.values(),key=lambda x:-x[0]):
            rgb=[round(x/count) for x in sums]
            if any(sum((v-rgb[i])**2 for i,v in enumerate(prev))<1800 for prev in rgb_values):continue
            rgb_values.append(rgb);colors.append('#'+''.join(f'{v:02X}' for v in rgb))
            if len(colors)==6:break
    if not colors:raise ValueError('No visible pixels to sample')
    a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps({'colors':colors,'source':a.source_name[:200]},ensure_ascii=False,indent=2)+'\n');print(a.output.resolve())

if __name__=='__main__':main()
