import Database, { Statement } from "better-sqlite3";
import fs from "fs/promises"
import path from "path"
import { GameInfo } from "../../shared/types";
import { getFileSizeMB } from "../utils";

const db = new Database("./gameinfo.db");

db.exec(`CREATE TABLE IF NOT EXISTS game_info (
  videoPath TEXT PRIMARY KEY,
  name TEXT,
  tags TEXT,
  thumbnailPath TEXT,
  game TEXT,
  date TEXT,
  fileSize INTEGER,
  gameData TEXT
)`)

type GameInfoInsert<T> = Omit<GameInfo<T>, "date" | "name" | "tags"> & {
  name?: string,
  tags?: string[]
}

type GameInfoDB<T> = Omit<GameInfo<T>, "tags" | "gameData" | "date"> & {
  gameData: string
  tags: string
  date: string
}




class DatabaseHandler {
  getStatement: Statement
  insertStatement: Statement
  deleteStatement: Statement
  updateGameData: Statement

  constructor() {
    this.getStatement = db.prepare("SELECT * FROM game_info ORDER BY date DESC LIMIT ?, ?")
    this.deleteStatement = db.prepare("DELETE FROM game_info")
    this.updateGameData = db.prepare("UPDATE game_info SET gameData = ? WHERE videoPath = ?")
    this.insertStatement = db.prepare(`
      INSERT INTO game_info (name, tags, videoPath, thumbnailPath, game, gameData, date, fileSize) 
      VALUES (@name,@tags,@videoPath,@thumbnailPath,@game,@gameData,@date,@fileSize)
    `)
  }

  getVideos<T>(limit: number, skip: number = 0): GameInfo<T>[] {
    const output = this.getStatement.all(skip, limit) as GameInfoDB<T>[];
    return output.map(x => ({
      ...x,
      gameData: x.gameData ? JSON.parse(x.gameData) : {},
      tags: x.tags.split(","),
      date: new Date(x.date)
    })) as GameInfo<T>[]
  }

  insertVideo<T>(info: GameInfoInsert<T>): void {
    const insert: GameInfoDB<T> = {
      ...info,
      name: info.name || "",
      tags: info.tags ? info.tags.join(',') : "",
      gameData: JSON.stringify(info.gameData),
      date: new Date().toISOString()
    };
    this.insertStatement.run(insert)
  }

  updateVideoGameData<T>(videoPath: string, gameData: T) {
    this.updateGameData.run(gameData, videoPath)
  }

  clearVideos() {
    this.deleteStatement.run()
  }

  async syncFromDisk(mediaDir: string) {
    const files = await fs.readdir(mediaDir);
    const paths: string[] = []

    // Check if files exist on disk, but not in DB, then load them
    for (const file of files) {
      if (path.parse(file).ext != '.mp4') continue
      const basename = path.parse(file).name
      const metaPath = path.join(mediaDir, `${basename}.meta`);
      const thumbnailPath = path.join(mediaDir, `${basename}.png`)
      const videoPath = path.join(mediaDir, file)
      paths.push(`'${videoPath}'`)

      let gameData = {}
      try {
        gameData = JSON.parse(await fs.readFile(metaPath, "utf-8"))
      } catch (e) { }
      try {
        this.insertVideo({
          videoPath,
          thumbnailPath,
          gameData,
          fileSize: await getFileSizeMB(videoPath),
          name: "",
          tags: [],
          game: ""
        })
      } catch (e) { }
    }

    // Delete anything in DB but not on disk
    db.exec(`DELETE FROM game_info WHERE videoPath NOT IN (${paths.join(',')})`)
  }
}

const dbHandler = new DatabaseHandler()
export default dbHandler
