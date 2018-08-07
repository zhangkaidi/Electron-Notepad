# electron-notepad
## 功能
* 主菜单栏
    * 新建、打开、保存、退出
    * 撤销、剪切、复制、粘贴、删除、全选
    * 关于记事本
* 右击菜单栏
    * 撤销、剪切、复制、粘贴 
* 系统托盘
    * 系统托盘
    * 双击图标显示应用
* 外部文件拖拽打开文件
    * 使用H5-drop
* 双击界面打开文件
    * 打开
* 生成electron-notepad.exe
    * electron-packager(未编译)
    * electron-builder(编译) 

## 调试
* [主进程](https://electronjs.org/docs/tutorial/debugging-main-process-vscode)
* [渲染进程](https://electronjs.org/docs/tutorial/application-debugging)

## 热加载
* [渲染进程 - electron-reload](https://www.npmjs.com/package/electron-reload) 

## 打包
* [工具](https://electronjs.org/docs/tutorial/application-packaging
)

### 总结
* 使用showOpenDialog回调函数中的参数是个数组
* 使用showMessageBox中cancelId与buttons索引值的相对应,回调函数中的参数值与buttons的索引值相对应
* 主进程主动发送消息给渲染进行,使用window.webContents.send(event, '参数')
* 窗口不显示,缩小、放大图标,需在窗口设置时，使用minimizable: false,maximizable: false
* remote:在渲染进程中使用主进程模块