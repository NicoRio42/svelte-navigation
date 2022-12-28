<script lang="ts" context="module">
  import type { LoadData } from "../src/lib/models/load";

  export const loadData: LoadData = async (
    prathParams: PathParams
  ): Promise<Todo> => {
    const rawTodos = await fetch("https://jsonplaceholder.typicode.com/todos");
    const todos = (await rawTodos.json()) as unknown as Todo[];
    const todo = todos.find((t) => t.id === prathParams.todoId);
    if (todo === undefined) throw new Error("404");
    return todo;
  };
</script>

<script lang="ts">
  import type { PathParams } from "../src/lib/models/params";
  import type { Todo } from "../src/models/todo";

  export let data: Todo;
</script>

<h1>{data.title}</h1>
