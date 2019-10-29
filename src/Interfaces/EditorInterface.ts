import { Box } from './Box'

export class EditorInterface {
  private cstate = true
  private cursor = { x: 0, y: 0 }
  private data: any[] = []
  private mode = 0
  private result: any[] = []
  private startline = 0
  private noCursor = false
  private y = 0
  private in: any

  private interval: NodeJS.Timeout

  constructor(
    private readonly main: any,
    private readonly out: any,
    private readonly callback: any,
    private readonly message: string,
    private readonly width: number,
    private readonly height: number,
    private readonly onupt: any,
  ) {
    this.in = out
    this.mode = this.main.mode
    this.width = width ? width : this.main.width
    this.height = height ? height : this.main.height

    this.interval = setInterval(() => {
      if (this.noCursor) {
        return
      }

      this.cstate = !this.cstate
      this.update()
    }, 700)

    this.init()
  }

  remove() {
    try {
      clearInterval(this.interval)
    } catch (e) {}

    this.main.removeEditor()
  }

  createEscBox() {
    const width = 34
    const height = 5
    const st = this.main.coords.toReal(0, 5)
    const sta = st.x - Math.floor(width / 2)
    let b = st.y - Math.floor(height / 2)
    const c = 'Exit'
    if (this.mode !== 3) this.main.prev = this.main.mode
    this.main.mode = 3
    const h = this.main.getNewLayer()
    const box = new Box(width, height, b, sta, true, h, this.main, null)
    const opt = [
      {
        opt: '[Save]',
        onSelect: (a: any) => {
          a.remove()
          this.remove()
          this.callback(this.data.join('\n'))
        },
      },
      {
        opt: '[Dont save]',
        onSelect: (a: any) => {
          a.remove()
          this.remove()
          this.callback(false)
        },
      },
      {
        opt: '[Cancel]',
        onSelect: () => {
          this.noCursor = false
          return 'remove'
        },
      },
    ]

    box.generateOpt(opt)
    this.main.boxes[h] = box
    this.main.layers[h][b] = {
      text: this.centerHor(c, width, undefined),
      start: sta,
      len: width,
      defaultBG: '\x1b[0m\x1b[47m\x1b[30m',
    }
    for (let i = 0; i < 4; i++) {
      b++
      this.main.layers[h][b] = {
        text: this.fill(' ', width, undefined),
        start: sta,
        len: width,
        defaultBG: '\x1b[0m\x1b[47m\x1b[30m',
      }
    }

    this.main.update()
  }

  subtractY() {
    if (this.cursor.y === 0) return (this.y = 0)
    if (this.y === 0) {
      if (this.startline === 0) return
      this.startline -= this.height - 3
      this.y = this.height - 4
      return
    }
    this.y--
  }

  addY() {
    if (this.y === this.height - 4) {
      this.startline += this.height - 3
      this.y = 0
      return
    }

    this.y++
  }

  fill(a: any, b: any, c: any) {
    return this.main.fill(a, b, c)
  }

  centerHor(a: any, b: any, c: any) {
    return this.main.centerHor(a, b, c)
  }

