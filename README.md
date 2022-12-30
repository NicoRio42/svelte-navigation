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
- [x] global loading and error component -->

# Svelte navigation

A data loading friendly, type safe, config based router for Svelte.

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
