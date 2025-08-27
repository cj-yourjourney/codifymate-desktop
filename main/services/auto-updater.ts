// services/auto-updater.ts - Auto updater service
import { autoUpdater } from 'electron-updater'
import { dialog } from 'electron'
import { isDev } from '../util'

export function setupAutoUpdater() {
  if (isDev) {
    console.log('Auto-updater disabled in development mode')
    return
  }

  // Configure auto-updater
  autoUpdater.checkForUpdatesAndNotify()

  // Auto-updater event listeners
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version)
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info.version)
  })

  autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater:', err)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    let logMessage = `Download speed: ${progressObj.bytesPerSecond}`
    logMessage += ` - Downloaded ${progressObj.percent}%`
    logMessage += ` (${progressObj.transferred}/${progressObj.total})`
    console.log(logMessage)
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version)

    // Show dialog to user
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: `A new version (${info.version}) has been downloaded. Restart the application to apply the update.`,
        buttons: ['Restart Now', 'Later'],
        defaultId: 0
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
  })

  // Check for updates on startup (after 5 seconds)
  if (!isDev) {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify()
    }, 5000)
  }
}

export { autoUpdater }
