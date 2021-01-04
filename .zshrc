# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"
export ZDOTDIR=$ZSH
export PATH="/opt/homebrew/bin:$PATH"
export FPATH="$(brew --prefix)/share/zsh/site-functions:$FPATH"

# disable marking untracked files under VCS as dirty
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# see 'man strftime' for details.
HIST_STAMPS="dd.mm.yyyy"

COMPLETION_WAITING_DOTS="true"

plugins=(
  git
  npm
  fd
)

source "$ZSH/oh-my-zsh.sh"

# User configuration

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# ssh
# export SSH_KEY_PATH="~/.ssh/rsa_id"

ENABLE_CORRECTION="true"
autoload -U +X bashcompinit && bashcompinit
#autoload -U +X compinit && compinit
source ~/.profile

### completions
# https://stackoverflow.com/questions/14307086/tab-completion-for-aliased-sub-commands-in-zsh-alias-gco-git-checkout
if hash pass &>/dev/null; then
  compdef pc=pass
  compdef pe=pass
  compdef pm=pass
  compdef pu=pass
  compdef pi=pass
  compdef po=pass
fi
compdef _path_commands fip
compdef _functions fif
compdef _aliases fia
function _tex_files() { _arguments "1: :($(echo *.tex))" "2: :($(echo *.tex))" }
compdef _tex_files clat

### theme
ZSH_THEME_GIT_PROMPT_PREFIX=" %{$fg[red]%}"
ZSH_THEME_GIT_PROMPT_SUFFIX="%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_DIRTY="%{$fg[yellow]%}*"
ZSH_THEME_GIT_PROMPT_CLEAN=""
PROMPT='%(?..%F{red})%*%f %c$(git_prompt_info)%(!.%F{red}.)$%f '
# see http://zsh.sourceforge.net/Doc/Release/Prompt-Expansion.html

### zsh things
alias t="whence -avs"
unalias gsd

function command_not_found_handler() {
  if type command_not_found >/dev/null 2>&1; then
    command_not_found "$@"
  else
    echo "Sorry, couldn't find: $*"
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

#for IntelliJ shell do
#echo "source ~/.zshrc" >> /Applications/IntelliJ\ IDEA.app/Contents/plugins/terminal/.zshrc
# If zsh is slow, try
# mv ~/.oh-my-zsh/lib/spectrum.zsh ~/.oh-my-zsh/lib/spectrum.zsh_disabled
