import { describe, expect, it } from 'vitest'
import { parseVideoId } from './parseVideoId'

describe('parseVideoId', () => {
  it('extracts the numeric id from a watch URL', () => {
    expect(parseVideoId('https://www.netflix.com/watch/80100172')).toBe('80100172')
  })

  it('ignores query params and trailing path', () => {
    expect(parseVideoId('https://www.netflix.com/watch/80100172?trackId=255824129')).toBe('80100172')
    expect(parseVideoId('https://www.netflix.com/watch/80100172/')).toBe('80100172')
  })

  it('returns null for non-watch Netflix pages', () => {
    expect(parseVideoId('https://www.netflix.com/browse')).toBeNull()
    expect(parseVideoId('https://www.netflix.com/title/80100172')).toBeNull()
    expect(parseVideoId('https://www.netflix.com/search?q=x')).toBeNull()
  })

  it('returns null when the watch path has no numeric id', () => {
    expect(parseVideoId('https://www.netflix.com/watch/')).toBeNull()
    expect(parseVideoId('https://www.netflix.com/watch/abc')).toBeNull()
  })

  it('returns null for non-URL input', () => {
    expect(parseVideoId('not a url')).toBeNull()
    expect(parseVideoId('')).toBeNull()
  })
})
