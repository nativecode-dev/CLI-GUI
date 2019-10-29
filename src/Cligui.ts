import { EditorInterface } from './Interfaces'
import { InputHandler, Utilities, Coords, VisualService, Box } from './index'

export class Cligui {
  private editorInterface: EditorInterface | null = null
  private buf = 0
  private width = process.stdout.columns - this.buf
  private height = process.stdout.rows
  private current: any[] = []
  private option = 0
  private options: any[] = []
  private callbacks = false
  private index = 0
  private prev: boolean | any = false
  private boxes: any[] = []
  private mode: boolean | number = false
  private layers: any[] = []
  private version = '2.5.8'
  private versCode = 258
  private typed = ''
  private selectsyle = '\x1b[47m\x1b[30m'
  private dontreset = false
  private textstyle = '\x1b[30m'
  private backround = '\u001B[44m'
  private inputHandler: InputHandler
  private util: Utilities
  private visual: VisualService
  private coords: Coords
  private stdin = process.stdin
  private next: any

  constructor() {
    this.inputHandler = new InputHandler(this)
    this.util = new Utilities(this)
    this.visual = new VisualService(this)
    this.coords = new Coords(this)
    this.stdin.setRawMode(true)
    this.stdin.resume()
    this.stdin.setEncoding('utf8')

    process.stdout.on('resize', () => {
      this.width = process.stdout.columns - 1
      this.height = process.stdout.rows
      this.update()
    })
    this.stdin.on('data', (key: string) => {
      this.dataRecieved(key)

      if (key === '\u0003') {
        process.exit()
      } // ctrl-c
    })
    this.init()
  }
  init() {
    const plat = require('os').platform()
    this.selectsyle = '\x1b[7m'
    this.buf = 0
    if (plat === 'win32') {
      this.buf = 1
      this.selectsyle = '\x1b[47m\x1b[30m'
    } else {
    }
    this.prepare(true)
  }
  stop() {
    this.prepare(true)
    this.fillscreen()
    this.visual.stop()
    this.stdin.pause()
  }
  dataRecieved(key: string) {
    this.inputHandler.dataRecieved(key)
  }
  centerHor(a: any, g: any, k: any) {
    return this.util.centerHor(a, g, k)
  }
  fill(a: any, b: any, k: any) {
    return this.util.fill(a, b, k)
  }
  wrap(value: string, maxlen: number) {
    return this.util.wrap(value, maxlen)
  }

  fillscreen() {
    return this.visual.fillscreen()
  }
  update() {
    return this.visual.update()
  }

  removeBox(id: any) {
    this.layers[id] = false
    this.boxes[id] = false
    this.sortLayers()
    if (!this.boxes[0]) {
      this.mode = this.prev
      this.prev = false
    }
    this.update()
  }
  sortLayers() {
    const final = []
    let last = 0
    const lfinal = []
    for (let i = 0; i < this.layers.length; i++) {
      if (!this.layers[i]) continue
      lfinal[last] = this.boxes[i]
      this.boxes[i].index = last
      final[last] = this.layers[i]
      last++
    }
    this.boxes = lfinal
    this.layers = final
    this.next = last
  }
  getNewLayer() {
    this.sortLayers()

    this.layers[this.next] = []
    this.next++
    return this.next - 1
  }
  removeEditor() {
    this.editorInterface = null
    this.prepare(undefined)
    this.stdin.resume()
  }

  editor(file: any, call: any) {
    this.prepare(undefined)
    this.stdin.resume()
    let f = file.split('/')
    f = f[f.length - 1]
    this.mode = 5
    this.editorInterface = new EditorInterface(
      this,
      require('fs').readFileSync(file, 'utf8'),
      (a: any) => {
        if (call) call(a)
        if (a) require('fs').writeFileSync(file, a, 'utf8')
      },
      'Editing ' + f + '.',
      this.width,
      this.height,
      (a: any) => {
        this.current = a
        this.update()
      },
    )
  }
  createInfoBox(width: number, height: number, content: any, x: number, y: number, callback: any) {
    if (!x) x = 0
    if (!y) y = 0

    const st = this.coords.toReal(x, y)
    const sta = st.x - Math.floor(width / 2)
    let b = st.y - Math.floor(height / 2)
    const c = this.wrap(content, width - 2)
    if (this.mode !== 3) this.prev = this.mode
    this.mode = 3
    const h = this.getNewLayer()
    const box = new Box(width, height, b, sta, false, h, this, callback)
    this.boxes[h] = box
    for (let i = 0; i < height; i++) {
      let s = this.fill('', width, undefined)
      if (c[i]) s = this.centerHor(c[i], width, undefined)

      this.layers[h][b] = {
        text: s,
        start: sta,
        len: width,
        defaultBG: '\x1b[0m\x1b[47m\x1b[30m',
      }
      b++
    }

    this.update()
  }

