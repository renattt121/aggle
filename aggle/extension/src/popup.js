const WORKSPACES_KEY = "aggle-workspaces";
const ACTIVE_WORKSPACE_KEY = "aggle-active-workspace";

const DEFAULT_WORKSPACES = [
  { id: "personal", name: "Personal", icon: "🏠" },
  { id: "work", name: "Work", icon: "💼" },
  { id: "research", name: "Research", icon: "🧪" }
];

document.addEventListener('DOMContentLoaded', () => {
  console.log('Aggle popup.js loaded');
  initializeWorkspaces();
  setupEventListeners();
});

async function initializeWorkspaces() {
  try {
    console.log('Initializing workspaces');
    const result = await browser.storage.local.get([WORKSPACES_KEY, ACTIVE_WORKSPACE_KEY]);
    console.log('Storage result:', result);
    const workspaces = result[WORKSPACES_KEY] || DEFAULT_WORKSPACES;
    const activeWorkspaceId = result[ACTIVE_WORKSPACE_KEY] || (workspaces.length > 0 ? workspaces[0].id : null);

    // Save defaults if no workspaces exist
    if (!result[WORKSPACES_KEY]) {
      await browser.storage.local.set({ [WORKSPACES_KEY]: workspaces });
    }
    if (!result[ACTIVE_WORKSPACE_KEY] && workspaces.length > 0) {
      await browser.storage.local.set({ [ACTIVE_WORKSPACE_KEY]: workspaces[0].id });
    }

    renderWorkspaces(workspaces, activeWorkspaceId);
  } catch (error) {
    console.error('Failed to initialize workspaces:', error);
    // Fallback to defaults
    renderWorkspaces(DEFAULT_WORKSPACES, DEFAULT_WORKSPACES[0].id);
  }
}

function setupEventListeners() {
  // Handle workspace item clicks
  document.addEventListener('click', (e) => {
    console.log('Popup clicked:', e.target);
    const workspaceItem = e.target.closest('.workspace');
    if (!workspaceItem) {
      console.log('Clicked element is not a workspace item');
      return;
    }

    console.log('Workspace item clicked:', workspaceItem);
    const workspaceId = workspaceItem.dataset.workspaceId;
    console.log('Workspace ID:', workspaceId);
    if (workspaceId === 'new-workspace') {
      console.log('Creating new workspace');
      createNewWorkspace();
    } else if (workspaceId) {
      console.log('Switching to workspace:', workspaceId);
      switchToWorkspace(workspaceId);
    }
  });

  // Listen for workspace changes from other parts of the extension
  browser.storage.onChanged.addListener((changes, areaName) => {
    console.log('Storage changed:', changes, areaName);
    if (areaName === 'local') {
      if (changes[WORKSPACES_KEY]) {
        const workspaces = changes[WORKSPACES_KEY].newValue || DEFAULT_WORKSPACES;
        const activeWorkspaceId = changes[ACTIVE_WORKSPACE_KEY]?.newValue ||
                                (workspaces.length > 0 ? workspaces[0].id : null);
        renderWorkspaces(workspaces, activeWorkspaceId);
      }
      if (changes[ACTIVE_WORKSPACE_KEY]) {
        const activeWorkspaceId = changes[ACTIVE_WORKSPACE_KEY].newValue;
        updateActiveWorkspace(activeWorkspaceId);
      }
    }
  });
}

function renderWorkspaces(workspaces, activeWorkspaceId) {
  const container = document.body;
  // Clear existing workspace items (keep header and HR)
  container.querySelectorAll('.workspace:not([data-workspace-id="new-workspace"])').forEach(el => el.remove());

  // Insert workspace items before the HR and new workspace item
  const hrElement = container.querySelector('hr');

  workspaces.forEach(workspace => {
    const workspaceElement = document.createElement('div');
    workspaceElement.className = 'workspace';
    workspaceElement.dataset.workspaceId = workspace.id;
    if (workspace.id === activeWorkspaceId) {
      workspaceElement.classList.add('active');
    }
    workspaceElement.innerHTML = `
      <span class="icon">${workspace.icon}</span>
      <span>${workspace.name}</span>
    `;
    container.insertBefore(workspaceElement, hrElement);
  });
}

function updateActiveWorkspace(activeWorkspaceId) {
  document.querySelectorAll('.workspace[data-workspace-id]').forEach(el => {
    const workspaceId = el.dataset.workspaceId;
    if (workspaceId === 'new-workspace') return;

    if (workspaceId === activeWorkspaceId) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

async function switchToWorkspace(workspaceId) {
  try {
    console.log('Switching to workspace:', workspaceId);
    // Get all tabs
    const tabs = await browser.tabs.query({});
    console.log('Tabs query result:', tabs.length, 'tabs');

    // Group tabs by window
    const windows = {};
    tabs.forEach(tab => {
      if (!tab.windowId) return;
      if (!windows[tab.windowId]) {
        windows[tab.windowId] = [];
      }
      windows[tab.windowId].push(tab);
    });

    // For simplicity, we'll focus on the current window
    const currentWindow = await browser.windows.getCurrent({ populate: true });
    if (!currentWindow || !currentWindow.tabs) {
      console.error('Could not get current window tabs');
      showNotification('Error: Could not get current window', true);
      return;
    }

    // In a real implementation, we would:
    // 1. Check if a tab group for this workspace exists
    // 2. If not, create it
    // 3. Move relevant tabs to that group
    // 4. Switch to that group

    // For now, we'll just update the active workspace state
    await browser.storage.local.set({ [ACTIVE_WORKSPACE_KEY]: workspaceId });
    console.log('Set active workspace to:', workspaceId);

    // Show a brief notification
    showNotification(`Switched to ${getWorkspaceName(workspaceId)} workspace`);
  } catch (error) {
    console.error('Failed to switch workspace:', error);
    showNotification('Error switching workspace', true);
  }
}

async function createNewWorkspace() {
  try {
    console.log('Creating new workspace');
    const result = await browser.storage.local.get(WORKSPACES_KEY);
    const workspaces = result[WORKSPACES_KEY] || DEFAULT_WORKSPACES;
    console.log('Current workspaces:', workspaces);

    // Generate a new workspace ID
    const newId = `workspace-${Date.now()}`;
    const newWorkspace = {
      id: newId,
      name: 'New Workspace',
      icon: '📁'
    };

    // Add to workspaces list
    const updatedWorkspaces = [...workspaces, newWorkspace];

    // Save updated workspaces
    await browser.storage.local.set({ [WORKSPACES_KEY]: updatedWorkspaces });
    console.log('Saved updated workspaces');

    // Set as active workspace
    await browser.storage.local.set({ [ACTIVE_WORKSPACE_KEY]: newId });
    console.log('Set active workspace to new workspace');

    showNotification('Created new workspace');
  } catch (error) {
    console.error('Failed to create workspace:', error);
    showNotification('Error creating workspace', true);
  }
}

function getWorkspaceName(workspaceId) {
  const workspaceMap = {
    personal: 'Personal',
    work: 'Work',
    research: 'Research'
  };
  return workspaceMap[workspaceId] || workspaceId;
}

function showNotification(message, isError = false) {
  console.log('Showing notification:', message, isError ? '(error)' : '');
  // Remove any existing notifications
  const existingNotification = document.querySelector('.workspace-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `workspace-notification ${isError ? 'error' : ''}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${isError ? '#ff6b6b' : '#4ecdc4'};
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  `;

  document.body.appendChild(notification);

  // Trigger reflow to enable transition
  void notification.offsetWidth;

  // Show notification
  notification.style.opacity = '1';

  // Hide after delay
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 1500);
}
