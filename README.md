# Watson Assistant WordPress Plugin

[![WordPress Plugin Version](https://img.shields.io/badge/WordPress-5.7%2B-blue)](https://wordpress.org/)
[![PHP Version](https://img.shields.io/badge/PHP-5.3%2B-777bb4)](https://php.net/)
[![License](https://img.shields.io/badge/License-Apache%202.0-brightgreen)](LICENSE)

A powerful WordPress plugin that integrates IBM Watson Assistant chatbots into your website, providing intelligent customer support and automated assistance to your visitors.

## 🤖 About

This plugin allows you to easily add AI-powered chatbots to your WordPress website using IBM Watson Assistant (formerly Watson Conversation). Train Watson to answer frequently asked questions, provide useful information, help users navigate your site, and even connect visitors to human operators via telephone when needed.

## ✨ Features

- **Easy Setup**: Simple configuration process to get your Watson Assistant chatbot running quickly
- **Rich Responses**: Support for images, clickable options, pauses, and multimedia content
- **User Integration**: Access user account data like names in chatbot conversations  
- **Voice Calling**: VOIP calling powered by Twilio to connect users with real operators
- **Usage Control**: Monitor and control Watson Assistant service usage directly from plugin settings
- **Page Control**: Choose specific pages and posts where the chatbot should appear
- **Customizable Appearance**: Fully customizable chat box design to match your brand
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Cross-tab Synchronization**: Maintain chat sessions across multiple browser tabs
- **Chat History**: Optional chat history collection and email notifications
- **Multi-language Support**: Compatible with translation plugins

## 📋 Requirements

- WordPress 4.7 or higher
- PHP 5.3 or higher (5.6+ recommended)
- WordPress REST API (included by default in WordPress 4.7+)
- IBM Cloud account with Watson Assistant service
- cURL PHP extension

## 🚀 Installation

### For End Users

1. **Install from WordPress Admin Panel:**
   - Log in to your WordPress Dashboard
   - Navigate to `Plugins` → `Add New`
   - Search for "Watson Assistant" or "Chatbot Watson"
   - Click `Install Now` and then `Activate Plugin`

2. **Manual Installation:**
   - Download the plugin from the WordPress plugin directory
   - Upload the plugin files to `/wp-content/plugins/watson-conversation/`
   - Activate the plugin through the WordPress admin panel

3. **Set up Watson Assistant:**
   - Create an IBM Cloud account at [ibm.com/cloud](https://www.ibm.com/cloud)
   - Create a Watson Assistant service instance
   - Build your chatbot following [this free course](https://cocl.us/build-a-chatbot)

### For Developers

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Intela-solutions/watson-assistant-wordpress.git
   cd watson-assistant-wordpress
   ```

2. **Install dependencies:**
   ```bash
   # Install PHP dependencies
   composer install
   
   # Install Node.js dependencies
   cd js
   npm install
   ```

3. **Build the frontend:**
   ```bash
   # Development build
   npm run build
   
   # Production build (minified)
   npm run prod
   
   # Watch mode for development
   npm run watch
   ```

## ⚙️ Configuration

1. **Access Plugin Settings:**
   - Go to `Watson Assistant` in your WordPress admin menu

2. **Configure Credentials:**
   - Get your Watson Assistant credentials from IBM Cloud
   - Enter your Assistant URL, username, and API key
   - Test the connection to ensure it's working

3. **Customize Appearance:**
   - Set chat box colors, size, and position
   - Upload custom avatars or logos
   - Configure welcome messages

4. **Set Display Rules:**
   - Choose which pages/posts should show the chatbot
   - Set user role restrictions if needed

## 🎯 Usage

Once configured, the chatbot will automatically appear on your selected pages. Visitors can:

- Click the chat button to start a conversation
- Ask questions and receive AI-powered responses  
- Access rich content like images and clickable options
- Request to speak with a human operator (if configured)
- Continue conversations across different pages

## 🧪 Testing

### Manual Testing with Docker

A Docker Compose setup is provided for local testing:

```bash
cd docker
docker-compose up -d
```

Access the test site at `http://localhost:8000`

### Building for Testing

```bash
# Navigate to js directory
cd js

# Install dependencies
npm install

# Build for development
npm run build

# Build for production
npm run prod
```

## 🏗️ Development Environment

### Prerequisites

- [Node.js](https://nodejs.org/) (v10+)
- [npm](https://www.npmjs.com/get-npm)
- [Composer](https://getcomposer.org/)
- [Docker](https://www.docker.com/) (optional, for testing)

### Setup

1. **Install dependencies:**
   ```bash
   # PHP dependencies
   composer install
   
   # JavaScript dependencies
   cd js && npm install
   ```

2. **Development workflow:**
   ```bash
   # Watch for changes during development
   cd js && npm run watch
   
   # Build for production
   npm run prod
   ```

3. **Testing locally:**
   ```bash
   # Start WordPress test environment
   cd docker && docker-compose up -d
   ```

## 📁 Project Structure

```
watson-assistant-wordpress/
├── assets/                    # Plugin banners and screenshots
├── docker/                    # Docker development environment
├── js/                        # React.js frontend source code
│   ├── src/                   # Source files
│   ├── package.json           # Node.js dependencies
│   └── webpack.config.js      # Build configuration
├── test/                      # Test files
├── watson-conversation/       # WordPress plugin directory
│   ├── css/                   # Stylesheets
│   ├── includes/              # PHP source files
│   ├── js/                    # JavaScript utilities
│   ├── watson.php             # Main plugin file
│   └── Readme.txt             # WordPress.org plugin description
├── composer.json              # PHP dependencies
├── Dockerfile                 # Container configuration
└── README.md                  # This file
```

## 🔄 Releasing Updates

**For maintainers with WordPress.org SVN access:**

1. Build the production JavaScript:
   ```bash
   cd js && npm run prod
   ```

2. Update version numbers in:
   - `watson-conversation/watson.php`
   - `watson-conversation/Readme.txt`

3. Add changelog entry to `Readme.txt`

4. Copy `watson-conversation/` contents to WordPress.org SVN repository

For detailed WordPress.org publishing guidelines, see the [official documentation](https://developer.wordpress.org/plugins/wordpress-org/).

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow WordPress coding standards
- Test changes with the provided Docker environment
- Update documentation as needed
- Ensure backward compatibility

## 🐛 Issue Reporting

Found a bug? Please [open an issue](https://github.com/Intela-solutions/watson-assistant-wordpress/issues) with:

- WordPress version
- PHP version
- Plugin version
- Detailed description of the problem
- Steps to reproduce

## 📚 Resources

- [Free Watson Assistant Course](https://cocl.us/build-a-chatbot)
- [IBM Watson Assistant Documentation](https://cloud.ibm.com/docs/assistant)
- [WordPress Plugin Development](https://developer.wordpress.org/plugins/)
- [Watson Assistant WordPress Plugin Page](https://wordpress.org/plugins/conversation-watson/)

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](http://www.apache.org/licenses/LICENSE-2.0) file for details.

## 🙏 Acknowledgments

- IBM Cognitive Class for the original development
- Watson Assistant team for the AI platform
- WordPress community for the platform
- Contributors and users for feedback and improvements

## 💼 Professional Services

- **ISV Program**: Qualify for [special IBM Cloud credits](https://cocl.us/CB0103EN_WATR_WPP) if you build chatbots professionally
- **Enterprise Support**: Available through [Intela Solutions](https://intela-bot.com/)
- **Custom Development**: Contact us for custom Watson Assistant integrations

---

**Made with ❤️ by the Watson Assistant WordPress community**
