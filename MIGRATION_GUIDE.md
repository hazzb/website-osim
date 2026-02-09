# CSS Module to Tailwind - Migration Guide

## Common Pattern Conversions

### Layout & Spacing

| CSS Module                | Tailwind Equivalent |
| ------------------------- | ------------------- |
| `display: flex`           | `flex`              |
| `display: grid`           | `grid`              |
| `flex-direction: column`  | `flex-col`          |
| `justify-content: center` | `justify-center`    |
| `align-items: center`     | `items-center`      |
| `gap: 1rem`               | `gap-4`             |
| `padding: 1rem`           | `p-4`               |
| `margin: 0 auto`          | `mx-auto`           |
| `max-width: 1200px`       | `max-w-6xl`         |

### Typography

| CSS Module           | Tailwind Equivalent |
| -------------------- | ------------------- |
| `font-size: 2rem`    | `text-3xl`          |
| `font-weight: 700`   | `font-bold`         |
| `font-weight: 800`   | `font-extrabold`    |
| `text-align: center` | `text-center`       |
| `line-height: 1.5`   | `leading-relaxed`   |
| `color: #64748b`     | `text-slate-500`    |

### Colors (dari config)

| CSS Variable       | Tailwind Class                    |
| ------------------ | --------------------------------- |
| `var(--primary)`   | `bg-primary` / `text-primary`     |
| `var(--secondary)` | `bg-secondary` / `text-secondary` |
| `var(--danger)`    | `bg-danger` / `text-danger`       |
| `var(--bg-card)`   | `bg-bg-card`                      |
| `var(--text-main)` | `text-text-main`                  |

### Borders & Shadows

| CSS Module                              | Tailwind Equivalent       |
| --------------------------------------- | ------------------------- |
| `border-radius: 8px`                    | `rounded-lg`              |
| `border-radius: 12px`                   | `rounded-xl`              |
| `border: 1px solid #e2e8f0`             | `border border-slate-200` |
| `box-shadow: 0 1px 3px rgba(0,0,0,0.1)` | `shadow-sm`               |
| `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` | `shadow-md`               |

### Transitions & Hover

| CSS Module                               | Tailwind Equivalent      |
| ---------------------------------------- | ------------------------ |
| `transition: all 0.2s`                   | `transition-all`         |
| `cursor: pointer`                        | `cursor-pointer`         |
| `:hover { color: blue }`                 | `hover:text-blue-500`    |
| `:hover { transform: translateY(-2px) }` | `hover:-translate-y-0.5` |

### Position & Z-Index

| CSS Module           | Tailwind Equivalent |
| -------------------- | ------------------- |
| `position: relative` | `relative`          |
| `position: absolute` | `absolute`          |
| `position: fixed`    | `fixed`             |
| `position: sticky`   | `sticky`            |
| `top: 0`             | `top-0`             |
| `z-index: 10`        | `z-10`              |
| `z-index: 1000`      | `z-[1000]`          |

### Backgrounds

| CSS Module                                | Tailwind Equivalent                            |
| ----------------------------------------- | ---------------------------------------------- |
| `background: white`                       | `bg-white`                                     |
| `background: linear-gradient(...)`        | `bg-gradient-to-r from-blue-500 to-purple-500` |
| `background-color: rgba(255,255,255,0.5)` | `bg-white/50`                                  |
| `backdrop-filter: blur(8px)`              | `backdrop-blur-md`                             |

---

## Step-by-Step Migration Process

### 1. Setup

```jsx
// Remove CSS Module import
- import styles from "./Component.module.css";
```

### 2. Container → Tailwind

```jsx
// Before
<div className={styles.container}>

// After
<div className="max-w-7xl mx-auto px-6 py-8">
```

### 3. Flex Layouts

```jsx
// Before
<div className={styles.flexRow}>

// After
<div className="flex items-center gap-4">
```

### 4. Buttons

```jsx
// Before
<button className={styles.primaryButton}>

// After
<button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-all">
```

### 5. Cards

```jsx
// Before
<div className={styles.card}>

// After
<div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
```

### 6. Grid Layouts

```jsx
// Before
<div className={styles.grid}>

// After
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
```

### 7. Responsive

```jsx
// Before - needs media queries in CSS

// After - inline responsive
<div className="text-sm md:text-base lg:text-lg">
<div className="hidden md:block">
```

### 8. Dynamic Classes

```jsx
// Before
<div className={`${styles.card} ${isActive ? styles.active : ''}`}>

// After
<div className={`bg-white rounded-lg ${isActive ? 'border-primary shadow-lg' : 'border-slate-200'}`}>
```

---

## Quick Reference: Common Components

### Header Pattern

```jsx
<header className="bg-white border-b border-slate-200 sticky top-0 z-50">
  <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
    <h1 className="text-2xl font-bold text-slate-800">Title</h1>
  </div>
</header>
```

### Card Pattern

```jsx
<div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
  <h3 className="text-lg font-bold text-slate-800 mb-2">Card Title</h3>
  <p className="text-sm text-slate-600 leading-relaxed">Content...</p>
</div>
```

### Button Pattern

```jsx
// Primary
<button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-all">
  Click
</button>

// Secondary
<button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-primary hover:text-primary transition-all">
  Click
</button>
```

### Badge Pattern

```jsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
  Badge
</span>
```

### Input Pattern

```jsx
<input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
```

---

## Sizing Reference

### Spacing Scale (p-, m-, gap-)

- `1` = 0.25rem (4px)
- `2` = 0.5rem (8px)
- `3` = 0.75rem (12px)
- `4` = 1rem (16px)
- `6` = 1.5rem (24px)
- `8` = 2rem (32px)
- `12` = 3rem (48px)

### Font Sizes

- `text-xs` = 0.75rem (12px)
- `text-sm` = 0.875rem (14px)
- `text-base` = 1rem (16px)
- `text-lg` = 1.125rem (18px)
- `text-xl` = 1.25rem (20px)
- `text-2xl` = 1.5rem (24px)
- `text-3xl` = 1.875rem (30px)
- `text-4xl` = 2.25rem (36px)

### Border Radius

- `rounded` = 0.25rem
- `rounded-md` = 0.375rem
- `rounded-lg` = 0.5rem
- `rounded-xl` = 0.75rem
- `rounded-2xl` = 1rem
- `rounded-full` = 9999px

---

## Pro Tips

1. **Use arbitrary values for exact matches:**

   ```jsx
   className = "w-[470px] h-[calc(100vh-64px)]";
   ```

2. **Group related utilities:**

   ```jsx
   // ❌ Bad
   className = "text-slate-800 font-bold text-2xl mb-4";

   // ✅ Good (grouped by category)
   className = "text-2xl font-bold text-slate-800 mb-4";
   ```

3. **Extract common patterns to config:**

   ```js
   // tailwind.config.js
   theme: {
     extend: {
       colors: {
         'card-bg': '#ffffff',
       }
     }
   }
   ```

4. **Use @apply for truly repeated patterns:**
   ```css
   @layer components {
     .btn-primary {
       @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover;
     }
   }
   ```
