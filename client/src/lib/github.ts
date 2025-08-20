export interface GitHubFile {
  name: string;
  path: string;
  download_url: string;
  html_url: string;
  type: 'file' | 'dir';
}

export interface AppMetadata {
  displayName: string;
  description: string;
  category: string;
  version: string;
  icon?: string;
  stars?: string;
  dependencies?: string[];
}

export async function fetchGitHubFiles(repo: string, path: string = ''): Promise<GitHubFile[]> {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub files: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchFileContent(downloadUrl: string): Promise<string> {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file content: ${response.statusText}`);
  }
  
  return response.text();
}

export function parseRepoUrl(githubUrl: string): string {
  // Extract owner/repo from GitHub URL
  const match = githubUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub repository URL');
  }
  return match[1];
}
