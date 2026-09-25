import json, re
from urllib.parse import quote
SITE = 'https://www.unitapastoralesacrafamiglia.it'
T = open('vita-parrocchiale.html', encoding='utf-8').read()

# ---------- HEAD ----------
head_end = T.index('<link rel="stylesheet" href="assets/css/style.css">')
head = T[:head_end]
repl = {
    "<title>Vita Parrocchiale — gruppi, catechesi e carità · Unità Pastorale Sacra Famiglia</title>":
        "<title>Fede e vita concreta — avvisi e informazioni utili · Unità Pastorale Sacra Famiglia</title>",
    'content="La vita della comunità dell\'Unità Pastorale Sacra Famiglia: catechesi, coro liturgico, ministranti, Caritas, gruppi giovani e famiglie, e i tempi forti dell\'anno liturgico a Campobello di Licata."':
        'content="Avvisi della comunità, appuntamenti della Chiesa e informazioni utili per la vita di ogni giorno a Campobello di Licata: anno pastorale, catechismo, Rosario per la pace, Carta Dedicata a te, tempi di attesa del CUP."',
    'content="vita parrocchiale campobello, catechesi, caritas, gruppi giovani, coro liturgico, ministranti, anno liturgico"':
        'content="avvisi parrocchia campobello di licata, anno pastorale 2026 2027, iscrizioni catechismo, rosario per la pace, carta dedicata a te 2026, cup tempi di attesa intramoenia"',
    'href="https://www.unitapastoralesacrafamiglia.it/vita-parrocchiale.html">': 'href="https://www.unitapastoralesacrafamiglia.it/fede-e-vita.html">',
    '<meta property="og:title" content="Vita Parrocchiale — gruppi, catechesi e carità">': '<meta property="og:title" content="Fede e vita concreta — avvisi e informazioni utili">',
    '<meta property="og:description" content="Catechesi, coro, ministranti, Caritas, gruppi giovani e famiglie: la comunità che cammina insieme.">':
        '<meta property="og:description" content="Gli appuntamenti della comunità e le informazioni che aiutano nella vita di ogni giorno.">',
    'content="https://www.unitapastoralesacrafamiglia.it/vita-parrocchiale.html">': 'content="https://www.unitapastoralesacrafamiglia.it/fede-e-vita.html">',
    '<meta name="twitter:title" content="Vita Parrocchiale — Unità Pastorale Sacra Famiglia">': '<meta name="twitter:title" content="Fede e vita concreta — Unità Pastorale Sacra Famiglia">',
}
for a, b in repl.items():
    assert a in head, a[:60]
    head = head.replace(a, b)

# ---------- HEADER (dal <body> all'hero) ----------
body_start = T.index('<body>')
hero_start = T.index('<section class="page-hero">')
header = T[body_start:hero_start]

# ---------- FOOTER + cookie (senza lightbox galleria) ----------
foot_start = T.index('<!-- ===== FOOTER') if '<!-- ===== FOOTER' in T else T.index('<footer')
foot_end = T.index('<!-- ===== LIGHTBOX GALLERIA ===== -->')
footer = T[foot_start:foot_end]

I = {
 'cal': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
 'clock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 'pin': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
 'check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
 'zoom': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/></svg>',
 'ext': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
 'info': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
 'infinity': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.2 8.2a5 5 0 1 1 0 7.6L12 12 5.8 8.2a5 5 0 1 0 0 7.6L12 12Z"/></svg>',
 'quote': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h4v4c0 3-1.5 5-4 6l-.8-1.4C7.6 14.8 8.3 13.6 8.4 12H7V7Zm8 0h4v4c0 3-1.5 5-4 6l-.8-1.4c1.4-.8 2.1-2 2.2-3.6H15V7Z"/></svg>',
}

# icone social per la barra di condivisione di ogni avviso
SH = {
 'wa': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.16-1.5A9.9 9.9 0 1 0 12.04 2Zm0 18.06a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.06.9.9-2.98-.2-.31a8.17 8.17 0 1 1 6.84 3.72Zm4.5-6.12c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.67.31c-.23.25-.87.85-.87 2.08s.9 2.41 1.02 2.58c.12.16 1.76 2.69 4.27 3.77.6.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.29Z"/></svg>',
 'fb': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21.9v-7.4H16l.4-3h-2.9V9.6c0-.86.25-1.45 1.49-1.45H16.6V5.47a21 21 0 0 0-2.3-.12c-2.28 0-3.84 1.39-3.84 3.95v2.2H7.9v3h2.56v7.4A10 10 0 1 1 13.5 21.9Z"/></svg>',
 'ig': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>',
 'link': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.1 1.1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.1-1.1"/></svg>',
}

