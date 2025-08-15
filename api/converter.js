import { readFile } from 'fs/promises';
import path from 'path';
import { TGA } from 'tga2png'; // or your chosen library

export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) throw new Error("No URL provided");

    // Fetch the TGA file from IMVU
    const tgaRes = await fetch(url);
    const tgaBuffer = Buffer.from(await tgaRes.arrayBuffer());

    // Convert TGA to PNG
    const pngBuffer = TGA.toPNG(tgaBuffer); // make sure this returns a full PNG buffer

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', pngBuffer.length);
    res.end(pngBuffer); // send full buffer, not streaming
  } catch (err) {
    res.status(500).send(`Error converting TGA: ${err.message}`);
  }
}
