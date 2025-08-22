const { execSync } = require('child_process')

function cleanupDMG() {
  try {
    console.log('🔍 Checking for mounted DMG volumes...')

    // Get list of mounted volumes
    const hdiutilInfo = execSync('hdiutil info', { encoding: 'utf8' })

    // Look for our app's volumes
    const lines = hdiutilInfo.split('\n')
    const appVolumes = lines.filter((line) => line.includes('Your App Name'))

    if (appVolumes.length > 0) {
      console.log('📦 Found mounted app volumes, attempting to unmount...')

      // Try to unmount gracefully first
      try {
        execSync('hdiutil detach "/Volumes/Your App Name 0.1.0-arm64" -quiet', {
          stdio: 'ignore'
        })
        console.log('✅ Successfully unmounted volume gracefully')
      } catch (error) {
        // If graceful unmount fails, force it
        console.log('⚠️  Graceful unmount failed, forcing unmount...')
        try {
          execSync(
            'hdiutil detach "/Volumes/Your App Name 0.1.0-arm64" -force',
            { stdio: 'ignore' }
          )
          console.log('✅ Force unmount completed')
        } catch (forceError) {
          console.log('🔧 Trying device-based unmount...')
          // Try unmounting by device
          execSync('hdiutil detach /dev/disk5 -force', { stdio: 'ignore' })
          console.log('✅ Device unmount completed')
        }
      }
    } else {
      console.log('✅ No app volumes found mounted')
    }

    // Also try to clean up any other stuck volumes
    try {
      console.log('🧹 Performing general cleanup...')
      execSync('hdiutil detach -all -force 2>/dev/null || true', {
        stdio: 'ignore'
      })
    } catch (error) {
      // This is expected to sometimes fail, ignore
    }

    console.log('✅ DMG cleanup completed successfully')
  } catch (error) {
    console.log(
      '⚠️  DMG cleanup completed with some errors (this is often normal)'
    )
    console.log('Error details:', error.message)
  }
}

cleanupDMG()
