import { SelectionInterface } from './SelectionInterface'

export class Box {
  private option: number = 0

  constructor(
    private readonly width: number,
    private readonly height: number,
    private readonly top: number,
    private readonly start: number,
    private options: any,
    private readonly index: number,
    private readonly main: any,
    private readonly callback: any,
  ) {
    if (!this.options) this.genOpt()
  }

  generateOpt(opt: any) {
    const a = this.top + this.height
    let o: any[] = []
    let k: any[] = []
    let id = 0
    opt.forEach((optt: any) => {
      o.push({
        opt: optt.opt,
        onSelect: optt.onSelect,
      })

      k.push(
        SelectionInterface(
          ' ',
          id,
          {
            start: this.start,
            opt: optt.opt,
            width: this.width,
          },
          this.main,
        ),
      )
      id++
    })
    this.main.layers[this.index][a] = {
      len: this.width,
      width: this.width,
      defaultBG: '\x1b[0m\x1b[47m\x1b[30m',
      start: this.start,
      selectonly: true,
      options: k,
    }
    this.options = []
    this.options = o
  }

  onKey(key: any) {
    if (key === '\u001B\u005B\u0041') {
      if (this.option > 0) {
        this.option--
        this.main.update()
      }
    }
    if (key === '\u001B\u005B\u0042') {
      if (this.option < this.options.length - 1) {
        this.option++
        this.main.update()
      }
    }
    if (key === '\u000D') {
      this.runOpt(this.option)
    }
  }

  runOpt(opt: any) {
    if (!this.options[opt] || !this.options[opt].onSelect) return
    const b = this.options[opt].onSelect(this)
    if (b === 'remove') return this.remove()
  }

  remove() {
    this.main.removeBox(this.index)
    if (this.callback) this.callback()
  }

  genOpt() {
    const a = this.top + this.height
    this.main.layers[this.index][a] = {
      len: this.width,
      width: this.width,
      defaultBG: '\x1b[0m\x1b[47m\x1b[30m',
      start: this.start,
      selectonly: true,
      options: [
        SelectionInterface(
          this.main.centerHor('[Close]', this.width),
          0,
          {
            start: this.start,

            opt: '[Close]',
            width: this.width,
          },
          this.main,
        ),
      ],
    }
    this.options = []
    this.options[0] = {
      text: this.main.centerHor('[Close]', this.width),
      opt: '[Close]',
      onSelect: () => {
        return 'remove'
      },
    }
  }
}
