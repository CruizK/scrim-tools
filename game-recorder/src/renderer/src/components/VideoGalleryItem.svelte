<script lang="ts">
  import type { GameInfo } from '../../../shared/types'
  import { getFizeSize, getRelativeTime, getVideoName, recorderPath } from '../util'
  import { createEventDispatcher } from 'svelte'
  export let file: GameInfo<any>

  const dispatch = createEventDispatcher<{ click: GameInfo<any> }>()

  const onClick = (_event: MouseEvent) => {
    dispatch('click', file)
  }
</script>

<div class="w-full h-auto shadow-md cursor-pointer" on:click={onClick}>
  <img src={recorderPath(file.thumbnailPath)} alt="ree" class="h-auto max-w-full" />
  <div class="bg-gray-800 flex flex-col px-2 py-2">
    <h1 class="text-md font-bold text-white">{getVideoName(file.name)}</h1>
    <div class="flex text-slate-400 text-sm space-x-1">
      <span class="truncate">{file.game || 'League Of Legends'}</span>
      <span>•</span>
      <span class="truncate">{getRelativeTime(file.date)}</span>
      <span>•</span>
      <span class="truncate">{getFizeSize(file.fileSize)}</span>
    </div>
  </div>
</div>
