import { component, State, handle, JoistElement, get } from '@joist/component';
import { template, html } from '@joist/component/lit-html';

@component<number>({
  tagName: 'app-root',
  state: 0,
  shadowDom: 'open',
  styles: [
    `* {
      font-size: 200%;
    }

    span {
      width: 4rem;
      display: inline-block;
      text-align: center;
    }

    button {
      width: 4rem;
      height: 4rem;
      border: none;
      border-radius: 10px;
      background-color: seagreen;
      color: white;
    }`,
  ],
  render: template(({ state, run }) => {
    return html`
      <button @click="${run('dec')}">-</button>
      <span>${state}</span>
      <button @click="${run('inc')}">+</button>
    `;
  }),
})
export class AppElement extends JoistElement {
  @get(State)
  public state!: State<number>;

  @handle('dec') decrement() {
    return this.state.setValue(this.state.value - 1);
  }

  @handle('inc') increment() {
    return this.state.setValue(this.state.value + 1);
  }
}
