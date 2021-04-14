from SAT import solve, table

res = solve('a -> b')
print(res)

# newline
print()

table('(a -> b) & (b <-> c) <-> (b & ~c)')
