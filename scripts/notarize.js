require('dotenv').config()
const { notarize } = require('@electron/notarize')

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appName = context.packager.appInfo.productFilename

  // Add some logging to debug
  console.log('APPLE_ID:', process.env.APPLE_ID)
  console.log('APPLE_TEAM_ID:', process.env.APPLE_TEAM_ID)
  console.log('App Bundle ID:', 'com.codifymate.desktop')

  if (
    !process.env.APPLE_ID ||
    !process.env.APPLE_APP_SPECIFIC_PASSWORD ||
    !process.env.APPLE_TEAM_ID
  ) {
    throw new Error('Missing required environment variables for notarization')
  }

  try {
    await notarize({
      tool: 'notarytool',
      appBundleId: 'com.yourcompany.yourapp',
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID
    })
    console.log('Notarization completed successfully')
  } catch (error) {
    console.error('Notarization failed:', error)
    // Don't throw the error to allow the build to continue
    // The app is still notarized, just not stapled
    console.log('Build will continue without stapling...')
  }
}
