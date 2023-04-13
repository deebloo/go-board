# go-board

Go Board WebComponent. Stones indicate the order of moved played. The board component will make sure the correct game state is reflected on the board itself. The entire library weights less than 5kb gzip and less than 4k brotli which makes it performant to embed into existing web pages. If you want to see exactly what the board is calculating you can enable debugging by adding the "debug" attribute to go-board. (`<go-board debug></go-board>`)

[Demo](https://go-viewer.web.app?coords)

[StackBlitz](https://stackblitz.com/edit/go-board-demo?file=index.html)

## All you need to get started is some markup and a script tag

```HTML
<script src="https://cdn.jsdelivr.net/npm/go-board@2.1.1/target/bundle/go-board.min.js"></script>

<go-board coords>
  <go-stone color="black" slot="R17"></go-stone>
  <go-stone color="white" slot="R18"></go-stone>
  <go-stone color="black" slot="Q18"></go-stone>
  <go-stone color="white" slot="S18"></go-stone>
  <go-stone color="black" slot="S17"></go-stone>
  <go-stone color="white" slot="R19"></go-stone>
  <go-stone color="black" slot="Q19"></go-stone>
  <go-stone color="white" slot="T18"></go-stone>
  <go-stone color="black" slot="T17"></go-stone>
  <go-stone color="white" slot="Q16"></go-stone>
  <go-stone color="black" slot="S19"></go-stone>
  <go-stone color="white" slot="T19"></go-stone>
  <go-stone color="black" slot="S19"></go-stone>
</go-board>
```

## Display a game from [OGS](https://online-go.com).

This library ships with an SGF viewer. If you pass in a game id from OGS it will play out automatically. There is also an imperative API if you want to pause and resume play/

```html
<sgf-viewer ogsid="50728274">
  <go-board></go-board>
</sgf-viewer>
```
