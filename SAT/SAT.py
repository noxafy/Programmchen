import json
import itertools
import sys
import os

if __name__ == "SAT": # Is there a better way?
    from logic import *
    from dpll import dpll
else:
    from .logic import *
    from .dpll import dpll

z3_available = False
try:
    from z3 import *
    z3_available = True
except:
    pass

class SAT:

    def __init__(self, useDPLL=False):
        if useDPLL or not z3_available:
            self.delegate = DPLLsolve
        else:
            self.delegate = Z3solve

    def solve(self, formula):
        formula = self._parse(formula)
        return self.delegate(formula)

    def table(self, formula):
        def generateValuationDict(bitvector, variables):
            res = {}
            for b,v in zip(bitvector, variables):
                res[v] = b == 1
            return res

        original = formula
        formula = self._parse(formula)
        variables = formula.vars()
        variables = sorted(variables)
        res = "%s | %s\n" % (" ".join(variables), original)
        res += "-" * len(res) + "-\n"
        for valuation in itertools.product([0, 1], repeat=len(variables)):
            v_dict = generateValuationDict(valuation, variables)
            sat = formula.is_satisfiable(v_dict)
            res += "%s | %s\n" % (" ".join(str(v) for v in valuation), "*True" if sat else "False")
        print(res)

    def valid(self, f):
        f = "~(%s)" % f
        result, _ = self.solve(f)
        return not result

    # returns whether f1 is logical consequence of f2
    def logCon(self, f1, f2):
        f = "(%s) & ~(%s)" % (f1, f2)
        result, _ = self.solve(f)
        return not result

    def logEq(self, f1, f2):
        return self.logCon(f1, f2) and self.logCon(f2, f1)

    def _parse(self, formula):
        def getFormula(f):
            if "operator" in f:
                o = f["operator"]
                if o == "∧":
                    sub1 = getFormula(f["sub1"])
                    sub2 = getFormula(f["sub2"])
                    return AND([sub1, sub2])
                elif o == "∨":
                    sub1 = getFormula(f["sub1"])
                    sub2 = getFormula(f["sub2"])
                    return OR([sub1, sub2])
                elif o == "¬":
                    sub = getFormula(f["sub"])
                    return NOT(sub)
                elif o == "→":
                    sub1 = getFormula(f["sub1"])
                    sub2 = getFormula(f["sub2"])
                    return IMPL(sub1, sub2)
                elif o == "↔":
                    sub1 = getFormula(f["sub1"])
                    sub2 = getFormula(f["sub2"])
                    return EQVI(sub1, sub2)
            else:
                name = f["string"]
                return ATOM(name)

        path = os.path.dirname(__file__)
        parser = ["node", path + "/parser.js", formula]
        returncode, f = call(parser)
        if returncode != 0:
            raise ValueError("Did you write the formula correctly?")
        # print("node output:", f)
        f = json.loads(f)[1]
        return getFormula(f)

##############################
### convenience functions
##############################

def solve(formula, useDPLL=True):
    sat = SAT(useDPLL)
    return sat.solve(formula)

def table(formula, useDPLL=True):
    sat = SAT(useDPLL)
    sat.table(formula)

def valid(f, useDPLL=True):
    sat = SAT(useDPLL)
    return sat.valid(f)

# returns whether f1 is a logical consequence of f2
def logCon(f1, f2, useDPLL=True):
    sat = SAT(useDPLL)
    return sat.logCon(f1, f2)

def logEq(f1, f2, useDPLL=True):
    sat = SAT(useDPLL)
    return sat.logEq(f1, f2)

##############################
### helper functions
##############################

def Z3solve(formula):
    def literal_conversion(literal):
        if literal[1]:
            return Bool(literal[0])
        else:
            return Not(Bool(literal[0]))

    def clause_conversion(clause):
        return Or(*[literal_conversion(literal) for literal in clause])

    solver = Solver()
    clauses = formula.clauses()
    z3_formula = And(*[clause_conversion(clause) for clause in clauses])
    solver.append(z3_formula)
    result = solver.check() == sat
    if result:
        model = solver.model()
    else:
        model = {}
    return result, model

def DPLLsolve(formula):
    model = {}
    result = dpll(model, formula.clauses(), formula.vars())
    return result, model

def call(cmd):
    import subprocess

    sub = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if sub.stderr:
        print(sub.stderr.decode('utf-8'), file=sys.stderr)
    return sub.returncode, sub.stdout.decode('utf-8')
