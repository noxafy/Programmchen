/* check the source on github.com/wo/tpg */

Array.prototype.isArray = true;
Array.prototype.toString = function() {
  return "[" + this.join(",") + "]";
}
if (!Array.prototype.includes) {
  Array.prototype.includes = function(element) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == element) return true;
    }
    return false;
  }
}
Array.prototype.remove = function(element) {
  var index = this.indexOf(element);
  if (index > -1) this.splice(index, 1);
}
Array.prototype.intersect = function(elements) {
  for (var i = 0; i < this.length; i++) {
    if (elements.indexOf(this[i]) == -1) {
      this.splice(i--, 1);
    }
  }
}
Array.prototype.insert = function(element, index) {
  return this.splice(index, 0, element);
}
Array.prototype.concatNoDuplicates = function(array2) {
  var hash = {};
  var res = [];
  for (var i = 0; i < this.length; i++) {
    hash[this[i].toString()] = true;
    res.push(this[i]);
  }
  for (var i = 0; i < array2.length; i++) {
    var s = array2[i].toString();
    if (!hash[s]) {
      hash[s] = true;
      res.push(array2[i]);
    }
  }
  return res;
}
Array.prototype.removeDuplicates = function() {
  var hash = {};
  var res = [];
  for (var i = 0; i < this.length; i++) {
    var s = this[i].toString();
    if (!hash[s]) {
      hash[s] = true;
      res.push(this[i]);
    }
  }
  return res;
}
Array.getArrayOfZeroes = function(length) {
  for (var i = 0, a = new Array(length); i < length;) a[i++] = 0;
  return a;
}
Array.getArrayOfNumbers = function(length) {
  for (var i = 0, a = new Array(length); i < length; i++) a[i] = i;
  return a;
}
Array.prototype.copy = function() {
  var result = [];
  for (var i = 0; i < this.length; i++) result[i] = this[i];
  return result;
}
Array.prototype.copyDeep = function() {
  var result = [];
  for (var i = 0; i < this.length; i++) {
    if (this[i].isArray) result[i] = this[i].copyDeep();
    else result[i] = this[i];
  }
  return result;
}
Array.prototype.equals = function(arr2) {
  if (this.length != arr2.length) return false;
  for (var i = 0; i < this.length; i++) {
    if (this[i].isArray) {
      if (!arr2[i].isArray) return false;
      if (!this[i].equals(arr2[i])) return false;
    } else if (this[i] != arr2[i]) return false;
  }
  return true;
}

function Formula() {}
Formula.prototype.toString = function() {
  return this.string;
}
Formula.prototype.equals = function(fla) {
  return this.string == fla.string;
}
Formula.prototype.negate = function() {
  return new NegatedFormula(this);
}
Formula.prototype.unify = function(formula) {
  //
  //
  if (this.type != 'literal') return false;
  if (this.sub && !formula.sub) return false;
  if (this.sub) return this.sub.unify(formula.sub);
  if (this.predicate != formula.predicate) return false;
  if (this.terms.length != formula.terms.length) return false;
  var unifier = [];
  var terms1 = this.terms.copyDeep();
  var terms2 = formula.terms.copyDeep();
  var t1, t2;
  while (t1 = terms1.shift(), t2 = terms2.shift()) {
    if (t1 == t2) {
      continue;
    }
    if (t1.isArray && t2.isArray) {
      if (t1[0] != t2[0]) return false;
      for (var i = 1; i < t1.length; i++) {
        terms1.push(t1[i]);
        terms2.push(t2[i]);
      }
      continue;
    }
    var t1Var = (t1[0] == 'ξ' || t1[0] == 'ζ');
    var t2Var = (t2[0] == 'ξ' || t2[0] == 'ζ');
    if (!t1Var && !t2Var) {
      return false;
    }
    if (!t1Var) {
      var temp = t1;
      t1 = t2;
      t2 = temp;
    }
    if (t2.isArray) {
      var terms, termss = [t2];
      while (terms = termss.shift()) {
        for (var i = 0; i < terms.length; i++) {
          if (terms[i].isArray) termss.push(terms[i]);
          else if (terms[i] == t1) {
            return false;
          }
        }
      }
    }
    var terms, termss = [unifier, terms1, terms2];
    while (terms = termss.shift()) {
      for (var i = 0; i < terms.length; i++) {
        if (terms[i].isArray) termss.push(terms[i]);
        else if (terms[i] == t1) terms[i] = t2;
      }
    }
    unifier.push(t1);
    unifier.push(t2);
  }
  return unifier;
}
Formula.prototype.normalize = function() {
  var op = this.operator || this.quantifier;
  if (!op) return this;
  switch (op) {
    case '∧':
    case '∨':
      {
        var sub1 = this.sub1.normalize();
        var sub2 = this.sub2.normalize();
        return new BinaryFormula(op, sub1, sub2);
      }
    case '→':
      {
        var sub1 = this.sub1.negate().normalize();
        var sub2 = this.sub2.normalize();
        return new BinaryFormula('∨', sub1, sub2);
      }
    case '↔':
      {
        var sub1 = new BinaryFormula('∧', this.sub1, this.sub2).normalize();
        var sub2 = new BinaryFormula('∧', this.sub1.negate(), this.sub2.negate()).normalize();
        return new BinaryFormula('∨', sub1, sub2);
      }
    case '∀':
    case '∃':
      {
        return new QuantifiedFormula(op, this.variable, this.matrix.normalize(),
          this.overWorlds);
      }
    case '□':
    case '◇':
      {
        return new ModalFormula(op, this.sub.normalize());
      }
    case '¬':
      {
        var op2 = this.sub.operator || this.sub.quantifier;
        if (!op2) return this;
        switch (op2) {
          case '∧':
          case '∨':
            {
              var sub1 = this.sub.sub1.negate().normalize();
              var sub2 = this.sub.sub2.negate().normalize();
              var newOp = op2 == '∧' ? '∨' : '∧';
              return new BinaryFormula(newOp, sub1, sub2);
            }
          case '→':
            {
              var sub1 = this.sub.sub1.normalize();
              var sub2 = this.sub.sub2.negate().normalize();
              return new BinaryFormula('∧', sub1, sub2);
            }
          case '↔':
            {
              var sub1 = new BinaryFormula('∧', this.sub.sub1, this.sub.sub2.negate()).normalize();
              var sub2 = new BinaryFormula('∧', this.sub.sub1.negate(), this.sub.sub2).normalize();
              return new BinaryFormula('∨', sub1, sub2);
            }
          case '∀':
          case '∃':
            {
              var sub = this.sub.matrix.negate().normalize();
              return new QuantifiedFormula(op2 == '∀' ? '∃' : '∀', this.sub.variable, sub,
                this.sub.overWorlds);
            }
          case '□':
          case '◇':
            {
              var sub = this.sub.sub.negate().normalize();
              return new ModalFormula(op2 == '□' ? '◇' : '□', sub);
            }
          case '¬':
            {
              return this.sub.sub.normalize();
            }
        }
      }
  }
}
Formula.prototype.removeQuantifiers = function() {
  if (this.matrix) return this.matrix.removeQuantifiers();
  if (this.sub1) {
    var nsub1 = this.sub1.quantifier ?
      this.sub1.matrix.removeQuantifiers() : this.sub1.removeQuantifiers();
    var nsub2 = this.sub2.quantifier ?
      this.sub2.matrix.removeQuantifiers() : this.sub2.removeQuantifiers();
    if (this.sub1 == nsub1 && this.sub2 == nsub2) return this;
    var res = new BinaryFormula(this.operator, nsub1, nsub2);
    return res;
  }
  return this;
}
Formula.prototype.alpha = function(n) {
  var f = this;
  if (f.operator == '∧') {
    return n == 1 ? f.sub1 : f.sub2;
  }
  if (f.sub.operator == '∨') {
    return n == 1 ? f.sub.sub1.negate() : f.sub.sub2.negate();
  }
  if (f.sub.operator == '→') {
    return n == 1 ? f.sub.sub1 : f.sub.sub2.negate();
  }
}
Formula.prototype.beta = function(n) {
  var f = this;
  if (f.operator == '∨') {
    return n == 1 ? f.sub1 : f.sub2;
  }
  if (f.operator == '→') {
    return n == 1 ? f.sub1.negate() : f.sub2;
  }
  if (f.operator == '↔') {
    return n == 1 ? new BinaryFormula('∧', f.sub1, f.sub2) :
      new BinaryFormula('∧', f.sub1.negate(), f.sub2.negate())
  }
  if (f.sub.operator == '∧') {
    return n == 1 ? f.sub.sub1.negate() : f.sub.sub2.negate();
  }
  if (f.sub.operator == '↔') {
    return n == 1 ? new BinaryFormula('∧', f.sub.sub1, f.sub.sub2.negate()) :
      new BinaryFormula('∧', f.sub.sub1.negate(), f.sub.sub2)
  }
}

