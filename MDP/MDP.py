class MDP:

    def __init__(self, transition_tables, rewards, gamma):
        """
        States are enumerated 1,..., while action are strings (or any other hashable unique identifier).

        Transition tables is a dict(action -> transition probabilities (2d array)), where it is read as prob of going from row to col
        Rewards is either a list of rewards (one for each state) or a list of states -> dict(action -> dict(successorstate -> reward))))
        """
        self.transition = transition_tables
        self.rewards = rewards
        self.state_rewards = type(rewards[0]) == float or type(rewards[0]) == int
        self.gamma = gamma
        self.threshold = (1-self.gamma)/(2*self.gamma)

    def P(self,s1,a,s2):
        return self.transition[a][s1][s2]

    def R(self,s1,a=None,s2=None):
        """
        Call this with one argument only if you gave rewards only state-wise
        """
        if self.state_rewards:
            return self.rewards[s1]

        actions_rewards = self.rewards[s1][a]
        if s2 in actions_rewards:
            return actions_rewards[s2]
        else:
            return 0

    def successor_states(self,s,a):
        return [i for i, succ in enumerate(self.transition[a][s]) if succ > 0.0]

    def applicable_actions(self,s):
        actions = []
        for a, trans in self.transition.items():
            if sum(trans[s]) > 0.0:
                actions.append(a)
        return actions

    def states(self):
        return list(range(len(self.rewards)))

    def solve(self, epsilon = 1e-8):
        def max_distance(v, v2):
            max_d = -1
            for s in v.keys():
                d = abs(v[s] - v2[s])
                if d > max_d:
                    max_d = d
            return max_d

        v = {s:0 for s in self.states()}

        while True:
            v_new = {}

            for s in v.keys():
                if self.state_rewards:
                    action_vals = {a: self.R(s) + self.value_of(s, a, v) for a in self.applicable_actions(s)}
                else:
                    action_vals = {a: self.value_of(s, a, v) for a in self.applicable_actions(s)}
                best_action = argmax(action_vals)
                v_new[s] = action_vals[best_action]

            if max_distance(v, v_new) < epsilon * self.threshold:
                break

            v = v_new

        return v_new

    def make_policy(self, optimal_values):
        if self.state_rewards:
            return {s1 : argmax({a : self.R(s1) + self.value_of(s1, a, optimal_values)
                            for a in self.applicable_actions(s1)})
                        for s1 in self.states()}
        return {s1 : argmax({a : self.value_of(s1, a, optimal_values)
                        for a in self.applicable_actions(s1)})
                    for s1 in self.states()}

    def value_of(self, s, a, v):
        if self.state_rewards:
            return sum([self.gamma * self.P(s,a,s_) * v[s_] for s_ in self.successor_states(s,a)])
        return sum([self.P(s,a,s_) * (self.R(s,a,s_) + self.gamma * v[s_]) for s_ in self.successor_states(s,a)])

def argmax(d):
    return max(d, key = lambda k : d[k])
