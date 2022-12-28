<script lang="ts" context="module">
  export async function loadData(): Promise<Post[]> {
    const posts = await fetch("https://jsonplaceholder.typicode.com/posts");
    return (await posts.json()) as unknown as Post[];
  }
</script>

<script lang="ts">
  import { link } from "../lib/navigation";

  import type { Post } from "../models/post";

  export let data: Post[];
</script>

<h1>Posts</h1>

{#each data as post}
  <a href="/posts/{post.id}" use:link>{post.title}</a>
{/each}
