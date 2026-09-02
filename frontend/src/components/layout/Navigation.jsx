import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/SOT_Logo.png";

const API_URL = "http://localhost:5001/api/menu";

export default function Navigation() {
	const [menu, setMenu] = useState([]);
	const [openMenu, setOpenMenu] = useState(null);
	const [isNavOpen, setIsNavOpen] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const loadMenu = () =>
			fetch(API_URL)
				.then((response) => {
					if (!response.ok) throw new Error("Menü konnte nicht geladen werden.");
					return response.json();
				})
				.then((data) => {
					if (isMounted && data.success) setMenu(data.items || []);
				})
				.catch(() => {
					if (isMounted) setMenu([]);
				});

		loadMenu();
		window.addEventListener("menu:refresh", loadMenu);

		return () => {
			isMounted = false;
			window.removeEventListener("menu:refresh", loadMenu);
		};
	}, []);

	const handleMouseEnter = (label) => setOpenMenu(label);
	const handleMouseLeave = () => setOpenMenu(null);
	const toggleMenu = (label) => setOpenMenu((current) => (current === label ? null : label));
	const closeNav = () => {
		setOpenMenu(null);
		setIsNavOpen(false);
	};

	return (
		<nav className="navbar navbar-expand-lg navbar-dark navbar-clean">
			<div className="container-fluid px-4 px-xxl-5 py-2 py-lg-3">
				<Link className="navbar-brand d-flex align-items-center me-lg-3" to="/" aria-label="spooners on tour" onClick={closeNav}>
					<img className="navbar-logo" src={logo} alt="spooners on tour logo" />
				</Link>

				<button
					className="navbar-toggler"
					type="button"
					aria-controls="mainNavbar"
					aria-expanded={isNavOpen}
					aria-label="Navigation umschalten"
					onClick={() => setIsNavOpen((prev) => !prev)}
				>
					<span className="navbar-toggler-icon" />
				</button>

				<div className={`collapse navbar-collapse justify-content-start${isNavOpen ? " show" : ""}`} id="mainNavbar">
					<div className="navbar-center">
						<ul className="navbar-nav gap-lg-1 gap-xl-2 align-items-lg-center flex-nowrap mb-2 mb-lg-0 justify-content-end">
							{menu.map((item) =>
								item.children?.length > 0 ? (
									<li
										className={`nav-item dropdown${openMenu === item.label ? " show" : ""}`}
										key={item.label}
										onMouseEnter={() => handleMouseEnter(item.label)}
										onMouseLeave={handleMouseLeave}
									>
										<button
											className={`nav-link btn btn-outline-light btn-sm px-3 py-2 menu-pill dropdown-toggle${openMenu === item.label ? " active" : ""}`}
											type="button"
											aria-expanded={openMenu === item.label}
											onClick={() => toggleMenu(item.label)}
										>
											{item.label}
										</button>
										<ul className={`dropdown-menu dropdown-menu-end${openMenu === item.label ? " show" : ""}`}>
											{item.children.map((child) => (
														<li key={child.id}>
													<Link className="dropdown-item" to={child.path} onClick={closeNav}>
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
											onClick={closeNav}
										>
											{item.label}
										</NavLink>
									</li>
								)
							)}
						</ul>
					</div>

					<div className="navbar-login mt-2 mt-lg-0">
						<Link to="/login" className="btn btn-outline-light btn-sm px-3 py-2" onClick={closeNav}>
							Mitglieder-Login
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
