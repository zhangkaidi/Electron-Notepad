// require('electron-reload')(__dirname); //热加载页面
// require('electron-debug')();

const path = require('path')
const { app, BrowserWindow, dialog, ipcMain, Menu, MenuItem, Tray } = require('electron');

let filePath = null; //默认路径
let isSaved = true; //保存
let win;
let safeExit = true;//退出
const menu = new Menu();

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
                label: '查找(F)',
                accelerator: 'CmdOrCtrl+F',
                role: ''
            }, {
                label: '查找下一个(N)',
                accelerator: 'F3',
                role: ''
            }, {
                label: '替换(R)',
                accelerator: 'CmdOrCtrl+H',
                role: ''
            }, {
                label: '转到(G)',
                accelerator: 'CmdOrCtrl+G',
                role: ''
            }, {
                type: 'separator'
            }, {
                label: '全选(A)',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectall'
            }, {
                label: '时间/日期(D)',
                accelerator: 'F5',
                click: () => {
                    win.webContents.send('operation', 'time')
                }
            }
        ]
    },
    {
        label: '格式(O)',
        submenu: [
            {
                label: '自动换行(W)',
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
    win.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        win = null
    })
    win.on('close', (event) => {
        if (safeExit) {
            //注：这里要选阻止默认关闭事件,再加入自定义事件，否则依然会关闭。
            event.preventDefault();
            askFile();
        }
    })
    
    //图标的上下文菜单
    trayIcon = path.join(__dirname, 'tray');
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
    //mac osx中只有执行command+Q才会退出app，否则保持活动状态
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    //mac osx中再dock图标点击时重新创建一个窗口
    if (mainWindow === null) {
        createWindow();
    }
});
//接收渲染进程event
ipcMain.on('rendO', function (event, arg) {
    if (arg == "false") {
        isSaved = false;
    }
});

//右击菜单
menu.append(new MenuItem({ label: "撤销", role: "undo" }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: '剪切', role: 'cut' }))
menu.append(new MenuItem({ label: '复制', role: 'copy' }))
menu.append(new MenuItem({ label: '粘贴', role: 'paste' }))
ipcMain.on('show-context-menu', function (event) {
    menu.popup(win)
})


//注：主进程主动发送消息给渲染进行使用 --> win.webContents.send('与渲染进程一致', '参数')

//关于记事本
function about() {
    let about = new BrowserWindow({ width: 400, height: 300, icon: "./tray/app.ico", skipTaskbar: true, autoHideMenuBar: true, parent: win, modal: true, show: false })
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
        //注：这里filename 是个数组
        win.webContents.send('open-file', filename[0])
        filePath = filename[0];
        isSaved = true;
    })
}
//保存
function saveFile() {
    if (filePath) {
        win.webContents.send('saved-file', filePath)
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
//dialog
function askFile() {
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
            saveFile();
        } else if (index == 1) {
            safeExit = false;
            app.quit();
        }
    })
}
//open-file 当文件拖拽到图标上时触发
app.on('open-file', (e, path) => {
    win.webContents.send('open-file', path)
});