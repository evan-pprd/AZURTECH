/* ===== AZURTECH — Générateur PDF de marque (jsPDF) =====
   Style aligné au site : palette azur, bandeau d'accent, mise en page soignée.
   Expose window.AZ.buildDevisPDF(d) et window.AZ.buildRdvPDF(d). */
(function () {
  const C = {
    ink:[15,38,55], inkSoft:[67,96,111], azur:[21,88,158], deep:[12,59,107],
    light:[41,182,239], sky:[232,243,252], skyLine:[196,225,244], sea:[15,166,156],
    coral:[255,107,74], amber:[247,168,27], line:[221,228,228], ok:[30,158,106],
    okBg:[230,244,236], white:[255,255,255]
  };
  const W = 210, H = 297, M = 18, CW = W - 2 * M;

  function header(doc, badge, d) {
    doc.setFillColor.apply(doc, C.deep); doc.rect(0, 0, W, 34, 'F');
    // léger dégradé simulé : bande azur plus claire en bas du bandeau
    doc.setFillColor.apply(doc, C.azur); doc.rect(0, 27, W, 7, 'F');
    // barre d'accent 4 couleurs (rappel du footer du site)
    const segs = [C.azur, C.sea, C.coral, C.amber], sw = W / 4;
    segs.forEach((c, i) => { doc.setFillColor.apply(doc, c); doc.rect(i * sw, 34, sw, 1.7, 'F'); });
    // pastille logo
    doc.setFillColor.apply(doc, C.light); doc.roundedRect(M, 10, 12.5, 12.5, 3, 3, 'F');
    doc.setTextColor.apply(doc, C.deep); doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
    doc.text('A', M + 6.25, 18.4, { align: 'center' });
    // nom
    doc.setTextColor.apply(doc, C.white); doc.setFont('helvetica', 'bold'); doc.setFontSize(17);
    doc.text('AZURTECH', M + 17, 17);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.4); doc.setTextColor(190, 214, 238);
    doc.text("Technicien informatique \u00b7 C\u00f4te d'Azur", M + 17, 22.5);
    // badge type de document (droite)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor.apply(doc, C.light);
    doc.text(badge, W - M, 15.5, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(200, 220, 240);
    doc.text('R\u00e9f. ' + d.ref, W - M, 21, { align: 'right' });
    doc.text(d.date, W - M, 25.5, { align: 'right' });
  }

  function footer(doc) {
    doc.setDrawColor.apply(doc, C.line); doc.setLineWidth(0.3); doc.line(M, 283, W - M, 283);
    doc.setFontSize(8.3); doc.setTextColor.apply(doc, C.inkSoft);
    doc.text('AZURTECH  \u00b7  07 68 69 55 40  \u00b7  contact@azurtech-informatique.fr', M, 289);
    doc.text('Interventions \u00e0 distance (LogMeIn) & \u00e0 domicile \u2014 de Monaco \u00e0 Cannes.', M, 293.5);
  }

  // Titre de section
  function title(doc, y, txt) {
    doc.setTextColor.apply(doc, C.ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(13.5);
    doc.text(txt, M, y);
    doc.setDrawColor.apply(doc, C.skyLine); doc.setLineWidth(0.5); doc.line(M, y + 3, W - M, y + 3);
    return y + 12;
  }

  // Ligne label / valeur avec séparateur discret
  function row(doc, y, k, v) {
    const labelW = 50;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor.apply(doc, C.inkSoft);
    doc.text(k.toUpperCase(), M, y + 4.4);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc, C.ink);
    const lines = doc.splitTextToSize(v || '\u2014', CW - labelW);
    doc.text(lines, M + labelW, y + 4.4);
    const h = Math.max(9, lines.length * 5.2 + 3.5);
    doc.setDrawColor(238, 242, 245); doc.setLineWidth(0.3); doc.line(M, y + h, W - M, y + h);
    return y + h + 2.5;
  }

  // Encadré mis en avant
  function callout(doc, y, bg, border, titleTx, titleCol, body, bodyCol, h) {
    h = h || 20;
    doc.setFillColor.apply(doc, bg); doc.setDrawColor.apply(doc, border); doc.setLineWidth(0.5);
    doc.roundedRect(M, y, CW, h, 3, 3, 'FD');
    doc.setTextColor.apply(doc, titleCol); doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5);
    doc.text(titleTx, M + 7, y + 8.5);
    if (body) {
      doc.setTextColor.apply(doc, bodyCol); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      doc.text(body, M + 7, y + 15);
    }
    return y + h + 8;
  }

  function clientBlock(doc, y, d) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor.apply(doc, C.inkSoft);
    doc.text('CLIENT', M, y + 4);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc, C.ink);
    doc.text(`${d.nom}   \u00b7   ${d.tel}   \u00b7   ${d.email}`, M, y + 10.5);
    return y + 18;
  }

  /* ===== DEVIS ===== */
  function buildDevisPDF(d) {
    const { jsPDF } = window.jspdf, doc = new jsPDF({ unit: 'mm', format: 'a4' });
    header(doc, 'DEVIS', d);
    let y = title(doc, 48, 'Demande de devis \u2014 gratuite et sans engagement');
    y = row(doc, y, 'Prestation', d.svc);
    y = row(doc, y, 'Mat\u00e9riel concern\u00e9', d.matFull || d.mat);
    y = row(doc, y, "Type d'intervention", d.mode);
    if (d.ville) y = row(doc, y, "Ville d'intervention", d.ville);
    y = row(doc, y, "Niveau d'urgence", d.urg);
    y = row(doc, y, 'Description du besoin', d.desc);
    y += 4;
    y = clientBlock(doc, y, d);
    callout(doc, y, C.okBg, C.ok, 'Ce devis est 100 % gratuit et sans engagement.', [20,110,72],
      "Aucune obligation d'achat. Estimation communiqu\u00e9e apr\u00e8s \u00e9tude de la demande.", [30,120,85], 20);
    footer(doc);
    return doc;
  }

  /* ===== RENDEZ-VOUS ===== */
  function buildRdvPDF(d) {
    const { jsPDF } = window.jspdf, doc = new jsPDF({ unit: 'mm', format: 'a4' });
    header(doc, 'RENDEZ-VOUS', d);
    let y = title(doc, 48, 'Confirmation de rendez-vous');
    // encadré date/heure mis en avant
    y = callout(doc, y, C.sky, C.skyLine,
      `${d.dateLabel}  \u2014  ${d.time}`, C.azur,
      `Cr\u00e9neau r\u00e9serv\u00e9 \u00b7 ${d.mode}`, C.inkSoft, 20);
    y = row(doc, y, 'Prestation', d.svc);
    y = row(doc, y, 'Mat\u00e9riel concern\u00e9', d.matFull || d.mat);
    y = row(doc, y, "Mode d'intervention", d.mode);
    if (d.ville) y = row(doc, y, 'Ville', d.ville);
    if (d.adr) y = row(doc, y, 'Adresse', d.adr);
    if (d.msg) y = row(doc, y, 'Pr\u00e9cisions', d.msg);
    y += 4;
    y = clientBlock(doc, y, d);
    footer(doc);
    return doc;
  }

  window.AZ = { buildDevisPDF, buildRdvPDF };
})();
