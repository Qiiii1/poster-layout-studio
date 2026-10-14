import argparse, json
from math import gcd
from PIL import Image

def check(width, height, a, b, target_width=None, target_height=None):
    if min(width,height,a,b)<=0: raise ValueError('尺寸和比例必须为正数')
    g=gcd(width,height)
    return {'actual_pixels':[width,height], 'actual_ratio':f'{width//g}:{height//g}',
      'orientation':'横版' if width>height else '竖版' if width<height else '方形',
      'target_ratio':f'{a}:{b}', 'exact_ratio':width*b==height*a,
      'relative_error_percent':round(abs(width*b-height*a)/(height*a)*100,6),
      'exact_pixels':None if target_width is None and target_height is None else
        (target_width is None or width==target_width) and (target_height is None or height==target_height)}

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('image'); p.add_argument('--ratio',required=True)
    p.add_argument('--width',type=int); p.add_argument('--height',type=int); args=p.parse_args()
    a,b=map(int,args.ratio.replace('：',':').replace('/',':').split(':'))
    with Image.open(args.image) as im: result=check(*im.size,a,b,args.width,args.height)
    print(json.dumps(result,ensure_ascii=False,indent=2))
