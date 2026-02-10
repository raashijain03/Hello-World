# The Green Room Website

Official brand website for **The Green Room**, a luxury women's workwear label.

## Brand Positioning

The Green Room represents the private moment before presence: where modern
working women prepare mentally and emotionally before stepping into rooms that
matter.

This website communicates:

- Authority without excess
- Elegance with function
- Desk-to-dinner versatility
- Identity-led luxury over trend-driven fashion

## Project Structure

- `index.html` - videographic landing page and brand storytelling
- `catalog.html` - mood-based clothing catalog with add-to-order flow
- `contact.html` - Contact Us page for client care and appointment requests
- `styles.css` - shared visual system and responsive layouts
- `script.js` - navigation, reveal animations, mood filtering, and form logic

## Local Development

This is a static site. Open `index.html` in your browser, or run a basic local
server:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open your forwarded port URL (or `http://127.0.0.1:8000` if local).

## Notes for Iteration

- Replace sample video source and visual placeholders with campaign assets.
- Integrate checkout and contact forms with a backend payment/order pipeline.
- Add authentication and customer profiles for saved sizes and preferences.
