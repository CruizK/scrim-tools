<script lang="ts">
  import './assets/style.css'
  import { Button, Heading, Alert, Gallery } from 'flowbite-svelte'
  import VideoPlayer from './components/VideoPlayer.svelte'
  import VideoGalleryItem from './components/VideoGalleryItem.svelte'
  import { onDestroy, onMount } from 'svelte'
  let isRecording = false
  let files

  onMount(() => {
    window.api.on_recorderIsRecording((v) => (isRecording = v))
  })

  onDestroy(() => {
    window.api.removeListeners('recorderIsRecording')
  })

  $: window.api.getVideos(null).then((res) => (files = res))

  let videoPath = null
</script>

<div class="mx-4 mt-4">
  {#if isRecording}
    <Alert border>We are currently recording!!!</Alert>
  {/if}
  {#if videoPath}
    <div class="w-10/12 mx-auto flex flex-col">
      <Heading>{videoPath}</Heading>
      <VideoPlayer path={`recorder:///${videoPath}`} />
      <div class="mt-3">
        <Button on:click={() => (videoPath = null)}>Back</Button>
      </div>
    </div>
  {:else if files}
    <Gallery
      items={files}
      class="gap-4 grid-cols-2 xs:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4"
      let:item
    >
      <VideoGalleryItem {item} />
    </Gallery>
  {/if}
</div>
