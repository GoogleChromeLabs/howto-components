class ParserState {
  static get whitespace() { return ['\n', '\t', ' ']; }

  constructor(str) {
    this._str = str;
    this._index = 0;
    this._currentSegmentStart = 0;
    this.segments = [];
    this.nonWhitespaceInSegment = false;
    this.segmentStartsAfterNewline = false;
    this.lastNonWhitespaceCharacterWasNewline = false;
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
    const segment = Object.assign({}, meta, {startIndex: this._currentSegmentStart, endIndex: this._index - 1});
    this.segments.push(segment);
    this.resetSegment()
  }

  codeForSegment(segment) {
    return this._str.substring(segment.startIndex, segment.endIndex);
  }
}

function eatWhitespace(ss, state) {
  while (ParserState.whitespace.includes(ss.current)) ss.next();
}

function parseSegment(ss, state) {
  eatWhitespace(ss, state);
  switch (ss.current) {
    case '/':
      if (ss.nonWhitespaceInSegment) ss.pushSegment({type: 'code'});
      ss.next();
      parseComment(ss);
      break;
    default:
      parseCode(ss);
      break;
  }
}

function parseComment(ss) {
  switch (ss.current) {
    case '/':
      ss.next();
      parseLineComment(ss);
      break;
    case '*':
      ss.next();
      parseBlockComment(ss);
      break;
    default:
      parseCode(ss);
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
      ss.pushSegment({type: 'BlockComment'});
      break;
    }
  }
}

function parseCode(ss) {
  switch(ss.current) {
    case '\'':
      parseSingleQuotedString(ss);
      break;
    case '\"':
      parseDoubleQuotedString(ss);
      break;
    case '/':
      ss.pushSegment({type: 'code'});
      ss.next();
      parseComment(ss);
      break;
    default:
      ss.next();
  }
}

function parseDoubleQuotedString(ss) {
  while (ss.current !== '"') {
    if (ss.current === '\\') ss.next();
    ss.next();
  }
  ss.next();
}

function parseSingleQuotedString(ss) {
  while (ss.current !== '\'') {
    if (ss.current === '\\') ss.next();
    ss.next();
  }
  ss.next();
}

function parse(str) {
  const ss = new ParserState(str);

  while (!ss.isEOF()) parseSegment(ss);
  ss.pushSegment({type: 'code'});

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
        lastSegment.endIndex + 1 === nextSegment.startIndex
      ) {
        lastSegment.endIndex = nextSegment.endIndex;
      } else {
        accumulator.push(nextSegment);
      }
      return accumulator;
    }, [])
    .map(segment => Object.assign(segment, {text: ss.codeForSegment(segment)}));
}

module.exports = {
  ParserState,
  parse
};