<!-- - [x] params matching
- [x] lazy loading
- [x] data loading
- [x] loading component
- [x] query params
- [x] route pre-conditions
- [x] hash handling
- [x] navigation events
- [x] programatic navigation
- [x] nested routing
- [x] error handling
- [x] hash based routing
- [ ] tests
- [ ] fallback route
- [ ] documentation
- [x] global loading and error component

TODO
- Simple async component
- Error router event
- Router events data
- Redirection path as string for pre-conditions
- String arg for navigation functions
 -->

# Svelte navigation

A "data-loading friendly", type safe, config based router for Svelte. Inspired by [svelte-spa-router](https://github.com/ItalyPaleAle/svelte-spa-router/blob/master/Router.svelte).

## Installation

```
npm install svelte-navigation
```

## Quickstart

```svelte
<script lang="ts">
    import About from "./routes/About.svelte";
    import Home from "./routes/Home.svelte";
    import type { Routes } from "svelte-navigation/models/route";
    import Router, { link } from "svelte-navigation/Router.svelte";

    const routes: Routes = {
        "/": Home,
        "/about": About,
    }
</script>

<nav>
  <ul>
    <li><a href="/" use:link>Home</a></li>
    <li><a href="/about" use:link>About</a></li>
  </ul>
</nav>


<Router {routes}/>
```

## Routing

### Basic routing

Routes should be defined as a javascript object and passed to the Router component as the `routes` prop.

Keys of this object are strings representing the path (with parameters), and values are Svelte components or another configuration object for more complex use cases.

```svelte
<script lang="ts">
...
    const routes: Routes = {
        "/": Home,
        "/about": About,
        // With a path param
        "/posts/:slug": Post,
        // With an optional path param
        "/posts/:from/:to?": PostsOverview,
        // With a wildcard
        "/page/*": Page,
        // Fallback component, must be at the end
        "*": Fallback,
    }
</script>

<Router {routes}/>
```

The Router passes path and search params as props to the matching component.

```svelte
// Post component
<script lang="ts">
  export let pathParams: PathParams
  export let serarchParams: SearchParams
</script>

<h1>The slug of this post is {pathParams.slug}</h1>
```

### Async routes

Components can be dynamically imported to enable code-splitting.

```js
const routes: Routes = {
  "/": Home,
  "/about": {
    asyncComponent: () => import("./About.svelte"),
  },
};
```

### Pre-conditions

You can define a pre-condition (or an array of preconditions) that act as a guard for the route.

A pre-condition is a function that return either a boolean, a Promise of a boolean, a redirection path, or a Promise of a redirection path. These functions can take an optionnal object as parameter that can contain the location object, the path parameters and the search parameters.

```js
async function asyncCondition(options: {
  location: RouterLocation,
  pathParams: PathParams,
  searchParams: SearchParams,
}) {
  // Do something with options arguments
  return Math.random() > 0.5 || "/login";
}

const routes: Routes = {
  "/": Home,
  "/about": {
    asyncComponent: () => import("./About.svelte"),
    conditions: [
      () => Math.random() > 0.5,
      () => asyncCondition,
      () => Promise.resolve(Math.random() > 0.5),
      () => Promise.resolve(Math.random() > 0.5 || "/login"),
    ],
  },
};
```

If the returned value is false, the navigation is canceled. If the result is a redirection path, the router performs a redirection to that location.

### Data loading

If a loading function is provided, the router will execute it and pass the result as a `data` prop to the component.

For a lazy-loaded route, export a `loadData` function in a `context="module"` script tag in the route component.

```svelte
<script lang="ts" context="module">
  export async function loadData(): Promise<Post[]> {
    const posts = await fetch("https://jsonplaceholder.typicode.com/posts");
    return await posts.json();
  }
</script>

<script lang="ts">
  import type { Post } from "../models/post";

  export let data: Post[];
</script>

{#each data as post}
  <p>{post.title}</p>
{/each}
```

For a statically-imported component route, put the loading function in the loadData property of the route.

```js
import About, { loadData } from "About.svelte";

const routes: Routes = {
  "/": Home,
  "/about": {
    component: () => About,
    loadData,
  },
};
```

### Type safety

### Loading component

### Error component

### Router events

## Navigation

### Links

### Programatic navigation
