import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('favicon assets', () => {
  it('declares a branded favicon in the html shell', () => {
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8')

    expect(html).toContain('rel="icon"')
    expect(html).toContain('/favicon.svg')
    expect(existsSync(resolve(__dirname, '../public/favicon.svg'))).toBe(true)
    expect(existsSync(resolve(__dirname, '../public/favicon.ico'))).toBe(true)
  })
})
