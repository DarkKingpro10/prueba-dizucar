"use server";

import webpush from "web-push";

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

let subscription: PushSubscription | null = null;

export async function subscribeUser(sub: PushSubscription) {
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
  if (!subscription) throw new Error('No subscription available');
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title: 'Ecommers', body: message, icon: '/icons/icon-192.svg' })
    );
    return { success: true };
  } catch (err) {
    console.error('Error sending push notification:', err);
    return { success: false, error: 'Failed to send notification' };
  }
}
