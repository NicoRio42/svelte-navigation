<script lang="ts" context="module">
  import type { PathParams } from "../lib/models/params";

  export async function loadData(pathParams: PathParams): Promise<Todo> {
    const todo = await fetch(
      `https://jsonplaceholder.typicode.com/todos/${pathParams.todoId}`
    );
    return (await todo.json()) as Todo;
  }
</script>

<script lang="ts">
  import type { Todo } from "../models/todo";

  export let data: Todo;
</script>

<h2>Todo: {data.title}</h2>
