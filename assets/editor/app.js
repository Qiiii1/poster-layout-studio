(() => {
  'use strict';
  const B=window.STUDIO_BUNDLE, layouts=B.catalog.layouts, styles=B.styles.styles, plan=window.PosterPlanning;
  const $=id=>document.getElementById(id), clone=x=>JSON.parse(JSON.stringify(x));
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={title:'主标题',subtitle:'副标题',kicker:'引题',body:'主要说明',note:'补充说明',footer1:'页脚左',footer2:'页脚中',footer3:'页脚右'};
  const layerLabel=id=>id==='background'?'底图':labels[id]||(/^subject-\d+$/.test(id)?'主体 '+id.slice(8):id);
  const defaultState={version:1,canvasRatio:'3:4',layoutId:'L01',styleId:'mono-color',content:clone(layouts[0].sampleContent),edits:{},removed:[],background:null,titleImage:null,subjectImages:[],subjectTreatment:'background',paper:'#FAFAF7',promptPaper:'#FAFAF7',ink:'#2148B8',accent:'#C65F38',textColor:'#1d201d',subject:'',texture:'标准 Y2K',subjectZone:'unknown',bgFit:'cover',selectedTags:{},hasSourcePhoto:null};
  let state=clone(B.initial||defaultState), previous=null, busy=false, ready=false, seq=0, lastPersist='', saveFailed=false, db, renderedRemoved=[];
  Object.assign(defaultState,{protectedRegions:[],sourcePalette:null,subjectRoster:{confirmed:false,items:[]},webAugmentation:{choice:'pending',elements:[]},culturalReview:plan.normalizeReview()});
  let reviewBaseline=null;
  const frame=$('editor-frame');
  const canvasPresets={'2:3':{width:800,height:1200},'4:5':{width:800,height:1000},'3:4':{width:750,height:1000}};
  const canvasSize=()=>canvasPresets[state.canvasRatio]||canvasPresets['3:4'];
  function adaptLayout(l){
    const d=canvasSize(),sx=d.width/750,sy=d.height/1000,k=Math.min(sx,sy);
    const rect=g=>({...g,x:g.x*sx,y:g.y*sy,w:g.w*sx,h:g.h*sy});
    return {...l,slots:l.slots.map(g=>({...rect(g),fontSize:g.fontSize*k,tracking:g.tracking*k})),referenceImageRegions:l.referenceImageRegions.map(rect),referenceDecorations:(l.referenceDecorations||[]).map(rect)};
  }
  async function changeCanvas(ratio){
    if(!canvasPresets[ratio])throw new Error('不支持的画布比例');
    if(ratio===state.canvasRatio)return;
    await transaction(()=>{
      const before=canvasSize();state.canvasRatio=ratio;const after=canvasSize();
      const sx=after.width/before.width,sy=after.height/before.height,k=Math.min(sx,sy);
      for(const edit of Object.values(state.edits))for(const prop of ['left','width','top','height','fontSize','lineHeight','letterSpacing']){
        if(edit[prop]?.endsWith('px'))edit[prop]=(parseFloat(edit[prop])*(prop==='left'||prop==='width'?sx:prop==='top'||prop==='height'?sy:k))+'px';
      }
    });
    toast('画布已适配；底图沿用原文件，请检查裁切与文字。');
  }
  const layout=()=>layouts.find(x=>x.id===state.layoutId), style=()=>styles.find(x=>x.id===state.styleId);
  const api=()=>frame.contentWindow?.__layerEditor;
  const toast=(message)=>{$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,4200);};
  function cssSlot(s){return `position:absolute;left:${s.x}px;top:${s.y}px;width:${s.w}px;height:${s.h}px;font-size:${s.fontSize}px;line-height:${s.lineHeight};font-weight:${s.weight};font-family:${s.fontFamily};text-align:${s.align};letter-spacing:${s.tracking}px;${s.vertical?'writing-mode:vertical-rl;text-orientation:mixed;':''}`;}
  function guideMarkup(l){return l.referenceImageRegions.map(g=>`<div style="position:absolute;left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px;background:#e5e5e3;${g.shape==='ellipse'?'border-radius:50%;':''}"></div>`).join('')+(l.referenceDecorations||[]).map(d=>`<div style="position:absolute;left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px;${d.type==='frame'?'border:1.5px solid #555':'border-bottom:4px solid #555'}">${d.type==='arrow'?'<span style="float:right;font:60px/1 sans-serif;transform:translateY(-9px)">›</span>':''}</div>`).join('');}
  const canvasBase=`*{box-sizing:border-box}html,body{margin:0;padding:0} :root{--font-display:"Arial Black","PingFang SC","Microsoft YaHei",sans-serif;--font-reading:"PingFang SC","Helvetica Neue",sans-serif;--font-literary:"Songti SC","Noto Serif CJK SC",serif;--font-utility:"SFMono-Regular","Courier New","PingFang SC",monospace} .poster-canvas{position:relative;width:750px;height:1000px;overflow:hidden;background:#fafaf7;color:#1d201d;isolation:isolate} .text-layer{margin:0;padding:0;white-space:pre-wrap;overflow-wrap:anywhere;word-break:normal;font-family:var(--font-display);z-index:10} .image-layer{position:absolute;object-fit:contain;z-index:10} .poster-background{position:absolute;left:0;top:0;width:750px;height:1000px;object-position:50% 50%;z-index:0;pointer-events:none}`;
  const themeCSS=`body.hf-on{background:#eceee6;color:#292d25}.hf-bar{background:#f9faf5;color:#36432d;border-color:#dadfd1;height:52px;gap:6px;padding:0 12px}.hf-title,.hf-sep,#hf-explode-save,#hf-save,#hf-css{display:none!important}.hf-btn{background:#f8faf3;color:#37412f;border-color:#d3dac9}.hf-btn:hover{background:#e7eddd}.hf-btn.primary{background:#365439;color:white}.hf-panel{background:#f7f8f2!important;color:#37412f!important;border-color:#d6ddcd!important}.hf-panel h4,.hf-panel label,.hf-panel .val,.hf-size-val{color:#59654e!important}.hf-layer{color:#47523e!important;border-color:#e1e5d9!important}.hf-layer:hover,.hf-layer.active{background:#e7eddf!important}.hf-hint{color:#7b826f!important;border-color:#dbe1d3!important}.hf-stage-wrap{background:#eceee6}.hf-canvas{box-shadow:0 10px 35px #2a3d2320}.hf-zoom{color:#798570}.hf-zoom input{accent-color:#536d44}.hf-panel select{background:white;color:#333;border-color:#c8d0bc}.hf-field{border-color:#d8dfce}.hf-layer .id{color:#606d52!important}`;
  function canvasMarkup(l,content,preview=false){
    l=adaptLayout(l);const {width:W,height:H}=canvasSize(),wireframe=preview===true,artwork=!preview||preview==='proposal';
    let html=`<div class="poster-canvas" data-canvas-width="${W}" data-canvas-height="${H}" data-layout="${l.id}" style="width:${W}px;height:${H}px;background:${wireframe?'#fff':state.paper};color:${wireframe?'#080808':state.textColor}">`;
    if(wireframe||(preview==='proposal'&&!state.background))html+=guideMarkup(l);
    if(artwork&&state.background&&!state.removed.includes('background')){
      const g=plan.box(state,'background',state.background);
      html+=`<img class="poster-background" data-layer-id="background" src="${escape(state.background.data)}" alt="底图" style="left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px;object-fit:${state.bgFit};z-index:0">`;
    }
    if(artwork)state.subjectImages.forEach((asset,i)=>{
      const id='subject-'+(i+1);if(state.removed.includes(id))return;
      const d=canvasSize(),r=asset.rect||{x:125,y:230,w:500,h:620};
      const base={left:r.x*d.width/750+'px',top:r.y*d.height/1000+'px',width:r.w*d.width/750+'px',height:r.h*d.height/1000+'px',...state.edits[id]};
      const css=Object.entries(base).map(([k,v])=>`${k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}:${v};`).join('');
      html+=`<img class="image-layer" data-layer-id="${id}" alt="${escape(layerLabel(id))}" src="${escape(asset.data)}" style="position:absolute;${escape(css)}object-fit:contain;z-index:5">`;
    });
    l.slots.forEach(s=>{
      if(state.removed.includes(s.key))return;
      const ed=!preview?state.edits[s.key]||{}:{};
      const custom=Object.entries(ed).map(([k,v])=>`${k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}:${v};`).join('');
      if(artwork&&s.key==='title'&&state.titleImage){html+=`<img class="image-layer" data-layer-id="title" alt="艺术标题" src="${escape(state.titleImage.data)}" style="${escape(cssSlot(s)+custom)}object-fit:contain">`;}
      else html+=`<div class="text-layer" ${preview?'':`data-layer-id="${s.key}" data-hf-width-locked="1"`} style="${escape(cssSlot(s)+custom)}">${escape(content[s.key]||'')}</div>`;
    });return html+'</div>';
  }
  function capture(){
    if(!ready||!api()||frame.contentDocument.querySelector('[contenteditable="plaintext-only"]'))return;
    const a=api();
    state.removed=[...new Set([...renderedRemoved,...(a.snapshot().removed||[])])];
    for(const {id,el} of a.layers()){
      if(el.tagName!=='IMG')state.content[id]=el.innerText;
      const cs=frame.contentWindow.getComputedStyle(el), props=['left','top','width','height','fontSize','fontFamily','lineHeight','letterSpacing','fontWeight','textAlign','color','writingMode','textOrientation'];
      state.edits[id]=Object.fromEntries(props.map(p=>[p,cs[p]]));
    }
    const signature=visualSignature();
    if(state.culturalReview.output.status==='reviewed'){
      if(reviewBaseline===null)reviewBaseline=signature;
      else if(reviewBaseline!==signature){state.culturalReview.output={status:'pending',findings:['画面或文字已修改，需要重新审核当前输出。']};reviewBaseline=null;}
    }
  }
  const visualSignature=()=>JSON.stringify([state.canvasRatio,state.layoutId,state.paper,state.textColor,state.bgFit,state.content,state.edits,state.removed,state.background,state.subjectImages,state.titleImage]);
  function invalidateReview(input=false){if(state.culturalReview.output.status!=='hold')state.culturalReview.output={status:'pending',findings:[]};reviewBaseline=null;if(input&&state.culturalReview.input.status!=='hold')state.culturalReview.input={status:'pending',findings:[]};}
  function commitText(){const d=frame.contentDocument;if(d?.querySelector('[contenteditable]'))d.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));}
  async function rebuild(){
    ready=false;renderedRemoved=clone(state.removed);const current=++seq;
    const scriptData='data:text/javascript;base64,'+btoa(unescape(encodeURIComponent(B.runtimeJS)))+'#layer-editor.js';
    const draftPrefix='studio-'+Date.now()+'-'+seq;
    frame.srcdoc=`<!doctype html><html lang="zh-CN" data-hf-source-revision="${draftPrefix}"><head><meta charset="utf-8"><title>海报</title><style>${canvasBase}</style><style>${B.runtimeCSS}</style><style>${themeCSS}</style></head><body>${canvasMarkup(layout(),state.content)}<script src="${scriptData}"></script></body></html>`;
    await new Promise((resolve,reject)=>{
      const started=Date.now();const timer=setInterval(()=>{
        if(current!==seq){clearInterval(timer);resolve();return;}
        if(frame.contentDocument?.documentElement.dataset.hfSourceRevision===draftPrefix&&api()){
          clearInterval(timer);ready=true;resolve();
        }else if(Date.now()-started>15000){clearInterval(timer);reject(new Error('编辑器加载超时，请检查导入图片是否有效'));}
      },40);
    });
    if(current!==seq)return;
    // A project-level draft owns persistence; remove only this iframe's transient draft.
    frame.contentWindow.addEventListener('pagehide',()=>{try{localStorage.removeItem(`hf-draft:srcdoc:${draftPrefix}:runtime-v1`);}catch{}});
    const panel=frame.contentDocument.querySelector('.hf-panel');
    const extra=frame.contentDocument.createElement('div');
    extra.style='padding:12px 16px;border-top:1px solid #d8dfce;font:11px/1.7 sans-serif;color:#718066';
    extra.textContent='选择“底图”可拖动、缩放；切换排版保留底图位置。';panel.append(extra);
    await frame.contentDocument.fonts.ready;
    await Promise.all([...frame.contentDocument.querySelectorAll('img[data-layer-id]')].map(async el=>{await el.decode();const id=el.dataset.layerId,asset=id==='background'?state.background:id==='title'?state.titleImage:state.subjectImages[Number(id.slice(8))-1];if(asset){asset.width=el.naturalWidth;asset.height=el.naturalHeight;}}));
    // Fit text within its assigned region; retain a readable lower bound.
    for(const {el} of api().layers()){
      if(el.tagName==='IMG')continue;
      let fs=parseFloat(frame.contentWindow.getComputedStyle(el).fontSize);
      const floor=Math.min(fs,16);
      while(fs>floor&&(el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2)){fs=Math.max(floor,fs-1);el.style.fontSize=fs+'px';}
    }
    capture();localizeLayers();updateHeader();check();renderCards();renderRecommendations();renderWorkflow();renderPalette();syncBackgroundControls();await persist();
  }
  function localizeLayers(){
    frame.contentDocument.querySelectorAll('.hf-layer .nm').forEach(el=>{el.textContent=layerLabel(el.textContent);});
  }
  function updateHeader(){
    const d=canvasSize();$('canvas-ratio').value=state.canvasRatio;$('canvas-dimensions').textContent=d.width+' × '+d.height+' PX';$('canvas-ratio-label').textContent=state.canvasRatio;for(const o of $('export-scale').options)o.textContent=(d.width*Number(o.value))+' × '+(d.height*Number(o.value));
    $('layout-number').textContent=state.layoutId.slice(1);$('layout-name').textContent=layout().name;
    $('background-label').textContent=state.background?'底图：'+state.background.name:'文字模板示例 · 尚未导入底图';
    $('export-background').disabled=!state.background||state.removed.includes('background');
    $('undo-layout').disabled=!previous;
  }
  async function changeLayout(id){
    if(busy||id===state.layoutId)return;busy=true;
    try{commitText();capture();previous=clone(state);state.layoutId=id;state.edits=Object.fromEntries(Object.entries(state.edits).filter(([k])=>k==='background'||/^subject-\d+$/.test(k)));invalidateReview();await rebuild();toast('已切换排版，文案与底图位置已保留。');}finally{busy=false;}
  }
  function overlap(a,b){return Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));}
  const zones={center:{x:205,y:300,w:340,h:420},top:{x:110,y:50,w:530,h:390},bottom:{x:95,y:570,w:560,h:365},left:{x:30,y:170,w:330,h:650},right:{x:390,y:170,w:330,h:650}};
  function subjectRect(){const z=zones[state.subjectZone],d=canvasSize();return z?{x:z.x*d.width/750,y:z.y*d.height/1000,w:z.w*d.width/750,h:z.h*d.height/1000}:null;}
  function conflict(l){return plan.layoutConflicts(l,state).length>0;}
  function mini(l,width){
    const wrap=document.createElement('div');wrap.className='mini-wrap';wrap.style=`width:${width}px;height:${width*canvasSize().height/canvasSize().width}px`;
    const inner=document.createElement('div');inner.style=`width:${canvasSize().width}px;height:${canvasSize().height}px;transform:scale(${width/canvasSize().width});transform-origin:top left;pointer-events:none`;
    inner.innerHTML=canvasMarkup(l,state.content,'proposal');wrap.append(inner);return wrap;
  }
  function card(l,width,atlas=false){
    const b=document.createElement('button');b.className='layout-card'+(l.id===state.layoutId?' active':'');b.dataset.layoutId=l.id;
    b.setAttribute('aria-label',`${l.id.slice(1)} ${l.name}`);b.setAttribute('aria-pressed',l.id===state.layoutId?'true':'false');b.append(mini(l,width));
    const meta=document.createElement('div');meta.className='layout-meta';meta.innerHTML=`<b>${l.id.slice(1)}</b><span>${escape(l.name)}</span>`;b.append(meta);
    if(conflict(l)){const p=document.createElement('span');p.className='compat';p.textContent='可能遮挡主体';b.append(p);}
    b.onclick=()=>{if(atlas)$('atlas-dialog').close();changeLayout(l.id).catch(report);};return b;
  }
  function templateIssues(l){
    const issues=plan.layoutConflicts(l,state);
    const test=document.createElement('div');test.style='position:fixed;left:-20000px;top:0;visibility:hidden;pointer-events:none';
    test.innerHTML=canvasMarkup(l,state.content,true);document.body.append(test);
    const nodes=[...test.querySelectorAll('.text-layer')].filter(el=>el.textContent.trim()),textRects=[];
    for(const el of nodes){
      let fs=parseFloat(getComputedStyle(el).fontSize),floor=Math.min(16,fs);
      while(fs>floor&&(el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2)){fs=Math.max(floor,fs-1);el.style.fontSize=fs+'px';}
      if(el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2)issues.push('文字容量不足');
      const r=document.createRange();r.selectNodeContents(el);textRects.push([...r.getClientRects()].map(b=>({x:b.x,y:b.y,w:b.width,h:b.height})));
    }
    for(let i=0;i<textRects.length;i++)for(let j=i+1;j<textRects.length;j++)if(textRects[i].some(a=>textRects[j].some(b=>overlap(a,b)>1)))issues.push('文字相互遮挡');
    test.remove();return issues;
  }
  function compatibleLayouts(){return recommend().allLayouts.filter(l=>l.eligible&&!templateIssues(layouts.find(x=>x.id===l.id)).length).slice(0,4);}
  function fitPreview(grid){for(const el of grid.querySelectorAll('.text-layer')){let fs=parseFloat(getComputedStyle(el).fontSize),floor=Math.min(16,fs);while(fs>floor&&(el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2)){fs=Math.max(floor,fs-1);el.style.fontSize=fs+'px';}}}
  function renderCards(){
    const grid=$('layout-grid');grid.replaceChildren();const width=(grid.clientWidth-10)/2,filter=$('zone-filter').value,safe=compatibleLayouts();
    safe.filter(l=>filter==='all'||layouts.find(x=>x.id===l.id).safeZone===filter).forEach(l=>grid.append(card(layouts.find(x=>x.id===l.id),width)));
    fitPreview(grid);
    $('layout-count').textContent=safe.length;
    $('layout-candidates-note').textContent=safe.length<3?`仅 ${safe.length} 个方案通过区域和文字检查；可调整构图或文案，再更新候选。`:'已筛除主体区域相交、文字遮挡和容量不足的方案。请复核实际图像与文字对比。';
  }
  function renderAtlas(){const grid=$('atlas-grid');grid.replaceChildren();const width=(grid.clientWidth-54)/4;compatibleLayouts().forEach(l=>grid.append(card(layouts.find(x=>x.id===l.id),width,true)));fitPreview(grid);}
  function renderStyles(){
    const list=$('style-list');list.replaceChildren();
    for(const s of styles.filter(s=>$('style-category').value==='all'||s.category===$('style-category').value)){
      const b=document.createElement('button');b.className='style-card'+(s.id===state.styleId?' active':'');b.innerHTML=`<i class="swatch" style="background:linear-gradient(125deg,${s.paper} 50%,${s.ink} 50%)"></i><div><b>${escape(s.name)}</b><span>${escape(s.label)}</span></div>`;
      b.dataset.styleId=s.id;b.onclick=()=>chooseStyle(s.id);list.append(b);
    }
    $('style-checks').innerHTML=`<b>${escape(style().name)}</b><br>${escape(style().summary)}<br>参考版式：${style().preferredLayouts.map(x=>x.slice(1)).join(' / ')}`;
    $('texture-field').hidden=state.styleId!=='y2k';
    renderRecommendations();
  }
  function chooseStyle(id){state.styleId=id;syncControls();renderStyles();persist();toast('已选择下一次生成的风格，请确认配色。当前底图和文字已保留。');}
  const recommendationData={taxonomy:B.taxonomy,caseIndex:B.caseIndex,rules:B.rules,styles,layouts};
  const recommend=()=>window.PosterRecommendations.recommend({...state,subject:$('subject').value},recommendationData);
  function renderTags(){
    const list=$('tag-fields');list.replaceChildren();
    const defs=[...B.taxonomy.dimensions,{id:'visualSubtype',label:'视觉小类',multiple:true,options:B.taxonomy.visualSubtypes.map(x=>({value:x.name}))}];
    for(const d of defs){
      const label=document.createElement('label');label.className='field';label.textContent=d.label;
      const select=document.createElement('select');select.dataset.tagDimension=d.id;select.setAttribute('aria-label',d.label);select.multiple=d.multiple;
      if(d.multiple){select.size=Math.min(4,d.options.length);}else select.add(new Option('尚未选择',''));
      for(const o of d.options){const option=new Option(o.value,o.value);option.selected=(state.selectedTags[d.id]||[]).includes(o.value);select.add(option);}
      select.onchange=()=>{state.selectedTags[d.id]=[...select.selectedOptions].map(o=>o.value).filter(Boolean);renderRecommendations();persist();};
      label.append(select);if(d.multiple){const help=document.createElement('small');help.className='muted';help.textContent='可多选（⌘ / Ctrl + 点击）';label.append(help);}list.append(label);
    }
  }
  function renderRecommendations(){
    const r=recommend(),out=$('recommendations-output');out.replaceChildren();
    const heading=document.createElement('h3');heading.textContent='候选视觉路线';out.append(heading);
    for(const s of r.styles){const b=document.createElement('button');b.className='recommendation-card';b.dataset.recommendStyle=s.id;b.innerHTML=`<b>${escape(s.name)}</b><small>${escape(s.reasons.slice(0,2).join('；'))}</small><span>选择此风格 →</span>`;b.onclick=()=>chooseStyle(s.id);out.append(b);}
    const layoutHeading=document.createElement('h3');layoutHeading.textContent='当前风格的排版候选';out.append(layoutHeading);
    for(const l of compatibleLayouts()){const b=document.createElement('button');b.className='recommendation-card';b.dataset.recommendLayout=l.id;b.innerHTML=`<b>${escape(l.id+' '+l.name)}</b><small>${escape(l.description)}<br>${escape(l.reasons.join('；'))}</small><span>使用此排版 →</span>`;b.onclick=()=>changeLayout(l.id).catch(report);out.append(b);}
    if(r.evidence.length){const p=document.createElement('p');p.className='muted';p.textContent='相近标签案例：'+r.evidence.map(x=>(x.name||'未命名案例')+'（第 '+x.row+' 行）').join('；')+'。这是标签关联，没有自动分析这些案例图片。';out.append(p);}
    for(const text of r.warnings){const p=document.createElement('p');p.className='recommendation-warning';p.textContent=text;out.append(p);}
  }
  function syncControls(){for(const [id,key] of [['subject','subject'],['paper-color','promptPaper'],['ink-color','ink'],['accent-color','accent'],['texture','texture'],['subject-zone','subjectZone'],['bg-fit','bgFit']])$(id).value=state[key];$('source-photo').value=state.hasSourcePhoto===null?'unknown':state.hasSourcePhoto?'yes':'no';renderTags();}
  function renderWorkflow(){
    const r=state.culturalReview,describe=v=>v.status==='reviewed'?'已记录审核':v.status==='hold'?'有待处理问题':'待审核';
    $('review-status').textContent=`输入：${describe(r.input)} · 输出：${describe(r.output)}`;
    $('review-details').textContent=[...r.input.findings,...r.output.findings].join('；')||'由 Codex 检查图像、文案和使用语境；页面仅显示记录。';
    $('subject-roster').textContent=state.subjectRoster.items.length?(state.subjectRoster.confirmed?'已确认抠图清单：':'待确认抠图清单：')+state.subjectRoster.items.join('、'):'抠图前请确认保留哪些主体，以及是否增加或排除对象。';
    const names={pending:'尚未选择',no:'只用用户素材',suggest:'联网查找，先展示候选',use:'联网查找并使用经确认的元素'};
    $('web-choice').value=state.webAugmentation.choice;$('web-summary').textContent=names[state.webAugmentation.choice]+(state.webAugmentation.elements.length?'；已记录 '+state.webAugmentation.elements.length+' 条来源':'');
  }
  function syncBackgroundControls(){
    const g=plan.box(state,'background',state.background),d=canvasSize();
    for(const [id,value] of [['bg-x',g.x],['bg-y',g.y],['bg-scale',g.w/d.width]])if(document.activeElement!==$(id))$(id).value=Number(value.toFixed(3));
  }
  function renderPalette(){
    const out=$('source-palette-options');out.replaceChildren();
    if(!state.sourcePalette){out.textContent='先使用已审核素材取色，或由 Codex 根据素材提供配色。';return;}
    const p=document.createElement('p');p.className='muted';p.textContent='取色来源：'+state.sourcePalette.source+'；建议色需结合风格确认。';out.append(p);
    for(const option of plan.paletteOptions(state.sourcePalette)){
      const b=document.createElement('button');b.className='recommendation-card';b.textContent=option.name+' '+option.paper+' / '+option.ink+' / '+option.accent;
      const sw=document.createElement('i');sw.className='swatch';sw.style.background=`linear-gradient(125deg,${option.paper} 50%,${option.ink} 50%)`;b.prepend(sw);
      b.onclick=()=>transaction(()=>{state.promptPaper=option.paper;state.paper=option.paper;state.ink=option.ink;state.accent=option.accent;state.textColor=option.textColor;for(const [id,e] of Object.entries(state.edits))if(Object.hasOwn(labels,id))e.color=option.textColor;syncControls();});out.append(b);
    }
  }
  function checks(){
    if(!ready||!api())return ['正在准备画布'];
    if(api().state.exploded)return ['请先退出拆解视图，再检查排版'];
    const issues=[];const list=api().layers();
    if(state.titleImage?.sourceText!==undefined&&state.titleImage.sourceText!==state.content.title)issues.push('主标题文案已变化，请重新生成并导入艺术标题，或恢复文字标题');
    for(const {id,el} of list){
      const cs=frame.contentWindow.getComputedStyle(el), x=parseFloat(cs.left),y=parseFloat(cs.top),w=el.offsetWidth,h=el.offsetHeight;
      if(id!=='background'&&(x<0||y<0||x+w>canvasSize().width+1||y+h>canvasSize().height+1))issues.push(`${layerLabel(id)}超出画布`);
      if(el.tagName!=='IMG'&&(el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2))issues.push(`${layerLabel(id)}超出文本框`);
      if(el.tagName!=='IMG'&&parseFloat(cs.fontSize)<16)issues.push(`${layerLabel(id)}字号偏小`);
      if(Object.hasOwn(labels,id)&&state.content[id]&&plan.protectedRects(state).some(r=>overlap({x,y,w,h},r)>1))issues.push(`${labels[id]}遮挡主体保护区域`);
    }
    const texts=list.filter(x=>x.el.tagName!=='IMG'&&x.el.textContent.trim());
    const lineRects=el=>{const r=frame.contentDocument.createRange();r.selectNodeContents(el);return [...r.getClientRects()].filter(x=>x.width>1&&x.height>1).map(x=>({x:x.x,y:x.y,w:x.width,h:x.height}));};
    const lines=texts.map(x=>lineRects(x.el));
    for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
      if(lines[i].some(a=>lines[j].some(b=>overlap(a,b)>40)))issues.push(`${labels[texts[i].id]}与${labels[texts[j].id]}文字区域相交`);
    }
    const subjects=list.filter(x=>/^subject-\d+$/.test(x.id));
    for(const subject of subjects){const a=subject.el.getBoundingClientRect();for(let i=0;i<texts.length;i++)if(lines[i].some(b=>overlap({x:a.x,y:a.y,w:a.width,h:a.height},b)>40))issues.push(`${layerLabel(subject.id)}与${labels[texts[i].id]}区域相交，请目视检查透明边缘`);}
    return [...new Set(issues)];
  }
  function check(){const issues=checks();$('checks-output').textContent=issues.length?issues.slice(0,3).join('；')+(issues.length>3?`；另有 ${issues.length-3} 项`:''):'未发现越界或文本框溢出。请目视检查文字对比与主体遮挡。';$('checks-output').title=issues.join('\n');return issues;}
  async function imgFrom(data){const img=new Image();img.src=data;await img.decode();return img;}
  async function fileAsset(file){
    if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('请使用 PNG、JPEG 或 WebP 图片');
    if(file.size>24*1024*1024)throw new Error('请使用小于 24 MB 的图片');
    const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});const img=await imgFrom(data);
    return {name:file.name,data,width:img.naturalWidth,height:img.naturalHeight};
  }
  const download=(blob,name)=>{const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);};
  function toBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG 导出失败')),'image/png'));}
  function drawBg(ctx,img,fit,w,h){const r=fit==='contain'?Math.min(w/img.width,h/img.height):Math.max(w/img.width,h/img.height);ctx.drawImage(img,(w-img.width*r)/2,(h-img.height*r)/2,img.width*r,img.height*r);}
  async function exportPNG(backgroundOnly=false,downloadFile=true){
    if(!ready)throw new Error('画布尚未加载完成');
    if(backgroundOnly&&(!state.background||state.removed.includes('background')))throw new Error('请先导入或恢复底图');
    if(state.culturalReview.input.status==='hold'||state.culturalReview.output.status==='hold')throw new Error('存在已记录的审核问题，请先处理并重新审核；工程仍可保存。');
    if(!backgroundOnly&&api().state.exploded)throw new Error('请先退出拆解视图，再导出海报');
    commitText();capture();await frame.contentDocument.fonts.ready;
    const {width:W,height:H}=canvasSize();const scale=Number($('export-scale').value),cv=document.createElement('canvas');cv.width=W*scale;cv.height=H*scale;
    const ctx=cv.getContext('2d');ctx.scale(scale,scale);ctx.fillStyle=state.paper;ctx.fillRect(0,0,W,H);
    if(backgroundOnly){const img=await imgFrom(state.background.data),b=plan.box(state,'background',state.background),r=plan.imageRect({width:img.naturalWidth,height:img.naturalHeight},b,state.bgFit);ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();ctx.drawImage(img,r.x,r.y,r.w,r.h);ctx.restore();}
    else{
      const root=frame.contentDocument.querySelector('.poster-canvas'), copy=root.cloneNode(true);
      const originals=[root,...root.querySelectorAll('*')], copies=[copy,...copy.querySelectorAll('*')];
      originals.forEach((n,i)=>{
        const cs=frame.contentWindow.getComputedStyle(n);copies[i].removeAttribute('class');copies[i].removeAttribute('contenteditable');
        copies[i].style.cssText=Array.from(cs).map(k=>`${k}:${cs.getPropertyValue(k)};`).join('');copies[i].style.outline='none';copies[i].style.boxShadow='none';copies[i].style.cursor='default';
      });
      Object.assign(copy.style,{transform:'none',position:'relative',left:'0px',top:'0px',margin:'0px',display:'block',width:W+'px',height:H+'px'});
      copy.setAttribute('xmlns','http://www.w3.org/1999/xhtml');
      const xml=new XMLSerializer().serializeToString(copy);
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><foreignObject width="${W}" height="${H}">${xml}</foreignObject></svg>`;
      const rendered=await imgFrom('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg));ctx.drawImage(rendered,0,0);
    }
    const blob=await toBlob(cv);
    if(downloadFile)download(blob,`${backgroundOnly?'background':'poster-'+state.layoutId}-${cv.width}x${cv.height}.png`);
    await persist();return blob;
  }
  function makePrompt(){
    if(state.culturalReview.input.status==='hold')throw new Error('输入素材存在待处理审核问题，请先隔离或处理。');
    state.subject=$('subject').value;const l=adaptLayout(layout());
    const zonesText=l.slots.filter(s=>['title','subtitle','kicker'].includes(s.key)&&state.content[s.key]).map(s=>`${labels[s.key]}: left ${Math.round(s.x/canvasSize().width*100)}%, top ${Math.round(s.y/canvasSize().height*100)}%, width ${Math.round(s.w/canvasSize().width*100)}%, height ${Math.round(s.h/canvasSize().height*100)}%`).join('; ');
    const geometry=`Canvas ratio ${state.canvasRatio}. Reserve these low-detail text areas without painting boxes or lettering: ${zonesText}. Keep subject-defining features outside them. These are constraints for the initial layout; other layouts will reuse this exact same background and must be checked separately.`;
    const textures={'干净印刷':'clean printing, very fine 2–4% grain, no scratches or folds','标准 Y2K':'standard Y2K texture, fine 4–7% paper grain, restrained 2–4% screen-print noise, 1–3 subtle scratches and no folds','重度复古':'heavy vintage background texture, 8–12% copier noise and 1–3 edge folds fading before the center, never across the subject'};
    const values={subject:state.subject||'the subject described by the user (resolve before generation)',paper:state.promptPaper,ink:state.ink,accent:state.accent,texture:textures[state.texture],geometry};
    let prompt=style().prompt.replace(/\{(\w+)\}/g,(_,k)=>values[k]||'');if(state.subjectTreatment==='cutout')prompt+='\nLAYERED MODE: Generate only the empty background, material and decorations. Do not draw the subject described above or its silhouette. The subject will be generated separately as transparent foreground assets, behind live typography. Keep its planned area visually quiet.';$('prompt-output').value=prompt;
    $('prompt-checks').textContent='生成后自检查：'+style().checks.join('；')+(style().needsPhoto?'。需要原始照片作为参考输入。':'。');$('prompt-dialog').showModal();persist();return prompt;
  }
  async function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('poster-layout-studio-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('projects');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  async function persist(){
    if(!db)return;
    const key='draft:'+location.pathname, value=JSON.stringify(state);if(value===lastPersist)return;
    try{await new Promise((resolve,reject)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').put(clone(state),key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});lastPersist=value;$('save-state').textContent='草稿已保存在此浏览器';saveFailed=false;}
    catch{$('save-state').textContent='自动保存不可用 · 请保存工程';if(!saveFailed)toast('浏览器未能保存草稿，请点击“保存工程”保留修改。');saveFailed=true;}
  }
  function validateProject(v){
    if(!v||v.version!==1||!layouts.some(l=>l.id===v.layoutId)||!styles.some(s=>s.id===v.styleId))throw new Error('工程格式或版本不支持');
    const clean=clone(defaultState);if(v.canvasRatio!==undefined&&!Object.hasOwn(canvasPresets,v.canvasRatio))throw new Error('不支持的画布比例');clean.canvasRatio=v.canvasRatio||'3:4';clean.layoutId=v.layoutId;clean.styleId=v.styleId;
    for(const k of Object.keys(clean.content)){if(typeof v.content?.[k]==='string'&&v.content[k].length<=10000)clean.content[k]=v.content[k];}
    for(const k of ['paper','promptPaper','ink','accent','textColor'])if(/^#[0-9a-f]{6}$/i.test(v[k]))clean[k]=v[k];
    clean.subject=typeof v.subject==='string'?v.subject.slice(0,2000):'';
    clean.selectedTags=window.PosterRecommendations.normalizeTags(v.selectedTags,B.taxonomy);
    if(v.hasSourcePhoto!==undefined&&v.hasSourcePhoto!==null&&typeof v.hasSourcePhoto!=='boolean')throw new Error('原始照片状态必须为布尔值或空');
    clean.hasSourcePhoto=v.hasSourcePhoto??null;
    clean.protectedRegions=plan.normalizeRegions(v.protectedRegions);
    clean.culturalReview=plan.normalizeReview(v.culturalReview);
    clean.subjectRoster=plan.normalizeRoster(v.subjectRoster);
    clean.sourcePalette=plan.normalizePalette(v.sourcePalette);
    clean.webAugmentation=plan.normalizeWeb(v.webAugmentation);
    if(['标准 Y2K','干净印刷','重度复古'].includes(v.texture))clean.texture=v.texture;
    if(v.subjectZone==='unknown'||zones[v.subjectZone])clean.subjectZone=v.subjectZone;
    if(['cover','contain'].includes(v.bgFit))clean.bgFit=v.bgFit;
    for(const k of ['background','titleImage'])if(v[k]){
      if(typeof v[k].data!=='string'||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v[k].data)||v[k].data.length>34*1024*1024)throw new Error('工程含不支持的图片');
      clean[k]={name:String(v[k].name||'image').slice(0,200),data:v[k].data,width:Number(v[k].width)||0,height:Number(v[k].height)||0};
      if(k==='titleImage'&&typeof v[k].sourceText==='string')clean[k].sourceText=v[k].sourceText.slice(0,10000);
    }
    if(v.subjectTreatment!==undefined&&!['background','cutout'].includes(v.subjectTreatment))throw new Error('主体呈现方式不支持');
    clean.subjectTreatment=v.subjectTreatment||((v.subjectImages||[]).length?'cutout':'background');
    if(v.subjectImages!==undefined&&!Array.isArray(v.subjectImages))throw new Error('主体图层格式不支持');
    if((v.subjectImages||[]).length>8)throw new Error('最多支持 8 个主体图层');
    clean.subjectImages=(v.subjectImages||[]).map(asset=>{
      if(!asset||typeof asset.data!=='string'||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(asset.data)||asset.data.length>34*1024*1024)throw new Error('主体图片格式不支持');
      const a={name:String(asset.name||'subject').slice(0,200),data:asset.data,width:Number(asset.width)||0,height:Number(asset.height)||0};
      if(asset.rect){const z=asset.rect;if(!['x','y','w','h'].every(k=>Number.isFinite(z[k])&&Math.abs(z[k])<5000)||z.w<=0||z.h<=0)throw new Error('主体位置尺寸不支持');a.rect={x:z.x,y:z.y,w:z.w,h:z.h};}return a;
    });
    const validLayer=k=>k==='background'||Object.hasOwn(clean.content,k)||clean.subjectImages.some((_,i)=>k==='subject-'+(i+1));
    clean.removed=Array.isArray(v.removed)?v.removed.filter(validLayer):[];
    for(const [k,edit] of Object.entries(v.edits||{})){
      if(!validLayer(k)||!edit||typeof edit!=='object')continue;const e={};
      for(const [p,x] of Object.entries(edit)){
        if(['left','top','width','height','fontSize','lineHeight','letterSpacing'].includes(p)&&typeof x==='string'&&/^-?\d+(\.\d+)?px$/.test(x)&&Math.abs(parseFloat(x))<5000){if(['width','height'].includes(p)&&parseFloat(x)<=0)throw new Error('图层尺寸必须为正');e[p]=x;}
        if(p==='fontWeight'&&/^\d00$/.test(String(x)))e[p]=String(x);
        if(p==='textAlign'&&['left','right','center','start','end'].includes(x))e[p]=x;
        if(p==='writingMode'&&['horizontal-tb','vertical-rl','vertical-lr'].includes(x))e[p]=x;
        if(p==='textOrientation'&&['mixed','upright','sideways'].includes(x))e[p]=x;
        if(p==='fontFamily'&&typeof x==='string'&&/^[\w\s\u3400-\u9fff,"'-]+$/.test(x))e[p]=x;
        if(p==='color'&&typeof x==='string'&&/^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i.test(x))e[p]=x;
      }clean.edits[k]=e;
    }return clean;
  }
  function report(e){console.error(e);toast(e.message||'操作失败，请重试');}
  async function transaction(fn){if(busy)return;busy=true;try{commitText();capture();previous=clone(state);await fn();invalidateReview();await rebuild();}catch(e){if(previous)state=clone(previous);report(e);}finally{busy=false;}}
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));for(const name of ['layouts','styles'])$('tab-'+name).hidden=name!==b.dataset.tab;if(b.dataset.tab==='layouts')renderCards();});
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
  $('canvas-ratio').onchange=()=>changeCanvas($('canvas-ratio').value).catch(report);
  $('atlas-open').onclick=()=>{$('atlas-dialog').showModal();renderAtlas();};$('zone-filter').onchange=renderCards;
  // Explicit restoration keeps the previous snapshot separate from the transaction helper.
  $('undo-layout').onclick=async()=>{if(!previous||busy)return;busy=true;try{state=clone(previous);previous=null;syncControls();renderStyles();await rebuild();toast('已恢复切换前的文案、位置和素材。');}finally{busy=false;}};
  $('import-subject').onclick=()=>$('file-subject').click();
  $('file-subject').onchange=e=>{const files=[...e.target.files];if(files.length)transaction(async()=>{if(state.subjectImages.length+files.length>8)throw new Error('最多支持 8 个主体图层');for(const file of files)state.subjectImages.push(await fileAsset(file));state.subjectTreatment='cutout';state.subjectRoster.confirmed=false;invalidateReview(true);});e.target.value='';};
  $('remove-subjects').onclick=()=>transaction(()=>{state.subjectImages=[];state.subjectTreatment='background';state.removed=state.removed.filter(k=>!/^subject-\d+$/.test(k));for(const k of Object.keys(state.edits))if(/^subject-\d+$/.test(k))delete state.edits[k];});
  $('import-background').onclick=()=>$('file-background').click();$('import-title').onclick=()=>$('file-title').click();
  $('file-background').onchange=e=>{const f=e.target.files[0];if(f)transaction(async()=>{state.background=await fileAsset(f);delete state.edits.background;state.removed=state.removed.filter(x=>x!=='background');state.protectedRegions=state.protectedRegions.filter(x=>x.layer!=='background');invalidateReview(true);});e.target.value='';};
  $('file-title').onchange=e=>{const f=e.target.files[0];if(f)transaction(async()=>{state.titleImage=await fileAsset(f);state.titleImage.sourceText=state.content.title;state.removed=state.removed.filter(x=>x!=='title');delete state.edits.title;invalidateReview(true);});e.target.value='';};
  $('remove-background').onclick=()=>transaction(()=>{state.background=null;});$('remove-title').onclick=()=>transaction(()=>{state.titleImage=null;delete state.edits.title;});
  for(const [id,key] of [['subject','subject'],['ink-color','ink'],['accent-color','accent'],['texture','texture'],['subject-zone','subjectZone']])$(id).onchange=()=>{state[key]=$(id).value;check();renderCards();renderRecommendations();persist();};
  $('source-photo').onchange=()=>{state.hasSourcePhoto=$('source-photo').value==='unknown'?null:$('source-photo').value==='yes';renderRecommendations();persist();};
  $('refresh-recommendations').onclick=()=>{state.subject=$('subject').value;capture();renderRecommendations();persist();};
  for(const family of [...new Set(styles.map(s=>s.category))])$('style-category').add(new Option(family,family));
  $('style-category').onchange=renderStyles;
  $('use-style-palette').onclick=()=>{const s=style();state.promptPaper=s.paper;state.ink=s.ink;state.accent=s.accent;syncControls();persist();toast('已采用建议配色，用于下一次生成。');};
  $('paper-color').onchange=()=>{state.promptPaper=$('paper-color').value;persist();};$('bg-fit').onchange=()=>transaction(()=>{state.bgFit=$('bg-fit').value;});
  $('select-background').onclick=()=>{const layer=api()?.layers().find(x=>x.id==='background');if(layer)api().select(layer.el);else toast('请先导入或恢复底图。');};
  $('reset-background').onclick=()=>transaction(()=>{delete state.edits.background;state.removed=state.removed.filter(x=>x!=='background');});
  $('apply-background-transform').onclick=()=>transaction(()=>{
    if(!state.background)throw new Error('请先导入底图');
    const x=Number($('bg-x').value),y=Number($('bg-y').value),scale=Number($('bg-scale').value),d=canvasSize();
    if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>=5000||Math.abs(y)>=5000||!Number.isFinite(scale)||scale<.2||scale>4)throw new Error('请填写有效位置和 0.2–4 倍缩放');
    state.edits.background={left:x+'px',top:y+'px',width:d.width*scale+'px',height:d.height*scale+'px'};state.removed=state.removed.filter(x=>x!=='background');
  });
  $('palette-from-source').onclick=()=>$('file-palette').click();
  $('file-palette').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{const asset=await fileAsset(file),img=await imgFrom(asset.data),c=document.createElement('canvas');c.width=96;c.height=Math.max(1,Math.min(512,Math.round(96*img.naturalHeight/img.naturalWidth)));const ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);const colors=plan.sampleColors(ctx.getImageData(0,0,c.width,c.height));if(!colors.length)throw new Error('素材没有可取色的可见像素');state.sourcePalette={colors,source:file.name};renderPalette();persist();toast('已提取素材颜色；选择建议方案才会应用。');}catch(e){report(e);}};
  $('web-choice').onchange=()=>{state.webAugmentation.choice=$('web-choice').value;renderWorkflow();persist();toast('已记录联网选择；由 Codex 搜索和确认新元素。');};
  $('make-prompt').onclick=()=>{try{makePrompt();}catch(e){report(e);}};$('copy-prompt').onclick=async()=>{try{await navigator.clipboard.writeText($('prompt-output').value);toast('已复制提示词');}catch{$('prompt-output').select();document.execCommand('copy');toast('已选中提示词，可按 ⌘C 复制');}};
  $('export-background').onclick=async()=>{try{await exportPNG(true);toast('已导出纯底图 PNG');}catch(e){report(e);}};
  $('export-poster').onclick=async()=>{const b=$('export-poster');b.disabled=true;try{const issues=check();await exportPNG(false);toast(state.culturalReview.output.status!=='reviewed'?'已导出草稿 PNG；当前画面还需 Codex 文化审核。':issues.length?'已导出；请留意底部排版提示。':'海报 PNG 已导出');}catch(e){report(e);}finally{b.disabled=false;}};
  $('edit-copy').onclick=()=>{
    commitText();capture();const list=$('copy-fields');list.replaceChildren();
    for(const key of Object.keys(labels)){const label=document.createElement('label');label.className='field';label.textContent=labels[key];const input=document.createElement('textarea');input.dataset.key=key;input.value=state.content[key]||'';input.rows=key==='body'||key==='note'?3:2;label.append(input);list.append(label);}
    $('text-color').value=state.textColor;$('copy-dialog').showModal();
  };
  $('apply-copy').onclick=()=>{const texts=Object.fromEntries([...document.querySelectorAll('#copy-fields textarea')].map(el=>[el.dataset.key,el.value]));const color=$('text-color').value;$('copy-dialog').close();transaction(()=>{state.content=texts;state.textColor=color;for(const [id,edit] of Object.entries(state.edits))if(Object.hasOwn(labels,id))edit.color=color;state.removed=state.removed.filter(k=>k==='background'||/^subject-\d+$/.test(k)||!texts[k]);});};
  $('check-layout').onclick=()=>{const issues=check();toast(issues.length?issues.join('；'):'尺寸检查通过；文字对比与主体关系仍需目视确认。');};
  $('download-css').onclick=()=>download(new Blob([B.templatesCSS],{type:'text/css;charset=utf-8'}),'layouts-16.css');
  $('save-project').onclick=()=>{commitText();capture();download(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),'poster-project.json');persist();toast('工程包含文字、位置与导入图片。');};
  $('load-project').onclick=()=>$('file-project').click();$('file-project').onchange=e=>{const f=e.target.files[0];if(f)transaction(async()=>{if(f.size>72*1024*1024)throw new Error('工程文件过大');state=validateProject(JSON.parse(await f.text()));syncControls();renderStyles();});e.target.value='';};
  window.addEventListener('resize',()=>{renderCards();if($('atlas-dialog').open)renderAtlas();});
  const styleNode=document.createElement('style');styleNode.textContent=canvasBase.replace(/html,body\{[^}]*\}/,'');document.head.append(styleNode);
  window.posterStudio={getState:()=>{capture();return clone(state);},changeCanvas,canvasSize,changeLayout,exportPNG,checks,makePrompt,validateProject,recommend,compatibleLayouts,canvasMarkup,canvasBase,setState:async v=>{state=validateProject(v);reviewBaseline=null;syncControls();renderStyles();await rebuild();},ready:()=>ready};
  (async()=>{
    state=validateProject(state);
    try{db=await openDB();const saved=await new Promise((resolve,reject)=>{const r=db.transaction('projects').objectStore('projects').get('draft:'+location.pathname);r.onsuccess=()=>resolve(r.result);r.onerror=reject;});if(saved)state=validateProject(saved);}
    catch{$('save-state').textContent='自动保存不可用 · 请保存工程';}
    syncControls();renderStyles();renderCards();await rebuild();
    setInterval(()=>{if(ready&&!busy){const before=JSON.stringify([state.edits,state.removed,state.content]);capture();persist();check();localizeLayers();renderWorkflow();syncBackgroundControls();if(before!==JSON.stringify([state.edits,state.removed,state.content])){renderCards();renderRecommendations();}}},2000);
  })().catch(report);
})();
