// GitHub API Interactor
const GITHUB_REPO = 'Datnya/controlavander-a';
const GITHUB_FILE_PATH = 'licenses.json';

window.githubAPI = {
  getToken: () => localStorage.getItem('gh_token'),
  setToken: (token) => localStorage.setItem('gh_token', token),
  
  hasToken: () => !!localStorage.getItem('gh_token'),

  // Call GitHub API
  _callAPI: async (method, repoPath, body = null) => {
    const token = window.githubAPI.getToken();
    if (!token) throw new Error('No GitHub token configured');

    const headers = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const url = `https://api.github.com/repos/${repoPath}/contents/${GITHUB_FILE_PATH}`;
    
    // Add cache buster for GET
    const finalUrl = method === 'GET' ? `${url}?t=${Date.now()}` : url;

    try {
      const response = await fetch(finalUrl, options);
      if (!response.ok) {
        if (response.status === 404) {
          return { exists: false }; // File might not exist yet
        }
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  // Read licenses.json
  getLicensesFile: async (repoPath) => {
    try {
      const data = await window.githubAPI._callAPI('GET', repoPath);
      if (data.exists === false) {
        return { sha: null, content: { licenses: [] } };
      }
      
      // Content is base64 encoded
      // Handle utf8 properly
      const decodedContent = decodeURIComponent(escape(atob(data.content)));
      return {
        sha: data.sha,
        content: JSON.parse(decodedContent)
      };
    } catch (e) {
      console.error('Error reading licenses.json', e);
      throw e;
    }
  },

  // Write licenses.json
  updateLicensesFile: async (repoPath, contentObj, sha, commitMessage = 'Update licenses via Gestor') => {
    try {
      // Encode to base64 properly handling utf8
      const jsonString = JSON.stringify(contentObj, null, 2);
      const encodedContent = btoa(unescape(encodeURIComponent(jsonString)));

      const body = {
        message: commitMessage,
        content: encodedContent,
        sha: sha // required for updates
      };

      const result = await window.githubAPI._callAPI('PUT', repoPath, body);
      return result.content.sha;
    } catch (e) {
      console.error('Error writing licenses.json', e);
      throw e;
    }
  },

  // Helper to add a single license
  addLicense: async (repoPath, licenseObj) => {
    const file = await window.githubAPI.getLicensesFile(repoPath);
    let content = file.content;
    
    // Initialize if empty
    if (!content.licenses) content.licenses = [];
    
    // Check if code already exists
    const exists = content.licenses.find(l => l.code === licenseObj.code);
    if (exists) throw new Error('El código de licencia ya existe en GitHub');
    
    content.licenses.push(licenseObj);
    
    await window.githubAPI.updateLicensesFile(repoPath, content, file.sha, `Añadida licencia: ${licenseObj.code}`);
    return true;
  },
  
  // Check if a device code is already used in GitHub
  isDeviceUsed: async (repoPath, deviceCode) => {
    if (!deviceCode || deviceCode === "") return false;
    const file = await window.githubAPI.getLicensesFile(repoPath);
    const licenses = file.content.licenses || [];
    return licenses.some(l => l.activated_device === deviceCode);
  }
};
