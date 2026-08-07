import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getAuthSession } from "../utils/auth";

export default function Entdecken() {
	const mapContainerRef = useRef(null);
	const mapRef = useRef(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [mapMeta, setMapMeta] = useState(null);

	useEffect(() => {
		let cancelled = false;

		const initMap = async () => {
			setError("");
			setIsLoading(true);

			try {
				const session = getAuthSession();
				if (!session?.token) {
					throw new Error("Nicht angemeldet");
				}

				const response = await fetch("/api/member/entdecken/map-init", {
					headers: {
						authorization: `Bearer ${session.token}`
					}
				});

				const data = await response.json();
				if (!response.ok || !data.success) {
					throw new Error(data.message || "Map-Konfiguration konnte nicht geladen werden");
				}

				if (cancelled || !mapContainerRef.current) {
					return;
				}

				mapRef.current = new maplibregl.Map({
					container: mapContainerRef.current,
					style: data.map.styleUrl,
					center: data.map.center,
					zoom: data.map.zoom,
					attributionControl: true
				});

				setMapMeta(data.map);
			} catch (err) {
				if (!cancelled) {
					setError(err.message || "Karte konnte nicht geladen werden");
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		};

		initMap();

		return () => {
			cancelled = true;
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
		};
	}, []);

	return (
		<main className="page-shell">
			<section className="page-content">
				<div className="container page-text-wrap">
					<h1 className="display-5 fw-bold mb-3">Entdecken</h1>
					<p className="lead text-telegrau mb-4">
						Dieser Bereich ist für zahlende Nutzer. Die Karte wird über eine geschützte API-Konfiguration initialisiert.
					</p>

					{isLoading && <p className="mb-3">Karte wird geladen ...</p>}
					{error && <div className="alert alert-danger">{error}</div>}

					<div
						ref={mapContainerRef}
						style={{
							height: "480px",
							borderRadius: "12px",
							overflow: "hidden",
							border: "1px solid rgba(255,255,255,0.22)"
						}}
					/>

					{mapMeta?.attribution && (
						<p className="small mt-3 mb-0 text-telegrau">
							Kartendaten: <a href={mapMeta.attribution.providerUrl} target="_blank" rel="noreferrer">{mapMeta.attribution.provider}</a>{" "}
							[© <a href={mapMeta.attribution.openMapTilesUrl} target="_blank" rel="noreferrer">OpenMapTiles</a>] · Data from{" "}
							<a href={mapMeta.attribution.openStreetMapCopyrightUrl} target="_blank" rel="noreferrer">OpenStreetMap</a>
						</p>
					)}
				</div>
			</section>
		</main>
	);
}
