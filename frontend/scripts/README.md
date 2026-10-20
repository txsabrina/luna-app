# Tarot image generation — increment 011

Current stage: full generated set integrated; the 78 numbered public PNG copies were removed after explicit approval. Canonical masters remain in assets-source/tarot/luna.

Requires Node >=20.9 (validated here with Node 22.23.2), npm dependencies and Sharp 0.35.5.

From frontend, use `npm.cmd run images:tarot -- --all` on PowerShell. From the repository root, use `node frontend/scripts/generate-tarot-images.mjs --all`. Generation reads the canonical masters from assets-source/tarot/luna; project paths resolve from the script, not the current working directory.

Options:
- `--import-masters=<directory>`: explicitly import a future manifest-complete set from a supplied directory; reuse identical destinations and reject differing hashes. It does not depend on public assets and never overwrites a different master. Relative import paths resolve from the caller's working directory.
- `--sample`: generate only O Louco and the four Aces.
- `--all`: generate all 78 and refresh the compact TypeScript image metadata consumed by the catalogue. The sample was explicitly approved before the first full run.
- `--quality=85`: WebP quality, integer 1–100. Changing it requires new visual review.

Profiles: 320, 640 and up to 1280 pixels wide, capped at source width and deduplicated. Sequential processing, WebP effort 6, alpha quality 100. No crop, enlargement, rotation, flattening or visual edits. sRGB inputs only; embedded ICC retained when present. Unsupported orientations/formats/colour spaces fail explicitly.

Editorial entries are read with the already-installed TypeScript parser from cards.ts. If that literal structure changes, generation fails rather than guessing file paths. No independent editorial catalogue is maintained.

All inputs are checked before generation. Derivatives are encoded in a unique temporary directory and decoded to verify dimensions, alpha and ICC presence. Only validated outputs are published. Existing derivatives with the same names may be replaced; no masters or unrelated files are deleted. Publication is per-file, not a transaction over the entire output directory; an I/O failure during publication must be reviewed before use.

Browser outputs are public/assets/tarot/optimized/{cardId}-{actualWidth}.webp. New technical reports are written to reports/tarot/{sample|all}-metadata.json, outside public and dist. The historical sample-metadata.json remains unchanged in public because this cleanup was limited to the complete report and the 78 approved PNGs. An `--all` run also replaces src/features/preview/cardImageMetadata.ts with only the compact dimensions and responsive paths consumed by the catalogue; this generated module must not be edited manually. Reports include source hashes, variants, dimensions, bytes, generation parameters and duration. Duration can vary; reproducible bytes require identical Sharp/libvips versions and inputs. Metadata is technical and keyed by cardId.

Compare masters in assets-source/tarot/luna with the corresponding three WebPs. Review entire frame, colours, small details and English titles at actual display sizes. File size savings are not measured browser performance. The separately named fool.png legacy asset and the remote lesson remain unchanged.

The catalogue uses the 320px variant as `src`, all three variants in `srcSet`, layout-specific `sizes`, and explicit intrinsic dimensions. The larger presentation image is mounted only while the native dialog is open, so visiting a catalogue does not preload the largest variants of all cards. Verify the selected request in browser DevTools → Network with cache disabled; the transferred variant depends on viewport, rendered CSS width and device pixel ratio.
