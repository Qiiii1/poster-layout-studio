# Artwork style adapters

These adapters use the visual treatment requested by the user. They do not invoke the source skills' complete poster workflows: generated lettering, original output ratios, promotional response lines, or original full-poster layout defaults are not inherited. This workflow intentionally produces a text-free background at the selected portrait ratio (2:3, 4:5 or 3:4), then applies independent live typography. When the user chooses subject cutouts, split these treatments into a subject-free background and transparent foreground assets as described in [subject layers](subject-layers.md); do not flatten the subject into the background.

## Mono-color

Source: local skill `mono-color` (`mono-color-skill/SKILL.md`).

Neutral white, gray or pale paper; at most two distinct ink plates, assigned to dominant structure and limited accent. Use screening, paper knockouts and plate separation; avoid a uniform digital color tint. Keep one strong visual event and a concentrated quiet area. Age or distress only when requested. Without a source photo, interpret one concrete theme; with a source, preserve its recognizable subject.

Proposed colors (require palette-gate approval): paper `#FAFAF7`, cobalt `#2148B8`, terracotta `#C65F38`. Explicit one-ink requests use the same ink for both roles. Default accent should occupy a smaller share than the dominant ink. Reserve the selected text zones before generation; the original skill's title/image collision is expressed later through HTML when it remains legible.

Checks: ink count, material reproduction, subject identity, calm text zones, no baked lettering. Template compatibility is based on image geometry, not the style name alone.

## Y2K

Source: local skill `y2k-pop-poster`, author koinu. Its source declares CC-BY-ND-4.0; the original skill text and example images are not redistributed here. This adapter is a separate description of the requested visual treatment.

Use the actual supplied subject. Preserve identity, number, pose, expression, recognizable color and critical structures. A high-contrast cutout sits on a saturated background, separated by a continuous hard outline. Anchor a main burst to the pose, behind the subject, rather than scattering equal decorations around the frame. Keep at most two smaller bursts; protect faces and key details.

Resolve background/outline colors and texture in the generation settings. The HTML defaults are editable proposals, not evidence that the user approved a particular palette. When invoking the original Y2K skill itself, honor its explicit color/texture selection workflow. When executing this adapter, the user's chosen or accepted style settings carry those choices.

Texture options:

- Clean: very fine grain, no obvious scratches/folds.
- Standard: fine paper grain, restrained screen-print noise, up to a few subtle scratches; no folds.
- Heavy vintage: controlled copier texture and edge folds that fade before the center; texture remains behind the subject.

Checks: identity, complete key structures, clear contour, consistent selected texture, restrained decoration, quiet text zones, no lettering. Do not shrink the subject until its identity disappears to accommodate an unsuitable template.

## Gathered Scenes

Source: local skill `scenes-gathered-zine-v1-3`, author Zeejay0.

Retain a truthful photographic anchor. Extract one or two source-derived contours or rhythms to organize a larger sparse illustration field. Merge repeated foliage, branches, crowds and textures into a few large forms. A narrow fibrous torn edge separates photo from paper. One added print hue must continue, replace, connect or balance an actual source form; natural photo colors do not count as extra added ink hues.

Use warm paper, flat scanning texture and substantial internal negative space. Avoid generic bright corner patches, a literal tracing of every leaf, uniformly deckled borders, heavy shadows or raised-paper mockups.

The source skill normally uses restrained micro-text. Here, only its artwork treatment is adopted; the 16-title library is a separate user-requested typography layer. Prefer the quieter compatible templates, and explain that applying a very large display title changes the original style's typographic character. Do not label all 16 choices equally suitable.

Checks: photographic fidelity, retained spatial relationships, substantial simplification, useful source-derived color, visible narrow fibrous boundary, quiet text zones, no generated words.

## Prompt record and inspection

The catalog provides compact text-free prompt scaffolds. Fill subject, chosen colors, texture and numerical text regions. The agent must enrich the subject-preservation and abstraction clauses after inspecting the actual photo. Do not send a placeholder subject to generation.

Record actual image findings and targeted corrections alongside the prompt. The editor's “检查排版” checks geometry only; it cannot certify these style/fidelity requirements.
