(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./planning.js'));
  else root.PosterRecommendations=factory(root.PosterPlanning);
})(typeof globalThis!=='undefined'?globalThis:this,function(planning){
  'use strict';
  const unique=xs=>[...new Set(xs)];
  function normalizeTags(value,taxonomy){
    if(value===undefined||value===null)value={};
    if(typeof value!=='object'||Array.isArray(value))throw new Error('selectedTags 必须是按类别组织的对象');
    const clean={};
    const defs=[...taxonomy.dimensions,{id:'visualSubtype',multiple:true,options:taxonomy.visualSubtypes.map(s=>({value:s.name}))}];
    for(const d of defs){
      const v=value[d.id]===undefined?[]:value[d.id];
      if(!Array.isArray(v)||v.some(x=>typeof x!=='string'))throw new Error((d.label||d.id)+' 标签格式错误');
      const values=unique(v.map(x=>taxonomy.aliases[x]||x));
      if(!d.multiple&&values.length>1)throw new Error((d.label||d.id)+'只能选择一项');
      if(values.some(x=>!d.options.some(o=>o.value===x)))throw new Error((d.label||d.id)+'含未收录的标签');
      clean[d.id]=values;
    }
    for(const k of Object.keys(value))if(!defs.some(d=>d.id===k))throw new Error('未知标签类别：'+k);
    return clean;
  }
  function recommend(input,data){
    const {taxonomy,caseIndex,rules,styles,layouts}=data;
    const tags=normalizeTags(input.selectedTags,taxonomy), warnings=[];
    const caseQueryTags=normalizeTags(input.caseQueryTags??input.selectedTags,taxonomy);
    const caseSource={url:caseIndex.source.caseSheetUrl||caseIndex.source.url,sheetId:caseIndex.source.sheets.cases,importDate:caseIndex.source.importDate,revision:caseIndex.source.caseSheetRevision??null,queryTags:caseQueryTags,visualReview:'required'};
    const caseURL=cell=>{const u=new URL(caseSource.url);u.searchParams.set('sheet',caseSource.sheetId);u.searchParams.set('range',cell);return u.href;};
    const topic=String(input.subject||'').toLowerCase();
    const hasPhoto=typeof input.hasSourcePhoto==='boolean'?input.hasSourcePhoto:null;
    if(input.hasSourcePhoto!==undefined&&input.hasSourcePhoto!==null&&typeof input.hasSourcePhoto!=='boolean')throw new Error('hasSourcePhoto 必须为布尔值或空');
    const selectedCount=Object.values(tags).reduce((n,x)=>n+x.length,0);
    const requestedFamily=unique([...tags.styleFamily,...tags.visualSubtype.map(x=>taxonomy.visualSubtypes.find(s=>s.name===x)?.family).filter(Boolean)]);
    const retired=tags.visualSubtype.filter(name=>!styles.some(s=>s.visualSubtype===name));
    if(retired.length)warnings.push('以下小类已退出当前 6 条推荐路线：'+retired.join('、')+'。保留为历史分类，请明确选择当前路线；候选不会自动代替该选择。');
    if(input.styleId&&!styles.some(s=>s.id===input.styleId))warnings.push('当前风格属于旧工程兼容记录；新推荐只使用优化后的 6 条，请在重新生成前明确选择。');
    if(tags.styleFamily.length&&tags.visualSubtype.some(x=>!tags.styleFamily.includes(taxonomy.visualSubtypes.find(s=>s.name===x)?.family)))warnings.push('大类与视觉小类属于不同路线；保留两者供比较，请在风格 HumanGate 中确认。');
    const query=Object.entries(rules.caseWeights).filter(([key])=>caseQueryTags[key].length);
    const maxWeight=query.reduce((n,[key,w])=>n+w,0);
    const evidence=maxWeight?caseIndex.cases.map(c=>{
      const matches=[],matchedDimensions={};let weight=0;
      for(const [key,w] of query){const hit=caseQueryTags[key].filter(t=>(c.tags[key]||[]).includes(t));if(hit.length){weight+=w*hit.length/caseQueryTags[key].length;matches.push(...hit);matchedDimensions[key]=hit;}}
      const imageCell=c.imageCell||(caseIndex.source.caseColumns?.['主视觉图片']||'B')+c.row;
      return {row:c.row,name:c.name,tags:c.tags,similarity:weight/maxWeight,matches:unique(matches),matchedDimensions,imageCell,hasImage:c.hasImage??null,sourceUrl:caseURL('A'+c.row),imageUrl:caseURL(imageCell),visualReview:'pending'};
    }).filter(c=>c.similarity>=0.55).sort((a,b)=>b.similarity-a.similarity||a.row-b.row).slice(0,40):[];
    const familyEvidence={},compositionEvidence={};
    for(const c of evidence){
      for(const f of c.tags.styleFamily||[])familyEvidence[f]=(familyEvidence[f]||0)+c.similarity/Math.max(1,c.tags.styleFamily.length);
      for(const composition of c.tags.composition||[])compositionEvidence[composition]=(compositionEvidence[composition]||0)+c.similarity/Math.max(1,c.tags.composition.length);
    }
    const evidenceTotal=Object.values(familyEvidence).reduce((n,x)=>n+x,0)||1;
    const candidates=styles.map((s,index)=>{
      let score=0;const reasons=[];
      if(requestedFamily.includes(s.category)){score+=50;reasons.push('符合所选风格大类：'+s.category);}
      if(tags.visualSubtype.includes(s.visualSubtype)){score+=80;reasons.push('对应所选视觉小类：'+s.visualSubtype);}
      for(const r of rules.tagStyleRules)if(tags[r.dimension].includes(r.value)&&r.styles.includes(s.id)){score+=r.weight;reasons.push(r.value+'：'+r.reason);}
      const keywords=unique([s.name,s.id,...(s.tags||[])]).filter(k=>k.length>1&&topic.includes(k.toLowerCase()));
      if(keywords.length){score+=Math.min(30,keywords.length*9);reasons.push('主题中的词语：'+keywords.join('、'));}
      if(evidence.length&&familyEvidence[s.category]){score+=18*familyEvidence[s.category]/evidenceTotal;reasons.push('相近标签案例中出现该大类；这是案例关联，需结合素材判断');}
      const needsPhoto=!!s.needsPhoto,eligible=!(needsPhoto&&hasPhoto===false);
      if(needsPhoto&&hasPhoto!==true)reasons.push(hasPhoto===false?'需要原始照片；当前未提供':'需要确认有原始照片素材');
      if(!selectedCount&&!topic)reasons.push('尚未选择标签；先展示不同视觉路线');
      return {id:s.id,name:s.name,category:s.category,visualSubtype:s.visualSubtype,score:Math.round(score*10)/10,reasons:unique(reasons),needsPhoto,eligible,sourceKind:s.sourceKind,referenceImages:(s.referenceImages||[]).map(r=>({...r})),index};
    }).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||b.score-a.score||a.index-b.index);
    if(hasPhoto===false&&styles.some(s=>s.needsPhoto&&(s.id===input.styleId||tags.visualSubtype.includes(s.visualSubtype))))warnings.push('所选路线需要原始照片，请补充素材或明确选择另一条路线；以下候选不会自动替换你的选择。');
    // Keep broad proposals varied; an explicit family/subtype may narrow the proposals.
    const proposed=[];const used=new Set();
    for(const c of candidates){if(!c.eligible)continue;if(!requestedFamily.length&&used.has(c.category))continue;proposed.push(c);used.add(c.category);if(proposed.length===3)break;}
    for(const c of candidates)if(proposed.length<3&&c.eligible&&!proposed.some(x=>x.id===c.id))proposed.push(c);
    const active=styles.find(s=>s.id===input.styleId)||styles.find(s=>s.id===proposed[0]?.id);
    const copy=input.content||{},bodyLength=['body','note','footer1','footer2','footer3'].reduce((n,k)=>n+String(copy[k]||'').replace(/\s/g,'').length,0);
    const informationGroups=(tags.contentTypes||[]).length;
    const layoutCandidates=layouts.map(l=>{
      let score=0;const reasons=[];
      if(active?.preferredLayouts.includes(l.id)){score+=14;reasons.push('适合 '+active.name+' 的图像与文字关系');}
      for(const c of tags.composition){const mapping=rules.compositionLayouts[c];if(mapping?.layouts.includes(l.id)){score+=30;reasons.push(c+'：'+mapping.note);}}
      const caseLayoutScore=Object.entries(compositionEvidence).reduce((n,[composition,weight])=>{const m=rules.compositionLayouts[composition];return n+(m?.defaultRecommended!==false&&m?.layouts.includes(l.id)?weight:0);},0);
      if(caseLayoutScore){const total=Object.values(compositionEvidence).reduce((n,x)=>n+x,0)||1;score+=Math.round(10*caseLayoutScore/total);reasons.push('相近案例的构图标签支持该文字结构；查看案例图后仍需结合当前素材筛选');}
      if(tags.subjectType.includes('多主体')&&['L03','L05','L13','L14'].includes(l.id)){score+=8;reasons.push('提供多处文字与图像锚点');}
      if(bodyLength>160||informationGroups>=5){if(l.capacity==='long'){score+=32;reasons.push('正文较多，可优先比较长说明区');}else if(l.capacity==='short'){score-=26;reasons.push('短文案模板，当前信息可能拥挤');}else{score+=6;reasons.push('有分组说明区，仍需检查文字溢出');}}
      const title=l.slots.find(x=>x.key==='title');
      if(String(copy.title||'').replace(/\s/g,'').length>14&&title?.vertical){score-=12;reasons.push('长标题放入竖排窄栏需要检查');}
      const conflicts=planning.layoutConflicts(l,input);
      const compositionReferences=Object.entries(rules.compositionLayouts).filter(([name,m])=>m.layouts.includes(l.id)&&(m.defaultRecommended!==false||tags.composition.includes(name))).map(([name,m])=>({name,approximate:!!m.approximate,defaultRecommended:m.defaultRecommended!==false,referenceImages:m.referenceImages||[]}));
      return {id:l.id,name:l.name,score,reasons,capacity:l.capacity,description:l.description,conflicts,eligible:conflicts.length===0,compositionReferences};
    }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
    for(const c of tags.composition)if(rules.compositionLayouts[c]?.approximate)warnings.push(rules.compositionLayouts[c].note);
    for(const c of tags.composition)if(rules.compositionLayouts[c]?.defaultRecommended===false)warnings.push(c+' 在排版参考表中标为“不推荐”；保留你的明确选择，需检查阅读顺序与遮挡。');
    if(tags.subjectType.includes('无主体（不能抠图）')&&input.subjectTreatment==='cutout')warnings.push('“无主体（不能抠图）”是原案例标签。请先明确本次要抠取的对象，再通过主体 HumanGate。');
    if(tags.visualFocus.includes('IP/品牌logo'))warnings.push('品牌标识应使用用户提供的准确素材，保留为独立图层；不要让模型重绘文字标识。');
    if(bodyLength>160||informationGroups>=5)warnings.push('多组信息需要检查容量；当前八个文字字段若无法清楚容纳，应扩展文字图层，不能删掉必要信息。');
    if(query.length&&!evidence.length)warnings.push('未找到足够接近的案例组合；本次依据标签与配方规则推荐。');
    if(!query.length)warnings.push('请根据实际素材提出案例检索标签；caseQueryTags 可用于检索推断，不代表用户已确认标签。');
    if(proposed.some(c=>c.sourceKind==='catalog-note'))warnings.push('学术板报风依据表格备注补充，表中没有对应的完整来源 skill。');
    const safeLayouts=layoutCandidates.filter(l=>l.eligible).slice(0,4);
    if(safeLayouts.length<3)warnings.push('当前只有 '+safeLayouts.length+' 个排版候选通过区域筛选；请调整构图或文字容量，不补入遮挡方案。');
    if(!planning.protectedRects(input).length&&(hasPhoto!==false||input.background))warnings.push('尚未标注主体保护区域；候选需先结合实际素材检查，再交给用户选择。');
    if((input.protectedRegions||[]).length&&!input.background&&!(input.subjectImages||[]).length)warnings.push('素材尚未导入；保护区域按计划图层范围预筛，生成实际图像后须重新标注和复核。');
    return {schemaVersion:3,selectedTags:tags,caseSource,styles:proposed,allStyles:candidates,layouts:safeLayouts,allLayouts:layoutCandidates,evidence:evidence.slice(0,3).map(({tags,...x})=>({...x,caseTags:tags})),evidenceCount:evidence.length,warnings:unique(warnings),requiresHumanGate:true};
  }
  return {normalizeTags,recommend};
});
