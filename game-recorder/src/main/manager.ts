import { BrowserWindow, protocol } from "electron";
import Recorder from "./obs/recorder";
import { GamePoller } from "./gamePoller";
import { MainApi } from "../shared";
import path from "path"
import { buildApi, buildReqResApi } from "./api";
import { generateThumbnail, trimStartingBlackFrames } from "./utils";
import db from "./db"
import LolPlugin from "./plugins/lol/plugin";
import { Game } from "../shared/types";
import games from "./gameDB";
import { IPlugin } from "./types";
import fs from "fs/promises"

export default class Manager {

  MEDIA_DIR = path.join(__dirname, '../../', 'media')
  api: MainApi
  window: BrowserWindow
  gamePoller: GamePoller
  recorder: Recorder
  plugins: Record<string, IPlugin<any>>

  constructor(window: BrowserWindow) {
    this.window = window;
    this.gamePoller = new GamePoller();
    this.recorder = new Recorder(window);
    this.plugins = {
      [games[0].name]: new LolPlugin(this.recorder)
    }

    // Have to use deprecated protocol since other does not work (well) for video streaming
    protocol.registerFileProtocol("recorder", (req, callback) => {
      let requestedPath = req.url.slice("recorder:///".length);
      callback({ path: requestedPath })
    })

    const reqResApi = buildReqResApi(this)
    this.api = buildApi(reqResApi);

    this.initRecorder();
    this.gamePoller.on("gameStarted", g => this.onGameStarted(g))
    this.gamePoller.on("gameClosed", g => this.onGameClosed(g))
    this.init()
  }

  async init() {
    try {
      await db.syncFromDisk(this.MEDIA_DIR)
      const files = await fs.readdir(this.MEDIA_DIR);
      for (const file of files) {
        await generateThumbnail(path.join(this.MEDIA_DIR, file))
      }
    } catch (e) {
      console.log(e)
    }
  }

  private async onGameStarted(game: Game) {
    await this.recorder.start()
    const plugin = this.plugins[game.name]
    await plugin.onGameStart()
    this.api.recorderIsRecording(this.window, true)
  }

  private async onGameClosed(game: Game) {
    const videoPath = await this.recorder.stop();
    await trimStartingBlackFrames(videoPath);
    const thumbnailPath = await generateThumbnail(videoPath)
    const plugin = this.plugins[game.name]
    //const gameData = await plugin.onGameClosed()
    const gameData = {}
    db.insertVideo({
      name: "",
      tags: [],
      videoPath,
      thumbnailPath,
      game: game.name,
      gameData
    })
    this.api.recorderIsRecording(this.window, false)
  }

  initRecorder() {
    this.recorder.init()
    this.recorder.setupLeagueGameCapture()
    this.recorder.setupAudio()
    this.recorder.configureRecorder()
  }

  beforeQuit() {
    this.recorder.quit();
  }
}
