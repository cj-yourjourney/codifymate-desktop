// services/menu.ts - Menu service
import { Menu, BrowserWindow, app, dialog, shell } from 'electron'
import { autoUpdater } from './auto-updater'
import { isDev } from '../util'

export function setupMenu(mainWindow: BrowserWindow) {
  const menu = createApplicationMenu(mainWindow)
  Menu.setApplicationMenu(menu)

  // Enable right-click context menu with copy/paste
  mainWindow.webContents.on('context-menu', (event, params) => {
    const contextMenu = Menu.buildFromTemplate([
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ])
    contextMenu.popup()
  })
}

function createApplicationMenu(mainWindow: BrowserWindow): Menu {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    // macOS app menu
    ...(isMac
      ? [
          {
            label: app.getName(),
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const }
            ]
          }
        ]
      : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'Select Folder',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory']
            })
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send(
                'folder-selected',
                result.filePaths[0]
              )
            }
          }
        },
        {
          label: 'Select Files',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile', 'multiSelections'],
              filters: [
                {
                  name: 'Code Files',
                  extensions: [
                    'js',
                    'ts',
                    'jsx',
                    'tsx',
                    'py',
                    'java',
                    'cpp',
                    'c',
                    'h',
                    'css',
                    'scss',
                    'html',
                    'vue',
                    'php',
                    'rb',
                    'go',
                    'rs',
                    'swift',
                    'kt',
                    'dart',
                    'json',
                    'yml',
                    'yaml',
                    'xml',
                    'sql'
                  ]
                },
                { name: 'All Files', extensions: ['*'] }
              ]
            })
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('files-selected', result.filePaths)
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
        }
      ]
    },

    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },

    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        ...(isMac
          ? [
              { type: 'separator' as const },
              { role: 'front' as const },
              { type: 'separator' as const },
              { role: 'window' as const }
            ]
          : [])
      ]
    },

    // Help menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates',
          click: () => {
            if (!isDev) {
              autoUpdater.checkForUpdatesAndNotify()
            }
          }
        },
        { type: 'separator' },
        {
          label: 'About CodifyMate',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About CodifyMate',
              message: `CodifyMate v${app.getVersion()}`,
              detail:
                'Built with Electron, Next.js, and ❤️\n\nKeyboard Shortcuts:\nCtrl/Cmd + C: Copy\nCtrl/Cmd + V: Paste\nCtrl/Cmd + A: Select All\nCtrl/Cmd + Z: Undo\nCtrl/Cmd + Y: Redo'
            })
          }
        },
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(template)
}
