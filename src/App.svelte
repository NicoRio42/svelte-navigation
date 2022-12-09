<script lang="ts">
  import Loading from "./components/Loading.svelte";
  import { link } from "./lib/links";
  import type { Routes } from "./lib/models/route";
  import { back, forward } from "./lib/navigation";
  import Router from "./lib/Router.svelte";
  import About from "./routes/About.svelte";
  import Home from "./routes/Home.svelte";
  import Login from "./routes/Login.svelte";
  import PostsOverview, {
    loadData as loadPosts,
  } from "./routes/PostsOverview.svelte";

  function waitfor2Seconds() {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, 2000);
    }).then(function () {
      console.log("Wrapped setTimeout after 2000ms");
    });
  }

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
  };
</script>

<h1>Svelte tourer</h1>

<button on:click={back}>Back</button>
<button on:click={forward}>Forward</button>

<nav>
  <ul>
    <li><a href="/" use:link>Home</a></li>
    <li><a href="/about" use:link>About</a></li>
    <li><a href="/posts" use:link>Posts</a></li>
    <li><a href="https://www.google.com" use:link>Google</a></li>
  </ul>
</nav>

<Router {routes} />
