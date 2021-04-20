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

class TestMDP(unittest.TestCase):
    def setUp(self):
        pass

    def assertMDP(self, mdp, opt_vals, opt_policy, max_rounds=None, init=None, places=7):
        # test values
        if max_rounds:
            if init:
                vals = mdp.solve(max_rounds=max_rounds, init=init)
            else:
                vals = mdp.solve(max_rounds=max_rounds)
        elif init:
            vals = mdp.solve(init=init)
        else:
            vals = mdp.solve()

        self.assertEqual(vals.keys(), opt_vals.keys())
        for s in opt_vals.keys():
            self.assertAlmostEqual(vals[s], opt_vals[s], places=places)

        # test policy
        policy = mdp.make_policy(vals)
        self.assertEqual(policy, opt_policy)

    def test_3states_2actions(self):
        self.assertMDP(
                MDP(
                    transition = [
                        {"a1": {1: 1}, "a2": {2: 1}},
                        {"a1": {0: .5, 2: .5}, "a2": {0: .5, 2: .5}},
                        {"a1": {0: .2, 1: .8}, "a2": {0: .7, 1: .3}}
                    ],
                    rewards = [0, 1, 2],
                    gamma = 0.9
                ),
                {0: 11.007194245, 1: 11.456834532, 2: 12.230215827}, # optimal values
                {0: 'a2', 1: 'a1', 2: 'a1'} # optimal policy
        )

    def test_3states_1action(self):
        self.assertMDP(
                MDP(
                    transition = [
                        {"a1": {1: 1}},
                        {"a1": {2: 1}},
                        {"a1": {0: .2, 1: .8}}
                    ],
                    rewards = [
                        {"a1": {}},
                        {"a1": {}},
                        {"a1": {0: 10}}
                    ],
                    gamma = 0.9,
                    default_reward = 0
                ),
                {0: 7.8564500485, 1: 8.7293889428, 2: 9.6993210475}, # optimal values
                {0: 'a1', 1: 'a1', 2: 'a1'} # optimal policy
        )

    def test_3states_1action_maxrounds(self):
        self.assertMDP(
                MDP(
                    transition = [
                        {"a1": {1: 1}},
                        {"a1": {2: 1}},
                        {"a1": {0: .2, 1: .8}}
                    ],
                    rewards = [
                        {"a1": {}},
                        {"a1": {}},
                        {"a1": {0: 10}}
                    ],
                    gamma = 0.9,
                    default_reward = 0
                ),
                {0: 4.665, 1: 5.575, 2: 6.518},
                {0: 'a1', 1: 'a1', 2: 'a1'},
                max_rounds=10, # restrict to 10 rounds
                places=3
        )

    def test_3states_1action_init1(self):
        self.assertMDP(
                MDP(
                    transition = [
                        {"a1": {1: 1}},
                        {"a1": {2: 1}},
                        {"a1": {0: .2, 1: .8}}
                    ],
                    rewards = [
                        {"a1": {}},
                        {"a1": {}},
                        {"a1": {0: 10}}
                    ],
                    gamma = 0.9,
                    default_reward = 0
                ),
                {0: 7.604, 1: 8.475, 2: 9.446},
                {0: 'a1', 1: 'a1', 2: 'a1'},
                init=[7,8,9], # test list init (+ near to optimal initial values)
                max_rounds=10,
                places=3
        )

    def test_3states_1action_init2(self):
        self.assertMDP(
                MDP(
                    transition = [
                        {"a1": {1: 1}},
                        {"a1": {2: 1}},
                        {"a1": {0: .2, 1: .8}}
                    ],
                    rewards = [
                        {"a1": {}},
                        {"a1": {}},
                        {"a1": {0: 10}}
                    ],
                    gamma = 0.9,
                    default_reward = 0
                ),
                {0: 2.891, 1: 4.018, 2: 4.804},
                {0: 'a1', 1: 'a1', 2: 'a1'},
                init={0:-7,2:-9}, # test with dict init (+ bad init values)
                max_rounds=10,
                places=3
        )

    def test_2states_2actions_3rounds(self):
        self.assertMDP(
                MDP(
                    transition = [
                        {"a1": {1: 1}, "a2": {1: 1}},
                        {"a1": {0: .7, 1: .3}, "a2": {0: 1}}
                    ],
                    rewards = [
                        {"a1": {}, "a2": {1:1}},
                        {"a1": {}, "a2": {}},
                    ],
                    gamma = 0.9
                ),
                {0: 1.81, 1: 0.9}, # optimal values
                {0: 'a2', 1: 'a2'}, # optimal policy
                max_rounds=3
        )


if __name__ == '__main__':
    unittest.main()