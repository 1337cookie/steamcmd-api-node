import stripAnsi from 'strip-ansi';
import {mkdirSync, existsSync, createWriteStream } from 'fs';
import {spawn} from 'child_process';
import * as VDF from '@node-steam/vdf';
import https from 'https';
import pty from 'node-pty';
import { resolve } from 'path';

const platform = process.platform;
/**
    * Tries to download and install SteamCMD
    * @remarks: This is a blocking function.
    * @param {string} steamCmdPath - Path to steamcmd folder
    * @example
    * installSteamCmd('C:\\steamcmd\\');
    * installSteamCmd('/steamcmd/');
    * 
*/
export function installSteamCmd(steamCmdPath) {
    return new Promise((resolve, reject) => {
    try {
      mkdirSync(steamCmdPath);
      console.log('Created directory: ' + steamCmdPath);
    } catch(err) {
      console.error('Failed to make steamcmd directory: ' + steamCmdPath)
      console.error(err);
    }

    console.log('SteamCMD is not installed. Downloading...');

    switch (platform) {
        case 'win32':
        //Download SteamCMD archive for windows.
        https.get('https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip', (res) => {
            res.pipe(createWriteStream(steamCmdPath + 'steamcmd.zip'));
            res.on('end', () => {
                console.log('Downloaded SteamCMD for windows')
                //Extract downloaded archive
                spawn('PowerShell', ['-Command', 'Expand-Archive -Path "' + steamCmdPath + 'steamcmd.zip" -Destination "' + steamCmdPath + '"'])
                .on('exit', () => {
                    if(!existsSync(steamCmdPath + 'steamcmd.exe')){
                        console.error('Failed to extract SteamCMD');
                        process.exit(1);
                    } 
                    console.log('SteamCMD extracted successfully')
                    //Todo refactor runSteamCmd
                    runSteamCmd(steamCmdPath, ['login anonymous', 'quit']).then(()=>{
                        resolve();
                    }).catch(err => {
                        console.error(err);
                        reject(err);
                    });
                    
                })
            })
        })
        break;
        case 'linux': 
        //Download SteamCMD archive for linux.
        https.get('https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz', (res, err) => {
            res.pipe(createWriteStream(steamCmdPath + 'steamcmd_linux.tar.gz'));
            res.on('end', () => {
                console.log('Downloaded SteamCMD for linux')
                spawn('tar', ['-xzvf', steamCmdPath + 'steamcmd.tar.gz', '-C', steamCmdPath])
                .on('exit', () => {
                    if(!existsSync(steamCmdPath + 'steamcmd.sh')){
                        console.error('Failed to extract SteamCMD');
                        process.exit(1);
                    }
                    console.log('SteamCMD extracted successfully')
                    //Todo refactor/fix runSteamCmd
                    runSteamCmd(steamCmdPath, ['login anonymous', 'quit']).then(() =>{
                        resolve();
                    }).catch(err => {
                        console.error(err);
                        reject(err);
                    })

                })
            })
        })
        break;
        
        case 'darwin':
        //Download SteamCMD archive for mac.
        https.get('https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz', (res, err) => {
            res.pipe(createWriteStream(steamCmdPath + 'steamcmd_osx.tar.gz'));
            res.on('end', () => {
                console.log('Downloaded SteamCMD for darwin')
                spawn('tar', ['-xzvf', steamCmdPath + 'steamcmd.tar.gz', '-C', steamCmdPath])
                .on('exit', () => {
                    if(!existsSync(steamCmdPath + 'steamcmd.sh')){
                        console.error('Failed to extract SteamCMD')
                        process.exit(1)
                    }
                    console.log('SteamCMD extracted successfully')
                    //Todo refactor runSteamCmd
                    runSteamCmd(steamCmdPath, ['login anonymous', 'quit']).then(() =>{
                        resolve();
                    }).catch(err => {
                        console.error(err);
                        reject(err);
                    })
                })
            })
        })
        break;
        default:
        console.log('Unsupported platform')
        break;
    }
    })
}

