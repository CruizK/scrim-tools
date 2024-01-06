import { IVec2 } from "obs-studio-node"
import fs from "fs"
import path from "path"

type Settings = {
  videoScaleFactor: IVec2
}

type SettingsOptional = {
  [key in keyof Settings]?: Settings[key]
}


class SettingHandler {

  settings: Settings
  SETTINGS_DIR = path.join(__dirname, "../../", "settings.json")

  constructor() {
    if (!fs.existsSync(this.SETTINGS_DIR)) {
      this.settings = SettingHandler.defaultSettings()
      fs.writeFileSync(this.SETTINGS_DIR, JSON.stringify(this.settings))
    } else {
      this.settings = JSON.parse(fs.readFileSync(this.SETTINGS_DIR, "utf-8"))
    }
  }

  static defaultSettings(): Settings {
    return {
      videoScaleFactor: {
        x: 0,
        y: 0
      }
    }
  }

  set(settings: SettingsOptional) {
    this.settings = { ...this.settings, ...settings }
    fs.writeFileSync(this.SETTINGS_DIR, JSON.stringify(this.settings))
  }
}

const settings = new SettingHandler()

export default settings
