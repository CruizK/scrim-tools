import { IPlugin } from "../../types";
import { LCUClient, InGameClient } from "./client";
import { getActiveGameId, getLCUInfo } from "./utils";
import { LolGameData } from "../../../shared/pluginTypes/lol"
import Queue from "better-queue"
import { trimStartingBlackFrames } from "../../utils";
import dayjs, { Dayjs } from "dayjs";

export default class LolPlugin implements IPlugin<LolGameData> {

  shouldWriteGameData = true;
  activeGameId!: number
  lcuClient!: LCUClient
  inGameClient: InGameClient
  recordStartedAt!: Date
  gameStartedAt!: Dayjs
  queue: Queue

  gameModes = [
    "CLASSIC",
    ""
  ]

  constructor() {
    this.inGameClient = new InGameClient();
    this.queue = new Queue(async (input, cb) => {
      try {
        const result = await this.processVideo(input)
        cb(null, result)
      } catch (err) {
        cb(err, null)
      }
    }, { concurrent: 1, maxRetries: 3, retryDelay: 5000 })
  }

  private async processVideo(videoPath: string) {
    const lcuInfo = await getLCUInfo()
    this.lcuClient = new LCUClient(lcuInfo)
    console.log(`[LoLPlugin]: Processing Video ${videoPath}`)
    const blackScreenTime = await trimStartingBlackFrames(videoPath);
    return await this.getGameData(blackScreenTime)
  }

  private async getGameData(blackScreenTime: number): Promise<LolGameData> {
    const game = await this.lcuClient.getGame(this.activeGameId)
    const summoner = await this.lcuClient.getSummonerLCU()
    const participantId = game.data.participantIdentities.find(x => x.player.puuid == summoner.data.puuid)?.participantId
    const timeline = await this.lcuClient.getGameTimelineInfo(this.activeGameId)

    const events = timeline.data.frames.flatMap(x => x.events)
    const champKills = events.filter(x => x.type == "CHAMPION_KILL")
    const kills = champKills.filter(x => x.killerId == participantId).map(x => ({ timestamp: x.timestamp }))
    const deaths = champKills.filter(x => x.victimId == participantId).map(x => ({ timestamp: x.timestamp }))
    const trueGameStart = this.gameStartedAt.subtract(blackScreenTime, "seconds")
    const diff = Math.abs(trueGameStart.toDate().getTime() - this.recordStartedAt.getTime())
    console.log(diff)

    const output: LolGameData = {
      kills,
      deaths,
      diff,
      gameId: this.activeGameId,
      duration: game.data.gameDuration
    }

    return output
  }

  async getLiveGameStats() {
    const gameStats = await this.inGameClient.getLiveGameStats()
    this.gameStartedAt = dayjs().subtract(gameStats.data.gameTime, "seconds")
  }

  async onGameStart(): Promise<void> {
    this.recordStartedAt = new Date()
    this.activeGameId = await getActiveGameId()
    await this.getLiveGameStats()
  }

  async onGameClosed(videoPath: string): Promise<LolGameData> {
    return new Promise((res, rej) => {
      this.queue.push(videoPath)
        .on("finish", result => res(result))
        .on("error", err => rej(err))
    })
  }

}
