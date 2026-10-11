/* Optical geometry belongs to the studio adapter; the layer runtime stays unchanged. */
window.PosterOptical=(()=>{
  'use strict';
  function titleBox(slot,asset){
    const k=Math.min(slot.w/(asset.width||slot.w),slot.h/(asset.height||slot.h));
    const w=(asset.width||slot.w)*k,h=(asset.height||slot.h)*k;
    return {...slot,x:slot.x+(slot.align==='right'?slot.w-w:slot.align==='center'?(slot.w-w)/2:0),w,h};
  }
  async function trimAlpha(asset){
    const img=new Image();img.src=asset.data;await img.decode();
    const width=img.naturalWidth,height=img.naturalHeight;
    // Bound memory for unusually large uploads. Opaque backgrounds are never trimmed.
    if(width*height>25000000)return {...asset,width,height};
    const c=document.createElement('canvas');c.width=width;c.height=height;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
    const data=ctx.getImageData(0,0,width,height).data;
    let left=width,top=height,right=-1,bottom=-1;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>0){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
    if(right<left)throw new Error('图片完全透明，请导入有可见内容的图片');
    if(left===0&&top===0&&right===width-1&&bottom===height-1)return {...asset,width,height};
    const out=document.createElement('canvas');out.width=right-left+1;out.height=bottom-top+1;
    out.getContext('2d').drawImage(c,left,top,out.width,out.height,0,0,out.width,out.height);
    return {...asset,data:out.toDataURL('image/png'),width:out.width,height:out.height};
  }
  function inkBounds(el,win=el.ownerDocument.defaultView){
    const cs=win.getComputedStyle(el),rect=el.getBoundingClientRect();
    if(!el.offsetWidth||!el.offsetHeight||cs.writingMode!=='horizontal-tb')return null;
    const sx=rect.width/el.offsetWidth,sy=rect.height/el.offsetHeight;
    const walker=el.ownerDocument.createTreeWalker(el,win.NodeFilter.SHOW_TEXT),lines=[];
    const range=el.ownerDocument.createRange();let node;
    while((node=walker.nextNode()))for(let i=0;i<node.length;){
      const char=String.fromCodePoint(node.data.codePointAt(i)),end=i+char.length;
      range.setStart(node,i);range.setEnd(node,end);const r=range.getBoundingClientRect();i=end;
      if(!r.width||/^[\r\n]$/.test(char))continue;
      const y=(r.top-rect.top)/sy,x=(r.left-rect.left)/sx;
      let line=lines.find(l=>Math.abs(l.y-y)<1);if(!line){line={x,y,w:0,h:r.height/sy,text:''};lines.push(line);}
      line.text+=char;line.x=Math.min(line.x,x);line.w=Math.max(line.w,x+r.width/sx-line.x);
    }
    const ctx=el.ownerDocument.createElement('canvas').getContext('2d');
    ctx.font=`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;ctx.textAlign='left';ctx.direction=cs.direction;
    const tracking=parseFloat(cs.letterSpacing)||0;if('letterSpacing' in ctx)ctx.letterSpacing=tracking+'px';
    let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
    for(const l of lines){
      const m=ctx.measureText(l.text);if(!l.text.trim()||!Number.isFinite(m.actualBoundingBoxRight))continue;
      const extra='letterSpacing' in ctx?0:Math.max(0,Array.from(l.text).length-1)*tracking;
      left=Math.min(left,l.x-m.actualBoundingBoxLeft);right=Math.max(right,l.x+m.actualBoundingBoxRight+extra);top=Math.min(top,l.y);bottom=Math.max(bottom,l.y+l.h);
    }
    return Number.isFinite(left)&&right>left?{x:left,y:top,w:right-left,h:bottom-top}:null;
  }
  function alignInk(el){
    const win=el.ownerDocument.defaultView,cs=win.getComputedStyle(el);
    if(cs.writingMode!=='horizontal-tb'||el.isContentEditable)return;
    let span=el.querySelector(':scope > .studio-ink');
    if(!span){const text=el.innerText;span=el.ownerDocument.createElement('span');span.className='studio-ink';span.textContent=text;el.replaceChildren(span);}
    span.style.position='relative';span.style.left='0px';
    const bounds=inkBounds(el,win);if(!bounds)return;
    const align=cs.textAlign==='end'?(cs.direction==='rtl'?'left':'right'):cs.textAlign==='start'?(cs.direction==='rtl'?'right':'left'):cs.textAlign;
    const dx=align==='right'?el.clientWidth-bounds.x-bounds.w:align==='center'?(el.clientWidth-bounds.w)/2-bounds.x:-bounds.x;
    // Shift ink inside the user's fixed box; font/wording/wrap width stay intact.
    span.style.left=dx+'px';
  }
  function subjectRect(layout,content,asset,occupied=[]){
    // Use the whole largest compatible region, rather than a fixed centered small box.
    const obstacles=[...layout.slots.filter(s=>content[s.key]).map(s=>({x:s.x-12,y:s.y-12,w:s.w+24,h:s.h+24})),...occupied];
    const clamp=(n,max)=>Math.max(0,Math.min(max,n));
    const xs=[...new Set([0,750,...obstacles.flatMap(r=>[clamp(r.x,750),clamp(r.x+r.w,750)])])].sort((a,b)=>a-b);
    const ys=[...new Set([0,1000,...obstacles.flatMap(r=>[clamp(r.y,1000),clamp(r.y+r.h,1000)])])].sort((a,b)=>a-b);
    const aw=asset.width||1,ah=asset.height||1;let best=null,bestZoneArea=0;
    for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++)for(let m=0;m<ys.length;m++)for(let n=m+1;n<ys.length;n++){
      const zone={x:xs[i],y:ys[m],w:xs[j]-xs[i],h:ys[n]-ys[m]};if(zone.w<48||zone.h<48||obstacles.some(r=>window.PosterPlanning.overlap(zone,r)>1))continue;
      const k=Math.min(zone.w/aw,zone.h/ah),w=aw*k,h=ah*k;
      const r={x:zone.x+(zone.w-w)/2,y:zone.y+(zone.h-h)/2,w,h};
      if(!best||w*h>best.w*best.h+.01||(Math.abs(w*h-best.w*best.h)<.01&&zone.w*zone.h>bestZoneArea)){best=r;bestZoneArea=zone.w*zone.h;}
    }
    // Crowded documents still import every subject; overlap checks flag manual adjustment.
    return best||{x:0,y:80,w:750,h:840};
  }
  return {titleBox,trimAlpha,inkBounds,alignInk,subjectRect};
})();
