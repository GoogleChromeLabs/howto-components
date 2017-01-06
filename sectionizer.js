module.exports = (code) => {
  let comments = [];
  let match;
  while((match = commentRegexp.exec(code)) !== null) {
    comments.push({ 
      text: match[0],
      type: match[0].startsWith('/*') ? 'block' : 'line',
      start: match.index,
      end: commentRegexp.lastIndex
    });
  }

  // Coalescing sequential line comments
  comments = comments
    .slice(1).reduce((allComments, newComment) => {
      const lastComment = allComments[allComments.length - 1]
      // If the previous comment was a block comment, just push
      // the new one.
      if (
          lastComment.type === 'line' && 
          newComment.type === 'line' &&
          lastComment.end + 1 === newComment.start
        ) {
        lastComment.end = newComment.end;
        lastComment.text += '\n' + newComment.text;
      } else {
        allComments.push(newComment);
      }
    
      return allComments;
    }, [comments[0]]);
    // Removing comment symbols and adding code sections
    return comments.map((comment, idx) => {
      comment.text = comment.text.replace(/^\s*\/\/\s*(.*)$/mg, '$1').replace(/^\s*\/\*\*\s*$|^\s*\*\s*(.*)$|\s*\*\/\s*$/mg, '$1');
      comment.source = code.substring(comments[idx].end, (idx+1 < comments.length) && comments[idx+1].start || code.length);
      return comment;
    });
};