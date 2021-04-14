/* check the source on github.com/wo/tpg */

Array.prototype.isArray = true;
Array.prototype.toString = function() {
  return "[" + this.join(",") + "]";
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

function Formula() {}
Formula.prototype.toString = function() {
  return this.string;
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

function BinaryFormula(operator, sub1, sub2) {
  this.operator = operator;
  this.sub1 = sub1;
  this.sub2 = sub2;
  this.type = operator == '∧' ? 'alpha' : 'beta';
  this.string = '(' + sub1 + operator + sub2 + ')';
}
BinaryFormula.prototype = Object.create(Formula.prototype);

function NegatedFormula(sub) {
  this.operator = '¬';
  this.sub = sub;
  this.type = NegatedFormula.computeType(sub);
  this.string = '¬' + sub;
}
NegatedFormula.computeType = function(sub) {
  if (sub.operator == '¬') return 'doublenegation';
  return 'literal';
}
NegatedFormula.prototype = Object.create(Formula.prototype);

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
  var reTest = nstr.match(/^(¬)/);
  if (reTest) {
    var op = reTest[1];
    var sub = this.parseFormula(str.substr(1), boundVars);
    return new NegatedFormula(sub);
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

module.exports = { Parser };