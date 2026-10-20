/* Meta Pixel - BR Estate (2683411412079623) */
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2683411412079623');
fbq('track', 'PageView');

/* ViewContent nas páginas de imóvel
   Padrão de URL: /imoveis/{uf}/{cidade}/{bairro}/{rua}/id-{CODIGO}
   O código (ex.: S5LEM) precisa ser o MESMO ID usado no catálogo da Meta. */
(function () {
  var CONTENT_TYPE = 'home_listing'; // trocar para 'product' se o catálogo não for do tipo Imóveis
  var DELAY_MS = 800;                // espera o título da página atualizar na navegação interna
  var lastId = null;

  function parseUrl() {
    var m = location.pathname.match(/^\/imoveis\/([^\/]+)\/([^\/]+)\/([^\/]+)\/[^\/]+\/id-([A-Za-z0-9]+)(\/|$)/);
    if (!m) return null;
    return { uf: m[1].toUpperCase(), cidade: m[2], bairro: m[3], id: m[4] };
  }

  // Título no formato: "Apartamento em Vila Moraes - 2 quartos • 62m² • R$ 299.000,00"
  function parseTitle() {
    var t = document.title || '';
    var out = {};
    var preco = t.match(/R\$\s*([\d.]+),(\d{2})/);
    if (preco) out.value = parseFloat(preco[1].replace(/\./g, '') + '.' + preco[2]);
    var tipo = t.match(/^(\S+)\s+em\s/);
    if (tipo) out.property_type = tipo[1].toLowerCase();
    var quartos = t.match(/(\d+)\s+quartos?/);
    if (quartos) out.bedrooms = parseInt(quartos[1], 10);
    return out;
  }

  function trackView() {
    var d = parseUrl();
    if (!d) { lastId = null; return; }   // saiu de página de imóvel
    if (d.id === lastId) return;         // mesma ficha (ex.: /galeria, /video)
    lastId = d.id;

    setTimeout(function () {
      var extra = parseTitle();
      var params = {
        content_ids: [d.id],
        content_type: CONTENT_TYPE,
        country: 'BR',
        region: d.uf,
        city: d.cidade,
        neighborhood: d.bairro
      };
      if (extra.value) { params.value = extra.value; params.currency = 'BRL'; }
      if (extra.property_type) params.property_type = extra.property_type;
      if (extra.bedrooms) params.bedrooms = extra.bedrooms;
      fbq('track', 'ViewContent', params);
    }, DELAY_MS);
  }

  // Site de página única: dispara também na navegação sem recarregar
  ['pushState', 'replaceState'].forEach(function (fn) {
    var orig = history[fn];
    history[fn] = function () {
      var r = orig.apply(this, arguments);
      trackView();
      return r;
    };
  });
  window.addEventListener('popstate', trackView);

  trackView();
})();
