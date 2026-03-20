import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PatchDiffPreview } from './PatchDiffPreview'

describe('PatchDiffPreview', () => {
  it('renders unchanged and added lines for a simple insertion', () => {
    render(
      <PatchDiffPreview
        oldSnippet={'app = FastAPI()\n'}
        newContent={'app = FastAPI()\napp.include_router(router)\n'}
      />,
    )

    const preview = screen.getByRole('region', { name: /patch diff preview/i })
    expect(preview).toHaveTextContent(/app = FastAPI\(\)/)
    expect(preview).toHaveTextContent(/\+app\.include_router\(router\)/)
  })

  it('renders removed lines when content is deleted', () => {
    render(
      <PatchDiffPreview
        oldSnippet={'line one\nline two\n'}
        newContent={'line one\n'}
      />,
    )

    const preview = screen.getByRole('region', { name: /patch diff preview/i })
    expect(preview).toHaveTextContent(/line one/)
    expect(preview).toHaveTextContent(/-line two/)
  })

  it('renders removed and added lines when there is no shared context', () => {
    render(
      <PatchDiffPreview
        oldSnippet={'old line\n'}
        newContent={'new line\n'}
      />,
    )

    const preview = screen.getByRole('region', { name: /patch diff preview/i })
    expect(preview).toHaveTextContent(/-old line/)
    expect(preview).toHaveTextContent(/\+new line/)
  })
})
