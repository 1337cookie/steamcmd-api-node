# SteamCMD-API-node

A web API made for retrieving info from SteamCMD cli utility.  Built with node.

## Why?

Some information is only available through SteamCMD but is very useful for checking for updates for dedicated servers. Other information like launch options and icon locations are also only available through SteamCMD.

It only logs into steam anonymously so some info may not be shown. I have only tested on windows. This is a first pass WIP. Open to criticism, suggestions, requests, PRs, lessons.

You can access my instance of the API at https://steamcmd.buddy.nz/ . I wont guarantee it will be available.

Example:

> https://steamcmd.buddy.nz/api/v1/appinfoprint/740

## Usage:

SteamCMD command:

> app_info_print

```
SteamCMD> app_info_print <appid>
```

Available at:

```
/api/v1/appinfoprint/<appid>
```

Example:

```
http://localhost:3000/api/v1/appinfoprint/740
```

Returns:

```
{
  "740": {
    "common": {
      "name": "Counter-Strike Global Offensive - Dedicated Server",
      "type": "Tool",
      "oslist": "windows,linux",
      "gameid": 740
    },
...
```

## Install.

You will need [nodejs](https://nodejs.org/) installed.

Clone repo:

```
git clone https://github.com/1337cookie/steamcmd-api-node.git
```

Change directory:

```
cd steam-api-node
```

Install dependencies.

```
npm i
```

If you have errors during npm i you may need build tools which can be installed during the node installer or using `npm install --global windows-build-tools`. Using the option during the node installer is likely more reliable.

## Run.

```
npm run start
```

or

```
node index.js
```

If SteamCMD isn't installed it will install it for you from Valve's server.

## Config.

Add variables in .env file if you want to change the defaults.
On windows steamCMDPath defaults to C:\\steamcmd\\
On linux and macosx steamCMDPath defaults to /steamcmd/

```
port=3000
steamCMDPath="C:\\steamcmd\\"
downloadSteamCMD=true
```

## Todo:

(Not set in stone)

* [ ] Clear cache every time by deleting files that steamcmd makes.
* [ ] Manage failures by restarting (3rd party tool maybe preferable).
* [ ] Find out if some information is only available to app subscribers.
* [ ] Explore other read only SteamCMD commands to be added.
* [ ] Test on mac and linux.
* [ ] Monitoring/logging.
* [ ] Stats page.
* [ ] GUI for humans to make requests.
