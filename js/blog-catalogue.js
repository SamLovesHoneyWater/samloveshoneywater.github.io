// Blog catalogue system for displaying all blog posts
class BlogCatalogue {
    constructor() {
        this.posts = [];
        this.postsLoaded = false;
    }

    // Initialize the blog catalogue
    async init() {
        await this.loadAllPosts();
        this.renderPostList();
    }

    // Load all blog posts from the posts directory
    async loadAllPosts() {
        // List of available post files (in a real implementation, this could be dynamic)
        const postFiles = [
            'neurogenesis.md',
            'game-balance.md',
            'urban-planning.md'
        ];

        for (const filename of postFiles) {
            try {
                const response = await fetch(`posts/${filename}`);
                if (response.ok) {
                    const content = await response.text();
                    const post = this.parseMarkdown(content);
                    post.slug = filename.replace('.md', '');
                    this.posts.push(post);
                }
            } catch (error) {
                console.error(`Failed to load post: ${filename}`, error);
            }
        }

        // Sort posts by date (newest first)
        this.posts.sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date));
        this.postsLoaded = true;
    }

    // Parse markdown content and extract frontmatter
    parseMarkdown(content) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);
        
        if (!match) {
            return { metadata: {}, content: content };
        }

        const frontmatter = match[1];
        const markdownContent = match[2];
        
        // Parse frontmatter (simple YAML parsing)
        const metadata = {};
        frontmatter.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
                metadata[key] = value;
            }
        });

        return {
            metadata,
            content: markdownContent
        };
    }

    // Render the list of blog posts
    renderPostList() {
        const container = document.getElementById('blog-list-container');
        
        if (!this.postsLoaded || this.posts.length === 0) {
            container.innerHTML = '<div class="loading">No blog posts found.</div>';
            return;
        }

        let html = '';
        
        this.posts.forEach(post => {
            const { metadata } = post;
            html += `
                <a href="blog.html#${post.slug}" class="blog-item">
                    <div class="blog-category">${metadata.category ? metadata.category.toUpperCase() : 'BLOG'}</div>
                    <h2 class="blog-title">${metadata.title || 'Untitled'}</h2>
                    <p class="blog-excerpt">${metadata.excerpt || 'No excerpt available.'}</p>
                    <div class="blog-meta">
                        ${this.formatDate(metadata.date)} • ${metadata.readTime || 'Read time unknown'}
                    </div>
                </a>
            `;
        });

        container.innerHTML = html;
    }

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return 'Date unknown';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

// Initialize blog catalogue when DOM is loaded
const blogCatalogue = new BlogCatalogue();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => blogCatalogue.init());
} else {
    blogCatalogue.init();
}
