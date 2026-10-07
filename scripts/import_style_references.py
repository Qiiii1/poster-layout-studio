#!/usr/bin/env python3
"""Import downloaded column-C images from a saved Feishu sheet response.

This command performs no network calls. Match by family + visual subtype;
reject missing files or ambiguous rows before changing the skill catalog.
"""
import argparse
from datetime import date
import hashlib
import json
from pathlib import Path
import shutil
import struct


def image_info(data):
    if data.startswith(b'\x89PNG\r\n\x1a\n') and len(data) >= 24:
        return '.png', 'image/png', *struct.unpack('>II', data[16:24])
    if data.startswith(b'\xff\xd8'):
        pos = 2
        sof = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
        while pos < len(data):
            if data[pos] != 0xFF:
                pos += 1
                continue
            while pos < len(data) and data[pos] == 0xFF:
                pos += 1
            if pos >= len(data):
                break
            marker = data[pos]
            pos += 1
            if marker in {0xD8, 0xD9, 0x01} or 0xD0 <= marker <= 0xD7:
                continue
            if pos + 2 > len(data):
                break
            length = int.from_bytes(data[pos:pos + 2], 'big')
            if length < 2 or pos + length > len(data):
                break
            if marker in sof and length >= 7:
                height, width = struct.unpack('>HH', data[pos + 3:pos + 7])
                return '.jpg', 'image/jpeg', width, height
            pos += length
    raise ValueError('Reference must be a valid PNG or JPEG, not an API error or HTML response')


def cell_text(value):
    if isinstance(value, list):
        return ''.join(cell_text(v) for v in value)
    if isinstance(value, dict):
        return str(value.get('text', ''))
    return str(value or '').strip()


def import_references(sheet_path, downloads, skill_root):
    response = json.loads(sheet_path.read_text())
    if response.get('ok') is not True:
        raise ValueError('Feishu read did not succeed')
    source_range = response['data']['valueRange']['range']
    if source_range != 'Plpjbx!A1:C100':
        raise ValueError('Expected Plpjbx!A1:C100, preserving actual source row numbers')
    catalog_path = skill_root / 'assets/catalogs/styles.json'
    catalog = json.loads(catalog_path.read_text())
    styles = catalog['styles']
    manifest_path = skill_root / 'assets/catalogs/style-references.json'
    previous = {e['id']: e for e in json.loads(manifest_path.read_text()).get('referenceImages', [])} if manifest_path.exists() else {}
    by_subtype = {}
    for style in styles:
        by_subtype.setdefault((style['category'], style['visualSubtype']), []).append(style)
    pending = []
    seen = set()
    for row_number, row in enumerate(response['data']['valueRange']['values'], 1):
        if len(row) < 3 or not isinstance(row[2], dict) or row[2].get('type') != 'embed-image':
            continue
        key = (cell_text(row[0]), cell_text(row[1]))
        if key not in by_subtype:
            raise ValueError(f'C{row_number}: unmatched family/subtype: {key}')
        if key in seen:
            raise ValueError(f'C{row_number}: duplicate family/subtype: {key}')
        seen.add(key)
        matching = list(downloads.glob(f'c{row_number:02d}.*'))
        if len(matching) != 1:
            raise ValueError(f'C{row_number}: expected one downloaded image, got {len(matching)}')
        data = matching[0].read_bytes()
        suffix, mime, width, height = image_info(data)
        reference_id = f'feishu-c{row_number:02d}'
        relative_path = f'references/style-images/{reference_id}{suffix}'
        source_url = 'https://lcnuqxs2a155.feishu.cn/sheets/SmmesZIJchcZbrt1meMcMLUjnFb?sheet=Plpjbx&range=C' + str(row_number)
        entry = {
            'id': reference_id, 'path': relative_path, 'family': key[0],
            'visualSubtype': key[1], 'sourceCell': f'C{row_number}', 'sourceUrl': source_url,
            'mediaType': mime, 'width': width, 'height': height,
            'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
            'styleIds': [s['id'] for s in by_subtype[key]],
        }
        old = previous.get(reference_id, {})
        if old.get('sha256') == entry['sha256'] and old.get('visualNotes'):
            entry['visualNotes'] = old['visualNotes']
        pending.append((data, entry))
    if seen != set(by_subtype):
        raise ValueError('Missing reference images for: ' + repr(sorted(set(by_subtype) - seen)))
    for data, entry in pending:
        output = skill_root / entry['path']
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(data)
    entries = [entry for _, entry in pending]
    for style in styles:
        entry = next(e for e in entries if style['id'] in e['styleIds'])
        style['referenceImages'] = [{
            'id': entry['id'], 'path': entry['path'], 'sourceCell': entry['sourceCell'],
            'sourceUrl': entry['sourceUrl'], 'visualSubtype': entry['visualSubtype'],
            'scope': 'shared-subtype' if style['id'] in {'gathered-scenes', 'cool-riso', 'neon-blue'} else 'subtype',
        }]
    manifest = {
        'schemaVersion': 1, 'importDate': date.today().isoformat(),
        'source': {'url': 'https://lcnuqxs2a155.feishu.cn/sheets/SmmesZIJchcZbrt1meMcMLUjnFb?sheet=Plpjbx',
                   'sheetId': 'Plpjbx', 'column': 'C', 'range': source_range,
                   'revision': response['data']['valueRange'].get('revision', response['data'].get('revision'))},
        'usageGuide': 'references/style-image-references.md',
        'referenceImages': entries,
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    return {'referenceImages': len(entries), 'stylesCovered': len(styles),
            'imageBytes': sum(e['bytes'] for e in entries), 'sourceRevision': manifest['source']['revision']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sheet', required=True, type=Path)
    parser.add_argument('--downloads', required=True, type=Path)
    parser.add_argument('--skill-root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    print(json.dumps(import_references(args.sheet, args.downloads, args.skill_root), ensure_ascii=False))


if __name__ == '__main__':
    main()
