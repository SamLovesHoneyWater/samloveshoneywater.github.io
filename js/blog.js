// Blog system for markdown-based posts
class BlogSystem {
    constructor() {
        this.posts = [];
        this.currentPost = null;
        this.postsLoaded = false;
    }

    // Initialize the blog system
    async init() {
        await this.loadPostsMetadata();
        this.setupRouting();
        this.handleInitialRoute();
    }

    // Load metadata for all posts
    async loadPostsMetadata() {
        // List of available post files
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

    // Convert markdown to HTML (simple implementation)
    markdownToHtml(markdown) {
        let html = markdown;
        
        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Bold and italic
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Paragraphs
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p><h/g, '<h');
        html = html.replace(/<\/h([1-6])><\/p>/g, '</h$1>');
        
        return html;
    }

    // Setup URL routing
    setupRouting() {
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });
    }

    // Handle initial route on page load
    handleInitialRoute() {
        if (window.location.hash) {
            this.handleRoute();
        } else {
            // Load the most recent post by default
            this.loadDefaultPost();
        }
    }

    // Load the most recent post when no specific post is requested
    loadDefaultPost() {
        if (this.posts.length > 0) {
            const mostRecentPost = this.posts[0]; // Posts are already sorted by date
            this.loadPost(mostRecentPost.slug);
            // Update URL to reflect the loaded post
            window.location.hash = mostRecentPost.slug;
        }
    }

    // Handle route changes
    handleRoute() {
        const hash = window.location.hash.substring(1); // Remove #
        
        if (hash) {
            this.loadPost(hash);
        }
    }

    // Load and display a specific post
    async loadPost(slug) {
        const post = this.posts.find(p => p.slug === slug);
        
        if (!post) {
            console.error(`Post not found: ${slug}`);
            return;
        }

        this.currentPost = post;
        this.renderPost(post);
    }

    // Render a post to the page
    renderPost(post) {
        const { metadata, content } = post;
        
        // Update page title
        document.title = `${metadata.title} - Sam Huang`;
        
        // Update blog header
        document.querySelector('.blog-category').textContent = metadata.category.toUpperCase();
        document.querySelector('.blog-title').textContent = metadata.title;
        document.querySelector('.blog-meta').textContent = `Published ${this.formatDate(metadata.date)} • ${metadata.readTime}`;
        document.querySelector('.blog-excerpt').textContent = metadata.excerpt;
        
        // Update blog content
        const contentHtml = this.markdownToHtml(content);
        document.querySelector('.blog-content .container').innerHTML = contentHtml + 
            '<div class="back-nav"><a href="index.html#blog" class="back-link">← Back to Blog</a></div>';
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    // Get posts for homepage
    getPosts() {
        return this.posts;
    }

    // Update homepage featured cards
    updateHomepageCards() {
        if (!this.postsLoaded) return;

        const cards = document.querySelectorAll('.featured-card');
        
        this.posts.slice(0, 3).forEach((post, index) => {
            if (cards[index]) {
                const card = cards[index];
                card.href = `blog.html#${post.slug}`;
                
                card.querySelector('.card-category').textContent = post.metadata.category.toUpperCase();
                card.querySelector('.card-title').textContent = post.metadata.title;
                card.querySelector('.card-excerpt').textContent = post.metadata.excerpt;
                card.querySelector('.card-meta').textContent = `${this.formatDate(post.metadata.date)} • ${post.metadata.readTime}`;
            }
        });
    }
}

// Initialize blog system
const blogSystem = new BlogSystem();

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => blogSystem.init());
} else {
    blogSystem.init();
}

// Make blogSystem available globally for homepage
window.blogSystem = blogSystem;
