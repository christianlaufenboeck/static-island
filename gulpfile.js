const { src, dest, watch, series, parallel } = require("gulp")
const browserSync = require("browser-sync").create()
const sourcemaps = require("gulp-sourcemaps")
const sass = require("gulp-sass")
const postcss = require("gulp-postcss")
const autoprefixer = require("autoprefixer")
const cssnano = require("cssnano")
const webpack = require("webpack-stream")

const files = { 
  htmlInput: "src/*.html",
  cssInput: "src/assets/css/*.scss",
  jsInput: "src/assets/js/*.js",
  staticInput: "src/assets/static/*"
}

function htmlTask() {
  return src(files.htmlInput)
    .pipe(dest("dist"))
    .pipe(browserSync.stream())
}

function staticAssets() {
  return src(files.staticInput)
  .pipe(dest("dist/assets/static"))
}

function scssTask() {    
  return src(files.cssInput)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([ autoprefixer(), cssnano() ]))
    .pipe(sourcemaps.write())
    .pipe(dest("dist/assets/css")
  )
}

function jsTask() {
  return src([
      files.jsInput
    ])
    .pipe(
      webpack({
        mode: "production",
        devtool: "source-map",
        output: {
          filename: "app.js"
        }
      })
    )
    .pipe(dest("dist/assets/js")
  )
}

function watchTask() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  })
  watch([files.htmlInput, files.cssInput, files.jsInput, files.staticInput],
    series(
      parallel(htmlTask, scssTask, jsTask, staticAssets),
    )
  )
}

exports.default = series(
  parallel(htmlTask, scssTask, jsTask, staticAssets), 
  watchTask
)