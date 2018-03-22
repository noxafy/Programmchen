#!/bin/bash

regex='^(https?|ftp|file)://(www\.)?[A-Za-z0-9-]*\.[A-Za-z0-9\\+&@./#%=~_|-]*$'
openLink=1
VERBOSE=




wa="https://web.whatsapp.com/"

psy="https://lexikon.stangl.eu/alphabetisches-inhaltsverzeichnis/"

trading212="https://www.trading212.com"
#
#
#
#
#
#

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
scholar="https://scholar.google.de/scholar?q="
scholar_def="https://scholar.google.de/"
idealo="https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q="
idealo_def="https://www.idealo.de/"

site=default

usage="Usage: \e[1mf\e[0m -h | [-y] [-d] [ \e[4moption1\e[0m | [--] \e[4mkey\e[0m \e[4m...\e[0m | \33[4moption2\e[0m [\e[4mkey\e[0m \e[4m...\e[0m] ]"
help="Open a site or search \e[4mkey\e[0m directly there or with Ecosia.
$usage
	\e[1m-h\e[0m	Displays this message and exits.
	\e[1m-y\e[0m	Prints the resulting link, adds it to clipboard and exits.
	\e[1m-d\e[0m	Debug logging and don't open anything at all.
	\e[4mkey\e[0m	The query keywords to look for a translation.
	\e[4moption\e[0m	Is one of:
	  Option type 1 opens a specific web page. Any following arguments will be ignored.
	    OPTION1	SITE
	    w		$w
	    sb		$sb
	    bib		$bib
	    wa		$wa
	    mensa	$mensa
	    psy		$psy
	    mail	$mail
	    t212	$trading212

	  Option type 2 processes directly a search with given keywords on a particular site.
	  Without any other argument the related home page will be opened.
	    OPTION2	SITE
	    e		$e\$key (default)
	    g		$g\$key
	    yt		$yt\$key
	    am		$am\$key
	    i		$idealo\$key
	    mvn		$mvn\$key
	    npm 	$npm\$key
	    s		$scholar\$key

	  Any other first word will be interpreted as part of the query phrase and searched by 
	  default search engine. Type -- for treating an option as query.
	When no key given, but something piped, it will read the first non-empty line and search it as specified.
	No argument will just open Firefox. (Therefrom its name..)
"

case $1 in
  -h|--help)
    printf "$help"
    exit 0
    ;;
esac

startFireFox() {
  if [[ $(ps -x | grep firefox | wc -l) -eq 1 ]]; then
    printf "Firefox not started yet!\nStarting Firefox"
    open /Applications/Firefox.app  
    printf "."
    sleep 1
    printf "."
    sleep 1
    printf "."
    sleep 0.3
    printf "\r\e[K"
  elif [[ $VERBOSE ]]; then
    echo "Firefox already started."
  fi
}

fire() {
  if [[ $openLink ]]; then
    if [[ $VERBOSE ]]; then
      echo "Open link: $1"
      exit 0
    fi
    open "$1" || echo "Failed to open $1" && exit 1
  else
    if [[ -t 1 ]]; then
      echo "$1 (copied to clipboard)"
    else
      echo "$1"
    fi
    #save to clipboard
    printf "%s" "$1" | pbcopy
  fi
  exit 0
}

tryFirst() {
  header='Accept-Language: de,en-US;q=0.7,en;q=0.3'
  if [[ $VERBOSE ]]; then
    echo "Searching for first website result."
    echo "curl -s -A 'Mozilla/5.0' -GLm 10 -H \"$header\" https://www.ecosia.org/search --data-urlencode \"q=$1\""
  fi
  stream=$(curl -s -A 'Mozilla/5.0' -GLm 10 -H "$header" https://www.ecosia.org/search --data-urlencode "q=$1")
  res=$(echo "$stream" | grep -o -m 1 "result-url js-result-url\" href=\"[^\"]*" | sed 's/result-url js-result-url" href="//')
  if [[ $VERBOSE ]]; then
    echo "Lengths: stream (${#stream}); res (${#res})"
  fi
  if [[ $res =~ $regex ]]; then
    if [[ $VERBOSE ]]; then
      echo "Matched website regex: $res"
    fi
    fire $res
    exit 0
  else
    echo "Invalid tryFirst result: $res"
  fi
}

#read from piped
if [ ! -t 0 ]; then
  key="$(cat | grep -v '^$' | sed -n 1p)"
fi

while [[ $1 == -* ]]; do
  case $1 in
    -y)
      openLink=""
      if [[ ( -z "$2" || ( "$2" == -- && -z "$3" ) ) && -z "$key" ]]; then
        printf "Cannot copy empty link request. See -h for more information.\n"
        exit 1
      fi
      ;;
    -v)
      VERBOSE=true
      ;;
    --)
      if [[ -z "$2" && -z "$key" ]]; then
        printf "Argument -- must follow query key words. See -h for more information.\n"
        exit 1
      fi
      break;
      ;;
    -*)
      printf "Wrong argument: %s\n$usage -- See -h for more help.\n" "$1"
      exit 1
      ;;
  esac
  shift
done

if [[ -n $openLink ]]; then
  # test internet connection
  waitnet -s

  # test if firefox started
  startFireFox
fi

case $1 in
  w)
    fire "$w"
    ;;
  sb)
    fire "$sb"
    ;;
  bib) 
    fire "$bib"
    ;;
  wa)
    fire "$wa"
    ;;
  mensa)
    fire "$mensa"
    ;;
  psy)
    fire "$psy"
    ;;
  acc)
    fire "$acc"
    ;;
  mail|webmail)
    fire "$mail"
    ;;
  t212)
    fire "$trading212"
    ;;
