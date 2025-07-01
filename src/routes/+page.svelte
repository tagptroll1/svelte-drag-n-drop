<script lang="ts">
	import {flip} from "svelte/animate";

	const cards = $state([
		{ id: 'card-1', title: 'Card 1' },
		{ id: 'card-2', title: 'Card 2' },
		{ id: 'card-3', title: 'Card 3' }
	]);

	function ondragend(fromIndex: number) {
		return function (this: HTMLLIElement, e: DragEvent) {
			const droppedUnder = this.getBoundingClientRect().y < e.clientY;
			const siblings = this.closest('.dropzone')?.querySelectorAll<HTMLLIElement>('.draggable');

			for (const sibling of siblings!) {
				if (sibling === this) continue; // Skip ourself
				const { top, height } = sibling.getBoundingClientRect();

				const centerY = top + height / 2;
				const index = cards.findIndex((c) => c.id === sibling.dataset.id);

				if (e.clientY < centerY) {
					const toIndex = droppedUnder ? index - 1 : index;
					swap(fromIndex, toIndex);
					return;
				}
			}
			const toIndex = cards.length - 1;
			swap(fromIndex, toIndex);
		};
	}

	function swap(fromIndex: number, toIndex: number) {
		cards.splice(toIndex, 0, ...cards.splice(fromIndex, 1));
	}
</script>

<ol class="dropzone">
	{#each cards as {title, id}, index (id)}
		<li draggable={true} class="draggable" animate:flip={{duration: 250}} ondragend={ondragend(index)} data-id={id}>
			{title} <span>=</span>
		</li>
	{/each}
</ol>

<style>
	ol {
		display: flex;
		gap: 0.2rem;
		flex-direction: column;
		position: relative;
		width: 20vw;
	}
	li {
		display: flex;
		justify-content: space-between;
		border: 1px solid grey;
		padding: 2rem;
		background: lightgrey;
	}
</style>
