#!/usr/bin/env python3
"""Import saved Feishu +read/+get-dropdown responses; no network or image downloads."""
import argparse
from collections import Counter
from datetime import date
import json
from pathlib import Path
import re

DIMENSIONS = [
    ('eventType', '活动类型', 2, False),
    ('visualFocus', '主视觉侧重点类型', 3, True),
    ('audience', '受众类型', 4, True),
    ('contentTypes', '包含内容', 5, True),
    ('subjectType', '主视觉侧重类型', 6, False),
    ('composition', '排版', 7, False),
    ('styleFamily', '风格', 8, True),
]
ALIASES = {'图文秩序型': '图文秩序风', '轻插画图形型': '轻插画风', '留白器物型': '单器物风',
           '霓虹动感型': '霓虹动感风', '数码界面型': '数码界面风'}

def cell_text(value):
    if value is None:
        return ''
    if isinstance(value, list):
        return ''.join(cell_text(x) for x in value)
    if isinstance(value, dict):
        if value.get('type') in ('embed-image', 'attachment'):
            return ''
        if value.get('type') == 'multipleValue':
            return ','.join(cell_text(x) for x in value.get('values', []))
        return str(value.get('text') or value.get('link') or '')
    return str(value).strip()

def split_tags(value):
    return list(dict.fromkeys(x.strip() for x in re.split('[,，]', cell_text(value)) if x.strip()))

def read_rows(path):
    data = json.loads(path.read_text())
    if not data.get('ok'):
        raise ValueError(f'Failed sheet response: {path}')
    return data['data']['valueRange']['values']

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--cases', required=True, type=Path)
    p.add_argument('--skills', required=True, type=Path)
    p.add_argument('--dropdowns', required=True, type=Path)
    p.add_argument('--minimal', type=Path)
    p.add_argument('--cyber', type=Path)
    p.add_argument('--output-dir', required=True, type=Path)
    a = p.parse_args()
    rows = read_rows(a.cases)
    validations = json.loads(a.dropdowns.read_text())
    if not validations.get('ok'):
        raise ValueError('Dropdown response failed')
    counts = {key: Counter() for key, _, _, _ in DIMENSIONS}
    options = {key: [] for key, _, _, _ in DIMENSIONS}
    for v in validations['data'].get('dataValidations', []):
        for key, _, col, _ in DIMENSIONS:
            letter = chr(ord('A') + col)
            if any(re.search('!' + letter + r'\d+:', r) for r in v.get('ranges', [])):
                for tag in v.get('conditionValues', []):
                    if tag not in options[key]:
                        options[key].append(tag)
    known_subjects = set(options['subjectType'])
    records, excluded = [], []
    for number, row in enumerate(rows[1:], 2):
        fields = {key: split_tags(row[col] if len(row) > col else '') for key, _, col, _ in DIMENSIONS}
        if fields['subjectType'] and not set(fields['subjectType']).issubset(known_subjects):
            excluded.append({'row': number, 'reason': 'subject-type annotation outside the dropdown vocabulary', 'value': fields['subjectType']})
            continue
        if not any(fields.values()):
            continue
        for key, tags in fields.items():
            counts[key].update(tags)
            for tag in tags:
                if tag not in options[key]:
                    options[key].append(tag)
        records.append({'row': number, 'name': cell_text(row[0]), 'tags': fields})
    skill_rows = read_rows(a.skills)
    subtypes = []
    for number, row in enumerate(skill_rows[1:], 2):
        family = cell_text(row[0]) if row else ''
        name = cell_text(row[1]) if len(row) > 1 else ''
        if not family or not name:
            continue
        urls = []
        for value in row:
            for match in re.finditer(r'https://github\.com/([A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+)', cell_text(value)):
                url = 'https://github.com/' + match.group(1)
                if url not in urls:
                    urls.append(url)
        subtypes.append({'name': name, 'family': family, 'sourceRow': number, 'sourceUrls': urls,
                         'note': cell_text(row[9]) if len(row) > 9 else ''})
    subtype_counts = Counter()
    for path in (a.minimal, a.cyber):
        if path:
            for row in read_rows(path)[1:]:
                if len(row) > 1 and cell_text(row[1]):
                    original = cell_text(row[1])
                    subtype_counts[ALIASES.get(original, original)] += 1
    source = {'url': 'https://lcnuqxs2a155.feishu.cn/sheets/SmmesZIJchcZbrt1meMcMLUjnFb',
              'title': '文化海报案例库', 'importDate': date.today().isoformat(),
              'sheets': {'cases': '76438f', 'skills': 'Plpjbx', 'minimal': 'saUFCt', 'cyber': 'wYdbUd'},
              'caseRowsRead': len(rows) - 1, 'taggedCases': len(records), 'excluded': excluded}
    taxonomy = {'schemaVersion': 1, 'source': source,
                'dimensions': [{'id': key, 'label': label, 'multiple': multiple,
                                'options': [{'value': tag, 'count': counts[key][tag]} for tag in options[key]]}
                               for key, label, _, multiple in DIMENSIONS],
                'visualSubtypes': [{**s, 'referenceCount': subtype_counts[s['name']]} for s in subtypes],
                'aliases': ALIASES}
    a.output_dir.mkdir(parents=True, exist_ok=True)
    (a.output_dir / 'tags.json').write_text(json.dumps(taxonomy, ensure_ascii=False, indent=2) + '\n')
    (a.output_dir / 'cases.json').write_text(json.dumps({'schemaVersion': 1, 'source': source, 'cases': records}, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(json.dumps({'taggedCases': len(records), 'excludedRows': len(excluded),
                      'tagOptions': sum(len(x) for x in options.values()), 'visualSubtypes': len(subtypes)}, ensure_ascii=False))

if __name__ == '__main__':
    main()
