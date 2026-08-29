import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function nombreEnLettres(n) {
  if (n === 0) return 'zéro'
  const u = ['','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf']
  const d = ['','','vingt','trente','quarante','cinquante','soixante','soixante','quatre-vingt','quatre-vingt']
  let r = ''
  if (n >= 1000000) { r += nombreEnLettres(Math.floor(n/1000000)) + ' million '; n %= 1000000 }
  if (n >= 1000) { const m = Math.floor(n/1000); r += (m===1?'':nombreEnLettres(m)+' ')+'mille '; n %= 1000 }
  if (n >= 100) { const c = Math.floor(n/100); r += (c===1?'cent':nombreEnLettres(c)+' cent')+' '; n %= 100 }
  if (n >= 20) { const dz = Math.floor(n/10); const un = n%10; r += (dz===7||dz===9)?d[dz]+'-'+u[10+un]+' ':d[dz]+(un>0?'-'+u[un]:'')+' ' }
  else if (n > 0) r += u[n] + ' '
  return r.trim()
}

function entete(doc, facture, typeLabel, nomEts) {
  // NOM EN BLEU TOUT EN HAUT
  doc.setFontSize(18)
  doc.setTextColor(37, 99, 235)
  doc.setFont(undefined, 'bold')
  doc.text(nomEts.toUpperCase(), 105, 14, { align: 'center' })
  doc.setFont(undefined, 'normal')

  // Description activité
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text('Fournitures et équipements de Bureau, matériels et', 105, 21, { align: 'center' })
  doc.text('consommables informatiques, commerce Général & Divers', 105, 26, { align: 'center' })

  // Ligne séparatrice bleue
  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.8)
  doc.line(15, 30, 195, 30)

  // Date
  const dateStr = facture.date_facture
    ? new Date(facture.date_facture).toLocaleDateString('fr-FR')
    : '……………………'
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)
  doc.text(`Cotonou, le ${dateStr}`, 195, 38, { align: 'right' })

  // Objet, type, client
  doc.setFont(undefined, 'bold')
  doc.text(`OBJET : ${facture.objet_nom || '………………………………………………'}`, 15, 46)
  doc.text(`${typeLabel} : N°${facture.numero_facture}`, 15, 54)
  doc.text(`Client : ${facture.ecoles?.nom || '………………………………'}`, 15, 62)
  doc.setFont(undefined, 'normal')
}

export async function genererPDF(facture, params = {}) {
  const nomEts = params?.nom_etablissement || 'ETS ETONAM PLUS'
  const rccm = params?.rccm || ''
  const ifu = params?.ifu || ''
  const tel1 = params?.telephone1 || ''
  const tel2 = params?.telephone2 || ''
  const type = facture.type_document || 'proforma'
  const lignes = facture.lignes_facture || []

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  if (type === 'bordereau') {
    entete(doc, facture, 'Bordereau de livraison', nomEts)

    const rows = lignes.map((l, idx) => [
      String(idx + 1).padStart(2, '0'),
      l.articles?.nom || '—',
      String(l.quantite),
      '',
    ])

    autoTable(doc, {
      startY: 68,
      margin: { left: 15, right: 15 },
      tableWidth: 180,
      head: [['N°', 'Désignation', 'Quantité', 'Observations']],
      body: rows,
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      styles: { cellPadding: 4, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 80 },
        2: { cellWidth: 28 },
        3: { cellWidth: 60 },
      }
    })

    const finalY = doc.lastAutoTable.finalY + 20
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text('Le Président APE', 15, finalY)
    doc.text('Le Représentant des Enseignants', 115, finalY)
    doc.text('Le Directeur', 15, finalY + 30)
    doc.text('Le Représentant des Elèves', 115, finalY + 30)
    doc.text('La Direction', 105, finalY + 60, { align: 'center' })
    doc.setFont(undefined, 'normal')

  } else {
    const typeLabel = type === 'proforma' ? 'Facture pro-forma' : 'Facture'
    entete(doc, facture, typeLabel, nomEts)

    const totalHT = parseFloat(facture.total_ht || 0)
    const taxe = parseFloat(facture.tva || 0)
    const totalTTC = parseFloat(facture.total_ttc || 0)
    const typeTaxe = facture.type_taxe || 'AIB'
    const taxeRate = totalHT > 0 ? Math.round(taxe / totalHT * 100) : 0

    const rows = lignes.map((l, idx) => [
      String(idx + 1).padStart(2, '0'),
      l.articles?.nom || '—',
      String(l.quantite),
      parseFloat(l.prix_unitaire).toLocaleString('fr-FR'),
      parseFloat(l.prix_ligne).toLocaleString('fr-FR'),
    ])

    rows.push(['', '', '', { content: 'HT', styles: { fontStyle: 'bold', halign: 'right' } }, { content: totalHT.toLocaleString('fr-FR'), styles: { fontStyle: 'bold' } }])
    rows.push(['', '', '', { content: `${typeTaxe} ${taxeRate}%`, styles: { fontStyle: 'bold', halign: 'right' } }, { content: taxe.toLocaleString('fr-FR'), styles: { fontStyle: 'bold' } }])
    rows.push(['', '', '', { content: 'TOTAL TTC', styles: { fontStyle: 'bold', halign: 'right' } }, { content: totalTTC.toLocaleString('fr-FR'), styles: { fontStyle: 'bold' } }])

    autoTable(doc, {
      startY: 68,
      margin: { left: 15, right: 15 },
      tableWidth: 180,
      head: [['N°', 'Désignation', 'Quantité', 'P. Unit.', 'Montant']],
      body: rows,
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      styles: { cellPadding: 4, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 88 },
        2: { cellWidth: 22 },
        3: { cellWidth: 28 },
        4: { cellWidth: 30 },
      }
    })

    const finalY = doc.lastAutoTable.finalY + 10
    const enLettres = nombreEnLettres(Math.round(totalTTC))

    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text(
      `Arrêté, la présente ${typeLabel.toLowerCase()} à la somme TTC de ${enLettres} (${totalTTC.toLocaleString('fr-FR')}) francs CFA.`,
      15, finalY + 8, { maxWidth: 180 }
    )

    doc.setFontSize(10)
    doc.text('La Direction', 150, finalY + 35)
    doc.setFont(undefined, 'normal')
    doc.setDrawColor(150, 150, 150)
    doc.setLineWidth(0.3)
    doc.rect(130, finalY + 38, 60, 28)
  }

  // Pied de page
  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.3)
  doc.line(15, 278, 195, 278)
  doc.setFontSize(8)
  doc.setTextColor(50, 50, 50)
  doc.setFont(undefined, 'bold')
  doc.text(nomEts.toUpperCase(), 105, 283, { align: 'center' })
  doc.setFont(undefined, 'normal')
  doc.setFontSize(7)
  let piedY = 288
  if (rccm) { doc.text(`RCCM : ${rccm}`, 105, piedY, { align: 'center' }); piedY += 4 }
  if (ifu) { doc.text(`N° IFU : ${ifu}`, 105, piedY, { align: 'center' }); piedY += 4 }
  if (tel1 || tel2) doc.text(`Tél : ${tel1}${tel2 ? ' / ' + tel2 : ''}`, 105, piedY, { align: 'center' })

  doc.save(`${facture.numero_facture.replace(/\//g, '-')}.pdf`)
}
