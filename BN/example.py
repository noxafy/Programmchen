from BN import BN

net = BN('test/test_example.bn')

print("Query: P(A|C=0)")
net.P("A|C=0")

print("\nQuery: P(A)")
net.P("A")

print("\nQuery: P(D)")
net.P("D")

print("\nQuery: P(A=fa,B=tr)")
net.P("A=fa,B=tr")

print("\nQuery: P(D=True|B=1, C=f)")
net.P("D=True|B=1, C=f")
