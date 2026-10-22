// Deterministic PNG generation, no network calls, paid services or third-party packages.
// Generates the installation icons from the Nocturne brand in the Vercel build.
import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

function checksum(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(checksum(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}
function segment(x, y, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(x - ax - t * vx, y - ay - t * vy);
}
function rounded(x, y, inset, radius) {
  const dx = Math.max(Math.abs(x - .5) - (.5 - inset - radius), 0);
  const dy = Math.max(Math.abs(y - .5) - (.5 - inset - radius), 0);
  return Math.hypot(dx, dy) <= radius;
}
function goldMask(x, y) {
  const w = .028;
  const ring = Math.abs(Math.hypot((x - .49) / .145, (y - .373) / .122) - 1) < .27 && x >= .485;
  return segment(x,y,.339,.244,.339,.755) < w ||
    segment(x,y,.339,.244,.487,.244) < w ||
    segment(x,y,.339,.502,.49,.502) < w ||
    segment(x,y,.485,.496,.667,.747) < w ||
    ring;
}
function render(size) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < size; x++) {
      let gold = 0, frame = 0;
      for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
        const px = (x + (sx + .5) / 2) / size, py = (y + (sy + .5) / 2) / size;
        if (goldMask(px, py)) gold++;
        if (rounded(px, py, .072, .199) && !rounded(px, py, .087, .184)) frame++;
      }
      const amount = Math.max(gold / 4, frame / 8);
      const fade = (x + y) / (size * 2);
      const i = y * stride + 1 + x * 4;
      raw[i] = Math.round(16 + fade * 33 + amount * (222 - 16 - fade * 33));
      raw[i + 1] = Math.round(13 + fade * 12 + amount * (188 - 13 - fade * 12));
      raw[i + 2] = Math.round(27 + fade * 16 + amount * (132 - 27 - fade * 16));
      raw[i + 3] = 255;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; header[9] = 6; // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
mkdirSync("public", { recursive: true });
for (const size of [192, 512]) writeFileSync(`public/icon-${size}.png`, render(size));
