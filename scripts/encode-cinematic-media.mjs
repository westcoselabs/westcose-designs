// Rebuild delivery variants of the existing 1280×720 master. Original is untouched.
// Usage: FFMPEG_PATH=/path/to/ffmpeg node scripts/encode-cinematic-media.mjs
import { execFileSync } from "node:child_process";
import path from "node:path";

const encoder = process.env.FFMPEG_PATH || "ffmpeg";
const directory = path.resolve("public/experience/falling-studio");
const master = path.join(directory, "i_want_to_create_a_video_using_scrub.mp4");
const variants = [
  { name: "desktop", filter: "crop=984:554:148:84,scale=1280:720,fps=24", crf: "20", poster: "falling-cinema-poster.webp" },
  { name: "portrait", filter: "crop=312:554:484:84,scale=540:960,fps=24", crf: "23", poster: "falling-cinema-portrait.webp" },
];
for (const variant of variants) {
  const destination = path.join(directory, `falling-scrub-${variant.name}.mp4`);
  execFileSync(encoder, ["-y", "-hide_banner", "-loglevel", "error", "-i", master,
    "-an", "-vf", variant.filter, "-c:v", "libx264", "-crf", variant.crf,
    "-preset", "fast", "-g", "6", "-keyint_min", "6", "-sc_threshold", "0",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", destination], { stdio: "inherit" });
  execFileSync(encoder, ["-y", "-hide_banner", "-loglevel", "error", "-i", destination,
    "-frames:v", "1", path.join(directory, variant.poster)], { stdio: "inherit" });
}
