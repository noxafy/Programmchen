#!/bin/bash

regex='^(https?|ftp|file)://[-A-Za-z0-9\+&@#/%?=~_|!:,.;]*[-A-Za-z0-9\+&@#/%=~_|]'
openLink=1




wa="https://web.whatsapp.com/"

psy="https://lexikon.stangl.eu/alphabetisches-inhaltsverzeichnis/"
acc="https://www.overleaf.com/13407653ymrhxyttcrpc#/51720050/"
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

site=$e #default

help="Open a site or search \e[4mkey\e[0m directly there or with Ecosia.
Usage: \e[1mf\e[0m [ -h | [-y] \e[4moption1\e[0m | [-y] [\33[4moption2\e[0m] [-y] \e[4mkey\e[0m \e[4m...\e[0m ]
	\e[1m-h\e[0m	Display this message and exit.
	\e[1m-y\e[0m	Print resulting link, add it to clipboard and exit.
	\e[4mkey\e[0m	The query keywords
	\e[4moption\e[0m	Is one of:"

options="
	  Option type 1 opens a specific web page. Any following arguments will be ignored.
	    OPTION1	SITE
	    w		$w
	    sb		$sb
	    bib		$bib
	    wa		$wa
	    mensa	$mensa
	    psy		$psy

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
	  default search engine.
	When piped it will read the first non-empty line and search it by default search engine.
	No argument will just open Firefox. (Therefrom its name..)
"

startFireFox() {
  printf "Firefox not started yet!\nStarting Firefox"
  open /Applications/Firefox.app  
  printf "."
  sleep 1
  printf "."
  sleep 1
#  printf "."
#  sleep 1
  printf "\r\e[K"
}

fire() {
  if [[ $openLink ]]; then
    # test internet connection
    waitnet -s

    # test if firefox started
    if [[ $(ps -x | grep firefox | wc -l) -eq 1 ]]; then
      startFireFox
    fi
    # open link
    open "$1" || exit 1
  else
    echo "$1"
    #save to clipboard
    printf "%s" "$1" | pbcopy
  fi
  exit 0
}

case $1 in
  -h|--help)
    printf "$help%s" "$options"
    exit 0
    ;;
  -y)
    openLink=""
    shift
    ;;
  -*)
    echo "Wrong argument. Try -h for help."
    exit 1
    ;;
esac

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
    if [[ $1 == -y ]]; then
      openLink=""
      shift
    fi
    if [[ ! $* ]]; then
      fire "$e_def"
    fi
    ;;
  g)
    site="$g"
    shift
    if [[ $1 == -y ]]; then
      openLink=""
      shift
    fi
    if [[ ! $* ]]; then
      fire "$g_def"
    fi
    ;;

  yt)
    site="$yt"
    shift
    if [[ $1 == -y ]]; then
      openLink=""
      shift
    fi
    if [[ ! $* ]]; then
      fire "$yt_def"
    fi
    ;;
  am)
    site="$am"
    shift
    if [[ $1 == -y ]]; then
      openLink=""
      shift
    fi
    if [[ ! $* ]]; then
      fire "$am_def"
    fi
    ;;
  i)
    site="$idealo"
    shift
    if [[ $1 == -y ]]; then
      openLink=""
      shift
    fi
    if [[ ! $* ]]; then
      fire "$idealo_def"
    fi
    ;;
  mvn)
    site="$mvn"
    shift
    if [[ ! $* ]]; then
      fire "$mvn_def"
    fi
    ;;
  npm)
    site="$npm"
    shift
    if [[ $1 == -y ]]; then
      openLink=""
      shift
    fi
    if [[ ! $* ]]; then
      fire "$npm_def"
    fi
    ;;
  s)
    site="$scholar"
    shift
    if [[ $1 == -y ]]; then
      openLink=""
      shift
    fi
    if [[ ! $* ]]; then
      fire "$scholar_def"
    fi
    ;;
  *)
    key=$1
    if [[ $key =~ ^www\..* ]]; then
      key="https://$1"
    fi
    if [[ $key =~ $regex ]]; then
      fire $key
    fi
    site="$e"
    ;;
esac

#read from arguments or stdin
if [[ "$*" ]]; then 
  key="$*"
elif [ ! -t 0 ]; then
  key="$(cat | grep -v '^$' | sed -n 1p)"
fi

#preparing key
if [[ $key ]]; then
  key=${key// /+}
#  if [[ "$site" == "$g" ]]; then
#    key=${key//ä/ae}
#    key=${key//Ä/Ae}
#    key=${key//ö/oe}
#    key=${key//Ö/Oe}
#    key=${key//ü/ue}
#    key=${key//Ü/Ue}
#    key=${key//ß/ss}
#  fi
  key=${key//&/%26}
  key=${key//\"/%22}
  fire "${site}$key"
fi

#for empty key just open firefox / bring it to front
open /Applications/FireFox.app/