def share_bar(key, poster, title_it, title_en, when_it, when_en):
    """Barra «Condividi» dell'avviso: il link punta alla pagina ponte avviso/<key>.html
    (anteprima dedicata per WhatsApp/Facebook, generata da build-share-avvisi.js),
    che rimanda all'avviso nella bacheca. main.js → initShareBars()."""
    url = f'{SITE}/avviso/{key}.html'
    wa = 'https://wa.me/?text=' + quote(f'*{title_it}*\n{when_it}\n\n{url}', safe='')
    fb = 'https://www.facebook.com/sharer/sharer.php?u=' + quote(url, safe='')
    at = lambda v: v.replace('"', '&quot;')
    return f'''<div class="fv-share" data-share-bar data-url="{url}" data-title-it="{at(title_it)}" data-title-en="{at(title_en)}" data-when-it="{at(when_it)}" data-when-en="{at(when_en)}" data-img="assets/img/avvisi/{poster}.jpg" data-file="{key}.jpg">
              <span class="fv-share-lbl"><span data-lang-it>Condividi</span><span data-lang-en>Share</span></span>
              <div class="fv-share-btns">
                <a class="sh sh-wa" data-sh="wa" href="{wa}" target="_blank" rel="noopener">{SH["wa"]}<span>WhatsApp</span></a>
                <a class="sh sh-fb" data-sh="fb" href="{fb}" target="_blank" rel="noopener">{SH["fb"]}<span>Facebook</span></a>
                <button class="sh sh-ig" data-sh="ig" type="button">{SH["ig"]}<span>Instagram</span></button>
                <button class="sh sh-link" data-sh="link" type="button">{SH["link"]}<span data-lang-it>Copia link</span><span data-lang-en>Copy link</span></button>
              </div>
            </div>'''

CATS = {
  'parrocchia': ('La nostra comunità', 'Our community'),
  'chiesa': ('Chiesa universale', 'Universal Church'),
  'vita': ('Vita concreta', 'Everyday life'),
}

def li(items):
    return ''.join(f'<li>{I["check"]}<span><span data-lang-it>{it}</span><span data-lang-en>{en}</span></span></li>' for it, en in items)

def when(rows):
    out = ''
    for ico, it, en in rows:
        out += f'<div class="fv-when-row">{I[ico]}<span><span data-lang-it>{it}</span><span data-lang-en>{en}</span></span></div>'
    return out

def item(key, cat, start, end, d, m_it, m_en, y, poster, poster_alt, title_it, title_en, rows, text_it, text_en, facts, extra='', credit='', flag_it='', flag_en='', evergreen=False):
    date_html = (f'<div class="fv-date evergreen" aria-hidden="true">{I["infinity"]}<span class="m"><span data-lang-it>Sempre</span><span data-lang-en>Always</span></span><span class="y"><span data-lang-it>valido</span><span data-lang-en>useful</span></span></div>'
                 if evergreen else
                 f'<div class="fv-date" aria-hidden="true"><span class="d">{d}</span><span class="m"><span data-lang-it>{m_it}</span><span data-lang-en>{m_en}</span></span><span class="y">{y}</span></div>')
    flag = f'<span class="fv-flag"><span data-lang-it>{flag_it}</span><span data-lang-en>{flag_en}</span></span>' if flag_it else ''
    return f'''
      <article class="fv-item" id="{key}" data-cat="{cat}"{f' data-start="{start}" data-end="{end}"' if start else ''} data-reveal>
        {date_html}
        <div class="fv-card">
          <button class="fv-poster" type="button" data-poster="assets/img/avvisi/{poster}.jpg" data-caption-it="{title_it}" data-caption-en="{title_en}" aria-label="Apri la locandina: {title_it}">
            <img src="assets/img/avvisi/{poster}-t.jpg" alt="{poster_alt}" loading="lazy" width="560" height="560">
            <span class="fv-zoom">{I["zoom"]}<span data-lang-it>Locandina</span><span data-lang-en>Poster</span></span>
          </button>
          <div class="fv-body">
            <div class="fv-tags"><span class="fv-tag {cat}"><span data-lang-it>{CATS[cat][0]}</span><span data-lang-en>{CATS[cat][1]}</span></span>{flag}<span class="fv-status" hidden></span></div>
            <h3 data-lang-it>{title_it}</h3><h3 data-lang-en>{title_en}</h3>
            <div class="fv-when">{when(rows)}</div>
            <p data-lang-it>{text_it}</p>
            <p data-lang-en>{text_en}</p>
            <ul class="fv-facts">{li(facts)}</ul>
            {extra}
            {credit}
            {share_bar(key, poster, title_it, title_en, rows[0][1], rows[0][2])}
          </div>
        </div>
      </article>'''

items = []

