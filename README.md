# Dead simple Svelte Drag and Drop

Why make it complicated. This simple re-orderable drag and drop handles most of the need, mostly utilizing the HTML5 api, event handlers and just a tiny bit of svelte (Reactivity, rerendering and animation). Which could also be removed in favor of HTML5 apies like node.swap. 

## Developing

Once you've created a project and installed dependencies with `pnpm install`, start a development server:

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
