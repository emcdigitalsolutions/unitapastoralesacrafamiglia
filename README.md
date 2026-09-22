# Unità Pastorale Sacra Famiglia — Campobello di Licata

Sito ufficiale dell'Unità Pastorale Sacra Famiglia (Arcidiocesi di Agrigento), che riunisce le
**Parrocchie Gesù e Maria** (Via Napoli) e **San Giuseppe** (Piazza San Giuseppe) a
Campobello di Licata (AG).

Sito statico bilingue (IT/EN) — HTML/CSS/JS, ospitato su GitHub Pages.
Realizzato da **EMC Digital Solutions** · https://www.emcdigitalsolutions.it/

## Struttura

| File | Contenuto |
|------|-----------|
| `index.html` | Home: benvenuto, le due chiese, sacerdoti, orari, sacramenti, vita, feste, FAQ, contatti |
| `le-chiese.html` | Storia e architettura di Gesù e Maria e San Giuseppe |
| `orari-e-sacramenti.html` | Orari delle celebrazioni + i sette sacramenti |
| `vita-parrocchiale.html` | Gruppi, catechesi, Caritas, anno liturgico |
| `contatti.html` | Recapiti, mappe (con gating cookie), modulo di contatto |
| `donazioni.html` | Donazioni: online con carta (Stripe Payment Links) + bonifico bancario |
| `privacy.html` | Privacy & Cookie Policy (GDPR) |
| `404.html` | Pagina di errore |
| `assets/` | CSS, JS, immagini, icone |
| `robots.txt`, `sitemap.xml`, `llms.txt`, `site.webmanifest` | SEO / GEO / LLM |

## Foto da inserire (dalle mail del parroco)

Le foto vanno salvate in `assets/img/` con **questi nomi esatti** (il sito le mostra automaticamente):

- `gesu-e-maria-1.jpg`, `gesu-e-maria-2.jpg`, `gesu-e-maria-3.jpg` — chiesa di Gesù e Maria
- `san-giuseppe-1.jpg`, `san-giuseppe-2.jpg`, `san-giuseppe-3.jpg` — chiesa di San Giuseppe
- `parroco-marco-damanti.jpg` — P. Marco Damanti (parroco)
- `vicario-augustino.jpg` — don Augustino Japhet Mgovano (ritagliare per lasciare solo padre Agostino)

Finché non ci sono, il sito mostra segnaposto eleganti ("Foto in arrivo") e sfondi sacri.

## Dati da confermare con la parrocchia

- **Orari delle Sante Messe, Confessioni e Adorazione** (attualmente segnaposto "—"): aggiornare in
  `index.html` (sezione Orari) e `orari-e-sacramenti.html`.
- Numero di telefono, se si desidera pubblicarlo.

## Donazioni (`donazioni.html`)

- **Bonifico**: sostituire in `donazioni.html` l'IBAN segnaposto (`#iban-value`) e l'intestazione
  (`#dona-holder`) con i dati reali forniti dalla parrocchia.
- **Online (Stripe)**: aprire l'account Stripe intestato alla parrocchia (uno per cliente, EMC come
  team member), creare i Payment Links per i tagli **10/25/50/100/150/200 €**, e incollare gli URL
  nell'oggetto `PAYMENT_LINKS` in fondo a `donazioni.html`.
  Finché sono vuoti, il pulsante "Dona ora" invita a usare il bonifico.

## Go-live dominio (unitapastoralesacrafamiglia.it)

1. Registrare il dominio.
2. DNS: record **A** dell'apex → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`;
   record **CNAME** `www` → `emcdigitalsolutions.github.io`.
3. Togliere `CNAME` dal `.gitignore` e committarlo (contiene `www.unitapastoralesacrafamiglia.it`).
4. GitHub → Settings → Pages: custom domain + **Enforce HTTPS**.

## Modulo di contatto

Invia all'endpoint Google Apps Script condiviso EMC con `site: 'unitapastorale'`
(recapito: `sacrafamiglia.campobello@diocesiag.it`, CC EMC). Il sito va aggiunto alla config
`SITES` dell'Apps Script.

## Rigenerare gli asset (icone + immagine OG)

`node build-assets.js` (richiede `sharp` e `puppeteer-core` da `social-image-generator`).
