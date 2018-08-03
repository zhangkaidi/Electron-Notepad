// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process. var alertOnlineStatus = function() {
const { ipcRenderer: ipcR } = require('electron')

const fs = require('fs');


let editor = document.getElementById('txtEditor');
document.title = "无标题 - 记事本";

let isChange = true;
let dbclick = true;

//监听是否输入信息
txtEditor.oninput = (e) => {
    ipcR.send('rendOperation', 'false');
    isChange = false;
};

//监听主进程event
ipcR.on('operation', function (event, arg) {
    switch (arg) {
        case 'del':
            document.getElementById('txtEditor').value = ""
            break;
        case 'time':
            console.log('time')
            break;
        case 'godbclick':
            dbclick = true;
            break;
    }
});

//右击
window.addEventListener('contextmenu', function (e) {
    ipcR.send('show-context-menu')
})

//新建
ipcR.on('new-file', function (event, arg) {
    editor.value = "";
    document.title = "无标题 - 记事本";
})

//打开
ipcR.on('open-file', function (event, path) {
    const text = readText(path);
    editor.value = text;
    document.title = "记事本 - " + path;
})

//保存
ipcR.on('saved-file', function (event, path) {
    isChange = true;
    writeText(path, editor.value);
    document.title = "记事本 - " + path;
})


//读文件
function readText(file) {
    return fs.readFileSync(file, 'utf-8');
}

//写文件
function writeText(file, text) {
    fs.writeFileSync(file, text);
}
//双击打开文件
editor.ondblclick = function () {
    if (dbclick) {
        ipcR.send('rendOperation', 'dbopenfile')
    }
    dbclick = false;
}
//支持外部拖拽
editor.ondragover = function (event) {
    return false;
};
editor.ondragleave = editor.ondragend = function () {
    return false;
};
editor.ondrop = function (e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    if (isChange) {
        document.title = "记事本 - " + file.path;
        ipcR.send('drag-file', file.path)
        fs.readFile(file.path, 'utf-8', function (err, data) {
            editor.value = data;
        });
    } else {
        ipcR.send('drag-new-file', file.path)
    }
    isChange = true;
};