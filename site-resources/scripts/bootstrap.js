(function () {
  const asyncStyles = [
    'styles/highlighting.css'
  ];
  for(let asyncStyle of asyncStyles) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = asyncStyle;
    document.head.appendChild(link);
  }
})();