
export interface IPlugin<T> {
  shouldWriteGameData: boolean
  onGameStart: () => Promise<void>
  onGameClosed: (videoPath: string) => Promise<T>
}
