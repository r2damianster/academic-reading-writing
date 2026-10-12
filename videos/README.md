# videos/

Proyectos de video HyperFrames (HTML -> MP4). Solo se versiona este README; lo publicable va a `media/video/` (NO usar `public/`: Vercel lo toma como outputDirectory y rompe el sitio).

## patterns-tutorial
Tutorial en inglés (~1:48) del módulo 05 Writing Patterns, con capturas reales y locución TTS (`af_heart`) + colchón musical sintetizado.

- Capturas: `node` + puppeteer-core contra `npm start` (ver `assets/shots/`).
- Regenerar composición: `node build-index.mjs` (lee la duración real de `assets/vo/*.wav`).
- Colchón musical: `bash make-bed.sh <segundos>`.
- Render: `npx hyperframes render --output renders/patterns-tutorial.mp4`.
- Copia web: `ffmpeg -i renders/patterns-tutorial.mp4 -vf scale=1280:-2 -c:v libx264 -crf 27 -c:a aac -movflags +faststart media/video/patterns-tutorial.mp4`.
