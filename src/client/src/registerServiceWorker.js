const isLocalhost = Boolean(
	window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
    	/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
)

export default function register() {
	if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
		const publicUrl = new URL(process.env.PUBLIC_URL, window.location)
		if (publicUrl.origin !== window.location.origin) return

		window.addEventListener('load', () => {
			const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`

			if (isLocalhost) {
				checkValidServiceWorker(swUrl)
				navigator.serviceWorker.ready.then(() => {})
			} else {
				registerValidSW(swUrl)
			}
		})
	}
}

function registerValidSW(swUrl) {
	navigator.serviceWorker
		.register(swUrl)
		.then(registration => {
			registration.onupdatefound = () => {
				const installingWorker = registration.installing
				installingWorker.onstatechange = () => {
					if (installingWorker.state !== 'installed') return
					if (navigator.serviceWorker.controller)  return
					return
				}
			}
		})
}

function checkValidServiceWorker(swUrl) {
	fetch(swUrl)
		.then(response => {
			if (
				response.status === 404 ||
        response.headers.get('content-type').indexOf('javascript') === -1
			) {
				navigator.serviceWorker.ready.then(registration => {
					registration.unregister().then(() => {
						window.location.reload()
					})
				})
			} else {
				registerValidSW(swUrl)
			}
		})
}

export function unregister() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.ready.then(registration => {
			registration.unregister()
		})
	}
}
