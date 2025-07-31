# MedAssist AI - Mobile Medical Assistant

A secure, mobile-first Progressive Web App (PWA) that provides medical information assistance using Google's Gemini AI. Built with React, TypeScript, and Tailwind CSS.

## 🏥 Features

- **Mobile-Optimized**: Native app-like experience on phones and tablets
- **Progressive Web App**: Install directly from browser, works offline
- **Secure API Integration**: Uses Google Gemini API with client-side key storage
- **Medical Focus**: Specialized prompts for medical information queries
- **Professional UI**: Clean, medical-themed interface with accessibility features
- **Touch-Friendly**: Optimized for mobile touch interactions

## ⚠️ Important Medical Disclaimer

**This application is for educational and informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare professionals for any medical questions or concerns.**

## 🚀 Quick Start

### Prerequisites

- Google Gemini API key (free from [Google AI Studio](https://makersuite.google.com/app/apikey))
- Modern web browser (Chrome, Safari, Firefox, Edge)

### Getting Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### Installation & Setup

1. **Open the app** in your mobile browser
2. **Configure API Key**:
   - Tap the Settings icon (⚙️) in the top right
   - Paste your Gemini API key
   - Tap "Save & Continue"
3. **Install as App** (optional):
   - Look for "Add to Home Screen" prompt in your browser
   - Or use browser menu: "Install App" / "Add to Home Screen"

## 📱 Using the App

### Basic Usage

1. **Ask Medical Questions**: Type your question in the chat input
2. **Quick Prompts**: Tap suggested questions to get started
3. **Review Responses**: AI provides educational medical information
4. **Follow Medical Advice**: Always consult healthcare professionals

### Example Questions

- "What are the symptoms of dehydration?"
- "How to treat a minor cut?"
- "When should I see a doctor for a headache?"
- "What's the difference between cold and flu?"
- "First aid for minor burns"

### Best Practices

- **Be Specific**: Provide clear, detailed questions
- **Emergency Situations**: Call emergency services immediately, don't rely on AI
- **Professional Consultation**: Use AI information to prepare questions for your doctor
- **Privacy**: Don't share personal medical information in questions

## 🔐 Security & Privacy

### API Key Security

- ✅ **Local Storage**: API key stored only on your device
- ✅ **No Server**: Key never sent to our servers
- ✅ **Direct Connection**: Communicates directly with Google's API
- ⚠️ **Browser Security**: Secure your device and browser

### Data Privacy

- **No Data Collection**: We don't collect or store your conversations
- **Google's Privacy**: Conversations are subject to Google's privacy policy
- **Local Only**: Chat history stored locally on your device
- **Clear Data**: Use browser settings to clear chat history

## 🛠️ Technical Details

### Built With

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS V4** - Utility-first styling
- **ShadCN UI** - Professional component library
- **Vite** - Fast build tool and development server

### PWA Features

- **Offline Support**: Basic app functionality works offline
- **App Installation**: Install like a native app
- **Push Notifications**: (Coming soon)
- **Background Sync**: (Coming soon)

### Browser Compatibility

- **iOS Safari**: 12.0+
- **Android Chrome**: 80+
- **Desktop Chrome**: 80+
- **Desktop Safari**: 12.0+
- **Firefox**: 75+
- **Edge**: 80+

## 🏗️ Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env.local` file:

```env
# Optional: Default API key (not recommended for production)
VITE_DEFAULT_GEMINI_API_KEY=your_api_key_here
```

### Project Structure

```
src/
├── components/ui/     # Reusable UI components
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles and theme

public/
├── manifest.json     # PWA manifest
├── sw.js            # Service worker
├── icon-*.png       # App icons
└── index.html       # HTML template
```

## 📖 API Integration

### Gemini API Configuration

The app uses Google's Gemini 1.5 Flash model with:

- **Temperature**: 0.3 (balanced creativity/consistency)
- **Max Tokens**: 1024 (moderate response length)
- **Safety Settings**: Medical-appropriate content filtering

### Error Handling

- **Network Errors**: Graceful handling of connectivity issues
- **API Errors**: Clear error messages for API problems
- **Validation**: Input sanitization and validation
- **Rate Limiting**: Respects API rate limits

## 🎯 Roadmap

### Planned Features

- [ ] **Symptom Checker**: Guided symptom assessment
- [ ] **Drug Information**: Medication lookup and interactions
- [ ] **First Aid Guide**: Emergency response instructions
- [ ] **Health Tracking**: Basic health metric logging
- [ ] **Multi-language**: Support for multiple languages
- [ ] **Voice Input**: Speech-to-text for questions

### Technical Improvements

- [ ] **Offline AI**: Local AI model for basic queries
- [ ] **Push Notifications**: Medication reminders
- [ ] **Data Export**: Export conversation history
- [ ] **Advanced PWA**: Better offline experience

## 📞 Support

For technical issues or questions:

1. Check this documentation
2. Review browser console for errors
3. Verify API key configuration
4. Try refreshing the app

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read contributing guidelines and submit pull requests.

---

**Remember**: This tool provides educational information only. Always consult healthcare professionals for medical advice, diagnosis, or treatment.