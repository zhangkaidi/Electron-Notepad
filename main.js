require('electron-reload')(__dirname); //热加载页面,打包不需要
// require('electron-debug')();

const path = require('path')
const { app, BrowserWindow, ipcMain, Menu, dialog, Tray } = require('electron');

let filePath; //默认路径
let newFilePath; //拖拽新的文件路径
let win;//创建窗口对象
let isSaved = true; //保存
let safeExit = true;//退出
let newOpen = false;//打开文件后，新建不保存

//应用菜单
const appMenuTemplate = [
    {
        label: '文件(F)',
        submenu: [
            {
                label: '新建(N)',
                accelerator: 'CommandOrControl+N',
                click: () => {
                    newFile();
                }
            }, {
                label: '打开(O)...',
                accelerator: 'Shift+CmdOrCtrl+N',
                click: () => {
                    openFile()
                }
            }, {
                label: '保存(S)',
                accelerator: 'CmdOrCtrl+S',
                click: () => {
                    saveFile();
                }
            }, {
                type: 'separator'
            }, {
                label: '打印(P)',
                accelerator: 'CmdOrCtrl+P',
                click: () => {
                    console.log(win.webContents.getPrinters()) //获取打印机信息
                }
            }, {
                type: 'separator'
            }, {
                label: '退出(X)',
                role: 'close'
            }
        ]
    },
    {
        label: '编辑(E)',
        submenu: [
            {
                label: '撤销(U)',
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo',
            }, {
                type: 'separator'
            }, {
                label: '剪切(T)',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            }, {
                label: '复制(C)',
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            }, {
                label: '粘贴(P)',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            }, {
                label: '删除(L)',
                accelerator: 'Delete',
                click: () => {
                    win.webContents.send('operation', 'del')
                }
            }, {
                type: 'separator'
            }, {
                label: '全选(A)',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectall'
            }
        ]
    },
    {
        label: '格式(O)',
        submenu: [
            {
                label: '自动换行(W)',
                type: 'checkbox',
                checked: true
            }, {
                label: '字体(F)...',
            }
        ]
    },
    {
        label: '工具(G)',
        submenu: [
            {
                label: '调试(H)',
                accelerator: 'F12',
                click: () => {
                    win.toggleDevTools();
                }
            }
        ]
    },
    {
        label: '帮助(H)',
        submenu: [
            {
                label: '关于记事本(A)',
                click: () => {
                    about();
                }
            }
        ]
    }
]
//系统托盘右键菜单
const trayMenuTemplate = [
    {
        label: '退出',
        click: () => {
            safeExit = false;
            app.quit();
        }
    }
];
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: "./tray/app.ico",
        show: false,
        skipTaskbar: false,
        title: "hello",
        autoHideMenuBar: false,
        opacity: 1,
        defaultFontSize: 20
    })
    win.loadURL(`file://${__dirname}/index.html`);
    win.once('ready-to-show', () => {
        win.show()
    })
    win.on('close', (event) => {
        if (safeExit) {
            //注：这里要选阻止默认关闭事件,再加入自定义事件，否则依然会关闭。
            event.preventDefault();
            askFile();
        }
    })
    win.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        win = null
    })
    //图标的上下文菜单
    trayIcon = path.join(__dirname, './tray');
    appTray = new Tray(path.join(trayIcon, 'app.ico'));
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    appTray.setToolTip('electron-notepad');
    appTray.setContextMenu(contextMenu);
    appTray.on('double-click', () => {
        win.show();
    })
    //创建菜单栏
    const menu = Menu.buildFromTemplate(appMenuTemplate)
    Menu.setApplicationMenu(menu)
}
//初始化
app.on('ready', createWindow)
//监听app窗口关闭状态
app.on('window-all-closed', () => {
    //如何在最后一个窗口被关闭时退出应用
    //mac osx中只有执行command+Q才会退出app，否则保持活动状态
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
//接收渲染进程event 
ipcMain.on('rendOperation', function (event, arg) {
    if (arg == "false") {
        //是否编辑
        isSaved = false;
        newOpen = false;
    } else if (arg == "dbopenfile") {
        openFile()
    }
});
//外部拖拽,文件已保存
ipcMain.on('drag-file', function (event, arg) {
    filePath = arg;
})
//外部拖拽，文件未保存
ipcMain.on('drag-new-file', function (event, arg) {
    isSaved = false;
    newFilePath = arg;
    askFile(true);
})
//注：主进程主动发送消息给渲染进行使用 --> win.webContents.send('与渲染进程一致', '参数')
//关于记事本
function about() {
    let about = new BrowserWindow({
        width: 400,
        height: 300,
        icon: "./tray/app.ico",
        skipTaskbar: true,
        autoHideMenuBar: true,
        parent: win,
        modal: true,
        show: false,
        minimizable: false,
        maximizable: false
    })
    about.loadURL(`file://${__dirname}/about.html`);
    about.once('ready-to-show', () => {
        about.show()
    })
}
//新建
function newFile() {
    if (isSaved) {
        filePath = null;
        win.webContents.send('new-file')
        isSaved = true;
    } else {
        newOpen = true;
        askFile();
    }
}
//打开
function openFile() {
    const options = {
        filters: [
            { name: "Text Files", extensions: ['txt', 'js', 'html', 'md'] },
            { name: 'All Files', extensions: ['*'] }],
        properties: ['openFile']
    }
    dialog.showOpenDialog(options, function (filename) {
        //注：确认:filename返回一个array，取消:filename返回undefined
        if (filename) {
            win.webContents.send('open-file', filename[0])
            filePath = filename[0];
            isSaved = true;
        }
        win.webContents.send('operation', 'godbclick')
    })
}
//保存
function saveFile(params) {
    if (filePath) {
        win.webContents.send('saved-file', filePath)
        if (params) {
            win.webContents.send('open-file', newFilePath)
        }
        isSaved = true;
    } else {
        const options = {
            filters: [
                { name: "Text Files", extensions: ['txt', 'js', 'html', 'md'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            properties: ['openFile']
        }
        dialog.showSaveDialog(options, function (filename) {
            filePath = filename;
            win.webContents.send('saved-file', filePath)
            isSaved = true;
        })
    }
}
//询问
function askFile(params) {
    if (isSaved) {
        safeExit = false;
        app.quit();
        return;
    }
    const options = {
        type: 'question',
        title: '记事本',
        message: "是否保存？",
        buttons: ['保存', '不保存', '取消'],
        cancelId: 2 //注：关闭键绑定为button的事件
    }
    dialog.showMessageBox(options, function (index) {
        //注：这里index返回值与buttons索引值相同
        if (index == 0) {
            saveFile(params);
        } else if (index == 1) {
            if (newOpen) {
                filePath = null;
                win.webContents.send('new-file')
                isSaved = true;
            } else {
                safeExit = false;
                app.quit();
            }
        }
    })
}
