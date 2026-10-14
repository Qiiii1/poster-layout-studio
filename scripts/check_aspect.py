import argparse, json
from math import gcd, isfinite
from PIL import Image

def check(width, height, a, b, target_width=None, target_height=None, tolerance_percent=5.0):
    if min(width,height,a,b)<=0: raise ValueError('尺寸和比例必须为正数')
    if not isfinite(tolerance_percent) or tolerance_percent<0:
        raise ValueError('比例容差必须是有限非负数')
    g=gcd(width,height)
    error=abs(width*b-height*a)/(height*a)*100
    orientation_matches=(a==b or (width>height and a>b) or (width<height and a<b))
    acceptable=orientation_matches and error<=tolerance_percent
    pixels=None if target_width is None and target_height is None else (
        (target_width is None or width==target_width) and
        (target_height is None or height==target_height))
    return {'actual_pixels':[width,height], 'actual_ratio':f'{width//g}:{height//g}',
      'orientation':'横版' if width>height else '竖版' if width<height else '方形',
      'target_ratio':f'{a}:{b}', 'exact_ratio':width*b==height*a,
      'relative_error_percent':round(error,6),
      'tolerance_percent':tolerance_percent, 'orientation_matches':orientation_matches,
      'acceptable_ratio':acceptable, 'exact_pixels':pixels,
      'accepted':acceptable and pixels is not False}

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('image'); p.add_argument('--ratio',required=True)
    p.add_argument('--width',type=int); p.add_argument('--height',type=int)
    p.add_argument('--tolerance-percent',type=float,default=5.0,
                   help='允许的相对比例偏差百分比，默认5；明确要求精确比例时设为0')
    args=p.parse_args()
    a,b=map(int,args.ratio.replace('：',':').replace('/',':').split(':'))
    with Image.open(args.image) as im: result=check(*im.size,a,b,args.width,args.height,args.tolerance_percent)
    print(json.dumps(result,ensure_ascii=False,indent=2))
