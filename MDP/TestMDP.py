#!/usr/bin/env python3
import unittest
from MDP import MDP

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

class TestBayesNet(unittest.TestCase):
    def setUp(self):
        pass

    def assertMDP(self, mdp, opt_vals, opt_policy):
        # test values
        vals = mdp.solve()
        self.assertEqual(vals.keys(), opt_vals.keys())
        for s in opt_vals.keys():
            self.assertAlmostEqual(vals[s], opt_vals[s], places=7)

        # test policy
        policy = mdp.make_policy(vals)
        self.assertEqual(policy, opt_policy)

    def test_3states_2actions(self):
        self.assertMDP(
                MDP(
                    transition_tables = {
                        "a1": [
                            [0.0, 1.0, 0.0],
                            [0.5, 0.0, 0.5],
                            [0.2, 0.8, 0.0]
                        ],
                        "a2": [
                            [0.0, 0.0, 1.0],
                            [0.5, 0.0, 0.5],
                            [0.7, 0.3, 0.0]
                        ]
                    },
                    rewards = [0, 1, 2],
                    gamma = 0.9
                ),
                {0: 11.007194245, 1: 11.456834532, 2: 12.230215827}, # optimal values
                {0: 'a2', 1: 'a1', 2: 'a1'} # optimal policy
        )

    def test_3states_1action(self):
        self.assertMDP(
                MDP(
                    transition_tables = {
                        "a1": [
                            [0.0, 1.0, 0.0],
                            [0.0, 0.0, 1.0],
                            [0.2, 0.8, 0.0]
                        ]
                    },
                    rewards = [
                        {"a1": {}},
                        {"a1": {}},
                        {"a1": {0: 10}}
                    ], # rewards default to 0
                    gamma = 0.9
                ),
                {0: 7.8564500485, 1: 8.7293889428, 2: 9.6993210475},
                {0: 'a1', 1: 'a1', 2: 'a1'}
        )


if __name__ == '__main__':
    unittest.main()