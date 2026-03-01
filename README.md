# ORCHA – Fermented Drinks & Bio-Fertilizer Website

ORCHA is a bilingual (VI/EN) marketing website built with React + TypeScript + Vite. It showcases fermented fruit drinks, bio-fertilizer products, and ORCHA’s circular production process with modern UI, responsive layouts, and product detail pages.

## ✨ Highlights

- Home page with Hero, About, Product Gallery, and Blog sections
- Product catalog with details for fermented drinks and bio-fertilizers
- i18n support (Vietnamese/English)
- Responsive design across mobile and desktop
- HashRouter for static hosting (GitHub Pages friendly)

## 🧱 Tech Stack

- React 18 + TypeScript
- Vite
- CSS Modules
- React Router (HashRouter)

## 📦 Project Structure

```
src/
  components/
    AboutSection/
    BlogSection/
    Footer/
    Header/
    Hero/
    ProductGallery/
    ...
  contexts/
    LanguageContext.tsx
  layouts/
    MainLayout.tsx
  pages/
    AboutBuchaohPage/
    Blog/
    Contact/
    FAQ/
    ProductDetail/
    ProductList/
  styles/
    globals.css
```

## 🚀 Getting Started

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

Vite will print the local URL in the terminal.

### Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## 🌍 Internationalization (VI/EN)

Translations are defined in:

- `src/contexts/LanguageContext.tsx`

Use the `useLanguage()` hook and `t(key)` to render localized text.

## 🧩 Notes

- Routing uses `HashRouter` for easy static hosting.
- All UI sections are built with CSS Modules for scoped styling.

## 📄 License

All rights reserved by ORCHA.
