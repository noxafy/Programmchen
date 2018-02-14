#!/bin/bash

port=8080 #default port

usage="Usage: \e[1mfp\e[0m [-h|\e[4mport\e[0m]"
help="Kills any process blocking the specified port.
$usage
	\e[1m-h\e[0m	Displays this message and exits.
	\e[4mport\e[0m	The port where a possible process should be killed (default: $port).
"

case $1 in
  [0-9]|[0-9][0-9]|[0-9][0-9][0-9]|[0-9][0-9][0-9][0-9]|[0-9][0-9][0-9][0-9][0-9])
    if [[ $1 -gt 65535 ]]; then
      echo "Please give an integer between 0 and 65535. See -h for more help."
      exit 1
    fi
    port=$1
    ;;
  dev)
   port=31338
   ;;
  -h)
    printf "$help"
    exit 0
    ;;
  -*)
    printf "Wrong argument: %s\n$usage -- See -h for more help.\n" "$1"
    exit 1
    ;;
  *)
    if [[ -n $1 ]]; then
      echo "Please give an integer between 0 and 65535. See -h for more help."
      exit 1
    fi
    ;;
esac


runningProcessID=$(lsof -i :$port | grep -o "[0-9]\+"| head -1)
if [[ -n $runningProcessID ]]; then
  echo "Killing running process $runningProcessID";
  kill $runningProcessID; 
else 
  echo "No process blocking port $port found :)"
fi
