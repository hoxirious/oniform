import Oniform from "./oniform.ts";

const initForm = () => {
    const app = document.getElementById("app");
    const form = Oniform.instance;
    app.appendChild(form.render());
}

document.addEventListener("DOMContentLoaded", initForm);