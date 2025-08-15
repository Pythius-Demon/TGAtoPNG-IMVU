import fetch from 'node-fetch';
import { TGA } from 'tga2png';

export default async function handler(req, res) {
  try {
    const tgaUrl = req.query.url;
    if (!tgaUrl) throw new Error('No URL provided');

    const tgaResponse = await fetch(tgaUrl);
    const tgaBuffer = Buffer.from(await tgaResponse.arrayBuffer());

    const pngBuffer = TGA.toPNG(tgaBuffer); // returns full PNG buffer

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', pngBuffer.length);
    res.end(pngBuffer); // send entire PNG at once
  } catch (err) {
    res.status(500).send(`Error converting TGA: ${err.message}`);
  }
}