function AtomicFormula(predicate, terms) {
  this.type = 'literal';
  this.predicate = predicate;
  this.terms = terms;
  this.string = predicate + AtomicFormula.terms2string(terms);
}
AtomicFormula.terms2string = function(list) {
  var res = '';
  for (var i = 0; i < list.length; i++) {
    if (list[i].isArray) {
      var sublist = list[i].copy();
      var funcsym = sublist.shift();
      res += funcsym + '(' + AtomicFormula.terms2string(sublist) + ')';
    } else res += list[i];
  }
  return res;
}
AtomicFormula.prototype = Object.create(Formula.prototype);
AtomicFormula.prototype.substitute = function(origTerm, newTerm, shallow) {
  if (typeof(origTerm) == 'string' && this.string.indexOf(origTerm) == -1) {
    return this;
  }
  var newTerms = AtomicFormula.substituteInTerms(this.terms, origTerm, newTerm, shallow);
  if (!this.terms.equals(newTerms)) {
    return new AtomicFormula(this.predicate, newTerms);
  } else return this;
}
AtomicFormula.substituteInTerms = function(terms, origTerm, newTerm, shallow) {
  var newTerms = [];
  for (var i = 0; i < terms.length; i++) {
    var term = terms[i];
    if (term.toString() == origTerm.toString()) newTerms.push(newTerm);
    else if (term.isArray && !shallow) {
      newTerms.push(AtomicFormula.substituteInTerms(term, origTerm, newTerm));
    } else newTerms.push(term);
  }
  return newTerms;
}
AtomicFormula.substituteInTerm = function(term, origTerm, newTerm) {
  if (term == origTerm) return newTerm;
  if (term.isArray) return AtomicFormula.substituteInTerms(term, origTerm, newTerm);
  return term;
}

function QuantifiedFormula(quantifier, variable, matrix, overWorlds) {
  this.quantifier = quantifier;
  this.variable = variable;
  this.matrix = matrix;
  this.overWorlds = overWorlds;
  if (overWorlds) {
    this.type = quantifier == '∀' ? 'modalGamma' : 'modalDelta';
  } else {
    this.type = quantifier == '∀' ? 'gamma' : 'delta';
  }
  this.string = quantifier + variable + matrix;
}
QuantifiedFormula.prototype = Object.create(Formula.prototype);
QuantifiedFormula.prototype.substitute = function(origTerm, newTerm, shallow) {
  if (this.variable == origTerm) return this;
  var nmatrix = this.matrix.substitute(origTerm, newTerm, shallow);
  if (nmatrix == this.matrix) return this;
  return new QuantifiedFormula(this.quantifier, this.variable, nmatrix, this.overWorlds);
}

function BinaryFormula(operator, sub1, sub2) {
  this.operator = operator;
  this.sub1 = sub1;
  this.sub2 = sub2;
  this.type = operator == '∧' ? 'alpha' : 'beta';
  this.string = '(' + sub1 + operator + sub2 + ')';
}
BinaryFormula.prototype = Object.create(Formula.prototype);
BinaryFormula.prototype.substitute = function(origTerm, newTerm, shallow) {
  var nsub1 = this.sub1.substitute(origTerm, newTerm, shallow);
  var nsub2 = this.sub2.substitute(origTerm, newTerm, shallow);
  if (this.sub1 == nsub1 && this.sub2 == nsub2) return this;
  return new BinaryFormula(this.operator, nsub1, nsub2);
}

function ModalFormula(operator, sub) {
  this.operator = operator;
  this.sub = sub;
  this.type = operator == '□' ? 'modalGamma' : 'modalDelta';
  this.string = operator + sub;
}
ModalFormula.prototype = Object.create(Formula.prototype);
ModalFormula.prototype.substitute = function(origTerm, newTerm, shallow) {
  var nsub = this.sub.substitute(origTerm, newTerm, shallow);
  if (this.sub == nsub) return this;
  return new ModalFormula(this.operator, nsub);
}

function NegatedFormula(sub) {
  this.operator = '¬';
  this.sub = sub;
  this.type = NegatedFormula.computeType(sub);
  this.string = '¬' + sub;
}
NegatedFormula.computeType = function(sub) {
  if (sub.operator == '¬') return 'doublenegation';
  switch (sub.type) {
    case 'literal':
      {
        return 'literal';
      }
    case 'alpha':
      {
        return 'beta';
      }
    case 'beta':
      {
        return sub.operator == '↔' ? 'beta' : 'alpha';
      }
    case 'gamma':
      {
        return 'delta';
      }
    case 'delta':
      {
        return 'gamma';
      }
    case 'modalGamma':
      {
        return 'modalBeta';
      }
    case 'modalDelta':
      {
        return 'modalGamma';
      }
  }
}
NegatedFormula.prototype = Object.create(Formula.prototype);
NegatedFormula.prototype.substitute = function(origTerm, newTerm, shallow) {
  var nsub = this.sub.substitute(origTerm, newTerm, shallow);
  if (this.sub == nsub) return this;
  return new NegatedFormula(nsub);
}

