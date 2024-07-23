import { useState, useEffect } from "react";
import "./App.css";

function App() {
	// "148f2eb3591b606a1d2bd36ac9e43666edbb5251644484430d21e780a1b6f695"
	const [current, setCurrent] = useState("settings");
	const [bgImage, setBgImage] = useState(null);
	const [scrollImage, setScrollImage] = useState(null);
	const [bgButtons, setBgButtons] = useState(null);
	const [scrollButtons, setScrollButtons] = useState(null);
	const [data, setData] = useState(null);
	const [folder, setFolder] = useState(null);

	useEffect(() => {
		setFolder(window.location.pathname);
		if (folder) {
			document.title = folder.replace("/", "");
			fetch(`.${folder}/data.json`)
				.then((r) => r.json())
				.then((d) => {
					setData(d);
				});
		}
	}, [folder]);
	useEffect(() => {
		if (data) {
			setBgImage(`.${folder}/` + data?.[current]?.img_filename + ".png");
			setBgButtons(data?.[current]?.buttons);
			if (data?.[current]?.scroll_area) {
				setScrollImage(`.${folder}/` + data?.[current]?.scroll_area?.img_filename + ".png");
				setScrollButtons(data?.[current]?.scroll_area?.buttons);
			}
		}
	}, [data, current, folder]);
	return (
		<div className="relative_div" id="container" style={{ width: 2409 }}>
			<img id="bg-img" src={bgImage} />
			{bgButtons?.map((btn, idx) => {
				return (
					<div
						key={idx}
						className={"btn"}
						style={{
							zIndex: 10,
							position: "absolute",
							left: btn.x,
							top: btn.y,
							width: btn.width,
							height: btn.height,
						}}
						onClick={() => {
							if (data && btn.target) {
								setCurrent(btn.target);
							}
						}}></div>
				);
			})}
			{data?.[current]?.scroll_area ? (
				<div
					id="scroll-img-container"
					style={{
						position: "relative",
						width: data?.[current].scroll_area.width,
						height: data?.[current].scroll_area.height,
						top: data?.[current].scroll_area.y,
						left: data?.[current].scroll_area.x,
					}}>
					<div id="scroll-buttons-container">
						{scrollButtons?.map((btn, idx) => {
							return (
								<div
									key={idx}
									data-target={btn?.title}
									className={"btn"}
									style={{
										zIndex: 10,
										position: "absolute",
										left: btn.x,
										top: btn.y,
										width: btn.width,
										height: btn.height,
									}}
									onClick={() => {
										if (data && btn.target) {
											setCurrent(btn.target);
										}
									}}></div>
							);
						})}
						<img
							id="scroll-img"
							src={scrollImage}
							style={{
								width: data?.[current].scroll_area.width,
							}}
						/>
					</div>
				</div>
			) : null}
		</div>
	);
}
export default App;
