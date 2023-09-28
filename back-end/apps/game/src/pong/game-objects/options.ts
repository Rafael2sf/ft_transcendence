export class PongOpts {
  maxScore = 2;
  width = 1080;
  height = 600;
  paddle = {
    width: 20,
    height: 120,
    speed: 600,
  };
  ball = {
    radius: 10,
    speed: 320,
  };

  constructor(opts?: Partial<PongOpts>) {
    Object.assign(this, opts);
  }
}
