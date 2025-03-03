import Oniform from "./components/oniform.ts";

declare global {
    interface Window {
        oniformInstance: Oniform;
    }
}

const initForm = () => {
    const app = document.getElementById("app");
    const form = Oniform.instance;
    app!.appendChild(form.render());
    window.oniformInstance = form; // Attach the instance to the window object
}

document.addEventListener("DOMContentLoaded", initForm);