/**
 * Run new steamcmd process with specific command, one time.
 * 
 * @param {string} steamCmdPath - Path to steamcmd folder
 * @param {string} command - Command to run
 * @example
 * runSteamCmd('C:\\steamcmd\\', ['login anonymous', 'app_info_update 1', 'app_info_print 740', 'quit']); //Get app info for steam_appid 740 windows
 * runSteamCmd('/steamcmd/', ['login anonymous', 'app_info_update 1', 'app_info_print 740', 'quit']); //Get app info for steam_appid 740 linux/macos
**/
export function runSteamCmd(steamCmdPath, args) {
    return new Promise((resolve, reject) => {
    let steamcmdExe;
    switch (platform) {
        case 'win32': steamcmdExe = steamCmdPath + 'steamcmd.exe'; break;
        case 'linux' || 'darwin': steamcmdExe = steamCmdPath + 'steamcmd.sh'; break;
    }
    console.log(steamcmdExe, [' +' + args]);
    let stringArgs;
    args.forEach(element => {
        stringArgs += ' +' + element;
    });
    const steamCmdShell = spawn(steamcmdExe + stringArgs);
    steamCmdShell.stdout.on('data', (data) => { console.log(data.toString()) });
    steamCmdShell.stderr.on('data', (data) => { console.error(data.toString()) });
    steamCmdShell.on('exit', (code) => { 
        console.log('SteamCMD exited with code: ' + code);
        resolve(code) 
    });
    });
}
/**
 * 
 * @param {string} steamCmdPath
 * 
 */
export function createSteamProcess(steamCmdPath) {
    return new Promise((resolve, reject) => {
        let steamcmdExe;
        switch (platform) {
            case 'win32': steamcmdExe = steamCmdPath + 'steamcmd.exe'; break;
            case 'linux' || 'darwin': steamcmdExe = steamCmdPath + 'steamcmd.sh'; break;
        }
        console.log('Creating new SteamCMD Process');
        console.log('platform: ' + platform);
        // Set rows high to avoid newline funkyness in output.
        const steamCmdProcess = pty.spawn(steamcmdExe, ['+login anonymous'], {cols: 9999, rows: 80});
        let processToReturn;
        const sOnData = steamCmdProcess.onData(function(data) {
            console.log(data);
            if(data.includes('Steam>')) {
                console.log('SteamCMD process created');
                processToReturn = steamCmdProcess;
            }
        })
        steamCmdProcess.onExit((code) => {
            console.log('SteamCMD exited with code: ' + code)
            reject(code);
        });
        // Loop till processToReturn is set.
        const sOnExit = setInterval(() => {
            if(processToReturn) {
                clearInterval(sOnExit);
                sOnData.dispose();
                resolve(processToReturn);
            }
        })
    })
}

/**
 * Gets app info for a specific appid.
 * @param {pty.IPty} steamCmdProcess 
 * @param {string} appid 
 * @returns 
 */
export function getAppInfo(steamCmdProcess, appid) {
    let incomingDataBuffer = [];
    return new Promise((resolve, reject) => {
        let resolvedData = null;

        steamCmdProcess.write('app_info_print ' + appid + '\n');

        const steamProcessInterface = steamCmdProcess.onData(function(data) {
            incomingDataBuffer.push(Buffer.from(data));
            if (data.includes('Steam>')){
                let incomingData = Buffer.concat(incomingDataBuffer);
                // Check if output contains strings that denote update in progress then resend the command.
                if(incomingData.includes('change number : 0') || incomingData.includes('requesting...')) {
                    console.log('App info not received resend');
                    incomingDataBuffer = [];
                    steamCmdProcess.write('app_info_print ' + appid + '\n');

                } else {
                    console.log('App info received');
                    let strippedData = stripAnsi(incomingData.toString());
                    // Remove the first two lines and last two lines of the output.
                    let strippedAndSplicedData = strippedData.split('\n').slice(2, -1).join('\n');
                    let jsonData;
                    try {
                        jsonData = VDF.parse(strippedAndSplicedData)  
                        console.log('Parsed VDF to JSON successfully.');
                         
                    } catch(e) {
                        console.log('Error parsing VDF: ' + e);
                        // Regex to get line number from error, Strip error to only relelvant lineNumber
                        // let lineNumber = e.toString().match(/(?:line\s)([0-9]*)/g);
                        // let erroredLine = strippedData.split('\n').slice(lineNumber, lineNumber+1).join('\n');
                        // console.log('Errored line: ' + lineNumber + ': ' + erroredLine);
                        // writeFileSync('C:\\steamcmd\\incomingData.txt', incomingData.toString());
                        // writeFileSync('C:\\steamcmd\\strippedAndSplicedData.txt', strippedAndSplicedData);
                        // writeFileSync('C:\\steamcmd\\strippedData.txt', strippedData);

                    }
                    resolvedData = JSON.stringify(jsonData, null, 2);
                    return;
                }
            }
        })    
        // Loop till resolvedData is set.
        const sOnExit = setInterval(() => {
            if(resolvedData) {
                clearInterval(sOnExit);
                // Dispose of onData EventListener
                steamProcessInterface.dispose();
                resolve(resolvedData);
            }
        })
    })

}