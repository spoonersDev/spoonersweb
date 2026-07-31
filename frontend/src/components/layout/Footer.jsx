import React from "react";

export default function Footer() {
	return (
		<footer className="border-top border-secondary-subtle mt-5 py-4">
			<div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
				<small className="text-telegrau">© 2024 - 2026 spooners on tour</small>
				<div className="d-flex gap-3">
					<a
						className="text-decoration-none text-light"
						href="https://instagram.com/spooners_on_tour"
						target="_blank"
						rel="noreferrer"
					>
						Instagram
					</a>
					<a
						className="text-decoration-none text-light"
						href="https://youtube.com/@spoonersontour"
						target="_blank"
						rel="noreferrer"
					>
						YouTube
					</a>
				</div>
			</div>
		</footer>
	);
}
