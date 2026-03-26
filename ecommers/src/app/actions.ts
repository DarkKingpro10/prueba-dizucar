"use server";

import webpush from "web-push";

webpush.setVapidDetails(
	"mailto:your-email@example.com",
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
	process.env.VAPID_PRIVATE_KEY || "",
);

// Usar un tipo genérico para evitar colisiones entre el PushSubscription del DOM
// y el tipo esperado por @types/web-push. El cliente debe enviar la suscripción
// serializada (por ejemplo JSON.parse(JSON.stringify(subscription))).
type SerializedPushSubscription = {
	endpoint: string;
	expirationTime?: number | null;
	keys: {
		p256dh: string;
		auth: string;
	};
};

let subscription: SerializedPushSubscription | null = null;

export async function subscribeUser(sub: SerializedPushSubscription) {
	// sub debe ser el objeto serializado con { endpoint, keys: { p256dh, auth } }
	subscription = sub;
	// En producción guardar en BD
	return { success: true };
}

export async function unsubscribeUser() {
	subscription = null;
	// En producción eliminar de BD
	return { success: true };
}

export async function sendNotification(message: string) {
	if (!subscription) throw new Error("No subscription available");
	try {
		await webpush.sendNotification(
			subscription,
			JSON.stringify({
				title: "Ecommers",
				body: message,
				icon: "/icons/icon-192.svg",
			}),
		);
		return { success: true };
	} catch (err) {
		console.error("Error sending push notification:", err);
		return { success: false, error: "Failed to send notification" };
	}
}
