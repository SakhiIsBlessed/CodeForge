import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Project, ProjectFile, ProjectLanguage, ProjectVisibility } from '../types';

export const TEMPLATES: Record<
  ProjectLanguage,
  { name: string; description: string; files: { name: string; path: string; content: string; language: string }[] }
> = {
  javascript: {
    name: 'JavaScript Node Sandbox',
    description: 'Modern JavaScript playground with async/await and array utilities.',
    files: [
      {
        name: 'index.js',
        path: '/index.js',
        language: 'javascript',
        content: `// Welcome to CodeForge JavaScript Sandbox!
function calculateFibonacci(n) {
  const sequence = [0, 1];
  for (let i = 2; i < n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }
  return sequence;
}

console.log("🚀 Initializing CodeForge Runtime...");
console.log("Generating first 10 Fibonacci numbers:");
console.table(calculateFibonacci(10));
console.log("✅ Execution finished successfully.");
`,
      },
      {
        name: 'utils.js',
        path: '/utils.js',
        language: 'javascript',
        content: `export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
`,
      },
    ],
  },
  typescript: {
    name: 'TypeScript Algorithm Suite',
    description: 'Strict TypeScript playground with interfaces and typed structures.',
    files: [
      {
        name: 'index.ts',
        path: '/index.ts',
        language: 'typescript',
        content: `// CodeForge TypeScript Environment
interface BenchmarkResult<T> {
  data: T;
  durationMs: number;
}

function runBenchmark<T>(label: string, fn: () => T): BenchmarkResult<T> {
  const start = performance.now();
  const data = fn();
  const durationMs = performance.now() - start;
  console.log(\`[\${label}] completed in \${durationMs.toFixed(3)}ms\`);
  return { data, durationMs };
}

const primes = runBenchmark("Find Primes up to 100", () => {
  const res: number[] = [];
  for (let i = 2; i <= 100; i++) {
    let isPrime = true;
    for (let j = 2; j * j <= i; j++) {
      if (i % j === 0) { isPrime = false; break; }
    }
    if (isPrime) res.push(i);
  }
  return res;
});

console.log("Primes found:", primes.data.join(', '));
`,
      },
    ],
  },
  python: {
    name: 'Python Practice',
    description: 'Python algorithm practice and data processing script.',
    files: [
      {
        name: 'main.py',
        path: '/main.py',
        language: 'python',
        content: `# Python Practice Environment
import sys

def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

if __name__ == "__main__":
    test_data = [64, 34, 25, 12, 22, 11, 90]
    print("CodeForge Python Sandbox v3.12")
    print(f"Unsorted array: {test_data}")
    sorted_data = merge_sort(test_data)
    print(f"Sorted array:   {sorted_data}")
`,
      },
    ],
  },
  java: {
    name: 'Java Calculator',
    description: 'Object-oriented Java math and calculator program.',
    files: [
      {
        name: 'Main.java',
        path: '/src/Main.java',
        language: 'java',
        content: `package src;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== CodeForge Java Calculator ===");
        double a = 42.5;
        double b = 7.5;
        System.out.printf("Addition:       %.2f + %.2f = %.2f%n", a, b, (a + b));
        System.out.printf("Multiplication: %.2f * %.2f = %.2f%n", a, b, (a * b));
        System.out.printf("Division:       %.2f / %.2f = %.2f%n", a, b, (a / b));
        System.out.println("Status: Java execution completed with code 0");
    }
}
`,
      },
    ],
  },
  cpp: {
    name: 'DSA Practice',
    description: 'High performance C++ data structure and algorithm implementation.',
    files: [
      {
        name: 'main.cpp',
        path: '/main.cpp',
        language: 'cpp',
        content: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int binarySearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    cout << "=== CodeForge C++ DSA Engine ===" << endl;
    vector<int> nums = {3, 9, 14, 19, 25, 33, 42, 57, 88};
    int target = 42;
    int index = binarySearch(nums, target);
    cout << "Target element " << target << " found at index: " << index << endl;
    return 0;
}
`,
      },
    ],
  },
  html: {
    name: 'Portfolio Website',
    description: 'Full stack interactive web application with HTML, CSS, and JavaScript.',
    files: [
      {
        name: 'index.html',
        path: '/index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Developer Portfolio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <header>
      <div class="badge">Available for Work</div>
      <h1>Hello, I'm <span class="highlight">Alex Rivera</span></h1>
      <p class="subtitle">Full-stack software architect building fast, resilient cloud apps.</p>
    </header>
    
    <main>
      <div class="card">
        <h3>Featured Project</h3>
        <p>Real-time distributed compilation engine with microsecond latency.</p>
        <button id="counterBtn" class="btn">⭐ Click to Star (<span id="count">0</span>)</button>
      </div>
    </main>
  </div>
  <script src="script.js"></script>
</body>
</html>
`,
      },
      {
        name: 'style.css',
        path: '/style.css',
        language: 'css',
        content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.container {
  max-width: 600px;
  padding: 2rem;
  text-align: center;
}
.badge {
  display: inline-block;
  background: #10b981;
  color: #064e3b;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
}
h1 {
  font-size: 2.25rem;
  margin-bottom: 0.5rem;
}
.highlight {
  color: #6366f1;
}
.subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
}
.card {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #1e293b;
  border-radius: 12px;
  border: 1px solid #334155;
}
.btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  transition: transform 0.1s ease;
}
.btn:active {
  transform: scale(0.97);
}
`,
      },
      {
        name: 'script.js',
        path: '/script.js',
        language: 'javascript',
        content: `let stars = 0;
const btn = document.getElementById('counterBtn');
const countSpan = document.getElementById('count');

btn.addEventListener('click', () => {
  stars++;
  countSpan.textContent = stars;
  btn.style.backgroundColor = '#4f46e5';
  setTimeout(() => {
    btn.style.backgroundColor = '#6366f1';
  }, 200);
});
`,
      },
    ],
  },
  rust: {
    name: 'Rust CLI Tool',
    description: 'Safe, concurrent systems program in modern Rust.',
    files: [
      {
        name: 'main.rs',
        path: '/src/main.rs',
        language: 'rust',
        content: `fn main() {
    println!("=== CodeForge Rust Engine ===");
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let sum_of_squares: i32 = numbers
        .iter()
        .filter(|&&x| x % 2 == 0)
        .map(|&x| x * x)
        .sum();
    println!("Sum of even squares: {}", sum_of_squares);
}
`,
      },
    ],
  },
  go: {
    name: 'Go Microservice',
    description: 'Concurrent Go program showcasing goroutines and channels.',
    files: [
      {
        name: 'main.go',
        path: '/main.go',
        language: 'go',
        content: `package main

import (
	"fmt"
	"time"
)

func worker(id int, jobs <-chan int, results chan<- int) {
	for j := range jobs {
		time.Sleep(time.Millisecond * 50)
		results <- j * 2
	}
}

func main() {
	fmt.Println("=== CodeForge Go Runtime ===")
	jobs := make(chan int, 5)
	results := make(chan int, 5)

	go worker(1, jobs, results)

	for j := 1; j <= 5; j++ {
		jobs <- j
	}
	close(jobs)

	for a := 1; a <= 5; a++ {
		fmt.Printf("Job result: %d\\n", <-results)
	}
}
`,
      },
    ],
  },
};

/**
 * Creates a new project in Firestore with starter files
 */
export async function createProject(
  ownerId: string,
  ownerName: string,
  ownerUsername: string,
  name: string,
  description: string,
  language: ProjectLanguage,
  visibility: ProjectVisibility = 'private'
): Promise<Project> {
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const template = TEMPLATES[language] || TEMPLATES.javascript;

  const project: Project = {
    projectId,
    ownerId,
    ownerName,
    ownerUsername,
    name: name.trim() || template.name,
    description: description.trim() || template.description,
    language,
    visibility,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    isFavorite: false,
    filesCount: template.files.length,
  };

  try {
    // 1. Create project document
    await setDoc(doc(db, 'projects', projectId), project);

    // 2. Create project files
    for (const f of template.files) {
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fileDoc: ProjectFile = {
        fileId,
        projectId,
        name: f.name,
        path: f.path,
        content: f.content,
        language: f.language,
        createdAt: now,
        updatedAt: now,
        size: f.content.length,
      };
      await setDoc(doc(db, 'projects', projectId, 'files', fileId), fileDoc);
    }

    return project;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `projects/${projectId}`);
  }
}

/**
 * Fetch a project by ID
 */
export async function getProject(projectId: string): Promise<Project | null> {
  try {
    const snap = await getDoc(doc(db, 'projects', projectId));
    if (!snap.exists()) return null;
    return snap.data() as Project;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `projects/${projectId}`);
  }
}

/**
 * Update project metadata
 */
export async function updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
  }
}

/**
 * Delete project and subcollection files
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    // Delete files
    const filesSnap = await getDocs(collection(db, 'projects', projectId, 'files'));
    for (const f of filesSnap.docs) {
      await deleteDoc(doc(db, 'projects', projectId, 'files', f.id));
    }
    // Delete project
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `projects/${projectId}`);
  }
}

/**
 * Fetch all files for a project
 */
export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  try {
    const snap = await getDocs(collection(db, 'projects', projectId, 'files'));
    return snap.docs.map((d) => d.data() as ProjectFile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `projects/${projectId}/files`);
  }
}

/**
 * Save / Update a single project file
 */
export async function saveProjectFile(
  projectId: string,
  fileId: string,
  content: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'projects', projectId, 'files', fileId), {
      content,
      size: content.length,
      updatedAt: new Date().toISOString(),
    });
    // Also update parent project's updatedAt
    await updateDoc(doc(db, 'projects', projectId), {
      updatedAt: new Date().toISOString(),
    }).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}/files/${fileId}`);
  }
}

