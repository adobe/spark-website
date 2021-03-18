/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global expect fetch document */
/* eslint-env mocha */

import TESTS from './blocks-test-list.js';

const ROOT_PATH = '/blocks';

const getFragment = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content;
};

const trim = (html) => html
  .replace(/^\s*/gm, '')
  .replace(/\s*$/gm, '')
  .replace(/\n/gm, '');

const fragmentToString = (fragment) => {
  let html = '';
  fragment.children.forEach((c) => {
    html += c.outerHTML;
  });
  return trim(html);
};

describe('Block tests', () => {
  TESTS.forEach((test) => {
    it(test.name, async () => {
      const req = await fetch(`${ROOT_PATH}/${test.input}`);
      let html = await req.text();

      const doc = getFragment(html);

      html = await (await fetch(`${ROOT_PATH}/${test.expected}`)).text();
      const $expected = getFragment(html);

      const block = doc.querySelector('main > div');

      const classes = Array.from(block.classList.values());
      const blockName = classes[0];

      const mod = await import(`/express/blocks/${blockName}/${blockName}.js`);
      mod.default(block, blockName, doc);

      expect(fragmentToString(block)).to.be.equal(fragmentToString($expected));
    });
  });
});
