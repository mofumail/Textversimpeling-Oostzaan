import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    port: 3000,
    https: {},
    proxy: {
      '/lm-studio': {
        target: 'http://127.0.0.1:1234/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lm-studio/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Attempt to peek at body if already parsed or sniffable
            if ((req as any).body && Object.keys((req as any).body).length > 0) {
              console.log('Request Body:', JSON.stringify((req as any).body, null, 2));
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            let body: any[] = [];
            proxyRes.on('data', function (chunk) {
              body.push(chunk);
            });
            proxyRes.on('end', function () {
              const bodyStr = Buffer.concat(body).toString();
              try {
                const json = JSON.parse(bodyStr);
                const content = json.choices?.[0]?.message?.content;
                if (content) {
                  console.log("LM Studio Content:", json.choices);
                  // console.log('\x1b[36m%s\x1b[0m', 'LM Studio Content:');
                  console.log("------")
                  console.log(content);
                }
              } catch (e) {
                // ignore
              }
            });
          });
        },
      },
    },
  },
});
