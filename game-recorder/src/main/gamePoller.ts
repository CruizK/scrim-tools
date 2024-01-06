import EventEmitter from "events";
import tasklist from 'tasklist'
import games from "./gameDB";
import { Game } from "../shared/types";

export declare interface GamePoller {
  on(event: "gameStarted", listener: (game: Game) => void): this;
  on(event: "gameClosed", listener: (game: Game) => void): this;
}

export class GamePoller extends EventEmitter {

  pollInterval: NodeJS.Timeout
  gameImageNames: Record<string, Game>;
  gameOpenCache: Record<string, boolean>
  constructor() {
    super()

    this.gameOpenCache = {}
    this.gameImageNames = {}

    games.forEach(x => this.gameOpenCache[x.imageName] = false)
    games.forEach(x => this.gameImageNames[x.imageName] = x);
    this.pollInterval = setInterval(() => this.poll(), 1000)
  }

  private async poll() {
    const tasks = (await tasklist()) as any[]
    const openGames = tasks.filter(x => this.gameImageNames[x.imageName]).map(x => this.gameImageNames[x.imageName])

    for (const openGame of openGames) {
      // If game is now open, but during last poll was closed, then it just opened
      if (this.gameOpenCache[openGame.imageName] === false) {
        this.gameOpenCache[openGame.imageName] = true
        this.emit("gameStarted", openGame)
      }
    }

    for (const cachedGame in this.gameOpenCache) {
      // If the game is not open, but was open during last poll, then it just closed
      if (!openGames.some(x => x.imageName == cachedGame) && this.gameOpenCache[cachedGame] === true) {
        this.gameOpenCache[cachedGame] = false
        this.emit("gameClosed", this.gameImageNames[cachedGame])
      }
    }
  }
}
