"""Refresh catalog counts from the active text-only case library."""
import json
from pathlib import Path
from collections import Counter
root=Path(__file__).resolve().parents[1]/'assets/catalogs'
tags=json.loads((root/'tags.json').read_text(encoding='utf-8'))
rows=[json.loads(l) for l in (root/'cases-text.jsonl').read_text(encoding='utf-8').splitlines() if l.strip()]
tags['source']['taggedCases']=len(rows)
for dim in tags['dimensions']:
    counts=Counter(v for row in rows for v in set(row['tags'].get(dim['id'],[])))
    old={o['value']:o for o in dim['options']}
    dim['options']=[{**old.get(v,{'value':v}),'count':n} for v,n in counts.items()]
(root/'tags.json').write_text(json.dumps(tags,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Updated',len(rows),'cases; no historical subtype import.')
