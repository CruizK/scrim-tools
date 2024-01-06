import axios, { AxiosInstance } from "axios";
import https from "https"
import { GameTimeline, GetSummonerResponse, LCUInfo, MatchHistory } from "./types";

export default class RiotClient {

  private lcuInstance: AxiosInstance
  private ingameInstance: AxiosInstance

  constructor(info: LCUInfo) {
    this.lcuInstance = axios.create({
      baseURL: `https://127.0.0.1:${info.port}`,
      headers: {
        Authorization: `Basic ${info.authToken}`
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })

    this.ingameInstance = axios.create({
      baseURL: "https://127.0.0.1:2999",
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
  }

  getSummonerLCU(): GetSummonerResponse {
    return this.lcuInstance.get("/lol-summoner/v1/current-summoner")
  }

  getMatchHistoryLCU(begIndex?: number, endIndex?: number): MatchHistory {
    return this.lcuInstance.get(`/lol-match-history/v1/products/lol/current-summoner/matches`, {
      params: {
        begIndex, endIndex
      }
    })
  }

  getGameTimelineInfo(gameId: number): GameTimeline {
    return this.lcuInstance.get(`/lol-match-history/v1/game-timelines/${gameId}`, {})
  }
}
