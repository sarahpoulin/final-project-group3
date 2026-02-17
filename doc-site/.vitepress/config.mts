import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Final Project Docs',
  description: 'Documentation for Final Project Group 3',
  
  // Use '/' for local serving with Live Server (open index.html directly from dist folder)
  base: '/',
  
  srcDir: '.',
  outDir: '.vitepress/dist',
  
  // Use .html extensions for static file serving (Live Server)
  cleanUrls: false,

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guides', link: '/setup-dev-environment.html' },
      { text: 'Project', link: '/requirements.html' },
      { text: 'Frontend Docs', link: '/frontend-docs.html' },
      { text: 'Backend Docs', link: '/api-docs.html' }
    ],
    
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Setup Dev Environment', link: '/setup-dev-environment.html' },
          { text: 'Managing Dev Environment', link: '/managing-dev-environment.html' },
          { text: 'Git Workflow', link: '/git-workflow.html' },
          { text: 'GitHub Notifications', link: '/setup-github-notifications.html' }
        ]
      },
      {
        text: 'Development & Testing',
        items: [
          { text: 'Testing Strategy', link: '/testing-strategy.html' },
          { text: 'Testing', link: '/testing.html' },
          { text: 'TypeDoc Guide', link: '/typedoc-guide.html' }
        ]
      },
      {
        text: 'Project Documentation',
        items: [
          { text: 'Requirements', link: '/requirements.html' },
          { text: 'Architecture', link: '/architechture.html' },
          { text: 'Deployment', link: '/deployment.html' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Frontend', link: '/frontend-docs.html' },
          { text: 'Backend', link: '/api-docs.html' }
        ]
      }
    ],
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/NSCC-ITC-Winter2026-WEBD5020-701-MCr/final-project-group3' }
    ]
  }
})
