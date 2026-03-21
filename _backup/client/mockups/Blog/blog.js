document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top button visibility
    const scrollBtn = document.querySelector('.scrollToTop');
    if (scrollBtn) {
        scrollBtn.style.display = 'none'; // Initialize as hidden
        
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollBtn.style.display = 'flex';
            } else {
                scrollBtn.style.display = 'none';
            }
        });

        // Add click event for smooth scrolling
        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Mobile Menu Toggle (Simple implementation)
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            alert('Menu mobile functionality would go here. (Replicating style only)');
            // In a real implementation, this would toggle a sidebar or dropdown
        });
    }

    // Active state for current page in menu
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.ulmn a');
    
    menuLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Load More Button Event Listener
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            fetchPetBlogs(currentPage + 1);
        });
    }

    // Fetch Blog Posts from Dev.to API
    fetchPetBlogs();
});

let currentPage = 1;
const perPage = 12;
let isLoading = false;
const fallbackImage = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

async function fetchPetBlogs(page = 1) {
    if (isLoading) return;
    isLoading = true;
    
    const blogContainer = document.getElementById('blog-container');
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (!blogContainer) return;

    // Update button state
    if (loadMoreBtn && page > 1) {
        const originalText = loadMoreBtn.textContent;
        loadMoreBtn.textContent = 'Đang tải...';
        loadMoreBtn.disabled = true;
    }

    try {
        // Fetch articles with tag 'pets'
        const response = await fetch(`https://dev.to/api/articles?tag=pets&per_page=${perPage}&page=${page}`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const articles = await response.json();
        
        isLoading = false;

        // Reset button state
        if (loadMoreBtn) {
            loadMoreBtn.textContent = 'Xem thêm bài viết';
            loadMoreBtn.disabled = false;
        }

        if (page === 1) {
            blogContainer.innerHTML = '';
        }

        if (articles.length === 0) {
            if (page === 1) {
                blogContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;">Không tìm thấy bài viết nào.</div>';
                if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            } else {
                if (loadMoreBtn) {
                    loadMoreBtn.textContent = 'Đã hết bài viết';
                    loadMoreBtn.disabled = true;
                    // Optionally hide after a delay or keep it as status
                }
            }
            return;
        }

        currentPage = page;

        articles.forEach(article => {
            const articleElement = createBlogCard(article);
            blogContainer.appendChild(articleElement);
        });

        // Show load more button if we got a full page, otherwise hide it
        if (loadMoreContainer) {
            loadMoreContainer.style.display = articles.length < perPage ? 'none' : 'block';
        }

    } catch (error) {
        console.error('Error fetching blogs:', error);
        isLoading = false;
        
        if (loadMoreBtn) {
            loadMoreBtn.textContent = 'Thử lại';
            loadMoreBtn.disabled = false;
        }

        if (page === 1) {
            blogContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: red;">
                    <p>Đã xảy ra lỗi khi tải bài viết.</p>
                    <button onclick="fetchPetBlogs(1)" style="margin-top: 10px; padding: 8px 16px; cursor: pointer;">Thử lại</button>
                </div>
            `;
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        }
    }
}

function createBlogCard(article) {
    const div = document.createElement('div');
    div.className = 'product';
    
    // Determine image source
    // Use social_image as primary if cover_image is null
    const imageSrc = article.cover_image || article.social_image || fallbackImage;
    
    const formattedDate = new Date(article.published_at).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    div.innerHTML = `
        <div class="pic-product">
            <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                <img src="${imageSrc}" alt="${article.title}" loading="lazy" 
                     onerror="this.onerror=null; this.src='${fallbackImage}';">
            </a>
        </div>
        <div class="info-product">
            <h3 class="name-product">
                <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                    ${article.title}
                </a>
            </h3>
            <div style="font-size: 12px; color: #999; margin-bottom: 5px;">
                <span>${formattedDate}</span> • <span>${article.user.name}</span>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 10px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                ${article.description || 'Không có mô tả.'}
            </p>
            <p class="price-product">
                <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="price-new" style="text-decoration: none;">
                    Đọc tiếp →
                </a>
            </p>
        </div>
    `;

    return div;
}
