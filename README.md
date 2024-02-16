# go-board

Go Board WebComponent. The entire library weights less than 5kb gzip and less than 4k brotli which makes it performant to embed into existing web pages. If you want to see exactly what the board is calculating you can enable debugging by adding the "debug" attribute to go-board. (`<go-board debug></go-board>`)

[Demo](https://go-viewer.web.app?coords&sfx)

[StackBlitz](https://stackblitz.com/edit/go-board-demo?file=index.html)

## All you need to get started is some markup and a script tag

```HTML
<go-board coords sfx="https://cdn.jsdelivr.net/npm/go-board@latest/assets/sfx">
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

<script
  src="https://cdn.jsdelivr.net/npm/go-board@latest/bundle/go-board.min.js"
></script>
```

The go-board element can display a game from a sgf file. You can display a game from [OGS](https://online-go.com).

```html
<go-board
  coords
  src="https://online-go.com/api/v1/games/53010116/sgf"
></go-board>
```

`go-board` can also be used as a form element. It will submit the game key of the current board. This can can be parsed to set the board state manually.
Being form associated also means that you can send data to your own servers without writing any JavaScript.

```html
<form action="/save-game">
  <go-board name="game">
    <go-stone color="black" slot="R17"></go-stone>
    <go-stone color="white" slot="R18"></go-stone>
    <go-stone color="black" slot="Q18"></go-stone>
  </go-board>
</form>
```

## Attributes

| Item     | description                                                           |
| -------- | --------------------------------------------------------------------- |
| coords   | determines if the column and row lables are displayed                 |
| src      | path to a sgf file. sfg files describe the steps in a game of go      |
| debug    | enables debug out put. will highlight hitboxes and log out game logic |
| readonly | disables manually placing stones                                      |
| sfx      | enable sound effects. Point to a directory with sound files           |