/**
 * Create a new file inside a project
 */
export async function createProjectFile(
  projectId: string,
  name: string,
  path: string,
  language: string,
  content = ''
): Promise<ProjectFile> {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const file: ProjectFile = {
    fileId,
    projectId,
    name,
    path: path.startsWith('/') ? path : `/${path}`,
    content,
    language,
    createdAt: now,
    updatedAt: now,
    size: content.length,
  };

  try {
    await setDoc(doc(db, 'projects', projectId, 'files', fileId), file);
    return file;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `projects/${projectId}/files/${fileId}`);
  }
}

/**
 * Delete a file inside a project
 */
export async function deleteProjectFile(projectId: string, fileId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'projects', projectId, 'files', fileId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `projects/${projectId}/files/${fileId}`);
  }
}

/**
 * Duplicate / Fork a project into a user's workspace
 */
export async function forkProject(
  sourceProjectId: string,
  newOwnerId: string,
  newOwnerName: string,
  newOwnerUsername: string,
  customName?: string
): Promise<Project> {
  const source = await getProject(sourceProjectId);
  if (!source) throw new Error('Source project not found');

  const sourceFiles = await getProjectFiles(sourceProjectId);
  const newProjectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newProject: Project = {
    projectId: newProjectId,
    ownerId: newOwnerId,
    ownerName: newOwnerName,
    ownerUsername: newOwnerUsername,
    name: customName || `Fork of ${source.name}`,
    description: source.description,
    language: source.language,
    visibility: 'private',
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    isFavorite: false,
    filesCount: sourceFiles.length,
  };

  try {
    await setDoc(doc(db, 'projects', newProjectId), newProject);
    for (const f of sourceFiles) {
      const newFileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await setDoc(doc(db, 'projects', newProjectId, 'files', newFileId), {
        ...f,
        fileId: newFileId,
        projectId: newProjectId,
        createdAt: now,
        updatedAt: now,
      });
    }
    return newProject;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `projects/${newProjectId}`);
  }
}

/**
 * Query user projects
 */
export async function fetchUserProjects(userId: string): Promise<Project[]> {
  try {
    const q = query(
      collection(db, 'projects'),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Project);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'projects');
  }
}

/**
 * Query public projects
 */
export async function fetchPublicProjects(limitCount = 20): Promise<Project[]> {
  try {
    const q = query(
      collection(db, 'projects'),
      where('visibility', '==', 'public'),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Project);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'projects');
  }
}
