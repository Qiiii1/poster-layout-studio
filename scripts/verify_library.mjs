#!/usr/bin/env node
// Verify the distributable library and its recommendation boundaries without Feishu access.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'assets/catalogs',name+'.json'),'utf8'));
const styles=read('styles').styles, legacy=read('legacy-styles').styles, rules=read('recommendation-rules');
const ids=['landscape-ink','specimen-collage','minimal-illustration','surreal-pop','ascii-tech','mono-color'];
assert.deepEqual(styles.map(s=>s.id),ids);
assert.ok(legacy.every(s=>!ids.includes(s.id)));
for(const r of rules.tagStyleRules)assert.ok(r.styles.every(id=>ids.includes(id)));
let total=0;
for(const [name,count] of [['style-references',20],['layout-references',27]]){
  const refs=read(name).referenceImages;assert.equal(refs.length,count);
  assert.equal(new Set(refs.map(r=>r.id)).size,count);
  for(const r of refs){
    assert.ok(!path.isAbsolute(r.path));
    const p=path.resolve(root,r.path);assert.ok(p.startsWith(root+path.sep));
    const data=fs.readFileSync(p);assert.equal(data.length,r.bytes);
    assert.equal(createHash('sha256').update(data).digest('hex'),r.sha256);total++;
  }
}
const compositions=read('layout-references').compositions;
assert.equal(compositions.length,9);assert.equal(compositions.filter(c=>c.defaultRecommended).length,6);
const knownRefs=new Set(read('style-references').referenceImages.map(r=>r.id));
for(const s of styles)assert.ok(s.referenceImages.length>=3&&s.referenceImages.every(r=>knownRefs.has(r.id)));
const require=createRequire(import.meta.url), engine=require(path.join(root,'assets/editor/recommendations.js'));
const data={styles,rules,taxonomy:read('tags'),caseIndex:read('cases'),layouts:read('layouts').layouts};
const brief={hasSourcePhoto:true,subject:'文化展览',content:{title:'空间与时间'}};
const result=engine.recommend(brief,data);
assert.equal(result.allStyles.length,6);assert.equal(result.styles.length,3);
assert.ok(result.layouts.length>=3&&result.layouts.length<=4);
assert.ok(result.layouts.some(l=>l.compositionReferences.some(c=>c.referenceImages.length===3)));
assert.ok(result.layouts.every(l=>l.compositionReferences.every(c=>c.defaultRecommended)));
const old=engine.recommend({...brief,styleId:'y2k',selectedTags:{visualSubtype:['霓虹动感风']}},data);
assert.ok(old.warnings.some(w=>w.includes('退出当前 6')));
assert.ok(old.allStyles.every(s=>s.id!=='y2k'));
const selected=engine.recommend({...brief,selectedTags:{composition:['对称构图']}},data);
assert.ok(selected.warnings.some(w=>w.includes('不推荐')));
assert.ok(selected.allLayouts.some(l=>l.compositionReferences.some(c=>c.name==='对称构图')));
const noPhoto=engine.recommend({...brief,hasSourcePhoto:false},data);
assert.ok(noPhoto.styles.every(s=>!s.needsPhoto));
for(const ratio of ['2:3','3:4','4:5']){
  const r=engine.recommend({...brief,canvasRatio:ratio},data);assert.ok(r.layouts.length<=4);
}
console.log(JSON.stringify({styles:ids.length,verifiedImages:total,compositions:9,cssTemplates:data.layouts.length,caseRecords:data.caseIndex.cases.length,checks:'PASS'}));
