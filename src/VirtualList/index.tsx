import { HTMLAttributes, useEffect, useRef, useState } from "react";
import { BehaviorSubject, filter } from "rxjs";
import * as S from "./styled";
import ListModel from "../model/ListModel";

const containerHeight$ = new BehaviorSubject<number>(0);

interface PropsType<T> extends Omit<HTMLAttributes<HTMLDivElement>, "ref"> {
	rowRender: (val: T, idx: number) => JSX.Element;
	rowHeight: number;
	data: T[];
}

const establishListModel = <T extends any>(params: {
	el: HTMLDivElement;
	rowHeight: number;
	visibleHeight: number;
	data: T[];
	renderData: (p: { data: T[]; start: number }) => void;
}) => new ListModel(params);

const VirtualList = <T extends any>(props: PropsType<T>) => {
	const { rowRender, rowHeight, data, ...resProps } = props;

	// ref
	const containerRef = useRef<HTMLDivElement | null>(null);

	const [renderData, setRenderData] = useState<T[]>([]);
	const [startIdx, setStartIdx] = useState(0);

	useEffect(() => {
		if (containerRef.current) {
			const subscription = containerHeight$
				.pipe(filter((v) => Boolean(v)))
				.subscribe((visibleHeight) => {
					establishListModel({
						rowHeight,
						visibleHeight,
						el: containerRef.current!,
						data,
						renderData: ({ data, start }) => {
							setRenderData(data);
							setStartIdx(start);
						},
					});
				});
			containerHeight$.next(containerRef.current.clientHeight);

			return () => {
				subscription.unsubscribe();
			};
		}
	}, [rowHeight, resProps.style?.height, data]);

	return (
		<S.Container {...resProps} ref={containerRef}>
			{renderData.map((d, idx) => (
				<S.ItemContainer
					key={idx}
					style={{
						height: `${rowHeight}px`,
						top: `${(idx + startIdx) * rowHeight}px`,
					}}
				>
					{rowRender(d, idx)}
				</S.ItemContainer>
			))}
			<S.HiddenArea style={{ height: `${data.length * rowHeight}px` }} />
		</S.Container>
	);
};

export default VirtualList;
