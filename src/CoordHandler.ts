export interface Coord {
  x: number
  y: number
}

export class Coords {
  private xrange = 50
  private yrange = 25

  constructor(private readonly main: any) {}

  toReal(x: number, y: number): Coord {
    const xdif = this.main.width / this.xrange / 2
    const ydif = this.main.height / this.yrange / 2
    x += this.xrange
    y += this.yrange
    return { x: Math.floor(x * xdif), y: Math.floor(this.main.height - y * ydif) }
  }

  toRelative(x: number, y: number): Coord {
    const xdif = this.main.width / this.xrange / 2
    const ydif = this.main.height / this.yrange / 2
    x += this.xrange
    y += this.yrange
    return { x: Math.floor(x / xdif), y: Math.floor((this.main.height - y) / ydif) }
  }
}
