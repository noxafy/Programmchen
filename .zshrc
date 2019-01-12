# Path to your oh-my-zsh installation.
export ZSH="~/.oh-my-zsh"

# disable marking untracked files under VCS as dirty
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# see 'man strftime' for details.
# HIST_STAMPS="mm/dd/yyyy"

COMPLETION_WAITING_DOTS="true"

plugins=(
  git
  npm
)

source $ZSH/oh-my-zsh.sh

# User configuration

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# ssh
# export SSH_KEY_PATH="~/.ssh/rsa_id"

ENABLE_CORRECTION="true"
autoload -U +X bashcompinit && bashcompinit
#autoload -U +X compinit && compinit
. ~/.profile

### completions
# https://stackoverflow.com/questions/14307086/tab-completion-for-aliased-sub-commands-in-zsh-alias-gco-git-checkout
compdef pc=pass
compdef pe=pass
compdef pm=pass
compdef pu=pass
compdef pi=pass
compdef _path_commands fip

### theme
ZSH_THEME_GIT_PROMPT_PREFIX=" %{$fg[red]%}"
ZSH_THEME_GIT_PROMPT_SUFFIX="%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_DIRTY="%{$fg[yellow]%}*"
ZSH_THEME_GIT_PROMPT_CLEAN=""
PROMPT='%(?..%F{red})%*%f %c$(git_prompt_info)%(!.%F{red}.)$%f '
# see http://zsh.sourceforge.net/Doc/Release/Prompt-Expansion.html

function command_not_found_handler() {
  if type command_not_found >/dev/null 2>&1; then
    command_not_found "$@"
  else
    echo "Sorry, did not found: $*"
  fi
}

function help() {
  case $1 in
  test)
    man -P "less -p'^CONDITIONAL EXPRESSIONS$'" zshall
    ;;
  "")
    man zshall
    ;;
  *)
    man -P "less -p'^ {7}$@ '" zshall
    ;;
  esac
}
