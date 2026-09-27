self.addEventListener(
  "push",
  (event) => {
    if (!event.data) {
      return;
    }

    let dados = {};

    try {
      dados = event.data.json();
    } catch {
      dados = {
        title: "Conecta Bandeirante",
        body: event.data.text(),
      };
    }


    const title =
      dados.title ||
      "Conecta Bandeirante";


    const body =
      dados.body ||
      "Você recebeu uma nova notificação.";


    const notificationData =
      dados.data || {};


    const url =
      notificationData.url ||
      "/";


    const options = {
      body,

      icon: "/LogoNB_Laranja.png",

      badge: "/LogoNB_Laranja.png",

      data: {
        ...notificationData,
        url,
      },

      tag: (
        notificationData.notificacao_id
          ? `notificacao-${notificationData.notificacao_id}`
          : "conecta-bandeirante"
      ),

      renotify: true,
    };


    event.waitUntil(
      self.registration.showNotification(
        title,
        options
      )
    );
  }
);


self.addEventListener(
  "notificationclick",
  (event) => {

    event.notification.close();


    const url =
      event.notification.data?.url ||
      "/";


    event.waitUntil(
      (async () => {

        const clientes =
          await clients.matchAll({
            type: "window",
            includeUncontrolled: true,
          });


        for (
          const cliente
          of clientes
        ) {

          if (
            "focus" in cliente
          ) {

            await cliente.focus();

            if (
              "navigate" in cliente &&
              url
            ) {
              await cliente.navigate(
                url
              );
            }

            return;
          }
        }


        if (
          clients.openWindow
        ) {

          await clients.openWindow(
            url
          );
        }

      })()
    );
  }
);