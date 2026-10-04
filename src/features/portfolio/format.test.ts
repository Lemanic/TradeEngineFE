import { describe, expect, it } from 'vitest'

import {
  formatAmount,
  formatAxisTick,
  formatCompactMoney,
  formatDate,
  formatMoney,
  formatPointLabel,
  formatRelative,
  formatShare,
  formatSignedMoney,
  formatSignedPercent,
} from './format'

// W pl-PL separatorem tysięcy jest twarda spacja (U+00A0), nie zwykła.
const NBSP = ' '

describe('kwoty', () => {
  it('formatuje USD i PLN zgodnie z pl-PL', () => {
    expect(formatMoney(48210.55, 'USD')).toBe(`48${NBSP}210,55${NBSP}USD`)
    expect(formatMoney(177229.55, 'PLN')).toBe(`177${NBSP}229,55${NBSP}zł`)
  })

  it('zawsze pokazuje znak przy zmianie', () => {
    // pl-PL grupuje dopiero od pięciu cyfr (minimumGroupingDigits = 2),
    // więc 1240,18 jest bez separatora, a 48 210,55 już z nim.
    expect(formatSignedMoney(1240.18, 'USD')).toBe(`+1240,18${NBSP}USD`)
    expect(formatSignedMoney(48210.55, 'USD')).toBe(`+48${NBSP}210,55${NBSP}USD`)
    expect(formatSignedMoney(-820.1, 'USD')).toBe(`-820,10${NBSP}USD`)
  })

  it('skraca duże kwoty do środka donuta', () => {
    expect(formatCompactMoney(47899.88, 'USD')).toBe(`47,9${NBSP}tys.${NBSP}USD`)
  })

  it('pokazuje ilość aktywa z maksymalnie czterema miejscami', () => {
    expect(formatAmount(2.41)).toBe('2,41')
    expect(formatAmount(3400.42)).toBe('3400,42')
    expect(formatAmount(0.123456)).toBe('0,1235')
  })
})

describe('procenty', () => {
  it('zawsze pokazuje znak dla zmian', () => {
    expect(formatSignedPercent(0.025598)).toBe('+2,56%')
    expect(formatSignedPercent(-0.019899)).toBe('-1,99%')
    expect(formatSignedPercent(0)).toBe('+0,00%')
  })

  it('udział w portfelu ma jedno miejsce po przecinku', () => {
    expect(formatShare(0.4217)).toBe('42,2%')
  })
})

describe('daty', () => {
  const iso = new Date(2026, 8, 12, 16, 0).toISOString()

  it('formatuje datę i etykiety osi', () => {
    expect(formatDate(iso)).toBe('12.09.2026')
    expect(formatAxisTick(iso, '24H')).toBe('16:00')
    expect(formatAxisTick(iso, '30D')).toBe('12 wrz')
    expect(formatAxisTick(iso, '1Y')).toBe('wrz')
    expect(formatAxisTick(iso, 'ALL')).toBe('wrz 2026')
  })

  it('nagłówek tooltipa ma godzinę tylko dla zakresów godzinowych', () => {
    expect(formatPointLabel(iso, '24H')).toContain('16:00')
    expect(formatPointLabel(iso, '1Y')).not.toContain('16:00')
  })

  it('czas względny używa krótkich form', () => {
    const now = new Date(2026, 9, 4, 8, 12)
    expect(formatRelative(new Date(2026, 9, 4, 8, 0).toISOString(), now)).toBe('12 min temu')
    expect(formatRelative(new Date(2026, 9, 4, 6, 12).toISOString(), now)).toBe('2 godz. temu')
    expect(formatRelative(new Date(2026, 9, 1, 8, 12).toISOString(), now)).toBe('3 dni temu')
    expect(formatRelative(new Date(2026, 9, 4, 8, 11, 40).toISOString(), now)).toBe('przed chwilą')
  })
})
