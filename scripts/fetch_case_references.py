#!/usr/bin/env python3
"""Fetch at most three matched Feishu case images for subsequent visual inspection."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess

from import_tag_catalog import case_columns, cell_text, column_letter, split_tags, DIMENSIONS

SOURCE_URL = 'https://lcnuqxs2a155.feishu.cn/sheets/SmmesZIJchcZbrt1meMcMLUjnFb?sheet=76438f'
SHEET_ID = '76438f'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--recommendations', required=True, type=Path)
    parser.add_argument('--output-dir', required=True, type=Path)
    args = parser.parse_args()
    recommendations = json.loads(args.recommendations.read_text())
    if recommendations.get('caseSource', {}).get('sheetId') != SHEET_ID:
        raise ValueError('Recommendations must identify case sheet 76438f')
    args.output_dir.mkdir(parents=True, exist_ok=True)
    manifest = {'sourceUrl': SOURCE_URL, 'cases': [], 'visualReview': 'pending', 'notices': []}

    def call(*argv):
        result = subprocess.run(['lark-cli', *argv, '--as', 'user'], capture_output=True,
                                text=True, timeout=45, cwd=args.output_dir.resolve())
        response = json.loads(result.stdout or result.stderr)
        update = response.get('_notice', {}).get('update')
        if update and update not in manifest['notices']:
            manifest['notices'].append(update)
        if result.returncode or not response.get('ok'):
            raise RuntimeError(json.dumps(response.get('error', {'message': 'Lark request failed'}), ensure_ascii=False))
        return response['data']

    def rows(data):
        return data.get('valueRange', data).get('values', [])

    exit_code = 0
    try:
        evidence = recommendations.get('evidence', [])[:3]
        if not evidence:
            manifest['status'] = 'no-matches'
        else:
            info = call('sheets', '+info', '--url', SOURCE_URL)
            sheets = info['sheets']
            if isinstance(sheets, dict):
                sheets = sheets['sheets']
            sheet = next(s for s in sheets if s['sheet_id'] == SHEET_ID)
            grid = sheet['grid_properties']
            end = column_letter(grid['column_count'] - 1)
            header = rows(call('sheets', '+read', '--url', SOURCE_URL, '--sheet-id', SHEET_ID,
                               '--range', f'A1:{end}1', '--value-render-option', 'UnformattedValue'))
            columns = case_columns(header)
            used = set()
            for case in evidence:
                number = case.get('row')
                if not isinstance(number, int) or number < 2 or number > grid['row_count'] or number in used:
                    raise ValueError('Invalid, deleted or duplicate case row; refresh the case index')
                used.add(number)
                live = call('sheets', '+read', '--url', SOURCE_URL, '--sheet-id', SHEET_ID,
                            '--range', f'A{number}:{end}{number}', '--value-render-option', 'UnformattedValue')
                row = rows(live)[0]
                name = cell_text(row[columns['活动名称']])
                tags = {key: split_tags(row[columns[label]]) for key, label, _, _ in DIMENSIONS}
                entry = {'row': number, 'name': name, 'sourceUrl': case['sourceUrl'],
                         'imageCell': column_letter(columns['主视觉图片']) + str(number),
                         'revision': live.get('revision'), 'visualReview': 'pending', 'status': 'pending-fetch'}
                manifest['cases'].append(entry)
                if name != case.get('name', '') or tags != case.get('caseTags'):
                    entry['status'] = 'index-stale'
                    entry['message'] = 'Live case name or tags changed; refresh the index and rerun recommendations'
                    exit_code = 1
                    continue
                image = row[columns['主视觉图片']]
                token = image.get('fileToken') if isinstance(image, dict) and image.get('type') == 'embed-image' else None
                if not token:
                    entry['status'] = 'image-missing'
                    exit_code = 1
                    continue
                if not re.fullmatch(r'[A-Za-z0-9_-]+', token):
                    raise ValueError('Unsupported image token')
                media = call('docs', '+media-preview', '--token', token,
                             '--output', f'case-row-{number}', '--overwrite')
                path = Path(media['saved_path'])
                data = path.read_bytes()
                if not (data.startswith(b'\x89PNG\r\n\x1a\n') or data.startswith(b'\xff\xd8\xff')
                        or data.startswith(b'GIF8') or (data.startswith(b'RIFF') and data[8:12] == b'WEBP')):
                    raise ValueError('Case preview did not return a supported raster image')
                entry.update(status='fetched', localPath=str(path.resolve()), bytes=len(data),
                             sha256=hashlib.sha256(data).hexdigest())
            manifest['status'] = 'ready-for-visual-review' if not exit_code else 'incomplete'
    except (RuntimeError, ValueError, KeyError, IndexError, OSError, subprocess.TimeoutExpired) as error:
        manifest['status'] = 'blocked'
        manifest['error'] = str(error)
        exit_code = 1
    output = args.output_dir / 'case-references.json'
    output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'manifest': str(output.resolve()), 'status': manifest['status'],
                      'visualReview': 'pending', 'error': manifest.get('error')}, ensure_ascii=False))
    return exit_code


if __name__ == '__main__':
    raise SystemExit(main())
