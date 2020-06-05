const del = require("del");
const gulp = require("gulp");

const browserify = require("browserify");
const tsify = require("tsify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");

const outputDirectory = "dist";
const sourceDirectory = "src";

gulp.task("clean", function () {
  return del(`${outputDirectory}/**`, { force: true });
});

gulp.task("build:html", () => {
  return gulp
    .src([
      "index.html",
      `${sourceDirectory}/cascades/*`,
      "opencv.js",
      "utils.js",
    ])
    .pipe(gulp.dest(outputDirectory));
});
gulp.task("build:js", () => {
  return browserify({
    basedir: ".",
    debug: true,
    entries: ["src/main.ts"],
    standalone: "runApp",
    cache: {},
    packageCache: {},
  })
    .plugin(tsify)
    .transform("babelify", {
      presets: ["es2015"],
      extensions: [".ts"],
    })
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(outputDirectory));
});

gulp.task("build", gulp.series(["build:html", "build:js"]));

gulp.task("watch", function () {
  return gulp.watch(`${sourceDirectory}/**`, gulp.series(["build"]));
});
