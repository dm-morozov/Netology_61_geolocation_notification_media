export default class Modal {
  // класс Modal, будет управлять модальным окном.
  // Его главная задача - появляться, когда
  // Geolocation API не может определить
  // координаты, и позволять пользователю
  // ввести их вручную.

  private modalElement: HTMLElement;
  private coordsInput: HTMLInputElement;
  private cancelGeoposition: HTMLButtonElement;
  private okGeoposition: HTMLButtonElement;

  constructor() {
    this.modalElement = document.querySelector(
      "#modal-geoposition",
    ) as HTMLElement;
    this.coordsInput = document.querySelector(
      "#coords-input",
    ) as HTMLInputElement;
    this.cancelGeoposition = document.querySelector(
      "#cancel-geoposition",
    ) as HTMLButtonElement;
    this.okGeoposition = document.querySelector(
      "#ok-geoposition",
    ) as HTMLButtonElement;
  }

  // Показывает модальное окно и возвращает промис с введенными координатами или null

  async show() {
    this.modalElement.classList.add("show");
    this.coordsInput.value = "";

    return new Promise<string | null>((resolve) => {
      const handleOk = () => {
        this.hide();
        resolve(this.coordsInput.value);
        // Удаляем слушателей, чтобы избежать утечек памяти
        removeListeners();
      };

      const handleCancel = () => {
        this.hide();
        resolve(null);
        // Удаляем слушателей, чтобы избежать утечек памяти
        removeListeners();
      };

      // создадим функцию, которая будет удалять слушателей, чтобы
      // избежать утечки памяти

      const removeListeners = () => {
        this.okGeoposition.removeEventListener("click", handleOk);
        this.cancelGeoposition.removeEventListener("click", handleCancel);
      };

      this.okGeoposition.addEventListener("click", handleOk);
      this.cancelGeoposition.addEventListener("click", handleCancel);
    });
  }

  private hide() {
    this.modalElement.classList.remove("show");
  }
}
