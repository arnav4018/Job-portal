// Simple test to verify the test setup works
describe('Basic Test Setup', () => {
  it('should work without complex dependencies', () => {
    expect(true).toBe(true)
  })

  it('should be able to perform basic assertions', () => {
    const value = 2 + 2
    expect(value).toBe(4)
  })

  it('should handle arrays', () => {
    const array = [1, 2, 3]
    expect(array).toHaveLength(3)
    expect(array).toContain(2)
  })
})
