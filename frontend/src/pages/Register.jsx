import React, { useState } from "react";
import { Link } from "react-router-dom";

const initialFormData = {
	firstName: "",
	lastName: "",
	email: "",
	emailConfirmation: "",
	password: "",
	passwordConfirmation: ""
};

export default function Register() {
	const [formData, setFormData] = useState(initialFormData);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((previous) => ({ ...previous, [name]: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");
		setMessage("");

		if (formData.email.trim().toLowerCase() !== formData.emailConfirmation.trim().toLowerCase()) {
			setError("Die E-Mail-Adressen stimmen nicht überein.");
			return;
		}

		if (formData.password.length < 10) {
			setError("Das Passwort muss mindestens 10 Zeichen lang sein.");
			return;
		}

		if (formData.password !== formData.passwordConfirmation) {
			setError("Die Passwörter stimmen nicht überein.");
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await fetch("http://localhost:5001/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData)
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Registrierung fehlgeschlagen.");
			}

			setMessage(data.message);
			setFormData(initialFormData);
		} catch (requestError) {
			setError(requestError.message || "Registrierung fehlgeschlagen.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="page-shell">
			<section className="page-content d-flex align-items-center">
				<div className="container py-4">
					<div className="row justify-content-center">
						<div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
							<div className="card bg-dark text-light border-secondary shadow-lg">
								<div className="card-body p-4 p-md-5">
									<h1 className="h3 mb-2 text-center">Registrieren</h1>
									<p className="text-telegrau text-center mb-4">Erstelle dein Mitgliedskonto.</p>

									<form onSubmit={handleSubmit}>
										<div className="row">
											<div className="col-md-6 mb-3"><label htmlFor="firstName" className="form-label">Vorname</label><input id="firstName" name="firstName" type="text" className="form-control" value={formData.firstName} onChange={handleChange} autoComplete="given-name" required /></div>
											<div className="col-md-6 mb-3"><label htmlFor="lastName" className="form-label">Nachname</label><input id="lastName" name="lastName" type="text" className="form-control" value={formData.lastName} onChange={handleChange} autoComplete="family-name" required /></div>
										</div>
										<div className="mb-3"><label htmlFor="email" className="form-label">E-Mail-Adresse</label><input id="email" name="email" type="email" className="form-control" value={formData.email} onChange={handleChange} autoComplete="email" required /></div>
										<div className="mb-3"><label htmlFor="emailConfirmation" className="form-label">E-Mail-Adresse wiederholen</label><input id="emailConfirmation" name="emailConfirmation" type="email" className="form-control" value={formData.emailConfirmation} onChange={handleChange} autoComplete="email" required /></div>
										<div className="mb-3"><label htmlFor="password" className="form-label">Passwort</label><input id="password" name="password" type="password" className="form-control" value={formData.password} onChange={handleChange} autoComplete="new-password" minLength="10" required /><div className="form-text text-telegrau">Mindestens 10 Zeichen.</div></div>
										<div className="mb-4"><label htmlFor="passwordConfirmation" className="form-label">Passwort wiederholen</label><input id="passwordConfirmation" name="passwordConfirmation" type="password" className="form-control" value={formData.passwordConfirmation} onChange={handleChange} autoComplete="new-password" minLength="10" required /></div>

										<button type="submit" className="btn btn-telemagenta w-100 mb-3" disabled={isSubmitting}>{isSubmitting ? "Wird registriert …" : "Registrierung anfordern"}</button>
										{message && <div className="alert alert-success py-2">{message}</div>}
										{error && <div className="alert alert-danger py-2">{error}</div>}
										<div className="text-center"><Link to="/login" className="text-decoration-none text-light">Zurück zum Login</Link></div>
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