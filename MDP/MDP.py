class MDP:

    def __init__(self, transition_tables, rewards, gamma):
        """
        States are enumerated (0,1,...), while actions are strings (or any other hashable unique identifiers).

        Transition tables is a dict(action -> transition probabilities (2d array)), where it is read as prob of going from row to col
        Rewards is a list with one entry per state, where the entries are
            - either the state reward as float
            - or dict: action -> (dict: successorstate -> reward)
        """
        self.transition = transition_tables
        self.rewards = rewards
        self.state_rewards = type(rewards[0]) == float or type(rewards[0]) == int
        self.gamma = gamma
        self.threshold = (1-self.gamma)/(2*self.gamma)

        if not self.state_rewards:
            # check data types
            for a in rewards:
                if type(a) != dict:
                    raise ValueError("Rewards must contain actions as dicts!")
                for name, rewards_dict in a.items():
                    if type(rewards_dict) != dict:
                        raise ValueError("Rewards must contain the rewards for each state as dict, but was %s!" % type(rewards_dict))

    def P(self,s1,a,s2):
        """
        TODO: Switch to same specification logic as in rewards (and adapt successor_states and applicable_actions function accordingly)
        """
        return self.transition[a][s1][s2]

    def R(self,s1,a=None,s2=None):
        """
        If you initialized with state-only rewards, call this with only one argument.
        """
        if self.state_rewards:
            return self.rewards[s1]

        actions_rewards = self.rewards[s1][a]
        # this won't work with lists
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