function Parser() {
  this.symbols = [];
  this.expressionType = {};
  this.arities = {};
  this.isModal = false;
  this.isPropositional = true;
}
Parser.prototype.copy = function() {
  var nparser = new Parser(true);
  nparser.symbols = this.symbols.copy();
  for (var i = 0; i < this.symbols.length; i++) {
    var sym = this.symbols[i];
    nparser.expressionType[sym] = this.expressionType[sym];
    nparser.arities[sym] = this.arities[sym];
  }
  nparser.isModal = this.isModal;
  nparser.isPropositional = this.isPropositional;
  nparser.R = this.R;
  nparser.w = this.w;
  return nparser;
}
Parser.prototype.registerExpression = function(ex, exType, arity) {
  if (!this.expressionType[ex]) this.symbols.push(ex);
  else if (this.expressionType[ex] != exType) {
    throw "don't use '" + ex + "' as both " + this.expressionType[ex] + " and " + exType;
  }
  this.expressionType[ex] = exType;
  this.arities[ex] = arity;
}
Parser.prototype.getSymbols = function(expressionType) {
  var res = [];
  for (var i = 0; i < this.symbols.length; i++) {
    var s = this.symbols[i];
    if (this.expressionType[s].indexOf(expressionType) > -1) res.push(s);
  }
  return res;
}
Parser.prototype.getNewSymbol = function(candidates, expressionType, arity) {
  var candidates = candidates.split('');
  for (var i = 0; i < candidates.length; i++) {
    var sym = candidates[i];
    if (!this.expressionType[sym]) {
      this.registerExpression(sym, expressionType, arity);
      return sym;
    }
    candidates.push(candidates[0] + (i + 2));
  }
}
Parser.prototype.getNewConstant = function() {
  return this.getNewSymbol('abcdefghijklmno', 'individual constant', 0);
}
Parser.prototype.getNewVariable = function() {
  return this.getNewSymbol('xyzwvutsr', 'variable', 0);
}
Parser.prototype.getNewFunctionSymbol = function(arity) {
  return this.getNewSymbol('fghijklmn', arity + "-ary function symbol", arity);
}
Parser.prototype.getNewWorldVariable = function() {
  return this.getNewSymbol('wvutsr', 'world variable', 0);
}
Parser.prototype.getNewWorldName = function() {
  return this.getNewSymbol('vutsr', 'world constant', 0);
}
Parser.prototype.getVariables = function(formula) {
  if (formula.sub) {
    return this.getVariables(formula.sub);
  }
  if (formula.sub1) {
    return this.getVariables(formula.sub1).concatNoDuplicates(
      this.getVariables(formula.sub2));
  }
  var res = [];
  var dupe = {};
  var terms = formula.isArray ? formula : formula.terms;
  for (var i = 0; i < terms.length; i++) {
    if (terms[i].isArray) {
      res = res.concatNoDuplicates(this.getVariables(terms[i]));
    } else if (this.expressionType[terms[i]].indexOf('variable') > -1 &&
      !dupe[terms[i]]) {
      dupe[terms[i]] = true;
      res.push(terms[i]);
    }
  }
  return res;
}
Parser.prototype.isTseitinLiteral = function(formula) {
  return this.expressionType[formula.predicate || formula.sub.predicate] == 'tseitin predicate';
}
Parser.prototype.initModality = function() {
  for (var i = 0; i < this.symbols.length; i++) {
    var sym = this.symbols[i];
    if (this.expressionType[sym].indexOf('predicate') > -1) {
      this.arities[sym] += 1;
    }
  }
  this.R = this.getNewSymbol('Rrℜ', '2-ary predicate', 2);
  this.w = this.getNewSymbol('wvur', 'world constant', 0);
}
Parser.prototype.translateFromModal = function(formula, worldVariable) {
  if (!worldVariable) {
    if (!this.w) this.initModality();
    worldVariable = this.w;
  }
  if (formula.terms) {
    var nterms = formula.terms.copyDeep();
    nterms.push(worldVariable);
    return new AtomicFormula(formula.predicate, nterms);
  }
  if (formula.quantifier) {
    var nmatrix = this.translateFromModal(formula.matrix, worldVariable);
    return new QuantifiedFormula(formula.quantifier, formula.variable, nmatrix);
  }
  if (formula.sub1) {
    var nsub1 = this.translateFromModal(formula.sub1, worldVariable);
    var nsub2 = this.translateFromModal(formula.sub2, worldVariable);
    return new BinaryFormula(formula.operator, nsub1, nsub2);
  }
  if (formula.operator == '¬') {
    var nsub = this.translateFromModal(formula.sub, worldVariable);
    return new NegatedFormula(nsub);
  }
  if (formula.operator == '□') {
    var newWorldVariable = this.getNewWorldVariable();
    var wRv = new AtomicFormula(this.R, [worldVariable, newWorldVariable])
    var nsub = this.translateFromModal(formula.sub, newWorldVariable);
    var nmatrix = new BinaryFormula('→', wRv, nsub);
    return new QuantifiedFormula('∀', newWorldVariable, nmatrix, true);
  }
  if (formula.operator == '◇') {
    var newWorldVariable = this.getNewWorldVariable();
    var wRv = new AtomicFormula(this.R, [worldVariable, newWorldVariable])
    var nsub = this.translateFromModal(formula.sub, newWorldVariable);
    var nmatrix = new BinaryFormula('∧', wRv, nsub);
    return new QuantifiedFormula('∃', newWorldVariable, nmatrix, true)
  }
}
Parser.prototype.stripAccessibilityClauses = function(formula) {
  if (formula.quantifier) {
    var nmatrix = this.stripAccessibilityClauses(formula.matrix);
    if (nmatrix == formula.matrix) return formula;
    return new QuantifiedFormula(formula.quantifier, formula.variable, nmatrix);
  }
  if (formula.sub1) {
    if ((formula.sub1.sub && formula.sub1.sub.predicate == this.R) ||
      (formula.sub1.predicate == this.R)) {
      return this.stripAccessibilityClauses(formula.sub2);
    }
    var nsub1 = this.stripAccessibilityClauses(formula.sub1);
    var nsub2 = this.stripAccessibilityClauses(formula.sub2);
    if (formula.sub1 == nsub1 && formula.sub2 == nsub2) return formula;
    return new BinaryFormula(formula.operator, nsub1, nsub2);
  }
  if (formula.operator == '¬') {
    return formula;
  } else {
    return formula;
  }
}
Parser.prototype.translateToModal = function(formula) {
  if (formula.terms && formula.predicate == this.R) {
    return formula;
  }
  if (formula.terms) {
    var nterms = formula.terms.copyDeep();
    var worldlabel = nterms.pop();
    var res = new AtomicFormula(formula.predicate, nterms);
    res.world = worldlabel;
  } else if (formula.quantifier && this.expressionType[formula.variable] == 'world variable') {
    var prejacent = formula.matrix.sub2;
    var op = formula.quantifier == '∃' ? '◇' : '□';
    var res = new ModalFormula(op, this.translateToModal(prejacent));
    res.world = formula.matrix.sub1.terms[0];
  } else if (formula.quantifier) {
    var nmatrix = this.translateToModal(formula.matrix);
    var res = new QuantifiedFormula(formula.quantifier, formula.variable, nmatrix);
    res.world = nmatrix.world;
  } else if (formula.sub1) {
    var nsub1 = this.translateToModal(formula.sub1);
    var nsub2 = this.translateToModal(formula.sub2);
    var res = new BinaryFormula(formula.operator, nsub1, nsub2);
    res.world = nsub2.world;
  } else if (formula.operator == '¬') {
    var nsub = this.translateToModal(formula.sub);
    var res = new NegatedFormula(nsub);
    res.world = nsub.world;
  }
  return res;
}
Parser.prototype.parseInput = function(str) {
  var parts = str.split('|=');
  if (parts.length > 2) {
    throw "You can't use more than one turnstile";
  }
  var premises = [];
  var conclusion = this.parseFormula(parts[parts.length - 1]);
  if (conclusion.isArray)
    throw parts[parts.length - 1] + " looks like a list; use either conjunction or disjunction instead of the comma";
  if (parts.length == 2 && parts[0] != '') {
    premises = this.parseFormula(parts[0]);
    if (!premises.isArray) premises = [premises];
  }
  return [premises, conclusion];
}
Parser.prototype.hideSubStringsInParens = function(str) {
  var subStringsInParens = [];
  var parenDepth = 0;
  var storingAtIndex = -1;
  var nstr = "";
  for (var i = 0; i < str.length; i++) {
    if (str.charAt(i) == "(") {
      parenDepth++;
      if (parenDepth == 1) {
        storingAtIndex = subStringsInParens.length;
        subStringsInParens[storingAtIndex] = "";
        nstr += "%" + storingAtIndex;
      }
    }
    if (storingAtIndex == -1) nstr += str.charAt(i);
    else subStringsInParens[storingAtIndex] += str.charAt(i);
    if (str.charAt(i) == ")") {
      parenDepth--;
      if (parenDepth == 0) storingAtIndex = -1;
    }
  }
  return [nstr, subStringsInParens];
}
Parser.prototype.parseFormula = function(str) {
  var boundVars = arguments[1] ? arguments[1].slice() : [];
  if (!arguments[1]) str = this.tidyFormula(str);
  var temp = this.hideSubStringsInParens(str);
  var nstr = temp[0];
  var subStringsInParens = temp[1];
  if (nstr == '%0') {
    return this.parseFormula(str.replace(/^\((.*)\)$/, "$1"), arguments[1]);
  }
  var reTest = nstr.match(/,/) || nstr.match(/↔/) || nstr.match(/→/) || nstr.match(/∨/) || nstr.match(/∧/);
  if (reTest) {
    var op = reTest[0];
    if (op == ',') nstr = nstr.replace(/,/g, '%split');
    else nstr = nstr.replace(op, "%split");
    for (var i = 0; i < subStringsInParens.length; i++) {
      nstr = nstr.replace("%" + i, subStringsInParens[i]);
    }
    var substrings = nstr.split("%split");
    if (!substrings[1]) {
      throw "argument missing for operator " + op + " in " + str;
    }
    var subFormulas = [];
    for (var i = 0; i < substrings.length; i++) {
      subFormulas.push(this.parseFormula(substrings[i], boundVars));
    }
    if (op == ',') {
      if (arguments[1]) {
        throw "I don't understand '" + str + "' (looks like a list of formulas)";
      }
      return subFormulas;
    }
    return new BinaryFormula(op, subFormulas[0], subFormulas[1]);
  }
  var reTest = nstr.match(/^(¬|□|◇)/);
  if (reTest) {
    var op = reTest[1];
    var sub = this.parseFormula(str.substr(1), boundVars);
    if (op == '¬') return new NegatedFormula(sub);
    this.isModal = true;
    return new ModalFormula(op, sub);
  }
  reTest = /^(∀|∃)([^\d\(\),%]\d*)/.exec(str);
  if (reTest && reTest.index == 0) {
    var quantifier = reTest[1];
    var variable = reTest[2];
    if (!str.substr(reTest[0].length)) {
      throw "There is nothing in the scope of " + str;
    }
    if (this.expressionType[variable] != 'world variable') {
      this.registerExpression(variable, 'variable', 0);
    }
    boundVars.push(variable);
    this.isPropositional = false;
    var sub = this.parseFormula(str.substr(reTest[0].length), boundVars);
    return new QuantifiedFormula(quantifier, variable, sub);
  }
  reTest = /^[^\d\(\),%]\d*/.exec(str);
  if (reTest && reTest.index == 0) {
    var predicate = reTest[0];
    var termstr = str.substr(predicate.length);
    var terms = this.parseTerms(termstr, boundVars) || [];
    if (termstr) {
      var predicateType = terms.length + "-ary predicate";
      if (predicate != this.R) this.isPropositional = false;
    } else {
      var predicateType = "proposition letter (0-ary predicate)";
    }
    this.registerExpression(predicate, predicateType, terms.length);
    return new AtomicFormula(predicate, terms);
  }
  throw "Parse Error.\n'" + str + "' is not a well-formed formula.";
}
Parser.prototype.tidyFormula = function(str) {
  str = str.replace(/\s/g, '');
  str = str.replace('[', '(').replace(']', ')');
  this.checkBalancedParentheses(str);
  str = str.replace(/\(([∀∃]\w\d*)\)/g, '$1');
  return str;
}
Parser.prototype.checkBalancedParentheses = function(str) {
  var openings = str.split('(').length - 1;
  var closings = str.split(')').length - 1;
  if (openings != closings) {
    throw "unbalanced parentheses: " + openings + " opening parentheses, " + closings + " closing";
  }
}
Parser.prototype.parseAccessibilityFormula = function(str) {
  str = str.replace(/R/g, this.R);
  var matches = str.match(/[∀∃]./g);
  for (var i = 0; i < matches.length; i++) {
    var v = matches[i][1];
    if (this.expressionType[v] && this.expressionType[v] != 'world variable') {
      var re = new RegExp(v, 'g');
      str = str.replace(re, this.getNewWorldVariable());
    } else {
      this.registerExpression(v, 'world variable', 0);
    }
  }
  var isPropositional = this.isPropositional;
  var formula = this.parseFormula(str);
  this.isPropositional = isPropositional;
  return formula;
}
Parser.prototype.parseTerms = function(str, boundVars) {
    if (!str) return [];
    var result = [];
    str = str.replace(/^\((.+)\)$/, "$1");
    do {
      var reTest = /[^\(\),%]\d*/.exec(str);
      if (!reTest || reTest.index != 0) {
        throw "I expected a (sequence of) term(s) instead of '" + str + "'";
      }
      var nextTerm = reTest[0];
      str = str.substr(reTest[0].length);
      if (str.indexOf("(") == 0) {
        var args = "",
          openParens = 0,
          spos = 0;
        do {
          args += str.charAt(spos);
          if (str.charAt(spos) == "(") openParens++;
          else if (str.charAt(spos) == ")") openParens--;
          spos++;
        } while (openParens && spos < str.length);
        nextTerm = [nextTerm].concat(this.parseTerms(args, boundVars));
        var arity = (nextTerm.length - 1);
        this.registerExpression(reTest[0], arity + "-ary function symbol", arity);
        str = str.substr(args.length);
      } else if (!boundVars.includes(nextTerm)) {
        this.registerExpression(nextTerm, 'individual constant', 0);
      }
      result.push(nextTerm);
      if (str.indexOf(",") == 0) str = str.substr(1);
    } while (str.length > 0);
    return result;
  }
  //

