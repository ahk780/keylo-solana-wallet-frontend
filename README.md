# Keylo - Solana Trading Platform

A modern, responsive web application for Solana trading and wallet management. Keylo provides a comprehensive suite of tools for cryptocurrency trading, asset management, and market analysis on the Solana blockchain.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahk780/keylo.git
   cd keylo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   # or
   yarn preview
   ```

The application will be available at `http://localhost:5173` in development mode.

## 📱 Application Pages & Features

### 🏠 Landing Page (`/`)
The main entry point featuring:
- **Hero Section**: Eye-catching introduction with call-to-action buttons
- **Features Section**: Highlights key platform capabilities including secure wallet management, DEX integration, real-time market data, and advanced trading tools
- **DEX Integrations**: Showcases supported decentralized exchanges (Jupiter, Raydium, Orca, Serum)
- **Navigation**: Responsive navigation with mobile-friendly hamburger menu
- **Footer**: Contact information and additional links

### 🔐 Authentication Pages

#### Login Page (`/login`)
- **Email/Password Authentication**: Secure login form with validation
- **Remember Me**: Option to stay logged in
- **Forgot Password**: Link to password recovery
- **Registration Link**: Easy navigation to sign-up page
- **Form Validation**: Real-time input validation with error messages
- **Loading States**: Visual feedback during authentication process

#### Register Page (`/register`)
- **Account Creation**: Comprehensive signup form
- **Email Verification**: Built-in email validation
- **Password Requirements**: Secure password creation with strength indicators
- **Terms Acceptance**: Legal compliance checkboxes
- **Auto-redirect**: Seamless transition to dashboard after registration

### 📊 Dashboard (`/dashboard`)
The main application hub featuring:
- **Portfolio Overview**: Total balance, profit/loss, and performance metrics
- **Quick Actions**: Fast access to trading, transfers, and other key functions
- **Market Summary**: Current market trends and top gainers/losers
- **Recent Transactions**: Latest account activity
- **Navigation Sidebar**: Easy access to all platform features
- **Responsive Design**: Optimized for desktop and mobile devices

### 💰 Trading & Market Pages

#### Trending Page (`/trending`)
- **Market Trends**: Real-time trending tokens and price movements
- **Price Charts**: Interactive charts with technical indicators
- **Volume Analysis**: Trading volume data and analysis
- **Human-Readable Pricing**: Formatted price display (no scientific notation)
- **Market Sentiment**: Bullish/bearish indicators
- **Quick Trading**: Direct links to trading interface

#### Trading Menu (`/trading-menu`)
- **Trading Interface**: Advanced trading tools and order management
- **Order Types**: Market orders, limit orders, stop-loss orders
- **Price Charts**: Real-time candlestick charts with technical analysis
- **Order Book**: Live buy/sell order data
- **Trade History**: Personal trading history and analytics

#### Limit Orders (`/limit-orders`)
- **Order Management**: Create, modify, and cancel limit orders
- **Price Targets**: Set specific buy/sell price points
- **Order Status**: Track pending, filled, and cancelled orders
- **Automated Trading**: Set-and-forget trading strategies
- **Risk Management**: Stop-loss and take-profit features

#### Token Overview (`/token-overview`)
- **Detailed Analytics**: Comprehensive token information and metrics
- **Price History**: Historical price data and charts
- **Market Data**: Market cap, volume, and liquidity information
- **Token Details**: Contract address, supply, and other technical data
- **Social Sentiment**: Community activity and sentiment analysis

### 💼 Asset Management

#### My Assets (`/my-assets`)
- **Portfolio Management**: Complete overview of held tokens
- **Asset Allocation**: Visual breakdown of portfolio distribution
- **Performance Tracking**: Individual asset performance metrics
- **Transfer Functions**: Send and receive tokens
- **Staking Opportunities**: Available staking options for held assets
- **Asset History**: Historical performance and transaction data

#### My Transactions (`/my-transactions`)
- **Transaction History**: Complete record of all account activity
- **Filter & Search**: Advanced filtering by date, type, and amount
- **Export Features**: Download transaction data for tax purposes
- **Transaction Details**: Detailed view of individual transactions
- **Status Tracking**: Pending, confirmed, and failed transaction states
- **Fee Analysis**: Transaction fee breakdown and optimization tips

