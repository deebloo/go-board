# go-board

Go Board WebComponent. Stones indicate the order of moved played. The board component will make sure the correct game state is reflected on the board itself. The entire library weights less then 5kb (gzipped) which makes it performant to embed into existing web pages.

[Demo](https://go-viewer.web.app/)

[StackBlitz](https://stackblitz.com/edit/go-board-demo?file=index.html)

## All you need to get started is some markup and a script tag

```HTML
<script src="https://cdn.jsdelivr.net/npm/go-board@2.1.1/target/bundle/go-board.min.js"></script>

<go-board>
  <go-stone color="black" space="R17"></go-stone>
  <go-stone color="white" space="R18"></go-stone>
  <go-stone color="black" space="Q18"></go-stone>
  <go-stone color="white" space="S18"></go-stone>
  <go-stone color="black" space="S17"></go-stone>
  <go-stone color="white" space="R19"></go-stone>
  <go-stone color="black" space="Q19"></go-stone>
  <go-stone color="white" space="T18"></go-stone>
  <go-stone color="black" space="T17"></go-stone>
  <go-stone color="white" space="Q16"></go-stone>
  <go-stone color="black" space="S19"></go-stone>
  <go-stone color="white" space="T19"></go-stone>
  <go-stone color="black" space="S19"></go-stone>
</go-board>
```

## Display a game from [OGS](https://online-go.com).

This library ships with an SGF viewer. If you pass in a game id from OGS it will play out automatically. There is also an imperative API if you want to pause and resume play/

```html
<sgf-viewer ogs-id="50728274">
  <go-board></go-board>
</sgf-viewer>
```
