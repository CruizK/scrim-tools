<script lang="ts">
  import VideoPlayerProgress from './VideoPlayerProgress.svelte'
  export let path: string
  let time
  let duration
  let paused
  let videoEl: HTMLMediaElement

  $: console.log(duration)

  const onSeek = (event) => {
    videoEl.fastSeek(duration * event.detail)
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
      bind:this={videoEl}
      bind:currentTime={time}
      bind:duration
      bind:paused
      on:click={() => (paused = !paused)}
    >
    </video>
  </div>
  <VideoPlayerProgress on:seek={onSeek} {duration} {time} height={25} />
</div>
