class ParserState {
  static get whitespace() { return ['\n', '\t', ' ']; }

  constructor(str) {
    this._str = str;
    this._index = 0;
    this._currentSegmentStart = 0;
    this.segments = [];
    this.meta = {};
    this.nonWhitespaceInSegment = false;
    // Start of file is practically a newline :3
    this.segmentStartsAfterNewline = true;
    this.lastNonWhitespaceCharacterWasNewline = true;
  }

  get sneakPeek() {
    return this._str.substr(this._index, 80);
  }

  get current() {
    if (this._index >= this._str.length) return null;
    return this._str[this._index];
  }

  next() {
    if (!ParserState.whitespace.includes(this.current)) {
      this.nonWhitespaceInSegment = true;
      this.lastNonWhitespaceCharacterWasNewline = false;
    } else if (this.current === '\n') 
      this.lastNonWhitespaceCharacterWasNewline = true;
    this._index++;
    return this.current;
  }

  isEOF() {
    return this._index >= this._str.length;
  }

  resetSegment() {
    this._currentSegmentStart = this._index;
    this.nonWhitespaceInSegment = false;
    this.segmentStartsAfterNewline = this.lastNonWhitespaceCharacterWasNewline;
  }

  pushSegment(meta = {}) {
    if (this._currentSegmentStart === this._index) return;
    const segment = Object.assign({}, this.meta, meta, {startIndex: this._currentSegmentStart, endIndex: this._index});
    this.segments.push(segment);
    this.resetSegment()
  }

  codeForSegment(segment) {
    return this._str.substring(segment.startIndex, segment.endIndex);
  }
}

function eatWhitespace(ss) {
  while (ParserState.whitespace.includes(ss.current)) ss.next();
}

function parseExpression(ss) {
  eatWhitespace(ss);
  if (ss.current === '/') {
      if (ss.nonWhitespaceInSegment) ss.pushSegment({type: 'code'});
      ss.next();
      return parseComment(ss);
  }
  parseCode(ss);
}

function parseComment(ss) {
  switch (ss.current) {
    case '/':
      ss.next();
      return parseLineComment(ss);
    case '*':
      ss.next();
      return parseBlockComment(ss);
    default:
      return parseCode(ss);
  }
}

function parseLineComment(ss) {
  while (ss.current !== '\n') ss.next();
  ss.next();
  if (ss.segmentStartsAfterNewline)
    ss.pushSegment({type: 'LineComment'});
  else
    ss.pushSegment({type: 'InlineComment'});
}

function parseBlockComment(ss) {
  while (true) {
    while (ss.current !== '*') ss.next();
    ss.next();
    if (ss.current === '/') {
      ss.next();
      return ss.pushSegment({type: 'BlockComment'});
    }
  }
}

function parseCode(ss) {
  if (ss.sneakPeek.startsWith('class ')) {
    ss.meta.objectType = 'class';
    ss.meta.objectName = /class\s*([^\s]*)/.exec(ss.sneakPeek)[1];
    while (ss.current !== '{') ss.next();
  } else if (ss.sneakPeek.startsWith('function ')) {
    ss.meta.objectType = 'function';
    ss.meta.objectName = /function\s*([^\s]*).+$/.exec(ss.sneakPeek)[1];
    while (ss.current !== '{') ss.next();
  }
  
  if (ss.current === '\'')
    return parseSingleQuotedString(ss);
  else if (ss.current === '\"')
    return parseDoubleQuotedString(ss);
  else if (ss.current === '{')
    return parseBlock(ss);
  else
    ss.next();
}

function parseBlock(ss) {
  ss.meta.indentationLevel++;
  ss.next();
  while(ss.current !== '}') {
    parseExpression(ss);
    eatWhitespace(ss);
  }
  ss.meta.indentationLevel--;
}

function parseDoubleQuotedString(ss) {
  ss.next();
  while (ss.current !== '"') {
    if (ss.current === '\\') ss.next();
    ss.next();
  }
  ss.next();
}

function parseSingleQuotedString(ss) {
  ss.next();
  while (ss.current !== '\'') {
    if (ss.current === '\\') ss.next();
    ss.next();
  }
  ss.next();
}

function parse(str) {
  const ss = new ParserState(str);
  ss.meta.indentationLevel = 0;

  while (!ss.isEOF()) parseExpression(ss);
  ss.pushSegment({type: 'code'});

  // Always start with a comment block. Add an empty one if necessary.
  if (ss.segments[0].type === 'code') 
    ss.segments.unshift({
      type: 'LineComment',
      text: '',
      startIndex: 0,
      endIndex: 0
    });

  return ss.segments
    // Coalesc sequences of line comments
    .reduce((accumulator, nextSegment) => {
      if (accumulator.length <= 0) return [nextSegment];
      const lastSegment = accumulator[accumulator.length - 1];
      if (
        lastSegment.type === 'LineComment'
        &&
        nextSegment.type === 'LineComment'
        &&
        lastSegment.endIndex === nextSegment.startIndex
      ) {
        lastSegment.endIndex = nextSegment.endIndex;
      } else {
        accumulator.push(nextSegment);
      }
      return accumulator;
    }, [])
    // Put the actual text into the segment objects
    .map(segment => Object.assign(segment, {text: ss.codeForSegment(segment)}))
    // Cleanup comment blocks of their comment symbols
    .map(segment => {
      console.log(segment);
      switch (segment.type) {
        case 'LineComment':
        // case 'InlineComment':
          segment.text = segment.text.replace(/^\s*\/\//mg, '');
          break;
        case 'BlockComment':
          segment.text = 
            segment.text
              .replace(/^\s*\/\**\s*$/m, '')
              .replace(/^\s*\*[ \t]*/mg, '')
              .replace(/^\s*\**\/$/m, '');
          break;
      }
      return segment;
    })
    // Pair up one comment block and one code block. Strip out all
    // the metadata.
    .reduce((accumulator, nextSegment, idx) => {
      // Start a new block for either of these two types
      if (['LineComment', 'BlockComment'].includes(nextSegment.type)) {
        accumulator.push({
          commentText: nextSegment.text,
          codeText: ''
        });
        return accumulator;
      }
      // Otherwise append
      const lastSegment = accumulator[accumulator.length - 1];
      lastSegment.codeText += nextSegment.text;
      return accumulator;
    }, [])
}

module.exports = {
  ParserState,
  parse
};