module.exports = function(config) {
  const configuration = {
    basePath: '',
    frameworks: ['mocha'],
    files: [
      'node_modules/chai/chai.js',
      'node_modules/@webcomponents/custom-elements/custom-elements.min.js',
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
