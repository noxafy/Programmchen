


export HISTTIMEFORMAT="%c " # Show date in history
export HISTCONTROL=erasedups # Erase duplicates in history
export HISTSIZE=10000 # Store 10k history entries

shopt -s histappend # Append to the history file when exiting instead of overwriting it
shopt -s autocd > /dev/null 2>&1
#shopt -s checkwinsize
shopt -s cdspell
bind 'set completion-ignore-case on'

#PS1='\u@\H \A \W\$ '
PS1='\t \W\$ '

. /usr/local/etc/bash_completion
#trap 'printf ""' 2; printf "\033[8m"; while true; do printf "\r\033[K"; done #nasty
***REMOVED***

command_not_found_handle() {
  if type command_not_found >/dev/null 2>&1; then
    command_not_found "$@"
  else
    echo "Sorry, did not found: $*"
  fi
}

. ~/.profile

### completions
# automated alias completion generation: https://superuser.com/questions/436314/how-can-i-get-bash-to-perform-tab-completion-for-$
complete -o filenames -F _pass pc
complete -o filenames -F _pass pe
complete -o filenames -F _pass pm
complete -o filenames -F _pass pu
complete -o filenames -F _pass pi

## PS1
#\a     das ASCII bell Zeichen (07)
#\A     Uhrzeit im 24-Stunden Format (hh:mm)
#\d     Datum in "Wochentag Monat Tag" z.B., "Mit Mai 26")
#\e     ASCII escape Zeichen (033)
#\h     Hostname auf dem die Shell läuft bis zum ersten "."
#\H     Hostname komplett
#\j     Anzahl der Jobs in der Shell
#\l     Das tty, auf dem die Shell läuft
#\n     Neue Zeile
#\t     Uhrzeit im 24-Stunden Format (hh:mm:ss)
#\T     Uhrzeit im 12-Stunden Format (hh:mm:ss)
#\r     carriage return
#\s     Name der verwendeten Shell (sh, bash, ..)
#\u     Name des Nutzers, der die Shell gestartet hat
#\v     Version der bash (z.B. 2.00)
#\V     Release der bash, Version, Patchlevel
#\w     momentanes Arbeitsverzeichnis
#\W     letzte Komponente des Arbeitsverzeichnisses
#\!     Aktuelle History-Nummer
#\#     Aktuelle Befehls-Nummer
#\$     Wenn root ein "#", sonst ein "$"
#\\     Backslash
#\nnn   Zeichen entsprechend der oktalen Zahl nnn
#\[     Beginn einer Sequenz von nicht-darstellbaren Zeichen
#\]     Ende einer Sequenz von nicht-darstellbaren Zeichen
#\@     Aktuelle Zeit im 12-Stunden am/pm Format
