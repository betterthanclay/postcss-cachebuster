import gulp from 'gulp';
import mocha from 'gulp-mocha';

var files = ['index.js', 'test/*.js', 'gulpfile.js'];

gulp.task('test', async function () {
    return gulp.src('test/*.js', { read: false })
        .pipe(mocha());
});

gulp.task('default', gulp.series('test'));

gulp.task('watch', gulp.series('test'), function () {
    gulp.watch(files, ['test']);
});
