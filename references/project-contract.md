# Project contract

## Brief input

`prepare_project.py` accepts this JSON. All content values are literal plain text, with `\n` for intentional line breaks. Omitted content fields become empty; no sample reference copy is retained.

```json
{
  "layoutId": "L01",
  "styleId": "mono-color",
  "subject": "社区读书会，文化，安静",
  "subjectZone": "center",
  "content": {
    "title": "一起读书",
    "subtitle": "让想法相遇",
    "kicker": "READ TOGETHER",
    "body": "用户提供的活动说明",
    "note": "",
    "footer1": "用户提供的时间",
    "footer2": "",
    "footer3": "用户提供的地点"
  }
}
```

Optional keys: `paper` (canvas substrate), `promptPaper` (next generated background color), `ink`, `accent`, `textColor`, `texture` (`干净印刷`, `标准 Y2K`, `重度复古`), `bgFit` (`cover`, `contain`). `subjectZone` is `unknown`, `center`, `top`, `bottom`, `left` or `right` and provides a coarse overlap warning only.

## Saved project

The browser's saved JSON includes `version:1`, the brief fields, `background`, `titleImage`, `edits`, and `removed`.

Each asset contains `{name, data, width, height}`. `data` is an embedded PNG/JPEG/WebP base64 URL. No file path, remote image URL or executable SVG is needed for the offline file. A transparent PNG is recommended for art titles. The text title is retained while its image is displayed.

`edits` maps stable content keys to explicit CSS geometry/typography. `removed` contains deleted keys. Position units are canvas pixels regardless of display zoom. Layout switching preserves literal content and assets, and resets the layout-specific geometry. It does not promise the text will fit every preset.

The local browser draft is kept in IndexedDB, scoped by editor path. Save a project JSON to move between browsers or recover when storage is unavailable. A downloaded PNG is flattened and cannot reopen as an editable project. The HTML supplied by the agent contains initial state; browser changes are saved as draft/project JSON, not written back to that HTML file.

## CSS data

`layouts.json` records each template's `x`, `y`, `w`, `h`, font size, weight, family, line height, letter spacing, alignment, optional vertical writing, content capacity class and image-region guides. All measurements are estimates from the raster reference on a 750 × 1000 canvas.

The generated stylesheet uses selectors such as:

```css
.poster-canvas[data-layout="L01"] [data-layer-id="title"] {
  left: 40px;
  top: 607px;
  width: 670px;
  height: 108px;
  font-size: 82px;
  line-height: 1.08;
  font-weight: 900;
  letter-spacing: 0px;
  text-align: center;
  writing-mode: horizontal-tb;
}
```

Preview gray shapes live only in `.reference-preview`; actual background pixels belong to a single locked image layer. Some original compositions have several image areas; these are reference guides, not a request to slice the actual background.

## Rendering and PNG

The shell embeds the original editable-design runtime and uses an iframe to isolate its DOM. All artwork is embedded. Composite export serializes the current styled canvas into an SVG `foreignObject`, rasterizes it to a browser canvas, then writes PNG. The output strips selection outlines, editor panels and reference guides. The background export uses the same cover/contain geometry and paper substrate without title/text layers.

Verified target should be reported per actual test run; do not assume all browsers handle `foreignObject` identically. System fonts can vary by machine. For a consistent shared result, send the PNG; exact cross-machine editable typography requires bundled licensed fonts.

References for the export implementation:

- [MDN: SVG as an image](https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_as_an_image)
- [MDN: Canvas toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
- [MDN: image origins and canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image)
