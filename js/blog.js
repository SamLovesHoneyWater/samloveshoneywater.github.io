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
        // Embedded post content to avoid CORS issues with file:// protocol
        const postContents = {
            'neurogenesis': `---
title: "Simulating Neurogenesis for Machine Learning"
date: "2025-01-01"
category: "AI & Neural Networks"
excerpt: "Exploring how biological neural development can inspire new approaches to artificial neural network architecture and training."
readTime: "3 min read"
slug: "neurogenesis"
---

# Simulating Neurogenesis for Machine Learning

The human brain's ability to continuously generate new neurons throughout life—a process called neurogenesis—has fascinated neuroscientists for decades. But what if we could harness this biological phenomenon to create more adaptive artificial neural networks?

Traditional neural networks are static structures: once trained, their architecture remains fixed. This fundamentally differs from how biological brains operate, which are dynamic and constantly rewiring based on experience.

## Dynamic Network Growth

My research explores networks that can dynamically add new nodes during training, not just adjust weights. New nodes are added when existing networks reach saturation or when learning plateaus suggest architectural limitations.

This approach shows promising results in continual learning scenarios, where networks maintain performance on old tasks while learning new ones—reducing the catastrophic forgetting problem that plagues traditional architectures.

The implications extend beyond technical improvements. By more closely mimicking biological intelligence, we might develop AI systems that are more robust and capable of the flexible learning that characterizes human cognition.`,

            'game-balance': `---
title: "The Mathematics of Board Game Balance"
date: "2024-12-28"
category: "Games & Strategy"
excerpt: "Analyzing game mechanics through the lens of mathematical optimization and player psychology."
readTime: "2 min read"
slug: "game-balance"
---

# The Mathematics of Board Game Balance

What makes a board game truly balanced? The answer lies at the intersection of mathematics, psychology, and systems design. A well-balanced game creates tension without frustration and ensures that skill matters more than luck—but not so much that newcomers can't compete.

Game balance isn't simply about ensuring all players have equal chances of winning. True balance encompasses strategic balance (multiple viable paths to victory), tactical balance (meaningful short-term decisions), and resource balance (no single resource dominates).

## Nash Equilibrium in Design

One powerful concept from game theory is the Nash equilibrium—a state where no player can improve their outcome by unilaterally changing strategy. In board game design, we want to avoid dominant strategies that create equilibria too early in the decision tree.

The mathematical challenge is tuning the payoff matrix so that each strategy has situational advantages. In a well-balanced game, the optimal strategy should depend on what opponents are doing and the current game state—not on a single dominant approach.

Modern game design increasingly relies on computational methods to achieve balance. Monte Carlo simulations can play thousands of games with different parameter settings, allowing designers to optimize for specific outcomes like target game length and win rate distribution.

While mathematics provides powerful tools for analyzing game balance, the best games still require human intuition and creativity. Numbers can tell us whether a game is balanced, but they can't tell us whether it's fun.`,

            'urban-planning': `---
title: "Urban Planning as Cognitive Architecture"
date: "2024-12-15"
category: "Philosophy & Society"
excerpt: "How the design of our cities shapes the way we think, interact, and form communities."
readTime: "3 min read"
slug: "urban-planning"
---

# Urban Planning as Cognitive Architecture

Every morning, millions of people navigate through urban environments that silently shape their thoughts, decisions, and social interactions. The layout of streets, the height of buildings, the placement of parks—these aren't just aesthetic choices. They're cognitive interventions that influence how we process information and form relationships.

Urban planning is a form of cognitive architecture—the design of external structures that scaffold and shape internal mental processes. Cities extend our social cognition in the same way smartphones extend our memory.

## The Extended Mind

Philosophers Andy Clark and David Chalmers introduced the concept of the "extended mind"—the idea that our cognitive processes don't stop at the boundaries of our skulls but extend into the tools and environments we use.

Consider how different urban layouts encourage different types of thinking: grid systems promote efficient navigation but reduce serendipitous encounters, while winding streets slow movement and encourage exploration. Central plazas create focal points for community gathering, and mixed-use neighborhoods integrate different aspects of life.

## Designing for Cognition

Research in environmental psychology suggests there's an optimal density for human social cognition—not too sparse (leading to isolation) and not too dense (leading to overstimulation). Jane Jacobs observed that successful neighborhoods require diversity, appropriate density, permeability, and human-scaled spaces.

As our understanding of the relationship between environment and cognition deepens, we have the opportunity to design cities that actively enhance human mental capabilities. The future of urban planning lies not just in creating efficient cities, but in creating cities that make us smarter and more connected to one another.`
        };
        
        for (const [slug, content] of Object.entries(postContents)) {
            try {
                const post = this.parseMarkdown(content);
                post.slug = slug;
                this.posts.push(post);
            } catch (error) {
                console.error(`Failed to parse post: ${slug}`, error);
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
