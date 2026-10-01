# ⚡ CodeForge

> **Code. Compile. Build.**

CodeForge is a modern **multi-language online compiler and cloud IDE** that lets developers write, run, save, manage, and share code directly from their browser.

Built with a professional developer-focused interface, CodeForge combines a powerful code editor, project management, authentication, live web preview, and secure code execution into one platform.

---

## ✨ Features

* 🧑‍💻 **Multi-language coding** — C, C++, Java, Python, JavaScript, TypeScript, HTML, CSS, and more
* ⚡ **Online compilation & execution**
* 📝 **Monaco-based code editor**
* 🌐 **Live HTML/CSS/JavaScript preview**
* 📁 **Multi-file project management**
* 🔐 **Firebase authentication**
* 💾 **Automatic project saving**
* 📤 **Import & export projects**
* 🔗 **Shareable projects**
* 📊 **Execution history**
* 🖥️ **Interactive terminal & output console**
* 🎨 **Dark & light themes**
* ⌨️ **Keyboard shortcuts & command palette**
* 📱 **Responsive interface**
* ✨ **Smooth developer-focused animations**

---

## 🛠️ Tech Stack

| Technology              | Purpose             |
| ----------------------- | ------------------- |
| React                   | Frontend            |
| TypeScript              | Application logic   |
| Tailwind CSS            | Styling             |
| Monaco Editor           | Code editor         |
| Motion                  | UI animations       |
| Firebase Authentication | User authentication |
| Firebase Firestore      | Database            |
| Firebase Storage        | File storage        |
| Firebase Hosting        | Deployment          |

---

## 🏗️ Architecture

```text
                    ┌──────────────────┐
                    │    CodeForge     │
                    │ React + TS       │
                    └────────┬─────────┘
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼
       Authentication     Firestore        Storage
          Firebase        Database         Files
             │               │                │
             └───────────────┼────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Execution API    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Secure Sandbox   │
                    │ Compiler/Runtime │
                    └──────────────────┘
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/CodeForge.git
cd CodeForge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a Firebase project and enable:

* Authentication
* Firestore Database
* Firebase Storage
* Firebase Hosting

Create your environment configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> Never commit private credentials, service-account keys, or secrets to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Open the local development URL shown in the terminal.

---

## 📂 Project Structure

```text
CodeForge/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── editor/
│   ├── services/
│   ├── firebase/
│   ├── hooks/
│   ├── utils/
│   └── types/
│
├── public/
│
├── .env.example
├── package.json
├── firebase.json
├── firestore.rules
├── storage.rules
└── README.md
```

---

## 🔐 Security

CodeForge is designed with security in mind.

* Firebase Authentication for identity
* Firestore security rules
* Storage security rules
* Protected application routes
* Input validation
* Execution time limits
* Memory limits
* Restricted filesystem access
* Network restrictions for code execution
* Isolated execution environments

User-submitted code should **never be executed directly inside the main application server**.

---

## 💻 Supported Languages

### Programming

```text
C
C++
Java
Python
JavaScript
TypeScript
Go
Rust
PHP
C#
Kotlin
Swift
Ruby
```

### Web

```text
HTML
CSS
JavaScript
```

Web projects include a dedicated live preview environment.

---

## 🎯 Project Goals

CodeForge aims to provide a simple and powerful environment for:

* Learning programming
* Practicing DSA
* Testing algorithms
* Building small projects
* Experimenting with different languages
* Creating web prototypes
* Sharing code
* Learning without installing local development tools

---

## 🔮 Future Plans

* 🤝 Real-time collaborative coding
* 🤖 AI-assisted debugging
* 📦 GitHub integration
* 🧪 Automated test cases
* 🏆 Coding challenges
* 📈 Developer statistics
* 🔌 More programming languages
* 🐳 Advanced containerized execution
* 🌍 Public project discovery
* 👥 Team workspaces

---

## 📸 Screenshots

Add screenshots of:

* Landing page
* Login / Signup
* Dashboard
* Code editor
* Terminal
* HTML live preview
* Project management
* User profile

Example:

```text
docs/
├── landing.png
├── dashboard.png
├── editor.png
├── terminal.png
└── preview.png
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Commit your changes

```bash
git commit -m "Add your feature"
```

4. Push the branch

```bash
git push origin feature/your-feature
```

5. Open a Pull Request

---

## 📄 License

This project is currently available for educational and development purposes.

Add your preferred license before distributing the project publicly.

---

## 👩‍💻 Developer

**Sakhi Prasad Tapre**

Computer Engineering Student | Software Development | Web Technologies

---

<p align="center">

**CodeForge — Code. Compile. Build.**

</p>

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
