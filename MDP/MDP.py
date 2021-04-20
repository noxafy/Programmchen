class MDP:

    def __init__(self, transition, rewards, gamma, default_reward=0):
        """
        States are enumerated (0,1,...), while actions are strings (or any other hashable unique identifiers).

        Transition is a list with one entry per state, where each entry is a dict: action -> (dict: successorstate -> transition probability)
        Rewards is a list with one entry per state, where the entries are
            - either the state reward as float
            - or dict: action -> (dict: successorstate -> reward)
        """
        self.transition = transition
        self.rewards = rewards
        self.default_reward = default_reward
        self.state_rewards = type(rewards[0]) == float or type(rewards[0]) == int
        self.gamma = gamma
        self.threshold = (1-self.gamma)/(2*self.gamma)
        self.states = list(range(len(self.rewards)))

        # some sanity checks
        assert len(rewards) == len(transition), "Rewards and transition should both have entries for all states! (was: %d vs. %d)" %(len(rewards), len(transition))
        assert type(rewards) == list, "Rewards must be a list, but was: %s" % type(rewards)
        assert type(transition) == list, "Transition must be a list, but was: %s" % type(transition)

        if not self.state_rewards:
            # check data types
            for s in rewards:
                if type(s) != dict:
                    raise ValueError("Rewards must contain dicts (one for each state)!")
                for a, a_dict in s.items():
                    if type(a_dict) != dict:
                        raise ValueError("Rewards state dicts must contain dicts for each action, but one was %s!" % type(rewards_dict))
        for i, s in enumerate(transition):
            if type(s) != dict:
                raise ValueError("Transition must contain dicts (one for each state)!")
            for a, a_dict in s.items():
                if type(a_dict) != dict:
                    raise ValueError("Transition state dicts must contain dicts for each action, but one was %s!" % type(trans_dict))
                assert abs(sum(a_dict.values())) - 1 < 1e-10, "Transition probabilities must sum to one! (state: %s, action: %s)" % (i, a)

    def P(self,s1,a,s2):
        return _getFromDictDictList(self.transition, s1, a, s2, 0)

    def R(self,s1,a=None,s2=None):
        """
        If you initialized with state-only rewards, call this with only one argument.
        """
        if self.state_rewards:
            return self.rewards[s1]
        return _getFromDictDictList(self.rewards, s1, a, s2, self.default_reward)

    def successor_states(self,s,a):
        return self.transition[s][a].keys()

    def applicable_actions(self,s):
        return self.transition[s].keys()

    def solve(self, epsilon = 1e-8, max_rounds = -1, verbose = False, init=0):
        def max_distance(v, v2):
            max_d = -1
            for s in v.keys():
                d = abs(v[s] - v2[s])
                if d > max_d:
                    max_d = d
            return max_d

        def hasConverged(iteration, v, v_new):
            return iteration == max_rounds or max_distance(v, v_new) < epsilon * self.threshold

        if type(init) == dict:
            v = {}
            for s in self.states:
                if s in init:
                    v[s] = init[s]
                else:
                    v[s] = 0 # fallback
        elif type(init) == list:
            v = {}
            assert len(init) == len(self.states), "There must be as many initial values as states!"
            for i, s in zip(init, self.states):
                v[s] = i
        elif type(init) == float or type(init) == int:
            v = {s:init for s in self.states}
        else:
            raise ValueError('"init" must be a number, a dict: state -> values, or a list of values (one for each state), but was', type(init))

        iteration = 0
        while True:
            iteration += 1
            v_new = {}

            for s in v.keys():
                if self.state_rewards:
                    action_vals = {a: self.R(s) + self.value_of(s, a, v) for a in self.applicable_actions(s)}
                else:
                    action_vals = {a: self.value_of(s, a, v) for a in self.applicable_actions(s)}
                best_action = argmax(action_vals)
                v_new[s] = action_vals[best_action]

            if verbose:
                print("Round:",iteration, v_new)
            if hasConverged(iteration, v, v_new):
                break

            v = v_new

        return v_new

    def make_policy(self, optimal_values):
        if self.state_rewards:
            return {s1 : argmax({a : self.R(s1) + self.value_of(s1, a, optimal_values)
                            for a in self.applicable_actions(s1)})
                        for s1 in self.states}
        return {s1 : argmax({a : self.value_of(s1, a, optimal_values)
                        for a in self.applicable_actions(s1)})
                    for s1 in self.states}

    def value_of(self, s, a, v):
        if self.state_rewards:
            return sum([self.gamma * self.P(s,a,s_) * v[s_] for s_ in self.successor_states(s,a)])
        return sum([self.P(s,a,s_) * (self.R(s,a,s_) + self.gamma * v[s_]) for s_ in self.successor_states(s,a)])

def argmax(d):
    return max(d, key = lambda k : d[k])

def _getFromDictDictList(d, s1, a, s2, default):
    s1_ = d[s1]
    try:
        a_ = s1_[a]
    except:
        raise ValueError('Action "%s" is not applicable in state %s' % (a, s1)) from None
    # this won't work with lists
    if s2 in a_:
        return a_[s2]
    return default
