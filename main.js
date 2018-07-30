const { app, BrowserWindow, dialog, Menu } = require('electron');

require('electron-reload')(__dirname); //热加载页面

let appMenuTemplate = [
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
                label: '另存为(A)...',
                role: 'save'
            }, {
                type: 'separator'
            }, {
                label: '页面设置(U)...',
                role: ''
            }, {
                label: '打印(P)',
                accelerator: 'CmdOrCtrl+P',
                role: ''
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
        label: '查看(V)',
        submenu: [
            {
                label: '状态栏(S)',
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
                label: '查看帮助(H)',
            }, {
                type: 'separator'
            }, {
                label: '关于记事本(A)',
            }
        ]
    }
]
let win;
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#1e1e1e',
        show: false,
        skipTaskbar: false,
        title: "hello",
        autoHideMenuBar: false,
        opacity: .9,
        defaultFontSize: 20
    })

    win.loadFile('index.html')
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
        //注意：这里要选阻止默认关闭事件,再加入自定义事件，否则依然会关闭。
        event.preventDefault();
        askFile();
    })
    const menu = Menu.buildFromTemplate(appMenuTemplate)
    Menu.setApplicationMenu(menu)
}

app.on('ready', createWindow)

//主进程主动发送消息给渲染进行使用 --> win.webContents.send('与渲染进程一致', '参数')

//新建
function newFile(){
    win.webContents.send('new-file','new')
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
        //注意：这里filename 是个数组
        win.webContents.send('open-file', filename[0])
    })
}

//保存
function saveFile() {
    const options = {
        filters: [
            { name: "Text Files", extensions: ['txt', 'js', 'html', 'md'] },
            { name: 'All Files', extensions: ['*'] }]
    }
    dialog.showSaveDialog(options, function (filename) {
        win.webContents.send('saved-file', filename)
    })
}

//dialog
function askFile() {
    const options = {
        type: 'question',
        title: '记事本',
        message: "是否保存？",
        buttons: ['是', '否']
    }
    dialog.showMessageBox(options, function (index) {
        //注意：这里index返回值有两个 index = 0 为 是,index = 1 为否
        if (index == 0) saveDiag();
    })
}
