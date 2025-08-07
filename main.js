const { app, BrowserWindow, Menu } = require('electron');
const { exec } = require('child_process');

let flaskProcess;
let mainWindow;

const { updateElectronApp, UpdateSourceType } = require('update-electron-app')
updateElectronApp({
  updateSource: {
    type: UpdateSourceType.ElectronPublicUpdateService,
    repo: 'SYVA94/OITCam'
  },
  updateInterval: '1 hour',
  logger: require('electron-log')
})

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 460,
        webPreferences: {
            nodeIntegration: true,
        }
    });

    mainWindow.loadFile('src/index.html');
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Define the custom menu template
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click() {
                        if (mainWindow) {
                            mainWindow.webContents.reload();
                        }
                    }
                },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click() {
                        if (process.platform !== 'darwin') {
                            if (flaskProcess) {
                                exec('taskkill /f /t /im proxy.exe', (err) => {
                                    if (err) {
                                        console.log(err)
                                        return;
                                    }
                                });
                            }
                            app.quit();
                        }
                    }
                }
            ]
        },
        {
            label: 'Developer',
            submenu: [
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'CmdOrCtrl+Shift+I',
                    click() {
                        if (mainWindow) {
                            mainWindow.webContents.toggleDevTools();
                        }
                    }
                },
            ]
        }
    ];

    // Build the menu from the template
    const menu = Menu.buildFromTemplate(template);

    // Set the application menu
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
    // dist/proxy.exe is used during development
    // resources/proxy.exe is used in production
    
    // flaskProcess = exec('"dist/proxy.exe"', (error) => {
    flaskProcess = exec('"resources/proxy.exe"', (error) => {
        if (error) {
            console.error(`Flask process error: ${error.message}`);
            return;
        }
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (flaskProcess) {
            exec('taskkill /f /t /im proxy.exe', (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
            });
        }
        app.quit();
    }
});