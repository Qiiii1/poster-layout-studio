(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.PosterPlanning=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const presets={'2:3':{width:800,height:1200},'4:5':{width:800,height:1000},'3:4':{width:750,height:1000}};
  const size=s=>presets[s.canvasRatio]||presets['3:4'];
  const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
  const zones={center:{x:205,y:300,w:340,h:420},top:{x:110,y:50,w:530,h:390},bottom:{x:95,y:570,w:560,h:365},left:{x:30,y:170,w:330,h:650},right:{x:390,y:170,w:330,h:650}};
  function box(state,id,asset){
    const d=size(state),r=id==='background'?{x:0,y:0,w:750,h:1000}:asset?.rect||{x:125,y:230,w:500,h:620},e=state.edits?.[id]||{};
    return {x:parseFloat(e.left??r.x*d.width/750),y:parseFloat(e.top??r.y*d.height/1000),w:parseFloat(e.width??r.w*d.width/750),h:parseFloat(e.height??r.h*d.height/1000)};
  }
  function imageRect(asset,b,fit='contain'){
    const w=asset?.width||b.w,h=asset?.height||b.h,k=fit==='cover'?Math.max(b.w/w,b.h/h):Math.min(b.w/w,b.h/h);
    return {x:b.x+(b.w-w*k)/2,y:b.y+(b.h-h*k)/2,w:w*k,h:h*k};
  }
  function normalizeRegions(regions=[]){
    if(!Array.isArray(regions)||regions.length>64)throw new Error('主体保护区域格式错误');
    return regions.map(r=>{
      if(!r||!/^background$|^subject-[1-8]$/.test(r.layer)||!['x','y','w','h'].every(k=>typeof r[k]==='number'&&Number.isFinite(r[k]))||r.x<0||r.y<0||r.w<=0||r.h<=0||r.x+r.w>1.000001||r.y+r.h>1.000001)throw new Error('保护区域应使用图片内 0–1 坐标');
      return {layer:r.layer,name:String(r.name||'重要区域').slice(0,100),x:r.x,y:r.y,w:r.w,h:r.h};
    });
  }
  function protectedRects(state){
    const removed=state.removed||[],regions=normalizeRegions(state.protectedRegions),rects=[];
    for(const r of regions){
      if(removed.includes(r.layer))continue;
      const asset=r.layer==='background'?(state.background||{}):(state.subjectImages?.[Number(r.layer.slice(8))-1]||{rect:state.subjectRects?.[Number(r.layer.slice(8))-1]});
      const b=box(state,r.layer,asset),im=imageRect(asset,b,r.layer==='background'?state.bgFit:'contain');
      // object-fit clips to the image element, and the canvas clips again.
      const d=size(state),x=Math.max(0,b.x,im.x+r.x*im.w),y=Math.max(0,b.y,im.y+r.y*im.h);
      const right=Math.min(d.width,b.x+b.w,im.x+(r.x+r.w)*im.w),bottom=Math.min(d.height,b.y+b.h,im.y+(r.y+r.h)*im.h);
      if(right>x&&bottom>y)rects.push({x,y,w:right-x,h:bottom-y,name:r.name,layer:r.layer});
    }
    if(!regions.length){
      const z=zones[state.subjectZone],d=size(state);
      if(z)rects.push({x:z.x*d.width/750,y:z.y*d.height/1000,w:z.w*d.width/750,h:z.h*d.height/1000,name:'主体大致区域',layer:'background'});
      else for(const [i,asset] of (state.subjectImages||[]).entries())if(!removed.includes('subject-'+(i+1)))rects.push({...imageRect(asset,box(state,'subject-'+(i+1),asset)),name:'主体 '+(i+1),layer:'subject-'+(i+1)});
    }
    return rects;
  }
  function layoutConflicts(layout,state){
    const d=size(state),regions=protectedRects(state),content=state.content||{};
    return layout.slots.filter(s=>content[s.key]&&!(state.removed||[]).includes(s.key)).flatMap(s=>{
      const b={x:s.x*d.width/750,y:s.y*d.height/1000,w:s.w*d.width/750,h:s.h*d.height/1000};
      return regions.filter(r=>overlap(b,r)>1).map(r=>s.key+' 遮挡 '+r.name);
    });
  }
  function normalizeReview(value){
    const result={input:{status:'pending',findings:[]},output:{status:'pending',findings:[]}};
    if(value===undefined)return result;
    if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('文化审核记录格式错误');
    for(const stage of ['input','output'])if(value[stage]){
      const v=value[stage];if(!['pending','reviewed','hold'].includes(v.status)||!Array.isArray(v.findings)||v.findings.length>64||v.findings.some(x=>typeof x!=='string'||x.length>1000))throw new Error('文化审核状态或摘要格式错误');
      result[stage]={status:v.status,findings:[...v.findings]};
    }
    return result;
  }
  function normalizeRoster(value){
    if(value===undefined)return {confirmed:false,items:[]};
    if(!value||typeof value.confirmed!=='boolean'||!Array.isArray(value.items)||value.items.length>8||value.items.some(x=>typeof x!=='string'||x.length>300))throw new Error('抠图主体清单格式错误');
    return {confirmed:value.confirmed,items:[...value.items]};
  }
  function normalizePalette(value){
    if(value===undefined||value===null)return null;
    if(!value||!Array.isArray(value.colors)||value.colors.length<1||value.colors.length>8||value.colors.some(x=>!/^#[0-9a-f]{6}$/i.test(x)))throw new Error('素材配色格式错误');
    return {colors:[...new Set(value.colors.map(x=>x.toUpperCase()))],source:String(value.source||'素材取色').slice(0,200)};
  }
  function normalizeWeb(value){
    if(value===undefined)return {choice:'pending',elements:[]};
    if(!value||!['pending','no','suggest','use'].includes(value.choice)||!Array.isArray(value.elements)||value.elements.length>20)throw new Error('联网元素选择格式错误');
    return {choice:value.choice,elements:value.elements.map(x=>{
      if(!x||typeof x.name!=='string'||typeof x.url!=='string'||!/^https?:\/\//.test(x.url)||x.url.length>2000)throw new Error('联网元素来源格式错误');
      return {name:x.name.slice(0,200),url:x.url,accepted:x.accepted===true};
    })};
  }
  function luminance(hex){const cs=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return cs[0]*.2126+cs[1]*.7152+cs[2]*.0722;}
  const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
  function paletteOptions(value){
    const p=normalizePalette(value);if(!p)return [];
    const colors=p.colors,light=[...colors].sort((a,b)=>luminance(b)-luminance(a))[0],dark=[...colors].sort((a,b)=>luminance(a)-luminance(b))[0];
    const ink=colors.find(x=>x!==light&&x!==dark)||dark;
    const text=base=>[...colors,'#17201C','#FAFAF7'].sort((a,b)=>contrast(base,b)-contrast(base,a))[0];
    return [{name:'素材浅底',paper:light,ink,accent:dark,textColor:text(light)},{name:'素材深底',paper:dark,ink:light,accent:ink,textColor:text(dark)}];
  }
  function sampleColors(imageData){
    const bins=new Map(),pixels=imageData.data;
    for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<160)continue;const rgb=[pixels[i],pixels[i+1],pixels[i+2]],key=rgb.map(x=>Math.floor(x/32)).join(',');let b=bins.get(key);if(!b){b={count:0,sum:[0,0,0]};bins.set(key,b);}b.count++;rgb.forEach((x,k)=>b.sum[k]+=x);}
    const colors=[];
    for(const b of [...bins.values()].sort((a,b)=>b.count-a.count)){
      const rgb=b.sum.map(x=>Math.round(x/b.count));
      if(colors.some(c=>c.rgb.reduce((n,x,k)=>n+(x-rgb[k])**2,0)<1800))continue;
      colors.push({rgb,hex:'#'+rgb.map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase()});if(colors.length===6)break;
    }
    return colors.map(x=>x.hex);
  }
  return {size,box,imageRect,overlap,normalizeRegions,protectedRects,layoutConflicts,normalizeReview,normalizeRoster,normalizePalette,normalizeWeb,paletteOptions,sampleColors};
});
