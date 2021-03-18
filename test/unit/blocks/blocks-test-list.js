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

export default [{
  name: 'Table of Contents - 1 level',
  input: 'input/table-of-contents.1.doc.html',
  expected: 'expected/table-of-contents.1.block.html',
}, {
  name: 'Table of Contents - 2 levels',
  input: 'input/table-of-contents.2.doc.html',
  expected: 'expected/table-of-contents.2.block.html',
}, {
  name: 'Link Image - basic',
  input: 'input/link-image.1.doc.html',
  expected: 'expected/link-image.1.block.html',
}, {
  name: 'Link Image - no line breaks',
  input: 'input/link-image.2.doc.html',
  expected: 'expected/link-image.2.block.html',
}];
