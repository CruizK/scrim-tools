import Database, { Statement } from "better-sqlite3";
import fs from "fs/promises"
import path from "path"
import { GameInfo } from "../../shared/types";

const db = new Database("./gameinfo.db");
db.pragma("journal_mode = WAL")

db.exec(`CREATE TABLE IF NOT EXISTS game_info (
  videoPath TEXT PRIMARY KEY,
  name TEXT,
  tags TEXT,
  thumbnailPath TEXT,
  game TEXT,
  gameData TEXT
)`)



class DatabaseHandler {
  getStatement: Statement
  insertStatement: Statement
  deleteStatement: Statement
  updateGameData: Statement

  constructor() {
    this.getStatement = db.prepare("SELECT * FROM game_info LIMIT ?, ?")
    this.deleteStatement = db.prepare("DELETE FROM game_info")
    this.updateGameData = db.prepare("UPDATE game_info SET gameData = ? WHERE videoPath = ?")
    this.insertStatement = db.prepare(`
      INSERT INTO game_info (name, tags, videoPath, thumbnailPath, game, gameData) 
      VALUES (@name,@tags,@videoPath,@thumbnailPath,@game,@gameData)
    `)
  }

  getVideos<T>(limit: number, skip: number = 0): GameInfo<T>[] {
    const output = this.getStatement.all(skip, limit) as any;
    for (let i = 0; i < output.length; i++) {
      try {
        output[i].gameData = JSON.parse(output[i].gameData)
        output[i].tags = output[i].tags.split(',')
      } catch (e) {
        output[i].gameData = {}
      }
    }
    return output as GameInfo<T>[]
  }

  insertVideo<T>(info: GameInfo<T>): void {
    this.insertStatement.run({
      ...info,
      tags: info.tags.join(','),
      gameData: JSON.stringify(info.gameData)
    })
  }

  updateVideoGameData<T>(videoPath: string, gameData: T) {
    this.updateGameData.run(gameData, videoPath)
  }

  clearVideos() {
    this.deleteStatement.run()
  }

  async syncFromDisk(mediaDir: string) {
    const files = await fs.readdir(mediaDir);
    this.clearVideos()
    for (const file of files) {
      if (path.parse(file).ext != '.mp4') continue
      const basename = path.parse(file).name
      const thumbnailPath = path.join(mediaDir, `${basename}.png`)
      const videoPath = path.join(mediaDir, file)

      this.insertVideo({
        videoPath,
        thumbnailPath,
        name: "",
        tags: [],
        game: "",
        gameData: {}
      })
    }
  }

}

const dbHandler = new DatabaseHandler()
export default dbHandler
