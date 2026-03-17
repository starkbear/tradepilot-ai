import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('vite config', () => {
  it('declares a dev proxy for api requests to the local backend', () => {
    const configText = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf8')

    expect(configText).toContain("'/api'")
    expect(configText).toContain("'http://127.0.0.1:8000'")
    expect(configText).toContain('changeOrigin: true')
  })
})
