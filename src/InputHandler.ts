export class InputHandler {
  constructor(private readonly main: any) {}

  escapeChar(a: any) {
    const allowed =
      '` 1 2 3 4 5 6 7 8 9 0 - = q w e r t y u i o p [ ] | a s d f g h j k l ; \' z x c v b n m , . / ~ ! @ # $ % ^ & * ( ) _ + Q W E R T Y U I O P { } A S D F G H J K L : \\ " Z X C V B N M < > ?'
    const allow = allowed.split(' ')
    if (a == ' ') return true
    if (allow.indexOf(a) == -1) return false
    return true
  }

  check(a: any) {
    if (a) this.main.stop()
  }

  dataRecieved(key: any) {
    switch (this.main.mode) {
      case 0:
        if (key == '\u001B\u005B\u0041') {
          if (this.main.option > 0) {
            this.main.option--
            if (this.main.options[this.main.option].onSelection)
              this.main.options[this.main.option].onSelection(this.main)
            this.main.update()
          }
        }
        if (key == '\u001B\u005B\u0042') {
          if (this.main.option < this.main.options.length - 1) {
            this.main.option++
            if (this.main.options[this.main.option].onSelection)
              this.main.options[this.main.option].onSelection(this.main)
            this.main.update()
          }
        }
        if (key == '\u000D') {
          if (typeof this.main.callbacks == 'object') {
            if (this.main.callbacks[this.main.option]) this.check(this.main.callbacks[this.main.option]())
          } else if (typeof this.main.callbacks == 'function') {
            this.check(this.main.callbacks(this.main.option))
          }
        }
        break
      case 1:
        if (key == '\u001B\u005B\u0041') {
          if (this.main.option > 0) {
            this.main.option--
            if (this.main.options[this.main.option] && this.main.options[this.main.option].onSelection)
              this.main.options[this.main.option].onSelection(this.main)
            this.main.update()
          }
        }
        if (key == '\u001B\u005B\u0042') {
          if (this.main.option < this.main.options.length) {
            this.main.option++
            if (this.main.options[this.main.option] && this.main.options[this.main.option].onSelection)
              this.main.options[this.main.option].onSelection(this.main)
            this.main.update()
          }
        }

        if (key == '\u000D') {
          if (this.main.option == this.main.options.length) {
            if (typeof this.main.callbacks == 'object') {
              this.main.options.forEach((option: any) => {
                if (!option.selected) return
                if (this.main.callbacks[option.id]) this.check(this.main.callbacks[option.id]())
              })
            } else if (typeof this.main.callbacks == 'function') {
              const r: any[] = []
              this.main.options.forEach((option: any) => {
                if (option.selected) r.push(option.id)
              })
              this.check(this.main.callbacks(r))
            }
          } else {
            this.main.options[this.main.option].onSelect(this.main)
            this.main.update()
          }
        }
        break
      case 2:
        if (key == '\u000D') {
          if (this.main.callbacks) this.check(this.main.callbacks(this.main.typed))
        } else if ((key == '\u007F' || key == '\u0008') && this.main.typed.length > 0) {
          this.main.typed = this.main.typed.substring(0, this.main.typed.length - 1)
          this.main.current[this.main.index].text = this.main.fill(this.main.typed, this.main.width)
          this.main.update()
        } else if (key && this.escapeChar(key)) {
          this.main.typed += key
          this.main.current[this.main.index].text = this.main.fill(this.main.typed, this.main.width)
          this.main.update()
        }

        break
      case 3:
        if (this.main.boxes[0]) {
          if (this.main.boxes[0].onKey(key) == 'reset') {
            this.main.mode = this.main.prev
            this.main.prev = false
          }
        }
        break
      case 5:
        if (!this.main.editor) return
        this.main.editor.onKey(key)

        break
      case 100:
        const toUnicode = (theString: string): string => {
          let unicodeString = ''
          for (let i = 0; i < theString.length; i++) {
            let theUnicode = theString
              .charCodeAt(i)
              .toString(16)
              .toUpperCase()
            while (theUnicode.length < 4) {
              theUnicode = '0' + theUnicode
            }
            theUnicode = '\\u' + theUnicode
            unicodeString += theUnicode
          }
          return unicodeString
        }
        console.log(toUnicode(key))
        break
      default:
        break
    }
  }
}
