import sys
args = sys.argv

n = int(args[-1])

from random import randint
from math import gcd, log

def MillerRabinTest(n, alpha=1e-10):
    def getKM(n):
        k = 0
        while n % 2 == 0:
            k += 1
            n /= 2
        return k,int(n)

    p = 1
    while p > alpha:
        a = randint(2,n-2)
        if gcd(a,n) != 1:
            print("False")
            #print(n,"is not prime (1)")
            return
        k,m = getKM(n-1)
        b = pow(a, m, n)
        if b == 1:
            p *= 1/2
            continue
        for i in range(1,k+1):
            b_new = pow(b,2,n)
            # first appearance of b == 1 is enough
            if b_new == 1:
                break
            b = b_new
            if i == k:
                print("False")
                #print(n,"is not prime (2)")
                return
        if gcd(b+1,n) == 1 or gcd(b+1,n) == n:
            p *= 1/2
        else:
            print("False")
            #print(n,"is not prime (3)")
            return

    print("True")
    #print("%d is prime with alpha=%E (if Carmichael number: alpha=%f)" % (n, p, (3/4)**log(p,1/2)))

MillerRabinTest(n)
