<script lang="ts">
	import Draggable from '$lib/Draggable.svelte';
	import Dropzone from '$lib/Dropzone.svelte';
	import { dragState } from '$lib/dragstate.svelte';
	import { flip } from 'svelte/animate';

	import jsonData from './data.json';
	let data = $state(jsonData);

	function handlePaneDrop(e: DragEvent, dropIndex?: number) {
		let target: HTMLElement | null = e.target as HTMLElement;
		if (!target.classList.contains('drop-zone')) {
			target = target.closest('.drop-zone');
		}
		if (!target) return;

		const dropping = e.dataTransfer?.getData('draggable-id');
		if (!dropping) return;

		const paneIndex = data.panes.findIndex((p) => p.id === dropping);
		const moving = data.panes[paneIndex];

		data.panes = data.panes.filter((p) => p.id !== dropping);

		if (dropIndex != null) {
			data.panes.splice(dropIndex, 0, moving);
		} else {
			data.panes.push(moving);
		}
	}
	function ondrop(e: DragEvent, dropIndex?: number) {
		let target: HTMLElement | null = e.target as HTMLElement;
		if (!target.classList.contains('drop-zone')) {
			target = target.closest('.drop-zone');
		}
		if (!target) return;

		const droppedTo = target.dataset.id;
		let droppedFrom = e.dataTransfer?.getData('draggable-from-id');
		if (!droppedFrom) {
			droppedFrom = dragState.dragFrom?.dataset.id;
		}
		const dropping = e.dataTransfer?.getData('draggable-id');

		const movingFromPane = data.panes.find((p) => p.id === droppedFrom);
		const movingToPane = data.panes.find((p) => p.id === droppedTo);

		if (!movingFromPane || !movingToPane) {
			console.log('missing a pane');
			return;
		}

		const movingIndex = movingFromPane?.children.findIndex((c) => c.id === dropping);
		const moving = movingFromPane?.children[movingIndex];

		if (!moving) {
			console.log('nothing to move', { droppedFrom, droppedTo, dropping });
			return;
		}
		movingFromPane.children = movingFromPane.children.filter((c) => c.id !== dropping);

		if (dropIndex != null) {
			movingToPane.children.splice(dropIndex, 0, moving);
		} else {
			movingToPane.children.push(moving);
		}
	}
</script>

{#snippet card(c)}
	<Draggable type="card" id={c.id}>
		<article class="card">
			<h3>{c.title}</h3>
		</article>
	</Draggable>
{/snippet}

{#snippet pane(p)}
	<section class="pane">
		<h1>{p.title}</h1>
		<Dropzone accepts={['card']} id={p.id} {ondrop}>
			{#snippet placeholder()}
				Drop here
			{/snippet}
			{#if p.children}
				{#each p.children as c (c.id)}
					<div animate:flip={{ duration: 100 }}>
						{@render card(c)}
					</div>
				{/each}
			{/if}
		</Dropzone>
	</section>
{/snippet}

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<Dropzone accepts={['pane']} id="root" horizontalList ondrop={handlePaneDrop}>
	<section class="board">
		{#each data.panes as p (p.id)}
			<Draggable type="pane" id={p.id}>
				{@render pane(p)}
			</Draggable>
		{/each}
	</section>
</Dropzone>

<style>
	.pane {
		padding: 1rem;
		border: 1px dotted grey;
		width: 200px;
	}
	.card {
		border: 1px solid lightgrey;
		padding: 0.5rem;
	}
	.board {
		gap: 1rem;
		min-height: 50vh;
		display: flex;
		overflow: auto;
	}
</style>
