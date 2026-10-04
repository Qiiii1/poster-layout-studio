#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),get=k=>{const i=args.indexOf(k);return i<0?null:args[i+1];};
if(!get('--brief')){console.error('Usage: node scripts/recommend.mjs --brief /absolute/brief.json [--output /absolute/recommendations.json]');process.exit(2);}
try{
  const load=name=>JSON.parse(fs.readFileSync(path.join(root,'assets/catalogs',name),'utf8'));
  const engine=createRequire(import.meta.url)(path.join(root,'assets/editor/recommendations.js'));
  const result=engine.recommend(JSON.parse(fs.readFileSync(get('--brief'),'utf8')),{taxonomy:load('tags.json'),caseIndex:load('cases.json'),rules:load('recommendation-rules.json'),styles:load('styles.json').styles,layouts:load('layouts.json').layouts});
  const text=JSON.stringify(result,null,2)+'\n';
  if(get('--output')){fs.mkdirSync(path.dirname(path.resolve(get('--output'))),{recursive:true});fs.writeFileSync(get('--output'),text);console.log(path.resolve(get('--output')));}else process.stdout.write(text);
}catch(e){console.error(e.message);process.exit(1);}
