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
const prism = require('prismjs');
const marked = require('marked');

// Configs
const dotConfig = {
  strip: false
};

Object.assign(dot.templateSettings, dotConfig);
Promise.all([
  generateDocs(),
  copyStaticFiles()
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

function parseElement(name) {
  const filePath = `elements/${name}/`;
  return Promise.all([
    fs.readFile(`${filePath}/${name}.js`),
    fs.readFile(`${filePath}/demo.html`)
  ])
    .then(([code, demo]) => {
      code = code.toString('utf-8');
      demo = demo.toString('utf-8');
      const data = {
        title: name,
        source: code,
        demo: demo,
        highlightedDemo: Prism.highlight(demo, Prism.languages.markup),
        sections: sectionizer(code)
      };
      if (data.sections[0].codeText === '') {
        data.intro = marked(data.sections.shift().commentText);
      } else {
        data.intro = '';
      }
      return fs.writeFile(`docs/${name}.js`, code).then(_ => data);
    })
    .then(contents => {
      contents.sections = 
        contents.sections
          // Make jsdoc blocks only belong to _one_ line of code for better visuals
          .reduce((accumulator, nextSegment) => {
            if (nextSegment.commentType !== 'BlockComment') return [...accumulator, nextSegment];
            const copy = Object.assign({}, nextSegment);
            const lines = nextSegment.codeText.replace(/^\n*/, '').split('\n');
            nextSegment.codeText = lines[0] + '\n';
            accumulator.push(nextSegment);
            if (lines.length >= 2 && lines[1] !== '') {
              copy.commentType = 'LineComment';
              copy.commentText = '';
              copy.codeText = lines.slice(1).join('\n'); 
              accumulator.push(copy);
            }
            return accumulator;
          }, [])
          .map(section => {
            section.commentText = marked(section.commentText);
            section.codeText = Prism.highlight(section.codeText, Prism.languages.javascript)
              .replace(/^\n*/, '')
              .replace(/\s*$/, '')
              .replace(/  /g, '<span class="indent">&nbsp;&nbsp;</span>');
            return section;
          });
      return contents;
    })
    .catch(err => console.error(err.toString(), err.stack));
}

function writeElement(element) {
  return Promise.all([
    template('site-resources/element.tpl.html'),
    template('site-resources/demo.tpl.html')
  ])
    .then(([elemTpl, demoTpl]) => Promise.all([
        fs.writeFile(`docs/${element.title}.html`, elemTpl(element)),
        fs.writeFile(`docs/${element.title}_demo.html`, demoTpl(element))
    ])).then(_ => element)
    .catch(err => console.log(err.toString(), err.stack))
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