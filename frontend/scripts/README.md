# Tarot image generation — increment 011

Current stage: sample only, awaiting visual approval. Do not run `--all` or remove public masters before approval.

Requires Node >=20.9 (validated here with Node 22.23.2), npm dependencies and Sharp 0.35.5.

From frontend, use `npm.cmd run images:tarot -- --copy-masters --sample` on PowerShell. From the repository root, use `node frontend/scripts/generate-tarot-images.mjs --copy-masters --sample`. Paths resolve from the script, not the current working directory.

Options:
- `--copy-masters`: copy the 78 manifest-listed PNGs to assets-source/tarot/luna; reuse identical destinations and reject differing hashes. Never overwrite masters.
- `--sample`: generate only O Louco and the four Aces.
- `--all`: generate all 78 only after explicit visual approval.
- `--quality=85`: WebP quality, integer 1–100. Changing it requires new visual review.

Profiles: 320, 640 and up to 1280 pixels wide, capped at source width and deduplicated. Sequential processing, WebP effort 6, alpha quality 100. No crop, enlargement, rotation, flattening or visual edits. sRGB inputs only; embedded ICC retained when present. Unsupported orientations/formats/colour spaces fail explicitly.

Editorial entries are read with the already-installed TypeScript parser from cards.ts. If that literal structure changes, generation fails rather than guessing file paths. No independent editorial catalogue is maintained.

All inputs are checked before generation. Derivatives are encoded in a unique temporary directory and decoded to verify dimensions, alpha and ICC presence. Only validated outputs are published. Existing derivatives with the same names may be replaced; no masters or unrelated files are deleted. Publication is per-file, not a transaction over the entire output directory; an I/O failure during publication must be reviewed before use.

Outputs: public/assets/tarot/optimized/{cardId}-{actualWidth}.webp and {sample|all}-metadata.json. Reports include source hashes, variants, dimensions, bytes, generation parameters and duration. Duration can vary; reproducible bytes require identical Sharp/libvips versions and inputs. Metadata is technical and keyed by cardId; it is not yet consumed by the UI in the sample stage.

Compare original files in assets-source/tarot/luna (or their still-preserved public copies) with the corresponding three WebPs. Review entire frame, colours, small details and English titles at actual display sizes. File size savings are not measured browser performance. All existing public PNGs and the remote lesson remain unchanged at this stage.
