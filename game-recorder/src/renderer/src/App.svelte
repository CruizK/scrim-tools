<script lang="ts">
  import './assets/style.css'
  import { route } from './stores/router'
  import Home from './routes/Home.svelte'
  import PlayVideo from './routes/PlayVideo.svelte'
  import Navbar from './components/Navbar.svelte'

  const routes = {
    Home: Home,
    PlayVideo: PlayVideo
  }
</script>

<div class="flex">
  <Navbar />

  <div class="mt-4 ml-[75px]">
    {#each Object.entries(routes) as [name, component]}
      {#if $route.name == name}
        <svelte:component this={component} {...$route.args} />
      {/if}
    {/each}
  </div>
</div>
