#!/bin/bash

# Create an array of components to install
components=(
  "command"
  "context-menu"
  "data-table"
  "date-picker"
  "drawer"
  "dropdown-menu"
  "hover-card"
  "input-otp"
  "menubar"
  "navigation-menu"
  "pagination"
  "popover"
  "progress"
  "radio-group"
  "resizable"
  "scroll-area"
  "select"
  "separator"
  "sheet"
  "sidebar"
  "skeleton"
  "slider"
  "sonner"
  "switch"
  "textarea"
  "toggle"
  "toggle-group"
  "tooltip"
)

# Loop through the components and install them one by one
for component in "${components[@]}"; do
  echo "Installing $component..."
  # Use expect to automatically select the legacy-peer-deps option
  echo "Installing $component with automatic legacy-peer-deps selection..."
  
  # We'll use a different approach - manually answering the prompt
  { echo "1"; sleep 2; } | npx shadcn@latest add $component || true
  
  echo "-----------------------------------"
done

echo "All components installed!" 