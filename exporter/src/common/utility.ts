export const generateGUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function showErrorPopup(message: string, duration: number = 1000) {
    const errorPopup = document.createElement("div");
    errorPopup.textContent = message;
    errorPopup.style.position = "fixed";
    errorPopup.style.right = "2rem";
    errorPopup.style.padding = "0.5rem";
    errorPopup.style.backgroundColor = "#dc3545";
    errorPopup.style.color = "white";
    errorPopup.style.borderRadius = "0.25rem";
    errorPopup.style.boxShadow = "0px 2px 5px rgba(0,0,0,0.3)";
    errorPopup.style.opacity = "0";
    errorPopup.style.zIndex = "1000";
    errorPopup.style.transition = "top 0.75s ease-in-out, opacity 0.25s ease-in-out";

    // Find existing error popups and stack them
    const existingPopups = document.querySelectorAll(".errorPopup");
    const offset = existingPopups.length * 3; // Stack with spacing
    errorPopup.style.top = `${1 + offset}rem`;
    errorPopup.classList.add("errorPopup");

    document.body.appendChild(errorPopup);

    setTimeout(() => {
        errorPopup.style.opacity = "1";
    }, 10);

    setTimeout(() => {
        errorPopup.style.top = "-3rem"; // Slide up when disappearing
        errorPopup.style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(errorPopup);
        }, 500); // Ensure the transition completes before removal
    }, duration);
}


export function showSuccessPopup(message: string, duration: number = 1000) {
    const successPopup = document.createElement("div");
    successPopup.textContent = message;
    successPopup.style.position = "fixed";
    successPopup.style.right = "2rem";
    successPopup.style.padding = "0.5rem";
    successPopup.style.backgroundColor = "#259620";
    successPopup.style.color = "white";
    successPopup.style.borderRadius = "0.25rem";
    successPopup.style.boxShadow = "0px 2px 5px rgba(0,0,0,0.3)";
    successPopup.style.opacity = "0";
    successPopup.style.zIndex = "1000";
    successPopup.style.transition = "top 0.75s ease-in-out, opacity 0.25s ease-in-out";

    // Find existing error popups and stack them
    const existingPopups = document.querySelectorAll(".successPopup");
    const offset = existingPopups.length * 3; // Stack with spacing
    successPopup.style.top = `${1 + offset}rem`;
    successPopup.classList.add("successPopup");

    document.body.appendChild(successPopup);

    setTimeout(() => {
        successPopup.style.opacity = "1";
    }, 10);

    setTimeout(() => {
        successPopup.style.top = "-3rem"; // Slide up when disappearing
        successPopup.style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(successPopup);
        }, 500); // Ensure the transition completes before removal
    }, duration);
}

export function createListItem(button: HTMLButtonElement): HTMLLIElement {
    const listItem = document.createElement("li");
    listItem.appendChild(button);
    return listItem;
}

export function animateHighlight(element: HTMLElement, duration: number = 500) {
    element.animate(
        [
            { backgroundColor: "rgba(196,196,196,0.2)", boxShadow: "0px 3px 5px 2px rgba(169, 169, 169, 0.4)", borderRadius: "0.25rem" },
            { backgroundColor: "transparent", boxShadow: "0px 3px 5px 2px rgba(169, 169, 169, 0)", borderRadius: "0.25rem" },
        ],
        { duration: duration, iterations: 1}
    );
}