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
const origFs = require('fs');
const fs = require('mz/fs');
const fsExtra = require('fs-extra');
const dot = require('dot');
const sectionizer = require('./sectionizer.js').parse;
const prism = require('prismjs');
const marked = require('marked');

// Configs
const dotConfig = {
  strip: false,
};

Object.assign(dot.templateSettings, dotConfig);
Promise.all([
  generateDocs(),
  copyStaticFiles(),
])
  .then(_ => console.log('done'));

function generateDocs() {
  return fs.mkdir('docs')
    .catch(_ => {})
    .then(_ => fs.readdir('elements'))
    .then(elements => Promise.all(
      elements.map(elem =>
        fs.mkdir(`docs/${elem}`)
          .catch(_ => {})
          .then(_ => parseElement(elem))
          .then(writeElement)
      )
    ))
    .then(buildIndex);
}

function copyStaticFiles() {
  return Promise.all([
    fs.readdir('site-resources')
      .then(files =>
        Promise.all(
          files
            .filter(name => !name.includes('.tpl.'))
            .map(name => copy(`site-resources/${name}`, `docs/${name}`))
        )
      ),
    fs.readdir('elements')
      .then(elements => Promise.all(
        elements.map(elem =>
          copy(`elements/${elem}/images`, `docs/images`).catch(_ => {})
        )
      )),
  ]);
}

function parseElement(name) {
  const filePath = `elements/${name}/`;
  return Promise.all([
    fs.readFile(`${filePath}/${name}.js`),
    fs.readFile(`${filePath}/demo.html`),
  ])
    .then(([code, demo]) => {
      code = code.toString('utf-8');
      demo = demo.toString('utf-8').replace(/{%[^%]+%}/g, '');
      const data = {
        title: name,
        source: code,
        demo: demo,
        demoSections: sectionizer(demo),
        sections: sectionizer(code),
      };
      return fs.writeFile(`docs/${name}/${name}.js`, code).then(_ => data);
    })
    .then(contents => {
      // Remove copyright blocks
      removeCopyright(contents.sections);
      removeCopyright(contents.demoSections);
      contents.sections =
        contents.sections
          // Make jsdoc blocks only belong to _one_
          // line of code for better visuals
          .reduce((accumulator, nextSection) => {
            if (nextSection.commentType !== 'BlockComment')
              return [...accumulator, nextSection];
            const copy = Object.assign({}, nextSection);
            const lines = nextSection.codeText.replace(/^\n*/, '').split('\n');
            nextSection.codeText = lines[0] + '\n';
            accumulator.push(nextSection);
            if (lines.length >= 2) {
              copy.commentType = 'LineComment';
              copy.commentText = '';
              copy.codeText = lines.slice(1).join('\n');
              accumulator.push(copy);
            }
            return accumulator;
          }, []);
      return contents;
    })
    .catch(err => console.error(err.toString(), err.stack));
}

function removeCopyright(sections) {
  if (sections[0].commentType === 'BlockComment'
    && sections[0].commentText.indexOf('Copyright 2017 Google') !== -1) {
      sections[0].commentText = '';
    }
  sections.forEach(section => {
    section.codeText = section.codeText.replace(/<!--([^-]|-[^>])+-->/g, '');
  });
}

function addHelperFunctionsToContext(context) {
  return Object.assign({}, context, {
    readFile: file => origFs.readFileSync(file).toString('utf-8'),
    highlightJS: text =>
      prism.highlight(text, prism.languages.javascript)
        .replace(/^\n*/, '')
        .replace(/\s*$/, '')
        .replace(/  /g, '<span class="indent">&nbsp;&nbsp;</span>'),
    highlightHTML: text =>
      prism.highlight(text, prism.languages.markup)
        .replace(/^\n*/, '')
        .replace(/\s*$/, '')
        .replace(/  /g, '<span class="indent">&nbsp;&nbsp;</span>'),
    markdown: text => marked(text),
    escape: text =>
      text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;'),
    indentLines: text => text
      .replace(/^\n*/, '')
      .replace(/\s*$/, '')
      .replace(/  /g, '<sPan class="indent">&nbsp;&nbsp;</span>'),
    isEmpty: text => text.trim().length <= 0,
  });
}

function writeElement(element) {
  const augmentedContext = addHelperFunctionsToContext(element);
  return Promise.all([
    template('site-resources/element.tpl.html'),
    template('site-resources/demo.tpl.html'),
    template('site-resources/element.tpl.md'),
  ])
    .then(([elemTpl, demoTpl, devsite]) => Promise.all([
        fs.writeFile(`docs/${element.title}/index.html`, elemTpl(augmentedContext)),
        fs.writeFile(`docs/${element.title}/demo.html`, demoTpl(augmentedContext)),
        fs.writeFile(`docs/${element.title}/${element.title}.md`, devsite(augmentedContext)),
    ]))
    .then(_ => element)
    .catch(err => console.log(err.toString(), err.stack));
}

function buildIndex(elements) {
  return template('site-resources/index.tpl.html')
    .then(tpl => tpl(elements))
    .then(contents => fs.writeFile('docs/index.html', contents));
}

function template(path) {
  return fs
    .readFile(path)
    .then(contents => dot.template(contents.toString('utf-8')));
}

function copy(a, b) {
  return new Promise((resolve, reject) =>
    fsExtra.copy(a, b, (err) => {
      if (err)
        return reject(err);
      resolve();
    })
  );
}
