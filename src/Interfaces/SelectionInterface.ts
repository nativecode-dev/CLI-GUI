export function SelectionInterface(text: string, id: number, others: any, main: any): any {
  const a: any = {
    text: text,
    id: id,
    BGcheck: (self: any) => {
      if (id === self.option) {
        return true
      } else {
        return false
      }
    },
    BG: '\x1b[40m\x1b[37m',
  }

  for (let i in others) {
    a[i] = others[i]
  }

  return a
}
