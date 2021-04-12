from time import time
from typing import List, Tuple
from z3 import Solver, Bool, BoolRef, And, Or, Not, sat


def literal_conversion(literal: Tuple[str, bool]) -> BoolRef:
    if literal[1]:
        return Bool(literal[0])
    else:
        return Not(Bool(literal[0]))


def clause_conversion(clause: List[Tuple[str, bool]]) -> BoolRef:
    return Or(*[literal_conversion(literal) for literal in clause])


def solve(clauses: List[List[Tuple[str, bool]]]) -> Tuple[bool, List, float]:
    z3_formula = And(*[clause_conversion(clause) for clause in clauses])
    solver = Solver()
    starting_time = time()
    solver.append(z3_formula)
    result = solver.check()
    if (result==sat):
        m = solver.model()
    else:
        m = {}
    ending_time = time()
    return result == sat, m, ending_time - starting_time
