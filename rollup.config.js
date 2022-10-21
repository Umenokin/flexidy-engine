import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import copy from 'rollup-plugin-copy'

function bundle(config) {
  return {
    ...config,
    input: 'src/index.ts',
    external: id => !/^[./]/.test(id),
  };
}

export default [
  bundle({
    plugins: [
      esbuild(),
      copy({
        targets: [{ src: './package.template.json', dest: 'dist', rename: 'package.json' }]
      })
    ],
    preserveModules: true,
    output: {
      dir: "dist",
      format: 'es',
      sourcemap: true,
    },
  }),
  bundle({
    preserveModules: true,
    plugins: [dts()],
    output: {
      dir: "dist",
      format: 'es',
    },
  })
]

