import dayjs from "dayjs";
import Recorder from "../../obs/recorder";
import { IPlugin } from "../../types";
import RiotClient from "./client";
import { getLCUInfo } from "./utils";
import { getPromiseWait } from "../../utils";
import { LolGameData } from "../../../shared/pluginTypes/lol"

export default class LolPlugin implements IPlugin<LolGameData> {

  recordingStart!: Date
  gameStart!: Date
  recorder: Recorder
  riotClient!: RiotClient

  constructor(recorder: Recorder) {
    this.recorder = recorder
    this.setup()
  }

  private async setup() {
    try {
      const lcuInfo = await getLCUInfo()
      this.riotClient = new RiotClient(lcuInfo)
    } catch (err) {
      console.log("Todo, setup league client retry")
    }
  }

  async onGameStart(): Promise<void> {
    this.recordingStart = this.recorder.startDate
  }

  async onGameClosed(): Promise<LolGameData> {
    if (!this.riotClient) return {} as any
    return {} as any
    await getPromiseWait(5000)
    const games = await this.riotClient.getMatchHistoryLCU()
    const game = games.data.games.games[2]
    // When querying your own match history you will always be the only one
    const participantId = game.participantIdentities[0].participantId
    const timeline = await this.riotClient.getGameTimelineInfo(game.gameId)

    const events = timeline.data.frames.flatMap(x => x.events)
    const champKills = events.filter(x => x.type == "CHAMPION_KILL")
    const kills = champKills.filter(x => x.killerId == participantId).map(x => ({ timestamp: x.timestamp }))
    const deaths = champKills.filter(x => x.victimId == participantId).map(x => ({ timestamp: x.timestamp }))
    console.log(kills, deaths)

    //const gameCreateDate = new Date(games.data.games.games[0].gameCreation)
    //const diff = Math.abs(gameCreateDate.getTime() - this.recordingStart.getTime())
    //console.log(diff)
    //console.log(gameCreateDate.toString(), this.recordingStart, gameCreateDate.getTimezoneOffset())
    return {
      kills,
      deaths
    }
  }

}
