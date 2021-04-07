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

export default function decorate($block) {
  const $fullWidthPicture = $block.querySelector('picture');
  const $section = $block.closest('.section-wrapper');
  if ($fullWidthPicture) {
    if ($fullWidthPicture.parentNode.tagName === 'DIV') {
      $fullWidthPicture.classList.add('full-width-imageonly');
      $block.classList.add('image-only');
    } else {
      $fullWidthPicture.classList.add('full-width-bg');
    }
  } else {
    $section.classList.add('full-width-noimage');
  }
}
