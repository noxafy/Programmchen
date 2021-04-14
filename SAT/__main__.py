from sys import argv, exit
from SAT import solve

def main():

    if len(argv) == 1:
        print("This is a simple sat solver. Give a formula")
        print("\t%s" % "e.g. \"(a -> b) & (b <-> c) <-> (b & ~c)\"")
        print("\t%s" % "e.g. \"r and not q or not t\"")
        print("\t%s" % "e.g. \"(~a | b) & (a -> c) & (b -> ~c) & a\"")
        exit()

    useDPLL = False
    if argv[1] == "-d":
        useDPLL = True
        if len(argv) == 2:
            print("You forgot the formula.")
            exit(1)
        formula = argv[2]
    else:
        formula = argv[1]
    
    
    result, model = solve(formula, useDPLL)

    if result:
        print("Satisfiable with model")
        print(model)
    else:
        print("Unsatisfiable")

if __name__ == '__main__':
    main()
