type DragState = {
	isDragging: boolean;
	dragX?: number;
	dragY?: number;
	type?: string;
	accepts?: string[];
	data?: any;
	dragFrom?: HTMLElement;
	dragElement?: HTMLElement;
};

function createDragState() {
	let dragState: DragState = $state({ isDragging: false });

	const X = $derived(dragState.dragX ?? 0)
	const Y = $derived(dragState.dragY ?? 0)
	const dragElement = $derived(dragState.dragElement)
	const dropzone = $derived(dragState.dragElement?.closest(".drop-zone"));
	const draggableChildren = $derived.by(() => {
		return Array.from<HTMLElement>(dropzone?.querySelectorAll(".draggable") ?? [])
			.filter((el: HTMLElement) => el.dataset?.type === dragState.type)
	});
	const childrenSortedByX = $derived(draggableChildren.sort((a, b) => a.getBoundingClientRect().right - b.getBoundingClientRect().right));
	const childrenSortedByY = $derived(draggableChildren.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top));
	const isValidDropzone = $derived(dragState.accepts?.includes(dragState.type ?? '') ?? false)
	const nearestElementUnder = $derived.by(() => {
		if (!Y) return -1;

		console.log($state.snapshot(childrenSortedByY));
		for (let i = childrenSortedByY.length - 1; i > 0; i--) {
			const child = childrenSortedByY[i];
			if (child === dragElement) continue;

			const { top, height } = child.getBoundingClientRect()
			const offset = Y - top - (height / 2)
			console.log({ top, height, Y, offset, child })
			if (offset <= 0) {
				return i
			}
		}
		return -1
	});
	let dropIndex = $derived(0);

	$effect.root(() => {
		$effect(() => {
			$inspect(nearestElementUnder)
		});
	})
	/*
	 *
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
		*/

	return {
		stopDragging: () => {
			dragState.isDragging = false
			dragState.data = undefined;
			dragState.dragFrom = undefined;
			dragState.dragElement = undefined;
			dragState.type = undefined;
		},
		get dragX() { return dragState.dragX },
		set dragX(v) { dragState.dragX = v },
		get dragY() { return dragState.dragY },
		set dragY(v) { dragState.dragY = v },
		set isDragging(v) {
			dragState.isDragging = v;
		},
		get isDragging() {
			return dragState.isDragging;
		},
		set accepts(v) {
			dragState.accepts = v;
		},
		get accepts() {
			return dragState.accepts;
		},
		set dragElement(v) {
			//			console.log("set elem", v)
			dragState.dragElement = v;
		},
		get dragElement() {
			return dragState.dragElement;
		},
		set dragFrom(v) {
			dragState.dragFrom = v;
		},
		get dragFrom() {
			return dragState.dragFrom;
		},
		set dragData(v) {
			dragState.data = v;
		},
		get dragData() {
			return dragState.data;
		},
		set dragType(v) {
			dragState.type = v;
		},
		get dragType() {
			return dragState.type;
		}
	};
}

const dragState = createDragState()
export { dragState, type DragState }
