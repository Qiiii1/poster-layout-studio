# Subject layers

## Generation and inspection

Resolve `subjectTreatment` through the required gate. In cutout mode identify the exact subject or region in every source, then generate its style-treated transparent PNG using that source and the selected style. Preserve identity, pose, source color where relevant, and key structures. Use transparency-enabled image generation; no scene, text, solid backdrop or checkerboard baked into the pixels. Keep small, even alpha padding. For abstract scenery where no single object is obvious, ask which region to extract rather than inventing an object.

Generate the background separately as material/environment/decorations only. Explicitly exclude every extracted subject, their silhouettes and duplicate fragments. Y2K outlines travel with the subject; bursts and paper texture normally belong to the background. In Gathered Scenes mode, a chosen photographic fragment and its torn edge can form the movable layer. In Mono-color mode, preserve the intended ink treatment and transparent knockouts. These are adaptations of the style recipes, not a reason to flatten the movable subject.

Inspect alpha transparency, edge halos, missing limbs/fine details, retained subject count and the assembled poster. Allow at most one targeted automatic correction per defective asset; disclose unresolved problems. Do not claim the browser imports automatically perform segmentation. Imported images are assumed pre-extracted and require visual review.

## Project geometry

Use `subjectTreatment: "cutout"` in the brief. Supply repeatable `--subject-image` arguments in stable source order, up to eight layers. Optional `subjectRects` contains `{x,y,w,h}` for each asset in the 750×1000 reference coordinate system. Choose initial positions from the confirmed layout's useful image area and the actual subject's proportions, with space for text. Omitting rectangles uses a centered 500×620 box at (125,230), suitable only as an import default, not evidence of a composed result.

The saved `subjectImages` array stores embedded assets and optional `rect`. Stable layer IDs are `subject-1`, `subject-2`, etc. Runtime scales rectangles to the selected canvas; `object-fit:contain` preserves source proportions. Image layers sit above background at z-index 5 and below text/title at 10. The user can select, drag, resize, undo or delete them in the embedded editor. Manual geometry is stored in `edits` by layer ID. Template switching resets text geometry but retains subject placement and deletion state. Canvas changes map manual positions and dimensions. Subject/text bounding-box overlap is a coarse warning because alpha padding can create false positives; inspect the actual pixels.

`导出海报 PNG` includes subjects. `导出底图 PNG` excludes all subject and title/text layers. Project save/open and local drafts retain subject assets and edits. Background-mode projects and old projects with no subject assets remain compatible. To convert an existing flattened poster, generate replacement empty background plus extracted assets; importing a cutout over the original subject-containing background would duplicate it.
