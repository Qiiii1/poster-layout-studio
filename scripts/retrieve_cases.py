"""Read the text-only case library. Rank only event/audience/content inputs."""
import argparse,json
from pathlib import Path
from collections import defaultdict

INPUT_KEYS=('eventType','audience','contentTypes')
OUTPUT_KEYS=('subjectType','composition','styleFamily')
WEIGHTS={'eventType':1,'audience':1,'contentTypes':1}

def retrieve(query,path,limit=8,subject=None):
    tags=query.get('selectedTags',query)
    active={k:tags.get(k,[]) for k in INPUT_KEYS if tags.get(k)}
    for k,v in active.items():
        if not isinstance(v,list) or any(not isinstance(x,str) for x in v):
            raise ValueError(k+' must be a list of strings')
    vocab={k:set() for k in INPUT_KEYS};ranked=[];count=0
    for line in path.open(encoding='utf-8'):
        c=json.loads(line);count+=1
        for k in INPUT_KEYS:vocab[k].update(c['tags'].get(k,[]))
        if not active:continue
        details={}
        for k,wanted in active.items():
            q=set(wanted);actual=set(c['tags'].get(k,[]));hit=sorted(q&actual)
            # Query coverage: extra case labels are not missing requirements.
            details[k]={'requested':sorted(q),'caseTags':sorted(actual),'matched':hit,'coverage':len(hit)/len(q)}
        score=sum(d['coverage']*WEIGHTS[k] for k,d in details.items())/sum(WEIGHTS[k] for k in active)
        if score>0:ranked.append({'sourceRow':c['sourceRow'],'similarity':round(score,6),'matches':details,'tags':c['tags']})
    ranked.sort(key=lambda x:(-x['similarity'],x['sourceRow']))
    top=ranked[:limit]
    votes={k:defaultdict(float) for k in OUTPUT_KEYS}
    # Use all cases tied at the retrieval boundary, avoiding row-order vote bias.
    voting=[c for c in ranked if top and c['similarity']>=top[-1]['similarity']]
    for c in voting:
        for k in OUTPUT_KEYS:
            values=c['tags'].get(k,[])
            for v in values:votes[k][v]+=c['similarity']/max(1,len(values))
    aggregate={k:[{'value':v,'weight':round(w,6)} for v,w in sorted(vs.items(),key=lambda x:(-x[1],x[0]))] for k,vs in votes.items()}
    warnings=[]
    if not active:warnings.append('没有活动类型、受众或包含内容标签，未检索；请先从输入识别这些维度。')
    unknown={k:sorted(set(v)-vocab[k]) for k,v in active.items() if set(v)-vocab[k]}
    if unknown:warnings.append('存在未命中的标签，不能把它静默当作匹配：'+json.dumps(unknown,ensure_ascii=False))
    if active and not top:warnings.append('没有标签重合案例；不可声称有相似案例依据。')
    if top and top[0]['similarity']<1:warnings.append('没有完整匹配全部已提供标签的案例，请展示部分匹配与缺失。')
    if subject is None:warnings.append('主体数量尚未由实际输入图片判断；案例主体标签仅供比较，不可代替图像检查。')
    elif subject not in ['single','multiple','none','unknown']:raise ValueError('invalid observed subject type')
    return {'schemaVersion':1,'caseCount':count,'rankingDimensions':list(active),'weights':WEIGHTS,'query':active,'observedSubjectType':subject,'evidence':top,'candidateCount':len(ranked),'aggregationCaseCount':len(voting),'caseSuggestions':aggregate,'warnings':warnings,'requiresHumanChoice':True}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--brief',required=True,type=Path)
    p.add_argument('--cases',type=Path,default=Path(__file__).resolve().parents[1]/'assets/catalogs/cases-text.jsonl')
    p.add_argument('--output',type=Path)
    p.add_argument('--limit',type=int,default=8)
    p.add_argument('--observed-subject',choices=['single','multiple','none','unknown'])
    a=p.parse_args()
    if not 1<=a.limit<=40:p.error('limit must be 1–40')
    result=retrieve(json.loads(a.brief.read_text(encoding='utf-8-sig')),a.cases,a.limit,a.observed_subject)
    out=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if a.output:a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(out,encoding='utf-8');print(a.output.resolve())
    else:print(out)
if __name__=='__main__':main()