# 1) 1–7 ottobre — Rosario per la pace con Papa Leone XIV
items.append(item('rosario-per-la-pace', 'chiesa', '2026-10-01', '2026-10-07', '1', 'ottobre', 'October', '2026',
  'rosario-papa-leone', 'Locandina: con Papa Leone XIV il 1° ottobre il Rosario per la pace',
  'Con Papa Leone XIV, il Rosario per la pace', 'With Pope Leo XIV, the Rosary for peace',
  [('clock', '1° ottobre, ore 17:00 · Grotta di Lourdes, Giardini Vaticani', '1 October, 5 pm · Lourdes Grotto, Vatican Gardens'),
   ('cal', 'Settimana di preghiera dal 1° al 7 ottobre, festa della Madonna del Rosario', 'Week of prayer from 1 to 7 October, feast of Our Lady of the Rosary')],
  "Il Papa reciterà il Rosario per la pace con centinaia di bambini in Vaticano, uniti ai bambini di tutto il mondo. È l'iniziativa «Un milione di bambini recita il Rosario», promossa da Aiuto alla Chiesa che Soffre, che quest'anno si ispira al messaggio di Fatima: «Alla fine, il mio Cuore Immacolato trionferà».",
  "The Pope will pray the Rosary for peace with hundreds of children in the Vatican, united with children all over the world. It is the “One Million Children Praying the Rosary” initiative, promoted by Aid to the Church in Need, inspired this year by the message of Fatima: “In the end, my Immaculate Heart will triumph”.",
  [("Uniamoci anche noi: in famiglia, a scuola o in parrocchia, scegliamo un giorno della settimana per pregare il Rosario con i bambini.", "Let us join in too: at home, at school or in the parish, choose a day of the week to pray the Rosary with the children."),
   ("Nata in Venezuela nel 2005, l'iniziativa si ispira alle parole attribuite a san Pio da Pietrelcina: «Quando un milione di bambini reciterà il Rosario, il mondo cambierà».", "Born in Venezuela in 2005, the initiative is inspired by words attributed to St Pio of Pietrelcina: “When a million children pray the Rosary, the world will change”."),
   ("Quest'anno aderisce per la prima volta anche il World Rosary Day.", "This year World Rosary Day joins in for the first time.")],
  credit=f'<p class="fv-credit">{I["info"]}<span><span data-lang-it>Fonte:</span><span data-lang-en>Source:</span> <a href="https://www.vaticannews.va/it/papa/news/2026-09/papa-rosario-centinaia-di-bambini-vaticano.html" target="_blank" rel="noopener">Vatican News</a> · <span data-lang-it>grafica</span><span data-lang-en>artwork</span>: Cooperatores Veritatis</span></p>'))

# 2) Domenica 4 ottobre — Inizio anno pastorale + mandato
items.append(item('anno-pastorale-2026-2027', 'parrocchia', '2026-10-04', '2026-10-04', '4', 'ottobre', 'October', '2026',
  'anno-pastorale-2026', 'Locandina: inizio del nuovo anno pastorale 2026/2027 e consegna del mandato agli operatori pastorali',
  'Inizio del nuovo anno pastorale 2026/2027', 'Opening of the 2026/2027 pastoral year',
  [('clock', 'Domenica 4 ottobre · ore 18:00 raduno davanti alla Chiesa Gesù e Maria e breve processione verso San Giuseppe', 'Sunday 4 October · 6 pm gathering in front of Gesù e Maria and short procession to San Giuseppe'),
   ('pin', 'Ore 18:30 · Santa Messa solenne nella Chiesa di San Giuseppe', '6:30 pm · Solemn Holy Mass at the Church of San Giuseppe')],
  "Con l'inizio del nuovo anno pastorale la comunità si ritrova per affidare al Signore il cammino che ci attende e invocare la Sua benedizione su tutte le persone che, con disponibilità e amore, svolgono un servizio nella vita delle nostre parrocchie.",
  "As the new pastoral year begins, the community gathers to entrust the journey ahead to the Lord and to ask His blessing on all those who, with generosity and love, serve in the life of our parishes.",
  [("Durante la celebrazione sarà conferito il <strong>Mandato Pastorale a tutti gli Operatori Pastorali</strong>: segno di comunione, corresponsabilità e disponibilità a servire la Chiesa e la comunità.", "During the celebration the <strong>Pastoral Mandate will be conferred on all pastoral workers</strong>: a sign of communion, shared responsibility and readiness to serve the Church and the community."),
   ("Siamo tutti invitati a partecipare con gioia a questo momento di preghiera e di fraternità.", "Everyone is invited to take part joyfully in this moment of prayer and fraternity.")],
  extra=f'<blockquote class="fv-quote">{I["quote"]}<p><span data-lang-it>«Servite il Signore con gioia»</span><span data-lang-en>“Serve the Lord with gladness”</span> <cite>Sal 100,2</cite></p></blockquote>'))

# 3) Catechismo — iscrizioni aperte + inaugurazione 11 ottobre
items.append(item('anno-catechistico-2026-2027', 'parrocchia', '2026-10-11', '2026-10-11', '11', 'ottobre', 'October', '2026',
  'catechismo-2026', 'Locandina: iscrizioni al nuovo anno catechistico e inaugurazione domenica 11 ottobre',
  'Nuovo anno catechistico: iscrizioni aperte', 'New catechism year: enrolment open',
  [('clock', 'Domenica 11 ottobre, ore 11:00 · inaugurazione con la Santa Messa solenne', 'Sunday 11 October, 11 am · opening with a solemn Holy Mass'),
   ('pin', 'Parrocchia San Giuseppe, con la partecipazione delle famiglie', 'Parish of San Giuseppe, together with the families')],
  "Sono aperte le iscrizioni al nuovo anno catechistico. Vi aspettiamo per iniziare insieme questo nuovo cammino di fede!",
  "Enrolment for the new catechism year is open. We look forward to starting this new journey of faith together!",
  [("Età per l'iscrizione: <strong>7 anni</strong> (seconda elementare).", "Enrolment age: <strong>7 years old</strong> (second year of primary school)."),
   ("Il modulo di iscrizione si ritira in parrocchia nei giorni in cui viene celebrata la Santa Messa.", "The enrolment form can be collected at the parish on the days Holy Mass is celebrated.")],
  flag_it='Iscrizioni aperte', flag_en='Enrolment open'))

