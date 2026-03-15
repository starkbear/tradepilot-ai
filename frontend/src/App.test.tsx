import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the local login entry point', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /trading system assistant/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enter workspace/i })).toBeInTheDocument()
  })
})
