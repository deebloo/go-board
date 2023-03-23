# go-board

Go Board WebComponent. Stones indicate the order of moved played. The board component will make sure the correct game state is reflected on the board itself. 

## All you need to get started is some markup and a script tag

[Demo](https://go-viewer.web.app/)


[StackBlitz](https://stackblitz.com/edit/go-board-demo?file=index.html)

```HTML

<script
  src="https://cdn.jsdelivr.net/npm/go-board@2.0.7/target/bundle/go-board.min.js"
></script>

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