# 4) Carta Dedicata a te 2026–2027
items.append(item('carta-dedicata-a-te', 'vita', '2026-11-04', '2027-04-30', '4', 'novembre', 'November', '2026',
  'carta-dedicata-a-te-2026', 'Infografica: Carta Dedicata a te 2026–2027, 500 euro per ciascun anno e date importanti',
  'Carta «Dedicata a te» 2026–2027', '“Dedicata a te” card 2026–2027',
  [('cal', 'Dal 4 novembre 2026 la prima ricarica · da aprile 2027 la seconda', 'First top-up from 4 November 2026 · second from April 2027')],
  "Un contributo di <strong>500 euro per ciascun anno</strong> destinato all'acquisto di beni alimentari di prima necessità. <strong>Non è necessario presentare domanda</strong>: i beneficiari sono individuati da INPS e Comuni e la carta si ritira agli uffici postali.",
  "A contribution of <strong>€500 per year</strong> for buying essential food. <strong>No application is needed</strong>: beneficiaries are identified by INPS and the municipalities and the card is collected at the post office.",
  [("<strong>4 novembre 2026</strong>: prima ricarica 2026.", "<strong>4 November 2026</strong>: first 2026 top-up."),
   ("<strong>Entro il 16 dicembre 2026</strong> va fatto il primo pagamento con la ricarica, altrimenti il contributo si perde.", "<strong>By 16 December 2026</strong> the first payment must be made with the top-up, otherwise the contribution is lost."),
   ("<strong>Da aprile 2027</strong>: seconda ricarica.", "<strong>From April 2027</strong>: second top-up."),
   ("Le carte emesse negli anni precedenti restano valide per i beneficiari confermati nelle nuove liste.", "Cards issued in previous years remain valid for beneficiaries confirmed in the new lists.")],
  extra='<p class="fv-help"><span data-lang-it>Per sapere se rientri tra i beneficiari rivolgiti ai Servizi sociali del Comune. Se hai bisogno di una mano, parlane con i sacerdoti o con la Caritas parrocchiale: condividi l\'informazione con chi potrebbe averne bisogno.</span><span data-lang-en>To find out whether you are a beneficiary, contact the Municipality\'s social services. If you need help, speak to the priests or the parish Caritas — and share this with anyone who might need it.</span></p>',
  credit=f'<p class="fv-credit">{I["info"]}<span><span data-lang-it>Grafica</span><span data-lang-en>Artwork</span>: Giovanna Cutri</span></p>'))

# 5) CUP pieno — sempre valido
extra_cup = '''<div class="fv-classes" role="list">
              <div role="listitem"><b class="u">U</b><span><span data-lang-it>entro 72 ore</span><span data-lang-en>within 72 hours</span></span></div>
              <div role="listitem"><b class="b">B</b><span><span data-lang-it>entro 10 giorni</span><span data-lang-en>within 10 days</span></span></div>
              <div role="listitem"><b class="d">D</b><span><span data-lang-it>visita 30 gg · esame 60 gg</span><span data-lang-en>visit 30 days · test 60 days</span></span></div>
              <div role="listitem"><b class="p">P</b><span><span data-lang-it>entro 120 giorni</span><span data-lang-en>within 120 days</span></span></div>
            </div>
            <div class="fv-say"><span class="fv-say-lbl"><span data-lang-it>Al CUP chiedi:</span><span data-lang-en>At the CUP ask:</span></span>
              <p data-lang-it>«Mi potete attestare che non c'è disponibilità nei tempi di garanzia per la mia classe di priorità? Chiedo la prestazione in regime di intramoenia a carico del SSN, ai sensi dell'art. 3, comma 13, del D.Lgs. 124/1998.»</p>
              <p data-lang-en>“Can you certify that there is no availability within the guaranteed time for my priority class? I request the service privately within the hospital (intramoenia) at the expense of the National Health Service, under art. 3(13) of Legislative Decree 124/1998.”</p>
            </div>'''