function ModelFinder(initFormulas, parser, accessibilityConstraints, s5) {
  this.parser = parser;
  this.s5 = s5;
  if (s5) {
    accessibilityConstraints = [];
    initFormulas = initFormulas.map(function(f) {
      return parser.stripAccessibilityClauses(f);
    });
  }
  this.predicates = parser.getSymbols('predicate');
  if (s5) this.predicates.remove(parser.R);
  this.constants = parser.getSymbols('individual constant');
  this.funcSymbols = parser.getSymbols('function symbol');
  if (parser.isModal) {
    this.constants.unshift(parser.w);
  }
  initFormulas = initFormulas.concat(accessibilityConstraints || []);
  this.clauses = this.getClauses(initFormulas);
  var numIndividuals = 1;
  var numWorlds = this.parser.isModal ? 1 : 0;
  this.model = new Model(this, numIndividuals, numWorlds);
  this.alternativeModels = [];
}
ModelFinder.prototype.getClauses = function(formulas) {
  var res = [];
  for (var i = 0; i < formulas.length; i++) {
    var formula = formulas[i];
    var distinctVars = this.makeVariablesDistinct(formula);
    var skolemized = this.skolemize(distinctVars);
    var quantifiersRemoved = skolemized.removeQuantifiers();
    var clauses = this.tseitinCNF(quantifiersRemoved);
    res = res.concatNoDuplicates(clauses);
  }
  res.sort(function(a, b) {
    return a.length - b.length;
  });
  res = this.simplifyClauses(res);
  return res;
}
ModelFinder.prototype.makeVariablesDistinct = function(formula) {
  var usedVariables = arguments[1] || [];
  var parser = this.parser;
  if (formula.matrix) {
    var nmatrix = formula.matrix;
    var nvar = formula.variable;
    if (usedVariables.includes(formula.variable)) {
      nvar = parser.expressionType[nvar] == 'world variable' ?
        parser.getNewWorldVariable() : parser.getNewVariable();
      nmatrix = nmatrix.substitute(formula.variable, nvar);
    }
    usedVariables.push(nvar);
    nmatrix = this.makeVariablesDistinct(nmatrix, usedVariables);
    if (nmatrix == formula.matrix) return formula;
    return new QuantifiedFormula(formula.quantifier, nvar, nmatrix, formula.overWorlds);
  }
  if (formula.sub1) {
    var nsub1 = this.makeVariablesDistinct(formula.sub1, usedVariables);
    var nsub2 = this.makeVariablesDistinct(formula.sub2, usedVariables);
    if (formula.sub1 == nsub1 && formula.sub2 == nsub2) return formula;
    return new BinaryFormula(formula.operator, nsub1, nsub2);
  }
  return formula;
}
ModelFinder.prototype.skolemize = function(formula) {
  var boundVars = arguments[1] ? arguments[1].copy() : [];
  var parser = this.parser;
  if (formula.quantifier == '∃') {
    var skolemVars = [];
    boundVars.forEach(function(v) {
      if (formula.matrix.string.indexOf(v) > -1) skolemVars.push(v);
    });
    var skolemTerm;
    if (skolemVars.length > 0) {
      var funcSymbol = parser.getNewFunctionSymbol(skolemVars.length);
      var skolemTerm = skolemVars;
      skolemTerm.unshift(funcSymbol);
    } else skolemTerm = parser.expressionType[formula.variable] == 'variable' ?
      parser.getNewConstant() : parser.getNewWorldName();
    var nmatrix = formula.matrix.substitute(formula.variable, skolemTerm);
    nmatrix = this.skolemize(nmatrix, boundVars);
    return nmatrix;
  }
  if (formula.quantifier) {
    boundVars.push(formula.variable);
    var nmatrix = this.skolemize(formula.matrix, boundVars);
    if (nmatrix == formula.matrix) return formula;
    return new QuantifiedFormula(formula.quantifier, formula.variable, nmatrix,
      formula.overWorlds);
  }
  if (formula.sub1) {
    var nsub1 = this.skolemize(formula.sub1, boundVars);
    var nsub2 = this.skolemize(formula.sub2, boundVars);
    if (formula.sub1 == nsub1 && formula.sub2 == nsub2) return formula;
    return new BinaryFormula(formula.operator, nsub1, nsub2);
  }
  return formula;
}
ModelFinder.prototype.tseitinCNF = function(formula) {
  if (formula.type == 'literal') {
    return [
      [formula]
    ];
  }
  var subformulas = this.tseitinSubFormulas([formula]).removeDuplicates();
  subformulas.sort(function(a, b) {
    return tseitinComplexity(a) - tseitinComplexity(b);
  });
  if (!this.tseitsinFormulas) {
    this.tseitsinFormulas = {};
  }
  clauses = [];
  while (subformulas.length) {
    var subf = subformulas.shift();
    var p = this.tseitsinFormulas[subf.string];
    if (!p) {
      var vars = this.parser.getVariables(subf);
      var pSym = this.parser.getNewSymbol('$', 'tseitin predicate', vars.length);
      p = new AtomicFormula(pSym, vars);
      this.tseitsinFormulas[subf.string] = p;
      var bicond = new BinaryFormula('↔', p, subf);
      clauses = clauses.concatNoDuplicates(this.cnf(bicond));
    }
    if (subformulas.length == 0) {
      clauses = clauses.concatNoDuplicates([
        [p]
      ]);
    }
    for (var i = 0; i < subformulas.length; i++) {
      subformulas[i] = this.tseitinReplace(subformulas[i], subf, p);
    }
  }
  clauses.sort(function(a, b) {
    return a.length - b.length;
  });
  return clauses;

  function tseitinComplexity(formula) {
    if (formula.sub) {
      return 1 + tseitinComplexity(formula.sub);
    }
    if (formula.sub1) {
      return 1 + Math.max(tseitinComplexity(formula.sub1),
        tseitinComplexity(formula.sub2));
    }
    return 0;
  }
}
ModelFinder.prototype.tseitinSubFormulas = function(formulas) {
  var res = []
  for (var i = 0; i < formulas.length; i++) {
    if (formulas[i].type != 'literal') {
      var subformulas = formulas[i].sub ? [formulas[i].sub] :
        formulas[i].sub1 ? [formulas[i].sub1, formulas[i].sub2] : null;
      res = res.concat(this.tseitinSubFormulas(subformulas));
      res.unshift(formulas[i]);
    }
  }
  return res;
}
ModelFinder.prototype.tseitinReplace = function(formula, f1, f2) {
  if (formula.equals(f1)) return f2;
  if (formula.sub) {
    var nsub = this.tseitinReplace(formula.sub, f1, f2);
    if (nsub == formula.sub) return formula;
    return new NegatedFormula(nsub);
  }
  if (formula.sub1) {
    var nsub1 = this.tseitinReplace(formula.sub1, f1, f2);
    var nsub2 = this.tseitinReplace(formula.sub2, f1, f2);
    if (formula.sub1 == nsub1 && formula.sub2 == nsub2) return formula;
    return new BinaryFormula(formula.operator, nsub1, nsub2);
  }
  return formula;
}
ModelFinder.prototype.cnf = function(formula) {
  if (formula.type == 'literal') {
    return [
      [formula]
    ];
  }
  var con, dis;
  switch (formula.operator) {
    case '∧':
      {
        con = [this.cnf(formula.sub1), this.cnf(formula.sub2)];
        break;
      }
    case '∨':
      {
        dis = [this.cnf(formula.sub1), this.cnf(formula.sub2)];
        break;
      }
    case '→':
      {
        dis = [this.cnf(formula.sub1.negate()), this.cnf(formula.sub2)];
        break;
      }
    case '↔':
      {
        con1 = this.cnf(new BinaryFormula('→', formula.sub1, formula.sub2));
        con2 = this.cnf(new BinaryFormula('→', formula.sub2, formula.sub1));
        con = [con1, con2];
        break;
      }
    case '¬':
      {
        var sub = formula.sub;
        switch (sub.operator) {
          case '∧':
            {
              dis = [this.cnf(sub.sub1.negate()), this.cnf(sub.sub2.negate())];
              break;
            }
          case '∨':
            {
              con = [this.cnf(sub.sub1.negate()), this.cnf(sub.sub2.negate())];
              break;
            }
          case '→':
            {
              con = [this.cnf(sub.sub1), this.cnf(sub.sub2.negate())];
              break;
            }
          case '↔':
            {
              con1 = this.cnf(new BinaryFormula('∨', sub.sub1, sub.sub2));
              con2 = this.cnf(new BinaryFormula('∨', sub.sub1.negate(), sub.sub2.negate()));
              con = [con1, con2];
              break;
            }
          case '¬':
            {
              return this.cnf(sub.sub);
            }
        }
      }
  }
  var res = [];
  if (con) {
    res = con[0].concatNoDuplicates(con[1]);
  } else if (dis) {
    for (var i = 0; i < dis[0].length; i++) {
      for (var j = 0; j < dis[1].length; j++) {
        res.push(dis[0][i].concatNoDuplicates(dis[1][j]).sort());
      }
    }
  }
  res.sort(function(a, b) {
    return a.length - b.length
  });
  return res;
}
ModelFinder.prototype.simplifyClauses = function(clauseList) {
  var nl = clauseList.filter(function(clause) {
    for (var i = 0; i < clause.length; i++) {
      for (var j = i + 1; j < clause.length; j++) {
        if (clause[i].sub && clause[i].sub.string == clause[j].string ||
          clause[j].sub && clause[j].sub.string == clause[i].string) {
          return false;
        }
      }
    }
    return true;
  });
  nl2 = nl.copy();
  var literals2clauses = {};
  for (var i = 0; i < nl.length; i++) {
    for (var k = 0; k < nl[i].length; k++) {
      var lit = nl[i][k].string;
      if (!literals2clauses[lit]) literals2clauses[lit] = [nl[i]];
      else literals2clauses[lit].push(nl[i]);
    }
  }
  for (var i = 0; i < nl.length; i++) {
    var clause = nl[i];
    var lit = clause[0].string;
    var supersets = literals2clauses[lit];
    for (var k = 1; k < clause.length && supersets.length; k++) {
      lit = clause[k].string;
      supersets.intersect(literals2clauses[lit]);
    }
    for (var k = 0; k < supersets.length; k++) {
      if (nl.indexOf(supersets[k]) > nl.indexOf(clause)) {
        nl2.remove(supersets[k]);
      }
    }
  }
  return nl2;
}
ModelFinder.prototype.nextStep = function() {
  if (this.model.clauses.length == 0) {
    return true;
  }
  var literal = this.model.clauses[0][0];
  if (!literal) {
    this.backtrack();
    return false;
  }
  while (this.model.clauses[0].length == 1 && literal.string.indexOf('$') > -1) {
    this.model.unitResolve(literal);
    return false;
  }
  if (!this.model.termValues) {
    this.model.initTermValues(literal);
  } else {
    if (!this.model.iterateTermValues()) {
      this.model.clauses[0].shift();
      this.model.termValues = null;
      return false;
    }
  }
  while (true) {
    var atom = literal.sub || literal;
    var nterms = this.model.reduceTerms(atom.terms);
    var redAtom = atom.predicate + nterms.toString();
    if (this.model.curInt[redAtom] === (atom != literal)) {
      if (!this.model.iterateTermValues()) {
        this.model.clauses[0].shift();
        this.model.termValues = null;
        return false;
      }
    } else {
      this.alternativeModels.push(this.model.copy());
      if (this.model.curInt[redAtom] === undefined) {
        this.model.curInt[redAtom] = (atom == literal);
      }
      this.model.interpretation = this.model.curInt;
      this.model.termValues = null;
      this.model.clauses.shift();
      this.model.simplifyRemainingClauses();
      return false;
    }
  }
}
ModelFinder.prototype.backtrack = function() {
  if (this.alternativeModels.length == 0) {
    var numWorlds = this.model.worlds.length;
    var numIndividuals = this.model.domain.length;
    if (numWorlds && this.parser.isPropositional) {
      numWorlds++;
    } else {
      if (numWorlds && numWorlds < this.model.domain.length) {
        numWorlds++;
      } else numIndividuals++;
    }
    this.model = new Model(this, numIndividuals, numWorlds);
  } else {
    this.model = this.alternativeModels.pop();
    this.model.curInt = {};
    for (var p in this.model.interpretation) {
      this.model.curInt[p] = this.model.interpretation[p];
    }
    var tvs = this.model.termValues;
    for (var i = 0; i < tvs.length; i++) {
      var redTerm = this.model.reduceArguments(tvs[i][0]).toString();
      if (tvs[i][3] !== null) {
        this.model.curInt[redTerm] = tvs[i][3];
      }
    }
  }
}

