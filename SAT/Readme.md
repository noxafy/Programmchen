Copy this directory to your custom python site-packages, which you can find by executing
```
python -m site --user-site
```

Then, import in python as:
```
from SAT import solve, table

res = solve('a -> b')
print(res)

print() # newline

table('(a -> b) & (b <-> c) <-> (b & ~c)')
```

Or execute from command line from another directory:
```
python -m SAT '(a -> b) & (b <-> c) <-> (b & ~c)'
```

TODO: Improve parser performance!