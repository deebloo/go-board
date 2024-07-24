const stone_sounds = [
  [1000.0, 137.20833333333331],
  [2137.208333333333, 58.854166666666664],
  [3196.0625, 86.60416666666666],
  [4282.666666666667, 85.0],
  [5367.666666666667, 86.8125],
] as const;

const capture_stone_sounds = [
  [2507.1041666666665, 1074.6458333333333],
  [6200.895833333333, 1485.9166666666667],
  [10539.125, 1034.9375],
  [14253.833333333332, 895.8541666666666],
] as const;

const capture_pile_sounds = [
  [1000.0, 507.1041666666667],
  [4581.75, 619.1458333333333],
  [8686.8125, 852.3125],
  [12574.0625, 679.7708333333334],
  [16149.687499999998, 1148.8125],
  [18298.5, 1145.3333333333333],
] as const;

export class Sfx {
  #stones = new Audio();
  #effects = new Audio();

  constructor(path: string) {
    this.#stones.volume = 0.1;
    this.#stones.src = `${path}/stones.webm`;
    this.#stones.load();

    this.#effects.volume = 0.1;
    this.#effects.src = `${path}/effects.webm`;
    this.#effects.load();
  }

  async placeStone() {
    if (!navigator.userActivation.hasBeenActive && !navigator.userActivation.isActive) {
      return void 0;
    }

    const [start, duration] =
      stone_sounds[Math.floor(Math.random() * stone_sounds.length)];

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
    if (!navigator.userActivation.hasBeenActive && !navigator.userActivation.isActive) {
      return void 0;
    }

    return new Promise<void>((resolve) => {
      let start: number;
      let duration: number;

      if (count === 1) {
        const sprite =
          capture_stone_sounds[
            Math.floor(Math.random() * capture_stone_sounds.length)
          ];

        start = sprite[0];
        duration = sprite[1];
      } else {
        const sprite =
          capture_pile_sounds[
            Math.floor(Math.random() * capture_pile_sounds.length)
          ];

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
