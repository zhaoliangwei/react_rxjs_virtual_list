import "./App.css";

import VirtualList from "./VirtualList";

const data = new Array(1000).fill(0).map((_, i) => i + 1);

function App() {
	return (
		<div className='App'>
			<VirtualList
				style={{
					height: "300px",
					border: "2px solid gray",
					borderRadius: "10px",
				}}
				rowRender={(v) => <div>{v}</div>}
				rowHeight={30}
				data={data}
			/>
		</div>
	);
}

export default App;