  prepare(er: any) {
    this.width = process.stdout.columns - this.buf
    this.height = process.stdout.rows
    this.current = []
    this.option = 0
    this.options = []
    this.callbacks = false
    this.index = 0
    this.prev = false
    this.boxes = []
    this.mode = false
    this.layers = []
    this.typed = ''
    this.stdin.pause()
    if (!this.dontreset && !er) this.fillscreen()
    this.dontreset = true
  }

  prompt(title: string, desc: string, callback: any) {
    this.prepare(undefined)
    this.stdin.resume()
    this.callbacks = callback
    this.current[Math.floor(this.height / 2) - 3] = this.centerHor(title, undefined, undefined)
    this.current[Math.floor(this.height / 2) - 2] = this.fill(desc, this.width, undefined)
    this.mode = 2
    this.index = Math.floor(this.height / 2)
    this.current[this.index] = {
      text: this.fill('', this.width, undefined),
      BGcheck: () => true,
      BG: '\x1b[40m',
      textstyle: '\x1b[37m',
    }
    this.update()
  }
  checkList(title: string, options: any, callbacks: any) {
    this.prepare(undefined)
    this.stdin.resume()
    this.mode = 1
    const a: any[] = []
    options.forEach((option: any, i: number) => {
      a[i] = {
        id: i,
        opt: option.option ? option.option : option,
        text: false,
        index: false,
        selected: option.selected ? option.selected : false,
        select: option.select ? option.select : (a: any, b: any) => {},
        selection: option.selection ? option.selection : (a: any, b: any) => {},
        description: option.description ? option.description : false,
        onSelection: (self: any) => {
          a[i].select(this, self)
          if (!a[i].description) return (self.current[self.index + self.options.length + 4] = false)
          self.current[self.index + self.options.length + 4] = self.fill(a[i].description, self.width)
        },
        onSelect: (self: any) => {
          a[i].selection(this, self)
          if (a[i].selected) {
            a[i].selected = false
            a[i].text = self.fill('[ ] ' + a[i].opt, self.width)
            self.current[this.index].text = a[i].text
          } else {
            a[i].selected = true
            a[i].text = self.fill('[X] ' + a[i].opt, self.width)
            self.current[this.index].text = a[i].text
          }
        },
      }
    })

    this.current[Math.floor(this.height / 2) - options.length - 2] = this.centerHor(title, undefined, undefined)
    let x = Math.floor(this.height / 2) - options.length
    this.index = x

    this.options = a
    this.options.forEach((option, id) => {
      option.text = option.selected
        ? this.fill('[X] ' + option.opt, this.width, undefined)
        : this.fill('[ ] ' + option.opt, this.width, undefined)
      option.index = x
      this.current[x] = {
        text: option.text,
        id: option.id,
        BGcheck: (self: any) => {
          if (self.option === this.current[x].id) return true
          else return false
        },
        BG: this.selectsyle,
      }
      x++
    })
    this.current[x + 1] = {
      text: this.fill('[Done]', this.width, undefined),
      id: this.options.length,
      BGcheck: (self: any) => {
        if (self.option === this.current[x + 1].id) return true
        else return false
      },
      BG: this.selectsyle,
    }
    this.update()
    this.callbacks = callbacks
  }

  list(title: string, optionss: any, callbacks: any) {
    this.prepare(undefined)
    this.stdin.resume()
    const options: any[] = []
    optionss.forEach((option: any, i: number) => {
      options[i] = {
        id: i,
        opt: option.option ? option.option : option,
        text: false,
        select: option.select ? option.select : (a: any, b: any) => {},
        description: option.description ? option.description : false,
        onSelection: (self: any) => {
          options[i].select(this, self)
          if (!options[i].description) return (self.current[self.index + self.options.length + 3] = false)
          self.current[self.index + self.options.length + 3] = self.fill(options[i].description, self.width)
        },
      }
    })
    this.current[Math.floor(this.height / 2) - options.length - 2] = this.centerHor(title, undefined, undefined)
    let x = Math.floor(this.height / 2) - options.length - 2
    this.options = options

    if (callbacks) this.callbacks = callbacks
    this.mode = 0
    x += 2
    this.index = x
    options.forEach((option, id) => {
      x++
      option.text = this.fill(option.opt, this.width, undefined)
      option.BGcheck = (self: any) => {
        if (self.option === id) return true
        else return false
      }
      option.BG = this.selectsyle
      this.current[x] = option
    })
    this.update()
  }
}
