# Art provenance

The project uses one original image generated with the built-in image-generation tool on 2026-09-28. It is saved as `pixel-walker/public/art/alchemist-cavern.png` and used only for the decorative page gutters. No images from Noita or the reference repository were used as generation inputs.

## Final prompt

Use case: stylized-concept. Asset type: original background illustration for the wide desktop side gutters of a portrait browser game named Pixel Walker. Create a richly detailed atmospheric pixel-art underground alchemist garden, landscape 1536x1024. A dark enchanted limestone cavern with carved ancient stone pillars, hanging roots, ferns and mint bioluminescent mushrooms, warm amber lanterns and small glass vessels of sand and blue water on rocky shelves. Strong silhouette framing at far left and far right, layered misty teal depths, charcoal blue stone with restrained gold highlights. A quiet dark central vertical band occupying about 35 percent of image will be covered by the game's portrait cabinet, so concentrate beautiful readable environmental storytelling in both outer thirds. Premium 2D game background, deliberate crisp pixel clusters, subtle atmospheric depth, visually textured but not noisy, side-view diorama rather than top-down. No people, no text, no logos, no UI, no watermark. Original composition and art, do not imitate an existing game screenshot.

## Code-authored artwork

The hooded walker, walk animation, stone platforms, distant arches, ferns, mushrooms, lantern seeds, gate, material pixels, and ambient lights are drawn by `src/renderer.js`. Borders are styled in `src/game.css`; `public/art/lantern.svg` is the original app icon. The Samuel Asher Rivello banner is retained unchanged from the user-specified template.
