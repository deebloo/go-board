const script = document.querySelector<HTMLScriptElement>(
  "script[data-asset-path]"
);

export class Sfx {
  #stones = new Audio();
  #effects = new Audio();

  constructor() {
    this.#stones.volume = 0.1;
    this.#effects.volume = 0.1;

    if (script) {
      if (script.dataset.assetPath) {
        this.#stones.src = `${script.dataset.assetPath}/stones.webm`;
        this.#effects.src = `${script.dataset.assetPath}/effects.webm`;
      }
    }
  }

  placeStone() {
    let sounds = [
      [1000.0, 137.20833333333331],
      [2137.208333333333, 58.854166666666664],
      [3196.0625, 86.60416666666666],
      [4282.666666666667, 85.0],
      [5367.666666666667, 86.8125],
    ];

    const [start, duration] = sounds[Math.floor(Math.random() * sounds.length)];

    return new Promise<void>((resolve) => {
      this.#stones.currentTime = start / 1000;
      this.#stones.play();

      setTimeout(() => {
        this.#stones.pause();

        resolve();
      }, duration);
    });
  }

  captureStones(count: number) {
    const single = [
      [2507.1041666666665, 1074.6458333333333],
      [6200.895833333333, 1485.9166666666667],
      [10539.125, 1034.9375],
      [14253.833333333332, 895.8541666666666],
    ];

    const pile = [
      [1000.0, 507.1041666666667],
      [4581.75, 619.1458333333333],
      [8686.8125, 852.3125],
      [12574.0625, 679.7708333333334],
      [16149.687499999998, 1148.8125],
      [18298.5, 1145.3333333333333],
    ];

    return new Promise<void>((resolve) => {
      let start: number;
      let duration: number;

      if (count === 1) {
        const sprite = single[Math.floor(Math.random() * single.length)];

        start = sprite[0];
        duration = sprite[1];
      } else {
        const sprite = pile[Math.floor(Math.random() * pile.length)];

        start = sprite[0];
        duration = sprite[1];
      }

      this.#effects.currentTime = start / 1000;
      this.#effects.play();

      setTimeout(() => {
        this.#effects.pause();

        resolve();
      }, duration);
    });
  }
}
