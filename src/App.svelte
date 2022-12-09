<script lang="ts">
  import Loading from "./components/Loading.svelte";
  import { link } from "./lib/links";
  import { queryParams } from "./lib/location";
  import type { Routes } from "./lib/models/route";
  import Router from "./lib/Router.svelte";
  import About from "./routes/About.svelte";
  import Home from "./routes/Home.svelte";
  import PostsOverview, {
    loadData as loadPosts,
  } from "./routes/PostsOverview.svelte";

  const routes: Routes = {
    "/": Home,
    "/about": About,
    "/posts": {
      component: PostsOverview,
      loadData: loadPosts,
      loadingComponent: Loading,
    },
    "/posts/:id": {
      asyncComponent: () => import("./routes/Post.svelte"),
      loadingComponent: Loading,
    },
  };
</script>

<h1>Svelte tourer</h1>

<nav>
  <ul>
    <li><a href="/" use:link>Home</a></li>
    <li><a href="/about" use:link>About</a></li>
    <li><a href="/posts" use:link>Posts</a></li>
    <li><a href="https://www.google.com" use:link>Google</a></li>
  </ul>
</nav>

<Router {routes} />
