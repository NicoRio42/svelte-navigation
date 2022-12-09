<script lang="ts" context="module">
  import type { Params } from "../lib/models/params";
  import type { Routes } from "../lib/models/route";

  export async function loadData(params?: Params): Promise<User> {
    const post = await fetch(
      `https://jsonplaceholder.typicode.com/users/${params?.userId}`
    );
    return (await post.json()) as unknown as User;
  }
</script>

<script lang="ts">
  import Router from "../lib/Router.svelte";
  import type { User } from "../models/user";

  export let data: User;

  const routes: Routes = {
    "/": {
      asyncComponent: () => import("./UserTodosOverview.svelte"),
    },
    "/todos/:todoId": {
      asyncComponent: () => import("./Todo.svelte"),
    },
  };
</script>

<h1>{data.name}</h1>

<Router {routes} />
