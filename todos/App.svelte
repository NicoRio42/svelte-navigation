<script lang="ts">
  import type { Routes } from "../src/lib/models/route";
  import Router from "../src/lib/Router.svelte";
  import Error from "./Error.svelte";
  import NotFound from "./NotFound.svelte";
  import { todosSearchParamsSchema } from "./TodosOverview.svelte";

  const routes: Routes = {
    "/todos": {
      asyncComponent: () => import("./TodosOverview.svelte"),
      seachParamsSchema: todosSearchParamsSchema,
    },
    "/todos/:todoId": {
      asyncComponent: () => import("./Todo.svelte"),
    },
    "**": NotFound,
  };
</script>

<a href="/about">About</a>

<Router {routes} errorComponent={Error} />
