const gulp = require('gulp');
const sass = require('gulp-sass');
const jshint = require('gulp-jshint');
const cache = require('gulp-cache');
const bower = require('gulp-bower');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();
const Server = require('karma').Server;

gulp.task('lint', () => {
  return gulp.src(['public/js/**/*.js', 'test/**/*.js', 'app/**/*.js'] )
    .pipe(jshint())
    .pipe(jshint.reporter('fail'));
});

gulp.task('sass', () => {
  gulp.src('public/scss/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('./public/css'));
});

gulp.task('bower', () => {
  return bower()
    .pipe(gulp.dest('public/lib'))
});

gulp.task('start', ['bower'], () => {
  return nodemon({
    script: 'server.js',
     ext: 'js html',
     env: { 'PORT': 3000 }
  })
})

// Run test once and exit
gulp.task('test', (done) => {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('default', [ 'bower', 'lint', 'test', 'browser-sync']);

// Watch for changes in files
gulp.task('watch', () => {

  // Watch .scss files
 gulp.watch('public/scss/*.scss', ['sass', browserSync.reload]);
 gulp.watch('public/js/**/*.js', [ browserSync.reload]);
 gulp.watch('app/views/**/*.jade', [ browserSync.reload]);
 gulp.watch('public/scss/*.scss', ['sass', browserSync.reload]);

});

gulp.task('browser-sync', ['sass', 'start', 'watch'], function() {
  browserSync.init({
      proxy: "http://localhost:3000",
      port: 5000,
      open: false
  });
});
