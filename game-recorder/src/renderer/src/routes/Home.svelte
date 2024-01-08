<script lang="ts">
  import { Alert } from 'flowbite-svelte'
  import { route } from '../stores/router'
  import VideoGalleryItem from '../components/VideoGalleryItem.svelte'
  import { onDestroy, onMount } from 'svelte'
  let isRecording = false
  let filesPromise = window.api.getVideos(null)

  onMount(() => {
    window.api.on_recorderIsRecording((v) => (isRecording = v))
  })

  onDestroy(() => {
    window.api.removeListeners('recorderIsRecording')
  })
</script>

<div class="mx-4 mb-4">
  {#if isRecording}
    <Alert border>We are currently recording!!!</Alert>
  {/if}
  <h2 class="text-slate-50 font-bold text-xl">Library</h2>
  <hr class="border-gray-700 my-4 rounded" />
  <div class="grid gap-4 grid-cols-2 xs:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
    {#await filesPromise then files}
      {#each files as file}
        <VideoGalleryItem
          {file}
          on:click={(e) =>
            route.set({
              name: 'PlayVideo',
              args: {
                currentVideo: e.detail
              }
            })}
        />
      {/each}
    {/await}
  </div>
</div>
