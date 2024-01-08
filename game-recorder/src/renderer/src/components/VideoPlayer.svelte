<script lang="ts">
  import type { Marker } from '../types'
  import VideoPlayerProgress from './VideoPlayerProgress.svelte'
  export let markers: Marker[]
  export let path: string

  let time
  let duration
  let paused

  $: console.log(duration)

  const onSeek = (event) => {
    time = duration * event.detail
  }

  const onKeyUp = (event: KeyboardEvent) => {
    console.log(event.key)
    if (event.key == 'j') time -= 3
    if (event.key == 'k') paused = !paused
    if (event.key == 'l') time += 3
  }
</script>

<svelte:window on:keyup={onKeyUp} />
<div>
  <div class="my-3">
    <video
      src={path}
      class="w-full max-wfull h-auto"
      autoplay
      muted
      controls
      bind:currentTime={time}
      bind:duration
      bind:paused
      on:click={() => (paused = !paused)}
    >
    </video>
  </div>
  <div class="mt-10">
    <VideoPlayerProgress on:seek={onSeek} {duration} {time} {markers} height={25} />
  </div>
</div>
