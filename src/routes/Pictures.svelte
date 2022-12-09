<script lang="ts" context="module">
  import { waitfor2Seconds } from "../utils/wait";

  export async function loadData(): Promise<string> {
    await waitfor2Seconds();
    throw new Error("Error");
    return Promise.resolve("balblabla");
  }
</script>

<script lang="ts">
  export let data: string;
</script>

<h2>{data}</h2>
