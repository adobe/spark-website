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
/*  global fetch document window */

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
    // eslint-disable-next-line no-console
    console.log(`fetching ${url}`);
    const start = new Date();
    const resp = await fetch(url, { cache: 'no-store' });
    const json = await resp.json();
    // eslint-disable-next-line no-console
    console.log(`[${new Date() - start}ms] fetched ${url}`);
    return (json.data);
  } catch {
    return [];
  }
}

function toClassName(name) {
  return name && typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-')
    : '';
}

function createTable(redirects) {
  const table = createTag('table');
  redirects.forEach((row) => {
    const rowEl = createTag('tr', { class:'row' });
    const sourceEl = createTag('td');
    sourceEl.innerHTML = row.Source;
    rowEl.appendChild(sourceEl);
    const destEl = createTag('td');
    destEl.innerHTML = row.Destination;
    rowEl.appendChild(destEl);
    table.appendChild(rowEl);
  });
  return (table);
}

async function initTable() {
  const redirects = await fetchJson('/redirects.json');
  document.querySelector('main div.redirects').appendChild(createTable(redirects));
  return redirects;
}

async function checkRedirects() {
  const redirects = await initTable();
  const rows = [...document.querySelectorAll('main div.redirects tr')];
  for (let i = 0; i < rows.length; i += 1) {
    const tr = rows[i];
    const redirect = redirects[i];
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(redirect.Source, { redirect: 'manual' });

    const { status } = resp;

    const ok = (status === 0);
    const td = createTag('td', {
      class: ok ? 'ok' : 'error',
    });
    td.innerHTML = `${ok ? '301/302' : status}`;
    tr.appendChild(td);
    if (!ok) tr.classList.add('orange');
  }
}

checkRedirects();
