import {
  JoistElement,
  component,
  property,
  get,
  State,
  handle,
  PropChange,
} from '@joist/component';
import { template, html } from '@joist/component/lit-html';

export const enum BoardSpace {
  Empty = 'EMPTY',
  Black = 'BLACK',
  White = 'WHITE',
}

export interface GoBoardState {
  board: BoardSpace[][];
  currentPlayer: BoardSpace.Black | BoardSpace.White;
}

function determineRowClass(i: number, rowCount: number): string {
  if (i === 0) {
    return 'row first-row';
  } else if (i === rowCount) {
    return 'row last-row';
  }

  return 'row';
}

function determineSpaceClass(space: BoardSpace): string {
  switch (space) {
    case BoardSpace.Empty:
      return 'space empty';

    case BoardSpace.Black:
      return 'space black';

    case BoardSpace.White:
      return 'space white';
  }
}

@component<GoBoardState>({
  tagName: 'go-board',
  shadowDom: 'open',
  state: {
    board: [],
    currentPlayer: BoardSpace.Black,
  },
  styles: [
    `:host {
      background: #dbb06b;
      display: inline-block;
      padding: .5rem;
    }

    .row {
      display: flex;
    }

    .row.first-row .space::before {
      top: 50%;
    }

    .row.last-row .space::before {
      bottom: 50%;
    }

    .space {
      position: relative;
      height: 40px;
      width: 40px;
    }

    .space::before {
      background: #000;
      content: '';
      display: block;
      height: 100%;
      width: 1px;
      position: absolute;
      left: 50%;
      margin-left: -1px;
    }

    .space::after {
      background: #000;
      content: '';
      display: block;
      height: 1px;
      width: 100%;
      position: absolute;
      top: 50%;
      margin-top: -1px;
    }

    .space:first-child::after {
      left: 50%;
    }

    .space:last-child::after {
      right: 50%;
    }

    .space .piece {
      background: none;
      border: none;
      position: absolute;
      height: 90%;
      width: 90%;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
      outline: none;
    }

    .current-player-black .space.empty .piece:hover {
      background: #000;
      opacity: .4;
    }

    .current-player-white .space.empty .piece:hover {
      background: #fff;
      opacity: .4;
    }

    .space.empty .piece {
      cursor: pointer;
    }

    .space.white .piece,
    .space.black .piece {
      box-shadow: 0px 0px 5px rgba(0, 0, 0, .4);
      opacity: 1;
    }

    .space.white .piece {
      background: #fff;
    }

    .space.black .piece {
      background: #000;
    }`,
  ],
  render: template(({ state: { board, currentPlayer }, run }) => {
    return html`
      <div class="current-player-${currentPlayer.toLowerCase()}">
        ${board.map((rows, row) => {
          return html`
            <div class="${determineRowClass(row, rows.length - 1)}">
              ${rows.map((space, col) => {
                return html`
                  <div class=${determineSpaceClass(space)}>
                    <button
                      class="piece"
                      @click=${run('space_clicked', [row, col])}
                    ></button>
                  </div>
                `;
              })}
            </div>
          `;
        })}
      </div>
    `;
  }),
})
export class GoBoard extends JoistElement {
  @get(State)
  private state!: State<GoBoardState>;

  @property()
  public rows: number = 13;

  @property()
  public cols: number = 13;

  @property()
  public currentPlayer: BoardSpace.Black | BoardSpace.White = BoardSpace.Black;

  onPropChanges(changes: PropChange[]) {
    const keys = changes.map((c) => c.key);

    if (keys.includes('rows') || keys.includes('cols')) {
      this.state.patchValue({ board: this.setupBoard() });
    }

    if (keys.includes('currentPlayer')) {
      this.state.patchValue({ currentPlayer: this.currentPlayer });
    }
  }

  @handle('space_clicked')
  async updateSpace(_: Event, coords: [number, number]) {
    const { currentPlayer } = this.state.value;

    await this.makeMove(currentPlayer, coords);

    this.currentPlayer = this.decideCurrentPlayer(currentPlayer);
  }

  makeMove(
    player: BoardSpace.Black | BoardSpace.White,
    [row, col]: [number, number]
  ) {
    const { board } = this.state.value;

    board[row][col] = player;

    return this.state.patchValue({ board });
  }

  private decideCurrentPlayer(
    currentPlayer: BoardSpace.Black | BoardSpace.White
  ) {
    return currentPlayer === BoardSpace.Black
      ? BoardSpace.White
      : BoardSpace.Black;
  }

  private setupBoard() {
    return new Array(this.rows).fill(null).map(() => {
      return new Array(this.cols).fill(BoardSpace.Empty);
    });
  }
}
