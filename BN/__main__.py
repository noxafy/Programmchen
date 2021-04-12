from . import BN
from os.path import isfile
from sys import argv, exit
import itertools

def main():
    def printHelpAndExit(exit_code):
        print("Usage: python -m BN <bayesnet file> <query>")
        print("\tGive the query as conditional or marginal probability.")
        print("\te.g. python -m BN test_example.bn 'P(D|A=1,C=0)'")
        print("\te.g. python -m BN test_example.bn 'P(A=1,B=1)'")
        print("\te.g. python -m BN test_example.bn 'P(D)'")
        print("\te.g. python -m BN test_example.bn 'C' # P() can be omitted")
        print("Generating .bn files: python -m BN -g <node1|pa1> <node2|pa2>")
        print("\te.g. python -m BN -g test_example2.bn 'A' 'B|C' 'C|D,A' 'D|A'")
        exit(exit_code)

    if len(argv) < 2 or (argv[1] == "--help" or argv[1] == "-h"):
        printHelpAndExit(0)

    if argv[1] == "-g":
        if len(argv) < 3 or argv[2][-3:] != ".bn":
            print('Please give a .bn file name with -g. See --help for more information.')
            printHelpAndExit(1)

        fname = argv[2]
        if isfile(fname):
            print(f'%s already exists. Please remove the file or use another filename.' % fname)
            exit(1)
        
        # generate
        res = ""
        nodes = set()
        observed = set()

        vs = argv[3:]
        for v in vs:
            v1 = v.split("|")
            node = v1[0]
            if node in nodes:
                raise ValueError(f"Node \"%s\" is specified multiple times!" % node)
            nodes.add(node)
            if len(v1) == 1:
                res += f"P(%s) = 0\n" % node
            else:
                parents = set(v1[1].split(","))
                observed |= parents
                res += f"%s | %s\n" % (node, " ".join(parents))
                res += f"%s--%s-\n" % ("-" * len(node), "-" * sum([len(p) + 1 for p in parents]))
                for ps in itertools.product(["t", "f"], repeat=len(parents)):
                    res += f"%s | 0\n" % " ".join(ps)

            res += "\n"
        
        unspecified = observed - nodes
        if unspecified:
            raise ValueError(f"There are parents which are not specified as nodes! %s" % unspecified)
        
        with open(fname, mode='a') as file:
            file.write(res)
        exit(0)
        
    
    fname = argv[1]
    if fname[-3:] != ".bn":
        print('Please give a .bn file. See --help for more information.')
        printHelpAndExit(1)

    if not isfile(fname):
        print('%s does not exist. Please give a valid bn file.')

    if len(argv) == 2:
        print('Not enough arguments. Please specify a query. See --help for examples.')
        printHelpAndExit(1)
    q = argv[2]

    try:
        net = BN(fname)
    except Exception as e:
        print(e)
        printHelpAndExit(1)

    if len(q) > 3 and q[0].lower() == "p" and q[1] == "(" and q[-1] == ")":
        net.query(q)
    else:
        net.P(q)


if __name__ == '__main__':
    main()
