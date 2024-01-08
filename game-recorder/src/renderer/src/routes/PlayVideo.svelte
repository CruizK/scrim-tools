<script lang="ts">
  import { Button, Heading } from 'flowbite-svelte'
  import { getVideoName, recorderPath } from '../util'
  import VideoPlayer from '../components/VideoPlayer.svelte'
  import type { GameInfo } from '../../../shared/types'
  import type { LolGameData } from '../../../shared/pluginTypes/lol'
  import { route } from '../stores/router'
  import { IconType } from '../types'

  export let currentVideo: GameInfo<LolGameData> = null
  let killMarkers = []
  if (currentVideo.gameData.kills) {
    console.log(currentVideo.gameData)
    killMarkers = currentVideo.gameData.kills
      .map((x) => ({
        ...x,
        icon: IconType.sword
      }))
      .concat(
        currentVideo.gameData.deaths.map((x) => ({
          ...x,
          icon: IconType.skull
        }))
      )
  }
</script>

<div class="w-8/12 mx-auto flex flex-col">
  <Heading tag="h3">{getVideoName(currentVideo.name)}</Heading>
  <VideoPlayer path={recorderPath(currentVideo.videoPath)} markers={killMarkers} />
  <div class="mt-3">
    <Button on:click={() => route.set({ name: 'Home', args: {} })}>Back</Button>
  </div>
</div>
