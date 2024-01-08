export type Game = {
  name: string;
  imageName: string;
}

export type GameInfo<T> = {
  name: string;
  tags: string[];
  videoPath: string;
  thumbnailPath: string;
  game: string;
  date: Date;
  fileSize: number;
  gameData: T
}

export enum CaptureType {
  game = "Game Capture",
  monitor = "Monitor Capture"
}


export type GameCaptureSettings = {
  window: string,
  capture_cursor: boolean
}
