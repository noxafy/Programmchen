p = require('./parser_lib')
Parser = p.Parser
input = process.argv[2]
input = renderSymbols(input)
console.log(JSON.stringify(new Parser().parseInput(input)))

function renderSymbols(str) {
  str = str.replace(/&|\*| and /ig, '∧');
  str = str.replace(/v|\|| or /ig, ' ∨ ');
  str = str.replace(/~|not/ig, '¬');
  str = str.replace(/\+| xor /ig, '^');
  str = str.replace(/ nand /ig, '⊼');
  str = str.replace(/<->| iff /ig, '↔');
  str = str.replace(/->/g, '→');
  str = str.replace(/(\\neg|\\lnot)[\{ ]?\}?/g, '¬');
  str = str.replace(/(\\vee|\\lor)[\{ ]?\}?/g, '∨');
  str = str.replace(/(\\wedge|\\land)[\{ ]?\}?/g, '∧');
  str = str.replace(/(\\to|\\rightarrow)[\{ ]?\}?/g, '→');
  str = str.replace(/\\leftrightarrow[\{ ]?\}?/g, '↔');
  return str;
}
