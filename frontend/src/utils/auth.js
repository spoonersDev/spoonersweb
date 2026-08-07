const AUTH_STORAGE_KEY = 'sponners_auth';

export function saveAuthSession(session) {
	localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getAuthSession() {
	const raw = localStorage.getItem(AUTH_STORAGE_KEY);
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw);
	} catch (_error) {
		return null;
	}
}

export function clearAuthSession() {
	localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthenticated() {
	const session = getAuthSession();
	return Boolean(session?.token);
}

export function hasActiveSubscription() {
	const session = getAuthSession();
	return Boolean(session?.user?.subscriptionActive);
}

export function isAdmin() {
	const session = getAuthSession();
	return session?.user?.role === "admin";
}
