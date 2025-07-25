# MAV Library

A modern library management system built with React, TypeScript, and Vite.

## Features

- 📚 Book catalog with search and filtering
- 🔐 User authentication with different roles (Admin, Teacher, Student)
- 📱 Progressive Web App (PWA) support
- 🎨 Modern UI with responsive design
- 🚀 Optimized build with Vite
- 🔄 Real-time updates
- 📱 Offline support

## Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher (or pnpm/yarn)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mav-library.git
   cd mav-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the environment variables as needed
   - For Google Gemini integration, set `VITE_GEMINI_API_KEY`

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   # or
   pnpm build
   ```

## Available Scripts

- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build
- `lint` - Run ESLint
- `format` - Format code with Prettier
- `test` - Run tests
- `test:watch` - Run tests in watch mode
- `test:coverage` - Generate test coverage report

## Project Structure

```
mav-library/
├── src/                    # Source files
│   ├── components/         # Reusable UI components
│   ├── context/            # React context providers
│   ├── data/               # Mock data and API calls
│   ├── hooks/              # Custom React hooks
│   └── pages/              # Page components
├── public/                 # Static files
├── types/                  # TypeScript type definitions
├── .env.example            # Example environment variables
├── index.html              # Main HTML template
├── package.json            # Project metadata and dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Environment Variables

See `.env.example` for all available environment variables.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite PWA](https://vite-pwa-org.netlify.app/)