items.append(item('cup-tempi-di-attesa', 'vita', '', '', '', '', '', '',
  'cup-tempi-attesa', 'Infografica: CUP pieno? Le classi di priorità della ricetta e il diritto alla visita in intramoenia',
  'CUP pieno? Un diritto che pochi conoscono', 'CUP fully booked? A right few people know',
  [('info', "Vale per tutte le prenotazioni con impegnativa del medico", "Applies to every booking with a doctor's referral")],
  "Sulla ricetta il medico indica una <strong>lettera di priorità</strong>: è il tempo massimo entro cui l'Azienda Sanitaria deve garantire la visita o l'esame. Se il CUP non ha posto entro quel tempo, non devi rinunciare né pagare a privato.",
  "On the referral the doctor marks a <strong>priority letter</strong>: it is the maximum time within which the health authority must provide the visit or test. If the CUP has no slot within that time, you do not have to give up or pay privately.",
  [("Hai diritto alla prestazione <strong>in intramoenia</strong> (libera professione in ospedale) pagando <strong>solo il ticket</strong>, non la differenza.", "You are entitled to the service <strong>intramoenia</strong> (private practice within the hospital) paying <strong>only the ticket</strong>, not the difference."),
   ("Se il CUP non risponde, devono indirizzarti all'Ufficio Liste d'Attesa o all'URP della tua ASP.", "If the CUP cannot help, they must refer you to the waiting-list office or the public relations office (URP) of your local health authority (ASP)."),
   ("Non accettare un rinvio di mesi come se fosse normale: fatti mettere per iscritto il superamento dei tempi.", "Do not accept a delay of months as normal: ask for the overrun to be put in writing.")],
  extra=extra_cup,
  credit=f'<p class="fv-credit">{I["info"]}<span><span data-lang-it>Grafica</span><span data-lang-en>Artwork</span>: Giovanna Cutri · <span data-lang-it>le modalità possono variare da Regione a Regione: in caso di dubbi rivolgiti all\'URP dell\'ASP di Agrigento.</span><span data-lang-en>procedures may vary by Region: if in doubt, contact the URP of ASP Agrigento.</span></span></p>',
  evergreen=True))

main = f'''<section class="page-hero">
  <div class="hero-glow"></div>
  <div class="container">
    <div class="breadcrumb"><a href="index.html">Home</a> / <span data-lang-it>Fede e vita</span><span data-lang-en>Faith &amp; life</span></div>
    <span class="eyebrow hero-eyebrow"><span data-lang-it>Fede e vita concreta</span><span data-lang-en>Faith in everyday life</span></span>
    <h1 data-lang-it>Fede e vita</h1><h1 data-lang-en>Faith &amp; life</h1>
    <p class="lead" data-lang-it>Gli appuntamenti della comunità, la voce della Chiesa e le informazioni che aiutano nella vita di ogni giorno: perché il Vangelo si fa vicinanza concreta.</p>
    <p class="lead" data-lang-en>Community events, the voice of the Church and information that helps in everyday life: because the Gospel becomes real closeness.</p>
  </div>
</section>

<!-- ===== BACHECA IN ORDINE CRONOLOGICO ===== -->
<section class="pad bg-ivory" id="avvisi">
  <div class="container">
    <div class="fv-filters" role="group" aria-label="Filtra gli avvisi" data-reveal>
      <button type="button" class="active" data-filter="all" aria-pressed="true"><span data-lang-it>Tutti</span><span data-lang-en>All</span><b data-count="all"></b></button>
      <button type="button" data-filter="parrocchia" aria-pressed="false"><span data-lang-it>La nostra comunità</span><span data-lang-en>Our community</span><b data-count="parrocchia"></b></button>
      <button type="button" data-filter="chiesa" aria-pressed="false"><span data-lang-it>Chiesa universale</span><span data-lang-en>Universal Church</span><b data-count="chiesa"></b></button>
      <button type="button" data-filter="vita" aria-pressed="false"><span data-lang-it>Vita concreta</span><span data-lang-en>Everyday life</span><b data-count="vita"></b></button>
    </div>
    <div class="fv-timeline">{''.join(items)}
    </div>
    <p class="fv-foot" data-reveal><span data-lang-it>Hai un avviso utile per la comunità? <a href="contatti.html">Scrivici</a>: lo valuteremo con i sacerdoti.</span><span data-lang-en>Do you have a useful notice for the community? <a href="contatti.html">Write to us</a> and we will consider it with the priests.</span></p>
  </div>
</section>

'''

