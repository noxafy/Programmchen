#!/bin/bash

regex='^(https?|ftp|file)://(www\.)?[A-Za-z0-9-]*\.[A-Za-z0-9?\\+&@./#%=~_|-]*$'
openLink=1
DEBUG=
openCommands=




wa="https://web.whatsapp.com/"

psy="https://lexikon.stangl.eu/alphabetisches-inhaltsverzeichnis/"


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

usage="Usage: \e[1m$(basename $0)\e[0m -h | -i \e[4msites\e[0m \e[4m...\e[0m | [-y] [-d] [-g] [ \e[4moption1\e[0m | [--] \e[4mkey\e[0m \e[4m...\e[0m | \33[4moption2\e[0m [\e[4mkey\e[0m \e[4m...\e[0m] ]"
help="Open a site or search \e[4mkey\e[0m directly there or with default search engine ($def_def).
$usage
	\e[1m-h\e[0m	Displays this message and exits.
	\e[1m-i\e[0m	Treat every given or piped argument (separated by \$IFS) as valid website.
	\e[1m-y\e[0m	Prints the resulting link, adds it to clipboard and exits.
	\e[1m-g\e[0m	Open browser silently in background.
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
	    t212	$t212

	  Option type 2 processes directly a search with given keywords on a particular site.
	  Without any other argument the related home page will be opened.
	    OPTION2	SITE
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
	  default search engine. Use -- for separating options from query.
	When no key given, but something piped, it will read the first non-empty line and search it as specified.
	No argument will just open Firefox. (Therefrom its name..)
"

################################
### Functions
################################

die() {
  mes=$1
  shift
  printf "$mes" "$*"
  exit 1
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
  
  if [[ $openLink ]]; then
    if [[ $DEBUG ]]; then
      echo "Open link: $1"
      exit 0
    fi
    open $openCommands "$1" || die "Failed to open $1"
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
  data_encoded=$(node -e "console.log(encodeURIComponent(process.argv[1]))" "$key")
  CURL=(curl -sS -A 'Mozilla/5.0' -GLm 10 -H "Accept-Language: de,en-US;q=0.7,en;q=0.3" "$e$data_encoded")
  if [[ $DEBUG ]]; then
    echo "Searching for first website result."
    printf "%q " "${CURL[@]}"
    echo
  fi
  stream=$("${CURL[@]}")
  res=$(echo "$stream" | grep -o -m 1 "result-url js-result-url\" href=\"[^\"]*" | sed 's/result-url js-result-url" href="//')
  if [[ $DEBUG ]]; then
    echo "Lengths: stream (${#stream}); res (${#res})"
  fi
  if [[ $res =~ $regex ]]; then
    if [[ $DEBUG ]]; then
      echo "Matched website regex: $res"
    fi
    fire $res
    exit 0
  else
    echo "Invalid tryFirst result: $res"
  fi
}

################################
### Args parsing
################################

case $1 in
  -h|--help)
    printf "$help"
    exit 0
    ;;
  -i)
    if [ ! -t 0 ]; then
      keys="$(cat | grep -v '^$')"
    else
      shift
      keys="$*"
    fi
    [[ -z $keys ]] && die "Give some sites with argument -i."
    startFireFox
    #guarantee an open window
    open /Applications/Firefox.app/
    sleep 1

    open $keys
    exit 0
    ;;
esac

#read from piped
if [ ! -t 0 ]; then
  key="$(cat | grep -v '^$' | sed -n 1p)"
fi

while [[ $1 == -* ]]; do
  case $1 in
    -y)
      openLink=""
      if [[ ( -z "$2" || ( "$2" == -- && -z "$3" ) ) && -z "$key" ]]; then
        die "Cannot copy empty link request. See -h for more information.\n"
      fi
      ;;
    -d)
      DEBUG=true
      ;;
    -g)
      openCommands="-g"
      ;;
    --)
      if [[ -z "$2" && -z "$key" ]]; then
        die "Argument -- must follow query key words. See -h for more information.\n"
      fi
      break;
      ;;
    -*)
      die "Wrong argument: %s\n$usage -- See -h for more help.\n" "$1"
      ;;
  esac
  shift
done

if [[ -n $openLink ]]; then
  # test internet connection
  waitnet -s || {
    echo "Could not establish internet connection. Try to manually:"
    printf "open "
    openLink=
  }

  if [[ -n $openLink ]]; then
    # test if firefox started
    startFireFox
  fi
fi

case $1 in
  w|sb|bib|wa|mensa|psy|mail)
    fire "$(eval echo \$$1)"
    ;;
  212|t212|trading212)
    fire "$t212"
    ;;
  e|g|yt|am|i|mvn|npm|s|ch)
    site=$1
    shift
    ;;
  --)
    shift
    ;;
esac

#read from arguments, if not read
if [[ -n $key ]]; then
  if [[ -n "$*" ]]; then
    echo "Warning: link or query piped, but also in argument given. Arguments will be ignored."
  fi
else
  key="$*"
fi

#preparing key
if [[ -n $key ]]; then
  #url matching, if not
  if [[ "$site" = "def" ]]; then
    #guess a bit around
    if [[ $key =~ ^[a-zA-Z0-9-]*\.?[a-zA-Z0-9-]*\.[a-zA-Z0-9/-]*$ ]]; then
      tryFirst "$key"
    fi
    if [[ $key =~ ^www\..* ]]; then
      if [[ $DEBUG ]]; then
        echo "Add \"https://\" to $key"
      fi
      key="https://$key"
    fi
    if [[ $key =~ $regex ]]; then
      if [[ $DEBUG ]]; then
        echo "Matched website regex: $key"
      fi
      fire "$key"
    elif [[ $DEBUG ]]; then
      echo "Didn't match website regex: $key"
    fi
  fi

  if [[ $DEBUG ]]; then
    echo "Key before uri escaping: $key"
  fi
  key=$(perl -MURI::Escape -e 'print uri_escape($ARGV[0]);' " $key" | sed 's/^%20//' | sed 's/%20/+/g')
  if [[ $DEBUG ]]; then
    echo "Key after uri escaping: $key"
  fi
  # TODO: "feeling lucky" with google: &btnI=Auf+gut+Glück!
  fire "$(eval echo \$$site)$key"
else
  if [[ -z $openLink || "$site" != "def" ]]; then
    fire "$(eval echo \$${site}_def)"
  fi
  if [[ $DEBUG ]]; then
    echo "Just opening Firefox."
    exit 0
  fi
  #for empty key just open firefox resp. bring it to front
  open $openCommands /Applications/FireFox.app/
fi
