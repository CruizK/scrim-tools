import fs from "fs"
import path from "path"
import { Settings } from "../shared/settings"
import Manager from "./manager"
import { CaptureType } from "../shared/types"

type SettingsOptional = {
  [key in keyof Settings]?: Settings[key]
}


export default class SettingsHandler {

  settings: Settings
  private SETTINGS_DIR = path.join(__dirname, "../../", "settings.json")

  constructor(manager: Manager) {
    if (!fs.existsSync(this.SETTINGS_DIR)) {
      this.settings = SettingsHandler.defaultSettings(manager)
      fs.writeFileSync(this.SETTINGS_DIR, JSON.stringify(this.settings))
    } else {
      this.settings = JSON.parse(fs.readFileSync(this.SETTINGS_DIR, "utf-8"))
    }
  }

  private static defaultSettings(manager: Manager): Settings {
    return {
      captureScaleFactor: undefined,
      captureType: CaptureType.game,
      videoEncoder: "jim_",
      useMicrophone: true
    }
  }

  set(settings: SettingsOptional) {
    this.settings = { ...this.settings, ...settings }
    fs.writeFileSync(this.SETTINGS_DIR, JSON.stringify(this.settings))
  }
}
