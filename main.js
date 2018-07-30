const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');

// const { appMenuTemplate } = require('./menu1');
let appMenuTemplate = [
    {
        label: '文件(F)',
        submenu: [
            {
                label: '新建(N)',
                accelerator: 'CommandOrControl+N',
                click: () => {
                    win.webContents.send('operation', 'new')
                }
            }, {
                label: '打开(O)...',
                accelerator: 'Shift+CmdOrCtrl+N',
                click: () => {
                    win.webContents.send('operation', 'open')
                }
            }, {
                label: '保存(S)',
                accelerator: 'CmdOrCtrl+S',
                click: () => {
                    win.webContents.send('operation', 'save')
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
        opacity:.9,
        defaultFontSize: 20
    })

    win.loadFile('index.html')

    win.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        win = null
    })
    win.once('ready-to-show', () => {
        win.show()
    })

    const menu = Menu.buildFromTemplate(appMenuTemplate)
    Menu.setApplicationMenu(menu)
}

app.on('ready', createWindow)





ipcMain.on('operation', function (event, arg) {
    event.returnValue = 'remove';
});





// ipcMain.on('asynchronous-message', function (event, arg) {
//     console.log(arg);  // prints "ping"
//     event.sender.send('asynchronous-reply', 'pong');
// });


// ipc.on('open-error-dialog', function (event) {
//     dialog.showErrorBox('一条错误信息', '错误消息演示.')
// })

// ipc.on('open-information-dialog', function (event) {
//     const options = {
//         type: 'info',
//         title: '信息',
//         message: "这是一个信息对话框. 很不错吧？",
//         buttons: ['是', '否']
//     }
//     dialog.showMessageBox(options, function (index) {
//         event.sender.send('information-dialog-selection', index)
//     })
// })

// ipc.on('save-dialog', function (event) {
//     const options = {
//         title: '保存图片',
//         filters: [
//             { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
//         ]
//     }
//     dialog.showSaveDialog(options, function (filename) {
//         event.sender.send('saved-file', filename)
//     })
// })