---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "nest-admin"
  tagline: 让开发、部署、运维一步到位
  actions:
    - theme: brand
      text: 快速开始
      link: /QUICK_START
    - theme: alt
      text: GitHub Actions 部署
      link: /GITHUB_ACTIONS

features:
  - title: 快速上手
    details: 从克隆仓库、安装依赖到运行 admin-vue3 与 Nest Server 的完整指南。
    link: /QUICK_START
  - title: GitHub Actions 自动部署
    details: 配置 GitHub Secrets,推送代码自动部署到服务器,支持 PM2 管理。
    link: /GITHUB_ACTIONS
  - title: 配置指南
    details: 遇到 "missing server host" 错误?查看 GitHub Secrets 详细配置指南。
    link: /GITHUB_SECRETS_SETUP
  - title: 数据库 & Prisma
    details: 使用 `npm run prisma:migrate && npm run prisma:seed` 初始化演示数据。
    link: /deploy-online/mysql
  - title: 本地部署
    details: 使用脚本快速部署到本地或远程服务器,支持前后端分离部署。
    link: /LOCAL_DEPLOYMENT
  - title: 在线部署
    details: 完整的线上部署方案,包括 Nginx、PM2、MySQL、Redis 配置。
    link: /DEPLOYMENT
---

