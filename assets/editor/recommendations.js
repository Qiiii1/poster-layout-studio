(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.PosterRecommendations=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
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
    const topic=String(input.subject||'').toLowerCase();
    const hasPhoto=typeof input.hasSourcePhoto==='boolean'?input.hasSourcePhoto:null;
    if(input.hasSourcePhoto!==undefined&&input.hasSourcePhoto!==null&&typeof input.hasSourcePhoto!=='boolean')throw new Error('hasSourcePhoto 必须为布尔值或空');
    const selectedCount=Object.values(tags).reduce((n,x)=>n+x.length,0);
    const requestedFamily=unique([...tags.styleFamily,...tags.visualSubtype.map(x=>taxonomy.visualSubtypes.find(s=>s.name===x)?.family).filter(Boolean)]);
    if(tags.styleFamily.length&&tags.visualSubtype.some(x=>!tags.styleFamily.includes(taxonomy.visualSubtypes.find(s=>s.name===x)?.family)))warnings.push('大类与视觉小类属于不同路线；保留两者供比较，请在风格 HumanGate 中确认。');
    const query=Object.entries(rules.caseWeights).filter(([key])=>tags[key].length);
    const maxWeight=query.reduce((n,[key,w])=>n+w,0);
    const evidence=maxWeight?caseIndex.cases.map(c=>{
      const matches=[];let weight=0;
      for(const [key,w] of query){const hit=tags[key].filter(t=>(c.tags[key]||[]).includes(t));if(hit.length){weight+=w*hit.length/tags[key].length;matches.push(...hit);}}
      return {row:c.row,name:c.name,tags:c.tags,similarity:weight/maxWeight,matches:unique(matches)};
    }).filter(c=>c.similarity>=0.55).sort((a,b)=>b.similarity-a.similarity||a.row-b.row).slice(0,40):[];
    const familyEvidence={};
    for(const c of evidence)for(const f of c.tags.styleFamily||[])familyEvidence[f]=(familyEvidence[f]||0)+c.similarity/Math.max(1,c.tags.styleFamily.length);
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
      return {id:s.id,name:s.name,category:s.category,visualSubtype:s.visualSubtype,score:Math.round(score*10)/10,reasons:unique(reasons),needsPhoto,eligible,sourceKind:s.sourceKind,index};
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
      if(tags.subjectType.includes('多主体')&&['L03','L05','L13','L14'].includes(l.id)){score+=8;reasons.push('提供多处文字与图像锚点');}
      if(bodyLength>160||informationGroups>=5){if(l.capacity==='long'){score+=32;reasons.push('正文较多，可优先比较长说明区');}else if(l.capacity==='short'){score-=26;reasons.push('短文案模板，当前信息可能拥挤');}else{score+=6;reasons.push('有分组说明区，仍需检查文字溢出');}}
      const title=l.slots.find(x=>x.key==='title');
      if(String(copy.title||'').replace(/\s/g,'').length>14&&title?.vertical){score-=12;reasons.push('长标题放入竖排窄栏需要检查');}
      return {id:l.id,name:l.name,score,reasons,capacity:l.capacity,description:l.description};
    }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
    for(const c of tags.composition)if(rules.compositionLayouts[c]?.approximate)warnings.push(rules.compositionLayouts[c].note);
    if(tags.subjectType.includes('无主体（不能抠图）')&&input.subjectTreatment==='cutout')warnings.push('“无主体（不能抠图）”是原案例标签。请先明确本次要抠取的对象，再通过主体 HumanGate。');
    if(tags.visualFocus.includes('IP/品牌logo'))warnings.push('品牌标识应使用用户提供的准确素材，保留为独立图层；不要让模型重绘文字标识。');
    if(bodyLength>160||informationGroups>=5)warnings.push('多组信息需要检查容量；当前八个文字字段若无法清楚容纳，应扩展文字图层，不能删掉必要信息。');
    if(selectedCount&&!evidence.length)warnings.push('未找到足够接近的案例组合；本次依据标签与配方规则推荐。');
    if(proposed.some(c=>c.sourceKind==='catalog-note'))warnings.push('学术板报风依据表格备注补充，表中没有对应的完整来源 skill。');
    return {schemaVersion:1,selectedTags:tags,styles:proposed,allStyles:candidates,layouts:layoutCandidates.slice(0,3),evidence:evidence.slice(0,3).map(({tags,...x})=>x),evidenceCount:evidence.length,warnings:unique(warnings),requiresHumanGate:true};
  }
  return {normalizeTags,recommend};
});
