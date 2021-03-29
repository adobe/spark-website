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
/* global */

import { linkImage } from '../../scripts/scripts.js';

export default function decorate($block) {
  const $rows = Array.from($block.children);
  if ($rows.length > 1) {
    $block.classList.add('table');
  }
  $rows.forEach(($row, rowNum) => {
    const $cells = Array.from($row.children);
    $cells.forEach(($cell, cellNum) => {
      if (cellNum === 0 && $block.classList.contains('numbered')) {
        // add number to first cell
        let num = rowNum + 1;
        if ($rows.length > 9) {
          // stylize with total for 10 or more items
          num = `${num}/${$rows.length} —`;
          if (rowNum < 9) {
            // pad number with 0
            num = `0${num}`;
          }
        } else {
          // regular ordered list style for 1 to 9 items
          num = `${num}.`;
        }
        $cell.innerHTML = `<span class="num">${num}</span>${$cell.innerHTML}`;
      }
      /* this probably needs to be tighter and possibly earlier */
      const $a = $cell.querySelector('a');
      if ($cell.querySelector('img') && $a) {
        if ($a.textContent.startsWith('https://')) {
          linkImage($cell);
        }
      }
    });
  });
}
