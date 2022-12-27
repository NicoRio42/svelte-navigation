<script>
  import { replace } from "../lib/Router.svelte";
</script>

<h1>Home</h1>

<button on:click={() => replace("/about")}>About</button>
