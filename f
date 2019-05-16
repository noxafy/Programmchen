#!/bin/bash

regex='(https?|ftp|file)://(www\.)?[A-Za-z0-9-]*\.[A-Za-z0-9?\\+&@./#%=~_|-]*'
openLink=true
DEBUG=
check_link=true
openCommands=
internetConnection=

e="https://www.ecosia.org/search?q="
e_def="https://www.ecosia.org/"
g="https://www.google.com/search?q="
g_def="https://www.google.com/"
yt="https://www.youtube.com/results?search_query="
yt_def="https://www.youtube.com/"
am="https://www.amazon.de/s?ie=UTF8&field-keywords="
am_def="https://www.amazon.de/"
mvn="https://mvnrepository.com/search?q="
mvn_def="https://mvnrepository.com/"
npm="https://www.npmjs.com/search?q="
npm_def="https://www.npmjs.com/"
s="https://scholar.google.de/scholar?q="
s_def="https://scholar.google.de/"
i="https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q="
i_def="https://www.idealo.de/"
ch="https://www.chefkoch.de/suche.php?wo=2&suche="
ch_def="https://www.chefkoch.de/"
def=$e
def_def=$e_def

# here the actual used search engine is set
site=def

usage="Usage: \e[1m$(basename $0)\e[0m -h | [-i] [-y] [-g] [-d] [\e[4msite\e[0m] [--] [\e[4mkey\e[0m \e[4m...\e[0m]"
help="Open a site or search \e[4mkey\e[0m directly there or with default search engine ($def_def).
$usage
	\e[1m-h\e[0m	Displays this message and exits.
	\e[1m-i\e[0m	Treat given or piped arguments (separated by \$IFS) as valid weblinks.
	\e[1m-y\e[0m	Prints the resulting link, adds it to clipboard and exits.
	\e[1m-g\e[0m	Open browser silently in background.
	\e[1m-d\e[0m	Debug logging and don't open anything at all.
	\e[4mkey\e[0m	The query keywords to look for a translation.
	\e[4msite\e[0m	Launch a search with given keywords directly on a particular site.
	  Without any other argument the related home page will be opened.
	    SITE	WEB ADDRESS
	    e		$e\$key (default)
	    g		$g\$key
	    yt		$yt\$key
	    am		$am\$key
	    i		$i\$key
	    mvn		$mvn\$key
	    npm 	$npm\$key
	    s		$s\$key
	    ch		$ch\$key

	  Any other first word will be interpreted as part of the query phrase and searched by
	  default search engine. Use -- for separating arguments from query, reading from stdin when no query given.
	Given a query as arguments or piped, the script will firstly try to extract a link and, if nothing found,
	read the first non-empty line and search it as specified.
	No argument will just open Firefox. (Therefrom its name..)
"

################################
### Functions
################################

die() {
  mes=$1
  shift
  printf "$mes\n" "$*"
  exit 1
}

testInternet() {
  if [[ -z $internetConnection ]]; then
    if waitnet -s; then
      internetConnection=true
    else
      echo "Could not establish internet connection. Try manually:"
      internetConnection=false
    fi
  fi

  case $internetConnection in
  false)
    return 1
    ;;
  true)
    return 0
    ;;
  esac
}

startFireFox() {
  if [[ $(ps -x | grep firefox | wc -l) -eq 1 ]]; then
    printf "Firefox not started yet!\nStarting Firefox"
    open $openCommands /Applications/Firefox.app
    printf "."
    sleep 1
    printf "."
    sleep 1
    printf "."
    sleep 0.7
    printf "\r\e[K"
  elif [[ $DEBUG ]]; then
    echo "Firefox already started."
  fi
}

fire() {
  if [[ -z $1 ]]; then
    die "Error: No link given!"
  fi

  if [[ ! -t 1 ]]; then
    printf "%s" "$1"
  fi
  if [[ -n $openLink ]]; then
    # test internet connection
    if [[ -z $DEBUG ]] && testInternet; then
        open $openCommands -a /Applications/Firefox.app "$1" || die "Failed to open $1"
    else
      echo "open $1"
    fi
  else
    if [[ -t 1 ]]; then
      echo "$1 (copied to clipboard)"
    else
      echo
    fi
    #save to clipboard
    printf "%s" "$1" | pbcopy
  fi
}

tryFirst() {
  local data_encoded=$(node -e "console.log(encodeURIComponent(process.argv[1]))" "$key")
  local link="$e$data_encoded"
  local -a CURL=(curl -sS -A 'Mozilla/5.0' -GLm 10 -H "Accept-Language: de,en-US;q=0.7,en;q=0.3" "$link")
  if [[ $DEBUG ]]; then
    echo "Searching for first website result."
    printf "%q " "${CURL[@]}"
    echo
  fi

  # test internet connection
  if ! testInternet; then
    printf "open $link"
    exit 1
  fi
  stream=$("${CURL[@]}")
  res=$(echo "$stream" | grep -A 2 "result-url js-result-url\"" | grep -o "href=\"https\?://\(www.\)\?[^\"]*" | sed 's/href="//')
  matching_res=$(echo "$res" | grep -m 1 -e "$key")

  if [[ $DEBUG ]]; then
    echo "Lengths: stream (${#stream}); res (${#res}); matching_res (${#matching_res})"
  fi
  [[ -z "$res" ]] && {
    echo "Unable to find search results. Try yourself."
    return;
  }

  if [[ -z "$matching_res" ]]; then
    echo "$res"
    res_len=$(echo "$res" | wc -l)
    printf "Is there any link right? (1-%d) [1]: " "$res_len" >&2
    read ans
    [[ -z $ans ]] && ans=1
    if [[ $ans =~ ^[0-9]+$ && $ans -gt 0 && $ans -le $res_len ]]; then
      matching_res=$(echo "$res" | sed -n "${ans}p")
    else
      echo "Invalid answer: $ans"
      exit 1
    fi
  fi

  if [[ $matching_res =~ ^$regex$ ]]; then
    if [[ $DEBUG ]]; then
      echo "Matched website regex: $matching_res"
    fi
    fire $matching_res
    exit 0
  else
    echo "Invalid tryFirst result: $matching_res"
  fi
}

################################
### Args parsing
################################

while [[ $1 == -* ]]; do
  case $1 in
    -h|--help)
      printf "$help"
      exit 0
      ;;
    -i)
      check_link=
      ;;
    -y)
      openLink=
      ;;
    -d)
      DEBUG=true
      ;;
    -g)
      openCommands="-g"
      ;;
    --)
      break;
      ;;
    -*)
      die "Wrong argument: %s\n$usage -- See -h for more help." "$1"
      ;;
  esac
  shift
done

if [[ -n $openLink && -z $DEBUG ]]; then
  # test if firefox started
  startFireFox
fi

case $1 in
  e|g|yt|am|i|mvn|npm|s|ch)
    site=$1
    shift
    ;;
  --)
    if [[ -z "$2" && -t 0 ]]; then
      printf "Please give your query: "
      key=$(</dev/stdin)
    fi
    shift
    ;;
esac

#read from piped
if [[ ! -t 0 ]]; then
  key=$(cat)
fi

#read from arguments, if not read
if [[ -n "$key" ]]; then
  if [[ -n "$*" ]]; then
    echo "Warning: link or query piped, but also in argument given. Arguments will be ignored."
  fi
else
  key="$*"
  echo "Set key to: $*"
fi

#preparing key
if [[ -n $key ]]; then
  if [[ -z $check_link ]]; then
    [[ $DEBUG ]] && echo "Ignore checks."
    # don't check, just open all
    for link in $key; do
      fire "$link"
    done
    exit 0
  fi

  #url matching, if not declared as query
  if [[ "$site" == "def" ]]; then
    #guess a bit around
    if [[ $key =~ ^[a-zA-Z0-9-]*\.?[a-zA-Z0-9-]*\.[a-zA-Z0-9/-]*$ ]]; then
      tryFirst "$key"
    fi
    if [[ $key =~ ^www\..* ]]; then
      [[ $DEBUG ]] && echo "Add \"https://\" to $key"
      key="https://$key"
    fi
    regexed=$(echo "$key" | grep -oE "$regex")
    if [[ -n "$regexed" ]]; then
      [[ $DEBUG ]] && echo "Matched website regex: $key"
      declare -a links=($regexed)
      if [[ ${#links[@]} == 1 ]]; then
        fire "$regexed"
      else
        echo "Links found: "
        for idx in "${!links[@]}"; do
          printf "%s: %s\n" "$((idx+1))" "${links[$idx]}" # increment for zero-based to one-based conversion
        done
        if [[ -t 0 ]]; then
          printf "Which one do you want to open? (1-%d/a) [1]: " ${#links[@]}
          read ans
          [[ -z "$ans" ]] && ans=1
          if [[ $ans =~ ^[0-9]+$ ]]; then
            if [[ $ans -gt 0 && $ans -le ${#links[@]} ]]; then
              ((ans--)) # decrement to convert from one-based to zero based
              fire "${links[${ans}]}"
            else
              die "Wrong answer. Integer is zero or too high: $ans."
            fi
          elif [[ "a" == $ans ]]; then
            for link in "${links[@]}"; do
              fire "$link"
            done
          else
            echo "Nothing opened."
            exit 0
          fi
        fi
      fi
      exit 0
    else
      [[ $DEBUG ]] && echo "Didn't match website regex: $key"
    fi
  fi

  key=$(echo "$key" | grep -m 1 '.\+')
  [[ $DEBUG ]] && echo "Key before uri escaping: $key"
  key=$(perl -MURI::Escape -e 'print uri_escape($ARGV[0]);' " $key" | sed 's/^%20//' | sed 's/%20/+/g')
  [[ $DEBUG ]] && echo "Key after uri escaping: $key"

  fire "$(eval echo \$$site)$key"
else
  # if you want just copy the def link or gave an site option
  if [[ -z $openLink || "$site" != "def" ]]; then
    fire "$(eval echo \$${site}_def)"
    exit 0
  fi

  #for empty key just open firefox, resp. bring it to front
  if [[ $DEBUG ]]; then
    echo "Would just open Firefox."
  else
    open $openCommands /Applications/FireFox.app/
  fi
fi
