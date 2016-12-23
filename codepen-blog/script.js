'use strict'

class Navigation {
    constructor() {
        console.log('Navigation constructor');

        this._onItemClick = this._onItemClick.bind(this);

        this.items = document.querySelectorAll('.navigation a');
        this.active = document.querySelector('.navigation li.active');

        this.items.forEach(item => {
            item.addEventListener('click', this._onItemClick);
        });
    }

    _onItemClick(evt) {
        evt.preventDefault();

        const a = evt.target;
        const li = a.parentElement;

        if (this.active === li) {
            return;
        }

        // deactivate old item
        if (this.active) {
            this.active.classList.remove('active');
        }

        // activate new item
        li.classList.add('active');
        this.active = li;

        // navigation request
        let link = a.getAttribute('href');
        let viewName = link.substring(1);
        const navRequestEvent = new CustomEvent('nav-request', {
            detail: viewName
        });
        document.dispatchEvent(navRequestEvent);
    }
}

class ViewOutlet {
    constructor() {
        console.log('ViewOutlet constructor');

        this._onNavRequest = this._onNavRequest.bind(this);

        this.active = document.querySelector('main > section.active');
        document.addEventListener('nav-request', this._onNavRequest);
    }

    _onNavRequest(evt) {
        let view = evt.detail;
        if (this.active && view === this.active.id) {
            return;
        }

        // deactivate old view
        if (this.active) {
            this.active.classList.remove('active');
        }

        // activate new view
        this.active = document.querySelector(`#${view}`);
        this.active.classList.add('active');
        const viewChangedEvent = new CustomEvent('view-changed', {
            detail: view
        });
        document.dispatchEvent(viewChangedEvent);

        // focus management
        let h1 = this.active.querySelector('h1[tabindex="-1"]');
        h1.focus();
    }
}

class Blog {
    constructor() {
        console.log('Blog constructor');
        this._initialized = false;
    }

    init() {
        if (this._initialized) {
            return;
        }
        this._initialized = true;
        console.log('Blog init');
        this.getAndDisplayPosts();
    }

    async getAndDisplayPosts() {
        let posts = await this.getPosts();
        requestAnimationFrame(_ => this.displayPosts(posts));
    }

    async getPosts() {
        let response = await fetch('https://jacekkosciesza-659f4.firebaseio.com/posts.json');
        let posts = await response.json();
        console.log(`Blog - ${posts.length} posts fetched`);
        return posts;
    }

    displayPosts(posts) {
        let tmpl = document.querySelector('#post-tmpl');
        let ul = document.querySelector('#blog ul');
        posts.forEach(post => {
            let postTmpl = tmpl.content.cloneNode(true);
            // TODO: {{}} interpolation
            let a = postTmpl.querySelector('a');
            a.href = post.url;
            a.innerText = post.title;
            ul.appendChild(postTmpl);
        });
    }
}

window.addEventListener('load', _ => {
    const navigation = new Navigation();
    const viewOutlet = new ViewOutlet();
    const blog = new Blog();

    document.addEventListener('view-changed', evt => {
        switch (evt.detail) {
            case 'blog':
                blog.init();
                break;
            default:
                break;
        }
    });
});