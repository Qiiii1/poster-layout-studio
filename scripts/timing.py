import argparse,json,time
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--file',required=True);p.add_argument('action',choices=['start','end','report']);p.add_argument('stage',nargs='?');a=p.parse_args()
f=Path(a.file);d=json.loads(f.read_text(encoding='utf-8')) if f.exists() else {'intervals':[]}
if a.action!='report':
 if not a.stage:p.error('stage required')
 if a.action=='start':
  if any(i['stage']==a.stage and i['end'] is None for i in d['intervals']):p.error('stage already open')
  d['intervals'].append({'stage':a.stage,'start':time.time(),'end':None})
 else:
  matches=[i for i in d['intervals'] if i['stage']==a.stage and i['end'] is None]
  if not matches:p.error('no open stage')
  matches[-1]['end']=time.time()
 f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(d,indent=2),encoding='utf-8')
else:
 def union(items):
  intervals=sorted((i['start'],i['end']) for i in items if i['end'] is not None);total=0;last=None
  for start,end in intervals:
   if last is None or start>last:total+=end-start
   elif end>last:total+=end-last
   last=max(last if last is not None else end,end)
  return total
 result={s:round(union([i for i in d['intervals'] if i['stage']==s]),3) for s in sorted({i['stage'] for i in d['intervals']})}
 totals=[i for i in d['intervals'] if i['stage']=='total' and i['end'] is not None]
 waits=[]
 for w in d['intervals']:
  if w['stage']=='waiting' and w['end'] is not None:
   for t in totals:
    start=max(w['start'],t['start']);end=min(w['end'],t['end'])
    if end>start:waits.append({'start':start,'end':end})
 result['nonUserWaitingSeconds']=round(max(0,result.get('total',0)-union(waits)),3)
 result['incompleteStages']=[i['stage'] for i in d['intervals'] if i['end'] is None]
 print(json.dumps(result,ensure_ascii=False,indent=2))
