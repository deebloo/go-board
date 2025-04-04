# go-board

Go Board WebComponent. The entire library weights less than 5kb gzip and less than 4k brotli which makes it performant to embed into existing web pages.

[Demo](https://deebloo.github.io/go-board/?ogsid=73076486)

## All you need to get started is some markup and a script tag

```html
<script src="https://cdn.jsdelivr.net/npm/go-board@latest/public/go-board.min.js"></script>

<go-board coords>
  <go-sfx src="https://cdn.jsdelivr.net/npm/go-board@latest/public/sfx"></go-sfx>

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

The go-board element can display a game from a sgf file. You can display a game from [OGS](https://online-go.com).

```html
<go-board coords>
  <go-source src="https://online-go.com/api/v1/games/53010116/sgf"></go-source>
</go-board>
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

Stones and spaces can be decorated with markers. The `go-marker` element can be passed as a child to `go-stone` and you can add any icon or html entity that you like.

```html
<go-board>
  <go-stone slot="Q4" color="black">
    <go-marker>&check;</go-marker>
  </go-stone>
</go-board>
```

## Attributes

| Item              | description                                                          |
| ----------------- | -------------------------------------------------------------------- |
| coords            | determines if the column and row lables are displayed                |
| readonly          | disables manually placing stones                                     |
| disablelastmarker | disable marking the last stone placed. Useful for documenting shapes |
| novalidate        | disables all stone placement logic                                   |

## Development

Start in dev mode

```sh
npm start --watch
```

Run tests

```sh
npm test
```

Prepare prod demo

```sh
npm run build
```
