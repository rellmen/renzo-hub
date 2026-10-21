import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../assets/nocturne-ascendancy.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('Nocturne visual layer is linked after existing component styles', () => {
  const current = html.indexOf('/assets/gym-lovable.css');
  const nocturne = html.indexOf('/assets/nocturne-ascendancy.css');
  assert.ok(current !== -1 && nocturne > current);
  assert.equal(html.match(/href="\/assets\/nocturne-ascendancy\.css"/g)?.length, 1);
});

test('Nocturne palette, accessible interaction, and theme modules are present', () => {
  for (const hex of ['#111116','#481d35','#6149a6','#c5c9d4','#c6a16c']) {
    assert.ok(css.toLowerCase().includes(hex), 'missing '+hex);
  }
  for (const name of ['#gym','#money','#study','#skin','#food','#work','#ares-center']) {
    assert.ok(css.includes(name), 'missing '+name);
  }
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /safe-area-inset/);
});

test('Home navigation preserves real handlers and contains the media', () => {
  assert.match(html, /class="rise-home-shortcuts"/);
  assert.match(html, /data-open="gym"/);
  assert.match(html, /data-open="money"/);
  assert.match(html, /data-open="study"/);
  assert.match(css, /\.rise-home-shortcuts \.rise-area\s*\{[^}]*overflow:\s*hidden;/s);
  assert.match(css, /\.rise-home-shortcuts \.rise-area \.rise-area-cover\s*\{[^}]*object-fit:\s*cover;/s);
});

test('Nocturne does not introduce remote assets or external CSS imports', () => {
  assert.doesNotMatch(css, /@import\b|url\(\s*["']?https?:\/\//i);
});
