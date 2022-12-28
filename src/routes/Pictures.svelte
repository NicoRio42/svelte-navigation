<script lang="ts" context="module">
  import { wait } from "../utils/wait";

  export async function loadData(): Promise<string> {
    await wait(2000);
    throw new Error("Error");
    return Promise.resolve("balblabla");
  }
</script>

<script lang="ts">
  export let data: string;
</script>

<h2>{data}</h2>
