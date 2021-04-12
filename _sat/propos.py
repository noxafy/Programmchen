import sys
import json
from logic import *
# from z3_wrapper import solve
from dpll import dpll
from pprint import pprint

f = json.loads(sys.argv[1])[1]

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

formula = getFormula(f)
# print(formula)
clauses = formula.clauses()

model = dict()
my_result = dpll(model, clauses, formula.vars())
# z3_result, model2, time = solve(clauses) # invalid result for "(~a | b) & (a -> c) & (b -> ~c) & a" ???
# print(model2)
# assert my_result == z3_result, (my_result, z3_result)

if my_result:
    assert formula.is_satisfiable(model)
    print("Satisfiable with model")
    pprint(model)
else:
    print("Unsatisfiable")