import "./Button.css";

export function Button({ children, width = 256 }) {
	return (
		<button className="button" style={{ width }}>
			{children}
		</button>
	);
}
