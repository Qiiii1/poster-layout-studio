#!/usr/bin/env python3
"""Authoritative geometry reconstruction. Unit: px on a 750 × 1000 canvas."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
F=['footer1','footer2','footer3']
def t(key,x,y,w,h,size=28,align='left',weight=500,**more):
    return dict(key=key,x=x,y=y,w=w,h=h,fontSize=size,lineHeight=1.08,align=align,weight=weight,tracking=0,**more)
def g(x,y,w,h,shape='rect'):
    return dict(x=x,y=y,w=w,h=h,shape=shape)
def foot(y=933):
    return [t('footer1',24,y,270,45,18),t('footer2',338,y, 90,45,18,'center'),t('footer3',457,y,269,45,18,'right')]
def make(n,name,desc,slots,guides,zone='mixed',capacity='medium',**more):
    return dict(id=f'L{n:02}',name=name,description=desc,canvas={'width':750,'height':1000},sourceCell={'row':(n-1)//4+1,'column':(n-1)%4+1},safeZone=zone,capacity=capacity,slots=slots+foot(more.pop('footerY',933)),referenceImageRegions=guides,**more)
L=[]
L.append(make(1,'上下居中','顶部短引题、中段图像、底部主副标题与说明。',[
t('kicker',70,28,610,184,62,'center',800),t('title',40,607,670,100,90,'center',900),t('subtitle',30,716,690,98,82,'center',900),t('body', 80,838,590,58,31,'center'),t('note',54,896,642,28,18,'center')],[g(40,235,670,335)],'top-bottom'))
L.append(make(2,'中轴圆形','顶部长标题，中心圆形图像，细密说明沿中轴递减。',[
t('title',30,28,690,111,94,'center',900),t('kicker',155,146,440,100, 30,'center',700),t('body',142,692,466,108,21,'center'),t('note',173,813,404,44,19,'center'),t('subtitle', 50,872,650, 40,28,'center',700)],[g(175,267,400,400,'ellipse')],'top-bottom','short'))
L.append(make(3,'顶部错位双栏','主副标题分别占据顶部两栏，正文形成中部双栏。',[
t('title',24,24,399,274,107,'left',900),t('subtitle',431,29,295,270,102,'right',900),t('kicker',24,303,700,40,21),t('body',24,483,338,107,32),t('note',478,483,245,107,32)],[g(0,620,750,306)],'top','short'))
L.append(make(4,'对角呼应','左上英文引题与右中主标题形成对角，说明居下。',[
t('kicker',27,24,333,320,65,'left',800),t('note',354,35,364,97,15),t('title',412,348,304,220, 90,'right',900),t('subtitle',186,574,513,118, 80,'center',900),t('body',140,772,486,130,18,'center')],[g(100,157,540,626,'ellipse')],'corners'))
L.append(make(5,'边框环绕','大字从左上阶梯展开，两侧形成竖向信息轨道。',[
t('title',21,10,530,280,159,'left',900),t('kicker',412,32,310,123,26,'right',700),t('body',29,160,47,545,20,vertical=True),t('note',669,165,57,665,32,vertical=True),t('subtitle',12,882,723,105,82,'center',900)],[g(81,293,570,560)],'frame','short',footerY=812,referenceOverrides={'title':'LAI\n CAI','body':'HERE WE ARE · I LIKE IT ON MY NECK','note':'我们这的憨佬仔／脖子上喜欢挂玉牌'}))
L.append(make(6,'左上双重标题','左上主标题与横向副标题交错，说明分布于右下。',[
t('title',13,16,536,130,105,'left',900),t('kicker',548,30,178,110, 20,'right',700),t('subtitle',139,157,594,147,97,'left',900),t('body',337,478,378,95,32,'center'),t('note',412,692,309,108, 30,'center')],[g(0,159,534,720)],'top-right','short'))
L.append(make(7,'左标题右引导','左上竖叠标题、右上辅助引题，正文分组靠右。',[
t('title',27,19,256,260,118,'left',900),t('kicker',298,27,429,165,59,'left',800),t('subtitle',49,352,229,145, 50,'center',800),t('body',295,437,432,105, 30),t('note',295,589,408,184,18)],[g(27,478,240,419)],'top-right',referenceDecorations=[{'type':'arrow','x':300,'y':229,'w':410,'h':32}]))
L.append(make(8,'顶部括号标题','宽标题置顶，中心说明与横幅图像依次展开。',[
t('title',22,27,706,216, 90,'center',900),t('subtitle',108,318,534,96, 40,'center',600),t('kicker',118,423,514,49,18,'center'),t('body',48,766,315,104,20),t('note',426,766,282,104,20)],[g(29,537,692,223)],'top-bottom','medium',referenceOverrides={'title':'(来财好运八方来)\n来财'}))
L.append(make(9,'阶梯标题右下图','标题逐级向右展开，正文左下与图像错开。',[
t('title',20,22,349,118,108,'left',900),t('kicker',375,31,352,98,23,'left',700),t('subtitle',231,145,496,160,91,'left',900),t('body',23,570,303,253,34),t('note',30,239,280,207,66,'left',800)],[g(336,501,390,392)],'top-left','medium',referenceOverrides={'title':'来财来','note':'LAI CAI\n来财'}))
L.append(make(10,'左侧长竖排','主副标题合为左侧竖向书脊，其余信息沿窄栏排列。',[
t('title',22,19,224,252,112,'left',900),t('subtitle',25,267,121,328,96,'left',900,vertical=True),t('kicker',247,24,187, 90,17),t('body',30,632,374,190,22),t('note',244,208,172,287,19)],[g(429,0,321,864)],'left','short',referenceOverrides={'title':'好来\n运财','subtitle':'八方来'}))
L.append(make(11,'中部横题凹口图','横向主标题下方为凹口式图片区域，说明分为左右两栏。',[
t('kicker',33,25,300,64,19),t('title',30,110,690,148,112,'center',900),t('subtitle',354,302,350,145,37,'left',600),t('body',35,709,312,145,23),t('note',429,709,289,145,23)],[g(35,286,300,410),g(335,494,369,202)],'top-bottom','medium',referenceOverrides={'title':'(来财来财)'}))
L.append(make(12,'竖向标题双圆','左上双列竖标题与右侧竖引题，信息落在右下。',[
t('title',28,18,218,283,101,'left',900),t('subtitle',28,301,214,191,83,'left',900,vertical=True),t('kicker',266,137,72,362, 20,vertical=True),t('body',282,604,429,98,31),t('note',281,746,419,166,18)],[g(359,187,344,344,'ellipse'),g(28,531,204,369,'ellipse')],'top-left','short',referenceOverrides={'title':'好来\n运财\n八来','subtitle':'方财来'}))
L.append(make(13,'圆形之间的文字','主标题右上，英文引题左中，正文右下，形成三点节奏。',[
t('title',220,22,509,106,91,'left',900),t('subtitle',221,126,508,100, 80,'left',900),t('kicker',50,289,367,281,67,'left',800),t('body',424,618,304, 80,27),t('note',288,728,436,165, 18)],[g(46,64,163,163,'ellipse'),g(334,226,375,375,'ellipse'),g(49,653,241,241,'ellipse')],'corners','short',referenceOverrides={'kicker':'GOOD\nMOVE EIGHT\nSQUARE\nCOME'}))
L.append(make(14,'三段图像底部大字','顶部两端标题，三段横向图像，以底部超大英文收尾。',[
t('title',18,21,288, 80,69,'left',900),t('subtitle',392,21,338, 80, 60,'right',800),t('kicker',29,813,580,134,135,'left',900),t('body',29,113,39,201,17,vertical=True),t('note',674,369,39,229,17,vertical=True)],[g(100,108,611,197),g(31,341,604,210),g(99,588,615,209)],'top-bottom','short',footerY=951,referenceOverrides={'title':'(来财)','kicker':'LAICAI*'}))
L.append(make(15,'大刊头与图内注释','大刊头在顶，副标题紧随，正文落入图像的上下边缘。',[
t('title',24,12,537,146,140,'left',900),t('kicker',572,24,154,101,18,'right',700),t('subtitle',102,159,627,102, 60,'center',800),t('body',31,282,567,107,37),t('note',345,632,380,120,36)],[g(25,272,697,518)],'top-bottom','medium',referenceOverrides={'title':'LAICAI*','subtitle':'(来财) 好运八方来'}))
L.append(make(16,'大字横压信息底栏','顶部双层强标题，右侧短说明，底部用边框容纳长说明。',[
t('kicker', 20,27,461,65,22),t('title',22,92,706,121,111,'left',900),t('subtitle',22,216,706,130,104,'left',900),t('note',474,365,240,134,27,'right'),t('body',30,810,692,153, 18)],[g(21,353,701,361)],'top','long',footerY=737,referenceOverrides={'title':'来　来财!!'},referenceDecorations=[{'type':'frame','x':20,'y':797,'w':710,'h':178}]))
# Correct overly dense samples with exact, explicit per-template sample copy (never use as user facts).
base={'title':'来财来财','subtitle':'好运八方来','kicker':'LAI CAI\nHERE WE ARE\nBAOLAO ZAI','body':'我们这的憨佬仔\n脖子上喜欢挂玉牌','note':'香炉供台上摆\n长大才 开白黄牌','footer1':'HERE WE ARE\nBAOLAO ZAI','footer2':'好运\n八方来','footer3':'I LIKE IT ON MY NECK\nHANG A JADE PLAQUE'}
for l in L:
    l['sampleContent']={**base,**l.pop('referenceOverrides',{})}
    # Microtype areas are intentionally short in the reference approximation.
    for s in l['slots']:
        if s['key']=='kicker' and s['fontSize']>=50:
            l['sampleContent']['kicker']='GOOD\nMOVE\nEIGHT\nSQUARE\nCOME' if l['id']=='L04' else l['sampleContent']['kicker']
    if l['id'] in ['L02','L04','L07','L12','L13']:
        l['sampleContent']['note']='OUR STUFF GUY HERE\nI LIKE IT ON MY NECK\nHANG A JADE PLAQUE\nGOOD LUCK / EIGHT DIRECTIONS COME'
    if l['id']=='L15': l['sampleContent']['note']='香炉供台上摆\n长大才 开白黄牌'
    if l['id']=='L16': l['sampleContent']['body']='来财来财，好运八方来。\n这是一段用于检验信息容量的示例文案。\n在这里放置活动说明、主办方与补充信息。\n替换文案后，请重新检查文字换行与可读性。'
    assert len({s['key'] for s in l['slots']})==len(l['slots'])
    for s in l['slots']:
        assert s['x']>=0 and s['y']>=0 and s['x']+s['w']<=750 and s['y']+s['h']<=1000,(l['id'],s)
# Final sample tuning: preserve the reference's hierarchy without crowding its boxes.
longnote='OUR STUFF GUY HERE\nI LIKE IT ON MY NECK\nHANG A JADE PLAQUE\nGOOD LUCK / EIGHT DIRECTIONS COME'
samples={
'L01':{'title':'<来财>','subtitle':'来财来财来财','body':'我们这的憨佬仔○脖子上喜欢挂玉牌','note':''},
'L02':{'title':'<来财来财来>','body':longnote,'note':'○○','subtitle':'我们这的憨佬仔○脖子上喜欢挂玉牌'},
'L03':{'title':'<来财>\n好','subtitle':'来财\n（运）','kicker':'LAI CAI                 EIGHT DIRECTIONS COME                 GOOD LUCK'},
'L04':{'title':'来财来\n财来财','subtitle':'<来财>','body':longnote,'note':longnote},
'L05':{'title':'LAI\n  *CAI','subtitle':'(来财) 好运八方来'},
'L06':{'title':'来财来财*','subtitle':'*好运八方来'},
'L07':{'title':'来财\n来财','kicker':'GOOD LUCK\nALL DIRECTIONS\nCOME','subtitle':'<好运>\n八方来'},
'L08':{'subtitle':'我们这的憨佬仔\n脖子上喜欢挂玉牌','kicker':'OUR STUFF GUY HERE\nI LIKE TO HANG JADE PLAQUES AROUND MY NECK'},
'L09':{'kicker':'GOOD LUCK\nEIGHT DIRECTIONS COME\nLAI CAI'},
'L10':{'subtitle':'八方来'},
'L11':{'subtitle':'好运\n八方来\n\nGOOD LUCK\nEIGHT DIRECTIONS COME'},
'L12':{'title':'好运八方来','subtitle':'来财来财*','kicker':'GOOD LUCK\nEIGHT DIRECTIONS COME'},
'L13':{'title':'来财来财*','kicker':'GOOD\nMOVEEIGHT\nSQUARE\nCOME'},
'L14':{'kicker':'LAICAI*'},
'L15':{'title':'LAICAI*'},
'L16':{'kicker':'好运　　GOOD LUCK\n八方来　EIGHT DIRECTIONS COME'}
}
# Geometry is deliberately fixed; overflowing real content is reported by the editor.
patches={
'L01':{'kicker':{'fontSize':58,'h':193},'title':{'fontSize':82,'h':108},'subtitle':{'fontSize':79,'h':104},'body':{'x':45,'y':836,'w':660,'h':63,'fontSize':27},'note':{'y':902,'h':27}},
'L02':{'title':{'fontSize':83,'h':115},'note':{'fontSize':29,'h':48}},
'L03':{'title':{'fontSize':96},'subtitle':{'fontSize':90},'kicker':{'fontSize':17,'h':49}},
'L04':{'title':{'fontSize':87,'h':221},'subtitle':{'fontSize':80,'h':120}},
'L05':{'title':{'fontSize':146,'h':302},'subtitle':{'fontSize':73,'h':108,'y':875}},
'L06':{'title':{'fontSize':96,'h':132},'subtitle':{'fontSize':85,'h':154}},
'L07':{'title':{'fontSize':110},'kicker':{'fontSize':54,'h':187},'subtitle':{'fontSize':43}},
'L08':{'title':{'fontSize':80,'h':226},'subtitle':{'fontSize':38,'h':105}},
'L09':{'title':{'fontSize':101,'h':128},'subtitle':{'fontSize':83}},
'L10':{'title':{'fontSize':104,'h':249},'subtitle':{'fontSize':88,'y':273,'h':330}},
'L11':{'title':{'fontSize':95,'h':145},'subtitle':{'fontSize':24,'h':187}},
'L12':{'title':{'x':28,'y':18,'w':107,'h':492,'fontSize':91,'vertical':True},'subtitle':{'x':139,'y':18,'w':107,'h':450,'fontSize':91,'vertical':True},'kicker':{'x':265,'y':147,'w':76,'h':382,'fontSize':24}},
'L13':{'kicker':{'fontSize':58,'h':284},'title':{'fontSize':86},'subtitle':{'fontSize':76}},
'L14':{'kicker':{'fontSize':125,'w':585,'h':135,'y':810}},
'L15':{'title':{'fontSize':122,'h':146},'subtitle':{'fontSize':58,'h':108}},
'L16':{'title':{'fontSize':100,'h':123},'subtitle':{'fontSize':96,'h':133}}
}
for l in L:
    l['sampleContent'].update(samples.get(l['id'],{}))
    for slot in l['slots']:
        slot.update(patches.get(l['id'],{}).get(slot['key'],{}))
        slot['fontFamily']='Arial, "PingFang SC", "Microsoft YaHei", sans-serif'
        if slot['key'] not in ['title','subtitle']:
            slot['lineHeight']=1.12
        if slot['key'].startswith('footer'):
            slot['lineHeight']=1.15
            slot['fontSize']=17
        if slot.get('vertical'):
            slot['lineHeight']=1.04
for l in L:
    corrections={
        'L04':{'kicker':{'w':319,'fontSize':55},'note':{'x':365,'w':351,'fontSize':16}},
        'L05':{'title':{'fontSize':130,'h':311},'body':{'y':330,'h':445,'fontSize':18}},
        'L07':{'kicker':{'fontSize':45,'h':189}},
        'L09':{'subtitle':{'y':157,'h':153},'note':{'y':319,'h':207}},
        'L14':{'kicker':{'fontSize':118,'h':146,'y':801}}
    }
    for slot in l['slots']:slot.update(corrections.get(l['id'],{}).get(slot['key'],{}))
output={'schemaVersion':1,'units':'px','measurement':'Visually reconstructed from user-supplied 4 × 4 raster reference; not original CSS. Coordinates are estimates.','source':'9aaac0055ccef2706c9d5484aeab23d1.jpg','layouts':L}
(ROOT/'assets/catalogs/layouts.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
