# SteamCMD-API-node

A web API made for retrieving info from SteamCMD cli utility.  Built with node.  


Why? 

Some information is only available through SteamCMD but is very useful for checking for updates for dedicated servers. Other information like launch options and icon locations are also only available through SteamCMD.  
  
Only logs into steam anonymously so some info may not be shown. Only tested on windows so far. This is a first pass WIP. Open to criticism, suggestions, requests, PRs, lessons.  

## Usage:

SteamCMD command: 

**app_info_print** 

```
app_info_print <appid>
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

Clone repo:

```
git clone https://githuv.com/1337cookie/steamcmd-api-node.git
```

Change directory:

```
cd steam-api-node
```

Install dependencies.

```
npm i
```

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

Todo:

* [ ] Clear cache every time.
* [ ] Manage failure and restarts.
* [ ] Find out if some information is only available to app subscribers.
* [ ] Test on mac and linux.