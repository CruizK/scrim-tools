<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Marker } from '../types'
  import Icon from './Icon.svelte'

  export let markers: Marker[]
  export let duration: number
  export let time: number
  export let height: number
  let foregroundEl: HTMLElement
  let isMouseDown = false

  const dispatch = createEventDispatcher<{ seek: number }>()

  let progress = 0
  let processedMarkers: Marker[]

  $: if (duration != 0) {
    progress = Math.max(1.0, (time / duration) * 100)
  }

  $: {
    let groupTimestampAmount = duration / 70
    let sortedMarkers = markers
      .map((x) => ({
        timestamp: Math.floor((x.timestamp + 12000) / 1000),
        icon: x.icon
      }))
      .sort((a, b) => a.timestamp - b.timestamp)

    let finalMarkers = []
    for (let i = 0; i < sortedMarkers.length; i++) {
      finalMarkers.push({
        ...sortedMarkers[i],
        count: 1
      })
      if (
        i + 1 < sortedMarkers.length &&
        sortedMarkers[i + 1].timestamp - sortedMarkers[i].timestamp <= groupTimestampAmount &&
        sortedMarkers[i + 1].icon == sortedMarkers[i].icon
      ) {
        finalMarkers[finalMarkers.length - 1].count += 1
        i++
      }
    }

    processedMarkers = finalMarkers.map((x) => ({
      ...x,
      timestamp: (x.timestamp / duration) * 100
    }))
    console.log(sortedMarkers)
    console.log(processedMarkers)
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
  const iconSize = 18
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

  {#each processedMarkers as marker}
    {#if marker.count > 1}
      <span
        class="absolute text-white z-10 block font-bold"
        style={`left: calc(${marker.timestamp}% - 4px); top: -${iconSize + 25}px;`}
        >{marker.count}</span
      >
    {/if}
    <Icon
      icon={marker.icon}
      svgClass={`absolute fill-white z-10`}
      width={`${iconSize}px`}
      height={`${iconSize}px`}
      style={`left: calc(${marker.timestamp}% - ${Math.floor(iconSize / 2) - 1}px); top: -${
        iconSize + 4
      }`}
    />
    <div
      class={`bg-white absolute w-[2px] -top-[3px] pointer-events-none rounded-md`}
      style={`height: ${height + 3}px; left: ${marker.timestamp}%`}
    ></div>
  {/each}
</div>
