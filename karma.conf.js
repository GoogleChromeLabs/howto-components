/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint max-len: ["off"], no-console: ["off"], require-jsdoc: 0 */
module.exports = function(config) {
  const configuration = {
    basePath: '',
    frameworks: ['mocha', 'chai'],
    files: [
      'node_modules/@webcomponents/webcomponentsjs/webcomponents-sd-ce.js',
      'tools/testing-helper.js',
      'elements/*/*.js',
    ],
    exclude: [
      'elements/*/*.e2etest.js',
    ],
    preprocessors: {
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome', 'Firefox', 'Safari'],
    singleRun: true,
    concurrency: Infinity,
    customLaunchers: {
      DockerChrome: {
          base: 'Chrome',
          flags: ['--no-sandbox'],
      },
    },
  };

  if (process.env.INSIDE_DOCKER) {
      configuration.browsers = ['DockerChrome'];
  }

  config.set(configuration);
};
