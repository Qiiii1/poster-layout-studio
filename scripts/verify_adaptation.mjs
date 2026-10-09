#!/usr/bin/env node
// Exercise the editor's persistent recommendations and editable font contract.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {homedir} from 'node:os';
const root=resolve(process.argv[2]),runner=resolve(process.argv[3]||join(homedir(),'.codex/skills/editable-design/scripts/_browser.mjs'));
const fontFile=process.argv[4]&&resolve(process.argv[4]);
const {launch}=await import(pathToFileURL(runner));
const browser=await launch(),report={checks:[],errors:[]};
try{
  const page=await browser.newPage();await page.setViewport({width:1600,height:1180});
  page.on('pageerror',e=>report.errors.push(e.stack||e.message));
  await page.goto(pathToFileURL(join(root,'editor.html')).href);
  await page.waitForFunction(()=>window.posterStudio?.ready());
  const initial=await page.evaluate(()=>posterStudio.getState());
  const ids=initial.layoutRecommendations;assert.ok(ids.length>0&&ids.length<=4);
  const sameRecommendations=async()=>assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('#layout-grid [data-layout-id]')].map(el=>el.dataset.layoutId)),ids);
  await sameRecommendations();report.initialRecommendations=ids;
  let child=page.frames().find(f=>f!==page.mainFrame());
  const text=await child.$('[data-layer-id="body"]');const box=await text.boundingBox();
  const before=await text.evaluate(el=>[parseFloat(el.style.left),parseFloat(el.style.top)]);
  await page.mouse.move(box.x+box.width*.3,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.3+24,box.y+box.height*.5-20,{steps:8});await page.mouse.up();
  const after=await text.evaluate(el=>[parseFloat(el.style.left),parseFloat(el.style.top)]);assert.notDeepEqual(after,before);
  await new Promise(r=>setTimeout(r,2300));await sameRecommendations();
  report.checks.push('Pointer drag and the autosave interval retain recommendation IDs and order');
  await page.evaluate(async()=>{const s=posterStudio.getState();s.edits.background.top='250px';await posterStudio.setState(s);});await sameRecommendations();
  assert.ok(await page.$('#layout-grid .compat'));report.checks.push('New protection conflicts remain visible as warnings instead of removing cards');
  for(const [ratio,expected] of [['2:3',[800,1200]],['4:5',[800,1000]],['3:4',[750,1000]]]){
    await page.select('#canvas-ratio',ratio);await page.waitForFunction(r=>posterStudio.ready()&&posterStudio.getState().canvasRatio===r,{},ratio);await sameRecommendations();
    const dimensions=await page.evaluate(()=>[...document.querySelectorAll('#layout-grid .poster-canvas')].map(el=>[Number(el.dataset.canvasWidth),Number(el.dataset.canvasHeight)]));dimensions.forEach(d=>assert.deepEqual(d,expected));
    assert.equal(await page.evaluate(()=>posterStudio.getState().background.data),initial.background.data);
    const exported=await page.evaluate(async()=>{const img=await createImageBitmap(await posterStudio.exportPNG(true,false));return [img.width,img.height];});assert.deepEqual(exported,expected);
  }
  report.checks.push('All three portrait ratios adapt retained previews and exported dimensions without changing source artwork');
  await page.click('#edit-fonts');assert.ok((await page.$$('#font-family option')).length>=6);
  await page.select('#font-target','body');await page.select('#font-family','kai');await page.click('#apply-font');
  await page.waitForFunction(()=>posterStudio.ready()&&posterStudio.getState().fontChoices.body?.includes('Kaiti'));
  assert.equal(await page.evaluate(()=>posterStudio.getState().titleImage?.data),initial.titleImage?.data);
  await sameRecommendations();const other=ids.find(id=>id!==initial.layoutId)||'L01';
  await page.evaluate(id=>posterStudio.changeLayout(id),other);
  assert.ok(await page.evaluate(()=>document.getElementById('editor-frame').contentWindow.getComputedStyle(document.getElementById('editor-frame').contentDocument.querySelector('[data-layer-id="body"]')).fontFamily.includes('Kaiti')));
  await sameRecommendations();report.checks.push('Per-layer font selection survives layout changes and preserves artwork and recommendations');
  child=page.frames().find(f=>f!==page.mainFrame());await child.evaluate(()=>__layerEditor.setFont(__layerEditor.layers().find(x=>x.id==='body').el,'var(--font-serif)'));
  const native=await page.evaluate(()=>posterStudio.getState().fontChoices.body);assert.ok(native.includes('Songti'));
  await page.evaluate(id=>posterStudio.changeLayout(id),initial.layoutId);assert.equal(await page.evaluate(()=>posterStudio.getState().fontChoices.body),native);
  report.checks.push('The bundled layer editor font picker is captured and retained');
  if(fontFile){
    await page.click('#edit-fonts');await(await page.$('#file-font')).uploadFile(fontFile);
    await page.waitForFunction(()=>posterStudio.ready()&&posterStudio.getState().importedFonts.length===1);
    const imported=await page.evaluate(()=>posterStudio.getState().importedFonts[0]);
    await page.select('#font-family',imported.id);await page.select('#font-target','body');await page.click('#apply-font');
    await page.waitForFunction(id=>posterStudio.ready()&&posterStudio.getState().fontChoices.body?.includes(id),{},imported.id);
    assert.ok(await page.evaluate(id=>[...document.getElementById('editor-frame').contentDocument.fonts].some(f=>f.family.replace(/"/g,'')===id&&f.status==='loaded'),imported.id));
    await page.evaluate(async id=>{
      const s=posterStudio.getState();s.paper='#FFFFFF';s.textColor='#000000';s.background=null;s.titleImage=null;s.subjectImages=[];s.removed=[];s.protectedRegions=[];
      for(const k of Object.keys(s.content))s.content[k]='';s.content.body='WWWWiiii 0123456789';s.edits={body:{left:'30px',top:'100px',width:'650px',height:'70px',fontSize:'42px',lineHeight:'42px',fontWeight:'400',color:'#000000',textAlign:'left'}};s.fontChoices={body:'"'+id+'",sans-serif'};await posterStudio.setState(s);
    },imported.id);
    const pixels=await page.evaluate(async id=>{
      const blob=await posterStudio.exportPNG(false,false),image=await createImageBitmap(blob),c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);
      const data=ctx.getImageData(0,0,c.width,c.height).data;let left=c.width,right=0;
      for(let y=80;y<190;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4;if(data[i]<180&&data[i+1]<180&&data[i+2]<180){left=Math.min(left,x);right=Math.max(right,x);}}
      ctx.font=`400 42px "${id}"`;const m=ctx.measureText('WWWWiiii 0123456789');return {actual:right-left+1,expected:m.actualBoundingBoxLeft+m.actualBoundingBoxRight};
    },imported.id);assert.ok(Math.abs(pixels.actual-pixels.expected)<4,JSON.stringify(pixels));report.embeddedFontPixels=pixels;
    const data=await page.evaluate(async()=>Array.from(new Uint8Array(await(await posterStudio.exportPNG(false,false)).arrayBuffer())));await fs.writeFile(join(root,'imported-font-export.png'),Buffer.from(data));
    await page.reload();await page.waitForFunction(()=>window.posterStudio?.ready());const reopened=await page.evaluate(()=>posterStudio.getState());assert.equal(reopened.importedFonts[0].data,imported.data);assert.ok(reopened.fontChoices.body.includes(imported.id));assert.deepEqual(reopened.layoutRecommendations,ids);
    await fs.writeFile(join(root,'imported-font-project.json'),JSON.stringify(reopened,null,2));
    report.checks.push('Local WOFF2 font decodes, exports with matching glyph pixel width and survives draft reload');
  }
  await page.evaluate(async initial=>posterStudio.setState(initial),initial);
  await page.evaluate(async()=>{
    const s=posterStudio.getState();delete s.layoutRecommendations;s.edits.background.top='250px';
    await new Promise((resolve,reject)=>{const r=indexedDB.open('poster-layout-studio-v1',1);r.onsuccess=()=>{const tx=r.result.transaction('projects','readwrite');tx.objectStore('projects').put(s,'draft:'+location.pathname);tx.oncomplete=()=>{r.result.close();resolve();};tx.onerror=reject;};r.onerror=reject;});
  });
  await page.reload();await page.waitForFunction(()=>window.posterStudio?.ready());await sameRecommendations();assert.equal(await page.evaluate(()=>posterStudio.getState().edits.background.top),'250px');
  report.checks.push('An older draft inherits original recommendations while retaining manually moved artwork');
  await page.evaluate(async()=>{const s=posterStudio.getState();s.edits.background.top='0px';s.protectedRegions=[{layer:'background',name:'完整保护',x:0,y:0,w:1,h:1}];await posterStudio.setState(s);});await sameRecommendations();
  await page.click('#refresh-layouts');assert.deepEqual(await page.evaluate(()=>posterStudio.getState().layoutRecommendations),[]);
  report.checks.push('Only explicit rescreening removes candidates that now obstruct protected content');
  await page.evaluate(async initial=>posterStudio.setState(initial),initial);
  await page.screenshot({path:join(root,'editor-preview.png')});
  await page.click('#edit-fonts');await page.screenshot({path:join(root,'font-picker-preview.png')});await page.click('[data-close="font-dialog"]');
  await page.evaluate(async()=>{const s=posterStudio.getState();s.culturalReview.output.status='hold';await posterStudio.setState(s);});
  assert.equal(await page.evaluate(async()=>{try{await posterStudio.exportPNG(false,false);return false;}catch{return true;}}),true);
  report.checks.push('Recorded cultural review holds still block export');
  assert.deepEqual(report.errors,[]);report.browser=await browser.version();report.passed=true;
}catch(e){report.passed=false;report.error=e.stack;process.exitCode=1;}
finally{await fs.writeFile(join(root,'adaptation-verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();}
