# Art title layers

## Generation

Record the chosen treatment, exact `content.title`, layout ID and canvas ratio. Scale the catalog's main-title slot from 750×1000 into the selected canvas; its width/height bound the initial layer and its font size guides the intended visual hierarchy. Use the slot's orientation and line breaks in the title prompt. For a vertical slot, compose a vertical title rather than squeezing a horizontal wordmark into it.

Generate only the exact title as a transparent PNG, using the confirmed poster style and palette. Specify no background, scene, subtitle, date, watermark or extra characters. Use the available image-generation tool with transparency enabled. Inspect every glyph, legibility, edges and alpha transparency. Keep padding small and even; excessive transparent margins make the visible title too small inside its slot. If the words or alpha are wrong, make at most one targeted automatic correction and report unresolved defects. Do not call an opaque rectangle a transparent title.

## Placement and editing

The editor replaces the live `title` element with an image layer carrying the same stable layer ID. Its initial bounding box is the current template's adapted main-title slot. `object-fit: contain` preserves glyph proportions; it may leave space when the image and slot have different ratios. Main-title slot width/height govern image size; the text font-size control cannot change baked image glyphs. Drag the layer or resize its handles instead. Manual position/size overrides persist in `edits.title`, project save/open and undo. Canvas ratio changes map the layer box into the new canvas. Explicit template switching clears those overrides and uses the new main-title slot, retaining the title asset and source text.

Store the literal wording in `titleImage.sourceText` as well as `content.title`. Editing the latter does not edit the raster. The editor warns when they differ; regenerate and reimport to update the image, or restore the ordinary title. Old projects without `sourceText` still open; verify their title wording visually.

Composite PNG includes the image title; background PNG excludes it. Test a title import, pointer drag/resize, template and canvas changes, project reload and both exports when changing title-layer behavior. A transparent test fixture checks mechanics only, not generated title quality.
