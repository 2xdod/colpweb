# COLP - Fantasy Jewelry Website

## Overview
COLP is a complete fantasy jewelry e-commerce website with an integrated storytelling platform called "Colp Town Stories". The website combines product sales with immersive fantasy narratives about each piece of jewelry.

## Website Structure

### Pages Created:
1. **index.html** - Homepage with hero section and popular products
2. **products.html** - Product catalog with filtering system
3. **customized.html** - Custom jewelry orders with examples and contact form
4. **stories.html** - Colp Town Stories main page
5. **library.html** - Alphabetical story library
6. **styles.css** - Complete styling and responsive design
7. **script.js** - Interactive functionality

## Features

### Homepage (index.html)
- Campaign banner with special offers
- Hero section with fantasy theme
- "SHOP NOW" and "Visit Colp Town Stories" buttons
- Popular products grid (8 products displayed)
- Fantasy jewelry names and descriptions

### Products Page (products.html)
- Category filters: Rings, Necklaces, Brooches, Earrings, Formal Jewelry
- Style filters: Miniature Monuments, Low Poly, Classics, People, Nature, Mystical
- Interactive filtering system
- Add to cart functionality with notifications

### Customized Page (customized.html)
- Hero section with example image
- 5 example categories with 4 items each:
  - Tattoo to jewelry conversion
  - Pet portrait jewelry
  - Person portrait jewelry
  - Place/building replicas
  - Logo/symbol jewelry
- Contact form with file upload
- Thank you page after submission

### Stories Page (stories.html)
- Fantasy hero section with warrior imagery
- Popular stories (sorted by read count)
- Recently added stories
- Link to story library

### Library Page (library.html)
- Alphabetical navigation (A-Z)
- Stories organized by first letter
- Search functionality
- Story categories and descriptions

## How to Use Your Website

### 1. Setting Up the Website

**Option A: Simple File Opening**
1. Download all files to a folder on your computer
2. Double-click on `index.html` to open in your web browser
3. Navigate between pages using the menu

**Option B: Using a Local Server (Recommended)**
1. Install a simple web server:
   - **Python 3**: Open terminal/command prompt in your folder and run:
     ```
     python -m http.server 8000
     ```
   - **Python 2**: Run:
     ```
     python -m SimpleHTTPServer 8000
     ```
   - **Node.js**: Install `http-server` globally:
     ```
     npm install -g http-server
     http-server
     ```

2. Open your browser and go to `http://localhost:8000`

### 2. Customizing Your Website

**Changing Images:**
- Replace placeholder images with your actual jewelry photos
- Update image URLs in HTML files
- Recommended image sizes:
  - Product images: 250x250px
  - Hero images: 800x400px
  - Example images: 200x200px

**Adding Products:**
1. Open `products.html` and `index.html`
2. Copy an existing product card
3. Update:
   - Image source (`src` attribute)
   - Product name (`h3` text)
   - Description (`p` text)
   - Price (`span` with class "price")
   - Data attributes for filtering

**Adding Stories:**
1. Open `stories.html` for main stories page
2. Open `library.html` for alphabetical listing
3. Copy existing story card structure
4. Update content and metadata

**Customizing Colors and Fonts:**
- Edit `styles.css`
- Main color scheme uses gold (#DAA520) and dark blue (#1a1a2e)
- Font family is set to Georgia serif

### 3. Making the Website Live

**Option A: Free Hosting (GitHub Pages)**
1. Create a GitHub account
2. Create a new repository
3. Upload all your files
4. Enable GitHub Pages in repository settings
5. Your site will be live at: `username.github.io/repository-name`

**Option B: Web Hosting Services**
1. Choose a hosting provider (Netlify, Vercel, etc.)
2. Upload your files via FTP or drag-and-drop
3. Point your domain to the hosting service

### 4. Adding Real Functionality

**E-commerce Integration:**
- Integrate with payment processors (Stripe, PayPal)
- Add shopping cart database
- Implement user accounts

**Contact Form:**
- Connect to email service (EmailJS, Formspree)
- Add backend server for form processing

**Content Management:**
- Add admin panel for managing products and stories
- Implement database for dynamic content

## File Structure
```
your-website-folder/
├── index.html          # Homepage
├── products.html       # Products catalog
├── customized.html     # Custom orders
├── stories.html        # Stories main page
├── library.html        # Story library
├── styles.css          # All styling
├── script.js           # Interactive features
└── README.md           # This file
```

## Browser Compatibility
- Chrome, Firefox, Safari, Edge (modern versions)
- Responsive design works on mobile devices
- Uses modern CSS features (Grid, Flexbox, Backdrop-filter)

## Support
- All code is commented for easy understanding
- Modify colors, fonts, and content as needed
- Images are currently placeholders - replace with your actual jewelry photos

## Next Steps
1. Replace placeholder images with your jewelry photos
2. Update product information and prices
3. Add your actual business contact information
4. Test the website on different devices
5. Choose a hosting solution
6. Consider adding real e-commerce functionality

Your COLP fantasy jewelry website is ready to use!