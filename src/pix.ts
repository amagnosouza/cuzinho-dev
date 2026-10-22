// Static Pix "copia e cola" (BR Code), built client-side: it's just EMV TLV fields plus a CRC16 checksum
const field = (id: string, value: string) => id + String(value.length).padStart(2, '0') + value

// Banks reject accents and long names in these fields
const clean = (s: string, max: number) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 ]/g, '').toUpperCase().slice(0, max)

// CRC16/CCITT-FALSE, as the BR Code spec asks
function crc16(payload: string) {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}

export function pixPayload({ key, name, city, amount }: { key: string; name: string; city: string; amount?: number }) {
  const payload =
    field('00', '01') +
    field('26', field('00', 'br.gov.bcb.pix') + field('01', key)) +
    field('52', '0000') +
    field('53', '986') +
    (amount ? field('54', amount.toFixed(2)) : '') +
    field('58', 'BR') +
    field('59', clean(name, 25)) +
    field('60', clean(city, 15)) +
    field('62', field('05', '***')) +
    '6304'
  return payload + crc16(payload)
}
