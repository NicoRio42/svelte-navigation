<script lang="ts" context="module">
  export async function loadData(): Promise<User[]> {
    const users = await fetch("https://jsonplaceholder.typicode.com/users");
    return (await users.json()) as unknown as User[];
  }
</script>

<script lang="ts">
  import { link } from "../lib/navigation";
  import type { User } from "../models/user";

  export let data: User[];
</script>

<h1>Users</h1>

<ul>
  {#each data as user}
    <li>
      <a href="/users/{user.id}" use:link>{user.name}</a>
    </li>
  {/each}
</ul>
