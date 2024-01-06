import { ElectronAPI } from '@electron-toolkit/preload'
import { RendererApi } from '../shared'

declare global {
  interface Window {
    electron: ElectronAPI
    api: RendererApi
  }
}
