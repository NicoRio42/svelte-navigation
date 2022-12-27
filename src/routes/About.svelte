<script lang="ts">
  import { link, queryParams } from "../lib/Router.svelte";

  $: console.log($queryParams);
</script>

<h1>About</h1>

<ul>
  <li><a use:link href="/about?toto=toto&titi=titi">Test query params</a></li>

  <li>
    <a use:link href="/about?toto=toto&titi=titi&tutu=tutu">Test query params</a
    >
  </li>

  <li><a use:link href="/about?tata=tata">Test query params</a></li>
</ul>
