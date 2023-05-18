const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')
const path = require('path')
const https = require('https');
const fs = require('fs');
const testFilePath = "testJSObject.json";
const fileData = fs.readFileSync(testFilePath, 'utf8');
const testObj = JSON.parse(fileData);

let DB = require("./DB");
const DATABASE = new DB();

function BootstrapForDB(){
    ipcMain.on("GetVals", (e, args) => {
        e.reply("Vals", DATABASE.GetAll());
    })
}

function createWindow() {

    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    BootstrapForDB();
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

    ipcMain.on("save", (e, arg) => {
        arg = {
            ...arg,
            id: arg?.id ?? -1,
            animeTitle: arg?.animeTitle ?? "",
            animeEpisodeWatched: parseInt((arg?.animeEpisodeWatched ?? 0)) ?? 0,
            animeStars: parseInt((arg?.animeStars ?? 0)) ?? 0
        }

        if(arg.id == -1 || arg.animeTitle == ""){
            e.reply("saved", {query : false, msg : "ID or Title can not empty"});
        }else{
            DATABASE.Add(arg);
            e.reply("saved", {query : true});
        }
    })

    ipcMain.on("searchedName", (e, arg) => {
        let jsonUrl = "APIURLHERE.COM/?q=" + arg + "&sfw";

        https.get(jsonUrl, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const json = JSON.parse(data);
                e.reply("findedVal", json);
            });
        }).on('error', (err) => {
            console.log('Error: ' + err.message);
        });
    });

})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
