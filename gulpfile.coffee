gulp = require('gulp')
clean = require("gulp-clean")
coffee = require('gulp-coffee')
gutil = require('gulp-util')


COFFEE_DIR = "src/coffeescript"
JS_DIR = "src/js"
CSS_DIR = "src/css"
BUILD_DIR = "dist"

#
# Helper task - Cleans everything in build dir
#
gulp.task "clean", ->
  gulp.src(BUILD_DIR, {read: false})
    .pipe clean()

#
# Compile coffescript
#
gulp.task "coffee", [], ->
	gulp.src(COFFEE_DIR + "/**/*.coffee")
		.pipe coffee({bare: true}).on('error', gutil.log)
		.pipe gulp.dest(JS_DIR)

#
# Build task
#
gulp.task "build", ["clean", "coffee"], ->
	gulp.src(JS_DIR + "/**/*.js")
		.pipe gulp.dest(BUILD_DIR)
  gulp.src(CSS_DIR + "/**/*.css")
    .pipe gulp.dest(BUILD_DIR)


#
# Watch task
#
gulp.task "watch", ->
	gulp.watch "**/*.coffee", ["coffee"]
