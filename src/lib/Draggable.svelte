<script lang="ts">
	import type { Snippet } from 'svelte';
	import { dragState } from './dragstate.svelte';
	import { send, receive } from './transition';

	type Props = { id: string; type: string; children?: Snippet };
	const { id, type, children }: Props = $props();

	let draggable: HTMLDivElement | null = $state(null);
	let dragging = $state(false);

	$effect(() => {
		if (!dragState.isDragging) draggable?.classList.remove('dragging-over');
	});

	function ondragstart(e: DragEvent) {
		e.stopPropagation();
		dragging = true;
		dragState.dragType = type;
		dragState.isDragging = true;

		const dropzone = draggable?.closest('.drop-zone') as HTMLElement;
		if (!dropzone) return;

		dragState.dragFrom = dropzone;
		dragState.dragElement = draggable as HTMLElement;

		e.dataTransfer?.setData('draggable-id', id);
		e.dataTransfer?.setData('draggable-from-id', dropzone.dataset.id ?? '-1');
	}
	function ondragend(e: DragEvent) {
		dragging = false;
		dragState.stopDragging();
	}
</script>

<div
	in:receive={{ key: id }}
	out:send={{ key: id }}
	bind:this={draggable}
	draggable="true"
	class="draggable"
	class:dragging
	{ondragstart}
	{ondragend}
	role="menuitem"
	tabindex="0"
	data-id={id}
	data-type={type}
>
	{@render children?.()}
</div>

<style>
	.draggable {
		pointer-events: visible;
		transition: margin-top 0.2s;
		transition: margin-right 0.2s;
		margin-top: 0;
		margin-right: 0;
	}
	.dragging {
		cursor: grabbing;
		opacity: 0.3;
	}
</style>
