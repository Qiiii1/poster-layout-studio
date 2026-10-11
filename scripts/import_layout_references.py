#!/usr/bin/env python3
"""Import the nine composition types and their downloaded B–D reference images.

No network calls or execution of spreadsheet content. Validate all rows/files
before writing; preserve curator notes separately from compatibility checks.
"""
import argparse
from datetime import date
import hashlib
import json
from pathlib import Path
import re
from import_style_references import image_info, cell_text


def import_references(sheet_path, downloads, skill_root):
    response = json.loads(sheet_path.read_text())
    if response.get('ok') is not True:
        raise ValueError('Feishu read did not succeed')
    source_range = response['data']['valueRange']['range']
    if not re.fullmatch(r'gdiHLe!A1:[D-Z]+\d+', source_range):
        raise ValueError('Read must start at gdiHLe!A1 and include columns A–E')
    rules_path = skill_root / 'assets/catalogs/recommendation-rules.json'
    rules = json.loads(rules_path.read_text())
    pending, compositions, seen = [], [], set()
    for number, row in enumerate(response['data']['valueRange']['values'], 1):
        if number == 1 or not row or not cell_text(row[0]):
            continue
        name = cell_text(row[0])
        if name not in rules['compositionLayouts'] or name in seen:
            raise ValueError(f'A{number}: unknown or repeated composition: {name}')
        seen.add(name)
        refs = []
        for column in 'BCD':
            cell = f'{column}{number}'
            index = ord(column)-65
            if len(row) <= index or not isinstance(row[index], dict) or row[index].get('type') != 'embed-image':
                raise ValueError(f'{cell}: missing embedded image')
            files = list(downloads.glob(cell + '.*'))
            if len(files) != 1:
                raise ValueError(f'{cell}: expected exactly one downloaded image')
            data = files[0].read_bytes()
            suffix, mime, width, height = image_info(data)
            entry = {'id':f'feishu-gdiHLe-{cell}', 'path':f'references/layout-images/feishu-gdiHLe-{cell}{suffix}',
                     'composition':name, 'sourceCell':cell,
                     'sourceUrl':f'https://lcnuqxs2a155.feishu.cn/sheets/SmmesZIJchcZbrt1meMcMLUjnFb?sheet=gdiHLe&range={cell}',
                     'mediaType':mime, 'width':width, 'height':height, 'bytes':len(data),
                     'sha256':hashlib.sha256(data).hexdigest()}
            pending.append((data,entry))
            refs.append({k:entry[k] for k in ['id','path','sourceCell','sourceUrl']})
        note = cell_text(row[4]) if len(row)>4 else ''
        compositions.append({'name':name, 'sourceRow':number, 'curatorNote':note,
                             'defaultRecommended':'不推荐' not in note, 'referenceImages':refs})
    if seen != set(rules['compositionLayouts']):
        raise ValueError('Missing composition rows: ' + repr(set(rules['compositionLayouts'])-seen))
    manifest_path = skill_root / 'assets/catalogs/layout-references.json'
    previous = {r['id']:r for r in json.loads(manifest_path.read_text()).get('referenceImages',[])} if manifest_path.exists() else {}
    for data, entry in pending:
        old = previous.get(entry['id'],{})
        if old.get('sha256')==entry['sha256'] and old.get('visualNotes'):
            entry['visualNotes']=old['visualNotes']
        target=skill_root / entry['path'];target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
    source = {'sheetId':'gdiHLe', 'range':source_range, 'revision':response['data']['valueRange'].get('revision',response['data'].get('revision')),
              'url':'https://lcnuqxs2a155.feishu.cn/sheets/SmmesZIJchcZbrt1meMcMLUjnFb?sheet=gdiHLe'}
    for c in compositions:
        rules['compositionLayouts'][c['name']].update({k:c[k] for k in ['defaultRecommended','curatorNote','referenceImages']})
    rules['compositionSource']=source
    rules_path.write_text(json.dumps(rules,ensure_ascii=False,indent=2)+'\n')
    manifest_path.write_text(json.dumps({'schemaVersion':1,'importDate':date.today().isoformat(),'source':source,
                                        'usageGuide':'references/composition-references.md','compositions':compositions,
                                        'referenceImages':[r for _,r in pending]},ensure_ascii=False,indent=2)+'\n')
    return {'compositions':len(compositions),'images':len(pending),'defaultRecommended':sum(c['defaultRecommended'] for c in compositions)}


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sheet',required=True,type=Path)
    parser.add_argument('--downloads',required=True,type=Path)
    parser.add_argument('--skill-root',type=Path,default=Path(__file__).resolve().parents[1])
    args=parser.parse_args()
    print(json.dumps(import_references(args.sheet,args.downloads,args.skill_root),ensure_ascii=False))