#### Reclaim Rent (`/reclaim-rent`)
- **Rent Management**: Reclaim Solana rent from closed accounts
- **Account Analysis**: Identify accounts eligible for rent reclamation
- **Batch Processing**: Reclaim rent from multiple accounts simultaneously
- **Cost Optimization**: Minimize transaction fees during reclamation
- **Safety Features**: Confirmation dialogs to prevent accidental operations

### 🔧 Technical Features

#### Responsive Design
- **Mobile-First**: Optimized for smartphones and tablets
- **Desktop Enhanced**: Rich desktop experience with advanced features
- **Touch-Friendly**: Large touch targets and gesture support
- **Cross-Browser**: Compatible with all modern browsers

#### Security Features
- **Secure Authentication**: Industry-standard security practices
- **Wallet Integration**: Support for popular Solana wallets
- **Transaction Signing**: Secure transaction approval process
- **Data Encryption**: Encrypted storage of sensitive information

#### Performance Optimizations
- **Fast Loading**: Optimized bundle size and lazy loading
- **Real-Time Updates**: WebSocket connections for live data
- **Caching**: Smart caching strategies for improved performance
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠 Technology Stack

### Frontend Framework
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with enhanced IDE support
- **Vite**: Fast build tool with hot module replacement

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality accessible components
- **Radix UI**: Primitive components for complex UI patterns
- **Lucide React**: Beautiful, customizable icons

### State Management & Data
- **TanStack Query**: Powerful data fetching and caching
- **React Hook Form**: Performant forms with easy validation
- **Zod**: Runtime type validation and parsing

### Development Tools
- **ESLint**: Code linting and quality enforcement
- **PostCSS**: CSS processing and optimization
- **TypeScript Config**: Strict type checking configuration

### Additional Libraries
- **React Router DOM**: Client-side routing
- **Recharts**: Responsive chart library
- **Date-fns**: Modern date utility library
- **Sonner**: Toast notifications
- **QRCode.react**: QR code generation

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── HeroSection.tsx
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   └── ...
├── pages/              # Application pages/routes
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Trending.tsx
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                # Utility functions
│   └── utils.ts
├── assets/             # Static assets
├── index.css           # Global styles and design tokens
└── main.tsx           # Application entry point
```

## 🎨 Design System

Keylo uses a comprehensive design system built with:
- **CSS Custom Properties**: Semantic color tokens and design variables
- **Tailwind Configuration**: Extended theme with custom utilities
- **Component Variants**: Consistent styling across all components
- **Dark/Light Mode**: Full theme switching support
- **Responsive Breakpoints**: Mobile-first responsive design

## 🔧 Configuration Files

- **`tailwind.config.ts`**: Tailwind CSS configuration with custom theme
- **`vite.config.ts`**: Vite build configuration and path aliases
- **`tsconfig.json`**: TypeScript compiler configuration
- **`eslint.config.js`**: ESLint rules and configuration

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Configure build settings (automatically detected)
3. Deploy with automatic SSL and CDN

### Deploy to Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Self-Hosting
The built application is a static site that can be hosted on any web server:
1. Build the application
2. Upload the `dist` folder contents to your web server
3. Configure your server to serve `index.html` for all routes

## 🔐 Environment Variables

Create a `.env.local` file for local development:
```env
# API Configuration
VITE_API_URL=your_api_url
VITE_SOLANA_RPC_URL=your_solana_rpc_url

# Authentication
VITE_AUTH_DOMAIN=your_auth_domain
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📈 Performance Features

- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Responsive images with lazy loading
- **Bundle Analysis**: Build size monitoring and optimization
- **Caching Strategies**: Efficient browser and CDN caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use semantic commit messages
- Maintain test coverage
- Follow the existing code style
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support & Troubleshooting

### Common Issues

**Build Errors**
- Ensure Node.js version 18 or higher
- Clear node_modules and reinstall dependencies
- Check for TypeScript errors

**Development Server Issues**
- Verify port 5173 is available
- Check for conflicting processes
- Restart the development server

**Styling Issues**
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS rules
- Verify design tokens are properly imported

### Getting Help
- Check the issue tracker on GitHub
- Review the documentation
- Contact the development team

## 🔗 Links

- **Repository**: https://github.com/ahk780/keylo
- **Live Demo**: [Your deployment URL]
- **Documentation**: [Your docs URL]
- **Support**: [Your support email]

---

Built with ❤️ using React, TypeScript, and Tailwind CSS