lightbox = '''<!-- ===== LOCANDINA A SCHERMO INTERO ===== -->
<div class="poster-lb" id="poster-lb" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Locandina">
  <button class="lb-close" type="button" aria-label="Chiudi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  <figure><img alt=""><figcaption></figcaption></figure>
</div>

<script src="assets/js/main.js" defer></script>
<script>
/* Fede e vita — stato automatico degli avvisi (in arrivo / oggi / in corso / concluso),
   evidenza del prossimo appuntamento, filtri per categoria e locandina a schermo intero. */
(function () {
  var en = function () { return document.documentElement.lang === 'en'; };
  var DAY = 864e5, now = new Date(); now.setHours(0, 0, 0, 0);
  var items = [].slice.call(document.querySelectorAll('.fv-item'));
  function d(s) { var p = s.split('-'); return new Date(+p[0], p[1] - 1, +p[2]); }
  function paint() {
    var nextDone = false;
    items.forEach(function (it) {
      var st = it.querySelector('.fv-status');
      it.classList.remove('is-past', 'is-next');
      if (!it.dataset.start) return;
      var s = d(it.dataset.start), e = d(it.dataset.end || it.dataset.start), txt, cls;
      if (now > e) { txt = en() ? 'Ended' : 'Concluso'; cls = 'past'; it.classList.add('is-past'); }
      else if (now >= s) { txt = (+s === +e) ? (en() ? 'Today' : 'Oggi') : (en() ? 'Ongoing' : 'In corso'); cls = 'now'; }
      else {
        var n = Math.round((s - now) / DAY);
        txt = n === 1 ? (en() ? 'Tomorrow' : 'Domani') : (en() ? 'In ' + n + ' days' : 'Tra ' + n + ' giorni'); cls = 'soon';
      }
      if (cls !== 'past' && !nextDone) { it.classList.add('is-next'); nextDone = true; }
      st.textContent = txt; st.className = 'fv-status ' + cls; st.hidden = false;
    });
  }
  paint();
  document.querySelectorAll('.lang-toggle button').forEach(function (b) { b.addEventListener('click', function () { setTimeout(paint, 0); }); });

  // filtri
  var counts = { all: items.length };
  items.forEach(function (it) { counts[it.dataset.cat] = (counts[it.dataset.cat] || 0) + 1; });
  document.querySelectorAll('[data-count]').forEach(function (b) { b.textContent = counts[b.dataset.count] || 0; });
  document.querySelectorAll('[data-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(function (b) { var on = b === btn; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
      items.forEach(function (it) { it.hidden = !(f === 'all' || it.dataset.cat === f); });
    });
  });

  // locandina a schermo intero
  var lb = document.getElementById('poster-lb'), img = lb.querySelector('img'), cap = lb.querySelector('figcaption'), last;
  function close() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lb-lock'); img.removeAttribute('src'); if (last) last.focus(); }
  document.querySelectorAll('[data-poster]').forEach(function (b) {
    b.addEventListener('click', function () {
      last = b; img.src = b.dataset.poster;
      cap.textContent = en() ? b.dataset.captionEn : b.dataset.captionIt; img.alt = cap.textContent;
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.classList.add('lb-lock');
      lb.querySelector('.lb-close').focus();
    });
  });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.lb-close')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
})();
</script>
</body>
</html>
'''

# ---------- JSON-LD ----------
org = {"@type": "Organization", "name": "Unità Pastorale Sacra Famiglia", "url": "https://www.unitapastoralesacrafamiglia.it/"}
def place(name, street):
    return {"@type": "Church", "name": name, "address": {"@type": "PostalAddress", "streetAddress": street, "addressLocality": "Campobello di Licata", "addressRegion": "AG", "postalCode": "92023", "addressCountry": "IT"}}
ld = [
  {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.unitapastoralesacrafamiglia.it/"},
    {"@type": "ListItem", "position": 2, "name": "Fede e vita", "item": "https://www.unitapastoralesacrafamiglia.it/fede-e-vita.html"}]},
  {"@context": "https://schema.org", "@type": "Event", "name": "Inizio del nuovo anno pastorale 2026/2027 e consegna del mandato agli operatori pastorali",
   "startDate": "2026-10-04T18:00:00+02:00", "endDate": "2026-10-04T19:45:00+02:00", "eventStatus": "https://schema.org/EventScheduled",
   "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode", "location": place("Chiesa di San Giuseppe", "Piazza San Giuseppe"),
   "image": "https://www.unitapastoralesacrafamiglia.it/assets/img/avvisi/anno-pastorale-2026.jpg",
   "description": "Raduno alle 18:00 davanti alla Chiesa Gesù e Maria, breve processione verso la Chiesa di San Giuseppe e alle 18:30 Santa Messa solenne con il conferimento del Mandato Pastorale.",
   "organizer": org, "isAccessibleForFree": True},
  {"@context": "https://schema.org", "@type": "Event", "name": "Inaugurazione del nuovo anno catechistico 2026/2027",
   "startDate": "2026-10-11T11:00:00+02:00", "endDate": "2026-10-11T12:15:00+02:00", "eventStatus": "https://schema.org/EventScheduled",
   "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode", "location": place("Chiesa di San Giuseppe", "Piazza San Giuseppe"),
   "image": "https://www.unitapastoralesacrafamiglia.it/assets/img/avvisi/catechismo-2026.jpg",
   "description": "Santa Messa solenne con la partecipazione delle famiglie. Iscrizioni aperte ai bambini di 7 anni (seconda elementare): modulo in parrocchia nei giorni di Messa.",
   "organizer": org, "isAccessibleForFree": True},
]
ld_html = ''.join('<script type="application/ld+json">\n' + json.dumps(x, ensure_ascii=False) + '\n</script>\n' for x in ld)

