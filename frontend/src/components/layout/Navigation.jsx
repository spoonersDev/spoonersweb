import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/SOT_Logo.jpg";

const menu = [
	{
		label: "SPOONERS",
		path: "/das-sind-wir-1",
		children: [
			{ label: "Rania", path: "/das-sind-wir-1" },
			{ label: "Daniel", path: "/das-sind-wir-1" },
			{ label: "(Albert) Einstein", path: "/das-sind-wir-1" }
		]
	},
	{
		label: "ON TOUR",
		path: "/on-tour",
		children: [
			{ label: "Unimog Projekt", path: "/unimog-projekt" },
			{ label: "Wandern", path: "/wandern-1" },
			{ label: "Unsere Ausrüstung", path: "/unsere-ausruestung" },
			{ label: "NÜTZLICHES", path: "/nuetzliches" }
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
	{ label: "SO ERREICHST DU UNS", path: "/so-erreichst-du-uns" }
];

export default function Navigation() {
	const [openMenu, setOpenMenu] = useState(null);

	const handleMouseEnter = (label) => setOpenMenu(label);
	const handleMouseLeave = () => setOpenMenu(null);

	return (
		<nav className="navbar navbar-expand-lg navbar-dark navbar-clean">
			<div className="container-fluid px-4 px-xxl-5 py-2 py-lg-3">
				<Link className="navbar-brand d-flex align-items-center me-lg-3" to="/" aria-label="spooners on tour">
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

				<div className="collapse navbar-collapse justify-content-start" id="mainNavbar">
					<div className="navbar-center">
						<ul className="navbar-nav gap-lg-1 gap-xl-2 align-items-lg-center flex-nowrap mb-2 mb-lg-0 justify-content-end">
							{menu.map((item) =>
								item.children ? (
									<li
										className={`nav-item dropdown${openMenu === item.label ? " show" : ""}`}
										key={item.label}
										onMouseEnter={() => handleMouseEnter(item.label)}
										onMouseLeave={handleMouseLeave}
									>
										<button
											className={`nav-link btn btn-outline-light btn-sm px-3 py-2 menu-pill dropdown-toggle${openMenu === item.label ? " active" : ""}`}
											type="button"
											data-bs-toggle="dropdown"
											aria-expanded={openMenu === item.label}
										>
											{item.label}
										</button>
										<ul className={`dropdown-menu dropdown-menu-end${openMenu === item.label ? " show" : ""}`}>
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
											className={({ isActive }) => `nav-link btn btn-outline-light btn-sm px-3 py-2 menu-pill${isActive ? " active" : ""}`}
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
						<Link to="/login" className="btn btn-outline-light btn-sm px-3 py-2">
							Mitglieder-Login
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
