import { render, screen } from '@testing-library/react'

import { RewriteDiffPreview } from './RewriteDiffPreview'

describe('RewriteDiffPreview', () => {
  it('renders a unified diff against the current file content', () => {
    render(
      <RewriteDiffPreview
        currentContent={'export function App() {\n  return <div />\n}'}
        newContent={'export function App() {\n  return <main />\n}'}
      />,
    )

    const preview = screen.getByRole('region', { name: /rewrite diff preview/i })
    expect(preview).toHaveTextContent(/export function App\(\)/)
    expect(preview).toHaveTextContent(/- return <div \/>/)
    expect(preview).toHaveTextContent(/\+ return <main \/>/)
  })
})
