module.exports = function(text,id,others,main) {
var a = {
text: text,
id:id,
BGcheck: function(self) {
if (this.id == self.option) return true; else return false;

},
BG: main.selectsyle,
}

for (var i in others) {
a[i] = others[i]
}
return a;

}
