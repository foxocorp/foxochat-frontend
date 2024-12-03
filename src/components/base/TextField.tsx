import "./TextField.css";

export function TextField({ label, type }) {
	return (
		<div className="textField">
			<input placeholder={label} type={type} />
		</div>
	);
}