S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'
IC = {
 'dress': f'<svg {S}><path d="M9 3h6l-1 4 4 13H6l4-13-1-4Z"/><path d="M9 3 7 5M15 3l2 2"/></svg>',
 'shh': f'<svg {S}><circle cx="10" cy="8" r="4"/><path d="M4 21c0-3.5 2.7-6 6-6"/><path d="M17 9v7M15 12.5h4"/></svg>',
 'phone': f'<svg {S}><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2M3 3l18 18"/></svg>',
 'pray': f'<svg {S}><circle cx="12" cy="5" r="2.5"/><path d="M12 9v5l-4 7M12 14l4 7M9 11l3 2 3-2"/></svg>',
 'family': f'<svg {S}><circle cx="7" cy="5" r="2"/><circle cx="17" cy="5" r="2"/><circle cx="12" cy="11" r="1.6"/><path d="M4 21v-7a3 3 0 0 1 6 0v7M14 21v-7a3 3 0 0 1 6 0v7M10.5 21v-4.5a1.5 1.5 0 0 1 3 0V21"/></svg>',
 'heart': f'<svg {S}><path d="M12 21s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 12c0 4.7-7 9-7 9Z"/></svg>',
 'book': f'<svg {S}><path d="M5 4a2 2 0 0 1 2-2h12v18H7a2 2 0 0 0-2 2V4Z"/><path d="M12 6v7M9.5 8.5h5"/></svg>',
 'hands': f'<svg {S}><path d="M12 8.5 10.6 7a2 2 0 0 0-3 2.6L12 14l4.4-4.4a2 2 0 0 0-3-2.6L12 8.5Z"/><path d="M3 14l4 4h6M21 14l-4 4h-4"/></svg>',
 'cross': f'<svg {S}><path d="M12 2v20M6 8h12"/></svg>',
 'candle': f'<svg {S}><path d="M12 2c1.5 2 1.5 3.5 0 4.5-1.5-1-1.5-2.5 0-4.5Z"/><rect x="8" y="9" width="8" height="13" rx="1.5"/></svg>',
 'sun': f'<svg {S}><path d="M12 17s-4-2.4-4-5a2.2 2.2 0 0 1 4-1.3A2.2 2.2 0 0 1 16 12c0 2.6-4 5-4 5Z"/><path d="M12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4M2 12h2M20 12h2"/></svg>',
}
rules = [
 ('dress', 'Abbigliamento consono', 'Appropriate clothing',
  'Vesti in modo decoroso e rispettoso del luogo sacro. Evita abiti scollati, corti, trasparenti o troppo appariscenti.',
  'Dress decently and respectfully for the sacred place. Avoid low-cut, short, see-through or showy clothes.',
  'Il tuo abbigliamento parli di te e del rispetto verso Dio.', 'Let your clothing speak of you and of your respect for God.'),
 ('shh', 'Silenzio e raccoglimento', 'Silence and recollection',
  'In chiesa si parla con Dio, non con gli altri. Manteniamo un tono basso, evitiamo chiacchiere e custodiamo il silenzio prima, durante e dopo le celebrazioni.',
  'In church we speak with God, not with each other. Let us keep our voices low, avoid chatting and keep silence before, during and after the celebrations.',
  'Il silenzio è preghiera che sale al cielo.', 'Silence is prayer rising to heaven.'),
 ('phone', 'Cellulari spenti', 'Phones off',
  'Spegni o metti in modalità silenziosa il cellulare. Evitiamo ogni distrazione e rispettiamo chi è in preghiera.',
  'Switch off your phone or put it on silent. Let us avoid distractions and respect those who are praying.',
  'Dio merita la tua attenzione, non le notifiche.', 'God deserves your attention, not your notifications.'),
 ('pray', 'Partecipazione attiva', 'Active participation',
  'Partecipa con fede: ascolta la Parola, rispondi, canta e prega con il cuore. La Messa non è uno spettacolo, ma un incontro con Dio.',
  'Take part with faith: listen to the Word, respond, sing and pray from the heart. Mass is not a show but an encounter with God.',
  'Essere presenti non è sufficiente, conta essere coinvolti.', 'Being present is not enough: what matters is being involved.'),
 ('family', 'Rispetto per tutti', 'Respect for everyone',
  'Accogliamo tutti con carità. Evitiamo di occupare posti riservati, di passare davanti durante le preghiere e di uscire in momenti importanti.',
  'Let us welcome everyone with charity. Avoid taking reserved seats, walking in front of others during prayers and leaving at important moments.',
  'La carità inizia dai piccoli gesti.', 'Charity begins with small gestures.'),
]
virtues = [
 ('heart', 'Ama Dio', 'Love God', 'Poni Dio al primo posto nella tua vita. Preghiera, fede e fiducia in Lui ogni giorno.', 'Put God first in your life. Prayer, faith and trust in Him every day.'),
 ('book', 'Conosci la sua Parola', 'Know His Word', 'Leggi il Vangelo, ascolta e medita: la Parola illumina il cammino.', 'Read the Gospel, listen and meditate: the Word lights the way.'),
 ('hands', 'Ama il prossimo', 'Love your neighbour', 'Rispetta, aiuta, perdona e sii gentile con tutti, soprattutto con chi è nel bisogno.', 'Respect, help, forgive and be kind to all, especially those in need.'),
 ('cross', 'Vivi i Sacramenti', 'Live the Sacraments', "Partecipa alla Messa, confessati, ricevi l'Eucaristia: sono doni di grazia.", 'Go to Mass, go to Confession, receive the Eucharist: they are gifts of grace.'),
 ('candle', 'Testimonia con la vita', 'Witness with your life', 'Sii luce nel mondo con le tue scelte, le tue parole e i tuoi gesti.', 'Be a light in the world through your choices, words and deeds.'),
 ('sun', 'Coltiva le virtù', 'Grow in virtue', 'Sii umile, paziente, generoso, sincero e riconoscente: il bene costruisce.', 'Be humble, patient, generous, sincere and grateful: goodness builds up.'),
]
rules_html = ''.join(f'''
      <article class="ic-rule{' d1' if i % 3 == 1 else ' d2' if i % 3 == 2 else ''}" data-reveal>
        <span class="ic-ico">{IC[k]}</span>
        <h3><span data-lang-it>{t_it}</span><span data-lang-en>{t_en}</span></h3>
        <p data-lang-it>{p_it}</p><p data-lang-en>{p_en}</p>
        <p class="ic-key" data-lang-it>{k_it}</p><p class="ic-key" data-lang-en>{k_en}</p>
      </article>''' for i, (k, t_it, t_en, p_it, p_en, k_it, k_en) in enumerate(rules))
