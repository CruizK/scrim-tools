import { BrowserWindow, ipcRenderer } from 'electron'
import { types } from './utils'
import { GameInfo } from './types'

/// This is an abomination,  but it allows us to type all the things

/// Handles typing of calls that go renderer -> main -> renderer
export const requestResponseCalls = [
  { type: "getVideos", request: null, response: [] as GameInfo<any>[] },
] as const

type IpcRequestResponse = (typeof requestResponseCalls)[number]

type IpcTypeNames<A> = A extends { type: infer T } ? T : never
type IpcRequest<A, T> = A extends { type: T; request: infer R } ? R : never
type IpcResponse<A, T> = A extends { type: T; response: infer R } ? R : never

type RecorderMessageTypes = IpcTypeNames<IpcRequestResponse>
type RecorderIpcRequest<T extends RecorderMessageTypes> = IpcRequest<IpcRequestResponse, T>
type RecorderIpcResponse<T extends RecorderMessageTypes> = IpcResponse<IpcRequestResponse, T>

export type ReqResponseApi = {
  [key in RecorderMessageTypes]: (
    request: RecorderIpcRequest<key>
  ) => Promise<RecorderIpcResponse<key>>;
}

/// Handles typing requests that go main -> renderer
export const mainToRendererCalls = [
  { ...types("recorderIsRecording"), callback: false as boolean }
] as const

type MainToRender = (typeof mainToRendererCalls)[number]

type IpcTypeNames_Main<A> = A extends { mType: infer T } ? T : never
type IpcTypeName_Renderer<A> = A extends { rType: infer T } ? T : never

type IpcCallback_Main<A, T> = A extends { mType: T; callback: infer R } ? R : never
type IpcCallback_Renderer<A, T> = A extends { rType: T; callback: infer R } ? R : never

type OneWayTypeNames_Main = IpcTypeNames_Main<MainToRender>
type OneWayIpcCallback_Main<T extends OneWayTypeNames_Main> = IpcCallback_Main<MainToRender, T>

type MainToRendererApi_Main = {
  [key in OneWayTypeNames_Main]: (
    window: BrowserWindow,
    value: OneWayIpcCallback_Main<key>
  ) => void
}

type OneWayTypeNames_Renderer = IpcTypeName_Renderer<MainToRender>
type OneWayIpcCallback_Renderer<T extends OneWayTypeNames_Renderer> = IpcCallback_Renderer<MainToRender, T>

type MainToRendererClears_Renderer = {
  removeListeners: (channel: IpcTypeNames_Main<MainToRender>) => void
}

type MainToRendererApi_Renderer = {
  [key in OneWayTypeNames_Renderer]: (
    callback: (value: OneWayIpcCallback_Renderer<key>) => void
  ) => void
} & MainToRendererClears_Renderer


// Export & build the APIs for the renderer
export type MainApi = ReqResponseApi & MainToRendererApi_Main
export type RendererApi = ReqResponseApi & MainToRendererApi_Renderer

const buildApi = {}

for (const key of requestResponseCalls) {
  buildApi[key['type']] = (request) => ipcRenderer.invoke(key['type'], request)
}

for (const key of mainToRendererCalls) {
  buildApi[key['rType']] = (callback) => ipcRenderer.on(key['mType'], (_event, value) => callback(value))
}

buildApi["removeListeners"] = (channel: IpcTypeNames_Main<MainToRender>) => ipcRenderer.removeAllListeners(channel)

// Custom APIs for renderer
export const rendererApi = { ...buildApi } as RendererApi
