gulp = require('gulp')
clean = require("gulp-clean")
coffee = require('gulp-coffee')
gutil = require('gulp-util')


SRC_DIR = "src"
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
  gulp.src(SRC_DIR + "/**/*.coffee")
  .pipe coffee({bare: true}).on('error', gutil.log)
  .pipe gulp.dest(BUILD_DIR)

#
# Build task
#
gulp.task "build", ["clean"], ->
  gulp.start('coffee')
  gulp.src([SRC_DIR + "/**/*.css", SRC_DIR + "/**/*.html"])
  .pipe gulp.dest(BUILD_DIR)


#
# Watch task
#
gulp.task "watch", ["build"], ->
  gulp.watch "src/**/*.*", ["build"]
