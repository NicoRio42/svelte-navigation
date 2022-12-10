<script lang="ts" context="module">
  export async function loadData(): Promise<User[]> {
    const users = await fetch("https://jsonplaceholder.typicode.com/users");
    return (await users.json()) as unknown as User[];
  }
</script>

<script lang="ts">
  import { getConfig } from "../lib/config";

  import { link } from "../lib/links";

  import type { User } from "../models/user";

  export let data: User[];
</script>

<h1>Users</h1>

<ul>
  {#each data as user}
    <li>
      {#if getConfig().hashMode}
        <a href="#/users/{user.id}">{user.name}</a>
      {:else}
        <a href="/users/{user.id}" use:link>{user.name}</a>
      {/if}
    </li>
  {/each}
</ul>
