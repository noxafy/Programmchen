#!/usr/bin/env python3
import unittest
from SAT import solve

'''
Test methods:
    assertEqual
    assertNotEqual
    assertTrue
    assertFalse
    assertIs
    assertIsNot
    assertIsNone
    assertIsNotNone
    assertIn
    assertNotIn
    assertIsInstance
    assertNotIsInstance
    assertAlmostEqual
'''

class TestSAT(unittest.TestCase):
    def setUp(self):
        pass

    def assertSAT(self, query, true_result):
        result, model = solve(query)
        self.assertEqual(result, true_result)

    def test_satisfiable1(self):
        self.assertSAT('a->b', True)

    def test_satisfiable2(self):
        self.assertSAT('(a -> b) & (b <-> c) <-> (b & ~c)', True)

    def test_satisfiable3(self):
        self.assertSAT('(a->b) & (b -> c) and (c -> d) ∧ ~d', True)

    def test_satisfiable4(self):
        self.assertSAT('(j <->k) and (k<-> m) ∧ (m -> n) ^ (n iff not j)', True)

    def test_satisfiable5(self):
        self.assertSAT('(a iff b) v (a <-> not b)', True)

    def test_satisfiable6(self):
        self.assertSAT('~(a ^ b ∧ (c or d))', True)

    def test_satisfiable7(self):
        self.assertSAT('r and not q or not t', True)

    def test_unsatisfiable1(self):
        self.assertSAT('a and ~a', False)

    def test_unsatisfiable2(self):
        self.assertSAT('a & ~(~a -> ~c)', False)

    def test_unsatisfiable3(self):
        self.assertSAT('(~a or b) and (a -> c) & (b -> ~c) and a', False)


if __name__ == '__main__':
    unittest.main()
