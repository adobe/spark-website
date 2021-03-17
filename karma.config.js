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

module.exports = (config) => {
  config.set({
    frameworks: ['mocha', 'chai'],
    plugins: ['karma-chrome-launcher', 'karma-chai', 'karma-mocha', 'karma-mocha-reporter'],
    files: [
      { pattern: './express/**/*.js', type: 'module', included: false },
      { pattern: './test/unit/**/*.test.js', type: 'module' },
      { pattern: './test/unit/blocks/**/*.html' },
      { pattern: './test/unit/blocks/blocks-test-list.js', type: 'module' },
    ],
    reporters: ['mocha'],
    port: 9876,
    proxies: {
      '/express': '/base/express',
      '/blocks': '/base/test/unit/blocks',
    },
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity,
    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9333'],
      },
    },
  });
};
