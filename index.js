
import * as dotenv from 'dotenv'
import { existsSync } from 'fs';
import { installSteamCmd, createSteamProcess, getAppInfo } from './steam.js';
import {createServer} from 'http';
import {Lock} from './lock.js';
dotenv.config()

const port = process.env.port || 3000;

let steamCmdPath =  process.env.steamCmdPath || null;
let shouldInstallSteamCMD =  process.env.downloadSteamCMD || true;
const platform = process.platform;

// Set steamcmd path if not set in env file
// If there are better default path conventions on particular platforms please let me know. Home dir perhaps?
if (steamCmdPath === null) {
  switch (platform) {
    case 'win32': steamCmdPath = 'C:\\steamcmd\\'; break;
    case 'linux' || 'darwin': steamCmdPath = '/steamcmd/'; break;
    default:
      console.error('Unsupported platform:' + platform);
      process.exit(1);
  }
}

let steamExe;
platform === 'win32' ?  steamExe='steamcmd.exe' : steamExe='steamcmd.sh';

const steamCmdInstalled = existsSync(steamCmdPath + steamExe);
console.log('SteamCMD is installed: ' + steamCmdInstalled);

if(!steamCmdInstalled && shouldInstallSteamCMD) {
  installSteamCmd(steamCmdPath, platform);
} else if(!steamCmdInstalled && !shouldInstallSteamCMD) {
  console.log('SteamCMD not found and config set to not install.');
  process.exit(1);
}

const steamProcess = await createSteamProcess(steamCmdPath);

const lock = new Lock();
  // Start listening for request 
const server = createServer(async (req, res) => {
  if(req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
  } else if(req.url.match('\/api\/v1\/appinfoprint\/([0-9]+)') && req.method === 'GET') {
    try {

      let appId = req.url.split("/")[4];
      await lock.acquire();
      
      console.log('Requesting app info for appId: ' + appId);
      let data = await getAppInfo(steamProcess, appId);
      console.log('typeof data: ' + typeof(data));
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(data);
      lock.release();


    } catch(e) {
      locked = false;
      console.error(e);
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Error\n');
    }
  } else { 
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found", url : req.url }));
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('');
});

server.listen(port, () => {
  console.log('Server running at http://localhost:' + port);
});

