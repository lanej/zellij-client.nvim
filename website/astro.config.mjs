import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://lanej.io',
  base: '/zellij-client.nvim',
  trailingSlash: 'always',
  integrations: [starlight({
    title: 'zellij-client.nvim',
    description: 'Native Zellij actions and protobuf bindings for Neovim.',
    favicon: '/favicon.svg',
    social: [{ icon: 'github', label: 'Source on GitHub', href: 'https://github.com/lanej/zellij-client.nvim' }],
    editLink: { baseUrl: 'https://github.com/lanej/zellij-client.nvim/edit/main/website/' },
    customCss: ['./src/styles/custom.css'],
    expressiveCode: {
      plugins: [{
        name: 'keyboard-code',
        hooks: {
          postprocessRenderedBlockGroup: ({ renderData }) => {
            const focusCode = (node) => {
              if (node.type === 'element' && node.tagName === 'pre') node.properties.tabIndex = 0;
              for (const child of node.children ?? []) focusCode(child);
            };
            focusCode(renderData.groupAst);
          },
        },
      }],
    },
    sidebar: [
      { label: 'Overview', slug: 'index' },
      { label: 'Get started', slug: 'getting-started' },
      { label: 'Session discovery', slug: 'guides/session-discovery' },
      { label: 'Client API', slug: 'reference/client' },
      { label: 'Protobuf API', slug: 'reference/protobuf' },
      { label: 'Compatibility and development', slug: 'reference/compatibility' },
    ],
  })],
});
