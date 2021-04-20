def dpll(clauses):
    """
    The Davis-Putnam-Logemann-Loveland (DPLL) algorithm

    Determines if a Conjunctive Normal Form (CNF) formula is satisfiable or not;
    if the formula is satisfiable, it specifies the truth values of the
    variables.

    The CNF formula is given as a list of clauses; each clause is a list of
    literals and a literal is a propositional variable or its negation. Here,
    We represent a literal with a pair of (str, bool), where the first element
    represent the variable, and its second element represent the polarity of the
    literal.

    Parameters
    ----------
    clauses: List[List[(str, bool)]]
        The CNF formula; Literals are described by a pair of (str, bool), which
        denotes the variable and its polarity, respectively.

    Returns
    -------
    bool
        If the formula is satisfiable, it returns `True`; otherwise, it returns
        `False`. If the return value is `True`, the `valuation` dictionary has
        been updated so that it specifies all variables' truth-values.
    """
    variables = set()
    for c in clauses:
        for var, _ in c:
            if var not in variables:
                variables.add(var)

    res_valuation = _dpll({}, clauses, list(variables))
    if res_valuation is None:
        return False, {}
    return True, res_valuation

def _dpll(valuation, clauses, variables):
    """
    Parameters
    ----------
    valuation: Dict[str, bool]
        Current partial valuation of the propositional variables. It maps the
        name of variables to their assigned truth-values.
    clauses: List[List[(str, bool)]]
        The CNF formula; Literals are described by a pair of (str, bool), which
        denotes the variable and its polarity, respectively.
    variables: List[str]
        List of variables.

    Returns
    -------
    bool
        If the formula is satisfiable, it returns `True`; otherwise, it returns
        `False`. If the return value is `True`, the `valuation` dictionary has
        been updated so that it specifies all variables' truth-values.
    """
    
    if not unit(valuation, clauses, variables):
        return None # contradiction found

    # get unassigned variable
    var_max = (None, 0)
    i = 0
    while i < len(variables):
        var = variables[i]
        cnt = 0
        for c in clauses:
            cnt += c.count((var, True)) + c.count((var, False))
        if cnt == 0:
            valuation[var] = False
            del variables[i]
            i -= 1
        elif cnt > var_max[1]:
            var_max = (var, cnt)
        i += 1

    if not variables: # no unassigned variable available
        return valuation

    x = var_max[0]
    variables.remove(x)

    res_valuation = _dpll(valuation.copy(), copy_lvl2(clauses, [(x, True)]), variables.copy())
    if res_valuation is not None:
        return res_valuation

    # if x=True led to contradiction, try x=False
    return _dpll(valuation.copy(), copy_lvl2(clauses, [(x, False)]), variables.copy())

it = 0

def unit(valuation, clauses, variables):
    global it # set max iterations
    while it < 1e6:
        it += 1
        if it % 1000 == 0:
            print(it)

        unit_clauses_exist = False
        for clause in clauses:
            if len(clause) == 1:
                v, val = clause[0]
                if v in valuation and valuation[v] != val:
                    return False
                valuation[v] = val
                unit_clauses_exist = True
                if v in variables:
                    variables.remove(v)
        
        if not unit_clauses_exist:
            return True
        if not pruneClauses(valuation, clauses):
            return False # contradiction

    print("Unit propagation aborted!")

def pruneClauses(valuation, clauses):
    i = 0
    while i < len(clauses):
        clause = clauses[i]
        j = 0
        while j < len(clause):
            v, val = clause[j]
            if v in valuation:
                if val != valuation[v]:
                    if len(clause) == 1:
                        return False # contradiction
                    del clause[j]
                    j -= 1
                elif len(clause) == 1:
                # else: # often faster
                    # if it is already known, remove the clause
                    del clauses[i]
                    i -= 1
                    break
            j += 1

        i += 1

    return True

def copy_lvl2(ar, last_item):
    res = []
    for a in ar:
        res.append(a.copy())
    res.append(last_item)
    return res