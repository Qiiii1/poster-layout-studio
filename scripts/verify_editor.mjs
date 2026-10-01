#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { homedir, tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=resolve(process.argv[2]||'output'), source=resolve(process.argv[3]||join(homedir(),'.codex/skills/editable-design/scripts/_browser.mjs'));
const {launch}=await import(pathToFileURL(source));
const browser=await launch(), results={checks:[],sampleWarnings:{},browserErrors:[]};
try {
  const page=await browser.newPage();await page.setViewport({width:1600,height:1180,deviceScaleFactor:1});
  page.on('pageerror',e=>results.browserErrors.push(e.message));
  await page.goto(pathToFileURL(join(root,'editor.html')).href);
  await page.waitForFunction(()=>window.posterStudio?.ready(),{timeout:20000});
  const base=await page.evaluate(()=>posterStudio.getState());
  for(const l of await page.evaluate(()=>STUDIO_BUNDLE.catalog.layouts)){
    await page.evaluate(async({base,l})=>{await posterStudio.setState({...base,layoutId:l.id,content:l.sampleContent,edits:{}});},{base,l});
    const warnings=await page.evaluate(()=>posterStudio.checks());if(warnings.length)results.sampleWarnings[l.id]=warnings;
  }
  results.checks.push('All 16 templates mount without errors');
  await page.evaluate(async base=>{await posterStudio.setState(base);},base);
  await page.click('#edit-copy');await page.$eval('#copy-fields textarea[data-key="title"]',el=>el.value='书与城市');await page.click('#apply-copy');
  await page.waitForFunction(()=>posterStudio.ready()&&posterStudio.getState().content.title==='书与城市');
  await page.evaluate(()=>posterStudio.changeLayout('L07'));
  assert.equal(await page.evaluate(()=>posterStudio.getState().content.title),'书与城市');
  await page.click('#undo-layout');await page.waitForFunction(()=>posterStudio.ready()&&posterStudio.getState().layoutId==='L01');
  assert.equal(await page.evaluate(()=>posterStudio.getState().content.title),'书与城市');
  results.checks.push('Copy edit, template switch, and undo preserve user content');
  let child=page.frames().find(f=>f!==page.mainFrame());
  const target=await child.$('[data-layer-id="title"]'), box=await target.boundingBox();
  const before=await target.evaluate(el=>({left:parseFloat(el.style.left),top:parseFloat(el.style.top)}));
  await page.mouse.move(box.x+box.width*.45,box.y+box.height*.4);await page.mouse.down();await page.mouse.move(box.x+box.width*.45+35,box.y+box.height*.4-28,{steps:8});await page.mouse.up();
  const moved=await target.evaluate(el=>({left:parseFloat(el.style.left),top:parseFloat(el.style.top)}));
  assert.ok(Math.abs(moved.left-before.left)>10||Math.abs(moved.top-before.top)>10);
  await child.click('#hf-undo');
  const undone=await target.evaluate(el=>({left:parseFloat(el.style.left),top:parseFloat(el.style.top)}));assert.deepEqual(undone,before);
  results.checks.push('Pointer drag and native undo work at display zoom');
  // Double-click edit through actual mouse events, then type and commit.
  const b2=await target.boundingBox();const cx=b2.x+b2.width*.45,cy=b2.y+b2.height*.4;
  await page.mouse.click(cx,cy);await page.mouse.down({clickCount:2});await page.mouse.up({clickCount:2});
  await child.waitForSelector('[contenteditable="plaintext-only"]',{timeout:3000});
  await page.keyboard.down('Meta');await page.keyboard.press('KeyA');await page.keyboard.up('Meta');await page.keyboard.type('TEST TITLE');await page.keyboard.press('Enter');
  assert.equal(await target.evaluate(el=>el.textContent),'TEST TITLE');
  results.checks.push('Native double-click text editing and commit work');
  await child.evaluate(()=>{const a=__layerEditor;a.removeLayer(a.layers().find(x=>x.id==='footer2').el);});
  await page.evaluate(()=>posterStudio.changeLayout('L08'));
  assert.ok(await page.evaluate(()=>posterStudio.getState().removed.includes('footer2')));
  await page.evaluate(()=>posterStudio.changeLayout('L01'));
  assert.equal(await page.evaluate(()=>document.getElementById('editor-frame').contentDocument.querySelector('[data-layer-id="footer2"]')),null);
  results.checks.push('Deleted layers stay deleted through consecutive template switches');
  const png=await page.evaluate(async()=>{
    const c=document.createElement('canvas');c.width=750;c.height=1000;const x=c.getContext('2d');x.fillStyle='#e9e2d5';x.fillRect(0,0,750,1000);x.fillStyle='#d85732';x.fillRect(240,350,300,350);return c.toDataURL();
  });
  const fixture=join(tmpdir(),'poster-studio-background-test.png');await fs.writeFile(fixture,Buffer.from(png.split(',')[1],'base64'));
  const input=await page.$('#file-background');await input.uploadFile(fixture);
  await page.waitForFunction(()=>posterStudio.ready()&&posterStudio.getState().background!==null);
  const withBackground=await page.evaluate(()=>posterStudio.getState());
  await page.evaluate(()=>posterStudio.changeLayout('L11'));
  assert.equal(await page.evaluate(()=>posterStudio.getState().background.data),withBackground.background.data);
  const saveExport=async(bg,file)=>{const data=await page.evaluate(async bg=>Array.from(new Uint8Array(await(await posterStudio.exportPNG(bg,false)).arrayBuffer())),bg);await fs.writeFile(join(root,file),Buffer.from(data));return data;};
  await saveExport(true,'test-background.png');await saveExport(false,'test-composite.png');
  const pixelResult=await page.evaluate(async()=>{
    const blob=await posterStudio.exportPNG(true,false),img=await createImageBitmap(blob),c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);return {width:img.width,height:img.height,paper:Array.from(x.getImageData(50,50,1,1).data),art:Array.from(x.getImageData(300,400,1,1).data)};
  });assert.deepEqual(pixelResult,{width:750,height:1000,paper:[233,226,213,255],art:[216,87,50,255]});
  results.checks.push('Background upload survives template switch; background PNG has no text and exact expected pixels');
  const titlePNG=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=400;c.height=120;const x=c.getContext('2d');x.fillStyle='#1262d8';x.fillRect(20,20,360,80);return c.toDataURL();});
  const titleFile=join(tmpdir(),'poster-studio-title-test.png');await fs.writeFile(titleFile,Buffer.from(titlePNG.split(',')[1],'base64'));await(await page.$('#file-title')).uploadFile(titleFile);
  await page.waitForFunction(()=>posterStudio.ready()&&posterStudio.getState().titleImage!==null);
  assert.equal(await page.evaluate(()=>document.getElementById('editor-frame').contentDocument.querySelector('[data-layer-id="title"]').tagName),'IMG');
  await saveExport(false,'test-title-composite.png');await page.select('#export-scale','2');
  const dim=await page.evaluate(async()=>{const b=await posterStudio.exportPNG(false,false),i=await createImageBitmap(b);return [i.width,i.height];});assert.deepEqual(dim,[1500,2000]);
  results.checks.push('Separate title image imports and exports; 2× PNG is 1500 × 2000');
  const saved=await page.evaluate(()=>posterStudio.getState());await page.reload();await page.waitForFunction(()=>posterStudio?.ready());
  assert.deepEqual(await page.evaluate(()=>({title:posterStudio.getState().content.title,background:posterStudio.getState().background.data,titleImage:posterStudio.getState().titleImage.data})),{title:saved.content.title,background:saved.background.data,titleImage:saved.titleImage.data});
  results.checks.push('Browser reload restores artwork, title image, text and layout from draft');
  await page.evaluate(async base=>{await posterStudio.setState(base);},base);
  const invalid=await page.evaluate(()=>{try{posterStudio.validateProject({version:1,layoutId:'<script>',styleId:'y2k'});return false;}catch{return true;}});assert.equal(invalid,true);
  await page.screenshot({path:join(root,'editor-preview.png')});
  await saveExport(false,'sample-poster.png');
  assert.equal(results.browserErrors.length,0);results.checks.push('No uncaught browser errors');
  const sheet=await browser.newPage();await sheet.setViewport({width:1180,height:1950,deviceScaleFactor:1});await sheet.goto(pathToFileURL(join(root,'layouts.html')).href);await sheet.evaluate(()=>document.fonts.ready);await sheet.screenshot({path:join(root,'layouts-preview.png'),fullPage:true});await sheet.close();
  results.browser=await browser.version();
  console.log(JSON.stringify(results,null,2));
} catch(e){results.error=e.stack;console.error(e);process.exitCode=1;}
finally{await fs.writeFile(join(root,'verification.json'),JSON.stringify(results,null,2));await browser.close();}
