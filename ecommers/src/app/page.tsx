"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

// Página de prueba para cámara y huella (WebAuthn)
export default function Home() {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [status, setStatus] = useState<string>("");
	const [streamActive, setStreamActive] = useState(false);

	// Helpers para conversiones ArrayBuffer <-> base64
	function bufferToBase64(buf: ArrayBuffer) {
		const bytes = new Uint8Array(buf);
		let binary = "";
		for (let i = 0; i < bytes.byteLength; i++)
			binary += String.fromCharCode(bytes[i]);
		return btoa(binary);
	}
	function base64ToBuffer(base64: string) {
		const binary = atob(base64);
		const len = binary.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
		return bytes.buffer;
	}

	// Cámara
	async function startCamera() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			if (videoRef.current) videoRef.current.srcObject = stream;
			setStreamActive(true);
			setStatus("Cámara activa");
		} catch (err) {
			console.error(err);
			setStatus("Error accediendo a la cámara: " + String(err));
		}
	}
	function stopCamera() {
		const stream = videoRef.current?.srcObject as MediaStream | null;
		if (stream) {
			stream.getTracks().forEach((t) => t.stop());
			if (videoRef.current) videoRef.current.srcObject = null;
		}
		setStreamActive(false);
		setStatus("Cámara detenida");
	}

	// WebAuthn (registro y autenticación) — pruebas locales
	const CRED_KEY = "webauthn-cred-id";

	async function registerCredential() {
		if (!window.PublicKeyCredential) {
			setStatus("WebAuthn no está disponible en este navegador.");
			return;
		}
		try {
			const challenge = crypto.getRandomValues(new Uint8Array(32));
			const userId = crypto.getRandomValues(new Uint8Array(16));

			const publicKey: PublicKeyCredentialCreationOptions = {
				challenge,
				rp: { name: "Dizucar Test" },
				user: {
					id: userId,
					name: "usuario@local.test",
					displayName: "Usuario local",
				},
				pubKeyCredParams: [{ alg: -7, type: "public-key" }],
				authenticatorSelection: {
					authenticatorAttachment: "platform",
					userVerification: "required",
				},
				timeout: 60000,
				attestation: "none",
			};

			const credential = (await navigator.credentials.create({ publicKey })) as
				| PublicKeyCredential
				| null;
			if (!credential) throw new Error("No se creó la credencial");

			const rawId = credential.rawId as ArrayBuffer;
			const idBase64 = bufferToBase64(rawId);
			localStorage.setItem(CRED_KEY, idBase64);
			setStatus("Registro completado. Credencial guardada en localStorage.");
		} catch (err) {
			console.error(err);
			setStatus("Error en registro WebAuthn: " + String(err));
		}
	}

	async function authenticate() {
		try {
			const stored = localStorage.getItem(CRED_KEY);
			if (!stored) {
				setStatus("No hay credencial registrada. Primero registra.");
				return;
			}
			const allowCred: PublicKeyCredentialDescriptor[] = [
				{ id: base64ToBuffer(stored), type: "public-key" as const },
			];
			const publicKeyRequest: PublicKeyCredentialRequestOptions = {
				challenge: crypto.getRandomValues(new Uint8Array(32)),
				allowCredentials: allowCred,
				userVerification: "required",
				timeout: 60000,
			};

			const assertion = (await navigator.credentials.get({
				publicKey: publicKeyRequest,
			})) as PublicKeyCredential | null;
			if (!assertion) throw new Error("No se obtuvo respuesta de autenticación");
			setStatus(
				"Autenticación exitosa (prueba). Revisa la consola para detalles.",
			);
			console.log("Assertion:", assertion);
		} catch (err) {
			console.error(err);
			setStatus("Error en autenticación WebAuthn: " + String(err));
		}
	}

	useEffect(() => {
		return () => stopCamera();
	}, []);

	return (
		<div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen p-6">
			<main className="w-full max-w-3xl bg-white dark:bg-black rounded-lg p-8 shadow">
				<div className="flex items-center gap-4 mb-6">
					<Image
						className="dark:invert"
						src="/next.svg"
						alt="Next.js logo"
						width={80}
						height={16}
						priority
					/>
					<h1 className="text-xl font-semibold">
						Prueba de Cámara y Huella (WebAuthn)
					</h1>
				</div>

				<section className="mb-6">
					<h2 className="font-medium mb-2">Cámara</h2>
					<div className="flex gap-2 mb-2">
						<button
							className="btn"
							onClick={startCamera}
							disabled={streamActive}
						>
							Probar cámara
						</button>
						<button
							className="btn"
							onClick={stopCamera}
							disabled={!streamActive}
						>
							Detener cámara
						</button>
					</div>
					<video
						ref={videoRef}
						autoPlay
						playsInline
						className="w-full max-h-64 bg-black"
					/>
				</section>

				<section className="mb-6">
					<h2 className="font-medium mb-2">
						Huella / Autenticador de plataforma (WebAuthn)
					</h2>
					<div className="flex gap-2 mb-2">
						<button className="btn" onClick={registerCredential}>
							Registrar huella (Registro)
						</button>
						<button className="btn" onClick={authenticate}>
							Autenticar (Login)
						</button>
					</div>
					<p className="text-sm text-zinc-600">Estado: {status}</p>
				</section>

				<section className="text-sm text-zinc-500">
					<p>Notas:</p>
					<ul className="list-disc ml-5">
						<li>
							Prueba en <strong>localhost</strong> o en HTTPS para WebAuthn.
						</li>
						<li>
							Credencial de prueba se guarda en <strong>localStorage</strong>.
						</li>
					</ul>
				</section>
			</main>
		</div>
	);
}
