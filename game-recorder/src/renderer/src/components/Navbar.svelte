<script lang="ts">
  import { IconType } from '../types'
  import NavbarItem from './NavbarItem.svelte'
</script>

<div class="h-screen fixed bg-gray-800 shadow-md w-[75px]">
  <div class="flex flex-col justify-between py-4 h-[85%]">
    <div class="flex flex-col px-4">
      <NavbarItem
        icon={IconType.library}
        to="Home"
        tooltip="Library"
        svgClass="fill-none stroke-white stroke-2 "
      />
    </div>
    <div class="flex flex-col border-t border-gray-600 px-3 mx-1 pt-4">
      <NavbarItem
        icon={IconType.gear}
        to="Settings"
        tooltip="Settings"
        svgClass="fill-none stroke-white stroke-2"
      />
    </div>
  </div>
</div>
