const fs = require('mz/fs');
const fsExtra = require('fs-extra');
const dot = require('dot');
const docco = require('docco');

// Configs
const doccoConfig = {}; 
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
  const filePath = `elements/${name}/${name}.js`;
  return fs.readFile(filePath)
    .then(contents => {
      contents = contents.toString('utf-8');
      return {
        title: name,
        source: contents,
        sections: docco.parse(filePath, contents, doccoConfig),
        config: Object.assign({}, doccoConfig)
      };
    })
    .then(element => {
      docco.format(filePath, element.sections, element.config);
      return element;
    });
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