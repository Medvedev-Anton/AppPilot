import { useState, useEffect } from "react";
import { html as beautifyHtml, js as beautifyJs, css as beautifyCss } from 'js-beautify';

interface ProjectFile {
  path: string;
  content: string;
}

interface Project {
  projectName: string;
  description?: string;
  files: ProjectFile[];
}

interface ProjectViewProps {
  project: Project;
}

export default function ProjectView({ project }: ProjectViewProps) {
  const [selectedFile, setSelectedFile] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showLineNumbers, setShowLineNumbers] = useState(window.innerWidth >= 768);

  if (!project || !project.files || project.files.length === 0) {
    return null;
  }

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.min(Math.max(200, e.clientX - 50), 500);
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      setShowLineNumbers(!mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(project.files[selectedFile].content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const getFileIcon = (path: string) => {
    const ext = path.split('.').pop();
    const icons: Record<string, string> = {
      'js': '📜',
      'jsx': '⚛️',
      'ts': '📘',
      'tsx': '⚛️',
      'html': '🌐',
      'css': '🎨',
      'json': '📋',
      'md': '📝'
    };
    return icons[ext || ''] || '📄';
  };

  const formatCode = (content: string, path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    
    try {
      if (ext === 'json') {
        const parsed = JSON.parse(content);
        return JSON.stringify(parsed, null, 2);
      }
      
      if (ext === 'html' || ext === 'htm') {
        return beautifyHtml(content, {
          indent_size: 2,
          wrap_line_length: 80,
          preserve_newlines: true,
          max_preserve_newlines: 2
        });
      }
      
      if (ext === 'css') {
        return beautifyCss(content, {
          indent_size: 2,
          preserve_newlines: true,
          max_preserve_newlines: 2
        });
      }
      
      if (['js', 'jsx', 'ts', 'tsx'].includes(ext || '')) {
        return beautifyJs(content, {
          indent_size: 2,
          preserve_newlines: true,
          max_preserve_newlines: 2,
          space_after_anon_function: true
        });
      }
    } catch {}
    
    return content;
  };

  const getFormattedContent = () => {
    const content = project.files[selectedFile].content;
    const formatted = formatCode(content, project.files[selectedFile].path);
    const lines = formatted.split('\n');
    
    return lines;
  };

  return (
    <div className="project-view">
      <div className="project-header">
        <div className="project-info">
          <h3>{project.projectName}</h3>
          {project.description && <p>{project.description}</p>}
        </div>
        <div className="project-stats">
          <span className="file-count">{project.files.length} files</span>
        </div>
      </div>

      <div className="project-body">
        <div className="file-explorer" 
          style={{ width: isMobileView ? '100%' : `${sidebarWidth}px` }}
        >
          <div className="explorer-header">Files</div>
          <ul className="file-tree">
            {project.files.map((file, index) => (
              <li
                key={index}
                className={selectedFile === index ? "active" : ""}
                onClick={() => setSelectedFile(index)}
              >
                <span className="file-icon">{getFileIcon(file.path)}</span>
                <span className="file-name">{file.path}</span>
              </li>
            ))}
          </ul>
        </div>

        {!isMobileView && (
          <div 
            className="resizer" 
            onMouseDown={handleMouseDown}
            style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
          />
        )}

        <div className="code-viewer">
          <div className="viewer-header">
            <span className="file-path">{project.files[selectedFile].path}</span>
            <div className="viewer-actions">
              {isMobileView && (
                <button
                  onClick={() => setShowLineNumbers(!showLineNumbers)}
                  className="toggle-lines-button"
                  title={showLineNumbers ? "Hide" : "Show"}
                >
                  {showLineNumbers ? "#" : "№"}
                </button>
              )}
              <button
                onClick={handleCopy}
                className={`copy-button ${copied ? 'copied' : ''}`}
                title="Copy code"
              >
                <span className="icon">{copied ? '✓' : '⎘'}</span>
                <span className="text">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <div className="code-container">
            <div className="code-block">
              {showLineNumbers && (
                <div className="line-numbers">
                  {getFormattedContent().map((_, index) => (
                    <div key={index} className="line-number">{index + 1}</div>
                  ))}
                </div>
              )}
              <pre className="code-content">
                <code>{getFormattedContent().join('\n')}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
