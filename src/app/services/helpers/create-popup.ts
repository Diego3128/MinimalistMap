import { Popup } from "@maptiler/sdk";

export const createCustomPopUp = (label: string, offset?: number): Popup => {
  const popupHTML = document.createElement("DIV");
  popupHTML.classList.add("popup-label");
  popupHTML.innerText = label;

  const popup = new Popup({ offset: 25 })
    .setDOMContent(popupHTML);
  return popup;
}
