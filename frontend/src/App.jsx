import React from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import ContentPage from "./pages/ContentPage";
import Entdecken from "./pages/Entdecken";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { isAdmin } from "./utils/auth";

const randomParagraphs = [
	"Random Text: Zwischen Bergpass und Wüstenpiste sammeln wir Eindrücke, Geschichten und kleine Momente, die unterwegs oft größer werden als geplant.",
	"Random Text: Manchmal beginnt ein guter Tag mit einer Tasse Kaffee vor dem Fahrzeug und endet mit Sternenhimmel, Staub auf den Schuhen und einer neuen Route für morgen.",
	"Random Text: Diese Beispielabsätze sind Platzhalter, damit das Seitenlayout realistisch wirkt und der Scroll-Effekt im Alltag sauber getestet werden kann.",
	"Random Text: Jeder Abschnitt simuliert späteren Content wie Reiseberichte, Ausbau-Notizen, Checklisten, hilfreiche Tipps oder kleine Einblicke hinter die Kulissen.",
	"Random Text: Auf längeren Strecken merken wir immer wieder, wie wichtig ein ruhiges Design ist, damit Inhalte gut lesbar bleiben — auf Desktop wie auch mobil.",
	"Random Text: Wer unterwegs lebt, plant selten alles perfekt. Genau deshalb braucht es eine Website-Struktur, die flexibel bleibt und trotzdem klar geführt wirkt.",
	"Random Text: In der Praxis wechseln wir zwischen Offroad, Stadt, Werkstatt und Campingplatz — und genau diese Vielfalt soll später auch im Inhalt sichtbar werden.",
	"Random Text: Für den Moment dient dieser Text nur als Dummy-Inhalt, damit Abstände, Typografie und Seitenfluss zuverlässig bewertet werden können.",
	"Random Text: Wenn das Grundlayout steht, lassen sich echte Inhalte schnell einpflegen, ohne dass Design oder Struktur bei jeder Seite neu gedacht werden müssen.",
	"Random Text: Bis dahin hilft dieser Platzhalter, den finalen Look & Feel zu testen — inklusive Scroll-Verhalten, Leselänge und optischer Balance zur Navigation."
];

function BackgroundPage({ title }) {
	return (
		<main className="page-shell">
			<section className="page-content">
				<div className="container page-text-wrap">
					<h1 className="display-5 fw-bold mb-3">{title}</h1>
					<p className="lead text-telegrau mb-4">Beispielinhalt für Layout- und Scroll-Test.</p>

					{randomParagraphs.map((paragraph, index) => (
						<p className="page-random-text mb-4" key={`${title}-${index}`}>
							{paragraph}
						</p>
					))}
				</div>
			</section>
		</main>
	);
}

function DraftPreviewBanner() {
	const location = useLocation();
	const isDraftPreview = isAdmin() && new URLSearchParams(location.search).get("preview") === "draft";

	if (!isDraftPreview) return null;

	return (
		<div className="alert alert-warning rounded-0 mb-0 d-flex justify-content-between align-items-center gap-3">
			<span>
				<strong>Vorschau:</strong> Diese Änderungen sind noch nicht veröffentlicht.
			</span>
			<Link className="btn btn-sm btn-outline-dark" to="/admin">
				Zurück zum Adminbereich
			</Link>
		</div>
	);
}

export default function App() {
	return (
		<>
			<Header />
			<DraftPreviewBanner />

			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/das-sind-wir-1" element={<ContentPage />} />
				<Route
					path="/login"
					element={<AdminLogin title="Mitglieds-Login" subtitle="Einloggen für den Entdecken-Bereich" />}
				/>
				<Route
					path="/admin/login"
					element={<AdminLogin redirectPath="/admin" title="Admin Login" subtitle="Zugang zum Admin-Bereich" />}
				/>
				<Route path="/entdecken" element={<ProtectedRoute requirePaid />}>
					<Route index element={<Entdecken />} />
				</Route>
				<Route path="/admin" element={<ProtectedRoute requireAdmin loginPath="/admin/login" />}>
					<Route index element={<AdminDashboard />} />
				</Route>
				<Route path="/unser-van" element={<ContentPage />} />

				<Route path="/unimog-projekt" element={<ContentPage />} />
				<Route
					path="/unimog-projekt/fahrzeugvorstellung"
					 element={<ContentPage />}
				/>
				<Route
					path="/unimog-projekt/planung-konzept"
					 element={<ContentPage />}
				/>
				<Route
					path="/unimog-projekt/der-ausbau"
					 element={<ContentPage />}
				/>

				<Route path="/blog" element={<ContentPage />} />
				<Route
					path="/blog/east-tour-2024-2025"
					 element={<ContentPage />}
				/>
				<Route
					path="/blog/video-blog-vlog"
					 element={<ContentPage />}
				/>

				<Route
					path="/unsere-ausruestung"
					 element={<ContentPage />}
				/>
				<Route path="/kochen-im-van" element={<BackgroundPage title="Kochen im Van" />} />
				<Route
					path="/kochen-im-van/lieblingsgerichte"
					element={<BackgroundPage title="Lieblingsgerichte" />}
				/>
				<Route path="/nuetzliches" element={<ContentPage />} />
				<Route path="/wandern-1" element={<ContentPage />} />
				<Route path="/register" element={<Register />} />
				<Route
					path="/forgot-password"
					element={<BackgroundPage title="Passwort vergessen" />}
				/>
				<Route
					path="/so-erreichst-du-uns"
					 element={<ContentPage />}
				/>
				<Route path="/*" element={<ContentPage />} />
			</Routes>

			<Footer />
		</>
	);
}
