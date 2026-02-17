import * as XLSX from 'xlsx';

interface PrzedmiarRow {
  lp: number;
  opis: string;
  jednostka: string;
  ilosc: number;
  cena_jednostkowa?: number;
  wartosc?: number;
  uwagi?: string;
}

export function generateExcel(rows: PrzedmiarRow[], fileName?: string): Buffer {
  const wb = XLSX.utils.book_new();

  const wsData = [
    ['Lp.', 'Opis robót', 'Jednostka', 'Ilość', 'Cena jedn.', 'Wartość', 'Uwagi'],
    ...rows.map((r) => [
      r.lp,
      r.opis,
      r.jednostka,
      r.ilosc,
      r.cena_jednostkowa || '',
      r.wartosc || '',
      r.uwagi || '',
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [
    { wch: 5 },   // Lp
    { wch: 50 },  // Opis
    { wch: 10 },  // Jednostka
    { wch: 10 },  // Ilość
    { wch: 12 },  // Cena
    { wch: 12 },  // Wartość
    { wch: 25 },  // Uwagi
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Przedmiar');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(buf);
}
