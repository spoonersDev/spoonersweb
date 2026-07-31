import React from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/SOT_Logo.jpg";

const menu = [
	{ label: "DAS SIND WIR", path: "/das-sind-wir-1" },
	{ label: "UNSER VAN", path: "/unser-van" },
	{
		label: "UNIMOG PROJEKT",
		path: "/unimog-projekt",
		children: [
			{ label: "Fahrzeugvorstellung", path: "/unimog-projekt/fahrzeugvorstellung" },
			{ label: "Planung & Konzept", path: "/unimog-projekt/planung-konzept" },
			{ label: "Der Ausbau", path: "/unimog-projekt/der-ausbau" }
		]
	},
	{
		label: "BLOG",
		path: "/blog",
		children: [
			{ label: "East Tour 2024/2025", path: "/blog/east-tour-2024-2025" },
			{ label: "Video Blog #Vlog", path: "/blog/video-blog-vlog" }
		]
	},
	{ label: "UNSERE AUSRÜSTUNG", path: "/unsere-ausruestung" },
	{
		label: "KOCHEN IM VAN",
		path: "/kochen-im-van",
		children: [{ label: "Lieblingsgerichte", path: "/kochen-im-van/lieblingsgerichte" }]
	},
	{ label: "NÜTZLICHES", path: "/nuetzliches" },
	{ label: "WANDERN", path: "/wandern-1" },
	{ label: "SO ERREICHST DU UNS", path: "/so-erreichst-du-uns" }
];

export default function Navigation() {
	return (
		<nav className="navbar navbar-expand-lg navbar-dark shadow-sm navbar-clean">
			<div className="container-fluid px-4 px-xxl-5 py-2 py-lg-3">
				<Link className="navbar-brand d-flex align-items-center me-lg-5" to="/" aria-label="spooners on tour">
					<img className="navbar-logo" src={logo} alt="spooners on tour logo" />
				</Link>

				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#mainNavbar"
					aria-controls="mainNavbar"
					aria-expanded="false"
					aria-label="Navigation umschalten"
				>
					<span className="navbar-toggler-icon" />
				</button>

				<div className="collapse navbar-collapse" id="mainNavbar">
					<div className="navbar-center">
						<ul className="navbar-nav gap-lg-1 gap-xl-2 align-items-lg-center flex-nowrap mb-2 mb-lg-0 justify-content-center">
							{menu.map((item) =>
								item.children ? (
									<li className="nav-item dropdown" key={item.label}>
										<button
											className="nav-link dropdown-toggle btn btn-link border-0 p-0"
											type="button"
											data-bs-toggle="dropdown"
											aria-expanded="false"
										>
											{item.label}
										</button>
										<ul className="dropdown-menu dropdown-menu-end">
											<li>
												<Link className="dropdown-item" to={item.path}>
													{item.label}
												</Link>
											</li>
											<li>
												<hr className="dropdown-divider" />
											</li>
											{item.children.map((child) => (
												<li key={child.label}>
													<Link className="dropdown-item" to={child.path}>
														{child.label}
													</Link>
												</li>
											))}
										</ul>
									</li>
								) : (
									<li className="nav-item" key={item.label}>
										<NavLink
											to={item.path}
											className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
											end={item.path === "/"}
										>
											{item.label}
										</NavLink>
									</li>
								)
							)}
						</ul>
					</div>

					<div className="navbar-login mt-2 mt-lg-0">
						<Link to="/admin-login" className="btn btn-outline-light btn-sm px-3 py-2">
							Login
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
