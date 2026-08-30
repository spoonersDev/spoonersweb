import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuthSession } from "../utils/auth";

export default function AdminLogin({
	redirectPath = "/entdecken",
	title = "Login",
	subtitle = "Willkommen zurück"
}) {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({ email: "", password: "" });
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");
		setMessage("");

		try {
			const response = await fetch("http://localhost:5001/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData)
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Login fehlgeschlagen");
			}

			saveAuthSession({ token: data.token, user: data.user });
			setMessage(data.message || "Anmeldung erfolgt");
			navigate(redirectPath, { replace: true });
		} catch (err) {
			setError(err.message || "Login fehlgeschlagen");
		}
	};

	return (
		<main className="page-shell">
			<section className="page-content d-flex align-items-center">
				<div className="container">
					<div className="row justify-content-center">
						<div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
							<div className="card bg-dark text-light border-secondary shadow-lg">
								<div className="card-body p-4 p-md-5">
										<h1 className="h3 mb-2 text-center">{title}</h1>
										<p className="text-telegrau text-center mb-4">{subtitle}</p>

									<form onSubmit={handleSubmit}>
										<div className="mb-3">
											<label htmlFor="email" className="form-label">
												E-Mail-Adresse
											</label>
											<input
												type="email"
												className="form-control"
												id="email"
												name="email"
												value={formData.email}
												onChange={handleChange}
												autoComplete="email"
												placeholder="Deine E-Mail-Adresse"
												required
											/>
										</div>

										<div className="mb-4">
											<label htmlFor="password" className="form-label">
												Passwort
											</label>
											<input
												type="password"
												className="form-control"
												id="password"
												name="password"
												value={formData.password}
												onChange={handleChange}
												autoComplete="current-password"
												placeholder="Dein Passwort"
												required
											/>
										</div>

										<button type="submit" className="btn btn-telemagenta w-100 mb-3">
											Anmelden
										</button>

										{message && <div className="alert alert-success py-2">{message}</div>}
										{error && <div className="alert alert-danger py-2">{error}</div>}

										<div className="d-flex flex-column flex-sm-row justify-content-between gap-2 text-center">
											<a href="/register" className="text-decoration-none text-light">
												Registrieren
											</a>
											<a href="/forgot-password" className="text-decoration-none text-light">
												Passwort vergessen?
											</a>
										</div>
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
