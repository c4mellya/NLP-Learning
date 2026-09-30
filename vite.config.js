import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = import.meta.dirname
// JSON is published independently of the application. A missing issue must be 404.
function dailyFiles() {
  function middleware(req, res, next) {
    const pathname = req.url.split('?')[0]
    if (!/^\/ai-daily\/(?:index\.json|data\/\d{4}-\d{2}-\d{2}\.json)$/.test(pathname)) return next()
    const file = resolve(root, '.' + pathname)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    if (pathname.endsWith('index.json')) res.setHeader('Cache-Control','no-store')
    if (!existsSync(file)) { res.statusCode = 404; res.end('{"error":"not_found"}'); return }
    res.end(readFileSync(file))
  }
  return {
    name: 'runtime-daily-files',
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) },
    generateBundle() {
      for (const [folder, pattern] of [['ai-daily/brands', /\.svg$/], ['ai-daily/data', /^\d{4}-\d{2}-\d{2}\.json$/]]) {
        if (!existsSync(resolve(root, folder))) continue
        for (const file of readdirSync(resolve(root,folder)).filter(name => pattern.test(name))) {
          this.emitFile({type:'asset',fileName:folder+'/'+file,source:readFileSync(resolve(root,folder,file))})
        }
      }
      if (existsSync(resolve(root,'ai-daily/index.json'))) this.emitFile({type:'asset',fileName:'ai-daily/index.json',source:readFileSync(resolve(root,'ai-daily/index.json'))})
    },
  }
}
export default defineConfig({ plugins:[vue(), dailyFiles()] })
