#!/usr/bin/env node
import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

const [,, inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/render-mermaid.mjs <input.mmd> <output.png>');
  process.exit(1);
}

const definition = await readFile(inputPath, 'utf8');

const { JSDOM } = await import('jsdom');
// Minimal DOM shim for Mermaid
const { window } = new JSDOM('<div id="mermaid-target"></div>');
global.window = window;
global.document = window.document;
if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = { userAgent: 'node.js' };
} else if (!globalThis.navigator.userAgent) {
  try {
    globalThis.navigator.userAgent = 'node.js';
  } catch {
    // ignore if navigator is read-only
  }
}
global.Element = window.Element;
global.MutationObserver = window.MutationObserver;
global.performance = window.performance;
global.requestAnimationFrame = window.requestAnimationFrame;
global.cancelAnimationFrame = window.cancelAnimationFrame;
global.getComputedStyle = window.getComputedStyle;
global.DOMRect = window.DOMRect;
const createDOMPurify = (await import('dompurify')).default;
const DOMPurify = createDOMPurify(window);
if (typeof DOMPurify.sanitize !== 'function' && typeof DOMPurify === 'function') {
  DOMPurify.sanitize = DOMPurify;
}
window.DOMPurify = DOMPurify;
global.DOMPurify = DOMPurify;
if (window.SVGElement && !window.SVGElement.prototype.getBBox) {
  window.SVGElement.prototype.getBBox = function getBBox() {
    const text = this.textContent || '';
    const width = Math.max(1, text.length * 7);
    return { x: 0, y: 0, width, height: 16 };
  };
}

if (typeof global.atob === 'undefined') {
  global.atob = (data) => Buffer.from(data, 'base64').toString('binary');
}
if (typeof global.btoa === 'undefined') {
  global.btoa = (data) => Buffer.from(data, 'binary').toString('base64');
}

const mermaidModule = await import('mermaid');
const mermaid = mermaidModule.default ?? mermaidModule;
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  sequence: {
    showSequenceNumbers: true,
  },
});

const { svg } = await mermaid.render('userCreationFlow', definition, undefined, document.body);

const { Resvg } = await import('@resvg/resvg-js');
const resvg = new Resvg(svg, {
  background: 'white',
  fitTo: {
    mode: 'width',
    value: 1400,
  },
});

const pngData = resvg.render().asPng();
await writeFile(outputPath, pngData);

console.log(`Rendered ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
