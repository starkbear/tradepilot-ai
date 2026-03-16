import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('lets the user log in locally and see the workspace form', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/display name/i), 'Wei')
    await user.click(screen.getByRole('button', { name: /enter workspace/i }))

    expect(screen.getByLabelText(/workspace path/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate scaffold/i })).toBeDisabled()
  })
})
