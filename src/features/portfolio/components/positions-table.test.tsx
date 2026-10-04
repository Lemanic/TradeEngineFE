import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '@/App'
import { renderWithProviders } from '@/test/render'

/**
 * Zapytania są zawężone do tabeli: przełącznik sortowania dla telefonu ma
 * tę samą etykietę co nagłówek aktywnej kolumny i też jest w DOM.
 */
function table() {
  return screen.getByRole('table')
}

/** Pierwsza kolumna każdego wiersza danych — symbol aktywa. */
function assetOrder(): string[] {
  const [, ...rows] = within(table()).getAllByRole('row')
  return rows.map((row) => {
    const cells = within(row).getAllByRole('cell')
    return cells[0]?.textContent?.replace('nieaktualne', '').trim() ?? ''
  })
}

function header(name: string) {
  return within(table()).getByRole('button', { name })
}

describe('sortowanie tabeli pozycji', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('domyślnie sortuje malejąco po wartości', () => {
    renderWithProviders(<App />)

    expect(assetOrder()).toEqual(['BCH', 'TAO', 'ETH', 'ETH', 'BNB', 'USDC', 'TRB'])
  })

  it('kliknięcie aktywnej kolumny odwraca kierunek', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await user.click(header('Wartość'))

    expect(assetOrder()).toEqual(['TRB', 'USDC', 'BNB', 'ETH', 'ETH', 'TAO', 'BCH'])
  })

  it('sortuje alfabetycznie po aktywie', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await user.click(header('Aktywo'))

    expect(assetOrder()).toEqual(['BCH', 'BNB', 'ETH', 'ETH', 'TAO', 'TRB', 'USDC'])
  })

  it('sortuje po ilości', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await user.click(header('Ilość'))

    expect(assetOrder()).toEqual(['USDC', 'TRB', 'TAO', 'BCH', 'BNB', 'ETH', 'ETH'])
  })

  it('oznacza sortowaną kolumnę dla czytników ekranu', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    const valueHeader = within(table()).getByRole('columnheader', { name: /Wartość/ })
    expect(valueHeader).toHaveAttribute('aria-sort', 'descending')

    await user.click(header('Wartość'))
    expect(valueHeader).toHaveAttribute('aria-sort', 'ascending')

    await user.click(header('Aktywo'))
    expect(valueHeader).toHaveAttribute('aria-sort', 'none')
    expect(within(table()).getByRole('columnheader', { name: /Aktywo/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
  })
})
