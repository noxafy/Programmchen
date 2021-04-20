if __name__ == "solvers.z3wrapper": # Is there a better way?
    from logic import *
else: # SAT.solvers.z3wrapper
    from ..logic import *

z3_available = False
try:
    from z3 import *
    z3_available = True
except:
    pass

def z3available():
    return z3_available

def z3wrapper(clauses):
    def literal_conversion(literal):
        if literal[1]:
            return Bool(literal[0])
        else:
            return Not(Bool(literal[0]))

    def clause_conversion(clause):
        return Or(*[literal_conversion(literal) for literal in clause])

    solver = Solver()
    z3_formula = And(*[clause_conversion(clause) for clause in clauses])
    solver.append(z3_formula)
    result = solver.check() == sat
    if result:
        return True, solver.model()
    return False, {}