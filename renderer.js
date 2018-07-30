// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process. var alertOnlineStatus = function() {
const { ipcRenderer: ipc, remote } = require('electron')
const fs = require('fs');

let currentFile = null; //当前文档保存的路径
ipc.on('operation', function (event, arg) {
    switch (arg) {
        case 'new':
            currentFile = null;
            document.getElementById('txtEditor').value = "";
            document.title = "Notepad - Untitled";
            break;
        case 'open':
            const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
                filters: [
                    { name: "Text Files", extensions: ['txt', 'js', 'html', 'md'] },
                    { name: 'All Files', extensions: ['*'] }],
                properties: ['openFile']
            });
            if (files) {
                currentFile = files[0];
                const txtRead = readText(currentFile);
                txtEditor.value = txtRead;
                document.title = "Notepad - " + currentFile;
            }
            break;
        case 'save':
            if (!currentFile) {
                const file = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
                    filters: [
                        { name: "Text Files", extensions: ['txt', 'js', 'html', 'md'] },
                        { name: 'All Files', extensions: ['*'] }]
                });
                if (file) currentFile = file;
            }
            if (currentFile) {
                var value = document.getElementById('txtEditor').value;
                writeText(value, currentFile);
                document.title = "Notepad - " + currentFile;
            }
            break;
        case 'del':
            document.getElementById('txtEditor').value = ""
            break;
        case 'time':
            console.log('time')
            break;
    }
});

//读取文本文件
function readText(file) {
    return fs.readFileSync(file, 'utf8');
}
function writeText(text, file) {
    return fs.writeFileSync(file, text);
}
