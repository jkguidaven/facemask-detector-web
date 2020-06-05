import 'babel-polyfill';

const FPS = 30;

class App {
  private facesDetected: any;
  private eyesDetected: any;
  private sourceMatrix: any;
  private destinationMatrix: any;
  private grayMatrix: any;
  private capturer: any;
  private faceClassifier: any;
  private eyeCLassifier: any;
  private hasMask: boolean;

  constructor(
    private cv: any,
    videoStreamSource: HTMLVideoElement,
    private outputCanvas: string) {
    // define our matrixes for source, dest & gray
    this.sourceMatrix = new cv.Mat(
      videoStreamSource.height,
      videoStreamSource.width,
      this.cv.CV_8UC4
    );

    this.destinationMatrix = new cv.Mat(
      videoStreamSource.height,
      videoStreamSource.width,
      this.cv.CV_8UC4
    );

    this.grayMatrix = new cv.Mat();

    // Set video element as our capturing video source stream
    this.capturer = new cv.VideoCapture(videoStreamSource);

    // let as set our classifier for detecting faces
    this.faceClassifier = new cv.CascadeClassifier();
    this.faceClassifier.load('face.xml');

    // let as set our classifier for detecting faces
    this.eyeCLassifier = new cv.CascadeClassifier();
    this.eyeCLassifier.load('eye.xml');

    // Initialize our vectors for representing captured faces
    this.facesDetected = new cv.RectVector();
    this.eyesDetected = new cv.RectVector();
  }

  capture(utils: any) {
    try {
      let begin = Date.now();

      // Begin reading video stream and extract it to source and destination matrix
      this.capturer.read(this.sourceMatrix);
      this.sourceMatrix.copyTo(this.destinationMatrix);

      // Create grayscaled image for easier processing and extract it to gray matrix
      this.cv.cvtColor(
        this.destinationMatrix,
        this.grayMatrix,
        this.cv.COLOR_RGBA2GRAY,
        0);

      console.log('detect face');
      // let our classifier detect faces from our grayed image
      this.faceClassifier.detectMultiScale(
        this.grayMatrix,
        this.facesDetected,
        1.1,
        3,
        0);

      console.log('detect eyes');
      // let our classifier detect eyes from our grayed image
      this.eyeCLassifier.detectMultiScale(
        this.grayMatrix,
        this.eyesDetected,
        1.1,
        3,
        0);

      console.log("face found?" + this.facesDetected.size());
      console.log("eyes found?" + this.eyesDetected.size());

      for (let i = 0; i < this.eyesDetected.size(); ++i) {
        let eye = this.eyesDetected.get(i);
        let point1 = new this.cv.Point(eye.x, eye.y);
        let point2 = new this.cv.Point(eye.x + eye.width, eye.y + eye.height);
        this.cv.rectangle(
          this.destinationMatrix,
          point1,
          point2,
          [255, 0, 0, 255]);
      }

      this.cv.imshow(this.outputCanvas, this.destinationMatrix);

      const canvas: HTMLCanvasElement = document.querySelector(`#${this.outputCanvas}`);
      const context: CanvasRenderingContext2D = canvas.getContext('2d');

      if (this.eyesDetected.size() > 0) {
        this.hasMask = this.facesDetected.size() === 0;
        context.font = "Roboto 36px";
        context.strokeStyle = "red";
      }

      context.strokeStyle = this.hasMask ? "blue" : "red";
      context.strokeText(
        this.hasMask
          ? 'Has face mask' : 'no face mask', 20, 20);

      let delay = 1000 / FPS - (Date.now() - begin);
      setTimeout(() => this.capture(utils), delay);
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = function (cv: any, utils: any) {
  const app = new App(cv,
    document.querySelector("#source"),
    'output');
  app.capture(utils);
}
