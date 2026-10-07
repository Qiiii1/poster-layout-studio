"""Validate structured review and planning records; no semantic image analysis."""
import math,re

def workflow_fields(brief):
    def strings(value,limit,length):
        if not isinstance(value,list) or len(value)>limit or any(not isinstance(x,str) or len(x)>length for x in value):raise ValueError('Invalid review/subject string list')
        return list(value)
    regions=brief.get('protectedRegions',[])
    if not isinstance(regions,list) or len(regions)>64:raise ValueError('Invalid protectedRegions')
    clean=[]
    for r in regions:
        if not isinstance(r,dict) or not re.fullmatch(r'background|subject-[1-8]',str(r.get('layer',''))):raise ValueError('Invalid protected region layer')
        if not all(type(r.get(k)) in (int,float) and math.isfinite(r[k]) for k in ['x','y','w','h']) or r['x']<0 or r['y']<0 or r['w']<=0 or r['h']<=0 or r['x']+r['w']>1.000001 or r['y']+r['h']>1.000001:raise ValueError('Protected regions use 0–1 image coordinates')
        clean.append({'layer':r['layer'],'name':str(r.get('name','重要区域'))[:100],**{k:r[k] for k in ['x','y','w','h']}})
    review={'input':{'status':'pending','findings':[]},'output':{'status':'pending','findings':[]}}
    value=brief.get('culturalReview',{})
    if not isinstance(value,dict):raise ValueError('Invalid culturalReview')
    for stage in review:
        if stage not in value:continue
        v=value[stage]
        if not isinstance(v,dict) or v.get('status') not in ['pending','reviewed','hold']:raise ValueError('Invalid cultural review status')
        review[stage]={'status':v['status'],'findings':strings(v.get('findings'),64,1000)}
    roster=brief.get('subjectRoster',{'confirmed':False,'items':[]})
    if not isinstance(roster,dict) or type(roster.get('confirmed')) is not bool:raise ValueError('Invalid subjectRoster')
    roster={'confirmed':roster['confirmed'],'items':strings(roster.get('items'),8,300)}
    web=brief.get('webAugmentation',{'choice':'pending','elements':[]})
    if not isinstance(web,dict) or web.get('choice') not in ['pending','no','suggest','use'] or not isinstance(web.get('elements'),list) or len(web['elements'])>20:raise ValueError('Invalid webAugmentation')
    elements=[]
    for e in web['elements']:
        if not isinstance(e,dict) or not isinstance(e.get('name'),str) or not isinstance(e.get('url'),str) or len(e['url'])>2000 or not re.match(r'^https?://',e['url']):raise ValueError('Invalid online element source')
        elements.append({'name':e['name'][:200],'url':e['url'],'accepted':e.get('accepted') is True})
    palette=brief.get('sourcePalette')
    if palette is not None:
        if not isinstance(palette,dict) or not isinstance(palette.get('colors'),list) or not 1<=len(palette['colors'])<=8 or any(not isinstance(x,str) or not re.fullmatch(r'#[0-9a-fA-F]{6}',x) for x in palette['colors']):raise ValueError('Invalid sourcePalette')
        palette={'colors':list(dict.fromkeys(x.upper() for x in palette['colors'])),'source':str(palette.get('source','素材取色'))[:200]}
    return {'protectedRegions':clean,'culturalReview':review,'subjectRoster':roster,'sourcePalette':palette,'webAugmentation':{'choice':web['choice'],'elements':elements}}
