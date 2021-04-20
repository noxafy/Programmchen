#!/usr/bin/env python3
import unittest
from SAT import solve, table, valid, logCon, logEq, modelCnt

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

    def assertSAT(self, f, true_result):
        result, model = solve(f)
        self.assertEqual(result, true_result)

    def assertValid(self, f, true_result):
        result = valid(f)
        self.assertEqual(result, true_result)

    def assertLogCon(self, f1, f2, true_result):
        result = logCon(f1, f2)
        self.assertEqual(result, true_result)

    def assertLogEq(self, f1, f2, true_result):
        result = logEq(f1, f2)
        self.assertEqual(result, true_result)

    def assertModelCnt(self, f, true_cnt):
        result = modelCnt(f)
        self.assertEqual(result, true_cnt)

    def assertTable(self, f, true_var, true_dict):
        result, var = table(f, False)
        self.assertEqual(var, true_var)
        self.assertEqual(result, true_dict)

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
        self.assertSAT('a & ~(~a → ~c)', False)

    def test_unsatisfiable3(self):
        self.assertSAT('(~a or b) and (a -> c) & (b -> ~c) and a', False)

    def test_valid1(self):
        self.assertValid('a → (b → a)', True)

    def test_valid2(self):
        self.assertValid('a∨b -> a∧b', False)

    def test_logCon1(self):
        self.assertLogCon('a and b', '~(b -> c) v a', True)

    def test_logCon2(self):
        self.assertLogCon('a or b', '~(b -> c) v a', False)

    def test_logEq1(self):
        self.assertLogEq('a and b', '~(b -> a) v a', False)

    def test_logEq2(self):
        self.assertLogEq('a or b', '~(b -> a) v a', True)

    def test_table1(self):
        self.assertTable('a → (b → ~a)', ['a', 'b'], {(0, 0): True, (0, 1): True, (1, 0): True, (1, 1): False})

    def test_modelCnt1(self):
        self.assertModelCnt('(a -> b) & (b <-> c) <-> (b & ~c)', 3)

    def test_modelCnt2(self):
        self.assertModelCnt('~(a ^ b ∧ (c or d))', 13)


if __name__ == '__main__':
    unittest.main()
