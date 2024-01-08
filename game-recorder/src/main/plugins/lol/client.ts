import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import https from "https"
import { GameResponse, GameTimeline, GetSummonerResponse, LCUInfo, LiveGameStats, MatchHistory } from "./types";


export class InGameClient {
  private ingameInstance: AxiosInstance

  constructor() {
    this.ingameInstance = axios.create({
      baseURL: "https://127.0.0.1:2999/liveclientdata",
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })

    axiosRetry(this.ingameInstance,
      {
        retries: 5,
        retryCondition: () => true,
        retryDelay: axiosRetry.exponentialDelay
      })
  }

  getLiveGameStats(): LiveGameStats {
    return this.ingameInstance.get("/gamestats")
  }
}

export class LCUClient {

  private lcuInstance: AxiosInstance

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

    axiosRetry(this.lcuInstance,
      {
        retries: 5,
        retryCondition: () => true,
        retryDelay: axiosRetry.exponentialDelay
      })
  }


  getSummonerLCU(): GetSummonerResponse {
    return this.lcuInstance.get("/lol-summoner/v1/current-summoner")
  }

  getGame(gameId: number): GameResponse {
    return this.lcuInstance.get(`/lol-match-history/v1/games/${gameId}`)
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
