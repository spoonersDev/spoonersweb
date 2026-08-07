import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
	return (
		<main className="page-shell">
			<section className="page-content hero-page-content">
				<div className="container text-center page-text-wrap">
					<h1 className="display-5 fw-bold mb-3">Willkommen bei spooners on tour</h1>
					<p className="lead text-telegrau mb-4">Das sind wir. Unimog Projekt. Blog.</p>

					<div className="d-flex flex-column flex-md-row justify-content-center gap-3">
						<Link to="/das-sind-wir-1" className="btn hero-cta btn-lg">
							Das sind wir
						</Link>
						<Link to="/unimog-projekt" className="btn hero-cta btn-lg">
							Unimog Projekt
						</Link>
						<Link to="/blog" className="btn hero-cta btn-lg">
							Blog
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
