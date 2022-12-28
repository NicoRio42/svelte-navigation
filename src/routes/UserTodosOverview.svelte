<script lang="ts" context="module">
  export async function loadData(params?: Params): Promise<Todo[]> {
    const todos = await fetch("https://jsonplaceholder.typicode.com/todos");
    return ((await todos.json()) as Todo[]).filter(
      (todo) => String(todo.userId) === params?.userId
    );
  }
</script>

<script lang="ts">
  import type { Params } from "../lib/models/params";
  import { link } from "../lib/Router.svelte";
  import type { Todo } from "../models/todo";

  export let data: Todo[];
</script>

<ul>
  {#each data as todo}
    <li>
      <a href="/users/{todo.userId}/todos/{todo.id}" use:link
        >{todo.title} {todo.userId}</a
      >
    </li>
  {/each}
</ul>
