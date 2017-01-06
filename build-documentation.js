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
const fs = require('mz/fs');
const fsExtra = require('fs-extra');
const dot = require('dot');
const sectionizer = require('./sectionizer.js').parse;

// Configs
const dotConfig = {
  strip: false
};

Object.assign(dot.templateSettings, dotConfig);
Promise.all([
  generateDocs(),
  copyStaticFiles(),
  copyDemos()
])
  .then(_ => console.log('done'));

function generateDocs() {
  return fs.mkdir('docs')
    .catch(_ => {})
    .then(_ => fs.readdir('elements'))
    .then(elements => Promise.all(
      elements.map(elem => parseElement(elem).then(writeElement))
    ))
    .then(buildIndex);
}

function copyStaticFiles() {
  return fs.readdir('site-resources')
    .then(files => 
      Promise.all(
        files
          .filter(name => !name.includes('.tpl.'))
          .map(name => copy(`site-resources/${name}`, `docs/${name}`))
      )
    );
}

function copyDemos() {
  return fs.readdir('elements')
    .then(files => 
      Promise.all(
        files.map(name => 
          copy(`elements/${name}/demo.html`, `docs/${name}_demo.html`)
            .then(_ => copy(`elements/${name}/${name}.js`, `docs/${name}.js`))
            .catch(err => console.log(`Error copying: ${err.toString()}`))
        )
      )
    );
}

function parseElement(name) {
  const filePath = `elements/${name}/${name}.js`;
  return fs.readFile(filePath)
    .then(contents => {
      contents = contents.toString('utf-8');
      return {
        title: name,
        source: contents,
        sections: sectionizer(contents)
      };
    })
    .catch(err => console.error(err.toString(), err.stack));
}

function writeElement(element) {
  return template('site-resources/element.tpl.html')
    .then(tpl => {
      const rendered = tpl(element);
      return fs.writeFile(`docs/${element.title}.html`, rendered)
        .then(_ => element);
    });
}

function buildIndex(elements) {
  return template('site-resources/index.tpl.html')
    .then(tpl => tpl(elements))
    .then(contents => fs.writeFile('docs/index.html', contents));
}

function template(path) {
  return fs
    .readFile(path)
    .then(contents => dot.template(contents.toString('utf-8')))
}

function copy(a, b) {
  return new Promise((resolve, reject) =>
    fsExtra.copy(a, b, (err) => {
      if (err) return reject(err);
      resolve();
    })
  );
}