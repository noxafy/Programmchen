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

    def die(mes):
        print(mes)
        exit(1)

    def toposort(net):
        """
        Run a topological sort to determine the order of the variables.
        All parents of a node has to be added before the node is added, and ties
        are broken alphabetically.

        Args:
            net dict: variable -> set(parents)
        """
        variables = list(net.keys())
        variables.sort()
        s = set()   # used to mark variables
        l = []
        while len(s) < len(variables):
            for v in variables:
                if v not in s and all(x in s for x in net[v]):
                    # add the variable `v` into the set `s` iff
                    # all parents of `v` are already in `s`.
                    s.add(v)
                    l.append(v)
        return l

    if len(argv) < 2 or (argv[1] == "--help" or argv[1] == "-h"):
        printHelpAndExit(0)

    if argv[1] == "-g":
        if len(argv) < 3 or argv[2][-3:] != ".bn":
            die('Please give a .bn file name with -g. See --help for more information.')

        fname = argv[2]
        if isfile(fname):
            die(f'%s already exists. Please remove the file or use another filename.' % fname)

        # generate net
        net = {}

        vs = argv[3:]
        for v in vs:
            v1 = v.split("|")
            node = v1[0].strip()
            parents = {}
            if node in net:
                die(f"Node \"%s\" is specified multiple times!" % node)
            if len(v1) > 1:
                parents = { p.strip() for p in v1[1].split(",") }
            net[node] = parents

        # check parent consistency
        unspecified = set()
        for n, ps in net.items():
            for p in ps:
                if p not in net:
                    unspecified.add(p)

        if unspecified:
            die(f"There are parents which are not specified as nodes! %s" % unspecified)

        # generate file
        res = ""
        for n in toposort(net):
            pa = net[n]
            if len(pa) == 0:
                res += f"P(%s = t) = 0\n" % n
            else:
                res += f"%s | %s\n" % (n, " ".join(pa))
                res += f"%s--%s-\n" % ("-" * len(n), "-" * sum([len(p) + 1 for p in pa]))
                for ps in itertools.product(["t", "f"], repeat=len(pa)):
                    res += f"%s | 0\n" % " ".join(ps)

            res += "\n"

        with open(fname, mode='a') as file:
            file.write(res)
        exit(0)


    fname = argv[1]
    if fname[-3:] != ".bn":
        die('Please give a .bn file. See --help for more information.')

    if not isfile(fname):
        die(f'%s: No such file' % fname)

    if len(argv) == 2:
        die('Not enough arguments. Please specify a query. See --help for examples.')
    q = argv[2]

    net = BN(fname)

    if len(q) > 3 and q[0].lower() == "p" and q[1] == "(" and q[-1] == ")":
        net.query(q)
    else:
        net.P(q)


if __name__ == '__main__':
    main()
