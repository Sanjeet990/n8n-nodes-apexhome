![Banner image](./icons/apexhome.png)

# n8n-nodes-apexhome

This is an n8n community node for integrating with Apex Application Dashboard, a modern, self-hosted event-driven home lab hub. Apex Home allows you to manage and automate your home lab services efficiently, going far beyond traditional dashboards like Heimdall, Homepage, Dashy, or Homer.

---

## About Apex Home

Apex Home is a self-hosted, event-driven application dashboard for managing and automating your home lab ecosystem. It centralizes services, notifications, devices, and automation tasks into a single sleek and responsive interface.

- **Website**: [https://getapexhome.com/](https://getapexhome.com/)
- **GitHub Repository**: [Apex Home GitHub](https://github.com/Apex-Home/apex-home)
- **Documentation**: [Apex Home Docs](https://getapexhome.com/docs)

### Key Features

- **Listings & Link Management**: Manage links, camera streams, code snippets, and todos.
- **Weather Display**: Dedicated weather page with forecasts.
- **Pages**: Create and manage content pages within Apex Home.
- **Device Management**: Add and list devices with WOL support and direct connections over SSH, RDP, and VNC.
- **Live Apps**: Integrate third-party applications that pull live data into Apex Home tiles.
- **Multi-User & Multi-Admin Support**: Manage roles and permissions.
- **Custom Domain & Inbuilt SSL Support**: Serve Apex Home on your own domain securely.
- **Flexible Layout**: Fully responsive and customizable interface.
- **Active Development**: Frequent updates with new features and improvements.

---

## Features of This n8n Node

This n8n node allows you to integrate Apex Home with your workflows and automate interactions:

- Supports 52+ events (and more coming). Examples: `user.created`, `page.added`, `task_completed`, etc.
- Trigger workflows based on Apex Home events.
- Send notifications and automate actions within Apex Home.
- Manage dashboards, services, and notifications directly from n8n.

This package provides two nodes:

- **Apex Home Triggers** – Trigger workflows from Apex Home events.
- **Apex Home Actions** – Perform actions on Apex Home programmatically.

---

## Installation

To use this node in your n8n instance:

1. In n8n, go to **Settings → Community Nodes → Click the install button**.
2. A modal box will appear asking for the npm Package Name. Enter:

   ```
   n8n-nodes-apexhome
   ```

3. The Apex Home node will now be available in the n8n editor.

---

## Development Instructions

### Prerequisites

- **[Node.js](https://nodejs.org/)** (v22 or higher) and npm
- **[git](https://git-scm.com/downloads)**

### Steps to Develop

1. Clone the repository:

   ```bash
   git clone https://github.com/Sanjeet990/n8n-nodes-apexhome.git
   cd n8n-nodes-apexhome
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm run dev
   ```

   Navigate to [http://localhost:5678](http://localhost:5678) to test your node in workflows.

### Linting and Building

- Check for linting errors:

  ```bash
  pnpm run lint
  ```

- Auto-fix linting issues:

  ```bash
  pnpm run lint:fix
  ```

- Build the project:

  ```bash
  pnpm run build
  ```

- Build in watch mode:

  ```bash
  pnpm run build:watch
  ```

> To contribute changes, create a PR to the repository instead of running a local release.

---

## Usage

### Example Workflow

1. Drag and drop the **Apex Home Triggers** node to start a workflow based on an Apex Home event.
2. Add **Apex Home Actions** nodes to perform actions such as sending notifications, managing services, or updating dashboards.
3. Configure credentials to connect to your Apex Home instance.
4. Execute the workflow to automate your home lab.

### Supported Operations

- **Send Notification**: Push rich notifications with tags, urgency, and actions.
- **Trigger Event**: Respond to events from Apex Home in n8n workflows.
- **Manage Services**: Add, remove, update services or dashboards.

---

## Contributing

We welcome contributions!

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and test thoroughly.
4. Submit a pull request with a detailed description of your changes.

### Guidelines

- Follow the existing code style and structure.
- Write clear and concise commit messages.
- Test your changes in various scenarios.

---

## Troubleshooting

### Node not appearing

- Make sure you installed dependencies and restarted n8n.

### Linting errors

- Run `pnpm run lint:fix` to automatically fix most common issues.

### TypeScript errors

- Ensure you're using Node.js v22 or higher and have installed all dependencies.

---

## Available Scripts

| Script                | Description                                                      |
| --------------------- | ---------------------------------------------------------------- |
| `pnpm run dev`         | Start n8n with your node and hot reload                         |
| `pnpm run build`       | Compile for production                                          |
| `pnpm run build:watch` | Auto-rebuild on changes                                         |
| `pnpm run lint`        | Check for code style errors                                     |
| `pnpm run lint:fix`    | Auto-fix lint issues                                           |
