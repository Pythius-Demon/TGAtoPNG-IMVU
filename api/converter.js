import fetch from "node-fetch";

// Minimal TGA decoder in pure JS
function parseTGA(buffer) {
  const view = new DataView(buffer);
  const width = view.getUint16(12, true);
  const height = view.getUint16(14, true);
  const bpp = view.getUint8(16);
  if (bpp !== 24 && bpp !== 32) throw new Error("Unsupported TGA BPP: " + bpp);

  const pixels = new Uint8ClampedArray(width * height * 4);
  const dataOffset = 18;
  let j = 0;

  for (let i = dataOffset; i < buffer.byteLength; i += bpp / 8) {
    pixels[j++] = view.getUint8(i + 2); // R
    pixels[j++] = view.getUint8(i + 1); // G
    pixels[j++] = view.getUint8(i + 0); // B
    pixels[j++] = bpp === 32 ? view.getUint8(i + 3) : 255; // A
  }

  return { width, height, pixels };
}

// Convert TGA → PNG using pngjs
import { PNG } from "pngjs";

export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    if (url.toLowerCase().endsWith(".tga")) {
      // Parse TGA
      const { width, height, pixels } = parseTGA(arrayBuffer);

      // Convert to PNG
      const png = new PNG({ width, height });
      png.data = Buffer.from(pixels);

      const chunks = [];
      png.pack().on("data", (chunk) => chunks.push(chunk));
      png.pack().on("end", () => {
        const pngBuffer = Buffer.concat(chunks);
        res.setHeader("Content-Type", "image/png");
        res.send(pngBuffer);
      });
    } else {
      // Non-TGA, forward original
      const contentType = response.headers.get("content-type") || "application/octet-stream";
      const data = await response.arrayBuffer();
      res.setHeader("Content-Type", contentType);
      res.send(Buffer.from(data));
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Error fetching or converting file");
  }
}
