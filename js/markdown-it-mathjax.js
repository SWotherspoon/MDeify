;(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory()
  } else {
    root.markdownitMathjax = factory()
  }
})(this, function () {
  function math_inline(state, silent) {
    var start = state.pos
    if (state.src.charCodeAt(start) !== 0x5C ||
        state.src.charCodeAt(start+1) !== 0x28) {return false; }
    start += 2
    var end = state.src.indexOf('\\)', start)
    if (end === -1) { return false; }
    if (!silent) {
      var token = state.push('math_inline', 'math', 0)
      token.content = state.src.slice(start, end)
    }
    state.pos = end+2
    return true
  }
  function math_block(state, start, end, silent){
    var firstLine, lastLine, next, lastPos, found = false, token,
        pos = state.bMarks[start] + state.tShift[start],
        max = state.eMarks[start]
    
    if((pos + 2 > max) || state.src.slice(pos,pos+2)!=='\\['){ return false; }
    pos += 2;
    
    if(silent){ return true; }
    firstLine = state.src.slice(pos,max);
    if(firstLine.trim().slice(-2)==='\\]'){
      // Single line expression
      firstLine = firstLine.trim().slice(0, -2);
      found = true;
    }

    for(next = start; !found; ){
      next++;
      if(next >= end){ break; }
      
      pos = state.bMarks[next]+state.tShift[next];
      max = state.eMarks[next];
      
      if(pos < max && state.tShift[next] < state.blkIndent){
        // non-empty line with negative indent should stop the list:
        break;
      }
      
      if(state.src.slice(pos,max).trim().slice(-2)==='\\]'){
        lastPos = state.src.slice(0,max).lastIndexOf('\\]');
        lastLine = state.src.slice(pos,lastPos);
        found = true;
      }
      
    }
    
    state.line = next + 1;

    token = state.push('math_block', 'math', 0);
    token.block = true;
    token.content = (firstLine && firstLine.trim() ? firstLine + '\n' : '')
      + state.getLines(start + 1, next, state.tShift[start], true)
      + (lastLine && lastLine.trim() ? lastLine : '');
    token.map = [ start, state.line ];
    return true;
  }

  function escapeHtml (html) {
    return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ')
  }
  
  return function (md) {
    md.inline.ruler.before('escape', 'math_inline', math_inline)
    md.block.ruler.after('blockquote', 'math_block', math_block, {
        alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
    })

    md.renderer.rules.math_inline = function (tokens, idx) {
      return '\\(' + escapeHtml(tokens[idx].content) + '\\)'
    }
    md.renderer.rules.math_block = function (tokens, idx) {
      return '\\[' + escapeHtml(tokens[idx].content) + '\\]'
    }
  }
})
