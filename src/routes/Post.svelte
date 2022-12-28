<script lang="ts" context="module">
  import type { PathParams } from "../lib/models/params";

  export async function loadData(pathParams: PathParams): Promise<Post> {
    const post = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${pathParams.id}`
    );
    return (await post.json()) as unknown as Post;
  }
</script>

<script lang="ts">
  import type { Post } from "../models/post";

  export let data: Post;
</script>

<h1>{data.title}</h1>

<p>{data.body}</p>
