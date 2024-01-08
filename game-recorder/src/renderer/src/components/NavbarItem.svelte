<script lang="ts">
  import type { IconType } from '../types'
  import { route } from '../stores/router'
  import Icon from './Icon.svelte'
  import { Tooltip } from 'flowbite-svelte'

  export let icon: IconType
  export let to: string
  export let tooltip: string
  export let svgClass: string = ''
</script>

<div
  on:click={() => route.set({ name: to, args: {} })}
  class="bg-gray-900 rounded-full p-2 border border-gray-700 hover:bg-gray-700 cursor-pointer focus:outline-none"
>
  <Icon {icon} svgClass={`${svgClass} focus:outline-none`} />
  <Tooltip placement="right">{tooltip}</Tooltip>
</div>
