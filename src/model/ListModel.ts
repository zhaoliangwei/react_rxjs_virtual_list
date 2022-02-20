import { combineLatest, fromEvent, map, Observable, of, startWith } from "rxjs";

class ListModel<T> {
	/** el */
	private el: HTMLDivElement;
	/** 总data */
	private data$: Observable<T[]>;
	/** 单条 row 的高度 */
	private rowHeight$: Observable<number>;
	/** 视区高度 */
	// private visibleHeight$: Observable<number>;
	/** 可滑动的总高度 */
	// private scrollHeight$: Observable<number>;
	/** 当前已滑动高度 */
	private scrollTop$: Observable<number>;
	/** 视区内可以展示的item总数 */
	private itemCount$: Observable<number>;

	/** 将数据传回给react组件 */
	private backToReact: (p: { data: T[]; start: number }) => void;

	constructor(params: {
		el: HTMLDivElement;
		rowHeight: number;
		visibleHeight: number;
		data: T[];
		renderData: (p: { data: T[]; start: number }) => void;
	}) {
		const { el, visibleHeight, rowHeight, data, renderData } = params;

		this.el = el;
		// this.visibleHeight$ = of(visibleHeight);
		this.rowHeight$ = of(rowHeight);
		this.data$ = of(data);
		// this.scrollHeight$ = of(rowHeight * data.length);
		this.scrollTop$ = of(0);
		this.itemCount$ = of(Math.ceil(visibleHeight / rowHeight));
		this.backToReact = renderData;

		/** 将初始化的显示数据传回React组件 */
		this.initRenderData();
		/** 绑定el的scroll事件 */
		this.bindScrollEvent();
		/** 监听scroll事件 */
		this.handleScrollTopChange();
	}

	private initRenderData() {
		combineLatest([this.itemCount$, this.data$])
			.pipe(
				map(([count, data]) => ({ data: data.slice(0, count + 1), start: 0 }))
			)
			.subscribe(this.backToReact)
			.unsubscribe();
	}

	private bindScrollEvent() {
		this.scrollTop$ = fromEvent(this.el, "scroll").pipe(
			startWith({ target: { scrollTop: 0 } } as unknown as Event),
			//@ts-expect-error
			map((v) => (v.target?.scrollTop || 0) as number)
		);
	}

	private handleScrollTopChange() {
		combineLatest([
			this.scrollTop$,
			this.data$,
			this.itemCount$,
			this.rowHeight$,
		])
			.pipe(
				map(([scrollTop, data, count, rHeight]) => {
					const preIndex = Math.floor(scrollTop / rHeight);
					return {
						data: data.slice(preIndex, count + preIndex + 1),
						start: preIndex,
					};
				})
			)
			.subscribe(this.backToReact);
	}
}

export default ListModel;
