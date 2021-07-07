import copy from '@guanghechen/rollup-plugin-copy';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { spawn } from 'child_process';
import clear from 'rollup-plugin-clear';
import css from 'rollup-plugin-css-only';
import livereload from 'rollup-plugin-livereload';
import svelte from 'rollup-plugin-svelte';

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'dist/bundle.js'
  },
  plugins: [
    clear({
      targets: ['dist'],
      watch: true
    }),

    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production
      }
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: 'bundle.css' }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),

    copy({
      targets: [
        { src: 'public/favicon.png', dest: 'dist' },
        { src: 'public/global.css', dest: 'dist' },
        { src: 'public/index.html', dest: 'dist' },
        { src: 'node_modules/leaflet/dist/leaflet.css', dest: 'dist' },
        { src: 'node_modules/leaflet/dist/images/layers-2x.png', dest: 'dist/images' },
        { src: 'node_modules/leaflet/dist/images/layers.png', dest: 'dist/images' },
        { src: 'node_modules/leaflet/dist/images/marker-icon-2x.png', dest: 'dist/images' },
        { src: 'node_modules/leaflet/dist/images/marker-icon.png', dest: 'dist/images' },
        { src: 'node_modules/leaflet/dist/images/marker-shadow.png', dest: 'dist/images' }
      ]
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload('dist'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()

    // production && zipPlugin({
    //   dir: 'dist',
    // }),
  ],
  watch: {
    clearScreen: false
  }
};
