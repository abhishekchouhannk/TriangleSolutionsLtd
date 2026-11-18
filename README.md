# Triangle Electric Solutions Ltd – website

Static site (plain HTML/CSS/JS) with a tiny Node server for local preview.

## Run locally
    npm start
Open http://localhost:3000  (needs Node 18+, no `npm install` required)

## Deploy to Vercel
1. Push this folder to GitHub (or run `npx vercel` inside it).
2. In Vercel: Framework preset **Other**, leave Build Command empty. `vercel.json` already points the output at `public/`.

## Add the client's photos
Put images in `public/images/` using the names in `public/images/IMAGE-NAMES.txt`
(commercial-1 … commercial-3, residential-1 … 3, ev-charger-1 … 3, chandelier-1 … 3, more-1 … 3, hero, about).
.jpg, .jpeg, .png and .webp all work. Empty slots show an "Add photo: filename" placeholder.
Once the site is final, set `HIDE_EMPTY_PHOTOS = true` at the top of `public/js/main.js` to hide any unused slots.

## Contact form
The form posts to FormSubmit and lands in raffibonjour@gmail.com.
The FIRST submission triggers an activation email to that inbox – click the confirm link once, then it works for good.

## Logo
The header/footer logo is an SVG recreation of the client's logo. To use the real file, ask him for the original (PNG/SVG)
and swap it in where `.brand` is used.
