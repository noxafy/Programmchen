import sys, os, time  # For timing use %time foo() or %timeit foo()
# import warnings; warnings.filterwarnings('ignore')

### visuals
import matplotlib.pyplot as plt
# %matplotlib qt > %matplotlib widget
# plt.style.use('ggplot') # nicer plots?
# %lsmagic

# turn off auto-sorting sets
#get_ipython().display_formatter.formatters['text/plain'].type_printers.pop(set, None)

### libs
import numpy as np

try:
    from sage.all import * # see if sage is loaded
    from utils import *
    from QuantumComputer import *
    from tqdm import tqdm as tq
except:
    from math import *
    del pow  # use builtin
    try:
       import sympy
    except:
       pass
    try:  # avoid overwriting Sage functions (e.g. solve)
        from numpy.linalg import *
        from numpy.linalg import matrix_rank as rank
        from numpy.random import * # https://numpy.org/doc/stable/reference/random/generator.html
        from numpy import trace as tr

        import scipy
        from scipy.stats import * # https://docs.scipy.org/doc/scipy/reference/stats.html
        from scipy.optimize import minimize
        from scipy.linalg import *

        from numpy import kron
    except:
        pass
    try:
        from utils import *
        from QuantumComputer import *
        from tqdm.autonotebook import tqdm as tq
    except:
        pass

import itertools # https://docs.python.org/3/library/itertools.html
from itertools import product, combinations
# from bisect import bisect as binary_search

### numpy visuals
if sys.modules['numpy'].__version__ > '2':
    np.set_printoptions(legacy='1.25')  # mainly means that numeric scalars are printed without their type information, e.g. as 3.0 rather than np.float64(3.0) https://numpy.org/doc/stable/reference/generated/numpy.set_printoptions.html#numpy.set_printoptions

def npp(precision=3, suppress=True):
    np.set_printoptions(precision=precision, suppress=suppress)
if "COLUMNS" in os.environ:
    cols = int(os.environ["COLUMNS"])
    if cols == 0:
        np.set_printoptions(linewidth=200)
    else:
        np.set_printoptions(linewidth=cols)

### aliases
T = True
F = False
l = list
eigs = eigvals
eigsh = eigvalsh
try:
    CC = ConvergenceCondition
    factor = prime_factors
except:
    pass

def r(x, precision=7):
    return np.round(x, precision)

def now():
    return time.time()

### misc
import inspect
def source(f):
    print(inspect.getsource(f), end="")

### more
# from ipywidgets import interact, FloatSlider, IntText
# FloatSlider(min=0, max=1, step=0.1, value=1, continuous_update=False)
# https://ipywidgets.readthedocs.io/en/latest/examples/Widget%20List.html

# import networkx as nx
# import tensorflow as tf
# import torch.nn as nn
# from scipy.optimize import minimize

# import pandas as pd
# pd.set_option('display.max_rows', 500)
# pd.set_option('display.max_colwidth', None) # show complete text in df cells
# pd.set_option("display.precision", 3)

# import stan
# import nest_asyncio
# nest_asyncio.apply()
