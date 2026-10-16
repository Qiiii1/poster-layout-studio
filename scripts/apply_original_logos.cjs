// Deterministic logo export only. This script never calls an image-generation service.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
async function main() {
  const jobPath = path.resolve(process.argv[2]);
  const sharp = require(process.argv[3] || 'sharp');
  const root = path.dirname(jobPath);
  const resolve = s => path.resolve(root, s);
  const job = JSON.parse(fs.readFileSync(jobPath, 'utf8').replace(/^\uFEFF/, ''));
  if (!Array.isArray(job.versions) || !job.versions.length) throw Error('List all requested versions');
  const outputs = new Set();
  const protectedPaths = new Set(job.versions.flatMap(v => [resolve(v.image), ...(v.logo ? [resolve(v.logo)] : [])]));
  const batch = [];
  for (const v of job.versions) {
    if (!v.logo) throw Error('Original logo is required: ' + v.id);
    const source = resolve(v.image), destination = resolve(v.output), logoPath = resolve(v.logo);
    if (fs.existsSync(destination) || protectedPaths.has(destination) || outputs.has(destination)) throw Error('Output would overwrite a file');
    outputs.add(destination);
    const image = fs.readFileSync(source), logo = fs.readFileSync(logoPath);
    const meta = await sharp(image).metadata();
    const b = v.placement;
    if (!b || ['left','top','width','height'].some(k => !Number.isInteger(b[k])) || b.left < 0 || b.top < 0 || b.width <= 0 || b.height <= 0 || b.left+b.width > meta.width || b.top+b.height > meta.height) throw Error('Invalid logo placement: ' + v.id);
    // Retain the complete original, including its background and internal margins.
    const rendered = await sharp(logo).resize(b.width,b.height,{fit:'inside'}).png().toBuffer();
    const lm = await sharp(rendered).metadata();
    const left = b.left + Math.floor((b.width-lm.width)/2), top = b.top + Math.floor((b.height-lm.height)/2);
    const final = await sharp(image).composite([{input:rendered,left,top}]).png().toBuffer();
    const before = await sharp(image).ensureAlpha().raw().toBuffer();
    const after = await sharp(final).ensureAlpha().raw().toBuffer();
    let changed = 0;
    for (let y=0;y<meta.height;y++) for (let x=0;x<meta.width;x++) {
      const i=(y*meta.width+x)*4;
      if (before.subarray(i,i+4).equals(after.subarray(i,i+4))) continue;
      if (x<left || x>=left+lm.width || y<top || y>=top+lm.height) throw Error('Pixels outside logo changed');
      changed++;
    }
    if (!changed) throw Error('Logo made no visible pixel change');
    if (sha(fs.readFileSync(logoPath))!==sha(logo) || sha(fs.readFileSync(source))!==sha(image)) throw Error('Source file changed');
    batch.push({buffer:final,record:{id:v.id,final:destination,width:meta.width,height:meta.height,logo_required:true,logo_applied:true,logo_visible:null,logo_source:logoPath,logo_sha256:sha(logo),placement:{left,top,width:lm.width,height:lm.height},changed_pixels_outside_logo:0,final_sha256:sha(final)}});
  }
  for (const v of batch) {
    fs.mkdirSync(path.dirname(v.record.final),{recursive:true});
    fs.writeFileSync(v.record.final,v.buffer,{flag:'wx'});
  }
  process.stdout.write(JSON.stringify({operation:'original-logo-composite',image_generation_calls:0,visual_review_required:true,versions:batch.map(v=>v.record)},null,2));
}
main().catch(e=>{process.stderr.write(e.message+'\n');process.exitCode=1;});
