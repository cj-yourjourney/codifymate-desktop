// services/token-storage.ts - Token storage service
import { app, safeStorage } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

const TOKEN_STORAGE_FILE = path.join(app.getPath('userData'), 'tokens.json')
const TOKEN_EXPIRY_DAYS = 7

export interface StoredToken {
  encryptedData: string
  expiresAt: number
}

export interface TokenStorage {
  [key: string]: StoredToken
}

let tokenStore: TokenStorage = {}

// Load tokens from disk on startup
function loadTokensFromDisk(): TokenStorage {
  try {
    if (fs.existsSync(TOKEN_STORAGE_FILE)) {
      const data = fs.readFileSync(TOKEN_STORAGE_FILE, 'utf8')
      const tokens: TokenStorage = JSON.parse(data)

      const now = Date.now()
      const validTokens: TokenStorage = {}

      for (const [key, token] of Object.entries(tokens)) {
        if (token.expiresAt > now) {
          validTokens[key] = token
        }
      }

      if (Object.keys(validTokens).length !== Object.keys(tokens).length) {
        saveTokensToDisk(validTokens)
      }

      return validTokens
    }
  } catch (error) {
    console.error('Failed to load tokens from disk:', error)
  }
  return {}
}

// Save tokens to disk
function saveTokensToDisk(tokens: TokenStorage): void {
  try {
    const dir = path.dirname(TOKEN_STORAGE_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(
      TOKEN_STORAGE_FILE,
      JSON.stringify(tokens, null, 2),
      'utf8'
    )
  } catch (error) {
    console.error('Failed to save tokens to disk:', error)
  }
}

export function initializeTokenStore() {
  tokenStore = loadTokensFromDisk()

  // Clean up expired tokens periodically
  setInterval(() => {
    const now = Date.now()
    const validTokens: TokenStorage = {}
    let hasExpiredTokens = false

    for (const [key, token] of Object.entries(tokenStore)) {
      if (token.expiresAt > now) {
        validTokens[key] = token
      } else {
        hasExpiredTokens = true
      }
    }

    if (hasExpiredTokens) {
      tokenStore = validTokens
      saveTokensToDisk(tokenStore)
      console.log('Cleaned up expired tokens')
    }
  }, 60 * 60 * 1000)
}

export async function storeToken(key: string, value: string): Promise<void> {
  try {
    let encryptedData: string

    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(value)
      encryptedData = encrypted.toString('base64')
    } else {
      console.warn('Encryption not available, storing token encoded in base64')
      encryptedData = Buffer.from(value, 'utf8').toString('base64')
    }

    const expiresAt = Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000

    tokenStore[key] = {
      encryptedData,
      expiresAt
    }

    saveTokensToDisk(tokenStore)

    console.log(
      `Token '${key}' stored successfully, expires at:`,
      new Date(expiresAt)
    )
  } catch (error) {
    console.error('Failed to store token:', error)
    throw error
  }
}

export async function getToken(key: string): Promise<string | null> {
  try {
    const storedToken = tokenStore[key]
    if (!storedToken) return null

    if (storedToken.expiresAt <= Date.now()) {
      console.log(`Token '${key}' has expired, removing it`)
      delete tokenStore[key]
      saveTokensToDisk(tokenStore)
      return null
    }

    if (safeStorage.isEncryptionAvailable()) {
      const encryptedBuffer = Buffer.from(storedToken.encryptedData, 'base64')
      return safeStorage.decryptString(encryptedBuffer)
    } else {
      return Buffer.from(storedToken.encryptedData, 'base64').toString('utf8')
    }
  } catch (error) {
    console.error('Failed to retrieve token:', error)
    return null
  }
}

export async function removeToken(key: string): Promise<void> {
  try {
    delete tokenStore[key]
    saveTokensToDisk(tokenStore)
    console.log(`Token '${key}' removed successfully`)
  } catch (error) {
    console.error('Failed to remove token:', error)
    throw error
  }
}

export async function clearAllTokens(): Promise<void> {
  try {
    tokenStore = {}
    saveTokensToDisk(tokenStore)
    console.log('All tokens cleared successfully')
  } catch (error) {
    console.error('Failed to clear tokens:', error)
    throw error
  }
}

export async function isTokenValid(key: string): Promise<boolean> {
  try {
    const storedToken = tokenStore[key]
    if (!storedToken) return false

    const isValid = storedToken.expiresAt > Date.now()

    if (!isValid) {
      delete tokenStore[key]
      saveTokensToDisk(tokenStore)
    }

    return isValid
  } catch (error) {
    console.error('Failed to check token validity:', error)
    return false
  }
}

export async function extendTokenExpiry(key: string): Promise<boolean> {
  try {
    const storedToken = tokenStore[key]
    if (!storedToken) return false

    storedToken.expiresAt = Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    tokenStore[key] = storedToken
    saveTokensToDisk(tokenStore)

    console.log(
      `Token '${key}' expiration extended to:`,
      new Date(storedToken.expiresAt)
    )
    return true
  } catch (error) {
    console.error('Failed to extend token expiry:', error)
    return false
  }
}
