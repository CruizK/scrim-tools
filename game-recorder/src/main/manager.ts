import { BrowserWindow, protocol } from "electron";
import Recorder from "./obs/recorder";
import { GamePoller } from "./gamePoller";
import { MainApi } from "../shared";
import path from "path"
import { buildApi, buildReqResApi } from "./api";
import { generateThumbnail, getFileSizeMB, trimStartingBlackFrames } from "./utils";
import db from "./db"
import LolPlugin from "./plugins/lol/plugin";
import { CaptureType, Game, GameCaptureSettings } from "../shared/types";
import games from "./gameDB";
import { IPlugin } from "./types";
import fs from "fs/promises"
import { SettingSchema, getSettingSchema } from "../shared/settings";
import SettingsHandler from "./settings";

export default class Manager {

  MEDIA_DIR = path.join(__dirname, '../../', 'media')
  api: MainApi
  window: BrowserWindow
  settings: SettingsHandler
  recorder: Recorder

  private gamePoller: GamePoller
  private settingSchema: SettingSchema
  private plugins: Record<string, IPlugin<any>>

  constructor(window: BrowserWindow) {
    this.window = window;
    this.recorder = new Recorder(this);
    this.gamePoller = new GamePoller();
    this.plugins = {
      [games[0].name]: new LolPlugin()
    }
    this.settings = new SettingsHandler(this)
    this.settingSchema = getSettingSchema(this)

    this.initRecorder();

    // Have to use deprecated protocol since other does not work (well) for video streaming
    protocol.registerFileProtocol("recorder", (req, callback) => {
      let requestedPath = req.url.slice("recorder:///".length);
      callback({ path: requestedPath })
    })

    const reqResApi = buildReqResApi(this)
    this.api = buildApi(reqResApi);

    this.gamePoller.on("gameStarted", g => this.onGameStarted(g))
    this.gamePoller.on("gameClosed", g => this.onGameClosed(g))
    this.init()
  }

  async init() {
    try {
      await db.syncFromDisk(this.MEDIA_DIR)
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
    // This video has improper slashes for windows
    const videoIncorrectPath = await this.recorder.stop();
    const videoPath = path.join(this.MEDIA_DIR, path.basename(videoIncorrectPath))
    this.api.recorderIsRecording(this.window, false)

    const plugin = this.plugins[game.name]
    let gameData = {}
    try {
      gameData = await plugin.onGameClosed(videoPath)
    } catch (e) {
      console.info("Failed to get game data", gameData)
    }
    if (plugin.shouldWriteGameData) {
      const name = `${path.parse(videoPath).name}.meta`
      await fs.writeFile(path.join(this.MEDIA_DIR, name), JSON.stringify(gameData))
    }
    const thumbnailPath = await generateThumbnail(videoPath)
    db.insertVideo({
      videoPath,
      thumbnailPath,
      game: game.name,
      fileSize: await getFileSizeMB(videoPath),
      gameData
    })
  }

  initRecorder() {
    const captureSettings: GameCaptureSettings = {
      capture_cursor: true,
      window: 'League of Legends (TM) Client:RiotWindowClass:League of Legends.exe'
    }
    this.recorder.configureCapture(CaptureType.game, captureSettings, this.settings)
    this.recorder.setupAudio()
    this.recorder.configureRecorder()
  }

  beforeQuit() {
    this.recorder.quit();
  }
}
