
export interface IPlugin<T> {
  onGameStart: () => Promise<void>
  onGameClosed: () => Promise<T>
}
