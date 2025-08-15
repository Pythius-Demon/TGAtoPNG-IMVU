// api/convert.js
import fetch from 'node-fetch';
import TGA from 'tga.js';
import { createCanvas, loadImage } from 'canvas';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing URL');

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  if (url.toLowerCase().endsWith('.tga')) {
    const tga = new TGA(new Uint8Array(buffer));
    const canvas = createCanvas(tga.width, tga.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(tga.getImageData(), 0, 0);
    const pngBuffer = canvas.toBuffer('image/png');
    res.setHeader('Content-Type', 'image/png');
    res.send(pngBuffer);
  } else {
    res.setHeader('Content-Type', response.headers.get('content-type'));
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  }
}
