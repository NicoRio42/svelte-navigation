<script lang="ts" context="module">
  import type { PathParams } from "../lib/models/params";

  export async function loadData(pathParams: PathParams): Promise<Todo[]> {
    const todos = await fetch("https://jsonplaceholder.typicode.com/todos");
    return ((await todos.json()) as Todo[]).filter(
      (todo) => String(todo.userId) === pathParams.userId
    );
  }
</script>

<script lang="ts">
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
