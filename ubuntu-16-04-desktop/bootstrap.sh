#!/bin/bash -x

if [ $UID -ne 0 ] ; then
    (
        echo    "ERROR: This script can't be run regular user, login as root or use"
        echo -e "\tsudo $0"
        echo    "to run script under regular user"
    ) >&2
    exit 255
fi

apt -y install wmctrl curl libappindicator1 libxtst-dev libpng++-dev libopencv-dev

cat > '/usr/lib/firefox/defaults/pref/local-settings.js' << EOL
pref("general.config.obscure_value", 0);
pref("general.config.filename", "mozilla.cfg");
EOL

cat > '/usr/lib/firefox/mozilla.cfg' << EOL 
//
lockPref("browser.privatebrowsing.autostart", true);
lockPref("browser.startup.page", 0);
EOL

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
apt -y install nodejs
npm install robotjs opencv tesseract.js jimp fs-extra

