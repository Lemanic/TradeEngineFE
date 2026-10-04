import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '@/App'
import { PRIVACY_STORAGE_KEY } from '@/lib/privacy'
import { renderWithProviders } from '@/test/render'

/**
 * Kwoty: „47 899,88 USD”, „3400,42”, „1,00 USD”. Procenty też mają dwie cyfry
 * po przecinku („+2,56%”), więc wykluczamy je spojrzeniem w przód.
 */
const MONEY_IN_DOM = /\d,\d{2}(?!\s*%)/

describe('tryb prywatny', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('normalnie pokazuje kwoty', () => {
    renderWithProviders(<App />)

    expect(document.body.textContent ?? '').toMatch(MONEY_IN_DOM)
  })

  it('po włączeniu nie wypuszcza żadnej kwoty do DOM', () => {
    window.localStorage.setItem(PRIVACY_STORAGE_KEY, '1')

    renderWithProviders(<App />)

    const text = document.body.textContent ?? ''
    expect(text).not.toMatch(MONEY_IN_DOM)
    // Procenty i udziały zostają — maskujemy kwoty, nie całą treść.
    expect(text).toContain('%')
    expect(screen.getAllByText('•••••').length).toBeGreaterThan(0)
  })

  it('przełącznik ukrywa i przywraca kwoty', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await user.click(screen.getByRole('button', { name: 'Ukryj kwoty' }))
    expect(document.body.textContent ?? '').not.toMatch(MONEY_IN_DOM)

    await user.click(screen.getByRole('button', { name: 'Pokaż kwoty' }))
    expect(document.body.textContent ?? '').toMatch(MONEY_IN_DOM)
  })

  it('zapamiętuje wybór w localStorage', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await user.click(screen.getByRole('button', { name: 'Ukryj kwoty' }))

    expect(window.localStorage.getItem(PRIVACY_STORAGE_KEY)).toBe('1')
  })
})
