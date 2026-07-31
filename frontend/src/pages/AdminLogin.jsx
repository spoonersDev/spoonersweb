import React from "react";

export default function AdminLogin() {
	return (
		<main className="page-shell">
			<section className="page-content d-flex align-items-center">
				<div className="container">
					<div className="row justify-content-center">
						<div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
							<div className="card bg-dark text-light border-secondary shadow-lg">
								<div className="card-body p-4 p-md-5">
									<h1 className="h3 mb-2 text-center">Login</h1>
									<p className="text-telegrau text-center mb-4">Admin-Bereich</p>

									<form>
										<div className="mb-3">
											<label htmlFor="username" className="form-label">
												Benutzername
											</label>
											<input
												type="text"
												className="form-control"
												id="username"
												name="username"
												autoComplete="username"
												placeholder="Dein Benutzername"
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
												autoComplete="current-password"
												placeholder="Dein Passwort"
												required
											/>
										</div>

										<button type="submit" className="btn btn-telemagenta w-100">
											Anmelden
										</button>
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