  onKey(key: string) {
    this.cstate = true
    if (key === '\u001B\u005B\u0041') {
      // up
      if (this.cursor.y < 1) return
      this.cursor.y--
      this.subtractY()
      if (!this.data[this.cursor.y] || this.cursor.x >= this.data[this.cursor.y].length) {
        this.cursor.x = this.data[this.cursor.y] ? this.data[this.cursor.y].length : 0
      }
    } else if (key === '\u001B\u005B\u0042') {
      // down
      if (this.cursor.y >= this.data.length) return
      this.cursor.y++
      this.addY()
      if (!this.data[this.cursor.y] || this.cursor.x >= this.data[this.cursor.y].length) {
        this.cursor.x = this.data[this.cursor.y] ? this.data[this.cursor.y].length : 0
      }
    } else if (key === '\u001B\u005B\u0044') {
      // left
      if (this.cursor.x < 1) {
        if (this.cursor.y >= 1) {
          this.cursor.y--
          this.subtractY()
          this.cursor.x = this.data[this.cursor.y] ? this.data[this.cursor.y].length : 0
          this.update()
        }
        return
      }
      this.cursor.x--
    } else if (key === '\u001B\u005B\u0043') {
      // right
      if (!this.data[this.cursor.y] || this.cursor.x >= this.data[this.cursor.y].length) {
        if (this.cursor.y < this.data.length) {
          this.cursor.y++
          this.addY()
          this.cursor.x = 0
          this.update()
        }
        return
      }
      this.cursor.x++
    } else if (key === '\u001B') {
      // esc
      this.noCursor = true
      this.createEscBox()
    } else if (key === '\u000D') {
      // enter
      const data = this.data[this.cursor.y]
      if (data) {
        const after = data.slice(this.cursor.x)
        this.data[this.cursor.y] = data.slice(0, this.cursor.x)
        this.data.splice(this.cursor.y + 1, 0, after)
      } else {
        this.data.splice(this.cursor.y + 1, 0, '')
      }
      this.cursor.y++
      this.cursor.x = 0
      this.addY()
    } else if (key === '\u007F' || key === '\u0008') {
      // back

      const data = this.data[this.cursor.y]
      if (!data && this.cursor.y !== 0) {
        this.data.splice(this.cursor.y, 1)
        this.cursor.y--
        this.subtractY()
        this.cursor.x = this.data[this.cursor.y] ? this.data[this.cursor.y].length : 0
      } else if (data && this.cursor.x > 0) {
        this.data[this.cursor.y] = data.slice(0, this.cursor.x - 1) + data.slice(this.cursor.x)
        if (this.cursor.x < 1) {
          if (this.cursor.y >= 1) {
            this.cursor.y--
            this.subtractY()
            this.cursor.x = this.data[this.cursor.y] ? this.data[this.cursor.y].length : 0
            this.update()
          }
          return
        }
        this.cursor.x--
      } else if (data && this.cursor.x <= 0 && this.cursor.y > 0) {
        this.cursor.x = this.data[this.cursor.y - 1].length
        this.data[this.cursor.y - 1] += this.data[this.cursor.y]
        this.data.splice(this.cursor.y, 1)
        this.cursor.y--
        this.subtractY()
      } else {
        if (this.cursor.x < 1) {
          if (this.cursor.y >= 1) {
            this.cursor.y--
            this.subtractY()
            this.cursor.x = this.data[this.cursor.y].length
            this.data.splice(this.cursor.y + 1, 1)
            this.update()
          }
          return
        }
        this.cursor.x--
      }
    } else {
      if (!this.escapeChar(key)) return
      const data = this.data[this.cursor.y]
      if (!data) {
        this.data[this.cursor.y] = key
      } else {
        this.data[this.cursor.y] = data.slice(0, this.cursor.x) + key + data.slice(this.cursor.x)
      }
      this.cursor.x++
    }
    this.update()
  }

  escapeChar(a: any) {
    const allowed =
      '` 1 2 3 4 5 6 7 8 9 0 - = q w e r t y u i o p [ ] | a s d f g h j k l ; \' z x c v b n m , . / ~ ! @ # $ % ^ & * ( ) _ + Q W E R T Y U I O P { } A S D F G H J K L : \\ " Z X C V B N M < > ?'
    const allow = allowed.split(' ')
    if (a === ' ') return true
    if (allow.indexOf(a) === -1) return false
    return true
  }

  addCursor(a: any, b: any, k: any) {
    if (this.noCursor) return a
    const x = k ? this.cursor.x - k : this.cursor.x
    // if (a.length >= this.width) a = a.slice(0,this.width)
    if (this.cursor.y !== b || !this.cstate) return a
    return a.slice(0, x) + this.main.selectsyle + a.slice(x, x + 1) + '\x1b[0m\x1b[37m\x1b[40m' + a.slice(x + 1)
  }

  update() {
    if (this.cursor.y > this.height) {
    }
    let curr = 0
    this.result[curr] = this.centerHor(this.message + ' press Esc to exit', this.width, undefined)
    curr += 1
    for (let i = 0; i < this.height - 3; i++) {
      // console.log(i,curr,this.height)
      let data = this.data[this.startline + i]
      let k = 0
      if (data && data.length >= this.width - 2) {
        if (this.cursor.x > this.width - 8) {
          data = data.slice(this.width - 8)
          k = this.width - 8
        } else {
          data = data.slice(0, this.width - 4) + ' ->'
        }
      }
      if (!data) data = ''
      this.result[curr] = {
        text: this.addCursor(this.fill(data, this.width, undefined), this.startline + i, k),
        textstyle: '\x1b[0m\x1b[37m\x1b[40m',
      }
      curr++
    }
    this.result[this.height - 2] = this.fill(
      'Ln ' +
        (this.cursor.y + 1) +
        ', Col ' +
        (this.cursor.x + 1) +
        '     ' +
        this.data.length +
        ' lines      Y:' +
        this.y +
        '   H:' +
        this.height,
      this.width,
      undefined,
    )
    this.onupt(this.result)
  }

  init() {
    this.data = this.in.split('\n')

    this.update()
  }
}
