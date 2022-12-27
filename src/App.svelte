<script lang="ts">
  import Loading from "./components/Loading.svelte";
  import { getConfig } from "./lib/config";
  import type { Routes } from "./lib/models/route";
  import { back, forward, link } from "./lib/Router.svelte";
  import Router from "./lib/Router.svelte";
  import About from "./routes/About.svelte";
  import Error from "./routes/Error.svelte";
  import Home from "./routes/Home.svelte";
  import Login from "./routes/Login.svelte";
  import PostsOverview, {
    loadData as loadPosts,
  } from "./routes/PostsOverview.svelte";
  import { waitfor2Seconds } from "./utils/wait";

  const routes: Routes = {
    "/": Home,
    "/about": About,
    "/login": Login,
    "/posts": {
      component: PostsOverview,
      loadData: loadPosts,
      loadingComponent: Loading,
    },
    "/posts/:id": {
      asyncComponent: () => import("./routes/Post.svelte"),
      loadingComponent: Loading,
      conditions: [
        () => true,
        async () => {
          await waitfor2Seconds();
          return { path: "/login" };
        },
      ],
    },
    "/users": {
      asyncComponent: () => import("./routes/UsersOverview.svelte"),
    },
    "/users/:userId": {
      asyncComponent: () => import("./routes/User.svelte"),
    },
    "/users/:userId/*": {
      asyncComponent: () => import("./routes/User.svelte"),
    },
    "/pictures": {
      asyncComponent: () => import("./routes/Pictures.svelte"),
      loadingComponent: Loading,
      errorComponent: Error,
    },
  };
</script>

<h1>Svelte tourer</h1>

<button on:click={back}>Back</button>
<button on:click={forward}>Forward</button>

<nav>
  <ul>
    {#if getConfig().hashMode}
      <li><a href="#/">Home</a></li>
      <li><a href="#/about">About</a></li>
      <li><a href="#/posts">Posts</a></li>
      <li><a href="#/users">Users</a></li>
      <li><a href="#/pictures">Pictures with error</a></li>
      <li><a href="https://www.google.com">Google</a></li>
    {:else}
      <li><a href="/" use:link>Home</a></li>
      <li><a href="/about" use:link>About</a></li>
      <li><a href="/posts" use:link>Posts</a></li>
      <li><a href="/users" use:link>Users</a></li>
      <li><a href="/pictures" use:link>Pictures with error</a></li>
      <li><a href="https://www.google.com">Google</a></li>
    {/if}
  </ul>
</nav>

<Router {routes} />
