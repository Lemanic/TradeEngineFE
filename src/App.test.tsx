import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import App from '@/App'
import { renderWithProviders } from '@/test/render'

function setPreviewState(state: string | null) {
  window.history.pushState({}, '', state ? `/?state=${state}` : '/')
}

describe('ekran portfela', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    setPreviewState(null)
  })

  afterEach(() => {
    setPreviewState(null)
  })

  it('renderuje nagłówek, hero, donut i tabelę', () => {
    renderWithProviders(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Portfel' })).toBeInTheDocument()
    expect(screen.getByText('Łączna wartość')).toBeInTheDocument()
    expect(screen.getByText('Podział na źródła')).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    // Nazwa dostępna sklejana z sąsiednich <span> nie ma separatorów,
    // więc zamiast jednego wzorca sprawdzamy zawartość wiersza.
    const rabbyRow = screen.getByRole('button', { name: /Rabby/ })
    expect(rabbyRow).toHaveTextContent('42,2%')
    expect(rabbyRow).toHaveTextContent(/20\s?198,58\s?USD/)
  })

  it('przełącznik motywu zmienia klasę na <html>', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await user.click(screen.getByRole('button', { name: /^Motyw/ }))
    await user.click(screen.getByRole('menuitemradio', { name: 'Ciemny' }))
    expect(document.documentElement).toHaveClass('dark')

    await user.click(screen.getByRole('button', { name: /^Motyw/ }))
    await user.click(screen.getByRole('menuitemradio', { name: 'Jasny' }))
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('przełącza walutę na PLN', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await user.click(screen.getByRole('radio', { name: 'PLN' }))

    expect(screen.getByText(/177\s?229,55\s?zł/)).toBeInTheDocument()
  })
})

describe('podglądy stanów przez ?state=', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    setPreviewState(null)
  })

  it('loading pokazuje szkielety', () => {
    setPreviewState('loading')
    renderWithProviders(<App />)

    expect(screen.getByLabelText('Ładowanie danych portfela')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('error pokazuje komunikat i ponowienie, bez danych demo', () => {
    setPreviewState('error')
    renderWithProviders(<App />)

    expect(screen.getByText('Nie udało się pobrać danych portfela')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spróbuj ponownie' })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('empty informuje o pierwszym snapshocie', () => {
    setPreviewState('empty')
    renderWithProviders(<App />)

    expect(screen.getByText('Pierwszy snapshot pojawi się o pełnej godzinie.')).toBeInTheDocument()
  })

  it('incomplete oznacza snapshot i nieaktualną pozycję', () => {
    setPreviewState('incomplete')
    renderWithProviders(<App />)

    expect(screen.getByText('dane niepełne')).toBeInTheDocument()
    expect(screen.getAllByText('nieaktualne').length).toBeGreaterThan(0)
  })
})
