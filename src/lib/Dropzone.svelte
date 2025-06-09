<script lang="ts">
	import type { Snippet } from 'svelte';
	import { dragState } from './dragstate.svelte';

	type Props = {
		id: string;
		accepts: string[];
		ondrop?: (e: DragEvent, index?: number) => void;
		placeholder?: Snippet;
		children?: Snippet;
		horizontalList?: boolean;
	};
	const { id, accepts, ondrop, placeholder, children, horizontalList = false }: Props = $props();

	let dropzone: HTMLDivElement | null = $state(null);
	const draggingOverClass = $derived(horizontalList ? 'dragging-horizontal-over' : 'dragging-over');
	const isActive = $derived(dragState.dragType && accepts.includes(dragState.dragType));

	function ondragover(e: DragEvent) {
		e.stopPropagation();
		if (!isActive) {
			return;
		}
		e.preventDefault();
		dragState.accepts = accepts;
		dragState.dragX = e.clientX;
		dragState.dragY = e.clientY;
		const bottomElem = findClosestElementUnder(e.clientY, e.clientX);
		findAllDraggableChildren().forEach(
			(child) => child !== bottomElem && child.classList.remove(draggingOverClass)
		);

		if (!bottomElem?.classList.contains('dragging')) {
			bottomElem?.classList.add(draggingOverClass);
		}
	}

	function ondragleave(e: DragEvent) {
		if (!isActive) return;
		e.stopPropagation();
		dragState.accepts = [];
		findAllDraggableChildren().forEach((child) => child.classList.remove(draggingOverClass));
	}

	function ondropWrapper(e: DragEvent) {
		const droppableChildren = findAllDraggableChildren();
		droppableChildren.forEach((child) => child.classList.remove(draggingOverClass));

		if (!isActive) return;
		e.stopPropagation();

		const bottomElem = findClosestElementUnder(e.clientY, e.clientX);
		if (bottomElem) {
			for (let i = 0; i < droppableChildren.length; i++) {
				const child = droppableChildren[i];
				if (child === bottomElem) {
					ondrop?.(e, i);
					return;
				}
			}
		}
		ondrop?.(e);
	}

	function findAllDraggableChildren(): HTMLElement[] {
		return Array.from(
			dropzone?.querySelectorAll<HTMLElement>('.drop-zone .draggable:not(.dragging)') ?? []
		)
			.sort((a, b) =>
				horizontalList
					? a.getBoundingClientRect().right - b.getBoundingClientRect().right
					: a.getBoundingClientRect().top - b.getBoundingClientRect().top
			)
			.filter((d) => accepts.includes(d.dataset?.type ?? ''));
	}

	function findClosestElementUnder(y: number, x: number): HTMLElement | undefined {
		const draggableElements = findAllDraggableChildren();

		type ReturnValue = { offset: number; element?: HTMLElement };
		return draggableElements.reduce(
			(closest: ReturnValue, element: HTMLElement) => {
				const { top, left, height, width } = element.getBoundingClientRect();
				const offset = horizontalList ? x - left - width / 2 : y - top - height / 2;

				if (offset < 0 && offset > closest.offset) {
					return { offset, element };
				}

				return closest;
			},
			{ offset: Number.NEGATIVE_INFINITY, element: undefined }
		).element;
	}
</script>

<div
	class="drop-zone"
	bind:this={dropzone}
	{ondragleave}
	{ondragover}
	ondrop={ondropWrapper}
	role="region"
	data-id={id}
	data-accepts={accepts}
>
	{#if children}
		{@render children?.()}
	{:else}
		{@render placeholder?.()}
	{/if}
</div>

<style>
	.drop-zone :global(.dragging-over) {
		transition: margin-top 0.2s;
		margin-top: 0.5rem;
	}
	.drop-zone :global(.dragging-horizontal-over) {
		transition: margin-right 0.2;
		margin-right: 0.5rem;
	}
	.drop-zone {
		height: 100%;
		width: 100%;
		border: 1px dotted grey;
		padding: 1rem;
		box-sizing: border-box;
	}
</style>