#  wg)
#    fire "$wg"
#    ;;
#  ww)
#    fire "$ww"
#    ;;
#  mp)
#    fire "$mp"
#    ;;
#  mpo)
#    fire "$mpo"
#    ;;
#  immo24)
#    fire "$immo24"
#    ;;
#  wiwue)
#    fire "$wiwue"
#    ;;
  e)
    site="$e"
    shift
    if [[ -z "$*" && -z "$key" ]]; then
      fire "$e_def"
    fi
    ;;
  g)
    site="$g"
    shift
    if [[ -z "$*" && -z "$key" ]]; then
      fire "$g_def"
    fi
    ;;
  yt)
    site="$yt"
    shift
    if [[ -z "$*" && -z "$key" ]]; then
      fire "$yt_def"
    fi
    ;;
  am)
    site="$am"
    shift
    if [[ -z "$*" && -z "$key" ]]; then
      fire "$am_def"
    fi
    ;;
  i)
    site="$idealo"
    shift
    if [[ -z "$*" && -z "$key" ]]; then
      fire "$idealo_def"
    fi
    ;;
  mvn)
    site="$mvn"
    shift
    if [[ -z "$*" && -z "$key" ]]; then
      fire "$mvn_def"
    fi
    ;;
  npm)
    site="$npm"
    shift
    if [[ -z "$*" && -z "$key" ]]; then
      fire "$npm_def"
    fi
    ;;
  s)
    site="$scholar"
    shift
    if [[ -z "$*" && -z "$key" ]]; then
      fire "$scholar_def"
    fi
    ;;
  --)
    shift
    ;;
esac

#read from arguments
if [[ "$*" ]]; then 
  key="$*"
fi

#url matching, if not 
if [[ "$site" = "default" ]]; then
  #guess a bit around
  if [[ $key =~ ^[a-zA-Z0-9-]*\.[a-zA-Z0-9/-]*$ ]]; then
    tryFirst "$key"
  fi
  if [[ $key =~ ^www\..* ]]; then
    if [[ $VERBOSE ]]; then
      echo "Add \"https://\" to $key"
    fi
    key="https://$key"
  fi
  if [[ $key =~ $regex ]]; then
    if [[ $VERBOSE ]]; then
      echo "Matched website regex: $key"
    fi
    fire "$key"
  fi
  #set default to ecosia
  site=$e
fi

#preparing key
if [[ -n $key ]]; then
  if [[ $VERBOSE ]]; then
    echo "Key before uri escaping: $key"
  fi
  if [[ "$key" == -* ]]; then
    key=" $key"
    key=$(perl -MURI::Escape -e 'print uri_escape($ARGV[0]);' "$key" | sed 's/^%20//' | sed 's/%20/+/g')
  else
    key=$(perl -MURI::Escape -e 'print uri_escape($ARGV[0]);' "$key" | sed 's/%20/+/g')
  fi
  if [[ $VERBOSE ]]; then
    echo "Key after uri escaping: $key"
  fi
  fire "${site}$key"
else
  if [[ $VERBOSE ]]; then
    echo "Just opening Firefox."
    exit 0
  fi
  #for empty key just open firefox resp. bring it to front
  open /Applications/FireFox.app/
fi
