<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let duration: number
  export let time: number
  export let height: number
  let foregroundEl: HTMLElement
  let isMouseDown = false

  const dispatch = createEventDispatcher<{ seek: number }>()

  let progress = 0

  $: if (duration != 0) {
    progress = Math.max(1.0, (time / duration) * 100)
  }

  const getPercentage = (mouseX: number) => {
    const total = foregroundEl.getBoundingClientRect().width
    const left = foregroundEl.getBoundingClientRect().left
    const diff = mouseX - left
    return diff / total
  }

  const onClick = (event: MouseEvent) => {
    dispatch('seek', getPercentage(event.clientX))
  }

  const onMouseDown = () => {
    isMouseDown = true
  }

  const onMouseUp = () => {
    isMouseDown = false
  }

  const onMouseMove = (event: MouseEvent) => {
    if (isMouseDown) {
      console.log('Mouse move')
      dispatch('seek', getPercentage(event.clientX))
    }
  }
</script>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

<div class="relative" style={`height: ${height}px`}>
  <!-- The background of seeker -->
  <div
    class="w-full bg-gray-500 absolute select-none rounded-md"
    bind:this={foregroundEl}
    on:click={onClick}
    on:dragstart|preventDefault
    on:drag|preventDefault
    on:mousedown={onMouseDown}
    style={`height: ${height}px`}
  ></div>
  <!-- The foreground of seeker -->
  <div
    on:dragstart|preventDefault
    class="bg-primary-600 absolute pointer-events-none select-none rounded-md"
    style={`height: ${height}px; width: ${progress}%`}
  ></div>
</div>
