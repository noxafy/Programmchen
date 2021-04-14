import sys
import json
from logic import *

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

def getZ3(formula):
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

def getDPLL(formula):
    model = {}
    result = dpll(model, formula.clauses(), formula.vars())
    return result, model


useDPLL = not (sys.argv[1] == "")

if useDPLL:
    try:
        from dpll import dpll
        solver = getDPLL
    except:
        raise ImportError("DPLL solver not available!") from None
else:
    z3_available=False
    try:
        from z3 import *
        solver = getZ3
    except:
        try:
            from dpll import dpll
            solver = getDPLL
        except:
            raise ImportError("No solver available!") from None


f = json.loads(sys.argv[2])[1] # input from parser.js
formula = getFormula(f)
result, model = solver(formula)

if result:
    print("Satisfiable with model")
    print(model)
else:
    print("Unsatisfiable")