virt_html = ''.join(f'''
      <div class="ic-virtue" data-reveal>
        <span class="ic-ico">{IC[k]}</span>
        <h4><span data-lang-it>{t_it}</span><span data-lang-en>{t_en}</span></h4>
        <p data-lang-it>{p_it}</p><p data-lang-en>{p_en}</p>
      </div>''' for k, t_it, t_en, p_it, p_en in virtues)

ic = f'''<!-- ===== IN CHIESA: UN LUOGO SACRO DA VIVERE CON RISPETTO ===== -->
<section class="pad bg-paper" id="in-chiesa">
  <div class="container">
    <div class="ic-intro">
      <div data-reveal>
        <span class="eyebrow"><span data-lang-it>Come stare in chiesa</span><span data-lang-en>How to be in church</span></span>
        <h2 data-lang-it>In chiesa, un luogo sacro da vivere con rispetto</h2><h2 data-lang-en>In church, a sacred place to live with respect</h2>
        <p class="lead" data-lang-it>La chiesa è la casa di Dio e la nostra casa: entriamo con rispetto, viviamo con fede, usciamo per essere testimoni nel mondo.</p>
        <p class="lead" data-lang-en>The church is God's house and our home: let us enter with respect, live with faith and go out to be witnesses in the world.</p>
        <p class="ic-motto" data-lang-it>Un invito semplice, per tutti: grandi e piccoli, fedeli di ogni giorno e ospiti di passaggio.</p>
        <p class="ic-motto" data-lang-en>A simple invitation for everyone: young and old, daily faithful and passing guests.</p>
      </div>
      <button class="fv-poster ic-poster" type="button" data-poster="assets/img/avvisi/in-chiesa-rispetto.jpg" data-caption-it="In chiesa, un luogo sacro da vivere con rispetto" data-caption-en="In church, a sacred place to live with respect" aria-label="Apri la locandina: In chiesa, un luogo sacro da vivere con rispetto" data-reveal>
        <img src="assets/img/avvisi/in-chiesa-rispetto-t.jpg" alt="Locandina: In chiesa, un luogo sacro da vivere con rispetto" loading="lazy" width="560" height="840">
        <span class="fv-zoom">{I["zoom"]}<span data-lang-it>Locandina</span><span data-lang-en>Poster</span></span>
      </button>
    </div>
    <div class="ic-rules">{rules_html}
    </div>
    <div class="ic-sep" data-reveal><h3><span data-lang-it>Le regole principali di un cristiano</span><span data-lang-en>A Christian's main rules</span></h3></div>
    <div class="ic-virtues">{virt_html}
    </div>
    <div class="ic-thanks" data-reveal>
      <p data-lang-it>Grazie per il tuo rispetto e la tua testimonianza.</p><p data-lang-en>Thank you for your respect and your witness.</p>
      <small><span data-lang-it>Insieme rendiamo la chiesa un luogo di pace e incontro con Dio</span><span data-lang-en>Together let us make the church a place of peace and encounter with God</span></small>
    </div>
  </div>
</section>

'''

# pulsanti nell'hero verso le due sezioni
main = main.replace('''    <p class="lead" data-lang-en>Community events, the voice of the Church and information that helps in everyday life: because the Gospel becomes real closeness.</p>
''', '''    <p class="lead" data-lang-en>Community events, the voice of the Church and information that helps in everyday life: because the Gospel becomes real closeness.</p>
    <div class="hero-cta" style="display:flex;flex-wrap:wrap;gap:.8rem;margin-top:1.8rem">
      <a class="btn btn-gold" href="#avvisi"><span data-lang-it>Gli avvisi</span><span data-lang-en>Notices</span></a>
      <a class="btn btn-ghost-light" href="#in-chiesa"><span data-lang-it>Come stare in chiesa</span><span data-lang-en>How to be in church</span></a>
    </div>
''', 1)
assert 'hero-cta' in main

page = (head + '<link rel="stylesheet" href="assets/css/style.css">\n' + ld_html + '</head>\n' + header + main + ic + footer + lightbox)
open('fede-e-vita.html', 'w', encoding='utf-8').write(page)
for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', page, re.S):
    json.loads(b)
print('ok', len(page))
print('-> ora rilancia: node build-share-avvisi.js  (anteprime social + pagine avviso/)')
