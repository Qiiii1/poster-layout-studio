#!/usr/bin/env python3
"""Copy a specifically flagged asset into a private local quarantine directory."""
import argparse,hashlib,json,os,shutil
from pathlib import Path

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--source',required=True,type=Path)
    parser.add_argument('--directory',required=True,type=Path)
    parser.add_argument('--reason',required=True,choices=['privacy','cultural-context','unverified-source'])
    a=parser.parse_args();source=a.source.resolve(strict=True)
    if not source.is_file():raise ValueError('Source must be a file')
    digest=hashlib.sha256(source.read_bytes()).hexdigest()
    a.directory.mkdir(parents=True,exist_ok=True);os.chmod(a.directory,0o700)
    target=a.directory/(digest+source.suffix.lower())
    if target.resolve()==source:raise ValueError('Quarantine target must differ from original')
    if not target.exists():shutil.copyfile(source,target)
    elif hashlib.sha256(target.read_bytes()).hexdigest()!=digest:raise ValueError('Existing quarantined copy has different bytes')
    os.chmod(target,0o600)
    note=a.directory/(digest+'.review.json')
    note.write_text(json.dumps({'sha256':digest,'reason':a.reason,'status':'hold','includeInPoster':False},ensure_ascii=False,indent=2)+'\n');os.chmod(note,0o600)
    print(json.dumps({'quarantined':str(target),'record':str(note),'originalPreserved':True}))

if __name__=='__main__':main()
