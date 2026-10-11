#!/usr/bin/env node
// Check visible PNG edges and scale, not only CSS rectangles.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
const root=resolve(process.argv[2]),runner=resolve(process.argv[3]||join(homedir(),'.codex/skills/editable-design/scripts/_browser.mjs'));
const {launch}=await import(pathToFileURL(runner)),browser=await launch();
const report={checks:[],errors:[]};
try{
  const page=await browser.newPage();await page.setViewport({width:1640,height:1180});
  page.on('pageerror',e=>report.errors.push(e.stack||e.message));
  await page.goto(pathToFileURL(join(root,'editor.html')).href);await page.waitForFunction(()=>window.posterStudio?.ready());
  const base=await page.evaluate(()=>posterStudio.getState());
  const blank=Object.fromEntries(Object.keys(base.content).map(k=>[k,'']));
  const pixelBounds=async(color)=>page.evaluate(async color=>{
    const img=await createImageBitmap(await posterStudio.exportPNG(false,false)),c=document.createElement('canvas');c.width=img.width;c.height=img.height;
    const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const d=ctx.getImageData(0,0,c.width,c.height).data;
    let left=c.width,right=-1,top=c.height,bottom=-1,count=0;
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
      const i=(y*c.width+x)*4,hit=color==='red'?d[i]>180&&d[i+1]<90&&d[i+2]<90:d[i]<90&&d[i+1]<90&&d[i+2]<90;
      if(hit){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);count++;}
    }
    return {left,right,top,bottom,count,width:right-left+1,height:bottom-top+1};
  },color);
  for(const family of ['Arial','Georgia','Courier New']){
    await page.evaluate(async({base,blank,family})=>posterStudio.setState({...base,content:{...blank,body:'AV\nI'},background:null,titleImage:null,subjectImages:[],edits:{body:{left:'120px',top:'300px',width:'380px',height:'260px',fontSize:'100px',lineHeight:'130px',letterSpacing:'16px',fontWeight:'700',textAlign:'right',fontFamily:'"'+family+'",serif'}},paper:'#ffffff',textColor:'#000000'}),{base,blank,family});
    const pixels=await pixelBounds('black');assert.ok(Math.abs(pixels.right+1-500)<=2,`${family} ink right ${pixels.right+1} should meet grid 500`);
    assert.equal(await page.evaluate(()=>posterStudio.getState().edits.body.width),'380px');
    report.checks.push(`${family}: visible right edge ${pixels.right+1}px meets 500px grid, manual width remains 380px`);
  }
  await page.evaluate(async({base,blank})=>posterStudio.setState({...base,content:{...blank,body:'山水之间\n2026'},background:null,titleImage:null,subjectImages:[],edits:{body:{left:'100px',top:'300px',width:'600px',height:'260px',fontSize:'88px',lineHeight:'110px',letterSpacing:'5px',fontWeight:'700',textAlign:'right'}},paper:'#ffffff',textColor:'#000000',fontChoices:{body:'"PingFang SC",sans-serif'}}),{base,blank});
  const chinese=await pixelBounds('black');assert.ok(Math.abs(chinese.right+1-700)<=2);report.checks.push('Mixed Chinese and Latin visible glyphs meet the same right grid');
  // A short right-aligned title with very large alpha padding.
  const padded=await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=400;c.height=400;const ctx=c.getContext('2d');ctx.fillStyle='#ef1010';ctx.fillRect(80,100,80,180);
    return {name:'padded-title.png',data:c.toDataURL(),width:400,height:400,sourceText:'TITLE'};
  });
  await page.evaluate(async({base,blank,padded})=>posterStudio.setState({...base,layoutId:'L04',content:{...blank,title:'TITLE'},titleImage:padded,background:null,subjectImages:[],edits:{},paper:'#ffffff'}),{base,blank,padded});
  const title=await page.evaluate(()=>{const s=posterStudio.getState(),e=s.edits.title;return {w:s.titleImage.width,h:s.titleImage.height,right:parseFloat(e.left)+parseFloat(e.width),layerW:parseFloat(e.width),layerH:parseFloat(e.height)};});
  assert.deepEqual([title.w,title.h],[80,180]);assert.ok(Math.abs(title.right-716)<.1);assert.ok(Math.abs(title.layerW/title.layerH-80/180)<.001);
  const titlePixels=await pixelBounds('red');assert.ok(Math.abs(titlePixels.right+1-716)<=2);report.checks.push('Padded art title trims to 80×180 and its PNG ink meets the right title grid at 716px');
  for(const ratio of ['2:3','4:5','3:4']){
    await page.evaluate(r=>posterStudio.changeCanvas(r),ratio);
    const edge=716*(ratio==='3:4'?1:800/750),pixels=await pixelBounds('red');assert.ok(Math.abs(pixels.right+1-edge)<=2,`${ratio}: visible right ${pixels.right+1}, expected ${edge}`);
  }
  report.checks.push('Art title right edge stays aligned across all three canvas ratios');
  const savePNG=async name=>{
    const bytes=await page.evaluate(async()=>Array.from(new Uint8Array(await (await posterStudio.exportPNG(false,false)).arrayBuffer())));
    await fs.writeFile(join(root,name),Buffer.from(bytes));
  };
  await savePNG('right-title.png');
  const subject=await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=600;c.height=900;const ctx=c.getContext('2d');ctx.fillStyle='#ef1010';ctx.fillRect(100,100,400,700);
    return {name:'padded-hero.png',data:c.toDataURL(),width:600,height:900};
  });
  await page.evaluate(async({base,blank,subject})=>posterStudio.setState({...base,layoutId:'L03',layoutRecommendations:null,content:{...blank,title:'主视觉'},background:null,titleImage:null,subjectImages:[subject],subjectTreatment:'cutout',edits:{},paper:'#ffffff'}),{base,blank,subject});
  const s=await page.evaluate(()=>posterStudio.getState()),pixels=await pixelBounds('red');
  assert.deepEqual([s.subjectImages[0].width,s.subjectImages[0].height],[400,700]);assert.ok(pixels.height>=680,`hero height ${pixels.height}`);
  assert.equal(await page.evaluate(()=>PosterPlanning.layoutConflicts(STUDIO_BUNDLE.catalog.layouts.find(l=>l.id==='L03'),posterStudio.getState()).length),0);
  report.checks.push(`Fresh primary subject uses ${pixels.height}px visible height, exceeding the former padded 482px result, without covering the title`);
  await savePNG('large-primary.png');
  const rec=s.layoutRecommendations;
  await page.click('#enlarge-visual');await page.waitForFunction(()=>posterStudio.ready()&&parseFloat(posterStudio.getState().edits['subject-1'].height)>740);
  const enlarged=await page.evaluate(()=>posterStudio.getState());
  assert.ok(Math.abs(parseFloat(enlarged.edits['subject-1'].height)/parseFloat(s.edits['subject-1'].height)-1.25)<.001);assert.deepEqual(enlarged.layoutRecommendations,rec);
  await page.click('#undo-layout');await page.waitForFunction(()=>posterStudio.ready()&&parseFloat(posterStudio.getState().edits['subject-1'].height)<740);
  assert.deepEqual((await page.evaluate(()=>posterStudio.getState())).edits['subject-1'],s.edits['subject-1']);
  for(const ratio of ['2:3','4:5','3:4']){await page.evaluate(r=>posterStudio.changeCanvas(r),ratio);assert.deepEqual((await page.evaluate(()=>posterStudio.getState())).layoutRecommendations,rec);}
  report.checks.push('25% enlargement is reversible; recommendations survive enlargement and ratio changes');
  // Existing project geometry and alpha padding are not silently changed.
  const manual={left:'40px',top:'350px',width:'225px',height:'275px'};
  await page.evaluate(async({base,blank,padded,subject,manual})=>posterStudio.setState({...base,content:{...blank,title:'TITLE'},titleImage:padded,subjectImages:[subject],edits:{title:manual,'subject-1':manual}}),{base,blank,padded,subject,manual});
  const restored=await page.evaluate(()=>posterStudio.getState());for(const id of ['title','subject-1'])for(const prop of Object.keys(manual))assert.equal(restored.edits[id][prop],manual[prop]);
  assert.equal(restored.titleImage.data,padded.data);assert.equal(restored.subjectImages[0].data,subject.data);
  await page.reload();await page.waitForFunction(()=>posterStudio.ready());const reopened=await page.evaluate(()=>posterStudio.getState());assert.equal(reopened.edits.title.width,'225px');
  report.checks.push('Saved manual title/subject boxes and source pixels survive rebuild and draft reload');
  const offCanvas=await page.evaluate(()=>PosterOptical.subjectRect(STUDIO_BUNDLE.catalog.layouts[0],{}, {width:400,height:700},[{x:3000,y:3000,w:500,h:500}]));assert.ok(offCanvas.x>=0&&offCanvas.x+offCanvas.w<=750&&offCanvas.y+offCanvas.h<=1000);
  const review=await page.evaluate(()=>{const s=posterStudio.getState();delete s.renderRevision;s.culturalReview.output={status:'reviewed',findings:[]};return posterStudio.validateProject(s).culturalReview.output.status;});assert.equal(review,'pending');
  report.checks.push('Off-canvas saved subjects do not distort fresh placement; older reviewed renderings require renewed output review');
  const upload=join(root,'padded-hero.png');await fs.writeFile(upload,Buffer.from(subject.data.split(',')[1],'base64'));
  const pendingRegion={layer:'subject-1',name:'主体细节',x:.2,y:.2,w:.2,h:.2};
  await page.evaluate(async({base,blank,pendingRegion})=>posterStudio.setState({...base,content:{...blank,title:'主视觉'},layoutId:'L03',layoutRecommendations:null,background:null,titleImage:null,subjectImages:[],edits:{},removed:[],protectedRegions:[pendingRegion]}),{base,blank,pendingRegion});
  await(await page.$('#file-subject')).uploadFile(upload);await page.waitForFunction(()=>posterStudio.ready()&&posterStudio.getState().subjectImages.length===1);
  const protectedUpload=await page.evaluate(()=>posterStudio.getState());assert.equal(protectedUpload.subjectImages[0].width,600);assert.equal(protectedUpload.subjectImages[0].data,subject.data);assert.deepEqual(protectedUpload.protectedRegions,[pendingRegion]);
  await page.evaluate(async({base,blank})=>posterStudio.setState({...base,content:{...blank,title:'主视觉'},layoutId:'L03',layoutRecommendations:null,background:null,titleImage:null,subjectImages:[],edits:{},removed:[],protectedRegions:[]}),{base,blank});
  await(await page.$('#file-subject')).uploadFile(upload);await page.waitForFunction(()=>posterStudio.ready()&&posterStudio.getState().subjectImages.length===1);
  assert.equal(await page.evaluate(()=>posterStudio.getState().subjectImages[0].width),400);
  report.checks.push('Actual file upload trims new subjects while preserving source pixels and coordinates for premarked protection regions');
  assert.deepEqual(report.errors,[]);await fs.writeFile(join(root,'optical-verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
