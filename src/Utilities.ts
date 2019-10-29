export class Utilities {
  constructor(private readonly main: any) {}

  centerHor(a: any, g: any, k: any) {
    if (!g) g = this.main.width
    if (!k) k = a.length
    var f = Math.abs(a.length - k)
    var b = (g - k - 1) / 2
    var c = ''
    for (var i = 0; i < b; i++) {
      c += ' '
    }
    c += a
    return this.main.fill(c, g, c.length - f)
  }

  fill(a: any, b: any, k: any) {
    a = a.toString()
    if (!k) k = a.length
    var c = b - k
    for (var i = 0; i < c; i++) {
      a += ' '
    }
    return a
  }

  wrap(value: string, maxlen: number) {
    const results = []

    while (0 == 0) {
      if (value.length < maxlen) {
        results.push(value)
        break
      }
      const s = value.substring(0, maxlen)
      const index = s.lastIndexOf(' ')
      if (index != -1) {
        results.push(s.substring(0, index))
        value = value.substring(index + 1)
      } else {
        results.push(value)
        break
      }
    }

    return results
  }
}
