const { src, dest, watch } = require("gulp");
const concat = require("gulp-concat");

const defaultTask = () => {
  return src("./src/**/*", { sourcemaps: true })
    .pipe(concat("bundle.js"))
    .pipe(dest("./_bundle/", { sourcemaps: '.' }))
};

exports.default = defaultTask;

watch(["./src/**/*"], defaultTask);
