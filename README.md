# RIT Marketplace

RIT Marketplace is a student-focused online marketplace designed for the RIT Croatia community. The platform allows students to buy, sell, and discover items in a secure and organized environment tailored specifically to campus life.

## Overview

Finding buyers and sellers through group chats and social media can be frustrating and inefficient. RIT Marketplace provides a centralized platform where students can list items, browse available products, and connect with other members of the RIT community.

Whether you are selling textbooks after a semester, looking for affordable electronics, or searching for furniture before moving into a new apartment, RIT Marketplace makes the process simple and accessible.

## Features

* User authentication
* Create, edit, and manage listings
* Browse marketplace categories
* Search available listings
* Upload product images
* Responsive design for desktop and mobile devices
* Secure data storage using Firebase
* Real-time database integration

## Technology Stack

### Frontend

* React
* Tailwind CSS
* CRACO

### Backend Services

* Firebase Authentication
* Firestore Database
* Firebase Storage

### Deployment

* Vercel

## Live Website

https://rit-marketplace.xyz

## Installation

Clone the repository:

```bash
git clone https://github.com/fa6375/rit-marketplace-frontend.git
```

Navigate to the project directory:

```bash
cd rit-marketplace-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Build for production:

```bash
npm run build
```

## Project Structure

```text
src/
├── components/
├── pages/
├── services/
├── hooks/
├── assets/

public/
├── images/
├── icons/
```

## Future Development

Planned features include:

* Favorites and wishlist system
* In-app messaging
* Seller ratings and reviews
* Advanced search and filtering
* Mobile application support
* Push notifications
* Listing analytics
* Student verification system

## Contributing

Suggestions, bug reports, and feature requests are welcome. If you would like to contribute to the project, feel free to open an issue or submit a pull request.

## Author

Faraj Aliyev

## License

This project was developed for educational and community purposes within RIT Croatia.

## Admin deployment

The protected admin console is available at `/admin`. To bootstrap the first
administrator, set `role` to `admin` on that account's `users/{uid}` Firestore
document. Further role changes can then be made from Admin → Users.

```bash
npm ci
npm run build
cd functions && npm install && cd ..
firebase deploy
```

This deploys the web app, Firestore and Storage rules, and the secure callable
function used to delete Firebase Authentication accounts. Settings, categories,
maintenance mode, reports, and audit logs update live from Firestore.
