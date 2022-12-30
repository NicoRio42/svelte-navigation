<script lang="ts" context="module">
  import { wait } from "../utils/wait";

  export async function loadData(): Promise<number> {
    await wait(5000);
    return 5000;
  }
</script>

<script lang="ts">
  export let data: number;
</script>

<p>It took {data / 1000} seconds.</p>
