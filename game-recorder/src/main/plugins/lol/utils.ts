import wmic from "wmic"
import { LCUInfo } from "./types"


export function getLCUInfo(): Promise<LCUInfo> {
  return new Promise((res, rej) => {
    wmic.get_value("process", "commandline", "name='LeagueClientUx.exe'", (err, commandline: string) => {
      if (err) return rej(err);
      const args = commandline.replaceAll("\"", "").split(' ');
      const port = args.find(x => x.startsWith("--app-port="))?.slice("--app-port=".length)
      const authToken = args.find(x => x.startsWith("--remoting-auth-token="))?.slice("--remoting-auth-token=".length)

      if (!port || !authToken) {
        return rej(new Error("Failed to find port or auth token"))
      }

      const auth = Buffer.from(`riot:${authToken}`).toString("base64")
      return res({ port: Number(port), authToken: auth })
    })
  })
}

export function getActiveGameId(): Promise<number> {
  return new Promise((res, rej) => {
    wmic.get_value("process", "commandline", "name='League of Legends.exe'", (err, commandline: string) => {
      if (err) return rej(err)
      const args = commandline.replaceAll("\"", "").split(' ')
      const gameId = args.find(x => x.startsWith("-GameID="))?.slice("-GameID=".length)
      return res(Number(gameId))
    })
  })
}
