/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* global document fetch DOMParser window */

let sitemapURLs = [];
let totalSize = 0;
let totalFiles = 0;
let totalFilesScanned = 0;
let totalFilesMatched = 0;
let startTime = new Date();
let endTime = 0;
let { origin } = window.location;
let suffix = '';

function humanFileSize(bytes, si = false, dp = 1) {
  let numBytes = bytes;
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    numBytes /= thresh;
    u += 1;
  } while (Math.round(Math.abs(numBytes) * r) / r >= thresh && u < units.length - 1);

  return `${numBytes.toFixed(dp)} ${units[u]}`;
}

function updateStatus() {
  endTime = new Date();
  const status = document.getElementById('status');
  const seconds = Math.floor((endTime - startTime) / 100) / 10;
  status.innerHTML = `Matched Files: ${totalFilesMatched} / ${totalFilesScanned} / ${totalFiles} (${humanFileSize(totalSize, true)}) ${seconds}s`;
}

async function loadJSON(jsonURL) {
  const resp = await fetch(jsonURL);
  const json = await resp.json();
  if (json.data) {
    json.data.forEach((row) => {
      const keys = Object.keys(row);
      keys.forEach((key) => {
        try {
          const url = new URL(row[key]);
          sitemapURLs.push(url.pathname);
          totalFiles += 1;
          origin = url.origin;
        } catch (e) {
          console.log(e);
        }
      });
    });
  }
  updateStatus();
}

async function loadSitemap(sitemapURL) {
  const resp = await fetch(`${origin}${sitemapURL}`);
  const xml = await resp.text();
  const sitemap = new DOMParser().parseFromString(xml, 'text/xml');
  const subSitemaps = [...sitemap.querySelectorAll('sitemap loc')];
  for (let i = 0; i < subSitemaps.length; i += 1) {
    const loc = subSitemaps[i];
    const subSitemapURL = new URL(loc.textContent);
    // eslint-disable-next-line no-await-in-loop
    await loadSitemap(`${subSitemapURL.pathname}`);
  }
  const urlLocs = sitemap.querySelectorAll('url loc');
  urlLocs.forEach((loc) => {
    const locURL = new URL(loc.textContent);
    sitemapURLs.push(locURL.pathname);
    totalFiles += 1;
  });
  updateStatus();
}

async function fgrep(pathname, pattern) {
  const resp = await fetch(`${origin}${pathname}${suffix ? `?${suffix}` : ''}`);
  const text = await resp.text();
  let found = false;
  if (text.indexOf(pattern) >= 0) {
    found = true;
  }
  const { status } = resp;
  const size = +resp.headers.get('content-length');
  return ({
    found,
    size,
    status,
    pathname,
  });
}

function displayError(result) {
  const resultDisplay = document.getElementById('results');
  const p = document.createElement('p');
  p.classList.add('error');
  p.innerHTML = `<a href="${result.pathname}">${result.pathname}${suffix ? `?${suffix}` : ''}</a> (${result.error})`;
  resultDisplay.appendChild(p);
}

function displayResult(result) {
  const resultDisplay = document.getElementById('results');
  totalSize += result.size;
  totalFilesMatched += result.found ? 1 : 0;
  if (result.found) {
    const p = document.createElement('p');
    p.innerHTML = `${humanFileSize(result.size, true).padStart(9, ' ')} <a href="${result.pathname}">${result.pathname}${suffix ? `?${suffix}` : ''}</a> (${result.status})`;
    resultDisplay.appendChild(p);
  }
}

async function fgrepNextFile(queue, pattern) {
  const path = queue.shift();
  if (path) {
    totalFilesScanned += 1;
    try {
      const result = await fgrep(path, pattern);
      if (result.status === 200) {
        displayResult(result);
      } else {
        displayError({
          pathname: path,
          error: result.status,
        });
      }
    } catch (e) {
      displayError({
        pathname: path,
        error: e.message,
      });
    }
    updateStatus();
    if (queue[0]) fgrepNextFile(queue, pattern);
  }
}

async function fgrepFiles(sitemap, pattern, connections) {
  const queue = [...sitemap];
  for (let c = 0; c < connections; c += 1) {
    fgrepNextFile(queue, pattern);
  }
}

// eslint-disable-next-line import/prefer-default-export
export async function run() {
  sitemapURLs = [];
  totalSize = 0;
  totalFilesScanned = 0;
  totalFilesMatched = 0;
  startTime = new Date();
  endTime = new Date();
  document.getElementById('results').textContent = '';

  suffix = new URLSearchParams(window.location.search).get('suffix');
  const json = new URLSearchParams(window.location.search).get('json');
  if (json) {
    updateStatus();
    await loadJSON(json);
  } else {
    const sitemapParam = new URLSearchParams(window.location.search).get('sitemap');
    const sitemapRoot = sitemapParam || '/express/sitemap.xml';
    const sitemapURL = new URL(sitemapRoot, window.location.href);
    origin = sitemapURL.origin;
    updateStatus();
    await loadSitemap(sitemapURL.pathname);
  }
  const sitemap = sitemapURLs;
  let pattern = document.getElementById('input').value;
  let connections = 10;
  if (pattern.includes(' -c ')) {
    [pattern, connections] = pattern.split(' -c ');
  }
  fgrepFiles(sitemap, pattern, +connections);
}

const runButton = document.getElementById('run');
runButton.addEventListener('click', () => {
  run();
});

const input = document.getElementById('input');
input.focus();
input.addEventListener('keyup', (event) => {
  if (event.keyCode === 13) {
    runButton.click();
  }
});
