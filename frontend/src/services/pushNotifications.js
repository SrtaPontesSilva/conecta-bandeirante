import api from "./api";


function converterBase64ParaUint8Array(
  base64String
) {
  const padding =
    "=".repeat(
      (4 -
        (base64String.length % 4)) %
        4
    );

  const base64 =
    (
      base64String +
      padding
    )
      .replace(
        /-/g,
        "+"
      )
      .replace(
        /_/g,
        "/"
      );

  const rawData =
    window.atob(base64);

  const outputArray =
    new Uint8Array(
      rawData.length
    );


  for (
    let index = 0;
    index < rawData.length;
    ++index
  ) {
    outputArray[index] =
      rawData.charCodeAt(index);
  }


  return outputArray;
}


// ============================================================
// SUPORTE
// ============================================================

export function pushSuportado() {
  return Boolean(
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}


// ============================================================
// REGISTRAR SERVICE WORKER
// ============================================================

export async function registrarServiceWorker() {

  if (
    !pushSuportado()
  ) {
    throw new Error(
      "Este navegador não suporta notificações push."
    );
  }


  if (
    !window.isSecureContext
  ) {
    throw new Error(
      "As notificações push exigem uma conexão segura (HTTPS)."
    );
  }


  return navigator.serviceWorker.register(
    "/sw.js"
  );
}


// ============================================================
// OBTER SUBSCRIPTION
// ============================================================

export async function obterPushSubscription() {

  const registration =
    await registrarServiceWorker();


  return registration.pushManager
    .getSubscription();
}


// ============================================================
// ATIVAR PUSH
// ============================================================

export async function ativarPush() {

  if (
    !pushSuportado()
  ) {
    throw new Error(
      "Este navegador não suporta notificações push."
    );
  }


  const registration =
    await registrarServiceWorker();


  const permissao =
    await Notification.requestPermission();


  if (
    permissao !== "granted"
  ) {
    throw new Error(
      "Permissão para notificações não concedida."
    );
  }


  const resposta =
    await api.get(
      "/notificacoes/push/config"
    );


  const publicKey =
    resposta.data?.public_key;


  if (!publicKey) {
    throw new Error(
      "Chave pública VAPID não configurada."
    );
  }


  let subscription =
    await registration.pushManager
      .getSubscription();


  if (!subscription) {

    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,

        applicationServerKey:
          converterBase64ParaUint8Array(
            publicKey
          ),
      });
  }


  await api.post(
    "/notificacoes/push",
    subscription.toJSON()
  );


  return subscription;
}


// ============================================================
// DESATIVAR PUSH
// ============================================================

export async function desativarPush() {

  const registration =
    await registrarServiceWorker();


  const subscription =
    await registration.pushManager
      .getSubscription();


  if (!subscription) {
    return;
  }


  const subscriptionJson =
    subscription.toJSON();


  const endpoint =
    subscriptionJson.endpoint;


  const resposta =
    await api.get(
      "/notificacoes/push"
    );


  const subscriptions =
    Array.isArray(
      resposta.data?.subscriptions
    )
      ? resposta.data.subscriptions
      : [];


  const encontrada =
    subscriptions.find(
      (item) =>
        item.endpoint === endpoint
    );


  if (encontrada) {

    await api.delete(
      `/notificacoes/push/${encontrada.id}`
    );
  }


  await subscription.unsubscribe();
}


// ============================================================
// STATUS
// ============================================================

export async function obterStatusPush() {

  if (
    !pushSuportado()
  ) {
    return {
      suportado: false,
      permissao: "unsupported",
      inscrito: false,
    };
  }


  const permissao =
    Notification.permission;


  const subscription =
    await obterPushSubscription();


  return {
    suportado: true,

    permissao,

    inscrito: Boolean(
      subscription
    ),
  };
}