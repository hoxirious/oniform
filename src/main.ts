export default {
    async fetch(req: Request): Promise<Response> {
        const url = new URL(req.url);

        // Handle HTML routes separately
        if (url.pathname === "/readme") {
            return fetch(`${url.origin}/readme.html`);
        }

        if (url.pathname === "/faq") {
            return fetch(`${url.origin}/faq.html`);
        }

        // Default to serving static assets or index.html
        return fetch(req);
    }
};