function Model(modelfinder, numIndividuals, numWorlds) {
  if (!modelfinder) {
    return;
  }
  this.modelfinder = modelfinder;
  this.parser = modelfinder.parser;
  this.domain = Array.getArrayOfNumbers(numIndividuals);
  this.worlds = Array.getArrayOfNumbers(numWorlds);
  this.isModal = numWorlds > 0;
  this.interpretation = {};
  this.clauses = this.getDomainClauses();
  this.termValues = null;
  this.curInt = {};
}
Model.prototype.getDomainClauses = function() {
  res = [];
  for (var c = 0; c < this.modelfinder.clauses.length; c++) {
    var clause = this.modelfinder.clauses[c];
    var variables = [];
    for (var i = 0; i < clause.length; i++) {
      variables = variables.concatNoDuplicates(this.parser.getVariables(clause[i]));
    }
    if (variables.length == 0) {
      res.push(clause.copy());
      continue;
    }
    var interpretations = this.getVariableAssignments(variables);
    for (var i = 0; i < interpretations.length; i++) {
      var interpretation = interpretations[i];
      var nclause = clause.map(function(formula) {
        var nformula = formula;
        for (var i = 0; i < variables.length; i++) {
          nformula = nformula.substitute(variables[i], interpretation[i]);
        }
        return nformula;
      });
      res.push(nclause);
    }
  }
  res = this.modelfinder.simplifyClauses(res);
  return res;
}
Model.prototype.getVariableAssignments = function(variables) {
  var res = [];
  var tuple = Array.getArrayOfZeroes(variables.length);
  res.push(tuple.copy());
  var maxValues = [];
  for (var i = 0; i < variables.length; i++) {
    maxValues.push(this.parser.expressionType[variables[i]] == 'variable' ?
      this.domain.length - 1 : this.worlds.length - 1);
  }
  while (Model.iterateTuple(tuple, maxValues)) {
    res.push(tuple.copy());
  }
  return res;
}
Model.iterateTuple = function(tuple, maxValues) {
  for (var i = tuple.length - 1; i >= 0; i--) {
    if (tuple[i] < maxValues[i]) {
      tuple[i]++;
      return true;
    }
    tuple[i] = 0;
  }
  return false;
}
Model.prototype.initTermValues = function(literal) {
  var atom = literal.sub || literal;
  var termIsOld = {};
  var terms = [];
  for (var i = 0; i < atom.terms.length; i++) {
    if (typeof atom.terms[i] == 'number') continue;
    var termStr = atom.terms[i].toString();
    if (termIsOld[termStr]) continue;
    termIsOld[termStr] = true;
    var maxValue = this.getMaxValue(atom.terms[i], atom);
    terms.push([atom.terms[i], termStr, maxValue, null]);
  }
  for (var i = 0; i < terms.length; i++) {
    if (terms[i][0].isArray) {
      var maxValue = terms[i][2];
      for (var j = 1; j < terms[i][0].length; j++) {
        var subTerm = terms[i][0][j];
        if (typeof subTerm == 'number') continue;
        var termStr = subTerm.toString();
        if (termIsOld[termStr]) continue;
        termIsOld[termStr] = true;
        terms.push([subTerm, termStr, maxValue, null]);
      }
    }
  }
  terms.sort(function(a, b) {
    return a[1].length - b[1].length;
  });
  this.curInt = {};
  for (var p in this.interpretation) {
    this.curInt[p] = this.interpretation[p];
  }
  for (var i = 0; i < terms.length; i++) {
    var redTerm = this.reduceArguments(terms[i][0]).toString();
    if (!(redTerm in this.curInt)) {
      terms[i][3] = 0;
      this.curInt[redTerm] = 0;
    }
  }
  this.termValues = terms;
}
Model.prototype.getMaxValue = function(term, atom) {
  if (!this.constants) {
    this.constants = this.parser.getSymbols('individual constant');
    this.worldConstants = this.parser.getSymbols('world constant');
  }
  var maxValue = this.domain.length - 1;
  if (this.parser.isModal) {
    if (term == atom.terms[atom.terms.length - 1] || atom.predicate == this.parser.R) {
      maxValue = this.worlds.length - 1;
    }
  }
  var pos = this.constants.indexOf(term);
  if (pos == -1) pos = this.worldConstants.indexOf(term);
  if (pos > -1) return Math.min(pos, maxValue);
  return maxValue;
}
Model.prototype.reduceArguments = function(term) {
  if (term.isArray) {
    var nterm = this.reduceTerms(term, 1);
    nterm.unshift(term[0]);
    return nterm;
  }
  return term;
}
Model.prototype.reduceTerms = function(terms, startIndex) {
  var res = [];
  for (var i = (startIndex || 0); i < terms.length; i++) {
    if (typeof terms[i] == 'number') {
      res.push(terms[i]);
    } else if (terms[i].isArray) {
      var nterm = this.reduceTerms(terms[i], 1);
      nterm.unshift(terms[i][0]);
      var ntermStr = nterm.toString();
      if (ntermStr in this.curInt) {
        res.push(this.curInt[ntermStr]);
      } else {
        res.push(nterm);
      }
    } else {
      if (terms[i] in this.curInt) {
        res.push(this.curInt[terms[i]]);
      } else {
        res.push(terms[i]);
      }
    }
  }
  return res;
}
Model.prototype.iterateTermValues = function() {
  for (var i = this.termValues.length - 1; i >= 0; i--) {
    var tv = this.termValues[i];
    if (tv[3] === null || tv[3] == tv[2]) {
      continue;
    }
    tv[3]++;
    var redTerm = this.reduceArguments(tv[0]).toString();
    this.curInt[redTerm] = tv[3];
    for (var j = i + 1; j < this.termValues.length; j++) {
      var redTerm = this.reduceArguments(this.termValues[j][0]).toString();
      if (this.curInt[redTerm] === undefined) {
        this.termValues[j][3] = 0;
        this.curInt[redTerm] = 0;
      } else {
        this.termValues[j][3] = null;
      }
    }
    return true;
  }
  return false;
}
Model.prototype.satisfy = function(literal) {
  var atom = literal.sub || literal;
  this.curInt = this.interpretation;
  var nterms = this.reduceTerms(atom.terms);
  var redAtom = atom.predicate + nterms.toString();
  if (redAtom in this.curInt && thic.curInt[redAtom] != (atom == literal)) {
    return false;
  }
  this.interpretation[redAtom] = (atom == literal);
  return true;
}
Model.prototype.simplifyRemainingClauses = function() {
  var nclauses = [];
  CLAUSELOOP:
    for (var i = 0; i < this.clauses.length; i++) {
      var nclause = [];
      for (var j = 0; j < this.clauses[i].length; j++) {
        var literal = this.clauses[i][j];
        var atom = literal.sub || literal;
        var nterms = this.reduceTerms(atom.terms);
        var redAtomStr = atom.predicate + nterms.toString();
        if (redAtomStr in this.curInt) {
          if (this.curInt[redAtomStr] == (atom == literal)) {
            continue CLAUSELOOP;
          } else {
            continue;
          }
        }
        if (atom.terms.toString() != nterms.toString()) {
          var redAtom = new AtomicFormula(atom.predicate, nterms);
          var nlit = atom == literal ? redAtom : new NegatedFormula(redAtom);
          nclause.push(nlit);
        } else nclause.push(literal);
      }
      nclauses.push(nclause);
    }
  nclauses.sort(function(a, b) {
    if (a.length == 1 && b.length == 1) {
      return b[0].string.indexOf('$') - a[0].string.indexOf('$');
    }
    return a.length - b.length;
  });
  this.clauses = nclauses;
}
Model.prototype.unitResolve = function(literal) {
  var negLiteralString = (literal.sub && literal.sub.string) || '¬' + literal.string;
  var nclauses = [];
  CLAUSELOOP:
    for (var i = 1; i < this.clauses.length; i++) {
      var nclause = [];
      for (var j = 0; j < this.clauses[i].length; j++) {
        if (this.clauses[i][j].string == literal.string) {
          continue CLAUSELOOP;
        }
        if (this.clauses[i][j].string != negLiteralString) {
          nclause.push(this.clauses[i][j]);
        }
      }
      nclauses.push(nclause);
    }
  nclauses.sort(function(a, b) {
    if (a.length == 1 && b.length == 1) {
      return b[0].string.indexOf('$') - a[0].string.indexOf('$');
    }
    return a.length - b.length;
  });
  this.clauses = nclauses;
}
Model.prototype.copy = function() {
  var nmodel = new Model();
  nmodel.modelfinder = this.modelfinder;
  nmodel.parser = this.parser;
  nmodel.domain = this.domain;
  nmodel.worlds = this.worlds;
  nmodel.isModal = this.isModal;
  nmodel.interpretation = this.interpretation;
  nmodel.termValues = this.termValues;
  nmodel.clauses = this.clauses.copyDeep();
  return nmodel;
}
Model.prototype.toHTML = function() {
  var str = "<table>";
  if (this.parser.isModal) {
    function w(num) {
      return 'w<sub>' + num + '</sub>';
    }
    str += "<tr><td align='right'>Worlds: </td><td align='left'>{ ";
    str += this.worlds.map(function(n) {
      return w(n)
    }).join(", ");
    str += " }</td></tr>\n";
    if (!this.parser.isPropositional) {
      str += "<tr><td align='right'>Individuals: </td><td align='left'>{ ";
      str += this.domain.join(", ");
      str += " }</td></tr>\n";
    }
  } else if (!this.parser.isPropositional) {
    str += "<tr><td align='right'>Domain: </td><td align='left'>{ ";
    str += this.domain.join(", ");
    str += " }</td></tr>\n";
  }
  var extensions = this.getExtensions();
  for (var i = 0; i < this.modelfinder.constants.length; i++) {
    var sym = this.modelfinder.constants[i];
    var ext = extensions[sym];
    var val = sym == this.parser.w ? w(ext) : ext;
    if (sym == this.parser.w) sym = '@';
    str += "<tr><td align='right' class='formula'>" + sym + ": </td><td align='left'>" + val + "</td></tr>\n";
  }
  for (var i = 0; i < this.modelfinder.funcSymbols.length; i++) {
    var sym = this.modelfinder.funcSymbols[i];
    var ext = extensions[sym];
    if (ext.length > 0 && !ext[0].isArray) {
      var val = '{ ' + ext.join(',') + ' }';
    } else {
      var val = '{ ' + ext.map(function(tuple) {
        return '(' + tuple.join(',') + ')';
      }).join(', ') + ' }';
    }
    str += "<tr><td align='right' class='formula'>" + sym + ": </td><td align='left'>" + val + "</td></tr>\n";
  }
  var isModal = this.parser.isModal;
  var R = this.parser.R;
  for (var i = 0; i < this.modelfinder.predicates.length; i++) {
    var sym = this.modelfinder.predicates[i];
    var ext = extensions[sym];
    var val;
    if (!ext.isArray) {
      val = ext;
    } else if (ext.length > 0 && !ext[0].isArray) {
      if (isModal) ext = ext.map(function(n) {
        return w(n)
      });
      val = '{ ' + ext.join(',') + ' }';
    } else {
      val = '{ ' + ext.map(function(tuple) {
        if (isModal) {
          tuple[tuple.length - 1] = w(tuple[tuple.length - 1]);
          if (sym == R) tuple[0] = w(tuple[0]);
        }
        return '(' + tuple.join(',') + ')';
      }).join(', ') + ' }';
    }
    if (sym == R && sym != 'R') {
      sym = 'Accessibility'
    }
    str += "<tr><td align='right' class='formula'>" + sym + ": </td><td align='left'>" + val + "</td></tr>\n";
  }
  str += "</table>";
  return str;
}
Model.prototype.getExtensions = function() {
  var result = {};
  for (var i = 0; i < this.modelfinder.constants.length; i++) {
    var cons = this.modelfinder.constants[i];
    result[cons] = this.interpretation[cons] || 0;
  }
  var interpretedStrings = Object.keys(this.interpretation);
  for (var i = 0; i < this.modelfinder.funcSymbols.length; i++) {
    var f = this.modelfinder.funcSymbols[i];
    result[f] = [];
    for (var j = 0; j < interpretedStrings.length; j++) {
      var expr = interpretedStrings[j];
      if (expr.indexOf('[' + f + ',') == 0) {
        var args = expr.slice(1, -1).split(',');
        args.shift();
        var val = this.interpretation[expr];
        result[f].push(args.concat([val]));
      }
    }
  }
  for (var i = 0; i < this.modelfinder.predicates.length; i++) {
    var p = this.modelfinder.predicates[i];
    result[p] = (this.parser.arities[p] == 0) ? false : [];
    for (var j = 0; j < interpretedStrings.length; j++) {
      var expr = interpretedStrings[j];
      if (expr.indexOf(p + '[') == 0) {
        var val = this.interpretation[expr];
        var args = expr.substr(p.length).slice(1, -1).split(',');
        if (args[0] == '') {
          result[p] = val;
        } else {
          if (!val) continue;
          if (args.length == 1) {
            result[p].push(args[0]);
          } else {
            result[p].push(args);
          }
        }
      }
    }
  }
  return result;
}
Model.prototype.toString = function() {
  return this.toHTML().replace(/<.+?>/g, '');
}
Model.prototype.curIntToString = function() {
  var res = '';
  var keys = Object.keys(this.curInt);
  for (var i = 0; i < keys.length; i++) {
    res += keys[i] + ': ' + this.curInt[keys[i]] + '\n';
  }
  return res;
}

module.exports = { Parser };