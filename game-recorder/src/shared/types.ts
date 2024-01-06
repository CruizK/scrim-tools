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
  gameData: T
}
