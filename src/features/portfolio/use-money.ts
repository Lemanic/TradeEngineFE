import { useMemo } from 'react'

import { usePrivacy } from '@/hooks/use-privacy'

import {
  formatAmount,
  formatCompactMoney,
  formatMoney,
  formatPrice,
  formatSignedMoney,
  PRIVATE_MASK,
} from './format'
import type { Currency } from './types'

export type MoneyFormatters = {
  isPrivate: boolean
  /** „47 899,88 USD” albo maska w trybie prywatnym. */
  money: (value: number) => string
  /** „+1 195,55 USD” albo maska. */
  signedMoney: (value: number) => string
  /** „47,9 tys. USD” albo maska. */
  compactMoney: (value: number) => string
  /**
   * Cena jednostkowa: „2716,85 USD”, ale „0,0220914 USD” poniżej jedności.
   * Maskowana jak każda kwota, choć sama jest publicznie znana — bez niej
   * zamaskowana ilość i tak nie zdradza wartości pozycji.
   */
  price: (value: number) => string
  /** Skrót bez waluty — na oś Y, gdzie waluta jest już w nagłówku. */
  axisMoney: (value: number) => string
  /**
   * Ilość aktywa też jest maskowana: przy publicznie znanej cenie
   * sama ilość wystarcza, żeby odtworzyć wartość pozycji.
   */
  quantity: (value: number) => string
}

/**
 * Maskowanie liczy się na poziomie formatowania, nie CSS-em — w trybie
 * prywatnym żadna kwota nie może trafić do DOM (także do tooltipów).
 */
export function useMoney(currency: Currency): MoneyFormatters {
  const { isPrivate } = usePrivacy()

  return useMemo(() => {
    if (isPrivate) {
      const mask = () => PRIVATE_MASK
      return {
        isPrivate,
        money: mask,
        signedMoney: mask,
        compactMoney: mask,
        price: mask,
        axisMoney: mask,
        quantity: mask,
      }
    }

    return {
      isPrivate,
      money: (value: number) => formatMoney(value, currency),
      signedMoney: (value: number) => formatSignedMoney(value, currency),
      compactMoney: (value: number) => formatCompactMoney(value, currency),
      price: (value: number) => formatPrice(value, currency),
      axisMoney: (value: number) =>
        new Intl.NumberFormat('pl-PL', { notation: 'compact', maximumFractionDigits: 1 }).format(
          value,
        ),
      quantity: formatAmount,
    }
  }, [currency, isPrivate])
}
