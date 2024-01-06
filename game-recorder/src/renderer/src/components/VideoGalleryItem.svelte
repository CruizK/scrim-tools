<script lang="ts">
  import { Heading, P } from 'flowbite-svelte'
  import type { GameInfo } from '../../../shared/types'
  import { recorderPath } from '../util'
  export let item: GameInfo<any>
</script>

<div class="w-full h-auto border-2 border-gray-900 rounded shadow-md">
  <img src={recorderPath(item.thumbnailPath)} alt="ree" class="h-auto max-w-full" />
  <div class="bg-gray-900 flex flex-col px-2 py-2">
    <Heading customSize="text-md font-bold">{item.name}</Heading>
    <P>{item.game || 'League Of Legends'}</P>
  </div>
</div>
