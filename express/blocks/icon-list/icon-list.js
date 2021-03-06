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

import {
  toClassName,
  getIcon,
  addBlockClasses,
} from '../../scripts/scripts.js';

export default function decorate($block) {
  addBlockClasses($block, ['icon-list-image', 'icon-list-description']);
  $block.querySelectorAll(':scope>div').forEach(($row) => {
    if ($row.children && $row.children[1]) {
      const iconName = toClassName($row.children[0].textContent);
      if (iconName && !iconName.startsWith('-')) {
        $row.children[0].innerHTML = iconName ? getIcon(iconName) : '';
      }
    }
  });
}
