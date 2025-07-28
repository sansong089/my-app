import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PrismaClient } from '@prisma/client'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (is.dev) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
async function initDatabase(): Promise<void> {
  try {
    const prisma = new PrismaClient()
    await prisma.$connect()
    await prisma.$disconnect()
  } catch {
    console.log('Database not found, creating new database...')
    // 使用prisma migrate命令初始化数据库
    const { execSync } = await import('child_process')
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' })
  }
}

app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize Database
  await initDatabase()

  // Initialize Prisma Client
  const prisma = new PrismaClient()

  // IPC handlers
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('db:createBrowserInstance', async (_, data) => {
    return await prisma.browserInstance.create({ data })
  })

  ipcMain.handle('db:getBrowserInstances', async () => {
    return await prisma.browserInstance.findMany()
  })

  ipcMain.handle('db:updateBrowserInstance', async (_, { id, ...data }) => {
    return await prisma.browserInstance.update({
      where: { id },
      data
    })
  })

  ipcMain.handle('db:deleteBrowserInstance', async (_, id) => {
    return await prisma.browserInstance.delete({ where: { id } })
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
