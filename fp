#!/bin/bash

port=8080 #default port

help="Kills any process blocking the specified port.
Usage: \e[1mfp\e[0m [\e[4mport\e[0m|-h]
	\e[4mport\e[0m	The port where a possible process should be killed (default: $port).
	\e[1m-h\e[0m	Displays this message and exits.
"

case $1 in
  [0-9]|[0-9][0-9]|[0-9][0-9][0-9]|[0-9][0-9][0-9][0-9]|[0-9][0-9][0-9][0-9][0-9])
    if [[ $1 -gt 65535 ]]; then
      printf "Please give a number between 0 and 65535.\n$help"
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
    printf "Unknown argument $1.\n$help"
    exit 1
    ;;
  *)
    if [[ -n $1 ]]; then
      printf "Please give a number between 0 and 65535.\n$help"
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
