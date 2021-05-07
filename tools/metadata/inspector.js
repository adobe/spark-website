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
/*  global fetch document */

function createTag(name, attrs) {
  const el = document.createElement(name);
  if (typeof attrs === 'object') {
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
  }
  return el;
}

async function fetchJson(url) {
  try {
    console.log(`fetching ${url}`);
    const start = new Date();
    const resp = await fetch(url, { cache: 'no-store' });
    const json = await resp.json();
    console.log(`[${new Date() - start}ms] fetched index ${url}`);
    return (json.data);
  } catch {
    return [];
  }
}

async function fetchIndex(prefix) {
  const url = `${prefix}/express/query-index.json`;
  const blogurl = `${prefix}/express/learn/blog/query-index.json`;
  const index = [...await fetchJson(url), ...await fetchJson(blogurl)];
  index.sort((e1, e2) => e1.path.localeCompare(e2.path));
  console.log(`total index length: ${index.length}`);
  return (index);
}

async function getPages() {
  const index = [];
  const locales = ['', '/br', '/cn', '/it', '/de', '/dk', '/fr', '/es', '/fi', '/jp', '/kr', '/nl', '/no', '/se', '/tw'];
  for (const prefix of locales) {
    // eslint-disable-next-line no-await-in-loop
    const segment = await fetchIndex(prefix);
    index.push(...segment);
  }
  return (index);
}

function isValidPath(path) {
  const validPath = /[0-9a-z-/*]/;
  return (validPath.test(path));
}

function convertGlobToRe(glob) {
  let reString = glob.replace(/\*\*/g, '_');
  reString = reString.replace(/\*/g, '[0-9a-z-]*');
  reString = reString.replace(/_/g, '.*');
  console.log(reString);
  return (new RegExp(reString));
}

function addToMeta(meta, props) {
  const keys = Object.keys(props);
  keys.forEach((key) => {
    if (!['re', 'URL'].includes(key)) {
      const prop = props[key];
      if (prop) {
        meta[key] = prop;
      }
    }
  });
}

async function displayURLs() {
  const pages = await getPages();
  const metadataRaw = await fetchJson('/metadata.json');
  const metadata = metadataRaw.filter((row) => {
    row.URL = row.URL.trim();
    return isValidPath(row.URL);
  });

  const patterns = [];
  const cols = Object.keys(metadata[0]);
  cols.shift();

  const simplePaths = { paths: [], lookup: {} };
  metadata.forEach((row) => {
    if (row.URL.includes('*')) {
      row.re = convertGlobToRe(row.URL);
      patterns.push(row);
    } else {
      simplePaths.paths.push(row.URL);
      simplePaths.lookup[row.URL] = row;
    }
  });

  const $pages = document.querySelector('.pages');

  const $table = createTag('table');
  const $tr = createTag('tr');
  ['Page', ...cols].forEach((e) => {
    const $th = createTag('th', { class: 'header' });
    $th.innerHTML = e;
    $tr.appendChild($th);
  });
  $table.appendChild($tr);

  pages.forEach((page) => {
    const path = page.path.split('.')[0];
    const meta = {};
    patterns.forEach((row) => {
      if (row.re.test(path)) {
        addToMeta(meta, row);
      }
    });
    if (simplePaths.paths.includes(path)) {
      addToMeta(meta, simplePaths.lookup[path]);
    }
    const $tdr = createTag('tr');
    const $th = createTag('th', { class: 'row' });
    $th.innerHTML = `<a href="${path}">${path}</a>`;
    $tdr.appendChild($th);
    cols.forEach((col) => {
      const $td = createTag('td');
      $td.innerHTML = meta[col] || '';
      $tdr.appendChild($td);
    });
    $table.appendChild($tdr);
  });
  $pages.appendChild($table);
}

displayURLs();
