import React, { useEffect, useState } from "react";
import { getPageContent } from "../api/client";

const PAGE_SLUG = "das-sind-wir-1";

export default function DasSindWir() {
	const [content, setContent] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let isMounted = true;

		const loadContent = async () => {
			setIsLoading(true);
			setError("");

			try {
				const response = await getPageContent(PAGE_SLUG);
				if (isMounted) {
					setContent(response);
				}
			} catch (err) {
				if (isMounted) {
					setError(err.message || "Inhalt konnte nicht geladen werden");
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadContent();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<main className="page-shell">
			<section className="page-content">
				<div className="container page-text-wrap">
					{isLoading && <p className="lead text-telegrau mb-4">Inhalt wird geladen ...</p>}

					{!isLoading && error && <div className="alert alert-danger">{error}</div>}

					{!isLoading && !error && content && (
						<>
							<h1 className="display-5 fw-bold mb-3">{content.title}</h1>
							{content.lead && <p className="lead text-telegrau mb-4">{content.lead}</p>}

							{(content.paragraphs || []).map((paragraph, index) => (
								<p className="page-random-text mb-4" key={`${content.slug}-${index}`}>
									{paragraph}
								</p>
							))}
						</>
					)}
				</div>
			</section>
		</main>
	);
}
