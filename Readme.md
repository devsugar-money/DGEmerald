# DecideGuide - Decision Tree Builder

## Overview

DecideGuide is a powerful, interactive decision tree builder application that helps users create, manage, and share decision trees to guide others through complex decision-making processes. Built with modern web technologies, this tool allows you to construct yes/no question paths that lead users to different outcomes, supplemented with helpful resources, learning materials, and actionable items. With its latest updates, the application offers an enhanced spreadsheet-like editor for more intuitive question management and resource linking.

![DecideGuide](https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)

## Features

- **Interactive Decision Trees**: Build decision trees with yes/no questions and customized paths.
- **Resource Enrichment**: Add hints, learning materials, and action items to each question using a modular resource system.
- **Action Plans**: Automatically generate action plans based on user responses with trigger conditions.
- **User Authentication**: Secure login and registration system.
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices.
- **Real-time Updates**: Changes to decision trees are saved automatically.
- **Drag-and-Drop Interface**: Easily reorder questions in the streamlined spreadsheet editor.
- **Rich Text Editing**: Format questions, actions, and terminate messages with a WYSIWYG editor.
- **Resource Library**: Select from a central repository of pre-created hint and learn resources.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router 6
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Custom components with Lucide React icons
- **Rich Text Editor**: React Quill
- **Drag and Drop**: Custom implementation with HTML5 Drag and Drop API
- **Build Tool**: Vite

## Project Structure

```
decision-tree-builder/
├── src/                  # Source code
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   ├── store/            # Zustand state management stores
│   ├── lib/              # Utilities and type definitions
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Application entry point
├── supabase/             # Supabase configuration and migrations
│   └── migrations/       # Database migration files
├── public/               # Static assets
├── .env                  # Environment variables
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd decision-tree-builder
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Database Setup

The project uses Supabase as its backend and PostgreSQL database. The database schema includes specialized tables for handling various resource types:

- `questions`: Core table storing all question data and relationships
- `hints_title` & `hints_content`: Separate tables for hint resources
- `learn_title` & `learn_content`: Separate tables for learning resources
- `actions`: Stores action item content
- `terminates`: Stores termination message content

To set up the database:

1. Create a new Supabase project
2. Connect your local project to Supabase using the provided URL and anon key
3. Run migrations (if using Supabase CLI):
```bash
supabase db push
```

## Key Components

### Survey Creation and Management

The application allows users to create and manage surveys (decision trees). Each survey consists of a series of questions that users can answer with "Yes" or "No". Based on the answer, the user is directed to the next appropriate question.

### Question Editor

The enhanced spreadsheet-like editor enables efficient management of questions, including:
- Setting question text with rich-text formatting
- Defining "Yes" and "No" paths between questions
- Selecting hints and learning materials from a centralized resource library
- Creating action items with custom trigger conditions (on Yes/No answers)
- Setting termination messages with file upload capabilities
- Intuitive modal interfaces for resource selection and editing

### Taking Surveys

End users can navigate through the decision tree by answering questions. They can:
- View hints for additional context
- Access learning materials for deeper understanding
- Review their progress and revisit previous questions
- Generate an action plan based on their responses

## Usage Guide

### Creating a Survey

1. Navigate to the Dashboard
2. Click "New Survey"
3. Enter a survey name and first question
4. Use the spreadsheet editor to add more questions and define paths

### Editing Questions

In the improved spreadsheet editor:
- Toggle edit mode for each row with a dedicated button
- Click cells to edit content or select resources through modal interfaces
- Use dropdown menus to connect questions based on Yes/No answers
- Select from pre-existing hint and learn resources through dedicated popups
- Create rich-text action and terminate content with a WYSIWYG editor
- Specify triggers for actions and terminates (Yes/No answers)
- Enable file upload requirements for specific questions
- Drag questions to reorder them in the decision flow

### Action Plans

- Each question can have an associated action item
- You can specify whether the "Yes" or "No" answer should trigger the action item in the final action plan
- If no trigger is specified, the action is always included
- Action plans are generated at the end of the survey

## Troubleshooting

### Common Issues

- **Authentication Problems**: Make sure your Supabase credentials are correctly configured in the `.env` file.
- **Database Connection Issues**: Check your network connection and Supabase service status.
- **UI Rendering Problems**: Clear your browser cache or try a different browser.

## Contributing

We welcome contributions to improve DecideGuide! Please follow these steps to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Coding Standards

- Follow the existing code style
- Write clear, descriptive commit messages
- Include comments for complex logic
- Write tests for new features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact the project maintainers at [example@email.com](mailto:example@email.com).

---

© 2025 DecideGuide - Decision Tree Builder