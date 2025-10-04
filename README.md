# Smart Day Scheduler AI

An intelligent calendar assistant powered by AI that helps you manage your schedule with natural language commands.

## Project info

**URL**: https://lovable.dev/projects/f7ecfdad-7ac1-456a-a94a-561e94852a13

## 🤖 AI Features Setup

To enable full AI functionality, you'll need to set up an OpenAI API key:

### 1. Get an OpenAI API Key
- Visit [OpenAI Platform](https://platform.openai.com/api-keys)
- Sign up or log in to your account
- Create a new API key

### 2. Configure the API Key
Create a `.env` file in your project root:

```bash
# Create .env file
touch .env
```

Add your API key to the `.env` file:
```env
VITE_OPENAI_API_KEY=sk-your_actual_api_key_here
```

### 3. Restart the Development Server
After adding the API key, restart your development server:
```bash
npm run dev
```

### 4. Verify Setup
- Open your browser's developer console (F12)
- Look for "🔑 API Key Status: ✅ Valid" in the console
- The chat interface will show "Demo Mode" if no valid API key is detected

**Note**: Without an API key, the app will run in demo mode with simulated responses.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f7ecfdad-7ac1-456a-a94a-561e94852a13) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f7ecfdad-7ac1-456a-a94a-561e94852a13) and click on Share -> Publish.

## OpenAI Integration

This project includes AI chat functionality powered by OpenAI. To use this feature:

1. Get an API key from [OpenAI's platform](https://platform.openai.com/api-keys)
2. Create a `.env` file in the root directory (it's already included in .gitignore)
3. Add your API key to the `.env` file:
   ```
   VITE_OPENAI_API_KEY=your_actual_api_key_here
   ```
4. Restart your development server if it's already running

Without a valid API key, the application will fall back to simulated AI responses.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
