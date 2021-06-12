from sys import argv, exit
from . import solve, table, modelCnt

def main():

    if len(argv) == 1 or "-h" in argv or "--help" in argv:
        print("This is a simple sat solver. Give a formula")
        print("\t%s" % "e.g. \"(a -> b) & (b <-> c) <-> (b & ~c)\"")
        print("\t%s" % "e.g. \"r and not q or not t\"")
        print("\t%s" % "e.g. \"(~a | b) & (a -> c) & (b -> ~c) & a\"")
        exit()
    
    def arg(s):
        try:
            argv.remove(s)
            return True
        except:
            return False

    useDPLL = arg("-d")
    showTable = arg("-t") or arg("--table")
    showTableTrueOnly = arg("-tt") or arg("--table-true-only")
    showModelCnt = arg("-c") or arg("--count")

    if len(argv) > 2:
        print("Invalid arguments. See --help for more help.")
        exit(1)
    elif len(argv) == 1:
        print("Please specify a formula.")
        exit(1)

    if showTable and showModelCnt:
        print("Please specify only one output type.")
        exit(1)

    formula = argv[1]

    if showTable or showTableTrueOnly:
        table(formula, trueOnly=showTableTrueOnly)
    elif showModelCnt:
        print(modelCnt(formula))
    else:
        result, model = solve(formula, useDPLL)

        if result:
            print("Satisfiable with model")
            print(model)
        else:
            print("Unsatisfiable")

if __name__ == '__main__':
    main()
