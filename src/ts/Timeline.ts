// src/ts/Timeline.ts

import GeolocationService from "./GeolocationService";
import Post from "./Post"; // Класс-модель для данных поста
import PostRenderer from "./PostRenderer"; // Класс для отображения поста
import Modal from "./Modal";

export default class Timeline {
  private postContainer: HTMLElement;
  private postInput: HTMLInputElement;
  private geolocationService: GeolocationService;
  private modal: Modal;

  constructor() {
    this.postContainer = document.querySelector(
      "#posts-container",
    ) as HTMLElement;
    this.postInput = document.querySelector("#post-input") as HTMLInputElement;
    this.geolocationService = new GeolocationService();
    this.modal = new Modal();

    this.initEventListener();
  }

  private initEventListener() {
    this.postInput.addEventListener(
      "keypress",
      this.handlePostInput.bind(this),
    );
  }

  private async handlePostInput(event: KeyboardEvent) {
    if (event.key === "Enter" && this.postInput.value.trim() !== "") {
      const text = this.postInput.value.trim();
      this.postInput.value = "";

      try {
        const coords = await this.geolocationService.getCurrentPosition();
        this.createAndAddPost("text", text, coords);
      } catch (error) {
        console.error("Ошибка получения координат:", (error as Error).message);

        const coordsString = await this.modal.show();

        if (coordsString) {
          console.log("Введенные координаты:", coordsString);
          // this.createAndAddPost("text", text, coordsString);
          // Пока выведем, позже заменим на PostRenderer
        } else {
          this.createAndAddPost("text", text, null);
          console.log("Добавление поста отменено.");
        }
        // Если произошла ошибка, мы вызываем метод с `null` вместо координат.
        // this.createAndAddPost("text", text, null);

        // Пока просто выведем сообщение, позже заменим на логику модального окна
        // alert(
        //   `Ошибка: ${(error as Error).message}. Пожалуйста, введите координаты вручную.`,
        // );
      }
    }
  }

  // Этот метод отвечает за создание объекта Post и его отображение на странице.
  // Он передает данные в другие классы, которые выполняют свою узкую задачу.

  private createAndAddPost(
    type: Post["type"],
    content: string,
    coords: Post["coords"],
  ) {
    const postData = new Post(type, content, coords);

    const postElement = PostRenderer.render(postData);
    this.postContainer.prepend(postElement);
  }
}
