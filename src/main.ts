// src/main.ts
export default {
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        switch (url.pathname) {
            case "/":
            case "/index.html":
                const indexHtml = await import("../dist/index.html?raw");
                return new Response(indexHtml.default, {
                    headers: { "Content-Type": "text/html" },
                });
            case "/readme":
            case "/readme.html":
                const readmeHtml = await import("../dist/readme.html?raw");
                return new Response(readmeHtml.default, {
                    headers: { "Content-Type": "text/html" },
                });
            case "/faq":
            case "/faq.html":
                const faqHtml = await import("../dist/faq.html?raw");
                return new Response(faqHtml.default, {
                    headers: { "Content-Type": "text/html" },
                });
            case "/client.js":
                const clientScript = await import("../dist/client.js");
                return new Response(clientScript.default, {
                    headers: { "Content-Type": "application/javascript" },
                });
            case "/assets/minus.svg":
                const svg = await import("../dist/assets/minus.svg?url");
                return new Response(svg.default, {
                    headers: { "Content-Type": "image/svg+xml" },
                });
            default:
                return new Response("Not Found", { status: 404 });
        }
    },
};
